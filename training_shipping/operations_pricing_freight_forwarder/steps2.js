/* Operations & Pricing — steps 7 to 12, driven by the client case (FCL / LCL, import / export, payment terms) */
(function () {
  const L = TS.L, t = TS.t, esc = TS.esc, R2 = TS.round2;
  const OPS = window.OPS;
  const ui = () => OPS.ui;
  const { imp, lcl, LB, yesNo, lesson, mix, pickK } = OPS.h;
  const line = (k) => OPS.lines[k];
  const bank = (sc) => (sc.payKind === 'cad' || sc.payKind === 'lc');

  /* party structure on the bills of lading */
  OPS.blParties = (s) => {
    const sc = OPS.sc(s), co = OPS.company.name;
    const hblCons = bank(sc) ? 'TO ORDER' : sc.consignee.name;
    return imp(s)
      ? { mblShipper: sc.agent.name, mblConsignee: co, mblNotify: co, hblShipper: sc.shipper.name, hblConsignee: hblCons, hblNotify: sc.consignee.name }
      : { mblShipper: co, mblConsignee: sc.agent.name, mblNotify: sc.agent.name, hblShipper: sc.shipper.name, hblConsignee: hblCons, hblNotify: sc.consignee.name };
  };
  /* three errors injected in the draft, different for every shipment */
  OPS.blErrors = (s) => { s.blErr = s.blErr || pickK(s, 71, ['consignee', 'pod', 'weight', 'seal', 'freight', 'pkgs', 'cbm', 'notify'], 3); return s.blErr; };
  OPS.blNumbers = (s) => ({ mblNo: line(s.booking.carrier).scac + s.booking.no.replace(/\D/g, '').slice(-8), hblNo: OPS.company.short + (imp(s) ? 'I' : 'E') + s.sim.start.slice(2, 4) + String(1000 + (OPS.seed(s) % 9000)) });

  OPS.mblFields = (s, fixed) => {
    const p = OPS.blParties(s), j = s.jobFile, e = s.equipment, bk = s.booking, sc = OPS.sc(s);
    const errs = fixed ? [] : OPS.blErrors(s);
    let sealBad = e.seal.slice(0, -2) + e.seal.slice(-1) + e.seal.slice(-2, -1);
    if (sealBad === e.seal) sealBad = e.seal.slice(0, -1) + ((Number(e.seal.slice(-1)) + 1) % 10);
    const wrongPod = OPS.PORTS.find((x) => x.code !== j.pod && x.code !== j.pol && x.region === OPS.port(j.pod).region) || OPS.port('MZBEW');
    const meas = lcl(s) && e.measuredCbm ? e.measuredCbm : j.cbm;
    return [
      { id: 'shipper', l: 'Shipper', v: p.mblShipper },
      { id: 'consignee', l: 'Consignee', v: errs.includes('consignee') ? p.mblConsignee.replace('Training', 'Trianing').replace('Freight', 'Fright') : p.mblConsignee },
      { id: 'notify', l: 'Notify party', v: errs.includes('notify') ? sc.shipper.name : p.mblNotify },
      { id: 'vessel', l: 'Vessel / voyage', v: bk.vessel + ' / ' + bk.voyage },
      { id: 'pol', l: 'Port of loading', v: OPS.portName(j.pol) },
      { id: 'pod', l: 'Port of discharge', v: errs.includes('pod') ? OPS.portName(wrongPod.code) : OPS.portName(j.pod) },
      { id: 'cntr', l: 'Container no.', v: e.containerNo + ' / ' + e.type + (lcl(s) ? ' — CFS/CFS' : '') },
      { id: 'seal', l: 'Seal no.', v: errs.includes('seal') ? sealBad : e.seal },
      { id: 'pkgs', l: 'No. of packages', v: (errs.includes('pkgs') ? j.packages - 10 - (OPS.seed(s) % 7) : j.packages) + ' ' + j.pkgType.toUpperCase() },
      { id: 'desc', l: 'Description of goods', v: (lcl(s) ? 'PART OF CONTAINER — ' : 'SHIPPER’S LOAD, STOW & COUNT — SAID TO CONTAIN: ') + j.commodity.toUpperCase() + ' — HS ' + j.hs },
      { id: 'weight', l: 'Gross weight', v: TS.num(errs.includes('weight') ? Math.round(j.grossKg * 0.9 / 10) * 10 : j.grossKg, 0) + ' KGS' },
      { id: 'cbm', l: 'Measurement', v: TS.num(errs.includes('cbm') ? meas * 10 : meas, 2) + ' CBM' },
      { id: 'freight', l: 'Freight', v: errs.includes('freight') ? (bk.freightTerms === 'Prepaid' ? 'FREIGHT COLLECT' : 'FREIGHT PREPAID') : 'FREIGHT ' + bk.freightTerms.toUpperCase() },
    ];
  };

  /* ============================================================ 7. SI & B/L */
  OPS.steps.push({
    id: 'si',
    title: L('Shipping instructions & draft B/L', 'تعليمات الشحن ومسودة البوليصة'),
    sub: L('Decide who appears on the master and house B/L, send the SI before cutoff and check the draft carefully.', 'حدّد من يظهر على البوليصة الرئيسية وبوليصة الوكيل، أرسل SI قبل الموعد وراجع المسودة بدقّة.'),
    lesson: lesson('si'),
    parts: [
      {
        id: 'parties',
        title: L('Who goes on the MBL and the HBL?', 'من يظهر على MBL وHBL؟'),
        render(ctx, b) {
          const s = ctx.ship, sc = ctx.sc, p = OPS.blParties(s);
          const opts = OPS.shuffle(OPS.srng(s, 72), [sc.shipper.name, sc.consignee.name, sc.agent.name, OPS.company.name, 'TO ORDER']).map((v) => ({ v, l: v }));
          const F = (k, lab) => ({ k, label: lab, type: 'select', options: opts, ans: () => p[k], path: 'documents.parties.' + k });
          const pay = t(sc.payment);
          ui().form(ctx, b, {
            key: 'parties',
            intro: imp(s) ? L(`You are the buyer’s forwarder in Beirut; ${sc.agent.name} is your agent in ${sc.far.city}. Payment: ${sc.payment.en}.`, `أنت وكيل شحن المشتري في بيروت؛ ${sc.agent.name} وكيلك في ${sc.far.city}. الدفع: ${sc.payment.ar}.`) : L(`You are the seller’s forwarder in Beirut; ${sc.agent.name} is your agent in ${sc.far.city}. Payment: ${sc.payment.en}.`, `أنت وكيل شحن البائع في بيروت؛ ${sc.agent.name} وكيلك في ${sc.far.city}. الدفع: ${sc.payment.ar}.`),
            fields: [F('mblShipper', L('MBL — shipper', 'MBL — الشاحن')), F('mblConsignee', L('MBL — consignee', 'MBL — المرسل إليه')), F('mblNotify', L('MBL — notify', 'MBL — المُخطَر')), F('hblShipper', L('HBL — shipper', 'HBL — الشاحن')), Object.assign(F('hblConsignee', L('HBL — consignee', 'HBL — المرسل إليه')), { fb: bank(sc) ? L('Payment through a bank (CAD/L/C): the HBL is made out “TO ORDER” so the bank controls the goods.', 'الدفع عبر مصرف (مستندات/اعتماد): تُصدر HBL «لأمر» ليتحكّم المصرف بالبضاعة.') : L('No bank involved: consign the HBL straight to the buyer.', 'لا مصرف: تُصدر HBL مباشرة باسم المشتري.') }), F('hblNotify', L('HBL — notify', 'HBL — المُخطَر'))],
            onSuccess: () => ctx.finish('parties'),
          });
          void pay;
        },
      },
      {
        id: 'si',
        title: L('Send the shipping instructions', 'أرسل تعليمات الشحن'),
        render(ctx, b) {
          const s = ctx.ship, bk = s.booking, e = s.equipment, j = s.jobFile, isL = lcl(s);
          if (ctx.data.waiting) { b.innerHTML = `<p class="muted">⏳ ${t(L('SI submitted — waiting for the draft B/L…', 'قُدّمت SI — بانتظار مسودة البوليصة…'))}</p>`; return; }
          const meas = isL && e.measuredCbm ? e.measuredCbm : j.cbm;
          ui().form(ctx, b, {
            key: 'si', submit: L('Submit SI', 'قدّم SI'),
            intro: L(`SI cutoff: ${TS.fmtDate(bk.cutoffs.si)}. Today: ${TS.fmtDate(s.sim.today)}.${isL ? ' Use the CFS measurement for the B/L.' : ''}`, `موعد SI: ${TS.fmtDate(bk.cutoffs.si)}. اليوم: ${TS.fmtDate(s.sim.today)}.${isL ? ' استعمل قياس المحطة للبوليصة.' : ''}`),
            fields: [
              { k: 'bk', label: L('Booking no.', 'رقم الحجز'), ans: () => bk.no },
              { k: 'cn', label: L('Container no.', 'رقم الحاوية'), ans: () => e.containerNo },
              { k: 'seal', label: L('Seal no.', 'رقم الختم'), ans: () => e.seal },
              { k: 'pk', label: L('Packages', 'الطرود'), type: 'number', ans: () => j.packages },
              { k: 'desc', label: L('Description of goods', 'وصف البضاعة'), contains: ctx.sc.cargo.keywords, containsAlt: ctx.sc.cargo.keywordsAr, ans: () => j.commodity, full: true },
              { k: 'kg', label: L('Gross weight on B/L', 'الوزن الإجمالي على البوليصة'), unit: 'kg', type: 'number', tol: 2, ans: () => j.grossKg, fb: L('The B/L shows the cargo gross weight — not the VGM (which includes the container tare).', 'البوليصة تُظهر الوزن الإجمالي للبضاعة — وليس VGM (الذي يشمل وزن الحاوية).') },
              { k: 'cbm', label: L('Measurement', 'الحجم'), unit: 'CBM', type: 'number', tol: 0.05, ans: () => meas },
              { k: 'ft', label: L('Freight terms (MBL)', 'شروط الشحن (MBL)'), type: 'select', options: [{ v: 'Prepaid', l: 'Prepaid' }, { v: 'Collect', l: 'Collect' }], ans: () => bk.freightTerms },
              { k: 'date', label: L('SI submission date', 'تاريخ تقديم SI'), type: 'date', ans: () => (s.sim.today > bk.cutoffs.si ? bk.cutoffs.si : s.sim.today), check: (v) => (v > bk.cutoffs.si ? L('After the SI cutoff — late fee or rolled.', 'بعد موعد SI — رسم تأخير أو تأجيل.') : !isL && v < s.equipment.stuffedOn ? L('You cannot send final SI before stuffing (container/seal unknown).', 'لا يمكنك إرسال SI نهائية قبل التعبئة (الحاوية/الختم غير معروفين).') : true) },
            ],
            onSuccess: (v) => {
              s.documents.si = Object.assign({ submitted: v.date }, v, { parties: OPS.blParties(s) });
              ctx.send({ to: line(bk.carrier).email, subject: 'SI — booking ' + bk.no, body: L('Please find our shipping instructions for booking ' + bk.no + ' attached.', 'مرفق تعليمات الشحن للحجز ' + bk.no + '.'), attachments: [{ name: 'SI_' + bk.no + '.pdf', doc: 'si' }] });
              ctx.data.waiting = true;
              ctx.receive({ from: line(bk.carrier).email, subject: L('Draft B/L for approval — ' + bk.no, 'مسودة البوليصة للموافقة — ' + bk.no), body: L('Dear customer,\n\nPlease check and approve the attached draft B/L within 24 hours. Amendments after manifest filing are subject to fees.\n\nDocumentation team', 'عميلنا العزيز،\n\nيرجى مراجعة مسودة البوليصة المرفقة والموافقة خلال 24 ساعة. التعديلات بعد تقديم المانيفست تخضع لرسوم.\n\nفريق المستندات'), attachments: [{ name: 'DRAFT_MBL.pdf', doc: 'mbl' }], onArrive: (sh) => { const w = sh.work.si; w.data.waiting = false; w.parts.si = true; } }, 1400);
              ctx.save(); ctx.rerender();
            },
          });
        },
        summary: (ctx) => `<p>✓ ${t(L('SI submitted on', 'قُدّمت SI بتاريخ'))} ${TS.fmtDate(ctx.ship.documents.si.submitted)} <button class="btn sm ghost" data-doc-open="si">📄 SI</button></p>`,
      },
      {
        id: 'draft',
        title: L('Check the draft master B/L', 'راجع مسودة البوليصة الرئيسية'),
        render(ctx, b) {
          const s = ctx.ship, f = OPS.mblFields(s, false), errs = OPS.blErrors(s);
          const doc = `<div class="doc ltr" dir="ltr"><h2>DRAFT — BILL OF LADING (${esc(s.booking.carrierName)})</h2><div class="table-wrap"><table><tbody>${f.map((x) => `<tr><th style="width:190px">${x.l}</th><td>${esc(x.v)}</td></tr>`).join('')}</tbody></table></div></div>`;
          ui().choice(ctx, b, {
            key: 'draft', multi: true, pre: doc,
            q: L('Compare with your SI and job file. Tick every field that is WRONG.', 'قارن مع SI وملف العملية. اختر كل حقل فيه خطأ.'),
            options: f.map((x) => ({ l: L(x.l, x.l), ok: errs.includes(x.id) })),
            submit: L('Request amendment', 'اطلب التعديل'),
            onSuccess: () => {
              s.documents.bl = Object.assign(s.documents.bl || {}, OPS.blNumbers(s), { draftErrorsFound: errs, draftApproved: true, approvedOn: s.sim.today });
              ctx.send({ to: line(s.booking.carrier).email, subject: 'Amendment draft B/L — ' + s.booking.no, body: L('Please correct: ' + errs.join(', ') + ' as per our SI, and resend the draft.', 'يرجى تصحيح: ' + errs.join('، ') + ' حسب SI وإعادة إرسال المسودة.') });
              ctx.receive({ from: line(s.booking.carrier).email, subject: L('Corrected draft B/L — ' + s.booking.no, 'مسودة مصحّحة — ' + s.booking.no), body: L('Corrected as requested. MBL no. ' + s.documents.bl.mblNo + '. Approved for issue after sailing.', 'تم التصحيح. رقم البوليصة ' + s.documents.bl.mblNo + '. معتمدة للإصدار بعد الإبحار.'), attachments: [{ name: 'MBL_' + s.documents.bl.mblNo + '.pdf', doc: 'mbl' }] });
              ctx.finish('draft');
            },
          });
        },
        summary: (ctx) => `<p>✓ ${t(L('Draft corrected and approved — MBL', 'صُحّحت المسودة واعتُمدت — MBL'))} <b class="mono">${esc(ctx.ship.documents.bl.mblNo)}</b></p>`,
      },
      {
        id: 'hbl',
        title: L('Get the shipper’s approval of the draft HBL', 'احصل على موافقة الشاحن على مسودة HBL'),
        render(ctx, b) {
          const s = ctx.ship, sc = ctx.sc;
          if (ctx.data.waiting) { b.innerHTML = `<p class="muted">⏳ ${t(L('Waiting for approval…', 'بانتظار الموافقة…'))}</p>`; return; }
          const to = imp(s) ? sc.agent : sc.client;
          b.innerHTML = `<p>${t(imp(s) ? L('Your agent issues the HBL at origin on your behalf; the supplier must approve the draft.', 'وكيلك يصدر HBL في المنشأ نيابةً عنك؛ ويجب أن يوافق المورّد على المسودة.') : L('You issue the HBL. Send the draft to your client (the shipper) for written approval.', 'أنت تصدر HBL. أرسل المسودة إلى زبونك (الشاحن) للموافقة الخطية.'))}${sc.payKind === 'lc' ? ' ' + t(L('Under an L/C the description must match the credit word for word.', 'في الاعتماد المستندي يجب أن يطابق الوصف الاعتماد حرفيًا.')) : ''}</p><p><button class="btn sm ghost" data-doc-open="hbl">📄 ${t(L('Preview the HBL', 'معاينة HBL'))}</button></p><button class="btn primary" id="snd">${t(L('Send draft HBL for approval', 'أرسل مسودة HBL للموافقة'))} ✉</button>`;
          b.querySelector('#snd').onclick = () => {
            ctx.send({ to: to.email, subject: L('Draft HBL ' + s.documents.bl.hblNo + ' for approval', 'مسودة HBL ' + s.documents.bl.hblNo + ' للموافقة'), body: L('Please review the attached draft house B/L and confirm in writing.', 'يرجى مراجعة مسودة بوليصة الوكيل المرفقة والتأكيد خطيًا.'), attachments: [{ name: 'DRAFT_HBL_' + s.documents.bl.hblNo + '.pdf', doc: 'hbl' }] });
            ctx.data.waiting = true;
            ctx.receive({ from: imp(s) ? sc.shipper.email : sc.client.email, subject: L('RE: Draft HBL — approved', 'رد: مسودة HBL — موافقة'), body: L('Draft HBL checked — approved, please issue.', 'تمت مراجعة المسودة — موافقة، يرجى الإصدار.'), onArrive: (sh) => { const w = sh.work.si; w.data.waiting = false; w.parts.hbl = true; sh.documents.bl.hblApproved = sh.sim.today; OPS.app.checkStep(sh, OPS.steps.find((x) => x.id === 'si')); } }, 1300);
            ctx.save(); ctx.rerender();
          };
        },
        summary: () => `<p>✓ ${t(L('HBL draft approved in writing.', 'تمت الموافقة الخطية على مسودة HBL.'))}</p>`,
      },
    ],
    quiz: OPS.QUIZ.si, drills: OPS.QUIZ_DRILLS.si,
  });

  /* ============================================================ 8. SAILING, RELEASE, PRE-ALERT */
  function releaseOptions(s) {
    const sc = OPS.sc(s), k = sc.payKind;
    const tel = { l: L('Original HBLs issued; after payment they are surrendered and a telex release is sent to destination.', 'تصدر أصول HBL؛ بعد الدفع تُسلَّم ويُرسل تلكس ريليز إلى الوجهة.') };
    const sea = { l: L('Express release / seaway bill straight to the consignee — no originals needed.', 'إفراج سريع / Seaway bill مباشرة للمرسل إليه — بدون أصول.') };
    const obl = { l: L('A full set of 3 original HBLs “TO ORDER”, handed over for presentation to the bank.', 'مجموعة كاملة من 3 أصول HBL «لأمر» تُسلَّم لتقديمها للمصرف.') };
    const sw = { l: L('A switch B/L issued in Dubai.', 'Switch B/L تصدر في دبي.'), fb: L('No reason for a switch here — and it adds fraud risk.', 'لا سبب لـ Switch هنا — ويضيف خطر احتيال.') };
    if (k === 'advance') return { q: L('The buyer has already paid 100% in advance. Which HBL release do you use?', 'دفع المشتري 100% مسبقًا. أي إفراج HBL تستعمل؟'), good: Object.assign(sea, { fb: L('Paid already: no reason to block the goods with originals.', 'مدفوع مسبقًا: لا سبب لحجز البضاعة بالأصول.') }), bad: [Object.assign(obl, { fb: L('Originals by courier only slow things down (and risk demurrage) when the goods are paid.', 'الأصول بالبريد تبطئ الأمور (وخطر غرامات) عندما تكون البضاعة مدفوعة.') }), sw], type: 'Seaway bill / express release (paid in advance)' };
    if (k === 'tt_copy') return { q: L('The supplier is paid the balance against a copy of the B/L. How do you keep the supplier in control until paid?', 'يُدفع للمورّد الرصيد مقابل نسخة البوليصة. كيف يحتفظ المورّد بالسيطرة حتى الدفع؟'), good: Object.assign(tel, { fb: L('Control until payment, then fast electronic release.', 'سيطرة حتى الدفع ثم إفراج إلكتروني سريع.') }), bad: [Object.assign(sea, { fb: L('The supplier would lose control before being paid.', 'سيخسر المورّد السيطرة قبل أن يُدفع له.') }), sw], type: 'Original (3/3) at origin → telex release after payment' };
    return { q: k === 'lc' ? L('Payment is by documentary letter of credit. What do you issue?', 'الدفع باعتماد مستندي. ماذا تصدر؟') : L('Payment is Cash Against Documents through the buyer’s bank. What do you issue?', 'الدفع مقابل المستندات عبر مصرف المشتري. ماذا تصدر؟'), good: Object.assign(obl, { fb: L('The bank needs the original title documents to control the goods.', 'المصرف يحتاج مستندات الملكية الأصلية للتحكّم بالبضاعة.') }), bad: [Object.assign(tel, { fb: L('A telex release lets the goods go without the bank — the buyer could take them without paying.', 'التلكس يُخرج البضاعة بدون المصرف — يمكن للمشتري أخذها بدون دفع.') }), Object.assign(sea, { fb: L('Same problem: no title control.', 'المشكلة نفسها: لا سيطرة على الملكية.') })], type: 'Original (3/3) TO ORDER — ' + (k === 'lc' ? 'L/C' : 'CAD') + ' via bank' };
  }
  OPS.releaseType = (s) => releaseOptions(s).type;

  OPS.steps.push({
    id: 'sailing',
    title: L('Sailing, B/L release & pre-alert', 'الإبحار، إصدار البوليصة والإشعار المسبق'),
    sub: L('The vessel sails: issue the right type of B/L, handle freight payment and send/receive the pre-alert.', 'أبحرت الباخرة: أصدر النوع المناسب من البوليصة، تعامل مع دفع الشحن وأرسل/استلم الإشعار المسبق.'),
    lesson: lesson('sailing'),
    parts: [
      {
        id: 'release',
        title: L('Choose the house B/L release', 'اختر طريقة إفراج بوليصة الوكيل'),
        render(ctx, b) {
          const s = ctx.ship; OPS.sailed(s); ctx.save();
          const ro = releaseOptions(s);
          ui().choice(ctx, b, {
            key: 'rel',
            pre: `<div class="note ok">⛴ ${t(L('Vessel departed', 'أبحرت الباخرة'))} ${esc(s.booking.vessel)} — ATD ${TS.fmtDate(s.booking.etd)}. ${t(L('Payment terms', 'شروط الدفع'))}: <b>${t(ctx.sc.payment)}</b></div>`,
            q: ro.q, options: OPS.shuffle(OPS.srng(s, 81), [Object.assign({ ok: true }, ro.good)].concat(ro.bad.map((x) => Object.assign({ ok: false }, x)))),
            onSuccess: () => { s.documents.bl.hblType = ro.type; s.documents.bl.issuedOn = s.booking.etd; ctx.finish('release'); },
          });
        },
        summary: (ctx) => `<p>✓ HBL ${esc(ctx.ship.documents.bl.hblNo)}: ${esc(ctx.ship.documents.bl.hblType)} <button class="btn sm ghost" data-doc-open="hbl">📄 HBL</button></p>`,
      },
      {
        id: 'mbl',
        title: L('Master B/L & freight payment', 'البوليصة الرئيسية ودفع الشحن'),
        render(ctx, b) {
          const s = ctx.ship;
          if (imp(s)) {
            ui().choice(ctx, b, {
              key: 'mbl', q: L('The MBL consignee is your own company in Beirut and freight is collect. Which MBL release do you ask for?', 'المرسل إليه في MBL هو شركتك في بيروت والشحن يُدفع عند الوصول. أي إفراج تطلب؟'),
              options: OPS.shuffle(OPS.srng(s, 82), [
                { l: L('Seaway bill / express release — released to you in Beirut once freight and local charges are paid', 'Seaway bill / إفراج سريع — يُفرج لك في بيروت بعد دفع الشحن والرسوم المحلية'), ok: true },
                { l: L('3 original MBLs couriered from origin', '3 أصول MBL تُرسل بالبريد السريع من المنشأ'), ok: false, fb: L('Slow and costly between two offices that trust each other; risk of late originals → demurrage.', 'بطيء ومكلف بين مكتبين يثقان ببعضهما؛ خطر تأخّر الأصول ← غرامات.') },
                { l: L('Switch B/L', 'Switch B/L'), ok: false, fb: L('Not needed.', 'غير ضروري.') },
              ]),
              onSuccess: () => { s.documents.bl.mblType = 'Seaway bill (express release)'; ctx.finish('mbl'); },
            });
          } else {
            const q = s.quotation, carrierBuy = R2(q.lines.filter((l) => l.vendor === 'carrier').reduce((a, l) => a + Number(l.buy) * (l.qty || 1), 0) + (s.lclAdj ? s.lclAdj.buy : 0));
            ui().form(ctx, b, {
              key: 'mblpay', intro: L(`Freight is prepaid: ${s.booking.carrierName} invoices you before releasing the MBL. Calculate the invoice from your buy lines (vendor = carrier, × quantity)${s.lclAdj ? ' plus the W/M adjustment' : ''}.`, `الشحن مسبق الدفع: ${s.booking.carrierName} يفوترك قبل الإفراج عن MBL. احسب الفاتورة من بنود الكلفة (المورّد = الخط، × الكمية)${s.lclAdj ? ' مع فرق W/M' : ''}.`),
              fields: [
                { k: 'amt', label: L('Amount payable to the carrier', 'المبلغ المستحق للناقل'), unit: 'USD', type: 'number', tol: 1, ans: () => carrierBuy },
                { k: 'type', label: L('MBL release type (to your destination agent)', 'نوع إفراج MBL (لوكيلك في الوجهة)'), type: 'select', options: [{ v: 'seaway', l: L('Seaway bill / express release', 'Seaway bill / إفراج سريع') }, { v: 'obl', l: L('3 originals by courier', '3 أصول بالبريد') }], ans: () => 'seaway' },
              ],
              onSuccess: (v) => { s.documents.bl.mblType = 'Seaway bill (express release)'; s.closing.carrierPaid = v.amt; ctx.send({ to: line(s.booking.carrier).email, subject: 'Payment ' + s.documents.bl.mblNo, body: L('Payment USD ' + TS.num(v.amt) + ' transferred. Please release MBL as seaway bill.', 'تم تحويل ' + TS.num(v.amt) + ' دولار. يرجى إصدار MBL كـ Seaway bill.') }); ctx.finish('mbl'); },
            });
          }
        },
        summary: (ctx) => `<p>✓ MBL ${esc(ctx.ship.documents.bl.mblNo)}: ${esc(ctx.ship.documents.bl.mblType)}</p>`,
      },
      {
        id: 'prealert',
        title: L('Pre-alert', 'الإشعار المسبق'),
        render(ctx, b) {
          const s = ctx.ship, sc = ctx.sc;
          if (imp(s)) {
            const all = [['Packing list', L('Packing list', 'قائمة التعبئة'), 'pl'], ['Commercial invoice', L('Commercial invoice', 'الفاتورة التجارية'), 'ci'], ['Certificate of origin', L('Certificate of origin', 'شهادة المنشأ'), 'coo']];
            const miss = all[OPS.seed(s) % 3];
            if (!s.emails.find((e) => e.step === 'sailing' && e.from === sc.agent.email && String(e.subject.en || e.subject).startsWith('PRE-ALERT'))) {
              const att = [{ name: 'MBL_copy.pdf', doc: 'mbl' }, { name: 'HBL_copy.pdf', doc: 'hbl' }].concat(all.filter((x) => x !== miss).map((x) => ({ name: x[0].replace(/ /g, '_') + '.pdf', doc: x[2] })));
              OPS.emailPush(s, 'in', { from: sc.agent.email, to: OPS.company.email, step: 'sailing', read: false, subject: L('PRE-ALERT ' + s.documents.bl.hblNo + ' / ' + s.booking.vessel, 'PRE-ALERT ' + s.documents.bl.hblNo + ' / ' + s.booking.vessel), body: L(`Dear colleagues,\n\nPlease find pre-alert for HBL ${s.documents.bl.hblNo} / MBL ${s.documents.bl.mblNo}.\nVessel ${s.booking.vessel} ${s.booking.voyage} sailed ${TS.fmtDate(s.booking.etd)}, ETA Beirut ${TS.fmtDate(s.booking.eta)}.\nContainer ${s.equipment.containerNo} seal ${s.equipment.seal}${lcl(s) ? ' (consolidated)' : ''}.\nHBL release: ${s.documents.bl.hblType}.\n\nAttached: ${att.map((a) => a.name).join(', ')}.\n\n${sc.agent.contact}`, `زملاءنا الأعزاء،\n\nمرفق الإشعار المسبق لـ HBL ${s.documents.bl.hblNo} / MBL ${s.documents.bl.mblNo}.\nالباخرة ${s.booking.vessel} ${s.booking.voyage} أبحرت ${TS.fmtDate(s.booking.etd)}، الوصول لبيروت ${TS.fmtDate(s.booking.eta)}.\nالحاوية ${s.equipment.containerNo} الختم ${s.equipment.seal}${lcl(s) ? ' (مجمّعة)' : ''}.\nإفراج HBL: ${s.documents.bl.hblType}.\n\nالمرفقات: ${att.map((a) => a.name).join('، ')}.\n\n${sc.agent.contact}`), attachments: att });
              ctx.save();
            }
            ui().choice(ctx, b, {
              key: 'pa', q: L(`The pre-alert from ${sc.far.city} is in your inbox. Which document needed for Lebanese customs is missing?`, `الإشعار المسبق من ${sc.far.city} في بريدك. أي مستند ضروري للجمارك اللبنانية ناقص؟`),
              options: OPS.shuffle(OPS.srng(s, 83), [{ l: miss[1], ok: true }, { l: L('Arrival notice', 'إشعار الوصول'), ok: false, fb: L('You issue the arrival notice at destination.', 'أنت تصدر إشعار الوصول في الوجهة.') }, { l: L('Delivery order', 'إذن التسليم'), ok: false, fb: L('The D/O is issued at destination.', 'يصدر إذن التسليم في الوجهة.') }, { l: L('Lebanese customs declaration', 'البيان الجمركي اللبناني'), ok: false, fb: L('Lodged in Beirut by the broker, not sent by origin.', 'يقدّمه المخلّص في بيروت ولا يُرسل من المنشأ.') }]),
              onSuccess: () => {
                ctx.send({ to: sc.agent.email, subject: L('RE: PRE-ALERT ' + s.documents.bl.hblNo + ' — ' + miss[0].toLowerCase() + ' missing', 'رد: PRE-ALERT ' + s.documents.bl.hblNo + ' — ' + miss[1].ar + ' ناقصة'), body: L(`Thanks. Please send the ${miss[0].toLowerCase()} today — our client needs it for the Lebanese customs declaration.`, `شكرًا. يرجى إرسال ${miss[1].ar} اليوم — يحتاجها زبوننا للبيان الجمركي اللبناني.`) });
                ctx.receive({ from: sc.agent.email, subject: L(miss[0] + ' ' + s.documents.bl.hblNo, miss[1].ar + ' ' + s.documents.bl.hblNo), body: L(`Apologies — ${miss[0].toLowerCase()} attached.`, `نعتذر — ${miss[1].ar} مرفقة.`), attachments: [{ name: miss[0].replace(/ /g, '_') + '.pdf', doc: miss[2] }] }, 900);
                s.documents.preAlert = { received: s.sim.today, docs: ['MBL copy', 'HBL copy', 'Commercial invoice', 'Packing list', 'Certificate of origin'], missing: miss[0] };
                ctx.finish('prealert');
              },
            });
          } else {
            const certs = OPS.certsFor(sc).map((c) => ({ l: L(c.en + ' (copy)', c.ar + ' (نسخة)') }));
            const good = [{ l: L('MBL copy (seaway)', 'نسخة MBL (Seaway)') }, { l: L('HBL copy', 'نسخة HBL') }, { l: L('Commercial invoice & packing list', 'الفاتورة التجارية وقائمة التعبئة') }, { l: bank(sc) ? L('Release instruction: release only against one original HBL', 'تعليمات الإفراج: فقط مقابل أصل HBL') : L('Release instruction: express release to the consignee', 'تعليمات الإفراج: إفراج سريع للمرسل إليه') }].concat(certs);
            const bad = [{ l: L('Our buy-rate sheet from the line', 'ورقة أسعار الكلفة من الخط'), fb: L('Confidential.', 'سرّي.') }, { l: L('The client’s bank account details', 'تفاصيل حساب الزبون المصرفي'), fb: L('Not needed and confidential.', 'غير ضروري وسرّي.') }, { l: L('Our quotation to the client with margins', 'عرضنا للزبون مع الهوامش'), fb: L('Confidential.', 'سرّي.') }];
            ui().choice(ctx, b, {
              key: 'pa', multi: true, q: L(`Prepare the pre-alert to ${sc.agent.name}. Select what you include.`, `حضّر الإشعار المسبق إلى ${sc.agent.name}. اختر ما تضمّنه.`),
              options: mix(s, 84, good, bad, good.length, 2), submit: L('Send pre-alert', 'أرسل الإشعار المسبق'),
              onSuccess: () => {
                ctx.send({ to: sc.agent.email, subject: 'PRE-ALERT ' + s.documents.bl.hblNo + ' / ' + s.booking.vessel, body: L(`Dear ${sc.agent.contact},\n\nPre-alert HBL ${s.documents.bl.hblNo} / MBL ${s.documents.bl.mblNo}, ${s.booking.vessel} ETD ${TS.fmtDate(s.booking.etd)}, ETA ${sc.far.city} ${TS.fmtDate(s.booking.eta)}.\nContainer ${s.equipment.containerNo}, seal ${s.equipment.seal}.\nIMPORTANT: ${bank(sc) ? 'release only against one original HBL (' + (sc.payKind === 'lc' ? 'L/C' : 'CAD') + ').' : 'express release — the buyer has paid.'}${sc.answer.incoterm === 'DAP' ? '\nDAP: please deliver to the buyer’s warehouse and invoice us the destination charges; import duties are for the buyer.' : ''}\n\nBest regards,\n${OPS.company.name}`, `عزيزي/عزيزتي ${sc.agent.contact}،\n\nإشعار مسبق HBL ${s.documents.bl.hblNo} / MBL ${s.documents.bl.mblNo}، ${s.booking.vessel} مغادرة ${TS.fmtDate(s.booking.etd)}، وصول ${sc.far.city} ${TS.fmtDate(s.booking.eta)}.\nالحاوية ${s.equipment.containerNo}، الختم ${s.equipment.seal}.\nمهم: ${bank(sc) ? 'الإفراج فقط مقابل أصل HBL.' : 'إفراج سريع — دفع المشتري.'}${sc.answer.incoterm === 'DAP' ? '\nDAP: يرجى التسليم لمستودع المشتري وفوترتنا رسوم الوجهة؛ رسوم الاستيراد على المشتري.' : ''}\n\nمع التحية،\n${OPS.company.name}`), attachments: [{ name: 'MBL_copy.pdf', doc: 'mbl' }, { name: 'HBL_copy.pdf', doc: 'hbl' }, { name: 'CI.pdf', doc: 'ci' }, { name: 'PL.pdf', doc: 'pl' }] });
                s.documents.preAlert = { sent: s.sim.today, docs: ['MBL copy', 'HBL copy', 'CI', 'PL'].concat(OPS.certsFor(sc).map((c) => c.en)) };
                ctx.finish('prealert');
              },
            });
          }
        },
      },
      {
        id: 'manifest',
        title: L('Advance cargo manifest', 'المانيفست المسبق'),
        render(ctx, b) {
          const s = ctx.ship, sc = ctx.sc;
          let q, good, bad;
          if (imp(s)) { q = L('Who submits the cargo manifest to Lebanese Customs before the vessel arrives in Beirut?', 'من يقدّم مانيفست البضائع للجمارك اللبنانية قبل وصول الباخرة إلى بيروت؟'); good = L(`The ${lcl(s) ? 'line’s agent (and the consolidator’s agent for its house bills)' : 'shipping line’s agent'} in Lebanon, electronically (NAJM); as NVOCC you make sure the house data (HBL consignee, packages, description) is correct`, `وكيل ${lcl(s) ? 'الخط (ووكيل المجمِّع لبوالصه)' : 'الخط'} في لبنان إلكترونيًا (نجم)؛ وكـNVOCC تتأكّد من صحة بيانات HBL`); bad = [L('The consignee, after arrival', 'المرسل إليه بعد الوصول'), L('Nobody — Lebanon has no manifest', 'لا أحد — لا مانيفست في لبنان')]; }
          else if (sc.zone === 'EU') { q = L(`The cargo goes to the EU (${sc.far.country}). What about ICS2 / ENS?`, `البضاعة متجهة للاتحاد الأوروبي (${sc.far.country}). ماذا عن ICS2 / ENS؟`); good = L('The carrier files the ENS before loading; as NVOCC you must provide house-level (HBL) data to ICS2 on time', 'الخط يقدّم ENS قبل التحميل؛ وكـNVOCC يجب أن تقدّم بيانات HBL لنظام ICS2 في الوقت المحدّد'); bad = [L('Only needed for air cargo', 'مطلوب فقط للشحن الجوي'), L('The buyer files it after arrival', 'المشتري يقدّمه بعد الوصول')]; }
          else if (sc.far.cc === 'US') { q = L('The cargo goes to the USA. Which advance filings apply?', 'البضاعة متجهة إلى أميركا. أي بيانات مسبقة مطلوبة؟'); good = L('AMS by the carrier/NVOCC 24 h before loading, and the importer’s ISF (10+2) — we send our HBL data on time', 'AMS من الناقل/NVOCC قبل 24 ساعة من التحميل، وISF (10+2) من المستورد — نرسل بيانات HBL في الوقت'); bad = [L('Nothing until arrival', 'لا شيء حتى الوصول'), L('Only the EUR.1', 'فقط EUR.1')]; }
          else { q = L(`The cargo goes to ${sc.far.country}. What about the cargo manifest there?`, `البضاعة متجهة إلى ${sc.far.country}. ماذا عن المانيفست هناك؟`); good = L('The carrier files the manifest with destination customs before arrival; we give correct HBL data to our agent/the carrier on time', 'الخط يقدّم المانيفست لجمارك الوجهة قبل الوصول؛ ونعطي بيانات HBL صحيحة لوكيلنا/الخط في الوقت'); bad = [L('No manifest is needed outside the EU/USA', 'لا مانيفست خارج أوروبا/أميركا'), L('The buyer writes it by hand on arrival', 'المشتري يكتبه يدويًا عند الوصول')]; }
          ui().choice(ctx, b, { key: 'man', q, options: OPS.shuffle(OPS.srng(s, 85), [{ l: good, ok: true }].concat(bad.map((x) => ({ l: x, ok: false })))), onSuccess: () => { ctx.milestone('ATD', s.booking.etd, 'Vessel sailed ' + s.booking.vessel); ctx.finish('manifest'); } });
        },
      },
    ],
    quiz: OPS.QUIZ.sailing, drills: OPS.QUIZ_DRILLS.sailing,
  });

  /* sailing: set ATD and planned tracking with a delay (reason & days differ per shipment) */
  const DELAYS = [L('terminal congestion', 'ازدحام المحطة'), L('bad weather', 'سوء الأحوال الجوية'), L('a missed connection (vessel omitted the port)', 'ربط فائت (الباخرة تجاوزت المرفأ)'), L('a port labour strike', 'إضراب عمال المرفأ'), L('equipment imbalance at the hub', 'نقص المعدّات في المرفأ المحوري')];
  OPS.sailed = (s) => {
    if (s.sailedDone) return;
    const bk = s.booking, r = s.rates.selected, car = line(bk.carrier);
    const delay = 2 + (OPS.seed(s) % 5), reason = DELAYS[OPS.seed(s) % DELAYS.length];
    const tsArr = TS.addDays(bk.etd, Math.round(r.transit * 0.6));
    const tsDep = TS.addDays(tsArr, 2 + delay);
    const newEta = TS.addDays(bk.eta, delay);
    s.tracking = (s.tracking || []).concat([
      { date: bk.etd, event: L('Loaded on vessel', 'حُمّلت على الباخرة'), loc: s.jobFile.pol, vessel: bk.vessel },
      { date: bk.etd, event: L('Vessel departed', 'غادرت الباخرة'), loc: s.jobFile.pol, vessel: bk.vessel },
      { date: tsArr, event: L('Arrived at transshipment port', 'وصلت إلى مرفأ المسافنة'), loc: r.ts, vessel: bk.vessel },
      { date: tsArr, event: L('Discharged at T/S', 'فُرّغت في مرفأ المسافنة'), loc: r.ts },
      { date: tsDep, event: L(`Loaded on connecting vessel (delayed ${delay} days — ${reason.en})`, `حُمّلت على الباخرة الرديفة (تأخير ${delay} أيام — ${reason.ar})`), loc: r.ts, vessel: car.vessels[2] },
      { date: tsDep, event: L('Departed T/S', 'غادرت مرفأ المسافنة'), loc: r.ts, vessel: car.vessels[2] },
      { date: newEta, event: L('Arrived at port of discharge', 'وصلت إلى مرفأ التفريغ'), loc: s.jobFile.pod, vessel: car.vessels[2] },
      { date: newEta, event: L('Discharged from vessel', 'فُرّغت من الباخرة'), loc: s.jobFile.pod },
    ]);
    Object.assign(s.booking, { atd: bk.etd, tsArrival: tsArr, tsDeparture: tsDep, revisedEta: newEta, connectingVessel: car.vessels[2], delayDays: delay, delayReason: reason });
    s.sim.today = s.sim.today > bk.etd ? s.sim.today : bk.etd;
    s.sailedDone = true;
  };

  /* ============================================================ 9. TRACKING & ARRIVAL NOTICE */
  OPS.steps.push({
    id: 'tracking',
    title: L('Tracking, delays & arrival notice', 'التتبّع، التأخير وإشعار الوصول'),
    sub: L('Follow the container, communicate a delay honestly and prepare the arrival notice.', 'تابع الحاوية، أبلغ عن التأخير بصدق وحضّر إشعار الوصول.'),
    lesson: lesson('tracking'),
    parts: [
      {
        id: 'read',
        title: L('Read the tracking & the carrier’s delay notice', 'اقرأ التتبّع وإشعار التأخير من الخط'),
        render(ctx, b) {
          const s = ctx.ship, bk = s.booking; OPS.sailed(s); ctx.advance(bk.tsArrival);
          if (!s.emails.find((e) => e.step === 'tracking' && e.box === 'in')) {
            OPS.emailPush(s, 'in', { from: line(bk.carrier).email, to: OPS.company.email, step: 'tracking', read: false, subject: L('Customer advisory — delay at ' + s.rates.selected.ts, 'إشعار للعملاء — تأخير في ' + s.rates.selected.ts), body: L(`Dear customer,\n\nDue to ${bk.delayReason.en} at ${s.rates.selected.ts}, containers discharged from ${bk.vessel} will connect to ${bk.connectingVessel}, departing ${TS.fmtDate(bk.tsDeparture)}.\nRevised ETA ${s.jobFile.pod}: ${TS.fmtDate(bk.revisedEta)} (originally ${TS.fmtDate(bk.eta)}).\nWe apologise for the inconvenience.`, `عميلنا العزيز،\n\nبسبب ${bk.delayReason.ar} في ${s.rates.selected.ts}، ستُنقل الحاويات المفرّغة من ${bk.vessel} على ${bk.connectingVessel} المغادرة في ${TS.fmtDate(bk.tsDeparture)}.\nالوصول المعدّل إلى ${s.jobFile.pod}: ${TS.fmtDate(bk.revisedEta)} (كان ${TS.fmtDate(bk.eta)}).\nنعتذر عن الإزعاج.`) });
          }
          ctx.save();
          const wrap = document.createElement('div'); wrap.innerHTML = ui().table([L('Date', 'التاريخ'), L('Event', 'الحدث'), L('Location', 'المكان')], s.tracking.map((e) => `<tr class="${e.date > s.sim.today ? 'muted' : ''}"><td>${TS.fmtDate(e.date, false)}</td><td>${esc(t(e.event))}${e.date > s.sim.today ? ' <span class="badge">' + t(L('planned', 'مخطّط')) + '</span>' : ''}</td><td>${esc(e.loc)}</td></tr>`)); b.appendChild(wrap);
          const f = document.createElement('div'); b.appendChild(f);
          ui().form(ctx, f, {
            key: 'trk',
            fields: [
              { k: 'ts', label: L('Transshipment port', 'مرفأ المسافنة'), contains: [s.rates.selected.ts.split(' ')[0]], ans: () => s.rates.selected.ts },
              { k: 'cv', label: L('Connecting vessel', 'الباخرة الرديفة'), ans: () => bk.connectingVessel },
              { k: 'old', label: L('Original ETA', 'الوصول الأصلي'), type: 'date', ans: () => bk.eta },
              { k: 'new', label: L('Revised ETA', 'الوصول المعدّل'), type: 'date', ans: () => bk.revisedEta },
              { k: 'd', label: L('Delay (days)', 'التأخير (أيام)'), type: 'number', ans: () => bk.delayDays },
            ],
            onSuccess: () => ctx.finish('read'),
          });
        },
      },
      {
        id: 'notify',
        title: L('Inform the client about the delay', 'أبلغ الزبون بالتأخير'),
        render(ctx, b) {
          const s = ctx.ship, bk = s.booking, sc = ctx.sc;
          const impact = lcl(s) ? L('Free storage at the CFS starts after unstuffing, so there is no storage impact.', 'التخزين المجاني يبدأ بعد التفريغ في المحطة، فلا أثر على التخزين.') : L('Free time starts at discharge, so there is no demurrage impact.', 'فترة السماح تبدأ عند التفريغ فلا أثر على الغرامات.');
          const right = { l: L(`“Dear ${sc.client.contact}, the carrier informs us of ${bk.delayReason.en} at ${s.rates.selected.ts}. Your cargo now connects on ${bk.connectingVessel}; revised ETA ${TS.fmtDate(bk.revisedEta)} (estimated). ${impact.en} We will update you at each milestone.”`, `«السيد/ة ${sc.client.contact}، أبلغنا الخط عن ${bk.delayReason.ar} في ${s.rates.selected.ts}. بضاعتكم الآن على ${bk.connectingVessel}؛ الوصول المعدّل ${TS.fmtDate(bk.revisedEta)} (تقديري). ${impact.ar} سنبلغكم عند كل مرحلة.»`), ok: true };
          const opts = OPS.shuffle(OPS.srng(s, 91), [right,
            { l: L(`“The cargo will arrive on ${TS.fmtDate(bk.revisedEta)}, guaranteed.”`, `«ستصل البضاعة في ${TS.fmtDate(bk.revisedEta)}، مضمون.»`), ok: false, fb: L('ETAs are estimates — never guarantee them.', 'مواعيد الوصول تقديرية — لا تضمنها أبدًا.') },
            { l: L('Say nothing — maybe the line catches up.', 'لا تقل شيئًا — ربما يعوّض الخط التأخير.'), ok: false, fb: L('The client will find out anyway and trust will be lost.', 'سيعرف الزبون على أي حال وستُفقد الثقة.') },
            { l: L('“The delay is the shipping line’s fault, please claim compensation from them.”', '«التأخير خطأ الخط، اطلبوا تعويضًا منه.»'), ok: false, fb: L('No blame games — carriers do not compensate for delays under standard B/L terms.', 'لا تلقِ اللوم — الخطوط لا تعوّض عن التأخير بموجب شروط البوليصة العادية.') },
          ]);
          ui().choice(ctx, b, { key: 'dly', q: L('Choose the message to send.', 'اختر الرسالة لإرسالها.'), options: opts, onSuccess: () => { ctx.send({ to: sc.client.email, subject: L('Update ' + s.id + ' — revised ETA', 'تحديث ' + s.id + ' — وصول معدّل'), body: right.l }); ctx.finish('notify'); } });
        },
      },
      {
        id: 'an',
        title: (sh) => (imp(sh) ? L('Issue the arrival notice', 'أصدر إشعار الوصول') : L('Status update to the shipper', 'تحديث الحالة للشاحن')),
        render(ctx, b) {
          const s = ctx.ship, bk = s.booking, q = s.quotation, sc = ctx.sc;
          ctx.advance(TS.addDays(bk.revisedEta, -3)); ctx.save();
          if (imp(s)) {
            const due = R2(q.totals.grand + (s.lclAdj ? s.lclAdj.sell : 0));
            const fields = [
              { k: 'eta', label: 'ETA Beirut', type: 'date', ans: () => bk.revisedEta },
              { k: 'hbl', label: 'HBL no.', ans: () => s.documents.bl.hblNo },
              { k: 'tot', label: L('Total due incl. VAT (quotation' + (s.lclAdj ? ' + W/M adjustment)' : ')'), 'المجموع المستحق مع الضريبة (العرض' + (s.lclAdj ? ' + فرق W/M)' : ')')), unit: 'USD', type: 'number', tol: 1, ans: () => due },
            ];
            if (sc.deposit) fields.push({ k: 'dep', label: L('Container deposit to prepare', 'تأمين الحاوية المطلوب'), unit: 'USD', type: 'number', ans: () => sc.deposit });
            fields.push({ k: 'free', label: lcl(s) ? L('Free storage days at the CFS', 'أيام التخزين المجانية في المحطة') : L('Free days from discharge', 'أيام السماح من التفريغ'), type: 'number', ans: () => bk.freeDays });
            ui().form(ctx, b, {
              key: 'an', intro: L(`Prepare the arrival notice to ${sc.client.name}. Charges come from the accepted quotation.`, `حضّر إشعار الوصول إلى ${sc.client.name}. الرسوم من العرض المقبول.`), submit: L('Send arrival notice', 'أرسل إشعار الوصول'), fields,
              onSuccess: (v) => {
                s.documents.arrivalNotice = { date: s.sim.today, eta: v.eta, totalDue: v.tot, deposit: v.dep || 0, freeDays: v.free };
                ctx.send({ to: sc.client.email, subject: L('ARRIVAL NOTICE ' + s.documents.bl.hblNo + ' — ETA ' + TS.fmtDate(v.eta, false), 'إشعار وصول ' + s.documents.bl.hblNo + ' — الوصول ' + TS.fmtDate(v.eta, false)), body: L(`Dear ${sc.client.contact},\n\nYour ${lcl(s) ? 'LCL cargo (' + s.jobFile.packages + ' ' + s.jobFile.pkgType + ')' : 'container ' + s.equipment.containerNo} (HBL ${s.documents.bl.hblNo}) is expected in Beirut on ${TS.fmtDate(v.eta)} on ${bk.connectingVessel}.\nAmount due before release: USD ${TS.num(v.tot)} (incl. VAT) — invoice attached.${v.dep ? `\nContainer deposit: USD ${TS.num(v.dep, 0)} (refundable) to be provided before the D/O.` : ''}\n${lcl(s) ? 'Free storage at the CFS' : 'Free time'}: ${v.free} days from ${lcl(s) ? 'unstuffing' : 'discharge'}.\nPlease send us now for customs: commercial invoice, packing list, certificate of origin, your commercial registration / VAT certificate${sc.licence ? ' and any import approval for this product' : ''}.\n\nBest regards,\n${OPS.company.name}`, `السيد/ة ${sc.client.contact}،\n\nيُتوقّع وصول ${lcl(s) ? 'بضاعتكم الجزئية' : 'حاويتكم ' + s.equipment.containerNo} (HBL ${s.documents.bl.hblNo}) إلى بيروت بتاريخ ${TS.fmtDate(v.eta)} على ${bk.connectingVessel}.\nالمبلغ المستحق قبل الإفراج: ${TS.num(v.tot)} دولار (مع الضريبة) — الفاتورة مرفقة.${v.dep ? `\nتأمين الحاوية: ${TS.num(v.dep, 0)} دولار (مسترد) قبل إذن التسليم.` : ''}\n${lcl(s) ? 'التخزين المجاني في المحطة' : 'فترة السماح'}: ${v.free} أيام.\nيرجى إرسال مستندات الجمارك الآن: الفاتورة التجارية، قائمة التعبئة، شهادة المنشأ، السجل التجاري/الشهادة الضريبية${sc.licence ? ' وأي موافقة استيراد لهذا المنتج' : ''}.\n\nمع التحية،\n${OPS.company.name}`), attachments: [{ name: 'Arrival_notice.pdf', doc: 'an' }] });
                ctx.finish('an');
              },
            });
          } else {
            const fields = [
              { k: 'eta', label: 'ETA ' + sc.far.city, type: 'date', ans: () => bk.revisedEta },
              { k: 'who', label: L(`Who pays destination ${lcl(s) ? 'CFS' : 'THC'} & D/O fees in ${sc.far.city}?`, `من يدفع رسوم ${lcl(s) ? 'المحطة' : 'THC'} وإذن التسليم في ${sc.far.city}؟`), type: 'select', options: [{ v: 'consignee', l: L('The consignee (buyer)', 'المرسل إليه (المشتري)') }, { v: 'shipper', l: L('Our client (seller) — through us', 'زبوننا (البائع) — عبرنا') }, { v: 'carrier', l: L('The carrier', 'الناقل') }], ans: () => (sc.answer.incoterm === 'DAP' ? 'shipper' : 'consignee'), fb: sc.answer.incoterm === 'DAP' ? L('DAP: the seller pays everything up to delivery at the buyer’s door (we quoted DTHC and delivery).', 'DAP: البائع يدفع كل شيء حتى التسليم لباب المشتري (سعّرنا رسوم الوجهة والتسليم).') : L(`${sc.answer.incoterm}: the seller pays freight to POD; destination charges are for the buyer.`, `${sc.answer.incoterm}: البائع يدفع الشحن حتى مرفأ التفريغ؛ رسوم الوجهة على المشتري.`) },
            ];
            if (bank(sc)) fields.push({ k: 'docs', label: L('Did the bank receive the original HBLs?', 'هل استلم المصرف أصول HBL؟'), type: 'select', options: yesNo, ans: () => 'yes' });
            ui().form(ctx, b, {
              key: 'an', intro: L(`${sc.agent.name} will issue the arrival notice to ${sc.consignee.name}. Confirm the facts to your client (the shipper).`, `${sc.agent.name} ستصدر إشعار الوصول إلى ${sc.consignee.name}. أكّد الحقائق لزبونك (الشاحن).`), submit: L('Send status to client', 'أرسل الحالة للزبون'), fields,
              onSuccess: (v) => { s.documents.arrivalNotice = { by: sc.agent.name, eta: v.eta }; ctx.send({ to: sc.client.email, subject: L('Status ' + s.id + ' — ETA ' + sc.far.city, 'حالة ' + s.id + ' — الوصول إلى ' + sc.far.city), body: L(`Cargo expected in ${sc.far.city} ${TS.fmtDate(v.eta)}. Our agent will notify the buyer; ${bank(sc) ? 'release only against an original HBL.' : 'express release as the goods are paid.'}`, `البضاعة متوقعة في ${sc.far.city} ${TS.fmtDate(v.eta)}. وكيلنا سيبلغ المشتري؛ ${bank(sc) ? 'الإفراج فقط مقابل أصل HBL.' : 'إفراج سريع لأن البضاعة مدفوعة.'}`) }); ctx.finish('an'); },
            });
          }
        },
        summary: (ctx) => (imp(ctx.ship) ? `<p>✓ ${t(L('Arrival notice sent', 'أُرسل إشعار الوصول'))} <button class="btn sm ghost" data-doc-open="an">📄 ${t(L('Arrival notice', 'إشعار الوصول'))}</button></p>` : `<p>✓</p>`),
      },
    ],
    quiz: OPS.QUIZ.tracking, drills: OPS.QUIZ_DRILLS.tracking,
  });

  /* ============================================================ 10. RELEASE & CUSTOMS */
  OPS.freightForCustoms = (s) => { const q = s.quotation; return R2(q.lines.filter((l) => l.group === 'freight' && l.code !== 'INS' || (l.group === 'origin')).reduce((a, l) => a + Number(l.sell) * (l.qty || 1), 0) + (s.lclAdj ? s.lclAdj.sell : 0)); };
  OPS.insForCustoms = (s) => { const q = s.quotation, l = q.lines.find((x) => x.code === 'INS'); return q.insurance && l ? R2(Number(l.sell)) : 0; };

  OPS.steps.push({
    id: 'release',
    title: L('Arrival, D/O release & customs clearance', 'الوصول، إذن التسليم والتخليص الجمركي'),
    sub: L('Collect payment, get the delivery order and hand the file to Customs — without ever releasing cargo unpaid.', 'حصّل الدفع، احصل على إذن التسليم وسلّم الملف للجمارك — بدون إفراج أبدًا قبل الدفع.'),
    lesson: (s) => lesson('release')(s) + LB('At Beirut: the line’s (or consolidator’s) agent issues the D/O after payment of its local charges and, for FCL, the container deposit/guarantee. The D/O is required to complete the customs declaration in NAJM. Port storage and line demurrage are separate clocks — both run while you wait for documents or licences.', 'في بيروت: يصدر وكيل الخط (أو المجمِّع) إذن التسليم بعد دفع رسومه المحلية، ولـFCL تأمين/كفالة الحاوية. إذن التسليم مطلوب لإكمال البيان الجمركي على نظام نجم. تخزين المرفأ وغرامات الخط عدّادان منفصلان — وكلاهما يعمل أثناء انتظار المستندات أو التراخيص.'),
    parts: [
      {
        id: 'pay',
        title: L('Payment and credit control', 'الدفع ومراقبة الائتمان'),
        render(ctx, b) {
          const s = ctx.ship, sc = ctx.sc;
          ctx.advance(s.booking.revisedEta); ctx.save();
          const due = R2(s.quotation.totals.grand + (s.lclAdj ? s.lclAdj.sell : 0));
          if (imp(s)) {
            const relDoc = { advance: L('express release', 'الإفراج السريع'), tt_copy: L('telex release', 'التلكس ريليز'), lc: L('endorsed original HBL from the bank', 'أصل HBL المظهَّر من المصرف'), cad: L('original HBL', 'أصل HBL') }[sc.payKind];
            if (!s.emails.find((e) => e.step === 'release' && e.box === 'in')) {
              const ask = sc.deposit ? L('please release the D/O today — we will bring the container deposit cheque next week', 'يرجى الإفراج عن إذن التسليم اليوم — سنحضر شيك التأمين الأسبوع المقبل') : L('please release today — we will pay the remaining charges next week', 'يرجى الإفراج اليوم — سندفع الرسوم المتبقية الأسبوع المقبل');
              OPS.emailPush(s, 'in', { from: sc.client.email, to: OPS.company.email, step: 'release', read: false, subject: L('Payment ' + s.documents.bl.hblNo + ' + urgent release', 'دفعة ' + s.documents.bl.hblNo + ' + إفراج عاجل'), body: L(`Hello,\n\nWe transferred USD ${TS.num(sc.deposit ? due : R2(due * 0.6))} for your invoice${sc.deposit ? '' : ' (the rest next week)'}. ${sc.payKind === 'tt_copy' ? 'The supplier received the balance and surrendered the originals.' : sc.payKind === 'lc' ? 'Our bank has endorsed the original HBL to us.' : 'The supplier was paid in advance.'}\nWe need the goods urgently: ${ask.en}.\n\n${sc.client.contact}`, `مرحبًا،\n\nحوّلنا ${TS.num(sc.deposit ? due : R2(due * 0.6))} دولار لفاتورتكم${sc.deposit ? '' : ' (والباقي الأسبوع المقبل)'}. ${sc.payKind === 'tt_copy' ? 'استلم المورّد الرصيد وسلّم الأصول.' : sc.payKind === 'lc' ? 'ظهّر مصرفنا أصل HBL لنا.' : 'دُفع للمورّد مسبقًا.'}\nنحتاج البضاعة بشكل عاجل: ${ask.ar}.\n\n${sc.client.contact}`) });
              ctx.save();
            }
            const right = sc.deposit ? L(`Confirm receipt of payment, check the ${relDoc.en}, and explain that the line will only issue the D/O once the deposit (or a bank guarantee) is lodged — ask for it today.`, `أكّد استلام الدفعة، تحقّق من ${relDoc.ar}، واشرح أن الخط لن يصدر إذن التسليم إلا بعد التأمين (أو كفالة مصرفية) — واطلبه اليوم.`) : L(`Thank the client, check the ${relDoc.en}, and explain politely that the cargo is released once the full invoice is paid (no credit without management approval).`, `اشكر الزبون، تحقّق من ${relDoc.ar}، واشرح بلطف أن البضاعة تُفرج بعد دفع الفاتورة كاملة (لا ائتمان بدون موافقة الإدارة).`);
            ui().choice(ctx, b, {
              key: 'credit', q: L('Read the client’s email. What do you do?', 'اقرأ بريد الزبون. ماذا تفعل؟'),
              options: OPS.shuffle(OPS.srng(s, 101), [
                { l: right, ok: true },
                { l: L('Pay from our company account without approval to keep the client happy.', 'ادفع من حساب الشركة بدون موافقة لإرضاء الزبون.'), ok: false, fb: L('That is giving credit — only management can approve it.', 'هذا منح ائتمان — فقط الإدارة توافق عليه.') },
                { l: L('Release anyway, it is a good client.', 'أفرج على أي حال، زبون جيد.'), ok: false, fb: L('You lose your leverage — and the line/CFS will not release without payment anyway.', 'تخسر ورقتك — والخط/المحطة لن يفرجا بدون دفع أصلًا.') },
              ]),
              onSuccess: () => { Object.assign(s.release, { clientPaid: due, clientPaidOn: s.sim.today, releaseDoc: relDoc.en, depositLodged: sc.deposit }); ctx.send({ to: sc.client.email, subject: L('RE: Payment ' + s.documents.bl.hblNo, 'رد: دفعة ' + s.documents.bl.hblNo), body: right }); ctx.finish('pay'); },
            });
          } else {
            ui().form(ctx, b, {
              key: 'shpay', intro: L(bank(sc) ? 'Before you hand the original HBLs to your client, your freight invoice must be paid (prepaid B/L).' : 'Before you send the express release, your freight invoice must be paid.', bank(sc) ? 'قبل تسليم أصول HBL لزبونك، يجب دفع فاتورة الشحن (بوليصة مسبقة الدفع).' : 'قبل إرسال الإفراج السريع، يجب دفع فاتورة الشحن.'),
              fields: [{ k: 'amt', label: L('Amount the shipper must pay us (incl. VAT' + (s.lclAdj ? ', incl. W/M adjustment' : '') + ')', 'المبلغ الذي يجب أن يدفعه الشاحن لنا (مع الضريبة' + (s.lclAdj ? ' وفرق W/M' : '') + ')'), unit: 'USD', type: 'number', tol: 1, ans: () => due }],
              onSuccess: (v) => { Object.assign(s.release, { clientPaid: v.amt, clientPaidOn: s.sim.today, oblHandedToShipper: bank(sc) ? s.sim.today : null }); ctx.finish('pay'); },
            });
          }
        },
      },
      {
        id: 'do',
        title: (sh) => (imp(sh) ? L('Get the delivery order', 'احصل على إذن التسليم') : L('Destination release sequence', 'تسلسل الإفراج في الوجهة')),
        render(ctx, b) {
          const s = ctx.ship, sc = ctx.sc;
          if (imp(s)) {
            const q = s.quotation;
            const lineBuy = R2(q.lines.filter((l) => l.vendor === 'carrier').reduce((a, l) => a + Number(l.buy) * (l.qty || 1), 0) + (s.lclAdj ? s.lclAdj.buy : 0));
            const fields = [{ k: 'paid', label: L(`Amount paid to ${s.booking.carrierName} (your cost, × quantities${s.lclAdj ? ' + W/M adjustment' : ''})`, `المبلغ المدفوع لـ ${s.booking.carrierName} (كلفتك × الكميات${s.lclAdj ? ' + فرق W/M' : ''})`), unit: 'USD', type: 'number', tol: 1, ans: () => lineBuy }];
            if (sc.deposit) fields.push({ k: 'dep', label: L('Deposit lodged (client’s money)', 'التأمين المودَع (مال الزبون)'), unit: 'USD', type: 'number', ans: () => sc.deposit });
            fields.push({ k: 'rel', label: L('MBL release basis', 'أساس إفراج MBL'), type: 'select', options: [{ v: 'seaway', l: 'Seaway bill' }, { v: 'obl', l: L('Original MBL surrendered', 'تسليم أصل MBL') }], ans: () => 'seaway' });
            ui().form(ctx, b, {
              key: 'do', intro: lcl(s) ? L(`At ${s.booking.carrierName}’s Beirut office you pay the collect freight, CFS and D/O charges (your buy lines to the consolidator). No container deposit for LCL.`, `في مكتب ${s.booking.carrierName} في بيروت تدفع الشحن ورسوم المحطة وإذن التسليم (بنود الكلفة للمجمِّع). لا تأمين حاوية في LCL.`) : L('At the line’s agent in Beirut you pay the collect freight, surcharges, DTHC and D/O fee (your buy lines to the carrier), and lodge the client’s deposit.', 'لدى وكيل الخط في بيروت تدفع الشحن والرسوم الإضافية وTHC ورسم إذن التسليم (بنود الكلفة للخط)، وتودع تأمين الزبون.'),
              fields, submit: L('Pay & request D/O', 'ادفع واطلب إذن التسليم'),
              onSuccess: (v) => {
                s.release.paidToLine = v.paid; s.release.deposit = v.dep || 0;
                s.release.doNo = 'DO-' + s.booking.carrier + '-' + (OPS.seed(s) % 90000 + 10000);
                s.release.doDate = TS.addDays(s.booking.revisedEta, lcl(s) ? 2 : 1);
                ctx.advance(s.release.doDate);
                ctx.receive({ from: line(s.booking.carrier).email, subject: L('Delivery order ' + s.release.doNo, 'إذن التسليم ' + s.release.doNo), body: L(lcl(s) ? `Delivery order ${s.release.doNo} issued for HBL ${s.documents.bl.hblNo}: ${s.jobFile.packages} ${s.jobFile.pkgType} unstuffed at ${sc.cfs} on ${TS.fmtDate(s.release.doDate)}. Free storage ${s.booking.freeDays} days.` : `Delivery order ${s.release.doNo} issued for ${s.equipment.containerNo}, valid to ${TS.fmtDate(TS.addDays(s.release.doDate, 10))}. Deposit USD ${TS.num(v.dep, 0)} received. Empty return to ${sc.depot}.`, lcl(s) ? `صدر إذن التسليم ${s.release.doNo} لـ HBL ${s.documents.bl.hblNo}: ${s.jobFile.packages} طرد فُرّغت في ${sc.cfs} بتاريخ ${TS.fmtDate(s.release.doDate)}. تخزين مجاني ${s.booking.freeDays} أيام.` : `صدر إذن التسليم ${s.release.doNo} للحاوية ${s.equipment.containerNo}، صالح حتى ${TS.fmtDate(TS.addDays(s.release.doDate, 10))}. تم استلام التأمين ${TS.num(v.dep, 0)} دولار. إرجاع الفارغ إلى ${sc.depot}.`), attachments: [{ name: 'DO_' + s.release.doNo + '.pdf', doc: 'do' }] });
                ctx.milestone('DO', s.release.doDate, 'D/O issued ' + s.release.doNo);
                ctx.finish('do');
              },
            });
          } else {
            const ag = sc.agent.name.split(' (')[0];
            const steps = sc.payKind === 'advance' ? [L('The buyer has already paid (advance)', 'دفع المشتري مسبقًا'), L('We send an express release to our agent', 'نرسل إفراجًا سريعًا لوكيلنا'), L(`${ag} collects destination charges and issues the D/O`, `تحصّل ${ag} رسوم الوجهة وتصدر إذن التسليم`), L(`Import clearance in ${sc.far.city} and delivery`, `التخليص الوارد في ${sc.far.city} والتسليم`)]
              : sc.payKind === 'lc' ? [L('Our client presents the documents to its bank under the L/C', 'يقدّم زبوننا المستندات لمصرفه بموجب الاعتماد'), L('The issuing bank checks the documents and pays', 'المصرف المصدِر يدقّق المستندات ويدفع'), L('The buyer gets the original HBLs from its bank', 'يستلم المشتري أصول HBL من مصرفه'), L(`The buyer surrenders one original HBL to ${ag}`, `يسلّم المشتري أصل HBL إلى ${ag}`), L(`Import clearance in ${sc.far.city} and delivery`, `التخليص الوارد في ${sc.far.city} والتسليم`)]
                : [L('Buyer pays its bank (CAD)', 'يدفع المشتري لمصرفه (مستندات)'), L('Bank hands the original HBLs to the buyer', 'يسلّم المصرف أصول HBL للمشتري'), L(`Buyer surrenders one original HBL to ${ag}`, `يسلّم المشتري أصل HBL إلى ${ag}`), L(`${ag} collects destination charges and issues the D/O`, `تحصّل ${ag} رسوم الوجهة وتصدر إذن التسليم`), L(`Import clearance in ${sc.far.city} and delivery`, `التخليص الوارد في ${sc.far.city} والتسليم`)];
            const n = steps.length, order = OPS.shuffle(OPS.srng(s, 102), steps.map((_, i) => i));
            ctx.data.seq = ctx.data.seq && ctx.data.seq.length === n ? ctx.data.seq : Array(n).fill('');
            b.innerHTML = `<p>${t(L('Put the steps in the right order (1 = first).', 'رتّب الخطوات بالترتيب الصحيح (1 = الأول).'))}</p>${order.map((i, pos) => `<div class="row" style="margin-bottom:6px"><select data-p="${pos}" style="width:80px"><option value="">—</option>${steps.map((_, k) => `<option ${String(ctx.data.seq[pos]) === String(k + 1) ? 'selected' : ''}>${k + 1}</option>`).join('')}</select><span>${t(steps[i])}</span></div>`).join('')}<div class="row"><button class="btn primary" id="chk">${t(L('Check', 'تحقّق'))}</button><button class="btn ghost" id="ans">${t(L('Show me the answer', 'أرني الجواب'))}</button></div>`;
            b.querySelectorAll('[data-p]').forEach((sel) => (sel.onchange = () => { ctx.data.seq[Number(sel.dataset.p)] = sel.value; ctx.save(); }));
            b.querySelector('#ans').onclick = () => { ctx.hint(); ctx.data.seq = order.map((i) => i + 1); ctx.save(); ctx.rerender(); };
            b.querySelector('#chk').onclick = () => {
              if (!order.every((i, pos) => Number(ctx.data.seq[pos]) === i + 1)) { ctx.mistake(); TS.toast(t(L('Not the right order', 'الترتيب غير صحيح')), 'bad'); return; }
              ctx.advance(TS.addDays(s.booking.revisedEta, 1));
              s.release.destination = { by: sc.agent.name, doDate: TS.addDays(s.booking.revisedEta, 2) };
              ctx.finish('do');
            };
          }
        },
      },
      {
        id: 'customs',
        title: (sh) => (imp(sh) ? L('Hand the file to the Customs department', 'سلّم الملف إلى قسم الجمارك') : L('Origin & preference for the buyer', 'المنشأ والتفضيل للمشتري')),
        render(ctx, b) {
          const s = ctx.ship, sc = ctx.sc;
          if (imp(s)) {
            if (ctx.data.waiting) { b.innerHTML = `<p class="muted">⏳ ${t(L('File handed to Customs — waiting for the clearance result…', 'سُلّم الملف للجمارك — بانتظار نتيجة التخليص…'))}</p>`; return; }
            const freight = OPS.freightForCustoms(s), ins = OPS.insForCustoms(s), inc = sc.answer.incoterm;
            ui().form(ctx, b, {
              key: 'cif', intro: L(`Invoice ${inc} USD ${TS.num(sc.cargo.value, 0)}. Transport costs to Beirut charged to the client = your freight lines${inc !== 'FOB' ? ' + origin pickup/charges' : ''} (sell × quantity${s.lclAdj ? ' + W/M adjustment' : ''}). Insurance = ${s.quotation.insurance ? 'the premium you sold' : 'none bought'}.`, `الفاتورة ${inc} بقيمة ${TS.num(sc.cargo.value, 0)} دولار. كلفة النقل حتى بيروت المفوترة للزبون = بنود الشحن${inc !== 'FOB' ? ' + الاستلام/رسوم المنشأ' : ''} (البيع × الكمية${s.lclAdj ? ' + فرق W/M' : ''}). التأمين = ${s.quotation.insurance ? 'القسط الذي بعته' : 'لا يوجد'}.`),
              submit: L('Send to Customs department', 'أرسل إلى قسم الجمارك'),
              fields: [
                { k: 'fr', label: L('Freight & transport to Beirut', 'الشحن والنقل حتى بيروت'), unit: 'USD', type: 'number', tol: 1, ans: () => freight },
                { k: 'ins', label: L('Insurance', 'التأمين'), unit: 'USD', type: 'number', tol: 1, ans: () => ins },
                { k: 'cif', label: L('CIF value for customs', 'قيمة CIF للجمارك'), unit: 'USD', type: 'number', tol: 1, ans: () => R2(sc.cargo.value + freight + ins), fb: L('CIF = invoice + freight & transport to Beirut + insurance.', 'CIF = الفاتورة + الشحن والنقل حتى بيروت + التأمين.') },
                { k: 'docs', label: L('Documents attached (all needed)', 'المستندات المرفقة (كلها مطلوبة)'), type: 'select', options: [{ v: 'full', l: L('Invoice, packing list, COO, B/L copy + release, D/O, importer registration & VAT certificate' + (sc.licence ? ', import approval' : ''), 'الفاتورة، قائمة التعبئة، المنشأ، نسخة البوليصة + الإفراج، إذن التسليم، سجل المستورد والشهادة الضريبية' + (sc.licence ? '، موافقة الاستيراد' : '')) }, { v: 'min', l: L('Invoice and B/L only', 'الفاتورة والبوليصة فقط') }], ans: () => 'full' },
              ],
              onSuccess: (v) => {
                const pack = Object.assign(OPS.customsPack(s, 'import'), { customsValueCIF: v.cif, freight: v.fr, insurance: v.ins, doNo: s.release.doNo, documents: ['Commercial invoice', 'Packing list', 'Certificate of origin', 'B/L copy + ' + (s.release.releaseDoc || 'release'), 'Delivery order ' + s.release.doNo, 'Importer CR & VAT certificate'], vatRate: 0.11 });
                s.handoffs.customs_import = { department: 'customs', type: 'import_declaration', status: 'submitted', sentSim: s.sim.today, sentAt: new Date().toISOString(), pack };
                ctx.send({ to: OPS.parties.broker.email, subject: L('Import declaration — ' + s.id, 'بيان استيراد — ' + s.id), body: L('Please lodge the import declaration in NAJM. CIF USD ' + TS.num(v.cif) + '. All data is in the shipment JSON (hand-off: customs_import).', 'يرجى تقديم بيان الاستيراد على نظام نجم. CIF ' + TS.num(v.cif) + ' دولار. كل البيانات في ملف JSON (التسليم: customs_import).'), attachments: [{ name: s.id + '.json' }, { name: 'Invoice.pdf', doc: 'ci' }, { name: 'PackingList.pdf', doc: 'pl' }, { name: 'DO.pdf', doc: 'do' }] });
                ctx.data.waiting = true;
                const lanes = ['green', 'yellow', 'yellow', 'red'], lane = lanes[OPS.seed(s) % 4], days = { green: 3, yellow: 6, red: 9 }[lane];
                const rel = TS.addDays(s.booking.revisedEta, days + (lcl(s) ? 1 : 0));
                const why = { green: L('no check', 'بدون تدقيق'), yellow: L('documentary check — the importer’s registration certificate had to be re-submitted', 'تدقيق مستندي — اضطر المستورد لإعادة تقديم شهادة التسجيل'), red: L('physical inspection of the cargo', 'كشف مادي على البضاعة') }[lane];
                const no = 'IM/' + rel.slice(0, 4) + '/' + (OPS.seed(s) % 90000 + 10000);
                ctx.receive({ from: OPS.parties.broker.email, subject: L('Customs released — ' + s.id, 'إفراج جمركي — ' + s.id), body: L(`Import declaration ${no} lodged in NAJM on ${TS.fmtDate(TS.addDays(s.booking.revisedEta, 2))}.\nLane: ${lane.toUpperCase()} (${why.en}).\nDuties and VAT paid by the importer directly.\nCustoms release: ${TS.fmtDate(rel)}.\n(Simulated — this becomes real work in the Customs department module.)`, `بيان الاستيراد ${no} قُدّم على نظام نجم بتاريخ ${TS.fmtDate(TS.addDays(s.booking.revisedEta, 2))}.\nالمسار: ${{ green: 'الأخضر', yellow: 'الأصفر', red: 'الأحمر' }[lane]} (${why.ar}).\nدفع المستورد الرسوم والضريبة مباشرة.\nالإفراج الجمركي: ${TS.fmtDate(rel)}.\n(محاكاة — ستصبح عملًا حقيقيًا في وحدة قسم الجمارك.)`), onArrive: (sh) => { sh.importCustoms = { declarationNo: no, lane, releasedOn: rel, dutiesPaidBy: 'importer', simulated: true }; sh.handoffs.customs_import.status = 'released (simulated)'; sh.sim.today = rel; const w = sh.work.release; w.data.waiting = false; w.parts.customs = true; sh.milestones.push({ code: 'CUS', date: rel, label: 'Customs released' }); OPS.app.checkStep(sh, OPS.steps.find((x) => x.id === 'release')); } }, 2000);
                ctx.save(); ctx.rerender();
              },
            });
          } else {
            const zone = sc.zone;
            const good = zone === 'EU' ? L(`The EUR.1 lets the buyer claim preferential (reduced/zero) duty in ${sc.far.country} under the EU–Lebanon Association Agreement`, `EUR.1 تتيح للمشتري الرسوم التفضيلية في ${sc.far.country} بموجب اتفاقية الشراكة الأوروبية اللبنانية`)
              : zone === 'ARAB' ? L(`The Arab certificate of origin lets the buyer claim GAFTA (Greater Arab Free Trade Area) duty exemption in ${sc.far.country}`, `شهادة المنشأ العربية تتيح للمشتري إعفاء منطقة التجارة الحرة العربية الكبرى في ${sc.far.country}`)
                : L(`${sc.far.country} has no free-trade agreement with Lebanon in this exercise: the certificate of origin proves origin, but normal (MFN) duty applies`, `لا اتفاقية تجارة حرة بين ${sc.far.country} ولبنان في هذا التمرين: شهادة المنشأ تثبت المنشأ لكن تُطبَّق الرسوم العادية`);
            const bads = [L('The shipping line requires it to load the container', 'الخط يطلبها لتحميل الحاوية'), L('It replaces the commercial invoice', 'تحلّ مكان الفاتورة التجارية'), zone === 'EU' ? L('A GAFTA certificate would give the same preference in the EU', 'شهادة عربية تعطي التفضيل نفسه في أوروبا') : L('An EUR.1 would give duty-free entry there', 'EUR.1 تعطي دخولًا بدون رسوم هناك')];
            ui().choice(ctx, b, {
              key: 'eur1', q: L(`Which statement about the origin documents for ${sc.far.country} is correct?`, `أي عبارة عن مستندات المنشأ إلى ${sc.far.country} صحيحة؟`),
              options: OPS.shuffle(OPS.srng(s, 103), [{ l: good, ok: true }].concat(bads.map((x) => ({ l: x, ok: false })))),
              onSuccess: () => { ctx.advance(TS.addDays(s.booking.revisedEta, 8)); s.release.destinationCustoms = { by: 'Buyer’s broker in ' + sc.far.city, clearedOn: TS.addDays(s.booking.revisedEta, 8), preferentialOrigin: zone === 'EU' ? 'EUR.1' : zone === 'ARAB' ? 'GAFTA' : 'none' }; ctx.finish('customs'); },
            });
          }
        },
        summary: (ctx) => { const c = ctx.ship.importCustoms; return c ? `<p>✓ ${t(L('Customs released', 'تم الإفراج الجمركي'))} ${TS.fmtDate(c.releasedOn)} — ${esc(c.declarationNo)} (${esc(c.lane)})</p>` : `<p>✓</p>`; },
      },
    ],
    quiz: OPS.QUIZ.release, drills: OPS.QUIZ_DRILLS.release,
  });

  /* ============================================================ 11. DELIVERY & EMPTY RETURN / CFS STORAGE */
  OPS.steps.push({
    id: 'delivery',
    title: (s) => (s && OPS.sc(s).mode === 'LCL' ? L('Delivery & CFS storage', 'التسليم وتخزين محطة التجميع') : L('Delivery, empty return & demurrage/detention', 'التسليم، إرجاع الفارغ والغرامات')),
    sub: L('Deliver the cargo, close the equipment cycle and calculate what the delay cost.', 'سلّم البضاعة، أقفل دورة المعدّات واحسب كلفة التأخير.'),
    lesson: (s) => lesson('delivery')(s) + LB('Lebanese trucking: check the truck and driver are allowed at the port gate, respect axle limits and working hours, and make sure the client is ready to unload (a waiting truck costs money and adds detention days). Empty returns in Beirut go to the depot named on the D/O.', 'النقل البري في لبنان: تأكّد أن الشاحنة والسائق مسموح لهما بدخول بوابة المرفأ، احترم حدود المحاور وساعات العمل، وتأكّد أن الزبون جاهز للتفريغ. يُرجع الفارغ في بيروت إلى المستودع المذكور في إذن التسليم.'),
    parts: [
      {
        id: 'truck', when: (s) => !(OPS.sc(s).mode === 'LCL' && s.direction === 'export'),
        title: (sh) => (imp(sh) ? (OPS.sc(sh).services.door ? L('Trucking order for delivery', 'أمر النقل للتسليم') : L('Release to the client’s own truck', 'الإفراج لشاحنة الزبون')) : L('Origin detention check', 'التحقّق من الاحتجاز في المنشأ')),
        render(ctx, b) {
          const s = ctx.ship, sc = ctx.sc, isL = lcl(s);
          if (imp(s)) {
            const rel = s.importCustoms.releasedOn, from = isL ? sc.cfs : 'Beirut Container Terminal';
            const door = sc.services.door;
            const fields = [
              { k: 'ref', label: isL ? L('HBL no.', 'رقم HBL') : L('Container no.', 'رقم الحاوية'), ans: () => (isL ? s.documents.bl.hblNo : s.equipment.containerNo) },
              { k: 'do', label: L('D/O no.', 'رقم إذن التسليم'), ans: () => s.release.doNo },
              { k: 'from', label: L('Pickup', 'الاستلام'), ro: true, value: () => from },
            ];
            if (door) fields.push({ k: 'to', label: L('Delivery address', 'عنوان التسليم'), contains: [sc.client.area], ans: () => sc.client.address, full: true });
            fields.push({ k: 'date', label: door ? L('Delivery date', 'تاريخ التسليم') : L('Collection date by the client', 'تاريخ استلام الزبون'), type: 'date', ans: () => TS.addDays(rel, 1), check: (v) => (v < rel ? L('Before customs release — the terminal/CFS will not let it out.', 'قبل الإفراج الجمركي — لن تخرجها المحطة.') : v > TS.addDays(rel, 2) ? L(`Why wait? Every day adds ${isL ? 'storage' : 'detention'}.`, `لماذا الانتظار؟ كل يوم يضيف ${isL ? 'تخزينًا' : 'احتجازًا'}.`) : true) });
            if (!isL) fields.push({ k: 'depot', label: L('Empty return depot', 'مستودع إرجاع الفارغ'), type: 'select', options: [{ v: sc.depot, l: sc.depot }, { v: 'Tripoli port depot', l: 'Tripoli port depot' }, { v: 'Client’s yard', l: L('Keep at client’s yard', 'يبقى في ساحة الزبون') }], ans: () => sc.depot });
            ui().form(ctx, b, {
              key: 'truck', submit: door ? L('Send trucking order', 'أرسل أمر النقل') : L('Send release to client', 'أرسل الإفراج للزبون'),
              intro: L(`Customs released on ${TS.fmtDate(rel)}. ${door ? 'Book the delivery with ' + OPS.parties.trucker.name + '.' : 'The client collects with its own truck — give them what they need.'}`, `تم الإفراج الجمركي بتاريخ ${TS.fmtDate(rel)}. ${door ? 'احجز التسليم مع ' + OPS.parties.trucker.name + '.' : 'الزبون يستلم بشاحنته — أعطه ما يحتاجه.'}`), fields,
              onSuccess: (v) => {
                const ret = isL ? null : TS.addDays(v.date, door ? 2 : 3);
                s.delivery = { truckedBy: door ? OPS.parties.trucker.name : 'Client’s own truck', deliveredOn: v.date, emptyReturnedOn: ret, depot: v.depot || null, dischargeDate: s.booking.revisedEta, fromCfs: isL };
                const to = door ? OPS.parties.trucker : sc.client;
                ctx.send({ to: to.email, subject: door ? L('Trucking order ' + v.ref, 'أمر نقل ' + v.ref) : L('Cargo released — ' + v.ref, 'تم الإفراج — ' + v.ref), body: L(`Please collect ${v.ref} (D/O ${v.do}) at ${from} on ${TS.fmtDate(v.date)}${door ? ', deliver to ' + v.to : ''}${isL ? '' : ', and return the empty to ' + v.depot + ' immediately after unloading. Send us the EIR'}.`, `يرجى استلام ${v.ref} (إذن ${v.do}) من ${from} بتاريخ ${TS.fmtDate(v.date)}${door ? '، والتسليم إلى ' + v.to : ''}${isL ? '' : '، وإرجاع الفارغ إلى ' + v.depot + ' فور التفريغ. أرسلوا لنا EIR'}.`), attachments: door ? [{ name: 'Trucking_order.pdf', doc: 'trk' }] : [{ name: 'DO.pdf', doc: 'do' }] });
                ctx.receive({ from: to.email, subject: L('Delivered' + (isL ? '' : ' & empty returned') + ' — ' + v.ref, 'تم التسليم' + (isL ? '' : ' وإرجاع الفارغ') + ' — ' + v.ref), body: L(`Delivered ${TS.fmtDate(v.date)}.${isL ? '' : ` Unloaded over ${door ? 2 : 3} days. Empty returned to ${v.depot} on ${TS.fmtDate(ret)}. EIR: sound, clean.`} POD signed by ${sc.client.contact}.`, `تم التسليم ${TS.fmtDate(v.date)}.${isL ? '' : ` فُرّغت خلال ${door ? 2 : 3} أيام. أُرجع الفارغ إلى ${v.depot} بتاريخ ${TS.fmtDate(ret)}. EIR: سليمة ونظيفة.`} وقّع ${sc.client.contact} على إثبات التسليم.`), attachments: isL ? [{ name: 'POD.pdf' }] : [{ name: 'EIR_return.pdf', doc: 'eirret' }, { name: 'POD.pdf' }] }, 800);
                ctx.advance(ret || v.date);
                ctx.milestone('DLV', v.date, 'Delivered to client'); if (ret) ctx.milestone('MTY', ret, 'Empty returned to depot');
                ctx.finish('truck');
              },
            });
          } else {
            const pick = TS.addDays(s.equipment.stuffedOn, -1), gate = s.equipment.gateIn, fd = 5 + (OPS.seed(s) % 3);
            ui().form(ctx, b, {
              key: 'odet', intro: L(`Empty picked up at Beirut depot ${TS.fmtDate(pick)}, full gate-in ${TS.fmtDate(gate)}. Origin free time: ${fd} days (both days count).`, `سُحب الفارغ من مستودع بيروت ${TS.fmtDate(pick)}، ودخلت معبّأة ${TS.fmtDate(gate)}. فترة السماح في المنشأ: ${fd} أيام (يُحتسب اليومان).`),
              fields: [
                { k: 'days', label: L('Days outside the terminal', 'أيام خارج المحطة'), type: 'number', ans: () => TS.diffDays(pick, gate) + 1 },
                { k: 'ch', label: L('Chargeable detention days', 'أيام الاحتجاز المستحقة'), type: 'number', ans: () => Math.max(0, TS.diffDays(pick, gate) + 1 - fd) },
              ],
              onSuccess: (v) => { s.dd.origin = { pickup: pick, gateIn: gate, freeDays: fd, days: v.days, chargeable: v.ch, cost: 0 }; ctx.finish('truck'); },
            });
          }
        },
      },
      {
        id: 'dd',
        title: (sh) => (OPS.sc(sh).mode === 'LCL' ? L('CFS storage', 'تخزين محطة التجميع') : L('Calculate demurrage & detention', 'احسب غرامات التأخير والاحتجاز')),
        render(ctx, b) {
          const s = ctx.ship, sc = ctx.sc, bk = s.booking, r = s.rates.selected;
          if (lcl(s)) {
            if (!imp(s)) {
              const dap = sc.answer.incoterm === 'DAP';
              ui().choice(ctx, b, {
                key: 'lclx', q: L(`${sc.answer.incoterm} ${sc.far.city}: who pays the destination CFS charges and any storage?`, `${sc.answer.incoterm} ${sc.far.city}: من يدفع رسوم محطة الوجهة وأي تخزين؟`),
                options: OPS.shuffle(OPS.srng(s, 111), [{ l: dap ? L('Our client (seller) through us — DAP includes delivery to the buyer', 'زبوننا (البائع) عبرنا — DAP يشمل التسليم للمشتري') : L('The buyer (consignee)', 'المشتري (المرسل إليه)'), ok: true }, { l: dap ? L('The buyer (consignee)', 'المشتري (المرسل إليه)') : L('Our client (seller)', 'زبوننا (البائع)'), ok: false }, { l: L('The consolidator, free of charge', 'المجمِّع مجانًا'), ok: false }]),
                onSuccess: () => { const dis = bk.revisedEta; s.delivery = Object.assign(s.delivery || {}, { dischargeDate: dis, deliveredOn: TS.addDays(dis, 6), by: sc.agent.name }); s.dd.destination = { lcl: true, days: 0, chargeable: 0, cost: 0, freeDays: bk.freeDays, borneBy: dap ? 'client' : 'consignee' }; ctx.advance(TS.addDays(dis, 6)); ctx.finish('dd'); },
              });
              return;
            }
            const avail = TS.addDays(bk.revisedEta, 2), out = s.delivery.deliveredOn, days = TS.diffDays(avail, out) + 1, ch = Math.max(0, days - bk.freeDays), wm = Math.max(1, s.lclAdj ? s.lclAdj.wmNew : sc.answer.wm), cost = R2(ch * r.storage * wm);
            ui().form(ctx, b, {
              key: 'stor', intro: L(`Cargo available at the CFS on ${TS.fmtDate(avail)} (after unstuffing) · collected ${TS.fmtDate(out)} · ${bk.freeDays} free days · storage USD ${TS.num(r.storage)} per W/M per day · ${TS.num(wm)} W/M. Both days count.`, `البضاعة متاحة في المحطة ${TS.fmtDate(avail)} (بعد التفريغ) · استُلمت ${TS.fmtDate(out)} · ${bk.freeDays} أيام مجانية · التخزين ${TS.num(r.storage)} دولار لكل W/M يوميًا · ${TS.num(wm)} W/M. يُحتسب اليومان.`),
              fields: [
                { k: 'days', label: L('Days at the CFS', 'الأيام في المحطة'), type: 'number', ans: () => days },
                { k: 'ch', label: L('Chargeable days', 'الأيام المستحقة'), type: 'number', ans: () => ch },
                { k: 'cost', label: L('Storage amount', 'قيمة التخزين'), unit: 'USD', type: 'number', tol: 0.5, ans: () => cost },
                { k: 'who', label: L('Who finally bears it?', 'من يتحمّلها في النهاية؟'), type: 'select', options: [{ v: 'client', l: L('Our client (rebilled per quotation)', 'زبوننا (يُعاد فوترتها حسب العرض)') }, { v: 'us', l: L('Our company', 'شركتنا') }, { v: 'consol', l: L('The consolidator', 'المجمِّع') }], ans: () => 'client' },
              ],
              onSuccess: (v) => { s.dd.destination = { lcl: true, available: avail, collected: out, freeDays: bk.freeDays, days, chargeable: ch, rate: r.storage, wm, cost, borneBy: v.who }; ctx.finish('dd'); },
            });
            return;
          }
          const dis = bk.revisedEta, ret = imp(s) ? s.delivery.emptyReturnedOn : TS.addDays(dis, 9 + (OPS.seed(s) % 5));
          if (!imp(s)) s.delivery = Object.assign(s.delivery || {}, { dischargeDate: dis, emptyReturnedOn: ret, deliveredOn: TS.addDays(dis, 7), by: sc.agent.name + ' / buyer' });
          const days = TS.diffDays(dis, ret) + 1, ch = Math.max(0, days - bk.freeDays), cost = OPS.ddCost(ch, sc.ddTariff), tiers = sc.ddTariff.tiers;
          const whoAns = imp(s) || sc.answer.incoterm === 'DAP' ? 'client' : 'consignee';
          ui().form(ctx, b, {
            key: 'dd',
            intro: L(`Discharged ${TS.fmtDate(dis)} · empty returned ${TS.fmtDate(ret)} · free days ${bk.freeDays} (combined) · tariff ${sc.ddTariff.unit}: USD ${tiers[0].rate}/day for days 1–7 after free time, then USD ${tiers[1].rate}/day. Both the discharge day and the return day count.`, `التفريغ ${TS.fmtDate(dis)} · إرجاع الفارغ ${TS.fmtDate(ret)} · أيام السماح ${bk.freeDays} (مجمّعة) · التعرفة ${sc.ddTariff.unit}: ${tiers[0].rate} دولار/يوم للأيام 1–7 بعد السماح، ثم ${tiers[1].rate} دولار/يوم. يُحتسب يوم التفريغ ويوم الإرجاع.`),
            fields: [
              { k: 'days', label: L('Total days used', 'مجموع الأيام'), type: 'number', ans: () => days },
              { k: 'ch', label: L('Chargeable days', 'الأيام المستحقة'), type: 'number', ans: () => ch },
              { k: 'cost', label: L('D&D amount', 'قيمة الغرامات'), unit: 'USD', type: 'number', ans: () => cost },
              { k: 'who', label: L('Who finally bears it?', 'من يتحمّلها في النهاية؟'), type: 'select', options: [{ v: 'client', l: L('Our client (rebilled per quotation)', 'زبوننا (يُعاد فوترتها حسب العرض)') }, { v: 'consignee', l: L('The consignee/buyer at destination', 'المرسل إليه/المشتري في الوجهة') }, { v: 'us', l: L('Our company', 'شركتنا') }], ans: () => whoAns, fb: whoAns === 'client' ? L('We pay the line, then rebill our client as per the quotation conditions.', 'ندفع للخط ثم نعيد فوترة زبوننا حسب شروط العرض.') : L(`${sc.answer.incoterm}: the box is the buyer’s responsibility after discharge.`, `${sc.answer.incoterm}: الحاوية مسؤولية المشتري بعد التفريغ.`) },
            ],
            onSuccess: (v) => { s.dd.destination = { discharge: dis, emptyReturn: ret, freeDays: bk.freeDays, days, chargeable: ch, cost, borneBy: v.who }; ctx.finish('dd'); },
          });
        },
        summary: (ctx) => { const d = ctx.ship.dd.destination; return `<p>✓ ${d.days} ${t(L('days', 'يوم'))}, ${d.chargeable} ${t(L('chargeable', 'مستحق'))} → <b>USD ${TS.num(d.cost)}</b> (${esc(d.borneBy)})</p>`; },
      },
      {
        id: 'deposit',
        title: (sh) => (OPS.sc(sh).deposit ? L('EIR & deposit refund', 'EIR واسترداد التأمين') : L('Proof of completion', 'إثبات الإنجاز')),
        render(ctx, b) {
          const s = ctx.ship, sc = ctx.sc;
          if (sc.deposit) {
            ui().form(ctx, b, {
              key: 'dep', intro: L('The EIR shows the box returned sound and clean. The line deducts D&D from the deposit.', 'يُظهر EIR أن الحاوية أُرجعت سليمة ونظيفة. يحسم الخط الغرامات من التأمين.'),
              fields: [{ k: 'ref', label: L('Deposit refund to the client', 'التأمين المسترد للزبون'), unit: 'USD', type: 'number', ans: () => sc.deposit - s.dd.destination.cost }],
              onSuccess: (v) => { s.dd.depositRefund = v.ref; s.dd.ddPaidFromDeposit = true; ctx.finish('deposit'); },
            });
          } else {
            const good = [{ l: L('Confirmation the cargo was delivered/released (POD)', 'تأكيد تسليم/الإفراج عن البضاعة (POD)') }, { l: L('All supplier invoices received (line/consolidator, trucker, broker, chamber, agent)', 'استلام كل فواتير المورّدين (الخط/المجمِّع، النقل، المخلّص، الغرفة، الوكيل)') }];
            if (!lcl(s)) good.push({ l: L('Empty return confirmation / EIR from destination', 'تأكيد إرجاع الفارغ / EIR من الوجهة') });
            else good.push({ l: L('Storage (if any) invoiced and rebilled as agreed', 'التخزين (إن وجد) مفوتر ومعاد فوترته كما اتُّفق') });
            const bad = [{ l: L('The consignee’s bank statement', 'كشف حساب المرسل إليه') }, { l: L('A new quotation for the next shipment', 'عرض جديد للشحنة التالية') }];
            ui().choice(ctx, b, { key: 'poc', multi: true, q: L(`What do you need on file before closing this ${sc.mode} job?`, `ماذا تحتاج في الملف قبل إقفال عملية ${sc.mode} هذه؟`), options: mix(s, 112, good, bad, good.length, 1), onSuccess: () => { const end = s.delivery.emptyReturnedOn || s.delivery.deliveredOn; ctx.advance(end); if (s.delivery.emptyReturnedOn && !imp(s)) ctx.milestone('MTY', end, 'Empty returned (destination)'); ctx.finish('deposit'); } });
          }
        },
      },
    ],
    quiz: OPS.QUIZ.delivery, drills: OPS.QUIZ_DRILLS.delivery,
  });

  /* ============================================================ 12. CLOSING & ACCOUNTING */
  const VENDOR = (s, v) => ({ carrier: s.booking.carrierName, agent: OPS.sc(s).agent.name, trucker: OPS.parties.trucker.name, broker: OPS.parties.broker.name, chamber: 'Chamber of Commerce, Industry & Agriculture', insurer: 'Cedars Marine Insurance (training)', internal: OPS.company.name }[v] || v);
  OPS.vendorName = VENDOR;
  OPS.jobCosting = (s) => {
    const q = s.quotation, act = q.lines.filter((l) => l.group !== 'optional' || q.insurance);
    const rev = act.map((l) => ({ code: l.code, desc: (l.desc.en || l.desc) + ((l.qty || 1) !== 1 ? ' (' + TS.num(l.qty) + ' × ' + TS.num(Number(l.sell)) + ')' : ''), amount: R2(Number(l.sell) * (l.qty || 1)), vat: l.vat }));
    const cost = act.filter((l) => Number(l.buy) > 0).map((l) => ({ code: l.code, desc: (l.desc.en || l.desc) + ((l.qty || 1) !== 1 ? ' (' + TS.num(l.qty) + ' × ' + TS.num(Number(l.buy)) + ')' : ''), vendor: l.vendor, vendorName: VENDOR(s, l.vendor), amount: R2(Number(l.buy) * (l.qty || 1)) }));
    if (s.lclAdj && s.lclAdj.sell > 0) { rev.push({ code: 'WMA', desc: `W/M adjustment after CFS measurement (${TS.num(s.lclAdj.wmOld)} → ${TS.num(s.lclAdj.wmNew)})`, amount: s.lclAdj.sell, vat: false }); cost.push({ code: 'WMA', desc: 'W/M adjustment (consolidator)', vendor: 'carrier', vendorName: VENDOR(s, 'carrier'), amount: s.lclAdj.buy }); }
    const dd = s.dd.destination;
    if (dd && dd.cost > 0 && dd.borneBy === 'client') {
      const lab = dd.lcl ? 'CFS storage rebilled (' + dd.chargeable + ' days)' : 'Demurrage/detention rebilled (' + dd.chargeable + ' days)';
      rev.push({ code: dd.lcl ? 'STO' : 'DD', desc: lab, amount: dd.cost, vat: true });
      cost.push({ code: dd.lcl ? 'STO' : 'DD', desc: dd.lcl ? 'CFS storage (consolidator’s agent)' : 'Demurrage/detention (deducted from deposit)', vendor: 'carrier', vendorName: VENDOR(s, 'carrier'), amount: dd.cost });
    }
    const Rv = R2(rev.reduce((a, x) => a + x.amount, 0)), C = R2(cost.reduce((a, x) => a + x.amount, 0));
    const vatBase = R2(rev.filter((x) => x.vat).reduce((a, x) => a + x.amount, 0));
    return { rev, cost, revenue: Rv, costTotal: C, profit: R2(Rv - C), margin: Rv ? ((Rv - C) / Rv) * 100 : 0, vatBase, vat: R2(vatBase * 0.11) };
  };

  OPS.steps.push({
    id: 'closing',
    title: L('Job costing, file closing & hand-off to Accounting', 'كلفة العملية، إقفال الملف والتسليم للمحاسبة'),
    sub: L('Answer the open emails, check the real profit, prepare the invoice data with VAT and pass the shipment file to Accounting.', 'أجب على الرسائل المفتوحة، تحقّق من الربح الفعلي، حضّر بيانات الفاتورة مع الضريبة وسلّم ملف الشحنة للمحاسبة.'),
    lesson: lesson('closing'),
    parts: [
      {
        id: 'mail',
        title: L('Answer every open email (clients & companies)', 'أجب على كل الرسائل المفتوحة (الزبائن والشركات)'),
        render(ctx, b) {
          const s = ctx.ship, open = OPS.mail.open(s), done = (s.mailTasks || []).filter((x) => x.done);
          b.innerHTML = `<p>${t(L('During the shipment clients, agents and companies wrote to you. A file is not closed while an email waits for an answer.', 'خلال الشحنة راسلك الزبائن والوكلاء والشركات. لا يُقفل الملف ورسالة تنتظر جوابًا.'))}</p>
            ${open.length ? `<ul>${open.map((x) => `<li>✉ <b>${esc(t(x.subject))}</b> — ${esc(x.from)} <a href="#inbox" data-mail-open="${x.id}">${t(L('Open & reply', 'افتح وردّ'))} →</a></li>`).join('')}</ul>` : `<div class="note ok">✓ ${t(L('All emails answered', 'تمت الإجابة على كل الرسائل'))} (${done.length})</div>`}
            <div class="row" style="margin-top:10px"><button class="btn primary" data-act="check">${t(L('Check', 'تحقّق'))}</button>${open.length ? `<button class="btn ghost" data-act="answer">${t(L('Answer them for me (counts as hints)', 'أجب عنها نيابةً عني (تُحتسب تلميحات)'))}</button>` : ''}</div>`;
          b.querySelectorAll('[data-mail-open]').forEach((a) => (a.onclick = (e) => { e.preventDefault(); OPS.app.mailSel = OPS.mail.taskMailId(s, a.dataset.mailOpen); OPS.app.mailBox = 'needs'; OPS.app.go('inbox'); }));
          const ans = b.querySelector('[data-act=answer]'); if (ans) ans.onclick = () => { OPS.mail.open(s).forEach((x) => { ctx.hint(); OPS.mail.answer(s, x.id, OPS.mail.correctIndex(x), true); }); ctx.save(); ctx.rerender(); };
          b.querySelector('[data-act=check]').onclick = () => { if (OPS.mail.open(s).length) { ctx.mistake(); TS.toast(t(L('Some emails are still waiting for your reply', 'ما زالت رسائل تنتظر ردّك')), 'bad'); return; } ctx.finish('mail'); };
        },
        summary: (ctx) => `<p>✓ ${(ctx.ship.mailTasks || []).length} ${t(L('emails answered', 'رسائل مُجاب عنها'))} · ${(ctx.ship.mailTasks || []).filter((x) => x.firstTry).length} ${t(L('right first time', 'صحيحة من أول مرة'))}</p>`,
      },
      {
        id: 'cost',
        title: L('Job costing (actual)', 'كلفة العملية (الفعلية)'),
        render(ctx, b) {
          const s = ctx.ship, jc = OPS.jobCosting(s);
          const wrap = document.createElement('div'); wrap.innerHTML = ui().table([L('Revenue line', 'بند الإيراد'), { l: 'USD', num: 1 }], jc.rev.map((x) => `<tr><td>${esc(x.code)} — ${esc(x.desc)}</td><td class="num">${TS.num(x.amount)}</td></tr>`)) + ui().table([L('Cost line', 'بند الكلفة'), L('Vendor', 'المورّد'), { l: 'USD', num: 1 }], jc.cost.map((x) => `<tr><td>${esc(x.code)} — ${esc(x.desc)}</td><td>${esc(x.vendorName)}</td><td class="num">${TS.num(x.amount)}</td></tr>`)); b.appendChild(wrap);
          const f = document.createElement('div'); b.appendChild(f);
          ui().form(ctx, f, {
            key: 'jc',
            fields: [
              { k: 'r', label: L('Total revenue (excl. VAT)', 'مجموع الإيراد (دون الضريبة)'), unit: 'USD', type: 'number', tol: 1, ans: () => jc.revenue },
              { k: 'c', label: L('Total cost', 'مجموع الكلفة'), unit: 'USD', type: 'number', tol: 1, ans: () => jc.costTotal },
              { k: 'p', label: L('Job profit', 'ربح العملية'), unit: 'USD', type: 'number', tol: 1, ans: () => jc.profit },
            ],
            onSuccess: () => { s.closing.jobCosting = jc; ctx.finish('cost'); },
          });
        },
        summary: (ctx) => { const j = ctx.ship.closing.jobCosting; return `<div class="grid c3"><div class="stat"><div class="k">${t(L('Revenue', 'الإيراد'))}</div><div class="v">${TS.num(j.revenue)}</div></div><div class="stat"><div class="k">${t(L('Cost', 'الكلفة'))}</div><div class="v">${TS.num(j.costTotal)}</div></div><div class="stat"><div class="k">${t(L('Profit / margin', 'الربح / الهامش'))}</div><div class="v">${TS.num(j.profit)} · ${TS.num(j.margin, 1)}%</div></div></div>`; },
      },
      {
        id: 'vat',
        title: L('Invoice VAT (11%) and LBP equivalent', 'ضريبة الفاتورة (11%) وما يعادلها بالليرة'),
        render(ctx, b) {
          const s = ctx.ship, jc = s.closing.jobCosting, rate = 89500;
          ui().form(ctx, b, {
            key: 'vat', intro: L(`Use the sample official rate LBP ${TS.num(rate, 0)} per USD (training value — always use the official rate on the invoice date).`, `استعمل السعر الرسمي المثال ${TS.num(rate, 0)} ليرة للدولار (قيمة تدريبية — استعمل دائمًا السعر الرسمي بتاريخ الفاتورة).`),
            fields: [
              { k: 'base', label: L('VAT base (vatable lines)', 'أساس الضريبة (البنود الخاضعة)'), unit: 'USD', type: 'number', tol: 1, ans: () => jc.vatBase },
              { k: 'vat', label: 'VAT 11%', unit: 'USD', type: 'number', tol: 0.5, ans: () => jc.vat },
              { k: 'lbp', label: L('VAT in LBP', 'الضريبة بالليرة'), unit: 'LBP', type: 'number', tol: rate, ans: () => Math.round(jc.vat * rate) },
              { k: 'tot', label: L('Invoice total incl. VAT', 'مجموع الفاتورة مع الضريبة'), unit: 'USD', type: 'number', tol: 1, ans: () => R2(jc.revenue + jc.vat) },
            ],
            onSuccess: (v) => { s.closing.invoice = { no: 'INV-' + s.id, date: s.sim.today, customer: s.parties.client, lines: jc.rev, vatBase: v.base, vatRate: 0.11, vat: v.vat, lbpRate: rate, vatLBP: v.lbp, total: v.tot, currency: 'USD' }; ctx.finish('vat'); },
          });
        },
        summary: () => `<p>✓ <button class="btn sm ghost" data-doc-open="inv">📄 ${t(L('Tax invoice', 'الفاتورة الضريبية'))}</button></p>`,
      },
      {
        id: 'check',
        title: L('Closing checklist', 'قائمة الإقفال'),
        render(ctx, b) {
          const s = ctx.ship, sc = ctx.sc;
          const good = [{ l: L('POD' + (lcl(s) ? '' : ' and EIR') + ' saved in the file', 'إثبات التسليم' + (lcl(s) ? '' : ' وEIR') + ' محفوظ في الملف') }, { l: L('All supplier invoices received and matched with the costing', 'كل فواتير المورّدين مستلمة ومطابقة مع الكلفة') }, { l: sc.deposit ? L('Deposit refund confirmed to the client', 'تأكيد استرداد التأمين للزبون') : imp(s) ? L('Client paid the invoice in full', 'دفع الزبون الفاتورة كاملة') : L('Freight invoice paid by the shipper', 'فاتورة الشحن مدفوعة من الشاحن') }, { l: L('Client invoice issued', 'إصدار فاتورة الزبون') }];
          const bad = [{ l: L('Delete the emails to save space', 'حذف الرسائل لتوفير المساحة'), fb: L('Keep all records — commercial and tax records must be kept for years.', 'احتفظ بكل السجلات — يجب حفظ السجلات التجارية والضريبية لسنوات.') }, { l: L('Send our buy rates to the client for transparency', 'إرسال أسعار الكلفة للزبون للشفافية'), fb: L('Confidential.', 'سرّي.') }];
          ui().choice(ctx, b, { key: 'close', multi: true, q: L('Tick what must be true before you close the file.', 'اختر ما يجب أن يكون صحيحًا قبل إقفال الملف.'), options: mix(s, 121, good, bad, 4, 1), onSuccess: () => ctx.finish('check') });
        },
      },
      {
        id: 'handoff',
        title: L('Hand the shipment file to Accounting', 'سلّم ملف الشحنة إلى المحاسبة'),
        render(ctx, b) {
          const s = ctx.ship;
          b.innerHTML = `<p>${t(L('This creates the accounting hand-off inside the shipment JSON (invoice, costs, disbursements, profit). The Accounting department page reads it from this browser, or you can send the JSON file.', 'هذا ينشئ تسليم المحاسبة داخل ملف JSON للشحنة (الفاتورة، الكلف، السلف، الربح). تقرأه صفحة قسم المحاسبة من هذا المتصفح، أو يمكنك إرسال ملف JSON.'))}</p><button class="btn primary" id="go">${t(L('Send to Accounting & close file', 'أرسل إلى المحاسبة وأقفل الملف'))} →</button>`;
          b.querySelector('#go').onclick = () => {
            const jc = s.closing.jobCosting, sc = OPS.sc(s);
            s.handoffs.accounting = {
              department: 'accounting', type: 'job_closing', status: 'submitted', sentSim: s.sim.today, sentAt: new Date().toISOString(),
              pack: {
                shipmentId: s.id, mode: sc.mode, customer: s.parties.client, invoice: s.closing.invoice,
                payables: jc.cost, receivables: [{ doc: s.closing.invoice.no, amount: s.closing.invoice.total, paidAmount: s.release.clientPaid || 0 }],
                disbursements: sc.deposit ? [{ type: 'container_deposit', to: s.booking.carrierName, amount: sc.deposit, refunded: s.dd.depositRefund, deducted: s.dd.destination.cost }] : [],
                jobProfit: jc.profit, marginPct: R2(jc.margin), quotedProfit: s.quotation.totals.profit,
              },
            };
            s.status = 'closed'; s.currentDepartment = 'accounting';
            ctx.send({ to: 'accounting@phoenicia-freight.test', subject: L('Job closed — ' + s.id, 'إقفال عملية — ' + s.id), body: L('Job file closed and handed to Accounting (hand-off: accounting).', 'أُقفل ملف العملية وسُلّم للمحاسبة (التسليم: accounting).'), attachments: [{ name: s.id + '.json' }, { name: 'INV-' + s.id + '.pdf', doc: 'inv' }, { name: 'Job_file.pdf', doc: 'job' }] });
            ctx.milestone('CLS', s.sim.today, 'File closed & handed to Accounting');
            ctx.finish('handoff');
          };
        },
        summary: (ctx) => {
          const s = ctx.ship, score = Math.max(0, 100 - s.score.mistakes * 2 - s.score.hints * 3);
          return `<div class="note ok"><strong>🎓 ${t(L('Shipment completed!', 'اكتملت الشحنة!'))}</strong>${t(L('Mistakes', 'الأخطاء'))}: ${s.score.mistakes} · ${t(L('Answers shown', 'إجابات معروضة'))}: ${s.score.hints} · <b>${t(L('Score', 'النتيجة'))}: ${score}/100</b></div>
            <div class="row"><button class="btn primary" onclick="TS.downloadJSON(OPS.app.ship)">⬇ ${esc(s.id)}.json</button><button class="btn" data-go="home">${t(L('Next client', 'الزبون التالي'))} →</button><a class="btn" href="../accounting_department/index.html">${t(L('Open Accounting department', 'افتح قسم المحاسبة'))} →</a><a class="btn" href="../customs_department/index.html">${t(L('Open Customs department', 'افتح قسم الجمارك'))} →</a></div>`;
        },
      },
    ],
    quiz: OPS.QUIZ.closing, drills: OPS.QUIZ_DRILLS.closing,
  });
})();
