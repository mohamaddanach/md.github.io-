/* Customs module — realistic documents: declaration (SAD-style numbered boxes), assessment notice, release, plus the commercial documents */
(function () {
  const L = TS.L, esc = TS.esc, DK = TS.DK;
  const CUS = window.CUS;
  const { c, g, t, lh, page, sig, d, m, n } = DK;
  const C = (s) => s.customs;

  function declaration(s) {
    const D = CUS.d(s), x = C(s).declaration || {}, imp = D.imp;
    const P = imp ? s.parties.consignee : s.parties.shipper, O = imp ? s.parties.shipper : s.parties.consignee;
    const no = x.no || 'NOT YET LODGED';
    const reg = CUS.regimes.find((r) => r.v === (x.reg || D.regime));
    const procCode = imp ? '4000' : '1000';
    const head = g([
      c(3, 'Declaration', 'declaration', imp ? 'IM 4 — import for home use' : 'EX 1 — definitive export', { n: 1 }),
      c(3, 'Customs office', null, 'BEIRUT PORT — 1001', { n: 'A' }),
      c(3, 'Registration no. / date', 'najm', no + (x.lodged ? '\n' + d(x.lodged) : ''), { n: '' }),
      c(3, 'Risk lane', 'lane', (x.lane || '—').toUpperCase(), { n: '' }),
      c(6, imp ? 'Consignor / exporter' : 'Exporter', 'shipper', DK.party(imp ? O : P), { n: 2, h: 62 }),
      c(2, 'Forms', null, '1 / 1', { n: 3 }), c(2, 'Loading lists', null, '—', { n: 4 }), c(1, 'Items', null, String(D.items.length), { n: 5 }), c(1, 'Total pkgs', 'pkgs', String(D.pkgs), { n: 6 }),
      c(6, imp ? 'Consignee / importer' : 'Consignee', 'consignee', DK.party(imp ? P : O), { n: 8, h: 62 }),
      c(3, 'Reference number', null, s.id, { n: 7 }), c(3, 'Person responsible for financial settlement', null, imp ? P.name : '—', { n: 9 }),
      c(6, 'Declarant / representative', 'broker', CUS.company.licence + '\nPhoenicia Freight Training SAL — Customs Department\nfor account of ' + P.name, { n: 14, h: 52 }),
      c(2, 'Country of dispatch / export', 'consigned', D.consigned + ' — ' + CUS.countryName(D.consigned), { n: 15 }), c(2, 'Country of origin', 'origin', D.origin, { n: 16 }), c(2, 'Country of destination', null, D.destination + ' — ' + CUS.countryName(D.destination), { n: 17 }),
      c(4, 'Identity of means of transport', 'vessel', (imp ? s.booking.connectingVessel || s.booking.vessel : s.booking.vessel) + ' / ' + s.booking.voyage, { n: 18 }), c(2, 'Container', 'cntrno', (D.lcl ? 'LCL — ' : '1 — ') + s.equipment.containerNo, { n: 19 }),
      c(3, 'Delivery terms', 'incoterm', s.jobFile.incoterm + ' ' + s.jobFile.namedPlace, { n: 20 }), c(3, 'Currency & total amount invoiced', 'ci', 'USD ' + m(D.valTotal), { n: 22 }),
      c(4, 'Nationality of active means of transport', null, 'MT — Malta (flag)', { n: 21 }), c(2, 'Exchange rate', 'customsrate', String(CUS.RATE), { n: 23 }), c(2, 'Nature of transaction', null, '11 — outright purchase/sale', { n: 24 }), c(2, 'Mode of transport at border', null, '1 — SEA', { n: 25 }), c(2, 'Inland mode', null, '3 — ROAD', { n: 26 }),
      c(4, imp ? 'Office of entry' : 'Office of exit', 'terminal', 'BEIRUT PORT', { n: 29 }), c(4, 'Location of goods', 'terminal', (D.lcl ? (s.case && s.case.cfs) || 'Beirut CFS' : 'Beirut Container Terminal') + ' — ' + s.equipment.containerNo, { n: 30 }), c(4, 'Regime', 'regime', reg ? reg.l.en : '', { n: 'R' }),
    ]);
    const itemBlocks = D.items.map((it, i) => {
      const val = imp ? it.cif : it.fob;
      return g([
        c(6, 'Packages and description of goods — marks & numbers, container no., number and kind', 'desc', `${DK.marks(s).split('\n')[0]} · ${s.equipment.containerNo}\n${it.pkgs} ${String(s.jobFile.pkgType).toUpperCase()} — ${it.desc.toUpperCase()}\n${it.model || ''}`, { n: 31, rs: 3, h: 120 }),
        c(1, 'Item no.', null, String(i + 1), { n: 32 }), c(3, 'Commodity code (HS)', 'hscode', it.hs, { n: 33 }), c(2, 'Ctry origin code', 'origin', D.origin, { n: 34 }),
        c(2, 'Gross mass (kg)', 'gross', n(it.gross, 0), { n: 35 }), c(2, 'Preference', 'preference', D.pref === 'EUR1' ? '300 (EUR.1)' : D.pref === 'GAFTA' ? '200 (GAFTA)' : '100 (MFN)', { n: 36 }), c(2, 'Procedure', 'regime', procCode, { n: 37 }),
        c(2, 'Net mass (kg)', 'net', n(it.net, 0), { n: 38 }), c(2, 'Quota', null, '—', { n: 39 }), c(2, 'Supplementary units', null, n(it.qty, 0) + ' ' + it.unit, { n: 41 }),
        c(6, 'Summary declaration / previous document', 'manifest', 'MANIFEST ' + (imp ? 'MF/' + (s.booking.revisedEta || s.booking.eta).slice(0, 4) + '/' + (DK.seed(s) % 9000 + 1000) : 'EXPORT') + ' — B/L ' + s.documents.bl.mblNo, { n: 40 }),
        c(3, 'Item price', 'ci', 'USD ' + m(it.value), { n: 42 }), c(3, imp ? 'Statistical value (CIF)' : 'Statistical value (FOB)', 'cifval', 'USD ' + m(val) + '\nLBP ' + n(Math.round(val * CUS.RATE), 0), { n: 46 }),
        c(12, 'Additional information / documents produced / certificates', null, imp ? 'N380 Commercial invoice ' + DK.invNo(s) + ' · N271 Packing list · N861 Certificate of origin' + (D.pref === 'EUR1' ? ' · N954 EUR.1' : D.pref === 'GAFTA' ? ' · Arab COO (GAFTA)' : '') + ' · N705 B/L ' + s.documents.bl.mblNo + ' · D/O ' + ((s.release || {}).doNo || '') + ' · Importer CR & VAT certificate' : 'N380 Commercial invoice ' + DK.invNo(s) + ' · N271 Packing list · N861 COO' + (D.pref === 'EUR1' ? ' · EUR.1' : D.pref === 'GAFTA' ? ' · Arab COO' : '') + (D.sc.cargo && D.sc.cargo.food ? ' · Health certificate' : '') + ' · Booking ' + s.booking.no, { n: 44, h: 40 }),
      ], 'margin-top:6px') + (imp ? t([{ l: '47 Type', k: 'duty' }, { l: 'Tax base (USD)', r: 1 }, { l: 'Rate', r: 1 }, { l: 'Amount (USD)', r: 1 }, { l: 'Amount (LBP)', r: 1 }, { l: 'MP' }], [
        ['CD — customs duty', m(it.cif), it.rate + ' %', m(it.duty), n(Math.round(it.duty * CUS.RATE), 0), '1'],
        ['VAT — value added tax', m(it.vatBase), '11 %', m(it.vat), n(Math.round(it.vat * CUS.RATE), 0), '1'],
      ], { tot: ['Total item ' + (i + 1), '', '', m(it.duty + it.vat), n(Math.round((it.duty + it.vat) * CUS.RATE), 0), ''] }) : '');
    }).join('');
    const totals = imp ? g([c(6, 'Accounting details', 'assessment', `Total duty: USD ${m(D.duty)}\nTotal VAT: USD ${m(D.vat)}\nTOTAL: USD ${m(D.taxes)} — LBP ${n(D.taxesLBP, 0)}`, { n: 'B', h: 66 }), c(6, 'Place and date, signature and name of declarant', 'broker', 'Beirut, ' + d(x.lodged || C(s).today) + '\n' + CUS.company.licence + '\n\nSignature & stamp:', { n: 54, h: 66 })], 'margin-top:6px')
      : g([c(6, 'Accounting details', null, 'No export duty — exempt', { n: 'B', h: 50 }), c(6, 'Place and date, signature and name of declarant', 'broker', 'Beirut, ' + d(x.lodged || C(s).today) + '\n' + CUS.company.licence + '\n\nSignature & stamp:', { n: 54, h: 50 })], 'margin-top:6px');
    return page(lh(Object.assign({ title: 'CUSTOMS DECLARATION', titleKey: 'declaration', ref: TS.term('Single administrative document layout', 'sad') + ' · NAJM (simulated)<br>' + esc(no) }, DK.heads.customs)) + head + itemBlocks + totals, { page: 'Declaration ' + no });
  }

  function assessment(s) {
    const D = CUS.d(s), c0 = C(s);
    return page(lh(Object.assign({ title: 'NOTICE OF ASSESSMENT', titleKey: 'assessment', ref: 'Declaration ' + esc(D.declNo) + '<br>' + d(c0.declaration && c0.declaration.lodged) }, DK.heads.customs)) +
      g([c(6, 'Importer', 'consignee', DK.party(s.parties.consignee), { h: 56 }), c(6, 'Declarant', 'broker', CUS.company.licence, { h: 56 }),
        c(4, 'Customs value (CIF)', 'cifval', 'USD ' + m(D.cif)), c(4, 'Exchange rate', 'customsrate', 'LBP ' + n(CUS.RATE, 0) + ' / USD (sample)'), c(4, 'Value in LBP', null, n(D.cifLBP, 0))]) +
      t([{ l: 'Item' }, { l: 'HS', k: 'hscode' }, { l: 'CIF USD', k: 'cifval', r: 1 }, { l: 'Duty %', r: 1 }, { l: 'Duty USD', k: 'duty', r: 1 }, { l: 'VAT base', r: 1 }, { l: 'VAT 11%', k: 'vat', r: 1 }],
        D.items.map((x, i) => [String(i + 1), esc(x.hs), m(x.cif), x.rate + '%', m(x.duty), m(x.vatBase), m(x.vat)]),
        { tot: ['TOTAL', '', m(D.cif), '', m(D.duty), m(D.vatBase), m(D.vat)] }) +
      g([c(6, 'Total amount payable', null, 'USD ' + m(D.taxes) + '\nLBP ' + n(D.taxesLBP, 0), { h: 46, cls: 'hl' }), c(6, 'Payment', null, 'To the Treasury account at an authorised bank. Present the bank receipt to obtain the release.' + (c0.payment ? '\nReceipt ' + c0.payment.receipt : ''), { h: 46 })]) +
      `<p class="fine">${DK.words(D.taxes)}. Duty rates shown are training samples. Import VAT is recoverable as input VAT by a VAT-registered importer.</p>`, { page: 'Assessment ' + D.declNo });
  }

  function release(s) {
    const D = CUS.d(s), c0 = C(s);
    return page(lh(Object.assign({ title: D.imp ? 'CUSTOMS RELEASE — EXIT AUTHORISATION' : 'EXPORT RELEASE — LOADING AUTHORISATION', titleKey: 'release', ref: 'Declaration ' + esc(D.declNo) }, DK.heads.customs)) +
      g([c(4, 'Declaration', 'declaration', D.declNo), c(4, 'Release date', 'release', d(D.release)), c(4, 'Risk lane', 'lane', D.lane.toUpperCase()),
        c(4, D.lcl ? 'HBL / container' : 'Container / seal', 'cntrno', D.lcl ? s.documents.bl.hblNo + ' / ' + s.equipment.containerNo : s.equipment.containerNo + ' / ' + s.equipment.seal), c(4, 'B/L', 'mbl', s.documents.bl.mblNo), c(4, D.imp ? 'Delivery order' : 'Booking', D.imp ? 'do' : 'bookingno', D.imp ? s.release.doNo : s.booking.no),
        c(6, D.imp ? 'Importer' : 'Exporter', D.imp ? 'consignee' : 'shipper', DK.party(D.imp ? s.parties.consignee : s.parties.shipper), { h: 54 }), c(6, D.imp ? 'Payment' : 'Proof of export', D.imp ? 'assessment' : 'onboard', D.imp ? 'Duties & VAT paid — receipt ' + ((c0.payment || {}).receipt || '') + '\nUSD ' + m(D.taxes) : 'Export declaration + shipped-on-board B/L', { h: 54 })]) +
      `<div style="margin:14px 0;text-align:center"><span class="stampx green" style="font-size:20px">${TS.term('RELEASED', 'release')}</span></div>` +
      `<p class="fine">${D.imp ? 'The goods may leave the customs area on presentation of this release, the delivery order and the terminal gate pass. Subject to post-clearance audit.' : 'The goods may be loaded on the declared vessel. Keep this release with the B/L as proof of export.'}</p>` + sig(['Customs officer — signature & stamp', 'Received by declarant']), { page: 'Release ' + D.declNo });
  }

  CUS.docs = (s) => {
    const c0 = C(s), list = [];
    list.push({ id: 'ci', name: L('Commercial invoice', 'الفاتورة التجارية'), html: TS.DOCS.ci });
    list.push({ id: 'pl', name: L('Packing list', 'قائمة التعبئة'), html: TS.DOCS.pl });
    if (c0.declaration) list.push({ id: 'decl', name: L('Customs declaration', 'البيان الجمركي'), html: declaration });
    if (c0.taxes && CUS.d(s).imp) list.push({ id: 'assess', name: L('Assessment notice', 'إشعار التصفية'), html: assessment });
    if (c0.release) list.push({ id: 'rel', name: L('Customs release', 'الإفراج الجمركي'), html: release });
    return list;
  };
})();
