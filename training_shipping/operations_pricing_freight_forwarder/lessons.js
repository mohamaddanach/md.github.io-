/* Operations & Pricing — lesson texts (EN/AR) for the 12 steps. Case-specific notes are added by the steps. */
(function () {
  const L = TS.L, t = TS.t;
  const OPS = (window.OPS = window.OPS || {});
  const LB = (en, ar) => `<div class="note lb"><strong>🇱🇧 ${t(L('Lebanon', 'لبنان'))}</strong>${t(L(en, ar))}</div>`;
  const TIP = (en, ar) => `<div class="note warn"><strong>⚠ ${t(L('Watch out', 'انتبه'))}</strong>${t(L(en, ar))}</div>`;
  OPS.LB = LB; OPS.TIP = TIP;
  OPS.LESSON = {};
  OPS.LESSON.inquiry = (ship) => t(L(`
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
      + TIP('Do not classify HS codes yourself. Record what the client/supplier gives you; the broker and importer are responsible for classification.', 'لا تحدّد رمز HS بنفسك. سجّل ما يعطيك إيّاه الزبون/المورّد؛ المخلّص والمستورد مسؤولان عن التصنيف.');
  OPS.LESSON.rates = () => t(L(`
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
      + LB('Main lines calling Beirut include CMA CGM, MSC, Maersk, Hapag-Lloyd and COSCO (directly or through feeders via Port Said, Piraeus, Malta, Gioia Tauro…). Lebanese boycott law means Israeli carriers/vessels are not used for Lebanon — always use the lines’ Lebanon services.', 'من الخطوط الرئيسية التي تخدم بيروت: CMA CGM وMSC وميرسك وهاباغ لويد وكوسكو (مباشرة أو عبر خطوط رديفة من بورسعيد، بيرايوس، مالطا، جويا تاورو…). قانون المقاطعة اللبناني يعني عدم استعمال خطوط/بواخر إسرائيلية للبنان — استعمل دائمًا خدمات الخطوط المخصّصة للبنان.');
  OPS.LESSON.quote = () => t(L(`
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
      + LB('VAT 11% applies to local services invoiced in Lebanon (THC re-billed, handling, trucking, clearance fees…). International freight is generally treated as exempt/zero-rated. Container deposits, customs duties and import VAT are disbursements — not your revenue.', 'تُطبَّق الضريبة 11% على الخدمات المحلية المفوترة في لبنان (THC المعاد فوترتها، المعالجة، النقل البري، أتعاب التخليص…). يُعامل الشحن الدولي عادةً كمعفى/بنسبة صفر. تأمينات الحاويات والرسوم الجمركية وضريبة الاستيراد سُلف — وليست إيرادك.');
  OPS.LESSON.booking = () => t(L(`
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
<p>إذا فاتك موعد تُنقل الحاوية (<b>Rolled</b>) إلى الباخرة التالية — غالبًا أسبوع، وأحيانًا تفوتك الربطة في مرفأ المسافنة. ضع هامش أمان لكل موعد.</p>`));
  OPS.LESSON.stuffing = () => t(L(`
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
      + LB('For Lebanese exports from the Bekaa, trucking to Beirut crosses the mountain road (Dahr el Baidar): allow time, check the truck’s permits and axle weights, and avoid picking up the empty too early — origin detention counts from the depot gate-out.', 'في الصادرات اللبنانية من البقاع يعبر النقل إلى بيروت طريق ضهر البيدر الجبلي: خصّص وقتًا كافيًا، تحقّق من تصاريح الشاحنة وأوزان المحاور، ولا تسحب الفارغ مبكرًا — الاحتجاز في المنشأ يُحتسب من خروجها من المستودع.');
  OPS.LESSON.gatein = () => t(L(`
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
      + LB('In Lebanon the export declaration is lodged in NAJM by a licensed customs broker with: commercial invoice, packing list, the exporter’s registration, and certificates as required (COO/EUR.1 from the Chamber, health certificate from the Ministry of Agriculture for food). Your Customs department will do this for you — this simulator hands the data over in the shipment JSON.', 'في لبنان يقدّم مخلّص جمركي مرخّص بيان التصدير على نظام نجم مع: الفاتورة التجارية، قائمة التعبئة، تسجيل المصدّر، والشهادات المطلوبة (منشأ/EUR.1 من الغرفة، شهادة صحية من وزارة الزراعة للأغذية). قسم الجمارك سيقوم بذلك — وهذا المحاكي يسلّمه البيانات في ملف JSON للشحنة.');
  OPS.LESSON.si = () => t(L(`
<h3>The bill of lading does three jobs</h3>
<ol><li><b>Receipt</b> for the goods (in apparent good order — “clean”).</li><li><b>Evidence of the contract</b> of carriage.</li><li><b>Document of title</b> — whoever holds the original controls the goods.</li></ol>
<h3>Master and house</h3>
<p>When you act as NVOCC there are two B/Ls: the <b>MBL</b> (line → forwarder) and the <b>HBL</b> (forwarder → real shipper). On the MBL the shipper and consignee are usually the two forwarders (origin agent and destination office). On the HBL they are the real seller and buyer.</p>
<h3>“To order”</h3>
<p>If payment goes through a bank (CAD, letter of credit), the consignee is often <b>“TO ORDER”</b> (or “to order of [bank]”). The goods are released to whoever presents the endorsed original. The buyer is shown as notify party.</p>
<h3>Shipping instructions (SI)</h3>
<p>Your SI tells the line exactly what to print: parties, container/seal, packages, description, gross <b>cargo</b> weight (not the VGM), measurement, marks, freight terms. Send it before the <b>SI cutoff</b>, or pay a late-SI fee — or miss the vessel.</p>
<h3>Check every draft</h3>
<p>Amendments after the manifest is filed are expensive and sometimes impossible (and in Lebanon a wrong consignee name or weight on the manifest creates customs problems at arrival). Always compare the draft with the SI and get the shipper’s written approval of the HBL before issue.</p>
<p><b>Clauses:</b> “Shipper’s load, stow and count” / “said to contain” protect the carrier on FCL: it did not see the goods packed.</p>`,
    `
<h3>للبوليصة ثلاث وظائف</h3>
<ol><li><b>إيصال</b> باستلام البضاعة (بحالة ظاهرية جيدة — «نظيفة»).</li><li><b>دليل على عقد</b> النقل.</li><li><b>سند ملكية</b> — من يملك الأصل يتحكّم بالبضاعة.</li></ol>
<h3>الرئيسية وبوليصة الوكيل</h3>
<p>عندما تعمل كـNVOCC توجد بوليصتان: <b>MBL</b> (من الخط إلى وكيل الشحن) و<b>HBL</b> (من وكيل الشحن إلى الشاحن الفعلي). في MBL الشاحن والمرسل إليه عادة هما الوكيلان (وكيل المنشأ ومكتب الوجهة). في HBL هما البائع والمشتري الفعليان.</p>
<h3>«لأمر» (TO ORDER)</h3>
<p>إذا كان الدفع عبر مصرف (مستندات، اعتماد مستندي) يكون المرسل إليه غالبًا <b>«لأمر»</b> (أو «لأمر المصرف»). تُسلَّم البضاعة لمن يقدّم الأصل المظهَّر. ويُذكر المشتري كطرف مُخطَر.</p>
<h3>تعليمات الشحن (SI)</h3>
<p>تخبر SI الخط بالضبط ماذا يطبع: الأطراف، الحاوية/الختم، الطرود، الوصف، الوزن الإجمالي <b>للبضاعة</b> (وليس VGM)، الحجم، العلامات، شروط الدفع. أرسلها قبل <b>موعد SI</b>، وإلا تدفع رسم تأخير — أو تفوتك الباخرة.</p>
<h3>راجع كل مسودة</h3>
<p>التعديلات بعد تقديم المانيفست مكلفة وأحيانًا مستحيلة (وفي لبنان اسم مرسل إليه أو وزن خاطئ في المانيفست يسبّب مشاكل جمركية عند الوصول). قارن المسودة دائمًا مع SI واحصل على موافقة الشاحن الخطية على HBL قبل الإصدار.</p>
<p><b>العبارات:</b> «تحميل وتستيف وعدّ الشاحن» / «يقال إنها تحتوي» تحمي الناقل في FCL: لم يشاهد تعبئة البضاعة.</p>`));
  OPS.LESSON.sailing = () => t(L(`
<h3>After the vessel sails</h3>
<p>The line confirms the <b>ATD</b> (actual departure). Only then are B/Ls issued. Prepaid B/Ls are released after freight is paid.</p>
<h3>Release types — know them cold</h3>
<table><tr><th>Type</th><th>How</th><th>When</th></tr>
<tr><td>Original B/L (OBL)</td><td>3 originals; one surrendered at destination</td><td>Seller wants control until paid (CAD, L/C)</td></tr>
<tr><td>Seaway bill / express release</td><td>No originals; released to the named consignee</td><td>Trusted parties, intra-group, agent-to-agent MBLs</td></tr>
<tr><td>Telex release</td><td>Originals surrendered at origin; destination told electronically</td><td>Payment confirmed after originals were issued</td></tr>
<tr><td>Switch B/L</td><td>New set issued elsewhere, changing shipper details</td><td>Triangular trade. Handle carefully — fraud risk</td></tr></table>
<p><b>Never release cargo without payment or a surrendered original.</b> Once the goods are gone, your leverage is gone.</p>
<h3>Pre-alert</h3>
<p>Right after sailing, origin sends destination the pack: MBL & HBL copies, invoice, packing list, COO/certificates, container/seal, vessel/ETA and release instructions. Destination uses it to prepare the arrival notice and customs.</p>
<h3>Advance cargo data</h3>
<p>Many countries need cargo data before loading/arrival: <b>ICS2/ENS</b> (EU), <b>AMS/ISF</b> (USA). Lebanon: the carrier’s agent submits the manifest to Lebanese Customs (NAJM) before arrival. Late or wrong filings are fined — to whoever filed.</p>`,
    `
<h3>بعد إبحار الباخرة</h3>
<p>يؤكّد الخط <b>ATD</b> (المغادرة الفعلية). عندها فقط تصدر البوالص. البوالص المسبقة الدفع تُسلَّم بعد دفع الشحن.</p>
<h3>أنواع الإفراج — احفظها جيدًا</h3>
<table><tr><th>النوع</th><th>كيف</th><th>متى</th></tr>
<tr><td>بوليصة أصلية (OBL)</td><td>3 أصول؛ تُسلَّم واحدة في الوجهة</td><td>البائع يريد السيطرة حتى الدفع (مستندات، اعتماد)</td></tr>
<tr><td>Seaway bill / إفراج سريع</td><td>بدون أصول؛ تُسلَّم للمرسل إليه المسمّى</td><td>أطراف موثوقة، داخل المجموعة، بوالص رئيسية بين الوكلاء</td></tr>
<tr><td>تلكس ريليز</td><td>تُسلَّم الأصول في المنشأ وتُبلَّغ الوجهة إلكترونيًا</td><td>تأكّد الدفع بعد إصدار الأصول</td></tr>
<tr><td>Switch B/L</td><td>مجموعة جديدة تصدر في مكان آخر مع تغيير الشاحن</td><td>تجارة ثلاثية. بحذر — خطر احتيال</td></tr></table>
<p><b>لا تُفرج أبدًا عن البضاعة بدون دفع أو تسليم أصل.</b> عندما تخرج البضاعة تخسر ورقتك.</p>
<h3>الإشعار المسبق (Pre-alert)</h3>
<p>فور الإبحار يرسل المنشأ للوجهة الحزمة: نسخ MBL وHBL، الفاتورة، قائمة التعبئة، المنشأ/الشهادات، الحاوية/الختم، الباخرة/الوصول وتعليمات الإفراج. تستعملها الوجهة لتحضير إشعار الوصول والجمارك.</p>
<h3>البيانات المسبقة للبضاعة</h3>
<p>دول كثيرة تطلب البيانات قبل التحميل/الوصول: <b>ICS2/ENS</b> (أوروبا)، <b>AMS/ISF</b> (أميركا). لبنان: يقدّم وكيل الخط المانيفست للجمارك اللبنانية (نجم) قبل الوصول. التأخير أو الخطأ يُغرَّم — على من قدّم البيانات.</p>`));
  OPS.LESSON.tracking = () => t(L(`
<h3>Proactive tracking</h3>
<p>Check the line’s tracking at each milestone: loaded, departed, T/S arrival, T/S departure, arrival. The weak point is the <b>transshipment</b>: missed connections, congestion, rolled boxes at the hub.</p>
<h3>Communicating delays</h3>
<ul><li>Tell the client <b>before</b> they ask.</li><li>Give facts: what happened, new estimated date, impact (free time starts at discharge, so no D&D impact from a sea delay).</li><li>Never promise a new date as a fact — it is still an estimate.</li><li>No blame games; propose options if any (e.g. pre-clearance preparation).</li></ul>
<h3>Arrival notice</h3>
<p>A few days before arrival, the consignee receives an arrival notice: vessel/ETA, B/L no., container, packages, and the <b>charges to pay before release</b>, plus documents needed. For a Lebanese import it should also remind the client of the container deposit and to prepare customs documents now.</p>`,
    `
<h3>التتبّع الاستباقي</h3>
<p>تحقّق من تتبّع الخط عند كل مرحلة: التحميل، المغادرة، الوصول للمسافنة، المغادرة منها، الوصول. النقطة الضعيفة هي <b>المسافنة</b>: ربطات فائتة، ازدحام، حاويات مؤجّلة في المرفأ المحوري.</p>
<h3>الإبلاغ عن التأخير</h3>
<ul><li>أبلغ الزبون <b>قبل</b> أن يسأل.</li><li>أعطِ حقائق: ماذا حدث، التاريخ المقدّر الجديد، التأثير (فترة السماح تبدأ عند التفريغ، فلا أثر على الغرامات من تأخير البحر).</li><li>لا تَعِد بتاريخ جديد كحقيقة — ما زال تقديرًا.</li><li>لا تلقِ اللوم؛ اقترح خيارات إن وجدت (مثل تحضير التخليص مسبقًا).</li></ul>
<h3>إشعار الوصول</h3>
<p>قبل أيام من الوصول، يستلم المرسل إليه إشعار وصول: الباخرة/الوصول، رقم البوليصة، الحاوية، الطرود، و<b>الرسوم الواجب دفعها قبل الإفراج</b>، والمستندات المطلوبة. في الاستيراد اللبناني يجب أن يذكّر الزبون أيضًا بتأمين الحاوية وبتحضير مستندات الجمارك الآن.</p>`));
  OPS.LESSON.release = () => t(L(`
<h3>The release chain at destination</h3>
<ol><li>Vessel arrives, container discharged (free time starts).</li><li>Consignee pays the charges on the arrival notice.</li><li>B/L released: original surrendered, telex release or seaway bill.</li><li>Line’s agent issues the <b>delivery order (D/O)</b> after its charges and deposit/guarantee.</li><li>Customs declaration, inspection (if selected), duties & VAT paid, customs release.</li><li>Terminal gate-out and delivery.</li></ol>
<h3>Credit control</h3>
<p>“Release today, we pay tomorrow” is how forwarders lose money. Only management can approve credit. Your leverage is the D/O.</p>
<h3>Customs value (Lebanon)</h3>
<p>Duties are calculated on the <b>CIF value</b>: invoice value + freight + insurance to the Lebanese port. That is why FOB imports need the freight amount on the customs file. Duty rate depends on the HS code (and origin agreements); then VAT 11% on CIF + duty.</p>`,
    `
<h3>سلسلة الإفراج في الوجهة</h3>
<ol><li>تصل الباخرة وتُفرّغ الحاوية (تبدأ فترة السماح).</li><li>يدفع المرسل إليه رسوم إشعار الوصول.</li><li>الإفراج عن البوليصة: تسليم الأصل، تلكس ريليز أو Seaway bill.</li><li>يصدر وكيل الخط <b>إذن التسليم (D/O)</b> بعد رسومه والتأمين/الكفالة.</li><li>البيان الجمركي، الكشف (إن اختير)، دفع الرسوم والضريبة، الإفراج الجمركي.</li><li>خروج الحاوية من المحطة والتسليم.</li></ol>
<h3>مراقبة الائتمان</h3>
<p>«أفرج اليوم وندفع غدًا» هكذا يخسر وكلاء الشحن أموالهم. فقط الإدارة توافق على الائتمان. ورقتك هي إذن التسليم.</p>
<h3>القيمة الجمركية (لبنان)</h3>
<p>تُحسب الرسوم على <b>قيمة CIF</b>: قيمة الفاتورة + الشحن + التأمين حتى المرفأ اللبناني. لذلك يحتاج استيراد FOB مبلغ الشحن في ملف الجمارك. نسبة الرسم حسب رمز HS (واتفاقيات المنشأ)؛ ثم ضريبة 11% على CIF + الرسم.</p>`))
      + LB('At Beirut: the line’s agent issues the D/O after payment of its local charges and the container deposit/guarantee. The D/O is required to complete the customs declaration in NAJM. Port storage (port authority) and line demurrage are separate clocks — both run while you wait for documents or licences.', 'في بيروت: يصدر وكيل الخط إذن التسليم بعد دفع رسومه المحلية وتأمين/كفالة الحاوية. إذن التسليم مطلوب لإكمال البيان الجمركي على نظام نجم. تخزين المرفأ (إدارة المرفأ) وغرامات الخط عدّادان منفصلان — وكلاهما يعمل أثناء انتظار المستندات أو التراخيص.');
  OPS.LESSON.delivery = () => t(L(`
<h3>Demurrage vs detention</h3>
<table><tr><th></th><th>Where is the box?</th><th>Charged by</th></tr>
<tr><td><b>Demurrage</b></td><td>Full, still inside the terminal after free time</td><td>Line (per day, per container, in tiers)</td></tr>
<tr><td><b>Detention</b></td><td>Outside the terminal, not yet returned empty</td><td>Line</td></tr>
<tr><td><b>Port storage</b></td><td>Inside the port</td><td>Port / terminal (separate tariff)</td></tr></table>
<p>Many lines give <b>combined</b> free days (DEM + DET together). Usually the day of discharge counts as day 1 and the day of empty return counts too. After free time the rate increases in tiers.</p>
<h3>How to avoid it</h3>
<ul><li>Negotiate free time at booking (14–21 days for slow-clearance destinations).</li><li>Collect customs documents before arrival.</li><li>Plan the truck and the client’s unloading.</li><li>Return the empty to the right depot, with a clean EIR.</li></ul>
<h3>After return</h3>
<p>The depot’s EIR proves the date and condition. The line calculates D&D and deducts it (and any damage/cleaning) from the deposit, then refunds the balance. Rebill D&D to the client as per your quotation conditions.</p>`,
    `
<h3>غرامات التأخير مقابل الاحتجاز</h3>
<table><tr><th></th><th>أين الحاوية؟</th><th>تُفرض من</th></tr>
<tr><td><b>التأخير (Demurrage)</b></td><td>معبّأة داخل المحطة بعد فترة السماح</td><td>الخط (يوميًا، لكل حاوية، بشرائح)</td></tr>
<tr><td><b>الاحتجاز (Detention)</b></td><td>خارج المحطة ولم تُرجع فارغة بعد</td><td>الخط</td></tr>
<tr><td><b>تخزين المرفأ</b></td><td>داخل المرفأ</td><td>المرفأ / المحطة (تعرفة منفصلة)</td></tr></table>
<p>تعطي خطوط كثيرة أيام سماح <b>مجمّعة</b> (تأخير + احتجاز معًا). عادة يوم التفريغ هو اليوم الأول ويوم إرجاع الفارغ يُحتسب أيضًا. بعد فترة السماح يرتفع السعر بشرائح.</p>
<h3>كيف تتجنّبها</h3>
<ul><li>فاوض على فترة السماح عند الحجز (14–21 يومًا للوجهات البطيئة التخليص).</li><li>اجمع مستندات الجمارك قبل الوصول.</li><li>خطّط للشاحنة ولتفريغ الزبون.</li><li>أرجع الفارغ إلى المستودع الصحيح مع EIR نظيف.</li></ul>
<h3>بعد الإرجاع</h3>
<p>يثبت EIR المستودع التاريخ والحالة. يحسب الخط الغرامات ويحسمها (مع أي أضرار/تنظيف) من التأمين ثم يعيد الباقي. أعد فوترة الغرامات للزبون حسب شروط عرضك.</p>`))
      + LB('Lebanese trucking: check the truck and driver are allowed at the port gate, respect axle limits and working hours, and make sure the client is ready to unload (a waiting truck costs money and adds detention days). Empty returns in Beirut go to the depot named on the D/O — returning to the wrong depot means re-handling and extra days.', 'النقل البري في لبنان: تأكّد أن الشاحنة والسائق مسموح لهما بدخول بوابة المرفأ، احترم حدود المحاور وساعات العمل، وتأكّد أن الزبون جاهز للتفريغ (انتظار الشاحنة يكلّف ويضيف أيام احتجاز). يُرجع الفارغ في بيروت إلى المستودع المذكور في إذن التسليم — الإرجاع لمستودع خاطئ يعني مناولة إضافية وأيامًا زائدة.');
  OPS.LESSON.closing = () => t(L(`
<h3>Job costing</h3>
<p>Every job is a small profit & loss account: <b>revenue</b> (what you invoice the client) − <b>costs</b> (line, trucker, broker, chamber, insurer…) = <b>job profit</b>. Compare it with the quoted profit: extra costs (D&D, waiting time, amendments) that were not rebilled eat the margin.</p>
<h3>Pass-through items</h3>
<p>Container deposits, duties and import VAT paid on behalf of the client are <b>disbursements</b>: they are recorded separately and are not revenue.</p>
<h3>Invoicing in Lebanon</h3>
<ul><li>Tax invoice with your VAT number and the client’s details.</li><li>VAT 11% on local services; international freight exempt/zero-rated (confirm with accounting).</li><li>Amounts usually in USD, with the LBP equivalent of VAT shown as required by the Ministry of Finance (the rate used must be the official one at invoice date).</li></ul>
<h3>Closing the file</h3>
<p>POD and EIR on file, all supplier invoices received and matched, deposit refunded, client invoiced and the job profit checked. Then hand the file to Accounting — here, through the same shipment JSON.</p>`,
    `
<h3>كلفة العملية</h3>
<p>كل عملية حساب أرباح وخسائر صغير: <b>الإيراد</b> (ما تفوتره للزبون) − <b>الكلفة</b> (الخط، النقل، المخلّص، الغرفة، شركة التأمين…) = <b>ربح العملية</b>. قارنه بالربح المقدّر في العرض: الكلف الإضافية (غرامات، انتظار، تعديلات) غير المعاد فوترتها تأكل الهامش.</p>
<h3>البنود المارّة</h3>
<p>تأمينات الحاويات والرسوم وضريبة الاستيراد المدفوعة نيابة عن الزبون هي <b>سُلف</b>: تُسجَّل منفصلة وليست إيرادًا.</p>
<h3>الفوترة في لبنان</h3>
<ul><li>فاتورة ضريبية مع رقمك الضريبي وبيانات الزبون.</li><li>ضريبة 11% على الخدمات المحلية؛ الشحن الدولي معفى/بنسبة صفر (تأكّد مع المحاسبة).</li><li>المبالغ عادة بالدولار، مع إظهار ما يعادل الضريبة بالليرة كما تطلب وزارة المالية (بالسعر الرسمي بتاريخ الفاتورة).</li></ul>
<h3>إقفال الملف</h3>
<p>إثبات التسليم وEIR في الملف، كل فواتير المورّدين مستلمة ومطابقة، التأمين مسترد، الزبون مفوتر والربح مُراجع. ثم سلّم الملف للمحاسبة — هنا عبر ملف JSON نفسه.</p>`));
  OPS.QUIZ = {};
  OPS.QUIZ.inquiry = [
      { q: L('Under FOB Shanghai, who normally appoints the forwarder for the ocean freight?', 'في FOB شنغهاي، من يعيّن عادة وكيل الشحن للشحن البحري؟'), o: [L('The seller', 'البائع'), L('The buyer', 'المشتري'), L('The shipping line', 'الخط الملاحي')], a: 1, e: L('FOB: the seller delivers on board; the buyer pays and arranges the main carriage.', 'FOB: البائع يسلّم على متن الباخرة؛ المشتري يدفع وينظّم النقل الرئيسي.') },
      { q: L('50 cartons of 1.0 × 0.5 × 0.4 m. Total CBM?', '50 كرتونة مقاس 1.0 × 0.5 × 0.4 م. كم المتر المكعّب الكلي؟'), o: ['10', '20', '5'], a: 0, e: L('0.2 CBM × 50 = 10 CBM.', '0.2 م³ × 50 = 10 م³.') },
      { q: L('18 tonnes of ceramic tiles, 15 CBM. Best equipment?', '18 طنًا من البلاط، 15 م³. ما أفضل معدّات؟'), o: [L('40′ HC', '40 قدم عالية'), L('20′ DV', '20 قدم عادية'), L('LCL', 'شحنة جزئية')], a: 1, e: L('Dense cargo: weight is the limit, a 20′ carries ~28 t.', 'بضاعة ثقيلة: الوزن هو الحد، والـ20 قدم تحمل ~28 طن.') },
      { q: L('Who should decide the HS code?', 'من يجب أن يحدّد رمز HS؟'), o: [L('The forwarder’s sales person', 'موظّف المبيعات لدى وكيل الشحن'), L('The importer / licensed broker', 'المستورد / المخلّص المرخّص'), L('The shipping line', 'الخط الملاحي')], a: 1 },
    ];
  OPS.QUIZ.rates = [
      { q: L('Line A: USD 2,300 all-in, 5 free days. Line B: USD 2,450 all-in, 14 free days. Beirut clearance usually takes 12 days, detention USD 30/day. Which is cheaper in reality?', 'الخط أ: 2300 دولار شامل، 5 أيام سماح. الخط ب: 2450 دولار، 14 يوم سماح. التخليص في بيروت يستغرق عادة 12 يومًا والاحتجاز 30 دولار/يوم. أيهما أرخص فعليًا؟'), o: [L('Line A', 'الخط أ'), L('Line B', 'الخط ب')], a: 1, e: L('A: 2,300 + 7 × 30 = 2,510. B: 2,450 + 0 = 2,450.', 'أ: 2300 + 7 × 30 = 2510. ب: 2450 + 0 = 2450.') },
      { q: L('What is BAF?', 'ما هو BAF؟'), o: [L('A port security fee', 'رسم أمني للمرفأ'), L('A fuel surcharge', 'رسم إضافي للوقود'), L('A customs duty', 'رسم جمركي')], a: 1 },
      { q: L('Why check the transshipment port?', 'لماذا تتحقّق من مرفأ المسافنة؟'), o: [L('It changes the B/L number', 'يغيّر رقم البوليصة'), L('Delay, congestion and sanctions risk are often in the middle leg', 'مخاطر التأخير والازدحام والعقوبات غالبًا في المرحلة الوسطى'), L('It is not important', 'غير مهم')], a: 1 },
    ];
  OPS.QUIZ.quote = [
      { q: L('Buy 1,000, sell 1,250. What is the margin?', 'الكلفة 1000، البيع 1250. ما الهامش؟'), o: ['25%', '20%', '12.5%'], a: 1, e: L('Profit 250 ÷ sell 1,250 = 20% (markup would be 25%).', 'الربح 250 ÷ البيع 1250 = 20% (الزيادة 25%).') },
      { q: L('Is a container deposit part of your revenue?', 'هل تأمين الحاوية جزء من إيرادك؟'), o: [L('Yes', 'نعم'), L('No — it is refundable and belongs to the client, held by the line', 'لا — مسترد ويعود للزبون ويحتفظ به الخط')], a: 1 },
      { q: L('Your line rate is valid until the 15th. Your quote validity should be…', 'سعر الخط صالح حتى 15 من الشهر. صلاحية عرضك يجب أن تكون…'), o: [L('Until the end of the month', 'حتى آخر الشهر'), L('Until the 15th or earlier', 'حتى 15 أو قبل'), L('No validity', 'بدون صلاحية')], a: 1 },
      { q: L('On which lines does a Lebanese forwarder normally charge VAT 11%?', 'على أي بنود يفرض وكيل الشحن اللبناني عادة ضريبة 11%؟'), o: [L('Only on ocean freight', 'على الشحن البحري فقط'), L('On local services (THC, handling, trucking, clearance…)', 'على الخدمات المحلية (THC، معالجة، نقل، تخليص…)'), L('On the container deposit', 'على تأمين الحاوية')], a: 1 },
    ];
  OPS.QUIZ.booking = [
      { q: L('CY cutoff is Thursday 16:00. When should the truck plan to gate in?', 'موعد CY الخميس 16:00. متى يجب أن تخطّط الشاحنة للدخول؟'), o: [L('Thursday 15:30', 'الخميس 15:30'), L('Wednesday (one day early)', 'الأربعاء (قبل يوم)'), L('Friday morning', 'الجمعة صباحًا')], a: 1 },
      { q: L('What happens if the VGM is missing at cutoff?', 'ماذا يحدث إذا لم يُقدَّم VGM قبل الموعد؟'), o: [L('The line estimates the weight', 'الخط يقدّر الوزن'), L('The container is not loaded', 'لا تُحمَّل الحاوية'), L('Nothing', 'لا شيء')], a: 1, e: L('SOLAS: no VGM, no loading.', 'SOLAS: بدون VGM لا تحميل.') },
      { q: L('FOB import to Beirut. Master B/L freight is normally…', 'استيراد FOB إلى بيروت. أجرة الشحن في البوليصة الرئيسية عادة…'), o: ['Prepaid', 'Collect'], a: 1 },
    ];
  OPS.QUIZ.stuffing = [
      { q: L('Which is a valid container number format?', 'أي صيغة لرقم حاوية صحيحة؟'), o: ['MSC 12345678', 'MSCU 123456 X', 'MSCU 123456 7'], a: 2 },
      { q: L('VGM Method 2 means…', 'طريقة VGM الثانية تعني…'), o: [L('Weighing the loaded container on a certified scale', 'وزن الحاوية المعبّأة على ميزان معتمد'), L('Adding cargo, packing, dunnage and the container tare', 'جمع البضاعة والتغليف والدعامات ووزن الحاوية الفارغة'), L('Estimating from the CBM', 'التقدير من الحجم')], a: 1 },
      { q: L('Why not pick up the empty container 10 days before stuffing?', 'لماذا لا تسحب الحاوية الفارغة قبل 10 أيام من التعبئة؟'), o: [L('Detention/free time starts at depot gate-out', 'الاحتجاز/فترة السماح تبدأ عند خروجها من المستودع'), L('The seal expires', 'ينتهي الختم'), L('It is illegal', 'غير قانوني')], a: 0 },
    ];
  OPS.QUIZ.gatein = [
      { q: L('ERD is Monday, CY cutoff is Thursday. The truck arrives Saturday before. What happens?', 'ERD يوم الاثنين، وموعد CY الخميس. وصلت الشاحنة السبت قبله. ماذا يحدث؟'), o: [L('Accepted normally', 'تُقبل عاديًا'), L('Refused or charged early storage', 'تُرفض أو تُفرض رسوم تخزين مبكر'), L('Loaded on an earlier vessel', 'تُحمَّل على باخرة أبكر')], a: 1 },
      { q: L('Under CFR, who clears export customs?', 'في CFR من يخلّص التصدير؟'), o: [L('Seller', 'البائع'), L('Buyer', 'المشتري'), L('Carrier', 'الناقل')], a: 0 },
      { q: L('In Lebanon, customs declarations are lodged through…', 'في لبنان تُقدَّم البيانات الجمركية عبر…'), o: [L('The shipping line portal', 'بوابة الخط الملاحي'), L('NAJM, by a licensed customs broker', 'نظام نجم، من قبل مخلّص جمركي مرخّص'), L('The Chamber of Commerce', 'غرفة التجارة')], a: 1 },
    ];
  OPS.QUIZ.si = [
      { q: L('Which weight goes on the B/L?', 'أي وزن يُكتب على البوليصة؟'), o: [L('VGM', 'VGM'), L('Cargo gross weight', 'الوزن الإجمالي للبضاعة'), L('Net weight only', 'الوزن الصافي فقط')], a: 1 },
      { q: L('Payment by letter of credit. The HBL consignee is usually…', 'الدفع باعتماد مستندي. المرسل إليه في HBL عادة…'), o: [L('The buyer directly', 'المشتري مباشرة'), L('“To order” / to order of the bank', '«لأمر» / لأمر المصرف'), L('The shipping line', 'الخط الملاحي')], a: 1 },
      { q: L('Why is a wrong name on the manifest serious in Lebanon?', 'لماذا الاسم الخاطئ في المانيفست خطير في لبنان؟'), o: [L('It is not serious', 'ليس خطيرًا'), L('Customs data must match the declaration; amendments at destination cost time and fees', 'بيانات الجمارك يجب أن تطابق البيان؛ التعديل في الوجهة يكلّف وقتًا ورسومًا'), L('The vessel cannot sail', 'لا يمكن للباخرة الإبحار')], a: 1 },
    ];
  OPS.QUIZ.sailing = [
      { q: L('Which release gives the seller control until payment?', 'أي إفراج يعطي البائع السيطرة حتى الدفع؟'), o: [L('Seaway bill', 'Seaway bill'), L('Original B/L', 'بوليصة أصلية'), L('Express release', 'إفراج سريع')], a: 1 },
      { q: L('A prepaid B/L is released…', 'البوليصة المسبقة الدفع تُسلَّم…'), o: [L('Before the vessel sails', 'قبل إبحار الباخرة'), L('After sailing and after freight payment', 'بعد الإبحار وبعد دفع الشحن'), L('At destination', 'في الوجهة')], a: 1 },
      { q: L('Switch B/Ls are dangerous because…', 'Switch B/L خطرة لأن…'), o: [L('They are illegal everywhere', 'غير قانونية في كل مكان'), L('Changing shipper details is where fraud often happens', 'تغيير بيانات الشاحن هو حيث يحدث الاحتيال غالبًا'), L('They are more expensive', 'أغلى')], a: 1 },
    ];
  OPS.QUIZ.tracking = [
      { q: L('A vessel is 4 days late. Does demurrage free time start earlier?', 'الباخرة متأخرة 4 أيام. هل تبدأ فترة السماح أبكر؟'), o: [L('Yes', 'نعم'), L('No — it starts at discharge', 'لا — تبدأ عند التفريغ')], a: 1 },
      { q: L('What is the most delay-prone part of this routing?', 'ما أكثر جزء عرضة للتأخير في هذا المسار؟'), o: [L('The transshipment connection', 'الربط في مرفأ المسافنة'), L('The B/L printing', 'طباعة البوليصة'), L('The quotation', 'عرض السعر')], a: 0 },
    ];
  OPS.QUIZ.release = [
      { q: L('FOB value 10,000, freight 1,500, insurance 50. CIF value?', 'قيمة FOB 10000، الشحن 1500، التأمين 50. قيمة CIF؟'), o: ['10,000', '11,550', '11,500'], a: 1 },
      { q: L('In Lebanon, which comes first?', 'في لبنان، أيهما يأتي أولًا؟'), o: [L('Customs declaration, then D/O', 'البيان الجمركي ثم إذن التسليم'), L('D/O from the line, then customs declaration', 'إذن التسليم من الخط ثم البيان الجمركي')], a: 1 },
      { q: L('Import VAT in Lebanon is calculated on…', 'ضريبة الاستيراد في لبنان تُحسب على…'), o: [L('FOB value', 'قيمة FOB'), L('CIF + customs duty (+ excise if any)', 'CIF + الرسم الجمركي (+ رسم الاستهلاك إن وجد)'), L('Freight only', 'الشحن فقط')], a: 1 },
    ];
  OPS.QUIZ.delivery = [
      { q: L('Discharge on the 1st, empty returned on the 14th, 10 free days (both days count). Chargeable days?', 'التفريغ في 1، إرجاع الفارغ في 14، 10 أيام سماح (يُحتسب اليومان). كم يومًا مستحقًا؟'), o: ['3', '4', '14'], a: 1, e: L('14 days used − 10 free = 4.', '14 يومًا − 10 سماح = 4.') },
      { q: L('Container is outside the terminal at the client’s warehouse after free time. That is…', 'الحاوية خارج المحطة في مستودع الزبون بعد فترة السماح. هذا…'), o: [L('Demurrage', 'تأخير'), L('Detention', 'احتجاز'), L('Port storage', 'تخزين المرفأ')], a: 1 },
      { q: L('When is the best moment to negotiate free time?', 'ما أفضل وقت للتفاوض على فترة السماح؟'), o: [L('At booking', 'عند الحجز'), L('After arrival', 'بعد الوصول'), L('When the invoice comes', 'عند وصول الفاتورة')], a: 0 },
    ];
  OPS.QUIZ.closing = [
      { q: L('Quoted profit 500. D&D of 90 was paid to the line and not rebilled. Real profit?', 'الربح المقدّر 500. دُفعت غرامات 90 للخط ولم تُعَد فوترتها. الربح الفعلي؟'), o: ['500', '410', '590'], a: 1 },
      { q: L('The container deposit refunded to the client is…', 'تأمين الحاوية المسترد للزبون هو…'), o: [L('Revenue', 'إيراد'), L('A disbursement / pass-through', 'سلفة / بند مارّ'), L('A cost', 'كلفة')], a: 1 },
      { q: L('VAT base 1,000 USD. VAT at 11%?', 'أساس الضريبة 1000 دولار. الضريبة 11%؟'), o: ['11', '110', '1,110'], a: 1 },
    ];

  /* ---------- LCL notes shown on top of the FCL lessons when the case is LCL ---------- */
  const N = (en, ar) => `<div class="note lcl"><strong>📦 LCL</strong>${t(L(en, ar))}</div>`;
  OPS.LESSON_LCL = {
    inquiry: () => N('Small shipments (roughly under 15 CBM) travel <b>LCL</b> — “less than container load”: a <b>consolidator</b> (co-loader) collects many shippers’ cargo at a <b>CFS</b> (container freight station), stuffs it into one box and unstuffs it at destination. LCL is billed per <b>W/M</b> (weight or measurement): the higher of CBM and tonnes, usually with a minimum of 1 W/M.', 'الشحنات الصغيرة (تقريبًا أقل من 15 م³) تُنقل <b>LCL</b> — «أقل من حاوية»: يجمع <b>المجمِّع</b> (Co-loader) بضائع عدة شاحنين في <b>محطة التجميع CFS</b>، يعبّئها في حاوية واحدة ويفرّغها في الوجهة. تُسعَّر LCL بوحدة <b>W/M</b> (الوزن أو الحجم): الأعلى بين المتر المكعّب والطن، غالبًا بحد أدنى 1.'),
    rates: () => N('For LCL you ask <b>consolidators</b>, not the lines. Their offer is a rate per W/M (+ minimum), a B/L/documentation fee, CFS charges at both ends and the free storage days at the destination CFS. Compare the total for <i>your</i> W/M, and the storage you will probably pay.', 'في LCL تطلب الأسعار من <b>المجمِّعين</b> لا من الخطوط. العرض سعر لكل W/M (+ حد أدنى)، رسم بوليصة/مستندات، رسوم محطة التجميع في الطرفين وأيام التخزين المجانية في محطة الوجهة. قارن المجموع على W/M <i>الخاصة بك</i>، والتخزين الذي ستدفعه على الأرجح.'),
    quote: () => N('LCL lines are quoted <b>per W/M</b> (freight, CFS) or <b>per B/L</b> (documents, handling). Show the W/M you used: the CFS will re-measure the cargo and the freight is finally billed on <b>their</b> measurement. There is no container deposit and no demurrage — but CFS <b>storage</b> after the free days.', 'تُسعَّر بنود LCL <b>لكل W/M</b> (الشحن، محطة التجميع) أو <b>لكل بوليصة</b> (المستندات، المعالجة). اذكر الـW/M المستعملة: محطة التجميع ستعيد القياس ويُفوتر الشحن نهائيًا على <b>قياسها</b>. لا يوجد تأمين حاوية ولا غرامات تأخير — لكن يوجد <b>تخزين</b> في المحطة بعد الأيام المجانية.'),
    booking: () => N('An LCL booking gives you a <b>CFS cutoff</b> (last day to deliver the cargo to the consolidator’s warehouse) instead of a CY cutoff. The consolidator stuffs the box, seals it and submits the container VGM.', 'حجز LCL يعطيك <b>موعد CFS</b> (آخر يوم لتسليم البضاعة لمستودع المجمِّع) بدل موعد CY. المجمِّع يعبّئ الحاوية ويختمها ويقدّم VGM للحاوية.'),
    stuffing: () => N('At the CFS the cargo is counted, measured and weighed and a <b>dock receipt</b> is issued. If the measured CBM is higher than declared, the freight is billed on the new figure — rebill the difference to the client. Every package must carry marks (shipper/consignee reference, “1/30, 2/30…”), because it shares a box with other people’s cargo.', 'في محطة التجميع تُعدّ البضاعة وتُقاس وتوزن ويصدر <b>إيصال الاستلام (Dock receipt)</b>. إذا كان الحجم المقاس أعلى من المصرّح به يُفوتر الشحن على الرقم الجديد — أعد فوترة الفرق للزبون. يجب أن يحمل كل طرد علامات (مرجع الشاحن/المرسل إليه، «1/30، 2/30…») لأنه يشارك الحاوية مع بضائع الآخرين.'),
    si: () => N('On LCL the consolidator issues its own B/L to you (it is your “master”). Its description says “1 of … packages in container …”; the seal belongs to the consolidator. Your HBL shows the real shipper and consignee, with “CFS/CFS” service.', 'في LCL يصدر المجمِّع بوليصته لك (هي «الرئيسية» بالنسبة لك). يذكر الوصف «جزء من حاوية …»؛ والختم للمجمِّع. بوليصتك HBL تُظهر الشاحن والمرسل إليه الحقيقيين مع خدمة «CFS/CFS».'),
    release: () => N('LCL import release: the consolidator’s agent in Beirut unstuffs the box at the CFS, issues the D/O after its CFS and D/O charges are paid — no container deposit. Storage starts after the CFS free days.', 'الإفراج في استيراد LCL: وكيل المجمِّع في بيروت يفرّغ الحاوية في المحطة ويصدر إذن التسليم بعد دفع رسوم المحطة وإذن التسليم — بدون تأمين حاوية. يبدأ التخزين بعد الأيام المجانية.'),
    delivery: () => N('No empty container to return on LCL: the clock that matters is <b>CFS storage</b> (per W/M per day after the free days). Collect quickly once customs is released.', 'لا حاوية فارغة لإرجاعها في LCL: العدّاد المهم هو <b>تخزين محطة التجميع</b> (لكل W/M يوميًا بعد الأيام المجانية). استلم البضاعة بسرعة بعد الإفراج الجمركي.'),
  };

  /* extra quiz questions (mixed with the generated ones) */
  const QX = {
    inquiry: [
      { q: L('LCL is charged per W/M. What does W/M mean?', 'تُحتسب LCL بـ W/M. ماذا تعني؟'), o: [L('The higher of weight (tonnes) and measurement (CBM)', 'الأعلى بين الوزن (طن) والحجم (م³)'), L('Weight plus measurement', 'الوزن زائد الحجم'), L('Width × middle height', 'العرض × الارتفاع')], a: 0 },
      { q: L('Under EXW, who loads the goods at the seller’s premises?', 'في EXW، من يحمّل البضاعة في مقرّ البائع؟'), o: [L('The buyer (or the buyer’s forwarder)', 'المشتري (أو وكيل شحنه)'), L('The seller', 'البائع'), L('The shipping line', 'الخط الملاحي')], a: 0 },
      { q: L('A supplier gives dimensions in millimetres: 1200 × 800 × 600 mm. In metres that is…', 'أعطى المورّد المقاسات بالميليمتر: 1200 × 800 × 600 مم. بالمتر…'), o: ['1.2 × 0.8 × 0.6', '12 × 8 × 6', '0.12 × 0.08 × 0.06'], a: 0 },
    ],
    rates: [
      { q: L('For a 6 CBM shipment you ask rates from…', 'لشحنة 6 م³ تطلب الأسعار من…'), o: [L('Consolidators (LCL co-loaders)', 'المجمِّعين (LCL)'), L('Only the big lines for a 40′', 'الخطوط الكبيرة فقط لحاوية 40'), L('The port authority', 'إدارة المرفأ')], a: 0 },
      { q: L('An offer is the cheapest but expires before your sailing. You…', 'عرض هو الأرخص لكنه ينتهي قبل باخرتك. أنت…'), o: [L('Do not use it — you would be re-quoted', 'لا تستعمله — سيُعاد تسعيرك'), L('Use it and hope', 'تستعمله وتأمل'), L('Quote the client a longer validity', 'تعطي الزبون صلاحية أطول')], a: 0 },
    ],
    quote: [
      { q: L('LCL quote: 4.6 W/M at USD 40 sell. The freight line shows…', 'عرض LCL: 4.6 W/M بسعر بيع 40 دولار. بند الشحن يُظهر…'), o: [L('USD 40 per W/M × 4.6 = USD 184', '40 دولار × 4.6 = 184 دولار'), L('USD 40 flat', '40 دولار مقطوعة'), L('USD 40 per container', '40 دولار للحاوية')], a: 0 },
      { q: L('Under CIF the seller must buy insurance for at least…', 'في CIF يجب أن يؤمّن البائع على الأقل بـ…'), o: [L('110% of the contract value, minimum cover (ICC C)', '110% من قيمة العقد، الحد الأدنى للتغطية (ICC C)'), L('50% of the value', '50% من القيمة'), L('Nothing — insurance is optional for the seller', 'لا شيء — التأمين اختياري للبائع')], a: 0 },
    ],
    booking: [
      { q: L('On an LCL booking, the key deadline for you is…', 'في حجز LCL الموعد الأهم لك هو…'), o: [L('The CFS cutoff (cargo at the consolidator’s warehouse)', 'موعد CFS (البضاعة في مستودع المجمِّع)'), L('The empty pickup date', 'تاريخ سحب الفارغ'), L('The demurrage start', 'بداية غرامات التأخير')], a: 0 },
    ],
    stuffing: [
      { q: L('The CFS measures 5.4 CBM; you declared 5.0. Freight is billed on…', 'قاست محطة التجميع 5.4 م³ وصرّحت أنت بـ5.0. يُفوتر الشحن على…'), o: ['5.4', '5.0', L('The average', 'المعدّل')], a: 0 },
      { q: L('Who submits the VGM of a consolidated LCL container?', 'من يقدّم VGM لحاوية LCL مجمّعة؟'), o: [L('The consolidator who packed it', 'المجمِّع الذي عبّأها'), L('Each shipper separately', 'كل شاحن على حدة'), L('Nobody', 'لا أحد')], a: 0 },
    ],
    gatein: [
      { q: L('Under EXW, who must clear the goods for export?', 'في EXW، من يجب أن يخلّص البضاعة للتصدير؟'), o: [L('The buyer (through its forwarder/agent)', 'المشتري (عبر وكيل الشحن)'), L('The seller', 'البائع'), L('The carrier', 'الناقل')], a: 0 },
    ],
    si: [
      { q: L('Payment by advance transfer, goods fully paid. The HBL consignee is usually…', 'الدفع مسبقًا وتمّ بالكامل. المرسل إليه في HBL عادة…'), o: [L('The buyer directly (straight consignment)', 'المشتري مباشرة'), L('“To order”', '«لأمر»'), L('The shipping line', 'الخط الملاحي')], a: 0 },
    ],
    sailing: [
      { q: L('The buyer paid 100% in advance. The fastest safe release is…', 'دفع المشتري 100% مسبقًا. أسرع إفراج آمن…'), o: [L('Express release / seaway bill to the buyer', 'إفراج سريع / Seaway bill للمشتري'), L('Originals by courier', 'أصول بالبريد السريع'), L('Switch B/L', 'Switch B/L')], a: 0 },
      { q: L('Exports to the USA need advance cargo data called…', 'الصادرات إلى أميركا تحتاج بيانات مسبقة تُسمّى…'), o: ['AMS / ISF', 'ICS2', 'EUR.1'], a: 0 },
    ],
    tracking: [
      { q: L('Your client asks for an exact arrival time guarantee. You say…', 'يطلب زبونك ضمان موعد الوصول. تقول…'), o: [L('ETAs are estimates; we update you at each milestone', 'مواعيد الوصول تقديرية؛ سنبلغكم عند كل مرحلة'), L('Guaranteed', 'مضمون'), L('No idea', 'لا أعرف')], a: 0 },
    ],
    release: [
      { q: L('Exports to Saudi Arabia/UAE: which document can give GAFTA preference?', 'الصادرات إلى السعودية/الإمارات: أي مستند يعطي تفضيل منطقة التجارة العربية؟'), o: [L('Arab certificate of origin (GAFTA)', 'شهادة المنشأ العربية'), 'EUR.1', L('Health certificate', 'الشهادة الصحية')], a: 0 },
      { q: L('LCL import in Beirut: is there a container deposit?', 'استيراد LCL في بيروت: هل يوجد تأمين حاوية؟'), o: [L('No — the cargo is unstuffed at the CFS', 'لا — تُفرَّغ البضاعة في محطة التجميع'), L('Yes, always USD 1,500', 'نعم، دائمًا 1500 دولار')], a: 0 },
    ],
    delivery: [
      { q: L('LCL cargo waits at the CFS after the free days. You pay…', 'بقيت بضاعة LCL في المحطة بعد الأيام المجانية. تدفع…'), o: [L('CFS storage per W/M per day', 'تخزين المحطة لكل W/M يوميًا'), L('Container detention', 'احتجاز الحاوية'), L('Nothing', 'لا شيء')], a: 0 },
    ],
    closing: [
      { q: L('The CFS re-measured your LCL cargo and the consolidator billed more freight. To protect the margin you…', 'أعادت المحطة قياس بضاعتك وفوتر المجمِّع شحنًا أكثر. لحماية الهامش…'), o: [L('Rebill the difference to the client, as per the quotation terms', 'تعيد فوترة الفرق للزبون حسب شروط العرض'), L('Absorb it silently', 'تتحمّله بصمت'), L('Refuse to pay the consolidator', 'ترفض الدفع للمجمِّع')], a: 0 },
    ],
  };
  Object.keys(QX).forEach((k) => { OPS.QUIZ[k] = (OPS.QUIZ[k] || []).concat(QX[k]); });
  /* generated micro-exercises mixed into each step's quiz */
  OPS.QUIZ_DRILLS = { inquiry: ['cbm', 'eq', 'wm'], rates: ['dd', 'lclFreight', 'storage'], quote: ['margin', 'markup', 'vat'], booking: ['cutoff', 'incoterm'], stuffing: ['checkdigit', 'vgm'], gatein: ['cutoff', 'incoterm'], si: ['vgm', 'checkdigit'], sailing: ['incoterm'], tracking: ['dd'], release: ['cif', 'dutyvat'], delivery: ['dd', 'storage'], closing: ['margin', 'vat', 'lbp'] };
})();
