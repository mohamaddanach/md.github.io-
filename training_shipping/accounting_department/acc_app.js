/* Accounting module — application shell, step engine, journal-entry widget, ledger, documents */
(function () {
  const L = TS.L, t = TS.t, esc = TS.esc, R = TS.round2;
  const ACC = window.ACC;
  const ui = TS.ui;
  ui.defaultFrom = ACC.company.email;
  const app = (ACC.app = { ship: null, view: 'home', tab: {}, acct: '512', doc: null, mailSel: null });
  ACC.steps = ACC.steps || [];

  /* ======================= state ======================= */
  const jobs = () => TS.store.list().filter((s) => s.handoffs && s.handoffs.accounting);
  ACC.init = (s) => {
    if (s.accounting) return s.accounting;
    const h = s.handoffs.accounting;
    s.accounting = {
      startedAt: new Date().toISOString(), today: h.sentSim, steps: {}, work: {}, docs: {}, score: { mistakes: 0, hints: 0 },
      journal: [{ id: 'J0', step: 'opening', date: h.sentSim, ref: 'OPEN', narrative: 'Opening balances (training): bank funded by share capital', lines: [{ acc: '512', dr: ACC.OPENING_BANK, cr: 0 }, { acc: '101', dr: 0, cr: ACC.OPENING_BANK }] }],
    };
    h.status = 'in progress (accounting)';
    s.currentDepartment = 'accounting';
    return s.accounting;
  };
  function load() {
    const id = sessionStorage.getItem('acc_job') || '';
    const s = id ? TS.store.get(id) : null;
    app.ship = s && s.handoffs && s.handoffs.accounting ? s : null;
    if (app.ship) ACC.init(app.ship);
  }
  const open = (id) => { try { sessionStorage.setItem('acc_job', id); } catch (e) { /* ignore */ } load(); app.save(); };
  app.save = () => { if (app.ship) TS.store.save(app.ship); };
  app.mutate = (id, fn) => {
    if (app.ship && app.ship.id === id) { fn(app.ship); app.save(); app.render(); }
    else { const s = TS.store.get(id); if (s) { fn(s); TS.store.save(s); } }
  };

  /* ======================= step engine ======================= */
  const A = (s) => s.accounting;
  const W = (s, id) => (A(s).work[id] = A(s).work[id] || { parts: {}, form: {}, data: {}, quiz: {} });
  app.idx = (id) => ACC.steps.findIndex((x) => x.id === id);
  app.done = (s, st) => !!(A(s).steps[st.id] && A(s).steps[st.id].done);
  app.unlocked = (s, st) => { const i = app.idx(st.id); return i === 0 || ACC.steps.slice(0, i).every((x) => app.done(s, x)); };
  const pdone = (s, st) => st.parts.filter((p) => W(s, st.id).parts[p.id]).length;

  ACC.email = (s, box, e) => {
    const m = Object.assign({ id: TS.uid('MAIL'), box, date: A(s).today, time: new Date().toISOString(), read: box === 'out', attachments: [] }, e);
    s.emails.push(m); return m;
  };

  app.ctx = (st) => {
    const s = app.ship, w = W(s, st.id);
    return {
      ship: s, d: ACC.d(s), step: st, w, data: w.data, save: app.save, rerender: () => app.render(),
      mistake(n) { A(s).score.mistakes += n || 1; app.save(); },
      hint() { A(s).score.hints += 1; app.save(); },
      finish(pid) { w.parts[pid] = true; app.check(s, st); app.save(); app.render(); },
      send(e) { return ACC.email(s, 'out', Object.assign({ from: ACC.company.email, step: 'acc_' + st.id }, e)); },
      receive(e, delay) {
        const id = s.id;
        const fire = () => app.mutate(id, (sh) => { const m = ACC.email(sh, 'in', Object.assign({ to: ACC.company.email, step: 'acc_' + st.id, read: false }, e)); if (e.onArrive) e.onArrive(sh); delete m.onArrive; TS.toast('✉ ' + t(L('New email from ', 'بريد جديد من ')) + m.from, 'mail'); });
        if (delay) setTimeout(fire, delay); else fire();
      },
      advance(date) { if (date && date > A(s).today) A(s).today = date; },
      post(entry) { A(s).journal = A(s).journal.filter((j) => j.key !== entry.key); A(s).journal.push(Object.assign({ id: 'J' + A(s).journal.length, step: st.id, date: A(s).today }, entry)); },
    };
  };
  app.check = (s, st) => {
    const w = W(s, st.id);
    if (st.parts.every((p) => w.parts[p.id]) && (!st.quiz || w.quiz.passed) && !app.done(s, st)) {
      A(s).steps[st.id] = { done: true, at: new Date().toISOString() };
      TS.toast('✓ ' + t(L('Step completed: ', 'تم إنجاز المرحلة: ')) + t(st.title), 'ok');
    }
  };

  /* ======================= journal entry widget ======================= */
  const accOpts = (sel) => `<option value="">—</option>` + ACC.coa.map((a) => `<option value="${a.n}" ${a.n === sel ? 'selected' : ''}>${a.n} — ${esc(t(a.name))}</option>`).join('');
  const agg = (lines) => {
    const m = {};
    lines.forEach((l) => { if (!l.acc) return; const k = l.acc; m[k] = m[k] || { dr: 0, cr: 0 }; m[k].dr += Number(l.dr || 0); m[k].cr += Number(l.cr || 0); });
    Object.values(m).forEach((v) => { v.dr = R(v.dr); v.cr = R(v.cr); });
    return m;
  };
  /* opts: { key, ref, narrative (L), expected: [{acc, dr, cr}], help (L), onSuccess } */
  ui.journal = (ctx, body, opts) => {
    const st = (ctx.w.form[opts.key] = ctx.w.form[opts.key] || { rows: [{ acc: '', dr: '', cr: '' }, { acc: '', dr: '', cr: '' }], fb: null });
    const exp = opts.expected.filter((x) => R(x.dr) || R(x.cr));
    const draw = () => {
      const tdr = R(st.rows.reduce((a, r) => a + Number(r.dr || 0), 0)), tcr = R(st.rows.reduce((a, r) => a + Number(r.cr || 0), 0));
      body.innerHTML = `${opts.help ? `<div class="note" style="white-space:pre-line">${t(opts.help)}</div>` : ''}
        <p><b>${t(L('Journal entry', 'قيد يومية'))}</b> · ${esc(opts.ref)} · ${TS.fmtDate(A(ctx.ship).today, false)} — ${esc(t(opts.narrative))}</p>
        <div class="table-wrap"><table><thead><tr><th>${t(L('Account', 'الحساب'))}</th><th class="num">${t(L('Debit', 'مدين'))}</th><th class="num">${t(L('Credit', 'دائن'))}</th><th></th></tr></thead><tbody>
        ${st.rows.map((r, i) => `<tr><td><select data-r="${i}" data-f="acc" style="min-width:260px">${accOpts(r.acc)}</select></td><td class="num"><input type="number" step="any" data-r="${i}" data-f="dr" value="${esc(r.dr)}" style="width:120px"></td><td class="num"><input type="number" step="any" data-r="${i}" data-f="cr" value="${esc(r.cr)}" style="width:120px"></td><td><button class="btn sm ghost" data-del="${i}" title="remove">✕</button></td></tr>`).join('')}
        <tr class="total"><td>${t(L('Totals', 'المجاميع'))} ${tdr === tcr && tdr > 0 ? '<span class="badge ok">' + t(L('balanced', 'متوازن')) + '</span>' : '<span class="badge warn">' + t(L('not balanced', 'غير متوازن')) + '</span>'}</td><td class="num">${TS.num(tdr)}</td><td class="num">${TS.num(tcr)}</td><td></td></tr></tbody></table></div>
        ${st.fb ? `<div class="note bad">${st.fb.map((x) => '• ' + esc(x)).join('<br>')}</div>` : ''}
        <div class="row"><button class="btn sm" data-add>＋ ${t(L('Add line', 'أضف سطرًا'))}</button><span class="spacer" style="flex:1"></span><button class="btn primary" data-act="check">${t(L('Post entry', 'رحّل القيد'))}</button><button class="btn ghost" data-act="answer">${t(L('Show me the answer', 'أرني الجواب'))}</button></div>`;
      body.querySelectorAll('[data-r]').forEach((el) => el.addEventListener('change', () => {
        const r = st.rows[Number(el.dataset.r)]; r[el.dataset.f] = el.dataset.f === 'acc' ? el.value : (el.value === '' ? '' : Number(el.value));
        ctx.save(); draw();
      }));
      body.querySelectorAll('[data-del]').forEach((b) => (b.onclick = () => { st.rows.splice(Number(b.dataset.del), 1); if (!st.rows.length) st.rows.push({ acc: '', dr: '', cr: '' }); ctx.save(); draw(); }));
      body.querySelector('[data-add]').onclick = () => { st.rows.push({ acc: '', dr: '', cr: '' }); ctx.save(); draw(); };
      body.querySelector('[data-act=answer]').onclick = () => { ctx.hint(); st.rows = exp.map((x) => ({ acc: x.acc, dr: R(x.dr) || '', cr: R(x.cr) || '' })); st.fb = null; ctx.save(); draw(); };
      body.querySelector('[data-act=check]').onclick = () => {
        const fb = [];
        const rows = st.rows.filter((r) => r.acc || r.dr || r.cr);
        const tD = R(rows.reduce((a, r) => a + Number(r.dr || 0), 0)), tC = R(rows.reduce((a, r) => a + Number(r.cr || 0), 0));
        if (rows.some((r) => !r.acc)) fb.push(t(L('Every line needs an account.', 'كل سطر يحتاج حسابًا.')));
        if (rows.some((r) => Number(r.dr || 0) && Number(r.cr || 0))) fb.push(t(L('A line is either debit or credit, not both.', 'السطر إما مدين أو دائن وليس الاثنين.')));
        if (Math.abs(tD - tC) > 0.01) fb.push(t(L(`Debits (${TS.num(tD)}) must equal credits (${TS.num(tC)}).`, `المدين (${TS.num(tD)}) يجب أن يساوي الدائن (${TS.num(tC)}).`)));
        const got = agg(rows), want = agg(exp);
        Object.keys(want).forEach((k) => {
          const g = got[k] || { dr: 0, cr: 0 }, x = want[k];
          if (Math.abs(g.dr - x.dr) > 0.5 || Math.abs(g.cr - x.cr) > 0.5) {
            const nm = k + ' ' + t(ACC.acc(k).name);
            if (!got[k]) fb.push(t(L(`Account ${nm} is missing.`, `الحساب ${nm} ناقص.`)));
            else fb.push(t(L(`Account ${nm}: wrong side or amount.`, `الحساب ${nm}: الجهة أو المبلغ خطأ.`)));
          }
        });
        Object.keys(got).forEach((k) => { if (!want[k]) fb.push(t(L(`Account ${k} should not be used in this entry.`, `الحساب ${k} لا يجب استعماله في هذا القيد.`))); });
        if (fb.length) { st.fb = fb; ctx.mistake(1); ctx.save(); draw(); TS.toast(t(L('Entry not correct yet', 'القيد غير صحيح بعد')), 'bad'); return; }
        st.fb = null;
        ctx.post({ key: opts.key, ref: opts.ref, narrative: t(opts.narrative), lines: rows.map((r) => ({ acc: r.acc, dr: R(r.dr || 0), cr: R(r.cr || 0) })) });
        opts.onSuccess && opts.onSuccess();
      };
    };
    draw();
  };

  /* ======================= ledger helpers ======================= */
  ACC.balances = (s) => {
    const b = {};
    A(s).journal.forEach((j) => j.lines.forEach((l) => { b[l.acc] = b[l.acc] || { dr: 0, cr: 0 }; b[l.acc].dr = R(b[l.acc].dr + l.dr); b[l.acc].cr = R(b[l.acc].cr + l.cr); }));
    return b;
  };
  ACC.bal = (s, n) => { const x = ACC.balances(s)[n]; return x ? R(x.dr - x.cr) : 0; };

  /* ======================= rendering ======================= */
  const $ = (q, r) => (r || document).querySelector(q);
  function topbar() {
    const list = jobs();
    return `<header class="topbar"><a class="brand" href="../index.html">⚓ Training Shipping <small>/ ${t(L('Accounting Department', 'قسم المحاسبة'))}</small></a><span class="spacer"></span>
      ${list.length ? `<select id="jobSel">${app.ship ? '' : '<option value="">—</option>'}${list.map((s) => `<option value="${esc(s.id)}" ${app.ship && app.ship.id === s.id ? 'selected' : ''}>${esc(s.id)}</option>`).join('')}</select>` : ''}
      <button class="btn sm" data-go="home">📂 ${t(L('Jobs', 'الملفات'))}</button><a class="btn sm" href="../operations_pricing_freight_forwarder/index.html">⛴ ${t(L('Operations', 'قسم العمليات'))}</a>${TS.langSwitch()}</header>`;
  }
  function sidebar() {
    const s = app.ship;
    const nav = (v, icon, l, extra) => `<button class="nav-item ${app.view === v ? 'active' : ''}" data-go="${v}"><span class="dot">${icon}</span><span>${t(l)}</span>${extra || ''}</button>`;
    let html = '';
    if (s) {
      const dn = ACC.steps.filter((x) => app.done(s, x)).length;
      const unread = s.emails.filter((e) => e.box === 'in' && !e.read && String(e.step || '').startsWith('acc_')).length;
      html += `<h4>${esc(s.id)}</h4><div class="progress"><i style="width:${Math.round((dn / ACC.steps.length) * 100)}%"></i></div><div class="muted" style="font-size:.8rem;margin:0 8px 6px">${dn}/${ACC.steps.length} ${t(L('steps', 'مراحل'))}</div>
        <h4>${t(L('Accounting steps', 'مراحل المحاسبة'))}</h4><div class="nav-group">${ACC.steps.map((st, i) => { const d = app.done(s, st), u = app.unlocked(s, st); return `<button class="nav-item ${d ? 'done' : ''} ${!u ? 'locked' : ''} ${app.view === 'step:' + st.id ? 'active' : ''}" data-go="step:${st.id}"><span class="dot">${d ? '✓' : i + 1}</span><span>${t(st.title)}</span>${!u ? '<span class="badge">🔒</span>' : ''}</button>`; }).join('')}</div>
        <h4>${t(L('Books', 'الدفاتر'))}</h4><div class="nav-group">
        ${nav('journal', 'J', L('Journal', 'دفتر اليومية'))}${nav('ledger', 'Σ', L('Ledger & trial balance', 'الأستاذ وميزان المراجعة'))}${nav('docs', '📄', L('Documents', 'المستندات'))}${nav('inbox', '✉', L('Email', 'البريد'), unread ? `<span class="badge n">${unread}</span>` : '')}</div>`;
    }
    html += `<h4>${t(L('Learn', 'تعلّم'))}</h4><div class="nav-group">${nav('guide', '🇱🇧', L('Lebanon accounting guide', 'دليل المحاسبة في لبنان'))}${nav('coa', '#', L('Chart of accounts', 'المخطط المحاسبي'))}</div>`;
    return `<aside class="side">${html}</aside>`;
  }

  app.render = () => {
    TS.applyLang();
    const root = document.getElementById('app'), y = window.scrollY;
    root.innerHTML = topbar() + `<div class="layout">${sidebar()}<main class="main" id="main"></main></div>`;
    const main = $('#main');
    if (!app.ship && !['home', 'guide', 'coa'].includes(app.view)) app.view = 'home';
    try {
      const v = app.view;
      if (v === 'home') viewHome(main);
      else if (v.startsWith('step:')) viewStep(main, v.slice(5));
      else if (v === 'journal') viewJournal(main);
      else if (v === 'ledger') viewLedger(main);
      else if (v === 'docs') viewDocs(main);
      else if (v === 'inbox') viewInbox(main);
      else if (v === 'guide') viewGuide(main);
      else if (v === 'coa') viewCoa(main);
    } catch (err) { console.error(err); main.innerHTML = `<div class="note bad"><strong>Error</strong>${esc(err.message)}</div>`; }
    if (app.keep) window.scrollTo(0, y);
    app.keep = true;
    bind(root);
  };
  const go = (v) => { app.view = v; app.keep = false; history.replaceState(null, '', '#' + v); app.render(); window.scrollTo(0, 0); };
  app.go = go;
  function bind(root) {
    root.querySelectorAll('[data-go]').forEach((b) => (b.onclick = (e) => { e.preventDefault(); go(b.dataset.go); }));
    const sel = $('#jobSel', root);
    if (sel) sel.onchange = () => { if (sel.value) { open(sel.value); go(firstOpenStep()); } };
  }
  const firstOpenStep = () => { const s = app.ship; const st = ACC.steps.find((x) => !app.done(s, x)) || ACC.steps[ACC.steps.length - 1]; return 'step:' + st.id; };

  /* ---------------- home ---------------- */
  function viewHome(main) {
    const list = jobs();
    main.innerHTML = `<section class="hero"><h1>${t(L('Accounting Department', 'قسم المحاسبة'))}</h1><p>${t(L('Jobs closed by Operations arrive here inside the shipment JSON file. You check the job, issue the tax invoice, post the entries (sales, purchases, bank, deposits), reconcile the bank, prepare the VAT return and close the job — Lebanese rules, VAT 11%, USD with LBP equivalents.', 'تصل هنا العمليات التي أقفلتها العمليات داخل ملف JSON للشحنة. تراجع العملية، تصدر الفاتورة الضريبية، ترحّل القيود (مبيعات، مشتريات، مصرف، تأمينات)، تجري التسوية المصرفية، تحضّر التصريح الضريبي وتقفل العملية — وفق القواعد اللبنانية، ضريبة 11%، بالدولار مع ما يعادله بالليرة.'))}</p></section>
      <h2>${t(L('Jobs received from Operations', 'العمليات الواردة من قسم العمليات'))}</h2>
      ${list.length ? ui.table([L('Job', 'العملية'), L('Customer', 'الزبون'), L('Invoice total', 'مجموع الفاتورة'), L('Progress', 'التقدّم'), L('Status', 'الحالة'), ''], list.map((s) => {
        const dn = s.accounting ? ACC.steps.filter((x) => s.accounting.steps[x.id]).length : 0;
        return `<tr><td class="mono"><b>${esc(s.id)}</b></td><td>${esc(s.parties.client.name)}</td><td class="num">USD ${TS.num(s.handoffs.accounting.pack.invoice.total)}</td><td>${dn}/${ACC.steps.length}</td><td><span class="badge ${String(s.handoffs.accounting.status).includes('closed') ? 'ok' : 'info'}">${esc(s.handoffs.accounting.status)}</span></td><td class="num"><button class="btn sm primary" data-open="${esc(s.id)}">${t(L('Open', 'فتح'))}</button> <button class="btn sm" data-dl="${esc(s.id)}">JSON</button></td></tr>`;
      })) : `<div class="note warn">${t(L('No job has been handed to Accounting yet. Finish a shipment in Operations (step 12), import a JSON file, or load a sample job below.', 'لم تُسلَّم أي عملية للمحاسبة بعد. أنهِ شحنة في العمليات (المرحلة 12)، أو استورد ملف JSON، أو حمّل عملية نموذجية أدناه.'))}</div>`}
      <div class="grid c2"><div class="card"><h3>${t(L('Import a shipment JSON file', 'استيراد ملف شحنة JSON'))}</h3><input type="file" id="imp" accept=".json,application/json"></div>
      <div class="card"><h3>${t(L('Practice with a sample job', 'تدرّب على عملية نموذجية'))}</h3><p class="muted">${t(L('Completed shipments from the Operations module, ready for accounting.', 'شحنات مكتملة من وحدة العمليات، جاهزة للمحاسبة.'))}</p><div class="row">${(window.ACC_SAMPLES || []).map((x, i) => `<button class="btn" data-sample="${i}">${esc(x.id)} (${x.direction === 'import' ? t(L('import', 'استيراد')) : t(L('export', 'تصدير'))})</button>`).join('')}</div></div></div>
      <div class="note warn">${t(ACC.disclaimer)}</div>`;
    main.querySelectorAll('[data-open]').forEach((b) => (b.onclick = () => { open(b.dataset.open); go(firstOpenStep()); }));
    main.querySelectorAll('[data-dl]').forEach((b) => (b.onclick = () => TS.downloadJSON(TS.store.get(b.dataset.dl))));
    main.querySelectorAll('[data-sample]').forEach((b) => (b.onclick = () => {
      const s = TS.clone(window.ACC_SAMPLES[Number(b.dataset.sample)]);
      if (TS.store.get(s.id) && !confirm(t(L('This job already exists in this browser. Replace it with a fresh copy?', 'هذه العملية موجودة في المتصفح. استبدالها بنسخة جديدة؟')))) return;
      delete s.accounting; s.handoffs.accounting.status = 'submitted';
      TS.store.save(s); open(s.id); go(firstOpenStep());
    }));
    $('#imp', main).onchange = async (e) => {
      const f = e.target.files[0]; if (!f) return;
      try { const s = await TS.readJSONFile(f); if (!s.handoffs || !s.handoffs.accounting) throw new Error(t(L('This shipment has not been handed to Accounting yet (finish step 12 in Operations).', 'لم تُسلَّم هذه الشحنة للمحاسبة بعد (أنهِ المرحلة 12 في العمليات).'))); TS.store.save(s); open(s.id); go(firstOpenStep()); }
      catch (err) { TS.toast(err.message, 'bad'); }
    };
  }

  /* ---------------- step ---------------- */
  function viewStep(main, id) {
    const s = app.ship, st = ACC.steps.find((x) => x.id === id) || ACC.steps[0], i = app.idx(st.id), w = W(s, st.id);
    const done = app.done(s, st), un = app.unlocked(s, st);
    const tab = app.tab[st.id] || (Object.keys(w.parts).length ? 'task' : 'lesson');
    const pd = pdone(s, st);
    main.innerHTML = `<div class="step-head"><div class="num">${i + 1}</div><div><h1>${t(st.title)}</h1><p>${t(st.sub)}</p></div></div>
      <div class="row" style="margin:8px 0 14px"><span class="simclock">🗓 ${t(L('Accounting date', 'التاريخ المحاسبي'))}: <b>${TS.fmtDate(A(s).today)}</b></span>${done ? `<span class="badge ok">✓ ${t(L('Completed', 'مُنجزة'))}</span>` : un ? `<span class="badge info">${t(L('In progress', 'قيد التنفيذ'))}</span>` : `<span class="badge">🔒</span>`}<span class="badge">${esc(s.id)}</span></div>
      <div class="tabs"><button data-tab="lesson" class="${tab === 'lesson' ? 'on' : ''}">📘 ${t(L('Lesson', 'الدرس'))}</button><button data-tab="task" class="${tab === 'task' ? 'on' : ''}">🛠 ${t(L('Task', 'المهمة'))} <span class="badge ${pd === st.parts.length ? 'ok' : ''}">${pd}/${st.parts.length}</span></button>${st.quiz ? `<button data-tab="quiz" class="${tab === 'quiz' ? 'on' : ''}">❓ ${t(L('Quiz', 'اختبار'))} ${w.quiz.passed ? '<span class="badge ok">✓</span>' : ''}</button>` : ''}</div>
      <div id="sb"></div>
      <div class="row" style="justify-content:space-between;margin-top:18px">${i > 0 ? `<button class="btn" data-go="step:${ACC.steps[i - 1].id}">← ${t(ACC.steps[i - 1].title)}</button>` : '<span></span>'}${ACC.steps[i + 1] ? `<button class="btn ${done ? 'primary' : ''}" data-go="step:${ACC.steps[i + 1].id}">${t(ACC.steps[i + 1].title)} →</button>` : ''}</div>`;
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
      n.innerHTML = `<strong>✓ ${t(L('Step complete', 'المرحلة مُنجزة'))}</strong>${ACC.steps[i + 1] ? `<button class="btn sm ok" data-go="step:${ACC.steps[i + 1].id}">${t(L('Next step', 'المرحلة التالية'))} →</button>` : ''}`;
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
      if (wrong) { A(s).score.mistakes += wrong; TS.toast(t(L(`${wrong} wrong — read the explanations`, `${wrong} خطأ — اقرأ الشرح`)), 'bad'); }
      else { w.quiz.passed = true; app.check(s, st); }
      app.save(); app.render();
    };
  }

  /* ---------------- books ---------------- */
  function viewJournal(main) {
    const s = app.ship, j = A(s).journal;
    const tot = j.reduce((a, e) => { e.lines.forEach((l) => { a.dr += l.dr; a.cr += l.cr; }); return a; }, { dr: 0, cr: 0 });
    main.innerHTML = `<h1>J ${t(L('General journal', 'دفتر اليومية العام'))}</h1><p class="muted">${t(L('Every entry you post is stored in the shipment file (accounting.journal).', 'كل قيد ترحّله يُحفظ في ملف الشحنة (accounting.journal).'))}</p>
      ${ui.table([L('Date', 'التاريخ'), L('Ref', 'المرجع'), L('Account', 'الحساب'), L('Narrative', 'البيان'), { l: L('Debit', 'مدين'), num: 1 }, { l: L('Credit', 'دائن'), num: 1 }], j.map((e) => e.lines.map((l, i) => `<tr${i === 0 ? ' style="border-top:2px solid var(--line)"' : ''}><td>${i === 0 ? TS.fmtDate(e.date, false) : ''}</td><td class="mono">${i === 0 ? esc(e.ref) : ''}</td><td style="${l.cr ? 'padding-inline-start:28px' : ''}">${esc(l.acc)} ${esc(t(ACC.acc(l.acc).name))}</td><td>${i === 0 ? esc(e.narrative) : ''}</td><td class="num">${l.dr ? TS.num(l.dr) : ''}</td><td class="num">${l.cr ? TS.num(l.cr) : ''}</td></tr>`).join('')).concat([`<tr class="total"><td colspan="4">${t(L('Totals', 'المجاميع'))}</td><td class="num">${TS.num(tot.dr)}</td><td class="num">${TS.num(tot.cr)}</td></tr>`]))}`;
  }
  function viewLedger(main) {
    const s = app.ship, b = ACC.balances(s);
    const accs = ACC.coa.filter((a) => b[a.n]);
    const td = R(accs.reduce((x, a) => x + Math.max(0, b[a.n].dr - b[a.n].cr), 0)), tc = R(accs.reduce((x, a) => x + Math.max(0, b[a.n].cr - b[a.n].dr), 0));
    const cur = b[app.acct] ? app.acct : (accs[0] && accs[0].n);
    let run = 0;
    const moves = [];
    A(s).journal.forEach((e) => e.lines.filter((l) => l.acc === cur).forEach((l) => { run = R(run + l.dr - l.cr); moves.push(`<tr><td>${TS.fmtDate(e.date, false)}</td><td class="mono">${esc(e.ref)}</td><td>${esc(e.narrative)}</td><td class="num">${l.dr ? TS.num(l.dr) : ''}</td><td class="num">${l.cr ? TS.num(l.cr) : ''}</td><td class="num">${TS.num(run)}</td></tr>`); }));
    main.innerHTML = `<h1>Σ ${t(L('Trial balance', 'ميزان المراجعة'))} — ${esc(s.id)}</h1>
      ${ui.table([L('Account', 'الحساب'), L('Class', 'الفئة'), { l: L('Debits', 'مجموع المدين'), num: 1 }, { l: L('Credits', 'مجموع الدائن'), num: 1 }, { l: L('Debit balance', 'رصيد مدين'), num: 1 }, { l: L('Credit balance', 'رصيد دائن'), num: 1 }], accs.map((a) => { const x = b[a.n], bal = R(x.dr - x.cr); return `<tr class="clickable ${a.n === cur ? 'sel' : ''}" data-acct="${a.n}"><td><b>${a.n}</b> ${esc(t(a.name))}</td><td>${a.c} ${esc(t(ACC.classNames[a.c]))}</td><td class="num">${TS.num(x.dr)}</td><td class="num">${TS.num(x.cr)}</td><td class="num">${bal > 0 ? TS.num(bal) : ''}</td><td class="num">${bal < 0 ? TS.num(-bal) : ''}</td></tr>`; }).concat([`<tr class="total"><td colspan="4">${t(L('Totals', 'المجاميع'))} ${Math.abs(td - tc) < 0.01 ? '<span class="badge ok">' + t(L('balanced', 'متوازن')) + '</span>' : '<span class="badge bad">!</span>'}</td><td class="num">${TS.num(td)}</td><td class="num">${TS.num(tc)}</td></tr>`]))}
      ${cur ? `<h2>${t(L('Ledger', 'دفتر الأستاذ'))}: ${cur} ${esc(t(ACC.acc(cur).name))}</h2>${ui.table([L('Date', 'التاريخ'), L('Ref', 'المرجع'), L('Narrative', 'البيان'), { l: L('Debit', 'مدين'), num: 1 }, { l: L('Credit', 'دائن'), num: 1 }, { l: L('Balance', 'الرصيد'), num: 1 }], moves)}` : ''}`;
    main.querySelectorAll('[data-acct]').forEach((r) => (r.onclick = () => { app.acct = r.dataset.acct; app.render(); }));
  }
  function viewDocs(main) {
    const s = app.ship, list = ACC.docs(s), cur = list.find((x) => x.id === app.doc) || list[0];
    main.innerHTML = `<h1>📄 ${t(L('Accounting documents', 'المستندات المحاسبية'))}</h1><div class="row no-print" style="margin-bottom:12px">${list.map((x) => `<button class="btn sm ${cur && x.id === cur.id ? 'primary' : ''}" data-doc="${x.id}">${esc(t(x.name))}</button>`).join('')}${cur ? `<button class="btn sm ghost" onclick="window.print()">🖨 ${t(L('Print / PDF', 'طباعة / PDF'))}</button>` : ''}</div>${cur ? `<div dir="ltr">${cur.html(s)}</div>` : ''}`;
    main.querySelectorAll('[data-doc]').forEach((b) => (b.onclick = () => { app.doc = b.dataset.doc; app.render(); }));
  }
  function viewInbox(main) {
    const s = app.ship;
    const list = s.emails.filter((e) => String(e.step || '').startsWith('acc_')).slice().reverse();
    const sel = list.find((e) => e.id === app.mailSel) || list[0];
    if (sel && !sel.read) { sel.read = true; app.save(); }
    main.innerHTML = `<h1>✉ ${t(L('Accounting email', 'بريد المحاسبة'))}</h1><p class="muted mono">${esc(ACC.company.email)}</p>
      <div class="mail"><div class="mail-list">${list.map((e) => `<div class="mail-item ${e === sel ? 'on' : ''} ${!e.read ? 'unread' : ''}" data-m="${e.id}"><div class="from"><span>${e.box === 'in' ? '⬅ ' + esc(e.from) : '➡ ' + esc(e.to)}</span><span>${TS.fmtDate(e.date, false)}</span></div><div class="subj">${esc(t(e.subject))}</div></div>`).join('') || `<p class="muted" style="padding:14px">—</p>`}</div>
      <div class="mail-read">${sel ? `<h3>${esc(t(sel.subject))}</h3><div class="meta"><b>${t(L('From', 'من'))}:</b> ${esc(sel.from)}<br><b>${t(L('To', 'إلى'))}:</b> ${esc(sel.to)}<br><b>${t(L('Date', 'التاريخ'))}:</b> ${TS.fmtDate(sel.date)}${sel.attachments && sel.attachments.length ? '<br>📎 ' + sel.attachments.map(esc).join(', ') : ''}</div><div class="mail-body">${t(sel.body)}</div>` : ''}</div></div>`;
    main.querySelectorAll('[data-m]').forEach((b) => (b.onclick = () => { app.mailSel = b.dataset.m; app.render(); }));
  }
  function viewGuide(main) { main.innerHTML = `<h1>🇱🇧 ${t(L('Accounting & tax in Lebanon — what a forwarder needs', 'المحاسبة والضرائب في لبنان — ما يحتاجه وكيل الشحن'))}</h1><div class="note warn">${t(ACC.disclaimer)}</div>${ACC.guide.map((g) => `<div class="card lesson"><h3>${t(g.h)}</h3>${t(g.b)}</div>`).join('')}`; }
  function viewCoa(main) {
    main.innerHTML = `<h1># ${t(L('Chart of accounts (simplified)', 'المخطط المحاسبي (مبسّط)'))}</h1>${ui.table([L('Account', 'الحساب'), L('Name', 'الاسم'), L('Class', 'الفئة'), L('Normal balance', 'الرصيد الطبيعي')], ACC.coa.map((a) => `<tr><td><b>${a.n}</b></td><td>${esc(t(a.name))}</td><td>${a.c} — ${esc(t(ACC.classNames[a.c]))}</td><td>${['101', '401', '4191', '4424', '4427', '706', '707'].includes(a.n) ? t(L('Credit', 'دائن')) : t(L('Debit', 'مدين'))}</td></tr>`))}
      <div class="card lesson"><h3>${t(L('Debit and credit in one minute', 'المدين والدائن في دقيقة'))}</h3>${t(L('<ul><li>Every entry has equal debits and credits.</li><li>Assets and expenses increase with a <b>debit</b> (bank receives money → debit 512; a cost → debit 604).</li><li>Liabilities, capital and revenue increase with a <b>credit</b> (we owe a supplier → credit 401; we earn → credit 706; VAT we collected for the State → credit 4427).</li><li>A customer owes us → debit 411; when he pays → credit 411, debit 512.</li></ul>', '<ul><li>كل قيد مدينه يساوي دائنه.</li><li>الأصول والأعباء تزيد بـ<b>المدين</b> (المصرف يقبض ← مدين 512؛ كلفة ← مدين 604).</li><li>الالتزامات ورأس المال والإيرادات تزيد بـ<b>الدائن</b> (ندين لمورّد ← دائن 401؛ نربح ← دائن 706؛ ضريبة حصّلناها للدولة ← دائن 4427).</li><li>الزبون مدين لنا ← مدين 411؛ عندما يدفع ← دائن 411، مدين 512.</li></ul>'))}</div>`;
  }

  /* ======================= boot ======================= */
  document.addEventListener('ts:lang', () => app.render());
  window.addEventListener('DOMContentLoaded', () => {
    load();
    const h = location.hash.slice(1);
    app.view = h || (app.ship ? firstOpenStep() : 'home');
    app.render();
  });
})();
