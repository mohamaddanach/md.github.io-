/* Port Master Academy — specialisation tracks: L8 other terminals & depots, L9 port development */
(function () {
  const L = TS.L;
  const Q = (q, o, a, e) => ({ q, o, a, e });
  const add = (x) => PT.lessons.push(x);

  /* =========================================================== LEVEL 8 — OTHER TERMINALS & DEPOTS */
  add({
    id: 'liquid', lvl: 8, icon: '🛢', min: 18,
    title: L('Liquid bulk & tank terminals', 'محطات السوائل السائبة والخزّانات'),
    sub: L('Jetties, loading arms, tank farms, gauging, ullage, temperature correction (VCF), ISGOTT safety.', 'الأرصفة البحرية، أذرع التحميل، مزارع الخزّانات، القياس، الفراغ العلوي، تصحيح الحرارة VCF، سلامة ISGOTT.'),
    body: L(`
<h3>Products & layout</h3>
<p>Clean products (gasoline, diesel, jet), dirty products (fuel oil), crude, chemicals, LPG/LNG (gas terminals) and edible oils. A tank terminal = <b>jetty</b> with loading arms or hoses → <b>pipelines</b> and manifolds → <b>tank farm</b> (fixed roof, floating roof, pressurised spheres) → <b>truck/rail loading racks</b>.</p>
<h3>Measuring liquid cargo</h3>
<ul>
<li><b>Innage</b> = liquid height; <b>ullage</b> = empty space from the reference point to the surface.</li>
<li>Tank calibration tables convert height → volume.</li>
<li>Oil expands with temperature → volumes are corrected to 15 °C (or 60 °F) with the <b>VCF</b> (ASTM tables).</li>
</ul>
<div class="formula">GOV (gross observed volume) = volume from tank table at observed temperature
GSV (gross standard volume)  = GOV × VCF
Mass (t) ≈ GSV × density at 15 °C (in vacuum/air per contract)</div>
<div class="ex" data-t="Example">Tank: GOV 10,000 m³ of diesel at 30 °C, VCF 0.9875 → GSV 9,875 m³ × 0.845 t/m³ = 8,344 t.</div>
<h3>Safety — ISGOTT</h3>
<ul>
<li><b>Ship/Shore Safety Checklist</b> before any transfer; agreed max loading rate & emergency stop.</li>
<li>Bonding/earthing, insulating flanges, no ignition sources, hot-work permits.</li>
<li>Overfill protection: high and high-high alarms, independent shutdowns.</li>
<li>Bunds (secondary containment ≥ 110% of the largest tank), firefighting foam systems, vapour recovery.</li>
<li>Mooring watch: tides and passing ships move the vessel; loading arms have envelope limits.</li>
</ul>
<h3>Commercial</h3>
<p>Revenues: storage (USD per m³ per month), throughput fees, heating, blending, additives. Contracts are often take-or-pay.</p>`,
`
<h3>المنتجات والتخطيط</h3>
<p>منتجات نظيفة (بنزين، ديزل، وقود طائرات)، منتجات ثقيلة (زيت الوقود)، نفط خام، كيماويات، غاز البترول/الطبيعي المسال، وزيوت غذائية. محطة الخزّانات = <b>رصيف بحري</b> بأذرع تحميل أو خراطيم ← <b>أنابيب</b> ومشعبات ← <b>مزرعة خزّانات</b> (سقف ثابت، سقف عائم، كرات مضغوطة) ← <b>منصّات تحميل الشاحنات/القطارات</b>.</p>
<h3>قياس البضائع السائلة</h3>
<ul>
<li><b>الارتفاع (Innage)</b> = ارتفاع السائل؛ <b>الفراغ (Ullage)</b> = المسافة الفارغة من نقطة المرجع حتى السطح.</li>
<li>جداول معايرة الخزّان تحوّل الارتفاع ← حجم.</li>
<li>النفط يتمدّد مع الحرارة ← تُصحَّح الأحجام إلى 15 °م (أو 60 °ف) بمعامل <b>VCF</b> (جداول ASTM).</li>
</ul>
<div class="formula">GOV (gross observed volume) = volume from tank table at observed temperature
GSV (gross standard volume)  = GOV × VCF
Mass (t) ≈ GSV × density at 15 °C (in vacuum/air per contract)</div>
<div class="ex" data-t="مثال">خزّان: GOV = 10,000 م³ ديزل عند 30 °م، VCF = 0.9875 ← GSV = 9,875 م³ × 0.845 طن/م³ = 8,344 طنًا.</div>
<h3>السلامة — ISGOTT</h3>
<ul>
<li><b>قائمة فحص السلامة بين السفينة والبر</b> قبل أي نقل؛ معدّل تحميل أقصى متّفق عليه وإيقاف طوارئ.</li>
<li>الربط/التأريض، الوصلات العازلة، لا مصادر اشتعال، تصاريح العمل الساخن.</li>
<li>الحماية من الفيضان: إنذارات عالي وعالٍ جدًا، وإيقاف مستقل.</li>
<li>الأحواض الحاجزة (احتواء ثانوي ≥ 110% من أكبر خزّان)، أنظمة رغوة الإطفاء، استرجاع الأبخرة.</li>
<li>مراقبة الربط: المد والسفن المارّة تحرّك السفينة؛ ولأذرع التحميل حدود حركة.</li>
</ul>
<h3>التجاري</h3>
<p>الإيرادات: التخزين (دولار لكل م³ شهريًا)، رسوم العبور، التسخين، الخلط، الإضافات. العقود غالبًا “ادفع سواء استخدمت أم لا”.</p>`),
    keys: [L('Ullage = empty space; innage = liquid height.', 'الفراغ = المساحة الفارغة؛ الارتفاع = ارتفاع السائل.'), L('GSV = GOV × VCF (to 15 °C).', 'GSV = GOV × VCF (إلى 15 °م).'), L('Ship/Shore Safety Checklist before every transfer.', 'قائمة فحص السلامة بين السفينة والبر قبل كل نقل.')],
    senior: L('Never let commercial pressure raise the agreed loading rate. Most overfills happen in the last 10% of a tank — slow down when topping off.', 'لا تسمح أبدًا للضغط التجاري برفع معدّل التحميل المتّفق عليه. معظم حالات الفيضان تحدث في آخر 10% من الخزّان — خفّف عند الملء النهائي.'),
    quiz: [
      Q(L('GOV 5,000 m³, VCF 0.99, density 0.75 t/m³. Mass?', 'GOV = 5,000 م³، VCF = 0.99، الكثافة 0.75 طن/م³. الكتلة؟'), [L('3,712.5 t', '3,712.5 طنًا'), L('3,750 t', '3,750 طنًا'), L('4,950 t', '4,950 طنًا'), L('6,600 t', '6,600 طن')], 0, L('5,000 × 0.99 × 0.75 = 3,712.5 t.', '5,000 × 0.99 × 0.75 = 3,712.5 طنًا.')),
      Q(L('Bund capacity is typically at least…', 'سعة الحوض الحاجز عادةً على الأقل…'), [L('50% of all tanks', '50% من كل الخزّانات'), L('110% of the largest tank', '110% من أكبر خزّان'), L('10% of the smallest tank', '10% من أصغر خزّان'), L('No requirement', 'لا متطلّب')], 1, L('Secondary containment for the worst single-tank failure.', 'احتواء ثانوي لأسوأ انهيار خزّان منفرد.')),
      Q(L('Ullage is…', 'الفراغ (Ullage) هو…'), [L('Liquid height', 'ارتفاع السائل'), L('Empty space above the liquid', 'المساحة الفارغة فوق السائل'), L('Water at the bottom', 'الماء في القاع'), L('Tank diameter', 'قطر الخزّان')], 1, L('Innage is liquid height.', 'الارتفاع هو ارتفاع السائل.')),
    ],
  });

  add({
    id: 'roro', lvl: 8, icon: '🚗', min: 14,
    title: L('Ro-ro & car terminals', 'محطات الرورو والسيارات'),
    sub: L('PCTC & ro-pax, lane metres, CEU, parking capacity, damage inspection, PDI, stevedoring.', 'سفن نقل السيارات والركّاب، أمتار المسارات، وحدات CEU، سعة المواقف، فحص الأضرار، PDI، التحميل.'),
    body: L(`
<h3>Ship types</h3>
<ul><li><b>PCTC</b> (pure car & truck carrier): 4,000–9,000 CEU.</li><li><b>Ro-ro / con-ro</b>: trailers, machinery (“high & heavy”), containers on deck.</li><li><b>Ro-pax</b>: ferries with passengers and trucks.</li></ul>
<h3>Units</h3>
<div class="formula">CEU (car equivalent unit) ≈ 1 standard car (Toyota Corolla 1966 reference, ~4.1 × 1.5 m)
Lane metres (lm) = length of deck lane used (trailers ≈ 13.6–17 lm each)</div>
<h3>Car terminal capacity</h3>
<div class="formula">Parking slots ≈ Net area (m²) ÷ ~20–25 m² per car (incl. aisles)
Annual capacity ≈ Slots × utilisation × 365 ÷ Average dwell (days)</div>
<div class="ex" data-t="Example">CBCT car park 4,200 slots, 75% utilisation, dwell 12 days → 4,200 × 0.75 × 365 ÷ 12 = 95,800 cars/year.</div>
<h3>Operations</h3>
<ul>
<li>Drivers (“gangs”) drive cars on/off; 20–30 cars/hour per gang; shuttle vans return drivers.</li>
<li><b>Damage inspection</b> at discharge (photos, damage codes) — the EIR of the car world.</li>
<li><b>PDI</b> (pre-delivery inspection), washing, accessories fitting, battery checks.</li>
<li>High & heavy: mafi trailers, tow tractors, special lashing.</li>
</ul>
<h3>Key risks</h3><p>Vehicle damage, theft of parts, fire (especially electric vehicles — special procedures for lithium-ion fires), keys management, traffic safety for drivers on foot.</p>`,
`
<h3>أنواع السفن</h3>
<ul><li><b>PCTC</b> (ناقلة سيارات وشاحنات): 4,000–9,000 CEU.</li><li><b>رورو / كون-رو</b>: مقطورات، آليات (“العالية والثقيلة”)، حاويات على السطح.</li><li><b>رو-باكس</b>: عبّارات بركّاب وشاحنات.</li></ul>
<h3>الوحدات</h3>
<div class="formula">CEU (car equivalent unit) ≈ 1 standard car (Toyota Corolla 1966 reference, ~4.1 × 1.5 m)
Lane metres (lm) = length of deck lane used (trailers ≈ 13.6–17 lm each)</div>
<h3>سعة محطة السيارات</h3>
<div class="formula">Parking slots ≈ Net area (m²) ÷ ~20–25 m² per car (incl. aisles)
Annual capacity ≈ Slots × utilisation × 365 ÷ Average dwell (days)</div>
<div class="ex" data-t="مثال">موقف CBCT للسيارات 4,200 خانة، استخدام 75%، بقاء 12 يومًا ← 4,200 × 0.75 × 365 ÷ 12 = 95,800 سيارة/سنة.</div>
<h3>العمليات</h3>
<ul>
<li>سائقون (“فرق”) يقودون السيارات للصعود/النزول؛ 20–30 سيارة/ساعة لكل فرقة؛ حافلات صغيرة تعيد السائقين.</li>
<li><b>فحص الأضرار</b> عند التفريغ (صور، رموز الأضرار) — بمثابة EIR في عالم السيارات.</li>
<li><b>PDI</b> (فحص ما قبل التسليم)، الغسيل، تركيب الملحقات، فحص البطاريات.</li>
<li>العالية والثقيلة: مقطورات مافي، جرّارات سحب، تثبيت خاص.</li>
</ul>
<h3>المخاطر الرئيسية</h3><p>أضرار المركبات، سرقة القطع، الحريق (خاصة السيارات الكهربائية — إجراءات خاصة لحرائق بطاريات الليثيوم)، إدارة المفاتيح، سلامة السائقين المشاة.</p>`),
    keys: [L('CEU for cars, lane metres for trailers.', 'CEU للسيارات، أمتار المسارات للمقطورات.'), L('Capacity = slots × utilisation × 365 ÷ dwell.', 'السعة = الخانات × الاستخدام × 365 ÷ البقاء.'), L('Damage inspection at discharge protects the terminal.', 'فحص الأضرار عند التفريغ يحمي المحطة.')],
    senior: L('Treat EV storage separately: spacing, fire-watch, charging limits and a lithium-ion fire plan with the fire brigade.', 'عامل تخزين السيارات الكهربائية بشكل منفصل: تباعد، مراقبة حريق، حدود للشحن، وخطة لحرائق الليثيوم مع الدفاع المدني.'),
    quiz: [
      Q(L('2,000 slots, 80% utilisation, dwell 10 days. Annual capacity?', '2,000 خانة، استخدام 80%، بقاء 10 أيام. السعة السنوية؟'), [L('58,400 cars', '58,400 سيارة'), L('73,000 cars', '73,000 سيارة'), L('16,000 cars', '16,000 سيارة'), L('146,000 cars', '146,000 سيارة')], 0, L('2,000 × 0.8 × 365 ÷ 10 = 58,400.', '2,000 × 0.8 × 365 ÷ 10 = 58,400.')),
      Q(L('Trailers on a ro-ro ship are measured in…', 'المقطورات على سفينة الرورو تُقاس بـ…'), [L('TEU', 'TEU'), L('Lane metres', 'أمتار المسارات'), L('CBM', 'م³'), L('DWT', 'DWT')], 1, L('Lane metres of deck.', 'أمتار مسارات السطح.')),
    ],
  });

  add({
    id: 'breakbulk', lvl: 8, icon: '🏗', min: 15,
    title: L('Breakbulk, project & heavy-lift cargo', 'البضائع العامة وشحنات المشاريع والرفع الثقيل'),
    sub: L('Multipurpose terminals, stowage factor, lift plans, SWL, tandem lifts, ground bearing, laydown.', 'المحطات متعدّدة الأغراض، معامل الرصّ، خطط الرفع، حمولة العمل الآمنة، الرفع الترادفي، تحمّل الأرض، مساحات التخزين.'),
    body: L(`
<h3>What is breakbulk?</h3>
<p>Non-containerised general cargo: steel coils, pipes, timber, bagged goods, machinery, transformers, wind blades, yachts. Handled by mobile harbour cranes (MHC), ship's gear, forklifts and special trailers (SPMT).</p>
<h3>Stowage factor</h3>
<div class="formula">Stowage factor (m³/t) = space occupied ÷ weight
Low SF (steel ~0.3–0.5) = heavy, "deadweight cargo"; high SF (cotton ~2–3) = "volume cargo"</div>
<h3>Lift planning</h3>
<ul>
<li>Know <b>weight, dimensions, centre of gravity, lifting points</b> (from the shipper's drawings).</li>
<li>Crane capacity depends on <b>radius</b>: check the load chart; never exceed <b>SWL/WLL</b> including rigging weight.</li>
<li>Utilisation rule: often ≤ 75–85% of chart capacity for critical lifts.</li>
<li><b>Tandem lift</b> (two cranes): each crane typically limited to ~75–80% of its capacity and a lift supervisor.</li>
<li>Wind limits, exclusion zones, tag lines, qualified riggers, signed lift plan.</li>
</ul>
<div class="formula">Total hook load = cargo + spreader/beam + slings/shackles (+ hook block if not in chart)
Ground bearing pressure (t/m²) = load ÷ contact area — check quay/yard capacity (e.g. 5–15 t/m²)</div>
<div class="ex" data-t="Example">Transformer 142 t + spreader beam 6 t + slings 2 t = 150 t. Two MHCs of 100 t each in tandem at 75% = 150 t → exactly at the limit: use a bigger crane or the ship's heavy-lift gear.</div>
<h3>Laydown & documents</h3>
<p>Laydown areas need ground strength, dunnage and access for SPMTs. Documents: lift plan, method statement, sea-fastening plan, surveyor's certificates, insurance.</p>`,
`
<h3>ما هي البضائع العامة (Breakbulk)؟</h3>
<p>بضائع عامة غير محوّاة: لفائف الحديد، الأنابيب، الأخشاب، البضائع المعبّأة في أكياس، الآليات، المحوّلات، شفرات الرياح، اليخوت. تُناول برافعات الميناء المتنقّلة (MHC)، روافع السفينة، الرافعات الشوكية ومقطورات خاصة (SPMT).</p>
<h3>معامل الرصّ</h3>
<div class="formula">Stowage factor (m³/t) = space occupied ÷ weight
Low SF (steel ~0.3–0.5) = heavy, "deadweight cargo"; high SF (cotton ~2–3) = "volume cargo"</div>
<h3>تخطيط الرفع</h3>
<ul>
<li>اعرف <b>الوزن والأبعاد ومركز الثقل ونقاط الرفع</b> (من رسومات الشاحن).</li>
<li>قدرة الرافعة تعتمد على <b>نصف القطر</b>: راجع جدول الأحمال؛ لا تتجاوز أبدًا <b>حمولة العمل الآمنة SWL/WLL</b> شاملة وزن أدوات الرفع.</li>
<li>قاعدة الاستخدام: غالبًا ≤ 75–85% من قدرة الجدول للرفعات الحرجة.</li>
<li><b>الرفع الترادفي</b> (رافعتان): كل رافعة محدودة عادةً بـ ~75–80% من قدرتها مع مشرف رفع.</li>
<li>حدود الرياح، مناطق محظورة، حبال توجيه، عمّال تثبيت مؤهّلون، خطة رفع موقّعة.</li>
</ul>
<div class="formula">Total hook load = cargo + spreader/beam + slings/shackles (+ hook block if not in chart)
Ground bearing pressure (t/m²) = load ÷ contact area — check quay/yard capacity (e.g. 5–15 t/m²)</div>
<div class="ex" data-t="مثال">محوّل 142 طنًا + عارضة رفع 6 أطنان + حبال 2 طن = 150 طنًا. رافعتان متنقّلتان بقدرة 100 طن لكلّ منهما ترادفيًا بنسبة 75% = 150 طنًا ← على الحدّ تمامًا: استخدم رافعة أكبر أو روافع السفينة الثقيلة.</div>
<h3>مساحات التخزين والمستندات</h3>
<p>مساحات التخزين تحتاج تحمّلًا أرضيًا وحشوات ووصولًا لمقطورات SPMT. المستندات: خطة الرفع، بيان طريقة العمل، خطة التثبيت البحري، شهادات المُعاين، التأمين.</p>`),
    keys: [L('Stowage factor = m³ per tonne.', 'معامل الرصّ = م³ لكل طن.'), L('Hook load includes rigging; check crane chart at the radius.', 'حمل الخطاف يشمل أدوات الرفع؛ راجع جدول الرافعة عند نصف القطر.'), L('Check ground bearing pressure for heavy cargo.', 'تحقّق من ضغط التحمّل الأرضي للبضائع الثقيلة.')],
    senior: L('For any lift above 80% of capacity or with two cranes, require a written lift plan signed by the lift supervisor — and attend the pre-lift meeting yourself.', 'لأي رفعة فوق 80% من القدرة أو برافعتين، اطلب خطة رفع مكتوبة موقّعة من مشرف الرفع — واحضر اجتماع ما قبل الرفع بنفسك.'),
    quiz: [
      Q(L('Cargo 60 t, beam 3 t, slings 1 t. Hook load?', 'البضاعة 60 طنًا، العارضة 3 أطنان، الحبال 1 طن. حمل الخطاف؟'), [L('60 t', '60 طنًا'), L('63 t', '63 طنًا'), L('64 t', '64 طنًا'), L('57 t', '57 طنًا')], 2, L('60 + 3 + 1 = 64 t.', '60 + 3 + 1 = 64 طنًا.')),
      Q(L('Cargo occupying 900 m³ weighs 300 t. Stowage factor?', 'بضاعة تشغل 900 م³ ووزنها 300 طن. معامل الرصّ؟'), [L('0.33 m³/t', '0.33 م³/طن'), L('3 m³/t', '3 م³/طن'), L('270 m³/t', '270 م³/طن'), L('1.2 m³/t', '1.2 م³/طن')], 1, L('900 ÷ 300 = 3 m³/t → volume cargo.', '900 ÷ 300 = 3 م³/طن ← بضاعة حجمية.')),
    ],
  });

  add({
    id: 'depot-adv', lvl: 8, icon: '🏭', min: 16,
    title: L('Advanced depot management', 'إدارة المستودعات المتقدّمة'),
    sub: L('Depot layout & capacity, stacking by line/type/grade, inventory accuracy, contracts, billing, depot P&L.', 'تخطيط المستودع وسعته، الرصّ حسب الخط/النوع/الدرجة، دقّة المخزون، العقود، الفوترة، أرباح وخسائر المستودع.'),
    body: L(`
<h3>Depot layout</h3>
<ul>
<li>Zones: gate & survey lane, damaged/awaiting-EOR area, M&R workshop, washing bay, reefer PTI area with plugs, sound stock stacks, release lanes.</li>
<li>Stack <b>by line → size/type → grade</b>, so a release can be served from the top without rehandles.</li>
<li>Empty container handlers stack 5–8 high; keep fire lanes and wind-limit rules.</li>
</ul>
<div class="formula">Depot capacity (TEU) = Ground slots (TEU) × stacking height × utilisation (≈ 0.75–0.85)
Throughput/year ≈ capacity × 365 ÷ average empty dwell (days)</div>
<h3>Inventory accuracy</h3>
<p>The line sees your stock through CODECO messages. Every gate-in/out, status change (damaged → sound, food-grade upgrade) must be reported the same day. Run a <b>physical stock count</b> weekly; target ≥ 99.5% accuracy.</p>
<h3>Revenue & contracts</h3>
<div class="table-wrap"><table><thead><tr><th>Revenue line</th><th>Paid by</th></tr></thead><tbody>
<tr><td>Lift-on / lift-off (LOLO)</td><td>Line (sometimes trucker)</td></tr>
<tr><td>Storage per day after free days</td><td>Line</td></tr>
<tr><td>M&R (owner repairs)</td><td>Line / lessor</td></tr>
<tr><td>M&R (user damage)</td><td>Line, recharged to customer</td></tr>
<tr><td>Washing, PTI, labels removal</td><td>Line / customer</td></tr>
</tbody></table></div>
<h3>Depot KPIs</h3>
<ul><li>Gate-in to available (days); EOR approval time; repair turnaround.</li><li>Gate truck turnaround (target &lt; 20 min).</li><li>% sound stock; stock accuracy; claims rate; revenue per TEU handled; cost per lift.</li></ul>
<h3>Depot P&L</h3>
<div class="formula">Gross margin = LOLO + storage + M&R + services − (labour + equipment + fuel + land rent + materials)</div>`,
`
<h3>تخطيط المستودع</h3>
<ul>
<li>المناطق: مسار البوابة والفحص، منطقة المتضرّر/بانتظار التقدير، ورشة الصيانة والإصلاح، منطقة الغسيل، منطقة PTI للمبرّدات مع المقابس، رصّات المخزون السليم، مسارات الإطلاق.</li>
<li>رصّ <b>حسب الخط ← المقاس/النوع ← الدرجة</b>، حتى يُخدم أمر الإطلاق من الأعلى دون إعادة مناولة.</li>
<li>رافعات الفارغ ترصّ 5–8 طبقات؛ حافظ على ممرّات الحريق وقواعد حدود الرياح.</li>
</ul>
<div class="formula">Depot capacity (TEU) = Ground slots (TEU) × stacking height × utilisation (≈ 0.75–0.85)
Throughput/year ≈ capacity × 365 ÷ average empty dwell (days)</div>
<h3>دقّة المخزون</h3>
<p>يرى الخط مخزونك عبر رسائل CODECO. كل دخول/خروج وتغيّر حالة (متضرّرة ← سليمة، ترقية لصالحة للغذاء) يجب الإبلاغ عنه في اليوم نفسه. نفّذ <b>جردًا فعليًا</b> أسبوعيًا؛ والهدف دقّة ≥ 99.5%.</p>
<h3>الإيرادات والعقود</h3>
<div class="table-wrap"><table><thead><tr><th>بند الإيراد</th><th>يدفعه</th></tr></thead><tbody>
<tr><td>رفع / إنزال (LOLO)</td><td>الخط (أحيانًا الناقل)</td></tr>
<tr><td>التخزين اليومي بعد الأيام المجانية</td><td>الخط</td></tr>
<tr><td>الصيانة (إصلاحات المالك)</td><td>الخط / المؤجّر</td></tr>
<tr><td>الصيانة (ضرر المستخدم)</td><td>الخط، ويُعاد تحميلها على الزبون</td></tr>
<tr><td>الغسيل، PTI، إزالة الملصقات</td><td>الخط / الزبون</td></tr>
</tbody></table></div>
<h3>مؤشرات المستودع</h3>
<ul><li>من الدخول حتى الإتاحة (أيام)؛ زمن اعتماد التقدير؛ زمن الإصلاح.</li><li>زمن دوران الشاحنة على البوابة (الهدف &lt; 20 دقيقة).</li><li>نسبة المخزون السليم؛ دقّة المخزون؛ نسبة المطالبات؛ الإيراد لكل TEU؛ التكلفة لكل رفعة.</li></ul>
<h3>أرباح وخسائر المستودع</h3>
<div class="formula">Gross margin = LOLO + storage + M&R + services − (labour + equipment + fuel + land rent + materials)</div>`),
    keys: [L('Stack by line → type → grade.', 'رصّ حسب الخط ← النوع ← الدرجة.'), L('Report every move and status change the same day (CODECO).', 'أبلغ عن كل حركة وتغيّر حالة في اليوم نفسه (CODECO).'), L('Know your revenue per lift and cost per lift.', 'اعرف إيرادك وتكلفتك لكل رفعة.')],
    senior: L('The fastest way to lose a shipping line’s depot contract is a wrong stock report. Count physically, reconcile with the line’s system weekly, and fix differences before they become their problem.', 'أسرع طريقة لخسارة عقد مستودع مع خط ملاحي هي تقرير مخزون خاطئ. اجرد فعليًا، وطابق مع نظام الخط أسبوعيًا، وأصلح الفروق قبل أن تصبح مشكلتهم.'),
    quiz: [
      Q(L('Depot 1,000 TEU slots × 6 high × 0.8. Capacity?', 'مستودع 1,000 خانة × 6 طبقات × 0.8. السعة؟'), [L('4,800 TEU', '4,800 TEU'), L('6,000 TEU', '6,000 TEU'), L('7,500 TEU', '7,500 TEU'), L('800 TEU', '800 TEU')], 0, L('1,000 × 6 × 0.8 = 4,800 TEU.', '1,000 × 6 × 0.8 = 4,800 TEU.')),
      Q(L('How should empties be stacked?', 'كيف يجب رصّ الفارغ؟'), [L('Randomly', 'عشوائيًا'), L('By line → size/type → grade', 'حسب الخط ← المقاس/النوع ← الدرجة'), L('By arrival time only', 'حسب وقت الوصول فقط'), L('By colour', 'حسب اللون')], 1, L('So releases come from the top.', 'لتُخدم أوامر الإطلاق من الأعلى.')),
    ],
  });

  /* =========================================================== LEVEL 9 — PORT DEVELOPMENT */
  add({
    id: 'dev-master', lvl: 9, icon: '🗺', min: 20,
    title: L('Port master planning & demand forecasting', 'التخطيط الرئيسي للموانئ والتنبّؤ بالطلب'),
    sub: L('Master plan process, traffic forecasts (CAGR, scenarios), land use, hinterland, phasing triggers.', 'عملية المخطّط الرئيسي، توقّعات الحركة (معدّل النمو المركّب، السيناريوهات)، استخدام الأراضي، الظهير، محفّزات المراحل.'),
    body: L(`
<h3>What a port master plan answers</h3>
<p>“What traffic will come in the next 20–30 years, what facilities are needed, where, when, and at what cost?” It is updated every ~5 years.</p>
<h3>The master planning process</h3>
<ol>
<li><b>Baseline</b>: current traffic, capacity, performance, land, environment, stakeholders.</li>
<li><b>Market study & forecast</b>: by cargo type (containers, dry bulk, liquid, ro-ro, cruise).</li>
<li><b>Capacity analysis</b>: berth, yard, gate, hinterland (road/rail).</li>
<li><b>Gap analysis</b> → <b>development options</b> (productivity, new berths, reclamation, new terminal).</li>
<li><b>Evaluation</b>: technical, economic, environmental, social (multi-criteria).</li>
<li><b>Phasing & implementation plan</b>, land-use plan, investment programme.</li>
</ol>
<h3>Forecasting</h3>
<div class="formula">Future volume = Current × (1 + g)^n        (g = annual growth rate, n = years)
CAGR = (End ÷ Start)^(1/n) − 1</div>
<ul>
<li>Drivers: GDP growth, population, trade elasticity (container growth ≈ 1–1.5 × GDP growth), transshipment competition, new shipping services.</li>
<li>Always use <b>scenarios</b> (low / base / high) — forecasts are uncertain.</li>
</ul>
<div class="ex" data-t="Example">650,000 TEU today, base growth 5%/yr → in 10 years: 650,000 × 1.05¹⁰ = 1,058,800 TEU. High case 7% → 1,278,600 TEU. Low case 3% → 873,500 TEU.</div>
<h3>Phasing triggers</h3>
<p>Because a new berth takes 3–6 years (studies, permits, financing, construction), you start the next phase when the forecast shows utilisation will reach ~70–75% at the time of completion — not when the port is already congested.</p>
<h3>Hinterland</h3><p>A port is only as good as its road/rail access, dry ports and customs. Many expansions fail because trucks cannot reach the gate.</p>`,
`
<h3>ما الذي يجيب عنه المخطّط الرئيسي للميناء</h3>
<p>“ما الحركة القادمة خلال 20–30 سنة، وما المرافق اللازمة، وأين، ومتى، وبأي تكلفة؟” ويُحدَّث كل ~5 سنوات.</p>
<h3>عملية التخطيط الرئيسي</h3>
<ol>
<li><b>خط الأساس</b>: الحركة الحالية، الطاقة، الأداء، الأراضي، البيئة، أصحاب المصلحة.</li>
<li><b>دراسة السوق والتوقّعات</b>: حسب نوع البضاعة (حاويات، سائبة جافة، سائلة، رورو، سياحة بحرية).</li>
<li><b>تحليل الطاقة</b>: الأرصفة، الساحة، البوابة، الظهير (طرق/سكك).</li>
<li><b>تحليل الفجوة</b> ← <b>خيارات التطوير</b> (الإنتاجية، أرصفة جديدة، ردم، محطة جديدة).</li>
<li><b>التقييم</b>: فني، اقتصادي، بيئي، اجتماعي (متعدّد المعايير).</li>
<li><b>المراحل وخطة التنفيذ</b>، خطة استخدام الأراضي، برنامج الاستثمار.</li>
</ol>
<h3>التنبّؤ</h3>
<div class="formula">Future volume = Current × (1 + g)^n        (g = annual growth rate, n = years)
CAGR = (End ÷ Start)^(1/n) − 1</div>
<ul>
<li>المحرّكات: نمو الناتج المحلي، السكّان، مرونة التجارة (نمو الحاويات ≈ 1–1.5 × نمو الناتج)، المنافسة على المسافنة، خطوط ملاحية جديدة.</li>
<li>استخدم دائمًا <b>سيناريوهات</b> (منخفض / أساسي / مرتفع) — التوقّعات غير مؤكّدة.</li>
</ul>
<div class="ex" data-t="مثال">650,000 TEU اليوم، نمو أساسي 5%/سنة ← بعد 10 سنوات: 650,000 × 1.05¹⁰ = 1,058,800 TEU. السيناريو المرتفع 7% ← 1,278,600 TEU. المنخفض 3% ← 873,500 TEU.</div>
<h3>محفّزات المراحل</h3>
<p>لأن الرصيف الجديد يستغرق 3–6 سنوات (دراسات، تراخيص، تمويل، إنشاء)، تبدأ المرحلة التالية عندما تُظهر التوقّعات أن الاستخدام سيبلغ ~70–75% عند الإنجاز — لا عندما يكون الميناء مزدحمًا أصلًا.</p>
<h3>الظهير</h3><p>الميناء جيد بقدر جودة وصوله بالطرق/السكك والموانئ الجافة والجمارك. كثير من التوسعات تفشل لأن الشاحنات لا تستطيع الوصول إلى البوابة.</p>`),
    keys: [L('Forecast with scenarios: V = V0 × (1+g)^n.', 'تنبّأ بالسيناريوهات: V = V0 × (1+g)^n.'), L('Start the next phase before congestion — lead time is 3–6 years.', 'ابدأ المرحلة التالية قبل الازدحام — المهلة 3–6 سنوات.'), L('Hinterland access is part of port capacity.', 'الوصول للظهير جزء من طاقة الميناء.')],
    senior: L('Present forecasts as ranges and decisions as “no-regret” first steps (productivity, land reservation, permits) that keep big investments flexible.', 'قدّم التوقّعات كنطاقات والقرارات كخطوات أولى “بلا ندم” (الإنتاجية، حجز الأراضي، التراخيص) تُبقي الاستثمارات الكبيرة مرنة.'),
    quiz: [
      Q(L('500,000 TEU growing 6%/yr. After 5 years?', '500,000 TEU تنمو 6%/سنة. بعد 5 سنوات؟'), [L('650,000', '650,000'), L('669,113', '669,113'), L('530,000', '530,000'), L('800,000', '800,000')], 1, L('500,000 × 1.06⁵ = 669,113 TEU.', '500,000 × 1.06⁵ = 669,113 TEU.')),
      Q(L('From 400,000 to 800,000 TEU in 10 years. CAGR?', 'من 400,000 إلى 800,000 TEU في 10 سنوات. معدّل النمو المركّب؟'), [L('10%', '10%'), L('7.2%', '7.2%'), L('5%', '5%'), L('20%', '20%')], 1, L('2^(1/10) − 1 = 7.18%.', '2^(1/10) − 1 = 7.18%.')),
      Q(L('When should a new berth project start?', 'متى يجب أن يبدأ مشروع رصيف جديد؟'), [L('When ships already queue', 'عندما تصطفّ السفن أصلًا'), L('When utilisation is forecast to reach ~70–75% at completion date', 'عندما يُتوقّع بلوغ الاستخدام ~70–75% عند تاريخ الإنجاز'), L('Never', 'أبدًا'), L('When a line asks', 'عندما يطلب خط')], 1, L('Long lead times require early decisions.', 'المهل الطويلة تتطلّب قرارات مبكرة.')),
    ],
  });

  add({
    id: 'dev-capacity', lvl: 9, icon: '📐', min: 16,
    title: L('Capacity planning: berths, yard & gate', 'تخطيط الطاقة: الأرصفة والساحة والبوابة'),
    sub: L('Berth capacity formula, quay length, crane numbers, yard area, gate lanes — sizing a new terminal.', 'معادلة طاقة الرصيف، طول الرصيف، عدد الرافعات، مساحة الساحة، مسارات البوابة — تحديد حجم محطة جديدة.'),
    body: L(`
<h3>Berth (quay) capacity — containers</h3>
<div class="formula">Annual berth capacity (TEU) = Berths × Operating hours/yr × Target occupancy × Berth productivity (moves/h) × TEU factor
Operating hours/yr ≈ 8,760 × (1 − downtime share)</div>
<div class="ex" data-t="Example">3 berths × 8,500 h × 0.65 × 90 moves/h (≈ 3.2 cranes × 28) × 1.6 TEU/move = 2.39 M TEU/yr theoretical quay capacity. CBCT's real constraint (1.6 M) is therefore the yard, not the quay.</div>
<h3>Quay length</h3>
<div class="formula">Quay length ≈ Σ LOA of design vessels at berth simultaneously + gaps (~15–30 m between ships)
Rule of thumb for containers: ~ 1,000–1,500 TEU per metre of quay per year (well-equipped)</div>
<h3>Yard area</h3>
<div class="formula">TGS needed = Annual TEU × Dwell (days) ÷ (365 × Stacking height × Utilisation)
Gross yard area ≈ TGS × ~25–35 m² per TGS (incl. lanes, RTG layout)</div>
<div class="ex" data-t="Example">1,000,000 TEU, dwell 5 days, 4 high, 70% → TGS = 5,000,000 ÷ (365 × 4 × 0.7) = 4,892 TGS × 30 m² ≈ 14.7 ha.</div>
<h3>Gate lanes</h3>
<div class="formula">Lanes = Peak-hour truck transactions ÷ Transactions per lane per hour (manual ~15–20, OCR/auto ~30–60)</div>
<h3>Other terminal types</h3>
<ul><li>Dry bulk: unloader capacity × effective hours; storage = annual tonnes × dwell ÷ 365 ÷ utilisation.</li><li>Liquid: jetty occupancy + tank turns per year.</li><li>Ro-ro: parking slots × 365 ÷ dwell.</li></ul>`,
`
<h3>طاقة الرصيف — الحاويات</h3>
<div class="formula">Annual berth capacity (TEU) = Berths × Operating hours/yr × Target occupancy × Berth productivity (moves/h) × TEU factor
Operating hours/yr ≈ 8,760 × (1 − downtime share)</div>
<div class="ex" data-t="مثال">3 أرصفة × 8,500 ساعة × 0.65 × 90 حركة/ساعة (≈ 3.2 رافعة × 28) × 1.6 TEU/حركة = 2.39 مليون TEU/سنة طاقة رصيف نظرية. القيد الحقيقي لـ CBCT (1.6 مليون) هو إذًا الساحة لا الرصيف.</div>
<h3>طول الرصيف</h3>
<div class="formula">Quay length ≈ Σ LOA of design vessels at berth simultaneously + gaps (~15–30 m between ships)
Rule of thumb for containers: ~ 1,000–1,500 TEU per metre of quay per year (well-equipped)</div>
<h3>مساحة الساحة</h3>
<div class="formula">TGS needed = Annual TEU × Dwell (days) ÷ (365 × Stacking height × Utilisation)
Gross yard area ≈ TGS × ~25–35 m² per TGS (incl. lanes, RTG layout)</div>
<div class="ex" data-t="مثال">1,000,000 TEU، بقاء 5 أيام، 4 طبقات، 70% ← خانات الأرض = 5,000,000 ÷ (365 × 4 × 0.7) = 4,892 خانة × 30 م² ≈ 14.7 هكتار.</div>
<h3>مسارات البوابة</h3>
<div class="formula">Lanes = Peak-hour truck transactions ÷ Transactions per lane per hour (manual ~15–20, OCR/auto ~30–60)</div>
<h3>أنواع المحطات الأخرى</h3>
<ul><li>السائبة الجافة: طاقة المفرّغات × الساعات الفعلية؛ التخزين = الأطنان السنوية × البقاء ÷ 365 ÷ الاستخدام.</li><li>السائلة: إشغال الرصيف البحري + دورات الخزّانات سنويًا.</li><li>الرورو: الخانات × 365 ÷ البقاء.</li></ul>`),
    keys: [L('Capacity is the minimum of quay, yard, gate and hinterland.', 'الطاقة هي أدنى قيمة بين الرصيف والساحة والبوابة والظهير.'), L('Berth capacity = berths × hours × occupancy × productivity × TEU factor.', 'طاقة الرصيف = الأرصفة × الساعات × الإشغال × الإنتاجية × معامل TEU.'), L('Yard TGS = TEU × dwell ÷ (365 × height × utilisation).', 'خانات الساحة = TEU × البقاء ÷ (365 × الارتفاع × الاستخدام).')],
    senior: L('Find the bottleneck before spending: often a productivity programme or a dwell-time policy gives the capacity of a new berth for 5% of the cost.', 'جد عنق الزجاجة قبل الإنفاق: غالبًا برنامج إنتاجية أو سياسة مدة بقاء تعطي طاقة رصيف جديد بـ 5% من التكلفة.'),
    quiz: [
      Q(L('2 berths × 8,000 h × 0.6 × 60 moves/h × 1.5 TEU. Capacity?', '2 رصيفان × 8,000 ساعة × 0.6 × 60 حركة/ساعة × 1.5 TEU. الطاقة؟'), [L('864,000 TEU', '864,000 TEU'), L('576,000 TEU', '576,000 TEU'), L('1,440,000 TEU', '1,440,000 TEU'), L('432,000 TEU', '432,000 TEU')], 0, L('2 × 8,000 × 0.6 × 60 × 1.5 = 864,000.', '2 × 8,000 × 0.6 × 60 × 1.5 = 864,000.')),
      Q(L('A terminal’s capacity is set by…', 'طاقة المحطة يحدّدها…'), [L('Its largest subsystem', 'أكبر نظام فرعي فيها'), L('Its weakest subsystem (bottleneck)', 'أضعف نظام فرعي (عنق الزجاجة)'), L('The quay only', 'الرصيف فقط'), L('The number of staff', 'عدد الموظّفين')], 1, L('Chain capacity = weakest link.', 'طاقة السلسلة = أضعف حلقة.')),
    ],
  });

  add({
    id: 'dev-finance', lvl: 9, icon: '💹', min: 20,
    title: L('Feasibility, financing & PPP concessions', 'الجدوى والتمويل وعقود الامتياز بالشراكة'),
    sub: L('CAPEX/OPEX, NPV, IRR, payback, PPP models (BOT, concession, landlord), risk allocation, tenders.', 'التكاليف الرأسمالية والتشغيلية، صافي القيمة الحالية، معدّل العائد الداخلي، فترة الاسترداد، نماذج الشراكة (BOT، الامتياز، المالك)، توزيع المخاطر، المناقصات.'),
    body: L(`
<h3>Typical CAPEX items (order of magnitude)</h3>
<ul>
<li>Quay wall: USD 50,000–150,000 per metre (depends on depth, soil, seismic).</li>
<li>Dredging: USD 5–15 per m³; reclamation: USD 10–30 per m³.</li>
<li>STS crane (super post-panamax): USD 10–14 M each; RTG ~USD 1.5–2 M; eRTG more.</li>
<li>Yard paving, utilities, buildings, IT/TOS, gate, reefer plugs.</li>
</ul>
<h3>Financial evaluation</h3>
<div class="formula">NPV = Σ (Net cash flow_t ÷ (1 + r)^t) − Initial investment
IRR = discount rate where NPV = 0
Simple payback = Investment ÷ Annual net cash flow</div>
<div class="ex" data-t="Example">Invest USD 120 M; net cash flow USD 18 M/yr for 20 years; r = 10%. Annuity factor (20 y, 10%) = 8.514 → PV = 153.3 M → NPV = +33.3 M ✓. Payback = 6.7 years.</div>
<p><b>Economic</b> analysis (for the country: jobs, trade cost savings, time savings) differs from <b>financial</b> analysis (for the investor's cash).</p>
<h3>PPP models</h3>
<div class="table-wrap"><table><thead><tr><th>Model</th><th>Who invests</th><th>Who operates</th></tr></thead><tbody>
<tr><td>Management contract</td><td>Public</td><td>Private (fee)</td></tr>
<tr><td>Lease / landlord concession</td><td>Public (infrastructure) + private (equipment)</td><td>Private</td></tr>
<tr><td>BOT / BOOT / DBFO</td><td>Private builds & finances</td><td>Private, transfers back at end</td></tr>
<tr><td>Full privatisation</td><td>Private</td><td>Private</td></tr>
</tbody></table></div>
<h3>Concession terms to know</h3>
<ul>
<li>Duration (25–35 years), <b>minimum guaranteed throughput</b> (MGT), investment obligations and phasing.</li>
<li>Fees to the authority: <b>fixed fee</b> (land rent per m²) + <b>variable royalty</b> (per TEU / tonne) + sometimes upfront payment.</li>
<li>Tariff regulation, performance KPIs, hand-back condition of assets, termination & compensation.</li>
<li><b>Risk allocation</b>: traffic risk, construction risk, FX risk, political risk, force majeure — give each risk to the party best able to manage it.</li>
</ul>
<h3>Tender process</h3><p>Expression of interest → pre-qualification → RFP with draft concession agreement → technical & financial bids → evaluation (pass/fail technical, then highest financial offer or best combined score) → negotiation → financial close.</p>`,
`
<h3>بنود التكاليف الرأسمالية النموذجية (ترتيب الحجم)</h3>
<ul>
<li>جدار الرصيف: 50,000–150,000 دولار للمتر (حسب العمق والتربة والزلازل).</li>
<li>التجريف: 5–15 دولارًا للمتر المكعّب؛ الردم: 10–30 دولارًا للمتر المكعّب.</li>
<li>رافعة STS (سوبر بوست باناماكس): 10–14 مليون دولار للواحدة؛ RTG ~1.5–2 مليون؛ والكهربائية أكثر.</li>
<li>رصف الساحة، المرافق، المباني، تقنية المعلومات/TOS، البوابة، مقابس المبرّدات.</li>
</ul>
<h3>التقييم المالي</h3>
<div class="formula">NPV = Σ (Net cash flow_t ÷ (1 + r)^t) − Initial investment
IRR = discount rate where NPV = 0
Simple payback = Investment ÷ Annual net cash flow</div>
<div class="ex" data-t="مثال">استثمار 120 مليون دولار؛ تدفّق نقدي صافٍ 18 مليون/سنة لـ 20 سنة؛ r = 10%. معامل الدفعات (20 سنة، 10%) = 8.514 ← القيمة الحالية = 153.3 مليون ← صافي القيمة الحالية = +33.3 مليون ✓. فترة الاسترداد = 6.7 سنوات.</div>
<p>التحليل <b>الاقتصادي</b> (للدولة: الوظائف، وفورات تكاليف التجارة، وفورات الوقت) يختلف عن التحليل <b>المالي</b> (لنقد المستثمر).</p>
<h3>نماذج الشراكة بين القطاعين العام والخاص</h3>
<div class="table-wrap"><table><thead><tr><th>النموذج</th><th>من يستثمر</th><th>من يشغّل</th></tr></thead><tbody>
<tr><td>عقد إدارة</td><td>العام</td><td>الخاص (بأتعاب)</td></tr>
<tr><td>تأجير / امتياز نموذج المالك</td><td>العام (البنية التحتية) + الخاص (المعدّات)</td><td>الخاص</td></tr>
<tr><td>BOT / BOOT / DBFO</td><td>الخاص يبني ويموّل</td><td>الخاص، ويُعيد الأصول في النهاية</td></tr>
<tr><td>خصخصة كاملة</td><td>الخاص</td><td>الخاص</td></tr>
</tbody></table></div>
<h3>شروط الامتياز التي يجب معرفتها</h3>
<ul>
<li>المدة (25–35 سنة)، <b>الحدّ الأدنى المضمون للحركة</b> (MGT)، التزامات الاستثمار ومراحلها.</li>
<li>الرسوم للسلطة: <b>رسم ثابت</b> (إيجار الأرض لكل م²) + <b>إتاوة متغيّرة</b> (لكل TEU / طن) + أحيانًا دفعة مقدّمة.</li>
<li>تنظيم التعرفات، مؤشرات الأداء، حالة الأصول عند التسليم، الإنهاء والتعويض.</li>
<li><b>توزيع المخاطر</b>: مخاطر الحركة، الإنشاء، العملة، السياسية، القوة القاهرة — أعطِ كل خطر للطرف الأقدر على إدارته.</li>
</ul>
<h3>عملية المناقصة</h3><p>إبداء الاهتمام ← التأهيل المسبق ← طلب العروض مع مسودة اتفاقية الامتياز ← العروض الفنية والمالية ← التقييم (نجاح/رسوب فني، ثم أعلى عرض مالي أو أفضل نتيجة مركّبة) ← التفاوض ← الإغلاق المالي.</p>`),
    keys: [L('NPV > 0 at the cost of capital → financially viable.', 'صافي القيمة الحالية > 0 عند تكلفة رأس المال ← مجدٍ ماليًا.'), L('Landlord concession: public infrastructure, private superstructure & operations.', 'امتياز نموذج المالك: بنية تحتية عامة، ومعدّات وتشغيل خاص.'), L('Allocate each risk to the party best able to manage it.', 'وزّع كل خطر على الطرف الأقدر على إدارته.')],
    senior: L('In a concession, the KPIs and the hand-back clauses matter as much as the royalty. A high royalty with weak performance obligations can leave the country with a congested, run-down port.', 'في الامتياز، مؤشرات الأداء وبنود التسليم مهمّة بقدر الإتاوة. إتاوة عالية مع التزامات أداء ضعيفة قد تترك البلد بميناء مزدحم ومتهالك.'),
    quiz: [
      Q(L('Investment USD 60 M, net cash flow USD 8 M/yr. Simple payback?', 'الاستثمار 60 مليون دولار، التدفّق الصافي 8 مليون/سنة. فترة الاسترداد البسيطة؟'), [L('5 years', '5 سنوات'), L('7.5 years', '7.5 سنوات'), L('8 years', '8 سنوات'), L('12 years', '12 سنة')], 1, L('60 ÷ 8 = 7.5 years.', '60 ÷ 8 = 7.5 سنوات.')),
      Q(L('In a BOT, the private partner…', 'في BOT، الشريك الخاص…'), [L('Only operates', 'يشغّل فقط'), L('Builds, finances, operates and transfers back at the end', 'يبني ويموّل ويشغّل ويعيد الأصول في النهاية'), L('Owns forever', 'يملك للأبد'), L('Only advises', 'يقدّم المشورة فقط')], 1, L('Build-Operate-Transfer.', 'البناء والتشغيل والنقل.')),
      Q(L('IRR is…', 'معدّل العائد الداخلي IRR هو…'), [L('The interest rate of the loan', 'سعر فائدة القرض'), L('The discount rate at which NPV = 0', 'معدّل الخصم الذي يجعل صافي القيمة الحالية = 0'), L('Revenue ÷ cost', 'الإيراد ÷ التكلفة'), L('Payback in years', 'الاسترداد بالسنوات')], 1, L('Compare IRR with the cost of capital.', 'قارن IRR بتكلفة رأس المال.')),
    ],
  });

  add({
    id: 'dev-project', lvl: 9, icon: '🚧', min: 16,
    title: L('Delivering a port project', 'تنفيذ مشروع ميناء'),
    sub: L('Studies, EIA, permits, design, procurement (EPC/FIDIC), dredging & reclamation, construction while operating, commissioning, ramp-up.', 'الدراسات، تقييم الأثر البيئي، التراخيص، التصميم، المشتريات (EPC/FIDIC)، التجريف والردم، الإنشاء أثناء التشغيل، التشغيل التجريبي، رفع الأداء.'),
    body: L(`
<h3>Project lifecycle</h3>
<ol>
<li><b>Pre-feasibility & feasibility</b>: demand, options, cost, finance, environment.</li>
<li><b>Environmental & Social Impact Assessment (ESIA)</b>: marine ecology, dredged material disposal, noise, traffic, fishermen, resettlement; public consultation.</li>
<li><b>Site investigations</b>: bathymetry, geotechnical boreholes, metocean (waves, currents), physical/numerical modelling of breakwaters and ship manoeuvring.</li>
<li><b>Design</b>: concept → basic → detailed; design vessel (LOA, draft, beam) defines channel, turning circle, quay depth, crane outreach.</li>
<li><b>Procurement</b>: EPC/design-build (FIDIC Yellow/Silver), design-bid-build (FIDIC Red), equipment tenders (cranes 18–24 months lead time).</li>
<li><b>Construction</b>: dredging, reclamation, ground improvement, quay wall, paving, utilities, buildings, IT.</li>
<li><b>Commissioning & ramp-up</b>: crane testing, TOS go-live, staff training, trial vessels; productivity ramps over 6–18 months.</li>
</ol>
<h3>Navigation design basics</h3>
<div class="formula">Channel depth ≈ design draft + squat + wave allowance + UKC margin (≈ 1.10–1.15 × draft)
Turning circle diameter ≈ 1.5–2 × LOA (with tugs)
Channel width (one-way) ≈ 4–6 × beam</div>
<h3>Building while operating</h3>
<p>Most expansions happen next to a working terminal: phase the works, keep safe separation, maintain berth windows, plan crane moves and IT migration carefully, communicate weekly with lines.</p>
<h3>Project controls</h3>
<ul><li>Schedule (critical path), budget & contingency (10–20%), change orders, risk register, quality (ITPs), HSE on site.</li><li>Stakeholder management: authority, lines, unions, community, lenders, regulators.</li></ul>`,
`
<h3>دورة حياة المشروع</h3>
<ol>
<li><b>ما قبل الجدوى والجدوى</b>: الطلب، الخيارات، التكلفة، التمويل، البيئة.</li>
<li><b>تقييم الأثر البيئي والاجتماعي (ESIA)</b>: البيئة البحرية، التخلّص من مواد التجريف، الضجيج، المرور، الصيّادون، إعادة التوطين؛ الاستشارة العامة.</li>
<li><b>تحرّيات الموقع</b>: قياس الأعماق، حفر الجسّات الجيوتقنية، البيانات البحرية والجوية (الأمواج، التيارات)، النمذجة الفيزيائية/الرقمية لكاسرات الأمواج ومناورة السفن.</li>
<li><b>التصميم</b>: مفاهيمي ← أساسي ← تفصيلي؛ السفينة التصميمية (الطول، الغاطس، العرض) تحدّد القناة ودائرة الدوران وعمق الرصيف ومدى الرافعة.</li>
<li><b>المشتريات</b>: EPC/تصميم وبناء (FIDIC الأصفر/الفضي)، تصميم-عطاء-بناء (FIDIC الأحمر)، مناقصات المعدّات (الرافعات 18–24 شهرًا للتوريد).</li>
<li><b>الإنشاء</b>: التجريف، الردم، تحسين التربة، جدار الرصيف، الرصف، المرافق، المباني، تقنية المعلومات.</li>
<li><b>التشغيل التجريبي ورفع الأداء</b>: اختبار الرافعات، تشغيل TOS، تدريب الموظّفين، سفن تجريبية؛ ترتفع الإنتاجية خلال 6–18 شهرًا.</li>
</ol>
<h3>أساسيات تصميم الملاحة</h3>
<div class="formula">Channel depth ≈ design draft + squat + wave allowance + UKC margin (≈ 1.10–1.15 × draft)
Turning circle diameter ≈ 1.5–2 × LOA (with tugs)
Channel width (one-way) ≈ 4–6 × beam</div>
<h3>البناء أثناء التشغيل</h3>
<p>معظم التوسعات تتمّ بجانب محطة عاملة: قسّم الأعمال لمراحل، حافظ على فصل آمن، احترم نوافذ الرسو، خطّط نقل الرافعات وترحيل الأنظمة بعناية، وتواصل أسبوعيًا مع الخطوط.</p>
<h3>ضوابط المشروع</h3>
<ul><li>الجدول (المسار الحرج)، الميزانية والاحتياطي (10–20%)، أوامر التغيير، سجلّ المخاطر، الجودة (خطط الفحص والاختبار)، السلامة في الموقع.</li><li>إدارة أصحاب المصلحة: السلطة، الخطوط، النقابات، المجتمع، المُقرضون، الجهات الرقابية.</li></ul>`),
    keys: [L('ESIA and site investigations come before design.', 'تقييم الأثر البيئي وتحرّيات الموقع تأتي قبل التصميم.'), L('The design vessel drives channel, basin, quay and cranes.', 'السفينة التصميمية تحدّد القناة والحوض والرصيف والرافعات.'), L('Ramp-up takes 6–18 months — plan it.', 'رفع الأداء يستغرق 6–18 شهرًا — خطّط له.')],
    senior: L('Operations people must sit in the design team from day one. Many new terminals have beautiful quays and impossible gate layouts because nobody who runs a shift was asked.', 'يجب أن يجلس أهل العمليات في فريق التصميم من اليوم الأول. كثير من المحطات الجديدة لها أرصفة جميلة وتخطيط بوابات مستحيل لأن أحدًا لم يسأل من يدير الوردية.'),
    quiz: [
      Q(L('Design draft 15 m. Approx. channel depth (1.12 × draft)?', 'الغاطس التصميمي 15 م. عمق القناة تقريبًا (1.12 × الغاطس)؟'), [L('15.0 m', '15.0 م'), L('16.8 m', '16.8 م'), L('18.0 m', '18.0 م'), L('22.5 m', '22.5 م')], 1, L('15 × 1.12 = 16.8 m.', '15 × 1.12 = 16.8 م.')),
      Q(L('Turning circle for a 300 m ship (1.5–2 × LOA)?', 'دائرة الدوران لسفينة 300 م (1.5–2 × الطول)؟'), [L('150–200 m', '150–200 م'), L('450–600 m', '450–600 م'), L('900–1,200 m', '900–1,200 م'), L('300 m', '300 م')], 1, L('1.5–2 × 300 = 450–600 m.', '1.5–2 × 300 = 450–600 م.')),
      Q(L('Which comes first?', 'أيّ مما يلي يأتي أولًا؟'), [L('Detailed design', 'التصميم التفصيلي'), L('ESIA & site investigations', 'تقييم الأثر البيئي وتحرّيات الموقع'), L('Crane order', 'طلب الرافعات'), L('Commissioning', 'التشغيل التجريبي')], 1, L('You cannot design without site data and permits.', 'لا يمكنك التصميم دون بيانات الموقع والتراخيص.')),
    ],
  });

  add({
    id: 'dev-green', lvl: 9, icon: '🌱', min: 14,
    title: L('Green, smart & competitive ports', 'الموانئ الخضراء والذكية والتنافسية'),
    sub: L('Decarbonisation, shore power, electrification, port competitiveness, benchmarking (CPPI), port community.', 'إزالة الكربون، طاقة الشاطئ، الكهربة، تنافسية الموانئ، المقارنة المعيارية (CPPI)، مجتمع الميناء.'),
    body: L(`
<h3>Why ports compete</h3>
<p>Lines and cargo owners choose ports by total cost and reliability: port charges, productivity, waiting time, hinterland cost, connectivity (number of services), customs speed, and digital ease. The <b>World Bank / S&P Container Port Performance Index (CPPI)</b> ranks ports by vessel time in port.</p>
<h3>Green port measures</h3>
<ul>
<li><b>Onshore power supply (OPS / shore power)</b> for ships at berth — required for many ship types in EU ports from 2030.</li>
<li>Electrified equipment (eRTG, electric tractors), LED lighting, solar on roofs.</li>
<li>JIT arrival to cut anchorage emissions; green tariffs (e.g. discounts for ESI-scored ships).</li>
<li>Alternative fuel bunkering (LNG, methanol, ammonia) — new safety zones and skills.</li>
<li>Environmental management: ISO 14001, air & water monitoring, waste reception (MARPOL), dredging management.</li>
</ul>
<h3>Smart port</h3>
<p>Port Community System + single window, truck appointment, digital twin, AI ETA prediction, IoT sensors, automation — all built on shared, trusted data.</p>
<h3>Port development KPIs</h3>
<ul><li>Market share & connectivity (UNCTAD liner shipping connectivity index).</li><li>Capacity utilisation by terminal, investment executed vs plan.</li><li>CO₂ per TEU/tonne, % electrified equipment, OPS connections.</li><li>Concession compliance (MGT, KPIs), revenue per hectare.</li></ul>`,
`
<h3>لماذا تتنافس الموانئ</h3>
<p>تختار الخطوط وأصحاب البضائع الموانئ حسب التكلفة الإجمالية والموثوقية: رسوم الميناء، الإنتاجية، وقت الانتظار، تكلفة الظهير، الترابط (عدد الخطوط)، سرعة الجمارك، والسهولة الرقمية. <b>مؤشر أداء موانئ الحاويات (CPPI)</b> للبنك الدولي وS&P يرتّب الموانئ حسب وقت السفينة في الميناء.</p>
<h3>إجراءات الميناء الأخضر</h3>
<ul>
<li><b>تزويد السفن بالطاقة من الشاطئ (OPS)</b> أثناء رسوها — مطلوب لعدّة أنواع سفن في موانئ الاتحاد الأوروبي اعتبارًا من 2030.</li>
<li>معدّات كهربائية (RTG كهربائية، جرّارات كهربائية)، إنارة LED، طاقة شمسية على الأسطح.</li>
<li>الوصول في الوقت المناسب لخفض انبعاثات المخطاف؛ تعرفات خضراء (مثل خصومات للسفن ذات نتيجة ESI جيدة).</li>
<li>التزويد بالوقود البديل (الغاز المسال، الميثانول، الأمونيا) — مناطق أمان ومهارات جديدة.</li>
<li>الإدارة البيئية: ISO 14001، مراقبة الهواء والماء، استقبال النفايات (MARPOL)، إدارة التجريف.</li>
</ul>
<h3>الميناء الذكي</h3>
<p>نظام مجتمع الميناء + النافذة الواحدة، مواعيد الشاحنات، التوأم الرقمي، التنبّؤ بالوصول بالذكاء الاصطناعي، حسّاسات إنترنت الأشياء، الأتمتة — كلها مبنية على بيانات مشتركة وموثوقة.</p>
<h3>مؤشرات تطوير الميناء</h3>
<ul><li>الحصة السوقية والترابط (مؤشر الأونكتاد للترابط بالخطوط المنتظمة).</li><li>استخدام الطاقة حسب المحطة، الاستثمار المنفّذ مقابل الخطة.</li><li>ثاني أكسيد الكربون لكل TEU/طن، نسبة المعدّات الكهربائية، توصيلات OPS.</li><li>الالتزام بالامتياز (الحدّ الأدنى للحركة، المؤشرات)، الإيراد لكل هكتار.</li></ul>`),
    keys: [L('Ports compete on total cost, reliability and connectivity.', 'الموانئ تتنافس على التكلفة الإجمالية والموثوقية والترابط.'), L('Shore power, electrification and JIT cut emissions.', 'طاقة الشاطئ والكهربة والوصول في الوقت المناسب تخفض الانبعاثات.'), L('CPPI benchmarks vessel time in port.', 'مؤشر CPPI يقارن وقت السفينة في الميناء.')],
    senior: L('Green investments win when they also cut cost or risk: eRTGs save fuel and maintenance; OPS keeps lines that face EU rules. Build the business case, not just the slogan.', 'الاستثمارات الخضراء تنجح عندما تخفض أيضًا التكلفة أو المخاطر: RTG الكهربائية توفّر الوقود والصيانة؛ وطاقة الشاطئ تحافظ على الخطوط الخاضعة لقواعد الاتحاد الأوروبي. ابنِ الجدوى التجارية لا مجرّد الشعار.'),
    quiz: [
      Q(L('OPS means…', 'OPS يعني…'), [L('Operations planning system', 'نظام تخطيط العمليات'), L('Onshore power supply to ships at berth', 'تزويد السفن بالطاقة من الشاطئ أثناء الرسو'), L('Overtime payment scheme', 'نظام دفع العمل الإضافي'), L('Open port services', 'خدمات الميناء المفتوحة')], 1, L('Ships switch off auxiliary engines at berth.', 'تطفئ السفن محرّكاتها المساعدة على الرصيف.')),
      Q(L('CPPI ranks ports mainly by…', 'يرتّب CPPI الموانئ أساسًا حسب…'), [L('Port size', 'حجم الميناء'), L('Vessel time in port', 'وقت السفينة في الميناء'), L('Tariffs', 'التعرفات'), L('Number of employees', 'عدد الموظّفين')], 1, L('Efficiency of vessel calls.', 'كفاءة زيارات السفن.')),
    ],
  });
})();
