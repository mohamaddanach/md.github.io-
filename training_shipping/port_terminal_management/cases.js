/* Port Master Academy — virtual cases (decision scenarios). Each option scores 10 (senior answer), 5 (acceptable) or 0 (wrong). */
(function () {
  const L = TS.L;
  const O = (l, s, f) => ({ l, s, f });
  const add = (x) => PT.cases.push(x);

  add({
    id: 'early-arrival', lvl: 2, icon: '⏱', title: L('The early bird', 'الطائر المبكر'),
    role: L('Berth planner, day shift', 'مخطّط أرصفة، وردية النهار'),
    brief: L('Mainline vessel BMS ADRIATIC (294 m, 1,900 moves, window Tue 14:00) reports arrival at 04:00 — 10 h early. B2 is occupied by AOL MARSEILLE until ~22:30. B1 (300 m, 14.0 m) is free until 12:00, when the feeder LFS CEDAR (window 12:00, 640 moves) is due.',
      'السفينة الرئيسية BMS ADRIATIC (294 م، 1,900 حركة، نافذتها الثلاثاء 14:00) تبلّغ بالوصول الساعة 04:00 — قبل 10 ساعات. الرصيف B2 مشغول بـ AOL MARSEILLE حتى ~22:30. الرصيف B1 (300 م، 14.0 م) فارغ حتى 12:00 حين تصل سفينة الفيدر LFS CEDAR (نافذتها 12:00، 640 حركة).'),
    data: L('ADRIATIC draft 13.2 m · B1 depth 14.0 m · 3 cranes on B1 · net rate 27 mph', 'غاطس ADRIATIC 13.2 م · عمق B1 14.0 م · 3 رافعات على B1 · المعدّل الصافي 27 حركة/ساعة'),
    stages: [
      { t: L('The agent asks: “Can we berth on arrival at B1? We would like to finish early.” 1,900 moves with 3 cranes = ~23.5 h. What do you answer?', 'يسأل الوكيل: “هل يمكننا الرسو فور الوصول على B1؟ نودّ الانتهاء مبكرًا.” 1,900 حركة بـ 3 رافعات = ~23.5 ساعة. بماذا تجيب؟'),
        opts: [
          O(L('Yes, berth at B1 at 04:30 and work until finished.', 'نعم، الرسو على B1 الساعة 04:30 والعمل حتى الانتهاء.'), 0, L('It would occupy B1 until ~05:00 next day and block LFS CEDAR’s 12:00 window. You break a window promise to serve an off-window ship.', 'ستشغل B1 حتى ~05:00 اليوم التالي وتحجب نافذة LFS CEDAR الساعة 12:00. تكسر وعد نافذة لخدمة سفينة خارج النافذة.')),
          O(L('No berth before 14:00 — anchor and wait.', 'لا رصيف قبل 14:00 — ارسُ على المخطاف وانتظر.'), 5, L('Safe for the windows but you waste 8 free hours on B1 and the line’s goodwill.', 'آمن للنوافذ لكنك تضيّع 8 ساعات فارغة على B1 وحسن نية الخط.')),
          O(L('Offer B1 from 04:30 to 11:00 “as available” for discharge only, then shift or wait for B2 at 23:00 to finish — subject to a shifting cost agreement.', 'اعرض B1 من 04:30 حتى 11:00 “حسب التوفّر” للتفريغ فقط، ثم نقل السفينة أو انتظار B2 الساعة 23:00 للإكمال — بشرط اتفاق على تكلفة النقل.'), 10, L('Senior answer: uses the idle berth, protects the feeder window, and makes the commercial cost (shifting, pilots, tugs) explicit before acting.', 'إجابة المحترف: تستغلّ الرصيف الفارغ، وتحمي نافذة الفيدر، وتوضّح التكلفة التجارية (النقل، المرشد، القاطرات) قبل التنفيذ.')),
        ] },
      { t: L('The line declines the shifting cost. The vessel anchors. At 13:00 AOL MARSEILLE reports its ETC slipped to 02:00 (crane 2 breakdown). ADRIATIC’s window starts at 14:00 at B2. What now?', 'رفض الخط تكلفة النقل. رست السفينة على المخطاف. الساعة 13:00 أبلغت AOL MARSEILLE أن موعد انتهائها انزلق إلى 02:00 (عطل الرافعة 2). نافذة ADRIATIC تبدأ 14:00 على B2. ماذا الآن؟'),
        opts: [
          O(L('Tell ADRIATIC’s agent immediately: new berthing ~03:00 at B2, reason, and recovery plan (4 cranes on arrival). Ask engineering for crane 2 ETR.', 'أبلغ وكيل ADRIATIC فورًا: الرسو الجديد ~03:00 على B2، السبب، وخطة التعويض (4 رافعات عند الوصول). اطلب من الهندسة موعد إصلاح الرافعة 2.'), 10, L('Early, factual communication with a recovery plan — the port is now late against the window, so own it.', 'تواصل مبكر وواقعي مع خطة تعويض — الميناء الآن متأخّر عن النافذة، فتحمّل المسؤولية.')),
          O(L('Wait until 14:00 to see if MARSEILLE speeds up.', 'انتظر حتى 14:00 لترى إن كانت MARSEILLE ستسرّع.'), 0, L('Hiding the problem; the line will learn it from AIS and lose trust.', 'إخفاء المشكلة؛ سيعرفها الخط من AIS ويفقد الثقة.')),
          O(L('Move ADRIATIC to B3.', 'انقل ADRIATIC إلى B3.'), 0, L('B3 is 250 m long and 11.5 m deep — a 294 m ship with 13.2 m draft does not fit. Hard constraint.', 'طول B3 هو 250 م وعمقه 11.5 م — سفينة 294 م بغاطس 13.2 م لا تتّسع. قيد صارم.')),
        ] },
      { t: L('Can you reduce ADRIATIC’s delay at all?', 'هل يمكنك تقليل تأخير ADRIATIC أصلًا؟'),
        opts: [
          O(L('Move one free crane from B1 (after LFS CEDAR finishes ~19:00) to MARSEILLE to finish earlier, so B2 frees around 23:30.', 'انقل رافعة متاحة من B1 (بعد انتهاء LFS CEDAR ~19:00) إلى MARSEILLE لتنتهي أبكر، فيتحرّر B2 حوالي 23:30.'), 10, L('Crane shifting attacks the real bottleneck (the long crane on MARSEILLE).', 'نقل الرافعة يعالج عنق الزجاجة الحقيقي (الرافعة الطويلة على MARSEILLE).')),
          O(L('Ask MARSEILLE to sail with cargo left behind.', 'اطلب من MARSEILLE الإبحار مع ترك بضائع.'), 5, L('Possible only if her line agrees (cut-and-run) — a commercial decision for them, not you.', 'ممكن فقط إن وافق خطّها (قطع العمل والإبحار) — قرار تجاري لهم لا لك.')),
          O(L('Nothing can be done.', 'لا شيء يمكن فعله.'), 0, L('Seniors always look for a lever: cranes, gangs, overtime, sequence.', 'المحترف يبحث دائمًا عن أداة: الرافعات، الفرق، العمل الإضافي، التسلسل.')),
        ] },
    ],
    debrief: L('Off-window vessels are served with idle capacity, never at the expense of window vessels. When the port causes the delay, communicate early with a recovery plan and use crane shifting to cut the long crane.', 'السفن خارج النافذة تُخدم بالسعة الفارغة، ولا تكون أبدًا على حساب سفن النوافذ. عندما يسبّب الميناء التأخير، تواصل مبكرًا مع خطة تعويض واستخدم نقل الرافعات لتقصير الرافعة الطويلة.'),
  });

  add({
    id: 'deep-draft', lvl: 2, icon: '🌊', title: L('Deep draft at low water', 'غاطس عميق عند الجزر'),
    role: L('Duty operations officer', 'ضابط العمليات المناوب'),
    brief: L('OSL PEARL (366 m) will finish loading at 03:00 with departure draft 15.2 m. Channel depth 16.0 m CD. Tide: low water 03:30 (+0.1 m), high water 09:40 (+0.6 m). UKC policy in the channel: 10% of draft. Next vessel for B2 arrives 06:00 (window).',
      'OSL PEARL (366 م) ستنهي التحميل الساعة 03:00 بغاطس مغادرة 15.2 م. عمق القناة 16.0 م. المد: جزر 03:30 (+0.1 م)، مد عالٍ 09:40 (+0.6 م). سياسة UKC في القناة: 10% من الغاطس. السفينة التالية لـ B2 تصل 06:00 (نافذة).'),
    data: L('Required UKC = 1.52 m · Squat at 6 kn ≈ 0.25 m', 'UKC المطلوب = 1.52 م · الهبوط بسرعة 6 عقد ≈ 0.25 م'),
    stages: [
      { t: L('Can PEARL sail at 03:30?', 'هل يمكن لـ PEARL الإبحار الساعة 03:30؟'),
        opts: [
          O(L('Yes: 16.0 + 0.1 − 15.2 = 0.9 m — enough.', 'نعم: 16.0 + 0.1 − 15.2 = 0.9 م — كافٍ.'), 0, L('0.9 m static (and ~0.65 m dynamic) is below the 1.52 m policy. Unsafe.', '0.9 م ساكن (و~0.65 م ديناميكي) أقل من سياسة 1.52 م. غير آمن.')),
          O(L('No. Earliest safe time is when tide gives 16.0 + tide − 15.2 ≥ 1.52 → tide ≥ 0.72 m — not reached today; she must reduce draft.', 'لا. أبكر وقت آمن عندما يعطي المد 16.0 + المد − 15.2 ≥ 1.52 ← المد ≥ 0.72 م — لن يتحقّق اليوم؛ يجب تخفيض الغاطس.'), 10, L('Correct math: even high water (+0.6) gives 1.4 m < 1.52 m. The line must reduce departure draft (~0.2 m) by cutting/redistributing cargo or ballast.', 'حساب صحيح: حتى المد العالي (+0.6) يعطي 1.4 م < 1.52 م. على الخط تخفيض غاطس المغادرة (~0.2 م) بتقليل/إعادة توزيع البضاعة أو الصابورة.')),
          O(L('Wait for high water at 09:40.', 'انتظر المد العالي الساعة 09:40.'), 5, L('Better than 03:30, but 16.6 − 15.2 = 1.4 m is still below policy — and she blocks B2 for the 06:00 window vessel.', 'أفضل من 03:30، لكن 16.6 − 15.2 = 1.4 م ما زال تحت السياسة — وتحجب B2 عن سفينة النافذة الساعة 06:00.')),
        ] },
      { t: L('When should this problem have been detected?', 'متى كان يجب اكتشاف هذه المشكلة؟'),
        opts: [
          O(L('At departure, by the pilot.', 'عند المغادرة، من قِبل المرشد.'), 0, L('Too late — the pilot will refuse and you lose the berth.', 'متأخّر جدًا — سيرفض المرشد وتخسر الرصيف.')),
          O(L('At pre-arrival / stowage planning: check planned departure draft against the tide table and tell the line’s central planner the max draft.', 'عند ما قبل الوصول / تخطيط الرصّ: مقارنة غاطس المغادرة المخطّط بجدول المد وإبلاغ المخطّط المركزي للخط بأقصى غاطس.'), 10, L('Seniors publish the max sailing draft for each tide window to lines in advance.', 'المحترفون ينشرون أقصى غاطس للإبحار لكل نافذة مد للخطوط مسبقًا.')),
          O(L('During loading, at 50% progress.', 'أثناء التحميل عند 50% من التقدّم.'), 5, L('Still possible to adjust, but costly.', 'ما زال التعديل ممكنًا لكنه مكلف.')),
        ] },
      { t: L('The line agrees to leave 20 heavy boxes (≈ 0.2 m). Departure at 09:40 high water. B2 is blocked until ~10:30. The 06:00 window vessel?', 'وافق الخط على ترك 20 حاوية ثقيلة (≈ 0.2 م). المغادرة 09:40 مع المد العالي. B2 محجوز حتى ~10:30. سفينة نافذة 06:00؟'),
        opts: [
          O(L('Berth her at B1 if LOA/draft fit, otherwise inform her line now with a new berthing time and a plan to add a crane.', 'أرسِها على B1 إن ناسبها الطول والغاطس، وإلا أبلغ خطّها الآن بوقت رسو جديد وخطة لإضافة رافعة.'), 10, L('Check alternatives against hard constraints, then communicate with a recovery plan.', 'تحقّق من البدائل مقابل القيود الصارمة، ثم تواصل مع خطة تعويض.')),
          O(L('Let her wait; it is OSL’s fault.', 'دعها تنتظر؛ إنه خطأ OSL.'), 0, L('Her line does not care whose fault it is — the port missed her window. Act.', 'خطّها لا يهتمّ بمن المخطئ — الميناء فوّت نافذتها. تصرّف.')),
        ] },
    ],
    debrief: L('UKC is non-negotiable. Check departure draft vs tide at planning stage, publish maximum drafts per tide, and protect the next window with alternatives.', 'عمق الأمان غير قابل للتفاوض. تحقّق من غاطس المغادرة مقابل المد في مرحلة التخطيط، وانشر أقصى غاطس لكل مد، واحمِ النافذة التالية ببدائل.'),
  });

  add({
    id: 'crane-down', lvl: 2, icon: '⚠', title: L('Crane breakdown mid-operation', 'عطل رافعة أثناء العمل'),
    role: L('Quay superintendent, night shift', 'مشرف الرصيف، وردية الليل'),
    brief: L('AOL MARSEILLE at B2, 4 cranes. Remaining work: QC1 220, QC2 310, QC3 260, QC4 240 moves. Rate 28 mph. Window ETD 22:30; now 08:00. At 08:05 QC2 hoist motor fails. Engineering ETR: 6 hours.',
      'AOL MARSEILLE على B2 بـ 4 رافعات. العمل المتبقّي: QC1 220، QC2 310، QC3 260، QC4 240 حركة. المعدّل 28. موعد المغادرة 22:30؛ الآن 08:00. الساعة 08:05 تعطّل محرّك رفع QC2. موعد الإصلاح المتوقّع: 6 ساعات.'),
    data: L('Before failure: long crane QC2 = 310/28 = 11.1 h → finish ~19:10.', 'قبل العطل: الرافعة الطويلة QC2 = 310/28 = 11.1 ساعة ← الانتهاء ~19:10.'),
    stages: [
      { t: L('If you do nothing, QC2 restarts at 14:00 and finishes 310 moves at ~01:10 (2 h 40 min after window ETD). Best immediate action?', 'إن لم تفعل شيئًا، تعود QC2 للعمل 14:00 وتنهي 310 حركة ~01:10 (بعد موعد المغادرة بساعتين و40 دقيقة). أفضل إجراء فوري؟'),
        opts: [
          O(L('Re-split: QC1 and QC3 take QC2’s outer bays (they are adjacent), keep a safety gap. Each takes ~155 extra moves.', 'إعادة التوزيع: QC1 وQC3 تأخذان خلجان QC2 الطرفية (متجاورة)، مع الحفاظ على مسافة الأمان. كلٌّ منهما تأخذ ~155 حركة إضافية.'), 10, L('QC1: 375 → 13.4 h, QC3: 415 → 14.8 h → finish ~22:50. Close to window, and QC2 can rejoin at 14:00 to cut it further.', 'QC1: 375 ← 13.4 ساعة، QC3: 415 ← 14.8 ساعة ← انتهاء ~22:50. قريب من النافذة، ويمكن لـ QC2 العودة 14:00 لتقصيره أكثر.')),
          O(L('Wait for engineering.', 'انتظر الهندسة.'), 0, L('Six hours idle on the critical crane.', 'ست ساعات توقّف على الرافعة الحرجة.')),
          O(L('Bring a crane from B1 (feeder working).', 'أحضر رافعة من B1 (فيدر يعمل).'), 5, L('Possible if B1’s feeder can spare it without missing its own ETD — and cranes cannot pass each other: check rail order.', 'ممكن إن استطاع فيدر B1 الاستغناء عنها دون تفويت مغادرته — والرافعات لا تتجاوز بعضها: تحقّق من ترتيبها على السكة.')),
        ] },
      { t: L('Who must you inform, and what do you write in the SOF?', 'من يجب أن تبلغ، وماذا تكتب في بيان الوقائع؟'),
        opts: [
          O(L('Line ops desk + agent: failure time, new ETC, recovery plan. SOF: “QC2 breakdown 08:05–(time) — terminal equipment”.', 'مكتب عمليات الخط + الوكيل: وقت العطل، موعد الانتهاء الجديد، خطة التعويض. بيان الوقائع: “عطل QC2 من 08:05 حتى (الوقت) — معدّات المحطة”.'), 10, L('Honest delay attribution protects trust; NCR will exclude it only if the contract says so.', 'نسب التأخير بصدق يحمي الثقة؛ ولا يُستثنى من المعدّل الصافي إلا إن نصّ العقد على ذلك.')),
          O(L('Nobody; SOF: “weather delay”.', 'لا أحد؛ بيان الوقائع: “تأخير بسبب الطقس”.'), 0, L('Falsifying the SOF is a serious integrity breach.', 'تزوير بيان الوقائع إخلال خطير بالنزاهة.')),
          O(L('Only your manager tomorrow morning.', 'مديرك فقط صباح الغد.'), 0, L('The line needs to know now to plan its next port.', 'يحتاج الخط أن يعرف الآن ليخطّط لميناءه التالي.')),
        ] },
      { t: L('QC2 is back at 13:30. What do you do with it?', 'عادت QC2 للعمل الساعة 13:30. ماذا تفعل بها؟'),
        opts: [
          O(L('Re-balance again so the remaining work of the three central cranes finishes together (give QC2 part of QC3’s remaining bays).', 'أعد الموازنة مجددًا لتنتهي الرافعات الثلاث الوسطى معًا (أعطِ QC2 جزءًا من خلجان QC3 المتبقية).'), 10, L('Dynamic re-splitting — the vessel finishes when the longest crane finishes.', 'إعادة توزيع ديناميكية — السفينة تنتهي عندما تنتهي الرافعة الطويلة.')),
          O(L('Send it to B1 for the feeder.', 'أرسلها إلى B1 للفيدر.'), 5, L('Only if MARSEILLE is already safely within window.', 'فقط إن كانت MARSEILLE ضمن النافذة بأمان.')),
          O(L('Keep it idle as backup.', 'أبقِها متوقفة احتياطًا.'), 0, L('Wasting your bottleneck resource.', 'إهدار مورد عنق الزجاجة.')),
        ] },
    ],
    debrief: L('React in minutes, not hours: re-split, inform the line with a new ETC, write a true SOF and re-balance again when capacity returns.', 'تفاعل بالدقائق لا بالساعات: أعد التوزيع، أبلغ الخط بموعد انتهاء جديد، اكتب بيان وقائع صادقًا وأعد الموازنة عند عودة القدرة.'),
  });

  add({
    id: 'reefer-alarm', lvl: 3, icon: '❄', title: L('Pharma reefer alarm', 'إنذار مبرّدة أدوية'),
    role: L('Yard supervisor', 'مشرف الساحة'),
    brief: L('02:15 — remote monitoring shows reefer OSLU 482113 6 (vaccines, setpoint +5 °C, range +2/+8) at +9.4 °C supply air and rising. It is in block R, row 4, tier 3. Loading on OSL PEARL starts at 06:00.',
      '02:15 — المراقبة عن بُعد تُظهر أن المبرّدة OSLU 482113 6 (لقاحات، الضبط +5 °م، النطاق +2/+8) عند +9.4 °م لهواء التزويد وفي ارتفاع. موقعها الكتلة R، الصف 4، الطبقة 3. التحميل على OSL PEARL يبدأ 06:00.'),
    stages: [
      { t: L('First action?', 'أول إجراء؟'),
        opts: [
          O(L('Send the reefer technician immediately to check plug, power, unit alarms; record time and readings.', 'أرسل فنّي المبرّدات فورًا لفحص المقبس والكهرباء وإنذارات الوحدة؛ سجّل الوقت والقراءات.'), 10, L('Physical check first — 40% of “failures” are unplugged or tripped breakers.', 'الفحص الميداني أولًا — 40% من “الأعطال” مقابس مفصولة أو قواطع منفصلة.')),
          O(L('Lower the setpoint to +2 °C to compensate.', 'خفّض الضبط إلى +2 °م للتعويض.'), 0, L('Never change a setpoint without the line’s written instruction — you take liability for the cargo.', 'لا تغيّر الضبط أبدًا دون تعليمات مكتوبة من الخط — ستتحمّل مسؤولية البضاعة.')),
          O(L('Wait for the 06:00 round.', 'انتظر جولة 06:00.'), 0, L('Vaccines may be lost in 4 hours.', 'قد تتلف اللقاحات خلال 4 ساعات.')),
        ] },
      { t: L('Technician: compressor fault, unit cannot hold temperature. What next?', 'الفنّي: عطل في الضاغط، الوحدة لا تحافظ على الحرارة. ماذا بعد؟'),
        opts: [
          O(L('Notify the line’s reefer desk now (temperature log, photos), propose options: repair on site / transfer cargo to a PTI-ed reefer under surveyor / hold from loading.', 'أبلغ مكتب مبرّدات الخط الآن (سجلّ الحرارة، صور)، واقترح الخيارات: الإصلاح بالموقع / نقل البضاعة إلى مبرّدة مفحوصة بحضور مُعاين / حجزها من التحميل.'), 10, L('The line owns the cargo decision; you give facts and options fast.', 'الخط يملك قرار البضاعة؛ أنت تقدّم الحقائق والخيارات بسرعة.')),
          O(L('Load it anyway; the ship will fix it.', 'حمّلها على أي حال؛ السفينة ستصلحها.'), 0, L('Loading a known-failed pharma reefer is negligent.', 'تحميل مبرّدة أدوية معروف عطلها إهمال.')),
          O(L('Open the doors to check the cargo.', 'افتح الأبواب لتفحص البضاعة.'), 0, L('Breaks the seal and the cold chain; only with customs/surveyor/line approval.', 'يكسر الختم وسلسلة التبريد؛ فقط بموافقة الجمارك/المُعاين/الخط.')),
        ] },
      { t: L('The line asks for a cargo transfer at 03:30. What do you organise?', 'يطلب الخط نقل البضاعة الساعة 03:30. ماذا تنظّم؟'),
        opts: [
          O(L('Empty reefer with valid PTI pre-cooled, surveyor + customs officer present (seal break), new seal recorded, update TOS/load list with new box number, inform planner.', 'مبرّدة فارغة بفحص PTI صالح ومبرّدة مسبقًا، حضور المُعاين وموظّف الجمارك (كسر الختم)، تسجيل الختم الجديد، تحديث TOS/قائمة التحميل برقم الحاوية الجديد، إبلاغ المخطّط.'), 10, L('Complete chain: equipment, witnesses, documents, systems, planning.', 'سلسلة كاملة: المعدّات، الشهود، المستندات، الأنظمة، التخطيط.')),
          O(L('Any empty reefer from the depot.', 'أي مبرّدة فارغة من المستودع.'), 5, L('Needs a PTI and pre-cooling first; and you forgot customs, surveyor and the load list update.', 'تحتاج PTI وتبريدًا مسبقًا أولًا؛ ونسيت الجمارك والمُعاين وتحديث قائمة التحميل.')),
        ] },
    ],
    debrief: L('Reefer alarms: verify physically, never touch the setpoint, inform the line with data, and execute any transfer with witnesses and system updates.', 'إنذارات المبرّدات: تحقّق ميدانيًا، لا تلمس الضبط أبدًا، أبلغ الخط بالبيانات، ونفّذ أي نقل بحضور شهود وتحديث للأنظمة.'),
  });

  add({
    id: 'dg-leak', lvl: 3, icon: '☣', title: L('Leaking DG tank in the yard', 'تسرّب صهريج خطر في الساحة'),
    role: L('Duty manager', 'المدير المناوب'),
    brief: L('An RTG driver reports liquid dripping from tank container TCLU 300441 2 in block D. Placards: class 8, UN 1830 (sulphuric acid). Wind from the west at 15 kn. 6 workers in the block; a gate lane is 80 m to the east.',
      'سائق RTG يبلّغ عن سائل يقطر من الحاوية الصهريجية TCLU 300441 2 في الكتلة D. الملصقات: الفئة 8، UN 1830 (حمض الكبريتيك). الرياح غربية 15 عقدة. 6 عمّال في الكتلة؛ ومسار بوابة على بعد 80 م شرقًا.'),
    stages: [
      { t: L('Your first orders (first 2 minutes)?', 'أوامرك الأولى (أول دقيقتين)؟'),
        opts: [
          O(L('Stop all work in block D, evacuate people upwind (to the west), close the east gate lane, set a cordon.', 'أوقف كل العمل في الكتلة D، أخلِ الناس بعكس الريح (نحو الغرب)، أغلق مسار البوابة الشرقي، أقم طوقًا.'), 10, L('Wind from the west blows vapours east — evacuate west (upwind) and protect the gate lane downwind.', 'الرياح من الغرب تحمل الأبخرة شرقًا — أخلِ نحو الغرب (عكس الريح) واحمِ مسار البوابة باتجاه الريح.')),
          O(L('Ask the RTG to move the tank to the quay.', 'اطلب من RTG نقل الصهريج للرصيف.'), 0, L('Moving a leaking tank spreads the spill and exposes the operator.', 'نقل صهريج يسرّب ينشر التسرّب ويعرّض المشغّل للخطر.')),
          O(L('Send workers to wash it with water.', 'أرسل العمّال لغسله بالماء.'), 0, L('Water on concentrated sulphuric acid can react violently. Only trained responders.', 'الماء على حمض الكبريتيك المركّز قد يتفاعل بعنف. فقط مستجيبون مدرّبون.')),
        ] },
      { t: L('Who do you call, in which order?', 'بمن تتّصل وبأي ترتيب؟'),
        opts: [
          O(L('Port fire/emergency services & HSE → Port Authority/Harbour Master → shipping line/shipper for SDS & emergency contact → environment authority if drains affected.', 'إطفاء/طوارئ الميناء والسلامة ← سلطة الميناء/قبطان الميناء ← الخط/الشاحن لصحيفة بيانات السلامة ورقم الطوارئ ← سلطة البيئة إن تأثّرت المصارف.'), 10, L('Responders first, authority second, information sources third.', 'المستجيبون أولًا، السلطة ثانيًا، مصادر المعلومات ثالثًا.')),
          O(L('The shipping line first to ask who pays.', 'الخط أولًا لتسأل من يدفع.'), 0, L('Cost questions come after people are safe.', 'أسئلة التكلفة تأتي بعد سلامة الناس.')),
        ] },
      { t: L('The leak is contained after 3 hours. What must happen next?', 'تمّ احتواء التسرّب بعد 3 ساعات. ماذا يجب أن يحدث بعد ذلك؟'),
        opts: [
          O(L('Incident report, root cause investigation (valve? damage at discharge?), check DG segregation of neighbours, medical check of exposed people, waste disposal by licensed contractor, claim file with evidence.', 'تقرير الحادث، تحقيق السبب الجذري (صمام؟ ضرر عند التفريغ؟)، فحص فصل الحاويات الخطرة المجاورة، فحص طبي للمعرّضين، التخلّص من النفايات عبر متعهّد مرخّص، ملف مطالبة مع الأدلة.'), 10, L('Close the loop: people, environment, learning, liability.', 'أغلق الحلقة: الناس، البيئة، التعلّم، المسؤولية.')),
          O(L('Resume work and forget it.', 'استأنف العمل وانسَ الأمر.'), 0, L('Unreported incidents repeat.', 'الحوادث غير المُبلّغ عنها تتكرّر.')),
        ] },
    ],
    debrief: L('DG response: stop, evacuate upwind, isolate, identify UN number, call responders, let only trained people act, then investigate and report.', 'الاستجابة للخطرة: أوقف، أخلِ بعكس الريح، اعزل، حدّد رقم UN، استدعِ المستجيبين، دع المدرّبين فقط يتصرّفون، ثم حقّق وأبلغ.'),
  });

  add({
    id: 'yard-congestion', lvl: 3, icon: '🧱', title: L('Yard at 91%', 'الساحة عند 91%'),
    role: L('Yard planning manager', 'مدير تخطيط الساحة'),
    brief: L('Import block B is at 91% utilisation; import dwell rose from 6 to 11 days after a new customs inspection rule. Rehandles up 40%, truck turnaround 75 min, two mainliners will discharge 2,600 imports in the next 72 h.',
      'كتلة الاستيراد B عند 91% استخدام؛ وارتفع بقاء الاستيراد من 6 إلى 11 يومًا بعد قاعدة معاينة جمركية جديدة. إعادة المناولة ارتفعت 40%، وزمن دوران الشاحنة 75 دقيقة، وسفينتان رئيسيتان ستفرّغان 2,600 حاوية استيراد خلال 72 ساعة.'),
    stages: [
      { t: L('What is the root problem?', 'ما المشكلة الجذرية؟'),
        opts: [
          O(L('Dwell time — inventory = flow × dwell. Inflow is normal, dwell nearly doubled.', 'مدة البقاء — المخزون = التدفّق × مدة البقاء. التدفّق طبيعي والبقاء تضاعف تقريبًا.'), 10, L('Little’s law shows the lever: reduce dwell.', 'قانون ليتل يُظهر الأداة: قلّل مدة البقاء.')),
          O(L('Not enough RTGs.', 'عدد رافعات RTG غير كافٍ.'), 5, L('RTGs suffer from the symptoms (rehandles), not the cause.', 'رافعات RTG تعاني من الأعراض (إعادة المناولة) لا السبب.')),
          O(L('Truckers are slow.', 'الناقلون بطيئون.'), 0, L('Truck time is long because of rehandles in an overfull yard.', 'وقت الشاحنات طويل بسبب إعادة المناولة في ساحة ممتلئة.')),
        ] },
      { t: L('Which short-term package (next 72 h) do you propose?', 'أي حزمة قصيرة الأمد (72 ساعة القادمة) تقترح؟'),
        opts: [
          O(L('(1) Move empties and long-stay boxes off-dock to the depot, (2) daily meeting with customs to add inspection slots, (3) extend gate hours/night appointments, (4) temporary overflow area with lower stacks for the mainliners.', '(1) نقل الفارغ والحاويات طويلة البقاء خارج المحطة للمستودع، (2) اجتماع يومي مع الجمارك لزيادة مواعيد المعاينة، (3) تمديد ساعات البوابة/مواعيد ليلية، (4) منطقة فائض مؤقتة برصّات أقل للسفينتين الرئيسيتين.'), 10, L('Attacks both inventory and dwell, and protects vessel productivity.', 'يعالج المخزون ومدة البقاء معًا ويحمي إنتاجية السفن.')),
          O(L('Stack 6 high everywhere.', 'الرصّ 6 طبقات في كل مكان.'), 0, L('More rehandles, safety risk, RTG limits — worse.', 'إعادة مناولة أكثر، خطر على السلامة، حدود RTG — أسوأ.')),
          O(L('Ask lines to delay vessels.', 'اطلب من الخطوط تأخير السفن.'), 5, L('A last resort; it damages the port’s reputation.', 'ملاذ أخير؛ يضرّ بسمعة الميناء.')),
        ] },
      { t: L('Medium term (next month)?', 'على المدى المتوسط (الشهر القادم)؟'),
        opts: [
          O(L('Propose a progressive storage tariff after free days, data-based talks with customs on the new rule (dwell impact), and an overstayer auction/abandoned cargo procedure.', 'اقترح تعرفة تخزين تصاعدية بعد الأيام المجانية، ومحادثات مبنية على البيانات مع الجمارك حول القاعدة الجديدة (أثرها على البقاء)، وإجراء مزاد/بضائع متروكة للحاويات المتأخّرة.'), 10, L('Policy and partnership, backed by numbers.', 'سياسة وشراكة مدعومة بالأرقام.')),
          O(L('Buy 6 new RTGs.', 'اشترِ 6 رافعات RTG جديدة.'), 0, L('Capital spending does not fix a dwell problem.', 'الإنفاق الرأسمالي لا يحلّ مشكلة مدة البقاء.')),
        ] },
    ],
    debrief: L('Yard congestion is almost always a dwell-time problem. Free space quickly (off-dock), work with customs, and use tariffs to change behaviour.', 'ازدحام الساحة دائمًا تقريبًا مشكلة مدة بقاء. حرّر المساحة بسرعة (خارج المحطة)، اعمل مع الجمارك، واستخدم التعرفات لتغيير السلوك.'),
  });

  add({
    id: 'overstow', lvl: 2, icon: '🔀', title: L('The overstowed box', 'الحاوية المحجوبة'),
    role: L('Vessel planner', 'مخطّط السفن'),
    brief: L('LFS CEDAR rotation: CBCT → Limassol → Mersin. During discharge in CBCT you find in bay 14 hold: a CBCT import 20′ is under 3 Mersin boxes (wrongly stowed at the previous port). Crane is waiting.',
      'ترتيب LFS CEDAR: CBCT ← ليماسول ← مرسين. أثناء التفريغ في CBCT تجد في عنبر الخليج 14: حاوية استيراد 20′ لـ CBCT تحت 3 حاويات لمرسين (رُصّت خطأً في الميناء السابق). الرافعة تنتظر.'),
    stages: [
      { t: L('What do you do?', 'ماذا تفعل؟'),
        opts: [
          O(L('Restow: discharge the 3 Mersin boxes to the quay (or shift on board if slots are free), take the CBCT box, reload the Mersin boxes. Record as restows caused by previous port.', 'إعادة رصّ: فرّغ حاويات مرسين الثلاث للرصيف (أو انقلها على السفينة إن توفّرت خانات)، خذ حاوية CBCT، وأعد تحميل حاويات مرسين. سجّلها كإعادة رصّ بسبب الميناء السابق.'), 10, L('Correct, with proper attribution so the line is billed and the root cause is visible.', 'صحيح، مع نسبة صحيحة ليُفوتر الخط وليظهر السبب الجذري.')),
          O(L('Leave the import box on board, it will come back later.', 'اترك حاوية الاستيراد على السفينة، ستعود لاحقًا.'), 0, L('Over-carried cargo costs weeks and money — only with the line’s explicit decision.', 'البضاعة المحمولة زيادةً تكلّف أسابيع ومالًا — فقط بقرار صريح من الخط.')),
        ] },
      { t: L('Before acting, whose approval do you need?', 'قبل التنفيذ، موافقة من تحتاج؟'),
        opts: [
          O(L('The vessel (chief officer) and the line’s planner — they approve restows/shifting and the new slots.', 'السفينة (الضابط الأول) ومخطّط الخط — يوافقون على إعادة الرصّ/النقل والخانات الجديدة.'), 10, L('Stability and the next port plan depend on it.', 'الاتزان وخطة الميناء التالي تعتمد على ذلك.')),
          O(L('Nobody, just do it.', 'لا أحد، نفّذ فقط.'), 0, L('Unapproved changes break the BAPLIE and stability.', 'التغييرات غير الموافق عليها تفسد BAPLIE والاتزان.')),
        ] },
      { t: L('After the call, how do you prevent recurrence?', 'بعد الزيارة، كيف تمنع التكرار؟'),
        opts: [
          O(L('Send an exception report (with BAPLIE extract and photos) to the line’s central planning and the previous port.', 'أرسل تقرير استثناء (مع مقتطف BAPLIE وصور) إلى التخطيط المركزي للخط والميناء السابق.'), 10, L('Feedback loop closes the root cause.', 'حلقة التغذية الراجعة تعالج السبب الجذري.')),
          O(L('Complain to the crane driver.', 'اشتكِ لسائق الرافعة.'), 0, L('Not his fault.', 'ليس خطأه.')),
        ] },
    ],
    debrief: L('Overstows: resolve with approved restows, attribute and bill correctly, and feed the error back to the source.', 'الحجب: يُحلّ بإعادة رصّ موافق عليها، ونسبة وفوترة صحيحة، وإبلاغ المصدر بالخطأ.'),
  });

  add({
    id: 'vgm-cutoff', lvl: 3, icon: '⚖', title: L('No VGM at cut-off', 'لا VGM عند الموعد النهائي'),
    role: L('Export/gate coordinator', 'منسّق التصدير/البوابة'),
    brief: L('Cut-off for BMS ADRIATIC was 12:00. It is 12:40. 14 boxes are in the yard without VGM; 3 trucks are queuing with late export boxes; one box on the load list has a customs hold.',
      'الموعد النهائي لـ BMS ADRIATIC كان 12:00. الساعة الآن 12:40. 14 حاوية في الساحة بدون VGM؛ 3 شاحنات في الطابور بحاويات تصدير متأخّرة؛ وحاوية في قائمة التحميل عليها حجز جمركي.'),
    stages: [
      { t: L('The 14 boxes without VGM?', 'الحاويات الـ 14 بدون VGM؟'),
        opts: [
          O(L('Send the list to the line now; they chase shippers; any box still without VGM at the line’s final deadline is excluded from the load list (short-shipped).', 'أرسل القائمة للخط الآن؛ هو يلاحق الشاحنين؛ أي حاوية تبقى بدون VGM عند المهلة النهائية للخط تُستبعد من قائمة التحميل (غير مشحونة).'), 10, L('SOLAS: no VGM no load; the line manages its customers.', 'SOLAS: لا VGM لا تحميل؛ والخط يدير عملاءه.')),
          O(L('Load them with the declared booking weight.', 'حمّلها بالوزن المصرّح في الحجز.'), 0, L('Illegal under SOLAS and dangerous for stability.', 'غير قانوني بموجب SOLAS وخطير على الاتزان.')),
          O(L('Weigh them with the RTG load cell and issue VGM yourself.', 'زِنها بخلية وزن RTG وأصدر VGM بنفسك.'), 5, L('Only if your terminal is an approved weighing method under local rules and the shipper/line authorises it (often billable).', 'فقط إن كانت محطتك طريقة وزن معتمدة وفق القواعد المحلية وفوّضك الشاحن/الخط (غالبًا مقابل رسوم).')),
        ] },
      { t: L('The 3 late trucks?', 'الشاحنات الثلاث المتأخّرة؟'),
        opts: [
          O(L('Accept only with the line’s written late-gate approval and VGM, and only if the planner confirms they can still be planned.', 'اقبل فقط مع موافقة الخط المكتوبة على الدخول المتأخّر ووجود VGM، وفقط إن أكّد المخطّط إمكانية إدراجها.'), 10, L('Commercial approval + operational feasibility.', 'موافقة تجارية + جدوى تشغيلية.')),
          O(L('Reject all — rules are rules.', 'ارفضها كلها — القواعد قواعد.'), 5, L('Defensible, but seniors look for the line’s decision — the line may have priority cargo.', 'يمكن الدفاع عنه، لكن المحترف يطلب قرار الخط — قد يكون لدى الخط بضائع ذات أولوية.')),
        ] },
      { t: L('The box with the customs hold?', 'الحاوية التي عليها حجز جمركي؟'),
        opts: [
          O(L('Keep it on the list as “not to load unless released”, tell the line and the planner; check again 1 h before the last loading bay.', 'أبقِها في القائمة كـ “لا تُحمّل إلا بعد الإفراج”، أبلغ الخط والمخطّط؛ وتحقّق مجددًا قبل ساعة من آخر خليج تحميل.'), 10, L('Gives the customer a last chance without risk.', 'يعطي الزبون فرصة أخيرة دون مخاطرة.')),
          O(L('Load it; customs will release later.', 'حمّلها؛ ستفرج الجمارك لاحقًا.'), 0, L('Loading a held box is a legal violation.', 'تحميل حاوية محجوزة مخالفة قانونية.')),
        ] },
    ],
    debrief: L('Cut-off management: transparent lists to the line, SOLAS compliance, line decisions for late gate-ins, and zero tolerance for loading held boxes.', 'إدارة الموعد النهائي: قوائم شفّافة للخط، الامتثال لـ SOLAS، قرارات الخط للدخول المتأخّر، وعدم التسامح إطلاقًا مع تحميل الحاويات المحجوزة.'),
  });

  add({
    id: 'empty-shortage', lvl: 4, icon: '📦', title: L('Empty 40′ HC shortage', 'عجز في 40′ عالية الفارغة'),
    role: L('Depot & equipment controller', 'مسؤول المستودع والتحكّم بالمعدّات'),
    brief: L('Atlas Ocean Line’s exporters need 110 × 40′ HC this week (furniture, food). Depot stock: 38 sound HC (12 food grade), 46 damaged HC awaiting EOR approval, 30 sound 40′ DV, returns expected 8/day.',
      'مصدّرو Atlas Ocean Line يحتاجون 110 × 40′ عالية هذا الأسبوع (أثاث، أغذية). مخزون المستودع: 38 عالية سليمة (12 صالحة للغذاء)، 46 عالية متضرّرة بانتظار اعتماد EOR، 30 × 40′ عادية سليمة، والإرجاع المتوقّع 8 يوميًا.'),
    stages: [
      { t: L('Fastest supply source?', 'أسرع مصدر للإمداد؟'),
        opts: [
          O(L('Push the 46 damaged HC: get EOR approvals today, prioritise minor repairs (2–3 days).', 'ادفع الـ 46 عالية المتضرّرة: احصل على اعتماد EOR اليوم، وأعطِ الأولوية للإصلاحات البسيطة (2–3 أيام).'), 10, L('Repairs turn existing stock into available stock fastest.', 'الإصلاحات تحوّل المخزون الموجود إلى متاح بأسرع وقت.')),
          O(L('Order repositioning from another country.', 'اطلب إعادة تموضع من بلد آخر.'), 5, L('Useful but takes 1–3 weeks. Do it in parallel if the gap persists.', 'مفيد لكن يستغرق 1–3 أسابيع. افعله بالتوازي إن استمرّ العجز.')),
          O(L('Tell sales to cancel bookings.', 'اطلب من المبيعات إلغاء الحجوزات.'), 0, L('Last resort after all levers.', 'ملاذ أخير بعد استنفاد كل الأدوات.')),
        ] },
      { t: L('How do you allocate the 12 food-grade HC?', 'كيف توزّع الـ 12 عالية الصالحة للغذاء؟'),
        opts: [
          O(L('Only to food bookings; furniture gets general-grade HC or 40′ DV substitution where cargo fits.', 'فقط لحجوزات الأغذية؛ والأثاث يأخذ عالية عامة أو بديل 40′ عادية حيث تتّسع البضاعة.'), 10, L('Protect scarce grades for cargo that needs them; substitute for others.', 'احمِ الدرجات النادرة للبضائع التي تحتاجها؛ واستبدل للبقية.')),
          O(L('First come, first served.', 'الأسبقية للأول.'), 0, L('A food shipper could end up without a usable box.', 'قد ينتهي مصدّر أغذية دون حاوية صالحة.')),
        ] },
      { t: L('An importer near an exporter’s factory is returning 6 HC tomorrow. Idea?', 'مستورد قرب مصنع مصدّر سيُرجع 6 عالية غدًا. فكرة؟'),
        opts: [
          O(L('Street turn: approve direct re-use (after survey photos and line approval) — saves two truck trips and depot handling.', 'استخدام مباشر: وافق على إعادة الاستخدام المباشر (بعد صور الفحص وموافقة الخط) — يوفّر رحلتي شاحنة ومناولة المستودع.'), 10, L('Triangulation is the cheapest equipment supply.', 'التثليث أرخص مصدر للمعدّات.')),
          O(L('No, all boxes must return to the depot.', 'لا، كل الحاويات يجب أن تعود للمستودع.'), 5, L('Safe but wasteful; many lines allow controlled street turns.', 'آمن لكنه هدر؛ كثير من الخطوط تسمح بالاستخدام المباشر المنضبط.')),
        ] },
    ],
    debrief: L('Equipment shortage: repair first, substitute smartly, protect special grades, street-turn, then reposition.', 'عجز المعدّات: الإصلاح أولًا، الاستبدال بذكاء، حماية الدرجات الخاصة، الاستخدام المباشر، ثم إعادة التموضع.'),
  });

  add({
    id: 'damage-dispute', lvl: 4, icon: '📸', title: L('Who damaged the container?', 'من أتلف الحاوية؟'),
    role: L('Depot manager', 'مدير المستودع'),
    brief: L('Importer’s trucker returns 40′ AOLU 551208 4 with a 30 cm hole in the left side panel and a cut floor. The trucker says: “It was already like that.” Gate-out EIR (5 days ago) shows: “minor dents door, no holes”, with photos.',
      'ناقل المستورد يُرجع 40′ AOLU 551208 4 مع ثقب 30 سم في اللوح الجانبي الأيسر وأرضية مقطوعة. يقول الناقل: “كانت هكذا من قبل.” إيصال EIR الخروج (قبل 5 أيام) يُظهر: “انبعاجات بسيطة في الباب، لا ثقوب”، مع صور.'),
    stages: [
      { t: L('At gate-in, what do you do?', 'عند الدخول، ماذا تفعل؟'),
        opts: [
          O(L('Record the damage on the gate-in EIR with photos, ask the driver to sign (or note refusal), keep the gate-out EIR photos as comparison.', 'سجّل الضرر على EIR الدخول مع الصور، اطلب من السائق التوقيع (أو سجّل رفضه)، واحتفظ بصور EIR الخروج للمقارنة.'), 10, L('Evidence at the moment of hand-over is everything.', 'الدليل لحظة التسليم هو كل شيء.')),
          O(L('Refuse the box at the gate.', 'ارفض الحاوية على البوابة.'), 0, L('The box must be returned; refusing creates more detention and conflict.', 'يجب إرجاع الحاوية؛ رفضها يزيد الاحتجاز والنزاع.')),
        ] },
      { t: L('Liability?', 'المسؤولية؟'),
        opts: [
          O(L('User damage → raise EOR (hole + floor) and send to the line to recover from the consignee, attaching both EIRs.', 'ضرر مستخدم ← أصدر تقدير إصلاح (الثقب + الأرضية) وأرسله للخط لاسترداده من المستورد، مع إرفاق إيصالَي EIR.'), 10, L('Gate-out EIR proves the damage happened during the user’s custody.', 'إيصال الخروج يثبت أن الضرر حدث أثناء عهدة المستخدم.')),
          O(L('Wear & tear → owner pays.', 'استهلاك ← المالك يدفع.'), 0, L('Holes and cut floors are typical handling damage, not age.', 'الثقوب والأرضيات المقطوعة ضرر مناولة نموذجي لا عمر.')),
        ] },
      { t: L('EOR: side panel insert 2.5 h, floor section 4 h, labour USD 22/h, materials USD 140. Total?', 'التقدير: رقعة لوح جانبي 2.5 ساعة، قسم أرضية 4 ساعات، العمالة 22 دولارًا/ساعة، المواد 140 دولارًا. المجموع؟'),
        opts: [
          O(L('USD 283', '283 دولارًا'), 10, L('6.5 h × 22 = 143 + 140 = USD 283.', '6.5 ساعة × 22 = 143 + 140 = 283 دولارًا.')),
          O(L('USD 162', '162 دولارًا'), 0, L('You forgot the floor labour.', 'نسيت عمالة الأرضية.')),
          O(L('USD 143', '143 دولارًا'), 0, L('Materials missing.', 'المواد ناقصة.')),
        ] },
    ],
    debrief: L('Damage disputes are won with EIRs and photos at both hand-overs, correct liability classification and a transparent EOR.', 'نزاعات الأضرار تُربح بإيصالات EIR والصور عند التسليمين، والتصنيف الصحيح للمسؤولية، وتقدير إصلاح شفّاف.'),
  });

  add({
    id: 'storm', lvl: 5, icon: '🌪', title: L('Storm warning', 'تحذير من عاصفة'),
    role: L('Terminal duty manager', 'المدير المناوب للمحطة'),
    brief: L('Met office: gale from 18:00, gusts 45 kn until 06:00. Now 13:00. On berth: AOL MARSEILLE (62% done), LFS CEDAR (35%). Crane wind limit: operations stop at 20 m/s (~39 kn), storm pins above. Port Authority may close the port to movements at 35 kn.',
      'الأرصاد: عاصفة من 18:00 بهبّات 45 عقدة حتى 06:00. الآن 13:00. على الرصيف: AOL MARSEILLE (62% منجز) وLFS CEDAR (35%). حدّ الرياح للرافعات: يتوقّف العمل عند 20 م/ث (~39 عقدة)، وأوتاد العاصفة فوق ذلك. قد تغلق سلطة الميناء الحركة عند 35 عقدة.'),
    stages: [
      { t: L('Your plan for the next 5 hours?', 'خطّتك للساعات الخمس القادمة؟'),
        opts: [
          O(L('Inform both lines now; maximise cranes on the ship that can finish before 18:00 or must sail before closure; prepare yard (lower empty stacks, lash, secure loose items); plan crane parking & storm pins by 17:30.', 'أبلغ الخطّين الآن؛ ضع أكبر عدد من الرافعات على السفينة التي يمكن أن تنهي قبل 18:00 أو يجب أن تبحر قبل الإغلاق؛ جهّز الساحة (خفّض رصّات الفارغ، ثبّت، أمّن الأشياء السائبة)؛ خطّط لركن الرافعات وأوتاد العاصفة بحلول 17:30.'), 10, L('Anticipate: decide early which ship can leave, protect assets in time.', 'الاستباق: قرّر مبكرًا أي سفينة يمكنها المغادرة، واحمِ الأصول في الوقت المناسب.')),
          O(L('Work normally until wind reaches the limit.', 'اعمل بشكل طبيعي حتى تبلغ الرياح الحدّ.'), 0, L('Securing cranes takes time — you’ll be doing it in dangerous gusts.', 'تأمين الرافعات يستغرق وقتًا — ستفعله في هبّات خطيرة.')),
        ] },
      { t: L('Empty stacks 6 high in block E. Risk?', 'رصّات فارغ بارتفاع 6 في الكتلة E. الخطر؟'),
        opts: [
          O(L('Empties can be blown over: reduce to 3–4 high on exposed rows or block-stack them, keep people away.', 'الفارغ قد تقلبه الرياح: خفّضها إلى 3–4 طبقات في الصفوف المكشوفة أو رصّها ككتلة، وأبعد الناس.'), 10, L('Empty boxes are light and act like sails.', 'الحاويات الفارغة خفيفة وتعمل كالأشرعة.')),
          O(L('No risk, containers are heavy.', 'لا خطر، الحاويات ثقيلة.'), 0, L('An empty 40′ weighs ~3.8 t and has a huge side area.', 'وزن 40′ فارغة ~3.8 طن ولها مساحة جانبية ضخمة.')),
        ] },
      { t: L('After the storm (06:00) what is your recovery priority?', 'بعد العاصفة (06:00) ما أولوية التعافي؟'),
        opts: [
          O(L('Safety inspection of cranes/yard first, then window vessels and the ships at berth, then extra shifts/gate hours to clear backlog; one message to all lines with new plan.', 'فحص سلامة الرافعات/الساحة أولًا، ثم سفن النوافذ والسفن على الرصيف، ثم ورديات/ساعات بوابة إضافية لتصفية التراكم؛ رسالة واحدة لكل الخطوط بالخطة الجديدة.'), 10, L('Inspect before restarting; fair and transparent recovery.', 'افحص قبل الاستئناف؛ تعافٍ عادل وشفّاف.')),
          O(L('Restart all cranes immediately.', 'أعِد تشغيل كل الرافعات فورًا.'), 0, L('Storm damage must be checked first.', 'يجب فحص أضرار العاصفة أولًا.')),
        ] },
    ],
    debrief: L('Weather: act on the forecast, not on the wind meter. Secure early, communicate early, inspect before restarting.', 'الطقس: تصرّف بناءً على التوقّعات لا على مقياس الرياح. أمّن مبكرًا، تواصل مبكرًا، افحص قبل الاستئناف.'),
  });

  add({
    id: 'tos-down', lvl: 5, icon: '🖥', title: L('TOS down — ransomware', 'تعطّل النظام — برنامج فدية'),
    role: L('Operations manager', 'مدير العمليات'),
    brief: L('07:20 — IT reports ransomware: TOS, gate OCR and email are down; ETA for recovery unknown (24–72 h). Two vessels working, gate queue building, 300 reefers in yard.',
      '07:20 — تقنية المعلومات تبلّغ عن برنامج فدية: TOS وOCR البوابة والبريد معطّلة؛ موعد التعافي غير معروف (24–72 ساعة). سفينتان تعملان، طابور البوابة يتزايد، 300 مبرّدة في الساحة.'),
    stages: [
      { t: L('First 30 minutes?', 'أول 30 دقيقة؟'),
        opts: [
          O(L('Activate the IT-outage plan: switch to the “TOS down kit” (last yard inventory, load lists, bay plans), radio dispatch, stop gate transactions except reefers/DG urgent, start a manual log, notify lines/authority/customs.', 'فعّل خطة تعطّل النظام: انتقل إلى “حقيبة تعطّل TOS” (آخر مخزون للساحة، قوائم التحميل، خطط الخلجان)، توجيه لاسلكي، أوقف معاملات البوابة باستثناء المبرّدات/الخطرة العاجلة، ابدأ سجلًّا يدويًا، أبلغ الخطوط/السلطة/الجمارك.'), 10, L('Prepared fallback keeps ships working safely.', 'البديل المجهّز يبقي السفن تعمل بأمان.')),
          O(L('Stop everything until IT fixes it.', 'أوقف كل شيء حتى تصلحه تقنية المعلومات.'), 5, L('Safe but may cost days; partial manual operations are usually possible.', 'آمن لكنه قد يكلّف أيامًا؛ العمليات اليدوية الجزئية ممكنة عادةً.')),
          O(L('Pay the ransom to restart quickly.', 'ادفع الفدية لإعادة التشغيل بسرعة.'), 0, L('Not an operations decision — and often not legal or effective. Escalate to management/IT security.', 'ليس قرارًا تشغيليًا — وغالبًا غير قانوني أو فعّال. صعّد للإدارة/أمن المعلومات.')),
        ] },
      { t: L('Reefers with no remote monitoring?', 'المبرّدات بلا مراقبة عن بُعد؟'),
        opts: [
          O(L('Manual temperature rounds every 2 h with paper logs, prioritise pharma/frozen.', 'جولات حرارة يدوية كل ساعتين مع سجلّات ورقية، أولوية للأدوية/المجمّدة.'), 10, L('Cargo safety while systems are down.', 'سلامة البضاعة أثناء تعطّل الأنظمة.')),
          O(L('Check them when TOS returns.', 'افحصها عند عودة النظام.'), 0, L('Could be 72 h — cargo loss.', 'قد يستغرق 72 ساعة — خسارة البضاعة.')),
        ] },
      { t: L('When TOS is restored, before full restart?', 'عند عودة النظام، قبل التشغيل الكامل؟'),
        opts: [
          O(L('Reconcile: enter all manual moves, physical yard check of blocks worked manually, verify load lists vs vessel, then restart gate gradually.', 'المطابقة: أدخل كل الحركات اليدوية، افحص ميدانيًا الكتل التي عُمل بها يدويًا، تحقّق من قوائم التحميل مقابل السفينة، ثم أعد تشغيل البوابة تدريجيًا.'), 10, L('Data integrity first, otherwise you will lose boxes in the system.', 'سلامة البيانات أولًا، وإلا ستضيع حاويات في النظام.')),
          O(L('Open the gate at full capacity immediately.', 'افتح البوابة بكامل طاقتها فورًا.'), 0, L('Wrong inventory → wrong deliveries.', 'مخزون خاطئ ← تسليمات خاطئة.')),
        ] },
    ],
    debrief: L('Cyber resilience is an operations skill: an updated fallback kit, manual procedures practised, cargo safety first, and careful reconciliation before restart.', 'المرونة السيبرانية مهارة تشغيلية: حقيبة بديلة محدّثة، إجراءات يدوية مُتدرَّب عليها، سلامة البضاعة أولًا، ومطابقة دقيقة قبل الاستئناف.'),
  });

  add({
    id: 'labour', lvl: 5, icon: '👷', title: L('Half the crane drivers absent', 'نصف سائقي الرافعات غائبون'),
    role: L('Shift manager', 'مدير الوردية'),
    brief: L('Night shift: only 6 of 12 STS drivers reported (local protest blocks a road). Planned: MARSEILLE 4 cranes (window, 1,100 moves left, ETD 06:00), CEDAR 2 cranes (feeder, 400 left, ETD 08:00), NRR VIKING ro-ro (no STS needed).',
      'وردية الليل: حضر 6 فقط من 12 سائق رافعة (احتجاج محلي يغلق طريقًا). المخطّط: MARSEILLE بـ 4 رافعات (نافذة، 1,100 حركة متبقية، المغادرة 06:00)، CEDAR بـ 2 رافعة (فيدر، 400 متبقية، المغادرة 08:00)، NRR VIKING رورو (لا تحتاج STS).'),
    stages: [
      { t: L('6 drivers ≈ 4 cranes with breaks (1.5 drivers/crane). Allocation?', '6 سائقين ≈ 4 رافعات مع الاستراحات (1.5 سائق/رافعة). التوزيع؟'),
        opts: [
          O(L('All 4 on MARSEILLE (window, biggest risk); CEDAR starts when drivers arrive or after MARSEILLE; inform CEDAR’s line now.', 'الأربع كلها على MARSEILLE (نافذة، أكبر خطر)؛ CEDAR تبدأ عند وصول السائقين أو بعد MARSEILLE؛ أبلغ خط CEDAR الآن.'), 10, L('1,100 / (4 × 28) ≈ 9.8 h — still tight; protect the window ship and tell the other line early.', '1,100 / (4 × 28) ≈ 9.8 ساعة — ما زال ضيّقًا؛ احمِ سفينة النافذة وأبلغ الخط الآخر مبكرًا.')),
          O(L('3 + 1 split.', 'توزيع 3 + 1.'), 5, L('MARSEILLE would take ~13 h — window missed.', 'ستستغرق MARSEILLE ~13 ساعة — تفويت النافذة.')),
          O(L('Run 6 cranes with no breaks.', 'شغّل 6 رافعات دون استراحات.'), 0, L('Fatigue is a major safety risk — never.', 'الإرهاق خطر سلامة كبير — أبدًا.')),
        ] },
      { t: L('How do you get more drivers?', 'كيف تحصل على سائقين إضافيين؟'),
        opts: [
          O(L('Call off-duty certified drivers (overtime, respecting rest-hour rules), arrange transport via an alternative route, check if day-shift supervisors are certified.', 'اتّصل بالسائقين المعتمدين خارج الدوام (عمل إضافي مع احترام قواعد ساعات الراحة)، رتّب نقلًا عبر طريق بديل، تحقّق إن كان مشرفو النهار معتمدين.'), 10, L('Practical, legal and safe.', 'عملي وقانوني وآمن.')),
          O(L('Let a lashing worker drive a crane.', 'دع عامل تثبيت يقود رافعة.'), 0, L('Uncertified operators — unacceptable.', 'مشغّلون غير معتمدين — غير مقبول.')),
        ] },
    ],
    debrief: L('Scarce resources go to the highest commitment (window ships) — safely and legally — with early, honest communication to the others.', 'الموارد الشحيحة تذهب لأعلى التزام (سفن النوافذ) — بأمان وقانونية — مع تواصل مبكر وصادق مع الآخرين.'),
  });

  add({
    id: 'security', lvl: 5, icon: '🔒', title: L('Seal tampering & suspected smuggling', 'عبث بالختم واشتباه تهريب'),
    role: L('Duty manager (with PFSO)', 'المدير المناوب (مع ضابط الأمن)'),
    brief: L('At 03:10 CCTV shows two people near import box BMSU 220087 1 in block B; the seal number now differs from the manifest. The box is booked for gate-out at 07:00.',
      'الساعة 03:10 تُظهر الكاميرات شخصين قرب حاوية الاستيراد BMSU 220087 1 في الكتلة B؛ ورقم الختم الآن يختلف عن المانيفست. الحاوية محجوزة للخروج الساعة 07:00.'),
    stages: [
      { t: L('Immediate action?', 'الإجراء الفوري؟'),
        opts: [
          O(L('Place a security hold in TOS, inform PFSO and police/customs, preserve CCTV, do not open the box, restrict access to the area.', 'ضع حجزًا أمنيًا في النظام، أبلغ ضابط الأمن والشرطة/الجمارك، احفظ تسجيلات الكاميرات، لا تفتح الحاوية، قيّد الدخول للمنطقة.'), 10, L('Protect evidence and let authorities act.', 'احمِ الأدلّة ودع السلطات تتصرّف.')),
          O(L('Open it to check what is inside.', 'افتحها لتتحقّق مما بداخلها.'), 0, L('Destroys evidence and may be dangerous.', 'يدمّر الأدلّة وقد يكون خطيرًا.')),
          O(L('Let it go at 07:00, not our problem.', 'دعها تخرج 07:00، ليست مشكلتنا.'), 0, L('Possible complicity in smuggling; ISPS breach.', 'تواطؤ محتمل في التهريب؛ خرق لـ ISPS.')),
        ] },
      { t: L('How did unauthorised people reach block B? Next step?', 'كيف وصل أشخاص غير مصرّح لهم إلى الكتلة B؟ الخطوة التالية؟'),
        opts: [
          O(L('Security investigation with PFSO: access logs, ID cards used, patrol gaps; review ISPS measures, consider raising security level per authority.', 'تحقيق أمني مع ضابط الأمن: سجلّات الدخول، البطاقات المستخدمة، ثغرات الدوريات؛ مراجعة إجراءات ISPS، والنظر في رفع مستوى الأمن حسب السلطة.'), 10, L('Insider involvement is common in rip-on/rip-off schemes.', 'التواطؤ الداخلي شائع في مخطّطات التهريب rip-on/rip-off.')),
          O(L('Fire the night guards immediately.', 'افصل الحرّاس الليليين فورًا.'), 0, L('Investigate first; decisions on facts.', 'حقّق أولًا؛ القرارات بناءً على الحقائق.')),
        ] },
    ],
    debrief: L('Security incidents: hold, preserve evidence, involve PFSO and authorities, investigate access — never open or release a suspicious box.', 'الحوادث الأمنية: احجز، احفظ الأدلّة، أشرك ضابط الأمن والسلطات، حقّق في الدخول — لا تفتح ولا تُفرج عن حاوية مشبوهة أبدًا.'),
  });

  add({
    id: 'line-negotiation', lvl: 5, icon: '🤝', title: L('The demanding line', 'الخط المُطالِب'),
    role: L('Commercial & operations manager', 'المدير التجاري والتشغيلي'),
    brief: L('Orient Star Lines (18% of volume, mainline) threatens to move its call to a competitor hub unless you give a 15% rate cut and GMPH ≥ 130. Your current GMPH for OSL is 108; your rate is USD 110/move, variable cost USD 45/move.',
      'Orient Star Lines (18% من الحجم، خط رئيسي) تهدّد بنقل توقّفها إلى محور منافس ما لم تمنح خصمًا 15% وGMPH ≥ 130. GMPH الحالي لـ OSL هو 108؛ سعرك 110 دولارات/حركة، والتكلفة المتغيّرة 45 دولارًا/حركة.'),
    stages: [
      { t: L('What do you analyse first?', 'ماذا تحلّل أولًا؟'),
        opts: [
          O(L('Contribution impact: 15% cut → USD 93.5, contribution falls from 65 to 48.5 (−25%); vs losing 18% volume entirely. Plus cost to reach GMPH 130 (5 cranes? twin-lift?).', 'أثر المساهمة: خصم 15% ← 93.5 دولارًا، والمساهمة تنخفض من 65 إلى 48.5 (−25%)؛ مقابل خسارة 18% من الحجم كليًا. إضافة لتكلفة الوصول إلى GMPH 130 (5 رافعات؟ رفع مزدوج؟).'), 10, L('Decide with numbers: margin, volume, capacity.', 'قرّر بالأرقام: الهامش، الحجم، الطاقة.')),
          O(L('Accept everything to keep the customer.', 'اقبل كل شيء لتحافظ على العميل.'), 0, L('You may promise a GMPH you cannot deliver and lose money.', 'قد تعد بـ GMPH لا يمكنك تحقيقه وتخسر المال.')),
          O(L('Refuse; they are bluffing.', 'ارفض؛ إنهم يخادعون.'), 5, L('Possibly, but you need data on their alternatives.', 'ربما، لكنك تحتاج بيانات عن بدائلهم.')),
        ] },
      { t: L('Your counter-proposal?', 'عرضك المضاد؟'),
        opts: [
          O(L('7% rate reduction tied to +15% volume and a fixed Tuesday window; GMPH 120 guaranteed if OSL provides twin-lift friendly stowage and ≥ 2,500 moves; bonus/penalty symmetric.', 'خصم 7% مرتبط بزيادة 15% في الحجم ونافذة ثابتة يوم الثلاثاء؛ GMPH 120 مضمون إن وفّرت OSL رصًّا مناسبًا للرفع المزدوج و≥ 2,500 حركة؛ مكافأة/غرامة متماثلة.'), 10, L('Give-and-take, realistic productivity tied to the line’s own inputs.', 'أخذ وعطاء، وإنتاجية واقعية مرتبطة بمدخلات الخط نفسه.')),
          O(L('15% cut but no productivity guarantee.', 'خصم 15% بدون ضمان إنتاجية.'), 5, L('Keeps the customer but gives away margin for nothing.', 'يحافظ على العميل لكن يفرّط بالهامش مقابل لا شيء.')),
        ] },
    ],
    debrief: L('Commercial decisions are operations decisions: quantify margin, link guarantees to conditions both sides control, and never discount without getting value back.', 'القرارات التجارية قرارات تشغيلية: احسب الهامش، اربط الضمانات بشروط يتحكّم بها الطرفان، ولا تعطِ خصمًا أبدًا دون مقابل.'),
  });

  add({
    id: 'gate-queue', lvl: 3, icon: '🚛', title: L('Gate queue on the highway', 'طابور البوابة على الطريق السريع'),
    role: L('Gate & landside supervisor', 'مشرف البوابة وجهة البر'),
    brief: L('Monday 07:30: 140 trucks queuing, queue reaches the public highway. Only 4 of 6 in-lanes open (2 clerks sick), OCR camera on lane 3 failing, 35% of trucks have no appointment.',
      'الاثنين 07:30: 140 شاحنة في الطابور، والطابور يصل إلى الطريق السريع العام. 4 فقط من 6 مسارات دخول مفتوحة (موظّفان مريضان)، كاميرا OCR في المسار 3 تتعطّل، و35% من الشاحنات بلا موعد.'),
    stages: [
      { t: L('Next 30 minutes?', 'الثلاثين دقيقة القادمة؟'),
        opts: [
          O(L('Move 2 trained staff from the office to open lanes 5–6, send a technician to OCR lane 3 (manual entry meanwhile), give priority lane to appointment holders and inform hauliers by SMS/PCS.', 'انقل موظّفَين مدرّبَين من المكتب لفتح المسارين 5–6، أرسل فنّيًا لـ OCR المسار 3 (إدخال يدوي في الأثناء)، خصّص مسار أولوية لأصحاب المواعيد وأبلغ شركات النقل عبر الرسائل/PCS.'), 10, L('Add capacity fast and reward appointment compliance.', 'أضف طاقة بسرعة وكافئ الالتزام بالمواعيد.')),
          O(L('Send away all trucks without appointment.', 'اصرف كل الشاحنات بلا مواعيد.'), 5, L('Consistent with the rules but on a jammed highway it may be impossible and unsafe; better a separate slow lane plus warning.', 'متّسق مع القواعد لكن على طريق مزدحم قد يكون مستحيلًا وغير آمن؛ الأفضل مسار بطيء منفصل مع تحذير.')),
          O(L('Wait — Monday mornings are always like this.', 'انتظر — صباح الاثنين دائمًا هكذا.'), 0, L('Accepting a recurring failure.', 'قبول فشل متكرّر.')),
        ] },
      { t: L('Structural fix for next Monday?', 'إصلاح هيكلي للاثنين القادم؟'),
        opts: [
          O(L('Analyse arrival profile; cap slots per hour; enforce appointments with a no-appointment surcharge; open the gate earlier on Mondays; backup clerk roster.', 'حلّل نمط الوصول؛ حدّد سقف المواعيد بالساعة؛ فرض المواعيد مع رسم إضافي لمن لا موعد له؛ افتح البوابة أبكر يوم الاثنين؛ جدول موظّفين احتياطي.'), 10, L('Data, rules and resilient staffing.', 'بيانات وقواعد وتوظيف مرن.')),
          O(L('Build two more lanes.', 'ابنِ مسارين إضافيين.'), 5, L('Expensive; first use existing lanes fully and flatten peaks.', 'مكلف؛ استخدم المسارات الحالية بالكامل أولًا وسطّح الذروات.')),
        ] },
    ],
    debrief: L('Landside congestion: restore capacity immediately, protect appointment users, then flatten the peak with appointment rules and staffing plans.', 'ازدحام جهة البر: استعد الطاقة فورًا، احمِ أصحاب المواعيد، ثم سطّح الذروة بقواعد المواعيد وخطط التوظيف.'),
  });
})();
