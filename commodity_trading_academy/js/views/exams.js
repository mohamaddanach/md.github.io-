/* Exams & Certifications — 11 subject exams (MCQ + numerical, drawn fresh per attempt), the full commodity trading
 * case exam (Physical Trading Simulator in exam mode), a practice bank, and an educational completion certificate.
 * Completion does NOT confer any professional licence or industry certification. */
(function () {
  const CTA = window.CTA, C = window.CALC, fmt = CTA.fmt, esc = CTA.esc;
  let timer = null;
  CTA.EXAMS = [
    { id: 'fundamentals', title: 'Commodity Trading Fundamentals', topics: ['foundations', 'accounting', 'markets'], mcq: 15, num: 3 },
    { id: 'gold', title: 'Gold Trading', topics: ['gold'], extra: ['pg1', 'pg2', 'pg3'], mcq: 12, num: 3 },
    { id: 'wheat', title: 'Wheat Trading', topics: ['wheat'], extra: ['pwh1', 'pwh2', 'dh1', 'dh4'], mcq: 12, num: 3 },
    { id: 'sugar', title: 'Sugar Trading', topics: ['sugar'], extra: ['ps1', 'ps2', 'ps3'], mcq: 10, num: 3 },
    { id: 'steel', title: 'Steel Trading', topics: ['steel'], extra: ['pst1', 'pst2'], mcq: 10, num: 3 },
    { id: 'physical', title: 'Physical Commodity Trading', topics: ['physical'], numTopics: ['foundations'], mcq: 12, num: 3 },
    { id: 'trade-finance', title: 'Trade Finance', topics: ['finance', 'incoterms', 'documents'], mcq: 15, num: 3 },
    { id: 'shipping', title: 'International Shipping', topics: ['logistics'], extra: ['ti1', 'ti2', 'ti3', 'fe4'], numTopics: ['logistics'], mcq: 8, num: 4 },
    { id: 'risk', title: 'Risk Management', topics: ['risk'], extra: ['dh3', 'ar1', 'ar2'], mcq: 10, num: 3 },
    { id: 'financial', title: 'Commodity Financial Markets', topics: ['derivatives', 'options', 'spreads'], mcq: 15, num: 4 },
    { id: 'quant', title: 'Quantitative Market Analysis', topics: ['quant', 'analysis'], mcq: 12, num: 3 },
    { id: 'final-case', title: 'Full Commodity Trading Case', final: true },
  ];
  const shuffle = (a, r) => { const b = a.slice(); for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; };
  function record(id, score, extra) {
    const e = CTA.state.exams[id] || { best: 0, attempts: 0, passed: false };
    e.attempts++; e.best = Math.max(e.best, score); e.passed = e.passed || (extra && extra.passed != null ? extra.passed : score >= 70); e.last = Object.assign({ score, ts: Date.now() }, extra || {});
    CTA.state.exams[id] = e; CTA.save(true); CTA.log(`Exam "${(CTA.EXAMS.find((x) => x.id === id) || {}).title}": ${Math.round(score)}% ${e.passed ? '(passed)' : ''}`, 'exam'); CTA.updateTopStats();
  }

  function runExam(b, ex) {
    const r = C.rng(Date.now() % 1e9);
    const pool = CTA.QUESTIONS.filter((q) => ex.topics.includes(q.t) || (ex.extra || []).includes(q.id));
    const qs = shuffle(pool, r).slice(0, Math.min(ex.mcq, pool.length));
    const npool = CTA.EXERCISES.filter((e) => (ex.numTopics || ex.topics).includes(e.topic));
    const nums = shuffle(npool, r).slice(0, Math.min(ex.num, npool.length)).map((e) => ({ e, inst: e.gen(C.rng(Math.floor(r() * 1e9))) }));
    const total = qs.length + nums.length; let secs = total * 90;
    b.innerHTML = `<div class="card"><div class="row between"><h3 style="margin:0">${esc(ex.title)} — examination</h3><span class="badge warn" id="exT"></span></div><p class="muted">${qs.length} multiple-choice and ${nums.length} numerical questions · pass mark 70% · feedback after submission. Numerical answers accept reasonable rounding.</p>
      <div id="exq"></div><h3>Numerical questions</h3>${nums.map((n, i) => `<div class="exercise" data-n="${i}"><div class="ex-h"><span class="badge">${esc(CTA.TOPICS[n.e.topic])}</span><h4>${esc(n.e.title)}</h4></div><div class="ex-prompt">${CTA.rich(n.inst.prompt)}</div><div class="row"><input type="text" inputmode="decimal" style="max-width:200px" aria-label="Answer"><span class="muted">${esc(n.inst.unit || '')}</span></div><div class="fb"></div></div>`).join('')}
      <div class="row"><button class="btn primary" id="exSub">Submit examination</button><a class="btn ghost" href="#/exams">Abandon</a></div><div id="exRes"></div></div>`;
    let submitted = false;
    CTA.ui.quiz(CTA.$('#exq', b), qs.map((q) => q.id), { exam: true });
    const innerSubmit = CTA.$('#exq .submit', b); if (innerSubmit) innerSubmit.style.display = 'none';
    const tick = () => { const m = Math.floor(secs / 60), s = secs % 60; const el = CTA.$('#exT', b); if (!el) { clearInterval(timer); return; } el.textContent = `⏱ ${m}:${String(s).padStart(2, '0')}`; if (secs-- <= 0) { clearInterval(timer); CTA.toast('Time is up — submitting.', 'warn'); submit(true); } };
    clearInterval(timer); timer = setInterval(tick, 1000); tick(); CTA.cleanup = () => clearInterval(timer);
    const submit = (force) => {
      if (submitted) return;
      const unanswered = CTA.$$('#exq .q', b).filter((q) => !CTA.$('input:checked', q)).length + CTA.$$('[data-n] input', b).filter((i) => !i.value.trim()).length;
      if (!force && unanswered && !confirm(unanswered + ' question(s) unanswered — they count as wrong. Submit?')) return;
      submitted = true; clearInterval(timer);
      // grade MCQ via the quiz component (without its confirm dialog)
      CTA.$$('#exq .q', b).forEach((qEl) => { const q = CTA.Q_INDEX[qEl.dataset.q]; const sel = CTA.$('input:checked', qEl); const chosen = sel ? +sel.value : -1; const ok = chosen === q.a; CTA.record.answer(q.id, ok); CTA.$$('.opt', qEl).forEach((l) => { const i = +l.dataset.oi; l.classList.toggle('right', i === q.a); l.classList.toggle('wrong', i === chosen && !ok); CTA.$('input', l).disabled = true; }); CTA.$('.q-fb', qEl).innerHTML = `<div class="note ${ok ? 'ok' : 'bad'}"><strong>${ok ? 'Correct.' : 'Incorrect.'}</strong>${CTA.rich(q.e)}</div>`; qEl.dataset.ok = ok ? 1 : 0; });
      const byT = {}; const addT = (t, ok) => { byT[t] = byT[t] || [0, 0]; byT[t][1]++; if (ok) byT[t][0]++; };
      let correct = 0;
      CTA.$$('#exq .q', b).forEach((qEl) => { const ok = qEl.dataset.ok === '1'; if (ok) correct++; addT(CTA.Q_INDEX[qEl.dataset.q].t, ok); });
      nums.forEach((n, i) => { const box = CTA.$(`[data-n="${i}"]`, b); const v = CTA.num(CTA.$('input', box).value, NaN); const ok = !isNaN(v) && C.within(v, n.inst.answer, n.inst.tol, n.inst.tolRel); CTA.record.exercise(n.e.id, ok); if (ok) correct++; addT(n.e.topic, ok); CTA.$('input', box).disabled = true;
        CTA.$('.fb', box).innerHTML = `<div class="note ${ok ? 'ok' : 'bad'}"><strong>${ok ? 'Correct' : 'Incorrect'} — answer ${fmt.num(n.inst.answer, n.inst.dp == null ? 2 : n.inst.dp)} ${esc(n.inst.unit || '')}</strong>Formula: ${CTA.rich(n.inst.formula)}<ol style="margin:4px 0 0">${n.inst.steps.map((s) => `<li>${CTA.rich(s)}</li>`).join('')}</ol>${n.inst.mistakes ? `<p class="mistake" style="margin-top:4px">${CTA.rich(n.inst.mistakes)}</p>` : ''}</div>`; });
      const score = correct / total * 100; record(ex.id, score, { byTopic: byT });
      const weak = Object.entries(byT).filter(([, x]) => x[0] / x[1] < 0.7);
      CTA.$('#exSub', b).remove();
      CTA.$('#exRes', b).innerHTML = `<div class="note ${score >= 70 ? 'ok' : 'bad'}"><strong>Result: ${correct}/${total} = ${Math.round(score)}% — ${score >= 70 ? 'PASSED' : 'not passed (70% required)'}</strong></div>${CTA.table(['Subject', 'Score'], Object.entries(byT).map(([t, x]) => [CTA.TOPICS[t], `${x[0]}/${x[1]} (${Math.round(x[0] / x[1] * 100)}%)`]))}${weak.length ? `<p><b>Improve before retaking:</b> ${weak.map(([t]) => esc(CTA.TOPICS[t])).join(', ')} — review the related lessons and practise by topic.</p>` : ''}<div class="row"><a class="btn primary" href="#/exams/${ex.id}?r=${Date.now()}">Retake (new questions)</a><a class="btn" href="#/exams">All exams</a></div>`;
      CTA.$('#exRes', b).scrollIntoView({ behavior: 'smooth' });
    };
    CTA.$('#exSub', b).onclick = () => submit(false);
  }

  function finalCase(b) {
    const st = CTA.state.physical;
    const done = (rec) => {
      const passed = rec.score >= 70 && (rec.cats.risk == null || rec.cats.risk >= 60) && (rec.cats.financial == null || rec.cats.financial >= 50);
      record('final-case', rec.score, { passed, deal: rec.id, cats: rec.cats, pnl: rec.pnl });
      b.innerHTML = `<div class="note ${passed ? 'ok' : 'bad'}"><strong>${passed ? 'Final case PASSED' : 'Final case not passed'}</strong>Pass requires an overall decision score ≥ 70%, risk management ≥ 60% and financial accuracy ≥ 50%. Profit alone does not pass the exam.</div>${CTA.physicalReport(rec)}<div class="row"><a class="btn" href="#/exams">Back to exams</a></div>`;
    };
    if (st.active && st.active.exam) { CTA.physicalRunner(b, { onFinish: done, onAbandon: () => CTA.render() }); return; }
    if (st.active && !st.active.exam) { b.innerHTML = '<div class="note warn"><strong>A practice deal is in progress</strong>Finish or abandon it in the Physical Trading Simulator before starting the examination.</div><a class="btn" href="#/physical/workflow">Open simulator</a>'; return; }
    const e = CTA.state.exams['final-case'];
    b.innerHTML = `<div class="card"><h3>Full Commodity Trading Case — examination</h3><p>You will run a complete international transaction through all 25 steps: analyse the buyer's requirements, compare suppliers and quality, calculate landed cost, choose delivery terms, negotiate, assess financing, prepare documents, evaluate counterparties, decide whether to hedge, monitor shipment, handle an unexpected problem, and calculate the final P&L. <b>No feedback is shown until the end.</b></p>
      <p>Your decisions are evaluated throughout — commercial judgment, financial accuracy, market understanding, risk management, documentation, negotiation and operational execution. A risky deal that happens to make money does not receive a perfect score.</p>
      ${e ? `<p>Best so far: <b>${Math.round(e.best)}%</b> · attempts ${e.attempts} · ${e.passed ? '<span class="badge ok">passed</span>' : '<span class="badge warn">not yet passed</span>'}</p>` : ''}
      <div class="row"><label for="fcom">Commodity</label><select id="fcom" style="max-width:180px"><option value="wheat">Wheat (recommended)</option><option value="sugar">Sugar</option><option value="steel">Steel</option><option value="gold">Gold</option></select><button class="btn primary" id="fstart">Start the examination</button></div></div>`;
    CTA.$('#fstart', b).onclick = () => { st.active = CTA.physicalNewRun(CTA.$('#fcom', b).value, true); CTA.save(); CTA.render(); };
  }

  function practice(b, r) {
    const t = r.q.t || 'foundations';
    const qs = CTA.QUESTIONS.filter((q) => q.t === t), exs = CTA.EXERCISES.filter((e) => e.topic === t);
    b.innerHTML = `<div class="card"><div class="row">${Object.entries(CTA.TOPICS).map(([k, l]) => { const n = CTA.QUESTIONS.filter((q) => q.t === k).length + CTA.EXERCISES.filter((e) => e.topic === k).length; return n ? `<a class="btn sm ${k === t ? 'primary' : ''}" href="#/exams/practice?t=${k}">${l} (${n})</a>` : ''; }).join('')}</div></div>
      <div class="grid c2"><div><h3>Questions — ${esc(CTA.TOPICS[t])} (${qs.length})</h3><div id="pq"></div></div><div><h3>Numerical exercises (${exs.length})</h3><div id="pe"></div></div></div>
      <div class="card"><h3>Case studies and multi-stage simulations across the academy</h3>${CTA.table(['Collection', 'Count', 'Where'], [['Commodity practical cases', CTA.CASES.length, '<a href="#/gold/cases">Gold</a> · <a href="#/wheat/cases">Wheat</a> · <a href="#/sugar/cases">Sugar</a> · <a href="#/steel/cases">Steel</a>'], ['Spread & arbitrage exercises', (CTA.SPREAD_CASES || []).length, '<a href="#/analysis/spreads">Analysis Lab</a>'], ['Logistics disruption scenarios', (CTA.DISRUPTIONS || []).length, '<a href="#/logistics/disruptions">Logistics</a>'], ['LC discrepancy examinations', 3, '<a href="#/finance/lc">Trade Finance</a>'], ['Multi-stage simulations', '4 physical deals + 10 futures scenarios + company + 6 negotiations + final exam', '<a href="#/physical">Physical</a> · <a href="#/futures">Futures</a> · <a href="#/dealroom">Deal Room</a>']])}</div>`;
    if (qs.length) CTA.ui.quiz(CTA.$('#pq', b), qs.map((q) => q.id), {}); else CTA.$('#pq', b).innerHTML = '<p class="muted">No questions in this topic.</p>';
    const pe = CTA.$('#pe', b); if (!exs.length) pe.innerHTML = '<p class="muted">No numerical exercises in this topic.</p>';
    exs.forEach((e) => { const d = document.createElement('div'); pe.appendChild(d); CTA.ui.exercise(d, e, { seed: Math.floor(Math.random() * 1e9) }); });
  }

  function certificate(b) {
    const ex = CTA.EXAMS.map((e) => [e, CTA.state.exams[e.id]]); const all = ex.every(([, x]) => x && x.passed);
    const name = CTA.state.user.name || '(set your name in Settings)';
    b.innerHTML = all ? `<div class="cert"><p style="letter-spacing:.2em;font-size:.8rem">COMMODITY TRADING ACADEMY</p><h1 style="font-family:Georgia,serif">Certificate of Completion</h1><p>This educational certificate records that</p><h2 style="font-family:Georgia,serif">${esc(name)}</h2><p>completed the twelve examinations of the Commodity Trading Academy simulation programme on ${fmt.date(Date.now())}, including the full commodity trading case.</p>${CTA.table(['Examination', 'Best score'], ex.map(([e, x]) => [esc(e.title), Math.round(x.best) + '%']))}<p class="muted" style="font-size:.8rem">This is a self-study record from an educational simulation. It is not a professional licence, qualification or industry certification, and it does not attest to competence for regulated activities.</p><button class="btn primary" onclick="window.print()">Print</button></div>` :
      `<div class="card"><h3>Certificate of completion (educational)</h3><p>Pass all 12 examinations to unlock a printable completion record. It is not a professional licence or industry certification.</p>${CTA.table(['Examination', 'Status'], ex.map(([e, x]) => [esc(e.title), x ? (x.passed ? `<span class="badge ok">passed ${Math.round(x.best)}%</span>` : `<span class="badge warn">best ${Math.round(x.best)}%</span>`) : '<span class="badge">not attempted</span>']))}</div>`;
  }

  CTA.route('exams', { title: 'Exams & Certifications', desc: '12 examinations, practice bank, certificate.', render(el, r) {
    clearInterval(timer);
    const id = r.parts[0];
    const tabs = [['list', 'Examinations'], ['practice', 'Practice bank'], ['certificate', 'Certificate']];
    const ex = id && CTA.EXAMS.find((e) => e.id === id);
    el.innerHTML = `${CTA.pageHead('Exams & Certifications', 'Twelve examinations: eleven subject exams drawn fresh from the question and exercise banks, and a full commodity trading case evaluated on decision quality. Pass mark 70%.')}${CTA.tabs(tabs, ex ? 'list' : id || 'list', 'exams')}<div id="eb"></div>`;
    const b = CTA.$('#eb', el);
    if (id === 'practice') return practice(b, r);
    if (id === 'certificate') return certificate(b);
    if (ex) return ex.final ? finalCase(b) : runExam(b, ex);
    b.innerHTML = `<div class="grid c3">${CTA.EXAMS.map((e, i) => { const s = CTA.state.exams[e.id]; const pool = e.final ? null : CTA.QUESTIONS.filter((q) => e.topics.includes(q.t) || (e.extra || []).includes(q.id)).length;
      return `<div class="card"><div class="row between"><b>${i + 1}. ${esc(e.title)}</b>${s ? (s.passed ? '<span class="badge ok">passed</span>' : '<span class="badge warn">' + Math.round(s.best) + '%</span>') : ''}</div><p class="muted" style="font-size:.86rem">${e.final ? 'Complete 25-step international transaction in exam mode; graded on seven skills.' : `${Math.min(e.mcq, pool)} MCQ (pool ${pool}) + ${e.num} numerical · ~${Math.round((Math.min(e.mcq, pool) + e.num) * 1.5)} min`}</p>${s ? `<small>Attempts ${s.attempts} · best ${Math.round(s.best)}%</small><br>` : ''}<a class="btn ${e.final ? 'primary' : ''} sm" href="#/exams/${e.id}">${s ? 'Retake' : 'Start'}</a></div>`; }).join('')}</div>`;
  } });
})();
