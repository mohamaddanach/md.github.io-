/* Commodity masterclasses (Gold, Wheat, Sugar, Steel), the case player and the Commodity Encyclopedia. */
(function () {
  const CTA = window.CTA, C = window.CALC, fmt = CTA.fmt, esc = CTA.esc;
  const f = (n, d = 2) => fmt.num(n, d);

  const PROFILE = {
    gold: { name: 'Gold', sub: 'Precious metal · financial & physical', units: 'Troy ounce (31.1034768 g); fineness ‰; karat', bench: 'OTC spot (T+2), LBMA Gold Price auction, exchange futures (e.g. 100-oz contracts)', trade: 'Bars (Good Delivery ~400 oz, kilobars), coins; secure air freight; vaults', drivers: 'Real rates, USD, central banks, investment flows, jewellery demand, risk sentiment', instruments: 'Physical (allocated/unallocated), ETFs, futures, options, forwards, leases', risks: 'Fraud/AML, settlement, custody, price', lessons: ['g-basics', 'g-instruments', 'g-drivers', 'p-gold'], tools: ['goldCalc', 'goldDrivers', 'optionPayoff'] },
    wheat: { name: 'Wheat', sub: 'Agricultural · food grain', units: 'Metric ton; bushel (60 lb = 27.216 kg) for some futures; % protein, moisture; kg/hl', bench: 'Exchange futures (5,000-bu contracts and others), export FOB assessments, tender prices', trade: 'Bulk carriers from export terminals; state tenders; GAFTA-type contracts', drivers: 'Weather, crop conditions, stocks-to-use, export policy, freight, FX, feed-grain substitution', instruments: 'Physical forwards, futures, options, basis contracts', risks: 'Quality, weather, policy, basis, logistics', lessons: ['w-basics', 'w-markets', 'p-wheat'], tools: ['wheatQuality', 'sdBalance', 'hedgeDemo'] },
    sugar: { name: 'Sugar', sub: 'Agricultural · soft commodity', units: 'c/lb (raw futures), USD/t (white), polarisation °Z, ICUMSA colour', bench: 'Raw sugar futures (112,000 lb type), white sugar futures (50 t type), physical premiums', trade: 'Raw in bulk to refineries; white bagged/containers/bulk', drivers: 'Weather/monsoon, cane crush & sugar mix, ethanol & energy, BRL/INR, policy, white premium', instruments: 'Physical, futures, options, premium/discount pricing', risks: 'Policy, weather, quality/packaging, basis', lessons: ['s-basics', 's-markets', 'p-sugar'], tools: ['sugarConvert', 'offerCompare', 'carryCalc'] },
    steel: { name: 'Steel', sub: 'Industrial · non-uniform products', units: 'Metric ton (some benchmarks in short tons), mm dimensions, MPa grades', bench: 'Price assessments (PRAs), some exchange contracts (e.g. HRC, rebar, scrap) — limited coverage', trade: 'Breakbulk, containers, bulk for scrap/ore; distributors', drivers: 'Construction & manufacturing demand, ore/coal/scrap/energy costs, capacity, trade remedies', instruments: 'Physical contracts, regional futures/swaps where available', risks: 'Specification, certification, trade policy, basis, credit', lessons: ['st-basics', 'st-specs', 'st-markets', 'p-steel'], tools: ['steelWeight', 'specBuilder', 'millMargin'] },
  };

  /* ------------------------------------------------ case player */
  CTA.ui.casePlayer = function (el, cs, opts) {
    opts = opts || {};
    const results = [];
    let i = 0;
    const draw = () => {
      el.innerHTML = `<div class="card"><div class="card-h"><h3>${esc(cs.title)}</h3><span class="badge t-${cs.commodity}">${cs.commodity}</span></div>
        <p>${esc(cs.context)}</p>${CTA.table(['Input', 'Value'], cs.data)}<div class="muted" style="font-size:.8rem">All figures ${CTA.SIM}</div>
        <div class="steps" style="margin-top:10px">${cs.steps.map((_, k) => `<span class="${k < i ? 'done' : k === i ? 'cur' : ''}"></span>`).join('')}</div>
        <div class="case-steps"></div></div>`;
      const host = CTA.$('.case-steps', el);
      cs.steps.forEach((s, k) => { if (k > i) return; const div = document.createElement('div'); div.className = 'card soft'; host.appendChild(div); renderStep(div, s, k); });
    };
    const finish = () => {
      const score = results.reduce((a, b) => a + b, 0) / results.length;
      CTA.record.caseResult(cs.id, score);
      CTA.log(`Case "${cs.title}" completed — ${Math.round(score)}%`, 'case');
      const box = document.createElement('div');
      box.innerHTML = `<div class="note ${score >= 70 ? 'ok' : 'warn'}"><strong>Case score: ${Math.round(score)}%</strong>${score >= 70 ? 'Well handled.' : 'Review the explanations; try the case again later.'}</div><div class="card"><h4>Detailed solution</h4><p>${CTA.rich(cs.solution)}</p><div class="row"><button class="btn" data-a="again">Try again</button>${opts.onClose ? '<button class="btn primary" data-a="close">Back to cases</button>' : ''}</div></div>`;
      CTA.$('.case-steps', el).appendChild(box);
      CTA.$('[data-a=again]', box).onclick = () => { results.length = 0; i = 0; draw(); };
      const cl = CTA.$('[data-a=close]', box); if (cl) cl.onclick = opts.onClose;
    };
    const advance = (score) => { results[i] = score; i++; if (i < cs.steps.length) { const host = CTA.$('.case-steps', el); const div = document.createElement('div'); div.className = 'card soft'; host.appendChild(div); renderStep(div, cs.steps[i], i); CTA.$$('.steps span', el).forEach((sp, k) => { sp.className = k < i ? 'done' : k === i ? 'cur' : ''; }); div.scrollIntoView({ behavior: 'smooth', block: 'center' }); } else finish(); };
    function renderStep(div, s, k) {
      if (s.type === 'num') {
        div.innerHTML = `<p><b>Step ${k + 1}.</b> ${esc(s.q)}</p><div class="row"><input type="text" inputmode="decimal" style="max-width:200px" aria-label="Answer"><span class="muted">${esc(s.unit || '')}</span><button class="btn primary sm">Check</button><button class="btn sm ghost" data-a="skip">Show solution</button></div><div class="fb"></div>`;
        const go = (skip) => { const raw = CTA.$('input', div).value; const v = CTA.num(raw, NaN); if (!skip && isNaN(v)) { CTA.toast('Enter a number.', 'warn'); return; }
          const ok = !skip && C.within(v, s.ans, s.tol); CTA.record.exercise(s.id, ok);
          CTA.$('.fb', div).innerHTML = `<div class="note ${ok ? 'ok' : 'bad'}"><strong>${ok ? 'Correct' : skip ? 'Solution' : 'Not correct'} — answer ${f(s.ans, s.dp == null ? 2 : s.dp)} ${esc(s.unit || '')}</strong><ol style="margin:4px 0 0">${s.work.map((w) => `<li>${esc(w)}</li>`).join('')}</ol></div>`;
          CTA.$$('button', div).forEach((b) => b.remove()); CTA.$('input', div).disabled = true; advance(ok ? 100 : 0); };
        CTA.$('.btn.primary', div).onclick = () => go(false); CTA.$('[data-a=skip]', div).onclick = () => go(true);
      } else {
        div.innerHTML = `<p><b>Step ${k + 1}. Decision.</b> ${esc(s.q)}</p>${CTA.shuffleIdx(s.opts.length).map((j) => `<label class="choice"><input type="radio" name="${s.id}" value="${j}"><span class="ch-t">${esc(s.opts[j][0])}</span></label>`).join('')}<button class="btn primary sm">Decide</button><div class="fb"></div>`;
        CTA.$$('.choice input', div).forEach((r) => r.addEventListener('change', () => CTA.$$('.choice', div).forEach((c) => c.classList.toggle('sel', CTA.$('input', c).checked))));
        CTA.$('.btn.primary', div).onclick = () => { const sel = CTA.$('input:checked', div); if (!sel) { CTA.toast('Choose an option.', 'warn'); return; } const j = +sel.value; const o = s.opts[j];
          CTA.$('.fb', div).innerHTML = `<div class="note ${o[1] >= 70 ? 'ok' : o[1] >= 40 ? 'warn' : 'bad'}"><strong>Your decision scores ${o[1]}/100</strong>${esc(o[2])}</div><details open><summary>How the alternatives compare</summary><ul>${s.opts.map((x, m) => `<li class="${m === j ? '' : 'muted'}"><b>${esc(x[0])}</b> — ${x[1]}/100: ${esc(x[2])}</li>`).join('')}</ul></details>`;
          CTA.$$('input', div).forEach((x) => { x.disabled = true; }); CTA.$('.btn.primary', div).remove(); advance(o[1]); };
      }
    }
    draw();
  };

  /* ------------------------------------------------ commodity page */
  function commodityPage(key) {
    return { title: PROFILE[key].name + ' Trading', accent: key, desc: PROFILE[key].name + ' masterclass: lessons, cases, tools.', render(el, r) {
      const pf = PROFILE[key], tab = r.parts[0] || 'overview';
      const cases = CTA.CASES.filter((c) => c.commodity === key);
      el.innerHTML = `${CTA.pageHead(pf.name + ' Trading Masterclass', pf.sub + '. Learn the product, the market, the physical trade and the financial instruments — then practise on ' + cases.length + ' cases and a full simulated deal.', key, `<a class="btn primary" href="#/physical/workflow?c=${key}">Run a ${pf.name.toLowerCase()} deal →</a>`)}
        ${CTA.tabs([['overview', 'Overview'], ['lessons', 'Lessons'], ['cases', `Practical cases (${cases.length})`], ['tools', 'Tools'], ['instruments', 'Instruments & specs']], tab, key)}<div id="cbody"></div>`;
      const body = CTA.$('#cbody', el);
      if (tab === 'overview') {
        const ls = pf.lessons.map((id) => CTA.L_INDEX[id]).filter(Boolean);
        const done = ls.filter((l) => CTA.progress.lessonDone(l.id)).length;
        const cs = cases.map((c) => CTA.state.cases[c.id]).filter(Boolean);
        body.innerHTML = `<div class="grid side"><div><div class="card"><h3>Market profile</h3><dl class="kv-list"><dt>Units</dt><dd>${esc(pf.units)}</dd><dt>Benchmarks</dt><dd>${esc(pf.bench)}</dd><dt>How it trades</dt><dd>${esc(pf.trade)}</dd><dt>Key drivers</dt><dd>${esc(pf.drivers)}</dd><dt>Instruments</dt><dd>${esc(pf.instruments)}</dd><dt>Distinctive risks</dt><dd>${esc(pf.risks)}</dd></dl></div>
          <div class="card"><h3>Physical vs financial in ${pf.name.toLowerCase()}</h3>${CTA.table(['', 'Physical trading', 'Financial trading'], [['What you do', 'Buy/sell actual ' + pf.name.toLowerCase() + ', arrange logistics, inspection, documents, finance', 'Take or hedge price exposure via futures, options, swaps or funds'], ['Profit source', 'Differentials, logistics optimisation, quality/form transformation', 'Price moves (speculation) or risk reduction (hedging)'], ['Main risks', esc(pf.risks), 'Price, leverage/margin, liquidity, basis vs the physical'], ['Where they meet', 'Physical traders hedge price with financial instruments and earn the basis', 'Futures converge to physical through delivery/arbitrage (where it exists)']])}</div></div>
          <div><div class="card"><h3>Your progress</h3>${CTA.ui.kpis([{ label: 'Lessons mastered', value: done + ' / ' + ls.length }, { label: 'Cases completed', value: cs.length + ' / ' + cases.length }, { label: 'Avg. case score', value: cs.length ? fmt.pct(cs.reduce((a, b) => a + b.best, 0) / cs.length, 0) : '—' }, { label: 'Deal simulated', value: CTA.progress.simDone(key) ? 'Yes' : 'Not yet', cls: CTA.progress.simDone(key) ? 'pos' : '' }])}
            <a class="btn" href="#/${key}/lessons">Lessons</a> <a class="btn" href="#/${key}/cases">Cases</a></div>
            <div class="card"><h3>Research sources</h3><ul>${CTA.MARKET.SOURCES.filter((s) => s.com.includes(key)).slice(0, 7).map((s) => `<li><a href="${s.url}" target="_blank" rel="noopener">${esc(s.name)}</a> <span class="muted" style="font-size:.8rem">— ${esc(s.type)}</span></li>`).join('')}</ul><a class="btn sm" href="#/global/research">All sources & how to use them</a></div></div></div>`;
      } else if (tab === 'lessons') {
        const ids = pf.lessons;
        body.innerHTML = ids.map((id) => { const l = CTA.L_INDEX[id]; if (!l) return ''; const d = CTA.progress.lessonDone(id), un = CTA.progress.lessonUnlocked(id);
          return `<a class="lesson-row ${d ? 'done' : ''} ${un ? '' : 'locked'}" href="#/path/lesson/${id}" style="background:#fff;border:1px solid var(--line);border-radius:8px;margin-bottom:6px"><span class="st">${d ? '✓' : ''}</span><span><b>${esc(l.title)}</b><br><small>${esc(l.summary)}</small></span><span class="meta">Stage ${CTA.progress.stageOf(id) + 1} · ${l.mins} min${un ? '' : ' · 🔒'}</span></a>`; }).join('') +
          '<p class="muted" style="margin-top:10px">Shared disciplines that apply to this commodity — trade finance, Incoterms, logistics, hedging, analysis and risk — are in stages 5–8 of the learning path.</p>';
      } else if (tab === 'cases') {
        const id = r.parts[1];
        const cs = id && cases.find((c) => c.id === id);
        if (cs) { CTA.ui.casePlayer(body, cs, { onClose: () => CTA.go(key + '/cases') }); return; }
        body.innerHTML = `<p class="muted">Each case has numerical inputs, calculations, decisions and a detailed solution. Scores count toward Performance Analytics. Best score is kept.</p><div class="grid c2">${cases.map((c, k) => { const res = CTA.state.cases[c.id];
          return `<a class="card" style="text-decoration:none;color:inherit;margin:0" href="#/${key}/cases/${c.id}"><div class="row between"><b>${k + 1}. ${esc(c.title)}</b>${res ? `<span class="badge ${res.best >= 70 ? 'ok' : 'warn'}">best ${Math.round(res.best)}%</span>` : '<span class="badge">new</span>'}</div><p class="muted" style="margin:4px 0 0;font-size:.88rem">${esc(c.brief)}</p><small>${c.steps.length} steps · ${c.steps.filter((s) => s.type === 'num').length} calculations</small></a>`; }).join('')}</div>`;
      } else if (tab === 'tools') {
        body.innerHTML = pf.tools.map((w) => `<div data-widget="${w}" style="margin-bottom:14px"></div>`).join('');
      } else {
        const S = CTA.MARKET.specs(); const mine = Object.entries(S).filter(([, s]) => s.commodity === key);
        body.innerHTML = `<div class="card"><h3>Exchange-traded instruments in the simulator ${CTA.ILLU}</h3>${mine.length ? CTA.table(['Code', 'Contract', 'Quote', 'Size', 'Tick / value', 'Margin (IM/MM)'], mine.map(([k, s]) => [k, s.name, s.unit, s.size, s.tick + ' / USD ' + f(s.tick * s.pointValue), f(s.im, 0) + ' / ' + f(s.mm, 0)])) : '<p>No contract configured.</p>'}<p class="muted">Specs are illustrative and editable in Settings. Verify current specifications with the exchange.</p><a class="btn primary" href="#/futures/trade">Open the futures desk →</a></div>
          ${key === 'steel' ? CTA.callout('warn', 'Steel hedging', 'Steel hedging opportunities vary by product, region, benchmark and liquidity. A rebar buyer in one region hedging with an HRC contract from another region carries large basis risk.') : ''}
          <div class="card"><h3>Unit conversions for ${pf.name.toLowerCase()}</h3>${key === 'gold' ? CTA.table(['From', 'To'], [['1 troy oz', '31.1034768 g'], ['1 kg', f(C.convertMass(1, 'kg', 'ozt'), 4) + ' troy oz'], ['1 troy oz', f(C.convertMass(1, 'ozt', 'oz'), 5) + ' avoirdupois oz'], ['1 tola (South Asia, common definition)', '≈ 11.66 g — check contract definition']]) : key === 'wheat' ? CTA.table(['From', 'To'], [['1 t', f(C.convertMass(1, 't', 'bu_wheat'), 4) + ' bu'], ['1 bu', '27.2155 kg'], ['100 c/bu', 'USD ' + f(C.centsPerBuToUsdPerT(100)) + '/t'], ['5,000 bu contract', f(C.convertMass(5000, 'bu_wheat', 't'), 2) + ' t']]) : key === 'sugar' ? CTA.table(['From', 'To'], [['1 c/lb', 'USD ' + f(C.centsPerLbToUsdPerT(1), 4) + '/t'], ['112,000 lb contract', f(C.convertMass(112000, 'lb', 't'), 2) + ' t'], ['1 t', f(C.convertMass(1, 't', 'lb'), 2) + ' lb']]) : CTA.table(['From', 'To'], [['1 short ton', '0.90718 t'], ['USD 1/short ton', 'USD ' + f(C.usdPerStToUsdPerT(1), 5) + '/t'], ['1 long ton', '1.01605 t'], ['20 short ton contract', f(C.convertMass(20, 'st', 't'), 3) + ' t']])}</div>`;
      }
    } };
  }
  ['gold', 'wheat', 'sugar', 'steel'].forEach((k) => CTA.route(k, commodityPage(k)));

  /* ------------------------------------------------ encyclopedia */
  CTA.route('encyclopedia', { title: 'Commodity Encyclopedia', desc: 'Profiles, comparisons and unit conversion.', render(el) {
    el.innerHTML = `${CTA.pageHead('Commodity Encyclopedia', 'Reference profiles of the four core commodities, how they compare, and a universal unit converter.')}
      <div class="grid c4">${Object.entries(PROFILE).map(([k, p]) => `<a class="card" style="text-decoration:none;color:inherit;border-top:4px solid var(--${k})" href="#/${k}"><span class="badge t-${k}">${p.name}</span><p style="margin:6px 0"><b>${esc(p.sub)}</b></p><p class="muted" style="font-size:.86rem">${esc(p.drivers)}</p></a>`).join('')}</div>
      <div class="card"><h3>Side-by-side comparison</h3>${CTA.table(['Dimension', 'Gold', 'Wheat', 'Sugar', 'Steel'], [
        ['Fungibility', 'Very high (fineness, accredited bars)', 'High within class/grade', 'High within raw/white spec', 'Low — many products, grades, sizes'],
        ['Value density', 'Extremely high (~USD tens of thousands per kg)', 'Low (~USD hundreds per t)', 'Low', 'Medium-low'],
        ['Perishability', 'None', 'Moderate (moisture, insects)', 'Moderate (moisture, caking)', 'Low (rust)'],
        ['Price units', 'USD/ozt', 'USD/t; c/bu', 'c/lb raw; USD/t white', 'USD/t; USD/short ton (some US)'],
        ['Hedging depth', 'Deep, liquid', 'Deep for benchmark contracts; basis risk by origin', 'Deep for raw/white benchmarks', 'Limited, product/region-specific'],
        ['Main logistics', 'Secure air, vaults', 'Bulk carriers, silos', 'Bulk/bags/containers', 'Breakbulk/containers'],
        ['Distinctive risk', 'Fraud, AML, settlement', 'Weather, quality, policy', 'Policy, weather, energy link', 'Specs, certificates, trade remedies'],
        ['Key documents', 'Bar list, assay, vault receipt', 'Phytosanitary, quality/weight certificates', 'Quality, health certificates, packing list', 'Mill test certificates, inspection, packing list'],
      ])}</div>
      <div data-widget="unitConv"></div>
      <div class="card"><h3>Other commodity families (context)</h3><p>The academy concentrates on gold, wheat, sugar and steel. Their principles transfer to other families: <b>energy</b> (crude oil, products, natural gas, LNG, coal), <b>base metals</b> (copper, aluminium, zinc, nickel), <b>other precious metals</b> (silver, platinum, palladium), <b>grains & oilseeds</b> (corn, soybeans, rice), <b>softs</b> (coffee, cocoa, cotton) and <b>livestock</b>. Each has its own specifications, units, logistics and regulations.</p></div>`;
  } });
  CTA.widgets.unitConv = (el) => CTA.ui.calcWidget(el, { title: 'Universal unit converter', tag: '', fields: [{ id: 'v', label: 'Value', value: 1 }, { id: 'from', label: 'From', type: 'select', value: 't', options: Object.entries(C.UNIT_LABELS) }, { id: 'to', label: 'To', type: 'select', value: 'st', options: Object.entries(C.UNIT_LABELS) }, { id: 'price', label: 'Optional: price per "From" unit', value: 0 }],
    compute: (v) => { const r = C.convertMass(v.v, v.from, v.to); return `<p style="font-size:1.1rem"><b>${f(v.v, 4)} ${esc(C.UNIT_LABELS[v.from])} = ${f(r, 6)} ${esc(C.UNIT_LABELS[v.to])}</b></p>${v.price ? `<p>Price ${f(v.price, 4)} per ${esc(v.from)} = <b>${f(C.convertPricePerUnit(v.price, v.from, v.to), 4)} per ${esc(v.to)}</b></p>` : ''}<p class="muted" style="font-size:.84rem">Internally all masses convert through kilograms. Troy and avoirdupois ounces are different units; short (2,000 lb), long (2,240 lb) and metric tons (1,000 kg) differ.</p>`; } });
})();
