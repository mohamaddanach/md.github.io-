/* Commodity Trading Academy — learning path & mastery engine
 * Mastery-based progression: a lesson counts as complete only when its check quiz is passed
 * (>= 70%). A stage is mastered when all its lessons (and activities) are complete; the next
 * stage unlocks when the previous one is mastered (unless "free navigation" is enabled).
 */
(function () {
  'use strict';
  const CTA = window.CTA;
  CTA.TOPICS = {
    foundations: 'Business foundations', accounting: 'Accounting', markets: 'Global markets', gold: 'Gold', wheat: 'Wheat', sugar: 'Sugar', steel: 'Steel',
    physical: 'Physical trading', finance: 'Trade finance', incoterms: 'Incoterms', documents: 'Documents', logistics: 'Logistics & shipping', derivatives: 'Futures & hedging',
    options: 'Options', spreads: 'Spreads & arbitrage', analysis: 'Market analysis', quant: 'Quantitative methods', risk: 'Risk management', negotiation: 'Negotiation',
  };
  CTA.STAGES = [
    { n: 1, title: 'Business & commodity foundations', desc: 'What commodities are, who trades them, the instruments, price formation, deal economics, risk types and the accounting every trader must read.', lessons: ['f-commodity', 'f-participants', 'f-instruments', 'f-pricing', 'f-economics', 'f-risk', 'f-accounting'] },
    { n: 2, title: 'Market structures & price formation', desc: 'The value chain from mine or farm to end user, trade flows, macro drivers, logistics-driven price differences and how to tell a temporary move from a structural change.', lessons: ['m-valuechain', 'm-flows', 'm-macro', 'm-logistics-prices', 'm-shocks'] },
    { n: 3, title: 'Gold, wheat, sugar & steel fundamentals', desc: 'Product knowledge for the four commodities: specifications, units, supply chains, instruments and the drivers specific to each market.', lessons: ['g-basics', 'g-instruments', 'g-drivers', 'w-basics', 'w-markets', 's-basics', 's-markets', 'st-basics', 'st-specs', 'st-markets'] },
    { n: 4, title: 'Physical commodity trading', desc: 'The 25-step physical deal workflow and how it differs for bullion, grain, sugar and steel.', lessons: ['p-workflow', 'p-gold', 'p-wheat', 'p-sugar', 'p-steel'] },
    { n: 5, title: 'Trade finance, contracts & logistics', desc: 'Contracts and documents, payment methods, letters of credit under UCP 600, Incoterms 2020, shipping and cargo operations.', lessons: ['t-contracts', 't-payments', 't-lc', 't-incoterms', 'l-shipping', 'l-operations'] },
    { n: 6, title: 'Futures, options & hedging', desc: 'Exchange contract mechanics, margin, hedging and basis risk, options and Greeks, spreads and arbitrage.', lessons: ['d-futures', 'd-hedging', 'd-options', 'd-spreads'] },
    { n: 7, title: 'Market analysis & quantitative methods', desc: 'Supply-and-demand balances, technical indicators as descriptive tools, statistics of returns, VaR, Expected Shortfall and their limits.', lessons: ['a-fundamental', 'a-technical', 'a-quant', 'a-risk-models'] },
    { n: 8, title: 'Risk management & negotiation', desc: 'Risk frameworks, limits, stress testing, residual risk of hedges and commercial negotiation of complete deals.', lessons: ['r-framework', 'r-limits', 'n-negotiation'] },
    { n: 9, title: 'Full commercial deal simulations', desc: 'Run complete physical deals in each commodity, negotiate a contract and operate the trading company.', lessons: [], activities: [
      { id: 'sim-gold', label: 'Complete a physical gold deal in the Physical Trading Simulator', test: () => CTA.progress.simDone('gold'), go: 'physical/workflow' },
      { id: 'sim-wheat', label: 'Complete a physical wheat deal', test: () => CTA.progress.simDone('wheat'), go: 'physical/workflow' },
      { id: 'sim-sugar', label: 'Complete a physical sugar deal', test: () => CTA.progress.simDone('sugar'), go: 'physical/workflow' },
      { id: 'sim-steel', label: 'Complete a physical steel deal', test: () => CTA.progress.simDone('steel'), go: 'physical/workflow' },
      { id: 'nego', label: 'Close at least one negotiation in the Deal Room', test: () => (CTA.state.negotiations || []).some((n) => n.outcome === 'agreed'), go: 'dealroom' },
      { id: 'company', label: 'Operate the trading company for 6 simulated months', test: () => !!(CTA.state.company && CTA.state.company.month >= 6), go: 'physical/company' },
    ] },
    { n: 10, title: 'Final professional trading assessment', desc: 'Pass the eleven subject examinations and the full commodity trading case examination.', lessons: [], activities: [
      { id: 'exams', label: 'Pass all 11 subject examinations (70%+)', test: () => CTA.progress.examsPassed() >= 11, go: 'exams' },
      { id: 'final', label: 'Pass the full commodity trading case (exam 12)', test: () => CTA.progress.examPassed('final-case'), go: 'exams/final-case' },
    ] },
  ];

  const P = (CTA.progress = {});
  P.lessonDone = (id) => !!(CTA.state.lessons[id] && CTA.state.lessons[id].done);
  P.simDone = (com) => (CTA.state.physical.completed || []).some((d) => d.commodity === com);
  P.examPassed = (id) => !!(CTA.state.exams[id] && CTA.state.exams[id].passed);
  P.examsPassed = () => Object.keys(CTA.state.exams).filter((k) => k !== 'final-case' && CTA.state.exams[k].passed).length;
  P.stageOf = (lessonId) => CTA.STAGES.findIndex((s) => s.lessons.includes(lessonId));
  P.stageStatus = function (i) {
    const s = CTA.STAGES[i];
    const ld = s.lessons.filter(P.lessonDone).length;
    const acts = (s.activities || []).map((a) => ({ a, ok: !!a.test() }));
    const ad = acts.filter((x) => x.ok).length;
    const total = s.lessons.length + acts.length;
    const done = ld + ad;
    return { lessonsDone: ld, lessonsTotal: s.lessons.length, acts, done, total, pct: total ? done / total * 100 : 0, mastered: total > 0 && done === total };
  };
  P.stageUnlocked = function (i) {
    if (i === 0 || CTA.state.settings.freeNav) return true;
    return P.stageStatus(i - 1).mastered;
  };
  P.lessonUnlocked = (id) => { const i = P.stageOf(id); return i < 0 || P.stageUnlocked(i); };
  P.overall = function () {
    let done = 0, total = 0;
    CTA.STAGES.forEach((_, i) => { const s = P.stageStatus(i); done += s.done; total += s.total; });
    return total ? done / total * 100 : 0;
  };
  P.nextLesson = function () {
    for (let i = 0; i < CTA.STAGES.length; i++) {
      if (!P.stageUnlocked(i)) return null;
      const id = CTA.STAGES[i].lessons.find((l) => !P.lessonDone(l));
      if (id) return CTA.L_INDEX[id];
    }
    return null;
  };
  P.currentStage = function () {
    for (let i = 0; i < CTA.STAGES.length; i++) if (!P.stageStatus(i).mastered) return i;
    return CTA.STAGES.length - 1;
  };
  P.completeLesson = function (id, pct) {
    const l = CTA.state.lessons[id] || { visits: 0 };
    const was = l.done;
    l.best = Math.max(l.best || 0, pct); l.done = l.done || pct >= 70; l.ts = Date.now();
    CTA.state.lessons[id] = l; CTA.save();
    if (l.done && !was) {
      CTA.log('Mastered lesson: ' + ((CTA.L_INDEX[id] || {}).title || id), 'lesson');
      const si = P.stageOf(id);
      if (si >= 0 && P.stageStatus(si).mastered) { CTA.toast(`Stage ${si + 1} mastered — stage ${si + 2} unlocked.`, 'ok'); CTA.log(`Stage ${si + 1} mastered`, 'stage'); }
    }
    CTA.updateTopStats();
    return l.done;
  };
  /* accuracy by topic across quiz questions and numeric exercises */
  P.topicStats = function () {
    const t = {};
    Object.keys(CTA.TOPICS).forEach((k) => { t[k] = { qc: 0, qn: 0, ec: 0, en: 0 }; });
    Object.entries(CTA.state.answers).forEach(([id, a]) => { const q = CTA.Q_INDEX[id]; if (!q || !t[q.t]) return; t[q.t].qn += a.n; t[q.t].qc += a.c; });
    Object.entries(CTA.state.exercises).forEach(([id, a]) => { const e = CTA.EX_INDEX[id]; if (!e || !t[e.topic]) return; t[e.topic].en += a.n; t[e.topic].ec += a.c; });
    Object.values(t).forEach((x) => { x.n = x.qn + x.en; x.c = x.qc + x.ec; x.acc = x.n ? x.c / x.n * 100 : null; });
    return t;
  };
  P.weakTopics = function () {
    const ts = P.topicStats();
    return Object.entries(ts).filter(([, x]) => x.n >= 3 && x.acc < 65).sort((a, b) => a[1].acc - b[1].acc).map(([k, x]) => ({ topic: k, label: CTA.TOPICS[k], acc: x.acc, n: x.n }));
  };
})();
