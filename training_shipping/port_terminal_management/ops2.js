/* Port Master Academy — Operations desk scenarios 8–15 */
(function () {
  const L = TS.L;
  const D = (l, ok, w) => ({ l, ok, w });
  const O = (l, s, f) => ({ l, s, f });
  const add = (x) => PT.ops.push(x);

  /* ---------------------------------------------------------------- 8. PHARMA REEFER CHAIN */
  add({
    id: 'op-reefer', area: 'cont', lvl: 3, icon: '❄', title: L('Pharma reefer import — cold chain A to Z', 'استيراد أدوية مبرّدة — سلسلة التبريد كاملة'),
    sub: L('Pre-advice, plug-in, monitoring rounds, alarm, release with health permit, delivery under temperature.', 'الإشعار المسبق، التوصيل بالكهرباء، جولات المراقبة، الإنذار، الإفراج بإذن صحي، التسليم تحت الحرارة.'),
    role: L('Reefer supervisor', 'مشرف المبرّدات'),
    brief: L('3 × 40′ reefers of vaccines (+2/+8 °C, setpoint +5 °C) discharge from OSL PEARL at 10:00. Reefer block R: 1,100 plugs, 1,060 in use.', '3 حاويات مبرّدة 40′ لقاحات (+2/+8 °م، الضبط +5 °م) تُفرَّغ من OSL PEARL الساعة 10:00. كتلة المبرّدات R: 1,100 مقبس، 1,060 مستخدمة.'),
    state: [{ k: 'plugs', l: L('Free plugs', 'المقابس الحرّة'), v: 40 }, { k: 'unplugged', l: L('Max time unplugged', 'أقصى مدة دون كهرباء'), v: '—' }, { k: 'temp', l: L('Box 2 supply air', 'هواء التزويد للحاوية 2'), v: '+5.0 °C' }, { k: 'status', l: L('Status', 'الحالة'), v: 'On board' }],
    steps: [
      { t: L('Before discharge', 'قبل التفريغ'), time: '08:00', who: L('Line reefer desk', 'مكتب المبرّدات لدى الخط'), kind: 'docs',
        items: [D(L('Reefer list with setpoints, ventilation, humidity', 'قائمة المبرّدات مع الضبط والتهوية والرطوبة'), true, L('Settings must match.', 'يجب أن تتطابق الإعدادات.')), D(L('Plug positions reserved in block R', 'حجز مواقع المقابس في الكتلة R'), true, L('Minimise time off power.', 'تقليل الوقت دون كهرباء.')), D(L('Reefer technician on standby at the quay', 'فنّي المبرّدات جاهز على الرصيف'), true, L('Quick fault response.', 'استجابة سريعة للأعطال.')), D(L('Fumigation certificate', 'شهادة التبخير'), false, L('Not for pharma reefers.', 'لا تنطبق على مبرّدات الأدوية.'))] },
      { t: L('Plug-in time', 'وقت التوصيل'), time: '10:00', who: L('Yard', 'الساحة'), kind: 'calc',
        msg: L('Box 1 discharged 10:05, plugged 10:35. Box 2: 10:12 → 11:20. Box 3: 10:20 → 10:50.', 'الحاوية 1 فُرّغت 10:05 ووُصلت 10:35. الحاوية 2: 10:12 ← 11:20. الحاوية 3: 10:20 ← 10:50.'),
        q: L('Longest unplugged time (minutes)? Target ≤ 45 min for pharma.', 'أطول مدة دون كهرباء (دقائق)؟ الهدف ≤ 45 دقيقة للأدوية.'), a: 68, tol: 0, unit: 'min', sol: L('Box 2: 10:12 → 11:20 = 68 min → exceeds target; log it and inform the line.', 'الحاوية 2: 10:12 ← 11:20 = 68 دقيقة ← تتجاوز الهدف؛ سجّلها وأبلغ الخط.'), fx: (S) => { S.unplugged = '68 min (box 2)'; S.plugs = 37; S.status = 'Plugged in block R'; } },
      { t: L('Alarm on box 2', 'إنذار في الحاوية 2'), time: '14:20', who: L('Remote monitoring', 'المراقبة عن بُعد'), kind: 'choice',
        msg: L('Box 2 supply air +8.6 °C and rising. Alarm code: high pressure.', 'هواء التزويد للحاوية 2 عند +8.6 °م وفي ارتفاع. رمز الإنذار: ضغط مرتفع.'),
        opts: [O(L('Technician checks condenser/fan & power now; log readings; inform the line with data; prepare a PTI’d spare reefer for possible transfer.', 'الفنّي يفحص المكثّف/المروحة والكهرباء الآن؛ سجّل القراءات؛ أبلغ الخط بالبيانات؛ جهّز مبرّدة احتياطية مفحوصة لنقل محتمل.'), 10, L('Fast, factual, prepared.', 'سريع وواقعي ومستعد.')), O(L('Lower setpoint to +2 °C.', 'خفّض الضبط إلى +2 °م.'), 0, L('Never change setpoints without the line’s written instruction.', 'لا تغيّر الضبط أبدًا دون تعليمات مكتوبة من الخط.')), O(L('Wait for the next round.', 'انتظر الجولة التالية.'), 0, L('Pharma excursions must be handled immediately.', 'انحرافات الأدوية يجب معالجتها فورًا.'))],
        fx: (S) => { S.temp = '+5.2 °C (fan fixed 14:55)'; }, file: L('Reefer incident log box 2', 'سجلّ حادث المبرّدة 2') },
      { t: L('Release documents', 'مستندات الإفراج'), time: 'Day 2', who: L('Importer / broker', 'المستورد / المخلّص'), kind: 'docs',
        items: [D(L('Ministry of Health import permit / release', 'إذن استيراد / إفراج وزارة الصحة'), true, L('Medicines are controlled.', 'الأدوية خاضعة للرقابة.')), D(L('Customs release', 'الإفراج الجمركي'), true, L('Always.', 'دائمًا.')), D(L('Delivery order', 'إذن التسليم'), true, L('Line release.', 'إفراج الخط.')), D(L('Temperature log download for the whole stay', 'تنزيل سجلّ الحرارة طوال مدة البقاء'), true, L('Proves the cold chain (GDP).', 'يثبت سلسلة التبريد (ممارسات التوزيع الجيدة).')), D(L('Draft survey', 'مسح الغاطس'), false, L('Bulk only.', 'للسائبة فقط.'))] },
      { t: L('Delivery sequence', 'تسلسل التسليم'), time: 'Day 2', who: L('Gate', 'البوابة'), kind: 'seq',
        items: [L('Genset truck booked for the time slot', 'حجز شاحنة بمولّد للفترة'), L('Unplug only when the truck is under the RTG', 'الفصل فقط عندما تكون الشاحنة تحت RTG'), L('Mount on chassis, connect genset, check running', 'التحميل على الشاسيه، توصيل المولّد، التحقّق من التشغيل'), L('Gate-out: seal, setpoint & temperature recorded on EIR', 'الخروج: الختم والضبط والحرارة مسجّلة على EIR')], fx: (S) => { S.status = 'Delivered under temperature'; } },
    ],
    debrief: L('Cold chain = minutes matter: reserve plugs, plug fast, monitor, react with data (never touch setpoints), and keep the temperature record for the release.', 'سلسلة التبريد = الدقائق مهمّة: احجز المقابس، وصّل بسرعة، راقب، تفاعل بالبيانات (لا تلمس الضبط)، واحتفظ بسجلّ الحرارة للإفراج.'),
  });

  /* ---------------------------------------------------------------- 9. DANGEROUS GOODS IMPORT */
  add({
    id: 'op-dg', area: 'special', lvl: 3, icon: '☣', title: L('Dangerous goods import — paints & fireworks', 'استيراد بضائع خطرة — دهانات وألعاب نارية'),
    sub: L('DG declarations, port authority approval, direct delivery, segregation, emergency information.', 'بيانات البضائع الخطرة، موافقة سلطة الميناء، التسليم المباشر، الفصل، معلومات الطوارئ.'),
    role: L('DG coordinator', 'منسّق البضائع الخطرة'),
    brief: L('Arriving on BMS ADRIATIC: 4 × 20′ paints (IMDG class 3, UN 1263) and 1 × 20′ fireworks (class 1.4G, UN 0336).', 'تصل على BMS ADRIATIC: 4 × 20′ دهانات (IMDG فئة 3، UN 1263) و1 × 20′ ألعاب نارية (فئة 1.4G، UN 0336).'),
    state: [{ k: 'approval', l: L('Port Authority approval', 'موافقة سلطة الميناء'), v: 'Pending' }, { k: 'paints', l: L('Class 3 location', 'موقع الفئة 3'), v: '—' }, { k: 'fireworks', l: L('Class 1 handling', 'مناولة الفئة 1'), v: '—' }],
    steps: [
      { t: L('DG documents before arrival', 'مستندات الخطرة قبل الوصول'), time: 'D-2', who: L('Agent', 'الوكيل'), kind: 'docs',
        items: [D(L('DG declaration per container (UN no., class, PSN, packing group, flashpoint)', 'بيان خطرة لكل حاوية (رقم UN، الفئة، اسم الشحن، مجموعة التعبئة، نقطة الوميض)'), true, L('IMDG requirement.', 'متطلّب IMDG.')), D(L('Container packing certificate', 'شهادة تعبئة الحاوية'), true, L('Proves correct stowage & placards.', 'تثبت الرصّ والملصقات الصحيحة.')), D(L('Emergency contact & EmS / SDS', 'رقم الطوارئ وجدول EmS / صحيفة السلامة'), true, L('For emergency response.', 'للاستجابة للطوارئ.')), D(L('Port Authority DG permit (class 1)', 'تصريح سلطة الميناء للخطرة (الفئة 1)'), true, L('Explosives need specific approval.', 'المتفجّرات تحتاج موافقة خاصة.')), D(L('Phytosanitary certificate', 'الشهادة الصحية النباتية'), false, L('Not relevant.', 'غير ذي صلة.'))],
        fx: (S) => { S.approval = 'Approved (direct delivery for class 1)'; } },
      { t: L('Where do the paints go?', 'أين تذهب الدهانات؟'), time: 'D-1', who: L('Yard planner', 'مخطّط الساحة'), kind: 'choice',
        opts: [O(L('DG block D, class 3 area, away from oxidisers (5.1) and class 1, near fire hydrant access', 'الكتلة D للخطرة، منطقة الفئة 3، بعيدًا عن المؤكسِدات (5.1) والفئة 1، قرب وصول حنفيات الإطفاء'), 10, L('Segregation by IMDG table.', 'الفصل حسب جدول IMDG.')), O(L('Import block B with other furniture boxes', 'كتلة الاستيراد B مع حاويات الأثاث الأخرى'), 0, L('DG must be in the designated area.', 'يجب أن تكون الخطرة في المنطقة المخصّصة.'))], fx: (S) => { S.paints = 'Block D, row 2'; } },
      { t: L('Fireworks handling', 'مناولة الألعاب النارية'), time: 'Day 1', who: L('Port Authority', 'سلطة الميناء'), kind: 'seq',
        items: [L('Consignee truck with permit waiting before discharge', 'شاحنة المستورد بالتصريح تنتظر قبل التفريغ'), L('Discharge the class 1 box directly onto the truck (direct delivery)', 'تفريغ حاوية الفئة 1 مباشرة على الشاحنة (تسليم مباشر)'), L('Escort to the gate; customs seal check', 'مرافقة حتى البوابة؛ فحص الختم الجمركي'), L('Gate-out and notification to authority', 'الخروج وإشعار السلطة')], fx: (S) => { S.fireworks = 'Direct delivery done'; } },
      { t: L('A paint drum leaks during inspection', 'برميل دهان يسرّب أثناء المعاينة'), time: 'Day 3', who: L('Customs inspection area', 'منطقة المعاينة الجمركية'), kind: 'choice',
        opts: [O(L('Stop, evacuate upwind, no ignition sources, absorbent per SDS by trained team, collect waste in approved drums, report.', 'أوقف، أخلِ بعكس الريح، لا مصادر اشتعال، مادة ماصّة حسب صحيفة السلامة بفريق مدرّب، جمع النفايات في براميل معتمدة، أبلغ.'), 10, L('Class 3 = flammable: ignition control first.', 'الفئة 3 = قابلة للاشتعال: التحكّم بالاشتعال أولًا.')), O(L('Wash it into the drain.', 'اغسلها إلى المصرف.'), 0, L('Environmental offence and fire risk.', 'مخالفة بيئية وخطر حريق.'))], file: L('DG incident report', 'تقرير حادث خطرة') },
    ],
    debrief: L('DG: complete declarations, authority approvals, IMDG segregation, direct delivery for class 1, and trained response for leaks.', 'الخطرة: بيانات كاملة، موافقات السلطة، الفصل حسب IMDG، التسليم المباشر للفئة 1، واستجابة مدرّبة للتسرّبات.'),
  });

  /* ---------------------------------------------------------------- 10. CREW CHANGE & SHIP SUPPLIES */
  add({
    id: 'op-ship-services', area: 'vessel', lvl: 10, icon: '🧑‍✈️', title: L('Crew change, stores, fresh water & waste', 'تبديل الطاقم والمؤن والمياه العذبة والنفايات'),
    sub: L('Immigration, crew transport, provisions under customs, fresh water quantity, MARPOL waste reception.', 'الهجرة، نقل الطاقم، المؤن تحت الرقابة الجمركية، كمية المياه العذبة، استقبال نفايات MARPOL.'),
    role: L('Ship agent husbandry operator', 'مشغّل خدمات السفن لدى الوكيل'),
    brief: L('OSL PEARL (24 crew) stays 30 h. Requests: 4 crew off / 4 on, 2 t provisions, fresh water, garbage & sludge disposal.', 'OSL PEARL (24 بحّارًا) تبقى 30 ساعة. الطلبات: نزول 4 وصعود 4 من الطاقم، 2 طن مؤن، مياه عذبة، تصريف القمامة والحمأة.'),
    state: [{ k: 'crew', l: L('Crew change', 'تبديل الطاقم'), v: 'Requested' }, { k: 'fw', l: L('Fresh water ordered', 'المياه العذبة المطلوبة'), v: 0, u: 't' }, { k: 'waste', l: L('Waste', 'النفايات'), v: 'On board' }],
    steps: [
      { t: L('Crew change documents', 'مستندات تبديل الطاقم'), time: 'D-2', who: L('Crew manager', 'مدير الطاقم'), kind: 'docs',
        items: [D(L('Passports & seaman’s books', 'جوازات السفر ودفاتر البحّارة'), true, L('Identity & sea service.', 'الهوية والخدمة البحرية.')), D(L('Visas / transit permits (OK-to-board)', 'التأشيرات / تصاريح العبور (موافقة الصعود)'), true, L('Immigration.', 'الهجرة.')), D(L('Flight tickets matched to port stay', 'تذاكر الطيران متوافقة مع مدة البقاء'), true, L('Avoid missed ship.', 'تجنّب تفويت السفينة.')), D(L('Updated crew list for immigration & port authority', 'قائمة طاقم محدّثة للهجرة وسلطة الميناء'), true, L('Sign-on/sign-off record.', 'سجلّ الصعود/النزول.')), D(L('Container EIRs', 'إيصالات EIR للحاويات'), false, L('Not related.', 'لا علاقة لها.'))],
        fx: (S) => { S.crew = 'Cleared, transport booked'; } },
      { t: L('Fresh water quantity', 'كمية المياه العذبة'), time: 'Day 1', who: L('Chief engineer', 'كبير المهندسين'), kind: 'calc',
        msg: L('Next leg 12 days. Consumption 200 L per person per day (24 crew) + 2 t/day technical use. ROB 30 t. Keep 20% reserve on the total need.', 'المرحلة التالية 12 يومًا. الاستهلاك 200 لتر للشخص يوميًا (24 بحّارًا) + 2 طن/يوم استخدام فني. المتبقّي 30 طنًا. احتفظ باحتياطي 20% على إجمالي الحاجة.'),
        q: L('Fresh water to order (t, 1 decimal)?', 'المياه العذبة المطلوبة (طن، رقم عشري واحد)؟'), a: 68.0, tol: 0.1, unit: 't',
        sol: L('Daily = 24 × 0.2 + 2 = 6.8 t × 12 = 81.6 t × 1.2 = 97.92 t − 30 ROB = 67.92 ≈ 68.0 t.', 'اليومي = 24 × 0.2 + 2 = 6.8 طن × 12 = 81.6 × 1.2 = 97.92 − 30 = 67.92 ≈ 68.0 طنًا.'), fx: (S) => { S.fw = 68; } },
      { t: L('Provisions & customs', 'المؤن والجمارك'), time: 'Day 1', who: L('Ship chandler', 'متعهّد التموين'), kind: 'choice',
        opts: [O(L('Deliver as ship’s stores under customs supervision (duty-free, delivery note & customs form), via the gate with a stores pass.', 'التسليم كمؤن سفينة تحت إشراف جمركي (معفاة من الرسوم، مذكّرة تسليم ونموذج جمركي)، عبر البوابة بتصريح مؤن.'), 10, L('Ship’s stores are a customs procedure.', 'مؤن السفن إجراء جمركي.')), O(L('Hand them over the fence to save time.', 'سلّمها عبر السياج لتوفير الوقت.'), 0, L('Smuggling risk and ISPS breach.', 'خطر تهريب وخرق لـ ISPS.'))] },
      { t: L('Waste reception', 'استقبال النفايات'), time: 'Day 1', who: L('Port reception facility', 'مرفق الاستقبال في الميناء'), kind: 'docs',
        items: [D(L('Advance waste notification form (MARPOL)', 'نموذج الإشعار المسبق بالنفايات (MARPOL)'), true, L('Required before arrival.', 'مطلوب قبل الوصول.')), D(L('Garbage record book / oil record book entries', 'قيود سجلّ القمامة / سجلّ الزيت'), true, L('Inspected by PSC.', 'تفحصها الرقابة.')), D(L('Waste delivery receipt from the facility', 'إيصال تسليم النفايات من المرفق'), true, L('Proof of legal disposal.', 'إثبات التخلّص القانوني.')), D(L('Phytosanitary certificate', 'الشهادة الصحية النباتية'), false, L('Not for ship waste.', 'لا تنطبق على نفايات السفن.'))], fx: (S) => { S.waste = 'Delivered (receipt WR-118)'; } },
    ],
    debrief: L('Ship husbandry is about compliance and timing: immigration documents, correct quantities, customs-controlled stores and documented MARPOL waste delivery.', 'خدمات السفن تتعلّق بالامتثال والتوقيت: مستندات الهجرة، الكميات الصحيحة، المؤن تحت الرقابة الجمركية، وتسليم موثّق لنفايات MARPOL.'),
  });

  /* ---------------------------------------------------------------- 11. HEAVY LIFT PROJECT */
  add({
    id: 'op-heavylift', area: 'special', lvl: 8, icon: '🏗', title: L('Project cargo — 3 transformers to a power plant', 'شحنات مشاريع — 3 محوّلات لمحطة كهرباء'),
    sub: L('Cargo data, crane selection, lift plan, ground bearing, SPMT road move, permits.', 'بيانات البضاعة، اختيار الرافعة، خطة الرفع، تحمّل الأرض، النقل البري بـ SPMT، التصاريح.'),
    role: L('Project cargo manager', 'مدير شحنات المشاريع'),
    brief: L('Three transformers of 86 t each (8 × 3.5 × 4 m) arrive on a heavy-lift ship with 2 × 150 t ship cranes. Quay capacity 6 t/m². Destination 70 km inland.', 'ثلاثة محوّلات وزن كلّ منها 86 طنًا (8 × 3.5 × 4 م) تصل على سفينة رفع ثقيل برافعتين × 150 طنًا. تحمّل الرصيف 6 أطنان/م². الوجهة على بعد 70 كم في الداخل.'),
    state: [{ k: 'crane', l: L('Lifting method', 'طريقة الرفع'), v: '—' }, { k: 'gbp', l: L('Ground pressure', 'ضغط الأرض'), v: '—' }, { k: 'permits', l: L('Road permits', 'تصاريح الطريق'), v: 'Pending' }],
    steps: [
      { t: L('Hook load', 'حمل الخطاف'), time: 'D-10', who: L('Lift engineer', 'مهندس الرفع'), kind: 'calc', q: L('Transformer 86 t + spreader beam 5 t + slings & shackles 1.5 t. Hook load (t)?', 'المحوّل 86 طنًا + عارضة رفع 5 أطنان + حبال وأقفال 1.5 طن. حمل الخطاف (طن)؟'), a: 92.5, tol: 0, unit: 't', sol: L('86 + 5 + 1.5 = 92.5 t.', '86 + 5 + 1.5 = 92.5 طنًا.') },
      { t: L('Crane choice', 'اختيار الرافعة'), time: 'D-10', who: L('Lift engineer', 'مهندس الرفع'), kind: 'choice',
        msg: L('Options: (a) ship crane single 150 t at the needed outreach = 110 t; (b) our 2 MHCs tandem: 2 × 72 t at 14 m, derate 75%; (c) hire a 300 t mobile crane (USD 18,000/day).', 'الخيارات: (أ) رافعة السفينة منفردة 150 طنًا عند المدى المطلوب = 110 أطنان؛ (ب) رافعتانا المتنقّلتان ترادفيًا: 2 × 72 طنًا عند 14 م، تخفيض 75%؛ (ج) استئجار رافعة متنقّلة 300 طن (18,000 دولار/يوم).'),
        opts: [O(L('(a) Ship crane: 92.5 t ≤ 110 t (84%) — with a signed lift plan', '(أ) رافعة السفينة: 92.5 ≤ 110 أطنان (84%) — مع خطة رفع موقّعة'), 10, L('Within capacity, no extra cost.', 'ضمن القدرة، بلا تكلفة إضافية.')), O(L('(b) MHC tandem', '(ب) الترادفي بالرافعتين المتنقّلتين'), 5, L('2 × 72 × 0.75 = 108 t ≥ 92.5 OK in capacity, but a tandem lift adds risk when the ship’s gear is sufficient — acceptable, not best.', '2 × 72 × 0.75 = 108 أطنان ≥ 92.5 من حيث القدرة، لكن الترادفي يضيف خطرًا حين تكفي روافع السفينة.')), O(L('(c) Hire 300 t crane', '(ج) استئجار رافعة 300 طن'), 5, L('Safe but unnecessary cost.', 'آمن لكنه تكلفة غير ضرورية.'))], fx: (S) => { S.crane = 'Ship crane 150 t'; } },
      { t: L('Ground bearing on the quay', 'تحمّل الأرض على الرصيف'), time: 'D-5', who: L('Civil engineer', 'المهندس المدني'), kind: 'calc',
        msg: L('SPMT (8 axle lines) + transformer = 120 t total, footprint 10 m × 2.5 m. Quay limit 6 t/m².', 'مقطورة SPMT (8 خطوط محاور) + المحوّل = 120 طنًا إجمالًا، المساحة 10 م × 2.5 م. حدّ الرصيف 6 أطنان/م².'),
        q: L('Ground pressure (t/m², 1 decimal)?', 'ضغط الأرض (طن/م²، رقم عشري واحد)؟'), a: 4.8, tol: 0.05, unit: 't/m²', sol: L('120 ÷ (10 × 2.5) = 4.8 t/m² ≤ 6 ✓.', '120 ÷ (10 × 2.5) = 4.8 طن/م² ≤ 6 ✓.'), fx: (S) => { S.gbp = '4.8 t/m² OK'; } },
      { t: L('Permits & lift-day sequence', 'التصاريح وتسلسل يوم الرفع'), time: 'Lift day', who: L('Project team', 'فريق المشروع'), kind: 'seq',
        items: [L('Road permits & police escort for oversize transport', 'تصاريح الطريق ومرافقة الشرطة للنقل خارج المقاس'), L('Pre-lift meeting, wind check, exclusion zone', 'اجتماع ما قبل الرفع، فحص الرياح، منطقة محظورة'), L('Trial lift 10 cm, check slings & CoG', 'رفع تجريبي 10 سم، فحص الحبال ومركز الثقل'), L('Lift and land on SPMT, sea-fastening removed / road lashing applied', 'الرفع والإنزال على SPMT، إزالة التثبيت البحري / تثبيت الطريق'), L('Night convoy to site', 'قافلة ليلية إلى الموقع')], fx: (S) => { S.permits = 'Approved, convoy done'; } },
    ],
    debrief: L('Heavy lifts: hook load incl. rigging, capacity at radius, ground bearing, permits and a disciplined lift-day sequence.', 'الرفع الثقيل: حمل الخطاف مع أدوات الرفع، القدرة عند نصف القطر، تحمّل الأرض، التصاريح وتسلسل منضبط ليوم الرفع.'),
  });

  /* ---------------------------------------------------------------- 12. EMPTY DEPOT CYCLE */
  add({
    id: 'op-depot', area: 'cont', lvl: 4, icon: '🏭', title: L('Empty depot cycle — return, repair, release', 'دورة مستودع الفارغ — الإرجاع والإصلاح والإطلاق'),
    sub: L('Gate-in survey, EOR, liability, line approval, repair, PTI, grading, release order, stock report.', 'فحص الدخول، تقدير الإصلاح، المسؤولية، موافقة الخط، الإصلاح، PTI، التصنيف، أمر الإطلاق، تقرير المخزون.'),
    role: L('Depot operations manager', 'مدير عمليات المستودع'),
    brief: L('Cedar Depot, Atlas Ocean Line stock: 40′ HC sound 18, damaged 9. A booking needs 25 × 40′ HC in 3 days.', 'مستودع الأرز، مخزون Atlas Ocean Line: 40′ عالية سليمة 18، متضرّرة 9. حجز يحتاج 25 × 40′ عالية خلال 3 أيام.'),
    state: [{ k: 'sound', l: L('Sound 40′ HC', '40′ عالية سليمة'), v: 18 }, { k: 'damaged', l: L('Damaged 40′ HC', '40′ عالية متضرّرة'), v: 9 }, { k: 'need', l: L('Booking need', 'حاجة الحجز'), v: 25 }],
    steps: [
      { t: L('Gate-in survey', 'فحص الدخول'), time: 'Day 1', who: L('Surveyor', 'المُعاين'), kind: 'choice',
        msg: L('Returned AOLU 778120 7: forklift hole in floor, cargo residue. Gate-out EIR showed clean.', 'الحاوية المُرجعة AOLU 778120 7: ثقب رافعة شوكية في الأرضية، بقايا بضاعة. EIR الخروج أظهر أنها نظيفة.'),
        opts: [O(L('Grade DM, user damage; photos; EOR to line for recharge to consignee', 'درجة DM، ضرر مستخدم؛ صور؛ تقدير إصلاح للخط لتحميله على المستورد'), 10, L('Evidence + correct liability.', 'دليل + مسؤولية صحيحة.')), O(L('Wear & tear — owner pays', 'استهلاك — المالك يدفع'), 0, L('Forklift holes are handling damage.', 'ثقوب الرافعات الشوكية ضرر مناولة.'))], fx: (S) => { S.damaged = 10; } },
      { t: L('Repair estimate', 'تقدير الإصلاح'), time: 'Day 1', who: L('M&R workshop', 'ورشة الصيانة'), kind: 'calc', q: L('Floor section 4 h + cleaning 1.5 h at USD 22/h, materials USD 140. EOR (USD)?', 'قسم الأرضية 4 ساعات + التنظيف 1.5 ساعة بـ 22 دولارًا/ساعة، المواد 140 دولارًا. التقدير (دولار)؟'), a: 261, tol: 0, unit: 'USD', sol: L('5.5 × 22 = 121 + 140 = USD 261.', '5.5 × 22 = 121 + 140 = 261 دولارًا.'), file: L('EOR AOLU7781207 USD 261', 'تقدير الإصلاح AOLU7781207 بقيمة 261 دولارًا') },
      { t: L('Can we cover the booking?', 'هل يمكننا تغطية الحجز؟'), time: 'Day 1', who: L('Line equipment controller', 'مراقب المعدّات لدى الخط'), kind: 'choice',
        msg: L('Sound 18. Damaged 10 (7 minor, repair 2 days; 3 major, 6 days). Returns expected: 2/day.', 'السليمة 18. المتضرّرة 10 (7 بسيطة، إصلاح يومان؛ 3 كبيرة، 6 أيام). الإرجاع المتوقّع: 2/يوم.'),
        opts: [O(L('Approve the 7 minor repairs today (+7), count 4 returns in 2 days → 29 ≥ 25; release in order, food bookings get best grade.', 'اعتمد الإصلاحات البسيطة السبع اليوم (+7)، احسب 4 حاويات مُرجعة خلال يومين ← 29 ≥ 25؛ أطلق بالترتيب، وحجوزات الأغذية تأخذ أفضل درجة.'), 10, L('Repairs are the fastest supply.', 'الإصلاحات أسرع مصدر.')), O(L('Ask for repositioning from abroad only', 'اطلب إعادة تموضع من الخارج فقط'), 5, L('Slow (weeks) — use local levers first.', 'بطيء (أسابيع) — استخدم الأدوات المحلية أولًا.'))], fx: (S) => { S.sound = 29; S.damaged = 3; } },
      { t: L('Release sequence', 'تسلسل الإطلاق'), time: 'Day 3', who: L('Depot gate', 'بوابة المستودع'), kind: 'seq',
        items: [L('Receive release order (COPARN) with booking number', 'استلام أمر الإطلاق (COPARN) برقم الحجز'), L('Pick box of the right type/grade from the top of the stack', 'اختيار حاوية من النوع/الدرجة الصحيحة من أعلى الرصّة'), L('Trucker ID & booking check at gate', 'فحص هوية الناقل والحجز على البوابة'), L('EIR out with photos', 'EIR الخروج مع الصور'), L('CODECO gate-out to the line, stock updated', 'CODECO الخروج للخط وتحديث المخزون')], fx: (S) => { S.need = 0; S.sound = 4; } },
    ],
    debrief: L('Depot: evidence at gate-in, correct liability, fast EOR approvals, local supply levers before repositioning, and accurate stock reporting.', 'المستودع: دليل عند الدخول، مسؤولية صحيحة، اعتماد سريع للتقديرات، أدوات الإمداد المحلية قبل إعادة التموضع، وتقارير مخزون دقيقة.'),
  });

  /* ---------------------------------------------------------------- 13. PORT COSTS PDA → FDA */
  add({
    id: 'op-pda', area: 'vessel', lvl: 6, icon: '🧾', title: L('Port costs — from PDA to final account', 'تكاليف الميناء — من الحساب التقديري للنهائي'),
    sub: L('Port dues on GT, pilotage, towage, berth hire, agency fee, terminal charges, final disbursement.', 'رسوم الميناء على GT، الإرشاد، القطر، أجرة الرصيف، أتعاب الوكالة، رسوم المحطة، الحساب النهائي.'),
    role: L('Ship agent — accounts', 'الوكيل البحري — الحسابات'),
    brief: L('Prepare costs for BMS ADRIATIC (GT 54,000, LOA 294 m). Fictional tariff: port dues USD 0.12/GT; pilotage USD 0.025/GT per movement (in & out); towage USD 2,800 per tug per movement; berth hire USD 0.9 per metre LOA per hour; agency fee USD 3,500.', 'جهّز تكاليف BMS ADRIATIC (GT 54,000، طول 294 م). تعرفة افتراضية: رسوم الميناء 0.12 دولار/GT؛ الإرشاد 0.025 دولار/GT لكل حركة (دخول وخروج)؛ القطر 2,800 دولار لكل قاطرة لكل حركة؛ أجرة الرصيف 0.9 دولار لكل متر طول لكل ساعة؛ أتعاب الوكالة 3,500 دولار.'),
    state: [{ k: 'pda', l: L('PDA total', 'إجمالي الحساب التقديري'), v: 0, u: 'USD' }, { k: 'fda', l: L('FDA total', 'إجمالي الحساب النهائي'), v: 0, u: 'USD' }],
    steps: [
      { t: L('Port dues', 'رسوم الميناء'), kind: 'calc', who: L('Tariff', 'التعرفة'), q: L('Port dues (USD)?', 'رسوم الميناء (دولار)؟'), a: 6480, tol: 0, unit: 'USD', sol: L('54,000 × 0.12 = USD 6,480.', '54,000 × 0.12 = 6,480 دولارًا.') },
      { t: L('Pilotage', 'الإرشاد'), kind: 'calc', who: L('Tariff', 'التعرفة'), q: L('Pilotage for arrival + departure (USD)?', 'الإرشاد للدخول + الخروج (دولار)؟'), a: 2700, tol: 0, unit: 'USD', sol: L('54,000 × 0.025 = 1,350 × 2 = USD 2,700.', '54,000 × 0.025 = 1,350 × 2 = 2,700 دولار.') },
      { t: L('Towage', 'القطر'), kind: 'calc', who: L('Tariff', 'التعرفة'), q: L('2 tugs in, 2 tugs out. Towage (USD)?', 'قاطرتان دخولًا وقاطرتان خروجًا. القطر (دولار)؟'), a: 11200, tol: 0, unit: 'USD', sol: L('4 tug-movements × 2,800 = USD 11,200.', '4 حركات قاطرة × 2,800 = 11,200 دولار.') },
      { t: L('Berth hire (planned 24 h)', 'أجرة الرصيف (24 ساعة مخطّطة)'), kind: 'calc', who: L('Tariff', 'التعرفة'), q: L('Berth hire for 24 h (USD, 1 decimal)?', 'أجرة الرصيف لـ 24 ساعة (دولار، رقم عشري واحد)؟'), a: 6350.4, tol: 0.1, unit: 'USD', sol: L('294 × 0.9 × 24 = USD 6,350.4.', '294 × 0.9 × 24 = 6,350.4 دولار.') },
      { t: L('PDA total', 'إجمالي الحساب التقديري'), kind: 'calc', who: L('Agent', 'الوكيل'), q: L('PDA = port dues + pilotage + towage + berth hire + agency fee (USD, 1 decimal)?', 'الحساب التقديري = رسوم الميناء + الإرشاد + القطر + أجرة الرصيف + أتعاب الوكالة (دولار، رقم عشري واحد)؟'), a: 30230.4, tol: 0.1, unit: 'USD', sol: L('6,480 + 2,700 + 11,200 + 6,350.4 + 3,500 = USD 30,230.4 — send to owners for funding before arrival.', '6,480 + 2,700 + 11,200 + 6,350.4 + 3,500 = 30,230.4 دولار — يُرسل للمالكين للتمويل قبل الوصول.'), fx: (S) => { S.pda = 30230.4; }, file: L('PDA BMS ADRIATIC USD 30,230.4', 'الحساب التقديري BMS ADRIATIC بقيمة 30,230.4 دولار') },
      { t: L('Final account', 'الحساب النهائي'), kind: 'calc', who: L('Agent', 'الوكيل'), msg: L('Actual berth time was 21.5 h (not 24) and a third tug was used on departure due to wind.', 'وقت الرصيف الفعلي 21.5 ساعة (لا 24) واستُخدمت قاطرة ثالثة عند المغادرة بسبب الرياح.'),
        q: L('FDA total (USD, 1 decimal)?', 'إجمالي الحساب النهائي (دولار، رقم عشري واحد)؟'), a: 32368.9, tol: 0.1, unit: 'USD', sol: L('Berth hire 294 × 0.9 × 21.5 = 5,688.9; towage 5 × 2,800 = 14,000. FDA = 6,480 + 2,700 + 14,000 + 5,688.9 + 3,500 = USD 32,368.9.', 'أجرة الرصيف 294 × 0.9 × 21.5 = 5,688.9؛ القطر 5 × 2,800 = 14,000. الحساب النهائي = 6,480 + 2,700 + 14,000 + 5,688.9 + 3,500 = 32,368.9 دولار.'),
        fx: (S) => { S.fda = 32368.9; }, file: L('FDA with supporting invoices', 'الحساب النهائي مع الفواتير الداعمة') },
    ],
    debrief: L('Port costs follow tariff bases: GT for dues/pilotage, movements for towage, LOA × hours for berth hire. The PDA funds the call; the FDA explains every difference with invoices.', 'تكاليف الميناء تتبع أسس التعرفة: GT للرسوم/الإرشاد، الحركات للقطر، الطول × الساعات لأجرة الرصيف. الحساب التقديري يموّل الزيارة؛ والنهائي يشرح كل فرق بالفواتير.'),
  });

  /* ---------------------------------------------------------------- 14. FERTILISER EXPORT LOADING + LAYTIME */
  add({
    id: 'op-bulk-export', area: 'bulk', lvl: 7, icon: '⛴', title: L('Bulk export — loading fertiliser & the laytime statement', 'تصدير سائب — تحميل الأسمدة وبيان زمن الرسو'),
    sub: L('Hold inspection, loading plan, ship loader rate, rain stops, draft survey, mate’s receipt, laytime.', 'فحص العنابر، خطة التحميل، معدّل محمّل السفن، توقفات المطر، مسح الغاطس، إيصال الضابط، زمن الرسو.'),
    role: L('Bulk terminal operations & laytime clerk', 'عمليات المحطة السائبة وكاتب زمن الرسو'),
    brief: L('MV CEDAR SPIRIT loads 30,000 t of bulk urea (non-hazardous grade). CP: 10,000 t/day WWD SHINC, demurrage USD 14,000/day, despatch half. Ship loader 1,000 t/h nominal.', 'السفينة CEDAR SPIRIT تحمّل 30,000 طن يوريا سائبة (درجة غير خطرة). العقد: 10,000 طن/يوم WWD SHINC، الغرامة 14,000 دولار/يوم، المكافأة النصف. محمّل السفن 1,000 طن/س اسميًا.'),
    state: [{ k: 'loaded', l: L('Loaded', 'المحمّل'), v: 0, u: 't' }, { k: 'rain', l: L('Rain stops', 'توقفات المطر'), v: 0, u: 'h' }, { k: 'laytime', l: L('Laytime result', 'نتيجة زمن الرسو'), v: '—' }],
    steps: [
      { t: L('Hold inspection before loading', 'فحص العنابر قبل التحميل'), who: L('Surveyor', 'المُعاين'), kind: 'choice', msg: L('Holds 2 and 4 have residues of previous coal cargo.', 'العنبران 2 و4 فيهما بقايا شحنة فحم سابقة.'),
        opts: [O(L('Holds not ready: ship must clean; NOR not accepted until holds pass; record times.', 'العنابر غير جاهزة: على السفينة التنظيف؛ لا يُقبل إشعار الجاهزية حتى تجتاز العنابر الفحص؛ سجّل الأوقات.'), 10, L('A ship must be ready in all respects for a valid NOR.', 'يجب أن تكون السفينة جاهزة من كل النواحي لإشعار جاهزية صحيح.')), O(L('Start loading in clean holds and ignore the rest.', 'ابدأ التحميل في العنابر النظيفة وتجاهل الباقي.'), 5, L('Possible operationally, but NOR/laytime must reflect it.', 'ممكن تشغيليًا، لكن يجب أن يعكس الإشعار/زمن الرسو ذلك.'))] },
      { t: L('Loading time', 'زمن التحميل'), who: L('Shift supervisor', 'مشرف الوردية'), kind: 'calc', msg: L('Effective loader rate 75% of nominal. Rain stops (no loading in rain for urea): 9 h.', 'معدّل المحمّل الفعلي 75% من الاسمي. توقفات المطر (لا تحميل لليوريا تحت المطر): 9 ساعات.'),
        q: L('Total time from start to completion of loading (h)?', 'الوقت الكلي من بدء التحميل حتى انتهائه (ساعة)؟'), a: 49, tol: 0.1, unit: L('h', 'ساعة'), sol: L('30,000 ÷ 750 = 40 h working + 9 h rain = 49 h.', '30,000 ÷ 750 = 40 ساعة عمل + 9 ساعات مطر = 49 ساعة.'), fx: (S) => { S.loaded = 30000; S.rain = 9; } },
      { t: L('Laytime statement', 'بيان زمن الرسو'), who: L('Laytime clerk', 'كاتب زمن الرسو'), kind: 'calc', msg: L('Laytime counted from commencement = loading start (after cleaning) to completion = 49 h; rain stops are excepted (WWD).', 'يُحسب زمن الرسو من البدء = بداية التحميل (بعد التنظيف) حتى الانتهاء = 49 ساعة؛ توقفات المطر مستثناة (WWD).'),
        q: L('Despatch earned (USD)? Laytime = 30,000 ÷ 10,000 = 3 days.', 'مكافأة السرعة المستحقّة (دولار)؟ زمن الرسو = 30,000 ÷ 10,000 = 3 أيام.'), a: 9333.33, tol: 1, unit: 'USD', sol: L('Time used = 49 − 9 = 40 h = 1.667 days. Saved = 3 − 1.667 = 1.333 days × 7,000 = USD 9,333 despatch (on all time saved).', 'الوقت المستخدم = 49 − 9 = 40 ساعة = 1.667 يوم. الموفَّر = 3 − 1.667 = 1.333 يوم × 7,000 = 9,333 دولارًا.'),
        fx: (S) => { S.laytime = 'Despatch'; } },
      { t: L('Shipping documents', 'مستندات الشحن'), who: L('Agent', 'الوكيل'), kind: 'docs',
        items: [D(L('Draft survey report (load port)', 'تقرير مسح الغاطس (ميناء التحميل)'), true, L('B/L quantity basis.', 'أساس كمية البوليصة.')), D(L('Mate’s receipt → bills of lading', 'إيصال الضابط ← بوالص الشحن'), true, L('Cargo received on board.', 'البضاعة مستلمة على السفينة.')), D(L('Certificate of quality & origin', 'شهادة الجودة والمنشأ'), true, L('Buyer & customs.', 'للمشتري والجمارك.')), D(L('Statement of Facts signed by master & agent', 'بيان الوقائع موقّع من الربّان والوكيل'), true, L('Laytime evidence.', 'دليل زمن الرسو.')), D(L('VGM per hold', 'VGM لكل عنبر'), false, L('Containers only.', 'للحاويات فقط.'))] },
    ],
    debrief: L('Bulk export: ready holds before NOR, realistic effective rates, weather exceptions recorded precisely, and a signed SOF behind every laytime figure.', 'التصدير السائب: عنابر جاهزة قبل إشعار الجاهزية، معدّلات فعلية واقعية، تسجيل دقيق لاستثناءات الطقس، وبيان وقائع موقّع خلف كل رقم لزمن الرسو.'),
  });

  /* ---------------------------------------------------------------- 15. NEW BERTH PROJECT */
  add({
    id: 'op-newberth', area: 'special', lvl: 9, icon: '🏗', title: L('New berth project — from idea to first ship', 'مشروع رصيف جديد — من الفكرة حتى أول سفينة'),
    sub: L('Demand case, sizing, feasibility, permits, procurement, construction while operating, commissioning.', 'مبرّرات الطلب، تحديد الحجم، الجدوى، التراخيص، المشتريات، الإنشاء أثناء التشغيل، التشغيل التجريبي.'),
    role: L('Port development project director', 'مدير مشروع تطوير الميناء'),
    brief: L('CBCT must add capacity. Forecast: 1.25 M TEU today, +6%/yr. A 400 m berth with 4 STS cranes is proposed.', 'يجب على CBCT زيادة الطاقة. التوقّع: 1.25 مليون TEU اليوم، +6%/سنة. يُقترح رصيف 400 م مع 4 رافعات STS.'),
    state: [{ k: 'phase', l: L('Project phase', 'مرحلة المشروع'), v: 'Idea' }, { k: 'capex', l: L('CAPEX estimate', 'تقدير التكاليف الرأسمالية'), v: 0, u: 'USD M' }, { k: 'npv', l: L('NPV', 'صافي القيمة الحالية'), v: '—' }],
    steps: [
      { t: L('Demand in year 6', 'الطلب في السنة 6'), who: L('Planning team', 'فريق التخطيط'), kind: 'calc', q: L('1,250,000 × 1.06^6 (TEU, nearest whole)?', '1,250,000 × 1.06^6 (TEU، لأقرب عدد صحيح)؟'), a: 1773148, tol: 2, unit: 'TEU', sol: L('1,250,000 × 1.4185 = 1,773,149 TEU > current capacity 1.6 M.', '1,250,000 × 1.4185 = 1,773,149 TEU > الطاقة الحالية 1.6 مليون.') },
      { t: L('CAPEX estimate', 'تقدير التكاليف الرأسمالية'), who: L('Engineer', 'المهندس'), kind: 'form',
        msg: L('Quay 400 m × USD 110,000/m; dredging 1.2 M m³ × USD 9; 4 STS × USD 12 M; yard & utilities USD 60 M.', 'الرصيف 400 م × 110,000 دولار/م؛ التجريف 1.2 مليون م³ × 9 دولارات؛ 4 رافعات × 12 مليونًا؛ الساحة والمرافق 60 مليونًا.'),
        fields: [{ l: L('Quay (USD M)', 'الرصيف (مليون دولار)'), type: 'number', a: 44, tol: 0.1 }, { l: L('Dredging (USD M)', 'التجريف (مليون دولار)'), type: 'number', a: 10.8, tol: 0.1 }, { l: L('Total CAPEX (USD M)', 'إجمالي التكاليف الرأسمالية (مليون دولار)'), type: 'number', a: 162.8, tol: 0.1 }],
        sol: L('44 + 10.8 + 48 + 60 = USD 162.8 M (+ contingency 10–20% in a real budget).', '44 + 10.8 + 48 + 60 = 162.8 مليون دولار (+ احتياطي 10–20% في ميزانية حقيقية).'), fx: (S) => { S.capex = 162.8; S.phase = 'Feasibility'; } },
      { t: L('Is it viable?', 'هل هو مجدٍ؟'), who: L('Finance', 'المالية'), kind: 'choice', msg: L('Net cash flow USD 22 M/yr for 25 years, discount rate 10% (annuity factor 9.077).', 'التدفّق الصافي 22 مليون دولار/سنة لـ 25 سنة، معدّل الخصم 10% (معامل الدفعات 9.077).'),
        opts: [O(L('NPV = 22 × 9.077 − 162.8 ≈ +36.9 M → viable; proceed with risk analysis and financing plan', 'صافي القيمة الحالية = 22 × 9.077 − 162.8 ≈ +36.9 مليون ← مجدٍ؛ تابع بتحليل المخاطر وخطة التمويل'), 10, L('Positive NPV at the cost of capital.', 'صافي قيمة حالية موجب عند تكلفة رأس المال.')), O(L('Not viable', 'غير مجدٍ'), 0, L('NPV is positive.', 'صافي القيمة الحالية موجب.'))], fx: (S) => { S.npv = '+36.9 M'; } },
      { t: L('Project sequence', 'تسلسل المشروع'), who: L('PMO', 'مكتب إدارة المشاريع'), kind: 'seq',
        items: [L('Feasibility study & board approval', 'دراسة الجدوى وموافقة المجلس'), L('ESIA, site investigations & permits', 'تقييم الأثر البيئي والاجتماعي، تحرّيات الموقع والتراخيص'), L('Design & EPC tender; crane order (long lead)', 'التصميم ومناقصة EPC؛ طلب الرافعات (مهلة طويلة)'), L('Dredging, quay construction, yard & utilities (while operating)', 'التجريف، إنشاء الرصيف، الساحة والمرافق (أثناء التشغيل)'), L('Crane commissioning, TOS configuration, staff training', 'تشغيل الرافعات التجريبي، إعداد TOS، تدريب الموظّفين'), L('First vessel & productivity ramp-up', 'أول سفينة ورفع الإنتاجية')], fx: (S) => { S.phase = 'Operational'; } },
    ],
    debrief: L('Development projects: demand evidence, sound CAPEX, positive NPV, permits before design, long-lead items early, and an operations-led ramp-up.', 'مشاريع التطوير: دليل الطلب، تكاليف رأسمالية سليمة، صافي قيمة حالية موجب، التراخيص قبل التصميم، العناصر طويلة المهلة مبكرًا، ورفع أداء تقوده العمليات.'),
  });
})();
