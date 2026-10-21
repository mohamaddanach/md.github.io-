/* Commodity Trading Academy — calculation library
 * Pure functions only (no DOM). Loaded by the browser as window.CALC and by Node
 * (tests/calc.test.js) through module.exports.
 *
 * Internal conventions
 *  - Mass is held in kilograms internally; display units are converted at the edges.
 *  - "t" always means metric ton (1,000 kg). Short ton = "st", long ton = "lt".
 *  - "ozt" is the troy ounce (31.1034768 g). "oz" is the avoirdupois ounce (28.349523125 g).
 *  - Money amounts are plain numbers in the currency the caller chose; FX rates are
 *    expressed as "units of currency per 1 USD".
 *  - Interest uses simple interest with a configurable day-count basis (default ACT/360).
 */
(function (root) {
  'use strict';
  const C = {};

  /* ------------------------------------------------------------------ units */
  const KG = {
    g: 0.001,
    kg: 1,
    t: 1000,
    ozt: 0.0311034768,
    oz: 0.028349523125,
    lb: 0.45359237,
    st: 907.18474,
    lt: 1016.0469088,
    bu_wheat: 60 * 0.45359237, // a bushel of wheat is defined by weight: 60 lb
  };
  C.UNITS = KG;
  C.UNIT_LABELS = {
    g: 'gram (g)', kg: 'kilogram (kg)', t: 'metric ton (t)', ozt: 'troy ounce (ozt)', oz: 'avoirdupois ounce (oz)',
    lb: 'pound (lb)', st: 'short ton (2,000 lb)', lt: 'long ton (2,240 lb)', bu_wheat: 'bushel of wheat (60 lb)',
  };
  C.convertMass = function (value, from, to) {
    if (!(from in KG) || !(to in KG)) throw new Error('Unknown unit ' + from + '/' + to);
    return (Number(value) * KG[from]) / KG[to];
  };
  /* price per unit conversion: a price per "from" unit expressed per "to" unit */
  C.convertPricePerUnit = function (price, fromUnit, toUnit) {
    return (Number(price) * KG[toUnit]) / KG[fromUnit];
  };
  C.centsPerLbToUsdPerT = (c) => C.convertPricePerUnit(c / 100, 'lb', 't');
  C.usdPerTToCentsPerLb = (p) => C.convertPricePerUnit(p, 't', 'lb') * 100;
  C.centsPerBuToUsdPerT = (c) => C.convertPricePerUnit(c / 100, 'bu_wheat', 't');
  C.usdPerTToCentsPerBu = (p) => C.convertPricePerUnit(p, 't', 'bu_wheat') * 100;
  C.usdPerStToUsdPerT = (p) => C.convertPricePerUnit(p, 'st', 't');

  /* ------------------------------------------------------------------- gold */
  C.karatToFineness = (k) => Number(k) / 24;
  /* fine troy ounces contained in a gross weight at a given fineness (0-1) */
  C.fineOunces = function (grossWeight, unit, fineness) {
    return C.convertMass(grossWeight, unit, 'ozt') * Number(fineness);
  };
  C.goldValue = function ({ grossWeight, unit = 'g', fineness = 0.9999, spotPerOzt, premiumPerOzt = 0 }) {
    const fine = C.fineOunces(grossWeight, unit, fineness);
    return { fineOz: fine, value: fine * (Number(spotPerOzt) + Number(premiumPerOzt)) };
  };

  /* ------------------------------------------------------------------ steel */
  C.STEEL_DENSITY = 7850; // kg/m3, typical carbon steel (approximation)
  /* theoretical rebar mass per metre: pi/4 * d^2 * density ; d in mm -> kg/m (≈ d²/162.2) */
  C.rebarKgPerM = (dMm) => (Math.PI / 4) * Math.pow(dMm / 1000, 2) * C.STEEL_DENSITY;
  /* plate / sheet: thickness mm, width mm, length mm -> kg */
  C.plateKg = (tMm, wMm, lMm) => (tMm / 1000) * (wMm / 1000) * (lMm / 1000) * C.STEEL_DENSITY;

  /* ------------------------------------------------------------------ grain */
  /* water-removal shrink: % of weight lost when drying from m0 to m1 (wet basis) */
  C.moistureShrinkPct = (m0, m1) => (m0 <= m1 ? 0 : ((m0 - m1) / (100 - m1)) * 100);
  C.dryWeight = (w, m0, m1) => w * (1 - C.moistureShrinkPct(m0, m1) / 100);

  /* ------------------------------------------------------------------ sugar */
  C.whitePremium = (whiteUsdPerT, rawCentsPerLb) => whiteUsdPerT - C.centsPerLbToUsdPerT(rawCentsPerLb);
  /* simplified refining margin per tonne of white sugar */
  C.refiningMargin = function ({ whiteUsdPerT, rawCentsPerLb, rawPerWhite = 1.06, refiningCostPerT = 0, freightRawPerT = 0 }) {
    const raw = C.centsPerLbToUsdPerT(rawCentsPerLb);
    return whiteUsdPerT - (raw + freightRawPerT) * rawPerWhite - refiningCostPerT;
  };

  /* -------------------------------------------------------------------- fx */
  C.fx = function (amount, from, to, rates) {
    if (from === to) return Number(amount);
    const rf = rates[from], rt = rates[to];
    if (!rf || !rt) throw new Error('Missing FX rate ' + from + '/' + to);
    return (Number(amount) / rf) * rt;
  };

  /* -------------------------------------------------------------- generic */
  C.round = (n, d = 2) => { const f = Math.pow(10, d); return Math.round((Number(n) + Number.EPSILON) * f) / f; };
  C.pctChange = (a, b) => (a === 0 ? NaN : ((b - a) / a) * 100);
  C.interest = (principal, annualRatePct, days, basis = 360) => (Number(principal) * Number(annualRatePct) / 100 * Number(days)) / basis;
  C.within = (value, expected, tolAbs, tolRel) => {
    const diff = Math.abs(Number(value) - Number(expected));
    return diff <= (tolAbs || 0) || (tolRel != null && diff <= Math.abs(expected) * tolRel);
  };

  /* --------------------------------------------------------- landed cost
   * Every cost line is declared once with a unit:
   *   per_t  : amount per metric ton x quantity
   *   lump   : flat amount for the shipment
   * Items that the purchase Incoterm already includes in the price are excluded
   * (they are listed in `included`) so the same cost cannot be counted twice.
   */
  C.INCOTERM_INCLUDES = {
    EXW: [],
    FCA: ['inlandOrigin', 'exportCharges'],
    FAS: ['inlandOrigin', 'exportCharges'],
    FOB: ['inlandOrigin', 'exportCharges', 'loading'],
    CFR: ['inlandOrigin', 'exportCharges', 'loading', 'freight'],
    CIF: ['inlandOrigin', 'exportCharges', 'loading', 'freight', 'insurance'],
    CPT: ['inlandOrigin', 'exportCharges', 'loading', 'freight'],
    CIP: ['inlandOrigin', 'exportCharges', 'loading', 'freight', 'insurance'],
    DAP: ['inlandOrigin', 'exportCharges', 'loading', 'freight', 'insurance', 'portCharges', 'inlandDest'],
    DPU: ['inlandOrigin', 'exportCharges', 'loading', 'freight', 'insurance', 'portCharges', 'inlandDest', 'unloading'],
    DDP: ['inlandOrigin', 'exportCharges', 'loading', 'freight', 'insurance', 'portCharges', 'inlandDest', 'unloading', 'duty'],
  };
  C.COST_LINES = [
    ['inlandOrigin', 'Inland transport at origin', 'per_t'],
    ['loading', 'Loading / FOBbing expenses', 'per_t'],
    ['exportCharges', 'Export charges & origin fees', 'per_t'],
    ['freight', 'Ocean freight', 'per_t'],
    ['insurance', 'Cargo insurance', 'calc'],
    ['inspection', 'Inspection, sampling & analysis', 'lump'],
    ['duty', 'Import duty', 'calc'],
    ['otherTaxes', 'Other non-recoverable import taxes', 'calc'],
    ['portCharges', 'Destination port charges', 'per_t'],
    ['unloading', 'Discharge / unloading', 'per_t'],
    ['inlandDest', 'Inland transport at destination', 'per_t'],
    ['otherCosts', 'Other deal costs', 'lump'],
    ['financing', 'Financing cost (purchase to collection)', 'calc'],
  ];

  C.landedCost = function (i) {
    const q = Number(i.qty) || 0;
    const inc = C.INCOTERM_INCLUDES[i.buyTerm || 'FOB'] || [];
    const has = (k) => !inc.includes(k);
    const v = (k) => (has(k) ? Number(i[k]) || 0 : 0);
    const goods = q * (Number(i.buyPrice) || 0);
    const lines = {};
    lines.inlandOrigin = v('inlandOrigin') * q;
    lines.loading = v('loading') * q;
    lines.exportCharges = v('exportCharges') * q;
    lines.freight = v('freight') * q;
    const insuredBase = goods + (has('freight') ? lines.freight : 0) + lines.loading + lines.inlandOrigin + lines.exportCharges;
    const insuredValue = insuredBase * (1 + (Number(i.insuredUpliftPct == null ? 10 : i.insuredUpliftPct) / 100));
    lines.insurance = has('insurance') ? insuredValue * (Number(i.insurancePct) || 0) / 100 : 0;
    lines.inspection = Number(i.inspection) || 0;
    // customs value: CIF basis by default (FOB basis is used in some jurisdictions)
    const fobValue = goods + lines.inlandOrigin + lines.loading + lines.exportCharges;
    const cifValue = goods + lines.inlandOrigin + lines.loading + lines.exportCharges + lines.freight + lines.insurance;
    // when the purchase term already includes freight/insurance the goods price is itself a CFR/CIF value
    const customsValue = i.dutyBase === 'FOB' ? fobValue : cifValue;
    lines.duty = has('duty') ? customsValue * (Number(i.dutyPct) || 0) / 100 : 0;
    lines.otherTaxes = has('duty') ? (customsValue + lines.duty) * (Number(i.otherTaxesPct) || 0) / 100 : 0;
    lines.portCharges = v('portCharges') * q;
    lines.unloading = v('unloading') * q;
    lines.inlandDest = v('inlandDest') * q;
    lines.otherCosts = Number(i.otherCosts) || 0;
    const beforeFin = goods + Object.values(lines).reduce((a, b) => a + b, 0);
    const finBase = i.financeBase === 'goods' ? goods : beforeFin;
    lines.financing = C.interest(finBase * ((i.financedPct == null ? 100 : Number(i.financedPct)) / 100), Number(i.financeRatePct) || 0, Number(i.financeDays) || 0, i.dayBasis || 360);
    const total = beforeFin + lines.financing;
    return {
      qty: q, goods, lines, included: inc, insuredValue, customsValue, fobValue, cifValue,
      totalBeforeFinancing: beforeFin, total, perT: q ? total / q : 0, perTBeforeFinancing: q ? beforeFin / q : 0,
    };
  };

  /* ------------------------------------------------------------- deal P&L
   * net sales revenue - total landed cost - selling expenses - extra financing - other = net profit
   */
  C.dealPnL = function (i) {
    const lc = C.landedCost(i);
    const qSold = i.qtySold != null ? Number(i.qtySold) : lc.qty;
    const gross = qSold * (Number(i.sellPrice) || 0);
    const commission = gross * (Number(i.commissionPct) || 0) / 100;
    const discounts = gross * (Number(i.discountPct) || 0) / 100;
    const netRevenue = gross - commission - discounts;
    const sellingExp = (Number(i.sellingPerT) || 0) * qSold + (Number(i.sellingLump) || 0);
    const extraFin = Number(i.extraFinancing) || 0;
    const other = Number(i.otherDealExp) || 0;
    const grossMargin = netRevenue - lc.totalBeforeFinancing;
    const netProfit = netRevenue - lc.total - sellingExp - extraFin - other;
    const fixedOut = lc.total + sellingExp + extraFin + other;
    const pctTake = ((Number(i.commissionPct) || 0) + (Number(i.discountPct) || 0)) / 100;
    const breakEven = qSold > 0 && pctTake < 1 ? fixedOut / (qSold * (1 - pctTake)) : NaN;
    // working capital: cash paid before the buyer pays, less buyer advance and supplier credit
    const advance = gross * (Number(i.buyerAdvancePct) || 0) / 100;
    const supplierCredit = lc.goods * (Number(i.supplierCreditPct) || 0) / 100;
    const wc = Math.max(0, lc.totalBeforeFinancing - advance - supplierCredit);
    const bankFunded = wc * (Number(i.bankFundedPct) || 0) / 100;
    const equity = wc - bankFunded;
    const cycleDays = Number(i.financeDays) || 0;
    const roic = equity > 0 ? netProfit / equity : NaN;
    const roicAnnual = equity > 0 && cycleDays > 0 ? roic * 365 / cycleDays : NaN;
    // stress: buyer default -> resale at a discount; plus adverse costs
    const resaleDiscount = Number(i.stressResaleDiscountPct) || 0;
    const adverseExtra = (Number(i.stressFreightPct) || 0) / 100 * lc.lines.freight + (Number(i.stressDelayDays) || 0) * (Number(i.demurragePerDay) || 0);
    const defaultLoss = lc.total + adverseExtra - qSold * (Number(i.sellPrice) || 0) * (1 - resaleDiscount / 100) + sellingExp + other;
    const stressProfit = netRevenue * (1 - (Number(i.stressPricePct) || 0) / 100) - lc.total - adverseExtra - sellingExp - extraFin - other;
    return {
      landed: lc, qtySold: qSold, grossRevenue: gross, commission, discounts, netRevenue, sellingExp, extraFin, other,
      grossMargin, grossMarginPct: netRevenue ? grossMargin / netRevenue * 100 : NaN,
      netProfit, netMarginPct: netRevenue ? netProfit / netRevenue * 100 : NaN,
      perTSell: Number(i.sellPrice) || 0, perTCost: lc.perT, profitPerT: qSold ? netProfit / qSold : 0,
      breakEven, workingCapital: wc, bankFunded, equity, roic, roicAnnual,
      maxLossBuyerDefault: Math.max(0, defaultLoss), stressProfit,
      maxPotentialLoss: Math.max(0, -stressProfit, defaultLoss),
    };
  };

  /* ---------------------------------------------------- futures & margin */
  C.tickValue = (tickSize, multiplier) => tickSize * multiplier;
  C.futuresPnL = (side, entry, exit, contracts, multiplier) => (side === 'long' ? 1 : -1) * (exit - entry) * contracts * multiplier;
  C.notional = (price, contracts, multiplier) => price * contracts * multiplier;
  C.leverage = (notional, equity) => (equity > 0 ? notional / equity : Infinity);
  /* fill price including half-spread and slippage, in price units */
  C.fillPrice = (mid, side, spreadTicks, slippageTicks, tick) => {
    const adj = (spreadTicks / 2 + slippageTicks) * tick;
    return side === 'buy' ? mid + adj : mid - adj;
  };
  C.marginStatus = (equity, initialReq, maintReq) => {
    if (equity < maintReq) return { call: true, deficit: initialReq - equity }; // restore to initial margin
    return { call: false, deficit: 0, free: equity - initialReq };
  };
  C.riskPerTrade = (entry, stop, contracts, multiplier) => Math.abs(entry - stop) * contracts * multiplier;
  C.positionSize = (equity, riskPct, entry, stop, multiplier) => {
    const perContract = Math.abs(entry - stop) * multiplier;
    return perContract > 0 ? Math.floor((equity * riskPct / 100) / perContract) : 0;
  };

  /* ------------------------------------------------------ normal & options */
  C.normCdf = function (x) {
    // W. J. Cody style rational approximation via erf (|err| < 1.2e-7)
    const t = 1 / (1 + 0.5 * Math.abs(x) / Math.SQRT2);
    const y = 1 - t * Math.exp(-(x * x) / 2 - 1.26551223 + t * (1.00002368 + t * (0.37409196 + t * (0.09678418 + t * (-0.18628806 +
      t * (0.27886807 + t * (-1.13520398 + t * (1.48851587 + t * (-0.82215223 + t * 0.17087277)))))))));
    return x >= 0 ? (1 + y) / 2 : (1 - y) / 2;
  };
  C.normPdf = (x) => Math.exp(-x * x / 2) / Math.sqrt(2 * Math.PI);
  /* Black-76 for European options on futures. T in years, r and sigma decimals. */
  C.black76 = function (F, K, T, r, sigma, type) {
    const df = Math.exp(-r * T);
    if (T <= 0 || sigma <= 0) {
      const iv = type === 'call' ? Math.max(F - K, 0) : Math.max(K - F, 0);
      return { price: iv * (T <= 0 ? 1 : df), delta: type === 'call' ? (F > K ? 1 : 0) : (F < K ? -1 : 0), gamma: 0, vega: 0, theta: 0, intrinsic: iv, timeValue: 0 };
    }
    const sT = sigma * Math.sqrt(T);
    const d1 = (Math.log(F / K) + 0.5 * sigma * sigma * T) / sT;
    const d2 = d1 - sT;
    let price, delta;
    if (type === 'call') { price = df * (F * C.normCdf(d1) - K * C.normCdf(d2)); delta = df * C.normCdf(d1); }
    else { price = df * (K * C.normCdf(-d2) - F * C.normCdf(-d1)); delta = -df * C.normCdf(-d1); }
    const gamma = df * C.normPdf(d1) / (F * sT);
    const vega = df * F * C.normPdf(d1) * Math.sqrt(T) / 100; // per 1 volatility point
    const thetaYr = -df * F * C.normPdf(d1) * sigma / (2 * Math.sqrt(T)) + r * price;
    const intrinsic = type === 'call' ? Math.max(F - K, 0) : Math.max(K - F, 0);
    return { price, delta, gamma, vega, theta: thetaYr / 365, intrinsic, timeValue: price - intrinsic * df, d1, d2 };
  };
  C.optionPayoff = (type, side, K, premium, F) => {
    const iv = type === 'call' ? Math.max(F - K, 0) : Math.max(K - F, 0);
    return (side === 'long' ? 1 : -1) * (iv - premium);
  };

  /* --------------------------------------------------------------- stats */
  C.sum = (a) => a.reduce((s, x) => s + x, 0);
  C.mean = (a) => (a.length ? C.sum(a) / a.length : NaN);
  C.variance = (a, sample = true) => {
    if (a.length < 2) return NaN;
    const m = C.mean(a);
    return C.sum(a.map((x) => (x - m) * (x - m))) / (a.length - (sample ? 1 : 0));
  };
  C.stdev = (a, sample = true) => Math.sqrt(C.variance(a, sample));
  C.returns = (p) => p.slice(1).map((x, i) => x / p[i] - 1);
  C.logReturns = (p) => p.slice(1).map((x, i) => Math.log(x / p[i]));
  C.annualizedVol = (rets, periods = 252) => C.stdev(rets) * Math.sqrt(periods);
  C.covariance = (a, b) => {
    const n = Math.min(a.length, b.length); if (n < 2) return NaN;
    const ma = C.mean(a.slice(0, n)), mb = C.mean(b.slice(0, n));
    let s = 0; for (let i = 0; i < n; i++) s += (a[i] - ma) * (b[i] - mb);
    return s / (n - 1);
  };
  C.correlation = (a, b) => C.covariance(a, b) / (C.stdev(a.slice(0, Math.min(a.length, b.length))) * C.stdev(b.slice(0, Math.min(a.length, b.length))));
  C.linearRegression = (x, y) => {
    const n = Math.min(x.length, y.length);
    const mx = C.mean(x.slice(0, n)), my = C.mean(y.slice(0, n));
    let sxy = 0, sxx = 0, syy = 0;
    for (let i = 0; i < n; i++) { sxy += (x[i] - mx) * (y[i] - my); sxx += (x[i] - mx) ** 2; syy += (y[i] - my) ** 2; }
    const slope = sxy / sxx, intercept = my - slope * mx;
    return { slope, intercept, r2: (sxy * sxy) / (sxx * syy), n };
  };
  C.sma = (a, n) => a.map((_, i) => (i < n - 1 ? null : C.mean(a.slice(i - n + 1, i + 1))));
  C.ema = (a, n) => {
    const k = 2 / (n + 1); const out = []; let prev = null;
    a.forEach((x, i) => {
      if (i < n - 1) { out.push(null); return; }
      if (prev === null) prev = C.mean(a.slice(0, n)); else prev = x * k + prev * (1 - k);
      out.push(prev);
    });
    return out;
  };
  C.rollingStdev = (a, n) => a.map((_, i) => (i < n - 1 ? null : C.stdev(a.slice(i - n + 1, i + 1))));
  /* Wilder RSI */
  C.rsi = (p, n = 14) => {
    const out = new Array(p.length).fill(null);
    if (p.length <= n) return out;
    let g = 0, l = 0;
    for (let i = 1; i <= n; i++) { const d = p[i] - p[i - 1]; if (d > 0) g += d; else l -= d; }
    let ag = g / n, al = l / n;
    out[n] = al === 0 ? 100 : 100 - 100 / (1 + ag / al);
    for (let i = n + 1; i < p.length; i++) {
      const d = p[i] - p[i - 1];
      ag = (ag * (n - 1) + Math.max(d, 0)) / n; al = (al * (n - 1) + Math.max(-d, 0)) / n;
      out[i] = al === 0 ? 100 : 100 - 100 / (1 + ag / al);
    }
    return out;
  };
  C.macd = (p, fast = 12, slow = 26, sig = 9) => {
    const ef = C.ema(p, fast), es = C.ema(p, slow);
    const line = p.map((_, i) => (ef[i] == null || es[i] == null ? null : ef[i] - es[i]));
    const firstIdx = line.findIndex((x) => x != null);
    const sigRaw = firstIdx < 0 ? [] : C.ema(line.slice(firstIdx), sig);
    const signal = line.map((_, i) => (i < firstIdx ? null : sigRaw[i - firstIdx]));
    const hist = line.map((x, i) => (x == null || signal[i] == null ? null : x - signal[i]));
    return { line, signal, hist };
  };
  C.bollinger = (p, n = 20, k = 2) => {
    const m = C.sma(p, n), s = p.map((_, i) => (i < n - 1 ? null : C.stdev(p.slice(i - n + 1, i + 1), false)));
    return { mid: m, upper: m.map((x, i) => (x == null ? null : x + k * s[i])), lower: m.map((x, i) => (x == null ? null : x - k * s[i])) };
  };
  C.drawdownSeries = (equity) => { let peak = -Infinity; return equity.map((e) => { peak = Math.max(peak, e); return peak > 0 ? (e - peak) / peak : 0; }); };
  C.maxDrawdown = (equity) => Math.min(0, ...C.drawdownSeries(equity));
  C.percentile = (a, p) => {
    if (!a.length) return NaN;
    const s = [...a].sort((x, y) => x - y);
    const idx = (s.length - 1) * p; const lo = Math.floor(idx), hi = Math.ceil(idx);
    return s[lo] + (s[hi] - s[lo]) * (idx - lo);
  };
  /* VaR returned as a positive loss amount for a position of `value` */
  C.historicalVaR = (rets, conf, value) => -C.percentile(rets, 1 - conf) * value;
  C.parametricVaR = (rets, conf, value) => {
    const z = C.invNorm(conf);
    return (z * C.stdev(rets) - C.mean(rets)) * value;
  };
  C.expectedShortfall = (rets, conf, value) => {
    const cut = C.percentile(rets, 1 - conf);
    const tail = rets.filter((r) => r <= cut);
    return tail.length ? -C.mean(tail) * value : NaN;
  };
  /* Acklam inverse normal approximation */
  C.invNorm = function (p) {
    const a = [-39.69683028665376, 220.9460984245205, -275.9285104469687, 138.357751867269, -30.66479806614716, 2.506628277459239];
    const b = [-54.47609879822406, 161.5858368580409, -155.6989798598866, 66.80131188771972, -13.28068155288572];
    const c = [-0.007784894002430293, -0.3223964580411365, -2.400758277161838, -2.549732539343734, 4.374664141464968, 2.938163982698783];
    const d = [0.007784695709041462, 0.3224671290700398, 2.445134137142996, 3.754408661907416];
    const pl = 0.02425;
    let q, r;
    if (p < pl) { q = Math.sqrt(-2 * Math.log(p)); return (((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) / ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1); }
    if (p > 1 - pl) { q = Math.sqrt(-2 * Math.log(1 - p)); return -(((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) / ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1); }
    q = p - 0.5; r = q * q;
    return (((((a[0] * r + a[1]) * r + a[2]) * r + a[3]) * r + a[4]) * r + a[5]) * q / (((((b[0] * r + b[1]) * r + b[2]) * r + b[3]) * r + b[4]) * r + 1);
  };
  C.portfolioVol = (weights, vols, corr) => {
    let v = 0;
    for (let i = 0; i < weights.length; i++) for (let j = 0; j < weights.length; j++) v += weights[i] * weights[j] * vols[i] * vols[j] * corr[i][j];
    return Math.sqrt(Math.max(v, 0));
  };

  /* ---------------------------------------------------------- random & sim */
  C.rng = function (seed) {
    let a = (Number(seed) >>> 0) || 1;
    const next = () => { a |= 0; a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
    let spare = null;
    next.normal = () => {
      if (spare !== null) { const s = spare; spare = null; return s; }
      let u = 0, v = 0; while (u === 0) u = next(); while (v === 0) v = next();
      const m = Math.sqrt(-2 * Math.log(u)); spare = m * Math.sin(2 * Math.PI * v); return m * Math.cos(2 * Math.PI * v);
    };
    next.range = (lo, hi) => lo + (hi - lo) * next();
    next.int = (lo, hi) => Math.floor(lo + (hi - lo + 1) * next());
    next.pick = (arr) => arr[Math.floor(next() * arr.length)];
    return next;
  };
  /* Price model: geometric Brownian motion (daily steps, 252/yr) with scheduled regime
   * changes (drift, volatility) and one-off jumps. Each day yields OHLC + volume.
   * events: [{day, drift?, vol?, jumpPct?}] — drift & vol are annualized decimals.
   */
  C.simulateOHLC = function ({ start, days, drift = 0, vol = 0.2, seed = 1, events = [], baseVolume = 1000 }) {
    const r = C.rng(seed); const dt = 1 / 252; const sub = 4;
    let mu = drift, sg = vol, p = start; const out = [];
    for (let d = 0; d < days; d++) {
      events.filter((e) => e.day === d).forEach((e) => { if (e.drift != null) mu = e.drift; if (e.vol != null) sg = e.vol; if (e.jumpPct) p = p * (1 + e.jumpPct / 100); });
      const o = p; let h = o, l = o;
      for (let k = 0; k < sub; k++) {
        p = p * Math.exp((mu - 0.5 * sg * sg) * dt / sub + sg * Math.sqrt(dt / sub) * r.normal());
        h = Math.max(h, p); l = Math.min(l, p);
      }
      const move = Math.abs(p - o) / o;
      out.push({ d, o, h, l, c: p, v: Math.round(baseVolume * (0.7 + 0.6 * r() + move * 40)) });
    }
    return out;
  };
  C.monteCarloGBM = function ({ s0, mu, sigma, days, paths, seed = 7 }) {
    const r = C.rng(seed); const dt = 1 / 252; const terminal = []; const sample = [];
    for (let k = 0; k < paths; k++) {
      let s = s0; const path = k < 30 ? [s] : null;
      for (let t = 0; t < days; t++) { s *= Math.exp((mu - 0.5 * sigma * sigma) * dt + sigma * Math.sqrt(dt) * r.normal()); if (path) path.push(s); }
      terminal.push(s); if (path) sample.push(path);
    }
    return { terminal, sample };
  };

  /* -------------------------------------------------------------- shipping */
  C.laytime = function ({ qty, rateTPerDay, timeUsedDays, demurragePerDay, despatchPerDay }) {
    const allowed = rateTPerDay > 0 ? qty / rateTPerDay : 0;
    const diff = timeUsedDays - allowed;
    return { allowed, diff, demurrage: diff > 0 ? diff * demurragePerDay : 0, despatch: diff < 0 ? -diff * (despatchPerDay == null ? demurragePerDay / 2 : despatchPerDay) : 0 };
  };
  C.shippingCost = function (i) {
    const q = Number(i.qty) || 0;
    const freight = q * (Number(i.freightPerT) || 0);
    const loading = q * (Number(i.loadingPerT) || 0);
    const discharge = q * (Number(i.dischargePerT) || 0);
    const port = Number(i.portCharges) || 0;
    const insurance = (Number(i.cargoValue) || 0) * 1.1 * (Number(i.insurancePct) || 0) / 100;
    const demurrage = (Number(i.demurrageDays) || 0) * (Number(i.demurragePerDay) || 0);
    const financing = C.interest(Number(i.cargoValue) || 0, Number(i.financeRatePct) || 0, Number(i.transitDays) || 0);
    const total = freight + loading + discharge + port + insurance + demurrage + financing;
    return { freight, loading, discharge, port, insurance, demurrage, financing, total, perT: q ? total / q : 0 };
  };

  /* --------------------------------------------------------------- hedging */
  C.hedgeOutcome = function ({ qty, spot0, spot1, fut0, fut1, hedgeRatio = 1, side = 'short' }) {
    const physical = qty * (spot1 - spot0);
    const futQty = qty * hedgeRatio;
    const futures = (side === 'short' ? -1 : 1) * futQty * (fut1 - fut0);
    return { physical, futures, net: physical + futures, basis0: spot0 - fut0, basis1: spot1 - fut1, basisChange: (spot1 - fut1) - (spot0 - fut0) };
  };
  C.contractsForHedge = (exposureUnits, contractSizeUnits, hedgeRatio = 1) => Math.round(exposureUnits * hedgeRatio / contractSizeUnits);
  C.minVarianceHedgeRatio = (corr, sdSpot, sdFut) => corr * sdSpot / sdFut;
  /* cost of carry fair forward: spot + storage + financing - convenience/lease income */
  C.carryForward = ({ spot, ratePct, days, storagePerUnitPerMonth = 0, insurancePct = 0, leasePct = 0 }) =>
    spot * (1 + (ratePct - leasePct) / 100 * days / 360 + insurancePct / 100 * days / 360) + storagePerUnitPerMonth * days / 30;

  /* -------------------------------------------------------------- arbitrage */
  C.arbitrage = function (i) {
    const q = Number(i.qty) || 1;
    const originInDest = C.fx(Number(i.originPrice) || 0, i.originCcy || 'USD', i.destCcy || 'USD', i.rates || { USD: 1 });
    const freight = Number(i.freight) || 0, handling = Number(i.handling) || 0;
    const insurance = (originInDest + freight) * 1.1 * (Number(i.insurancePct) || 0) / 100;
    const duty = (originInDest + freight + insurance) * (Number(i.dutyPct) || 0) / 100;
    const qualityAdj = Number(i.qualityAdj) || 0;
    const financing = C.interest(originInDest + freight, Number(i.financeRatePct) || 0, Number(i.days) || 0);
    const delivered = originInDest + freight + insurance + duty + handling + financing + qualityAdj;
    const margin = (Number(i.destPrice) || 0) - delivered;
    const apparent = (Number(i.destPrice) || 0) - originInDest;
    return { originInDest, freight, insurance, duty, handling, financing, qualityAdj, delivered, marginPerT: margin, total: margin * q, apparent, costsShare: apparent ? (apparent - margin) / apparent : NaN };
  };

  /* ---------------------------------------------------- supply & demand */
  C.balance = function ({ beginning, production, imports, consumption, exports }) {
    const supply = beginning + production + imports;
    const use = consumption + exports;
    const ending = supply - use;
    return { supply, use, ending, stocksToUse: use ? ending / use * 100 : NaN };
  };

  /* ------------------------------------------------------------ accounting */
  /* cash vs profit: a profitable deal can still drain cash when the buyer pays later than the supplier is paid */
  C.cashTimeline = function (flows, horizon) {
    const days = Array.from({ length: horizon + 1 }, (_, d) => d);
    let bal = 0; const series = [];
    days.forEach((d) => { flows.filter((f) => f.day === d).forEach((f) => { bal += f.amount; }); series.push(bal); });
    return { series, min: Math.min(...series), minDay: series.indexOf(Math.min(...series)), end: bal };
  };

  if (typeof module !== 'undefined' && module.exports) module.exports = C;
  else root.CALC = C;
})(typeof window !== 'undefined' ? window : globalThis);
