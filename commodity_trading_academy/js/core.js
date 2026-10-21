/* Commodity Trading Academy — core framework
 * state (localStorage), router, formatting, UI widgets (tabs, quiz, numeric exercise,
 * tooltips), SVG charts, global search. Every view registers itself with CTA.route().
 */
(function () {
  'use strict';
  const CTA = (window.CTA = window.CTA || {});
  const C = window.CALC;
  const LS_KEY = 'cta_state_v1';

  /* ================================================================ state */
  const DEFAULT_FX = { USD: 1, EUR: 0.92, GBP: 0.79, CHF: 0.88, JPY: 150, CNY: 7.2, INR: 83, BRL: 5.1, TRY: 33, EGP: 48, AED: 3.6725, SAR: 3.75 };
  CTA.defaultState = () => ({
    v: 1,
    created: new Date().toISOString(),
    user: { name: '' },
    settings: { currency: 'USD', fx: Object.assign({}, DEFAULT_FX), freeNav: false, sidebarCollapsed: false, specs: {}, autoJournal: true },
    lessons: {}, answers: {}, exercises: {}, cases: {}, docs: {},
    time: { total: 0, days: {} },
    activity: [], journal: [],
    futures: null, physical: { active: null, completed: [] }, negotiations: [], company: null,
    exams: {}, risk: { registers: {} }, dealCalc: null, lcChecks: {},
  });
  function load() {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (!raw) return CTA.defaultState();
      const s = JSON.parse(raw);
      const d = CTA.defaultState();
      Object.keys(d).forEach((k) => { if (s[k] === undefined) s[k] = d[k]; });
      s.settings = Object.assign(d.settings, s.settings || {});
      s.settings.fx = Object.assign({}, DEFAULT_FX, s.settings.fx || {});
      return s;
    } catch (e) { console.warn('State could not be loaded, starting fresh', e); return CTA.defaultState(); }
  }
  CTA.state = load();
  CTA.storageOK = true;
  let saveTimer = null;
  CTA.save = function (now) {
    const write = () => {
      try { localStorage.setItem(LS_KEY, JSON.stringify(CTA.state)); CTA.storageOK = true; }
      catch (e) { CTA.storageOK = false; console.warn('Progress could not be saved (storage blocked or full)', e); }
    };
    clearTimeout(saveTimer);
    if (now) write(); else saveTimer = setTimeout(write, 150);
  };
  window.addEventListener('beforeunload', () => CTA.save(true));
  CTA.resetState = () => { CTA.state = CTA.defaultState(); CTA.save(true); };
  CTA.log = function (text, type) {
    CTA.state.activity.unshift({ ts: Date.now(), text, type: type || 'info' });
    CTA.state.activity = CTA.state.activity.slice(0, 80);
    CTA.save();
  };

  /* ============================================================ helpers */
  const esc = (CTA.esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])));
  CTA.$ = (sel, el) => (el || document).querySelector(sel);
  CTA.$$ = (sel, el) => Array.from((el || document).querySelectorAll(sel));
  CTA.uid = (p) => (p || 'id') + '-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  CTA.clone = (o) => JSON.parse(JSON.stringify(o));
  CTA.today = () => new Date().toISOString().slice(0, 10);
  const fmt = (CTA.fmt = {});
  fmt.num = (n, d = 2) => (n == null || isNaN(n) || !isFinite(n) ? '—' : Number(n).toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d }));
  fmt.int = (n) => fmt.num(n, 0);
  fmt.money = (n, cur, d = 2) => (n == null || isNaN(n) || !isFinite(n) ? '—' : (cur || CTA.state.settings.currency || 'USD') + ' ' + fmt.num(n, d));
  fmt.pct = (n, d = 2) => (n == null || isNaN(n) || !isFinite(n) ? '—' : fmt.num(n, d) + '%');
  fmt.signed = (n, d = 2) => (n == null || isNaN(n) ? '—' : (n > 0 ? '+' : '') + fmt.num(n, d));
  fmt.cls = (n) => (n > 0 ? 'pos' : n < 0 ? 'neg' : '');
  fmt.date = (ts) => new Date(ts).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  fmt.dt = (ts) => new Date(ts).toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
  fmt.dur = (sec) => { const h = Math.floor(sec / 3600), m = Math.floor((sec % 3600) / 60); return h ? `${h} h ${m} min` : `${m} min`; };
  /* random permutation of 0..n-1 (optionally seeded) — used so correct answers are not always in the same position */
  CTA.shuffleIdx = (n, seed) => { const r = seed != null ? C.rng(seed) : Math.random; const a = Array.from({ length: n }, (_, i) => i); for (let i = n - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  CTA.num = (v, def = 0) => { const n = parseFloat(String(v).replace(/,/g, '')); return isNaN(n) ? def : n; };
  CTA.SIM = '<span class="sim-tag" title="All prices, counterparties and events in this platform are simulated for education. They are not market data.">SIMULATED</span>';
  CTA.ILLU = '<span class="sim-tag illu" title="Illustrative value — verify against the official source before relying on it.">ILLUSTRATIVE</span>';
  CTA.HIST = '<span class="sim-tag hist" title="Summary of a historical event for teaching. Check primary sources for detail.">HISTORICAL</span>';

  /* ============================================================ toast */
  CTA.toast = function (msg, kind) {
    let host = CTA.$('#toasts');
    if (!host) { host = document.createElement('div'); host.id = 'toasts'; host.setAttribute('aria-live', 'polite'); document.body.appendChild(host); }
    const t = document.createElement('div');
    t.className = 'toast ' + (kind || '');
    t.innerHTML = msg;
    host.appendChild(t);
    setTimeout(() => t.classList.add('out'), 3200);
    setTimeout(() => t.remove(), 3700);
  };

  /* ============================================================ content helpers (used by data files) */
  /* glossary term with tooltip: [[key|text]] in content strings or CTA.term(key, text) */
  CTA.term = (key, text) => `<span class="term" tabindex="0" data-term="${esc(key)}">${text || key}</span>`;
  CTA.rich = (html) => String(html || '').replace(/\[\[([^\]|]+)\|?([^\]]*)\]\]/g, (_, k, t) => CTA.term(k.trim(), t || k));
  /* concept card: definition (simple + professional), why it matters, example, numbers, mistake, quiz */
  CTA.K = function (c) {
    return `<div class="concept" data-concept="${esc(c.t)}">
      <div class="concept-h"><h4>${esc(c.t)}</h4><div class="seg sm" role="tablist"><button class="on" data-lvl="simple">Simple</button><button data-lvl="pro">Professional</button></div></div>
      <div class="lvl simple"><p>${CTA.rich(c.simple)}</p></div>
      <div class="lvl pro hidden"><p>${CTA.rich(c.pro)}</p></div>
      ${c.why ? `<p><b>Why it matters.</b> ${CTA.rich(c.why)}</p>` : ''}
      ${c.ex ? `<p><b>Business example.</b> ${CTA.rich(c.ex)}</p>` : ''}
      ${c.num ? `<div class="numbox"><b>Numbers</b> ${CTA.SIM}<div>${CTA.rich(c.num)}</div></div>` : ''}
      ${c.mistake ? `<p class="mistake"><b>Common beginner mistake.</b> ${CTA.rich(c.mistake)}</p>` : ''}
      ${c.q ? `<div class="inline-quiz" data-qids="${esc([].concat(c.q).join(','))}"></div>` : ''}
    </div>`;
  };
  CTA.callout = (kind, title, html) => `<div class="note ${kind}"><strong>${title}</strong>${CTA.rich(html)}</div>`;
  CTA.table = (head, rows, cls) => `<div class="table-wrap"><table class="${cls || ''}"><thead><tr>${head.map((h) => `<th>${h}</th>`).join('')}</tr></thead><tbody>${rows.map((r) => `<tr>${r.map((c) => `<td>${CTA.rich(String(c))}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;

  /* auto-link glossary terms: wraps the first occurrence of each term/alias in text nodes of `root` */
  CTA.autoTerms = function (root, max) {
    if (!CTA.GLOSSARY) return;
    if (!CTA._termRx) {
      const keys = [];
      const STOP = ['offer', 'ask', 'bid', 'roll', 'tick', 'carry', 'support', 'resistance', 'forward', 'stocks', 'premium', 'spot', 'options', 'option', 'delta', 'gamma', 'theta', 'vega', 'pol', 'cane', 'beet', 'duty', 'tariff', 'hedge', 'strike', 'multiplier', 'tolerance', 'volume', 'purity', 'custody', 'scrap', 'slab', 'bloom', 'billet', 'futures', 'exchange', 'inventory', 'basis', 'benchmark', 'swap'];
      CTA.GLOSSARY.forEach((g) => [g.term, ...g.alias].forEach((k) => { if (k.length >= 3 && !/[()]/.test(k) && !STOP.includes(k.toLowerCase())) keys.push(k); }));
      keys.sort((a, b) => b.length - a.length);
      const escRx = (t) => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      CTA._termRx = new RegExp('(^|[^A-Za-z0-9])(' + keys.map(escRx).join('|') + ')(?![A-Za-z0-9])', 'i');
    }
    const seen = new Set(); let count = 0; const limit = max || 60;
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, { acceptNode: (n) => (n.parentElement.closest('.term,a,button,label,input,select,textarea,h1,h2,h3,h4,.quiz,.kpi,.chart,svg,.doc,code,th') ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT) });
    const nodes = []; while (walker.nextNode()) nodes.push(walker.currentNode);
    for (const node of nodes) {
      if (count >= limit) break;
      let text = node.nodeValue; let m; const frag = document.createDocumentFragment(); let changed = false; let guard = 0;
      while (count < limit && (m = CTA._termRx.exec(text)) && guard++ < 20) {
        const word = m[2], key = word.toLowerCase(), g = CTA.glossaryIndex[key];
        const isAcronym = word.length <= 4 && word === word.toUpperCase();
        const start = m.index + m[1].length;
        if (!g || seen.has(g.term) || (isAcronym && !Object.values(CTA.glossaryIndex).some((x) => [x.term, ...x.alias].includes(word)))) { frag.appendChild(document.createTextNode(text.slice(0, start + word.length))); text = text.slice(start + word.length); continue; }
        seen.add(g.term); count++; changed = true;
        frag.appendChild(document.createTextNode(text.slice(0, start)));
        const sp = document.createElement('span'); sp.className = 'term'; sp.tabIndex = 0; sp.dataset.term = key; sp.textContent = word; frag.appendChild(sp);
        text = text.slice(start + word.length);
      }
      if (changed) { frag.appendChild(document.createTextNode(text)); node.parentNode.replaceChild(frag, node); }
    }
  };

  /* ============================================================ registries */
  CTA.routes = {};
  CTA.route = (id, def) => { CTA.routes[id] = Object.assign({ id }, def); };
  CTA.widgets = {};
  CTA.mountWidgets = (root) => {
    CTA.$$('[data-widget]', root).forEach((el) => {
      if (el.dataset.mounted) return;
      const w = CTA.widgets[el.dataset.widget];
      el.dataset.mounted = '1';
      if (w) { try { w(el); } catch (e) { console.error(e); el.innerHTML = '<div class="note bad">This tool failed to load: ' + esc(e.message) + '</div>'; } }
    });
    CTA.$$('.inline-quiz', root).forEach((el) => { if (!el.dataset.mounted) { el.dataset.mounted = '1'; CTA.ui.quiz(el, el.dataset.qids.split(','), { compact: true }); } });
  };

  /* ============================================================ navigation */
  CTA.NAV = [
    { group: 'Overview', items: [['command', '◧', 'Command Center'], ['path', '⇢', 'My Learning Path']] },
    { group: 'Knowledge', items: [['encyclopedia', '▤', 'Commodity Encyclopedia'], ['gold', '◆', 'Gold Trading', 'gold'], ['wheat', '❦', 'Wheat Trading', 'wheat'], ['sugar', '◇', 'Sugar Trading', 'sugar'], ['steel', '▣', 'Steel Trading', 'steel'], ['global', '◎', 'Global Commodity Markets']] },
    { group: 'Simulators', items: [['physical', '⛴', 'Physical Trading Simulator'], ['futures', '↗', 'Futures & Derivatives'], ['analysis', '∿', 'Market Analysis Lab'], ['dealroom', '⇄', 'Deal Room']] },
    { group: 'Operations', items: [['finance', '▦', 'Trade Finance & Documents'], ['logistics', '⚓', 'Logistics & Supply Chain'], ['risk', '⚠', 'Risk Management Center'], ['quant', 'Σ', 'Quantitative Lab']] },
    { group: 'Records', items: [['journal', '✎', 'Trading Journal'], ['performance', '▲', 'Performance Analytics'], ['exams', '✓', 'Exams & Certifications'], ['glossary', 'Aa', 'Glossary'], ['settings', '⚙', 'Settings & Progress']] },
  ];
  CTA.parseHash = () => {
    const h = (location.hash || '#/command').replace(/^#\/?/, '');
    const [path, qs] = h.split('?');
    const parts = path.split('/').filter(Boolean).map(decodeURIComponent);
    const q = {}; (qs || '').split('&').filter(Boolean).forEach((kv) => { const [k, v] = kv.split('='); q[decodeURIComponent(k)] = decodeURIComponent(v || ''); });
    return { id: parts[0] || 'command', parts: parts.slice(1), q };
  };
  CTA.go = (path) => { location.hash = '#/' + path.replace(/^#?\/?/, ''); };
  CTA.current = null;
  CTA.render = function () {
    const r = CTA.parseHash();
    const def = CTA.routes[r.id] || CTA.routes.command;
    CTA.current = r;
    const main = CTA.$('#main');
    if (CTA.cleanup) { try { CTA.cleanup(); } catch (e) { /* ignore */ } CTA.cleanup = null; }
    main.innerHTML = '';
    main.oninput = null; main.onchange = null; main.onclick = null;
    main.className = 'main ' + (def.theme || '');
    document.title = (def.title || 'Commodity Trading Academy') + ' · CTA';
    CTA.$$('.nav-link').forEach((a) => a.classList.toggle('active', a.dataset.id === (def.navId || def.id)));
    CTA.$('#crumb').textContent = def.title || '';
    try { def.render(main, r); } catch (e) {
      console.error(e);
      main.innerHTML = `<div class="card"><h2>Something went wrong</h2><p>This screen hit an error: <code>${esc(e.message)}</code>. Your progress is safe. Try another section or reload the page.</p></div>`;
    }
    CTA.mountWidgets(main);
    if (!r.q.keep) window.scrollTo(0, 0);
    document.body.classList.remove('nav-open');
  };
  window.addEventListener('hashchange', CTA.render);

  /* page header helper */
  CTA.pageHead = (title, sub, accent, right) => `<header class="page-head ${accent ? 'accent-' + accent : ''}"><div><h1>${title}</h1>${sub ? `<p class="lede">${sub}</p>` : ''}</div>${right ? `<div class="ph-right">${right}</div>` : ''}</header>`;

  /* tabs: tabs = [[key,label]], active key, base path for hash */
  CTA.tabs = (tabs, active, base) => `<nav class="tabs" role="tablist">${tabs.map(([k, l]) => `<a role="tab" aria-selected="${k === active}" class="${k === active ? 'on' : ''}" href="#/${base}/${k}">${l}</a>`).join('')}</nav>`;

  /* ============================================================ shell */
  CTA.buildShell = function () {
    const st = CTA.state.settings;
    document.body.classList.toggle('side-collapsed', !!st.sidebarCollapsed);
    CTA.$('#app').innerHTML = `
      <aside class="sidebar" id="sidebar" aria-label="Main navigation">
        <div class="logo"><span class="mark">CTA</span><span class="txt">Commodity Trading<br><b>Academy</b></span></div>
        <nav>${CTA.NAV.map((g) => `<div class="nav-group"><div class="nav-gl">${g.group}</div>${g.items.map(([id, ic, label, acc]) => `<a class="nav-link ${acc ? 'acc-' + acc : ''}" data-id="${id}" href="#/${id}" title="${label}"><span class="ic">${ic}</span><span class="lb">${label}</span></a>`).join('')}</div>`).join('')}</nav>
        <div class="side-foot"><button class="collapse-btn" id="collapseBtn" title="Collapse / expand sidebar" aria-label="Collapse or expand sidebar">⟨⟩</button></div>
      </aside>
      <div class="shell">
        <header class="topbar">
          <button class="menu-btn" id="menuBtn" aria-label="Open navigation">☰</button>
          <div class="crumb"><span class="muted">CTA /</span> <span id="crumb"></span></div>
          <div class="search"><input id="gsearch" type="search" placeholder="Search lessons, terms, documents…" aria-label="Search the academy" autocomplete="off"><div id="gresults" class="gresults hidden"></div></div>
          <div class="top-stats" id="topStats"></div>
        </header>
        <div class="sim-banner">Educational simulation — every price, rate, counterparty and event is <b>simulated or illustrative</b> unless explicitly labelled as a historical fact or an official source link. Nothing here is market data or investment, legal, tax or banking advice.</div>
        <main id="main" class="main"></main>
      </div>
      <div id="tip" class="tip hidden" role="tooltip"></div>`;
    CTA.$('#collapseBtn').onclick = () => { st.sidebarCollapsed = !st.sidebarCollapsed; document.body.classList.toggle('side-collapsed', st.sidebarCollapsed); CTA.save(); };
    CTA.$('#menuBtn').onclick = () => document.body.classList.toggle('nav-open');
    CTA.updateTopStats();
    CTA.initSearch();
  };
  CTA.updateTopStats = function () {
    const el = CTA.$('#topStats'); if (!el) return;
    const p = CTA.progress ? CTA.progress.overall() : 0;
    el.innerHTML = `<span title="Overall mastery progress"><i class="pbar sm"><b style="width:${p}%"></b></i> ${Math.round(p)}%</span><span title="Total study time">⏱ ${fmt.dur(CTA.state.time.total)}</span>`;
  };

  /* ============================================================ tooltips */
  let tipTarget = null;
  function showTip(el) {
    const key = el.dataset.term;
    const g = CTA.glossaryIndex && CTA.glossaryIndex[key.toLowerCase()];
    const tip = CTA.$('#tip'); if (!tip) return;
    tip.innerHTML = g ? `<b>${esc(g.term)}</b><br>${esc(g.def)}` : `<b>${esc(key)}</b><br><span class="muted">See the Glossary.</span>`;
    tip.classList.remove('hidden');
    const r = el.getBoundingClientRect();
    const tw = Math.min(340, window.innerWidth - 24);
    tip.style.maxWidth = tw + 'px';
    let left = Math.max(12, Math.min(r.left, window.innerWidth - tw - 12));
    tip.style.left = left + 'px';
    const below = r.bottom + 8 + tip.offsetHeight < window.innerHeight;
    tip.style.top = (below ? r.bottom + 8 : r.top - tip.offsetHeight - 8) + window.scrollY + 'px';
    tipTarget = el;
  }
  function hideTip() { const t = CTA.$('#tip'); if (t) t.classList.add('hidden'); tipTarget = null; }
  document.addEventListener('mouseover', (e) => { const t = e.target.closest && e.target.closest('.term'); if (t) showTip(t); else if (tipTarget) hideTip(); });
  document.addEventListener('focusin', (e) => { const t = e.target.closest && e.target.closest('.term'); if (t) showTip(t); });
  document.addEventListener('focusout', hideTip);
  document.addEventListener('scroll', hideTip, { passive: true });
  /* concept simple/professional toggle */
  document.addEventListener('click', (e) => {
    const b = e.target.closest('.concept .seg button');
    if (!b) return;
    const card = b.closest('.concept');
    CTA.$$('.seg button', card).forEach((x) => x.classList.toggle('on', x === b));
    CTA.$$('.lvl', card).forEach((x) => x.classList.toggle('hidden', !x.classList.contains(b.dataset.lvl)));
  });
  /* collapsible sections */
  document.addEventListener('click', (e) => {
    const h = e.target.closest('.coll-h');
    if (h) h.parentElement.classList.toggle('open');
  });

  /* ============================================================ search */
  CTA.searchIndex = function () {
    const out = [];
    Object.values(CTA.routes).filter((r) => r.title && !r.hidden).forEach((r) => out.push({ k: 'Section', t: r.title, s: r.desc || '', go: r.id }));
    (CTA.LESSONS || []).forEach((l) => out.push({ k: 'Lesson', t: l.title, s: l.summary, go: 'path/lesson/' + l.id }));
    (CTA.GLOSSARY || []).forEach((g) => out.push({ k: 'Term', t: g.term, s: g.def, go: 'glossary?q=' + encodeURIComponent(g.term) }));
    (CTA.DOCS || []).forEach((d) => out.push({ k: 'Document', t: d.name, s: d.purpose, go: 'finance/library/' + d.id }));
    (CTA.CASES || []).forEach((c) => out.push({ k: 'Case', t: c.title, s: c.brief, go: c.commodity + '/cases/' + c.id }));
    return out;
  };
  CTA.initSearch = function () {
    const inp = CTA.$('#gsearch'), box = CTA.$('#gresults');
    let idx = null;
    const run = () => {
      const q = inp.value.trim().toLowerCase();
      if (q.length < 2) { box.classList.add('hidden'); return; }
      idx = idx || CTA.searchIndex();
      const words = q.split(/\s+/);
      const hits = idx.map((it) => {
        const t = it.t.toLowerCase(), s = (it.s || '').toLowerCase();
        if (!words.every((w) => t.includes(w) || s.includes(w))) return null;
        return { it, score: (t.startsWith(q) ? 5 : 0) + (t.includes(q) ? 3 : 0) + (it.k === 'Section' ? 2 : 0) + (it.k === 'Lesson' ? 1 : 0) };
      }).filter(Boolean).sort((a, b) => b.score - a.score).slice(0, 14);
      box.innerHTML = hits.length ? hits.map(({ it }) => `<a href="#/${it.go}" class="gr"><span class="k">${it.k}</span><b>${esc(it.t)}</b><small>${esc((it.s || '').slice(0, 110))}</small></a>`).join('') : '<div class="gr muted">No results. Try another word, or browse the Glossary.</div>';
      box.classList.remove('hidden');
    };
    inp.addEventListener('input', run);
    inp.addEventListener('focus', run);
    inp.addEventListener('keydown', (e) => { if (e.key === 'Enter') { const a = CTA.$('a.gr', box); if (a) { location.hash = a.getAttribute('href'); box.classList.add('hidden'); inp.blur(); } } if (e.key === 'Escape') { box.classList.add('hidden'); inp.blur(); } });
    document.addEventListener('click', (e) => { if (!e.target.closest('.search')) box.classList.add('hidden'); else if (e.target.closest('a.gr')) { box.classList.add('hidden'); inp.value = ''; } });
  };

  /* ============================================================ study time */
  let lastInput = Date.now();
  ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'].forEach((ev) => document.addEventListener(ev, () => { lastInput = Date.now(); }, { passive: true }));
  setInterval(() => {
    if (document.visibilityState !== 'visible' || Date.now() - lastInput > 180000) return;
    const t = CTA.state.time; t.total += 15; const d = CTA.today(); t.days[d] = (t.days[d] || 0) + 15;
    CTA.save(); CTA.updateTopStats();
  }, 15000);

  /* ============================================================ records */
  CTA.record = {
    answer(qid, correct) {
      const a = CTA.state.answers[qid] || { c: 0, n: 0 };
      a.n++; if (correct) a.c++; a.last = !!correct; a.ts = Date.now();
      CTA.state.answers[qid] = a; CTA.save();
    },
    exercise(eid, correct) {
      const a = CTA.state.exercises[eid] || { c: 0, n: 0 };
      a.n++; if (correct) a.c++; a.last = !!correct; a.ts = Date.now();
      CTA.state.exercises[eid] = a; CTA.save();
      if (correct) CTA.log('Solved exercise: ' + ((CTA.EX_INDEX && CTA.EX_INDEX[eid] && CTA.EX_INDEX[eid].title) || eid), 'exercise');
    },
    caseResult(cid, score) {
      const a = CTA.state.cases[cid] || { best: 0, n: 0 };
      a.n++; a.last = score; a.best = Math.max(a.best, score); a.ts = Date.now();
      CTA.state.cases[cid] = a; CTA.save();
    },
    doc(id) { if (!CTA.state.docs[id]) { CTA.state.docs[id] = Date.now(); CTA.save(); } },
  };

  /* ============================================================ UI widgets */
  CTA.ui = {};
  /* Multiple-choice quiz. opts: {compact, exam, onDone(result), shuffle, title} */
  CTA.ui.quiz = function (el, qids, opts) {
    opts = opts || {};
    const qs = qids.map((id) => CTA.Q_INDEX && CTA.Q_INDEX[id.trim()]).filter(Boolean);
    if (!qs.length) { el.innerHTML = '<p class="muted">No questions available.</p>'; return; }
    const answered = {};
    const pfx = 'qz' + Math.random().toString(36).slice(2, 8);
    el.innerHTML = `<div class="quiz ${opts.compact ? 'compact' : ''}">${opts.title ? `<h4>${opts.title}</h4>` : opts.compact ? '<div class="quiz-tag">Check your understanding</div>' : ''}
      ${qs.map((q, qi) => `<div class="q" data-q="${q.id}"><p class="q-text"><b>${qs.length > 1 ? qi + 1 + '. ' : ''}</b>${CTA.rich(q.q)}</p>
        <div class="opts">${CTA.shuffleIdx(q.o.length).map((oi) => `<label class="opt" data-oi="${oi}"><input type="radio" name="${pfx}-${q.id}" value="${oi}"> <span>${CTA.rich(q.o[oi])}</span></label>`).join('')}</div>
        ${opts.exam ? '' : `<div class="row"><button class="btn sm primary chk" type="button">Check answer</button></div>`}
        <div class="q-fb"></div></div>`).join('')}
      ${opts.exam ? `<div class="row"><button class="btn primary submit" type="button">Submit all answers</button><span class="muted qcount"></span></div>` : ''}
      <div class="quiz-summary"></div></div>`;
    const show = (qEl, q, chosen) => {
      const ok = chosen === q.a;
      CTA.$$('.opt', qEl).forEach((l) => { const i = +l.dataset.oi; l.classList.toggle('right', i === q.a); l.classList.toggle('wrong', i === chosen && !ok); CTA.$('input', l).disabled = true; });
      CTA.$('.q-fb', qEl).innerHTML = `<div class="note ${ok ? 'ok' : 'bad'}"><strong>${ok ? 'Correct.' : 'Not quite.'}</strong>${CTA.rich(q.e)}</div>`;
      const b = CTA.$('.chk', qEl); if (b) b.remove();
    };
    CTA.$$('.q', el).forEach((qEl) => {
      const q = CTA.Q_INDEX[qEl.dataset.q];
      const b = CTA.$('.chk', qEl);
      if (b) b.onclick = () => {
        const sel = CTA.$('input:checked', qEl);
        if (!sel) { CTA.toast('Choose an answer first.', 'warn'); return; }
        const chosen = +sel.value; const ok = chosen === q.a;
        answered[q.id] = ok; CTA.record.answer(q.id, ok); show(qEl, q, chosen);
        if (Object.keys(answered).length === qs.length) finish();
      };
    });
    function finish() {
      const correct = Object.values(answered).filter(Boolean).length;
      const res = { correct, total: qs.length, pct: correct / qs.length * 100, answers: answered };
      if (!opts.compact || qs.length > 1) CTA.$('.quiz-summary', el).innerHTML = `<div class="note ${res.pct >= 70 ? 'ok' : 'warn'}"><strong>Score: ${correct}/${qs.length} (${Math.round(res.pct)}%)</strong>${res.pct >= 70 ? 'Mastery threshold (70%) reached.' : 'Below the 70% mastery threshold — review the explanations and try again.'}</div>`;
      if (opts.onDone) opts.onDone(res);
    }
    const sub = CTA.$('.submit', el);
    if (sub) sub.onclick = () => {
      const missing = CTA.$$('.q', el).filter((qEl) => !CTA.$('input:checked', qEl));
      if (missing.length && !confirm(missing.length + ' question(s) unanswered. Submit anyway? Unanswered questions count as wrong.')) return;
      CTA.$$('.q', el).forEach((qEl) => {
        const q = CTA.Q_INDEX[qEl.dataset.q]; const sel = CTA.$('input:checked', qEl);
        const chosen = sel ? +sel.value : -1; const ok = chosen === q.a;
        answered[q.id] = ok; CTA.record.answer(q.id, ok); show(qEl, q, chosen);
      });
      sub.remove(); finish();
    };
  };

  /* Numeric exercise widget. ex = {id, title, topic, gen(rng) -> {prompt, answer, unit, tol, tolRel, formula, steps, mistakes, implication}} */
  CTA.ui.exercise = function (el, ex, opts) {
    opts = opts || {};
    let seed = opts.seed || 1;
    const draw = () => {
      const inst = ex.gen(C.rng(seed));
      el.innerHTML = `<div class="exercise">
        <div class="ex-h"><span class="badge t-${ex.topic}">${ex.topicLabel || ex.topic}</span><h4>${esc(ex.title)}</h4></div>
        <div class="ex-prompt">${CTA.rich(inst.prompt)}</div>
        <div class="row ex-input"><label class="sr" for="${ex.id}-in">Your answer</label><input id="${ex.id}-in" type="text" inputmode="decimal" placeholder="Your answer" style="max-width:220px"><span class="unit">${esc(inst.unit || '')}</span>
          <button class="btn primary sm" type="button" data-a="check">Check</button><button class="btn sm" type="button" data-a="show">Show solution</button>${opts.noNew ? '' : '<button class="btn sm ghost" type="button" data-a="new">New numbers</button>'}</div>
        <div class="ex-fb"></div></div>`;
      const fb = CTA.$('.ex-fb', el);
      const sol = () => `<div class="solution"><p><b>Formula.</b> ${CTA.rich(inst.formula)}</p><div><b>Working.</b><ol>${inst.steps.map((s) => `<li>${CTA.rich(s)}</li>`).join('')}</ol></div>
        <p><b>Answer:</b> <span class="mono">${fmt.num(inst.answer, inst.dp == null ? 2 : inst.dp)} ${esc(inst.unit || '')}</span> <span class="muted">(accepted within ±${inst.tolRel ? (inst.tolRel * 100) + '%' : fmt.num(inst.tol, inst.dp == null ? 2 : inst.dp)})</span></p>
        ${inst.mistakes ? `<p class="mistake"><b>Common mistakes.</b> ${CTA.rich(inst.mistakes)}</p>` : ''}
        ${inst.implication ? `<p><b>Commercial implication.</b> ${CTA.rich(inst.implication)}</p>` : ''}</div>`;
      CTA.$('[data-a=check]', el).onclick = () => {
        const raw = CTA.$('input', el).value.trim();
        if (!raw) { CTA.toast('Enter a number first.', 'warn'); return; }
        const v = CTA.num(raw.replace(/[%$€£]/g, ''), NaN);
        if (isNaN(v)) { fb.innerHTML = '<div class="note warn"><strong>That is not a number.</strong>Type digits only, e.g. 1234.5 (commas allowed).</div>'; return; }
        const ok = C.within(v, inst.answer, inst.tol, inst.tolRel);
        CTA.record.exercise(ex.id, ok);
        let hint = '';
        if (!ok && inst.diagnose) hint = inst.diagnose(v) || '';
        fb.innerHTML = `<div class="note ${ok ? 'ok' : 'bad'}"><strong>${ok ? 'Correct.' : 'Not correct — your answer: ' + fmt.num(v, inst.dp == null ? 2 : inst.dp)}</strong>${hint ? CTA.rich(hint) : ''}</div>` + sol();
        if (opts.onResult) opts.onResult(ok);
      };
      CTA.$('[data-a=show]', el).onclick = () => { fb.innerHTML = '<div class="note warn"><strong>Solution shown.</strong>Recorded as an attempt without a correct answer. Try "New numbers" to practise again.</div>' + sol(); CTA.record.exercise(ex.id, false); if (opts.onResult) opts.onResult(false); };
      const nb = CTA.$('[data-a=new]', el); if (nb) nb.onclick = () => { seed = Math.floor(Math.random() * 1e9); draw(); };
    };
    draw();
  };

  /* form helpers: field definitions -> HTML; read values */
  CTA.ui.field = (f) => {
    const id = f.id; const v = f.value == null ? '' : f.value;
    const lab = `<label for="${id}">${f.label}${f.term ? ' ' + CTA.term(f.term, 'ⓘ') : ''}</label>`;
    let input;
    if (f.type === 'select') input = `<select id="${id}" name="${f.name || id}">${f.options.map((o) => { const [val, l] = Array.isArray(o) ? o : [o, o]; return `<option value="${esc(val)}" ${String(val) === String(v) ? 'selected' : ''}>${esc(l)}</option>`; }).join('')}</select>`;
    else if (f.type === 'textarea') input = `<textarea id="${id}" name="${f.name || id}" placeholder="${esc(f.ph || '')}">${esc(v)}</textarea>`;
    else input = `<input id="${id}" name="${f.name || id}" type="${f.type || 'number'}" ${f.step ? `step="${f.step}"` : 'step="any"'} ${f.min != null ? `min="${f.min}"` : ''} value="${esc(v)}" ${f.disabled ? 'disabled' : ''} placeholder="${esc(f.ph || '')}">`;
    return `<div class="field ${f.cls || ''}">${lab}${input}${f.help ? `<div class="help">${f.help}</div>` : ''}</div>`;
  };
  CTA.ui.read = (root, names) => {
    const o = {};
    CTA.$$('input,select,textarea', root).forEach((i) => {
      const k = i.name || i.id; if (!k || (names && !names.includes(k))) return;
      if (i.type === 'checkbox') o[k] = i.checked;
      else if (i.type === 'number') o[k] = i.value === '' ? 0 : parseFloat(i.value);
      else o[k] = i.value;
    });
    return o;
  };
  CTA.ui.kpis = (items) => `<div class="kpis">${items.map((k) => `<div class="kpi ${k.cls || ''}"><div class="kl">${k.label}${k.term ? ' ' + CTA.term(k.term, 'ⓘ') : ''}</div><div class="kv">${k.value}</div>${k.sub ? `<div class="ks">${k.sub}</div>` : ''}</div>`).join('')}</div>`;
  CTA.ui.empty = (title, text, action) => `<div class="empty"><div class="empty-ic">○</div><h3>${title}</h3><p class="muted">${text}</p>${action || ''}</div>`;
  CTA.ui.pbar = (pct, cls) => `<i class="pbar ${cls || ''}"><b style="width:${Math.max(0, Math.min(100, pct))}%"></b></i>`;

  /* ============================================================ charts (SVG) */
  /* opts: {series:[{type:'line'|'area'|'bars'|'candles', data:[...], color, label, width, dash}], height, labels:[x labels],
            yFmt, hlines:[{y,color,label,dash}], markers:[{i,y,color,label,shape}], yMin, yMax, zero:true } */
  CTA.chart = function (el, opts) {
    const W = 800, H = opts.height || 260, padL = 58, padR = 14, padT = 14, padB = opts.labels ? 26 : 12;
    const series = opts.series.filter((s) => s.data && s.data.length);
    const n = Math.max(...series.map((s) => s.data.length), 2);
    let lo = Infinity, hi = -Infinity;
    series.forEach((s) => s.data.forEach((d) => {
      if (d == null) return;
      if (s.type === 'candles') { lo = Math.min(lo, d.l); hi = Math.max(hi, d.h); } else { lo = Math.min(lo, d); hi = Math.max(hi, d); }
    }));
    (opts.hlines || []).forEach((h) => { lo = Math.min(lo, h.y); hi = Math.max(hi, h.y); });
    if (opts.zero) { lo = Math.min(lo, 0); hi = Math.max(hi, 0); }
    if (opts.yMin != null) lo = opts.yMin; if (opts.yMax != null) hi = opts.yMax;
    if (!isFinite(lo)) { lo = 0; hi = 1; }
    if (hi === lo) { hi += 1; lo -= 1; }
    const span = hi - lo; if (opts.yMin == null) lo -= span * 0.05; if (opts.yMax == null) hi += span * 0.05;
    const x = (i) => padL + (n === 1 ? 0 : (i / (n - 1)) * (W - padL - padR));
    const y = (v) => padT + (1 - (v - lo) / (hi - lo)) * (H - padT - padB);
    const yf = opts.yFmt || ((v) => fmt.num(v, Math.abs(hi - lo) < 5 ? 2 : Math.abs(hi - lo) < 200 ? 1 : 0));
    let g = '';
    for (let k = 0; k <= 4; k++) { const v = lo + (hi - lo) * k / 4; g += `<line x1="${padL}" x2="${W - padR}" y1="${y(v)}" y2="${y(v)}" class="grid"/><text x="${padL - 6}" y="${y(v) + 4}" class="ax" text-anchor="end">${yf(v)}</text>`; }
    if (opts.labels) { const step = Math.ceil(n / 8); opts.labels.forEach((l, i) => { if (i % step === 0) g += `<text x="${x(i)}" y="${H - 6}" class="ax" text-anchor="middle">${esc(l)}</text>`; }); }
    if (opts.zero && lo < 0 && hi > 0) g += `<line x1="${padL}" x2="${W - padR}" y1="${y(0)}" y2="${y(0)}" class="zero"/>`;
    const bw = Math.max(1, (W - padL - padR) / n * 0.62);
    series.forEach((s) => {
      const col = s.color || 'var(--c1)';
      if (s.type === 'candles') {
        s.data.forEach((d, i) => { if (!d) return; const up = d.c >= d.o; const c = up ? 'var(--pos)' : 'var(--neg)';
          g += `<line x1="${x(i)}" x2="${x(i)}" y1="${y(d.h)}" y2="${y(d.l)}" stroke="${c}" stroke-width="1"/><rect x="${x(i) - bw / 2}" y="${y(Math.max(d.o, d.c))}" width="${bw}" height="${Math.max(1, Math.abs(y(d.o) - y(d.c)))}" fill="${c}"/>`; });
      } else if (s.type === 'bars') {
        s.data.forEach((v, i) => { if (v == null) return; const c = s.colorFn ? s.colorFn(v, i) : col; g += `<rect x="${x(i) - bw / 2}" y="${Math.min(y(v), y(Math.max(lo, 0)))}" width="${bw}" height="${Math.abs(y(v) - y(Math.max(lo, 0)))}" fill="${c}" opacity="${s.opacity || 0.85}"/>`; });
      } else {
        let d = ''; let started = false;
        s.data.forEach((v, i) => { if (v == null || !isFinite(v)) { started = false; return; } d += (started ? 'L' : 'M') + x(i).toFixed(1) + ' ' + y(v).toFixed(1) + ' '; started = true; });
        if (s.type === 'area') { const first = s.data.findIndex((v) => v != null); const last = s.data.length - 1; g += `<path d="${d} L${x(last)} ${y(Math.max(lo, 0))} L${x(first)} ${y(Math.max(lo, 0))} Z" fill="${col}" opacity=".15"/>`; }
        g += `<path d="${d}" fill="none" stroke="${col}" stroke-width="${s.width || 1.8}" ${s.dash ? `stroke-dasharray="${s.dash}"` : ''} stroke-linejoin="round"/>`;
      }
    });
    (opts.hlines || []).forEach((h) => { g += `<line x1="${padL}" x2="${W - padR}" y1="${y(h.y)}" y2="${y(h.y)}" stroke="${h.color || 'var(--ink-3)'}" stroke-dasharray="${h.dash || '4 4'}"/>${h.label ? `<text x="${W - padR - 4}" y="${y(h.y) - 4}" class="ax hl" text-anchor="end" fill="${h.color || 'var(--ink-3)'}">${esc(h.label)}</text>` : ''}`; });
    (opts.markers || []).forEach((m) => { g += `<g><circle cx="${x(m.i)}" cy="${y(m.y)}" r="5" fill="${m.color || 'var(--c2)'}" stroke="#fff" stroke-width="1.5"/>${m.label ? `<text x="${x(m.i)}" y="${y(m.y) - 9}" class="ax mk" text-anchor="middle">${esc(m.label)}</text>` : ''}</g>`; });
    const legend = series.filter((s) => s.label).map((s) => `<span><i style="background:${s.type === 'candles' ? 'var(--pos)' : s.color || 'var(--c1)'}"></i>${esc(s.label)}</span>`).join('');
    el.innerHTML = `<div class="chart">${legend ? `<div class="legend">${legend}</div>` : ''}<div class="chart-wrap"><svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" role="img" aria-label="${esc(opts.aria || 'Chart')}">${g}<line class="xh hidden" y1="${padT}" y2="${H - padB}"/></svg><div class="chart-tip hidden"></div></div></div>`;
    const svg = CTA.$('svg', el), tip = CTA.$('.chart-tip', el), xh = CTA.$('.xh', el);
    svg.addEventListener('mousemove', (ev) => {
      const r = svg.getBoundingClientRect(); const px = (ev.clientX - r.left) / r.width * W;
      const i = Math.max(0, Math.min(n - 1, Math.round((px - padL) / (W - padL - padR) * (n - 1))));
      xh.setAttribute('x1', x(i)); xh.setAttribute('x2', x(i)); xh.classList.remove('hidden');
      const rows = series.map((s) => { const d = s.data[i]; if (d == null) return ''; return s.type === 'candles' ? `O ${yf(d.o)} H ${yf(d.h)} L ${yf(d.l)} C ${yf(d.c)}` : `${esc(s.label || '')} ${yf(d)}`; }).filter(Boolean);
      tip.innerHTML = `<b>${opts.labels ? esc(opts.labels[i]) : '#' + i}</b><br>${rows.join('<br>')}`;
      tip.classList.remove('hidden');
      const left = (x(i) / W) * r.width; tip.style.left = Math.min(r.width - 170, Math.max(0, left + 10)) + 'px';
    });
    svg.addEventListener('mouseleave', () => { tip.classList.add('hidden'); xh.classList.add('hidden'); });
  };
  CTA.sparkline = (data, color) => {
    if (!data || data.length < 2) return '';
    const lo = Math.min(...data), hi = Math.max(...data), W = 100, H = 28;
    const d = data.map((v, i) => `${i ? 'L' : 'M'}${(i / (data.length - 1) * W).toFixed(1)} ${(H - 2 - (v - lo) / ((hi - lo) || 1) * (H - 4)).toFixed(1)}`).join(' ');
    return `<svg class="spark" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" aria-hidden="true"><path d="${d}" fill="none" stroke="${color || 'currentColor'}" stroke-width="1.6"/></svg>`;
  };

  /* download helper */
  CTA.download = (name, text, type) => {
    const blob = new Blob([text], { type: type || 'application/json' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name;
    document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500);
  };

  /* journal helper used by simulators */
  CTA.journalAdd = function (entry) {
    if (!CTA.state.settings.autoJournal && entry.auto) return;
    CTA.state.journal.unshift(Object.assign({ id: CTA.uid('j'), ts: Date.now(), date: CTA.today(), tags: [] }, entry));
    CTA.save();
  };

  /* boot */
  CTA.start = function () {
    CTA.Q_INDEX = {}; (CTA.QUESTIONS || []).forEach((q) => { CTA.Q_INDEX[q.id] = q; });
    CTA.EX_INDEX = {}; (CTA.EXERCISES || []).forEach((e) => { CTA.EX_INDEX[e.id] = e; });
    CTA.L_INDEX = {}; (CTA.LESSONS || []).forEach((l) => { CTA.L_INDEX[l.id] = l; });
    CTA.glossaryIndex = {}; (CTA.GLOSSARY || []).forEach((g) => { CTA.glossaryIndex[g.term.toLowerCase()] = g; (g.alias || []).forEach((a) => { CTA.glossaryIndex[a.toLowerCase()] = g; }); });
    CTA.buildShell();
    CTA.render();
  };
})();
