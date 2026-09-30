/* Operations & Pricing — scenario data (all companies are fictional; rates are realistic training samples) */
(function () {
  const L = TS.L;
  const OPS = (window.OPS = window.OPS || {});

  OPS.company = {
    name: 'Phoenicia Freight Training SAL',
    short: 'PFT',
    email: 'ops@phoenicia-freight.test',
    pricing: 'pricing@phoenicia-freight.test',
    address: 'Port Road, Medawar, Beirut, Lebanon',
    phone: '+961 1 400 400',
    vat: '3001234-601',
  };

  OPS.ports = [
    { code: 'LBBEY', name: 'Beirut, Lebanon' },
    { code: 'LBKYE', name: 'Tripoli, Lebanon' },
    { code: 'CNSHA', name: 'Shanghai, China' },
    { code: 'CNNGB', name: 'Ningbo, China' },
    { code: 'DEHAM', name: 'Hamburg, Germany' },
    { code: 'NLRTM', name: 'Rotterdam, Netherlands' },
    { code: 'EGPSD', name: 'Port Said, Egypt' },
    { code: 'MZBEW', name: 'Beira, Mozambique' },
    { code: 'SAJED', name: 'Jeddah, Saudi Arabia' },
    { code: 'AEJEA', name: 'Jebel Ali, UAE' },
  ];
  OPS.portName = (code) => { const p = OPS.ports.find((x) => x.code === code); return p ? p.code + ' — ' + p.name : code; };

  OPS.carriers = {
    CMA: { name: 'CMA CGM', prefix: 'CMAU', email: 'beirut.export@cmacgm-training.test', bkPrefix: 'LBY', vessels: ['CMA CGM PHOENICIA', 'CMA CGM LITANI', 'CMA CGM BYBLOS'] },
    MSC: { name: 'MSC', prefix: 'MSCU', email: 'lb.sales@msc-training.test', bkPrefix: 'MEDU', vessels: ['MSC CEDAR', 'MSC ANTHEA', 'MSC SOUR'] },
    MSK: { name: 'Maersk', prefix: 'MSKU', email: 'lb.booking@maersk-training.test', bkPrefix: '26', vessels: ['MAERSK BAALBEK', 'MAERSK SIDON', 'MAERSK ANJAR'] },
    COS: { name: 'COSCO Shipping', prefix: 'CSNU', email: 'lb.sales@cosco-training.test', bkPrefix: 'COSU', vessels: ['COSCO JOUNIEH', 'COSCO TYRE', 'COSCO BATROUN'] },
    HLC: { name: 'Hapag-Lloyd', prefix: 'HLXU', email: 'lb.sales@hlag-training.test', bkPrefix: 'HLCU', vessels: ['BEKAA EXPRESS', 'CHOUF EXPRESS', 'METN EXPRESS'] },
  };

  /* Fictional parties */
  const PARTIES = {
    cedar: { name: 'Cedar Home Furnishings SAL', contact: 'Rami Haddad', email: 'rami@cedarhome.test', phone: '+961 5 433 210', address: 'Industrial Zone, Choueifat, Mount Lebanon, Lebanon', reg: 'CR Baabda 2011/4471 — VAT 2204455-601' },
    hongda: { name: 'Shanghai Hongda Furniture Co., Ltd.', contact: 'Lily Wang', email: 'lily@hongda-furniture.test', phone: '+86 21 5774 8800', address: 'No. 88 Xinqiao Industrial Road, Songjiang District, Shanghai, China' },
    huangpu: { name: 'Huangpu Logistics Co., Ltd. (origin agent)', contact: 'Kevin Zhou', email: 'ops@huangpu-log.test', address: 'Room 1805, 99 Siping Road, Shanghai, China' },
    bekaa: { name: 'Bekaa Valley Foods SARL', contact: 'Nour Khoury', email: 'nour@bekaafoods.test', phone: '+961 8 811 900', address: 'Zahle Industrial Area, Zahle, Bekaa, Lebanon', reg: 'CR Zahle 2008/1190 — VAT 1188776-601' },
    levante: { name: 'Levante Feinkost GmbH', contact: 'Jonas Becker', email: 'j.becker@levante-feinkost.test', phone: '+49 40 3000 1200', address: 'Großmarkt 12, 20097 Hamburg, Germany' },
    elbe: { name: 'Elbe Forwarding GmbH (destination agent)', contact: 'Anna Schulz', email: 'import@elbe-fwd.test', address: 'Am Sandtorkai 40, 20457 Hamburg, Germany' },
    trucker: { name: 'Al Amal Transport SARL', contact: 'Abou Ali', email: 'dispatch@alamal-transport.test', phone: '+961 3 777 010' },
    broker: { name: 'PFT Customs Department (licensed broker)', email: 'customs@phoenicia-freight.test' },
  };
  OPS.parties = PARTIES;

  /* ---------------- scenarios ---------------- */
  OPS.scenarios = {
    IMP: {
      code: 'IMP',
      direction: 'import',
      title: L('Import FCL — furniture, Shanghai → Beirut (FOB Shanghai, door delivery Choueifat)', 'استيراد حاوية كاملة — أثاث من شنغهاي إلى بيروت (FOB شنغهاي، تسليم إلى مستودع الشويفات)'),
      summary: L('Your Lebanese client buys furniture from a Chinese supplier on FOB terms. You arrange the ocean freight, Beirut port release, customs (with the customs department) and delivery to their warehouse, until the empty container is back at the depot.', 'زبونك اللبناني يشتري أثاثًا من مورّد صيني بشرط FOB. أنت تنظّم الشحن البحري والإفراج في مرفأ بيروت والتخليص (مع قسم الجمارك) والتسليم إلى مستودعه، حتى عودة الحاوية فارغة إلى المستودع.'),
      client: PARTIES.cedar, clientRole: 'consignee',
      shipper: PARTIES.hongda, consignee: PARTIES.cedar, notify: PARTIES.cedar, agent: PARTIES.huangpu,
      cargo: {
        commodity: 'Wooden household furniture (dining tables and chairs), knocked down',
        commodityAr: 'أثاث منزلي خشبي (طاولات وكراسي سفرة)، مفكّك',
        keywords: ['furniture'],
        hs: '9403.60', packages: 120, pkgType: 'cartons', dims: [120, 80, 60], kgPer: 70, netKgPer: 65,
        value: 38500, currency: 'USD', dg: false,
      },
      answer: { equipment: '40HC', incoterm: 'FOB', namedPlace: 'Shanghai', pol: 'CNSHA', pod: 'LBBEY', scope: 'port-door', grossKg: 8400, cbm: 69.12 },
      readyOffset: 10, lane: 'SHA-BEY', delivery: 'Choueifat Industrial Zone warehouse',
      payment: L('30% advance, 70% balance against copy of B/L (T/T)', '30% دفعة مسبقة، و70% الرصيد مقابل نسخة البوليصة (تحويل)'),
      ddSide: 'destination', expectedDays: 12, depot: 'Beirut — Karantina empty depot',
      rates: [
        { c: 'CMA', of: 2450, baf: 370, lss: 85, extra: [{ code: 'CSF', name: 'Contingency / route surcharge', amt: 130 }], transit: 27, ts: 'Port Said (EGPSD)', free: 10, validDays: 30 },
        { c: 'MSC', of: 2250, baf: 350, lss: 90, extra: [{ code: 'CSF', name: 'Contingency / route surcharge', amt: 150 }], transit: 31, ts: 'Gioia Tauro (ITGIT)', free: 7, validDays: 14 },
        { c: 'MSK', of: 2600, baf: 380, lss: 85, extra: [{ code: 'EBS', name: 'Emergency bunker / route surcharge', amt: 160 }], transit: 26, ts: 'Port Said (EGPSD)', free: 14, validDays: 30 },
        { c: 'COS', of: 2320, baf: 360, lss: 80, extra: [{ code: 'CSF', name: 'Contingency / route surcharge', amt: 140 }], transit: 30, ts: 'Piraeus (GRPIR)', free: 5, validDays: 30 },
        { c: 'HLC', of: 2720, baf: 390, lss: 90, extra: [{ code: 'CSF', name: 'Contingency / route surcharge', amt: 150 }], transit: 28, ts: 'Damietta (EGDAM)', free: 10, validDays: 30 },
      ],
      ddTariff: { unit: '40′', tiers: [{ upTo: 7, rate: 30 }, { upTo: 999, rate: 60 }] },
      locals: [
        { code: 'DTHC', desc: L('Destination THC — Beirut', 'رسم مناولة المحطة في بيروت'), basis: 'cntr', buy: 285, vendor: 'carrier', vat: true, group: 'dest', sug: 310 },
        { code: 'DOF', desc: L('Delivery order fee (line agent)', 'رسم إذن التسليم (وكيل الخط)'), basis: 'bl', buy: 60, vendor: 'carrier', vat: true, group: 'dest', sug: 75 },
        { code: 'HDL', desc: L('Forwarder handling & agency fee', 'أتعاب المعالجة والوكالة'), basis: 'bl', buy: 0, vendor: 'internal', vat: true, group: 'dest', sug: 100 },
        { code: 'DOC', desc: L('Documentation fee (HBL)', 'رسم المستندات (بوليصة الوكيل)'), basis: 'bl', buy: 0, vendor: 'internal', vat: true, group: 'dest', sug: 50 },
        { code: 'CCL', desc: L('Import customs clearance (broker fee, excl. duties & VAT)', 'تخليص جمركي وارد (أتعاب المخلّص، دون الرسوم والضريبة)'), basis: 'bl', buy: 120, vendor: 'broker', vat: true, group: 'dest', sug: 200 },
        { code: 'TRK', desc: L('Trucking Beirut port → Choueifat warehouse (40′)', 'نقل بري من مرفأ بيروت إلى مستودع الشويفات (40 قدم)'), basis: 'cntr', buy: 170, vendor: 'trucker', vat: true, group: 'dest', sug: 230 },
      ],
      deposit: 1500,
      insurance: { buyPct: 0.30, sellPct: 0.40 },
    },
    EXP: {
      code: 'EXP',
      direction: 'export',
      title: L('Export FCL — tahini, Zahle → Hamburg (CFR Hamburg)', 'تصدير حاوية كاملة — طحينة من زحلة إلى هامبورغ (CFR هامبورغ)'),
      summary: L('A Lebanese food producer sells tahini to a German importer on CFR terms. You collect the container in the Bekaa, clear export, ship to Hamburg and coordinate with your German agent until the empty is returned.', 'منتج أغذية لبناني يبيع طحينة لمستورد ألماني بشرط CFR. أنت تسحب الحاوية وتعبّئها في البقاع، وتخلّص التصدير، وتشحن إلى هامبورغ، وتنسّق مع وكيلك الألماني حتى إرجاع الحاوية فارغة.'),
      client: PARTIES.bekaa, clientRole: 'shipper',
      shipper: PARTIES.bekaa, consignee: PARTIES.levante, notify: PARTIES.levante, agent: PARTIES.elbe,
      cargo: {
        commodity: 'Tahini (sesame paste) in glass jars, packed in cartons on pallets',
        commodityAr: 'طحينة (معجون السمسم) في مرطبانات زجاجية، معبّأة في كراتين على طبليات',
        keywords: ['tahini'],
        hs: '2008.19', packages: 20, pkgType: 'pallets', dims: [120, 100, 110], kgPer: 850, netKgPer: 780,
        value: 42000, currency: 'USD', dg: false,
      },
      answer: { equipment: '20DV', incoterm: 'CFR', namedPlace: 'Hamburg', pol: 'LBBEY', pod: 'DEHAM', scope: 'door-port', grossKg: 17000, cbm: 26.4 },
      readyOffset: 10, lane: 'BEY-HAM', delivery: 'Zahle Industrial Area (loading at shipper)',
      payment: L('Cash Against Documents (CAD) through the buyer’s bank', 'الدفع مقابل المستندات عبر مصرف المشتري'),
      ddSide: 'destination', expectedDays: 9, depot: 'Beirut — Karantina empty depot',
      rates: [
        { c: 'CMA', of: 1350, baf: 210, lss: 45, extra: [{ code: 'ENS', name: 'EU ICS2 / ENS filing fee', amt: 35 }], transit: 13, ts: 'Malta (MTMAR)', free: 7, validDays: 30 },
        { c: 'MSC', of: 1180, baf: 200, lss: 45, extra: [{ code: 'ENS', name: 'EU ICS2 / ENS filing fee', amt: 35 }], transit: 18, ts: 'Gioia Tauro (ITGIT)', free: 7, validDays: 12 },
        { c: 'MSK', of: 1420, baf: 215, lss: 40, extra: [{ code: 'ENS', name: 'EU ICS2 / ENS filing fee', amt: 35 }], transit: 12, ts: 'Algeciras (ESALG)', free: 10, validDays: 30 },
        { c: 'COS', of: 1300, baf: 205, lss: 45, extra: [{ code: 'ENS', name: 'EU ICS2 / ENS filing fee', amt: 35 }], transit: 17, ts: 'Piraeus (GRPIR)', free: 4, validDays: 30 },
        { c: 'HLC', of: 1460, baf: 220, lss: 45, extra: [{ code: 'ENS', name: 'EU ICS2 / ENS filing fee', amt: 35 }], transit: 14, ts: 'Damietta (EGDAM)', free: 7, validDays: 30 },
      ],
      ddTariff: { unit: '20′', tiers: [{ upTo: 7, rate: 25 }, { upTo: 999, rate: 50 }] },
      locals: [
        { code: 'TRK', desc: L('Trucking empty/full Beirut ↔ Zahle, live loading (20′)', 'نقل بري بيروت ↔ زحلة مع التحميل المباشر (20 قدم)'), basis: 'cntr', buy: 260, vendor: 'trucker', vat: true, group: 'origin', sug: 330 },
        { code: 'OTHC', desc: L('Origin THC — Beirut', 'رسم مناولة المحطة في بيروت (التحميل)'), basis: 'cntr', buy: 165, vendor: 'carrier', vat: true, group: 'origin', sug: 185 },
        { code: 'BLF', desc: L('B/L fee', 'رسم إصدار البوليصة'), basis: 'bl', buy: 55, vendor: 'carrier', vat: true, group: 'origin', sug: 75 },
        { code: 'SEAL', desc: L('Seal fee', 'رسم الختم'), basis: 'cntr', buy: 12, vendor: 'carrier', vat: true, group: 'origin', sug: 15 },
        { code: 'ECL', desc: L('Export customs clearance (broker fee)', 'تخليص جمركي صادر (أتعاب المخلّص)'), basis: 'bl', buy: 70, vendor: 'broker', vat: true, group: 'origin', sug: 130 },
        { code: 'COO', desc: L('Chamber COO + EUR.1 processing', 'معاملة شهادة المنشأ وEUR.1 في الغرفة'), basis: 'bl', buy: 35, vendor: 'chamber', vat: true, group: 'origin', sug: 60 },
        { code: 'HDL', desc: L('Forwarder handling fee', 'أتعاب المعالجة'), basis: 'bl', buy: 0, vendor: 'internal', vat: true, group: 'origin', sug: 90 },
      ],
      deposit: 0,
      insurance: null,
    },
  };

  /* ---------------- helpers used by the steps ---------------- */
  OPS.sc = (ship) => OPS.scenarios[ship.scenario];

  OPS.rateTotal = (r) => r.of + r.baf + r.lss + r.extra.reduce((a, x) => a + x.amt, 0);

  OPS.ddCost = (chargeableDays, tariff) => {
    let left = chargeableDays, cost = 0, from = 0;
    tariff.tiers.forEach((t) => {
      const n = Math.max(0, Math.min(left, t.upTo - from));
      cost += n * t.rate; left -= n; from = t.upTo;
    });
    return cost;
  };

  /* risk adjusted: freight + expected D&D if free time is shorter than realistic days */
  OPS.riskCost = (sc, r) => OPS.rateTotal(r) + OPS.ddCost(Math.max(0, sc.expectedDays - r.free), sc.ddTariff);

  OPS.bestRate = (ship) => {
    const sc = OPS.sc(ship);
    const valid = sc.rates.filter((r) => OPS.rateValidFor(ship, r));
    return valid.slice().sort((a, b) => OPS.riskCost(sc, a) - OPS.riskCost(sc, b))[0];
  };

  OPS.rateValidTo = (ship, r) => TS.addDays(ship.sim.start, r.validDays);
  /* the rate must still be valid on the first feasible sailing */
  OPS.rateValidFor = (ship, r) => OPS.rateValidTo(ship, r) >= TS.addDays(ship.sim.start, 19);

  OPS.schedule = (ship, cKey) => {
    const car = OPS.carriers[cKey];
    const sc = OPS.sc(ship);
    const r = sc.rates.find((x) => x.c === cKey);
    return [12, 19, 26].map((off, i) => {
      const etd = TS.addDays(ship.sim.start, off);
      return {
        idx: i, vessel: car.vessels[i], voyage: (sc.direction === 'import' ? '6' : '7') + String(20 + off) + (sc.direction === 'import' ? 'W' : 'E'),
        erd: TS.addDays(etd, -5), si: TS.addDays(etd, -3), vgm: TS.addDays(etd, -2), cy: TS.addDays(etd, -2), doc: TS.addDays(etd, -2),
        etd, eta: TS.addDays(etd, r.transit), ts: r.ts,
      };
    });
  };

  /* valid & invalid container numbers for a carrier prefix (ISO 6346) */
  OPS.containerCandidates = (prefix, seed) => {
    const base = String(100000 + (seed % 800000)).slice(0, 6);
    const good = prefix + base + TS.REF.checkDigit(prefix + base);
    const d = TS.REF.checkDigit(prefix + base);
    const bad1 = prefix + base + ((d + 3) % 10);
    const swapped = base.slice(0, 4) + base[5] + base[4];
    let bad2 = prefix + swapped + ((TS.REF.checkDigit(prefix + swapped) + 5) % 10);
    if (bad2 === good || bad2 === bad1) bad2 = prefix.slice(0, 3) + 'X' + base + d;
    return { good, list: [bad1, good, bad2] };
  };

  OPS.seed = (ship) => ship.id.split('').reduce((a, c) => (a * 31 + c.charCodeAt(0)) % 999983, 7);
})();
