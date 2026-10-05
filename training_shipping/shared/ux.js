/* Training Shipping — UX layer shared by every page:
 * theme toggle, mobile menu, command palette (Ctrl+K), next-action coach, autopilot, celebration, first-visit tour. */
(function () {
  const L = TS.L, t = TS.t, esc = TS.esc;
  const get = (k) => { try { return localStorage.getItem(k); } catch (e) { return null; } };
  const set = (k, v) => { try { localStorage.setItem(k, v); } catch (e) { /* ignore */ } };
  const reduced = () => window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------------- theme ---------------- */
  const applyTheme = () => { const th = get('ts_theme'); if (th) document.documentElement.dataset.theme = th; else delete document.documentElement.dataset.theme; };
  applyTheme();
  const isDark = () => document.documentElement.dataset.theme === 'dark' || (!document.documentElement.dataset.theme && matchMedia('(prefers-color-scheme: dark)').matches);
  TS.toggleTheme = () => { set('ts_theme', isDark() ? 'light' : 'dark'); applyTheme(); };

  /* top-bar buttons are appended to the language switch (used by every page) */
  const baseSwitch = TS.langSwitch;
  TS.langSwitch = () => `<button class="tb-ico menu-btn" data-menu aria-label="Menu">☰</button><button class="tb-ico" data-cmdk title="${esc(t(L('Search & jump (Ctrl+K)', 'بحث وانتقال (Ctrl+K)')))}" aria-label="Search">⌕</button><button class="tb-ico" data-theme-toggle title="${esc(t(L('Light / dark', 'فاتح / داكن')))}" aria-label="Theme">◐</button>` + baseSwitch();

  /* ---------------- command palette ---------------- */
  TS.cmd = { providers: [] };
  TS.cmd.providers.push(() => Object.entries(TS.TERMS || {}).map(([k, v]) => ({ label: (TS.lang === 'ar' ? v.ar : v.en), hint: t(L('Term', 'مصطلح')) + ' · ' + (TS.lang === 'ar' ? v.en : v.ar), run: () => TS.showTerm(k) })));
  let cmdEl = null, sel = 0, items = [];
  function openCmd() {
    if (!cmdEl) {
      cmdEl = document.createElement('div'); cmdEl.className = 'cmdk';
      cmdEl.innerHTML = `<div class="box" role="dialog" aria-label="Command palette"><input type="text" aria-label="search"><ul></ul></div>`;
      document.body.appendChild(cmdEl);
      cmdEl.addEventListener('click', (e) => { if (e.target === cmdEl) closeCmd(); const li = e.target.closest('li[data-i]'); if (li) runItem(Number(li.dataset.i)); });
      const inp = cmdEl.querySelector('input');
      inp.addEventListener('input', () => { sel = 0; draw(); });
      inp.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowDown') { sel = Math.min(sel + 1, items.length - 1); draw(); e.preventDefault(); }
        else if (e.key === 'ArrowUp') { sel = Math.max(sel - 1, 0); draw(); e.preventDefault(); }
        else if (e.key === 'Enter') { runItem(sel); e.preventDefault(); }
        else if (e.key === 'Escape') closeCmd();
      });
    }
    cmdEl.querySelector('input').placeholder = t(L('Jump to a step, page, document or term…', 'انتقل إلى مرحلة أو صفحة أو مستند أو مصطلح…'));
    cmdEl.querySelector('input').value = ''; sel = 0; cmdEl.classList.add('on'); draw();
    cmdEl.querySelector('input').focus();
  }
  function closeCmd() { if (cmdEl) cmdEl.classList.remove('on'); }
  function draw() {
    const q = TS.norm(cmdEl.querySelector('input').value);
    const all = TS.cmd.providers.flatMap((p) => { try { return p() || []; } catch (e) { return []; } });
    items = all.filter((x) => !q || TS.norm(x.label + ' ' + (x.hint || '')).includes(q)).slice(0, 40);
    cmdEl.querySelector('ul').innerHTML = items.map((x, i) => `<li data-i="${i}" class="${i === sel ? 'on' : ''}"><span>${esc(x.label)}</span><small>${esc(x.hint || '')}</small></li>`).join('') || `<li>${esc(t(L('No match', 'لا نتيجة')))}</li>`;
    const on = cmdEl.querySelector('li.on'); if (on) on.scrollIntoView({ block: 'nearest' });
  }
  function runItem(i) { const x = items[i]; if (!x) return; closeCmd(); x.run(); }

  /* ---------------- global clicks & keys ---------------- */
  document.addEventListener('click', (e) => {
    if (e.target.closest('[data-theme-toggle]')) { TS.toggleTheme(); return; }
    if (e.target.closest('[data-cmdk]')) { openCmd(); return; }
    if (e.target.closest('[data-menu]')) { const l = document.querySelector('.layout'); if (l) l.classList.toggle('menu-open'); }
  });
  document.addEventListener('keydown', (e) => {
    const typing = e.target.matches && e.target.matches('input,textarea,select');
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); openCmd(); }
    else if (!typing && e.key === '/') { e.preventDefault(); openCmd(); }
    else if (e.key === 'Escape' && TS.autopilot.running) TS.autopilot.stop();
  });

  /* ---------------- celebration ---------------- */
  TS.celebrate = () => {
    if (reduced()) return;
    const c = document.createElement('canvas'); c.id = 'confetti'; c.width = innerWidth; c.height = innerHeight; document.body.appendChild(c);
    const x = c.getContext('2d'), cols = ['#2a78d6', '#eb6834', '#1baf7a', '#eda100', '#e87ba4'];
    const ps = Array.from({ length: 90 }, () => ({ x: innerWidth / 2, y: innerHeight / 3, vx: (Math.random() - 0.5) * 12, vy: Math.random() * -11 - 3, s: Math.random() * 6 + 4, c: cols[Math.floor(Math.random() * cols.length)], r: Math.random() * 6 }));
    let f = 0;
    (function loop() {
      x.clearRect(0, 0, c.width, c.height);
      ps.forEach((p) => { p.vy += 0.35; p.x += p.vx; p.y += p.vy; p.r += 0.1; x.save(); x.translate(p.x, p.y); x.rotate(p.r); x.fillStyle = p.c; x.fillRect(-p.s / 2, -p.s / 4, p.s, p.s / 2); x.restore(); });
      if (++f < 80) requestAnimationFrame(loop); else c.remove();
    })();
  };

  /* ---------------- next-action coach ---------------- */
  /* model: { title, text, alerts:[{lvl:'bad'|'warn'|'ok', text}], action:{label, run} } */
  let coachEl = null, coachMin = get('ts_coach_min') != null ? get('ts_coach_min') === '1' : innerWidth < 860;
  TS.coach = (m) => {
    if (!m) { if (coachEl) coachEl.remove(); coachEl = null; return; }
    if (!coachEl || !document.body.contains(coachEl)) { coachEl = document.createElement('aside'); coachEl.className = 'coach no-print'; document.body.appendChild(coachEl); }
    coachEl.classList.toggle('min', coachMin);
    coachEl.innerHTML = `<div class="ch"><b>🧭 ${esc(t(L('Next action', 'الخطوة التالية')))}</b><span><button class="btn sm ghost" data-ap-step title="${esc(t(L('Watch the autopilot do this step', 'شاهد الطيار الآلي ينفّذ هذه المرحلة')))}">▶</button><button class="btn sm ghost" data-coach-min aria-label="minimise">${coachMin ? '▴' : '▾'}</button></span></div>
      <div class="cb"><div>${esc(m.title || '')}</div>${m.text ? `<small class="muted">${esc(m.text)}</small>` : ''}
      ${m.alerts && m.alerts.length ? `<ul class="al">${m.alerts.map((a) => `<li>${a.lvl === 'bad' ? '⛔' : a.lvl === 'warn' ? '⚠️' : '✅'} ${esc(a.text)}</li>`).join('')}</ul>` : ''}
      ${m.action ? `<div class="row" style="margin-top:6px"><button class="btn sm primary" data-coach-go>${esc(m.action.label)} →</button></div>` : ''}</div>`;
    coachEl.querySelector('[data-coach-min]').onclick = () => { coachMin = !coachMin; set('ts_coach_min', coachMin ? '1' : '0'); TS.coach(m); };
    const go = coachEl.querySelector('[data-coach-go]'); if (go) go.onclick = () => m.action.run();
    const ap = coachEl.querySelector('[data-ap-step]'); if (ap) ap.onclick = () => TS.autopilot.adapter && TS.autopilot.start(TS.autopilot.adapter, 'step');
  };

  /* ---------------- autopilot ---------------- */
  /* adapter: { current() -> {stepId, partId|null, quiz:bool} | null, open(stepId, tab), fillQuiz(stepId), special(body, stepId, partId) -> bool } */
  const AP = (TS.autopilot = { running: false, adapter: null });
  let bar = null, timer = null, clicked = {}, lastSig = '', same = 0, startStep = null, mode = 'step';
  const hl = (el) => new Promise((r) => { el.classList.add('ap-hl'); el.scrollIntoView({ block: 'center', behavior: reduced() ? 'auto' : 'smooth' }); setTimeout(() => { el.classList.remove('ap-hl'); r(); }, reduced() ? 60 : 420); });
  AP.start = (adapter, m) => {
    if (AP.running) return;
    AP.running = true; mode = m || 'step'; clicked = {}; same = 0; lastSig = '';
    const cur = adapter.current(); startStep = cur && cur.stepId;
    bar = document.createElement('div'); bar.className = 'apbar no-print';
    bar.innerHTML = `<span class="dotp"></span><span>${esc(t(mode === 'all' ? L('Autopilot: playing the whole file…', 'الطيار الآلي: ينفّذ الملف كاملًا…') : L('Autopilot: playing this step…', 'الطيار الآلي: ينفّذ هذه المرحلة…')))}</span><button class="btn sm" style="background:#fff;color:#152033">■ ${esc(t(L('Stop', 'إيقاف')))} (Esc)</button>`;
    document.body.appendChild(bar);
    bar.querySelector('button').onclick = AP.stop;
    TS.toast(t(L('Autopilot uses “show answer” — it counts as hints in your score.', 'الطيار الآلي يستعمل «أرني الجواب» — ويُحتسب كتلميحات في نتيجتك.')));
    tick(adapter);
  };
  AP.stop = () => { AP.running = false; clearTimeout(timer); if (bar) bar.remove(); bar = null; };
  async function tick(ad) {
    if (!AP.running) return;
    const cur = ad.current();
    if (!cur || (mode === 'step' && cur.stepId !== startStep)) { AP.stop(); TS.toast(t(L('Autopilot finished', 'انتهى الطيار الآلي')), 'ok'); return; }
    ad.open(cur.stepId, cur.partId ? 'task' : 'quiz');
    await new Promise((r) => setTimeout(r, 120));
    let wait = 450;
    if (!cur.partId) {
      ad.fillQuiz(cur.stepId);
      const b = document.querySelector('#qcheck, #qc'); if (b) { await hl(b); b.click(); }
    } else {
      const body = document.querySelector('.part:not(.done):not(.locked) .body');
      const key = cur.stepId + '/' + cur.partId;
      if (!body || body.textContent.includes('⏳')) wait = 700;
      else if (ad.special && ad.special(body, cur.stepId, cur.partId)) wait = 300;
      else {
        const ans = body.querySelector('[data-act=answer], #ans');
        const go = body.querySelector('[data-act=check], #sel, #ok, #chk, #snd, #go');
        if (ans && !clicked[key]) { clicked[key] = 1; await hl(ans); ans.click(); }
        else if (go) { await hl(go); go.click(); wait = 700; }
      }
    }
    const sig = JSON.stringify(ad.current());
    same = sig === lastSig ? same + 1 : 0; lastSig = sig;
    if (same > 25) { AP.stop(); TS.toast(t(L('Autopilot stopped — please continue by hand.', 'توقّف الطيار الآلي — يرجى المتابعة يدويًا.')), 'bad'); return; }
    timer = setTimeout(() => tick(ad), wait);
  }

  /* ---------------- first-visit tour ---------------- */
  TS.tour = (key, slides, force) => {
    if (!force && get('ts_tour_' + key)) return;
    let i = 0;
    const el = document.createElement('div'); el.className = 'tour'; document.body.appendChild(el);
    const draw2 = () => {
      const s = slides[i];
      el.innerHTML = `<div class="box" role="dialog" aria-modal="true"><div class="ico">${s.ico}</div><h2>${esc(t(s.h))}</h2><p>${esc(t(s.p))}</p><div class="row" style="justify-content:space-between;margin-top:14px"><div class="dots">${slides.map((_, j) => `<i class="${j === i ? 'on' : ''}"></i>`).join('')}</div><div class="row"><button class="btn ghost" data-x>${esc(t(L('Skip', 'تخطّي')))}</button><button class="btn primary" data-n>${esc(t(i === slides.length - 1 ? L('Start', 'ابدأ') : L('Next', 'التالي')))} →</button></div></div></div>`;
      el.querySelector('[data-x]').onclick = close; el.querySelector('[data-n]').onclick = () => { if (i < slides.length - 1) { i++; draw2(); } else close(); };
    };
    const close = () => { set('ts_tour_' + key, '1'); el.remove(); };
    draw2();
  };
  TS.TOUR_BASIC = [
    { ico: '⚓', h: L('Welcome to Training Shipping', 'أهلًا بك في Training Shipping'), p: L('Every step has 📘 a lesson, 🛠 a task and ❓ a quiz. Your work is saved in one shipment file shared by all departments.', 'لكل مرحلة 📘 درس و🛠 مهمة و❓ اختبار. يُحفظ عملك في ملف شحنة واحد مشترك بين كل الأقسام.') },
    { ico: '💬', h: L('Click any underlined term', 'انقر على أي مصطلح مسطّر'), p: L('Terms in documents, lessons and emails open a card that explains them in English and Arabic.', 'المصطلحات في المستندات والدروس والبريد تفتح بطاقة تشرحها بالإنجليزية والعربية.') },
    { ico: '🧭', h: L('The coach & the autopilot', 'المرشد والطيار الآلي'), p: L('The coach (bottom corner) tells you what to do next and warns about deadlines. Press ▶ to watch the autopilot do a step for you.', 'المرشد (في الزاوية السفلية) يخبرك بالخطوة التالية وينبّهك للمواعيد. اضغط ▶ لتشاهد الطيار الآلي ينفّذ المرحلة.') },
    { ico: '⌕', h: L('Jump anywhere — Ctrl+K', 'انتقل لأي مكان — Ctrl+K'), p: L('Search steps, documents and terms from the ⌕ button or Ctrl+K. ◐ switches light/dark.', 'ابحث عن المراحل والمستندات والمصطلحات من زر ⌕ أو Ctrl+K. و◐ للتبديل بين الفاتح والداكن.') },
  ];
})();
