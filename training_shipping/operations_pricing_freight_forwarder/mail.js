/* Operations — Mail v2: folders, threads, avatars, search, attachments that open the document,
 * and "mail tasks": clients, agents, lines, truckers and the broker write to you during the shipment.
 * Each task needs a reply (choose / edit the best answer). Tasks differ per client (persona, mode, direction). */
(function () {
  const L = TS.L, t = TS.t, esc = TS.esc, R2 = TS.round2;
  const OPS = window.OPS;
  const M = (OPS.mail = {});
  const app = () => OPS.app;
  const imp = (s) => s.direction === 'import';
  const lclS = (s) => OPS.sc(s).mode === 'LCL';

  /* ---------------- task catalogue ----------------
   * each entry: { k, after: stepId, when(s, sc), make(s, sc) -> { from, subject, body, options:[{l, ok, fb}], thanks } } */
  const CAT = [
    { k: 'eta', after: 'booking', who: 'client', when: () => true,
      make: (s, sc) => { const b = s.booking; return {
        from: sc.client.email, subject: L('When will our goods arrive?', 'متى تصل بضاعتنا؟'),
        body: L(`Hello,\n\n${sc.tone === 'urgent' ? 'Our customer keeps calling us! ' : ''}Can you tell us exactly when the goods will ${imp(s) ? 'arrive in Beirut' : 'reach ' + sc.far.city}? Can you guarantee the date?\n\n${sc.client.contact}`, `مرحبًا،\n\n${sc.tone === 'urgent' ? 'زبوننا يتصل بنا باستمرار! ' : ''}هل يمكنكم إخبارنا بالضبط متى ${imp(s) ? 'تصل البضاعة إلى بيروت' : 'تصل إلى ' + sc.far.city}؟ هل تضمنون التاريخ؟\n\n${sc.client.contact}`),
        options: [
          { l: L(`Booked on ${b.vessel} ${b.voyage}: ETD ${TS.fmtDate(b.etd)}, ETA ${TS.fmtDate(b.eta)} via ${b.ts}. ETAs are estimates from the carrier — we will update you at every milestone.`, `محجوزة على ${b.vessel} ${b.voyage}: المغادرة ${TS.fmtDate(b.etd)}، الوصول ${TS.fmtDate(b.eta)} عبر ${b.ts}. مواعيد الوصول تقديرية من الخط — سنبلغكم عند كل مرحلة.`), ok: true },
          { l: L(`Guaranteed arrival on ${TS.fmtDate(b.eta)}.`, `وصول مضمون في ${TS.fmtDate(b.eta)}.`), ok: false, fb: L('Never guarantee an ETA — transshipment delays happen.', 'لا تضمن موعد الوصول أبدًا — تأخير المسافنة يحدث.') },
          { l: L('We cannot know before the vessel sails.', 'لا يمكننا المعرفة قبل الإبحار.'), ok: false, fb: L('You do know the ETD/ETA from the booking confirmation — share it.', 'أنت تعرف المغادرة/الوصول من تأكيد الحجز — شاركها.') },
        ], thanks: L('Thank you, clear.', 'شكرًا، واضح.') }; } },
    { k: 'docs', after: 'quote', who: 'client', when: (s) => imp(s),
      make: (s, sc) => ({
        from: sc.client.email, subject: L('Which documents should we ask from the supplier?', 'ما المستندات التي نطلبها من المورّد؟'),
        body: L(`Hello,\n\n${sc.tone === 'new' ? 'It is our first import of this kind. ' : ''}What documents must ${sc.shipper.name} send so that we can clear the goods in Beirut?\n\n${sc.client.contact}`, `مرحبًا،\n\n${sc.tone === 'new' ? 'هذا أول استيراد لنا من هذا النوع. ' : ''}ما المستندات التي يجب أن يرسلها ${sc.shipper.name} لنتمكّن من تخليص البضاعة في بيروت؟\n\n${sc.client.contact}`),
        options: [
          { l: L(`Commercial invoice, packing list, certificate of origin and the B/L (copy + release). ${sc.licence ? sc.licence.en + ' ' : ''}Please also prepare your commercial registration and VAT certificate.`, `الفاتورة التجارية، قائمة التعبئة، شهادة المنشأ والبوليصة (نسخة + الإفراج). ${sc.licence ? sc.licence.ar + ' ' : ''}يرجى أيضًا تحضير سجلكم التجاري والشهادة الضريبية.`), ok: true },
          { l: L('Only the commercial invoice is needed.', 'فقط الفاتورة التجارية.'), ok: false, fb: L('Customs needs the packing list and origin proof too.', 'الجمارك تحتاج قائمة التعبئة وإثبات المنشأ أيضًا.') },
          { l: L(`The supplier must send a Lebanese customs declaration from ${sc.far.country}.`, `يجب أن يرسل المورّد بيانًا جمركيًا لبنانيًا من ${sc.far.country}.`), ok: false, fb: L('The Lebanese declaration is lodged in Beirut by the broker.', 'البيان اللبناني يقدّمه المخلّص في بيروت.') },
        ], thanks: L('Perfect, we forward this to the supplier.', 'ممتاز، سنحوّل هذا للمورّد.') }) },
    { k: 'deposit', after: 'tracking', who: 'client', when: (s, sc) => !!sc.deposit,
      make: (s, sc) => ({
        from: sc.client.email, subject: L('Why do we pay a container deposit?', 'لماذا ندفع تأمين حاوية؟'),
        body: L(`Hi,\n\nYour arrival notice asks for USD ${TS.num(sc.deposit, 0)} deposit. Is this your fee? Do we get it back?\n\n${sc.client.contact}`, `مرحبًا،\n\nيطلب إشعار الوصول تأمينًا بقيمة ${TS.num(sc.deposit, 0)} دولار. هل هذه أتعابكم؟ هل نستردّها؟\n\n${sc.client.contact}`),
        options: [
          { l: L(`It is not our fee: the line holds USD ${TS.num(sc.deposit, 0)} as a guarantee for its container. After the empty is returned it is refunded, minus any demurrage/detention or damage. A bank guarantee is also accepted.`, `ليست أتعابنا: يحتفظ الخط بـ ${TS.num(sc.deposit, 0)} دولار ضمانًا لحاويته. بعد إرجاع الفارغ يُسترد، ناقص أي غرامات أو أضرار. تُقبل أيضًا كفالة مصرفية.`), ok: true },
          { l: L('It is our handling fee, non-refundable.', 'إنها أتعاب المعالجة لدينا وغير مستردّة.'), ok: false, fb: L('Wrong and dishonest — the deposit belongs to the client.', 'خطأ وغير صادق — التأمين ملك الزبون.') },
          { l: L('It is the customs duty in advance.', 'إنها الرسوم الجمركية مسبقًا.'), ok: false, fb: L('Duties are paid to Customs, not to the line.', 'الرسوم تُدفع للجمارك لا للخط.') },
        ], thanks: L('Understood, we will bring the cheque.', 'مفهوم، سنحضر الشيك.') }) },
    { k: 'free', after: 'booking', who: 'client', when: (s, sc) => sc.tone !== 'new' || true,
      make: (s, sc) => { const f = s.booking.freeDays, l = lclS(s); return {
        from: sc.client.email, subject: l ? L('How long can the goods stay at the CFS?', 'كم يمكن أن تبقى البضاعة في المحطة؟') : L('How many free days do we have?', 'كم يوم سماح لدينا؟'),
        body: L(`Hello,\n\nHow many days do we have ${l ? 'to collect the cargo' : 'before paying demurrage'}, and from when do they count?\n\n${sc.client.contact}`, `مرحبًا،\n\nكم يومًا لدينا ${l ? 'لاستلام البضاعة' : 'قبل دفع الغرامات'}، ومن متى تُحتسب؟\n\n${sc.client.contact}`),
        options: [
          { l: l ? L(`${f} free storage days at the destination CFS, counted from unstuffing; after that USD ${TS.num(s.rates.selected.storage)} per W/M per day.`, `${f} أيام تخزين مجانية في محطة الوجهة تُحتسب من التفريغ؛ بعدها ${TS.num(s.rates.selected.storage)} دولار لكل W/M يوميًا.`) : L(`${f} days combined demurrage/detention, counted from the discharge day until the empty is returned (both days count).`, `${f} أيام مجمّعة (تأخير/احتجاز) من يوم التفريغ حتى إرجاع الفارغ (يُحتسب اليومان).`), ok: true },
          { l: L(`${f + 7} days from the day the vessel sails.`, `${f + 7} أيام من يوم الإبحار.`), ok: false, fb: L('Free time is counted at destination, not from sailing.', 'فترة السماح تُحتسب في الوجهة لا من الإبحار.') },
          { l: L('Unlimited — you are our client.', 'غير محدود — أنتم زبائننا.'), ok: false, fb: L('Never promise unlimited free time.', 'لا تَعِد أبدًا بسماح غير محدود.') },
        ], thanks: L('Thanks, noted.', 'شكرًا، ملاحظ.') }; } },
    { k: 'breakdown', after: 'quote', who: 'client', when: (s, sc) => ['demanding', 'formal', 'urgent'].includes(sc.tone),
      make: (s, sc) => ({
        from: sc.client.email, subject: L('Explain your handling and documentation fees', 'اشرحوا رسوم المعالجة والمستندات'),
        body: L(`Hello,\n\nWhy do we pay “handling” and “documentation” on top of the freight? ${sc.tone === 'demanding' ? 'Remove them or we will not continue.' : 'Please explain.'}\n\n${sc.client.contact}`, `مرحبًا،\n\nلماذا ندفع «معالجة» و«مستندات» فوق الشحن؟ ${sc.tone === 'demanding' ? 'أزيلوها وإلا لن نكمل.' : 'يرجى التوضيح.'}\n\n${sc.client.contact}`),
        options: [
          { l: L('They pay for our work on your file: booking, coordination with the line and agents, documents and B/L issue, follow-up and customs coordination. They are local services, so VAT 11% applies. We are happy to review the total, but the services are real.', 'هي مقابل عملنا على ملفكم: الحجز، التنسيق مع الخط والوكلاء، المستندات وإصدار البوليصة، المتابعة والتنسيق الجمركي. وهي خدمات محلية فتُطبَّق ضريبة 11%. يسعدنا مراجعة المجموع، لكن الخدمات حقيقية.'), ok: true },
          { l: L('These are charges imposed by the shipping line.', 'هذه رسوم يفرضها الخط الملاحي.'), ok: false, fb: L('Not true — never misrepresent your own fees.', 'غير صحيح — لا تحرّف أبدًا حقيقة رسومك.') },
          { l: L('OK, we remove all our fees.', 'حسنًا، نلغي كل رسومنا.'), ok: false, fb: L('Then you work for free. Negotiate the total, explain the value.', 'إذًا تعمل مجانًا. فاوض على المجموع واشرح القيمة.') },
        ], thanks: L('Understood, thank you.', 'مفهوم، شكرًا.') }) },
    { k: 'insurance', after: 'quote', who: 'client', when: (s, sc) => !sc.services.insurance && (imp(s) || sc.answer.incoterm === 'CFR'),
      make: (s, sc) => ({
        from: sc.client.email, subject: L('Is the cargo insured by the shipping line?', 'هل البضاعة مؤمّنة من الخط؟'),
        body: L(`Hello,\n\nIf something happens at sea, does the shipping line pay the full value of our goods (USD ${TS.num(sc.cargo.value, 0)})?\n\n${sc.client.contact}`, `مرحبًا،\n\nإذا حدث شيء في البحر، هل يدفع الخط القيمة الكاملة لبضاعتنا (${TS.num(sc.cargo.value, 0)} دولار)؟\n\n${sc.client.contact}`),
        options: [
          { l: L('No. The carrier’s liability is limited by the B/L terms (Hague-Visby: about 2 SDR per kg or 666.67 SDR per package) and excludes many events, including general average. We recommend cargo insurance “all risks” for 110% of CIF value — we can quote it.', 'لا. مسؤولية الناقل محدودة بشروط البوليصة (هاغ-فيسبي: نحو 2 وحدة SDR لكل كغ أو 666.67 للطرد) وتستثني أحداثًا كثيرة منها العوارية العامة. ننصح بتأمين «كل المخاطر» بـ110% من قيمة CIF — يمكننا تسعيره.'), ok: true },
          { l: L('Yes, the line covers the full invoice value.', 'نعم، الخط يغطي قيمة الفاتورة كاملة.'), ok: false, fb: L('Carrier liability is limited.', 'مسؤولية الناقل محدودة.') },
          { l: L('Insurance is not possible for sea freight.', 'التأمين غير ممكن للشحن البحري.'), ok: false, fb: L('Marine cargo insurance is standard.', 'التأمين البحري على البضائع أمر عادي.') },
        ], thanks: L('Thanks — please send us an insurance quote.', 'شكرًا — أرسلوا لنا عرض تأمين.') }) },
    { k: 'loading', after: 'booking', who: 'client', when: (s) => !imp(s) && !lclS(s),
      make: (s, sc) => { const b = s.booking, early = TS.addDays(b.cutoffs.erd, -5); return {
        from: sc.client.email, subject: L('Can you send the empty container earlier?', 'هل يمكن إرسال الحاوية الفارغة أبكر؟'),
        body: L(`Hello,\n\nWe would like the empty container at our factory on ${TS.fmtDate(early)} so we can load slowly. OK?\n\n${sc.client.contact}`, `مرحبًا،\n\nنريد الحاوية الفارغة في مصنعنا بتاريخ ${TS.fmtDate(early)} لنحمّل على مهل. موافقون؟\n\n${sc.client.contact}`),
        options: [
          { l: L(`We advise against it: detention runs from the depot gate-out, and the terminal only receives the full box from ${TS.fmtDate(b.cutoffs.erd)} (ERD). Best is to load around ${TS.fmtDate(TS.addDays(b.cutoffs.erd, -1))}; extra days would be charged.`, `لا ننصح بذلك: يبدأ الاحتجاز من خروجها من المستودع، والمحطة لا تستلم المعبّأة قبل ${TS.fmtDate(b.cutoffs.erd)} (ERD). الأفضل التحميل نحو ${TS.fmtDate(TS.addDays(b.cutoffs.erd, -1))}؛ الأيام الإضافية تُفوتر.`), ok: true },
          { l: L('No problem, keep it as long as you want.', 'لا مشكلة، أبقوها قدر ما تريدون.'), ok: false, fb: L('Detention and early-storage costs would surprise the client.', 'كلفة الاحتجاز والتخزين المبكر ستفاجئ الزبون.') },
          { l: L('Impossible, the booking does not allow it.', 'مستحيل، الحجز لا يسمح.'), ok: false, fb: L('It is possible — but costly. Explain the cost, let the client decide.', 'ممكن — لكنه مكلف. اشرح الكلفة ودع الزبون يقرّر.') },
        ], thanks: L('OK, we follow your advice.', 'حسنًا، سنأخذ بنصيحتكم.') }; } },
    { k: 'bank', after: 'sailing', who: 'client', when: (s, sc) => !imp(s) && (sc.payKind === 'cad' || sc.payKind === 'lc'),
      make: (s, sc) => ({
        from: sc.client.email, subject: L('Documents for the bank', 'المستندات للمصرف'),
        body: L(`Hello,\n\nOur bank asks for the original B/Ls${sc.payKind === 'lc' ? ' and says the description must match the L/C' : ''}. When can we collect them?\n\n${sc.client.contact}`, `مرحبًا،\n\nيطلب مصرفنا أصول البوالص${sc.payKind === 'lc' ? ' ويقول إن الوصف يجب أن يطابق الاعتماد' : ''}. متى نستلمها؟\n\n${sc.client.contact}`),
        options: [
          { l: L(`The full set of 3 original HBLs “to order” is ready; we hand it over once our freight invoice is paid. ${sc.payKind === 'lc' ? 'The description and dates follow the L/C — please present within the L/C period.' : 'Present them with the invoice and certificates to your bank.'}`, `المجموعة الكاملة من 3 أصول HBL «لأمر» جاهزة؛ نسلّمها بعد دفع فاتورة الشحن. ${sc.payKind === 'lc' ? 'الوصف والتواريخ مطابقة للاعتماد — يرجى التقديم ضمن مهلة الاعتماد.' : 'قدّموها مع الفاتورة والشهادات لمصرفكم.'}`), ok: true },
          { l: L('We already sent a telex release, the bank does not need originals.', 'أرسلنا تلكس ريليز، المصرف لا يحتاج الأصول.'), ok: false, fb: L('That would bypass the bank — your client would lose payment security.', 'هذا يتجاوز المصرف — يخسر زبونك ضمان الدفع.') },
          { l: L('We send the originals directly to the buyer.', 'نرسل الأصول مباشرة للمشتري.'), ok: false, fb: L('Never — the originals go through the banks.', 'أبدًا — الأصول تمرّ عبر المصارف.') },
        ], thanks: L('Great, we will transfer the payment today.', 'ممتاز، سنحوّل الدفعة اليوم.') }) },
    { k: 'pref', after: 'gatein', who: 'consignee', when: (s) => !imp(s),
      make: (s, sc) => { const z = sc.zone; return {
        from: sc.consignee.email, subject: L(`Import duties in ${sc.far.country}?`, `رسوم الاستيراد في ${sc.far.country}؟`),
        body: L(`Dear forwarder,\n\nWill we pay import duty in ${sc.far.country} on these goods from Lebanon?\n\n${sc.consignee.contact}\n${sc.consignee.name}`, `حضرة وكيل الشحن،\n\nهل سندفع رسوم استيراد في ${sc.far.country} على هذه البضاعة من لبنان؟\n\n${sc.consignee.contact}\n${sc.consignee.name}`),
        options: [
          z === 'EU' ? { l: L('The goods travel with an EUR.1: under the EU–Lebanon Association Agreement you can claim preferential (reduced or zero) duty, subject to your customs’ acceptance. VAT still applies.', 'البضاعة ترافقها EUR.1: بموجب اتفاقية الشراكة يمكنكم المطالبة بالرسوم التفضيلية (مخفّضة أو صفر) حسب قبول جماركم. تبقى الضريبة على القيمة المضافة.'), ok: true }
            : z === 'ARAB' ? { l: L('The Arab certificate of origin lets you claim the GAFTA exemption from customs duty, subject to your customs’ acceptance. VAT still applies.', 'شهادة المنشأ العربية تتيح لكم المطالبة بإعفاء منطقة التجارة العربية من الرسوم، حسب قبول جماركم. تبقى الضريبة.'), ok: true }
              : { l: L(`There is no free-trade preference between Lebanon and ${sc.far.country} in this case: normal duty and taxes apply. The certificate of origin proves Lebanese origin.`, `لا تفضيل تجاري بين لبنان و${sc.far.country} في هذه الحالة: تُطبَّق الرسوم والضرائب العادية. شهادة المنشأ تثبت المنشأ اللبناني.`), ok: true },
          { l: L('No duty at all — guaranteed.', 'لا رسوم أبدًا — مضمون.'), ok: false, fb: L('Never guarantee another country’s duty treatment.', 'لا تضمن أبدًا معاملة جمركية لبلد آخر.') },
          { l: L('Ask the shipping line.', 'اسألوا الخط الملاحي.'), ok: false, fb: L('The line has nothing to do with duties.', 'لا علاقة للخط بالرسوم.') },
        ], thanks: L('Thank you for the clear answer.', 'شكرًا على الجواب الواضح.') }; } },
    { k: 'remeasure', after: 'stuffing', who: 'client', when: (s) => lclS(s),
      make: (s, sc) => ({
        from: sc.client.email, subject: L('Why did the freight increase?', 'لماذا زاد الشحن؟'),
        body: L(`Hello,\n\nYou told us the freight would be on ${TS.num(s.jobFile.wm)} W/M. Now you say more. ${sc.tone === 'demanding' ? 'This is not acceptable!' : 'Can you explain?'}\n\n${sc.client.contact}`, `مرحبًا،\n\nقلتم إن الشحن على ${TS.num(s.jobFile.wm)} W/M. الآن تقولون أكثر. ${sc.tone === 'demanding' ? 'هذا غير مقبول!' : 'هل يمكنكم التوضيح؟'}\n\n${sc.client.contact}`),
        options: [
          { l: L(`Our quotation said LCL freight is charged on the CFS measurement. The CFS dock receipt (attached) shows ${TS.num(OPS.measured(s).cbm)} CBM instead of the declared ${TS.num(s.jobFile.cbm)} — the difference is billed at the same rate.`, `نصّ عرضنا أن شحن LCL يُحتسب على قياس المحطة. إيصال الاستلام (مرفق) يُظهر ${TS.num(OPS.measured(s).cbm)} م³ بدل ${TS.num(s.jobFile.cbm)} المصرّح — يُفوتر الفرق بالسعر نفسه.`), ok: true, att: [{ name: 'Dock_receipt.pdf', doc: 'dr' }] },
          { l: L('Our mistake, we will absorb it.', 'خطأنا، سنتحمّله.'), ok: false, fb: L('It is not your mistake; it is in your terms. Absorbing it kills your margin.', 'ليس خطأك؛ إنه في شروطك. تحمّله يقتل هامشك.') },
          { l: L('The consolidator cheats on measurements.', 'المجمِّع يغشّ في القياسات.'), ok: false, fb: L('Unprofessional and unfounded.', 'غير مهني وبلا أساس.') },
        ], thanks: L('OK, understood — we will pack more carefully next time.', 'حسنًا، مفهوم — سنغلّف بعناية أكبر المرة القادمة.') }) },
    { k: 'vgmmiss', after: 'stuffing', who: 'line', when: (s) => !lclS(s),
      make: (s) => ({
        from: OPS.lines[s.booking.carrier].email, subject: L(`URGENT — VGM missing ${s.equipment.containerNo}`, `عاجل — VGM ناقص ${s.equipment.containerNo}`),
        body: L(`Dear customer,\n\nWe have not yet received the VGM for container ${s.equipment.containerNo}, booking ${s.booking.no}. VGM cutoff: ${TS.fmtDate(s.booking.cutoffs.vgm)} 12:00. Without VGM the container will not be loaded.\n\nDocumentation team`, `عميلنا العزيز،\n\nلم نستلم بعد VGM للحاوية ${s.equipment.containerNo}، الحجز ${s.booking.no}. موعد VGM: ${TS.fmtDate(s.booking.cutoffs.vgm)} 12:00. بدون VGM لن تُحمَّل الحاوية.\n\nفريق المستندات`),
        options: [
          { l: L(`VGM ${TS.num(s.equipment.vgm, 0)} kg (method 2, signed by the shipper) is attached and submitted on your portal now. Please confirm.`, `VGM ${TS.num(s.equipment.vgm, 0)} كغ (الطريقة 2، موقّع من الشاحن) مرفق وقُدّم على بوابتكم الآن. يرجى التأكيد.`), ok: true, att: [{ name: 'VGM.pdf', doc: 'vgm' }] },
          { l: L('Please estimate it from the booking weight.', 'قدّروه من وزن الحجز.'), ok: false, fb: L('SOLAS: the shipper must declare a verified weight; estimates are not allowed.', 'SOLAS: يجب أن يصرّح الشاحن بوزن متحقَّق؛ التقدير غير مسموح.') },
          { l: L('Ignore — we will send it after loading.', 'تجاهلوا — سنرسله بعد التحميل.'), ok: false, fb: L('No VGM, no loading.', 'بدون VGM لا تحميل.') },
        ], thanks: L('VGM received, thank you.', 'تم استلام VGM، شكرًا.') }) },
    { k: 'brokerdocs', after: 'release', who: 'broker', when: (s) => imp(s),
      make: (s, sc) => ({
        from: OPS.parties.broker.email, subject: L('Missing document for the declaration — ' + s.id, 'مستند ناقص للبيان — ' + s.id),
        body: L(`Hi,\n\nFor ${s.id} we still need the importer’s VAT certificate${sc.licence ? ' and the product approval' : ''}. Without it we stay in the yellow lane and ${lclS(s) ? 'CFS storage' : 'demurrage'} runs.\n\nCustoms department`, `مرحبًا،\n\nلملف ${s.id} ما زلنا نحتاج الشهادة الضريبية للمستورد${sc.licence ? ' وموافقة المنتج' : ''}. بدونها نبقى في المسار الأصفر ويستمر ${lclS(s) ? 'التخزين' : 'احتساب الغرامات'}.\n\nقسم الجمارك`),
        options: [
          { l: L(`Requested from ${sc.client.contact} today as urgent; we will forward it as soon as received and keep you updated.`, `طلبناها من ${sc.client.contact} اليوم بشكل عاجل؛ سنحوّلها فور استلامها ونبقيكم على اطلاع.`), ok: true },
          { l: L('Lodge without it, they will not check.', 'قدّموا بدونها، لن يتحقّقوا.'), ok: false, fb: L('Incomplete declarations get queried — and it is dishonest.', 'البيانات الناقصة تُرفض — وهذا غير أمين.') },
          { l: L('Not our problem — the client will deal with it.', 'ليست مشكلتنا — الزبون يتولّاها.'), ok: false, fb: L('You coordinate the file: follow up actively.', 'أنت تنسّق الملف: تابع بفعالية.') },
        ], thanks: L('Thanks, received.', 'شكرًا، وصلت.') }) },
    { k: 'agentinv', after: 'delivery', who: 'agent', when: (s, sc) => sc.locals.some((l) => l.vendor === 'agent'),
      make: (s, sc) => { const ls = s.quotation.lines.filter((l) => l.vendor === 'agent'), agreed = R2(ls.reduce((a, l) => a + Number(l.buy) * (l.qty || 1), 0)), extra = 20 + (OPS.seed(s) % 4) * 5, billed = R2(agreed + extra); s.agentInv = { agreed, billed, extra }; return {
        from: sc.agent.email, subject: L(`Our invoice ${s.id} — USD ${TS.num(billed)}`, `فاتورتنا ${s.id} — ${TS.num(billed)} دولار`),
        body: L(`Dear partner,\n\nPlease find our invoice for ${ls.map((l) => l.code).join(', ')}: USD ${TS.num(billed)}.\nKindly remit within 30 days.\n\n${sc.agent.contact}`, `حضرة الشريك،\n\nمرفق فاتورتنا عن ${ls.map((l) => l.code).join('، ')}: ${TS.num(billed)} دولار.\nيرجى التحويل خلال 30 يومًا.\n\n${sc.agent.contact}`),
        options: [
          { l: L(`Thanks. Our agreed rates total USD ${TS.num(agreed)} (${ls.map((l) => l.code + ' ' + TS.num(Number(l.buy) * (l.qty || 1))).join(', ')}). Please explain or credit the USD ${TS.num(extra)} difference before we approve.`, `شكرًا. أسعارنا المتفق عليها مجموعها ${TS.num(agreed)} دولار. يرجى توضيح فرق ${TS.num(extra)} دولار أو إصدار إشعار دائن قبل الموافقة.`), ok: true },
          { l: L('Approved, we pay today.', 'موافق، ندفع اليوم.'), ok: false, fb: L('Always match supplier invoices with the agreed buy rates.', 'طابق دائمًا فواتير المورّدين مع أسعار الكلفة المتفق عليها.') },
          { l: L('We refuse to pay anything.', 'نرفض دفع أي شيء.'), ok: false, fb: L('Pay what was agreed; query only the difference.', 'ادفع المتفق عليه؛ واستفسر عن الفرق فقط.') },
        ], thanks: L(`Apologies — corrected invoice USD ${TS.num(agreed)} attached.`, `نعتذر — مرفق الفاتورة المصحّحة ${TS.num(agreed)} دولار.`) }; } },
    { k: 'waiting', after: 'delivery', who: 'trucker', when: (s, sc) => imp(s) && sc.services.door,
      make: (s, sc) => ({
        from: OPS.parties.trucker.email, subject: L('Waiting time at the client — ' + s.id, 'وقت انتظار عند الزبون — ' + s.id),
        body: L(`Hello,\n\nOur truck waited 5 hours at ${sc.client.area} because the client’s forklift was not available. Waiting charge: 3 hours × USD 20 = USD 60 (2 hours free).\n\nAbou Ali`, `مرحبًا،\n\nانتظرت شاحنتنا 5 ساعات في ${sc.client.area} لأن رافعة الزبون لم تكن متوفرة. رسم الانتظار: 3 ساعات × 20 = 60 دولار (ساعتان مجانًا).\n\nأبو علي`),
        options: [
          { l: L(`Accepted as per our agreement (2 free hours). As the delay was caused by the client, we will rebill USD 60 to ${sc.client.name} with the POD as evidence.`, `مقبول حسب اتفاقنا (ساعتان مجانًا). بما أن التأخير بسبب الزبون، سنعيد فوترة 60 دولار إلى ${sc.client.name} مع إثبات التسليم.`), ok: true },
          { l: L('We never pay waiting time.', 'لا ندفع وقت الانتظار أبدًا.'), ok: false, fb: L('Waiting beyond the free hours is a normal, agreed charge.', 'الانتظار بعد الساعات المجانية رسم عادي متفق عليه.') },
          { l: L('Pay it and say nothing to the client.', 'ادفعه ولا تقل شيئًا للزبون.'), ok: false, fb: L('That eats your margin; rebill when the client caused it.', 'هذا يأكل هامشك؛ أعد الفوترة عندما يكون الزبون السبب.') },
        ], thanks: L('Thanks, invoice follows.', 'شكرًا، الفاتورة تتبع.') }) },
    { k: 'late', after: 'booking', who: 'shipper', when: (s) => imp(s),
      make: (s, sc) => ({
        from: sc.shipper.email, subject: L('Production delay — 2 days', 'تأخير في الإنتاج — يومان'),
        body: L(`Dear forwarder,\n\nSorry, the goods will be ready 2 days later than planned, on ${TS.fmtDate(TS.addDays(s.jobFile.readyDate, 2))}.\n\n${sc.shipper.contact}\n${sc.shipper.name}`, `حضرة وكيل الشحن،\n\nنعتذر، ستكون البضاعة جاهزة بعد يومين من الموعد، في ${TS.fmtDate(TS.addDays(s.jobFile.readyDate, 2))}.\n\n${sc.shipper.contact}\n${sc.shipper.name}`),
        options: [
          { l: L(`Noted. ${TS.diffDays(TS.addDays(s.jobFile.readyDate, 2), s.booking.cutoffs.cy) >= 2 ? 'This still leaves time before the ' + (lclS(s) ? 'CFS' : 'CY') + ' cutoff of ' + TS.fmtDate(s.booking.cutoffs.cy) + ', so the booking stays.' : 'This is too close to the cutoff — we will move to the next sailing.'} Please confirm in writing; we inform ${sc.client.name}.`, `ملاحظ. ${TS.diffDays(TS.addDays(s.jobFile.readyDate, 2), s.booking.cutoffs.cy) >= 2 ? 'يبقى وقت قبل موعد ' + (lclS(s) ? 'CFS' : 'CY') + ' في ' + TS.fmtDate(s.booking.cutoffs.cy) + '، فيبقى الحجز.' : 'هذا قريب جدًا من الموعد — سننقل إلى الباخرة التالية.'} يرجى التأكيد كتابيًا؛ سنبلغ ${sc.client.name}.`), ok: true },
          { l: L('No problem, the vessel will wait.', 'لا مشكلة، الباخرة ستنتظر.'), ok: false, fb: L('Vessels never wait for one shipment.', 'البواخر لا تنتظر شحنة واحدة أبدًا.') },
          { l: L('Cancel the booking immediately.', 'ألغوا الحجز فورًا.'), ok: false, fb: L('Check the cutoffs first — maybe nothing changes.', 'تحقّق من المواعيد أولًا — ربما لا يتغيّر شيء.') },
        ], thanks: L('Confirmed in writing. Thank you.', 'مؤكَّد كتابيًا. شكرًا.') }) },
  ];

  /* choose 4 tasks for this shipment (stable), at least 2 from the client */
  M.plan = (s) => {
    const sc = OPS.sc(s), r = OPS.srng(s, 501);
    const ok = CAT.filter((c) => c.when(s, sc));
    const client = OPS.shuffle(r, ok.filter((c) => c.who === 'client')), other = OPS.shuffle(r, ok.filter((c) => c.who !== 'client'));
    const picked = client.slice(0, 2).concat(other.slice(0, 2));
    while (picked.length < 4 && client.length > picked.filter((x) => x.who === 'client').length) picked.push(client[picked.filter((x) => x.who === 'client').length]);
    s.mailPlan = picked.map((c) => c.k);
    s.mailTasks = [];
  };
  /* deliver the tasks planned after a finished step */
  M.trigger = (s, stepId) => {
    if (!s.mailPlan) return;
    const sc = OPS.sc(s);
    s.mailPlan.forEach((k) => {
      const c = CAT.find((x) => x.k === k);
      if (!c || c.after !== stepId || (s.mailTasks || []).some((x) => x.kind === k)) return;
      const tk = c.make(s, sc);
      const order = OPS.shuffle(OPS.srng(s, 600 + k.length), tk.options.map((_, i) => i));
      const id = 'T-' + k;
      const m = OPS.emailPush(s, 'in', { from: tk.from, to: OPS.company.email, step: stepId, read: false, subject: tk.subject, body: tk.body, task: id });
      s.mailTasks.push({ id, kind: k, after: stepId, who: c.who, from: tk.from, subject: tk.subject, options: order.map((i) => tk.options[i]), thanks: tk.thanks, done: false, attempts: 0, mailId: m.id });
      TS.toast('✉ ' + t(L('New email needs your reply: ', 'رسالة جديدة تحتاج ردّك: ')) + t(tk.subject), 'mail');
    });
  };
  M.open = (s) => (s.mailTasks || []).filter((x) => !x.done);
  M.correctIndex = (tk) => tk.options.findIndex((o) => o.ok);
  M.taskMailId = (s, id) => { const tk = (s.mailTasks || []).find((x) => x.id === id); return tk ? tk.mailId : null; };
  M.answer = (s, id, idx, silent) => {
    const tk = (s.mailTasks || []).find((x) => x.id === id); if (!tk || tk.done) return false;
    const o = tk.options[idx]; tk.attempts++;
    if (!o || !o.ok) { s.score.mistakes++; return false; }
    tk.done = true; tk.firstTry = tk.attempts === 1; tk.answeredSim = s.sim.today;
    const orig = s.emails.find((e) => e.id === tk.mailId);
    OPS.emailPush(s, 'out', { from: OPS.company.email, to: tk.from, subject: L('RE: ' + tk.subject.en, 'رد: ' + tk.subject.ar), body: o.l, step: orig ? orig.step : null, inReplyTo: tk.mailId, attachments: o.att || [] });
    OPS.emailPush(s, 'in', { from: tk.from, to: OPS.company.email, subject: L('RE: ' + tk.subject.en, 'رد: ' + tk.subject.ar), body: tk.thanks, read: !!silent, step: orig ? orig.step : null });
    if (orig) orig.read = true;
    return true;
  };

  /* ---------------- folders, parties, threads ---------------- */
  M.kind = (s, addr) => {
    const sc = OPS.sc(s);
    if (!addr) return 'other';
    if (addr === sc.client.email) return 'client';
    if (Object.values(OPS.lines).some((l) => l.email === addr)) return 'line';
    if ([sc.agent.email, sc.shipper.email, sc.consignee.email].includes(addr)) return 'partner';
    if (addr === OPS.company.email) return 'me';
    return 'auth';
  };
  const AV = { client: ['#e1061a', '#fff'], line: ['#06205c', '#fff'], partner: ['#1d4fa3', '#fff'], auth: ['#5d6b82', '#fff'], me: ['#0d8a5f', '#fff'], other: ['#888', '#fff'] };
  M.who = (s, addr) => {
    const sc = OPS.sc(s);
    const named = [[sc.client.email, sc.client.contact + ' · ' + sc.client.name], [sc.shipper.email, (sc.shipper.contact || '') + ' · ' + sc.shipper.name], [sc.consignee.email, (sc.consignee.contact || '') + ' · ' + sc.consignee.name], [sc.agent.email, (sc.agent.contact || '') + ' · ' + sc.agent.name], [OPS.parties.trucker.email, OPS.parties.trucker.contact + ' · ' + OPS.parties.trucker.name], [OPS.parties.broker.email, OPS.parties.broker.name], [OPS.company.email, OPS.company.name]].concat(Object.values(OPS.lines).map((l) => [l.email, l.name]));
    const f = named.find((x) => x[0] === addr);
    return f ? f[1] : addr;
  };
  M.avatar = (s, addr) => {
    const k = M.kind(s, addr), name = M.who(s, addr).split(' · ').pop();
    const ini = name.replace(/[^A-Za-z ]/g, '').split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase() || '✉';
    const [bg, fg] = AV[k];
    return `<span class="av" style="background:${bg};color:${fg}" title="${esc(name)}">${esc(ini)}</span>`;
  };
  const norm = (subj) => String((subj && subj.en) || subj || '').replace(/^((RE|FW|FWD)\s*:\s*)+/i, '').trim().toLowerCase();
  const FOLDERS = [
    ['in', '📥', L('Inbox', 'الوارد')], ['needs', '❗', L('Needs reply', 'بانتظار الرد')], ['out', '📤', L('Sent', 'المرسل')],
    ['client', '👤', L('Clients', 'الزبائن')], ['line', '⛴', L('Lines & consolidators', 'الخطوط والمجمِّعون')], ['partner', '🌍', L('Agents & suppliers', 'الوكلاء والمورّدون')], ['auth', '🏛', L('Customs, trucking & banks', 'الجمارك والنقل والمصارف')],
  ];
  M.unread = (s) => (s ? s.emails.filter((e) => e.box === 'in' && !e.read).length : 0);
  M.needs = (s) => (s ? M.open(s).length : 0);
  const listFor = (s, f) => {
    const em = s.emails;
    if (f === 'in') return em.filter((e) => e.box === 'in');
    if (f === 'out') return em.filter((e) => e.box === 'out');
    if (f === 'needs') { const ids = M.open(s).map((x) => x.mailId); return em.filter((e) => ids.includes(e.id)); }
    return em.filter((e) => M.kind(s, e.box === 'in' ? e.from : String(e.to).split(';')[0].trim()) === f);
  };

  /* attachment chips: open the document in a pop-up */
  M.attHTML = (s, atts) => (atts || []).map((a) => { const o = typeof a === 'string' ? { name: a } : a; const ok = o.doc && OPS.docs.get(s, o.doc); return `<button type="button" class="att ${ok ? '' : 'off'}" ${ok ? `data-doc-open="${esc(o.doc)}"` : 'disabled'} title="${ok ? esc(t(L('Open document', 'افتح المستند'))) : esc(t(L('File (not previewable)', 'ملف (لا معاينة)')))}">📎 ${esc(o.name)}</button>`; }).join('');

  M.view = (main) => {
    const a = app(), s = a.ship;
    const f = a.mailBox || 'in', q = TS.norm(a.mailQ || '');
    let list = listFor(s, f).slice().reverse();
    if (q) list = list.filter((e) => TS.norm(t(e.subject) + ' ' + e.from + ' ' + e.to + ' ' + t(e.body)).includes(q));
    /* one row per conversation (latest message first) */
    const seen = {}, tcount = {};
    s.emails.forEach((e) => { const k = norm(e.subject); tcount[k] = (tcount[k] || 0) + 1; });
    if (f !== 'needs') list = list.filter((e) => { const k = norm(e.subject); if (seen[k]) return false; seen[k] = 1; return true; });
    let sel = s.emails.find((e) => e.id === a.mailSel && (list.includes(e) || list.some((x) => norm(x.subject) === norm(e.subject)))) || list[0];
    if (sel && !sel.read) { sel.read = true; a.save(); }
    const thread = sel ? s.emails.filter((e) => norm(e.subject) === norm(sel.subject)).sort((x, y) => (x.time || '').localeCompare(y.time || '')) : [];
    const task = sel ? (s.mailTasks || []).find((x) => x.mailId === sel.id || thread.some((e) => e.id === x.mailId)) : null;
    const count = (k) => (k === 'needs' ? M.needs(s) : k === 'in' ? M.unread(s) : 0);
    const item = (e) => { e = (sel && norm(sel.subject) === norm(e.subject)) ? Object.assign({}, e, { _on: true }) : e; const addr = e.box === 'in' ? e.from : String(e.to).split(';')[0].trim(); const tk = (s.mailTasks || []).find((x) => x.mailId === e.id); return `<div class="mail-item ${e._on ? 'on' : ''} ${!e.read ? 'unread' : ''}" data-mail="${e.id}">${M.avatar(s, addr)}<div class="mi"><div class="from"><span>${esc(M.who(s, addr).split(' · ')[0])}</span><span>${TS.fmtDate(e.date, false)}</span></div><div class="subj">${tk && !tk.done ? '<span class="badge bad">' + esc(t(L('reply', 'ردّ'))) + '</span> ' : ''}${e.attachments && e.attachments.length ? '📎 ' : ''}${esc(t(e.subject))}${tcount[norm(e.subject)] > 1 ? ' <span class="badge">' + tcount[norm(e.subject)] + '</span>' : ''}</div></div></div>`; };
    const msg = (e) => { const addr = e.box === 'in' ? e.from : String(e.to).split(';')[0].trim(); return `<article class="msg ${e === sel ? 'cur' : ''}"><header>${M.avatar(s, e.from)}<div><b>${esc(M.who(s, e.from))}</b><br><small class="muted">${t(L('to', 'إلى'))} ${esc(M.who(s, String(e.to).split(';')[0].trim()))}${e.cc ? ' · cc ' + esc(e.cc) : ''} · ${TS.fmtDate(e.date)}</small></div></header><div class="mail-body">${t(e.body)}</div>${e.attachments && e.attachments.length ? `<div class="atts">${M.attHTML(s, e.attachments)}</div>` : ''}${void addr || ''}</article>`; };
    main.innerHTML = `<h1>✉ ${t(L('Virtual email', 'البريد الافتراضي'))}</h1>
      <p class="muted">${t(L('Everything for this shipment: client, lines/consolidators, agents, truckers, customs. Emails marked “reply” wait for your answer — the file cannot be closed while one is open. Click a 📎 attachment to open the document.', 'كل ما يخص هذه الشحنة: الزبون، الخطوط/المجمِّعون، الوكلاء، النقل، الجمارك. الرسائل المعلّمة «ردّ» تنتظر جوابك — لا يُقفل الملف وواحدة مفتوحة. انقر مرفقًا 📎 لفتح المستند.'))} <span class="mono">${esc(OPS.company.email)}</span></p>
      <div class="mail2"><nav class="mfold">${FOLDERS.map(([k, ic, l]) => `<button data-box="${k}" class="${f === k ? 'on' : ''}"><span>${ic}</span><span>${t(l)}</span>${count(k) ? `<span class="badge ${k === 'needs' ? 'bad' : 'n'}">${count(k)}</span>` : ''}</button>`).join('')}</nav>
      <div class="mail-list"><div class="msearch"><input type="search" id="mq" placeholder="${esc(t(L('Search mail…', 'ابحث في البريد…')))}" value="${esc(a.mailQ || '')}"></div>${list.map(item).join('') || `<p class="muted" style="padding:14px">${t(L('Empty', 'فارغ'))}</p>`}</div>
      <div class="mail-read">${sel ? `<h3>${esc(t(sel.subject))} <small class="muted">· ${thread.length} ${t(L('message(s)', 'رسالة'))}</small></h3>${thread.map(msg).join('')}
        ${task && !task.done ? composer(task) : task ? `<div class="note ok">✓ ${t(L('Answered', 'تم الرد'))}${task.firstTry ? ' — ' + t(L('right first time', 'صحيح من أول مرة')) : ''}</div>` : sel.box === 'in' ? `<div class="row" style="margin-top:12px"><button class="btn sm" id="qr">↩ ${t(L('Quick reply', 'رد سريع'))}</button>${sel.step ? `<button class="btn sm ghost" data-go="step:${sel.step}">${t(L('Go to related step', 'انتقل إلى المرحلة المرتبطة'))} →</button>` : ''}</div><div id="qrBox"></div>` : ''}` : `<p class="muted">${t(L('No message selected', 'لا رسالة محدّدة'))}</p>`}</div></div>`;
    function composer(tk) {
      const ch = a.mailPick && a.mailPick[tk.id];
      return `<div class="composer"><div class="row" style="justify-content:space-between"><b>↩ ${t(L('Reply to', 'الرد على'))} ${esc(M.who(s, tk.from).split(' · ')[0])}</b><span class="badge">${t(L('choose the best answer, then send', 'اختر أفضل جواب ثم أرسل'))}</span></div>
        ${tk.options.map((o, i) => `<label class="check ${a.mailFb && a.mailFb.id === tk.id && a.mailFb.i === i ? 'wrong' : ''}"><input type="radio" name="mrep" value="${i}" ${ch === i ? 'checked' : ''}><span>${esc(t(o.l))}${o.att ? `<br><small>📎 ${o.att.map((x) => esc(x.name)).join(', ')}</small>` : ''}${a.mailFb && a.mailFb.id === tk.id && a.mailFb.i === i && o.fb ? `<br><small>✗ ${esc(t(o.fb))}</small>` : ''}</span></label>`).join('')}
        <div class="row" style="margin-top:8px"><button class="btn primary" data-act="send">${t(L('Send reply', 'أرسل الرد'))} ✉</button><button class="btn ghost" data-act="model">${t(L('Show model answer', 'أرني الجواب النموذجي'))}</button></div></div>`;
    }
    main.querySelectorAll('[data-box]').forEach((b) => (b.onclick = () => { a.mailBox = b.dataset.box; a.mailSel = null; a.render(); }));
    main.querySelectorAll('[data-mail]').forEach((b) => (b.onclick = () => { a.mailSel = b.dataset.mail; a.render(); }));
    const mq = main.querySelector('#mq'); if (mq) mq.oninput = () => { a.mailQ = mq.value; a.render(); const n = document.querySelector('#mq'); n.focus(); n.setSelectionRange(n.value.length, n.value.length); };
    if (task && !task.done) {
      main.querySelectorAll('input[name=mrep]').forEach((r) => (r.onchange = () => { a.mailPick = a.mailPick || {}; a.mailPick[task.id] = Number(r.value); a.mailFb = null; }));
      main.querySelector('[data-act=model]').onclick = () => { s.score.hints++; a.mailPick = a.mailPick || {}; a.mailPick[task.id] = M.correctIndex(task); a.save(); a.render(); };
      main.querySelector('[data-act=send]').onclick = () => {
        const i = a.mailPick && a.mailPick[task.id]; if (i == null) { TS.toast(t(L('Choose an answer first', 'اختر جوابًا أولًا')), 'bad'); return; }
        if (M.answer(s, task.id, i)) { a.mailFb = null; TS.toast('✓ ' + t(L('Reply sent', 'أُرسل الرد')), 'ok'); a.save(); a.render(); setTimeout(() => TS.toast('✉ ' + t(task.thanks), 'mail'), 900); }
        else { a.mailFb = { id: task.id, i }; TS.toast(t(L('Not the best reply — read the feedback', 'ليس أفضل رد — اقرأ الملاحظة')), 'bad'); a.save(); a.render(); }
      };
    }
    const qr = main.querySelector('#qr');
    if (qr) qr.onclick = () => {
      const box = main.querySelector('#qrBox');
      box.innerHTML = `<div class="composer"><textarea id="qrt" rows="4" placeholder="${esc(t(L('Write your reply…', 'اكتب ردّك…')))}"></textarea><div class="row" style="margin-top:6px"><button class="btn primary sm" id="qrs">${t(L('Send', 'أرسل'))} ✉</button></div></div>`;
      box.querySelector('#qrs').onclick = () => { const v = box.querySelector('#qrt').value.trim(); if (!v) return; OPS.emailPush(s, 'out', { from: OPS.company.email, to: sel.from, subject: L('RE: ' + (sel.subject.en || sel.subject), 'رد: ' + (sel.subject.ar || sel.subject)), body: L(esc(v), esc(v)), inReplyTo: sel.id }); a.save(); a.render(); TS.toast('✓ ' + t(L('Reply sent', 'أُرسل الرد')), 'ok'); };
    };
  };
})();
