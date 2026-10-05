/* Accounting module — journal-entry widget, books (journal, ledger, trial balance) and the department app config */
(function () {
  const L = TS.L, t = TS.t, esc = TS.esc, R = TS.round2;
  const ACC = window.ACC;
  const ui = TS.ui;
  const A = (s) => s.accounting;
  ACC.steps = ACC.steps || [];
  let app = { acct: '512' };

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


  /* ======================= books views ======================= */
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
  function viewGuide(main) { main.innerHTML = `<h1>🇱🇧 ${t(L('Accounting & tax in Lebanon — what a forwarder needs', 'المحاسبة والضرائب في لبنان — ما يحتاجه وكيل الشحن'))}</h1><div class="note warn">${t(ACC.disclaimer)}</div>${ACC.guide.map((g) => `<div class="card lesson"><h3>${t(g.h)}</h3>${t(g.b)}</div>`).join('')}`; }
  function viewCoa(main) {
    main.innerHTML = `<h1># ${t(L('Chart of accounts (simplified)', 'المخطط المحاسبي (مبسّط)'))}</h1>${ui.table([L('Account', 'الحساب'), L('Name', 'الاسم'), L('Class', 'الفئة'), L('Normal balance', 'الرصيد الطبيعي')], ACC.coa.map((a) => `<tr><td><b>${a.n}</b></td><td>${esc(t(a.name))}</td><td>${a.c} — ${esc(t(ACC.classNames[a.c]))}</td><td>${['101', '401', '4191', '4424', '4427', '706', '707'].includes(a.n) ? t(L('Credit', 'دائن')) : t(L('Debit', 'مدين'))}</td></tr>`))}
      <div class="card lesson"><h3>${t(L('Debit and credit in one minute', 'المدين والدائن في دقيقة'))}</h3>${t(L('<ul><li>Every entry has equal debits and credits.</li><li>Assets and expenses increase with a <b>debit</b> (bank receives money → debit 512; a cost → debit 604).</li><li>Liabilities, capital and revenue increase with a <b>credit</b> (we owe a supplier → credit 401; we earn → credit 706; VAT we collected for the State → credit 4427).</li><li>A customer owes us → debit 411; when he pays → credit 411, debit 512.</li></ul>', '<ul><li>كل قيد مدينه يساوي دائنه.</li><li>الأصول والأعباء تزيد بـ<b>المدين</b> (المصرف يقبض ← مدين 512؛ كلفة ← مدين 604).</li><li>الالتزامات ورأس المال والإيرادات تزيد بـ<b>الدائن</b> (ندين لمورّد ← دائن 401؛ نربح ← دائن 706؛ ضريبة حصّلناها للدولة ← دائن 4427).</li><li>الزبون مدين لنا ← مدين 411؛ عندما يدفع ← دائن 411، مدين 512.</li></ul>'))}</div>`;
  }


  app = Object.assign(TS.deptApp(ACC, {
    key: 'accounting', prefix: 'acc_', session: 'acc_job', email: ACC.company.email, icon: '📒',
    title: L('Accounting Department', 'قسم المحاسبة'),
    hero: L('Jobs closed by Operations arrive here inside the shipment JSON file. You check the job, issue the tax invoice, post the entries (sales, purchases, bank, deposits), reconcile the bank, prepare the VAT return and close the job — Lebanese rules, VAT 11%, USD with LBP equivalents.', 'تصل هنا العمليات التي أقفلتها العمليات داخل ملف JSON للشحنة. تراجع العملية، تصدر الفاتورة الضريبية، ترحّل القيود (مبيعات، مشتريات، مصرف، تأمينات)، تجري التسوية المصرفية، تحضّر التصريح الضريبي وتقفل العملية — وفق القواعد اللبنانية، ضريبة 11%، بالدولار مع ما يعادله بالليرة.'),
    jobsTitle: L('Jobs received from Operations', 'العمليات الواردة من قسم العمليات'),
    emptyNote: L('No job has been handed to Accounting yet. Finish a shipment in Operations (step 12), import a JSON file, or load a sample job below.', 'لم تُسلَّم أي عملية للمحاسبة بعد. أنهِ شحنة في العمليات (المرحلة 12)، أو استورد ملف JSON، أو حمّل عملية نموذجية أدناه.'),
    disclaimer: ACC.disclaimer, dateLabel: L('Accounting date', 'التاريخ المحاسبي'),
    insight: (id, s) => (ACC.insight ? ACC.insight(id, s) : ''), alerts: (s) => (ACC.alerts ? ACC.alerts(s) : []), homeKpis: (l) => (ACC.homeKpis ? ACC.homeKpis(l) : ''),
    handoff: (s) => s.handoffs && s.handoffs.accounting,
    init: (s, h) => ({ journal: [{ id: 'J0', step: 'opening', date: h.sentSim, ref: 'OPEN', narrative: 'Opening balances (training): bank funded by share capital', lines: [{ acc: '512', dr: ACC.OPENING_BANK, cr: 0 }, { acc: '101', dr: 0, cr: ACC.OPENING_BANK }] }] }),
    ctx: (ctx, st) => { ctx.post = (entry) => { const a = A(ctx.ship); a.journal = a.journal.filter((j) => j.key !== entry.key); a.journal.push(Object.assign({ id: 'J' + a.journal.length, step: st.id, date: a.today }, entry)); }; },
    samples: () => window.ACC_SAMPLES || [],
    prepareSample: (s) => { s.handoffs.accounting.status = 'submitted'; },
    nav: [{ v: 'journal', icon: 'J', l: L('Journal', 'دفتر اليومية'), view: viewJournal }, { v: 'ledger', icon: 'Σ', l: L('Ledger & trial balance', 'الأستاذ وميزان المراجعة'), view: viewLedger }],
    learn: [{ v: 'guide', icon: '🇱🇧', l: L('Lebanon accounting guide', 'دليل المحاسبة في لبنان'), view: viewGuide }, { v: 'coa', icon: '#', l: L('Chart of accounts', 'المخطط المحاسبي'), view: viewCoa }],
  }), { acct: '512' });
  ACC.app = app;
})();
