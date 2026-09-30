/* Operations & Pricing — steps 1 to 6 */
(function () {
  const L = TS.L, t = TS.t, esc = TS.esc, REF = TS.REF;
  const OPS = window.OPS;
  const ui = () => OPS.ui;
  OPS.steps = OPS.steps || [];

  const imp = (s) => s.direction === 'import';
  const D = (s, n) => TS.addDays(s.sim.start, n);
  const portOpts = () => OPS.ports.map((p) => ({ v: p.code, l: p.code + ' — ' + p.name }));
  const eqOpts = () => REF.equipment.map((e) => ({ v: e.code, l: { en: e.code + ' — ' + e.name.en, ar: e.code + ' — ' + e.name.ar } }));
  const yesNo = [{ v: 'no', l: L('No', 'لا') }, { v: 'yes', l: L('Yes', 'نعم') }];
  const cbmOf = (c) => TS.round2(((c.dims[0] * c.dims[1] * c.dims[2]) / 1e6) * c.packages);
  const LB = (en, ar) => `<div class="note lb"><strong>🇱🇧 ${t(L('Lebanon', 'لبنان'))}</strong>${t(L(en, ar))}</div>`;
  const TIP = (en, ar) => `<div class="note warn"><strong>⚠ ${t(L('Watch out', 'انتبه'))}</strong>${t(L(en, ar))}</div>`;
  OPS.h = { imp, D, LB, TIP, cbmOf, portOpts, eqOpts, yesNo };

  /* ============================================================ 1. INQUIRY */
  OPS.steps.push({
    id: 'inquiry',
    title: L('Client inquiry & job file', 'استفسار الزبون وملف العملية'),
    sub: L('Understand what the client needs, open the job file and collect every detail before pricing.', 'افهم ما يحتاجه الزبون، افتح ملف العملية واجمع كل التفاصيل قبل التسعير.'),
    init(ship) {
      const sc = OPS.sc(ship), c = sc.cargo, ready = D(ship, sc.readyOffset);
      const body = imp(ship)
        ? L(`Dear Phoenicia team,

We purchased dining furniture from our supplier ${sc.shipper.name}. Our purchase terms with the supplier are FOB Shanghai.
Please quote us your best rate from Shanghai port to Beirut, including Beirut port charges, customs clearance and delivery to our warehouse in Choueifat.

Cargo details:
• ${c.commodity}
• HS code given by the supplier: ${c.hs}
• ${c.packages} cartons, each ${c.dims.join(' × ')} cm, ${c.kgPer} kg gross per carton
• Not dangerous goods
• Cargo ready at the supplier on ${TS.fmtDate(ready)}
• Invoice value: USD ${TS.num(c.value, 0)}
• Payment to supplier: 30% advance, 70% against copy of B/L

Supplier contact: ${sc.shipper.contact}, ${sc.shipper.email}
Can you also advise which container we need?

Best regards,
${sc.client.contact}
${sc.client.name}
${sc.client.address}`,
          `فريق فينيقيا الكرام،

اشترينا أثاث سفرة من المورّد ${sc.shipper.name}. شروط الشراء مع المورّد FOB شنغهاي.
نرجو تزويدنا بأفضل سعر من مرفأ شنغهاي إلى بيروت، مع رسوم مرفأ بيروت والتخليص الجمركي والتسليم إلى مستودعنا في الشويفات.

تفاصيل البضاعة:
• ${c.commodityAr}
• رمز HS حسب المورّد: ${c.hs}
• ${c.packages} كرتونة، مقاس كل منها ${c.dims.join(' × ')} سم، الوزن الإجمالي ${c.kgPer} كغ للكرتونة
• ليست بضائع خطرة
• البضاعة جاهزة لدى المورّد بتاريخ ${TS.fmtDate(ready)}
• قيمة الفاتورة: ${TS.num(c.value, 0)} دولار
• الدفع للمورّد: 30% مسبقًا و70% مقابل نسخة البوليصة

للتواصل مع المورّد: ${sc.shipper.contact}، ${sc.shipper.email}
هل يمكنكم أيضًا إخبارنا بنوع الحاوية المطلوبة؟

مع التحية،
${sc.client.contact}
${sc.client.name}`)
        : L(`Hello Phoenicia team,

We sold ${c.packages} pallets of tahini to ${sc.consignee.name}, Hamburg, on CFR Hamburg terms.
Please quote: pick-up of the container at our factory in Zahle (we load it ourselves), export customs clearance, certificate of origin and EUR.1, and sea freight to Hamburg port.

• ${c.commodity}
• HS code: ${c.hs}
• ${c.packages} pallets, each ${c.dims.join(' × ')} cm, ${c.kgPer} kg gross per pallet (pallets can be double stacked)
• Not dangerous goods
• Ready for loading on ${TS.fmtDate(ready)}
• Invoice value: USD ${TS.num(c.value, 0)}
• Payment: Cash Against Documents through the buyer's bank — we need original B/Ls for the bank.

Thanks,
${sc.client.contact}
${sc.client.name}, ${sc.client.address}`,
          `مرحبًا فريق فينيقيا،

بعنا ${c.packages} طبلية طحينة إلى ${sc.consignee.name} في هامبورغ بشرط CFR هامبورغ.
نرجو تسعير: سحب الحاوية إلى مصنعنا في زحلة (نحن نحمّلها)، التخليص الجمركي للتصدير، شهادة المنشأ وEUR.1، والشحن البحري إلى مرفأ هامبورغ.

• ${c.commodityAr}
• رمز HS: ${c.hs}
• ${c.packages} طبلية، مقاس كل منها ${c.dims.join(' × ')} سم، الوزن الإجمالي ${c.kgPer} كغ للطبلية (يمكن وضع طبلية فوق أخرى)
• ليست بضائع خطرة
• جاهزة للتحميل بتاريخ ${TS.fmtDate(ready)}
• قيمة الفاتورة: ${TS.num(c.value, 0)} دولار
• الدفع: مقابل المستندات عبر مصرف المشتري — نحتاج بوالص أصلية للمصرف.

شكرًا،
${sc.client.contact}
${sc.client.name}`);
      OPS.emailPush(ship, 'in', {
        from: sc.client.email, to: OPS.company.email, step: 'inquiry', read: false,
        subject: imp(ship) ? L('Quotation request — furniture from Shanghai (FOB)', 'طلب تسعير — أثاث من شنغهاي (FOB)') : L('Quotation request — tahini to Hamburg (CFR)', 'طلب تسعير — طحينة إلى هامبورغ (CFR)'),
        body,
      });
    },
    lesson: (ship) => t(L(`
<h3>Your job at this step</h3>
<p>Every shipment starts with a client request (email, phone, WhatsApp). Before you can price anything you must turn that message into a complete <b>job file</b>. A quote built on missing information is a quote you will have to change later — usually at your own cost.</p>
<h3>Who is who</h3>
<ul><li><b>Shipper</b> (consignor) — the exporter sending the goods.</li><li><b>Consignee</b> — who receives the goods; named on the B/L (“to order” = title passes by endorsement).</li><li><b>Notify party</b> — told when the vessel arrives (often the consignee or its broker).</li><li><b>Carrier</b> — the shipping line (Maersk, MSC, CMA CGM, Hapag-Lloyd, COSCO…).</li><li><b>Freight forwarder</b> — you: you buy space from the line and resell it with services. If you issue your own B/L you act as an <b>NVOCC</b>.</li><li><b>Overseas agent</b> — your partner forwarder at the other end.</li><li><b>Customs broker</b> — files the customs declaration.</li><li><b>Terminal / depot</b> — the terminal handles full boxes at the port; the depot stores empties.</li></ul>
<h3>The inquiry checklist (ask until you have all of it)</h3>
<ol><li>Direction and Incoterm with the named place (FOB Shanghai, CFR Hamburg…). The Incoterm tells you <b>which legs you can sell</b>.</li><li>Origin and destination: POL/POD, and whether there is door pickup or door delivery.</li><li>Commodity, HS code (as given by the client), value, DG or not, temperature control.</li><li>Packages, dimensions, gross weight → CBM → equipment.</li><li>Cargo ready date and any deadline at destination.</li><li>Services: customs, insurance, trucking, certificates.</li><li>Payment terms between buyer and seller (they decide the type of B/L release).</li></ol>
<h3>From dimensions to container</h3>
<p>CBM of one package = L × W × H in metres. Multiply by the number of packages. Compare with usable capacity (about 85–90% of the internal volume) and with the payload. Light, bulky goods → 40′ HC. Dense goods → 20′ (the weight runs out first).</p>
<p>Example: 1.20 × 0.80 × 0.60 m = 0.576 CBM per carton.</p>
<h3>Service scope</h3>
<p><b>Port–port</b>, <b>port–door</b>, <b>door–port</b>, <b>door–door</b> describe what you cover. FOB import with delivery to the client’s warehouse = port (on board at POL) → door.</p>`,
      `
<h3>عملك في هذه المرحلة</h3>
<p>تبدأ كل شحنة بطلب من الزبون (بريد، هاتف، واتساب). قبل أي تسعير يجب أن تحوّل الرسالة إلى <b>ملف عملية</b> كامل. عرض السعر المبني على معلومات ناقصة ستضطر لتغييره لاحقًا — وغالبًا على حسابك.</p>
<h3>من هو من</h3>
<ul><li><b>الشاحن</b> — المصدّر الذي يرسل البضاعة.</li><li><b>المرسل إليه</b> — من يستلم البضاعة؛ اسمه على البوليصة («لأمر» = تنتقل الملكية بالتظهير).</li><li><b>الطرف المُخطَر</b> — يُبلَّغ بوصول الباخرة (غالبًا المرسل إليه أو مخلّصه).</li><li><b>الناقل</b> — الخط الملاحي (ميرسك، MSC، CMA CGM، هاباغ لويد، كوسكو…).</li><li><b>وكيل الشحن</b> — أنت: تشتري المساحة من الخط وتعيد بيعها مع خدمات. إذا أصدرت بوليصتك الخاصة فأنت <b>NVOCC</b>.</li><li><b>الوكيل في الخارج</b> — شريكك في الطرف الآخر.</li><li><b>المخلّص الجمركي</b> — يقدّم البيان الجمركي.</li><li><b>المحطة / المستودع</b> — المحطة تتعامل مع الحاويات المعبّأة في المرفأ؛ المستودع يخزّن الفارغة.</li></ul>
<h3>قائمة أسئلة الاستفسار (اسأل حتى تحصل عليها كلها)</h3>
<ol><li>الاتجاه وشرط التسليم مع المكان المحدّد (FOB شنغهاي، CFR هامبورغ…). شرط التسليم يحدّد <b>المراحل التي يمكنك بيعها</b>.</li><li>المنشأ والوجهة: مرفأ التحميل/التفريغ، وهل يوجد استلام أو تسليم من/إلى الباب.</li><li>نوع البضاعة، رمز HS (كما يعطيه الزبون)، القيمة، خطرة أم لا، تبريد.</li><li>عدد الطرود، المقاسات، الوزن الإجمالي ← المتر المكعّب ← نوع الحاوية.</li><li>تاريخ جهوزية البضاعة وأي موعد نهائي في الوجهة.</li><li>الخدمات: جمارك، تأمين، نقل بري، شهادات.</li><li>شروط الدفع بين البائع والمشتري (تحدّد نوع الإفراج عن البوليصة).</li></ol>
<h3>من المقاسات إلى الحاوية</h3>
<p>المتر المكعّب للطرد = الطول × العرض × الارتفاع بالمتر. اضربه بعدد الطرود. قارن بالسعة القابلة للاستعمال (نحو 85–90% من الحجم الداخلي) وبالحمولة القصوى. البضائع الخفيفة الكبيرة ← 40 قدم عالية. البضائع الثقيلة ← 20 قدم (ينفد الوزن أولًا).</p>
<p>مثال: 1.20 × 0.80 × 0.60 م = 0.576 م³ للكرتونة.</p>
<h3>نطاق الخدمة</h3>
<p><b>مرفأ–مرفأ</b>، <b>مرفأ–باب</b>، <b>باب–مرفأ</b>، <b>باب–باب</b> تصف ما تغطيه. استيراد FOB مع تسليم لمستودع الزبون = من المرفأ (على متن الباخرة) ← إلى الباب.</p>`))
      + LB('Before quoting an import, check the client can actually clear the goods in Lebanon: commercial registration, VAT number, and any licence/approval the product needs (e.g. Ministry of Public Health, Agriculture, Economy & Trade). Goods that cannot be cleared become demurrage, then abandonment.', 'قبل تسعير الاستيراد تحقّق أن الزبون قادر فعلًا على تخليص البضاعة في لبنان: سجل تجاري، رقم ضريبي، وأي ترخيص/موافقة يحتاجها المنتج (مثلًا وزارة الصحة، الزراعة، الاقتصاد والتجارة). البضاعة التي لا يمكن تخليصها تتحوّل إلى غرامات تأخير ثم إلى بضاعة متروكة.')
      + TIP('Do not classify HS codes yourself. Record what the client/supplier gives you; the broker and importer are responsible for classification.', 'لا تحدّد رمز HS بنفسك. سجّل ما يعطيك إيّاه الزبون/المورّد؛ المخلّص والمستورد مسؤولان عن التصنيف.'),
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
        summary: (ctx) => `<p class="muted">✓ ${t(L('Email read. You can re-open it any time in Email (virtual).', 'تمت قراءة البريد. يمكنك فتحه في أي وقت من البريد الافتراضي.'))}</p>`,
      },
      {
        id: 'jobfile',
        title: L('Open the job file (requirements sheet)', 'افتح ملف العملية (ورقة المتطلبات)'),
        render(ctx, b) {
          const s = ctx.ship, sc = ctx.sc, c = sc.cargo, a = sc.answer;
          ui().form(ctx, b, {
            key: 'jobfile',
            intro: L('Fill the job file from the email. Calculate weight and CBM yourself, and choose the right equipment.', 'املأ ملف العملية من البريد. احسب الوزن والمتر المكعّب بنفسك واختر المعدّات المناسبة.'),
            fields: [
              { k: 'client', label: L('Client (who pays you)', 'الزبون (من يدفع لك)'), path: 'jobFile.client', ans: () => sc.client.name, fb: L('The client is the company that wrote to you.', 'الزبون هو الشركة التي راسلتك.') },
              { k: 'role', label: L('Client’s role in the trade', 'دور الزبون في الصفقة'), type: 'select', path: 'jobFile.clientRole', options: [{ v: 'shipper', l: L('Shipper (seller/exporter)', 'الشاحن (البائع/المصدّر)') }, { v: 'consignee', l: L('Consignee (buyer/importer)', 'المرسل إليه (المشتري/المستورد)') }], ans: () => sc.clientRole },
              { k: 'shipper', label: L('Shipper', 'الشاحن'), path: 'jobFile.shipper', ans: () => sc.shipper.name },
              { k: 'consignee', label: L('Consignee', 'المرسل إليه'), path: 'jobFile.consignee', ans: () => sc.consignee.name },
              { k: 'commodity', label: L('Commodity', 'البضاعة'), path: 'jobFile.commodity', contains: c.keywords, ans: () => c.commodity, full: true },
              { k: 'hs', label: L('HS code (as provided)', 'رمز HS (كما ورد)'), path: 'jobFile.hs', ans: () => c.hs },
              { k: 'dg', label: L('Dangerous goods?', 'بضائع خطرة؟'), type: 'select', options: yesNo, path: 'jobFile.dg', ans: () => 'no' },
              { k: 'incoterm', label: 'Incoterm', type: 'select', options: REF.incoterms.map((i) => ({ v: i.c, l: i.c })), path: 'jobFile.incoterm', ans: () => a.incoterm },
              { k: 'place', label: L('Incoterm named place', 'المكان المحدّد لشرط التسليم'), path: 'jobFile.namedPlace', ans: () => a.namedPlace },
              { k: 'pol', label: L('Port of loading (POL)', 'مرفأ التحميل'), type: 'select', options: portOpts(), path: 'jobFile.pol', ans: () => a.pol },
              { k: 'pod', label: L('Port of discharge (POD)', 'مرفأ التفريغ'), type: 'select', options: portOpts(), path: 'jobFile.pod', ans: () => a.pod },
              { k: 'scope', label: L('Service scope', 'نطاق الخدمة'), type: 'select', path: 'jobFile.scope', options: [{ v: 'port-port', l: L('Port → port', 'مرفأ ← مرفأ') }, { v: 'port-door', l: L('Port → door', 'مرفأ ← باب') }, { v: 'door-port', l: L('Door → port', 'باب ← مرفأ') }, { v: 'door-door', l: L('Door → door', 'باب ← باب') }], ans: () => a.scope, fb: imp(s) ? L('FOB: the seller delivers on board at Shanghai; you deliver to the client’s door.', 'FOB: البائع يسلّم على متن الباخرة في شنغهاي؛ أنت تسلّم إلى باب الزبون.') : L('You pick up at the factory (door) and CFR ends at the port of Hamburg.', 'تسحب من المصنع (باب) وينتهي CFR في مرفأ هامبورغ.') },
              { k: 'pk', label: L('Number of packages', 'عدد الطرود'), type: 'number', path: 'jobFile.packages', ans: () => c.packages },
              { k: 'kg', label: L('Total gross weight', 'الوزن الإجمالي الكلي'), unit: 'kg', type: 'number', path: 'jobFile.grossKg', ans: () => a.grossKg, fb: L('Packages × gross kg per package.', 'عدد الطرود × الوزن الإجمالي للطرد.') },
              { k: 'cbm', label: L('Total volume', 'الحجم الكلي'), unit: 'CBM', type: 'number', tol: 0.3, path: 'jobFile.cbm', ans: () => cbmOf(c), fb: L('(L × W × H in metres) × number of packages.', '(الطول × العرض × الارتفاع بالمتر) × عدد الطرود.') },
              { k: 'eq', label: L('Equipment', 'المعدّات'), type: 'select', options: eqOpts(), path: 'jobFile.equipment', ans: () => a.equipment, fb: imp(s) ? L('69 CBM does not fit a 40′ DV (≈67 CBM, and only ~58 usable). A 40′ HC (≈76 CBM) does.', '69 م³ لا تتّسع في 40 قدم عادية (≈67 م³، ونحو 58 قابلة للاستعمال). الحاوية 40 عالية (≈76 م³) تتّسع.') : L('26 CBM / 17 t is dense cargo: a 20′ DV (33 CBM, ~28 t) is right; a 40′ would waste money.', '26 م³ / 17 طن بضاعة ثقيلة: الحاوية 20 قدم (33 م³، ~28 طن) مناسبة؛ الـ40 هدر للمال.') },
              { k: 'ready', label: L('Cargo ready date', 'تاريخ جهوزية البضاعة'), type: 'date', path: 'jobFile.readyDate', ans: () => D(s, sc.readyOffset) },
            ],
            onSuccess: () => { ctx.ship.jobFile.value = c.value; ctx.ship.jobFile.currency = c.currency; ctx.ship.jobFile.pkgType = c.pkgType; ctx.finish('jobfile'); },
          });
        },
        summary: (ctx) => { const j = ctx.ship.jobFile; return `<dl class="kv"><dt>${t(L('Route', 'المسار'))}</dt><dd>${esc(j.pol)} → ${esc(j.pod)} (${esc(j.scope)})</dd><dt>Incoterm</dt><dd>${esc(j.incoterm)} ${esc(j.namedPlace)}</dd><dt>${t(L('Cargo', 'البضاعة'))}</dt><dd>${esc(j.packages)} ${esc(j.pkgType)}, ${TS.num(j.grossKg, 0)} kg, ${TS.num(j.cbm)} CBM — HS ${esc(j.hs)}</dd><dt>${t(L('Equipment', 'المعدّات'))}</dt><dd>1 × ${esc(j.equipment)}</dd><dt>${t(L('Ready', 'الجهوزية'))}</dt><dd>${TS.fmtDate(j.readyDate)}</dd></dl>`; },
      },
      {
        id: 'checks',
        title: L('What else must you check before pricing?', 'ماذا يجب أن تتحقّق منه أيضًا قبل التسعير؟'),
        render(ctx, b) {
          const s = ctx.ship;
          ui().choice(ctx, b, {
            key: 'checks', multi: true,
            q: L('Select every check a good forwarder does now (and only those).', 'اختر كل ما يتحقّق منه وكيل الشحن الجيد الآن (وفقط ذلك).'),
            options: imp(s) ? [
              { l: L('Confirm the importer has commercial registration / VAT number and that furniture needs no special import approval in Lebanon.', 'التأكّد أن للمستورد سجلًا تجاريًا ورقمًا ضريبيًا وأن الأثاث لا يحتاج موافقة استيراد خاصة في لبنان.'), ok: true },
              { l: L('Ask if the client wants cargo insurance (under FOB the buyer carries the sea risk).', 'سؤال الزبون إن كان يريد تأمينًا على البضاعة (في FOB يتحمّل المشتري مخاطر البحر).'), ok: true },
              { l: L('Confirm the delivery address and unloading conditions (access for a 40′ truck, forklift, working hours).', 'تأكيد عنوان التسليم وظروف التفريغ (دخول شاحنة 40 قدم، رافعة شوكية، ساعات العمل).'), ok: true },
              { l: L('Correct the HS code yourself because 9403.60 “looks wrong”.', 'تصحيح رمز HS بنفسك لأن 9403.60 «يبدو خطأ».'), ok: false, fb: L('Never classify yourself — the broker/importer does.', 'لا تصنّف بنفسك أبدًا — المخلّص/المستورد يفعل.') },
              { l: L('Ask the supplier what price they sold the furniture for, so you can set your margin.', 'سؤال المورّد عن سعر بيع الأثاث لتحديد هامشك.'), ok: false, fb: L('Irrelevant to freight and unprofessional. Your price is based on your costs and the market.', 'لا علاقة له بالشحن وغير مهني. سعرك مبني على كلفتك والسوق.') },
              { l: L('Get the supplier’s contact so your Shanghai agent can coordinate the pickup/booking (FOB = buyer’s nominated forwarder).', 'الحصول على بيانات المورّد ليتواصل وكيلك في شنغهاي للتنسيق (FOB = وكيل الشحن المعيّن من المشتري).'), ok: true },
            ] : [
              { l: L('Check the documents the buyer’s bank requires for CAD (original B/L set, invoice, COO, EUR.1, health certificate).', 'التحقّق من المستندات التي يطلبها مصرف المشتري للدفع مقابل المستندات (بوالص أصلية، فاتورة، منشأ، EUR.1، شهادة صحية).'), ok: true },
              { l: L('Confirm the loading address in Zahle, loading time and that the truck can access the site.', 'تأكيد عنوان التحميل في زحلة ووقت التحميل وإمكانية دخول الشاحنة.'), ok: true },
              { l: L('Confirm EU import requirements for sesame products with the buyer (EU controls on sesame).', 'تأكيد متطلبات الاتحاد الأوروبي لمنتجات السمسم مع المشتري (رقابة أوروبية على السمسم).'), ok: true },
              { l: L('Quote insurance by default and add it to the invoice.', 'تسعير التأمين تلقائيًا وإضافته إلى الفاتورة.'), ok: false, fb: L('Under CFR the buyer carries sea risk and buys insurance. Offer it, don’t impose it.', 'في CFR يتحمّل المشتري مخاطر البحر ويشتري التأمين. اعرضه ولا تفرضه.') },
              { l: L('Change the HS code to one with lower EU duty.', 'تغيير رمز HS إلى رمز رسومه الأوروبية أقل.'), ok: false, fb: L('That is misdeclaration. Never.', 'هذا تصريح كاذب. أبدًا.') },
              { l: L('Check pallets are heat-treated (ISPM 15) if they are wooden.', 'التأكّد أن الطبليات الخشبية معالجة حراريًا (ISPM 15).'), ok: true },
            ],
            onSuccess: () => ctx.finish('checks'),
          });
        },
      },
      {
        id: 'ack',
        title: L('Acknowledge the client', 'الردّ على الزبون'),
        render(ctx, b) {
          const s = ctx.ship;
          const opts = [
            { l: L('“Thank you, received. We are checking rates with the lines for 1×' + s.jobFile.equipment + ' and will send our quotation today. Do you also need cargo insurance?”', '«شكرًا، تم الاستلام. نتحقّق من الأسعار مع الخطوط لحاوية 1×' + s.jobFile.equipment + ' وسنرسل العرض اليوم. هل تحتاجون أيضًا تأمينًا على البضاعة؟»'), ok: true, fb: L('Clear, fast, sets expectations and asks the open question.', 'واضح وسريع ويحدّد التوقعات ويطرح السؤال المفتوح.') },
            { l: L('“OK. Price is around USD 2,000, transit 20 days guaranteed.”', '«حسنًا. السعر حوالي 2000 دولار، ومدة النقل 20 يومًا مضمونة.»'), ok: false, fb: L('Never give a price before checking rates, and never guarantee transit times.', 'لا تعطِ سعرًا قبل التحقّق، ولا تضمن مدة النقل أبدًا.') },
            { l: L('No reply until the quotation is ready.', 'عدم الرد حتى يصبح العرض جاهزًا.'), ok: false, fb: L('Silence loses clients. Always acknowledge quickly.', 'الصمت يخسّرك الزبائن. ردّ دائمًا بسرعة.') },
          ];
          ui().choice(ctx, b, {
            key: 'ack', q: L('Choose the best reply to send now.', 'اختر أفضل ردّ لإرساله الآن.'), options: opts,
            onSuccess: () => {
              ctx.send({ to: ctx.sc.client.email, subject: L('RE: Quotation request — ' + s.id, 'رد: طلب تسعير — ' + s.id), body: opts[0].l });
              ctx.milestone('INQ', s.sim.today, 'Inquiry received & acknowledged');
              ctx.finish('ack');
            },
          });
        },
      },
    ],
    quiz: [
      { q: L('Under FOB Shanghai, who normally appoints the forwarder for the ocean freight?', 'في FOB شنغهاي، من يعيّن عادة وكيل الشحن للشحن البحري؟'), o: [L('The seller', 'البائع'), L('The buyer', 'المشتري'), L('The shipping line', 'الخط الملاحي')], a: 1, e: L('FOB: the seller delivers on board; the buyer pays and arranges the main carriage.', 'FOB: البائع يسلّم على متن الباخرة؛ المشتري يدفع وينظّم النقل الرئيسي.') },
      { q: L('50 cartons of 1.0 × 0.5 × 0.4 m. Total CBM?', '50 كرتونة مقاس 1.0 × 0.5 × 0.4 م. كم المتر المكعّب الكلي؟'), o: ['10', '20', '5'], a: 0, e: L('0.2 CBM × 50 = 10 CBM.', '0.2 م³ × 50 = 10 م³.') },
      { q: L('18 tonnes of ceramic tiles, 15 CBM. Best equipment?', '18 طنًا من البلاط، 15 م³. ما أفضل معدّات؟'), o: [L('40′ HC', '40 قدم عالية'), L('20′ DV', '20 قدم عادية'), L('LCL', 'شحنة جزئية')], a: 1, e: L('Dense cargo: weight is the limit, a 20′ carries ~28 t.', 'بضاعة ثقيلة: الوزن هو الحد، والـ20 قدم تحمل ~28 طن.') },
      { q: L('Who should decide the HS code?', 'من يجب أن يحدّد رمز HS؟'), o: [L('The forwarder’s sales person', 'موظّف المبيعات لدى وكيل الشحن'), L('The importer / licensed broker', 'المستورد / المخلّص المرخّص'), L('The shipping line', 'الخط الملاحي')], a: 1 },
    ],
  });

  /* ============================================================ 2. RATES */
  function rateReplyBody(ship, r) {
    const car = OPS.carriers[r.c];
    const valid = OPS.rateValidTo(ship, r);
    const eq = ship.jobFile.equipment;
    const row = (k, v) => `<tr><td>${k}</td><td class="num">${v}</td></tr>`;
    const tbl = `<div class="table-wrap"><table><tbody>${row('Ocean freight (' + eq + ')', 'USD ' + TS.num(r.of))}${row('BAF', 'USD ' + TS.num(r.baf))}${row('LSS', 'USD ' + TS.num(r.lss))}${r.extra.map((x) => row(x.code + ' — ' + x.name, 'USD ' + TS.num(x.amt))).join('')}<tr class="total"><td>All-in ocean</td><td class="num">USD ${TS.num(OPS.rateTotal(r))}</td></tr></tbody></table></div>`;
    return L(`Dear ${OPS.company.short} team,

Thank you for your request. Please find our offer ${ship.jobFile.pol} → ${ship.jobFile.pod}, 1 × ${eq}, ${ship.jobFile.commodity.split(',')[0]}:
${tbl}Transit time: ${r.transit} days, via ${r.ts}
Free time at ${imp(ship) ? 'destination (Beirut)' : 'destination (Hamburg)'}: ${r.free} days combined demurrage/detention
Validity: sailings until ${TS.fmtDate(valid)}
Subject to space/equipment availability, GRI and surcharges in force at time of shipment. THC and local charges as per tariff.
Rate reference: ${car.bkPrefix}-Q${String(OPS.seed(ship) % 9000 + 1000)}

Best regards,
${car.name} — Sales`,
    `فريق ${OPS.company.short} الكرام،

شكرًا لطلبكم. إليكم عرضنا ${ship.jobFile.pol} ← ${ship.jobFile.pod}، حاوية 1 × ${eq}:
${tbl}مدة النقل: ${r.transit} يومًا، عبر ${r.ts}
فترة السماح في ${imp(ship) ? 'الوجهة (بيروت)' : 'الوجهة (هامبورغ)'}: ${r.free} أيام مجمّعة (تأخير/احتجاز)
الصلاحية: للإبحارات حتى ${TS.fmtDate(valid)}
حسب توفّر المساحة والمعدّات، والزيادات العامة والرسوم الإضافية السارية عند الشحن. رسوم المناولة والرسوم المحلية حسب التعرفة.
مرجع السعر: ${car.bkPrefix}-Q${String(OPS.seed(ship) % 9000 + 1000)}

مع التحية،
${car.name} — المبيعات`);
  }

  OPS.steps.push({
    id: 'rates',
    title: L('Rate request to shipping lines', 'طلب الأسعار من الخطوط الملاحية'),
    sub: L('Ask several lines for rates, then compare the offers — not only on price.', 'اطلب الأسعار من عدة خطوط ثم قارن العروض — ليس على السعر فقط.'),
    lesson: () => t(L(`
<h3>Buying before selling</h3>
<p>Your <b>buy rate</b> comes from the shipping line (contract rate or spot quote). Your <b>sell rate</b> is what the client pays. The difference is your margin. Always get 3+ competing offers on a new lane.</p>
<h3>What a line’s offer contains</h3>
<ul><li><b>Ocean freight</b> — base rate per container.</li><li><b>BAF / LSS</b> — fuel surcharges (move with oil prices, IMO 2020 low-sulphur fuel).</li><li><b>CAF</b> — currency adjustment.</li><li><b>Route / contingency / war-risk surcharges</b> — e.g. Red Sea diversions, congested ports.</li><li><b>THC</b> at origin and destination, <b>ISPS</b>, B/L fee, seal — often charged locally by the line’s agent.</li><li><b>GRI / PSS</b> — rate increases announced (usually effective the 1st or 15th). Watch them before offering long validity.</li></ul>
<h3>Compare like for like</h3>
<table><tr><th>Look at</th><th>Why</th></tr>
<tr><td>All-in total</td><td>A low base rate with high surcharges is not cheap.</td></tr>
<tr><td>Validity</td><td>The rate must still be valid on the sailing you can actually make.</td></tr>
<tr><td>Transit time & T/S port</td><td>Delays, congestion and sanctions risk live in the middle leg.</td></tr>
<tr><td>Free time at destination</td><td>Beirut clearance often takes 7–14 days. 5 free days can cost hundreds of dollars in detention.</td></tr></table>
<h3>What you put in a rate request</h3>
<p>POL/POD, commodity and HS, equipment and quantity, weight, cargo ready date, DG status, and the free time you need. <b>Never</b> give the line your client’s contact details or your selling price.</p>`,
    `
<h3>الشراء قبل البيع</h3>
<p><b>سعر الكلفة</b> يأتي من الخط الملاحي (سعر عقد أو عرض فوري). <b>سعر البيع</b> هو ما يدفعه الزبون. الفرق هو هامشك. اطلب دائمًا 3 عروض أو أكثر على خط جديد.</p>
<h3>ماذا يتضمّن عرض الخط</h3>
<ul><li><b>أجرة الشحن البحري</b> — السعر الأساسي للحاوية.</li><li><b>BAF / LSS</b> — رسوم الوقود (تتغيّر مع النفط، والوقود منخفض الكبريت IMO 2020).</li><li><b>CAF</b> — تعديل العملة.</li><li><b>رسوم المسار / الطوارئ / مخاطر الحرب</b> — مثل تحويل المسار عن البحر الأحمر، المرافئ المزدحمة.</li><li><b>THC</b> في المنشأ والوجهة، <b>ISPS</b>، رسم البوليصة، الختم — غالبًا يفرضها وكيل الخط محليًا.</li><li><b>GRI / PSS</b> — زيادات معلنة (عادة من 1 أو 15 في الشهر). انتبه لها قبل إعطاء صلاحية طويلة.</li></ul>
<h3>قارن الشيء بمثله</h3>
<table><tr><th>انظر إلى</th><th>لماذا</th></tr>
<tr><td>المجموع الشامل</td><td>السعر الأساسي المنخفض مع رسوم مرتفعة ليس رخيصًا.</td></tr>
<tr><td>الصلاحية</td><td>يجب أن يبقى السعر ساريًا على الباخرة التي تستطيع اللحاق بها فعلًا.</td></tr>
<tr><td>مدة النقل ومرفأ المسافنة</td><td>التأخير والازدحام ومخاطر العقوبات تكون في المرحلة الوسطى.</td></tr>
<tr><td>فترة السماح في الوجهة</td><td>التخليص في بيروت يستغرق غالبًا 7–14 يومًا. 5 أيام سماح قد تكلّف مئات الدولارات احتجازًا.</td></tr></table>
<h3>ماذا تضع في طلب السعر</h3>
<p>مرفأ التحميل/التفريغ، البضاعة وHS، نوع وعدد الحاويات، الوزن، تاريخ الجهوزية، خطرة أم لا، وفترة السماح التي تحتاجها. <b>أبدًا</b> لا تعطِ الخط بيانات زبونك أو سعر بيعك.</p>`))
      + LB('Main lines calling Beirut include CMA CGM, MSC, Maersk, Hapag-Lloyd and COSCO (directly or through feeders via Port Said, Piraeus, Malta, Gioia Tauro…). Lebanese boycott law means Israeli carriers/vessels are not used for Lebanon — always use the lines’ Lebanon services.', 'من الخطوط الرئيسية التي تخدم بيروت: CMA CGM وMSC وميرسك وهاباغ لويد وكوسكو (مباشرة أو عبر خطوط رديفة من بورسعيد، بيرايوس، مالطا، جويا تاورو…). قانون المقاطعة اللبناني يعني عدم استعمال خطوط/بواخر إسرائيلية للبنان — استعمل دائمًا خدمات الخطوط المخصّصة للبنان.'),
    parts: [
      {
        id: 'content',
        title: L('What goes in the rate request?', 'ماذا تضع في طلب السعر؟'),
        render(ctx, b) {
          ui().choice(ctx, b, {
            key: 'rq', multi: true, q: L('Select the information you will send to the shipping lines.', 'اختر المعلومات التي سترسلها إلى الخطوط الملاحية.'),
            options: [
              { l: L('POL / POD', 'مرفأ التحميل / التفريغ'), ok: true },
              { l: L('Commodity & HS code', 'البضاعة ورمز HS'), ok: true },
              { l: L('Equipment type & quantity', 'نوع الحاوية والعدد'), ok: true },
              { l: L('Gross weight', 'الوزن الإجمالي'), ok: true },
              { l: L('Cargo ready date', 'تاريخ الجهوزية'), ok: true },
              { l: L('Non-DG confirmation', 'تأكيد أنها ليست بضائع خطرة'), ok: true },
              { l: L('Requested free time at destination', 'فترة السماح المطلوبة في الوجهة'), ok: true },
              { l: L('Client’s name, phone and email', 'اسم الزبون وهاتفه وبريده'), ok: false, fb: L('Protect your client — lines also sell direct.', 'احمِ زبونك — الخطوط تبيع مباشرة أيضًا.') },
              { l: L('Our target selling price to the client', 'سعر البيع المستهدف للزبون'), ok: false, fb: L('Never reveal your sell price to a supplier.', 'لا تكشف سعر بيعك للمورّد أبدًا.') },
            ],
            onSuccess: () => ctx.finish('content'),
          });
        },
      },
      {
        id: 'send',
        title: L('Send the request to several lines', 'أرسل الطلب إلى عدة خطوط'),
        render(ctx, b) {
          const s = ctx.ship, j = s.jobFile;
          const sel = (ctx.data.carriers = ctx.data.carriers || []);
          const body = L(`Dear Sales team,

Please quote your best rate:
POL: ${j.pol}   POD: ${j.pod}
Equipment: 1 × ${j.equipment}
Commodity: ${j.commodity} — HS ${j.hs} — non-DG
Gross weight: ${TS.num(j.grossKg, 0)} kg
Cargo ready: ${TS.fmtDate(j.readyDate)}
Please include transit time, T/S port, validity and free time at destination (we need minimum 10–14 days).

Thank you,
Pricing — ${OPS.company.name}`, `فريق المبيعات الكرام،

نرجو تزويدنا بأفضل سعر:
مرفأ التحميل: ${j.pol}   مرفأ التفريغ: ${j.pod}
المعدّات: 1 × ${j.equipment}
البضاعة: ${j.commodity} — HS ${j.hs} — ليست خطرة
الوزن الإجمالي: ${TS.num(j.grossKg, 0)} كغ
الجهوزية: ${TS.fmtDate(j.readyDate)}
يرجى ذكر مدة النقل ومرفأ المسافنة والصلاحية وفترة السماح في الوجهة (نحتاج 10–14 يومًا على الأقل).

شكرًا،
قسم التسعير — ${OPS.company.name}`);
          b.innerHTML = `<p>${t(L('Choose the lines to ask (at least 3 for a competitive comparison):', 'اختر الخطوط التي ستسألها (3 على الأقل لمقارنة تنافسية):'))}</p>
            <div class="grid c3">${Object.entries(OPS.carriers).map(([k, c]) => `<label class="check"><input type="checkbox" value="${k}" ${sel.includes(k) ? 'checked' : ''}><span><b>${esc(c.name)}</b><br><small class="mono">${esc(c.email)}</small></span></label>`).join('')}</div>
            <h4 style="margin-top:12px">${t(L('Email preview', 'معاينة البريد'))}</h4>${ui().emailCard({ to: sel.map((k) => OPS.carriers[k].email).join('; ') || '…', subject: 'Rate request ' + j.pol + ' → ' + j.pod + ' 1x' + j.equipment + ' — ' + s.id, body })}
            <div class="row" style="margin-top:12px"><button class="btn primary" id="snd">${t(L('Send rate request', 'أرسل طلب السعر'))} ✉</button></div>`;
          b.querySelectorAll('input[type=checkbox]').forEach((c) => (c.onchange = () => { ctx.data.carriers = [...b.querySelectorAll('input:checked')].map((x) => x.value); ctx.save(); ctx.rerender(); }));
          b.querySelector('#snd').onclick = () => {
            if (sel.length < 3) { ctx.mistake(); TS.toast(t(L('Ask at least 3 lines', 'اسأل 3 خطوط على الأقل')), 'bad'); return; }
            s.rates.requested = sel.slice();
            ctx.send({ to: sel.map((k) => OPS.carriers[k].email).join('; '), subject: 'Rate request ' + j.pol + ' → ' + j.pod + ' 1x' + j.equipment + ' — ' + s.id, body });
            sel.forEach((k, i) => {
              const r = ctx.sc.rates.find((x) => x.c === k);
              ctx.receive({
                from: OPS.carriers[k].email, subject: L(`${OPS.carriers[k].name} offer ${j.pol}-${j.pod} 1x${j.equipment}`, `عرض ${OPS.carriers[k].name} ${j.pol}-${j.pod} 1x${j.equipment}`),
                body: rateReplyBody(s, r),
                onArrive: (sh) => { if (!sh.rates.received.includes(k)) sh.rates.received.push(k); },
              }, 900 + i * 900);
            });
            ctx.finish('send');
          };
        },
        summary: (ctx) => `<p>✓ ${t(L('Request sent to', 'أُرسل الطلب إلى'))}: ${ctx.ship.rates.requested.map((k) => esc(OPS.carriers[k].name)).join(', ')}</p>`,
      },
      {
        id: 'compare',
        title: L('Compare the offers (buy sheet) and select one', 'قارن العروض (ورقة الكلفة) واختر واحدًا'),
        render(ctx, b) {
          const s = ctx.ship, sc = ctx.sc;
          const got = s.rates.received;
          if (got.length < s.rates.requested.length) {
            b.innerHTML = `<p class="muted">⏳ ${t(L('Waiting for replies…', 'بانتظار الردود…'))} (${got.length}/${s.rates.requested.length}). ${t(L('They arrive in your inbox in a few seconds.', 'تصل إلى بريدك خلال ثوانٍ.'))}</p>`;
            return;
          }
          const reveal = !!ctx.data.reveal;
          const rows = got.map((k) => {
            const r = sc.rates.find((x) => x.c === k);
            const vt = OPS.rateValidTo(s, r);
            return `<tr class="clickable ${ctx.data.pick === k ? 'sel' : ''}" data-pick="${k}"><td><input type="radio" name="pick" ${ctx.data.pick === k ? 'checked' : ''}> <b>${esc(OPS.carriers[k].name)}</b></td><td class="num">${TS.num(r.of)}</td><td class="num">${TS.num(r.baf)}</td><td class="num">${TS.num(r.lss)}</td><td class="num">${TS.num(r.extra.reduce((a, x) => a + x.amt, 0))}</td><td class="num"><b>${TS.num(OPS.rateTotal(r))}</b></td><td class="num">${r.transit}</td><td>${esc(r.ts)}</td><td class="num">${r.free}</td><td>${TS.fmtDate(vt, false)}</td>${reveal ? `<td class="num">${TS.num(OPS.riskCost(sc, r))}</td>` : ''}</tr>`;
          });
          b.innerHTML = `<p>${t(L('All replies are in. Your buy sheet (USD per container):', 'وصلت كل الردود. ورقة الكلفة (دولار للحاوية):'))}</p>
            ${ui().table([L('Line', 'الخط'), { l: 'OF', num: 1 }, { l: 'BAF', num: 1 }, { l: 'LSS', num: 1 }, { l: L('Other', 'أخرى'), num: 1 }, { l: L('All-in', 'الشامل'), num: 1 }, { l: L('Days', 'أيام'), num: 1 }, 'T/S', { l: L('Free days', 'أيام السماح'), num: 1 }, L('Valid until', 'صالح حتى')].concat(reveal ? [{ l: L('Risk-adjusted', 'مع احتساب المخاطر'), num: 1 }] : []), rows)}
            <div class="note">${t(L('Your first possible sailing is around', 'أول باخرة يمكنك اللحاق بها نحو'))} <b>${TS.fmtDate(D(s, 19))}</b>. ${t(L('Expect about', 'توقّع حوالي'))} <b>${sc.expectedDays}</b> ${t(L('days between discharge and empty return at destination.', 'يومًا بين التفريغ وإرجاع الفارغ في الوجهة.'))}</div>
            ${ctx.data.fb ? `<div class="note ${ctx.data.fbOk ? 'ok' : 'bad'}">${t(ctx.data.fb)}</div>` : ''}
            <div class="row"><button class="btn primary" id="sel">${t(L('Select this offer', 'اختر هذا العرض'))}</button><button class="btn ghost" id="ans">${t(L('Show me the answer', 'أرني الجواب'))}</button></div>`;
          b.querySelectorAll('[data-pick]').forEach((tr) => (tr.onclick = () => { ctx.data.pick = tr.dataset.pick; ctx.data.fb = null; ctx.save(); ctx.rerender(); }));
          const best = sc.rates.filter((r) => got.includes(r.c) && OPS.rateValidFor(s, r)).sort((a, c) => OPS.riskCost(sc, a) - OPS.riskCost(sc, c))[0];
          b.querySelector('#ans').onclick = () => { ctx.hint(); ctx.data.pick = best.c; ctx.data.reveal = true; ctx.data.fb = L('Best choice: ' + OPS.carriers[best.c].name + ' — lowest cost once you add the detention you are likely to pay, and valid for your sailing.', 'الخيار الأفضل: ' + OPS.carriers[best.c].name + ' — أقل كلفة بعد إضافة الاحتجاز المتوقّع، وصالح لباخرتك.'); ctx.data.fbOk = true; ctx.save(); ctx.rerender(); };
          b.querySelector('#sel').onclick = () => {
            const k = ctx.data.pick; if (!k) return;
            const r = sc.rates.find((x) => x.c === k);
            if (!OPS.rateValidFor(s, r)) { ctx.mistake(); ctx.data.fb = L(`${OPS.carriers[k].name} is cheapest, but the rate expires on ${TS.fmtDate(OPS.rateValidTo(s, r))} — before any sailing you can make. You would be re-quoted at a higher rate.`, `${OPS.carriers[k].name} الأرخص، لكن السعر ينتهي في ${TS.fmtDate(OPS.rateValidTo(s, r))} — قبل أي باخرة يمكنك اللحاق بها. سيُعاد تسعيرك بسعر أعلى.`); ctx.data.fbOk = false; ctx.save(); ctx.rerender(); return; }
            if (k !== best.c) {
              ctx.mistake(); ctx.data.reveal = true;
              const dd = OPS.ddCost(Math.max(0, sc.expectedDays - r.free), sc.ddTariff);
              ctx.data.fb = L(`Valid, but not the best. With ${r.free} free days and ~${sc.expectedDays} days needed, expect about USD ${dd} in demurrage/detention. Look at the “Risk-adjusted” column.`, `صالح لكنه ليس الأفضل. مع ${r.free} أيام سماح ونحو ${sc.expectedDays} يومًا مطلوبة، توقّع نحو ${dd} دولار غرامات تأخير/احتجاز. انظر إلى عمود «مع احتساب المخاطر».`);
              ctx.data.fbOk = false; ctx.save(); ctx.rerender(); return;
            }
            s.rates.selected = Object.assign({ carrierName: OPS.carriers[k].name, total: OPS.rateTotal(r), validTo: OPS.rateValidTo(s, r), ref: OPS.carriers[k].bkPrefix + '-Q' + String(OPS.seed(s) % 9000 + 1000) }, TS.clone(r));
            ctx.milestone('RATE', s.sim.today, 'Buy rate selected: ' + OPS.carriers[k].name);
            ctx.finish('compare');
          };
        },
        summary: (ctx) => { const r = ctx.ship.rates.selected; return `<p>✓ <b>${esc(r.carrierName)}</b> — ${t(L('all-in', 'الشامل'))} USD ${TS.num(r.total)}, ${r.transit} ${t(L('days via', 'يومًا عبر'))} ${esc(r.ts)}, ${r.free} ${t(L('free days, valid until', 'أيام سماح، صالح حتى'))} ${TS.fmtDate(r.validTo)} (ref ${esc(r.ref)})</p>`; },
      },
    ],
    quiz: [
      { q: L('Line A: USD 2,300 all-in, 5 free days. Line B: USD 2,450 all-in, 14 free days. Beirut clearance usually takes 12 days, detention USD 30/day. Which is cheaper in reality?', 'الخط أ: 2300 دولار شامل، 5 أيام سماح. الخط ب: 2450 دولار، 14 يوم سماح. التخليص في بيروت يستغرق عادة 12 يومًا والاحتجاز 30 دولار/يوم. أيهما أرخص فعليًا؟'), o: [L('Line A', 'الخط أ'), L('Line B', 'الخط ب')], a: 1, e: L('A: 2,300 + 7 × 30 = 2,510. B: 2,450 + 0 = 2,450.', 'أ: 2300 + 7 × 30 = 2510. ب: 2450 + 0 = 2450.') },
      { q: L('What is BAF?', 'ما هو BAF؟'), o: [L('A port security fee', 'رسم أمني للمرفأ'), L('A fuel surcharge', 'رسم إضافي للوقود'), L('A customs duty', 'رسم جمركي')], a: 1 },
      { q: L('Why check the transshipment port?', 'لماذا تتحقّق من مرفأ المسافنة؟'), o: [L('It changes the B/L number', 'يغيّر رقم البوليصة'), L('Delay, congestion and sanctions risk are often in the middle leg', 'مخاطر التأخير والازدحام والعقوبات غالبًا في المرحلة الوسطى'), L('It is not important', 'غير مهم')], a: 1 },
    ],
  });

  /* ============================================================ 3. QUOTATION */
  OPS.buildQuoteLines = (ship) => {
    const sc = OPS.sc(ship), r = ship.rates.selected;
    const lines = [
      { code: 'OF', desc: L('Ocean freight ' + ship.jobFile.pol + ' → ' + ship.jobFile.pod, 'الشحن البحري ' + ship.jobFile.pol + ' ← ' + ship.jobFile.pod), basis: 'cntr', buy: r.of, vendor: 'carrier', vat: false, group: 'freight', sug: r.of + (imp(ship) ? 180 : 120) },
      { code: 'BAF', desc: L('Bunker adjustment factor', 'رسم تعديل الوقود'), basis: 'cntr', buy: r.baf, vendor: 'carrier', vat: false, group: 'freight', sug: r.baf },
      { code: 'LSS', desc: L('Low sulphur surcharge', 'رسم الوقود منخفض الكبريت'), basis: 'cntr', buy: r.lss, vendor: 'carrier', vat: false, group: 'freight', sug: r.lss },
    ].concat(r.extra.map((x) => ({ code: x.code, desc: L(x.name, x.name), basis: x.code === 'ENS' ? 'bl' : 'cntr', buy: x.amt, vendor: 'carrier', vat: false, group: 'freight', sug: x.amt })))
      .concat(sc.locals.map((x) => TS.clone(x)));
    if (sc.insurance) {
      const insured = Math.round((sc.cargo.value + OPS.rateTotal(r)) * 1.1);
      lines.push({ code: 'INS', desc: L(`Cargo insurance (optional) — insured value USD ${TS.num(insured, 0)} (CIF + 10%)`, `تأمين البضاعة (اختياري) — القيمة المؤمّنة ${TS.num(insured, 0)} دولار (CIF + 10%)`), basis: 'bl', buy: TS.round2((insured * sc.insurance.buyPct) / 100), vendor: 'insurer', vat: false, group: 'optional', sug: TS.round2((insured * sc.insurance.sellPct) / 100), insured });
    }
    return lines.map((l) => Object.assign({ qty: 1, cur: 'USD', sell: '' }, l));
  };

  OPS.quoteTotals = (q) => {
    const act = q.lines.filter((l) => l.group !== 'optional' || q.insurance);
    const buy = act.reduce((a, l) => a + Number(l.buy || 0) * l.qty, 0);
    const sell = act.reduce((a, l) => a + Number(l.sell || 0) * l.qty, 0);
    const vatBase = act.filter((l) => l.vat).reduce((a, l) => a + Number(l.sell || 0) * l.qty, 0);
    const vat = TS.round2(vatBase * 0.11);
    return { buy: TS.round2(buy), sell: TS.round2(sell), profit: TS.round2(sell - buy), margin: sell ? ((sell - buy) / sell) * 100 : 0, vatBase: TS.round2(vatBase), vat, grand: TS.round2(sell + vat) };
  };

  OPS.steps.push({
    id: 'quote',
    title: L('Quotation to the client', 'عرض السعر للزبون'),
    sub: L('Build the quote line by line, set your margin, write the conditions and win the job.', 'ابنِ العرض بندًا بندًا، حدّد هامشك، اكتب الشروط واربح العملية.'),
    lesson: () => t(L(`
<h3>A quotation is never one number</h3>
<p>Break it into its parts. That is how you defend the price and how you see where margin is leaking. A typical Lebanese import quote has: ocean freight + surcharges (to the line) and destination charges: DTHC, D/O fee, handling, documentation, customs clearance fee, trucking — plus pass-through items like the container deposit, duties and VAT.</p>
<h3>Margin vs markup</h3>
<ul><li><b>Profit</b> = sell − buy.</li><li><b>Margin</b> = profit ÷ sell (what management usually tracks).</li><li><b>Markup</b> = profit ÷ buy.</li></ul>
<p>Example: buy 2,900, sell 3,200 → profit 300 → margin 9.4%, markup 10.3%.</p>
<p>Where does margin live? Mostly in <b>local charges and services</b>, not in the ocean freight (clients compare ocean rates easily).</p>
<h3>Conditions protect you</h3>
<ul><li>Validity (never longer than the line’s validity).</li><li>Subject to space & equipment, GRI and surcharges at time of shipment.</li><li>Free time at destination (and the tariff after).</li><li>Excludes duties, taxes, inspections, storage — unless you quote them.</li><li>Insurance not included unless requested (carrier liability is limited).</li></ul>
<h3>Negotiation</h3>
<p>If the client pushes back, don’t cut every line. Ask what the competitor includes (free time? delivery? clearance?). Reduce margin only where it is justified, and never below cost.</p>`,
    `
<h3>عرض السعر ليس رقمًا واحدًا أبدًا</h3>
<p>قسّمه إلى بنود. هكذا تدافع عن السعر وترى أين يتسرّب الهامش. عرض الاستيراد اللبناني النموذجي يتضمّن: الشحن البحري + الرسوم الإضافية (للخط) ورسوم الوجهة: THC، رسم إذن التسليم، المعالجة، المستندات، أتعاب التخليص، النقل البري — بالإضافة إلى بنود تمرّ كما هي مثل تأمين الحاوية والرسوم الجمركية والضريبة.</p>
<h3>الهامش مقابل الزيادة</h3>
<ul><li><b>الربح</b> = البيع − الكلفة.</li><li><b>الهامش</b> = الربح ÷ البيع (ما تتابعه الإدارة عادة).</li><li><b>الزيادة</b> = الربح ÷ الكلفة.</li></ul>
<p>مثال: كلفة 2900، بيع 3200 ← ربح 300 ← هامش 9.4%، زيادة 10.3%.</p>
<p>أين يكون الهامش؟ غالبًا في <b>الرسوم المحلية والخدمات</b>، لا في الشحن البحري (الزبائن يقارنون أسعار البحر بسهولة).</p>
<h3>الشروط تحميك</h3>
<ul><li>الصلاحية (لا تتجاوز أبدًا صلاحية الخط).</li><li>حسب توفّر المساحة والمعدّات والزيادات والرسوم عند الشحن.</li><li>فترة السماح في الوجهة (والتعرفة بعدها).</li><li>لا يشمل الرسوم والضرائب والكشف والتخزين — إلا إذا سعّرتها.</li><li>التأمين غير مشمول إلا بطلب (مسؤولية الناقل محدودة).</li></ul>
<h3>التفاوض</h3>
<p>إذا اعترض الزبون، لا تخفّض كل البنود. اسأل ماذا يتضمّن عرض المنافس (فترة سماح؟ تسليم؟ تخليص؟). خفّض الهامش حيث يكون مبرّرًا فقط، وأبدًا تحت الكلفة.</p>`))
      + LB('VAT 11% applies to local services invoiced in Lebanon (THC re-billed, handling, trucking, clearance fees…). International freight is generally treated as exempt/zero-rated. Container deposits, customs duties and import VAT are disbursements — not your revenue.', 'تُطبَّق الضريبة 11% على الخدمات المحلية المفوترة في لبنان (THC المعاد فوترتها، المعالجة، النقل البري، أتعاب التخليص…). يُعامل الشحن الدولي عادةً كمعفى/بنسبة صفر. تأمينات الحاويات والرسوم الجمركية وضريبة الاستيراد سُلف — وليست إيرادك.'),
    parts: [
      {
        id: 'build',
        title: L('Build the quotation', 'ابنِ عرض السعر'),
        render(ctx, b) {
          const s = ctx.ship, sc = ctx.sc;
          if (!ctx.data.q) ctx.data.q = { lines: OPS.buildQuoteLines(s), insurance: false, validTo: '', conds: [] };
          const q = ctx.data.q;
          const tot = OPS.quoteTotals(q);
          const conds = [
            { id: 'space', l: L('Subject to space & equipment availability', 'حسب توفّر المساحة والمعدّات'), ok: true },
            { id: 'gri', l: L('Subject to GRI / surcharge changes at time of shipment', 'حسب الزيادات/الرسوم السارية عند الشحن'), ok: true },
            { id: 'free', l: L(`Free time at destination: ${s.rates.selected.free} days combined; after that as per line tariff`, `فترة السماح في الوجهة: ${s.rates.selected.free} أيام مجمّعة؛ بعدها حسب تعرفة الخط`), ok: true },
            { id: 'duty', l: imp(s) ? L('Excludes customs duties, VAT on goods, inspections and port storage', 'لا يشمل الرسوم الجمركية وضريبة البضاعة والكشف والتخزين في المرفأ') : L('Excludes destination charges and import duties in Germany (CFR)', 'لا يشمل رسوم الوجهة والرسوم الجمركية في ألمانيا (CFR)'), ok: true },
            { id: 'ins', l: L('Insurance not included unless confirmed in writing', 'التأمين غير مشمول إلا بتأكيد خطي'), ok: true },
            { id: 'tt', l: L('Transit time guaranteed', 'مدة النقل مضمونة'), ok: false },
            { id: 'unl', l: L('Unlimited free time', 'فترة سماح غير محدودة'), ok: false },
          ];
          const row = (l, i) => `<tr class="${l.group === 'optional' && !q.insurance ? 'muted' : ''}"><td class="mono">${l.code}</td><td>${t(l.desc)}</td><td>${l.basis === 'cntr' ? '/' + s.jobFile.equipment : '/B/L'}</td><td>${l.vendor}</td><td class="num">${TS.num(l.buy)}</td><td class="num"><input type="number" step="any" data-i="${i}" value="${esc(l.sell)}" style="width:110px"></td><td>${l.vat ? '11%' : '—'}</td></tr>`;
          b.innerHTML = `<p>${t(L('Enter your selling price for every line (USD). Buy prices come from the line’s offer and your local suppliers.', 'أدخل سعر البيع لكل بند (دولار). أسعار الكلفة من عرض الخط ومورّديك المحليين.'))}</p>
            ${ui().table([L('Code', 'الرمز'), L('Description', 'الوصف'), L('Basis', 'الأساس'), L('Paid to', 'يُدفع إلى'), { l: L('Buy', 'الكلفة'), num: 1 }, { l: L('Sell', 'البيع'), num: 1 }, 'VAT'], q.lines.map(row).concat([`<tr class="total"><td></td><td>${t(L('Totals', 'المجاميع'))}</td><td></td><td></td><td class="num">${TS.num(tot.buy)}</td><td class="num">${TS.num(tot.sell)}</td><td class="num">+${TS.num(tot.vat)}</td></tr>`]))}
            ${sc.insurance ? `<label class="check"><input type="checkbox" id="ins" ${q.insurance ? 'checked' : ''}><span>${t(L('Include the optional insurance line (the client asked about cover)', 'أضف بند التأمين الاختياري (الزبون سأل عن التغطية)'))}</span></label>` : ''}
            <div class="grid c4" style="margin:12px 0"><div class="stat"><div class="k">${t(L('Profit', 'الربح'))}</div><div class="v">USD ${TS.num(tot.profit)}</div></div><div class="stat"><div class="k">${t(L('Margin', 'الهامش'))}</div><div class="v">${TS.num(tot.margin, 1)}%</div></div><div class="stat"><div class="k">VAT 11%</div><div class="v">${TS.num(tot.vat)}</div></div><div class="stat"><div class="k">${t(L('Total to client', 'المجموع للزبون'))}</div><div class="v">${TS.num(tot.grand)}</div></div></div>
            ${sc.deposit ? `<div class="note">${t(L(`Add as a note (not revenue): container deposit USD ${TS.num(sc.deposit, 0)}, refundable, payable to the line’s agent before D/O.`, `أضف كملاحظة (ليست إيرادًا): تأمين حاوية ${TS.num(sc.deposit, 0)} دولار، مسترد، يُدفع لوكيل الخط قبل إذن التسليم.`))}</div>` : ''}
            <div class="form"><div class="field"><label>${t(L('Quotation valid until', 'العرض صالح حتى'))}</label><input type="date" id="vt" value="${esc(q.validTo)}"></div></div>
            <h4 style="margin-top:12px">${t(L('Conditions to print on the quotation', 'الشروط التي ستُطبع على العرض'))}</h4>
            ${conds.map((c) => `<label class="check ${ctx.data.condChecked ? ((q.conds.includes(c.id)) === c.ok ? '' : 'wrong') : ''}"><input type="checkbox" data-c="${c.id}" ${q.conds.includes(c.id) ? 'checked' : ''}><span>${t(c.l)}</span></label>`).join('')}
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
            else if (q.validTo > s.rates.selected.validTo) err.push(L('Your validity is longer than the line’s validity (' + TS.fmtDate(s.rates.selected.validTo) + ').', 'صلاحيتك أطول من صلاحية الخط (' + TS.fmtDate(s.rates.selected.validTo) + ').'));
            else if (q.validTo < s.sim.today) err.push(L('Validity is in the past.', 'الصلاحية في الماضي.'));
            const condOk = conds.every((c) => q.conds.includes(c.id) === c.ok);
            if (!condOk) { err.push(L('Check the conditions: include all protective ones, never promise guaranteed transit or unlimited free time.', 'راجع الشروط: ضع كل الشروط الحامية، ولا تَعِد أبدًا بمدة نقل مضمونة أو سماح غير محدود.')); ctx.data.condChecked = true; }
            if (err.length) { ctx.mistake(err.length); ctx.data.err = err; ctx.save(); ctx.rerender(); return; }
            ctx.data.err = null;
            const qn = (s.quotation && s.quotation.version) || 0;
            s.quotation = { no: 'Q-' + s.id + '-v' + (qn + 1), version: qn + 1, date: s.sim.today, validTo: q.validTo, lines: TS.clone(q.lines), insurance: !!q.insurance, conditions: conds.filter((c) => q.conds.includes(c.id)).map((c) => c.l.en), totals: tt, deposit: sc.deposit, status: 'draft' };
            ctx.finish('build');
          };
        },
        summary: (ctx) => { const q = ctx.ship.quotation; return `<p>✓ ${esc(q.no)} — ${t(L('sell', 'بيع'))} USD ${TS.num(q.totals.sell)} + VAT ${TS.num(q.totals.vat)} = <b>USD ${TS.num(q.totals.grand)}</b>, ${t(L('margin', 'هامش'))} ${TS.num(q.totals.margin, 1)}%. <a href="#docs">${t(L('View document', 'عرض المستند'))}</a></p>`; },
      },
      {
        id: 'send',
        title: L('Send the quotation & handle the reply', 'أرسل العرض وتعامل مع الرد'),
        render(ctx, b) {
          const s = ctx.ship, q = s.quotation, sc = ctx.sc;
          if (ctx.data.waiting) { b.innerHTML = `<p class="muted">⏳ ${t(L('Quotation sent — waiting for the client’s reply (check your inbox).', 'أُرسل العرض — بانتظار رد الزبون (راجع بريدك).'))}</p>`; return; }
          if (ctx.data.nego) {
            b.innerHTML = `<div class="note warn"><strong>${t(L('The client is negotiating', 'الزبون يفاوض'))}</strong>${t(L('Read the client’s email. Revise your quotation (lower margin where justified) and resend.', 'اقرأ بريد الزبون. عدّل عرضك (خفّض الهامش حيث يبرَّر) وأعد الإرسال.'))}</div><button class="btn primary" id="rev">${t(L('Revise quotation', 'عدّل العرض'))}</button>`;
            b.querySelector('#rev').onclick = () => { ctx.data.nego = false; ctx.w.parts.build = false; ctx.save(); ctx.rerender(); };
            return;
          }
          const body = L(`Dear ${sc.client.contact},

Thank you for your inquiry. Please find attached our quotation ${q.no} for 1 × ${s.jobFile.equipment} ${s.jobFile.pol} → ${s.jobFile.pod} via ${s.rates.selected.carrierName} (transit about ${s.rates.selected.transit} days, via ${s.rates.selected.ts}).

Total: USD ${TS.num(q.totals.sell)} + VAT USD ${TS.num(q.totals.vat)} = USD ${TS.num(q.totals.grand)}${q.deposit ? `
Container deposit (refundable, to the line): USD ${TS.num(q.deposit, 0)}` : ''}
Valid until ${TS.fmtDate(q.validTo)}.

${q.conditions.map((c) => '• ' + c).join('\n')}

We look forward to your confirmation.
Best regards,
${OPS.company.name}`, `السيد/ة ${sc.client.contact} المحترم/ة،

شكرًا لاستفساركم. مرفق عرضنا ${q.no} لحاوية 1 × ${s.jobFile.equipment} ${s.jobFile.pol} ← ${s.jobFile.pod} عبر ${s.rates.selected.carrierName} (مدة النقل نحو ${s.rates.selected.transit} يومًا عبر ${s.rates.selected.ts}).

المجموع: ${TS.num(q.totals.sell)} دولار + ضريبة ${TS.num(q.totals.vat)} = ${TS.num(q.totals.grand)} دولار${q.deposit ? `
تأمين الحاوية (مسترد، للخط): ${TS.num(q.deposit, 0)} دولار` : ''}
صالح حتى ${TS.fmtDate(q.validTo)}.

${q.conditions.map((c) => '• ' + c).join('\n')}

بانتظار تأكيدكم.
مع التحية،
${OPS.company.name}`);
          b.innerHTML = ui().emailCard({ to: sc.client.email, subject: 'Quotation ' + q.no, body }) + `<div class="row" style="margin-top:12px"><button class="btn primary" id="snd">${t(L('Send quotation', 'أرسل العرض'))} ✉</button></div>`;
          b.querySelector('#snd').onclick = () => {
            ctx.send({ to: sc.client.email, subject: 'Quotation ' + q.no, body, attachments: [q.no + '.pdf'] });
            q.status = 'sent';
            ctx.data.waiting = true;
            const nego = q.totals.margin > 22;
            const compTotal = Math.round(q.totals.buy * 1.12);
            ctx.receive({
              from: sc.client.email,
              subject: nego ? L('RE: Quotation ' + q.no + ' — too expensive', 'رد: العرض ' + q.no + ' — مرتفع') : L('RE: Quotation ' + q.no + ' — approved', 'رد: العرض ' + q.no + ' — موافقة'),
              body: nego
                ? L(`Hello,\n\nYour price is high. Another forwarder offered us about USD ${TS.num(compTotal, 0)} before VAT for the same service. Can you review?\n\n${sc.client.contact}`, `مرحبًا،\n\nسعركم مرتفع. وكيل آخر عرض علينا نحو ${TS.num(compTotal, 0)} دولار قبل الضريبة للخدمة نفسها. هل يمكنكم المراجعة؟\n\n${sc.client.contact}`)
                : L(`Hello,\n\nWe approve your quotation ${q.no}. Please proceed with the booking${imp(s) ? ' and coordinate with our supplier' : ''}.${q.insurance ? ' Please also arrange the cargo insurance as quoted.' : ''}\n\nRegards,\n${sc.client.contact}`, `مرحبًا،\n\nنوافق على عرضكم ${q.no}. يرجى متابعة الحجز${imp(s) ? ' والتنسيق مع المورّد' : ''}.${q.insurance ? ' ويرجى أيضًا ترتيب التأمين كما في العرض.' : ''}\n\nمع التحية،\n${sc.client.contact}`),
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
    quiz: [
      { q: L('Buy 1,000, sell 1,250. What is the margin?', 'الكلفة 1000، البيع 1250. ما الهامش؟'), o: ['25%', '20%', '12.5%'], a: 1, e: L('Profit 250 ÷ sell 1,250 = 20% (markup would be 25%).', 'الربح 250 ÷ البيع 1250 = 20% (الزيادة 25%).') },
      { q: L('Is a container deposit part of your revenue?', 'هل تأمين الحاوية جزء من إيرادك؟'), o: [L('Yes', 'نعم'), L('No — it is refundable and belongs to the client, held by the line', 'لا — مسترد ويعود للزبون ويحتفظ به الخط')], a: 1 },
      { q: L('Your line rate is valid until the 15th. Your quote validity should be…', 'سعر الخط صالح حتى 15 من الشهر. صلاحية عرضك يجب أن تكون…'), o: [L('Until the end of the month', 'حتى آخر الشهر'), L('Until the 15th or earlier', 'حتى 15 أو قبل'), L('No validity', 'بدون صلاحية')], a: 1 },
      { q: L('On which lines does a Lebanese forwarder normally charge VAT 11%?', 'على أي بنود يفرض وكيل الشحن اللبناني عادة ضريبة 11%؟'), o: [L('Only on ocean freight', 'على الشحن البحري فقط'), L('On local services (THC, handling, trucking, clearance…)', 'على الخدمات المحلية (THC، معالجة، نقل، تخليص…)'), L('On the container deposit', 'على تأمين الحاوية')], a: 1 },
    ],
  });

  /* ============================================================ 4. BOOKING */
  OPS.steps.push({
    id: 'booking',
    title: L('Booking with the shipping line', 'الحجز لدى الخط الملاحي'),
    sub: L('Choose the right sailing, place the booking, read the booking confirmation (SO) and its cutoffs.', 'اختر الباخرة المناسبة، قدّم الحجز، واقرأ تأكيد الحجز (SO) ومواعيده النهائية.'),
    lesson: () => t(L(`
<h3>From quote to booking</h3>
<p>Once the client approves, you book space with the line (portal, EDI or email). For an FOB import the booking is placed at origin in the name of your agent/you as the buyer’s <b>nominated forwarder</b>; the supplier must be told whom to contact.</p>
<h3>Choosing a sailing</h3>
<p>Work backwards from the <b>CY cutoff</b>: cargo ready → stuffing → trucking → gate-in <b>at least one day before</b> the cutoff. If you can’t make it safely, take the next vessel and tell the client now, not on cutoff day.</p>
<h3>The booking confirmation (SO)</h3>
<ul><li>Booking number (the key to everything: empty release, gate-in, SI, VGM).</li><li>Vessel/voyage, ETD/ETA, T/S port.</li><li>Cutoffs: <b>ERD</b> (earliest receiving), <b>SI cutoff</b>, <b>VGM cutoff</b>, <b>CY cutoff</b>, doc cutoff.</li><li>Empty pickup depot and release validity.</li><li>Free time agreed.</li></ul>
<h3>Freight terms</h3>
<p><b>Prepaid</b> = paid at origin before the B/L is released. <b>Collect</b> = paid at destination before the D/O. FOB import → normally collect; CFR/CIF export → prepaid.</p>
<h3>Cutoffs are walls</h3>
<p>Miss one and the box is <b>rolled</b> to the next vessel — usually a week, sometimes a missed connection at the hub. Build a buffer into every cutoff.</p>`,
    `
<h3>من العرض إلى الحجز</h3>
<p>بعد موافقة الزبون، تحجز المساحة لدى الخط (بوابة، EDI أو بريد). في استيراد FOB يتم الحجز في المنشأ باسم وكيلك/باسمك كـ<b>وكيل شحن معيّن</b> من المشتري؛ ويجب إبلاغ المورّد بمن يتواصل.</p>
<h3>اختيار الباخرة</h3>
<p>احسب رجوعًا من <b>موعد CY النهائي</b>: جهوزية البضاعة ← التعبئة ← النقل ← الدخول إلى المحطة <b>قبل يوم على الأقل</b> من الموعد. إذا لم تستطع اللحاق بأمان، خذ الباخرة التالية وأبلغ الزبون الآن، لا يوم الموعد النهائي.</p>
<h3>تأكيد الحجز (SO)</h3>
<ul><li>رقم الحجز (مفتاح كل شيء: سحب الفارغ، الدخول، SI، VGM).</li><li>الباخرة/الرحلة، ETD/ETA، مرفأ المسافنة.</li><li>المواعيد: <b>ERD</b> (أبكر استلام)، <b>SI</b>، <b>VGM</b>، <b>CY</b>، المستندات.</li><li>مستودع سحب الفارغ وصلاحية الإفراج.</li><li>فترة السماح المتفق عليها.</li></ul>
<h3>شروط دفع الشحن</h3>
<p><b>مسبق (Prepaid)</b> = يُدفع في المنشأ قبل إصدار البوليصة. <b>عند الوصول (Collect)</b> = يُدفع في الوجهة قبل إذن التسليم. استيراد FOB ← عادة Collect؛ تصدير CFR/CIF ← Prepaid.</p>
<h3>المواعيد النهائية جدران</h3>
<p>إذا فاتك موعد تُنقل الحاوية (<b>Rolled</b>) إلى الباخرة التالية — غالبًا أسبوع، وأحيانًا تفوتك الربطة في مرفأ المسافنة. ضع هامش أمان لكل موعد.</p>`)),
    parts: [
      {
        id: 'sailing',
        title: L('Choose the sailing', 'اختر الباخرة'),
        render(ctx, b) {
          const s = ctx.ship, r = s.rates.selected, sch = OPS.schedule(s, r.c);
          const ready = s.jobFile.readyDate;
          b.innerHTML = `<p>${t(L('Cargo ready', 'جهوزية البضاعة'))}: <b>${TS.fmtDate(ready)}</b>. ${t(L('Stuffing + trucking takes about 1 day, and you want 1 day buffer before the CY cutoff.', 'التعبئة + النقل تحتاج نحو يوم، وتريد يوم أمان قبل موعد CY.'))}</p>
            ${ui().table(['', L('Vessel', 'الباخرة'), L('Voyage', 'الرحلة'), 'ERD', 'SI cut', 'VGM cut', 'CY cut', 'ETD', 'ETA'], sch.map((v) => `<tr class="clickable ${ctx.data.v === v.idx ? 'sel' : ''}" data-v="${v.idx}"><td><input type="radio" ${ctx.data.v === v.idx ? 'checked' : ''}></td><td>${esc(v.vessel)}</td><td class="mono">${v.voyage}</td><td>${TS.fmtDate(v.erd, false)}</td><td>${TS.fmtDate(v.si, false)}</td><td>${TS.fmtDate(v.vgm, false)}</td><td><b>${TS.fmtDate(v.cy, false)}</b></td><td>${TS.fmtDate(v.etd, false)}</td><td>${TS.fmtDate(v.eta, false)}</td></tr>`))}
            ${ctx.data.fb ? `<div class="note bad">${t(ctx.data.fb)}</div>` : ''}
            <div class="row"><button class="btn primary" id="ok">${t(L('Choose this sailing', 'اختر هذه الباخرة'))}</button><button class="btn ghost" id="ans">${t(L('Show me the answer', 'أرني الجواب'))}</button></div>`;
          b.querySelectorAll('[data-v]').forEach((tr) => (tr.onclick = () => { ctx.data.v = Number(tr.dataset.v); ctx.data.fb = null; ctx.save(); ctx.rerender(); }));
          b.querySelector('#ans').onclick = () => { ctx.hint(); ctx.data.v = 1; ctx.save(); ctx.rerender(); };
          b.querySelector('#ok').onclick = () => {
            const v = sch[ctx.data.v]; if (!v) return;
            if (TS.diffDays(ready, v.cy) < 2) { ctx.mistake(); ctx.data.fb = L(`Impossible: CY cutoff ${TS.fmtDate(v.cy)} leaves no time after cargo ready ${TS.fmtDate(ready)} for stuffing, trucking and a buffer.`, `مستحيل: موعد CY ${TS.fmtDate(v.cy)} لا يترك وقتًا بعد الجهوزية ${TS.fmtDate(ready)} للتعبئة والنقل وهامش الأمان.`); ctx.save(); ctx.rerender(); return; }
            if (v.idx === 2) { ctx.mistake(); ctx.data.fb = L('Feasible, but a week later than necessary. The client wants the earliest safe sailing.', 'ممكن لكن متأخر أسبوعًا بلا داعٍ. الزبون يريد أبكر باخرة آمنة.'); ctx.save(); ctx.rerender(); return; }
            ctx.data.sailing = v; ctx.finish('sailing');
          };
        },
        summary: (ctx) => { const v = ctx.data.sailing; return `<p>✓ ${esc(v.vessel)} ${esc(v.voyage)} — ETD ${TS.fmtDate(v.etd)}, CY cutoff ${TS.fmtDate(v.cy)}</p>`; },
      },
      {
        id: 'request',
        title: L('Place the booking on the carrier portal', 'قدّم الحجز على بوابة الخط'),
        render(ctx, b) {
          const s = ctx.ship, r = s.rates.selected, v = ctx.data.sailing, j = s.jobFile;
          if (ctx.data.waiting) { b.innerHTML = `<p class="muted">⏳ ${t(L('Booking request submitted — waiting for the booking confirmation (SO)…', 'تم تقديم الحجز — بانتظار تأكيد الحجز (SO)…'))}</p>`; return; }
          ui().form(ctx, b, {
            key: 'bkreq',
            intro: L(`${r.carrierName} e-booking — ${v.vessel} ${v.voyage}`, `حجز إلكتروني ${r.carrierName} — ${v.vessel} ${v.voyage}`),
            submit: L('Submit booking', 'قدّم الحجز'),
            fields: [
              { k: 'party', label: L('Booking party', 'الجهة الحاجزة'), ro: true, value: () => OPS.company.name },
              { k: 'ref', label: L('Rate / quote reference', 'مرجع السعر'), ro: true, value: () => r.ref },
              { k: 'pol', label: 'POL', type: 'select', options: portOpts(), ans: () => j.pol },
              { k: 'pod', label: 'POD', type: 'select', options: portOpts(), ans: () => j.pod },
              { k: 'eq', label: L('Equipment', 'المعدّات'), type: 'select', options: eqOpts(), ans: () => j.equipment },
              { k: 'qty', label: L('Quantity', 'العدد'), type: 'number', ans: () => 1 },
              { k: 'com', label: L('Commodity', 'البضاعة'), contains: ctx.sc.cargo.keywords, ans: () => j.commodity, full: true },
              { k: 'kg', label: L('Cargo gross weight', 'الوزن الإجمالي للبضاعة'), unit: 'kg', type: 'number', ans: () => j.grossKg },
              { k: 'dg', label: L('Dangerous goods', 'بضائع خطرة'), type: 'select', options: yesNo, ans: () => 'no' },
              { k: 'ft', label: L('Freight terms (master)', 'شروط دفع الشحن (البوليصة الرئيسية)'), type: 'select', options: [{ v: 'Prepaid', l: L('Prepaid', 'مسبق الدفع') }, { v: 'Collect', l: L('Collect', 'يُدفع عند الوصول') }], ans: () => (imp(s) ? 'Collect' : 'Prepaid'), fb: imp(s) ? L('FOB: freight is for the buyer’s account, paid at destination (Beirut) → Collect.', 'FOB: الشحن على حساب المشتري ويُدفع في الوجهة (بيروت) ← Collect.') : L('CFR: the seller pays the freight at origin → Prepaid.', 'CFR: البائع يدفع الشحن في المنشأ ← Prepaid.') },
            ],
            onSuccess: (vals) => {
              const car = OPS.carriers[r.c];
              const no = car.bkPrefix + String(100000 + (OPS.seed(s) % 899999)).padStart(7, '0');
              ctx.data.waiting = true;
              ctx.send({ to: car.email, subject: 'Booking request ' + v.vessel + ' ' + v.voyage + ' — ' + s.id, body: L(`Please confirm booking: 1 × ${vals.eq}, ${vals.pol} → ${vals.pod}, ${v.vessel} ${v.voyage}, ${vals.com}, ${vals.kg} kg, non-DG, freight ${vals.ft}. Ref ${r.ref}.`, `يرجى تأكيد الحجز: 1 × ${vals.eq}، ${vals.pol} ← ${vals.pod}، ${v.vessel} ${v.voyage}، ${vals.com}، ${vals.kg} كغ، غير خطرة، الشحن ${vals.ft}. المرجع ${r.ref}.`) });
              const depot = imp(s) ? 'Shanghai — Waigaoqiao empty depot' : ctx.sc.depot;
              const bk = { no, carrier: r.c, carrierName: r.carrierName, vessel: v.vessel, voyage: v.voyage, pol: j.pol, pod: j.pod, equipment: vals.eq, qty: 1, freightTerms: vals.ft, etd: v.etd, eta: v.eta, ts: v.ts, cutoffs: { erd: v.erd, si: v.si, vgm: v.vgm, cy: v.cy, doc: v.doc }, depot, freeDays: r.free, status: 'confirmed', confirmedOn: s.sim.today };
              const tbl = `<div class="table-wrap"><table><tbody><tr><th>Booking no.</th><td class="mono"><b>${no}</b></td></tr><tr><th>Vessel / voyage</th><td>${v.vessel} / ${v.voyage}</td></tr><tr><th>POL → POD</th><td>${j.pol} → ${j.pod} (T/S ${v.ts})</td></tr><tr><th>Equipment</th><td>1 × ${vals.eq}</td></tr><tr><th>ETD / ETA</th><td>${TS.fmtDate(v.etd)} / ${TS.fmtDate(v.eta)}</td></tr><tr><th>ERD</th><td>${TS.fmtDate(v.erd)}</td></tr><tr><th>SI cutoff</th><td>${TS.fmtDate(v.si)} 12:00</td></tr><tr><th>VGM cutoff</th><td>${TS.fmtDate(v.vgm)} 12:00</td></tr><tr><th>CY cutoff</th><td>${TS.fmtDate(v.cy)} 16:00</td></tr><tr><th>Empty pickup</th><td>${depot}</td></tr><tr><th>Free time at POD</th><td>${r.free} days combined DEM/DET</td></tr><tr><th>Freight</th><td>${vals.ft}</td></tr></tbody></table></div>`;
              ctx.receive({
                from: car.email, subject: L('Booking confirmation ' + no + ' — ' + v.vessel, 'تأكيد الحجز ' + no + ' — ' + v.vessel),
                body: L(`Dear customer,\n\nYour booking is confirmed.\n${tbl}Please note: containers arriving after CY cutoff will be rolled. SI and VGM must be submitted before cutoff.\n\n${car.name} Customer Service`, `عميلنا العزيز،\n\nتم تأكيد حجزكم.\n${tbl}ملاحظة: الحاويات التي تصل بعد موعد CY ستُنقل إلى الباخرة التالية. يجب تقديم SI وVGM قبل الموعد.\n\nخدمة العملاء ${car.name}`),
                attachments: ['SO_' + no + '.pdf'],
                onArrive: (sh) => { sh.booking = bk; sh.work.booking.data.waiting = false; sh.work.booking.parts.request = true; },
              }, 1500);
              ctx.save(); ctx.rerender();
            },
          });
        },
        summary: (ctx) => `<p>✓ ${t(L('Booking confirmed', 'تم تأكيد الحجز'))}: <b class="mono">${esc(ctx.ship.booking.no)}</b> — <a href="#inbox">${t(L('read the SO in your inbox', 'اقرأ تأكيد الحجز في بريدك'))}</a></p>`,
      },
      {
        id: 'readso',
        title: L('Read the booking confirmation and inform the client', 'اقرأ تأكيد الحجز وأبلغ الزبون'),
        render(ctx, b) {
          const s = ctx.ship, bk = s.booking;
          ui().form(ctx, b, {
            key: 'readso',
            intro: L('Open the SO in your inbox and copy the key data into the job file.', 'افتح تأكيد الحجز في بريدك وانسخ البيانات الأساسية إلى ملف العملية.'),
            fields: [
              { k: 'no', label: L('Booking number', 'رقم الحجز'), ans: () => bk.no },
              { k: 'si', label: 'SI cutoff', type: 'date', ans: () => bk.cutoffs.si },
              { k: 'vgm', label: 'VGM cutoff', type: 'date', ans: () => bk.cutoffs.vgm },
              { k: 'cy', label: 'CY cutoff', type: 'date', ans: () => bk.cutoffs.cy },
              { k: 'free', label: L('Free days at POD', 'أيام السماح في مرفأ التفريغ'), type: 'number', ans: () => bk.freeDays },
              { k: 'etd', label: 'ETD', type: 'date', ans: () => bk.etd },
            ],
            submit: L('Save & send booking confirmation to client', 'احفظ وأرسل تأكيد الحجز للزبون'),
            onSuccess: () => {
              ctx.send({ to: ctx.sc.client.email + (imp(s) ? '; ' + ctx.sc.agent.email : ''), cc: imp(s) ? ctx.sc.shipper.email : '', subject: L('Booking confirmed ' + bk.no + ' — ' + s.id, 'تأكيد الحجز ' + bk.no + ' — ' + s.id), body: L(`Dear all,\n\nBooking ${bk.no} is confirmed on ${bk.vessel} ${bk.voyage}, ETD ${TS.fmtDate(bk.etd)}, ETA ${TS.fmtDate(bk.eta)} (estimated).\nCY cutoff: ${TS.fmtDate(bk.cutoffs.cy)} — SI cutoff: ${TS.fmtDate(bk.cutoffs.si)} — VGM cutoff: ${TS.fmtDate(bk.cutoffs.vgm)}.\n${imp(s) ? 'Our Shanghai agent ' + ctx.sc.agent.name + ' will contact the supplier to arrange the empty container and stuffing.' : 'We will arrange the empty container to your factory in Zahle; please confirm the loading date.'}\n\nBest regards,\n${OPS.company.name}`, `إلى الجميع،\n\nالحجز ${bk.no} مؤكد على ${bk.vessel} ${bk.voyage}، المغادرة ${TS.fmtDate(bk.etd)}، الوصول ${TS.fmtDate(bk.eta)} (تقديري).\nموعد CY: ${TS.fmtDate(bk.cutoffs.cy)} — موعد SI: ${TS.fmtDate(bk.cutoffs.si)} — موعد VGM: ${TS.fmtDate(bk.cutoffs.vgm)}.\n${imp(s) ? 'وكيلنا في شنغهاي ' + ctx.sc.agent.name + ' سيتواصل مع المورّد لترتيب الحاوية الفارغة والتعبئة.' : 'سنرسل الحاوية الفارغة إلى مصنعكم في زحلة؛ يرجى تأكيد تاريخ التحميل.'}\n\nمع التحية،\n${OPS.company.name}`) });
              ctx.advance(D(s, 2));
              ctx.milestone('BKG', s.sim.today, 'Booking confirmed ' + bk.no);
              ctx.finish('readso');
            },
          });
        },
      },
    ],
    quiz: [
      { q: L('CY cutoff is Thursday 16:00. When should the truck plan to gate in?', 'موعد CY الخميس 16:00. متى يجب أن تخطّط الشاحنة للدخول؟'), o: [L('Thursday 15:30', 'الخميس 15:30'), L('Wednesday (one day early)', 'الأربعاء (قبل يوم)'), L('Friday morning', 'الجمعة صباحًا')], a: 1 },
      { q: L('What happens if the VGM is missing at cutoff?', 'ماذا يحدث إذا لم يُقدَّم VGM قبل الموعد؟'), o: [L('The line estimates the weight', 'الخط يقدّر الوزن'), L('The container is not loaded', 'لا تُحمَّل الحاوية'), L('Nothing', 'لا شيء')], a: 1, e: L('SOLAS: no VGM, no loading.', 'SOLAS: بدون VGM لا تحميل.') },
      { q: L('FOB import to Beirut. Master B/L freight is normally…', 'استيراد FOB إلى بيروت. أجرة الشحن في البوليصة الرئيسية عادة…'), o: ['Prepaid', 'Collect'], a: 1 },
    ],
  });

  /* ============================================================ 5. EMPTY PICKUP & STUFFING */
  OPS.steps.push({
    id: 'stuffing',
    title: L('Empty pickup, stuffing, VGM & seal', 'سحب الحاوية الفارغة، التعبئة، VGM والختم'),
    sub: L('Get the empty box, check it, load it, seal it and declare the verified gross mass.', 'اسحب الحاوية الفارغة، افحصها، عبّئها، اختمها وصرّح عن الوزن الإجمالي المُتحقَّق.'),
    lesson: () => t(L(`
<h3>Empty release and pickup</h3>
<p>The SO authorises a truck to collect an empty container from the depot. At the gate the depot issues an <b>EIR</b> (equipment interchange receipt) recording the container number and its condition. Detention at origin can start from this moment — don’t pick up too early.</p>
<h3>Inspect before you load</h3>
<ul><li>No holes (light test inside with doors closed), no leaks, dry floor.</li><li>Clean and odour-free (essential for food).</li><li>Doors, gaskets and locking bars work; valid <b>CSC plate</b>.</li><li>Previous labels (DG placards) removed.</li></ul>
<h3>The container number (ISO 6346)</h3>
<p>4 letters (owner code + <b>U</b> for freight containers) + 6-digit serial + 1 check digit, e.g. CMAU 123456 7. A wrong digit on the SI or B/L is a classic, expensive error — use the check digit.</p>
<h3>Stuffing</h3>
<p><b>Live loading</b>: the truck waits while the shipper loads (usually 2–3 free hours, then waiting charges). <b>Drop & pick</b>: the box is left and collected later. Heavy cargo must be spread over the floor; in a 20′, weight concentrated in one half can exceed axle limits even if the total is legal. Secure the cargo (lashing, dunnage, airbags).</p>
<h3>Seal & VGM</h3>
<p>A numbered high-security bolt seal (ISO 17712) goes on the right-hand door. <b>VGM</b> (SOLAS): <b>Method 1</b> = weigh the packed container; <b>Method 2</b> = cargo + packing + dunnage + tare (from the CSC plate/door). The shipper signs the VGM; no VGM, no loading.</p>`,
    `
<h3>الإفراج عن الفارغ وسحبه</h3>
<p>يسمح تأكيد الحجز للشاحنة بسحب حاوية فارغة من المستودع. عند البوابة يصدر المستودع <b>EIR</b> (إيصال تبادل المعدّات) يسجّل رقم الحاوية وحالتها. قد يبدأ الاحتجاز في المنشأ من هذه اللحظة — لا تسحب مبكرًا جدًا.</p>
<h3>افحص قبل التحميل</h3>
<ul><li>لا ثقوب (اختبار الضوء من الداخل والأبواب مغلقة)، لا تسرّب، أرضية جافة.</li><li>نظيفة وبدون روائح (ضروري للأغذية).</li><li>الأبواب والجوانات وأذرع القفل تعمل؛ <b>لوحة CSC</b> صالحة.</li><li>إزالة الملصقات السابقة (لوحات البضائع الخطرة).</li></ul>
<h3>رقم الحاوية (ISO 6346)</h3>
<p>4 أحرف (رمز المالك + <b>U</b> لحاويات الشحن) + رقم تسلسلي من 6 أرقام + رقم تحقّق، مثل CMAU 123456 7. رقم خاطئ في SI أو البوليصة خطأ كلاسيكي ومكلف — استعمل رقم التحقّق.</p>
<h3>التعبئة</h3>
<p><b>التحميل المباشر</b>: تنتظر الشاحنة أثناء التحميل (عادة 2–3 ساعات مجانية ثم رسوم انتظار). <b>الإنزال والسحب</b>: تُترك الحاوية وتُسحب لاحقًا. البضاعة الثقيلة يجب توزيعها على الأرضية؛ في الـ20 قدم تركيز الوزن في نصف واحد قد يتجاوز حمولة المحاور حتى لو كان المجموع قانونيًا. ثبّت البضاعة (ربط، دعامات، وسائد هوائية).</p>
<h3>الختم وVGM</h3>
<p>يُركّب ختم مرقّم عالي الأمان (ISO 17712) على الباب الأيمن. <b>VGM</b> (SOLAS): <b>الطريقة 1</b> = وزن الحاوية المعبّأة؛ <b>الطريقة 2</b> = البضاعة + التغليف + الدعامات + وزن الحاوية الفارغة (من لوحة CSC/الباب). يوقّع الشاحن على VGM؛ بدونه لا تحميل.</p>`))
      + LB('For Lebanese exports from the Bekaa, trucking to Beirut crosses the mountain road (Dahr el Baidar): allow time, check the truck’s permits and axle weights, and avoid picking up the empty too early — origin detention counts from the depot gate-out.', 'في الصادرات اللبنانية من البقاع يعبر النقل إلى بيروت طريق ضهر البيدر الجبلي: خصّص وقتًا كافيًا، تحقّق من تصاريح الشاحنة وأوزان المحاور، ولا تسحب الفارغ مبكرًا — الاحتجاز في المنشأ يُحتسب من خروجها من المستودع.'),
    parts: [
      {
        id: 'arrange',
        title: L('Arrange empty pickup and stuffing', 'رتّب سحب الفارغ والتعبئة'),
        render(ctx, b) {
          const s = ctx.ship, bk = s.booking, sc = ctx.sc;
          if (ctx.data.waiting) { b.innerHTML = `<p class="muted">⏳ ${t(L('Instructions sent — waiting for the pickup report…', 'أُرسلت التعليمات — بانتظار تقرير السحب…'))}</p>`; return; }
          const to = imp(s) ? sc.agent : OPS.parties.trucker;
          ui().form(ctx, b, {
            key: 'arrange',
            intro: imp(s) ? L('Send stuffing instructions to your Shanghai agent (who coordinates with the supplier and its trucker).', 'أرسل تعليمات التعبئة لوكيلك في شنغهاي (ينسّق مع المورّد وشركة النقل).') : L('Send a trucking order to your Lebanese trucker for empty pickup, live loading in Zahle and full delivery to Beirut terminal.', 'أرسل أمر نقل إلى شركة النقل اللبنانية لسحب الفارغ والتحميل المباشر في زحلة وتسليم المعبّأة إلى محطة بيروت.'),
            submit: L('Send instructions', 'أرسل التعليمات'),
            fields: [
              { k: 'bk', label: L('Booking number', 'رقم الحجز'), ans: () => bk.no },
              { k: 'eq', label: L('Equipment', 'المعدّات'), type: 'select', options: eqOpts(), ans: () => bk.equipment },
              { k: 'depot', label: L('Empty pickup depot', 'مستودع سحب الفارغ'), ro: true, value: () => bk.depot },
              { k: 'addr', label: L('Stuffing address', 'عنوان التعبئة'), contains: [imp(s) ? 'Songjiang' : 'Zahle'], ans: () => sc.shipper.address, full: true, fb: L('Stuffing happens at the shipper’s premises.', 'التعبئة تتم في مقرّ الشاحن.') },
              { k: 'date', label: L('Stuffing date', 'تاريخ التعبئة'), type: 'date', ans: () => D(s, 13), check: (v) => (v < s.jobFile.readyDate ? L('Before cargo ready date.', 'قبل تاريخ الجهوزية.') : v > TS.addDays(bk.cutoffs.cy, -2) ? L('Too late: you need time to truck and gate in one day before CY cutoff.', 'متأخر جدًا: تحتاج وقتًا للنقل والدخول قبل يوم من موعد CY.') : TS.diffDays(v, bk.cutoffs.erd) > 2 ? L('Too early: the terminal only receives from ERD (' + TS.fmtDate(bk.cutoffs.erd) + ') — the loaded box would wait and detention runs.', 'مبكر جدًا: المحطة تستلم من ERD (' + TS.fmtDate(bk.cutoffs.erd) + ') فقط — ستنتظر الحاوية ويحتسب الاحتجاز.') : true) },
              { k: 'kg', label: L('Expected cargo gross weight', 'الوزن الإجمالي المتوقّع للبضاعة'), unit: 'kg', type: 'number', ans: () => s.jobFile.grossKg },
            ],
            onSuccess: (v) => {
              const cand = OPS.containerCandidates(OPS.carriers[bk.carrier].prefix, OPS.seed(s));
              ctx.data.cand = cand; ctx.data.waiting = true;
              ctx.advance(TS.addDays(v.date, -1));
              ctx.send({ to: to.email, subject: L('Stuffing instructions — booking ' + bk.no, 'تعليمات التعبئة — الحجز ' + bk.no), body: L(`Please arrange 1 × ${v.eq} under booking ${bk.no}. Pick up the empty at ${bk.depot}. Stuffing at ${v.addr} on ${TS.fmtDate(v.date)}. Expected cargo weight ${v.kg} kg. Please inspect the container before loading, send photos, container & seal numbers and the signed VGM. Gate-in before ${TS.fmtDate(TS.addDays(bk.cutoffs.cy, -1))}.`, `يرجى ترتيب 1 × ${v.eq} بموجب الحجز ${bk.no}. سحب الفارغ من ${bk.depot}. التعبئة في ${v.addr} بتاريخ ${TS.fmtDate(v.date)}. الوزن المتوقّع ${v.kg} كغ. يرجى فحص الحاوية قبل التحميل وإرسال الصور ورقم الحاوية والختم وVGM الموقّع. الدخول قبل ${TS.fmtDate(TS.addDays(bk.cutoffs.cy, -1))}.`) });
              ctx.data.stuffDate = v.date;
              ctx.receive({
                from: to.email, subject: L('Empty picked up — booking ' + bk.no, 'تم سحب الفارغ — الحجز ' + bk.no),
                body: L(`Hello,\n\nEmpty picked up today. The numbers we have from different sources:\n• Driver’s WhatsApp: ${cand.list[0]}\n• Depot EIR: ${cand.list[1]}\n• Loading supervisor’s note: ${cand.list[2]}\nPlease confirm which is correct before we send the VGM.\nThe CSC plate shows tare ${REF.equipment.find((e) => e.code === bk.equipment).tare - 20} kg. Seal to be used: ${OPS.carriers[bk.carrier].prefix.slice(0, 3)}${700000 + (OPS.seed(s) % 99999)}.\nDunnage & lashing: 120 kg.\n\n${to.contact || to.name}`, `مرحبًا،\n\nتم سحب الفارغ اليوم. الأرقام التي لدينا من مصادر مختلفة:\n• واتساب السائق: ${cand.list[0]}\n• إيصال المستودع EIR: ${cand.list[1]}\n• ملاحظة مشرف التحميل: ${cand.list[2]}\nيرجى تأكيد الرقم الصحيح قبل إرسال VGM.\nلوحة CSC تُظهر الوزن فارغة ${REF.equipment.find((e) => e.code === bk.equipment).tare - 20} كغ. الختم المستعمل: ${OPS.carriers[bk.carrier].prefix.slice(0, 3)}${700000 + (OPS.seed(s) % 99999)}.\nالدعامات والربط: 120 كغ.\n\n${to.contact || to.name}`),
                onArrive: (sh) => { const w = sh.work.stuffing; w.data.waiting = false; w.parts.arrange = true; },
              }, 1500);
              ctx.save(); ctx.rerender();
            },
          });
        },
        summary: (ctx) => `<p>✓ ${t(L('Stuffing planned on', 'التعبئة مخطّطة بتاريخ'))} ${TS.fmtDate(ctx.data.stuffDate)} — <a href="#inbox">${t(L('pickup report in inbox', 'تقرير السحب في البريد'))}</a></p>`,
      },
      {
        id: 'cntr',
        title: L('Which container number is correct?', 'أي رقم حاوية صحيح؟'),
        render(ctx, b) {
          const cand = ctx.data.cand;
          ui().choice(ctx, b, {
            key: 'cntr', q: L('Use the ISO 6346 check digit (Calculators page) to find the valid number.', 'استعمل رقم التحقّق ISO 6346 (صفحة الحاسبات) لإيجاد الرقم الصحيح.'),
            options: cand.list.map((c) => ({ l: c.slice(0, 4) + ' ' + c.slice(4, 10) + ' ' + c.slice(10), ok: c === cand.good, fb: c === cand.good ? L('Check digit matches.', 'رقم التحقّق مطابق.') : L('Check digit does not match — typo.', 'رقم التحقّق غير مطابق — خطأ طباعي.') })),
            onSuccess: () => { ctx.ship.equipment = Object.assign(ctx.ship.equipment || {}, { containerNo: cand.good, type: ctx.ship.booking.equipment }); ctx.finish('cntr'); },
          });
        },
        summary: (ctx) => `<p>✓ ${t(L('Container', 'الحاوية'))}: <b class="mono">${esc(ctx.ship.equipment.containerNo)}</b></p>`,
      },
      {
        id: 'inspect',
        title: L('Container inspection', 'فحص الحاوية'),
        render(ctx, b) {
          ui().choice(ctx, b, {
            key: 'insp', multi: true, q: L('The agent sends photos. Which findings mean you must REJECT the container and ask for another one?', 'أرسل الوكيل صورًا. أي ملاحظات تعني أنه يجب رفض الحاوية وطلب أخرى؟'),
            options: [
              { l: L('Light visible through a small hole in the roof', 'ضوء يظهر من ثقب صغير في السقف'), ok: true },
              { l: L('Strong chemical smell inside', 'رائحة كيميائية قوية في الداخل'), ok: true },
              { l: L('Wet floor with water puddles', 'أرضية مبلّلة مع برك ماء'), ok: true },
              { l: L('Small dent on the outside wall, no hole', 'انبعاج صغير في الجدار الخارجي بدون ثقب'), ok: false, fb: L('Cosmetic — acceptable. Note it on the EIR.', 'شكلي — مقبول. سجّله على EIR.') },
              { l: L('Valid CSC plate, doors lock properly', 'لوحة CSC صالحة، الأبواب تُقفل جيدًا'), ok: false, fb: L('That is what you want.', 'هذا ما تريده.') },
            ],
            onSuccess: () => ctx.finish('inspect'),
          });
        },
      },
      {
        id: 'vgm',
        title: L('Verified gross mass (VGM) & seal', 'الوزن الإجمالي المُتحقَّق (VGM) والختم'),
        render(ctx, b) {
          const s = ctx.ship, bk = s.booking, eq = REF.equipment.find((e) => e.code === bk.equipment);
          const tare = eq.tare - 20, seal = OPS.carriers[bk.carrier].prefix.slice(0, 3) + (700000 + (OPS.seed(s) % 99999));
          ui().form(ctx, b, {
            key: 'vgm', intro: L('Use the numbers from the agent’s/trucker’s email (Method 2).', 'استعمل الأرقام من بريد الوكيل/الناقل (الطريقة 2).'),
            fields: [
              { k: 'method', label: L('VGM method', 'طريقة VGM'), type: 'select', options: [{ v: 'M1', l: L('Method 1 — weigh the packed container', 'الطريقة 1 — وزن الحاوية المعبّأة') }, { v: 'M2', l: L('Method 2 — sum of cargo + dunnage + tare', 'الطريقة 2 — مجموع البضاعة + الدعامات + الفارغ') }], ans: () => 'M2' },
              { k: 'cargo', label: L('Cargo gross weight', 'الوزن الإجمالي للبضاعة'), unit: 'kg', type: 'number', ans: () => s.jobFile.grossKg },
              { k: 'dun', label: L('Dunnage & lashing', 'الدعامات والربط'), unit: 'kg', type: 'number', ans: () => 120 },
              { k: 'tare', label: L('Container tare (CSC plate)', 'وزن الحاوية فارغة (لوحة CSC)'), unit: 'kg', type: 'number', ans: () => tare },
              { k: 'vgm', label: 'VGM', unit: 'kg', type: 'number', ans: () => s.jobFile.grossKg + 120 + tare, fb: L('VGM = cargo + dunnage + tare.', 'VGM = البضاعة + الدعامات + الفارغ.') },
              { k: 'seal', label: L('Seal number', 'رقم الختم'), ans: () => seal },
              { k: 'pay', label: L('Is the cargo within the container’s max payload?', 'هل البضاعة ضمن الحمولة القصوى للحاوية؟'), type: 'select', options: yesNo, ans: () => (s.jobFile.grossKg + 120 <= eq.payload ? 'yes' : 'no') },
            ],
            onSuccess: (v) => {
              Object.assign(s.equipment, { tare: v.tare, seal: v.seal, vgm: v.vgm, vgmMethod: v.method, dunnageKg: v.dun, stuffedOn: ctx.w.data.stuffDate, vgmSignedBy: ctx.sc.shipper.name });
              ctx.advance(ctx.w.data.stuffDate);
              ctx.milestone('STUF', ctx.w.data.stuffDate, 'Stuffed & sealed ' + s.equipment.containerNo + ' / ' + v.seal);
              ctx.finish('vgm');
            },
          });
        },
        summary: (ctx) => { const e = ctx.ship.equipment; return `<p>✓ ${esc(e.containerNo)} — seal ${esc(e.seal)} — VGM <b>${TS.num(e.vgm, 0)} kg</b> (${esc(e.vgmMethod)})</p>`; },
      },
    ],
    quiz: [
      { q: L('Which is a valid container number format?', 'أي صيغة لرقم حاوية صحيحة؟'), o: ['MSC 12345678', 'MSCU 123456 X', 'MSCU 123456 7'], a: 2 },
      { q: L('VGM Method 2 means…', 'طريقة VGM الثانية تعني…'), o: [L('Weighing the loaded container on a certified scale', 'وزن الحاوية المعبّأة على ميزان معتمد'), L('Adding cargo, packing, dunnage and the container tare', 'جمع البضاعة والتغليف والدعامات ووزن الحاوية الفارغة'), L('Estimating from the CBM', 'التقدير من الحجم')], a: 1 },
      { q: L('Why not pick up the empty container 10 days before stuffing?', 'لماذا لا تسحب الحاوية الفارغة قبل 10 أيام من التعبئة؟'), o: [L('Detention/free time starts at depot gate-out', 'الاحتجاز/فترة السماح تبدأ عند خروجها من المستودع'), L('The seal expires', 'ينتهي الختم'), L('It is illegal', 'غير قانوني')], a: 0 },
    ],
  });

  /* ============================================================ 6. EXPORT CUSTOMS & GATE-IN */
  OPS.steps.push({
    id: 'gatein',
    title: L('Export customs, VGM submission & gate-in', 'التخليص الصادر، تقديم VGM والدخول إلى المحطة'),
    sub: L('Clear the goods for export, send the VGM and deliver the full container to the terminal before cutoff.', 'خلّص البضاعة للتصدير، أرسل VGM وسلّم الحاوية المعبّأة للمحطة قبل الموعد النهائي.'),
    lesson: () => t(L(`
<h3>Export clearance</h3>
<p>Before a container can be loaded, the goods must be declared for export in the country of origin. The declaration (with invoice, packing list and any certificates) is lodged by a licensed broker. Under FOB/CFR/CIF/FCA the <b>seller</b> is responsible for export clearance; under EXW the buyer is.</p>
<h3>VGM submission</h3>
<p>The signed VGM is sent to the line (portal/EDI) before the <b>VGM cutoff</b>. Many terminals will not accept the box at the gate without it.</p>
<h3>Gate-in</h3>
<ul><li>Not before <b>ERD</b> (the terminal refuses early boxes, or charges storage).</li><li>Not after <b>CY cutoff</b> (rolled).</li><li>Plan to gate in at least one day before the cutoff.</li><li>At the gate an <b>EIR</b> records container no., seal no., condition, time. Check it.</li></ul>`,
    `
<h3>التخليص الصادر</h3>
<p>قبل تحميل الحاوية، يجب التصريح عن البضاعة للتصدير في بلد المنشأ. يقدّم البيان (مع الفاتورة وقائمة التعبئة وأي شهادات) مخلّص مرخّص. في FOB/CFR/CIF/FCA يكون <b>البائع</b> مسؤولًا عن التخليص الصادر؛ في EXW المشتري.</p>
<h3>تقديم VGM</h3>
<p>يُرسل VGM الموقّع إلى الخط (البوابة/EDI) قبل <b>موعد VGM</b>. كثير من المحطات لا تقبل الحاوية على البوابة بدونه.</p>
<h3>الدخول إلى المحطة</h3>
<ul><li>ليس قبل <b>ERD</b> (المحطة ترفض الحاويات المبكرة أو تفرض تخزينًا).</li><li>ليس بعد <b>موعد CY</b> (تُنقل إلى باخرة لاحقة).</li><li>خطّط للدخول قبل الموعد بيوم على الأقل.</li><li>عند البوابة يسجّل <b>EIR</b> رقم الحاوية والختم والحالة والوقت. تحقّق منه.</li></ul>`))
      + LB('In Lebanon the export declaration is lodged in NAJM by a licensed customs broker with: commercial invoice, packing list, the exporter’s registration, and certificates as required (COO/EUR.1 from the Chamber, health certificate from the Ministry of Agriculture for food). Your Customs department will do this for you — this simulator hands the data over in the shipment JSON.', 'في لبنان يقدّم مخلّص جمركي مرخّص بيان التصدير على نظام نجم مع: الفاتورة التجارية، قائمة التعبئة، تسجيل المصدّر، والشهادات المطلوبة (منشأ/EUR.1 من الغرفة، شهادة صحية من وزارة الزراعة للأغذية). قسم الجمارك سيقوم بذلك — وهذا المحاكي يسلّمه البيانات في ملف JSON للشحنة.'),
    parts: [
      {
        id: 'customs',
        title: L('Export customs clearance', 'التخليص الجمركي للتصدير'),
        render(ctx, b) {
          const s = ctx.ship, sc = ctx.sc;
          if (ctx.data.waiting) { b.innerHTML = `<p class="muted">⏳ ${t(L('Waiting for export clearance confirmation…', 'بانتظار تأكيد التخليص الصادر…'))}</p>`; return; }
          if (imp(s)) {
            ui().choice(ctx, b, {
              key: 'expc', q: L('FOB Shanghai: who must clear the goods for export in China?', 'FOB شنغهاي: من يجب أن يخلّص البضاعة للتصدير في الصين؟'),
              options: [
                { l: L('The seller (Shanghai Hongda) through its customs broker; your agent follows up', 'البائع (شنغهاي هونغدا) عبر مخلّصه؛ ووكيلك يتابع'), ok: true },
                { l: L('Your company in Beirut', 'شركتك في بيروت'), ok: false },
                { l: L('The shipping line', 'الخط الملاحي'), ok: false },
              ],
              onSuccess: () => {
                ctx.data.waiting = true;
                ctx.receive({ from: sc.agent.email, subject: L('Export customs released — ' + s.booking.no, 'تم التخليص الصادر — ' + s.booking.no), body: L(`Hello,\n\nThe supplier’s broker has cleared export customs. Declaration no. 2200${OPS.seed(s) % 100000}. Released.\nWe will gate in as per your instructions.\n\n${sc.agent.contact}`, `مرحبًا،\n\nقام مخلّص المورّد بالتخليص الصادر. رقم البيان 2200${OPS.seed(s) % 100000}. تم الإفراج.\nسندخل الحاوية حسب تعليماتكم.\n\n${sc.agent.contact}`), onArrive: (sh) => { sh.exportCustoms = { by: 'Seller’s broker (China)', declarationNo: '2200' + (OPS.seed(sh) % 100000), status: 'released', date: sh.sim.today }; const w = sh.work.gatein; w.data.waiting = false; w.parts.customs = true; } }, 1200);
                ctx.save(); ctx.rerender();
              },
            });
          } else {
            ui().choice(ctx, b, {
              key: 'expdocs', multi: true, q: L('Select the documents you send to your Customs department for the Lebanese export declaration.', 'اختر المستندات التي ترسلها إلى قسم الجمارك لبيان التصدير اللبناني.'),
              options: [
                { l: L('Commercial invoice', 'الفاتورة التجارية'), ok: true },
                { l: L('Packing list', 'قائمة التعبئة'), ok: true },
                { l: L('Booking confirmation (SO)', 'تأكيد الحجز (SO)'), ok: true },
                { l: L('Exporter’s commercial registration', 'السجل التجاري للمصدّر'), ok: true },
                { l: L('Health certificate (Ministry of Agriculture) for the food product', 'الشهادة الصحية (وزارة الزراعة) للمنتج الغذائي'), ok: true },
                { l: L('Certificate of origin + EUR.1 application', 'طلب شهادة المنشأ + EUR.1'), ok: true },
                { l: L('Delivery order', 'إذن التسليم'), ok: false, fb: L('A D/O is an import (destination) document.', 'إذن التسليم مستند استيراد (في الوجهة).') },
                { l: L('Arrival notice', 'إشعار الوصول'), ok: false, fb: L('Also a destination document.', 'مستند في الوجهة أيضًا.') },
              ],
              submit: L('Hand over to Customs department', 'سلّم إلى قسم الجمارك'),
              onSuccess: () => {
                const pack = OPS.customsPack(s, 'export');
                s.handoffs.customs_export = { department: 'customs', type: 'export_declaration', status: 'submitted', sentSim: s.sim.today, sentAt: new Date().toISOString(), pack };
                ctx.send({ to: OPS.parties.broker.email, subject: L('Export declaration request — ' + s.id, 'طلب بيان تصدير — ' + s.id), body: L('Please lodge the export declaration in NAJM for booking ' + s.booking.no + '. All data is in the shipment file (JSON hand-off: customs_export).', 'يرجى تقديم بيان التصدير على نظام نجم للحجز ' + s.booking.no + '. كل البيانات في ملف الشحنة (التسليم: customs_export).'), attachments: [s.id + '.json', 'Invoice.pdf', 'PackingList.pdf', 'HealthCert.pdf'] });
                ctx.data.waiting = true;
                ctx.receive({ from: OPS.parties.broker.email, subject: L('Export declaration released — ' + s.id, 'تم الإفراج عن بيان التصدير — ' + s.id), body: L(`Export declaration EX/${s.sim.today.slice(0, 4)}/${OPS.seed(s) % 90000 + 10000} lodged in NAJM — green lane — released.\nCOO and EUR.1 issued by the Chamber of Commerce, Industry & Agriculture of Zahle & Bekaa.\n(Simulated — this becomes real work in the Customs department module.)`, `بيان التصدير EX/${s.sim.today.slice(0, 4)}/${OPS.seed(s) % 90000 + 10000} قُدّم على نظام نجم — المسار الأخضر — تم الإفراج.\nصدرت شهادة المنشأ وEUR.1 من غرفة التجارة والصناعة والزراعة في زحلة والبقاع.\n(محاكاة — ستصبح عملًا حقيقيًا في وحدة قسم الجمارك.)`), onArrive: (sh) => { sh.exportCustoms = { by: 'PFT Customs Department', declarationNo: 'EX/' + sh.sim.today.slice(0, 4) + '/' + (OPS.seed(sh) % 90000 + 10000), lane: 'green', status: 'released', date: sh.sim.today, simulated: true }; sh.handoffs.customs_export.status = 'released (simulated)'; const w = sh.work.gatein; w.data.waiting = false; w.parts.customs = true; } }, 1800);
                ctx.save(); ctx.rerender();
              },
            });
          }
        },
        summary: (ctx) => { const e = ctx.ship.exportCustoms; return e ? `<p>✓ ${t(L('Export customs released', 'تم التخليص الصادر'))} — ${esc(e.declarationNo)} (${esc(e.by)})</p>` : ''; },
      },
      {
        id: 'plan',
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
              ctx.send({ to: OPS.carriers[bk.carrier].email, subject: 'VGM ' + s.equipment.containerNo + ' — ' + bk.no, body: L(`VGM declaration: ${s.equipment.containerNo}, ${TS.num(s.equipment.vgm, 0)} kg, ${s.equipment.vgmMethod}, signed by ${s.equipment.vgmSignedBy}.`, `تصريح VGM: ${s.equipment.containerNo}، ${TS.num(s.equipment.vgm, 0)} كغ، ${s.equipment.vgmMethod}، موقّع من ${s.equipment.vgmSignedBy}.`) });
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
        id: 'eir',
        title: L('Check the terminal EIR', 'تحقّق من إيصال EIR في المحطة'),
        render(ctx, b) {
          const e = ctx.ship.equipment;
          ui().choice(ctx, b, {
            key: 'eir', multi: true,
            pre: `<div class="email-preview"><b>EIR — GATE IN FULL</b><br>Container: ${esc(e.containerNo)} · Size/type: ${esc(e.type)} · Seal: ${esc(e.seal)}<br>Booking: ${esc(ctx.ship.booking.no)} · Date: ${TS.fmtDate(e.gateIn)} 10:42<br>Condition: sound — minor dent L/S panel</div><br>`,
            q: L('What do you check on the gate-in EIR?', 'ماذا تتحقّق في إيصال EIR عند الدخول؟'),
            options: [
              { l: L('Container number matches the booking/VGM', 'رقم الحاوية مطابق للحجز/VGM'), ok: true },
              { l: L('Seal number matches what the shipper applied', 'رقم الختم مطابق لما وضعه الشاحن'), ok: true },
              { l: L('Damage remarks (to avoid a later damage claim)', 'ملاحظات الأضرار (لتجنّب مطالبة لاحقة)'), ok: true },
              { l: L('Gate-in date/time is before the CY cutoff', 'تاريخ/وقت الدخول قبل موعد CY'), ok: true },
              { l: L('The customs duty amount', 'قيمة الرسوم الجمركية'), ok: false },
            ],
            onSuccess: () => ctx.finish('eir'),
          });
        },
      },
    ],
    quiz: [
      { q: L('ERD is Monday, CY cutoff is Thursday. The truck arrives Saturday before. What happens?', 'ERD يوم الاثنين، وموعد CY الخميس. وصلت الشاحنة السبت قبله. ماذا يحدث؟'), o: [L('Accepted normally', 'تُقبل عاديًا'), L('Refused or charged early storage', 'تُرفض أو تُفرض رسوم تخزين مبكر'), L('Loaded on an earlier vessel', 'تُحمَّل على باخرة أبكر')], a: 1 },
      { q: L('Under CFR, who clears export customs?', 'في CFR من يخلّص التصدير؟'), o: [L('Seller', 'البائع'), L('Buyer', 'المشتري'), L('Carrier', 'الناقل')], a: 0 },
      { q: L('In Lebanon, customs declarations are lodged through…', 'في لبنان تُقدَّم البيانات الجمركية عبر…'), o: [L('The shipping line portal', 'بوابة الخط الملاحي'), L('NAJM, by a licensed customs broker', 'نظام نجم، من قبل مخلّص جمركي مرخّص'), L('The Chamber of Commerce', 'غرفة التجارة')], a: 1 },
    ],
  });

  /* shared: build a customs data pack from the shipment */
  OPS.customsPack = (s, kind) => {
    const sc = OPS.sc(s);
    return {
      kind, shipmentId: s.id, direction: s.direction,
      declarant: OPS.parties.broker.name,
      exporter: s.parties.shipper, importer: s.parties.consignee,
      commodity: s.jobFile.commodity, hsProvided: s.jobFile.hs,
      packages: s.jobFile.packages, packageType: s.jobFile.pkgType, grossKg: s.jobFile.grossKg, netKg: sc.cargo.netKgPer * sc.cargo.packages, cbm: s.jobFile.cbm,
      invoiceValue: sc.cargo.value, currency: sc.cargo.currency, incoterm: s.jobFile.incoterm + ' ' + s.jobFile.namedPlace,
      origin: kind === 'export' ? 'Lebanon' : 'China',
      transport: s.booking ? { carrier: s.booking.carrierName, vessel: s.booking.vessel, voyage: s.booking.voyage, bookingNo: s.booking.no, pol: s.booking.pol, pod: s.booking.pod, etd: s.booking.etd, eta: s.booking.eta } : null,
      container: s.equipment ? { no: s.equipment.containerNo, type: s.equipment.type, seal: s.equipment.seal, vgm: s.equipment.vgm } : null,
      bl: s.documents && s.documents.bl ? { mbl: s.documents.bl.mblNo, hbl: s.documents.bl.hblNo } : null,
    };
  };
})();
