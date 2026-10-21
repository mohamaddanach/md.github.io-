/* Port Master Academy — the virtual terminal, career ladder and progress store */
(function () {
  const L = TS.L;
  const PT = (window.PT = window.PT || {});
  PT.lessons = []; PT.ops = []; PT.cases = []; PT.drills = []; PT.sims = []; PT.examBank = []; PT.glossary = []; PT.events = [];

  /* ---------------- the virtual port (fictional) ---------------- */
  PT.port = {
    name: L('Cedar Bay Container Terminal (CBCT)', 'محطة خليج الأرز للحاويات (CBCT)'),
    short: 'CBCT', unlocode: 'XXCBT',
    intro: L(
      'A fictional medium-size gateway + transshipment terminal on the Eastern Mediterranean. Capacity 1.6 million TEU/year, 3 berths on a 900 m quay, 9 ship-to-shore (STS) cranes, 24 RTGs, 6 reach stackers, 1,100 reefer plugs and an off-dock empty depot 4 km away.',
      'محطة افتراضية متوسطة الحجم (بوابة + مسافنة) في شرق المتوسط. الطاقة 1.6 مليون حاوية نمطية/سنة، 3 أرصفة على رصيف بطول 900 م، 9 رافعات رصيف (STS)، 24 رافعة RTG، 6 رافعات ريتش ستاكر، 1,100 مقبس للحاويات المبرّدة، ومستودع حاويات فارغة خارج المحطة على بعد 4 كم.'
    ),
    berths: [
      { id: 'B1', len: 300, draft: 14.0, cranes: 3, note: L('Feeder & regional services', 'خدمات الفيدر والخطوط الإقليمية') },
      { id: 'B2', len: 350, draft: 15.5, cranes: 4, note: L('Mainline (deep water)', 'الخطوط الرئيسية (مياه عميقة)') },
      { id: 'B3', len: 250, draft: 11.5, cranes: 2, note: L('Small feeders, ro-ro, project cargo', 'فيدر صغير، رورو، شحنات مشاريع') },
    ],
    channel: { depth: 16.0, note: L('Approach channel 16.0 m below chart datum; tidal range ~0.4–0.6 m.', 'قناة الاقتراب 16.0 م تحت مستوى الخريطة؛ مدى المد ~0.4–0.6 م.') },
    yard: [
      { id: 'A', use: L('Export (by vessel/POD)', 'تصدير (حسب السفينة/ميناء التفريغ)'), tgs: 420, tiers: 5 },
      { id: 'B', use: L('Import (by dwell, customs status)', 'استيراد (حسب مدة البقاء وحالة الجمارك)'), tgs: 480, tiers: 5 },
      { id: 'C', use: L('Transshipment', 'المسافنة'), tgs: 360, tiers: 5 },
      { id: 'R', use: L('Reefer (1,100 plugs)', 'مبرّدات (1,100 مقبس)'), tgs: 280, tiers: 4 },
      { id: 'D', use: L('Dangerous goods (IMDG, segregated)', 'بضائع خطرة (IMDG، معزولة)'), tgs: 60, tiers: 2 },
      { id: 'E', use: L('Empties buffer', 'حاجز الفارغ'), tgs: 220, tiers: 6 },
    ],
    gate: L('6 in-lanes + 4 out-lanes, OCR portal, truck appointment system, 06:00–22:00', '6 مسارات دخول + 4 خروج، بوابة OCR، نظام مواعيد الشاحنات، 06:00–22:00'),
    depot: L('Cedar Empty Depot (off-dock): 4,500 TEU, M&R workshop, washing bay, reefer PTI area', 'مستودع الأرز للفارغ (خارج المحطة): 4,500 حاوية نمطية، ورشة صيانة وإصلاح، منطقة غسيل، منطقة فحص PTI للمبرّدات'),
    terminals: [
      { icon: '📦', n: L('Container terminal (CBCT)', 'محطة الحاويات (CBCT)'), d: L('900 m quay, 3 berths, 9 STS — described above.', 'رصيف 900 م، 3 أرصفة، 9 رافعات STS — موصوفة أعلاه.') },
      { icon: '🌾', n: L('Grain silo terminal', 'محطة صوامع الحبوب'), d: L('Berth G1: 240 m, 13.0 m. 2 pneumatic unloaders (2 × 600 t/h), 1 mechanical (800 t/h). 48 concrete bins × 2,500 t = 120,000 t + 30,000 t flat store. Truck loading 8 bays (400 t/h each), 2 hopper scales, dryer 120 t/h.', 'الرصيف G1: 240 م، 13.0 م. مفرّغتان هوائيتان (2 × 600 طن/س)، ومفرّغة ميكانيكية (800 طن/س). 48 خلية خرسانية × 2,500 طن = 120,000 طن + مخزن أرضي 30,000 طن. 8 مسارات لتحميل الشاحنات (400 طن/س لكلّ منها)، ميزانا قادوس، مجفّف 120 طن/س.') },
      { icon: '🛢', n: L('Liquid bulk terminal', 'محطة السوائل السائبة'), d: L('Jetty L1 (max 60,000 DWT), 22 tanks = 180,000 m³ (diesel, gasoline, vegetable oil), 4 loading arms, 12 truck-loading bays.', 'رصيف L1 (حتى 60,000 طن ساكن)، 22 خزانًا = 180,000 م³ (ديزل، بنزين، زيت نباتي)، 4 أذرع تحميل، 12 مسار لتحميل الشاحنات.') },
      { icon: '🚗', n: L('Ro-ro & car terminal', 'محطة الرورو والسيارات'), d: L('B3 shared, 4,200 car parking slots, PDI workshop.', 'الرصيف B3 مشترك، 4,200 موقف سيارة، ورشة فحص ما قبل التسليم PDI.') },
      { icon: '🏗', n: L('Multipurpose / project cargo', 'متعدّد الأغراض / شحنات المشاريع'), d: L('Uses B3 with 2 mobile harbour cranes (100 t each, tandem 200 t), 25,000 m² laydown.', 'يستخدم الرصيف B3 مع رافعتين متنقّلتين (100 طن لكلّ منهما، 200 طن معًا)، مساحة تخزين 25,000 م².') },
      { icon: '🏭', n: L('Cedar Empty Depot', 'مستودع الأرز للفارغ'), d: L('Off-dock 4,500 TEU, M&R workshop, washing bay, reefer PTI area.', 'خارج المحطة 4,500 TEU، ورشة صيانة، منطقة غسيل، منطقة فحص PTI.') },
    ],
    lines: ['Atlas Ocean Line (AOL)', 'Blue Meridian Shipping (BMS)', 'Levant Feeder Services (LFS)', 'Orient Star Lines (OSL)', 'Nordic Ro-Ro (NRR)'],
  };

  /* live board on the dashboard — a snapshot of the terminal "now" */
  PT.board = [
    { v: 'AOL MARSEILLE', line: 'AOL', berth: 'B2', loa: 334, status: 'ops', done: 0.62, moves: 2850, eta: '06:00', etd: '22:30' },
    { v: 'LFS CEDAR', line: 'LFS', berth: 'B1', loa: 172, status: 'ops', done: 0.35, moves: 640, eta: '10:00', etd: '19:00' },
    { v: 'NRR VIKING', line: 'NRR', berth: 'B3', loa: 199, status: 'ops', done: 0.8, moves: 0, eta: '04:00', etd: '15:00' },
    { v: 'BMS ADRIATIC', line: 'BMS', berth: '—', loa: 294, status: 'anch', done: 0, moves: 1900, eta: '14:00', etd: '—' },
    { v: 'OSL PEARL', line: 'OSL', berth: '—', loa: 366, status: 'exp', done: 0, moves: 3400, eta: '+1 08:00', etd: '—' },
  ];

  /* ---------------- levels ---------------- */
  PT.levels = [
    { n: 1, key: 'l1', icon: '⚓', title: L('Foundations', 'الأساسيات'), sub: L('Port ecosystem, ships, containers, equipment, documents', 'منظومة الميناء، السفن، الحاويات، المعدّات، المستندات') },
    { n: 2, key: 'l2', icon: '🚢', title: L('Vessel operations', 'عمليات السفن'), sub: L('Arrival, tides & UKC, berth planning, crane split, stowage, departure', 'الوصول، المد وعمق الأمان، تخطيط الأرصفة، توزيع الرافعات، الرصّ، المغادرة') },
    { n: 3, key: 'l3', icon: '🏗', title: L('Yard & gate', 'الساحة والبوابة'), sub: L('Yard capacity, stacking, gate, reefers, DG, customs', 'سعة الساحة، الرصّ، البوابة، المبرّدات، الخطرة، الجمارك') },
    { n: 4, key: 'l4', icon: '📦', title: L('Depots & equipment control', 'المستودعات والتحكّم بالمعدّات'), sub: L('Empty depots, M&R, repositioning, D&D, maintenance', 'مستودعات الفارغ، الصيانة والإصلاح، إعادة التموضع، الغرامات، الصيانة') },
    { n: 5, key: 'l5', icon: '🎖', title: L('Senior management', 'الإدارة العليا'), sub: L('KPIs, safety & security, crisis, commercial, leadership, digital', 'مؤشرات الأداء، السلامة والأمن، الأزمات، التجاري، القيادة، الرقمنة') },
    { n: 6, key: 'l6', track: true, icon: '🛳', title: L('Vessel management', 'إدارة السفن'), sub: L('Ship management, ISM, chartering, laytime, voyage economics, technical & crew', 'إدارة السفن، ISM، التأجير، زمن الرسو، اقتصاديات الرحلة، الفني والطاقم') },
    { n: 7, key: 'l7', track: true, icon: '🌾', title: L('Bulk & silo terminals', 'محطات السائبة والصوامع'), sub: L('Grain silos, storage quality, dust safety, bulk ship discharge, draft survey', 'صوامع الحبوب، جودة التخزين، سلامة الغبار، تفريغ السفن السائبة، مسح الغاطس') },
    { n: 8, key: 'l8', track: true, icon: '🛢', title: L('Other terminals & depots', 'المحطات الأخرى والمستودعات'), sub: L('Liquid bulk, ro-ro & cars, breakbulk & project cargo, advanced depot management', 'السوائل السائبة، الرورو والسيارات، البضائع العامة والمشاريع، إدارة المستودعات المتقدّمة') },
    { n: 9, key: 'l9', track: true, icon: '🏗', title: L('Port development', 'تطوير الموانئ'), sub: L('Master planning, forecasting, capacity, feasibility, PPP, project delivery, green & smart ports', 'التخطيط الرئيسي، التنبّؤ، الطاقة، الجدوى، الشراكة مع القطاع الخاص، تنفيذ المشاريع، الموانئ الخضراء والذكية') },
    { n: 10, key: 'l10', track: true, icon: '⚙', title: L('Port services, intermodal & maritime law', 'خدمات الميناء والنقل المتعدّد والقانون البحري'), sub: L('Bunkering & ship supply, pilotage/towage/mooring, cruise terminals, rail & dry ports, B/L law & insurance, port tariffs & invoicing', 'تزويد الوقود والإمدادات، الإرشاد/القطر/الربط، محطات الركّاب، السكك والموانئ الجافة، قانون البوليصة والتأمين، تعرفات الميناء والفوترة') },
  ];

  /* ---------------- career ladder ---------------- */
  PT.ranks = [
    { xp: 0, exams: 0, icon: '🔰', t: L('Trainee', 'متدرّب'), d: L('Learning the vocabulary and the port ecosystem.', 'يتعلّم المصطلحات ومنظومة الميناء.') },
    { xp: 300, exams: 0, icon: '🧾', t: L('Junior Operations Clerk', 'موظّف عمليات مبتدئ'), d: L('Can check containers, documents and gate transactions.', 'يستطيع فحص الحاويات والمستندات ومعاملات البوابة.') },
    { xp: 900, exams: 1, icon: '📋', t: L('Operations Officer', 'ضابط عمليات'), d: L('Follows a vessel call from pre-arrival to departure.', 'يتابع زيارة السفينة من ما قبل الوصول حتى المغادرة.') },
    { xp: 1800, exams: 2, icon: '🗺', t: L('Vessel / Yard Planner', 'مخطّط سفن / ساحة'), d: L('Plans berths, cranes, yard blocks and loading sequences.', 'يخطّط الأرصفة والرافعات وكتل الساحة وتسلسل التحميل.') },
    { xp: 3000, exams: 3, icon: '🧭', t: L('Senior Planner', 'مخطّط أول'), d: L('Optimises the whole terminal and solves conflicts between lines.', 'يحسّن أداء المحطة كاملة ويحلّ التعارض بين الخطوط.') },
    { xp: 4500, exams: 4, icon: '🛡', t: L('Duty / Shift Manager', 'مدير مناوبة'), d: L('Runs 24/7 operations, incidents, people and safety.', 'يدير العمليات على مدار الساعة والحوادث والفرق والسلامة.') },
    { xp: 6500, exams: 5, icon: '🎖', t: L('Senior Port Operations Manager', 'مدير عمليات ميناء أول'), d: L('Owns KPIs, budgets, contracts, crisis management and strategy.', 'مسؤول عن مؤشرات الأداء والميزانيات والعقود وإدارة الأزمات والاستراتيجية.') },
    { xp: 9000, exams: 7, icon: '🌐', t: L('Multi-terminal Operations Director', 'مدير عمليات متعدّد المحطات'), d: L('Runs container, bulk/silo, liquid and ro-ro terminals plus depots, and works with ship managers.', 'يدير محطات الحاويات والسائبة/الصوامع والسوائل والرورو مع المستودعات، ويعمل مع مديري السفن.') },
    { xp: 13000, exams: 10, icon: '👑', t: L('Port Director & Development Lead', 'مدير الميناء وقائد التطوير'), d: L('Plans and finances port expansion, leads concessions and the long-term strategy.', 'يخطّط ويموّل توسعة الميناء، ويقود عقود الامتياز والاستراتيجية طويلة الأمد.') },
  ];

  /* ---------------- progress store ---------------- */
  const KEY = 'ptm_progress_v1';
  const blank = () => ({ name: '', lessons: {}, cases: {}, sims: {}, ops: {}, drills: {}, exams: {}, events: [], started: new Date().toISOString() });
  PT.load = () => {
    let p = null;
    try { p = JSON.parse(localStorage.getItem(KEY) || 'null'); } catch (e) { p = null; }
    p = Object.assign(blank(), p || {});
    PT.P = p; return p;
  };
  PT.save = () => { try { localStorage.setItem(KEY, JSON.stringify(PT.P)); } catch (e) { /* storage blocked */ } };
  PT.reset = () => { PT.P = blank(); PT.save(); };
  PT.logEvent = (kind, id, xp, label) => {
    PT.P.events.unshift({ at: new Date().toISOString(), kind, id, xp, label });
    PT.P.events = PT.P.events.slice(0, 40);
  };

  PT.xp = () => {
    const p = PT.P;
    let x = 0;
    Object.values(p.lessons).forEach((l) => { if (l.done) x += 30; });
    Object.values(p.cases).forEach((c) => { x += Math.round(c.best || 0); });
    Object.values(p.sims).forEach((s) => { x += Math.round(s.best || 0); });
    Object.values(p.ops || {}).forEach((s) => { x += Math.round((s.best || 0) * 1.5); });
    Object.values(p.drills).forEach((d) => { x += (d.c || 0) * 5; });
    Object.values(p.exams).forEach((e) => { if (e.passed) x += 250; });
    return x;
  };
  PT.examsPassed = () => Object.values(PT.P.exams).filter((e) => e.passed).length;
  PT.rankIndex = () => {
    const x = PT.xp(), ex = PT.examsPassed();
    let r = 0;
    PT.ranks.forEach((k, i) => { if (x >= k.xp && ex >= k.exams) r = i; });
    return r;
  };
  PT.stats = () => {
    const p = PT.P;
    const dr = Object.values(p.drills).reduce((a, d) => ({ c: a.c + (d.c || 0), n: a.n + (d.n || 0) }), { c: 0, n: 0 });
    return {
      lessons: Object.values(p.lessons).filter((l) => l.done).length,
      cases: Object.values(p.cases).filter((c) => c.best != null).length,
      sims: Object.values(p.sims).filter((s) => s.best != null).length,
      ops: Object.values(p.ops || {}).filter((s) => s.best != null).length,
      drills: dr, exams: PT.examsPassed(), xp: PT.xp(),
    };
  };

  /* ---------------- small math helpers shared by drills & sims ---------------- */
  PT.rnd = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
  PT.pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
  PT.shuffle = (arr) => { const a = arr.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  PT.r1 = (n) => Math.round(n * 10) / 10;
  PT.r2 = (n) => Math.round(n * 100) / 100;
  PT.hhmm = (h) => { const d = Math.floor(h / 24), hh = Math.floor(h % 24), mm = Math.round((h % 1) * 60); return (d ? 'D+' + d + ' ' : '') + String(hh).padStart(2, '0') + ':' + String(mm === 60 ? 0 : mm).padStart(2, '0'); };

  /* random valid ISO 6346 container number */
  PT.containerNo = (owner) => {
    const o = owner || PT.pick(['AOLU', 'BMSU', 'LFSU', 'OSLU', 'TCLU', 'CBTU']);
    const n = String(PT.rnd(0, 999999)).padStart(6, '0');
    return o + n + TS.REF.checkDigit(o + n);
  };
  PT.badContainerNo = () => {
    const good = PT.containerNo();
    const d = (Number(good[10]) + PT.rnd(1, 8)) % 10;
    return good.slice(0, 10) + d;
  };
})();
