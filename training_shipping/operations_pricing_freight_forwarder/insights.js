/* Operations — graphics (insights per step, shipment dashboard, KPIs) and automations (coach, autopilot adapter, command palette) */
(function () {
  const L = TS.L, t = TS.t, esc = TS.esc, V = TS.viz, R = TS.round2;
  const OPS = window.OPS;
  const app = () => OPS.app;
  const imp = (s) => s.direction === 'import';

  /* ---------------- graphics building blocks ---------------- */
  OPS.g = {};
  OPS.g.fit = (s) => {
    const j = s.jobFile; if (!j || !j.cbm) return '';
    if (OPS.sc(s).mode === 'LCL' || j.equipment === 'LCL') {
      const m = s.equipment && s.equipment.measuredCbm, wm = Math.max(1, j.wm || OPS.sc(s).answer.wm);
      return `<p class="viz-title">${esc(t(L('LCL — what you pay for (W/M)', 'LCL — ما تدفع عليه (W/M)')))}</p>` + V.meter(t(L('Volume CBM', 'الحجم م³')), m || j.cbm, 15, 'CBM') + V.meter(t(L('Weight t', 'الوزن طن')), j.grossKg / 1000, 15, 't') + `<p class="muted" style="font-size:.85rem">${esc(t(L('Chargeable', 'المحتسب')))}: <b>${TS.num(wm)} W/M</b>${m ? ' → ' + esc(t(L('after CFS measurement', 'بعد قياس المحطة'))) + ' <b>' + TS.num(Math.max(1, m, j.grossKg / 1000)) + ' W/M</b>' : ''} · ${esc(t(L('15 CBM ≈ the point where a 20′ FCL becomes cheaper', '15 م³ ≈ النقطة التي تصبح فيها الـ20 FCL أرخص')))}</p>`;
    }
    const eq = TS.REF.equipment.find((e) => e.code === j.equipment) || TS.REF.equipment.find((e) => e.code === OPS.sc(s).answer.equipment);
    return `<p class="viz-title">${esc(t(L('Container fill', 'امتلاء الحاوية')))} — 1 × ${esc(eq.code)}</p>` + V.meter(t(L('Volume', 'الحجم')), j.cbm, eq.cbm, 'CBM') + V.meter(t(L('Weight', 'الوزن')), j.grossKg / 1000, eq.payload / 1000, 't');
  };
  OPS.g.rates = (s, withRisk) => {
    const sc = OPS.sc(s), got = s.rates.received || [];
    if (!got.length) return '';
    const rows = got.map((k) => { const r = sc.rates.find((x) => x.c === k); return { label: OPS.lines[k].name, strong: s.rates.selected && s.rates.selected.c === k, values: withRisk ? [OPS.rateTotal(r, sc), OPS.riskCost(sc, r)] : [OPS.rateTotal(r, sc)], tips: [`${r.transit} ${t(L('days via', 'يومًا عبر'))} ${r.ts} · ${r.free} ${t(L('free days', 'أيام سماح'))}${OPS.rateValidFor(s, r) ? '' : ' · ⚠ ' + t(L('expires too early', 'تنتهي مبكرًا'))}`, sc.mode === 'LCL' ? t(L('Freight + expected CFS storage', 'الشحن + التخزين المتوقّع')) : t(L('Freight + expected demurrage/detention', 'الشحن + الغرامات المتوقّعة'))] }; });
    return V.hbars({ title: sc.mode === 'LCL' ? t(L('Consolidator offers (USD for your W/M)', 'عروض المجمِّعين (دولار لوحداتك W/M)')) : t(L('Carrier offers (USD per container)', 'عروض الخطوط (دولار للحاوية)')), sub: withRisk ? t(L('All-in freight vs. freight + the D&D you would probably pay', 'الشحن الشامل مقابل الشحن + الغرامات المحتمل دفعها')) : t(L('Hover a bar for transit, transshipment and free days', 'مرّر فوق الشريط لمدة النقل والمسافنة وأيام السماح')), series: withRisk ? [{ l: t(L('All-in', 'الشامل')), c: 's1' }, { l: t(L('Risk-adjusted', 'مع احتساب المخاطر')), c: 's2' }] : [{ l: t(L('All-in', 'الشامل')), c: 's1' }], rows, unit: 'USD' });
  };
  OPS.g.quote = (s) => {
    const q = s.quotation || (s.work.quote && s.work.quote.data && s.work.quote.data.q && { lines: s.work.quote.data.q.lines, insurance: s.work.quote.data.q.insurance });
    if (!q) return '';
    const act = q.lines.filter((l) => l.group !== 'optional' || q.insurance);
    if (act.some((l) => l.sell === '' || l.sell == null)) return `<p class="muted">${esc(t(L('Enter all sell prices to see how your price is built.', 'أدخل كل أسعار البيع لترى كيف يتكوّن سعرك.')))}</p>`;
    const Q = (l, k) => Number(l[k]) * (l.qty || 1);
    const carrier = act.filter((l) => l.vendor === 'carrier').reduce((a, l) => a + Q(l, 'buy'), 0);
    const local = act.filter((l) => l.vendor !== 'carrier').reduce((a, l) => a + Q(l, 'buy'), 0);
    const sell = act.reduce((a, l) => a + Q(l, 'sell'), 0);
    return V.stack({ title: t(L('How your selling price is built', 'كيف يتكوّن سعر البيع')), sub: t(L('USD, before VAT', 'دولار، قبل الضريبة')), unit: 'USD', parts: [{ l: t(L('Shipping line cost', 'كلفة الخط الملاحي')), v: R(carrier), c: 's1' }, { l: t(L('Local suppliers cost', 'كلفة المورّدين المحليين')), v: R(local), c: 's3' }, { l: t(L('Your margin', 'هامشك')), v: R(sell - carrier - local), c: 's2' }] });
  };
  OPS.g.cutoffs = (s, vessel) => {
    const b = s.booking || vessel; if (!b) return '';
    const cu = b.cutoffs || b;
    const lcl = OPS.sc(s).mode === 'LCL';
    const items = lcl ? [{ l: 'CFS open', date: cu.erd }, { l: 'SI', date: cu.si }, { l: 'CFS cut', date: cu.cy }, { l: 'ETD', date: b.etd }] : [{ l: 'ERD', date: cu.erd }, { l: 'SI', date: cu.si }, { l: 'VGM', date: cu.vgm }, { l: 'CY', date: cu.cy }, { l: 'ETD', date: b.etd }];
    if (s.jobFile && s.jobFile.readyDate) items.push({ l: t(L('Ready', 'جاهز')), date: s.jobFile.readyDate });
    if (s.equipment && s.equipment.gateIn) items.push({ l: 'Gate-in', date: s.equipment.gateIn });
    return V.timeline({ title: t(L('Deadlines for ', 'المواعيد النهائية لـ ')) + (b.vessel || ''), today: s.sim.today, items });
  };
  OPS.g.journey = (s) => {
    const b = s.booking; if (!b) return '';
    const eta = b.revisedEta || b.eta, today = s.sim.today;
    let p = 0;
    if (today >= b.etd) {
      const tsA = b.tsArrival || TS.addDays(b.etd, Math.round(TS.diffDays(b.etd, eta) * 0.6)), tsD = b.tsDeparture || tsA;
      if (today < tsA) p = 0.5 * (TS.diffDays(b.etd, today) / Math.max(1, TS.diffDays(b.etd, tsA)));
      else if (today < tsD) p = 0.5;
      else if (today < eta) p = 0.5 + 0.5 * (TS.diffDays(tsD, today) / Math.max(1, TS.diffDays(tsD, eta)));
      else p = 1;
    }
    const delivered = s.delivery && s.delivery.emptyReturnedOn && today >= s.delivery.emptyReturnedOn;
    const status = today < b.etd ? t(L('Waiting to sail', 'بانتظار الإبحار')) : p < 0.5 ? t(L('At sea — first leg', 'في البحر — المرحلة الأولى')) : p === 0.5 ? t(L('At the transshipment hub', 'في مرفأ المسافنة')) : p < 1 ? t(L('At sea — final leg', 'في البحر — المرحلة الأخيرة')) : delivered ? t(L('Delivered — empty returned', 'سُلّمت — أُرجع الفارغ')) : t(L('Arrived at destination', 'وصلت إلى الوجهة'));
    return V.journey({ title: t(L('Where is my container?', 'أين حاويتي؟')), from: b.pol, via: String(b.ts).split(' (')[0], to: b.pod, fromD: 'ETD ' + TS.fmtDate(b.etd, false), viaD: b.tsArrival ? TS.fmtDate(b.tsArrival, false) : '', toD: 'ETA ' + TS.fmtDate(eta, false), progress: p, icon: delivered ? '✅' : '⛴', label: status + ' · ' + (s.equipment && s.equipment.containerNo ? s.equipment.containerNo : '') });
  };
  OPS.g.dd = (s) => {
    const d = s.dd && s.dd.destination; if (!d) return '';
    if (d.lcl) { if (!d.rate) return ''; return V.ddcurve({ title: t(L('CFS storage — cost by day', 'تخزين المحطة — الكلفة حسب اليوم')), sub: t(L('Per W/M per day after the free days', 'لكل W/M يوميًا بعد الأيام المجانية')), days: Math.max(d.days + 6, d.freeDays + 10), free: d.freeDays, costAt: (n) => TS.round2(Math.max(0, n - d.freeDays) * d.rate * d.wm), actual: d.days, unit: 'USD' }); }
    const tar = OPS.sc(s).ddTariff;
    return V.ddcurve({ title: t(L('Demurrage & detention — cost by day', 'غرامات التأخير والاحتجاز — الكلفة حسب اليوم')), sub: t(L('Each day after the free time costs more; hover the curve', 'كل يوم بعد فترة السماح يكلّف أكثر؛ مرّر فوق المنحنى')), days: Math.max(d.days + 6, d.freeDays + 10), free: d.freeDays, costAt: (n) => OPS.ddCost(Math.max(0, n - d.freeDays), tar), actual: d.days, unit: 'USD' });
  };
  OPS.g.pl = (s) => {
    const j = s.closing && s.closing.jobCosting; if (!j) return '';
    const carrier = j.cost.filter((x) => x.vendor === 'carrier').reduce((a, x) => a + x.amount, 0);
    return V.waterfall({ title: t(L('Job profit — from revenue to profit', 'ربح العملية — من الإيراد إلى الربح')), sub: 'USD', unit: 'USD', items: [{ l: t(L('Revenue', 'الإيراد')), v: j.revenue, kind: 'total' }, { l: t(L('Line', 'الخط')), v: -R(carrier), kind: 'delta' }, { l: t(L('Others', 'آخرون')), v: -R(j.costTotal - carrier), kind: 'delta' }, { l: t(L('Profit', 'الربح')), v: j.profit, kind: 'total' }] });
  };

  /* one insight card per step */
  OPS.insight = (stepId, s) => {
    const m = {
      inquiry: () => OPS.g.fit(s), rates: () => OPS.g.rates(s, !!(s.rates && s.rates.selected)), quote: () => OPS.g.quote(s),
      booking: () => (s.booking ? OPS.g.cutoffs(s) : s.work.booking && s.work.booking.data.v != null && s.work.booking.data.v >= 0 ? OPS.g.cutoffs(s, OPS.schedule(s, s.rates.selected.c)[s.work.booking.data.v]) : ''),
      stuffing: () => OPS.g.fit(s), gatein: () => OPS.g.cutoffs(s), si: () => OPS.g.cutoffs(s),
      sailing: () => OPS.g.journey(s), tracking: () => OPS.g.journey(s), release: () => OPS.g.journey(s), delivery: () => OPS.g.dd(s) || OPS.g.journey(s), closing: () => OPS.g.pl(s),
    }[stepId];
    const h = m ? m() : '';
    return h ? `<div class="card"><div class="row" style="justify-content:space-between"><b>📊 ${esc(t(L('Insight', 'رؤية بيانية')))}</b><button class="btn sm ghost" data-go="dashboard">${esc(t(L('Full dashboard', 'لوحة التحكّم')))} →</button></div>${h}</div>` : '';
  };

  /* shipment dashboard */
  OPS.viewDashboard = (main) => {
    const s = app().ship, done = OPS.steps.filter((x) => app().stepDone(s, x)).length;
    const kp = (k, v, sub) => `<div class="kpi"><div class="k">${esc(k)}</div><div class="v">${v}</div><div class="s">${esc(sub || '')}</div></div>`;
    const q = s.quotation;
    main.innerHTML = `<h1>📊 ${esc(t(L('Shipment dashboard', 'لوحة الشحنة')))} — ${esc(s.id)}</h1>
      <div class="kpis">${kp(t(L('Progress', 'التقدّم')), `${done}/${OPS.steps.length}`, t(L('steps completed', 'مراحل منجزة')))}${kp(t(L('Simulation date', 'تاريخ المحاكاة')), TS.fmtDate(s.sim.today, false), s.direction === 'import' ? t(L('Import', 'استيراد')) : t(L('Export', 'تصدير')))}${kp(t(L('Quoted profit', 'الربح المقدّر')), q ? 'USD ' + TS.num(q.totals.profit, 0) : '—', q ? TS.num(q.totals.margin, 1) + '% ' + t(L('margin', 'هامش')) : '')}${kp(t(L('Score', 'النتيجة')), Math.max(0, 100 - s.score.mistakes * 2 - s.score.hints * 3), `${s.score.mistakes} ${t(L('mistakes', 'أخطاء'))} · ${s.score.hints} ${t(L('hints', 'تلميحات'))}`)}</div>
      <div class="card"><b>${esc(t(L('Process', 'العملية')))}</b><div class="stepper">${OPS.steps.map((x, i) => `<button class="${app().stepDone(s, x) ? 'done' : x.id === s.stage ? 'cur' : ''}" data-go="step:${x.id}" title="${i + 1}. ${esc(t(OPS.stTitle(x, s)))}" aria-label="${i + 1}. ${esc(t(OPS.stTitle(x, s)))}"></button>`).join('')}</div></div>
      <div class="dash">
        ${s.booking ? `<div class="card wide">${OPS.g.journey(s)}</div><div class="card wide">${OPS.g.cutoffs(s)}</div>` : `<div class="card wide"><p class="muted">${esc(t(L('The route map and deadline timeline appear once the booking is confirmed (step 4).', 'تظهر خريطة المسار والمواعيد بعد تأكيد الحجز (المرحلة 4).')))}</p></div>`}
        ${s.jobFile && s.jobFile.cbm ? `<div class="card">${OPS.g.fit(s)}</div>` : ''}
        ${q ? `<div class="card">${OPS.g.quote(s)}</div>` : ''}
        ${s.rates && s.rates.received && s.rates.received.length ? `<div class="card wide">${OPS.g.rates(s, !!s.rates.selected)}</div>` : ''}
        ${s.dd && s.dd.destination ? `<div class="card wide">${OPS.g.dd(s)}</div>` : ''}
        ${s.closing && s.closing.jobCosting ? `<div class="card wide">${OPS.g.pl(s)}</div>` : ''}
        <div class="card wide"><b>${esc(t(L('Milestones', 'المحطات')))}</b><ul class="timeline" style="margin-top:8px">${s.milestones.map((m) => `<li class="done"><b>${TS.fmtDate(m.date, false)}</b> — ${esc(m.label)}</li>`).join('') || `<li>${esc(t(L('None yet', 'لا شيء بعد')))}</li>`}</ul></div>
      </div>`;
  };

  /* KPIs on the home page */
  OPS.homeKpis = () => {
    const list = TS.store.list().filter((s) => s.case);
    if (!list.length) return '';
    const doneAll = list.filter((s) => OPS.steps.every((x) => s.steps && s.steps[x.id])).length;
    const profit = list.reduce((a, s) => a + ((s.closing && s.closing.jobCosting && s.closing.jobCosting.profit) || 0), 0);
    const avg = list.reduce((a, s) => a + Math.max(0, 100 - s.score.mistakes * 2 - s.score.hints * 3), 0) / list.length;
    const pct = list.reduce((a, s) => a + OPS.steps.filter((x) => s.steps && s.steps[x.id]).length, 0) / (list.length * OPS.steps.length) * 100;
    return `<div class="kpis"><div class="kpi" style="display:flex;gap:12px;align-items:center">${V.ring(pct, 'progress', 70)}<div><div class="k">${esc(t(L('Overall progress', 'التقدّم العام')))}</div><div class="s">${list.length} ${esc(t(L('shipments', 'شحنات')))}</div></div></div>
      <div class="kpi"><div class="k">${esc(t(L('Completed shipments', 'شحنات مكتملة')))}</div><div class="v">${doneAll}</div></div>
      <div class="kpi"><div class="k">${esc(t(L('Total job profit', 'مجموع أرباح العمليات')))}</div><div class="v">USD ${TS.num(profit, 0)}</div></div>
      <div class="kpi"><div class="k">${esc(t(L('Average score', 'متوسط النتيجة')))}</div><div class="v">${TS.num(avg, 0)}/100</div></div></div>`;
  };

  /* ---------------- coach ---------------- */
  OPS.coachModel = () => {
    const s = app().ship;
    if (!s) return { title: t(L('Take a client from the board — or try 🎲 a random one.', 'استلم زبونًا من اللوحة — أو جرّب 🎲 زبونًا عشوائيًا.')) };
    const st = OPS.steps.find((x) => !app().stepDone(s, x));
    const alerts = [];
    const b = s.booking, today = s.sim.today;
    if (b && !s.steps.sailing) {
      const lcl = OPS.sc(s).mode === 'LCL';
      const chk = lcl ? [['SI', b.cutoffs.si, s.documents && s.documents.si], ['CFS', b.cutoffs.cy, s.equipment && s.equipment.cfsReceived]] : [['SI', b.cutoffs.si, s.documents && s.documents.si], ['VGM', b.cutoffs.vgm, s.equipment && s.equipment.vgmSubmitted], ['CY', b.cutoffs.cy, s.equipment && s.equipment.gateIn]];
      chk.forEach(([n, dte, ok]) => { if (ok) return; const dd = TS.diffDays(today, dte); if (dd < 0) alerts.push({ lvl: 'bad', text: `${n} cutoff ${t(L('passed', 'فات'))} (${TS.fmtDate(dte, false)})` }); else if (dd <= 3) alerts.push({ lvl: dd <= 1 ? 'bad' : 'warn', text: `${n} cutoff ${t(L('in', 'بعد'))} ${dd} ${t(L('day(s)', 'يوم'))} — ${TS.fmtDate(dte, false)}` }); });
    }
    if (s.dd && s.dd.destination && s.dd.destination.chargeable > 0) alerts.push({ lvl: 'warn', text: `${s.dd.destination.lcl ? t(L('CFS storage', 'تخزين المحطة')) : t(L('Demurrage/detention', 'غرامات'))}: USD ${TS.num(s.dd.destination.cost)}` });
    const nr = OPS.mail.needs(s);
    if (nr) alerts.push({ lvl: 'bad', text: `${nr} ${t(L('email(s) waiting for your reply', 'رسائل تنتظر ردّك'))}` });
    const un = s.emails.filter((e) => e.box === 'in' && !e.read).length;
    if (un) alerts.push({ lvl: 'warn', text: `${un} ${t(L('unread email(s)', 'رسائل غير مقروءة'))}` });
    if (!st) return { title: t(L('Shipment complete — open Customs or Accounting to continue the file.', 'اكتملت الشحنة — افتح الجمارك أو المحاسبة لمتابعة الملف.')), alerts, action: { label: t(L('Dashboard', 'اللوحة')), run: () => app().go('dashboard') } };
    const w = s.work[st.id] || { parts: {}, quiz: {} };
    const part = OPS.P(st, s).find((p) => !(w.parts && w.parts[p.id]));
    const i = OPS.steps.indexOf(st) + 1;
    return { title: `${i}. ${t(OPS.stTitle(st, s))}`, text: part ? '→ ' + t(typeof part.title === 'function' ? part.title(s) : part.title) : '→ ' + t(L('Pass the quiz', 'اجتز الاختبار')), alerts, action: { label: t(L('Go', 'انتقل')), run: () => { app().tab[st.id] = part ? 'task' : 'quiz'; app().go('step:' + st.id); } } };
  };

  /* ---------------- autopilot adapter ---------------- */
  OPS.apAdapter = {
    current() {
      const s = app().ship; if (!s) return null;
      const st = OPS.steps.find((x) => !app().stepDone(s, x)); if (!st) return null;
      const w = s.work[st.id] || { parts: {} };
      const p = OPS.P(st, s).find((x) => !(w.parts && w.parts[x.id]));
      return { stepId: st.id, partId: p ? p.id : null, n: Object.keys(w.parts || {}).length };
    },
    open(id, tab) { if (app().view !== 'step:' + id || app().tab[id] !== tab) { app().tab[id] = tab; app().go('step:' + id); } },
    fillQuiz(id) { const st = OPS.steps.find((x) => x.id === id), w = app().ship.work[id]; w.quiz.ans = {}; OPS.quizFor(app().ship, st).forEach((q, i) => (w.quiz.ans[i] = q.a)); app().save(); app().render(); },
    special(body, stepId, partId) {
      if (stepId === 'rates' && partId === 'send') { const un = [...body.querySelectorAll('input[type=checkbox][value]')].filter((c) => !c.checked); if (un.length) { un[0].click(); return true; } }
      return false;
    },
  };
  TS.autopilot.adapter = OPS.apAdapter;

  /* ---------------- command palette ---------------- */
  TS.cmd.providers.push(() => {
    const s = app().ship, out = [];
    if (s) {
      OPS.steps.forEach((x, i) => out.push({ label: `${i + 1}. ${t(OPS.stTitle(x, s))}`, hint: t(L('Step', 'مرحلة')), run: () => app().go('step:' + x.id) }));
      OPS.docs.list(s).forEach((d) => out.push({ label: t(d.name), hint: t(L('Document', 'مستند')), run: () => OPS.openDoc(d.id) }));
      [['dashboard', L('Shipment dashboard', 'لوحة الشحنة')], ['inbox', L('Email', 'البريد')], ['portal', L('Carrier portal', 'بوابة الخطوط')], ['json', L('Shipment JSON', 'ملف JSON')]].forEach(([v, l]) => out.push({ label: t(l), hint: t(L('Page', 'صفحة')), run: () => app().go(v) }));
      out.push({ label: t(L('▶ Autopilot: play the current step', '▶ الطيار الآلي: نفّذ المرحلة الحالية')), hint: t(L('Automation', 'أتمتة')), run: () => TS.autopilot.start(OPS.apAdapter, 'step') });
      out.push({ label: t(L('⏩ Autopilot: play the whole shipment', '⏩ الطيار الآلي: نفّذ الشحنة كاملة')), hint: t(L('Automation', 'أتمتة')), run: () => TS.autopilot.start(OPS.apAdapter, 'all') });
    }
    [['home', L('Client board (home)', 'لوحة الزبائن (الرئيسية)')], ['drills', L('Drills — endless practice', 'تمارين لا تنتهي')], ['lebanon', L('Lebanon guide', 'دليل لبنان')], ['incoterms', L('Incoterms 2020', 'إنكوترمز 2020')], ['equipment', L('Containers', 'الحاويات')], ['glossary', L('Glossary', 'المصطلحات')], ['tools', L('Calculators', 'الحاسبات')]].forEach(([v, l]) => out.push({ label: t(l), hint: t(L('Page', 'صفحة')), run: () => app().go(v) }));
    out.push({ label: t(L('Show the tour again', 'أعد عرض الجولة')), hint: t(L('Help', 'مساعدة')), run: () => TS.tour('ops', TS.TOUR_BASIC, true) });
    return out;
  });

  OPS.afterRender = () => {
    TS.coach(OPS.coachModel());
  };
})();
