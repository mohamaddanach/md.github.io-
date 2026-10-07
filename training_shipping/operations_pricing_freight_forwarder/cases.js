/* Operations & Pricing — CASE ENGINE.
 * 20 different clients (FCL / LCL, import / export), each with its own commodity, route, Incoterm, payment terms,
 * services, persona, rates and figures — generated from a seed, so every case has different numbers.
 * All companies and people are fictional; rates are realistic training samples. */
(function () {
  const L = TS.L;
  const OPS = (window.OPS = window.OPS || {});

  OPS.company = { name: 'Phoenicia Freight Training SAL', short: 'PFT', email: 'ops@phoenicia-freight.test', pricing: 'pricing@phoenicia-freight.test', address: 'Port Road, Medawar, Beirut, Lebanon', phone: '+961 1 400 400', vat: '3001234-601' };

  /* ---------------- seeded random ---------------- */
  OPS.rng = (seed) => { let a = seed >>> 0; return () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; };
  const ri = (r, a, b) => a + Math.floor(r() * (b - a + 1));
  const rf = (r, a, b) => a + r() * (b - a);
  const pick = (r, arr) => arr[Math.floor(r() * arr.length)];
  const R2 = (x) => Math.round(x * 100) / 100;
  const r5 = (x) => Math.round(x / 5) * 5;
  OPS.shuffle = (r, arr) => { const a = arr.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };

  /* ---------------- ports & regions ---------------- */
  const P = (code, city, country, cc, region) => ({ code, city, country, cc, region });
  OPS.PORTS = [
    P('LBBEY', 'Beirut', 'Lebanon', 'LB', 'LB'), P('LBKYE', 'Tripoli', 'Lebanon', 'LB', 'LB'),
    P('CNSHA', 'Shanghai', 'China', 'CN', 'FE'), P('CNNGB', 'Ningbo', 'China', 'CN', 'FE'), P('CNQIN', 'Qingdao', 'China', 'CN', 'FE'), P('MYPKG', 'Port Klang', 'Malaysia', 'MY', 'FE'), P('VNCLI', 'Ho Chi Minh (Cat Lai)', 'Vietnam', 'VN', 'FE'),
    P('INNSA', 'Nhava Sheva', 'India', 'IN', 'IN'),
    P('TRMER', 'Mersin', 'Türkiye', 'TR', 'MED'), P('TRAMR', 'Istanbul (Ambarli)', 'Türkiye', 'TR', 'MED'), P('ITGOA', 'Genoa', 'Italy', 'IT', 'MED'), P('ESVLC', 'Valencia', 'Spain', 'ES', 'MED'), P('FRMRS', 'Marseille', 'France', 'FR', 'MED'), P('CYLMS', 'Limassol', 'Cyprus', 'CY', 'MED'), P('EGALY', 'Alexandria', 'Egypt', 'EG', 'MED'),
    P('DEHAM', 'Hamburg', 'Germany', 'DE', 'NE'), P('NLRTM', 'Rotterdam', 'Netherlands', 'NL', 'NE'), P('GBFXT', 'Felixstowe', 'United Kingdom', 'GB', 'NE'),
    P('AEJEA', 'Jebel Ali', 'United Arab Emirates', 'AE', 'GULF'), P('SAJED', 'Jeddah', 'Saudi Arabia', 'SA', 'GULF'),
    P('BRSSZ', 'Santos', 'Brazil', 'BR', 'AM'), P('USNYC', 'New York', 'United States', 'US', 'AM'), P('CAMTR', 'Montreal', 'Canada', 'CA', 'AM'),
    P('AUSYD', 'Sydney', 'Australia', 'AU', 'OC'),
    P('EGPSD', 'Port Said', 'Egypt', 'EG', 'MED'), P('MZBEW', 'Beira', 'Mozambique', 'MZ', 'AF'),
  ];
  OPS.port = (code) => OPS.PORTS.find((p) => p.code === code) || { code, city: code, country: '', cc: '', region: '' };
  OPS.portName = (code) => { const p = OPS.port(code); return p.code + ' — ' + p.city + (p.country ? ', ' + p.country : ''); };
  OPS.ports = OPS.PORTS.map((p) => ({ code: p.code, name: p.city + ', ' + p.country }));
  const EU = ['DE', 'NL', 'FR', 'IT', 'ES', 'CY'], ARAB = ['AE', 'SA', 'EG'];
  OPS.zone = (cc) => (EU.includes(cc) ? 'EU' : ARAB.includes(cc) ? 'ARAB' : cc === 'US' ? 'US' : 'OTHER');

  const REG = {
    FE: { tr: [24, 32], ts: ['Port Said (EGPSD)', 'Piraeus (GRPIR)', 'Malta (MTMAR)', 'Jeddah (SAJED)'], r40: [2200, 2800], r20: [1450, 1850], lcl: [55, 80] },
    IN: { tr: [16, 22], ts: ['Jebel Ali (AEJEA)', 'Port Said (EGPSD)', 'Salalah (OMSLL)'], r40: [1700, 2200], r20: [1100, 1400], lcl: [45, 65] },
    MED: { tr: [4, 9], ts: ['Piraeus (GRPIR)', 'Mersin (TRMER)', 'Damietta (EGDAM)', 'Malta (MTMAR)'], r40: [950, 1350], r20: [620, 880], lcl: [28, 42] },
    NE: { tr: [11, 17], ts: ['Malta (MTMAR)', 'Algeciras (ESALG)', 'Gioia Tauro (ITGIT)', 'Piraeus (GRPIR)'], r40: [1450, 1900], r20: [950, 1300], lcl: [40, 60] },
    GULF: { tr: [9, 15], ts: ['Jeddah (SAJED)', 'Port Said (EGPSD)', 'Salalah (OMSLL)'], r40: [1300, 1700], r20: [880, 1150], lcl: [40, 55] },
    AM: { tr: [20, 29], ts: ['Algeciras (ESALG)', 'Valencia (ESVLC)', 'Gioia Tauro (ITGIT)'], r40: [2400, 3000], r20: [1600, 2000], lcl: [60, 85] },
    OC: { tr: [35, 44], ts: ['Colombo (LKCMB)', 'Singapore (SGSIN)', 'Jebel Ali (AEJEA)'], r40: [2600, 3200], r20: [1800, 2200], lcl: [70, 95] },
  };

  /* ---------------- lines & consolidators ---------------- */
  OPS.carriers = {
    CMA: { name: 'CMA CGM', prefix: 'CMAU', email: 'beirut.export@cmacgm-training.test', bkPrefix: 'LBY', scac: 'CMDU', vessels: ['CMA CGM PHOENICIA', 'CMA CGM LITANI', 'CMA CGM BYBLOS'] },
    MSC: { name: 'MSC', prefix: 'MSCU', email: 'lb.sales@msc-training.test', bkPrefix: 'MEDU', scac: 'MEDU', vessels: ['MSC CEDAR', 'MSC ANTHEA', 'MSC SOUR'] },
    MSK: { name: 'Maersk', prefix: 'MSKU', email: 'lb.booking@maersk-training.test', bkPrefix: '26', scac: 'MAEU', vessels: ['MAERSK BAALBEK', 'MAERSK SIDON', 'MAERSK ANJAR'] },
    COS: { name: 'COSCO Shipping', prefix: 'CSNU', email: 'lb.sales@cosco-training.test', bkPrefix: 'COSU', scac: 'COSU', vessels: ['COSCO JOUNIEH', 'COSCO TYRE', 'COSCO BATROUN'] },
    HLC: { name: 'Hapag-Lloyd', prefix: 'HLXU', email: 'lb.sales@hlag-training.test', bkPrefix: 'HLCU', scac: 'HLCU', vessels: ['BEKAA EXPRESS', 'CHOUF EXPRESS', 'METN EXPRESS'] },
  };
  OPS.consols = {
    LCE: { name: 'Levant Consol Express', prefix: 'LCEU', email: 'lcl@levantconsol-training.test', bkPrefix: 'LCE', scac: 'LCEX', consol: true, vessels: ['CMA CGM LITANI', 'CMA CGM BYBLOS', 'CMA CGM PHOENICIA'], line: 'CMA CGM' },
    MCS: { name: 'Medi Co-Load Services', prefix: 'MCLU', email: 'booking@medicoload-training.test', bkPrefix: 'MCL', scac: 'MCLS', consol: true, vessels: ['MSC ANTHEA', 'MSC CEDAR', 'MSC SOUR'], line: 'MSC' },
    ATL: { name: 'Atlas LCL Network', prefix: 'ATLU', email: 'ops@atlaslcl-training.test', bkPrefix: 'ATL', scac: 'ATLN', consol: true, vessels: ['MAERSK SIDON', 'MAERSK ANJAR', 'MAERSK BAALBEK'], line: 'Maersk' },
    BWG: { name: 'Bluewave Groupage', prefix: 'BWGU', email: 'groupage@bluewave-training.test', bkPrefix: 'BWG', scac: 'BWGP', consol: true, vessels: ['BEKAA EXPRESS', 'METN EXPRESS', 'CHOUF EXPRESS'], line: 'Hapag-Lloyd' },
  };
  OPS.lines = Object.assign({}, OPS.carriers, OPS.consols);

  OPS.parties = {
    trucker: { name: 'Al Amal Transport SARL', contact: 'Abou Ali', email: 'dispatch@alamal-transport.test', phone: '+961 3 777 010' },
    broker: { name: 'PFT Customs Department (licensed broker)', email: 'customs@phoenicia-freight.test' },
  };

  /* ---------------- equipment ---------------- */
  OPS.EQ = { '20DV': { cbm: 33, use: 28, pay: 21000, tare: 2230 }, '40DV': { cbm: 67, use: 58, pay: 26500, tare: 3750 }, '40HC': { cbm: 76, use: 67, pay: 26400, tare: 3900 } };
  /* rule used to correct the trainee: LCL below 15 CBM and 8 t, else the smallest box that fits volume and road weight */
  OPS.eqFor = (cbm, kg) => (cbm <= 15 && kg <= 8000 ? 'LCL' : ['20DV', '40DV', '40HC'].find((e) => cbm <= OPS.EQ[e].use && kg <= OPS.EQ[e].pay) || '40HC');

  /* ---------------- commodity catalog ---------------- */
  const I = (id, en, ar, hs, given, dims, kg, net, price, unit, per, share) => ({ id, en, ar, hs, given: given || hs, dims, kg, net, price, unit, per, share });
  OPS.COMMODITIES = {
    furniture: { dir: 'import', en: 'Wooden household furniture', ar: 'أثاث منزلي خشبي', kw: 'furniture', origins: ['CNSHA', 'CNNGB'], pkg: 'cartons', sector: 'Home Furnishings', food: false,
      items: [I('T', 'Wooden dining tables, knocked down', 'طاولات سفرة خشبية مفكّكة', '9403.60', '9403.60', [120, 80, 60], 70, 65, 716.67, 'pcs', 1, 0.25), I('C', 'Wooden dining chairs, not upholstered', 'كراسي سفرة خشبية غير منجّدة', '9401.69', '9403.60', [100, 50, 50], 53, 50, 188.89, 'pcs', 2, 0.75)],
      distract: ['9401.61', '9403.30', '9403.50', '9403.91'], duty: { '9403.60': 25, '9401.69': 20, '9401.61': 20, '9403.30': 15, '9403.50': 25, '9403.91': 10 }, licence: L('No special import licence.', 'لا يحتاج ترخيص استيراد خاص.') },
    tiles: { dir: 'import', en: 'Glazed ceramic floor tiles', ar: 'بلاط سيراميك مزجّج للأرضيات', kw: 'tiles', origins: ['ESVLC', 'ITGOA'], pkg: 'pallets', sector: 'Ceramics', food: false, dense: true,
      items: [I('F', 'Glazed ceramic floor tiles 60×60 cm', 'بلاط سيراميك مزجّج 60×60 سم', '6907.21', '6907.21', [120, 100, 75], 1250, 1220, 960, 'm²', 57.6, 1)],
      distract: ['6907.22', '6908.90', '6810.19'], duty: { '6907.21': 25, '6907.22': 25, '6908.90': 25, '6810.19': 20 }, licence: L('Conformity with Lebanese standards may be checked (LIBNOR).', 'قد يُطلب التطابق مع المواصفات اللبنانية (ليبنور).') },
    solar: { dir: 'import', en: 'Photovoltaic solar panels and inverters', ar: 'ألواح طاقة شمسية ومحوّلات', kw: 'solar', origins: ['CNNGB', 'CNSHA'], pkg: 'pallets', sector: 'Solar Energy', food: false,
      items: [I('S', 'Photovoltaic modules 550 W, on pallets', 'ألواح كهروضوئية 550 واط على طبليات', '8541.43', '8541.43', [228, 113, 120], 690, 650, 3410, 'pcs', 31, 0.85), I('V', 'Solar inverters 10 kW', 'محوّلات طاقة شمسية 10 كيلوواط', '8504.40', '8541.43', [80, 60, 50], 60, 52, 1800, 'pcs', 2, 0.15)],
      distract: ['8541.42', '8504.31', '8507.60'], duty: { '8541.43': 0, '8504.40': 5, '8541.42': 0, '8504.31': 5, '8507.60': 5 }, licence: L('Energy equipment: check current exemptions and the Ministry of Energy requirements.', 'معدّات طاقة: تحقّق من الإعفاءات الحالية ومتطلبات وزارة الطاقة.') },
    coffee: { dir: 'import', en: 'Green coffee beans (Arabica)', ar: 'بنّ أخضر (أرابيكا)', kw: 'coffee', origins: ['BRSSZ'], pkg: 'bags', sector: 'Coffee Roasters', food: true, dense: true,
      items: [I('K', 'Green Arabica coffee beans, not roasted, in 60 kg jute bags', 'بنّ أرابيكا أخضر غير محمّص في أكياس خيش 60 كغ', '0901.11', '0901.11', [70, 45, 22], 60.6, 60, 285, 'kg', 60, 1)],
      distract: ['0901.21', '0901.12', '2101.11'], duty: { '0901.11': 5, '0901.21': 20, '0901.12': 5, '2101.11': 20 }, licence: L('Food: Ministry of Agriculture / Public Health import requirements apply.', 'أغذية: تُطبَّق متطلبات وزارة الزراعة / الصحة العامة.') },
    gloves: { dir: 'import', en: 'Nitrile examination gloves', ar: 'قفازات فحص طبية من النتريل', kw: 'gloves', origins: ['MYPKG'], pkg: 'cartons', sector: 'Medical Supplies', food: false,
      items: [I('G', 'Nitrile examination gloves, powder free, 10 boxes × 100 pcs per carton', 'قفازات فحص نتريل بدون بودرة، 10 علب × 100 قطعة في الكرتونة', '4015.12', '4015.19', [40, 30, 25], 10.5, 9.6, 34, 'pcs', 1000, 1)],
      distract: ['4015.19', '3926.20', '6116.10'], duty: { '4015.12': 5, '4015.19': 5, '3926.20': 10, '6116.10': 20 }, licence: L('Medical device: Ministry of Public Health registration/approval required before shipping.', 'جهاز طبي: يتطلب تسجيل/موافقة وزارة الصحة العامة قبل الشحن.') },
    textiles: { dir: 'import', en: 'Ready-made cotton trousers', ar: 'سراويل قطنية جاهزة', kw: 'trousers', origins: ['TRMER', 'TRAMR'], pkg: 'cartons', sector: 'Textiles', food: false,
      items: [I('M', "Men's cotton trousers, woven", 'سراويل رجالية قطنية منسوجة', '6203.42', '6203.42', [60, 40, 40], 14, 12.6, 600, 'pcs', 50, 0.55), I('W', "Women's cotton trousers, woven", 'سراويل نسائية قطنية منسوجة', '6204.62', '6203.42', [60, 40, 40], 13, 11.7, 625, 'pcs', 50, 0.45)],
      distract: ['6103.42', '6104.62', '6203.43'], duty: { '6203.42': 20, '6204.62': 20, '6103.42': 20, '6104.62': 20, '6203.43': 20 }, licence: L('No special licence; origin rules matter (Türkiye has no FTA preference with Lebanon in this exercise).', 'لا ترخيص خاص؛ قواعد المنشأ مهمة (لا تفضيل لتركيا مع لبنان في هذا التمرين).') },
    laptops: { dir: 'import', en: 'Laptop computers', ar: 'حواسيب محمولة', kw: 'laptop', origins: ['AEJEA'], madeIn: ['CN', 'China'], pkg: 'cartons', sector: 'Electronics', food: false,
      items: [I('L', 'Laptop computers 15.6", 5 units per carton', 'حواسيب محمولة 15.6 بوصة، 5 وحدات في الكرتونة', '8471.30', '8471.30', [60, 45, 35], 14, 11, 2750, 'pcs', 5, 1)],
      distract: ['8471.41', '8528.52', '8473.30'], duty: { '8471.30': 0, '8471.41': 0, '8528.52': 5, '8473.30': 0 }, licence: L('Wireless (Wi-Fi/Bluetooth) equipment may need telecom type approval.', 'الأجهزة اللاسلكية قد تحتاج موافقة الاتصالات.') },
    parts: { dir: 'import', en: 'Car spare parts (brake pads, filters)', ar: 'قطع غيار سيارات (فرامل، فلاتر)', kw: 'spare parts', origins: ['DEHAM', 'NLRTM'], pkg: 'cartons', sector: 'Auto Parts', food: false,
      items: [I('B', 'Brake pads for passenger cars', 'وسادات فرامل لسيارات الركاب', '8708.30', '8708.30', [60, 40, 40], 28, 26, 520, 'sets', 40, 0.6), I('O', 'Oil filters for engines', 'فلاتر زيت للمحرّكات', '8421.23', '8708.30', [60, 40, 40], 18, 16, 380, 'pcs', 60, 0.4)],
      distract: ['8708.99', '8421.31', '6813.81'], duty: { '8708.30': 5, '8421.23': 5, '8708.99': 5, '8421.31': 5, '6813.81': 5 }, licence: L('No special licence.', 'لا ترخيص خاص.') },
    cosmetics: { dir: 'import', en: 'Cosmetics (creams and shampoos)', ar: 'مستحضرات تجميل (كريمات وشامبو)', kw: 'cosmetics', origins: ['ITGOA', 'FRMRS'], pkg: 'cartons', sector: 'Beauty', food: false,
      items: [I('Y', 'Skin care creams', 'كريمات العناية بالبشرة', '3304.99', '3304.99', [50, 40, 30], 12, 10.5, 640, 'pcs', 48, 0.6), I('H', 'Shampoos', 'شامبو', '3305.10', '3304.99', [50, 40, 30], 14, 12.6, 210, 'pcs', 24, 0.4)],
      distract: ['3305.90', '3307.90', '3401.30'], duty: { '3304.99': 15, '3305.10': 15, '3305.90': 15, '3307.90': 15, '3401.30': 10 }, licence: L('Cosmetics: Ministry of Public Health registration may be required.', 'مستحضرات تجميل: قد يُطلب تسجيل لدى وزارة الصحة العامة.') },
    tyres: { dir: 'import', en: 'New passenger car tyres', ar: 'إطارات سيارات ركاب جديدة', kw: 'tyres', origins: ['CNQIN', 'CNSHA'], pkg: 'pcs', sector: 'Tyres', food: false,
      items: [I('R', 'New pneumatic radial tyres for passenger cars, 205/55 R16', 'إطارات شعاعية جديدة لسيارات الركاب 205/55 R16', '4011.10', '4011.10', [65, 65, 21], 9.2, 9.2, 31, 'pcs', 1, 1)],
      distract: ['4011.20', '4012.20', '4013.10'], duty: { '4011.10': 5, '4011.20': 5, '4012.20': 5, '4013.10': 5 }, licence: L('Conformity certificate may be required for tyres.', 'قد تُطلب شهادة مطابقة للإطارات.') },
    toys: { dir: 'import', en: 'Plastic toys', ar: 'ألعاب بلاستيكية', kw: 'toys', origins: ['CNNGB', 'VNCLI'], pkg: 'cartons', sector: 'Toys', food: false,
      items: [I('P', 'Plastic toys for children (assorted)', 'ألعاب أطفال بلاستيكية (متنوعة)', '9503.00', '9503.00', [70, 50, 50], 8, 7, 220, 'pcs', 24, 1)],
      distract: ['9504.90', '3926.40', '9505.90'], duty: { '9503.00': 10, '9504.90': 20, '3926.40': 10, '9505.90': 20 }, licence: L('Toy safety conformity may be checked.', 'قد يُطلب التحقق من سلامة الألعاب.') },
    paper: { dir: 'import', en: 'Uncoated printing paper (A4 reams)', ar: 'ورق طباعة غير مطلي (رزم A4)', kw: 'paper', origins: ['ITGOA', 'ESVLC'], pkg: 'pallets', sector: 'Paper & Print', food: false, dense: true,
      items: [I('A', 'Uncoated printing paper 80 g/m², A4 reams, 400 reams per pallet', 'ورق طباعة غير مطلي 80 غ/م²، رزم A4، 400 رزمة في الطبلية', '4802.56', '4802.56', [120, 80, 105], 1020, 1000, 1350, 'reams', 400, 1)],
      distract: ['4802.57', '4810.13', '4823.90'], duty: { '4802.56': 5, '4802.57': 5, '4810.13': 5, '4823.90': 5 }, licence: L('No special licence.', 'لا ترخيص خاص.') },

    /* exports from Lebanon */
    tahini: { dir: 'export', en: 'Tahini (sesame paste) in glass jars', ar: 'طحينة في مرطبانات زجاجية', kw: 'tahini', dests: ['DEHAM', 'NLRTM'], pkg: 'pallets', sector: 'Foods', food: true, dense: true,
      items: [I('H', 'Tahini (sesame paste) in glass jars, 24 × 900 g per carton, on pallets', 'طحينة في مرطبانات زجاجية، 24 × 900 غ في الكرتونة، على طبليات', '2008.19', '2008.19', [120, 100, 110], 850, 780, 2100, 'cartons', 36, 1)],
      distract: ['1207.40', '1515.50', '2008.11'], duty: { '2008.19': 20, '1207.40': 5, '1515.50': 10, '2008.11': 20 } },
    oliveoil: { dir: 'export', en: 'Extra virgin olive oil', ar: 'زيت زيتون بكر ممتاز', kw: 'olive oil', dests: ['AEJEA', 'SAJED', 'USNYC'], pkg: 'cartons', sector: 'Olive Oil', food: true, dense: true,
      items: [I('O', 'Extra virgin olive oil, 12 × 1 L glass bottles per carton', 'زيت زيتون بكر ممتاز، 12 × 1 لتر زجاج في الكرتونة', '1509.20', '1509.20', [32, 24, 31], 15.5, 11, 96, 'liters', 12, 1)],
      distract: ['1509.30', '1510.10', '1515.90'], duty: {} },
    wine: { dir: 'export', en: 'Lebanese red wine', ar: 'نبيذ لبناني أحمر', kw: 'wine', dests: ['NLRTM', 'GBFXT', 'CAMTR'], pkg: 'cartons', sector: 'Wineries', food: true,
      items: [I('V', 'Red wine, 6 × 75 cl bottles per carton', 'نبيذ أحمر، 6 × 75 سل في الكرتونة', '2204.21', '2204.21', [27, 18, 33], 8.6, 4.5, 72, 'bottles', 6, 1)],
      distract: ['2204.29', '2205.10', '2206.00'], duty: {} },
    soap: { dir: 'export', en: 'Olive oil soap', ar: 'صابون زيت الزيتون', kw: 'soap', dests: ['FRMRS', 'CYLMS', 'DEHAM'], pkg: 'cartons', sector: 'Soap', food: false,
      items: [I('S', 'Olive oil soap bars, 100 × 125 g per carton', 'ألواح صابون زيت الزيتون، 100 × 125 غ في الكرتونة', '3401.11', '3401.11', [40, 30, 20], 13, 12.5, 85, 'bars', 100, 1)],
      distract: ['3401.19', '3401.20', '3307.30'], duty: {} },
    spices: { dir: 'export', en: "Za'atar and spice mixes", ar: 'زعتر وخلطات بهارات', kw: "za'atar", dests: ['CAMTR', 'AUSYD', 'USNYC'], pkg: 'cartons', sector: 'Spices', food: true,
      items: [I('Z', "Za'atar spice mix, 20 × 500 g per carton", 'خلطة زعتر، 20 × 500 غ في الكرتونة', '0910.99', '0910.99', [40, 30, 25], 11, 10, 70, 'packs', 20, 1)],
      distract: ['0910.91', '2103.90', '1211.90'], duty: {} },
    sweets: { dir: 'export', en: 'Oriental sweets (baklava)', ar: 'حلويات شرقية (بقلاوة)', kw: 'baklava', dests: ['USNYC', 'SAJED', 'AUSYD'], pkg: 'cartons', sector: 'Sweets', food: true,
      items: [I('B', 'Baklava pastries in tins, 12 × 1 kg per carton', 'بقلاوة في علب معدنية، 12 × 1 كغ في الكرتونة', '1905.90', '1905.90', [40, 30, 30], 14.5, 12, 150, 'tins', 12, 1)],
      distract: ['1905.31', '1704.90', '2008.19'], duty: {} },
    lbfurniture: { dir: 'export', en: 'Handmade wooden furniture', ar: 'أثاث خشبي يدوي الصنع', kw: 'furniture', dests: ['SAJED', 'AEJEA'], pkg: 'crates', sector: 'Furniture Makers', food: false,
      items: [I('D', 'Handmade solid wood dining sets (table + 6 chairs), crated', 'أطقم سفرة من الخشب الصلب يدوية الصنع (طاولة + 6 كراسي) في صناديق', '9403.60', '9403.60', [210, 110, 95], 190, 175, 2400, 'sets', 1, 1)],
      distract: ['9401.69', '9403.50', '4421.99'], duty: {} },
    pickles: { dir: 'export', en: 'Pickled vegetables in jars', ar: 'مخللات خضار في مرطبانات', kw: 'pickled', dests: ['AUSYD', 'CAMTR', 'GBFXT'], pkg: 'cartons', sector: 'Preserves', food: true, dense: true,
      items: [I('K', 'Pickled cucumbers and turnips, 12 × 1 kg jars per carton', 'خيار ولفت مخلّل، 12 مرطبان × 1 كغ في الكرتونة', '2001.90', '2001.10', [34, 26, 24], 17, 12, 38, 'jars', 12, 1)],
      distract: ['2001.10', '2005.99', '0711.40'], duty: {} },
  };

  /* global tariff (sample rates) built from the catalog — used by Customs */
  TS.TARIFF = (() => {
    const out = {};
    Object.values(OPS.COMMODITIES).forEach((c) => {
      c.items.forEach((it) => { out[it.hs] = out[it.hs] || { hs: it.hs, d: L(it.en, it.ar), duty: c.duty[it.hs] != null ? c.duty[it.hs] : 20 }; });
      c.distract.forEach((h) => { if (!out[h]) out[h] = { hs: h, d: L('Other heading ' + h + ' (see tariff)', 'بند آخر ' + h + ' (انظر التعرفة)'), duty: c.duty[h] != null ? c.duty[h] : 20 }; });
    });
    return out;
  })();
  const DESC = { '9401.61': L('Seats with wooden frames — upholstered', 'مقاعد بهياكل خشبية — منجّدة'), '9403.30': L('Wooden office furniture', 'أثاث خشبي للمكاتب'), '9403.50': L('Wooden bedroom furniture', 'أثاث خشبي لغرف النوم'), '9403.91': L('Parts of furniture, of wood', 'أجزاء أثاث من الخشب'), '6907.22': L('Ceramic tiles, water absorption 0.5–10%', 'بلاط سيراميك، امتصاص ماء 0.5–10%'), '6908.90': L('Other glazed ceramic tiles (old heading)', 'بلاط سيراميك مزجّج آخر (بند قديم)'), '6810.19': L('Tiles of cement or artificial stone', 'بلاط من الإسمنت أو الحجر الاصطناعي'), '8541.42': L('Photovoltaic cells not assembled in modules', 'خلايا كهروضوئية غير مجمّعة في ألواح'), '8504.31': L('Small transformers', 'محوّلات صغيرة'), '8507.60': L('Lithium-ion batteries', 'بطاريات ليثيوم أيون'), '0901.21': L('Roasted coffee, not decaffeinated', 'بنّ محمّص غير منزوع الكافيين'), '0901.12': L('Coffee, not roasted, decaffeinated', 'بنّ غير محمّص منزوع الكافيين'), '2101.11': L('Coffee extracts and essences', 'خلاصات ومركّزات البنّ'), '4015.19': L('Other gloves of vulcanised rubber', 'قفازات أخرى من المطاط'), '3926.20': L('Plastic articles of apparel (incl. gloves)', 'ألبسة من البلاستيك (بما فيها القفازات)'), '6116.10': L('Knitted gloves impregnated with rubber', 'قفازات محبوكة مشرّبة بالمطاط'), '6103.42': L("Men's cotton trousers, knitted", 'سراويل رجالية قطنية محبوكة'), '6104.62': L("Women's cotton trousers, knitted", 'سراويل نسائية قطنية محبوكة'), '6203.43': L("Men's trousers of synthetic fibres", 'سراويل رجالية من ألياف تركيبية'), '8471.41': L('Other computers with CPU and I/O in one housing', 'حواسيب أخرى بوحدة معالجة ومدخلات في هيكل واحد'), '8528.52': L('Monitors for computers', 'شاشات للحواسيب'), '8473.30': L('Parts of computers', 'أجزاء حواسيب'), '8708.99': L('Other parts of motor vehicles', 'أجزاء أخرى للسيارات'), '8421.31': L('Air filters for engines', 'فلاتر هواء للمحرّكات'), '6813.81': L('Brake linings, not asbestos', 'بطانات فرامل بدون أسبستوس'), '3305.90': L('Other hair preparations', 'مستحضرات شعر أخرى'), '3307.90': L('Other perfumery preparations', 'مستحضرات عطور أخرى'), '3401.30': L('Liquid skin-washing products', 'منتجات غسل البشرة السائلة'), '4011.20': L('Tyres for buses or lorries', 'إطارات للحافلات أو الشاحنات'), '4012.20': L('Used pneumatic tyres', 'إطارات مستعملة'), '4013.10': L('Inner tubes for cars', 'أنابيب داخلية للسيارات'), '9504.90': L('Games and table games', 'ألعاب ومنها ألعاب الطاولة'), '3926.40': L('Plastic statuettes and ornaments', 'تماثيل وزينة بلاستيكية'), '9505.90': L('Festive articles', 'أدوات احتفالات'), '4802.57': L('Other uncoated paper 40–150 g/m²', 'ورق آخر غير مطلي 40–150 غ/م²'), '4810.13': L('Coated paper in rolls', 'ورق مطلي على شكل لفّات'), '4823.90': L('Other articles of paper', 'أصناف أخرى من الورق'), '1207.40': L('Sesame seeds', 'بذور السمسم'), '1515.50': L('Sesame oil', 'زيت السمسم'), '2008.11': L('Groundnuts prepared (peanut butter)', 'فول سوداني محضّر (زبدة الفول السوداني)'), '1509.30': L('Virgin olive oil (other)', 'زيت زيتون بكر (آخر)'), '1510.10': L('Crude olive pomace oil', 'زيت تفل الزيتون الخام'), '1515.90': L('Other vegetable oils', 'زيوت نباتية أخرى'), '2204.29': L('Wine in containers over 2 L', 'نبيذ في أوعية تزيد عن 2 لتر'), '2205.10': L('Vermouth', 'فيرموث'), '2206.00': L('Other fermented beverages', 'مشروبات مخمّرة أخرى'), '3401.19': L('Other soap in bars', 'صابون آخر على شكل ألواح'), '3401.20': L('Soap in other forms', 'صابون بأشكال أخرى'), '3307.30': L('Bath preparations', 'مستحضرات الاستحمام'), '0910.91': L('Mixtures of spices', 'خلطات توابل'), '2103.90': L('Sauces and condiments', 'صلصات وتوابل محضّرة'), '1211.90': L('Herbs for pharmacy or perfumery', 'أعشاب للصيدلة أو العطور'), '1905.31': L('Sweet biscuits', 'بسكويت حلو'), '1704.90': L('Sugar confectionery', 'حلويات سكرية'), '9401.69': L('Seats with wooden frames — other', 'مقاعد بهياكل خشبية — غيرها'), '4421.99': L('Other articles of wood', 'أصناف أخرى من الخشب'), '2001.10': L('Cucumbers and gherkins in vinegar', 'خيار في الخل'), '2005.99': L('Other preserved vegetables (not in vinegar)', 'خضار محفوظة أخرى (ليست في الخل)'), '0711.40': L('Cucumbers provisionally preserved', 'خيار محفوظ مؤقتًا'), '2001.90': L('Other vegetables in vinegar (mixed pickles)', 'خضار أخرى في الخل (مخللات مشكّلة)') };
  Object.entries(DESC).forEach(([h, d]) => { if (TS.TARIFF[h]) TS.TARIFF[h].d = d; });

  /* ---------------- names ---------------- */
  const PREF = ['Cedar', 'Phoenix', 'Byblos', 'Sidon', 'Litani', 'Bekaa', 'Chouf', 'Metn', 'Kesrouan', 'Jounieh', 'Tyre', 'Batroun', 'Akkar', 'Zahle', 'Baalbek', 'Anjar', 'Hermon', 'Qadisha', 'Raouche', 'Marjayoun', 'Sannine', 'Aley', 'Jbeil', 'Ehden'];
  const FIRST = ['Rami', 'Nour', 'Karim', 'Maya', 'Hadi', 'Lina', 'Ziad', 'Rita', 'Omar', 'Yara', 'Fadi', 'Carla', 'Samir', 'Dina', 'Walid', 'Joelle', 'Bilal', 'Hiba', 'Tony', 'Rana', 'Elie', 'Sara', 'Georges', 'Layal'];
  const LAST = ['Haddad', 'Khoury', 'Nassar', 'Saab', 'Fakhoury', 'Hamdan', 'Salameh', 'Mansour', 'Chahine', 'Karam', 'Abi Nader', 'Daher', 'Moussa', 'Jaber', 'Rizk', 'Sfeir', 'Azar', 'Tannous', 'Bou Khalil', 'Najjar'];
  const AREAS = [['Choueifat', 'Mount Lebanon', 160], ['Dora', 'Beirut', 120], ['Zouk Mosbeh', 'Keserwan', 170], ['Saida', 'South Lebanon', 210], ['Tripoli', 'North Lebanon', 260], ['Zahle', 'Bekaa', 260], ['Chtaura', 'Bekaa', 240], ['Jbeil', 'Mount Lebanon', 190], ['Nabatieh', 'South Lebanon', 240], ['Bourj Hammoud', 'Beirut', 120], ['Mkalles', 'Mount Lebanon', 130], ['Sin El Fil', 'Mount Lebanon', 130]];
  const FOREIGN = {
    CN: ['Sunrise', 'Hongda', 'Golden Bridge', 'Everbright', 'Jade River', 'Oriental Star'], MY: ['Harimau', 'Selangor', 'Klang Valley'], VN: ['Saigon Star', 'Mekong'], ES: ['Levante', 'Turia', 'Albufera'], IT: ['Tirreno', 'Liguria', 'Portofino'],
    FR: ['Calanques', 'Phocée', 'Provence'], TR: ['Anadolu', 'Bosphorus', 'Taurus'], BR: ['Paulista', 'Atlântica'], AE: ['Al Noor', 'Gulf Star'], DE: ['Hanse', 'Elbe'], NL: ['Maas', 'Delta'],
    SA: ['Al Waha', 'Red Sea'], US: ['Hudson Levant', 'Liberty'], CA: ['Laurentian', 'Montréal Phénicie'], AU: ['Harbour Cedar', 'Southern Cross'], GB: ['Thames', 'Albion'], CY: ['Limassol', 'Troodos'],
  };
  const SUPW = { furniture: 'Furniture', tiles: 'Ceramics', solar: 'Solar Technology', coffee: 'Coffee Exporters', gloves: 'Medical Gloves', textiles: 'Apparel', laptops: 'Computer Trading', parts: 'Auto Parts', cosmetics: 'Cosmetics', tyres: 'Tyre', toys: 'Toys', paper: 'Paper Mills' };
  const BUYW = { tahini: 'Feinkost Imports', oliveoil: 'Fine Foods', wine: 'Wine Imports', soap: 'Natural Care Imports', spices: 'Spice Imports', sweets: 'Gourmet Foods', lbfurniture: 'Home Interiors', pickles: 'Deli Imports' };
  const SUFFIX = { CN: 'Co., Ltd.', MY: 'Sdn Bhd', VN: 'JSC', ES: 'S.L.', IT: 'S.p.A.', FR: 'SARL', TR: 'A.Ş.', BR: 'Ltda', AE: 'FZE', DE: 'GmbH', NL: 'B.V.', SA: 'Est.', US: 'Inc.', CA: 'Inc.', AU: 'Pty Ltd', GB: 'Ltd', CY: 'Ltd' };
  const slug = (s) => s.toLowerCase().replace(/[^a-z]+/g, '').slice(0, 14);

  /* ---------------- case plan: 20 clients ---------------- */
  OPS.PLAN = [
    { mode: 'FCL', dir: 'import', com: 'furniture', inc: 'FOB', pay: 'tt_copy', door: true, eq: '40HC', ins: true, tone: 'formal' },
    { mode: 'FCL', dir: 'import', com: 'tiles', inc: 'FOB', pay: 'advance', door: true, eq: '20DV', tone: 'friendly' },
    { mode: 'LCL', dir: 'import', com: 'laptops', inc: 'FCA', pay: 'advance', door: true, tone: 'urgent' },
    { mode: 'FCL', dir: 'export', com: 'tahini', inc: 'CFR', pay: 'cad', eq: '20DV', tone: 'formal' },
    { mode: 'LCL', dir: 'export', com: 'soap', inc: 'CIF', pay: 'lc', tone: 'new' },
    { mode: 'FCL', dir: 'import', com: 'solar', inc: 'EXW', pay: 'lc', door: true, eq: '40HC', tone: 'demanding' },
    { mode: 'FCL', dir: 'import', com: 'coffee', inc: 'FOB', pay: 'advance', door: false, eq: '20DV', ins: true, tone: 'friendly' },
    { mode: 'LCL', dir: 'import', com: 'parts', inc: 'EXW', pay: 'tt_copy', door: true, tone: 'formal' },
    { mode: 'FCL', dir: 'export', com: 'oliveoil', inc: 'CFR', pay: 'advance', eq: '20DV', dest: 'AEJEA', tone: 'urgent' },
    { mode: 'FCL', dir: 'import', com: 'gloves', inc: 'FOB', pay: 'lc', door: true, eq: '40DV', tone: 'formal' },
    { mode: 'LCL', dir: 'export', com: 'spices', inc: 'DAP', pay: 'cad', dest: 'CAMTR', tone: 'friendly' },
    { mode: 'FCL', dir: 'import', com: 'textiles', inc: 'FCA', pay: 'tt_copy', door: true, eq: '20DV', tone: 'new' },
    { mode: 'FCL', dir: 'export', com: 'wine', inc: 'CIF', pay: 'lc', eq: '20DV', dest: 'NLRTM', tone: 'formal' },
    { mode: 'LCL', dir: 'import', com: 'cosmetics', inc: 'FOB', pay: 'tt_copy', door: true, ins: true, tone: 'demanding' },
    { mode: 'FCL', dir: 'import', com: 'tyres', inc: 'FOB', pay: 'advance', door: true, eq: '40HC', tone: 'urgent' },
    { mode: 'FCL', dir: 'export', com: 'lbfurniture', inc: 'CFR', pay: 'advance', eq: '40HC', dest: 'SAJED', tone: 'friendly' },
    { mode: 'LCL', dir: 'import', com: 'toys', inc: 'FOB', pay: 'advance', door: false, tone: 'new' },
    { mode: 'FCL', dir: 'export', com: 'sweets', inc: 'CFR', pay: 'cad', eq: '20DV', dest: 'USNYC', tone: 'demanding' },
    { mode: 'FCL', dir: 'import', com: 'paper', inc: 'EXW', pay: 'tt_copy', door: true, eq: '20DV', tone: 'formal' },
    { mode: 'LCL', dir: 'export', com: 'pickles', inc: 'CIF', pay: 'advance', dest: 'AUSYD', tone: 'urgent' },
  ];

  OPS.PAYMENTS = {
    advance: L('100% advance payment by bank transfer before shipment', 'دفع 100% مسبقًا بتحويل مصرفي قبل الشحن'),
    tt_copy: L('30% advance, 70% balance against copy of B/L (T/T)', '30% دفعة مسبقة، و70% الرصيد مقابل نسخة البوليصة (تحويل)'),
    cad: L('Cash Against Documents (CAD) through the buyer’s bank', 'الدفع مقابل المستندات عبر مصرف المشتري'),
    lc: L('Irrevocable documentary letter of credit (L/C) at sight', 'اعتماد مستندي غير قابل للإلغاء عند الاطلاع'),
  };
  OPS.TONES = {
    formal: L('Formal', 'رسمي'), friendly: L('Friendly', 'ودّي'), urgent: L('In a hurry', 'مستعجل'), demanding: L('Demanding', 'متطلّب'), new: L('First-time importer/exporter', 'يتعامل لأول مرة'),
  };

  /* ---------------- generator ---------------- */
  OPS.makeCase = (no, spec, seed) => {
    const r = OPS.rng(seed);
    const com = OPS.COMMODITIES[spec.com];
    const imp = spec.dir === 'import', lcl = spec.mode === 'LCL';
    const lbPort = 'LBBEY';
    const farPort = imp ? spec.origin || pick(r, com.origins) : spec.dest || pick(r, com.dests);
    const far = OPS.port(farPort), reg = REG[far.region] || REG.MED;
    const area = pick(r, AREAS);
    const fn = pick(r, FIRST), ln = pick(r, LAST);
    const pref = PREF[(no * 7 + ri(r, 0, 3)) % PREF.length];
    const legal = pick(r, ['SAL', 'SARL']);
    const clientName = `${pref} ${com.sector} ${legal}`;
    const dom = slug(pref + com.sector);
    const client = { name: clientName, contact: fn + ' ' + ln, email: `${fn.toLowerCase()}@${dom}.test`, phone: `+961 ${pick(r, ['1', '3', '5', '6', '8', '9', '70', '71', '76', '81'])} ${ri(r, 100, 999)} ${ri(r, 100, 999)}`, address: `${area[0]} Industrial Zone, ${area[1]}, Lebanon`, reg: `CR ${area[1].split(' ')[0]} ${ri(r, 2001, 2020)}/${ri(r, 1000, 9999)} — VAT ${ri(r, 1000000, 3999999)}-601`, area: area[0] };
    const fNames = FOREIGN[far.cc] || ['Global Trading'];
    const fName = `${pick(r, fNames)} ${imp ? SUPW[spec.com] || 'Trading' : BUYW[spec.com] || 'Imports'} ${SUFFIX[far.cc] || 'Ltd'}`.replace(/\s+/g, ' ');
    const foreign = { name: fName, contact: pick(r, ['Lily Wang', 'Chen Hao', 'Ahmad Rahim', 'Elena Ruiz', 'Marco Bianchi', 'Claire Martin', 'Emre Yilmaz', 'João Silva', 'Faisal Khan', 'Jonas Becker', 'Pieter de Vries', 'Mike Johnson', 'Sophie Tremblay', 'Jack Wilson', 'Andreas Georgiou']), email: `sales@${slug(fName)}.test`, address: `${ri(r, 2, 280)} ${pick(r, ['Industrial Road', 'Harbour Street', 'Trade Avenue', 'Logistics Park'])}, ${far.city}, ${far.country}`, phone: '+' + ri(r, 1, 99) + ' ' + ri(r, 100, 999) + ' ' + ri(r, 1000, 9999) };
    const agentName = `${far.city.split(' ')[0]} ${pick(r, ['Forwarding', 'Logistics', 'Freight Services', 'Shipping Agency'])} ${SUFFIX[far.cc] || 'Ltd'}`;
    const agent = { name: agentName + (imp ? ' (origin agent)' : ' (destination agent)'), contact: pick(r, ['Kevin Zhou', 'Anna Schulz', 'Luca Ferri', 'Nadia Farouk', 'Tom Baker', 'Isabel Costa', 'Mehmet Kaya', 'Grace Lee']), email: `ops@${slug(agentName)}.test`, address: `${ri(r, 5, 900)} Port Road, ${far.city}, ${far.country}` };
    const shipper = imp ? foreign : client, consignee = imp ? client : foreign;

    /* ----- cargo quantity to fit the planned mode/equipment ----- */
    const vol = (it) => (it.dims[0] * it.dims[1] * it.dims[2]) / 1e6;
    const target = lcl ? rf(r, 2.5, 11) : spec.eq === '20DV' ? rf(r, 19, 26) : spec.eq === '40DV' ? rf(r, 42, 54) : rf(r, 60, 66);
    const avgVol = com.items.reduce((a, it) => a + it.share * vol(it), 0);
    const avgKg = com.items.reduce((a, it) => a + it.share * it.kg, 0);
    let N = Math.max(2, Math.round(target / avgVol));
    const maxKg = lcl ? 6500 : OPS.EQ[spec.eq].pay * 0.95;
    if (N * avgKg > maxKg) N = Math.floor(maxKg / avgKg);
    const items = com.items.map((it, i) => {
      const pk = Math.max(1, i === com.items.length - 1 ? 0 : Math.round(N * it.share));
      return Object.assign({}, it, { pkgs: pk });
    });
    if (items.length > 1) items[items.length - 1].pkgs = Math.max(1, N - items.slice(0, -1).reduce((a, x) => a + x.pkgs, 0)); else items[0].pkgs = N;
    items.forEach((it) => { it.qty = Math.round(it.pkgs * it.per); it.gross = Math.round(it.pkgs * it.kg); it.net = Math.round(it.pkgs * it.net); it.value = R2(it.pkgs * it.price); it.unitPrice = R2(it.price / it.per); it.cbm = R2(it.pkgs * vol(it)); it.desc = it.en; it.descAr = it.ar; it.hsGiven = it.given; it.ctn = ''; });
    let c0 = 1; items.forEach((it) => { it.ctn = `${c0}–${c0 + it.pkgs - 1}`; c0 += it.pkgs; });
    const packages = items.reduce((a, x) => a + x.pkgs, 0), grossKg = items.reduce((a, x) => a + x.gross, 0), cbm = R2(items.reduce((a, x) => a + x.cbm, 0)), value = R2(items.reduce((a, x) => a + x.value, 0));
    const equipment = OPS.eqFor(cbm, grossKg);
    const wm = R2(Math.max(cbm, grossKg / 1000));

    /* ----- terms ----- */
    const inc = spec.inc;
    const namedPlace = inc === 'EXW' || inc === 'FCA' ? far.city + (inc === 'EXW' ? ' (seller’s premises)' : ' (seller’s premises)') : imp ? far.city : inc === 'DAP' ? far.city + ' (buyer’s warehouse)' : far.city;
    const scope = imp ? (inc === 'FOB' ? 'port' : 'door') + '-' + (spec.door ? 'door' : 'port') : 'door-' + (inc === 'DAP' ? 'door' : 'port');
    const readyOffset = ri(r, 7, 11);
    const etd1 = readyOffset + ri(r, 1, 3);
    const etds = [etd1, etd1 + 7, etd1 + 14];

    /* ----- rates ----- */
    const keys = lcl ? Object.keys(OPS.consols) : Object.keys(OPS.carriers);
    const is20 = equipment === '20DV';
    const base = lcl ? rf(r, reg.lcl[0], reg.lcl[1]) : rf(r, ...(is20 ? reg.r20 : reg.r40));
    const tsList = OPS.shuffle(r, reg.ts);
    const rates = keys.map((k, i) => {
      const of = lcl ? R2(base * rf(r, 0.85, 1.15)) : r5(base * rf(r, 0.88, 1.14));
      const rr = { c: k, of, baf: lcl ? 0 : r5(of * rf(r, 0.11, 0.16)), lss: lcl ? 0 : r5(of * rf(r, 0.025, 0.04)), extra: [], transit: ri(r, reg.tr[0], reg.tr[1]), ts: tsList[i % tsList.length], free: ri(r, 4, 14), validDays: ri(r, 25, 35) };
      if (lcl) { rr.extra.push({ code: 'LBF', name: 'Consolidator B/L & documentation fee', amt: r5(rf(r, 40, 70)), per: 'bl' }); rr.min = 1; rr.free = ri(r, 3, 7); rr.storage = R2(rf(r, 2, 4)); }
      else if (['FE', 'IN', 'AM', 'OC'].includes(far.region)) rr.extra.push({ code: 'CSF', name: 'Contingency / route surcharge', amt: r5(rf(r, 100, 180)) });
      if (!imp && OPS.zone(far.cc) === 'EU') rr.extra.push({ code: 'ENS', name: 'EU ICS2 / ENS filing fee', amt: 35, per: 'bl' });
      if (!imp && far.cc === 'US') rr.extra.push({ code: 'AMS', name: 'US AMS filing fee', amt: 35, per: 'bl' });
      return rr;
    });
    /* trap 1: the cheapest offer expires before the feasible sailing */
    const total = (x) => (lcl ? x.of * wm : x.of + x.baf + x.lss) + x.extra.reduce((a, e) => a + e.amt, 0);
    const byPrice = rates.slice().sort((a, b) => total(a) - total(b));
    byPrice[0].validDays = etds[1] - ri(r, 3, 5);
    /* trap 2: the second cheapest has very short free time */
    byPrice[1].free = lcl ? 2 : 4;
    const ddTariff = lcl ? null : { unit: is20 ? '20′' : '40′', tiers: [{ upTo: 7, rate: is20 ? ri(r, 20, 28) : ri(r, 28, 36) }, { upTo: 999, rate: is20 ? ri(r, 45, 55) : ri(r, 55, 70) }] };
    const expectedDays = imp ? ri(r, 10, 13) : ri(r, 7, 10);

    /* ----- local charges ----- */
    const loc = [];
    const add = (code, en, ar, basis, buy, vendor, vat, group, sug) => loc.push({ code, desc: L(en, ar), basis, buy: R2(buy), vendor, vat, group, sug: R2(sug) });
    const truck = area[2] + (equipment === '20DV' ? -20 : equipment === 'LCL' ? -60 : 0);
    if (imp) {
      if (inc === 'EXW') { add('PICK', 'Origin pickup from seller’s premises (' + far.city + ')', 'استلام من مقرّ البائع (' + far.city + ')', lcl ? 'bl' : 'cntr', rf(r, 160, 320), 'agent', false, 'origin', 0); add('OEXC', 'Origin export customs clearance', 'تخليص صادر في المنشأ', 'bl', rf(r, 70, 120), 'agent', false, 'origin', 0); }
      if (inc === 'FCA') add('PICK', 'Origin pickup (seller loads on our truck)', 'استلام من المنشأ (البائع يحمّل على شاحنتنا)', lcl ? 'bl' : 'cntr', rf(r, 140, 260), 'agent', false, 'origin', 0);
      if (inc !== 'FOB') add(lcl ? 'OCFS' : 'OTHC', lcl ? 'Origin CFS charges' : 'Origin THC', lcl ? 'رسوم محطة التجميع في المنشأ' : 'رسوم مناولة المحطة في المنشأ', lcl ? 'wm' : 'cntr', lcl ? rf(r, 10, 16) : rf(r, 90, 150), 'agent', false, 'origin', 0);
      if (lcl) add('DCFS', 'Destination CFS charges — Beirut (unstuffing & handling)', 'رسوم محطة التجميع في بيروت (تفريغ ومناولة)', 'wm', rf(r, 16, 24), 'carrier', true, 'dest', 0);
      else add('DTHC', 'Destination THC — Beirut', 'رسم مناولة المحطة في بيروت', 'cntr', is20 ? rf(r, 195, 225) : rf(r, 270, 300), 'carrier', true, 'dest', 0);
      add('DOF', 'Delivery order fee', 'رسم إذن التسليم', 'bl', rf(r, 50, 70), 'carrier', true, 'dest', 0);
      add('HDL', 'Forwarder handling & agency fee', 'أتعاب المعالجة والوكالة', 'bl', 0, 'internal', true, 'dest', r5(rf(r, 80, 120)));
      add('DOC', 'Documentation fee (HBL)', 'رسم المستندات (بوليصة الوكيل)', 'bl', 0, 'internal', true, 'dest', r5(rf(r, 40, 60)));
      add('CCL', 'Import customs clearance (broker fee, excl. duties & VAT)', 'تخليص جمركي وارد (أتعاب المخلّص، دون الرسوم والضريبة)', 'bl', rf(r, 100, 140), 'broker', true, 'dest', 0);
      if (spec.door) add('TRK', `Trucking ${lcl ? 'CFS' : 'Beirut port'} → ${area[0]}`, `نقل بري من ${lcl ? 'محطة التجميع' : 'مرفأ بيروت'} إلى ${area[0]}`, lcl ? 'bl' : 'cntr', truck, 'trucker', true, 'dest', 0);
    } else {
      add('TRK', `Trucking ${area[0]} ↔ ${lcl ? 'Beirut CFS' : 'Beirut port'}${lcl ? '' : ', live loading'}`, `نقل بري ${area[0]} ↔ ${lcl ? 'محطة التجميع في بيروت' : 'مرفأ بيروت'}`, lcl ? 'bl' : 'cntr', truck, 'trucker', true, 'origin', 0);
      if (lcl) add('OCFS', 'Origin CFS charges — Beirut (receiving & stuffing)', 'رسوم محطة التجميع في بيروت (استلام وتعبئة)', 'wm', rf(r, 12, 18), 'carrier', true, 'origin', 0);
      else { add('OTHC', 'Origin THC — Beirut', 'رسم مناولة المحطة في بيروت', 'cntr', is20 ? rf(r, 155, 175) : rf(r, 220, 250), 'carrier', true, 'origin', 0); add('SEAL', 'Seal fee', 'رسم الختم', 'cntr', rf(r, 10, 15), 'carrier', true, 'origin', 0); }
      add('BLF', 'B/L fee', 'رسم البوليصة', 'bl', rf(r, 45, 60), 'carrier', true, 'origin', 0);
      add('ECL', 'Export customs clearance (broker fee)', 'تخليص جمركي صادر (أتعاب المخلّص)', 'bl', rf(r, 60, 80), 'broker', true, 'origin', 0);
      const zone = OPS.zone(far.cc);
      add('COO', zone === 'EU' ? 'Chamber COO + EUR.1 processing' : zone === 'ARAB' ? 'Chamber Arab certificate of origin' : 'Chamber certificate of origin', zone === 'EU' ? 'معاملة شهادة المنشأ وEUR.1' : zone === 'ARAB' ? 'شهادة منشأ عربية من الغرفة' : 'شهادة منشأ من الغرفة', 'bl', rf(r, 25, 40), 'chamber', true, 'origin', 0);
      add('HDL', 'Forwarder handling fee', 'أتعاب المعالجة', 'bl', 0, 'internal', true, 'origin', r5(rf(r, 70, 110)));
      if (inc === 'DAP') { add(lcl ? 'DCFS' : 'DTHC', lcl ? 'Destination CFS charges (' + far.city + ')' : 'Destination THC (' + far.city + ')', lcl ? 'رسوم محطة التجميع في الوجهة' : 'رسم المناولة في الوجهة', lcl ? 'wm' : 'cntr', lcl ? rf(r, 18, 28) : rf(r, 220, 320), 'agent', false, 'dest', 0); add('DDEL', 'Delivery to buyer’s warehouse (' + far.city + ')', 'التسليم لمستودع المشتري', 'bl', rf(r, 180, 320), 'agent', false, 'dest', 0); }
    }
    loc.forEach((l) => { if (!l.sug) l.sug = r5(l.buy * rf(r, 1.12, 1.35)) || l.buy + 10; });
    const insurance = (imp && spec.ins) || (!imp && inc === 'CIF') ? { buyPct: R2(rf(r, 0.25, 0.32)), sellPct: R2(rf(r, 0.36, 0.45)) } : null;

    /* ----- inquiry email format (micro-variation) ----- */
    const fmt = pick(r, ['cm', 'mm', 'total']);

    const dirTxt = imp ? L('Import', 'استيراد') : L('Export', 'تصدير');
    const c = {
      id: 'C' + String(no).padStart(2, '0'), no, seed, code: (imp ? 'IM' : 'EX') + (lcl ? 'L' : 'F'), mode: spec.mode, direction: spec.dir, commodityKey: spec.com, tone: spec.tone || 'formal', fmt,
      title: L(`${spec.mode} ${dirTxt.en} — ${com.en}, ${imp ? far.city + ' → Beirut' : 'Beirut → ' + far.city} (${inc})`, `${spec.mode} ${dirTxt.ar} — ${com.ar}، ${imp ? far.city + ' ← بيروت' : 'بيروت ← ' + far.city} (${inc})`),
      summary: L(`${client.name} (${client.contact}) — ${imp ? 'imports from' : 'exports to'} ${far.city}, ${far.country}. ${OPS.PAYMENTS[spec.pay].en}.`, `${client.name} (${client.contact}) — ${imp ? 'يستورد من' : 'يصدّر إلى'} ${far.city}. ${OPS.PAYMENTS[spec.pay].ar}.`),
      client, clientRole: imp ? 'consignee' : 'shipper', shipper, consignee, notify: consignee, agent,
      far, originCC: imp ? (com.madeIn ? com.madeIn[0] : far.cc) : 'LB', consignCC: imp ? far.cc : 'LB', destCC: imp ? 'LB' : far.cc, originCountry: imp ? (com.madeIn ? com.madeIn[1] : far.country) : 'Lebanon', consignCountry: imp ? far.country : 'Lebanon', destCountry: imp ? 'Lebanon' : far.country,
      pref: (() => { const z = OPS.zone(imp ? (com.madeIn ? com.madeIn[0] : far.cc) : far.cc); return z === 'EU' ? 'EUR1' : z === 'ARAB' ? 'GAFTA' : 'none'; })(),
      cargo: { commodity: com.en + (items.length > 1 && !com.en.includes('(') ? ' (' + items.map((x) => x.en.split(',')[0].toLowerCase()).join(' and ') + ')' : ''), commodityAr: com.ar, keywords: [com.kw], keywordsAr: [com.ar.split(' ')[0]], hs: items[0].given, packages, pkgType: com.pkg, value, currency: 'USD', dg: false, food: !!com.food },
      items, answer: { equipment, incoterm: inc, namedPlace: imp ? far.city : far.city, pol: imp ? farPort : lbPort, pod: imp ? lbPort : farPort, scope, grossKg, cbm, wm },
      readyOffset, etds, lane: farPort + '-' + lbPort, delivery: spec.door ? area[0] : null,
      services: { door: imp ? !!spec.door : true, insurance: !!insurance, clearance: true },
      payKind: spec.pay, payment: OPS.PAYMENTS[spec.pay],
      ddSide: 'destination', expectedDays, depot: imp ? 'Beirut — Karantina empty depot' : 'Beirut — Karantina empty depot', cfs: lcl ? (imp ? 'Beirut Port CFS (shed 12)' : 'Beirut Port CFS (export shed 4)') : null,
      rates, ddTariff, locals: loc, deposit: imp && !lcl ? (is20 ? 1000 : 1500) : 0, insurance, licence: com.licence || null, zone: OPS.zone(far.cc), distract: com.distract,
    };
    return c;
  };

  OPS.CASES = OPS.PLAN.map((spec, i) => OPS.makeCase(i + 1, spec, 7919 * (i + 1) + 13));
  OPS.randomCase = (seed) => {
    const r = OPS.rng(seed);
    const dir = r() < 0.6 ? 'import' : 'export', mode = r() < 0.6 ? 'FCL' : 'LCL';
    const coms = Object.entries(OPS.COMMODITIES).filter(([, c]) => c.dir === dir).map(([k]) => k);
    const com = pick(r, coms);
    const spec = { mode, dir, com, inc: dir === 'import' ? pick(r, ['FOB', 'FOB', 'EXW', 'FCA']) : pick(r, ['CFR', 'CFR', 'CIF', 'DAP']), pay: pick(r, dir === 'import' ? ['advance', 'tt_copy', 'lc'] : ['advance', 'cad', 'lc']), door: r() < 0.75, ins: r() < 0.3, tone: pick(r, Object.keys(OPS.TONES)) };
    if (mode === 'FCL') spec.eq = OPS.COMMODITIES[com].dense ? '20DV' : pick(r, ['20DV', '40DV', '40HC']);
    return OPS.makeCase(100 + (seed % 900), spec, seed);
  };

  /* ---------------- helpers used by the steps ---------------- */
  OPS.sc = (ship) => ship.case || OPS.CASES[0];
  OPS.lcl = (s) => OPS.sc(s).mode === 'LCL';
  OPS.lb = (l) => R2(Number(l.buy || 0) * (l.qty || 1));
  OPS.ls = (l) => R2(Number(l.sell || 0) * (l.qty || 1));
  OPS.rateTotal = (r, sc) => {
    const wm = sc ? sc.answer.wm : 1;
    if (r.min != null) return R2(Math.max(r.min, wm) * r.of + r.extra.reduce((a, x) => a + x.amt, 0));
    return R2(r.of + r.baf + r.lss + r.extra.reduce((a, x) => a + x.amt, 0));
  };
  OPS.ddCost = (chargeableDays, tariff) => {
    let left = chargeableDays, cost = 0, from = 0;
    tariff.tiers.forEach((tt) => { const nn = Math.max(0, Math.min(left, tt.upTo - from)); cost += nn * tt.rate; left -= nn; from = tt.upTo; });
    return cost;
  };
  OPS.storageCost = (days, r, wm) => R2(Math.max(0, days) * r.storage * Math.max(1, wm));
  OPS.riskCost = (sc, r) => {
    const over = Math.max(0, sc.expectedDays - r.free);
    return R2(OPS.rateTotal(r, sc) + (sc.mode === 'LCL' ? OPS.storageCost(over, r, sc.answer.wm) : OPS.ddCost(over, sc.ddTariff)));
  };
  OPS.rateValidTo = (ship, r) => TS.addDays(ship.sim.start, r.validDays);
  OPS.rateValidFor = (ship, r) => OPS.rateValidTo(ship, r) >= TS.addDays(ship.sim.start, OPS.sc(ship).etds[1]);
  OPS.bestRate = (ship, among) => {
    const sc = OPS.sc(ship);
    return sc.rates.filter((r) => (!among || among.includes(r.c)) && OPS.rateValidFor(ship, r)).sort((a, b) => OPS.riskCost(sc, a) - OPS.riskCost(sc, b))[0];
  };
  OPS.schedule = (ship, cKey) => {
    const car = OPS.lines[cKey], sc = OPS.sc(ship), r = sc.rates.find((x) => x.c === cKey) || sc.rates[0], lcl = sc.mode === 'LCL';
    return sc.etds.map((off, i) => {
      const etd = TS.addDays(ship.sim.start, off);
      return { idx: i, vessel: car.vessels[i], voyage: (sc.direction === 'import' ? '6' : '7') + String(20 + off) + (sc.direction === 'import' ? 'W' : 'E'),
        erd: TS.addDays(etd, lcl ? -9 : -5), si: TS.addDays(etd, -3), vgm: TS.addDays(etd, -2), cy: TS.addDays(etd, lcl ? -4 : -2), doc: TS.addDays(etd, -2), etd, eta: TS.addDays(etd, r.transit), ts: r.ts };
    });
  };
  OPS.containerCandidates = (prefix, seed) => {
    const base = String(100000 + (seed % 800000)).slice(0, 6);
    const d = TS.REF.checkDigit(prefix + base), good = prefix + base + d;
    const bad1 = prefix + base + ((d + 3) % 10);
    const sw = base.slice(0, 4) + base[5] + base[4];
    let bad2 = prefix + sw + ((TS.REF.checkDigit(prefix + sw) + 5) % 10);
    if (bad2 === good || bad2 === bad1) bad2 = prefix.slice(0, 3) + 'X' + base + d;
    return { good, list: [bad1, good, bad2] };
  };
  OPS.seed = (ship) => ship.id.split('').reduce((a, ch) => (a * 31 + ch.charCodeAt(0)) % 999983, 7);
  /* shipment-level random generator (stable per shipment + salt) */
  OPS.srng = (ship, salt) => OPS.rng(OPS.seed(ship) * 131 + (salt || 0));
})();
