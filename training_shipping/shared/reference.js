/* Training Shipping — bilingual reference library (glossary, Incoterms, equipment, Lebanon guide) */
(function () {
  const L = TS.L;
  const REF = (TS.REF = {});

  /* ---------------- glossary ---------------- */
  REF.glossary = [
    ['AMS', L('US Automated Manifest System — cargo data filed before loading for US-bound cargo.', 'نظام البيان الآلي الأميركي — إرسال بيانات البضاعة قبل التحميل للشحنات المتجهة إلى الولايات المتحدة.')],
    ['Arrival Notice (A/N)', L('Notice to the consignee that the vessel is arriving and what is owed before release.', 'إشعار الوصول — يُبلغ المرسل إليه بوصول الباخرة وبالمبالغ المستحقة قبل الإفراج.')],
    ['ATA / ATD', L('Actual time of arrival / departure (vs. ETA/ETD which are estimates).', 'الوقت الفعلي للوصول / للمغادرة (بخلاف ETA/ETD وهي تقديرية).')],
    ['B/L — Bill of Lading', L('Receipt for the cargo, evidence of the contract of carriage and a document of title.', 'بوليصة الشحن — إيصال باستلام البضاعة، ودليل على عقد النقل، وسند ملكية.')],
    ['BAF', L('Bunker Adjustment Factor — fuel surcharge that moves with oil prices.', 'رسم تعديل الوقود — يتغيّر مع أسعار النفط.')],
    ['Booking', L('Reservation of space on a vessel with a shipping line.', 'حجز مساحة على باخرة لدى خط ملاحي.')],
    ['CAD', L('Cash Against Documents — the bank releases the original documents to the buyer against payment.', 'الدفع مقابل المستندات — يسلّم المصرف المستندات الأصلية للمشتري مقابل الدفع.')],
    ['CAF', L('Currency Adjustment Factor — surcharge protecting the line against exchange movements.', 'رسم تعديل العملة — يحمي الخط من تقلّبات سعر الصرف.')],
    ['CBM', L('Cubic metre = length × width × height in metres.', 'متر مكعّب = الطول × العرض × الارتفاع بالمتر.')],
    ['CFS', L('Container Freight Station — where LCL cargo is stuffed and stripped.', 'محطة تجميع البضائع — حيث تُعبّأ وتُفرّغ شحنات LCL.')],
    ['COC / SOC', L('Carrier-owned container / shipper-owned container.', 'حاوية مملوكة للناقل / حاوية مملوكة للشاحن.')],
    ['COO', L('Certificate of Origin — where the goods were made; issued by a Chamber of Commerce.', 'شهادة المنشأ — تُثبت بلد صنع البضاعة، تصدرها غرفة التجارة.')],
    ['Container deposit / guarantee', L('Common in Lebanon: the consignee leaves a deposit (cash/cheque) or guarantee with the line’s agent to cover the container until it is returned empty.', 'شائع في لبنان: يترك المرسل إليه تأمينًا (نقدًا/شيك) أو كفالة لدى وكيل الخط لتغطية الحاوية حتى إرجاعها فارغة.')],
    ['Customs broker', L('Licensed agent who files the customs declaration (in Lebanon: licensed customs clearing agent).', 'المخلّص الجمركي المرخّص الذي يقدّم البيان الجمركي.')],
    ['CY / CY cutoff', L('Container Yard / last moment the loaded box must be inside the terminal.', 'ساحة الحاويات / آخر موعد لدخول الحاوية المعبّأة إلى المحطة.')],
    ['D/O — Delivery Order', L('Release document at destination that lets the consignee collect the cargo.', 'إذن التسليم — مستند يسمح للمرسل إليه باستلام البضاعة في بلد الوصول.')],
    ['DEM — Demurrage', L('Charge for a container staying inside the terminal beyond free time.', 'غرامة بقاء الحاوية داخل المحطة بعد انتهاء فترة السماح.')],
    ['DET — Detention', L('Charge for a container kept outside the terminal beyond free time, not yet returned empty.', 'غرامة احتجاز الحاوية خارج المحطة بعد فترة السماح وقبل إرجاعها فارغة.')],
    ['DG', L('Dangerous goods — need IMDG class, UN number, packing group, MSDS and a DG declaration.', 'بضائع خطرة — تحتاج فئة IMDG ورقم UN ومجموعة التعبئة وMSDS وإقرار بضائع خطرة.')],
    ['EIR', L('Equipment Interchange Receipt — records the condition of a container when it changes hands (depot/terminal).', 'إيصال تبادل المعدّات — يوثّق حالة الحاوية عند تسليمها/استلامها في المستودع أو المحطة.')],
    ['ENS / ICS2', L('EU entry summary declaration filed before loading/arrival through the ICS2 system.', 'بيان الدخول الموجز للاتحاد الأوروبي عبر نظام ICS2 قبل التحميل/الوصول.')],
    ['ERD', L('Earliest Receiving Date — before this the terminal will not accept your container.', 'أبكر تاريخ استلام — قبله لا تقبل المحطة حاويتك.')],
    ['ETA / ETD', L('Estimated time of arrival / departure. They move — never promise them as facts.', 'الوقت المقدّر للوصول / للمغادرة. يتغيّران — لا تَعِد بهما كحقيقة.')],
    ['EUR.1', L('Movement certificate proving preferential origin under EU agreements (e.g. EU–Lebanon Association Agreement) so the buyer pays reduced/zero duty.', 'شهادة حركة تثبت المنشأ التفضيلي بموجب اتفاقيات الاتحاد الأوروبي (مثل اتفاقية الشراكة اللبنانية–الأوروبية) لتخفيض الرسوم أو إعفائها.')],
    ['FCL / LCL', L('Full container load / less than container load (shared, consolidated container).', 'حاوية كاملة / شحنة جزئية (حاوية مشتركة مجمّعة).')],
    ['Feeder', L('Small vessel carrying boxes between a local port and a transshipment hub.', 'باخرة صغيرة تنقل الحاويات بين مرفأ محلي ومرفأ مسافنة.')],
    ['Free time', L('Days allowed before demurrage/detention start. Negotiate at booking, never after arrival.', 'فترة السماح قبل بدء غرامات التأخير. تُفاوَض عند الحجز، لا بعد الوصول.')],
    ['Freight collect / prepaid', L('Freight payable at destination / paid at origin before B/L release.', 'أجرة الشحن تُدفع في بلد الوصول / تُدفع مسبقًا في بلد التحميل قبل إصدار البوليصة.')],
    ['GRI / PSS', L('General Rate Increase / Peak Season Surcharge announced by lines.', 'زيادة عامة في الأسعار / رسم موسم الذروة يعلنها الخطوط.')],
    ['HBL / MBL', L('House B/L (forwarder to shipper) / Master B/L (line to forwarder).', 'بوليصة الوكيل (من وكيل الشحن للشاحن) / البوليصة الرئيسية (من الخط لوكيل الشحن).')],
    ['HS code', L('Harmonised System tariff code. The importer or broker classifies it — not you.', 'رمز النظام المنسّق للتعرفة. يحدّده المستورد أو المخلّص — وليس أنت.')],
    ['IMDG', L('International Maritime Dangerous Goods code.', 'المدوّنة الدولية للبضائع الخطرة البحرية.')],
    ['Incoterms 2020', L('ICC rules deciding who pays which leg and where risk passes.', 'قواعد غرفة التجارة الدولية التي تحدّد من يدفع كل مرحلة وأين تنتقل المخاطر.')],
    ['ISPS', L('Security charge under the International Ship and Port Facility Security code.', 'رسم أمني بموجب المدوّنة الدولية لأمن السفن والمرافق المينائية.')],
    ['LSS', L('Low Sulphur Surcharge (IMO 2020).', 'رسم الوقود منخفض الكبريت (IMO 2020).')],
    ['Manifest', L('List of all cargo on a vessel, filed with customs before arrival (in Lebanon through the customs system by the carrier’s agent).', 'قائمة بكل البضائع على الباخرة تُقدَّم للجمارك قبل الوصول (في لبنان عبر النظام الجمركي من قبل وكيل الخط).')],
    ['NAJM', L('The Lebanese Customs automated system used for manifests and declarations.', 'النظام الجمركي الآلي في لبنان (نجم) للبيانات والمانيفست.')],
    ['Notify party', L('Who is told when the vessel arrives — often the consignee or its broker.', 'الطرف الذي يُبلَّغ بوصول الباخرة — غالبًا المرسل إليه أو مخلّصه.')],
    ['NVOCC', L('Forwarder that issues its own B/L without owning ships.', 'ناقل لا يملك سفنًا لكنه يصدر بوليصته الخاصة.')],
    ['OBL', L('Original Bill of Lading — usually a set of 3 originals; one must be surrendered to get the cargo.', 'البوليصة الأصلية — عادة 3 نسخ أصلية، يجب تسليم واحدة لاستلام البضاعة.')],
    ['POL / POD / POR / FPOD', L('Port of loading / port of discharge / place of receipt / final place of delivery.', 'مرفأ التحميل / مرفأ التفريغ / مكان الاستلام / مكان التسليم النهائي.')],
    ['Pre-alert', L('Document pack the origin sends to destination right after sailing.', 'حزمة المستندات التي يرسلها المنشأ إلى بلد الوصول فور الإبحار.')],
    ['Rolled / roll-over', L('Container not loaded on the booked vessel and moved to a later one.', 'عدم تحميل الحاوية على الباخرة المحجوزة ونقلها إلى باخرة لاحقة.')],
    ['Seal', L('Numbered bolt seal (ISO 17712) fixed on the doors after stuffing.', 'ختم مرقّم (ISO 17712) يُركّب على الأبواب بعد التعبئة.')],
    ['SI', L('Shipping Instructions — tells the line how to print the B/L.', 'تعليمات الشحن — تخبر الخط كيف تُطبع البوليصة.')],
    ['SO', L('Shipping Order / booking confirmation — booking no., vessel, cutoffs, empty release.', 'أمر الشحن / تأكيد الحجز — رقم الحجز والباخرة والمواعيد النهائية والإفراج عن الحاوية الفارغة.')],
    ['Stuffing / stripping', L('Loading cargo into / unloading cargo out of a container.', 'تعبئة البضاعة في الحاوية / تفريغها منها.')],
    ['Switch B/L', L('Second set of B/Ls reissued at another place, usually changing shipper details. Fraud risk.', 'مجموعة ثانية من البوالص تُعاد إصدارها في مكان آخر مع تغيير بيانات الشاحن غالبًا. خطر احتيال.')],
    ['T/S', L('Transshipment — cargo changes vessel at a hub.', 'المسافنة — نقل البضاعة من باخرة إلى أخرى في مرفأ محوري.')],
    ['Tare / Payload / Gross', L('Empty box weight / max cargo / tare + cargo.', 'وزن الحاوية فارغة / الحمولة القصوى / الفارغ + البضاعة.')],
    ['Telex release', L('Originals surrendered at origin; destination instructed electronically to release.', 'تسليم الأصول في بلد المنشأ وإبلاغ بلد الوصول إلكترونيًا بالإفراج.')],
    ['TEU / FEU', L('Twenty / forty-foot equivalent unit. A 40′ = 2 TEU.', 'وحدة مكافئة لعشرين / أربعين قدمًا. الحاوية 40 قدمًا = 2 TEU.')],
    ['THC (OTHC / DTHC)', L('Terminal handling charge at origin / destination.', 'رسم مناولة المحطة في المنشأ / في الوصول.')],
    ['VAT (Lebanon)', L('Value Added Tax — 11% standard rate in Lebanon (check current law).', 'الضريبة على القيمة المضافة — 11% النسبة العامة في لبنان (تحقّق من القانون الحالي).')],
    ['VGM', L('Verified Gross Mass required by SOLAS. No VGM, no loading.', 'الوزن الإجمالي المُتحقَّق منه وفق اتفاقية SOLAS. بدونه لا تحميل.')],
    ['W/M', L('Weight or measure — LCL bills the higher of tonnes or CBM (1 CBM = 1,000 kg).', 'الوزن أو الحجم — تُحسب شحنات LCL على الأعلى بين الطن والمتر المكعّب (1 م³ = 1000 كغ).')],
  ];

  /* ---------------- Incoterms ---------------- */
  REF.incoterms = [
    { c: 'EXW', mode: 'any', seller: L('Nothing — goods ready at seller’s premises.', 'لا شيء — البضاعة جاهزة في مقرّ البائع.'), risk: L('Seller’s premises', 'مقرّ البائع'), ff: L('Buyer appoints you for everything, including origin pickup & export clearance.', 'يعيّنك المشتري لكل شيء بما فيه الاستلام والتخليص الصادر.') },
    { c: 'FCA', mode: 'any', seller: L('Delivery to a named place or carrier, export cleared.', 'التسليم إلى مكان أو ناقل محدّد مع التخليص الصادر.'), risk: L('On handover to the carrier', 'عند التسليم للناقل'), ff: L('Correct term for containers; buyer appoints you from the named place.', 'المصطلح الصحيح للحاويات؛ يعيّنك المشتري من المكان المحدّد.') },
    { c: 'FAS', mode: 'sea', seller: L('Goods alongside the vessel at POL.', 'البضاعة بجانب الباخرة في مرفأ التحميل.'), risk: L('Alongside the ship', 'بجانب السفينة'), ff: L('Rare for containers; used for bulk/break-bulk.', 'نادر للحاويات؛ يُستعمل للبضائع السائبة.') },
    { c: 'FOB', mode: 'sea', seller: L('Goods on board the vessel at POL (incl. origin THC).', 'البضاعة على متن الباخرة في مرفأ التحميل (مع رسوم المناولة في المنشأ).'), risk: L('On board at POL', 'على متن الباخرة في مرفأ التحميل'), ff: L('Buyer appoints you for ocean freight onward. Very common for imports to Lebanon.', 'يعيّنك المشتري من الشحن البحري فصاعدًا. شائع جدًا في الاستيراد إلى لبنان.') },
    { c: 'CFR', mode: 'sea', seller: L('Freight to POD.', 'أجرة الشحن حتى مرفأ التفريغ.'), risk: L('On board at POL — the gap catches people out', 'على متن الباخرة في مرفأ التحميل — هنا يقع الكثيرون في الخطأ'), ff: L('Seller appoints you; buyer carries transit risk.', 'يعيّنك البائع؛ ويتحمّل المشتري مخاطر النقل.') },
    { c: 'CIF', mode: 'sea', seller: L('Freight + minimum insurance to POD.', 'أجرة الشحن + تأمين بالحدّ الأدنى حتى مرفأ التفريغ.'), risk: L('On board at POL', 'على متن الباخرة في مرفأ التحميل'), ff: L('As CFR with a cargo insurance policy.', 'مثل CFR مع بوليصة تأمين على البضاعة.') },
    { c: 'CPT', mode: 'any', seller: L('Carriage to a named destination.', 'النقل حتى وجهة محدّدة.'), risk: L('On handover to the first carrier', 'عند التسليم لأول ناقل'), ff: L('Multimodal version of CFR.', 'النسخة المتعدّدة الوسائط من CFR.') },
    { c: 'CIP', mode: 'any', seller: L('Carriage + insurance (higher cover) to a named destination.', 'النقل + التأمين (تغطية أعلى) حتى وجهة محدّدة.'), risk: L('On handover to the first carrier', 'عند التسليم لأول ناقل'), ff: L('Multimodal version of CIF.', 'النسخة المتعدّدة الوسائط من CIF.') },
    { c: 'DAP', mode: 'any', seller: L('Delivery at destination, not unloaded, import not cleared.', 'التسليم في الوجهة دون تفريغ ودون تخليص استيراد.'), risk: L('At named destination', 'في الوجهة المحدّدة'), ff: L('Seller appoints you for the whole chain except import clearance.', 'يعيّنك البائع لكامل السلسلة ما عدا التخليص الوارد.') },
    { c: 'DPU', mode: 'any', seller: L('Delivered and unloaded at destination.', 'التسليم مع التفريغ في الوجهة.'), risk: L('After unloading at destination', 'بعد التفريغ في الوجهة'), ff: L('Like DAP but seller also unloads.', 'مثل DAP لكن البائع يفرّغ أيضًا.') },
    { c: 'DDP', mode: 'any', seller: L('Everything including import duty, VAT and clearance.', 'كل شيء بما فيه الرسوم الجمركية والضريبة والتخليص.'), risk: L('At named destination', 'في الوجهة المحدّدة'), ff: L('Seller carries all cost & risk. In Lebanon the seller needs someone able to clear as importer — price very carefully.', 'البائع يتحمّل كل الكلفة والمخاطر. في لبنان يحتاج البائع جهة قادرة على التخليص كمستورد — سعّر بحذر شديد.') },
  ];

  /* ---------------- equipment ---------------- */
  REF.equipment = [
    { code: '20DV', name: L('20′ Dry Van', 'حاوية 20 قدم عادية'), cbm: 33, payload: 28000, tare: 2200, use: L('Dense cargo: tiles, stone, food in jars, machinery, drums.', 'بضائع ثقيلة: بلاط، حجر، مواد غذائية في مرطبانات، آلات، براميل.') },
    { code: '40DV', name: L('40′ Dry Van', 'حاوية 40 قدم عادية'), cbm: 67, payload: 26500, tare: 3750, use: L('General cargo. Volume runs out before weight.', 'بضائع عامة. ينفد الحجم قبل الوزن.') },
    { code: '40HC', name: L('40′ High Cube', 'حاوية 40 قدم عالية'), cbm: 76, payload: 26400, tare: 3900, use: L('Default for light, bulky cargo (furniture, textiles).', 'الخيار الافتراضي للبضائع الخفيفة الكبيرة الحجم (أثاث، أقمشة).') },
    { code: '45HC', name: L('45′ High Cube', 'حاوية 45 قدم عالية'), cbm: 86, payload: 25500, tare: 4800, use: L('Not accepted everywhere — check before quoting.', 'غير مقبولة في كل مكان — تحقّق قبل التسعير.') },
    { code: '20RF', name: L('20′ Reefer', 'حاوية 20 قدم مبرّدة'), cbm: 28, payload: 27000, tare: 3000, use: L('Temperature controlled. Confirm set temp, vents, humidity in writing.', 'مبرّدة. أكّد الحرارة والتهوية والرطوبة كتابيًا.') },
    { code: '40RF', name: L('40′ HC Reefer', 'حاوية 40 قدم مبرّدة عالية'), cbm: 67, payload: 29000, tare: 4500, use: L('Fresh produce, frozen food, pharma. Genset for road leg?', 'منتجات طازجة، مجمّدات، أدوية. هل تحتاج مولّدًا للنقل البري؟') },
    { code: '40OT', name: L('40′ Open Top', 'حاوية 40 قدم مفتوحة السقف'), cbm: 65, payload: 26500, tare: 3900, use: L('Crane-loaded from above; over-height pays surcharge.', 'تُحمَّل بالرافعة من الأعلى؛ الزيادة في الارتفاع تستوجب رسمًا إضافيًا.') },
    { code: '40FR', name: L('40′ Flat Rack', 'حاوية 40 قدم مسطّحة'), cbm: 0, payload: 39000, tare: 5000, use: L('Out-of-gauge: machinery, boats, transformers.', 'بضائع خارج المقاسات: آلات، قوارب، محوّلات.') },
    { code: 'LCL', name: L('LCL (shared container)', 'شحنة جزئية (حاوية مشتركة)'), cbm: 0, payload: 0, tare: 0, use: L('Small shipments (roughly under 15 CBM). Billed W/M.', 'شحنات صغيرة (تقريبًا أقل من 15 م³). تُحسب W/M.') },
  ];

  /* ---------------- Lebanon guide ---------------- */
  REF.lebanon = [
    {
      h: L('1. Ports of Lebanon', '١. مرافئ لبنان'),
      b: L(
        `<ul><li><b>Port of Beirut (LBBEY)</b> — the main gateway for containers. The container terminal kept operating after the 4 August 2020 explosion, and its operation was given to a private operator under a concession in 2022 (check who operates it now).</li>
<li><b>Port of Tripoli (LBKYE)</b> — the second container port, with a container terminal run by a private operator. It is used by some lines and as an alternative to Beirut.</li>
<li><b>Saida and Tyre</b> — smaller ports, mainly general cargo, not regular container calls.</li>
<li>Main terminal parties: the port administration (port dues and storage), the terminal operator (handling, gate-in/gate-out, EIR), the shipping line agents (D/O, deposits, detention) and customs.</li></ul>`,
        `<ul><li><b>مرفأ بيروت (LBBEY)</b> — البوابة الرئيسية للحاويات. استمرّت محطة الحاويات بالعمل بعد انفجار 4 آب 2020، وأُعطي تشغيلها لمشغّل خاص بعقد امتياز عام 2022 (تحقّق من المشغّل الحالي).</li>
<li><b>مرفأ طرابلس (LBKYE)</b> — ثاني مرفأ حاويات، فيه محطة حاويات يشغّلها مشغّل خاص، وتستعمله بعض الخطوط كبديل عن بيروت.</li>
<li><b>صيدا وصور</b> — مرافئ أصغر للبضائع العامة، بدون خطوط حاويات منتظمة.</li>
<li>الجهات الأساسية: إدارة المرفأ (رسوم المرفأ والتخزين)، مشغّل المحطة (المناولة والدخول والخروج وإيصال EIR)، وكلاء الخطوط الملاحية (إذن التسليم والتأمينات والاحتجاز)، والجمارك.</li></ul>`
      ),
    },
    {
      h: L('2. Customs framework', '٢. الإطار الجمركي'),
      b: L(
        `<ul><li><b>Lebanese Customs Administration</b> (under the Ministry of Finance, led by the Higher Council of Customs and the Director General of Customs).</li>
<li><b>Customs Law:</b> Lebanese Customs Code issued by Decree No. 4461 of 15/12/2000 and its implementing decisions.</li>
<li><b>NAJM</b> is the customs electronic system: carrier agents submit the <b>manifest</b>, and licensed brokers lodge the <b>customs declaration (بيان جمركي)</b>.</li>
<li>Declarations are lodged by a <b>licensed customs clearing agent (مخلّص جمركي مرخّص)</b>. The forwarder works with one (in-house or third party).</li>
<li>Risk-based inspection lanes (e.g. green = release, yellow = document check, red = physical inspection).</li>
<li><b>Customs value = CIF value</b> (cost + insurance + freight to the Lebanese port). Duty rate comes from the Lebanese tariff by HS code, then <b>VAT 11%</b> is computed on (CIF + duty + any excise).</li>
<li>The exchange rate used to convert foreign currency for customs has changed several times since 2022. <b>Always check the current official rate</b> before estimating duties for a client.</li></ul>`,
        `<ul><li><b>إدارة الجمارك اللبنانية</b> (تابعة لوزارة المالية، يرأسها المجلس الأعلى للجمارك والمدير العام للجمارك).</li>
<li><b>قانون الجمارك:</b> قانون الجمارك اللبناني الصادر بالمرسوم رقم 4461 تاريخ 15/12/2000 وقراراته التطبيقية.</li>
<li><b>نظام نجم (NAJM)</b> هو النظام الإلكتروني للجمارك: وكلاء الخطوط يقدّمون <b>المانيفست</b>، والمخلّصون المرخّصون يقدّمون <b>البيان الجمركي</b>.</li>
<li>يقدّم البيان <b>مخلّص جمركي مرخّص</b>. يتعامل وكيل الشحن مع مخلّص (داخل الشركة أو خارجها).</li>
<li>مسارات تفتيش حسب المخاطر (مثلاً أخضر = إفراج، أصفر = تدقيق مستندات، أحمر = كشف حسّي).</li>
<li><b>القيمة الجمركية = قيمة CIF</b> (الكلفة + التأمين + الشحن حتى المرفأ اللبناني). نسبة الرسم من التعرفة اللبنانية حسب رمز HS، ثم <b>ضريبة القيمة المضافة 11%</b> على (CIF + الرسم الجمركي + أي رسوم استهلاك).</li>
<li>سعر الصرف المعتمد لتحويل العملات الأجنبية للجمارك تغيّر عدة مرات منذ 2022. <b>تحقّق دائمًا من السعر الرسمي الحالي</b> قبل تقدير الرسوم للزبون.</li></ul>`
      ),
    },
    {
      h: L('3. Import documents (typical)', '٣. مستندات الاستيراد (عادةً)'),
      b: L(
        `<ol><li>Commercial invoice (value, Incoterm, currency) — signed/stamped by the supplier.</li><li>Packing list.</li><li>Certificate of origin (needed for preferential duty under GAFTA / EU / EFTA agreements).</li><li>Bill of lading (copy + telex release / surrendered original).</li><li>Delivery order from the shipping line agent (the D/O is needed before the declaration can be completed).</li><li>Importer’s commercial registration and VAT/financial number.</li><li>Licences or approvals where the product requires them (e.g. Ministry of Public Health for medicines & some foods, Ministry of Agriculture for plants/animal products, Ministry of Economy & Trade and Lebanese standards (LIBNOR) for some regulated products, Telecom for radio equipment).</li><li>Insurance certificate if insurance is part of CIF.</li></ol>`,
        `<ol><li>الفاتورة التجارية (القيمة، شرط التسليم، العملة) — موقّعة/مختومة من المورّد.</li><li>قائمة التعبئة.</li><li>شهادة المنشأ (ضرورية للإعفاء التفضيلي ضمن منطقة التجارة العربية الكبرى / الاتحاد الأوروبي / EFTA).</li><li>بوليصة الشحن (نسخة + تلكس ريليز / الأصل المسلَّم).</li><li>إذن التسليم من وكيل الخط الملاحي (مطلوب قبل استكمال البيان).</li><li>السجل التجاري للمستورد ورقمه المالي/الضريبي.</li><li>التراخيص أو الموافقات حيث يلزم (مثلاً وزارة الصحة للأدوية وبعض الأغذية، وزارة الزراعة للنباتات والمنتجات الحيوانية، وزارة الاقتصاد والتجارة ومؤسسة المقاييس (ليبنور) لبعض المنتجات، الاتصالات للأجهزة اللاسلكية).</li><li>شهادة التأمين إذا كان التأمين جزءًا من CIF.</li></ol>`
      ),
    },
    {
      h: L('4. Export from Lebanon', '٤. التصدير من لبنان'),
      b: L(
        `<ul><li>Export declaration lodged by a licensed broker in NAJM, with commercial invoice and packing list.</li><li><b>Certificate of origin</b> from the relevant Chamber of Commerce, Industry & Agriculture (Beirut & Mount Lebanon, Tripoli & North, Zahle & Bekaa, Saida & South).</li><li><b>EUR.1</b> for EU buyers (EU–Lebanon Association Agreement) so the buyer can claim preferential duty. Arab COO for GAFTA countries.</li><li>Food/agricultural products usually need a health or phytosanitary certificate from the Ministry of Agriculture (and the importing country’s rules — e.g. EU checks on sesame products).</li><li>VGM must be declared before the VGM cutoff; export containers gate in at the terminal with the booking/EIR.</li></ul>`,
        `<ul><li>بيان تصدير يقدّمه مخلّص مرخّص على نظام نجم، مع الفاتورة التجارية وقائمة التعبئة.</li><li><b>شهادة منشأ</b> من غرفة التجارة والصناعة والزراعة المختصة (بيروت وجبل لبنان، طرابلس والشمال، زحلة والبقاع، صيدا والجنوب).</li><li><b>شهادة EUR.1</b> للمشترين في الاتحاد الأوروبي (اتفاقية الشراكة) ليستفيد المشتري من الرسوم التفضيلية، وشهادة منشأ عربية لدول منطقة التجارة العربية الكبرى.</li><li>المنتجات الغذائية والزراعية تحتاج عادة شهادة صحية أو صحة نباتية من وزارة الزراعة (مع شروط بلد الاستيراد — مثل تدقيق الاتحاد الأوروبي على منتجات السمسم).</li><li>يجب التصريح عن VGM قبل موعده النهائي، وتدخل الحاويات المصدّرة المحطة بموجب الحجز/EIR.</li></ul>`
      ),
    },
    {
      h: L('5. Taxes & money', '٥. الضرائب والأموال'),
      b: L(
        `<ul><li><b>VAT 11%</b> is the standard rate. A VAT-registered forwarder charges VAT on local services (handling, trucking, clearance fees, THC re-billed…). International freight is generally treated as exempt/zero-rated — confirm with your accountant.</li><li>Most freight business is invoiced in <b>USD</b> since the 2019 crisis; tax invoices must also respect the Ministry of Finance rules for showing amounts/VAT in LBP.</li><li><b>Container deposits</b> (cash, cheque, or bank guarantee) are commonly required by line agents in Lebanon before releasing a full container; they are refunded after the empty is returned, minus detention or damage.</li><li>Customs duties and import VAT are paid by the importer (or by the forwarder on the importer’s behalf as a disbursement, not revenue).</li></ul>`,
        `<ul><li><b>الضريبة على القيمة المضافة 11%</b> هي النسبة العامة. يفرض وكيل الشحن المسجّل الضريبة على الخدمات المحلية (مناولة، نقل بري، أتعاب تخليص، THC المعاد فوترتها...). يُعامل الشحن الدولي عادة كمعفى/بنسبة صفر — تأكّد من المحاسب.</li><li>معظم فواتير الشحن بالدولار الأميركي منذ أزمة 2019؛ ويجب أن تحترم الفواتير الضريبية قواعد وزارة المالية لإظهار المبالغ/الضريبة بالليرة اللبنانية.</li><li><b>تأمين الحاوية</b> (نقدًا أو شيك أو كفالة مصرفية) يطلبه عادة وكلاء الخطوط في لبنان قبل الإفراج عن الحاوية، ويُسترد بعد إرجاعها فارغة مع حسم الاحتجاز أو الأضرار.</li><li>الرسوم الجمركية وضريبة الاستيراد يدفعها المستورد (أو وكيل الشحن نيابةً عنه كسلفة وليس كإيراد).</li></ul>`
      ),
    },
    {
      h: L('6. Compliance red lines', '٦. خطوط حمراء في الامتثال'),
      b: L(
        `<ul><li><b>Boycott law (1955):</b> Lebanese law prohibits dealing with Israel and Israeli entities, and goods of Israeli origin. Lines serving Lebanon manage vessel eligibility — always use the carriers’ Lebanon services and never accept routing or goods that break this rule.</li><li><b>Sanctions:</b> check parties, goods and transshipment routes against applicable sanctions lists (UN, and those your banks and carriers apply).</li><li><b>Dangerous goods</b> must be declared (IMDG). After August 2020, the authorities are very strict about hazardous materials at Beirut port.</li><li><b>Correct declaration:</b> under-invoicing or wrong description is customs fraud (penalties, seizure). Never help a client alter invoices.</li></ul>`,
        `<ul><li><b>قانون المقاطعة (1955):</b> يمنع القانون اللبناني التعامل مع إسرائيل والجهات الإسرائيلية والبضائع ذات المنشأ الإسرائيلي. الخطوط التي تخدم لبنان تدير أهلية البواخر — استعمل دائمًا خدمات الخطوط المخصّصة للبنان ولا تقبل أي مسار أو بضاعة تخالف ذلك.</li><li><b>العقوبات:</b> تحقّق من الأطراف والبضائع ومرافئ المسافنة مقابل لوائح العقوبات المعمول بها (الأمم المتحدة، وتلك التي تطبّقها المصارف والخطوط).</li><li><b>البضائع الخطرة</b> يجب التصريح عنها (IMDG). بعد آب 2020 أصبحت السلطات صارمة جدًا تجاه المواد الخطرة في مرفأ بيروت.</li><li><b>التصريح الصحيح:</b> تخفيض الفاتورة أو الوصف الخاطئ تهريب جمركي (غرامات، مصادرة). لا تساعد أي زبون على تعديل الفواتير.</li></ul>`
      ),
    },
    {
      h: L('7. Trade agreements that reduce duty', '٧. اتفاقيات تجارية تخفّض الرسوم'),
      b: L(
        `<ul><li><b>GAFTA</b> (Greater Arab Free Trade Area) — Arab-origin goods with the right COO.</li><li><b>EU–Lebanon Association Agreement</b> — EUR.1 / origin declaration.</li><li><b>EFTA–Lebanon</b> free trade agreement.</li><li>Without a valid origin document the importer pays the full (MFN) duty — so always ask the shipper for the correct COO <i>before</i> sailing.</li></ul>`,
        `<ul><li><b>منطقة التجارة الحرة العربية الكبرى</b> — البضائع ذات المنشأ العربي مع شهادة منشأ صحيحة.</li><li><b>اتفاقية الشراكة بين لبنان والاتحاد الأوروبي</b> — شهادة EUR.1 / تصريح منشأ.</li><li><b>اتفاقية التجارة الحرة مع EFTA</b>.</li><li>بدون مستند منشأ صالح يدفع المستورد الرسم الكامل — لذلك اطلب دائمًا من الشاحن شهادة المنشأ الصحيحة <i>قبل</i> الإبحار.</li></ul>`
      ),
    },
  ];

  REF.disclaimer = L(
    'Training content. Lebanese rates, fees, exchange rates and procedures change often — figures in this simulator are realistic samples, not official tariffs. Always confirm with Lebanese Customs, a licensed broker and your accountant.',
    'محتوى تدريبي. الأسعار والرسوم وأسعار الصرف والإجراءات في لبنان تتغيّر كثيرًا — الأرقام في هذا المحاكي أمثلة واقعية وليست تعرفات رسمية. تأكّد دائمًا من الجمارك اللبنانية ومخلّص مرخّص ومحاسبك.'
  );

  /* ISO 6346 container check digit */
  REF.checkDigit = (code10) => {
    const map = {}; let v = 10;
    for (let c = 65; c <= 90; c++) { if (v % 11 === 0) v++; map[String.fromCharCode(c)] = v; v++; }
    const s = String(code10).toUpperCase();
    if (!/^[A-Z]{4}\d{6}$/.test(s)) return null;
    let sum = 0;
    for (let i = 0; i < 10; i++) { const ch = s[i]; const n = /\d/.test(ch) ? Number(ch) : map[ch]; sum += n * Math.pow(2, i); }
    return (sum % 11) % 10;
  };
  REF.validContainer = (full) => {
    const s = String(full).toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (!/^[A-Z]{3}[UJZ]\d{7}$/.test(s)) return false;
    return REF.checkDigit(s.slice(0, 10)) === Number(s[10]);
  };
})();
