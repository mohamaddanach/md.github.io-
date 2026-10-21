/* Physical Trading Simulator scenarios — one complete end-to-end deal per commodity.
 * ALL COUNTERPARTIES, PRICES AND EVENTS ARE FICTIONAL / SIMULATED.
 *
 * Pricing model used by the simulator (documented so results are reproducible):
 *   purchase price / unit = benchmark at contract (B0) + supplier differential  (fixed at purchase)
 *   sale price / unit     = benchmark at B/L date (B1) + buyer premium          (priced at shipment)
 *   B1 = B0 × (1 + marketMovePct)  → the trader is exposed to the benchmark between purchase and B/L
 *   hedge result          = − qty × B0 × futuresMovePct × hedgeRatio            (short hedge; futures move ≠ benchmark move → basis risk)
 *   costs                 = perUnit lines × qty + pct lines × purchase value + lump sums (+ route freight)
 *   financing             = (purchase value + costs) × financed share × rate × cycle days / 360
 */
(function () {
  const CTA = window.CTA;
  CTA.SIM_SCENARIOS = {
    wheat: {
      title: 'Milling wheat to a North African flour mill', unit: 't', unitLabel: 'metric tons', priceUnit: 'USD/t', qty: 30000, dp: 2,
      benchmark: { name: 'Black Sea-type milling wheat FOB benchmark', B0: 232 },
      inquiry: 'Nile Valley Milling Co. (fictional, Alexandria) requests 30,000 t ±10% milling wheat, protein min 12.5% (dry basis), moisture max 13.5%, test weight min 78 kg/hl, falling number min 250 s, CFR Alexandria, shipment 10–25 April. Payment terms open for discussion.',
      specItems: [['Protein minimum and its moisture basis', true], ['Moisture maximum', true], ['Falling number minimum', true], ['Who performs quality/weight inspection and where results are final', true], ['Quantity tolerance and whose option', true], ['Vessel flag colour', false], ['The mill\'s preferred flour brand name', false], ['Phytosanitary/import requirements of the destination', true]],
      suppliers: [
        { id: 'S1', name: 'Steppe Export LLC', country: 'fictional Black Sea origin', years: 2, rating: 'C', reliability: 0.55, diff: -3, canSupply: true, pay: '30% advance, balance CAD', notes: 'No audited accounts; two late shipments reported by a reference; offers lowest price.', risk: 'High' },
        { id: 'S2', name: 'Danubia Grain SRL', country: 'Romania (fictional company)', years: 7, rating: 'B', reliability: 0.85, diff: 0, canSupply: true, pay: 'CAD at sight', notes: 'Audited accounts; owns a port silo; one quality dispute settled in 2025.', risk: 'Medium' },
        { id: 'S3', name: 'Baltic Agri Trading AB', country: 'EU (fictional company)', years: 18, rating: 'A', reliability: 0.97, diff: 2.5, canSupply: true, pay: 'LC at sight', notes: 'Large exporter, strong references, consistent quality.', risk: 'Low' },
        { id: 'S4', name: 'Golden Plains Co-op', country: 'fictional origin', years: 12, rating: 'B', reliability: 0.9, diff: -6, canSupply: false, pay: 'CAD', notes: 'Offers 11.5% protein only; earliest shipment in June.', risk: 'Medium' },
      ],
      buyers: [
        { id: 'A', label: 'Benchmark + 40.00, 90-day open account', prem: 40, payDays: 90, security: 'none', credit: 'C', pd: 0.06, note: 'Highest price; buyer\'s accounts show rising debt; no payment security.' },
        { id: 'B', label: 'Benchmark + 36.50, confirmed LC at sight', prem: 36.5, payDays: 5, security: 'confirmed LC', credit: 'B', pd: 0.005, note: 'Lowest price; bank risk only; strict documents.' },
        { id: 'C', label: 'Benchmark + 38.00, cash against documents', prem: 38, payDays: 12, security: 'CAD', credit: 'B', pd: 0.02, note: 'Buyer could refuse documents if prices fall.' },
      ],
      routes: [
        { id: 'R1', label: 'Direct Supramax, modern vessel', freight: 27, days: 12, delayRisk: 0.1, damageRisk: 0.02, note: 'Faster and more reliable; higher freight.' },
        { id: 'R2', label: 'Older Handysize with part-cargo stop', freight: 23.5, days: 19, delayRisk: 0.4, damageRisk: 0.08, note: 'Cheaper; longer voyage; delay and condition risk.' },
      ],
      costs: { perUnit: [['Port & agency at load (trader\'s account)', 1.2]], pct: [['Contingency cargo insurance (seller\'s interest)', 0.05]], lump: [['Pre-shipment inspection (base)', 15000]] },
      inspection: [{ id: 'I1', label: 'Independent surveyor at loading, results final', cost: 15000, claimRisk: 0.05 }, { id: 'I2', label: 'Loading + discharge surveys, discharge final', cost: 26000, claimRisk: 0.35 }, { id: 'I3', label: 'Supplier\'s own laboratory certificate', cost: 0, claimRisk: 0.5 }],
      finance: [{ id: 'F1', label: 'Transactional facility: 85% of cost at 7.2% p.a.', share: 85, rate: 7.2, equityCost: 10 }, { id: 'F2', label: 'Equity only (opportunity cost 10% p.a.)', share: 0, rate: 0, equityCost: 10 }, { id: 'F3', label: 'Unsecured overdraft 100% at 11.5%', share: 100, rate: 11.5, equityCost: 10 }],
      market: { movePct: -5, futMovePct: -4.6, hedgeName: 'wheat futures (5,000 bu, tonne-equivalent)', hedgeEff: 1, news: 'Harvest pressure and good crop reports push benchmark wheat down 5% between purchase and B/L date; futures fall 4.6% (basis weakens).' },
      docs: { required: ['Commercial invoice', 'Full set clean on board bill of lading', 'Quality certificate (independent surveyor)', 'Weight certificate', 'Certificate of origin', 'Phytosanitary certificate'], optional: ['Insurance certificate', 'Packing list', 'Mill test certificate', 'Assay certificate / bar list', 'Fumigation certificate'] },
      contractClauses: [
        { k: 'Quality determination', opts: ['Final at loading per independent surveyor certificates', 'Final at discharge per buyer\'s laboratory', 'No clause'], ok: 0 },
        { k: 'Quantity', opts: ['30,000 t ±10% at Seller\'s option', '30,000 t exactly', '30,000 t ±10% at Buyer\'s option'], ok: 0 },
        { k: 'Delivery', opts: ['CFR Alexandria, Incoterms® 2020', 'CFR (place to be agreed)', 'FOB Alexandria'], ok: 0 },
        { k: 'Disputes', opts: ['Arbitration under an agreed trade association\'s rules, English law', 'Courts of any country the buyer chooses', 'Not stated'], ok: 0 },
      ],
      mismatch: [['Quantity tolerance', '±10% Seller\'s option', '±5% Buyer\'s option', true], ['Quality final', 'At loading', 'At loading', false], ['Shipment period', '10–25 April', '15–30 April', true], ['Law/arbitration', 'English law, trade association', 'English law, trade association', false], ['Demurrage', 'As per C/P, max 15,000/day', 'As per C/P', false]],
      units: { benchmark: 'USD/t', qtyLabel: '30,000 t' },
    },
    gold: {
      title: 'Kilobars from a Swiss refiner to a Gulf jewellery manufacturer', unit: 'oz', unitLabel: 'fine troy ounces', priceUnit: 'USD/oz', qty: 3214.75, dp: 2,
      benchmark: { name: 'Gold spot (simulated)', B0: 2000 },
      inquiry: 'Al Noor Jewellery Manufacturing LLC (fictional, Dubai) requests 100 × 1 kg bars, 999.9 fineness, from LBMA-accredited refiners, delivered to its vault in Dubai within 10 days. 100 kg ≈ 3,214.75 fine oz.',
      specItems: [['Fineness (999.9) and accepted refiners', true], ['Bar weight and bar list with serial numbers', true], ['Delivery point and risk transfer (vault, airport)', true], ['Pricing time (spot at which moment) and premium', true], ['Settlement method (DvP, escrow, advance)', true], ['Colour of the packaging', false], ['Responsible-sourcing documentation', true], ['Number of employees at the buyer', false]],
      suppliers: [
        { id: 'S1', name: 'Rapid Bullion FZE', country: 'fictional free zone', years: 1, rating: 'C', reliability: 0.5, diff: -1.5, canSupply: true, pay: '100% advance to a third-party account', notes: 'Bars "from various refiners"; refuses vault inspection; very new company.', risk: 'High' },
        { id: 'S2', name: 'Alpine Metals Dealers AG', country: 'Switzerland (fictional)', years: 9, rating: 'B', reliability: 0.88, diff: 0.6, canSupply: true, pay: 'Payment on vault release', notes: 'Dealer with good references; bars from accredited refiners.', risk: 'Medium' },
        { id: 'S3', name: 'Helvetic Refining SA', country: 'Switzerland (fictional)', years: 35, rating: 'A', reliability: 0.98, diff: 1.1, canSupply: true, pay: 'DvP via vault operator', notes: 'Accredited refiner, responsible-sourcing programme, bar lists issued directly.', risk: 'Low' },
        { id: 'S4', name: 'Andes Doré Export', country: 'fictional', years: 6, rating: 'B', reliability: 0.85, diff: -4, canSupply: false, pay: 'Advance', notes: 'Sells 995.0 bars / doré only.', risk: 'Medium' },
      ],
      buyers: [
        { id: 'A', label: 'Spot + 11.00, 30-day credit (jeweller)', prem: 11, payDays: 30, security: 'none', credit: 'C', pd: 0.05, note: 'Best premium; unsecured credit on ~6.4m.' },
        { id: 'B', label: 'Spot + 8.00, DvP (Gulf bullion bank)', prem: 8, payDays: 1, security: 'DvP', credit: 'A', pd: 0.001, note: 'Safe and fast; thin premium.' },
        { id: 'C', label: 'Spot + 9.50, escrow 5 days (jeweller)', prem: 9.5, payDays: 5, security: 'escrow', credit: 'B', pd: 0.005, note: 'Balanced; escrow through a recognised bank.' },
      ],
      routes: [
        { id: 'R1', label: 'Direct secure air freight, vault-to-vault', freight: 1.3, days: 2, delayRisk: 0.05, damageRisk: 0.0, note: 'Specialised carrier, fully insured door-to-door.' },
        { id: 'R2', label: 'Consolidated secure shipment (weekly)', freight: 0.8, days: 7, delayRisk: 0.25, damageRisk: 0.0, note: 'Cheaper; waits for consolidation; more handling points.' },
      ],
      costs: { perUnit: [], pct: [['Transit & vault insurance', 0.02]], lump: [['Customs/free-zone formalities', 1500]] },
      inspection: [{ id: 'I1', label: 'Bar-list check + weighing at destination vault (accredited bars)', cost: 2500, claimRisk: 0.02 }, { id: 'I2', label: 'Full independent re-assay of sample bars', cost: 9000, claimRisk: 0.01 }, { id: 'I3', label: 'No inspection — rely on supplier documents', cost: 0, claimRisk: 0.3 }],
      finance: [{ id: 'F1', label: 'Bank metal financing: 90% at 6.5% p.a.', share: 90, rate: 6.5, equityCost: 10 }, { id: 'F2', label: 'Equity only (opportunity cost 10% p.a.)', share: 0, rate: 0, equityCost: 10 }, { id: 'F3', label: 'Short-term unsecured loan 100% at 11%', share: 100, rate: 11, equityCost: 10 }],
      market: { movePct: -2, futMovePct: -1.98, hedgeName: 'gold futures (100 oz)', hedgeEff: 1, news: 'A strong US dollar pushes gold down 2% while the bars are in transit; futures fall 1.98%.' },
      docs: { required: ['Commercial invoice', 'Assay certificate / bar list', 'Air waybill / secure carrier receipt', 'Certificate of origin', 'Insurance certificate'], optional: ['Phytosanitary certificate', 'Full set clean on board bill of lading', 'Mill test certificate', 'Weight certificate', 'Fumigation certificate'] },
      contractClauses: [
        { k: 'Product', opts: ['1 kg bars, min 999.9, LBMA-accredited refiners, bar list attached', '1 kg gold bars', 'Gold, purity to be confirmed'], ok: 0 },
        { k: 'Pricing', opts: ['Spot at time of trade confirmation + the agreed premium per fine oz', 'Spot on any day the buyer chooses', 'Price to be agreed'], ok: 0 },
        { k: 'Settlement', opts: ['Delivery versus payment via named vault operator/escrow bank', 'Payment 60 days after delivery', 'Seller delivers, buyer pays when convenient'], ok: 0 },
        { k: 'Risk transfer', opts: ['On delivery into buyer\'s allocated account at the named vault', 'When the seller ships', 'Not stated'], ok: 0 },
      ],
      mismatch: [['Fineness', '999.9', '999.9', false], ['Delivery point', 'Buyer vault, Dubai', 'Seller vault, Zurich (FCA)', false], ['Delivery timing', 'Within 10 days', 'Within 15 days', true], ['Settlement', 'DvP / escrow', 'Payment on vault release', false], ['Weight tolerance', 'Bar weights per bar list', '±1% on total weight', true]],
      units: { benchmark: 'USD/oz', qtyLabel: '100 kg (3,214.75 fine oz)' },
    },
    sugar: {
      title: 'Refined sugar ICUMSA 45 to a beverage bottler', unit: 't', unitLabel: 'metric tons', priceUnit: 'USD/t', qty: 12500, dp: 2,
      benchmark: { name: 'White sugar futures-type benchmark', B0: 540 },
      inquiry: 'Gulf Bottling Industries (fictional) requests 12,500 t ±5% refined white sugar ICUMSA 45 max, polarisation min 99.8°, moisture max 0.04%, in 50 kg new PP bags with inner liner, CFR Jebel Ali, shipment within May. Food-safety documentation required.',
      specItems: [['ICUMSA colour maximum', true], ['Polarisation minimum', true], ['Moisture maximum', true], ['Packaging (bag type, liner, marking)', true], ['Food-safety/health certificates required by the importer', true], ['Brand of the bottler\'s drinks', false], ['Shipment period and container vs breakbulk', true], ['The CEO\'s favourite origin', false]],
      suppliers: [
        { id: 'S1', name: 'Neo Sugar Mills Ltd', country: 'fictional', years: 3, rating: 'C', reliability: 0.6, diff: -12, canSupply: true, pay: '20% advance', notes: 'Low price; history of bag damage claims; colour sometimes above 45.', risk: 'High' },
        { id: 'S2', name: 'Coastal Refinery Co.', country: 'fictional', years: 11, rating: 'B', reliability: 0.86, diff: 4, canSupply: true, pay: 'CAD', notes: 'Reliable refinery; occasional delays at peak season.', risk: 'Medium' },
        { id: 'S3', name: 'Premier Sugar Refining plc', country: 'fictional', years: 40, rating: 'A', reliability: 0.97, diff: 9, canSupply: true, pay: 'LC at sight', notes: 'Top-quality refinery with food-safety certifications.', risk: 'Low' },
        { id: 'S4', name: 'Highland Beet Factory', country: 'fictional', years: 20, rating: 'A', reliability: 0.95, diff: 2, canSupply: false, pay: 'CAD', notes: 'Campaign finished; no stock until October.', risk: 'Low' },
      ],
      buyers: [
        { id: 'A', label: 'Benchmark + 86, 120-day open account (distributor)', prem: 86, payDays: 120, security: 'none', credit: 'C', pd: 0.07, note: 'Highest premium; weak balance sheet.' },
        { id: 'B', label: 'Benchmark + 76, confirmed LC at sight (bottler)', prem: 76, payDays: 5, security: 'confirmed LC', credit: 'A', pd: 0.003, note: 'Secure; tight documents.' },
        { id: 'C', label: 'Benchmark + 80, CAD (food manufacturer)', prem: 80, payDays: 15, security: 'CAD', credit: 'B', pd: 0.02, note: 'Middle option.' },
      ],
      routes: [
        { id: 'R1', label: 'Containers, direct service', freight: 52, days: 24, delayRisk: 0.12, damageRisk: 0.03, note: 'Cleaner handling; higher freight.' },
        { id: 'R2', label: 'Breakbulk vessel (bagged in holds)', freight: 41, days: 32, delayRisk: 0.35, damageRisk: 0.15, note: 'Cheaper; more handling damage and wetting risk.' },
      ],
      costs: { perUnit: [['Bag & marking surcharge', 3]], pct: [['Cargo insurance (CFR seller\'s interest + transit cover)', 0.12]], lump: [['Inspection (base)', 9000]] },
      inspection: [{ id: 'I1', label: 'Independent surveyor at loading, results final (quality, weight, packing)', cost: 9000, claimRisk: 0.06 }, { id: 'I2', label: 'Surveys at both ends, discharge final', cost: 16000, claimRisk: 0.3 }, { id: 'I3', label: 'Refinery certificate only', cost: 0, claimRisk: 0.45 }],
      finance: [{ id: 'F1', label: 'Transactional facility: 80% at 7.5% p.a.', share: 80, rate: 7.5, equityCost: 10 }, { id: 'F2', label: 'Equity only (opportunity cost 10%)', share: 0, rate: 0, equityCost: 10 }, { id: 'F3', label: 'Unsecured overdraft 100% at 12%', share: 100, rate: 12, equityCost: 10 }],
      market: { movePct: 4, futMovePct: 4.3, hedgeName: 'white sugar futures (50 t)', hedgeEff: 1, news: 'Lower-than-expected cane crush sends white sugar up 4% before B/L; futures rise 4.3%.' },
      docs: { required: ['Commercial invoice', 'Full set clean on board bill of lading', 'Quality certificate (independent surveyor)', 'Weight certificate', 'Packing list', 'Certificate of origin', 'Health / food-safety certificate'], optional: ['Phytosanitary certificate', 'Mill test certificate', 'Assay certificate / bar list', 'Fumigation certificate', 'Insurance certificate'] },
      contractClauses: [
        { k: 'Quality', opts: ['ICUMSA 45 max, pol 99.8 min, moisture 0.04 max; final at loading by named surveyor', 'Good white sugar', 'Quality as per refinery standard'], ok: 0 },
        { k: 'Packing', opts: ['New 50 kg PP bags with inner PE liner, marked per buyer\'s instructions', 'Bags', 'Bulk'], ok: 0 },
        { k: 'Delivery', opts: ['CFR Jebel Ali, Incoterms® 2020, shipment May', 'CFR, shipment when available', 'DDP buyer\'s warehouse'], ok: 0 },
        { k: 'Claims', opts: ['Notice within 21 days of discharge with joint survey; allowances per contract scale', 'No claims accepted', 'Any claim accepted at buyer\'s word'], ok: 0 },
      ],
      mismatch: [['Packing', 'New 50 kg PP + liner', 'Used 50 kg bags allowed', true], ['Shipment', 'May', 'May', false], ['ICUMSA', '45 max', '45 max', false], ['Quantity tolerance', '±5% Seller\'s option', '±10% Supplier\'s option', true], ['Inspection', 'Final at loading', 'Final at loading', false]],
      units: { benchmark: 'USD/t', qtyLabel: '12,500 t' },
    },
    steel: {
      title: 'Rebar for a construction project via a distributor', unit: 't', unitLabel: 'metric tons', priceUnit: 'USD/t', qty: 8000, dp: 2,
      benchmark: { name: 'Rebar export FOB-type assessment', B0: 560 },
      inquiry: 'Levant Build Supply (fictional distributor) requests 8,000 t rebar to a recognised standard with yield grade 500 class B ductility, Ø10–32 mm size split attached, 12 m lengths, bundles ≤ 3 t with heat-number tags, MTCs (EN 10204 3.1 type), CFR destination port, shipment June. The end user is a contractor building a hospital.',
      specItems: [['Standard, grade and ductility class', true], ['Size split and per-size tolerance', true], ['Lengths and bundle weight limits', true], ['Mill test certificates traceable to heat numbers', true], ['Weight basis (actual vs theoretical) and tolerance', true], ['Hospital architect\'s name', false], ['Rust protection / storage conditions', true], ['Number of floors of the hospital', false]],
      suppliers: [
        { id: 'S1', name: 'Eastern Rolling Mill JSC', country: 'fictional', years: 4, rating: 'C', reliability: 0.55, diff: -15, canSupply: true, pay: '30% advance', notes: 'Cheapest; past MTC discrepancies; anti-dumping investigation pending on its origin.', risk: 'High' },
        { id: 'S2', name: 'Anatolian Steel Works', country: 'fictional', years: 15, rating: 'B', reliability: 0.85, diff: 0, canSupply: true, pay: 'LC at sight', notes: 'Established EAF mill; reliable certificates.', risk: 'Medium' },
        { id: 'S3', name: 'Nordic Rebar AB', country: 'fictional', years: 30, rating: 'A', reliability: 0.97, diff: 8, canSupply: true, pay: 'LC at sight', notes: 'Premium mill, third-party certified; slightly higher price.', risk: 'Low' },
        { id: 'S4', name: 'Coastal Wire Products', country: 'fictional', years: 10, rating: 'B', reliability: 0.9, diff: -5, canSupply: false, pay: 'CAD', notes: 'Produces grade 420 only — does not meet spec.', risk: 'Medium' },
      ],
      buyers: [
        { id: 'A', label: 'Benchmark + 80, 60-day open account', prem: 80, payDays: 60, security: 'none', credit: 'C', pd: 0.05, note: 'Highest premium; distributor stretched by project payment delays.' },
        { id: 'B', label: 'Benchmark + 74, confirmed LC at sight', prem: 74, payDays: 5, security: 'confirmed LC', credit: 'B', pd: 0.004, note: 'Secure; strict compliance.' },
        { id: 'C', label: 'Benchmark + 77, unconfirmed LC from a weaker local bank', prem: 77, payDays: 10, security: 'unconfirmed LC', credit: 'B', pd: 0.02, note: 'Issuing-bank and country risk.' },
      ],
      routes: [
        { id: 'R1', label: 'Direct breakbulk, covered holds', freight: 46, days: 20, delayRisk: 0.12, damageRisk: 0.04, note: 'Proper stowage and lashing.' },
        { id: 'R2', label: 'Transshipment via hub port', freight: 39, days: 30, delayRisk: 0.4, damageRisk: 0.18, note: 'Cheaper; double handling and rust risk.' },
      ],
      costs: { perUnit: [['Load port handling & lashing', 4]], pct: [['Cargo insurance', 0.15]], lump: [['Pre-shipment inspection (base)', 11000]] },
      inspection: [{ id: 'I1', label: 'Third-party pre-shipment inspection + MTC verification, final at loading', cost: 11000, claimRisk: 0.05 }, { id: 'I2', label: 'Inspection at both ends, discharge final', cost: 18000, claimRisk: 0.3 }, { id: 'I3', label: 'Mill certificates only', cost: 0, claimRisk: 0.5 }],
      finance: [{ id: 'F1', label: 'LC-backed transactional facility: 85% at 7.3% p.a.', share: 85, rate: 7.3, equityCost: 10 }, { id: 'F2', label: 'Equity only (opportunity cost 10%)', share: 0, rate: 0, equityCost: 10 }, { id: 'F3', label: 'Unsecured overdraft 100% at 12%', share: 100, rate: 12, equityCost: 10 }],
      market: { movePct: -2, futMovePct: -1, hedgeName: 'HRC/rebar futures proxy (different product/region)', hedgeEff: 0.5, news: 'Weak construction data push rebar export prices down 2%; the available proxy futures fall only 1% — a reminder of basis risk in steel.' },
      docs: { required: ['Commercial invoice', 'Full set clean on board bill of lading', 'Mill test certificate', 'Inspection certificate', 'Packing list', 'Certificate of origin'], optional: ['Phytosanitary certificate', 'Assay certificate / bar list', 'Fumigation certificate', 'Quality certificate (independent surveyor)', 'Insurance certificate'] },
      contractClauses: [
        { k: 'Specification', opts: ['Rebar to [named standard], grade 500 class B, Ø10–32 mm per attached size split ±10% per size, 12 m', 'Rebar, good quality', 'Rebar 500'], ok: 0 },
        { k: 'Weight basis', opts: ['Invoiced on actual weight per weighbridge, mass per metre within the standard\'s tolerance', 'Theoretical weight, no tolerance', 'Not stated'], ok: 0 },
        { k: 'Certificates', opts: ['MTC EN 10204 3.1 type per heat, heat numbers on bundle tags', 'Mill certificate if available', 'No certificates'], ok: 0 },
        { k: 'Claims', opts: ['Notice within 30 days of discharge with joint survey; final at loading for chemistry/mechanicals', 'Claims at buyer\'s discretion', 'No claims'], ok: 0 },
      ],
      mismatch: [['Size split tolerance', '±10% per size', '±20% per size', true], ['Certificates', 'EN 10204 3.1 type', 'EN 10204 3.1 type', false], ['Shipment', 'June', 'June–July', true], ['Bundle weight', '≤ 3 t', '≤ 3 t', false], ['Law', 'English law, arbitration', 'English law, arbitration', false]],
      units: { benchmark: 'USD/t', qtyLabel: '8,000 t' },
    },
  };
})();
