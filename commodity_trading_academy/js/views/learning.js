/* My Learning Path — roadmap, lesson reader with mastery checks, and the interactive tools embedded in lessons. */
(function () {
  const CTA = window.CTA, C = window.CALC, fmt = CTA.fmt, esc = CTA.esc, P = () => CTA.progress;
  const f = (n, d = 2) => fmt.num(n, d);

  /* ------------------------------------------------ reusable calculator widget */
  CTA.ui.calcWidget = function (el, o) {
    const uid = 'cw' + Math.random().toString(36).slice(2, 7);
    el.innerHTML = `<div class="card soft"><div class="card-h"><h4 style="margin:0">${o.title}</h4>${o.tag || CTA.SIM}</div>${o.intro ? `<p class="muted" style="font-size:.88rem">${o.intro}</p>` : ''}
      <div class="form">${o.fields.map((fd) => CTA.ui.field(Object.assign({}, fd, { id: uid + '-' + fd.id, name: fd.id }))).join('')}</div><div class="cw-out" style="margin-top:12px"></div></div>`;
    const out = CTA.$('.cw-out', el);
    const run = () => { const v = CTA.ui.read(el); try { out.innerHTML = o.compute(v, out); if (o.after) o.after(v, out); } catch (e) { out.innerHTML = `<div class="note bad"><strong>Check the inputs</strong>${esc(e.message)}</div>`; } };
    el.addEventListener('input', run); el.addEventListener('change', run); run();
  };
  const rows = (pairs) => `<table><tbody>${pairs.map(([k, v, cls]) => `<tr class="${cls || ''}"><td>${k}</td><td class="r num">${v}</td></tr>`).join('')}</tbody></table>`;

  /* ------------------------------------------------ roadmap */
  function roadmap(el) {
    const p = P();
    el.innerHTML = `${CTA.pageHead('My Learning Path', 'Mastery-based progression: a lesson is complete only when you pass its check quiz (≥ 70%). Each stage unlocks the next. You can always review mastered lessons and repeat quizzes.', '', `<span class="badge info">Overall ${fmt.pct(p.overall(), 0)}</span>`)}
      ${CTA.state.settings.freeNav ? '<div class="note warn"><strong>Free navigation is ON</strong>All stages are open (Settings). Mastery is still recorded.</div>' : ''}
      ${CTA.STAGES.map((s, i) => { const ss = p.stageStatus(i), un = p.stageUnlocked(i);
        return `<div class="stage ${ss.mastered ? 'done' : un ? '' : 'locked'}"><div class="stage-h"><div class="stage-n">${s.n}</div><div style="flex:1;min-width:220px"><b>${esc(s.title)}</b><div class="muted" style="font-size:.86rem">${esc(s.desc)}</div></div><div style="width:160px">${CTA.ui.pbar(ss.pct)}<div class="muted" style="font-size:.78rem">${ss.done}/${ss.total} complete${ss.mastered ? ' · mastered' : un ? '' : ' · locked until stage ' + i + ' is mastered'}</div></div></div>
          ${s.lessons.map((id) => { const l = CTA.L_INDEX[id]; if (!l) return ''; const done = p.lessonDone(id), rec = CTA.state.lessons[id];
            return `<a class="lesson-row ${done ? 'done' : ''} ${un ? '' : 'locked'}" href="#/path/lesson/${id}"><span class="st">${done ? '✓' : ''}</span><span><b>${esc(l.title)}</b><br><small>${esc(l.summary)}</small></span><span class="meta">${l.mins} min${rec && rec.best != null ? ' · best ' + Math.round(rec.best) + '%' : ''}${un ? '' : ' · 🔒'}</span></a>`; }).join('')}
          ${(ss.acts || []).map(({ a, ok }) => `<a class="lesson-row ${ok ? 'done' : ''} ${un ? '' : 'locked'}" href="#/${a.go}"><span class="st">${ok ? '✓' : ''}</span><span>${esc(a.label)}</span><span class="meta">activity</span></a>`).join('')}</div>`; }).join('')}`;
  }

  /* ------------------------------------------------ lesson reader */
  function lesson(el, id) {
    const l = CTA.L_INDEX[id];
    if (!l) { el.innerHTML = CTA.ui.empty('Lesson not found', 'This lesson does not exist.', '<a class="btn" href="#/path">Back to the path</a>'); return; }
    const p = P(), si = p.stageOf(id), unlocked = p.lessonUnlocked(id);
    const all = CTA.STAGES.flatMap((s) => s.lessons); const idx = all.indexOf(id);
    const prev = all[idx - 1], next = all[idx + 1];
    const rec = CTA.state.lessons[id] || { visits: 0 }; rec.visits = (rec.visits || 0) + 1; rec.lastVisit = Date.now(); CTA.state.lessons[id] = rec; CTA.save();
    if (!unlocked) {
      el.innerHTML = `${CTA.pageHead(esc(l.title), esc(l.summary), l.track)}<div class="card"><h3>🔒 Locked — master the previous stage first</h3><p>This lesson is in <b>Stage ${si + 1}</b>. Stage ${si} (“${esc(CTA.STAGES[si - 1].title)}”) is not yet mastered. The academy uses mastery-based progression so later material builds on solid foundations.</p>
        <div class="row"><a class="btn primary" href="#/path">See what is missing</a><a class="btn" href="#/settings">Enable free navigation (Settings)</a></div></div>`;
      return;
    }
    const qids = CTA.QUESTIONS.filter((q) => q.l === id).map((q) => q.id);
    el.innerHTML = `<div class="lesson">${CTA.pageHead(esc(l.title), esc(l.summary), ['gold', 'wheat', 'sugar', 'steel'].includes(l.track) ? l.track : '', `<span class="badge ${p.lessonDone(id) ? 'ok' : 'info'}">${p.lessonDone(id) ? 'Mastered' : 'Stage ' + (si + 1)}</span>`)}
      <div class="row" style="margin-bottom:10px"><span class="muted">⏱ ${l.mins} min · ${CTA.TOPICS[l.track] || l.track}</span><span style="flex:1"></span>${prev ? `<a class="btn sm" href="#/path/lesson/${prev}">← Previous</a>` : ''}<a class="btn sm" href="#/path">Roadmap</a>${next ? `<a class="btn sm" href="#/path/lesson/${next}">Next →</a>` : ''}</div>
      ${l.objectives ? `<div class="card soft"><b>Learning objectives</b><ul style="margin:6px 0 0">${l.objectives.map((o) => `<li>${esc(o)}</li>`).join('')}</ul></div>` : ''}
      <div class="lesson-body">${CTA.rich(l.body)}</div>
      <h2>Mastery check</h2><p class="muted">Answer every question. 70% or more marks the lesson as mastered${si >= 0 ? ' and counts toward unlocking Stage ' + (si + 2) : ''}. You can retake it any time; your best score is kept.</p>
      <div id="mastery"></div><div class="row" style="margin-top:10px"><button class="btn" id="retake">Retake quiz</button>${next ? `<a class="btn primary" href="#/path/lesson/${next}">Next lesson →</a>` : ''}</div></div>`;
    CTA.autoTerms(CTA.$('.lesson-body', el), 80);
    const mount = () => CTA.ui.quiz(CTA.$('#mastery', el), qids, { exam: true, onDone: (r) => { const done = p.completeLesson(id, r.pct); CTA.toast(done ? 'Lesson mastered ✓' : `Score ${Math.round(r.pct)}% — 70% needed`, done ? 'ok' : 'warn'); } });
    mount();
    CTA.$('#retake', el).onclick = () => { mount(); CTA.$('#mastery', el).scrollIntoView({ behavior: 'smooth' }); };
  }

  CTA.route('path', { title: 'My Learning Path', desc: 'Stages, lessons and mastery progress.', render(el, r) {
    if (r.parts[0] === 'lesson') lesson(el, r.parts[1]); else roadmap(el);
  } });

  /* ================================================== embedded lesson widgets */
  const W = CTA.widgets;
  W.dealMini = (el) => CTA.ui.calcWidget(el, { title: 'Mini deal economics calculator', intro: 'Change any input — results update instantly. The full version is in Physical Trading Simulator → Deal Calculator.',
    fields: [{ id: 'q', label: 'Quantity (t)', value: 10000 }, { id: 'buy', label: 'Buy price FOB (/t)', value: 250 }, { id: 'sell', label: 'Sell price CFR (/t)', value: 300 }, { id: 'fr', label: 'Freight (/t)', value: 30 }, { id: 'oth', label: 'Other costs (/t)', value: 5.81 }, { id: 'rate', label: 'Finance rate % p.a.', value: 6 }, { id: 'days', label: 'Cycle days', value: 60 }, { id: 'bank', label: 'Bank-funded share %', value: 80 }],
    compute: (v) => { const cost = v.buy + v.fr + v.oth, before = cost * v.q, fin = C.interest(before, v.rate, v.days), rev = v.sell * v.q, gm = rev - before, net = gm - fin, eq = before * (1 - v.bank / 100);
      return CTA.ui.kpis([{ label: 'Gross margin', value: fmt.money(gm, 'USD', 0), cls: fmt.cls(gm) }, { label: 'Financing', value: fmt.money(fin, 'USD', 0) }, { label: 'Net profit', value: fmt.money(net, 'USD', 0), cls: fmt.cls(net) }, { label: 'Equity employed', value: fmt.money(eq, 'USD', 0) }, { label: 'ROIC (cycle)', value: eq > 0 ? fmt.pct(net / eq * 100) : '—' }, { label: 'ROIC annualised', value: eq > 0 && v.days > 0 ? fmt.pct(net / eq * 100 * 365 / v.days, 1) : '—' }]); } });

  W.cashGap = (el) => {
    CTA.ui.calcWidget(el, { title: 'Profit vs cash simulator', intro: 'Each cargo is paid to the supplier when it starts and collected from the buyer later. Profit is recognised at delivery (day 20 of each cargo). Watch cash dip while profit grows.',
      fields: [{ id: 'cost', label: 'Cost per cargo (USD m)', value: 6 }, { id: 'margin', label: 'Net margin per cargo %', value: 2.5 }, { id: 'per', label: 'Cargoes started per month', value: 2 }, { id: 'pay', label: 'Buyer pays after (days)', value: 90 }, { id: 'months', label: 'Months simulated', value: 9 }, { id: 'cash0', label: 'Starting cash (USD m)', value: 10 }],
      compute: (v) => {
        const H = Math.round(v.months * 30), n = Math.max(0, Math.floor(v.per * v.months)), gap = Math.max(1, 30 / Math.max(v.per, 0.01));
        const flows = []; const prof = new Array(H + 1).fill(0);
        for (let k = 0; k < n; k++) { const d0 = Math.round(k * gap); if (d0 > H) break; flows.push({ day: d0, amount: -v.cost }); if (d0 + v.pay <= H) flows.push({ day: d0 + v.pay, amount: v.cost * (1 + v.margin / 100) }); if (d0 + 20 <= H) prof[d0 + 20] += v.cost * v.margin / 100; }
        const tl = C.cashTimeline(flows, H); const cash = tl.series.map((x) => x + v.cash0); let cum = 0; const profit = prof.map((p) => (cum += p));
        el._series = { cash, profit };
        const minCash = Math.min(...cash);
        return `${CTA.ui.kpis([{ label: 'Profit recognised', value: 'USD ' + f(profit[H], 2) + 'm', cls: 'pos' }, { label: 'Lowest cash balance', value: 'USD ' + f(minCash, 2) + 'm', cls: minCash < 0 ? 'neg' : '' }, { label: 'Day of lowest cash', value: 'Day ' + cash.indexOf(minCash) }])}
          ${minCash < 0 ? '<div class="note bad"><strong>Liquidity crisis</strong>Cash goes negative while the business is profitable. Without a bank line, the company would default on supplier payments. Fixes: shorter buyer terms, supplier credit, trade finance, slower growth, more equity.</div>' : '<div class="note ok"><strong>Cash stays positive</strong>Try increasing cargoes per month or buyer payment days.</div>'}<div class="cg-chart"></div>`;
      },
      after: (v, out) => { const s = el._series; CTA.chart(CTA.$('.cg-chart', out), { height: 220, series: [{ data: s.cash, label: 'Cash balance (USD m)', color: 'var(--c1)' }, { data: s.profit, label: 'Cumulative profit (USD m)', color: 'var(--pos)' }], labels: s.cash.map((_, i) => 'Day ' + i), zero: true }); } });
  };

  W.valueChain = (el) => {
    const ch = CTA.MARKET.CHAIN; let cur = 0;
    const draw = () => { el.innerHTML = `<div class="card soft"><div class="flow">${ch.map(([s], i) => `${i ? '<span class="ar">→</span>' : ''}<span class="fn ${i === cur ? 'on' : ''}" data-i="${i}" tabindex="0">${s}</span>`).join('')}</div>
      <div class="grid c2">${['gold', 'wheat', 'sugar', 'steel'].map((c) => `<div class="card" style="margin:0"><span class="badge t-${c}">${c}</span><p style="margin-top:6px">${esc(ch[cur][1][c])}</p></div>`).join('')}</div></div>`;
      CTA.$$('.fn', el).forEach((b) => { b.onclick = () => { cur = +b.dataset.i; draw(); }; b.onkeydown = (e) => { if (e.key === 'Enter') { cur = +b.dataset.i; draw(); } }; }); };
    draw();
  };

  W.miniArb = (el) => CTA.ui.calcWidget(el, { title: 'Is the price gap an arbitrage?', fields: [{ id: 'o', label: 'Origin FOB (/t)', value: 230 }, { id: 'd', label: 'Destination price (/t)', value: 262 }, { id: 'fr', label: 'Freight (/t)', value: 24 }, { id: 'ins', label: 'Insurance %', value: 0.1 }, { id: 'duty', label: 'Duty %', value: 0 }, { id: 'h', label: 'Handling (/t)', value: 4 }, { id: 'rate', label: 'Finance % p.a.', value: 7 }, { id: 'days', label: 'Voyage days', value: 20 }],
    compute: (v) => { const r = C.arbitrage({ originPrice: v.o, destPrice: v.d, freight: v.fr, insurancePct: v.ins, dutyPct: v.duty, handling: v.h, financeRatePct: v.rate, days: v.days });
      return rows([['Apparent gap', f(r.apparent)], ['Freight', f(r.freight)], ['Insurance', f(r.insurance)], ['Duty', f(r.duty)], ['Handling', f(r.handling)], ['Financing', f(r.financing)], ['Delivered cost', f(r.delivered), 'total'], ['<b>Margin after costs /t</b>', `<b class="${fmt.cls(r.marginPerT)}">${f(r.marginPerT)}</b>`]]) + (r.marginPerT > 0 ? '<p class="note ok">Positive after costs — still check timing, quality and execution risk.</p>' : '<p class="note warn">Not an arbitrage: costs exceed the gap.</p>'); } });

  W.goldCalc = (el) => CTA.ui.calcWidget(el, { title: 'Gold weight, purity & value calculator', fields: [{ id: 'w', label: 'Gross weight', value: 1000 }, { id: 'u', label: 'Unit', type: 'select', value: 'g', options: [['g', 'grams'], ['kg', 'kilograms'], ['ozt', 'troy ounces'], ['oz', 'avoirdupois oz (wrong unit for gold!)']] }, { id: 'mode', label: 'Purity given as', type: 'select', value: 'fine', options: [['fine', 'fineness (‰)'], ['k', 'karat']] }, { id: 'p', label: 'Fineness ‰ or karat', value: 999.9 }, { id: 'spot', label: 'Spot USD/ozt', value: 2000 }, { id: 'prem', label: 'Premium USD/ozt', value: 2 }],
    compute: (v) => { const fin = v.mode === 'k' ? C.karatToFineness(v.p) : v.p / 1000; if (fin <= 0 || fin > 1) throw new Error('Purity must be between 0 and 1000‰ or 0 and 24 karat.'); const gv = C.goldValue({ grossWeight: v.w, unit: v.u, fineness: fin, spotPerOzt: v.spot, premiumPerOzt: v.prem }); const grams = C.convertMass(v.w, v.u, 'g');
      return rows([['Gross weight', f(grams, 3) + ' g = ' + f(C.convertMass(v.w, v.u, 'ozt'), 4) + ' ozt'], ['Fineness', f(fin * 100, 3) + '%'], ['Fine gold', f(grams * fin, 3) + ' g = <b>' + f(gv.fineOz, 4) + ' fine ozt</b>'], ['Value (spot + premium)', '<b>USD ' + f(gv.value) + '</b>', 'total']]) + (v.u === 'oz' ? '<div class="note bad"><strong>Unit warning</strong>You entered avoirdupois ounces. Precious metals use troy ounces (31.1035 g).</div>' : ''); } });

  W.goldDrivers = (el) => CTA.ui.calcWidget(el, { title: 'Gold driver scenario sketch', tag: CTA.ILLU, intro: 'A qualitative teaching aid: choose how each driver changes and see the combined directional pressure under illustrative weights. Real relationships are unstable — this is not a forecast.',
    fields: [{ id: 'rr', label: 'Real interest rates', type: 'select', value: '0', options: [['-1', 'Fall'], ['0', 'Unchanged'], ['1', 'Rise']] }, { id: 'usd', label: 'US dollar', type: 'select', value: '0', options: [['-1', 'Weaken'], ['0', 'Unchanged'], ['1', 'Strengthen']] }, { id: 'cb', label: 'Central bank buying', type: 'select', value: '0', options: [['-1', 'Lower'], ['0', 'Unchanged'], ['1', 'Higher']] }, { id: 'risk', label: 'Geopolitical stress', type: 'select', value: '0', options: [['0', 'Calm'], ['1', 'Rising (no liquidity squeeze)'], ['2', 'Acute with liquidity squeeze']] }],
    compute: (v) => { const s = -1.0 * v.rr - 0.7 * v.usd + 0.6 * v.cb + (v.risk === '1' || v.risk === 1 ? 0.8 : v.risk === '2' || v.risk === 2 ? -0.4 : 0);
      const lab = s > 0.6 ? 'Supportive' : s < -0.6 ? 'Headwind' : 'Mixed / neutral';
      return `<div class="note ${s > 0.6 ? 'ok' : s < -0.6 ? 'bad' : ''}"><strong>${lab} (score ${f(s, 1)})</strong>Weights: real rates −1.0, USD −0.7, central banks +0.6, stress +0.8 (or −0.4 in a liquidity squeeze, when investors sell gold to raise cash). Use this to structure reasoning, then check each driver against data.</div>`; } });

  W.wheatQuality = (el) => CTA.ui.calcWidget(el, { title: 'Wheat quality adjustment calculator', fields: [{ id: 'w', label: 'Delivered weight (t)', value: 30000 }, { id: 'm0', label: 'Moisture delivered %', value: 14.2 }, { id: 'm1', label: 'Contract max moisture %', value: 13.5 }, { id: 'pr', label: 'Protein delivered %', value: 12.2 }, { id: 'pb', label: 'Protein base %', value: 12.5 }, { id: 'sc', label: 'Protein scale (USD/t per 1.0 point)', value: 15 }, { id: 'price', label: 'Base price (USD/t)', value: 260 }],
    compute: (v) => { const sh = C.moistureShrinkPct(v.m0, v.m1), dry = C.dryWeight(v.w, v.m0, v.m1), adj = (v.pr - v.pb) * v.sc, val0 = v.w * v.price, val1 = dry * (v.price + adj);
      return rows([['Water shrink to contract moisture', f(sh, 3) + '%'], ['Equivalent weight at contract moisture', f(dry, 1) + ' t'], ['Protein adjustment', f(adj) + ' /t'], ['Value at face weight & base price', 'USD ' + f(val0, 0)], ['Value adjusted', 'USD ' + f(val1, 0), 'total'], ['Difference', `<b class="${fmt.cls(val1 - val0)}">USD ${f(val1 - val0, 0)}</b>`]]); } });

  W.sdBalance = (el) => CTA.ui.calcWidget(el, { title: 'Supply-and-demand balance builder', intro: 'Million tonnes, one marketing year. The price indicator uses an illustrative inverse relationship to stocks-to-use: index = 100 × (base ratio / new ratio)^0.6 — a teaching device, not a model of any real market.', tag: CTA.ILLU,
    fields: [{ id: 'b', label: 'Beginning stocks', value: 270 }, { id: 'p', label: 'Production', value: 790 }, { id: 'i', label: 'Imports', value: 0 }, { id: 'c', label: 'Consumption', value: 795 }, { id: 'x', label: 'Exports', value: 0 }, { id: 'shock', label: 'Production shock %', value: 0 }],
    compute: (v) => { const base = C.balance({ beginning: v.b, production: v.p, imports: v.i, consumption: v.c, exports: v.x }); const nw = C.balance({ beginning: v.b, production: v.p * (1 + v.shock / 100), imports: v.i, consumption: v.c, exports: v.x });
      const idx = nw.stocksToUse > 0 ? 100 * Math.pow(base.stocksToUse / nw.stocksToUse, 0.6) : NaN;
      return rows([['Total supply', f(nw.supply, 1)], ['Total use', f(nw.use, 1)], ['Ending stocks', f(nw.ending, 1), 'total'], ['Stocks-to-use', fmt.pct(nw.stocksToUse, 1) + ' (base ' + fmt.pct(base.stocksToUse, 1) + ')'], ['Illustrative price index (base = 100)', isFinite(idx) ? f(idx, 1) : 'n/a — stocks exhausted']]) + (nw.ending < 0 ? '<div class="note bad"><strong>Impossible balance</strong>Ending stocks cannot be negative: consumption or exports must be rationed by price.</div>' : ''); } });

  W.sugarConvert = (el) => CTA.ui.calcWidget(el, { title: 'Sugar price converter and refining margin', fields: [{ id: 'raw', label: 'Raw sugar (c/lb)', value: 19.5 }, { id: 'white', label: 'White sugar (USD/t)', value: 545 }, { id: 'yield', label: 'Raw t per white t', value: 1.06 }, { id: 'cost', label: 'Refining cost (USD/t)', value: 75 }, { id: 'fr', label: 'Freight on raws (USD/t)', value: 25 }],
    compute: (v) => { const r = C.centsPerLbToUsdPerT(v.raw), wp = C.whitePremium(v.white, v.raw), m = C.refiningMargin({ whiteUsdPerT: v.white, rawCentsPerLb: v.raw, rawPerWhite: v.yield, refiningCostPerT: v.cost, freightRawPerT: v.fr });
      return rows([['Raw sugar in USD/t', f(r)], ['White in c/lb', f(C.usdPerTToCentsPerLb(v.white), 3)], ['White premium (USD/t)', f(wp)], ['Refining margin per t white', `<b class="${fmt.cls(m)}">${f(m)}</b>`, 'total']]); } });

  W.specBuilder = (el) => {
    const P0 = { rebar: ['Standard & edition', 'Grade', 'Ductility class', 'Diameters & size split', 'Length', 'Bundle weight', 'Weight basis & tolerance', 'Certificate type', 'Marking/tags'], hrc: ['Standard & edition', 'Grade', 'Thickness', 'Width', 'Thickness tolerance', 'Edge (mill/trimmed)', 'Coil ID / OD', 'Max coil weight', 'Surface (pickled/oiled?)', 'Certificate type'], hdg: ['Standard & edition', 'Base grade', 'Thickness', 'Width', 'Zinc coating mass', 'Surface treatment/passivation', 'Spangle', 'Coil weight', 'Certificate type'] };
    let prod = 'rebar';
    const draw = () => { const items = P0[prod]; el.innerHTML = `<div class="card soft"><div class="card-h"><h4 style="margin:0">Purchase specification builder</h4>${CTA.SIM}</div><p class="muted" style="font-size:.88rem">Convert an engineer's requirement into a complete specification. Fill each element; blank elements are flagged as dispute risks.</p>
      <div class="row"><label for="sbp">Product</label><select id="sbp" style="max-width:240px">${Object.keys(P0).map((k) => `<option value="${k}" ${k === prod ? 'selected' : ''}>${{ rebar: 'Rebar', hrc: 'Hot-rolled coil', hdg: 'Hot-dip galvanised coil' }[k]}</option>`).join('')}</select></div>
      <div class="form" style="margin-top:10px">${items.map((it, i) => `<div class="field"><label for="sb${i}">${it}</label><input type="text" id="sb${i}" data-k="${esc(it)}"></div>`).join('')}</div><div class="sb-out" style="margin-top:10px"></div></div>`;
      CTA.$('#sbp', el).onchange = (e) => { prod = e.target.value; draw(); };
      const upd = () => { const vals = CTA.$$('input[data-k]', el).map((i) => [i.dataset.k, i.value.trim()]); const miss = vals.filter((x) => !x[1]);
        CTA.$('.sb-out', el).innerHTML = `<div class="note ${miss.length ? 'warn' : 'ok'}"><strong>${miss.length ? miss.length + ' element(s) missing' : 'Specification complete'}</strong>${miss.length ? 'Missing: ' + miss.map((m) => esc(m[0])).join(', ') + '.' : ''}</div><div class="doc" style="font-size:.85rem"><b>PRODUCT SPECIFICATION (draft, fictional)</b><br>${vals.map(([k, v2]) => `${esc(k)}: ${v2 ? esc(v2) : '<span style="color:#c93535">[to be specified]</span>'}`).join('<br>')}</div>`; };
      el.addEventListener('input', upd); upd(); };
    draw();
  };

  W.steelWeight = (el) => CTA.ui.calcWidget(el, { title: 'Steel theoretical weight calculator', fields: [{ id: 'd', label: 'Rebar diameter (mm)', value: 16 }, { id: 'len', label: 'Bar length (m)', value: 12 }, { id: 'n', label: 'Number of bars', value: 100 }, { id: 't', label: 'Plate/coil thickness (mm)', value: 6 }, { id: 'w', label: 'Width (mm)', value: 1500 }, { id: 'l', label: 'Length (m)', value: 500 }],
    compute: (v) => { const kgm = C.rebarKgPerM(v.d), bar = kgm * v.len, tot = bar * v.n / 1000, pl = C.plateKg(v.t, v.w, v.l * 1000) / 1000;
      return rows([['Rebar mass per metre', f(kgm, 4) + ' kg/m (≈ d²/162.2 = ' + f(v.d * v.d / 162.2, 4) + ')'], ['Mass per bar', f(bar, 3) + ' kg'], ['Total rebar', f(tot, 3) + ' t', 'total'], ['Plate/coil weight', f(pl, 3) + ' t', 'total']]) + '<p class="muted" style="font-size:.84rem">Theoretical values at 7,850 kg/m³. Actual weights vary within standard tolerances.</p>'; } });

  W.millMargin = (el) => CTA.ui.calcWidget(el, { title: 'Steel mill raw-material spread (illustrative ratios)', tag: CTA.ILLU, intro: 'Ratios and costs are simplified teaching assumptions. Conversion costs differ widely by plant.',
    fields: [{ id: 'hrc', label: 'Finished steel price (USD/t)', value: 640 }, { id: 'ore', label: 'Iron ore (USD/t)', value: 110 }, { id: 'coal', label: 'Coking coal (USD/t)', value: 250 }, { id: 'scrap', label: 'Scrap (USD/t)', value: 380 }, { id: 'power', label: 'Electricity (USD/MWh)', value: 90 }, { id: 'conv', label: 'Other conversion cost (USD/t)', value: 120 }],
    compute: (v) => { const bf = 1.6 * v.ore + 0.7 * v.coal, eaf = 1.1 * v.scrap + 0.45 * v.power;
      return rows([['BF-BOF raw materials (1.6 t ore + 0.7 t coal)', f(bf)], ['BF-BOF spread', `<b class="${fmt.cls(v.hrc - bf - v.conv)}">${f(v.hrc - bf)}</b> (after conversion: ${f(v.hrc - bf - v.conv)})`], ['EAF metallics + power (1.1 t scrap + 0.45 MWh)', f(eaf)], ['EAF spread', `<b class="${fmt.cls(v.hrc - eaf - v.conv)}">${f(v.hrc - eaf)}</b> (after conversion: ${f(v.hrc - eaf - v.conv)})`]]); } });

  W.offerCompare = (el) => {
    const offers = [['Supplier A', 'FOB', 548, 42, 0, 0, 4], ['Supplier B', 'CFR', 586, 0, 0, 30, 1], ['Supplier C', 'FOB', 552, 38, -3, 0, 2]];
    el.innerHTML = `<div class="card soft"><div class="card-h"><h4 style="margin:0">Supplier offer comparison</h4>${CTA.SIM}</div><p class="muted" style="font-size:.88rem">Edit offers. Adjusted CFR = price + freight (if FOB) + quality adjustment + financing of advance payment (8% p.a. for the days paid early) + risk adjustment.</p>
      <div class="table-wrap"><table><thead><tr><th>Supplier</th><th>Basis</th><th>Price</th><th>Freight</th><th>Quality adj.</th><th>Advance %</th><th>Risk adj.</th><th class="r">Adjusted CFR</th></tr></thead><tbody>${offers.map((o, i) => `<tr data-i="${i}"><td>${o[0]}</td><td><select data-k="b"><option ${o[1] === 'FOB' ? 'selected' : ''}>FOB</option><option ${o[1] === 'CFR' ? 'selected' : ''}>CFR</option></select></td>${[2, 3, 4, 5, 6].map((k) => `<td><input type="number" step="any" data-k="${k}" value="${o[k]}" style="width:80px" aria-label="${o[0]} field ${k}"></td>`).join('')}<td class="r num out"></td></tr>`).join('')}</tbody></table></div><div class="oc-out"></div></div>`;
    const upd = () => { const res = CTA.$$('tr[data-i]', el).map((tr) => { const g = (k) => CTA.num(CTA.$(`[data-k="${k}"]`, tr).value); const basis = CTA.$('[data-k=b]', tr).value; const price = g(2); const adv = price * g(5) / 100 * 0.08 * 45 / 360; const adj = price + (basis === 'FOB' ? g(3) : 0) + g(4) + adv + g(6); CTA.$('.out', tr).textContent = f(adj); return [tr, adj]; });
      const best = res.reduce((a, b) => (b[1] < a[1] ? b : a)); res.forEach(([tr]) => tr.classList.toggle('sel', tr === best[0]));
      CTA.$('.oc-out', el).innerHTML = `<div class="note ok"><strong>Lowest adjusted delivered cost: ${esc(CTA.$('td', best[0]).textContent)} at ${f(best[1])}/t</strong>Also check feasibility: shipment window, origin eligibility, packaging and food-safety documentation.</div>`; };
    el.addEventListener('input', upd); el.addEventListener('change', upd); upd();
  };

  W.incotermMini = (el) => {
    const I = CTA.INCOTERMS || []; let cur = 'FOB';
    const draw = () => { const t = I.find((x) => x.code === cur) || I[0]; el.innerHTML = `<div class="card soft"><div class="row">${I.map((x) => `<button class="btn sm ${x.code === cur ? 'primary' : ''}" data-c="${x.code}">${x.code}</button>`).join('')}</div>
      ${t ? `<h4 style="margin-top:10px">${t.code} — ${esc(t.name)} <span class="badge ${t.sea ? 'warn' : 'info'}">${t.sea ? 'Sea & inland waterway only' : 'Any mode'}</span></h4>${CTA.table(['Item', 'Allocation'], [['Delivery / risk transfer', t.risk], ['Main carriage paid by', t.carriage], ['Insurance', t.insurance], ['Export clearance', t.exp], ['Import clearance & duties', t.imp], ['Commodity notes', t.note]])}<a class="btn sm" href="#/finance/incoterms">Full comparison tool →</a>` : ''}</div>`;
      CTA.$$('[data-c]', el).forEach((b) => { b.onclick = () => { cur = b.dataset.c; draw(); }; }); };
    draw();
  };

  W.laytimeMini = (el) => CTA.ui.calcWidget(el, { title: 'Laytime, demurrage and despatch', fields: [{ id: 'q', label: 'Cargo (t)', value: 30000 }, { id: 'rate', label: 'Rate (t per day)', value: 6000 }, { id: 'used', label: 'Time used (days)', value: 7.25 }, { id: 'dem', label: 'Demurrage (USD/day)', value: 15000 }, { id: 'des', label: 'Despatch (USD/day)', value: 7500 }],
    compute: (v) => { const r = C.laytime({ qty: v.q, rateTPerDay: v.rate, timeUsedDays: v.used, demurragePerDay: v.dem, despatchPerDay: v.des });
      return rows([['Laytime allowed', f(r.allowed, 3) + ' days'], ['Time used − allowed', f(r.diff, 3) + ' days'], ['Demurrage due to owner', `<b class="${r.demurrage ? 'neg' : ''}">USD ${f(r.demurrage)}</b>`], ['Despatch due from owner', `<b class="${r.despatch ? 'pos' : ''}">USD ${f(r.despatch)}</b>`]]) + '<p class="muted" style="font-size:.84rem">Simplified: no laytime exceptions (weekends, weather, shifting) and no notice time. Real laytime statements apply the charter party clauses.</p>'; } });

  W.specTable = (el) => { const S = CTA.MARKET.specs();
    el.innerHTML = `${CTA.table(['Code', 'Contract', 'Quote unit', 'Size', 'Tick', 'Tick value (USD)', 'Initial / maint. margin (USD)', 'Note'], Object.entries(S).map(([k, s]) => [k, s.name, s.unit, s.size, s.tick, f(s.tick * s.pointValue), f(s.im, 0) + ' / ' + f(s.mm, 0), s.note]))}<p class="muted" style="font-size:.84rem">${CTA.ILLU} Illustrative values for training, editable in Settings. Margins are set by exchanges/brokers and change frequently.</p>`; };

  W.hedgeDemo = (el) => CTA.ui.calcWidget(el, { title: 'Hedge outcome with basis', fields: [{ id: 'q', label: 'Physical quantity (t)', value: 20000 }, { id: 's0', label: 'Cash price at start', value: 245 }, { id: 'f0', label: 'Futures at start (USD/t eq.)', value: 252 }, { id: 's1', label: 'Cash price at end', value: 223 }, { id: 'f1', label: 'Futures at end', value: 233 }, { id: 'hr', label: 'Hedge ratio', value: 1 }],
    compute: (v) => { const h = C.hedgeOutcome({ qty: v.q, spot0: v.s0, spot1: v.s1, fut0: v.f0, fut1: v.f1, hedgeRatio: v.hr });
      return rows([['Physical inventory P&L', `<span class="${fmt.cls(h.physical)}">${f(h.physical, 0)}</span>`], ['Short futures P&L', `<span class="${fmt.cls(h.futures)}">${f(h.futures, 0)}</span>`], ['Net hedged result', `<b class="${fmt.cls(h.net)}">${f(h.net, 0)}</b>`, 'total'], ['Basis start → end', f(h.basis0) + ' → ' + f(h.basis1) + ' (change ' + f(h.basisChange) + ')']]) + `<p class="muted" style="font-size:.85rem">With a 1:1 hedge the net result equals quantity × basis change. Unhedged, the loss would have been ${f(h.physical, 0)}.</p>`; } });

  W.optionPayoff = (el) => CTA.ui.calcWidget(el, { title: 'Option pricer (Black-76) and payoff at expiry', tag: CTA.ILLU, fields: [{ id: 'type', label: 'Type', type: 'select', value: 'call', options: ['call', 'put'] }, { id: 'side', label: 'Position', type: 'select', value: 'long', options: ['long', 'short'] }, { id: 'F', label: 'Futures price', value: 2000 }, { id: 'K', label: 'Strike', value: 2000 }, { id: 'days', label: 'Days to expiry', value: 60 }, { id: 'vol', label: 'Implied vol %', value: 16 }, { id: 'r', label: 'Interest rate %', value: 4 }],
    compute: (v, out) => { const o = C.black76(v.F, v.K, v.days / 365, v.r / 100, v.vol / 100, v.type); el._opt = { v, prem: o.price };
      return CTA.ui.kpis([{ label: 'Premium', value: f(o.price) }, { label: 'Intrinsic', value: f(o.intrinsic) }, { label: 'Time value', value: f(o.price - o.intrinsic) }, { label: 'Delta', value: f(o.delta, 3) }, { label: 'Gamma', value: f(o.gamma, 5) }, { label: 'Theta / day', value: f(o.theta, 3) }, { label: 'Vega / vol pt', value: f(o.vega, 3) }]) + `<div class="op-chart"></div><p class="muted" style="font-size:.84rem">Greeks shown for a long position. Break-even at expiry: ${v.type === 'call' ? f(v.K + o.price) : f(v.K - o.price)}.</p>`; },
    after: (v, out) => { const { prem } = el._opt; const xs = []; for (let i = 0; i <= 60; i++) xs.push(v.F * (0.8 + 0.4 * i / 60)); CTA.chart(CTA.$('.op-chart', out), { height: 200, zero: true, labels: xs.map((x) => f(x, 0)), series: [{ data: xs.map((x) => C.optionPayoff(v.type, v.side, v.K, prem, x)), label: 'P&L at expiry per unit', color: 'var(--c1)' }, { data: xs.map((x) => (v.side === 'long' ? 1 : -1) * (C.black76(x, v.K, v.days / 365, v.r / 100, v.vol / 100, v.type).price - prem)), label: 'Value today − premium', color: 'var(--c2)', dash: '5 4' }] }); } });

  W.carryCalc = (el) => CTA.ui.calcWidget(el, { title: 'Cost of carry and cash-and-carry check', fields: [{ id: 's', label: 'Spot (/t)', value: 230 }, { id: 'fwd', label: 'Deferred futures/forward (/t)', value: 241 }, { id: 'm', label: 'Months', value: 3 }, { id: 'st', label: 'Storage (/t/month)', value: 2.2 }, { id: 'r', label: 'Financing % p.a.', value: 7 }, { id: 'ins', label: 'Insurance % p.a.', value: 0.15 }],
    compute: (v) => { const carry = v.st * v.m + v.s * v.r / 100 * v.m * 30 / 360 + v.s * v.ins / 100 * v.m / 12; const spread = v.fwd - v.s;
      return rows([['Market spread (deferred − spot)', f(spread)], ['Full carry cost', f(carry)], ['Cash-and-carry result per t', `<b class="${fmt.cls(spread - carry)}">${f(spread - carry)}</b>`], ['Spread as % of full carry', fmt.pct(spread / carry * 100, 0)]]) + `<p class="muted" style="font-size:.84rem">${spread > carry ? 'Spread exceeds full carry: storing and selling forward pays (if storage and financing are actually available).' : spread < 0 ? 'Inverted (backwardation): the market pays you to sell stock now.' : 'Below full carry: storing does not pay unless you need the stock.'}</p>`; } });
})();
