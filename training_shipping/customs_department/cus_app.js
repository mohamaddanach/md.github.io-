/* Customs module — department app config, tariff browser and Lebanon customs guide */
(function () {
  const L = TS.L, t = TS.t, esc = TS.esc;
  const CUS = window.CUS;
  CUS.steps = CUS.steps || [];

  function viewTariff(main) {
    main.innerHTML = `<h1>📚 ${t(L('Tariff extract', 'مقتطف من التعرفة'))}</h1><div class="note warn">${t(CUS.disclaimer)}</div>
      <input type="text" id="tq" placeholder="${t(L('Search code or words…', 'ابحث عن رمز أو كلمات…'))}" style="max-width:360px;margin-bottom:10px">
      <div id="tt"></div>
      <div class="card lesson"><h3>${t(L('Reading an HS code', 'قراءة رمز HS'))}</h3>${t(L('<p><b>94</b> chapter (furniture) · <b>9403</b> heading (other furniture) · <b>9403.60</b> subheading (other wooden furniture). The first 6 digits are the same worldwide; Lebanon adds national digits for its own rates.</p>', '<p><b>94</b> الفصل (الأثاث) · <b>9403</b> البند (أثاث آخر) · <b>9403.60</b> البند الفرعي (أثاث خشبي آخر). الأرقام الستة الأولى موحّدة عالميًا؛ ويضيف لبنان أرقامًا وطنية لنسبه الخاصة.</p>'))}</div>`;
    const draw = () => {
      const q = TS.norm(main.querySelector('#tq').value);
      main.querySelector('#tt').innerHTML = TS.ui.table(['HS', L('Description', 'الوصف'), { l: L('Sample duty %', 'نسبة الرسم (مثال) %'), num: 1 }], CUS.tariff.filter((x) => !q || TS.norm(x.hs + ' ' + x.d.en + ' ' + x.d.ar).includes(q)).map((x) => `<tr><td class="mono"><b>${x.hs}</b></td><td>${esc(t(x.d))}</td><td class="num">${x.duty}</td></tr>`));
    };
    main.querySelector('#tq').oninput = draw;
    draw();
  }
  function viewGuide(main) {
    main.innerHTML = `<h1>🇱🇧 ${t(L('Lebanese customs — what a broker needs', 'الجمارك اللبنانية — ما يحتاجه المخلّص'))}</h1><div class="note warn">${t(CUS.disclaimer)}</div>${CUS.guide.map((g) => `<div class="card lesson"><h3>${t(g.h)}</h3>${t(g.b)}</div>`).join('')}`;
  }
  function viewFile(main, app) {
    const s = app.ship, d = CUS.d(s), h = CUS.handoff(s), p = h.pack;
    main.innerHTML = `<h1>🗂 ${t(L('Hand-off from Operations', 'التسليم من العمليات'))}</h1><p class="muted">${esc(h.type)} · ${t(L('received', 'استُلم'))} ${TS.fmtDate(h.sentSim)} · <span class="badge info">${esc(h.status)}</span></p>
      ${TS.ui.table([L('Field', 'الحقل'), L('Value', 'القيمة')], [
        [L('Exporter', 'المصدّر'), esc(p.exporter.name)], [L('Importer', 'المستورد'), esc(p.importer.name) + (p.importer.reg ? ' — ' + esc(p.importer.reg) : '')],
        [L('Goods (Operations)', 'البضاعة (العمليات)'), esc(p.commodity) + ' — HS ' + esc(p.hsProvided)], [L('Packages / weights', 'الطرود / الأوزان'), `${p.packages} ${esc(p.packageType)} · ${TS.num(p.grossKg, 0)} kg gross · ${TS.num(p.netKg, 0)} kg net`],
        [L('Invoice', 'الفاتورة'), `${esc(p.currency)} ${TS.num(p.invoiceValue)} — ${esc(p.incoterm)}`], [L('Transport', 'النقل'), p.transport ? `${esc(p.transport.carrier)} · ${esc(p.transport.vessel)} · ${esc(p.transport.pol)} → ${esc(p.transport.pod)}` : '—'],
        [L('Container', 'الحاوية'), p.container ? `${esc(p.container.no)} · seal ${esc(p.container.seal)}` : '—'], [L('B/L', 'البوليصة'), p.bl ? `MBL ${esc(p.bl.mbl)} · HBL ${esc(p.bl.hbl)}` : '—'],
        ...(p.customsValueCIF ? [[L('CIF computed by Operations', 'CIF المحتسب من العمليات'), 'USD ' + TS.num(p.customsValueCIF)]] : []),
      ].map(([k, v]) => `<tr><th style="width:240px">${t(k)}</th><td>${v}</td></tr>`))}
      <h2>${t(L('Detailed commercial invoice (supplier)', 'الفاتورة التجارية المفصّلة (المورّد)'))}</h2>
      ${TS.ui.table([L('Item', 'الصنف'), L('HS given', 'الرمز المعطى'), { l: L('Qty', 'الكمية'), num: 1 }, { l: L('Packages', 'الطرود'), num: 1 }, { l: L('Gross kg', 'القائم كغ'), num: 1 }, { l: L('Net kg', 'الصافي كغ'), num: 1 }, { l: 'USD', num: 1 }], d.items.map((x) => `<tr><td>${esc(TS.lang === 'ar' ? x.descAr : x.desc)}</td><td class="mono">${x.hsGiven}</td><td class="num">${x.qty} ${x.unit}</td><td class="num">${x.pkgs}</td><td class="num">${TS.num(x.gross, 0)}</td><td class="num">${TS.num(x.net, 0)}</td><td class="num">${TS.num(x.value)}</td></tr>`))}`;
  }

  TS.deptApp(CUS, {
    key: 'customs', prefix: 'cus_', session: 'cus_job', email: CUS.company.email, icon: '🛃',
    title: L('Customs Department', 'قسم الجمارك'),
    hero: L('Files handed over by Operations arrive here inside the shipment JSON. As the licensed broker you check the documents, classify the goods, build the customs value, calculate duties and import VAT, prepare and lodge the declaration in NAJM, handle the inspection lane, pay and obtain the release — Lebanese procedure, import into Beirut and export from Lebanon.', 'تصل هنا الملفات التي سلّمتها العمليات داخل ملف JSON للشحنة. كمخلّص مرخّص تدقّق المستندات، تصنّف البضاعة، تحتسب القيمة الجمركية والرسوم وضريبة الاستيراد، تحضّر البيان وتقدّمه على نجم، تتعامل مع مسار الكشف، تدفع وتحصل على الإفراج — وفق الإجراء اللبناني، استيرادًا إلى بيروت وتصديرًا من لبنان.'),
    jobsTitle: L('Customs files received from Operations', 'ملفات الجمارك الواردة من العمليات'),
    emptyNote: L('No file has been handed to Customs yet. Reach the customs step in Operations (step 6 for exports, step 10 for imports), import a JSON file, or load a sample below.', 'لم يُسلَّم أي ملف للجمارك بعد. صِل إلى مرحلة الجمارك في العمليات (المرحلة 6 للتصدير، 10 للاستيراد)، أو استورد ملف JSON، أو حمّل نموذجًا أدناه.'),
    disclaimer: CUS.disclaimer, dateLabel: L('Customs date', 'التاريخ الجمركي'),
    insight: (id, s) => (CUS.insight ? CUS.insight(id, s) : ''), alerts: (s) => (CUS.alerts ? CUS.alerts(s) : []), homeKpis: (l) => (CUS.homeKpis ? CUS.homeKpis(l) : ''),
    handoff: CUS.handoff,
    init: () => ({}),
    samples: () => window.ACC_SAMPLES || [],
    prepareSample: (s) => { const h = CUS.handoff(s); h.status = 'submitted'; delete h.result; },
    nav: [{ v: 'file', icon: '🗂', l: L('Hand-off file', 'ملف التسليم'), view: viewFile }],
    learn: [{ v: 'guide', icon: '🇱🇧', l: L('Lebanese customs guide', 'دليل الجمارك اللبنانية'), view: viewGuide }, { v: 'tariff', icon: '📚', l: L('Tariff extract', 'مقتطف التعرفة'), view: viewTariff }, { v: 'drills', icon: '🎯', l: L('Drills (endless practice)', 'تمارين (تدريب لا ينتهي)'), view: (main) => TS.drillsView(main, 'cus') }],
  });
})();
