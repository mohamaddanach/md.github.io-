/* Commodity Trading Academy — calculation tests
 * Run in Node:     node commodity_trading_academy/tests/calc.test.js
 * Run in browser:  Settings & Progress → "Run calculation self-tests" (same cases).
 * Expected values were worked out by hand; the working is in the comment next to each case.
 */
(function (root) {
  'use strict';
  const CASES = [
    /* ---------- units ---------- */
    ['1 kg = 32.1507 troy oz', (C) => C.convertMass(1, 'kg', 'ozt'), 32.1507466, 1e-6],
    ['1 troy oz = 31.1035 g', (C) => C.convertMass(1, 'ozt', 'g'), 31.1034768, 1e-9],
    ['1 troy oz = 1.09714 avoirdupois oz (they are different units)', (C) => C.convertMass(1, 'ozt', 'oz'), 1.0971428571, 1e-8],
    ['1 metric ton = 1.10231 short tons', (C) => C.convertMass(1, 't', 'st'), 1.10231131, 1e-7],
    ['1 long ton = 1.01605 metric tons', (C) => C.convertMass(1, 'lt', 't'), 1.0160469088, 1e-9],
    ['1 metric ton of wheat = 36.7437 bushels (60 lb bushel)', (C) => C.convertMass(1, 't', 'bu_wheat'), 36.74371, 1e-4],
    ['1 US cent/lb = USD 22.0462 per t', (C) => C.centsPerLbToUsdPerT(1), 22.0462262, 1e-6],
    ['18 c/lb raw sugar = USD 396.83 per t', (C) => C.centsPerLbToUsdPerT(18), 396.832, 1e-3],
    ['600 c/bu wheat = USD 220.46 per t', (C) => C.centsPerBuToUsdPerT(600), 220.4623, 1e-3],
    ['USD 900 per short ton = USD 992.08 per metric ton', (C) => C.usdPerStToUsdPerT(900), 992.0802, 1e-3],
    /* ---------- gold ---------- */
    ['18 karat fineness = 0.75', (C) => C.karatToFineness(18), 0.75, 1e-12],
    ['1 kg bar at 999.9 = 32.14753 fine oz', (C) => C.fineOunces(1, 'kg', 0.9999), 32.1475315, 1e-6],
    ['Value of 1 kg 999.9 at 2,000/oz + 2 premium = 64,359.36', (C) => C.goldValue({ grossWeight: 1000, unit: 'g', fineness: 0.9999, spotPerOzt: 2000, premiumPerOzt: 2 }).value, 64359.358, 0.01],
    /* ---------- steel & grain ---------- */
    ['Rebar 12 mm theoretical mass = 0.888 kg/m', (C) => C.rebarKgPerM(12), 0.8878, 1e-3],
    ['Plate 10 mm x 2,000 x 6,000 mm = 942 kg', (C) => C.plateKg(10, 2000, 6000), 942, 1e-6],
    ['Moisture shrink 15% -> 13% = 2.299%', (C) => C.moistureShrinkPct(15, 13), 2.29885, 1e-4],
    ['No shrink when already dry', (C) => C.moistureShrinkPct(12, 13), 0, 0],
    /* ---------- fx & interest ---------- */
    ['EUR 100 -> USD at 0.92 EUR/USD = 108.70', (C) => C.fx(100, 'EUR', 'USD', { USD: 1, EUR: 0.92 }), 108.6957, 1e-3],
    ['Interest 1,000,000 at 6% for 90 days ACT/360 = 15,000', (C) => C.interest(1e6, 6, 90), 15000, 1e-9],
    ['Interest 1,000,000 at 6% for 90 days ACT/365 = 14,794.52', (C) => C.interest(1e6, 6, 90, 365), 14794.52, 0.01],
    /* ---------- landed cost & deal P&L (worked example) ----------
       10,000 t FOB 250; freight 30/t; insurance 0.10% on 110% of CFR; inspection 5,000;
       port 5/t; finance 6% for 60 days on all costs.
       goods 2,500,000; freight 300,000; insurance 0.001 x 1.1 x 2,800,000 = 3,080;
       before financing 2,858,080; financing 2,858,080 x 6% x 60/360 = 28,580.80;
       landed 2,886,660.80 -> 288.67/t; sell 300/t -> profit 113,339.20; break-even 288.666/t */
    ['Landed cost total', (C) => C.landedCost(DEAL).total, 2886660.8, 0.01],
    ['Landed cost per t', (C) => C.landedCost(DEAL).perT, 288.66608, 1e-5],
    ['FOB price already includes loading (no double count)', (C) => C.landedCost(Object.assign({}, DEAL, { loading: 10 })).lines.loading, 0, 0],
    ['Under CIF the freight line is excluded', (C) => C.landedCost(Object.assign({}, DEAL, { buyTerm: 'CIF' })).lines.freight, 0, 0],
    ['Duty 5% on CIF value', (C) => C.landedCost(Object.assign({}, DEAL, { dutyPct: 5 })).lines.duty, 140154, 0.01],
    ['Deal net profit', (C) => C.dealPnL(DEAL).netProfit, 113339.2, 0.01],
    ['Deal break-even selling price', (C) => C.dealPnL(DEAL).breakEven, 288.66608, 1e-5],
    ['Break-even with 1% commission = 291.58', (C) => C.dealPnL(Object.assign({}, DEAL, { commissionPct: 1 })).breakEven, 291.5819, 1e-3],
    ['Working capital (no advances) = landed before financing', (C) => C.dealPnL(DEAL).workingCapital, 2858080, 0.01],
    ['ROIC with 80% bank funding = 113,339.20 / 571,616', (C) => C.dealPnL(Object.assign({}, DEAL, { bankFundedPct: 80 })).roic, 0.198279, 1e-5],
    /* ---------- futures ---------- */
    ['Gold futures tick value 0.10 x 100 oz = 10', (C) => C.tickValue(0.1, 100), 10, 1e-12],
    ['Wheat tick value 0.25 c/bu x 5,000 bu = USD 12.50', (C) => C.tickValue(0.0025, 5000), 12.5, 1e-9],
    ['Raw sugar tick 0.01 c/lb x 112,000 lb = USD 11.20', (C) => C.tickValue(0.0001, 112000), 11.2, 1e-9],
    ['Long 2 gold contracts 2,000 -> 2,010 = +2,000', (C) => C.futuresPnL('long', 2000, 2010, 2, 100), 2000, 1e-9],
    ['Short 3 wheat contracts 6.00 -> 6.20 $/bu = -3,000', (C) => C.futuresPnL('short', 6.0, 6.2, 3, 5000), -3000, 1e-6],
    ['Buy fill: mid 100, 2-tick spread, 1-tick slippage, tick 0.1 = 100.2', (C) => C.fillPrice(100, 'buy', 2, 1, 0.1), 100.2, 1e-9],
    ['Position size: 100,000 equity, 1% risk, 20 stop x 100 oz = 0 contracts', (C) => C.positionSize(100000, 1, 2000, 1980, 100), 0, 0],
    ['Position size: 500,000 equity, 1% risk, 20 stop x 100 oz = 2 contracts', (C) => C.positionSize(500000, 1, 2000, 1980, 100), 2, 0],
    ['Margin call when equity below maintenance', (C) => (C.marginStatus(9000, 12000, 10000).call ? 1 : 0), 1, 0],
    /* ---------- options (Black-76) ---------- */
    ['ATM call F=K=100, T=1, r=0, vol 20% = 7.9656', (C) => C.black76(100, 100, 1, 0, 0.2, 'call').price, 7.96557, 1e-4],
    ['Put-call parity: C - P = e^-rT (F-K)', (C) => { const c = C.black76(105, 100, 0.5, 0.05, 0.25, 'call').price, p = C.black76(105, 100, 0.5, 0.05, 0.25, 'put').price; return c - p; }, Math.exp(-0.025) * 5, 1e-6],
    ['ATM call delta (r=0) = N(d1) = 0.5398', (C) => C.black76(100, 100, 1, 0, 0.2, 'call').delta, 0.539828, 1e-5],
    ['Expired put intrinsic value', (C) => C.black76(90, 100, 0, 0.05, 0.2, 'put').price, 10, 1e-12],
    ['Long call payoff at expiry: K 100, prem 5, F 112 = 7', (C) => C.optionPayoff('call', 'long', 100, 5, 112), 7, 1e-12],
    /* ---------- statistics ---------- */
    ['Mean of 1,2,3,4 = 2.5', (C) => C.mean([1, 2, 3, 4]), 2.5, 1e-12],
    ['Sample variance of 1,2,3,4 = 1.6667', (C) => C.variance([1, 2, 3, 4]), 1.666667, 1e-6],
    ['Simple return 100 -> 110 = 10%', (C) => C.returns([100, 110])[0], 0.1, 1e-12],
    ['Log return 100 -> 110 = 9.531%', (C) => C.logReturns([100, 110])[0], 0.0953102, 1e-7],
    ['Perfect correlation = 1', (C) => C.correlation([1, 2, 3, 4], [2, 4, 6, 8]), 1, 1e-12],
    ['Regression slope y = 3x + 1', (C) => C.linearRegression([1, 2, 3, 4], [4, 7, 10, 13]).slope, 3, 1e-12],
    ['Max drawdown 100,120,90,130 = -25%', (C) => C.maxDrawdown([100, 120, 90, 130]), -0.25, 1e-12],
    ['RSI of a steadily rising series = 100', (C) => C.rsi([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16])[15], 100, 1e-9],
    ['SMA(3) of 1..5 last = 4', (C) => C.sma([1, 2, 3, 4, 5], 3)[4], 4, 1e-12],
    ['Inverse normal 95% = 1.64485', (C) => C.invNorm(0.95), 1.644854, 1e-5],
    ['Inverse normal 99% = 2.32635', (C) => C.invNorm(0.99), 2.326348, 1e-5],
    ['Two uncorrelated 20% vol assets 50/50 = 14.14% vol', (C) => C.portfolioVol([0.5, 0.5], [0.2, 0.2], [[1, 0], [0, 1]]), 0.1414214, 1e-6],
    ['Seeded RNG is reproducible', (C) => { const a = C.rng(42), b = C.rng(42); return a() - b(); }, 0, 0],
    /* ---------- shipping, hedging, arbitrage, balances ---------- */
    ['Laytime: 30,000 t at 10,000 t/day, 5 days used -> demurrage 40,000 at 20,000/day', (C) => C.laytime({ qty: 30000, rateTPerDay: 10000, timeUsedDays: 5, demurragePerDay: 20000 }).demurrage, 40000, 1e-9],
    ['Despatch defaults to half demurrage: 1 day saved = 10,000', (C) => C.laytime({ qty: 30000, rateTPerDay: 10000, timeUsedDays: 2, demurragePerDay: 20000 }).despatch, 10000, 1e-9],
    ['Short hedge: physical -50,000, futures +45,000 -> net -5,000 (basis weakened)', (C) => C.hedgeOutcome({ qty: 5000, spot0: 240, spot1: 230, fut0: 250, fut1: 241 }).net, -5000, 1e-9],
    ['Hedge contracts: 5,000 t wheat / 136.08 t per contract = 37', (C) => C.contractsForHedge(5000, C.convertMass(5000, 'bu_wheat', 't')), 37, 0],
    ['Arbitrage: apparent 40/t becomes 8.38/t after costs (225 x 1.1 x 0.2% ins, 225 x 6% x 30/360 fin)', (C) => C.arbitrage({ originPrice: 200, destPrice: 240, freight: 25, insurancePct: 0.2, dutyPct: 0, handling: 5, financeRatePct: 6, days: 30 }).marginPerT, 8.38, 1e-6],
    ['S&D: ending stocks', (C) => C.balance({ beginning: 20, production: 100, imports: 10, consumption: 95, exports: 12 }).ending, 23, 1e-12],
    ['S&D: stocks-to-use = 23 / 107 = 21.50%', (C) => C.balance({ beginning: 20, production: 100, imports: 10, consumption: 95, exports: 12 }).stocksToUse, 21.4953, 1e-4],
    ['Cash timeline minimum (profitable deal, negative cash)', (C) => C.cashTimeline([{ day: 0, amount: -1000 }, { day: 10, amount: -100 }, { day: 60, amount: 1200 }], 60).min, -1100, 0],
    ['Gold carry: 2,000 spot, 5% rate, 1% lease, 90 days = 2,020', (C) => C.carryForward({ spot: 2000, ratePct: 5, leasePct: 1, days: 90 }), 2020, 1e-9],
    ['Refining margin: white 550, raw 18 c/lb, 1.06 raw per white, cost 60 = 69.36', (C) => C.refiningMargin({ whiteUsdPerT: 550, rawCentsPerLb: 18, rawPerWhite: 1.06, refiningCostPerT: 60 }), 69.358, 1e-2],
  ];
  const DEAL = { qty: 10000, buyTerm: 'FOB', buyPrice: 250, freight: 30, insurancePct: 0.1, inspection: 5000, portCharges: 5, financeRatePct: 6, financeDays: 60, sellPrice: 300 };

  function run(C) {
    return CASES.map(([name, fn, expected, tol]) => {
      let got, err = null;
      try { got = fn(C); } catch (e) { err = e.message; }
      const pass = !err && Math.abs(got - expected) <= tol + 1e-12;
      return { name, expected, got, pass, err };
    });
  }

  if (typeof module !== 'undefined' && module.exports) {
    const C = require('../js/calc.js');
    const res = run(C);
    let fail = 0;
    res.forEach((r) => {
      if (!r.pass) fail++;
      console.log((r.pass ? 'PASS ' : 'FAIL ') + r.name + (r.pass ? '' : `  expected ${r.expected}, got ${r.got}${r.err ? ' (' + r.err + ')' : ''}`));
    });
    console.log(`\n${res.length - fail}/${res.length} calculation tests passed`);
    if (fail) process.exitCode = 1;
  } else {
    root.CTA_TESTS = { run, count: CASES.length };
  }
})(typeof window !== 'undefined' ? window : globalThis);
