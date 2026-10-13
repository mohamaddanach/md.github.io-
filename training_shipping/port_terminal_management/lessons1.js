/* Port Master Academy — curriculum, levels 1 & 2 */
(function () {
  const L = TS.L;
  const Q = (q, o, a, e) => ({ q, o, a, e });
  const add = (x) => PT.lessons.push(x);

  /* =========================================================== LEVEL 1 */
  add({
    id: 'ecosystem', lvl: 1, icon: '🌐', min: 15,
    title: L('The port ecosystem & who does what', 'منظومة الميناء: من يفعل ماذا'),
    sub: L('Port authority, terminal operator, shipping line, agent, pilots, customs… and how they connect.', 'سلطة الميناء، مشغّل المحطة، الخط الملاحي، الوكيل، المرشدون، الجمارك… وكيف يرتبطون.'),
    body: L(`
<h3>A port is a system, not a place</h3>
<p>A port is where sea transport meets land transport. Dozens of organisations must coordinate for every ship call. As a manager, your first skill is knowing <b>who owns which decision</b> and <b>who you call</b>.</p>
<h3>The main actors</h3>
<div class="table-wrap"><table><thead><tr><th>Actor</th><th>Role</th><th>You talk to them about</th></tr></thead><tbody>
<tr><td><b>Port Authority</b></td><td>Owns the land and water, sets port rules and dues, controls navigation (Harbour Master)</td><td>Berth permissions, safety rules, port dues, channel restrictions</td></tr>
<tr><td><b>Harbour Master / VTS</b></td><td>Vessel Traffic Service — controls ship movements in port waters</td><td>Entry/exit clearance, anchorage, weather closures</td></tr>
<tr><td><b>Terminal Operator</b></td><td>Runs berths, cranes, yard, gate (often a concession)</td><td>This is <i>you</i> — productivity, berth plan, yard, gate</td></tr>
<tr><td><b>Shipping Line (carrier)</b></td><td>Owns/charters vessels and containers, sells transport</td><td>Berth windows, load lists, productivity, invoices</td></tr>
<tr><td><b>Ship Agent</b></td><td>Represents the vessel/owner locally</td><td>ETA, pre-arrival documents, crew, supplies, port clearance</td></tr>
<tr><td><b>Pilots, Tugs, Mooring gangs</b></td><td>Marine services that bring the ship alongside safely</td><td>Pilot boarding time, number of tugs, all-fast time</td></tr>
<tr><td><b>Stevedores / labour</b></td><td>Gangs that lash, operate equipment, check</td><td>Gang allocation per shift, overtime</td></tr>
<tr><td><b>Customs & other agencies</b></td><td>Clearance, inspection, scanning, health, agriculture</td><td>Holds, inspections, release</td></tr>
<tr><td><b>Freight forwarders / brokers</b></td><td>Organise shipments for cargo owners</td><td>Bookings, documents, releases</td></tr>
<tr><td><b>Hauliers / truckers</b></td><td>Move containers between port, depots, customers</td><td>Gate appointments, truck turnaround</td></tr>
<tr><td><b>Empty depots</b></td><td>Store, inspect, repair and release empty containers</td><td>Empty availability, repairs, damage claims</td></tr>
</tbody></table></div>
<h3>Port governance models</h3>
<ul>
<li><b>Service port</b> — the authority owns everything and operates it (public).</li>
<li><b>Tool port</b> — the authority owns the cranes; private stevedores operate.</li>
<li><b>Landlord port</b> (most common today) — the authority owns land/quay; private terminal operators invest in equipment under a <b>concession</b> (e.g. 25–35 years).</li>
<li><b>Fully private port</b> — land and operations are private.</li>
</ul>
<h3>Types of container terminal traffic</h3>
<ul>
<li><b>Gateway (import/export)</b>: boxes come from/go to the hinterland by truck/rail.</li>
<li><b>Transshipment</b>: boxes move ship → yard → ship (hub-and-spoke). No gate, but huge yard and berth pressure.</li>
</ul>
<div class="ex" data-t="Example">At CBCT, 60% of volume is gateway (Lebanon/Syria/Jordan hinterland) and 40% transshipment for feeders to Cyprus, Turkey and Egypt.</div>`,
`
<h3>الميناء منظومة وليس مجرّد مكان</h3>
<p>الميناء هو نقطة التقاء النقل البحري بالنقل البري. عشرات الجهات يجب أن تنسّق في كل زيارة سفينة. كمدير، مهارتك الأولى هي معرفة <b>من يملك أي قرار</b> و<b>بمن تتّصل</b>.</p>
<h3>الأطراف الرئيسية</h3>
<div class="table-wrap"><table><thead><tr><th>الطرف</th><th>الدور</th><th>تتواصل معه بشأن</th></tr></thead><tbody>
<tr><td><b>سلطة الميناء</b></td><td>تملك الأرض والمياه، تضع الأنظمة والرسوم، وتتحكّم بالملاحة (قبطان الميناء)</td><td>أذونات الرصيف، قواعد السلامة، رسوم الميناء، قيود القناة</td></tr>
<tr><td><b>قبطان الميناء / VTS</b></td><td>خدمة حركة السفن — تتحكّم بحركة السفن في مياه الميناء</td><td>تصاريح الدخول/الخروج، المخطاف، الإغلاق بسبب الطقس</td></tr>
<tr><td><b>مشغّل المحطة</b></td><td>يدير الأرصفة والرافعات والساحة والبوابة (غالبًا بعقد امتياز)</td><td>هذا <i>أنت</i> — الإنتاجية، خطة الأرصفة، الساحة، البوابة</td></tr>
<tr><td><b>الخط الملاحي (الناقل)</b></td><td>يملك/يستأجر السفن والحاويات ويبيع النقل</td><td>نوافذ الرسو، قوائم التحميل، الإنتاجية، الفواتير</td></tr>
<tr><td><b>الوكيل البحري</b></td><td>يمثّل السفينة/المالك محليًا</td><td>موعد الوصول، مستندات ما قبل الوصول، الطاقم، التموين، تصريح المغادرة</td></tr>
<tr><td><b>المرشدون والقاطرات وفرق الربط</b></td><td>خدمات بحرية لإحضار السفينة إلى الرصيف بأمان</td><td>وقت صعود المرشد، عدد القاطرات، وقت الربط الكامل</td></tr>
<tr><td><b>عمّال التحميل والتفريغ</b></td><td>فرق للتثبيت وتشغيل المعدّات والتدقيق</td><td>توزيع الفرق لكل وردية، العمل الإضافي</td></tr>
<tr><td><b>الجمارك والجهات الأخرى</b></td><td>التخليص، المعاينة، الفحص بالأشعة، الصحة، الزراعة</td><td>الحجوزات، المعاينات، الإفراج</td></tr>
<tr><td><b>وكلاء الشحن / المخلّصون</b></td><td>ينظّمون الشحنات لأصحاب البضائع</td><td>الحجوزات، المستندات، الإفراج</td></tr>
<tr><td><b>شركات النقل البري</b></td><td>تنقل الحاويات بين الميناء والمستودعات والزبائن</td><td>مواعيد البوابة، زمن دوران الشاحنة</td></tr>
<tr><td><b>مستودعات الفارغ</b></td><td>تخزين وفحص وإصلاح وإطلاق الحاويات الفارغة</td><td>توفّر الفارغ، الإصلاحات، مطالبات الأضرار</td></tr>
</tbody></table></div>
<h3>نماذج إدارة الموانئ</h3>
<ul>
<li><b>ميناء خدمي</b> — السلطة تملك كل شيء وتشغّله (عام).</li>
<li><b>ميناء أدوات</b> — السلطة تملك الرافعات؛ ويشغّلها مقاولو تحميل خاصّون.</li>
<li><b>ميناء المالك (Landlord)</b> — الأكثر انتشارًا اليوم: السلطة تملك الأرض والرصيف، ومشغّلون خاصّون يستثمرون في المعدّات بموجب <b>عقد امتياز</b> (مثلًا 25–35 سنة).</li>
<li><b>ميناء خاص بالكامل</b> — الأرض والتشغيل خاصّان.</li>
</ul>
<h3>أنواع حركة محطات الحاويات</h3>
<ul>
<li><b>بوابة (استيراد/تصدير)</b>: الحاويات تأتي من/تذهب إلى الداخل بالشاحنات/القطار.</li>
<li><b>مسافنة (Transshipment)</b>: الحاوية تنتقل سفينة ← ساحة ← سفينة (محور وأطراف). لا بوابة، لكن ضغط كبير على الساحة والأرصفة.</li>
</ul>
<div class="ex" data-t="مثال">في CBCT، 60% من الحجم حركة بوابة (الداخل اللبناني/السوري/الأردني) و40% مسافنة لسفن فيدر إلى قبرص وتركيا ومصر.</div>`),
    keys: [L('Know who owns each decision before you act.', 'اعرف من يملك كل قرار قبل أن تتصرّف.'), L('Landlord model: authority owns land, operator runs the terminal.', 'نموذج المالك: السلطة تملك الأرض والمشغّل يدير المحطة.'), L('Gateway vs transshipment change everything in yard and berth planning.', 'البوابة مقابل المسافنة تغيّر كل شيء في تخطيط الساحة والأرصفة.')],
    senior: L('Seniors build a phone list of decision-makers (VTS duty officer, pilot station, line ops desk, customs shift chief) and keep relationships warm before a crisis — not during it.', 'المحترفون يبنون قائمة هواتف لأصحاب القرار (ضابط VTS المناوب، محطة الإرشاد، مكتب عمليات الخط، رئيس مناوبة الجمارك) ويحافظون على العلاقة قبل الأزمة — لا أثناءها.'),
    quiz: [
      Q(L('Who controls vessel movements inside port waters?', 'من يتحكّم بحركة السفن داخل مياه الميناء؟'), [L('The terminal operator', 'مشغّل المحطة'), L('The Harbour Master / VTS', 'قبطان الميناء / VTS'), L('The ship agent', 'الوكيل البحري'), L('Customs', 'الجمارك')], 1, L('Navigation is a Port Authority function exercised by the Harbour Master through VTS.', 'الملاحة من صلاحيات سلطة الميناء ويمارسها قبطان الميناء عبر VTS.')),
      Q(L('In a landlord port, who usually buys the STS cranes?', 'في ميناء المالك، من يشتري عادةً رافعات الرصيف؟'), [L('The port authority', 'سلطة الميناء'), L('The private terminal operator', 'مشغّل المحطة الخاص'), L('The shipping line always', 'الخط الملاحي دائمًا'), L('Customs', 'الجمارك')], 1, L('The authority provides land/quay; the concessionaire invests in superstructure (cranes, yard equipment).', 'السلطة توفّر الأرض والرصيف؛ وصاحب الامتياز يستثمر في المعدّات (الرافعات ومعدّات الساحة).')),
      Q(L('Which traffic type never uses the truck gate?', 'أي نوع حركة لا يستخدم بوابة الشاحنات أبدًا؟'), [L('Import', 'استيراد'), L('Export', 'تصدير'), L('Transshipment', 'المسافنة'), L('Empty return', 'إرجاع الفارغ')], 2, L('Transshipment boxes go ship → yard → ship.', 'حاويات المسافنة تنتقل سفينة ← ساحة ← سفينة.')),
      Q(L('Who represents the vessel owner locally and submits pre-arrival documents?', 'من يمثّل مالك السفينة محليًا ويقدّم مستندات ما قبل الوصول؟'), [L('Freight forwarder', 'وكيل الشحن'), L('Ship agent', 'الوكيل البحري'), L('Haulier', 'الناقل البري'), L('Depot', 'المستودع')], 1, L('The ship agent handles the vessel; the forwarder handles the cargo owner’s shipment.', 'الوكيل البحري يتولّى السفينة؛ ووكيل الشحن يتولّى شحنة صاحب البضاعة.')),
    ],
  });

  add({
    id: 'ships', lvl: 1, icon: '🚢', min: 18,
    title: L('Ships & vessel particulars', 'السفن ومواصفاتها'),
    sub: L('LOA, beam, draft, DWT, GT, TEU capacity, vessel types and the bay-row-tier system.', 'الطول الكلي، العرض، الغاطس، الحمولة الساكنة، الحمولة الإجمالية، سعة TEU، أنواع السفن ونظام الخليج-الصف-الطبقة.'),
    body: L(`
<h3>Vessel particulars you must read in 10 seconds</h3>
<div class="table-wrap"><table><thead><tr><th>Term</th><th>Meaning</th><th>Why the port cares</th></tr></thead><tbody>
<tr><td><b>LOA</b> (Length Overall)</td><td>Total length bow to stern</td><td>Berth length needed (LOA + ~10–15% or 2 × 15–20 m clearance)</td></tr>
<tr><td><b>Beam</b></td><td>Width of the ship</td><td>STS crane outreach (rows across)</td></tr>
<tr><td><b>Draft (draught)</b></td><td>Depth of the hull below the waterline</td><td>Berth and channel depth, tides, UKC</td></tr>
<tr><td><b>Air draft</b></td><td>Height above the waterline</td><td>Bridges, crane lift height</td></tr>
<tr><td><b>DWT</b></td><td>Deadweight — weight the ship can carry (cargo, fuel, water, stores)</td><td>Load capacity</td></tr>
<tr><td><b>GT</b></td><td>Gross Tonnage — internal volume index</td><td><b>Port dues</b> and pilotage are often based on GT</td></tr>
<tr><td><b>TEU capacity</b></td><td>Nominal number of 20-ft equivalent units</td><td>Size class, crane intensity</td></tr>
<tr><td><b>IMO number</b></td><td>Unique 7-digit ship ID (never changes)</td><td>Identification in all systems</td></tr>
<tr><td><b>Call sign / MMSI</b></td><td>Radio identifiers; MMSI used by AIS</td><td>Tracking on AIS</td></tr>
</tbody></table></div>
<h3>Container ship size classes (approx.)</h3>
<ul>
<li><b>Feeder</b>: 300–3,000 TEU (LOA ~120–210 m, draft 7–11 m)</li>
<li><b>Panamax (old)</b>: up to ~5,000 TEU (beam 32.3 m)</li>
<li><b>Neo-Panamax</b>: ~10,000–15,000 TEU (beam up to 51 m)</li>
<li><b>ULCV</b> (Ultra Large): 18,000–24,000+ TEU (LOA ~400 m, draft ~16 m, 24–25 rows across)</li>
</ul>
<h3>Other ship types you will meet</h3>
<p>Ro-Ro (rolling cargo), con-ro (containers + ro-ro), general cargo/multipurpose (project cargo), bulk carriers, tankers, car carriers (PCTC), cruise ships. Container terminals mostly handle cellular container ships, but multipurpose berths see the others.</p>
<h3>Locating a container on board: Bay – Row – Tier</h3>
<p>Every slot on a container ship has a 6-digit code <b>BBRRTT</b>:</p>
<ul>
<li><b>Bay</b> (front to back): odd numbers = 20′ positions (01, 03, 05…); even numbers = 40′ positions (02 = 01+03 combined).</li>
<li><b>Row</b> (across): 00 at centreline (if odd number of rows), even numbers to port side (02, 04…), odd numbers to starboard (01, 03…).</li>
<li><b>Tier</b> (vertical): in the hold 02, 04, 06…; on deck starts at 82 (or 80), 84, 86…</li>
</ul>
<div class="ex" data-t="Example">Slot <b>140284</b> = bay 14 (a 40′ position over bays 13+15), row 02 (first row to port of centreline), tier 84 (second tier on deck).</div>
<h3>Hatch covers</h3>
<p>Below-deck containers can only be reached after deck containers and hatch covers above them are removed. This is why <b>overstows</b> and <b>restows</b> cost time and money.</p>`,
`
<h3>مواصفات السفينة التي يجب أن تقرأها في 10 ثوانٍ</h3>
<div class="table-wrap"><table><thead><tr><th>المصطلح</th><th>المعنى</th><th>لماذا يهمّ الميناء</th></tr></thead><tbody>
<tr><td><b>LOA</b> (الطول الكلي)</td><td>الطول من المقدّمة إلى المؤخّرة</td><td>طول الرصيف المطلوب (LOA + ~10–15% أو 2 × 15–20 م خلوص)</td></tr>
<tr><td><b>Beam</b> (العرض)</td><td>عرض السفينة</td><td>مدى ذراع رافعة الرصيف (عدد الصفوف)</td></tr>
<tr><td><b>Draft</b> (الغاطس)</td><td>عمق البدن تحت خط الماء</td><td>عمق الرصيف والقناة، المد، عمق الأمان UKC</td></tr>
<tr><td><b>Air draft</b> (الارتفاع الهوائي)</td><td>الارتفاع فوق خط الماء</td><td>الجسور، ارتفاع رفع الرافعة</td></tr>
<tr><td><b>DWT</b> (الحمولة الساكنة)</td><td>الوزن الذي تستطيع السفينة حمله (بضاعة، وقود، ماء، مؤن)</td><td>القدرة على التحميل</td></tr>
<tr><td><b>GT</b> (الحمولة الإجمالية)</td><td>مؤشّر الحجم الداخلي</td><td><b>رسوم الميناء</b> والإرشاد تُحسب غالبًا على GT</td></tr>
<tr><td><b>سعة TEU</b></td><td>العدد الاسمي للوحدات المكافئة لعشرين قدمًا</td><td>فئة الحجم، كثافة الرافعات</td></tr>
<tr><td><b>رقم IMO</b></td><td>رقم تعريف فريد من 7 خانات (لا يتغيّر أبدًا)</td><td>التعريف في جميع الأنظمة</td></tr>
<tr><td><b>نداء الاتصال / MMSI</b></td><td>معرّفات لاسلكية؛ MMSI يستخدمه نظام AIS</td><td>التتبّع عبر AIS</td></tr>
</tbody></table></div>
<h3>فئات أحجام سفن الحاويات (تقريبًا)</h3>
<ul>
<li><b>فيدر</b>: 300–3,000 TEU (طول ~120–210 م، غاطس 7–11 م)</li>
<li><b>باناماكس (القديمة)</b>: حتى ~5,000 TEU (عرض 32.3 م)</li>
<li><b>نيو باناماكس</b>: ~10,000–15,000 TEU (عرض حتى 51 م)</li>
<li><b>ULCV</b> (فائقة الحجم): 18,000–24,000+ TEU (طول ~400 م، غاطس ~16 م، 24–25 صفًا بالعرض)</li>
</ul>
<h3>أنواع سفن أخرى ستصادفها</h3>
<p>رورو (بضائع متدحرجة)، كون-رو (حاويات + رورو)، بضائع عامة/متعدّدة الأغراض (شحنات مشاريع)، سفن البضائع السائبة، الناقلات، ناقلات السيارات (PCTC)، السفن السياحية. محطات الحاويات تتعامل غالبًا مع سفن الحاويات الخلوية، لكن الأرصفة متعدّدة الأغراض تستقبل الأنواع الأخرى.</p>
<h3>تحديد موقع الحاوية على السفينة: الخليج – الصف – الطبقة</h3>
<p>لكل خانة على سفينة الحاويات رمز من 6 أرقام <b>BBRRTT</b>:</p>
<ul>
<li><b>الخليج Bay</b> (من الأمام للخلف): الأرقام الفردية = مواقع 20′ (01، 03، 05…)؛ الزوجية = مواقع 40′ (02 = 01+03 معًا).</li>
<li><b>الصف Row</b> (بالعرض): 00 على خط المنتصف (إن كان عدد الصفوف فرديًا)، الزوجية نحو الجانب الأيسر (02، 04…)، الفردية نحو الأيمن (01، 03…).</li>
<li><b>الطبقة Tier</b> (عموديًا): في العنبر 02، 04، 06…؛ على السطح تبدأ من 82 (أو 80)، 84، 86…</li>
</ul>
<div class="ex" data-t="مثال">الخانة <b>140284</b> = خليج 14 (موقع 40′ فوق الخليجين 13+15)، صف 02 (أول صف يسار خط المنتصف)، طبقة 84 (الطبقة الثانية على السطح).</div>
<h3>أغطية العنابر</h3>
<p>لا يمكن الوصول للحاويات تحت السطح إلا بعد إزالة حاويات السطح وأغطية العنابر فوقها. لهذا السبب <b>الحاويات المحجوبة (Overstow)</b> و<b>إعادة الرصّ (Restow)</b> تكلّف وقتًا ومالًا.</p>`),
    keys: [L('LOA → berth length; draft → depth; GT → port dues.', 'الطول ← طول الرصيف؛ الغاطس ← العمق؛ GT ← رسوم الميناء.'), L('Odd bays = 20′, even bays = 40′.', 'الخلجان الفردية = 20′، الزوجية = 40′.'), L('Deck tiers start at 82; hold tiers at 02.', 'طبقات السطح تبدأ من 82؛ وطبقات العنبر من 02.')],
    senior: L('Always check the vessel’s arrival draft AND departure draft. A ship may arrive light and leave deep — the departure draft is what limits your berth and the tide window.', 'تحقّق دائمًا من غاطس الوصول وغاطس المغادرة. قد تصل السفينة خفيفة وتغادر عميقة — غاطس المغادرة هو ما يقيّد رصيفك ونافذة المد.'),
    quiz: [
      Q(L('Bay 22 on a container ship is…', 'الخليج 22 على سفينة الحاويات هو…'), [L('A 20′ position', 'موقع 20′'), L('A 40′ position covering bays 21 and 23', 'موقع 40′ يغطّي الخليجين 21 و23'), L('Always on deck', 'دائمًا على السطح'), L('A reefer bay', 'خليج مبرّدات')], 1, L('Even bay numbers are 40′ positions over two odd 20′ bays.', 'أرقام الخلجان الزوجية مواقع 40′ فوق خليجين فرديين 20′.')),
      Q(L('Port dues are commonly calculated on…', 'تُحسب رسوم الميناء عادةً على أساس…'), [L('DWT', 'الحمولة الساكنة'), L('GT', 'الحمولة الإجمالية GT'), L('TEU on board', 'عدد الحاويات على السفينة'), L('Air draft', 'الارتفاع الهوائي')], 1, L('Gross Tonnage is the usual basis for port dues and pilotage.', 'الحمولة الإجمالية هي الأساس المعتاد لرسوم الميناء والإرشاد.')),
      Q(L('Tier 82 means…', 'الطبقة 82 تعني…'), [L('First tier in the hold', 'أول طبقة في العنبر'), L('First tier on deck', 'أول طبقة على السطح'), L('The top tier', 'أعلى طبقة'), L('A 45′ slot', 'خانة 45′')], 1, L('Deck tiers are numbered from 80/82 upwards.', 'طبقات السطح مرقّمة من 80/82 صعودًا.')),
      Q(L('Which number never changes for a ship, even if renamed?', 'أي رقم لا يتغيّر للسفينة حتى لو تغيّر اسمها؟'), [L('Call sign', 'نداء الاتصال'), L('MMSI', 'MMSI'), L('IMO number', 'رقم IMO'), L('Voyage number', 'رقم الرحلة')], 2, L('The IMO number stays with the hull for life.', 'رقم IMO يبقى مع البدن طوال عمره.')),
    ],
  });

  add({
    id: 'containers', lvl: 1, icon: '📦', min: 16,
    title: L('Containers: types, codes & ISO 6346', 'الحاويات: الأنواع والرموز ومعيار ISO 6346'),
    sub: L('Sizes, size-type codes, check digit, tare/payload, special equipment.', 'المقاسات، رموز المقاس والنوع، رقم التحقّق، الوزن الفارغ/الحمولة، المعدّات الخاصة.'),
    body: L(`
<h3>The container number (ISO 6346)</h3>
<p>Format: <b>AAAU 123456 7</b> — 3-letter owner code + equipment category (<b>U</b> = freight container, J = detachable equipment, Z = trailer/chassis) + 6-digit serial + <b>check digit</b>.</p>
<p>The check digit catches typing errors. Each letter has a value (A=10, B=12, C=13… skipping multiples of 11), each digit is itself. Multiply each of the 10 characters by 2<sup>position</sup> (1, 2, 4, … 512), sum, take <b>mod 11</b>, and if the result is 10 use 0.</p>
<div class="formula">check = (Σ value(i) × 2^i  for i = 0..9)  mod 11   (10 → 0)</div>
<h3>Size-type codes (ISO 6346)</h3>
<div class="table-wrap"><table><thead><tr><th>Code</th><th>Equipment</th><th>Typical tare</th><th>Max gross</th></tr></thead><tbody>
<tr><td class="mono">22G1</td><td>20′ dry (standard)</td><td>2,200 kg</td><td>30,480 kg</td></tr>
<tr><td class="mono">42G1</td><td>40′ dry</td><td>3,750 kg</td><td>30,480 kg</td></tr>
<tr><td class="mono">45G1</td><td>40′ high cube (9′6″)</td><td>3,900 kg</td><td>30,480 kg</td></tr>
<tr><td class="mono">L5G1</td><td>45′ high cube</td><td>4,800 kg</td><td>32,500 kg</td></tr>
<tr><td class="mono">22R1 / 45R1</td><td>Reefer 20′ / 40′ HC</td><td>3,000 / 4,800 kg</td><td>30,480 / 34,000 kg</td></tr>
<tr><td class="mono">22U1 / 45U1</td><td>Open top</td><td>2,350 / 4,000 kg</td><td>30,480 kg</td></tr>
<tr><td class="mono">22P1 / 45P3</td><td>Flat rack (fixed / collapsible ends)</td><td>2,700 / 5,000 kg</td><td>34,000–45,000 kg</td></tr>
<tr><td class="mono">22T1</td><td>Tank container</td><td>~3,600 kg</td><td>36,000 kg</td></tr>
</tbody></table></div>
<p>First character = length (2 = 20′, 4 = 40′, L = 45′), second = height (2 = 8′6″, 5 = 9′6″ HC), last two = type group.</p>
<h3>TEU and FEU</h3>
<p>1 × 20′ = <b>1 TEU</b>; 1 × 40′ = <b>2 TEU</b> (1 FEU); 45′ is usually counted as <b>2.25 TEU</b> (some ports count 2). Throughput is reported in TEU; but cranes count <b>moves</b> (boxes), so the <b>TEU factor</b> (TEU ÷ boxes, often 1.5–1.8) matters for planning.</p>
<h3>Weights</h3>
<div class="formula">Payload = Max gross − Tare
VGM = cargo + packing/dunnage/bracing + tare</div>
<p>Under SOLAS (since 2016) no packed export container may be loaded without a <b>VGM</b> (Verified Gross Mass).</p>
<h3>Special equipment</h3>
<ul>
<li><b>Reefers</b>: need plugs, monitoring (temperature, humidity, ventilation), PTI before release.</li>
<li><b>Open top / flat rack</b>: often <b>OOG</b> (out of gauge) — need special spreaders, slings, and cannot be stacked normally.</li>
<li><b>Tanks</b>: often dangerous goods; need IMDG segregation.</li>
<li><b>SOC</b> (shipper-owned container) vs <b>COC</b> (carrier-owned).</li>
</ul>`,
`
<h3>رقم الحاوية (ISO 6346)</h3>
<p>الصيغة: <b>AAAU 123456 7</b> — رمز المالك من 3 أحرف + فئة المعدّة (<b>U</b> = حاوية شحن، J = معدّة قابلة للفصل، Z = مقطورة/شاسيه) + رقم تسلسلي من 6 خانات + <b>رقم التحقّق</b>.</p>
<p>رقم التحقّق يكتشف أخطاء الكتابة. لكل حرف قيمة (A=10، B=12، C=13… مع تخطّي مضاعفات 11)، وكل رقم قيمته نفسه. اضرب كل خانة من الخانات العشر في 2<sup>الموقع</sup> (1، 2، 4، … 512)، اجمع، خذ <b>باقي القسمة على 11</b>، وإذا كانت النتيجة 10 استخدم 0.</p>
<div class="formula">check = (Σ value(i) × 2^i  for i = 0..9)  mod 11   (10 → 0)</div>
<h3>رموز المقاس والنوع (ISO 6346)</h3>
<div class="table-wrap"><table><thead><tr><th>الرمز</th><th>المعدّة</th><th>الوزن الفارغ النموذجي</th><th>أقصى وزن إجمالي</th></tr></thead><tbody>
<tr><td class="mono">22G1</td><td>20′ جافة (قياسية)</td><td>2,200 كغ</td><td>30,480 كغ</td></tr>
<tr><td class="mono">42G1</td><td>40′ جافة</td><td>3,750 كغ</td><td>30,480 كغ</td></tr>
<tr><td class="mono">45G1</td><td>40′ عالية (9′6″)</td><td>3,900 كغ</td><td>30,480 كغ</td></tr>
<tr><td class="mono">L5G1</td><td>45′ عالية</td><td>4,800 كغ</td><td>32,500 كغ</td></tr>
<tr><td class="mono">22R1 / 45R1</td><td>مبرّدة 20′ / 40′ عالية</td><td>3,000 / 4,800 كغ</td><td>30,480 / 34,000 كغ</td></tr>
<tr><td class="mono">22U1 / 45U1</td><td>مفتوحة السقف</td><td>2,350 / 4,000 كغ</td><td>30,480 كغ</td></tr>
<tr><td class="mono">22P1 / 45P3</td><td>مسطّحة (Flat rack) بجوانب ثابتة / قابلة للطي</td><td>2,700 / 5,000 كغ</td><td>34,000–45,000 كغ</td></tr>
<tr><td class="mono">22T1</td><td>حاوية صهريج</td><td>~3,600 كغ</td><td>36,000 كغ</td></tr>
</tbody></table></div>
<p>الخانة الأولى = الطول (2 = 20′، 4 = 40′، L = 45′)، الثانية = الارتفاع (2 = 8′6″، 5 = 9′6″ عالية)، والأخيرتان = مجموعة النوع.</p>
<h3>TEU و FEU</h3>
<p>1 × 20′ = <b>1 TEU</b>؛ 1 × 40′ = <b>2 TEU</b> (1 FEU)؛ الـ 45′ تُحسب عادةً <b>2.25 TEU</b> (بعض الموانئ تحسبها 2). الإنتاجية تُقاس بالـ TEU؛ لكن الرافعات تعدّ <b>الحركات</b> (الحاويات)، لذا <b>معامل TEU</b> (TEU ÷ عدد الحاويات، غالبًا 1.5–1.8) مهمّ للتخطيط.</p>
<h3>الأوزان</h3>
<div class="formula">Payload = Max gross − Tare
VGM = cargo + packing/dunnage/bracing + tare</div>
<p>بموجب اتفاقية SOLAS (منذ 2016) لا يجوز تحميل أي حاوية تصدير معبّأة دون <b>VGM</b> (الوزن الإجمالي المُتحقَّق منه).</p>
<h3>المعدّات الخاصة</h3>
<ul>
<li><b>المبرّدات</b>: تحتاج مقابس كهرباء ومراقبة (الحرارة، الرطوبة، التهوية) وفحص PTI قبل الإطلاق.</li>
<li><b>مفتوحة السقف / المسطّحة</b>: غالبًا <b>OOG</b> (خارج المقاس) — تحتاج أدوات رفع وحبالًا خاصة، ولا يمكن رصّها بشكل عادي.</li>
<li><b>الصهاريج</b>: غالبًا بضائع خطرة؛ تحتاج فصلًا حسب IMDG.</li>
<li><b>SOC</b> (حاوية يملكها الشاحن) مقابل <b>COC</b> (حاوية يملكها الناقل).</li>
</ul>`),
    keys: [L('Always validate the check digit at gate and on lists.', 'تحقّق دائمًا من رقم التحقّق على البوابة وفي القوائم.'), L('40′ = 2 TEU; 45′ ≈ 2.25 TEU.', '40′ = 2 TEU؛ 45′ ≈ 2.25 TEU.'), L('No VGM → no loading (SOLAS).', 'لا VGM ← لا تحميل (SOLAS).')],
    senior: L('When you plan, think in moves, not TEU. A vessel with 1,000 TEU of 40′ boxes is only 500 crane moves; 1,000 TEU of 20′ is 1,000 moves (unless twin-lift).', 'عند التخطيط فكّر بالحركات لا بالـ TEU. سفينة عليها 1,000 TEU من حاويات 40′ هي 500 حركة رافعة فقط؛ و1,000 TEU من 20′ هي 1,000 حركة (إلّا مع الرفع المزدوج).'),
    quiz: [
      Q(L('In 45G1, the “5” means…', 'في 45G1، الرقم “5” يعني…'), [L('45 feet long', 'طول 45 قدمًا'), L('High cube height 9′6″', 'ارتفاع عالٍ 9′6″'), L('5 tons tare', 'وزن فارغ 5 أطنان'), L('Reefer', 'مبرّدة')], 1, L('Second character is height; 5 = 9′6″.', 'الخانة الثانية للارتفاع؛ 5 = 9′6″.')),
      Q(L('A vessel discharges 300 × 20′ and 250 × 40′. How many TEU?', 'سفينة تفرّغ 300 × 20′ و250 × 40′. كم TEU؟'), [L('550', '550'), L('800', '800'), L('850', '850'), L('1,100', '1,100')], 1, L('300 + 250×2 = 800 TEU (550 moves).', '300 + 250×2 = 800 TEU (550 حركة).')),
      Q(L('Payload of a 40′ HC with tare 3,900 kg and max gross 30,480 kg?', 'الحمولة الصافية لحاوية 40′ عالية وزنها الفارغ 3,900 كغ وأقصى وزن إجمالي 30,480 كغ؟'), [L('26,580 kg', '26,580 كغ'), L('30,480 kg', '30,480 كغ'), L('34,380 kg', '34,380 كغ'), L('28,000 kg', '28,000 كغ')], 0, L('30,480 − 3,900 = 26,580 kg.', '30,480 − 3,900 = 26,580 كغ.')),
      Q(L('Equipment category letter for a standard freight container?', 'حرف فئة المعدّة لحاوية شحن قياسية؟'), [L('J', 'J'), L('Z', 'Z'), L('U', 'U'), L('C', 'C')], 2, L('U = freight container.', 'U = حاوية شحن.')),
    ],
  });

  add({
    id: 'equipment', lvl: 1, icon: '🏗', min: 14,
    title: L('Terminal layout & handling equipment', 'تخطيط المحطة ومعدّات المناولة'),
    sub: L('Quay, apron, yard, gate, CFS — STS, RTG, RMG, straddle carriers, reach stackers, tractors.', 'الرصيف، منطقة الإسناد، الساحة، البوابة، محطة التجميع — رافعات STS وRTG وRMG والناقلات الممتدّة والريتش ستاكر والجرّارات.'),
    body: L(`
<h3>The four zones of a container terminal</h3>
<ol>
<li><b>Quayside (seaside)</b>: berths, apron and STS cranes — the most expensive asset; its productivity sets the ship's port stay.</li>
<li><b>Horizontal transport</b>: terminal tractors + trailers (ITVs), straddle carriers or AGVs between quay and yard.</li>
<li><b>Yard (storage)</b>: blocks of stacks served by RTG/RMG, reach stackers or straddle carriers; separate zones for reefer, DG, empties, OOG.</li>
<li><b>Landside</b>: truck gate, rail siding, CFS (container freight station for LCL stuffing/stripping), inspection area.</li>
</ol>
<h3>Equipment</h3>
<div class="table-wrap"><table><thead><tr><th>Equipment</th><th>Use</th><th>Typical productivity</th></tr></thead><tbody>
<tr><td><b>STS (ship-to-shore) gantry crane</b></td><td>Loads/discharges vessels; outreach up to 24–25 rows</td><td>25–35 moves/hour (gross); twin-lift/tandem higher</td></tr>
<tr><td><b>RTG</b> (rubber-tyred gantry)</td><td>Yard stacking, e.g. 6 rows + truck lane, 1-over-5</td><td>15–25 moves/hour</td></tr>
<tr><td><b>RMG / ASC</b> (rail-mounted, often automated)</td><td>High-density yard blocks, rail terminals</td><td>20–30 moves/hour</td></tr>
<tr><td><b>Straddle carrier</b></td><td>Carries and stacks 1-over-2/3; quay ↔ yard</td><td>Flexible, low density</td></tr>
<tr><td><b>Reach stacker</b></td><td>Small terminals, empties, depots, rail</td><td>Cheap, flexible; low density, high rehandles</td></tr>
<tr><td><b>Empty container handler (ECH)</b></td><td>Stacks empties up to 7–8 high</td><td>Depots</td></tr>
<tr><td><b>Terminal tractor + trailer</b></td><td>Horizontal transport quay ↔ yard</td><td>4–6 per STS crane typically</td></tr>
</tbody></table></div>
<h3>Stacking notation “1-over-5”</h3>
<p>An RTG “1-over-5” can stack 5 high and still pass a 6th box over the top. Higher stacks = more capacity but more <b>rehandles</b> (unproductive moves).</p>
<h3>Spreaders & lifting modes</h3>
<ul>
<li><b>Single lift</b>: one 20′ or one 40′.</li>
<li><b>Twin lift</b>: two 20′ end-to-end in one move.</li>
<li><b>Tandem lift</b>: two 40′ side by side (2–4 TEU per move).</li>
<li><b>OOG</b>: overheight frames, slings, sometimes the ship's own gear.</li>
</ul>
<div class="ex" data-t="Rule of thumb">Plan <b>4–6 tractors per working STS crane</b> depending on distance to yard. Too few → cranes wait (“starving”); too many → congestion under the crane.</div>`,
`
<h3>المناطق الأربع لمحطة الحاويات</h3>
<ol>
<li><b>جهة الرصيف (البحرية)</b>: الأرصفة ومنطقة الإسناد ورافعات STS — أغلى أصل؛ إنتاجيتها تحدّد مدة بقاء السفينة.</li>
<li><b>النقل الأفقي</b>: جرّارات المحطة مع مقطورات (ITV)، أو ناقلات ممتدّة، أو مركبات ذاتية القيادة AGV بين الرصيف والساحة.</li>
<li><b>الساحة (التخزين)</b>: كتل من الرصّات تخدمها رافعات RTG/RMG أو ريتش ستاكر أو ناقلات ممتدّة؛ مع مناطق منفصلة للمبرّدات والخطرة والفارغ وخارج المقاس.</li>
<li><b>جهة البر</b>: بوابة الشاحنات، خط السكة الحديد، محطة CFS (لتجميع/تفريغ الشحنات الجزئية)، منطقة المعاينة.</li>
</ol>
<h3>المعدّات</h3>
<div class="table-wrap"><table><thead><tr><th>المعدّة</th><th>الاستخدام</th><th>الإنتاجية النموذجية</th></tr></thead><tbody>
<tr><td><b>رافعة الرصيف STS</b></td><td>تحميل وتفريغ السفن؛ مدى حتى 24–25 صفًا</td><td>25–35 حركة/ساعة (إجمالي)؛ أعلى مع الرفع المزدوج</td></tr>
<tr><td><b>RTG</b> (رافعة جسرية بإطارات)</td><td>الرصّ في الساحة، مثلًا 6 صفوف + مسار شاحنة، 1 فوق 5</td><td>15–25 حركة/ساعة</td></tr>
<tr><td><b>RMG / ASC</b> (على سكك، غالبًا مؤتمتة)</td><td>كتل ساحة عالية الكثافة، محطات السكك</td><td>20–30 حركة/ساعة</td></tr>
<tr><td><b>الناقلة الممتدّة (Straddle)</b></td><td>تحمل وترصّ 1 فوق 2/3؛ رصيف ↔ ساحة</td><td>مرنة، كثافة منخفضة</td></tr>
<tr><td><b>ريتش ستاكر</b></td><td>المحطات الصغيرة، الفارغ، المستودعات، السكك</td><td>رخيصة ومرنة؛ كثافة منخفضة وإعادة مناولة عالية</td></tr>
<tr><td><b>رافعة الفارغ (ECH)</b></td><td>ترصّ الفارغ حتى 7–8 طبقات</td><td>المستودعات</td></tr>
<tr><td><b>جرّار المحطة + مقطورة</b></td><td>النقل الأفقي رصيف ↔ ساحة</td><td>عادةً 4–6 لكل رافعة رصيف</td></tr>
</tbody></table></div>
<h3>مصطلح الرصّ “1 فوق 5”</h3>
<p>رافعة RTG “1 فوق 5” ترصّ 5 طبقات ويمكنها تمرير حاوية سادسة فوقها. الرصّات الأعلى = سعة أكبر لكن <b>إعادة مناولة</b> أكثر (حركات غير منتجة).</p>
<h3>أدوات الرفع وأنماطه</h3>
<ul>
<li><b>رفع مفرد</b>: حاوية 20′ واحدة أو 40′ واحدة.</li>
<li><b>رفع مزدوج (Twin)</b>: حاويتا 20′ طرفًا لطرف في حركة واحدة.</li>
<li><b>رفع ترادفي (Tandem)</b>: حاويتا 40′ جنبًا إلى جنب (2–4 TEU لكل حركة).</li>
<li><b>خارج المقاس OOG</b>: إطارات للارتفاع الزائد، حبال، وأحيانًا روافع السفينة نفسها.</li>
</ul>
<div class="ex" data-t="قاعدة عملية">خطّط لـ <b>4–6 جرّارات لكل رافعة رصيف عاملة</b> حسب المسافة إلى الساحة. أقلّ ← الرافعات تنتظر (“تجويع”)؛ أكثر ← ازدحام تحت الرافعة.</div>`),
    keys: [L('STS productivity drives vessel time in port.', 'إنتاجية رافعات الرصيف تحدّد مدة بقاء السفينة.'), L('Higher stacks = more capacity but more rehandles.', 'رصّات أعلى = سعة أكبر لكن إعادة مناولة أكثر.'), L('Balance tractors per crane: avoid starving or congestion.', 'وازن عدد الجرّارات لكل رافعة: تجنّب التجويع أو الازدحام.')],
    senior: L('When a crane underperforms, look at the whole chain: was it waiting for tractors, for the yard RTG, for lashing, or for a hatch cover? The bottleneck is rarely the crane driver.', 'عندما تنخفض إنتاجية رافعة، انظر إلى السلسلة كاملة: هل كانت تنتظر الجرّارات، أم رافعة الساحة، أم التثبيت، أم غطاء العنبر؟ نادرًا ما يكون السائق هو عنق الزجاجة.'),
    quiz: [
      Q(L('A twin-lift moves…', 'الرفع المزدوج ينقل…'), [L('Two 40′ side by side', 'حاويتي 40′ جنبًا إلى جنب'), L('Two 20′ end-to-end', 'حاويتي 20′ طرفًا لطرف'), L('One 45′', 'حاوية 45′ واحدة'), L('Hatch cover + box', 'غطاء عنبر + حاوية')], 1, L('Twin = two 20′; tandem = two 40′ side by side.', 'المزدوج = حاويتا 20′؛ الترادفي = حاويتا 40′ جنبًا إلى جنب.')),
      Q(L('Crane “starving” means…', '“تجويع” الرافعة يعني…'), [L('No power', 'لا كهرباء'), L('Waiting for horizontal transport', 'تنتظر النقل الأفقي'), L('Driver break', 'استراحة السائق'), L('Overload', 'حمولة زائدة')], 1, L('The crane is idle because tractors do not arrive in time.', 'الرافعة متوقفة لأن الجرّارات لا تصل في الوقت المناسب.')),
      Q(L('Which equipment gives the highest yard density?', 'أي معدّة تعطي أعلى كثافة في الساحة؟'), [L('Reach stacker', 'ريتش ستاكر'), L('Straddle carrier', 'ناقلة ممتدّة'), L('RMG/ASC', 'RMG/ASC'), L('Forklift', 'رافعة شوكية')], 2, L('Rail-mounted gantries stack wide and high in dense blocks.', 'الرافعات على السكك ترصّ بعرض وارتفاع في كتل كثيفة.')),
      Q(L('A CFS is used for…', 'تُستخدم محطة CFS لـ…'), [L('Crane maintenance', 'صيانة الرافعات'), L('LCL stuffing and stripping', 'تعبئة وتفريغ الشحنات الجزئية LCL'), L('Customs scanning only', 'الفحص الجمركي فقط'), L('Reefer PTI', 'فحص PTI للمبرّدات')], 1, L('Container Freight Station = consolidation/deconsolidation of LCL.', 'محطة الشحن بالحاويات = تجميع وتفكيك الشحنات الجزئية.')),
    ],
  });

  add({
    id: 'documents', lvl: 1, icon: '🧾', min: 16,
    title: L('Port documents & EDI messages', 'مستندات الميناء ورسائل EDI'),
    sub: L('Manifest, B/L, D/O, EIR, and the EDIFACT messages BAPLIE, MOVINS, COPRAR, COARRI, CODECO, VERMAS.', 'المانيفست، البوليصة، إذن التسليم، EIR، ورسائل EDIFACT: BAPLIE وMOVINS وCOPRAR وCOARRI وCODECO وVERMAS.'),
    body: L(`
<h3>Paper (or PDF) documents</h3>
<div class="table-wrap"><table><thead><tr><th>Document</th><th>Issued by</th><th>Purpose at the terminal</th></tr></thead><tbody>
<tr><td><b>Cargo manifest</b></td><td>Carrier / agent</td><td>List of all cargo on board; filed with customs before arrival</td></tr>
<tr><td><b>Bill of Lading</b></td><td>Carrier</td><td>Title to goods; the terminal doesn't release against it directly</td></tr>
<tr><td><b>Delivery Order (D/O)</b></td><td>Carrier/agent</td><td>Authorises the terminal to deliver an import box to the named party</td></tr>
<tr><td><b>Customs release</b></td><td>Customs</td><td>No release → no gate-out</td></tr>
<tr><td><b>EIR / Interchange receipt</b></td><td>Terminal / depot</td><td>Records container condition & seal at hand-over (gate in/out). Basis of damage claims</td></tr>
<tr><td><b>Dangerous goods declaration</b></td><td>Shipper</td><td>IMDG class, UN number; needed before gate-in</td></tr>
<tr><td><b>Statement of Facts (SOF)</b></td><td>Agent / terminal</td><td>Timeline of the vessel call (arrival, NOR, berthing, ops start/end, departure)</td></tr>
</tbody></table></div>
<h3>EDI (UN/EDIFACT) messages — the terminal's language</h3>
<div class="table-wrap"><table><thead><tr><th>Message</th><th>From → To</th><th>Content</th></tr></thead><tbody>
<tr><td class="mono">BAPLIE</td><td>Line/previous port → terminal</td><td>Bay plan: what is on board and where (slot by slot)</td></tr>
<tr><td class="mono">MOVINS</td><td>Line stowage centre → terminal</td><td>Stowage instructions for loading</td></tr>
<tr><td class="mono">COPRAR</td><td>Line → terminal</td><td>Load / discharge order lists</td></tr>
<tr><td class="mono">COARRI</td><td>Terminal → line</td><td>Discharge/load report (what was actually done)</td></tr>
<tr><td class="mono">CODECO</td><td>Terminal/depot → line</td><td>Gate-in / gate-out report</td></tr>
<tr><td class="mono">COPARN</td><td>Line → terminal/depot</td><td>Container pre-announcement / release order for empties</td></tr>
<tr><td class="mono">VERMAS</td><td>Shipper/forwarder → line/terminal</td><td>VGM (verified gross mass)</td></tr>
<tr><td class="mono">IFTMIN / IFTSTA</td><td>Forwarder ↔ carrier</td><td>Booking instructions / status</td></tr>
</tbody></table></div>
<h3>TOS & PCS</h3>
<p>The <b>Terminal Operating System</b> (TOS — e.g. Navis N4, Tideworks, CyberLogitec, Kaleris…) is the brain: it receives these EDI messages and drives planning, equipment jobs and billing. A <b>Port Community System</b> (PCS) connects all stakeholders (customs, agents, hauliers) on one platform.</p>
<div class="ex" data-t="Daily flow">Line sends COPRAR (load list) + MOVINS → planner builds stowage plan → cranes execute → TOS sends COARRI and an updated BAPLIE to the line and the next port.</div>`,
`
<h3>المستندات الورقية (أو PDF)</h3>
<div class="table-wrap"><table><thead><tr><th>المستند</th><th>يصدره</th><th>الغرض في المحطة</th></tr></thead><tbody>
<tr><td><b>مانيفست البضائع</b></td><td>الناقل / الوكيل</td><td>قائمة كل البضائع على السفينة؛ يُقدَّم للجمارك قبل الوصول</td></tr>
<tr><td><b>بوليصة الشحن</b></td><td>الناقل</td><td>سند ملكية البضاعة؛ المحطة لا تُفرج بموجبها مباشرة</td></tr>
<tr><td><b>إذن التسليم (D/O)</b></td><td>الناقل/الوكيل</td><td>يفوّض المحطة بتسليم حاوية الاستيراد للطرف المسمّى</td></tr>
<tr><td><b>إفراج جمركي</b></td><td>الجمارك</td><td>لا إفراج ← لا خروج من البوابة</td></tr>
<tr><td><b>EIR / إيصال التسليم والاستلام</b></td><td>المحطة / المستودع</td><td>يسجّل حالة الحاوية والختم عند التسليم (دخول/خروج). أساس مطالبات الأضرار</td></tr>
<tr><td><b>بيان البضائع الخطرة</b></td><td>الشاحن</td><td>فئة IMDG، رقم UN؛ مطلوب قبل الدخول</td></tr>
<tr><td><b>بيان الوقائع (SOF)</b></td><td>الوكيل / المحطة</td><td>الجدول الزمني لزيارة السفينة (الوصول، إشعار الجاهزية، الرسو، بدء/انتهاء العمل، المغادرة)</td></tr>
</tbody></table></div>
<h3>رسائل EDI (UN/EDIFACT) — لغة المحطة</h3>
<div class="table-wrap"><table><thead><tr><th>الرسالة</th><th>من ← إلى</th><th>المحتوى</th></tr></thead><tbody>
<tr><td class="mono">BAPLIE</td><td>الخط/الميناء السابق ← المحطة</td><td>خطة الخلجان: ما على السفينة وأين (خانة بخانة)</td></tr>
<tr><td class="mono">MOVINS</td><td>مركز رصّ الخط ← المحطة</td><td>تعليمات الرصّ للتحميل</td></tr>
<tr><td class="mono">COPRAR</td><td>الخط ← المحطة</td><td>قوائم أوامر التحميل / التفريغ</td></tr>
<tr><td class="mono">COARRI</td><td>المحطة ← الخط</td><td>تقرير التفريغ/التحميل (ما تمّ فعليًا)</td></tr>
<tr><td class="mono">CODECO</td><td>المحطة/المستودع ← الخط</td><td>تقرير الدخول/الخروج من البوابة</td></tr>
<tr><td class="mono">COPARN</td><td>الخط ← المحطة/المستودع</td><td>إشعار مسبق بالحاوية / أمر إطلاق الفارغ</td></tr>
<tr><td class="mono">VERMAS</td><td>الشاحن/وكيل الشحن ← الخط/المحطة</td><td>الوزن الإجمالي المُتحقَّق منه VGM</td></tr>
<tr><td class="mono">IFTMIN / IFTSTA</td><td>وكيل الشحن ↔ الناقل</td><td>تعليمات الحجز / الحالة</td></tr>
</tbody></table></div>
<h3>نظام TOS و PCS</h3>
<p><b>نظام تشغيل المحطة</b> (TOS — مثل Navis N4 وTideworks وCyberLogitec وKaleris…) هو العقل: يستقبل رسائل EDI ويقود التخطيط ومهام المعدّات والفوترة. و<b>نظام مجتمع الميناء</b> (PCS) يربط جميع الأطراف (الجمارك، الوكلاء، الناقلين البريين) على منصّة واحدة.</p>
<div class="ex" data-t="التدفّق اليومي">الخط يرسل COPRAR (قائمة التحميل) + MOVINS ← المخطّط يبني خطة الرصّ ← الرافعات تنفّذ ← نظام TOS يرسل COARRI وBAPLIE محدّثة للخط وللميناء التالي.</div>`),
    keys: [L('BAPLIE = bay plan; COPRAR = load/discharge list; COARRI = what was done; CODECO = gate moves.', 'BAPLIE = خطة الخلجان؛ COPRAR = قائمة تحميل/تفريغ؛ COARRI = ما تمّ؛ CODECO = حركات البوابة.'), L('The EIR protects you in damage disputes.', 'إيصال EIR يحميك في نزاعات الأضرار.'), L('Release needs D/O + customs release + paid charges.', 'الإفراج يحتاج إذن تسليم + إفراج جمركي + دفع الرسوم.')],
    senior: L('Before each vessel, reconcile BAPLIE (what the ship says) with COPRAR (what the line asks) and the yard inventory (what you have). Most loading disasters start with an un-reconciled list.', 'قبل كل سفينة، طابق BAPLIE (ما تقوله السفينة) مع COPRAR (ما يطلبه الخط) ومخزون الساحة (ما لديك). معظم كوارث التحميل تبدأ بقائمة غير مُطابقة.'),
    quiz: [
      Q(L('Which message tells the terminal what is on board and in which slot?', 'أي رسالة تخبر المحطة بما على السفينة وفي أي خانة؟'), [L('CODECO', 'CODECO'), L('BAPLIE', 'BAPLIE'), L('VERMAS', 'VERMAS'), L('IFTMIN', 'IFTMIN')], 1, L('BAPLIE is the bay plan.', 'BAPLIE هي خطة الخلجان.')),
      Q(L('The terminal reports gate-in/out to the line with…', 'تبلّغ المحطة الخط بالدخول/الخروج عبر…'), [L('COARRI', 'COARRI'), L('CODECO', 'CODECO'), L('COPRAR', 'COPRAR'), L('MOVINS', 'MOVINS')], 1, L('CODECO = gate report. COARRI = vessel report.', 'CODECO = تقرير البوابة. COARRI = تقرير السفينة.')),
      Q(L('Which document records the box condition at hand-over?', 'أي مستند يسجّل حالة الحاوية عند التسليم؟'), [L('Manifest', 'المانيفست'), L('EIR', 'EIR'), L('SOF', 'SOF'), L('D/O', 'إذن التسليم')], 1, L('Equipment Interchange Receipt.', 'إيصال تبادل المعدّات.')),
      Q(L('An import box can leave the gate when…', 'يمكن لحاوية الاستيراد الخروج من البوابة عندما…'), [L('The B/L is shown', 'تُبرز البوليصة'), L('D/O + customs release + charges paid', 'إذن تسليم + إفراج جمركي + دفع الرسوم'), L('The truck has an appointment only', 'للشاحنة موعد فقط'), L('The vessel has sailed', 'تكون السفينة قد أبحرت')], 1, L('Commercial, regulatory and financial release are all needed.', 'يلزم الإفراج التجاري والرقابي والمالي معًا.')),
    ],
  });

  /* =========================================================== LEVEL 2 */
  add({
    id: 'arrival', lvl: 2, icon: '📡', min: 18,
    title: L('Vessel arrival: from ETA to all-fast', 'وصول السفينة: من الموعد المتوقّع حتى الربط الكامل'),
    sub: L('Pre-arrival notices, clearance, anchorage, pilot, tugs, mooring, NOR and the SOF timeline.', 'إشعارات ما قبل الوصول، التصاريح، المخطاف، المرشد، القاطرات، الربط، إشعار الجاهزية وجدول SOF.'),
    body: L(`
<h3>The arrival timeline</h3>
<ol>
<li><b>Long-term schedule / berth window</b>: weekly services get a fixed window (e.g. every Tuesday 06:00, 30 h).</li>
<li><b>Pre-arrival notices</b> by the agent: typically <b>72 h, 48 h, 24 h</b> before arrival — ETA, drafts, crew/passengers, ISPS security info, waste, DG on board, IMO FAL forms.</li>
<li><b>Port clearance / free pratique</b>: health and immigration; maritime declaration of health.</li>
<li><b>ETA confirmation & berth confirmation</b> by the terminal (berthing time + cranes).</li>
<li><b>Arrival at pilot station / anchorage</b>: if berth not ready, vessel anchors (waiting time!).</li>
<li><b>NOR (Notice of Readiness)</b> tendered by the master — important for laytime in charter parties.</li>
<li><b>Pilot on board (POB)</b> → <b>tugs fast</b> → <b>first line ashore</b> → <b>all fast</b> (moored).</li>
<li><b>Gangway down, lashing gangs on board, ops start</b> (first move).</li>
</ol>
<h3>Key times recorded in the Statement of Facts</h3>
<div class="table-wrap"><table><thead><tr><th>Event</th><th>Abbrev.</th></tr></thead><tbody>
<tr><td>End of sea passage / arrived pilot station</td><td>EOSP / APS</td></tr>
<tr><td>Anchored / anchor aweigh</td><td>—</td></tr>
<tr><td>Pilot on board</td><td>POB</td></tr>
<tr><td>All fast (berthed)</td><td>ATB (actual time of berthing)</td></tr>
<tr><td>Commenced / completed operations</td><td>—</td></tr>
<tr><td>Unmoored / departed</td><td>ATD</td></tr>
</tbody></table></div>
<h3>Marine services planning</h3>
<ul>
<li><b>Pilotage</b> is compulsory above a size (e.g. GT &gt; 500). Book with the pilot station 2–4 h before.</li>
<li><b>Tugs</b>: number depends on LOA, wind and bow thruster. ULCVs often need 3–4 tugs.</li>
<li><b>Mooring gang</b> on the quay; mooring line plan (head, breast, spring, stern lines).</li>
<li><b>Wind limits</b>: berthing often stopped above ~25–30 knots for big ships.</li>
</ul>
<h3>Arrival performance</h3>
<div class="formula">Waiting time = ATB − arrival at anchorage (or berth-window start, whichever later)
Schedule reliability = vessels arriving within ±window ÷ total calls</div>
<div class="ex" data-t="Example">BMS ADRIATIC arrives at anchorage 02:00, the berth is free at 06:30, pilot boards 05:15, all fast 06:40. Waiting time = 4 h 40 min. If its window started 06:00, the line will say the port was <b>on time</b> (only 40 min late against the window).</div>`,
`
<h3>الجدول الزمني للوصول</h3>
<ol>
<li><b>الجدول طويل الأمد / نافذة الرسو</b>: الخطوط الأسبوعية تحصل على نافذة ثابتة (مثلًا كل ثلاثاء 06:00 لمدة 30 ساعة).</li>
<li><b>إشعارات ما قبل الوصول</b> من الوكيل: عادةً <b>72، 48، 24 ساعة</b> قبل الوصول — الموعد المتوقّع، الغواطس، الطاقم/الركّاب، معلومات أمن ISPS، النفايات، البضائع الخطرة، نماذج IMO FAL.</li>
<li><b>تصريح الميناء / الإذن الصحي (Free pratique)</b>: الصحة والهجرة؛ الإقرار الصحي البحري.</li>
<li><b>تأكيد الموعد والرصيف</b> من المحطة (وقت الرسو + الرافعات).</li>
<li><b>الوصول لمحطة الإرشاد / المخطاف</b>: إن لم يكن الرصيف جاهزًا، ترسو السفينة على المخطاف (وقت انتظار!).</li>
<li><b>NOR (إشعار الجاهزية)</b> يقدّمه الربّان — مهمّ لحساب زمن الرسو في عقود الإيجار.</li>
<li><b>صعود المرشد (POB)</b> ← <b>ربط القاطرات</b> ← <b>أول حبل على الرصيف</b> ← <b>الربط الكامل (All fast)</b>.</li>
<li><b>إنزال السلّم، صعود فرق التثبيت، بدء العمليات</b> (أول حركة).</li>
</ol>
<h3>الأوقات الرئيسية المسجّلة في بيان الوقائع</h3>
<div class="table-wrap"><table><thead><tr><th>الحدث</th><th>الاختصار</th></tr></thead><tbody>
<tr><td>نهاية الرحلة البحرية / الوصول لمحطة الإرشاد</td><td>EOSP / APS</td></tr>
<tr><td>الرسو على المخطاف / رفع المخطاف</td><td>—</td></tr>
<tr><td>صعود المرشد</td><td>POB</td></tr>
<tr><td>الربط الكامل (الرسو)</td><td>ATB (وقت الرسو الفعلي)</td></tr>
<tr><td>بدء / انتهاء العمليات</td><td>—</td></tr>
<tr><td>فكّ الربط / المغادرة</td><td>ATD</td></tr>
</tbody></table></div>
<h3>تخطيط الخدمات البحرية</h3>
<ul>
<li><b>الإرشاد</b> إلزامي فوق حجم معيّن (مثلًا GT &gt; 500). احجز مع محطة الإرشاد قبل 2–4 ساعات.</li>
<li><b>القاطرات</b>: العدد يعتمد على الطول والرياح ووجود دافع المقدّمة. السفن العملاقة تحتاج غالبًا 3–4 قاطرات.</li>
<li><b>فريق الربط</b> على الرصيف؛ خطة حبال الربط (حبال المقدّمة، العرضية، الزنبركية، المؤخّرة).</li>
<li><b>حدود الرياح</b>: يتوقّف الرسو غالبًا فوق ~25–30 عقدة للسفن الكبيرة.</li>
</ul>
<h3>أداء الوصول</h3>
<div class="formula">Waiting time = ATB − arrival at anchorage (or berth-window start, whichever later)
Schedule reliability = vessels arriving within ±window ÷ total calls</div>
<div class="ex" data-t="مثال">تصل BMS ADRIATIC إلى المخطاف 02:00، والرصيف يفرغ 06:30، يصعد المرشد 05:15، والربط الكامل 06:40. وقت الانتظار = 4 ساعات و40 دقيقة. إن كانت نافذتها تبدأ 06:00 فسيعتبر الخط أن الميناء كان <b>في الموعد</b> (تأخّر 40 دقيقة فقط عن النافذة).</div>`),
    keys: [L('72/48/24 h pre-arrival notices.', 'إشعارات ما قبل الوصول 72/48/24 ساعة.'), L('POB → all fast → first move: each is a recorded time.', 'صعود المرشد ← الربط الكامل ← أول حركة: كلٌّ منها وقت مسجّل.'), L('Waiting time is measured against the window for window vessels.', 'وقت الانتظار يُقاس مقابل النافذة لسفن النوافذ.')],
    senior: L('Call the line’s ops desk the moment an ETA slips more than 2 hours. Re-planning cranes and gangs 12 hours ahead costs nothing; re-planning 1 hour ahead costs a shift.', 'اتّصل بمكتب عمليات الخط فور تأخّر الموعد المتوقّع أكثر من ساعتين. إعادة تخطيط الرافعات والفرق قبل 12 ساعة لا تكلّف شيئًا؛ وقبل ساعة تكلّف وردية كاملة.'),
    quiz: [
      Q(L('“All fast” means…', '“الربط الكامل” يعني…'), [L('Pilot on board', 'صعود المرشد'), L('The vessel is fully moored', 'السفينة مربوطة بالكامل'), L('Operations completed', 'انتهت العمليات'), L('Tugs released after departure', 'تحرير القاطرات بعد المغادرة')], 1, L('All mooring lines are secured — Actual Time of Berthing.', 'تمّ تثبيت كل حبال الربط — وقت الرسو الفعلي.')),
      Q(L('Typical pre-arrival notice schedule?', 'الجدول المعتاد لإشعارات ما قبل الوصول؟'), [L('7 days only', '7 أيام فقط'), L('72/48/24 hours', '72/48/24 ساعة'), L('On arrival', 'عند الوصول'), L('After berthing', 'بعد الرسو')], 1, L('Agents update ETA and details at 72, 48 and 24 h.', 'يحدّث الوكلاء الموعد والتفاصيل عند 72 و48 و24 ساعة.')),
      Q(L('The NOR is tendered by…', 'إشعار الجاهزية يقدّمه…'), [L('The terminal', 'المحطة'), L('The master of the vessel', 'ربّان السفينة'), L('Customs', 'الجمارك'), L('The pilot', 'المرشد')], 1, L('The master declares the vessel ready to work cargo.', 'يعلن الربّان أن السفينة جاهزة للعمل على البضائع.')),
      Q(L('A window vessel arrives 10 h early and waits 8 h. Against the window it is…', 'سفينة نافذة تصل قبل 10 ساعات وتنتظر 8 ساعات. مقابل النافذة هي…'), [L('8 h late', 'متأخّرة 8 ساعات'), L('Not delayed by the port', 'غير متأخّرة بسبب الميناء'), L('2 h late', 'متأخّرة ساعتين'), L('Off-window and penalised', 'خارج النافذة ومعاقَبة')], 1, L('It berthed 2 h before its window start, so the port did not delay it.', 'رست قبل بداية نافذتها بساعتين، فالميناء لم يؤخّرها.')),
    ],
  });

  add({
    id: 'ukc', lvl: 2, icon: '🌊', min: 14,
    title: L('Draft, tides & under-keel clearance', 'الغاطس والمد وعمق الأمان تحت القاع'),
    sub: L('Chart datum, tide height, squat, UKC policy and tidal windows.', 'مستوى الخريطة، ارتفاع المد، الهبوط الديناميكي (Squat)، سياسة UKC ونوافذ المد.'),
    body: L(`
<h3>Why depth is a safety-critical decision</h3>
<p>Grounding a vessel can close a channel for days. The port defines a minimum <b>Under-Keel Clearance (UKC)</b> — the water between the keel and the seabed.</p>
<div class="formula">Available depth = Charted depth (below chart datum) + Tide height
Static UKC  = Available depth − Draft
Dynamic UKC = Static UKC − Squat − (wave/heel allowances)</div>
<h3>Typical UKC policies</h3>
<ul>
<li>Inside harbour, at berth: <b>≥ 0.5 m</b> or 5–10% of draft.</li>
<li>Approach channel, moving: <b>10–15% of draft</b> (squat + waves).</li>
<li>Open sea approach in swell: up to 20%.</li>
</ul>
<h3>Squat</h3>
<p>A moving ship sinks deeper (and trims). A simple approximation for confined channels:</p>
<div class="formula">Squat (m) ≈ Cb × V² / 100     (V in knots, Cb = block coefficient ≈ 0.6–0.7 for container ships)</div>
<div class="ex" data-t="Worked example">Channel 14.2 m below CD, tide +0.5 m, ship draft 13.6 m, speed 8 kn, Cb 0.65.<br>Available = 14.7 m. Static UKC = 1.1 m. Squat ≈ 0.65 × 64 / 100 = 0.42 m. Dynamic UKC = 0.68 m. Policy 10% × 13.6 = 1.36 m → <b>NOT OK</b> — reduce speed or wait for a higher tide, or the line must reduce draft (load less).</div>
<h3>Tidal windows</h3>
<p>Deep-draft vessels may only enter/leave around high water. This drives berth planning: a vessel finishing at low water may have to wait at berth (blocking the next ship) — so planners schedule departure to match the tide.</p>
<h3>Water density</h3>
<p>Fresh water (1.000) vs sea water (1.025): a ship sits deeper in fresh/brackish water (FWA — fresh water allowance). Important in river ports.</p>`,
`
<h3>لماذا العمق قرار حرج للسلامة</h3>
<p>جنوح سفينة قد يغلق القناة لأيام. يحدّد الميناء حدًّا أدنى لـ <b>عمق الأمان تحت القاع (UKC)</b> — الماء بين قاع السفينة وقاع البحر.</p>
<div class="formula">Available depth = Charted depth (below chart datum) + Tide height
Static UKC  = Available depth − Draft
Dynamic UKC = Static UKC − Squat − (wave/heel allowances)</div>
<h3>سياسات UKC النموذجية</h3>
<ul>
<li>داخل الميناء، عند الرصيف: <b>≥ 0.5 م</b> أو 5–10% من الغاطس.</li>
<li>قناة الاقتراب أثناء الحركة: <b>10–15% من الغاطس</b> (الهبوط + الأمواج).</li>
<li>الاقتراب من البحر المفتوح مع أمواج: حتى 20%.</li>
</ul>
<h3>الهبوط الديناميكي (Squat)</h3>
<p>السفينة المتحرّكة تغطس أعمق (وتميل طوليًا). تقريب بسيط للقنوات الضيقة:</p>
<div class="formula">Squat (m) ≈ Cb × V² / 100     (V in knots, Cb = block coefficient ≈ 0.6–0.7 for container ships)</div>
<div class="ex" data-t="مثال محلول">القناة 14.2 م تحت مستوى الخريطة، المد +0.5 م، غاطس السفينة 13.6 م، السرعة 8 عقد، Cb = 0.65.<br>العمق المتاح = 14.7 م. UKC الساكن = 1.1 م. الهبوط ≈ 0.65 × 64 / 100 = 0.42 م. UKC الديناميكي = 0.68 م. السياسة 10% × 13.6 = 1.36 م ← <b>غير مقبول</b> — خفّض السرعة أو انتظر مدًّا أعلى، أو على الخط تخفيض الغاطس (تحميل أقل).</div>
<h3>نوافذ المد</h3>
<p>السفن العميقة الغاطس قد لا تدخل/تخرج إلا قرب المد العالي. هذا يقود تخطيط الأرصفة: سفينة تنهي عملها عند الجزر قد تضطر للانتظار على الرصيف (فتحجب السفينة التالية) — لذا يجدول المخطّطون المغادرة لتتوافق مع المد.</p>
<h3>كثافة المياه</h3>
<p>المياه العذبة (1.000) مقابل مياه البحر (1.025): السفينة تغطس أكثر في المياه العذبة/قليلة الملوحة (FWA — سماح المياه العذبة). مهمّ في موانئ الأنهار.</p>`),
    keys: [L('UKC = charted depth + tide − draft − squat.', 'UKC = عمق الخريطة + المد − الغاطس − الهبوط.'), L('Squat grows with the square of speed.', 'الهبوط يزداد مع مربّع السرعة.'), L('Departure draft + tide decides the departure time.', 'غاطس المغادرة + المد يحدّدان وقت المغادرة.')],
    senior: L('Never let commercial pressure override the UKC policy. Say it calmly: “The Harbour Master policy is 10%; I can give you the 14:30 high water slot instead.” Offer a solution, not just a no.', 'لا تسمح أبدًا للضغط التجاري بتجاوز سياسة UKC. قلها بهدوء: “سياسة قبطان الميناء 10%؛ أستطيع إعطاءك نافذة المد العالي الساعة 14:30 بدلًا من ذلك.” قدّم حلًّا لا مجرّد رفض.'),
    quiz: [
      Q(L('Depth 15.0 m CD, tide +0.4, draft 14.2 m. Static UKC?', 'العمق 15.0 م، المد +0.4، الغاطس 14.2 م. UKC الساكن؟'), [L('0.8 m', '0.8 م'), L('1.2 m', '1.2 م'), L('0.4 m', '0.4 م'), L('1.6 m', '1.6 م')], 1, L('15.0 + 0.4 − 14.2 = 1.2 m.', '15.0 + 0.4 − 14.2 = 1.2 م.')),
      Q(L('If speed doubles, squat roughly…', 'إذا تضاعفت السرعة، فإن الهبوط تقريبًا…'), [L('Doubles', 'يتضاعف'), L('Quadruples', 'يتضاعف أربع مرات'), L('Stays the same', 'يبقى كما هو'), L('Halves', 'ينخفض للنصف')], 1, L('Squat ∝ V².', 'الهبوط يتناسب مع V².')),
      Q(L('Which draft matters most for the departure tide window?', 'أي غاطس هو الأهمّ لنافذة مد المغادرة؟'), [L('Arrival draft', 'غاطس الوصول'), L('Departure draft', 'غاطس المغادرة'), L('Air draft', 'الارتفاع الهوائي'), L('Light-ship draft', 'غاطس السفينة الفارغة')], 1, L('After loading, the ship is deeper.', 'بعد التحميل تصبح السفينة أعمق.')),
      Q(L('A ship sits deeper in…', 'السفينة تغطس أكثر في…'), [L('Sea water', 'مياه البحر'), L('Fresh water', 'المياه العذبة'), L('Cold water only', 'المياه الباردة فقط'), L('No difference', 'لا فرق')], 1, L('Lower density gives less buoyancy.', 'كثافة أقل تعطي طفوًا أقل.')),
    ],
  });

  add({
    id: 'berth', lvl: 2, icon: '🗓', min: 20,
    title: L('Berth planning & berth windows', 'تخطيط الأرصفة ونوافذ الرسو'),
    sub: L('Constraints, window agreements, FCFS vs priority, the berth plan Gantt, and berth occupancy.', 'القيود، اتفاقيات النوافذ، الأسبقية للأول مقابل الأولوية، مخطّط جانت للأرصفة، ونسبة إشغال الرصيف.'),
    body: L(`
<h3>The berth planner's question</h3>
<p>“Which ship goes to which berth, when, and with how many cranes — so that window promises are kept, waiting is minimised, and the quay is used efficiently?”</p>
<h3>Hard constraints (never violate)</h3>
<ul>
<li><b>Length</b>: LOA + safety clearance ≤ berth length (and no overlap with neighbour ships on a continuous quay).</li>
<li><b>Depth</b>: max draft + UKC ≤ berth depth (at the planned tide).</li>
<li><b>Air draft / crane outreach</b>: the cranes must reach the outermost row and clear the stack height.</li>
<li><b>Time</b>: a ship cannot berth before it arrives; one ship per berth at a time.</li>
</ul>
<h3>Soft constraints / goals</h3>
<ul>
<li>Respect <b>berth windows</b> of contracted weekly services (priority).</li>
<li>Minimise <b>waiting time</b> and total <b>port stay</b>.</li>
<li>Place the ship close to its <b>yard stacks</b> (shorter tractor distance).</li>
<li>Balance crane deployment across the shift; avoid moving cranes too often.</li>
</ul>
<h3>Window agreements</h3>
<p>The terminal promises: “If you arrive inside your window, you berth on arrival with <i>n</i> cranes and finish within <i>X</i> hours.” In return the line promises the volume and to arrive on time. <b>Off-window</b> vessels are served “as available” — they do not displace window vessels.</p>
<h3>Estimating the port stay</h3>
<div class="formula">Working time (h) = Total moves ÷ (Cranes × Net crane rate)
Port stay ≈ Berthing (~1 h) + Working time + Lashing/unberthing (~1–2 h)</div>
<div class="ex" data-t="Example">OSL PEARL: 3,400 moves, 4 cranes at 28 moves/h → 3,400 ÷ 112 = 30.4 h; + 2.5 h marine/lashing ≈ 33 h at berth.</div>
<h3>Berth occupancy</h3>
<div class="formula">Berth occupancy % = Σ hours vessels at berth ÷ (number of berths × hours in period) × 100</div>
<p>Above ~65–70% for a few berths, waiting times grow exponentially (queueing theory). That is the signal to add capacity or improve productivity — not to push occupancy higher.</p>
<h3>Reading the berth Gantt</h3>
<p>Time on the horizontal axis, berths (or quay metres) vertically. Each vessel is a box from ATB to ATD. A dashed red line shows the ETA. A gap between ETA and the box = waiting.</p>`,
`
<h3>سؤال مخطّط الأرصفة</h3>
<p>“أي سفينة تذهب إلى أي رصيف، ومتى، وبكم رافعة — بحيث نفي بوعود النوافذ ونقلّل الانتظار ونستخدم الرصيف بكفاءة؟”</p>
<h3>القيود الصارمة (لا تُخالف أبدًا)</h3>
<ul>
<li><b>الطول</b>: الطول الكلي + خلوص الأمان ≤ طول الرصيف (ولا تداخل مع السفن المجاورة على رصيف متّصل).</li>
<li><b>العمق</b>: أقصى غاطس + UKC ≤ عمق الرصيف (عند المد المخطّط).</li>
<li><b>الارتفاع الهوائي / مدى الرافعة</b>: يجب أن تصل الرافعات إلى أبعد صف وأن تتجاوز ارتفاع الرصّة.</li>
<li><b>الوقت</b>: لا يمكن للسفينة أن ترسو قبل وصولها؛ سفينة واحدة لكل رصيف في الوقت نفسه.</li>
</ul>
<h3>القيود المرنة / الأهداف</h3>
<ul>
<li>احترام <b>نوافذ الرسو</b> للخطوط الأسبوعية المتعاقدة (أولوية).</li>
<li>تقليل <b>وقت الانتظار</b> وإجمالي <b>مدة البقاء في الميناء</b>.</li>
<li>وضع السفينة قرب <b>رصّاتها في الساحة</b> (مسافة أقصر للجرّارات).</li>
<li>موازنة توزيع الرافعات عبر الوردية؛ وتجنّب نقل الرافعات كثيرًا.</li>
</ul>
<h3>اتفاقيات النوافذ</h3>
<p>تتعهّد المحطة: “إن وصلت ضمن نافذتك، ترسو فور وصولك بعدد <i>n</i> من الرافعات وتنهي خلال <i>X</i> ساعة.” وبالمقابل يتعهّد الخط بالحجم والوصول في الموعد. السفن <b>خارج النافذة</b> تُخدم “حسب التوفّر” — ولا تزيح سفن النوافذ.</p>
<h3>تقدير مدة البقاء</h3>
<div class="formula">Working time (h) = Total moves ÷ (Cranes × Net crane rate)
Port stay ≈ Berthing (~1 h) + Working time + Lashing/unberthing (~1–2 h)</div>
<div class="ex" data-t="مثال">OSL PEARL: 3,400 حركة، 4 رافعات بمعدّل 28 حركة/ساعة ← 3,400 ÷ 112 = 30.4 ساعة؛ + 2.5 ساعة للخدمات البحرية/التثبيت ≈ 33 ساعة على الرصيف.</div>
<h3>إشغال الرصيف</h3>
<div class="formula">Berth occupancy % = Σ hours vessels at berth ÷ (number of berths × hours in period) × 100</div>
<p>فوق ~65–70% في ميناء بعدد قليل من الأرصفة، تزداد أوقات الانتظار بشكل أُسّي (نظرية الطوابير). هذه إشارة لزيادة الطاقة أو تحسين الإنتاجية — لا لدفع الإشغال أعلى.</p>
<h3>قراءة مخطّط جانت للأرصفة</h3>
<p>الوقت على المحور الأفقي، والأرصفة (أو أمتار الرصيف) عموديًا. كل سفينة صندوق من وقت الرسو إلى وقت المغادرة. خطّ أحمر متقطّع يبيّن الموعد المتوقّع. الفجوة بين الموعد والصندوق = انتظار.</p>`),
    keys: [L('Hard constraints: length, depth, crane reach, time.', 'القيود الصارمة: الطول، العمق، مدى الرافعة، الوقت.'), L('Window vessels have priority over off-window ones.', 'سفن النوافذ لها أولوية على السفن خارج النافذة.'), L('Occupancy above ~70% → waiting explodes.', 'إشغال فوق ~70% ← الانتظار ينفجر.')],
    senior: L('Publish the berth plan 72 h ahead, update it every shift, and always explain changes to the lines with numbers (moves, cranes, ETA). A transparent plan avoids most commercial fights.', 'انشر خطة الأرصفة قبل 72 ساعة، وحدّثها كل وردية، واشرح التغييرات للخطوط دائمًا بالأرقام (الحركات، الرافعات، الموعد). الخطة الشفّافة تتجنّب معظم الخلافات التجارية.'),
    quiz: [
      Q(L('2,100 moves, 3 cranes, 25 moves/h each. Working time?', '2,100 حركة، 3 رافعات، 25 حركة/ساعة لكل منها. زمن العمل؟'), [L('21 h', '21 ساعة'), L('28 h', '28 ساعة'), L('84 h', '84 ساعة'), L('35 h', '35 ساعة')], 1, L('2,100 ÷ 75 = 28 h.', '2,100 ÷ 75 = 28 ساعة.')),
      Q(L('An off-window vessel arrives while a window vessel is due in 2 h on the only free berth. Default rule?', 'سفينة خارج النافذة تصل بينما سفينة نافذة مستحقّة خلال ساعتين على الرصيف الوحيد الفارغ. القاعدة الافتراضية؟'), [L('Berth the off-window ship first', 'إرساء السفينة خارج النافذة أولًا'), L('Keep the berth for the window vessel', 'الاحتفاظ بالرصيف لسفينة النافذة'), L('Split the berth', 'تقسيم الرصيف'), L('Ask customs', 'سؤال الجمارك')], 1, L('Window commitments come first; off-window is served as available.', 'التزامات النوافذ أولًا؛ وخارج النافذة يُخدم حسب التوفّر.')),
      Q(L('3 berths, one week (168 h). Vessels used 360 berth-hours. Occupancy?', '3 أرصفة، أسبوع واحد (168 ساعة). استخدمت السفن 360 ساعة-رصيف. نسبة الإشغال؟'), [L('51%', '51%'), L('71%', '71%'), L('64%', '64%'), L('214%', '214%')], 1, L('360 ÷ (3 × 168) = 0.714 → 71%.', '360 ÷ (3 × 168) = 0.714 ← 71%.')),
      Q(L('Which is a HARD constraint?', 'أيّ مما يلي قيد صارم؟'), [L('Berth near the yard stacks', 'الرصيف قرب رصّات الساحة'), L('Draft vs berth depth', 'الغاطس مقابل عمق الرصيف'), L('Minimise crane moves', 'تقليل نقل الرافعات'), L('Customer preference', 'تفضيل العميل')], 1, L('Depth is a safety limit.', 'العمق حدّ للسلامة.')),
    ],
  });

  add({
    id: 'cranesplit', lvl: 2, icon: '⚙', min: 18,
    title: L('Crane split & productivity', 'توزيع الرافعات والإنتاجية'),
    sub: L('GCR, NCR, GMPH/BMPH, crane intensity, the “long crane” and how to balance a split.', 'GCR وNCR وGMPH/BMPH، كثافة الرافعات، “الرافعة الطويلة” وكيفية موازنة التوزيع.'),
    body: L(`
<h3>Productivity definitions (learn them exactly)</h3>
<div class="table-wrap"><table><thead><tr><th>KPI</th><th>Formula</th><th>Typical</th></tr></thead><tbody>
<tr><td><b>GCR</b> — Gross Crane Rate</td><td>moves ÷ crane hours from first to last move (incl. delays)</td><td>25–30 mph</td></tr>
<tr><td><b>NCR</b> — Net Crane Rate</td><td>moves ÷ (crane hours − delays not caused by the terminal, e.g. hatch covers, breaks, ship's gear)</td><td>28–35 mph</td></tr>
<tr><td><b>GMPH</b> — Gross Moves Per (vessel) Hour</td><td>total moves ÷ hours from first to last move (all cranes)</td><td>80–150</td></tr>
<tr><td><b>BMPH</b> — Berth Moves Per Hour</td><td>total moves ÷ hours from all-fast to unmoored</td><td>lower than GMPH</td></tr>
<tr><td><b>Crane intensity</b></td><td>total crane hours ÷ longest crane hours</td><td>max = number of cranes</td></tr>
</tbody></table></div>
<p><b>Note:</b> hatch covers and restows are usually counted as moves in TOS reports but are often excluded in contracts — always check definitions in the service agreement.</p>
<h3>The crane split</h3>
<p>The vessel is divided into consecutive <b>bay groups</b>, one per crane. The vessel finishes when the <b>longest crane</b> (the crane with most work) finishes. So a split is good if the work is <b>balanced</b>.</p>
<div class="formula">Vessel working time = max over cranes ( moves of crane ÷ crane rate )
Ideal = total moves ÷ (n × rate)   →  efficiency = ideal ÷ actual</div>
<h3>Practical rules</h3>
<ul>
<li>Two STS cranes need a <b>safety gap</b> — usually at least one 40′ bay (or 2 hatches) between them; they cannot work adjacent bays at the same time.</li>
<li>Cranes cannot pass each other on the rails.</li>
<li>The <b>maximum cranes</b> on a ship ≈ LOA ÷ ~70–80 m (e.g. 300 m ship → 4 cranes).</li>
<li>Bays with heavy work (deck + hold, discharge + load) should be split between cranes.</li>
<li>Plan the long crane to <b>finish first in the bays near the bridge/engine</b>? No — plan so that all cranes finish together; move a crane to help (“crane shifting”) if one is late.</li>
</ul>
<div class="ex" data-t="Example">Bays work: 02:120, 06:180, 10:210, 14:160, 18:140, 22:190. Total 1,000 moves, 3 cranes at 25 mph → ideal 13.3 h. Split A {02,06}=300, B {10,14}=370, C {18,22}=330 → long crane 370/25 = 14.8 h (efficiency 90%). Better: {02,06,10 part}… a planner can split a big bay between two cranes (one does deck, the other hold).</div>`,
`
<h3>تعاريف الإنتاجية (احفظها بدقة)</h3>
<div class="table-wrap"><table><thead><tr><th>المؤشر</th><th>المعادلة</th><th>النموذجي</th></tr></thead><tbody>
<tr><td><b>GCR</b> — معدّل الرافعة الإجمالي</td><td>الحركات ÷ ساعات الرافعة من أول حركة لآخر حركة (مع التأخيرات)</td><td>25–30 حركة/ساعة</td></tr>
<tr><td><b>NCR</b> — معدّل الرافعة الصافي</td><td>الحركات ÷ (ساعات الرافعة − التأخيرات التي لا تسبّبها المحطة، مثل أغطية العنابر والاستراحات ومعدّات السفينة)</td><td>28–35 حركة/ساعة</td></tr>
<tr><td><b>GMPH</b> — إجمالي الحركات لكل ساعة سفينة</td><td>مجموع الحركات ÷ الساعات من أول حركة لآخر حركة (كل الرافعات)</td><td>80–150</td></tr>
<tr><td><b>BMPH</b> — الحركات لكل ساعة رصيف</td><td>مجموع الحركات ÷ الساعات من الربط الكامل حتى فكّ الربط</td><td>أقل من GMPH</td></tr>
<tr><td><b>كثافة الرافعات</b></td><td>مجموع ساعات الرافعات ÷ ساعات الرافعة الأطول</td><td>الحدّ الأقصى = عدد الرافعات</td></tr>
</tbody></table></div>
<p><b>ملاحظة:</b> أغطية العنابر وإعادة الرصّ تُحسب عادةً حركات في تقارير TOS لكنها تُستثنى غالبًا في العقود — راجع دائمًا التعاريف في اتفاقية الخدمة.</p>
<h3>توزيع الرافعات (Crane split)</h3>
<p>تُقسَّم السفينة إلى <b>مجموعات خلجان</b> متتالية، واحدة لكل رافعة. تنتهي السفينة عندما تنتهي <b>الرافعة الطويلة</b> (صاحبة أكبر عمل). لذا التوزيع الجيد هو <b>المتوازن</b>.</p>
<div class="formula">Vessel working time = max over cranes ( moves of crane ÷ crane rate )
Ideal = total moves ÷ (n × rate)   →  efficiency = ideal ÷ actual</div>
<h3>قواعد عملية</h3>
<ul>
<li>رافعتا رصيف تحتاجان <b>مسافة أمان</b> — عادةً خليج 40′ واحد على الأقل (أو عنبران) بينهما؛ لا يمكنهما العمل على خلجان متجاورة في الوقت نفسه.</li>
<li>الرافعات لا يمكنها تجاوز بعضها على السكة.</li>
<li><b>الحدّ الأقصى للرافعات</b> على سفينة ≈ الطول ÷ ~70–80 م (مثلًا سفينة 300 م ← 4 رافعات).</li>
<li>الخلجان ذات العمل الثقيل (سطح + عنبر، تفريغ + تحميل) يُفضّل تقسيمها بين رافعتين.</li>
<li>خطّط بحيث تنتهي كل الرافعات معًا؛ وانقل رافعة للمساعدة (“نقل الرافعة”) إذا تأخّرت إحداها.</li>
</ul>
<div class="ex" data-t="مثال">عمل الخلجان: 02:120، 06:180، 10:210، 14:160، 18:140، 22:190. المجموع 1,000 حركة، 3 رافعات بمعدّل 25 ← المثالي 13.3 ساعة. التوزيع A {02,06}=300، B {10,14}=370، C {18,22}=330 ← الرافعة الطويلة 370/25 = 14.8 ساعة (كفاءة 90%). يمكن للمخطّط تقسيم خليج كبير بين رافعتين (واحدة للسطح والأخرى للعنبر).</div>`),
    keys: [L('The vessel finishes when the longest crane finishes.', 'السفينة تنتهي عندما تنتهي الرافعة الطويلة.'), L('GMPH = moves ÷ first-to-last move hours.', 'GMPH = الحركات ÷ ساعات أول حركة لآخر حركة.'), L('Keep a safety gap between cranes; cranes cannot pass each other.', 'حافظ على مسافة أمان بين الرافعات؛ ولا يمكنها تجاوز بعضها.')],
    senior: L('Check the split every 2 hours during operations: if one crane is 30+ moves behind, shift work or a crane early. A late fix costs the whole vessel schedule.', 'راجع التوزيع كل ساعتين أثناء العمليات: إن تأخّرت رافعة 30 حركة أو أكثر، انقل عملًا أو رافعة مبكرًا. الإصلاح المتأخّر يكلّف جدول السفينة كاملًا.'),
    quiz: [
      Q(L('4 cranes, 2,400 moves, from first to last move 20 h. GMPH?', '4 رافعات، 2,400 حركة، من أول حركة لآخرها 20 ساعة. GMPH؟'), [L('30', '30'), L('120', '120'), L('600', '600'), L('480', '480')], 1, L('2,400 ÷ 20 = 120 moves per vessel hour.', '2,400 ÷ 20 = 120 حركة لكل ساعة سفينة.')),
      Q(L('Crane work: 400, 520, 380 moves at 26 mph. Vessel working time?', 'عمل الرافعات: 400، 520، 380 حركة بمعدّل 26. زمن عمل السفينة؟'), [L('16.7 h', '16.7 ساعة'), L('20 h', '20 ساعة'), L('50 h', '50 ساعة'), L('14.6 h', '14.6 ساعة')], 1, L('Longest crane 520 ÷ 26 = 20 h.', 'الرافعة الطويلة 520 ÷ 26 = 20 ساعة.')),
      Q(L('Crane intensity of 3.4 with 4 cranes means…', 'كثافة رافعات 3.4 مع 4 رافعات تعني…'), [L('Perfect balance', 'توازن تام'), L('Some imbalance — the long crane works longer than the others', 'بعض عدم التوازن — الرافعة الطويلة تعمل أكثر من غيرها'), L('Cranes broke down', 'الرافعات تعطّلت'), L('Overtime was paid', 'دُفع عمل إضافي')], 1, L('Max intensity = 4 when all cranes work equally long.', 'الحدّ الأقصى = 4 عندما تعمل كل الرافعات بنفس المدة.')),
      Q(L('NCR excludes…', 'معدّل الرافعة الصافي يستثني…'), [L('All delays', 'كل التأخيرات'), L('Delays not attributable to the terminal', 'التأخيرات غير المنسوبة للمحطة'), L('Hatch-cover moves only', 'حركات أغطية العنابر فقط'), L('Night shifts', 'ورديات الليل')], 1, L('E.g. ship’s hatch problems, rain stops agreed in contract, crew issues.', 'مثل مشاكل أغطية السفينة، توقف المطر المتّفق عليه، مشاكل الطاقم.')),
    ],
  });

  add({
    id: 'stowage', lvl: 2, icon: '🧩', min: 18,
    title: L('Stowage planning & loading sequence', 'تخطيط الرصّ وتسلسل التحميل'),
    sub: L('Weight & stability, POD rotation, reefer and DG slots, lashing, restows and overstows.', 'الوزن والاتزان، ترتيب موانئ التفريغ، خانات المبرّدات والخطرة، التثبيت، إعادة الرصّ والحجب.'),
    body: L(`
<h3>Who plans what</h3>
<ul>
<li><b>Central (line) planner</b>: decides which slots go to which port (pre-stow / MOVINS), stability, lashing forces.</li>
<li><b>Terminal vessel planner</b>: picks <i>which exact container</i> from the yard goes to each slot and builds the load sequence for each crane.</li>
</ul>
<h3>The golden rules of stowage</h3>
<ol>
<li><b>Port rotation</b>: boxes for the next port on top / accessible; later ports underneath. Violation = <b>overstow</b> (a box must be moved to reach another) → restow cost.</li>
<li><b>Weight</b>: heavy boxes low, light boxes high (stability, GM). Respect <b>stack weight limits</b> (e.g. 20′ stack on deck ≤ 60–90 t) and <b>lashing forces</b>.</li>
<li><b>Reefers</b> only on reefer slots (plugs).</li>
<li><b>DG</b>: IMDG segregation (e.g. “away from”, “separated from”, “separated by a complete compartment”), away from heat/accommodation.</li>
<li><b>OOG</b>: top of stack or flat racks on special slots; check lost slots.</li>
<li><b>Visibility line</b> (SOLAS): deck stacks must not block the bridge view beyond limits.</li>
</ol>
<h3>Load sequence & yard</h3>
<p>The yard plan must match the load sequence: a crane loads bay 14 heavy-first, then medium, then light. If the yard stacked light boxes under heavy ones for the same bay → <b>yard rehandles</b> → crane waits.</p>
<h3>Restows & shifting</h3>
<ul>
<li><b>Restow</b>: discharge a box and reload it (to reach something below or fix a mistake). Usually billable to the line if not the terminal's fault.</li>
<li><b>Shifting on board</b>: move cell to cell without landing on the quay.</li>
</ul>
<h3>Load-out checks before departure</h3>
<ul>
<li>All boxes in COPRAR loaded? <b>Short-shipped</b> list sent with reasons (no VGM, customs hold, late gate-in, rolled).</li>
<li>Any box loaded not on the list? (<b>overlanded</b> / wrong load) → urgent.</li>
<li>Final BAPLIE sent to line and next port; stability approved by the chief officer.</li>
</ul>`,
`
<h3>من يخطّط ماذا</h3>
<ul>
<li><b>المخطّط المركزي (الخط)</b>: يحدّد الخانات المخصّصة لكل ميناء (التخطيط المسبق / MOVINS)، الاتزان، وقوى التثبيت.</li>
<li><b>مخطّط السفن في المحطة</b>: يختار <i>الحاوية بعينها</i> من الساحة لكل خانة ويبني تسلسل التحميل لكل رافعة.</li>
</ul>
<h3>القواعد الذهبية للرصّ</h3>
<ol>
<li><b>ترتيب الموانئ</b>: حاويات الميناء التالي في الأعلى / سهلة الوصول؛ والموانئ اللاحقة تحتها. المخالفة = <b>حجب (Overstow)</b> (يجب تحريك حاوية للوصول لأخرى) ← تكلفة إعادة رصّ.</li>
<li><b>الوزن</b>: الثقيل في الأسفل والخفيف في الأعلى (الاتزان، GM). احترم <b>حدود وزن الرصّة</b> (مثلًا رصّة 20′ على السطح ≤ 60–90 طنًا) و<b>قوى التثبيت</b>.</li>
<li><b>المبرّدات</b> فقط على خانات المبرّدات (المقابس).</li>
<li><b>الخطرة</b>: فصل حسب IMDG (مثل “بعيد عن”، “منفصل عن”، “منفصل بعنبر كامل”)، بعيدًا عن الحرارة وأماكن الإقامة.</li>
<li><b>خارج المقاس</b>: أعلى الرصّة أو المسطّحات على خانات خاصة؛ تحقّق من الخانات المفقودة.</li>
<li><b>خط الرؤية</b> (SOLAS): رصّات السطح يجب ألّا تحجب رؤية الجسر بما يتجاوز الحدود.</li>
</ol>
<h3>تسلسل التحميل والساحة</h3>
<p>يجب أن تتطابق خطة الساحة مع تسلسل التحميل: الرافعة تحمّل الخليج 14 بالثقيل أولًا ثم المتوسط ثم الخفيف. إن رصّت الساحة الخفيف تحت الثقيل لنفس الخليج ← <b>إعادة مناولة في الساحة</b> ← الرافعة تنتظر.</p>
<h3>إعادة الرصّ والنقل</h3>
<ul>
<li><b>إعادة الرصّ (Restow)</b>: تفريغ حاوية وإعادة تحميلها (للوصول لشيء تحتها أو لتصحيح خطأ). تُفوتر عادةً للخط إن لم يكن الخطأ من المحطة.</li>
<li><b>النقل على السفينة (Shifting)</b>: من خانة لأخرى دون إنزالها على الرصيف.</li>
</ul>
<h3>فحوصات التحميل قبل المغادرة</h3>
<ul>
<li>هل حُمّلت كل الحاويات في COPRAR؟ أرسل قائمة <b>الحاويات غير المشحونة (Short-shipped)</b> مع الأسباب (لا VGM، حجز جمركي، دخول متأخّر، مؤجّلة).</li>
<li>هل حُمّلت حاوية غير موجودة في القائمة؟ (<b>تحميل زائد / خاطئ</b>) ← عاجل.</li>
<li>إرسال BAPLIE النهائية للخط وللميناء التالي؛ واعتماد الاتزان من الضابط الأول.</li>
</ul>`),
    keys: [L('Next port on top; heavy low; reefers on plugs; DG segregated.', 'الميناء التالي في الأعلى؛ الثقيل في الأسفل؛ المبرّدات على المقابس؛ الخطرة معزولة.'), L('Yard stacking must follow the load sequence.', 'رصّ الساحة يجب أن يتبع تسلسل التحميل.'), L('Send short-shipped list with reasons before sailing.', 'أرسل قائمة الحاويات غير المشحونة مع الأسباب قبل الإبحار.')],
    senior: L('Hold a 15-minute pre-ops meeting for every mainline vessel: planner, yard, quay supervisor, lashing foreman. Walk through DG, OOG, reefers, restows and the long crane. Most surprises die in that meeting.', 'اعقد اجتماعًا لمدة 15 دقيقة قبل العمليات لكل سفينة رئيسية: المخطّط، الساحة، مشرف الرصيف، رئيس التثبيت. راجعوا الخطرة وخارج المقاس والمبرّدات وإعادة الرصّ والرافعة الطويلة. معظم المفاجآت تموت في ذلك الاجتماع.'),
    quiz: [
      Q(L('Rotation: Beirut → Mersin → Piraeus. In Beirut, which boxes should be on top?', 'الترتيب: بيروت ← مرسين ← بيرايوس. في بيروت، أي الحاويات يجب أن تكون في الأعلى؟'), [L('Piraeus', 'بيرايوس'), L('Mersin', 'مرسين'), L('Heaviest', 'الأثقل'), L('Empties', 'الفارغة')], 1, L('Mersin is discharged first, so Mersin boxes must be accessible.', 'مرسين تُفرَّغ أولًا، فيجب أن تكون حاوياتها سهلة الوصول.')),
      Q(L('An overstow is…', 'الحجب (Overstow) هو…'), [L('A box loaded in the wrong vessel', 'حاوية حُمّلت على سفينة خاطئة'), L('A box blocking access to a box for an earlier port', 'حاوية تحجب الوصول لحاوية لميناء أسبق'), L('An overweight box', 'حاوية زائدة الوزن'), L('An OOG box', 'حاوية خارج المقاس')], 1, L('It forces a restow.', 'يفرض إعادة رصّ.')),
      Q(L('Who chooses the exact container for each slot?', 'من يختار الحاوية بعينها لكل خانة؟'), [L('Line central planner', 'المخطّط المركزي للخط'), L('Terminal vessel planner', 'مخطّط السفن في المحطة'), L('Customs', 'الجمارك'), L('Crane driver', 'سائق الرافعة')], 1, L('The line allocates slots per port; the terminal picks the boxes.', 'الخط يخصّص الخانات لكل ميناء؛ والمحطة تختار الحاويات.')),
      Q(L('A booked box has no VGM at cut-off. It will be…', 'حاوية محجوزة بدون VGM عند الموعد النهائي. ستكون…'), [L('Loaded with estimated weight', 'محمّلة بوزن تقديري'), L('Short-shipped (not loaded)', 'غير مشحونة (لا تُحمّل)'), L('Loaded on deck only', 'محمّلة على السطح فقط'), L('Weighed by the crane and loaded', 'تُوزن بالرافعة وتُحمّل')], 1, L('SOLAS: no VGM, no load (unless weighed and VGM issued per local rules before loading).', 'SOLAS: لا VGM لا تحميل (إلا إذا وُزنت وصدر VGM وفق القواعد المحلية قبل التحميل).')),
    ],
  });

  add({
    id: 'departure', lvl: 2, icon: '🏁', min: 12,
    title: L('Departure, SOF & port costs', 'المغادرة وبيان الوقائع وتكاليف الميناء'),
    sub: L('Completion, final documents, unberthing, SOF, PDA/FDA and the post-call review.', 'الإنهاء، المستندات النهائية، فكّ الربط، بيان الوقائع، الحساب التقديري/النهائي والمراجعة بعد الزيارة.'),
    body: L(`
<h3>From last move to sailing</h3>
<ol>
<li><b>Last container</b> loaded; final lashing check; hatch covers closed.</li>
<li><b>Final load report</b> (COARRI) + final <b>BAPLIE</b>; short-shipped / overlanded list.</li>
<li>Chief officer confirms <b>stability & drafts</b>; master signs documents.</li>
<li>Port clearance (outward), pilot & tugs ordered (usually 1–2 h before).</li>
<li><b>Unmoored / ATD</b>; berth released → next ship.</li>
</ol>
<h3>Statement of Facts (SOF)</h3>
<p>The SOF lists every time-stamped event and every <b>delay with its cause</b> (rain, crane breakdown, ship's gear, waiting cargo, strike). It is the basis for productivity claims and charter disputes — write it precisely.</p>
<h3>Port disbursement account</h3>
<ul>
<li><b>PDA</b> (proforma): agent's estimate sent before arrival (port dues, pilotage, towage, mooring, light dues, agency fee, terminal charges).</li>
<li><b>FDA</b> (final): actual costs after departure.</li>
<li>Terminal charges to the line: <b>THC / stevedoring per move</b>, shifting, restows, hatch covers, storage, reefer plugging, DG/OOG surcharges, overtime.</li>
</ul>
<h3>Post-call review</h3>
<div class="formula">Port stay (h) = ATD − ATB  (+ waiting at anchorage = total turnaround)
Ship turnaround time = ATD − arrival at anchorage/pilot station</div>
<p>Compare planned vs actual: moves, cranes, GMPH, delays. Share a one-page vessel performance report with the line.</p>`,
`
<h3>من آخر حركة حتى الإبحار</h3>
<ol>
<li>تحميل <b>آخر حاوية</b>؛ فحص التثبيت النهائي؛ إغلاق أغطية العنابر.</li>
<li><b>تقرير التحميل النهائي</b> (COARRI) + <b>BAPLIE</b> النهائية؛ قائمة غير المشحونة / الزائدة.</li>
<li>الضابط الأول يؤكّد <b>الاتزان والغواطس</b>؛ والربّان يوقّع المستندات.</li>
<li>تصريح المغادرة، وطلب المرشد والقاطرات (عادةً قبل 1–2 ساعة).</li>
<li><b>فكّ الربط / ATD</b>؛ تحرير الرصيف ← السفينة التالية.</li>
</ol>
<h3>بيان الوقائع (SOF)</h3>
<p>يسرد بيان الوقائع كل حدث بتوقيته وكل <b>تأخير مع سببه</b> (مطر، عطل رافعة، معدّات السفينة، انتظار البضاعة، إضراب). هو أساس مطالبات الإنتاجية ونزاعات الإيجار — اكتبه بدقة.</p>
<h3>حساب مصاريف الميناء</h3>
<ul>
<li><b>PDA</b> (تقديري): تقدير الوكيل قبل الوصول (رسوم الميناء، الإرشاد، القطر، الربط، رسوم المنارات، أتعاب الوكالة، رسوم المحطة).</li>
<li><b>FDA</b> (نهائي): التكاليف الفعلية بعد المغادرة.</li>
<li>رسوم المحطة على الخط: <b>رسوم المناولة THC / التحميل لكل حركة</b>، النقل، إعادة الرصّ، أغطية العنابر، التخزين، توصيل المبرّدات، رسوم إضافية للخطرة/خارج المقاس، العمل الإضافي.</li>
</ul>
<h3>المراجعة بعد الزيارة</h3>
<div class="formula">Port stay (h) = ATD − ATB  (+ waiting at anchorage = total turnaround)
Ship turnaround time = ATD − arrival at anchorage/pilot station</div>
<p>قارن المخطّط بالفعلي: الحركات، الرافعات، GMPH، التأخيرات. شارك تقرير أداء من صفحة واحدة مع الخط.</p>`),
    keys: [L('SOF records every event and delay cause.', 'بيان الوقائع يسجّل كل حدث وسبب كل تأخير.'), L('PDA before, FDA after.', 'PDA قبل، FDA بعد.'), L('Turnaround = waiting + port stay.', 'زمن الدوران = الانتظار + مدة البقاء.')],
    senior: L('Your SOF is evidence. If it says “crane 3 breakdown 02:10–03:40” the line will not pay for that time and you cannot claim the delay was theirs. Be honest and precise — it builds trust and protects you.', 'بيان الوقائع دليل. إن قال “عطل الرافعة 3 من 02:10 إلى 03:40” فلن يدفع الخط عن ذلك الوقت ولا يمكنك الادّعاء أن التأخير منه. كن صادقًا ودقيقًا — هذا يبني الثقة ويحميك.'),
    quiz: [
      Q(L('Arrival at anchorage 02:00, ATB 08:00, ATD next day 04:00. Turnaround time?', 'الوصول للمخطاف 02:00، الرسو 08:00، المغادرة اليوم التالي 04:00. زمن الدوران؟'), [L('20 h', '20 ساعة'), L('26 h', '26 ساعة'), L('6 h', '6 ساعات'), L('22 h', '22 ساعة')], 1, L('From 02:00 to 04:00 next day = 26 h (6 h waiting + 20 h at berth).', 'من 02:00 إلى 04:00 اليوم التالي = 26 ساعة (6 انتظار + 20 على الرصيف).')),
      Q(L('PDA is…', 'PDA هو…'), [L('Final invoice', 'الفاتورة النهائية'), L('Agent’s cost estimate before the call', 'تقدير الوكيل للتكاليف قبل الزيارة'), L('Customs document', 'مستند جمركي'), L('A crane report', 'تقرير رافعة')], 1, L('Proforma Disbursement Account.', 'حساب المصاريف التقديري.')),
      Q(L('Which document records delays with causes?', 'أي مستند يسجّل التأخيرات مع أسبابها؟'), [L('BAPLIE', 'BAPLIE'), L('SOF', 'SOF'), L('EIR', 'EIR'), L('D/O', 'إذن التسليم')], 1, L('Statement of Facts.', 'بيان الوقائع.')),
    ],
  });
})();
