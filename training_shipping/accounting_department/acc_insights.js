/* Accounting — graphics (insights, KPIs) and coach alerts */
(function () {
  const L = TS.L, t = TS.t, esc = TS.esc, V = TS.viz, R = TS.round2;
  const ACC = window.ACC;
  const pl = (D) => V.waterfall({ title: t(L('Job result — revenue to contribution', 'نتيجة العملية — من الإيراد إلى المساهمة')), sub: 'USD', unit: 'USD', items: [{ l: t(L('Revenue', 'الإيراد')), v: D.revenue, kind: 'total' }, { l: t(L('Line', 'الخط')), v: -R(D.carrier ? D.carrier.net : 0), kind: 'delta' }, { l: t(L('Others', 'آخرون')), v: -R(D.costNet - (D.carrier ? D.carrier.net : 0)), kind: 'delta' }, { l: t(L('Bank fees', 'عمولات')), v: -D.bankCharges, kind: 'delta' }, { l: t(L('Contribution', 'المساهمة')), v: D.profitAfterBank, kind: 'total' }] });
  ACC.insight = (id, s) => {
    const D = ACC.d(s);
    if (id === 'receive' || id === 'close') return pl(D);
    if (id === 'invoice' || id === 'sales') return V.stack({ title: t(L('Invoice composition', 'مكوّنات الفاتورة')), unit: 'USD', parts: [{ l: t(L('Exempt (international)', 'معفى (دولي)')), v: D.exempt, c: 's1' }, { l: t(L('Taxable (local)', 'خاضع (محلي)')), v: D.taxable, c: 's3' }, { l: 'VAT 11%', v: D.outVat, c: 's2' }] });
    if (id === 'purchases') return V.hbars({ title: t(L('Supplier invoices (incl. VAT)', 'فواتير المورّدين (مع الضريبة)')), series: [{ l: 'USD', c: 's1' }], unit: 'USD', rows: D.sup.map((v) => ({ label: v.name.split(' (')[0].split(' — ')[0].slice(0, 22), values: [v.total], tips: [`${v.no} · VAT ${TS.num(v.vat)}`] })) });
    if (id === 'cash') return V.hbars({ title: t(L('Money in and out of the bank for this job', 'الأموال الداخلة والخارجة من المصرف لهذه العملية')), series: [{ l: 'USD', c: 's1' }], unit: 'USD', rows: [{ label: t(L('Received', 'مقبوض')), values: [R(D.mv.filter((m) => m.amt > 0).reduce((a, m) => a + m.amt, 0))] }, { label: t(L('Paid out', 'مدفوع')), values: [R(-D.mv.filter((m) => m.amt < 0).reduce((a, m) => a + m.amt, 0))] }] });
    if (id === 'bank') return V.hbars({ title: t(L('Bank vs books', 'المصرف مقابل الدفاتر')), series: [{ l: 'USD', c: 's1' }], unit: 'USD', rows: [{ label: t(L('Statement', 'الكشف')), values: [D.stmtBal] }, { label: t(L('Books (512)', 'الدفاتر (512)')), values: [D.bookBal] }, { label: t(L('Reconciled', 'بعد التسوية')), values: [R(D.bookBal - D.bankCharges)], strong: true }] });
    if (id === 'vat') return V.hbars({ title: t(L('VAT for the period', 'الضريبة للفترة')), series: [{ l: 'USD', c: 's1' }], unit: 'USD', rows: [{ label: t(L('Output VAT', 'ضريبة المبيعات')), values: [D.outVat] }, { label: t(L('Input VAT', 'ضريبة المشتريات')), values: [D.inVat] }, { label: t(L('Net payable', 'الصافي المستحق')), values: [D.netVat], strong: true }] });
    return '';
  };
  ACC.alerts = (s) => {
    const D = ACC.d(s), out = [], a = s.accounting;
    const ar = ACC.bal(s, '411'); if (Math.abs(ar) > 0.05) out.push({ lvl: 'warn', text: t(L('Customer balance (411): USD ', 'رصيد الزبون (411): ')) + TS.num(ar) });
    const ap = ACC.bal(s, '401'); if (Math.abs(ap) > 0.05) out.push({ lvl: 'warn', text: t(L('Unpaid suppliers (401): USD ', 'مورّدون غير مدفوعين (401): ')) + TS.num(-ap) });
    if (!a.steps.vat) { const dd = TS.diffDays(a.today, D.vatDue); out.push({ lvl: dd < 15 ? 'warn' : 'ok', text: t(L('VAT payment due ', 'استحقاق الضريبة ')) + TS.fmtDate(D.vatDue, false) + ` (${dd} ${t(L('days', 'يومًا'))})` }); }
    return out;
  };
  ACC.homeKpis = (list) => {
    if (!list.length) return '';
    const closed = list.filter((s) => String(s.handoffs.accounting.status).includes('closed')).length;
    const rev = list.reduce((a, s) => a + s.handoffs.accounting.pack.invoice.total, 0);
    const pr = list.reduce((a, s) => a + (s.accounting && s.accounting.result ? s.accounting.result.contribution : 0), 0);
    return `<div class="kpis"><div class="kpi"><div class="k">${esc(t(L('Jobs received', 'عمليات مستلمة')))}</div><div class="v">${list.length}</div></div><div class="kpi"><div class="k">${esc(t(L('Jobs closed', 'عمليات مقفلة')))}</div><div class="v">${closed}</div></div><div class="kpi"><div class="k">${esc(t(L('Invoiced (incl. VAT)', 'المفوتر (مع الضريبة)')))}</div><div class="v">USD ${TS.num(rev, 0)}</div></div><div class="kpi"><div class="k">${esc(t(L('Contribution (closed jobs)', 'المساهمة (العمليات المقفلة)')))}</div><div class="v">USD ${TS.num(pr, 0)}</div></div></div>`;
  };
})();
