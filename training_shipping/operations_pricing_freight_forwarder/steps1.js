/* Operations & Pricing — steps 1 to 6, driven by the client case (FCL / LCL, import / export) */
(function () {
  const L = TS.L, t = TS.t, esc = TS.esc, REF = TS.REF;
  const OPS = window.OPS;
  const ui = () => OPS.ui;
  OPS.steps = OPS.steps || [];

  const imp = (s) => s.direction === 'import';
  const lcl = (s) => OPS.sc(s).mode === 'LCL';
  const D = (s, n) => TS.addDays(s.sim.start, n);
  const R2 = TS.round2;
  const portOpts = () => OPS.PORTS.map((p) => ({ v: p.code, l: p.code + ' — ' + p.city + ', ' + p.country }));
  const eqOpts = () => REF.equipment.map((e) => ({ v: e.code, l: { en: e.code + ' — ' + e.name.en, ar: e.code + ' — ' + e.name.ar } }));
  const yesNo = [{ v: 'no', l: L('No', 'لا') }, { v: 'yes', l: L('Yes', 'نعم') }];
  const LB = OPS.LB, TIP = OPS.TIP;
  const lesson = (id) => (s) => OPS.LESSON[id](s) + (s && s.case && s.case.mode === 'LCL' && OPS.LESSON_LCL[id] ? OPS.LESSON_LCL[id]() : '');
  const line = (k) => OPS.lines[k];
  const qtyOf = (s, basis) => (basis === 'wm' ? Math.max(1, OPS.sc(s).answer.wm) : 1);
  const eqTxt = (s) => (lcl(s) ? 'LCL ' + TS.num(OPS.sc(s).answer.wm) + ' W/M' : '1 × ' + (s.jobFile.equipment || OPS.sc(s).answer.equipment));
  const PKG = { cartons: ['carton', 'كرتونة'], pallets: ['pallet', 'طبلية'], bags: ['bag', 'كيس'], pcs: ['piece', 'قطعة'], crates: ['crate', 'صندوق'] };
  const pkgAr = (p) => (PKG[p] || [p, p])[1];
  /* pick k items from a list, stable for the shipment */
  const pickK = (s, salt, arr, k) => OPS.shuffle(OPS.srng(s, salt), arr).slice(0, k);
  const mix = (s, salt, good, bad, nGood, nBad) => OPS.shuffle(OPS.srng(s, salt + 1), pickK(s, salt, good, nGood).map((o) => Object.assign({ ok: true }, o)).concat(pickK(s, salt + 2, bad, nBad).map((o) => Object.assign({ ok: false }, o))));
  OPS.h = { imp, lcl, D, LB, TIP, portOpts, eqOpts, yesNo, lesson, qtyOf, eqTxt, pickK, mix, pkgAr };

  /* ======================= inquiry email (varies by persona, format, Incoterm, services) ======================= */
  const TONE = {
    formal: { o: ['Dear Phoenicia Freight team,', 'السادة فريق فينيقيا للشحن المحترمين،'], c: ['Kind regards,', 'وتفضّلوا بقبول فائق الاحترام،'], x: ['', ''] },
    friendly: { o: ['Hi team, hope you are all well!', 'مرحبًا يا فريق، أتمنى أن تكونوا بخير!'], c: ['Thanks a lot,', 'شكرًا جزيلًا،'], x: ['', ''] },
    urgent: { o: ['Hello — URGENT please,', 'مرحبًا — عاجل لو سمحتم،'], c: ['Waiting for your quick reply,', 'بانتظار ردّكم السريع،'], x: ['We need your offer TODAY — our customer is waiting for the goods.', 'نحتاج عرضكم اليوم — زبوننا ينتظر البضاعة.'] },
    demanding: { o: ['To: Phoenicia Freight —', 'إلى: فينيقيا للشحن —'], c: ['Regards,', 'تحياتي،'], x: ['We are comparing three forwarders. We expect a competitive ALL-IN price and no hidden charges.', 'نقارن ثلاثة وكلاء شحن. نتوقّع سعرًا شاملًا تنافسيًا وبدون رسوم مخفية.'] },
    new: { o: ['Hello, a colleague recommended your company.', 'مرحبًا، أوصى بكم أحد الزملاء.'], c: ['Many thanks for your help,', 'شكرًا جزيلًا على مساعدتكم،'], x: ['This is our first shipment of this kind — please tell us what we need to prepare.', 'هذه أول شحنة من هذا النوع لنا — يرجى إخبارنا بما يجب تحضيره.'] },
  };
  function cargoLines(sc) {
    const en = [], ar = [];
    sc.items.forEach((it) => {
      const dimsEn = sc.fmt === 'mm' ? it.dims.map((d) => d * 10).join(' × ') + ' mm' : it.dims.join(' × ') + ' cm';
      const dimsAr = sc.fmt === 'mm' ? it.dims.map((d) => d * 10).join(' × ') + ' مم' : it.dims.join(' × ') + ' سم';
      const kgEn = sc.fmt === 'total' ? '' : `, ${TS.num(it.kg, 1)} kg gross per ${(PKG[sc.cargo.pkgType] || [sc.cargo.pkgType])[0]}`;
      const kgAr = sc.fmt === 'total' ? '' : `، الوزن الإجمالي ${TS.num(it.kg, 1)} كغ لكل ${pkgAr(sc.cargo.pkgType)}`;
      en.push(`• ${it.pkgs} ${sc.cargo.pkgType} — ${it.en}: each ${dimsEn}${kgEn}`);
      ar.push(`• ${it.pkgs} ${pkgAr(sc.cargo.pkgType)} — ${it.ar}: مقاس كل منها ${dimsAr}${kgAr}`);
    });
    if (sc.fmt === 'total') { en.push(`• Total gross weight of the shipment: ${TS.num(sc.answer.grossKg, 0)} kg`); ar.push(`• الوزن الإجمالي للشحنة: ${TS.num(sc.answer.grossKg, 0)} كغ`); }
    return [en.join('\n'), ar.join('\n')];
  }
  OPS.inquiryEmail = (ship) => {
    const sc = OPS.sc(ship), tn = TONE[sc.tone] || TONE.formal, ready = D(ship, sc.readyOffset), far = sc.far;
    const [cl, cla] = cargoLines(sc);
    const inc = sc.answer.incoterm;
    let svc, svcAr;
    if (imp(ship)) {
      const leg = inc === 'EXW' ? [`pick-up at the supplier’s premises in ${far.city} (they will not load or clear export — EXW), export clearance in ${far.country}`, `الاستلام من مقرّ المورّد في ${far.city} (لن يحمّل ولن يخلّص التصدير — EXW)، والتخليص الصادر في ${far.country}`]
        : inc === 'FCA' ? [`pick-up at the supplier’s premises in ${far.city} (they load on your truck and clear export — FCA)`, `الاستلام من مقرّ المورّد في ${far.city} (يحمّل على شاحنتكم ويخلّص التصدير — FCA)`]
        : [`sea freight from ${far.city} port (the supplier delivers on board — FOB)`, `الشحن البحري من مرفأ ${far.city} (المورّد يسلّم على متن الباخرة — FOB)`];
      const dst = sc.services.door ? [`Beirut port charges, customs clearance and delivery to our warehouse in ${sc.client.area}`, `رسوم مرفأ بيروت والتخليص الجمركي والتسليم إلى مستودعنا في ${sc.client.area}`] : ['Beirut port charges and customs clearance — we will collect with our own truck', 'رسوم مرفأ بيروت والتخليص الجمركي — سنستلم بشاحنتنا'];
      svc = `${leg[0]}, ${sc.mode === 'LCL' ? 'groupage (LCL) to Beirut' : 'ocean freight to Beirut'}, ${dst[0]}${sc.services.insurance ? '. Please also include cargo insurance' : ''}.`;
      svcAr = `${leg[1]}، ${sc.mode === 'LCL' ? 'شحن جزئي (LCL) إلى بيروت' : 'الشحن البحري إلى بيروت'}، ${dst[1]}${sc.services.insurance ? '. ونرجو إضافة التأمين على البضاعة' : ''}.`;
    } else {
      const cert = sc.zone === 'EU' ? ['certificate of origin and EUR.1', 'شهادة المنشأ وEUR.1'] : sc.zone === 'ARAB' ? ['Arab certificate of origin', 'شهادة المنشأ العربية'] : ['certificate of origin', 'شهادة المنشأ'];
      const hc = sc.cargo.food ? [', health certificate', '، الشهادة الصحية'] : ['', ''];
      const end = inc === 'DAP' ? [`sea freight and delivery to the buyer’s warehouse in ${far.city} (DAP — the buyer pays import duties)`, `الشحن البحري والتسليم إلى مستودع المشتري في ${far.city} (DAP — المشتري يدفع رسوم الاستيراد)`] : [`sea freight to ${far.city} port${inc === 'CIF' ? ' including cargo insurance (CIF)' : ''}`, `الشحن البحري إلى مرفأ ${far.city}${inc === 'CIF' ? ' مع التأمين على البضاعة (CIF)' : ''}`];
      svc = `${sc.mode === 'LCL' ? `collection of the goods from our factory in ${sc.client.area} to your Beirut CFS` : `an empty container to our factory in ${sc.client.area} (we load it ourselves)`}, export customs clearance, ${cert[0]}${hc[0]}, ${end[0]}.`;
      svcAr = `${sc.mode === 'LCL' ? `نقل البضاعة من مصنعنا في ${sc.client.area} إلى محطة التجميع في بيروت` : `حاوية فارغة إلى مصنعنا في ${sc.client.area} (نحن نحمّلها)`}، التخليص الجمركي للتصدير، ${cert[1]}${hc[1]}، ${end[1]}.`;
    }
    const party = imp(ship) ? sc.shipper : sc.consignee;
    const intro = imp(ship) ? [`We purchased ${sc.cargo.commodity.toLowerCase()} from ${sc.shipper.name}, ${far.city}. Our purchase terms are ${inc} ${far.city}.`, `اشترينا ${sc.cargo.commodityAr} من ${sc.shipper.name}، ${far.city}. شروط الشراء ${inc} ${far.city}.`]
      : [`We sold ${sc.cargo.packages} ${sc.cargo.pkgType} of ${sc.cargo.commodity.toLowerCase()} to ${sc.consignee.name}, ${far.city}, on ${inc} ${far.city} terms.`, `بعنا ${sc.cargo.packages} ${pkgAr(sc.cargo.pkgType)} من ${sc.cargo.commodityAr} إلى ${sc.consignee.name}، ${far.city}، بشرط ${inc} ${far.city}.`];
    return {
      subject: L(`${sc.tone === 'urgent' ? 'URGENT — ' : ''}Quotation request — ${sc.cargo.commodity.split(' (')[0].toLowerCase()} ${imp(ship) ? 'from ' + far.city : 'to ' + far.city} (${inc})`, `${sc.tone === 'urgent' ? 'عاجل — ' : ''}طلب تسعير — ${sc.cargo.commodityAr} ${imp(ship) ? 'من ' + far.city : 'إلى ' + far.city} (${inc})`),
      body: L(`${tn.o[0]}

${intro[0]}
Please quote: ${svc}
${tn.x[0] ? '\n' + tn.x[0] + '\n' : ''}
Cargo details:
${cl}
• HS code given by the ${imp(ship) ? 'supplier' : 'factory'}: ${sc.cargo.hs}
• Not dangerous goods${sc.cargo.food ? ' — food product' : ''}
• Cargo ready on ${TS.fmtDate(ready)}
• Invoice value: USD ${TS.num(sc.cargo.value, 0)}
• Payment terms with the ${imp(ship) ? 'supplier' : 'buyer'}: ${sc.payment.en}

${imp(ship) ? 'Supplier' : 'Buyer'} contact: ${party.contact}, ${party.email}
${sc.tone === 'new' ? 'Which container do we need — or is it a small shipment?' : 'Please advise the equipment you recommend.'}

${tn.c[0]}
${sc.client.contact}
${sc.client.name}
${sc.client.address}`,
      `${tn.o[1]}

${intro[1]}
نرجو التسعير: ${svcAr}
${tn.x[1] ? '\n' + tn.x[1] + '\n' : ''}
تفاصيل البضاعة:
${cla}
• رمز HS حسب ${imp(ship) ? 'المورّد' : 'المصنع'}: ${sc.cargo.hs}
• ليست بضائع خطرة${sc.cargo.food ? ' — منتج غذائي' : ''}
• البضاعة جاهزة بتاريخ ${TS.fmtDate(ready)}
• قيمة الفاتورة: ${TS.num(sc.cargo.value, 0)} دولار
• شروط الدفع مع ${imp(ship) ? 'المورّد' : 'المشتري'}: ${sc.payment.ar}

للتواصل مع ${imp(ship) ? 'المورّد' : 'المشتري'}: ${party.contact}، ${party.email}
${sc.tone === 'new' ? 'ما نوع الحاوية التي نحتاجها — أم أنها شحنة صغيرة؟' : 'يرجى إخبارنا بالمعدّات المناسبة.'}

${tn.c[1]}
${sc.client.contact}
${sc.client.name}`),
    };
  };

  /* ============================================================ 1. INQUIRY */
  OPS.steps.push({
    id: 'inquiry',
    title: L('Client inquiry & job file', 'استفسار الزبون وملف العملية'),
    sub: L('Understand what the client needs, open the job file and collect every detail before pricing.', 'افهم ما يحتاجه الزبون، افتح ملف العملية واجمع كل التفاصيل قبل التسعير.'),
    init(ship) {
      const e = OPS.inquiryEmail(ship);
      OPS.emailPush(ship, 'in', { from: OPS.sc(ship).client.email, to: OPS.company.email, step: 'inquiry', read: false, subject: e.subject, body: e.body });
    },
    lesson: lesson('inquiry'),
    parts: [
      {
        id: 'read',
        title: L('Read the client email', 'اقرأ بريد الزبون'),
        render(ctx, b) {
          const e = ctx.ship.emails.find((m) => m.step === 'inquiry' && m.box === 'in');
          b.innerHTML = `<p>${t(L('The client’s request is in your virtual inbox. Read it carefully — you will need every number.', 'طلب الزبون في بريدك الافتراضي. اقرأه بتمعّن — ستحتاج كل رقم فيه.'))}</p>${e ? ui().emailCard(e) : ''}<div class="row" style="margin-top:12px"><button class="btn primary" id="ok">${t(L('I have read it', 'قرأته'))}</button></div>`;
          if (e) { e.read = true; ctx.save(); }
          b.querySelector('#ok').onclick = () => ctx.finish('read');
        },
        summary: () => `<p class="muted">✓ ${t(L('Email read. You can re-open it any time in Email (virtual).', 'تمت قراءة البريد. يمكنك فتحه في أي وقت من البريد الافتراضي.'))}</p>`,
      },
      {
        id: 'jobfile',
        title: L('Open the job file (requirements sheet)', 'افتح ملف العملية (ورقة المتطلبات)'),
        render(ctx, b) {
          const s = ctx.ship, sc = ctx.sc, c = sc.cargo, a = sc.answer;
          const eqWhy = a.equipment === 'LCL'
            ? L(`${TS.num(a.cbm)} CBM / ${TS.num(a.grossKg, 0)} kg is far too small for a container — ship LCL (groupage).`, `${TS.num(a.cbm)} م³ / ${TS.num(a.grossKg, 0)} كغ صغيرة جدًا على حاوية — اشحن LCL (تجميع).`)
            : a.equipment === '20DV' ? L(`${TS.num(a.cbm)} CBM / ${TS.num(a.grossKg / 1000, 1)} t: a 20′ (≈28 usable CBM, ~21 t on Lebanese roads) is enough; a 40′ wastes money.`, `${TS.num(a.cbm)} م³ / ${TS.num(a.grossKg / 1000, 1)} طن: تكفي حاوية 20 (≈28 م³ فعليًا، ~21 طن على الطرق اللبنانية)؛ الـ40 هدر.`)
              : a.equipment === '40DV' ? L(`${TS.num(a.cbm)} CBM is too much for a 20′ but fits a 40′ DV (≈58 usable CBM).`, `${TS.num(a.cbm)} م³ أكثر من 20 قدم لكنها تتّسع في 40 عادية (≈58 م³ فعليًا).`)
                : L(`${TS.num(a.cbm)} CBM does not fit a 40′ DV (≈58 usable) — a 40′ HC (≈67 usable) does.`, `${TS.num(a.cbm)} م³ لا تتّسع في 40 عادية (≈58 فعليًا) — الـ40 العالية (≈67 فعليًا) تتّسع.`);
          const fields = [
            { k: 'client', label: L('Client (who pays you)', 'الزبون (من يدفع لك)'), path: 'jobFile.client', ans: () => sc.client.name, fb: L('The client is the company that wrote to you.', 'الزبون هو الشركة التي راسلتك.') },
            { k: 'role', label: L('Client’s role in the trade', 'دور الزبون في الصفقة'), type: 'select', path: 'jobFile.clientRole', options: [{ v: 'shipper', l: L('Shipper (seller/exporter)', 'الشاحن (البائع/المصدّر)') }, { v: 'consignee', l: L('Consignee (buyer/importer)', 'المرسل إليه (المشتري/المستورد)') }], ans: () => sc.clientRole },
            { k: 'shipper', label: L('Shipper', 'الشاحن'), path: 'jobFile.shipper', ans: () => sc.shipper.name },
            { k: 'consignee', label: L('Consignee', 'المرسل إليه'), path: 'jobFile.consignee', ans: () => sc.consignee.name },
            { k: 'commodity', label: L('Commodity', 'البضاعة'), path: 'jobFile.commodity', contains: c.keywords, containsAlt: c.keywordsAr, ans: () => c.commodity, full: true },
            { k: 'hs', label: L('HS code (as provided)', 'رمز HS (كما ورد)'), path: 'jobFile.hs', ans: () => c.hs },
            { k: 'dg', label: L('Dangerous goods?', 'بضائع خطرة؟'), type: 'select', options: yesNo, path: 'jobFile.dg', ans: () => 'no' },
            { k: 'incoterm', label: 'Incoterm', type: 'select', options: REF.incoterms.map((i) => ({ v: i.c, l: i.c })), path: 'jobFile.incoterm', ans: () => a.incoterm },
            { k: 'place', label: L('Incoterm named place', 'المكان المحدّد لشرط التسليم'), path: 'jobFile.namedPlace', ans: () => a.namedPlace },
            { k: 'pol', label: L('Port of loading (POL)', 'مرفأ التحميل'), type: 'select', options: portOpts(), path: 'jobFile.pol', ans: () => a.pol },
            { k: 'pod', label: L('Port of discharge (POD)', 'مرفأ التفريغ'), type: 'select', options: portOpts(), path: 'jobFile.pod', ans: () => a.pod },
            { k: 'scope', label: L('Service scope', 'نطاق الخدمة'), type: 'select', path: 'jobFile.scope', options: [{ v: 'port-port', l: L('Port → port', 'مرفأ ← مرفأ') }, { v: 'port-door', l: L('Port → door', 'مرفأ ← باب') }, { v: 'door-port', l: L('Door → port', 'باب ← مرفأ') }, { v: 'door-door', l: L('Door → door', 'باب ← باب') }], ans: () => a.scope, fb: L(`${a.incoterm}: ${a.scope.startsWith('door') ? 'your service starts at the seller’s door' : 'your service starts when the goods are on board at the port of loading'}; it ends ${a.scope.endsWith('door') ? 'at a door (client’s/buyer’s warehouse)' : 'at the port of discharge'}.`, `${a.incoterm}: ${a.scope.startsWith('door') ? 'تبدأ خدمتك من باب البائع' : 'تبدأ خدمتك عندما تكون البضاعة على متن الباخرة في مرفأ التحميل'}؛ وتنتهي ${a.scope.endsWith('door') ? 'عند باب (مستودع الزبون/المشتري)' : 'في مرفأ التفريغ'}.`) },
            { k: 'pk', label: L('Number of packages', 'عدد الطرود'), type: 'number', path: 'jobFile.packages', ans: () => c.packages, fb: L('Add the packages of every line of the email.', 'اجمع طرود كل سطر في البريد.') },
            { k: 'kg', label: L('Total gross weight', 'الوزن الإجمالي الكلي'), unit: 'kg', type: 'number', tol: 2, path: 'jobFile.grossKg', ans: () => a.grossKg, fb: sc.fmt === 'total' ? L('The client gave the total weight directly.', 'أعطى الزبون الوزن الإجمالي مباشرة.') : L('Packages × gross kg per package, for each line, then add.', 'عدد الطرود × الوزن للطرد لكل سطر، ثم اجمع.') },
            { k: 'cbm', label: L('Total volume', 'الحجم الكلي'), unit: 'CBM', type: 'number', tol: Math.max(0.1, a.cbm * 0.01), path: 'jobFile.cbm', ans: () => a.cbm, fb: L(`(L × W × H in metres) × packages, for each line${sc.fmt === 'mm' ? ' — the email gives millimetres: divide by 1,000' : ''}.`, `(الطول × العرض × الارتفاع بالمتر) × الطرود لكل سطر${sc.fmt === 'mm' ? ' — البريد بالميليمتر: اقسم على 1000' : ''}.`) },
            { k: 'eq', label: L('Equipment', 'المعدّات'), type: 'select', options: eqOpts(), path: 'jobFile.equipment', ans: () => a.equipment, fb: eqWhy },
          ];
          if (sc.mode === 'LCL') fields.push({ k: 'wm', label: L('Chargeable W/M (revenue tons)', 'الوحدات المحتسبة W/M'), type: 'number', tol: 0.05, path: 'jobFile.wm', ans: () => a.wm, fb: L('W/M = the higher of CBM and tonnes (kg ÷ 1,000).', 'W/M = الأعلى بين الحجم والأطنان (كغ ÷ 1000).') });
          fields.push({ k: 'ready', label: L('Cargo ready date', 'تاريخ جهوزية البضاعة'), type: 'date', path: 'jobFile.readyDate', ans: () => D(s, sc.readyOffset) });
          ui().form(ctx, b, {
            key: 'jobfile',
            intro: L('Fill the job file from the email. Calculate weight and volume yourself and choose the right equipment.', 'املأ ملف العملية من البريد. احسب الوزن والحجم بنفسك واختر المعدّات المناسبة.'),
            fields,
            onSuccess: () => { const j = ctx.ship.jobFile; j.value = c.value; j.currency = c.currency; j.pkgType = c.pkgType; j.mode = sc.mode; if (sc.mode !== 'LCL') j.wm = null; ctx.finish('jobfile'); },
          });
        },
        summary: (ctx) => { const j = ctx.ship.jobFile; return `<dl class="kv"><dt>${t(L('Route', 'المسار'))}</dt><dd>${esc(j.pol)} → ${esc(j.pod)} (${esc(j.scope)})</dd><dt>Incoterm</dt><dd>${esc(j.incoterm)} ${esc(j.namedPlace)}</dd><dt>${t(L('Cargo', 'البضاعة'))}</dt><dd>${esc(j.packages)} ${esc(j.pkgType)}, ${TS.num(j.grossKg, 0)} kg, ${TS.num(j.cbm)} CBM${j.wm ? ' — ' + TS.num(j.wm) + ' W/M' : ''} — HS ${esc(j.hs)}</dd><dt>${t(L('Equipment', 'المعدّات'))}</dt><dd>${esc(OPS.h.eqTxt(ctx.ship))}</dd><dt>${t(L('Ready', 'الجهوزية'))}</dt><dd>${TS.fmtDate(j.readyDate)}</dd></dl>`; },
      },
      {
        id: 'checks',
        title: L('What else must you check before pricing?', 'ماذا يجب أن تتحقّق منه أيضًا قبل التسعير؟'),
        render(ctx, b) {
          const s = ctx.ship, sc = ctx.sc, inc = sc.answer.incoterm;
          const good = [], bad = [];
          if (imp(s)) {
            good.push({ l: L(`Confirm the importer has commercial registration / VAT number and any approval the product needs. ${sc.licence ? sc.licence.en : ''}`, `التأكّد أن للمستورد سجلًا تجاريًا ورقمًا ضريبيًا وأي موافقة يحتاجها المنتج. ${sc.licence ? sc.licence.ar : ''}`) });
            if (!sc.services.insurance) good.push({ l: L(`Ask if the client wants cargo insurance (under ${inc} the buyer carries the sea risk).`, `سؤال الزبون إن كان يريد تأمينًا على البضاعة (في ${inc} يتحمّل المشتري مخاطر البحر).`) });
            else good.push({ l: L('Get the insured value and cover requested (CIF + 10%, all risks?) for the insurance quote.', 'معرفة القيمة المؤمّنة والتغطية المطلوبة (CIF + 10%، كل المخاطر؟) لتسعير التأمين.') });
            if (sc.services.door) good.push({ l: L(`Confirm the delivery address in ${sc.client.area} and unloading conditions (truck access, forklift, working hours).`, `تأكيد عنوان التسليم في ${sc.client.area} وظروف التفريغ (دخول الشاحنة، رافعة، ساعات العمل).`) });
            good.push({ l: L(`Get the supplier’s contact so your ${sc.far.city} agent can coordinate ${inc === 'FOB' ? 'the booking and delivery to the port' : 'the pickup at their premises'}.`, `الحصول على بيانات المورّد ليتواصل وكيلك في ${sc.far.city} لتنسيق ${inc === 'FOB' ? 'الحجز والتسليم إلى المرفأ' : 'الاستلام من مقرّه'}.`) });
            if (inc === 'EXW') good.push({ l: L('Under EXW you (the buyer’s side) clear export in the origin country — get the supplier’s invoice/packing list early and check no export licence is needed.', 'في EXW أنت (جهة المشتري) تخلّص التصدير في بلد المنشأ — احصل على فاتورة المورّد وقائمة التعبئة مبكرًا وتحقّق من عدم الحاجة لترخيص تصدير.') });
            if (sc.mode === 'LCL') good.push({ l: L('Ask the supplier to mark every package (consignee, ref., 1/N) — LCL cargo shares the box.', 'الطلب من المورّد وضع علامات على كل طرد (المرسل إليه، المرجع، 1/N) — بضاعة LCL تشارك الحاوية.') });
            bad.push({ l: L(`Correct the HS code yourself because ${sc.cargo.hs} “looks wrong”.`, `تصحيح رمز HS بنفسك لأن ${sc.cargo.hs} «يبدو خطأ».`), fb: L('Never classify yourself — the broker/importer does.', 'لا تصنّف بنفسك أبدًا — المخلّص/المستورد يفعل.') });
            bad.push({ l: L('Ask the supplier what price they sold the goods for, to set your margin.', 'سؤال المورّد عن سعر بيع البضاعة لتحديد هامشك.'), fb: L('Irrelevant to freight and unprofessional.', 'لا علاقة له بالشحن وغير مهني.') });
            bad.push({ l: L('Promise the client there will be no customs inspection.', 'وعد الزبون بعدم وجود كشف جمركي.'), fb: L('The lane (green/yellow/red) is decided by Customs risk management, not by you.', 'المسار (أخضر/أصفر/أحمر) تحدّده إدارة المخاطر في الجمارك، لا أنت.') });
          } else {
            good.push(sc.payKind === 'lc' ? { l: L('Get a copy of the L/C and check what it requires on the documents (exact description, B/L “to order”, latest shipment date, presentation period).', 'الحصول على نسخة الاعتماد والتحقّق مما يطلبه في المستندات (الوصف الحرفي، بوليصة «لأمر»، آخر تاريخ شحن، مهلة التقديم).') } : sc.payKind === 'cad' ? { l: L('Check the documents the buyer’s bank needs for CAD (original B/L set, invoice, certificates).', 'التحقّق من المستندات التي يطلبها مصرف المشتري للدفع مقابل المستندات (أصول البوليصة، الفاتورة، الشهادات).') } : { l: L('Confirm the buyer has paid in advance before releasing the cargo at destination.', 'التأكّد أن المشتري دفع مسبقًا قبل الإفراج عن البضاعة في الوجهة.') });
            good.push({ l: L(`Confirm the loading address in ${sc.client.area}, the loading time and truck access.`, `تأكيد عنوان التحميل في ${sc.client.area} ووقت التحميل ودخول الشاحنة.`) });
            if (sc.cargo.food) good.push({ l: L(`Confirm ${sc.far.country}’s import requirements for this food product with the buyer (labels, health certificate, registrations).`, `تأكيد متطلبات ${sc.far.country} لاستيراد هذا المنتج الغذائي مع المشتري (الملصقات، الشهادة الصحية، التسجيلات).`) });
            if (['pallets', 'crates'].includes(sc.cargo.pkgType)) good.push({ l: L('Check wooden pallets/crates are heat-treated and marked (ISPM 15).', 'التأكّد أن الطبليات/الصناديق الخشبية معالجة حراريًا ومعلّمة (ISPM 15).') });
            if (inc === 'DAP') good.push({ l: L(`Get the destination charges and delivery cost from your ${sc.far.city} agent — under DAP they are in your price (import duties are not).`, `الحصول على رسوم الوجهة وكلفة التسليم من وكيلك في ${sc.far.city} — في DAP هي ضمن سعرك (رسوم الاستيراد لا).`) });
            if (inc === 'CIF') good.push({ l: L('Quote cargo insurance: under CIF the seller must insure (minimum 110% of value).', 'تسعير التأمين: في CIF يجب على البائع التأمين (110% من القيمة كحد أدنى).') });
            if (inc === 'CFR') bad.push({ l: L('Add insurance by default to the invoice.', 'إضافة التأمين تلقائيًا إلى الفاتورة.'), fb: L('Under CFR the buyer carries sea risk and buys insurance. Offer it, don’t impose it.', 'في CFR يتحمّل المشتري مخاطر البحر ويشتري التأمين. اعرضه ولا تفرضه.') });
            bad.push({ l: L(`Change the HS code to one with lower duty in ${sc.far.country}.`, `تغيير رمز HS إلى رمز رسومه أقل في ${sc.far.country}.`), fb: L('That is misdeclaration. Never.', 'هذا تصريح كاذب. أبدًا.') });
            bad.push({ l: L('Promise the buyer duty-free entry.', 'وعد المشتري بدخول بدون رسوم.'), fb: L('Only the destination customs (and a valid origin proof) decide that.', 'فقط جمارك الوجهة (وإثبات منشأ صالح) تقرّر ذلك.') });
          }
          ui().choice(ctx, b, {
            key: 'checks', multi: true,
            q: L('Select every check a good forwarder does now (and only those).', 'اختر كل ما يتحقّق منه وكيل الشحن الجيد الآن (وفقط ذلك).'),
            options: mix(s, 11, good, bad, Math.min(4, good.length), 2),
            onSuccess: () => ctx.finish('checks'),
          });
        },
      },
      {
        id: 'ack',
        title: L('Acknowledge the client', 'الردّ على الزبون'),
        render(ctx, b) {
          const s = ctx.ship, sc = ctx.sc;
          const right = { l: L(`“Thank you, received. We are checking rates ${lcl(s) ? 'with our consolidators for your ' + TS.num(s.jobFile.wm) + ' W/M groupage' : 'with the lines for 1×' + s.jobFile.equipment} and will send our quotation ${sc.tone === 'urgent' ? 'within a few hours' : 'today'}.${sc.services.insurance || imp(s) ? ' Do you need cargo insurance?' : ''}”`, `«شكرًا، تم الاستلام. نتحقّق من الأسعار ${lcl(s) ? 'مع المجمِّعين لشحنتكم الجزئية ' + TS.num(s.jobFile.wm) + ' W/M' : 'مع الخطوط لحاوية 1×' + s.jobFile.equipment} وسنرسل العرض ${sc.tone === 'urgent' ? 'خلال ساعات' : 'اليوم'}.${sc.services.insurance || imp(s) ? ' هل تحتاجون تأمينًا على البضاعة؟' : ''}»`), ok: true, fb: L('Clear, fast, sets expectations and asks the open question.', 'واضح وسريع ويحدّد التوقعات ويطرح السؤال المفتوح.') };
          const opts = OPS.shuffle(OPS.srng(s, 21), [right,
            { l: L(`“OK. Price is around USD ${TS.num(Math.round(OPS.rateTotal(sc.rates[0], sc) / 100) * 100, 0)}, transit ${sc.rates[0].transit} days guaranteed.”`, `«حسنًا. السعر حوالي ${TS.num(Math.round(OPS.rateTotal(sc.rates[0], sc) / 100) * 100, 0)} دولار، والنقل ${sc.rates[0].transit} يومًا مضمون.»`), ok: false, fb: L('Never give a price before checking rates, and never guarantee transit times.', 'لا تعطِ سعرًا قبل التحقّق، ولا تضمن مدة النقل أبدًا.') },
            { l: L('No reply until the quotation is ready.', 'عدم الرد حتى يصبح العرض جاهزًا.'), ok: false, fb: L('Silence loses clients. Always acknowledge quickly.', 'الصمت يخسّرك الزبائن. ردّ دائمًا بسرعة.') },
            { l: L('“Please call us, we don’t quote by email.”', '«اتصلوا بنا، لا نسعّر بالبريد.»'), ok: false, fb: L('Clients need written quotations; and this wastes their time.', 'الزبائن يحتاجون عروضًا مكتوبة؛ وهذا يضيّع وقتهم.') },
          ]).slice(0, 3);
          if (!opts.includes(right)) opts[0] = right;
          ui().choice(ctx, b, {
            key: 'ack', q: L('Choose the best reply to send now.', 'اختر أفضل ردّ لإرساله الآن.'), options: opts,
            onSuccess: () => {
              const inq = s.emails.find((m) => m.step === 'inquiry' && m.box === 'in');
              ctx.send({ to: sc.client.email, subject: L('RE: ' + (inq ? inq.subject.en : 'Quotation request'), 'رد: ' + (inq ? inq.subject.ar : 'طلب تسعير')), body: right.l });
              ctx.milestone('INQ', s.sim.today, 'Inquiry received & acknowledged');
              ctx.finish('ack');
            },
          });
        },
      },
    ],
    quiz: OPS.QUIZ.inquiry, drills: OPS.QUIZ_DRILLS.inquiry,
  });

  /* ============================================================ 2. RATES */
  function rateReplyBody(ship, r) {
    const sc = OPS.sc(ship), car = line(r.c), valid = OPS.rateValidTo(ship, r), j = ship.jobFile;
    const row = (k, v) => `<tr><td>${k}</td><td class="num">${v}</td></tr>`;
    const ref = car.bkPrefix + '-Q' + String((OPS.seed(ship) + r.c.charCodeAt(0)) % 9000 + 1000);
    const tbl = lcl(ship)
      ? `<div class="table-wrap"><table><tbody>${row('Ocean freight CFS/CFS per W/M (min 1 W/M)', 'USD ' + TS.num(r.of))}${r.extra.map((x) => row(x.code + ' — ' + x.name + (x.per === 'bl' ? ' (per B/L)' : ''), 'USD ' + TS.num(x.amt))).join('')}${row('Your cargo: ' + TS.num(sc.answer.wm) + ' W/M', 'USD ' + TS.num(Math.max(1, sc.answer.wm) * r.of))}<tr class="total"><td>All-in ocean for your cargo</td><td class="num">USD ${TS.num(OPS.rateTotal(r, sc))}</td></tr></tbody></table></div>`
      : `<div class="table-wrap"><table><tbody>${row('Ocean freight (' + j.equipment + ')', 'USD ' + TS.num(r.of))}${row('BAF', 'USD ' + TS.num(r.baf))}${row('LSS', 'USD ' + TS.num(r.lss))}${r.extra.map((x) => row(x.code + ' — ' + x.name, 'USD ' + TS.num(x.amt))).join('')}<tr class="total"><td>All-in ocean</td><td class="num">USD ${TS.num(OPS.rateTotal(r, sc))}</td></tr></tbody></table></div>`;
    const free = lcl(ship) ? `Free storage at destination CFS: ${r.free} days, then USD ${TS.num(r.storage)} per W/M per day` : `Free time at destination (${OPS.port(j.pod).city}): ${r.free} days combined demurrage/detention`;
    const freeAr = lcl(ship) ? `التخزين المجاني في محطة الوجهة: ${r.free} أيام، ثم ${TS.num(r.storage)} دولار لكل W/M يوميًا` : `فترة السماح في الوجهة (${OPS.port(j.pod).city}): ${r.free} أيام مجمّعة (تأخير/احتجاز)`;
    return L(`Dear ${OPS.company.short} team,

Thank you for your request. Please find our offer ${j.pol} → ${j.pod}, ${lcl(ship) ? 'LCL ' + TS.num(j.cbm) + ' CBM / ' + TS.num(j.grossKg, 0) + ' kg' : '1 × ' + j.equipment}, ${j.commodity.split(',')[0]}:
${tbl}Transit time: ${r.transit} days, via ${r.ts}
${free}
Validity: sailings until ${TS.fmtDate(valid)}
Subject to space${lcl(ship) ? ', final CFS measurement' : '/equipment availability'}, GRI and surcharges in force at time of shipment. Local charges as per tariff.
Rate reference: ${ref}

Best regards,
${car.name} — ${lcl(ship) ? 'LCL desk' : 'Sales'}`,
    `فريق ${OPS.company.short} الكرام،

شكرًا لطلبكم. إليكم عرضنا ${j.pol} ← ${j.pod}، ${lcl(ship) ? 'LCL ' + TS.num(j.cbm) + ' م³ / ' + TS.num(j.grossKg, 0) + ' كغ' : 'حاوية 1 × ' + j.equipment}:
${tbl}مدة النقل: ${r.transit} يومًا، عبر ${r.ts}
${freeAr}
الصلاحية: للإبحارات حتى ${TS.fmtDate(valid)}
حسب توفّر المساحة${lcl(ship) ? ' والقياس النهائي في المحطة' : ' والمعدّات'}، والزيادات والرسوم السارية عند الشحن. الرسوم المحلية حسب التعرفة.
مرجع السعر: ${ref}

مع التحية،
${car.name} — ${lcl(ship) ? 'قسم LCL' : 'المبيعات'}`);
  }

  OPS.steps.push({
    id: 'rates',
    title: L('Rate request to shipping lines / consolidators', 'طلب الأسعار من الخطوط / المجمِّعين'),
    sub: L('Ask several providers for rates, then compare the offers — not only on price.', 'اطلب الأسعار من عدة مزوّدين ثم قارن العروض — ليس على السعر فقط.'),
    lesson: lesson('rates'),
    parts: [
      {
        id: 'content',
        title: L('What goes in the rate request?', 'ماذا تضع في طلب السعر؟'),
        render(ctx, b) {
          const s = ctx.ship;
          const good = [
            { l: L('POL / POD', 'مرفأ التحميل / التفريغ') }, { l: L('Commodity & HS code', 'البضاعة ورمز HS') },
            lcl(s) ? { l: L('Packages, dimensions, CBM and weight (for the W/M)', 'الطرود والمقاسات والحجم والوزن (لحساب W/M)') } : { l: L('Equipment type & quantity', 'نوع الحاوية والعدد') },
            { l: L('Gross weight', 'الوزن الإجمالي') }, { l: L('Cargo ready date', 'تاريخ الجهوزية') }, { l: L('Non-DG confirmation', 'تأكيد أنها ليست بضائع خطرة') },
            lcl(s) ? { l: L('Free storage needed at the destination CFS', 'التخزين المجاني المطلوب في محطة الوجهة') } : { l: L('Requested free time at destination', 'فترة السماح المطلوبة في الوجهة') },
          ];
          const bad = [
            { l: L('Client’s name, phone and email', 'اسم الزبون وهاتفه وبريده'), fb: L('Protect your client — providers also sell direct.', 'احمِ زبونك — المزوّدون يبيعون مباشرة أيضًا.') },
            { l: L('Our target selling price to the client', 'سعر البيع المستهدف للزبون'), fb: L('Never reveal your sell price to a supplier.', 'لا تكشف سعر بيعك للمورّد أبدًا.') },
            { l: L('The value of the goods on the commercial invoice', 'قيمة البضاعة في الفاتورة التجارية'), fb: L('Not needed for a freight rate (only for insurance/customs).', 'غير ضرورية لسعر الشحن (فقط للتأمين/الجمارك).') },
          ];
          ui().choice(ctx, b, { key: 'rq', multi: true, q: L('Select the information you will send.', 'اختر المعلومات التي سترسلها.'), options: mix(s, 31, good, bad, 6, 2), onSuccess: () => ctx.finish('content') });
        },
      },
      {
        id: 'send',
        title: (s) => (OPS.sc(s).mode === 'LCL' ? L('Send the request to several consolidators', 'أرسل الطلب إلى عدة مجمِّعين') : L('Send the request to several lines', 'أرسل الطلب إلى عدة خطوط')),
        render(ctx, b) {
          const s = ctx.ship, j = s.jobFile, pool = lcl(s) ? OPS.consols : OPS.carriers;
          const sel = (ctx.data.carriers = ctx.data.carriers || []);
          const eqLine = lcl(s) ? `LCL — ${j.packages} ${j.pkgType}, ${TS.num(j.cbm)} CBM, ${TS.num(j.grossKg, 0)} kg (${TS.num(j.wm)} W/M)` : '1 × ' + j.equipment;
          const body = L(`Dear ${lcl(s) ? 'LCL desk' : 'Sales team'},

Please quote your best rate:
POL: ${j.pol}   POD: ${j.pod}
Equipment: ${eqLine}
Commodity: ${j.commodity} — HS ${j.hs} — non-DG
Gross weight: ${TS.num(j.grossKg, 0)} kg
Cargo ready: ${TS.fmtDate(j.readyDate)}
Please include transit time, T/S port, validity and ${lcl(s) ? 'free storage at the destination CFS' : 'free time at destination (we need minimum 10–14 days)'}.

Thank you,
Pricing — ${OPS.company.name}`, `${lcl(s) ? 'قسم LCL' : 'فريق المبيعات'} الكرام،

نرجو تزويدنا بأفضل سعر:
مرفأ التحميل: ${j.pol}   مرفأ التفريغ: ${j.pod}
المعدّات: ${eqLine}
البضاعة: ${j.commodity} — HS ${j.hs} — ليست خطرة
الوزن الإجمالي: ${TS.num(j.grossKg, 0)} كغ
الجهوزية: ${TS.fmtDate(j.readyDate)}
يرجى ذكر مدة النقل ومرفأ المسافنة والصلاحية و${lcl(s) ? 'التخزين المجاني في محطة الوجهة' : 'فترة السماح في الوجهة (نحتاج 10–14 يومًا على الأقل)'}.

شكرًا،
قسم التسعير — ${OPS.company.name}`);
          const subj = 'Rate request ' + j.pol + ' → ' + j.pod + ' ' + (lcl(s) ? 'LCL' : '1x' + j.equipment) + ' — ' + s.id;
          b.innerHTML = `<p>${t(L('Choose who to ask (at least 3 for a competitive comparison):', 'اختر من ستسأل (3 على الأقل لمقارنة تنافسية):'))}</p>
            <div class="grid c3">${Object.entries(pool).map(([k, c]) => `<label class="check"><input type="checkbox" value="${k}" ${sel.includes(k) ? 'checked' : ''}><span><b>${esc(c.name)}</b>${c.line ? `<br><small>${t(L('co-loads on', 'يشحن على'))} ${esc(c.line)}</small>` : ''}<br><small class="mono">${esc(c.email)}</small></span></label>`).join('')}</div>
            <h4 style="margin-top:12px">${t(L('Email preview', 'معاينة البريد'))}</h4>${ui().emailCard({ to: sel.map((k) => line(k).email).join('; ') || '…', subject: subj, body })}
            <div class="row" style="margin-top:12px"><button class="btn primary" id="snd">${t(L('Send rate request', 'أرسل طلب السعر'))} ✉</button></div>`;
          b.querySelectorAll('input[type=checkbox]').forEach((c) => (c.onchange = () => { ctx.data.carriers = [...b.querySelectorAll('input:checked')].map((x) => x.value); ctx.save(); ctx.rerender(); }));
          b.querySelector('#snd').onclick = () => {
            if (sel.length < 3) { ctx.mistake(); TS.toast(t(L('Ask at least 3 providers', 'اسأل 3 مزوّدين على الأقل')), 'bad'); return; }
            s.rates.requested = sel.slice();
            ctx.send({ to: sel.map((k) => line(k).email).join('; '), subject: subj, body });
            sel.forEach((k, i) => {
              const r = ctx.sc.rates.find((x) => x.c === k);
              ctx.receive({
                from: line(k).email, subject: L(`${line(k).name} offer ${j.pol}-${j.pod} ${lcl(s) ? 'LCL' : '1x' + j.equipment}`, `عرض ${line(k).name} ${j.pol}-${j.pod} ${lcl(s) ? 'LCL' : '1x' + j.equipment}`),
                body: rateReplyBody(s, r), attachments: [{ name: 'Rate_offer_' + k + '.pdf' }],
                onArrive: (sh) => { if (!sh.rates.received.includes(k)) sh.rates.received.push(k); },
              }, 900 + i * 900);
            });
            ctx.finish('send');
          };
        },
        summary: (ctx) => `<p>✓ ${t(L('Request sent to', 'أُرسل الطلب إلى'))}: ${ctx.ship.rates.requested.map((k) => esc(line(k).name)).join(', ')}</p>`,
      },
      {
        id: 'compare',
        title: L('Compare the offers (buy sheet) and select one', 'قارن العروض (ورقة الكلفة) واختر واحدًا'),
        render(ctx, b) {
          const s = ctx.ship, sc = ctx.sc, got = s.rates.received;
          if (got.length < s.rates.requested.length) { b.innerHTML = `<p class="muted">⏳ ${t(L('Waiting for replies…', 'بانتظار الردود…'))} (${got.length}/${s.rates.requested.length}). ${t(L('They arrive in your inbox in a few seconds.', 'تصل إلى بريدك خلال ثوانٍ.'))}</p>`; return; }
          const reveal = !!ctx.data.reveal, isL = lcl(s);
          const rows = got.map((k) => {
            const r = sc.rates.find((x) => x.c === k), vt = OPS.rateValidTo(s, r);
            const mid = isL ? `<td class="num">${TS.num(r.of)}</td><td class="num">${TS.num(Math.max(1, sc.answer.wm) * r.of)}</td><td class="num">${TS.num(r.extra.reduce((a, x) => a + x.amt, 0))}</td>` : `<td class="num">${TS.num(r.of)}</td><td class="num">${TS.num(r.baf)}</td><td class="num">${TS.num(r.lss)}</td><td class="num">${TS.num(r.extra.reduce((a, x) => a + x.amt, 0))}</td>`;
            return `<tr class="clickable ${ctx.data.pick === k ? 'sel' : ''}" data-pick="${k}"><td><input type="radio" name="pick" ${ctx.data.pick === k ? 'checked' : ''}> <b>${esc(line(k).name)}</b></td>${mid}<td class="num"><b>${TS.num(OPS.rateTotal(r, sc))}</b></td><td class="num">${r.transit}</td><td>${esc(r.ts)}</td><td class="num">${r.free}${isL ? ' <small>(' + TS.num(r.storage) + '/W/M/d)</small>' : ''}</td><td>${TS.fmtDate(vt, false)}</td>${reveal ? `<td class="num">${TS.num(OPS.riskCost(sc, r))}</td>` : ''}</tr>`;
          });
          const heads = [L(isL ? 'Consolidator' : 'Line', isL ? 'المجمِّع' : 'الخط')].concat(isL ? [{ l: L('Rate/W/M', 'السعر/W/M'), num: 1 }, { l: L('Freight', 'الشحن'), num: 1 }, { l: L('Other', 'أخرى'), num: 1 }] : [{ l: 'OF', num: 1 }, { l: 'BAF', num: 1 }, { l: 'LSS', num: 1 }, { l: L('Other', 'أخرى'), num: 1 }]).concat([{ l: L('All-in', 'الشامل'), num: 1 }, { l: L('Days', 'أيام'), num: 1 }, 'T/S', { l: L('Free days', 'أيام السماح'), num: 1 }, L('Valid until', 'صالح حتى')]).concat(reveal ? [{ l: L('Risk-adjusted', 'مع احتساب المخاطر'), num: 1 }] : []);
          b.innerHTML = `<p>${t(isL ? L(`All replies are in. Your buy sheet for ${TS.num(sc.answer.wm)} W/M (USD):`, `وصلت كل الردود. ورقة الكلفة لـ ${TS.num(sc.answer.wm)} W/M (دولار):`) : L('All replies are in. Your buy sheet (USD per container):', 'وصلت كل الردود. ورقة الكلفة (دولار للحاوية):'))}</p>
            ${ui().table(heads, rows)}
            <div class="note">${t(L('Your first possible sailing is around', 'أول باخرة يمكنك اللحاق بها نحو'))} <b>${TS.fmtDate(D(s, sc.etds[1]))}</b>. ${isL ? t(L('Expect the cargo to stay about', 'توقّع أن تبقى البضاعة نحو')) + ` <b>${sc.expectedDays}</b> ` + t(L('days at the destination CFS (unstuffing + clearance).', 'يومًا في محطة الوجهة (تفريغ + تخليص).')) : t(L('Expect about', 'توقّع حوالي')) + ` <b>${sc.expectedDays}</b> ` + t(L('days between discharge and empty return at destination.', 'يومًا بين التفريغ وإرجاع الفارغ في الوجهة.'))}</div>
            ${ctx.data.fb ? `<div class="note ${ctx.data.fbOk ? 'ok' : 'bad'}">${t(ctx.data.fb)}</div>` : ''}
            <div class="row"><button class="btn primary" id="sel">${t(L('Select this offer', 'اختر هذا العرض'))}</button><button class="btn ghost" id="ans">${t(L('Show me the answer', 'أرني الجواب'))}</button></div>`;
          b.querySelectorAll('[data-pick]').forEach((tr) => (tr.onclick = () => { ctx.data.pick = tr.dataset.pick; ctx.data.fb = null; ctx.save(); ctx.rerender(); }));
          const best = OPS.bestRate(s, got);
          b.querySelector('#ans').onclick = () => { ctx.hint(); ctx.data.pick = best.c; ctx.data.reveal = true; ctx.data.fb = L('Best choice: ' + line(best.c).name + ' — lowest cost once you add the ' + (isL ? 'CFS storage' : 'detention') + ' you are likely to pay, and valid for your sailing.', 'الخيار الأفضل: ' + line(best.c).name + ' — أقل كلفة بعد إضافة ' + (isL ? 'التخزين' : 'الاحتجاز') + ' المتوقّع، وصالح لباخرتك.'); ctx.data.fbOk = true; ctx.save(); ctx.rerender(); };
          b.querySelector('#sel').onclick = () => {
            const k = ctx.data.pick; if (!k) return;
            const r = sc.rates.find((x) => x.c === k);
            if (!OPS.rateValidFor(s, r)) { ctx.mistake(); ctx.data.fb = L(`${line(k).name} looks cheap, but the rate expires on ${TS.fmtDate(OPS.rateValidTo(s, r))} — before any sailing you can make. You would be re-quoted at a higher rate.`, `${line(k).name} يبدو رخيصًا، لكن السعر ينتهي في ${TS.fmtDate(OPS.rateValidTo(s, r))} — قبل أي باخرة يمكنك اللحاق بها. سيُعاد تسعيرك بسعر أعلى.`); ctx.data.fbOk = false; ctx.save(); ctx.rerender(); return; }
            if (k !== best.c) {
              ctx.mistake(); ctx.data.reveal = true;
              const extra = R2(OPS.riskCost(sc, r) - OPS.rateTotal(r, sc));
              ctx.data.fb = isL ? L(`Valid, but not the best. With ${r.free} free days at the CFS and ~${sc.expectedDays} days needed, expect about USD ${TS.num(extra)} in storage. Look at the “Risk-adjusted” column.`, `صالح لكنه ليس الأفضل. مع ${r.free} أيام مجانية ونحو ${sc.expectedDays} يومًا مطلوبة، توقّع نحو ${TS.num(extra)} دولار تخزينًا. انظر إلى عمود «مع احتساب المخاطر».`)
                : L(`Valid, but not the best. With ${r.free} free days and ~${sc.expectedDays} days needed, expect about USD ${TS.num(extra)} in demurrage/detention. Look at the “Risk-adjusted” column.`, `صالح لكنه ليس الأفضل. مع ${r.free} أيام سماح ونحو ${sc.expectedDays} يومًا مطلوبة، توقّع نحو ${TS.num(extra)} دولار غرامات. انظر إلى عمود «مع احتساب المخاطر».`);
              ctx.data.fbOk = false; ctx.save(); ctx.rerender(); return;
            }
            s.rates.selected = Object.assign({ carrierName: line(k).name, total: OPS.rateTotal(r, sc), validTo: OPS.rateValidTo(s, r), ref: line(k).bkPrefix + '-Q' + String((OPS.seed(s) + k.charCodeAt(0)) % 9000 + 1000), consol: !!line(k).consol }, TS.clone(r));
            ctx.milestone('RATE', s.sim.today, 'Buy rate selected: ' + line(k).name);
            ctx.finish('compare');
          };
        },
        summary: (ctx) => { const r = ctx.ship.rates.selected; return `<p>✓ <b>${esc(r.carrierName)}</b> — ${t(L('all-in', 'الشامل'))} USD ${TS.num(r.total)}, ${r.transit} ${t(L('days via', 'يومًا عبر'))} ${esc(r.ts)}, ${r.free} ${t(L('free days, valid until', 'أيام سماح، صالح حتى'))} ${TS.fmtDate(r.validTo)} (ref ${esc(r.ref)})</p>`; },
      },
    ],
    quiz: OPS.QUIZ.rates, drills: OPS.QUIZ_DRILLS.rates,
  });

  /* ============================================================ 3. QUOTATION */
  OPS.buildQuoteLines = (ship) => {
    const sc = OPS.sc(ship), r = ship.rates.selected, isL = sc.mode === 'LCL', wmQ = Math.max(1, sc.answer.wm);
    const lines = isL
      ? [{ code: 'OF', desc: L('Ocean freight CFS/CFS ' + ship.jobFile.pol + ' → ' + ship.jobFile.pod + ' (per W/M)', 'الشحن البحري CFS/CFS ' + ship.jobFile.pol + ' ← ' + ship.jobFile.pod + ' (لكل W/M)'), basis: 'wm', qty: wmQ, buy: r.of, vendor: 'carrier', vat: false, group: 'freight', sug: R2(r.of * 1.22) }]
      : [{ code: 'OF', desc: L('Ocean freight ' + ship.jobFile.pol + ' → ' + ship.jobFile.pod, 'الشحن البحري ' + ship.jobFile.pol + ' ← ' + ship.jobFile.pod), basis: 'cntr', buy: r.of, vendor: 'carrier', vat: false, group: 'freight', sug: Math.round((r.of * 1.08 + 40) / 5) * 5 },
        { code: 'BAF', desc: L('Bunker adjustment factor', 'رسم تعديل الوقود'), basis: 'cntr', buy: r.baf, vendor: 'carrier', vat: false, group: 'freight', sug: r.baf },
        { code: 'LSS', desc: L('Low sulphur surcharge', 'رسم الوقود منخفض الكبريت'), basis: 'cntr', buy: r.lss, vendor: 'carrier', vat: false, group: 'freight', sug: r.lss }];
    r.extra.forEach((x) => lines.push({ code: x.code, desc: L(x.name, x.name), basis: x.per === 'bl' || isL ? 'bl' : 'cntr', buy: x.amt, vendor: 'carrier', vat: false, group: 'freight', sug: x.code === 'LBF' ? x.amt + 15 : x.amt }));
    sc.locals.forEach((x) => lines.push(Object.assign(TS.clone(x), { qty: x.basis === 'wm' ? wmQ : 1 })));
    if (sc.insurance) {
      const insured = Math.round((sc.cargo.value + OPS.rateTotal(r, sc)) * 1.1);
      const must = !imp(ship) && sc.answer.incoterm === 'CIF';
      lines.push({ code: 'INS', desc: L(`Cargo insurance${must ? ' (CIF — seller’s obligation)' : ' (optional)'} — insured value USD ${TS.num(insured, 0)} (CIF + 10%)`, `تأمين البضاعة${must ? ' (CIF — موجب على البائع)' : ' (اختياري)'} — القيمة المؤمّنة ${TS.num(insured, 0)} دولار (CIF + 10%)`), basis: 'bl', buy: R2((insured * sc.insurance.buyPct) / 100), vendor: 'insurer', vat: false, group: must ? 'freight' : 'optional', sug: R2((insured * sc.insurance.sellPct) / 100), insured });
    }
    return lines.map((l) => Object.assign({ qty: 1, cur: 'USD', sell: '' }, l));
  };
  OPS.quoteTotals = (q) => {
    const act = q.lines.filter((l) => l.group !== 'optional' || q.insurance);
    const buy = act.reduce((a, l) => a + Number(l.buy || 0) * (l.qty || 1), 0);
    const sell = act.reduce((a, l) => a + Number(l.sell || 0) * (l.qty || 1), 0);
    const vatBase = act.filter((l) => l.vat).reduce((a, l) => a + Number(l.sell || 0) * (l.qty || 1), 0);
    const vat = R2(vatBase * 0.11);
    return { buy: R2(buy), sell: R2(sell), profit: R2(sell - buy), margin: sell ? ((sell - buy) / sell) * 100 : 0, vatBase: R2(vatBase), vat, grand: R2(sell + vat) };
  };
  const basisTxt = (s, l) => (l.basis === 'wm' ? '/W/M × ' + TS.num(l.qty) : l.basis === 'cntr' ? '/' + (s.jobFile.equipment || 'cntr') : '/B/L');

  OPS.steps.push({
    id: 'quote',
    title: L('Quotation to the client', 'عرض السعر للزبون'),
    sub: L('Build the quote line by line, set your margin, write the conditions and win the job.', 'ابنِ العرض بندًا بندًا، حدّد هامشك، اكتب الشروط واربح العملية.'),
    lesson: (s) => lesson('quote')(s) + LB('VAT 11% applies to local services invoiced in Lebanon (THC re-billed, handling, trucking, clearance fees…). International freight is generally treated as exempt/zero-rated. Container deposits, customs duties and import VAT are disbursements — not your revenue.', 'تُطبَّق الضريبة 11% على الخدمات المحلية المفوترة في لبنان (THC المعاد فوترتها، المعالجة، النقل البري، أتعاب التخليص…). يُعامل الشحن الدولي عادةً كمعفى/بنسبة صفر. تأمينات الحاويات والرسوم الجمركية وضريبة الاستيراد سُلف — وليست إيرادك.'),
    parts: [
      {
        id: 'build',
        title: L('Build the quotation', 'ابنِ عرض السعر'),
        render(ctx, b) {
          const s = ctx.ship, sc = ctx.sc;
          if (!ctx.data.q) ctx.data.q = { lines: OPS.buildQuoteLines(s), insurance: false, validTo: '', conds: [] };
          const q = ctx.data.q, tot = OPS.quoteTotals(q), inc = sc.answer.incoterm;
          const conds = [
            { id: 'space', l: L('Subject to space & equipment availability', 'حسب توفّر المساحة والمعدّات'), ok: true },
            { id: 'gri', l: L('Subject to GRI / surcharge changes at time of shipment', 'حسب الزيادات/الرسوم السارية عند الشحن'), ok: true },
            lcl(s) ? { id: 'free', l: L(`Free storage at destination CFS: ${s.rates.selected.free} days; then USD ${TS.num(s.rates.selected.storage)} per W/M per day`, `التخزين المجاني في محطة الوجهة: ${s.rates.selected.free} أيام؛ ثم ${TS.num(s.rates.selected.storage)} دولار لكل W/M يوميًا`), ok: true } : { id: 'free', l: L(`Free time at destination: ${s.rates.selected.free} days combined; after that as per line tariff`, `فترة السماح في الوجهة: ${s.rates.selected.free} أيام مجمّعة؛ بعدها حسب تعرفة الخط`), ok: true },
            { id: 'duty', l: imp(s) ? L('Excludes customs duties, VAT on goods, inspections and port storage', 'لا يشمل الرسوم الجمركية وضريبة البضاعة والكشف والتخزين في المرفأ') : inc === 'DAP' ? L(`Excludes import duties and taxes in ${sc.far.country} (DAP)`, `لا يشمل رسوم وضرائب الاستيراد في ${sc.far.country} (DAP)`) : L(`Excludes destination charges and import duties in ${sc.far.country} (${inc})`, `لا يشمل رسوم الوجهة والرسوم الجمركية في ${sc.far.country} (${inc})`), ok: true },
            sc.insurance && !imp(s) && inc === 'CIF' ? { id: 'ins', l: L('Insurance included as required by CIF (minimum cover, 110% of value)', 'التأمين مشمول كما يفرض CIF (الحد الأدنى، 110% من القيمة)'), ok: true } : { id: 'ins', l: L('Insurance not included unless confirmed in writing', 'التأمين غير مشمول إلا بتأكيد خطي'), ok: true },
            { id: 'tt', l: L('Transit time guaranteed', 'مدة النقل مضمونة'), ok: false },
            lcl(s) ? { id: 'wm', l: L('LCL freight billed on the declared volume only, whatever the CFS measures', 'شحن LCL على الحجم المصرّح فقط مهما قاست المحطة'), ok: false } : { id: 'unl', l: L('Unlimited free time', 'فترة سماح غير محدودة'), ok: false },
          ];
          if (lcl(s)) conds.splice(4, 0, { id: 'meas', l: L('LCL freight is charged on the final CFS weight/measurement (W/M)', 'يُحتسب شحن LCL على الوزن/القياس النهائي في المحطة (W/M)'), ok: true });
          const row = (l, i) => `<tr class="${l.group === 'optional' && !q.insurance ? 'muted' : ''}"><td class="mono">${l.code}</td><td>${t(l.desc)}</td><td>${basisTxt(s, l)}</td><td>${l.vendor}</td><td class="num">${TS.num(l.buy)}</td><td class="num"><input type="number" step="any" data-i="${i}" value="${esc(l.sell)}" style="width:100px"></td><td class="num">${l.sell === '' ? '' : TS.num(Number(l.sell) * (l.qty || 1))}</td><td>${l.vat ? '11%' : '—'}</td></tr>`;
          b.innerHTML = `<p>${t(L('Enter your selling price per unit for every line (USD). Buy prices come from the provider’s offer and your local suppliers. Lines “/W/M” are multiplied by the chargeable W/M.', 'أدخل سعر البيع للوحدة لكل بند (دولار). أسعار الكلفة من عرض المزوّد ومورّديك المحليين. البنود «/W/M» تُضرب بعدد الوحدات المحتسبة.'))}</p>
            ${ui().table([L('Code', 'الرمز'), L('Description', 'الوصف'), L('Basis', 'الأساس'), L('Paid to', 'يُدفع إلى'), { l: L('Buy/unit', 'الكلفة/وحدة'), num: 1 }, { l: L('Sell/unit', 'البيع/وحدة'), num: 1 }, { l: L('Line total', 'مجموع البند'), num: 1 }, 'VAT'], q.lines.map(row).concat([`<tr class="total"><td></td><td>${t(L('Totals', 'المجاميع'))}</td><td></td><td></td><td class="num">${TS.num(tot.buy)}</td><td></td><td class="num">${TS.num(tot.sell)}</td><td class="num">+${TS.num(tot.vat)}</td></tr>`]))}
            ${sc.insurance && q.lines.some((l) => l.group === 'optional') ? `<label class="check"><input type="checkbox" id="ins" ${q.insurance ? 'checked' : ''}><span>${t(L('Include the optional insurance line (the client asked about cover)', 'أضف بند التأمين الاختياري (الزبون سأل عن التغطية)'))}</span></label>` : ''}
            <div class="grid c4" style="margin:12px 0"><div class="stat"><div class="k">${t(L('Profit', 'الربح'))}</div><div class="v">USD ${TS.num(tot.profit)}</div></div><div class="stat"><div class="k">${t(L('Margin', 'الهامش'))}</div><div class="v">${TS.num(tot.margin, 1)}%</div></div><div class="stat"><div class="k">VAT 11%</div><div class="v">${TS.num(tot.vat)}</div></div><div class="stat"><div class="k">${t(L('Total to client', 'المجموع للزبون'))}</div><div class="v">${TS.num(tot.grand)}</div></div></div>
            ${sc.deposit ? `<div class="note">${t(L(`Add as a note (not revenue): container deposit USD ${TS.num(sc.deposit, 0)}, refundable, payable to the line’s agent before D/O.`, `أضف كملاحظة (ليست إيرادًا): تأمين حاوية ${TS.num(sc.deposit, 0)} دولار، مسترد، يُدفع لوكيل الخط قبل إذن التسليم.`))}</div>` : ''}
            <div class="form"><div class="field"><label>${t(L('Quotation valid until', 'العرض صالح حتى'))}</label><input type="date" id="vt" value="${esc(q.validTo)}"></div></div>
            <h4 style="margin-top:12px">${t(L('Conditions to print on the quotation', 'الشروط التي ستُطبع على العرض'))}</h4>
            ${conds.map((c) => `<label class="check ${ctx.data.condChecked ? (q.conds.includes(c.id) === c.ok ? '' : 'wrong') : ''}"><input type="checkbox" data-c="${c.id}" ${q.conds.includes(c.id) ? 'checked' : ''}><span>${t(c.l)}</span></label>`).join('')}
            ${ctx.data.err ? `<div class="note bad">${ctx.data.err.map((e) => '• ' + t(e)).join('<br>')}</div>` : ''}
            <div class="row" style="margin-top:12px"><button class="btn primary" id="chk">${t(L('Check & save quotation', 'تحقّق واحفظ العرض'))}</button><button class="btn ghost" id="ans">${t(L('Suggest prices', 'اقترح أسعارًا'))}</button></div>`;
          b.querySelectorAll('input[data-i]').forEach((inp) => inp.addEventListener('change', () => { q.lines[Number(inp.dataset.i)].sell = inp.value === '' ? '' : Number(inp.value); ctx.save(); ctx.rerender(); }));
          const insEl = b.querySelector('#ins'); if (insEl) insEl.onchange = () => { q.insurance = insEl.checked; ctx.save(); ctx.rerender(); };
          b.querySelector('#vt').onchange = (e) => { q.validTo = e.target.value; ctx.save(); };
          b.querySelectorAll('[data-c]').forEach((c) => (c.onchange = () => { q.conds = [...b.querySelectorAll('[data-c]:checked')].map((x) => x.dataset.c); ctx.data.condChecked = false; ctx.save(); }));
          b.querySelector('#ans').onclick = () => { ctx.hint(); q.lines.forEach((l) => (l.sell = l.sug)); q.validTo = s.rates.selected.validTo; q.conds = conds.filter((c) => c.ok).map((c) => c.id); if (sc.insurance) q.insurance = true; ctx.data.err = null; ctx.save(); ctx.rerender(); };
          b.querySelector('#chk').onclick = () => {
            const err = [];
            const act = q.lines.filter((l) => l.group !== 'optional' || q.insurance);
            if (act.some((l) => l.sell === '' || l.sell == null)) err.push(L('Enter a sell price for every line.', 'أدخل سعر بيع لكل بند.'));
            else if (act.some((l) => Number(l.sell) < Number(l.buy))) err.push(L('One or more lines are sold below cost.', 'بند أو أكثر مُباع تحت الكلفة.'));
            const tt = OPS.quoteTotals(q);
            if (!err.length && tt.margin < 5) err.push(L('Margin below 5% — too thin to cover risk, credit and your time.', 'الهامش أقل من 5% — ضئيل جدًا لتغطية المخاطر والائتمان ووقتك.'));
            if (!err.length && tt.margin > 40) err.push(L('Margin above 40% — unrealistic for this market.', 'الهامش أكثر من 40% — غير واقعي في هذا السوق.'));
            if (!q.validTo) err.push(L('Set a validity date.', 'حدّد تاريخ الصلاحية.'));
            else if (q.validTo > s.rates.selected.validTo) err.push(L('Your validity is longer than the provider’s validity (' + TS.fmtDate(s.rates.selected.validTo) + ').', 'صلاحيتك أطول من صلاحية المزوّد (' + TS.fmtDate(s.rates.selected.validTo) + ').'));
            else if (q.validTo < s.sim.today) err.push(L('Validity is in the past.', 'الصلاحية في الماضي.'));
            if (!conds.every((c) => q.conds.includes(c.id) === c.ok)) { err.push(L('Check the conditions: include all protective ones, never promise guaranteed transit, unlimited free time or a fixed LCL measurement.', 'راجع الشروط: ضع كل الشروط الحامية، ولا تَعِد بمدة نقل مضمونة أو سماح غير محدود أو قياس LCL ثابت.')); ctx.data.condChecked = true; }
            if (err.length) { ctx.mistake(err.length); ctx.data.err = err; ctx.save(); ctx.rerender(); return; }
            ctx.data.err = null;
            const qn = (s.quotation && s.quotation.version) || 0;
            s.quotation = { no: 'Q-' + s.id + '-v' + (qn + 1), version: qn + 1, date: s.sim.today, validTo: q.validTo, lines: TS.clone(q.lines), insurance: !!(q.insurance || q.lines.some((l) => l.code === 'INS' && l.group !== 'optional')), conditions: conds.filter((c) => q.conds.includes(c.id)).map((c) => c.l.en), totals: tt, deposit: sc.deposit, status: 'draft' };
            ctx.finish('build');
          };
        },
        summary: (ctx) => { const q = ctx.ship.quotation; return `<p>✓ ${esc(q.no)} — ${t(L('sell', 'بيع'))} USD ${TS.num(q.totals.sell)} + VAT ${TS.num(q.totals.vat)} = <b>USD ${TS.num(q.totals.grand)}</b>, ${t(L('margin', 'هامش'))} ${TS.num(q.totals.margin, 1)}%. <button class="btn sm ghost" data-doc-open="quote">📄 ${t(L('View document', 'عرض المستند'))}</button></p>`; },
      },
      {
        id: 'send',
        title: L('Send the quotation & handle the reply', 'أرسل العرض وتعامل مع الرد'),
        render(ctx, b) {
          const s = ctx.ship, q = s.quotation, sc = ctx.sc;
          if (ctx.data.waiting) { b.innerHTML = `<p class="muted">⏳ ${t(L('Quotation sent — waiting for the client’s reply (check your inbox).', 'أُرسل العرض — بانتظار رد الزبون (راجع بريدك).'))}</p>`; return; }
          if (ctx.data.nego) {
            b.innerHTML = `<div class="note warn"><strong>${t(L('The client is negotiating', 'الزبون يفاوض'))}</strong>${t(L('Read the client’s email. Revise your quotation (lower margin where justified) and resend.', 'اقرأ بريد الزبون. عدّل عرضك (خفّض الهامش حيث يبرَّر) وأعد الإرسال.'))}</div><button class="btn primary" id="rev">${t(L('Revise quotation', 'عدّل العرض'))}</button>`;
            b.querySelector('#rev').onclick = () => {
              /* pre-fill a revised offer: keep 60% of the margin on every line (the trainee can still edit) */
              const dq = ctx.w.data.q;
              if (dq) dq.lines.forEach((l) => { if (Number(l.sell) > Number(l.buy)) { l.sell = R2(Number(l.buy) + (Number(l.sell) - Number(l.buy)) * 0.6); l.sug = l.sell; } });
              ctx.data.nego = false; ctx.w.parts.build = false; ctx.save(); ctx.rerender();
            };
            return;
          }
          const svc = `${eqTxt(s)} ${s.jobFile.pol} → ${s.jobFile.pod} via ${s.rates.selected.carrierName}`;
          const body = L(`Dear ${sc.client.contact},

Thank you for your inquiry. Please find attached our quotation ${q.no} for ${svc} (transit about ${s.rates.selected.transit} days, via ${s.rates.selected.ts}).

Total: USD ${TS.num(q.totals.sell)} + VAT USD ${TS.num(q.totals.vat)} = USD ${TS.num(q.totals.grand)}${q.deposit ? `
Container deposit (refundable, to the line): USD ${TS.num(q.deposit, 0)}` : ''}
Valid until ${TS.fmtDate(q.validTo)}.

${q.conditions.map((c) => '• ' + c).join('\n')}

We look forward to your confirmation.
Best regards,
${OPS.company.name}`, `السيد/ة ${sc.client.contact} المحترم/ة،

شكرًا لاستفساركم. مرفق عرضنا ${q.no} لـ ${svc} (مدة النقل نحو ${s.rates.selected.transit} يومًا عبر ${s.rates.selected.ts}).

المجموع: ${TS.num(q.totals.sell)} دولار + ضريبة ${TS.num(q.totals.vat)} = ${TS.num(q.totals.grand)} دولار${q.deposit ? `
تأمين الحاوية (مسترد، للخط): ${TS.num(q.deposit, 0)} دولار` : ''}
صالح حتى ${TS.fmtDate(q.validTo)}.

${q.conditions.map((c) => '• ' + c).join('\n')}

بانتظار تأكيدكم.
مع التحية،
${OPS.company.name}`);
          b.innerHTML = ui().emailCard({ to: sc.client.email, subject: 'Quotation ' + q.no, body }) + `<p class="muted">📎 ${esc(q.no)}.pdf</p><div class="row" style="margin-top:12px"><button class="btn primary" id="snd">${t(L('Send quotation', 'أرسل العرض'))} ✉</button></div>`;
          b.querySelector('#snd').onclick = () => {
            ctx.send({ to: sc.client.email, subject: L('Quotation ' + q.no, 'عرض السعر ' + q.no), body, attachments: [{ name: q.no + '.pdf', doc: 'quote' }] });
            q.status = 'sent'; ctx.data.waiting = true;
            /* how far the client accepts depends on the case and the persona (demanding clients always push back once) */
            const sugQ = { lines: OPS.buildQuoteLines(s).map((l) => Object.assign(l, { sell: l.sug })), insurance: q.insurance };
            const sugM = OPS.quoteTotals(sugQ).margin;
            const limit = Math.max(10, Math.min(36, sc.tone === 'demanding' ? sugM - 0.5 : sc.tone === 'urgent' ? sugM + 8 : sugM + 4));
            const nego = q.totals.margin > limit;
            const compTotal = Math.round(q.totals.buy * (sc.tone === 'demanding' ? 1.09 : 1.12));
            const nb = sc.tone === 'demanding'
              ? L(`Your offer is not competitive. We have an all-in offer of USD ${TS.num(compTotal, 0)} before VAT. Revise today or we go elsewhere.\n\n${sc.client.contact}`, `عرضكم غير تنافسي. لدينا عرض شامل بـ ${TS.num(compTotal, 0)} دولار قبل الضريبة. عدّلوا اليوم وإلا نذهب لغيركم.\n\n${sc.client.contact}`)
              : L(`Hello,\n\nYour price is a bit high. Another forwarder offered us about USD ${TS.num(compTotal, 0)} before VAT for the same service. Can you review?\n\n${sc.client.contact}`, `مرحبًا،\n\nسعركم مرتفع قليلًا. وكيل آخر عرض علينا نحو ${TS.num(compTotal, 0)} دولار قبل الضريبة للخدمة نفسها. هل يمكنكم المراجعة؟\n\n${sc.client.contact}`);
            const ok = L(`Hello,\n\nWe approve your quotation ${q.no}. Please proceed with the booking${imp(s) ? ' and coordinate with our supplier ' + sc.shipper.contact : ''}.${q.insurance ? ' Please also arrange the cargo insurance as quoted.' : ''}${sc.tone === 'urgent' ? ' Please hurry!' : ''}\n\nRegards,\n${sc.client.contact}`, `مرحبًا،\n\nنوافق على عرضكم ${q.no}. يرجى متابعة الحجز${imp(s) ? ' والتنسيق مع المورّد ' + sc.shipper.contact : ''}.${q.insurance ? ' ويرجى أيضًا ترتيب التأمين كما في العرض.' : ''}${sc.tone === 'urgent' ? ' بسرعة لو سمحتم!' : ''}\n\nمع التحية،\n${sc.client.contact}`);
            ctx.receive({
              from: sc.client.email,
              subject: nego ? L('RE: Quotation ' + q.no + ' — too expensive', 'رد: العرض ' + q.no + ' — مرتفع') : L('RE: Quotation ' + q.no + ' — approved', 'رد: العرض ' + q.no + ' — موافقة'),
              body: nego ? nb : ok,
              onArrive: (sh) => {
                const w = sh.work.quote; w.data.waiting = false;
                if (nego) { w.data.nego = true; sh.quotation.status = 'negotiation'; }
                else { sh.quotation.status = 'accepted'; sh.quotation.acceptedOn = sh.sim.today; w.parts.send = true; sh.sim.today = TS.addDays(sh.sim.today, 1); sh.milestones.push({ code: 'QACC', date: sh.sim.today, label: 'Quotation accepted' }); OPS.app.checkStep(sh, OPS.steps.find((x) => x.id === 'quote')); }
              },
            }, 1800);
            ctx.save(); ctx.rerender();
          };
        },
        summary: (ctx) => `<p>✓ ${t(L('Quotation accepted by the client on', 'وافق الزبون على العرض بتاريخ'))} ${TS.fmtDate(ctx.ship.quotation.acceptedOn)}.</p>`,
      },
    ],
    quiz: OPS.QUIZ.quote, drills: OPS.QUIZ_DRILLS.quote,
  });

  /* ============================================================ 4. BOOKING */
  OPS.steps.push({
    id: 'booking',
    title: L('Booking with the line / consolidator', 'الحجز لدى الخط / المجمِّع'),
    sub: L('Choose the right sailing, place the booking, read the booking confirmation (SO) and its cutoffs.', 'اختر الباخرة المناسبة، قدّم الحجز، واقرأ تأكيد الحجز (SO) ومواعيده النهائية.'),
    lesson: lesson('booking'),
    parts: [
      {
        id: 'sailing',
        title: L('Choose the sailing', 'اختر الباخرة'),
        render(ctx, b) {
          const s = ctx.ship, r = s.rates.selected, sch = OPS.schedule(s, r.c), ready = s.jobFile.readyDate, isL = lcl(s);
          b.innerHTML = `<p>${t(L('Cargo ready', 'جهوزية البضاعة'))}: <b>${TS.fmtDate(ready)}</b>. ${t(isL ? L('Delivery to the CFS takes about 1 day, and you want 1 day buffer before the CFS cutoff.', 'التسليم إلى محطة التجميع يحتاج نحو يوم، وتريد يوم أمان قبل موعد CFS.') : L('Stuffing + trucking takes about 1 day, and you want 1 day buffer before the CY cutoff.', 'التعبئة + النقل تحتاج نحو يوم، وتريد يوم أمان قبل موعد CY.'))}</p>
            ${ui().table(['', L('Vessel', 'الباخرة'), L('Voyage', 'الرحلة'), 'ERD', 'SI cut'].concat(isL ? ['CFS cut'] : ['VGM cut', 'CY cut']).concat(['ETD', 'ETA']), sch.map((v) => `<tr class="clickable ${ctx.data.v === v.idx ? 'sel' : ''}" data-v="${v.idx}"><td><input type="radio" ${ctx.data.v === v.idx ? 'checked' : ''}></td><td>${esc(v.vessel)}</td><td class="mono">${v.voyage}</td><td>${TS.fmtDate(v.erd, false)}</td><td>${TS.fmtDate(v.si, false)}</td>${isL ? '' : `<td>${TS.fmtDate(v.vgm, false)}</td>`}<td><b>${TS.fmtDate(v.cy, false)}</b></td><td>${TS.fmtDate(v.etd, false)}</td><td>${TS.fmtDate(v.eta, false)}</td></tr>`))}
            ${ctx.data.fb ? `<div class="note bad">${t(ctx.data.fb)}</div>` : ''}
            <div class="row"><button class="btn primary" id="ok">${t(L('Choose this sailing', 'اختر هذه الباخرة'))}</button><button class="btn ghost" id="ans">${t(L('Show me the answer', 'أرني الجواب'))}</button></div>`;
          b.querySelectorAll('[data-v]').forEach((tr) => (tr.onclick = () => { ctx.data.v = Number(tr.dataset.v); ctx.data.fb = null; ctx.save(); ctx.rerender(); }));
          b.querySelector('#ans').onclick = () => { ctx.hint(); ctx.data.v = sch.findIndex((v) => TS.diffDays(ready, v.cy) >= 2); ctx.save(); ctx.rerender(); };
          b.querySelector('#ok').onclick = () => {
            const v = sch[ctx.data.v]; if (!v) return;
            const first = sch.findIndex((x) => TS.diffDays(ready, x.cy) >= 2);
            if (TS.diffDays(ready, v.cy) < 2) { ctx.mistake(); ctx.data.fb = L(`Impossible: the ${isL ? 'CFS' : 'CY'} cutoff ${TS.fmtDate(v.cy)} leaves no time after cargo ready ${TS.fmtDate(ready)} for ${isL ? 'delivery to the CFS' : 'stuffing, trucking'} and a buffer.`, `مستحيل: موعد ${isL ? 'CFS' : 'CY'} ${TS.fmtDate(v.cy)} لا يترك وقتًا بعد الجهوزية ${TS.fmtDate(ready)} ${isL ? 'للتسليم إلى المحطة' : 'للتعبئة والنقل'} وهامش الأمان.`); ctx.save(); ctx.rerender(); return; }
            if (v.idx !== first) { ctx.mistake(); ctx.data.fb = L('Feasible, but a week later than necessary. The client wants the earliest safe sailing.', 'ممكن لكن متأخر أسبوعًا بلا داعٍ. الزبون يريد أبكر باخرة آمنة.'); ctx.save(); ctx.rerender(); return; }
            ctx.data.sailing = v; ctx.finish('sailing');
          };
        },
        summary: (ctx) => { const v = ctx.data.sailing; return `<p>✓ ${esc(v.vessel)} ${esc(v.voyage)} — ETD ${TS.fmtDate(v.etd)}, ${lcl(ctx.ship) ? 'CFS' : 'CY'} cutoff ${TS.fmtDate(v.cy)}</p>`; },
      },
      {
        id: 'request',
        title: L('Place the booking', 'قدّم الحجز'),
        render(ctx, b) {
          const s = ctx.ship, r = s.rates.selected, v = ctx.data.sailing, j = s.jobFile, sc = ctx.sc, isL = lcl(s);
          if (ctx.data.waiting) { b.innerHTML = `<p class="muted">⏳ ${t(L('Booking request submitted — waiting for the booking confirmation (SO)…', 'تم تقديم الحجز — بانتظار تأكيد الحجز (SO)…'))}</p>`; return; }
          const ftAns = imp(s) ? 'Collect' : 'Prepaid';
          const fields = [
            { k: 'party', label: L('Booking party', 'الجهة الحاجزة'), ro: true, value: () => OPS.company.name },
            { k: 'ref', label: L('Rate / quote reference', 'مرجع السعر'), ro: true, value: () => r.ref },
            { k: 'pol', label: 'POL', type: 'select', options: portOpts(), ans: () => j.pol },
            { k: 'pod', label: 'POD', type: 'select', options: portOpts(), ans: () => j.pod },
            { k: 'eq', label: L('Equipment', 'المعدّات'), type: 'select', options: eqOpts(), ans: () => j.equipment },
          ];
          if (isL) fields.push({ k: 'pk', label: L('Packages', 'الطرود'), type: 'number', ans: () => j.packages }, { k: 'cbm', label: L('Volume', 'الحجم'), unit: 'CBM', type: 'number', tol: 0.05, ans: () => j.cbm });
          else fields.push({ k: 'qty', label: L('Quantity', 'العدد'), type: 'number', ans: () => 1 });
          fields.push(
            { k: 'com', label: L('Commodity', 'البضاعة'), contains: sc.cargo.keywords, containsAlt: sc.cargo.keywordsAr, ans: () => j.commodity, full: true },
            { k: 'kg', label: L('Cargo gross weight', 'الوزن الإجمالي للبضاعة'), unit: 'kg', type: 'number', tol: 2, ans: () => j.grossKg },
            { k: 'dg', label: L('Dangerous goods', 'بضائع خطرة'), type: 'select', options: yesNo, ans: () => 'no' },
            { k: 'ft', label: L('Freight terms (master)', 'شروط دفع الشحن (البوليصة الرئيسية)'), type: 'select', options: [{ v: 'Prepaid', l: L('Prepaid', 'مسبق الدفع') }, { v: 'Collect', l: L('Collect', 'يُدفع عند الوصول') }], ans: () => ftAns, fb: imp(s) ? L(`${sc.answer.incoterm}: freight is for the buyer’s account and we pay it at destination (Beirut) → Collect.`, `${sc.answer.incoterm}: الشحن على حساب المشتري وندفعه في الوجهة (بيروت) ← Collect.`) : L(`${sc.answer.incoterm}: the seller pays the freight at origin → Prepaid.`, `${sc.answer.incoterm}: البائع يدفع الشحن في المنشأ ← Prepaid.`) },
          );
          ui().form(ctx, b, {
            key: 'bkreq', intro: L(`${r.carrierName} e-booking — ${v.vessel} ${v.voyage}`, `حجز إلكتروني ${r.carrierName} — ${v.vessel} ${v.voyage}`), submit: L('Submit booking', 'قدّم الحجز'), fields,
            onSuccess: (vals) => {
              const car = line(r.c);
              const no = car.bkPrefix + String(100000 + (OPS.seed(s) % 899999)).padStart(7, '0');
              ctx.data.waiting = true;
              ctx.send({ to: car.email, subject: 'Booking request ' + v.vessel + ' ' + v.voyage + ' — ' + s.id, body: L(`Please confirm booking: ${isL ? 'LCL ' + vals.pk + ' pkgs / ' + vals.cbm + ' CBM' : '1 × ' + vals.eq}, ${vals.pol} → ${vals.pod}, ${v.vessel} ${v.voyage}, ${vals.com}, ${vals.kg} kg, non-DG, freight ${vals.ft}. Ref ${r.ref}.`, `يرجى تأكيد الحجز: ${isL ? 'LCL ' + vals.pk + ' طرد / ' + vals.cbm + ' م³' : '1 × ' + vals.eq}، ${vals.pol} ← ${vals.pod}، ${v.vessel} ${v.voyage}، ${vals.com}، ${vals.kg} كغ، غير خطرة، الشحن ${vals.ft}. المرجع ${r.ref}.`) });
              const depot = isL ? (imp(s) ? `${sc.far.city} — ${car.name} CFS` : sc.cfs) : imp(s) ? `${sc.far.city} — empty container depot` : sc.depot;
              const bk = { no, carrier: r.c, carrierName: r.carrierName, consol: isL, vessel: v.vessel, voyage: v.voyage, pol: j.pol, pod: j.pod, equipment: isL ? 'LCL' : vals.eq, qty: 1, freightTerms: vals.ft, etd: v.etd, eta: v.eta, ts: v.ts, cutoffs: { erd: v.erd, si: v.si, vgm: v.vgm, cy: v.cy, doc: v.doc }, depot, freeDays: r.free, status: 'confirmed', confirmedOn: s.sim.today };
              const R = (k, x) => `<tr><th>${k}</th><td>${x}</td></tr>`;
              const tbl = `<div class="table-wrap"><table><tbody>${R('Booking no.', `<b class="mono">${no}</b>`)}${R('Vessel / voyage', v.vessel + ' / ' + v.voyage)}${R('POL → POD', j.pol + ' → ' + j.pod + ' (T/S ' + v.ts + ')')}${R('Equipment', isL ? 'LCL — ' + vals.pk + ' packages, ' + vals.cbm + ' CBM' : '1 × ' + vals.eq)}${R('ETD / ETA', TS.fmtDate(v.etd) + ' / ' + TS.fmtDate(v.eta))}${R(isL ? 'CFS receiving from' : 'ERD', TS.fmtDate(v.erd))}${R('SI cutoff', TS.fmtDate(v.si) + ' 12:00')}${isL ? '' : R('VGM cutoff', TS.fmtDate(v.vgm) + ' 12:00')}${R(isL ? 'CFS cutoff' : 'CY cutoff', TS.fmtDate(v.cy) + ' 16:00')}${R(isL ? 'Deliver cargo to' : 'Empty pickup', depot)}${R(isL ? 'Free storage at POD CFS' : 'Free time at POD', r.free + (isL ? ' days' : ' days combined DEM/DET'))}${R('Freight', vals.ft)}</tbody></table></div>`;
              ctx.receive({
                from: car.email, subject: L('Booking confirmation ' + no + ' — ' + v.vessel, 'تأكيد الحجز ' + no + ' — ' + v.vessel),
                body: L(`Dear customer,\n\nYour booking is confirmed.\n${tbl}${isL ? 'Cargo delivered after the CFS cutoff will be shipped on the next consolidation. Packages must be marked and labelled.' : 'Containers arriving after CY cutoff will be rolled. SI and VGM must be submitted before cutoff.'}\n\n${car.name} Customer Service`, `عميلنا العزيز،\n\nتم تأكيد حجزكم.\n${tbl}${isL ? 'البضاعة المسلّمة بعد موعد CFS تُشحن مع التجميع التالي. يجب وضع العلامات على الطرود.' : 'الحاويات التي تصل بعد موعد CY ستُنقل إلى الباخرة التالية. يجب تقديم SI وVGM قبل الموعد.'}\n\nخدمة العملاء ${car.name}`),
                attachments: [{ name: 'SO_' + no + '.pdf', doc: 'so' }],
                onArrive: (sh) => { sh.booking = bk; sh.work.booking.data.waiting = false; sh.work.booking.parts.request = true; },
              }, 1500);
              ctx.save(); ctx.rerender();
            },
          });
        },
        summary: (ctx) => `<p>✓ ${t(L('Booking confirmed', 'تم تأكيد الحجز'))}: <b class="mono">${esc(ctx.ship.booking.no)}</b> — <button class="btn sm ghost" data-doc-open="so">📄 ${t(L('Booking confirmation', 'تأكيد الحجز'))}</button></p>`,
      },
      {
        id: 'readso',
        title: L('Read the booking confirmation and inform the client', 'اقرأ تأكيد الحجز وأبلغ الزبون'),
        render(ctx, b) {
          const s = ctx.ship, bk = s.booking, sc = ctx.sc, isL = lcl(s);
          const fields = [{ k: 'no', label: L('Booking number', 'رقم الحجز'), ans: () => bk.no }, { k: 'si', label: 'SI cutoff', type: 'date', ans: () => bk.cutoffs.si }];
          if (!isL) fields.push({ k: 'vgm', label: 'VGM cutoff', type: 'date', ans: () => bk.cutoffs.vgm });
          fields.push({ k: 'cy', label: isL ? 'CFS cutoff' : 'CY cutoff', type: 'date', ans: () => bk.cutoffs.cy }, { k: 'free', label: isL ? L('Free storage days at POD CFS', 'أيام التخزين المجانية في محطة الوجهة') : L('Free days at POD', 'أيام السماح في مرفأ التفريغ'), type: 'number', ans: () => bk.freeDays }, { k: 'etd', label: 'ETD', type: 'date', ans: () => bk.etd });
          ui().form(ctx, b, {
            key: 'readso', intro: L('Open the SO in your inbox (or click the attachment) and copy the key data into the job file.', 'افتح تأكيد الحجز في بريدك (أو انقر المرفق) وانسخ البيانات الأساسية إلى ملف العملية.'), fields,
            submit: L('Save & send booking confirmation to client', 'احفظ وأرسل تأكيد الحجز للزبون'),
            onSuccess: () => {
              const nextEn = imp(s) ? `Our ${sc.far.city} agent ${sc.agent.name} will contact the supplier to arrange ${isL ? 'the delivery of the cargo to the CFS' : 'the empty container and stuffing'}.` : isL ? `Our truck will collect the cargo at your factory in ${sc.client.area} and deliver it to the CFS before the cutoff; please confirm the loading date and mark every package.` : `We will arrange the empty container to your factory in ${sc.client.area}; please confirm the loading date.`;
              const nextAr = imp(s) ? `وكيلنا في ${sc.far.city} ${sc.agent.name} سيتواصل مع المورّد لترتيب ${isL ? 'تسليم البضاعة إلى محطة التجميع' : 'الحاوية الفارغة والتعبئة'}.` : isL ? `ستستلم شاحنتنا البضاعة من مصنعكم في ${sc.client.area} وتسلّمها للمحطة قبل الموعد؛ يرجى تأكيد تاريخ التحميل ووضع العلامات على كل طرد.` : `سنرسل الحاوية الفارغة إلى مصنعكم في ${sc.client.area}؛ يرجى تأكيد تاريخ التحميل.`;
              ctx.send({ to: sc.client.email + (imp(s) ? '; ' + sc.agent.email : ''), cc: imp(s) ? sc.shipper.email : '', subject: L('Booking confirmed ' + bk.no + ' — ' + s.id, 'تأكيد الحجز ' + bk.no + ' — ' + s.id), body: L(`Dear all,\n\nBooking ${bk.no} is confirmed on ${bk.vessel} ${bk.voyage}, ETD ${TS.fmtDate(bk.etd)}, ETA ${TS.fmtDate(bk.eta)} (estimated).\n${isL ? 'CFS' : 'CY'} cutoff: ${TS.fmtDate(bk.cutoffs.cy)} — SI cutoff: ${TS.fmtDate(bk.cutoffs.si)}${isL ? '' : ' — VGM cutoff: ' + TS.fmtDate(bk.cutoffs.vgm)}.\n${nextEn}\n\nBest regards,\n${OPS.company.name}`, `إلى الجميع،\n\nالحجز ${bk.no} مؤكد على ${bk.vessel} ${bk.voyage}، المغادرة ${TS.fmtDate(bk.etd)}، الوصول ${TS.fmtDate(bk.eta)} (تقديري).\nموعد ${isL ? 'CFS' : 'CY'}: ${TS.fmtDate(bk.cutoffs.cy)} — موعد SI: ${TS.fmtDate(bk.cutoffs.si)}${isL ? '' : ' — موعد VGM: ' + TS.fmtDate(bk.cutoffs.vgm)}.\n${nextAr}\n\nمع التحية،\n${OPS.company.name}`), attachments: [{ name: 'SO_' + bk.no + '.pdf', doc: 'so' }] });
              ctx.advance(D(s, 2));
              ctx.milestone('BKG', s.sim.today, 'Booking confirmed ' + bk.no);
              ctx.finish('readso');
            },
          });
        },
      },
    ],
    quiz: OPS.QUIZ.booking, drills: OPS.QUIZ_DRILLS.booking,
  });

  /* ============================================================ 5. EMPTY PICKUP & STUFFING / CARGO TO CFS */
  const stuffDateAns = (s) => { const bk = s.booking, rd = s.jobFile.readyDate; const e = lcl(s) ? bk.cutoffs.erd : TS.addDays(bk.cutoffs.erd, -1); return rd > e ? rd : e; };
  const tareOf = (s) => (OPS.EQ[s.booking.equipment] ? OPS.EQ[s.booking.equipment].tare : 3900) - 40 + (OPS.seed(s) % 9) * 10;
  const dunOf = (s) => 60 + (OPS.seed(s) % 15) * 10;
  const sealOf = (s) => line(s.booking.carrier).prefix.slice(0, 3) + (700000 + (OPS.seed(s) % 99999));
  OPS.h.tareOf = tareOf; OPS.h.dunOf = dunOf; OPS.h.sealOf = sealOf;
  OPS.measured = (s) => { const sc = OPS.sc(s), f = 1 + (2 + (OPS.seed(s) % 5)) / 100; const cbm = R2(sc.answer.cbm * f); return { cbm, kg: sc.answer.grossKg, wm: R2(Math.max(cbm, sc.answer.grossKg / 1000)) }; };

  OPS.steps.push({
    id: 'stuffing',
    title: (s) => (s && OPS.sc(s).mode === 'LCL' ? L('Cargo delivery to the CFS & dock receipt', 'تسليم البضاعة إلى محطة التجميع وإيصال الاستلام') : L('Empty pickup, stuffing, VGM & seal', 'سحب الحاوية الفارغة، التعبئة، VGM والختم')),
    sub: L('Get the cargo into a container — your own box (FCL) or the consolidator’s (LCL) — with the right numbers.', 'أدخل البضاعة إلى حاوية — حاويتك (FCL) أو حاوية المجمِّع (LCL) — بالأرقام الصحيحة.'),
    lesson: (s) => lesson('stuffing')(s) + LB('For Lebanese exports from the Bekaa or the North, trucking to Beirut crosses busy mountain or coastal roads: allow time, check the truck’s permits and axle weights, and avoid picking up the empty too early — origin detention counts from the depot gate-out.', 'في الصادرات اللبنانية من البقاع أو الشمال يعبر النقل إلى بيروت طرقًا جبلية أو ساحلية مزدحمة: خصّص وقتًا كافيًا، تحقّق من تصاريح الشاحنة وأوزان المحاور، ولا تسحب الفارغ مبكرًا — الاحتجاز في المنشأ يُحتسب من خروجها من المستودع.'),
    parts: [
      {
        id: 'arrange',
        title: (s) => (OPS.sc(s).mode === 'LCL' ? L('Arrange delivery of the cargo to the CFS', 'رتّب تسليم البضاعة إلى محطة التجميع') : L('Arrange empty pickup and stuffing', 'رتّب سحب الفارغ والتعبئة')),
        render(ctx, b) {
          const s = ctx.ship, bk = s.booking, sc = ctx.sc, isL = lcl(s);
          if (ctx.data.waiting) { b.innerHTML = `<p class="muted">⏳ ${t(L('Instructions sent — waiting for the report…', 'أُرسلت التعليمات — بانتظار التقرير…'))}</p>`; return; }
          const to = imp(s) ? sc.agent : OPS.parties.trucker;
          const cutTxt = isL ? 'CFS' : 'CY';
          const fields = [
            { k: 'bk', label: L('Booking number', 'رقم الحجز'), ans: () => bk.no },
            { k: 'eq', label: L('Equipment', 'المعدّات'), type: 'select', options: eqOpts(), ans: () => bk.equipment },
            { k: 'depot', label: isL ? L('Deliver cargo to (CFS)', 'تسليم البضاعة إلى (المحطة)') : L('Empty pickup depot', 'مستودع سحب الفارغ'), ro: true, value: () => bk.depot },
            { k: 'addr', label: isL ? L('Collection address (shipper)', 'عنوان الاستلام (الشاحن)') : L('Stuffing address', 'عنوان التعبئة'), contains: [imp(s) ? sc.far.city : sc.client.area], ans: () => sc.shipper.address, full: true, fb: L('The cargo is at the shipper’s premises — copy the shipper’s address.', 'البضاعة في مقرّ الشاحن — انسخ عنوان الشاحن.') },
            { k: 'date', label: isL ? L('Delivery date at the CFS', 'تاريخ التسليم إلى المحطة') : L('Stuffing date', 'تاريخ التعبئة'), type: 'date', ans: () => stuffDateAns(s), check: (v) => (v < s.jobFile.readyDate ? L('Before cargo ready date.', 'قبل تاريخ الجهوزية.') : v > TS.addDays(bk.cutoffs.cy, -2) ? L(`Too late: keep at least one day buffer before the ${cutTxt} cutoff.`, `متأخر جدًا: احتفظ بيوم أمان على الأقل قبل موعد ${cutTxt}.`) : isL ? (v < bk.cutoffs.erd ? L('The CFS only receives from ' + TS.fmtDate(bk.cutoffs.erd) + '.', 'المحطة تستلم من ' + TS.fmtDate(bk.cutoffs.erd) + ' فقط.') : true) : TS.diffDays(v, bk.cutoffs.erd) > 2 ? L('Too early: the terminal only receives from ERD (' + TS.fmtDate(bk.cutoffs.erd) + ') — the loaded box would wait and detention runs.', 'مبكر جدًا: المحطة تستلم من ERD (' + TS.fmtDate(bk.cutoffs.erd) + ') فقط — ستنتظر الحاوية ويحتسب الاحتجاز.') : true) },
            { k: 'kg', label: L('Expected cargo gross weight', 'الوزن الإجمالي المتوقّع للبضاعة'), unit: 'kg', type: 'number', tol: 2, ans: () => s.jobFile.grossKg },
          ];
          if (isL) fields.splice(5, 0, { k: 'pk', label: L('Packages to be delivered', 'الطرود المسلّمة'), type: 'number', ans: () => s.jobFile.packages });
          ui().form(ctx, b, {
            key: 'arrange',
            intro: isL ? (imp(s) ? L(`Ask your ${sc.far.city} agent to ${sc.answer.incoterm === 'FOB' ? 'make sure the supplier delivers the cargo to the consolidator’s CFS' : 'collect the cargo at the supplier and deliver it to the CFS'} before the cutoff.`, `اطلب من وكيلك في ${sc.far.city} ${sc.answer.incoterm === 'FOB' ? 'التأكّد من أن المورّد يسلّم البضاعة إلى محطة المجمِّع' : 'استلام البضاعة من المورّد وتسليمها للمحطة'} قبل الموعد.`) : L('Send a trucking order to collect the cargo at your client’s factory and deliver it to the consolidator’s CFS in Beirut.', 'أرسل أمر نقل لاستلام البضاعة من مصنع زبونك وتسليمها لمحطة المجمِّع في بيروت.'))
              : imp(s) ? L(`Send stuffing instructions to your ${sc.far.city} agent (who coordinates with the supplier and its trucker).`, `أرسل تعليمات التعبئة لوكيلك في ${sc.far.city} (ينسّق مع المورّد وشركة النقل).`) : L(`Send a trucking order to your Lebanese trucker for empty pickup, live loading in ${sc.client.area} and full delivery to Beirut terminal.`, `أرسل أمر نقل إلى شركة النقل اللبنانية لسحب الفارغ والتحميل المباشر في ${sc.client.area} وتسليم المعبّأة إلى محطة بيروت.`),
            submit: L('Send instructions', 'أرسل التعليمات'), fields,
            onSuccess: (v) => {
              const cand = OPS.containerCandidates(line(bk.carrier).prefix, OPS.seed(s));
              ctx.data.cand = cand; ctx.data.waiting = true; ctx.data.stuffDate = v.date;
              ctx.advance(TS.addDays(v.date, -1));
              const order = isL ? L(`Please collect ${v.pk} ${s.jobFile.pkgType} (${v.kg} kg) at ${v.addr} and deliver to ${bk.depot} on ${TS.fmtDate(v.date)} under booking ${bk.no}. Every package must be marked. Send us the dock receipt.`, `يرجى استلام ${v.pk} طرد (${v.kg} كغ) من ${v.addr} وتسليمها إلى ${bk.depot} بتاريخ ${TS.fmtDate(v.date)} بموجب الحجز ${bk.no}. يجب وضع علامات على كل طرد. أرسلوا لنا إيصال الاستلام.`)
                : L(`Please arrange 1 × ${v.eq} under booking ${bk.no}. Pick up the empty at ${bk.depot}. Stuffing at ${v.addr} on ${TS.fmtDate(v.date)}. Expected cargo weight ${v.kg} kg. Please inspect the container before loading, send photos, container & seal numbers and the signed VGM. Gate-in before ${TS.fmtDate(TS.addDays(bk.cutoffs.cy, -1))}.`, `يرجى ترتيب 1 × ${v.eq} بموجب الحجز ${bk.no}. سحب الفارغ من ${bk.depot}. التعبئة في ${v.addr} بتاريخ ${TS.fmtDate(v.date)}. الوزن المتوقّع ${v.kg} كغ. يرجى فحص الحاوية قبل التحميل وإرسال الصور ورقم الحاوية والختم وVGM الموقّع. الدخول قبل ${TS.fmtDate(TS.addDays(bk.cutoffs.cy, -1))}.`);
              ctx.send({ to: to.email, subject: isL ? L('Cargo delivery to CFS — booking ' + bk.no, 'تسليم البضاعة للمحطة — الحجز ' + bk.no) : L('Stuffing instructions — booking ' + bk.no, 'تعليمات التعبئة — الحجز ' + bk.no), body: order, attachments: [{ name: (isL ? 'Delivery_order_CFS_' : 'Stuffing_instructions_') + bk.no + '.pdf', doc: 'trk' }] });
              if (isL) {
                const m = OPS.measured(s);
                ctx.receive({
                  from: line(bk.carrier).email, subject: L('Dock receipt — booking ' + bk.no, 'إيصال الاستلام — الحجز ' + bk.no),
                  body: L(`Dear customer,\n\nCargo received at ${bk.depot} on ${TS.fmtDate(v.date)}:\n• ${s.jobFile.packages} ${s.jobFile.pkgType}, received in apparent good order\n• Measured by CFS: ${TS.num(m.cbm)} CBM (declared ${TS.num(s.jobFile.cbm)} CBM)\n• Weighed: ${TS.num(m.kg, 0)} kg\nFreight will be invoiced on the CFS measurement.\nThe cargo will be consolidated in container ${cand.list[1]} — please double-check this number, our system shows ${cand.list[0]} and ${cand.list[2]} for other shipments on the same day.\n\n${line(bk.carrier).name} CFS`, `عميلنا العزيز،\n\nاستُلمت البضاعة في ${bk.depot} بتاريخ ${TS.fmtDate(v.date)}:\n• ${s.jobFile.packages} طرد، بحالة ظاهرية جيدة\n• قياس المحطة: ${TS.num(m.cbm)} م³ (المصرّح ${TS.num(s.jobFile.cbm)} م³)\n• الوزن: ${TS.num(m.kg, 0)} كغ\nيُفوتر الشحن على قياس المحطة.\nستُجمع البضاعة في الحاوية ${cand.list[1]} — يرجى التحقّق من الرقم، فنظامنا يُظهر ${cand.list[0]} و${cand.list[2]} لشحنات أخرى في اليوم نفسه.\n\nمحطة ${line(bk.carrier).name}`),
                  attachments: [{ name: 'Dock_receipt_' + bk.no + '.pdf', doc: 'dr' }],
                  onArrive: (sh) => { const w = sh.work.stuffing; w.data.waiting = false; w.parts.arrange = true; sh.equipment = Object.assign(sh.equipment || {}, { cfsReceived: v.date, measuredCbm: m.cbm, measuredKg: m.kg }); },
                }, 1500);
              } else {
                ctx.receive({
                  from: to.email, subject: L('Empty picked up — booking ' + bk.no, 'تم سحب الفارغ — الحجز ' + bk.no),
                  body: L(`Hello,\n\nEmpty picked up today. The numbers we have from different sources:\n• Driver’s WhatsApp: ${cand.list[0]}\n• Depot EIR: ${cand.list[1]}\n• Loading supervisor’s note: ${cand.list[2]}\nPlease confirm which is correct before we send the VGM.\nThe CSC plate shows tare ${tareOf(s)} kg. Seal to be used: ${sealOf(s)}.\nDunnage & lashing: ${dunOf(s)} kg.\n\n${to.contact || to.name}`, `مرحبًا،\n\nتم سحب الفارغ اليوم. الأرقام التي لدينا من مصادر مختلفة:\n• واتساب السائق: ${cand.list[0]}\n• إيصال المستودع EIR: ${cand.list[1]}\n• ملاحظة مشرف التحميل: ${cand.list[2]}\nيرجى تأكيد الرقم الصحيح قبل إرسال VGM.\nلوحة CSC تُظهر الوزن فارغة ${tareOf(s)} كغ. الختم المستعمل: ${sealOf(s)}.\nالدعامات والربط: ${dunOf(s)} كغ.\n\n${to.contact || to.name}`),
                  attachments: [{ name: 'EIR_out_' + bk.no + '.pdf', doc: 'eirout' }],
                  onArrive: (sh) => { const w = sh.work.stuffing; w.data.waiting = false; w.parts.arrange = true; },
                }, 1500);
              }
              ctx.save(); ctx.rerender();
            },
          });
        },
        summary: (ctx) => `<p>✓ ${t(lcl(ctx.ship) ? L('Cargo delivered to the CFS on', 'سُلّمت البضاعة للمحطة بتاريخ') : L('Stuffing planned on', 'التعبئة مخطّطة بتاريخ'))} ${TS.fmtDate(ctx.data.stuffDate)} — <a href="#inbox">${t(L('report in inbox', 'التقرير في البريد'))}</a></p>`,
      },
      {
        id: 'dr', when: (s) => OPS.sc(s).mode === 'LCL',
        title: L('Dock receipt: re-measurement and W/M', 'إيصال الاستلام: إعادة القياس وW/M'),
        render(ctx, b) {
          const s = ctx.ship, m = OPS.measured(s), q = s.quotation, of = q.lines.find((l) => l.code === 'OF');
          const wmOld = Math.max(1, s.jobFile.wm), wmNew = Math.max(1, m.wm);
          ui().form(ctx, b, {
            key: 'dr', intro: L(`The CFS measured the cargo again (see the dock receipt in your inbox). Your quotation used ${TS.num(wmOld)} W/M at USD ${TS.num(of.sell)} sell / USD ${TS.num(of.buy)} buy per W/M.`, `أعادت المحطة قياس البضاعة (انظر إيصال الاستلام في بريدك). عرضك استعمل ${TS.num(wmOld)} W/M بسعر بيع ${TS.num(of.sell)} وكلفة ${TS.num(of.buy)} دولار لكل W/M.`),
            fields: [
              { k: 'cbm', label: L('Measured volume', 'الحجم المقاس'), unit: 'CBM', type: 'number', tol: 0.01, ans: () => m.cbm },
              { k: 'wm', label: L('New chargeable W/M', 'الوحدات المحتسبة الجديدة'), type: 'number', tol: 0.01, ans: () => wmNew, fb: L('Higher of measured CBM and tonnes.', 'الأعلى بين الحجم المقاس والأطنان.') },
              { k: 'buy', label: L('Extra freight the consolidator will bill you', 'الشحن الإضافي الذي سيفوترك به المجمِّع'), unit: 'USD', type: 'number', tol: 0.5, ans: () => R2((wmNew - wmOld) * of.buy) },
              { k: 'sell', label: L('Extra freight to rebill the client (your sell rate)', 'الشحن الإضافي لإعادة فوترته للزبون (سعر بيعك)'), unit: 'USD', type: 'number', tol: 0.5, ans: () => R2((wmNew - wmOld) * Number(of.sell)) },
            ],
            onSuccess: (v) => { s.lclAdj = { wmOld, wmNew, buy: v.buy, sell: v.sell, rateBuy: of.buy, rateSell: Number(of.sell) }; ctx.send({ to: ctx.sc.client.email, subject: L('CFS measurement — ' + s.id, 'قياس المحطة — ' + s.id), body: L(`Dear ${ctx.sc.client.contact},\n\nThe CFS measured your cargo at ${TS.num(m.cbm)} CBM (declared ${TS.num(s.jobFile.cbm)}). As per our quotation terms, freight is charged on ${TS.num(wmNew)} W/M: a difference of USD ${TS.num(v.sell)} will be added to our invoice.\n\nBest regards,\n${OPS.company.name}`, `السيد/ة ${ctx.sc.client.contact}،\n\nقاست المحطة بضاعتكم ${TS.num(m.cbm)} م³ (المصرّح ${TS.num(s.jobFile.cbm)}). حسب شروط عرضنا يُحتسب الشحن على ${TS.num(wmNew)} W/M: يُضاف فرق ${TS.num(v.sell)} دولار إلى فاتورتنا.\n\nمع التحية،\n${OPS.company.name}`) }); ctx.finish('dr'); },
          });
        },
        summary: (ctx) => { const a = ctx.ship.lclAdj; return `<p>✓ W/M ${TS.num(a.wmOld)} → <b>${TS.num(a.wmNew)}</b> · ${t(L('rebill', 'إعادة فوترة'))} USD ${TS.num(a.sell)} (${t(L('cost', 'كلفة'))} ${TS.num(a.buy)})</p>`; },
      },
      {
        id: 'cntr',
        title: (s) => (OPS.sc(s).mode === 'LCL' ? L('Which consolidation container number is valid?', 'أي رقم لحاوية التجميع صحيح؟') : L('Which container number is correct?', 'أي رقم حاوية صحيح؟')),
        render(ctx, b) {
          const cand = ctx.data.cand, s = ctx.ship;
          ui().choice(ctx, b, {
            key: 'cntr', q: L('Use the ISO 6346 check digit (Calculators page) to find the valid number.', 'استعمل رقم التحقّق ISO 6346 (صفحة الحاسبات) لإيجاد الرقم الصحيح.'),
            options: cand.list.map((c) => ({ l: c.slice(0, 4) + ' ' + c.slice(4, 10) + ' ' + c.slice(10), ok: c === cand.good, fb: c === cand.good ? L('Check digit matches.', 'رقم التحقّق مطابق.') : L('Check digit does not match — typo.', 'رقم التحقّق غير مطابق — خطأ طباعي.') })),
            onSuccess: () => { s.equipment = Object.assign(s.equipment || {}, { containerNo: cand.good, type: lcl(s) ? '40HC (consolidated)' : s.booking.equipment }); if (lcl(s)) Object.assign(s.equipment, { seal: sealOf(s), consol: true, stuffedOn: TS.addDays(s.booking.cutoffs.cy, 0), vgm: null, vgmSignedBy: s.booking.carrierName }); ctx.finish('cntr'); },
          });
        },
        summary: (ctx) => `<p>✓ ${t(L('Container', 'الحاوية'))}: <b class="mono">${esc(ctx.ship.equipment.containerNo)}</b></p>`,
      },
      {
        id: 'inspect', when: (s) => OPS.sc(s).mode !== 'LCL',
        title: L('Container inspection', 'فحص الحاوية'),
        render(ctx, b) {
          const s = ctx.ship;
          const good = [{ l: L('Light visible through a small hole in the roof', 'ضوء يظهر من ثقب صغير في السقف') }, { l: L('Strong chemical smell inside', 'رائحة كيميائية قوية في الداخل') }, { l: L('Wet floor with water puddles', 'أرضية مبلّلة مع برك ماء') }, { l: L('Right-hand door locking bar broken — cannot be sealed', 'ذراع قفل الباب الأيمن مكسور — لا يمكن ختمه') }, { l: L('Nails and wood splinters sticking out of the floor', 'مسامير وشظايا خشب بارزة من الأرضية') }];
          const bad = [{ l: L('Small dent on the outside wall, no hole', 'انبعاج صغير في الجدار الخارجي بدون ثقب'), fb: L('Cosmetic — acceptable. Note it on the EIR.', 'شكلي — مقبول. سجّله على EIR.') }, { l: L('Valid CSC plate, doors lock properly', 'لوحة CSC صالحة، الأبواب تُقفل جيدًا'), fb: L('That is what you want.', 'هذا ما تريده.') }, { l: L('Faded paint and old shipping-line logo', 'طلاء باهت وشعار قديم للخط'), fb: L('Cosmetic.', 'شكلي.') }, { l: L('Some surface rust on the outside corner posts', 'صدأ سطحي على الزوايا الخارجية'), fb: L('Normal wear, structurally fine.', 'استهلاك عادي، سليمة إنشائيًا.') }];
          ui().choice(ctx, b, { key: 'insp', multi: true, q: L('The photos arrived. Which findings mean you must REJECT the container and ask for another one?', 'وصلت الصور. أي ملاحظات تعني أنه يجب رفض الحاوية وطلب أخرى؟'), options: mix(s, 51, good, bad, ctx.sc.cargo.food ? 3 : 2, 2), onSuccess: () => ctx.finish('inspect') });
        },
      },
      {
        id: 'vgm', when: (s) => OPS.sc(s).mode !== 'LCL',
        title: L('Verified gross mass (VGM) & seal', 'الوزن الإجمالي المُتحقَّق (VGM) والختم'),
        render(ctx, b) {
          const s = ctx.ship, bk = s.booking, tare = tareOf(s), dun = dunOf(s), seal = sealOf(s), pay = (TS.REF.equipment.find((e) => e.code === bk.equipment) || { payload: 26000 }).payload;
          ui().form(ctx, b, {
            key: 'vgm', intro: L('Use the numbers from the agent’s/trucker’s email (Method 2).', 'استعمل الأرقام من بريد الوكيل/الناقل (الطريقة 2).'),
            fields: [
              { k: 'method', label: L('VGM method', 'طريقة VGM'), type: 'select', options: [{ v: 'M1', l: L('Method 1 — weigh the packed container', 'الطريقة 1 — وزن الحاوية المعبّأة') }, { v: 'M2', l: L('Method 2 — sum of cargo + dunnage + tare', 'الطريقة 2 — مجموع البضاعة + الدعامات + الفارغ') }], ans: () => 'M2' },
              { k: 'cargo', label: L('Cargo gross weight', 'الوزن الإجمالي للبضاعة'), unit: 'kg', type: 'number', tol: 2, ans: () => s.jobFile.grossKg },
              { k: 'dun', label: L('Dunnage & lashing', 'الدعامات والربط'), unit: 'kg', type: 'number', ans: () => dun },
              { k: 'tare', label: L('Container tare (CSC plate)', 'وزن الحاوية فارغة (لوحة CSC)'), unit: 'kg', type: 'number', ans: () => tare },
              { k: 'vgm', label: 'VGM', unit: 'kg', type: 'number', tol: 2, ans: () => s.jobFile.grossKg + dun + tare, fb: L('VGM = cargo + dunnage + tare.', 'VGM = البضاعة + الدعامات + الفارغ.') },
              { k: 'seal', label: L('Seal number', 'رقم الختم'), ans: () => seal },
              { k: 'pay', label: L('Is the cargo within the container’s max payload?', 'هل البضاعة ضمن الحمولة القصوى للحاوية؟'), type: 'select', options: yesNo, ans: () => (s.jobFile.grossKg + dun <= pay ? 'yes' : 'no') },
            ],
            onSuccess: (v) => {
              Object.assign(s.equipment, { tare: v.tare, seal: v.seal, vgm: v.vgm, vgmMethod: v.method, dunnageKg: v.dun, stuffedOn: ctx.w.data.stuffDate, vgmSignedBy: ctx.sc.shipper.name });
              ctx.advance(ctx.w.data.stuffDate);
              ctx.milestone('STUF', ctx.w.data.stuffDate, 'Stuffed & sealed ' + s.equipment.containerNo + ' / ' + v.seal);
              ctx.finish('vgm');
            },
          });
        },
        summary: (ctx) => { const e = ctx.ship.equipment; return `<p>✓ ${esc(e.containerNo)} — seal ${esc(e.seal)} — VGM <b>${TS.num(e.vgm, 0)} kg</b> (${esc(e.vgmMethod)}) <button class="btn sm ghost" data-doc-open="vgm">📄 VGM</button></p>`; },
      },
      {
        id: 'marks', when: (s) => OPS.sc(s).mode === 'LCL',
        title: L('Marks, labels and the consolidated box', 'العلامات والملصقات وحاوية التجميع'),
        render(ctx, b) {
          const s = ctx.ship;
          const good = [{ l: L('Each package shows shipping marks: consignee/reference and number “1/N … N/N”', 'كل طرد يحمل علامات الشحن: المرسل إليه/المرجع والرقم «1/N … N/N»') }, { l: L('The consolidator seals the box and submits its VGM', 'المجمِّع يختم الحاوية ويقدّم VGM الخاص بها') }, { l: L('Your HBL will show “CFS/CFS” and the consolidator’s container and seal', 'بوليصتك ستُظهر «CFS/CFS» وحاوية وختم المجمِّع') }, { l: L('Fragile or non-stackable cargo must be declared to the CFS before receiving', 'البضاعة الهشة أو غير القابلة للتكديس يجب التصريح عنها للمحطة قبل الاستلام') }];
          const bad = [{ l: L('No labels needed — the consolidator knows our cargo', 'لا حاجة للملصقات — المجمِّع يعرف بضاعتنا'), fb: L('Unmarked LCL cargo gets lost or delivered to the wrong consignee.', 'بضاعة LCL بدون علامات تضيع أو تُسلَّم لمرسل إليه خاطئ.') }, { l: L('We must send our own VGM for the whole container', 'يجب أن نرسل VGM للحاوية كاملة'), fb: L('The packer of the container (the consolidator) declares the VGM.', 'من يعبّئ الحاوية (المجمِّع) يصرّح عن VGM.') }, { l: L('We choose the container seal number', 'نحن نختار رقم ختم الحاوية'), fb: L('The consolidator seals its own box.', 'المجمِّع يختم حاويته.') }];
          ui().choice(ctx, b, { key: 'marks', multi: true, q: L('Which statements are TRUE for your LCL shipment?', 'أي العبارات صحيحة لشحنتك LCL؟'), options: mix(s, 53, good, bad, 3, 2), onSuccess: () => { ctx.advance(ctx.w.data.stuffDate); ctx.milestone('CFS', ctx.w.data.stuffDate, 'Cargo received at CFS ' + s.booking.depot); ctx.finish('marks'); } });
        },
      },
    ],
    quiz: OPS.QUIZ.stuffing, drills: OPS.QUIZ_DRILLS.stuffing,
  });

  /* ============================================================ 6. EXPORT CUSTOMS & GATE-IN */
  OPS.certsFor = (sc) => {
    const out = [L('Certificate of origin (Chamber of Commerce)', 'شهادة المنشأ (غرفة التجارة)')];
    if (sc.zone === 'EU') out.push(L('EUR.1 movement certificate (EU–Lebanon Association Agreement)', 'شهادة الحركة EUR.1 (اتفاقية الشراكة)'));
    if (sc.zone === 'ARAB') out.push(L('Arab certificate of origin (GAFTA)', 'شهادة المنشأ العربية (منطقة التجارة الحرة العربية)'));
    if (sc.cargo.food) out.push(L('Health certificate (Ministry of Agriculture / Public Health) for the food product', 'الشهادة الصحية (وزارة الزراعة / الصحة) للمنتج الغذائي'));
    return out;
  };
  OPS.steps.push({
    id: 'gatein',
    title: (s) => (s && OPS.sc(s).mode === 'LCL' ? L('Export customs & consolidation', 'التخليص الصادر والتجميع') : L('Export customs, VGM submission & gate-in', 'التخليص الصادر، تقديم VGM والدخول إلى المحطة')),
    sub: L('Clear the goods for export, send the VGM and get the cargo into the terminal before cutoff.', 'خلّص البضاعة للتصدير، أرسل VGM وأدخل البضاعة إلى المحطة قبل الموعد النهائي.'),
    lesson: (s) => lesson('gatein')(s) + LB('In Lebanon the export declaration is lodged in NAJM by a licensed customs broker with: commercial invoice, packing list, the exporter’s registration, and certificates as required (COO/EUR.1 or Arab COO from the Chamber, health certificate for food). Your Customs department will do this for you — this simulator hands the data over in the shipment JSON.', 'في لبنان يقدّم مخلّص جمركي مرخّص بيان التصدير على نظام نجم مع: الفاتورة التجارية، قائمة التعبئة، تسجيل المصدّر، والشهادات المطلوبة (منشأ/EUR.1 أو منشأ عربية من الغرفة، شهادة صحية للأغذية). قسم الجمارك سيقوم بذلك — وهذا المحاكي يسلّمه البيانات في ملف JSON للشحنة.'),
    parts: [
      {
        id: 'customs',
        title: L('Export customs clearance', 'التخليص الجمركي للتصدير'),
        render(ctx, b) {
          const s = ctx.ship, sc = ctx.sc, inc = sc.answer.incoterm;
          if (ctx.data.waiting) { b.innerHTML = `<p class="muted">⏳ ${t(L('Waiting for export clearance confirmation…', 'بانتظار تأكيد التخليص الصادر…'))}</p>`; return; }
          if (imp(s)) {
            const exw = inc === 'EXW';
            const opts = OPS.shuffle(OPS.srng(s, 61), [
              exw ? { l: L(`Our ${sc.far.city} agent, on behalf of the buyer (EXW) — we quoted the origin clearance`, `وكيلنا في ${sc.far.city} نيابة عن المشتري (EXW) — سعّرنا التخليص في المنشأ`), ok: true, fb: L('EXW: the buyer does everything from the seller’s door, including export clearance.', 'EXW: المشتري يقوم بكل شيء من باب البائع بما فيه التخليص الصادر.') } : { l: L(`The seller (${sc.shipper.name}) through its customs broker; your agent follows up`, `البائع (${sc.shipper.name}) عبر مخلّصه؛ ووكيلك يتابع`), ok: true },
              exw ? { l: L(`The seller (${sc.shipper.name})`, `البائع (${sc.shipper.name})`), ok: false, fb: L('Not under EXW.', 'ليس في EXW.') } : { l: L(`Our ${sc.far.city} agent, at our cost`, `وكيلنا في ${sc.far.city} على حسابنا`), ok: false, fb: L(`Under ${inc} the seller clears export.`, `في ${inc} البائع يخلّص التصدير.`) },
              { l: L('Your company in Beirut', 'شركتك في بيروت'), ok: false },
              { l: L('The shipping line', 'الخط الملاحي'), ok: false },
            ]);
            ui().choice(ctx, b, {
              key: 'expc', q: L(`${inc} ${sc.far.city}: who clears the goods for export in ${sc.far.country}?`, `${inc} ${sc.far.city}: من يخلّص البضاعة للتصدير في ${sc.far.country}؟`), options: opts,
              onSuccess: () => {
                ctx.data.waiting = true;
                const no = '22' + String(OPS.seed(s) % 1000000).padStart(6, '0');
                ctx.receive({ from: sc.agent.email, subject: L('Export customs released — ' + s.booking.no, 'تم التخليص الصادر — ' + s.booking.no), body: L(`Hello,\n\n${exw ? 'We cleared' : 'The supplier’s broker has cleared'} export customs. Declaration no. ${no}. Released.\n${lcl(s) ? 'The cargo is at the CFS and will be consolidated before the cutoff.' : 'We will gate in as per your instructions.'}\n\n${sc.agent.contact}`, `مرحبًا،\n\n${exw ? 'قمنا بالتخليص' : 'قام مخلّص المورّد بالتخليص'} الصادر. رقم البيان ${no}. تم الإفراج.\n${lcl(s) ? 'البضاعة في المحطة وستُجمع قبل الموعد.' : 'سندخل الحاوية حسب تعليماتكم.'}\n\n${sc.agent.contact}`), onArrive: (sh) => { sh.exportCustoms = { by: exw ? 'Our origin agent (EXW)' : 'Seller’s broker (' + sc.far.country + ')', declarationNo: no, status: 'released', date: sh.sim.today }; const w = sh.work.gatein; w.data.waiting = false; w.parts.customs = true; } }, 1200);
                ctx.save(); ctx.rerender();
              },
            });
          } else {
            const certs = OPS.certsFor(sc);
            const good = [{ l: L('Commercial invoice', 'الفاتورة التجارية') }, { l: L('Packing list', 'قائمة التعبئة') }, { l: L('Booking confirmation (SO)', 'تأكيد الحجز (SO)') }, { l: L('Exporter’s commercial registration', 'السجل التجاري للمصدّر') }].concat(certs.map((c) => ({ l: c })));
            const bad = [{ l: L('Delivery order', 'إذن التسليم'), fb: L('A D/O is an import (destination) document.', 'إذن التسليم مستند استيراد (في الوجهة).') }, { l: L('Arrival notice', 'إشعار الوصول'), fb: L('Also a destination document.', 'مستند في الوجهة أيضًا.') }];
            if (sc.zone !== 'EU') bad.push({ l: L('EUR.1 movement certificate', 'شهادة الحركة EUR.1'), fb: L(`EUR.1 is for the EU (and EFTA) — ${sc.far.country} does not use it.`, `EUR.1 للاتحاد الأوروبي — ${sc.far.country} لا تستعملها.`) });
            if (!sc.cargo.food) bad.push({ l: L('Health certificate', 'الشهادة الصحية'), fb: L('Not a food product.', 'ليس منتجًا غذائيًا.') });
            ui().choice(ctx, b, {
              key: 'expdocs', multi: true, q: L('Select the documents you send to your Customs department for the Lebanese export declaration.', 'اختر المستندات التي ترسلها إلى قسم الجمارك لبيان التصدير اللبناني.'),
              options: OPS.shuffle(OPS.srng(s, 62), good.map((o) => Object.assign({ ok: true }, o)).concat(pickK(s, 63, bad, 3).map((o) => Object.assign({ ok: false }, o)))),
              submit: L('Hand over to Customs department', 'سلّم إلى قسم الجمارك'),
              onSuccess: () => {
                const pack = OPS.customsPack(s, 'export');
                s.handoffs.customs_export = { department: 'customs', type: 'export_declaration', status: 'submitted', sentSim: s.sim.today, sentAt: new Date().toISOString(), pack };
                ctx.send({ to: OPS.parties.broker.email, subject: L('Export declaration request — ' + s.id, 'طلب بيان تصدير — ' + s.id), body: L('Please lodge the export declaration in NAJM for booking ' + s.booking.no + '. All data is in the shipment file (JSON hand-off: customs_export).', 'يرجى تقديم بيان التصدير على نظام نجم للحجز ' + s.booking.no + '. كل البيانات في ملف الشحنة (التسليم: customs_export).'), attachments: [{ name: s.id + '.json' }, { name: 'Invoice.pdf', doc: 'ci' }, { name: 'PackingList.pdf', doc: 'pl' }] });
                ctx.data.waiting = true;
                const no = 'EX/' + s.sim.today.slice(0, 4) + '/' + (OPS.seed(s) % 90000 + 10000);
                ctx.receive({ from: OPS.parties.broker.email, subject: L('Export declaration released — ' + s.id, 'تم الإفراج عن بيان التصدير — ' + s.id), body: L(`Export declaration ${no} lodged in NAJM — green lane — released.\n${certs.map((c) => c.en).join(', ')} issued.\n(Simulated — this becomes real work in the Customs department module.)`, `بيان التصدير ${no} قُدّم على نظام نجم — المسار الأخضر — تم الإفراج.\nصدرت: ${certs.map((c) => c.ar).join('، ')}.\n(محاكاة — ستصبح عملًا حقيقيًا في وحدة قسم الجمارك.)`), attachments: [{ name: 'Certificate_of_origin.pdf', doc: 'coo' }].concat(sc.zone === 'EU' ? [{ name: 'EUR1.pdf', doc: 'eur1' }] : []).concat(sc.cargo.food ? [{ name: 'Health_certificate.pdf', doc: 'health' }] : []), onArrive: (sh) => { sh.exportCustoms = { by: 'PFT Customs Department', declarationNo: no, lane: 'green', status: 'released', date: sh.sim.today, simulated: true }; sh.handoffs.customs_export.status = 'released (simulated)'; const w = sh.work.gatein; w.data.waiting = false; w.parts.customs = true; } }, 1800);
                ctx.save(); ctx.rerender();
              },
            });
          }
        },
        summary: (ctx) => { const e = ctx.ship.exportCustoms; return e ? `<p>✓ ${t(L('Export customs released', 'تم التخليص الصادر'))} — ${esc(e.declarationNo)} (${esc(e.by)})</p>` : ''; },
      },
      {
        id: 'plan', when: (s) => OPS.sc(s).mode !== 'LCL',
        title: L('Submit VGM and plan the gate-in', 'قدّم VGM وخطّط الدخول إلى المحطة'),
        render(ctx, b) {
          const s = ctx.ship, bk = s.booking, st = s.equipment.stuffedOn;
          ui().form(ctx, b, {
            key: 'plan',
            intro: L(`ERD ${TS.fmtDate(bk.cutoffs.erd)} · VGM cutoff ${TS.fmtDate(bk.cutoffs.vgm)} · CY cutoff ${TS.fmtDate(bk.cutoffs.cy)} · stuffed ${TS.fmtDate(st)}`, `ERD ${TS.fmtDate(bk.cutoffs.erd)} · موعد VGM ${TS.fmtDate(bk.cutoffs.vgm)} · موعد CY ${TS.fmtDate(bk.cutoffs.cy)} · التعبئة ${TS.fmtDate(st)}`),
            fields: [
              { k: 'vgmdate', label: L('VGM submission date', 'تاريخ تقديم VGM'), type: 'date', ans: () => (st > bk.cutoffs.erd ? st : bk.cutoffs.erd), check: (v) => (v < st ? L('You cannot submit the VGM before the box is stuffed.', 'لا يمكنك تقديم VGM قبل تعبئة الحاوية.') : v > TS.addDays(bk.cutoffs.vgm, -1) ? L('Too close to / after the VGM cutoff — submit at least one day early.', 'قريب جدًا من موعد VGM أو بعده — قدّمه قبل يوم على الأقل.') : true) },
              { k: 'gate', label: L('Gate-in date', 'تاريخ الدخول إلى المحطة'), type: 'date', ans: () => TS.addDays(bk.cutoffs.cy, -1), check: (v) => (v < bk.cutoffs.erd ? L('Before ERD — the terminal will refuse it.', 'قبل ERD — سترفضها المحطة.') : v < st ? L('Before stuffing.', 'قبل التعبئة.') : v > TS.addDays(bk.cutoffs.cy, -1) ? L('No buffer: plan at least one day before the CY cutoff.', 'بدون هامش أمان: خطّط قبل يوم على الأقل من موعد CY.') : true) },
            ],
            onSuccess: (v) => {
              s.equipment.vgmSubmitted = v.vgmdate; s.equipment.gateIn = v.gate;
              ctx.send({ to: line(bk.carrier).email, subject: 'VGM ' + s.equipment.containerNo + ' — ' + bk.no, body: L(`VGM declaration: ${s.equipment.containerNo}, ${TS.num(s.equipment.vgm, 0)} kg, ${s.equipment.vgmMethod}, signed by ${s.equipment.vgmSignedBy}.`, `تصريح VGM: ${s.equipment.containerNo}، ${TS.num(s.equipment.vgm, 0)} كغ، ${s.equipment.vgmMethod}، موقّع من ${s.equipment.vgmSignedBy}.`), attachments: [{ name: 'VGM_' + s.equipment.containerNo + '.pdf', doc: 'vgm' }] });
              s.tracking = [{ date: v.gate, event: L('Gate-in full at terminal', 'دخول الحاوية المعبّأة إلى المحطة'), loc: s.jobFile.pol }];
              ctx.advance(v.gate);
              ctx.milestone('GTIN', v.gate, 'Gate-in full at ' + s.jobFile.pol);
              ctx.finish('plan');
            },
          });
        },
        summary: (ctx) => `<p>✓ VGM ${TS.fmtDate(ctx.ship.equipment.vgmSubmitted)} — gate-in ${TS.fmtDate(ctx.ship.equipment.gateIn)}</p>`,
      },
      {
        id: 'eir', when: (s) => OPS.sc(s).mode !== 'LCL',
        title: L('Check the terminal EIR', 'تحقّق من إيصال EIR في المحطة'),
        render(ctx, b) {
          const e = ctx.ship.equipment;
          ui().choice(ctx, b, {
            key: 'eir', multi: true,
            pre: `<div class="email-preview"><b>EIR — GATE IN FULL</b><br>Container: ${esc(e.containerNo)} · Size/type: ${esc(e.type)} · Seal: ${esc(e.seal)}<br>Booking: ${esc(ctx.ship.booking.no)} · Date: ${TS.fmtDate(e.gateIn)} 10:42<br>Condition: sound — minor dent L/S panel</div><br>`,
            q: L('What do you check on the gate-in EIR?', 'ماذا تتحقّق في إيصال EIR عند الدخول؟'),
            options: mix(ctx.ship, 66, [{ l: L('Container number matches the booking/VGM', 'رقم الحاوية مطابق للحجز/VGM') }, { l: L('Seal number matches what the shipper applied', 'رقم الختم مطابق لما وضعه الشاحن') }, { l: L('Damage remarks (to avoid a later damage claim)', 'ملاحظات الأضرار (لتجنّب مطالبة لاحقة)') }, { l: L('Gate-in date/time is before the CY cutoff', 'تاريخ/وقت الدخول قبل موعد CY') }], [{ l: L('The customs duty amount', 'قيمة الرسوم الجمركية') }, { l: L('The selling price to the client', 'سعر البيع للزبون') }], 4, 1),
            onSuccess: () => ctx.finish('eir'),
          });
        },
      },
      {
        id: 'consol', when: (s) => OPS.sc(s).mode === 'LCL',
        title: L('Consolidation & loading confirmation', 'التجميع وتأكيد التحميل'),
        render(ctx, b) {
          const s = ctx.ship, bk = s.booking;
          ui().form(ctx, b, {
            key: 'consol', intro: L(`${bk.carrierName} confirms your cargo is stuffed in ${s.equipment.containerNo}, seal ${s.equipment.seal}, gated in for ${bk.vessel}. Fill the loading record.`, `يؤكّد ${bk.carrierName} أن بضاعتك عُبّئت في ${s.equipment.containerNo}، الختم ${s.equipment.seal}، ودخلت المحطة للباخرة ${bk.vessel}. املأ سجل التحميل.`),
            fields: [
              { k: 'cn', label: L('Consolidation container', 'حاوية التجميع'), ans: () => s.equipment.containerNo },
              { k: 'seal', label: L('Consolidator’s seal', 'ختم المجمِّع'), ans: () => s.equipment.seal },
              { k: 'who', label: L('Who declares the container VGM?', 'من يصرّح عن VGM للحاوية؟'), type: 'select', options: [{ v: 'consol', l: L('The consolidator (packer)', 'المجمِّع (من عبّأ)') }, { v: 'us', l: L('Us', 'نحن') }, { v: 'shipper', l: L('Our shipper', 'شاحننا') }], ans: () => 'consol' },
              { k: 'gate', label: L('Container gate-in date', 'تاريخ دخول الحاوية'), type: 'date', ans: () => TS.addDays(bk.cutoffs.cy, 1), help: L('The consolidator closes the box after the CFS cutoff and gates it in one day later.', 'يُغلق المجمِّع الحاوية بعد موعد CFS ويُدخلها بعد يوم.') },
            ],
            onSuccess: (v) => {
              s.equipment.gateIn = v.gate; s.equipment.stuffedOn = bk.cutoffs.cy;
              s.tracking = [{ date: s.equipment.cfsReceived || bk.cutoffs.erd, event: L('Cargo received at CFS', 'استُلمت البضاعة في محطة التجميع'), loc: s.jobFile.pol }, { date: v.gate, event: L('Consolidated container gate-in', 'دخول حاوية التجميع إلى المحطة'), loc: s.jobFile.pol }];
              ctx.advance(v.gate); ctx.milestone('GTIN', v.gate, 'Consolidated box gated in ' + s.equipment.containerNo);
              ctx.finish('consol');
            },
          });
        },
      },
    ],
    quiz: OPS.QUIZ.gatein, drills: OPS.QUIZ_DRILLS.gatein,
  });

  /* shared: build a customs data pack from the shipment (read by the Customs department) */
  OPS.customsPack = (s, kind) => {
    const sc = OPS.sc(s);
    return {
      kind, shipmentId: s.id, direction: s.direction, mode: sc.mode, caseId: sc.id,
      declarant: OPS.parties.broker.name,
      exporter: s.parties.shipper, importer: s.parties.consignee,
      commodity: s.jobFile.commodity, hsProvided: s.jobFile.hs, items: TS.cargoItems(s),
      packages: s.jobFile.packages, packageType: s.jobFile.pkgType, grossKg: s.jobFile.grossKg, netKg: sc.items.reduce((a, x) => a + x.net, 0), cbm: s.jobFile.cbm,
      invoiceValue: sc.cargo.value, currency: sc.cargo.currency, incoterm: s.jobFile.incoterm + ' ' + s.jobFile.namedPlace, incotermCode: s.jobFile.incoterm,
      origin: sc.originCountry, originCC: sc.originCC, destination: sc.destCountry, destCC: sc.destCC, zone: sc.zone, food: !!sc.cargo.food, licence: sc.licence,
      transport: s.booking ? { carrier: s.booking.carrierName, vessel: s.booking.vessel, voyage: s.booking.voyage, bookingNo: s.booking.no, pol: s.booking.pol, pod: s.booking.pod, etd: s.booking.etd, eta: s.booking.eta } : null,
      container: s.equipment ? { no: s.equipment.containerNo, type: s.equipment.type, seal: s.equipment.seal, vgm: s.equipment.vgm, lcl: sc.mode === 'LCL' } : null,
      bl: s.documents && s.documents.bl ? { mbl: s.documents.bl.mblNo, hbl: s.documents.bl.hblNo } : null,
    };
  };
})();
