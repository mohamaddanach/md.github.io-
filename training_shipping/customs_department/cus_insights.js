/* Customs — graphics (insights, KPIs) and coach alerts */
(function () {
  const L = TS.L, t = TS.t, esc = TS.esc, V = TS.viz, R = TS.round2;
  const CUS = window.CUS;
  const laneChips = (lane) => `<div class="row" style="margin:6px 0">${[['green', '🟢', L('Green — release', 'أخضر — إفراج')], ['yellow', '🟡', L('Yellow — documents', 'أصفر — مستندات')], ['red', '🔴', L('Red — inspection', 'أحمر — كشف')]].map(([k, i, l]) => `<span class="badge ${k === lane ? 'info' : ''}" style="${k === lane ? 'outline:2px solid var(--brand-2);font-size:.9rem' : 'opacity:.6'}">${i} ${esc(t(l))}${k === lane ? ' ◀' : ''}</span>`).join('')}</div>`;
  CUS.insight = (id, s) => {
    const D = CUS.d(s), c = s.customs || {};
    if (id === 'classify' && D.imp) {
      const ch = D.items.find((x) => x.id === 'C');
      return V.hbars({ title: t(L('Duty on the chairs — wrong vs right code', 'الرسم على الكراسي — الرمز الخاطئ مقابل الصحيح')), series: [{ l: 'USD', c: 's1' }], unit: 'USD', rows: [{ label: '9403.60 (25%)', values: [R(ch.cif * 0.25)], tips: [t(L('Supplier’s code', 'رمز المورّد'))] }, { label: '9401.69 (20%)', values: [R(ch.cif * 0.2)], strong: true, tips: [t(L('Correct code', 'الرمز الصحيح'))] }] });
    }
    if (id === 'value' || (id === 'duties' && !D.imp)) {
      return D.imp ? V.stack({ title: t(L('What makes the customs value (CIF)', 'مكوّنات القيمة الجمركية (CIF)')), unit: 'USD', parts: [{ l: t(L('Goods (FOB invoice)', 'البضاعة (فاتورة FOB)')), v: D.valTotal, c: 's1' }, { l: t(L('Freight to Beirut', 'الشحن حتى بيروت')), v: D.freight, c: 's2' }, { l: t(L('Insurance', 'التأمين')), v: D.ins, c: 's3' }] })
        : V.stack({ title: t(L('From the CFR price to the FOB export value', 'من سعر CFR إلى قيمة FOB للتصدير')), unit: 'USD', parts: [{ l: t(L('FOB value (declared)', 'قيمة FOB (المصرَّح بها)')), v: D.fob, c: 's1' }, { l: t(L('Freight included in CFR', 'الشحن المضمّن في CFR')), v: D.freightSold, c: 's2' }] });
    }
    if (D.imp && ['duties', 'declare', 'lane', 'release', 'close'].includes(id)) {
      const w = V.waterfall({ title: t(L('From customs value to total landed taxes', 'من القيمة الجمركية إلى مجموع الضرائب')), sub: 'USD', unit: 'USD', items: [{ l: 'CIF', v: D.cif, kind: 'total' }, { l: t(L('Duty', 'الرسم')), v: D.duty, kind: 'delta' }, { l: 'VAT 11%', v: D.vat, kind: 'delta' }, { l: t(L('CIF + taxes', 'CIF + الضرائب')), v: R(D.cif + D.taxes), kind: 'total' }] });
      return (['lane', 'release', 'close'].includes(id) && c.declaration && c.declaration.lane ? laneChips(c.declaration.lane) : '') + w;
    }
    if (!D.imp && ['lane', 'release', 'close'].includes(id) && c.declaration && c.declaration.lane) return laneChips(c.declaration.lane);
    return '';
  };
  CUS.alerts = (s) => {
    const D = CUS.d(s), out = [];
    if (D.imp && !(s.customs && s.customs.release) && s.booking) {
      const dis = s.booking.revisedEta || s.booking.eta, used = TS.diffDays(dis, (s.customs && s.customs.today) || dis) + 1;
      out.push({ lvl: used > s.booking.freeDays - 3 ? 'warn' : 'ok', text: t(L('Free time used: ', 'أيام السماح المستعملة: ')) + used + '/' + s.booking.freeDays + t(L(' days since discharge', ' منذ التفريغ')) });
    }
    return out;
  };
  CUS.homeKpis = (list) => {
    if (!list.length) return '';
    const closed = list.filter((s) => String(CUS.handoff(s).status).includes('closed')).length;
    const taxes = list.reduce((a, s) => a + (s.customs && s.customs.result && s.customs.result.taxes ? s.customs.result.taxes.total || 0 : 0), 0);
    return `<div class="kpis"><div class="kpi"><div class="k">${esc(t(L('Files received', 'ملفات مستلمة')))}</div><div class="v">${list.length}</div></div><div class="kpi"><div class="k">${esc(t(L('Files cleared', 'ملفات مخلّصة')))}</div><div class="v">${closed}</div></div><div class="kpi"><div class="k">${esc(t(L('Duties & VAT assessed', 'الرسوم والضرائب المصفّاة')))}</div><div class="v">USD ${TS.num(taxes, 0)}</div></div></div>`;
  };
})();
