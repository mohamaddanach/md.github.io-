/* Port Master Academy — drills for specialisation tracks (L6–L9) */
(function () {
  const L = TS.L;
  const R = PT.rnd, P = PT.pick, r1 = PT.r1, r2 = PT.r2;
  const n = (x, d) => TS.num(x, d == null ? 2 : d);
  const add = (x) => PT.drills.push(x);

  add({ id: 'laytime', lvl: 6, icon: '⏳', title: L('Laytime, demurrage & despatch', 'زمن الرسو والغرامة والمكافأة'), gen() {
    const qty = R(20, 70) * 1000, rate = P([5000, 6000, 7500, 8000, 10000]), dem = R(10, 30) * 1000;
    const lay = qty / rate, used = r2(Math.max(lay * 0.5, lay + (R(-30, 40) / 10)));
    const diff = used - lay, val = diff > 0 ? diff * dem : -diff * dem / 2;
    return { q: L(`${n(qty, 0)} t cargo, rate ${n(rate, 0)} t/day SHINC, demurrage USD ${n(dem, 0)}/day, despatch half. Time used ${used} days. Amount due (USD, positive number)?`, `بضاعة ${n(qty, 0)} طن، المعدّل ${n(rate, 0)} طن/يوم SHINC، الغرامة ${n(dem, 0)} دولار/يوم، المكافأة النصف. الوقت المستخدم ${used} يوم. المبلغ المستحق (دولار، رقم موجب)؟`), a: r2(val), tol: 1, unit: 'USD',
      sol: L(`Laytime = ${qty} ÷ ${rate} = ${n(lay, 3)} days\nTime used − laytime = ${n(diff, 3)} days\n${diff > 0 ? `Demurrage = ${n(diff, 3)} × ${dem} = USD ${n(val)}` : `Despatch = ${n(-diff, 3)} × ${dem / 2} = USD ${n(val)}`}`, `زمن الرسو = ${qty} ÷ ${rate} = ${n(lay, 3)} يوم\nالمستخدم − زمن الرسو = ${n(diff, 3)} يوم\n${diff > 0 ? `الغرامة = ${n(diff, 3)} × ${dem} = ${n(val)} دولار` : `المكافأة = ${n(-diff, 3)} × ${dem / 2} = ${n(val)} دولار`}`) };
  } });

  add({ id: 'tce', lvl: 6, icon: '💵', title: L('Time Charter Equivalent', 'العائد اليومي المكافئ TCE'), gen() {
    const fr = R(40, 160) * 10000, bunk = R(10, 50) * 10000, port = R(3, 15) * 10000, days = R(14, 45);
    const tce = (fr - bunk - port) / days;
    return { q: L(`Freight USD ${n(fr, 0)}, bunkers USD ${n(bunk, 0)}, port & canal costs USD ${n(port, 0)}, voyage ${days} days. TCE per day (USD)?`, `الأجرة ${n(fr, 0)} دولار، الوقود ${n(bunk, 0)}، تكاليف الميناء والقناة ${n(port, 0)}، الرحلة ${days} يومًا. TCE يوميًا (دولار)؟`), a: r2(tce), tol: 1, unit: 'USD/day',
      sol: L(`(${n(fr, 0)} − ${n(bunk, 0)} − ${n(port, 0)}) ÷ ${days} = USD ${n(tce)}/day`, `(${n(fr, 0)} − ${n(bunk, 0)} − ${n(port, 0)}) ÷ ${days} = ${n(tce)} دولار/يوم`) };
  } });

  add({ id: 'cubelaw', lvl: 6, icon: '⛽', title: L('Fuel vs speed (cube law)', 'الوقود مقابل السرعة (قانون المكعّب)'), gen() {
    const v1 = R(15, 22), c1 = R(30, 120), v2 = v1 - R(2, 6);
    const c2 = c1 * Math.pow(v2 / v1, 3);
    return { q: L(`A ship burns ${c1} t/day at ${v1} kn. Daily consumption at ${v2} kn (1 decimal)?`, `سفينة تحرق ${c1} طنًا/يوم بسرعة ${v1} عقدة. الاستهلاك اليومي بسرعة ${v2} عقدة (رقم عشري واحد)؟`), a: r1(c2), tol: 0.15, unit: 't/day',
      sol: L(`${c1} × (${v2}/${v1})³ = ${c1} × ${n(Math.pow(v2 / v1, 3), 4)} = ${n(c2, 1)} t/day`, `${c1} × (${v2}/${v1})³ = ${c1} × ${n(Math.pow(v2 / v1, 3), 4)} = ${n(c2, 1)} طن/يوم`) };
  } });

  const DENS = [{ en: 'wheat', ar: 'القمح', d: 0.78 }, { en: 'corn', ar: 'الذرة', d: 0.72 }, { en: 'barley', ar: 'الشعير', d: 0.62 }, { en: 'soybeans', ar: 'فول الصويا', d: 0.75 }];
  add({ id: 'silocap', lvl: 7, icon: '🌾', title: L('Silo bin capacity', 'سعة خلية الصومعة'), gen() {
    const dia = R(8, 16), h = R(20, 40), c = P(DENS);
    const vol = Math.PI * (dia / 2) ** 2 * h, t = vol * c.d;
    return { q: L(`Cylindrical bin Ø ${dia} m, effective height ${h} m, filled with ${c.en} (bulk density ${c.d} t/m³). Capacity in tonnes (nearest whole)?`, `خلية أسطوانية قطرها ${dia} م وارتفاعها الفعلي ${h} م، مملوءة بـ${c.ar} (كثافة ظاهرية ${c.d} طن/م³). السعة بالأطنان (لأقرب عدد صحيح)؟`), a: Math.round(t), tol: 2, unit: 't',
      sol: L(`V = π × ${dia / 2}² × ${h} = ${n(vol, 1)} m³\nCapacity = ${n(vol, 1)} × ${c.d} = ${n(t, 0)} t`, `الحجم = π × ${dia / 2}² × ${h} = ${n(vol, 1)} م³\nالسعة = ${n(vol, 1)} × ${c.d} = ${n(t, 0)} طن`) };
  } });

  add({ id: 'drying', lvl: 7, icon: '🌡', title: L('Drying shrink', 'فقد التجفيف'), gen() {
    const w = R(5, 40) * 100, m1 = r1(R(150, 200) / 10), m2 = r1(R(125, 140) / 10);
    const after = w * (100 - m1) / (100 - m2);
    return { q: L(`${n(w, 0)} t of grain at ${m1}% moisture is dried to ${m2}%. Weight after drying (t, 1 decimal)?`, `${n(w, 0)} طن حبوب برطوبة ${m1}% جُفّفت إلى ${m2}%. الوزن بعد التجفيف (طن، رقم عشري واحد)؟`), a: r1(after), tol: 0.15, unit: 't',
      sol: L(`${w} × (100 − ${m1}) ÷ (100 − ${m2}) = ${w} × ${n(100 - m1, 1)} ÷ ${n(100 - m2, 1)} = ${n(after, 1)} t (water removed ${n(w - after, 1)} t)`, `${w} × (100 − ${m1}) ÷ (100 − ${m2}) = ${w} × ${n(100 - m1, 1)} ÷ ${n(100 - m2, 1)} = ${n(after, 1)} طن (الماء المُزال ${n(w - after, 1)} طن)`) };
  } });

  add({ id: 'bulkdischarge', lvl: 7, icon: '⚓', title: L('Bulk discharge time', 'زمن تفريغ السائبة'), gen() {
    const q = R(15, 70) * 1000, nom = P([600, 800, 1000, 1200, 1600]), eff = P([0.55, 0.6, 0.65, 0.7]);
    const h = q / (nom * eff);
    return { q: L(`${n(q, 0)} t grain, unloaders nominal ${nom} t/h, effective factor ${eff}. Discharge time in hours (1 decimal)?`, `${n(q, 0)} طن حبوب، المفرّغات بمعدّل اسمي ${nom} طن/س، معامل فعلي ${eff}. زمن التفريغ بالساعات (رقم عشري واحد)؟`), a: r1(h), tol: 0.15, unit: L('h', 'ساعة'),
      sol: L(`Effective rate = ${nom} × ${eff} = ${n(nom * eff, 0)} t/h\nTime = ${q} ÷ ${n(nom * eff, 0)} = ${n(h, 1)} h (${n(h / 24, 2)} days)`, `المعدّل الفعلي = ${nom} × ${eff} = ${n(nom * eff, 0)} طن/س\nالزمن = ${q} ÷ ${n(nom * eff, 0)} = ${n(h, 1)} ساعة (${n(h / 24, 2)} يوم)`) };
  } });

  add({ id: 'draftsurvey', lvl: 7, icon: '📏', title: L('Draft survey (TPC method)', 'مسح الغاطس (طريقة TPC)'), gen() {
    const d1 = r2(R(900, 1250) / 100), d2 = r2(R(450, 700) / 100), tpc = R(30, 75);
    const cm = Math.round((d1 - d2) * 100), cargo = cm * tpc;
    return { q: L(`Mean draft before discharge ${d1} m, after ${d2} m, TPC ${tpc} t/cm. Approximate cargo discharged (t)?`, `متوسط الغاطس قبل التفريغ ${d1} م وبعده ${d2} م، TPC = ${tpc} طن/سم. البضاعة المفرّغة تقريبًا (طن)؟`), a: cargo, tol: 1, unit: 't',
      sol: L(`Δ draft = ${d1} − ${d2} = ${n((d1 - d2), 2)} m = ${cm} cm\nCargo ≈ ${cm} × ${tpc} = ${n(cargo, 0)} t (before ballast, fuel, density corrections)`, `فرق الغاطس = ${d1} − ${d2} = ${n((d1 - d2), 2)} م = ${cm} سم\nالبضاعة ≈ ${cm} × ${tpc} = ${n(cargo, 0)} طن (قبل تصحيحات الصابورة والوقود والكثافة)`) };
  } });

  add({ id: 'tankmass', lvl: 8, icon: '🛢', title: L('Tank volume to mass (VCF)', 'حجم الخزّان إلى كتلة (VCF)'), gen() {
    const gov = R(20, 150) * 100, vcf = r2(R(975, 1000) / 1000 * 100) / 100, dens = P([0.74, 0.76, 0.82, 0.845, 0.92]);
    const m = gov * vcf * dens;
    return { q: L(`GOV ${n(gov, 0)} m³, VCF ${vcf}, density at 15 °C ${dens} t/m³. Mass (t, 1 decimal)?`, `GOV = ${n(gov, 0)} م³، VCF = ${vcf}، الكثافة عند 15 °م ${dens} طن/م³. الكتلة (طن، رقم عشري واحد)؟`), a: r1(m), tol: 0.2, unit: 't',
      sol: L(`GSV = ${gov} × ${vcf} = ${n(gov * vcf, 1)} m³\nMass = ${n(gov * vcf, 1)} × ${dens} = ${n(m, 1)} t`, `GSV = ${gov} × ${vcf} = ${n(gov * vcf, 1)} م³\nالكتلة = ${n(gov * vcf, 1)} × ${dens} = ${n(m, 1)} طن`) };
  } });

  add({ id: 'carpark', lvl: 8, icon: '🚗', title: L('Car terminal capacity', 'سعة محطة السيارات'), gen() {
    const s = R(10, 60) * 100, u = P([0.7, 0.75, 0.8, 0.85]), d = R(6, 20);
    const c = s * u * 365 / d;
    return { q: L(`${n(s, 0)} parking slots, utilisation ${u}, average dwell ${d} days. Annual capacity (cars, nearest whole)?`, `${n(s, 0)} خانة وقوف، استخدام ${u}، متوسط البقاء ${d} يومًا. السعة السنوية (سيارات، لأقرب عدد صحيح)؟`), a: Math.round(c), tol: 2, unit: L('cars', 'سيارة'),
      sol: L(`${s} × ${u} × 365 ÷ ${d} = ${n(c, 0)} cars/year`, `${s} × ${u} × 365 ÷ ${d} = ${n(c, 0)} سيارة/سنة`) };
  } });

  add({ id: 'hookload', lvl: 8, icon: '🏗', title: L('Hook load & crane check', 'حمل الخطاف وفحص الرافعة'), gen() {
    const cargo = R(30, 180), beam = R(2, 8), slings = R(1, 3), cap = R(40, 120), derate = P([0.75, 0.8]);
    const hook = cargo + beam + slings, allowed = 2 * cap * derate;
    return { q: L(`Cargo ${cargo} t, spreader beam ${beam} t, slings ${slings} t. Two cranes in tandem, each ${cap} t at the radius, derated to ${derate * 100}%. What is the hook load (t)? (Then: is the lift allowed?)`, `البضاعة ${cargo} طنًا، عارضة الرفع ${beam} أطنان، الحبال ${slings} طن. رافعتان ترادفيًا، كلّ منهما ${cap} طنًا عند نصف القطر، بتخفيض إلى ${derate * 100}%. ما حمل الخطاف (طن)؟ (ثم: هل الرفع مسموح؟)`), a: hook, tol: 0, unit: 't',
      sol: L(`Hook load = ${cargo} + ${beam} + ${slings} = ${hook} t\nAllowed tandem = 2 × ${cap} × ${derate} = ${n(allowed, 1)} t → ${hook <= allowed ? 'OK' : 'NOT ALLOWED — bigger crane / ship gear'}`, `حمل الخطاف = ${cargo} + ${beam} + ${slings} = ${hook} طنًا\nالمسموح الترادفي = 2 × ${cap} × ${derate} = ${n(allowed, 1)} طن ← ${hook <= allowed ? 'مقبول' : 'غير مسموح — رافعة أكبر / روافع السفينة'}`) };
  } });

  add({ id: 'depotcap', lvl: 8, icon: '🏭', title: L('Depot capacity & throughput', 'سعة المستودع وإنتاجيته'), gen() {
    const g = R(3, 20) * 100, h = R(4, 8), u = P([0.75, 0.8, 0.85]), dw = R(5, 20);
    const cap = g * h * u, thr = cap * 365 / dw;
    return { q: L(`Depot: ${n(g, 0)} ground slots (TEU), stacked ${h} high, utilisation ${u}, average empty dwell ${dw} days. Annual throughput (TEU, nearest whole)?`, `مستودع: ${n(g, 0)} خانة أرضية (TEU)، الرصّ ${h} طبقات، الاستخدام ${u}، متوسط بقاء الفارغ ${dw} يومًا. الإنتاجية السنوية (TEU، لأقرب عدد صحيح)؟`), a: Math.round(thr), tol: 2, unit: 'TEU',
      sol: L(`Capacity = ${g} × ${h} × ${u} = ${n(cap, 0)} TEU\nThroughput = ${n(cap, 0)} × 365 ÷ ${dw} = ${n(thr, 0)} TEU/yr`, `السعة = ${g} × ${h} × ${u} = ${n(cap, 0)} TEU\nالإنتاجية = ${n(cap, 0)} × 365 ÷ ${dw} = ${n(thr, 0)} TEU/سنة`) };
  } });

  add({ id: 'forecast', lvl: 9, icon: '📈', title: L('Traffic forecast', 'توقّع الحركة'), gen() {
    const v = R(20, 200) * 10000, g = R(2, 9), y = R(3, 15);
    const f = v * Math.pow(1 + g / 100, y);
    return { q: L(`Current traffic ${n(v, 0)} TEU, growth ${g}% per year. Volume after ${y} years (TEU, nearest whole)?`, `الحركة الحالية ${n(v, 0)} TEU، النمو ${g}% سنويًا. الحجم بعد ${y} سنوات (TEU، لأقرب عدد صحيح)؟`), a: Math.round(f), tol: Math.max(2, f * 0.0005), unit: 'TEU',
      sol: L(`${n(v, 0)} × (1 + ${g / 100})^${y} = ${n(v, 0)} × ${n(Math.pow(1 + g / 100, y), 4)} = ${n(f, 0)} TEU`, `${n(v, 0)} × (1 + ${g / 100})^${y} = ${n(v, 0)} × ${n(Math.pow(1 + g / 100, y), 4)} = ${n(f, 0)} TEU`) };
  } });

  add({ id: 'cagr', lvl: 9, icon: '📊', title: L('CAGR', 'معدّل النمو السنوي المركّب'), gen() {
    const s = R(20, 100) * 10000, e = s * (1 + R(10, 150) / 100), y = R(3, 12);
    const c = (Math.pow(e / s, 1 / y) - 1) * 100;
    return { q: L(`Traffic grew from ${n(s, 0)} to ${n(e, 0)} TEU in ${y} years. CAGR in % (2 decimals)?`, `نمت الحركة من ${n(s, 0)} إلى ${n(e, 0)} TEU خلال ${y} سنوات. معدّل النمو المركّب % (رقمان عشريان)؟`), a: r2(c), tol: 0.02, unit: '%',
      sol: L(`(${n(e, 0)} ÷ ${n(s, 0)})^(1/${y}) − 1 = ${n(e / s, 4)}^(${n(1 / y, 4)}) − 1 = ${n(c)}%`, `(${n(e, 0)} ÷ ${n(s, 0)})^(1/${y}) − 1 = ${n(e / s, 4)}^(${n(1 / y, 4)}) − 1 = ${n(c)}%`) };
  } });

  add({ id: 'berthcap', lvl: 9, icon: '📐', title: L('Berth capacity', 'طاقة الرصيف'), gen() {
    const b = R(1, 5), h = P([8000, 8200, 8400, 8500]), occ = P([0.55, 0.6, 0.65, 0.7]), mph = R(40, 120), tf = P([1.4, 1.5, 1.6, 1.7]);
    const c = b * h * occ * mph * tf;
    return { q: L(`${b} berth(s), ${n(h, 0)} operating h/yr, target occupancy ${occ}, ${mph} moves/h per berth, TEU factor ${tf}. Annual capacity (TEU, nearest whole)?`, `${b} رصيف/أرصفة، ${n(h, 0)} ساعة تشغيل/سنة، إشغال مستهدف ${occ}، ${mph} حركة/ساعة لكل رصيف، معامل TEU ${tf}. الطاقة السنوية (TEU، لأقرب عدد صحيح)؟`), a: Math.round(c), tol: 2, unit: 'TEU',
      sol: L(`${b} × ${h} × ${occ} × ${mph} × ${tf} = ${n(c, 0)} TEU/yr`, `${b} × ${h} × ${occ} × ${mph} × ${tf} = ${n(c, 0)} TEU/سنة`) };
  } });

  add({ id: 'yardtgs', lvl: 9, icon: '🧱', title: L('Yard ground slots needed', 'خانات الساحة المطلوبة'), gen() {
    const teu = R(20, 300) * 10000, dw = R(3, 9), h = R(3, 6), u = P([0.65, 0.7, 0.75]);
    const tgs = teu * dw / (365 * h * u);
    return { q: L(`${n(teu, 0)} TEU/yr, dwell ${dw} days, stacking ${h} high, utilisation ${u}. Ground slots (TGS) needed (round up)?`, `${n(teu, 0)} TEU/سنة، بقاء ${dw} أيام، الرصّ ${h} طبقات، الاستخدام ${u}. خانات الأرض المطلوبة (تقريب للأعلى)؟`), a: Math.ceil(tgs), tol: 1, unit: 'TGS',
      sol: L(`${n(teu, 0)} × ${dw} ÷ (365 × ${h} × ${u}) = ${n(tgs, 1)} → ${Math.ceil(tgs)} TGS (≈ ${n(Math.ceil(tgs) * 30 / 10000, 1)} ha at 30 m²/TGS)`, `${n(teu, 0)} × ${dw} ÷ (365 × ${h} × ${u}) = ${n(tgs, 1)} ← ${Math.ceil(tgs)} خانة (≈ ${n(Math.ceil(tgs) * 30 / 10000, 1)} هكتار بمعدّل 30 م²/خانة)`) };
  } });

  add({ id: 'npv', lvl: 9, icon: '💹', title: L('NPV (annuity)', 'صافي القيمة الحالية (دفعات متساوية)'), gen() {
    const inv = R(30, 300), cf = r1(inv * R(8, 20) / 100), r = P([6, 8, 10, 12]), y = P([10, 15, 20, 25]);
    const af = (1 - Math.pow(1 + r / 100, -y)) / (r / 100), npv = cf * af - inv;
    return { q: L(`Invest USD ${inv} M; net cash flow USD ${cf} M per year for ${y} years; discount rate ${r}%. NPV in USD M (2 decimals)?`, `استثمار ${inv} مليون دولار؛ تدفّق صافٍ ${cf} مليون سنويًا لمدة ${y} سنة؛ معدّل الخصم ${r}%. صافي القيمة الحالية بالمليون (رقمان عشريان)؟`), a: r2(npv), tol: 0.05, unit: 'USD M',
      sol: L(`Annuity factor = (1 − 1.${String(r).padStart(2, '0')}^−${y}) ÷ ${r / 100} = ${n(af, 4)}\nPV = ${cf} × ${n(af, 4)} = ${n(cf * af)}\nNPV = ${n(cf * af)} − ${inv} = ${n(npv)} M → ${npv > 0 ? 'viable' : 'not viable'}`, `معامل الدفعات = (1 − 1.${String(r).padStart(2, '0')}^−${y}) ÷ ${r / 100} = ${n(af, 4)}\nالقيمة الحالية = ${cf} × ${n(af, 4)} = ${n(cf * af)}\nصافي القيمة الحالية = ${n(cf * af)} − ${inv} = ${n(npv)} مليون ← ${npv > 0 ? 'مجدٍ' : 'غير مجدٍ'}`) };
  } });

  add({ id: 'royalty', lvl: 9, icon: '📑', title: L('Concession revenue', 'إيرادات الامتياز'), gen() {
    const area = R(20, 80), rent = R(4, 15), roy = R(10, 35), teu = R(30, 150) * 10000;
    const tot = area * 10000 * rent + roy * teu;
    return { q: L(`Concession area ${area} ha, land rent USD ${rent}/m²/yr, royalty USD ${roy}/TEU, traffic ${n(teu, 0)} TEU. Total annual payment to the authority (USD)?`, `مساحة الامتياز ${area} هكتار، إيجار الأرض ${rent} دولار/م²/سنة، الإتاوة ${roy} دولارًا/TEU، الحركة ${n(teu, 0)} TEU. إجمالي الدفعة السنوية للسلطة (دولار)؟`), a: tot, tol: 1, unit: 'USD',
      sol: L(`Fixed = ${area} ha × 10,000 × ${rent} = ${n(area * 10000 * rent, 0)}\nVariable = ${roy} × ${n(teu, 0)} = ${n(roy * teu, 0)}\nTotal = USD ${n(tot, 0)}`, `الثابت = ${area} هكتار × 10,000 × ${rent} = ${n(area * 10000 * rent, 0)}\nالمتغيّر = ${roy} × ${n(teu, 0)} = ${n(roy * teu, 0)}\nالمجموع = ${n(tot, 0)} دولار`) };
  } });
})();
