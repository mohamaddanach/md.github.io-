/* Training Shipping — generic department application (used by Accounting, Customs, …).
 * TS.deptApp(NS, cfg) builds the shell, step engine (lesson / task parts / quiz), job list, inbox and documents
 * for a department whose state lives in ship[cfg.key] and whose steps are NS.steps.
 *
 * cfg = {
 *   key: 'accounting',            // property on the shipment holding this department's work
 *   prefix: 'acc_',               // email step prefix
 *   session: 'acc_job',           // sessionStorage key for the open job
 *   email, title (L), icon, hero (L), jobsTitle (L), emptyNote (L), disclaimer (L), dateLabel (L),
 *   handoff(s) -> handoff object or null   // which hand-off this department works on
 *   init(s, h) -> state extra fields       // extra initial state
 *   nav: [{ v, icon, l, view(main, app) }] // job workspace views (journal, ledger…)
 *   learn: [{ v, icon, l, view(main, app) }]
 *   samples: [shipment…], prepareSample(s)
 * }
 * NS must provide: steps, d(ship) (derived figures), docs(ship) (documents list).
 */
(function () {
  const L = TS.L, t = TS.t, esc = TS.esc;

  TS.deptApp = (NS, cfg) => {
    const ui = TS.ui;
    ui.defaultFrom = cfg.email;
    const app = (NS.app = { ship: null, view: 'home', tab: {}, doc: null, mailSel: null });
    const S = (s) => s[cfg.key];
    const jobs = () => TS.store.list().filter((s) => cfg.handoff(s));

    /* ---------------- state ---------------- */
    NS.init = (s) => {
      if (S(s)) return S(s);
      const h = cfg.handoff(s);
      s[cfg.key] = Object.assign({ startedAt: new Date().toISOString(), today: h.sentSim || s.sim.today, steps: {}, work: {}, docs: {}, score: { mistakes: 0, hints: 0 } }, cfg.init ? cfg.init(s, h) : {});
      h.status = 'in progress (' + cfg.key + ')';
      s.currentDepartment = cfg.key;
      return S(s);
    };
    let memId = ''; // fallback when sessionStorage is blocked (offline single-file frame)
    function load() {
      let id = memId;
      try { id = sessionStorage.getItem(cfg.session) || memId; } catch (e) { /* ignore */ }
      const s = id ? TS.store.get(id) : null;
      app.ship = s && cfg.handoff(s) ? s : null;
      if (app.ship) NS.init(app.ship);
    }
    const open = (id) => { memId = id; try { sessionStorage.setItem(cfg.session, id); } catch (e) { /* ignore */ } load(); app.save(); };
    app.save = () => { if (app.ship) TS.store.save(app.ship); };
    app.mutate = (id, fn) => {
      if (app.ship && app.ship.id === id) { fn(app.ship); app.save(); app.render(); }
      else { const s = TS.store.get(id); if (s) { fn(s); TS.store.save(s); } }
    };

    /* ---------------- step engine ---------------- */
    const W = (s, id) => (S(s).work[id] = S(s).work[id] || { parts: {}, form: {}, data: {}, quiz: {} });
    app.idx = (id) => NS.steps.findIndex((x) => x.id === id);
    app.done = (s, st) => !!(S(s).steps[st.id] && S(s).steps[st.id].done);
    app.unlocked = (s, st) => { const i = app.idx(st.id); return i === 0 || NS.steps.slice(0, i).every((x) => app.done(s, x)); };
    const pdone = (s, st) => st.parts.filter((p) => W(s, st.id).parts[p.id]).length;
    NS.email = (s, box, e) => {
      const m = Object.assign({ id: TS.uid('MAIL'), box, date: S(s).today, time: new Date().toISOString(), read: box === 'out', attachments: [] }, e);
      s.emails.push(m); return m;
    };
    app.ctx = (st) => {
      const s = app.ship, w = W(s, st.id);
      const ctx = {
        ship: s, d: NS.d(s), step: st, w, data: w.data, state: S(s), save: app.save, rerender: () => app.render(),
        mistake(n) { S(s).score.mistakes += n || 1; app.save(); },
        hint() { S(s).score.hints += 1; app.save(); },
        finish(pid) { w.parts[pid] = true; app.check(s, st); app.save(); app.render(); },
        send(e) { return NS.email(s, 'out', Object.assign({ from: cfg.email, step: cfg.prefix + st.id }, e)); },
        receive(e, delay) {
          const id = s.id;
          const fire = () => app.mutate(id, (sh) => { const m = NS.email(sh, 'in', Object.assign({ to: cfg.email, step: cfg.prefix + st.id, read: false }, e)); if (e.onArrive) e.onArrive(sh); delete m.onArrive; TS.toast('✉ ' + t(L('New email from ', 'بريد جديد من ')) + m.from, 'mail'); });
          if (delay) setTimeout(fire, delay); else fire();
        },
        advance(date) { if (date && date > S(s).today) S(s).today = date; },
      };
      if (cfg.ctx) cfg.ctx(ctx, st);
      return ctx;
    };
    app.check = (s, st) => {
      const w = W(s, st.id);
      if (st.parts.every((p) => w.parts[p.id]) && (!st.quiz || w.quiz.passed) && !app.done(s, st)) {
        S(s).steps[st.id] = { done: true, at: new Date().toISOString() };
        TS.toast('✓ ' + t(L('Step completed: ', 'تم إنجاز المرحلة: ')) + t(st.title), 'ok');
      }
    };

    /* ---------------- rendering ---------------- */
    const $ = (q, r) => (r || document).querySelector(q);
    const views = {};
    (cfg.nav || []).concat(cfg.learn || []).forEach((n) => (views[n.v] = n));
    function topbar() {
      const list = jobs();
      return `<header class="topbar"><a class="brand" href="../index.html">⚓ Training Shipping <small>/ ${t(cfg.title)}</small></a><span class="spacer"></span>
        ${list.length ? `<select id="jobSel">${app.ship ? '' : '<option value="">—</option>'}${list.map((s) => `<option value="${esc(s.id)}" ${app.ship && app.ship.id === s.id ? 'selected' : ''}>${esc(s.id)}</option>`).join('')}</select>` : ''}
        <button class="btn sm" data-go="home">📂 ${t(L('Jobs', 'الملفات'))}</button><a class="btn sm" href="../operations_pricing_freight_forwarder/index.html">⛴ ${t(L('Operations', 'قسم العمليات'))}</a>${TS.langSwitch()}</header>`;
    }
    function sidebar() {
      const s = app.ship;
      const nav = (v, icon, l, extra) => `<button class="nav-item ${app.view === v ? 'active' : ''}" data-go="${v}"><span class="dot">${icon}</span><span>${t(l)}</span>${extra || ''}</button>`;
      let html = '';
      if (s) {
        const dn = NS.steps.filter((x) => app.done(s, x)).length;
        const unread = s.emails.filter((e) => e.box === 'in' && !e.read && String(e.step || '').startsWith(cfg.prefix)).length;
        html += `<h4>${esc(s.id)}</h4><div class="progress"><i style="width:${Math.round((dn / NS.steps.length) * 100)}%"></i></div><div class="muted" style="font-size:.8rem;margin:0 8px 6px">${dn}/${NS.steps.length} ${t(L('steps', 'مراحل'))}</div>
          <h4>${t(L('Steps', 'المراحل'))}</h4><div class="nav-group">${NS.steps.map((st, i) => { const d = app.done(s, st), u = app.unlocked(s, st); return `<button class="nav-item ${d ? 'done' : ''} ${!u ? 'locked' : ''} ${app.view === 'step:' + st.id ? 'active' : ''}" data-go="step:${st.id}"><span class="dot">${d ? '✓' : i + 1}</span><span>${t(st.title)}</span>${!u ? '<span class="badge">🔒</span>' : ''}</button>`; }).join('')}</div>
          <h4>${t(L('Workspace', 'مساحة العمل'))}</h4><div class="nav-group">${(cfg.nav || []).map((n) => nav(n.v, n.icon, n.l)).join('')}${nav('docs', '📄', L('Documents', 'المستندات'))}${nav('inbox', '✉', L('Email', 'البريد'), unread ? `<span class="badge n">${unread}</span>` : '')}</div>`;
      }
      html += `<h4>${t(L('Learn', 'تعلّم'))}</h4><div class="nav-group">${(cfg.learn || []).map((n) => nav(n.v, n.icon, n.l)).join('')}</div>`;
      return `<aside class="side">${html}</aside>`;
    }
    app.render = () => {
      TS.applyLang();
      const root = document.getElementById('app'), y = window.scrollY;
      root.innerHTML = topbar() + `<div class="layout">${sidebar()}<main class="main" id="main"></main></div>`;
      const main = $('#main');
      const learnViews = (cfg.learn || []).map((n) => n.v);
      if (!app.ship && !['home'].concat(learnViews).includes(app.view)) app.view = 'home';
      try {
        const v = app.view;
        if (v === 'home') viewHome(main);
        else if (v.startsWith('step:')) viewStep(main, v.slice(5));
        else if (v === 'docs') viewDocs(main);
        else if (v === 'inbox') viewInbox(main);
        else if (views[v]) views[v].view(main, app);
        else viewHome(main);
      } catch (err) { console.error(err); main.innerHTML = `<div class="note bad"><strong>Error</strong>${esc(err.message)}</div>`; }
      if (app.keep) window.scrollTo(0, y);
      app.keep = true;
      bind(root);
      if (TS.decorateAll) TS.decorateAll(root);
    };
    const go = (v) => { app.view = v; app.keep = false; try { history.replaceState(null, '', '#' + v); } catch (e) { /* offline single-file frame */ } app.render(); window.scrollTo(0, 0); };
    app.go = go;
    function bind(root) {
      root.querySelectorAll('[data-go]').forEach((b) => (b.onclick = (e) => { e.preventDefault(); go(b.dataset.go); }));
      const sel = $('#jobSel', root);
      if (sel) sel.onchange = () => { if (sel.value) { open(sel.value); go(firstOpen()); } };
    }
    app.bind = bind;
    const firstOpen = () => { const s = app.ship; const st = NS.steps.find((x) => !app.done(s, x)) || NS.steps[NS.steps.length - 1]; return 'step:' + st.id; };

    function viewHome(main) {
      const list = jobs();
      const samples = cfg.samples ? cfg.samples() : [];
      main.innerHTML = `<section class="hero"><h1>${cfg.icon} ${t(cfg.title)}</h1><p>${t(cfg.hero)}</p></section>
        <h2>${t(cfg.jobsTitle)}</h2>
        ${list.length ? ui.table([L('Job', 'العملية'), L('Direction', 'الاتجاه'), L('Customer', 'الزبون'), L('Progress', 'التقدّم'), L('Status', 'الحالة'), ''], list.map((s) => {
          const st = S(s), dn = st ? NS.steps.filter((x) => st.steps[x.id]).length : 0, h = cfg.handoff(s);
          return `<tr><td class="mono"><b>${esc(s.id)}</b></td><td>${s.direction === 'import' ? t(L('Import', 'استيراد')) : t(L('Export', 'تصدير'))}</td><td>${esc(s.parties.client.name)}</td><td>${dn}/${NS.steps.length}</td><td><span class="badge ${String(h.status).includes('closed') ? 'ok' : 'info'}">${esc(h.status)}</span></td><td class="num"><button class="btn sm primary" data-open="${esc(s.id)}">${t(L('Open', 'فتح'))}</button> <button class="btn sm" data-dl="${esc(s.id)}">JSON</button></td></tr>`;
        })) : `<div class="note warn">${t(cfg.emptyNote)}</div>`}
        <div class="grid c2"><div class="card"><h3>${t(L('Import a shipment JSON file', 'استيراد ملف شحنة JSON'))}</h3><input type="file" id="imp" accept=".json,application/json"></div>
        <div class="card"><h3>${t(L('Practice with a sample job', 'تدرّب على عملية نموذجية'))}</h3><p class="muted">${t(L('Shipments completed in the Operations module, ready for this department.', 'شحنات مكتملة في وحدة العمليات، جاهزة لهذا القسم.'))}</p><div class="row">${samples.map((x, i) => `<button class="btn" data-sample="${i}">${esc(x.id)} (${x.direction === 'import' ? t(L('import', 'استيراد')) : t(L('export', 'تصدير'))})</button>`).join('')}</div></div></div>
        ${cfg.homeExtra ? cfg.homeExtra() : ''}
        <div class="note warn">${t(cfg.disclaimer)}</div>`;
      main.querySelectorAll('[data-open]').forEach((b) => (b.onclick = () => { open(b.dataset.open); go(firstOpen()); }));
      main.querySelectorAll('[data-dl]').forEach((b) => (b.onclick = () => TS.downloadJSON(TS.store.get(b.dataset.dl))));
      main.querySelectorAll('[data-sample]').forEach((b) => (b.onclick = () => {
        const s = TS.clone(samples[Number(b.dataset.sample)]);
        if (TS.store.get(s.id) && !confirm(t(L('This job already exists in this browser. Replace it with a fresh copy?', 'هذه العملية موجودة في المتصفح. استبدالها بنسخة جديدة؟')))) return;
        delete s[cfg.key];
        if (cfg.prepareSample) cfg.prepareSample(s);
        TS.store.save(s); open(s.id); go(firstOpen());
      }));
      $('#imp', main).onchange = async (e) => {
        const f = e.target.files[0]; if (!f) return;
        try { const s = await TS.readJSONFile(f); if (!cfg.handoff(s)) throw new Error(t(cfg.emptyNote)); TS.store.save(s); open(s.id); go(firstOpen()); }
        catch (err) { TS.toast(err.message, 'bad'); }
      };
    }

    function viewStep(main, id) {
      const s = app.ship, st = NS.steps.find((x) => x.id === id) || NS.steps[0], i = app.idx(st.id), w = W(s, st.id);
      const done = app.done(s, st), un = app.unlocked(s, st);
      const tab = app.tab[st.id] || (Object.keys(w.parts).length ? 'task' : 'lesson');
      const pd = pdone(s, st);
      main.innerHTML = `<div class="step-head"><div class="num">${i + 1}</div><div><h1>${t(st.title)}</h1><p>${t(st.sub)}</p></div></div>
        <div class="row" style="margin:8px 0 14px"><span class="simclock">🗓 ${t(cfg.dateLabel)}: <b>${TS.fmtDate(S(s).today)}</b></span>${done ? `<span class="badge ok">✓ ${t(L('Completed', 'مُنجزة'))}</span>` : un ? `<span class="badge info">${t(L('In progress', 'قيد التنفيذ'))}</span>` : `<span class="badge">🔒</span>`}<span class="badge">${esc(s.id)}</span><span class="badge">${s.direction === 'import' ? t(L('Import', 'استيراد')) : t(L('Export', 'تصدير'))}</span></div>
        <div class="tabs"><button data-tab="lesson" class="${tab === 'lesson' ? 'on' : ''}">📘 ${t(L('Lesson', 'الدرس'))}</button><button data-tab="task" class="${tab === 'task' ? 'on' : ''}">🛠 ${t(L('Task', 'المهمة'))} <span class="badge ${pd === st.parts.length ? 'ok' : ''}">${pd}/${st.parts.length}</span></button>${st.quiz ? `<button data-tab="quiz" class="${tab === 'quiz' ? 'on' : ''}">❓ ${t(L('Quiz', 'اختبار'))} ${w.quiz.passed ? '<span class="badge ok">✓</span>' : ''}</button>` : ''}</div>
        <div id="sb"></div>
        <div class="row" style="justify-content:space-between;margin-top:18px">${i > 0 ? `<button class="btn" data-go="step:${NS.steps[i - 1].id}">← ${t(NS.steps[i - 1].title)}</button>` : '<span></span>'}${NS.steps[i + 1] ? `<button class="btn ${done ? 'primary' : ''}" data-go="step:${NS.steps[i + 1].id}">${t(NS.steps[i + 1].title)} →</button>` : ''}</div>`;
      main.querySelectorAll('[data-tab]').forEach((b) => (b.onclick = () => { app.tab[st.id] = b.dataset.tab; app.keep = false; app.render(); }));
      const b = $('#sb', main);
      if (tab === 'lesson') { b.innerHTML = `<div class="card lesson">${st.lesson(s)}</div><button class="btn primary" id="tt">${t(L('Go to the task', 'انتقل إلى المهمة'))} →</button>`; $('#tt', b).onclick = () => { app.tab[st.id] = 'task'; app.render(); }; }
      else if (tab === 'quiz') quiz(b, st);
      else if (!un) b.innerHTML = `<div class="note warn"><strong>🔒</strong>${t(L('Finish the previous steps first.', 'أنهِ المراحل السابقة أولًا.'))}</div>`;
      else parts(b, st);
    }
    function parts(b, st) {
      const s = app.ship, ctx = app.ctx(st);
      let first = true;
      st.parts.forEach((p, i) => {
        const done = !!ctx.w.parts[p.id], locked = !done && !first;
        if (!done) first = false;
        const el = document.createElement('section');
        el.className = 'part ' + (done ? 'done' : '') + (locked ? ' locked' : '');
        el.innerHTML = `<header><span class="badge ${done ? 'ok' : ''}">${done ? '✓' : String.fromCharCode(65 + i)}</span><h3>${t(typeof p.title === 'function' ? p.title(s) : p.title)}</h3>${locked ? '<span class="badge">🔒</span>' : ''}</header><div class="body"></div>`;
        b.appendChild(el);
        const body = el.querySelector('.body');
        if (done) body.innerHTML = p.summary ? p.summary(ctx) : `<p class="muted">✓ ${t(L('Done.', 'تم.'))}</p>`;
        else if (!locked) p.render(ctx, body);
      });
      if (st.parts.every((p) => ctx.w.parts[p.id]) && st.quiz && !ctx.w.quiz.passed) {
        const n = document.createElement('div'); n.className = 'note';
        n.innerHTML = `<strong>${t(L('Task finished!', 'انتهت المهمة!'))}</strong>${t(L('Pass the quiz to complete this step.', 'اجتز الاختبار لإنهاء المرحلة.'))} <button class="btn sm primary" id="tq">${t(L('Open quiz', 'افتح الاختبار'))}</button>`;
        b.appendChild(n); n.querySelector('#tq').onclick = () => { app.tab[st.id] = 'quiz'; app.render(); };
      }
      if (app.done(s, st)) {
        const i = app.idx(st.id), n = document.createElement('div'); n.className = 'note ok';
        n.innerHTML = `<strong>✓ ${t(L('Step complete', 'المرحلة مُنجزة'))}</strong>${NS.steps[i + 1] ? `<button class="btn sm ok" data-go="step:${NS.steps[i + 1].id}">${t(L('Next step', 'المرحلة التالية'))} →</button>` : ''}`;
        b.appendChild(n); bind(n);
      }
    }
    function quiz(b, st) {
      const s = app.ship, w = W(s, st.id);
      w.quiz.ans = w.quiz.ans || {};
      const ck = w.quiz.checked;
      b.innerHTML = st.quiz.map((q, qi) => { const a = w.quiz.ans[qi], ok = a === q.a; return `<div class="q"><div class="qt">${qi + 1}. ${t(q.q)}</div>${q.o.map((o, oi) => `<label class="check ${ck && a === oi ? (ok ? 'right' : 'wrong') : ''}"><input type="radio" name="q${qi}" value="${oi}" ${a === oi ? 'checked' : ''}><span>${t(o)}</span></label>`).join('')}${ck && q.e && (w.quiz.passed || !ok) ? `<div class="explain note ${ok ? 'ok' : 'bad'}">${t(q.e)}</div>` : ''}</div>`; }).join('') + `<div class="row"><button class="btn primary" id="qc">${t(L('Check answers', 'تحقّق من الإجابات'))}</button>${w.quiz.passed ? `<span class="badge ok">✓</span>` : ''}</div>`;
      b.querySelectorAll('input[type=radio]').forEach((r) => r.addEventListener('change', () => { w.quiz.ans[Number(r.name.slice(1))] = Number(r.value); w.quiz.checked = false; app.save(); }));
      $('#qc', b).onclick = () => {
        w.quiz.checked = true;
        const wrong = st.quiz.filter((q, qi) => w.quiz.ans[qi] !== q.a).length;
        if (wrong) { S(s).score.mistakes += wrong; TS.toast(t(L(`${wrong} wrong — read the explanations`, `${wrong} خطأ — اقرأ الشرح`)), 'bad'); }
        else { w.quiz.passed = true; app.check(s, st); }
        app.save(); app.render();
      };
    }
    function viewDocs(main) {
      const s = app.ship, list = NS.docs(s), cur = list.find((x) => x.id === app.doc) || list[0];
      main.innerHTML = `<h1>📄 ${t(L('Documents', 'المستندات'))}</h1><div class="row no-print" style="margin-bottom:12px">${list.map((x) => `<button class="btn sm ${cur && x.id === cur.id ? 'primary' : ''}" data-doc="${x.id}">${esc(t(x.name))}</button>`).join('')}${cur ? `<button class="btn sm ghost" onclick="window.print()">🖨 ${t(L('Print / PDF', 'طباعة / PDF'))}</button>` : `<p class="muted">${t(L('Documents appear as you complete the steps.', 'تظهر المستندات كلما أنجزت المراحل.'))}</p>`}</div>${cur ? `<p class="doc-hint no-print">💡 ${t(L('Click any underlined label or term on the document to see what it means (English + Arabic).', 'انقر على أي عنوان أو مصطلح مسطّر في المستند لمعرفة معناه (إنجليزي + عربي).'))}</p>` + cur.html(s) : ''}`;
      main.querySelectorAll('[data-doc]').forEach((b) => (b.onclick = () => { app.doc = b.dataset.doc; app.render(); }));
    }
    function viewInbox(main) {
      const s = app.ship;
      const list = s.emails.filter((e) => String(e.step || '').startsWith(cfg.prefix)).slice().reverse();
      const sel = list.find((e) => e.id === app.mailSel) || list[0];
      if (sel && !sel.read) { sel.read = true; app.save(); }
      main.innerHTML = `<h1>✉ ${t(L('Email', 'البريد'))}</h1><p class="muted mono">${esc(cfg.email)}</p>
        <div class="mail"><div class="mail-list">${list.map((e) => `<div class="mail-item ${e === sel ? 'on' : ''} ${!e.read ? 'unread' : ''}" data-m="${e.id}"><div class="from"><span>${e.box === 'in' ? '⬅ ' + esc(e.from) : '➡ ' + esc(e.to)}</span><span>${TS.fmtDate(e.date, false)}</span></div><div class="subj">${esc(t(e.subject))}</div></div>`).join('') || `<p class="muted" style="padding:14px">—</p>`}</div>
        <div class="mail-read">${sel ? `<h3>${esc(t(sel.subject))}</h3><div class="meta"><b>${t(L('From', 'من'))}:</b> ${esc(sel.from)}<br><b>${t(L('To', 'إلى'))}:</b> ${esc(sel.to)}<br><b>${t(L('Date', 'التاريخ'))}:</b> ${TS.fmtDate(sel.date)}${sel.attachments && sel.attachments.length ? '<br>📎 ' + sel.attachments.map(esc).join(', ') : ''}</div><div class="mail-body">${t(sel.body)}</div>` : ''}</div></div>`;
      main.querySelectorAll('[data-m]').forEach((b) => (b.onclick = () => { app.mailSel = b.dataset.m; app.render(); }));
    }

    document.addEventListener('ts:lang', () => app.render());
    window.addEventListener('DOMContentLoaded', () => {
      load();
      const h = location.hash.slice(1);
      app.view = h || (app.ship ? firstOpen() : 'home');
      app.render();
    });
    return app;
  };
})();
