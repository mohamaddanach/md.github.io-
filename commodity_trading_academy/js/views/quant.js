/* Quantitative Analysis Laboratory — statistics, correlation/regression, VaR/ES/Monte Carlo, diversification.
 * Uses the simulated, correlated 500-day dataset from CTA.MARKET.dataset (seeded, reproducible). */
(function () {
  const CTA = window.CTA, C = window.CALC, fmt = CTA.fmt, esc = CTA.esc;
  const f = (n, d = 2) => fmt.num(n, d);
  const NAMES = { gold: 'Gold', wheat: 'Wheat', sugar: 'Sugar', steel: 'HRC steel' };
  const hist = (vals, bins) => { const lo = Math.min(...vals), hi = Math.max(...vals), w = (hi - lo) / bins || 1; const h = new Array(bins).fill(0); vals.forEach((v) => { h[Math.min(bins - 1, Math.floor((v - lo) / w))]++; }); return { h, labels: h.map((_, i) => f(lo + w * (i + 0.5), 3)), lo, w }; };

  function stats(b, ds, q) {
    const k = q.c || 'wheat'; const p = ds.series[k]; const lr = C.logReturns(p), sr = C.returns(p);
    const roll = C.rollingStdev(lr, 20).map((x) => (x == null ? null : x * Math.sqrt(252) * 100));
    const dd = C.drawdownSeries(p).map((x) => x * 100);
    const skew = (() => { const m = C.mean(lr), s = C.stdev(lr); return C.mean(lr.map((x) => ((x - m) / s) ** 3)); })(), kurt = (() => { const m = C.mean(lr), s = C.stdev(lr); return C.mean(lr.map((x) => ((x - m) / s) ** 4)) - 3; })();
    b.innerHTML = `<div class="card"><div class="row"><label>Series</label>${Object.keys(NAMES).map((x) => `<a class="btn sm ${x === k ? 'primary' : ''}" href="#/quant/stats?c=${x}&seed=${q.seed || 2024}">${NAMES[x]}</a>`).join('')}<span class="muted">${esc(ds.units[k])} · 500 simulated trading days ${CTA.SIM}</span></div>
      ${CTA.ui.kpis([{ label: 'Mean daily log return', value: f(C.mean(lr) * 100, 4) + '%' }, { label: 'Daily st. dev.', value: f(C.stdev(lr) * 100, 3) + '%' }, { label: 'Variance (daily)', value: f(C.variance(lr), 7) }, { label: 'Annualised volatility', value: fmt.pct(C.annualizedVol(lr) * 100), term: 'Volatility' }, { label: 'Mean simple return', value: f(C.mean(sr) * 100, 4) + '%' }, { label: 'Skewness', value: f(skew, 2) }, { label: 'Excess kurtosis', value: f(kurt, 2), sub: '> 0 → fatter tails than normal' }, { label: 'Max drawdown', value: fmt.pct(C.maxDrawdown(p) * 100), term: 'Drawdown' }])}
      <div id="qp"></div><h4>Rolling 20-day annualised volatility (%)</h4><div id="qv"></div><h4>Drawdown from running peak (%)</h4><div id="qd"></div><h4>Distribution of daily log returns</h4><div id="qh"></div>
      <div class="note"><strong>Assumptions & limits</strong>Annualising with √252 assumes independent returns. Real commodity returns show volatility clustering, jumps (supply shocks) and fat tails — here visible as positive excess kurtosis from the simulated jumps.</div></div>`;
    const lbl = p.map((_, i) => 'D' + i);
    CTA.chart(CTA.$('#qp', b), { height: 230, labels: lbl, series: [{ data: p, label: NAMES[k], color: CTA.MARKET.PROFILE[k].color }, { data: C.sma(p, 50), label: 'Rolling 50-day mean', color: 'var(--c3)', dash: '5 3' }] });
    CTA.chart(CTA.$('#qv', b), { height: 140, labels: lbl.slice(1), series: [{ data: roll, label: 'Vol %', color: 'var(--c5)' }] });
    CTA.chart(CTA.$('#qd', b), { height: 120, labels: lbl, zero: true, series: [{ data: dd, label: 'Drawdown %', color: 'var(--neg)', type: 'area' }] });
    const H = hist(lr, 30); CTA.chart(CTA.$('#qh', b), { height: 150, labels: H.labels, series: [{ type: 'bars', data: H.h, label: 'Frequency', color: 'var(--c1)' }], yMin: 0 });
  }

  function corr(b, ds, q) {
    const R = {}; ds.names.forEach((n) => { R[n] = C.logReturns(ds.series[n]); });
    const x = q.x || 'wheat', y = q.y || 'sugar';
    const rg = C.linearRegression(R[x], R[y]);
    const roll = R[x].map((_, i) => (i < 59 ? null : C.correlation(R[x].slice(i - 59, i + 1), R[y].slice(i - 59, i + 1))));
    b.innerHTML = `<div class="grid c2"><div class="card"><h3>Correlation matrix of daily log returns</h3>${CTA.table(['', ...ds.names.map((n) => NAMES[n])], ds.names.map((a) => [NAMES[a], ...ds.names.map((c) => { const v = C.correlation(R[a], R[c]); return `<span style="font-weight:${a === c ? 400 : 600};color:${v > 0.2 ? 'var(--pos)' : v < -0.2 ? 'var(--neg)' : 'inherit'}">${f(v, 2)}</span>`; })]))}<p class="muted" style="font-size:.84rem">Generated with "true" correlations of ${f(ds.trueCorr[1][2], 2)} (wheat–sugar) etc. Sample estimates differ from true values — that is sampling error.</p></div>
      <div class="card"><h3>Regression</h3><div class="row"><label>y</label><select id="ry">${ds.names.map((n) => `<option value="${n}" ${n === y ? 'selected' : ''}>${NAMES[n]}</option>`).join('')}</select><label>on x</label><select id="rx">${ds.names.map((n) => `<option value="${n}" ${n === x ? 'selected' : ''}>${NAMES[n]}</option>`).join('')}</select></div>
        ${CTA.ui.kpis([{ label: 'Slope (beta)', value: f(rg.slope, 3) }, { label: 'Intercept', value: f(rg.intercept * 100, 4) + '%' }, { label: 'R²', value: f(rg.r2, 3) }, { label: 'Min-variance hedge ratio (y hedged with x)', value: f(C.minVarianceHedgeRatio(C.correlation(R[y], R[x]), C.stdev(R[y]), C.stdev(R[x])), 3) }])}<p class="muted" style="font-size:.84rem">Regression on returns, not price levels (levels of trending series can show spurious relationships). Low R² means x explains little of y.</p></div></div>
      <div class="card"><h4>Rolling 60-day correlation: ${NAMES[x]} vs ${NAMES[y]}</h4><div id="rc"></div><p class="muted" style="font-size:.84rem">Correlation is unstable even when the true underlying value is constant. In real markets it also shifts with regimes — and tends to rise in crises.</p></div>`;
    CTA.chart(CTA.$('#rc', b), { height: 170, zero: true, yMin: -1, yMax: 1, series: [{ data: roll, label: 'Rolling correlation', color: 'var(--c3)' }], labels: roll.map((_, i) => 'D' + i) });
    const go = () => CTA.go(`quant/corr?x=${CTA.$('#rx', b).value}&y=${CTA.$('#ry', b).value}`); CTA.$('#rx', b).onchange = go; CTA.$('#ry', b).onchange = go;
  }

  function varLab(b, ds) {
    CTA.ui.calcWidget(b, { title: 'Value at Risk, Expected Shortfall and Monte Carlo', tag: CTA.SIM, intro: 'Position: a long physical or futures exposure in one commodity. Compare historical, parametric (normal) and Monte Carlo (GBM) estimates.',
      fields: [{ id: 'c', label: 'Commodity', type: 'select', value: 'wheat', options: Object.entries(NAMES) }, { id: 'val', label: 'Position value (USD)', value: 5000000 }, { id: 'conf', label: 'Confidence', type: 'select', value: '0.99', options: [['0.95', '95%'], ['0.99', '99%']] }, { id: 'h', label: 'Horizon (days)', value: 1 }, { id: 'paths', label: 'Monte Carlo paths', value: 2000 }, { id: 'stress', label: 'Stress scenario move (%)', value: -15 }],
      compute: (v, out) => {
        const p = ds.series[v.c]; const lr = C.logReturns(p); const conf = +v.conf; const h = Math.max(1, Math.round(v.h)); const sc = Math.sqrt(h);
        const hv = C.historicalVaR(lr, conf, v.val) * sc, pv = C.parametricVaR(lr, conf, v.val) * sc, es = C.expectedShortfall(lr, conf, v.val) * sc;
        const sigma = C.annualizedVol(lr); const mc = C.monteCarloGBM({ s0: 1, mu: 0, sigma, days: h, paths: Math.min(20000, Math.max(100, Math.round(v.paths))), seed: 99 });
        const pnl = mc.terminal.map((x) => (x - 1) * v.val); const mcVar = -C.percentile(pnl, 1 - conf); const tail = pnl.filter((x) => x <= -mcVar); const mcEs = tail.length ? -C.mean(tail) : NaN;
        el_cache = { pnl, sample: mc.sample, h };
        return `${CTA.ui.kpis([{ label: 'Historical VaR', value: fmt.money(hv, 'USD', 0), term: 'Value at Risk' }, { label: 'Parametric VaR (normal)', value: fmt.money(pv, 'USD', 0) }, { label: 'Monte Carlo VaR (GBM)', value: fmt.money(mcVar, 'USD', 0) }, { label: 'Historical Expected Shortfall', value: fmt.money(es, 'USD', 0), term: 'Expected Shortfall' }, { label: 'Monte Carlo ES', value: fmt.money(mcEs, 'USD', 0) }, { label: 'Stress scenario loss', value: fmt.money(-v.stress / 100 * v.val, 'USD', 0), cls: 'neg' }])}
          <p class="muted" style="font-size:.84rem">Multi-day VaR scaled by √horizon from daily estimates (assumes independence). Annualised vol used in Monte Carlo: ${fmt.pct(sigma * 100)}. A ${v.stress}% stress move is ${f(Math.abs(v.stress) / 100 / (C.stdev(lr) * sc), 1)} standard deviations — under a normal model such a move would be "almost impossible", yet commodity markets have seen such moves.</p>
          <div class="grid c2"><div><h4>Monte Carlo sample paths</h4><div id="mcp"></div></div><div><h4>Simulated P&L distribution</h4><div id="mch"></div></div></div>
          <div class="note warn"><strong>Model limitations</strong>VaR is not a worst case. Historical VaR depends on the sample window; parametric VaR understates fat tails; Monte Carlo inherits its model's assumptions (here no jumps). Use stress tests and limits alongside.</div>`; },
      after: (v, out) => { const c = el_cache; CTA.chart(CTA.$('#mcp', out), { height: 180, series: c.sample.slice(0, 20).map((s, i) => ({ data: s.map((x) => (x - 1) * 100), color: `hsl(${(i * 37) % 360} 50% 50%)`, width: 1 })), labels: c.sample[0].map((_, i) => 'D' + i), yFmt: (x) => f(x, 1) + '%' }); const H = hist(c.pnl, 30); CTA.chart(CTA.$('#mch', out), { height: 180, labels: H.labels.map((l) => f(+l / 1000, 0) + 'k'), series: [{ type: 'bars', data: H.h, label: 'Paths', colorFn: (_, i) => (H.lo + H.w * (i + 0.5) < 0 ? 'var(--neg)' : 'var(--pos)') }], yMin: 0 }); } });
  }
  let el_cache = null;

  function portfolio(b, ds) {
    const R = {}; ds.names.forEach((n) => { R[n] = C.logReturns(ds.series[n]); });
    const vols = ds.names.map((n) => C.annualizedVol(R[n])); const corrM = ds.names.map((a) => ds.names.map((c) => C.correlation(R[a], R[c])));
    CTA.ui.calcWidget(b, { title: 'Portfolio diversification', tag: CTA.SIM, intro: 'Weights of a commodity book (they are normalised to 100%). Volatilities and correlations are estimated from the simulated dataset.',
      fields: ds.names.map((n, i) => ({ id: n, label: `${NAMES[n]} weight % (vol ${fmt.pct(vols[i] * 100, 1)})`, value: 25 })).concat([{ id: 'val', label: 'Book value (USD)', value: 20000000 }]),
      compute: (v) => { const w0 = ds.names.map((n) => Math.max(0, v[n] || 0)); const s = w0.reduce((a, c) => a + c, 0) || 1; const w = w0.map((x) => x / s); const pv = C.portfolioVol(w, vols, corrM); const avg = w.reduce((a, x, i) => a + x * vols[i], 0); const z = C.invNorm(0.99);
        return `${CTA.ui.kpis([{ label: 'Portfolio volatility', value: fmt.pct(pv * 100) }, { label: 'Weighted average volatility', value: fmt.pct(avg * 100), sub: 'what it would be at correlation 1' }, { label: 'Diversification benefit', value: fmt.pct((avg - pv) * 100), cls: 'pos' }, { label: '1-day 99% parametric VaR', value: fmt.money(z * pv / Math.sqrt(252) * v.val, 'USD', 0) }])}<p class="muted" style="font-size:.84rem">σp = √(wᵀΣw). Diversification helps only while correlations stay low; in stress they often rise toward 1.</p>`; } });
  }

  CTA.route('quant', { title: 'Quantitative Lab', desc: 'Statistics, correlation, VaR, Monte Carlo, diversification.', render(el, r) {
    const tab = r.parts[0] || 'stats'; const ds = CTA.MARKET.dataset(+(r.q.seed || 2024));
    el.innerHTML = `${CTA.pageHead('Quantitative Analysis Laboratory', 'Statistics of commodity returns, volatility, correlation and regression, Value at Risk, Expected Shortfall, Monte Carlo and diversification — with their assumptions and weaknesses. Model estimates are not forecasts.')}${CTA.tabs([['stats', 'Returns & volatility'], ['corr', 'Correlation & regression'], ['var', 'VaR, ES & Monte Carlo'], ['portfolio', 'Diversification']], tab, 'quant')}<div id="qb"></div>`;
    const b = CTA.$('#qb', el);
    if (tab === 'stats') stats(b, ds, r.q); else if (tab === 'corr') corr(b, ds, r.q); else if (tab === 'var') varLab(b, ds); else portfolio(b, ds);
  } });
})();
