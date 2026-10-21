/* Port Master Academy — drills for level 10 (port services, intermodal & maritime law) */
(function () {
  const L = TS.L;
  const R = PT.rnd, P = PT.pick, r1 = PT.r1, r2 = PT.r2;
  const n = (x, d) => TS.num(x, d == null ? 2 : d);
  const add = (x) => PT.drills.push(x);

  add({ id: 'bunkerorder', lvl: 10, icon: '⛽', title: L('Bunker order quantity', 'كمية طلب الوقود'), gen() {
    const dist = R(15, 60) * 100, v = R(12, 18), cons = R(20, 60), res = P([0.1, 0.15, 0.2]), rob = R(40, 300);
    const days = dist / (v * 24), order = days * cons * (1 + res) - rob;
    return { q: L(`Next voyage ${n(dist, 0)} nm at ${v} kn, ${cons} t/day, reserve ${res * 100}%, ROB ${rob} t. Quantity to order (t, 1 decimal; can be negative = no order)?`, `الرحلة التالية ${n(dist, 0)} ميل بسرعة ${v} عقدة، ${cons} طن/يوم، احتياطي ${res * 100}%، المتبقّي ${rob} طن. الكمية المطلوبة (طن، رقم عشري واحد؛ قد تكون سالبة = لا طلب)؟`), a: r1(order), tol: 0.15, unit: 't',
      sol: L(`Days = ${dist} ÷ (${v} × 24) = ${n(days)}\nNeed = ${n(days)} × ${cons} × ${1 + res} = ${n(days * cons * (1 + res), 1)}\nOrder = ${n(days * cons * (1 + res), 1)} − ${rob} = ${n(order, 1)} t`, `الأيام = ${dist} ÷ (${v} × 24) = ${n(days)}\nالحاجة = ${n(days)} × ${cons} × ${1 + res} = ${n(days * cons * (1 + res), 1)}\nالطلب = ${n(days * cons * (1 + res), 1)} − ${rob} = ${n(order, 1)} طن`) };
  } });

  add({ id: 'bunkermass', lvl: 10, icon: '🛢', title: L('Bunker delivered mass', 'كتلة الوقود المسلّمة'), gen() {
    const vol = R(80, 900), vcf = r2(R(960, 995) / 10) / 100, dens = P([0.89, 0.91, 0.935, 0.95, 0.975]);
    const m = vol * vcf * dens;
    return { q: L(`Barge delivered ${vol} m³ (observed), VCF ${vcf}, density at 15 °C ${dens}. Mass (t, 2 decimals)?`, `سلّمت البارجة ${vol} م³ (ملاحظ)، VCF = ${vcf}، الكثافة عند 15 °م ${dens}. الكتلة (طن، رقمان عشريان)؟`), a: r2(m), tol: 0.02, unit: 't', sol: L(`${vol} × ${vcf} × ${dens} = ${n(m)} t`, `${vol} × ${vcf} × ${dens} = ${n(m)} طن`) };
  } });

  add({ id: 'portdues', lvl: 10, icon: '🧾', title: L('Port dues, pilotage & towage', 'رسوم الميناء والإرشاد والقطر'), gen() {
    const gt = R(5, 120) * 1000, pd = P([0.08, 0.1, 0.12, 0.15]), pil = P([0.02, 0.025, 0.03]), tugs = R(1, 3), tr = R(18, 35) * 100;
    const tot = gt * pd + gt * pil * 2 + tugs * 2 * tr;
    return { q: L(`GT ${n(gt, 0)}. Port dues USD ${pd}/GT, pilotage USD ${pil}/GT per movement (in + out), ${tugs} tug(s) in and out at USD ${n(tr, 0)} per tug-movement. Total (USD)?`, `GT ${n(gt, 0)}. رسوم الميناء ${pd} دولار/GT، الإرشاد ${pil} دولار/GT لكل حركة (دخول + خروج)، ${tugs} قاطرة/قاطرات دخولًا وخروجًا بـ ${n(tr, 0)} دولار لكل حركة قاطرة. المجموع (دولار)؟`), a: r2(tot), tol: 1, unit: 'USD',
      sol: L(`Dues ${n(gt * pd)} + pilotage ${n(gt * pil * 2)} + towage ${tugs * 2} × ${tr} = ${n(tugs * 2 * tr)} → USD ${n(tot)}`, `الرسوم ${n(gt * pd)} + الإرشاد ${n(gt * pil * 2)} + القطر ${tugs * 2} × ${tr} = ${n(tugs * 2 * tr)} ← ${n(tot)} دولار`) };
  } });

  add({ id: 'gavg', lvl: 10, icon: '⚖', title: L('General average contribution', 'مساهمة العوارية العامة'), gen() {
    const loss = R(5, 60) / 10, vals = R(40, 300), cargo = R(50, 2000) * 1000;
    const pay = cargo * loss / vals;
    return { q: L(`GA loss USD ${loss} M; total contributory values USD ${vals} M. Your cargo is worth USD ${n(cargo, 0)}. Your contribution (USD, nearest whole)?`, `خسارة العوارية ${loss} مليون دولار؛ إجمالي القيم المساهمة ${vals} مليونًا. قيمة بضاعتك ${n(cargo, 0)} دولار. مساهمتك (دولار، لأقرب عدد صحيح)؟`), a: Math.round(pay), tol: 1, unit: 'USD',
      sol: L(`Rate = ${loss} ÷ ${vals} = ${n(loss / vals * 100, 3)}%\n${n(cargo, 0)} × ${n(loss / vals, 5)} = USD ${n(pay, 0)}`, `النسبة = ${loss} ÷ ${vals} = ${n(loss / vals * 100, 3)}%\n${n(cargo, 0)} × ${n(loss / vals, 5)} = ${n(pay, 0)} دولار`) };
  } });

  add({ id: 'rail', lvl: 10, icon: '🚆', title: L('Rail shuttle capacity', 'طاقة القطار المكوكي'), gen() {
    const w = R(20, 40), teu = P([2, 3]), trains = R(1, 6), days = P([300, 330, 360]);
    const yr = w * teu * trains * days;
    return { q: L(`${trains} train(s)/day, ${w} wagons × ${teu} TEU, ${days} operating days. Annual rail capacity (TEU)?`, `${trains} قطار/قطارات يوميًا، ${w} عربة × ${teu} TEU، ${days} يوم تشغيل. الطاقة السنوية للسكك (TEU)؟`), a: yr, tol: 0, unit: 'TEU', sol: L(`${w} × ${teu} × ${trains} × ${days} = ${n(yr, 0)} TEU/yr`, `${w} × ${teu} × ${trains} × ${days} = ${n(yr, 0)} TEU/سنة`) };
  } });

  add({ id: 'freshwater', lvl: 10, icon: '💧', title: L('Fresh water order', 'طلب المياه العذبة'), gen() {
    const crew = R(16, 30), days = R(5, 25), lpp = P([150, 180, 200, 250]), tech = R(0, 4), rob = R(10, 80);
    const need = (crew * lpp / 1000 + tech) * days * 1.2 - rob;
    return { q: L(`${crew} crew × ${lpp} L/day + ${tech} t/day technical, ${days} days, 20% reserve, ROB ${rob} t. Order (t, 1 decimal)?`, `${crew} بحّارًا × ${lpp} لتر/يوم + ${tech} طن/يوم فني، ${days} يومًا، احتياطي 20%، المتبقّي ${rob} طن. الطلب (طن، رقم عشري واحد)؟`), a: r1(need), tol: 0.15, unit: 't',
      sol: L(`Daily = ${crew} × ${lpp / 1000} + ${tech} = ${n(crew * lpp / 1000 + tech)} t × ${days} × 1.2 = ${n((crew * lpp / 1000 + tech) * days * 1.2, 1)} − ${rob} = ${n(need, 1)} t`, `اليومي = ${crew} × ${lpp / 1000} + ${tech} = ${n(crew * lpp / 1000 + tech)} طن × ${days} × 1.2 = ${n((crew * lpp / 1000 + tech) * days * 1.2, 1)} − ${rob} = ${n(need, 1)} طن`) };
  } });
})();
