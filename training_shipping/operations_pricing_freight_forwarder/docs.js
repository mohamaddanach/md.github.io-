/* Operations & Pricing — realistic documents generated from the shipment JSON (any case: FCL/LCL, import/export).
 * Layouts follow the documents used in practice (B/L boxes, commercial invoice, packing list, COO, EUR.1, EIR, D/O, dock receipt…).
 * All labels are clickable terms (bilingual explanation). Every page is watermarked SPECIMEN · TRAINING. */
(function () {
  const L = TS.L, esc = TS.esc, DK = TS.DK;
  const OPS = window.OPS;
  const { c, g, t, lh, page, sig, d, m, n, party, words } = DK;
  const imp = (s) => s.direction === 'import';
  const sc = (s) => OPS.sc(s);
  const isL = (s) => sc(s).mode === 'LCL';
  const PFT = () => DK.heads.pft;
  const items = (s) => TS.cargoItems(s);
  const marks = DK.marks, invNo = DK.invNo, invDate = DK.invDate, portFull = DK.port;
  const city = (code) => OPS.port(code).city.toUpperCase();
  const eqLine = (s) => (isL(s) ? 'LCL — ' + n(s.jobFile.wm || sc(s).answer.wm) + ' W/M (CFS/CFS)' : '1 × ' + s.jobFile.equipment);
  const ISO = { '20DV': '22G1 (20′ dry)', '40DV': '42G1 (40′ dry)', '40HC': '45G1 (40′ high cube)' };
  const chamberLB = (s) => ({ mark: 'CCIA', color: '#5a3e85', co: 'CHAMBER OF COMMERCE, INDUSTRY & AGRICULTURE — LEBANON', sub: 'Training specimen — not issued by any Lebanese Chamber · Exporter: ' + esc(sc(s).client.area) });
  const chamberOrigin = (s) => ({ mark: 'CoC', color: '#9b2c2c', co: 'CHAMBER OF COMMERCE — ORIGIN CERTIFICATION (' + DK.origin(s) + ')', sub: 'Training specimen — not an official certificate' });
  const qAmt = (l) => Number(l.sell || 0) * (l.qty || 1);

  /* ---------------- quotation ---------------- */
  function quotation(s) {
    const q = s.quotation, S = sc(s), cl = S.client, r = s.rates.selected;
    const act = q.lines.filter((l) => l.group !== 'optional' || q.insurance);
    const groups = [['freight', 'OCEAN FREIGHT ' + s.jobFile.pol + ' – ' + s.jobFile.pod + (isL(s) ? ' (LCL, CFS/CFS)' : '')], ['origin', 'ORIGIN CHARGES — ' + city(s.jobFile.pol)], ['dest', 'DESTINATION CHARGES — ' + city(s.jobFile.pod)], ['optional', 'OPTIONAL SERVICES']];
    const rows = [];
    groups.forEach(([gname, title]) => {
      const ls = act.filter((l) => l.group === gname);
      if (!ls.length) return;
      rows.push([`<b>${esc(title)}</b>`, '', '', '', '', '', '']);
      ls.forEach((l) => rows.push([esc(l.code), esc(l.desc.en || l.desc), l.basis === 'cntr' ? 'Per ' + esc(s.jobFile.equipment) : l.basis === 'wm' ? 'Per W/M @ ' + m(l.sell) : 'Per B/L', n(l.qty || 1), 'USD', m(qAmt(l)), l.vat ? '11%' : 'Exempt']));
    });
    const deliv = S.services.door && imp(s) ? S.client.area + ' (door)' : !imp(s) && S.answer.incoterm === 'DAP' ? S.far.city + ' — buyer’s warehouse (DAP)' : portFull(s.jobFile.pod);
    return page(lh(Object.assign({ title: 'QUOTATION', titleKey: 'quotation', ref: 'No. ' + esc(q.no) + '<br>Date ' + d(q.date) }, PFT())) +
      g([
        c(6, 'Customer', null, party(cl) + '\nAttn: ' + cl.contact, { h: 70 }),
        c(3, 'Quotation No.', 'quotation', q.no), c(3, 'Valid until', 'validity', d(q.validTo)),
        c(3, 'Your reference', null, 'Email ' + d(s.sim.start)), c(3, 'Prepared by', null, 'Pricing desk — ' + OPS.company.pricing),
        c(3, 'Mode', isL(s) ? 'lcl' : 'fcl', 'SEA — ' + S.mode), c(3, 'Incoterms', 'incoterm', s.jobFile.incoterm + ' ' + s.jobFile.namedPlace),
        c(3, 'Port of loading', 'pol', portFull(s.jobFile.pol)), c(3, 'Port of discharge', 'pod', portFull(s.jobFile.pod)),
        c(3, 'Place of delivery', 'fpod', deliv), c(3, 'Equipment', isL(s) ? 'lcl' : 'hc', eqLine(s)),
        c(6, 'Commodity', 'desc', s.jobFile.commodity + ' — HS ' + s.jobFile.hs + ' (as advised)'), c(3, 'Gross weight', 'gross', n(s.jobFile.grossKg, 0) + ' KGS'), c(3, 'Measurement', 'measurement', n(s.jobFile.cbm, 2) + ' CBM'),
        c(3, isL(s) ? 'Consolidator' : 'Carrier', 'carrier', r.carrierName), c(3, 'Transit time', 'transit', 'approx. ' + r.transit + ' days'), c(3, 'Transshipment', 'ts', r.ts), c(3, isL(s) ? 'Free storage at POD CFS' : 'Free time at POD', 'freetime', r.free + (isL(s) ? ' days, then USD ' + m(r.storage) + '/W/M/day' : ' days combined DEM/DET')),
      ]) +
      t([{ l: 'Code', w: '50px' }, { l: 'Charge description' }, { l: 'Basis' }, { l: 'Qty', r: 1 }, { l: 'Cur' }, { l: 'Amount', r: 1 }, { l: 'VAT', k: 'vat' }], rows, { tot: ['', 'SUB-TOTAL', '', '', 'USD', m(q.totals.sell), ''] }) +
      t([{ l: '' }, { l: '', r: 1 }], [['VAT 11% on taxable local charges (base USD ' + m(q.totals.vatBase) + ')', m(q.totals.vat)]], { tot: ['TOTAL QUOTED (USD)', m(q.totals.grand)] }) +
      (q.deposit ? `<p><b>${TS.term('Container deposit', 'deposit')}:</b> USD ${m(q.deposit)} refundable, payable to the shipping line’s agent before the delivery order — not included above.</p>` : '') +
      `<h4>Terms & conditions</h4><ul class="fine">${q.conditions.map((x) => '<li>' + esc(x) + '</li>').join('')}<li>Rates exclude customs duties, taxes, inspection, storage, demurrage/detention beyond free time, and any charge not listed above.</li><li>All business is undertaken subject to our standard trading conditions, a copy of which is available on request.</li></ul>` +
      sig(['For PHOENICIA FREIGHT TRAINING SAL<br><br>Pricing department', 'Accepted by customer (name, signature, stamp, date)']), { page: 'Quotation ' + q.no });
  }

  /* ---------------- certificate of origin (incl. Arab COO) ---------------- */
  function coo(s) {
    const it = items(s), S = sc(s), x = !imp(s), arab = x && S.zone === 'ARAB';
    const no = (x ? 'LB-' : S.originCC + '-') + (OPS.seed(s) % 900000 + 100000);
    return page(lh(Object.assign({ title: arab ? 'CERTIFICATE OF ORIGIN — GAFTA' : 'CERTIFICATE OF ORIGIN', titleKey: 'coo', ref: 'No. ' + no + '<br>Original' }, x ? chamberLB(s) : chamberOrigin(s))) +
      g([
        c(6, 'Exporter (name, address, country)', 'shipper', party(S.shipper), { n: 1, h: 70 }), c(6, 'Certificate No.', 'coo', no + '\n\nCERTIFICATE OF ORIGIN\n' + (arab ? '(Greater Arab Free Trade Area — preferential)' : '(non-preferential)'), { n: '', h: 70 }),
        c(6, 'Consignee (name, address, country)', 'consignee', party(S.consignee), { n: 2, h: 70 }), c(6, 'For certifying authority use only', 'chamber', '', { n: 5, h: 70 }),
        c(6, 'Means of transport and route', 'vessel', `FROM ${portFull(s.jobFile.pol)} TO ${portFull(s.jobFile.pod)} BY SEA\n${s.booking ? s.booking.vessel + ' ' + s.booking.voyage : ''}`, { n: 3, h: 46 }), c(6, 'Country / region of destination', 'pod', DK.dest(s), { n: 4, h: 46 }),
      ]) +
      t([{ l: '6 Marks and numbers', k: 'marks', w: '120px' }, { l: '7 Number and kind of packages; description of goods', k: 'desc' }, { l: '8 HS code', k: 'hscode' }, { l: '9 Quantity', r: 1 }, { l: '10 Invoice No. and date' }],
        it.map((y, i) => [i === 0 ? esc(marks(s)).replace(/\n/g, '<br>') : '', `${y.pkgs} ${esc(String(s.jobFile.pkgType).toUpperCase())} OF ${esc(y.desc.toUpperCase())}`, esc(y.hsGiven || y.hs), n(y.qty, 0) + ' ' + esc(String(y.unit).toUpperCase()) + '<br>G.W. ' + n(y.gross, 0) + ' KGS', i === 0 ? esc(invNo(s)) + '<br>' + d(invDate(s)) : '']).concat([['', '*** TOTAL ' + s.jobFile.packages + ' ' + String(s.jobFile.pkgType).toUpperCase() + ' ONLY ***', '', '', '']])) +
      g([
        c(6, 'Declaration by the exporter', null, `The undersigned hereby declares that the above details and statements are correct, that all the goods were produced in ${DK.origin(s)} and that they comply with the rules of origin${arab ? ' of the Greater Arab Free Trade Area' : ''}.\n\n${S.shipper.name}\nPlace & date: ${x ? S.client.area : S.far.city}, ${d(x ? s.sim.today : invDate(s))}\nSignature & stamp:`, { n: 11, h: 110 }),
        c(6, 'Certification', 'chamber', `It is hereby certified that the declaration by the exporter is correct.\n\n${x ? 'Chamber of Commerce, Industry & Agriculture (Lebanon)' : 'Chamber of Commerce (origin certification)'}\nPlace & date:\nSignature & stamp of certifying authority:`, { n: 12, h: 110 }),
      ]), { page: 'Certificate of origin' });
  }

  /* ---------------- EUR.1 ---------------- */
  function eur1(s) {
    const it = items(s), S = sc(s);
    const no = 'A ' + String(OPS.seed(s) % 9000000 + 1000000);
    return page(lh(Object.assign({ title: 'MOVEMENT CERTIFICATE EUR.1', titleKey: 'eur1', ref: 'No. ' + no + '<br>See notes overleaf before completing this form' }, chamberLB(s))) +
      g([
        c(6, 'Exporter (name, full address, country)', 'shipper', party(S.shipper), { n: 1, h: 72 }),
        c(6, 'Certificate used in preferential trade between', 'preference', 'LEBANON\n\nand\n\nTHE EUROPEAN UNION\n(insert appropriate countries, groups of countries or territories)', { n: 2, h: 72, cls: 'mid' }),
        c(6, 'Consignee (name, full address, country) (optional)', 'consignee', party(S.consignee), { n: 3, h: 66 }),
        c(3, 'Country, group of countries or territory in which the products are considered as originating', 'origin', 'LEBANON', { n: 4, h: 66 }), c(3, 'Country, group of countries or territory of destination', null, 'EUROPEAN UNION (' + DK.dest(s) + ')', { n: 5, h: 66 }),
        c(6, 'Transport details (optional)', 'vessel', `By sea from ${portFull(s.jobFile.pol)} to ${portFull(s.jobFile.pod)}\n${s.booking ? s.booking.vessel + ' ' + s.booking.voyage + ' — B/L ' + ((s.documents.bl || {}).hblNo || '') : ''}`, { n: 6, h: 50 }), c(6, 'Remarks', null, '', { n: 7, h: 50 }),
        c(8, 'Item number; marks and numbers; number and kind of packages; description of goods', 'desc', it.map((y, i) => `${i + 1}. ${y.pkgs} ${String(s.jobFile.pkgType).toUpperCase()} — ${y.desc.toUpperCase()}`).join('\n') + `\n${marks(s).replace(/\n/g, ' ')}\n*******************************`, { n: 8, h: 90 }), c(2, 'Gross mass (kg) or other measure', 'gross', n(s.jobFile.grossKg, 0) + ' KG', { n: 9, h: 90 }), c(2, 'Invoices (optional)', 'ci', invNo(s) + '\n' + d(invDate(s)), { n: 10, h: 90 }),
        c(6, 'Customs or competent governmental authority endorsement', 'broker', 'Declaration certified\nExport document: ' + ((s.exportCustoms || {}).declarationNo || '__________') + '\nCustoms office: Beirut port\nIssuing country: LEBANON\nDate:\n(Signature)            (Stamp)', { n: 11, h: 110 }),
        c(6, 'Declaration by the exporter', null, 'I, the undersigned, declare that the goods described above meet the conditions required for the issue of this certificate.\n\nPlace and date: ' + S.client.area + ', ' + d(s.sim.today) + '\n\n(Signature)', { n: 12, h: 110 }),
      ]), { page: 'EUR.1 ' + no });
  }

  /* ---------------- health certificate ---------------- */
  function health(s) {
    const it = items(s), S = sc(s);
    return page(lh(Object.assign({ title: 'HEALTH CERTIFICATE', titleKey: 'healthcert', ref: 'No. MoA/HC/' + (OPS.seed(s) % 90000 + 10000) + '<br><span class="ar">شهادة صحية</span>' }, DK.heads.moa)) +
      g([c(6, 'Exporter', 'shipper', party(S.shipper), { n: 1, h: 66 }), c(6, 'Consignee', 'consignee', party(S.consignee), { n: 2, h: 66 }),
        c(4, 'Country of origin', 'origin', 'LEBANON', { n: 3 }), c(4, 'Country of destination', null, DK.dest(s), { n: 4 }), c(4, 'Means of transport', 'vessel', 'SEA — ' + (s.booking ? s.booking.vessel : ''), { n: 5 }),
        c(8, 'Description of the product', 'desc', it.map((y) => y.desc).join('\n') + '\nProducer: ' + S.shipper.name + ' · Lot: ' + DK.headFor(S.shipper).mark + '-' + d(s.sim.start).slice(3) + ' · Best before: 24 months', { n: 6, h: 54 }), c(4, 'Quantity / net weight', 'net', s.jobFile.packages + ' ' + s.jobFile.pkgType + ' / ' + n(it.reduce((a, y) => a + y.net, 0), 0) + ' kg net', { n: 7, h: 54 }),
        c(12, 'Attestation', null, 'The undersigned official certifies that the products described above were produced, processed and stored under hygienic conditions, were inspected and found fit for human consumption, and comply with the sanitary requirements of the country of destination as communicated by the exporter.', { n: 8, h: 60 }),
        c(6, 'Place and date of issue', 'issueplace', S.client.area + ', ' + d(s.sim.today), { n: 9 }), c(6, 'Official veterinarian / inspector — name, signature, stamp', null, '', { n: 10, h: 54 })]), { page: 'Health certificate' });
  }

  /* ---------------- booking confirmation ---------------- */
  function so(s) {
    const b = s.booking, S = sc(s), l = isL(s);
    const svc = { FE: 'Far East – East Med', IN: 'India – East Med', MED: 'Intra-Mediterranean', NE: 'North Europe – East Med', GULF: 'Gulf – East Med', AM: 'Americas – Med', OC: 'Oceania – Med' }[S.far.region] || 'Mediterranean';
    return page(lh(Object.assign({ title: 'BOOKING CONFIRMATION', titleKey: 'so', ref: 'Booking No. <b>' + esc(b.no) + '</b><br>Issued ' + d(b.confirmedOn) }, DK.heads.carrier(s))) +
      g([
        c(6, 'Booking party', 'forwarder', party(OPS.company), { h: 60 }), c(3, 'Booking number', 'bookingno', b.no), c(3, 'Rate reference', null, (s.rates.selected || {}).ref || ''),
        c(3, 'Shipper (as advised)', 'shipper', imp(s) ? S.agent.name : OPS.company.name), c(3, 'Service contract / quote', null, 'Spot quotation'),
        c(3, 'Vessel / voyage', 'vessel', b.vessel + ' / ' + b.voyage), c(3, 'Service', null, svc + (l ? ' — LCL consolidation' : '')), c(3, 'Port of loading', 'pol', portFull(b.pol)), c(3, 'Port of discharge', 'pod', portFull(b.pod)),
        c(3, 'Transshipment', 'ts', b.ts), c(3, 'ETD / ETA', 'etd', d(b.etd) + ' / ' + d(b.eta)), c(3, 'Equipment', l ? 'lcl' : 'hc', l ? 'LCL — ' + s.jobFile.packages + ' ' + s.jobFile.pkgType + ', ' + n(s.jobFile.cbm) + ' CBM' : b.qty + ' × ' + b.equipment + ' (COC)'), c(3, 'Commodity', 'desc', (s.jobFile.commodity || '').split(' (')[0] + ' — non-DG'),
        c(3, 'Gross weight (cargo)', 'gross', n(s.jobFile.grossKg, 0) + ' KGS'), c(3, 'Freight terms', b.freightTerms === 'Collect' ? 'collect' : 'prepaid', b.freightTerms.toUpperCase()), c(3, l ? 'Free storage at POD CFS' : 'Free time at POD', 'freetime', b.freeDays + (l ? ' days' : ' days combined DEM/DET')), c(3, 'Haulage', null, l ? 'CFS/CFS' : 'Merchant haulage (CY/CY)'),
      ]) +
      `<h4>${TS.term('Cutoff', 'cutoff')} times — local time</h4>` + (l
        ? t([{ l: 'CFS receiving from', k: 'erd' }, { l: 'SI cutoff', k: 'si' }, { l: 'CFS cutoff', k: 'cfs' }, { l: 'Documentation cutoff', k: 'cutoff' }], [[d(b.cutoffs.erd) + ' 08:00', d(b.cutoffs.si) + ' 12:00', d(b.cutoffs.cy) + ' 16:00', d(b.cutoffs.doc) + ' 12:00']])
        : t([{ l: 'Earliest receiving (ERD)', k: 'erd' }, { l: 'SI cutoff', k: 'si' }, { l: 'VGM cutoff', k: 'vgm' }, { l: 'CY cutoff', k: 'cy' }, { l: 'Documentation cutoff', k: 'cutoff' }], [[d(b.cutoffs.erd) + ' 08:00', d(b.cutoffs.si) + ' 12:00', d(b.cutoffs.vgm) + ' 12:00', d(b.cutoffs.cy) + ' 16:00', d(b.cutoffs.doc) + ' 12:00']])) +
      (l ? `<h4>Cargo delivery</h4>` + g([c(6, 'Deliver cargo to (CFS)', 'cfs', b.depot), c(6, 'Requirements', null, 'Packages marked & numbered · copy of commercial invoice and packing list with the truck · no DG')])
        : `<h4>Equipment release</h4>` + g([c(4, 'Empty pick-up depot', 'depot', b.depot), c(4, 'Release reference', null, 'REL-' + b.no), c(4, 'Full return terminal', 'terminal', imp(s) ? S.far.city + ' container terminal' : 'Beirut Container Terminal')])) +
      `<p class="fine">Please check this confirmation and advise any discrepancy immediately. ${l ? 'Cargo delivered after the CFS cutoff will be shipped with the next consolidation. Freight is invoiced on the CFS weight/measurement.' : 'Containers arriving after the CY cutoff will be rolled to the next available vessel at merchant’s cost. Shipping instructions and VGM must be received before their cutoffs.'} Booking subject to the carrier’s bill of lading terms and tariff in force.</p>` +
      sig(['Customer service — as agents for the carrier', '']), { page: 'Booking ' + b.no });
  }

  /* ---------------- dock receipt (LCL) ---------------- */
  function dr(s) {
    const b = s.booking, e = s.equipment || {}, S = sc(s);
    return page(lh(Object.assign({ title: 'DOCK RECEIPT', titleKey: 'cfs', ref: 'No. DR-' + (OPS.seed(s) % 90000 + 10000) + '<br>' + d(e.cfsReceived) }, DK.heads.carrier(s))) +
      g([c(6, 'Received from (shipper)', 'shipper', party(S.shipper), { h: 60 }), c(3, 'Booking number', 'bookingno', b.no), c(3, 'CFS', 'cfs', b.depot),
        c(4, 'Vessel / voyage', 'vessel', b.vessel + ' / ' + b.voyage), c(4, 'Port of discharge', 'pod', portFull(b.pod)), c(4, 'Received on', null, d(e.cfsReceived))]) +
      t([{ l: 'Marks & numbers', k: 'marks' }, { l: 'Packages', k: 'pkgs', r: 1 }, { l: 'Description', k: 'desc' }, { l: 'Declared CBM', r: 1 }, { l: 'Measured CBM (CFS)', k: 'measurement', r: 1 }, { l: 'Weighed kg', k: 'gross', r: 1 }],
        [[esc(marks(s)).replace(/\n/g, '<br>'), n(s.jobFile.packages, 0) + ' ' + esc(String(s.jobFile.pkgType).toUpperCase()), esc(s.jobFile.commodity), n(s.jobFile.cbm), '<b>' + n(e.measuredCbm) + '</b>', n(e.measuredKg || s.jobFile.grossKg, 0)]]) +
      g([c(4, 'Chargeable W/M', 'wm', n(Math.max(1, e.measuredCbm || 0, (e.measuredKg || 0) / 1000), 3)), c(4, 'Condition', null, 'Received in apparent good order — packages marked'), c(4, 'Consolidation container', 'cntrno', e.containerNo ? e.containerNo + ' / ' + (e.seal || '') : 'to be advised')]) +
      `<p class="fine">Freight and CFS charges are invoiced on the weight/measurement taken by the CFS. Cargo is received subject to the consolidator’s house bill of lading terms.</p>` + sig(['CFS tally clerk — signature', 'Driver — signature']), { page: 'Dock receipt' });
  }

  /* ---------------- EIR (FCL) ---------------- */
  function eir(s, kind) {
    const e = s.equipment, b = s.booking, S = sc(s);
    const originDepot = { mark: 'ED', color: '#555', co: (imp(s) ? S.far.city.toUpperCase() + ' EMPTY CONTAINER DEPOT' : 'KARANTINA EMPTY CONTAINER DEPOT'), sub: 'Training specimen' };
    const originTerm = imp(s) ? { mark: 'CT', color: '#334', co: S.far.city.toUpperCase() + ' CONTAINER TERMINAL', sub: 'Training specimen' } : DK.heads.terminal;
    const conf = { out: { head: originDepot, title: 'EIR — GATE OUT (EMPTY)', date: TS.addDays(e.stuffedOn, -1), stat: 'EMPTY', seal: '—', ref: 'Release REL-' + b.no },
      in: { head: originTerm, title: 'EIR — GATE IN (FULL)', date: e.gateIn, stat: 'FULL — EXPORT', seal: e.seal, ref: 'Booking ' + b.no },
      ret: { head: DK.heads.depot, title: 'EIR — GATE IN (EMPTY RETURN)', date: s.delivery && s.delivery.emptyReturnedOn, stat: 'EMPTY — RETURN', seal: '—', ref: 'D/O ' + ((s.release || {}).doNo || '') } }[kind];
    const lbTruck = !imp(s) || kind === 'ret';
    return page(lh(Object.assign({ title: conf.title, titleKey: 'eir', ref: 'No. EIR-' + (OPS.seed(s) % 90000 + 10000 + kind.length) + '<br>' + d(conf.date) + ' ' + (kind === 'in' ? '10:42' : '08:15') }, conf.head)) +
      g([c(4, 'Container no.', 'cntrno', e.containerNo), c(4, 'Size / type (ISO)', 'hc', ISO[e.type] || e.type), c(4, 'Status', null, conf.stat),
        c(4, 'Line / operator', 'carrier', b.carrierName), c(4, 'Reference', 'bookingno', conf.ref), c(4, 'Seal no.', 'seal', conf.seal),
        c(4, 'Tare / max gross', 'tare', n(e.tare, 0) + ' / 30,480 KG'), c(4, 'Truck plate / driver', 'trkorder', lbTruck ? (200000 + OPS.seed(s) % 99999) + ' (LB) / Abou Ali' : 'Local haulier'), c(4, 'Haulier', null, lbTruck ? OPS.parties.trucker.name : 'Supplier’s / agent’s haulier'),
        c(6, 'Condition', 'clean', kind === 'out' ? 'SOUND — clean, dry, odour-free, no holes (light test OK)' : kind === 'in' ? 'SOUND — minor dent left side panel (pre-existing)' : 'SOUND — swept clean, no damage', { h: 44 }), c(6, 'CSC plate', 'csc', 'Valid — ACEP approved', { h: 44 })]) +
      `<h4>Damage diagram (✓ = checked, no damage)</h4>` + t([{ l: 'Front' }, { l: 'Left side' }, { l: 'Right side' }, { l: 'Roof' }, { l: 'Floor' }, { l: 'Doors / gaskets' }, { l: 'Under-structure' }], [['✓', kind === 'in' ? 'Dent 20cm (old)' : '✓', '✓', '✓', '✓', '✓', '✓']]) +
      sig(['Gate clerk — signature', 'Driver — signature (received in the condition stated)']), { page: conf.title });
  }

  /* ---------------- VGM (FCL) ---------------- */
  function vgm(s) {
    const e = s.equipment;
    return page(lh(Object.assign({ title: 'VERIFIED GROSS MASS DECLARATION', titleKey: 'vgm', ref: 'SOLAS Chapter VI, Regulation 2<br>Booking ' + esc(s.booking.no) }, DK.headFor(sc(s).shipper))) +
      g([c(6, 'Shipper (as on B/L)', 'shipper', party(sc(s).shipper), { h: 62 }), c(3, 'Booking number', 'bookingno', s.booking.no), c(3, 'Carrier', 'carrier', s.booking.carrierName),
        c(4, 'Container number', 'cntrno', e.containerNo), c(4, 'Container size/type', 'hc', e.type), c(4, 'Seal number', 'seal', e.seal),
        c(6, 'Method used', 'vgm', e.vgmMethod === 'M1' ? '☒ Method 1 — weighing the packed container\n☐ Method 2 — calculated' : '☐ Method 1 — weighing the packed container\n☒ Method 2 — sum of cargo, packing, dunnage & tare', { h: 40 }), c(6, 'Weighing party / scale certificate', null, e.vgmMethod === 'M1' ? 'Certified weighbridge' : 'N/A (method 2) — cargo weighed on calibrated scale at packing', { h: 40 })]) +
      t([{ l: 'Component' }, { l: 'Weight (kg)', r: 1 }], [['Cargo gross weight (incl. packaging)', n(s.jobFile.grossKg, 0)], ['Dunnage, lashing & securing material', n(e.dunnageKg, 0)], ['Container tare (CSC plate / door)', n(e.tare, 0)]], { tot: ['VERIFIED GROSS MASS', n(e.vgm, 0)] }) +
      g([c(4, 'Authorised person (capitals)', null, (sc(s).shipper.contact || '').toUpperCase()), c(4, 'Date of declaration', null, d(e.vgmSubmitted || e.stuffedOn)), c(4, 'Signature', null, '')]) +
      `<p class="fine">I declare that the verified gross mass stated above has been obtained in accordance with SOLAS VI/2 and that it is accurate. No VGM, no loading.</p>`, { page: 'VGM ' + e.containerNo });
  }

  /* ---------------- shipping instructions ---------------- */
  function si(s) {
    const x = s.documents.si, p = x.parties, l = isL(s);
    return page(lh(Object.assign({ title: 'SHIPPING INSTRUCTIONS', titleKey: 'si', ref: 'Booking ' + esc(x.bk) + '<br>Submitted ' + d(x.submitted) }, PFT())) +
      g([c(6, 'Shipper', 'shipper', p.mblShipper, { h: 48 }), c(6, 'To', 'carrier', s.booking.carrierName + ' — documentation', { h: 48 }),
        c(6, 'Consignee', 'consignee', p.mblConsignee, { h: 48 }), c(6, 'Notify party', 'notify', p.mblNotify, { h: 48 }),
        c(3, 'Vessel / voyage', 'vessel', s.booking.vessel + ' / ' + s.booking.voyage), c(3, 'Port of loading', 'pol', portFull(s.booking.pol)), c(3, 'Port of discharge', 'pod', portFull(s.booking.pod)), c(3, 'Freight', x.ft === 'Collect' ? 'collect' : 'prepaid', 'FREIGHT ' + String(x.ft).toUpperCase())]) +
      t([{ l: 'Container / seal', k: 'cntrno' }, { l: 'Packages', k: 'pkgs', r: 1 }, { l: 'Description of goods', k: 'desc' }, { l: 'Gross weight kg', k: 'gross', r: 1 }, { l: 'CBM', k: 'cbm', r: 1 }], [[esc(x.cn) + '<br>' + esc(x.seal) + '<br>' + (l ? 'LCL — part of container' : '1 × ' + esc(s.equipment.type)), n(x.pk, 0) + ' ' + String(s.jobFile.pkgType).toUpperCase(), esc(x.desc) + '<br>HS ' + esc(s.jobFile.hs), n(x.kg, 0), n(x.cbm, 2)]]) +
      g([c(4, 'B/L type requested', 'seaway', 'Seaway bill (express release)'), c(4, 'Number of original B/Ls', 'originals', '0 (seaway)'), c(4, 'VGM', 'vgm', l ? 'Declared by the consolidator (packer)' : n(s.equipment.vgm, 0) + ' KG — submitted separately')]) +
      sig(['Phoenicia Freight Training SAL — documentation', '']), { page: 'SI ' + x.bk });
  }

  /* ---------------- bill of lading (master / house) ---------------- */
  function bl(s, house) {
    const b = s.documents.bl, p = OPS.blParties(s), j = s.jobFile, e = s.equipment, bk = s.booking, S = sc(s), l = isL(s);
    const issued = !!b.issuedOn;
    const type = house ? b.hblType || 'Original' : b.mblType || 'Seaway bill';
    const isSeaway = /SEAWAY|EXPRESS/i.test(type);
    const head = house ? Object.assign({}, PFT(), { sub: 'Acting as carrier (NVOCC) · Port Road, Medawar, Beirut, Lebanon' }) : DK.heads.carrier(s);
    const title = house ? (isSeaway ? 'SEA WAYBILL' : 'BILL OF LADING') : (isSeaway ? 'SEA WAYBILL — NON NEGOTIABLE' : 'BILL OF LADING');
    const ft = house ? (imp(s) ? 'Collect' : 'Prepaid') : bk.freightTerms;
    const deliveryAgent = house ? (imp(s) ? OPS.company.name + '\nPort Road, Medawar, Beirut\nTel +961 1 400 400' : S.agent.name + '\n' + S.agent.address) : '';
    const stampTxt = !issued ? 'DRAFT' : isSeaway ? 'NON-NEGOTIABLE' : 'ORIGINAL';
    const meas = l && e.measuredCbm ? e.measuredCbm : j.cbm;
    const yard = l ? 'CFS' : 'CY';
    return page(
      g([
        c(6, 'Shipper', 'shipper', house ? party(S.shipper) : p.mblShipper + (imp(s) ? '\n' + S.agent.address : '\n' + OPS.company.address), { n: 1, h: 74 }),
        `<div class="c" style="grid-column:span 6;min-height:74px">${lh(Object.assign({ title, titleKey: house ? 'hbl' : (isSeaway ? 'seaway' : 'mbl'), ref: `${TS.term('B/L No.', 'blno')} <b>${esc(house ? b.hblNo : b.mblNo)}</b><br>${TS.term('Booking No.', 'bookingno')} ${esc(bk.no)}` }, head)).replace('class="lh"', 'class="lh" style="border:0;margin:0;padding:0"')}</div>`,
        c(6, 'Consignee (or order)', 'consignee', house ? (p.hblConsignee === 'TO ORDER' ? 'TO ORDER' : party(S.consignee)) : p.mblConsignee + (imp(s) ? '\n' + OPS.company.address : '\n' + S.agent.address), { n: 2, h: 74 }),
        c(3, 'Export references', null, (house ? 'Inv. ' + invNo(s) : 'Ref ' + s.id) + '\n' + ((s.exportCustoms || {}).declarationNo || ''), { n: 4, h: 74 }),
        c(3, house ? 'For delivery of goods please apply to' : 'Forwarding agent', house ? 'agent' : 'forwarder', house ? deliveryAgent : OPS.company.name, { n: 5, h: 74 }),
        c(6, 'Notify party (no claim attaches to carrier for failure to notify)', 'notify', house ? party(S.notify) : p.mblNotify, { n: 3, h: 64 }),
        c(3, 'Point and country of origin', 'origin', DK.origin(s), { n: 6, h: 64 }), c(3, 'Type of move', l ? 'lcl' : 'fcl', l ? 'LCL/LCL  CFS/CFS' : 'FCL/FCL  CY/CY', { n: 7, h: 64 }),
        c(3, 'Pre-carriage by', 'precarriage', 'TRUCK', { n: 8 }), c(3, 'Place of receipt', 'por', city(j.pol) + ' ' + yard, { n: 9 }),
        c(3, 'Ocean vessel / voyage no.', 'vessel', bk.vessel + ' / ' + bk.voyage, { n: 10 }), c(3, 'Port of loading', 'pol', portFull(j.pol).toUpperCase(), { n: 11 }),
        c(3, 'Port of discharge', 'pod', portFull(j.pod).toUpperCase(), { n: 12 }), c(3, 'Place of delivery', 'fpod', city(j.pod) + ' ' + yard, { n: 13 }),
        c(6, 'Transshipment / onward routing (for merchant’s reference only)', 'ts', 'VIA ' + String(bk.ts).toUpperCase() + (bk.connectingVessel ? ' / ' + bk.connectingVessel : ''), { n: 14 }),
      ]) +
      `<div style="border:1px solid #111;border-top:0;padding:2px 5px;font-size:8px;font-weight:700;text-align:center">PARTICULARS FURNISHED BY THE SHIPPER — NOT CHECKED BY THE CARRIER — CARRIER NOT RESPONSIBLE</div>` +
      t([{ l: 'Container no. / seal no. / marks & numbers', k: 'marks', w: '150px' }, { l: 'No. of containers or packages', k: 'pkgs', w: '90px' }, { l: 'Kind of packages; description of goods', k: 'desc' }, { l: 'Gross weight', k: 'gross', r: 1, w: '80px' }, { l: 'Measurement', k: 'measurement', r: 1, w: '70px' }],
        [[esc(e.containerNo) + '<br>' + esc(e.type) + '<br>SEAL ' + esc(e.seal) + '<br><br>' + esc(marks(s)).replace(/\n/g, '<br>'), (l ? 'PART OF 1 CNTR' : '1 × ' + esc(e.type)) + '<br>' + j.packages + ' ' + esc(String(j.pkgType).toUpperCase()), `${l ? '' : TS.term('SHIPPER’S LOAD, STOW & COUNT', 'slsc') + '<br>'}${TS.term('SAID TO CONTAIN', 'stc')}:<br>${j.packages} ${esc(String(j.pkgType).toUpperCase())} OF ${esc(j.commodity.toUpperCase())}<br>HS CODE ${esc(j.hs)}<br><br>${house ? 'NET WEIGHT ' + n(items(s).reduce((a, x) => a + x.net, 0), 0) + ' KGS<br>' : ''}FREIGHT ${ft.toUpperCase()}<br>${!imp(s) && S.zone === 'EU' ? TS.term('EUR.1', 'eur1') + ' ISSUED' : ''}`, n(j.grossKg, 0) + ' KGS', n(meas, 3) + ' CBM']],
        { tot: ['', l ? 'TOTAL: ' + j.packages + ' PACKAGES ONLY' : 'TOTAL: ONE (1) CONTAINER ONLY', `Total packages in words: ${words(j.packages).replace('SAY US DOLLARS ', '').replace(' ONLY', '')} ${String(j.pkgType).toUpperCase()} ONLY`, '', ''] }) +
      t([{ l: 'Freight & charges', k: 'of' }, { l: 'Revenue tons' }, { l: 'Rate' }, { l: 'Per' }, { l: 'Prepaid', k: 'prepaid', r: 1 }, { l: 'Collect', k: 'collect', r: 1 }], [['OCEAN FREIGHT & SURCHARGES', l ? n(Math.max(1, (s.lclAdj && s.lclAdj.wmNew) || j.wm || 1), 3) : '1', 'AS ARRANGED', l ? 'W/M' : 'CNTR', ft === 'Prepaid' ? 'AS ARRANGED' : '', ft === 'Collect' ? 'AS ARRANGED' : '']]) +
      g([
        c(3, 'Freight payable at', 'payableat', ft === 'Prepaid' ? city(j.pol) : city(j.pod) + ' (DESTINATION)', { n: 15 }), c(3, 'Number of original B/Ls', 'originals', isSeaway ? 'ZERO (0) — SEA WAYBILL' : 'THREE (3)', { n: 16 }),
        c(3, 'Place and date of issue', 'issueplace', city(j.pol) + ', ' + (issued ? d(b.issuedOn) : '—'), { n: 17 }), c(3, 'Shipped on board date', 'onboard', issued ? d(bk.atd || bk.etd) : '—', { n: 18 }),
        `<div class="c" style="grid-column:span 8"><p class="fine" style="margin:0">RECEIVED by the Carrier the Goods as specified above in apparent good order and condition unless otherwise stated, to be transported to such place as agreed, authorised or permitted herein and subject to all the terms and conditions appearing on the front and reverse of this Bill of Lading, to which the Merchant agrees by accepting this Bill of Lading. ${isSeaway ? 'This Sea Waybill is not a document of title; delivery will be made to the named consignee or its authorised agent on proof of identity.' : 'One original Bill of Lading, duly endorsed, must be surrendered in exchange for the Goods or a delivery order. In witness whereof the number of original Bills of Lading stated above has been signed, one of which being accomplished, the others to stand void.'}</p></div>`,
        `<div class="c" style="grid-column:span 4;text-align:center">${DK.lbl('Signed for the carrier', house ? 'nvocc' : 'carrier')}<div style="margin:8px 0"><span class="stampx ${stampTxt === 'DRAFT' ? 'red' : 'blue'}">${stampTxt}</span></div>${issued ? `<span class="stampx green" style="font-size:9px">${TS.term('SHIPPED ON BOARD', 'onboard')} ${d(bk.atd || bk.etd)}</span>` : ''}<div style="font-size:8px;margin-top:6px">${house ? 'PHOENICIA FREIGHT TRAINING SAL as carrier' : 'As agents for the carrier ' + esc(bk.carrierName)}</div></div>`,
      ]), { page: (house ? 'House' : 'Master') + ' B/L ' + (house ? b.hblNo : b.mblNo) });
  }

  /* ---------------- arrival notice ---------------- */
  function an(s) {
    const a = s.documents.arrivalNotice, q = s.quotation, S = sc(s), l = isL(s);
    const act = q.lines.filter((x) => x.group !== 'optional' || q.insurance);
    const extra = s.lclAdj && s.lclAdj.sell ? [['W/M adjustment after CFS measurement', 'Exempt', m(s.lclAdj.sell)]] : [];
    return page(lh(Object.assign({ title: 'ARRIVAL NOTICE', titleKey: 'an', ref: 'HBL ' + esc(s.documents.bl.hblNo) + '<br>Issued ' + d(a.date) }, PFT())) +
      g([c(6, 'Consignee', 'consignee', party(S.consignee), { h: 66 }), c(6, 'Notify party', 'notify', party(S.notify), { h: 66 }),
        c(3, 'Vessel / voyage', 'vessel', (s.booking.connectingVessel || s.booking.vessel)), c(3, 'ETA Beirut', 'eta', d(a.eta)), c(3, 'Port of loading', 'pol', portFull(s.jobFile.pol)), c(3, 'Port of discharge', 'pod', portFull(s.jobFile.pod)),
        c(3, 'House B/L', 'hbl', s.documents.bl.hblNo), c(3, 'Master B/L', 'mbl', s.documents.bl.mblNo), c(3, l ? 'Container (LCL)' : 'Container / seal', 'cntrno', s.equipment.containerNo + ' / ' + s.equipment.seal), c(3, l ? 'Free storage (CFS)' : 'Free time', 'freetime', a.freeDays + (l ? ' days from unstuffing' : ' days from discharge')),
        c(6, 'Description', 'desc', s.jobFile.packages + ' ' + String(s.jobFile.pkgType).toUpperCase() + ' — ' + s.jobFile.commodity), c(3, 'Gross weight', 'gross', n(s.jobFile.grossKg, 0) + ' KGS'), c(3, 'Measurement', 'measurement', n((l && s.equipment.measuredCbm) || s.jobFile.cbm) + ' CBM')]) +
      t([{ l: 'Charges payable before release' }, { l: 'VAT', k: 'vat' }, { l: 'USD', r: 1 }], act.map((x) => [esc(x.desc.en || x.desc) + ((x.qty || 1) !== 1 ? ' (' + n(x.qty) + ' × ' + m(x.sell) + ')' : ''), x.vat ? '11%' : 'Exempt', m(qAmt(x))]).concat(extra).concat([['VAT 11%', '', m(q.totals.vat)]]), { tot: ['TOTAL DUE', '', m(a.totalDue)] }) +
      `<p>${a.deposit ? `<b>${TS.term('Container deposit', 'deposit')}</b>: USD ${m(a.deposit)} (cheque or bank guarantee to the line’s agent before the ${TS.term('D/O', 'do')}).<br>` : ''}<b>Documents required for customs</b>: commercial invoice, packing list, certificate of origin, commercial registration & VAT certificate${S.licence ? ', import approval for the product' : ''}.</p>
      <p class="fine">ETA is an estimate given by the carrier. ${l ? 'CFS storage after the free days' : 'Demurrage, detention and port storage after free time'} are for the consignee’s account. Cargo is released only against full payment and the release of the B/L.</p>`, { page: 'Arrival notice' });
  }

  /* ---------------- delivery order ---------------- */
  function dor(s) {
    const r = s.release, S = sc(s), l = isL(s);
    return page(lh(Object.assign({ title: 'DELIVERY ORDER', titleKey: 'do', ref: 'D/O No. <b>' + esc(r.doNo) + '</b><br>Date ' + d(r.doDate) }, DK.heads.carrier(s))) +
      g([c(6, 'To', 'terminal', (l ? 'The CFS Manager — ' + S.cfs : 'The Terminal Manager — Beirut Container Terminal') + '\nThe Lebanese Customs Administration', { h: 48 }), c(6, 'Please deliver to', 'consignee', OPS.company.name + ' or order\n(for account of ' + S.consignee.name + ')', { h: 48 }),
        c(4, 'Vessel / voyage', 'vessel', (s.booking.connectingVessel || s.booking.vessel) + ' / ' + s.booking.voyage), c(4, 'Arrival / discharge', 'atd', d(s.booking.revisedEta)), c(4, 'Bill of lading', 'mbl', s.documents.bl.mblNo + ' (sea waybill)'),
        c(4, 'Manifest ref.', 'manifest', 'MF/' + s.booking.revisedEta.slice(0, 4) + '/' + (OPS.seed(s) % 9000 + 1000)), c(4, 'Port of loading', 'pol', portFull(s.jobFile.pol)), c(4, 'Valid until', 'validity', d(TS.addDays(r.doDate, 10)))]) +
      t([{ l: l ? 'HBL / container' : 'Container / seal', k: 'cntrno' }, { l: 'Type' }, { l: 'Packages', k: 'pkgs' }, { l: 'Description', k: 'desc' }, { l: 'Gross kg', k: 'gross', r: 1 }], [[l ? esc(s.documents.bl.hblNo) + ' / ex ' + esc(s.equipment.containerNo) : esc(s.equipment.containerNo) + ' / ' + esc(s.equipment.seal), l ? 'LCL' : esc(s.equipment.type), s.jobFile.packages + ' ' + esc(String(s.jobFile.pkgType).toUpperCase()), esc(s.jobFile.commodity), n(s.jobFile.grossKg, 0)]]) +
      g(l ? [c(6, 'Freight, CFS & D/O charges', 'collect', 'PAID — USD ' + m(r.paidToLine)), c(6, 'Free storage', 'freetime', s.booking.freeDays + ' days from unstuffing'), c(12, 'Conditions', null, 'Delivery subject to customs release. Storage after the free days charged per W/M per day as per tariff. Packages to be counted at delivery; shortages to be noted on the delivery receipt.')]
        : [c(4, 'Freight & local charges', 'collect', 'PAID — USD ' + m(r.paidToLine)), c(4, 'Container deposit received', 'deposit', 'USD ' + m(r.deposit)), c(4, 'Empty return depot', 'depot', S.depot), c(12, 'Conditions', null, 'Delivery subject to customs release. Free time ' + s.booking.freeDays + ' days from discharge, thereafter detention as per tariff. Container to be returned clean and undamaged; damage and cleaning charged against the deposit.')]) +
      sig(['For the carrier — as agents', 'Received by (name, ID, signature)']), { page: 'Delivery order ' + r.doNo });
  }

  /* ---------------- trucking order (export pick-up or import delivery) ---------------- */
  function trk(s) {
    const dl = s.delivery || {}, S = sc(s), l = isL(s), bk = s.booking;
    const delivery = imp(s) && dl.deliveredOn;
    const date = delivery ? dl.deliveredOn : (s.work.stuffing && s.work.stuffing.data.stuffDate) || bk.cutoffs.erd;
    const ref = l ? 'HBL ' + ((s.documents.bl || {}).hblNo || bk.no) : s.equipment && s.equipment.containerNo ? s.equipment.containerNo : 'Booking ' + bk.no;
    const from = delivery ? (l ? S.cfs : 'Beirut Container Terminal') + '\nD/O ' + s.release.doNo + ' · customs released' : imp(s) ? S.shipper.address : (l ? S.client.address + '\n(collect cargo)' : bk.depot + '\n(empty pick-up)');
    const to = delivery ? S.client.address + '\nContact: ' + S.client.contact + ' ' + S.client.phone : l ? bk.depot + '\n(CFS — before cutoff ' + d(bk.cutoffs.cy) + ')' : S.client.address + ' (live loading) → Beirut Container Terminal';
    return page(lh(Object.assign({ title: 'TRUCKING ORDER', titleKey: 'trkorder', ref: 'No. TO-' + s.id.slice(-4) + (delivery ? '-2' : '-1') + '<br>' + d(TS.addDays(date, -1)) }, PFT())) +
      g([c(6, 'Haulier', null, imp(s) && !delivery ? S.agent.name + ' (arranges local haulier)' : party(OPS.parties.trucker), { h: 52 }), c(6, 'Job reference', null, s.id + '\nBooking ' + bk.no, { h: 52 }),
        c(4, l ? 'Cargo' : 'Container no.', 'cntrno', l ? s.jobFile.packages + ' ' + s.jobFile.pkgType + ' / ' + n(s.jobFile.cbm) + ' CBM' : ref), c(4, 'Size / type', l ? 'lcl' : 'hc', l ? 'LCL (loose cargo)' : (s.equipment && s.equipment.type) || bk.equipment), c(4, 'Gross weight', 'gross', n(s.jobFile.grossKg, 0) + ' KG' + (!l && s.equipment && s.equipment.vgm ? ' (VGM ' + n(s.equipment.vgm, 0) + ')' : '')),
        c(6, 'Pick-up', 'terminal', from, { h: 44 }), c(6, 'Deliver to', 'consignee', to, { h: 44 }),
        c(4, 'Date', null, d(date) + ' 08:00'), c(4, delivery ? 'Unloading' : 'Loading', null, delivery ? 'By consignee — live unloading' : 'By shipper — live loading'), c(4, delivery ? 'Empty return to' : 'Cutoff', 'depot', delivery ? (dl.depot || '—') : d(bk.cutoffs.cy))]) +
      `<p class="fine">Driver must carry: ${delivery ? 'D/O, customs release, gate pass' : 'booking/release reference, commercial invoice & packing list copies'}. Check seal/packages on pick-up; report any damage on the EIR/receipt.${!l && delivery ? ' Return the empty immediately after unloading — detention after ' + bk.freeDays + ' free days is charged to the consignee.' : ''}</p>` + sig(['Phoenicia Freight Training SAL — operations', 'Haulier — accepted']), { page: 'Trucking order' });
  }

  /* ---------------- tax invoice (forwarder) ---------------- */
  function taxInvoice(s) {
    const i = s.closing.invoice, cu = i.customer;
    return page(lh(Object.assign({ title: 'TAX INVOICE', titleKey: 'taxinv', ref: '<span class="ar">فاتورة ضريبية</span><br>No. ' + esc(i.no) + ' · ' + d(i.date) }, PFT())) +
      g([c(6, 'Bill to', 'consignee', party(cu), { h: 68 }), c(3, 'Customer VAT No.', 'vat', (cu.reg || '').split('VAT ')[1] || '—'), c(3, 'Currency', null, 'USD'),
        c(3, 'Job / file', 'jobcost', s.id), c(3, 'House B/L', 'hbl', s.documents.bl.hblNo),
        c(4, 'Vessel / voyage', 'vessel', s.booking.vessel + ' ' + s.booking.voyage), c(4, 'Container', 'cntrno', s.equipment.containerNo + ' (' + (isL(s) ? 'LCL' : s.equipment.type) + ')'), c(4, 'Route', 'pol', s.jobFile.pol + ' → ' + s.jobFile.pod)]) +
      t([{ l: 'Code' }, { l: 'Description' }, { l: 'VAT', k: 'vat' }, { l: 'Amount USD', r: 1 }], i.lines.map((x) => [esc(x.code), esc(x.desc), x.vat ? '11%' : 'Exempt', m(x.amount)])) +
      t([{ l: '' }, { l: '', r: 1 }], [['Exempt / zero-rated services', m(i.lines.filter((x) => !x.vat).reduce((a, x) => a + x.amount, 0))], ['Taxable services (VAT base)', m(i.vatBase)], ['VAT 11%', m(i.vat)]], { tot: ['TOTAL DUE (USD)', m(i.total)] }) +
      `<p class="v" style="font-family:Courier New;font-weight:700">${esc(words(i.total))}</p><p>VAT amount in LBP: <b>${n(i.vatLBP, 0)}</b> at LBP ${n(i.lbpRate, 0)} / USD (sample official rate — training).</p>` +
      g([c(6, 'Bank details', null, 'Training Bank SAL — Beirut\nIBAN LB00 0000 0000 0000 0000 0000 0000 · SWIFT TRBKLBBE'), c(6, 'Payment terms', null, 'Due on receipt. Amounts received against the arrival notice are shown on your statement of account.')]) +
      sig(['Phoenicia Freight Training SAL — accounts', '']), { page: 'Tax invoice ' + i.no });
  }

  /* ---------------- job file & timeline (internal) ---------------- */
  function jobfile(s) {
    const j = s.jobFile, S = sc(s);
    return page(lh(Object.assign({ title: 'JOB FILE — REQUIREMENTS SHEET', ref: esc(s.id) + ' · client ' + esc(S.id) + '<br>Opened ' + d(s.sim.start) }, PFT())) +
      g([c(6, 'Client', null, j.client + ' (' + j.clientRole + ')'), c(6, 'Direction / scope', null, s.direction.toUpperCase() + ' ' + S.mode + ' — ' + j.scope),
        c(6, 'Shipper', 'shipper', j.shipper), c(6, 'Consignee', 'consignee', j.consignee),
        c(3, 'Incoterms', 'incoterm', j.incoterm + ' ' + j.namedPlace), c(3, 'Port of loading', 'pol', j.pol), c(3, 'Port of discharge', 'pod', j.pod), c(3, 'Equipment', S.mode === 'LCL' ? 'lcl' : 'hc', eqLine(s)),
        c(6, 'Commodity', 'desc', j.commodity), c(2, 'HS code', 'hscode', j.hs), c(2, 'DG', 'dg', j.dg), c(2, 'Ready', null, d(j.readyDate)),
        c(4, 'Packages', 'pkgs', j.packages + ' ' + j.pkgType), c(4, 'Gross weight', 'gross', n(j.grossKg, 0) + ' kg'), c(4, 'Volume', 'cbm', n(j.cbm) + ' CBM'),
        c(6, 'Payment terms (buyer/seller)', null, S.payment.en), c(6, 'Services', null, [S.services.door ? 'door delivery/pick-up' : 'port', S.services.insurance ? 'insurance' : '', 'customs clearance'].filter(Boolean).join(' · '))]), { page: 'Job file' });
  }
  function timeline(s) {
    return page(lh(Object.assign({ title: 'SHIPMENT TIMELINE', ref: esc(s.id) }, PFT())) +
      t([{ l: 'Date' }, { l: 'Milestone' }], s.milestones.map((x) => [d(x.date), esc(x.label)]).concat(s.milestones.length ? [] : [['—', '—']])) +
      (s.closing && s.closing.jobCosting ? g([c(4, 'Revenue', null, 'USD ' + m(s.closing.jobCosting.revenue)), c(4, 'Cost', null, 'USD ' + m(s.closing.jobCosting.costTotal)), c(4, 'Job profit', 'jobcost', 'USD ' + m(s.closing.jobCosting.profit) + ' (' + n(s.closing.jobCosting.margin, 1) + '%)')]) : ''), { page: 'Timeline' });
  }

  OPS.docs = {
    list(s) {
      const D = [], has = (x) => !!x, S = sc(s), l = isL(s), e = s.equipment || {};
      const add = (id, en, ar, html, when) => { if (when) D.push({ id, name: L(en, ar), html }); };
      add('timeline', 'Timeline', 'الخط الزمني', timeline, true);
      add('job', 'Job file', 'ملف العملية', jobfile, has(s.jobFile && s.jobFile.pol));
      add('quote', 'Quotation', 'عرض السعر', quotation, has(s.quotation));
      add('ci', 'Commercial invoice', 'الفاتورة التجارية', TS.DOCS.ci, has(s.jobFile && s.jobFile.pol));
      add('pl', 'Packing list', 'قائمة التعبئة', TS.DOCS.pl, has(s.jobFile && s.jobFile.pol));
      add('so', 'Booking confirmation', 'تأكيد الحجز', so, has(s.booking));
      add('trk', 'Trucking order', 'أمر النقل', trk, has(s.booking) && (imp(s) ? has(s.delivery && s.delivery.deliveredOn && S.services.door) : has(s.work.stuffing && s.work.stuffing.data.stuffDate)));
      add('dr', 'Dock receipt (CFS)', 'إيصال الاستلام (المحطة)', dr, l && has(e.cfsReceived));
      add('eirout', 'EIR empty out', 'EIR خروج فارغ', (x) => eir(x, 'out'), !l && has(e.stuffedOn));
      add('vgm', 'VGM declaration', 'تصريح VGM', vgm, !l && has(e.vgm));
      add('eirin', 'EIR gate-in full', 'EIR دخول معبّأة', (x) => eir(x, 'in'), !l && has(e.gateIn));
      add('coo', S.zone === 'ARAB' && !imp(s) ? 'Arab certificate of origin' : 'Certificate of origin', S.zone === 'ARAB' && !imp(s) ? 'شهادة المنشأ العربية' : 'شهادة المنشأ', coo, imp(s) ? has(s.documents && s.documents.preAlert) : has(s.exportCustoms));
      add('eur1', 'EUR.1', 'EUR.1', eur1, !imp(s) && S.zone === 'EU' && has(s.exportCustoms));
      add('health', 'Health certificate', 'الشهادة الصحية', health, !imp(s) && S.cargo.food && has(s.exportCustoms));
      add('si', 'Shipping instructions', 'تعليمات الشحن', si, has(s.documents && s.documents.si));
      add('mbl', l ? 'Consolidator B/L (master)' : 'Master B/L', l ? 'بوليصة المجمِّع (الرئيسية)' : 'البوليصة الرئيسية', (x) => bl(x, false), has(s.documents && s.documents.bl && s.documents.bl.mblNo));
      add('hbl', 'House B/L', 'بوليصة الوكيل', (x) => bl(x, true), has(s.documents && s.documents.bl && s.documents.bl.mblNo));
      add('an', 'Arrival notice', 'إشعار الوصول', an, imp(s) && has(s.documents && s.documents.arrivalNotice && s.documents.arrivalNotice.date));
      add('do', 'Delivery order', 'إذن التسليم', dor, has(s.release && s.release.doNo));
      add('eirret', 'EIR empty return', 'EIR إرجاع فارغ', (x) => eir(x, 'ret'), !l && imp(s) && has(s.delivery && s.delivery.emptyReturnedOn));
      add('inv', 'Tax invoice', 'الفاتورة الضريبية', taxInvoice, has(s.closing && s.closing.invoice));
      return D;
    },
    get(s, id) { return OPS.docs.list(s).find((x) => x.id === id) || null; },
  };
  OPS.docTpl = { taxInvoice, bl };
})();
