/* Lessons — Stage 3: gold, wheat, sugar and steel fundamentals and markets. */
(function () {
  const CTA = window.CTA, SIM = CTA.SIM, ILLU = CTA.ILLU, HIST = CTA.HIST, T = CTA.table, N = CTA.callout;
  const L = CTA.LESSONS;
  const add = (id, t, l, q, o, a, e) => CTA.QUESTIONS.push({ id, t, l, q, o, a, e });

  /* =============================================================== GOLD */
  L.push({ id: 'g-basics', track: 'gold', title: 'Gold — production, purity, units, products and the bullion chain', mins: 40,
    summary: 'Mining and refining, fineness and karats, troy ounces, bars and coins, demand segments, recycling, refiners, dealers, banks, vaults and custody.',
    objectives: ['Convert between grams, kilograms and troy ounces without error', 'Calculate fine gold content', 'Describe the physical gold supply chain'],
    body: `
<h2>From ore to bar</h2>
<p>Gold is mined from hard-rock deposits (open-pit or underground) and alluvial deposits. Ore grades are measured in grams per tonne; many mines process ore with only a few grams of gold per tonne. Processing (crushing, grinding, leaching, smelting) produces <b>doré</b> — an alloy typically containing gold with silver and other metals — which is shipped to a <b>refiner</b>. Refiners produce high-purity bars and grain. Secondary supply comes from <b>recycling</b> of jewellery and, to a smaller extent, electronics; recycling rises when prices are high or when households need cash.</p>
<h2>Purity: fineness and karats</h2>
${T(['Expression', 'Meaning', 'Gold content'], [['999.9 ("four nines")', 'Parts per thousand', '99.99%'], ['995.0', 'Minimum for large LBMA Good Delivery gold bars', '99.50%'], ['24 karat', '24/24', '≈ 99.9%+'], ['22 karat', '22/24', '91.67%'], ['18 karat', '18/24', '75.0%'], ['14 karat', '14/24', '58.33%']])}
<h2>Units — the most common source of costly errors</h2>
<ul><li>1 troy ounce (ozt) = <b>31.1034768 g</b>. 1 kg = <b>32.1507 ozt</b>.</li><li>The ordinary (avoirdupois) ounce is 28.3495 g — about 9.7% lighter. Never use it for precious metals.</li><li>Prices are quoted per <em>fine</em> troy ounce: value = gross weight × fineness × price.</li><li>Regional units exist (e.g. tola in South Asia ≈ 11.66 g; tael in parts of East Asia — definitions vary). Always confirm the definition in the contract.</li></ul>
<div data-widget="goldCalc"></div>
<h2>Products</h2>
${T(['Product', 'Typical buyers', 'Notes'], [['Large Good Delivery bars (~400 oz)', 'Banks, central banks, ETFs, vaults', 'Traded in the London OTC market; specific weight/fineness/refiner rules'], ['Kilobars (1 kg, 995–999.9)', 'Asian markets, jewellery manufacturers, investors', 'Widely traded physical unit; premium vs. benchmark'], ['Small bars and coins', 'Retail investors', 'Higher premiums due to fabrication and distribution'], ['Grain / casting', 'Jewellery fabricators', 'Alloyed to karat by fabricator'], ['Doré', 'Refiners', 'Priced on assay, minus refining charges']])}
<h2>Demand segments</h2>
<p><b>Jewellery</b> (price-sensitive, strong in India, China, the Middle East), <b>technology</b> (electronics, small share), <b>investment</b> (bars, coins, ETFs — sensitive to rates, risk sentiment) and <b>central banks</b> (reserve diversification). Investment and central-bank demand can swing quickly and dominate price moves.</p>
<h2>The physical gold chain</h2>
<p>Mine → doré → refiner (accredited bars) → bullion banks and dealers (market-making, financing, leasing) → vaults/custodians (allocated and unallocated accounts) → fabricators, retailers, investors and central banks. Logistics are handled by specialised secure carriers; insurance and vault agreements define liability.</p>
${N('warn', 'Compliance is central', 'Gold\'s value density makes it attractive for money laundering and illicit flows. Responsible-sourcing frameworks (e.g. the OECD due diligence guidance for minerals from conflict-affected and high-risk areas, and refiners\' responsible-sourcing programmes) and AML/KYC rules apply. Real transactions require compliance review.')}
` });
  add('gb5', 'gold', 'g-basics', 'A 1 kg bar of 995.0 fineness contains how many fine troy ounces?', ['32.15', '31.99', '32.00', '31.10'], 1, '32.1507 × 0.995 = 31.99 fine oz.');

  L.push({ id: 'g-instruments', track: 'gold', title: 'Physical gold, ETFs, futures, options and other gold-linked products', mins: 35,
    summary: 'Ownership, liquidity, custody, financing and counterparty considerations of each way to hold gold exposure.',
    objectives: ['Compare ownership rights across products', 'Identify counterparty risks', 'Choose an instrument for a business need'],
    body: `
${T(['Product', 'What you own', 'Liquidity', 'Custody', 'Financing', 'Counterparty considerations'], [
  ['Allocated physical', 'Title to specific bars (bar list: refiner, number, weight, fineness)', 'Good for standard bars; selling requires dealer bid', 'Vault fees, insurance', 'Can be pledged; lenders apply haircuts', 'Custodian operational risk; title must be documented'],
  ['Unallocated account', 'A claim on the bank/dealer for a quantity of gold', 'High (OTC market)', 'No specific bars', 'Used in leasing/financing', 'Unsecured creditor of the account provider'],
  ['Gold ETF', 'Shares of a fund holding gold', 'Exchange liquidity', 'Fund custodian holds bars', 'Margin loans on securities', 'Fund structure, custodian, authorised participants; most holders cannot redeem bars directly'],
  ['Gold futures', 'Contract to buy/sell at a future date', 'High in front months', 'None unless delivered', 'Inherent leverage via margin', 'Clearing house; margin calls (liquidity risk)'],
  ['Gold options', 'Right to buy/sell (usually into futures)', 'Varies by strike/expiry', 'None', 'Premium paid or margin for sellers', 'Exchange or OTC dealer'],
  ['OTC forwards/swaps', 'Bilateral agreement', 'Depends on dealer', 'None', 'Credit lines/collateral', 'Dealer credit risk, documentation'],
  ['Mining equities', 'Shares in companies', 'Stock liquidity', 'None', 'Margin loans', 'Company-specific risk (costs, politics), leverage to gold'],
])}
<h2>Choosing the right instrument</h2>
<ul><li>A jewellery manufacturer needs metal for production → physical (or metal loans/consignment from a bank), hedged with futures/forwards.</li><li>A refiner holding inventory → hedges with futures/forwards; finances through leases.</li><li>An investor wants exposure without logistics → ETF or futures (understanding roll costs and margin).</li><li>A buyer wants a price cap while keeping downside → buy call options.</li></ul>
${N('', 'Key idea', 'Ownership, custody and counterparty structure matter as much as price. Two positions with the same gold-price exposure can carry very different default and liquidity risks.')}
` });

  L.push({ id: 'g-drivers', track: 'gold', title: 'Gold market analysis — drivers, curve, premiums', mins: 40,
    summary: 'Benchmarks, spot and futures, spreads, USD, real rates, inflation expectations, central banks, geopolitics, positioning, lease rates, basis, contango and regional premiums.',
    objectives: ['Explain the main gold price drivers', 'Read the gold forward curve and lease rates', 'Explain why gold can fall in a crisis'],
    body: `
<h2>Benchmarks and quotes</h2>
<p>The international wholesale market centres on London (OTC spot, settled T+2) with the <b>LBMA Gold Price</b> auction as a reference; futures trade on exchanges such as COMEX (CME Group) and the Shanghai Futures Exchange; the Shanghai Gold Exchange is a major physical venue. Dealers quote bid/ask spreads that widen in volatile or illiquid conditions and for small or non-standard products.</p>
<h2>Main drivers</h2>
${T(['Driver', 'Typical relationship', 'Caveat'], [
  ['US dollar', 'Stronger USD tends to weigh on gold (priced in USD)', 'Both can rise together in stress'],
  ['Real interest rates', 'Higher real yields raise the opportunity cost of holding gold', 'The relationship has weakened at times, e.g. when central-bank buying was strong'],
  ['Inflation expectations', 'Higher expected inflation can support gold as a store of value', 'Over short periods correlation is unstable'],
  ['Central bank policy & purchases', 'Official sector buying adds demand; policy affects rates and USD', 'Purchases are reported with lags'],
  ['Geopolitical risk', 'Safe-haven buying in uncertainty', 'Liquidity squeezes can force selling'],
  ['Investor positioning', 'Crowded long positions can amplify falls', 'Positioning data are partial'],
  ['Physical demand (jewellery)', 'Price-sensitive; supports dips in key markets', 'Seasonal'],
])}
<h2>Why gold can fall during geopolitical or financial stress</h2>
<ol><li><b>Liquidity needs</b>: investors facing margin calls sell what they can — gold is liquid. ${HIST} autumn 2008 and March 2020 saw sharp temporary declines.</li><li><b>USD strength</b>: crises often trigger flight to the USD.</li><li><b>Rising real rates</b>: if a crisis brings policy tightening.</li><li><b>Priced in</b>: if the risk was already anticipated, the event can trigger "sell the news".</li><li><b>Positioning</b>: crowded longs unwind.</li></ol>
<h2>Forward curve, lease rates and basis</h2>
<p>Gold is held in large above-ground stocks, so its forward price normally reflects <b>cost of carry</b>: forward ≈ spot × (1 + (interest rate − lease rate) × t) (plus storage/insurance in some calculations). The <b>lease rate</b> is what borrowers pay to borrow physical gold; when it spikes, physical metal is scarce and forwards can fall below full carry, occasionally into backwardation. The <b>futures basis</b> (futures − spot) therefore embeds rates, lease rates and location/logistics (e.g. differences between London and New York during transport disruptions).</p>
<div class="numbox"><b>Numbers</b> ${SIM}<div>Spot 2,000; USD rate 5%; lease rate 1%; 90 days: fair forward ≈ 2,000 × (1 + 4% × 90/360) = 2,020. If futures trade at 2,032, a cash-and-carry (buy spot, sell futures, finance) earns about 12/oz before costs — if financing, storage and delivery logistics allow.</div></div>
<h2>Regional premiums and discounts</h2>
<p>Local prices = international benchmark (converted to local currency) ± premium. Premiums rise with strong local demand, import restrictions or logistics problems; discounts appear when local demand is weak, duties change, or there is excess local supply. Premiums also differ by product: small bars and coins carry fabrication and distribution costs.</p>
<div data-widget="goldDrivers"></div>
` });

  /* =============================================================== WHEAT */
  L.push({ id: 'w-basics', track: 'wheat', title: 'Wheat — classes, quality, crop cycle, storage and milling', mins: 45,
    summary: 'Varieties, milling vs feed, hard vs soft, protein, moisture, test weight, grades, harvest and planting, yields, costs, storage, elevators, milling, food and feed demand, export terminals.',
    objectives: ['Explain how quality affects price and contract acceptance', 'Calculate moisture shrink and protein adjustments', 'Describe the grain logistics chain'],
    body: `
<h2>Varieties and classes</h2>
<p>Wheat classes combine growing season (winter vs spring), kernel hardness (hard vs soft) and colour (red vs white). <b>Hard</b> wheats generally have higher protein and suit bread; <b>soft</b> wheats suit cakes, biscuits and pastries; <b>durum</b> (very hard) is used for pasta and semolina. Each exporting country has its own grading system and class names — never assume equivalence without checking specifications.</p>
<h2>Milling vs feed wheat</h2>
<p>Milling wheat must meet quality thresholds (protein, gluten strength, falling number, test weight, low damage and foreign material). Wheat that fails — e.g. rain-damaged at harvest — goes to the <b>feed</b> market, where it competes with corn and barley on energy value. The price gap between milling and feed wheat can be large in years with poor harvest weather.</p>
<h2>Key quality parameters</h2>
${T(['Parameter', 'What it measures', 'Commercial effect'], [
  ['Protein (% on a stated moisture basis)', 'Baking strength', 'Premiums/discounts per 0.1–0.5% vs. base; minimum levels for acceptance'],
  ['Moisture (%)', 'Water content', 'Maximums (often around 13–14.5%); excess = paying for water + spoilage risk'],
  ['Test weight (kg/hl or lb/bu)', 'Bulk density/kernel soundness', 'Flour extraction; minimums by grade'],
  ['Falling number (s)', 'Sprout damage', 'Low values → rejection for bread flour'],
  ['Foreign material, broken kernels, damaged kernels', 'Cleanliness', 'Grade limits; discounts'],
  ['Mycotoxins (e.g. DON)', 'Fungal toxins', 'Food-safety limits set by importing countries'],
])}
<div data-widget="wheatQuality"></div>
<h2>Crop cycle, yields and costs</h2>
<p>Winter wheat is sown in autumn, overwinters, and is harvested in early-to-mid summer; spring wheat is sown in spring. Yield per hectare depends on rainfall, temperature, soils and inputs; it varies greatly by country. Production cost per tonne = cost per hectare ÷ yield: a bad yield year raises unit costs sharply. ${SIM} Example: costs 650/ha at 6.5 t/ha = 100/t; at 4.5 t/ha = 144/t.</p>
<h2>Storage, elevators and spoilage</h2>
<p>Farmers deliver to <b>country elevators</b> (inland), where grain is sampled, graded, dried if needed and stored in <b>silos</b> segregated by quality. Grain moves by truck, rail or barge to <b>port terminals</b> (export elevators) that load ships. Risks: moisture and heat causing mould, insects, mixing of qualities, shrink, and documentation errors on warehouse receipts. Aeration, fumigation and stock rotation manage quality.</p>
<h2>Milling and demand</h2>
<p>Flour mills grind wheat into flour (extraction often around 72–78% depending on flour type) and by-products (bran, middlings) for feed. Mills blend wheats to hit flour specifications. Demand segments: <b>food</b> (bread, noodles, pasta, biscuits — relatively stable, population-driven), <b>feed</b> (price-sensitive, substitutable) and <b>industrial</b> (starch, ethanol). Many importing countries have state buyers that purchase via public tenders.</p>
` });

  L.push({ id: 'w-markets', track: 'wheat', title: 'Global wheat markets and supply-and-demand balances', mins: 45,
    summary: 'Producers, exporters, importers, reports, weather, crop conditions, inventories, export availability, government stocks, food security, export bans, freight, currencies, origin substitution and corn relationships.',
    objectives: ['Build a supply-and-demand balance', 'Interpret stocks-to-use', 'Analyse export restrictions and origin substitution'],
    body: `
<h2>The global map</h2>
<p>Major producers include China, the EU, India, Russia, the USA, Canada, Australia, Ukraine, Argentina and Kazakhstan. China and India consume most of what they produce; the export market is dominated by the EU, Russia, Canada, Australia, the USA, Ukraine, Argentina and Kazakhstan. Large importers include North Africa and the Middle East (e.g. Egypt, Algeria), Southeast Asia (e.g. Indonesia, the Philippines), and sub-Saharan Africa. ${N('warn', 'Check current data', 'Rankings change by season. Use USDA PSD/WASDE, IGC, FAO and AMIS data for current figures.')}</p>
<h2>The supply-and-demand balance</h2>
<p>For a country or the world over a marketing year: <b>Ending stocks = Beginning stocks + Production + Imports − Consumption (food, feed, seed, industrial, waste) − Exports</b>. The <b>stocks-to-use ratio</b> = ending stocks ÷ total use. At world level imports ≈ exports, so the balance reduces to stocks + production − consumption.</p>
<div data-widget="sdBalance"></div>
<h2>Interpreting the balance</h2>
<ul><li><b>Exportable surplus</b> matters more than total stocks. Stocks held by countries that rarely export (or in government reserves) do not supply the world market.</li><li><b>Revisions</b>: each monthly report revises estimates; markets react to the surprise versus expectations.</li><li><b>Crop conditions and weather forecasts</b> update yield expectations before harvest; satellite and field data help but uncertainty is high until harvest.</li><li><b>Food security policies</b>: governments build stocks, subsidise bread, or restrict exports when domestic prices rise.</li></ul>
<h2>Public reporting sources</h2>
<ul><li><b>USDA WASDE</b> (monthly) and the <b>PSD Online</b> database: country balance sheets.</li><li><b>International Grains Council (IGC)</b> Grain Market Report.</li><li><b>AMIS Market Monitor</b> (G20 initiative) and <b>FAO</b> food outlook.</li><li>National statistics and customs export data.</li></ul>
<p>No report perfectly predicts prices: they are estimates, anticipated by the market, and prices also respond to freight, currencies, policy and positioning.</p>
<h2>Export restrictions, freight and currencies</h2>
<p>Export bans and taxes reduce world availability and shift demand to other origins. Freight differences decide competitiveness between origins (e.g. Black Sea vs. Australia into Southeast Asia). Currency moves change exporters\' local-currency revenue and importers\' purchasing power.</p>
<h2>Origin substitution and feed grains</h2>
<p>Importers substitute between origins that meet their specifications; tenders often accept several origins with quality conditions. In feed, wheat competes with corn and barley: when wheat\'s premium over corn rises, feed wheat demand falls.</p>
` });

  /* =============================================================== SUGAR */
  L.push({ id: 's-basics', track: 'sugar', title: 'Sugar — cane and beet, raw and refined, quality and processing', mins: 40,
    summary: 'Cane vs beet, raw vs refined, production and refining processes, grades, polarisation, moisture and impurities, seasonality, mills and refineries, storage, bulk vs bagged, demand, by-products and ethanol.',
    objectives: ['Describe sugar production routes', 'Explain raw vs refined specifications', 'Understand the ethanol link'],
    body: `
<h2>Two crops, one product</h2>
<p><b>Sugarcane</b> (tropical/subtropical) supplies most of the world\'s sugar. Cane is cut and must be crushed quickly (within hours to a day or so) to avoid sucrose loss. A planting yields several annual harvests (ratoons) before replanting. <b>Sugar beet</b> (temperate) is harvested in autumn and processed in campaigns lasting a few months; beet factories usually produce white sugar directly.</p>
<h2>Processing</h2>
<ol><li>Extraction: cane is shredded and crushed (or diffused) to extract juice; beet is sliced and soaked in hot water (diffusion).</li><li>Clarification, evaporation and crystallisation produce raw sugar crystals and molasses.</li><li>Raw sugar is either sold to refineries (destination refining) or refined in the mill (plantation whites).</li><li>Refining: affination, melting, clarification, decolourisation, recrystallisation, drying → refined white sugar.</li></ol>
<h2>Grades and quality</h2>
${T(['Product', 'Key specs', 'Typical trade form'], [
  ['Raw cane sugar (e.g. VHP — "very high polarisation")', 'Polarisation (°Z) around 96–99.x, moisture, colour; premiums/discounts vs. contract base', 'Bulk carriers to refineries'],
  ['Refined white sugar (e.g. ICUMSA 45)', 'Polarisation ≥ ~99.8°, colour (ICUMSA units), moisture, ash, grain size', '50 kg bags, big bags, containers, bulk'],
  ['Plantation/mill whites', 'Higher colour than refinery whites', 'Bagged, regional trade'],
])}
<p>Moisture affects storage (caking, microbial risk) and weight; impurities and colour affect refining cost and food suitability. Contracts specify analysis methods and who performs them (loading vs. discharge).</p>
<h2>By-products and the ethanol link</h2>
<p>Molasses (feed, fermentation, ethanol), bagasse (burned for steam and electricity, cogeneration) and filter cake (fertiliser). In some countries — notably Brazil — mills can shift cane between sugar and ethanol within limits. When ethanol pays more than sugar (after adjusting for yields and costs), sugar output falls. Ethanol\'s value is linked to gasoline prices, fuel-blending mandates and taxes.</p>
<h2>Storage, bulk vs bagged</h2>
<p>Raw sugar is stored in large bulk warehouses at mills and ports; it is hygroscopic and must be kept dry. Refined sugar is mostly bagged, with stricter hygiene and food-safety requirements (and higher handling cost per tonne).</p>
<h2>Demand</h2>
<p>Households, food and beverage manufacturers, confectionery, dairy and bakery industries, and some industrial uses. Consumption is relatively stable but influenced by income, health policies (sugar taxes) and substitutes (HFCS, other sweeteners).</p>
<div data-widget="sugarConvert"></div>
` });

  L.push({ id: 's-markets', track: 'sugar', title: 'Global sugar markets — weather, energy, policy and currencies', mins: 40,
    summary: 'Major producers, exporters and importers, crop cycles, drought and rainfall, energy and ethanol economics, subsidies, export restrictions, import quotas and tariffs, currencies, freight, stocks and refining economics.',
    objectives: ['Explain sugar\'s links to energy, weather and currencies', 'Understand policy distortions', 'Interpret the white premium'],
    body: `
<h2>The map</h2>
<p>Brazil is the largest producer and exporter (mainly raw sugar, Centre-South region). India is a very large producer and consumer whose exports depend on policy and the crop. Thailand is a major Asian exporter; Australia, Guatemala and others export raws; the EU produces beet sugar. Large importers include Indonesia, China, the USA (managed by tariff-rate quotas), and refiners in the Middle East and elsewhere that import raws to refine.</p>
<h2>What moves sugar prices</h2>
${T(['Factor', 'Mechanism'], [
  ['Weather', 'Drought cuts cane yields and sugar content; excess rain stops harvest/crushing; monsoon performance matters for India and Thailand'],
  ['Energy & ethanol', 'High gasoline/ethanol prices pull cane to ethanol in flexible mills, reducing sugar supply; energy also affects freight and input costs'],
  ['Currencies', 'A weaker BRL raises local-currency returns of Brazilian exporters, encouraging sales; importers\' currencies affect demand'],
  ['Policy', 'Subsidies, minimum cane prices, export quotas/restrictions (e.g. India), import tariffs and quotas, ethanol blending mandates'],
  ['Stocks', 'Global and importer stocks determine sensitivity to shocks'],
  ['Freight', 'Affects competitiveness of origins and delivered refinery costs'],
  ['Refining economics', 'The white premium (white − raw in USD/t) must cover refining costs; destination refiners\' demand for raws depends on it'],
])}
<h2>Price units</h2>
<p>Raw sugar futures are commonly quoted in <b>US cents per pound</b>; white sugar in <b>USD per metric ton</b>. To compare: USD/t = c/lb × 22.0462. The white premium = white price (USD/t) − raw price × 22.0462.</p>
<div class="numbox"><b>Numbers</b> ${SIM}<div>Raw 19.5 c/lb = 429.9 USD/t; white 545 USD/t → white premium 115.1 USD/t. If refining costs ~70–90/t (illustrative, varies widely by refinery and energy cost), the margin is positive; if the premium shrinks to 60/t, destination refiners cut raw purchases.</div></div>
<h2>Policy distortions</h2>
<p>Sugar is one of the most policy-affected commodities. Domestic prices in protected markets can differ greatly from world prices; quotas and tariffs determine who can import. Traders must check eligibility, quota allocation and certificates of origin carefully.</p>
` });

  /* =============================================================== STEEL */
  L.push({ id: 'st-basics', track: 'steel', title: 'Steel — raw materials, processes and products', mins: 45,
    summary: 'Iron ore, coking coal, scrap, pig iron, DRI, blast furnaces, EAFs, semi-finished and finished products, and why they are not interchangeable.',
    objectives: ['Describe the two main steelmaking routes', 'Distinguish semi-finished, long and flat products', 'Explain non-interchangeability'],
    body: `
<h2>Raw materials</h2>
<ul><li><b>Iron ore</b> (fines, lump, pellets), priced by iron content and impurities.</li><li><b>Coking (metallurgical) coal</b> → coke, which reduces ore and supports the furnace burden.</li><li><b>Scrap</b>: recycled steel, graded by type/density/contaminants; main feed for EAFs.</li><li><b>Pig iron</b> and <b>DRI/HBI</b>: virgin iron units used to dilute residual elements in scrap-based steel.</li><li>Energy (electricity, natural gas) and alloys (ferro-manganese, ferro-silicon) are significant cost items.</li></ul>
<h2>Two main routes</h2>
${T(['Route', 'Inputs', 'Characteristics'], [
  ['Blast furnace – basic oxygen furnace (BF-BOF)', 'Iron ore, coke, limestone; some scrap in BOF', 'Large integrated plants, high capital, continuous operation, higher CO₂ intensity'],
  ['Electric arc furnace (EAF)', 'Scrap, DRI/HBI, pig iron, electricity', 'Smaller and flexible, sensitive to scrap and power prices, lower CO₂ when using scrap'],
])}
<h2>Semi-finished products</h2>
<p>Liquid steel is cast (mostly continuous casting) into <b>billets</b> (small square sections → long products), <b>blooms</b> (larger sections → beams, rails) and <b>slabs</b> (wide flat sections → plate and coil). Semis are traded internationally between mills and re-rollers.</p>
<h2>Finished products</h2>
${T(['Product', 'Made from', 'Used for', 'Key commercial specs'], [
  ['Rebar', 'Billets', 'Reinforced concrete', 'Diameter, grade/yield strength, ductility, bend tests, standard, length, bundle weight'],
  ['Wire rod', 'Billets', 'Wire, mesh, nails, fasteners', 'Diameter, grade (low/high carbon), coil weight'],
  ['Structural sections (beams, channels, angles)', 'Blooms/beam blanks', 'Buildings, bridges, industry', 'Profile dimensions, grade, length'],
  ['Hot-rolled coil (HRC)', 'Slabs', 'Pipes, structures, re-rolling to CRC, automotive parts', 'Thickness, width, grade, edges (mill/trimmed), coil weight, tolerances'],
  ['Cold-rolled coil (CRC)', 'HRC (pickled & cold-reduced)', 'Appliances, automotive, furniture', 'Gauge, surface finish, annealing, flatness, tight tolerances'],
  ['Galvanised (HDG) / coated', 'CRC or HRC', 'Construction cladding, automotive, appliances', 'Coating mass (g/m²), spangle, passivation, base grade'],
  ['Plate', 'Slabs', 'Shipbuilding, heavy machinery, pressure vessels', 'Thickness, width, length, grade, testing (e.g. impact tests)'],
  ['Pipes and tubes', 'HRC/plate (welded) or billets (seamless)', 'Oil & gas, water, structural', 'OD, wall thickness, grade, testing, end finish'],
])}
<h2>Why steel products are not interchangeable</h2>
<p>A buyer specifying 2 mm galvanised coil with Z275 coating for roofing cannot use 6 mm HRC — the product, the process route and the end-use requirements differ. Even within one product, grades and standards (e.g. different national rebar standards) are not automatically equivalent; structural codes require specific standards and certification. Prices therefore differ by product, region and specification, and there is no single "steel price".</p>
` });

  L.push({ id: 'st-specs', track: 'steel', title: 'Steel specifications, certificates and quality claims', mins: 40,
    summary: 'Grades, chemistry, mechanical properties, dimensions and tolerances, surface, coatings, standards, mill test certificates, inspection and claims; converting technical requirements into a purchase specification.',
    objectives: ['Read a mill test certificate', 'Write a complete purchase specification', 'Calculate theoretical weights'],
    body: `
<h2>Specification elements</h2>
${T(['Element', 'Examples', 'Why it matters'], [
  ['Standard and edition', 'A named national/international standard and year', 'Defines grade requirements and tests'],
  ['Grade', 'Yield-strength grades for rebar or structural steel', 'Structural suitability'],
  ['Chemical composition', 'C, Mn, Si, P, S, Cu, Ni, Cr, carbon equivalent', 'Weldability, strength, residuals'],
  ['Mechanical properties', 'Yield (ReH/Rp0.2), tensile (Rm), elongation, bend/rebend, impact (Charpy)', 'Performance under load'],
  ['Dimensions', 'Diameter, thickness, width, length, profile', 'Fit for design'],
  ['Tolerances', 'Thickness ±, width +/−, length, flatness, camber, mass per metre', 'Acceptance and fabrication'],
  ['Weight basis', 'Actual weight vs theoretical weight; weight tolerance', 'Invoicing basis'],
  ['Surface/edges', 'Mill edge vs trimmed, oiled/dry, pickled, surface quality class', 'Downstream processing'],
  ['Coating', 'Zinc coating mass, passivation', 'Corrosion resistance'],
  ['Packaging & marking', 'Bundle weights, tags with heat numbers, coil ID/OD, max coil weight', 'Handling, traceability'],
  ['Certification', 'Mill test certificate type (e.g. EN 10204 3.1), third-party inspection', 'Proof of conformity'],
])}
<h2>Mill test certificates (MTC)</h2>
<p>An MTC states the mill, product, standard, grade, heat number(s), dimensions, chemical analysis and mechanical test results. The buyer (or its inspector) checks that every value meets the specification and that heat numbers on the certificate match those on bundle/coil tags. Forged or mismatched certificates are a known risk in the trade.</p>
<h2>Inspection and quality claims</h2>
<p>Pre-shipment inspection (dimensions, surface, marking, sampling for tests) reduces disputes. Claims should be notified within contract time limits with photos, survey reports and lab results. Typical claims: dimensions out of tolerance, rust/wet damage, coating defects, mechanical properties below spec, weight shortages.</p>
<h2>From technical requirement to purchase specification</h2>
<div data-widget="specBuilder"></div>
<div data-widget="steelWeight"></div>
` });

  L.push({ id: 'st-markets', track: 'steel', title: 'Steel market analysis — costs, demand, capacity and trade policy', mins: 40,
    summary: 'Iron ore, coal, scrap and energy costs, utilisation, construction and manufacturing demand, infrastructure, property, trade remedies, tariffs, freight, regional prices, inventory cycles and capacity.',
    objectives: ['Analyse mill margins', 'Explain why cost pass-through is partial and lagged', 'Evaluate trade-policy effects on landed costs'],
    body: `
<h2>Mill economics</h2>
<p>A simplified BF-BOF raw-material cost per tonne of hot metal combines about 1.5–1.7 t of iron ore and 0.4–0.6 t of coke-equivalent coal (ratios vary by plant — ${ILLU}). An EAF\'s main costs are scrap (around 1.1 t per tonne of liquid steel) and electricity. The <b>spread</b> between finished steel prices and raw-material costs indicates margin pressure.</p>
<div data-widget="millMargin"></div>
<h2>Why pass-through is not immediate or proportional</h2>
<ul><li>Mills buy raw materials on contracts and hold inventories; cost changes arrive with lags.</li><li>Steel prices are set by demand and competition. When demand is weak or capacity is high, mills absorb cost increases (margins shrink); when demand is strong, prices can rise faster than costs.</li><li>Different routes (BF vs. EAF) face different input moves.</li><li>Exports from regions with surplus capacity cap import prices elsewhere.</li></ul>
<h2>Demand drivers</h2>
<p>Construction (property, infrastructure) is the largest end use globally, followed by machinery, automotive, metal products, and energy. Property cycles and infrastructure programmes are key for long products (rebar); manufacturing cycles for flats (HRC, CRC, coated). Capacity utilisation rates indicate pricing power.</p>
<h2>Trade policy</h2>
<p>Steel is heavily affected by trade remedies: anti-dumping and countervailing duties (origin- and sometimes producer-specific), safeguard quotas and tariffs, and carbon-border measures. A trader must determine the HS classification, origin rules and applicable duties before quoting a landed price.</p>
<h2>Regional price differences and inventory cycles</h2>
<p>Steel prices differ by region because of freight, duties, standards and local supply-demand. Distributors\' restocking and destocking amplify demand swings: when prices are expected to rise, distributors buy ahead, and vice versa.</p>
<h2>Hedging steel</h2>
<p>Exchange-traded or cleared contracts exist for certain steel benchmarks (e.g. some HRC, rebar and scrap contracts on exchanges in the USA, Europe/London and China), and OTC swaps reference price assessments. But a specific product, grade, region and delivery timing may not match any benchmark well, and liquidity can be limited. Steel hedging opportunities therefore vary by product, region, benchmark and market liquidity; residual basis risk is usually significant.</p>
` });
})();
