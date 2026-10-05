/* Customs module — tariff extract (sample rates), item breakdowns, valuation & duty calculations, Lebanon customs guide */
(function () {
  const L = TS.L, R = TS.round2;
  const CUS = (window.CUS = window.CUS || {});

  CUS.company = { name: 'Phoenicia Freight Training SAL — Customs Department', email: 'customs@phoenicia-freight.test', licence: 'Licensed customs broker no. CB-0427 (training)' };
  CUS.VAT = 0.11;
  CUS.RATE = 89500; // sample customs exchange rate LBP/USD — always check the official rate in force

  /* Extract of a tariff — rates are SAMPLE training values, not the official Lebanese tariff */
  CUS.tariff = [
    { hs: '9401.61', d: L('Seats with wooden frames — upholstered', 'مقاعد بهياكل خشبية — منجّدة'), duty: 20 },
    { hs: '9401.69', d: L('Seats with wooden frames — other (not upholstered)', 'مقاعد بهياكل خشبية — غيرها (غير منجّدة)'), duty: 20 },
    { hs: '9401.71', d: L('Seats with metal frames — upholstered', 'مقاعد بهياكل معدنية — منجّدة'), duty: 20 },
    { hs: '9403.30', d: L('Wooden furniture of a kind used in offices', 'أثاث خشبي من النوع المستعمل في المكاتب'), duty: 15 },
    { hs: '9403.40', d: L('Wooden furniture of a kind used in kitchens', 'أثاث خشبي من النوع المستعمل في المطابخ'), duty: 15 },
    { hs: '9403.50', d: L('Wooden furniture of a kind used in bedrooms', 'أثاث خشبي من النوع المستعمل في غرف النوم'), duty: 25 },
    { hs: '9403.60', d: L('Other wooden furniture (e.g. dining tables)', 'أثاث خشبي آخر (مثل طاولات السفرة)'), duty: 25 },
    { hs: '9403.91', d: L('Parts of furniture, of wood', 'أجزاء أثاث من الخشب'), duty: 10 },
    { hs: '1207.40', d: L('Sesame seeds', 'بذور السمسم'), duty: 5 },
    { hs: '1515.50', d: L('Sesame oil and its fractions', 'زيت السمسم وأجزاؤه'), duty: 10 },
    { hs: '2008.11', d: L('Groundnuts, prepared or preserved (incl. peanut butter)', 'فول سوداني محضّر أو محفوظ (بما فيه زبدة الفول السوداني)'), duty: 20 },
    { hs: '2008.19', d: L('Other nuts and seeds, prepared or preserved, incl. mixtures (e.g. tahini)', 'مكسرات وبذور أخرى محضّرة أو محفوظة، بما فيها المخاليط (مثل الطحينة)'), duty: 20 },
    { hs: '2103.90', d: L('Sauces and preparations therefor; mixed condiments', 'صلصات ومحضّراتها؛ توابل مخلوطة'), duty: 20 },
  ];
  CUS.rateOf = (hs) => { const r = CUS.tariff.find((x) => x.hs === hs); return r ? r.duty : null; };

  /* how the single commercial line of Operations really breaks down on the supplier's detailed invoice */
  /* the supplier's detailed invoice lines (shared with the other departments' documents) */
  CUS.itemsFor = (s) => TS.cargoItems(s);

  const seed = (s) => s.id.split('').reduce((a, c) => (a * 31 + c.charCodeAt(0)) % 999983, 7);
  CUS.handoff = (s) => s.handoffs && (s.handoffs.customs_import || s.handoffs.customs_export);

  CUS.d = (s) => {
    const imp = s.direction === 'import';
    const h = CUS.handoff(s), p = h.pack;
    const items = CUS.itemsFor(s).map((x) => Object.assign({}, x));
    const valTotal = items.reduce((a, x) => a + x.value, 0);
    const q = s.quotation;
    const freightSold = R(q.lines.filter((l) => l.group === 'freight').reduce((a, l) => a + Number(l.sell), 0));
    const eta = (s.booking && (s.booking.revisedEta || s.booking.eta)) || s.sim.today;
    const out = { imp, h, p, items, valTotal, freightSold, seed: seed(s) };
    if (imp) {
      const freight = R(p.freight != null ? p.freight : freightSold), ins = R(p.insurance || 0);
      let fr = 0, is = 0;
      items.forEach((x, i) => {
        const last = i === items.length - 1;
        x.freight = last ? R(freight - fr) : R((freight * x.value) / valTotal); fr = R(fr + x.freight);
        x.ins = last ? R(ins - is) : R((ins * x.value) / valTotal); is = R(is + x.ins);
        x.cif = R(x.value + x.freight + x.ins);
        x.rate = CUS.rateOf(x.hs);
        x.duty = R((x.cif * x.rate) / 100);
        x.vatBase = R(x.cif + x.duty);
        x.vat = R(x.vatBase * CUS.VAT);
      });
      const T = (k) => R(items.reduce((a, x) => a + x[k], 0));
      Object.assign(out, {
        freight, ins, cif: T('cif'), duty: T('duty'), vatBase: T('vatBase'), vat: T('vat'),
        taxes: R(T('duty') + T('vat')), wrongDuty: R(items.reduce((a, x) => a + (x.cif * CUS.rateOf(x.hsGiven)) / 100, 0)),
        declNo: 'IM/' + eta.slice(0, 4) + '/' + (seed(s) % 90000 + 10000), lane: 'yellow',
        lodge: TS.addDays(eta, 2), release: TS.addDays(eta, 9), regime: 'IMPORT_HOME', origin: 'CN', consigned: 'CN', pref: 'none',
      });
      out.cifLBP = Math.round(out.cif * CUS.RATE); out.taxesLBP = Math.round(out.taxes * CUS.RATE);
    } else {
      const it = items[0];
      it.fob = R(it.value - freightSold);
      it.rate = 0; it.duty = 0;
      Object.assign(out, {
        cfr: it.value, fob: it.fob, fobLBP: Math.round(it.fob * CUS.RATE), taxes: 0,
        declNo: 'EX/' + (s.equipment && s.equipment.stuffedOn ? s.equipment.stuffedOn : s.sim.today).slice(0, 4) + '/' + (seed(s) % 90000 + 10000), lane: 'green',
        lodge: (s.equipment && s.equipment.stuffedOn) || s.sim.today, release: (s.equipment && s.equipment.stuffedOn) || s.sim.today,
        regime: 'EXPORT_DEF', origin: 'LB', consigned: 'LB', destination: 'DE', pref: 'EUR1',
      });
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
  CUS.countries = [{ v: 'CN', l: L('China', 'الصين') }, { v: 'LB', l: L('Lebanon', 'لبنان') }, { v: 'DE', l: L('Germany', 'ألمانيا') }, { v: 'EG', l: L('Egypt (transshipment)', 'مصر (مسافنة)') }, { v: 'IT', l: L('Italy (transshipment)', 'إيطاليا (مسافنة)') }];
  CUS.prefs = [{ v: 'none', l: L('None — full (MFN) duty', 'لا شيء — الرسم الكامل') }, { v: 'GAFTA', l: L('GAFTA — Arab certificate of origin', 'منطقة التجارة العربية — شهادة منشأ عربية') }, { v: 'EUR1', l: L('EU — EUR.1 movement certificate', 'الاتحاد الأوروبي — شهادة EUR.1') }, { v: 'EFTA', l: L('EFTA — EUR.1', 'EFTA — EUR.1') }];

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
