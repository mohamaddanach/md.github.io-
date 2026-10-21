/* Port Master Academy — Operations Desk: virtual work system (A-to-Z operations)
 * Each operation = brief + live state board + ordered steps.
 * Step kinds: docs (pick required documents), choice (decision), calc (number), form (fill an order), seq (put actions in order).
 */
(function () {
  const L = TS.L, t = TS.t, esc = TS.esc;
  const $ = (s, el) => el.querySelector(s);
  const $$ = (s, el) => Array.from(el.querySelectorAll(s));
  const val = (x, S) => (typeof x === 'function' ? x(S) : x);
  const fmt = (v, d) => (typeof v === 'number' ? TS.num(v, d == null ? 0 : d) : esc(v));

  const KIND = {
    docs: { i: '📂', l: L('Documents', 'المستندات') },
    choice: { i: '🧭', l: L('Decision', 'قرار') },
    calc: { i: '🧮', l: L('Calculation', 'حساب') },
    form: { i: '📝', l: L('Order / form', 'أمر / نموذج') },
    seq: { i: '🔢', l: L('Sequence', 'التسلسل') },
  };

  PT.vOps = (main) => {
    const ui = PT.ui;
    const groups = {};
    PT.ops.forEach((o) => { (groups[o.area] = groups[o.area] || []).push(o); });
    main.innerHTML = ui.head(L('Operations desk', 'مكتب العمليات'), L('Virtual work system — complete operations from A to Z', 'نظام عمل افتراضي — عمليات كاملة من البداية إلى النهاية'), L('You sit at the desk. Messages arrive from agents, masters, customs, silos and suppliers. You provide the right documents, calculate, fill orders, sequence the work and decide. A live board tracks stock, fuel, time and cost. Every operation ends with a report.', 'أنت على المكتب. تصل رسائل من الوكلاء والربابنة والجمارك والصوامع والمورّدين. تقدّم المستندات الصحيحة، تحسب، تملأ الأوامر، ترتّب العمل وتقرّر. لوحة حيّة تتابع المخزون والوقود والوقت والتكلفة. كل عملية تنتهي بتقرير.')) +
      `<div class="grid c4" style="margin-bottom:6px">${Object.keys(KIND).map((k) => `<div class="tile"><span class="ic">${KIND[k].i}</span><div class="k">${t(L('Task type', 'نوع المهمة'))}</div><div class="v" style="font-size:1rem">${t(KIND[k].l)}</div></div>`).join('')}</div>` +
      Object.keys(groups).map((g) => `<div class="section-title"><h2>${esc(t(PT.opAreas[g] || g))}</h2></div><div class="grid c3">${groups[g].map((o) => { const r = PT.P.ops[o.id]; return `<a class="link-card" href="#/op/${o.id}"><div class="mod"><div class="top"><div class="em">${o.icon}</div><h3>${t(o.title)}</h3></div><p>${t(o.sub)}</p><div class="foot">${ui.lvlBadge(o.lvl)}<span class="badge">${o.steps.length} ${t(L('steps', 'خطوات'))}</span>${r ? `<span class="badge ok">${t(L('Best', 'الأفضل'))} ${r.best}</span>` : ''}</div></div></a>`; }).join('')}</div>`).join('');
  };

  PT.vOp = (main, id) => {
    const ui = PT.ui;
    const op = PT.ops.find((o) => o.id === id);
    if (!op) return PT.vOps(main);
    const S = {}; op.state.forEach((s) => (S[s.k] = s.v));
    const run = { i: 0, pts: 0, max: op.steps.length * 10, log: [], files: [], answered: null, recorded: false, seqOrder: null, picks: {} };

    const board = () => `<div class="card"><h3>📊 ${t(L('Live board', 'اللوحة الحيّة'))}</h3><div class="grid c2" style="gap:8px">${op.state.map((s) => { const v = S[s.k]; const warn = s.warn && s.warn(S); return `<div class="stat" style="${warn ? 'border-color:var(--red);background:var(--bad-soft)' : ''}"><div class="k">${t(s.l)}</div><div class="v" style="font-size:1.05rem">${fmt(v, s.d)} <small class="muted">${s.u ? esc(t(s.u)) : ''}</small></div></div>`; }).join('')}</div></div>
      <div class="card"><h3>🗂 ${t(L('Filed documents', 'المستندات المحفوظة'))}</h3>${run.files.length ? `<ul class="keys">${run.files.map((f) => `<li>${esc(t(f))}</li>`).join('')}</ul>` : `<p class="muted">${t(L('Nothing filed yet.', 'لم يُحفظ شيء بعد.'))}</p>`}</div>
      <div class="card soft"><h3>🕘 ${t(L('Operation log', 'سجلّ العملية'))}</h3>${run.log.length ? `<ul class="timeline">${run.log.map((l) => `<li class="${l.p >= 8 ? 'done' : l.p >= 5 ? '' : 'late'}"><small>${esc(t(l.l))}</small></li>`).join('')}</ul>` : `<p class="muted">—</p>`}</div>`;

    function taskHTML(st) {
      const done = run.answered;
      if (st.kind === 'docs') {
        return `<p><b>${t(st.q || L('Select every document that is required (and only those):', 'اختر كل مستند مطلوب (وفقط المطلوب):'))}</b></p>` + st.items.map((d, k) => {
          const on = !!run.picks[k]; let cls = on ? 'sel' : '';
          if (done) cls = d.ok && on ? 'good' : !d.ok && on ? 'bad' : d.ok && !on ? 'mid' : '';
          return `<label class="opt ${cls}"><input type="checkbox" data-d="${k}" ${on ? 'checked' : ''} ${done ? 'disabled' : ''}><span>${t(d.l)}${done && d.w && (on || d.ok) ? `<div class="fbk">${d.ok ? '✓' : '✗'} ${t(d.w)}</div>` : ''}${done && d.ok && !on ? `<div class="fbk" style="color:var(--warn)">${t(L('Missed — this one was required.', 'فاتك — هذا كان مطلوبًا.'))}</div>` : ''}</span></label>`;
        }).join('');
      }
      if (st.kind === 'choice') {
        return (st.q ? `<p><b>${t(val(st.q, S))}</b></p>` : '') + st.opts.map((o, k) => {
          let cls = run.picks.c === k ? 'sel' : '';
          if (done) { cls = o.s === 10 ? 'good' : run.picks.c === k ? (o.s ? 'mid' : 'bad') : ''; }
          return `<button class="opt ${cls}" style="width:100%;text-align:start;font:inherit" data-c="${k}" ${done ? 'disabled' : ''}><span>${t(o.l)}${done && (run.picks.c === k || o.s === 10) ? `<div class="fbk"><b>${o.s}/10</b> — ${t(o.f)}</div>` : ''}</span></button>`;
        }).join('');
      }
      if (st.kind === 'calc') {
        return `<p class="drill-q"><b>${t(val(st.q, S))}</b></p><div class="drill-ans"><input type="number" step="any" id="opCalc" ${done ? 'disabled' : ''} value="${run.picks.v != null ? run.picks.v : ''}"> <span class="muted">${esc(t(st.unit || ''))}</span></div>${done ? `<div class="sol">${esc(t(val(st.sol, S)))}</div>` : ''}`;
      }
      if (st.kind === 'form') {
        return `<p><b>${t(st.q || L('Fill in the order:', 'املأ الأمر:'))}</b></p><div class="form">${st.fields.map((f, k) => {
          const v = run.picks['f' + k]; const right = done ? check(f, v) : null; const ans = val(f.a, S);
          const input = f.type === 'select' ? `<select data-f="${k}" ${done ? 'disabled' : ''}><option value="">—</option>${f.opts.map((o) => `<option value="${esc(o.v)}" ${String(o.v) === String(v) ? 'selected' : ''}>${esc(t(o.l || o.v))}</option>`).join('')}</select>` : `<input type="number" step="any" data-f="${k}" value="${v != null ? v : ''}" ${done ? 'disabled' : ''}>`;
          return `<div class="field ${done ? (right ? 'right' : 'wrong') : ''}"><label>${t(f.l)}${f.u ? ` <span class="muted">(${esc(t(f.u))})</span>` : ''}</label>${input}${done && !right ? `<div class="fb">✗ ${t(L('Correct', 'الصحيح'))}: ${esc(f.type === 'select' ? t((f.opts.find((o) => String(o.v) === String(ans)) || {}).l || ans) : TS.num(ans, 2))}</div>` : ''}</div>`;
        }).join('')}</div>${done && st.sol ? `<div class="sol">${esc(t(val(st.sol, S)))}</div>` : ''}`;
      }
      if (st.kind === 'seq') {
        const order = run.seqOrder;
        return `<p><b>${t(st.q || L('Put these actions in the correct order (use ↑ ↓):', 'رتّب هذه الإجراءات بالترتيب الصحيح (استخدم ↑ ↓):'))}</b></p>` + order.map((k, pos) => {
          const cls = done ? (k === pos ? 'good' : 'bad') : '';
          return `<div class="opt ${cls}" style="align-items:center"><b style="min-width:22px">${pos + 1}.</b><span style="flex:1">${t(st.items[k])}${done && k !== pos ? `<div class="fbk">→ ${t(L('should be', 'يجب أن يكون'))} #${k + 1}</div>` : ''}</span>${done ? '' : `<button class="btn sm ghost" data-up="${pos}" ${pos === 0 ? 'disabled' : ''}>↑</button><button class="btn sm ghost" data-dn="${pos}" ${pos === order.length - 1 ? 'disabled' : ''}>↓</button>`}</div>`;
        }).join('');
      }
      return '';
    }

    function check(f, v) {
      const a = val(f.a, S);
      if (v == null || v === '') return false;
      if (f.type === 'select') return String(v) === String(a);
      return Math.abs(Number(v) - Number(a)) <= (f.tol != null ? f.tol : 0.01);
    }

    function score(st) {
      if (st.kind === 'docs') {
        let err = 0; st.items.forEach((d, k) => { if (!!run.picks[k] !== !!d.ok) err++; });
        return Math.max(0, 10 - err * 2);
      }
      if (st.kind === 'choice') return st.opts[run.picks.c].s;
      if (st.kind === 'calc') return Math.abs(Number(run.picks.v) - val(st.a, S)) <= (st.tol != null ? st.tol : 0.01) ? 10 : 0;
      if (st.kind === 'form') { const ok = st.fields.filter((f, k) => check(f, run.picks['f' + k])).length; return Math.round(ok / st.fields.length * 10); }
      if (st.kind === 'seq') { const wrong = run.seqOrder.filter((k, pos) => k !== pos).length; return Math.max(0, 10 - wrong * 2); }
      return 0;
    }

    function draw() {
      const st = op.steps[run.i];
      const dots = `<div class="stage-dots">${op.steps.map((_, k) => `<i class="${k < run.i ? 'done' : k === run.i ? 'cur' : ''}"></i>`).join('')}</div>`;
      let body;
      if (!st) {
        const sc = Math.round(run.pts / run.max * 100);
        const grade = sc >= 90 ? 'A' : sc >= 75 ? 'B' : sc >= 55 ? 'C' : 'D';
        body = `<div class="card fade-in"><h2>📋 ${t(L('Operation report', 'تقرير العملية'))}</h2><div class="row"><div class="score-big">${sc}</div><span class="grade ${grade}">${grade}</span><span class="muted">${run.pts} / ${run.max} ${t(L('points', 'نقطة'))}</span></div>
          <div class="table-wrap" style="margin-top:12px"><table><thead><tr><th>#</th><th>${t(L('Step', 'الخطوة'))}</th><th>${t(L('Type', 'النوع'))}</th><th class="num">${t(L('Points', 'النقاط'))}</th></tr></thead><tbody>${op.steps.map((s, k) => `<tr><td>${k + 1}</td><td>${t(s.t)}</td><td>${KIND[s.kind].i} ${t(KIND[s.kind].l)}</td><td class="num">${run.log[k] ? run.log[k].p : '—'}/10</td></tr>`).join('')}</tbody></table></div>
          <div class="senior"><strong>🎖 ${t(L('Debrief', 'الخلاصة'))}</strong>${t(op.debrief)}</div>
          <div class="row"><button class="btn red" id="opAgain">${t(L('Run this operation again', 'أعد هذه العملية'))}</button><a class="btn" href="#/ops">${t(L('All operations', 'كل العمليات'))}</a></div></div>`;
        if (!run.recorded) { run.recorded = true; ui.award('ops', op.id, sc, t(op.title)); }
      } else {
        if (st.kind === 'seq' && !run.seqOrder) {
          let o = PT.shuffle(st.items.map((_, k) => k)); let guard = 0;
          while (o.every((k, p) => k === p) && guard++ < 5) o = PT.shuffle(o);
          run.seqOrder = o;
        }
        const k = KIND[st.kind];
        body = `<div class="card fade-in"><div class="row" style="justify-content:space-between"><span class="badge info">${k.i} ${t(k.l)}</span><span class="muted">${t(L('Step', 'الخطوة'))} ${run.i + 1}/${op.steps.length}${st.time ? ' · 🕐 ' + esc(st.time) : ''}</span></div>
          <h3 style="margin:10px 0 6px">${t(st.t)}</h3>
          ${st.msg ? `<div class="email-preview"><div class="meta">✉ <b>${t(L('From', 'من'))}:</b> ${esc(t(st.who || L('Operations', 'العمليات')))}</div>${esc(t(val(st.msg, S)))}</div>` : ''}
          <div style="margin-top:12px">${taskHTML(st)}</div>
          ${run.answered ? `<div class="note ${run.answered.p >= 8 ? 'ok' : run.answered.p >= 5 ? 'warn' : 'bad'} fade-in"><strong>${run.answered.p}/10</strong>${st.tip ? t(st.tip) : ''}${st.file ? `<br>🗂 ${t(L('Filed', 'حُفظ'))}: <b>${esc(t(st.file))}</b>` : ''}<div style="margin-top:8px"><button class="btn sm primary" id="opNext">${run.i + 1 < op.steps.length ? t(L('Next step', 'الخطوة التالية')) : t(L('Close the operation', 'أغلق العملية'))} →</button></div></div>` : `<div class="row" style="margin-top:10px"><button class="btn red" id="opGo">${t(L('Submit', 'إرسال'))}</button></div>`}</div>`;
      }
      main.innerHTML = `${ui.head(L('Operations desk', 'مكتب العمليات'), op.title, null, ui.lvlBadge(op.lvl))}
        <div class="case-grid"><div><div class="brief"><span class="role">${t(L('Your role', 'دورك'))}: ${t(op.role)}</span><p>${t(op.brief)}</p></div>${dots}${body}</div><aside>${board()}</aside></div>`;
      bind(st);
    }

    function bind(st) {
      if (!st) { $('#opAgain', main).onclick = () => PT.vOp(main, id); return; }
      $$('[data-d]', main).forEach((c) => (c.onchange = () => { run.picks[c.dataset.d] = c.checked; }));
      $$('[data-c]', main).forEach((b) => (b.onclick = () => { run.picks.c = Number(b.dataset.c); $$('[data-c]', main).forEach((x) => x.classList.toggle('sel', x === b)); }));
      $$('[data-f]', main).forEach((f) => (f.oninput = f.onchange = () => { run.picks['f' + f.dataset.f] = f.value; }));
      const ci = $('#opCalc', main); if (ci) ci.oninput = () => { run.picks.v = ci.value; };
      $$('[data-up]', main).forEach((b) => (b.onclick = () => { const p = Number(b.dataset.up); const o = run.seqOrder; [o[p - 1], o[p]] = [o[p], o[p - 1]]; draw(); }));
      $$('[data-dn]', main).forEach((b) => (b.onclick = () => { const p = Number(b.dataset.dn); const o = run.seqOrder; [o[p + 1], o[p]] = [o[p], o[p + 1]]; draw(); }));
      const go = $('#opGo', main);
      if (go) go.onclick = () => {
        if (st.kind === 'choice' && run.picks.c == null) return TS.toast(t(L('Choose an option', 'اختر خيارًا')), 'bad');
        if (st.kind === 'calc' && (run.picks.v == null || run.picks.v === '')) return TS.toast(t(L('Enter a number', 'أدخل رقمًا')), 'bad');
        if (st.kind === 'form' && st.fields.some((f, k) => run.picks['f' + k] == null || run.picks['f' + k] === '')) return TS.toast(t(L('Complete every field', 'أكمل كل الحقول')), 'bad');
        const p = score(st);
        run.pts += p; run.answered = { p };
        run.log.push({ p, l: st.log || st.t });
        if (st.file) run.files.push(st.file);
        if (st.fx) st.fx(S, p);
        draw();
      };
      const nx = $('#opNext', main);
      if (nx) nx.onclick = () => { run.i++; run.answered = null; run.picks = {}; run.seqOrder = null; draw(); window.scrollTo(0, 0); };
    }
    draw();
  };
})();
