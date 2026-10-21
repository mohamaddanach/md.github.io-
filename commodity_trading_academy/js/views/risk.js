/* Risk Management Center — dashboard, deal risk registers with heat map, combined stress test, sizing & hedge residuals. */
(function () {
  const CTA = window.CTA, C = window.CALC, fmt = CTA.fmt, esc = CTA.esc;
  const f = (n, d = 0) => fmt.num(n, d);
  const PROB = { 1: 0.05, 2: 0.15, 3: 0.3, 4: 0.5, 5: 0.75 };
  const impactBucket = (x) => (x < 25000 ? 1 : x < 100000 ? 2 : x < 300000 ? 3 : x < 1000000 ? 4 : 5);
  const TEMPLATE = [
    ['Price risk', 3, 0.05, 'Hedge with futures/swaps; fix sale price back-to-back', 'Trader', 'Reduce exposure; tighten stops'],
    ['Basis risk', 3, 0.01, 'Choose closest benchmark; basis limits', 'Trader', 'Adjust hedge ratio; physical basis trades'],
    ['Currency risk', 2, 0.02, 'FX forwards; same-currency contracts', 'Treasury', 'Hedge remaining exposure'],
    ['Counterparty risk (supplier performance)', 2, 0.04, 'Due diligence, reliable suppliers, performance bond', 'Trading manager', 'Back-up supplier list'],
    ['Credit risk (buyer payment)', 2, 0.6, 'LC/credit insurance/limits', 'Credit risk', 'Collections plan, legal action'],
    ['Liquidity risk (margin calls, payments)', 2, 0.03, 'Committed lines, liquidity reserve', 'Treasury', 'Draw reserve lines'],
    ['Financing risk', 1, 0.02, 'Diversified banks; committed facilities', 'Treasury', 'Alternative funding'],
    ['Operational risk', 2, 0.01, 'Four-eyes, call-back verification, systems', 'Operations', 'Incident response'],
    ['Documentation risk', 2, 0.01, 'Checklists, early LC review', 'Documentation', 'Correct & re-present; seek waiver'],
    ['Quality risk', 2, 0.02, 'Independent inspection, final-at-loading terms', 'Operations', 'Allowances per contract'],
    ['Delivery risk', 2, 0.015, 'Realistic windows, reliable logistics', 'Operations', 'Extension requests, substitutes'],
    ['Shipping risk (delay, damage)', 2, 0.015, 'Route choice, insurance, laytime alignment', 'Shipping', 'Claims, alternative ports'],
    ['Legal risk', 1, 0.02, 'Standard contracts, arbitration clause, counsel review', 'Legal', 'Arbitration'],
    ['Regulatory risk (sanctions, export bans)', 1, 0.3, 'Screening, force majeure, policy monitoring', 'Compliance', 'Stop/unwind per counsel'],
    ['Fraud risk', 1, 0.5, 'KYC, verified documents, DvP, collateral managers', 'Compliance', 'Freeze, report, legal action'],
    ['Concentration risk', 2, 0.1, 'Counterparty & route limits', 'Risk', 'Diversify next deals'],
  ];
  const freshRegister = (value) => TEMPLATE.map(([name, p, impPct, mit, owner, cont]) => ({ name, p, impact: Math.round(value * impPct), mit, residual: 40, owner, cont }));

  function heat(entries) {
    const grid = {}; entries.forEach((e) => { const k = e.p + ':' + impactBucket(e.impact); (grid[k] = grid[k] || []).push(e.name); });
    const col = (p, i) => { const s = p * i; return s >= 15 ? '#f4b4b4' : s >= 8 ? '#fbd9a5' : s >= 4 ? '#fff0b8' : '#d7efdf'; };
    let h = '<div class="heat"><div class="hl"></div>' + ['<25k', '<100k', '<300k', '<1m', '≥1m'].map((x) => `<div class="hl" style="justify-content:center">${x}</div>`).join('');
    for (let p = 5; p >= 1; p--) { h += `<div class="hl">P${p} (${PROB[p] * 100}%)</div>`; for (let i = 1; i <= 5; i++) { const xs = grid[p + ':' + i] || []; h += `<div style="background:${col(p, i)}" title="${esc(xs.join(', '))}">${xs.length ? '<b>' + xs.length + '</b>' : ''}</div>`; } }
    return h + '</div><p class="muted" style="font-size:.8rem">Rows: probability · columns: impact (USD). Hover a cell to see risks.</p>';
  }

  function register(b, r) {
    const deals = CTA.state.physical.completed;
    const id = r.q.deal || (deals.length ? deals[deals.length - 1].id : 'generic');
    const deal = deals.find((d) => d.id === id);
    const value = deal ? deal.revenue : 7000000;
    const regs = CTA.state.risk.registers;
    if (!regs[id]) regs[id] = freshRegister(value);
    const E = regs[id];
    const draw = () => {
      const tot = E.reduce((s, e) => s + PROB[e.p] * e.impact, 0), res = E.reduce((s, e) => s + PROB[e.p] * e.impact * e.residual / 100, 0);
      b.innerHTML = `<div class="card"><div class="row"><label for="rdeal">Deal</label><select id="rdeal" style="max-width:340px"><option value="generic" ${id === 'generic' ? 'selected' : ''}>Generic 7m commodity deal (template)</option>${deals.map((d) => `<option value="${d.id}" ${d.id === id ? 'selected' : ''}>${d.commodity} deal ${fmt.date(d.date)} — revenue ${fmt.money(d.revenue, 'USD', 0)}</option>`).join('')}</select><button class="btn sm" id="rreset">Reset to template</button></div>
        ${deal ? `<p class="muted" style="font-size:.86rem">Choices in this deal: supplier ${esc(deal.choices.supplier)}, buyer ${esc(deal.choices.buyer)}, hedge ${deal.choices.hedge || 0}%, ${esc(deal.choices.route)}. Adjust probabilities accordingly.</p>` : ''}</div>
        <div class="grid side"><div class="card"><h3>Risk register ${CTA.SIM}</h3><div class="table-wrap"><table><thead><tr><th>Risk</th><th>Probability</th><th class="r">Impact (USD)</th><th class="r">Expected loss</th><th>Mitigation</th><th>Residual %</th><th class="r">Remaining exposure</th><th>Owner</th><th>Contingency</th></tr></thead><tbody>
          ${E.map((e, i) => `<tr><td><b>${esc(e.name)}</b></td><td><select data-i="${i}" data-k="p" aria-label="Probability">${[1, 2, 3, 4, 5].map((p) => `<option value="${p}" ${+e.p === p ? 'selected' : ''}>${p} (${PROB[p] * 100}%)</option>`).join('')}</select></td><td><input type="number" data-i="${i}" data-k="impact" value="${e.impact}" style="width:110px" aria-label="Impact"></td><td class="r num">${f(PROB[e.p] * e.impact)}</td><td><input type="text" data-i="${i}" data-k="mit" value="${esc(e.mit)}" style="min-width:200px" aria-label="Mitigation"></td><td><input type="number" data-i="${i}" data-k="residual" value="${e.residual}" min="0" max="100" style="width:70px" aria-label="Residual"></td><td class="r num">${f(PROB[e.p] * e.impact * e.residual / 100)}</td><td><input type="text" data-i="${i}" data-k="owner" value="${esc(e.owner)}" style="width:110px" aria-label="Owner"></td><td><input type="text" data-i="${i}" data-k="cont" value="${esc(e.cont)}" style="min-width:170px" aria-label="Contingency"></td></tr>`).join('')}
          <tr class="total"><td colspan="3">Totals</td><td class="r">${f(tot)}</td><td></td><td></td><td class="r">${f(res)}</td><td colspan="2"></td></tr></tbody></table></div><p class="muted" style="font-size:.84rem">Expected loss = probability × impact. Remaining exposure = expected loss × residual % after mitigation. Expected values hide tail risk: also look at high-impact cells in the heat map.</p></div>
        <div><div class="card"><h3>Heat map</h3>${heat(E)}</div><div class="card"><h3>Top residual exposures</h3>${E.map((e) => [e.name, PROB[e.p] * e.impact * e.residual / 100]).sort((a, c) => c[1] - a[1]).slice(0, 5).map(([n, v]) => `<div class="row between"><span>${esc(n)}</span><b>${f(v)}</b></div>`).join('')}</div></div></div>`;
      CTA.$('#rdeal', b).onchange = (e) => CTA.go('risk/register?deal=' + e.target.value);
      CTA.$('#rreset', b).onclick = () => { regs[id] = freshRegister(value); CTA.save(); register(b, r); };
      CTA.$$('[data-i]', b).forEach((inp) => { inp.onchange = () => { const e = E[+inp.dataset.i]; const k = inp.dataset.k; e[k] = ['p', 'impact', 'residual'].includes(k) ? Math.max(0, CTA.num(inp.value, 0)) : inp.value; if (k === 'residual') e.residual = Math.min(100, e.residual); CTA.save(); draw(); }; });
    };
    CTA.save(); draw();
  }

  function stress(b) {
    CTA.ui.calcWidget(b, { title: 'Combined stress test — 5,000 t wheat', intro: 'A trader buys 5,000 t of wheat. The market price declines, freight increases, the vessel is delayed and the buyer requests an extension of payment terms. Adjust the shocks and see the combined impact on profit and cash.',
      fields: [{ id: 'q', label: 'Quantity (t)', value: 5000 }, { id: 'buy', label: 'Purchase price (/t)', value: 248 }, { id: 'sell', label: 'Agreed sale price (/t)', value: 282 }, { id: 'fr', label: 'Freight (/t, unfixed)', value: 30 }, { id: 'oth', label: 'Other costs (/t)', value: 6 }, { id: 'hedge', label: 'Hedged share of price risk (%)', value: 0 }, { id: 'priceFall', label: 'Market price decline (%)', value: 8 }, { id: 'pricePass', label: 'Share of price fall hitting you (buyer renegotiates/defaults, %)', value: 50 }, { id: 'frUp', label: 'Freight increase (%)', value: 20 }, { id: 'delay', label: 'Vessel delay (days)', value: 10 }, { id: 'dem', label: 'Demurrage (/day)', value: 9000 }, { id: 'ext', label: 'Payment extension (days)', value: 60 }, { id: 'rate', label: 'Funding rate %', value: 8 }, { id: 'cash', label: 'Available liquidity (USD)', value: 400000 }],
      compute: (v) => { const base = (v.sell - v.buy - v.fr - v.oth) * v.q;
        const price = v.q * v.buy * v.priceFall / 100 * v.pricePass / 100 * (1 - v.hedge / 100);
        const freight = v.q * v.fr * v.frUp / 100, dem = v.delay * v.dem, fin = C.interest(v.q * v.buy, v.rate, v.delay + v.ext);
        const tot = price + freight + dem + fin, after = base - tot; const cashNeed = v.q * v.buy * (1 - 0.8) + freight + dem + fin;
        return `${CTA.table(['Shock', 'Impact (USD)'], [['Price decline × share hitting you × unhedged share', f(price)], ['Freight increase', f(freight)], ['Demurrage from delay', f(dem)], ['Extra financing (delay + extension)', f(fin)], ['<b>Combined impact</b>', '<b>' + f(tot) + '</b>']])}
          ${CTA.ui.kpis([{ label: 'Planned profit', value: fmt.money(base, 'USD', 0) }, { label: 'Stressed profit', value: fmt.money(after, 'USD', 0), cls: fmt.cls(after) }, { label: 'Stressed cash need (20% equity + shocks)', value: fmt.money(cashNeed, 'USD', 0), cls: cashNeed > v.cash ? 'neg' : '' }, { label: 'Liquidity headroom', value: fmt.money(v.cash - cashNeed, 'USD', 0), cls: fmt.cls(v.cash - cashNeed) }])}
          ${cashNeed > v.cash ? '<div class="note bad"><strong>Liquidity shortfall</strong>The shocks arrive together and the cash need exceeds available liquidity.</div>' : ''}<div id="stdec"></div>`; },
      after: (v, out) => {
        const opts = [['Accept the extension only with interest and security (e.g. a bank guarantee); fix the remaining freight now; hedge the unpriced exposure; draw the committed line', 100, 'Addresses each driver: credit, freight, price and liquidity.'], ['Accept the extension without conditions to keep the customer', 30, 'You become the buyer\'s unpaid financier while your own costs rise.'], ['Refuse everything and cancel the sale', 20, 'Leaves you with unsold cargo in a falling market — likely the worst outcome.'], ['Wait for prices to recover', 10, 'Hope is not a risk-management strategy.']];
        const dec = CTA.$('#stdec', out); dec.innerHTML = `<h4>How do you respond?</h4>${CTA.shuffleIdx(opts.length).map((i) => `<label class="choice"><input type="radio" name="stdec" value="${i}"><span class="ch-t">${esc(opts[i][0])}</span></label>`).join('')}<div class="stfb"></div>`;
        CTA.$$('input[name=stdec]', dec).forEach((x) => { x.onchange = () => { const o = opts[+x.value]; CTA.$('.stfb', dec).innerHTML = `<div class="note ${o[1] >= 70 ? 'ok' : 'bad'}"><strong>${o[1]}/100</strong>${esc(o[2])} Note: a hedge would have reduced the price component but kept freight, delay, credit and liquidity risks — and could itself require margin cash.</div>`; CTA.record.caseResult('stress-wheat', o[1]); }; });
      } });
  }

  function sizing(b) {
    b.innerHTML = `<div data-widget="rrCalc"></div><div data-widget="hedgeDemo"></div>
      <div class="card"><h3>A hedge reduces some risks — and keeps or creates others</h3>${CTA.table(['Risk', 'After a futures hedge of physical inventory'], [['Flat price risk', '<span class="pos">Largely removed</span>'], ['Basis risk', '<span class="neg">Remains</span> (location/quality/timing differences)'], ['Liquidity risk', '<span class="neg">Created</span>: variation margin is paid in cash daily while the physical gain is unrealised'], ['Counterparty risk on physical contracts', '<span class="neg">Remains</span>'], ['Quantity risk', '<span class="neg">Remains</span> (if volumes change, the hedge may be too large)'], ['Operational risk', '<span class="neg">Increases</span>: rolls, expiry, reconciliation'], ['Model/correlation risk (cross-hedges)', '<span class="neg">Created</span> when using a proxy contract']])}</div>
      <div class="card"><h3>Typical limits framework ${CTA.ILLU}</h3>${CTA.table(['Limit', 'Example', 'Purpose'], [['Max risk per speculative trade', '1% of equity', 'Survive losing streaks'], ['Max open net exposure per commodity', 'e.g. 50,000 t wheat', 'Cap market risk'], ['Max unsecured exposure per counterparty', 'e.g. 10% of equity', 'Cap credit risk'], ['Max concentration per country/route/bank', 'e.g. 25%', 'Avoid correlated losses'], ['Minimum liquidity reserve', 'Stressed outflows for 30 days', 'Meet margin calls & payments'], ['Max leverage (futures desk)', 'e.g. 5× equity', 'Avoid margin spirals'], ['Stop-loss review trigger', 'e.g. −5% monthly', 'Force review of losing strategies']])}</div>`;
  }

  function dashboard(b) {
    const st = CTA.state, F = st.futures; const regs = st.risk.registers; const all = Object.entries(regs).filter(([, e]) => e);
    const fut = F && CTA.FUT ? (() => { const eq = CTA.FUT.equity(F), m = CTA.FUT.margins(F); const sp = CTA.MARKET.specs()[CTA.MARKET.SCENARIOS.find((s) => s.id === F.scenarioId).inst]; const ex = F.positions.filter((p) => p.type === 'fut').reduce((s, p) => s + CTA.FUT.price(F, p.month).c * sp.pointValue * p.qty, 0); return { eq, m, ex, lev: eq > 0 ? ex / eq : 0, dd: C.maxDrawdown(F.equityHist) }; })() : null;
    const co = st.company; const recv = co ? co.receivables : []; const tot = recv.reduce((s, x) => s + x.amount, 0); const by = {}; recv.forEach((x) => { by[x.buy] = (by[x.buy] || 0) + x.amount; }); const maxC = tot ? Math.max(...Object.values(by)) / tot * 100 : 0;
    const allE = all.flatMap(([, e]) => e);
    const lim = (label, val, limit, unit, ok) => [label, val, limit, ok ? '<span class="badge ok">within</span>' : '<span class="badge bad">breach</span>'];
    b.innerHTML = `${CTA.ui.kpis([{ label: 'Futures equity', value: fut ? fmt.money(fut.eq, 'USD', 0) : '—' }, { label: 'Futures leverage', value: fut ? f(fut.lev, 1) + '×' : '—', cls: fut && fut.lev > 5 ? 'neg' : '' }, { label: 'Margin headroom', value: fut ? fmt.money(fut.eq - fut.m.mm, 'USD', 0) : '—', cls: fut && fut.eq < fut.m.mm ? 'neg' : '' }, { label: 'Max drawdown (futures)', value: fut ? fmt.pct(fut.dd * 100) : '—' }, { label: 'Company receivables', value: co ? fmt.money(tot, 'USD', 0) : '—' }, { label: 'Largest buyer-rating concentration', value: co && tot ? fmt.pct(maxC, 0) : '—', cls: maxC > 50 ? 'neg' : '' }, { label: 'Risk registers', value: all.length }, { label: 'Expected loss (all registers)', value: fmt.money(allE.reduce((s, e) => s + PROB[e.p] * e.impact, 0), 'USD', 0) }])}
      <div class="grid c2"><div class="card"><h3>Limit monitor ${CTA.ILLU}</h3>${CTA.table(['Limit', 'Current', 'Limit', 'Status'], [fut ? lim('Futures leverage', f(fut.lev, 1) + '×', '5×', '', fut.lev <= 5) : ['Futures leverage', '—', '5×', '—'], fut ? lim('Equity vs maintenance margin', fmt.money(fut.eq, 'USD', 0), '≥ ' + fmt.money(fut.m.mm, 'USD', 0), '', fut.eq >= fut.m.mm) : ['Margin', '—', '—', '—'], co ? lim('Single rating bucket concentration', fmt.pct(maxC, 0), '≤ 50%', '', maxC <= 50) : ['Concentration', '—', '50%', '—'], co ? lim('Facility utilisation', fmt.pct(co.debt / co.cfg.facility * 100, 0), '≤ 80%', '', co.debt / co.cfg.facility <= 0.8) : ['Facility', '—', '80%', '—']])}<p class="muted" style="font-size:.84rem">Feeds from the futures desk and the trading company simulator. Limits are illustrative examples of a risk policy.</p></div>
      <div class="card"><h3>Aggregated heat map</h3>${allE.length ? heat(allE) : CTA.ui.empty('No risk registers yet', 'Build one for a completed deal.', '<a class="btn primary" href="#/risk/register">Open register</a>')}</div></div>`;
  }

  CTA.route('risk', { title: 'Risk Management Center', desc: 'Registers, heat maps, stress tests, limits.', render(el, r) {
    const tab = r.parts[0] || 'dashboard';
    el.innerHTML = `${CTA.pageHead('Risk Management Center', 'How professional trading businesses identify, measure, mitigate and monitor risk: price, basis, currency, counterparty, credit, liquidity, financing, operational, documentation, quality, delivery, shipping, legal, regulatory, fraud and concentration.')}${CTA.tabs([['dashboard', 'Dashboard'], ['register', 'Deal risk register'], ['stress', 'Stress test'], ['sizing', 'Sizing, limits & hedges']], tab, 'risk')}<div id="rk"></div>`;
    const b = CTA.$('#rk', el);
    if (tab === 'register') register(b, r); else if (tab === 'stress') stress(b); else if (tab === 'sizing') sizing(b); else dashboard(b);
  } });
})();
