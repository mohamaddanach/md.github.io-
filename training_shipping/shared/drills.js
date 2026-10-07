/* Training Shipping — micro-exercises (drills).
 * Generators return a fresh question every time { q, o:[...], a, e, cat } with random numbers,
 * so the trainee cannot memorise the answers. Used by:
 *   • the step quizzes (TS.quizBuild mixes a few generated questions with the lesson questions, options shuffled)
 *   • the endless "Drills" page (TS.drillsView) with streak and best score. */
(function () {
  const L = TS.L, t = TS.t, esc = TS.esc;
  const N = (n, d) => TS.num(n, d == null ? 2 : d);
  const rnd = () => Math.random;
  const ri = (r, a, b) => a + Math.floor(r() * (b - a + 1));
  const pick = (r, a) => a[Math.floor(r() * a.length)];
  const R2 = TS.round2;
  const shuffle = (r, arr) => { const a = arr.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  /* numeric options: correct + 3 plausible wrong values, unique */
  const numOpts = (r, right, wrongs, fmt) => {
    const f = fmt || ((x) => N(x));
    const set = [f(right)];
    wrongs.forEach((w) => { const v = f(w); if (!set.includes(v) && Number.isFinite(w) && w >= 0) set.push(v); });
    let k = 1;
    while (set.length < 4) { const v = f(right * (1 + (k % 2 ? 1 : -1) * 0.1 * Math.ceil(k / 2))); if (!set.includes(v)) set.push(v); k++; }
    return { o: set.slice(0, 4), a: 0 };
  };
  const Q = (cat, q, oa, e) => ({ cat, q, o: oa.o, a: oa.a, e });
  const WD = (iso) => new Date(iso + 'T00:00:00Z').toLocaleDateString(TS.lang === 'ar' ? 'ar-LB-u-nu-latn' : 'en-GB', { weekday: 'long', day: 'numeric', month: 'short', timeZone: 'UTC' });

  /* seeded random (same algorithm as the case engine) — stable per shipment */
  TS.rng = (seed) => { let a = seed >>> 0; return () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let x = Math.imul(a ^ (a >>> 15), 1 | a); x = (x + Math.imul(x ^ (x >>> 7), 61 | x)) ^ x; return ((x ^ (x >>> 14)) >>> 0) / 4294967296; }; };
  TS.seedOf = (str) => String(str).split('').reduce((a, ch) => (a * 31 + ch.charCodeAt(0)) % 999983, 7);
  const D = (TS.DRILLS = {
    cbm(r) {
      const l = ri(r, 4, 13) * 10, w = ri(r, 3, 10) * 10, h = ri(r, 2, 9) * 10, n = ri(r, 12, 260);
      const one = (l * w * h) / 1e6, tot = R2(one * n);
      return Q('ops', L(`${n} cartons of ${l} × ${w} × ${h} cm. Total volume (CBM)?`, `${n} كرتونة مقاس ${l} × ${w} × ${h} سم. كم الحجم الكلي (م³)؟`), numOpts(r, tot, [tot * 10, R2((l + w + h) / 100 * n), R2(one * (n - 10)), tot / 10]), L(`One carton = ${l / 100} × ${w / 100} × ${h / 100} m = ${N(one, 4)} CBM × ${n} = ${N(tot)} CBM.`, `الكرتونة = ${l / 100} × ${w / 100} × ${h / 100} م = ${N(one, 4)} م³ × ${n} = ${N(tot)} م³.`));
    },
    wm(r) {
      const cbm = R2(ri(r, 12, 120) / 10), kg = ri(r, 4, 140) * 50, wm = R2(Math.max(cbm, kg / 1000));
      return Q('ops', L(`LCL shipment: ${N(cbm)} CBM, ${N(kg, 0)} kg. Chargeable W/M (revenue tons)?`, `شحنة LCL: ${N(cbm)} م³، ${N(kg, 0)} كغ. كم الوحدات المحتسبة W/M؟`), numOpts(r, wm, [Math.min(cbm, kg / 1000), cbm + kg / 1000, kg / 100]), L(`W/M = the higher of CBM (${N(cbm)}) and tonnes (${N(kg / 1000, 3)}) → ${N(wm)}.`, `W/M = الأعلى بين الحجم (${N(cbm)}) والأطنان (${N(kg / 1000, 3)}) ← ${N(wm)}.`));
    },
    lclFreight(r) {
      const rate = ri(r, 28, 90), cbm = R2(ri(r, 4, 60) / 10), kg = ri(r, 3, 70) * 50, mn = 1, wm = Math.max(mn, cbm, kg / 1000), fr = R2(wm * rate);
      return Q('ops', L(`Consolidator rate USD ${rate}/W/M, minimum 1 W/M. Cargo ${N(cbm)} CBM, ${N(kg, 0)} kg. Ocean freight?`, `سعر المجمِّع ${rate} دولار لكل W/M، الحد الأدنى 1. البضاعة ${N(cbm)} م³، ${N(kg, 0)} كغ. كم أجرة الشحن؟`), numOpts(r, fr, [R2(cbm * rate), R2(kg / 1000 * rate), R2((cbm + kg / 1000) * rate)]), L(`W/M = max(1, ${N(cbm)}, ${N(kg / 1000, 3)}) = ${N(wm, 3)} × ${rate} = USD ${N(fr)}.`, `W/M = max(1، ${N(cbm)}، ${N(kg / 1000, 3)}) = ${N(wm, 3)} × ${rate} = ${N(fr)} دولار.`));
    },
    eq(r) {
      const cases = [[ri(r, 3, 12), ri(r, 800, 5000), 'LCL'], [ri(r, 16, 27), ri(r, 14000, 20000), '20DV'], [ri(r, 12, 15), ri(r, 17000, 21000), '20DV'], [ri(r, 36, 56), ri(r, 6000, 15000), '40DV'], [ri(r, 60, 66), ri(r, 5000, 14000), '40HC']];
      const [cbm, kg, ans] = pick(r, cases);
      const all = ['LCL', '20DV', '40DV', '40HC'];
      const o = [ans].concat(all.filter((x) => x !== ans));
      return Q('ops', L(`${cbm} CBM, ${N(kg, 0)} kg of general cargo (road limit about 21 t in a 20′). Best equipment?`, `${cbm} م³، ${N(kg, 0)} كغ بضاعة عامة (حدّ الطريق نحو 21 طن في الـ20). ما أفضل معدّات؟`), { o, a: 0 }, L('LCL below ~15 CBM and light; otherwise the smallest box that fits: 20′ ≈ 28 usable CBM, 40′ ≈ 58, 40′ HC ≈ 67. Heavy cargo runs out of weight before volume.', 'LCL تحت ~15 م³ وخفيفة؛ وإلا أصغر حاوية تتّسع: 20 ≈ 28 م³ فعليًا، 40 ≈ 58، 40 عالية ≈ 67. البضائع الثقيلة ينفد وزنها قبل حجمها.'));
    },
    margin(r) {
      const buy = ri(r, 8, 60) * 50, sell = buy + ri(r, 2, 12) * 25, m = R2(((sell - buy) / sell) * 100);
      return Q('ops', L(`Buy USD ${N(buy, 0)}, sell USD ${N(sell, 0)}. Margin %?`, `الكلفة ${N(buy, 0)} دولار، البيع ${N(sell, 0)}. كم الهامش %؟`), numOpts(r, m, [((sell - buy) / buy) * 100, (buy / sell) * 100, sell - buy], (x) => N(x, 1) + '%'), L(`Margin = profit ÷ sell = ${N(sell - buy, 0)} ÷ ${N(sell, 0)} = ${N(m, 1)}% (markup would be ÷ buy).`, `الهامش = الربح ÷ البيع = ${N(sell - buy, 0)} ÷ ${N(sell, 0)} = ${N(m, 1)}% (الزيادة تُقسم على الكلفة).`));
    },
    markup(r) {
      const buy = ri(r, 4, 40) * 50, pct = pick(r, [8, 10, 12, 15, 20, 25]), sell = R2(buy * (1 + pct / 100));
      return Q('ops', L(`Buy USD ${N(buy, 0)}. You want a ${pct}% markup. Sell price?`, `الكلفة ${N(buy, 0)} دولار. تريد زيادة ${pct}%. كم سعر البيع؟`), numOpts(r, sell, [buy / (1 - pct / 100), buy + pct, buy * pct / 100]), L(`Sell = buy × (1 + ${pct}%) = USD ${N(sell)}.`, `البيع = الكلفة × (1 + ${pct}%) = ${N(sell)} دولار.`));
    },
    vat(r) {
      const base = ri(r, 3, 90) * 25, v = R2(base * 0.11);
      return Q('acc', L(`Vatable local services USD ${N(base, 0)}. Lebanese VAT 11%?`, `خدمات محلية خاضعة ${N(base, 0)} دولار. ضريبة 11%؟`), numOpts(r, v, [base * 0.1, base * 1.11, base * 0.011]), L(`${N(base, 0)} × 11% = USD ${N(v)}.`, `${N(base, 0)} × 11% = ${N(v)} دولار.`));
    },
    lbp(r) {
      const v = R2(ri(r, 20, 900) + ri(r, 0, 99) / 100), rate = 89500, l = Math.round(v * rate);
      return Q('acc', L(`VAT USD ${N(v)}. Sample official rate LBP ${N(rate, 0)}/USD. VAT in LBP?`, `الضريبة ${N(v)} دولار. السعر الرسمي المثال ${N(rate, 0)} ليرة. كم الضريبة بالليرة؟`), numOpts(r, l, [v * 1507.5, l / 10, l * 1.11], (x) => N(x, 0)), L(`${N(v)} × ${N(rate, 0)} = LBP ${N(l, 0)}.`, `${N(v)} × ${N(rate, 0)} = ${N(l, 0)} ليرة.`));
    },
    dd(r) {
      const free = pick(r, [5, 7, 10, 14]), days = free + ri(r, 1, 12), r1 = pick(r, [20, 25, 30, 35]), r2 = r1 * 2, ch = days - free, cost = Math.min(ch, 7) * r1 + Math.max(0, ch - 7) * r2;
      const d0 = TS.addDays(TS.todayISO(), ri(r, -20, 20)), d1 = TS.addDays(d0, days - 1);
      return Q('ops', L(`Discharged ${TS.fmtDate(d0, false)}, empty returned ${TS.fmtDate(d1, false)} (both days count). ${free} free days; then USD ${r1}/day for 7 days, USD ${r2}/day after. D&D cost?`, `التفريغ ${TS.fmtDate(d0, false)}، إرجاع الفارغ ${TS.fmtDate(d1, false)} (يُحتسب اليومان). ${free} أيام سماح؛ ثم ${r1} دولار/يوم لـ7 أيام، و${r2} بعدها. كم الغرامات؟`), numOpts(r, cost, [ch * r1, (ch + 1) * r1, Math.max(0, ch - 1) * r1, days * r1]), L(`${days} days − ${free} free = ${ch} chargeable → ${Math.min(ch, 7)} × ${r1}${ch > 7 ? ` + ${ch - 7} × ${r2}` : ''} = USD ${N(cost, 0)}.`, `${days} يومًا − ${free} سماح = ${ch} مستحقة ← ${Math.min(ch, 7)} × ${r1}${ch > 7 ? ` + ${ch - 7} × ${r2}` : ''} = ${N(cost, 0)} دولار.`));
    },
    storage(r) {
      const free = pick(r, [3, 5, 7]), days = free + ri(r, 1, 9), rate = pick(r, [2, 2.5, 3, 3.5, 4]), wm = R2(ri(r, 15, 90) / 10), cost = R2((days - free) * rate * wm);
      return Q('ops', L(`LCL cargo stayed ${days} days at the CFS (${free} free). Storage USD ${rate} per W/M per day, cargo ${N(wm)} W/M. Storage cost?`, `بقيت بضاعة LCL ${days} أيام في محطة التجميع (${free} مجانية). التخزين ${rate} دولار لكل W/M يوميًا، البضاعة ${N(wm)} W/M. كم الكلفة؟`), numOpts(r, cost, [days * rate * wm, (days - free) * rate, (days - free + 1) * rate * wm]), L(`(${days} − ${free}) × ${rate} × ${N(wm)} = USD ${N(cost)}.`, `(${days} − ${free}) × ${rate} × ${N(wm)} = ${N(cost)} دولار.`));
    },
    cif(r) {
      const fob = ri(r, 40, 900) * 100, fr = ri(r, 6, 60) * 50, ins = R2((fob + fr) * 1.1 * 0.003), cif = R2(fob + fr + ins);
      return Q('cus', L(`Invoice FOB USD ${N(fob, 0)}, freight to Beirut USD ${N(fr, 0)}, insurance USD ${N(ins)}. Customs value (CIF)?`, `الفاتورة FOB ${N(fob, 0)} دولار، الشحن إلى بيروت ${N(fr, 0)}، التأمين ${N(ins)}. كم القيمة الجمركية (CIF)؟`), numOpts(r, cif, [fob, fob + fr, fob + ins]), L(`CIF = FOB + freight + insurance = USD ${N(cif)}.`, `CIF = FOB + الشحن + التأمين = ${N(cif)} دولار.`));
    },
    dutyvat(r) {
      const cif = ri(r, 40, 900) * 100, d = pick(r, [0, 5, 10, 15, 20, 25]), duty = R2(cif * d / 100), vat = R2((cif + duty) * 0.11), tot = R2(duty + vat);
      return Q('cus', L(`CIF USD ${N(cif, 0)}, duty rate ${d}%. Total duty + import VAT 11%?`, `CIF ${N(cif, 0)} دولار، نسبة الرسم ${d}%. كم مجموع الرسم + ضريبة الاستيراد 11%؟`), numOpts(r, tot, [duty + cif * 0.11, cif * (d + 11) / 100 + 1, vat]), L(`Duty ${N(duty)} + VAT 11% × (CIF + duty) ${N(vat)} = USD ${N(tot)}.`, `الرسم ${N(duty)} + الضريبة 11% × (CIF + الرسم) ${N(vat)} = ${N(tot)} دولار.`));
    },
    fobcfr(r) {
      const cfr = ri(r, 100, 900) * 100, fr = ri(r, 10, 60) * 50, fob = cfr - fr;
      return Q('cus', L(`Export invoice CFR USD ${N(cfr, 0)}; the ocean freight included is USD ${N(fr, 0)}. FOB value for the export declaration?`, `فاتورة تصدير CFR بقيمة ${N(cfr, 0)} دولار؛ الشحن البحري المضمّن ${N(fr, 0)}. كم قيمة FOB لبيان التصدير؟`), numOpts(r, fob, [cfr, cfr + fr, cfr * 0.9]), L(`FOB = CFR − freight = USD ${N(fob, 0)}.`, `FOB = CFR − الشحن = ${N(fob, 0)} دولار.`));
    },
    incoterm(r) {
      const items = [
        ['EXW', L('export customs clearance', 'التخليص الصادر'), 'B'], ['FCA', L('export customs clearance', 'التخليص الصادر'), 'S'], ['FOB', L('origin THC', 'مناولة المنشأ'), 'S'], ['FCA', L('ocean freight', 'الشحن البحري'), 'B'],
        ['FOB', L('ocean freight', 'الشحن البحري'), 'B'], ['CFR', L('ocean freight', 'الشحن البحري'), 'S'], ['CFR', L('cargo insurance', 'التأمين على البضاعة'), 'B'], ['CIF', L('cargo insurance', 'التأمين على البضاعة'), 'S'],
        ['DAP', L('delivery to the buyer’s door', 'التسليم لباب المشتري'), 'S'], ['DAP', L('import duties at destination', 'رسوم الاستيراد في الوجهة'), 'B'], ['CIF', L('destination import clearance', 'التخليص الوارد في الوجهة'), 'B'], ['EXW', L('loading at the seller’s premises', 'التحميل في مقرّ البائع'), 'B'],
      ];
      const [term, item, who] = pick(r, items);
      return Q('ops', L(`Under ${term}, who normally pays for ${item.en}?`, `في ${term}، من يدفع عادة ${item.ar}؟`), { o: who === 'S' ? [L('The seller', 'البائع'), L('The buyer', 'المشتري')] : [L('The buyer', 'المشتري'), L('The seller', 'البائع')], a: 0 }, L('See the Incoterms 2020 page: seller/buyer split per cost item.', 'انظر صفحة إنكوترمز 2020: توزيع الكلفة بين البائع والمشتري.'));
    },
    checkdigit(r) {
      const owner = pick(r, ['CMAU', 'MSCU', 'MSKU', 'HLXU', 'CSNU', 'TGHU', 'TCLU']), serial = String(ri(r, 100000, 999999));
      const d = TS.REF.checkDigit(owner + serial);
      const wr = [(d + 1) % 10, (d + 3) % 10, (d + 7) % 10];
      return Q('ops', L(`Container ${owner} ${serial} ?. What is the ISO 6346 check digit? (use the calculator if needed)`, `الحاوية ${owner} ${serial} ?. ما رقم التحقّق ISO 6346؟ (استعمل الحاسبة إن احتجت)`), { o: [String(d)].concat(wr.map(String)), a: 0 }, L(`Check digit = ${d}: ${owner}${serial}${d}.`, `رقم التحقّق = ${d}: ${owner}${serial}${d}.`));
    },
    vgm(r) {
      const cargo = ri(r, 30, 220) * 100, dun = ri(r, 4, 25) * 10, tare = pick(r, [2200, 2230, 3750, 3800, 3900, 3950]), v = cargo + dun + tare;
      return Q('ops', L(`VGM method 2: cargo ${N(cargo, 0)} kg, dunnage ${dun} kg, tare ${N(tare, 0)} kg. VGM?`, `VGM الطريقة 2: البضاعة ${N(cargo, 0)} كغ، الدعامات ${dun} كغ، الفارغ ${N(tare, 0)} كغ. كم VGM؟`), numOpts(r, v, [cargo + tare, cargo + dun, cargo], (x) => N(x, 0) + ' kg'), L(`VGM = cargo + dunnage + tare = ${N(v, 0)} kg (the B/L shows only the cargo weight).`, `VGM = البضاعة + الدعامات + الفارغ = ${N(v, 0)} كغ (البوليصة تُظهر وزن البضاعة فقط).`));
    },
    cutoff(r) {
      const cy = TS.addDays(TS.todayISO(), ri(r, 5, 30)), ready = TS.addDays(cy, -ri(r, 0, 5)), ok = TS.diffDays(ready, cy) >= 2;
      return Q('ops', L(`CY cutoff ${WD(cy)}. Cargo ready ${WD(ready)}. Stuffing + trucking take 1 day and you keep 1 day buffer. Can you safely make this vessel?`, `موعد CY ${WD(cy)}. البضاعة جاهزة ${WD(ready)}. التعبئة + النقل يومًا ويوم أمان. هل تلحق بهذه الباخرة بأمان؟`), { o: ok ? [L('Yes', 'نعم'), L('No — book the next vessel', 'لا — احجز الباخرة التالية')] : [L('No — book the next vessel', 'لا — احجز الباخرة التالية'), L('Yes', 'نعم')], a: 0 }, L('You need at least 2 days between cargo ready and the CY cutoff.', 'تحتاج يومين على الأقل بين الجهوزية وموعد CY.'));
    },
    entry(r) {
      const cases = [
        [L('You issue a tax invoice to a client (on credit).', 'تصدر فاتورة ضريبية لزبون (بالآجل).'), L('Dr 411 Clients / Cr 706 Revenue + Cr 4427 Output VAT', 'مدين 411 الزبائن / دائن 706 الإيراد + دائن 4427 ضريبة مخرجات')],
        [L('The client pays your invoice by bank transfer.', 'يدفع الزبون فاتورتك بتحويل مصرفي.'), L('Dr 512 Bank / Cr 411 Clients', 'مدين 512 المصرف / دائن 411 الزبائن')],
        [L('You receive the trucker’s invoice (service + VAT).', 'تستلم فاتورة الناقل (خدمة + ضريبة).'), L('Dr 604 Purchased services + Dr 4426 Input VAT / Cr 401 Suppliers', 'مدين 604 خدمات مشتراة + مدين 4426 ضريبة مدخلات / دائن 401 المورّدون')],
        [L('You pay the shipping line by bank.', 'تدفع للخط الملاحي عبر المصرف.'), L('Dr 401 Suppliers / Cr 512 Bank', 'مدين 401 المورّدون / دائن 512 المصرف')],
        [L('You lodge the client’s container deposit with the line.', 'تودع تأمين حاوية الزبون لدى الخط.'), L('Dr 4191 Deposits paid / Cr 512 Bank', 'مدين 4191 تأمينات مدفوعة / دائن 512 المصرف')],
        [L('The bank charges a transfer fee.', 'يقتطع المصرف رسم تحويل.'), L('Dr 627 Bank charges / Cr 512 Bank', 'مدين 627 مصاريف مصرفية / دائن 512 المصرف')],
      ];
      const k = ri(r, 0, cases.length - 1), right = cases[k][1];
      const wrong = shuffle(r, cases.filter((_, i) => i !== k).map((x) => x[1])).slice(0, 2);
      return Q('acc', cases[k][0], { o: [right].concat(wrong), a: 0 }, L('Debit what you receive / what increases assets or expenses; credit the source.', 'المدين ما تستلمه / ما يزيد الأصول أو المصاريف؛ والدائن المصدر.'));
    },
    hs(r) {
      const cases = [
        [L('Wooden dining chairs, not upholstered', 'كراسي سفرة خشبية غير منجّدة'), '9401.69', ['9403.60', '9401.61', '9403.30']],
        [L('Wooden dining tables', 'طاولات سفرة خشبية'), '9403.60', ['9401.69', '9403.30', '9403.50']],
        [L('Green coffee, not roasted, not decaffeinated', 'بنّ أخضر غير محمّص وغير منزوع الكافيين'), '0901.11', ['0901.21', '0901.12', '2101.11']],
        [L('Laptop computers', 'حواسيب محمولة'), '8471.30', ['8471.41', '8528.52', '8473.30']],
        [L('New radial tyres for passenger cars', 'إطارات شعاعية جديدة لسيارات الركاب'), '4011.10', ['4011.20', '4012.20', '4013.10']],
        [L('Extra virgin olive oil', 'زيت زيتون بكر ممتاز'), '1509.20', ['1509.30', '1510.10', '1515.90']],
        [L('Nitrile examination gloves (medical)', 'قفازات فحص نتريل (طبية)'), '4015.12', ['4015.19', '3926.20', '6116.10']],
      ];
      const [d, right, wr] = pick(r, cases);
      return Q('cus', L(`Training tariff: which HS subheading fits “${d.en}”?`, `التعرفة التدريبية: أي بند HS يناسب «${d.ar}»؟`), { o: [right].concat(wr), a: 0 }, L('Read the heading text first, then the subheading (GIR 1 and 6).', 'اقرأ نص البند أولًا ثم البند الفرعي (القاعدتان 1 و6).'));
    },
  });
  TS.DRILL_CATS = {
    ops: { l: L('Operations & pricing', 'العمليات والتسعير'), keys: ['cbm', 'wm', 'lclFreight', 'eq', 'margin', 'markup', 'dd', 'storage', 'incoterm', 'checkdigit', 'vgm', 'cutoff'] },
    cus: { l: L('Customs', 'الجمارك'), keys: ['cif', 'dutyvat', 'fobcfr', 'hs', 'incoterm'] },
    acc: { l: L('Accounting', 'المحاسبة'), keys: ['vat', 'lbp', 'entry', 'margin'] },
  };

  /* mix lesson questions with generated ones; shuffle options; stable when stored by the caller */
  TS.quizBuild = (pool, drillKeys, r, n) => {
    r = r || Math.random;
    const base = shuffle(r, (pool || []).map((q) => TS.clone(q))).slice(0, Math.max(2, (n || 5) - Math.min(2, (drillKeys || []).length)));
    const gen = shuffle(r, drillKeys || []).slice(0, 2).map((k) => D[k](r)).map((q) => ({ q: q.q, o: q.o, a: q.a, e: q.e }));
    return shuffle(r, base.concat(gen)).map((q) => {
      const idx = q.o.map((_, i) => i), order = shuffle(r, idx);
      return { q: q.q, o: order.map((i) => q.o[i]), a: order.indexOf(q.a), e: q.e || null };
    });
  };

  /* ---------------- the Drills page ---------------- */
  const KEY = 'ts_drills';
  const loadS = () => { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { return {}; } };
  const saveS = (s) => { try { localStorage.setItem(KEY, JSON.stringify(s)); } catch (e) { /* private mode */ } };
  let cur = null, chosen = null, cat = 'all';
  TS.drillsView = (main, defCat) => {
    const st = loadS();
    st.streak = st.streak || 0; st.best = st.best || 0; st.done = st.done || 0; st.right = st.right || 0;
    if (!cur) { cat = defCat || cat; next(); }
    function next() {
      const keys = cat === 'all' ? [...new Set(Object.values(TS.DRILL_CATS).flatMap((c) => c.keys))] : TS.DRILL_CATS[cat].keys;
      const q = D[pick(rnd(), keys)](rnd());
      const order = shuffle(rnd(), q.o.map((_, i) => i));
      cur = { q: q.q, o: order.map((i) => q.o[i]), a: order.indexOf(q.a), e: q.e, cat: q.cat };
      chosen = null;
    }
    const draw = () => {
      const acc = st.done ? Math.round((st.right / st.done) * 100) : 0;
      main.innerHTML = `<h1>🎯 ${esc(t(L('Drills — endless micro-exercises', 'تمارين قصيرة لا تنتهي')))}</h1>
        <p class="muted">${esc(t(L('Every question is generated with new numbers. Keep your streak alive!', 'كل سؤال يُولَّد بأرقام جديدة. حافظ على سلسلة إجاباتك الصحيحة!')))}</p>
        <div class="kpis"><div class="kpi"><div class="k">🔥 ${esc(t(L('Streak', 'السلسلة')))}</div><div class="v">${st.streak}</div></div><div class="kpi"><div class="k">🏆 ${esc(t(L('Best streak', 'أفضل سلسلة')))}</div><div class="v">${st.best}</div></div><div class="kpi"><div class="k">${esc(t(L('Answered', 'أُجيب')))}</div><div class="v">${st.done}</div></div><div class="kpi"><div class="k">${esc(t(L('Accuracy', 'الدقة')))}</div><div class="v">${acc}%</div></div></div>
        <div class="row" style="margin:6px 0 12px">${[['all', L('All', 'الكل')]].concat(Object.entries(TS.DRILL_CATS).map(([k, c]) => [k, c.l])).map(([k, l]) => `<button class="btn sm ${cat === k ? 'primary' : ''}" data-cat="${k}">${esc(t(l))}</button>`).join('')}</div>
        <div class="card drill"><div class="qt">${esc(t(cur.q))}</div>
          <div class="drill-opts">${cur.o.map((o, i) => `<button class="drill-o ${chosen != null ? (i === cur.a ? 'right' : i === chosen ? 'wrong' : '') : ''}" data-o="${i}" ${chosen != null ? 'disabled' : ''}>${esc(t(o))}</button>`).join('')}</div>
          ${chosen != null ? `<div class="note ${chosen === cur.a ? 'ok' : 'bad'}"><strong>${esc(t(chosen === cur.a ? L('Correct!', 'صحيح!') : L('Not this time', 'ليس هذه المرة')))}</strong>${esc(t(cur.e || L('', '')))}</div><div class="row"><button class="btn primary" data-next>${esc(t(L('Next question', 'السؤال التالي')))} →</button></div>` : ''}
        </div>`;
      main.querySelectorAll('[data-cat]').forEach((b) => (b.onclick = () => { cat = b.dataset.cat; next(); draw(); }));
      main.querySelectorAll('[data-o]').forEach((b) => (b.onclick = () => {
        chosen = Number(b.dataset.o); st.done++;
        if (chosen === cur.a) { st.right++; st.streak++; st.best = Math.max(st.best, st.streak); if (st.streak % 5 === 0 && TS.celebrate) TS.celebrate(); } else st.streak = 0;
        saveS(st); draw();
      }));
      const nx = main.querySelector('[data-next]'); if (nx) nx.onclick = () => { next(); draw(); };
    };
    draw();
  };
})();
