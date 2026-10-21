/* Futures, Options & Financial Trading Simulator.
 * Price model: CALC.simulateOHLC (GBM, 4 sub-steps per day for highs/lows) with the scenario's scheduled
 * drift/volatility regime changes and jumps — documented in js/data/markets.js. Same seed → same path.
 * Accounting: equity = cash + unrealised futures P&L + long option value − short option value.
 * Cash changes on fills (fees, option premiums) and on realised futures P&L. Margin: initial to open,
 * maintenance to keep; below maintenance → margin call (deposit or reduce); ignored → broker liquidation. */
(function () {
  const CTA = window.CTA, C = window.CALC, fmt = CTA.fmt, esc = CTA.esc;
  const f = (n, d = 2) => fmt.num(n, d);
  let timer = null;

  const scen = (id) => CTA.MARKET.SCENARIOS.find((s) => s.id === id);
  const pathCache = {};
  function path(F) { const k = F.scenarioId + ':' + F.seed; if (!pathCache[k]) { const s = scen(F.scenarioId), sp = CTA.MARKET.specs()[s.inst]; pathCache[k] = C.simulateOHLC({ start: sp.start, days: s.days + 1, drift: s.drift, vol: s.vol, seed: F.seed, events: s.events }); } return pathCache[k]; }
  const spec = (F) => CTA.MARKET.specs()[scen(F.scenarioId).inst];
  const roundTick = (p, tick) => Math.round(p / tick) * tick;
  function price(F, month, day) {
    const s = scen(F.scenarioId), p = path(F)[day == null ? F.day : day];
    const off = month === 'M2' ? (s.rollSpread || 0) : 0;
    return { o: p.o + off, h: p.h + off, l: p.l + off, c: p.c + off };
  }
  const activeMonth = (F) => { const s = scen(F.scenarioId); return s.expiryDay != null && F.day > s.expiryDay ? 'M2' : 'M1'; };
  const optUnder = (F, day) => price(F, activeMonth(F), day).c;
  const optT = (F) => Math.max(0, (scen(F.scenarioId).days - F.day) / 252);

  function newAccount(sid, capital, seedOverride) {
    const s = scen(sid);
    const F = { scenarioId: sid, seed: seedOverride || s.seed, day: 0, startCash: s.startCash || capital, cash: s.startCash || capital, deposits: 0, positions: [], history: [], equityHist: [], news: [], status: 'paused', marginCall: false, callIgnored: false, startedAt: Date.now() };
    (s.preload || []).forEach((p) => { const sp = spec(F); const px = path(F)[0].c; F.positions.push({ id: CTA.uid('p'), type: 'fut', side: p.side, qty: p.qty, entry: px, month: 'M1', stop: null, tp: null, openDay: 0 }); F.cash -= sp.fee * p.qty; });
    F.equityHist.push(equity(F)); F.news.push({ d: 0, t: `Scenario started: ${s.title}. ${s.objective}` });
    return F;
  }
  function optValue(F, p, day) { const sp = spec(F), s = scen(F.scenarioId); const T = day >= s.days ? 0 : (s.days - day) / 252; return C.black76(optUnder(F, day), p.strike, T, 0.04, s.iv, p.optType); }
  function unreal(F, p, day) {
    const sp = spec(F); day = day == null ? F.day : day;
    if (p.type === 'fut') return (p.side === 'long' ? 1 : -1) * (price(F, p.month, day).c - p.entry) * sp.pointValue * p.qty;
    return (p.side === 'long' ? 1 : -1) * optValue(F, p, day).price * sp.pointValue * p.qty; // option position value (asset or liability)
  }
  function equity(F, day) { return F.cash + F.positions.reduce((s, p) => s + unreal(F, p, day), 0); }
  function margins(F) {
    const sp = spec(F); let im = 0, mm = 0;
    F.positions.forEach((p) => { if (p.type === 'fut') { im += sp.im * p.qty; mm += sp.mm * p.qty; } else if (p.side === 'short') { im += sp.im * 0.75 * p.qty; mm += sp.mm * 0.75 * p.qty; } });
    return { im, mm };
  }
  function exposure(F) { const sp = spec(F); return F.positions.reduce((s, p) => s + (p.type === 'fut' ? price(F, p.month).c * sp.pointValue * p.qty : Math.abs(optValue(F, p, F.day).delta) * optUnder(F, F.day) * sp.pointValue * p.qty), 0); }

  function closePos(F, p, px, reason) {
    const sp = spec(F);
    let pnl;
    if (p.type === 'fut') { pnl = (p.side === 'long' ? 1 : -1) * (px - p.entry) * sp.pointValue * p.qty; F.cash += pnl - sp.fee * p.qty; }
    else { const val = px * sp.pointValue * p.qty; if (p.side === 'long') F.cash += val; else F.cash -= val; F.cash -= sp.fee * p.qty; pnl = (p.side === 'long' ? 1 : -1) * (px - p.entry) * sp.pointValue * p.qty; }
    F.positions = F.positions.filter((x) => x !== p);
    const rec = { id: p.id, type: p.type, label: p.type === 'fut' ? `${p.side} ${p.qty} ${scen(F.scenarioId).inst} ${p.month}` : `${p.side} ${p.qty} ${p.optType} K${f(p.strike, spec(F).dp)}`, entry: p.entry, exit: px, openDay: p.openDay, closeDay: F.day, pnl: pnl - sp.fee * p.qty * 2, reason };
    F.history.push(rec);
    F.news.push({ d: F.day, t: `Closed ${rec.label} at ${f(px, sp.dp)} (${reason}). P&L ${fmt.money(rec.pnl, 'USD', 0)}.` });
    CTA.journalAdd({ auto: true, type: 'futures', commodity: CTA.MARKET.specs()[scen(F.scenarioId).inst].commodity, title: `${rec.label} — ${reason}`, entry: p.entry, exit: px, pnl: rec.pnl, thesis: `Scenario: ${scen(F.scenarioId).title}`, lessons: '' });
  }
  function open(F, o) {
    const sp = spec(F), s = scen(F.scenarioId);
    if (F.status === 'finished') return 'Scenario finished.';
    if (!(o.qty > 0) || Math.floor(o.qty) !== o.qty) return 'Quantity must be a whole number of contracts.';
    if (o.type === 'fut') {
      const month = o.month || activeMonth(F);
      if (s.expiryDay != null && month === 'M1' && F.day >= s.expiryDay) return 'The front month has expired — trade the next month.';
      const mid = price(F, month).c; const fill = roundTick(C.fillPrice(mid, o.side === 'long' ? 'buy' : 'sell', sp.spreadTicks, sp.slipTicks, sp.tick), sp.tick);
      if (o.stop != null && o.stop !== '' && ((o.side === 'long' && o.stop >= fill) || (o.side === 'short' && o.stop <= fill))) return 'Stop-loss must be below the entry for longs and above for shorts.';
      if (o.tp != null && o.tp !== '' && ((o.side === 'long' && o.tp <= fill) || (o.side === 'short' && o.tp >= fill))) return 'Take-profit must be above the entry for longs and below for shorts.';
      const m = margins(F); const eq = equity(F);
      if (eq - sp.fee * o.qty < m.im + sp.im * o.qty) return `Insufficient margin: need ${fmt.money(m.im + sp.im * o.qty, 'USD', 0)} initial margin, equity ${fmt.money(eq, 'USD', 0)}.`;
      F.cash -= sp.fee * o.qty;
      F.positions.push({ id: CTA.uid('p'), type: 'fut', side: o.side, qty: o.qty, entry: fill, month, stop: o.stop === '' || o.stop == null ? null : +o.stop, tp: o.tp === '' || o.tp == null ? null : +o.tp, openDay: F.day });
      F.news.push({ d: F.day, t: `Filled ${o.side} ${o.qty} ${s.inst} ${month} at ${f(fill, sp.dp)} (mid ${f(mid, sp.dp)}; spread & slippage ${f(Math.abs(fill - mid), sp.dp)}).` });
    } else {
      const v = C.black76(optUnder(F, F.day), o.strike, optT(F), 0.04, s.iv, o.optType);
      if (optT(F) <= 0) return 'Options have expired.';
      const half = Math.max(sp.tick, v.price * 0.01); const fill = Math.max(sp.tick, v.price + (o.side === 'long' ? half : -half));
      const cost = fill * sp.pointValue * o.qty;
      const m = margins(F); const eq = equity(F);
      if (o.side === 'long' && F.cash - cost - sp.fee * o.qty < m.im) return 'Insufficient cash to pay the premium while keeping existing margin.';
      if (o.side === 'short' && eq < m.im + sp.im * 0.75 * o.qty) return 'Insufficient margin to write options.';
      F.cash += (o.side === 'long' ? -cost : cost) - sp.fee * o.qty;
      F.positions.push({ id: CTA.uid('o'), type: 'opt', side: o.side, qty: o.qty, optType: o.optType, strike: o.strike, entry: fill, openDay: F.day });
      F.news.push({ d: F.day, t: `${o.side === 'long' ? 'Bought' : 'Sold'} ${o.qty} ${o.optType}${o.qty > 1 ? 's' : ''} K ${f(o.strike, sp.dp)} at ${f(fill, sp.dp + 1)} (premium ${fmt.money(cost, 'USD', 0)}).` });
    }
    CTA.save(); return null;
  }
  function step(F) {
    const s = scen(F.scenarioId), sp = spec(F);
    if (F.status === 'finished') return;
    if (F.marginCall) { F.callIgnored = true; // broker liquidates the largest futures position
      const fut = F.positions.filter((p) => p.type === 'fut').sort((a, b) => b.qty - a.qty)[0] || F.positions[0];
      if (fut) { const px = fut.type === 'fut' ? roundTick(C.fillPrice(price(F, fut.month).c, fut.side === 'long' ? 'sell' : 'buy', sp.spreadTicks, sp.slipTicks * 3, sp.tick), sp.tick) : optValue(F, fut, F.day).price; closePos(F, fut, px, 'broker liquidation after unmet margin call'); }
      F.marginCall = false;
    }
    F.day++;
    const bar = path(F)[F.day];
    s.events.filter((e) => e.day === F.day && e.news).forEach((e) => F.news.push({ d: F.day, t: '📰 ' + e.news, big: true }));
    // stops & targets (stop assumed first if both are touched in one bar)
    F.positions.filter((p) => p.type === 'fut').slice().forEach((p) => {
      const b = price(F, p.month);
      if (p.side === 'long') { if (p.stop != null && b.l <= p.stop) closePos(F, p, roundTick(Math.min(b.o, p.stop) - sp.slipTicks * sp.tick, sp.tick), b.o < p.stop ? 'stop-loss (gap through stop)' : 'stop-loss'); else if (p.tp != null && b.h >= p.tp) closePos(F, p, Math.max(b.o, p.tp), 'take-profit'); }
      else { if (p.stop != null && b.h >= p.stop) closePos(F, p, roundTick(Math.max(b.o, p.stop) + sp.slipTicks * sp.tick, sp.tick), b.o > p.stop ? 'stop-loss (gap through stop)' : 'stop-loss'); else if (p.tp != null && b.l <= p.tp) closePos(F, p, Math.min(b.o, p.tp), 'take-profit'); }
    });
    // contract expiry
    if (s.expiryDay != null && F.day === s.expiryDay) F.positions.filter((p) => p.type === 'fut' && p.month === 'M1').slice().forEach((p) => closePos(F, p, price(F, 'M1').c, 'expired — closed at final settlement (not rolled)'));
    // scenario end: options expire at intrinsic, futures closed
    if (F.day >= s.days) {
      F.positions.slice().forEach((p) => { if (p.type === 'opt') closePos(F, p, optValue(F, p, F.day).intrinsic, 'option expiry (intrinsic value)'); else closePos(F, p, price(F, p.month).c, 'scenario end'); });
      F.status = 'finished'; F.news.push({ d: F.day, t: 'Scenario finished. Read the debrief below.', big: true });
      CTA.log(`Futures scenario "${s.title}" finished: equity ${fmt.money(equity(F), 'USD', 0)}`, 'futures');
    }
    const eq = equity(F); F.equityHist.push(eq);
    const m = margins(F);
    if (F.positions.length && eq < m.mm) { F.marginCall = true; F.status = 'paused'; F.news.push({ d: F.day, t: `⚠ MARGIN CALL: equity ${fmt.money(eq, 'USD', 0)} below maintenance ${fmt.money(m.mm, 'USD', 0)}. Deposit ${fmt.money(m.im - eq, 'USD', 0)} or reduce positions before the next day, or the broker will liquidate.`, big: true }); }
    CTA.save();
    return bar;
  }

  /* ------------------------------------------------------------ views */
  function stopTimer() { if (timer) { clearInterval(timer); timer = null; } }
  CTA.route('futures', { title: 'Futures & Derivatives', desc: 'Scenario-driven futures and options trading simulator.', render(el, r) {
    stopTimer(); CTA.cleanup = stopTimer;
    const tab = r.parts[0] || 'trade';
    el.innerHTML = `${CTA.pageHead('Futures & Derivatives Simulator', 'Trade simulated commodity futures and options through scenarios built on documented rules. Spread, slippage, fees, margin, leverage, stops, expiry and margin calls are all modelled.', 'char')}
      ${CTA.tabs([['trade', 'Trading desk'], ['options', 'Options'], ['history', 'Trade history'], ['learn', 'Mechanics & model']], tab, 'futures')}<div id="fb"></div>`;
    const b = CTA.$('#fb', el);
    if (tab === 'learn') return learn(b);
    if (tab === 'history') return historyView(b);
    const F = CTA.state.futures;
    if (!F) return chooser(b);
    if (tab === 'options') return optionsView(b, F);
    desk(b, F);
  } });

  function chooser(b) {
    b.innerHTML = `<div class="ws"><h3>Choose a scenario ${CTA.SIM}</h3><p class="muted">Each scenario follows defined rules (drift, volatility, jumps and news at set days). You can pause at any time, inspect information, decide and continue. Contract specifications are illustrative.</p>
      <div class="row" style="margin-bottom:10px"><label for="fcap">Starting capital (USD)</label><input id="fcap" type="number" value="100000" style="max-width:160px"></div>
      <div class="grid c2">${CTA.MARKET.SCENARIOS.map((s) => { const sp = CTA.MARKET.specs()[s.inst]; return `<div class="card" style="margin:0"><div class="row between"><b>${esc(s.title)}</b><span class="badge t-${sp.commodity}">${s.inst}</span></div><p class="muted" style="font-size:.86rem;margin:4px 0">${esc(s.objective)}</p><small>${s.days} trading days · ${esc(sp.name)}${s.startCash ? ' · fixed capital ' + fmt.money(s.startCash, 'USD', 0) : ''}${s.preload ? ' · starts with an inherited position' : ''}</small><div style="margin-top:6px"><button class="btn primary sm" data-s="${s.id}">Start</button></div></div>`; }).join('')}</div></div>`;
    CTA.$$('[data-s]', b).forEach((btn) => { btn.onclick = () => { const cap = CTA.num(CTA.$('#fcap', b).value, 100000); if (cap < 1000) { CTA.toast('Capital must be at least 1,000.', 'warn'); return; } CTA.state.futures = newAccount(btn.dataset.s, cap); CTA.save(); CTA.log('Started futures scenario: ' + scen(btn.dataset.s).title, 'futures'); CTA.render(); }; });
  }

  function accountKpis(F) {
    const eq = equity(F), m = margins(F), sp = spec(F); const ex = exposure(F);
    const unr = F.positions.reduce((s, p) => s + (p.type === 'fut' ? unreal(F, p) : unreal(F, p) - (p.side === 'long' ? 1 : -1) * p.entry * sp.pointValue * p.qty), 0);
    const realized = F.history.reduce((s, h) => s + h.pnl, 0);
    const dd = C.drawdownSeries(F.equityHist); const mdd = C.maxDrawdown(F.equityHist);
    return CTA.ui.kpis([{ label: 'Equity', value: fmt.money(eq, 'USD', 0), cls: eq >= F.startCash + F.deposits ? 'pos' : 'neg', sub: 'start ' + fmt.money(F.startCash, 'USD', 0) + (F.deposits ? ' + deposits ' + fmt.money(F.deposits, 'USD', 0) : '') }, { label: 'Cash balance', value: fmt.money(F.cash, 'USD', 0) }, { label: 'Unrealised P&L', value: fmt.money(unr, 'USD', 0), cls: fmt.cls(unr) }, { label: 'Realised P&L', value: fmt.money(realized, 'USD', 0), cls: fmt.cls(realized), sub: 'after fees' }, { label: 'Used margin (initial)', value: fmt.money(m.im, 'USD', 0), term: 'Initial margin' }, { label: 'Maintenance req.', value: fmt.money(m.mm, 'USD', 0), term: 'Maintenance margin' }, { label: 'Free margin', value: fmt.money(eq - m.im, 'USD', 0), cls: eq - m.im < 0 ? 'neg' : '' }, { label: 'Exposure / leverage', value: fmt.money(ex, 'USD', 0), sub: f(eq > 0 ? ex / eq : 0, 1) + '× equity', term: 'Leverage' }, { label: 'Drawdown', value: fmt.pct((dd[dd.length - 1] || 0) * 100), sub: 'max ' + fmt.pct(mdd * 100), cls: mdd < -0.1 ? 'neg' : '', term: 'Drawdown' }]);
  }

  function desk(b, F) {
    const s = scen(F.scenarioId), sp = spec(F), P = path(F).slice(0, F.day + 1), mon = activeMonth(F);
    const last = price(F, mon), eq = equity(F), m = margins(F);
    const offset = mon === 'M2' ? (s.rollSpread || 0) : 0;
    b.innerHTML = `<div class="ws">
      <div class="row between"><div><h3 style="margin:0">${esc(s.title)}</h3><span class="muted">${esc(sp.name)} · ${esc(sp.size)} · quote ${esc(sp.unit)} · tick ${sp.tick} = USD ${f(sp.tick * sp.pointValue)} · IM ${fmt.money(sp.im, 'USD', 0)} ${CTA.ILLU}</span></div>
        <div class="row"><span class="badge info">Day ${F.day} / ${s.days}</span>${s.expiryDay != null ? `<span class="badge ${F.day >= s.expiryDay ? 'warn' : ''}">Front month expires day ${s.expiryDay} · trading ${mon}</span>` : ''}<span class="badge ${F.status === 'running' ? 'ok' : F.status === 'finished' ? '' : 'warn'}">${F.status}</span></div></div>
      <div class="row" style="margin:10px 0">${F.status !== 'finished' ? `<button class="btn ${F.status === 'running' ? '' : 'primary'}" data-a="play">${F.status === 'running' ? '❚❚ Pause' : '▶ Play'}</button><button class="btn" data-a="step1">Step 1 day</button><button class="btn" data-a="step5">Step 5 days</button><label class="check" style="display:inline-flex"><input type="checkbox" id="autopause" ${F.autoPause !== false ? 'checked' : ''}> pause on news</label>` : ''}<span style="flex:1"></span><button class="btn sm" data-a="restart">New scenario</button><button class="btn sm" data-a="replay">Replay same scenario</button></div>
      ${F.marginCall ? `<div class="note bad"><strong>MARGIN CALL</strong>Equity ${fmt.money(eq, 'USD', 0)} < maintenance ${fmt.money(m.mm, 'USD', 0)}. Deposit at least ${fmt.money(m.im - eq, 'USD', 0)} (restore initial margin) or close positions. If you step forward without acting, the broker liquidates your largest position at a worse price.<div class="row" style="margin-top:6px"><button class="btn danger sm" data-a="deposit">Deposit ${fmt.money(Math.ceil(m.im - eq), 'USD', 0)}</button></div></div>` : ''}
      ${accountKpis(F)}
      <div class="grid side"><div><div class="card"><div id="fchart"></div></div><div class="card"><h4>Equity curve</h4><div id="eqchart"></div></div></div>
      <div><div class="card"><h4>Order ticket — futures</h4>
        <div class="row" style="margin-bottom:6px"><b style="font-size:1.3rem">${f(last.c, sp.dp)}</b><span class="muted">bid ${f(roundTick(C.fillPrice(last.c, 'sell', sp.spreadTicks, 0, sp.tick), sp.tick), sp.dp)} / ask ${f(roundTick(C.fillPrice(last.c, 'buy', sp.spreadTicks, 0, sp.tick), sp.tick), sp.dp)}</span></div>
        <div class="form c2">${CTA.ui.field({ id: 'o-qty', name: 'qty', label: 'Contracts', value: 1, step: 1, min: 1 })}${CTA.ui.field({ id: 'o-stop', name: 'stop', label: 'Stop-loss price', value: '', term: 'Stop-loss' })}${CTA.ui.field({ id: 'o-tp', name: 'tp', label: 'Take-profit price', value: '' })}${s.expiryDay != null && F.day < s.expiryDay ? CTA.ui.field({ id: 'o-month', name: 'month', label: 'Contract month', type: 'select', value: 'M1', options: [['M1', 'Front (expires day ' + s.expiryDay + ')'], ['M2', 'Next month (+' + s.rollSpread + ')']] }) : ''}</div>
        <div id="o-calc" style="font-size:.84rem;margin:8px 0"></div>
        <div class="row"><button class="btn ok" data-a="buy" ${F.status === 'finished' ? 'disabled' : ''}>Buy / long</button><button class="btn danger" data-a="sell" ${F.status === 'finished' ? 'disabled' : ''}>Sell / short</button></div></div>
        <div class="card"><h4>News & fills</h4><div class="news">${F.news.slice().reverse().slice(0, 40).map((n) => `<div style="${n.big ? 'color:#fff' : ''}"><span class="d">D${n.d}</span>${esc(n.t)}</div>`).join('')}</div></div></div></div>
      <div class="card"><h4>Open positions</h4>${F.positions.length ? `<div class="table-wrap"><table><thead><tr><th>Position</th><th class="r">Entry</th><th class="r">Mark</th><th class="r">Unrealised</th><th>Stop</th><th>Target</th><th class="r">Risk at stop</th><th></th></tr></thead><tbody>${F.positions.map((p) => { const mark = p.type === 'fut' ? price(F, p.month).c : optValue(F, p, F.day).price; const u = p.type === 'fut' ? unreal(F, p) : (p.side === 'long' ? 1 : -1) * (mark - p.entry) * sp.pointValue * p.qty;
        return `<tr><td>${p.type === 'fut' ? `${p.side} ${p.qty} × ${s.inst} ${p.month}` : `${p.side} ${p.qty} ${p.optType} K${f(p.strike, sp.dp)}`}</td><td class="r num">${f(p.entry, sp.dp + (p.type === 'opt' ? 1 : 0))}</td><td class="r num">${f(mark, sp.dp + (p.type === 'opt' ? 1 : 0))}</td><td class="r num ${fmt.cls(u)}">${f(u, 0)}</td><td>${p.type === 'fut' ? `<input type="number" step="any" data-p="${p.id}" data-k="stop" value="${p.stop == null ? '' : p.stop}" style="width:100px" aria-label="Stop">` : '—'}</td><td>${p.type === 'fut' ? `<input type="number" step="any" data-p="${p.id}" data-k="tp" value="${p.tp == null ? '' : p.tp}" style="width:100px" aria-label="Target">` : '—'}</td><td class="r num">${p.type === 'fut' && p.stop != null ? f(C.riskPerTrade(mark, p.stop, p.qty, sp.pointValue), 0) + ' (' + fmt.pct(C.riskPerTrade(mark, p.stop, p.qty, sp.pointValue) / eq * 100, 1) + ')' : p.type === 'fut' ? '<span class="neg">no stop</span>' : 'premium'}</td><td><button class="btn sm" data-close="${p.id}">Close</button>${p.type === 'fut' && s.expiryDay != null && p.month === 'M1' && F.day < s.expiryDay ? ` <button class="btn sm" data-roll="${p.id}">Roll to M2</button>` : ''}</td></tr>`; }).join('')}</tbody></table></div>` : '<p class="muted">No open positions.</p>'}</div>
      ${F.status === 'finished' ? `<div class="card"><h4>Debrief</h4><p>${esc(s.debrief)}</p>${CTA.ui.kpis([{ label: 'Final equity', value: fmt.money(eq, 'USD', 0), cls: fmt.cls(eq - F.startCash - F.deposits) }, { label: 'Return', value: fmt.pct((eq - F.startCash - F.deposits) / (F.startCash + F.deposits) * 100) }, { label: 'Max drawdown', value: fmt.pct(C.maxDrawdown(F.equityHist) * 100) }, { label: 'Trades', value: F.history.length }, { label: 'Win rate', value: F.history.length ? fmt.pct(F.history.filter((h) => h.pnl > 0).length / F.history.length * 100, 0) : '—' }])}<p class="muted">Judge the process: did you size positions from a stop, respect the plan, manage margin and react to news proportionately?</p></div>` : ''}
    </div>`;
    // charts
    const lbl = P.map((_, i) => 'D' + i);
    const closes = P.map((x) => x.c + offset);
    const hl = []; F.positions.filter((p) => p.type === 'fut').forEach((p) => { hl.push({ y: p.entry, color: '#9aa7b8', label: 'entry' }); if (p.stop != null) hl.push({ y: p.stop, color: '#ff7b7b', label: 'stop' }); if (p.tp != null) hl.push({ y: p.tp, color: '#45d18a', label: 'target' }); });
    const evm = s.events.filter((e) => e.day <= F.day && e.news).map((e) => ({ i: e.day, y: P[e.day].h + offset, color: '#e2c25a', label: '📰' }));
    CTA.chart(CTA.$('#fchart', b), { height: 300, labels: lbl, series: [{ type: 'candles', data: P.map((x) => ({ o: x.o + offset, h: x.h + offset, l: x.l + offset, c: x.c + offset })), label: s.inst + ' ' + mon }, { data: C.sma(closes, 10), label: 'SMA 10', color: '#e2c25a', width: 1.4 }], hlines: hl, markers: evm, yFmt: (v) => f(v, sp.dp) });
    CTA.chart(CTA.$('#eqchart', b), { height: 160, labels: F.equityHist.map((_, i) => 'D' + i), series: [{ data: F.equityHist, label: 'Equity', color: '#6aa5ef', type: 'area' }], hlines: [{ y: F.startCash + F.deposits, color: '#9aa7b8', label: 'start' }], yFmt: (v) => f(v / 1000, 0) + 'k' });
    // ticket calc
    const tk = () => { const qv = CTA.$('#o-qty', b), sv = CTA.$('#o-stop', b), mv = CTA.$('#o-month', b); if (!qv) return; const q = Math.max(0, Math.floor(CTA.num(qv.value, 0))); const mo = (mv && mv.value) || mon; const px = price(F, mo).c; const notional = C.notional(px, q, sp.pointValue); const stop = sv.value.trim() === '' ? NaN : CTA.num(sv.value, NaN);
      CTA.$('#o-calc', b).innerHTML = `Notional ${fmt.money(notional, 'USD', 0)} · margin ${fmt.money(sp.im * q, 'USD', 0)} · fees ${fmt.money(sp.fee * q, 'USD', 2)} · leverage after ≈ ${f((exposure(F) + notional) / Math.max(eq, 1), 1)}×${!isNaN(stop) ? ` · risk at stop ${fmt.money(C.riskPerTrade(px, stop, q, sp.pointValue), 'USD', 0)} (${fmt.pct(C.riskPerTrade(px, stop, q, sp.pointValue) / eq * 100, 1)} of equity)` : ' · <span class="neg">no stop set</span>'}<br>1% risk sizing with this stop: ${!isNaN(stop) ? C.positionSize(eq, 1, px, stop, sp.pointValue) + ' contracts' : '—'}`; };
    b.oninput = (e) => { if (['qty', 'stop', 'tp', 'month'].includes(e.target.name)) tk(); }; b.onchange = b.oninput; tk();
    const raw = (id) => { const x = CTA.$('#' + id, b); return x ? x.value.trim() : ''; };
    const order = (side) => { const st = raw('o-stop'), tp = raw('o-tp'); const err = open(F, { type: 'fut', side, qty: Math.floor(CTA.num(raw('o-qty'), 0)), stop: st === '' ? null : CTA.num(st, null), tp: tp === '' ? null : CTA.num(tp, null), month: raw('o-month') || undefined }); if (err) CTA.toast(esc(err), 'bad'); else { if (F.marginCall && equity(F) >= margins(F).mm) F.marginCall = false; desk(b, F); } };
    const q = (sel) => CTA.$(sel, b);
    if (q('[data-a=buy]')) q('[data-a=buy]').onclick = () => order('long');
    if (q('[data-a=sell]')) q('[data-a=sell]').onclick = () => order('short');
    CTA.$$('[data-close]', b).forEach((x) => { x.onclick = () => { const p = F.positions.find((y) => y.id === x.dataset.close); if (!p) return; const px = p.type === 'fut' ? roundTick(C.fillPrice(price(F, p.month).c, p.side === 'long' ? 'sell' : 'buy', sp.spreadTicks, sp.slipTicks, sp.tick), sp.tick) : (() => { const v = optValue(F, p, F.day).price; const half = Math.max(sp.tick, v * 0.01); return Math.max(0, v + (p.side === 'long' ? -half : half)); })(); closePos(F, p, px, 'closed manually'); if (F.marginCall && (equity(F) >= margins(F).mm || !F.positions.length)) F.marginCall = false; CTA.save(); desk(b, F); }; });
    CTA.$$('[data-roll]', b).forEach((x) => { x.onclick = () => { const p = F.positions.find((y) => y.id === x.dataset.roll); const px1 = roundTick(C.fillPrice(price(F, 'M1').c, p.side === 'long' ? 'sell' : 'buy', sp.spreadTicks, sp.slipTicks, sp.tick), sp.tick); const q0 = p.qty, side = p.side; closePos(F, p, px1, 'rolled to next month'); const err = open(F, { type: 'fut', side, qty: q0, month: 'M2' }); if (err) CTA.toast(esc(err), 'bad'); desk(b, F); }; });
    CTA.$$('[data-p]', b).forEach((inp) => { inp.onchange = () => { const p = F.positions.find((y) => y.id === inp.dataset.p); const v = inp.value === '' ? null : CTA.num(inp.value, null); const mk = price(F, p.month).c; if (v != null && inp.dataset.k === 'stop' && ((p.side === 'long' && v >= mk) || (p.side === 'short' && v <= mk))) { CTA.toast('A stop must be on the losing side of the current price.', 'warn'); inp.value = p.stop == null ? '' : p.stop; return; } p[inp.dataset.k] = v; CTA.save(); desk(b, F); }; });
    const dep = q('[data-a=deposit]'); if (dep) dep.onclick = () => { const amt = Math.ceil(margins(F).im - equity(F)); F.cash += amt; F.deposits += amt; F.marginCall = false; F.news.push({ d: F.day, t: `Deposited ${fmt.money(amt, 'USD', 0)} to meet the margin call.` }); CTA.save(); desk(b, F); };
    const ap = q('#autopause'); if (ap) ap.onchange = () => { F.autoPause = ap.checked; CTA.save(); };
    const run = (n) => { for (let i = 0; i < n && F.status !== 'finished'; i++) { const nNews = F.news.length; step(F); if (F.marginCall) break; if (F.autoPause !== false && F.news.slice(nNews).some((x) => x.big)) { if (timer) { stopTimer(); F.status = 'paused'; } break; } } };
    if (q('[data-a=step1]')) q('[data-a=step1]').onclick = () => { run(1); desk(b, F); };
    if (q('[data-a=step5]')) q('[data-a=step5]').onclick = () => { run(5); desk(b, F); };
    if (q('[data-a=play]')) q('[data-a=play]').onclick = () => { if (F.status === 'running') { F.status = 'paused'; stopTimer(); CTA.save(); desk(b, F); return; } F.status = 'running'; CTA.save(); stopTimer(); timer = setInterval(() => { if (!document.body.contains(b)) { stopTimer(); return; } run(1); if (F.status !== 'running' || F.marginCall) { stopTimer(); if (F.status === 'running') F.status = 'paused'; } desk(b, F); }, 700); desk(b, F); };
    q('[data-a=restart]').onclick = () => { if (F.positions.length && !confirm('Open positions will be discarded. Start a new scenario?')) return; stopTimer(); CTA.state.futures = null; CTA.save(); CTA.render(); };
    q('[data-a=replay]').onclick = () => { if (!confirm('Restart this scenario from day 0 with the same price path?')) return; stopTimer(); CTA.state.futures = newAccount(F.scenarioId, F.startCash); CTA.save(); CTA.render(); };
    if (F.status === 'running' && !timer) { F.status = 'paused'; }
  }

  function optionsView(b, F) {
    const unlocked = CTA.progress.lessonDone('d-options') || CTA.state.settings.freeNav;
    if (!unlocked) { b.innerHTML = `<div class="card"><h3>🔒 Learn option mechanics first</h3><p>Options simulation unlocks after you master the lesson <b>Options — calls, puts, value, volatility and Greeks</b> (quiz ≥ 70%). Calls, puts, strikes, expiry, premium, intrinsic and time value, implied volatility and the Greeks are explained there, with a pricer to experiment.</p><a class="btn primary" href="#/path/lesson/d-options">Go to the options lesson</a> <a class="btn" href="#/settings">Or enable free navigation</a></div>`; return; }
    const s = scen(F.scenarioId), sp = spec(F), U = optUnder(F, F.day), T = optT(F);
    const step = sp.start >= 1000 ? 25 : sp.start >= 300 ? 10 : sp.start >= 100 ? 5 : 0.5;
    const atm = Math.round(U / step) * step; const strikes = [-3, -2, -1, 0, 1, 2, 3].map((k) => +(atm + k * step).toFixed(4));
    b.innerHTML = `<div class="ws"><div class="row between"><h3 style="margin:0">Options on ${esc(sp.name)} ${CTA.SIM}</h3><span class="muted">Underlying ${f(U, sp.dp)} · ${f(T * 252, 0)} trading days to expiry (scenario end) · implied vol ${f(s.iv * 100, 0)}% · r 4% · Black-76 European ${CTA.ILLU}</span></div>
      ${accountKpis(F)}
      <div class="card"><div class="table-wrap"><table><thead><tr><th colspan="5" style="text-align:center">CALLS</th><th>Strike</th><th colspan="5" style="text-align:center">PUTS</th></tr><tr><th></th><th class="r">Δ</th><th class="r">Θ/day</th><th class="r">Vega</th><th class="r">Premium</th><th></th><th class="r">Premium</th><th class="r">Δ</th><th class="r">Θ/day</th><th class="r">Vega</th><th></th></tr></thead><tbody>
      ${strikes.map((K) => { const c = C.black76(U, K, T, 0.04, s.iv, 'call'), p = C.black76(U, K, T, 0.04, s.iv, 'put'); return `<tr><td><button class="btn sm ok" data-o="call" data-k="${K}" data-s="long">Buy</button> <button class="btn sm danger" data-o="call" data-k="${K}" data-s="short">Sell</button></td><td class="r num">${f(c.delta, 2)}</td><td class="r num">${f(c.theta, 3)}</td><td class="r num">${f(c.vega, 3)}</td><td class="r num"><b>${f(c.price, sp.dp + 1)}</b></td><td style="text-align:center"><b>${f(K, sp.dp)}</b>${K === atm ? ' <small>ATM</small>' : ''}</td><td class="r num"><b>${f(p.price, sp.dp + 1)}</b></td><td class="r num">${f(p.delta, 2)}</td><td class="r num">${f(p.theta, 3)}</td><td class="r num">${f(p.vega, 3)}</td><td><button class="btn sm ok" data-o="put" data-k="${K}" data-s="long">Buy</button> <button class="btn sm danger" data-o="put" data-k="${K}" data-s="short">Sell</button></td></tr>`; }).join('')}</tbody></table></div>
      <div class="row"><label for="oq">Contracts</label><input id="oq" type="number" value="1" min="1" step="1" style="max-width:90px"><span class="muted" style="font-size:.84rem">Premium in quote units × USD ${f(sp.pointValue)} per point. Writing (selling) options requires margin (illustrative 75% of futures IM) and carries large risk. Advance time from the Trading desk tab.</span></div></div>
      <div class="note"><strong>Model limitations</strong>Constant volatility, lognormal prices, no jumps, European exercise only at scenario end. Real commodity options have skews/smiles, jumps around reports and often American exercise.</div></div>`;
    CTA.$$('[data-o]', b).forEach((btn) => { btn.onclick = () => { const qn = Math.floor(CTA.num(CTA.$('#oq', b).value, 1)); const err = open(F, { type: 'opt', side: btn.dataset.s, optType: btn.dataset.o, strike: +btn.dataset.k, qty: qn }); if (err) CTA.toast(esc(err), 'bad'); else { CTA.toast('Order filled. See positions in the Trading desk.', 'ok'); optionsView(b, F); } }; });
  }

  function historyView(b) {
    const F = CTA.state.futures;
    if (!F || !F.history.length) { b.innerHTML = CTA.ui.empty('No closed trades yet', 'Closed trades appear here with entry, exit and P&L after fees.', '<a class="btn primary" href="#/futures/trade">Open the desk</a>'); return; }
    const sp = spec(F);
    b.innerHTML = `<div class="card">${CTA.table(['Position', 'Open day', 'Close day', 'Entry', 'Exit', 'P&L (after fees)', 'Reason'], F.history.slice().reverse().map((h) => [esc(h.label), h.openDay, h.closeDay, f(h.entry, sp.dp + 1), f(h.exit, sp.dp + 1), `<span class="${fmt.cls(h.pnl)}">${f(h.pnl, 0)}</span>`, esc(h.reason)]))}</div><div class="card"><h4>Drawdown</h4><div id="ddc"></div></div>`;
    CTA.chart(CTA.$('#ddc', b), { height: 160, zero: true, series: [{ data: C.drawdownSeries(F.equityHist).map((x) => x * 100), label: 'Drawdown %', color: 'var(--neg)', type: 'area' }], labels: F.equityHist.map((_, i) => 'D' + i) });
  }

  function learn(b) {
    b.innerHTML = `<div class="grid c2"><div class="card"><h3>How the desk works</h3><ul>
      <li><b>Fills</b>: buys at mid + half spread + slippage; sells at mid − half spread − slippage (in ticks). Fees per contract per side.</li>
      <li><b>P&L</b> = price change × point value × contracts. Point value converts quote units to USD (e.g. wheat 1 c/bu = USD 50 per contract).</li>
      <li><b>Margin</b>: initial margin to open; maintenance to keep. Below maintenance → margin call to restore initial margin.</li>
      <li><b>Stops</b> trigger when the day's range touches them; a gap opens beyond the stop and fills at the open (worse), plus slippage. If stop and target are both touched in one day, the stop is assumed first (conservative).</li>
      <li><b>Expiry</b> (expiry scenario): roll before the last trading day or the position is closed at final settlement. Physical delivery is not simulated.</li>
      <li><b>Options</b>: Black-76, constant implied volatility, European expiry at scenario end; long options pay premium, short options receive premium and post margin.</li></ul></div>
      <div class="card"><h3>Price model and scenario rules</h3><p>Daily OHLC from geometric Brownian motion with four intraday sub-steps. Each scenario defines a starting drift and volatility and dated events that change drift, volatility, or apply a one-off jump (percentage). News appears on those days. The same seed always reproduces the same path, so you can replay a scenario and compare decisions.</p>
      ${CTA.table(['Scenario', 'Instrument', 'Days', 'Rules'], CTA.MARKET.SCENARIOS.map((s) => [esc(s.title), s.inst, s.days, s.events.map((e) => `d${e.day}: ${e.drift != null ? 'drift ' + (e.drift * 100).toFixed(0) + '% ' : ''}${e.vol != null ? 'vol ' + (e.vol * 100).toFixed(0) + '% ' : ''}${e.jumpPct ? 'jump ' + e.jumpPct + '%' : ''}`).join('; ')]))}</div></div>
      <div data-widget="specTable"></div><div data-widget="optionPayoff"></div>`;
  }
  CTA.FUT = { newAccount, open, step, equity, margins, path, price };
})();
