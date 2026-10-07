/* Accounting module — chart of accounts, Lebanon accounting guide, and figures derived from the shipment JSON */
(function () {
  const L = TS.L, R = TS.round2;
  const ACC = (window.ACC = window.ACC || {});

  ACC.company = { name: 'Phoenicia Freight Training SAL', email: 'accounting@phoenicia-freight.test', vat: '3001234-601' };
  ACC.VAT = 0.11;
  ACC.OPENING_BANK = 25000;
  ACC.LBP_RATE = 89500; // sample rate for training

  /* Simplified chart of accounts — numbering follows the logic (classes 1–7) of the Lebanese general chart of accounts; indicative only */
  ACC.coa = [
    { n: '101', c: 1, name: L('Share capital', 'رأس المال') },
    { n: '21', c: 2, name: L('Fixed assets (equipment, vehicles)', 'الأصول الثابتة (معدّات، آليات)') },
    { n: '401', c: 4, name: L('Suppliers (accounts payable)', 'الموردون (ذمم دائنة)') },
    { n: '411', c: 4, name: L('Customers (accounts receivable)', 'الزبائن (ذمم مدينة)') },
    { n: '4191', c: 4, name: L('Deposits received from customers', 'تأمينات مقبوضة من الزبائن') },
    { n: '4424', c: 4, name: L('VAT payable to the Ministry of Finance', 'ضريبة القيمة المضافة المستحقة لوزارة المالية') },
    { n: '4426', c: 4, name: L('VAT recoverable on purchases (input VAT)', 'ضريبة القيمة المضافة القابلة للاسترداد على المشتريات') },
    { n: '4427', c: 4, name: L('VAT collected on sales (output VAT)', 'ضريبة القيمة المضافة المحصّلة على المبيعات') },
    { n: '4671', c: 4, name: L('Deposits paid to shipping lines', 'تأمينات مدفوعة للخطوط الملاحية') },
    { n: '512', c: 5, name: L('Bank — USD current account', 'المصرف — حساب جارٍ بالدولار') },
    { n: '53', c: 5, name: L('Cash', 'الصندوق') },
    { n: '601', c: 6, name: L('Purchases of goods', 'مشتريات البضائع') },
    { n: '604', c: 6, name: L('Purchased freight & transport services (cost of sales)', 'خدمات الشحن والنقل المشتراة (كلفة المبيعات)') },
    { n: '627', c: 6, name: L('Bank charges', 'عمولات ومصاريف مصرفية') },
    { n: '641', c: 6, name: L('Salaries', 'الرواتب') },
    { n: '706', c: 7, name: L('Freight & forwarding services revenue', 'إيرادات خدمات الشحن والتخليص') },
    { n: '707', c: 7, name: L('Sales of goods', 'مبيعات البضائع') },
  ];
  ACC.acc = (n) => ACC.coa.find((a) => a.n === n);
  ACC.classNames = { 1: L('Capital', 'الأموال الدائمة'), 2: L('Fixed assets', 'الأصول الثابتة'), 4: L('Third parties', 'حسابات الغير'), 5: L('Financial', 'الحسابات المالية'), 6: L('Expenses', 'الأعباء'), 7: L('Revenues', 'الإيرادات') };

  ACC.vendorNames = {
    carrier: (s) => (s.booking ? s.booking.carrierName + (s.booking.consol ? ' — Beirut office' : ' — Beirut agency') : 'Shipping line'),
    agent: (s) => (s.case && s.case.agent ? s.case.agent.name : 'Overseas agent'),
    broker: () => 'Khoury Clearance SARL (licensed customs broker)',
    trucker: () => 'Al Amal Transport SARL',
    insurer: () => 'Cedar Marine Insurance SAL',
    chamber: () => 'Chamber of Commerce, Industry & Agriculture (Lebanon)',
  };
  ACC.vendorEmail = { carrier: 'agency.beirut@line-training.test', broker: 'accounts@khoury-clearance.test', trucker: 'dispatch@alamal-transport.test', insurer: 'finance@cedar-marine.test', chamber: 'services@cciaz.test' };

  const seed = (s) => s.id.split('').reduce((a, c) => (a * 31 + c.charCodeAt(0)) % 999983, 7);
  ACC.seed = seed;

  /* every figure the accounting steps need, derived from the shipment file */
  ACC.d = (s) => {
    const pack = s.handoffs.accounting.pack, inv = pack.invoice;
    const imp = s.direction === 'import';
    const ql = s.quotation.lines;
    const vatOf = (code) => code === 'DD' || code === 'STO' || (code !== 'WMA' && !!(ql.find((l) => l.code === code) || {}).vat);
    const exempt = R(inv.lines.filter((l) => !l.vat).reduce((a, l) => a + l.amount, 0));
    const taxable = R(inv.lines.filter((l) => l.vat).reduce((a, l) => a + l.amount, 0));
    const revenue = R(exempt + taxable), outVat = R(taxable * ACC.VAT), total = R(revenue + outVat);

    const vend = {};
    pack.payables.forEach((p) => {
      const v = (vend[p.vendor] = vend[p.vendor] || { vendor: p.vendor, name: (ACC.vendorNames[p.vendor] || (() => p.vendorName || p.vendor))(s), email: p.vendor === 'agent' && s.case ? s.case.agent.email : ACC.vendorEmail[p.vendor] || '', foreign: p.vendor === 'agent', lines: [] });
      v.lines.push({ code: p.code, desc: p.desc, amount: p.amount, vat: vatOf(p.code) });
    });
    const sup = Object.values(vend).map((v, i) => {
      const net = R(v.lines.reduce((a, l) => a + l.amount, 0));
      const vat = R(v.lines.filter((l) => l.vat).reduce((a, l) => a + l.amount, 0) * ACC.VAT);
      return Object.assign(v, { no: v.vendor.slice(0, 3).toUpperCase() + '-' + (seed(s) % 9000 + 1000 + i * 7), net, vat, total: R(net + vat) });
    });
    const costNet = R(sup.reduce((a, v) => a + v.net, 0)), inVat = R(sup.reduce((a, v) => a + v.vat, 0)), payTotal = R(costNet + inVat);

    const disb = (pack.disbursements || []).find((x) => x.type === 'container_deposit');
    const ddNet = R((s.dd && s.dd.destination && disb ? s.dd.destination.cost : 0) || 0);
    const ddIncl = R(ddNet * (1 + ACC.VAT));
    const deposit = disb ? disb.amount : 0;
    const lineRefund = R(deposit - (deposit ? ddIncl : 0));
    const paid = R(pack.receivables[0].paidAmount || 0);
    const balance = R(total - paid);
    const clientRefund = R(deposit - (deposit ? balance : 0));
    /* no deposit to offset: the client pays the balance (storage / D&D / W/M rebilled after release) by a second transfer */
    const extraRcpt = deposit ? 0 : Math.max(0, balance), received = R(paid + extraRcpt);
    const carrier = sup.find((v) => v.vendor === 'carrier');
    const broker = sup.find((v) => v.vendor === 'broker');
    const carrierByBank = carrier ? R(carrier.total - (deposit ? ddIncl : 0)) : 0;
    const supByBank = R(payTotal - (deposit ? ddIncl : 0));
    const bankCharges = 18;
    const outstanding = broker ? broker.total : 0;

    const startDate = s.handoffs.accounting.sentSim;
    const invDate = startDate;
    const q = Math.floor((Number(invDate.slice(5, 7)) - 1) / 3);
    const qEnd = new Date(Date.UTC(Number(invDate.slice(0, 4)), q * 3 + 3, 0)).toISOString().slice(0, 10);
    const vatDue = TS.addDays(qEnd, 20);

    /* bank account movements in the books (512) */
    const mv = [];
    const d0 = (s.release && s.release.clientPaidOn) || startDate;
    mv.push({ date: d0, txt: 'Receipt ' + s.parties.client.name + ' (against arrival notice / invoice)', amt: paid });
    if (extraRcpt) mv.push({ date: TS.addDays(startDate, 2), txt: 'Receipt ' + s.parties.client.name + ' — balance of the final invoice', amt: extraRcpt });
    if (deposit) {
      mv.push({ date: d0, txt: 'Container deposit received from ' + s.parties.client.name, amt: deposit });
      mv.push({ date: (s.release && s.release.doDate) || d0, txt: 'Container deposit paid to ' + carrier.name, amt: -deposit });
    }
    sup.forEach((v) => mv.push({ date: TS.addDays(startDate, 2), txt: 'Payment ' + v.name + ' inv. ' + v.no, amt: -(v.vendor === 'carrier' ? carrierByBank : v.total), vendor: v.vendor }));
    if (deposit) {
      mv.push({ date: TS.addDays(startDate, 3), txt: 'Deposit refund from ' + carrier.name + (ddIncl ? ' (D&D ' + TS.num(ddIncl) + ' deducted)' : ''), amt: lineRefund });
      mv.push({ date: TS.addDays(startDate, 3), txt: 'Deposit balance refunded to ' + s.parties.client.name, amt: -clientRefund });
    }
    const bookMoves = R(mv.reduce((a, m) => a + m.amt, 0));
    const bookBal = R(ACC.OPENING_BANK + bookMoves);
    const stmt = mv.filter((m) => m.vendor !== 'broker').concat([{ date: TS.addDays(startDate, 3), txt: 'Bank charges — transfer & SWIFT fees', amt: -bankCharges, bank: true }]);
    const stmtBal = R(ACC.OPENING_BANK + stmt.reduce((a, m) => a + m.amt, 0));

    return {
      imp, inv, exempt, taxable, revenue, outVat, total, extraRcpt, received, sup, costNet, inVat, payTotal, deposit, ddNet, ddIncl, lineRefund, paid, balance, clientRefund,
      carrier, broker, carrierByBank, supByBank, bankCharges, outstanding, invDate, qEnd, vatDue, mv, stmt, bookBal, stmtBal,
      netVat: R(outVat - inVat), profit: R(revenue - costNet), profitAfterBank: R(revenue - costNet - bankCharges),
      quotedProfit: pack.quotedProfit, invNo: 'PFT/' + invDate.slice(0, 4) + '/' + String(seed(s) % 900 + 100).padStart(5, '0'),
    };
  };

  /* ---------------- Lebanon accounting guide ---------------- */
  ACC.guide = [
    {
      h: L('1. Accounting in a forwarding company', '١. المحاسبة في شركة شحن'),
      b: L(`<ul><li>Every shipment is a <b>job</b> with its own revenue and costs. Accounting checks that every cost has been sold, every invoice is issued and every payment is collected.</li><li><b>Accrual basis:</b> revenue and costs are recorded when the service is performed, not when cash moves. Supplier invoices that arrive late are <b>accrued</b> at month end.</li><li><b>Disbursements</b> (duties, VAT on goods, deposits paid on behalf of a client) are not revenue: they go through third-party accounts (class 4).</li><li>Key controls: job costing, supplier invoice matching, credit control (customer aging), bank reconciliation, VAT return.</li></ul>`,
        `<ul><li>كل شحنة هي <b>عملية</b> لها إيراداتها وكلفها. تتحقّق المحاسبة من أن كل كلفة قد بيعت، وكل فاتورة صدرت، وكل دفعة حُصّلت.</li><li><b>أساس الاستحقاق:</b> تُسجَّل الإيرادات والكلف عند تنفيذ الخدمة لا عند حركة النقد. فواتير المورّدين المتأخرة <b>تُقيَّد كمستحقات</b> في آخر الشهر.</li><li><b>السُلف</b> (الرسوم، ضريبة البضاعة، التأمينات المدفوعة عن الزبون) ليست إيرادًا: تمرّ في حسابات الغير (الفئة 4).</li><li>الضوابط الأساسية: كلفة العملية، مطابقة فواتير المورّدين، مراقبة الائتمان (أعمار الذمم)، التسوية المصرفية، التصريح الضريبي.</li></ul>`),
    },
    {
      h: L('2. Chart of accounts', '٢. المخطط المحاسبي'),
      b: L(`<p>Lebanese companies use the <b>Lebanese general chart of accounts</b>, organised in classes like the French plan: 1 capital, 2 fixed assets, 3 stocks, 4 third parties (suppliers, customers, State/VAT), 5 financial (bank, cash), 6 expenses, 7 revenues. Many companies also prepare IFRS financial statements. The account numbers used in this simulator are simplified and indicative.</p>`,
        `<p>تستعمل الشركات اللبنانية <b>المخطط المحاسبي العام اللبناني</b>، مقسّمًا إلى فئات مثل المخطط الفرنسي: 1 الأموال الدائمة، 2 الأصول الثابتة، 3 المخزون، 4 حسابات الغير (المورّدون، الزبائن، الدولة/الضريبة)، 5 الحسابات المالية (المصرف، الصندوق)، 6 الأعباء، 7 الإيرادات. وتعدّ شركات كثيرة أيضًا بيانات مالية وفق المعايير الدولية IFRS. أرقام الحسابات في هذا المحاكي مبسّطة وإرشادية.</p>`),
    },
    {
      h: L('3. VAT in Lebanon', '٣. الضريبة على القيمة المضافة في لبنان'),
      b: L(`<ul><li>VAT was introduced by <b>Law No. 379 of 14/12/2001</b> (in force 2002). The standard rate is <b>11%</b> (raised from 10% in 2018).</li><li>A VAT-registered company charges <b>output VAT</b> on its taxable sales and deducts the <b>input VAT</b> paid on its purchases; it pays the difference to the Ministry of Finance.</li><li>Returns are filed periodically (generally <b>quarterly</b>) and the tax is paid within <b>20 days</b> after the end of the period — check the current rules and your company’s filing frequency.</li><li>International transport is treated as exempt/zero-rated; local services (handling, THC re-billed, trucking, clearance fees) carry 11%.</li><li><b>Tax invoice</b> must show: seller name, address and VAT number; customer name, address and VAT number (for registered customers); sequential number; date; description; amount before VAT; VAT rate and amount; total — and the VAT amount in LBP when invoicing in foreign currency.</li></ul>`,
        `<ul><li>أُدخلت الضريبة بموجب <b>القانون رقم 379 تاريخ 14/12/2001</b> (نافذ منذ 2002). النسبة العامة <b>11%</b> (رُفعت من 10% عام 2018).</li><li>تفرض الشركة المسجّلة <b>الضريبة على المبيعات</b> وتحسم <b>الضريبة المدفوعة على المشتريات</b>، وتدفع الفرق لوزارة المالية.</li><li>تُقدَّم التصاريح دوريًا (عمومًا <b>فصليًا</b>) وتُدفع الضريبة خلال <b>20 يومًا</b> من نهاية الفترة — تحقّق من القواعد الحالية ووتيرة تصريح شركتك.</li><li>النقل الدولي يُعامل كمعفى/بنسبة صفر؛ والخدمات المحلية (المناولة، THC المعاد فوترتها، النقل البري، أتعاب التخليص) تخضع لـ11%.</li><li><b>الفاتورة الضريبية</b> يجب أن تُظهر: اسم البائع وعنوانه ورقمه الضريبي؛ اسم الزبون وعنوانه ورقمه الضريبي (للمسجّلين)؛ رقمًا متسلسلًا؛ التاريخ؛ الوصف؛ المبلغ قبل الضريبة؛ نسبة الضريبة وقيمتها؛ المجموع — وقيمة الضريبة بالليرة عند الفوترة بعملة أجنبية.</li></ul>`),
    },
    {
      h: L('4. Currency, books and records', '٤. العملة والدفاتر والسجلات'),
      b: L(`<ul><li>Freight is mostly invoiced in USD. Lebanese legal books and tax declarations follow Ministry of Finance rules on currency and exchange rates, which have changed several times since 2019 — always apply the current instruction.</li><li>Keep books and supporting documents (invoices, B/Ls, bank statements) for at least <b>10 years</b> (Code of Commerce).</li><li>Corporate income tax on company profits (17% standard rate for companies) — the job profit you calculate feeds the annual accounts.</li><li>Other taxes may apply to specific payments (e.g. withholding on certain non-resident services, fiscal stamp on some documents) — check with your tax adviser.</li></ul>`,
        `<ul><li>تُفوتر معظم خدمات الشحن بالدولار. الدفاتر القانونية والتصاريح الضريبية في لبنان تتبع تعليمات وزارة المالية حول العملة وأسعار الصرف، وقد تغيّرت مرارًا منذ 2019 — طبّق دائمًا التعليمات الحالية.</li><li>احتفظ بالدفاتر والمستندات الثبوتية (فواتير، بوالص، كشوفات مصرفية) <b>10 سنوات</b> على الأقل (قانون التجارة).</li><li>ضريبة الدخل على أرباح الشركات (17% النسبة العامة للشركات) — ربح العملية الذي تحسبه يدخل في الحسابات السنوية.</li><li>قد تُطبَّق ضرائب أخرى على دفعات معيّنة (مثل الاقتطاع على بعض خدمات غير المقيمين، الطابع المالي على بعض المستندات) — تحقّق مع مستشارك الضريبي.</li></ul>`),
    },
    {
      h: L('5. Deposits and disbursements', '٥. التأمينات والسُلف'),
      b: L(`<p>The container deposit is the <b>client’s money</b>: received into 4191 (deposit held for customer), paid to the line into 4671 (deposit with line). When the line deducts demurrage/detention and refunds the rest, you clear 4671; then you offset what the client still owes you and refund the balance from 4191. Neither the deposit nor its refund is revenue.</p>`,
        `<p>تأمين الحاوية هو <b>مال الزبون</b>: يُقبض في 4191 (تأمين محتفظ به للزبون)، ويُدفع للخط في 4671 (تأمين لدى الخط). عندما يحسم الخط الغرامات ويعيد الباقي تُقفل 4671؛ ثم تقاصّ ما يزال الزبون مدينًا به وتعيد له الرصيد من 4191. لا التأمين ولا استرداده إيراد.</p>`),
    },
  ];

  ACC.disclaimer = L('Training content. Account numbers, the LBP rate and tax details are simplified samples. Lebanese tax rules and Ministry of Finance instructions change — confirm with a licensed accountant (LACPA) before applying anything for real.',
    'محتوى تدريبي. أرقام الحسابات وسعر الليرة وتفاصيل الضرائب أمثلة مبسّطة. القواعد الضريبية وتعليمات وزارة المالية في لبنان تتغيّر — تأكّد مع محاسب مجاز قبل أي تطبيق فعلي.');
})();
