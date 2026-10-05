/* Accounting module — the 8 steps of a job in the accounting department, and the printable documents */
(function () {
  const L = TS.L, t = TS.t, esc = TS.esc, R = TS.round2;
  const ACC = window.ACC;
  const ui = () => TS.ui;
  const A = (s) => s.accounting;
  const LB = (en, ar) => `<div class="note lb"><strong>🇱🇧 ${t(L('Lebanon', 'لبنان'))}</strong>${t(L(en, ar))}</div>`;
  const money = (n) => 'USD ' + TS.num(n);
  const vendTbl = (d) => ui().table([L('Supplier', 'المورّد'), L('Invoice', 'الفاتورة'), { l: L('Net', 'الصافي'), num: 1 }, { l: 'VAT', num: 1 }, { l: L('Total', 'المجموع'), num: 1 }], d.sup.map((v) => `<tr><td>${esc(v.name)}</td><td class="mono">${esc(v.no)}</td><td class="num">${TS.num(v.net)}</td><td class="num">${TS.num(v.vat)}</td><td class="num">${TS.num(v.total)}</td></tr>`));
  ACC.steps = [];

  /* ============================================================ 1. RECEIVE THE JOB */
  ACC.steps.push({
    id: 'receive',
    title: L('Receive & review the job', 'استلام العملية ومراجعتها'),
    sub: L('Check the file Operations handed over before anything is invoiced or posted.', 'راجع الملف الذي سلّمته العمليات قبل أي فوترة أو ترحيل.'),
    lesson: () => t(L(`
<h3>Where accounting starts</h3>
<p>Operations closes the job and hands over the shipment file with: the sell lines (what the client must pay), the cost lines (what suppliers will invoice), disbursements (deposits) and the quoted profit. Your first job is to <b>check</b> before you invoice.</p>
<h3>What to check</h3>
<ul><li>Every cost has a sell line (nothing forgotten — e.g. demurrage rebilled).</li><li>Sell prices match the accepted quotation.</li><li>VAT treatment of each line: <b>11%</b> on local services in Lebanon, <b>exempt/zero-rated</b> on international freight and insurance.</li><li>Customer details for the tax invoice: legal name, address, VAT number.</li><li>Disbursements (container deposit) separated from revenue.</li></ul>
<h3>Accrual basis</h3>
<p>Revenue is recognised when the service is performed, <b>not</b> when the client pays. A paid invoice and an unpaid invoice are both revenue; the difference is only in the customer account (411).</p>`,
    `
<h3>أين تبدأ المحاسبة</h3>
<p>تقفل العمليات الملف وتسلّم ملف الشحنة مع: بنود البيع (ما يدفعه الزبون)، بنود الكلفة (ما سيفوتره المورّدون)، السُلف (التأمينات) والربح المقدّر. مهمتك الأولى أن <b>تتحقّق</b> قبل الفوترة.</p>
<h3>ماذا تتحقّق</h3>
<ul><li>لكل كلفة بند بيع (لا شيء منسي — مثل إعادة فوترة الغرامات).</li><li>أسعار البيع مطابقة للعرض المقبول.</li><li>المعاملة الضريبية لكل بند: <b>11%</b> على الخدمات المحلية في لبنان، و<b>معفى/صفر</b> على الشحن الدولي والتأمين.</li><li>بيانات الزبون للفاتورة الضريبية: الاسم القانوني، العنوان، الرقم الضريبي.</li><li>فصل السُلف (تأمين الحاوية) عن الإيرادات.</li></ul>
<h3>أساس الاستحقاق</h3>
<p>يُعترف بالإيراد عند تنفيذ الخدمة، <b>لا</b> عند دفع الزبون. الفاتورة المدفوعة وغير المدفوعة كلتاهما إيراد؛ الفرق فقط في حساب الزبون (411).</p>`)),
    parts: [
      {
        id: 'review', title: L('Review the hand-off pack', 'راجع حزمة التسليم'),
        render(ctx, b) {
          const s = ctx.ship, d = ctx.d, p = s.handoffs.accounting.pack;
          const pre = `${ui().table([L('Code', 'الرمز'), L('Sell line', 'بند البيع'), { l: 'USD', num: 1 }], d.inv.lines.map((l) => `<tr><td>${esc(l.code)}</td><td>${esc(l.desc)}</td><td class="num">${TS.num(l.amount)}</td></tr>`))}
            ${ui().table([L('Code', 'الرمز'), L('Cost line', 'بند الكلفة'), L('Supplier', 'المورّد'), { l: 'USD', num: 1 }], p.payables.map((l) => `<tr><td>${esc(l.code)}</td><td>${esc(l.desc)}</td><td>${esc(l.vendor)}</td><td class="num">${TS.num(l.amount)}</td></tr>`))}
            ${d.deposit ? `<div class="note">${t(L('Disbursement: container deposit', 'سلفة: تأمين الحاوية'))} ${money(d.deposit)} — ${esc(s.booking.carrierName)}</div>` : ''}`;
          ui().choice(ctx, b, {
            key: 'rv', multi: true, pre,
            q: L('Which checks does Accounting do now?', 'ما التحقّقات التي تقوم بها المحاسبة الآن؟'),
            options: [
              { l: L('Every cost line has a matching sell line (e.g. D&D rebilled)', 'لكل بند كلفة بند بيع مقابل (مثل إعادة فوترة الغرامات)'), ok: true },
              { l: L('Customer legal name, address and VAT number are complete for the tax invoice', 'اسم الزبون القانوني وعنوانه ورقمه الضريبي مكتملة للفاتورة الضريبية'), ok: true },
              { l: L('The container deposit is kept out of revenue', 'تأمين الحاوية خارج الإيرادات'), ok: true },
              { l: L('Increase some sell prices to improve profit', 'رفع بعض أسعار البيع لتحسين الربح'), ok: false, fb: L('Prices are those accepted by the client in the quotation.', 'الأسعار هي التي وافق عليها الزبون في العرض.') },
              { l: L('Wait for the client’s payment before recording the revenue', 'انتظار دفع الزبون قبل تسجيل الإيراد'), ok: false, fb: L('Accrual basis: revenue is recorded when the service is done.', 'أساس الاستحقاق: يُسجَّل الإيراد عند تنفيذ الخدمة.') },
            ],
            onSuccess: () => ctx.finish('review'),
          });
        },
      },
      {
        id: 'vat', title: L('VAT treatment of each invoice line', 'المعاملة الضريبية لكل بند'),
        render(ctx, b) {
          const lines = ctx.d.inv.lines;
          ui().form(ctx, b, {
            key: 'vatcls', intro: L('Local services in Lebanon: 11%. International freight & surcharges, and insurance: exempt/zero-rated.', 'الخدمات المحلية في لبنان: 11%. الشحن الدولي ورسومه الإضافية والتأمين: معفى/صفر.'),
            fields: lines.map((l, i) => ({ k: 'l' + i, label: l.code + ' — ' + l.desc, type: 'select', options: [{ v: 'vat', l: L('VAT 11%', 'ضريبة 11%') }, { v: 'ex', l: L('Exempt / zero-rated', 'معفى / صفر') }], ans: () => (l.vat ? 'vat' : 'ex'), full: true })),
            onSuccess: () => ctx.finish('vat'),
          });
        },
      },
      {
        id: 'profit', title: L('Job profit check', 'التحقّق من ربح العملية'),
        render(ctx, b) {
          const d = ctx.d;
          ui().form(ctx, b, {
            key: 'pr',
            fields: [
              { k: 'rev', label: L('Revenue excl. VAT', 'الإيراد دون الضريبة'), unit: 'USD', type: 'number', tol: 1, ans: () => d.revenue },
              { k: 'cost', label: L('Costs excl. VAT', 'الكلف دون الضريبة'), unit: 'USD', type: 'number', tol: 1, ans: () => d.costNet },
              { k: 'pr', label: L('Job profit', 'ربح العملية'), unit: 'USD', type: 'number', tol: 1, ans: () => d.profit },
              { k: 'diff', label: L('Difference vs quoted profit', 'الفرق عن الربح المقدّر'), unit: 'USD', type: 'number', tol: 1, ans: () => R(d.profit - d.quotedProfit), help: L('Quoted profit: USD ' + TS.num(d.quotedProfit), 'الربح المقدّر: ' + TS.num(d.quotedProfit) + ' دولار') },
            ],
            onSuccess: () => ctx.finish('profit'),
          });
        },
      },
    ],
    quiz: [
      { q: L('The client has not paid yet. Do you record the revenue?', 'لم يدفع الزبون بعد. هل تسجّل الإيراد؟'), o: [L('No, only when paid', 'لا، فقط عند الدفع'), L('Yes — accrual basis; the unpaid amount sits in 411', 'نعم — أساس الاستحقاق؛ المبلغ غير المدفوع في 411')], a: 1 },
      { q: L('Ocean freight Shanghai → Beirut invoiced by a Lebanese forwarder is normally…', 'الشحن البحري من شنغهاي إلى بيروت المفوتر من وكيل لبناني عادة…'), o: [L('Subject to 11% VAT', 'خاضع لضريبة 11%'), L('Exempt / zero-rated (international transport)', 'معفى / صفر (نقل دولي)')], a: 1 },
      { q: L('The container deposit received from the client is…', 'تأمين الحاوية المقبوض من الزبون هو…'), o: [L('Revenue', 'إيراد'), L('A liability to the client (4191)', 'التزام تجاه الزبون (4191)')], a: 1 },
    ],
  });

  /* ============================================================ 2. TAX INVOICE */
  ACC.steps.push({
    id: 'invoice',
    title: L('Issue the tax invoice', 'إصدار الفاتورة الضريبية'),
    sub: L('A legally correct Lebanese tax invoice in USD with VAT 11% and its LBP equivalent.', 'فاتورة ضريبية لبنانية صحيحة بالدولار مع ضريبة 11% وما يعادلها بالليرة.'),
    lesson: () => t(L(`
<h3>The tax invoice</h3>
<p>The invoice is the legal basis of your revenue and of the VAT you collect for the State. A missing VAT number or a wrong amount can cost the client its right to recover the VAT — and cost you the client.</p>
<h3>Mandatory content (Lebanese practice)</h3>
<ul><li>Seller name, address and VAT registration number.</li><li>Customer name, address and VAT number (when registered).</li><li>Sequential invoice number and date.</li><li>Description of each service, amount before VAT.</li><li>VAT rate and VAT amount per rate; exempt lines shown separately.</li><li>Total payable; when invoicing in foreign currency, the VAT amount in LBP at the rate required by the Ministry of Finance.</li></ul>
<h3>Calculation</h3>
<p>VAT = 11% × (sum of taxable lines). Total = all lines + VAT. Already received amounts are not deducted on the invoice — they appear in the customer statement.</p>`,
    `
<h3>الفاتورة الضريبية</h3>
<p>الفاتورة هي الأساس القانوني لإيرادك وللضريبة التي تحصّلها لصالح الدولة. رقم ضريبي ناقص أو مبلغ خاطئ قد يُفقد الزبون حقه باسترداد الضريبة — ويُفقدك الزبون.</p>
<h3>المحتوى الإلزامي (الممارسة اللبنانية)</h3>
<ul><li>اسم البائع وعنوانه ورقم تسجيله الضريبي.</li><li>اسم الزبون وعنوانه ورقمه الضريبي (إن كان مسجّلًا).</li><li>رقم فاتورة متسلسل وتاريخ.</li><li>وصف كل خدمة والمبلغ قبل الضريبة.</li><li>نسبة الضريبة وقيمتها لكل نسبة؛ والبنود المعفاة منفصلة.</li><li>المجموع المستحق؛ وعند الفوترة بعملة أجنبية، قيمة الضريبة بالليرة بالسعر الذي تحدّده وزارة المالية.</li></ul>
<h3>الحساب</h3>
<p>الضريبة = 11% × (مجموع البنود الخاضعة). المجموع = كل البنود + الضريبة. المبالغ المقبوضة سابقًا لا تُحسم من الفاتورة — تظهر في كشف حساب الزبون.</p>`)) + LB('Use the official exchange rate required on the invoice date for the LBP equivalent (this simulator uses a sample rate of LBP 89,500/USD).', 'استعمل سعر الصرف الرسمي المطلوب بتاريخ الفاتورة لما يعادلها بالليرة (يستعمل المحاكي سعرًا نموذجيًا 89,500 ليرة/دولار).'),
    parts: [
      {
        id: 'fields', title: L('Mandatory invoice content', 'المحتوى الإلزامي للفاتورة'),
        render(ctx, b) {
          ui().choice(ctx, b, {
            key: 'mf', multi: true, q: L('Select what MUST appear on the tax invoice.', 'اختر ما يجب أن يظهر على الفاتورة الضريبية.'),
            options: [
              { l: L('Our VAT registration number', 'رقم تسجيلنا الضريبي'), ok: true },
              { l: L('Customer’s name, address and VAT number', 'اسم الزبون وعنوانه ورقمه الضريبي'), ok: true },
              { l: L('Sequential number and date', 'رقم متسلسل وتاريخ'), ok: true },
              { l: L('Amount before VAT, VAT rate and VAT amount', 'المبلغ قبل الضريبة، نسبة الضريبة وقيمتها'), ok: true },
              { l: L('VAT amount in LBP', 'قيمة الضريبة بالليرة'), ok: true },
              { l: L('Our buy price from the shipping line', 'سعر الكلفة من الخط الملاحي'), ok: false, fb: L('Confidential — never on a client invoice.', 'سرّي — لا يظهر على فاتورة الزبون أبدًا.') },
            ],
            onSuccess: () => ctx.finish('fields'),
          });
        },
      },
      {
        id: 'calc', title: L('Calculate the invoice', 'احسب الفاتورة'),
        render(ctx, b) {
          const d = ctx.d;
          ui().form(ctx, b, {
            key: 'calc',
            fields: [
              { k: 'no', label: L('Invoice number', 'رقم الفاتورة'), ro: true, value: () => d.invNo },
              { k: 'ex', label: L('Exempt / zero-rated lines', 'البنود المعفاة'), unit: 'USD', type: 'number', tol: 0.5, ans: () => d.exempt },
              { k: 'tx', label: L('Taxable lines (VAT base)', 'البنود الخاضعة (أساس الضريبة)'), unit: 'USD', type: 'number', tol: 0.5, ans: () => d.taxable },
              { k: 'vat', label: 'VAT 11%', unit: 'USD', type: 'number', tol: 0.05, ans: () => d.outVat },
              { k: 'tot', label: L('Invoice total', 'مجموع الفاتورة'), unit: 'USD', type: 'number', tol: 0.05, ans: () => d.total },
              { k: 'lbp', label: L('VAT in LBP (@ 89,500)', 'الضريبة بالليرة (@ 89,500)'), unit: 'LBP', type: 'number', tol: 5000, ans: () => Math.round(d.outVat * ACC.LBP_RATE) },
            ],
            onSuccess: (v) => { A(ctx.ship).docs.invoice = { no: d.invNo, date: A(ctx.ship).today, exempt: d.exempt, taxable: d.taxable, vat: d.outVat, total: d.total, lbpRate: ACC.LBP_RATE, vatLBP: Math.round(d.outVat * ACC.LBP_RATE) }; ctx.finish('calc'); },
          });
        },
        summary: (ctx) => `<p>✓ ${esc(ctx.d.invNo)} — ${money(ctx.d.total)} (VAT ${TS.num(ctx.d.outVat)}) · <a href="#docs">${t(L('view invoice', 'عرض الفاتورة'))}</a></p>`,
      },
      {
        id: 'send', title: L('Send the invoice & state the balance', 'أرسل الفاتورة وحدّد الرصيد'),
        render(ctx, b) {
          const d = ctx.d, s = ctx.ship;
          ui().form(ctx, b, {
            key: 'bal', intro: L('Part of the amount was already collected by Operations before the D/O. Check what remains due.', 'حصّلت العمليات جزءًا من المبلغ قبل إذن التسليم. تحقّق مما تبقّى مستحقًا.'),
            submit: L('Send invoice to client', 'أرسل الفاتورة للزبون'),
            fields: [
              { k: 'paid', label: L('Already received', 'المقبوض سابقًا'), unit: 'USD', type: 'number', tol: 0.05, ans: () => d.paid },
              { k: 'bal', label: L('Balance due', 'الرصيد المستحق'), unit: 'USD', type: 'number', tol: 0.05, ans: () => d.balance },
            ],
            onSuccess: () => {
              ctx.send({ to: s.parties.client.email, subject: L('Tax invoice ' + d.invNo + ' — ' + s.id, 'فاتورة ضريبية ' + d.invNo + ' — ' + s.id), body: L(`Dear ${s.parties.client.contact},\n\nPlease find attached our tax invoice ${d.invNo}: ${money(d.total)} incl. VAT ${TS.num(d.outVat)}.\nAlready received: ${money(d.paid)}. Balance: ${money(d.balance)}${d.balance && d.deposit ? ' — to be offset against your container deposit, balance of the deposit to be refunded.' : '.'}\n\nAccounting — ${ACC.company.name}`, `السيد/ة ${s.parties.client.contact}،\n\nمرفق فاتورتنا الضريبية ${d.invNo}: ${TS.num(d.total)} دولار مع ضريبة ${TS.num(d.outVat)}.\nالمقبوض سابقًا: ${TS.num(d.paid)}. الرصيد: ${TS.num(d.balance)}${d.balance && d.deposit ? ' — يُقاصّ مع تأمين الحاوية ويُعاد باقي التأمين لكم.' : '.'}\n\nالمحاسبة — ${ACC.company.name}`), attachments: [d.invNo.replace(/\//g, '-') + '.pdf'] });
              A(s).docs.invoice.sent = A(s).today;
              ctx.finish('send');
            },
          });
        },
      },
    ],
    quiz: [
      { q: L('Taxable lines 800, exempt lines 3,000. VAT?', 'البنود الخاضعة 800، المعفاة 3000. الضريبة؟'), o: ['418', '88', '330'], a: 1 },
      { q: L('The client already paid part. On the invoice you…', 'دفع الزبون جزءًا. على الفاتورة…'), o: [L('Reduce the VAT', 'تخفّض الضريبة'), L('Invoice the full amount; payments go to the customer account', 'تفوتر كامل المبلغ؛ والدفعات تُسجَّل في حساب الزبون')], a: 1 },
    ],
  });

  /* ============================================================ 3. SALES ENTRY */
  ACC.steps.push({
    id: 'sales',
    title: L('Post the sales entry', 'ترحيل قيد المبيعات'),
    sub: L('Record the invoice in the books with double entry.', 'سجّل الفاتورة في الدفاتر بالقيد المزدوج.'),
    lesson: () => t(L(`
<h3>Double entry</h3>
<p>Each entry has equal debits and credits. For a sales invoice:</p>
<ul><li><b>Debit 411 Customers</b> — the client owes us the total incl. VAT.</li><li><b>Credit 706 Revenue</b> — our income, excluding VAT.</li><li><b>Credit 4427 VAT collected</b> — VAT we hold for the State; it is not our money.</li></ul>
<p>Check: 411 = 706 + 4427.</p>`,
    `
<h3>القيد المزدوج</h3>
<p>لكل قيد مدين يساوي دائنه. لفاتورة مبيعات:</p>
<ul><li><b>مدين 411 الزبائن</b> — الزبون مدين لنا بالمجموع مع الضريبة.</li><li><b>دائن 706 الإيرادات</b> — دخلنا دون الضريبة.</li><li><b>دائن 4427 الضريبة المحصّلة</b> — ضريبة نحتفظ بها للدولة؛ ليست مالنا.</li></ul>
<p>تحقّق: 411 = 706 + 4427.</p>`)),
    parts: [{
      id: 'je', title: L('Sales journal entry', 'قيد المبيعات'),
      render(ctx, b) {
        const d = ctx.d;
        ui().journal(ctx, b, { key: 'sales', ref: d.invNo, narrative: L('Tax invoice ' + d.invNo + ' — ' + ctx.ship.parties.client.name, 'فاتورة ضريبية ' + d.invNo + ' — ' + ctx.ship.parties.client.name), help: L(`Invoice total ${money(d.total)} = revenue ${TS.num(d.revenue)} + VAT ${TS.num(d.outVat)}.`, `مجموع الفاتورة ${TS.num(d.total)} = إيراد ${TS.num(d.revenue)} + ضريبة ${TS.num(d.outVat)}.`), expected: [{ acc: '411', dr: d.total }, { acc: '706', cr: d.revenue }, { acc: '4427', cr: d.outVat }], onSuccess: () => ctx.finish('je') });
      },
    }],
    quiz: [
      { q: L('VAT collected on sales is…', 'الضريبة المحصّلة على المبيعات هي…'), o: [L('Revenue of the company', 'إيراد للشركة'), L('A debt to the State (credit 4427)', 'دين للدولة (دائن 4427)')], a: 1 },
      { q: L('Which account is debited when you invoice a client?', 'أي حساب يُجعل مدينًا عند فوترة زبون؟'), o: ['706', '411', '512'], a: 1 },
    ],
  });

  /* ============================================================ 4. SUPPLIER INVOICES */
  ACC.steps.push({
    id: 'purchases',
    title: L('Supplier invoices (payables)', 'فواتير المورّدين (الذمم الدائنة)'),
    sub: L('Match each supplier invoice with the job costing, handle a discrepancy, and post the purchases.', 'طابق كل فاتورة مورّد مع كلفة العملية، تعامل مع فرق، ورحّل المشتريات.'),
    lesson: () => t(L(`
<h3>Matching</h3>
<p>Before approving a supplier invoice, match it with what Operations agreed (the job costing / buy rates) and with proof of service (D/O, EIR, POD). Never pay an unexplained difference — put the invoice on hold and ask for justification or a <b>credit note</b>.</p>
<h3>Input VAT</h3>
<p>Lebanese suppliers charge 11% VAT on local services (THC, D/O fee, trucking, clearance fees). As a VAT-registered company you <b>recover</b> it: it goes to <b>4426</b>, not to cost.</p>
<h3>Purchase entry</h3>
<ul><li>Debit <b>604</b> cost (net) · Debit <b>4426</b> input VAT · Credit <b>401</b> suppliers (total).</li></ul>`,
    `
<h3>المطابقة</h3>
<p>قبل اعتماد فاتورة مورّد، طابقها مع ما اتفقت عليه العمليات (كلفة العملية / أسعار الكلفة) ومع إثبات الخدمة (إذن التسليم، EIR، إثبات التسليم). لا تدفع فرقًا غير مبرّر أبدًا — أوقف الفاتورة واطلب تبريرًا أو <b>إشعار دائن</b>.</p>
<h3>ضريبة المشتريات</h3>
<p>يفرض المورّدون اللبنانيون 11% على الخدمات المحلية (THC، رسم إذن التسليم، النقل، أتعاب التخليص). كشركة مسجّلة أنت <b>تستردّها</b>: تذهب إلى <b>4426</b> وليس إلى الكلفة.</p>
<h3>قيد المشتريات</h3>
<ul><li>مدين <b>604</b> الكلفة (صافي) · مدين <b>4426</b> ضريبة المشتريات · دائن <b>401</b> الموردون (المجموع).</li></ul>`)),
    parts: [
      {
        id: 'match', title: L('Match the trucker’s invoice', 'طابق فاتورة الناقل البري'),
        render(ctx, b) {
          const d = ctx.d, tr = d.sup.find((v) => v.vendor === 'trucker');
          if (!tr) { b.innerHTML = `<p class="muted">${t(L('No trucking invoice on this job.', 'لا فاتورة نقل بري في هذه العملية.'))}</p><button class="btn primary" id="ok">OK</button>`; b.querySelector('#ok').onclick = () => ctx.finish('match'); return; }
          const pre = `<div class="email-preview"><b>${esc(tr.name)}</b> — invoice ${esc(tr.no)}<br>${tr.lines.map((l) => `${esc(l.desc)}: USD ${TS.num(l.amount)}`).join('<br>')}<br><b>Waiting time 2 hrs: USD 20.00</b><br>VAT 11%: USD ${TS.num((tr.net + 20) * ACC.VAT)}<br><b>Total: USD ${TS.num((tr.net + 20) * (1 + ACC.VAT))}</b></div><p>${t(L('Job costing (agreed with Operations)', 'كلفة العملية (المتفق عليها مع العمليات)'))}: USD ${TS.num(tr.net)} + VAT. ${t(L('Nothing in the file mentions waiting time.', 'لا شيء في الملف يذكر وقت انتظار.'))}</p>`;
          ui().choice(ctx, b, {
            key: 'mt', pre, q: L('What do you do?', 'ماذا تفعل؟'),
            options: [
              { l: L('Put the invoice on hold and ask the trucker for proof or a credit note of USD 20 + VAT', 'أوقف الفاتورة واطلب من الناقل إثباتًا أو إشعارًا دائنًا بـ20 دولار + الضريبة'), ok: true },
              { l: L('Approve and pay — it is only USD 22', 'اعتمد وادفع — فقط 22 دولار'), ok: false, fb: L('Small unexplained amounts add up to real losses over hundreds of jobs.', 'المبالغ الصغيرة غير المبرّرة تتراكم خسائر حقيقية على مئات العمليات.') },
              { l: L('Add USD 20 to the client’s invoice', 'أضف 20 دولار على فاتورة الزبون'), ok: false, fb: L('You cannot rebill a cost that is not justified or agreed.', 'لا يمكن إعادة فوترة كلفة غير مبرّرة أو غير متفق عليها.') },
            ],
            onSuccess: () => {
              ctx.send({ to: tr.email, subject: L('Invoice ' + tr.no + ' on hold', 'الفاتورة ' + tr.no + ' موقوفة'), body: L('Waiting time is not in our order and no waiting was reported. Please issue a credit note for USD 20 + VAT.', 'وقت الانتظار غير وارد في أمرنا ولم يُبلَّغ عن انتظار. يرجى إصدار إشعار دائن بـ20 دولار + الضريبة.') });
              ctx.receive({ from: tr.email, subject: L('Credit note CN-' + tr.no, 'إشعار دائن CN-' + tr.no), body: L('Apologies, waiting time charged by mistake. Credit note attached: USD 20.00 + VAT 2.20.', 'نعتذر، احتُسب وقت الانتظار خطأً. مرفق إشعار دائن: 20 دولار + ضريبة 2.20.'), attachments: ['CN-' + tr.no + '.pdf'] }, 700);
              ctx.finish('match');
            },
          });
        },
      },
      {
        id: 'totals', title: L('Totals of the supplier invoices', 'مجاميع فواتير المورّدين'),
        render(ctx, b) {
          const d = ctx.d;
          const wrap = document.createElement('div');
          wrap.innerHTML = `<p>${t(L('Approved supplier invoices (after the credit note). VAT 11% applies only to local services.', 'فواتير المورّدين المعتمدة (بعد الإشعار الدائن). الضريبة 11% فقط على الخدمات المحلية.'))}</p>` + ui().table([L('Supplier', 'المورّد'), L('Line', 'البند'), { l: 'USD', num: 1 }, 'VAT'], d.sup.flatMap((v) => v.lines.map((l) => `<tr><td>${esc(v.name)}</td><td>${esc(l.code)} — ${esc(l.desc)}</td><td class="num">${TS.num(l.amount)}</td><td>${l.vat ? '11%' : '—'}</td></tr>`)));
          b.appendChild(wrap);
          const f = document.createElement('div'); b.appendChild(f);
          ui().form(ctx, f, {
            key: 'pt',
            fields: [
              { k: 'net', label: L('Total cost (net)', 'مجموع الكلفة (صافي)'), unit: 'USD', type: 'number', tol: 0.5, ans: () => d.costNet },
              { k: 'vat', label: L('Total input VAT', 'مجموع ضريبة المشتريات'), unit: 'USD', type: 'number', tol: 0.1, ans: () => d.inVat },
              { k: 'tot', label: L('Total payable to suppliers', 'المجموع المستحق للمورّدين'), unit: 'USD', type: 'number', tol: 0.1, ans: () => d.payTotal },
            ],
            onSuccess: () => ctx.finish('totals'),
          });
        },
        summary: (ctx) => vendTbl(ctx.d),
      },
      {
        id: 'je', title: L('Purchases journal entry', 'قيد المشتريات'),
        render(ctx, b) {
          const d = ctx.d;
          ui().journal(ctx, b, { key: 'purch', ref: 'PUR-' + ctx.ship.id, narrative: L('Supplier invoices — job ' + ctx.ship.id, 'فواتير المورّدين — العملية ' + ctx.ship.id), expected: [{ acc: '604', dr: d.costNet }, { acc: '4426', dr: d.inVat }, { acc: '401', cr: d.payTotal }], onSuccess: () => ctx.finish('je') });
        },
      },
    ],
    quiz: [
      { q: L('Input VAT on a trucker’s invoice goes to…', 'ضريبة المشتريات على فاتورة الناقل تذهب إلى…'), o: [L('604 cost', '604 الكلفة'), L('4426 VAT recoverable', '4426 الضريبة القابلة للاسترداد')], a: 1 },
      { q: L('A supplier invoice is higher than agreed with no explanation. You…', 'فاتورة مورّد أعلى من المتفق عليه بلا تبرير. أنت…'), o: [L('Pay it', 'تدفعها'), L('Hold it and ask for a credit note / justification', 'توقفها وتطلب إشعارًا دائنًا / تبريرًا')], a: 1 },
    ],
  });

  /* ============================================================ 5. CASH: RECEIPTS, PAYMENTS, DEPOSIT */
  ACC.steps.push({
    id: 'cash',
    title: L('Receipts, payments & the container deposit', 'المقبوضات والمدفوعات وتأمين الحاوية'),
    sub: L('Record the money that moved through the bank — including the client’s deposit.', 'سجّل الأموال التي مرّت عبر المصرف — بما فيها تأمين الزبون.'),
    lesson: () => t(L(`
<h3>Receipts and payments</h3>
<ul><li>Client pays: <b>Dr 512 Bank / Cr 411 Customer</b>.</li><li>We pay a supplier: <b>Dr 401 Supplier / Cr 512 Bank</b>.</li></ul>
<h3>The container deposit (Lebanese practice)</h3>
<ol><li>Client gives the deposit: Dr 512 / Cr <b>4191</b> deposits received.</li><li>We lodge it with the line: Dr <b>4671</b> deposit with line / Cr 512.</li><li>The line deducts its D&D invoice (incl. VAT): Dr 401 line / Cr 4671.</li><li>The line refunds the rest: Dr 512 / Cr 4671 → 4671 is now zero.</li><li>We offset what the client still owes (411) and refund the balance: Dr 4191 / Cr 411 / Cr 512 → 4191 is now zero.</li></ol>
<p>None of this is revenue: the deposit only passes through third-party accounts.</p>`,
    `
<h3>المقبوضات والمدفوعات</h3>
<ul><li>الزبون يدفع: <b>مدين 512 المصرف / دائن 411 الزبون</b>.</li><li>ندفع لمورّد: <b>مدين 401 المورّد / دائن 512 المصرف</b>.</li></ul>
<h3>تأمين الحاوية (الممارسة اللبنانية)</h3>
<ol><li>الزبون يسلّم التأمين: مدين 512 / دائن <b>4191</b> تأمينات مقبوضة.</li><li>نودعه لدى الخط: مدين <b>4671</b> تأمين لدى الخط / دائن 512.</li><li>يحسم الخط فاتورة الغرامات (مع الضريبة): مدين 401 الخط / دائن 4671.</li><li>يعيد الخط الباقي: مدين 512 / دائن 4671 ← يصبح 4671 صفرًا.</li><li>نقاصّ ما يزال الزبون مدينًا به (411) ونعيد له الباقي: مدين 4191 / دائن 411 / دائن 512 ← يصبح 4191 صفرًا.</li></ol>
<p>لا شيء من هذا إيراد: التأمين يمرّ فقط في حسابات الغير.</p>`)),
    parts: [
      {
        id: 'rcpt', title: L('Customer receipt', 'مقبوضات الزبون'),
        render(ctx, b) {
          const d = ctx.d;
          ctx.advance(TS.addDays(d.invDate, 3));
          ui().journal(ctx, b, { key: 'rcpt', ref: 'RCPT-' + ctx.ship.id, narrative: L('Receipt from ' + ctx.ship.parties.client.name, 'مقبوض من ' + ctx.ship.parties.client.name), help: L(`The bank shows a transfer of ${money(d.paid)} from the client (paid before the D/O / B/L release).`, `يُظهر المصرف تحويلًا بقيمة ${TS.num(d.paid)} دولار من الزبون (دُفع قبل إذن التسليم / الإفراج عن البوليصة).`), expected: [{ acc: '512', dr: d.paid }, { acc: '411', cr: d.paid }], onSuccess: () => ctx.finish('rcpt') });
        },
      },
      {
        id: 'pay', title: L('Supplier payments', 'دفعات المورّدين'),
        render(ctx, b) {
          const d = ctx.d;
          const lines = d.sup.map((v) => `${v.name}: ${money(v.vendor === 'carrier' ? d.carrierByBank : v.total)}`).join('\n');
          ui().journal(ctx, b, { key: 'pay', ref: 'PAY-' + ctx.ship.id, narrative: L('Payments to suppliers — job ' + ctx.ship.id, 'دفعات للمورّدين — العملية ' + ctx.ship.id), help: L(`Bank transfers made:\n${lines}${d.deposit && d.ddIncl ? `\n(The line’s D&D invoice ${money(d.ddIncl)} is not paid by bank — it is deducted from the deposit in part C.)` : ''}`, `التحويلات المصرفية:\n${lines}${d.deposit && d.ddIncl ? `\n(فاتورة الغرامات ${TS.num(d.ddIncl)} لا تُدفع بالمصرف — تُحسم من التأمين في الجزء C.)` : ''}`), expected: [{ acc: '401', dr: d.supByBank }, { acc: '512', cr: d.supByBank }], onSuccess: () => ctx.finish('pay') });
        },
      },
      {
        id: 'dep', title: L('Container deposit lifecycle', 'دورة تأمين الحاوية'),
        render(ctx, b) {
          const d = ctx.d;
          if (!d.deposit) { b.innerHTML = `<p class="muted">${t(L('No container deposit on this job (export — the line releases the box against the booking).', 'لا تأمين حاوية في هذه العملية (تصدير — يفرج الخط عن الحاوية بموجب الحجز).'))}</p><button class="btn primary" id="ok">OK</button>`; b.querySelector('#ok').onclick = () => ctx.finish('dep'); return; }
          ui().journal(ctx, b, {
            key: 'dep', ref: 'DEP-' + ctx.ship.id, narrative: L('Container deposit — received, lodged, settled, refunded', 'تأمين الحاوية — قبض، إيداع، تسوية، استرداد'),
            help: L(`Enter the five movements (one line per account and side):\n1) Client gave deposit ${money(d.deposit)}\n2) Deposit lodged with ${d.carrier.name}: ${money(d.deposit)}\n3) Line deducted its D&D invoice incl. VAT: ${money(d.ddIncl)}\n4) Line refunded: ${money(d.lineRefund)}\n5) Client’s balance ${money(d.balance)} offset; refunded to client: ${money(d.clientRefund)}`, `أدخل الحركات الخمس (سطر لكل حساب وجهة):\n1) سلّم الزبون التأمين ${TS.num(d.deposit)}\n2) أُودع التأمين لدى ${d.carrier.name}: ${TS.num(d.deposit)}\n3) حسم الخط فاتورة الغرامات مع الضريبة: ${TS.num(d.ddIncl)}\n4) أعاد الخط: ${TS.num(d.lineRefund)}\n5) قوصّ رصيد الزبون ${TS.num(d.balance)}؛ وأُعيد للزبون: ${TS.num(d.clientRefund)}`),
            expected: [{ acc: '512', dr: d.deposit }, { acc: '4191', cr: d.deposit }, { acc: '4671', dr: d.deposit }, { acc: '512', cr: d.deposit }, { acc: '401', dr: d.ddIncl }, { acc: '4671', cr: d.ddIncl }, { acc: '512', dr: d.lineRefund }, { acc: '4671', cr: d.lineRefund }, { acc: '4191', dr: d.deposit }, { acc: '411', cr: d.balance }, { acc: '512', cr: d.clientRefund }],
            onSuccess: () => ctx.finish('dep'),
          });
        },
      },
    ],
    quiz: [
      { q: L('After the deposit is fully settled, the balance of 4671 should be…', 'بعد تسوية التأمين بالكامل يجب أن يكون رصيد 4671…'), o: [L('Equal to the deposit', 'مساويًا للتأمين'), L('Zero', 'صفرًا')], a: 1 },
      { q: L('Paying a supplier: which entry?', 'الدفع لمورّد: أي قيد؟'), o: [L('Dr 512 / Cr 401', 'مدين 512 / دائن 401'), L('Dr 401 / Cr 512', 'مدين 401 / دائن 512')], a: 1 },
    ],
  });

  /* ============================================================ 6. BANK RECONCILIATION */
  ACC.steps.push({
    id: 'bank',
    title: L('Bank reconciliation', 'التسوية المصرفية'),
    sub: L('Compare the bank statement with the books, explain the differences and correct the books.', 'قارن كشف المصرف مع الدفاتر، فسّر الفروقات وصحّح الدفاتر.'),
    lesson: () => t(L(`
<h3>Why reconcile</h3>
<p>The bank statement and your account 512 rarely show the same balance on the same day. Reconciling proves every difference is explained — and catches errors and fraud.</p>
<h3>Typical differences</h3>
<ul><li><b>In the books, not yet in the bank:</b> payments issued but not cleared (outstanding cheques/transfers), deposits in transit. → No entry; they will clear.</li><li><b>In the bank, not yet in the books:</b> bank charges, interest, direct debits, unidentified receipts. → Post them in the books.</li></ul>
<p>Adjusted book balance = book balance − bank charges (+ items to add). Adjusted bank balance = statement balance − outstanding payments (+ deposits in transit). They must be equal.</p>`,
    `
<h3>لماذا التسوية</h3>
<p>نادرًا ما يُظهر كشف المصرف وحسابك 512 الرصيد نفسه في اليوم نفسه. التسوية تثبت أن كل فرق مفسَّر — وتكشف الأخطاء والاحتيال.</p>
<h3>الفروقات المعتادة</h3>
<ul><li><b>في الدفاتر وليس بعد في المصرف:</b> دفعات صادرة لم تُصرف بعد (شيكات/تحويلات معلّقة)، إيداعات في الطريق. ← لا قيد؛ ستُصرف.</li><li><b>في المصرف وليس بعد في الدفاتر:</b> عمولات مصرفية، فوائد، اقتطاعات مباشرة، مقبوضات غير معروفة. ← رحّلها في الدفاتر.</li></ul>
<p>رصيد الدفاتر المعدّل = رصيد الدفاتر − العمولات (+ ما يُضاف). رصيد المصرف المعدّل = رصيد الكشف − الدفعات المعلّقة (+ الإيداعات في الطريق). يجب أن يتساويا.</p>`)),
    parts: [
      {
        id: 'rec', title: L('Reconcile the statement', 'سوِّ الكشف'),
        render(ctx, b) {
          const d = ctx.d;
          let run = ACC.OPENING_BANK;
          const wrap = document.createElement('div');
          wrap.innerHTML = `<h4>${t(L('Bank statement — USD current account', 'كشف المصرف — حساب جارٍ بالدولار'))}</h4>` + ui().table([L('Date', 'التاريخ'), L('Description', 'البيان'), { l: L('Amount', 'المبلغ'), num: 1 }, { l: L('Balance', 'الرصيد'), num: 1 }], [`<tr><td></td><td>${t(L('Opening balance', 'الرصيد الافتتاحي'))}</td><td></td><td class="num">${TS.num(run)}</td></tr>`].concat(d.stmt.map((m) => { run = R(run + m.amt); return `<tr><td>${TS.fmtDate(m.date, false)}</td><td>${esc(m.txt)}</td><td class="num">${TS.num(m.amt)}</td><td class="num">${TS.num(run)}</td></tr>`; }))) + `<p>${t(L('Book balance of 512 (see Ledger)', 'رصيد الدفاتر لحساب 512 (انظر الأستاذ)'))}: <b>${money(ACC.bal(ctx.ship, '512'))}</b></p>`;
          b.appendChild(wrap);
          const f = document.createElement('div'); b.appendChild(f);
          ui().form(ctx, f, {
            key: 'rec',
            fields: [
              { k: 'st', label: L('Statement closing balance', 'رصيد الكشف الختامي'), unit: 'USD', type: 'number', tol: 0.05, ans: () => d.stmtBal },
              { k: 'bk', label: L('Book balance (512)', 'رصيد الدفاتر (512)'), unit: 'USD', type: 'number', tol: 0.05, ans: () => d.bookBal },
              { k: 'chg', label: L('In the bank, not in the books (charges)', 'في المصرف وليس في الدفاتر (عمولات)'), unit: 'USD', type: 'number', tol: 0.05, ans: () => d.bankCharges },
              { k: 'out', label: L('In the books, not yet in the bank (outstanding payment)', 'في الدفاتر وليس بعد في المصرف (دفعة معلّقة)'), unit: 'USD', type: 'number', tol: 0.05, ans: () => d.outstanding, help: L('Which supplier payment does not appear on the statement?', 'أي دفعة مورّد لا تظهر في الكشف؟') },
              { k: 'adj', label: L('Reconciled balance', 'الرصيد بعد التسوية'), unit: 'USD', type: 'number', tol: 0.05, ans: () => R(d.bookBal - d.bankCharges) },
            ],
            onSuccess: () => { A(ctx.ship).docs.bankRec = { statement: d.stmtBal, book: d.bookBal, charges: d.bankCharges, outstanding: d.outstanding, reconciled: R(d.bookBal - d.bankCharges) }; ctx.finish('rec'); },
          });
        },
      },
      {
        id: 'je', title: L('Post the bank charges', 'رحّل العمولات المصرفية'),
        render(ctx, b) { ctx.advance(TS.addDays(ctx.d.invDate, 4)); ui().journal(ctx, b, { key: 'bankchg', ref: 'BNK-' + ctx.ship.id, narrative: L('Bank charges per statement', 'عمولات مصرفية حسب الكشف'), expected: [{ acc: '627', dr: ctx.d.bankCharges }, { acc: '512', cr: ctx.d.bankCharges }], onSuccess: () => ctx.finish('je') }); },
      },
    ],
    quiz: [
      { q: L('A cheque you issued has not been cashed yet. Do you post an entry?', 'شيك أصدرته لم يُصرف بعد. هل ترحّل قيدًا؟'), o: [L('Yes, reverse it', 'نعم، اعكسه'), L('No — it is a timing difference', 'لا — فرق توقيت')], a: 1 },
      { q: L('Bank charges on the statement not in the books →', 'عمولات في الكشف وليست في الدفاتر ←'), o: [L('Dr 627 / Cr 512', 'مدين 627 / دائن 512'), L('Dr 512 / Cr 627', 'مدين 512 / دائن 627')], a: 0 },
    ],
  });

  /* ============================================================ 7. VAT RETURN */
  ACC.steps.push({
    id: 'vat',
    title: L('VAT return (Ministry of Finance)', 'التصريح الضريبي (وزارة المالية)'),
    sub: L('Compute VAT payable for the period, clear the VAT accounts and pay the State.', 'احسب الضريبة المستحقة للفترة، أقفل حسابات الضريبة وادفع للدولة.'),
    lesson: () => t(L(`
<h3>Output minus input</h3>
<p>VAT payable = VAT collected on sales (4427) − VAT recoverable on purchases (4426). If input is higher, you have a VAT credit to carry forward.</p>
<h3>Period and deadline</h3>
<p>Lebanese VAT returns are generally filed per quarter, with payment within 20 days after the quarter end (check your company’s filing frequency and the current rules). Late filing and late payment carry penalties.</p>
<h3>Entries</h3>
<ul><li>Return: Dr 4427 (output) / Cr 4426 (input) / Cr 4424 VAT payable.</li><li>Payment: Dr 4424 / Cr 512.</li></ul>
<p>In real life the return covers <b>all</b> the company’s sales and purchases of the period; here you prepare it for this job only.</p>`,
    `
<h3>المخرجات ناقص المدخلات</h3>
<p>الضريبة المستحقة = الضريبة المحصّلة على المبيعات (4427) − الضريبة القابلة للاسترداد على المشتريات (4426). إذا كانت المدخلات أعلى، لديك رصيد ضريبي يُدوَّر.</p>
<h3>الفترة والمهلة</h3>
<p>تُقدَّم التصاريح الضريبية في لبنان عمومًا فصليًا، مع الدفع خلال 20 يومًا بعد نهاية الفصل (تحقّق من وتيرة شركتك والقواعد الحالية). التأخير في التصريح أو الدفع يستوجب غرامات.</p>
<h3>القيود</h3>
<ul><li>التصريح: مدين 4427 / دائن 4426 / دائن 4424 ضريبة مستحقة.</li><li>الدفع: مدين 4424 / دائن 512.</li></ul>
<p>في الواقع يشمل التصريح <b>كل</b> مبيعات ومشتريات الشركة في الفترة؛ هنا تحضّره لهذه العملية فقط.</p>`)),
    parts: [
      {
        id: 'calc', title: L('Prepare the return', 'حضّر التصريح'),
        render(ctx, b) {
          const d = ctx.d;
          ui().form(ctx, b, {
            key: 'vr', intro: L(`Invoice date ${TS.fmtDate(d.invDate)}. Quarterly filing.`, `تاريخ الفاتورة ${TS.fmtDate(d.invDate)}. تصريح فصلي.`),
            fields: [
              { k: 'qe', label: L('End of the VAT period (quarter)', 'نهاية الفترة الضريبية (الفصل)'), type: 'date', ans: () => d.qEnd },
              { k: 'out', label: L('Output VAT (4427)', 'الضريبة على المبيعات (4427)'), unit: 'USD', type: 'number', tol: 0.05, ans: () => d.outVat },
              { k: 'in', label: L('Input VAT (4426)', 'الضريبة على المشتريات (4426)'), unit: 'USD', type: 'number', tol: 0.05, ans: () => d.inVat },
              { k: 'net', label: L('Net VAT payable', 'صافي الضريبة المستحقة'), unit: 'USD', type: 'number', tol: 0.05, ans: () => d.netVat },
              { k: 'lbp', label: L('Net VAT in LBP (@ 89,500)', 'صافي الضريبة بالليرة (@ 89,500)'), unit: 'LBP', type: 'number', tol: 5000, ans: () => Math.round(d.netVat * ACC.LBP_RATE) },
              { k: 'due', label: L('Payment deadline', 'مهلة الدفع'), type: 'date', ans: () => d.vatDue, help: L('20 days after the end of the quarter.', '20 يومًا بعد نهاية الفصل.') },
            ],
            onSuccess: () => { A(ctx.ship).docs.vatReturn = { periodEnd: d.qEnd, output: d.outVat, input: d.inVat, net: d.netVat, netLBP: Math.round(d.netVat * ACC.LBP_RATE), due: d.vatDue }; ctx.finish('calc'); },
          });
        },
      },
      {
        id: 'je', title: L('Clear the VAT accounts', 'أقفل حسابات الضريبة'),
        render(ctx, b) { const d = ctx.d; ui().journal(ctx, b, { key: 'vatret', ref: 'VAT-' + d.qEnd, narrative: L('VAT return — period ending ' + d.qEnd, 'التصريح الضريبي — الفترة المنتهية ' + d.qEnd), expected: [{ acc: '4427', dr: d.outVat }, { acc: '4426', cr: d.inVat }, { acc: '4424', cr: d.netVat }], onSuccess: () => ctx.finish('je') }); },
      },
      {
        id: 'pay', title: L('Pay the Ministry of Finance', 'ادفع لوزارة المالية'),
        render(ctx, b) { const d = ctx.d; ctx.advance(d.vatDue); ui().journal(ctx, b, { key: 'vatpay', ref: 'VATPAY-' + d.qEnd, narrative: L('VAT payment to the Ministry of Finance', 'دفع الضريبة لوزارة المالية'), expected: [{ acc: '4424', dr: d.netVat }, { acc: '512', cr: d.netVat }], onSuccess: () => ctx.finish('pay') }); },
      },
    ],
    quiz: [
      { q: L('Output VAT 500, input VAT 180. VAT payable?', 'ضريبة المبيعات 500، المشتريات 180. المستحق؟'), o: ['680', '320', '180'], a: 1 },
      { q: L('Quarter ends 31 March. Payment deadline (20 days)?', 'ينتهي الفصل في 31 آذار. مهلة الدفع (20 يومًا)؟'), o: [L('20 March', '20 آذار'), L('20 April', '20 نيسان'), L('31 April', '31 نيسان')], a: 1 },
    ],
  });

  /* ============================================================ 8. CLOSE */
  ACC.steps.push({
    id: 'close',
    title: L('Job P&L, trial balance & close', 'نتيجة العملية، ميزان المراجعة والإقفال'),
    sub: L('Prove the books are clean for this job and close it.', 'أثبت أن الدفاتر نظيفة لهذه العملية وأقفلها.'),
    lesson: () => t(L(`
<h3>Job result</h3>
<p>Revenue (706) − cost of sales (604) − directly related expenses (bank charges 627) = job contribution. Compare with the profit Operations quoted.</p>
<h3>Clean third-party accounts</h3>
<p>When a job is finished, its customer (411), supplier (401), deposit (4191/4671) and VAT (4424) balances must be zero. A non-zero balance means money still to collect, to pay, to refund — or an error.</p>
<h3>Trial balance</h3>
<p>Total debit balances = total credit balances. It does not prove every entry is right, but an unbalanced trial balance always means an error.</p>`,
    `
<h3>نتيجة العملية</h3>
<p>الإيراد (706) − كلفة المبيعات (604) − المصاريف المرتبطة مباشرة (عمولات مصرفية 627) = مساهمة العملية. قارنها بالربح الذي قدّرته العمليات.</p>
<h3>حسابات الغير نظيفة</h3>
<p>عندما تنتهي العملية يجب أن تكون أرصدة الزبون (411) والمورّدين (401) والتأمينات (4191/4671) والضريبة (4424) صفرًا. الرصيد غير الصفري يعني أموالًا ما زالت للتحصيل أو الدفع أو الإعادة — أو خطأ.</p>
<h3>ميزان المراجعة</h3>
<p>مجموع الأرصدة المدينة = مجموع الأرصدة الدائنة. لا يثبت أن كل قيد صحيح، لكن الميزان غير المتوازن يعني دائمًا وجود خطأ.</p>`)),
    parts: [
      {
        id: 'pl', title: L('Job profit & loss', 'نتيجة العملية'),
        render(ctx, b) {
          const s = ctx.ship;
          ui().form(ctx, b, {
            key: 'pl', intro: L('Read the balances in Ledger & trial balance.', 'اقرأ الأرصدة في الأستاذ وميزان المراجعة.'),
            fields: [
              { k: 'r', label: L('Revenue (706)', 'الإيرادات (706)'), unit: 'USD', type: 'number', tol: 0.05, ans: () => -ACC.bal(s, '706') },
              { k: 'c', label: L('Cost of sales (604)', 'كلفة المبيعات (604)'), unit: 'USD', type: 'number', tol: 0.05, ans: () => ACC.bal(s, '604') },
              { k: 'b', label: L('Bank charges (627)', 'عمولات مصرفية (627)'), unit: 'USD', type: 'number', tol: 0.05, ans: () => ACC.bal(s, '627') },
              { k: 'n', label: L('Job contribution', 'مساهمة العملية'), unit: 'USD', type: 'number', tol: 0.05, ans: () => R(-ACC.bal(s, '706') - ACC.bal(s, '604') - ACC.bal(s, '627')) },
            ],
            onSuccess: (v) => { A(s).result = { revenue: v.r, cost: v.c, bankCharges: v.b, contribution: v.n, quotedProfit: ctx.d.quotedProfit }; ctx.finish('pl'); },
          });
        },
      },
      {
        id: 'zero', title: L('Which accounts must now be zero?', 'أي حسابات يجب أن تكون صفرًا الآن؟'),
        render(ctx, b) {
          const s = ctx.ship, d = ctx.d;
          const accs = ['411', '401', '4424', '512', '706'].concat(d.deposit ? ['4191', '4671'] : []);
          const mustZero = ['411', '401', '4424', '4191', '4671'];
          const pre = ui().table([L('Account', 'الحساب'), { l: L('Balance', 'الرصيد'), num: 1 }], accs.map((n) => `<tr><td>${n} ${esc(t(ACC.acc(n).name))}</td><td class="num">${TS.num(ACC.bal(s, n))}</td></tr>`));
          ui().choice(ctx, b, {
            key: 'zr', multi: true, pre, q: L('Tick the accounts that must be zero for a fully settled job.', 'اختر الحسابات التي يجب أن تكون صفرًا لعملية مسوّاة بالكامل.'),
            options: accs.map((n) => ({ l: L(n + ' — ' + ACC.acc(n).name.en, n + ' — ' + ACC.acc(n).name.ar), ok: mustZero.includes(n), fb: mustZero.includes(n) ? null : L('This account keeps a balance (bank money / revenue of the year).', 'هذا الحساب يحتفظ برصيد (أموال المصرف / إيرادات السنة).') })),
            onSuccess: () => {
              const bad = mustZero.filter((n) => accs.includes(n) && Math.abs(ACC.bal(s, n)) > 0.05);
              if (bad.length) { TS.toast(t(L('These accounts are not zero yet: ', 'هذه الحسابات ليست صفرًا بعد: ')) + bad.join(', '), 'bad'); return; }
              ctx.finish('zero');
            },
          });
        },
      },
      {
        id: 'close', title: L('Close the job', 'أقفل العملية'),
        render(ctx, b) {
          const s = ctx.ship;
          b.innerHTML = `<p>${t(L('Closing marks the hand-off as closed in the shipment JSON. The journal, invoice, reconciliation and VAT return stay in the file.', 'الإقفال يسجّل التسليم كمقفل في ملف JSON. يبقى دفتر اليومية والفاتورة والتسوية والتصريح الضريبي في الملف.'))}</p><button class="btn primary" id="go">${t(L('Close job in Accounting', 'أقفل العملية في المحاسبة'))} ✓</button>`;
          b.querySelector('#go').onclick = () => {
            s.handoffs.accounting.status = 'closed (accounting)';
            s.handoffs.accounting.closedAt = new Date().toISOString();
            s.status = 'archived'; s.currentDepartment = 'archive';
            ctx.finish('close');
          };
        },
        summary: (ctx) => {
          const sc = A(ctx.ship).score, score = Math.max(0, 100 - sc.mistakes * 2 - sc.hints * 3);
          return `<div class="note ok"><strong>🎓 ${t(L('Job closed in Accounting!', 'أُقفلت العملية في المحاسبة!'))}</strong>${t(L('Mistakes', 'الأخطاء'))}: ${sc.mistakes} · ${t(L('Answers shown', 'إجابات معروضة'))}: ${sc.hints} · <b>${t(L('Score', 'النتيجة'))}: ${score}/100</b></div><button class="btn primary" onclick="TS.downloadJSON(ACC.app.ship)">⬇ ${esc(ctx.ship.id)}.json</button>`;
        },
      },
    ],
    quiz: [
      { q: L('Account 411 still shows USD 99.90 debit after closing. It means…', 'الحساب 411 ما زال مدينًا بـ99.90 بعد الإقفال. يعني…'), o: [L('Extra profit', 'ربح إضافي'), L('The client still owes us money (or an entry is missing)', 'الزبون ما زال مدينًا لنا (أو قيد ناقص)')], a: 1 },
      { q: L('A balanced trial balance proves…', 'ميزان المراجعة المتوازن يثبت…'), o: [L('All entries are correct', 'أن كل القيود صحيحة'), L('Debits equal credits — not that every entry is right', 'أن المدين يساوي الدائن — لا أن كل قيد صحيح')], a: 1 },
    ],
  });

})();
