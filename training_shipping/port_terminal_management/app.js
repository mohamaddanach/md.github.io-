/* Port Master Academy — application shell, router and views */
(function () {
  const L = TS.L, t = TS.t, esc = TS.esc;
  const $ = (s, el) => (el || document).querySelector(s);
  const $$ = (s, el) => Array.from((el || document).querySelectorAll(s));
  PT.load();

  const lvlOf = (n) => PT.levels[n - 1];
  const lvlBadge = (n) => `<span class="lvl l${n}">L${n} · ${t(lvlOf(n).title)}</span>`;
  const lessonsOf = (n) => PT.lessons.filter((l) => l.lvl === n);
  const lessonDone = (id) => !!(PT.P.lessons[id] && PT.P.lessons[id].done);
  const levelProgress = (n) => { const ls = lessonsOf(n); return ls.length ? ls.filter((l) => lessonDone(l.id)).length / ls.length : 0; };

  const ring = (pct, label) => {
    const r = 26, c = 2 * Math.PI * r;
    return `<svg class="ring" viewBox="0 0 64 64"><circle class="bg" cx="32" cy="32" r="${r}"/><circle class="fg" cx="32" cy="32" r="${r}" stroke-dasharray="${c}" stroke-dashoffset="${c * (1 - pct)}" transform="rotate(-90 32 32)"/><text x="32" y="37" text-anchor="middle">${label != null ? label : Math.round(pct * 100) + '%'}</text></svg>`;
  };

  const ART = `<svg class="art" viewBox="0 0 420 200" aria-hidden="true">
    <g fill="none" stroke="#fff" stroke-width="3" opacity=".9"><path d="M300 30 V170 M340 30 V170 M300 30 H410 M260 30 H300 M300 60 L340 30 M300 60 H340"/><path d="M372 30 V48" stroke="#e30613"/></g>
    <rect x="364" y="48" width="18" height="10" fill="#e30613"/>
    <path d="M20 150 H330 L310 178 H44 Z" fill="#fff" opacity=".95"/>
    <rect x="270" y="112" width="40" height="38" fill="#fff" opacity=".85"/><rect x="278" y="100" width="24" height="12" fill="#fff" opacity=".85"/>
    ${[0, 1, 2, 3, 4, 5, 6, 7].map((i) => `<rect x="${50 + i * 27}" y="132" width="25" height="17" fill="${['#e30613', '#9bbcff', '#fff', '#e30613', '#9bbcff', '#fff', '#9bbcff', '#e30613'][i]}" opacity=".9"/>`).join('')}
    ${[0, 1, 2, 3, 4, 5].map((i) => `<rect x="${64 + i * 27}" y="114" width="25" height="17" fill="${['#9bbcff', '#fff', '#e30613', '#fff', '#9bbcff', '#e30613'][i]}" opacity=".85"/>`).join('')}
    <path d="M0 184 Q30 176 60 184 T120 184 T180 184 T240 184 T300 184 T360 184 T420 184" stroke="#9bbcff" stroke-width="3" fill="none" opacity=".7"/></svg>`;

  /* ---------------------------------------------------------- recording */
  function award(kind, id, score, label) {
    const box = PT.P[kind]; const prev = box[id] || {};
    const best = Math.max(prev.best || 0, score);
    const before = PT.rankIndex();
    box[id] = Object.assign(prev, { best, last: score, runs: (prev.runs || 0) + 1, at: new Date().toISOString() });
    PT.logEvent(kind, id, score, label);
    PT.save();
    TS.toast((score >= 70 ? '✓ ' : '') + t(L('Score', 'النتيجة')) + ': ' + score + (best > (prev.best || 0) && prev.runs ? ' · ' + t(L('new best!', 'أفضل نتيجة جديدة!')) : ''), score >= 70 ? 'ok' : '');
    rankUp(before);
  }
  function rankUp(before) {
    const now = PT.rankIndex();
    if (now > before) TS.toast('🎖 ' + t(L('Promotion! You are now: ', 'ترقية! أنت الآن: ')) + t(PT.ranks[now].t), 'ok');
    renderTop();
  }

  /* ---------------------------------------------------------- shell */
  const NAV = [
    { g: L('Overview', 'نظرة عامة') },
    { h: '', i: '🏠', l: L('Dashboard', 'لوحة القيادة') },
    { h: 'path', i: '🧭', l: L('Career path', 'المسار المهني') },
    { h: 'port', i: '⚓', l: L('Our virtual port', 'ميناؤنا الافتراضي') },
    { g: L('Learn', 'تعلّم') },
    { h: 'academy', i: '📚', l: L('Academy (lessons)', 'الأكاديمية (الدروس)'), c: () => `${Object.values(PT.P.lessons).filter((x) => x.done).length}/${PT.lessons.length}` },
    { h: 'glossary', i: '🔤', l: L('Glossary EN/AR', 'المعجم إنجليزي/عربي') },
    { g: L('Practise', 'تدرّب') },
    { h: 'cases', i: '🎬', l: L('Virtual cases', 'الحالات الافتراضية'), c: () => `${Object.keys(PT.P.cases).length}/${PT.cases.length}` },
    { h: 'sims', i: '🕹', l: L('Simulators', 'المحاكيات'), c: () => `${Object.keys(PT.P.sims).length}/${PT.sims.length}` },
    { h: 'drills', i: '🧮', l: L('Exercises (unlimited)', 'التمارين (غير محدودة)') },
    { g: L('Certify', 'احصل على الشهادة') },
    { h: 'exams', i: '🎓', l: L('Level exams', 'امتحانات المستويات'), c: () => `${PT.examsPassed()}/5` },
    { h: 'profile', i: '👤', l: L('My progress', 'تقدّمي') },
  ];
  function route() { const h = (location.hash || '#/').slice(2).split('/'); return { v: h[0] || '', a: h[1] }; }

  function renderTop() {
    const r = PT.ranks[PT.rankIndex()];
    const el = $('#ptTop'); if (!el) return;
    el.innerHTML = `<button class="menu-btn" id="menuBtn" aria-label="menu">☰</button>
      <a class="logo" href="#/"><span class="mark"><svg width="22" height="22" viewBox="0 0 24 24"><path d="M12 2v14M7 6h10M4 13a8 8 0 0 0 16 0" stroke="#04246a" stroke-width="2.4" fill="none" stroke-linecap="round"/><circle cx="12" cy="4" r="2" fill="#e30613"/></svg></span>
        <span>Port Master Academy<small>${t(L('Port & terminal management · EN / AR', 'إدارة الموانئ والمحطات · عربي / إنجليزي'))}</small></span></a>
      <span class="spacer"></span>
      <a class="rankchip" href="#/path"><span class="ico">${r.icon}</span><span class="txt"><b>${t(r.t)}</b> · ${TS.num(PT.xp(), 0)} XP</span></a>
      ${TS.langSwitch()}`;
    $('#menuBtn').onclick = () => $('#ptSide').classList.toggle('open');
  }
  function renderSide() {
    const cur = route().v;
    const map = { lesson: 'academy', case: 'cases', sim: 'sims', exam: 'exams', cert: 'exams' };
    const on = map[cur] || cur;
    $('#ptSide').innerHTML = NAV.map((n) => n.g ? `<h5>${t(n.g)}</h5>` : `<a class="pt-nav ${on === n.h ? 'on' : ''}" href="#/${n.h}"><span class="i">${n.i}</span>${t(n.l)}${n.c ? `<span class="c">${n.c()}</span>` : ''}</a>`).join('') +
      `<h5>${t(L('More training', 'تدريب إضافي'))}</h5><a class="pt-nav" href="../index.html"><span class="i">⛴</span>${t(L('Freight forwarding academy', 'أكاديمية الشحن'))}</a>`;
  }
  function render() {
    TS.applyLang();
    document.title = 'Port Master Academy';
    if (!$('#ptTop')) {
      $('#app').innerHTML = `<header class="pt-top" id="ptTop"></header><div class="pt-shell"><nav class="pt-side" id="ptSide"></nav><main class="pt-main" id="ptMain"></main></div>`;
    }
    renderTop(); renderSide();
    $('#ptSide').classList.remove('open');
    const main = $('#ptMain'); main.className = 'pt-main fade-in';
    const r = route();
    const views = { '': vDash, path: vPath, port: vPort, academy: vAcademy, lesson: vLesson, glossary: vGlossary, cases: vCases, case: vCase, sims: vSims, sim: vSim, drills: vDrills, exams: vExams, exam: vExam, cert: vCert, profile: vProfile };
    (views[r.v] || vDash)(main, r.a);
    window.scrollTo(0, 0);
  }
  const head = (eyebrow, title, sub, right) => `<div class="ph"><div class="t"><div class="eyebrow">${t(eyebrow)}</div><h1>${t(title)}</h1>${sub ? `<p>${t(sub)}</p>` : ''}</div>${right || ''}</div>`;

  /* ---------------------------------------------------------- dashboard */
  function nextStep() {
    for (const lv of PT.levels) {
      const l = lessonsOf(lv.n).find((x) => !lessonDone(x.id));
      if (l) return { href: '#/lesson/' + l.id, label: t(l.title), kind: L('Next lesson', 'الدرس التالي'), icon: l.icon };
      const c = PT.cases.find((x) => x.lvl === lv.n && !PT.P.cases[x.id]);
      if (c) return { href: '#/case/' + c.id, label: t(c.title), kind: L('Next virtual case', 'الحالة الافتراضية التالية'), icon: c.icon };
      const s = PT.sims.find((x) => x.lvl === lv.n && !PT.P.sims[x.id]);
      if (s) return { href: '#/sim/' + s.id, label: t(s.title), kind: L('Next simulator', 'المحاكي التالي'), icon: s.icon };
      if (!(PT.P.exams[lv.n] && PT.P.exams[lv.n].passed)) return { href: '#/exam/' + lv.n, label: t(L('Level ' + lv.n + ' exam', 'امتحان المستوى ' + lv.n)), kind: L('Certify', 'احصل على الشهادة'), icon: '🎓' };
    }
    return { href: '#/drills', label: t(L('Keep your skills sharp with drills', 'حافظ على مهاراتك بالتمارين')), kind: L('All done!', 'أنجزت كل شيء!'), icon: '🏆' };
  }
  function portMap() {
    const bx = { B1: 40, B2: 360, B3: 730 }, bw = { B1: 300, B2: 350, B3: 230 };
    const ships = PT.board.filter((b) => b.berth !== '—');
    return `<svg class="portmap" viewBox="0 0 1000 300" role="img" aria-label="terminal map">
      <rect x="0" y="0" width="1000" height="110" fill="#9fc1ea" opacity=".55"/>
      <rect x="0" y="110" width="1000" height="16" fill="#8a96ab"/>
      ${Object.keys(bx).map((k) => `<text x="${bx[k] + 6}" y="122" font-size="11" fill="#fff" font-weight="700">${k}</text>`).join('')}
      ${[80, 180, 280, 420, 520, 620, 760, 860].map((x) => `<g stroke="#e30613" stroke-width="4"><path d="M${x} 126 V40 M${x + 24} 126 V40 M${x - 20} 40 H${x + 60}"/></g>`).join('')}
      ${ships.map((s) => { const x = bx[s.berth], w = Math.min(bw[s.berth] - 20, s.loa * 0.95); return `<g><path d="M${x} 62 H${x + w} L${x + w - 14} 106 H${x + 12} Z" fill="#04246a"/><rect x="${x + w - 52}" y="40" width="26" height="22" fill="#fff"/><rect x="${x + 16}" y="${50}" width="${(w - 80) * s.done}" height="12" fill="#e30613"/><text x="${x + 18}" y="86" font-size="12" fill="#fff" font-weight="600">${esc(s.v)}</text><text x="${x + 18}" y="100" font-size="10" fill="#cfe0ff">${Math.round(s.done * 100)}% · ETD ${s.etd}</text></g>`; }).join('')}
      <rect x="0" y="126" width="1000" height="174" fill="#c9d3e3" opacity=".6"/>
      ${PT.port.yard.map((b, i) => `<g><rect x="${30 + i * 160}" y="150" width="140" height="${i === 4 ? 60 : 110}" rx="6" fill="${['#04246a', '#1d56c0', '#7b3fc4', '#2f7d5b', '#e30613', '#8a96ab'][i]}" opacity=".85"/><text x="${40 + i * 160}" y="172" font-size="13" fill="#fff" font-weight="700">${t(L('Block', 'كتلة'))} ${b.id}</text><text x="${40 + i * 160}" y="190" font-size="10.5" fill="#fff">${esc(t(b.use)).slice(0, 26)}</text></g>`).join('')}
      <text x="880" y="292" font-size="11" fill="#04246a" font-weight="700">GATE ▸</text>
      <text x="14" y="22" font-size="11" fill="#04246a" font-weight="700">⚓ ${t(L('Anchorage', 'المخطاف'))}: ${PT.board.filter((b) => b.status === 'anch').map((b) => b.v).join(', ')}</text></svg>`;
  }
  function vDash(main) {
    const s = PT.stats(), ri = PT.rankIndex(), r = PT.ranks[ri], nx = PT.ranks[ri + 1];
    const pct = nx ? Math.min(1, (s.xp - r.xp) / (nx.xp - r.xp)) : 1;
    const ns = nextStep();
    const hello = PT.P.name ? t(L('Welcome back, ', 'أهلًا بعودتك، ')) + esc(PT.P.name) : t(L('Welcome, future port manager', 'أهلًا بمدير الميناء القادم'));
    main.innerHTML = `
      <section class="pt-hero">${ART}<span class="tagline">${t(L('From junior to senior', 'من مبتدئ إلى محترف'))}</span>
        <h1>${hello}</h1>
        <p>${t(L('Run a virtual container terminal: plan berths and cranes, stack the yard, check trucks at the gate, survey empties at the depot and handle real-life crises — with ' + PT.lessons.length + ' lessons, ' + PT.cases.length + ' virtual cases, ' + PT.sims.length + ' simulators and unlimited exercises in English and Arabic.', 'أدِر محطة حاويات افتراضية: خطّط الأرصفة والرافعات، رصّ الساحة، افحص الشاحنات على البوابة، عاين الحاويات الفارغة في المستودع وتعامل مع أزمات حقيقية — مع ' + PT.lessons.length + ' درسًا و' + PT.cases.length + ' حالة افتراضية و' + PT.sims.length + ' محاكيات وتمارين غير محدودة بالعربية والإنجليزية.'))}</p>
        <div class="row" style="margin-top:14px"><a class="btn" href="${ns.href}">${ns.icon} ${t(ns.kind)}: ${esc(ns.label)} →</a><a class="btn alt" href="#/path">${t(L('See the career path', 'شاهد المسار المهني'))}</a></div></section>
      <div class="grid c4">
        <div class="tile"><span class="ic">${r.icon}</span><div class="k">${t(L('Current rank', 'الرتبة الحالية'))}</div><div class="v" style="font-size:1.05rem;margin:4px 0">${t(r.t)}</div><div class="bar"><i style="width:${pct * 100}%"></i></div><div class="s" style="margin-top:4px">${nx ? `${TS.num(s.xp, 0)} / ${TS.num(nx.xp, 0)} XP${nx.exams > s.exams ? ' · ' + t(L(`${nx.exams} exams needed`, `مطلوب ${nx.exams} امتحانات`)) : ''}` : t(L('Top rank reached', 'بلغت أعلى رتبة'))}</div></div>
        <div class="tile"><span class="ic">📚</span><div class="k">${t(L('Lessons', 'الدروس'))}</div><div class="v">${s.lessons}<small style="font-size:.9rem;color:var(--ink-3)">/${PT.lessons.length}</small></div><div class="s">${t(L('read + quiz passed', 'قراءة + نجاح في الاختبار'))}</div></div>
        <div class="tile red"><span class="ic">🎬</span><div class="k">${t(L('Cases & simulators', 'الحالات والمحاكيات'))}</div><div class="v">${s.cases + s.sims}<small style="font-size:.9rem;color:var(--ink-3)">/${PT.cases.length + PT.sims.length}</small></div><div class="s">${t(L('completed at least once', 'مكتملة مرة واحدة على الأقل'))}</div></div>
        <div class="tile"><span class="ic">🧮</span><div class="k">${t(L('Exercises', 'التمارين'))}</div><div class="v">${s.drills.c}</div><div class="s">${s.drills.n ? Math.round(s.drills.c / s.drills.n * 100) + '% ' + t(L('accuracy', 'دقّة')) : t(L('no attempts yet', 'لا محاولات بعد'))}</div></div>
      </div>
      <div class="section-title"><h2>🛰 ${t(L('Terminal live board — CBCT', 'اللوحة الحيّة للمحطة — CBCT'))}</h2></div>
      ${portMap()}
      <div class="table-wrap"><table><thead><tr><th>${t(L('Vessel', 'السفينة'))}</th><th>${t(L('Berth', 'الرصيف'))}</th><th class="num">LOA</th><th>${t(L('Status', 'الحالة'))}</th><th class="num">${t(L('Moves', 'الحركات'))}</th><th>ETA</th><th>ETD</th></tr></thead><tbody>
      ${PT.board.map((b) => `<tr><td><b>${b.v}</b></td><td>${b.berth}</td><td class="num">${b.loa}</td><td>${b.status === 'ops' ? `<span class="badge ok">${t(L('Working', 'يعمل'))} ${Math.round(b.done * 100)}%</span>` : b.status === 'anch' ? `<span class="badge warn">${t(L('At anchorage', 'على المخطاف'))}</span>` : `<span class="badge info">${t(L('Expected', 'متوقّعة'))}</span>`}</td><td class="num">${b.moves || 'ro-ro'}</td><td>${b.eta}</td><td>${b.etd}</td></tr>`).join('')}</tbody></table></div>
      <div class="section-title"><h2>🗺 ${t(L('Your learning levels', 'مستويات التعلّم'))}</h2></div>
      <div class="grid c3">${PT.levels.map((lv) => { const p = levelProgress(lv.n), ex = PT.P.exams[lv.n]; return `<a class="link-card" href="#/academy"><div class="mod"><div class="top"><div class="em">${lv.icon}</div><div style="flex:1"><span class="lvl l${lv.n}">${t(L('Level', 'المستوى'))} ${lv.n}</span><h3 style="margin-top:4px">${t(lv.title)}</h3></div>${ring(p)}</div><p>${t(lv.sub)}</p><div class="foot">${ex && ex.passed ? `<span class="badge ok">🎓 ${t(L('Certified', 'حاصل على الشهادة'))}</span>` : `<span class="badge">${t(L('Exam not passed', 'لم يُجتز الامتحان'))}</span>`}</div></div></a>`; }).join('')}
        <a class="link-card" href="#/drills"><div class="mod" style="background:linear-gradient(135deg,var(--brand-soft),var(--panel))"><div class="top"><div class="em">♾</div><h3>${t(L('Unlimited exercises', 'تمارين غير محدودة'))}</h3></div><p>${t(L(`${PT.drills.length} types of calculations with new numbers every time: TEU, check digit, UKC, GMPH, berth occupancy, yard capacity, storage tariffs, EOR, KPIs…`, `${PT.drills.length} نوعًا من الحسابات بأرقام جديدة كل مرة: TEU، رقم التحقّق، UKC، GMPH، إشغال الرصيف، سعة الساحة، تعرفة التخزين، تقدير الإصلاح، مؤشرات الأداء…`))}</p></div></a></div>
      ${PT.P.events.length ? `<div class="section-title"><h2>🕘 ${t(L('Recent activity', 'النشاط الأخير'))}</h2></div><div class="card"><ul class="timeline">${PT.P.events.slice(0, 6).map((e) => `<li class="done"><b>${esc(e.label || e.id)}</b> — ${e.xp}${e.kind === 'drills' ? '' : '/100'} <small class="muted">${new Date(e.at).toLocaleString(TS.lang === 'ar' ? 'ar-LB-u-nu-latn' : 'en-GB')}</small></li>`).join('')}</ul></div>` : ''}`;
  }

  /* ---------------------------------------------------------- career path */
  function vPath(main) {
    const ri = PT.rankIndex(), x = PT.xp(), ex = PT.examsPassed();
    const plan = [
      [L('Weeks 1–2', 'الأسبوعان 1–2'), L('Level 1 lessons + glossary daily (10 terms/day). Drills: TEU, check digit, VGM. Pass Level 1 exam.', 'دروس المستوى 1 + المعجم يوميًا (10 مصطلحات/يوم). التمارين: TEU، رقم التحقّق، VGM. اجتز امتحان المستوى 1.')],
      [L('Weeks 3–5', 'الأسابيع 3–5'), L('Level 2 lessons. Berth planner and crane split simulators until score ≥ 85. Cases: early arrival, deep draft, crane breakdown, overstow.', 'دروس المستوى 2. محاكيا مخطّط الأرصفة وتوزيع الرافعات حتى نتيجة ≥ 85. الحالات: الوصول المبكر، الغاطس العميق، عطل الرافعة، الحجب.')],
      [L('Weeks 6–8', 'الأسابيع 6–8'), L('Level 3 lessons. Yard stacking (≤ 2 rehandles) and gate desk (≥ 90). Cases: reefer alarm, DG leak, yard congestion, VGM cut-off, gate queue.', 'دروس المستوى 3. رصّ الساحة (≤ 2 إعادة مناولة) ومكتب البوابة (≥ 90). الحالات: إنذار المبرّدة، تسرّب الخطرة، ازدحام الساحة، موعد VGM، طابور البوابة.')],
      [L('Weeks 9–10', 'الأسابيع 9–10'), L('Level 4 lessons. Depot survey (≥ 90). Cases: empty shortage, damage dispute. Drills: storage tiers, EOR, days of cover.', 'دروس المستوى 4. فحص المستودع (≥ 90). الحالات: عجز الفارغ، نزاع الأضرار. التمارين: شرائح التخزين، تقدير الإصلاح، أيام التغطية.')],
      [L('Weeks 11–12', 'الأسابيع 11–12'), L('Level 5 lessons. Control room shifts until you finish with all meters ≥ 70. Cases: storm, ransomware, labour, security, negotiation. Pass the final exam.', 'دروس المستوى 5. ورديات غرفة التحكّم حتى تنهي بكل المؤشرات ≥ 70. الحالات: العاصفة، برنامج الفدية، العمالة، الأمن، التفاوض. اجتز الامتحان النهائي.')],
      [L('On the job', 'في العمل'), L('Shadow a planner, then a duty manager. Keep a decision journal: situation, options, decision, result. Review it monthly with a mentor.', 'رافِق مخطّطًا ثم مديرًا مناوبًا. احتفظ بدفتر قرارات: الموقف، الخيارات، القرار، النتيجة. راجعه شهريًا مع مرشد.')],
    ];
    main.innerHTML = head(L('Career path', 'المسار المهني'), L('From trainee to senior port operations manager', 'من متدرّب إلى مدير عمليات ميناء أول'), L('Earn XP from lessons (30), cases & simulators (up to 100 each, best score), exercises (5 per correct answer) and exams (250). Higher ranks also need level exams.', 'اكسب نقاط XP من الدروس (30)، الحالات والمحاكيات (حتى 100 لكلّ منها، أفضل نتيجة)، التمارين (5 لكل إجابة صحيحة) والامتحانات (250). الرتب الأعلى تحتاج أيضًا امتحانات المستويات.')) +
      `<div class="grid c2" style="align-items:start"><div class="ladder">${PT.ranks.map((r, i) => `<div class="rung ${i < ri ? 'done' : i === ri ? 'cur' : ''}"><span class="n">${i < ri ? '✓' : r.icon}</span><div class="x"><b>${t(r.t)}</b><small>${t(r.d)}</small><small class="muted">${TS.num(r.xp, 0)} XP${r.exams ? ' · ' + r.exams + ' ' + t(L('exams', 'امتحانات')) : ''}</small></div>${i === ri ? `<span class="badge bad">${t(L('You', 'أنت'))}</span>` : ''}</div>`).join('')}</div>
      <div><div class="card"><h3>📅 ${t(L('Suggested 12-week programme', 'برنامج مقترح لـ 12 أسبوعًا'))}</h3><ul class="timeline">${plan.map((p, i) => `<li class="${i < ex ? 'done' : ''}"><b>${t(p[0])}</b><br>${t(p[1])}</li>`).join('')}</ul></div>
      <div class="card"><h3>🧠 ${t(L('What makes a senior', 'ما الذي يصنع المحترف'))}</h3><ul class="keys">
        <li>${t(L('Thinks in systems: berth ↔ yard ↔ gate ↔ depot.', 'يفكّر كمنظومة: الرصيف ↔ الساحة ↔ البوابة ↔ المستودع.'))}</li>
        <li>${t(L('Looks 24–72 h ahead with leading indicators.', 'ينظر 24–72 ساعة للأمام بالمؤشرات الاستباقية.'))}</li>
        <li>${t(L('Never trades safety for productivity.', 'لا يقايض السلامة بالإنتاجية أبدًا.'))}</li>
        <li>${t(L('Communicates early, factually, with a plan.', 'يتواصل مبكرًا وبواقعية ومع خطة.'))}</li>
        <li>${t(L('Decides with numbers: moves, hours, TEU, USD.', 'يقرّر بالأرقام: الحركات، الساعات، TEU، الدولار.'))}</li>
        <li>${t(L('Builds people and processes, not heroics.', 'يبني الأشخاص والعمليات لا البطولات الفردية.'))}</li></ul>
        <p class="muted" style="margin-top:10px">${TS.num(x, 0)} XP · ${ex}/5 ${t(L('exams passed', 'امتحانات ناجحة'))}</p></div></div></div>`;
  }

  /* ---------------------------------------------------------- port profile */
  function vPort(main) {
    const p = PT.port;
    main.innerHTML = head(L('Our virtual port', 'ميناؤنا الافتراضي'), p.name, p.intro) + portMap() +
      `<div class="grid c2" style="margin-top:16px;align-items:start">
        <div class="card"><h3>🛳 ${t(L('Berths', 'الأرصفة'))}</h3><div class="table-wrap"><table><thead><tr><th>ID</th><th class="num">${t(L('Length', 'الطول'))}</th><th class="num">${t(L('Depth', 'العمق'))}</th><th class="num">STS</th><th>${t(L('Use', 'الاستخدام'))}</th></tr></thead><tbody>${p.berths.map((b) => `<tr><td><b>${b.id}</b></td><td class="num">${b.len} m</td><td class="num">${b.draft} m</td><td class="num">${b.cranes}</td><td>${t(b.note)}</td></tr>`).join('')}</tbody></table></div><p class="muted">${t(p.channel.note)}</p></div>
        <div class="card"><h3>🧱 ${t(L('Yard blocks', 'كتل الساحة'))}</h3><div class="table-wrap"><table><thead><tr><th>${t(L('Block', 'الكتلة'))}</th><th>${t(L('Use', 'الاستخدام'))}</th><th class="num">TGS</th><th class="num">${t(L('Tiers', 'الطبقات'))}</th><th class="num">${t(L('Nominal TEU', 'TEU الاسمية'))}</th></tr></thead><tbody>${p.yard.map((b) => `<tr><td><b>${b.id}</b></td><td>${t(b.use)}</td><td class="num">${b.tgs}</td><td class="num">${b.tiers}</td><td class="num">${TS.num(b.tgs * b.tiers, 0)}</td></tr>`).join('')}<tr class="total"><td colspan="4">${t(L('Total', 'المجموع'))}</td><td class="num">${TS.num(p.yard.reduce((a, b) => a + b.tgs * b.tiers, 0), 0)}</td></tr></tbody></table></div></div>
        <div class="card"><h3>🚧 ${t(L('Gate', 'البوابة'))}</h3><p>${t(p.gate)}</p><h3>🏭 ${t(L('Depot', 'المستودع'))}</h3><p>${t(p.depot)}</p></div>
        <div class="card"><h3>🤝 ${t(L('Shipping lines (fictional)', 'الخطوط الملاحية (افتراضية)'))}</h3><ul class="keys">${p.lines.map((l) => `<li>${esc(l)}</li>`).join('')}</ul></div></div>
      <div class="note warn">${t(L('All companies, vessels and figures are fictional training data. Real terminals differ by size, equipment, contracts and local regulation.', 'كل الشركات والسفن والأرقام بيانات تدريبية افتراضية. المحطات الحقيقية تختلف بالحجم والمعدّات والعقود والأنظمة المحلية.'))}</div>`;
  }

  /* ---------------------------------------------------------- academy */
  function vAcademy(main) {
    main.innerHTML = head(L('Academy', 'الأكاديمية'), L('26 lessons in 5 levels', '26 درسًا في 5 مستويات'), L('Each lesson: theory, formulas, worked examples, a senior tip and a quiz. A lesson is complete when you pass its quiz (≥ 75%).', 'كل درس: نظرية، معادلات، أمثلة محلولة، نصيحة محترف واختبار. يكتمل الدرس عند اجتياز اختباره (≥ 75%).')) +
      PT.levels.map((lv) => `<div class="section-title"><h2>${lv.icon} ${t(L('Level', 'المستوى'))} ${lv.n} — ${t(lv.title)}</h2>${ring(levelProgress(lv.n))}</div>
        <div class="grid c3">${lessonsOf(lv.n).map((l) => `<a class="link-card" href="#/lesson/${l.id}"><div class="mod"><div class="top"><div class="em">${l.icon}</div><h3>${t(l.title)}</h3></div><p>${t(l.sub)}</p><div class="foot">${lvlBadge(l.lvl)}<span class="badge">⏱ ${l.min} min</span>${lessonDone(l.id) ? `<span class="badge ok">✓ ${t(L('Done', 'منجز'))}</span>` : ''}</div></div></a>`).join('')}
        <a class="link-card" href="#/exam/${lv.n}"><div class="mod" style="border-style:dashed"><div class="top"><div class="em">🎓</div><h3>${t(L('Level exam', 'امتحان المستوى'))} ${lv.n}</h3></div><p>${t(L('10 questions, pass mark 80%. Unlocks when all lessons of this level are done.', '10 أسئلة، علامة النجاح 80%. يُفتح عند إنجاز كل دروس هذا المستوى.'))}</p><div class="foot">${PT.P.exams[lv.n] && PT.P.exams[lv.n].passed ? `<span class="badge ok">✓ ${t(L('Passed', 'ناجح'))}</span>` : ''}</div></div></a></div>`).join('');
  }

  function quizBlock(el, qs, key, onPass, passPct) {
    const st = { ans: {}, checked: false };
    const draw = () => {
      el.innerHTML = qs.map((q, i) => {
        const a = st.ans[i];
        return `<div class="q"><div class="qt">${i + 1}. ${t(q.q)}</div>${q.o.map((o, k) => {
          let cls = a === k ? 'sel' : '';
          if (st.checked) { if (k === q.a) cls = 'good'; else if (a === k) cls = 'bad'; }
          return `<label class="opt ${cls}" ${st.checked ? 'aria-disabled="true"' : ''}><input type="radio" name="${key}${i}" value="${k}" ${a === k ? 'checked' : ''} ${st.checked ? 'disabled' : ''}><span>${t(o)}</span></label>`;
        }).join('')}${st.checked && q.e ? `<div class="fbk">💡 ${t(q.e)}</div>` : ''}</div>`;
      }).join('') + `<div class="row">${st.checked ? `<button class="btn" data-act="retry">${t(L('Try again', 'حاول مجددًا'))}</button>` : `<button class="btn red" data-act="check">${t(L('Check answers', 'تحقّق من الإجابات'))}</button>`}<span data-res></span></div>`;
      $$('input[type=radio]', el).forEach((r) => (r.onchange = () => { st.ans[Number(r.name.slice(key.length))] = Number(r.value); draw(); }));
      const c = $('[data-act=check]', el), rt = $('[data-act=retry]', el);
      if (c) c.onclick = () => {
        if (Object.keys(st.ans).length < qs.length) { TS.toast(t(L('Answer all questions', 'أجب عن كل الأسئلة')), 'bad'); return; }
        st.checked = true; const ok = qs.filter((q, i) => st.ans[i] === q.a).length, pct = Math.round(ok / qs.length * 100);
        draw(); $('[data-res]', el).innerHTML = `<b>${ok}/${qs.length} (${pct}%)</b> ${pct >= passPct ? `<span class="badge ok">✓ ${t(L('Passed', 'ناجح'))}</span>` : `<span class="badge bad">${t(L('Need', 'تحتاج'))} ${passPct}%</span>`}`;
        onPass(pct);
      };
      if (rt) rt.onclick = () => { st.ans = {}; st.checked = false; draw(); };
    };
    draw();
  }

  function vLesson(main, id) {
    const l = PT.lessons.find((x) => x.id === id); if (!l) return vAcademy(main);
    const all = PT.lessons, i = all.indexOf(l), prev = all[i - 1], next = all[i + 1];
    main.innerHTML = `<div class="ph"><div class="t"><div class="eyebrow">${l.icon} ${t(L('Lesson', 'درس'))} ${i + 1}/${all.length} · ${t(lvlOf(l.lvl).title)}</div><h1>${t(l.title)}</h1><p>${t(l.sub)}</p></div></div>
      <div class="reader"><div><div class="card lesson-body">${t(l.body)}<div class="senior"><strong>🎖 ${t(L('Senior tip', 'نصيحة المحترف'))}</strong>${t(l.senior)}</div></div>
        <div class="card"><h2>❓ ${t(L('Lesson quiz', 'اختبار الدرس'))}</h2><div id="lq"></div></div>
        <div class="row" style="justify-content:space-between">${prev ? `<a class="btn" href="#/lesson/${prev.id}">← ${t(prev.title)}</a>` : '<span></span>'}${next ? `<a class="btn primary" href="#/lesson/${next.id}">${t(next.title)} →</a>` : ''}</div></div>
      <aside class="aside"><div class="card"><h3>🔑 ${t(L('Key points', 'النقاط الرئيسية'))}</h3><ul class="keys">${l.keys.map((k) => `<li>${t(k)}</li>`).join('')}</ul></div>
        <div class="card soft"><div class="row">${lvlBadge(l.lvl)}<span class="badge">⏱ ${l.min} min</span></div><p style="margin-top:10px">${lessonDone(l.id) ? `<span class="badge ok">✓ ${t(L('Completed', 'مكتمل'))}</span>` : t(L('Pass the quiz (≥ 75%) to complete this lesson and earn 30 XP.', 'اجتز الاختبار (≥ 75%) لإكمال الدرس وكسب 30 XP.'))}</p>
        ${PT.cases.filter((c) => c.lvl === l.lvl).slice(0, 2).map((c) => `<a class="btn sm" style="margin-top:6px;width:100%" href="#/case/${c.id}">${c.icon} ${t(L('Practise', 'تدرّب'))}: ${t(c.title)}</a>`).join('')}</div></aside></div>`;
    quizBlock($('#lq', main), l.quiz, 'lq', (pct) => {
      if (pct >= 75 && !lessonDone(l.id)) {
        const before = PT.rankIndex();
        PT.P.lessons[l.id] = { done: true, at: new Date().toISOString(), quiz: pct };
        PT.logEvent('lessons', l.id, pct, t(l.title)); PT.save();
        TS.toast('✓ ' + t(L('Lesson completed +30 XP', 'اكتمل الدرس +30 XP')), 'ok'); rankUp(before); renderSide();
      }
    }, 75);
  }

  /* ---------------------------------------------------------- glossary */
  function vGlossary(main) {
    main.innerHTML = head(L('Glossary', 'المعجم'), L('Port & terminal vocabulary — English / Arabic', 'مصطلحات الموانئ والمحطات — إنجليزي / عربي'), L(`${PT.glossary.length} terms. Learn 10 a day: in 9 days you speak the language of the quay.`, `${PT.glossary.length} مصطلحًا. تعلّم 10 يوميًا: خلال 9 أيام ستتكلّم لغة الرصيف.`)) +
      `<input type="text" class="searchbox" id="gq" placeholder="${t(L('Search… (e.g. VGM, غاطس)', 'ابحث… (مثلًا VGM، غاطس)'))}"><div class="table-wrap"><table><thead><tr><th>English</th><th>العربية</th><th>${t(L('Meaning', 'المعنى'))}</th></tr></thead><tbody id="gb"></tbody></table></div>`;
    const draw = (q) => { const s = TS.norm(q || ''); $('#gb', main).innerHTML = PT.glossary.filter((g) => !s || TS.norm(g.term + ' ' + g.ar + ' ' + g.d.en + ' ' + g.d.ar).includes(s)).map((g) => `<tr><td><b>${esc(g.term)}</b></td><td dir="rtl">${esc(g.ar)}</td><td>${esc(t(g.d))}</td></tr>`).join(''); };
    $('#gq', main).oninput = (e) => draw(e.target.value); draw('');
  }

  /* ---------------------------------------------------------- cases */
  const grade = (s) => (s >= 90 ? 'A' : s >= 75 ? 'B' : s >= 55 ? 'C' : 'D');
  function vCases(main) {
    main.innerHTML = head(L('Virtual cases', 'الحالات الافتراضية'), L('Real-life situations. You decide.', 'مواقف من الواقع. أنت تقرّر.'), L('Each case puts you in a role (planner, duty manager, depot manager…) with live data. Every decision is scored like a senior would judge it, with an explanation.', 'كل حالة تضعك في دور (مخطّط، مدير مناوب، مدير مستودع…) مع بيانات حيّة. كل قرار يُقيَّم كما يقيّمه محترف، مع شرح.')) +
      `<div class="grid c3">${PT.cases.map((c) => { const r = PT.P.cases[c.id]; return `<a class="link-card" href="#/case/${c.id}"><div class="mod"><div class="top"><div class="em">${c.icon}</div><h3>${t(c.title)}</h3></div><p>${t(c.role)} — ${t(c.brief).slice(0, 120)}…</p><div class="foot">${lvlBadge(c.lvl)}<span class="badge">${c.stages.length} ${t(L('decisions', 'قرارات'))}</span>${r ? `<span class="grade ${grade(r.best)}" style="font-size:.8rem;padding:1px 8px">${grade(r.best)} · ${r.best}</span>` : ''}</div></div></a>`; }).join('')}</div>`;
  }
  function vCase(main, id) {
    const c = PT.cases.find((x) => x.id === id); if (!c) return vCases(main);
    let stage = 0, pts = 0, picked = null; const hist = [];
    const draw = () => {
      const st = c.stages[stage];
      const dots = `<div class="stage-dots">${c.stages.map((_, k) => `<i class="${k < stage ? 'done' : k === stage ? 'cur' : ''}"></i>`).join('')}</div>`;
      let body;
      if (!st) {
        const score = Math.round(pts / (c.stages.length * 10) * 100);
        body = `<div class="card fade-in"><div class="row"><div class="score-big">${score}</div><span class="grade ${grade(score)}">${grade(score)}</span></div>
          <ul class="timeline" style="margin-top:14px">${hist.map((h) => `<li class="${h.s === 10 ? 'done' : h.s ? '' : 'late'}">${t(h.l)}<br><small>${t(h.f)}</small></li>`).join('')}</ul>
          <div class="senior"><strong>🎖 ${t(L('Debrief', 'الخلاصة'))}</strong>${t(c.debrief)}</div>
          <div class="row"><button class="btn red" id="again">${t(L('Replay case', 'أعد الحالة'))}</button><a class="btn" href="#/cases">${t(L('All cases', 'كل الحالات'))}</a></div></div>`;
        if (!hist.recorded) { hist.recorded = true; award('cases', c.id, score, t(c.title)); }
      } else {
        body = `<div class="card fade-in"><div class="eyebrow" style="color:var(--red);font-weight:700;font-size:.74rem;letter-spacing:.1em">${t(L('Decision', 'القرار'))} ${stage + 1}/${c.stages.length}</div><p style="font-size:1.05rem;font-weight:600;margin-top:6px">${t(st.t)}</p>
          ${st.opts.map((o, k) => { let cls = ''; if (picked != null) { cls = o.s === 10 ? 'good' : o.s ? 'mid' : 'bad'; if (picked !== k && o.s !== 10) cls = ''; } return `<button class="opt ${cls}" style="width:100%;text-align:start;font:inherit" data-k="${k}" ${picked != null ? 'disabled' : ''}><span>${t(o.l)}${picked != null && (picked === k || o.s === 10) ? `<div class="fbk"><b>${o.s}/10</b> — ${t(o.f)}</div>` : ''}</span></button>`; }).join('')}
          ${picked != null ? `<button class="btn red" id="nextSt">${stage + 1 < c.stages.length ? t(L('Next decision', 'القرار التالي')) : t(L('See result', 'شاهد النتيجة'))} →</button>` : ''}</div>`;
      }
      main.innerHTML = `${head(L('Virtual case', 'حالة افتراضية'), c.title, null, lvlBadge(c.lvl))}
        <div class="case-grid"><div><div class="brief"><span class="role">${t(L('Your role', 'دورك'))}: ${t(c.role)}</span><p>${t(c.brief)}</p></div>${dots}${body}</div>
        <aside><div class="card"><h3>📟 ${t(L('Data', 'البيانات'))}</h3>${c.data ? `<div class="radio-msg">${esc(t(c.data))}</div>` : `<p class="muted">${t(L('All data is in the briefing.', 'كل البيانات في الإحاطة.'))}</p>`}<p class="muted">${t(L('Score', 'النتيجة'))}: <b>${pts}</b> / ${c.stages.length * 10}</p></div>
        <div class="card soft"><h3>🧠 ${t(L('Think like a senior', 'فكّر كمحترف'))}</h3><ul class="keys"><li>${t(L('Safety first, always.', 'السلامة أولًا، دائمًا.'))}</li><li>${t(L('Check hard constraints before options.', 'تحقّق من القيود الصارمة قبل الخيارات.'))}</li><li>${t(L('Who owns the decision?', 'من يملك القرار؟'))}</li><li>${t(L('Communicate early with a plan.', 'تواصل مبكرًا مع خطة.'))}</li></ul></div></aside></div>`;
      $$('[data-k]', main).forEach((b) => (b.onclick = () => { picked = Number(b.dataset.k); const o = st.opts[picked]; pts += o.s; hist.push(o); draw(); }));
      const nb = $('#nextSt', main); if (nb) nb.onclick = () => { stage++; picked = null; draw(); };
      const ag = $('#again', main); if (ag) ag.onclick = () => vCase(main, id);
    };
    draw();
  }

  /* ---------------------------------------------------------- simulators */
  function vSims(main) {
    main.innerHTML = head(L('Simulators', 'المحاكيات'), L('Hands-on terminal operations', 'عمليات المحطة بالممارسة'), L('Every run generates a new situation. Your best score counts toward your rank.', 'كل تشغيل يولّد موقفًا جديدًا. أفضل نتيجة لك تُحتسب في رتبتك.')) +
      `<div class="grid c3">${PT.sims.map((s) => { const r = PT.P.sims[s.id]; return `<a class="link-card" href="#/sim/${s.id}"><div class="mod"><div class="top"><div class="em">${s.icon}</div><h3>${t(s.title)}</h3></div><p>${t(s.desc)}</p><div class="foot">${lvlBadge(s.lvl)}${r ? `<span class="badge ok">${t(L('Best', 'الأفضل'))} ${r.best}</span><span class="badge">${r.runs} ${t(L('runs', 'محاولات'))}</span>` : `<span class="badge info">${t(L('Not played', 'لم تُلعب'))}</span>`}</div></div></a>`; }).join('')}</div>`;
  }
  function vSim(main, id) {
    const s = PT.sims.find((x) => x.id === id); if (!s) return vSims(main);
    const r = PT.P.sims[s.id];
    main.innerHTML = head(L('Simulator', 'المحاكي'), s.title, s.desc, `<div class="row">${lvlBadge(s.lvl)}${r ? `<span class="badge ok">${t(L('Best', 'الأفضل'))} ${r.best}</span>` : ''}</div>`) + `<div id="simBox"></div>`;
    s.mount($('#simBox', main), { done: (score) => award('sims', s.id, score, t(s.title)) });
  }

  /* ---------------------------------------------------------- drills */
  let drillTopic = 'mix', drillCur = null, streak = 0;
  function vDrills(main) {
    const topics = [{ id: 'mix', icon: '🎲', title: L('Mixed', 'مختلط') }].concat(PT.drills);
    const newQ = () => { const g = drillTopic === 'mix' ? PT.pick(PT.drills) : PT.drills.find((d) => d.id === drillTopic); drillCur = Object.assign({ topic: g.id, tTitle: g.title, lvl: g.lvl }, g.gen()); drillCur.answered = false; };
    if (!drillCur || (drillTopic !== 'mix' && drillCur.topic !== drillTopic)) newQ();
    const draw = () => {
      const d = PT.P.drills[drillCur.topic] || { c: 0, n: 0 };
      main.innerHTML = head(L('Exercises', 'التمارين'), L('Unlimited calculation drills', 'تمارين حسابية غير محدودة'), L('New numbers every time, with the full solution. +5 XP per correct answer.', 'أرقام جديدة كل مرة مع الحل الكامل. +5 XP لكل إجابة صحيحة.')) +
        `<div class="chips" style="margin-bottom:16px">${topics.map((tp) => { const st = PT.P.drills[tp.id]; return `<button class="chip ${drillTopic === tp.id ? 'on' : ''}" data-tp="${tp.id}">${tp.icon} ${t(tp.title)}${st ? ` <small>${st.c}/${st.n}</small>` : ''}</button>`; }).join('')}</div>
        <div class="card"><div class="row" style="justify-content:space-between"><span>${lvlBadge(drillCur.lvl)} <b style="margin-inline-start:6px">${t(drillCur.tTitle)}</b></span><span>🔥 <span class="streak">${streak}</span> · ${t(L('topic', 'الموضوع'))} ${d.c}/${d.n}</span></div>
          <div class="drill-q" style="margin-top:12px">${t(drillCur.q)}</div>
          <div class="drill-ans"><input type="number" step="any" id="dAns" placeholder="${t(L('Your answer', 'إجابتك'))}" ${drillCur.answered ? 'disabled' : ''}> <span class="muted">${esc(t(drillCur.unit) || '')}</span>
            ${drillCur.answered ? `<button class="btn red" id="dNext">${t(L('Next exercise', 'التمرين التالي'))} →</button>` : `<button class="btn red" id="dChk">${t(L('Check', 'تحقّق'))}</button><button class="btn ghost" id="dShow">${t(L('Show solution', 'اعرض الحل'))}</button>`}</div>
          <div id="dFb">${drillCur.fb || ''}</div></div>`;
      $$('[data-tp]', main).forEach((b) => (b.onclick = () => { drillTopic = b.dataset.tp; newQ(); draw(); }));
      const inp = $('#dAns', main); if (inp && !drillCur.answered) { inp.focus(); inp.onkeydown = (e) => { if (e.key === 'Enter') $('#dChk', main).click(); }; }
      const rec = (ok) => { const box = (PT.P.drills[drillCur.topic] = PT.P.drills[drillCur.topic] || { c: 0, n: 0 }); const before = PT.rankIndex(); box.n++; if (ok) { box.c++; PT.logEvent('drills', drillCur.topic, 5, t(drillCur.tTitle)); } PT.save(); rankUp(before); };
      const finish = (ok, shown) => {
        drillCur.answered = true; streak = ok ? streak + 1 : 0;
        drillCur.fb = `<div class="note ${ok ? 'ok' : 'bad'} fade-in"><strong>${ok ? '✓ ' + t(L('Correct! +5 XP', 'صحيح! +5 XP')) : shown ? t(L('Solution', 'الحل')) : '✗ ' + t(L('Not quite — correct answer: ', 'ليس تمامًا — الإجابة الصحيحة: ')) + TS.num(drillCur.a, 2)}</strong></div><div class="sol">${esc(t(drillCur.sol))}</div>`;
        rec(ok); draw();
      };
      const c = $('#dChk', main); if (c) c.onclick = () => { if (inp.value === '') return; const v = Number(inp.value); finish(Math.abs(v - drillCur.a) <= (drillCur.tol || 0) + 1e-9, false); };
      const sh = $('#dShow', main); if (sh) sh.onclick = () => finish(false, true);
      const nx = $('#dNext', main); if (nx) nx.onclick = () => { newQ(); draw(); };
    };
    draw();
  }

  /* ---------------------------------------------------------- exams */
  const examUnlocked = (n) => lessonsOf(n).every((l) => lessonDone(l.id));
  function vExams(main) {
    main.innerHTML = head(L('Level exams', 'امتحانات المستويات'), L('Certify each level', 'احصل على شهادة كل مستوى'), L('10 random questions from the level’s lessons and the exam bank. Pass mark 80%. Each pass gives 250 XP and a printable certificate.', '10 أسئلة عشوائية من دروس المستوى وبنك الامتحانات. علامة النجاح 80%. كل نجاح يمنح 250 XP وشهادة قابلة للطباعة.')) +
      `<div class="grid c3">${PT.levels.map((lv) => { const e = PT.P.exams[lv.n], un = examUnlocked(lv.n); return `<div class="mod"><div class="top"><div class="em">${lv.icon}</div><div><span class="lvl l${lv.n}">${t(L('Level', 'المستوى'))} ${lv.n}</span><h3 style="margin-top:4px">${t(lv.title)}</h3></div></div><p>${t(lv.sub)}</p>
        <div class="foot">${e ? `<span class="badge ${e.passed ? 'ok' : 'warn'}">${t(L('Best', 'الأفضل'))} ${e.best}%</span>` : ''}
        ${un ? `<a class="btn sm red" href="#/exam/${lv.n}">${t(L('Start exam', 'ابدأ الامتحان'))}</a>` : `<span class="badge">🔒 ${t(L('Finish the level lessons', 'أنهِ دروس المستوى'))} (${lessonsOf(lv.n).filter((l) => lessonDone(l.id)).length}/${lessonsOf(lv.n).length})</span>`}
        ${e && e.passed ? `<a class="btn sm" href="#/cert/${lv.n}">📜 ${t(L('Certificate', 'الشهادة'))}</a>` : ''}</div></div>`; }).join('')}</div>`;
  }
  function vExam(main, a) {
    const n = Number(a), lv = lvlOf(n); if (!lv) return vExams(main);
    if (!examUnlocked(n)) {
      main.innerHTML = head(L('Level exam', 'امتحان المستوى'), lv.title, L('Locked — complete all lessons of this level first.', 'مقفل — أكمل كل دروس هذا المستوى أولًا.')) + `<a class="btn primary" href="#/academy">${t(L('Go to the academy', 'اذهب للأكاديمية'))}</a>`;
      return;
    }
    const pool = lessonsOf(n).flatMap((l) => l.quiz).concat(PT.examBank.filter((q) => q.lvl === n));
    const qs = PT.shuffle(pool).slice(0, 10);
    main.innerHTML = head(L('Level exam', 'امتحان المستوى'), L(`Level ${n} — ${lv.title.en}`, `المستوى ${n} — ${lv.title.ar}`), L('Answer all 10 questions. Pass mark: 80%.', 'أجب عن الأسئلة العشرة. علامة النجاح: 80%.')) + `<div class="card"><div id="ex"></div></div><div id="exOut"></div>`;
    let done = false;
    quizBlock($('#ex', main), qs, 'ex', (pct) => {
      if (done) return; done = true;
      const prev = PT.P.exams[n] || {}, before = PT.rankIndex();
      PT.P.exams[n] = { best: Math.max(prev.best || 0, pct), passed: !!prev.passed || pct >= 80, at: pct >= 80 && !prev.passed ? new Date().toISOString() : prev.at };
      PT.logEvent('exams', 'L' + n, pct, t(L('Level ' + n + ' exam', 'امتحان المستوى ' + n))); PT.save(); rankUp(before); renderSide();
      $('#exOut', main).innerHTML = pct >= 80 ? `<div class="note ok fade-in"><strong>🎓 ${t(L('Congratulations — level certified! +250 XP', 'تهانينا — حصلت على شهادة المستوى! +250 XP'))}</strong><a class="btn sm primary" href="#/cert/${n}">📜 ${t(L('Open certificate', 'افتح الشهادة'))}</a></div>` : `<div class="note bad fade-in"><strong>${t(L('Not yet', 'ليس بعد'))}</strong>${t(L('Review the explanations, re-read the lessons and try again — questions are reshuffled.', 'راجع الشروحات وأعد قراءة الدروس وحاول مجددًا — الأسئلة يُعاد خلطها.'))} <a class="btn sm" href="#/exam/${n}">${t(L('Retake', 'أعد الامتحان'))}</a></div>`;
    }, 80);
  }
  function vCert(main, a) {
    const n = Number(a), lv = lvlOf(n), e = PT.P.exams[n];
    if (!lv || !e || !e.passed) return vExams(main);
    const name = PT.P.name || t(L('Trainee', 'المتدرّب'));
    main.innerHTML = `<div class="cert"><div style="font-size:2.4rem">⚓</div><h1>${t(L('Certificate of Achievement', 'شهادة إنجاز'))}</h1><p>${t(L('This certifies that', 'نشهد بأن'))}</p><div class="nm">${esc(name)}</div>
      <p>${t(L('has successfully completed', 'قد أتمّ بنجاح'))}<br><b style="font-size:1.25rem;color:#04246a">${t(L('Level', 'المستوى'))} ${n} — ${t(lv.title)}</b><br>${t(lv.sub)}</p>
      <p>${t(L('Exam score', 'نتيجة الامتحان'))}: <b>${e.best}%</b> · ${e.at ? new Date(e.at).toLocaleDateString(TS.lang === 'ar' ? 'ar-LB-u-nu-latn' : 'en-GB') : ''}</p>
      <p style="margin-top:30px;color:#e30613;font-weight:700;letter-spacing:.1em">PORT MASTER ACADEMY</p><small style="color:#667">${t(L('Training certificate — virtual terminal CBCT', 'شهادة تدريبية — المحطة الافتراضية CBCT'))}</small></div>
      <div class="row no-print" style="justify-content:center;margin-top:16px"><button class="btn red" onclick="window.print()">🖨 ${t(L('Print / save PDF', 'طباعة / حفظ PDF'))}</button>${PT.P.name ? '' : `<a class="btn" href="#/profile">${t(L('Add your name', 'أضف اسمك'))}</a>`}</div>`;
  }

  /* ---------------------------------------------------------- profile */
  function vProfile(main) {
    const s = PT.stats();
    main.innerHTML = head(L('My progress', 'تقدّمي'), L('Profile & progress', 'الملف الشخصي والتقدّم'), L('Progress is saved in this browser. Export it to keep a backup or move to another computer.', 'التقدّم محفوظ في هذا المتصفح. صدّره لحفظ نسخة احتياطية أو للانتقال لجهاز آخر.')) +
      `<div class="grid c2" style="align-items:start"><div class="card"><div class="field"><label>${t(L('Your name (for certificates)', 'اسمك (للشهادات)'))}</label><input type="text" id="pn" value="${esc(PT.P.name)}"></div>
        <div class="row" style="margin-top:12px"><button class="btn primary" id="pSave">${t(L('Save', 'حفظ'))}</button><button class="btn" id="pExp">⬇ ${t(L('Export progress', 'تصدير التقدّم'))}</button><label class="btn">⬆ ${t(L('Import', 'استيراد'))}<input type="file" id="pImp" accept="application/json" hidden></label><button class="btn ghost" id="pRst" style="color:var(--bad)">${t(L('Reset all', 'إعادة تعيين الكل'))}</button></div></div>
        <div class="card"><h3>${t(L('Summary', 'الملخّص'))}</h3><dl class="kv"><dt>XP</dt><dd>${TS.num(s.xp, 0)}</dd><dt>${t(L('Rank', 'الرتبة'))}</dt><dd>${t(PT.ranks[PT.rankIndex()].t)}</dd><dt>${t(L('Lessons', 'الدروس'))}</dt><dd>${s.lessons}/${PT.lessons.length}</dd><dt>${t(L('Cases', 'الحالات'))}</dt><dd>${s.cases}/${PT.cases.length}</dd><dt>${t(L('Simulators', 'المحاكيات'))}</dt><dd>${s.sims}/${PT.sims.length}</dd><dt>${t(L('Exercises correct', 'تمارين صحيحة'))}</dt><dd>${s.drills.c}/${s.drills.n}</dd><dt>${t(L('Exams', 'الامتحانات'))}</dt><dd>${s.exams}/5</dd></dl></div></div>
      <div class="card"><h3>${t(L('Scores by activity', 'النتائج حسب النشاط'))}</h3><div class="table-wrap"><table><thead><tr><th>${t(L('Activity', 'النشاط'))}</th><th class="num">${t(L('Best', 'الأفضل'))}</th><th class="num">${t(L('Runs', 'المحاولات'))}</th></tr></thead><tbody>
        ${PT.cases.concat(PT.sims).filter((x) => PT.P.cases[x.id] || PT.P.sims[x.id]).map((x) => { const r = PT.P.cases[x.id] || PT.P.sims[x.id]; return `<tr><td>${x.icon} ${t(x.title)}</td><td class="num">${r.best}</td><td class="num">${r.runs}</td></tr>`; }).join('') || `<tr><td colspan="3" class="muted">${t(L('Nothing yet.', 'لا شيء بعد.'))}</td></tr>`}</tbody></table></div></div>`;
    $('#pSave', main).onclick = () => { PT.P.name = $('#pn', main).value.trim(); PT.save(); TS.toast(t(L('Saved', 'تم الحفظ')), 'ok'); render(); };
    $('#pExp', main).onclick = () => { const b = new Blob([JSON.stringify(PT.P, null, 2)], { type: 'application/json' }); const a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = 'port-master-progress.json'; document.body.appendChild(a); a.click(); a.remove(); };
    $('#pImp', main).onchange = (e) => { const f = e.target.files[0]; if (!f) return; const r = new FileReader(); r.onload = () => { try { const o = JSON.parse(r.result); if (!o || typeof o.lessons !== 'object') throw new Error(); PT.P = Object.assign(PT.P, o); PT.save(); TS.toast(t(L('Progress imported', 'تم استيراد التقدّم')), 'ok'); render(); } catch (err) { TS.toast(t(L('Invalid file', 'ملف غير صالح')), 'bad'); } }; r.readAsText(f); };
    $('#pRst', main).onclick = () => { if (confirm(t(L('Delete all progress?', 'حذف كل التقدّم؟')))) { PT.reset(); render(); } };
  }

  window.addEventListener('hashchange', render);
  document.addEventListener('ts:lang', () => { $('#app').innerHTML = ''; render(); });
  render();
})();
