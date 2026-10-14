/* Port Master Academy — specialisation tracks: L6 vessel management, L7 bulk & silo terminals */
(function () {
  const L = TS.L;
  const Q = (q, o, a, e) => ({ q, o, a, e });
  const add = (x) => PT.lessons.push(x);

  /* =========================================================== LEVEL 6 — VESSEL MANAGEMENT */
  add({
    id: 'vm-shipmgmt', lvl: 6, icon: '🛳', min: 18,
    title: L('Ship management & the ISM Code', 'إدارة السفن ومدوّنة ISM'),
    sub: L('Owner, manager, operator, charterer — technical, crew and commercial management; ISM, DOC/SMC, DPA.', 'المالك، المدير، المشغّل، المستأجر — الإدارة الفنية وإدارة الطاقم والتجارية؛ ISM، شهادتا DOC/SMC، الشخص المعيّن DPA.'),
    body: L(`
<h3>Who is who around a ship</h3>
<div class="table-wrap"><table><thead><tr><th>Party</th><th>Role</th></tr></thead><tbody>
<tr><td><b>Registered owner</b></td><td>Legal owner of the ship (often a single-ship company)</td></tr>
<tr><td><b>Beneficial owner</b></td><td>The real investor behind the owning company</td></tr>
<tr><td><b>Ship manager</b></td><td>Runs the ship for the owner under a management agreement (e.g. BIMCO SHIPMAN): technical, crew, sometimes commercial</td></tr>
<tr><td><b>Operator / disponent owner</b></td><td>Commercially employs the ship (may be a time-charterer)</td></tr>
<tr><td><b>Charterer</b></td><td>Hires the ship or its space (voyage, time or bareboat)</td></tr>
<tr><td><b>Flag State</b></td><td>Country of registry — certifies and inspects the ship</td></tr>
<tr><td><b>Classification society</b></td><td>Sets and checks technical standards (structure, machinery); issues class certificates</td></tr>
<tr><td><b>P&I Club</b></td><td>Mutual insurance for third-party liabilities (cargo claims, pollution, crew injury)</td></tr>
<tr><td><b>H&M insurers</b></td><td>Hull & machinery insurance (damage to the ship itself)</td></tr>
</tbody></table></div>
<h3>The three pillars of ship management</h3>
<ul>
<li><b>Technical management</b>: maintenance, repairs, drydock, class & flag surveys, spare parts, bunkers quality, budgets (OPEX).</li>
<li><b>Crew management</b>: recruitment, certificates (STCW), training, payroll, crew changes, welfare (MLC).</li>
<li><b>Commercial management</b>: chartering, voyage operations, freight/hire collection, claims.</li>
</ul>
<h3>The ISM Code (International Safety Management)</h3>
<p>Mandatory under SOLAS chapter IX. The company must run a <b>Safety Management System (SMS)</b>: policies, procedures, emergency preparedness, reporting of non-conformities, internal audits and management review.</p>
<ul>
<li><b>DOC</b> (Document of Compliance) — issued to the <i>company</i>.</li>
<li><b>SMC</b> (Safety Management Certificate) — issued to each <i>ship</i>.</li>
<li><b>DPA</b> (Designated Person Ashore) — direct link between ship and top management, available 24/7.</li>
<li>Related codes: <b>ISPS</b> (security), <b>MLC 2006</b> (crew welfare), <b>MARPOL</b> (pollution), <b>STCW</b> (training).</li>
</ul>
<h3>Ship operating costs (OPEX) — typical split</h3>
<div class="formula">OPEX ≈ crew 40–50% + repairs & maintenance 15–20% + stores/spares/lubes 15% + insurance 10% + admin/management fee 5–10%
Voyage costs (bunkers, port, canal) are separate — paid by whoever employs the ship.</div>
<div class="ex" data-t="Example">A 5,000 TEU ship with OPEX USD 9,500/day and management fee USD 12,000/month: annual OPEX ≈ 9,500 × 365 = USD 3.47 M.</div>`,
`
<h3>من هو من حول السفينة</h3>
<div class="table-wrap"><table><thead><tr><th>الطرف</th><th>الدور</th></tr></thead><tbody>
<tr><td><b>المالك المسجّل</b></td><td>المالك القانوني للسفينة (غالبًا شركة بسفينة واحدة)</td></tr>
<tr><td><b>المالك المستفيد</b></td><td>المستثمر الحقيقي خلف الشركة المالكة</td></tr>
<tr><td><b>مدير السفينة</b></td><td>يدير السفينة نيابة عن المالك بعقد إدارة (مثل BIMCO SHIPMAN): فني، طاقم، وأحيانًا تجاري</td></tr>
<tr><td><b>المشغّل / المالك المتصرّف</b></td><td>يشغّل السفينة تجاريًا (قد يكون مستأجرًا زمنيًا)</td></tr>
<tr><td><b>المستأجر</b></td><td>يستأجر السفينة أو مساحتها (رحلة، زمني، أو عارٍ)</td></tr>
<tr><td><b>دولة العلم</b></td><td>بلد التسجيل — تصدر الشهادات وتفتّش السفينة</td></tr>
<tr><td><b>هيئة التصنيف</b></td><td>تضع وتراقب المعايير الفنية (الهيكل، الآلات)؛ وتصدر شهادات التصنيف</td></tr>
<tr><td><b>نادي الحماية والتعويض P&I</b></td><td>تأمين تعاوني للمسؤوليات تجاه الغير (مطالبات البضاعة، التلوّث، إصابات الطاقم)</td></tr>
<tr><td><b>مؤمّنو البدن والآلات H&M</b></td><td>تأمين البدن والآلات (الأضرار على السفينة نفسها)</td></tr>
</tbody></table></div>
<h3>الركائز الثلاث لإدارة السفن</h3>
<ul>
<li><b>الإدارة الفنية</b>: الصيانة، الإصلاحات، الحوض الجاف، معاينات التصنيف والعلم، قطع الغيار، جودة الوقود، الميزانيات (OPEX).</li>
<li><b>إدارة الطاقم</b>: التوظيف، الشهادات (STCW)، التدريب، الرواتب، تبديل الطاقم، الرعاية (MLC).</li>
<li><b>الإدارة التجارية</b>: التأجير، عمليات الرحلات، تحصيل الأجرة/الإيجار، المطالبات.</li>
</ul>
<h3>مدوّنة ISM (الإدارة الدولية للسلامة)</h3>
<p>إلزامية بموجب الفصل التاسع من SOLAS. يجب أن تدير الشركة <b>نظام إدارة السلامة (SMS)</b>: السياسات، الإجراءات، الاستعداد للطوارئ، الإبلاغ عن عدم المطابقة، التدقيق الداخلي ومراجعة الإدارة.</p>
<ul>
<li><b>DOC</b> (وثيقة المطابقة) — تصدر <i>للشركة</i>.</li>
<li><b>SMC</b> (شهادة إدارة السلامة) — تصدر لكل <i>سفينة</i>.</li>
<li><b>DPA</b> (الشخص المعيّن على البر) — صلة مباشرة بين السفينة والإدارة العليا، متاح على مدار الساعة.</li>
<li>مدوّنات مرتبطة: <b>ISPS</b> (الأمن)، <b>MLC 2006</b> (رعاية البحّارة)، <b>MARPOL</b> (التلوّث)، <b>STCW</b> (التدريب).</li>
</ul>
<h3>تكاليف تشغيل السفينة (OPEX) — التوزيع النموذجي</h3>
<div class="formula">OPEX ≈ crew 40–50% + repairs & maintenance 15–20% + stores/spares/lubes 15% + insurance 10% + admin/management fee 5–10%
Voyage costs (bunkers, port, canal) are separate — paid by whoever employs the ship.</div>
<div class="ex" data-t="مثال">سفينة 5,000 TEU بتكلفة تشغيل 9,500 دولار/يوم وأتعاب إدارة 12,000 دولار/شهر: التكلفة السنوية ≈ 9,500 × 365 = 3.47 مليون دولار.</div>`),
    keys: [L('Technical, crew and commercial management are different jobs.', 'الإدارة الفنية وإدارة الطاقم والتجارية وظائف مختلفة.'), L('ISM: DOC for the company, SMC for the ship, DPA 24/7.', 'ISM: DOC للشركة، SMC للسفينة، DPA على مدار الساعة.'), L('OPEX (running the ship) ≠ voyage costs (using the ship).', 'تكاليف التشغيل (تشغيل السفينة) ≠ تكاليف الرحلة (استخدام السفينة).')],
    senior: L('In port, always ask “who is the operator?” — the owner, the manager and the charterer may be three different companies, and only one of them pays your invoice.', 'في الميناء اسأل دائمًا “من المشغّل؟” — المالك والمدير والمستأجر قد يكونون ثلاث شركات مختلفة، وواحدة فقط منها تدفع فاتورتك.'),
    quiz: [
      Q(L('The ISM certificate issued to each ship is the…', 'شهادة ISM التي تصدر لكل سفينة هي…'), [L('DOC', 'DOC'), L('SMC', 'SMC'), L('IOPP', 'IOPP'), L('ISSC', 'ISSC')], 1, L('DOC = company, SMC = ship.', 'DOC = الشركة، SMC = السفينة.')),
      Q(L('Who insures cargo claims and pollution liability?', 'من يؤمّن مطالبات البضاعة ومسؤولية التلوّث؟'), [L('H&M insurer', 'مؤمّن البدن والآلات'), L('P&I Club', 'نادي P&I'), L('Class society', 'هيئة التصنيف'), L('Flag State', 'دولة العلم')], 1, L('Protection & Indemnity covers third-party liabilities.', 'الحماية والتعويض تغطّي المسؤوليات تجاه الغير.')),
      Q(L('The largest share of ship OPEX is usually…', 'أكبر حصة من تكاليف تشغيل السفينة عادةً…'), [L('Bunkers', 'الوقود'), L('Crew', 'الطاقم'), L('Port dues', 'رسوم الميناء'), L('Canal fees', 'رسوم القناة')], 1, L('Bunkers and port dues are voyage costs, not OPEX.', 'الوقود ورسوم الميناء تكاليف رحلة لا تشغيل.')),
      Q(L('The DPA is…', 'الشخص المعيّن DPA هو…'), [L('The master', 'الربّان'), L('A shore person linking ship and top management', 'شخص على البر يربط السفينة بالإدارة العليا'), L('A port official', 'موظّف ميناء'), L('A surveyor', 'مُعاين')], 1, L('Designated Person Ashore under ISM.', 'الشخص المعيّن على البر بموجب ISM.')),
    ],
  });

  add({
    id: 'vm-charter', lvl: 6, icon: '📜', min: 20,
    title: L('Chartering, laytime & demurrage', 'التأجير وزمن الرسو وغرامة التأخير'),
    sub: L('Voyage, time and bareboat charters; NOR, laytime, SHINC/SHEX, demurrage & despatch calculations.', 'تأجير الرحلة والزمني والعاري؛ إشعار الجاهزية، زمن الرسو، SHINC/SHEX، حساب غرامة التأخير ومكافأة السرعة.'),
    body: L(`
<h3>Three ways to hire a ship</h3>
<div class="table-wrap"><table><thead><tr><th></th><th>Voyage charter</th><th>Time charter</th><th>Bareboat charter</th></tr></thead><tbody>
<tr><td>Paid as</td><td>Freight per tonne / lump sum</td><td>Hire per day</td><td>Hire per day (long term)</td></tr>
<tr><td>Owner pays</td><td>Everything incl. bunkers & port costs</td><td>OPEX (crew, maintenance, insurance)</td><td>Nothing operational</td></tr>
<tr><td>Charterer pays</td><td>Freight (+ demurrage)</td><td>Bunkers, port costs, canal</td><td>Everything incl. crew</td></tr>
<tr><td>Port-time risk</td><td>Charterer via laytime/demurrage</td><td>Charterer (pays hire every day)</td><td>Charterer</td></tr>
</tbody></table></div>
<p>Common forms: <b>GENCON</b> (voyage), <b>NYPE</b> (time), <b>BARECON</b> (bareboat), <b>GRAINCON / NORGRAIN</b> (grain).</p>
<h3>Laytime — the time allowed to load/discharge</h3>
<ul>
<li>Fixed (e.g. “5 days”) or by rate (e.g. “8,000 MT per weather working day”).</li>
<li>Starts after a valid <b>NOR</b> plus <b>turn time</b> (e.g. 6 or 12 hours), per the charter party.</li>
<li><b>SHINC</b> = Sundays & holidays included; <b>SHEX</b> = excluded; <b>WWD</b> = weather working days (rain stops don't count).</li>
<li><b>“Once on demurrage, always on demurrage”</b>: after laytime expires, exceptions no longer stop the clock (unless the CP says otherwise).</li>
</ul>
<h3>Demurrage & despatch</h3>
<div class="formula">Laytime allowed (days) = Cargo quantity ÷ Rate per day
Time used = from laytime commencement to completion, minus excepted periods
Demurrage = (Time used − Laytime) × Demurrage rate per day   (pro rata)
Despatch  = (Laytime − Time used) × Despatch rate  (often ½ demurrage, on "working time saved")</div>
<div class="ex" data-t="Worked example">50,000 t wheat, discharge rate 8,000 t/day SHINC, demurrage USD 18,000/day, despatch half. Laytime = 6.25 days. Time used = 8.5 days. Demurrage = 2.25 × 18,000 = <b>USD 40,500</b>. If time used were 5.0 days: despatch = 1.25 × 9,000 = USD 11,250.</div>
<h3>Why the port must care</h3>
<p>Your Statement of Facts (times of arrival, NOR, berthing, stoppages and their causes) <b>is the evidence</b> in every laytime calculation. Terminal-caused stoppages can make the charterer claim against the terminal.</p>`,
`
<h3>ثلاث طرق لاستئجار سفينة</h3>
<div class="table-wrap"><table><thead><tr><th></th><th>تأجير الرحلة</th><th>التأجير الزمني</th><th>التأجير العاري</th></tr></thead><tbody>
<tr><td>طريقة الدفع</td><td>أجرة لكل طن / مبلغ مقطوع</td><td>إيجار يومي</td><td>إيجار يومي (طويل الأمد)</td></tr>
<tr><td>يدفع المالك</td><td>كل شيء بما في ذلك الوقود وتكاليف الميناء</td><td>تكاليف التشغيل (الطاقم، الصيانة، التأمين)</td><td>لا شيء تشغيلي</td></tr>
<tr><td>يدفع المستأجر</td><td>الأجرة (+ غرامة التأخير)</td><td>الوقود، تكاليف الميناء، القناة</td><td>كل شيء بما في ذلك الطاقم</td></tr>
<tr><td>مخاطر وقت الميناء</td><td>على المستأجر عبر زمن الرسو/الغرامة</td><td>على المستأجر (يدفع الإيجار يوميًا)</td><td>على المستأجر</td></tr>
</tbody></table></div>
<p>نماذج شائعة: <b>GENCON</b> (رحلة)، <b>NYPE</b> (زمني)، <b>BARECON</b> (عارٍ)، <b>GRAINCON / NORGRAIN</b> (حبوب).</p>
<h3>زمن الرسو (Laytime) — الوقت المسموح للتحميل/التفريغ</h3>
<ul>
<li>ثابت (مثلًا “5 أيام”) أو بمعدّل (مثلًا “8,000 طن لكل يوم عمل بطقس ملائم”).</li>
<li>يبدأ بعد <b>إشعار جاهزية</b> صحيح مضافًا إليه <b>فترة الانتظار</b> (مثلًا 6 أو 12 ساعة)، حسب عقد الإيجار.</li>
<li><b>SHINC</b> = الأحد والعطل محسوبة؛ <b>SHEX</b> = مستثناة؛ <b>WWD</b> = أيام العمل بطقس ملائم (توقف المطر لا يُحسب).</li>
<li><b>“من دخل الغرامة بقي فيها”</b>: بعد انتهاء زمن الرسو لا توقف الاستثناءات العدّاد (ما لم ينصّ العقد على غير ذلك).</li>
</ul>
<h3>غرامة التأخير ومكافأة السرعة (Despatch)</h3>
<div class="formula">Laytime allowed (days) = Cargo quantity ÷ Rate per day
Time used = from laytime commencement to completion, minus excepted periods
Demurrage = (Time used − Laytime) × Demurrage rate per day   (pro rata)
Despatch  = (Laytime − Time used) × Despatch rate  (often ½ demurrage, on "working time saved")</div>
<div class="ex" data-t="مثال محلول">50,000 طن قمح، معدّل التفريغ 8,000 طن/يوم SHINC، غرامة التأخير 18,000 دولار/يوم، مكافأة السرعة النصف. زمن الرسو = 6.25 يوم. الوقت المستخدم = 8.5 يوم. الغرامة = 2.25 × 18,000 = <b>40,500 دولار</b>. لو كان الوقت المستخدم 5.0 أيام: المكافأة = 1.25 × 9,000 = 11,250 دولارًا.</div>
<h3>لماذا يهمّ ذلك الميناء</h3>
<p>بيان الوقائع الخاص بك (أوقات الوصول، إشعار الجاهزية، الرسو، التوقفات وأسبابها) <b>هو الدليل</b> في كل حساب لزمن الرسو. التوقفات التي تسبّبها المحطة قد تجعل المستأجر يطالب المحطة.</p>`),
    keys: [L('Voyage = freight; time = hire; bareboat = ship without crew.', 'الرحلة = أجرة؛ الزمني = إيجار؛ العاري = سفينة بلا طاقم.'), L('Laytime = cargo ÷ rate; demurrage pro rata after it expires.', 'زمن الرسو = البضاعة ÷ المعدّل؛ الغرامة تناسبيًا بعد انتهائه.'), L('Your SOF decides who pays.', 'بيان وقائعك يحدّد من يدفع.')],
    senior: L('When a bulk ship waits for your berth, tell the agent the true reason in writing. Port congestion and terminal breakdowns are treated differently under most charter parties — vague SOFs create expensive disputes.', 'عندما تنتظر سفينة سائبة رصيفك، أبلغ الوكيل كتابيًا بالسبب الحقيقي. ازدحام الميناء وأعطال المحطة يُعاملان بشكل مختلف في معظم عقود الإيجار — بيانات الوقائع الغامضة تخلق نزاعات مكلفة.'),
    quiz: [
      Q(L('Under a time charter, who pays bunkers?', 'في التأجير الزمني، من يدفع الوقود؟'), [L('Owner', 'المالك'), L('Charterer', 'المستأجر'), L('Port', 'الميناء'), L('Shipper', 'الشاحن')], 1, L('Time charterer pays voyage costs: bunkers, port, canal.', 'المستأجر الزمني يدفع تكاليف الرحلة: الوقود، الميناء، القناة.')),
      Q(L('40,000 t at 10,000 t/day SHINC. Laytime?', '40,000 طن بمعدّل 10,000 طن/يوم SHINC. زمن الرسو؟'), [L('3 days', '3 أيام'), L('4 days', '4 أيام'), L('5 days', '5 أيام'), L('400 days', '400 يوم')], 1, L('40,000 ÷ 10,000 = 4 days.', '40,000 ÷ 10,000 = 4 أيام.')),
      Q(L('Laytime 4 days, used 5.5 days, demurrage USD 15,000/day. Demurrage?', 'زمن الرسو 4 أيام، المستخدم 5.5 أيام، الغرامة 15,000 دولار/يوم. الغرامة؟'), [L('USD 15,000', '15,000 دولار'), L('USD 22,500', '22,500 دولار'), L('USD 82,500', '82,500 دولار'), L('USD 7,500', '7,500 دولار')], 1, L('1.5 × 15,000 = 22,500.', '1.5 × 15,000 = 22,500.')),
      Q(L('SHEX means…', 'SHEX تعني…'), [L('Sundays & holidays included', 'الأحد والعطل محسوبة'), L('Sundays & holidays excepted', 'الأحد والعطل مستثناة'), L('Ship excluded', 'السفينة مستثناة'), L('Shift extra', 'وردية إضافية')], 1, L('Excepted = not counted as laytime.', 'مستثناة = لا تُحسب من زمن الرسو.')),
    ],
  });

  add({
    id: 'vm-voyage', lvl: 6, icon: '🧭', min: 16,
    title: L('Voyage estimation & ship economics', 'تقدير الرحلة واقتصاديات السفن'),
    sub: L('TCE, bunker consumption vs speed, slow steaming, port & canal costs, CII and emissions.', 'العائد اليومي المكافئ TCE، استهلاك الوقود مقابل السرعة، الإبحار البطيء، تكاليف الميناء والقناة، مؤشر CII والانبعاثات.'),
    body: L(`
<h3>Time Charter Equivalent (TCE)</h3>
<p>Owners compare voyage charters with time charters using TCE — the net daily earning:</p>
<div class="formula">TCE (USD/day) = (Freight revenue − Voyage costs) ÷ Voyage days
Voyage costs = bunkers + port costs + canal dues + commissions (+ cargo handling if FIOS not agreed)</div>
<h3>Speed and fuel — the cube law</h3>
<div class="formula">Daily consumption ≈ k × V³   →   Consumption(V2) = Consumption(V1) × (V2 ÷ V1)³
Fuel per voyage ∝ V² (because the voyage takes fewer days at higher speed)</div>
<div class="ex" data-t="Example">A ship burns 60 t/day at 18 kn. At 14 kn: 60 × (14/18)³ = 60 × 0.47 = 28.2 t/day. Distance 4,200 nm: at 18 kn = 9.7 days × 60 = 583 t; at 14 kn = 12.5 days × 28.2 = 353 t. Saving 230 t × USD 600 = USD 138,000 — but 2.8 extra days (hire, cargo interest, schedule).</div>
<h3>Optimal speed</h3>
<p>Fast when freight rates/hire are high (time is money); slow when bunker prices are high and rates low (<b>slow steaming</b>). Ports matter: if the ship will wait 2 days at anchorage, it should arrive slower — this is <b>Just-In-Time arrival</b>.</p>
<h3>Port & canal costs</h3>
<p>Port dues (on GT), pilotage, towage, mooring, agency fee, light dues, canal transit (Suez/Panama, based on SCNT/PCUMS tonnage). These go in the voyage estimate from the agent's PDA.</p>
<h3>Emissions rules</h3>
<ul>
<li><b>IMO 2020</b>: max 0.50% sulphur fuel (0.10% in ECAs) or scrubbers.</li>
<li><b>EEXI</b> (design efficiency of existing ships) and <b>CII</b> (operational carbon intensity rating A–E, yearly).</li>
<li><b>EU ETS</b> for shipping: pay for CO₂ emitted on EU voyages; <b>FuelEU Maritime</b> for fuel GHG intensity.</li>
</ul>`,
`
<h3>العائد اليومي المكافئ للتأجير الزمني (TCE)</h3>
<p>يقارن المالكون تأجير الرحلة بالتأجير الزمني باستخدام TCE — صافي الربح اليومي:</p>
<div class="formula">TCE (USD/day) = (Freight revenue − Voyage costs) ÷ Voyage days
Voyage costs = bunkers + port costs + canal dues + commissions (+ cargo handling if FIOS not agreed)</div>
<h3>السرعة والوقود — قانون المكعّب</h3>
<div class="formula">Daily consumption ≈ k × V³   →   Consumption(V2) = Consumption(V1) × (V2 ÷ V1)³
Fuel per voyage ∝ V² (because the voyage takes fewer days at higher speed)</div>
<div class="ex" data-t="مثال">سفينة تحرق 60 طنًا/يوم بسرعة 18 عقدة. بسرعة 14 عقدة: 60 × (14/18)³ = 60 × 0.47 = 28.2 طن/يوم. المسافة 4,200 ميل: بسرعة 18 = 9.7 يوم × 60 = 583 طنًا؛ بسرعة 14 = 12.5 يوم × 28.2 = 353 طنًا. التوفير 230 طنًا × 600 دولار = 138,000 دولار — لكن 2.8 يوم إضافي (إيجار، فوائد البضاعة، الجدول).</div>
<h3>السرعة المثلى</h3>
<p>سريعًا عندما تكون الأجور/الإيجارات مرتفعة (الوقت مال)؛ وبطيئًا عندما يكون الوقود غاليًا والأجور منخفضة (<b>الإبحار البطيء</b>). الموانئ مهمّة: إن كانت السفينة ستنتظر يومين على المخطاف فعليها الوصول أبطأ — هذا هو <b>الوصول في الوقت المناسب</b>.</p>
<h3>تكاليف الميناء والقناة</h3>
<p>رسوم الميناء (على GT)، الإرشاد، القطر، الربط، أتعاب الوكالة، رسوم المنارات، عبور القناة (السويس/بنما، حسب حمولة SCNT/PCUMS). تدخل في تقدير الرحلة من حساب PDA للوكيل.</p>
<h3>قواعد الانبعاثات</h3>
<ul>
<li><b>IMO 2020</b>: وقود بنسبة كبريت 0.50% كحدّ أقصى (0.10% في مناطق ECA) أو أجهزة غسل العادم.</li>
<li><b>EEXI</b> (كفاءة التصميم للسفن القائمة) و<b>CII</b> (تصنيف كثافة الكربون التشغيلية من A إلى E سنويًا).</li>
<li><b>نظام الاتحاد الأوروبي لتداول الانبعاثات ETS</b> للشحن: الدفع عن ثاني أكسيد الكربون في رحلات الاتحاد؛ و<b>FuelEU Maritime</b> لكثافة غازات الوقود.</li>
</ul>`),
    keys: [L('TCE = (freight − voyage costs) ÷ days.', 'TCE = (الأجرة − تكاليف الرحلة) ÷ الأيام.'), L('Fuel/day ∝ speed³; fuel/voyage ∝ speed².', 'الوقود/اليوم ∝ السرعة³؛ الوقود/الرحلة ∝ السرعة².'), L('Waiting at anchorage wastes fuel — JIT arrival helps everyone.', 'الانتظار على المخطاف يهدر الوقود — الوصول في الوقت المناسب يفيد الجميع.')],
    senior: L('A port that shares reliable berth times lets ships slow down. That saves the line money and CO₂ — and makes your port the one they prefer.', 'الميناء الذي يشارك أوقات رسو موثوقة يتيح للسفن تخفيف سرعتها. هذا يوفّر على الخط المال وثاني أكسيد الكربون — ويجعل ميناءك المفضّل.'),
    quiz: [
      Q(L('Freight USD 900,000, voyage costs USD 420,000, 24 days. TCE?', 'الأجرة 900,000 دولار، تكاليف الرحلة 420,000، 24 يومًا. TCE؟'), [L('USD 37,500/day', '37,500 دولار/يوم'), L('USD 20,000/day', '20,000 دولار/يوم'), L('USD 17,500/day', '17,500 دولار/يوم'), L('USD 55,000/day', '55,000 دولار/يوم')], 1, L('(900,000 − 420,000) ÷ 24 = 20,000.', '(900,000 − 420,000) ÷ 24 = 20,000.')),
      Q(L('50 t/day at 20 kn. At 10 kn, daily consumption ≈', '50 طنًا/يوم بسرعة 20 عقدة. بسرعة 10 عقد، الاستهلاك اليومي ≈'), [L('25 t', '25 طنًا'), L('12.5 t', '12.5 طن'), L('6.25 t', '6.25 طن'), L('50 t', '50 طنًا')], 2, L('(10/20)³ = 1/8 → 6.25 t/day.', '(10/20)³ = 1/8 ← 6.25 طن/يوم.')),
      Q(L('CII is…', 'CII هو…'), [L('A crane index', 'مؤشر رافعات'), L('An annual carbon intensity rating A–E', 'تصنيف سنوي لكثافة الكربون من A إلى E'), L('A customs code', 'رمز جمركي'), L('A cargo insurance', 'تأمين بضاعة')], 1, L('Carbon Intensity Indicator under IMO.', 'مؤشر كثافة الكربون بموجب IMO.')),
    ],
  });

  add({
    id: 'vm-technical', lvl: 6, icon: '🔩', min: 15,
    title: L('Technical management, surveys & PSC', 'الإدارة الفنية والمعاينات والرقابة على السفن'),
    sub: L('Class & statutory certificates, survey cycle, drydock, planned maintenance, Port State Control, vetting.', 'شهادات التصنيف والشهادات القانونية، دورة المعاينات، الحوض الجاف، الصيانة المخطّطة، رقابة دولة الميناء، الفحص التجاري.'),
    body: L(`
<h3>Certificates every ship carries</h3>
<ul>
<li><b>Class</b>: hull & machinery class certificates (classification society).</li>
<li><b>Statutory</b> (on behalf of the flag): Safety Construction, Safety Equipment, Safety Radio, Load Line, IOPP (oil pollution), ISPP (sewage), IAPP (air), Ballast Water, ISM (SMC), ISPS (ISSC), MLC.</li>
<li>Crew certificates under STCW; minimum safe manning document.</li>
</ul>
<h3>The 5-year survey cycle</h3>
<div class="table-wrap"><table><thead><tr><th>Survey</th><th>When</th></tr></thead><tbody>
<tr><td>Annual survey</td><td>Every year ± 3 months</td></tr>
<tr><td>Intermediate survey</td><td>Around year 2.5</td></tr>
<tr><td>Special (renewal) survey</td><td>Every 5 years — usually with <b>drydocking</b></td></tr>
<tr><td>Bottom survey / drydock</td><td>Twice in 5 years (max 36 months apart)</td></tr>
</tbody></table></div>
<h3>Planned Maintenance System (PMS)</h3>
<p>All equipment has maintenance jobs by running hours or calendar. Critical equipment (steering, main engine, generators, emergency systems) is identified under ISM. Off-hire risk is the owner's big fear: under a time charter, hire stops when the ship cannot work.</p>
<h3>Port State Control (PSC)</h3>
<p>Port States inspect foreign ships under regional MoUs (Paris MoU, Tokyo MoU, <b>Mediterranean MoU</b>…). Deficiencies → rectify before departure; serious ones → <b>detention</b>. Detentions damage the ship's and manager's reputation and can block charters.</p>
<p>Common deficiencies: fire safety, lifesaving appliances, ISM, MARPOL (oily water separator), working/living conditions (MLC), navigation (charts, ECDIS).</p>
<h3>Vetting</h3>
<p>Oil majors and charterers inspect tankers (SIRE 2.0, CDI) and increasingly bulk/container ships (RightShip) before chartering them.</p>
<h3>Drydock planning</h3>
<p>Plan 6–12 months ahead: yard selection, specification, spares, class items, budget, off-hire days, positioning voyage. A 15–25 day drydock for a feeder can cost USD 0.8–2 M.</p>`,
`
<h3>الشهادات التي تحملها كل سفينة</h3>
<ul>
<li><b>التصنيف</b>: شهادات تصنيف البدن والآلات (هيئة التصنيف).</li>
<li><b>القانونية</b> (نيابة عن العلم): سلامة البناء، معدّات السلامة، الراديو، خط التحميل، IOPP (التلوّث النفطي)، ISPP (مياه الصرف)، IAPP (الهواء)، مياه الصابورة، ISM (SMC)، ISPS (ISSC)، MLC.</li>
<li>شهادات الطاقم بموجب STCW؛ ووثيقة الحدّ الأدنى للطاقم الآمن.</li>
</ul>
<h3>دورة المعاينات الخمسية</h3>
<div class="table-wrap"><table><thead><tr><th>المعاينة</th><th>متى</th></tr></thead><tbody>
<tr><td>المعاينة السنوية</td><td>كل سنة ± 3 أشهر</td></tr>
<tr><td>المعاينة الوسيطة</td><td>حوالي السنة 2.5</td></tr>
<tr><td>المعاينة الخاصة (التجديد)</td><td>كل 5 سنوات — عادةً مع <b>الحوض الجاف</b></td></tr>
<tr><td>معاينة القاع / الحوض الجاف</td><td>مرتين في 5 سنوات (بفاصل 36 شهرًا كحدّ أقصى)</td></tr>
</tbody></table></div>
<h3>نظام الصيانة المخطّطة (PMS)</h3>
<p>لكل معدّة مهام صيانة حسب ساعات التشغيل أو التقويم. المعدّات الحرجة (التوجيه، المحرّك الرئيسي، المولّدات، أنظمة الطوارئ) محدّدة بموجب ISM. خطر التوقف عن الإيجار (Off-hire) هو أكبر مخاوف المالك: في التأجير الزمني يتوقّف الإيجار عندما لا تستطيع السفينة العمل.</p>
<h3>رقابة دولة الميناء (PSC)</h3>
<p>تفتّش دول الموانئ السفن الأجنبية بموجب مذكّرات تفاهم إقليمية (باريس، طوكيو، <b>البحر المتوسط</b>…). أوجه القصور ← تُصحَّح قبل المغادرة؛ والخطيرة ← <b>احتجاز</b>. الاحتجازات تضرّ بسمعة السفينة والمدير وقد تمنع التأجير.</p>
<p>أوجه القصور الشائعة: السلامة من الحريق، معدّات الإنقاذ، ISM، MARPOL (فاصل المياه الزيتية)، ظروف العمل والمعيشة (MLC)، الملاحة (الخرائط، ECDIS).</p>
<h3>الفحص التجاري (Vetting)</h3>
<p>شركات النفط الكبرى والمستأجرون يفحصون الناقلات (SIRE 2.0، CDI) وبشكل متزايد سفن السائبة/الحاويات (RightShip) قبل استئجارها.</p>
<h3>تخطيط الحوض الجاف</h3>
<p>خطّط قبل 6–12 شهرًا: اختيار الحوض، المواصفات، قطع الغيار، بنود التصنيف، الميزانية، أيام التوقف، رحلة التموضع. حوض جاف لـ 15–25 يومًا لسفينة فيدر قد يكلّف 0.8–2 مليون دولار.</p>`),
    keys: [L('Class + statutory certificates must be valid at all times.', 'شهادات التصنيف والقانونية يجب أن تكون سارية دائمًا.'), L('Special survey every 5 years, drydock twice in 5 years.', 'معاينة خاصة كل 5 سنوات، وحوض جاف مرتين في 5 سنوات.'), L('PSC detention = reputation and commercial damage.', 'احتجاز PSC = ضرر للسمعة وتجاري.')],
    senior: L('For the port, a PSC detention means a ship occupying a berth it can’t leave. Agree early with the agent whether it moves to anchorage or a lay-by berth while repairs happen.', 'بالنسبة للميناء، احتجاز PSC يعني سفينة تشغل رصيفًا لا يمكنها مغادرته. اتّفق مبكرًا مع الوكيل على انتقالها إلى المخطاف أو رصيف انتظار أثناء الإصلاحات.'),
    quiz: [
      Q(L('How often is the special (renewal) survey?', 'كم مرة تُجرى المعاينة الخاصة (التجديد)؟'), [L('Every year', 'كل سنة'), L('Every 5 years', 'كل 5 سنوات'), L('Every 10 years', 'كل 10 سنوات'), L('Only at delivery', 'عند التسليم فقط')], 1, L('5-year class cycle.', 'دورة تصنيف من 5 سنوات.')),
      Q(L('Serious PSC deficiencies lead to…', 'أوجه القصور الخطيرة في PSC تؤدّي إلى…'), [L('A fine only', 'غرامة فقط'), L('Detention until rectified', 'الاحتجاز حتى التصحيح'), L('Change of flag', 'تغيير العلم'), L('Nothing', 'لا شيء')], 1, L('The ship cannot sail until fixed.', 'لا يمكن للسفينة الإبحار حتى الإصلاح.')),
      Q(L('Under a time charter, when the main engine breaks down for 3 days…', 'في التأجير الزمني، عندما يتعطّل المحرّك الرئيسي 3 أيام…'), [L('Charterer still pays hire', 'المستأجر يواصل دفع الإيجار'), L('Ship goes off-hire', 'تتوقّف السفينة عن الإيجار'), L('Port pays', 'الميناء يدفع'), L('Class pays', 'هيئة التصنيف تدفع')], 1, L('Off-hire clause protects the charterer.', 'بند التوقف عن الإيجار يحمي المستأجر.')),
    ],
  });

  add({
    id: 'vm-crew', lvl: 6, icon: '🧑‍✈️', min: 12,
    title: L('Crew management, STCW & MLC', 'إدارة الطاقم وSTCW وMLC'),
    sub: L('Manning, certificates, rest hours, crew changes in port, welfare and shore leave.', 'التطقيم، الشهادات، ساعات الراحة، تبديل الطاقم في الميناء، الرعاية والإجازة على البر.'),
    body: L(`
<h3>Manning a ship</h3>
<p>The flag issues a <b>Minimum Safe Manning</b> document. A 5,000 TEU container ship typically has 20–24 crew: master, chief officer, 2nd/3rd officers, chief engineer, 2nd/3rd/4th engineers, ETO, bosun, ABs, oilers, cook, steward.</p>
<h3>STCW — training & certification</h3>
<p>Every seafarer holds a Certificate of Competency (officers) or Proficiency (ratings), basic safety training (fire, survival, first aid), plus specials (tanker, ECDIS, security awareness). Certificates are revalidated every 5 years.</p>
<h3>Rest hours (STCW & MLC)</h3>
<div class="formula">Minimum rest: 10 hours in any 24 h (max 2 periods, one ≥ 6 h) and 77 hours in any 7 days</div>
<p>Port calls are where violations happen (cargo ops + mooring + inspections). Fatigue causes accidents — the terminal should not push crews into unsafe work.</p>
<h3>MLC 2006 — the seafarers' bill of rights</h3>
<ul><li>Employment agreement, wages paid at least monthly, repatriation rights.</li><li>Max contract usually ≤ 11 months.</li><li>Food, accommodation, medical care, complaint procedures.</li><li><b>Shore leave</b> and access to port welfare facilities.</li></ul>
<h3>Crew changes in port</h3>
<p>Need: visas/transit, immigration clearance, agent transport, flights timed with the port stay, medical checks. Ports that make crew change easy attract lines.</p>`,
`
<h3>تطقيم السفينة</h3>
<p>تصدر دولة العلم وثيقة <b>الحدّ الأدنى للطاقم الآمن</b>. سفينة حاويات 5,000 TEU تحمل عادةً 20–24 فردًا: الربّان، الضابط الأول، الضابطان الثاني والثالث، كبير المهندسين، المهندسون الثاني/الثالث/الرابع، مهندس الكهرباء، رئيس البحّارة، بحّارة مؤهّلون، مساعدو المحرّكات، الطاهي، المضيف.</p>
<h3>STCW — التدريب والشهادات</h3>
<p>يحمل كل بحّار شهادة أهلية (للضبّاط) أو كفاءة (للبحّارة)، والتدريب الأساسي على السلامة (حريق، نجاة، إسعافات أولية)، بالإضافة لتخصّصات (الناقلات، ECDIS، الوعي الأمني). تُجدَّد الشهادات كل 5 سنوات.</p>
<h3>ساعات الراحة (STCW وMLC)</h3>
<div class="formula">Minimum rest: 10 hours in any 24 h (max 2 periods, one ≥ 6 h) and 77 hours in any 7 days</div>
<p>زيارات الموانئ هي حيث تحدث المخالفات (عمليات البضاعة + الربط + التفتيشات). الإرهاق يسبّب الحوادث — يجب ألّا تدفع المحطة الطواقم إلى عمل غير آمن.</p>
<h3>MLC 2006 — وثيقة حقوق البحّارة</h3>
<ul><li>عقد عمل، رواتب تُدفع شهريًا على الأقل، حقوق الإعادة إلى الوطن.</li><li>مدة العقد القصوى عادةً ≤ 11 شهرًا.</li><li>الطعام، السكن، الرعاية الطبية، إجراءات الشكاوى.</li><li><b>الإجازة على البر</b> والوصول لمرافق رعاية البحّارة في الميناء.</li></ul>
<h3>تبديل الطاقم في الميناء</h3>
<p>يحتاج: تأشيرات/عبور، تخليص الهجرة، نقل من الوكيل، رحلات جوية متوافقة مع مدة البقاء، فحوص طبية. الموانئ التي تسهّل تبديل الطاقم تجذب الخطوط.</p>`),
    keys: [L('Minimum safe manning set by the flag.', 'الحدّ الأدنى للطاقم الآمن تحدّده دولة العلم.'), L('Rest: 10 h/24 h and 77 h/7 days.', 'الراحة: 10 ساعات/24 ساعة و77 ساعة/7 أيام.'), L('MLC protects wages, repatriation, welfare and shore leave.', 'MLC تحمي الرواتب والإعادة للوطن والرعاية والإجازة على البر.')],
    senior: L('Treat crews with respect at your gate and quay: safe walkways, quick shore passes, a working welfare centre. Masters remember the ports that cared — and they talk to their companies.', 'عامل الطواقم باحترام على بوابتك ورصيفك: ممرّات آمنة، تصاريح خروج سريعة، مركز رعاية يعمل. الربابنة يتذكّرون الموانئ التي اهتمّت — ويتحدّثون مع شركاتهم.'),
    quiz: [
      Q(L('Minimum rest in any 7 days under STCW/MLC?', 'الحدّ الأدنى للراحة في أي 7 أيام بموجب STCW/MLC؟'), [L('70 h', '70 ساعة'), L('77 h', '77 ساعة'), L('84 h', '84 ساعة'), L('56 h', '56 ساعة')], 1, L('77 hours in 7 days, 10 in 24.', '77 ساعة في 7 أيام، و10 في 24.')),
      Q(L('Who issues the minimum safe manning document?', 'من يصدر وثيقة الحدّ الأدنى للطاقم الآمن؟'), [L('Port State', 'دولة الميناء'), L('Flag State', 'دولة العلم'), L('Class', 'هيئة التصنيف'), L('Charterer', 'المستأجر')], 1, L('Flag State responsibility.', 'مسؤولية دولة العلم.')),
      Q(L('Which convention covers seafarers’ wages and repatriation?', 'أي اتفاقية تغطّي رواتب البحّارة وإعادتهم للوطن؟'), [L('MARPOL', 'MARPOL'), L('MLC 2006', 'MLC 2006'), L('ISPS', 'ISPS'), L('IMDG', 'IMDG')], 1, L('Maritime Labour Convention.', 'اتفاقية العمل البحري.')),
    ],
  });

  /* =========================================================== LEVEL 7 — BULK & SILO TERMINALS */
  add({
    id: 'silo-terminal', lvl: 7, icon: '🌾', min: 20,
    title: L('Dry bulk & grain silo terminals', 'محطات البضائع السائبة الجافة وصوامع الحبوب'),
    sub: L('Commodities, unloaders, conveyors, bucket elevators, silo bins vs flat storage, capacity in tonnes.', 'السلع، المفرّغات، السيور، المصاعد القادوسية، خلايا الصوامع مقابل التخزين الأرضي، السعة بالأطنان.'),
    body: L(`
<h3>Dry bulk families</h3>
<ul><li><b>Major bulks</b>: iron ore, coal, grain.</li><li><b>Minor bulks</b>: fertilisers, cement, clinker, sugar, soybean meal, salt, scrap.</li></ul>
<p>Grain terminals (wheat, corn, barley, soybeans) are vital for food security — Lebanon, for example, imports most of its wheat.</p>
<h3>The flow in a grain import terminal</h3>
<div class="formula">Ship → unloader → belt conveyors → weighing (hopper scale) → bucket elevator → distribution → silo bins
Silo bins → conveyors → (cleaning) → truck/rail loading → weighbridge → mills</div>
<h3>Equipment</h3>
<div class="table-wrap"><table><thead><tr><th>Equipment</th><th>Notes</th><th>Typical rate</th></tr></thead><tbody>
<tr><td>Pneumatic unloader (vacuum)</td><td>Flexible, dust-tight, high energy use</td><td>300–1,000 t/h</td></tr>
<tr><td>Mechanical unloader (screw/chain)</td><td>Efficient, higher rate</td><td>600–2,000 t/h</td></tr>
<tr><td>Grab crane + hopper</td><td>Multi-purpose berths, more dust</td><td>300–1,000 t/h</td></tr>
<tr><td>Belt / chain conveyors</td><td>Horizontal transport</td><td>matched to unloaders</td></tr>
<tr><td>Bucket elevator</td><td>Vertical lift to top of silos</td><td>matched</td></tr>
<tr><td>Hopper scale / weighbridge</td><td>Legal-for-trade weighing</td><td>—</td></tr>
<tr><td>Ship loader</td><td>For exports</td><td>1,000–3,000 t/h</td></tr>
</tbody></table></div>
<p><b>Effective rate</b> is much lower than nominal: cleaning-up phase at the bottom of holds (trimming), hatch changes, weather (rain stops grain handling!), truck availability. Rule of thumb: effective ≈ 50–70% of nominal.</p>
<h3>Storage types</h3>
<ul>
<li><b>Concrete or steel silo bins</b>: vertical, automated, aeration & temperature cables, easy segregation by lot.</li>
<li><b>Flat storage / warehouses</b>: cheaper per tonne, slower handling, front loaders, higher losses.</li>
</ul>
<h3>Capacity in tonnes</h3>
<div class="formula">Capacity (t) = Volume (m³) × Bulk density (t/m³)
Cylinder volume = π × r² × h
Typical bulk density: wheat 0.78 · corn 0.72 · soybeans 0.75 · barley 0.62 · cement 1.4–1.5 t/m³</div>
<div class="ex" data-t="Example">Bin Ø 12 m, height 28 m → V = 3.1416 × 36 × 28 = 3,167 m³. Wheat: 3,167 × 0.78 = 2,470 t. Barley in the same bin: only 1,964 t. A bin is "full" at very different tonnages depending on the commodity.</div>`,
`
<h3>عائلات البضائع السائبة الجافة</h3>
<ul><li><b>السائبة الرئيسية</b>: خام الحديد، الفحم، الحبوب.</li><li><b>السائبة الثانوية</b>: الأسمدة، الإسمنت، الكلنكر، السكر، كسبة الصويا، الملح، الخردة.</li></ul>
<p>محطات الحبوب (القمح، الذرة، الشعير، فول الصويا) حيوية للأمن الغذائي — لبنان مثلًا يستورد معظم قمحه.</p>
<h3>التدفّق في محطة استيراد الحبوب</h3>
<div class="formula">Ship → unloader → belt conveyors → weighing (hopper scale) → bucket elevator → distribution → silo bins
Silo bins → conveyors → (cleaning) → truck/rail loading → weighbridge → mills</div>
<h3>المعدّات</h3>
<div class="table-wrap"><table><thead><tr><th>المعدّة</th><th>ملاحظات</th><th>المعدّل النموذجي</th></tr></thead><tbody>
<tr><td>مفرّغة هوائية (شفط)</td><td>مرنة، محكمة ضد الغبار، استهلاك طاقة عالٍ</td><td>300–1,000 طن/س</td></tr>
<tr><td>مفرّغة ميكانيكية (لولبية/سلسلة)</td><td>فعّالة، معدّل أعلى</td><td>600–2,000 طن/س</td></tr>
<tr><td>رافعة بكبّاش + قادوس</td><td>أرصفة متعدّدة الأغراض، غبار أكثر</td><td>300–1,000 طن/س</td></tr>
<tr><td>سيور / ناقلات سلسلة</td><td>النقل الأفقي</td><td>متوافقة مع المفرّغات</td></tr>
<tr><td>مصعد قادوسي</td><td>رفع عمودي لأعلى الصوامع</td><td>متوافق</td></tr>
<tr><td>ميزان قادوس / ميزان جسري</td><td>وزن معتمد تجاريًا</td><td>—</td></tr>
<tr><td>محمّل السفن</td><td>للتصدير</td><td>1,000–3,000 طن/س</td></tr>
</tbody></table></div>
<p><b>المعدّل الفعلي</b> أقل بكثير من الاسمي: مرحلة التنظيف في قاع العنابر (التسوية)، تبديل العنابر، الطقس (المطر يوقف مناولة الحبوب!)، توفّر الشاحنات. قاعدة عملية: الفعلي ≈ 50–70% من الاسمي.</p>
<h3>أنواع التخزين</h3>
<ul>
<li><b>خلايا صوامع خرسانية أو فولاذية</b>: عمودية، مؤتمتة، تهوية وكابلات حرارة، فصل سهل حسب الدفعة.</li>
<li><b>التخزين الأرضي / المستودعات</b>: أرخص لكل طن، مناولة أبطأ، جرّافات أمامية، خسائر أعلى.</li>
</ul>
<h3>السعة بالأطنان</h3>
<div class="formula">Capacity (t) = Volume (m³) × Bulk density (t/m³)
Cylinder volume = π × r² × h
Typical bulk density: wheat 0.78 · corn 0.72 · soybeans 0.75 · barley 0.62 · cement 1.4–1.5 t/m³</div>
<div class="ex" data-t="مثال">خلية قطرها 12 م وارتفاعها 28 م ← الحجم = 3.1416 × 36 × 28 = 3,167 م³. القمح: 3,167 × 0.78 = 2,470 طنًا. الشعير في الخلية نفسها: 1,964 طنًا فقط. الخلية “ممتلئة” بأطنان مختلفة جدًا حسب السلعة.</div>`),
    keys: [L('Ship → unloader → conveyor → scale → elevator → bin.', 'السفينة ← المفرّغة ← السير ← الميزان ← المصعد ← الخلية.'), L('Capacity (t) = volume × bulk density.', 'السعة (طن) = الحجم × الكثافة الظاهرية.'), L('Effective unloading ≈ 50–70% of nominal; rain stops grain.', 'التفريغ الفعلي ≈ 50–70% من الاسمي؛ المطر يوقف الحبوب.')],
    senior: L('Plan bins before the ship arrives: which lot (commodity, origin, grade, owner) goes where, keep one empty bin as a turning/emergency bin, and confirm truck dispatch so the silo does not fill up mid-discharge.', 'خطّط الخلايا قبل وصول السفينة: أي دفعة (السلعة، المنشأ، الدرجة، المالك) تذهب أين، أبقِ خلية فارغة للتقليب/الطوارئ، وأكّد خروج الشاحنات حتى لا تمتلئ الصوامع في منتصف التفريغ.'),
    quiz: [
      Q(L('Bin volume 4,000 m³, corn density 0.72. Capacity?', 'حجم الخلية 4,000 م³، كثافة الذرة 0.72. السعة؟'), [L('2,880 t', '2,880 طنًا'), L('5,556 t', '5,556 طنًا'), L('4,000 t', '4,000 طن'), L('3,120 t', '3,120 طنًا')], 0, L('4,000 × 0.72 = 2,880 t.', '4,000 × 0.72 = 2,880 طنًا.')),
      Q(L('Which unloader is most dust-tight but energy-hungry?', 'أي مفرّغة هي الأكثر إحكامًا ضد الغبار لكنها تستهلك طاقة كبيرة؟'), [L('Grab crane', 'رافعة بكبّاش'), L('Pneumatic', 'الهوائية'), L('Ship loader', 'محمّل السفن'), L('Front loader', 'جرّافة أمامية')], 1, L('Vacuum systems are enclosed.', 'أنظمة الشفط مغلقة.')),
      Q(L('Why is effective discharge lower than nominal?', 'لماذا التفريغ الفعلي أقل من الاسمي؟'), [L('Customs', 'الجمارك'), L('Trimming at hold bottom, hatch changes, rain, trucks', 'التسوية في قاع العنبر، تبديل العنابر، المطر، الشاحنات'), L('Bulk density', 'الكثافة الظاهرية'), L('Port dues', 'رسوم الميناء')], 1, L('Clean-up and stoppages reduce the average rate.', 'التنظيف والتوقفات تخفض المعدّل المتوسط.')),
    ],
  });

  add({
    id: 'silo-quality', lvl: 7, icon: '🌡', min: 18,
    title: L('Grain quality & storage management', 'جودة الحبوب وإدارة التخزين'),
    sub: L('Moisture, temperature, aeration, drying shrink, fumigation, insects, sampling, FIFO, stock control.', 'الرطوبة، الحرارة، التهوية، فقد التجفيف، التبخير، الحشرات، أخذ العيّنات، الوارد أولًا يصرف أولًا، مراقبة المخزون.'),
    body: L(`
<h3>Grain is alive</h3>
<p>Grain breathes, heats and can be attacked by insects and moulds. The two main controls are <b>moisture</b> and <b>temperature</b>.</p>
<ul>
<li>Safe storage moisture: wheat ≤ 13–14%, corn ≤ 14%, soybeans ≤ 12–13% (lower for long storage).</li>
<li>Warm + wet grain → mould → <b>mycotoxins</b> (e.g. aflatoxin) → cargo rejected.</li>
<li>Temperature cables in bins show <b>hot spots</b>; a rising temperature (+2–3 °C/week) is a warning.</li>
</ul>
<h3>Aeration, turning & drying</h3>
<ul>
<li><b>Aeration</b>: blow ambient air (when cooler/drier) through the grain to cool it.</li>
<li><b>Turning</b>: move grain from one bin to another to break hot spots — this is why you keep an empty bin.</li>
<li><b>Drying</b>: reduce moisture in a dryer. Weight is lost (shrink):</li>
</ul>
<div class="formula">Weight after drying = Weight before × (100 − M1) ÷ (100 − M2)
M1 = initial moisture %, M2 = final moisture %</div>
<div class="ex" data-t="Example">1,000 t corn at 17% dried to 14%: 1,000 × 83 ÷ 86 = 965.1 t → 34.9 t of water removed.</div>
<h3>Pests & fumigation</h3>
<p>Stored-grain insects (weevils, beetles) are controlled by cleanliness, cooling and <b>fumigation</b> (usually phosphine). Fumigation is highly toxic: licensed fumigators, gas-tight bins, warning signs, gas monitoring, ventilation before entry.</p>
<h3>Sampling, grading & weighing</h3>
<ul>
<li>Representative sampling (probes, automatic samplers) at discharge and at out-loading.</li>
<li>Tests: moisture, test weight (hectolitre), protein, foreign matter, broken kernels, insects, mycotoxins.</li>
<li>Weight: hopper scales (in), weighbridges (out), and the ship's <b>draft survey</b> as a cross-check.</li>
</ul>
<h3>Stock control</h3>
<p>Keep lots segregated by owner/commodity/grade/origin. Principle: <b>FIFO</b> (first in, first out) to avoid ageing stock. Accept a small <b>handling loss</b> (e.g. 0.1–0.3%) agreed in the contract; anything beyond is investigated.</p>`,
`
<h3>الحبوب كائن حي</h3>
<p>الحبوب تتنفّس وتسخن وقد تهاجمها الحشرات والفطريات. أهم أداتي تحكّم هما <b>الرطوبة</b> و<b>الحرارة</b>.</p>
<ul>
<li>رطوبة التخزين الآمن: القمح ≤ 13–14%، الذرة ≤ 14%، فول الصويا ≤ 12–13% (أقل للتخزين الطويل).</li>
<li>حبوب دافئة + رطبة ← عفن ← <b>سموم فطرية</b> (مثل الأفلاتوكسين) ← رفض البضاعة.</li>
<li>كابلات الحرارة في الخلايا تكشف <b>البؤر الساخنة</b>؛ ارتفاع الحرارة (+2–3 °م/أسبوع) إنذار.</li>
</ul>
<h3>التهوية والتقليب والتجفيف</h3>
<ul>
<li><b>التهوية</b>: دفع الهواء الخارجي (عندما يكون أبرد/أجفّ) عبر الحبوب لتبريدها.</li>
<li><b>التقليب</b>: نقل الحبوب من خلية لأخرى لكسر البؤر الساخنة — لهذا تحتفظ بخلية فارغة.</li>
<li><b>التجفيف</b>: خفض الرطوبة في مجفّف. يُفقد وزن (الانكماش):</li>
</ul>
<div class="formula">Weight after drying = Weight before × (100 − M1) ÷ (100 − M2)
M1 = initial moisture %, M2 = final moisture %</div>
<div class="ex" data-t="مثال">1,000 طن ذرة برطوبة 17% جُفّفت إلى 14%: 1,000 × 83 ÷ 86 = 965.1 طنًا ← أُزيل 34.9 طن من الماء.</div>
<h3>الآفات والتبخير</h3>
<p>حشرات الحبوب المخزّنة (السوس، الخنافس) تُكافح بالنظافة والتبريد و<b>التبخير</b> (عادةً بالفوسفين). التبخير شديد السمّية: مبخّرون مرخّصون، خلايا محكمة الغاز، لافتات تحذير، مراقبة الغاز، تهوية قبل الدخول.</p>
<h3>العيّنات والتصنيف والوزن</h3>
<ul>
<li>أخذ عيّنات تمثيلية (مجسّات، أجهزة آلية) عند التفريغ وعند الإخراج.</li>
<li>الفحوص: الرطوبة، الوزن النوعي (الهكتوليتر)، البروتين، الشوائب، الحبوب المكسورة، الحشرات، السموم الفطرية.</li>
<li>الوزن: موازين القادوس (دخول)، الموازين الجسرية (خروج)، و<b>مسح الغاطس</b> للسفينة كمراجعة.</li>
</ul>
<h3>مراقبة المخزون</h3>
<p>افصل الدفعات حسب المالك/السلعة/الدرجة/المنشأ. المبدأ: <b>الوارد أولًا يصرف أولًا (FIFO)</b> لتجنّب تقادم المخزون. اقبل <b>فاقد مناولة</b> صغيرًا (مثلًا 0.1–0.3%) متّفقًا عليه في العقد؛ وما يتجاوزه يُحقَّق فيه.</p>`),
    keys: [L('Moisture and temperature decide grain safety.', 'الرطوبة والحرارة تحدّدان سلامة الحبوب.'), L('Drying shrink: W × (100−M1) ÷ (100−M2).', 'فقد التجفيف: الوزن × (100−M1) ÷ (100−M2).'), L('FIFO, segregation and an empty turning bin.', 'الوارد أولًا يصرف أولًا، الفصل، وخلية فارغة للتقليب.')],
    senior: L('Walk the silo top weekly and read the temperature report daily. A hot spot found in week 1 costs a turning; found in week 4 it costs a cargo.', 'تجوّل على سطح الصوامع أسبوعيًا واقرأ تقرير الحرارة يوميًا. البؤرة الساخنة المكتشفة في الأسبوع الأول تكلّف تقليبًا؛ وفي الأسبوع الرابع تكلّف شحنة كاملة.'),
    quiz: [
      Q(L('2,000 t wheat at 15.5% dried to 13.5%. Weight after?', '2,000 طن قمح برطوبة 15.5% جُفّف إلى 13.5%. الوزن بعده؟'), [L('1,953.8 t', '1,953.8 طنًا'), L('1,960.0 t', '1,960.0 طنًا'), L('1,969.1 t', '1,969.1 طنًا'), L('2,040 t', '2,040 طنًا')], 0, L('2,000 × 84.5 ÷ 86.5 = 1,953.8 t.', '2,000 × 84.5 ÷ 86.5 = 1,953.8 طنًا.')),
      Q(L('Temperature in bin 12 rose 3 °C in a week. Best action?', 'ارتفعت حرارة الخلية 12 بـ 3 °م في أسبوع. أفضل إجراء؟'), [L('Wait', 'الانتظار'), L('Aerate and/or turn the grain into the empty bin, sample for insects/moisture', 'التهوية و/أو تقليب الحبوب إلى الخلية الفارغة، وأخذ عيّنات للحشرات/الرطوبة'), L('Add more grain', 'إضافة حبوب أكثر'), L('Spray water', 'رشّ الماء')], 1, L('Break the hot spot early.', 'اكسر البؤرة الساخنة مبكرًا.')),
      Q(L('Phosphine is used for…', 'يُستخدم الفوسفين لـ…'), [L('Drying', 'التجفيف'), L('Fumigation against insects', 'التبخير ضد الحشرات'), L('Weighing', 'الوزن'), L('Dust control', 'مكافحة الغبار')], 1, L('A toxic fumigant — strict safety rules.', 'مبخّر سام — قواعد سلامة صارمة.')),
    ],
  });

  add({
    id: 'silo-safety', lvl: 7, icon: '💥', min: 14,
    title: L('Silo safety: dust explosions & confined spaces', 'سلامة الصوامع: انفجارات الغبار والأماكن المغلقة'),
    sub: L('Dust explosion pentagon, ATEX zones, housekeeping, engulfment, confined-space entry, fumigant gas.', 'خماسي انفجار الغبار، مناطق ATEX، النظافة، الانغمار، الدخول للأماكن المغلقة، غاز التبخير.'),
    body: L(`
<h3>The dust explosion pentagon</h3>
<p>Grain dust is explosive. An explosion needs all five: <b>fuel</b> (dust), <b>oxygen</b>, <b>ignition</b> (hot bearing, sparks, welding, static), <b>dispersion</b> (dust cloud) and <b>confinement</b> (elevator leg, bin, gallery). A small primary explosion shakes settled dust → a much larger <b>secondary explosion</b>.</p>
<h3>Prevention</h3>
<ul>
<li><b>Housekeeping</b>: no dust layers on floors/beams (a layer of ~1 mm can be enough for a secondary explosion).</li>
<li>Dust extraction / aspiration and filters; enclosed transfer points.</li>
<li><b>ATEX</b> equipment in classified zones (20/21/22 for dust); bonding & earthing against static.</li>
<li>Bearing temperature and belt-misalignment sensors on elevators and conveyors.</li>
<li><b>Hot-work permits</b> with dust cleaning, fire watch and gas/dust checks.</li>
<li>Explosion venting, suppression and isolation on elevators and filters.</li>
</ul>
<h3>Engulfment & confined spaces</h3>
<p>Never enter a bin while grain is moving (“flowing grain acts like quicksand”); never walk on crusted/bridged grain. Bin entry = <b>confined-space permit</b>: lock-out of all conveyors, gas test (O₂, phosphine, CO₂), harness and lifeline, standby person outside, rescue plan.</p>
<h3>Other hazards</h3>
<ul><li>Fumigant gas (phosphine) — lethal; respect re-entry times and gas readings.</li><li>Falls from height (silo tops, ship hatches).</li><li>Moving machinery (guarding, LOTO).</li><li>Truck traffic in loading bays.</li></ul>`,
`
<h3>خماسي انفجار الغبار</h3>
<p>غبار الحبوب قابل للانفجار. يحتاج الانفجار إلى العناصر الخمسة كلها: <b>الوقود</b> (الغبار)، <b>الأكسجين</b>، <b>الاشتعال</b> (محمل ساخن، شرر، لحام، كهرباء ساكنة)، <b>الانتشار</b> (سحابة غبار) و<b>الحصر</b> (عمود المصعد، الخلية، الممرّ). انفجار أولي صغير يهزّ الغبار المترسّب ← <b>انفجار ثانوي</b> أكبر بكثير.</p>
<h3>الوقاية</h3>
<ul>
<li><b>النظافة</b>: لا طبقات غبار على الأرضيات/العوارض (طبقة ~1 مم قد تكفي لانفجار ثانوي).</li>
<li>شفط الغبار والمرشّحات؛ نقاط تحويل مغلقة.</li>
<li>معدّات <b>ATEX</b> في المناطق المصنّفة (20/21/22 للغبار)؛ الربط والتأريض ضد الكهرباء الساكنة.</li>
<li>حسّاسات حرارة المحامل وانحراف السيور على المصاعد والسيور.</li>
<li><b>تصاريح العمل الساخن</b> مع تنظيف الغبار ومراقب حريق وفحص الغاز/الغبار.</li>
<li>فتحات تنفيس الانفجار والإخماد والعزل على المصاعد والمرشّحات.</li>
</ul>
<h3>الانغمار والأماكن المغلقة</h3>
<p>لا تدخل خلية أبدًا والحبوب تتحرّك (“الحبوب المتدفّقة كالرمال المتحرّكة”)؛ لا تمشِ على حبوب متقشّرة/متجسّرة. دخول الخلية = <b>تصريح مكان مغلق</b>: قفل كل السيور، فحص الغاز (الأكسجين، الفوسفين، ثاني أكسيد الكربون)، حزام وحبل نجاة، شخص احتياطي خارجها، خطة إنقاذ.</p>
<h3>مخاطر أخرى</h3>
<ul><li>غاز التبخير (الفوسفين) — قاتل؛ احترم أوقات إعادة الدخول وقراءات الغاز.</li><li>السقوط من ارتفاع (أسطح الصوامع، عنابر السفن).</li><li>الآلات المتحرّكة (الحواجز، LOTO).</li><li>حركة الشاحنات في مسارات التحميل.</li></ul>`),
    keys: [L('Fuel + oxygen + ignition + dispersion + confinement = explosion.', 'وقود + أكسجين + اشتعال + انتشار + حصر = انفجار.'), L('Housekeeping prevents secondary explosions.', 'النظافة تمنع الانفجارات الثانوية.'), L('Bin entry only with a confined-space permit and all conveyors locked out.', 'دخول الخلية فقط بتصريح مكان مغلق وقفل كل السيور.')],
    senior: L('If you see a dust layer you can write your name in, stop and clean before work continues. Productivity never justifies dust.', 'إن رأيت طبقة غبار يمكنك كتابة اسمك عليها، أوقف العمل ونظّف قبل المتابعة. الإنتاجية لا تبرّر الغبار أبدًا.'),
    quiz: [
      Q(L('Which is NOT part of the dust explosion pentagon?', 'أيّ مما يلي ليس من خماسي انفجار الغبار؟'), [L('Dispersion', 'الانتشار'), L('Confinement', 'الحصر'), L('Moisture', 'الرطوبة'), L('Ignition', 'الاشتعال')], 2, L('Fuel, oxygen, ignition, dispersion, confinement.', 'الوقود، الأكسجين، الاشتعال، الانتشار، الحصر.')),
      Q(L('Why are secondary explosions so dangerous?', 'لماذا الانفجارات الثانوية خطيرة جدًا؟'), [L('They are quieter', 'أهدأ'), L('Settled dust is lifted and ignites over a large area', 'الغبار المترسّب يرتفع ويشتعل في مساحة كبيرة'), L('They only happen outside', 'تحدث في الخارج فقط'), L('They are rare', 'نادرة')], 1, L('Housekeeping removes the fuel for them.', 'النظافة تزيل وقودها.')),
      Q(L('A worker must enter a bin to clear a blockage. Required?', 'عامل يجب أن يدخل خلية لإزالة انسداد. المطلوب؟'), [L('Just a helmet', 'خوذة فقط'), L('Confined-space permit, LOTO, gas test, harness, standby & rescue plan', 'تصريح مكان مغلق، LOTO، فحص غاز، حزام، شخص احتياطي وخطة إنقاذ'), L('Do it while conveyors run to save time', 'افعلها والسيور تعمل لتوفير الوقت'), L('Nothing if quick', 'لا شيء إن كان سريعًا')], 1, L('Engulfment and gas can kill in minutes.', 'الانغمار والغاز قد يقتلان خلال دقائق.')),
    ],
  });

  add({
    id: 'bulk-ops', lvl: 7, icon: '⚓', min: 16,
    title: L('Bulk vessel operations & draft survey', 'عمليات سفن السائبة ومسح الغاطس'),
    sub: L('Discharge planning, hatch sequence, trimming, truck dispatch, draft survey and outturn.', 'تخطيط التفريغ، تسلسل العنابر، التسوية، إرسال الشاحنات، مسح الغاطس والكميات المسلّمة.'),
    body: L(`
<h3>Planning a grain discharge</h3>
<ul>
<li>Receive the <b>cargo plan</b> (quantity per hold, lots, owners) and documents (B/L, phytosanitary certificate, fumigation certificate, quality certificate).</li>
<li>Check silo space per lot, unloader availability, truck/rail plan, weather forecast.</li>
<li>Agree <b>hatch sequence</b> with the chief officer to keep the ship's stress and trim within limits.</li>
<li>Expect rate to drop during <b>clean-up</b> (last 10–15% of each hold) — bobcats lowered into holds.</li>
</ul>
<div class="formula">Discharge time (h) = Quantity ÷ Effective rate
Effective rate = Nominal × availability × (1 − stoppage share)</div>
<h3>Direct delivery vs storage</h3>
<p>Some cargo goes straight to trucks (<b>direct delivery</b>), the rest to silos. If trucks are short and silos full, the ship stops → <b>laytime and demurrage</b> exposure for the receivers.</p>
<h3>Draft survey — weighing the ship</h3>
<p>An independent surveyor reads the drafts (fore, aft, midships, both sides) before and after discharge, corrects for trim, list, density, and deducts ballast, fuel, fresh water and the ship's constant.</p>
<div class="formula">Simplified: Cargo (t) ≈ Δ mean draft (cm) × TPC (tonnes per cm immersion)
Full method: Cargo = Displacement(initial) − Displacement(final) − Δ(ballast + fuel + water + constant)</div>
<div class="ex" data-t="Example">Mean draft before 11.42 m, after 5.18 m → 624 cm × TPC 58 t/cm ≈ 36,192 t (before the deductibles and density corrections).</div>
<h3>Outturn & claims</h3>
<p>Compare B/L quantity, draft survey and shore scale weights. A difference over the agreed tolerance (e.g. 0.5%) → shortage claim. Quality differences (moisture, damage) → quality claim. Your scale calibration certificates and sampling records protect the terminal.</p>`,
`
<h3>تخطيط تفريغ الحبوب</h3>
<ul>
<li>استلم <b>خطة البضاعة</b> (الكمية لكل عنبر، الدفعات، المالكون) والمستندات (البوليصة، الشهادة الصحية النباتية، شهادة التبخير، شهادة الجودة).</li>
<li>تحقّق من مساحة الصوامع لكل دفعة، توفّر المفرّغات، خطة الشاحنات/القطار، توقّعات الطقس.</li>
<li>اتّفق على <b>تسلسل العنابر</b> مع الضابط الأول لإبقاء إجهادات السفينة وميلها ضمن الحدود.</li>
<li>توقّع انخفاض المعدّل أثناء <b>التنظيف</b> (آخر 10–15% من كل عنبر) — تُنزل جرّافات صغيرة إلى العنابر.</li>
</ul>
<div class="formula">Discharge time (h) = Quantity ÷ Effective rate
Effective rate = Nominal × availability × (1 − stoppage share)</div>
<h3>التسليم المباشر مقابل التخزين</h3>
<p>بعض البضاعة تذهب مباشرة إلى الشاحنات (<b>تسليم مباشر</b>)، والباقي إلى الصوامع. إن نقصت الشاحنات وامتلأت الصوامع، تتوقّف السفينة ← تعرّض المستلمين لـ <b>زمن الرسو وغرامة التأخير</b>.</p>
<h3>مسح الغاطس — وزن السفينة</h3>
<p>يقرأ مُعاين مستقل الغواطس (المقدّمة، المؤخّرة، الوسط، الجانبين) قبل التفريغ وبعده، ويصحّح للميل الطولي والعرضي والكثافة، ويخصم الصابورة والوقود والمياه العذبة وثابت السفينة.</p>
<div class="formula">Simplified: Cargo (t) ≈ Δ mean draft (cm) × TPC (tonnes per cm immersion)
Full method: Cargo = Displacement(initial) − Displacement(final) − Δ(ballast + fuel + water + constant)</div>
<div class="ex" data-t="مثال">متوسط الغاطس قبل 11.42 م، وبعد 5.18 م ← 624 سم × TPC 58 طن/سم ≈ 36,192 طنًا (قبل الخصومات وتصحيح الكثافة).</div>
<h3>الكميات المسلّمة والمطالبات</h3>
<p>قارن كمية البوليصة ومسح الغاطس وأوزان موازين البر. فرق يتجاوز التسامح المتّفق عليه (مثلًا 0.5%) ← مطالبة نقص. فروق الجودة (رطوبة، ضرر) ← مطالبة جودة. شهادات معايرة موازينك وسجلّات العيّنات تحمي المحطة.</p>`),
    keys: [L('Plan silo space, trucks and weather before the ship berths.', 'خطّط مساحة الصوامع والشاحنات والطقس قبل رسو السفينة.'), L('Clean-up slows the last 10–15% of each hold.', 'التنظيف يبطئ آخر 10–15% من كل عنبر.'), L('Draft survey ≈ Δdraft (cm) × TPC, then corrections.', 'مسح الغاطس ≈ فرق الغاطس (سم) × TPC، ثم التصحيحات.')],
    senior: L('The silo is part of the ship’s laytime. If out-loading to mills stops, the ship stops. Hold a daily truck plan meeting with the receivers during every discharge.', 'الصومعة جزء من زمن رسو السفينة. إن توقّف الإخراج للمطاحن، توقّفت السفينة. اعقد اجتماعًا يوميًا لخطة الشاحنات مع المستلمين أثناء كل تفريغ.'),
    quiz: [
      Q(L('32,000 t at an effective 750 t/h. Discharge time?', '32,000 طن بمعدّل فعلي 750 طن/س. زمن التفريغ؟'), [L('32 h', '32 ساعة'), L('42.7 h', '42.7 ساعة'), L('24 h', '24 ساعة'), L('75 h', '75 ساعة')], 1, L('32,000 ÷ 750 = 42.7 h.', '32,000 ÷ 750 = 42.7 ساعة.')),
      Q(L('Mean draft change 410 cm, TPC 45. Approx. cargo?', 'فرق متوسط الغاطس 410 سم، TPC = 45. البضاعة تقريبًا؟'), [L('18,450 t', '18,450 طنًا'), L('9,111 t', '9,111 طنًا'), L('4,100 t', '4,100 طن'), L('45,000 t', '45,000 طن')], 0, L('410 × 45 = 18,450 t.', '410 × 45 = 18,450 طنًا.')),
      Q(L('Silos full and no trucks. Consequence?', 'الصوامع ممتلئة ولا شاحنات. النتيجة؟'), [L('Nothing', 'لا شيء'), L('Ship stops; receivers face demurrage', 'تتوقّف السفينة؛ ويتحمّل المستلمون غرامة التأخير'), L('Customs fine', 'غرامة جمركية'), L('Faster discharge', 'تفريغ أسرع')], 1, L('Storage and out-loading are part of the discharge chain.', 'التخزين والإخراج جزء من سلسلة التفريغ.')),
    ],
  });
})();
