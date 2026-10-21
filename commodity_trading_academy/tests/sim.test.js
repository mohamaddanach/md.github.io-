/* Simulation invariant tests (Node, no browser):  node commodity_trading_academy/tests/sim.test.js
 * Loads the real simulator modules with a minimal CTA stub and checks accounting consistency:
 *  1. Physical deal model: the final ledger always sums to net profit, for every combination of choices.
 *  2. Best-practice choices earn a positive margin before random events in every commodity.
 *  3. Trading company: equity = starting capital + realised P&L + unrealised P&L, every month, many seeds.
 *  4. Futures desk: after all positions close, cash = starting cash + deposits + Σ realised P&L (after fees).
 *  5. Negotiation engine: utilities stay in range; counterparties never accept below their reservation level. */
'use strict';
const path = require('path');
const root = path.join(__dirname, '..');
global.window = global;
window.CALC = require(path.join(root, 'js/calc.js'));
const num = (n, d = 2) => Number(n).toFixed(d);
window.CTA = {
  fmt: { num, money: (n, c) => (c || 'USD') + ' ' + num(n), pct: (n) => num(n) + '%', signed: (n) => num(n), cls: () => '', date: () => '', dur: () => '' },
  uid: (p) => (p || 'id') + Math.random().toString(36).slice(2, 9), clone: (o) => JSON.parse(JSON.stringify(o)),
  save() {}, log() {}, journalAdd() {}, route() {}, widgets: {}, ui: {}, toast() {}, esc: (s) => String(s), SIM: '', ILLU: '', HIST: '', rich: (s) => s,
  table: () => '', callout: () => '', K: () => '', term: () => '',
  state: { settings: { specs: {}, fx: { USD: 1 }, autoJournal: false }, physical: { completed: [] }, risk: { registers: {} }, journal: [] },
};
['js/data/markets.js', 'js/data/sim-scenarios.js', 'js/views/physical.js', 'js/views/company.js', 'js/views/futures.js', 'js/views/dealroom.js'].forEach((f) => require(path.join(root, f)));
const C = window.CALC, CTA = window.CTA;
let pass = 0, fail = 0;
const check = (name, ok, info) => { if (ok) pass++; else { fail++; console.log('FAIL ' + name + (info ? '  ' + info : '')); } };

/* 1 & 2 — physical deal model */
Object.entries(CTA.SIM_SCENARIOS).forEach(([com, sc]) => {
  sc.suppliers.filter((s) => s.canSupply).forEach((sup) => sc.buyers.forEach((b) => sc.routes.forEach((r) => sc.finance.forEach((fi) => [0, 50, 100].forEach((h) => {
    const run = { commodity: com, seed: 42, sel: { supplier: sup.id, buyer: b.id, route: r.id, finance: fi.id, inspection: 'I1', hedge: h, nego: { security: 'insurance' } }, ev: { costs: [['Test event', 12345]], shortPct: 7, delayDays: 6, payDelay: 45 } };
    const m = CTA.simModel(run);
    const ledger = m.revenue - m.value - m.qtyDel * m.perUnit - m.value * m.pctCosts / 100 - m.lumps - m.finCost + m.hedge - m.hedgeCost - m.credIns - 12345;
    check(`ledger=net ${com}/${sup.id}/${b.id}/${r.id}/${fi.id}/h${h}`, Math.abs(ledger - m.net) < 1e-6, `${ledger} vs ${m.net}`);
  })))));
  const B0 = sc.benchmark.B0, pen = B0 * 0.15;
  const sup = sc.suppliers.filter((s) => s.canSupply).sort((a, b) => (a.diff + (1 - a.reliability) * pen) - (b.diff + (1 - b.reliability) * pen))[0];
  const buyer = sc.buyers.map((b) => ({ b, a: b.prem - b.pd * 0.6 * (B0 + b.prem) - (B0 + b.prem) * 0.075 * b.payDays / 360 })).sort((x, y) => y.a - x.a)[0].b;
  const best = CTA.simModel({ commodity: com, seed: 1, sel: { supplier: sup.id, buyer: buyer.id, route: 'R1', finance: 'F1', inspection: 'I1', hedge: sc.market.hedgeEff < 1 ? 50 : 100, nego: { security: 'asis' } }, ev: { costs: [] } }, { noMarket: true });
  check(`best-practice ${com} deal has a positive margin before events`, best.net > 0, 'net ' + best.net);
  check(`best-practice ${com} supplier is not the high-risk one`, sup.risk !== 'High', sup.name);
  check(`best-practice ${com} buyer has payment security`, buyer.security !== 'none', buyer.label);
});

/* 3 — trading company invariant */
for (let seed = 1; seed <= 25; seed++) {
  const co = CTA.COMPANY.start({ capital: 10e6, facility: 25e6, rate: 7, vol: seed % 3 === 0 ? 'high' : 'normal', reservePct: 10, seed, markets: ['gold', 'wheat', 'sugar', 'steel'] });
  co.opps = CTA.COMPANY.genOpps(co);
  const r = C.rng(seed * 13);
  for (let m = 0; m < 24 && co.status !== 'bankrupt'; m++) {
    co.opps.forEach((o) => { o.take = r() < 0.5; o.hedge = o.hedgeable && r() < 0.6; o.tf = o.lc && r() < 0.7; });
    CTA.COMPANY.advance(co);
    const eq = CTA.COMPANY.equity(co), unr = co.deals.reduce((s, d) => s + d.mtm - d.cost, 0);
    check(`company seed ${seed} month ${co.month}: equity = capital + realised + unrealised`, Math.abs(eq - (co.cfg.capital + co.realized + unr)) < 0.01, `${eq} vs ${co.cfg.capital + co.realized + unr}`);
    check(`company seed ${seed} month ${co.month}: facility within limit`, co.debt <= co.cfg.facility + 0.01);
  }
}

/* 4 — futures desk cash reconciliation over every scenario with random trading */
CTA.MARKET.SCENARIOS.forEach((s, k) => {
  const F = CTA.FUT.newAccount(s.id, 250000); const r = C.rng(100 + k);
  while (F.status !== 'finished') {
    if (r() < 0.25) CTA.FUT.open(F, { type: 'fut', side: r() < 0.5 ? 'long' : 'short', qty: 1 + Math.floor(r() * 3) });
    if (r() < 0.05 && F.day < s.days - 2) CTA.FUT.open(F, { type: 'opt', side: r() < 0.7 ? 'long' : 'short', optType: r() < 0.5 ? 'call' : 'put', strike: CTA.FUT.price(F, 'M1').c, qty: 1 });
    if (F.marginCall && r() < 0.5) { const m = CTA.FUT.margins(F); const amt = Math.ceil(m.im - CTA.FUT.equity(F)); F.cash += amt; F.deposits += amt; F.marginCall = false; }
    CTA.FUT.step(F);
  }
  const realized = F.history.reduce((a, h) => a + h.pnl, 0);
  check(`futures ${s.id}: all positions closed at end`, F.positions.length === 0);
  check(`futures ${s.id}: cash = start + deposits + realised P&L`, Math.abs(F.cash - F.startCash - F.deposits - realized) < 0.01, `${F.cash} vs ${F.startCash + F.deposits + realized}`);
});

/* 5 — negotiation engine */
CTA.DEALROOM.CP.forEach((cp) => {
  const worst = { price: cp.reservation + (cp.role === 'buyer' ? 50 : -50), payment: 'oa90', quality: 'discharge', window: '15', incoterm: 'FOB', penalty: 'heavy', tolerance: 'b5', dispute: 'none', duration: 'spot' };
  const u = CTA.DEALROOM.util(cp, worst);
  check(`negotiation ${cp.id}: utility bounded`, u > -1 && u < 1.5, u);
  for (let round = 1; round <= 10; round++) check(`negotiation ${cp.id}: threshold never below floor`, CTA.DEALROOM.threshold(cp, round) >= 0.55);
  const c = CTA.DEALROOM.counter(cp, Object.assign({}, worst, { price: cp.role === 'buyer' ? cp.reservation + 20 : cp.reservation - 20 }), 1).c;
  check(`negotiation ${cp.id}: counter-offer moves price toward own interest`, cp.role === 'buyer' ? c.price < cp.reservation + 20 : c.price > cp.reservation - 20, c.price);
});

console.log(`\n${pass}/${pass + fail} simulation invariant checks passed`);
if (fail) process.exitCode = 1;
