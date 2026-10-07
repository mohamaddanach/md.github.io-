/* Operations & Pricing — application shell, generic task widgets, mail client, portal, documents, tools */
(function () {
  const L = TS.L, t = TS.t, esc = TS.esc;
  const OPS = window.OPS;
  const REF = TS.REF;
  const app = (OPS.app = { ship: null, view: 'home', tab: {}, mailBox: 'in', mailSel: null, doc: null, gq: '' });

  /* ======================= shipment lifecycle ======================= */
  OPS.newShipment = (sc) => {
    sc = typeof sc === 'string' ? OPS.CASES.find((c) => c.id === sc) : sc;
    const start = TS.todayISO();
    const year = start.slice(0, 4);
    let id, n = TS.store.list().length + 1;
    do { id = `${OPS.company.short}-${sc.id}${sc.code}-${year}-${String(n).padStart(3, '0')}`; n++; } while (TS.store.get(id));
    const ship = {
      schema: TS.SCHEMA, schemaVersion: 2,
      id, scenario: sc.code, caseId: sc.id, mode: sc.mode, direction: sc.direction, title: sc.title,
      createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
      status: 'open', currentDepartment: 'operations',
      company: OPS.company,
      sim: { start, today: start },
      case: TS.clone(sc),
      parties: { client: sc.client, clientRole: sc.clientRole, shipper: sc.shipper, consignee: sc.consignee, notify: sc.notify, agent: sc.agent },
      jobFile: {}, rates: { requested: [], received: [], selected: null }, quotation: null, booking: null,
      equipment: null, exportCustoms: null, documents: {}, tracking: [], release: {}, importCustoms: null,
      delivery: {}, dd: {}, closing: {}, handoffs: {}, emails: [], milestones: [], steps: {}, work: {},
      score: { mistakes: 0, hints: 0 }, log: [], docsSeen: [],
    };
    OPS.steps[0].init && OPS.steps[0].init(ship);
    OPS.mail.plan(ship);
    TS.store.save(ship);
    TS.store.setCurrent(id);
    return ship;
  };
  OPS.legacy = (s) => !s || !s.case;
  OPS.stTitle = (st, s) => (typeof st.title === 'function' ? st.title(s || app.ship) : st.title);
  OPS.P = (st, s) => st.parts.filter((p) => !p.when || p.when(s || app.ship));
  /* quiz: lesson questions + generated micro-exercises, options shuffled — fixed per shipment once drawn */
  OPS.quizFor = (s, st) => {
    const w = W(s, st.id);
    if (!w.quiz.items) w.quiz.items = TS.quizBuild(st.quiz || [], st.drills || [], OPS.srng(s, 900 + OPS.steps.indexOf(st)), 5);
    return w.quiz.items;
  };

  function load() {
    const id = TS.store.currentId();
    app.ship = id ? TS.store.get(id) : null;
    if (app.ship && OPS.legacy(app.ship)) app.ship = null;
  }
  app.save = () => { if (app.ship) TS.store.save(app.ship); };
  app.mutate = (id, fn) => {
    if (app.ship && app.ship.id === id) { fn(app.ship); app.save(); app.render(); }
    else { const s = TS.store.get(id); if (s) { fn(s); TS.store.save(s); } }
  };

  /* ======================= step context ======================= */
  app.stepIndex = (id) => OPS.steps.findIndex((s) => s.id === id);
  app.stepDone = (ship, st) => !!(ship.steps[st.id] && ship.steps[st.id].done);
  app.stepUnlocked = (ship, st) => { const i = app.stepIndex(st.id); return i === 0 || OPS.steps.slice(0, i).every((s) => app.stepDone(ship, s)); };
  app.partsDone = (ship, st) => OPS.P(st, ship).filter((p) => ship.work[st.id] && ship.work[st.id].parts[p.id]).length;

  function W(ship, stepId) {
    ship.work[stepId] = ship.work[stepId] || { parts: {}, form: {}, data: {}, quiz: {} };
    return ship.work[stepId];
  }

  function email(ship, box, e) {
    const m = Object.assign({ id: TS.uid('MAIL'), box, date: ship.sim.today, time: new Date().toISOString(), read: box === 'out', attachments: [] }, e);
    ship.emails.push(m);
    return m;
  }
  OPS.emailPush = email;

  app.ctx = (st) => {
    const ship = app.ship;
    const w = W(ship, st.id);
    const ctx = {
      ship, sc: OPS.sc(ship), step: st, w, data: w.data,
      save: app.save, rerender: () => app.render(),
      mistake(n) { ship.score.mistakes += n || 1; w.mistakes = (w.mistakes || 0) + (n || 1); app.save(); },
      hint() { ship.score.hints += 1; w.hints = (w.hints || 0) + 1; app.save(); },
      finish(partId) {
        w.parts[partId] = true;
        ship.log.push({ at: new Date().toISOString(), sim: ship.sim.today, step: st.id, part: partId });
        app.checkStep(ship, st);
        app.save(); app.render();
      },
      send(e) { return email(ship, 'out', Object.assign({ from: OPS.company.email, step: st.id }, e)); },
      receive(e, delay) {
        const id = ship.id;
        const fire = () => app.mutate(id, (s) => {
          const m = email(s, 'in', Object.assign({ to: OPS.company.email, step: st.id }, e));
          if (e.onArrive) e.onArrive(s, m);
          delete m.onArrive;
          TS.toast('✉ ' + t(L('New email from ', 'بريد جديد من ')) + m.from, 'mail');
        });
        if (delay) setTimeout(fire, delay); else fire();
      },
      milestone(code, date, label) {
        ship.milestones = ship.milestones.filter((m) => m.code !== code);
        ship.milestones.push({ code, date, label });
        ship.milestones.sort((a, b) => a.date.localeCompare(b.date));
      },
      advance(date) { if (date && date > ship.sim.today) ship.sim.today = date; },
    };
    return ctx;
  };

  app.checkStep = (ship, st) => {
    const w = W(ship, st.id);
    const partsOk = OPS.P(st, ship).every((p) => w.parts[p.id]);
    const quizOk = !st.quiz || !st.quiz.length || w.quiz.passed;
    if (partsOk && quizOk && !app.stepDone(ship, st)) {
      ship.steps[st.id] = { done: true, at: new Date().toISOString(), sim: ship.sim.today };
      const i = app.stepIndex(st.id);
      ship.stage = OPS.steps[i + 1] ? OPS.steps[i + 1].id : 'closed';
      TS.toast('✓ ' + t(L('Step completed: ', 'تم إنجاز المرحلة: ')) + t(OPS.stTitle(st, ship)), 'ok');
      if (OPS.mail) OPS.mail.trigger(ship, st.id);
      if (TS.celebrate && !(TS.autopilot && TS.autopilot.running)) TS.celebrate();
    }
  };

  /* generic widgets live in shared/widgets.js */
  const ui = (OPS.ui = TS.ui);
  TS.ui.defaultFrom = OPS.company.email;

  /* ======================= rendering ======================= */
  const $ = (s, r) => (r || document).querySelector(s);

  function unread(ship) { return ship ? ship.emails.filter((e) => e.box === 'in' && !e.read).length : 0; }

  function topbar() {
    const list = TS.store.list();
    return `<header class="topbar">
      <a class="brand" href="../index.html"><span class="logo-mark">TS</span> Training Shipping <small>/ ${t(L('Operations & Pricing', 'العمليات والتسعير'))}</small></a>
      <span class="spacer"></span>
      ${list.filter((s) => !OPS.legacy(s)).length ? `<select id="shipSel" aria-label="Shipment">${list.filter((s) => !OPS.legacy(s)).map((s) => `<option value="${s.id}" ${app.ship && app.ship.id === s.id ? 'selected' : ''}>${s.id}</option>`).join('')}</select>` : ''}
      <button class="btn sm" data-go="home">👥 ${t(L('Clients', 'الزبائن'))}</button>
      ${TS.langSwitch()}
    </header>`;
  }

  function sidebar() {
    const ship = app.ship;
    const stepsHTML = ship ? OPS.steps.map((st, i) => {
      const done = app.stepDone(ship, st), un = app.stepUnlocked(ship, st);
      const active = app.view === 'step:' + st.id;
      return `<button class="nav-item ${done ? 'done' : ''} ${!un ? 'locked' : ''} ${active ? 'active' : ''}" data-go="step:${st.id}"><span class="dot">${done ? '✓' : i + 1}</span><span>${t(OPS.stTitle(st, ship))}</span>${!un ? '<span class="badge">🔒</span>' : ''}</button>`;
    }).join('') : '';
    const doneN = ship ? OPS.steps.filter((s) => app.stepDone(ship, s)).length : 0;
    const nav = (v, icon, l, extra) => `<button class="nav-item ${app.view === v ? 'active' : ''}" data-go="${v}"><span class="dot">${icon}</span><span>${t(l)}</span>${extra || ''}</button>`;
    const n = unread(ship), nr = OPS.mail ? OPS.mail.needs(ship) : 0;
    return `<aside class="side">
      ${ship ? `<div class="case-chip"><span class="badge ${ship.case.mode === 'LCL' ? 'lcl' : 'fcl'}">${ship.case.mode}</span><span class="badge ${ship.direction === 'import' ? 'info' : 'ok'}">${ship.direction === 'import' ? t(L('Import', 'استيراد')) : t(L('Export', 'تصدير'))}</span><b>${esc(ship.case.id)}</b> ${esc(ship.case.client.name)}</div><h4>${esc(ship.id)}</h4>
        <div class="progress"><i style="width:${Math.round((doneN / OPS.steps.length) * 100)}%"></i></div>
        <div class="muted" style="font-size:.8rem;margin:0 8px 6px">${doneN}/${OPS.steps.length} ${t(L('steps', 'مراحل'))}</div>
        <h4>${t(L('Process steps', 'مراحل العملية'))}</h4><div class="nav-group">${stepsHTML}</div>
        <h4>${t(L('Workspace', 'مساحة العمل'))}</h4><div class="nav-group">
        ${nav('dashboard', '📊', L('Shipment dashboard', 'لوحة الشحنة'))}
        ${nav('inbox', '✉', L('Email (virtual)', 'البريد (افتراضي)'), (nr ? `<span class="badge bad" title="needs reply">${nr}</span>` : '') + (n ? `<span class="badge n">${n}</span>` : ''))}
        ${nav('portal', '⛴', L('Carrier portal & bookings', 'بوابة الخطوط والحجوزات'))}
        ${nav('docs', '📄', L('Documents', 'المستندات'))}
        ${nav('json', '{ }', L('Shipment JSON file', 'ملف الشحنة JSON'))}</div>` : ''}
      <h4>${t(L('Learn', 'تعلّم'))}</h4><div class="nav-group">
      ${nav('drills', '🎯', L('Drills (endless practice)', 'تمارين (تدريب لا ينتهي)'))}
      ${nav('lebanon', '🇱🇧', L('Lebanon guide', 'دليل لبنان'))}
      ${nav('incoterms', 'IC', L('Incoterms 2020', 'إنكوترمز 2020'))}
      ${nav('equipment', '▭', L('Containers', 'الحاويات'))}
      ${nav('glossary', 'Aa', L('Glossary', 'المصطلحات'))}
      ${nav('tools', '∑', L('Calculators', 'الحاسبات'))}</div>
    </aside>`;
  }

  app.render = () => {
    TS.applyLang();
    const root = document.getElementById('app');
    const scrollY = window.scrollY;
    root.innerHTML = topbar() + `<div class="layout">${sidebar()}<main class="main" id="main"></main></div>`;
    const main = document.getElementById('main');
    const v = app.view;
    if (!app.ship && !['home', 'lebanon', 'incoterms', 'equipment', 'glossary', 'tools', 'drills'].includes(v)) app.view = 'home';
    try {
      if (app.view === 'home') viewHome(main);
      else if (app.view.startsWith('step:')) viewStep(main, app.view.slice(5));
      else if (app.view === 'inbox') OPS.mail.view(main);
      else if (app.view === 'drills') TS.drillsView(main, 'ops');
      else if (app.view === 'dashboard') OPS.viewDashboard(main);
      else if (app.view === 'portal') viewPortal(main);
      else if (app.view === 'docs') viewDocs(main);
      else if (app.view === 'json') viewJSON(main);
      else if (app.view === 'lebanon') viewLebanon(main);
      else if (app.view === 'incoterms') viewIncoterms(main);
      else if (app.view === 'equipment') viewEquipment(main);
      else if (app.view === 'glossary') viewGlossary(main);
      else if (app.view === 'tools') viewTools(main);
    } catch (err) {
      console.error(err);
      main.innerHTML = `<div class="note bad"><strong>Error</strong>${esc(err.message)}</div>`;
    }
    if (app.keepScroll) window.scrollTo(0, scrollY);
    app.keepScroll = true;
    bindGlobal(root);
    if (TS.decorateAll) TS.decorateAll(root);
    if (OPS.afterRender) OPS.afterRender();
    OPS.docAlerts();
  };

  /* ---------------- documents in a pop-up & "new document" alerts ---------------- */
  OPS.openDoc = (id) => {
    const s = app.ship; if (!s) return;
    const d = OPS.docs.get(s, id);
    if (!d) { TS.toast(t(L('Document not available yet', 'المستند غير متوفر بعد')), 'bad'); return; }
    s.docsSeen = s.docsSeen || []; if (!s.docsSeen.includes(id)) { s.docsSeen.push(id); app.save(); }
    TS.docModal(t(d.name), d.html(s));
    OPS.docAlerts();
  };
  OPS.docAlerts = () => {
    const s = app.ship;
    if (!s) { TS.docAlerts([]); return; }
    s.docsSeen = s.docsSeen || [];
    const fresh = OPS.docs.list(s).filter((d) => d.id !== 'timeline' && !s.docsSeen.includes(d.id));
    TS.docAlerts(fresh.map((d) => ({ id: d.id, name: t(d.name), open: () => OPS.openDoc(d.id), dismiss: () => { s.docsSeen.push(d.id); app.save(); OPS.docAlerts(); } })), () => { fresh.forEach((d) => s.docsSeen.push(d.id)); app.save(); OPS.docAlerts(); });
  };

  function go(v) {
    app.view = v; app.keepScroll = false;
    try { if (location.hash !== '#' + v) history.replaceState(null, '', '#' + v); } catch (e) { /* offline single-file frame */ }
    app.render(); window.scrollTo(0, 0);
  }
  app.go = go;

  function bindGlobal(root) {
    root.querySelectorAll('[data-go]').forEach((b) => (b.onclick = (e) => { e.preventDefault(); go(b.dataset.go); }));
    root.querySelectorAll('[data-doc-open]').forEach((b) => (b.onclick = (e) => { e.preventDefault(); e.stopPropagation(); OPS.openDoc(b.dataset.docOpen); }));
    const sel = $('#shipSel', root);
    if (sel) sel.onchange = () => { TS.store.setCurrent(sel.value); load(); go(app.ship.stage ? 'step:' + (app.ship.stage === 'closed' ? OPS.steps[OPS.steps.length - 1].id : app.ship.stage) : 'step:' + OPS.steps[0].id); };
  }

  /* ---------------- home: the client board ---------------- */
  const caseCard = (c, mine) => {
    const done = mine ? OPS.steps.filter((st) => mine.steps && mine.steps[st.id] && mine.steps[st.id].done).length : 0;
    const st = !mine ? 'new' : mine.status === 'closed' ? 'done' : 'open';
    return `<article class="ccard ${st}" data-case="${c.id}">
      <header><span class="cno">${esc(c.id.replace('C', '#'))}</span><span class="badge ${c.mode === 'LCL' ? 'lcl' : 'fcl'}">${c.mode}</span><span class="badge ${c.direction === 'import' ? 'info' : 'ok'}">${c.direction === 'import' ? t(L('Import', 'استيراد')) : t(L('Export', 'تصدير'))}</span><span class="badge">${esc(c.answer.incoterm)}</span><span class="tone">${esc(t(OPS.TONES[c.tone]))}</span></header>
      <h3>${esc(c.client.name)}</h3>
      <p class="who">${esc(c.client.contact)} · ${esc(c.client.area)}</p>
      <p class="what">${esc(t(L(c.cargo.commodity.split(' (')[0], c.cargo.commodityAr)))}<br><b>${esc(c.direction === 'import' ? c.far.city + ' → Beirut' : 'Beirut → ' + c.far.city)}</b> · ${c.cargo.packages} ${esc(c.cargo.pkgType)} · USD ${TS.num(c.cargo.value, 0)}</p>
      <p class="pay">💳 ${esc(t(c.payment))}</p>
      <footer>${mine ? `<div class="progress"><i style="width:${Math.round((done / OPS.steps.length) * 100)}%"></i></div><span class="muted">${done}/${OPS.steps.length}</span><button class="btn sm primary" data-open="${mine.id}">${st === 'done' ? '✓ ' + t(L('Review', 'مراجعة')) : t(L('Continue', 'تابع'))}</button>${st === 'done' ? `<button class="btn sm" data-new="${c.id}">↻ ${t(L('Again', 'مرة أخرى'))}</button>` : ''}` : `<button class="btn sm primary" data-new="${c.id}">${t(L('Take this client', 'استلم هذا الزبون'))} →</button>`}</footer>
    </article>`;
  };
  function viewHome(main) {
    const list = TS.store.list();
    const ok = list.filter((s) => !OPS.legacy(s)), old = list.filter((s) => OPS.legacy(s) && s.scenario);
    const mineOf = (c) => ok.filter((s) => s.caseId === c.id).sort((x, y) => String(y.updatedAt).localeCompare(String(x.updatedAt)))[0];
    const f = app.caseF || 'all';
    const pass = (c) => f === 'all' || (f === 'FCL' || f === 'LCL' ? c.mode === f : f === 'import' || f === 'export' ? c.direction === f : f === 'open' ? (mineOf(c) && mineOf(c).status !== 'closed') : f === 'done' ? (mineOf(c) && mineOf(c).status === 'closed') : !mineOf(c));
    const cases = OPS.CASES.filter(pass);
    const randoms = ok.filter((s) => s.case && s.case.no >= 100);
    const doneN = OPS.CASES.filter((c) => mineOf(c) && mineOf(c).status === 'closed').length;
    main.innerHTML = `
      ${OPS.homeKpis ? OPS.homeKpis() : ''}
      <section class="hero"><div><span class="eyebrow">${t(L('Freight forwarding simulator · Beirut', 'محاكي وكيل الشحن · بيروت'))}</span><h1>${t(L('20 clients are waiting for you', '20 زبونًا بانتظارك'))}</h1>
      <p>${t(L('Every client asks for something different: FCL or LCL, import or export, EXW / FCA / FOB / CFR / CIF / DAP, different goods, payment terms, personalities and surprises in the mailbox. Numbers, dates and traps change with every file — you cannot memorise the answers.', 'كل زبون يطلب شيئًا مختلفًا: FCL أو LCL، استيراد أو تصدير، EXW / FCA / FOB / CFR / CIF / DAP، بضائع وشروط دفع وشخصيات مختلفة ومفاجآت في البريد. الأرقام والتواريخ والفخاخ تتغيّر مع كل ملف — لا يمكنك حفظ الأجوبة.'))}</p>
      <div class="row"><button class="btn accent" id="rnd">🎲 ${t(L('Random new client', 'زبون جديد عشوائي'))}</button><button class="btn ghost-w" data-go="drills">🎯 ${t(L('Quick drills', 'تمارين سريعة'))}</button><span class="hero-stat">${doneN}/${OPS.CASES.length} ${t(L('clients served', 'زبائن مخدومون'))}</span></div></div></section>
      <div class="row filters">${[['all', L('All', 'الكل')], ['FCL', L('FCL', 'FCL')], ['LCL', L('LCL', 'LCL')], ['import', L('Import', 'استيراد')], ['export', L('Export', 'تصدير')], ['new', L('Not started', 'لم تبدأ')], ['open', L('In progress', 'قيد التنفيذ')], ['done', L('Completed', 'مكتملة')]].map(([k, l]) => `<button class="chip ${f === k ? 'on' : ''}" data-f="${k}">${t(l)}</button>`).join('')}</div>
      <div class="cboard">${cases.map((c) => caseCard(c, mineOf(c))).join('') || `<p class="muted">${t(L('No client in this filter.', 'لا زبون في هذا التصنيف.'))}</p>`}</div>
      ${randoms.length ? `<h2>🎲 ${t(L('Your random clients', 'زبائنك العشوائيون'))}</h2><div class="cboard">${randoms.map((s) => caseCard(s.case, s)).join('')}</div>` : ''}
      <h2 style="margin-top:22px">${t(L('Your shipment files', 'ملفات شحناتك'))}</h2>
      ${ok.length ? ui.table([L('Shipment', 'الشحنة'), L('Client & order', 'الزبون والطلب'), L('Progress', 'التقدّم'), L('Sim. date', 'تاريخ المحاكاة'), L('Handed to', 'أُرسلت إلى'), ''],
        ok.map((s) => {
          const d = OPS.steps.filter((st) => s.steps && s.steps[st.id] && s.steps[st.id].done).length;
          const hand = Object.values(s.handoffs || {}).map((h) => h.department).filter((x, i, a) => a.indexOf(x) === i).join(', ') || '—';
          return `<tr><td><b>${esc(s.id)}</b></td><td>${esc(s.case.client.name)}<br><small class="muted">${esc(t(s.case.title))}</small></td><td>${d}/${OPS.steps.length}</td><td>${TS.fmtDate(s.sim.today, false)}</td><td>${esc(hand)}</td>
          <td class="num"><button class="btn sm primary" data-open="${s.id}">${t(L('Open', 'فتح'))}</button> <button class="btn sm" data-dl="${s.id}">JSON</button> <button class="btn sm ghost" data-del="${s.id}">🗑</button></td></tr>`;
        })) : `<p class="muted">${t(L('No shipments yet — take a client above.', 'لا توجد شحنات بعد — استلم زبونًا أعلاه.'))}</p>`}
      ${old.length ? `<div class="note warn"><strong>${t(L('Old-format shipments', 'شحنات بالصيغة القديمة'))}</strong>${t(L('These files were made with the previous version (2 fixed scenarios) and cannot be continued here. You can still download them or delete them:', 'هذه الملفات من النسخة السابقة (سيناريوهان ثابتان) ولا يمكن متابعتها هنا. يمكنك تنزيلها أو حذفها:'))} ${old.map((s) => `<span class="badge">${esc(s.id)} <button class="btn sm ghost" data-dl="${s.id}">⬇</button><button class="btn sm ghost" data-del="${s.id}">🗑</button></span>`).join(' ')}</div>` : ''}
      <div class="card soft"><h3>${t(L('Import a shipment JSON file', 'استيراد ملف شحنة JSON'))}</h3><p class="muted">${t(L('Continue a shipment saved on another computer or received from another department.', 'تابع شحنة محفوظة على جهاز آخر أو واردة من قسم آخر.'))}</p><input type="file" id="imp" accept=".json,application/json"></div>
      <div class="note warn">${t(REF.disclaimer)}</div>`;
    const start = (c) => { app.ship = OPS.newShipment(c); go('step:' + OPS.steps[0].id); };
    main.querySelectorAll('[data-f]').forEach((b) => (b.onclick = () => { app.caseF = b.dataset.f; app.render(); }));
    main.querySelectorAll('[data-new]').forEach((b) => (b.onclick = (e) => { e.stopPropagation(); start(OPS.CASES.find((c) => c.id === b.dataset.new) || (ok.find((s) => s.case.id === b.dataset.new) || {}).case); }));
    main.querySelector('#rnd').onclick = () => start(OPS.randomCase(Math.floor(Math.random() * 1e9)));
    main.querySelectorAll('[data-open]').forEach((b) => (b.onclick = (e) => { e.stopPropagation(); TS.store.setCurrent(b.dataset.open); load(); go('step:' + (app.ship.stage && app.ship.stage !== 'closed' ? app.ship.stage : OPS.steps[0].id)); }));
    main.querySelectorAll('[data-dl]').forEach((b) => (b.onclick = () => TS.downloadJSON(TS.store.get(b.dataset.dl))));
    main.querySelectorAll('[data-del]').forEach((b) => (b.onclick = () => {
      if (confirm(t(L('Delete this training shipment from this browser?', 'حذف هذه الشحنة التدريبية من هذا المتصفح؟')))) { TS.store.remove(b.dataset.del); load(); app.render(); }
    }));
    $('#imp', main).onchange = async (e) => {
      const fl = e.target.files[0]; if (!fl) return;
      try { const s = await TS.readJSONFile(fl); TS.store.save(s); if (!OPS.legacy(s)) TS.store.setCurrent(s.id); load(); TS.toast(t(L('Shipment imported', 'تم استيراد الشحنة')), 'ok'); app.render(); }
      catch (err) { TS.toast(err.message, 'bad'); }
    };
  }

  /* ---------------- step view ---------------- */
  function viewStep(main, id) {
    const ship = app.ship;
    const st = OPS.steps.find((s) => s.id === id) || OPS.steps[0];
    const i = app.stepIndex(st.id);
    const un = app.stepUnlocked(ship, st), done = app.stepDone(ship, st);
    const w = W(ship, st.id);
    const parts = OPS.P(st, ship);
    const tab = app.tab[st.id] || (w.parts && Object.keys(w.parts).length ? 'task' : 'lesson');
    const pd = app.partsDone(ship, st);
    const sc = OPS.sc(ship);
    main.innerHTML = `
      <div class="step-head"><div class="num">${i + 1}</div><div><h1>${t(OPS.stTitle(st, ship))}</h1><p>${t(st.sub)}</p></div></div>
      <div class="row" style="margin:8px 0 14px"><span class="simclock">🗓 ${t(L('Simulation date', 'تاريخ المحاكاة'))}: <b>${TS.fmtDate(ship.sim.today)}</b></span>
        ${done ? `<span class="badge ok">✓ ${t(L('Completed', 'مُنجزة'))}</span>` : un ? `<span class="badge info">${t(L('In progress', 'قيد التنفيذ'))}</span>` : `<span class="badge">🔒 ${t(L('Locked', 'مقفلة'))}</span>`}
        <span class="badge ${sc.mode === 'LCL' ? 'lcl' : 'fcl'}">${sc.mode}</span><span class="badge">${t(sc.direction === 'import' ? L('Import', 'استيراد') : L('Export', 'تصدير'))} · ${esc(sc.answer.incoterm)}</span>
        ${un && !done ? `<span class="spacer" style="flex:1"></span><button class="btn sm" data-ap="step" title="${t(L('Watch the autopilot do this step (counts as hints)', 'شاهد الطيار الآلي ينفّذ هذه المرحلة (تُحتسب كتلميحات)'))}">▶ ${t(L('Autopilot', 'الطيار الآلي'))}</button><button class="btn sm ghost" data-ap="all">⏩ ${t(L('Play all', 'نفّذ الكل'))}</button>` : ''}</div>
      <div class="tabs">
        <button data-tab="lesson" class="${tab === 'lesson' ? 'on' : ''}">📘 ${t(L('Lesson', 'الدرس'))}</button>
        <button data-tab="task" class="${tab === 'task' ? 'on' : ''}">🛠 ${t(L('Task', 'المهمة'))} <span class="badge ${pd === parts.length ? 'ok' : ''}">${pd}/${parts.length}</span></button>
        ${st.quiz && st.quiz.length ? `<button data-tab="quiz" class="${tab === 'quiz' ? 'on' : ''}">❓ ${t(L('Quiz', 'اختبار'))} ${w.quiz.passed ? '<span class="badge ok">✓</span>' : ''}</button>` : ''}
      </div>
      <div id="stepBody"></div>
      <div class="row" style="justify-content:space-between;margin-top:18px">
        ${i > 0 ? `<button class="btn" data-go="step:${OPS.steps[i - 1].id}">← ${t(OPS.stTitle(OPS.steps[i - 1], ship))}</button>` : '<span></span>'}
        ${OPS.steps[i + 1] ? `<button class="btn ${done ? 'primary' : ''}" data-go="step:${OPS.steps[i + 1].id}">${t(OPS.stTitle(OPS.steps[i + 1], ship))} →</button>` : ''}
      </div>`;
    main.querySelectorAll('[data-tab]').forEach((b) => (b.onclick = () => { app.tab[st.id] = b.dataset.tab; app.keepScroll = false; app.render(); }));
    main.querySelectorAll('[data-ap]').forEach((b) => (b.onclick = () => TS.autopilot.start(OPS.apAdapter, b.dataset.ap)));
    const body = $('#stepBody', main);
    if (tab === 'lesson') {
      body.innerHTML = `<div class="card lesson">${st.lesson(ship)}</div><div class="row"><button class="btn primary" id="toTask">${t(L('Go to the task', 'انتقل إلى المهمة'))} →</button></div>`;
      $('#toTask', body).onclick = () => { app.tab[st.id] = 'task'; app.render(); };
    } else if (tab === 'quiz') {
      renderQuiz(body, st);
    } else {
      if (!un) { body.innerHTML = `<div class="note warn"><strong>🔒 ${t(L('Locked', 'مقفلة'))}</strong>${t(L('Finish the previous steps first. You can still read the lesson.', 'أنهِ المراحل السابقة أولًا. يمكنك قراءة الدرس.'))}</div>`; return; }
      renderParts(body, st);
    }
  }

  function renderParts(body, st) {
    const ship = app.ship;
    const ctx = app.ctx(st);
    const parts = OPS.P(st, ship);
    let firstOpen = true;
    body.innerHTML = '';
    parts.forEach((p, idx) => {
      const done = !!ctx.w.parts[p.id];
      const locked = !done && !firstOpen;
      if (!done) firstOpen = false;
      const el = document.createElement('section');
      el.className = 'part ' + (done ? 'done' : '') + (locked ? ' locked' : '');
      el.innerHTML = `<header><span class="badge ${done ? 'ok' : ''}">${done ? '✓' : String.fromCharCode(65 + idx)}</span><h3>${t(typeof p.title === 'function' ? p.title(ship) : p.title)}</h3>${locked ? '<span class="badge">🔒</span>' : ''}</header><div class="body"></div>`;
      body.appendChild(el);
      const b = el.querySelector('.body');
      if (done) b.innerHTML = p.summary ? p.summary(ctx) : `<p class="muted">✓ ${t(L('Done.', 'تم.'))}</p>`;
      else if (!locked) p.render(ctx, b);
      bindGlobal(el);
    });
    const ins = OPS.insight && OPS.insight(st.id, ship);
    if (ins) { const c = document.createElement('div'); c.innerHTML = ins; body.appendChild(c); bindGlobal(c); }
    const allParts = parts.every((p) => ctx.w.parts[p.id]);
    if (allParts && st.quiz && st.quiz.length && !ctx.w.quiz.passed) {
      const n = document.createElement('div');
      n.className = 'note';
      n.innerHTML = `<strong>${t(L('Task finished!', 'انتهت المهمة!'))}</strong>${t(L('Pass the quiz to complete this step.', 'اجتز الاختبار لإنهاء هذه المرحلة.'))} <button class="btn sm primary" id="toQuiz">${t(L('Open quiz', 'افتح الاختبار'))}</button>`;
      body.appendChild(n);
      n.querySelector('#toQuiz').onclick = () => { app.tab[st.id] = 'quiz'; app.render(); };
    }
    if (app.stepDone(ship, st)) {
      const i = app.stepIndex(st.id);
      const n = document.createElement('div');
      n.className = 'note ok';
      n.innerHTML = `<strong>✓ ${t(L('Step complete', 'المرحلة مُنجزة'))}</strong>${OPS.steps[i + 1] ? `<button class="btn sm ok" data-go="step:${OPS.steps[i + 1].id}">${t(L('Next step', 'المرحلة التالية'))} →</button>` : ''}`;
      body.appendChild(n);
      bindGlobal(n);
    }
  }

  function renderQuiz(body, st) {
    const ship = app.ship;
    const w = W(ship, st.id);
    const items = OPS.quizFor(ship, st);
    w.quiz.ans = w.quiz.ans || {};
    const checked = w.quiz.checked;
    body.innerHTML = `<p class="muted">🎲 ${t(L('Questions mix the lesson with generated exercises — numbers and order differ for every shipment.', 'الأسئلة تمزج الدرس مع تمارين مولَّدة — الأرقام والترتيب تختلف لكل شحنة.'))}</p>` + items.map((q, qi) => {
      const a = w.quiz.ans[qi];
      const right = a === q.a;
      return `<div class="q"><div class="qt">${qi + 1}. ${t(q.q)}</div>${q.o.map((o, oi) => `<label class="check ${checked && a === oi ? (right ? 'right' : 'wrong') : ''}"><input type="radio" name="q${qi}" value="${oi}" ${a === oi ? 'checked' : ''}><span>${t(o)}</span></label>`).join('')}
      ${checked && (w.quiz.passed || a !== q.a) && q.e ? `<div class="explain note ${right ? 'ok' : 'bad'}">${t(q.e)}</div>` : ''}</div>`;
    }).join('') + `<div class="row"><button class="btn primary" id="qcheck">${t(L('Check answers', 'تحقّق من الإجابات'))}</button>${w.quiz.passed ? `<span class="badge ok">✓ ${t(L('Passed', 'ناجح'))}</span>` : ''}</div>`;
    body.querySelectorAll('input[type=radio]').forEach((r) => r.addEventListener('change', () => { w.quiz.ans[Number(r.name.slice(1))] = Number(r.value); w.quiz.checked = false; app.save(); }));
    $('#qcheck', body).onclick = () => {
      w.quiz.checked = true;
      const wrong = items.filter((q, qi) => w.quiz.ans[qi] !== q.a).length;
      if (wrong) { ship.score.mistakes += wrong; TS.toast(t(L(`${wrong} wrong — read the explanations and retry`, `${wrong} إجابة خاطئة — اقرأ الشرح وأعد المحاولة`)), 'bad'); }
      else { w.quiz.passed = true; TS.toast(t(L('Quiz passed', 'نجحت في الاختبار')), 'ok'); app.checkStep(ship, st); }
      app.save(); app.render();
    };
  }

  /* ---------------- carrier portal ---------------- */
  function viewPortal(main) {
    const ship = app.ship;
    const sc = OPS.sc(ship);
    const all = TS.store.list().filter((s) => s.booking);
    const selC = ship.rates.selected ? ship.rates.selected.c : null;
    main.innerHTML = `<h1>⛴ ${t(L('Carrier portal (virtual)', 'بوابة الخطوط الملاحية (افتراضية)'))}</h1>
      <p class="muted">${t(L('In real life each line has its own web portal (or you use a multi-carrier platform). Here you see bookings, sailing schedules and container tracking in one place.', 'في الواقع لكل خط بوابته الإلكترونية (أو تستعمل منصّة متعددة الخطوط). هنا ترى الحجوزات وجداول الإبحار وتتبّع الحاويات في مكان واحد.'))}</p>
      <div class="card"><h3>${t(L('My bookings', 'حجوزاتي'))}</h3>
      ${all.length ? ui.table([L('Booking no.', 'رقم الحجز'), L('Carrier', 'الخط'), L('Vessel / voyage', 'الباخرة / الرحلة'), 'POL → POD', L('Equipment', 'المعدّات'), 'ETD', 'CY cutoff', L('Status', 'الحالة'), L('File', 'الملف')],
        all.map((s) => { const b = s.booking; return `<tr><td class="mono"><b>${esc(b.no)}</b></td><td>${esc(b.carrierName)}</td><td>${esc(b.vessel)} / ${esc(b.voyage)}</td><td>${esc(b.pol)} → ${esc(b.pod)}</td><td>${b.equipment === 'LCL' ? 'LCL' : '1 × ' + esc(b.equipment)}</td><td>${TS.fmtDate(b.etd, false)}</td><td>${TS.fmtDate(b.cutoffs.cy, false)}</td><td><span class="badge ${b.status === 'confirmed' ? 'ok' : 'info'}">${esc(b.status)}</span></td><td>${esc(s.id)}</td></tr>`; }))
        : `<p class="muted">${t(L('No bookings yet — complete step 4 (Booking).', 'لا حجوزات بعد — أكمل المرحلة 4 (الحجز).'))}</p>`}</div>
      <div class="card"><h3>${t(L('Sailing schedules', 'جداول الإبحار'))} — ${esc(sc.answer.pol)} → ${esc(sc.answer.pod)}</h3>
      ${Object.keys(sc.mode === 'LCL' ? OPS.consols : OPS.carriers).map((c) => `<h4 style="margin-top:12px">${esc(OPS.lines[c].name)} ${c === selC ? `<span class="badge ok">${t(L('selected carrier', 'الخط المختار'))}</span>` : ''}</h4>` + ui.table([L('Vessel', 'الباخرة'), L('Voyage', 'الرحلة'), 'ERD', 'SI cut', 'VGM cut', 'CY cut', 'ETD', 'ETA', 'T/S'],
        OPS.schedule(ship, c).map((v) => `<tr><td>${esc(v.vessel)}</td><td class="mono">${esc(v.voyage)}</td><td>${TS.fmtDate(v.erd, false)}</td><td>${TS.fmtDate(v.si, false)}</td><td>${TS.fmtDate(v.vgm, false)}</td><td>${TS.fmtDate(v.cy, false)}</td><td><b>${TS.fmtDate(v.etd, false)}</b></td><td>${TS.fmtDate(v.eta, false)}</td><td>${esc(v.ts)}</td></tr>`))).join('')}</div>
      <div class="card"><h3>${t(L('Container tracking', 'تتبّع الحاويات'))}</h3>
      ${ship.tracking && ship.tracking.length ? ui.table([L('Date', 'التاريخ'), L('Event', 'الحدث'), L('Location', 'المكان'), L('Vessel', 'الباخرة')], ship.tracking.map((e) => `<tr class="${e.date <= ship.sim.today ? '' : 'muted'}"><td>${TS.fmtDate(e.date, false)} ${e.date > ship.sim.today ? '<span class="badge">' + t(L('planned', 'مخطّط')) + '</span>' : ''}</td><td>${esc(t(e.event))}</td><td>${esc(e.loc)}</td><td>${esc(e.vessel || '')}</td></tr>`))
        : `<p class="muted">${t(L('Tracking starts after gate-in.', 'يبدأ التتبّع بعد دخول الحاوية إلى المحطة.'))}</p>`}</div>`;
  }

  /* ---------------- documents ---------------- */
  function viewDocs(main) {
    const ship = app.ship;
    const avail = OPS.docs.list(ship);
    const cur = avail.find((d) => d.id === app.doc) || avail[0];
    main.innerHTML = `<h1>📄 ${t(L('Documents', 'المستندات'))}</h1>
      <p class="muted">${t(L('Documents are generated from the shipment data as you complete the steps. Trade documents are in English, as in real practice. Use Print to save as PDF.', 'تُولَّد المستندات من بيانات الشحنة كلما أنجزت المراحل. المستندات التجارية بالإنجليزية كما في الواقع. استعمل الطباعة لحفظها PDF.'))}</p>
      <div class="row no-print" style="margin-bottom:12px">${avail.map((d) => `<button class="btn sm ${cur && d.id === cur.id ? 'primary' : ''}" data-doc="${d.id}">${esc(t(d.name))}</button>`).join('')}${cur ? `<button class="btn sm ghost" data-doc-open="${cur.id}">⤢ ${t(L('Open in pop-up', 'افتح في نافذة'))}</button><button class="btn sm ghost" onclick="window.print()">🖨 ${t(L('Print / PDF', 'طباعة / PDF'))}</button>` : ''}</div>
      <p class="doc-hint no-print">💡 ${t(L('Click any underlined label or term on the document to see what it means (English + Arabic).', 'انقر على أي عنوان أو مصطلح مسطّر في المستند لمعرفة معناه (إنجليزي + عربي).'))}</p>${cur ? cur.html(ship) : `<p class="muted">${t(L('No documents yet.', 'لا مستندات بعد.'))}</p>`}`;
    main.querySelectorAll('[data-doc]').forEach((b) => (b.onclick = () => { app.doc = b.dataset.doc; app.render(); }));
    if (cur && ship.docsSeen && !ship.docsSeen.includes(cur.id)) { ship.docsSeen.push(cur.id); app.save(); }
  }

  /* ---------------- JSON ---------------- */
  function viewJSON(main) {
    const ship = app.ship;
    const hand = Object.entries(ship.handoffs || {});
    main.innerHTML = `<h1>{ } ${t(L('Shipment JSON file', 'ملف الشحنة JSON'))}</h1>
      <p>${t(L('This single file is the shipment. Customs and Accounting read the same file: open their pages from the home screen (same browser) or send them this file.', 'هذا الملف الواحد هو الشحنة. قسما الجمارك والمحاسبة يقرآن الملف نفسه: افتح صفحاتهما من الصفحة الرئيسية (المتصفح نفسه) أو أرسل لهما هذا الملف.'))}</p>
      <div class="row" style="margin-bottom:12px"><button class="btn primary" id="dl">⬇ ${t(L('Download', 'تنزيل'))} ${esc(ship.id)}.json</button><button class="btn" id="cp">${t(L('Copy', 'نسخ'))}</button>
      <a class="btn" href="../customs_department/index.html">${t(L('Open Customs department', 'افتح قسم الجمارك'))} →</a><a class="btn" href="../accounting_department/index.html">${t(L('Open Accounting department', 'افتح قسم المحاسبة'))} →</a></div>
      ${hand.length ? ui.table([L('Hand-off', 'التسليم'), L('Department', 'القسم'), L('Sent', 'أُرسل'), L('Status', 'الحالة')], hand.map(([k, h]) => `<tr><td class="mono">${esc(k)}</td><td>${esc(h.department)}</td><td>${TS.fmtDate(h.sentSim, false)}</td><td><span class="badge info">${esc(h.status)}</span></td></tr>`)) : ''}
      <div class="json">${esc(JSON.stringify(ship, null, 2))}</div>`;
    $('#dl', main).onclick = () => TS.downloadJSON(ship);
    $('#cp', main).onclick = () => { try { navigator.clipboard.writeText(JSON.stringify(ship, null, 2)); TS.toast(t(L('Copied', 'تم النسخ')), 'ok'); } catch (e) { TS.toast('Copy failed', 'bad'); } };
  }

  /* ---------------- reference views ---------------- */
  function viewLebanon(main) {
    main.innerHTML = `<h1>🇱🇧 ${t(L('Lebanon guide — ports, customs, law & practice', 'دليل لبنان — المرافئ والجمارك والقانون والممارسة'))}</h1><div class="note warn">${t(REF.disclaimer)}</div>
      ${REF.lebanon.map((s) => `<div class="card lesson"><h3>${t(s.h)}</h3>${t(s.b)}</div>`).join('')}`;
  }
  function viewIncoterms(main) {
    main.innerHTML = `<h1>${t(L('Incoterms 2020', 'إنكوترمز 2020'))}</h1>
      <p>${t(L('Incoterms decide two different things: who pays for each leg, and where the risk passes from seller to buyer. They are not the same point (see CFR/CIF).', 'تحدّد الإنكوترمز أمرين مختلفين: من يدفع كل مرحلة، وأين تنتقل المخاطر من البائع إلى المشتري. وهما ليسا النقطة نفسها (انظر CFR/CIF).'))}</p>
      ${ui.table(['Term', L('Mode', 'الوسيلة'), L('Seller pays up to', 'البائع يدفع حتى'), L('Risk passes', 'انتقال المخاطر'), L('Your role as forwarder', 'دورك كوكيل شحن')],
        REF.incoterms.map((i) => `<tr><td><b>${i.c}</b></td><td>${i.mode === 'sea' ? t(L('Sea only', 'بحري فقط')) : t(L('Any mode', 'كل الوسائل'))}</td><td>${t(i.seller)}</td><td>${t(i.risk)}</td><td>${t(i.ff)}</td></tr>`))}
      <div class="note warn"><strong>${t(L('FOB, CFR, CIF (and FAS) are for sea/inland waterway only.', 'FOB وCFR وCIF (وFAS) للنقل البحري فقط.'))}</strong>${t(L('For containers handed over at a terminal or inland depot the correct terms are FCA, CPT, CIP — but in Lebanon and most markets you will still see FOB/CFR used for containers every day. Know the difference.', 'للحاويات التي تُسلَّم في محطة أو مستودع داخلي المصطلحات الصحيحة هي FCA وCPT وCIP — لكنك في لبنان ومعظم الأسواق سترى FOB وCFR تُستعمل للحاويات يوميًا. اعرف الفرق.'))}</div>
      ${ui.table([L('Cost item', 'بند الكلفة'), 'EXW', 'FCA', 'FOB', 'CFR/CIF', 'DAP', 'DDP'], [
        [L('Loading at seller', 'التحميل عند البائع'), 'B', 'S', 'S', 'S', 'S', 'S'],
        [L('Export clearance', 'التخليص الصادر'), 'B', 'S', 'S', 'S', 'S', 'S'],
        [L('Origin THC', 'مناولة المنشأ'), 'B', 'B', 'S', 'S', 'S', 'S'],
        [L('Ocean freight', 'الشحن البحري'), 'B', 'B', 'B', 'S', 'S', 'S'],
        [L('Insurance', 'التأمين'), '—', '—', '—', 'CIF: S', '—', '—'],
        [L('Destination THC', 'مناولة الوصول'), 'B', 'B', 'B', 'B*', 'S', 'S'],
        [L('Import clearance, duty & VAT', 'التخليص الوارد والرسوم والضريبة'), 'B', 'B', 'B', 'B', 'B', 'S'],
        [L('Delivery to buyer', 'التسليم للمشتري'), 'B', 'B', 'B', 'B', 'S', 'S'],
      ].map((r) => `<tr><td>${t(r[0])}</td>${r.slice(1).map((c) => `<td><span class="badge ${c.includes('S') ? 'info' : c === 'B' || c === 'B*' ? 'ok' : ''}">${c}</span></td>`).join('')}</tr>`))}
      <p class="muted">S = ${t(L('seller', 'البائع'))}, B = ${t(L('buyer', 'المشتري'))}. * ${t(L('depends on the contract of carriage / lane practice.', 'حسب عقد النقل / عُرف الخط.'))}</p>`;
  }
  function viewEquipment(main) {
    main.innerHTML = `<h1>▭ ${t(L('Containers & measurement', 'الحاويات والقياسات'))}</h1>
      ${ui.table([L('Code', 'الرمز'), L('Type', 'النوع'), { l: 'CBM', num: 1 }, { l: L('Max payload kg', 'الحمولة القصوى كغ'), num: 1 }, { l: L('Tare kg (typ.)', 'الوزن فارغة كغ'), num: 1 }, L('Use', 'الاستعمال')],
        REF.equipment.map((e) => `<tr><td><b>${e.code}</b></td><td>${t(e.name)}</td><td class="num">${e.cbm || '—'}</td><td class="num">${e.payload ? TS.num(e.payload, 0) : '—'}</td><td class="num">${e.tare ? TS.num(e.tare, 0) : '—'}</td><td>${t(e.use)}</td></tr>`))}
      <div class="card lesson"><h3>${t(L('Rules to remember', 'قواعد يجب تذكّرها'))}</h3>${t(L(
        '<ul><li>TEU/FEU: a 40′ is 2 TEU.</li><li>CBM = L × W × H (m). Real loadable volume is ~85–90% of internal capacity.</li><li>Tare + cargo = gross. VGM = verified gross mass of the packed box.</li><li>LCL is billed W/M: the higher of tonnes or CBM (1 CBM = 1,000 kg).</li><li>Air chargeable weight = cm³ ÷ 6,000 vs actual kg — higher wins.</li><li>Road limits are stricter than container ratings — check the country (and axle loads for heavy 20′).</li><li>Container number: 3-letter owner code + category (U) + 6-digit serial + check digit (ISO 6346).</li></ul>',
        '<ul><li>TEU/FEU: الحاوية 40 قدم = 2 TEU.</li><li>المتر المكعّب = الطول × العرض × الارتفاع (م). الحجم القابل للتحميل فعليًا ~85–90% من السعة الداخلية.</li><li>الوزن فارغة + البضاعة = الوزن الإجمالي. VGM = الوزن الإجمالي المُتحقَّق للحاوية المعبّأة.</li><li>LCL تُحسب W/M: الأعلى بين الطن والمتر المكعّب (1 م³ = 1000 كغ).</li><li>الوزن المحتسب جوًّا = سم³ ÷ 6000 مقابل الوزن الفعلي — الأعلى يُعتمد.</li><li>حدود الطرقات أشدّ من تصنيف الحاوية — تحقّق من البلد (وحمولة المحاور للحاوية 20 الثقيلة).</li><li>رقم الحاوية: رمز المالك 3 أحرف + الفئة (U) + رقم تسلسلي 6 أرقام + رقم تحقّق (ISO 6346).</li></ul>'))}</div>`;
  }
  function viewGlossary(main) {
    const q = TS.norm(app.gq);
    const rows = REF.glossary.filter(([k, v]) => !q || TS.norm(k + ' ' + v.en + ' ' + v.ar).includes(q));
    main.innerHTML = `<h1>Aa ${t(L('Glossary', 'المصطلحات'))}</h1><input type="text" id="gq" value="${esc(app.gq)}" placeholder="${t(L('Search…', 'ابحث…'))}" style="max-width:360px;margin-bottom:10px">
      <div class="lesson">${ui.table([L('Term', 'المصطلح'), 'English', 'العربية'], rows.map(([k, v]) => `<tr><td><b class="ltr">${esc(k)}</b></td><td>${esc(v.en)}</td><td dir="rtl">${esc(v.ar)}</td></tr>`))}</div><h2 style="margin-top:20px">${t(L('Clickable dictionary', 'القاموس التفاعلي'))}</h2><p class="muted">${t(L('Click any term to open its card (English + Arabic). The same terms are clickable inside every document, lesson and email.', 'انقر على أي مصطلح لفتح بطاقته (إنجليزي + عربي). المصطلحات نفسها قابلة للنقر داخل كل مستند ودرس وبريد.'))}</p><div class="row">${Object.entries(TS.TERMS).filter(([k, v]) => !q || TS.norm(v.en + ' ' + v.ar + ' ' + v.d.en + ' ' + v.d.ar).includes(q)).map(([k, v]) => `<button type="button" class="term-chip" data-term="${k}">${esc(TS.lang === 'ar' ? v.ar : v.en)}</button>`).join('')}</div>`;
    const inp = $('#gq', main);
    inp.oninput = () => { app.gq = inp.value; app.render(); const n = $('#gq'); n.focus(); n.setSelectionRange(n.value.length, n.value.length); };
  }
  function viewTools(main) {
    main.innerHTML = `<h1>∑ ${t(L('Calculators', 'الحاسبات'))}</h1><div class="grid c2">
      <div class="card"><h3>CBM & ${t(L('container fit', 'ملاءمة الحاوية'))}</h3><div class="form">
        <div class="field"><label>L (cm)</label><input type="number" id="cL" value="120"></div><div class="field"><label>W (cm)</label><input type="number" id="cW" value="80"></div>
        <div class="field"><label>H (cm)</label><input type="number" id="cH" value="60"></div><div class="field"><label>${t(L('Pieces', 'عدد القطع'))}</label><input type="number" id="cN" value="120"></div>
        <div class="field"><label>${t(L('Kg per piece', 'كغ للقطعة'))}</label><input type="number" id="cK" value="70"></div></div><div id="cOut" class="note"></div></div>
      <div class="card"><h3>${t(L('Container number check digit (ISO 6346)', 'رقم التحقّق للحاوية (ISO 6346)'))}</h3><div class="field"><label>${t(L('Container number', 'رقم الحاوية'))}</label><input type="text" id="cn" value="CMAU1234567"></div><div id="cnOut" class="note"></div>
        <p class="muted" style="font-size:.85rem">${t(L('Letters are valued A=10, B=12… (skipping multiples of 11). Each of the 10 characters is multiplied by 2^position (0–9), summed, then mod 11 (10 → 0).', 'تُعطى الأحرف قيمًا A=10، B=12… (مع تخطّي مضاعفات 11). يُضرب كل من الأحرف العشرة بـ 2 أس موقعه (0–9)، ثم يُجمع ويؤخذ باقي القسمة على 11 (10 ← 0).'))}</p></div>
      <div class="card"><h3>${t(L('Demurrage & detention', 'غرامات التأخير والاحتجاز'))}</h3><div class="form">
        <div class="field"><label>${t(L('Discharge / pickup date', 'تاريخ التفريغ / السحب'))}</label><input type="date" id="d1" value="${TS.todayISO()}"></div><div class="field"><label>${t(L('Empty return date', 'تاريخ إرجاع الفارغ'))}</label><input type="date" id="d2" value="${TS.addDays(TS.todayISO(), 13)}"></div>
        <div class="field"><label>${t(L('Free days', 'أيام السماح'))}</label><input type="number" id="dF" value="10"></div><div class="field"><label>${t(L('Rate days 1–7 / after (USD)', 'السعر للأيام 1–7 / بعدها (دولار)'))}</label><input type="text" id="dR" value="30/60"></div></div><div id="dOut" class="note"></div></div>
      <div class="card"><h3>${t(L('Margin, markup, VAT 11% & LBP', 'الهامش والزيادة والضريبة 11% والليرة'))}</h3><div class="form">
        <div class="field"><label>${t(L('Buy (USD)', 'الكلفة (دولار)'))}</label><input type="number" id="mB" value="2905"></div><div class="field"><label>${t(L('Sell (USD)', 'البيع (دولار)'))}</label><input type="number" id="mS" value="3200"></div>
        <div class="field"><label>${t(L('Rate LBP per USD (sample)', 'سعر الليرة مقابل الدولار (مثال)'))}</label><input type="number" id="mX" value="89500"></div></div><div id="mOut" class="note"></div></div>
      <div class="card"><h3>${t(L('Customs value (CIF) & import taxes estimate', 'القيمة الجمركية (CIF) وتقدير الضرائب'))}</h3><div class="form">
        <div class="field"><label>FOB (USD)</label><input type="number" id="xF" value="38500"></div><div class="field"><label>${t(L('Freight (USD)', 'الشحن (دولار)'))}</label><input type="number" id="xR" value="3055"></div>
        <div class="field"><label>${t(L('Insurance (USD)', 'التأمين (دولار)'))}</label><input type="number" id="xI" value="183"></div><div class="field"><label>${t(L('Duty rate % (sample)', 'نسبة الرسم % (مثال)'))}</label><input type="number" id="xD" value="10"></div></div><div id="xOut" class="note"></div></div>
      <div class="card"><h3>${t(L('LCL W/M and air chargeable weight', 'LCL (W/M) والوزن المحتسب جوًّا'))}</h3><div class="form">
        <div class="field"><label>CBM</label><input type="number" id="wC" value="3.2"></div><div class="field"><label>${t(L('Gross kg', 'الوزن كغ'))}</label><input type="number" id="wK" value="1850"></div></div><div id="wOut" class="note"></div></div>
      </div>`;
    const v = (id) => Number($('#' + id, main).value || 0);
    const calc = () => {
      const cbmOne = (v('cL') * v('cW') * v('cH')) / 1e6, cbm = cbmOne * v('cN'), kg = v('cK') * v('cN');
      const fit = REF.equipment.filter((e) => e.cbm && !/RF|OT|FR/.test(e.code) && cbm <= e.cbm * 0.9 && kg <= e.payload).map((e) => e.code);
      $('#cOut', main).innerHTML = `${TS.num(cbmOne, 4)} CBM × ${v('cN')} = <b>${TS.num(cbm, 2)} CBM</b>, <b>${TS.num(kg, 0)} kg</b><br>${t(L('Fits (≤90% volume):', 'يتّسع (≤90% من الحجم):'))} <b>${fit.join(', ') || '—'}</b>${cbm < 15 ? ' · ' + t(L('consider LCL', 'فكّر بـ LCL')) : ''}`;
      const cn = $('#cn', main).value.toUpperCase().replace(/[^A-Z0-9]/g, '');
      const cd = REF.checkDigit(cn.slice(0, 10));
      $('#cnOut', main).innerHTML = cd == null ? t(L('Format: 4 letters + 6 digits (+ check digit)', 'الصيغة: 4 أحرف + 6 أرقام (+ رقم التحقّق)')) : `${t(L('Check digit should be', 'رقم التحقّق يجب أن يكون'))} <b>${cd}</b> → ${cn.length === 11 ? (REF.validContainer(cn) ? '<span class="badge ok">✓ ' + t(L('valid', 'صحيح')) + '</span>' : '<span class="badge bad">✗ ' + t(L('invalid', 'غير صحيح')) + '</span>') : cn.slice(0, 10) + cd}`;
      const d1 = $('#d1', main).value, d2 = $('#d2', main).value;
      const days = d1 && d2 ? TS.diffDays(d1, d2) + 1 : 0;
      const [r1, r2] = ($('#dR', main).value || '0/0').split('/').map(Number);
      const ch = Math.max(0, days - v('dF'));
      const cost = OPS.ddCost(ch, { tiers: [{ upTo: 7, rate: r1 || 0 }, { upTo: 999, rate: r2 || r1 || 0 }] });
      $('#dOut', main).innerHTML = `${t(L('Days used (both dates count)', 'الأيام المستعملة (مع احتساب اليومين)'))}: <b>${days}</b> · ${t(L('chargeable', 'مستحقّة'))}: <b>${ch}</b> · <b>USD ${TS.num(cost, 2)}</b>`;
      const b = v('mB'), s = v('mS'), p = s - b;
      $('#mOut', main).innerHTML = `${t(L('Profit', 'الربح'))}: <b>USD ${TS.num(p)}</b> · ${t(L('Margin', 'الهامش'))} (p/sell): <b>${s ? TS.num((p / s) * 100, 1) : 0}%</b> · ${t(L('Markup', 'الزيادة'))} (p/buy): <b>${b ? TS.num((p / b) * 100, 1) : 0}%</b><br>VAT 11% ${t(L('on', 'على'))} ${TS.num(s)} = <b>USD ${TS.num(s * 0.11)}</b> ≈ LBP ${TS.num(s * 0.11 * v('mX'), 0)}`;
      const cif = v('xF') + v('xR') + v('xI'), duty = (cif * v('xD')) / 100, vat = (cif + duty) * 0.11;
      $('#xOut', main).innerHTML = `CIF = <b>USD ${TS.num(cif)}</b> · ${t(L('Duty', 'الرسم'))} = USD ${TS.num(duty)} · VAT 11% ${t(L('on (CIF + duty)', 'على (CIF + الرسم)'))} = USD ${TS.num(vat)} · <b>${t(L('Total taxes', 'مجموع الضرائب'))} USD ${TS.num(duty + vat)}</b><br><small>${t(L('Sample duty rate — the real rate depends on the HS code in the Lebanese tariff and any trade agreement.', 'نسبة الرسم مثال — النسبة الفعلية حسب رمز HS في التعرفة اللبنانية وأي اتفاقية تجارية.'))}</small>`;
      const rt = v('wK') / 1000, wm = Math.max(rt, v('wC'));
      $('#wOut', main).innerHTML = `LCL: max(${TS.num(rt, 3)} t, ${TS.num(v('wC'), 3)} CBM) = <b>${TS.num(wm, 3)} W/M</b><br>${t(L('Air', 'جوّي'))}: ${TS.num(v('wC') * 1e6 / 6000, 1)} kg vol vs ${TS.num(v('wK'), 0)} kg → <b>${TS.num(Math.max(v('wC') * 1e6 / 6000, v('wK')), 1)} kg</b>`;
    };
    main.querySelectorAll('input').forEach((i) => i.addEventListener('input', calc));
    calc();
  }

  /* ======================= boot ======================= */
  document.addEventListener('ts:lang', () => app.render());
  window.addEventListener('hashchange', () => { const h = location.hash.slice(1); if (h && h !== app.view) { app.view = h; app.render(); } });
  window.addEventListener('DOMContentLoaded', () => {
    load();
    const h = location.hash.slice(1);
    app.view = h || (app.ship ? 'step:' + (app.ship.stage && app.ship.stage !== 'closed' ? app.ship.stage : OPS.steps[0].id) : 'home');
    app.render();
    if (TS.tour) TS.tour('ops', TS.TOUR_BASIC);
  });
})();
