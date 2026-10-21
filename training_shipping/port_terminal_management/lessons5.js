/* Port Master Academy — Level 10: port services, intermodal & maritime law */
(function () {
  const L = TS.L;
  const Q = (q, o, a, e) => ({ q, o, a, e });
  const add = (x) => PT.lessons.push(x);

  add({
    id: 'svc-bunker', lvl: 10, icon: '⛽', min: 16,
    title: L('Bunkering & ship supply services', 'تزويد الوقود وخدمات إمداد السفن'),
    sub: L('Fuel grades, ISO 8217, ordering, delivery methods, quantity measurement, BDN, samples, disputes, fresh water & stores.', 'أنواع الوقود، ISO 8217، الطلب، طرق التسليم، قياس الكمية، مذكّرة التسليم، العيّنات، النزاعات، المياه العذبة والمؤن.'),
    body: L(`
<h3>Marine fuels</h3>
<ul>
<li><b>VLSFO</b> (very low sulphur fuel oil, ≤ 0.50% S) — the standard since IMO 2020.</li>
<li><b>HSFO</b> (high sulphur, up to 3.5%) — only for ships with scrubbers.</li>
<li><b>MGO / ULSFO</b> (≤ 0.10% S) — for Emission Control Areas and in port.</li>
<li>New fuels: LNG, bio-blends (B24/B30), methanol, ammonia — special safety zones and procedures.</li>
<li>Quality standard: <b>ISO 8217</b> (viscosity, density, sulphur, water, sediment, flash point ≥ 60 °C).</li>
</ul>
<h3>How fuel is delivered</h3>
<ul><li><b>Barge</b> alongside (most common in ports), <b>truck</b> (small quantities), <b>pipeline</b> from shore tanks.</li><li>Simultaneous operations (bunkering during cargo ops) need port approval and a risk assessment.</li></ul>
<h3>Ordering</h3>
<div class="formula">Order = (sea days × daily consumption) × (1 + reserve) − ROB
Sea days = distance ÷ (speed × 24)</div>
<h3>Measuring the quantity</h3>
<div class="formula">Mass (t) = Volume at observed temperature (m³) × VCF × Density at 15 °C</div>
<p>Opening and closing soundings on barge and ship, temperatures, density from the BDN/lab. Differences over ~0.5% → letter of protest.</p>
<h3>Documents</h3>
<ul>
<li><b>Bunker Delivery Note (BDN)</b> — kept on board 3 years (MARPOL Annex VI).</li>
<li><b>MARPOL sample</b> — sealed, kept on board at least 12 months; plus commercial samples for testing.</li>
<li>Oil Record Book entries; supplier invoice; letter of protest if needed.</li>
</ul>
<h3>Other ship supplies</h3>
<p>Fresh water (by hose or barge, quantity per crew & technical use), provisions and technical stores (under customs control as ship's stores), lubricants, spare parts delivery, chemicals, cash to master.</p>`,
`
<h3>أنواع وقود السفن</h3>
<ul>
<li><b>VLSFO</b> (زيت وقود منخفض الكبريت جدًا، ≤ 0.50%) — المعيار منذ IMO 2020.</li>
<li><b>HSFO</b> (عالي الكبريت حتى 3.5%) — فقط للسفن المزوّدة بأجهزة غسل العادم.</li>
<li><b>MGO / ULSFO</b> (≤ 0.10%) — لمناطق التحكّم بالانبعاثات وداخل الموانئ.</li>
<li>الأنواع الجديدة: الغاز الطبيعي المسال، الخلطات الحيوية، الميثانول، الأمونيا — مناطق أمان وإجراءات خاصة.</li>
<li>معيار الجودة: <b>ISO 8217</b> (اللزوجة، الكثافة، الكبريت، الماء، الرواسب، نقطة الوميض ≥ 60 °م).</li>
</ul>
<h3>كيف يُسلَّم الوقود</h3>
<ul><li><b>بارجة</b> بجانب السفينة (الأكثر شيوعًا في الموانئ)، <b>شاحنة</b> (كميات صغيرة)، <b>أنبوب</b> من خزّانات البر.</li><li>العمليات المتزامنة (التزويد أثناء عمليات البضاعة) تحتاج موافقة الميناء وتقييم مخاطر.</li></ul>
<h3>الطلب</h3>
<div class="formula">Order = (sea days × daily consumption) × (1 + reserve) − ROB
Sea days = distance ÷ (speed × 24)</div>
<h3>قياس الكمية</h3>
<div class="formula">Mass (t) = Volume at observed temperature (m³) × VCF × Density at 15 °C</div>
<p>قياسات افتتاحية وختامية على البارجة والسفينة، درجات الحرارة، الكثافة من مذكّرة التسليم/المختبر. الفروق فوق ~0.5% ← خطاب احتجاج.</p>
<h3>المستندات</h3>
<ul>
<li><b>مذكّرة تسليم الوقود (BDN)</b> — تُحفظ على السفينة 3 سنوات (الملحق السادس من MARPOL).</li>
<li><b>عيّنة MARPOL</b> — مختومة، تُحفظ على السفينة 12 شهرًا على الأقل؛ بالإضافة لعيّنات تجارية للفحص.</li>
<li>قيود سجلّ الزيت؛ فاتورة المورّد؛ خطاب احتجاج عند الحاجة.</li>
</ul>
<h3>إمدادات السفن الأخرى</h3>
<p>المياه العذبة (بالخرطوم أو البارجة، الكمية حسب الطاقم والاستخدام الفني)، المؤن والمخازن الفنية (تحت الرقابة الجمركية كمؤن سفن)، الزيوت، تسليم قطع الغيار، الكيماويات، النقد للربّان.</p>`),
    keys: [L('Order = need × (1+reserve) − ROB.', 'الطلب = الحاجة × (1+الاحتياطي) − المتبقّي.'), L('Mass = volume × VCF × density@15.', 'الكتلة = الحجم × VCF × الكثافة عند 15.'), L('BDN 3 years, MARPOL sample 12 months.', 'مذكّرة التسليم 3 سنوات، عيّنة MARPOL 12 شهرًا.')],
    senior: L('Never let bunkering surprise the terminal: the agent must request it 24 h ahead so the berth plan, fire safety and SIMOPS are agreed.', 'لا تدع التزويد بالوقود يفاجئ المحطة: يجب أن يطلبه الوكيل قبل 24 ساعة ليتمّ الاتفاق على خطة الرصيف والسلامة من الحريق والعمليات المتزامنة.'),
    quiz: [
      Q(L('Maximum sulphur in VLSFO outside ECAs?', 'الحدّ الأقصى للكبريت في VLSFO خارج مناطق ECA؟'), [L('3.5%', '3.5%'), L('0.50%', '0.50%'), L('0.10%', '0.10%'), L('1.0%', '1.0%')], 1, L('IMO 2020 global cap.', 'السقف العالمي لـ IMO 2020.')),
      Q(L('How long is the BDN kept on board?', 'كم تُحفظ مذكّرة تسليم الوقود على السفينة؟'), [L('1 month', 'شهر'), L('12 months', '12 شهرًا'), L('3 years', '3 سنوات'), L('Forever', 'للأبد')], 2, L('MARPOL Annex VI.', 'الملحق السادس من MARPOL.')),
      Q(L('200 m³ at 40 °C, VCF 0.98, density 0.94. Mass?', '200 م³ عند 40 °م، VCF = 0.98، الكثافة 0.94. الكتلة؟'), [L('184.2 t', '184.2 طن'), L('188.0 t', '188.0 طن'), L('196.0 t', '196.0 طن'), L('200 t', '200 طن')], 0, L('200 × 0.98 × 0.94 = 184.24 t.', '200 × 0.98 × 0.94 = 184.24 طن.')),
    ],
  });

  add({
    id: 'svc-marine', lvl: 10, icon: '⚓', min: 14,
    title: L('Marine services: pilotage, towage, mooring & VTS', 'الخدمات البحرية: الإرشاد والقطر والربط وخدمة حركة السفن'),
    sub: L('Who provides them, how they are ordered and charged, bollard pull, weather limits, exemptions.', 'من يقدّمها، كيف تُطلب وتُحتسب، قوة الشدّ، حدود الطقس، الإعفاءات.'),
    body: L(`
<h3>Pilotage</h3>
<ul><li>Compulsory above a size (e.g. GT &gt; 500) — some masters get a <b>pilotage exemption certificate</b> for frequent calls.</li><li>Ordered via the agent/VTS, usually with 2–4 h notice; pilot boarding point and ladder arrangements (SOLAS).</li><li>Charged per GT/LOA per movement (arrival, departure, shifting).</li></ul>
<h3>Towage</h3>
<ul><li>Tugs assist with berthing in wind/current; number by port rules (LOA, wind, bow thruster).</li><li>Power expressed as <b>bollard pull</b> (tonnes). Modern harbour tugs: 50–80 t BP, ASD or tractor type.</li><li>Contracts: UK Standard Conditions for Towage, BIMCO TOWHIRE/TOWCON.</li></ul>
<h3>Mooring</h3>
<p>Line handlers ashore, mooring plan (head, breast, spring, stern lines), mooring watch for tide/passing ships; automated mooring systems in some terminals.</p>
<h3>VTS (Vessel Traffic Service)</h3>
<p>Monitors and organises traffic in port approaches (radar, AIS, VHF), gives information, navigational assistance or traffic organisation. Closes the port in bad weather.</p>
<div class="formula">Typical berthing wind limits: ~25–30 kn (large ships) · Crane operations stop: ~20 m/s (≈ 39 kn)</div>`,
`
<h3>الإرشاد</h3>
<ul><li>إلزامي فوق حجم معيّن (مثلًا GT &gt; 500) — بعض الربابنة يحصلون على <b>شهادة إعفاء من الإرشاد</b> للزيارات المتكرّرة.</li><li>يُطلب عبر الوكيل/VTS عادةً قبل 2–4 ساعات؛ نقطة صعود المرشد وترتيبات السلّم (SOLAS).</li><li>يُحتسب حسب GT/الطول لكل حركة (وصول، مغادرة، نقل).</li></ul>
<h3>القطر</h3>
<ul><li>تساعد القاطرات في الرسو مع الرياح/التيارات؛ العدد حسب قواعد الميناء (الطول، الرياح، دافع المقدّمة).</li><li>تُقاس القدرة بـ <b>قوة الشدّ</b> (أطنان). القاطرات الحديثة: 50–80 طن شدّ، من نوع ASD أو الجرّار.</li><li>العقود: الشروط القياسية البريطانية للقطر، BIMCO TOWHIRE/TOWCON.</li></ul>
<h3>الربط</h3>
<p>عمّال الحبال على البر، خطة الربط (حبال المقدّمة، العرضية، الزنبركية، المؤخّرة)، مراقبة الربط بسبب المد/السفن المارّة؛ أنظمة ربط آلية في بعض المحطات.</p>
<h3>خدمة حركة السفن (VTS)</h3>
<p>تراقب وتنظّم الحركة في مداخل الميناء (رادار، AIS، VHF)، تقدّم المعلومات والمساعدة الملاحية أو تنظيم الحركة. تغلق الميناء في الطقس السيئ.</p>
<div class="formula">Typical berthing wind limits: ~25–30 kn (large ships) · Crane operations stop: ~20 m/s (≈ 39 kn)</div>`),
    keys: [L('Pilotage compulsory above a size; charged per movement.', 'الإرشاد إلزامي فوق حجم معيّن؛ يُحتسب لكل حركة.'), L('Tug power = bollard pull.', 'قدرة القاطرة = قوة الشدّ.'), L('VTS organises traffic and can close the port.', 'VTS تنظّم الحركة ويمكنها إغلاق الميناء.')],
    senior: L('Marine services are the first link of berth productivity: a late pilot or missing tug costs the same hours as a broken crane. Track their punctuality like any KPI.', 'الخدمات البحرية أول حلقة في إنتاجية الرصيف: مرشد متأخّر أو قاطرة ناقصة يكلّفان نفس ساعات رافعة معطّلة. تابع التزامهم بالمواعيد كأي مؤشر أداء.'),
    quiz: [
      Q(L('Tug power is expressed in…', 'تُقاس قدرة القاطرة بـ…'), [L('TEU', 'TEU'), L('Bollard pull (t)', 'قوة الشدّ (طن)'), L('GT', 'GT'), L('Knots', 'العقد')], 1, L('Static pulling force.', 'قوة السحب الساكنة.')),
      Q(L('A shifting from B1 to B2 is…', 'نقل السفينة من B1 إلى B2 هو…'), [L('Free', 'مجاني'), L('A separate pilotage/towage movement', 'حركة إرشاد/قطر منفصلة'), L('Customs procedure', 'إجراء جمركي'), L('Not allowed', 'غير مسموح')], 1, L('Each movement is charged.', 'كل حركة تُحتسب.')),
    ],
  });

  add({
    id: 'svc-cruise', lvl: 10, icon: '🛳', min: 12,
    title: L('Cruise & passenger terminals', 'محطات السفن السياحية والركّاب'),
    sub: L('Turnaround vs transit calls, passenger flows, security, baggage, provisioning, city impact.', 'زيارات التبديل مقابل العبور، تدفّق الركّاب، الأمن، الأمتعة، التموين، الأثر على المدينة.'),
    body: L(`
<h3>Types of cruise calls</h3>
<ul><li><b>Transit (port of call)</b>: passengers go ashore for excursions and return the same day.</li><li><b>Turnaround (homeport)</b>: thousands disembark and embark — baggage, check-in, provisioning, waste, fuel: much more complex and more revenue.</li></ul>
<h3>Terminal processes (turnaround)</h3>
<div class="formula">Disembark (07:00–10:00) → clean & provision ship → embark check-in (11:00–16:00) → all aboard → sail (~17:00–18:00)</div>
<ul><li>Security screening (ISPS) for passengers and baggage; immigration and customs.</li><li>Coaches, taxis, traffic plans; accessibility for reduced-mobility passengers.</li><li>Provisioning: tens of trucks with food & stores in a few hours.</li></ul>
<h3>Capacity & planning</h3>
<p>Berth length and depth for 300–360 m ships, terminal building size (peak passengers/hour), number of security lanes, baggage hall, parking. Ferries/ro-pax: ticketing, car lanes, check-in times.</p>
<h3>City impact</h3><p>Economic benefits (spending, jobs) vs congestion, emissions (shore power!), overtourism — modern ports manage cruise with city authorities.</p>`,
`
<h3>أنواع زيارات السفن السياحية</h3>
<ul><li><b>العبور (ميناء توقف)</b>: ينزل الركّاب للرحلات ويعودون في اليوم نفسه.</li><li><b>التبديل (ميناء أساسي)</b>: آلاف ينزلون ويصعدون — الأمتعة، تسجيل الوصول، التموين، النفايات، الوقود: أكثر تعقيدًا وأكثر إيرادًا.</li></ul>
<h3>عمليات المحطة (التبديل)</h3>
<div class="formula">Disembark (07:00–10:00) → clean & provision ship → embark check-in (11:00–16:00) → all aboard → sail (~17:00–18:00)</div>
<ul><li>الفحص الأمني (ISPS) للركّاب والأمتعة؛ الهجرة والجمارك.</li><li>الحافلات وسيارات الأجرة وخطط المرور؛ إمكانية الوصول لذوي الحركة المحدودة.</li><li>التموين: عشرات الشاحنات بالطعام والمؤن خلال ساعات قليلة.</li></ul>
<h3>الطاقة والتخطيط</h3>
<p>طول الرصيف وعمقه لسفن 300–360 م، حجم مبنى المحطة (ذروة الركّاب/ساعة)، عدد مسارات الفحص الأمني، صالة الأمتعة، المواقف. العبّارات/الرو-باكس: التذاكر، مسارات السيارات، أوقات تسجيل الوصول.</p>
<h3>الأثر على المدينة</h3><p>فوائد اقتصادية (الإنفاق، الوظائف) مقابل الازدحام والانبعاثات (طاقة الشاطئ!) والسياحة المفرطة — الموانئ الحديثة تدير السياحة البحرية مع سلطات المدينة.</p>`),
    keys: [L('Turnaround calls are far more complex than transit calls.', 'زيارات التبديل أعقد بكثير من زيارات العبور.'), L('Plan peak passengers/hour, security lanes, baggage and traffic.', 'خطّط لذروة الركّاب/ساعة ومسارات الأمن والأمتعة والمرور.')],
    senior: L('In cruise, the critical KPI is “all aboard on time”. A missed sailing costs the line its itinerary — plan buffers on security and immigration.', 'في السياحة البحرية المؤشر الحرج هو “صعود الجميع في الموعد”. تفويت الإبحار يكلّف الخط برنامج رحلته — خطّط هوامش للأمن والهجرة.'),
    quiz: [
      Q(L('Which call needs baggage handling and check-in?', 'أي زيارة تحتاج مناولة الأمتعة وتسجيل الوصول؟'), [L('Transit', 'العبور'), L('Turnaround / homeport', 'التبديل / الميناء الأساسي'), L('Bunker call', 'زيارة وقود'), L('Lay-up', 'الإيقاف')], 1, L('Passengers start/end their cruise there.', 'يبدأ الركّاب/ينهون رحلتهم هناك.')),
    ],
  });

  add({
    id: 'svc-intermodal', lvl: 10, icon: '🚆', min: 14,
    title: L('Intermodal: rail, barges, dry ports, CFS & free zones', 'النقل المتعدّد: السكك، البوارج، الموانئ الجافة، محطات التجميع والمناطق الحرّة'),
    sub: L('Modal split, rail terminals, dry ports, bonded warehouses, CFS/LCL, free zones and logistics parks.', 'توزيع وسائط النقل، محطات السكك، الموانئ الجافة، المستودعات الجمركية، تجميع الشحنات الجزئية، المناطق الحرّة والمجمّعات اللوجستية.'),
    body: L(`
<h3>Modal split</h3>
<p>Share of hinterland traffic by truck, rail and inland waterway. Rail is cheaper and greener over long distances (&gt; 300–500 km) and reduces truck congestion at the gate.</p>
<h3>Rail terminal in the port</h3>
<div class="formula">Train capacity ≈ wagons × TEU per wagon (e.g. 30 wagons × 3 TEU = 90 TEU per train)
Daily rail capacity = trains/day × TEU/train</div>
<ul><li>Loading tracks under RMGs or reach stackers, rail planning (wagon lists), customs transit documents.</li></ul>
<h3>Dry ports (inland container depots)</h3>
<p>Inland terminals connected by rail/road where customs clearance, storage and empty depots take place — moving dwell time and inspections out of the seaport.</p>
<h3>CFS, bonded & free zones</h3>
<ul>
<li><b>CFS</b>: consolidation/deconsolidation of LCL cargo; tally, marking, damage reports.</li>
<li><b>Bonded warehouse</b>: goods stored without paying duties until released.</li>
<li><b>Free zone</b>: area treated as outside customs territory — storage, processing, re-export without duties.</li>
<li>Logistics parks attract value-added activities (labelling, kitting, packaging) and cargo volume.</li>
</ul>`,
`
<h3>توزيع وسائط النقل</h3>
<p>حصة حركة الظهير بالشاحنات والسكك والممرّات المائية الداخلية. السكك أرخص وأنظف للمسافات الطويلة (&gt; 300–500 كم) وتخفّف ازدحام الشاحنات على البوابة.</p>
<h3>محطة السكك في الميناء</h3>
<div class="formula">Train capacity ≈ wagons × TEU per wagon (e.g. 30 wagons × 3 TEU = 90 TEU per train)
Daily rail capacity = trains/day × TEU/train</div>
<ul><li>خطوط تحميل تحت رافعات RMG أو ريتش ستاكر، تخطيط القطارات (قوائم العربات)، مستندات العبور الجمركي.</li></ul>
<h3>الموانئ الجافة (مستودعات الحاويات الداخلية)</h3>
<p>محطات داخلية متّصلة بالسكك/الطرق يتمّ فيها التخليص الجمركي والتخزين ومستودعات الفارغ — تنقل مدة البقاء والمعاينات خارج الميناء البحري.</p>
<h3>محطات التجميع، المستودعات الجمركية والمناطق الحرّة</h3>
<ul>
<li><b>CFS</b>: تجميع/تفكيك الشحنات الجزئية LCL؛ العدّ، الوسم، تقارير الأضرار.</li>
<li><b>المستودع الجمركي</b>: تخزين البضائع دون دفع الرسوم حتى الإفراج.</li>
<li><b>المنطقة الحرّة</b>: منطقة تُعامل كأنها خارج الإقليم الجمركي — تخزين ومعالجة وإعادة تصدير دون رسوم.</li>
<li>المجمّعات اللوجستية تجذب أنشطة القيمة المضافة (الوسم، التجميع، التغليف) وحجم البضائع.</li>
</ul>`),
    keys: [L('Rail wins on long distances and relieves the gate.', 'السكك تتفوّق في المسافات الطويلة وتخفّف ضغط البوابة.'), L('Dry ports move clearance and dwell inland.', 'الموانئ الجافة تنقل التخليص ومدة البقاء إلى الداخل.'), L('Bonded = duty suspended; free zone = outside customs territory.', 'الجمركي = الرسوم معلّقة؛ المنطقة الحرّة = خارج الإقليم الجمركي.')],
    senior: L('When the yard is full, ask: “Can this box clear inland?” A dry port with a daily shuttle train can be cheaper than a new yard block.', 'عندما تمتلئ الساحة اسأل: “هل يمكن تخليص هذه الحاوية في الداخل؟” ميناء جاف مع قطار مكوكي يومي قد يكون أرخص من كتلة ساحة جديدة.'),
    quiz: [
      Q(L('3 trains/day × 84 TEU. Daily rail capacity?', '3 قطارات/يوم × 84 TEU. الطاقة اليومية للسكك؟'), [L('252 TEU', '252 TEU'), L('87 TEU', '87 TEU'), L('168 TEU', '168 TEU'), L('840 TEU', '840 TEU')], 0, L('3 × 84 = 252.', '3 × 84 = 252.')),
      Q(L('In a bonded warehouse, duties are…', 'في المستودع الجمركي، الرسوم…'), [L('Paid on arrival', 'تُدفع عند الوصول'), L('Suspended until release for consumption', 'معلّقة حتى الإفراج للاستهلاك'), L('Never paid', 'لا تُدفع أبدًا'), L('Doubled', 'مضاعفة')], 1, L('Duty suspension.', 'تعليق الرسوم.')),
    ],
  });

  add({
    id: 'svc-law', lvl: 10, icon: '⚖', min: 18,
    title: L('Maritime law & insurance essentials', 'أساسيات القانون البحري والتأمين'),
    sub: L('B/L functions & types, Hague-Visby/Hamburg/Rotterdam rules, general average, salvage, collision, P&I, cargo insurance (ICC).', 'وظائف البوليصة وأنواعها، قواعد لاهاي-فيسبي/هامبورغ/روتردام، العوارية العامة، الإنقاذ، التصادم، P&I، تأمين البضائع (ICC).'),
    body: L(`
<h3>The bill of lading has three functions</h3>
<ol><li><b>Receipt</b> for the goods (quantity, apparent condition — “clean” or “claused”).</li><li><b>Evidence of the contract</b> of carriage.</li><li><b>Document of title</b> (negotiable B/L “to order”) — whoever holds it can claim the goods.</li></ol>
<p>Types: original (to order / straight), telex release, seaway bill (not a title document), house vs master B/L.</p>
<h3>Carrier liability regimes</h3>
<div class="table-wrap"><table><thead><tr><th>Regime</th><th>Limits (approx.)</th><th>Notes</th></tr></thead><tbody>
<tr><td>Hague-Visby</td><td>666.67 SDR/package or 2 SDR/kg (higher)</td><td>Most used; nautical-fault defence</td></tr>
<tr><td>Hamburg Rules</td><td>835 SDR/package or 2.5 SDR/kg</td><td>Fewer carrier defences</td></tr>
<tr><td>Rotterdam Rules</td><td>875 SDR/package or 3 SDR/kg</td><td>Door-to-door; not yet widely in force</td></tr>
</tbody></table></div>
<p>Time bar to sue the carrier: usually <b>1 year</b> (Hague-Visby). Notice of damage at delivery (or within 3 days if not apparent).</p>
<h3>General average (York-Antwerp Rules)</h3>
<p>When an extraordinary sacrifice or expense is made to save the common adventure (e.g. fire-fighting damage, salvage), all interests (ship + all cargo) share the loss in proportion to their saved values. Cargo is released only against a <b>GA bond/guarantee</b>.</p>
<div class="formula">Contribution % = Total GA loss ÷ Total contributory values
Cargo owner pays = cargo value × contribution %</div>
<h3>Salvage, collision, wreck</h3><p>Salvage under “no cure, no pay” (Lloyd's Open Form); collision liability shared by fault; wreck removal (Nairobi Convention).</p>
<h3>Insurance map</h3>
<ul><li><b>Hull & Machinery</b> (ship damage), <b>P&I</b> (third-party liabilities), <b>Cargo insurance</b> — Institute Cargo Clauses A (all risks), B, C (named perils).</li><li>Terminal operators' liability insurance (TT Club etc.) for damage to cargo/equipment in their care.</li></ul>`,
`
<h3>لبوليصة الشحن ثلاث وظائف</h3>
<ol><li><b>إيصال</b> بالبضائع (الكمية، الحالة الظاهرة — “نظيفة” أو “متحفّظة”).</li><li><b>دليل على عقد</b> النقل.</li><li><b>سند ملكية</b> (بوليصة قابلة للتداول “لأمر”) — من يحملها يستطيع المطالبة بالبضاعة.</li></ol>
<p>الأنواع: أصلية (لأمر / اسمية)، إفراج تلكس، بوليصة بحرية غير قابلة للتداول (ليست سند ملكية)، بوليصة وكيل الشحن مقابل بوليصة الخط.</p>
<h3>أنظمة مسؤولية الناقل</h3>
<div class="table-wrap"><table><thead><tr><th>النظام</th><th>الحدود (تقريبًا)</th><th>ملاحظات</th></tr></thead><tbody>
<tr><td>لاهاي-فيسبي</td><td>666.67 وحدة سحب خاصة/طرد أو 2 لكل كغ (الأعلى)</td><td>الأكثر استخدامًا؛ دفاع الخطأ الملاحي</td></tr>
<tr><td>قواعد هامبورغ</td><td>835 وحدة/طرد أو 2.5 لكل كغ</td><td>دفاعات أقل للناقل</td></tr>
<tr><td>قواعد روتردام</td><td>875 وحدة/طرد أو 3 لكل كغ</td><td>من الباب للباب؛ غير سارية على نطاق واسع بعد</td></tr>
</tbody></table></div>
<p>مهلة رفع الدعوى على الناقل: عادةً <b>سنة واحدة</b> (لاهاي-فيسبي). إشعار الضرر عند التسليم (أو خلال 3 أيام إن لم يكن ظاهرًا).</p>
<h3>العوارية العامة (قواعد يورك-أنتويرب)</h3>
<p>عند تقديم تضحية أو نفقة استثنائية لإنقاذ المشروع المشترك (مثل أضرار إطفاء الحريق، الإنقاذ)، تتقاسم كل المصالح (السفينة + كل البضائع) الخسارة بنسبة قيمها المنقذة. لا يُفرج عن البضاعة إلا مقابل <b>تعهّد/كفالة عوارية عامة</b>.</p>
<div class="formula">Contribution % = Total GA loss ÷ Total contributory values
Cargo owner pays = cargo value × contribution %</div>
<h3>الإنقاذ والتصادم والحطام</h3><p>الإنقاذ بمبدأ “لا نجاح لا أجر” (نموذج لويدز المفتوح)؛ مسؤولية التصادم توزَّع حسب الخطأ؛ إزالة الحطام (اتفاقية نيروبي).</p>
<h3>خريطة التأمين</h3>
<ul><li><b>البدن والآلات</b> (أضرار السفينة)، <b>P&I</b> (المسؤوليات تجاه الغير)، <b>تأمين البضائع</b> — شروط معهد البضائع A (كل المخاطر)، B، C (مخاطر محدّدة).</li><li>تأمين مسؤولية مشغّلي المحطات (مثل TT Club) عن الأضرار للبضائع/المعدّات في عهدتهم.</li></ul>`),
    keys: [L('B/L = receipt + contract evidence + title.', 'البوليصة = إيصال + دليل عقد + سند ملكية.'), L('Hague-Visby time bar 1 year.', 'مهلة لاهاي-فيسبي سنة واحدة.'), L('General average: everyone shares the sacrifice.', 'العوارية العامة: الجميع يتقاسم التضحية.')],
    senior: L('When a ship declares general average, the terminal must not release cargo until the line confirms GA security was provided — or you may become liable.', 'عندما تعلن سفينة العوارية العامة، يجب ألّا تُفرج المحطة عن البضاعة حتى يؤكّد الخط تقديم ضمان العوارية — وإلا قد تصبح مسؤولًا.'),
    quiz: [
      Q(L('Which B/L is NOT a document of title?', 'أي بوليصة ليست سند ملكية؟'), [L('Original to order', 'أصلية لأمر'), L('Seaway bill', 'البوليصة البحرية غير القابلة للتداول'), L('Negotiable B/L', 'البوليصة القابلة للتداول'), L('Bearer B/L', 'بوليصة لحاملها')], 1, L('Seaway bills only evidence contract and receipt.', 'البوالص البحرية تثبت العقد والاستلام فقط.')),
      Q(L('GA loss USD 2 M, contributory values USD 80 M. Cargo worth USD 400,000 pays…', 'خسارة العوارية 2 مليون، القيم المساهمة 80 مليونًا. بضاعة قيمتها 400,000 تدفع…'), [L('USD 2,500', '2,500 دولار'), L('USD 10,000', '10,000 دولار'), L('USD 40,000', '40,000 دولار'), L('Nothing', 'لا شيء')], 1, L('2/80 = 2.5% × 400,000 = 10,000.', '2/80 = 2.5% × 400,000 = 10,000.')),
      Q(L('Institute Cargo Clauses A cover…', 'شروط معهد البضائع A تغطّي…'), [L('Named perils only', 'مخاطر محدّدة فقط'), L('All risks (with exclusions)', 'كل المخاطر (مع استثناءات)'), L('Ship damage', 'أضرار السفينة'), L('Crew injury', 'إصابة الطاقم')], 1, L('Widest cover.', 'أوسع تغطية.')),
    ],
  });

  add({
    id: 'svc-tariff', lvl: 10, icon: '🧾', min: 14,
    title: L('Port tariffs, invoicing & revenue control', 'تعرفات الميناء والفوترة ومراقبة الإيرادات'),
    sub: L('Tariff structure, who pays what, billing events from the TOS, credit control, disputes, revenue leakage.', 'هيكل التعرفة، من يدفع ماذا، أحداث الفوترة من TOS، مراقبة الائتمان، النزاعات، تسرّب الإيرادات.'),
    body: L(`
<h3>Who pays what</h3>
<div class="table-wrap"><table><thead><tr><th>Charge</th><th>Basis</th><th>Payer</th></tr></thead><tbody>
<tr><td>Port dues / light dues</td><td>GT per call</td><td>Ship (via agent)</td></tr>
<tr><td>Pilotage, towage, mooring</td><td>GT/LOA per movement</td><td>Ship</td></tr>
<tr><td>Berth hire / wharfage</td><td>LOA × hours / per tonne or TEU of cargo</td><td>Ship / cargo</td></tr>
<tr><td>Stevedoring / THC</td><td>Per move / per tonne</td><td>Line (recovered from shipper/consignee as THC)</td></tr>
<tr><td>Storage, reefer plugging, inspections</td><td>Per day / per box</td><td>Cargo owner</td></tr>
<tr><td>Bulk handling & storage</td><td>Per tonne, per tonne-month</td><td>Cargo owner / charterer</td></tr>
</tbody></table></div>
<h3>From operation to invoice</h3>
<p>Every billable event (discharge move, restow, hatch cover, storage day, reefer day, inspection) is created in the TOS. Billing runs per vessel call (to the line) and per box/day (to cargo). Missing events = <b>revenue leakage</b>.</p>
<h3>Controls</h3>
<ul><li>Reconcile moves billed vs COARRI vs crane counters.</li><li>Storage: no gate-out without payment (financial hold).</li><li>Credit limits and guarantees for lines/agents; ageing reports.</li><li>Dispute process with evidence (SOF, TOS logs).</li></ul>
<div class="formula">Revenue leakage % = (Billable events − Billed events) ÷ Billable events</div>`,
`
<h3>من يدفع ماذا</h3>
<div class="table-wrap"><table><thead><tr><th>الرسم</th><th>الأساس</th><th>الدافع</th></tr></thead><tbody>
<tr><td>رسوم الميناء / المنارات</td><td>GT لكل زيارة</td><td>السفينة (عبر الوكيل)</td></tr>
<tr><td>الإرشاد، القطر، الربط</td><td>GT/الطول لكل حركة</td><td>السفينة</td></tr>
<tr><td>أجرة الرصيف / رسوم الرصيف</td><td>الطول × الساعات / لكل طن أو TEU من البضاعة</td><td>السفينة / البضاعة</td></tr>
<tr><td>التحميل والتفريغ / THC</td><td>لكل حركة / لكل طن</td><td>الخط (يستردّها من الشاحن/المستورد كـ THC)</td></tr>
<tr><td>التخزين، توصيل المبرّدات، المعاينات</td><td>لكل يوم / لكل حاوية</td><td>صاحب البضاعة</td></tr>
<tr><td>مناولة وتخزين السائبة</td><td>لكل طن، لكل طن-شهر</td><td>صاحب البضاعة / المستأجر</td></tr>
</tbody></table></div>
<h3>من العملية إلى الفاتورة</h3>
<p>كل حدث قابل للفوترة (حركة تفريغ، إعادة رصّ، غطاء عنبر، يوم تخزين، يوم مبرّدة، معاينة) يُنشأ في TOS. تُجرى الفوترة لكل زيارة سفينة (للخط) ولكل حاوية/يوم (للبضاعة). الأحداث المفقودة = <b>تسرّب الإيرادات</b>.</p>
<h3>الضوابط</h3>
<ul><li>طابق الحركات المفوترة مع COARRI وعدّادات الرافعات.</li><li>التخزين: لا خروج دون دفع (حجز مالي).</li><li>حدود ائتمان وكفالات للخطوط/الوكلاء؛ تقارير أعمار الديون.</li><li>إجراء نزاعات مع الأدلّة (بيان الوقائع، سجلّات TOS).</li></ul>
<div class="formula">Revenue leakage % = (Billable events − Billed events) ÷ Billable events</div>`),
    keys: [L('Ship pays dues & marine services; cargo pays storage; line pays stevedoring.', 'السفينة تدفع الرسوم والخدمات البحرية؛ البضاعة تدفع التخزين؛ الخط يدفع المناولة.'), L('Every billable event must exist in the TOS.', 'كل حدث قابل للفوترة يجب أن يوجد في TOS.'), L('Reconcile to stop revenue leakage.', 'طابق لوقف تسرّب الإيرادات.')],
    senior: L('Do a monthly “restows & hatch covers” audit: these are the moves most often done and least often billed.', 'نفّذ تدقيقًا شهريًا “لإعادة الرصّ وأغطية العنابر”: هذه أكثر الحركات تنفيذًا وأقلّها فوترة.'),
    quiz: [
      Q(L('Who normally pays storage on an import box?', 'من يدفع عادةً تخزين حاوية الاستيراد؟'), [L('The ship', 'السفينة'), L('The cargo owner/consignee', 'صاحب البضاعة/المستورد'), L('The pilot', 'المرشد'), L('The port authority', 'سلطة الميناء')], 1, L('Cargo-related charge.', 'رسم مرتبط بالبضاعة.')),
      Q(L('10,000 billable events, 9,700 billed. Leakage?', '10,000 حدث قابل للفوترة، فُوتر 9,700. التسرّب؟'), [L('0.3%', '0.3%'), L('3%', '3%'), L('30%', '30%'), L('97%', '97%')], 1, L('300 ÷ 10,000 = 3%.', '300 ÷ 10,000 = 3%.')),
    ],
  });

  /* glossary + exam extras for level 10 */
  const G = (term, ar, en, arD) => PT.glossary.push({ term, ar, d: L(en, arD) });
  G('BDN', 'مذكّرة تسليم الوقود', 'Bunker Delivery Note.', 'مذكّرة تسليم الوقود للسفينة.');
  G('Bollard pull', 'قوة الشدّ', 'Static pulling force of a tug (t).', 'قوة السحب الساكنة للقاطرة (طن).');
  G('Bonded warehouse', 'مستودع جمركي', 'Storage with duties suspended.', 'تخزين مع تعليق الرسوم.');
  G('Dry port', 'ميناء جاف', 'Inland terminal linked to a seaport.', 'محطة داخلية مرتبطة بميناء بحري.');
  G('Free zone', 'منطقة حرّة', 'Area outside the customs territory.', 'منطقة خارج الإقليم الجمركي.');
  G('General average', 'العوارية العامة', 'Shared loss from a sacrifice to save ship & cargo.', 'خسارة مشتركة من تضحية لإنقاذ السفينة والبضاعة.');
  G('Hague-Visby Rules', 'قواعد لاهاي-فيسبي', 'International regime of carrier liability under B/Ls.', 'النظام الدولي لمسؤولية الناقل بموجب البوالص.');
  G('ICC (A/B/C)', 'شروط معهد البضائع', 'Institute Cargo Clauses for cargo insurance.', 'شروط معهد البضائع لتأمين البضائع.');
  G('ISO 8217', 'ISO 8217', 'Marine fuel quality standard.', 'معيار جودة وقود السفن.');
  G('MGO / VLSFO', 'أنواع الوقود البحري', 'Marine gasoil / very low sulphur fuel oil.', 'زيت الغاز البحري / زيت الوقود منخفض الكبريت جدًا.');
  G('Modal split', 'توزيع الوسائط', 'Share of traffic by truck, rail, barge.', 'حصة الحركة بالشاحنات والسكك والبوارج.');
  G('Revenue leakage', 'تسرّب الإيرادات', 'Services delivered but not billed.', 'خدمات مقدّمة لكن غير مفوترة.');
  G('Salvage', 'الإنقاذ البحري', 'Saving ship/cargo at sea, usually “no cure, no pay”.', 'إنقاذ السفينة/البضاعة في البحر، عادةً “لا نجاح لا أجر”.');
  G('Seaway bill', 'بوليصة بحرية غير قابلة للتداول', 'Non-negotiable transport document.', 'مستند نقل غير قابل للتداول.');
  G('SIMOPS', 'العمليات المتزامنة', 'Simultaneous operations (e.g. bunkering during cargo work).', 'عمليات متزامنة (مثل التزويد بالوقود أثناء عمل البضاعة).');
  G('Turnaround call', 'زيارة تبديل', 'Cruise call where passengers embark/disembark.', 'زيارة سياحية يصعد فيها الركّاب وينزلون.');
  PT.glossary.sort((a, b) => a.term.localeCompare(b.term));
  const X = (lvl, q, o, a, e) => PT.examBank.push({ lvl, q, o, a, e });
  X(10, L('Pilotage is usually charged per…', 'يُحتسب الإرشاد عادةً لكل…'), [L('TEU', 'TEU'), L('Movement, on GT/LOA', 'حركة، على أساس GT/الطول'), L('Crew member', 'فرد طاقم'), L('Day', 'يوم')], 1, L('Arrival, departure, shifting.', 'الوصول، المغادرة، النقل.'));
  X(10, L('Time bar under Hague-Visby?', 'مهلة التقادم بموجب لاهاي-فيسبي؟'), [L('3 months', '3 أشهر'), L('1 year', 'سنة'), L('5 years', '5 سنوات'), L('No limit', 'بلا حدّ')], 1, L('One year from delivery.', 'سنة من التسليم.'));
  X(10, L('A dry port mainly helps the seaport by…', 'الميناء الجاف يساعد الميناء البحري أساسًا بـ…'), [L('Adding quay length', 'إضافة طول رصيف'), L('Moving clearance & dwell inland', 'نقل التخليص ومدة البقاء إلى الداخل'), L('Dredging', 'التجريف'), L('Bunkering', 'التزويد بالوقود')], 1, L('Frees yard space.', 'يحرّر مساحة الساحة.'));
})();
