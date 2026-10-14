/* Port Master Academy — simulators for specialisation tracks */
(function () {
  const L = TS.L, t = TS.t, esc = TS.esc;
  const R = PT.rnd, P = PT.pick;
  const n = (x, d) => TS.num(x, d == null ? 1 : d);
  const add = (x) => PT.sims.push(x);
  const $ = (s, el) => el.querySelector(s);
  const $$ = (s, el) => Array.from(el.querySelectorAll(s));

  /* ================================================================= SILO BIN ALLOCATION */
  const COMM = [
    { k: 'WHT', l: L('Wheat', 'قمح'), max: 14, c: '#c58a00' },
    { k: 'CRN', l: L('Corn', 'ذرة'), max: 14, c: '#e0b000' },
    { k: 'BAR', l: L('Barley', 'شعير'), max: 13.5, c: '#9a7400' },
    { k: 'SOY', l: L('Soybeans', 'فول الصويا'), max: 12.5, c: '#2f7d5b' },
  ];
  add({
    id: 'silo', lvl: 7, icon: '🌾', title: L('Silo bin allocation', 'توزيع خلايا الصوامع'),
    desc: L('Eight grain lots arrive from ships and trucks. Allocate each to a bin (or the dryer first) without mixing owners/commodities, overfilling bins or storing wet grain.', 'تصل ثماني دفعات حبوب من السفن والشاحنات. خصّص لكل دفعة خلية (أو المجفّف أولًا) دون خلط المالكين/السلع، أو تجاوز سعة الخلايا، أو تخزين حبوب رطبة.'),
    mount(el, api) {
      let bins, lots, i, pts, log, finished;
      const reset = () => {
        bins = Array.from({ length: 8 }, (_, k) => ({ id: 'S' + String(k + 1).padStart(2, '0'), cap: P([2000, 2500, 2500, 3000]), lot: null, t: 0 }));
        bins[0].lot = { c: 'WHT', own: 'Mill A' }; bins[0].t = 1800;
        bins[3].lot = { c: 'CRN', own: 'Feed Co' }; bins[3].t = 2200;
        lots = Array.from({ length: 8 }, () => { const c = P(COMM); return { c: c.k, own: P(['Mill A', 'Mill B', 'Feed Co']), t: R(4, 25) * 100, m: PT.r1(R(115, 165) / 10) }; });
        lots[0] = { c: 'WHT', own: 'Mill A', t: 600, m: 13.2 };
        i = 0; pts = 0; log = []; finished = false; draw();
      };
      const cm = (k) => COMM.find((c) => c.k === k);
      function evaluate(lot, choice) {
        const C = cm(lot.c), wet = lot.m > C.max;
        if (choice === 'dryer') return wet ? { p: 10, f: L(`Correct: ${lot.m}% > ${C.max}% safe limit → dry first.`, `صحيح: ${lot.m}% > الحدّ الآمن ${C.max}% ← جفّف أولًا.`) } : { p: 3, f: L(`Not needed: ${lot.m}% is within the ${C.max}% limit — drying wastes energy and weight.`, `غير ضروري: ${lot.m}% ضمن حدّ ${C.max}% — التجفيف يهدر الطاقة والوزن.`) };
        if (choice === 'reject') return { p: 0, f: L('The terminal should store or dry it, not reject sound cargo.', 'يجب على المحطة تخزينها أو تجفيفها لا رفض بضاعة سليمة.') };
        const b = bins.find((x) => x.id === choice);
        if (wet) return { p: 0, f: L(`Wet grain (${lot.m}% > ${C.max}%) stored without drying → hot spots and mould.`, `حبوب رطبة (${lot.m}% > ${C.max}%) خُزّنت دون تجفيف ← بؤر ساخنة وعفن.`) };
        if (b.lot && (b.lot.c !== lot.c || b.lot.own !== lot.own)) return { p: 0, f: L('Mixing commodities or owners in one bin is not allowed.', 'خلط السلع أو المالكين في خلية واحدة غير مسموح.') };
        if (b.t + lot.t > b.cap) return { p: 0, f: L(`Overfill: ${b.t} + ${lot.t} > ${b.cap} t.`, `تجاوز السعة: ${b.t} + ${lot.t} > ${b.cap} طن.`) };
        const empties = bins.filter((x) => !x.lot).length;
        if (!b.lot && empties <= 1) return { p: 5, f: L('Allowed, but you used your last empty bin — keep one free for turning/emergencies.', 'مسموح، لكنك استخدمت آخر خلية فارغة — أبقِ واحدة حرّة للتقليب/الطوارئ.') };
        return { p: 10, f: L(b.lot ? 'Good: same commodity & owner, capacity respected.' : 'Good: clean empty bin for a new lot.', b.lot ? 'جيد: نفس السلعة والمالك مع احترام السعة.' : 'جيد: خلية فارغة نظيفة لدفعة جديدة.') };
      }
      function apply(lot, choice) {
        if (choice === 'dryer') { lot.m = cm(lot.c).max - 0.5; lot.t = Math.round(lot.t * (100 - lots[i].m0) / (100 - lot.m)); return false; }
        const b = bins.find((x) => x.id === choice);
        if (b && !(b.lot && (b.lot.c !== lot.c || b.lot.own !== lot.own)) && b.t + lot.t <= b.cap) { b.lot = b.lot || { c: lot.c, own: lot.own }; b.t += lot.t; }
        return true;
      }
      function draw() {
        const lot = lots[i];
        const binHTML = `<div class="grid c4">${bins.map((b) => { const C = b.lot ? cm(b.lot.c) : null, pct = b.t / b.cap; return `<div class="tile" style="padding:12px"><div class="row" style="justify-content:space-between"><b>${b.id}</b><small class="muted">${n(b.cap, 0)} t</small></div>
          <div style="height:70px;border:2px solid var(--line);border-radius:8px 8px 14px 14px;margin:8px 0;position:relative;overflow:hidden;background:var(--panel-2)"><div style="position:absolute;bottom:0;left:0;right:0;height:${pct * 100}%;background:${C ? C.c : 'transparent'};opacity:.85"></div></div>
          <small>${C ? `${t(C.l)} · ${esc(b.lot.own)}<br>${n(b.t, 0)} t (${Math.round(pct * 100)}%)` : t(L('Empty', 'فارغة'))}</small></div>`; }).join('')}</div>`;
        if (!lot || finished) {
          const score = Math.round(pts / (lots.length * 10) * 100);
          el.innerHTML = binHTML + `<div class="card fade-in" style="margin-top:14px"><div class="score-big">${score}</div><ul class="timeline">${log.map((x) => `<li class="${x.p === 10 ? 'done' : x.p ? '' : 'late'}">${esc(x.d)} → <b>${esc(x.ch)}</b><br><small>${t(x.f)}</small></li>`).join('')}</ul><button class="btn red" id="sNew">${t(L('New intake day', 'يوم استلام جديد'))}</button></div>`;
          $('#sNew', el).onclick = reset; if (!finished) { finished = true; api.done(score); } return;
        }
        if (lot.m0 == null) lot.m0 = lot.m;
        const C = cm(lot.c);
        el.innerHTML = `<div class="note">${t(L('Rules: one commodity + one owner per bin · never exceed bin capacity · moisture above the safe limit → dryer first (weight shrinks) · keep at least one empty bin. Safe limits: wheat 14%, corn 14%, barley 13.5%, soybeans 12.5%.', 'القواعد: سلعة واحدة + مالك واحد لكل خلية · لا تتجاوز سعة الخلية أبدًا · الرطوبة فوق الحدّ الآمن ← المجفّف أولًا (ينقص الوزن) · أبقِ خلية فارغة واحدة على الأقل. الحدود الآمنة: القمح 14%، الذرة 14%، الشعير 13.5%، فول الصويا 12.5%.'))}</div>
          ${binHTML}
          <div class="card" style="margin-top:14px"><div class="row" style="justify-content:space-between"><h3 style="margin:0">🚚 ${t(L('Lot', 'الدفعة'))} ${i + 1}/${lots.length}</h3><span class="badge info">${t(L('Points', 'النقاط'))} ${pts}</span></div>
            <div class="truck-card" style="margin:10px 0"><div><div class="l">${t(L('Commodity', 'السلعة'))}</div><div class="v" style="font-family:var(--font)">${t(C.l)}</div></div><div><div class="l">${t(L('Owner', 'المالك'))}</div><div class="v">${esc(lot.own)}</div></div><div><div class="l">${t(L('Quantity', 'الكمية'))}</div><div class="v">${n(lot.t, 0)} t</div></div><div><div class="l">${t(L('Moisture', 'الرطوبة'))}</div><div class="v" style="color:${lot.m > C.max ? 'var(--bad)' : 'inherit'}">${lot.m}%</div></div></div>
            <div class="row"><select id="sCh" style="max-width:320px"><option value="">— ${t(L('choose', 'اختر'))} —</option><option value="dryer">🔥 ${t(L('Send to dryer first', 'أرسل للمجفّف أولًا'))}</option>${bins.map((b) => `<option value="${b.id}">${b.id} — ${b.lot ? t(cm(b.lot.c).l) + ' / ' + esc(b.lot.own) : t(L('empty', 'فارغة'))} (${n(b.cap - b.t, 0)} t ${t(L('free', 'حرّة'))})</option>`).join('')}<option value="reject">⛔ ${t(L('Reject the lot', 'ارفض الدفعة'))}</option></select><button class="btn red" id="sGo">${t(L('Confirm', 'تأكيد'))}</button></div><div id="sFb"></div></div>`;
        $('#sGo', el).onclick = () => {
          const ch = $('#sCh', el).value; if (!ch) return;
          const r = evaluate(lot, ch); pts += r.p;
          log.push({ d: `${t(C.l)} ${lot.t} t ${lot.m}%`, ch: ch === 'dryer' ? t(L('dryer', 'المجفّف')) : ch, p: r.p, f: r.f });
          const advance = apply(lot, ch);
          $('#sFb', el).innerHTML = `<div class="note ${r.p === 10 ? 'ok' : r.p ? 'warn' : 'bad'} fade-in"><strong>${r.p}/10</strong>${t(r.f)}${!advance ? `<br>${t(L(`After drying: ${n(lot.t, 0)} t at ${lot.m}% — now store it.`, `بعد التجفيف: ${n(lot.t, 0)} طن برطوبة ${lot.m}% — خزّنها الآن.`))}` : ''}<div style="margin-top:8px"><button class="btn sm primary" id="sNext">${t(L('Continue', 'متابعة'))} →</button></div></div>`;
          $('#sGo', el).disabled = true;
          $('#sNext', el).onclick = () => { if (advance) i++; else { lots.splice(i + 1, 0, lot); lots.length = Math.min(lots.length, 10); i++; } draw(); };
        };
      }
      reset();
    },
  });

  /* ================================================================= VOYAGE SPEED DESK */
  add({
    id: 'voyage', lvl: 6, icon: '🧭', title: L('Voyage speed desk', 'مكتب سرعة الرحلة'),
    desc: L('You operate a time-chartered bulk carrier. Choose the sea speed for the next leg considering fuel (cube law), daily hire, bunker price and the port’s berth availability.', 'تشغّل ناقلة سائبة مستأجرة زمنيًا. اختر سرعة الإبحار للمرحلة التالية مع مراعاة الوقود (قانون المكعّب) والإيجار اليومي وسعر الوقود وتوفّر الرصيف في الميناء.'),
    mount(el, api) {
      let sc, done;
      const reset = () => {
        const v0 = 14, c0 = R(26, 40);
        sc = { dist: R(18, 60) * 100, hire: R(8, 30) * 1000, bunker: R(450, 800), v0, c0, idle: 4, berthDay: null };
        const t14 = sc.dist / (14 * 24);
        sc.berthDay = PT.r1(t14 + (Math.random() < 0.6 ? R(0, 30) / 10 : 0));
        done = false; draw(12);
      };
      const cost = (v) => {
        const sea = sc.dist / (v * 24), cons = sc.c0 * Math.pow(v / sc.v0, 3), wait = Math.max(0, sc.berthDay - sea), total = Math.max(sea, sc.berthDay);
        const fuel = sea * cons + wait * sc.idle;
        return { sea, cons, wait, total, fuel, c: fuel * sc.bunker + total * sc.hire };
      };
      const speeds = [10, 11, 12, 13, 14, 15, 16];
      function draw(v) {
        const rows = speeds.map((s) => ({ s, ...cost(s) }));
        const best = rows.reduce((a, b) => (b.c < a.c ? b : a));
        const c = cost(v);
        el.innerHTML = `<div class="grid c4"><div class="tile"><div class="k">${t(L('Distance', 'المسافة'))}</div><div class="v">${n(sc.dist, 0)} nm</div></div><div class="tile"><div class="k">${t(L('Hire', 'الإيجار'))}</div><div class="v">${n(sc.hire, 0)}</div><div class="s">USD/day</div></div><div class="tile"><div class="k">${t(L('Bunker', 'الوقود'))}</div><div class="v">${sc.bunker}</div><div class="s">USD/t · ${sc.c0} t/day @14 kn · idle ${sc.idle} t/day</div></div><div class="tile red"><div class="k">${t(L('Berth available', 'الرصيف متاح'))}</div><div class="v">${t(L('day', 'اليوم'))} ${sc.berthDay}</div><div class="s">${t(L('after departure', 'بعد المغادرة'))}</div></div></div>
          <div class="card" style="margin-top:14px"><label><b>${t(L('Sea speed', 'سرعة الإبحار'))}: <span id="vVal">${v}</span> kn</b></label><input type="range" min="10" max="16" step="1" value="${v}" id="vR" style="width:100%" ${done ? 'disabled' : ''}>
            <div class="grid c4" style="margin-top:10px"><div class="stat"><div class="k">${t(L('Sea days', 'أيام الإبحار'))}</div><div class="v">${n(c.sea, 2)}</div></div><div class="stat"><div class="k">${t(L('Waiting at anchor', 'الانتظار على المخطاف'))}</div><div class="v">${n(c.wait, 2)} d</div></div><div class="stat"><div class="k">${t(L('Fuel used', 'الوقود المستهلك'))}</div><div class="v">${n(c.fuel, 0)} t</div></div><div class="stat"><div class="k">${t(L('Total cost', 'التكلفة الإجمالية'))}</div><div class="v">${n(c.c, 0)}</div></div></div>
            <p class="muted">${t(L('Total cost = fuel × bunker price + days until berthing × hire. Fuel/day = consumption@14 × (V/14)³.', 'التكلفة الإجمالية = الوقود × سعر الوقود + الأيام حتى الرسو × الإيجار. الوقود/يوم = الاستهلاك@14 × (V/14)³.'))}</p>
            ${done ? '' : `<button class="btn red" id="vGo">${t(L('Order this speed', 'اعتمد هذه السرعة'))}</button>`}<button class="btn" id="vNew">${t(L('New voyage', 'رحلة جديدة'))}</button></div><div id="vOut"></div>`;
        $('#vR', el).oninput = (e) => draw(Number(e.target.value));
        $('#vNew', el).onclick = reset;
        const go = $('#vGo', el); if (go) go.onclick = () => {
          done = true; const score = Math.round(best.c / c.c * 100);
          draw(v);
          $('#vOut', el).innerHTML = `<div class="card fade-in"><div class="row"><div class="score-big">${score}</div><span class="muted">${t(L(`Best speed: ${best.s} kn (cost ${n(best.c, 0)}). Yours: ${v} kn (cost ${n(c.c, 0)}).`, `أفضل سرعة: ${best.s} عقدة (التكلفة ${n(best.c, 0)}). سرعتك: ${v} عقدة (التكلفة ${n(c.c, 0)}).`))}</span></div>
            <div class="table-wrap"><table><thead><tr><th>kn</th><th class="num">${t(L('Sea days', 'أيام الإبحار'))}</th><th class="num">${t(L('Wait', 'الانتظار'))}</th><th class="num">${t(L('Fuel t', 'الوقود طن'))}</th><th class="num">${t(L('Cost USD', 'التكلفة دولار'))}</th></tr></thead><tbody>${rows.map((r) => `<tr class="${r.s === best.s ? 'sel' : ''}"><td>${r.s}</td><td class="num">${n(r.sea, 2)}</td><td class="num">${n(r.wait, 2)}</td><td class="num">${n(r.fuel, 0)}</td><td class="num">${n(r.c, 0)}</td></tr>`).join('')}</tbody></table></div>
            <div class="senior"><strong>${t(L('Senior tip', 'نصيحة المحترف'))}</strong>${t(L('If the berth is not free, every extra knot buys only waiting time at anchor. High hire pushes speed up; high bunker prices and congestion push it down.', 'إن لم يكن الرصيف حرًّا، فكل عقدة إضافية تشتري وقت انتظار على المخطاف فقط. الإيجار المرتفع يرفع السرعة؛ وأسعار الوقود المرتفعة والازدحام تخفضانها.'))}</div></div>`;
          api.done(score);
        };
      }
      reset();
    },
  });

  /* ================================================================= PORT DEVELOPMENT GAME */
  const PROJ = [
    { k: 'prod', l: L('Productivity programme (TOS optimisation, twin-lift, training)', 'برنامج الإنتاجية (تحسين TOS، الرفع المزدوج، التدريب)'), cap: 0.15, cost: 12, lead: 1 },
    { k: 'dwell', l: L('Dwell-time policy & off-dock empties', 'سياسة مدة البقاء ونقل الفارغ خارج المحطة'), cap: 0.2, cost: 8, lead: 1 },
    { k: 'gate', l: L('Gate automation + truck appointments', 'أتمتة البوابة + مواعيد الشاحنات'), cap: 0.1, cost: 15, lead: 1 },
    { k: 'ertg', l: L('Yard densification with eRTGs', 'تكثيف الساحة برافعات RTG كهربائية'), cap: 0.3, cost: 45, lead: 2 },
    { k: 'cranes', l: L('2 additional STS cranes', 'رافعتا رصيف إضافيتان'), cap: 0.15, cost: 26, lead: 2 },
    { k: 'berth', l: L('New 400 m berth + yard (phase 2)', 'رصيف جديد 400 م + ساحة (المرحلة 2)'), cap: 0.8, cost: 260, lead: 4 },
    { k: 'dredge', l: L('Deepen channel to 17.5 m (bigger ships)', 'تعميق القناة إلى 17.5 م (سفن أكبر)'), cap: 0.1, cost: 90, lead: 3, demand: 0.06 },
  ];
  add({
    id: 'devgame', lvl: 9, icon: '🏗', title: L('Port development — 10-year plan', 'تطوير الميناء — خطة 10 سنوات'),
    desc: L('You are the port development director. Each year, demand grows (with uncertainty). Choose investments with their costs and lead times to keep utilisation healthy (60–85%) without wasting capital.', 'أنت مدير تطوير الميناء. كل سنة ينمو الطلب (مع عدم اليقين). اختر الاستثمارات بتكاليفها ومهلها لإبقاء الاستخدام سليمًا (60–85%) دون هدر رأس المال.'),
    mount(el, api) {
      let st;
      const reset = () => { st = { year: 1, demand: 1.25, cap: 1.6, built: {}, pipeline: [], spent: 0, hist: [], g: PT.r1(R(40, 70) / 10), done: false }; draw(); };
      const status = (u) => (u > 1 ? ['bad', L('Overloaded — cargo lost', 'محمّل فوق طاقته — ضياع بضائع')] : u > 0.85 ? ['warn', L('Congested', 'مزدحم')] : u < 0.6 ? ['info', L('Over-capacity', 'فائض طاقة')] : ['ok', L('Healthy', 'سليم')]);
      function chart() {
        const H = st.hist, W = 640, Ht = 200, max = Math.max(2.8, ...H.map((h) => Math.max(h.d, h.c)));
        const x = (i) => 40 + i * ((W - 60) / 10), y = (v) => Ht - 20 - (v / max) * (Ht - 40);
        const path = (k) => H.map((h, i) => `${i ? 'L' : 'M'}${x(i + 1)} ${y(h[k])}`).join(' ');
        return `<svg viewBox="0 0 ${W} ${Ht}" class="gantt" style="max-width:720px"><line class="grid" x1="40" x2="${W - 20}" y1="${y(0)}" y2="${y(0)}"/>${[0.5, 1, 1.5, 2, 2.5].map((v) => `<line class="grid" x1="40" x2="${W - 20}" y1="${y(v)}" y2="${y(v)}"/><text x="4" y="${y(v) + 4}">${v}M</text>`).join('')}${Array.from({ length: 10 }, (_, i) => `<text x="${x(i + 1)}" y="${Ht - 4}" text-anchor="middle">Y${i + 1}</text>`).join('')}
          ${H.length ? `<path d="${path('c')}" fill="none" stroke="#04246a" stroke-width="3"/><path d="${path('d')}" fill="none" stroke="#e30613" stroke-width="3" stroke-dasharray="6 4"/>` : ''}</svg>
          <div class="legend"><span><i style="background:#04246a"></i>${t(L('Capacity', 'الطاقة'))}</span><span><i style="background:#e30613"></i>${t(L('Demand', 'الطلب'))}</span></div>`;
      }
      function finish() {
        st.done = true;
        let score = 100;
        st.hist.forEach((h) => { const u = h.d / h.c; if (u > 1) score -= 15; else if (u > 0.85) score -= 7; else if (u < 0.6) score -= 5; });
        if (st.spent > 350) score -= Math.min(30, Math.round((st.spent - 350) / 10));
        if (st.cap > 1.35 * st.demand) score -= 10;
        return Math.max(0, score);
      }
      function draw() {
        const u = st.demand / st.cap, [cls, lbl] = status(u);
        if (st.done) {
          const score = finish(), lost = st.hist.reduce((a, h) => a + Math.max(0, h.d - h.c), 0);
          el.innerHTML = chart() + `<div class="card fade-in" style="margin-top:12px"><h3>${t(L('10-year review', 'مراجعة 10 سنوات'))}</h3><div class="grid c4"><div class="tile red"><div class="k">${t(L('Score', 'النتيجة'))}</div><div class="v">${score}</div></div><div class="tile"><div class="k">CAPEX</div><div class="v">${st.spent}M</div><div class="s">${t(L('budget guide 350M', 'الميزانية الإرشادية 350 مليون'))}</div></div><div class="tile"><div class="k">${t(L('Lost volume', 'الحجم الضائع'))}</div><div class="v">${n(lost, 2)}M</div><div class="s">TEU</div></div><div class="tile"><div class="k">${t(L('Final capacity', 'الطاقة النهائية'))}</div><div class="v">${n(st.cap, 2)}M</div></div></div>
            <div class="table-wrap"><table><thead><tr><th>${t(L('Year', 'السنة'))}</th><th class="num">${t(L('Demand', 'الطلب'))}</th><th class="num">${t(L('Capacity', 'الطاقة'))}</th><th class="num">${t(L('Utilisation', 'الاستخدام'))}</th><th>${t(L('Decisions', 'القرارات'))}</th></tr></thead><tbody>${st.hist.map((h, i) => `<tr><td>Y${i + 1}</td><td class="num">${n(h.d, 2)}</td><td class="num">${n(h.c, 2)}</td><td class="num">${Math.round(h.d / h.c * 100)}%</td><td>${h.dec.map((k) => t(PROJ.find((p) => p.k === k).l).split('(')[0]).join(', ') || '—'}</td></tr>`).join('')}</tbody></table></div>
            <div class="senior"><strong>${t(L('Senior debrief', 'خلاصة المحترف'))}</strong>${t(L('Cheap, fast measures (dwell policy, productivity, gate) first; launch the long-lead berth 4 years before you need it; dredging only if the market needs bigger ships. Penalties: −7/yr congested (>85%), −15/yr overloaded, −5/yr under-used (<60%), −10 if final capacity > 135% of demand (over-built), overspend above 350M.', 'الإجراءات الرخيصة والسريعة (سياسة البقاء، الإنتاجية، البوابة) أولًا؛ أطلق الرصيف طويل المهلة قبل 4 سنوات من حاجتك إليه؛ والتعميق فقط إن احتاج السوق سفنًا أكبر. العقوبات: −7/سنة مزدحم (>85%)، −15/سنة فوق الطاقة، −5/سنة استخدام منخفض (<60%)، −10 إن تجاوزت الطاقة النهائية 135% من الطلب (بناء زائد)، تجاوز 350 مليون.'))}</div>
            <button class="btn red" id="dNew">${t(L('Play again', 'العب مجددًا'))}</button></div>`;
          $('#dNew', el).onclick = reset; api.done(score); return;
        }
        el.innerHTML = `<div class="grid c4"><div class="tile"><div class="k">${t(L('Year', 'السنة'))}</div><div class="v">${st.year} / 10</div></div><div class="tile"><div class="k">${t(L('Demand now', 'الطلب الآن'))}</div><div class="v">${n(st.demand, 2)}M</div><div class="s">${t(L('forecast growth', 'النمو المتوقّع'))} ~${st.g}%/yr</div></div><div class="tile"><div class="k">${t(L('Capacity', 'الطاقة'))}</div><div class="v">${n(st.cap, 2)}M</div></div><div class="tile"><div class="k">${t(L('Utilisation', 'الاستخدام'))}</div><div class="v">${Math.round(u * 100)}%</div><span class="badge ${cls}">${t(lbl)}</span></div></div>
          ${chart()}
          <div class="card" style="margin-top:12px"><h3>${t(L('Investments available this year', 'الاستثمارات المتاحة هذه السنة'))} <small class="muted">· CAPEX ${t(L('spent', 'المنفق'))}: ${st.spent}M</small></h3>
            ${PROJ.map((p) => { const used = st.built[p.k]; return `<label class="opt" ${used ? 'aria-disabled="true" style="opacity:.55"' : ''}><input type="checkbox" value="${p.k}" ${used ? 'disabled' : ''}><span><b>${t(p.l)}</b><br><small>+${p.cap}M TEU · USD ${p.cost}M · ${t(L('ready in', 'جاهز خلال'))} ${p.lead} ${t(L('yr', 'سنة'))}${p.demand ? ' · ' + t(L('attracts +6% demand', 'يجذب +6% طلبًا')) : ''}${used ? ' · ✓ ' + t(L('ordered', 'مطلوب')) : ''}</small></span></label>`; }).join('')}
            ${st.pipeline.length ? `<p class="muted">${t(L('Under construction', 'قيد الإنشاء'))}: ${st.pipeline.map((x) => t(PROJ.find((p) => p.k === x.k).l).split('(')[0] + ' → Y' + x.ready).join(' · ')}</p>` : ''}
            <button class="btn red" id="dNext">${t(L('Confirm & advance one year', 'أكّد وتقدّم سنة'))} →</button></div>`;
        $('#dNext', el).onclick = () => {
          const dec = $$('input[type=checkbox]:checked', el).map((c) => c.value);
          dec.forEach((k) => { const p = PROJ.find((x) => x.k === k); st.built[k] = true; st.spent += p.cost; st.pipeline.push({ k, ready: st.year + p.lead }); });
          st.hist.push({ d: st.demand, c: st.cap, dec });
          st.year++;
          st.pipeline = st.pipeline.filter((x) => { if (x.ready <= st.year) { const p = PROJ.find((q) => q.k === x.k); st.cap += p.cap; if (p.demand) st.demand *= 1 + p.demand; return false; } return true; });
          st.demand *= 1 + (st.g + R(-20, 20) / 10) / 100;
          if (st.year > 10) st.done = true;
          draw();
        };
      }
      reset();
    },
  });
})();
