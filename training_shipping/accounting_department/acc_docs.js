/* Accounting module — realistic documents: tax invoice, supplier invoices (+ credit note), statement of account,
 * bank statement & reconciliation, VAT working paper, journal vouchers */
(function () {
  const L = TS.L, esc = TS.esc, R = TS.round2, DK = TS.DK;
  const ACC = window.ACC;
  const { c, g, t, lh, page, sig, d, m, n, party, words } = DK;
  const A = (s) => s.accounting;
  const PFT = () => DK.heads.pft;
  const vhead = (s, v) => ({ carrier: DK.heads.carrier(s), trucker: DK.heads.trucker, broker: { mark: 'KC', color: '#5b3a29', co: 'KHOURY CLEARANCE SARL', sub: 'Licensed customs brokers · Port of Beirut · VAT No. 2771100-601' }, insurer: { mark: 'CMI', color: '#234e70', co: 'CEDAR MARINE INSURANCE SAL', sub: 'Marine cargo insurance · Beirut · Training specimen' }, chamber: DK.heads.chamberZ }[v.vendor] || { mark: '?', co: v.name, sub: '' });

  function taxInvoice(s) {
    const D = ACC.d(s), a = A(s), cu = s.parties.client, inv = a.docs.invoice;
    return page(lh(Object.assign({ title: 'TAX INVOICE', titleKey: 'taxinv', ref: '<span class="ar">فاتورة ضريبية</span><br>No. <b>' + esc(D.invNo) + '</b> · ' + d(inv.date) }, PFT())) +
      g([c(6, 'Bill to', 'consignee', party(cu), { h: 70 }), c(3, 'Customer VAT No.', 'vat', (cu.reg || '').split('VAT ')[1] || '—'), c(3, 'Invoice date', null, d(inv.date)),
        c(3, 'Job / file', 'jobcost', s.id), c(3, 'Due date', null, 'On receipt'),
        c(4, 'House B/L', 'hbl', s.documents.bl.hblNo), c(4, 'Vessel / voyage', 'vessel', s.booking.vessel + ' / ' + s.booking.voyage), c(4, 'Container', 'cntrno', s.equipment.containerNo + ' (' + s.equipment.type + ')')]) +
      t([{ l: 'Code', w: '50px' }, { l: 'Description of service' }, { l: 'VAT code', k: 'vat' }, { l: 'Amount USD', r: 1 }], D.inv.lines.map((l) => [esc(l.code), esc(l.desc), l.vat ? 'S — 11%' : 'Z — exempt', m(l.amount)])) +
      t([{ l: 'Summary' }, { l: 'USD', r: 1 }, { l: 'LBP (sample rate ' + n(ACC.LBP_RATE, 0) + ')', r: 1 }], [
        ['Exempt / zero-rated services (Z)', m(D.exempt), n(Math.round(D.exempt * ACC.LBP_RATE), 0)],
        ['Taxable services (S) — VAT base', m(D.taxable), n(Math.round(D.taxable * ACC.LBP_RATE), 0)],
        ['VAT 11%', m(D.outVat), n(inv.vatLBP, 0)],
      ], { tot: ['TOTAL DUE', m(D.total), n(Math.round(D.total * ACC.LBP_RATE), 0)] }) +
      `<p class="v" style="font-family:Courier New;font-weight:700">${esc(words(D.total))}</p>` +
      g([c(6, 'Bank details', null, 'Training Bank SAL — Beirut\nUSD account IBAN LB00 0000 0000 0000 0000 0000 0000\nSWIFT TRBKLBBE'), c(6, 'Remarks', null, 'Amounts already received (USD ' + m(D.paid) + ') appear on your statement of account.' + (D.balance && D.deposit ? '\nBalance to be offset against your container deposit.' : ''))]) +
      sig(['Phoenicia Freight Training SAL — accounts department', 'Received by customer']), { page: 'Tax invoice ' + D.invNo });
  }

  function supplierInvoices(s) {
    const D = ACC.d(s);
    return D.sup.map((v) => {
      const date = TS.addDays(D.invDate, 1);
      const isTr = v.vendor === 'trucker';
      const lines = v.lines.map((l) => [esc(l.code), esc(l.desc), l.vat ? '11%' : '—', m(l.amount)]).concat(isTr ? [['WT', 'Waiting time 2 hrs (disputed — see credit note)', '11%', m(20)]] : []);
      const net = R(v.net + (isTr ? 20 : 0)), vat = R(v.vat + (isTr ? 2.2 : 0));
      let html = page(lh(Object.assign({ title: v.vendor === 'carrier' ? 'FREIGHT INVOICE' : 'TAX INVOICE', titleKey: 'taxinv', ref: 'No. <b>' + esc(v.no) + '</b> · ' + d(date) }, vhead(s, v))) +
        g([c(6, 'Bill to', 'forwarder', party({ name: 'Phoenicia Freight Training SAL', address: 'Port Road, Medawar, Beirut, Lebanon', reg: 'VAT 3001234-601' }), { h: 56 }), c(3, 'Your reference', null, s.id), c(3, v.vendor === 'carrier' ? 'B/L' : 'Container', v.vendor === 'carrier' ? 'mbl' : 'cntrno', v.vendor === 'carrier' ? s.documents.bl.mblNo : s.equipment.containerNo),
          c(3, 'Invoice date', null, d(date)), c(3, 'Payment terms', null, v.vendor === 'carrier' ? 'Before release' : '30 days')]) +
        t([{ l: 'Code' }, { l: 'Description' }, { l: 'VAT', k: 'vat' }, { l: 'USD', r: 1 }], lines) +
        t([{ l: '' }, { l: '', r: 1 }], [['Net amount', m(net)], ['VAT 11%', m(vat)]], { tot: ['TOTAL USD', m(net + vat)] }) +
        `<p class="v" style="font-family:Courier New;font-weight:700">${esc(words(net + vat))}</p>` + sig([esc(v.name) + ' — accounts', '']), { page: 'Supplier invoice ' + v.no });
      if (isTr) html += page(lh(Object.assign({ title: 'CREDIT NOTE', titleKey: 'creditnote', ref: 'No. <b>CN-' + esc(v.no) + '</b> · ' + d(TS.addDays(date, 1)) + '<br>Ref. invoice ' + esc(v.no) }, vhead(s, v))) +
        g([c(6, 'Credit to', 'forwarder', 'Phoenicia Freight Training SAL\nPort Road, Medawar, Beirut\nVAT 3001234-601', { h: 52 }), c(6, 'Reason', null, 'Waiting time charged in error — no waiting reported on the trucking order.', { h: 52 })]) +
        t([{ l: 'Description' }, { l: 'VAT', k: 'vat' }, { l: 'USD', r: 1 }], [['Waiting time 2 hrs', '11%', m(-20)], ['VAT 11%', '', m(-2.2)]], { tot: ['TOTAL CREDIT', '', m(-22.2)] }) + sig([esc(v.name) + ' — accounts', '']), { page: 'Credit note' });
      return html;
    }).join('');
  }

  function statement(s) {
    const a = A(s), rows = []; let r = 0;
    a.journal.forEach((e) => e.lines.filter((l) => l.acc === '411').forEach((l) => { r = R(r + l.dr - l.cr); rows.push([d(e.date), esc(e.ref), esc(e.narrative), l.dr ? m(l.dr) : '', l.cr ? m(l.cr) : '', m(r)]); }));
    return page(lh(Object.assign({ title: 'STATEMENT OF ACCOUNT', titleKey: 'statement', ref: 'As at ' + d(a.today) }, PFT())) +
      g([c(6, 'Customer', 'ar', party(s.parties.client), { h: 60 }), c(3, 'Account', 'ar', '411 — ' + s.parties.client.name.split(' ')[0].toUpperCase()), c(3, 'Currency', null, 'USD')]) +
      t([{ l: 'Date' }, { l: 'Reference' }, { l: 'Details' }, { l: 'Debit', k: 'debit', r: 1 }, { l: 'Credit', k: 'debit', r: 1 }, { l: 'Balance', r: 1 }], rows, { tot: ['', '', 'BALANCE DUE', '', '', m(r)] }) +
      `<p class="fine">Please report any difference within 15 days. Payments by bank transfer quoting the invoice number.</p>`, { page: 'Statement of account' });
  }

  function bankStatement(s) {
    const D = ACC.d(s), rec = A(s).docs.bankRec;
    let bal = ACC.OPENING_BANK;
    const rows = [[d(D.invDate), 'Opening balance', '', '', m(bal)]].concat(D.stmt.map((x) => { bal = R(bal + x.amt); return [d(x.date), esc(x.txt), x.amt < 0 ? m(-x.amt) : '', x.amt > 0 ? m(x.amt) : '', m(bal)]; }));
    let html = page(lh({ mark: 'TB', color: '#14532d', co: 'TRAINING BANK SAL', sub: 'Riad El Solh, Beirut · Training specimen', title: 'ACCOUNT STATEMENT', ref: 'USD current account · IBAN LB00 0000 0000 0000 0000 0000 0000' }) +
      g([c(6, 'Account holder', null, 'PHOENICIA FREIGHT TRAINING SAL\nPort Road, Medawar, Beirut', { h: 44 }), c(3, 'Period', null, d(D.invDate) + ' – ' + d(TS.addDays(D.invDate, 5))), c(3, 'Currency', null, 'USD')]) +
      t([{ l: 'Value date' }, { l: 'Description' }, { l: 'Debit', r: 1 }, { l: 'Credit', r: 1 }, { l: 'Balance', r: 1 }], rows, { tot: ['', 'CLOSING BALANCE', '', '', m(bal)] }), { page: 'Bank statement' });
    if (rec) html += page(lh(Object.assign({ title: 'BANK RECONCILIATION STATEMENT', titleKey: 'bankrec', ref: 'USD current account · ' + d(TS.addDays(D.invDate, 5)) }, PFT())) +
      t([{ l: 'Item' }, { l: 'USD', r: 1 }], [
        ['Balance per books — account 512', m(rec.book)], ['Less: bank charges not yet recorded in the books', '(' + m(rec.charges) + ')'],
      ], { tot: ['ADJUSTED BOOK BALANCE', m(rec.reconciled)] }) +
      t([{ l: 'Item' }, { l: 'USD', r: 1 }], [
        ['Balance per bank statement', m(rec.statement)], ['Less: outstanding payment (issued, not yet cleared) — ' + esc((D.broker || {}).name || ''), '(' + m(rec.outstanding) + ')'],
      ], { tot: ['ADJUSTED BANK BALANCE', m(R(rec.statement - rec.outstanding))] }) +
      `<p><b>Difference: ${m(R(rec.reconciled - (rec.statement - rec.outstanding)))}</b> — reconciled.</p>` + sig(['Prepared by', 'Reviewed by']), { page: 'Bank reconciliation' });
    return html;
  }

  function vatPaper(s) {
    const x = A(s).docs.vatReturn, D = ACC.d(s);
    return page(lh(Object.assign({ title: 'VAT RETURN — WORKING PAPER', titleKey: 'vatreturn', ref: 'Period ending ' + d(x.periodEnd) + '<br>Payment deadline ' + d(x.due) }, PFT())) +
      g([c(6, 'Taxpayer', null, 'PHOENICIA FREIGHT TRAINING SAL\nVAT registration No. 3001234-601', { h: 44 }), c(3, 'Tax period', null, 'Quarter ending ' + d(x.periodEnd)), c(3, 'Filing', null, 'Ministry of Finance e-platform')]) +
      t([{ l: 'Box' }, { l: 'Description' }, { l: 'Base USD', r: 1 }, { l: 'VAT USD', r: 1 }], [
        ['1', 'Taxable supplies at 11% (local services)', m(D.taxable), m(x.output)],
        ['2', 'Exempt / zero-rated supplies (international transport, insurance)', m(D.exempt), '—'],
        ['3', 'Output VAT (box 1)', '', m(x.output)],
        ['4', 'Input VAT on local purchases (deductible)', m(D.sup.reduce((a, v) => a + v.lines.filter((l) => l.vat).reduce((b, l) => b + l.amount, 0), 0)), m(x.input)],
        ['5', 'Net VAT payable (3 − 4)', '', m(x.net)],
      ], { tot: ['', 'NET VAT PAYABLE IN LBP (sample rate ' + n(ACC.LBP_RATE, 0) + ')', '', n(x.netLBP, 0)] }) +
      `<p class="fine">Training working paper for one job only — a real return includes every sale and purchase of the period. Rates, LBP conversion and deadlines must be checked against the current Ministry of Finance rules.</p>`, { page: 'VAT working paper' });
  }

  function vouchers(s) {
    const a = A(s);
    return page(lh(Object.assign({ title: 'JOURNAL VOUCHERS', titleKey: 'jv', ref: esc(s.id) + '<br>' + a.journal.length + ' entries' }, PFT())) +
      a.journal.map((e) => `<h4>${esc(e.ref)} · ${d(e.date)} — ${esc(e.narrative)}</h4>` + t([{ l: 'Account', k: 'ledger' }, { l: 'Name' }, { l: 'Debit', k: 'debit', r: 1 }, { l: 'Credit', k: 'debit', r: 1 }], e.lines.map((l) => [esc(l.acc), esc((ACC.acc(l.acc) || { name: L(l.acc, l.acc) }).name.en), l.dr ? m(l.dr) : '', l.cr ? m(l.cr) : '']), { tot: ['', 'TOTAL', m(e.lines.reduce((x, l) => x + l.dr, 0)), m(e.lines.reduce((x, l) => x + l.cr, 0))] })).join('') +
      sig(['Prepared by', 'Checked by', 'Approved by']), { page: 'Journal vouchers' });
  }

  ACC.docs = (s) => {
    const a = A(s), list = [];
    if (a.docs.invoice) list.push({ id: 'inv', name: L('Tax invoice', 'الفاتورة الضريبية'), html: taxInvoice });
    if (a.steps.receive) list.push({ id: 'sup', name: L('Supplier invoices', 'فواتير المورّدين'), html: supplierInvoices });
    if (a.steps.cash) list.push({ id: 'stmt', name: L('Statement of account', 'كشف حساب'), html: statement });
    if (a.steps.cash) list.push({ id: 'bank', name: L('Bank statement & reconciliation', 'كشف المصرف والتسوية'), html: bankStatement });
    if (a.docs.vatReturn) list.push({ id: 'vat', name: L('VAT working paper', 'ورقة عمل الضريبة'), html: vatPaper });
    if (a.journal.length > 1) list.push({ id: 'jv', name: L('Journal vouchers', 'سندات القيد'), html: vouchers });
    list.push({ id: 'ci', name: L('Commercial invoice', 'الفاتورة التجارية'), html: TS.DOCS.ci });
    return list;
  };
})();
