/* Customs module — tariff extract (sample rates), item breakdowns, valuation & duty calculations, Lebanon customs guide */
(function () {
  const L = TS.L, R = TS.round2;
  const CUS = (window.CUS = window.CUS || {});

  CUS.company = { name: 'Phoenicia Freight Training SAL — Customs Department', email: 'customs@phoenicia-freight.test', licence: 'Licensed customs broker no. CB-0427 (training)' };
  CUS.VAT = 0.11;
  CUS.RATE = 89500; // sample customs exchange rate LBP/USD — always check the official rate in force

  /* Tariff extract — SAMPLE training rates built from the commodity catalogue (not the official Lebanese tariff) */
  CUS.tariff = Object.values(TS.TARIFF || {}).sort((x, y) => x.hs.localeCompare(y.hs));
  CUS.rateOf = (hs) => { const r = (TS.TARIFF || {})[hs]; return r ? r.duty : null; };
  CUS.descOf = (hs) => { const r = (TS.TARIFF || {})[hs]; return r ? r.d : L(hs, hs); };
  /* the tariff lines relevant to a file: the right codes, the codes the supplier gave and plausible distractors */
  CUS.tariffFor = (s) => { const sc = s.case || {}, set = new Set(); TS.cargoItems(s).forEach((x) => { set.add(x.hs); set.add(x.hsGiven || x.hs); }); (sc.distract || []).forEach((h) => set.add(h)); return CUS.tariff.filter((x) => set.has(x.hs)); };

  /* the supplier's detailed invoice lines (shared with the other departments' documents) */
  CUS.itemsFor = (s) => TS.cargoItems(s);

  const seed = (s) => s.id.split('').reduce((a, c) => (a * 31 + c.charCodeAt(0)) % 999983, 7);
  CUS.handoff = (s) => s.handoffs && (s.handoffs.customs_import || s.handoffs.customs_export);
  const Q = (l) => Number(l.sell || 0) * (l.qty || 1);
  const LANES = ['green', 'yellow', 'yellow', 'red'];
  CUS.PREF = { EUR1: L('EU — EUR.1 (EU–Lebanon Association Agreement)', 'الاتحاد الأوروبي — EUR.1 (اتفاقية الشراكة)'), GAFTA: L('GAFTA — Arab certificate of origin', 'منطقة التجارة العربية — شهادة منشأ عربية'), none: L('None — full (MFN) duty', 'لا شيء — الرسم الكامل') };

  CUS.d = (s) => {
    const imp = s.direction === 'import', sc = s.case || {};
    const h = CUS.handoff(s), p = h.pack;
    const items = CUS.itemsFor(s).map((x) => Object.assign({}, x));
    const valTotal = R(items.reduce((a, x) => a + x.value, 0));
    const q = s.quotation, act = q.lines.filter((l) => l.group !== 'optional' || q.insurance);
    const freightSold = R(act.filter((l) => l.group === 'freight' && l.code !== 'INS').reduce((a, l) => a + Q(l), 0) + (s.lclAdj ? s.lclAdj.sell : 0));
    const eta = (s.booking && (s.booking.revisedEta || s.booking.eta)) || s.sim.today;
    const lcl = sc.mode === 'LCL', inc = (s.jobFile && s.jobFile.incoterm) || 'FOB';
    const out = { imp, h, p, items, valTotal, freightSold, seed: seed(s), lcl, inc, sc, multi: items.length > 1 };
    const alloc = (total, key) => { let acc = 0; items.forEach((x, i) => { const last = i === items.length - 1; x[key] = last ? R(total - acc) : R((total * x.value) / valTotal); acc = R(acc + x[key]); }); };
    out.origin = sc.originCC || (imp ? 'CN' : 'LB'); out.consigned = sc.consignCC || out.origin; out.destination = sc.destCC || 'LB';
    out.pref = sc.pref || 'none';
    if (imp) {
      const freight = R(p.freight != null ? p.freight : freightSold), ins = R(p.insurance || 0);
      alloc(freight, 'freight'); alloc(ins, 'ins');
      items.forEach((x) => {
        x.cif = R(x.value + x.freight + x.ins);
        x.mfn = CUS.rateOf(x.hs); x.rate = out.pref !== 'none' ? 0 : x.mfn;
        x.duty = R((x.cif * x.rate) / 100);
        x.vatBase = R(x.cif + x.duty);
        x.vat = R(x.vatBase * CUS.VAT);
      });
      const T = (k) => R(items.reduce((a, x) => a + x[k], 0));
      const lane = LANES[seed(s) % 4];
      Object.assign(out, {
        freight, ins, cif: T('cif'), duty: T('duty'), vatBase: T('vatBase'), vat: T('vat'),
        taxes: R(T('duty') + T('vat')), wrongDuty: R(items.reduce((a, x) => a + (x.cif * (out.pref !== 'none' ? 0 : CUS.rateOf(x.hsGiven || x.hs) || 0)) / 100, 0)),
        declNo: 'IM/' + eta.slice(0, 4) + '/' + (seed(s) % 90000 + 10000), lane,
        lodge: TS.addDays(eta, 2), release: TS.addDays(eta, { green: 3, yellow: 6, red: 9 }[lane] + (lcl ? 1 : 0)), regime: 'IMPORT_HOME',
      });
      out.cifLBP = Math.round(out.cif * CUS.RATE); out.taxesLBP = Math.round(out.taxes * CUS.RATE);
    } else {
      /* FOB = invoice price minus everything after the Lebanese border that is included in the price */
      const insL = act.find((l) => l.code === 'INS'), insV = inc === 'CIF' && insL ? R(Number(insL.sell)) : 0;
      const destV = inc === 'DAP' ? R(act.filter((l) => l.group === 'dest').reduce((a, l) => a + Q(l), 0)) : 0;
      const deduct = R(freightSold + insV + destV);
      alloc(deduct, 'deduct');
      items.forEach((x) => { x.fob = R(x.value - x.deduct); x.rate = 0; x.duty = 0; });
      const stuffed = (s.equipment && s.equipment.stuffedOn) || s.sim.today;
      Object.assign(out, {
        invoice: valTotal, cfr: valTotal, insDeducted: insV, destDeducted: destV, deduct, fob: R(valTotal - deduct), taxes: 0,
        declNo: 'EX/' + stuffed.slice(0, 4) + '/' + (seed(s) % 90000 + 10000), lane: 'green',
        lodge: stuffed, release: stuffed, regime: 'EXPORT_DEF',
      });
      out.fobLBP = Math.round(out.fob * CUS.RATE);
    }
    out.pkgs = items.reduce((a, x) => a + x.pkgs, 0);
    out.gross = items.reduce((a, x) => a + x.gross, 0);
    out.net = items.reduce((a, x) => a + x.net, 0);
    return out;
  };

  CUS.regimes = [
    { v: 'IMPORT_HOME', l: L('Definitive import for home use (consumption)', 'استيراد نهائي للاستهلاك المحلي') },
    { v: 'TEMP_ADM', l: L('Temporary admission', 'إدخال مؤقت') },
    { v: 'TRANSIT', l: L('Transit', 'ترانزيت (عبور)') },
    { v: 'FREE_ZONE', l: L('Entry into free zone', 'إدخال إلى المنطقة الحرة') },
    { v: 'EXPORT_DEF', l: L('Definitive export', 'تصدير نهائي') },
    { v: 'REEXPORT', l: L('Re-export', 'إعادة تصدير') },
  ];
  const CN = { LB: ['Lebanon', 'لبنان'], CN: ['China', 'الصين'], MY: ['Malaysia', 'ماليزيا'], VN: ['Vietnam', 'فيتنام'], IN: ['India', 'الهند'], TR: ['Türkiye', 'تركيا'], IT: ['Italy', 'إيطاليا'], ES: ['Spain', 'إسبانيا'], FR: ['France', 'فرنسا'], CY: ['Cyprus', 'قبرص'], EG: ['Egypt', 'مصر'], DE: ['Germany', 'ألمانيا'], NL: ['Netherlands', 'هولندا'], GB: ['United Kingdom', 'المملكة المتحدة'], AE: ['United Arab Emirates', 'الإمارات'], SA: ['Saudi Arabia', 'السعودية'], BR: ['Brazil', 'البرازيل'], US: ['United States', 'الولايات المتحدة'], CA: ['Canada', 'كندا'], AU: ['Australia', 'أستراليا'], GR: ['Greece (transshipment)', 'اليونان (مسافنة)'], MT: ['Malta (transshipment)', 'مالطا (مسافنة)'] };
  CUS.countries = Object.entries(CN).map(([v, [en, ar]]) => ({ v, l: L(v + ' — ' + en, v + ' — ' + ar) }));
  CUS.countryName = (cc) => (CN[cc] ? CN[cc][0] : cc);
  CUS.prefs = [{ v: 'none', l: CUS.PREF.none }, { v: 'GAFTA', l: CUS.PREF.GAFTA }, { v: 'EUR1', l: CUS.PREF.EUR1 }, { v: 'EFTA', l: L('EFTA — EUR.1', 'EFTA — EUR.1') }];

  /* ---------------- Lebanon customs guide ---------------- */
  CUS.guide = [
    {
      h: L('1. Legal framework', '١. الإطار القانوني'),
      b: L(`<ul><li><b>Lebanese Customs Code</b> — Decree No. 4461 of 15/12/2000, with the decisions of the Higher Council of Customs and the Director General of Customs.</li><li>The <b>Lebanese Customs Administration</b> (Ministry of Finance) applies the tariff, collects duties and import VAT on behalf of the State, and controls prohibited and restricted goods.</li><li>The <b>customs tariff</b> is based on the Harmonized System (HS). Each code has a duty rate (ad valorem %, sometimes specific), plus excise on some goods (fuel, tobacco, alcohol, vehicles…).</li></ul>`,
        `<ul><li><b>قانون الجمارك اللبناني</b> — المرسوم رقم 4461 تاريخ 15/12/2000، مع قرارات المجلس الأعلى للجمارك والمدير العام للجمارك.</li><li><b>إدارة الجمارك اللبنانية</b> (وزارة المالية) تطبّق التعرفة، وتحصّل الرسوم وضريبة القيمة المضافة على الاستيراد لصالح الدولة، وتراقب البضائع الممنوعة والمقيّدة.</li><li><b>التعرفة الجمركية</b> مبنية على النظام المنسّق (HS). لكل رمز نسبة رسم (نسبية %، وأحيانًا نوعية)، إضافة إلى رسوم الاستهلاك على بعض السلع (محروقات، تبغ، كحول، سيارات…).</li></ul>`),
    },
    {
      h: L('2. The declarant and NAJM', '٢. المصرِّح ونظام نجم'),
      b: L(`<ul><li>Declarations are lodged electronically in <b>NAJM</b> by a <b>licensed customs broker (مخلّص جمركي)</b> acting for the importer/exporter. The broker is responsible for the accuracy of what he declares.</li><li>The carrier’s agent submits the <b>manifest</b>; the declaration must match it (B/L number, packages, weight). Differences must be corrected before or during clearance.</li><li>After lodging, the system assigns a <b>risk lane</b>: green (release without inspection), yellow (document check), red (physical inspection, often with X-ray scanning at the port).</li></ul>`,
        `<ul><li>تُقدَّم البيانات إلكترونيًا على <b>نظام نجم</b> من قبل <b>مخلّص جمركي مرخّص</b> يعمل لصالح المستورد/المصدّر. المخلّص مسؤول عن صحة ما يصرّح به.</li><li>يقدّم وكيل الخط <b>المانيفست</b>؛ ويجب أن يطابقه البيان (رقم البوليصة، الطرود، الوزن). الفروقات تُصحّح قبل التخليص أو خلاله.</li><li>بعد التقديم يحدّد النظام <b>مسار المخاطر</b>: الأخضر (إفراج بدون كشف)، الأصفر (تدقيق مستندات)، الأحمر (كشف حسّي، غالبًا مع التصوير بالأشعة في المرفأ).</li></ul>`),
    },
    {
      h: L('3. Customs value', '٣. القيمة الجمركية'),
      b: L(`<ul><li>Lebanon taxes imports on the <b>CIF value</b>: the transaction value (price actually paid) plus freight and insurance up to the Lebanese port.</li><li>When several items share one container, freight and insurance are <b>allocated</b> to each item (usually in proportion to value).</li><li>Foreign currency is converted to LBP at the <b>customs exchange rate</b> set by the authorities — it has changed several times since 2022; always check the rate in force.</li><li>Under-invoicing, splitting invoices or false descriptions are customs offences (fines, seizure, criminal liability).</li></ul>`,
        `<ul><li>يفرض لبنان الرسوم على <b>قيمة CIF</b>: قيمة الصفقة (الثمن المدفوع فعلًا) مع الشحن والتأمين حتى المرفأ اللبناني.</li><li>عندما تتشارك عدة أصناف حاوية واحدة، <b>يُوزَّع</b> الشحن والتأمين على كل صنف (عادة بنسبة القيمة).</li><li>تُحوَّل العملة الأجنبية إلى الليرة <b>بسعر الصرف الجمركي</b> الذي تحدّده السلطات — تغيّر عدة مرات منذ 2022؛ تحقّق دائمًا من السعر النافذ.</li><li>تخفيض الفاتورة أو تجزئتها أو الوصف الكاذب مخالفات جمركية (غرامات، مصادرة، مسؤولية جزائية).</li></ul>`),
    },
    {
      h: L('4. Duties and taxes', '٤. الرسوم والضرائب'),
      b: L(`<ul><li><b>Customs duty</b> = CIF × tariff rate (reduced or zero with a valid preferential origin document: GAFTA, EU EUR.1, EFTA).</li><li><b>Excise</b> on specific goods.</li><li><b>Import VAT 11%</b> on (CIF + duty + excise).</li><li>The importer pays before release; a VAT-registered importer can recover the import VAT as input VAT.</li><li>Exports from Lebanon generally carry no export duty; the export declaration and the <b>proof of export</b> support VAT zero-rating.</li></ul>`,
        `<ul><li><b>الرسم الجمركي</b> = CIF × نسبة التعرفة (مخفّض أو صفر مع مستند منشأ تفضيلي صالح: منطقة التجارة العربية، EUR.1، EFTA).</li><li><b>رسم الاستهلاك</b> على سلع محدّدة.</li><li><b>ضريبة القيمة المضافة 11%</b> على (CIF + الرسم + رسم الاستهلاك).</li><li>يدفع المستورد قبل الإفراج؛ ويمكن للمستورد المسجّل استرداد ضريبة الاستيراد كضريبة مدخلات.</li><li>الصادرات من لبنان لا تخضع عمومًا لرسوم تصدير؛ وبيان التصدير و<b>إثبات التصدير</b> يدعمان المعدّل الصفري للضريبة.</li></ul>`),
    },
    {
      h: L('5. Restricted and prohibited goods', '٥. البضائع المقيّدة والممنوعة'),
      b: L(`<ul><li>Some goods need a licence or approval before import: medicines and some foods (Ministry of Public Health), plants and animal products (Ministry of Agriculture), certain regulated products and standards (Ministry of Economy & Trade, LIBNOR), radio/telecom equipment (Ministry of Telecommunications), arms, chemicals…</li><li>Goods of Israeli origin are prohibited (boycott law).</li><li>Dangerous goods must be declared — after August 2020 controls at Beirut port are very strict.</li></ul>`,
        `<ul><li>بعض البضائع تحتاج ترخيصًا أو موافقة قبل الاستيراد: الأدوية وبعض الأغذية (وزارة الصحة)، النباتات والمنتجات الحيوانية (وزارة الزراعة)، بعض المنتجات المنظّمة والمواصفات (وزارة الاقتصاد والتجارة، ليبنور)، أجهزة الاتصال اللاسلكي (وزارة الاتصالات)، الأسلحة، المواد الكيميائية…</li><li>البضائع ذات المنشأ الإسرائيلي ممنوعة (قانون المقاطعة).</li><li>يجب التصريح عن البضائع الخطرة — بعد آب 2020 أصبحت الرقابة في مرفأ بيروت صارمة جدًا.</li></ul>`),
    },
    {
      h: L('6. Other regimes', '٦. أنظمة جمركية أخرى'),
      b: L(`<ul><li><b>Temporary admission</b> (exhibitions, equipment for projects) — duties suspended against a guarantee, goods must leave within the deadline.</li><li><b>Transit</b> — goods crossing Lebanon under customs control (e.g. to Syria/Gulf) with a guarantee.</li><li><b>Free zones</b> (e.g. Beirut port free zone, Tripoli Special Economic Zone) — goods stored without paying duty until they enter the local market.</li><li><b>Re-export</b> — goods leaving again without being consumed in Lebanon.</li></ul>`,
        `<ul><li><b>الإدخال المؤقت</b> (معارض، معدّات مشاريع) — الرسوم معلّقة مقابل كفالة، ويجب إخراج البضاعة ضمن المهلة.</li><li><b>الترانزيت</b> — بضائع تعبر لبنان تحت رقابة الجمارك (مثلًا إلى سوريا/الخليج) مع كفالة.</li><li><b>المناطق الحرة</b> (مثل المنطقة الحرة في مرفأ بيروت، المنطقة الاقتصادية الخاصة في طرابلس) — تُخزَّن البضائع بدون رسوم حتى دخولها السوق المحلي.</li><li><b>إعادة التصدير</b> — بضائع تخرج مجددًا دون أن تُستهلك في لبنان.</li></ul>`),
    },
  ];
  CUS.disclaimer = L('Training content. Tariff rates, the customs exchange rate and procedure details here are SAMPLES. Always check the current Lebanese tariff, the official rate and the procedure with Lebanese Customs or a licensed broker.',
    'محتوى تدريبي. نسب التعرفة وسعر الصرف الجمركي وتفاصيل الإجراءات هنا أمثلة. تحقّق دائمًا من التعرفة اللبنانية الحالية والسعر الرسمي والإجراء مع الجمارك اللبنانية أو مخلّص مرخّص.');
})();
