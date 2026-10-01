/* Customs module — 8 steps from receiving the file to customs release (import Beirut / export Lebanon) */
(function () {
  const L = TS.L, t = TS.t, esc = TS.esc, R = TS.round2;
  const CUS = window.CUS;
  const ui = () => TS.ui;
  const C = (s) => s.customs;
  const LB = (en, ar) => `<div class="note lb"><strong>🇱🇧 ${t(L('Lebanon', 'لبنان'))}</strong>${t(L(en, ar))}</div>`;
  const usd = (n) => 'USD ' + TS.num(n);
  const tariffOpts = (filter) => CUS.tariff.filter(filter || (() => true)).map((x) => ({ v: x.hs, l: { en: x.hs + ' — ' + x.d.en, ar: x.hs + ' — ' + x.d.ar } }));
  CUS.steps = [];

  /* ============================================================ 1. FILE & DOCUMENTS */
  CUS.steps.push({
    id: 'file',
    title: L('Receive the file & check the documents', 'استلام الملف وتدقيق المستندات'),
    sub: L('Make sure every document is there and that they all tell the same story.', 'تأكّد من وجود كل المستندات وأنها كلها متطابقة.'),
    lesson: (s) => t(L(`
<h3>The broker’s first rule</h3>
<p>You sign the declaration, so you are responsible for it. Before lodging anything, collect every document and <b>cross-check</b> them: invoice ↔ packing list ↔ B/L/manifest ↔ certificates. Quantity, weight, description, value and parties must agree.</p>
<h3>Typical import file (Lebanon)</h3>
<ul><li>Commercial invoice (signed, with Incoterm and currency) and detailed packing list.</li><li>Certificate of origin (origin is declared on every item; a preferential COO reduces duty).</li><li>B/L copy and the line’s delivery order (D/O).</li><li>Importer’s commercial registration and VAT/financial number.</li><li>Licences/approvals for restricted goods.</li></ul>
<h3>Typical export file</h3>
<ul><li>Commercial invoice, packing list, booking confirmation.</li><li>Exporter’s registration.</li><li>Certificates required by the buyer’s country: COO / EUR.1 from the Chamber, health or phytosanitary certificate from the Ministry of Agriculture for food.</li></ul>
<p>A difference between documents is not a detail: declaring 120 cartons when the packing list says 118 is a false declaration — fix the document first.</p>`,
    `
<h3>القاعدة الأولى للمخلّص</h3>
<p>أنت توقّع البيان، إذًا أنت مسؤول عنه. قبل تقديم أي شيء اجمع كل المستندات و<b>قاطعها</b>: الفاتورة ↔ قائمة التعبئة ↔ البوليصة/المانيفست ↔ الشهادات. يجب أن تتطابق الكمية والوزن والوصف والقيمة والأطراف.</p>
<h3>ملف الاستيراد النموذجي (لبنان)</h3>
<ul><li>الفاتورة التجارية (موقّعة، مع شرط التسليم والعملة) وقائمة تعبئة مفصّلة.</li><li>شهادة المنشأ (يُصرَّح عن المنشأ لكل صنف؛ وشهادة المنشأ التفضيلية تخفّض الرسم).</li><li>نسخة البوليصة وإذن التسليم من الخط.</li><li>السجل التجاري للمستورد ورقمه المالي/الضريبي.</li><li>التراخيص/الموافقات للبضائع المقيّدة.</li></ul>
<h3>ملف التصدير النموذجي</h3>
<ul><li>الفاتورة التجارية، قائمة التعبئة، تأكيد الحجز.</li><li>تسجيل المصدّر.</li><li>الشهادات التي يطلبها بلد المشتري: المنشأ / EUR.1 من الغرفة، الشهادة الصحية أو الصحة النباتية من وزارة الزراعة للأغذية.</li></ul>
<p>الفرق بين المستندات ليس تفصيلًا: التصريح عن 120 كرتونة بينما تقول قائمة التعبئة 118 هو تصريح كاذب — صحّح المستند أولًا.</p>`)),
    parts: [
      {
        id: 'docs', title: L('Which documents do you need?', 'ما المستندات التي تحتاجها؟'),
        render(ctx, b) {
          const imp = ctx.d.imp;
          ui().choice(ctx, b, {
            key: 'docs', multi: true, q: imp ? L('Select the documents required to lodge the Lebanese import declaration.', 'اختر المستندات المطلوبة لتقديم بيان الاستيراد اللبناني.') : L('Select the documents required for the Lebanese export declaration and the buyer.', 'اختر المستندات المطلوبة لبيان التصدير اللبناني وللمشتري.'),
            options: imp ? [
              { l: L('Commercial invoice', 'الفاتورة التجارية'), ok: true }, { l: L('Packing list', 'قائمة التعبئة'), ok: true }, { l: L('Certificate of origin', 'شهادة المنشأ'), ok: true },
              { l: L('B/L copy (+ telex release)', 'نسخة البوليصة (+ التلكس)'), ok: true }, { l: L('Delivery order from the line', 'إذن التسليم من الخط'), ok: true }, { l: L('Importer’s commercial registration & VAT number', 'السجل التجاري للمستورد ورقمه الضريبي'), ok: true },
              { l: L('Our quotation to the client', 'عرض السعر للزبون'), ok: false, fb: L('Commercial document between us and the client — not a customs document.', 'مستند تجاري بيننا وبين الزبون — ليس مستندًا جمركيًا.') },
              { l: L('Booking confirmation from Shanghai', 'تأكيد الحجز من شنغهاي'), ok: false, fb: L('Origin document, not needed for import clearance.', 'مستند منشأ، غير ضروري للتخليص الوارد.') },
            ] : [
              { l: L('Commercial invoice', 'الفاتورة التجارية'), ok: true }, { l: L('Packing list', 'قائمة التعبئة'), ok: true }, { l: L('Booking confirmation', 'تأكيد الحجز'), ok: true },
              { l: L('Exporter’s commercial registration', 'السجل التجاري للمصدّر'), ok: true }, { l: L('Certificate of origin + EUR.1', 'شهادة المنشأ + EUR.1'), ok: true }, { l: L('Health certificate (Ministry of Agriculture)', 'الشهادة الصحية (وزارة الزراعة)'), ok: true },
              { l: L('Delivery order', 'إذن التسليم'), ok: false, fb: L('Import document at destination.', 'مستند استيراد في الوجهة.') },
              { l: L('Arrival notice', 'إشعار الوصول'), ok: false, fb: L('Destination document.', 'مستند في الوجهة.') },
            ],
            onSuccess: () => ctx.finish('docs'),
          });
        },
      },
      {
        id: 'cross', title: L('Cross-check the documents', 'قاطع المستندات'),
        render(ctx, b) {
          const s = ctx.ship, d = ctx.d, imp = d.imp;
          const pre = imp
            ? `<div class="grid c3"><div class="email-preview"><b>Commercial invoice</b><br>${d.items.map((x) => `${x.qty} ${x.unit} ${esc(x.desc)} — ${x.pkgs} ctns — USD ${TS.num(x.value)}`).join('<br>')}<br><b>Total 120 cartons — USD ${TS.num(d.valTotal)}</b></div><div class="email-preview"><b>Packing list</b><br>Tables: 30 ctns, 3,600 kg<br>Chairs: <b>88 ctns</b>, 4,800 kg<br><b>Total 118 cartons, 8,400 kg</b></div><div class="email-preview"><b>B/L / manifest</b><br>${esc(s.documents.bl.mblNo)}<br>${esc(s.equipment.containerNo)}<br><b>120 CARTONS — 8,400 KGS</b></div></div>`
            : `<div class="grid c3"><div class="email-preview"><b>Commercial invoice</b><br>${esc(d.items[0].desc)}<br>20 pallets — net 15,600 kg — gross 17,000 kg<br>USD ${TS.num(d.cfr)} CFR Hamburg</div><div class="email-preview"><b>Packing list</b><br>20 pallets<br>Net 15,600 kg — gross 17,000 kg</div><div class="email-preview"><b>Health certificate (draft)</b><br>Tahini in glass jars<br><b>Net weight 15,000 kg</b><br>Exporter: ${esc(s.parties.shipper.name)}</div></div>`;
          ui().choice(ctx, b, {
            key: 'cross', pre,
            q: imp ? L('The packing list says 118 cartons; the invoice and the manifest say 120. What do you do?', 'قائمة التعبئة تقول 118 كرتونة؛ والفاتورة والمانيفست تقولان 120. ماذا تفعل؟') : L('The draft health certificate shows 15,000 kg net; invoice and packing list show 15,600 kg. What do you do?', 'مسودة الشهادة الصحية تُظهر 15,000 كغ صافيًا؛ والفاتورة وقائمة التعبئة 15,600 كغ. ماذا تفعل؟'),
            options: imp ? [
              { l: L('Stop and ask the supplier (via our Shanghai agent) for a corrected packing list before lodging; check the container count if needed', 'توقّف واطلب من المورّد (عبر وكيلنا في شنغهاي) قائمة تعبئة مصحّحة قبل التقديم؛ وتحقّق من العدد في الحاوية إذا لزم'), ok: true },
              { l: L('Declare 118 cartons — the packing list is the most detailed', 'صرّح عن 118 كرتونة — قائمة التعبئة هي الأكثر تفصيلًا'), ok: false, fb: L('Then your declaration contradicts the manifest (120) — that triggers a discrepancy and possible penalty.', 'عندها يتعارض بيانك مع المانيفست (120) — مما يسبّب فرقًا وغرامة محتملة.') },
              { l: L('Declare 120 and say nothing', 'صرّح عن 120 ولا تقل شيئًا'), ok: false, fb: L('If customs inspects and finds the documents inconsistent, you are responsible.', 'إذا كشفت الجمارك ووجدت المستندات غير متطابقة، فأنت المسؤول.') },
            ] : [
              { l: L('Ask the Ministry of Agriculture (through the exporter) to correct the certificate to 15,600 kg before loading', 'اطلب من وزارة الزراعة (عبر المصدّر) تصحيح الشهادة إلى 15,600 كغ قبل التحميل'), ok: true },
              { l: L('Ship it — the German side will not check', 'اشحن — الجانب الألماني لن يتحقّق'), ok: false, fb: L('EU border control checks food documents; a mismatch can block the container in Hamburg.', 'الرقابة الحدودية الأوروبية تدقّق مستندات الأغذية؛ والفرق قد يوقف الحاوية في هامبورغ.') },
              { l: L('Change the invoice to 15,000 kg', 'غيّر الفاتورة إلى 15,000 كغ'), ok: false, fb: L('Never alter the invoice to match a wrong certificate.', 'لا تعدّل الفاتورة أبدًا لتطابق شهادة خاطئة.') },
            ],
            onSuccess: () => {
              const to = imp ? 'ops@huangpu-log.test' : s.parties.client.email;
              ctx.send({ to, subject: imp ? L('Packing list correction — ' + s.documents.bl.hblNo, 'تصحيح قائمة التعبئة — ' + s.documents.bl.hblNo) : L('Health certificate correction — ' + s.id, 'تصحيح الشهادة الصحية — ' + s.id), body: imp ? L('The packing list shows 118 cartons but the invoice and B/L show 120 (90 cartons of chairs). Please send a corrected, signed packing list today.', 'قائمة التعبئة تُظهر 118 كرتونة بينما الفاتورة والبوليصة 120 (90 كرتونة كراسي). يرجى إرسال قائمة تعبئة مصحّحة وموقّعة اليوم.') : L('The draft health certificate shows 15,000 kg net instead of 15,600 kg. Please have it corrected before loading.', 'مسودة الشهادة الصحية تُظهر 15,000 كغ صافيًا بدل 15,600 كغ. يرجى تصحيحها قبل التحميل.') });
              ctx.receive({ from: to, subject: imp ? L('Corrected packing list', 'قائمة تعبئة مصحّحة') : L('Corrected health certificate', 'شهادة صحية مصحّحة'), body: imp ? L('Apologies — typo. Corrected packing list attached: chairs 90 cartons, total 120 cartons, 8,400 kg.', 'نعتذر — خطأ طباعي. مرفق القائمة المصحّحة: الكراسي 90 كرتونة، المجموع 120 كرتونة، 8,400 كغ.') : L('Corrected certificate issued: net 15,600 kg.', 'صدرت الشهادة المصحّحة: صافي 15,600 كغ.'), attachments: [imp ? 'Packing_list_rev1.pdf' : 'Health_certificate_rev1.pdf'] }, 800);
              ctx.finish('cross');
            },
          });
        },
      },
    ],
    quiz: [
      { q: L('Who is responsible for the accuracy of the customs declaration?', 'من المسؤول عن صحة البيان الجمركي؟'), o: [L('The shipping line', 'الخط الملاحي'), L('The declarant (licensed broker) acting for the importer', 'المصرِّح (المخلّص المرخّص) العامل لصالح المستورد'), L('Nobody', 'لا أحد')], a: 1 },
      { q: L('The declaration must match…', 'يجب أن يطابق البيان…'), o: [L('Only the invoice', 'الفاتورة فقط'), L('Invoice, packing list, manifest/B/L and certificates', 'الفاتورة وقائمة التعبئة والمانيفست/البوليصة والشهادات')], a: 1 },
    ],
  });

  /* ============================================================ 2. CLASSIFICATION */
  CUS.steps.push({
    id: 'classify',
    title: L('Tariff classification (HS code)', 'التصنيف التعريفي (رمز HS)'),
    sub: L('Find the right code for each item — the code decides the duty, the licences and the statistics.', 'جد الرمز الصحيح لكل صنف — الرمز يحدّد الرسم والتراخيص والإحصاءات.'),
    lesson: () => t(L(`
<h3>How the HS works</h3>
<p>The Harmonized System has 21 sections, 97 chapters, 4-digit headings and 6-digit subheadings, used worldwide; Lebanon adds national digits. Classify with the <b>General Interpretative Rules</b>: first the wording of the heading and the section/chapter notes, then the most specific description.</p>
<h3>One invoice line ≠ one HS code</h3>
<p>Suppliers often put one HS code for the whole shipment. Customs classifies <b>each different item</b>. Dining tables are “other wooden furniture” (9403.60); chairs are <b>seats</b> — heading 9401, even if they are sold with the tables.</p>
<h3>Why it matters</h3>
<ul><li>The duty rate.</li><li>Licences and controls (some codes need ministry approval).</li><li>Preferential origin rules.</li><li>Penalties: a wrong code that lowers duty is an infraction even if it was the supplier’s code.</li></ul>
<p>When in doubt, ask customs for a <b>binding/advance ruling</b> or use the official explanatory notes.</p>`,
    `
<h3>كيف يعمل النظام المنسّق</h3>
<p>للنظام المنسّق 21 قسمًا و97 فصلًا وبنود من 4 أرقام وبنود فرعية من 6 أرقام، يُستعمل عالميًا؛ ويضيف لبنان أرقامًا وطنية. صنّف وفق <b>القواعد العامة للتفسير</b>: أولًا نص البند وملاحظات القسم/الفصل، ثم الوصف الأكثر تحديدًا.</p>
<h3>سطر فاتورة واحد ≠ رمز HS واحد</h3>
<p>يضع المورّدون غالبًا رمزًا واحدًا لكامل الشحنة. الجمارك تصنّف <b>كل صنف مختلف</b>. طاولات السفرة «أثاث خشبي آخر» (9403.60)؛ والكراسي <b>مقاعد</b> — البند 9401، حتى لو بيعت مع الطاولات.</p>
<h3>لماذا يهمّ</h3>
<ul><li>نسبة الرسم.</li><li>التراخيص والرقابة (بعض الرموز تحتاج موافقة وزارة).</li><li>قواعد المنشأ التفضيلي.</li><li>الغرامات: الرمز الخاطئ الذي يخفّض الرسم مخالفة حتى لو كان رمز المورّد.</li></ul>
<p>عند الشك، اطلب من الجمارك <b>قرارًا مسبقًا</b> أو استعمل الملاحظات التفسيرية الرسمية.</p>`)) + `<div class="note warn">${t(CUS.disclaimer)}</div>`,
    parts: [
      {
        id: 'hs', title: L('Classify each item', 'صنّف كل صنف'),
        render(ctx, b) {
          const d = ctx.d;
          const wrap = document.createElement('div');
          wrap.innerHTML = `<p>${t(L('Tariff extract (sample rates):', 'مقتطف من التعرفة (نسب نموذجية):'))}</p>` + ui().table(['HS', L('Description', 'الوصف'), { l: L('Duty %', 'الرسم %'), num: 1 }], CUS.tariff.map((x) => `<tr><td class="mono">${x.hs}</td><td>${esc(t(x.d))}</td><td class="num">${x.duty}</td></tr>`));
          b.appendChild(wrap);
          const f = document.createElement('div'); b.appendChild(f);
          ui().form(ctx, f, {
            key: 'hs', intro: L('The supplier/shipper wrote HS ' + d.items[0].hsGiven + ' for everything. Check it item by item.', 'كتب المورّد/الشاحن الرمز ' + d.items[0].hsGiven + ' لكل شيء. تحقّق صنفًا صنفًا.'),
            fields: d.items.map((x) => ({ k: x.id, label: (TS.lang === 'ar' ? x.descAr : x.desc) + ` (${x.qty} ${x.unit})`, type: 'select', options: tariffOpts(), ans: () => x.hs, full: true, fb: x.id === 'C' ? L('Chairs are seats: heading 9401. Wooden frame, not upholstered → 9401.69.', 'الكراسي مقاعد: البند 9401. هيكل خشبي غير منجّد ← 9401.69.') : x.id === 'H' ? L('Tahini is a prepared sesame seed product → 2008.19 (not sesame seeds 1207, not sesame oil 1515).', 'الطحينة منتج محضّر من بذور السمسم ← 2008.19 (ليست بذور 1207 ولا زيت 1515).') : L('Dining tables: other wooden furniture → 9403.60.', 'طاولات السفرة: أثاث خشبي آخر ← 9403.60.') })),
            onSuccess: () => { C(ctx.ship).items = d.items.map((x) => ({ id: x.id, hs: x.hs, rate: d.imp ? CUS.rateOf(x.hs) : 0 })); ctx.finish('hs'); },
          });
        },
        summary: (ctx) => `<p>✓ ${ctx.d.items.map((x) => `${esc(x.desc)} → <b class="mono">${x.hs}</b>`).join(' · ')}</p>`,
      },
      {
        id: 'why', title: L('Consequence of the supplier’s code', 'نتيجة رمز المورّد'),
        render(ctx, b) {
          const d = ctx.d;
          if (!d.imp) {
            ui().choice(ctx, b, { key: 'why', q: L('Lebanon charges no export duty here. Why must the export HS still be right?', 'لا يفرض لبنان رسم تصدير هنا. لماذا يجب أن يكون رمز التصدير صحيحًا؟'), options: [{ l: L('It must match the EUR.1/COO and the buyer’s import declaration in the EU, and feeds Lebanese trade statistics', 'يجب أن يطابق EUR.1/شهادة المنشأ وبيان الاستيراد لدى المشتري في أوروبا، ويغذّي إحصاءات التجارة اللبنانية'), ok: true }, { l: L('It does not matter for exports', 'لا يهمّ في التصدير'), ok: false }], onSuccess: () => ctx.finish('why') });
            return;
          }
          ui().form(ctx, b, {
            key: 'why', intro: L('Compare the duty if everything were declared under the supplier’s code with the duty under the correct codes (use the CIF values you will calculate in the next step: here we give them).', 'قارن الرسم لو صُرّح عن كل شيء برمز المورّد مع الرسم بالرموز الصحيحة (نعطيك هنا قيم CIF التي ستحسبها في المرحلة التالية).'),
            fields: [
              { k: 'cif', label: L('CIF of the chairs', 'CIF للكراسي'), unit: 'USD', ro: true, value: () => TS.num(d.items[1].cif) },
              { k: 'wrong', label: L('Duty on the chairs at 25% (supplier’s 9403.60)', 'الرسم على الكراسي بنسبة 25% (رمز المورّد 9403.60)'), unit: 'USD', type: 'number', tol: 1, ans: () => R(d.items[1].cif * 0.25) },
              { k: 'right', label: L('Duty on the chairs at 20% (correct 9401.69)', 'الرسم على الكراسي بنسبة 20% (الرمز الصحيح 9401.69)'), unit: 'USD', type: 'number', tol: 1, ans: () => R(d.items[1].cif * 0.2) },
            ],
            onSuccess: () => ctx.finish('why'),
          });
        },
      },
    ],
    quiz: [
      { q: L('A table and six chairs are invoiced as one “dining set”. How are they classified?', 'طاولة وستة كراسي مفوترة كـ«طقم سفرة» واحد. كيف تُصنَّف؟'), o: [L('One code for the set', 'رمز واحد للطقم'), L('Tables in 9403, chairs in 9401 — unless a specific rule says otherwise', 'الطاولات في 9403 والكراسي في 9401 — ما لم تنص قاعدة خاصة على غير ذلك')], a: 1 },
      { q: L('How many digits are internationally harmonised?', 'كم رقمًا موحّدًا دوليًا؟'), o: ['4', '6', '10'], a: 1 },
    ],
  });

  /* ============================================================ 3. VALUATION */
  CUS.steps.push({
    id: 'value',
    title: L('Customs value', 'القيمة الجمركية'),
    sub: L('Build the value customs will tax (import CIF) or record (export FOB).', 'احسب القيمة التي ستفرض عليها الجمارك الرسوم (CIF للاستيراد) أو تسجّلها (FOB للتصدير).'),
    lesson: () => t(L(`
<h3>Import: CIF value</h3>
<p>Customs value = price actually paid for the goods (invoice) + freight + insurance to the Lebanese port. For an <b>FOB</b> purchase, you add the freight and insurance the importer paid. For a <b>CIF</b> purchase, they are already in the price.</p>
<h3>Allocation</h3>
<p>When several items travel together, split freight and insurance between them in proportion to their invoice value (or weight, if more appropriate). Each item’s duty is calculated on its own CIF.</p>
<h3>Export: FOB value</h3>
<p>The export declaration records the value at the Lebanese border (FOB). If the sale is <b>CFR/CIF</b>, deduct the international freight (and insurance) included in the price.</p>
<h3>Conversion</h3>
<p>Values are converted into LBP at the official <b>customs exchange rate</b> in force on the declaration date.</p>`,
    `
<h3>الاستيراد: قيمة CIF</h3>
<p>القيمة الجمركية = الثمن المدفوع فعلًا للبضاعة (الفاتورة) + الشحن + التأمين حتى المرفأ اللبناني. في الشراء <b>FOB</b> تضيف الشحن والتأمين اللذين دفعهما المستورد. في الشراء <b>CIF</b> هما ضمن الثمن.</p>
<h3>التوزيع</h3>
<p>عندما تنتقل عدة أصناف معًا، وزّع الشحن والتأمين بينها بنسبة قيمة كل منها في الفاتورة (أو الوزن إذا كان أنسب). يُحسب رسم كل صنف على CIF الخاص به.</p>
<h3>التصدير: قيمة FOB</h3>
<p>يسجّل بيان التصدير القيمة عند الحدود اللبنانية (FOB). إذا كان البيع <b>CFR/CIF</b> اطرح الشحن الدولي (والتأمين) المضمّن في الثمن.</p>
<h3>التحويل</h3>
<p>تُحوَّل القيم إلى الليرة <b>بسعر الصرف الجمركي</b> الرسمي النافذ بتاريخ البيان.</p>`)),
    parts: [{
      id: 'calc', title: L('Calculate the value', 'احسب القيمة'),
      render(ctx, b) {
        const d = ctx.d;
        if (d.imp) {
          const [a, c] = d.items;
          ui().form(ctx, b, {
            key: 'val', intro: L(`FOB invoice USD ${TS.num(d.valTotal)} (tables ${TS.num(a.value)}, chairs ${TS.num(c.value)}). Freight paid to Beirut USD ${TS.num(d.freight)}, insurance USD ${TS.num(d.ins)}. Allocate by value. Customs rate (sample): LBP ${TS.num(CUS.RATE, 0)}/USD.`, `فاتورة FOB ${TS.num(d.valTotal)} دولار (طاولات ${TS.num(a.value)}، كراسي ${TS.num(c.value)}). الشحن المدفوع حتى بيروت ${TS.num(d.freight)}، التأمين ${TS.num(d.ins)}. وزّع بحسب القيمة. السعر الجمركي (مثال): ${TS.num(CUS.RATE, 0)} ليرة/دولار.`),
            fields: [
              { k: 'fa', label: L('Freight share — tables', 'حصة الشحن — الطاولات'), unit: 'USD', type: 'number', tol: 1, ans: () => a.freight },
              { k: 'fc', label: L('Freight share — chairs', 'حصة الشحن — الكراسي'), unit: 'USD', type: 'number', tol: 1, ans: () => c.freight },
              { k: 'ca', label: L('CIF — tables', 'CIF — الطاولات'), unit: 'USD', type: 'number', tol: 1.5, ans: () => a.cif },
              { k: 'cc', label: L('CIF — chairs', 'CIF — الكراسي'), unit: 'USD', type: 'number', tol: 1.5, ans: () => c.cif },
              { k: 'ct', label: L('Total CIF', 'مجموع CIF'), unit: 'USD', type: 'number', tol: 1, ans: () => d.cif },
              { k: 'cl', label: L('Total CIF in LBP', 'مجموع CIF بالليرة'), unit: 'LBP', type: 'number', tol: CUS.RATE * 2, ans: () => d.cifLBP },
            ],
            onSuccess: () => { C(ctx.ship).value = { basis: 'CIF', cif: d.cif, cifLBP: d.cifLBP, rate: CUS.RATE, items: d.items.map((x) => ({ id: x.id, value: x.value, freight: x.freight, ins: x.ins, cif: x.cif })) }; ctx.finish('calc'); },
          });
        } else {
          ui().form(ctx, b, {
            key: 'val', intro: L(`Invoice: USD ${TS.num(d.cfr)} CFR Hamburg. International freight included in the price (ocean freight & surcharges billed by us): USD ${TS.num(d.freightSold)}.`, `الفاتورة: ${TS.num(d.cfr)} دولار CFR هامبورغ. الشحن الدولي المضمّن في الثمن (الشحن والرسوم التي فوترناها): ${TS.num(d.freightSold)} دولار.`),
            fields: [
              { k: 'inc', label: L('Incoterm of the sale', 'شرط التسليم في البيع'), type: 'select', options: ['EXW', 'FOB', 'CFR', 'CIF', 'DAP'].map((v) => ({ v, l: v })), ans: () => 'CFR' },
              { k: 'fob', label: L('FOB value to declare', 'قيمة FOB للتصريح'), unit: 'USD', type: 'number', tol: 1, ans: () => d.fob, fb: L('FOB = CFR price − international freight.', 'FOB = ثمن CFR − الشحن الدولي.') },
              { k: 'lbp', label: L('FOB in LBP', 'FOB بالليرة'), unit: 'LBP', type: 'number', tol: CUS.RATE * 2, ans: () => d.fobLBP },
            ],
            onSuccess: () => { C(ctx.ship).value = { basis: 'FOB', fob: d.fob, fobLBP: d.fobLBP, rate: CUS.RATE, invoiceCFR: d.cfr, freightDeducted: d.freightSold }; ctx.finish('calc'); },
          });
        }
      },
    }],
    quiz: [
      { q: L('Goods bought CIF Beirut USD 10,000. Customs value?', 'بضاعة مشتراة CIF بيروت 10,000 دولار. القيمة الجمركية؟'), o: [L('10,000 + freight', '10,000 + الشحن'), L('10,000 (freight and insurance already included)', '10,000 (الشحن والتأمين مشمولان)')], a: 1 },
      { q: L('Two items, values 6,000 and 4,000; freight 1,000. Freight share of the first?', 'صنفان بقيمة 6,000 و4,000؛ الشحن 1,000. حصة الأول من الشحن؟'), o: ['500', '600', '400'], a: 1 },
    ],
  });

  /* ============================================================ 4. DUTIES & TAXES */
  CUS.steps.push({
    id: 'duties',
    title: L('Duties & taxes', 'الرسوم والضرائب'),
    sub: L('Calculate duty and import VAT item by item — or check what applies to an export.', 'احسب الرسم وضريبة الاستيراد صنفًا صنفًا — أو تحقّق مما ينطبق على التصدير.'),
    lesson: () => t(L(`
<h3>The calculation chain (import)</h3>
<ol><li>Customs duty = CIF × duty rate of the HS code.</li><li>Excise (only some goods).</li><li>VAT 11% = (CIF + duty + excise) × 11%.</li><li>Total to pay = duty + excise + VAT (+ fees).</li></ol>
<p>Preferential origin (GAFTA, EU, EFTA) can reduce the duty rate — only with a valid origin document. Goods from China pay the full rate.</p>
<h3>Who pays</h3>
<p>The importer, before release. If the forwarder pays on the importer’s behalf it is a <b>disbursement</b>: re-invoiced at cost, not revenue. The importer, if VAT-registered, recovers the import VAT as input VAT.</p>
<h3>Exports</h3>
<p>No export duty on this kind of goods. The exporter’s sale is zero-rated for VAT, supported by the export declaration and proof the goods left Lebanon.</p>`,
    `
<h3>سلسلة الحساب (استيراد)</h3>
<ol><li>الرسم الجمركي = CIF × نسبة رسم رمز HS.</li><li>رسم الاستهلاك (لبعض السلع فقط).</li><li>الضريبة 11% = (CIF + الرسم + الاستهلاك) × 11%.</li><li>المجموع المستحق = الرسم + الاستهلاك + الضريبة (+ الرسوم الإدارية).</li></ol>
<p>المنشأ التفضيلي (العربية، الأوروبية، EFTA) قد يخفّض نسبة الرسم — فقط مع مستند منشأ صالح. البضائع الصينية تدفع النسبة الكاملة.</p>
<h3>من يدفع</h3>
<p>المستورد، قبل الإفراج. إذا دفع وكيل الشحن نيابةً عنه فهي <b>سلفة</b>: تُعاد فوترتها بالكلفة، وليست إيرادًا. والمستورد المسجّل يستردّ ضريبة الاستيراد كضريبة مدخلات.</p>
<h3>الصادرات</h3>
<p>لا رسم تصدير على هذا النوع من البضائع. بيع المصدّر خاضع للمعدّل الصفري للضريبة، بدعم من بيان التصدير وإثبات خروج البضاعة من لبنان.</p>`)),
    parts: [{
      id: 'calc', title: L('Assessment', 'التصفية'),
      render(ctx, b) {
        const d = ctx.d;
        if (!d.imp) {
          ui().choice(ctx, b, {
            key: 'exp', multi: true, q: L('What applies to this Lebanese export?', 'ما الذي ينطبق على هذا التصدير اللبناني؟'),
            options: [
              { l: L('No export duty to pay', 'لا رسم تصدير'), ok: true },
              { l: L('The export declaration is still mandatory', 'بيان التصدير يبقى إلزاميًا'), ok: true },
              { l: L('The exporter’s sale is zero-rated for VAT; keep the proof of export', 'بيع المصدّر خاضع للمعدّل الصفري؛ احتفظ بإثبات التصدير'), ok: true },
              { l: L('The EUR.1 lets the German buyer pay reduced/zero EU duty', 'شهادة EUR.1 تسمح للمشتري الألماني بدفع رسم أوروبي مخفّض/صفر'), ok: true },
              { l: L('The exporter pays 11% VAT on the export value', 'يدفع المصدّر 11% على قيمة التصدير'), ok: false },
            ],
            onSuccess: () => { C(ctx.ship).taxes = { duty: 0, vat: 0, total: 0, note: 'Export — no duty, VAT zero-rated' }; ctx.finish('calc'); },
          });
          return;
        }
        const [a, c] = d.items;
        ui().form(ctx, b, {
          key: 'tax', intro: L(`CIF tables ${TS.num(a.cif)} (HS ${a.hs}, ${a.rate}%) · CIF chairs ${TS.num(c.cif)} (HS ${c.hs}, ${c.rate}%) · origin China, no preference.`, `CIF الطاولات ${TS.num(a.cif)} (${a.hs}، ${a.rate}%) · CIF الكراسي ${TS.num(c.cif)} (${c.hs}، ${c.rate}%) · المنشأ الصين، بدون تفضيل.`),
          fields: [
            { k: 'da', label: L('Duty — tables', 'الرسم — الطاولات'), unit: 'USD', type: 'number', tol: 1, ans: () => a.duty },
            { k: 'dc', label: L('Duty — chairs', 'الرسم — الكراسي'), unit: 'USD', type: 'number', tol: 1, ans: () => c.duty },
            { k: 'vb', label: L('VAT base (CIF + duty)', 'أساس الضريبة (CIF + الرسم)'), unit: 'USD', type: 'number', tol: 2, ans: () => d.vatBase },
            { k: 'vat', label: L('Import VAT 11%', 'ضريبة الاستيراد 11%'), unit: 'USD', type: 'number', tol: 1, ans: () => d.vat },
            { k: 'tot', label: L('Total duties & taxes', 'مجموع الرسوم والضرائب'), unit: 'USD', type: 'number', tol: 2, ans: () => d.taxes },
            { k: 'lbp', label: L('Total in LBP', 'المجموع بالليرة'), unit: 'LBP', type: 'number', tol: CUS.RATE * 3, ans: () => d.taxesLBP },
          ],
          onSuccess: () => { C(ctx.ship).taxes = { duty: d.duty, vat: d.vat, total: d.taxes, totalLBP: d.taxesLBP, items: d.items.map((x) => ({ id: x.id, hs: x.hs, rate: x.rate, cif: x.cif, duty: x.duty, vat: x.vat })) }; ctx.finish('calc'); },
        });
      },
      summary: (ctx) => (ctx.d.imp ? `<p>✓ ${t(L('Duty', 'الرسم'))} ${usd(ctx.d.duty)} + VAT ${usd(ctx.d.vat)} = <b>${usd(ctx.d.taxes)}</b> (LBP ${TS.num(ctx.d.taxesLBP, 0)})</p>` : `<p>✓ ${t(L('Export: no duty, VAT zero-rated.', 'تصدير: لا رسم، ضريبة بمعدّل صفري.'))}</p>`),
    }],
    quiz: [
      { q: L('CIF 10,000, duty 20%. Import VAT 11%?', 'CIF 10,000، الرسم 20%. ضريبة الاستيراد 11%؟'), o: ['1,100', '1,320', '2,000'], a: 1, e: L('(10,000 + 2,000) × 11% = 1,320.', '(10,000 + 2,000) × 11% = 1,320.') },
      { q: L('The forwarder pays the duties for the client. In its books this is…', 'يدفع وكيل الشحن الرسوم عن الزبون. في دفاتره هذا…'), o: [L('Revenue', 'إيراد'), L('A disbursement re-invoiced at cost', 'سلفة تُعاد فوترتها بالكلفة')], a: 1 },
    ],
  });

  /* ============================================================ 5. DECLARATION */
  CUS.steps.push({
    id: 'declare',
    title: L('Prepare the customs declaration', 'تحضير البيان الجمركي'),
    sub: L('Fill the declaration as you would in NAJM — header, transport and items.', 'املأ البيان كما في نظام نجم — المعلومات العامة والنقل والأصناف.'),
    lesson: () => t(L(`
<h3>Structure of a declaration</h3>
<ul><li><b>Regime</b>: definitive import, export, temporary admission, transit, free zone, re-export.</li><li><b>Parties</b>: declarant (broker licence), importer/exporter with registration numbers, consignor/consignee.</li><li><b>Transport</b>: mode, vessel/voyage, B/L and manifest reference, container and seal.</li><li><b>Countries</b>: origin (where made) and consignment (where shipped from) — not always the same.</li><li><b>Items</b>: HS code, description, packages, gross/net weight, value, origin, preference requested.</li><li><b>Documents</b> attached, each with its reference.</li></ul>
<p>The manifest reference is the <b>B/L as filed by the line</b> (the master B/L when a forwarder is the consignee on the MBL).</p>`,
    `
<h3>بنية البيان</h3>
<ul><li><b>النظام</b>: استيراد نهائي، تصدير، إدخال مؤقت، ترانزيت، منطقة حرة، إعادة تصدير.</li><li><b>الأطراف</b>: المصرِّح (رخصة المخلّص)، المستورد/المصدّر مع أرقام التسجيل، المرسل/المرسل إليه.</li><li><b>النقل</b>: الوسيلة، الباخرة/الرحلة، مرجع البوليصة والمانيفست، الحاوية والختم.</li><li><b>البلدان</b>: المنشأ (حيث صُنعت) وبلد الإرسال (حيث شُحنت منه) — ليسا دائمًا نفسهما.</li><li><b>الأصناف</b>: رمز HS، الوصف، الطرود، الوزن القائم/الصافي، القيمة، المنشأ، التفضيل المطلوب.</li><li><b>المستندات</b> المرفقة، كل منها بمرجعه.</li></ul>
<p>مرجع المانيفست هو <b>البوليصة كما قدّمها الخط</b> (البوليصة الرئيسية عندما يكون وكيل الشحن هو المرسل إليه في MBL).</p>`)),
    parts: [{
      id: 'form', title: L('Declaration form', 'نموذج البيان'),
      render(ctx, b) {
        const s = ctx.ship, d = ctx.d;
        const party = d.imp ? s.parties.consignee : s.parties.shipper;
        ui().form(ctx, b, {
          key: 'decl', submit: L('Validate declaration', 'تحقّق من البيان'),
          fields: [
            { k: 'reg', label: L('Customs regime', 'النظام الجمركي'), type: 'select', options: CUS.regimes, ans: () => d.regime, full: true },
            { k: 'dec', label: L('Declarant', 'المصرِّح'), ro: true, value: () => CUS.company.licence },
            { k: 'party', label: d.imp ? L('Importer', 'المستورد') : L('Exporter', 'المصدّر'), contains: [party.name.split(' ')[0]], ans: () => party.name },
            { k: 'regno', label: L('Registration / VAT no.', 'رقم التسجيل / الضريبي'), contains: [String(party.reg || '').split('VAT ')[1] || party.name], ans: () => (party.reg || '').split('— ')[1] || party.reg, help: L('From the client’s registration in the file.', 'من تسجيل الزبون في الملف.') },
            { k: 'orig', label: L('Country of origin', 'بلد المنشأ'), type: 'select', options: CUS.countries, ans: () => d.origin },
            { k: 'cons', label: L('Country of consignment', 'بلد الإرسال'), type: 'select', options: CUS.countries, ans: () => d.consigned, fb: L('The country the goods were shipped from — not the transshipment port.', 'البلد الذي شُحنت منه البضاعة — وليس مرفأ المسافنة.') },
            { k: 'bl', label: L('B/L (manifest reference)', 'البوليصة (مرجع المانيفست)'), ans: () => s.documents.bl.mblNo },
            { k: 'cn', label: L('Container no.', 'رقم الحاوية'), ans: () => s.equipment.containerNo },
            { k: 'pk', label: L('Total packages', 'مجموع الطرود'), type: 'number', ans: () => d.pkgs },
            { k: 'gw', label: L('Total gross weight', 'الوزن القائم الكلي'), unit: 'kg', type: 'number', ans: () => d.gross },
            { k: 'nw', label: L('Total net weight', 'الوزن الصافي الكلي'), unit: 'kg', type: 'number', ans: () => d.net },
            { k: 'items', label: L('Number of items (HS lines)', 'عدد الأصناف (أسطر HS)'), type: 'number', ans: () => d.items.length },
            { k: 'val', label: d.imp ? L('Total CIF value', 'مجموع قيمة CIF') : L('Total FOB value', 'مجموع قيمة FOB'), unit: 'USD', type: 'number', tol: 1, ans: () => (d.imp ? d.cif : d.fob) },
            { k: 'pref', label: L('Preference requested', 'التفضيل المطلوب'), type: 'select', options: CUS.prefs, ans: () => d.pref, fb: d.imp ? L('China has no trade agreement with Lebanon: no preference.', 'لا اتفاقية تجارية بين الصين ولبنان: لا تفضيل.') : L('Export to the EU with EUR.1.', 'تصدير إلى الاتحاد الأوروبي مع EUR.1.') },
          ],
          onSuccess: (v) => { C(s).declaration = Object.assign({ no: null, status: 'prepared' }, v, { items: d.items.map((x) => ({ id: x.id, hs: x.hs, desc: x.desc, pkgs: x.pkgs, gross: x.gross, net: x.net, value: d.imp ? x.cif : x.fob })) }); ctx.finish('form'); },
        });
      },
    }],
    quiz: [
      { q: L('Furniture made in China, shipped from Shanghai, transshipped at Port Said. Country of consignment?', 'أثاث مصنوع في الصين، شُحن من شنغهاي، ومرّ بمسافنة في بورسعيد. بلد الإرسال؟'), o: [L('Egypt', 'مصر'), L('China', 'الصين')], a: 1 },
      { q: L('Which regime for goods entering Lebanon to be sold on the local market?', 'أي نظام لبضائع تدخل لبنان لتُباع في السوق المحلي؟'), o: [L('Transit', 'ترانزيت'), L('Definitive import for home use', 'استيراد نهائي للاستهلاك المحلي'), L('Temporary admission', 'إدخال مؤقت')], a: 1 },
    ],
  });

  /* ============================================================ 6. LODGE & LANE */
  CUS.steps.push({
    id: 'lane',
    title: L('Lodge in NAJM & the inspection lane', 'التقديم على نجم ومسار الكشف'),
    sub: L('Submit the declaration, receive the risk lane and answer the customs officer correctly.', 'قدّم البيان، استلم مسار المخاطر وأجب موظف الجمارك بالشكل الصحيح.'),
    lesson: () => t(L(`
<h3>Risk lanes</h3>
<table><tr><th>Lane</th><th>Meaning</th><th>What you do</th></tr>
<tr><td>🟢 Green</td><td>Release without document check or inspection</td><td>Pay (if import) and collect the release</td></tr>
<tr><td>🟡 Yellow</td><td>Documentary check</td><td>Provide the documents the officer asks for, answer queries</td></tr>
<tr><td>🔴 Red</td><td>Physical inspection (and/or scanner)</td><td>Book the inspection, attend with the importer, have the container opened</td></tr></table>
<h3>Integrity</h3>
<p>Never offer money or gifts to speed up clearance: it is a crime under Lebanese law and exposes you, your company and your client. Answer with documents; escalate through the official procedure if there is a delay.</p>`,
    `
<h3>مسارات المخاطر</h3>
<table><tr><th>المسار</th><th>المعنى</th><th>ماذا تفعل</th></tr>
<tr><td>🟢 الأخضر</td><td>إفراج بدون تدقيق مستندات أو كشف</td><td>ادفع (في الاستيراد) واستلم الإفراج</td></tr>
<tr><td>🟡 الأصفر</td><td>تدقيق مستندات</td><td>قدّم المستندات التي يطلبها الموظف وأجب على الاستفسارات</td></tr>
<tr><td>🔴 الأحمر</td><td>كشف حسّي (و/أو بالأشعة)</td><td>احجز موعد الكشف، احضر مع المستورد، وافتح الحاوية</td></tr></table>
<h3>النزاهة</h3>
<p>لا تعرض أبدًا مالًا أو هدايا لتسريع التخليص: إنها جريمة في القانون اللبناني وتعرّضك وشركتك وزبونك للخطر. أجب بالمستندات، واعترض عبر الإجراء الرسمي إذا حصل تأخير.</p>`)),
    parts: [
      {
        id: 'lodge', title: L('Lodge the declaration', 'قدّم البيان'),
        render(ctx, b) {
          const s = ctx.ship, d = ctx.d;
          if (ctx.data.waiting) { b.innerHTML = `<p class="muted">⏳ ${t(L('Lodged — waiting for NAJM to assign the lane…', 'قُدّم — بانتظار تحديد المسار من نجم…'))}</p>`; return; }
          b.innerHTML = `<p>${t(L('Everything is checked. Submit the declaration electronically.', 'تم التحقّق من كل شيء. قدّم البيان إلكترونيًا.'))}</p><button class="btn primary" id="go">${t(L('Submit to NAJM', 'قدّم إلى نجم'))} ⇪</button>`;
          b.querySelector('#go').onclick = () => {
            ctx.advance(d.lodge); ctx.data.waiting = true;
            C(s).declaration.no = d.declNo; C(s).declaration.status = 'lodged'; C(s).declaration.lodged = d.lodge;
            ctx.receive({ from: 'najm@customs-training.test', subject: L('NAJM — declaration ' + d.declNo + ' registered — lane ' + d.lane.toUpperCase(), 'نجم — البيان ' + d.declNo + ' مسجّل — المسار ' + (d.lane === 'green' ? 'الأخضر' : 'الأصفر')), body: d.lane === 'green' ? L(`Declaration ${d.declNo} registered on ${TS.fmtDate(d.lodge)}.\nRisk lane: GREEN — release without inspection.\n(Simulated NAJM message.)`, `البيان ${d.declNo} مسجّل بتاريخ ${TS.fmtDate(d.lodge)}.\nمسار المخاطر: الأخضر — إفراج بدون كشف.\n(رسالة محاكاة من نجم.)`) : L(`Declaration ${d.declNo} registered on ${TS.fmtDate(d.lodge)}.\nRisk lane: YELLOW — documentary check.\nOfficer’s request: present the importer’s commercial registration certificate valid for the current year and the original certificate of origin.\n(Simulated NAJM message.)`, `البيان ${d.declNo} مسجّل بتاريخ ${TS.fmtDate(d.lodge)}.\nمسار المخاطر: الأصفر — تدقيق مستندات.\nطلب الموظف: تقديم شهادة السجل التجاري للمستورد الصالحة للسنة الحالية وشهادة المنشأ الأصلية.\n(رسالة محاكاة من نجم.)`), onArrive: (sh) => { const w = sh.customs.work.lane; w.data.waiting = false; w.parts.lodge = true; sh.customs.declaration.lane = CUS.d(sh).lane; } }, 1200);
            ctx.save(); ctx.rerender();
          };
        },
        summary: (ctx) => `<p>✓ ${esc(ctx.d.declNo)} — ${t(L('lane', 'المسار'))}: <b>${ctx.d.lane === 'green' ? '🟢 ' + t(L('GREEN', 'الأخضر')) : '🟡 ' + t(L('YELLOW', 'الأصفر'))}</b></p>`,
      },
      {
        id: 'answer', title: L('Respond to customs', 'الردّ على الجمارك'),
        render(ctx, b) {
          const d = ctx.d;
          if (d.lane === 'green') {
            ui().choice(ctx, b, { key: 'gr', q: L('Your export is GREEN. What does that mean?', 'تصديرك في المسار الأخضر. ماذا يعني ذلك؟'), options: [{ l: L('Released without document check or inspection — the container can be loaded', 'إفراج بدون تدقيق أو كشف — يمكن تحميل الحاوية'), ok: true }, { l: L('Customs will open the container', 'ستفتح الجمارك الحاوية'), ok: false, fb: L('That is the red lane.', 'هذا هو المسار الأحمر.') }, { l: L('The declaration is cancelled', 'أُلغي البيان'), ok: false }], onSuccess: () => ctx.finish('answer') });
            return;
          }
          ui().choice(ctx, b, {
            key: 'yl', q: L('The officer asks for the importer’s current-year registration certificate and the original COO. What do you do?', 'يطلب الموظف شهادة تسجيل المستورد للسنة الحالية وشهادة المنشأ الأصلية. ماذا تفعل؟'),
            options: [
              { l: L('Get the renewed certificate from the client today, submit it with the original COO through NAJM / at the counter, and follow up', 'احصل على الشهادة المجدّدة من الزبون اليوم، وقدّمها مع شهادة المنشأ الأصلية عبر نجم / على الشبّاك، وتابع'), ok: true },
              { l: L('Offer the officer a “tip” to skip the request', 'اعرض على الموظف «إكرامية» لتجاوز الطلب'), ok: false, fb: L('Bribery is a crime — never.', 'الرشوة جريمة — أبدًا.') },
              { l: L('Wait until the officer forgets', 'انتظر حتى ينسى الموظف'), ok: false, fb: L('Port storage and demurrage keep running.', 'التخزين في المرفأ والغرامات تستمر.') },
            ],
            onSuccess: () => {
              ctx.send({ to: ctx.ship.parties.client.email, subject: L('URGENT — customs request ' + d.declNo, 'عاجل — طلب الجمارك ' + d.declNo), body: L('Customs (yellow lane) asks for your commercial registration certificate valid for this year and the original certificate of origin. Please send them today to avoid storage and demurrage.', 'تطلب الجمارك (المسار الأصفر) شهادة سجلكم التجاري الصالحة لهذه السنة وشهادة المنشأ الأصلية. يرجى إرسالها اليوم لتفادي التخزين والغرامات.') });
              ctx.receive({ from: ctx.ship.parties.client.email, subject: L('Documents for customs', 'مستندات للجمارك'), body: L('Renewed registration certificate attached; the original COO is with our driver, arriving at your office in one hour.', 'مرفقة الشهادة المجدّدة؛ شهادة المنشأ الأصلية مع سائقنا، تصل إلى مكتبكم خلال ساعة.'), attachments: ['CR_certificate_2026.pdf'] }, 700);
              ctx.finish('answer');
            },
          });
        },
      },
    ],
    quiz: [
      { q: L('Red lane means…', 'المسار الأحمر يعني…'), o: [L('Release without control', 'إفراج بدون رقابة'), L('Physical inspection', 'كشف حسّي'), L('Document check only', 'تدقيق مستندات فقط')], a: 1 },
      { q: L('An officer hints that a payment would speed things up. You…', 'يلمّح موظف أن دفعة ستسرّع الأمور. أنت…'), o: [L('Pay a little', 'تدفع قليلًا'), L('Refuse, answer with documents and use the official escalation', 'ترفض، وتجيب بالمستندات وتستعمل التظلّم الرسمي')], a: 1 },
    ],
  });

  /* ============================================================ 7. PAYMENT & RELEASE */
  CUS.steps.push({
    id: 'release',
    title: L('Payment & customs release', 'الدفع والإفراج الجمركي'),
    sub: L('Pay the assessed taxes, get the release and get the goods out (import) or on board (export).', 'ادفع الضرائب المصفّاة، احصل على الإفراج وأخرج البضاعة (استيراد) أو حمّلها (تصدير).'),
    lesson: () => t(L(`
<h3>Import sequence in Beirut</h3>
<ol><li>Line’s D/O obtained (charges + deposit paid).</li><li>Declaration lodged in NAJM.</li><li>Lane: document check / inspection if selected.</li><li>Assessment: duties & VAT calculated and paid (bank receipt).</li><li>Customs release (exit authorisation).</li><li>Port/terminal charges paid, container gate-out, delivery.</li></ol>
<h3>Export sequence</h3>
<ol><li>Export declaration lodged.</li><li>Lane & release.</li><li>Loading permission to the terminal / gate-in.</li><li>Loaded on board — the line confirms.</li><li>Proof of export kept (declaration + B/L) for VAT zero-rating and the bank (CAD).</li></ol>`,
    `
<h3>تسلسل الاستيراد في بيروت</h3>
<ol><li>الحصول على إذن التسليم من الخط (دفع الرسوم + التأمين).</li><li>تقديم البيان على نجم.</li><li>المسار: تدقيق المستندات / الكشف إذا اختير.</li><li>التصفية: احتساب الرسوم والضريبة ودفعها (إيصال مصرفي).</li><li>الإفراج الجمركي (إذن الخروج).</li><li>دفع رسوم المرفأ/المحطة، خروج الحاوية، التسليم.</li></ol>
<h3>تسلسل التصدير</h3>
<ol><li>تقديم بيان التصدير.</li><li>المسار والإفراج.</li><li>إذن التحميل للمحطة / الدخول.</li><li>التحميل على الباخرة — يؤكّد الخط.</li><li>حفظ إثبات التصدير (البيان + البوليصة) للمعدّل الصفري للضريبة وللمصرف (CAD).</li></ol>`)) + LB('Import duties and VAT are paid to the Treasury (bank receipt) before release; the release, the D/O and the terminal’s gate pass are needed to take the container out of Beirut port.', 'تُدفع الرسوم والضريبة للخزينة (إيصال مصرفي) قبل الإفراج؛ والإفراج وإذن التسليم وإذن خروج المحطة ضرورية لإخراج الحاوية من مرفأ بيروت.'),
    parts: [
      {
        id: 'seq', title: L('Put the steps in order', 'رتّب الخطوات'),
        render(ctx, b) {
          const d = ctx.d;
          const steps = d.imp
            ? [L('D/O from the line', 'إذن التسليم من الخط'), L('Declaration lodged in NAJM', 'تقديم البيان على نجم'), L('Lane / document check', 'المسار / تدقيق المستندات'), L('Duties & VAT paid', 'دفع الرسوم والضريبة'), L('Customs release', 'الإفراج الجمركي'), L('Terminal gate-out & delivery', 'خروج الحاوية من المحطة والتسليم')]
            : [L('Export declaration lodged', 'تقديم بيان التصدير'), L('Lane & release', 'المسار والإفراج'), L('Gate-in / loading permission', 'الدخول / إذن التحميل'), L('Loaded on board', 'التحميل على الباخرة'), L('Proof of export filed', 'حفظ إثبات التصدير')];
          const order = steps.map((_, i) => i).sort((x, y) => ((x * 7 + 3) % steps.length) - ((y * 7 + 3) % steps.length));
          ctx.data.seq = ctx.data.seq || order.map(() => '');
          b.innerHTML = `<p>${t(L('Number the steps (1 = first).', 'رقّم الخطوات (1 = الأولى).'))}</p>${order.map((i, pos) => `<div class="row" style="margin-bottom:6px"><select data-p="${pos}" style="width:80px"><option value="">—</option>${steps.map((_, n) => `<option ${String(ctx.data.seq[pos]) === String(n + 1) ? 'selected' : ''}>${n + 1}</option>`).join('')}</select><span>${t(steps[i])}</span></div>`).join('')}<div class="row"><button class="btn primary" data-act="check">${t(L('Check', 'تحقّق'))}</button><button class="btn ghost" data-act="answer">${t(L('Show me the answer', 'أرني الجواب'))}</button></div>`;
          b.querySelectorAll('[data-p]').forEach((sel) => (sel.onchange = () => { ctx.data.seq[Number(sel.dataset.p)] = sel.value; ctx.save(); }));
          b.querySelector('[data-act=answer]').onclick = () => { ctx.hint(); ctx.data.seq = order.map((i) => i + 1); ctx.save(); ctx.rerender(); };
          b.querySelector('[data-act=check]').onclick = () => {
            if (!order.every((i, pos) => Number(ctx.data.seq[pos]) === i + 1)) { ctx.mistake(); TS.toast(t(L('Not the right order', 'الترتيب غير صحيح')), 'bad'); return; }
            ctx.finish('seq');
          };
        },
      },
      {
        id: 'pay', title: (s) => (s.direction === 'import' ? L('Pay duties & VAT, collect the release', 'ادفع الرسوم والضريبة واستلم الإفراج') : L('Release & loading', 'الإفراج والتحميل')),
        render(ctx, b) {
          const s = ctx.ship, d = ctx.d;
          if (!d.imp) {
            ui().form(ctx, b, {
              key: 'exrel', fields: [
                { k: 'no', label: L('Declaration no.', 'رقم البيان'), ans: () => d.declNo },
                { k: 'rel', label: L('Release date', 'تاريخ الإفراج'), type: 'date', ans: () => d.release },
                { k: 'gate', label: L('Gate-in date at the terminal', 'تاريخ الدخول إلى المحطة'), type: 'date', ans: () => s.equipment.gateIn },
                { k: 'proof', label: L('Proof of export to keep', 'إثبات التصدير الواجب حفظه'), type: 'select', options: [{ v: 'decl_bl', l: L('Export declaration + shipped-on-board B/L', 'بيان التصدير + بوليصة «شُحن على متن»') }, { v: 'invoice', l: L('Commercial invoice only', 'الفاتورة التجارية فقط') }], ans: () => 'decl_bl' },
              ],
              onSuccess: () => { ctx.advance(s.equipment.gateIn); C(s).release = { date: d.release, gateIn: s.equipment.gateIn, proof: 'Export declaration + B/L ' + s.documents.bl.mblNo }; ctx.finish('pay'); },
            });
            return;
          }
          if (ctx.data.waiting) { b.innerHTML = `<p class="muted">⏳ ${t(L('Payment receipt submitted — waiting for release…', 'قُدّم إيصال الدفع — بانتظار الإفراج…'))}</p>`; return; }
          ui().form(ctx, b, {
            key: 'pay', submit: L('Confirm payment & request release', 'أكّد الدفع واطلب الإفراج'),
            fields: [
              { k: 'amt', label: L('Amount to pay to the Treasury', 'المبلغ الواجب دفعه للخزينة'), unit: 'USD', type: 'number', tol: 2, ans: () => d.taxes },
              { k: 'lbp', label: L('Equivalent in LBP', 'ما يعادله بالليرة'), unit: 'LBP', type: 'number', tol: CUS.RATE * 3, ans: () => d.taxesLBP },
              { k: 'who', label: L('Paid by', 'يدفعها'), type: 'select', options: [{ v: 'importer', l: L('The importer (directly at the bank)', 'المستورد (مباشرة في المصرف)') }, { v: 'us', l: L('Our company, as revenue', 'شركتنا، كإيراد') }], ans: () => 'importer' },
            ],
            onSuccess: (v) => {
              ctx.data.waiting = true;
              C(s).payment = { amount: v.amt, lbp: v.lbp, paidBy: 'importer', receipt: 'TR-' + (d.seed % 900000 + 100000) };
              ctx.receive({ from: 'najm@customs-training.test', subject: L('NAJM — release ' + d.declNo, 'نجم — إفراج ' + d.declNo), body: L(`Payment receipt ${C(s).payment.receipt} matched. Declaration ${d.declNo} RELEASED on ${TS.fmtDate(d.release)}. Container ${s.equipment.containerNo} may exit Beirut port with the D/O ${s.release.doNo} and the terminal gate pass.\n(Simulated.)`, `تمت مطابقة إيصال الدفع ${C(s).payment.receipt}. البيان ${d.declNo} أُفرج عنه بتاريخ ${TS.fmtDate(d.release)}. يمكن للحاوية ${s.equipment.containerNo} الخروج من مرفأ بيروت مع إذن التسليم ${s.release.doNo} وإذن خروج المحطة.\n(محاكاة.)`), onArrive: (sh) => { const w = sh.customs.work.release; w.data.waiting = false; w.parts.pay = true; sh.customs.release = { date: CUS.d(sh).release }; sh.customs.today = CUS.d(sh).release; } }, 1200);
              ctx.save(); ctx.rerender();
            },
          });
        },
        summary: (ctx) => `<p>✓ ${t(L('Released on', 'أُفرج عنها بتاريخ'))} ${TS.fmtDate(ctx.d.release)} — ${esc(ctx.d.declNo)}</p>`,
      },
    ],
    quiz: [
      { q: L('Can the container leave Beirut port before the customs release?', 'هل يمكن للحاوية مغادرة مرفأ بيروت قبل الإفراج الجمركي؟'), o: [L('Yes, with the D/O', 'نعم، مع إذن التسليم'), L('No', 'لا')], a: 1 },
      { q: L('Why keep the proof of export?', 'لماذا تحفظ إثبات التصدير؟'), o: [L('To justify VAT zero-rating and for the bank documents', 'لتبرير المعدّل الصفري للضريبة ولمستندات المصرف'), L('It is not needed', 'غير ضروري')], a: 0 },
    ],
  });

  /* ============================================================ 8. CLOSE */
  CUS.steps.push({
    id: 'close',
    title: L('Close the customs file & hand over', 'إقفال ملف الجمارك والتسليم'),
    sub: L('Archive the declaration and pass the results to Operations and Accounting.', 'أرشف البيان ومرّر النتائج إلى العمليات والمحاسبة.'),
    lesson: () => t(L(`
<h3>After release</h3>
<ul><li>Archive the declaration, assessment, payment receipt, release and all supporting documents — customs can audit after release (post-clearance audit) and records must be kept for years.</li><li>Tell Operations the release date (to plan delivery and limit demurrage).</li><li>Tell Accounting what to invoice: the broker fee (revenue, with VAT) and any duties/VAT paid on the client’s behalf (disbursement, at cost).</li></ul>`,
    `
<h3>بعد الإفراج</h3>
<ul><li>أرشف البيان والتصفية وإيصال الدفع والإفراج وكل المستندات الثبوتية — يمكن للجمارك التدقيق بعد الإفراج، ويجب حفظ السجلات لسنوات.</li><li>أبلغ العمليات بتاريخ الإفراج (لتخطيط التسليم والحدّ من الغرامات).</li><li>أبلغ المحاسبة بما يجب فوترته: أتعاب المخلّص (إيراد، مع الضريبة) وأي رسوم/ضريبة دُفعت عن الزبون (سلفة، بالكلفة).</li></ul>`)),
    parts: [
      {
        id: 'acc', title: L('What goes to Accounting?', 'ماذا يذهب إلى المحاسبة؟'),
        render(ctx, b) {
          const d = ctx.d;
          ui().choice(ctx, b, {
            key: 'acc', multi: true, q: L('Select the correct statements.', 'اختر العبارات الصحيحة.'),
            options: [
              { l: L('Our clearance fee is revenue and carries VAT 11%', 'أتعاب التخليص إيراد وتخضع لضريبة 11%'), ok: true },
              { l: d.imp ? L('The duties & VAT were paid by the importer directly — nothing to invoice for them', 'دفع المستورد الرسوم والضريبة مباشرة — لا شيء لفوترته عنها') : L('No duties were paid on this export', 'لم تُدفع رسوم على هذا التصدير'), ok: true },
              { l: L('Duties paid on behalf of a client are our revenue', 'الرسوم المدفوعة عن الزبون إيراد لنا'), ok: false, fb: L('They are disbursements, re-invoiced at cost.', 'إنها سُلف تُعاد فوترتها بالكلفة.') },
            ],
            onSuccess: () => ctx.finish('acc'),
          });
        },
      },
      {
        id: 'close', title: L('Close the file', 'أقفل الملف'),
        render(ctx, b) {
          const s = ctx.ship, d = ctx.d;
          b.innerHTML = `<p>${t(L('Closing writes the customs result into the shipment JSON (declaration, value, taxes, lane, release) and marks the hand-off closed.', 'الإقفال يكتب نتيجة الجمارك في ملف JSON (البيان، القيمة، الضرائب، المسار، الإفراج) ويسجّل التسليم كمقفل.'))}</p><button class="btn primary" id="go">${t(L('Close customs file', 'أقفل ملف الجمارك'))} ✓</button>`;
          b.querySelector('#go').onclick = () => {
            const h = CUS.handoff(s);
            C(s).result = { declarationNo: d.declNo, regime: d.regime, lane: d.lane, value: d.imp ? { cif: d.cif, cifLBP: d.cifLBP } : { fob: d.fob, fobLBP: d.fobLBP }, taxes: d.imp ? { duty: d.duty, vat: d.vat, total: d.taxes, totalLBP: d.taxesLBP, paidBy: 'importer' } : { total: 0 }, releasedOn: d.release, items: d.items.map((x) => ({ hs: x.hs, desc: x.desc, value: d.imp ? x.cif : x.fob, duty: x.duty || 0 })) };
            h.status = 'closed (customs)'; h.closedAt = new Date().toISOString(); h.result = C(s).result;
            ctx.send({ to: 'ops@phoenicia-freight.test; accounting@phoenicia-freight.test', subject: L('Customs closed — ' + d.declNo, 'إقفال الجمارك — ' + d.declNo), body: L(`Declaration ${d.declNo} released ${TS.fmtDate(d.release)}, lane ${d.lane}. ${d.imp ? 'Duties ' + usd(d.duty) + ' + VAT ' + usd(d.vat) + ' paid by the importer.' : 'Export, no duty.'} Clearance fee to invoice as per quotation.`, `البيان ${d.declNo} أُفرج عنه ${TS.fmtDate(d.release)}، المسار ${d.lane}. ${d.imp ? 'الرسوم ' + TS.num(d.duty) + ' + الضريبة ' + TS.num(d.vat) + ' دفعها المستورد.' : 'تصدير، لا رسوم.'} أتعاب التخليص تُفوتر حسب العرض.`) });
            ctx.finish('close');
          };
        },
        summary: (ctx) => {
          const sc = C(ctx.ship).score, score = Math.max(0, 100 - sc.mistakes * 2 - sc.hints * 3);
          return `<div class="note ok"><strong>🎓 ${t(L('Customs file closed!', 'أُقفل ملف الجمارك!'))}</strong>${t(L('Mistakes', 'الأخطاء'))}: ${sc.mistakes} · ${t(L('Answers shown', 'إجابات معروضة'))}: ${sc.hints} · <b>${t(L('Score', 'النتيجة'))}: ${score}/100</b></div><button class="btn primary" onclick="TS.downloadJSON(CUS.app.ship)">⬇ ${esc(ctx.ship.id)}.json</button>`;
        },
      },
    ],
    quiz: [
      { q: L('Can customs check a declaration after the goods are released?', 'هل يمكن للجمارك تدقيق البيان بعد الإفراج؟'), o: [L('No, release is final', 'لا، الإفراج نهائي'), L('Yes — post-clearance audit; keep all records', 'نعم — التدقيق اللاحق؛ احفظ كل السجلات')], a: 1 },
    ],
  });

  /* ============================================================ documents */
  const head = (title, sub) => `<div style="display:flex;justify-content:space-between;gap:12px"><div><b style="color:#0b4f71;font-size:15px">🛃 ${esc(CUS.company.name)}</b><br><small>${esc(CUS.company.licence)}</small></div><div style="text-align:right"><b style="font-size:16px">${esc(title)}</b><br><small>${sub || ''}</small></div></div><hr>`;
  const foot = '<p><small>Training document — simulated NAJM data, sample tariff rates and exchange rate.</small></p>';
  CUS.docs = (s) => {
    const d = CUS.d(s), c = C(s), list = [];
    if (c.declaration) list.push({ id: 'decl', name: L('Customs declaration', 'البيان الجمركي'), html: () => { const x = c.declaration; const reg = CUS.regimes.find((r) => r.v === x.reg); return `<div class="doc">${head('CUSTOMS DECLARATION', (x.no || 'not lodged yet') + ' · ' + (reg ? reg.l.en : ''))}<div class="boxes"><div><div class="lbl">Declarant</div>${esc(CUS.company.licence)}</div><div><div class="lbl">${d.imp ? 'Importer' : 'Exporter'}</div>${esc(x.party)}<br>${esc(x.regno)}</div><div><div class="lbl">Country of origin / consignment</div>${esc(x.orig)} / ${esc(x.cons)}</div><div><div class="lbl">Transport</div>${esc(s.booking.vessel)} · B/L ${esc(x.bl)} · ${esc(x.cn)}</div><div><div class="lbl">Packages / gross / net</div>${x.pk} · ${TS.num(x.gw, 0)} kg · ${TS.num(x.nw, 0)} kg</div><div><div class="lbl">Preference</div>${esc(x.pref)}</div></div><table style="margin-top:8px"><thead><tr><th>#</th><th>HS</th><th>Description</th><th class="num">Pkgs</th><th class="num">Gross kg</th><th class="num">Net kg</th><th class="num">${d.imp ? 'CIF' : 'FOB'} USD</th></tr></thead><tbody>${x.items.map((it, i) => `<tr><td>${i + 1}</td><td class="mono">${it.hs}</td><td>${esc(it.desc)}</td><td class="num">${it.pkgs}</td><td class="num">${TS.num(it.gross, 0)}</td><td class="num">${TS.num(it.net, 0)}</td><td class="num">${TS.num(it.value)}</td></tr>`).join('')}</tbody></table>${c.declaration.lane ? `<p>Lane: <b>${esc(c.declaration.lane.toUpperCase())}</b></p>` : ''}${foot}</div>`; } });
    if (c.taxes && d.imp) list.push({ id: 'assess', name: L('Duty assessment', 'تصفية الرسوم'), html: () => `<div class="doc">${head('ASSESSMENT OF DUTIES & TAXES', d.declNo)}<table><thead><tr><th>HS</th><th class="num">CIF USD</th><th class="num">Duty %</th><th class="num">Duty</th><th class="num">VAT base</th><th class="num">VAT 11%</th></tr></thead><tbody>${d.items.map((x) => `<tr><td class="mono">${x.hs}</td><td class="num">${TS.num(x.cif)}</td><td class="num">${x.rate}</td><td class="num">${TS.num(x.duty)}</td><td class="num">${TS.num(x.vatBase)}</td><td class="num">${TS.num(x.vat)}</td></tr>`).join('')}<tr class="total"><td>Total</td><td class="num">${TS.num(d.cif)}</td><td></td><td class="num">${TS.num(d.duty)}</td><td class="num">${TS.num(d.vatBase)}</td><td class="num">${TS.num(d.vat)}</td></tr></tbody></table><p><b>Total payable: USD ${TS.num(d.taxes)} — LBP ${TS.num(d.taxesLBP, 0)}</b> (sample customs rate LBP ${TS.num(CUS.RATE, 0)}/USD)</p>${foot}</div>` });
    if (c.release) list.push({ id: 'rel', name: L('Customs release', 'الإفراج الجمركي'), html: () => `<div class="doc">${head(d.imp ? 'CUSTOMS RELEASE — EXIT AUTHORISATION' : 'EXPORT RELEASE', d.declNo)}<p><span class="stamp">RELEASED</span></p><table><tbody><tr><th>Declaration</th><td>${esc(d.declNo)}</td></tr><tr><th>Release date</th><td>${TS.fmtDate(d.release)}</td></tr><tr><th>Container</th><td>${esc(s.equipment.containerNo)} / seal ${esc(s.equipment.seal)}</td></tr><tr><th>Lane</th><td>${esc(d.lane)}</td></tr>${d.imp ? `<tr><th>Payment receipt</th><td>${esc((c.payment || {}).receipt || '')}</td></tr><tr><th>Delivery order</th><td>${esc(s.release.doNo)}</td></tr>` : `<tr><th>Proof of export</th><td>${esc((c.release || {}).proof || '')}</td></tr>`}</tbody></table>${foot}</div>` });
    return list;
  };
})();
