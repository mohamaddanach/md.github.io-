/* Training Shipping — realistic document toolkit (boxed forms, tables, letterheads, amount in words).
 * Every label is a clickable term (see terms.js). Every page carries a SPECIMEN — TRAINING watermark. */
(function () {
  const esc = TS.esc;
  const DK = (TS.DK = {});

  DK.e = (v) => esc(v == null || v === '' ? '' : v);
  DK.lbl = (label, key, n) => `<span class="l">${n != null ? `<span class="n">${n}</span>` : ''}${key ? TS.term(esc(label), key) : esc(label)}</span>`;
  /* cell: span (1–12), label, term key, value (already HTML-safe or plain text), opts {n: box no., h: min height px, cls, raw} */
  DK.c = (span, label, key, value, o) => {
    o = o || {};
    const v = o.raw ? value : DK.e(value);
    return `<div class="c ${o.cls || ''}" style="grid-column:span ${span};${o.rs ? 'grid-row:span ' + o.rs + ';' : ''}${o.h ? 'min-height:' + o.h + 'px;' : ''}">${label ? DK.lbl(label, key, o.n) : ''}<div class="v">${v}</div></div>`;
  };
  DK.g = (cells, style) => `<div class="g" style="${style || ''}">${cells.join('')}</div>`;
  /* table: cols [{l, k (term), r (right align), w}], rows [[cells]] (cells raw HTML), opts {tot: [cells], cls} */
  DK.t = (cols, rows, o) => {
    o = o || {};
    return `<table class="t"><thead><tr>${cols.map((c) => `<th style="${c.w ? 'width:' + c.w : ''}${c.r ? ';text-align:right' : ''}">${c.k ? TS.term(esc(c.l), c.k) : esc(c.l)}</th>`).join('')}</tr></thead><tbody>${rows.map((r) => `<tr>${r.map((v, i) => `<td class="v ${cols[i] && cols[i].r ? 'r' : ''}">${v}</td>`).join('')}</tr>`).join('')}${o.tot ? `<tr class="tot">${o.tot.map((v, i) => `<td class="${cols[i] && cols[i].r ? 'r' : ''}">${v}</td>`).join('')}</tr>` : ''}</tbody></table>`;
  };
  /* letterhead: {mark, color, co, sub, title, titleKey, ref} */
  DK.lh = (o) => `<div class="lh"><div class="logo"><div class="mark" style="background:${o.color || '#0b4f71'}">${esc(o.mark)}</div><div class="co">${esc(o.co)}<small>${o.sub || ''}</small></div></div><div class="ttl"><b>${o.titleKey ? TS.term(esc(o.title), o.titleKey) : esc(o.title)}</b><small>${o.ref || ''}</small></div></div>`;
  DK.page = (inner, o) => {
    o = o || {};
    return `<div class="rd-wrap"><div class="rd"><div class="wm"><span>${esc(o.wm || 'SPECIMEN · TRAINING')}</span></div>${inner}<div class="foot"><span>${esc(o.foot || 'Training Shipping simulator — fictional parties, specimen document, not valid for any real transaction.')}</span><span>${esc(o.page || 'Page 1 of 1')}</span></div></div></div>`;
  };
  DK.sig = (items) => `<div class="sig">${items.map((x) => `<div>${x}</div>`).join('')}</div>`;
  DK.d = (iso) => { if (!iso) return ''; const d = new Date(iso + 'T00:00:00Z'); return String(d.getUTCDate()).padStart(2, '0') + '-' + ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'][d.getUTCMonth()] + '-' + d.getUTCFullYear(); };
  DK.n = (x, d) => TS.num(x, d == null ? 2 : d);
  DK.m = (x) => Number(x || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  DK.party = (p, extra) => (p ? [p.name, p.address, p.reg, p.phone ? 'Tel ' + p.phone : '', p.email, extra].filter(Boolean).join('\n') : '');

  /* amount in words (English, as printed on invoices) */
  const ONES = ['', 'ONE', 'TWO', 'THREE', 'FOUR', 'FIVE', 'SIX', 'SEVEN', 'EIGHT', 'NINE', 'TEN', 'ELEVEN', 'TWELVE', 'THIRTEEN', 'FOURTEEN', 'FIFTEEN', 'SIXTEEN', 'SEVENTEEN', 'EIGHTEEN', 'NINETEEN'];
  const TENS = ['', '', 'TWENTY', 'THIRTY', 'FORTY', 'FIFTY', 'SIXTY', 'SEVENTY', 'EIGHTY', 'NINETY'];
  const w999 = (n) => { let s = ''; if (n >= 100) { s += ONES[Math.floor(n / 100)] + ' HUNDRED'; n %= 100; if (n) s += ' AND '; } if (n >= 20) { s += TENS[Math.floor(n / 10)]; if (n % 10) s += '-' + ONES[n % 10]; } else if (n) s += ONES[n]; return s; };
  DK.words = (amount, cur) => {
    const v = Math.round(Number(amount || 0) * 100), int = Math.floor(v / 100), cents = v % 100;
    const parts = []; let n = int;
    [[1e9, 'BILLION'], [1e6, 'MILLION'], [1e3, 'THOUSAND']].forEach(([u, name]) => { if (n >= u) { parts.push(w999(Math.floor(n / u)) + ' ' + name); n %= u; } });
    if (n) parts.push(w999(n));
    return 'SAY ' + (cur || 'US DOLLARS') + ' ' + (parts.join(' ') || 'ZERO') + (cents ? ' AND CENTS ' + String(cents).padStart(2, '0') : '') + ' ONLY';
  };

  /* fictional letterheads */
  DK.heads = {
    pft: { mark: 'PFT', color: '#0b4f71', co: 'PHOENICIA FREIGHT TRAINING SAL', sub: 'International Freight Forwarders · NVOCC · Licensed Customs Broker<br>Port Road, Medawar, Beirut, Lebanon · Tel +961 1 400 400 · VAT No. 3001234-601 · CR Beirut 2001/12345' },
    carrier: (s) => { const n = (s.booking && s.booking.carrierName) || (s.rates && s.rates.selected && s.rates.selected.carrierName) || 'Shipping Line'; const col = { 'CMA CGM': '#04246a', MSC: '#b8860b', Maersk: '#3c7fa8', 'COSCO Shipping': '#1a3d8f', 'Hapag-Lloyd': '#e2611a' }[n] || '#333'; return { mark: n.split(/[\s-]/).map((x) => x[0]).join('').slice(0, 3).toUpperCase(), color: col, co: n.toUpperCase() + ' — BEIRUT AGENCY', sub: 'As agents for the carrier · Port area, Beirut, Lebanon<br>Training specimen — not issued by ' + esc(n) }; },
    hongda: { mark: 'HD', color: '#8a1c1c', co: 'SHANGHAI HONGDA FURNITURE CO., LTD.', sub: 'No. 88 Xinqiao Industrial Road, Songjiang District, Shanghai, China · Tel +86 21 5774 8800' },
    bekaa: { mark: 'BVF', color: '#4f7a28', co: 'BEKAA VALLEY FOODS SARL', sub: 'Zahle Industrial Area, Zahle, Bekaa, Lebanon · Tel +961 8 811 900 · VAT No. 1188776-601 · CR Zahle 2008/1190' },
    huangpu: { mark: 'HP', color: '#2d5f8b', co: 'HUANGPU LOGISTICS CO., LTD.', sub: 'Room 1805, 99 Siping Road, Shanghai, China · Origin agent of Phoenicia Freight Training SAL' },
    elbe: { mark: 'EF', color: '#24557a', co: 'ELBE FORWARDING GMBH', sub: 'Am Sandtorkai 40, 20457 Hamburg, Germany · Destination agent' },
    trucker: { mark: 'AA', color: '#6b4c1e', co: 'AL AMAL TRANSPORT SARL', sub: 'Choueifat, Mount Lebanon · Tel +961 3 777 010' },
    terminal: { mark: 'BCT', color: '#1f3b57', co: 'BEIRUT CONTAINER TERMINAL', sub: 'Port of Beirut, Lebanon · Training specimen' },
    depot: { mark: 'KD', color: '#3d4f5c', co: 'KARANTINA EMPTY CONTAINER DEPOT', sub: 'Karantina, Beirut, Lebanon · Training specimen' },
    customs: { mark: 'LC', color: '#7a1d1d', co: 'LEBANESE CUSTOMS — TRAINING SPECIMEN', sub: 'Simulated NAJM output for training. Not an official document of the Lebanese Customs Administration.' },
    chamberZ: { mark: 'CCIZ', color: '#5a3e85', co: 'CHAMBER OF COMMERCE, INDUSTRY & AGRICULTURE OF ZAHLE & BEKAA', sub: 'Training specimen — not issued by the Chamber' },
    chamberCN: { mark: 'CoC', color: '#9b2c2c', co: 'CHAMBER OF COMMERCE — ORIGIN CERTIFICATION (CHINA)', sub: 'Training specimen — not an official certificate' },
    moa: { mark: 'MoA', color: '#2e6b3a', co: 'REPUBLIC OF LEBANON — MINISTRY OF AGRICULTURE', sub: 'Training specimen — not an official certificate' },
  };

  /* the supplier's detailed invoice lines for each scenario (shared by Operations, Customs, Accounting documents) */
  TS.cargoItems = (s) => (s.direction === 'import'
    ? [
      { id: 'T', desc: 'Wooden dining tables, knocked down', descAr: 'طاولات سفرة خشبية مفكّكة', hsGiven: '9403.60', hs: '9403.60', qty: 30, unit: 'pcs', pkgs: 30, ctn: '1–30', gross: 3600, net: 3300, value: 21500, price: 716.67, dims: '120×80×60 cm', model: 'HD-DT1800 oak veneer' },
      { id: 'C', desc: 'Wooden dining chairs, not upholstered', descAr: 'كراسي سفرة خشبية غير منجّدة', hsGiven: '9403.60', hs: '9401.69', qty: 180, unit: 'pcs', pkgs: 90, ctn: '31–120', gross: 4800, net: 4500, value: 17000, price: 94.44, dims: '120×80×60 cm', model: 'HD-CH45 solid beech (2 pcs/ctn)' },
    ]
    : [
      { id: 'H', desc: 'Tahini (sesame paste) in glass jars, 24 × 900 g per carton, on pallets', descAr: 'طحينة في مرطبانات زجاجية، 24 × 900 غ في الكرتونة، على طبليات', hsGiven: '2008.19', hs: '2008.19', qty: 20, unit: 'pallets', pkgs: 20, ctn: 'P1–P20', gross: 17000, net: 15600, value: 42000, price: 2100, dims: '120×100×110 cm', model: '722 cartons × 24 jars × 900 g' },
    ]);

  /* ---------------- shared commercial documents (used by every department) ---------------- */
  const PORTS = { LBBEY: 'Beirut, Lebanon', LBKYE: 'Tripoli, Lebanon', CNSHA: 'Shanghai, China', CNNGB: 'Ningbo, China', DEHAM: 'Hamburg, Germany', NLRTM: 'Rotterdam, Netherlands', EGPSD: 'Port Said, Egypt', MZBEW: 'Beira, Mozambique', SAJED: 'Jeddah, Saudi Arabia', AEJEA: 'Jebel Ali, UAE' };
  DK.port = (code) => code + ' ' + (PORTS[code] || '');
  DK.seed = (s) => s.id.split('').reduce((a, ch) => (a * 31 + ch.charCodeAt(0)) % 999983, 7);
  DK.marks = (s) => (s.direction === 'import' ? 'CEDAR HOME\nBEIRUT\nC/NO. 1-120\nMADE IN CHINA' : 'LEVANTE FEINKOST\nHAMBURG\nP1-P20\nPRODUCT OF LEBANON');
  DK.invNo = (s) => (s.direction === 'import' ? 'HD-2026-' + (DK.seed(s) % 900 + 100) : 'BVF/EX/' + (DK.seed(s) % 900 + 100));
  DK.invDate = (s) => TS.addDays(s.sim.start, s.direction === 'import' ? -12 : 8);
  TS.DOCS = {};
  (function () {
    const { c, g, t, lh, page, sig, d, m, n, party, words } = DK;
    const imp = (s) => s.direction === 'import';
    const S0 = (s) => s.parties;
    const items = (s) => TS.cargoItems(s);
    const marks = DK.marks, invNo = DK.invNo, invDate = DK.invDate, portFull = DK.port;
  /* ---------------- commercial invoice ---------------- */
  function commercialInvoice(s) {
    const it = items(s), S = S0(s), seller = S.shipper, buyer = S.consignee;
    const head = imp(s) ? DK.heads.hongda : DK.heads.bekaa;
    const total = it.reduce((a, x) => a + x.value, 0);
    return page(lh(Object.assign({ title: 'COMMERCIAL INVOICE', titleKey: 'ci', ref: 'Invoice No. ' + invNo(s) + '<br>Date ' + d(invDate(s)) }, head)) +
      g([
        c(6, 'Seller / Exporter', 'shipper', party(seller), { h: 72 }), c(3, 'Invoice No. & date', null, invNo(s) + '\n' + d(invDate(s))), c(3, imp(s) ? 'Contract / PO No.' : 'Buyer’s order No.', null, imp(s) ? 'PO CH-2026-114' : 'LF-PO-77812'),
        c(6, 'Buyer / Consignee', 'consignee', party(buyer), { h: 72 }), c(3, 'Terms of payment', imp(s) ? 'tt' : 'cad', imp(s) ? '30% T/T advance, 70% T/T against copy B/L' : 'Cash against documents (D/P) through buyer’s bank'), c(3, 'Delivery terms', 'incoterm', s.jobFile.incoterm + ' ' + s.jobFile.namedPlace + ' (Incoterms 2020)'),
        c(3, 'Port of loading', 'pol', portFull(s.jobFile.pol)), c(3, 'Port of discharge', 'pod', portFull(s.jobFile.pod)), c(3, 'Country of origin', 'origin', imp(s) ? 'CHINA' : 'LEBANON'), c(3, 'Vessel / voyage', 'vessel', s.booking ? s.booking.vessel + ' ' + s.booking.voyage : 'TBA'),
      ]) +
      t([{ l: 'Marks & numbers', k: 'marks', w: '110px' }, { l: 'Description of goods', k: 'desc' }, { l: 'HS code', k: 'hscode' }, { l: 'Qty', r: 1 }, { l: 'Unit price', r: 1 }, { l: 'Amount USD', r: 1 }],
        it.map((x, i) => [i === 0 ? esc(marks(s)).replace(/\n/g, '<br>') : '', esc(x.desc) + '<br><small>' + esc(x.model) + '</small>', esc(x.hs), n(x.qty, 0) + ' ' + esc(x.unit), m(x.price), m(x.value)]),
        { tot: ['', 'TOTAL ' + s.jobFile.incoterm + ' ' + s.jobFile.namedPlace, '', n(it.reduce((a, x) => a + x.pkgs, 0), 0) + ' ' + s.jobFile.pkgType.toUpperCase(), '', m(total)] }) +
      `<p class="v" style="font-family:Courier New;font-weight:700">${esc(words(total))}</p>` +
      g([c(4, 'Total packages', 'pkgs', s.jobFile.packages + ' ' + s.jobFile.pkgType.toUpperCase()), c(4, 'Total net weight', 'net', n(it.reduce((a, x) => a + x.net, 0), 0) + ' KGS'), c(4, 'Total gross weight', 'gross', n(s.jobFile.grossKg, 0) + ' KGS'),
        c(12, 'Beneficiary bank', null, imp(s) ? 'Training Bank of Shanghai — SWIFT TBSHCNSH — A/C 6222 0000 1234 5678' : 'Training Bank of Zahle SAL — SWIFT TBZLLBBE — IBAN LB00 0000 0000 0000 0000 0000 0000')]) +
      `<p class="fine">We hereby certify that this invoice is true and correct, that the goods described are of ${imp(s) ? 'Chinese' : 'Lebanese'} origin and that the prices shown are the prices actually paid or payable.</p>` +
      sig(['Authorised signature & company stamp<br>' + esc(seller.contact || ''), '']), { page: 'Commercial invoice ' + invNo(s) });
  }

  /* ---------------- packing list ---------------- */
  function packingList(s) {
    const it = items(s), S = S0(s);
    const head = imp(s) ? DK.heads.hongda : DK.heads.bekaa;
    const cbmEach = (x) => (imp(s) ? 0.576 : 1.32) * x.pkgs;
    return page(lh(Object.assign({ title: 'PACKING LIST', titleKey: 'pl', ref: 'Ref. invoice ' + invNo(s) + '<br>Date ' + d(invDate(s)) }, head)) +
      g([c(6, 'Shipper', 'shipper', party(S.shipper), { h: 64 }), c(6, 'Consignee', 'consignee', party(S.consignee), { h: 64 }),
        c(4, 'Vessel / voyage', 'vessel', s.booking ? s.booking.vessel + ' ' + s.booking.voyage : 'TBA'), c(4, 'Container / seal', 'cntrno', s.equipment && s.equipment.containerNo ? s.equipment.containerNo + ' / ' + (s.equipment.seal || '') : 'TBA'), c(4, 'From / to', 'pol', s.jobFile.pol + ' → ' + s.jobFile.pod)]) +
      t([{ l: 'Package Nos.', k: 'marks' }, { l: 'Description', k: 'desc' }, { l: 'Qty', r: 1 }, { l: 'Pkgs', k: 'pkgs', r: 1 }, { l: 'Dimensions per pkg' }, { l: 'Net kg', k: 'net', r: 1 }, { l: 'Gross kg', k: 'gross', r: 1 }, { l: 'CBM', k: 'cbm', r: 1 }],
        it.map((x) => [esc(x.ctn), esc(x.desc), n(x.qty, 0) + ' ' + esc(x.unit), n(x.pkgs, 0), esc(x.dims), n(x.net, 0), n(x.gross, 0), n(cbmEach(x), 2)]),
        { tot: ['TOTAL', '', '', n(it.reduce((a, x) => a + x.pkgs, 0), 0), '', n(it.reduce((a, x) => a + x.net, 0), 0), n(it.reduce((a, x) => a + x.gross, 0), 0), n(s.jobFile.cbm, 2)] }) +
      `<p><b>${TS.term('Marks & numbers', 'marks')}:</b><br><span class="v" style="font-family:Courier New;white-space:pre-line">${esc(marks(s))}</span></p>` +
      (imp(s) ? '' : `<p class="fine">Pallets: heat treated wood, ${TS.term('ISPM 15', 'ispm15')} marked. Glass jars — fragile — do not stack more than 2 pallets high.</p>`) +
      sig(['Packed and checked by', 'Authorised signature & stamp']), { page: 'Packing list' });
  }

    TS.DOCS.ci = commercialInvoice;
    TS.DOCS.pl = packingList;
  })();
})();
