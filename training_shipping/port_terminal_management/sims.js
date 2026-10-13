/* Port Master Academy — interactive simulators */
(function () {
  const L = TS.L, t = TS.t, esc = TS.esc;
  const R = PT.rnd, P = PT.pick;
  const n = (x, d) => TS.num(x, d == null ? 1 : d);
  const add = (x) => PT.sims.push(x);
  const $ = (s, el) => el.querySelector(s);
  const $$ = (s, el) => Array.from(el.querySelectorAll(s));

  /* ================================================================= 1. BERTH PLANNER */
  const RATE = 26, MARINE = 2;
  const VNAMES = ['ATLAS VEGA', 'BMS ORION', 'LFS BYBLOS', 'OSL JADE', 'LFS TYRE', 'AOL TOULON', 'BMS IONIAN', 'OSL CORAL', 'LFS SIDON', 'AOL NICE', 'BMS AEGEAN', 'OSL AMBER'];
  function genVessels() {
    const names = PT.shuffle(VNAMES);
    const kinds = PT.shuffle(['f', 'f', 'r', 'r', 'm', 'm']);
    return kinds.map((k, i) => {
      const v = { id: 'V' + (i + 1), name: names[i] };
      if (k === 'f') Object.assign(v, { loa: R(14, 20) * 10, draft: R(80, 105) / 10, moves: R(6, 18) * 50, win: false });
      if (k === 'r') Object.assign(v, { loa: R(22, 27) * 10, draft: R(115, 130) / 10, moves: R(18, 32) * 50, win: Math.random() < 0.5 });
      if (k === 'm') Object.assign(v, { loa: R(29, 33) * 10, draft: R(136, 150) / 10, moves: R(36, 64) * 50, win: true });
      v.eta = R(0, 36);
      v.maxC = Math.max(1, Math.min(5, Math.floor(v.loa / 70)));
      return v;
    }).sort((a, b) => a.eta - b.eta);
  }
  const dur = (v, c) => MARINE + v.moves / (c * RATE);
  function berthOk(v, b) {
    const errs = [];
    if (v.loa + 20 > b.len) errs.push(L(`LOA ${v.loa} m + 20 m clearance > berth ${b.len} m`, `الطول ${v.loa} م + 20 م خلوص > الرصيف ${b.len} م`));
    if (v.draft + 0.5 > b.draft) errs.push(L(`draft ${v.draft} m + 0.5 m UKC > depth ${b.draft} m`, `الغاطس ${v.draft} م + 0.5 م UKC > العمق ${b.draft} م`));
    return errs;
  }
  function benchmark(vs) {
    const free = {}; PT.port.berths.forEach((b) => (free[b.id] = 0));
    let wait = 0, winWait = 0;
    vs.slice().sort((a, b) => (a.eta - b.eta) || (b.win - a.win)).forEach((v) => {
      let best = null;
      PT.port.berths.forEach((b) => {
        if (berthOk(v, b).length) return;
        const c = Math.min(v.maxC, b.cranes), st = Math.max(v.eta, free[b.id]), en = st + dur(v, c);
        if (!best || en < best.en) best = { b, st, en };
      });
      if (best) { free[best.b.id] = best.en; wait += best.st - v.eta; if (v.win) winWait += best.st - v.eta; }
    });
    return { wait, winWait };
  }

  add({
    id: 'berth', lvl: 2, icon: '🗓', title: L('Berth planner', 'مخطّط الأرصفة'),
    desc: L('Allocate 6 vessels to 3 berths: choose berth, start time and cranes. Respect length, depth, crane limits and windows. Your waiting time is compared with an automatic planner.', 'وزّع 6 سفن على 3 أرصفة: اختر الرصيف ووقت البدء والرافعات. احترم الطول والعمق وحدود الرافعات والنوافذ. يُقارَن وقت انتظارك بمخطّط آلي.'),
    mount(el, api) {
      let vs = genVessels(), plan = {}, submitted = false;
      const reset = () => { vs = genVessels(); plan = {}; submitted = false; draw(); };
      function evaluate() {
        const rows = vs.map((v) => {
          const p = plan[v.id] || {}; const errs = [];
          const b = PT.port.berths.find((x) => x.id === p.b);
          if (!b) errs.push(L('choose a berth', 'اختر رصيفًا'));
          if (p.s == null || p.s === '' || isNaN(p.s)) errs.push(L('set a start hour', 'حدّد ساعة البدء'));
          if (!p.c) errs.push(L('choose cranes', 'اختر الرافعات'));
          let st = Number(p.s), en = null;
          if (b) { errs.push(...berthOk(v, b)); if (p.c > b.cranes) errs.push(L(`berth has only ${b.cranes} cranes`, `في الرصيف ${b.cranes} رافعات فقط`)); }
          if (p.c > v.maxC) errs.push(L(`max ${v.maxC} cranes for ${v.loa} m`, `الحدّ ${v.maxC} رافعات لطول ${v.loa} م`));
          if (!isNaN(st) && st < v.eta) errs.push(L('cannot berth before ETA', 'لا يمكن الرسو قبل الوصول'));
          if (b && p.c && !isNaN(st)) en = st + dur(v, p.c);
          return { v, p, b, st, en, errs };
        });
        rows.forEach((r) => {
          if (r.en == null) return;
          rows.forEach((o) => { if (o !== r && o.b && r.b && o.b.id === r.b.id && o.en != null && r.st < o.en && o.st < r.en) r.errs.push(L(`overlaps ${o.v.name} on ${r.b.id}`, `يتداخل مع ${o.v.name} على ${r.b.id}`)); });
        });
        return rows;
      }
      function earliest(v, bid, c) {
        const rows = evaluate().filter((r) => r.v.id !== v.id && r.b && r.b.id === bid && r.en != null).sort((a, b) => a.st - b.st);
        let s = v.eta; const d = dur(v, c);
        rows.forEach((r) => { if (s < r.en && r.st < s + d) s = r.en; });
        return Math.ceil(s * 2) / 2;
      }
      function gantt(rows) {
        const H = Math.max(72, Math.ceil(Math.max(0, ...rows.map((r) => r.en || 0)) / 12) * 12 + 6);
        const W = 960, left = 60, lane = 58, top = 26, sc = (W - left - 10) / H;
        const colors = ['#04246a', '#e30613', '#1d56c0', '#2f7d5b', '#c26a00', '#7b3fc4'];
        let s = `<svg class="gantt" viewBox="0 0 ${W} ${top + lane * 3 + 10}" role="img" aria-label="berth plan">`;
        for (let h = 0; h <= H; h += 6) s += `<line class="grid" x1="${left + h * sc}" x2="${left + h * sc}" y1="${top - 4}" y2="${top + lane * 3}"/><text x="${left + h * sc}" y="${top - 10}" text-anchor="middle">${h % 24 === 0 ? 'D' + (h / 24) : h % 24 + 'h'}</text>`;
        PT.port.berths.forEach((b, i) => { s += `<rect class="lane" x="${left}" y="${top + i * lane + 3}" width="${W - left - 10}" height="${lane - 6}" rx="6"/><text x="8" y="${top + i * lane + lane / 2 + 4}" style="font-weight:700">${b.id}</text>`; });
        rows.forEach((r, i) => {
          if (!r.b || r.en == null) return;
          const bi = PT.port.berths.indexOf(r.b), y = top + bi * lane + 8;
          s += `<line class="eta" x1="${left + r.v.eta * sc}" x2="${left + r.v.eta * sc}" y1="${y - 4}" y2="${y + lane - 12}"/>`;
          s += `<rect class="ves" x="${left + r.st * sc}" y="${y}" width="${Math.max(4, (r.en - r.st) * sc)}" height="${lane - 16}" fill="${r.errs.length ? '#b3261e' : colors[i % 6]}" opacity=".92"/>`;
          s += `<text x="${left + r.st * sc + 6}" y="${y + 17}" style="fill:#fff;font-weight:600">${esc(r.v.name)}</text><text x="${left + r.st * sc + 6}" y="${y + 31}" style="fill:#fff;opacity:.85">${r.p.c}×QC · ${n(r.en - r.st)}h</text>`;
        });
        return s + '</svg>';
      }
      function draw() {
        const rows = evaluate();
        const opt = (sel, arr) => arr.map((o) => `<option value="${o}" ${String(o) === String(sel) ? 'selected' : ''}>${o}</option>`).join('');
        el.innerHTML = `
          <div class="note"><b>${t(L('Rules', 'القواعد'))}:</b> ${t(L(`Duration = ${MARINE} h marine + moves ÷ (cranes × ${RATE} mph). Berth needs LOA + 20 m and draft + 0.5 m. Window vessels (★) should berth on arrival.`, `المدة = ${MARINE} ساعة خدمات بحرية + الحركات ÷ (الرافعات × ${RATE}). الرصيف يحتاج الطول + 20 م والغاطس + 0.5 م. سفن النوافذ (★) يجب أن ترسو فور وصولها.`))}</div>
          <div class="table-wrap"><table><thead><tr>${PT.port.berths.map((b) => `<th>${b.id}: ${b.len} m · ${b.draft} m · ${b.cranes} QC</th>`).join('')}</tr></thead></table></div>
          <div class="table-wrap"><table><thead><tr><th>${t(L('Vessel', 'السفينة'))}</th><th class="num">ETA (h)</th><th class="num">LOA</th><th class="num">${t(L('Draft', 'الغاطس'))}</th><th class="num">${t(L('Moves', 'الحركات'))}</th><th>${t(L('Berth', 'الرصيف'))}</th><th>${t(L('Cranes', 'الرافعات'))}</th><th>${t(L('Start (h)', 'البدء (س)'))}</th><th class="num">${t(L('End', 'النهاية'))}</th><th class="num">${t(L('Wait', 'الانتظار'))}</th></tr></thead><tbody>
          ${rows.map((r) => `<tr><td><b>${r.v.win ? '★ ' : ''}${esc(r.v.name)}</b>${r.errs.length && (r.p.b || r.p.c || r.p.s != null) ? `<br><small style="color:var(--bad)">✗ ${r.errs.map((e) => t(e)).join(' · ')}</small>` : ''}</td>
            <td class="num">${r.v.eta}</td><td class="num">${r.v.loa}</td><td class="num">${r.v.draft}</td><td class="num">${r.v.moves}</td>
            <td><select data-v="${r.v.id}" data-f="b" style="min-width:70px"><option value="">—</option>${opt(r.p.b, PT.port.berths.map((b) => b.id))}</select></td>
            <td><select data-v="${r.v.id}" data-f="c" style="min-width:60px"><option value="">—</option>${opt(r.p.c, Array.from({ length: r.v.maxC }, (_, i) => i + 1))}</select></td>
            <td><div class="row" style="gap:4px;flex-wrap:nowrap"><input type="number" step="0.5" data-v="${r.v.id}" data-f="s" value="${r.p.s != null ? r.p.s : ''}" style="width:80px;min-width:70px"><button class="btn sm ghost" data-early="${r.v.id}" title="earliest">⇤</button></div></td>
            <td class="num">${r.en != null ? n(r.en) : '—'}</td><td class="num">${r.en != null && !isNaN(r.st) ? n(Math.max(0, r.st - r.v.eta)) : '—'}</td></tr>`).join('')}
          </tbody></table></div>
          ${gantt(rows)}
          <div class="legend" style="margin:8px 0"><span><i style="background:#e30613;height:2px"></i>${t(L('ETA (dashed)', 'موعد الوصول (متقطّع)'))}</span><span><i style="background:#b3261e"></i>${t(L('conflict', 'تعارض'))}</span><span>⇤ ${t(L('= earliest feasible start on that berth', '= أبكر بدء ممكن على ذلك الرصيف'))}</span></div>
          <div class="row"><button class="btn red" id="bpSubmit">${t(L('Submit plan', 'قدّم الخطة'))}</button><button class="btn" id="bpNew">${t(L('New scenario', 'سيناريو جديد'))}</button></div>
          <div id="bpOut"></div>`;
        $$('[data-v]', el).forEach((i) => (i.onchange = () => {
          const p = (plan[i.dataset.v] = plan[i.dataset.v] || {});
          p[i.dataset.f] = i.dataset.f === 'b' ? i.value : (i.value === '' ? null : Number(i.value));
          draw();
        }));
        $$('[data-early]', el).forEach((b) => (b.onclick = () => {
          const v = vs.find((x) => x.id === b.dataset.early), p = (plan[v.id] = plan[v.id] || {});
          if (!p.b || !p.c) { TS.toast(t(L('Choose berth and cranes first', 'اختر الرصيف والرافعات أولًا')), 'bad'); return; }
          p.s = earliest(v, p.b, p.c); draw();
        }));
        $('#bpNew', el).onclick = reset;
        $('#bpSubmit', el).onclick = () => {
          const rs = evaluate(), bad = rs.filter((r) => r.errs.length);
          if (bad.length) { TS.toast(t(L(`${bad.length} vessel(s) still have errors`, `${bad.length} سفينة/سفن ما زالت فيها أخطاء`)), 'bad'); return; }
          const wait = rs.reduce((a, r) => a + (r.st - r.v.eta), 0), winWait = rs.filter((r) => r.v.win).reduce((a, r) => a + (r.st - r.v.eta), 0);
          const bm = benchmark(vs), stay = rs.reduce((a, r) => a + (r.en - r.v.eta), 0);
          const score = Math.max(10, Math.round(100 - 3 * Math.max(0, wait - bm.wait) - 6 * winWait));
          $('#bpOut', el).innerHTML = `<div class="card fade-in" style="margin-top:14px"><h3>${t(L('Plan result', 'نتيجة الخطة'))}</h3>
            <div class="grid c4"><div class="tile"><div class="k">${t(L('Total waiting', 'إجمالي الانتظار'))}</div><div class="v">${n(wait)} h</div></div>
            <div class="tile"><div class="k">${t(L('Window vessels waiting', 'انتظار سفن النوافذ'))}</div><div class="v">${n(winWait)} h</div></div>
            <div class="tile"><div class="k">${t(L('Auto-planner waiting', 'انتظار المخطّط الآلي'))}</div><div class="v">${n(bm.wait)} h</div></div>
            <div class="tile red"><div class="k">${t(L('Score', 'النتيجة'))}</div><div class="v">${score}</div></div></div>
            <p class="muted" style="margin-top:10px">${t(L(`Total time in port (all vessels): ${n(stay)} h. Penalty: 3 points per hour of waiting above the auto-planner and 6 points per hour a window vessel waits.`, `إجمالي الوقت في الميناء (كل السفن): ${n(stay)} ساعة. العقوبة: 3 نقاط لكل ساعة انتظار فوق المخطّط الآلي و6 نقاط لكل ساعة تنتظرها سفينة نافذة.`))}</p>
            <div class="senior"><strong>${t(L('Senior debrief', 'ملاحظات المحترف'))}</strong>${t(L('Put deep/long ships on B2 first, use B3 for small feeders, give max cranes to window vessels, and fill gaps with off-window ships.', 'ضع السفن العميقة/الطويلة على B2 أولًا، واستخدم B3 للفيدر الصغير، وأعطِ أقصى عدد رافعات لسفن النوافذ، واملأ الفجوات بالسفن خارج النافذة.'))}</div></div>`;
          if (!submitted) { submitted = true; api.done(score); }
        };
      }
      draw();
    },
  });

  /* ================================================================= 2. YARD STACKING */
  const PODS = [{ k: 'MER', c: 'POD1', l: L('Mersin (1st port)', 'مرسين (الميناء الأول)') }, { k: 'PIR', c: 'POD2', l: L('Piraeus (2nd)', 'بيرايوس (الثاني)') }, { k: 'VAL', c: 'POD3', l: L('Valencia (3rd)', 'فالنسيا (الثالث)') }];
  const WT = ['H', 'M', 'L'];
  const rank = (b) => (2 - b.pod) * 3 + WT.indexOf(b.w); /* loaded first = lowest rank: last port first, heavy first */
  function rehandles(stacks) {
    const st = stacks.map((s) => s.slice());
    let count = 0; const maxH = 4;
    const left = () => st.reduce((a, s) => a + s.length, 0);
    while (left()) {
      let minR = 99; st.forEach((s) => s.forEach((b) => { if (rank(b) < minR) minR = rank(b); }));
      let best = null;
      st.forEach((s, si) => s.forEach((b, bi) => { if (rank(b) === minR) { const above = s.length - 1 - bi; if (!best || above < best.above) best = { si, bi, above }; } }));
      const s = st[best.si];
      const blockers = s.splice(best.bi + 1);
      s.pop();
      blockers.reverse().forEach((b) => {
        count++;
        let tgt = -1, bestScore = -1;
        st.forEach((o, oi) => {
          if (oi === best.si || o.length >= maxH) return;
          const minIn = o.length ? Math.min(...o.map(rank)) : 99;
          const sc = (minIn >= rank(b) ? 100 : 0) + (maxH - o.length);
          if (sc > bestScore) { bestScore = sc; tgt = oi; }
        });
        (tgt >= 0 ? st[tgt] : s).push(b);
      });
    }
    return count;
  }
  add({
    id: 'yard', lvl: 3, icon: '🧱', title: L('Yard stacking challenge', 'تحدّي رصّ الساحة'),
    desc: L('Export boxes arrive at the gate in random order. Place each one in a 6-row × 4-tier bay so the vessel can load them with as few rehandles as possible.', 'حاويات التصدير تصل للبوابة بترتيب عشوائي. ضع كل واحدة في خليج من 6 صفوف × 4 طبقات بحيث تُحمَّل على السفينة بأقل إعادة مناولة ممكنة.'),
    mount(el, api) {
      let queue, stacks, done;
      const reset = () => { queue = Array.from({ length: 16 }, (_, i) => ({ id: i + 1, pod: R(0, 2), w: P(WT) })); stacks = [[], [], [], [], [], []]; done = false; draw(); };
      function draw() {
        const next = queue[0];
        let grid = '';
        for (let tier = 3; tier >= 0; tier--) {
          grid += stacks.map((s) => { const b = s[tier]; return b ? `<div class="slot box c-${PODS[b.pod].c}">${PODS[b.pod].k}<br>${b.w}</div>` : '<div class="slot empty">·</div>'; }).join('');
        }
        el.innerHTML = `
          <div class="note">${t(L('<b>Loading sequence of the vessel</b>: the ship loads the <b>last port first</b> (Valencia → Piraeus → Mersin), and within each port <b>heavy → medium → light</b>. Boxes loaded first should be on top. Click a row to drop the next box.', '<b>تسلسل تحميل السفينة</b>: تحمّل السفينة <b>الميناء الأخير أولًا</b> (فالنسيا ← بيرايوس ← مرسين)، وضمن كل ميناء <b>ثقيل ← متوسط ← خفيف</b>. الحاويات المحمّلة أولًا يجب أن تكون في الأعلى. انقر على صف لإسقاط الحاوية التالية.'))}</div>
          <div class="legend" style="margin-bottom:10px">${PODS.map((p) => `<span><i class="c-${p.c}"></i>${t(p.l)}</span>`).join('')}<span>H/M/L = ${t(L('heavy / medium / light', 'ثقيل / متوسط / خفيف'))}</span></div>
          <div class="row" style="align-items:flex-start;gap:20px">
            <div><div class="yard" style="grid-template-columns:repeat(6,74px)">${grid}${stacks.map((s, i) => `<button class="btn sm colbtn" data-row="${i}" ${!next || s.length >= 4 ? 'disabled' : ''}>${t(L('Row', 'صف'))} ${i + 1} ↓</button>`).join('')}</div></div>
            <div style="min-width:220px">${next ? `<div class="next-box"><div class="slot box c-${PODS[next.pod].c}">${PODS[next.pod].k}<br>${next.w}</div><div><b>${t(L('Next at gate', 'التالية على البوابة'))}</b><br><small>${t(PODS[next.pod].l)} · ${next.w}</small><br><small>${queue.length} ${t(L('boxes left', 'حاويات متبقية'))}</small></div></div>
              <p class="muted" style="margin-top:10px">${t(L('Coming next:', 'القادمة:'))} ${queue.slice(1, 5).map((b) => PODS[b.pod].k + '-' + b.w).join(', ')}</p>` : `<div id="yOut"></div>`}</div>
          </div>
          <div class="row" style="margin-top:12px"><button class="btn" id="yNew">${t(L('New game', 'لعبة جديدة'))}</button></div>`;
        $$('[data-row]', el).forEach((b) => (b.onclick = () => { stacks[Number(b.dataset.row)].push(queue.shift()); draw(); }));
        $('#yNew', el).onclick = reset;
        if (!next && !done) {
          done = true;
          const rh = rehandles(stacks), score = Math.max(0, 100 - rh * 8);
          $('#yOut', el).innerHTML = `<div class="card fade-in"><div class="k muted">${t(L('Rehandles needed during loading', 'إعادة المناولة المطلوبة أثناء التحميل'))}</div><div class="score-big">${rh}</div>
            <p>${t(L('Score', 'النتيجة'))}: <b>${score}</b>/100 (−8 ${t(L('per rehandle', 'لكل إعادة مناولة'))})</p>
            <div class="senior"><strong>${t(L('Senior tip', 'نصيحة المحترف'))}</strong>${t(L('Reserve rows per category early (e.g. one row for Mersin, one for Valencia heavy). Never put a box loaded later on top of one loaded earlier. Keep one row free as a buffer.', 'خصّص صفوفًا لكل فئة مبكرًا (مثلًا صف لمرسين وصف لفالنسيا الثقيل). لا تضع أبدًا حاوية تُحمّل لاحقًا فوق حاوية تُحمّل أبكر. أبقِ صفًا فارغًا كاحتياط.'))}</div></div>`;
          api.done(score);
        }
      }
      reset();
    },
  });

  /* ================================================================= 3. GATE CHECK-IN */
  const REASONS = [
    { k: 'ok', l: L('Accept — all checks pass', 'قبول — كل الفحوصات سليمة') },
    { k: 'digit', l: L('Reject — invalid container number (check digit)', 'رفض — رقم حاوية غير صحيح (رقم التحقّق)') },
    { k: 'booking', l: L('Reject — booking not found / wrong vessel', 'رفض — الحجز غير موجود / سفينة خاطئة') },
    { k: 'type', l: L('Reject — size/type does not match booking', 'رفض — المقاس/النوع لا يطابق الحجز') },
    { k: 'seal', l: L('Reject — seal missing or mismatch', 'رفض — الختم مفقود أو غير مطابق') },
    { k: 'vgm', l: L('Reject/hold — no VGM or VGM above max gross', 'رفض/حجز — لا VGM أو VGM فوق الحدّ الأقصى') },
    { k: 'cutoff', l: L('Reject — after CY cut-off without line approval', 'رفض — بعد إغلاق الساحة دون موافقة الخط') },
    { k: 'dg', l: L('Reject — DG without declaration/placards', 'رفض — بضائع خطرة دون بيان/ملصقات') },
    { k: 'reefer', l: L('Reject — reefer not running / wrong setpoint', 'رفض — مبرّدة لا تعمل / ضبط خاطئ') },
  ];
  function genGate() {
    const vessels = [{ v: 'BMS ADRIATIC 042E', pod: 'PIR', cut: 'Tue 12:00', cutH: 36 }, { v: 'LFS CEDAR 118N', pod: 'LMS', cut: 'Mon 18:00', cutH: 18 }];
    const types = ['22G1', '45G1', '42G1', '45R1'];
    const bookings = Array.from({ length: 6 }, (_, i) => { const ves = vessels[i % 2]; return { no: 'BK' + R(400000, 899999), ves: ves.v, pod: ves.pod, type: i === 3 ? '45R1' : P(['22G1', '45G1', '42G1']), cut: ves.cut, cutH: ves.cutH, temp: i === 3 ? -18 : null, dg: i === 5 ? 'IMO 3 / UN1263' : null }; });
    const faults = PT.shuffle(['ok', 'ok', 'ok', 'digit', 'booking', 'type', 'seal', 'vgm', 'cutoff', P(['dg', 'reefer'])]);
    const trucks = faults.map((f, i) => {
      let bk = P(bookings);
      if (f === 'dg') bk = bookings[5];
      if (f === 'reefer') bk = bookings[3];
      const tare = bk.type === '22G1' ? 2200 : bk.type === '45R1' ? 4800 : 3800;
      const tk = { plate: 'M ' + R(100000, 999999), bk: bk.no, cont: PT.containerNo(), type: bk.type, sealDoc: 'CB' + R(1000000, 9999999), vgm: tare + R(6000, 20000), arrH: R(0, 12), dgDocs: bk.dg ? L('DG declaration + 4 placards', 'بيان خطرة + 4 ملصقات') : L('—', '—'), reefer: bk.temp != null ? L(`running, setpoint ${bk.temp} °C`, `تعمل، الضبط ${bk.temp} °م`) : L('—', '—'), fault: f, ves: bk.ves };
      tk.sealSeen = tk.sealDoc;
      if (f === 'digit') tk.cont = PT.badContainerNo();
      if (f === 'booking') { tk.bk = 'BK' + R(100000, 399999); }
      if (f === 'type') tk.type = P(types.filter((x) => x !== bk.type && x !== '45R1'));
      if (f === 'seal') tk.sealSeen = Math.random() < 0.5 ? L('NO SEAL', 'لا يوجد ختم') : 'CB' + R(1000000, 9999999);
      if (f === 'vgm') tk.vgm = Math.random() < 0.5 ? null : 31200 + R(0, 3000);
      if (f === 'cutoff') tk.arrH = bk.cutH + R(1, 6);
      if (f === 'dg') tk.dgDocs = L('placards class 3 on doors only — no DG declaration', 'ملصقات الفئة 3 على الأبواب فقط — لا بيان خطرة');
      if (f === 'reefer') tk.reefer = Math.random() < 0.5 ? L('unit OFF (no genset)', 'الوحدة متوقفة (بلا مولّد)') : L('running, setpoint +4 °C', 'تعمل، الضبط +4 °م');
      if (tk.arrH >= bk.cutH && f !== 'cutoff') tk.arrH = Math.max(0, bk.cutH - R(2, 10));
      return tk;
    });
    return { bookings, trucks };
  }
  add({
    id: 'gate', lvl: 3, icon: '🚧', title: L('Gate check-in desk', 'مكتب فحص البوابة'),
    desc: L('10 export trucks arrive. Check booking, container number (ISO 6346), size-type, seal, VGM, cut-off, DG and reefer — accept or reject with the right reason.', 'تصل 10 شاحنات تصدير. افحص الحجز ورقم الحاوية (ISO 6346) والمقاس والنوع والختم وVGM والموعد النهائي والخطرة والمبرّدة — اقبل أو ارفض مع السبب الصحيح.'),
    mount(el, api) {
      let g, i, pts, log;
      const reset = () => { g = genGate(); i = 0; pts = 0; log = []; draw(); };
      const hh = (h) => { const d = ['Mon', 'Tue', 'Wed'][Math.floor((h + 6) / 24)] || 'Wed'; return d + ' ' + String((h + 6) % 24).padStart(2, '0') + ':00'; };
      function draw() {
        const tk = g.trucks[i];
        const bookTable = `<div class="table-wrap"><table><thead><tr><th>${t(L('Booking', 'الحجز'))}</th><th>${t(L('Vessel', 'السفينة'))}</th><th>POD</th><th>${t(L('Type', 'النوع'))}</th><th>${t(L('CY cut-off', 'إغلاق الساحة'))}</th><th>${t(L('Special', 'خاص'))}</th></tr></thead><tbody>${g.bookings.map((b) => `<tr><td class="mono">${b.no}</td><td>${b.ves}</td><td>${b.pod}</td><td class="mono">${b.type}</td><td>${b.cut}</td><td>${b.temp != null ? 'Reefer ' + b.temp + ' °C' : ''}${b.dg ? b.dg : ''}</td></tr>`).join('')}</tbody></table></div>`;
        if (!tk) {
          const score = Math.round(pts / (g.trucks.length * 10) * 100);
          el.innerHTML = `<div class="card fade-in"><h3>${t(L('Shift result', 'نتيجة الوردية'))}</h3><div class="score-big">${score}<small style="font-size:1rem">/100</small></div>
            <div class="table-wrap"><table><thead><tr><th>#</th><th>${t(L('Container', 'الحاوية'))}</th><th>${t(L('Correct answer', 'الإجابة الصحيحة'))}</th><th>${t(L('You', 'أنت'))}</th></tr></thead><tbody>${log.map((x, k) => `<tr><td>${k + 1}</td><td class="mono">${x.cont}</td><td>${t(REASONS.find((r) => r.k === x.fault).l)}</td><td>${x.pts === 10 ? '✅' : x.pts === 5 ? '🟡' : '❌'} ${t(REASONS.find((r) => r.k === x.ans).l)}</td></tr>`).join('')}</tbody></table></div>
            <button class="btn red" id="gNew">${t(L('New shift', 'وردية جديدة'))}</button></div>`;
          $('#gNew', el).onclick = reset; api.done(score); return;
        }
        el.innerHTML = `<div class="row" style="justify-content:space-between"><h3 style="margin:0">🚛 ${t(L('Truck', 'الشاحنة'))} ${i + 1} / ${g.trucks.length}</h3><span class="badge info">${t(L('Points', 'النقاط'))}: ${pts}</span></div>
          <div class="grid c2" style="margin-top:12px;align-items:start">
            <div><div class="truck-card">
              <div><div class="l">${t(L('Truck plate', 'لوحة الشاحنة'))}</div><div class="v">${tk.plate}</div></div>
              <div><div class="l">${t(L('Arrival time', 'وقت الوصول'))}</div><div class="v">${hh(tk.arrH)}</div></div>
              <div><div class="l">${t(L('Booking no.', 'رقم الحجز'))}</div><div class="v">${tk.bk}</div></div>
              <div><div class="l">${t(L('Container (OCR)', 'الحاوية (OCR)'))}</div><div class="v">${tk.cont}</div></div>
              <div><div class="l">${t(L('Size-type (OCR)', 'المقاس-النوع (OCR)'))}</div><div class="v">${tk.type}</div></div>
              <div><div class="l">VGM</div><div class="v">${tk.vgm ? TS.num(tk.vgm, 0) + ' kg' : '— ' + t(L('not received', 'غير مستلم'))}</div></div>
              <div><div class="l">${t(L('Seal on documents', 'الختم في المستندات'))}</div><div class="v">${tk.sealDoc}</div></div>
              <div><div class="l">${t(L('Seal on the box', 'الختم على الحاوية'))}</div><div class="v">${t(tk.sealSeen)}</div></div>
              <div><div class="l">DG</div><div class="v" style="font-family:var(--font)">${t(tk.dgDocs)}</div></div>
              <div><div class="l">${t(L('Reefer', 'المبرّدة'))}</div><div class="v" style="font-family:var(--font)">${t(tk.reefer)}</div></div>
            </div>
            <p class="muted" style="margin-top:8px">${t(L('Tip: verify the check digit with the ISO 6346 tool in Drills, or mentally compare with the booking list. Max gross 30,480 kg (45R1: 34,000 kg).', 'نصيحة: تحقّق من رقم التحقّق بأداة ISO 6346 في التمارين، وقارن مع قائمة الحجوزات. أقصى إجمالي 30,480 كغ (45R1: 34,000 كغ).'))}</p></div>
            <div><h4>${t(L('Bookings open in TOS', 'الحجوزات المفتوحة في النظام'))}</h4>${bookTable}
              <h4>${t(L('Your decision', 'قرارك'))}</h4>${REASONS.map((r) => `<label class="opt"><input type="radio" name="gr" value="${r.k}"><span>${t(r.l)}</span></label>`).join('')}
              <button class="btn red" id="gGo">${t(L('Confirm', 'تأكيد'))}</button><div id="gFb"></div></div>
          </div>`;
        $('#gGo', el).onclick = () => {
          const sel = el.querySelector('input[name=gr]:checked'); if (!sel) return;
          const ans = sel.value, f = tk.fault;
          let p = 0;
          const vgmMax = tk.type === '45R1' ? 34000 : 30480;
          const fOk = f === 'vgm' && tk.vgm && tk.vgm <= vgmMax ? 'ok' : f;
          if (ans === fOk) p = 10; else if (ans !== 'ok' && fOk !== 'ok') p = 5;
          pts += p; log.push({ cont: tk.cont, fault: fOk, ans, pts: p });
          const exp = {
            ok: L('All checks pass: booking exists, number valid, type matches, seal intact, VGM ≤ max, before cut-off.', 'كل الفحوصات سليمة: الحجز موجود، الرقم صحيح، النوع مطابق، الختم سليم، VGM ≤ الحدّ، قبل الإغلاق.'),
            digit: L(`Check digit of ${tk.cont.slice(0, 10)} is ${TS.REF.checkDigit(tk.cont.slice(0, 10))}, not ${tk.cont[10]}. Likely OCR/typing error — re-read the box physically.`, `رقم التحقّق لـ ${tk.cont.slice(0, 10)} هو ${TS.REF.checkDigit(tk.cont.slice(0, 10))} وليس ${tk.cont[10]}. غالبًا خطأ OCR/كتابة — أعد قراءة الحاوية فعليًا.`),
            booking: L('That booking number is not in the open bookings list.', 'رقم الحجز هذا غير موجود في قائمة الحجوزات المفتوحة.'),
            type: L('The OCR size-type differs from the booking — the line must amend the booking first.', 'المقاس-النوع في OCR يختلف عن الحجز — يجب على الخط تعديل الحجز أولًا.'),
            seal: L('Seal missing or different from documents: possible tampering — hold and inform shipper/line.', 'الختم مفقود أو مختلف عن المستندات: عبث محتمل — احجز وأبلغ الشاحن/الخط.'),
            vgm: L('No VGM or VGM above max gross: cannot be accepted for loading (SOLAS).', 'لا VGM أو VGM فوق الحدّ: لا يمكن قبولها للتحميل (SOLAS).'),
            cutoff: L('The truck arrived after the CY cut-off for that vessel.', 'وصلت الشاحنة بعد إغلاق الساحة لتلك السفينة.'),
            dg: L('DG cargo needs a DG declaration and placards on all four sides.', 'البضائع الخطرة تحتاج بيانًا وملصقات على الجوانب الأربعة.'),
            reefer: L('Reefer must arrive running at the booked setpoint.', 'يجب أن تصل المبرّدة وهي تعمل على درجة الضبط المحجوزة.'),
          };
          $('#gFb', el).innerHTML = `<div class="note ${p === 10 ? 'ok' : p ? 'warn' : 'bad'} fade-in"><strong>${p === 10 ? '✓ ' + t(L('Correct', 'صحيح')) : p ? t(L('Right decision, wrong reason', 'قرار صحيح وسبب خاطئ')) : '✗ ' + t(L('Wrong', 'خطأ'))}</strong>${t(exp[fOk])}<div style="margin-top:8px"><button class="btn sm primary" id="gNext">${t(L('Next truck', 'الشاحنة التالية'))} →</button></div></div>`;
          $('#gGo', el).disabled = true;
          $('#gNext', el).onclick = () => { i++; draw(); };
        };
      }
      reset();
    },
  });

  /* ================================================================= 4. DEPOT SURVEY */
  const DEPOT = [
    { f: L('Clean, dry, no odour, floor perfect, no rust, gaskets good.', 'نظيفة، جافة، بلا رائحة، الأرضية ممتازة، بلا صدأ، الجوانات جيدة.'), g: 'A', l: 'none', w: L('Perfect condition → food grade, no damage to charge.', 'حالة ممتازة ← صالحة للغذاء، لا ضرر للتحميل.') },
    { f: L('Two minor dents (< 2 cm) on right side, interior clean and dry.', 'انبعاجان بسيطان (< 2 سم) على الجانب الأيمن، الداخل نظيف وجاف.'), g: 'B', l: 'none', w: L('Cosmetic only, within IICL tolerance → general cargo.', 'شكلي فقط وضمن تسامح IICL ← بضائع عامة.') },
    { f: L('Forklift tine hole through the floor near the doors (8 cm).', 'ثقب شوكة رافعة شوكية في الأرضية قرب الأبواب (8 سم).'), g: 'DM', l: 'user', w: L('Handling damage during unloading → user pays the repair.', 'ضرر مناولة أثناء التفريغ ← المستخدم يدفع الإصلاح.') },
    { f: L('Roof heavily corroded with pinholes; box is 14 years old. Gate-out EIR noted “roof rust”.', 'السقف متآكل بشدة مع ثقوب دقيقة؛ عمر الحاوية 14 سنة. EIR الخروج سجّل “صدأ في السقف”.'), g: 'DM', l: 'owner', w: L('Age corrosion = wear & tear → owner.', 'تآكل بسبب العمر = استهلاك ← المالك.') },
    { f: L('Strong fish odour and cargo residue on the floor.', 'رائحة سمك قوية وبقايا بضاعة على الأرضية.'), g: 'DM', l: 'user', w: L('Needs chemical cleaning/deodorising → charged to user.', 'تحتاج تنظيفًا كيميائيًا/إزالة رائحة ← على المستخدم.') },
    { f: L('Sound and clean, but old DG placards and shipper labels left on doors.', 'سليمة ونظيفة، لكن ملصقات خطرة قديمة وملصقات الشاحن متروكة على الأبواب.'), g: 'B', l: 'user', w: L('Label removal is a user charge; after removal it is a general box.', 'إزالة الملصقات على المستخدم؛ وبعدها حاوية عامة.') },
    { f: L('Door gasket brittle and cracked from age; otherwise sound.', 'جوان الباب هشّ ومتشقّق بسبب العمر؛ والباقي سليم.'), g: 'DM', l: 'owner', w: L('Ageing gasket = wear & tear → owner; not watertight so not usable yet.', 'جوان متقادم = استهلاك ← المالك؛ غير محكم للماء فلا يُستخدم بعد.') },
    { f: L('20 cm cut in left side panel. Gate-out EIR (clean, with photos) shows no cut.', 'قطع 20 سم في اللوح الجانبي الأيسر. EIR الخروج (نظيف، مع صور) لا يُظهر قطعًا.'), g: 'DM', l: 'user', w: L('New damage during user custody, proven by EIR → user.', 'ضرر جديد أثناء عهدة المستخدم، مُثبت بـ EIR ← المستخدم.') },
    { f: L('20 cm cut in left side panel. Gate-out EIR already recorded this cut.', 'قطع 20 سم في اللوح الجانبي الأيسر. EIR الخروج سجّل هذا القطع مسبقًا.'), g: 'DM', l: 'owner', w: L('Pre-existing damage at gate-out → not the user’s liability.', 'ضرر موجود مسبقًا عند الخروج ← ليس على مسؤولية المستخدم.') },
    { f: L('Many scratches and surface rust, floor worn but solid, no holes, clean.', 'خدوش كثيرة وصدأ سطحي، الأرضية مستهلكة لكن صلبة، بلا ثقوب، نظيفة.'), g: 'C', l: 'none', w: L('Sound but worn → suitable for rough/heavy cargo.', 'سليمة لكن مستهلكة ← مناسبة للبضائع الخشنة/الثقيلة.') },
    { f: L('Nails, broken pallets and dunnage left inside; no damage.', 'مسامير وطبالي مكسورة وحشوات متروكة داخلها؛ بلا ضرر.'), g: 'B', l: 'user', w: L('Sweeping/cleaning charge to user, then general grade.', 'رسوم كنس/تنظيف على المستخدم، ثم درجة عامة.') },
    { f: L('Reefer: unit alarm codes, PTI expired, interior clean.', 'مبرّدة: رموز إنذار في الوحدة، PTI منتهٍ، الداخل نظيف.'), g: 'DM', l: 'owner', w: L('Machinery fault → owner M&R and new PTI before release.', 'عطل في الآلة ← صيانة على المالك وPTI جديد قبل الإطلاق.') },
  ];
  const GR = [{ k: 'A', l: L('A — food grade', 'A — صالحة للغذاء') }, { k: 'B', l: L('B — general', 'B — عامة') }, { k: 'C', l: L('C — rough cargo', 'C — بضائع خشنة') }, { k: 'DM', l: L('DM — damaged / needs work', 'DM — متضرّرة / تحتاج عملًا') }];
  const LI = [{ k: 'none', l: L('No charge', 'لا رسوم') }, { k: 'user', l: L('User (consignee/shipper)', 'المستخدم (المستورد/الشاحن)') }, { k: 'owner', l: L('Owner (wear & tear)', 'المالك (استهلاك)') }];
  add({
    id: 'depot', lvl: 4, icon: '🏭', title: L('Depot survey & grading', 'فحص وتصنيف المستودع'),
    desc: L('Survey 6 returned empties: decide the grade and who pays. Builds the judgement used in every damage dispute.', 'افحص 6 حاويات فارغة مُرجعة: حدّد الدرجة ومن يدفع. يبني الحسّ المطلوب في كل نزاع أضرار.'),
    mount(el, api) {
      let set, ans, checked;
      const reset = () => { set = PT.shuffle(DEPOT).slice(0, 6).map((d) => Object.assign({ no: PT.containerNo(P(['AOLU', 'BMSU', 'OSLU'])) }, d)); ans = {}; checked = false; draw(); };
      function draw() {
        el.innerHTML = `<div class="note">${t(L('For each container, choose grade and liability, then check. 5 points for the grade + 5 for liability.', 'لكل حاوية اختر الدرجة والمسؤولية ثم تحقّق. 5 نقاط للدرجة + 5 للمسؤولية.'))}</div>` +
          set.map((d, k) => {
            const a = ans[k] || {};
            const gCls = checked ? (a.g === d.g ? 'ok' : 'bad') : '', lCls = checked ? (a.l === d.l ? 'ok' : 'bad') : '';
            return `<div class="card"><div class="row" style="justify-content:space-between"><b class="mono">${d.no}</b><span class="badge">${t(L('Survey', 'فحص'))} #${k + 1}</span></div>
              <p style="margin:8px 0">🔍 ${t(d.f)}</p>
              <div class="grid c2"><div class="field"><label>${t(L('Grade', 'الدرجة'))} ${checked ? `<span class="badge ${gCls}">${gCls === 'ok' ? '✓' : '✗ ' + d.g}</span>` : ''}</label><select data-k="${k}" data-f="g"><option value="">—</option>${GR.map((g) => `<option value="${g.k}" ${a.g === g.k ? 'selected' : ''}>${t(g.l)}</option>`).join('')}</select></div>
              <div class="field"><label>${t(L('Who pays?', 'من يدفع؟'))} ${checked ? `<span class="badge ${lCls}">${lCls === 'ok' ? '✓' : '✗ ' + t(LI.find((x) => x.k === d.l).l)}</span>` : ''}</label><select data-k="${k}" data-f="l"><option value="">—</option>${LI.map((g) => `<option value="${g.k}" ${a.l === g.k ? 'selected' : ''}>${t(g.l)}</option>`).join('')}</select></div></div>
              ${checked ? `<div class="fbk">💡 ${t(d.w)}</div>` : ''}</div>`;
          }).join('') +
          `<div class="row"><button class="btn red" id="dChk" ${checked ? 'disabled' : ''}>${t(L('Check survey', 'تحقّق من الفحص'))}</button><button class="btn" id="dNew">${t(L('New batch', 'دفعة جديدة'))}</button><span id="dSc"></span></div>`;
        $$('select[data-k]', el).forEach((s) => (s.onchange = () => { (ans[s.dataset.k] = ans[s.dataset.k] || {})[s.dataset.f] = s.value; }));
        $('#dNew', el).onclick = reset;
        $('#dChk', el).onclick = () => {
          if (Object.keys(ans).length < set.length || set.some((_, k) => !ans[k] || !ans[k].g || !ans[k].l)) { TS.toast(t(L('Complete all surveys first', 'أكمل كل الفحوصات أولًا')), 'bad'); return; }
          checked = true;
          const pts = set.reduce((a, d, k) => a + (ans[k].g === d.g ? 5 : 0) + (ans[k].l === d.l ? 5 : 0), 0);
          const score = Math.round(pts / (set.length * 10) * 100);
          draw(); $('#dSc', el).innerHTML = `<b>${t(L('Score', 'النتيجة'))}: ${score}/100</b>`;
          api.done(score);
        };
      }
      reset();
    },
  });

  /* ================================================================= 5. CRANE SPLIT */
  function optimalSplit(w, k) {
    const nB = w.length, pre = [0]; w.forEach((x) => pre.push(pre[pre.length - 1] + x));
    const dp = Array.from({ length: k + 1 }, () => Array(nB + 1).fill(Infinity)); dp[0][0] = 0;
    for (let c = 1; c <= k; c++) for (let i = 1; i <= nB; i++) for (let j = c - 1; j < i; j++) dp[c][i] = Math.min(dp[c][i], Math.max(dp[c - 1][j], pre[i] - pre[j]));
    return dp[k][nB];
  }
  add({
    id: 'cranesplit', lvl: 2, icon: '⚙', title: L('Crane split optimiser', 'محسّن توزيع الرافعات'),
    desc: L('Split a vessel’s bays between STS cranes. The ship finishes when the longest crane finishes — balance the work.', 'وزّع خلجان السفينة على رافعات الرصيف. السفينة تنتهي عندما تنتهي الرافعة الأطول — وازن العمل.'),
    mount(el, api) {
      let bays, k, cuts, done;
      const reset = () => { const nb = R(9, 12); bays = Array.from({ length: nb }, (_, i) => ({ bay: String(2 + i * 4).padStart(2, '0'), m: R(4, 26) * 10 })); k = R(3, 4); cuts = new Set(); done = false; draw(); };
      function groups() { const gs = []; let cur = []; bays.forEach((b, i) => { cur.push(b); if (cuts.has(i) || i === bays.length - 1) { gs.push(cur); cur = []; } }); return gs; }
      function draw() {
        const gs = groups(), rate = 27;
        const loads = gs.map((g) => g.reduce((a, b) => a + b.m, 0)), mx = Math.max(...loads), tot = loads.reduce((a, b) => a + b, 0);
        const colors = ['#04246a', '#e30613', '#2f7d5b', '#c26a00', '#7b3fc4'];
        let gi = 0;
        el.innerHTML = `<div class="note">${t(L(`Total ${tot} moves, <b>${k} cranes</b> at ${rate} mph. Click the ✂ between bays to place exactly ${k - 1} split points (bow → stern). Each crane works a continuous group of bays.`, `المجموع ${tot} حركة، <b>${k} رافعات</b> بمعدّل ${rate}. انقر ✂ بين الخلجان لوضع ${k - 1} نقاط تقسيم بالضبط (من المقدّمة للمؤخّرة). كل رافعة تعمل على مجموعة خلجان متّصلة.`))}</div>
          <div class="bays" style="align-items:stretch">${bays.map((b, i) => { const c = colors[gi % 5]; const cell = `<div class="bay" style="border-top:4px solid ${c}">${t(L('Bay', 'خليج'))}<b>${b.bay}</b>${b.m}</div>`; const cut = i < bays.length - 1 ? `<button class="btn sm ${cuts.has(i) ? 'red' : 'ghost'}" data-cut="${i}" style="padding:4px 6px" title="split">✂</button>` : ''; if (cuts.has(i)) gi++; return cell + cut; }).join('')}</div>
          <h4 style="margin-top:16px">${t(L('Crane workload', 'حمل عمل الرافعات'))} (${gs.length} ${t(L('groups', 'مجموعات'))})</h4>
          <div class="crane-bars">${loads.map((l, j) => `<div class="cbar ${l === mx ? 'long' : ''}"><span>QC${j + 1} <small>${gs[j][0].bay}–${gs[j][gs[j].length - 1].bay}</small></span><div class="b" style="width:${l / mx * 100}%;background:${l === mx ? 'var(--red)' : colors[j % 5]}"></div><span class="num">${l} · ${n(l / rate)}h</span></div>`).join('')}</div>
          <p>${t(L('Vessel working time', 'زمن عمل السفينة'))}: <b>${n(mx / rate)} h</b> · ${t(L('ideal', 'المثالي'))} ${n(tot / k / rate)} h</p>
          <div class="row"><button class="btn red" id="cSub" ${gs.length !== k ? 'disabled' : ''}>${t(L('Submit split', 'قدّم التوزيع'))}</button><button class="btn" id="cNew">${t(L('New vessel', 'سفينة جديدة'))}</button>${gs.length !== k ? `<span class="badge warn">${t(L(`Need ${k} groups`, `تحتاج ${k} مجموعات`))}</span>` : ''}</div><div id="cOut"></div>`;
        $$('[data-cut]', el).forEach((b) => (b.onclick = () => { const i = Number(b.dataset.cut); if (cuts.has(i)) cuts.delete(i); else cuts.add(i); draw(); }));
        $('#cNew', el).onclick = reset;
        $('#cSub', el).onclick = () => {
          const opt = optimalSplit(bays.map((b) => b.m), k), score = Math.round(opt / mx * 100);
          $('#cOut', el).innerHTML = `<div class="card fade-in" style="margin-top:12px"><div class="grid c3"><div class="tile"><div class="k">${t(L('Your long crane', 'رافعتك الطويلة'))}</div><div class="v">${mx}</div></div><div class="tile"><div class="k">${t(L('Best possible', 'الأفضل الممكن'))}</div><div class="v">${opt}</div></div><div class="tile red"><div class="k">${t(L('Score', 'النتيجة'))}</div><div class="v">${score}</div></div></div>
            <p class="muted">${t(L(`Best split finishes in ${n(opt / rate)} h vs yours ${n(mx / rate)} h.`, `أفضل توزيع ينتهي خلال ${n(opt / rate)} ساعة مقابل ${n(mx / rate)} ساعة لتوزيعك.`))}</p></div>`;
          if (!done) { done = true; api.done(score); }
        };
      }
      reset();
    },
  });

  /* ================================================================= 6. CONTROL ROOM — 24 h shift */
  const EV = (h, t0, o) => ({ h, t: t0, o });
  const D = (s, p, c, b) => ({ s, p, c, b });
  PT.events = [
    EV('06:10', L('Lashing foreman: one lasher has no harness for work on deck tier 86. Vessel is 20 min behind.', 'رئيس التثبيت: عامل تثبيت بلا حزام أمان للعمل على طبقة السطح 86. السفينة متأخّرة 20 دقيقة.'), [
      { l: L('Stop that task until a harness is provided.', 'أوقف تلك المهمة حتى يتوفّر الحزام.'), d: D(10, -3, 0, 0), f: L('Right. 10 minutes lost, a life protected.', 'صحيح. 10 دقائق ضائعة وحياة محمية.') },
      { l: L('Let him work carefully, just this once.', 'دعه يعمل بحذر، هذه المرة فقط.'), d: D(-25, 3, 0, 0), f: L('Falls from height are a top fatal cause. Never.', 'السقوط من ارتفاع من أكثر أسباب الوفاة. أبدًا.') },
      { l: L('Swap him with a lasher who has full PPE.', 'استبدله بعامل لديه معدّات وقاية كاملة.'), d: D(8, 0, 0, 0), f: L('Good — safe and fast.', 'جيد — آمن وسريع.') } ]),
    EV('07:30', L('Gate queue reaching the main road; 2 lanes closed (staff late).', 'طابور البوابة يصل للطريق الرئيسي؛ مساران مغلقان (تأخّر الموظّفين).'), [
      { l: L('Move 2 trained office staff to open the lanes now.', 'انقل موظّفَين مدرّبَين من المكتب لفتح المسارين الآن.'), d: D(0, 2, 8, -2), f: L('Fast capacity, small cost.', 'طاقة سريعة بتكلفة صغيرة.') },
      { l: L('Wait for the late clerks.', 'انتظر الموظّفين المتأخّرين.'), d: D(-3, 0, -10, 0), f: L('Police and hauliers will call you.', 'ستتّصل بك الشرطة وشركات النقل.') },
      { l: L('Close the gate for 1 hour.', 'أغلق البوابة ساعة.'), d: D(0, 0, -15, 0), f: L('Makes the queue worse.', 'يزيد الطابور سوءًا.') } ]),
    EV('09:00', L('Line asks to add 2 cranes to its vessel (window) to make up time. You have 1 spare crane, but its driver would need overtime.', 'الخط يطلب إضافة رافعتين لسفينته (نافذة) لتعويض الوقت. لديك رافعة واحدة متاحة لكن سائقها يحتاج عملًا إضافيًا.'), [
      { l: L('Add the 1 spare crane with overtime, explain the second is not available.', 'أضف الرافعة المتاحة بعمل إضافي، واشرح أن الثانية غير متوفّرة.'), d: D(0, 8, 8, -5), f: L('Honest and helpful.', 'صادق ومفيد.') },
      { l: L('Promise 2 cranes and hope.', 'اعدهم برافعتين وأمل.'), d: D(0, 2, -10, -2), f: L('Broken promises cost trust.', 'الوعود المكسورة تكلّف الثقة.') },
      { l: L('Refuse — the plan is the plan.', 'ارفض — الخطة هي الخطة.'), d: D(0, -4, -6, 3), f: L('Saves money, loses the customer’s goodwill on a window ship.', 'يوفّر المال ويخسر حسن نية العميل على سفينة نافذة.') } ]),
    EV('10:40', L('Reefer round: 3 reefers unplugged since discharge 3 h ago (frozen meat at −14 °C, setpoint −18 °C).', 'جولة المبرّدات: 3 مبرّدات غير موصولة منذ التفريغ قبل 3 ساعات (لحم مجمّد عند −14 °م، الضبط −18 °م).'), [
      { l: L('Plug in immediately, log times/temps, inform the line, find why they were missed.', 'وصّلها فورًا، سجّل الأوقات/الحرارة، أبلغ الخط، وابحث لماذا فاتت.'), d: D(3, 0, 6, -2), f: L('Transparent and fixes the process.', 'شفّاف ويصلح العملية.') },
      { l: L('Plug in and say nothing.', 'وصّلها ولا تقل شيئًا.'), d: D(0, 0, -12, 0), f: L('Data loggers will reveal it; claim + lost trust.', 'مسجّلات البيانات ستكشفها؛ مطالبة + فقدان ثقة.') },
      { l: L('Lower setpoint to −25 °C to catch up.', 'خفّض الضبط إلى −25 °م للتعويض.'), d: D(0, 0, -8, 0), f: L('Never change setpoints without line instruction.', 'لا تغيّر الضبط أبدًا دون تعليمات الخط.') } ]),
    EV('12:15', L('RTG 14 hydraulic leak in block A; 2 export vessels loading from that block this afternoon.', 'تسرّب هيدروليكي في RTG 14 في الكتلة A؛ سفينتا تصدير تحمّلان من تلك الكتلة بعد الظهر.'), [
      { l: L('Stop RTG 14, spill kit, move RTG 20 from housekeeping to block A.', 'أوقف RTG 14، استخدم عدّة التسرّب، انقل RTG 20 من الترتيب إلى الكتلة A.'), d: D(6, 4, 2, -2), f: L('Safety + environment + productivity protected.', 'السلامة + البيئة + الإنتاجية محمية.') },
      { l: L('Keep working until the vessel finishes.', 'تابع العمل حتى تنتهي السفينة.'), d: D(-10, 3, 0, -6), f: L('Oil on the yard, machine damage, slip hazard.', 'زيت على الساحة، ضرر للآلة، خطر انزلاق.') } ]),
    EV('13:30', L('Customs wants to inspect 25 boxes tomorrow 08:00 — all in the middle of import stacks.', 'الجمارك تريد معاينة 25 حاوية غدًا 08:00 — كلها وسط رصّات الاستيراد.'), [
      { l: L('Pre-marshal them tonight to the inspection area during low activity.', 'رتّبها مسبقًا الليلة إلى منطقة المعاينة أثناء النشاط المنخفض.'), d: D(0, 5, 6, -2), f: L('Classic senior move: night housekeeping.', 'خطوة المحترف الكلاسيكية: الترتيب الليلي.') },
      { l: L('Dig them out tomorrow at 08:00.', 'استخرجها غدًا الساعة 08:00.'), d: D(0, -6, -3, 0), f: L('RTGs busy at peak; gate suffers.', 'رافعات RTG مشغولة في الذروة؛ والبوابة تعاني.') } ]),
    EV('15:00', L('Wind forecast: gusts 42 kn from 19:00.', 'توقّع الرياح: هبّات 42 عقدة من 19:00.'), [
      { l: L('Inform lines, plan crane parking & storm pins by 18:30, lower empty stacks.', 'أبلغ الخطوط، خطّط ركن الرافعات وأوتاد العاصفة بحلول 18:30، خفّض رصّات الفارغ.'), d: D(10, -3, 4, -2), f: L('Act on the forecast.', 'تصرّف بناءً على التوقّع.') },
      { l: L('Work until wind alarms sound.', 'اعمل حتى تنطلق إنذارات الرياح.'), d: D(-15, 3, 0, 0), f: L('Securing in gusts is dangerous.', 'التأمين في الهبّات خطير.') } ]),
    EV('16:45', L('A trucker shouts at a gate clerk and threatens him over a rejected box (no VGM).', 'سائق شاحنة يصرخ على موظّف البوابة ويهدّده بسبب حاوية مرفوضة (لا VGM).'), [
      { l: L('Support the clerk, call security, explain the SOLAS rule calmly, log the incident.', 'ادعم الموظّف، استدعِ الأمن، اشرح قاعدة SOLAS بهدوء، وسجّل الحادث.'), d: D(5, 0, 2, 0), f: L('Protect your people and the rule.', 'احمِ موظّفيك والقاعدة.') },
      { l: L('Let the box in to calm things down.', 'أدخل الحاوية لتهدئة الأمور.'), d: D(-6, 0, -4, 0), f: L('Rewards aggression; SOLAS breach.', 'يكافئ العدوانية؛ خرق لـ SOLAS.') } ]),
    EV('18:20', L('Planner finds a box with an active customs hold on tonight’s load list, already in the crane sequence.', 'المخطّط يجد حاوية عليها حجز جمركي نشط في قائمة تحميل الليلة، وموجودة في تسلسل الرافعة.'), [
      { l: L('Remove it from the sequence, inform the line it will be short-shipped unless released.', 'أزلها من التسلسل، وأبلغ الخط أنها لن تُشحن ما لم يُفرج عنها.'), d: D(4, 0, 4, 0), f: L('Compliance first.', 'الامتثال أولًا.') },
      { l: L('Load it — release will come.', 'حمّلها — الإفراج سيأتي.'), d: D(-12, 2, -8, -10), f: L('Legal violation, possible fines.', 'مخالفة قانونية، غرامات محتملة.') } ]),
    EV('20:10', L('QC3 spreader failure; spare spreader in the workshop. Engineering says 90 min to swap.', 'عطل في أداة رفع QC3؛ أداة احتياطية في الورشة. الهندسة تقول 90 دقيقة للاستبدال.'), [
      { l: L('Swap now, re-split the vessel across the other cranes, update the line with new ETC.', 'استبدلها الآن، أعد توزيع السفينة على الرافعات الأخرى، وحدّث الخط بموعد الانتهاء الجديد.'), d: D(0, 6, 6, -2), f: L('Minimises lost time and keeps the customer informed.', 'يقلّل الوقت الضائع ويبقي العميل مطّلعًا.') },
      { l: L('Leave QC3 idle until morning shift.', 'اترك QC3 متوقفة حتى وردية الصباح.'), d: D(0, -10, -6, 2), f: L('Long crane gets longer.', 'الرافعة الطويلة تصبح أطول.') } ]),
    EV('22:30', L('Tractor driver reports a near miss: a pedestrian walked through the RTG lane in block B.', 'سائق جرّار يبلّغ عن حادث وشيك: شخص مشى عبر مسار RTG في الكتلة B.'), [
      { l: L('Thank the driver, log a near-miss, identify the person/contractor, brief all crews tonight.', 'اشكر السائق، سجّل حادثًا وشيكًا، حدّد الشخص/المقاول، وأبلغ كل الطواقم الليلة.'), d: D(10, -1, 0, 0), f: L('Near misses are free lessons.', 'الحوادث الوشيكة دروس مجانية.') },
      { l: L('Nothing happened, move on.', 'لم يحدث شيء، تابع.'), d: D(-12, 0, 0, 0), f: L('Next time something will happen.', 'في المرة القادمة سيحدث شيء.') } ]),
    EV('01:15', L('Yard utilisation forecast for tomorrow 18:00: 88% (two mainliners discharging).', 'توقّع استخدام الساحة غدًا 18:00: 88% (سفينتان رئيسيتان تفرّغان).'), [
      { l: L('Order night empty evacuation to the depot and plan an overflow area.', 'اطلب إخلاءً ليليًا للفارغ إلى المستودع وخطّط منطقة فائض.'), d: D(0, 6, 3, -4), f: L('Leading indicator → early action.', 'مؤشر استباقي ← إجراء مبكر.') },
      { l: L('Deal with it tomorrow.', 'تعامل معه غدًا.'), d: D(-2, -8, -4, 0), f: L('Tomorrow it is congestion.', 'غدًا سيكون ازدحامًا.') } ]),
    EV('03:40', L('Night shift productivity is 18 mph vs 26 target. Drivers say tractors are slow to arrive.', 'إنتاجية وردية الليل 18 حركة/ساعة مقابل هدف 26. السائقون يقولون إن الجرّارات تتأخّر.'), [
      { l: L('Check tractor allocation per crane and yard distance; add 2 tractors from housekeeping.', 'افحص توزيع الجرّارات لكل رافعة ومسافة الساحة؛ أضف جرّارين من الترتيب.'), d: D(0, 8, 2, -2), f: L('Find the bottleneck in the chain.', 'ابحث عن عنق الزجاجة في السلسلة.') },
      { l: L('Shout at the crane drivers on the radio.', 'اصرخ على سائقي الرافعات عبر اللاسلكي.'), d: D(-3, -2, 0, 0), f: L('Wrong cause, worse morale.', 'سبب خاطئ ومعنويات أسوأ.') } ]),
    EV('05:30', L('Shift handover in 30 minutes. You are tired and want to leave on time.', 'تسليم الوردية بعد 30 دقيقة. أنت متعب وتريد المغادرة في الوقت.'), [
      { l: L('Write a structured handover (vessels, yard, equipment, safety, people, promises) and brief the next manager face to face.', 'اكتب تسليمًا منظّمًا (السفن، الساحة، المعدّات، السلامة، الأشخاص، الوعود) وأطلع المدير التالي وجهًا لوجه.'), d: D(4, 5, 4, 0), f: L('The next shift starts informed.', 'الوردية التالية تبدأ وهي على اطّلاع.') },
      { l: L('Send a 2-line message and leave.', 'أرسل رسالة من سطرين وغادر.'), d: D(-4, -6, -4, 0), f: L('Problems get lost between shifts.', 'المشاكل تضيع بين الورديات.') } ]),
  ];

  add({
    id: 'control', lvl: 5, icon: '🛡', title: L('Control room — 24 h shift', 'غرفة التحكّم — وردية 24 ساعة'),
    desc: L('You are Duty Manager for 24 hours. 9 events arrive; each decision moves four meters: Safety, Productivity, Customers, Budget. Keep all four healthy.', 'أنت المدير المناوب لمدة 24 ساعة. تصل 9 أحداث؛ وكل قرار يحرّك أربعة مؤشرات: السلامة، الإنتاجية، العملاء، الميزانية. حافظ على الأربعة سليمة.'),
    mount(el, api) {
      let evs, i, m, last, hist;
      const reset = () => {
        const pool = PT.events.slice(); const keep = [pool[0], pool[pool.length - 1]];
        evs = PT.shuffle(pool.slice(1, -1)).slice(0, 7).concat(keep).sort((a, b) => { const k = (h) => { const x = Number(h.slice(0, 2)); return x < 6 ? x + 24 : x; }; return k(a.h) - k(b.h); });
        i = 0; m = { s: 70, p: 70, c: 70, b: 70 }; last = null; hist = []; draw();
      };
      const meter = (k, lbl) => `<div class="meter ${m[k] < 40 ? 'low' : ''}"><div class="k"><span>${t(lbl)}</span><b>${m[k]}</b></div><div class="bar"><i style="width:${m[k]}%"></i></div></div>`;
      function draw() {
        const head = `<div class="meters">${meter('s', L('🦺 Safety', '🦺 السلامة'))}${meter('p', L('⚙ Productivity', '⚙ الإنتاجية'))}${meter('c', L('🤝 Customers', '🤝 العملاء'))}${meter('b', L('💰 Budget', '💰 الميزانية'))}</div>`;
        const ev = evs[i];
        if (!ev) {
          const score = Math.round((m.s * 2 + m.p + m.c + m.b) / 5);
          const fail = m.s < 40;
          el.innerHTML = head + `<div class="card fade-in" style="margin-top:16px"><h3>${t(L('End of shift report', 'تقرير نهاية الوردية'))}</h3>
            <div class="score-big">${fail ? Math.min(score, 30) : score}</div><p>${fail ? `<span class="badge bad">${t(L('Shift failed: safety below 40', 'فشلت الوردية: السلامة تحت 40'))}</span>` : `<span class="badge ok">${t(L('Shift completed', 'اكتملت الوردية'))}</span>`} <small class="muted">${t(L('(safety counts double)', '(السلامة تُحسب مضاعفة)'))}</small></p>
            <ul class="timeline">${hist.map((h) => `<li class="${h.good ? 'done' : 'late'}"><b>${h.h}</b> — ${t(h.l)}<br><small>${t(h.f)}</small></li>`).join('')}</ul>
            <button class="btn red" id="crNew">${t(L('Start a new shift', 'ابدأ وردية جديدة'))}</button></div>`;
          $('#crNew', el).onclick = reset; api.done(fail ? Math.min(score, 30) : score); return;
        }
        el.innerHTML = head + `<div class="card fade-in" style="margin-top:16px"><div class="row" style="justify-content:space-between"><span class="badge info">🕐 ${ev.h}</span><span class="muted">${t(L('Event', 'حدث'))} ${i + 1}/${evs.length}</span></div>
          <div class="radio-msg">📻 ${esc(t(ev.t))}</div>
          ${PT.shuffle(ev.o.map((o, k) => ({ o, k }))).map(({ o, k }) => `<button class="opt" style="width:100%;text-align:start;font:inherit" data-o="${k}">${t(o.l)}</button>`).join('')}
          ${last ? `<div class="note ${last.good ? 'ok' : 'bad'}" style="margin-top:12px"><strong>${t(L('Previous decision', 'القرار السابق'))}</strong>${t(last.f)}</div>` : ''}</div>`;
        $$('[data-o]', el).forEach((b) => (b.onclick = () => {
          const o = ev.o[Number(b.dataset.o)];
          Object.keys(m).forEach((k) => { m[k] = Math.max(0, Math.min(100, m[k] + o.d[k])); });
          const good = o.d.s >= 0 && (o.d.s + o.d.p + o.d.c + o.d.b) > 0;
          last = { f: o.f, good }; hist.push({ h: ev.h, l: o.l, f: o.f, good }); i++; draw();
        }));
      }
      reset();
    },
  });
})();
