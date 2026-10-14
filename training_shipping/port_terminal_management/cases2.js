/* Port Master Academy — virtual cases for specialisation tracks (L6–L9) */
(function () {
  const L = TS.L;
  const O = (l, s, f) => ({ l, s, f });
  const add = (x) => PT.cases.push(x);

  add({
    id: 'laytime-dispute', lvl: 6, icon: '⏳', title: L('The demurrage claim', 'مطالبة غرامة التأخير'),
    role: L('Terminal operations manager (bulk) working with the agent', 'مدير عمليات المحطة (سائبة) مع الوكيل'),
    brief: L('MV CEDAR GRAIN discharged 45,000 t wheat. CP: 7,500 t/day SHINC, demurrage USD 16,000/day, despatch half, NOR + 6 h turn time. NOR tendered Mon 08:00, berthed Tue 14:00 (berth occupied), completed Sun 20:00. Stoppages: 10 h rain, 14 h unloader breakdown (terminal), 6 h no trucks (receivers).',
      'السفينة CEDAR GRAIN فرّغت 45,000 طن قمح. العقد: 7,500 طن/يوم SHINC، الغرامة 16,000 دولار/يوم، مكافأة السرعة النصف، إشعار الجاهزية + 6 ساعات انتظار. قُدّم الإشعار الاثنين 08:00، رست الثلاثاء 14:00 (الرصيف مشغول)، انتهت الأحد 20:00. التوقفات: 10 ساعات مطر، 14 ساعة عطل مفرّغة (المحطة)، 6 ساعات بلا شاحنات (المستلمون).'),
    data: L('Laytime allowed = 45,000 ÷ 7,500 = 6.00 days. Laytime starts Mon 14:00 (NOR + 6 h). Clock time Mon 14:00 → Sun 20:00 = 6 days 6 h.', 'زمن الرسو المسموح = 45,000 ÷ 7,500 = 6.00 أيام. يبدأ الإثنين 14:00 (الإشعار + 6 ساعات). الوقت الكلي من الإثنين 14:00 ← الأحد 20:00 = 6 أيام و6 ساعات.'),
    stages: [
      { t: L('The charterer says waiting for berth (Mon 14:00 → Tue 14:00) should not count. Under a typical “berth or not berth” (WIBON) clause, what applies?', 'يقول المستأجر إن الانتظار للرصيف (الإثنين 14:00 ← الثلاثاء 14:00) يجب ألّا يُحسب. بموجب بند نموذجي “رصيف أو لا رصيف” (WIBON)، ما المطبّق؟'),
        opts: [
          O(L('Waiting time counts as laytime — the ship was an arrived ship with a valid NOR.', 'وقت الانتظار يُحسب من زمن الرسو — السفينة “واصلة” بإشعار جاهزية صحيح.'), 10, L('WIBON transfers congestion risk to the charterer.', 'بند WIBON ينقل مخاطر الازدحام إلى المستأجر.')),
          O(L('Waiting never counts.', 'الانتظار لا يُحسب أبدًا.'), 0, L('Depends on the CP; under WIBON it counts.', 'يعتمد على العقد؛ بموجب WIBON يُحسب.')),
          O(L('Only half counts.', 'يُحسب نصفه فقط.'), 0, L('No such general rule.', 'لا قاعدة عامة كهذه.')),
        ] },
      { t: L('Which stoppages are excepted (SHINC, WWD not stated, rain clause “rain stops excluded before demurrage”)?', 'أي التوقفات مستثناة (SHINC، WWD غير مذكور، بند المطر “توقف المطر مستثنى قبل الغرامة”)؟'),
        opts: [
          O(L('Rain 10 h excepted (if it happened before laytime expired); unloader breakdown — terminal is not the owner, so it usually counts against charterers vs owners, but receivers may claim from the terminal; no trucks counts.', 'المطر 10 ساعات مستثنى (إن حدث قبل انتهاء زمن الرسو)؛ عطل المفرّغة — المحطة ليست المالك، فيُحسب عادةً على المستأجر تجاه المالك، لكن المستلمين قد يطالبون المحطة؛ غياب الشاحنات يُحسب.'), 10, L('Senior view: separate the owner–charterer calculation from the receivers’ claim against the terminal.', 'نظرة المحترف: افصل حساب المالك–المستأجر عن مطالبة المستلمين ضد المحطة.')),
          O(L('All stoppages are excepted.', 'كل التوقفات مستثناة.'), 0, L('Only what the CP lists is excepted.', 'المستثنى فقط ما ينصّ عليه العقد.')),
          O(L('Nothing is excepted.', 'لا شيء مستثنى.'), 5, L('Rain clause clearly excepts rain before demurrage.', 'بند المطر يستثني المطر بوضوح قبل الغرامة.')),
        ] },
      { t: L('Time used = 6 d 6 h − 10 h rain = 5 d 20 h = 5.833 days. Laytime 6.00. Result?', 'الوقت المستخدم = 6 أيام و6 ساعات − 10 ساعات مطر = 5 أيام و20 ساعة = 5.833 يوم. زمن الرسو 6.00. النتيجة؟'),
        opts: [
          O(L('Despatch: 0.167 days × USD 8,000 = USD 1,333 to charterers.', 'مكافأة سرعة: 0.167 يوم × 8,000 = 1,333 دولارًا للمستأجر.'), 10, L('Ship finished inside laytime.', 'أنهت السفينة ضمن زمن الرسو.')),
          O(L('Demurrage USD 4,000.', 'غرامة 4,000 دولار.'), 0, L('Time used is less than laytime.', 'الوقت المستخدم أقل من زمن الرسو.')),
          O(L('Nothing due.', 'لا شيء مستحق.'), 5, L('Despatch is due if the CP provides it.', 'مكافأة السرعة مستحقّة إن نصّ عليها العقد.')),
        ] },
      { t: L('The receivers write: “The 14 h unloader breakdown cost us — we will claim from the terminal.” Your answer?', 'كتب المستلمون: “عطل المفرّغة 14 ساعة كلّفنا — سنطالب المحطة.” جوابك؟'),
        opts: [
          O(L('Check the terminal contract: guaranteed rate, force majeure, liability caps; share the SOF and maintenance records; settle within contract if the breakdown is our fault.', 'راجع عقد المحطة: المعدّل المضمون، القوة القاهرة، سقوف المسؤولية؛ شارك بيان الوقائع وسجلّات الصيانة؛ وسوِّ ضمن العقد إن كان العطل خطأنا.'), 10, L('Facts + contract → fair settlement.', 'الحقائق + العقد ← تسوية عادلة.')),
          O(L('Reject — breakdowns happen.', 'ارفض — الأعطال تحدث.'), 0, L('Without checking the contract you may lose a customer and a case.', 'دون مراجعة العقد قد تخسر عميلًا وقضية.')),
        ] },
    ],
    debrief: L('Laytime is decided by the charter party and the SOF. The port’s job: precise, honest time records and clear contracts with receivers.', 'زمن الرسو يحدّده عقد الإيجار وبيان الوقائع. مهمة الميناء: سجلّات وقت دقيقة وصادقة وعقود واضحة مع المستلمين.'),
  });

  add({
    id: 'psc-detention', lvl: 6, icon: '🛑', title: L('PSC detention before a fixture', 'احتجاز رقابي قبل تأجير'),
    role: L('Technical superintendent of the ship manager', 'المشرف الفني لدى مدير السفينة'),
    brief: L('Your managed feeder LFS TYRE is detained in port by PSC: oily water separator not working, 2 fire dampers seized, crew rest-hour records incomplete. A new time charter starts in 4 days at the next port.',
      'سفينة الفيدر التي تديرها LFS TYRE محتجزة في الميناء من رقابة دولة الميناء: فاصل المياه الزيتية لا يعمل، مخمّدا حريق متعطّلان، سجلّات ساعات راحة الطاقم ناقصة. تأجير زمني جديد يبدأ بعد 4 أيام في الميناء التالي.'),
    stages: [
      { t: L('First actions?', 'الإجراءات الأولى؟'),
        opts: [
          O(L('Inform owner, DPA, class & flag; order OWS spares and a service engineer, fix dampers with crew, audit rest hours; plan a re-inspection date with PSC.', 'أبلغ المالك والشخص المعيّن DPA والتصنيف والعلم؛ اطلب قطع فاصل المياه الزيتية ومهندس خدمة، أصلح المخمّدات بالطاقم، دقّق ساعات الراحة؛ خطّط موعد إعادة تفتيش مع الرقابة.'), 10, L('Structured rectification with all stakeholders.', 'تصحيح منظّم مع كل الأطراف.')),
          O(L('Ask the agent to “talk” to the inspector.', 'اطلب من الوكيل “التحدّث” مع المفتّش.'), 0, L('Never attempt to influence inspectors improperly.', 'لا تحاول أبدًا التأثير على المفتّشين بشكل غير لائق.')),
          O(L('Sail anyway.', 'أبحر على أي حال.'), 0, L('A detained ship cannot sail — serious offence.', 'السفينة المحتجزة لا يمكنها الإبحار — مخالفة خطيرة.')),
        ] },
      { t: L('The charterer asks whether you will make the delivery date.', 'يسأل المستأجر إن كنت ستلتزم بموعد التسليم.'),
        opts: [
          O(L('Tell the truth: estimated release date, actions underway, and agree a revised delivery or cancelling date per the charter party.', 'قل الحقيقة: موعد الإفراج المتوقّع، الإجراءات الجارية، واتّفق على تسليم معدّل أو موعد إلغاء حسب العقد.'), 10, L('Transparency protects the relationship and legal position.', 'الشفافية تحمي العلاقة والموقف القانوني.')),
          O(L('Promise delivery on time.', 'اعدهم بالتسليم في الموعد.'), 0, L('If you miss it, they may cancel and claim.', 'إن فوّتّه قد يلغون ويطالبون.')),
        ] },
      { t: L('After release, what prevents a repeat?', 'بعد الإفراج، ما الذي يمنع التكرار؟'),
        opts: [
          O(L('Root cause under ISM (non-conformity report), PMS review for OWS & dampers, crew training on rest-hour records, internal audit before next port of a strict PSC regime.', 'السبب الجذري بموجب ISM (تقرير عدم مطابقة)، مراجعة نظام الصيانة لفاصل المياه والمخمّدات، تدريب الطاقم على سجلّات الراحة، تدقيق داخلي قبل الميناء التالي ذي الرقابة الصارمة.'), 10, L('ISM continuous improvement.', 'التحسين المستمر بموجب ISM.')),
          O(L('Change the crew.', 'غيّر الطاقم.'), 5, L('Sometimes needed, but fix the system first.', 'قد يلزم أحيانًا، لكن أصلح النظام أولًا.')),
        ] },
    ],
    debrief: L('PSC detentions are managed with honest communication, fast technical rectification and ISM root-cause learning.', 'الاحتجازات الرقابية تُدار بتواصل صادق وتصحيح فني سريع وتعلّم السبب الجذري بموجب ISM.'),
  });

  add({
    id: 'slow-steam', lvl: 6, icon: '⛽', title: L('Speed or fuel?', 'السرعة أم الوقود؟'),
    role: L('Fleet operations manager', 'مدير عمليات الأسطول'),
    brief: L('Your ship must sail 3,600 nm to CBCT. At 16 kn she burns 42 t/day; at 13 kn ≈ 22.5 t/day. Bunker USD 620/t. The port says berth is available only 2 days after your 16-kn ETA (congestion). Time-charter value of the ship: USD 18,000/day.',
      'سفينتك يجب أن تبحر 3,600 ميل إلى CBCT. بسرعة 16 عقدة تحرق 42 طنًا/يوم؛ وبسرعة 13 ≈ 22.5 طن/يوم. الوقود 620 دولارًا/طن. الميناء يقول إن الرصيف متاح بعد يومين فقط من موعد وصولك بسرعة 16 (ازدحام). قيمة الإيجار الزمني للسفينة: 18,000 دولار/يوم.'),
    data: L('16 kn: 9.4 days × 42 = 394 t; 13 kn: 11.5 days × 22.5 = 260 t', '16 عقدة: 9.4 يوم × 42 = 394 طنًا؛ 13 عقدة: 11.5 يوم × 22.5 = 260 طنًا'),
    stages: [
      { t: L('Which speed do you order?', 'أي سرعة تأمر بها؟'),
        opts: [
          O(L('13 kn: arrive ~2 days later — exactly when the berth is free. Save ~134 t (≈ USD 83,000) and anchorage emissions.', '13 عقدة: الوصول بعد ~يومين — بالضبط عند تحرّر الرصيف. توفير ~134 طنًا (≈ 83,000 دولار) وانبعاثات المخطاف.'), 10, L('Just-in-time arrival: the extra sea days would have been spent waiting anyway.', 'الوصول في الوقت المناسب: الأيام البحرية الإضافية كانت ستُقضى انتظارًا على أي حال.')),
          O(L('16 kn: arrive first, be ready.', '16 عقدة: صِل أولًا وكن جاهزًا.'), 0, L('You burn fuel to wait 2 days at anchor.', 'تحرق وقودًا لتنتظر يومين على المخطاف.')),
          O(L('18 kn to beat other ships.', '18 عقدة لتسبق السفن الأخرى.'), 0, L('Berth windows, not speed, decide berthing.', 'نوافذ الرسو لا السرعة هي التي تحدّد الرسو.')),
        ] },
      { t: L('What do you ask from the port to make this reliable?', 'ماذا تطلب من الميناء لجعل هذا موثوقًا؟'),
        opts: [
          O(L('A confirmed Requested Time of Arrival (RTA) and updates if the berth plan changes, via the agent/PCS.', 'وقت وصول مطلوب (RTA) مؤكَّد وتحديثات إن تغيّرت خطة الأرصفة، عبر الوكيل/نظام مجتمع الميناء.'), 10, L('Data sharing makes JIT work.', 'مشاركة البيانات تجعل الوصول في الوقت المناسب ممكنًا.')),
          O(L('Nothing.', 'لا شيء.'), 0, L('Without updates you risk arriving late.', 'دون تحديثات قد تصل متأخّرًا.')),
        ] },
    ],
    debrief: L('Speed is an economic decision: fuel ∝ speed²–³; if the port is congested, slow down and arrive just in time.', 'السرعة قرار اقتصادي: الوقود ∝ السرعة²–³؛ إن كان الميناء مزدحمًا خفّف السرعة وصِل في الوقت المناسب.'),
  });

  add({
    id: 'silo-hotspot', lvl: 7, icon: '🔥', title: L('Hot spot in bin 23', 'بؤرة ساخنة في الخلية 23'),
    role: L('Silo terminal manager', 'مدير محطة الصوامع'),
    brief: L('Bin 23 holds 2,400 t of corn (moisture 14.8% at intake, 6 weeks ago). Temperature cable 3 shows 34 °C at 12 m depth (others 22 °C), up from 26 °C last week. Smell of mould at the top hatch. Bin 31 is empty. Ambient air tonight: 14 °C, 55% RH.',
      'الخلية 23 تحوي 2,400 طن ذرة (رطوبة 14.8% عند الدخول قبل 6 أسابيع). كابل الحرارة 3 يُظهر 34 °م على عمق 12 م (الباقي 22 °م)، مرتفعًا من 26 °م الأسبوع الماضي. رائحة عفن عند فتحة السطح. الخلية 31 فارغة. الهواء الخارجي الليلة: 14 °م ورطوبة نسبية 55%.'),
    stages: [
      { t: L('First decision?', 'القرار الأول؟'),
        opts: [
          O(L('Turn the grain from bin 23 into empty bin 31 today (breaks the hot spot), sample during transfer for moisture, mycotoxins and insects.', 'قلّب الحبوب من الخلية 23 إلى الخلية الفارغة 31 اليوم (يكسر البؤرة)، وخذ عيّنات أثناء النقل للرطوبة والسموم الفطرية والحشرات.'), 10, L('Fast, effective, gives data.', 'سريع وفعّال ويوفّر بيانات.')),
          O(L('Run aeration tonight and check next week.', 'شغّل التهوية الليلة وافحص الأسبوع القادم.'), 5, L('Aeration helps but a fast-rising hot spot with mould smell needs turning.', 'التهوية تساعد لكن بؤرة ترتفع بسرعة مع رائحة عفن تحتاج تقليبًا.')),
          O(L('Send a worker into the bin to inspect.', 'أرسل عاملًا داخل الخلية للفحص.'), 0, L('Confined space, possible crust and gases — never without permit and conveyors locked out.', 'مكان مغلق، قشرة وغازات محتملة — أبدًا دون تصريح وقفل السيور.')),
        ] },
      { t: L('Lab: moisture 15.6%, aflatoxin slightly above food limit in the hot zone samples. Next?', 'المختبر: الرطوبة 15.6%، والأفلاتوكسين أعلى قليلًا من الحدّ الغذائي في عيّنات المنطقة الساخنة. التالي؟'),
        opts: [
          O(L('Inform the cargo owner and surveyor; segregate the affected portion, dry the rest to ≤ 14%, owner decides use (feed vs food) per regulations; document everything.', 'أبلغ مالك البضاعة والمُعاين؛ افصل الجزء المتأثّر، جفّف الباقي إلى ≤ 14%، والمالك يقرّر الاستخدام (علف مقابل غذاء) وفق الأنظمة؛ وثّق كل شيء.'), 10, L('Owner decides; you protect food safety and evidence.', 'المالك يقرّر؛ وأنت تحمي سلامة الغذاء والأدلّة.')),
          O(L('Blend it with good corn to dilute.', 'اخلطها مع ذرة جيدة لتخفيف التركيز.'), 0, L('Diluting contaminated food grain is unlawful in most countries.', 'تخفيف الحبوب الغذائية الملوّثة غير قانوني في معظم الدول.')),
        ] },
      { t: L('How do you prevent this next season?', 'كيف تمنع هذا في الموسم القادم؟'),
        opts: [
          O(L('Intake rule: corn > 14% goes to the dryer before storage; daily temperature report with alarm at +2 °C/week; aeration strategy by ambient conditions; FIFO.', 'قاعدة الاستلام: الذرة > 14% تذهب للمجفّف قبل التخزين؛ تقرير حرارة يومي مع إنذار عند +2 °م/أسبوع؛ استراتيجية تهوية حسب الظروف الخارجية؛ الوارد أولًا يصرف أولًا.'), 10, L('Prevention at intake is cheapest.', 'الوقاية عند الاستلام هي الأرخص.')),
          O(L('Buy more temperature cables only.', 'اشترِ كابلات حرارة أكثر فقط.'), 5, L('Monitoring without intake rules repeats the problem.', 'المراقبة دون قواعد استلام تكرّر المشكلة.')),
        ] },
    ],
    debrief: L('Grain storage: moisture control at intake, temperature monitoring, early turning, and owner-led decisions on damaged cargo.', 'تخزين الحبوب: ضبط الرطوبة عند الاستلام، مراقبة الحرارة، التقليب المبكر، وقرارات يقودها المالك بشأن البضاعة المتضرّرة.'),
  });

  add({
    id: 'dust-risk', lvl: 7, icon: '💥', title: L('Smoking bearing in the elevator', 'محمل يدخّن في المصعد'),
    role: L('Shift supervisor, silo terminal', 'مشرف الوردية، محطة الصوامع'),
    brief: L('During ship discharge at 650 t/h, the bearing temperature alarm of elevator E2 head pulley trips (95 °C). A mechanic reports a burning smell and visible dust layers on the gallery floor.',
      'أثناء تفريغ السفينة بمعدّل 650 طن/س، ينطلق إنذار حرارة محمل البكرة العلوية للمصعد E2 (95 °م). يبلّغ ميكانيكي عن رائحة احتراق وطبقات غبار ظاهرة على أرضية الممرّ.'),
    stages: [
      { t: L('Immediate action?', 'الإجراء الفوري؟'),
        opts: [
          O(L('Stop E2 and the feeding line (sequence stop), keep people out of the elevator area, check for smouldering with thermal camera, alert fire team.', 'أوقف E2 وخط التغذية (إيقاف متسلسل)، أبعد الناس عن منطقة المصعد، افحص الاحتراق البطيء بكاميرا حرارية، نبّه فريق الإطفاء.'), 10, L('Hot bearing + dust = ignition source + fuel.', 'محمل ساخن + غبار = مصدر اشتعال + وقود.')),
          O(L('Keep running until the hold is finished, then check.', 'تابع التشغيل حتى ينتهي العنبر ثم افحص.'), 0, L('Classic path to a dust explosion.', 'الطريق الكلاسيكي لانفجار غبار.')),
          O(L('Spray water on the bearing.', 'رشّ الماء على المحمل.'), 0, L('Can disperse dust and damage equipment; follow the fire plan.', 'قد ينشر الغبار ويضرّ بالمعدّات؛ اتّبع خطة الحريق.')),
        ] },
      { t: L('The line E2 is needed to finish the ship. Engineering can replace the bearing in 3 h (hot work: grinding). What conditions?', 'الخط E2 مطلوب لإنهاء السفينة. الهندسة تستطيع استبدال المحمل خلال 3 ساعات (عمل ساخن: جلخ). ما الشروط؟'),
        opts: [
          O(L('Hot-work permit: LOTO, area dust cleaned (incl. gallery floors), fire watch with extinguisher, gas/dust check, fire blanket, post-work watch 60 min. Switch discharge to E1 meanwhile.', 'تصريح عمل ساخن: LOTO، تنظيف الغبار في المنطقة (بما فيها أرضيات الممرّ)، مراقب حريق مع طفّاية، فحص الغاز/الغبار، بطانية حريق، مراقبة بعد العمل 60 دقيقة. حوّل التفريغ إلى E1 في الأثناء.'), 10, L('Controls every side of the pentagon and keeps the ship working.', 'يتحكّم بكل أضلاع الخماسي ويُبقي السفينة تعمل.')),
          O(L('Grind quickly, it is only 3 hours.', 'اجلخ بسرعة، إنها 3 ساعات فقط.'), 0, L('Sparks in a dusty gallery can kill.', 'الشرر في ممرّ مغبّر قد يقتل.')),
        ] },
      { t: L('Afterwards?', 'بعد ذلك؟'),
        opts: [
          O(L('Incident report, housekeeping audit & daily cleaning schedule, bearing condition monitoring on all elevators, review dust extraction.', 'تقرير حادث، تدقيق النظافة وجدول تنظيف يومي، مراقبة حالة المحامل على كل المصاعد، مراجعة شفط الغبار.'), 10, L('Learn before the explosion, not after.', 'تعلّم قبل الانفجار لا بعده.')),
          O(L('Nothing — it was fixed.', 'لا شيء — تمّ الإصلاح.'), 0, L('Near misses repeat.', 'الحوادث الوشيكة تتكرّر.')),
        ] },
    ],
    debrief: L('In grain terminals, a hot bearing or a dust layer is an emergency signal. Stop, clean, permit, monitor.', 'في محطات الحبوب، المحمل الساخن أو طبقة الغبار إشارة طوارئ. أوقف، نظّف، استخرج تصريحًا، راقب.'),
  });

  add({
    id: 'wheat-discharge', lvl: 7, icon: '🚚', title: L('Wheat ship, full silos, few trucks', 'سفينة قمح، صوامع ممتلئة، شاحنات قليلة'),
    role: L('Silo terminal manager', 'مدير محطة الصوامع'),
    brief: L('MV LEVANT HARVEST (55,000 t wheat for 3 mills) berths tomorrow. Free silo space: 30,000 t. Mills can take 6,000 t/day by truck but only 3,500 t/day were collected last week (truck shortage). Effective discharge rate 900 t/h ≈ 21,600 t/day.',
      'السفينة LEVANT HARVEST (55,000 طن قمح لثلاث مطاحن) ترسو غدًا. مساحة الصوامع الحرّة: 30,000 طن. المطاحن تستطيع استلام 6,000 طن/يوم بالشاحنات لكن 3,500 طن/يوم فقط سُحبت الأسبوع الماضي (نقص شاحنات). معدّل التفريغ الفعلي 900 طن/س ≈ 21,600 طن/يوم.'),
    stages: [
      { t: L('What is the problem in numbers?', 'ما المشكلة بالأرقام؟'),
        opts: [
          O(L('In ~2.6 days of discharge we receive 55,000 t; storage 30,000 + out-loading ~9,000 → ~16,000 t short. The ship will stop.', 'خلال ~2.6 يوم تفريغ نستلم 55,000 طن؛ التخزين 30,000 + الإخراج ~9,000 ← عجز ~16,000 طن. ستتوقّف السفينة.'), 10, L('Good mass balance.', 'موازنة كتلة جيدة.')),
          O(L('No problem, 30,000 t is enough.', 'لا مشكلة، 30,000 طن كافية.'), 0, L('55,000 > 30,000.', '55,000 > 30,000.')),
        ] },
      { t: L('Your plan?', 'خطّتك؟'),
        opts: [
          O(L('Meet mills + hauliers today: guaranteed truck numbers per shift incl. night; extend loading hours; use the 30,000 t flat store; discharge at a slower planned rate and tell the agent (laytime) in writing.', 'اجتمع مع المطاحن والناقلين اليوم: أعداد شاحنات مضمونة لكل وردية بما فيها الليل؛ مدّد ساعات التحميل؛ استخدم المخزن الأرضي 30,000 طن؛ فرّغ بمعدّل مخطّط أبطأ وأبلغ الوكيل (زمن الرسو) كتابيًا.'), 10, L('Combines capacity, demand and contractual communication.', 'يجمع الطاقة والطلب والتواصل التعاقدي.')),
          O(L('Discharge at full speed and stop when full.', 'فرّغ بكامل السرعة وتوقّف عند الامتلاء.'), 5, L('Works technically but creates avoidable demurrage and conflict.', 'يعمل فنيًا لكنه يخلق غرامة ونزاعًا يمكن تجنّبهما.')),
          O(L('Store wheat on the open quay.', 'خزّن القمح على الرصيف المكشوف.'), 0, L('Rain, birds and contamination — unacceptable for food grain.', 'المطر والطيور والتلوّث — غير مقبول للحبوب الغذائية.')),
        ] },
    ],
    debrief: L('Silo terminals are a flow system: ship-in = storage change + truck-out. Balance them before berthing.', 'محطات الصوامع نظام تدفّق: الوارد من السفينة = تغيّر المخزون + الخارج بالشاحنات. وازن بينها قبل الرسو.'),
  });

  add({
    id: 'tank-overfill', lvl: 8, icon: '🛢', title: L('High-level alarm on tank T-14', 'إنذار مستوى عالٍ في الخزّان T-14'),
    role: L('Liquid terminal control room operator', 'مشغّل غرفة التحكّم بمحطة السوائل'),
    brief: L('A tanker is discharging diesel into T-14 at 1,200 m³/h. T-14 high-level alarm sounds at 92%; the planned switch to T-15 was set for 95%. The tank gauge and the independent high-high switch disagree by 0.4 m.',
      'ناقلة تفرّغ ديزل إلى الخزّان T-14 بمعدّل 1,200 م³/س. ينطلق إنذار المستوى العالي للخزّان عند 92%؛ وكان التحويل المخطّط إلى T-15 عند 95%. مقياس الخزّان ومفتاح المستوى العالي جدًا المستقل يختلفان بـ 0.4 م.'),
    stages: [
      { t: L('What do you do now?', 'ماذا تفعل الآن؟'),
        opts: [
          O(L('Switch to T-15 immediately (or ask the ship to reduce/stop pumping), verify level by manual dip, treat the discrepancy as a gauge failure.', 'حوّل إلى T-15 فورًا (أو اطلب من السفينة خفض/إيقاف الضخ)، تحقّق من المستوى بقياس يدوي، وتعامل مع الفرق كعطل مقياس.'), 10, L('When instruments disagree, assume the worst.', 'عندما تختلف الأجهزة افترض الأسوأ.')),
          O(L('Continue to 95% as planned.', 'تابع حتى 95% كما خُطّط.'), 0, L('If the gauge reads low, you overfill — Buncefield-type disaster.', 'إن كان المقياس يقرأ أقل، ستفيض — كارثة من نوع بانسفيلد.')),
        ] },
      { t: L('After switching, what about T-14?', 'بعد التحويل، ماذا عن T-14؟'),
        opts: [
          O(L('Take it out of service, calibrate/repair the gauge, test the high-high trip, report the incident, review switch-over margins (time to switch at max rate).', 'أخرجه من الخدمة، عاير/أصلح المقياس، اختبر إيقاف المستوى العالي جدًا، أبلغ عن الحادث، راجع هوامش التحويل (الوقت اللازم للتحويل عند أقصى معدّل).'), 10, L('Barrier management: never run with a degraded safety barrier.', 'إدارة الحواجز: لا تعمل أبدًا بحاجز سلامة متدهور.')),
          O(L('Use it again tomorrow.', 'استخدمه مجددًا غدًا.'), 0, L('Unverified gauges cause overfills.', 'المقاييس غير المُتحقَّق منها تسبّب الفيضان.')),
        ] },
    ],
    debrief: L('Tank terminals live on independent safety barriers. Any instrument doubt = stop, verify, repair, learn.', 'محطات الخزّانات تعيش على حواجز سلامة مستقلة. أي شكّ في جهاز = توقّف، تحقّق، أصلح، تعلّم.'),
  });

  add({
    id: 'heavy-lift', lvl: 8, icon: '🏗', title: L('The 148-tonne transformer', 'محوّل وزنه 148 طنًا'),
    role: L('Multipurpose terminal manager', 'مدير المحطة متعدّدة الأغراض'),
    brief: L('A power transformer (148 t, 9 × 4 × 4.5 m) arrives on a general cargo ship with 2 × 80 t ship cranes. Your 2 MHCs are 100 t each (at 14 m radius: 72 t each). Rigging weight 4 t. Quay load limit 8 t/m².',
      'محوّل كهربائي (148 طنًا، 9 × 4 × 4.5 م) يصل على سفينة بضائع عامة بها رافعتان × 80 طنًا. لديك رافعتان متنقّلتان 100 طن لكلّ منهما (عند نصف قطر 14 م: 72 طنًا لكلّ منهما). وزن أدوات الرفع 4 أطنان. حدّ تحميل الرصيف 8 أطنان/م².'),
    stages: [
      { t: L('Can you tandem-lift with the 2 MHCs at 14 m radius?', 'هل يمكنك الرفع الترادفي بالرافعتين المتنقّلتين عند نصف قطر 14 م؟'),
        opts: [
          O(L('No: hook load 152 t vs 2 × 72 = 144 t (and tandem should use ≤ 75–80% → ~110 t). Not allowed.', 'لا: حمل الخطاف 152 طنًا مقابل 2 × 72 = 144 طنًا (والترادفي يجب أن يستخدم ≤ 75–80% ← ~110 أطنان). غير مسموح.'), 10, L('Always include rigging and derating.', 'أدخل دائمًا أدوات الرفع وتخفيض القدرة.')),
          O(L('Yes, 2 × 100 = 200 t.', 'نعم، 2 × 100 = 200 طن.'), 0, L('Capacity at the required radius matters, not the nominal maximum.', 'القدرة عند نصف القطر المطلوب هي المهمّة، لا الحدّ الاسمي الأقصى.')),
        ] },
      { t: L('Options?', 'الخيارات؟'),
        opts: [
          O(L('Use the ship’s cranes in tandem if their certified combined SWL and lift plan allow, or bring a larger mobile crane; place SPMT with load-spreading mats to respect 8 t/m²; signed lift plan and pre-lift meeting.', 'استخدم رافعتي السفينة ترادفيًا إن سمحت قدرتهما المعتمدة المجمّعة وخطة الرفع، أو أحضر رافعة متنقّلة أكبر؛ ضع مقطورة SPMT مع حصائر توزيع الحمل لاحترام 8 أطنان/م²؛ خطة رفع موقّعة واجتماع ما قبل الرفع.'), 10, L('Engineering solution with documented approvals.', 'حلّ هندسي بموافقات موثّقة.')),
          O(L('Reduce radius by mooring closer and lift anyway at 100%.', 'قلّل نصف القطر بالربط أقرب وارفع على أي حال بنسبة 100%.'), 0, L('No margin for dynamics, wind, inaccurate weights.', 'لا هامش للديناميكيات والرياح والأوزان غير الدقيقة.')),
        ] },
    ],
    debrief: L('Heavy lifts are engineering: radius-based capacity, rigging weight, tandem derating, ground bearing and a signed plan.', 'الرفعات الثقيلة هندسة: القدرة حسب نصف القطر، وزن أدوات الرفع، تخفيض الترادفي، تحمّل الأرض وخطة موقّعة.'),
  });

  add({
    id: 'expansion', lvl: 9, icon: '📈', title: L('New berth or better productivity?', 'رصيف جديد أم إنتاجية أفضل؟'),
    role: L('Port development director', 'مدير تطوير الميناء'),
    brief: L('CBCT handles 1.25 M TEU (capacity 1.6 M, yard-limited). Forecast base case +6%/yr. Option A: new 400 m berth + yard (USD 260 M, 5 years). Option B: productivity & yard programme — dwell 6 → 4.5 days, eRTG densification, gate automation (USD 45 M, 18 months) → capacity 2.0 M TEU.',
      'تتعامل CBCT مع 1.25 مليون TEU (الطاقة 1.6 مليون، مقيّدة بالساحة). التوقّع الأساسي +6%/سنة. الخيار A: رصيف جديد 400 م + ساحة (260 مليون دولار، 5 سنوات). الخيار B: برنامج إنتاجية وساحة — البقاء من 6 إلى 4.5 أيام، تكثيف بـ RTG كهربائية، أتمتة البوابة (45 مليون دولار، 18 شهرًا) ← طاقة 2.0 مليون TEU.'),
    data: L('1.25 M × 1.06^n: yr3 1.49 M · yr4 1.58 M · yr5 1.67 M · yr8 1.99 M · yr10 2.24 M', '1.25 مليون × 1.06^n: السنة 3: 1.49 · السنة 4: 1.58 · السنة 5: 1.67 · السنة 8: 1.99 · السنة 10: 2.24 مليون'),
    stages: [
      { t: L('When does current capacity (1.6 M) run out, and is 70–80% utilisation already a problem?', 'متى تنفد الطاقة الحالية (1.6 مليون)، وهل استخدام 70–80% مشكلة أصلًا؟'),
        opts: [
          O(L('Utilisation is 78% now, ~93% in year 3 and ~99% in year 4 — congestion from year 3. Action needed now.', 'الاستخدام 78% الآن، ~93% في السنة 3 و~99% في السنة 4 — ازدحام من السنة 3. يلزم إجراء الآن.'), 10, L('Correct reading of forecast vs capacity.', 'قراءة صحيحة للتوقّع مقابل الطاقة.')),
          O(L('No problem until year 10.', 'لا مشكلة حتى السنة 10.'), 0, L('1.6 M is reached around year 4.', 'تُبلغ 1.6 مليون حوالي السنة 4.')),
        ] },
      { t: L('Your recommendation?', 'توصيتك؟'),
        opts: [
          O(L('Do B now (fast, cheap, covers demand to ~year 8), and start A’s studies, EIA and permits now so the berth can open around year 7–8 if the forecast holds.', 'نفّذ B الآن (سريع ورخيص ويغطّي الطلب حتى ~السنة 8)، وابدأ دراسات A وتقييم الأثر البيئي والتراخيص الآن ليفتح الرصيف حوالي السنة 7–8 إن صحّ التوقّع.'), 10, L('No-regret first step + preserved option for the big investment.', 'خطوة أولى بلا ندم + خيار محفوظ للاستثمار الكبير.')),
          O(L('Only A — big is better.', 'A فقط — الأكبر أفضل.'), 5, L('Opens in year 5, after 1–2 years of congestion, and risks overcapacity in a low case.', 'يفتح في السنة 5 بعد سنة إلى سنتين من الازدحام، ويخاطر بفائض طاقة في السيناريو المنخفض.')),
          O(L('Only B — never build.', 'B فقط — لا تبنِ أبدًا.'), 5, L('By year 8–9 demand exceeds 2.0 M in the base case.', 'بحلول السنة 8–9 يتجاوز الطلب 2.0 مليون في السيناريو الأساسي.')),
        ] },
      { t: L('How do you present this to the board?', 'كيف تقدّم ذلك لمجلس الإدارة؟'),
        opts: [
          O(L('Scenarios (low/base/high), capacity vs demand chart, NPV of each path, risks, and decision gates (e.g. start A construction when throughput passes 1.7 M TEU).', 'سيناريوهات (منخفض/أساسي/مرتفع)، رسم الطاقة مقابل الطلب، صافي القيمة الحالية لكل مسار، المخاطر، وبوابات القرار (مثلًا ابدأ إنشاء A عندما تتجاوز الحركة 1.7 مليون TEU).'), 10, L('Decision-ready, flexible, evidence-based.', 'جاهز للقرار، مرن، مبني على الأدلّة.')),
          O(L('One number and a request for USD 305 M.', 'رقم واحد وطلب 305 ملايين دولار.'), 0, L('Boards fund clear options and triggers, not single numbers.', 'المجالس تموّل خيارات ومحفّزات واضحة لا أرقامًا منفردة.')),
        ] },
    ],
    debrief: L('Development strategy: sweat existing assets first, prepare big projects early, and use decision triggers tied to real traffic.', 'استراتيجية التطوير: استغلّ الأصول القائمة أولًا، وحضّر للمشاريع الكبيرة مبكرًا، واستخدم محفّزات قرار مرتبطة بالحركة الفعلية.'),
  });

  add({
    id: 'concession', lvl: 9, icon: '📑', title: L('Evaluating a concession bid', 'تقييم عرض امتياز'),
    role: L('Port Authority evaluation committee member', 'عضو لجنة التقييم في سلطة الميناء'),
    brief: L('Tender for a new 30-year container terminal concession. Bidder X: royalty USD 30/TEU, MGT 400,000 TEU, weak operational experience. Bidder Y: royalty USD 22/TEU, MGT 600,000 TEU, operates 20 terminals, includes transshipment volume from its own line.',
      'مناقصة لامتياز محطة حاويات جديدة لمدة 30 سنة. العارض X: إتاوة 30 دولارًا/TEU، حدّ أدنى مضمون 400,000 TEU، خبرة تشغيلية ضعيفة. العارض Y: إتاوة 22 دولارًا/TEU، حدّ أدنى مضمون 600,000 TEU، يشغّل 20 محطة، ويتضمّن حجم مسافنة من خطّه الملاحي.'),
    stages: [
      { t: L('Minimum guaranteed royalty per year?', 'الحدّ الأدنى المضمون للإتاوة سنويًا؟'),
        opts: [
          O(L('X: 400,000 × 30 = USD 12.0 M; Y: 600,000 × 22 = USD 13.2 M.', 'X: 400,000 × 30 = 12.0 مليون دولار؛ Y: 600,000 × 22 = 13.2 مليون دولار.'), 10, L('The guaranteed floor favours Y.', 'الحدّ الأدنى المضمون يميل لصالح Y.')),
          O(L('X is higher because USD 30 > 22.', 'X أعلى لأن 30 > 22.'), 0, L('Rate × guaranteed volume is what matters.', 'المعدّل × الحجم المضمون هو المهم.')),
        ] },
      { t: L('Besides money, what must the committee check?', 'إلى جانب المال، ماذا يجب أن تراجع اللجنة؟'),
        opts: [
          O(L('Technical pass/fail (experience, operating plan, KPIs), financial strength, investment schedule, tariff proposal, risk of carrier dominance (non-discrimination/open access clauses), hand-back conditions.', 'النجاح/الرسوب الفني (الخبرة، خطة التشغيل، المؤشرات)، القوة المالية، جدول الاستثمار، مقترح التعرفة، خطر هيمنة الناقل (بنود عدم التمييز/الوصول المفتوح)، شروط التسليم.'), 10, L('A concession is a 30-year partnership, not a one-time sale.', 'الامتياز شراكة 30 سنة لا عملية بيع لمرة واحدة.')),
          O(L('Only the highest royalty rate.', 'أعلى معدّل إتاوة فقط.'), 0, L('An inexperienced operator can fail and leave a stranded asset.', 'مشغّل عديم الخبرة قد يفشل ويترك أصلًا معطّلًا.')),
        ] },
      { t: L('Y’s own shipping line will bring volume. Main risk to manage?', 'خطّ Y الملاحي سيجلب الحجم. ما الخطر الرئيسي الذي يجب إدارته؟'),
        opts: [
          O(L('Discrimination against competing lines — require non-discrimination, published tariffs, berth allocation rules and KPI reporting to the authority.', 'التمييز ضد الخطوط المنافسة — اشترط عدم التمييز، تعرفات منشورة، قواعد توزيع الأرصفة وتقارير مؤشرات للسلطة.'), 10, L('Protect the port’s openness and competition.', 'احمِ انفتاح الميناء والمنافسة.')),
          O(L('No risk — more volume is always good.', 'لا خطر — الحجم الأكبر دائمًا جيد.'), 0, L('Captive terminals can push other lines away.', 'المحطات المرتبطة بخط واحد قد تطرد الخطوط الأخرى.')),
        ] },
    ],
    debrief: L('Concession evaluation balances guaranteed revenue, operator capability, investment, competition safeguards and long-term asset condition.', 'تقييم الامتياز يوازن بين الإيراد المضمون وقدرة المشغّل والاستثمار وضمانات المنافسة وحالة الأصول على المدى الطويل.'),
  });
})();
