/* Port Master Academy — curriculum, levels 3, 4 & 5 */
(function () {
  const L = TS.L;
  const Q = (q, o, a, e) => ({ q, o, a, e });
  const add = (x) => PT.lessons.push(x);

  /* =========================================================== LEVEL 3 */
  add({
    id: 'yardcap', lvl: 3, icon: '🧮', min: 16,
    title: L('Yard capacity, utilisation & dwell time', 'سعة الساحة ونسبة الاستخدام ومدة البقاء'),
    sub: L('Ground slots, stacking height, working capacity, dwell time and Little’s law.', 'خانات الأرض، ارتفاع الرصّ، السعة التشغيلية، مدة البقاء وقانون ليتل.'),
    body: L(`
<h3>Static capacity</h3>
<div class="formula">Nominal capacity (TEU) = Ground slots (TGS) × Stacking height
Working capacity = Nominal × Utilisation factor (≈ 0.65–0.80)</div>
<p>You never fill a yard to 100%: you need free slots to receive, to sort, and to dig boxes out. Above ~80–85% yard utilisation, rehandles explode and productivity falls.</p>
<h3>Dynamic capacity — throughput</h3>
<div class="formula">Annual yard throughput (TEU) = Working capacity × 365 ÷ Average dwell time (days)</div>
<p>This is <b>Little's law</b>: inventory = flow × time. If dwell time doubles, the same yard can handle half the throughput.</p>
<div class="ex" data-t="Example">Block B import: 480 TGS × 5 high = 2,400 TEU; × 0.7 = 1,680 TEU working. Average import dwell 6 days → 1,680 × 365 ÷ 6 = 102,200 TEU/yr. If customs delays push dwell to 9 days → only 68,100 TEU/yr.</div>
<h3>Typical dwell times</h3>
<ul>
<li>Export full: 3–5 days (gate-in opens ~5–7 days before vessel).</li>
<li>Import full: 4–10 days (depends on customs and free time).</li>
<li>Transshipment: 3–7 days (connection schedule).</li>
<li>Empties: very variable — move them to the depot!</li>
</ul>
<h3>Levers to control the yard</h3>
<ul>
<li><b>Free time</b> and progressive <b>storage tariffs</b> (the cheapest yard expansion).</li>
<li>Export <b>gate-in window</b> (e.g. not earlier than 5 days before ETA).</li>
<li>Move empties and long-staying boxes (overstayers, abandoned cargo) off-dock.</li>
<li>Customs coordination (pre-clearance, fast lanes).</li>
<li>Housekeeping (night re-marshalling) when the gate is closed.</li>
</ul>`,
`
<h3>السعة الساكنة</h3>
<div class="formula">Nominal capacity (TEU) = Ground slots (TGS) × Stacking height
Working capacity = Nominal × Utilisation factor (≈ 0.65–0.80)</div>
<p>لا تملأ الساحة أبدًا 100%: تحتاج خانات فارغة للاستلام والفرز وإخراج الحاويات. فوق ~80–85% من الاستخدام تنفجر إعادة المناولة وتنخفض الإنتاجية.</p>
<h3>السعة الديناميكية — الإنتاجية</h3>
<div class="formula">Annual yard throughput (TEU) = Working capacity × 365 ÷ Average dwell time (days)</div>
<p>هذا هو <b>قانون ليتل</b>: المخزون = التدفّق × الزمن. إذا تضاعفت مدة البقاء فإن الساحة نفسها تتعامل مع نصف الحجم.</p>
<div class="ex" data-t="مثال">الكتلة B للاستيراد: 480 خانة أرض × 5 طبقات = 2,400 TEU؛ × 0.7 = 1,680 TEU تشغيلية. متوسط بقاء الاستيراد 6 أيام ← 1,680 × 365 ÷ 6 = 102,200 TEU/سنة. إذا رفعت تأخيرات الجمارك البقاء إلى 9 أيام ← 68,100 TEU/سنة فقط.</div>
<h3>مدد البقاء النموذجية</h3>
<ul>
<li>تصدير ممتلئ: 3–5 أيام (تُفتح البوابة ~5–7 أيام قبل السفينة).</li>
<li>استيراد ممتلئ: 4–10 أيام (حسب الجمارك والمدة المجانية).</li>
<li>مسافنة: 3–7 أيام (حسب جدول الربط).</li>
<li>الفارغ: متغيّر جدًا — انقله إلى المستودع!</li>
</ul>
<h3>أدوات التحكّم بالساحة</h3>
<ul>
<li><b>المدة المجانية</b> و<b>تعرفة التخزين</b> التصاعدية (أرخص توسعة للساحة).</li>
<li><b>نافذة دخول التصدير</b> (مثلًا ليس قبل 5 أيام من موعد السفينة).</li>
<li>نقل الفارغ والحاويات طويلة البقاء (المتأخّرة، البضائع المتروكة) خارج المحطة.</li>
<li>التنسيق مع الجمارك (التخليص المسبق، المسارات السريعة).</li>
<li>الترتيب الليلي (إعادة التنظيم) عندما تكون البوابة مغلقة.</li>
</ul>`),
    keys: [L('Working capacity = TGS × height × utilisation.', 'السعة التشغيلية = خانات الأرض × الارتفاع × نسبة الاستخدام.'), L('Throughput = capacity × 365 ÷ dwell.', 'الإنتاجية = السعة × 365 ÷ مدة البقاء.'), L('Dwell time is the hidden capacity killer.', 'مدة البقاء هي القاتل الخفي للسعة.')],
    senior: L('Report the top-50 overstaying containers every Monday with owner, reason and age. Chasing the long tail frees more space than any new block.', 'قدّم كل اثنين قائمة بأطول 50 حاوية بقاءً مع المالك والسبب والعمر. ملاحقة هذا الذيل الطويل تحرّر مساحة أكثر من أي كتلة جديدة.'),
    quiz: [
      Q(L('300 TGS, 4 high, 75% utilisation. Working capacity?', '300 خانة أرض، 4 طبقات، 75% استخدام. السعة التشغيلية؟'), [L('1,200 TEU', '1,200 TEU'), L('900 TEU', '900 TEU'), L('225 TEU', '225 TEU'), L('1,600 TEU', '1,600 TEU')], 1, L('300 × 4 × 0.75 = 900 TEU.', '300 × 4 × 0.75 = 900 TEU.')),
      Q(L('Dwell time goes from 5 to 10 days. Yard throughput capacity…', 'مدة البقاء من 5 إلى 10 أيام. قدرة الساحة على الإنتاجية…'), [L('Doubles', 'تتضاعف'), L('Halves', 'تنخفض للنصف'), L('Unchanged', 'لا تتغيّر'), L('+10%', '+10%')], 1, L('Throughput ∝ 1/dwell.', 'الإنتاجية تتناسب عكسيًا مع مدة البقاء.')),
      Q(L('The cheapest way to expand effective yard capacity is usually…', 'أرخص طريقة لزيادة السعة الفعلية للساحة عادةً…'), [L('Build new blocks', 'بناء كتل جديدة'), L('Reduce dwell time with free time/storage tariffs', 'تقليل مدة البقاء عبر المدة المجانية/تعرفة التخزين'), L('Stack 8 high', 'الرصّ 8 طبقات'), L('Close the gate', 'إغلاق البوابة')], 1, L('Tariff policy changes behaviour at almost zero capital cost.', 'سياسة التعرفة تغيّر السلوك بتكلفة رأسمالية شبه معدومة.')),
    ],
  });

  add({
    id: 'stacking', lvl: 3, icon: '🧱', min: 16,
    title: L('Stacking strategy & reshuffles', 'استراتيجية الرصّ وإعادة المناولة'),
    sub: L('Segregation keys, the “category stacking” method, rehandles, housekeeping.', 'مفاتيح الفصل، أسلوب “الرصّ حسب الفئة”، إعادة المناولة، الترتيب.'),
    body: L(`
<h3>What is a rehandle (reshuffle)?</h3>
<p>Any move of a box that is not the target, made only to reach the target underneath. It costs equipment time and slows the crane. KPI: <b>rehandle ratio</b> = rehandles ÷ productive moves (good terminals: &lt; 10–15% for exports).</p>
<h3>Export stacking — think about the loading order</h3>
<p>Group export boxes by a <b>category</b> = vessel + POD + size/type + weight class. Within a stack, keep one category; if mixed, put boxes needed <b>first</b> on top.</p>
<ul>
<li>The vessel loads <b>later ports first</b> (they go deeper on board) and within the same POD often <b>heavy first</b> (low in the stack on board).</li>
<li>So in the yard: later-POD / heavier boxes should be <b>on top or in their own stacks</b>, earlier-POD / lighter boxes underneath or separate.</li>
<li>Unknown weights at gate-in (VGM missing) → stack in a “pending” area, not in the vessel stacks.</li>
</ul>
<h3>Import stacking — think about the delivery order</h3>
<p>Delivery order is random (depends on customers). Strategies: low stacks for import (3–4), separate by <b>customs status</b> (released vs held vs inspection), by consignee for big clients, and <b>pre-marshal</b> boxes with truck appointments for tomorrow during the night.</p>
<h3>Transshipment</h3>
<p>Stack by <b>connecting vessel + POD</b>; the export rules apply to the second leg.</p>
<h3>Housekeeping</h3>
<p>Night shifts with idle RTGs re-marshal stacks for the next day's vessels and appointments. One rehandle at 03:00 saves a crane waiting at 10:00.</p>
<div class="ex" data-t="Count rehandles">Stack (bottom→top): A, B, C. Loading order: A then B then C. To get A you must move C and B (2 rehandles), then B is…already moved. Reverse the stack (C, B, A bottom→top) → 0 rehandles. This is exactly the yard simulator game.</div>`,
`
<h3>ما هي إعادة المناولة؟</h3>
<p>أي حركة لحاوية ليست الهدف، تُنفَّذ فقط للوصول إلى الحاوية المستهدفة تحتها. تكلّف وقت المعدّات وتبطئ الرافعة. المؤشر: <b>نسبة إعادة المناولة</b> = إعادة المناولة ÷ الحركات المنتجة (المحطات الجيدة: &lt; 10–15% للتصدير).</p>
<h3>رصّ التصدير — فكّر بترتيب التحميل</h3>
<p>جمّع حاويات التصدير حسب <b>الفئة</b> = السفينة + ميناء التفريغ + المقاس/النوع + فئة الوزن. داخل الرصّة احتفظ بفئة واحدة؛ وإن اختلطت، ضع الحاويات المطلوبة <b>أولًا</b> في الأعلى.</p>
<ul>
<li>السفينة تحمّل <b>الموانئ اللاحقة أولًا</b> (تذهب أعمق على السفينة)، وضمن نفس الميناء غالبًا <b>الثقيل أولًا</b> (منخفضًا في رصّة السفينة).</li>
<li>لذا في الساحة: حاويات الموانئ اللاحقة / الأثقل يجب أن تكون <b>في الأعلى أو في رصّات مستقلة</b>، وحاويات الموانئ الأسبق / الأخفّ تحتها أو منفصلة.</li>
<li>أوزان غير معروفة عند الدخول (VGM ناقص) ← رصّها في منطقة “معلّقة”، لا في رصّات السفينة.</li>
</ul>
<h3>رصّ الاستيراد — فكّر بترتيب التسليم</h3>
<p>ترتيب التسليم عشوائي (يعتمد على الزبائن). الاستراتيجيات: رصّات منخفضة للاستيراد (3–4)، الفصل حسب <b>الحالة الجمركية</b> (مُفرج عنها مقابل محجوزة مقابل معاينة)، حسب المستورد للزبائن الكبار، و<b>الترتيب المسبق</b> ليلًا للحاويات التي لها مواعيد شاحنات غدًا.</p>
<h3>المسافنة</h3>
<p>رصّ حسب <b>سفينة الربط + ميناء التفريغ</b>؛ وتنطبق قواعد التصدير على المرحلة الثانية.</p>
<h3>الترتيب (Housekeeping)</h3>
<p>ورديات الليل مع رافعات RTG غير المشغولة تعيد ترتيب الرصّات لسفن ومواعيد اليوم التالي. إعادة مناولة واحدة الساعة 03:00 توفّر انتظار رافعة رصيف الساعة 10:00.</p>
<div class="ex" data-t="عدّ إعادة المناولة">رصّة (من الأسفل للأعلى): A، B، C. ترتيب التحميل: A ثم B ثم C. للوصول إلى A يجب تحريك C وB (إعادتا مناولة). اعكس الرصّة (C، B، A من الأسفل للأعلى) ← صفر إعادة مناولة. هذه بالضبط لعبة محاكي الساحة.</div>`),
    keys: [L('Stack by category: vessel + POD + size + weight.', 'رصّ حسب الفئة: السفينة + الميناء + المقاس + الوزن.'), L('Boxes needed first go on top.', 'الحاويات المطلوبة أولًا توضع في الأعلى.'), L('Use night shifts for housekeeping.', 'استخدم ورديات الليل للترتيب.')],
    senior: L('Measure rehandles per vessel and per block every week. A rising ratio in one block usually means a planning rule is wrong (or being ignored) — fix the rule, not the people.', 'قِس إعادة المناولة لكل سفينة ولكل كتلة أسبوعيًا. ارتفاع النسبة في كتلة واحدة يعني غالبًا أن قاعدة تخطيط خاطئة (أو مُهمَلة) — أصلح القاعدة لا الأشخاص.'),
    quiz: [
      Q(L('Stack bottom→top: X, Y, Z. Retrieval order: Y, Z, X. Minimum rehandles?', 'رصّة من الأسفل للأعلى: X، Y، Z. ترتيب السحب: Y، Z، X. أقل إعادة مناولة؟'), [L('0', '0'), L('1', '1'), L('2', '2'), L('3', '3')], 1, L('To take Y you must move Z (1). Then Z, then X: no more.', 'لسحب Y يجب تحريك Z (1). ثم Z، ثم X: لا مزيد.')),
      Q(L('Export box arrives without VGM. Where do you stack it?', 'حاوية تصدير وصلت بدون VGM. أين ترصّها؟'), [L('In the vessel stack, on top', 'في رصّة السفينة، في الأعلى'), L('In a pending/hold area', 'في منطقة معلّقة/محجوزة'), L('In the reefer block', 'في كتلة المبرّدات'), L('Reject at gate always', 'ترفضها على البوابة دائمًا')], 1, L('Keep vessel stacks clean; many terminals accept and hold it until VGM arrives.', 'حافظ على نظافة رصّات السفينة؛ كثير من المحطات تقبلها وتحجزها حتى يصل VGM.')),
      Q(L('Import stacks are usually kept lower because…', 'رصّات الاستيراد تُبقى أقل ارتفاعًا عادةً لأن…'), [L('Imports are heavier', 'الاستيراد أثقل'), L('Delivery order is random', 'ترتيب التسليم عشوائي'), L('Customs requires it', 'الجمارك تطلب ذلك'), L('RTGs are smaller', 'رافعات RTG أصغر')], 1, L('Random retrieval → more rehandles in high stacks.', 'السحب العشوائي ← إعادة مناولة أكثر في الرصّات العالية.')),
    ],
  });

  add({
    id: 'gate', lvl: 3, icon: '🚧', min: 16,
    title: L('Gate operations & truck appointments', 'عمليات البوابة ومواعيد الشاحنات'),
    sub: L('Pre-advice, VBS, OCR, the gate-in checklist, EIR, truck turnaround time.', 'الإشعار المسبق، نظام حجز المواعيد، OCR، قائمة فحص الدخول، EIR، زمن دوران الشاحنة.'),
    body: L(`
<h3>The gate is the terminal's front door</h3>
<p>Every error here (wrong box in, wrong box out, undeclared damage) becomes a claim later. Speed matters too: queues of trucks block the city.</p>
<h3>Export gate-in checklist</h3>
<ol>
<li><b>Pre-advice / booking</b> exists in TOS (COPARN/booking from the line) and matches: line, vessel/voyage, POD, size-type.</li>
<li><b>Container number</b> valid (check digit) and matches the pre-advice.</li>
<li><b>Seal</b> number present, intact, matches documents.</li>
<li><b>VGM</b> received (or weigh at gate) and ≤ max gross.</li>
<li><b>Cut-off</b>: CY cut-off not passed (else needs line approval → “late gate-in”).</li>
<li><b>Special</b>: DG documents (IMDG class, UN no., placards), reefer setpoint & running, OOG dimensions.</li>
<li><b>Condition survey</b> (photos/OCR damage) → <b>EIR</b> issued.</li>
</ol>
<h3>Import gate-out checklist</h3>
<ul>
<li>Truck appointment valid, driver ID, truck plate.</li>
<li>Box is <b>released</b>: line release/D/O + customs release + no terminal hold (unpaid storage).</li>
<li>Seal check on exit, EIR signed by the driver.</li>
</ul>
<h3>Truck appointment system (VBS)</h3>
<p>Hauliers book a time slot; the terminal caps slots per hour by yard and gate capacity. Benefits: flat peaks, pre-marshalling of imports, shorter queues. Rules: grace period (±30–60 min), no-show penalties.</p>
<h3>KPI: Truck Turnaround Time (TTT)</h3>
<div class="formula">TTT = Gate-out time − Gate-in (or queue arrival) time
Target: &lt; 30–45 min for a single transaction</div>
<p>Dual transactions (drop an export + pick an import in one visit) improve trucking efficiency a lot — encourage them.</p>`,
`
<h3>البوابة هي باب المحطة الأمامي</h3>
<p>كل خطأ هنا (حاوية خاطئة تدخل، حاوية خاطئة تخرج، ضرر غير مُسجّل) يصبح مطالبة لاحقًا. السرعة مهمّة أيضًا: طوابير الشاحنات تسدّ المدينة.</p>
<h3>قائمة فحص دخول التصدير</h3>
<ol>
<li><b>الإشعار المسبق / الحجز</b> موجود في TOS (COPARN/حجز من الخط) ومطابق: الخط، السفينة/الرحلة، ميناء التفريغ، المقاس والنوع.</li>
<li><b>رقم الحاوية</b> صحيح (رقم التحقّق) ومطابق للإشعار المسبق.</li>
<li><b>الختم</b> موجود وسليم ومطابق للمستندات.</li>
<li><b>VGM</b> مستلم (أو وزن على البوابة) و≤ الحدّ الأقصى الإجمالي.</li>
<li><b>الموعد النهائي</b>: لم يتجاوز موعد إغلاق الساحة (وإلا يحتاج موافقة الخط ← “دخول متأخّر”).</li>
<li><b>الخاص</b>: مستندات البضائع الخطرة (فئة IMDG، رقم UN، الملصقات)، درجة حرارة المبرّدة وتشغيلها، أبعاد خارج المقاس.</li>
<li><b>فحص الحالة</b> (صور/OCR للأضرار) ← إصدار <b>EIR</b>.</li>
</ol>
<h3>قائمة فحص خروج الاستيراد</h3>
<ul>
<li>موعد شاحنة صالح، هوية السائق، لوحة الشاحنة.</li>
<li>الحاوية <b>مُفرج عنها</b>: إفراج الخط/إذن التسليم + إفراج الجمارك + لا حجز من المحطة (تخزين غير مدفوع).</li>
<li>فحص الختم عند الخروج، وتوقيع السائق على EIR.</li>
</ul>
<h3>نظام مواعيد الشاحنات (VBS)</h3>
<p>شركات النقل تحجز فترة زمنية؛ والمحطة تحدّد عدد المواعيد بالساعة حسب قدرة الساحة والبوابة. الفوائد: تسطيح الذروات، الترتيب المسبق للاستيراد، طوابير أقصر. القواعد: فترة سماح (±30–60 دقيقة)، غرامات عدم الحضور.</p>
<h3>المؤشر: زمن دوران الشاحنة (TTT)</h3>
<div class="formula">TTT = Gate-out time − Gate-in (or queue arrival) time
Target: &lt; 30–45 min for a single transaction</div>
<p>المعاملات المزدوجة (تسليم حاوية تصدير + استلام حاوية استيراد في زيارة واحدة) تحسّن كفاءة النقل كثيرًا — شجّعها.</p>`),
    keys: [L('Gate-in: booking, number, seal, VGM, cut-off, special, survey.', 'الدخول: الحجز، الرقم، الختم، VGM، الموعد النهائي، الخاص، الفحص.'), L('Gate-out needs commercial + customs + financial release.', 'الخروج يحتاج إفراجًا تجاريًا + جمركيًا + ماليًا.'), L('TTT target < 30–45 min.', 'هدف زمن الدوران < 30–45 دقيقة.')],
    senior: L('Watch the gate queue camera at 07:00 and 14:00 every day. If the queue reaches the public road, open an extra lane or move a clerk before the police call you.', 'راقب كاميرا طابور البوابة الساعة 07:00 و14:00 يوميًا. إن وصل الطابور إلى الطريق العام، افتح مسارًا إضافيًا أو انقل موظّفًا قبل أن تتّصل بك الشرطة.'),
    quiz: [
      Q(L('A truck arrives with export box after CY cut-off. You…', 'شاحنة تصل بحاوية تصدير بعد إغلاق الساحة. أنت…'), [L('Accept silently', 'تقبلها بصمت'), L('Need the line’s late-gate approval', 'تحتاج موافقة الخط على الدخول المتأخّر'), L('Call customs', 'تتّصل بالجمارك'), L('Load it on any vessel', 'تحمّلها على أي سفينة')], 1, L('Late gate-in is a line decision (and often a fee).', 'الدخول المتأخّر قرار الخط (وغالبًا برسوم).')),
      Q(L('Which document protects the terminal against damage claims at hand-over?', 'أي مستند يحمي المحطة من مطالبات الأضرار عند التسليم؟'), [L('EIR', 'EIR'), L('Booking confirmation', 'تأكيد الحجز'), L('Manifest', 'المانيفست'), L('Invoice', 'الفاتورة')], 0, L('EIR records the condition signed by both sides.', 'EIR يسجّل الحالة بتوقيع الطرفين.')),
      Q(L('Truck queued 09:10, gate-in 09:25, gate-out 10:05. TTT from queue?', 'الشاحنة في الطابور 09:10، الدخول 09:25، الخروج 10:05. زمن الدوران من الطابور؟'), [L('40 min', '40 دقيقة'), L('55 min', '55 دقيقة'), L('15 min', '15 دقيقة'), L('65 min', '65 دقيقة')], 1, L('09:10 → 10:05 = 55 min.', '09:10 ← 10:05 = 55 دقيقة.')),
    ],
  });

  add({
    id: 'special', lvl: 3, icon: '☢', min: 18,
    title: L('Reefers, dangerous goods & OOG', 'المبرّدات والبضائع الخطرة وخارج المقاس'),
    sub: L('Reefer monitoring, IMDG classes & segregation, OOG handling and emergency response.', 'مراقبة المبرّدات، فئات IMDG والفصل، مناولة خارج المقاس والاستجابة للطوارئ.'),
    body: L(`
<h3>Reefers</h3>
<ul>
<li>Plug in within <b>~30–60 min</b> of discharge/gate-in (cargo dependent). Unplugged time is recorded.</li>
<li>Monitor temperature (manual rounds every 4–6 h or remote monitoring RCM). Report <b>deviations</b> immediately to the line.</li>
<li>Setpoint vs supply/return air, humidity, ventilation (CBM/h), CA (controlled atmosphere).</li>
<li>Pre-trip inspection (<b>PTI</b>) before releasing an empty reefer for export.</li>
<li>Chilled (e.g. +2 °C fruit) vs frozen (−18 °C meat, −25 °C fish); pharma very tight (+2/+8 °C).</li>
</ul>
<h3>Dangerous goods (IMDG Code) — the 9 classes</h3>
<div class="table-wrap"><table><thead><tr><th>Class</th><th>Hazard</th><th>Example</th></tr></thead><tbody>
<tr><td>1</td><td>Explosives</td><td>Fireworks, ammunition</td></tr>
<tr><td>2</td><td>Gases (2.1 flammable, 2.2 non-flammable, 2.3 toxic)</td><td>LPG, aerosols</td></tr>
<tr><td>3</td><td>Flammable liquids</td><td>Paints, solvents, fuel</td></tr>
<tr><td>4</td><td>Flammable solids (4.1, 4.2 spontaneous, 4.3 dangerous when wet)</td><td>Matches, charcoal</td></tr>
<tr><td>5</td><td>Oxidisers (5.1) & organic peroxides (5.2)</td><td>Ammonium nitrate, peroxides</td></tr>
<tr><td>6</td><td>Toxic (6.1) & infectious (6.2)</td><td>Pesticides, medical waste</td></tr>
<tr><td>7</td><td>Radioactive</td><td>Medical isotopes</td></tr>
<tr><td>8</td><td>Corrosives</td><td>Acids, batteries</td></tr>
<tr><td>9</td><td>Miscellaneous</td><td>Lithium batteries, dry ice</td></tr>
</tbody></table></div>
<p>Each DG box needs a <b>DG declaration</b>, <b>UN number</b>, proper shipping name, placards on all 4 sides, and an <b>emergency schedule (EmS)</b>. The yard must apply <b>segregation</b> (e.g. class 1 and class 5.1 far apart) and some classes (1, 7, some 2.3/6.1) are <b>direct delivery only</b> — ship-to-truck, never stored.</p>
<div class="note warn"><strong>Lesson from history</strong>Large explosions in ports (e.g. ammonium nitrate stored for years) show why abandoned DG must be reported, inspected and removed — never “forgotten in a warehouse”.</div>
<h3>Out of gauge (OOG)</h3>
<ul>
<li>Over-height, over-width, over-length on flat racks / open tops.</li>
<li>Needs: exact dimensions & weight, centre of gravity, lifting points, special gear (slings, overheight frame), sometimes a lifting plan and survey.</li>
<li>Uses extra slots on board (“lost slots”) — billed to the line.</li>
</ul>
<h3>Emergency basics (DG leak)</h3>
<ol><li>Stop work, evacuate upwind, isolate the area.</li><li>Identify UN number → EmS / safety data sheet.</li><li>Call emergency services & HSE; inform line, port authority.</li><li>Containment only by trained responders with PPE.</li><li>Report and investigate.</li></ol>`,
`
<h3>المبرّدات</h3>
<ul>
<li>توصيلها بالكهرباء خلال <b>~30–60 دقيقة</b> من التفريغ/الدخول (حسب البضاعة). ويُسجَّل وقت الفصل.</li>
<li>مراقبة الحرارة (جولات يدوية كل 4–6 ساعات أو مراقبة عن بُعد RCM). أبلغ الخط فورًا بأي <b>انحراف</b>.</li>
<li>درجة الضبط مقابل هواء التزويد/العودة، الرطوبة، التهوية (م³/ساعة)، الجو المتحكَّم به CA.</li>
<li><b>فحص ما قبل الرحلة (PTI)</b> قبل إطلاق مبرّدة فارغة للتصدير.</li>
<li>مبرّد (مثلًا +2 °م للفواكه) مقابل مجمّد (−18 °م للحوم، −25 °م للسمك)؛ الأدوية دقيقة جدًا (+2/+8 °م).</li>
</ul>
<h3>البضائع الخطرة (مدوّنة IMDG) — الفئات التسع</h3>
<div class="table-wrap"><table><thead><tr><th>الفئة</th><th>الخطر</th><th>مثال</th></tr></thead><tbody>
<tr><td>1</td><td>متفجّرات</td><td>ألعاب نارية، ذخيرة</td></tr>
<tr><td>2</td><td>غازات (2.1 قابلة للاشتعال، 2.2 غير قابلة، 2.3 سامّة)</td><td>غاز البترول المسال، البخّاخات</td></tr>
<tr><td>3</td><td>سوائل قابلة للاشتعال</td><td>دهانات، مذيبات، وقود</td></tr>
<tr><td>4</td><td>مواد صلبة قابلة للاشتعال (4.1، 4.2 تلقائية، 4.3 خطرة عند البلل)</td><td>أعواد الثقاب، الفحم</td></tr>
<tr><td>5</td><td>مؤكسِدات (5.1) وبيروكسيدات عضوية (5.2)</td><td>نترات الأمونيوم، البيروكسيدات</td></tr>
<tr><td>6</td><td>سامّة (6.1) ومُعدية (6.2)</td><td>المبيدات، النفايات الطبية</td></tr>
<tr><td>7</td><td>مشعّة</td><td>نظائر طبية</td></tr>
<tr><td>8</td><td>أكّالة</td><td>الأحماض، البطاريات</td></tr>
<tr><td>9</td><td>متنوّعة</td><td>بطاريات الليثيوم، الثلج الجاف</td></tr>
</tbody></table></div>
<p>كل حاوية خطرة تحتاج <b>بيان بضائع خطرة</b> و<b>رقم UN</b> واسم الشحن الصحيح وملصقات على الجوانب الأربعة و<b>جدول طوارئ (EmS)</b>. يجب أن تطبّق الساحة <b>الفصل</b> (مثلًا الفئة 1 والفئة 5.1 متباعدتان) وبعض الفئات (1، 7، بعض 2.3/6.1) <b>تسليم مباشر فقط</b> — من السفينة إلى الشاحنة، لا تُخزَّن أبدًا.</p>
<div class="note warn"><strong>درس من التاريخ</strong>الانفجارات الكبيرة في الموانئ (مثل نترات الأمونيوم المخزّنة لسنوات) تُظهر لماذا يجب الإبلاغ عن البضائع الخطرة المتروكة ومعاينتها وإزالتها — لا “نسيانها في مستودع”.</div>
<h3>خارج المقاس (OOG)</h3>
<ul>
<li>زيادة في الارتفاع أو العرض أو الطول على المسطّحات / مفتوحة السقف.</li>
<li>تحتاج: أبعاد ووزن دقيقة، مركز الثقل، نقاط الرفع، معدّات خاصة (حبال، إطار للارتفاع الزائد)، وأحيانًا خطة رفع ومعاينة.</li>
<li>تستهلك خانات إضافية على السفينة (“خانات مفقودة”) — تُفوتر للخط.</li>
</ul>
<h3>أساسيات الطوارئ (تسرّب مواد خطرة)</h3>
<ol><li>أوقف العمل، أخلِ المنطقة بعكس اتجاه الريح، اعزل المكان.</li><li>حدّد رقم UN ← جدول EmS / صحيفة بيانات السلامة.</li><li>اتّصل بخدمات الطوارئ والسلامة؛ أبلغ الخط وسلطة الميناء.</li><li>الاحتواء فقط من قبل مستجيبين مدرّبين بمعدّات الوقاية.</li><li>التقرير والتحقيق.</li></ol>`),
    keys: [L('Plug reefers fast and log every deviation.', 'وصّل المبرّدات بسرعة وسجّل كل انحراف.'), L('9 IMDG classes; segregation and direct-delivery rules.', '9 فئات IMDG؛ قواعد الفصل والتسليم المباشر.'), L('OOG needs dimensions, CoG, gear and a lifting plan.', 'خارج المقاس يحتاج الأبعاد ومركز الثقل والمعدّات وخطة رفع.')],
    senior: L('Run a monthly DG inventory audit: every DG box in the yard, its class, days in yard and segregation check. Anything over 30 days goes to the port authority list. Never let DG become “long-stay”.', 'نفّذ تدقيقًا شهريًا لمخزون البضائع الخطرة: كل حاوية خطرة في الساحة وفئتها وأيام بقائها وفحص الفصل. أي حاوية فوق 30 يومًا تُرفع إلى قائمة سلطة الميناء. لا تسمح أبدًا للخطرة أن تصبح “طويلة البقاء”.'),
    quiz: [
      Q(L('Class 8 means…', 'الفئة 8 تعني…'), [L('Explosives', 'متفجّرات'), L('Corrosives', 'أكّالة'), L('Radioactive', 'مشعّة'), L('Gases', 'غازات')], 1, L('Class 8 = corrosive substances.', 'الفئة 8 = المواد الأكّالة.')),
      Q(L('A frozen reefer shows −12 °C with setpoint −18 °C. First action?', 'مبرّدة مجمّدة تُظهر −12 °م والضبط −18 °م. أول إجراء؟'), [L('Wait for next round', 'الانتظار للجولة التالية'), L('Check plug/unit, call reefer tech, notify the line', 'افحص المقبس/الوحدة، اطلب فنّي المبرّدات، أبلغ الخط'), L('Change setpoint', 'تغيير درجة الضبط'), L('Move it to the dry block', 'نقلها لكتلة الجاف')], 1, L('Never change the setpoint without the line’s written instruction.', 'لا تغيّر درجة الضبط أبدًا دون تعليمات مكتوبة من الخط.')),
      Q(L('Which cargo is typically direct-delivery only?', 'أي بضاعة تكون عادةً للتسليم المباشر فقط؟'), [L('Class 3 paints', 'دهانات الفئة 3'), L('Class 1 explosives', 'متفجّرات الفئة 1'), L('Class 9 batteries', 'بطاريات الفئة 9'), L('Empty reefers', 'مبرّدات فارغة')], 1, L('Explosives (and often class 7) are not stored in the yard.', 'المتفجّرات (وغالبًا الفئة 7) لا تُخزَّن في الساحة.')),
      Q(L('First step in a DG leak?', 'أول خطوة في تسرّب مواد خطرة؟'), [L('Hose it with water', 'رشّها بالماء'), L('Stop work, evacuate upwind, isolate', 'أوقف العمل، أخلِ بعكس الريح، اعزل'), L('Load it quickly', 'حمّلها بسرعة'), L('Open the doors to check', 'افتح الأبواب للتحقّق')], 1, L('Safety of people first; identify the UN number before any action.', 'سلامة الناس أولًا؛ حدّد رقم UN قبل أي إجراء.')),
    ],
  });

  add({
    id: 'customs', lvl: 3, icon: '🛃', min: 12,
    title: L('Customs, inspection & holds', 'الجمارك والمعاينة والحجوزات'),
    sub: L('Release flow, risk lanes, scanning, physical inspection logistics and hold types.', 'تدفّق الإفراج، مسارات المخاطر، الفحص بالأشعة، لوجستيات المعاينة الفعلية وأنواع الحجوزات.'),
    body: L(`
<h3>Holds you will meet in the TOS</h3>
<div class="table-wrap"><table><thead><tr><th>Hold</th><th>Placed by</th><th>Lifted when</th></tr></thead><tbody>
<tr><td>Customs hold</td><td>Customs</td><td>Declaration cleared / inspection done</td></tr>
<tr><td>Line (commercial) hold</td><td>Shipping line</td><td>Freight paid, OBL surrendered, D/O issued</td></tr>
<tr><td>Terminal (financial) hold</td><td>Terminal</td><td>Storage / handling charges paid</td></tr>
<tr><td>Inspection/scan hold</td><td>Customs/other agency</td><td>Scan image cleared or physical check done</td></tr>
<tr><td>Agency holds (health, agriculture, standards)</td><td>Ministries</td><td>Certificate/analysis approved</td></tr>
<tr><td>Damage / security hold</td><td>Terminal / port security</td><td>Survey / investigation closed</td></tr>
</tbody></table></div>
<h3>Risk lanes (typical)</h3>
<ul><li><b>Green</b>: documentary release.</li><li><b>Yellow</b>: document check.</li><li><b>Red</b>: physical inspection (stripping).</li><li><b>Blue / scan</b>: non-intrusive inspection (X-ray scanner).</li></ul>
<h3>Terminal logistics of inspection</h3>
<p>Each inspection costs the terminal: move box to the inspection area, open, strip, wait, re-stuff, return (4–6 moves). Plan inspection slots with customs daily, group boxes by inspection area, and bill the agreed tariff.</p>
<div class="ex" data-t="Critical rule">A box with an active customs hold must <b>never</b> be loaded or gated out. The TOS should block it — but you check the load list for holds before every vessel anyway.</div>`,
`
<h3>الحجوزات التي ستراها في نظام TOS</h3>
<div class="table-wrap"><table><thead><tr><th>الحجز</th><th>يضعه</th><th>يُرفع عندما</th></tr></thead><tbody>
<tr><td>حجز جمركي</td><td>الجمارك</td><td>تخليص البيان / انتهاء المعاينة</td></tr>
<tr><td>حجز الخط (تجاري)</td><td>الخط الملاحي</td><td>دفع أجرة الشحن، تسليم البوليصة الأصلية، إصدار إذن التسليم</td></tr>
<tr><td>حجز المحطة (مالي)</td><td>المحطة</td><td>دفع رسوم التخزين / المناولة</td></tr>
<tr><td>حجز معاينة/فحص</td><td>الجمارك/جهة أخرى</td><td>اعتماد صورة الأشعة أو انتهاء الفحص الفعلي</td></tr>
<tr><td>حجوزات الجهات (الصحة، الزراعة، المواصفات)</td><td>الوزارات</td><td>اعتماد الشهادة/التحليل</td></tr>
<tr><td>حجز ضرر / أمني</td><td>المحطة / أمن الميناء</td><td>إغلاق المعاينة / التحقيق</td></tr>
</tbody></table></div>
<h3>مسارات المخاطر (نموذجيًا)</h3>
<ul><li><b>الأخضر</b>: إفراج مستندي.</li><li><b>الأصفر</b>: تدقيق مستندات.</li><li><b>الأحمر</b>: معاينة فعلية (تفريغ).</li><li><b>الأزرق / الأشعة</b>: فحص غير تدخّلي (ماسح أشعة).</li></ul>
<h3>لوجستيات المعاينة في المحطة</h3>
<p>كل معاينة تكلّف المحطة: نقل الحاوية لمنطقة المعاينة، فتحها، تفريغها، الانتظار، إعادة تعبئتها، إرجاعها (4–6 حركات). خطّط مواعيد المعاينة مع الجمارك يوميًا، جمّع الحاويات حسب منطقة المعاينة، وافوتر التعرفة المتّفق عليها.</p>
<div class="ex" data-t="قاعدة حرجة">الحاوية التي عليها حجز جمركي نشط <b>لا تُحمّل ولا تخرج أبدًا</b>. يجب أن يمنعها نظام TOS — لكنك تفحص قائمة التحميل بحثًا عن الحجوزات قبل كل سفينة على أي حال.</div>`),
    keys: [L('Customs, line, terminal and agency holds are independent.', 'حجوزات الجمارك والخط والمحطة والجهات مستقلّة عن بعضها.'), L('Inspections cost 4–6 moves — plan and bill them.', 'المعاينات تكلّف 4–6 حركات — خطّطها وافوترها.'), L('Never load or gate out a held box.', 'لا تحمّل ولا تُخرج حاوية محجوزة أبدًا.')],
    senior: L('Meet the customs shift chief every morning for 10 minutes: today’s inspections, scanner status, long-held boxes. Customs is your partner in dwell time.', 'قابل رئيس مناوبة الجمارك كل صباح لعشر دقائق: معاينات اليوم، حالة الماسح، الحاويات المحجوزة طويلًا. الجمارك شريكك في مدة البقاء.'),
    quiz: [
      Q(L('Storage unpaid. Which hold?', 'التخزين غير مدفوع. أي حجز؟'), [L('Customs', 'جمركي'), L('Terminal financial hold', 'حجز مالي من المحطة'), L('Line hold', 'حجز الخط'), L('Security', 'أمني')], 1, L('The terminal blocks release until its charges are paid.', 'المحطة تمنع الإفراج حتى تُدفع رسومها.')),
      Q(L('Red lane means…', 'المسار الأحمر يعني…'), [L('Documentary release', 'إفراج مستندي'), L('Physical inspection', 'معاينة فعلية'), L('X-ray only', 'أشعة فقط'), L('Export only', 'تصدير فقط')], 1, L('Red = physical examination.', 'الأحمر = فحص فعلي.')),
      Q(L('A box on the load list still has a customs hold 1 h before cut-off. You…', 'حاوية في قائمة التحميل ما زال عليها حجز جمركي قبل ساعة من الإغلاق. أنت…'), [L('Load it, hold will be lifted', 'تحمّلها، سيُرفع الحجز'), L('Do not load; inform the line it may be short-shipped', 'لا تحمّلها؛ أبلغ الخط أنها قد لا تُشحن'), L('Remove the hold in TOS', 'ترفع الحجز من النظام'), L('Hide it', 'تخفيها')], 1, L('Only customs can lift its hold.', 'الجمارك وحدها ترفع حجزها.')),
    ],
  });

  /* =========================================================== LEVEL 4 */
  add({
    id: 'depot', lvl: 4, icon: '🏭', min: 18,
    title: L('Empty depot operations & M&R', 'عمليات مستودع الفارغ والصيانة والإصلاح'),
    sub: L('Gate-in survey, IICL/CEDEX, grading, EOR estimates, liability, cleaning, PTI, release.', 'فحص الدخول، IICL/CEDEX، التصنيف، تقديرات الإصلاح EOR، المسؤولية، التنظيف، PTI، الإطلاق.'),
    body: L(`
<h3>The depot cycle</h3>
<ol>
<li><b>Gate-in</b> of an empty (returned by importer's trucker) against the line's return instruction.</li>
<li><b>Survey</b> (inspection) inside and outside, photos, EIR.</li>
<li><b>Estimate of repair (EOR)</b> in CEDEX codes (location + component + damage + repair).</li>
<li>Line approves → <b>repair</b> → <b>cleaning</b> (sweep, wash, chemical) → <b>grading</b>.</li>
<li>Stock as <b>available</b> → <b>release</b> to an exporter on a booking (COPARN) → gate-out with EIR.</li>
</ol>
<h3>Inspection standards</h3>
<p><b>IICL</b> (Institute of International Container Lessors) criteria define what is acceptable damage vs needs repair (e.g. dents, cuts, holes, bent parts, delaminated floor). <b>CEDEX</b> is the coding system used in repair estimates.</p>
<h3>Typical grading</h3>
<div class="table-wrap"><table><thead><tr><th>Grade</th><th>Meaning</th><th>Use</th></tr></thead><tbody>
<tr><td><b>A / Food grade</b></td><td>Clean, dry, odour-free, no rust/holes, perfect floor</td><td>Food, pharma, sensitive cargo</td></tr>
<tr><td><b>B / General</b></td><td>Sound, minor cosmetic damage</td><td>General cargo</td></tr>
<tr><td><b>C / Scrap-heavy cargo</b></td><td>Sound but worn</td><td>Scrap, stones, rough cargo</td></tr>
<tr><td><b>Damaged (DM)</b></td><td>Needs repair before use</td><td>Awaiting EOR approval</td></tr>
</tbody></table></div>
<h3>Who pays? (liability)</h3>
<ul>
<li><b>User damage</b> (forklift holes, cut floors, chemical contamination, cargo residue, labels/odour) → charged to the consignee/shipper via the line.</li>
<li><b>Wear & tear</b> (corrosion, age) → owner (line/lessor).</li>
<li>Damage noted on the <b>gate-out EIR</b> before the trucker took it → not the user's liability.</li>
</ul>
<div class="formula">EOR cost = Σ (labour hours × labour rate) + Σ material cost</div>
<h3>Reefers at the depot</h3>
<p>Pre-trip inspection (PTI): unit run test, temperature pull-down, alarms check, cleaning of drain holes. A reefer cannot be released as “sound” without a valid PTI.</p>
<h3>Depot KPIs</h3>
<ul><li>Days from gate-in to available (target &lt; 3–5 days).</li><li>% damaged stock, EOR approval time.</li><li>Stock vs demand by type (shortage/surplus).</li></ul>`,
`
<h3>دورة المستودع</h3>
<ol>
<li><b>دخول</b> الحاوية الفارغة (يُرجعها ناقل المستورد) وفق تعليمات الإرجاع من الخط.</li>
<li><b>الفحص</b> من الداخل والخارج، صور، EIR.</li>
<li><b>تقدير الإصلاح (EOR)</b> برموز CEDEX (الموقع + المكوّن + الضرر + الإصلاح).</li>
<li>موافقة الخط ← <b>الإصلاح</b> ← <b>التنظيف</b> (كنس، غسيل، كيميائي) ← <b>التصنيف</b>.</li>
<li>تخزين كـ <b>متاحة</b> ← <b>إطلاق</b> لمصدّر على حجز (COPARN) ← خروج مع EIR.</li>
</ol>
<h3>معايير الفحص</h3>
<p>معايير <b>IICL</b> (معهد مؤجّري الحاويات الدولي) تحدّد ما هو ضرر مقبول وما يحتاج إصلاحًا (مثل الانبعاجات، القطوع، الثقوب، الأجزاء المنحنية، الأرضية المتقشّرة). و<b>CEDEX</b> هو نظام الترميز المستخدم في تقديرات الإصلاح.</p>
<h3>التصنيف النموذجي</h3>
<div class="table-wrap"><table><thead><tr><th>الدرجة</th><th>المعنى</th><th>الاستخدام</th></tr></thead><tbody>
<tr><td><b>A / صالحة للغذاء</b></td><td>نظيفة، جافة، بلا رائحة، بلا صدأ/ثقوب، أرضية ممتازة</td><td>الأغذية، الأدوية، البضائع الحسّاسة</td></tr>
<tr><td><b>B / عامة</b></td><td>سليمة، أضرار شكلية بسيطة</td><td>البضائع العامة</td></tr>
<tr><td><b>C / للخردة والبضائع الثقيلة</b></td><td>سليمة لكن مستهلكة</td><td>الخردة، الحجارة، البضائع الخشنة</td></tr>
<tr><td><b>متضرّرة (DM)</b></td><td>تحتاج إصلاحًا قبل الاستخدام</td><td>بانتظار موافقة EOR</td></tr>
</tbody></table></div>
<h3>من يدفع؟ (المسؤولية)</h3>
<ul>
<li><b>ضرر المستخدم</b> (ثقوب الرافعة الشوكية، أرضية مقطوعة، تلوّث كيميائي، بقايا بضاعة، ملصقات/روائح) ← يُحمَّل على المستورد/الشاحن عبر الخط.</li>
<li><b>الاستهلاك الطبيعي</b> (الصدأ، العمر) ← على المالك (الخط/المؤجّر).</li>
<li>الضرر المسجّل على <b>EIR الخروج</b> قبل أن يأخذها الناقل ← ليس على مسؤولية المستخدم.</li>
</ul>
<div class="formula">EOR cost = Σ (labour hours × labour rate) + Σ material cost</div>
<h3>المبرّدات في المستودع</h3>
<p>فحص ما قبل الرحلة (PTI): اختبار تشغيل الوحدة، خفض الحرارة، فحص الإنذارات، تنظيف فتحات التصريف. لا يمكن إطلاق مبرّدة كـ “سليمة” دون PTI صالح.</p>
<h3>مؤشرات المستودع</h3>
<ul><li>الأيام من الدخول حتى الإتاحة (الهدف &lt; 3–5 أيام).</li><li>نسبة المخزون المتضرّر، زمن اعتماد EOR.</li><li>المخزون مقابل الطلب حسب النوع (عجز/فائض).</li></ul>`),
    keys: [L('Survey → EOR → approval → repair → clean → grade → release.', 'الفحص ← التقدير ← الموافقة ← الإصلاح ← التنظيف ← التصنيف ← الإطلاق.'), L('User damage vs wear & tear decides who pays.', 'ضرر المستخدم مقابل الاستهلاك يحدّد من يدفع.'), L('Food-grade bookings need grade A boxes.', 'حجوزات الأغذية تحتاج حاويات درجة A.')],
    senior: L('Photograph every box at gate-in AND gate-out, with a timestamp. 80% of damage disputes are won or lost on photos.', 'صوّر كل حاوية عند الدخول والخروج مع ختم زمني. 80% من نزاعات الأضرار تُربح أو تُخسر بالصور.'),
    quiz: [
      Q(L('Forklift hole in the side panel at return. Liability?', 'ثقب رافعة شوكية في اللوح الجانبي عند الإرجاع. المسؤولية؟'), [L('Owner — wear & tear', 'المالك — استهلاك'), L('User (consignee) damage', 'ضرر المستخدم (المستورد)'), L('Depot', 'المستودع'), L('Nobody', 'لا أحد')], 1, L('Handling damage by cargo interests is user damage.', 'ضرر المناولة من أصحاب البضاعة هو ضرر مستخدم.')),
      Q(L('Repair: 3.5 h labour at USD 20/h + USD 85 materials. EOR?', 'إصلاح: 3.5 ساعة عمل بـ 20 دولار/ساعة + 85 دولار مواد. التقدير؟'), [L('USD 105', '105 دولار'), L('USD 155', '155 دولار'), L('USD 70', '70 دولارًا'), L('USD 175', '175 دولارًا')], 1, L('3.5 × 20 = 70 + 85 = 155.', '3.5 × 20 = 70 + 85 = 155.')),
      Q(L('Exporter of tahini needs a container. Minimum grade?', 'مصدّر طحينة يحتاج حاوية. الدرجة الدنيا؟'), [L('A / food grade', 'A / صالحة للغذاء'), L('B', 'B'), L('C', 'C'), L('DM', 'DM')], 0, L('Food cargo requires clean, odour-free food-grade boxes.', 'الأغذية تتطلّب حاويات نظيفة بلا رائحة صالحة للغذاء.')),
      Q(L('What must a reefer pass before release?', 'ما الذي يجب أن تجتازه المبرّدة قبل الإطلاق؟'), [L('VGM', 'VGM'), L('PTI', 'PTI'), L('CEDEX', 'CEDEX'), L('Scan', 'الأشعة')], 1, L('Pre-Trip Inspection.', 'فحص ما قبل الرحلة.')),
    ],
  });

  add({
    id: 'eqcontrol', lvl: 4, icon: '🔄', min: 14,
    title: L('Equipment control & empty repositioning', 'التحكّم بالمعدّات وإعادة تموضع الفارغ'),
    sub: L('Imbalance, stock targets, forecasting, repositioning, street turns and leasing.', 'عدم التوازن، أهداف المخزون، التنبّؤ، إعادة التموضع، الاستخدام المباشر والتأجير.'),
    body: L(`
<h3>The imbalance problem</h3>
<p>Trade is unbalanced: importing regions accumulate empties, exporting regions lack them. Moving empties costs money and earns nothing — around 20% of all container moves worldwide are empty moves.</p>
<h3>Stock planning</h3>
<div class="formula">Projected stock (day d) = Stock today + Expected returns − Expected releases ± Repositioning in/out
Days of cover = Available sound stock ÷ Average daily demand</div>
<p>Each line sets <b>min/max stock</b> per type per depot. Below min → order repositioning or reduce release; above max → evacuate empties to deficit areas.</p>
<h3>Levers</h3>
<ul>
<li><b>Street turn / triangulation</b>: an import empty goes directly to an exporter without returning to the depot (saves two truck moves).</li>
<li><b>Substitution</b>: offer 40′ HC instead of 40′ DV, or two 20′ for one 40′.</li>
<li>Speed up <b>repairs</b> of damaged stock (fastest new supply!).</li>
<li><b>Repositioning</b> by sea (empty loading at low rates on ships with spare capacity), rail or truck.</li>
<li><b>One-way leases</b> from lessors.</li>
<li><b>Detention tariffs</b> to bring empties back faster.</li>
</ul>
<div class="ex" data-t="Example">Depot stock 40′ HC sound: 120. Daily releases 45, daily returns 30, 25 damaged boxes can be repaired in 2 days. Days of cover = 120 ÷ 45 = 2.7 days. Net daily −15 → day 5 stock ≈ 120 − 75 + 25 = 70. Fine for the week, but order a repositioning if a big booking (e.g. 80 × 40′ HC) arrives.</div>`,
`
<h3>مشكلة عدم التوازن</h3>
<p>التجارة غير متوازنة: المناطق المستوردة تتراكم فيها الحاويات الفارغة، والمناطق المصدّرة تفتقر إليها. نقل الفارغ يكلّف المال ولا يُدرّ شيئًا — حوالي 20% من كل حركات الحاويات عالميًا هي حركات فارغة.</p>
<h3>تخطيط المخزون</h3>
<div class="formula">Projected stock (day d) = Stock today + Expected returns − Expected releases ± Repositioning in/out
Days of cover = Available sound stock ÷ Average daily demand</div>
<p>يحدّد كل خط <b>حدًّا أدنى وأقصى للمخزون</b> لكل نوع ولكل مستودع. تحت الأدنى ← اطلب إعادة تموضع أو قلّل الإطلاق؛ فوق الأقصى ← أخلِ الفارغ إلى مناطق العجز.</p>
<h3>الأدوات</h3>
<ul>
<li><b>الاستخدام المباشر (Street turn)</b>: حاوية استيراد فارغة تذهب مباشرة إلى مصدّر دون العودة للمستودع (توفّر رحلتي شاحنة).</li>
<li><b>الاستبدال</b>: عرض 40′ عالية بدل 40′ عادية، أو حاويتي 20′ بدل 40′.</li>
<li>تسريع <b>إصلاح</b> المخزون المتضرّر (أسرع مصدر جديد!).</li>
<li><b>إعادة التموضع</b> بحرًا (تحميل الفارغ بأسعار منخفضة على سفن فيها سعة)، أو بالقطار أو الشاحنة.</li>
<li><b>التأجير باتجاه واحد</b> من المؤجّرين.</li>
<li><b>تعرفة الاحتجاز</b> لإعادة الفارغ أسرع.</li>
</ul>
<div class="ex" data-t="مثال">مخزون 40′ عالية سليم: 120. الإطلاق اليومي 45، الإرجاع اليومي 30، و25 حاوية متضرّرة يمكن إصلاحها خلال يومين. أيام التغطية = 120 ÷ 45 = 2.7 يوم. الصافي اليومي −15 ← مخزون اليوم الخامس ≈ 120 − 75 + 25 = 70. جيد للأسبوع، لكن اطلب إعادة تموضع إن وصل حجز كبير (مثلًا 80 × 40′ عالية).</div>`),
    keys: [L('Days of cover = sound stock ÷ daily demand.', 'أيام التغطية = المخزون السليم ÷ الطلب اليومي.'), L('Repairs and street turns are the cheapest new supply.', 'الإصلاحات والاستخدام المباشر أرخص مصدر جديد.'), L('Empty moves earn nothing — minimise them.', 'حركات الفارغ لا تُدرّ شيئًا — قلّلها.')],
    senior: L('Share a daily “empty availability by type” table with sales. When sales know there are only 2 days of 40′ HC cover, they stop promising what you cannot deliver.', 'شارك جدولًا يوميًا “بتوفّر الفارغ حسب النوع” مع المبيعات. عندما تعرف المبيعات أن التغطية ليومين فقط لـ 40′ عالية، تتوقّف عن وعود لا يمكنك تنفيذها.'),
    quiz: [
      Q(L('Sound stock 90, daily demand 30. Days of cover?', 'مخزون سليم 90، الطلب اليومي 30. أيام التغطية؟'), [L('2', '2'), L('3', '3'), L('30', '30'), L('120', '120')], 1, L('90 ÷ 30 = 3 days.', '90 ÷ 30 = 3 أيام.')),
      Q(L('A street turn means…', 'الاستخدام المباشر يعني…'), [L('Truck U-turn at gate', 'التفاف الشاحنة على البوابة'), L('Re-using an import empty directly for an export without depot return', 'إعادة استخدام فارغ الاستيراد مباشرة للتصدير دون العودة للمستودع'), L('Moving empties by rail', 'نقل الفارغ بالقطار'), L('Returning a box late', 'إرجاع حاوية متأخّرة')], 1, L('Saves two empty truck trips.', 'يوفّر رحلتي شاحنة فارغة.')),
      Q(L('Fastest way to add sound 40′ HC stock at the depot?', 'أسرع طريقة لإضافة مخزون سليم من 40′ عالية في المستودع؟'), [L('Order new boxes from the factory', 'طلب حاويات جديدة من المصنع'), L('Approve & repair damaged 40′ HC already in stock', 'اعتماد وإصلاح حاويات 40′ عالية المتضرّرة الموجودة'), L('Wait for imports', 'انتظار الاستيراد'), L('Raise prices', 'رفع الأسعار')], 1, L('Repair turns damaged stock into available stock in days.', 'الإصلاح يحوّل المتضرّر إلى متاح خلال أيام.')),
    ],
  });

  add({
    id: 'dnd', lvl: 4, icon: '💰', min: 16,
    title: L('Demurrage, detention & storage', 'الغرامات: التأخير والاحتجاز والتخزين'),
    sub: L('Who charges what, free time, tiered tariffs and how to calculate them correctly.', 'من يفرض ماذا، المدة المجانية، التعرفة المتدرّجة وكيفية حسابها بدقّة.'),
    body: L(`
<h3>Three different charges — do not mix them up</h3>
<div class="table-wrap"><table><thead><tr><th>Charge</th><th>Charged by</th><th>For</th><th>Clock</th></tr></thead><tbody>
<tr><td><b>Demurrage</b></td><td>Shipping line</td><td>Using the line's box <i>inside</i> the terminal beyond free time</td><td>Discharge → gate-out (import); gate-in → loading (export)</td></tr>
<tr><td><b>Detention</b></td><td>Shipping line</td><td>Keeping the line's box <i>outside</i> the terminal beyond free time</td><td>Gate-out full → empty return (import)</td></tr>
<tr><td><b>Storage</b></td><td>Terminal (or port)</td><td>Occupying space in the terminal</td><td>From discharge/gate-in, terminal free days</td></tr>
</tbody></table></div>
<p>Some lines combine demurrage + detention into one free period (“merged D&D”).</p>
<h3>Tiered tariff calculation</h3>
<div class="ex" data-t="Example — import 40′, storage">Free 5 days, then days 6–10: USD 12/day, days 11–20: USD 25/day, 21+: USD 40/day. Box stays 16 days.<br>Chargeable: days 6–10 = 5 × 12 = 60; days 11–16 = 6 × 25 = 150. <b>Total USD 210</b>.</div>
<div class="formula">Days counted = (end date − start date) + 1   ← most tariffs count both first and last day (calendar days)</div>
<p>Always check the tariff: calendar days vs working days, does the free time include Sundays/holidays, does the day of discharge count?</p>
<h3>Why storage tariffs are an operations tool</h3>
<p>Progressive storage pushes cargo owners to clear and collect quickly → lower dwell → more yard capacity. Too cheap storage turns your terminal into a free warehouse.</p>
<h3>Disputes</h3>
<p>Typical arguments: port congestion, customs delays, terminal not able to deliver (equipment breakdown), wrong free time. Your evidence: TOS event times, appointment logs, holds history.</p>`,
`
<h3>ثلاث رسوم مختلفة — لا تخلط بينها</h3>
<div class="table-wrap"><table><thead><tr><th>الرسم</th><th>يفرضه</th><th>مقابل</th><th>العدّاد</th></tr></thead><tbody>
<tr><td><b>Demurrage (غرامة التأخير)</b></td><td>الخط الملاحي</td><td>استخدام حاوية الخط <i>داخل</i> المحطة بعد المدة المجانية</td><td>التفريغ ← الخروج (استيراد)؛ الدخول ← التحميل (تصدير)</td></tr>
<tr><td><b>Detention (غرامة الاحتجاز)</b></td><td>الخط الملاحي</td><td>الاحتفاظ بحاوية الخط <i>خارج</i> المحطة بعد المدة المجانية</td><td>خروج ممتلئة ← إرجاع فارغة (استيراد)</td></tr>
<tr><td><b>Storage (التخزين)</b></td><td>المحطة (أو الميناء)</td><td>إشغال مساحة في المحطة</td><td>من التفريغ/الدخول، بعد أيام المحطة المجانية</td></tr>
</tbody></table></div>
<p>بعض الخطوط تدمج التأخير + الاحتجاز في مدة مجانية واحدة (“D&D مدمجة”).</p>
<h3>حساب التعرفة المتدرّجة</h3>
<div class="ex" data-t="مثال — استيراد 40′، تخزين">مجاني 5 أيام، ثم الأيام 6–10: 12 دولارًا/يوم، الأيام 11–20: 25 دولارًا/يوم، 21+: 40 دولارًا/يوم. بقيت الحاوية 16 يومًا.<br>المستحق: الأيام 6–10 = 5 × 12 = 60؛ الأيام 11–16 = 6 × 25 = 150. <b>المجموع 210 دولارات</b>.</div>
<div class="formula">Days counted = (end date − start date) + 1   ← most tariffs count both first and last day (calendar days)</div>
<p>تحقّق دائمًا من التعرفة: أيام تقويمية أم أيام عمل، هل تشمل المدة المجانية الأحد/العطل، هل يُحسب يوم التفريغ؟</p>
<h3>لماذا تعرفة التخزين أداة تشغيلية</h3>
<p>التخزين التصاعدي يدفع أصحاب البضائع للتخليص والاستلام بسرعة ← مدة بقاء أقل ← سعة ساحة أكبر. التخزين الرخيص جدًا يحوّل محطتك إلى مستودع مجاني.</p>
<h3>النزاعات</h3>
<p>الحجج النموذجية: ازدحام الميناء، تأخيرات الجمارك، عجز المحطة عن التسليم (عطل معدّات)، مدة مجانية خاطئة. أدلّتك: أوقات أحداث TOS، سجلّات المواعيد، تاريخ الحجوزات.</p>`),
    keys: [L('Demurrage = inside terminal; detention = outside; storage = terminal space.', 'التأخير = داخل المحطة؛ الاحتجاز = خارجها؛ التخزين = مساحة المحطة.'), L('Compute tiers one band at a time.', 'احسب الشرائح شريحة شريحة.'), L('Check the day-counting rule.', 'تحقّق من قاعدة عدّ الأيام.')],
    senior: L('When a customer disputes storage, pull the TOS timeline first: discharge, holds placed/lifted, appointments booked/missed. Decide on facts — waive quickly when you were at fault, hold firm when you were not.', 'عندما يعترض زبون على التخزين، استخرج أولًا الجدول الزمني من TOS: التفريغ، الحجوزات الموضوعة/المرفوعة، المواعيد المحجوزة/الفائتة. قرّر بناءً على الحقائق — أعفِ بسرعة إن كان الخطأ منك، وتمسّك بموقفك إن لم يكن.'),
    quiz: [
      Q(L('Importer keeps the full box at their warehouse 12 days. Charge?', 'المستورد يحتفظ بالحاوية الممتلئة في مستودعه 12 يومًا. الرسم؟'), [L('Storage', 'تخزين'), L('Detention', 'احتجاز'), L('Demurrage', 'تأخير'), L('THC', 'رسوم مناولة')], 1, L('Outside the terminal = detention.', 'خارج المحطة = احتجاز.')),
      Q(L('Free 4 days, then USD 20/day. Box stayed 9 days. Storage?', 'مجاني 4 أيام ثم 20 دولارًا/يوم. بقيت الحاوية 9 أيام. التخزين؟'), [L('USD 180', '180 دولارًا'), L('USD 100', '100 دولار'), L('USD 80', '80 دولارًا'), L('USD 120', '120 دولارًا')], 1, L('9 − 4 = 5 days × 20 = 100.', '9 − 4 = 5 أيام × 20 = 100.')),
      Q(L('Discharged 3 March, gate-out 10 March, both days counted. Days?', 'فُرّغت 3 آذار وخرجت 10 آذار، مع عدّ اليومين. كم يومًا؟'), [L('7', '7'), L('8', '8'), L('9', '9'), L('10', '10')], 1, L('10 − 3 + 1 = 8 days.', '10 − 3 + 1 = 8 أيام.')),
    ],
  });

  add({
    id: 'maintenance', lvl: 4, icon: '🛠', min: 12,
    title: L('Equipment maintenance & availability', 'صيانة المعدّات وتوفّرها'),
    sub: L('Preventive vs corrective, availability, MTBF/MTTR, spare parts, fleet sizing.', 'الوقائية مقابل التصحيحية، التوفّر، MTBF/MTTR، قطع الغيار، تحديد حجم الأسطول.'),
    body: L(`
<h3>Why operations managers care about maintenance</h3>
<p>Every hour a crane is down during a vessel call is lost productivity and a possible missed window. Operations and engineering must plan together.</p>
<h3>Key indicators</h3>
<div class="formula">Technical availability % = (Scheduled hours − Breakdown hours) ÷ Scheduled hours × 100
MTBF = Operating hours ÷ Number of failures
MTTR = Total repair hours ÷ Number of failures</div>
<p>Targets: STS availability ≥ 95–98%, RTG ≥ 90–95%.</p>
<h3>Maintenance types</h3>
<ul>
<li><b>Preventive (PM)</b>: scheduled by hours/calendar (lubrication, wire ropes, brakes, spreader).</li>
<li><b>Predictive / condition-based</b>: sensors, vibration, oil analysis.</li>
<li><b>Corrective</b>: after breakdown — most expensive.</li>
</ul>
<h3>Planning PM around operations</h3>
<p>Schedule crane PM in <b>berth gaps</b> (use the berth plan!), never during a window vessel. Keep a critical spares list (spreader, twistlocks, hoist motor parts) — waiting 3 weeks for a part is a business failure.</p>
<div class="ex" data-t="Example">RTG fleet: 24 machines, 2 in PM, 1 broken → 21 available (87.5%). Yard needs 1 RTG per 1.5 working STS cranes + 4 for gate/housekeeping. With 9 STS working: 6 + 4 = 10 → enough. With a mega-vessel peak (and 2 more breakdowns) you still cope, but PM should move away from that day.</div>`,
`
<h3>لماذا يهتمّ مديرو العمليات بالصيانة</h3>
<p>كل ساعة تتوقّف فيها رافعة أثناء زيارة سفينة هي إنتاجية ضائعة ونافذة قد تُفوَّت. يجب أن تخطّط العمليات والهندسة معًا.</p>
<h3>المؤشرات الرئيسية</h3>
<div class="formula">Technical availability % = (Scheduled hours − Breakdown hours) ÷ Scheduled hours × 100
MTBF = Operating hours ÷ Number of failures
MTTR = Total repair hours ÷ Number of failures</div>
<p>الأهداف: توفّر STS ≥ 95–98%، وRTG ≥ 90–95%.</p>
<h3>أنواع الصيانة</h3>
<ul>
<li><b>وقائية (PM)</b>: مجدولة حسب الساعات/التقويم (التشحيم، الحبال الفولاذية، المكابح، أداة الرفع).</li>
<li><b>تنبّؤية / حسب الحالة</b>: حسّاسات، اهتزاز، تحليل الزيت.</li>
<li><b>تصحيحية</b>: بعد العطل — الأغلى.</li>
</ul>
<h3>تخطيط الصيانة الوقائية حول العمليات</h3>
<p>جدول صيانة الرافعات في <b>فجوات الرصيف</b> (استخدم خطة الأرصفة!)، ولا تجدولها أبدًا أثناء سفينة نافذة. احتفظ بقائمة قطع غيار حرجة (أداة الرفع، أقفال التثبيت، أجزاء محرّك الرفع) — انتظار قطعة 3 أسابيع فشل تجاري.</p>
<div class="ex" data-t="مثال">أسطول RTG: 24 رافعة، 2 في الصيانة، 1 معطّلة ← 21 متاحة (87.5%). الساحة تحتاج رافعة RTG لكل 1.5 رافعة رصيف عاملة + 4 للبوابة/الترتيب. مع 9 رافعات رصيف عاملة: 6 + 4 = 10 ← كافية. مع ذروة سفينة عملاقة (وعطلين إضافيين) ما زلت قادرًا، لكن يجب نقل الصيانة الوقائية بعيدًا عن ذلك اليوم.</div>`),
    keys: [L('Availability, MTBF, MTTR.', 'التوفّر، MTBF، MTTR.'), L('Plan PM in berth gaps.', 'خطّط الصيانة الوقائية في فجوات الرصيف.'), L('Keep critical spares on site.', 'احتفظ بقطع الغيار الحرجة في الموقع.')],
    senior: L('Attend the engineering morning meeting at least twice a week. Knowing that “crane 4 hoist brake is borderline” lets you give it the small feeder, not the 3,000-move mainliner.', 'احضر اجتماع الهندسة الصباحي مرتين أسبوعيًا على الأقل. معرفتك أن “مكبح رفع الرافعة 4 على الحدّ” تسمح لك بإعطائها سفينة الفيدر الصغيرة لا السفينة الرئيسية ذات 3,000 حركة.'),
    quiz: [
      Q(L('Crane scheduled 600 h, broke down 30 h. Availability?', 'رافعة مجدولة 600 ساعة وتعطّلت 30 ساعة. التوفّر؟'), [L('90%', '90%'), L('95%', '95%'), L('97%', '97%'), L('5%', '5%')], 1, L('(600 − 30) ÷ 600 = 95%.', '(600 − 30) ÷ 600 = 95%.')),
      Q(L('500 operating hours, 4 failures. MTBF?', '500 ساعة تشغيل و4 أعطال. MTBF؟'), [L('125 h', '125 ساعة'), L('2,000 h', '2,000 ساعة'), L('4 h', '4 ساعات'), L('0.8 h', '0.8 ساعة')], 0, L('500 ÷ 4 = 125 h.', '500 ÷ 4 = 125 ساعة.')),
      Q(L('Best time for STS crane preventive maintenance?', 'أفضل وقت للصيانة الوقائية لرافعة الرصيف؟'), [L('During the busiest window vessel', 'أثناء أكثر سفينة نافذة ازدحامًا'), L('In a planned berth gap', 'في فجوة رصيف مخطّطة'), L('Only after a breakdown', 'فقط بعد العطل'), L('Never', 'أبدًا')], 1, L('Use the berth plan to find gaps.', 'استخدم خطة الأرصفة لإيجاد الفجوات.')),
    ],
  });

  /* =========================================================== LEVEL 5 */
  add({
    id: 'kpis', lvl: 5, icon: '📊', min: 18,
    title: L('KPIs & performance management', 'مؤشرات الأداء وإدارة الأداء'),
    sub: L('The terminal scorecard: seaside, yard, landside, equipment, safety and finance.', 'بطاقة أداء المحطة: جهة البحر، الساحة، جهة البر، المعدّات، السلامة والمالية.'),
    body: L(`
<h3>The senior manager's scorecard</h3>
<div class="table-wrap"><table><thead><tr><th>Area</th><th>KPI</th><th>Good benchmark*</th></tr></thead><tbody>
<tr><td rowspan="4"><b>Seaside</b></td><td>GMPH / BMPH</td><td>Mainline 100–150 / feeder 50–80</td></tr>
<tr><td>Gross crane rate</td><td>25–32 mph</td></tr>
<tr><td>Berth occupancy</td><td>55–70%</td></tr>
<tr><td>Average waiting time (window vessels)</td><td>≈ 0 h</td></tr>
<tr><td rowspan="3"><b>Yard</b></td><td>Yard utilisation</td><td>&lt; 75–80%</td></tr>
<tr><td>Dwell time import / export</td><td>&lt; 5–7 / &lt; 4 days</td></tr>
<tr><td>Rehandle ratio</td><td>&lt; 10–15%</td></tr>
<tr><td rowspan="2"><b>Landside</b></td><td>Truck turnaround time</td><td>&lt; 30–45 min</td></tr>
<tr><td>Appointment compliance</td><td>&gt; 85%</td></tr>
<tr><td><b>Equipment</b></td><td>Technical availability STS / RTG</td><td>≥ 95% / ≥ 90%</td></tr>
<tr><td><b>Safety</b></td><td>LTIFR (lost-time injuries per 1M hours)</td><td>&lt; 1–2, trending down</td></tr>
<tr><td><b>Finance</b></td><td>Cost per move / revenue per TEU / EBITDA margin</td><td>trend & budget</td></tr>
</tbody></table></div>
<p><small>*Benchmarks vary widely by terminal type, size and automation. Compare with yourself over time first.</small></p>
<h3>Leading vs lagging indicators</h3>
<p><b>Lagging</b>: GMPH of last week, LTIFR. <b>Leading</b>: tomorrow's yard utilisation forecast, number of window vessels arriving late, crane PM backlog, near-miss reports. Seniors manage with leading indicators.</p>
<h3>How to run performance</h3>
<ol>
<li>Daily ops meeting (15 min): yesterday's numbers, today's plan, risks.</li>
<li>Weekly KPI review with root cause for every red KPI (5 Whys / fishbone).</li>
<li>Monthly report to management and to each shipping line (their own vessel performance).</li>
<li>Every KPI has <b>one owner</b>, a definition, a target and a data source.</li>
</ol>
<div class="formula">LTIFR = Lost-time injuries × 1,000,000 ÷ Hours worked
Cost per move = Total operating cost ÷ Total moves</div>`,
`
<h3>بطاقة أداء المدير الأول</h3>
<div class="table-wrap"><table><thead><tr><th>المجال</th><th>المؤشر</th><th>معيار جيد*</th></tr></thead><tbody>
<tr><td rowspan="4"><b>جهة البحر</b></td><td>GMPH / BMPH</td><td>رئيسية 100–150 / فيدر 50–80</td></tr>
<tr><td>معدّل الرافعة الإجمالي</td><td>25–32 حركة/ساعة</td></tr>
<tr><td>إشغال الرصيف</td><td>55–70%</td></tr>
<tr><td>متوسط وقت الانتظار (سفن النوافذ)</td><td>≈ 0 ساعة</td></tr>
<tr><td rowspan="3"><b>الساحة</b></td><td>استخدام الساحة</td><td>&lt; 75–80%</td></tr>
<tr><td>مدة البقاء استيراد / تصدير</td><td>&lt; 5–7 / &lt; 4 أيام</td></tr>
<tr><td>نسبة إعادة المناولة</td><td>&lt; 10–15%</td></tr>
<tr><td rowspan="2"><b>جهة البر</b></td><td>زمن دوران الشاحنة</td><td>&lt; 30–45 دقيقة</td></tr>
<tr><td>الالتزام بالمواعيد</td><td>&gt; 85%</td></tr>
<tr><td><b>المعدّات</b></td><td>التوفّر الفني STS / RTG</td><td>≥ 95% / ≥ 90%</td></tr>
<tr><td><b>السلامة</b></td><td>LTIFR (إصابات بفقدان وقت لكل مليون ساعة)</td><td>&lt; 1–2، باتجاه انخفاض</td></tr>
<tr><td><b>المالية</b></td><td>التكلفة لكل حركة / الإيراد لكل TEU / هامش EBITDA</td><td>الاتجاه والميزانية</td></tr>
</tbody></table></div>
<p><small>*المعايير تختلف كثيرًا حسب نوع المحطة وحجمها وأتمتتها. قارن نفسك بنفسك عبر الزمن أولًا.</small></p>
<h3>المؤشرات الاستباقية مقابل اللاحقة</h3>
<p><b>اللاحقة</b>: GMPH الأسبوع الماضي، LTIFR. <b>الاستباقية</b>: توقّع استخدام الساحة غدًا، عدد سفن النوافذ المتأخّرة، تراكم الصيانة الوقائية للرافعات، تقارير الحوادث الوشيكة. المحترفون يديرون بالمؤشرات الاستباقية.</p>
<h3>كيف تدير الأداء</h3>
<ol>
<li>اجتماع عمليات يومي (15 دقيقة): أرقام الأمس، خطة اليوم، المخاطر.</li>
<li>مراجعة أسبوعية للمؤشرات مع السبب الجذري لكل مؤشر أحمر (لماذا خمس مرات / عظم السمكة).</li>
<li>تقرير شهري للإدارة ولكل خط ملاحي (أداء سفنه).</li>
<li>لكل مؤشر <b>مالك واحد</b> وتعريف وهدف ومصدر بيانات.</li>
</ol>
<div class="formula">LTIFR = Lost-time injuries × 1,000,000 ÷ Hours worked
Cost per move = Total operating cost ÷ Total moves</div>`),
    keys: [L('Manage with leading indicators, report lagging ones.', 'أدِر بالمؤشرات الاستباقية، وبلّغ باللاحقة.'), L('Every KPI: one owner, a definition, a target.', 'لكل مؤشر: مالك واحد وتعريف وهدف.'), L('Root cause every red KPI.', 'ابحث عن السبب الجذري لكل مؤشر أحمر.')],
    senior: L('If you can only look at 3 numbers each morning: yesterday’s GMPH vs target, today’s yard utilisation forecast, and safety incidents/near misses. Everything else can wait for the weekly review.', 'إن كان بإمكانك النظر إلى 3 أرقام فقط كل صباح: GMPH الأمس مقابل الهدف، توقّع استخدام الساحة اليوم، وحوادث السلامة/الحوادث الوشيكة. كل شيء آخر يمكن أن ينتظر المراجعة الأسبوعية.'),
    quiz: [
      Q(L('3 lost-time injuries, 1.5 million hours worked. LTIFR?', '3 إصابات بفقدان وقت، 1.5 مليون ساعة عمل. LTIFR؟'), [L('4.5', '4.5'), L('2', '2'), L('0.5', '0.5'), L('3', '3')], 1, L('3 × 1,000,000 ÷ 1,500,000 = 2.', '3 × 1,000,000 ÷ 1,500,000 = 2.')),
      Q(L('Which is a leading indicator?', 'أيّ مما يلي مؤشر استباقي؟'), [L('Last month’s GMPH', 'GMPH الشهر الماضي'), L('Tomorrow’s yard utilisation forecast', 'توقّع استخدام الساحة غدًا'), L('Last year’s EBITDA', 'EBITDA السنة الماضية'), L('Last week’s LTIFR', 'LTIFR الأسبوع الماضي')], 1, L('It tells you about a problem before it happens.', 'يخبرك بالمشكلة قبل حدوثها.')),
      Q(L('Operating cost USD 4.2 M for 120,000 moves. Cost per move?', 'تكلفة التشغيل 4.2 مليون دولار لـ 120,000 حركة. التكلفة لكل حركة؟'), [L('USD 28', '28 دولارًا'), L('USD 35', '35 دولارًا'), L('USD 42', '42 دولارًا'), L('USD 3.5', '3.5 دولار')], 1, L('4,200,000 ÷ 120,000 = 35.', '4,200,000 ÷ 120,000 = 35.')),
    ],
  });

  add({
    id: 'hse', lvl: 5, icon: '🦺', min: 16,
    title: L('Safety, security & environment', 'السلامة والأمن والبيئة'),
    sub: L('HSE rules, ISPS Code, permits to work, incident reporting, environmental duties.', 'قواعد السلامة والصحة والبيئة، مدوّنة ISPS، تصاريح العمل، الإبلاغ عن الحوادث، الواجبات البيئية.'),
    body: L(`
<h3>Terminals are high-risk workplaces</h3>
<p>Heavy loads overhead, moving machines, people on foot, work at height (lashing), DG. The most frequent fatal causes: people struck by vehicles/equipment, falls from height, falling loads, crushing during lashing.</p>
<h3>Core safety rules</h3>
<ul>
<li><b>Segregate people from machines</b>: pedestrian-free zones, escorted access, people-carrier buses.</li>
<li>Full PPE: helmet, hi-vis, safety shoes, gloves, life jacket at quay edge.</li>
<li>Never walk under a suspended load; exclusion zones under STS cranes.</li>
<li><b>Permit to work</b> for hot work, work at height, confined spaces, electrical.</li>
<li><b>Lock-out / tag-out (LOTO)</b> before maintenance.</li>
<li>Wind limits: cranes stop at defined wind speed (e.g. 20 m/s), storm pins/tie-downs above a higher limit.</li>
<li><b>Stop-work authority</b>: anyone can stop an unsafe job.</li>
</ul>
<h3>Incident management</h3>
<p>Report everything — including <b>near misses</b>. The accident pyramid: for each serious accident there are many minor incidents and hundreds of near misses. Investigate with root cause, not blame.</p>
<h3>Security — ISPS Code</h3>
<ul>
<li>Port facility security plan, <b>PFSO</b> (Port Facility Security Officer), security levels 1–2–3.</li>
<li>Access control (ID cards, vehicle passes), CCTV, fences, patrols.</li>
<li>Declaration of Security (DoS) with ships when needed.</li>
<li>Threats: theft, smuggling (drugs in containers — “rip-on/rip-off”), stowaways, cyber attacks.</li>
</ul>
<h3>Environment</h3>
<ul><li>Spill response (oil, chemicals), waste reception from ships (MARPOL).</li><li>Emissions: electrified RTGs, shore power, idle-reduction for trucks.</li><li>Noise and light for neighbours; dust.</li></ul>`,
`
<h3>المحطات أماكن عمل عالية الخطورة</h3>
<p>أحمال ثقيلة معلّقة، آليات متحرّكة، أشخاص يمشون، العمل على ارتفاع (التثبيت)، مواد خطرة. أكثر أسباب الوفاة شيوعًا: الاصطدام بالمركبات/المعدّات، السقوط من ارتفاع، سقوط الأحمال، الانسحاق أثناء التثبيت.</p>
<h3>قواعد السلامة الأساسية</h3>
<ul>
<li><b>فصل الناس عن الآليات</b>: مناطق ممنوعة على المشاة، دخول مرافَق، حافلات لنقل الأشخاص.</li>
<li>معدّات الوقاية الكاملة: خوذة، سترة عاكسة، حذاء أمان، قفازات، سترة نجاة عند حافة الرصيف.</li>
<li>لا تمشِ أبدًا تحت حمولة معلّقة؛ مناطق محظورة تحت رافعات الرصيف.</li>
<li><b>تصريح عمل</b> للأعمال الساخنة والعمل على ارتفاع والأماكن المغلقة والكهرباء.</li>
<li><b>القفل والوسم (LOTO)</b> قبل الصيانة.</li>
<li>حدود الرياح: تتوقّف الرافعات عند سرعة رياح محدّدة (مثلًا 20 م/ث)، وتُثبَّت بأوتاد العاصفة فوق حدّ أعلى.</li>
<li><b>صلاحية إيقاف العمل</b>: أي شخص يمكنه إيقاف عمل غير آمن.</li>
</ul>
<h3>إدارة الحوادث</h3>
<p>أبلغ عن كل شيء — بما في ذلك <b>الحوادث الوشيكة</b>. هرم الحوادث: لكل حادث خطير هناك العديد من الحوادث البسيطة ومئات الحوادث الوشيكة. حقّق بالسبب الجذري لا باللوم.</p>
<h3>الأمن — مدوّنة ISPS</h3>
<ul>
<li>خطة أمن المرفق المينائي، <b>PFSO</b> (ضابط أمن المرفق المينائي)، مستويات الأمن 1–2–3.</li>
<li>التحكّم بالدخول (بطاقات هوية، تصاريح مركبات)، كاميرات، أسوار، دوريات.</li>
<li>إعلان الأمن (DoS) مع السفن عند الحاجة.</li>
<li>التهديدات: السرقة، التهريب (مخدّرات في الحاويات — “rip-on/rip-off”)، المتسلّلون، الهجمات السيبرانية.</li>
</ul>
<h3>البيئة</h3>
<ul><li>الاستجابة للتسرّبات (نفط، كيماويات)، استقبال نفايات السفن (MARPOL).</li><li>الانبعاثات: رافعات RTG كهربائية، طاقة الشاطئ، تقليل توقّف الشاحنات بمحرّكات دائرة.</li><li>الضجيج والإضاءة للجيران؛ الغبار.</li></ul>`),
    keys: [L('Separate people from machines.', 'افصل الناس عن الآليات.'), L('Report near misses; investigate root cause.', 'أبلغ عن الحوادث الوشيكة؛ حقّق بالسبب الجذري.'), L('ISPS: PFSO, security levels, access control.', 'ISPS: ضابط الأمن، مستويات الأمن، التحكّم بالدخول.')],
    senior: L('Walk the terminal at night at least once a week, unannounced. You will see the real safety culture — and the team will know that you care.', 'تجوّل في المحطة ليلًا مرة أسبوعيًا على الأقل دون إعلان. سترى ثقافة السلامة الحقيقية — وسيعرف الفريق أنك تهتمّ.'),
    quiz: [
      Q(L('A lasher sees a crane lifting over a walkway with people. He should…', 'عامل تثبيت يرى رافعة ترفع فوق ممرّ فيه أشخاص. يجب أن…'), [L('Report at shift end', 'يبلّغ في نهاية الوردية'), L('Use stop-work authority immediately', 'يستخدم صلاحية إيقاف العمل فورًا'), L('Ignore — not his job', 'يتجاهل — ليس عمله'), L('Take a photo', 'يلتقط صورة')], 1, L('Everyone has stop-work authority.', 'كل شخص لديه صلاحية إيقاف العمل.')),
      Q(L('Under ISPS, who is responsible for the port facility security plan?', 'بموجب ISPS، من المسؤول عن خطة أمن المرفق المينائي؟'), [L('The ship master', 'ربّان السفينة'), L('The PFSO', 'ضابط أمن المرفق PFSO'), L('Customs', 'الجمارك'), L('The line', 'الخط')], 1, L('Port Facility Security Officer.', 'ضابط أمن المرفق المينائي.')),
      Q(L('Why report near misses?', 'لماذا يُبلَّغ عن الحوادث الوشيكة؟'), [L('To blame people', 'للوم الأشخاص'), L('They reveal hazards before a serious accident', 'تكشف المخاطر قبل وقوع حادث خطير'), L('Legal formality only', 'إجراء قانوني فقط'), L('Insurance', 'التأمين')], 1, L('The base of the accident pyramid.', 'قاعدة هرم الحوادث.')),
    ],
  });

  add({
    id: 'crisis', lvl: 5, icon: '🚨', min: 14,
    title: L('Crisis & contingency management', 'إدارة الأزمات والطوارئ'),
    sub: L('Weather, strikes, system failure, congestion, major accidents — plans, roles and communication.', 'الطقس، الإضرابات، تعطّل الأنظمة، الازدحام، الحوادث الكبرى — الخطط والأدوار والتواصل.'),
    body: L(`
<h3>Prepare before it happens</h3>
<ul>
<li><b>Contingency plans</b> for: storm/high wind, TOS/IT outage, power failure, strike/labour shortage, major accident/fire/DG, pandemic, cyber attack, severe congestion.</li>
<li>Each plan: trigger, who decides, first 60 minutes checklist, communication tree, recovery.</li>
<li>Drills twice a year; update after each real event.</li>
</ul>
<h3>The first hour (any crisis)</h3>
<ol>
<li><b>Safety first</b>: people, then environment, then assets, then operations.</li>
<li>Get facts: what, where, how big, what next.</li>
<li>Activate the plan and the crisis team; one incident commander.</li>
<li>Communicate early: internal, port authority, lines, customs; holding statement for media if needed.</li>
<li>Log everything with time.</li>
</ol>
<h3>Recovery planning (after the event)</h3>
<p>Backlog = vessels waiting + yard overflow + gate backlog. Rank by: safety/DG & reefers, window vessels, perishable cargo, transshipment connections, then others. Add extra shifts, extend gate hours, prioritise evacuating the yard.</p>
<h3>IT outage fallback</h3>
<p>Paper/Excel load lists, manual yard cards, radio dispatch, printed bay plans from the last BAPLIE. Keep a <b>“TOS down kit”</b> updated each shift: yard inventory export, vessel lists, emergency contacts.</p>
<h3>Communication rules</h3>
<ul><li>Facts, impact, actions, next update time.</li><li>Never speculate about causes publicly.</li><li>Same message to all lines (fairness).</li></ul>`,
`
<h3>استعدّ قبل أن يحدث</h3>
<ul>
<li><b>خطط طوارئ</b> لـ: العاصفة/الرياح القوية، تعطّل TOS/تقنية المعلومات، انقطاع الكهرباء، الإضراب/نقص العمّال، حادث كبير/حريق/مواد خطرة، الأوبئة، الهجوم السيبراني، الازدحام الشديد.</li>
<li>كل خطة: المحفّز، من يقرّر، قائمة أول 60 دقيقة، شجرة التواصل، التعافي.</li>
<li>تمارين مرّتين سنويًا؛ وتحديث بعد كل حدث حقيقي.</li>
</ul>
<h3>الساعة الأولى (أي أزمة)</h3>
<ol>
<li><b>السلامة أولًا</b>: الناس، ثم البيئة، ثم الأصول، ثم العمليات.</li>
<li>اجمع الحقائق: ماذا، أين، ما الحجم، ما التالي.</li>
<li>فعّل الخطة وفريق الأزمة؛ قائد حادث واحد.</li>
<li>تواصل مبكرًا: داخليًا، سلطة الميناء، الخطوط، الجمارك؛ بيان مؤقّت للإعلام عند الحاجة.</li>
<li>سجّل كل شيء مع الوقت.</li>
</ol>
<h3>تخطيط التعافي (بعد الحدث)</h3>
<p>التراكم = السفن المنتظرة + فائض الساحة + تراكم البوابة. رتّب حسب: السلامة/الخطرة والمبرّدات، سفن النوافذ، البضائع القابلة للتلف، ارتباطات المسافنة، ثم الباقي. أضف ورديات إضافية، مدّد ساعات البوابة، أعطِ الأولوية لإخلاء الساحة.</p>
<h3>البديل عند تعطّل النظام</h3>
<p>قوائم تحميل ورقية/Excel، بطاقات ساحة يدوية، توجيه عبر اللاسلكي، خطط خلجان مطبوعة من آخر BAPLIE. احتفظ بـ <b>“حقيبة تعطّل TOS”</b> محدّثة كل وردية: تصدير مخزون الساحة، قوائم السفن، أرقام الطوارئ.</p>
<h3>قواعد التواصل</h3>
<ul><li>الحقائق، الأثر، الإجراءات، موعد التحديث التالي.</li><li>لا تتكهّن بالأسباب علنًا.</li><li>الرسالة نفسها لكل الخطوط (العدالة).</li></ul>`),
    keys: [L('People → environment → assets → operations.', 'الناس ← البيئة ← الأصول ← العمليات.'), L('One incident commander, one log.', 'قائد حادث واحد وسجلّ واحد.'), L('Prepare a “TOS down kit” every shift.', 'جهّز “حقيبة تعطّل TOS” كل وردية.')],
    senior: L('In a crisis people copy your tone. Speak slowly, give clear tasks with names and times, and announce the next update time. Calm is a management tool.', 'في الأزمة يقلّد الناس نبرتك. تكلّم ببطء، وأعطِ مهامًا واضحة بالأسماء والأوقات، وأعلن موعد التحديث التالي. الهدوء أداة إدارية.'),
    quiz: [
      Q(L('Priority order in a crisis?', 'ترتيب الأولويات في الأزمة؟'), [L('Operations, assets, people', 'العمليات، الأصول، الناس'), L('People, environment, assets, operations', 'الناس، البيئة، الأصول، العمليات'), L('Customers first', 'الزبائن أولًا'), L('Assets first', 'الأصول أولًا')], 1, L('Life safety always first.', 'سلامة الأرواح دائمًا أولًا.')),
      Q(L('After a 2-day strike, which is first in recovery?', 'بعد إضراب يومين، ما الأول في التعافي؟'), [L('Empties evacuation', 'إخلاء الفارغ'), L('Reefers/DG checks and window vessels', 'فحص المبرّدات/الخطرة وسفن النوافذ'), L('Office cleaning', 'تنظيف المكاتب'), L('Invoices', 'الفواتير')], 1, L('Safety-critical cargo and contracted services first.', 'البضائع الحرجة للسلامة والخدمات المتعاقدة أولًا.')),
      Q(L('A good crisis message includes…', 'الرسالة الجيدة في الأزمة تتضمّن…'), [L('Speculation on causes', 'تكهّنات بالأسباب'), L('Facts, impact, actions, next update time', 'الحقائق، الأثر، الإجراءات، موعد التحديث التالي'), L('Blame', 'لوم'), L('Nothing until resolved', 'لا شيء حتى الحل')], 1, L('Clear, factual, with a promised next update.', 'واضحة وواقعية مع وعد بتحديث تالٍ.')),
    ],
  });

  add({
    id: 'commercial', lvl: 5, icon: '🤝', min: 14,
    title: L('Commercial: tariffs, contracts & customers', 'التجاري: التعرفات والعقود والعملاء'),
    sub: L('Terminal tariff, service agreements with lines, productivity guarantees, claims and penalties.', 'تعرفة المحطة، اتفاقيات الخدمة مع الخطوط، ضمانات الإنتاجية، المطالبات والغرامات.'),
    body: L(`
<h3>Who are your customers?</h3>
<p>Primary: <b>shipping lines</b> (they choose the port of call). Secondary: cargo owners, forwarders, hauliers — they pay storage, gate and services and influence line choices.</p>
<h3>The terminal service agreement (TSA)</h3>
<ul>
<li>Volumes (TEU/year), rates per move (discharge/load, transshipment, empty, restow, hatch cover).</li>
<li><b>Berth window</b> and guaranteed <b>productivity</b> (e.g. GMPH ≥ 90 with ≥ 3 cranes); penalties/bonuses.</li>
<li>Free storage days, reefer plug rates, DG/OOG surcharges.</li>
<li>Liability limits for damage, claims procedure and time bars.</li>
<li>Volume incentives / rebates, duration, termination.</li>
</ul>
<h3>Pricing logic</h3>
<div class="formula">Contribution per move = Rate per move − Variable cost per move
Break-even volume = Fixed costs ÷ Contribution per move</div>
<p>Transshipment is price-sensitive (lines can choose another hub). Gateway cargo is more “captive” but politically visible.</p>
<h3>Claims</h3>
<p>Damage to box/cargo, wrong delivery, delays. Process: notify within time bar → joint survey → evidence (EIR, CCTV, TOS logs) → liability decision → settlement within contract limits.</p>
<div class="ex" data-t="Negotiation tip">Never give a rate discount without getting something back: more volume, a fixed window day, more twin-lift, longer contract.</div>`,
`
<h3>من هم عملاؤك؟</h3>
<p>الأساسيون: <b>الخطوط الملاحية</b> (هي من تختار ميناء التوقف). الثانويون: أصحاب البضائع، وكلاء الشحن، شركات النقل — يدفعون التخزين والبوابة والخدمات ويؤثّرون على اختيار الخطوط.</p>
<h3>اتفاقية خدمة المحطة (TSA)</h3>
<ul>
<li>الأحجام (TEU/سنة)، الأسعار لكل حركة (تفريغ/تحميل، مسافنة، فارغ، إعادة رصّ، غطاء عنبر).</li>
<li><b>نافذة الرسو</b> و<b>الإنتاجية</b> المضمونة (مثلًا GMPH ≥ 90 مع ≥ 3 رافعات)؛ غرامات/مكافآت.</li>
<li>أيام التخزين المجانية، أسعار توصيل المبرّدات، رسوم إضافية للخطرة/خارج المقاس.</li>
<li>حدود المسؤولية عن الأضرار، إجراءات المطالبات ومهلها.</li>
<li>حوافز الحجم / الخصومات، المدة، الإنهاء.</li>
</ul>
<h3>منطق التسعير</h3>
<div class="formula">Contribution per move = Rate per move − Variable cost per move
Break-even volume = Fixed costs ÷ Contribution per move</div>
<p>المسافنة حسّاسة للسعر (الخطوط يمكنها اختيار محور آخر). بضائع البوابة أكثر “ارتباطًا” بالميناء لكنها مرئية سياسيًا.</p>
<h3>المطالبات</h3>
<p>ضرر للحاوية/البضاعة، تسليم خاطئ، تأخيرات. الإجراء: الإخطار ضمن المهلة ← معاينة مشتركة ← الأدلة (EIR، الكاميرات، سجلّات TOS) ← قرار المسؤولية ← التسوية ضمن حدود العقد.</p>
<div class="ex" data-t="نصيحة تفاوض">لا تعطِ خصمًا على السعر أبدًا دون الحصول على مقابل: حجم أكبر، يوم نافذة ثابت، رفع مزدوج أكثر، عقد أطول.</div>`),
    keys: [L('Lines choose ports — they are your primary customers.', 'الخطوط تختار الموانئ — هي عملاؤك الأساسيون.'), L('TSA = rates + window + productivity + liability.', 'اتفاقية الخدمة = الأسعار + النافذة + الإنتاجية + المسؤولية.'), L('Break-even = fixed costs ÷ contribution per move.', 'نقطة التعادل = التكاليف الثابتة ÷ المساهمة لكل حركة.')],
    senior: L('Visit your top 3 lines’ regional offices every quarter with their own data: productivity, waiting time, issues fixed. Lines stay with ports that know them.', 'زُر المكاتب الإقليمية لأهمّ 3 خطوط كل ربع سنة ومعك بياناتهم: الإنتاجية، وقت الانتظار، المشاكل المحلولة. الخطوط تبقى مع الموانئ التي تعرفها.'),
    quiz: [
      Q(L('Rate USD 95/move, variable cost USD 40/move, fixed costs USD 11 M. Break-even moves?', 'السعر 95 دولارًا/حركة، التكلفة المتغيّرة 40 دولارًا/حركة، الثابتة 11 مليون. حركات التعادل؟'), [L('115,789', '115,789'), L('200,000', '200,000'), L('275,000', '275,000'), L('80,000', '80,000')], 1, L('11,000,000 ÷ 55 = 200,000 moves.', '11,000,000 ÷ 55 = 200,000 حركة.')),
      Q(L('Which traffic is most price-sensitive?', 'أي حركة هي الأكثر حساسية للسعر؟'), [L('Gateway imports', 'استيراد البوابة'), L('Transshipment', 'المسافنة'), L('Empties to depot', 'الفارغ للمستودع'), L('Ro-ro', 'رورو')], 1, L('A line can move its hub to a competitor.', 'يمكن للخط نقل محوره إلى منافس.')),
      Q(L('A line asks for 10% discount. Best reply?', 'خط يطلب خصمًا 10%. أفضل رد؟'), [L('Accept immediately', 'القبول فورًا'), L('Trade it for volume, fixed window or longer contract', 'مقايضته بحجم أو نافذة ثابتة أو عقد أطول'), L('Refuse to talk', 'رفض الحديث'), L('Raise other fees secretly', 'رفع رسوم أخرى سرًّا')], 1, L('Give-and-take negotiation.', 'تفاوض بالأخذ والعطاء.')),
    ],
  });

  add({
    id: 'leadership', lvl: 5, icon: '👥', min: 14,
    title: L('Leadership: shifts, people & communication', 'القيادة: الورديات والأشخاص والتواصل'),
    sub: L('Shift handover, gang planning, the daily meeting, coaching juniors, decision-making.', 'تسليم الوردية، تخطيط الفرق، الاجتماع اليومي، تدريب المبتدئين، اتخاذ القرار.'),
    body: L(`
<h3>Shift handover — the most underrated process</h3>
<p>A 24/7 terminal changes command 3 times a day. Use a structured handover (written + 10 min face to face):</p>
<ul>
<li>Vessels: on berth (progress %, ETC), next arrivals, problems.</li>
<li>Yard: utilisation, blocks at risk, housekeeping done/pending.</li>
<li>Equipment: breakdowns, PM, availability.</li>
<li>Safety/security: incidents, near misses, open permits.</li>
<li>People: absences, overtime, issues.</li>
<li>Open promises to customers.</li>
</ul>
<h3>Labour & gang planning</h3>
<div class="formula">Gangs needed per shift ≈ working STS cranes + lashing gangs + yard/gate staff
Crane drivers per crane per shift ≈ 1.5 (relief for breaks)</div>
<p>Plan labour 24–48 h ahead from the berth plan; confirm 6–8 h before the shift.</p>
<h3>Decision-making under pressure</h3>
<ol><li>Clarify the goal (what does success look like in 6 h?).</li><li>List 2–3 options with impact on safety, customers, cost.</li><li>Decide, assign owners, set a check time.</li><li>Communicate the why.</li></ol>
<h3>Growing from junior to senior</h3>
<ul>
<li>Juniors know procedures; seniors know <b>why</b> each procedure exists — and when to escalate.</li>
<li>Seniors think in <b>systems</b> (berth ↔ yard ↔ gate ↔ depot), not tasks.</li>
<li>Seniors anticipate: they look 24–72 h ahead.</li>
<li>Seniors build people: give juniors real decisions with support.</li>
</ul>`,
`
<h3>تسليم الوردية — أكثر عملية لا تُقدَّر حقّ قدرها</h3>
<p>المحطة التي تعمل 24/7 تغيّر قيادتها 3 مرات يوميًا. استخدم تسليمًا منظّمًا (مكتوب + 10 دقائق وجهًا لوجه):</p>
<ul>
<li>السفن: على الرصيف (نسبة التقدّم، الوقت المتوقّع للانتهاء)، الوصول التالي، المشاكل.</li>
<li>الساحة: نسبة الاستخدام، الكتل المعرّضة للخطر، الترتيب المنجز/المعلّق.</li>
<li>المعدّات: الأعطال، الصيانة الوقائية، التوفّر.</li>
<li>السلامة/الأمن: الحوادث، الحوادث الوشيكة، التصاريح المفتوحة.</li>
<li>الأشخاص: الغياب، العمل الإضافي، المشاكل.</li>
<li>الوعود المفتوحة للعملاء.</li>
</ul>
<h3>تخطيط العمّال والفرق</h3>
<div class="formula">Gangs needed per shift ≈ working STS cranes + lashing gangs + yard/gate staff
Crane drivers per crane per shift ≈ 1.5 (relief for breaks)</div>
<p>خطّط العمالة قبل 24–48 ساعة من خطة الأرصفة؛ وأكّدها قبل 6–8 ساعات من الوردية.</p>
<h3>اتخاذ القرار تحت الضغط</h3>
<ol><li>وضّح الهدف (كيف يبدو النجاح بعد 6 ساعات؟).</li><li>اذكر 2–3 خيارات مع أثرها على السلامة والعملاء والتكلفة.</li><li>قرّر، عيّن المسؤولين، حدّد وقت المراجعة.</li><li>اشرح السبب.</li></ol>
<h3>النمو من مبتدئ إلى محترف</h3>
<ul>
<li>المبتدئ يعرف الإجراءات؛ المحترف يعرف <b>لماذا</b> يوجد كل إجراء — ومتى يصعّد.</li>
<li>المحترف يفكّر <b>كمنظومة</b> (الرصيف ↔ الساحة ↔ البوابة ↔ المستودع)، لا كمهام.</li>
<li>المحترف يستبق: ينظر 24–72 ساعة إلى الأمام.</li>
<li>المحترف يبني الأشخاص: يعطي المبتدئين قرارات حقيقية مع الدعم.</li>
</ul>`),
    keys: [L('Structured written + verbal handover every shift.', 'تسليم منظّم مكتوب وشفهي كل وردية.'), L('Plan labour from the berth plan 24–48 h ahead.', 'خطّط العمالة من خطة الأرصفة قبل 24–48 ساعة.'), L('Seniors think in systems and look 72 h ahead.', 'المحترف يفكّر كمنظومة وينظر 72 ساعة للأمام.')],
    senior: L('End every shift by asking: “What will hurt the next shift if I don’t say it now?” Then say it.', 'أنهِ كل وردية بسؤال: “ما الذي سيؤذي الوردية التالية إن لم أقله الآن؟” ثم قُله.'),
    quiz: [
      Q(L('5 cranes working, 1.5 drivers per crane. Drivers needed?', '5 رافعات عاملة و1.5 سائق لكل رافعة. كم سائقًا؟'), [L('5', '5'), L('7.5 → 8', '7.5 ← 8'), L('10', '10'), L('6', '6')], 1, L('5 × 1.5 = 7.5 → 8 drivers.', '5 × 1.5 = 7.5 ← 8 سائقين.')),
      Q(L('Which belongs in a shift handover?', 'ماذا يجب أن يتضمّن تسليم الوردية؟'), [L('Only vessel progress', 'تقدّم السفن فقط'), L('Vessels, yard, equipment, safety, people, open promises', 'السفن، الساحة، المعدّات، السلامة، الأشخاص، الوعود المفتوحة'), L('Nothing written', 'لا شيء مكتوب'), L('Only problems you solved', 'فقط المشاكل التي حللتها')], 1, L('Complete picture, written and verbal.', 'صورة كاملة، مكتوبة وشفهية.')),
      Q(L('What most distinguishes a senior?', 'ما الذي يميّز المحترف أكثر؟'), [L('Knowing all TOS screens', 'معرفة كل شاشات TOS'), L('Systems thinking and anticipation', 'التفكير المنظومي والاستباق'), L('Working longest hours', 'العمل لأطول ساعات'), L('Never escalating', 'عدم التصعيد أبدًا')], 1, L('Seeing the whole system and looking ahead.', 'رؤية المنظومة كاملة والنظر للأمام.')),
    ],
  });

  add({
    id: 'digital', lvl: 5, icon: '💻', min: 12,
    title: L('Digitalisation, automation & the future port', 'الرقمنة والأتمتة وميناء المستقبل'),
    sub: L('TOS, PCS, OCR, automation, digital twins, just-in-time arrival, cyber security.', 'TOS وPCS وOCR، الأتمتة، التوائم الرقمية، الوصول في الوقت المناسب، الأمن السيبراني.'),
    body: L(`
<h3>The digital layers of a modern port</h3>
<ul>
<li><b>TOS</b>: planning & execution inside the terminal.</li>
<li><b>PCS</b>: data exchange between all port stakeholders (single window for customs).</li>
<li><b>OCR & gate automation</b>: reads container numbers, plates, damage photos; auto-gate in &lt; 1 min.</li>
<li><b>Remote-controlled STS</b> and <b>automated yard (ASC)</b>, AGVs.</li>
<li><b>IoT</b>: reefer remote monitoring, equipment telemetry, smart seals.</li>
<li><b>Digital twin</b>: a live simulation of the terminal to test plans before executing them.</li>
<li><b>AI</b>: dwell time prediction, yard allocation, ETA prediction, predictive maintenance.</li>
</ul>
<h3>Just-In-Time arrival (JIT)</h3>
<p>Instead of “sail fast then wait at anchorage”, the port shares a <b>Requested Time of Arrival</b> and the ship slows down — saving fuel and emissions. Needs reliable berth planning and data sharing (standards: DCSA, IMO JIT guide).</p>
<h3>Cyber security</h3>
<p>Ports are critical infrastructure and have been hit by ransomware that stopped operations for days. Basics: backups offline, network segregation for OT (cranes), MFA, tested “TOS down” procedures, staff awareness (phishing).</p>
<h3>Managing change</h3>
<p>Automation changes jobs. Successful projects train and involve people early, run old and new in parallel, and measure productivity honestly during ramp-up.</p>`,
`
<h3>الطبقات الرقمية للميناء الحديث</h3>
<ul>
<li><b>TOS</b>: التخطيط والتنفيذ داخل المحطة.</li>
<li><b>PCS</b>: تبادل البيانات بين كل أطراف الميناء (النافذة الواحدة للجمارك).</li>
<li><b>OCR وأتمتة البوابة</b>: قراءة أرقام الحاويات واللوحات وصور الأضرار؛ بوابة آلية في &lt; دقيقة.</li>
<li><b>رافعات رصيف بالتحكّم عن بُعد</b> و<b>ساحة مؤتمتة (ASC)</b>، ومركبات AGV.</li>
<li><b>إنترنت الأشياء</b>: مراقبة المبرّدات عن بُعد، بيانات المعدّات، الأختام الذكية.</li>
<li><b>التوأم الرقمي</b>: محاكاة حيّة للمحطة لاختبار الخطط قبل تنفيذها.</li>
<li><b>الذكاء الاصطناعي</b>: التنبّؤ بمدة البقاء، تخصيص الساحة، التنبّؤ بالوصول، الصيانة التنبّؤية.</li>
</ul>
<h3>الوصول في الوقت المناسب (JIT)</h3>
<p>بدلًا من “الإبحار بسرعة ثم الانتظار على المخطاف”، يشارك الميناء <b>وقت الوصول المطلوب</b> وتخفّف السفينة سرعتها — توفيرًا للوقود والانبعاثات. يحتاج تخطيط أرصفة موثوقًا ومشاركة بيانات (المعايير: DCSA، دليل IMO للوصول في الوقت المناسب).</p>
<h3>الأمن السيبراني</h3>
<p>الموانئ بنية تحتية حرجة، وقد تعرّضت لبرامج فدية أوقفت العمليات لأيام. الأساسيات: نسخ احتياطية غير متّصلة، فصل شبكة التشغيل (الرافعات)، المصادقة متعدّدة العوامل، إجراءات “تعطّل TOS” مُختبرة، توعية الموظّفين (التصيّد).</p>
<h3>إدارة التغيير</h3>
<p>الأتمتة تغيّر الوظائف. المشاريع الناجحة تدرّب الأشخاص وتشركهم مبكرًا، وتشغّل القديم والجديد بالتوازي، وتقيس الإنتاجية بصدق أثناء مرحلة التشغيل التجريبي.</p>`),
    keys: [L('TOS inside, PCS across the port.', 'TOS داخل المحطة، PCS عبر الميناء.'), L('JIT arrival saves fuel and anchorage waiting.', 'الوصول في الوقت المناسب يوفّر الوقود وانتظار المخطاف.'), L('Cyber resilience = tested manual fallback.', 'المرونة السيبرانية = بديل يدوي مُختبر.')],
    senior: L('Before buying technology, fix the process and the data. Automating a bad process gives you a faster bad process.', 'قبل شراء التكنولوجيا، أصلح العملية والبيانات. أتمتة عملية سيئة تعطيك عملية سيئة أسرع.'),
    quiz: [
      Q(L('What does JIT arrival aim to reduce?', 'ما الذي يهدف الوصول في الوقت المناسب إلى تقليله؟'), [L('Crane productivity', 'إنتاجية الرافعات'), L('Anchorage waiting and fuel use', 'انتظار المخطاف واستهلاك الوقود'), L('Customs inspections', 'المعاينات الجمركية'), L('Storage revenue', 'إيرادات التخزين')], 1, L('Ship adjusts speed to a requested arrival time.', 'تعدّل السفينة سرعتها وفق وقت وصول مطلوب.')),
      Q(L('A digital twin is…', 'التوأم الرقمي هو…'), [L('A backup server', 'خادم احتياطي'), L('A live simulation model of the terminal', 'نموذج محاكاة حيّ للمحطة'), L('Two identical cranes', 'رافعتان متطابقتان'), L('A customs system', 'نظام جمركي')], 1, L('Used to test plans before execution.', 'يُستخدم لاختبار الخطط قبل التنفيذ.')),
      Q(L('Best cyber-resilience measure for operations?', 'أفضل إجراء للمرونة السيبرانية في العمليات؟'), [L('Never update software', 'عدم تحديث البرامج أبدًا'), L('Tested manual fallback + offline backups', 'بديل يدوي مُختبر + نسخ احتياطية غير متّصلة'), L('One shared password', 'كلمة مرور مشتركة واحدة'), L('Disable logs', 'تعطيل السجلّات')], 1, L('You must be able to keep working when systems are down.', 'يجب أن تكون قادرًا على مواصلة العمل عند تعطّل الأنظمة.')),
    ],
  });
})();
