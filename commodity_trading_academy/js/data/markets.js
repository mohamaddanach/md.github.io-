/* Market data module — EVERYTHING HERE IS SIMULATED OR ILLUSTRATIVE.
 * - Contract specifications are illustrative teaching values modelled on commonly published designs.
 *   They are editable in Settings and must be verified against current exchange rulebooks before real use.
 * - Prices are produced by the documented model in CALC.simulateOHLC (GBM + scheduled regime changes/jumps).
 * - No live data feed is connected. See README "Live data" for what a real integration would require. */
(function () {
  const CTA = window.CTA, C = window.CALC;
  const M = (CTA.MARKET = {});

  /* pointValue = USD per 1.0 move in the quoted price. tick value = tick × pointValue. */
  M.SPECS_DEFAULT = {
    GC: { name: 'Gold futures (100 oz type)', commodity: 'gold', unit: 'USD/ozt', size: '100 troy oz', pointValue: 100, tick: 0.1, im: 12000, mm: 11000, fee: 2.5, spreadTicks: 2, slipTicks: 1, start: 2000, dp: 1, note: 'Modelled on widely published 100-oz gold futures designs.' },
    MGC: { name: 'Micro gold futures (10 oz type)', commodity: 'gold', unit: 'USD/ozt', size: '10 troy oz', pointValue: 10, tick: 0.1, im: 1200, mm: 1100, fee: 0.8, spreadTicks: 2, slipTicks: 1, start: 2000, dp: 1, note: 'Smaller contract for position sizing practice.' },
    ZW: { name: 'Wheat futures (5,000 bu type)', commodity: 'wheat', unit: 'US cents/bu', size: '5,000 bushels', pointValue: 50, tick: 0.25, im: 2200, mm: 2000, fee: 2.5, spreadTicks: 1, slipTicks: 1, start: 600, dp: 2, note: '1 cent/bu = USD 50 per contract; tick 1/4 cent = USD 12.50.' },
    SB: { name: 'Raw sugar futures (112,000 lb type)', commodity: 'sugar', unit: 'US cents/lb', size: '112,000 lb', pointValue: 1120, tick: 0.01, im: 1700, mm: 1550, fee: 2.5, spreadTicks: 1, slipTicks: 1, start: 19.5, dp: 2, note: '1 cent/lb = USD 1,120 per contract; tick 0.01 = USD 11.20.' },
    SW: { name: 'White sugar futures (50 t type)', commodity: 'sugar', unit: 'USD/t', size: '50 metric tons', pointValue: 50, tick: 0.1, im: 2000, mm: 1800, fee: 2.5, spreadTicks: 2, slipTicks: 1, start: 540, dp: 1, note: 'Tick 0.10 = USD 5.' },
    HRC: { name: 'Hot-rolled coil futures (20 short ton type)', commodity: 'steel', unit: 'USD/short ton', size: '20 short tons', pointValue: 20, tick: 1, im: 2600, mm: 2350, fee: 3, spreadTicks: 2, slipTicks: 1, start: 800, dp: 0, note: 'Regional benchmark; lower liquidity than gold. Large basis risk for other regions/products.' },
  };
  M.specs = () => {
    const o = CTA.clone(M.SPECS_DEFAULT);
    const ov = (CTA.state.settings.specs || {});
    Object.keys(ov).forEach((k) => { if (o[k]) Object.assign(o[k], ov[k]); });
    return o;
  };

  /* annualised drift/vol defaults used by the market board and datasets */
  M.PROFILE = {
    gold: { label: 'Gold', vol: 0.15, color: '#b8901f' }, wheat: { label: 'Wheat', vol: 0.3, color: '#c98a1d' },
    sugar: { label: 'Raw sugar', vol: 0.28, color: '#8a7f6e' }, steel: { label: 'HRC steel', vol: 0.25, color: '#5d7189' },
  };

  /* ------------------------------------------------ simulated market board (changes daily, deterministic per day) */
  M.board = function () {
    const day = Math.floor(Date.now() / 86400000);
    const items = [
      ['Gold spot', 'USD/ozt', 2000, 0.15, 1, 'gold'], ['Wheat futures', 'c/bu', 600, 0.30, 2, 'wheat'], ['Milling wheat FOB (Black Sea-type)', 'USD/t', 235, 0.25, 3, 'wheat'],
      ['Raw sugar futures', 'c/lb', 19.5, 0.28, 4, 'sugar'], ['White sugar futures', 'USD/t', 540, 0.24, 5, 'sugar'], ['HRC (regional benchmark-type)', 'USD/t', 640, 0.25, 6, 'steel'],
      ['Rebar export (FOB-type)', 'USD/t', 560, 0.22, 7, 'steel'], ['Iron ore 62% Fe-type', 'USD/t', 110, 0.32, 8, 'steel'], ['Supramax freight index-type', 'USD/day', 14000, 0.55, 9, 'freight'], ['EUR/USD', 'rate', 1.08, 0.08, 10, 'fx'],
    ];
    return items.map(([name, unit, start, vol, seed, com]) => {
      const path = C.simulateOHLC({ start, days: 60, vol, seed: day * 31 + seed * 7, drift: 0 }).map((d) => d.c);
      const last = path[path.length - 1], prev = path[path.length - 2];
      return { name, unit, com, last, chg: (last / prev - 1) * 100, hist: path };
    });
  };

  /* ------------------------------------------------ correlated datasets for the quant lab (500 trading days) */
  M.dataset = function (seed) {
    const r = C.rng(seed || 2024);
    const names = ['gold', 'wheat', 'sugar', 'steel'], start = [2000, 220, 430, 640], vol = [0.15, 0.3, 0.28, 0.25], mu = [0.04, 0.02, 0.0, 0.01];
    const corr = [[1, 0.12, 0.10, 0.08], [0.12, 1, 0.30, 0.15], [0.10, 0.30, 1, 0.12], [0.08, 0.15, 0.12, 1]];
    // Cholesky
    const n = 4, L = Array.from({ length: n }, () => new Array(n).fill(0));
    for (let i = 0; i < n; i++) for (let j = 0; j <= i; j++) { let s = 0; for (let k = 0; k < j; k++) s += L[i][k] * L[j][k]; L[i][j] = i === j ? Math.sqrt(corr[i][i] - s) : (corr[i][j] - s) / L[j][j]; }
    const dt = 1 / 252, days = 500, out = {}; names.forEach((nm, i) => { out[nm] = [start[i]]; });
    for (let t = 1; t < days; t++) {
      const z = names.map(() => r.normal()), e = names.map((_, i) => L[i].reduce((s, l, k) => s + l * z[k], 0));
      // occasional jumps (supply shocks) for agricultural series
      names.forEach((nm, i) => {
        let jump = 0; if ((nm === 'wheat' || nm === 'sugar') && r() < 0.006) jump = (r() < 0.6 ? 1 : -1) * r.range(0.04, 0.09);
        const p = out[nm][t - 1] * Math.exp((mu[i] - 0.5 * vol[i] * vol[i]) * dt + vol[i] * Math.sqrt(dt) * e[i] + jump);
        out[nm].push(p);
      });
    }
    return { names, series: out, units: { gold: 'USD/ozt', wheat: 'USD/t', sugar: 'USD/t (raw)', steel: 'USD/t (HRC)' }, trueCorr: corr };
  };

  /* ------------------------------------------------ futures scenarios (documented rules) */
  M.SCENARIOS = [
    { id: 'gold-up', title: 'Rising gold — falling real yields', inst: 'GC', days: 60, drift: 0.05, vol: 0.14, iv: 0.16, seed: 11, objective: 'Trade a trend driven by macro news; practise position sizing and trailing stops.',
      events: [{ day: 8, drift: 0.35, news: 'Inflation data surprise to the downside; markets price earlier rate cuts. Real yields fall.' }, { day: 22, jumpPct: 1.2, news: 'Central bank purchases reported higher than expected (simulated report).' }, { day: 40, drift: 0.1, vol: 0.18, news: 'Profit-taking as positioning becomes crowded; volatility rises.' }],
      debrief: 'Model rule: drift switches from +5% to +35% p.a. on day 8 then slows to +10% with higher vol on day 40. A trend-following long sized at 1% risk would have gained; adding late into the crowded phase increased drawdown risk.' },
    { id: 'gold-down', title: 'Falling gold — strong USD, hawkish policy', inst: 'GC', days: 60, drift: 0, vol: 0.15, iv: 0.17, seed: 23, objective: 'Recognise a regime change and manage a long position that goes wrong; consider shorts.',
      events: [{ day: 5, drift: -0.3, news: 'Central bank signals higher-for-longer rates; USD index rallies.' }, { day: 18, jumpPct: -1.8, news: 'Strong employment report; real yields jump.' }, { day: 35, drift: -0.05, news: 'Physical buying emerges in Asia at lower prices (simulated).' }],
      debrief: 'Model rule: drift −30% p.a. from day 5 with a −1.8% jump on day 18, then stabilises. Longs without stops suffered; shorts profited until physical demand slowed the decline.' },
    { id: 'wheat-shock', title: 'Wheat supply shock — drought in a major exporter', inst: 'ZW', days: 50, drift: 0, vol: 0.25, iv: 0.3, seed: 37, objective: 'Handle a gap and a volatility spike; see how options behave.',
      events: [{ day: 6, news: 'Weather models show prolonged dryness in a key exporter during grain fill.' }, { day: 12, jumpPct: 7, vol: 0.45, drift: 0.4, news: 'Government cuts crop estimate sharply; talk of export quotas.' }, { day: 30, jumpPct: -4, drift: -0.2, vol: 0.35, news: 'Rains arrive; export quota announced smaller than feared.' }],
      debrief: 'Model rule: +7% gap on day 12 with vol rising to 45%, then a −4% reversal on day 30. Shorts were hurt by the gap (stops slipped); long calls bought before day 12 benefited from both price and implied volatility.' },
    { id: 'sugar-surprise', title: 'Sugar production surprise — higher sugar mix', inst: 'SB', days: 50, drift: 0.02, vol: 0.26, iv: 0.28, seed: 41, objective: 'Interpret a fundamental report and trade it with defined risk.',
      events: [{ day: 10, jumpPct: -5, drift: -0.25, news: 'Industry data show mills maximising sugar over ethanol: sugar mix well above expectations.' }, { day: 28, drift: 0.05, news: 'Ethanol prices rise with gasoline; some mills may shift back toward ethanol.' }],
      debrief: 'Model rule: −5% jump on day 10 and negative drift until day 28. A pre-report position was a gamble; trading after the report with stops was more disciplined.' },
    { id: 'steel-demand', title: 'Steel demand change — infrastructure stimulus then destocking', inst: 'HRC', days: 60, drift: 0, vol: 0.22, iv: 0.25, seed: 53, objective: 'Experience a lower-liquidity contract with wider spreads and a demand cycle.',
      events: [{ day: 7, drift: 0.45, news: 'Large infrastructure programme announced; distributors restock.' }, { day: 30, drift: -0.35, vol: 0.28, news: 'Mills restart idle capacity; imports increase; distributors destock.' }],
      debrief: 'Model rule: drift +45% p.a. from day 7, reversing to −35% from day 30. Demand-driven rallies can reverse when supply responds. Wider spreads/slippage raise trading costs.' },
    { id: 'freight-spike', title: 'Unexpected freight cost increase', inst: 'ZW', days: 45, drift: 0, vol: 0.22, iv: 0.26, seed: 61, objective: 'Understand that higher freight can pressure exporters\' FOB/futures prices while raising importers\' CFR costs.',
      events: [{ day: 9, jumpPct: -2.5, drift: -0.15, news: 'Dry-bulk freight jumps 40% after a canal restriction; delivered prices to importers rise and demand for exporter FOB wheat weakens.' }, { day: 27, drift: 0.05, news: 'Freight normalises partially as vessels reposition.' }],
      debrief: 'Model rule: −2.5% jump and negative drift on day 9. For an exporter-referenced futures, freight spikes can be bearish (FOB must fall to stay competitive) even though importers pay more delivered.' },
    { id: 'fx-move', title: 'Currency movement — producer currency weakens', inst: 'SB', days: 45, drift: 0, vol: 0.24, iv: 0.27, seed: 71, objective: 'See how a weaker exporter currency can pressure USD-denominated prices.',
      events: [{ day: 6, drift: -0.3, news: 'The main exporter\'s currency falls 8% vs USD; producers accelerate USD-priced sales.' }, { day: 25, drift: 0, news: 'Currency stabilises.' }],
      debrief: 'Model rule: drift −30% p.a. between day 6 and 25. A weaker producer currency raises local-currency returns and often increases selling pressure.' },
    { id: 'vol-spike', title: 'Sudden volatility', inst: 'GC', days: 40, drift: 0, vol: 0.12, iv: 0.14, seed: 83, objective: 'Manage stops and margin in a market that suddenly swings both ways.',
      events: [{ day: 10, vol: 0.45, jumpPct: -2.5, news: 'Market-wide liquidation: investors sell liquid assets including gold to meet margin calls.' }, { day: 13, jumpPct: 3, news: 'Policy intervention; gold rebounds sharply.' }, { day: 25, vol: 0.18, news: 'Volatility subsides.' }],
      debrief: 'Model rule: vol jumps from 12% to 45% on day 10 with −2.5% then +3% gaps. Tight stops were triggered at bad prices; oversized positions faced margin calls.' },
    { id: 'expiry', title: 'Contract expiration and roll', inst: 'ZW', days: 40, drift: 0, vol: 0.2, iv: 0.24, seed: 97, expiryDay: 22, rollSpread: 12, objective: 'Roll an expiring position into the next contract month before last trading day.',
      events: [{ day: 15, news: 'Reminder: front-month last trading day is day 22. Open positions not closed or rolled will be closed at settlement (delivery not supported in this simulator).' }, { day: 22, news: 'Front month expired. Trading continues in the next contract month (12 c/bu contango).' }],
      debrief: 'Rule: on day 22 the front contract expires; the next month trades 12 c/bu higher (contango). Longs that roll pay the spread; shorts that roll gain it. Unrolled positions were closed at the expiry settlement.' },
    { id: 'margin-call', title: 'Margin call stress', inst: 'SB', days: 40, drift: -0.1, vol: 0.32, iv: 0.33, seed: 109, startCash: 30000, preload: [{ side: 'long', qty: 12 }], objective: 'You inherit an over-leveraged long. Manage the margin call: deposit, reduce or close?',
      events: [{ day: 3, jumpPct: -3, drift: -0.4, news: 'Large export programme announced by a major producer; prices drop.' }, { day: 18, drift: 0.1, news: 'Selling exhausts; prices stabilise.' }],
      debrief: 'Rule: −3% jump on day 3 with −40% drift until day 18. With 12 contracts on 30,000 equity, leverage was ~90×; a margin call was almost certain. Depositing more only works if the original thesis is still valid and size is reduced.' },
  ];

  /* ------------------------------------------------ value chain explorer data */
  M.CHAIN = [
    ['Production', { gold: 'Open-pit/underground mines; artisanal mining in some regions; recycling of jewellery and electronics.', wheat: 'Farmers plant in autumn (winter wheat) or spring; yields depend on weather and inputs.', sugar: 'Cane in tropics (ratoon cycles), beet in temperate zones.', steel: 'Iron ore and coking coal mining; scrap collection.' }],
    ['Collection', { gold: 'Doré bars shipped from mines; scrap collected by dealers.', wheat: 'Country elevators receive, grade and pool grain from many farms.', sugar: 'Cane delivered to mills within hours of cutting.', steel: 'Ore railed to ports; scrap yards sort and process scrap.' }],
    ['Processing', { gold: 'Refiners produce 995–999.9 bars and grain.', wheat: 'Cleaning/drying at elevators; milling into flour at destination.', sugar: 'Mills make raw or plantation white; refineries make refined sugar.', steel: 'BF-BOF or EAF → semis → rolled long/flat products.' }],
    ['Storage', { gold: 'High-security vaults; allocated/unallocated accounts.', wheat: 'Silos, aeration, fumigation, segregation by quality.', sugar: 'Bulk warehouses (raw), bagged warehouses (white).', steel: 'Covered yards, mill/port stocks, distributor inventory.' }],
    ['Transportation', { gold: 'Secure air freight and armoured logistics.', wheat: 'Truck/rail/barge to port; bulk carriers.', sugar: 'Bulk carriers (raw); containers/breakbulk (white).', steel: 'Breakbulk, containers, bulk for semis/scrap.' }],
    ['Trading', { gold: 'Bullion banks and dealers, exchanges, refiners.', wheat: 'Merchants, state tenders, futures + basis pricing.', sugar: 'Merchants, refiners; futures + premium pricing.', steel: 'Mills, traders, distributors; assessed price benchmarks.' }],
    ['Financing', { gold: 'Gold leasing, consignment, secured lending.', wheat: 'Pre-export finance, LCs, inventory finance.', sugar: 'Pre-export finance, LCs, borrowing bases.', steel: 'LCs, receivable finance, distributor credit lines.' }],
    ['Delivery', { gold: 'Vault-to-vault transfers, DvP.', wheat: 'Discharge at destination port, outturn surveys.', sugar: 'Discharge, outturn weights and quality analyses.', steel: 'Discharge, inspection against specs and MTCs.' }],
    ['Final consumption', { gold: 'Jewellery, investment, central banks, technology.', wheat: 'Bread, noodles, pasta (durum), biscuits, feed.', sugar: 'Food & beverage, households, industry.', steel: 'Construction, machinery, automotive, appliances, energy.' }],
  ];

  /* ------------------------------------------------ research & data sources (Part 18) */
  M.SOURCES = [
    { name: 'World Bank — Commodity Markets ("Pink Sheet")', url: 'https://www.worldbank.org/en/research/commodity-markets', type: 'Official / multilateral', use: 'Monthly historical price series and outlooks for many commodities; good for long-run context, not trading.', com: ['gold', 'wheat', 'sugar', 'steel'] },
    { name: 'IMF — Primary Commodity Prices', url: 'https://www.imf.org/en/Research/commodity-prices', type: 'Official / multilateral', use: 'Monthly benchmark price indices and series for macro analysis.', com: ['gold', 'wheat', 'sugar'] },
    { name: 'USGS National Minerals Information Center', url: 'https://www.usgs.gov/centers/national-minerals-information-center', type: 'Official statistics', use: 'Mineral Commodity Summaries and yearbooks: gold, iron ore, iron and steel production, reserves.', com: ['gold', 'steel'] },
    { name: 'USDA WASDE', url: 'https://www.usda.gov/oce/commodity/wasde', type: 'Official statistics', use: 'Monthly world supply-and-demand estimates for grains and sugar (US and world).', com: ['wheat', 'sugar'] },
    { name: 'USDA FAS — PSD Online', url: 'https://apps.fas.usda.gov/psdonline/', type: 'Official statistics', use: 'Country-level production, supply and distribution balance sheets; build your own balances.', com: ['wheat', 'sugar'] },
    { name: 'AMIS Market Monitor', url: 'https://www.amis-outlook.org/', type: 'Inter-governmental', use: 'Monthly synthesis of wheat, maize, rice, soybean markets and policies (G20 initiative).', com: ['wheat'] },
    { name: 'FAO — Markets and Trade', url: 'https://www.fao.org/markets-and-trade/en/', type: 'Inter-governmental', use: 'Food Outlook, food price index, policy monitoring.', com: ['wheat', 'sugar'] },
    { name: 'International Grains Council', url: 'https://www.igc.int/', type: 'Inter-governmental / industry', use: 'Grain market reports, freight and export price indices (some content requires subscription).', com: ['wheat'] },
    { name: 'International Sugar Organization', url: 'https://www.isosugar.org/', type: 'Inter-governmental', use: 'World sugar balance estimates and market analysis (some reports require subscription).', com: ['sugar'] },
    { name: 'World Steel Association (worldsteel)', url: 'https://worldsteel.org/', type: 'Industry association', use: 'Crude steel production statistics, short-range demand outlook.', com: ['steel'] },
    { name: 'World Gold Council', url: 'https://www.gold.org/', type: 'Industry association', use: 'Gold demand trends, ETF holdings, central bank statistics, market structure.', com: ['gold'] },
    { name: 'LBMA', url: 'https://www.lbma.org.uk/', type: 'Market body', use: 'Good Delivery rules, responsible-sourcing guidance, London market structure, LBMA prices (licensing applies).', com: ['gold'] },
    { name: 'CME Group', url: 'https://www.cmegroup.com/', type: 'Exchange', use: 'Official contract specifications, margins, settlement prices (data licensing applies) for gold, grains, steel.', com: ['gold', 'wheat', 'steel'] },
    { name: 'ICE (Intercontinental Exchange)', url: 'https://www.ice.com/', type: 'Exchange', use: 'Specifications and data for sugar and other softs contracts.', com: ['sugar'] },
    { name: 'London Metal Exchange', url: 'https://www.lme.com/', type: 'Exchange', use: 'Steel scrap/rebar/HRC contract information and other metals.', com: ['steel'] },
    { name: 'CFTC — Commitments of Traders', url: 'https://www.cftc.gov/MarketReports/CommitmentsofTraders/index.htm', type: 'Regulator statistics', use: 'Weekly positioning in US futures markets by trader category.', com: ['gold', 'wheat', 'sugar'] },
    { name: 'UN Comtrade', url: 'https://comtradeplus.un.org/', type: 'Official trade database', use: 'Bilateral trade flows by HS code (with reporting lags and revisions).', com: ['gold', 'wheat', 'sugar', 'steel'] },
    { name: 'Eurostat', url: 'https://ec.europa.eu/eurostat', type: 'Official statistics', use: 'EU production, trade (Comext) and price statistics.', com: ['wheat', 'sugar', 'steel'] },
    { name: 'Baltic Exchange', url: 'https://www.balticexchange.com/', type: 'Market body', use: 'Dry-bulk freight indices (data subscription).', com: ['wheat', 'sugar', 'steel'] },
    { name: 'ICC — Incoterms® and UCP 600', url: 'https://iccwbo.org/', type: 'Rules publisher', use: 'Official texts of Incoterms 2020, UCP 600, URDG 758 (purchase required for full texts).', com: ['gold', 'wheat', 'sugar', 'steel'] },
    { name: 'World Customs Organization — HS Nomenclature', url: 'https://www.wcoomd.org/', type: 'International organisation', use: 'Harmonized System classification framework.', com: ['gold', 'wheat', 'sugar', 'steel'] },
    { name: 'OFAC Sanctions List Search (US)', url: 'https://sanctionssearch.ofac.treas.gov/', type: 'Official sanctions list', use: 'Screening against US sanctions lists.', com: ['gold', 'wheat', 'sugar', 'steel'] },
    { name: 'EU Sanctions Map', url: 'https://www.sanctionsmap.eu/', type: 'Official sanctions information', use: 'Overview of EU restrictive measures.', com: ['gold', 'wheat', 'sugar', 'steel'] },
    { name: 'UK Sanctions List', url: 'https://www.gov.uk/government/publications/the-uk-sanctions-list', type: 'Official sanctions list', use: 'UK designations.', com: ['gold', 'wheat', 'sugar', 'steel'] },
    { name: 'OECD — Due Diligence Guidance for Responsible Supply Chains of Minerals', url: 'https://www.oecd.org/', type: 'Inter-governmental guidance', use: 'Framework for responsible sourcing of gold and other minerals.', com: ['gold'] },
  ];
  M.SOURCE_TYPES = [
    ['Official statistics', 'Government/inter-governmental estimates (USDA, USGS, Eurostat). Methodology published; revised over time; released with lags.'],
    ['Exchange prices', 'Settlement and traded prices of standardised contracts; transparent but licensed; may differ from physical prices by basis.'],
    ['Broker quotations', 'Indicative bids/offers from brokers; useful for illiquid products; not necessarily executable or representative.'],
    ['Industry estimates', 'Associations, consultancies and price reporting agencies; valuable but methodology and incentives vary.'],
    ['News reports', 'Fast but may be incomplete or wrong; verify with primary sources.'],
    ['Simulated educational data', 'Everything generated inside this academy. Never treat as market information.'],
  ];
})();
