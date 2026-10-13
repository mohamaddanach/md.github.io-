/* Port Master Academy — unlimited calculation drills (random parameters, step-by-step solutions) */
(function () {
  const L = TS.L;
  const R = PT.rnd, P = PT.pick, r1 = PT.r1, r2 = PT.r2;
  const n = (x, d) => TS.num(x, d == null ? 2 : d);
  const add = (x) => PT.drills.push(x);

  add({ id: 'teu', lvl: 1, icon: '📦', title: L('TEU & moves', 'TEU والحركات'), gen() {
    const a = R(80, 900), b = R(60, 800), c = R(0, 40);
    const teu = a + 2 * b + 2.25 * c;
    return { q: L(`A vessel discharges ${a} × 20′, ${b} × 40′ and ${c} × 45′ containers. How many TEU? (45′ = 2.25 TEU)`, `سفينة تفرّغ ${a} × 20′ و${b} × 40′ و${c} × 45′. كم TEU؟ (45′ = 2.25 TEU)`), a: teu, tol: 0.01, unit: 'TEU',
      sol: L(`${a} × 1 + ${b} × 2 + ${c} × 2.25 = ${n(teu)} TEU\nMoves = ${a + b + c} → TEU factor = ${n(teu / (a + b + c))}`, `${a} × 1 + ${b} × 2 + ${c} × 2.25 = ${n(teu)} TEU\nالحركات = ${a + b + c} ← معامل TEU = ${n(teu / (a + b + c))}`) };
  } });

  add({ id: 'checkdigit', lvl: 1, icon: '🔢', title: L('ISO 6346 check digit', 'رقم التحقّق ISO 6346'), gen() {
    const full = PT.containerNo(); const base = full.slice(0, 10);
    const map = {}; let v = 10; for (let c = 65; c <= 90; c++) { if (v % 11 === 0) v++; map[String.fromCharCode(c)] = v; v++; }
    let sum = 0; const parts = [];
    for (let i = 0; i < 10; i++) { const ch = base[i]; const val = /\d/.test(ch) ? Number(ch) : map[ch]; sum += val * Math.pow(2, i); parts.push(`${ch}(${val})×${Math.pow(2, i)}`); }
    const d = Number(full[10]);
    return { q: L(`Compute the check digit of container <b class="mono">${base}</b>.`, `احسب رقم التحقّق للحاوية <b class="mono">${base}</b>.`), a: d, tol: 0, unit: '',
      sol: L(`Letter values: A=10, B=12, C=13 … (skip 11, 22, 33).\n${parts.join(' + ')}\n= ${sum}\n${sum} mod 11 = ${sum % 11}${sum % 11 === 10 ? ' → 0' : ''}\nCheck digit = ${d} → ${full}`, `قيم الحروف: A=10، B=12، C=13 … (تخطَّ 11، 22، 33).\n${parts.join(' + ')}\n= ${sum}\n${sum} mod 11 = ${sum % 11}${sum % 11 === 10 ? ' ← 0' : ''}\nرقم التحقّق = ${d} ← ${full}`) };
  } });

  add({ id: 'payload', lvl: 1, icon: '⚖', title: L('VGM & payload', 'VGM والحمولة'), gen() {
    const t = P([{ c: '22G1', tare: 2200 }, { c: '42G1', tare: 3750 }, { c: '45G1', tare: 3900 }]);
    const cargo = R(8, 24) * 1000 + R(0, 9) * 100, pack = R(2, 9) * 50;
    const vgm = cargo + pack + t.tare;
    return { q: L(`A ${t.c} (tare ${n(t.tare, 0)} kg) is stuffed with ${n(cargo, 0)} kg of cargo and ${pack} kg of pallets/dunnage. What is the VGM in kg?`, `حاوية ${t.c} (وزن فارغ ${n(t.tare, 0)} كغ) عُبّئت بـ ${n(cargo, 0)} كغ بضاعة و${pack} كغ طبالي/حشوات. ما VGM بالكغ؟`), a: vgm, tol: 1, unit: 'kg',
      sol: L(`VGM = cargo + packing + tare = ${n(cargo, 0)} + ${pack} + ${n(t.tare, 0)} = ${n(vgm, 0)} kg\nMax gross 30,480 kg → ${vgm <= 30480 ? 'OK' : 'OVERWEIGHT — reject'}`, `VGM = البضاعة + التغليف + الوزن الفارغ = ${n(cargo, 0)} + ${pack} + ${n(t.tare, 0)} = ${n(vgm, 0)} كغ\nأقصى إجمالي 30,480 كغ ← ${vgm <= 30480 ? 'مقبول' : 'زائد الوزن — يُرفض'}`) };
  } });

  add({ id: 'worktime', lvl: 2, icon: '⏱', title: L('Vessel working time', 'زمن عمل السفينة'), gen() {
    const m = R(8, 40) * 50, c = R(2, 5), rate = R(22, 32);
    const h = m / (c * rate);
    return { q: L(`${n(m, 0)} moves, ${c} STS cranes at ${rate} moves/hour each, perfectly balanced. Working time in hours (1 decimal)?`, `${n(m, 0)} حركة، ${c} رافعات رصيف بمعدّل ${rate} حركة/ساعة لكلّ منها، بتوازن تام. زمن العمل بالساعات (رقم عشري واحد)؟`), a: r1(h), tol: 0.1, unit: L('h', 'ساعة'),
      sol: L(`Time = moves ÷ (cranes × rate) = ${m} ÷ (${c} × ${rate}) = ${m} ÷ ${c * rate} = ${n(h, 1)} h`, `الزمن = الحركات ÷ (الرافعات × المعدّل) = ${m} ÷ (${c} × ${rate}) = ${m} ÷ ${c * rate} = ${n(h, 1)} ساعة`) };
  } });

  add({ id: 'longcrane', lvl: 2, icon: '🏗', title: L('Long crane', 'الرافعة الطويلة'), gen() {
    const k = R(3, 4), w = Array.from({ length: k }, () => R(18, 60) * 10), rate = R(24, 30);
    const mx = Math.max(...w), tot = w.reduce((a, b) => a + b, 0);
    return { q: L(`Crane split: ${w.map((x, i) => 'QC' + (i + 1) + ' = ' + x).join(', ')} moves. Rate ${rate} mph. Vessel working time in hours (1 decimal)?`, `توزيع الرافعات: ${w.map((x, i) => 'QC' + (i + 1) + ' = ' + x).join('، ')} حركة. المعدّل ${rate}. زمن عمل السفينة بالساعات (رقم عشري واحد)؟`), a: r1(mx / rate), tol: 0.1, unit: L('h', 'ساعة'),
      sol: L(`The vessel finishes with the longest crane: ${mx} ÷ ${rate} = ${n(mx / rate, 1)} h\nIdeal (balanced) = ${tot} ÷ (${k} × ${rate}) = ${n(tot / (k * rate), 1)} h → split efficiency ${n((tot / k) / mx * 100, 0)}%`, `تنتهي السفينة مع الرافعة الأطول: ${mx} ÷ ${rate} = ${n(mx / rate, 1)} ساعة\nالمثالي (متوازن) = ${tot} ÷ (${k} × ${rate}) = ${n(tot / (k * rate), 1)} ساعة ← كفاءة التوزيع ${n((tot / k) / mx * 100, 0)}%`) };
  } });

  add({ id: 'gmph', lvl: 2, icon: '📈', title: L('GMPH / BMPH', 'GMPH / BMPH'), gen() {
    const moves = R(12, 40) * 50, fl = R(14, 30), extra = R(2, 4);
    const which = P(['g', 'b']);
    const h = which === 'g' ? fl : fl + extra;
    return { q: which === 'g'
      ? L(`Vessel: ${moves} moves, first move 00:00, last move ${PT.hhmm(fl)}. GMPH (1 decimal)?`, `السفينة: ${moves} حركة، أول حركة 00:00، آخر حركة ${PT.hhmm(fl)}. GMPH (رقم عشري واحد)؟`)
      : L(`Vessel: ${moves} moves. All fast to unmoored = ${fl + extra} h (first-to-last move ${fl} h). BMPH (1 decimal)?`, `السفينة: ${moves} حركة. من الربط الكامل حتى فكّ الربط = ${fl + extra} ساعة (من أول لآخر حركة ${fl} ساعة). BMPH (رقم عشري واحد)؟`),
      a: r1(moves / h), tol: 0.1, unit: 'mph',
      sol: L(`${which === 'g' ? 'GMPH = moves ÷ first-to-last-move hours' : 'BMPH = moves ÷ berth hours (all fast → unmoored)'} = ${moves} ÷ ${h} = ${n(moves / h, 1)}`, `${which === 'g' ? 'GMPH = الحركات ÷ ساعات أول-آخر حركة' : 'BMPH = الحركات ÷ ساعات الرصيف (الربط ← الفكّ)'} = ${moves} ÷ ${h} = ${n(moves / h, 1)}`) };
  } });

  add({ id: 'occupancy', lvl: 2, icon: '🗓', title: L('Berth occupancy', 'إشغال الرصيف'), gen() {
    const b = R(2, 4), days = P([7, 14, 30]), hrs = b * days * 24, used = Math.round(hrs * (R(45, 85) / 100));
    return { q: L(`${b} berths over ${days} days. Vessels occupied a total of ${n(used, 0)} berth-hours. Berth occupancy % (1 decimal)?`, `${b} أرصفة خلال ${days} يومًا. شغلت السفن ما مجموعه ${n(used, 0)} ساعة-رصيف. نسبة الإشغال % (رقم عشري واحد)؟`), a: r1(used / hrs * 100), tol: 0.1, unit: '%',
      sol: L(`Available = ${b} × ${days} × 24 = ${n(hrs, 0)} h\nOccupancy = ${used} ÷ ${hrs} × 100 = ${n(used / hrs * 100, 1)}%${used / hrs > 0.7 ? '\n⚠ Above ~70%: expect rising waiting times.' : ''}`, `المتاح = ${b} × ${days} × 24 = ${n(hrs, 0)} ساعة\nالإشغال = ${used} ÷ ${hrs} × 100 = ${n(used / hrs * 100, 1)}%${used / hrs > 0.7 ? '\n⚠ فوق ~70%: توقّع ارتفاع أوقات الانتظار.' : ''}`) };
  } });

  add({ id: 'ukc', lvl: 2, icon: '🌊', title: L('Under-keel clearance', 'عمق الأمان UKC'), gen() {
    const depth = r1(R(130, 165) / 10), tide = r1(R(0, 8) / 10), draft = r1(depth - R(2, 14) / 10 + tide - 0.2), v = R(5, 10), cb = P([0.6, 0.65, 0.7]);
    const squat = r2(cb * v * v / 100), ukc = r2(depth + tide - draft - squat);
    return { q: L(`Channel ${depth} m below CD, tide +${tide} m, draft ${draft} m, speed ${v} kn, Cb ${cb}. Dynamic UKC in metres (2 decimals)? Squat ≈ Cb × V² / 100.`, `القناة ${depth} م تحت مستوى الخريطة، المد +${tide} م، الغاطس ${draft} م، السرعة ${v} عقدة، Cb = ${cb}. UKC الديناميكي بالأمتار (رقمان عشريان)؟ الهبوط ≈ Cb × V² / 100.`), a: ukc, tol: 0.02, unit: 'm',
      sol: L(`Squat = ${cb} × ${v}² / 100 = ${n(squat)} m\nUKC = ${depth} + ${tide} − ${draft} − ${n(squat)} = ${n(ukc)} m\nPolicy 10% of draft = ${n(draft * 0.1)} m → ${ukc >= draft * 0.1 ? 'OK' : 'NOT OK — reduce speed / wait for tide / reduce draft'}`, `الهبوط = ${cb} × ${v}² / 100 = ${n(squat)} م\nUKC = ${depth} + ${tide} − ${draft} − ${n(squat)} = ${n(ukc)} م\nالسياسة 10% من الغاطس = ${n(draft * 0.1)} م ← ${ukc >= draft * 0.1 ? 'مقبول' : 'غير مقبول — خفّض السرعة / انتظر المد / خفّض الغاطس'}`) };
  } });

  add({ id: 'cranesneeded', lvl: 2, icon: '🧮', title: L('Cranes needed for a window', 'الرافعات اللازمة لنافذة'), gen() {
    const m = R(16, 60) * 50, win = R(16, 30), marine = 3, rate = R(24, 30);
    const need = Math.ceil(m / ((win - marine) * rate));
    return { q: L(`${m} moves; berth window ${win} h including ${marine} h for berthing/lashing/unberthing. Crane rate ${rate} mph. Minimum number of cranes?`, `${m} حركة؛ نافذة الرصيف ${win} ساعة تشمل ${marine} ساعات للرسو/التثبيت/المغادرة. معدّل الرافعة ${rate}. أقل عدد رافعات؟`), a: need, tol: 0, unit: L('cranes', 'رافعات'),
      sol: L(`Working hours = ${win} − ${marine} = ${win - marine} h\nCranes = ${m} ÷ (${win - marine} × ${rate}) = ${n(m / ((win - marine) * rate))} → round UP = ${need}`, `ساعات العمل = ${win} − ${marine} = ${win - marine} ساعة\nالرافعات = ${m} ÷ (${win - marine} × ${rate}) = ${n(m / ((win - marine) * rate))} ← تقريب للأعلى = ${need}`) };
  } });

  add({ id: 'turnaround', lvl: 2, icon: '🔁', title: L('Ship turnaround time', 'زمن دوران السفينة'), gen() {
    const arr = R(0, 10), wait = R(0, 12), stay = R(10, 36);
    const atb = arr + wait, atd = atb + stay;
    return { q: L(`Arrived at anchorage ${PT.hhmm(arr)}, all fast ${PT.hhmm(atb)}, departed ${PT.hhmm(atd)}. Total turnaround time in hours?`, `وصلت للمخطاف ${PT.hhmm(arr)}، الربط الكامل ${PT.hhmm(atb)}، المغادرة ${PT.hhmm(atd)}. زمن الدوران الكلي بالساعات؟`), a: wait + stay, tol: 0.01, unit: L('h', 'ساعة'),
      sol: L(`Waiting = ${wait} h, port stay (ATD − ATB) = ${stay} h\nTurnaround = ${wait} + ${stay} = ${wait + stay} h`, `الانتظار = ${wait} ساعة، البقاء على الرصيف = ${stay} ساعة\nزمن الدوران = ${wait} + ${stay} = ${wait + stay} ساعة`) };
  } });

  add({ id: 'yardcap', lvl: 3, icon: '🧱', title: L('Yard capacity', 'سعة الساحة'), gen() {
    const tgs = R(20, 60) * 10, h = R(3, 6), u = P([0.65, 0.7, 0.75, 0.8]);
    return { q: L(`Block with ${tgs} ground slots (TEU), stacking ${h} high, utilisation factor ${u}. Working capacity in TEU?`, `كتلة بـ ${tgs} خانة أرضية (TEU)، الرصّ ${h} طبقات، معامل الاستخدام ${u}. السعة التشغيلية بالـ TEU؟`), a: tgs * h * u, tol: 0.5, unit: 'TEU',
      sol: L(`Working capacity = ${tgs} × ${h} × ${u} = ${n(tgs * h * u, 0)} TEU`, `السعة التشغيلية = ${tgs} × ${h} × ${u} = ${n(tgs * h * u, 0)} TEU`) };
  } });

  add({ id: 'throughput', lvl: 3, icon: '📊', title: L('Yard throughput (Little’s law)', 'إنتاجية الساحة (قانون ليتل)'), gen() {
    const cap = R(8, 40) * 100, dwell = R(3, 10);
    return { q: L(`Working yard capacity ${n(cap, 0)} TEU, average dwell ${dwell} days. Maximum annual throughput (TEU, nearest whole)?`, `السعة التشغيلية للساحة ${n(cap, 0)} TEU، متوسط البقاء ${dwell} أيام. أقصى إنتاجية سنوية (TEU، لأقرب عدد صحيح)؟`), a: Math.round(cap * 365 / dwell), tol: 1, unit: 'TEU',
      sol: L(`Throughput = capacity × 365 ÷ dwell = ${cap} × 365 ÷ ${dwell} = ${n(cap * 365 / dwell, 0)} TEU/year`, `الإنتاجية = السعة × 365 ÷ البقاء = ${cap} × 365 ÷ ${dwell} = ${n(cap * 365 / dwell, 0)} TEU/سنة`) };
  } });

  add({ id: 'dwell', lvl: 3, icon: '📆', title: L('Average dwell time', 'متوسط مدة البقاء'), gen() {
    const k = R(4, 6), d = Array.from({ length: k }, () => R(1, 14));
    const avg = d.reduce((a, b) => a + b, 0) / k;
    return { q: L(`${k} import boxes stayed ${d.join(', ')} days. Average dwell (2 decimals)?`, `${k} حاويات استيراد بقيت ${d.join('، ')} أيام. متوسط البقاء (رقمان عشريان)؟`), a: r2(avg), tol: 0.01, unit: L('days', 'أيام'),
      sol: L(`(${d.join(' + ')}) ÷ ${k} = ${d.reduce((a, b) => a + b, 0)} ÷ ${k} = ${n(avg)} days`, `(${d.join(' + ')}) ÷ ${k} = ${d.reduce((a, b) => a + b, 0)} ÷ ${k} = ${n(avg)} يوم`) };
  } });

  add({ id: 'ttt', lvl: 3, icon: '🚛', title: L('Truck turnaround time', 'زمن دوران الشاحنة'), gen() {
    const k = 4, t = Array.from({ length: k }, () => R(18, 90));
    const avg = t.reduce((a, b) => a + b, 0) / k;
    return { q: L(`Four trucks spent ${t.join(', ')} minutes from queue to gate-out. Average TTT (1 decimal)?`, `أمضت أربع شاحنات ${t.join('، ')} دقيقة من الطابور حتى الخروج. متوسط زمن الدوران (رقم عشري واحد)؟`), a: r1(avg), tol: 0.1, unit: 'min',
      sol: L(`(${t.join(' + ')}) ÷ 4 = ${n(avg, 1)} min ${avg > 45 ? '→ above the 30–45 min target' : '→ within target'}`, `(${t.join(' + ')}) ÷ 4 = ${n(avg, 1)} دقيقة ${avg > 45 ? '← فوق هدف 30–45 دقيقة' : '← ضمن الهدف'}`) };
  } });

  function tiered(days, free, tiers) {
    let left = days - free, cost = 0, from = free + 1; const lines = [];
    tiers.forEach((tr) => {
      if (left <= 0) return;
      const len = tr.len == null ? left : Math.min(left, tr.len);
      cost += len * tr.rate; lines.push(`d${from}–${from + len - 1}: ${len} × ${tr.rate} = ${len * tr.rate}`);
      from += len; left -= len;
    });
    return { cost, lines };
  }
  add({ id: 'storage', lvl: 4, icon: '💰', title: L('Tiered storage / demurrage', 'تخزين/تأخير متدرّج'), gen() {
    const free = P([3, 4, 5, 7]), days = free + R(2, 22);
    const t1 = R(8, 15), t2 = R(18, 30), t3 = R(35, 50);
    const tiers = [{ len: 5, rate: t1 }, { len: 10, rate: t2 }, { len: null, rate: t3 }];
    const r = tiered(days, free, tiers);
    return { q: L(`Free ${free} days; then next 5 days USD ${t1}/day, next 10 days USD ${t2}/day, after that USD ${t3}/day. The box stayed ${days} days. Total charge (USD)?`, `مجاني ${free} أيام؛ ثم الأيام الخمسة التالية ${t1} دولارًا/يوم، والعشرة التالية ${t2} دولارًا/يوم، وبعدها ${t3} دولارًا/يوم. بقيت الحاوية ${days} يومًا. المجموع (دولار)؟`), a: r.cost, tol: 0.01, unit: 'USD',
      sol: L(`Chargeable days = ${days} − ${free} = ${days - free}\n${r.lines.join('\n')}\nTotal = USD ${n(r.cost, 0)}`, `الأيام المستحقّة = ${days} − ${free} = ${days - free}\n${r.lines.join('\n')}\nالمجموع = ${n(r.cost, 0)} دولار`) };
  } });

  add({ id: 'daycount', lvl: 4, icon: '📅', title: L('Counting days', 'عدّ الأيام'), gen() {
    const s = R(1, 18), e = s + R(3, 12);
    return { q: L(`Discharged on day ${s} of the month, gate-out on day ${e}. Tariff counts both first and last day. How many days?`, `فُرّغت في اليوم ${s} من الشهر، وخرجت في اليوم ${e}. التعرفة تحسب اليوم الأول والأخير. كم يومًا؟`), a: e - s + 1, tol: 0, unit: L('days', 'أيام'),
      sol: L(`${e} − ${s} + 1 = ${e - s + 1} days`, `${e} − ${s} + 1 = ${e - s + 1} يوم`) };
  } });

  add({ id: 'eor', lvl: 4, icon: '🛠', title: L('Repair estimate (EOR)', 'تقدير الإصلاح EOR'), gen() {
    const items = PT.shuffle([
      { en: 'side panel insert', ar: 'رقعة لوح جانبي', h: 2.5, m: 60 }, { en: 'floor board replace', ar: 'استبدال لوح أرضية', h: 4, m: 120 },
      { en: 'door gasket', ar: 'جوان الباب', h: 1, m: 35 }, { en: 'straighten top rail', ar: 'تقويم القضيب العلوي', h: 1.5, m: 0 },
      { en: 'patch roof hole', ar: 'ترقيع ثقب السقف', h: 1.5, m: 45 }, { en: 'chemical cleaning', ar: 'تنظيف كيميائي', h: 2, m: 25 },
    ]).slice(0, R(2, 3));
    const rate = R(18, 30), hrs = items.reduce((a, b) => a + b.h, 0), mat = items.reduce((a, b) => a + b.m, 0);
    return { q: L(`Repairs: ${items.map((i) => `${i.en} (${i.h} h, USD ${i.m} material)`).join('; ')}. Labour USD ${rate}/h. Total EOR (USD)?`, `الإصلاحات: ${items.map((i) => `${i.ar} (${i.h} ساعة، ${i.m} دولار مواد)`).join('؛ ')}. العمالة ${rate} دولارًا/ساعة. مجموع التقدير (دولار)؟`), a: hrs * rate + mat, tol: 0.01, unit: 'USD',
      sol: L(`Labour = ${hrs} h × ${rate} = ${n(hrs * rate)}\nMaterial = ${mat}\nEOR = ${n(hrs * rate + mat)}`, `العمالة = ${hrs} ساعة × ${rate} = ${n(hrs * rate)}\nالمواد = ${mat}\nالتقدير = ${n(hrs * rate + mat)}`) };
  } });

  add({ id: 'cover', lvl: 4, icon: '🔄', title: L('Empty stock & days of cover', 'مخزون الفارغ وأيام التغطية'), gen() {
    const stock = R(60, 200), rel = R(15, 50), ret = R(5, 40), days = R(3, 7);
    const proj = stock + (ret - rel) * days;
    return { q: L(`Sound 40′ HC stock ${stock}. Daily releases ${rel}, daily returns ${ret}. Projected stock after ${days} days (no repositioning)?`, `مخزون 40′ عالية سليم ${stock}. الإطلاق اليومي ${rel}، الإرجاع اليومي ${ret}. المخزون المتوقّع بعد ${days} أيام (دون إعادة تموضع)؟`), a: proj, tol: 0, unit: L('boxes', 'حاويات'),
      sol: L(`Net per day = ${ret} − ${rel} = ${ret - rel}\nStock = ${stock} + (${ret - rel}) × ${days} = ${proj}${proj < 0 ? '\n⚠ Negative = shortage: reposition, repair, substitute.' : ''}\nDays of cover today = ${stock} ÷ ${rel} = ${n(stock / rel, 1)}`, `الصافي اليومي = ${ret} − ${rel} = ${ret - rel}\nالمخزون = ${stock} + (${ret - rel}) × ${days} = ${proj}${proj < 0 ? '\n⚠ سالب = عجز: أعد التموضع، أصلح، استبدل.' : ''}\nأيام التغطية اليوم = ${stock} ÷ ${rel} = ${n(stock / rel, 1)}`) };
  } });

  add({ id: 'availability', lvl: 4, icon: '🔧', title: L('Equipment availability & MTBF', 'توفّر المعدّات وMTBF'), gen() {
    const sch = R(40, 72) * 10, down = R(5, 60), f = R(2, 8);
    const which = P(['a', 'm']);
    return which === 'a'
      ? { q: L(`An STS crane was scheduled ${sch} h this month and was broken down ${down} h. Technical availability % (1 decimal)?`, `رافعة رصيف مجدولة ${sch} ساعة هذا الشهر وتعطّلت ${down} ساعة. التوفّر الفني % (رقم عشري واحد)؟`), a: r1((sch - down) / sch * 100), tol: 0.1, unit: '%',
        sol: L(`(${sch} − ${down}) ÷ ${sch} × 100 = ${n((sch - down) / sch * 100, 1)}%`, `(${sch} − ${down}) ÷ ${sch} × 100 = ${n((sch - down) / sch * 100, 1)}%`) }
      : { q: L(`RTG operated ${sch} h with ${f} failures. MTBF in hours (1 decimal)?`, `رافعة RTG عملت ${sch} ساعة مع ${f} أعطال. MTBF بالساعات (رقم عشري واحد)؟`), a: r1(sch / f), tol: 0.1, unit: L('h', 'ساعة'),
        sol: L(`MTBF = ${sch} ÷ ${f} = ${n(sch / f, 1)} h`, `MTBF = ${sch} ÷ ${f} = ${n(sch / f, 1)} ساعة`) };
  } });

  add({ id: 'ltifr', lvl: 5, icon: '🦺', title: L('LTIFR', 'معدّل الإصابات LTIFR'), gen() {
    const inj = R(1, 6), hrs = R(5, 30) * 100000;
    return { q: L(`${inj} lost-time injuries in ${n(hrs, 0)} hours worked. LTIFR per million hours (2 decimals)?`, `${inj} إصابات بفقدان وقت خلال ${n(hrs, 0)} ساعة عمل. LTIFR لكل مليون ساعة (رقمان عشريان)؟`), a: r2(inj * 1e6 / hrs), tol: 0.01, unit: '',
      sol: L(`LTIFR = ${inj} × 1,000,000 ÷ ${n(hrs, 0)} = ${n(inj * 1e6 / hrs)}`, `LTIFR = ${inj} × 1,000,000 ÷ ${n(hrs, 0)} = ${n(inj * 1e6 / hrs)}`) };
  } });

  add({ id: 'breakeven', lvl: 5, icon: '🤝', title: L('Break-even & cost per move', 'نقطة التعادل والتكلفة لكل حركة'), gen() {
    const rate = R(70, 140), vc = R(25, 60), fixed = R(5, 25) * 1e6;
    if (Math.random() < 0.5) return { q: L(`Rate USD ${rate}/move, variable cost USD ${vc}/move, fixed cost USD ${n(fixed, 0)}/year. Break-even moves per year (nearest whole)?`, `السعر ${rate} دولارًا/حركة، التكلفة المتغيّرة ${vc} دولارًا/حركة، التكلفة الثابتة ${n(fixed, 0)} دولار/سنة. حركات التعادل سنويًا (لأقرب عدد صحيح)؟`), a: Math.round(fixed / (rate - vc)), tol: 1, unit: L('moves', 'حركة'),
      sol: L(`Contribution = ${rate} − ${vc} = ${rate - vc}\nBreak-even = ${n(fixed, 0)} ÷ ${rate - vc} = ${n(fixed / (rate - vc), 0)} moves`, `المساهمة = ${rate} − ${vc} = ${rate - vc}\nالتعادل = ${n(fixed, 0)} ÷ ${rate - vc} = ${n(fixed / (rate - vc), 0)} حركة`) };
    const moves = R(80, 400) * 1000, cost = R(3, 20) * 1e6;
    return { q: L(`Operating cost USD ${n(cost, 0)} for ${n(moves, 0)} moves. Cost per move (2 decimals)?`, `تكلفة التشغيل ${n(cost, 0)} دولار لـ ${n(moves, 0)} حركة. التكلفة لكل حركة (رقمان عشريان)؟`), a: r2(cost / moves), tol: 0.01, unit: 'USD',
      sol: L(`${n(cost, 0)} ÷ ${n(moves, 0)} = USD ${n(cost / moves)}`, `${n(cost, 0)} ÷ ${n(moves, 0)} = ${n(cost / moves)} دولار`) };
  } });

  add({ id: 'labour', lvl: 5, icon: '👷', title: L('Crane driver planning', 'تخطيط سائقي الرافعات'), gen() {
    const c = R(3, 9), f = P([1.25, 1.5, 1.75]);
    return { q: L(`${c} STS cranes working for a shift; relief factor ${f} drivers per crane. Drivers needed (round up)?`, `${c} رافعات رصيف تعمل لوردية؛ معامل البدلاء ${f} سائق لكل رافعة. السائقون المطلوبون (تقريب للأعلى)؟`), a: Math.ceil(c * f), tol: 0, unit: '',
      sol: L(`${c} × ${f} = ${n(c * f)} → ${Math.ceil(c * f)} drivers`, `${c} × ${f} = ${n(c * f)} ← ${Math.ceil(c * f)} سائقين`) };
  } });
})();
