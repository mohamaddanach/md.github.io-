/* Operations & Pricing — steps 7 to 12 */
(function () {
  const L = TS.L, t = TS.t, esc = TS.esc;
  const OPS = window.OPS;
  const ui = () => OPS.ui;
  const { imp, D, LB, TIP, yesNo } = OPS.h;
  const SCAC = { CMA: 'CMDU', MSC: 'MEDU', MSK: 'MAEU', COS: 'COSU', HLC: 'HLCU' };

  /* party structure on the bills of lading */
  OPS.blParties = (s) => {
    const sc = OPS.sc(s), co = OPS.company.name;
    return imp(s)
      ? { mblShipper: sc.agent.name, mblConsignee: co, mblNotify: co, hblShipper: sc.shipper.name, hblConsignee: sc.consignee.name, hblNotify: sc.consignee.name }
      : { mblShipper: co, mblConsignee: sc.agent.name, mblNotify: sc.agent.name, hblShipper: sc.shipper.name, hblConsignee: 'TO ORDER', hblNotify: sc.consignee.name };
  };
  OPS.blErrors = (s) => (imp(s) ? ['consignee', 'pod', 'weight'] : ['pod', 'seal', 'freight']);
  OPS.blNumbers = (s) => ({ mblNo: SCAC[s.booking.carrier] + s.booking.no.replace(/\D/g, '').slice(-8), hblNo: OPS.company.short + (imp(s) ? 'I' : 'E') + s.sim.start.slice(2, 4) + String(1000 + (OPS.seed(s) % 9000)) });

  /* the draft MBL as the line sends it (with injected errors if !fixed) */
  OPS.mblFields = (s, fixed) => {
    const p = OPS.blParties(s), j = s.jobFile, e = s.equipment, bk = s.booking;
    const errs = fixed ? [] : OPS.blErrors(s);
    let sealBad = e.seal.slice(0, -2) + e.seal.slice(-1) + e.seal.slice(-2, -1);
    if (sealBad === e.seal) sealBad = e.seal.slice(0, -1) + ((Number(e.seal.slice(-1)) + 1) % 10);
    return [
      { id: 'shipper', l: 'Shipper', v: p.mblShipper },
      { id: 'consignee', l: 'Consignee', v: errs.includes('consignee') ? p.mblConsignee.replace('Training', 'Trianing') : p.mblConsignee },
      { id: 'notify', l: 'Notify party', v: p.mblNotify },
      { id: 'vessel', l: 'Vessel / voyage', v: bk.vessel + ' / ' + bk.voyage },
      { id: 'pol', l: 'Port of loading', v: OPS.portName(j.pol) },
      { id: 'pod', l: 'Port of discharge', v: errs.includes('pod') ? (imp(s) ? OPS.portName('MZBEW') : OPS.portName('NLRTM')) : OPS.portName(j.pod) },
      { id: 'cntr', l: 'Container no.', v: e.containerNo + ' / ' + e.type },
      { id: 'seal', l: 'Seal no.', v: errs.includes('seal') ? sealBad : e.seal },
      { id: 'pkgs', l: 'No. of packages', v: j.packages + ' ' + j.pkgType.toUpperCase() },
      { id: 'desc', l: 'Description of goods', v: 'SHIPPER’S LOAD, STOW & COUNT — SAID TO CONTAIN: ' + j.commodity.toUpperCase() + ' — HS ' + j.hs },
      { id: 'weight', l: 'Gross weight', v: TS.num(errs.includes('weight') ? 8040 : j.grossKg, 0) + ' KGS' },
      { id: 'cbm', l: 'Measurement', v: TS.num(j.cbm, 2) + ' CBM' },
      { id: 'freight', l: 'Freight', v: errs.includes('freight') ? 'FREIGHT COLLECT' : 'FREIGHT ' + bk.freightTerms.toUpperCase() },
    ];
  };

  /* ============================================================ 7. SI & B/L */
  OPS.steps.push({
    id: 'si',
    title: L('Shipping instructions & draft B/L', 'تعليمات الشحن ومسودة البوليصة'),
    sub: L('Decide who appears on the master and house B/L, send the SI before cutoff and check the draft carefully.', 'حدّد من يظهر على البوليصة الرئيسية وبوليصة الوكيل، أرسل SI قبل الموعد وراجع المسودة بدقّة.'),
    lesson: () => t(L(`
<h3>The bill of lading does three jobs</h3>
<ol><li><b>Receipt</b> for the goods (in apparent good order — “clean”).</li><li><b>Evidence of the contract</b> of carriage.</li><li><b>Document of title</b> — whoever holds the original controls the goods.</li></ol>
<h3>Master and house</h3>
<p>When you act as NVOCC there are two B/Ls: the <b>MBL</b> (line → forwarder) and the <b>HBL</b> (forwarder → real shipper). On the MBL the shipper and consignee are usually the two forwarders (origin agent and destination office). On the HBL they are the real seller and buyer.</p>
<h3>“To order”</h3>
<p>If payment goes through a bank (CAD, letter of credit), the consignee is often <b>“TO ORDER”</b> (or “to order of [bank]”). The goods are released to whoever presents the endorsed original. The buyer is shown as notify party.</p>
<h3>Shipping instructions (SI)</h3>
<p>Your SI tells the line exactly what to print: parties, container/seal, packages, description, gross <b>cargo</b> weight (not the VGM), measurement, marks, freight terms. Send it before the <b>SI cutoff</b>, or pay a late-SI fee — or miss the vessel.</p>
<h3>Check every draft</h3>
<p>Amendments after the manifest is filed are expensive and sometimes impossible (and in Lebanon a wrong consignee name or weight on the manifest creates customs problems at arrival). Always compare the draft with the SI and get the shipper’s written approval of the HBL before issue.</p>
<p><b>Clauses:</b> “Shipper’s load, stow and count” / “said to contain” protect the carrier on FCL: it did not see the goods packed.</p>`,
    `
<h3>للبوليصة ثلاث وظائف</h3>
<ol><li><b>إيصال</b> باستلام البضاعة (بحالة ظاهرية جيدة — «نظيفة»).</li><li><b>دليل على عقد</b> النقل.</li><li><b>سند ملكية</b> — من يملك الأصل يتحكّم بالبضاعة.</li></ol>
<h3>الرئيسية وبوليصة الوكيل</h3>
<p>عندما تعمل كـNVOCC توجد بوليصتان: <b>MBL</b> (من الخط إلى وكيل الشحن) و<b>HBL</b> (من وكيل الشحن إلى الشاحن الفعلي). في MBL الشاحن والمرسل إليه عادة هما الوكيلان (وكيل المنشأ ومكتب الوجهة). في HBL هما البائع والمشتري الفعليان.</p>
<h3>«لأمر» (TO ORDER)</h3>
<p>إذا كان الدفع عبر مصرف (مستندات، اعتماد مستندي) يكون المرسل إليه غالبًا <b>«لأمر»</b> (أو «لأمر المصرف»). تُسلَّم البضاعة لمن يقدّم الأصل المظهَّر. ويُذكر المشتري كطرف مُخطَر.</p>
<h3>تعليمات الشحن (SI)</h3>
<p>تخبر SI الخط بالضبط ماذا يطبع: الأطراف، الحاوية/الختم، الطرود، الوصف، الوزن الإجمالي <b>للبضاعة</b> (وليس VGM)، الحجم، العلامات، شروط الدفع. أرسلها قبل <b>موعد SI</b>، وإلا تدفع رسم تأخير — أو تفوتك الباخرة.</p>
<h3>راجع كل مسودة</h3>
<p>التعديلات بعد تقديم المانيفست مكلفة وأحيانًا مستحيلة (وفي لبنان اسم مرسل إليه أو وزن خاطئ في المانيفست يسبّب مشاكل جمركية عند الوصول). قارن المسودة دائمًا مع SI واحصل على موافقة الشاحن الخطية على HBL قبل الإصدار.</p>
<p><b>العبارات:</b> «تحميل وتستيف وعدّ الشاحن» / «يقال إنها تحتوي» تحمي الناقل في FCL: لم يشاهد تعبئة البضاعة.</p>`)),
    parts: [
      {
        id: 'parties',
        title: L('Who goes on the MBL and the HBL?', 'من يظهر على MBL وHBL؟'),
        render(ctx, b) {
          const s = ctx.ship, sc = ctx.sc, p = OPS.blParties(s);
          const opts = [sc.shipper.name, sc.consignee.name, sc.agent.name, OPS.company.name, 'TO ORDER'].map((v) => ({ v, l: v }));
          const F = (k, lab) => ({ k, label: lab, type: 'select', options: opts, ans: () => p[k], path: 'documents.parties.' + k });
          ui().form(ctx, b, {
            key: 'parties',
            intro: imp(s) ? L('You are the buyer’s forwarder in Beirut; Huangpu is your agent in Shanghai.', 'أنت وكيل شحن المشتري في بيروت؛ هوانغبو وكيلك في شنغهاي.') : L('You are the seller’s forwarder in Beirut; Elbe Forwarding is your agent in Hamburg. Payment is CAD through a bank.', 'أنت وكيل شحن البائع في بيروت؛ Elbe Forwarding وكيلك في هامبورغ. الدفع مقابل المستندات عبر مصرف.'),
            fields: [F('mblShipper', L('MBL — shipper', 'MBL — الشاحن')), F('mblConsignee', L('MBL — consignee', 'MBL — المرسل إليه')), F('mblNotify', L('MBL — notify', 'MBL — المُخطَر')), F('hblShipper', L('HBL — shipper', 'HBL — الشاحن')), F('hblConsignee', L('HBL — consignee', 'HBL — المرسل إليه')), F('hblNotify', L('HBL — notify', 'HBL — المُخطَر'))],
            onSuccess: () => ctx.finish('parties'),
          });
        },
      },
      {
        id: 'si',
        title: L('Send the shipping instructions to the line', 'أرسل تعليمات الشحن إلى الخط'),
        render(ctx, b) {
          const s = ctx.ship, bk = s.booking, e = s.equipment, j = s.jobFile;
          if (ctx.data.waiting) { b.innerHTML = `<p class="muted">⏳ ${t(L('SI submitted — waiting for the draft B/L…', 'قُدّمت SI — بانتظار مسودة البوليصة…'))}</p>`; return; }
          ui().form(ctx, b, {
            key: 'si', submit: L('Submit SI', 'قدّم SI'),
            intro: L(`SI cutoff: ${TS.fmtDate(bk.cutoffs.si)}. Today: ${TS.fmtDate(s.sim.today)}.`, `موعد SI: ${TS.fmtDate(bk.cutoffs.si)}. اليوم: ${TS.fmtDate(s.sim.today)}.`),
            fields: [
              { k: 'bk', label: L('Booking no.', 'رقم الحجز'), ans: () => bk.no },
              { k: 'cn', label: L('Container no.', 'رقم الحاوية'), ans: () => e.containerNo },
              { k: 'seal', label: L('Seal no.', 'رقم الختم'), ans: () => e.seal },
              { k: 'pk', label: L('Packages', 'الطرود'), type: 'number', ans: () => j.packages },
              { k: 'desc', label: L('Description of goods', 'وصف البضاعة'), contains: ctx.sc.cargo.keywords, ans: () => j.commodity, full: true },
              { k: 'kg', label: L('Gross weight on B/L', 'الوزن الإجمالي على البوليصة'), unit: 'kg', type: 'number', ans: () => j.grossKg, fb: L('The B/L shows the cargo gross weight — not the VGM (which includes the container tare).', 'البوليصة تُظهر الوزن الإجمالي للبضاعة — وليس VGM (الذي يشمل وزن الحاوية).') },
              { k: 'cbm', label: L('Measurement', 'الحجم'), unit: 'CBM', type: 'number', tol: 0.3, ans: () => j.cbm },
              { k: 'ft', label: L('Freight terms (MBL)', 'شروط الشحن (MBL)'), type: 'select', options: [{ v: 'Prepaid', l: 'Prepaid' }, { v: 'Collect', l: 'Collect' }], ans: () => bk.freightTerms },
              { k: 'date', label: L('SI submission date', 'تاريخ تقديم SI'), type: 'date', ans: () => s.sim.today, check: (v) => (v > bk.cutoffs.si ? L('After the SI cutoff — late fee or rolled.', 'بعد موعد SI — رسم تأخير أو تأجيل.') : v < s.equipment.stuffedOn ? L('You cannot send final SI before stuffing (container/seal unknown).', 'لا يمكنك إرسال SI نهائية قبل التعبئة (الحاوية/الختم غير معروفين).') : true) },
            ],
            onSuccess: (v) => {
              s.documents.si = Object.assign({ submitted: v.date }, v, { parties: OPS.blParties(s) });
              ctx.send({ to: OPS.carriers[bk.carrier].email, subject: 'SI — booking ' + bk.no, body: L('Please find our shipping instructions for booking ' + bk.no + ' attached.', 'مرفق تعليمات الشحن للحجز ' + bk.no + '.'), attachments: ['SI_' + bk.no + '.pdf'] });
              ctx.data.waiting = true;
              ctx.receive({ from: OPS.carriers[bk.carrier].email, subject: L('Draft B/L for approval — ' + bk.no, 'مسودة البوليصة للموافقة — ' + bk.no), body: L('Dear customer,\n\nPlease check and approve the attached draft B/L within 24 hours. Amendments after manifest filing are subject to fees.\n\nDocumentation team', 'عميلنا العزيز،\n\nيرجى مراجعة مسودة البوليصة المرفقة والموافقة خلال 24 ساعة. التعديلات بعد تقديم المانيفست تخضع لرسوم.\n\nفريق المستندات'), attachments: ['DRAFT_MBL.pdf'], onArrive: (sh) => { const w = sh.work.si; w.data.waiting = false; w.parts.si = true; } }, 1400);
              ctx.save(); ctx.rerender();
            },
          });
        },
        summary: (ctx) => `<p>✓ ${t(L('SI submitted on', 'قُدّمت SI بتاريخ'))} ${TS.fmtDate(ctx.ship.documents.si.submitted)}</p>`,
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
              ctx.send({ to: OPS.carriers[s.booking.carrier].email, subject: 'Amendment draft B/L — ' + s.booking.no, body: L('Please correct: ' + errs.join(', ') + ' as per our SI, and resend the draft.', 'يرجى تصحيح: ' + errs.join('، ') + ' حسب SI وإعادة إرسال المسودة.') });
              ctx.receive({ from: OPS.carriers[s.booking.carrier].email, subject: L('Corrected draft B/L — ' + s.booking.no, 'مسودة مصحّحة — ' + s.booking.no), body: L('Corrected as requested. MBL no. ' + s.documents.bl.mblNo + '. Approved for issue after sailing.', 'تم التصحيح. رقم البوليصة ' + s.documents.bl.mblNo + '. معتمدة للإصدار بعد الإبحار.') });
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
          b.innerHTML = `<p>${t(imp(s) ? L('Your agent issues the HBL at origin on your behalf; the supplier must approve the draft.', 'وكيلك يصدر HBL في المنشأ نيابةً عنك؛ ويجب أن يوافق المورّد على المسودة.') : L('You issue the HBL. Send the draft to your client (the shipper) for written approval.', 'أنت تصدر HBL. أرسل المسودة إلى زبونك (الشاحن) للموافقة الخطية.'))}</p><p><a href="#docs">${t(L('Preview the HBL in Documents', 'معاينة HBL في المستندات'))}</a></p><button class="btn primary" id="snd">${t(L('Send draft HBL for approval', 'أرسل مسودة HBL للموافقة'))} ✉</button>`;
          b.querySelector('#snd').onclick = () => {
            ctx.send({ to: to.email, subject: L('Draft HBL ' + s.documents.bl.hblNo + ' for approval', 'مسودة HBL ' + s.documents.bl.hblNo + ' للموافقة'), body: L('Please review the attached draft house B/L and confirm in writing.', 'يرجى مراجعة مسودة بوليصة الوكيل المرفقة والتأكيد خطيًا.'), attachments: ['DRAFT_HBL_' + s.documents.bl.hblNo + '.pdf'] });
            ctx.data.waiting = true;
            ctx.receive({ from: imp(s) ? sc.shipper.email : sc.client.email, subject: L('RE: Draft HBL — approved', 'رد: مسودة HBL — موافقة'), body: L('Draft HBL checked — approved, please issue.', 'تمت مراجعة المسودة — موافقة، يرجى الإصدار.'), onArrive: (sh) => { const w = sh.work.si; w.data.waiting = false; w.parts.hbl = true; sh.documents.bl.hblApproved = sh.sim.today; OPS.app.checkStep(sh, OPS.steps.find((x) => x.id === 'si')); } }, 1300);
            ctx.save(); ctx.rerender();
          };
        },
        summary: () => `<p>✓ ${t(L('HBL draft approved in writing.', 'تمت الموافقة الخطية على مسودة HBL.'))}</p>`,
      },
    ],
    quiz: [
      { q: L('Which weight goes on the B/L?', 'أي وزن يُكتب على البوليصة؟'), o: [L('VGM', 'VGM'), L('Cargo gross weight', 'الوزن الإجمالي للبضاعة'), L('Net weight only', 'الوزن الصافي فقط')], a: 1 },
      { q: L('Payment by letter of credit. The HBL consignee is usually…', 'الدفع باعتماد مستندي. المرسل إليه في HBL عادة…'), o: [L('The buyer directly', 'المشتري مباشرة'), L('“To order” / to order of the bank', '«لأمر» / لأمر المصرف'), L('The shipping line', 'الخط الملاحي')], a: 1 },
      { q: L('Why is a wrong name on the manifest serious in Lebanon?', 'لماذا الاسم الخاطئ في المانيفست خطير في لبنان؟'), o: [L('It is not serious', 'ليس خطيرًا'), L('Customs data must match the declaration; amendments at destination cost time and fees', 'بيانات الجمارك يجب أن تطابق البيان؛ التعديل في الوجهة يكلّف وقتًا ورسومًا'), L('The vessel cannot sail', 'لا يمكن للباخرة الإبحار')], a: 1 },
    ],
  });

  /* ============================================================ 8. SAILING, RELEASE, PRE-ALERT */
  OPS.steps.push({
    id: 'sailing',
    title: L('Sailing, B/L release & pre-alert', 'الإبحار، إصدار البوليصة والإشعار المسبق'),
    sub: L('The vessel sails: issue the right type of B/L, handle freight payment and send/receive the pre-alert.', 'أبحرت الباخرة: أصدر النوع المناسب من البوليصة، تعامل مع دفع الشحن وأرسل/استلم الإشعار المسبق.'),
    lesson: () => t(L(`
<h3>After the vessel sails</h3>
<p>The line confirms the <b>ATD</b> (actual departure). Only then are B/Ls issued. Prepaid B/Ls are released after freight is paid.</p>
<h3>Release types — know them cold</h3>
<table><tr><th>Type</th><th>How</th><th>When</th></tr>
<tr><td>Original B/L (OBL)</td><td>3 originals; one surrendered at destination</td><td>Seller wants control until paid (CAD, L/C)</td></tr>
<tr><td>Seaway bill / express release</td><td>No originals; released to the named consignee</td><td>Trusted parties, intra-group, agent-to-agent MBLs</td></tr>
<tr><td>Telex release</td><td>Originals surrendered at origin; destination told electronically</td><td>Payment confirmed after originals were issued</td></tr>
<tr><td>Switch B/L</td><td>New set issued elsewhere, changing shipper details</td><td>Triangular trade. Handle carefully — fraud risk</td></tr></table>
<p><b>Never release cargo without payment or a surrendered original.</b> Once the goods are gone, your leverage is gone.</p>
<h3>Pre-alert</h3>
<p>Right after sailing, origin sends destination the pack: MBL & HBL copies, invoice, packing list, COO/certificates, container/seal, vessel/ETA and release instructions. Destination uses it to prepare the arrival notice and customs.</p>
<h3>Advance cargo data</h3>
<p>Many countries need cargo data before loading/arrival: <b>ICS2/ENS</b> (EU), <b>AMS/ISF</b> (USA). Lebanon: the carrier’s agent submits the manifest to Lebanese Customs (NAJM) before arrival. Late or wrong filings are fined — to whoever filed.</p>`,
    `
<h3>بعد إبحار الباخرة</h3>
<p>يؤكّد الخط <b>ATD</b> (المغادرة الفعلية). عندها فقط تصدر البوالص. البوالص المسبقة الدفع تُسلَّم بعد دفع الشحن.</p>
<h3>أنواع الإفراج — احفظها جيدًا</h3>
<table><tr><th>النوع</th><th>كيف</th><th>متى</th></tr>
<tr><td>بوليصة أصلية (OBL)</td><td>3 أصول؛ تُسلَّم واحدة في الوجهة</td><td>البائع يريد السيطرة حتى الدفع (مستندات، اعتماد)</td></tr>
<tr><td>Seaway bill / إفراج سريع</td><td>بدون أصول؛ تُسلَّم للمرسل إليه المسمّى</td><td>أطراف موثوقة، داخل المجموعة، بوالص رئيسية بين الوكلاء</td></tr>
<tr><td>تلكس ريليز</td><td>تُسلَّم الأصول في المنشأ وتُبلَّغ الوجهة إلكترونيًا</td><td>تأكّد الدفع بعد إصدار الأصول</td></tr>
<tr><td>Switch B/L</td><td>مجموعة جديدة تصدر في مكان آخر مع تغيير الشاحن</td><td>تجارة ثلاثية. بحذر — خطر احتيال</td></tr></table>
<p><b>لا تُفرج أبدًا عن البضاعة بدون دفع أو تسليم أصل.</b> عندما تخرج البضاعة تخسر ورقتك.</p>
<h3>الإشعار المسبق (Pre-alert)</h3>
<p>فور الإبحار يرسل المنشأ للوجهة الحزمة: نسخ MBL وHBL، الفاتورة، قائمة التعبئة، المنشأ/الشهادات، الحاوية/الختم، الباخرة/الوصول وتعليمات الإفراج. تستعملها الوجهة لتحضير إشعار الوصول والجمارك.</p>
<h3>البيانات المسبقة للبضاعة</h3>
<p>دول كثيرة تطلب البيانات قبل التحميل/الوصول: <b>ICS2/ENS</b> (أوروبا)، <b>AMS/ISF</b> (أميركا). لبنان: يقدّم وكيل الخط المانيفست للجمارك اللبنانية (نجم) قبل الوصول. التأخير أو الخطأ يُغرَّم — على من قدّم البيانات.</p>`)),
    parts: [
      {
        id: 'release',
        title: L('Choose the house B/L release', 'اختر طريقة إفراج بوليصة الوكيل'),
        render(ctx, b) {
          const s = ctx.ship;
          OPS.sailed(s);
          ctx.save();
          ui().choice(ctx, b, {
            key: 'rel',
            pre: `<div class="note ok">⛴ ${t(L('Vessel departed', 'أبحرت الباخرة'))} ${esc(s.booking.vessel)} — ATD ${TS.fmtDate(s.booking.etd)}. ${t(L('Payment terms', 'شروط الدفع'))}: <b>${t(ctx.sc.payment)}</b></div>`,
            q: imp(s) ? L('The supplier is paid the 70% balance against a copy of the B/L. How should the HBL be handled so the supplier keeps control until paid?', 'يُدفع للمورّد رصيد 70% مقابل نسخة البوليصة. كيف يجب التعامل مع HBL ليحتفظ المورّد بالسيطرة حتى الدفع؟') : L('Payment is Cash Against Documents through the buyer’s bank. What do you issue?', 'الدفع مقابل المستندات عبر مصرف المشتري. ماذا تصدر؟'),
            options: imp(s) ? [
              { l: L('Agent issues original HBLs to the supplier; after the balance is paid the supplier surrenders them and the agent sends you a telex release.', 'يصدر الوكيل HBL أصلية للمورّد؛ بعد دفع الرصيد يسلّمها المورّد ويرسل الوكيل تلكس ريليز إليك.'), ok: true, fb: L('Correct: control until payment, then fast electronic release.', 'صحيح: سيطرة حتى الدفع ثم إفراج إلكتروني سريع.') },
              { l: L('Issue a seaway bill to Cedar Home now.', 'إصدار Seaway bill لـ Cedar Home الآن.'), ok: false, fb: L('The supplier would lose control before being paid.', 'سيخسر المورّد السيطرة قبل أن يُدفع له.') },
              { l: L('Issue a switch B/L in Dubai.', 'إصدار Switch B/L في دبي.'), ok: false, fb: L('No reason for a switch here — and it adds fraud risk.', 'لا سبب لـ Switch هنا — ويضيف خطر احتيال.') },
            ] : [
              { l: L('A full set of 3 original HBLs “to order”, given to the shipper once our freight invoice is paid, for presentation to the bank.', 'مجموعة كاملة من 3 أصول HBL «لأمر»، تُسلَّم للشاحن بعد دفع فاتورة الشحن، لتقديمها للمصرف.'), ok: true },
              { l: L('Telex release to Hamburg immediately.', 'تلكس ريليز إلى هامبورغ فورًا.'), ok: false, fb: L('The bank would have no documents to control — the buyer could take the goods without paying.', 'لن يكون لدى المصرف مستندات — يمكن للمشتري أخذ البضاعة بدون دفع.') },
              { l: L('Seaway bill consigned to Levante Feinkost.', 'Seaway bill باسم Levante Feinkost.'), ok: false, fb: L('Same problem: no title control for CAD.', 'المشكلة نفسها: لا سيطرة على الملكية في CAD.') },
            ],
            onSuccess: () => { s.documents.bl.hblType = imp(s) ? 'Original (3/3) at origin → telex release after payment' : 'Original (3/3) TO ORDER — CAD via bank'; s.documents.bl.issuedOn = s.booking.etd; ctx.finish('release'); },
          });
        },
        summary: (ctx) => `<p>✓ HBL ${esc(ctx.ship.documents.bl.hblNo)}: ${esc(ctx.ship.documents.bl.hblType)}</p>`,
      },
      {
        id: 'mbl',
        title: L('Master B/L & freight payment', 'البوليصة الرئيسية ودفع الشحن'),
        render(ctx, b) {
          const s = ctx.ship;
          if (imp(s)) {
            ui().choice(ctx, b, {
              key: 'mbl', q: L('The MBL consignee is your own company in Beirut and freight is collect. Which MBL release do you ask the line for?', 'المرسل إليه في MBL هو شركتك في بيروت والشحن يُدفع عند الوصول. أي إفراج تطلب من الخط؟'),
              options: [
                { l: L('Seaway bill / express release — the line releases to you in Beirut once freight and local charges are paid', 'Seaway bill / إفراج سريع — يفرج الخط لك في بيروت بعد دفع الشحن والرسوم المحلية'), ok: true },
                { l: L('3 original MBLs couriered from Shanghai', '3 أصول MBL تُرسل بالبريد السريع من شنغهاي'), ok: false, fb: L('Slow and costly between two offices that trust each other; risk of late arrival of originals → demurrage.', 'بطيء ومكلف بين مكتبين يثقان ببعضهما؛ خطر تأخّر الأصول ← غرامات.') },
              ],
              onSuccess: () => { s.documents.bl.mblType = 'Seaway bill (express release)'; ctx.finish('mbl'); },
            });
          } else {
            const q = s.quotation, carrierBuy = TS.round2(q.lines.filter((l) => l.vendor === 'carrier').reduce((a, l) => a + Number(l.buy), 0));
            ui().form(ctx, b, {
              key: 'mblpay', intro: L('Freight is prepaid: the line invoices you before releasing the MBL. Calculate the carrier invoice from your buy lines (vendor = carrier).', 'الشحن مسبق الدفع: الخط يفوترك قبل الإفراج عن MBL. احسب فاتورة الخط من بنود الكلفة (المورّد = الخط).'),
              fields: [
                { k: 'amt', label: L('Amount payable to the line', 'المبلغ المستحق للخط'), unit: 'USD', type: 'number', tol: 1, ans: () => carrierBuy },
                { k: 'type', label: L('MBL release type (to your Hamburg agent)', 'نوع إفراج MBL (لوكيلك في هامبورغ)'), type: 'select', options: [{ v: 'seaway', l: L('Seaway bill / express release', 'Seaway bill / إفراج سريع') }, { v: 'obl', l: L('3 originals by courier', '3 أصول بالبريد') }], ans: () => 'seaway' },
              ],
              onSuccess: (v) => { s.documents.bl.mblType = 'Seaway bill (express release)'; s.closing.carrierPaid = v.amt; ctx.send({ to: OPS.carriers[s.booking.carrier].email, subject: 'Payment ' + s.documents.bl.mblNo, body: L('Payment USD ' + TS.num(v.amt) + ' transferred. Please release MBL as seaway bill.', 'تم تحويل ' + TS.num(v.amt) + ' دولار. يرجى إصدار MBL كـ Seaway bill.') }); ctx.finish('mbl'); },
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
            if (!s.emails.find((e) => e.step === 'sailing' && e.from === sc.agent.email && String(e.subject.en || e.subject).startsWith('PRE-ALERT'))) {
              OPS.emailPush(s, 'in', { from: sc.agent.email, to: OPS.company.email, step: 'sailing', read: false, subject: L('PRE-ALERT ' + s.documents.bl.hblNo + ' / ' + s.booking.vessel, 'PRE-ALERT ' + s.documents.bl.hblNo + ' / ' + s.booking.vessel), body: L(`Dear colleagues,\n\nPlease find pre-alert for HBL ${s.documents.bl.hblNo} / MBL ${s.documents.bl.mblNo}.\nVessel ${s.booking.vessel} ${s.booking.voyage} sailed ${TS.fmtDate(s.booking.etd)}, ETA Beirut ${TS.fmtDate(s.booking.eta)}.\nContainer ${s.equipment.containerNo} seal ${s.equipment.seal}.\nHBL originals held by shipper until balance payment.\n\nAttached: MBL copy, HBL copy, commercial invoice, certificate of origin.\n\n${sc.agent.contact}`, `زملاءنا الأعزاء،\n\nمرفق الإشعار المسبق لـ HBL ${s.documents.bl.hblNo} / MBL ${s.documents.bl.mblNo}.\nالباخرة ${s.booking.vessel} ${s.booking.voyage} أبحرت ${TS.fmtDate(s.booking.etd)}، الوصول لبيروت ${TS.fmtDate(s.booking.eta)}.\nالحاوية ${s.equipment.containerNo} الختم ${s.equipment.seal}.\nأصول HBL لدى الشاحن حتى دفع الرصيد.\n\nالمرفقات: نسخة MBL، نسخة HBL، الفاتورة التجارية، شهادة المنشأ.\n\n${sc.agent.contact}`), attachments: ['MBL_copy.pdf', 'HBL_copy.pdf', 'Commercial_invoice.pdf', 'COO.pdf'] });
              ctx.save();
            }
            ui().choice(ctx, b, {
              key: 'pa', q: L('The pre-alert from Shanghai is in your inbox. Which document needed for Lebanese customs is missing?', 'الإشعار المسبق من شنغهاي في بريدك. أي مستند ضروري للجمارك اللبنانية ناقص؟'),
              options: [
                { l: L('Packing list', 'قائمة التعبئة'), ok: true },
                { l: L('Arrival notice', 'إشعار الوصول'), ok: false, fb: L('You issue the arrival notice at destination.', 'أنت تصدر إشعار الوصول في الوجهة.') },
                { l: L('Delivery order', 'إذن التسليم'), ok: false, fb: L('The D/O is issued at destination by the line’s agent.', 'يصدر إذن التسليم في الوجهة من وكيل الخط.') },
                { l: L('Lebanese customs declaration', 'البيان الجمركي اللبناني'), ok: false, fb: L('Lodged in Beirut by the broker, not sent by origin.', 'يقدّمه المخلّص في بيروت ولا يُرسل من المنشأ.') },
              ],
              onSuccess: () => {
                ctx.send({ to: sc.agent.email, subject: L('RE: PRE-ALERT ' + s.documents.bl.hblNo + ' — packing list missing', 'رد: PRE-ALERT ' + s.documents.bl.hblNo + ' — قائمة التعبئة ناقصة'), body: L('Thanks. Please send the packing list today — our client needs it for the Lebanese customs declaration.', 'شكرًا. يرجى إرسال قائمة التعبئة اليوم — يحتاجها زبوننا للبيان الجمركي اللبناني.') });
                ctx.receive({ from: sc.agent.email, subject: L('Packing list ' + s.documents.bl.hblNo, 'قائمة التعبئة ' + s.documents.bl.hblNo), body: L('Apologies — packing list attached.', 'نعتذر — قائمة التعبئة مرفقة.'), attachments: ['Packing_list.pdf'] }, 900);
                s.documents.preAlert = { received: s.sim.today, docs: ['MBL copy', 'HBL copy', 'Commercial invoice', 'COO', 'Packing list'] };
                ctx.finish('prealert');
              },
            });
          } else {
            ui().choice(ctx, b, {
              key: 'pa', multi: true, q: L('Prepare the pre-alert to Elbe Forwarding (Hamburg). Select what you include.', 'حضّر الإشعار المسبق إلى Elbe Forwarding (هامبورغ). اختر ما تضمّنه.'),
              options: [
                { l: L('MBL copy (seaway)', 'نسخة MBL (Seaway)'), ok: true },
                { l: L('HBL copy', 'نسخة HBL'), ok: true },
                { l: L('Commercial invoice & packing list', 'الفاتورة التجارية وقائمة التعبئة'), ok: true },
                { l: L('COO / EUR.1 and health certificate copies', 'نسخ المنشأ / EUR.1 والشهادة الصحية'), ok: true },
                { l: L('Release instruction: release only against one original HBL', 'تعليمات الإفراج: الإفراج فقط مقابل أصل HBL واحد'), ok: true },
                { l: L('Our buy-rate sheet from the line', 'ورقة أسعار الكلفة من الخط'), ok: false, fb: L('Confidential.', 'سرّي.') },
                { l: L('The client’s bank account details', 'تفاصيل حساب الزبون المصرفي'), ok: false, fb: L('Not needed and confidential.', 'غير ضروري وسرّي.') },
              ],
              submit: L('Send pre-alert', 'أرسل الإشعار المسبق'),
              onSuccess: () => {
                ctx.send({ to: sc.agent.email, subject: 'PRE-ALERT ' + s.documents.bl.hblNo + ' / ' + s.booking.vessel, body: L(`Dear Anna,\n\nPre-alert HBL ${s.documents.bl.hblNo} / MBL ${s.documents.bl.mblNo}, ${s.booking.vessel} ETD ${TS.fmtDate(s.booking.etd)}, ETA Hamburg ${TS.fmtDate(s.booking.eta)}.\nContainer ${s.equipment.containerNo}, seal ${s.equipment.seal}.\nIMPORTANT: release only against one original HBL (CAD).\n\nBest regards,\n${OPS.company.name}`, `عزيزتي آنا،\n\nإشعار مسبق HBL ${s.documents.bl.hblNo} / MBL ${s.documents.bl.mblNo}، ${s.booking.vessel} مغادرة ${TS.fmtDate(s.booking.etd)}، وصول هامبورغ ${TS.fmtDate(s.booking.eta)}.\nالحاوية ${s.equipment.containerNo}، الختم ${s.equipment.seal}.\nمهم: الإفراج فقط مقابل أصل HBL (مستندات).\n\nمع التحية،\n${OPS.company.name}`), attachments: ['MBL_copy.pdf', 'HBL_copy.pdf', 'CI_PL.pdf', 'COO_EUR1.pdf', 'HealthCert.pdf'] });
                s.documents.preAlert = { sent: s.sim.today, docs: ['MBL copy', 'HBL copy', 'CI', 'PL', 'COO/EUR.1', 'Health certificate'] };
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
          const s = ctx.ship;
          ui().choice(ctx, b, {
            key: 'man',
            q: imp(s) ? L('Who submits the cargo manifest to Lebanese Customs before the vessel arrives in Beirut?', 'من يقدّم مانيفست البضائع للجمارك اللبنانية قبل وصول الباخرة إلى بيروت؟') : L('The container goes to the EU. What about ICS2 / ENS?', 'الحاوية متجهة للاتحاد الأوروبي. ماذا عن ICS2 / ENS؟'),
            options: imp(s) ? [
              { l: L('The shipping line’s agent in Lebanon, electronically (NAJM); as NVOCC you make sure the house data (HBL consignee, packages, description) is correct', 'وكيل الخط في لبنان إلكترونيًا (نجم)؛ وكـNVOCC تتأكّد من صحة بيانات HBL (المرسل إليه، الطرود، الوصف)'), ok: true },
              { l: L('The consignee, after arrival', 'المرسل إليه بعد الوصول'), ok: false },
              { l: L('Nobody — Lebanon has no manifest', 'لا أحد — لا مانيفست في لبنان'), ok: false },
            ] : [
              { l: L('The carrier files the ENS before loading; as NVOCC you must provide house-level (HBL) data to ICS2 on time', 'الخط يقدّم ENS قبل التحميل؛ وكـNVOCC يجب أن تقدّم بيانات HBL لنظام ICS2 في الوقت المحدّد'), ok: true },
              { l: L('Only needed for air cargo', 'مطلوب فقط للشحن الجوي'), ok: false },
              { l: L('The buyer files it after arrival in Hamburg', 'المشتري يقدّمه بعد الوصول إلى هامبورغ'), ok: false },
            ],
            onSuccess: () => { ctx.milestone('ATD', s.booking.etd, 'Vessel sailed ' + s.booking.vessel); ctx.finish('manifest'); },
          });
        },
      },
    ],
    quiz: [
      { q: L('Which release gives the seller control until payment?', 'أي إفراج يعطي البائع السيطرة حتى الدفع؟'), o: [L('Seaway bill', 'Seaway bill'), L('Original B/L', 'بوليصة أصلية'), L('Express release', 'إفراج سريع')], a: 1 },
      { q: L('A prepaid B/L is released…', 'البوليصة المسبقة الدفع تُسلَّم…'), o: [L('Before the vessel sails', 'قبل إبحار الباخرة'), L('After sailing and after freight payment', 'بعد الإبحار وبعد دفع الشحن'), L('At destination', 'في الوجهة')], a: 1 },
      { q: L('Switch B/Ls are dangerous because…', 'Switch B/L خطرة لأن…'), o: [L('They are illegal everywhere', 'غير قانونية في كل مكان'), L('Changing shipper details is where fraud often happens', 'تغيير بيانات الشاحن هو حيث يحدث الاحتيال غالبًا'), L('They are more expensive', 'أغلى')], a: 1 },
    ],
  });

  /* sailing: set ATD and planned tracking */
  OPS.sailed = (s) => {
    if (s.sailedDone) return;
    const bk = s.booking, r = s.rates.selected, car = OPS.carriers[bk.carrier];
    const tsArr = TS.addDays(bk.etd, Math.round(r.transit * 0.6));
    const tsDep = TS.addDays(tsArr, 2 + 4);
    const newEta = TS.addDays(bk.eta, 4);
    const tsPort = r.ts;
    s.tracking = (s.tracking || []).filter((e) => e.code !== 'x').concat([
      { date: bk.etd, event: L('Loaded on vessel', 'حُمّلت على الباخرة'), loc: s.jobFile.pol, vessel: bk.vessel },
      { date: bk.etd, event: L('Vessel departed', 'غادرت الباخرة'), loc: s.jobFile.pol, vessel: bk.vessel },
      { date: tsArr, event: L('Arrived at transshipment port', 'وصلت إلى مرفأ المسافنة'), loc: tsPort, vessel: bk.vessel },
      { date: tsArr, event: L('Discharged at T/S', 'فُرّغت في مرفأ المسافنة'), loc: tsPort },
      { date: tsDep, event: L('Loaded on connecting vessel (delayed 4 days — terminal congestion)', 'حُمّلت على الباخرة الرديفة (تأخير 4 أيام — ازدحام المحطة)'), loc: tsPort, vessel: car.vessels[2] },
      { date: tsDep, event: L('Departed T/S', 'غادرت مرفأ المسافنة'), loc: tsPort, vessel: car.vessels[2] },
      { date: newEta, event: L('Arrived at port of discharge', 'وصلت إلى مرفأ التفريغ'), loc: s.jobFile.pod, vessel: car.vessels[2] },
      { date: newEta, event: L('Discharged from vessel', 'فُرّغت من الباخرة'), loc: s.jobFile.pod },
    ]);
    s.booking.atd = bk.etd;
    s.booking.tsArrival = tsArr; s.booking.tsDeparture = tsDep; s.booking.revisedEta = newEta; s.booking.connectingVessel = car.vessels[2];
    s.sim.today = s.sim.today > bk.etd ? s.sim.today : bk.etd;
    s.sailedDone = true;
  };

  /* ============================================================ 9. TRACKING & ARRIVAL NOTICE */
  OPS.steps.push({
    id: 'tracking',
    title: L('Tracking, delays & arrival notice', 'التتبّع، التأخير وإشعار الوصول'),
    sub: L('Follow the container, communicate a delay honestly and prepare the arrival notice.', 'تابع الحاوية، أبلغ عن التأخير بصدق وحضّر إشعار الوصول.'),
    lesson: () => t(L(`
<h3>Proactive tracking</h3>
<p>Check the line’s tracking at each milestone: loaded, departed, T/S arrival, T/S departure, arrival. The weak point is the <b>transshipment</b>: missed connections, congestion, rolled boxes at the hub.</p>
<h3>Communicating delays</h3>
<ul><li>Tell the client <b>before</b> they ask.</li><li>Give facts: what happened, new estimated date, impact (free time starts at discharge, so no D&D impact from a sea delay).</li><li>Never promise a new date as a fact — it is still an estimate.</li><li>No blame games; propose options if any (e.g. pre-clearance preparation).</li></ul>
<h3>Arrival notice</h3>
<p>A few days before arrival, the consignee receives an arrival notice: vessel/ETA, B/L no., container, packages, and the <b>charges to pay before release</b>, plus documents needed. For a Lebanese import it should also remind the client of the container deposit and to prepare customs documents now.</p>`,
    `
<h3>التتبّع الاستباقي</h3>
<p>تحقّق من تتبّع الخط عند كل مرحلة: التحميل، المغادرة، الوصول للمسافنة، المغادرة منها، الوصول. النقطة الضعيفة هي <b>المسافنة</b>: ربطات فائتة، ازدحام، حاويات مؤجّلة في المرفأ المحوري.</p>
<h3>الإبلاغ عن التأخير</h3>
<ul><li>أبلغ الزبون <b>قبل</b> أن يسأل.</li><li>أعطِ حقائق: ماذا حدث، التاريخ المقدّر الجديد، التأثير (فترة السماح تبدأ عند التفريغ، فلا أثر على الغرامات من تأخير البحر).</li><li>لا تَعِد بتاريخ جديد كحقيقة — ما زال تقديرًا.</li><li>لا تلقِ اللوم؛ اقترح خيارات إن وجدت (مثل تحضير التخليص مسبقًا).</li></ul>
<h3>إشعار الوصول</h3>
<p>قبل أيام من الوصول، يستلم المرسل إليه إشعار وصول: الباخرة/الوصول، رقم البوليصة، الحاوية، الطرود، و<b>الرسوم الواجب دفعها قبل الإفراج</b>، والمستندات المطلوبة. في الاستيراد اللبناني يجب أن يذكّر الزبون أيضًا بتأمين الحاوية وبتحضير مستندات الجمارك الآن.</p>`)),
    parts: [
      {
        id: 'read',
        title: L('Read the tracking & the carrier’s delay notice', 'اقرأ التتبّع وإشعار التأخير من الخط'),
        render(ctx, b) {
          const s = ctx.ship, bk = s.booking;
          OPS.sailed(s);
          ctx.advance(bk.tsArrival);
          if (!s.emails.find((e) => e.step === 'tracking' && e.box === 'in')) {
            OPS.emailPush(s, 'in', { from: OPS.carriers[bk.carrier].email, to: OPS.company.email, step: 'tracking', read: false, subject: L('Customer advisory — delay at ' + s.rates.selected.ts, 'إشعار للعملاء — تأخير في ' + s.rates.selected.ts), body: L(`Dear customer,\n\nDue to terminal congestion at ${s.rates.selected.ts}, containers discharged from ${bk.vessel} will connect to ${bk.connectingVessel}, departing ${TS.fmtDate(bk.tsDeparture)}.\nRevised ETA ${s.jobFile.pod}: ${TS.fmtDate(bk.revisedEta)} (originally ${TS.fmtDate(bk.eta)}).\nWe apologise for the inconvenience.`, `عميلنا العزيز،\n\nبسبب ازدحام المحطة في ${s.rates.selected.ts}، ستُنقل الحاويات المفرّغة من ${bk.vessel} على ${bk.connectingVessel} المغادرة في ${TS.fmtDate(bk.tsDeparture)}.\nالوصول المعدّل إلى ${s.jobFile.pod}: ${TS.fmtDate(bk.revisedEta)} (كان ${TS.fmtDate(bk.eta)}).\nنعتذر عن الإزعاج.`) });
          }
          ctx.save();
          const tr = ui().table([L('Date', 'التاريخ'), L('Event', 'الحدث'), L('Location', 'المكان')], s.tracking.map((e) => `<tr class="${e.date > s.sim.today ? 'muted' : ''}"><td>${TS.fmtDate(e.date, false)}</td><td>${esc(t(e.event))}${e.date > s.sim.today ? ' <span class="badge">' + t(L('planned', 'مخطّط')) + '</span>' : ''}</td><td>${esc(e.loc)}</td></tr>`));
          const wrap = document.createElement('div'); wrap.innerHTML = tr; b.appendChild(wrap);
          const f = document.createElement('div'); b.appendChild(f);
          ui().form(ctx, f, {
            key: 'trk',
            fields: [
              { k: 'ts', label: L('Transshipment port', 'مرفأ المسافنة'), contains: [s.rates.selected.ts.split(' ')[0]], ans: () => s.rates.selected.ts },
              { k: 'cv', label: L('Connecting vessel', 'الباخرة الرديفة'), ans: () => bk.connectingVessel },
              { k: 'old', label: L('Original ETA', 'الوصول الأصلي'), type: 'date', ans: () => bk.eta },
              { k: 'new', label: L('Revised ETA', 'الوصول المعدّل'), type: 'date', ans: () => bk.revisedEta },
            ],
            onSuccess: () => ctx.finish('read'),
          });
        },
      },
      {
        id: 'notify',
        title: L('Inform the client about the delay', 'أبلغ الزبون بالتأخير'),
        render(ctx, b) {
          const s = ctx.ship, bk = s.booking;
          const opts = [
            { l: L(`“Dear ${ctx.sc.client.contact}, the carrier informs us of congestion at ${s.rates.selected.ts}. The container is now connecting on ${bk.connectingVessel}; revised ETA ${TS.fmtDate(bk.revisedEta)} (estimated). Free time starts at discharge, so there is no demurrage impact. We will update you at each milestone.”`, `«السيد/ة ${ctx.sc.client.contact}، أبلغنا الخط عن ازدحام في ${s.rates.selected.ts}. الحاوية الآن على ${bk.connectingVessel}؛ الوصول المعدّل ${TS.fmtDate(bk.revisedEta)} (تقديري). فترة السماح تبدأ عند التفريغ فلا أثر على الغرامات. سنبلغكم عند كل مرحلة.»`), ok: true },
            { l: L(`“The container will arrive on ${TS.fmtDate(bk.revisedEta)}, guaranteed.”`, `«ستصل الحاوية في ${TS.fmtDate(bk.revisedEta)}، مضمون.»`), ok: false, fb: L('ETAs are estimates — never guarantee them.', 'مواعيد الوصول تقديرية — لا تضمنها أبدًا.') },
            { l: L('Say nothing — maybe the line catches up.', 'لا تقل شيئًا — ربما يعوّض الخط التأخير.'), ok: false, fb: L('The client will find out anyway and trust will be lost.', 'سيعرف الزبون على أي حال وستُفقد الثقة.') },
          ];
          ui().choice(ctx, b, { key: 'dly', q: L('Choose the message to send.', 'اختر الرسالة لإرسالها.'), options: opts, onSuccess: () => { ctx.send({ to: ctx.sc.client.email, subject: L('Update ' + s.id + ' — revised ETA', 'تحديث ' + s.id + ' — وصول معدّل'), body: opts[0].l }); ctx.finish('notify'); } });
        },
      },
      {
        id: 'an',
        title: (sh) => (imp(sh) ? L('Issue the arrival notice', 'أصدر إشعار الوصول') : L('Status update to the shipper', 'تحديث الحالة للشاحن')),
        render(ctx, b) {
          const s = ctx.ship, bk = s.booking, q = s.quotation;
          ctx.advance(TS.addDays(bk.revisedEta, -3));
          ctx.save();
          if (imp(s)) {
            ui().form(ctx, b, {
              key: 'an', intro: L('Prepare the arrival notice to Cedar Home. Charges come from the accepted quotation.', 'حضّر إشعار الوصول إلى Cedar Home. الرسوم من العرض المقبول.'),
              submit: L('Send arrival notice', 'أرسل إشعار الوصول'),
              fields: [
                { k: 'eta', label: 'ETA Beirut', type: 'date', ans: () => bk.revisedEta },
                { k: 'hbl', label: 'HBL no.', ans: () => s.documents.bl.hblNo },
                { k: 'tot', label: L('Total due incl. VAT (per quotation)', 'المجموع المستحق مع الضريبة (حسب العرض)'), unit: 'USD', type: 'number', tol: 1, ans: () => q.totals.grand },
                { k: 'dep', label: L('Container deposit to prepare', 'تأمين الحاوية المطلوب'), unit: 'USD', type: 'number', ans: () => ctx.sc.deposit },
                { k: 'free', label: L('Free days from discharge', 'أيام السماح من التفريغ'), type: 'number', ans: () => bk.freeDays },
              ],
              onSuccess: (v) => {
                s.documents.arrivalNotice = { date: s.sim.today, eta: v.eta, totalDue: v.tot, deposit: v.dep, freeDays: v.free };
                ctx.send({ to: ctx.sc.client.email, subject: L('ARRIVAL NOTICE ' + s.documents.bl.hblNo + ' — ETA ' + TS.fmtDate(v.eta, false), 'إشعار وصول ' + s.documents.bl.hblNo + ' — الوصول ' + TS.fmtDate(v.eta, false)), body: L(`Dear ${ctx.sc.client.contact},\n\nYour container ${s.equipment.containerNo} (HBL ${s.documents.bl.hblNo}) is expected in Beirut on ${TS.fmtDate(v.eta)} on ${bk.connectingVessel}.\nAmount due before release: USD ${TS.num(v.tot)} (incl. VAT) — invoice attached.\nContainer deposit: USD ${TS.num(v.dep, 0)} (refundable) to be provided before the D/O.\nFree time: ${v.free} days from discharge.\nPlease send us now for customs: commercial invoice, packing list, certificate of origin, your commercial registration / VAT certificate.\n\nBest regards,\n${OPS.company.name}`, `السيد/ة ${ctx.sc.client.contact}،\n\nيُتوقّع وصول حاويتكم ${s.equipment.containerNo} (HBL ${s.documents.bl.hblNo}) إلى بيروت بتاريخ ${TS.fmtDate(v.eta)} على ${bk.connectingVessel}.\nالمبلغ المستحق قبل الإفراج: ${TS.num(v.tot)} دولار (مع الضريبة) — الفاتورة مرفقة.\nتأمين الحاوية: ${TS.num(v.dep, 0)} دولار (مسترد) قبل إذن التسليم.\nفترة السماح: ${v.free} أيام من التفريغ.\nيرجى إرسال مستندات الجمارك الآن: الفاتورة التجارية، قائمة التعبئة، شهادة المنشأ، السجل التجاري/الشهادة الضريبية.\n\nمع التحية،\n${OPS.company.name}`), attachments: ['Arrival_notice.pdf', 'Invoice.pdf'] });
                ctx.finish('an');
              },
            });
          } else {
            ui().form(ctx, b, {
              key: 'an', intro: L('Elbe Forwarding will issue the arrival notice to Levante Feinkost. Confirm the facts to your client (the shipper).', 'Elbe Forwarding ستصدر إشعار الوصول إلى Levante Feinkost. أكّد الحقائق لزبونك (الشاحن).'),
              submit: L('Send status to client', 'أرسل الحالة للزبون'),
              fields: [
                { k: 'eta', label: 'ETA Hamburg', type: 'date', ans: () => bk.revisedEta },
                { k: 'who', label: L('Who pays destination THC & D/O fees in Hamburg?', 'من يدفع THC ورسوم إذن التسليم في هامبورغ؟'), type: 'select', options: [{ v: 'consignee', l: L('The consignee (buyer)', 'المرسل إليه (المشتري)') }, { v: 'shipper', l: L('Our client (seller)', 'زبوننا (البائع)') }, { v: 'us', l: L('Us', 'نحن') }], ans: () => 'consignee', fb: L('CFR: the seller pays freight to POD; destination charges are for the buyer.', 'CFR: البائع يدفع الشحن حتى مرفأ التفريغ؛ رسوم الوجهة على المشتري.') },
                { k: 'docs', label: L('Did the bank receive the original HBLs?', 'هل استلم المصرف أصول HBL؟'), type: 'select', options: yesNo, ans: () => 'yes' },
              ],
              onSuccess: (v) => { s.documents.arrivalNotice = { by: 'Elbe Forwarding (destination agent)', eta: v.eta }; ctx.send({ to: ctx.sc.client.email, subject: L('Status ' + s.id + ' — ETA Hamburg', 'حالة ' + s.id + ' — الوصول لهامبورغ'), body: L('Container expected in Hamburg ' + TS.fmtDate(v.eta) + '. Our agent will notify the buyer; release only against an original HBL.', 'الحاوية متوقعة في هامبورغ ' + TS.fmtDate(v.eta) + '. وكيلنا سيبلغ المشتري؛ الإفراج فقط مقابل أصل HBL.') }); ctx.finish('an'); },
            });
          }
        },
      },
    ],
    quiz: [
      { q: L('A vessel is 4 days late. Does demurrage free time start earlier?', 'الباخرة متأخرة 4 أيام. هل تبدأ فترة السماح أبكر؟'), o: [L('Yes', 'نعم'), L('No — it starts at discharge', 'لا — تبدأ عند التفريغ')], a: 1 },
      { q: L('What is the most delay-prone part of this routing?', 'ما أكثر جزء عرضة للتأخير في هذا المسار؟'), o: [L('The transshipment connection', 'الربط في مرفأ المسافنة'), L('The B/L printing', 'طباعة البوليصة'), L('The quotation', 'عرض السعر')], a: 0 },
    ],
  });

  /* ============================================================ 10. RELEASE & CUSTOMS */
  OPS.steps.push({
    id: 'release',
    title: L('Arrival, D/O release & customs clearance', 'الوصول، إذن التسليم والتخليص الجمركي'),
    sub: L('Collect payment, get the delivery order and hand the file to Customs — without ever releasing cargo unpaid.', 'حصّل الدفع، احصل على إذن التسليم وسلّم الملف للجمارك — بدون إفراج أبدًا قبل الدفع.'),
    lesson: () => t(L(`
<h3>The release chain at destination</h3>
<ol><li>Vessel arrives, container discharged (free time starts).</li><li>Consignee pays the charges on the arrival notice.</li><li>B/L released: original surrendered, telex release or seaway bill.</li><li>Line’s agent issues the <b>delivery order (D/O)</b> after its charges and deposit/guarantee.</li><li>Customs declaration, inspection (if selected), duties & VAT paid, customs release.</li><li>Terminal gate-out and delivery.</li></ol>
<h3>Credit control</h3>
<p>“Release today, we pay tomorrow” is how forwarders lose money. Only management can approve credit. Your leverage is the D/O.</p>
<h3>Customs value (Lebanon)</h3>
<p>Duties are calculated on the <b>CIF value</b>: invoice value + freight + insurance to the Lebanese port. That is why FOB imports need the freight amount on the customs file. Duty rate depends on the HS code (and origin agreements); then VAT 11% on CIF + duty.</p>`,
    `
<h3>سلسلة الإفراج في الوجهة</h3>
<ol><li>تصل الباخرة وتُفرّغ الحاوية (تبدأ فترة السماح).</li><li>يدفع المرسل إليه رسوم إشعار الوصول.</li><li>الإفراج عن البوليصة: تسليم الأصل، تلكس ريليز أو Seaway bill.</li><li>يصدر وكيل الخط <b>إذن التسليم (D/O)</b> بعد رسومه والتأمين/الكفالة.</li><li>البيان الجمركي، الكشف (إن اختير)، دفع الرسوم والضريبة، الإفراج الجمركي.</li><li>خروج الحاوية من المحطة والتسليم.</li></ol>
<h3>مراقبة الائتمان</h3>
<p>«أفرج اليوم وندفع غدًا» هكذا يخسر وكلاء الشحن أموالهم. فقط الإدارة توافق على الائتمان. ورقتك هي إذن التسليم.</p>
<h3>القيمة الجمركية (لبنان)</h3>
<p>تُحسب الرسوم على <b>قيمة CIF</b>: قيمة الفاتورة + الشحن + التأمين حتى المرفأ اللبناني. لذلك يحتاج استيراد FOB مبلغ الشحن في ملف الجمارك. نسبة الرسم حسب رمز HS (واتفاقيات المنشأ)؛ ثم ضريبة 11% على CIF + الرسم.</p>`))
      + LB('At Beirut: the line’s agent issues the D/O after payment of its local charges and the container deposit/guarantee. The D/O is required to complete the customs declaration in NAJM. Port storage (port authority) and line demurrage are separate clocks — both run while you wait for documents or licences.', 'في بيروت: يصدر وكيل الخط إذن التسليم بعد دفع رسومه المحلية وتأمين/كفالة الحاوية. إذن التسليم مطلوب لإكمال البيان الجمركي على نظام نجم. تخزين المرفأ (إدارة المرفأ) وغرامات الخط عدّادان منفصلان — وكلاهما يعمل أثناء انتظار المستندات أو التراخيص.'),
    parts: [
      {
        id: 'pay',
        title: L('Payment and credit control', 'الدفع ومراقبة الائتمان'),
        render(ctx, b) {
          const s = ctx.ship, sc = ctx.sc;
          ctx.advance(s.booking.revisedEta); ctx.save();
          if (imp(s)) {
            if (!s.emails.find((e) => e.step === 'release' && e.box === 'in')) { OPS.emailPush(s, 'in', { from: sc.client.email, to: OPS.company.email, step: 'release', read: false, subject: L('Payment ' + s.documents.bl.hblNo + ' + urgent release', 'دفعة ' + s.documents.bl.hblNo + ' + إفراج عاجل'), body: L(`Hello,\n\nWe transferred USD ${TS.num(s.quotation.totals.grand)} for your invoice. The supplier received the balance and surrendered the originals in Shanghai.\nWe need the goods urgently: please release the D/O today — we will bring the container deposit cheque next week.\n\n${sc.client.contact}`, `مرحبًا،\n\nحوّلنا ${TS.num(s.quotation.totals.grand)} دولار لفاتورتكم. استلم المورّد الرصيد وسلّم الأصول في شنغهاي.\nنحتاج البضاعة بشكل عاجل: يرجى الإفراج عن إذن التسليم اليوم — سنحضر شيك التأمين الأسبوع المقبل.\n\n${sc.client.contact}`) }); ctx.save(); }
            ui().choice(ctx, b, {
              key: 'credit', q: L('Read the client’s email. What do you do?', 'اقرأ بريد الزبون. ماذا تفعل؟'),
              options: [
                { l: L('Confirm receipt of payment, check the telex release from Shanghai, and explain that the line will only issue the D/O once the deposit (or a bank guarantee) is lodged — ask for it today.', 'أكّد استلام الدفعة، تحقّق من التلكس ريليز من شنغهاي، واشرح أن الخط لن يصدر إذن التسليم إلا بعد التأمين (أو كفالة مصرفية) — واطلبه اليوم.'), ok: true },
                { l: L('Pay the deposit from our company account without approval to keep the client happy.', 'ادفع التأمين من حساب الشركة بدون موافقة لإرضاء الزبون.'), ok: false, fb: L('That is giving credit — only management can approve it.', 'هذا منح ائتمان — فقط الإدارة توافق عليه.') },
                { l: L('Release anyway, it is a good client.', 'أفرج على أي حال، زبون جيد.'), ok: false, fb: L('The line will not release without the deposit, and you lose your leverage.', 'الخط لن يفرج بدون التأمين، وتخسر ورقتك.') },
              ],
              onSuccess: () => { s.release.clientPaid = s.quotation.totals.grand; s.release.clientPaidOn = s.sim.today; s.release.telexReleaseHBL = true; s.release.depositLodged = sc.deposit; ctx.send({ to: sc.client.email, subject: L('RE: Payment ' + s.documents.bl.hblNo, 'رد: دفعة ' + s.documents.bl.hblNo), body: L('Payment received, thank you. Telex release confirmed. The line requires the container deposit (USD ' + TS.num(sc.deposit, 0) + ') or a bank guarantee before issuing the D/O — please send it today and we release immediately.', 'تم استلام الدفعة، شكرًا. تم تأكيد التلكس ريليز. الخط يطلب تأمين الحاوية (' + TS.num(sc.deposit, 0) + ' دولار) أو كفالة مصرفية قبل إذن التسليم — يرجى إرساله اليوم ونفرج فورًا.') }); ctx.finish('pay'); },
            });
          } else {
            ui().form(ctx, b, {
              key: 'shpay', intro: L('Before you hand the original HBLs to your client, your freight invoice must be paid (prepaid B/L).', 'قبل تسليم أصول HBL لزبونك، يجب دفع فاتورة الشحن (بوليصة مسبقة الدفع).'),
              fields: [{ k: 'amt', label: L('Amount the shipper must pay us (incl. VAT)', 'المبلغ الذي يجب أن يدفعه الشاحن لنا (مع الضريبة)'), unit: 'USD', type: 'number', tol: 1, ans: () => s.quotation.totals.grand }],
              onSuccess: (v) => { s.release.clientPaid = v.amt; s.release.clientPaidOn = s.sim.today; s.release.oblHandedToShipper = s.sim.today; ctx.finish('pay'); },
            });
          }
        },
      },
      {
        id: 'do',
        title: (sh) => (imp(sh) ? L('Get the delivery order from the line', 'احصل على إذن التسليم من الخط') : L('Destination release sequence', 'تسلسل الإفراج في الوجهة')),
        render(ctx, b) {
          const s = ctx.ship;
          if (imp(s)) {
            const q = s.quotation;
            const lineBuy = TS.round2(q.lines.filter((l) => l.vendor === 'carrier').reduce((a, l) => a + Number(l.buy), 0));
            ui().form(ctx, b, {
              key: 'do', intro: L('At the line’s agent in Beirut you pay the collect freight, surcharges, DTHC and D/O fee (your buy lines to the carrier), and lodge the client’s deposit.', 'لدى وكيل الخط في بيروت تدفع الشحن والرسوم الإضافية وTHC ورسم إذن التسليم (بنود الكلفة للخط)، وتودع تأمين الزبون.'),
              fields: [
                { k: 'paid', label: L('Amount paid to the line (your cost)', 'المبلغ المدفوع للخط (كلفتك)'), unit: 'USD', type: 'number', tol: 1, ans: () => lineBuy },
                { k: 'dep', label: L('Deposit lodged (client’s money)', 'التأمين المودَع (مال الزبون)'), unit: 'USD', type: 'number', ans: () => ctx.sc.deposit },
                { k: 'rel', label: L('MBL release basis', 'أساس إفراج MBL'), type: 'select', options: [{ v: 'seaway', l: 'Seaway bill' }, { v: 'obl', l: L('Original MBL surrendered', 'تسليم أصل MBL') }], ans: () => 'seaway' },
              ],
              submit: L('Pay & request D/O', 'ادفع واطلب إذن التسليم'),
              onSuccess: (v) => {
                s.release.paidToLine = v.paid; s.release.deposit = v.dep;
                s.release.doNo = 'DO-' + s.booking.carrier + '-' + (OPS.seed(s) % 90000 + 10000);
                s.release.doDate = TS.addDays(s.booking.revisedEta, 1);
                ctx.advance(s.release.doDate);
                ctx.receive({ from: OPS.carriers[s.booking.carrier].email, subject: L('Delivery order ' + s.release.doNo, 'إذن التسليم ' + s.release.doNo), body: L(`Delivery order ${s.release.doNo} issued for ${s.equipment.containerNo}, valid to ${TS.fmtDate(TS.addDays(s.release.doDate, 10))}. Deposit USD ${TS.num(v.dep, 0)} received. Empty return to ${ctx.sc.depot}.`, `صدر إذن التسليم ${s.release.doNo} للحاوية ${s.equipment.containerNo}، صالح حتى ${TS.fmtDate(TS.addDays(s.release.doDate, 10))}. تم استلام التأمين ${TS.num(v.dep, 0)} دولار. إرجاع الفارغ إلى ${ctx.sc.depot}.`), attachments: ['DO_' + s.release.doNo + '.pdf'] });
                ctx.milestone('DO', s.release.doDate, 'D/O issued ' + s.release.doNo);
                ctx.finish('do');
              },
            });
          } else {
            const steps = [L('Buyer pays its bank (CAD)', 'يدفع المشتري لمصرفه (مستندات)'), L('Bank hands the original HBLs to the buyer', 'يسلّم المصرف أصول HBL للمشتري'), L('Buyer surrenders one original HBL to Elbe Forwarding', 'يسلّم المشتري أصل HBL واحد إلى Elbe Forwarding'), L('Elbe collects destination charges and issues the D/O', 'تحصّل Elbe رسوم الوجهة وتصدر إذن التسليم'), L('Import clearance in Hamburg and delivery', 'التخليص الوارد في هامبورغ والتسليم')];
            const order = [3, 0, 4, 1, 2];
            ctx.data.seq = ctx.data.seq || ['', '', '', '', ''];
            b.innerHTML = `<p>${t(L('Put the steps in the right order (1 = first).', 'رتّب الخطوات بالترتيب الصحيح (1 = الأول).'))}</p>${order.map((i, pos) => `<div class="row" style="margin-bottom:6px"><select data-p="${pos}" style="width:80px"><option value="">—</option>${[1, 2, 3, 4, 5].map((n) => `<option ${String(ctx.data.seq[pos]) === String(n) ? 'selected' : ''}>${n}</option>`).join('')}</select><span>${t(steps[i])}</span></div>`).join('')}<div class="row"><button class="btn primary" id="chk">${t(L('Check', 'تحقّق'))}</button><button class="btn ghost" id="ans">${t(L('Show me the answer', 'أرني الجواب'))}</button></div>`;
            b.querySelectorAll('[data-p]').forEach((sel) => (sel.onchange = () => { ctx.data.seq[Number(sel.dataset.p)] = sel.value; ctx.save(); }));
            b.querySelector('#ans').onclick = () => { ctx.hint(); ctx.data.seq = order.map((i) => i + 1); ctx.save(); ctx.rerender(); };
            b.querySelector('#chk').onclick = () => {
              const ok = order.every((i, pos) => Number(ctx.data.seq[pos]) === i + 1);
              if (!ok) { ctx.mistake(); TS.toast(t(L('Not the right order', 'الترتيب غير صحيح')), 'bad'); return; }
              ctx.advance(TS.addDays(s.booking.revisedEta, 1));
              s.release.destination = { by: 'Elbe Forwarding', doDate: TS.addDays(s.booking.revisedEta, 2) };
              ctx.finish('do');
            };
          }
        },
      },
      {
        id: 'customs',
        title: (sh) => (imp(sh) ? L('Hand the file to the Customs department', 'سلّم الملف إلى قسم الجمارك') : L('Preferential origin for the buyer', 'المنشأ التفضيلي للمشتري')),
        render(ctx, b) {
          const s = ctx.ship, sc = ctx.sc;
          if (imp(s)) {
            if (ctx.data.waiting) { b.innerHTML = `<p class="muted">⏳ ${t(L('File handed to Customs — waiting for the clearance result…', 'سُلّم الملف للجمارك — بانتظار نتيجة التخليص…'))}</p>`; return; }
            const q = s.quotation;
            const freight = TS.round2(q.lines.filter((l) => l.group === 'freight').reduce((a, l) => a + Number(l.sell), 0));
            const ins = q.insurance ? Number(q.lines.find((l) => l.code === 'INS').sell) : 0;
            ui().form(ctx, b, {
              key: 'cif', intro: L(`Invoice FOB USD ${TS.num(sc.cargo.value, 0)}. Freight to Beirut charged to the client = your freight lines (sell). Insurance = ${q.insurance ? 'the premium you sold' : 'none bought'}.`, `الفاتورة FOB ${TS.num(sc.cargo.value, 0)} دولار. الشحن إلى بيروت المفوتر للزبون = بنود الشحن (البيع). التأمين = ${q.insurance ? 'القسط الذي بعته' : 'لا يوجد'}.`),
              submit: L('Send to Customs department', 'أرسل إلى قسم الجمارك'),
              fields: [
                { k: 'fr', label: L('Freight to Beirut', 'الشحن حتى بيروت'), unit: 'USD', type: 'number', tol: 1, ans: () => freight },
                { k: 'ins', label: L('Insurance', 'التأمين'), unit: 'USD', type: 'number', tol: 1, ans: () => ins },
                { k: 'cif', label: L('CIF value for customs', 'قيمة CIF للجمارك'), unit: 'USD', type: 'number', tol: 1, ans: () => TS.round2(sc.cargo.value + freight + ins), fb: L('CIF = invoice (FOB) + freight + insurance.', 'CIF = الفاتورة (FOB) + الشحن + التأمين.') },
                { k: 'docs', label: L('Documents attached (all needed)', 'المستندات المرفقة (كلها مطلوبة)'), type: 'select', options: [{ v: 'full', l: L('Invoice, packing list, COO, B/L copy + telex release, D/O, importer registration & VAT certificate', 'الفاتورة، قائمة التعبئة، المنشأ، نسخة البوليصة + التلكس، إذن التسليم، سجل المستورد والشهادة الضريبية') }, { v: 'min', l: L('Invoice and B/L only', 'الفاتورة والبوليصة فقط') }], ans: () => 'full' },
              ],
              onSuccess: (v) => {
                const pack = Object.assign(OPS.customsPack(s, 'import'), { customsValueCIF: v.cif, freight: v.fr, insurance: v.ins, doNo: s.release.doNo, documents: ['Commercial invoice', 'Packing list', 'Certificate of origin', 'B/L copy + telex release', 'Delivery order ' + s.release.doNo, 'Importer CR & VAT certificate'], vatRate: 0.11 });
                s.handoffs.customs_import = { department: 'customs', type: 'import_declaration', status: 'submitted', sentSim: s.sim.today, sentAt: new Date().toISOString(), pack };
                ctx.send({ to: OPS.parties.broker.email, subject: L('Import declaration — ' + s.id, 'بيان استيراد — ' + s.id), body: L('Please lodge the import declaration in NAJM. CIF USD ' + TS.num(v.cif) + '. All data is in the shipment JSON (hand-off: customs_import).', 'يرجى تقديم بيان الاستيراد على نظام نجم. CIF ' + TS.num(v.cif) + ' دولار. كل البيانات في ملف JSON (التسليم: customs_import).'), attachments: [s.id + '.json'] });
                ctx.data.waiting = true;
                const rel = TS.addDays(s.booking.revisedEta, 9);
                ctx.receive({ from: OPS.parties.broker.email, subject: L('Customs released — ' + s.id, 'إفراج جمركي — ' + s.id), body: L(`Import declaration IM/${rel.slice(0, 4)}/${OPS.seed(s) % 90000 + 10000} lodged in NAJM on ${TS.fmtDate(TS.addDays(s.booking.revisedEta, 2))}.\nLane: YELLOW (documentary check) — the importer’s registration certificate had to be re-submitted.\nDuties and VAT paid by the importer directly.\nCustoms release: ${TS.fmtDate(rel)}.\n(Simulated — this becomes real work in the Customs department module.)`, `بيان الاستيراد IM/${rel.slice(0, 4)}/${OPS.seed(s) % 90000 + 10000} قُدّم على نظام نجم بتاريخ ${TS.fmtDate(TS.addDays(s.booking.revisedEta, 2))}.\nالمسار: الأصفر (تدقيق مستندات) — اضطر المستورد لإعادة تقديم شهادة التسجيل.\nدفع المستورد الرسوم والضريبة مباشرة.\nالإفراج الجمركي: ${TS.fmtDate(rel)}.\n(محاكاة — ستصبح عملًا حقيقيًا في وحدة قسم الجمارك.)`), onArrive: (sh) => { sh.importCustoms = { declarationNo: 'IM/' + rel.slice(0, 4) + '/' + (OPS.seed(sh) % 90000 + 10000), lane: 'yellow', releasedOn: rel, dutiesPaidBy: 'importer', simulated: true }; sh.handoffs.customs_import.status = 'released (simulated)'; sh.sim.today = rel; const w = sh.work.release; w.data.waiting = false; w.parts.customs = true; sh.milestones.push({ code: 'CUS', date: rel, label: 'Customs released' }); OPS.app.checkStep(sh, OPS.steps.find((x) => x.id === 'release')); } }, 2000);
                ctx.save(); ctx.rerender();
              },
            });
          } else {
            ui().choice(ctx, b, {
              key: 'eur1', q: L('Why did you obtain a EUR.1 for this shipment?', 'لماذا حصلت على EUR.1 لهذه الشحنة؟'),
              options: [
                { l: L('So the German buyer can claim preferential (reduced/zero) duty under the EU–Lebanon Association Agreement', 'ليستفيد المشتري الألماني من الرسوم التفضيلية (المخفّضة/الصفر) بموجب اتفاقية الشراكة'), ok: true },
                { l: L('Because the shipping line requires it to load', 'لأن الخط يطلبه للتحميل'), ok: false },
                { l: L('It replaces the commercial invoice', 'تحلّ مكان الفاتورة التجارية'), ok: false },
              ],
              onSuccess: () => { ctx.advance(TS.addDays(s.booking.revisedEta, 8)); s.release.destinationCustoms = { by: 'Buyer’s broker in Hamburg', clearedOn: TS.addDays(s.booking.revisedEta, 8), preferentialOrigin: 'EUR.1' }; ctx.finish('customs'); },
            });
          }
        },
        summary: (ctx) => { const c = ctx.ship.importCustoms; return c ? `<p>✓ ${t(L('Customs released', 'تم الإفراج الجمركي'))} ${TS.fmtDate(c.releasedOn)} — ${esc(c.declarationNo)} (${esc(c.lane)})</p>` : `<p>✓</p>`; },
      },
    ],
    quiz: [
      { q: L('FOB value 10,000, freight 1,500, insurance 50. CIF value?', 'قيمة FOB 10000، الشحن 1500، التأمين 50. قيمة CIF؟'), o: ['10,000', '11,550', '11,500'], a: 1 },
      { q: L('In Lebanon, which comes first?', 'في لبنان، أيهما يأتي أولًا؟'), o: [L('Customs declaration, then D/O', 'البيان الجمركي ثم إذن التسليم'), L('D/O from the line, then customs declaration', 'إذن التسليم من الخط ثم البيان الجمركي')], a: 1 },
      { q: L('Import VAT in Lebanon is calculated on…', 'ضريبة الاستيراد في لبنان تُحسب على…'), o: [L('FOB value', 'قيمة FOB'), L('CIF + customs duty (+ excise if any)', 'CIF + الرسم الجمركي (+ رسم الاستهلاك إن وجد)'), L('Freight only', 'الشحن فقط')], a: 1 },
    ],
  });

  /* ============================================================ 11. DELIVERY & EMPTY RETURN */
  OPS.steps.push({
    id: 'delivery',
    title: L('Delivery, empty return & demurrage/detention', 'التسليم، إرجاع الفارغ والغرامات'),
    sub: L('Deliver the cargo, get the empty back to the depot and calculate what the delay cost.', 'سلّم البضاعة، أرجع الفارغ إلى المستودع واحسب كلفة التأخير.'),
    lesson: () => t(L(`
<h3>Demurrage vs detention</h3>
<table><tr><th></th><th>Where is the box?</th><th>Charged by</th></tr>
<tr><td><b>Demurrage</b></td><td>Full, still inside the terminal after free time</td><td>Line (per day, per container, in tiers)</td></tr>
<tr><td><b>Detention</b></td><td>Outside the terminal, not yet returned empty</td><td>Line</td></tr>
<tr><td><b>Port storage</b></td><td>Inside the port</td><td>Port / terminal (separate tariff)</td></tr></table>
<p>Many lines give <b>combined</b> free days (DEM + DET together). Usually the day of discharge counts as day 1 and the day of empty return counts too. After free time the rate increases in tiers.</p>
<h3>How to avoid it</h3>
<ul><li>Negotiate free time at booking (14–21 days for slow-clearance destinations).</li><li>Collect customs documents before arrival.</li><li>Plan the truck and the client’s unloading.</li><li>Return the empty to the right depot, with a clean EIR.</li></ul>
<h3>After return</h3>
<p>The depot’s EIR proves the date and condition. The line calculates D&D and deducts it (and any damage/cleaning) from the deposit, then refunds the balance. Rebill D&D to the client as per your quotation conditions.</p>`,
    `
<h3>غرامات التأخير مقابل الاحتجاز</h3>
<table><tr><th></th><th>أين الحاوية؟</th><th>تُفرض من</th></tr>
<tr><td><b>التأخير (Demurrage)</b></td><td>معبّأة داخل المحطة بعد فترة السماح</td><td>الخط (يوميًا، لكل حاوية، بشرائح)</td></tr>
<tr><td><b>الاحتجاز (Detention)</b></td><td>خارج المحطة ولم تُرجع فارغة بعد</td><td>الخط</td></tr>
<tr><td><b>تخزين المرفأ</b></td><td>داخل المرفأ</td><td>المرفأ / المحطة (تعرفة منفصلة)</td></tr></table>
<p>تعطي خطوط كثيرة أيام سماح <b>مجمّعة</b> (تأخير + احتجاز معًا). عادة يوم التفريغ هو اليوم الأول ويوم إرجاع الفارغ يُحتسب أيضًا. بعد فترة السماح يرتفع السعر بشرائح.</p>
<h3>كيف تتجنّبها</h3>
<ul><li>فاوض على فترة السماح عند الحجز (14–21 يومًا للوجهات البطيئة التخليص).</li><li>اجمع مستندات الجمارك قبل الوصول.</li><li>خطّط للشاحنة ولتفريغ الزبون.</li><li>أرجع الفارغ إلى المستودع الصحيح مع EIR نظيف.</li></ul>
<h3>بعد الإرجاع</h3>
<p>يثبت EIR المستودع التاريخ والحالة. يحسب الخط الغرامات ويحسمها (مع أي أضرار/تنظيف) من التأمين ثم يعيد الباقي. أعد فوترة الغرامات للزبون حسب شروط عرضك.</p>`))
      + LB('Lebanese trucking: check the truck and driver are allowed at the port gate, respect axle limits and working hours, and make sure the client is ready to unload (a waiting truck costs money and adds detention days). Empty returns in Beirut go to the depot named on the D/O — returning to the wrong depot means re-handling and extra days.', 'النقل البري في لبنان: تأكّد أن الشاحنة والسائق مسموح لهما بدخول بوابة المرفأ، احترم حدود المحاور وساعات العمل، وتأكّد أن الزبون جاهز للتفريغ (انتظار الشاحنة يكلّف ويضيف أيام احتجاز). يُرجع الفارغ في بيروت إلى المستودع المذكور في إذن التسليم — الإرجاع لمستودع خاطئ يعني مناولة إضافية وأيامًا زائدة.'),
    parts: [
      {
        id: 'truck',
        title: (sh) => (imp(sh) ? L('Trucking order for delivery', 'أمر النقل للتسليم') : L('Origin detention check', 'التحقّق من الاحتجاز في المنشأ')),
        render(ctx, b) {
          const s = ctx.ship, sc = ctx.sc;
          if (imp(s)) {
            const rel = s.importCustoms.releasedOn;
            ui().form(ctx, b, {
              key: 'truck', submit: L('Send trucking order', 'أرسل أمر النقل'),
              intro: L('Customs released on ' + TS.fmtDate(rel) + '. Book the delivery with Al Amal Transport.', 'تم الإفراج الجمركي بتاريخ ' + TS.fmtDate(rel) + '. احجز التسليم مع شركة الأمل للنقل.'),
              fields: [
                { k: 'cn', label: L('Container no.', 'رقم الحاوية'), ans: () => s.equipment.containerNo },
                { k: 'do', label: L('D/O no.', 'رقم إذن التسليم'), ans: () => s.release.doNo },
                { k: 'from', label: L('Pickup', 'الاستلام'), ro: true, value: () => 'Beirut Container Terminal' },
                { k: 'to', label: L('Delivery address', 'عنوان التسليم'), contains: ['Choueifat'], ans: () => sc.client.address, full: true },
                { k: 'date', label: L('Delivery date', 'تاريخ التسليم'), type: 'date', ans: () => TS.addDays(rel, 1), check: (v) => (v < rel ? L('Before customs release — the terminal will not let it out.', 'قبل الإفراج الجمركي — لن تخرجها المحطة.') : v > TS.addDays(rel, 2) ? L('Why wait? Every day adds detention.', 'لماذا الانتظار؟ كل يوم يضيف احتجازًا.') : true) },
                { k: 'depot', label: L('Empty return depot', 'مستودع إرجاع الفارغ'), type: 'select', options: [{ v: sc.depot, l: sc.depot }, { v: 'Tripoli port depot', l: 'Tripoli port depot' }, { v: 'Client’s yard', l: L('Keep at client’s yard', 'يبقى في ساحة الزبون') }], ans: () => sc.depot },
              ],
              onSuccess: (v) => {
                s.delivery = { truckedBy: OPS.parties.trucker.name, deliveredOn: v.date, emptyReturnedOn: TS.addDays(v.date, 2), depot: v.depot, dischargeDate: s.booking.revisedEta };
                ctx.send({ to: OPS.parties.trucker.email, subject: L('Trucking order ' + s.equipment.containerNo, 'أمر نقل ' + s.equipment.containerNo), body: L(`Please collect ${v.cn} (D/O ${v.do}) at Beirut Container Terminal on ${TS.fmtDate(v.date)}, deliver to ${v.to}, and return the empty to ${v.depot} immediately after unloading. Send us the EIR.`, `يرجى استلام ${v.cn} (إذن ${v.do}) من محطة حاويات بيروت بتاريخ ${TS.fmtDate(v.date)}، والتسليم إلى ${v.to}، وإرجاع الفارغ إلى ${v.depot} فور التفريغ. أرسلوا لنا EIR.`) });
                ctx.receive({ from: OPS.parties.trucker.email, subject: L('Delivered & empty returned — ' + v.cn, 'تم التسليم وإرجاع الفارغ — ' + v.cn), body: L(`Delivered ${TS.fmtDate(v.date)}. The client unloaded over 2 days. Empty returned to ${v.depot} on ${TS.fmtDate(s.delivery.emptyReturnedOn)}. EIR: sound, clean. POD signed by ${sc.client.contact}.`, `تم التسليم ${TS.fmtDate(v.date)}. فرّغ الزبون خلال يومين. أُرجع الفارغ إلى ${v.depot} بتاريخ ${TS.fmtDate(s.delivery.emptyReturnedOn)}. EIR: سليمة ونظيفة. وقّع ${sc.client.contact} على إثبات التسليم.`), attachments: ['EIR.pdf', 'POD.pdf'] }, 800);
                ctx.advance(s.delivery.emptyReturnedOn);
                ctx.milestone('DLV', v.date, 'Delivered to client'); ctx.milestone('MTY', s.delivery.emptyReturnedOn, 'Empty returned to depot');
                ctx.finish('truck');
              },
            });
          } else {
            const pick = TS.addDays(s.equipment.stuffedOn, -1), gate = s.equipment.gateIn;
            ui().form(ctx, b, {
              key: 'odet', intro: L(`Empty picked up at Beirut depot ${TS.fmtDate(pick)}, full gate-in ${TS.fmtDate(gate)}. Origin free time: 7 days (both days count).`, `سُحب الفارغ من مستودع بيروت ${TS.fmtDate(pick)}، ودخلت معبّأة ${TS.fmtDate(gate)}. فترة السماح في المنشأ: 7 أيام (يُحتسب اليومان).`),
              fields: [
                { k: 'days', label: L('Days outside the terminal', 'أيام خارج المحطة'), type: 'number', ans: () => TS.diffDays(pick, gate) + 1 },
                { k: 'ch', label: L('Chargeable detention days', 'أيام الاحتجاز المستحقة'), type: 'number', ans: () => Math.max(0, TS.diffDays(pick, gate) + 1 - 7) },
              ],
              onSuccess: (v) => { s.dd.origin = { pickup: pick, gateIn: gate, days: v.days, chargeable: v.ch, cost: 0 }; ctx.finish('truck'); },
            });
          }
        },
      },
      {
        id: 'dd',
        title: L('Calculate demurrage & detention', 'احسب غرامات التأخير والاحتجاز'),
        render(ctx, b) {
          const s = ctx.ship, sc = ctx.sc, bk = s.booking;
          const dis = bk.revisedEta;
          const ret = imp(s) ? s.delivery.emptyReturnedOn : TS.addDays(dis, 11);
          if (!imp(s)) s.delivery = Object.assign(s.delivery || {}, { dischargeDate: dis, emptyReturnedOn: ret, deliveredOn: TS.addDays(dis, 9), by: 'Elbe Forwarding / buyer' });
          const days = TS.diffDays(dis, ret) + 1, ch = Math.max(0, days - bk.freeDays), cost = OPS.ddCost(ch, sc.ddTariff);
          const tiers = sc.ddTariff.tiers;
          ui().form(ctx, b, {
            key: 'dd',
            intro: L(`Discharged ${TS.fmtDate(dis)} · empty returned ${TS.fmtDate(ret)} · free days ${bk.freeDays} (combined) · tariff ${sc.ddTariff.unit}: USD ${tiers[0].rate}/day for days 1–7 after free time, then USD ${tiers[1].rate}/day. Both the discharge day and the return day count.`, `التفريغ ${TS.fmtDate(dis)} · إرجاع الفارغ ${TS.fmtDate(ret)} · أيام السماح ${bk.freeDays} (مجمّعة) · التعرفة ${sc.ddTariff.unit}: ${tiers[0].rate} دولار/يوم للأيام 1–7 بعد السماح، ثم ${tiers[1].rate} دولار/يوم. يُحتسب يوم التفريغ ويوم الإرجاع.`),
            fields: [
              { k: 'days', label: L('Total days used', 'مجموع الأيام'), type: 'number', ans: () => days },
              { k: 'ch', label: L('Chargeable days', 'الأيام المستحقة'), type: 'number', ans: () => ch },
              { k: 'cost', label: L('D&D amount', 'قيمة الغرامات'), unit: 'USD', type: 'number', ans: () => cost },
              { k: 'who', label: L('Who finally bears it?', 'من يتحمّلها في النهاية؟'), type: 'select', options: [{ v: 'client', l: L('Our client (rebilled per quotation)', 'زبوننا (يُعاد فوترتها حسب العرض)') }, { v: 'consignee', l: L('The consignee/buyer at destination', 'المرسل إليه/المشتري في الوجهة') }, { v: 'us', l: L('Our company', 'شركتنا') }], ans: () => (imp(s) ? 'client' : 'consignee') },
            ],
            onSuccess: (v) => { s.dd.destination = { discharge: dis, emptyReturn: ret, freeDays: bk.freeDays, days, chargeable: ch, cost, borneBy: v.who }; ctx.finish('dd'); },
          });
        },
        summary: (ctx) => { const d = ctx.ship.dd.destination; return `<p>✓ ${d.days} ${t(L('days used', 'يوم'))}, ${d.chargeable} ${t(L('chargeable', 'مستحق'))} → <b>USD ${TS.num(d.cost)}</b> (${esc(d.borneBy)})</p>`; },
      },
      {
        id: 'deposit',
        title: (sh) => (imp(sh) ? L('EIR & deposit refund', 'EIR واسترداد التأمين') : L('Proof of completion', 'إثبات الإنجاز')),
        render(ctx, b) {
          const s = ctx.ship, sc = ctx.sc;
          if (imp(s)) {
            ui().form(ctx, b, {
              key: 'dep', intro: L('The EIR shows the box returned sound and clean. The line deducts D&D from the deposit.', 'يُظهر EIR أن الحاوية أُرجعت سليمة ونظيفة. يحسم الخط الغرامات من التأمين.'),
              fields: [{ k: 'ref', label: L('Deposit refund to the client', 'التأمين المسترد للزبون'), unit: 'USD', type: 'number', ans: () => sc.deposit - s.dd.destination.cost }],
              onSuccess: (v) => { s.dd.depositRefund = v.ref; s.dd.ddPaidFromDeposit = true; ctx.finish('deposit'); },
            });
          } else {
            ui().choice(ctx, b, {
              key: 'poc', multi: true, q: L('What do you need on file before closing an FCL job?', 'ماذا تحتاج في الملف قبل إقفال عملية FCL؟'),
              options: [
                { l: L('Confirmation the cargo was delivered/released (POD)', 'تأكيد تسليم/الإفراج عن البضاعة (POD)'), ok: true },
                { l: L('Empty return confirmation / EIR from destination', 'تأكيد إرجاع الفارغ / EIR من الوجهة'), ok: true },
                { l: L('All supplier invoices received (line, trucker, broker, chamber)', 'استلام كل فواتير المورّدين (الخط، النقل، المخلّص، الغرفة)'), ok: true },
                { l: L('The consignee’s bank statement', 'كشف حساب المرسل إليه'), ok: false },
              ],
              onSuccess: () => { ctx.advance(s.delivery.emptyReturnedOn); ctx.milestone('MTY', s.delivery.emptyReturnedOn, 'Empty returned (destination)'); ctx.finish('deposit'); },
            });
          }
        },
      },
    ],
    quiz: [
      { q: L('Discharge on the 1st, empty returned on the 14th, 10 free days (both days count). Chargeable days?', 'التفريغ في 1، إرجاع الفارغ في 14، 10 أيام سماح (يُحتسب اليومان). كم يومًا مستحقًا؟'), o: ['3', '4', '14'], a: 1, e: L('14 days used − 10 free = 4.', '14 يومًا − 10 سماح = 4.') },
      { q: L('Container is outside the terminal at the client’s warehouse after free time. That is…', 'الحاوية خارج المحطة في مستودع الزبون بعد فترة السماح. هذا…'), o: [L('Demurrage', 'تأخير'), L('Detention', 'احتجاز'), L('Port storage', 'تخزين المرفأ')], a: 1 },
      { q: L('When is the best moment to negotiate free time?', 'ما أفضل وقت للتفاوض على فترة السماح؟'), o: [L('At booking', 'عند الحجز'), L('After arrival', 'بعد الوصول'), L('When the invoice comes', 'عند وصول الفاتورة')], a: 0 },
    ],
  });

  /* ============================================================ 12. CLOSING & ACCOUNTING */
  OPS.jobCosting = (s) => {
    const q = s.quotation, act = q.lines.filter((l) => l.group !== 'optional' || q.insurance);
    const rev = act.map((l) => ({ code: l.code, desc: l.desc.en || l.desc, amount: Number(l.sell), vat: l.vat }));
    const cost = act.filter((l) => Number(l.buy) > 0).map((l) => ({ code: l.code, desc: l.desc.en || l.desc, vendor: l.vendor, amount: Number(l.buy) }));
    const dd = s.dd.destination;
    if (imp(s) && dd && dd.cost > 0) {
      rev.push({ code: 'DD', desc: 'Demurrage/detention rebilled (' + dd.chargeable + ' days)', amount: dd.cost, vat: true });
      cost.push({ code: 'DD', desc: 'Demurrage/detention (deducted from deposit)', vendor: 'carrier', amount: dd.cost });
    }
    const R = TS.round2(rev.reduce((a, x) => a + x.amount, 0)), C = TS.round2(cost.reduce((a, x) => a + x.amount, 0));
    const vatBase = TS.round2(rev.filter((x) => x.vat).reduce((a, x) => a + x.amount, 0));
    return { rev, cost, revenue: R, costTotal: C, profit: TS.round2(R - C), margin: R ? ((R - C) / R) * 100 : 0, vatBase, vat: TS.round2(vatBase * 0.11) };
  };

  OPS.steps.push({
    id: 'closing',
    title: L('Job costing, file closing & hand-off to Accounting', 'كلفة العملية، إقفال الملف والتسليم للمحاسبة'),
    sub: L('Check the real profit, prepare the invoice data with VAT and pass the shipment file to Accounting.', 'تحقّق من الربح الفعلي، حضّر بيانات الفاتورة مع الضريبة وسلّم ملف الشحنة للمحاسبة.'),
    lesson: () => t(L(`
<h3>Job costing</h3>
<p>Every job is a small profit & loss account: <b>revenue</b> (what you invoice the client) − <b>costs</b> (line, trucker, broker, chamber, insurer…) = <b>job profit</b>. Compare it with the quoted profit: extra costs (D&D, waiting time, amendments) that were not rebilled eat the margin.</p>
<h3>Pass-through items</h3>
<p>Container deposits, duties and import VAT paid on behalf of the client are <b>disbursements</b>: they are recorded separately and are not revenue.</p>
<h3>Invoicing in Lebanon</h3>
<ul><li>Tax invoice with your VAT number and the client’s details.</li><li>VAT 11% on local services; international freight exempt/zero-rated (confirm with accounting).</li><li>Amounts usually in USD, with the LBP equivalent of VAT shown as required by the Ministry of Finance (the rate used must be the official one at invoice date).</li></ul>
<h3>Closing the file</h3>
<p>POD and EIR on file, all supplier invoices received and matched, deposit refunded, client invoiced and the job profit checked. Then hand the file to Accounting — here, through the same shipment JSON.</p>`,
    `
<h3>كلفة العملية</h3>
<p>كل عملية حساب أرباح وخسائر صغير: <b>الإيراد</b> (ما تفوتره للزبون) − <b>الكلفة</b> (الخط، النقل، المخلّص، الغرفة، شركة التأمين…) = <b>ربح العملية</b>. قارنه بالربح المقدّر في العرض: الكلف الإضافية (غرامات، انتظار، تعديلات) غير المعاد فوترتها تأكل الهامش.</p>
<h3>البنود المارّة</h3>
<p>تأمينات الحاويات والرسوم وضريبة الاستيراد المدفوعة نيابة عن الزبون هي <b>سُلف</b>: تُسجَّل منفصلة وليست إيرادًا.</p>
<h3>الفوترة في لبنان</h3>
<ul><li>فاتورة ضريبية مع رقمك الضريبي وبيانات الزبون.</li><li>ضريبة 11% على الخدمات المحلية؛ الشحن الدولي معفى/بنسبة صفر (تأكّد مع المحاسبة).</li><li>المبالغ عادة بالدولار، مع إظهار ما يعادل الضريبة بالليرة كما تطلب وزارة المالية (بالسعر الرسمي بتاريخ الفاتورة).</li></ul>
<h3>إقفال الملف</h3>
<p>إثبات التسليم وEIR في الملف، كل فواتير المورّدين مستلمة ومطابقة، التأمين مسترد، الزبون مفوتر والربح مُراجع. ثم سلّم الملف للمحاسبة — هنا عبر ملف JSON نفسه.</p>`)),
    parts: [
      {
        id: 'cost',
        title: L('Job costing (actual)', 'كلفة العملية (الفعلية)'),
        render(ctx, b) {
          const s = ctx.ship, jc = OPS.jobCosting(s);
          const tbl = ui().table([L('Revenue line', 'بند الإيراد'), { l: 'USD', num: 1 }], jc.rev.map((x) => `<tr><td>${esc(x.code)} — ${esc(x.desc)}</td><td class="num">${TS.num(x.amount)}</td></tr>`)) + ui().table([L('Cost line', 'بند الكلفة'), L('Vendor', 'المورّد'), { l: 'USD', num: 1 }], jc.cost.map((x) => `<tr><td>${esc(x.code)} — ${esc(x.desc)}</td><td>${esc(x.vendor)}</td><td class="num">${TS.num(x.amount)}</td></tr>`));
          const wrap = document.createElement('div'); wrap.innerHTML = tbl; b.appendChild(wrap);
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
          const s = ctx.ship, jc = s.closing.jobCosting;
          const rate = 89500;
          ui().form(ctx, b, {
            key: 'vat', intro: L(`Use the sample official rate LBP ${TS.num(rate, 0)} per USD (training value — always use the official rate on the invoice date).`, `استعمل السعر الرسمي المثال ${TS.num(rate, 0)} ليرة للدولار (قيمة تدريبية — استعمل دائمًا السعر الرسمي بتاريخ الفاتورة).`),
            fields: [
              { k: 'base', label: L('VAT base (vatable lines)', 'أساس الضريبة (البنود الخاضعة)'), unit: 'USD', type: 'number', tol: 1, ans: () => jc.vatBase },
              { k: 'vat', label: 'VAT 11%', unit: 'USD', type: 'number', tol: 0.5, ans: () => jc.vat },
              { k: 'lbp', label: L('VAT in LBP', 'الضريبة بالليرة'), unit: 'LBP', type: 'number', tol: rate, ans: () => Math.round(jc.vat * rate) },
              { k: 'tot', label: L('Invoice total incl. VAT', 'مجموع الفاتورة مع الضريبة'), unit: 'USD', type: 'number', tol: 1, ans: () => TS.round2(jc.revenue + jc.vat) },
            ],
            onSuccess: (v) => { s.closing.invoice = { no: 'INV-' + s.id, date: s.sim.today, customer: s.parties.client, lines: jc.rev, vatBase: v.base, vatRate: 0.11, vat: v.vat, lbpRate: rate, vatLBP: v.lbp, total: v.tot, currency: 'USD' }; ctx.finish('vat'); },
          });
        },
      },
      {
        id: 'check',
        title: L('Closing checklist', 'قائمة الإقفال'),
        render(ctx, b) {
          const s = ctx.ship;
          ui().choice(ctx, b, {
            key: 'close', multi: true, q: L('Tick what must be true before you close the file.', 'اختر ما يجب أن يكون صحيحًا قبل إقفال الملف.'),
            options: [
              { l: L('POD and EIR saved in the file', 'إثبات التسليم وEIR محفوظان في الملف'), ok: true },
              { l: L('All supplier invoices received and matched with the costing', 'كل فواتير المورّدين مستلمة ومطابقة مع الكلفة'), ok: true },
              { l: imp(s) ? L('Deposit refund confirmed to the client', 'تأكيد استرداد التأمين للزبون') : L('Freight invoice paid by the shipper', 'فاتورة الشحن مدفوعة من الشاحن'), ok: true },
              { l: L('Client invoice issued', 'إصدار فاتورة الزبون'), ok: true },
              { l: L('Delete the emails to save space', 'حذف الرسائل لتوفير المساحة'), ok: false, fb: L('Keep all records — commercial and tax records must be kept for years.', 'احتفظ بكل السجلات — يجب حفظ السجلات التجارية والضريبية لسنوات.') },
            ],
            onSuccess: () => ctx.finish('check'),
          });
        },
      },
      {
        id: 'handoff',
        title: L('Hand the shipment file to Accounting', 'سلّم ملف الشحنة إلى المحاسبة'),
        render(ctx, b) {
          const s = ctx.ship;
          b.innerHTML = `<p>${t(L('This creates the accounting hand-off inside the shipment JSON (invoice, costs, disbursements, profit). The Accounting department page reads it from this browser, or you can send the JSON file.', 'هذا ينشئ تسليم المحاسبة داخل ملف JSON للشحنة (الفاتورة، الكلف، السلف، الربح). تقرأه صفحة قسم المحاسبة من هذا المتصفح، أو يمكنك إرسال ملف JSON.'))}</p><button class="btn primary" id="go">${t(L('Send to Accounting & close file', 'أرسل إلى المحاسبة وأقفل الملف'))} →</button>`;
          b.querySelector('#go').onclick = () => {
            const jc = s.closing.jobCosting;
            s.handoffs.accounting = {
              department: 'accounting', type: 'job_closing', status: 'submitted', sentSim: s.sim.today, sentAt: new Date().toISOString(),
              pack: {
                shipmentId: s.id, customer: s.parties.client, invoice: s.closing.invoice,
                payables: jc.cost, receivables: [{ doc: s.closing.invoice.no, amount: s.closing.invoice.total, paidAmount: s.release.clientPaid || 0 }],
                disbursements: imp(s) ? [{ type: 'container_deposit', to: s.booking.carrierName, amount: OPS.sc(s).deposit, refunded: s.dd.depositRefund, deducted: s.dd.destination.cost }] : [],
                jobProfit: jc.profit, marginPct: TS.round2(jc.margin), quotedProfit: s.quotation.totals.profit,
              },
            };
            s.status = 'closed'; s.currentDepartment = 'accounting';
            ctx.send({ to: 'accounting@phoenicia-freight.test', subject: L('Job closed — ' + s.id, 'إقفال عملية — ' + s.id), body: L('Job file closed and handed to Accounting (hand-off: accounting).', 'أُقفل ملف العملية وسُلّم للمحاسبة (التسليم: accounting).'), attachments: [s.id + '.json'] });
            ctx.milestone('CLS', s.sim.today, 'File closed & handed to Accounting');
            ctx.finish('handoff');
          };
        },
        summary: (ctx) => {
          const s = ctx.ship, score = Math.max(0, 100 - s.score.mistakes * 2 - s.score.hints * 3);
          return `<div class="note ok"><strong>🎓 ${t(L('Shipment completed!', 'اكتملت الشحنة!'))}</strong>${t(L('Mistakes', 'الأخطاء'))}: ${s.score.mistakes} · ${t(L('Answers shown', 'إجابات معروضة'))}: ${s.score.hints} · <b>${t(L('Score', 'النتيجة'))}: ${score}/100</b></div>
            <div class="row"><button class="btn primary" onclick="TS.downloadJSON(OPS.app.ship)">⬇ ${esc(s.id)}.json</button><a class="btn" href="../accounting_department/index.html">${t(L('Open Accounting department', 'افتح قسم المحاسبة'))} →</a><a class="btn" href="../customs_department/index.html">${t(L('Open Customs department', 'افتح قسم الجمارك'))} →</a></div>`;
        },
      },
    ],
    quiz: [
      { q: L('Quoted profit 500. D&D of 90 was paid to the line and not rebilled. Real profit?', 'الربح المقدّر 500. دُفعت غرامات 90 للخط ولم تُعَد فوترتها. الربح الفعلي؟'), o: ['500', '410', '590'], a: 1 },
      { q: L('The container deposit refunded to the client is…', 'تأمين الحاوية المسترد للزبون هو…'), o: [L('Revenue', 'إيراد'), L('A disbursement / pass-through', 'سلفة / بند مارّ'), L('A cost', 'كلفة')], a: 1 },
      { q: L('VAT base 1,000 USD. VAT at 11%?', 'أساس الضريبة 1000 دولار. الضريبة 11%؟'), o: ['11', '110', '1,110'], a: 1 },
    ],
  });
})();
