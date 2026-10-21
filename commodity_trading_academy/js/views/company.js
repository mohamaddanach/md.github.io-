/* Commodity Trading Company Simulator — manage a fictional trading company month by month.
 * Extensible design: opportunities come from OPP_TEMPLATES (add a commodity by adding a template);
 * events come from EVENT_RULES (add a rule to add an event type). All values are SIMULATED.
 * Accounting: cash + receivables + inventory (at market) − facility debt − payables = equity.
 * Revenue/realised P&L is recognised on delivery; cash arrives when the buyer pays. */
(function () {
  const CTA = window.CTA, C = window.CALC, fmt = CTA.fmt, esc = CTA.esc;
  const f = (n, d = 0) => fmt.num(n, d);
  const OPP_TEMPLATES = {
    gold: { unitVal: [600000, 2500000], margin: [0.3, 1.2], dur: [1, 1], hedgeable: true, vol: 0.15, label: 'Gold kilobars' },
    wheat: { unitVal: [3000000, 9000000], margin: [1.5, 4.5], dur: [1, 3], hedgeable: true, vol: 0.3, label: 'Milling wheat cargo' },
    sugar: { unitVal: [2500000, 7000000], margin: [1.5, 5], dur: [1, 3], hedgeable: true, vol: 0.28, label: 'Sugar cargo' },
    steel: { unitVal: [1500000, 6000000], margin: [2, 6], dur: [1, 3], hedgeable: false, vol: 0.25, label: 'Steel parcel' },
  };
  const CREDIT = { A: { pd: 0.004, late: 0.03 }, B: { pd: 0.02, late: 0.12 }, C: { pd: 0.09, late: 0.35 } };
  const SUPPLIER = { A: { fail: 0.01, quality: 0.03 }, B: { fail: 0.04, quality: 0.07 }, C: { fail: 0.14, quality: 0.16 } };
  const VOLMULT = { low: 0.6, normal: 1, high: 1.7 };

  function defaults() { return { capital: 10000000, facility: 25000000, rate: 7, vol: 'normal', reservePct: 10, seed: Math.floor(Math.random() * 1e6), markets: ['gold', 'wheat', 'sugar', 'steel'] }; }
  function start(cfg) {
    return { cfg, month: 0, cash: cfg.capital, debt: 0, rate: cfg.rate, realized: 0, deals: [], receivables: [], history: [{ m: 0, cash: cfg.capital, equity: cfg.capital, debt: 0 }], log: [{ m: 0, t: `Company founded with ${fmt.money(cfg.capital, 'USD', 0)} equity and a ${fmt.money(cfg.facility, 'USD', 0)} trade-finance facility at ${cfg.rate}%.`, k: 'info' }], opps: [], status: 'active', prices: { gold: 1, wheat: 1, sugar: 1, steel: 1 }, stats: { defaults: 0, defaultLoss: 0, lateCount: 0, unhedgedPnL: 0, events: 0, forced: 0 } };
  }
  function rngFor(co) { return C.rng(co.cfg.seed * 977 + co.month * 131 + 7); }
  function genOpps(co) {
    const r = rngFor(co); const n = r.int(3, 5); const out = [];
    for (let i = 0; i < n; i++) {
      const com = r.pick(co.cfg.markets); const t = OPP_TEMPLATES[com];
      const cost = Math.round(r.range(t.unitVal[0], t.unitVal[1]) / 10000) * 10000;
      const sup = r.pick(['A', 'B', 'B', 'C']), buy = r.pick(['A', 'B', 'B', 'C', 'C']);
      const payTerms = buy === 'A' ? r.pick([0, 1]) : buy === 'B' ? r.pick([1, 1, 2]) : r.pick([2, 3]);
      const lc = buy !== 'C' && r() < 0.6;
      let m = r.range(t.margin[0], t.margin[1]); if (buy === 'C') m += 1.5; if (sup === 'C') m += 1;
      out.push({ id: CTA.uid('op'), com, label: t.label, cost, revenue: Math.round(cost * (1 + m / 100)), marginPct: m, dur: r.int(t.dur[0], t.dur[1]), sup, buy, payTerms, lc, hedgeable: t.hedgeable, take: false, hedge: t.hedgeable, tf: lc });
    }
    return out;
  }
  const equity = (co) => co.cash + co.receivables.reduce((s, x) => s + x.amount, 0) + co.deals.reduce((s, d) => s + d.mtm, 0) - co.debt;

  function advance(co) {
    const r = rngFor(co); co.month++; const m = co.month; const L = (t, k) => co.log.unshift({ m, t, k: k || 'info' });
    // 1. take selected opportunities: pay supplier
    co.opps.filter((o) => o.take).forEach((o) => {
      let tf = o.tf && o.lc ? o.cost * 0.8 : 0;
      if (co.debt + tf > co.cfg.facility) { tf = 0; L(`Trade finance unavailable for ${o.label}: facility limit reached — paid from cash.`, 'bad'); }
      co.cash -= o.cost - tf; co.debt += tf;
      co.deals.push({ id: o.id, com: o.com, label: o.label, cost: o.cost, revenue: o.revenue, deliver: m + o.dur, buy: o.buy, sup: o.sup, payTerms: o.payTerms, lc: o.lc, hedge: o.hedge && o.hedgeable, tf, mtm: o.cost, px0: co.prices[o.com] });
      L(`Committed ${o.label} (${o.com}): paid supplier ${fmt.money(o.cost, 'USD', 0)}${tf ? ', 80% funded by trade finance' : ''}${o.hedge && o.hedgeable ? ', hedged' : ', UNHEDGED'}.`);
    });
    co.opps = [];
    // 2. prices move (monthly GBM step with fat-tail shock)
    Object.keys(co.prices).forEach((k) => { const v = OPP_TEMPLATES[k].vol * VOLMULT[co.cfg.vol] / Math.sqrt(12); let z = r.normal(); if (r() < 0.05) z *= 2.5; co.prices[k] *= Math.exp(-0.5 * v * v + v * z); });
    // 3. interest-rate changes
    if (r() < 0.12) { const d = r.pick([-1, 1, 1]); co.rate = Math.max(1, co.rate + d); L(`Financing cost change: facility rate now ${co.rate}% (${d > 0 ? '+' : ''}${d}).`, d > 0 ? 'bad' : 'ok'); co.stats.events++; }
    // 4. events on open deals, deliveries
    co.deals.slice().forEach((d) => {
      const priceRel = co.prices[d.com] / d.px0;
      if (d.supFailChecked !== true) { d.supFailChecked = true; if (r() < SUPPLIER[d.sup].fail) { const rec = d.cost * 0.5; co.cash += rec; co.realized -= d.cost - rec; co.stats.events++; co.deals = co.deals.filter((x) => x !== d); L(`Supplier default (${d.sup}-rated) on ${d.label}: cargo never shipped; recovered 50% of the advance. Loss ${fmt.money(d.cost - rec, 'USD', 0)}.`, 'bad'); return; } }
      if (r() < 0.08) { const extra = d.cost * r.range(0.01, 0.025); co.cash -= extra; d.cost += extra; L(`Freight increase on ${d.label}: +${fmt.money(extra, 'USD', 0)}.`, 'bad'); co.stats.events++; }
      if (r() < 0.07 && d.deliver === m) { d.deliver++; L(`Shipment delay: ${d.label} slips one month (more financing, later collection).`, 'bad'); co.stats.events++; }
      if (r() < 0.04) { const extra = d.cost * 0.008; co.cash -= extra; d.cost += extra; L(`Unexpected customs/port expense on ${d.label}: ${fmt.money(extra, 'USD', 0)}.`, 'bad'); co.stats.events++; }
      const hedgeGain = d.hedge ? -(priceRel - 1) * d.cost : 0;
      d.mtm = d.cost * priceRel + hedgeGain;
      if (d.deliver <= m) {
        let rev = d.hedge ? d.revenue * (1 + r.range(-0.004, 0.004)) : d.revenue * priceRel;
        if (!d.hedge) co.stats.unhedgedPnL += d.revenue * (priceRel - 1);
        if (r() < SUPPLIER[d.sup].quality) { const cut = rev * r.range(0.01, 0.03); rev -= cut; L(`Quality dispute on ${d.label}: allowance ${fmt.money(cut, 'USD', 0)}.`, 'bad'); co.stats.events++; }
        const profit = rev - d.cost; co.realized += profit;
        let due = m + d.payTerms; let late = false;
        if (!d.lc && r() < CREDIT[d.buy].late) { due += 2; late = true; co.stats.lateCount++; L(`Buyer (${d.buy}-rated) asks for 2 extra months to pay for ${d.label}.`, 'bad'); }
        co.receivables.push({ id: d.id, label: d.label, amount: rev, due, buy: d.buy, lc: d.lc, tf: d.tf, late });
        co.deals = co.deals.filter((x) => x !== d);
        L(`Delivered ${d.label}: revenue ${fmt.money(rev, 'USD', 0)}, deal profit ${fmt.money(profit, 'USD', 0)}${d.hedge ? '' : ' (unhedged price effect ' + fmt.money(d.revenue * (priceRel - 1), 'USD', 0) + ')'}. Payment due month ${due}.`, profit >= 0 ? 'ok' : 'bad');
      }
    });
    // 5. collections & defaults
    co.receivables.slice().forEach((x) => {
      if (x.due > m) return;
      if (!x.lc && r() < CREDIT[x.buy].pd * (x.late ? 3 : 1)) { const loss = x.amount * 0.6; co.realized -= loss; co.cash += x.amount - loss; co.stats.defaults++; co.stats.defaultLoss += loss; L(`Buyer default (${x.buy}-rated) on ${x.label}: recovered 40%, loss ${fmt.money(loss, 'USD', 0)}.`, 'bad'); }
      else { co.cash += x.amount; L(`Collected ${fmt.money(x.amount, 'USD', 0)} for ${x.label}.`, 'ok'); }
      if (x.tf) { const rep = Math.min(x.tf, co.debt); co.debt -= rep; co.cash -= rep; }
      co.receivables = co.receivables.filter((y) => y !== x);
    });
    // 6. interest & overheads
    const interest = co.debt * co.rate / 100 / 12, over = co.cfg.capital * 0.004;
    co.cash -= interest + over; co.realized -= interest + over;
    // 7. liquidity: draw the facility as a revolver if cash is negative
    if (co.cash < 0) { const room = co.cfg.facility - co.debt; const draw = Math.min(room, -co.cash); co.debt += draw; co.cash += draw; if (draw > 0) L(`Drew ${fmt.money(draw, 'USD', 0)} on the facility to cover a cash shortfall.`, 'bad'); }
    if (co.cash < 0) {
      // forced liquidation of open positions at a 6% discount
      co.deals.slice().forEach((d) => { if (co.cash >= 0) return; const proceeds = d.mtm * 0.94; co.cash += proceeds; co.realized += proceeds - d.cost; co.stats.forced++; co.deals = co.deals.filter((x) => x !== d); L(`Forced sale of ${d.label} at a distressed price: ${fmt.money(proceeds, 'USD', 0)}.`, 'bad'); });
      if (co.cash < 0) { co.status = 'bankrupt'; L('LIQUIDITY CRISIS: the company cannot meet its payments. Banks call the facility.', 'bad'); }
      else { co.status = 'crisis'; L('Liquidity crisis averted only by forced sales.', 'bad'); }
    } else if (co.status === 'crisis') co.status = 'active';
    if (equity(co) <= 0 && co.status !== 'bankrupt') { co.status = 'bankrupt'; L('Equity wiped out: the company is insolvent.', 'bad'); }
    co.history.push({ m, cash: co.cash, equity: equity(co), debt: co.debt });
    if (co.status !== 'bankrupt') co.opps = genOpps(co);
    CTA.save();
  }
  function diagnosis(co) {
    const recv = co.receivables.reduce((s, x) => s + x.amount, 0), unsec = co.receivables.filter((x) => !x.lc).reduce((s, x) => s + x.amount, 0);
    const out = [];
    if (co.stats.defaultLoss > 0) out.push(`Buyer defaults cost ${fmt.money(co.stats.defaultLoss, 'USD', 0)} (${co.stats.defaults} defaults). Prevention: credit limits, LCs or credit insurance for weaker buyers.`);
    if (co.stats.lateCount) out.push(`${co.stats.lateCount} late payments stretched working capital. Prevention: shorter terms, security, interest on late payments.`);
    if (co.stats.unhedgedPnL < 0) out.push(`Unhedged price exposure lost ${fmt.money(-co.stats.unhedgedPnL, 'USD', 0)}. Prevention: hedge flat price where instruments exist; limit unhedged steel inventory.`);
    if (recv > 0 && unsec / recv > 0.5) out.push(`More than half of receivables (${fmt.pct(unsec / recv * 100, 0)}) are unsecured. Prevention: concentration and counterparty limits.`);
    if (co.stats.forced) out.push(`${co.stats.forced} forced sales at distressed prices — the classic consequence of insufficient liquidity reserves.`);
    const peakDebt = Math.max(...co.history.map((h) => h.debt)); if (peakDebt > co.cfg.facility * 0.9) out.push('The facility was almost fully drawn: growth outpaced funding. Prevention: keep a liquidity reserve and pace deal intake to available funding.');
    if (!out.length) out.push('No single dominant cause: losses came from accumulated small events and overheads. Review margins versus fixed costs.');
    return out;
  }

  CTA.companyView = function (el) {
    const st = CTA.state;
    if (!st.company) {
      const d = defaults();
      el.innerHTML = `<div class="card"><h3>Set up your trading company ${CTA.SIM}</h3><p>Choose initial conditions. You decide each month which deals to pursue, whether to hedge, and whether to use trade finance. Events — price moves, defaults, delays, disputes, freight and rate changes — follow published probabilities (see <code>js/views/company.js</code>).</p>
        <div class="form">${CTA.ui.field({ id: 'co-capital', name: 'capital', label: 'Starting equity (USD)', value: d.capital })}${CTA.ui.field({ id: 'co-facility', name: 'facility', label: 'Trade-finance facility limit (USD)', value: d.facility })}${CTA.ui.field({ id: 'co-rate', name: 'rate', label: 'Facility interest rate % p.a.', value: d.rate })}${CTA.ui.field({ id: 'co-vol', name: 'vol', label: 'Market volatility', type: 'select', value: 'normal', options: ['low', 'normal', 'high'] })}${CTA.ui.field({ id: 'co-res', name: 'reservePct', label: 'Liquidity reserve policy (% of equity)', value: d.reservePct })}${CTA.ui.field({ id: 'co-seed', name: 'seed', label: 'Scenario seed (repeatable)', value: d.seed })}</div>
        <p style="margin-top:8px"><b>Markets to enter:</b> ${['gold', 'wheat', 'sugar', 'steel'].map((k) => `<label class="check" style="display:inline-flex"><input type="checkbox" name="mk" value="${k}" checked> ${k}</label>`).join(' ')}</p><button class="btn primary" id="co-start">Found the company</button></div>`;
      CTA.$('#co-start', el).onclick = () => { const v = CTA.ui.read(el, ['capital', 'facility', 'rate', 'vol', 'reservePct', 'seed']); const mk = CTA.$$('input[name=mk]:checked', el).map((x) => x.value); if (!mk.length) { CTA.toast('Choose at least one market.', 'warn'); return; } if (v.capital <= 0) { CTA.toast('Capital must be positive.', 'warn'); return; } const co = start(Object.assign(d, v, { markets: mk })); co.opps = genOpps(co); st.company = co; CTA.save(); CTA.log('Founded the simulated trading company', 'company'); CTA.companyView(el); };
      return;
    }
    const co = st.company; const eq = equity(co);
    const recv = co.receivables.reduce((s, x) => s + x.amount, 0), inv = co.deals.reduce((s, d) => s + d.mtm, 0), invCost = co.deals.reduce((s, d) => s + d.cost, 0);
    const reserve = co.cfg.capital * co.cfg.reservePct / 100;
    const sel = co.opps.filter((o) => o.take); const needCash = sel.reduce((s, o) => s + o.cost - (o.tf && o.lc ? o.cost * 0.8 : 0), 0); const needDebt = sel.reduce((s, o) => s + (o.tf && o.lc ? o.cost * 0.8 : 0), 0);
    const byBuyer = {}; co.receivables.forEach((x) => { byBuyer[x.buy] = (byBuyer[x.buy] || 0) + x.amount; });
    el.innerHTML = `${co.status === 'bankrupt' ? `<div class="note bad"><strong>The company failed in month ${co.month}</strong>Why it happened and how it could have been prevented:<ul>${diagnosis(co).map((x) => `<li>${esc(x)}</li>`).join('')}</ul></div>` : co.status === 'crisis' ? '<div class="note bad"><strong>Liquidity crisis</strong>You survived only through forced sales. Reduce new commitments and rebuild cash.</div>' : ''}
      <div class="ws"><div class="row between"><h3 style="margin:0">Month ${co.month} ${CTA.SIM}</h3><div class="row"><button class="btn sm" id="co-restart">Restart with new conditions</button></div></div>
      ${CTA.ui.kpis([{ label: 'Equity', value: fmt.money(eq, 'USD', 0), cls: eq >= co.cfg.capital ? 'pos' : 'neg', sub: fmt.signed((eq / co.cfg.capital - 1) * 100) + '% vs start' }, { label: 'Cash', value: fmt.money(co.cash, 'USD', 0), cls: co.cash < reserve ? 'warn' : '', sub: 'Reserve policy ' + fmt.money(reserve, 'USD', 0) }, { label: 'Receivables', value: fmt.money(recv, 'USD', 0) }, { label: 'Inventory / in transit (MTM)', value: fmt.money(inv, 'USD', 0) }, { label: 'Facility drawn', value: fmt.money(co.debt, 'USD', 0), sub: 'of ' + fmt.money(co.cfg.facility, 'USD', 0) + ' at ' + co.rate + '%' }, { label: 'Realised P&L', value: fmt.money(co.realized, 'USD', 0), cls: fmt.cls(co.realized) }, { label: 'Unrealised P&L', value: fmt.money(inv - invCost, 'USD', 0), cls: fmt.cls(inv - invCost) }, { label: 'Working capital', value: fmt.money(recv + inv, 'USD', 0) }])}
      <div class="grid c2"><div class="card"><h4>Equity, cash and debt</h4><div id="co-chart"></div></div><div class="card"><h4>Balance sheet</h4><table><tbody><tr><td>Cash</td><td class="r">${f(co.cash)}</td></tr><tr><td>Receivables</td><td class="r">${f(recv)}</td></tr><tr><td>Inventory & goods in transit (MTM incl. hedges)</td><td class="r">${f(inv)}</td></tr><tr><td>Trade-finance facility</td><td class="r">(${f(co.debt)})</td></tr><tr class="total"><td>Equity</td><td class="r">${f(eq)}</td></tr></tbody></table>
        <h4>Counterparty exposure (receivables by buyer rating)</h4>${Object.keys(byBuyer).length ? Object.entries(byBuyer).map(([k, v]) => `<div class="row between"><span>Rating ${k}</span><span>${f(v)} (${fmt.pct(v / recv * 100, 0)})</span></div>`).join('') : '<p class="muted">None.</p>'}</div></div>
      <div class="card"><h4>Open contracts & positions</h4>${co.deals.length ? CTA.table(['Deal', 'Cost', 'MTM', 'Delivers', 'Buyer', 'Supplier', 'Hedged', 'TF'], co.deals.map((d) => [d.label + ' · ' + d.com, f(d.cost), `<span class="${fmt.cls(d.mtm - d.cost)}">${f(d.mtm)}</span>`, 'M' + d.deliver, d.buy, d.sup, d.hedge ? 'yes' : '<b class="neg">no</b>', d.tf ? f(d.tf) : '—'])) : '<p class="muted">No open deals.</p>'}
        ${co.receivables.length ? '<h4>Receivables</h4>' + CTA.table(['Deal', 'Amount', 'Due', 'Buyer', 'Security'], co.receivables.map((x) => [x.label, f(x.amount), 'M' + x.due + (x.late ? ' (late)' : ''), x.buy, x.lc ? 'LC' : 'open account'])) : ''}</div>
      ${co.status !== 'bankrupt' ? `<div class="card"><h4>This month's opportunities</h4><p class="muted" style="font-size:.84rem">Supplier/buyer ratings A (strong) – C (weak). Trade finance (80% of cost) is available only for LC-backed sales. Steel cannot be hedged in this simulation.</p>
        ${CTA.table(['Take', 'Deal', 'Cost', 'Expected revenue', 'Margin', 'Months', 'Supplier', 'Buyer', 'Pays after', 'Security', 'Hedge', 'Use TF'], co.opps.map((o, i) => [`<input type="checkbox" data-o="${i}" data-k="take" ${o.take ? 'checked' : ''} aria-label="Take deal">`, o.label + ' · ' + o.com, f(o.cost), f(o.revenue), fmt.pct(o.marginPct), o.dur, o.sup, o.buy, o.payTerms + ' mo', o.lc ? 'LC' : 'open acct.', o.hedgeable ? `<input type="checkbox" data-o="${i}" data-k="hedge" ${o.hedge ? 'checked' : ''} aria-label="Hedge">` : 'n/a', o.lc ? `<input type="checkbox" data-o="${i}" data-k="tf" ${o.tf ? 'checked' : ''} aria-label="Use trade finance">` : 'n/a']))}
        <div class="note ${co.cash - needCash < reserve ? 'warn' : ''}"><strong>Selected: ${sel.length} deal(s)</strong>Cash needed now ${fmt.money(needCash, 'USD', 0)}; trade finance ${fmt.money(needDebt, 'USD', 0)}. Cash after commitments: ${fmt.money(co.cash - needCash, 'USD', 0)}${co.cash - needCash < reserve ? ' — below your liquidity reserve policy!' : ''}${co.debt + needDebt > co.cfg.facility ? '. Facility limit would be exceeded — not all TF can be drawn.' : ''}.</div>
        <button class="btn ok" id="co-adv">Advance one month →</button></div>` : ''}
      <div class="card"><h4>Event log</h4><div class="news" style="max-height:300px">${co.log.slice(0, 60).map((l) => `<div><span class="d">M${l.m}</span><span class="${l.k === 'bad' ? 'neg' : l.k === 'ok' ? 'pos' : ''}">${esc(l.t)}</span></div>`).join('')}</div></div></div>`;
    CTA.chart(CTA.$('#co-chart', el), { height: 200, labels: co.history.map((h) => 'M' + h.m), series: [{ data: co.history.map((h) => h.equity), label: 'Equity', color: '#45d18a' }, { data: co.history.map((h) => h.cash), label: 'Cash', color: '#6aa5ef' }, { data: co.history.map((h) => h.debt), label: 'Debt', color: '#ff7b7b' }], zero: true, yFmt: (v) => fmt.num(v / 1e6, 1) + 'm' });
    CTA.$$('[data-o]', el).forEach((cb) => { cb.onchange = () => { co.opps[+cb.dataset.o][cb.dataset.k] = cb.checked; CTA.save(); CTA.companyView(el); }; });
    const adv = CTA.$('#co-adv', el);
    if (adv) adv.onclick = () => {
      advance(co); if (co.month >= 6) CTA.log('Operated the trading company for ' + co.month + ' months', 'company');
      if (co.status === 'bankrupt') CTA.journalAdd({ auto: true, type: 'company', title: 'Trading company failed in month ' + co.month, pnl: equity(co) - co.cfg.capital, lessons: diagnosis(co).join(' ') });
      CTA.companyView(el);
    };
    CTA.$('#co-restart', el).onclick = () => { if (!confirm('Restart the company? The current simulation will be closed.')) return; if (co.month) CTA.journalAdd({ auto: true, type: 'company', title: `Trading company closed after ${co.month} months`, pnl: equity(co) - co.cfg.capital, lessons: diagnosis(co).join(' ') }); st.company = null; CTA.save(); CTA.companyView(el); };
  };
  CTA.COMPANY = { OPP_TEMPLATES, CREDIT, SUPPLIER, equity, advance, start, genOpps };
})();
