/* Lessons — Stage 1 (Level 0: business & financial foundations) and Stage 2 (Level 1: global markets).
 * All company names, prices and figures are simulated/illustrative unless tagged HISTORICAL. */
(function () {
  const CTA = window.CTA, K = CTA.K, SIM = CTA.SIM, HIST = CTA.HIST;
  const L = (CTA.LESSONS = CTA.LESSONS || []);

  /* ------------------------------------------------------------------ F1 */
  L.push({ id: 'f-commodity', track: 'foundations', title: 'What a commodity is — physical goods and financial exposure', mins: 25,
    summary: 'Commodities versus manufactured goods, standardisation and fungibility, and the difference between owning the goods and owning price exposure.',
    objectives: ['Define a commodity and explain fungibility', 'Distinguish raw materials from manufactured goods', 'Separate physical trading from financial exposure'],
    body: `
<p>Commodity trading is the business of moving standardised raw materials from where they are produced to where they are needed, at the right time, in the right quality, and managing the price, credit and operational risks along the way. Before learning any market, you must be precise about what is — and is not — a commodity.</p>
${K({ t: 'Commodity', simple: 'A commodity is a basic product where one unit is basically the same as another unit of the same grade. A tonne of wheat of a stated class and protein is treated like any other tonne of that description, so buyers care mostly about price, quality specs, timing and location — not who made it.',
  pro: 'A commodity is a good traded on <em>specifications</em> rather than brand. Fungibility within a grade allows standard contracts, benchmark prices and exchange-traded derivatives. Price differences then arise from quality differentials, location (freight), timing (carry, seasonality) and counterparty terms. Fungibility is a spectrum: gold of a given fineness is almost perfectly fungible; steel is much less so because of grades, dimensions and standards.',
  why: 'If a product is fungible, you can buy it from one party and sell it to another, hedge it with a standard contract and finance it against a recognised value. Those three capabilities define the trading business.',
  ex: 'A flour mill in Egypt can buy 60,000 t of milling wheat with 12.5% protein from several origins and run its mill with any of them, adjusting the blend. It cannot do that with a branded machine part.',
  num: 'A trader holds 1 kg gold bars of 999.9 fineness from two different accredited refiners. Both contain 32.1475 fine troy ounces and are valued at the same benchmark price ± a small premium for bar size.',
  mistake: 'Assuming every raw material is perfectly interchangeable. Wheat protein, sugar polarisation and steel grade create real price and acceptance differences.', q: 'fc1' })}
${K({ t: 'Raw materials vs manufactured goods', simple: 'Raw materials (ores, grains, cane, crude oil) come straight from nature or with light processing. Manufactured goods are made from them with significant transformation and often a brand. Many "commodities" are in between: refined gold, white sugar, flour, steel coils.',
  pro: 'Trading desks think in terms of <em>stages of transformation</em>: primary (ore, grain), intermediate (doré, raw sugar, billets, slabs) and semi-finished/finished standardised products (Good Delivery bars, refined sugar, rebar, HRC). The further along the chain, the narrower the buyer pool and the more specification risk, but often the higher the margin per tonne.',
  why: 'The stage determines who your buyers are, which benchmarks apply, which documents are needed and whether hedging instruments exist.',
  ex: 'Raw sugar sells to refineries; refined sugar sells to beverage makers. A trader who buys raw sugar cannot deliver it to a soft-drink bottler.',
  mistake: 'Calling any industrial input a "commodity" and assuming it can be hedged on an exchange.', q: 'k-raw' })}
${K({ t: 'Physical commodities vs financial commodity exposure', simple: 'Physical trading means owning or handling the actual goods: ships, warehouses, inspections, documents. Financial exposure means making or losing money when the price moves, through futures, options, swaps or funds — with no warehouse or ship involved.',
  pro: 'Physical positions carry price risk plus logistics, quality, documentary, credit, and operational risks; profits come from the margin between purchase and sale after costs. Financial positions isolate price (or spread) risk and are margined or collateralised. Physical traders use financial instruments to hedge price risk, leaving them with basis, execution and credit risk — which is where their real expertise lies.',
  why: 'These are related but distinct disciplines. A great futures trader may have no idea how to manage demurrage or a letter of credit; a great physical operator may still lose money by leaving price risk unhedged.',
  ex: 'A trading company buys 30,000 t of wheat FOB Black Sea (physical) and sells wheat futures to protect the value until it finds a buyer (financial hedge).',
  num: 'Physical: buy 30,000 t at 230/t = 6,900,000 tied up in goods. Financial: hedging the same tonnage with futures requires only margin (e.g. 5–10% of notional), but daily mark-to-market cash flows.',
  mistake: 'Believing an ETF share or a futures contract gives the same rights and obligations as owning bars or a cargo.', q: 'fc2' })}
${K({ t: 'Standardisation and fungibility in practice', simple: 'Standard specs let strangers trade with confidence. Contracts state the grade, and tests at loading or discharge prove it.',
  pro: 'Standardisation is achieved by: published grade standards (national grain standards, refinery bar standards, steel standards), independent inspection, trade-association contract forms, and exchange delivery specifications. Non-standard features are priced as premiums/discounts against a benchmark.',
  why: 'Your price is usually "benchmark ± differential". If you misjudge the specification, the differential — not the benchmark — will hurt you.',
  ex: 'Steel HRC offered "S235JR, 2.0–12.0 mm, widths 1,250–1,500 mm" is priced differently from "S355J2, 3 mm only, 1,500 mm width, tight flatness tolerance".',
  mistake: 'Comparing offers by headline price without normalising for specification, origin and delivery terms.', q: 'fc3' })}
${CTA.callout('', 'Key takeaway', 'Think of every commodity price as: <b>benchmark (what) + quality differential (which grade) + location differential (where) + time (when) + terms (how payment, risk and documents are allocated)</b>. The rest of this academy teaches each component.')}
` });

  /* ------------------------------------------------------------------ F2 */
  L.push({ id: 'f-participants', track: 'foundations', title: 'Market participants and trading-company business models', mins: 30,
    summary: 'Producers, processors, traders, brokers, importers/exporters, wholesalers and end users — what each does, what risks they carry and how merchant traders make money.',
    objectives: ['Map each participant in the chain', 'Explain the four transformations traders perform', 'Understand margin sources and risks of a trading company'],
    body: `
${K({ t: 'Producers — miners, farmers and mills', simple: 'Producers create supply: gold miners, wheat farmers, sugarcane growers and mills, iron ore miners and steel mills. They are naturally "long" the commodity — they lose money when prices fall.',
  pro: 'Producers face output-price risk, cost inflation, currency risk (costs in local currency, revenue often in USD) and operational risk. Large producers sell directly or via offtake agreements; smaller ones depend on collectors, cooperatives and traders who provide market access and pre-export finance.',
  why: 'Producer hedging (selling forward or selling futures) is a major source of supply in derivatives markets and of physical offers to traders.',
  ex: 'A farmer cooperative sells part of its expected wheat crop forward before harvest to lock in a margin over production cost.',
  mistake: 'Assuming producers always benefit from high prices; costs and currency can move at the same time.', q: 'k-prod' })}
${K({ t: 'Refiners, processors and mills', simple: 'Processors turn raw material into a more usable product: gold refiners make bars, sugar refineries turn raw sugar into white sugar, flour mills turn wheat into flour, rolling mills turn slabs into coils.',
  pro: 'Processors earn a <em>processing spread</em> — output price minus input cost minus conversion cost. Their key risks are margin squeeze (inputs rise faster than outputs), quality variability of inputs and capacity utilisation. They specify inputs tightly and often hedge both legs.',
  why: 'Processors are the most demanding buyers on quality and timing; understanding their economics helps you sell to them.',
  ex: 'A refinery buys raw sugar at a premium only if the white premium covers refining costs and still leaves a margin.',
  mistake: 'Offering a processor the cheapest input without checking whether it fits their process (e.g. low falling number wheat to a bread-flour mill).', q: 'fp2' })}
${K({ t: 'Commodity trading companies (merchants)', simple: 'Traders buy from producers and sell to users, adding value by moving goods across space and time, combining lots, arranging finance, shipping and managing risk.',
  pro: 'Merchants perform four transformations: <b>space</b> (logistics/arbitrage between regions), <b>time</b> (storage and carry), <b>form/quality</b> (blending, processing, grading) and <b>credit/finance</b> (bridging payment terms). Margins per unit are thin, so profitability depends on volume, asset utilisation (ports, silos, ships), information advantage, risk management and access to cheap financing. Price risk is usually hedged; profits come from basis, logistics optimisation and optionality.',
  why: 'Trading is a high-volume, low-margin, capital-intensive business. A small error in costs, credit or execution can wipe out the margin on a whole cargo.',
  ex: 'A trader buys 50,000 t of Brazilian raw sugar FOB, charters a vessel, finances the cargo with a bank line secured by documents, hedges with futures and sells CFR to a refinery in Asia.',
  num: 'Gross margin might be 10–15/t on a 500/t product (2–3%). On 50,000 t that is 500,000–750,000 — but a 10-day delay at 20,000/day demurrage costs 200,000.',
  mistake: 'Treating "buy low, sell high" as the business model. The real business is managing costs and risks between buying and selling.', q: 'fp1' })}
${K({ t: 'Brokers and intermediaries', simple: 'Brokers connect buyers and sellers and earn commission. They do not normally take ownership or price risk.',
  pro: 'Physical brokers (ship brokers, cargo brokers) and futures brokers (clearing members, introducing brokers) provide market access, information and execution. In some markets, chains of unauthorised "intermediaries" claiming exclusive mandates are a fraud warning sign.',
  why: 'Knowing who is principal and who is agent tells you who bears performance obligations and who to sue if things go wrong.',
  ex: 'A ship broker finds a Supramax for a grain cargo; the charter party is between the shipowner and the trader, not the broker.',
  mistake: 'Paying fees to unverified "mandates" who claim access to large volumes of gold or sugar.', q: 'fp3' })}
${K({ t: 'Importers, exporters, wholesalers, distributors and end users', simple: 'Exporters sell goods out of a country; importers bring them in. Wholesalers and distributors break bulk into smaller lots for local customers. End users (industrial buyers) consume the commodity: mills, bakeries, beverage makers, construction companies, jewellers.',
  pro: 'Each role carries different regulatory obligations (export licences, import permits, customs), credit profiles and lot sizes. Distributors take local inventory and credit risk; industrial buyers need security of supply and consistent quality more than the lowest price, which shapes what terms they value.',
  why: 'Your counterparty\'s role predicts their needs: a distributor values flexible small deliveries and credit; a construction company values certified material on time for the project schedule.',
  ex: 'A steel distributor imports 3,000 t of rebar in bundles, stores it, and sells 20–100 t lots to contractors on 30-day terms.',
  mistake: 'Ignoring the import licensing or local-content rules that apply to the importer of record.', q: 'k-imp' })}
${CTA.table(['Participant', 'Natural position', 'Main risks', 'Typical hedge/tool'], [
  ['Producer (miner, farmer)', 'Long commodity', 'Price, cost, currency, weather/operations', 'Sell forwards/futures, buy puts'],
  ['Processor (refinery, mill)', 'Short input, long output', 'Margin squeeze, input quality', 'Hedge both legs, supply contracts'],
  ['Merchant trader', 'Flat price-hedged; long/short basis', 'Basis, logistics, credit, operational, funding', 'Futures/swaps, insurance, LCs, limits'],
  ['Distributor', 'Long inventory', 'Price, credit to many small buyers', 'Inventory turnover, credit control'],
  ['End user', 'Short commodity', 'Price spikes, supply interruptions', 'Long hedges, calls, term contracts'],
])}
` });

  /* ------------------------------------------------------------------ F3 */
  L.push({ id: 'f-instruments', track: 'foundations', title: 'Markets and instruments — spot, forwards, futures, options, swaps', mins: 35,
    summary: 'Exchanges vs OTC markets, spot and forward trading, futures, options and swaps, physical delivery and cash settlement.',
    objectives: ['Explain where commodities trade', 'Compare the main instruments', 'Know when delivery happens and when only cash moves'],
    body: `
${K({ t: 'Commodity exchanges', simple: 'An exchange is an organised market where standard contracts trade openly, prices are published and a clearing house guarantees that trades will be honoured.',
  pro: 'Exchanges list contracts with fixed specifications (quantity, quality, delivery location/months, tick, limits). Clearing houses novate trades and manage risk through initial and variation margin. Exchange settlement prices often serve as benchmarks for physical deals ("futures + basis").',
  why: 'Exchanges provide transparent prices, liquidity and a credit-safe hedging venue.',
  ex: 'A grain trader prices a physical sale as "March futures + 45 c/bu basis" and hedges with the March contract.',
  mistake: 'Assuming every commodity and every product grade has a liquid exchange contract.', q: 'k-exch' })}
${K({ t: 'OTC markets', simple: 'Over-the-counter trades are private agreements between two parties — often banks, traders and producers — rather than on an exchange.',
  pro: 'OTC includes physical forwards and financial swaps/options. Terms are flexible (any quantity, date, averaging period, location), but each party takes the other\'s credit risk unless trades are collateralised under agreements such as ISDA/CSA or cleared. Pricing is less transparent.',
  why: 'Most physical commodity trading is OTC; most hedging tailoring happens OTC.',
  ex: 'A steel buyer enters an OTC swap to fix the monthly average HRC price on 2,000 t per month for six months.',
  mistake: 'Forgetting that an OTC hedge is only as good as the counterparty\'s ability to pay.', q: 'k-otc' })}
${K({ t: 'Spot markets', simple: 'Spot means trading for prompt delivery at today\'s price.',
  pro: '"Spot" in physical markets usually means the nearest available delivery window (e.g. loading within 2–4 weeks), not instant. In gold, "spot" refers to settlement two business days after trade (T+2) in the international OTC market.',
  why: 'Spot prices reflect current availability; the gap between spot and forward prices tells you about tightness and carry.',
  ex: 'A refinery short of raw material pays a premium for a "spot" cargo loading in 10 days.',
  mistake: 'Taking spot to mean "delivered today" — check the delivery window.', q: 'k-spot' })}
${K({ t: 'Forward contracts', simple: 'A forward is an agreement now to buy or sell later at a price fixed now.',
  pro: 'Physical forwards are the backbone of commodity trade (e.g. "shipment in March, price fixed today"). They carry counterparty performance risk and are not marked to market daily unless agreed. Pricing can be fixed, floating (benchmark average) or "unpriced" with pricing later against futures.',
  why: 'Forwards let producers and users plan, but you must manage the counterparty and the price exposure between signing and delivery.',
  ex: 'A mill buys 25,000 t of wheat for October shipment at a fixed price in June.',
  mistake: 'Assuming a forward has no risk until delivery. If prices fall, your buyer may be tempted to default.', q: 'fi1' })}
${K({ t: 'Futures contracts', simple: 'Futures are standard forwards traded on an exchange. You put up margin, and gains and losses are settled every day.',
  pro: 'Key specs: contract size (multiplier), quoted unit, tick size and value, contract months, last trading day, delivery or cash-settlement mechanism, and margin. Daily mark-to-market means a profitable hedge can still require cash today. Most positions are closed or rolled before delivery.',
  why: 'Futures are the main hedging and price-discovery tool for gold, grains and sugar; for steel only certain benchmarks exist.',
  ex: 'A trader sells 10 gold futures (100 oz each) to hedge 1,000 oz of bullion inventory.',
  num: 'Gold falls 25/oz → futures gain 25 × 100 × 10 = 25,000; inventory value falls by 25 × 1,000 = 25,000. Net ≈ 0 before basis and costs.',
  mistake: 'Treating margin as the maximum loss.', q: 'k-fut' })}
${K({ t: 'Options', simple: 'An option gives the buyer a right, not an obligation. A call is the right to buy; a put is the right to sell. The buyer pays a premium.',
  pro: 'Options create asymmetric payoffs: protection with upside retained (long puts for producers, long calls for consumers). Value depends on underlying price, strike, time, volatility and rates. Sellers collect premium but take potentially large risk and post margin.',
  why: 'Options let hedgers buy insurance instead of locking a price, which matters when volumes or timing are uncertain.',
  ex: 'A jewellery maker buys calls to cap its gold cost for next quarter while benefiting if prices fall.',
  mistake: 'Selling options to "earn premium" without understanding the tail risk.', q: 'fi2' })}
${K({ t: 'Swaps', simple: 'A commodity swap exchanges a fixed price for a floating market price over a period, settled in cash.',
  pro: 'Fixed-for-floating swaps (often on monthly averages of a benchmark) hedge price exposure without delivery. They are OTC, so credit terms and documentation matter. They are common in metals and energy and for some steel and freight benchmarks.',
  why: 'Swaps match physical pricing that is based on averages better than single-date futures.',
  ex: 'A steel buyer pays fixed 700/t and receives the monthly average benchmark on 1,000 t/month. If the average is 750, it receives 50,000 that offsets its higher physical purchase cost.',
  mistake: 'Hedging an exposure priced on one benchmark with a swap on a different, poorly correlated index.', q: 'fi3' })}
${K({ t: 'Physical delivery vs cash settlement', simple: 'Some contracts end with goods (or warehouse receipts) changing hands; others end with a money payment based on a reference price.',
  pro: 'Physically delivered futures anchor futures to the physical market through arbitrage at expiry, but delivery has location and quality constraints. Cash-settled contracts reference an index or assessment; they avoid delivery logistics but introduce index-construction and basis risk.',
  why: 'If you hold a physically delivered contract into the delivery period, you may receive or have to deliver goods you cannot handle.',
  ex: 'Holding a long wheat future into delivery may give you a shipping certificate at a delivery location that is far from your buyers.',
  mistake: 'Forgetting first notice / last trading dates in a delivered contract.', q: 'fi4' })}
${CTA.table(['Feature', 'Spot', 'Forward', 'Futures', 'Option', 'Swap'], [
  ['Venue', 'OTC / physical', 'OTC', 'Exchange', 'Exchange or OTC', 'OTC (some cleared)'],
  ['Standardised', 'No', 'No', 'Yes', 'Exchange: yes', 'No'],
  ['Daily margin', 'No', 'Usually no', 'Yes', 'Yes for sellers / exchange', 'If collateralised'],
  ['Counterparty risk', 'Yes', 'Yes', 'Clearing house', 'Clearing house / OTC', 'Yes unless cleared'],
  ['Settlement', 'Delivery', 'Delivery (or cash)', 'Delivery or cash', 'Exercise into futures/cash', 'Cash'],
  ['Typical use', 'Prompt supply', 'Contracted supply', 'Hedging, speculation, price discovery', 'Insurance-like hedging', 'Average-price hedging'],
])}
` });

  /* ------------------------------------------------------------------ F4 */
  L.push({ id: 'f-pricing', track: 'foundations', title: 'How prices form — bid/ask, liquidity, supply, demand and inventories', mins: 30,
    summary: 'Bid and ask prices, spreads, liquidity, volume, price discovery, supply and demand, inventories and production costs.',
    objectives: ['Read a quote', 'Explain what liquidity costs you', 'Connect inventories and costs to price behaviour'],
    body: `
${K({ t: 'Bid and ask prices', simple: 'The bid is what buyers pay now; the ask (offer) is what sellers want now. You buy at the ask and sell at the bid.',
  pro: 'The bid-ask spread compensates market makers for inventory and information risk. In physical markets, "bids" and "offers" include terms (quantity, quality, loading period, payment). A wider spread signals lower liquidity, higher volatility or asymmetric information.',
  why: 'Every round trip pays the spread. For frequent trading, spread can be your largest cost.',
  ex: 'A bullion dealer quotes 1 kg bars at bid 64,150 / ask 64,450: 300 difference, about 0.47%.',
  num: 'Gold quoted 1,998.50 / 1,999.30. Buy 500 oz at the ask (999,650) and sell immediately at the bid (999,250): you lose 400 (0.80 × 500).',
  mistake: 'Valuing a position at the mid-price when you would actually have to sell at the bid.', q: 'fpr1' })}
${K({ t: 'Market liquidity', simple: 'A liquid market lets you trade large amounts quickly without moving the price.',
  pro: 'Liquidity has dimensions: tightness (spread), depth (size at each price), resilience (how fast the book refills) and immediacy. Liquidity concentrates in benchmark contracts and front months and can vanish in stress. Physical liquidity also depends on logistics: a cargo in the wrong place is illiquid even if futures are liquid.',
  why: 'Illiquid positions are hard to exit and costly to hedge; size positions relative to liquidity.',
  ex: 'Front-month gold futures are very liquid; a far-dated steel contract may trade only a few lots a day.',
  mistake: 'Assuming you can always exit at the screen price.', q: 'fpr4' })}
${K({ t: 'Trading volume', simple: 'Volume counts how much traded in a period.',
  pro: 'Rising prices on rising volume can indicate broad participation; moves on thin volume are less informative. Volume differs from open interest (positions outstanding). Exchange data report both; physical volumes are often unreported.',
  why: 'Volume helps judge whether a price move reflects real activity and whether your order size is significant.',
  ex: 'A breakout on volume twice the average is taken more seriously by technical analysts than one on low volume.',
  mistake: 'Confusing volume (flow) with open interest (stock).', q: 'k-vol' })}
${K({ t: 'Price discovery', simple: 'Price discovery is how the market "finds" the price through people bidding and offering based on what they know.',
  pro: 'Futures markets often lead price discovery because they aggregate information quickly; physical prices then reference futures plus a basis. In markets without futures, price reporting agencies (PRAs) assess prices from reported deals, which introduces methodology risk.',
  why: 'Knowing where price discovery happens tells you which benchmark to use and which data to watch.',
  ex: 'After a crop report, wheat futures move within seconds; physical offers adjust in the following hours.',
  mistake: 'Treating an assessed price as an executable quote.', q: 'k-pd' })}
${K({ t: 'Supply and demand', simple: 'If buyers want more than sellers can provide at current prices, prices rise until demand falls or supply increases — and vice versa.',
  pro: 'Short-run supply of many commodities is inelastic (crops are planted, mines have capacity limits) and demand is often inelastic too (people still eat bread), so small imbalances cause large price swings. Over the long run, both sides adjust: new capacity, substitution, efficiency.',
  why: 'Your edge as a trader comes from understanding imbalances before they are fully priced.',
  ex: 'A drought cuts a major exporter\'s wheat crop; importers bid for alternative origins and prices rise until some demand is rationed (e.g. feed wheat replaced by corn).',
  mistake: 'Assuming every supply shock raises prices — the market may already have priced it in, or demand may also be falling.', q: 'k-sd' })}
${K({ t: 'Inventory', simple: 'Inventory is the buffer between supply and demand.',
  pro: 'The inventory level relative to consumption (stocks-to-use, days of cover) drives volatility and the forward-curve shape: abundant stocks → contango (paying to store), scarce stocks → backwardation (paying for immediate availability). Visible exchange stocks may be a small part of total inventory.',
  why: 'The same shock has very different effects in a well-stocked versus a tight market.',
  ex: 'With stocks at 15% of annual use, a 3% supply loss is far more dangerous than with stocks at 40%.',
  mistake: 'Looking only at production and ignoring stocks.', q: 'fpr2' })}
${K({ t: 'Production costs', simple: 'If prices stay below what it costs to produce, producers cut output; if prices are far above, new supply comes.',
  pro: 'A cost curve ranks producers by cash cost. In surplus, prices can fall to cash costs of marginal producers (or below, temporarily); in deficit, prices rise above full costs to attract investment. Currency moves shift producer costs in USD terms.',
  why: 'Cost curves give a long-run reference range, useful for judging whether a price level is sustainable.',
  ex: 'Steel mills cut runs when the spread between steel prices and raw-material costs falls below conversion costs.',
  mistake: 'Using cost curves to predict short-term price moves.', q: 'fpr3' })}
` });

  /* ------------------------------------------------------------------ F5 */
  L.push({ id: 'f-economics', track: 'foundations', title: 'Deal economics — freight, insurance, financing, margins and return on capital', mins: 40,
    summary: 'Freight, insurance, financing, working capital, gross margin, net profit and return on capital — and why profit per tonne alone is misleading.',
    objectives: ['Build up a deal cost stack without double counting', 'Calculate margins and return on capital', 'Understand working-capital needs'],
    body: `
${K({ t: 'Freight costs', simple: 'Freight is the price of moving the goods — by ship, rail, barge or truck.',
  pro: 'Bulk freight is quoted per metric ton for a voyage (or as a daily time-charter hire); container freight per box. Freight volatility can be extreme and is linked to vessel supply, fuel costs, port congestion and route disruptions. The Incoterm decides who pays and who bears freight-rate risk.',
  why: 'Freight can be 5–20% of delivered value for grains and sugar, so it often decides which origin wins.',
  ex: 'Two wheat origins are 10/t apart FOB; freight to Egypt differs by 15/t, reversing the ranking.',
  num: 'FOB 230 + freight 28 = CFR 258/t. If freight jumps to 40, CFR becomes 270/t.',
  mistake: 'Comparing FOB prices from different origins without adding freight to the same destination.', q: 'k-frt' })}
${K({ t: 'Insurance', simple: 'Cargo insurance pays if the goods are lost or damaged in transit.',
  pro: 'Marine cargo insurance is usually written on Institute Cargo Clauses (A, B or C) with insured value commonly 110% of CIF value. Premiums are a small % of value, but cover terms (exclusions, war/strikes, warehouse-to-warehouse) matter more than price. Trade credit insurance and political-risk insurance are different products.',
  why: 'An uninsured loss on one cargo can exceed a year of trading margins.',
  ex: 'A CIF seller buys ICC (C) cover; the buyer, wanting broader cover, adds ICC (A) for its own account.',
  num: 'Cargo value 5,000,000 CIF; insured 110% = 5,500,000; premium 0.08% = 4,400.',
  mistake: 'Assuming CFR includes insurance, or leaving a gap between seller and buyer cover.', q: 'fe4' })}
${K({ t: 'Financing', simple: 'Traders usually borrow to pay for cargoes until the buyer pays. Interest is a cost of the deal.',
  pro: 'Transactional finance (LC-backed loans, receivables discounting, inventory/borrowing base facilities) lends a percentage of collateral value (advance rate). The cost = interest rate × amount × days/360 (typical money-market day count), plus fees. Longer payment terms and delays directly raise financing cost.',
  why: 'Financing cost scales with time: a 30-day delay on a large cargo is a real loss.',
  ex: 'A trader finances 90% of a 6,000,000 cargo at 7% for 75 days.',
  num: '6,000,000 × 90% × 7% × 75/360 = 78,750.',
  mistake: 'Counting financing in both the landed cost and again in overheads (double counting).', q: 'k-fin' })}
${K({ t: 'Working capital', simple: 'Working capital is the money stuck in the deal: cargo you paid for and invoices your buyers have not paid yet.',
  pro: 'Working capital need = inventory + receivables − payables (supplier credit). It depends on the timing gap between paying suppliers and collecting from buyers. Fast growth, long buyer terms, delays and higher prices all increase it.',
  why: 'Trading companies fail from running out of cash more often than from losing money on paper.',
  ex: 'Paying a supplier at loading and getting paid 60 days after arrival creates a ~90-day gap.',
  num: 'Monthly volume 3 cargoes × 6,000,000; 90-day gap → about 18,000,000 tied up at any time.',
  mistake: 'Accepting long payment terms to win a sale without checking the funding impact.', q: 'fe3' })}
${K({ t: 'Gross margin', simple: 'Gross margin = sales minus the direct cost of the goods sold.',
  pro: 'In this academy: gross margin = net sales revenue − landed cost before financing. It measures the commercial spread captured by the deal. Express it in total, per tonne and as % of revenue.',
  why: 'Gross margin shows whether the trade idea works before funding and overheads.',
  ex: 'Sell 300/t, landed cost before financing 285.81/t → gross margin 14.19/t (4.7%).',
  mistake: 'Calling the difference between buying and selling price "margin" while ignoring logistics.', q: 'k-gm' })}
${K({ t: 'Net profit', simple: 'Net profit is what is left after every cost of the deal.',
  pro: 'Net transaction profit = net sales revenue − total landed cost (incl. financing during the cycle) − selling expenses not already included − extra financing − other deal costs. Each cost must appear only once.',
  why: 'Only net profit pays salaries and builds equity.',
  ex: 'Gross margin 141,920; financing 28,580; selling commission 0 → net 113,340.',
  num: 'Buy 10,000 t at 250 FOB, freight 30/t, insurance 0.1% of 110% CFR, inspection 5,000, port 5/t, financing 6% for 60 days, sell 300/t → net profit 113,339.20 (try it in the Deal Calculator).',
  mistake: 'Leaving out small items (inspection, bank fees, port dues) that add up to the whole margin.', q: 'fe1' })}
${K({ t: 'Return on capital', simple: 'Return on capital tells you how much profit the deal makes for each unit of money tied up.',
  pro: 'ROIC = net profit ÷ equity employed (working capital not funded by banks or suppliers). Annualise by × 365 ÷ cycle days to compare deals. Capital is scarce: traders allocate it to deals with the best risk-adjusted annualised returns.',
  why: 'A small-margin, fast-turning deal can beat a high-margin slow one.',
  num: 'Profit 113,339; working capital 2,858,080; bank funds 80% → equity 571,616; ROIC 19.8% for 60 days ≈ 120% annualised (illustrative).',
  mistake: 'Comparing deals by total profit without considering capital tied up and duration.', q: 'fe2' })}
<div data-widget="dealMini"></div>
` });

  /* ------------------------------------------------------------------ F6 */
  L.push({ id: 'f-risk', track: 'foundations', title: 'Risk types — counterparty, credit, market and operational', mins: 25,
    summary: 'The four core risk families of a trading business and how they show up in real deals.',
    objectives: ['Identify risk types in deal situations', 'Distinguish credit from counterparty performance risk', 'Recognise operational risk triggers'],
    body: `
${K({ t: 'Counterparty risk', simple: 'The risk that the other side does not do what it promised — deliver, pay, perform on time or to spec.',
  pro: 'Counterparty risk includes performance risk (non-delivery, wash-out when prices move against the counterparty), pre-settlement risk (replacement cost of a defaulted forward) and settlement risk (paying before receiving). Exposure grows when prices move in your favour, because the counterparty then has an incentive to default.',
  why: 'Your contract is worthless if the counterparty cannot or will not perform.',
  ex: 'You bought sugar forward at 500; the market rises to 560; the seller "finds a problem" and does not ship. Replacing the cargo costs 60/t.',
  mistake: 'Measuring exposure only by the invoice amount rather than by replacement cost.', q: 'k-cpty' })}
${K({ t: 'Credit risk', simple: 'The risk that a buyer does not pay what it owes.',
  pro: 'Credit risk depends on probability of default, exposure at default and loss given default. Mitigants: payment security (LC, advance payment, documentary collection), credit insurance, guarantees, credit limits, diversification and monitoring of payment behaviour.',
  why: 'One unpaid cargo can be larger than a year\'s margin.',
  ex: 'A buyer on 90-day open account delays payment by 45 days, then files for insolvency.',
  mistake: 'Granting credit because a buyer is large and well known, without financial analysis.', q: 'fr1' })}
${K({ t: 'Market risk', simple: 'The risk of losing money because prices, spreads, currencies or interest rates move.',
  pro: 'Includes flat-price risk, basis/spread risk, currency risk, interest-rate risk and volatility risk (options). Measured by position (tonnes, ounces), sensitivities (delta), VaR and stress tests; controlled by limits and hedging.',
  why: 'Unhedged positions in volatile commodities can generate losses quickly.',
  ex: 'A trader holds 20,000 t of unsold sugar; prices fall 8% in a week.',
  mistake: 'Believing a fully hedged position has no market risk — basis risk remains.', q: 'fr3' })}
${K({ t: 'Operational risk', simple: 'The risk of losses from mistakes, failed systems, fraud or external events.',
  pro: 'In physical trading: wrong documents, missed laytime notices, incorrect specs in contracts, warehouse fraud, cyber payment fraud (fake bank details), sanctions breaches, mis-booked trades. Controls: segregation of duties, four-eyes checks, standard contract templates, reconciliations, KYC.',
  why: 'Operational failures can turn a profitable deal into a loss or a legal problem.',
  ex: 'An email from a "supplier" changes bank details; the payment goes to a fraudster.',
  mistake: 'Treating paperwork as administration rather than risk control.', q: 'fr2' })}
${CTA.callout('warn', 'Risk interacts', 'Risks compound: a price fall (market risk) makes a buyer reluctant to take delivery (counterparty risk), who then raises quality claims (operational/legal risk) and delays payment (credit and liquidity risk). The Risk Management Center lets you stress these together.')}
` });

  /* ------------------------------------------------------------------ F7 */
  L.push({ id: 'f-accounting', track: 'foundations', title: 'Accounting for commodity trading — reading the statements', mins: 50,
    summary: 'Income statement, balance sheet, cash flow, trading P&L, inventory, AP/AR and working-capital reports — and how a profitable trader can still run out of cash.',
    objectives: ['Read the three main statements of a trading company', 'Understand trading P&L, MTM and inventory reports', 'Explain profit vs cash with numbers'],
    body: `
<p>Every trading decision ends up in the accounts. You need to read them as a trader (what is our exposure and liquidity?) and as a credit analyst (can this counterparty pay?). The figures below are for a <b>fictional</b> company, <b>Meridian Commodities Ltd</b> ${SIM}.</p>
<h2>1. Income statement (profit and loss)</h2>
${K({ t: 'Income statement', simple: 'Shows sales, costs and profit over a period — when goods were delivered, not when cash moved.',
  pro: 'For traders, revenue is large and margins thin, so the key lines are gross margin (trading result), operating expenses, finance costs and taxes. Revenue alone says little; a 2% gross margin is normal. Watch finance costs relative to gross margin and whether results depend on unrealised MTM gains.',
  why: 'Tells you whether the business model earns money over time.',
  mistake: 'Judging a trader by revenue size.', q: 'fa1' })}
${CTA.table(['Meridian Commodities — Income statement, year 1', 'USD'], [
  ['Revenue (cargo sales)', '412,600,000'], ['Cost of goods sold (purchases + logistics)', '(401,200,000)'], ['<b>Gross margin</b>', '<b>11,400,000</b> (2.8%)'],
  ['Unrealised MTM on open positions (net)', '650,000'], ['Operating expenses (staff, offices, systems)', '(5,100,000)'], ['Finance costs (trade finance interest & fees)', '(3,900,000)'],
  ['<b>Profit before tax</b>', '<b>3,050,000</b>'], ['Tax', '(610,000)'], ['<b>Net profit</b>', '<b>2,440,000</b>'],
])}
<h2>2. Balance sheet</h2>
${K({ t: 'Balance sheet', simple: 'A snapshot of what the company owns (assets), owes (liabilities) and the owners\' stake (equity).',
  pro: 'Trading balance sheets are dominated by current assets (inventories, receivables, derivative assets, margin deposits) funded by short-term bank lines and payables. Key ratios: equity/total assets, current ratio, net debt to equity, and how much of inventory is "readily marketable" (hedged, liquid).',
  why: 'Shows whether the company can absorb losses and how dependent it is on short-term funding.',
  mistake: 'Ignoring that most debt is short-term and must be rolled over by banks.', q: 'k-bs' })}
${CTA.table(['Meridian — Balance sheet at year end', 'USD', 'Liabilities & equity', 'USD'], [
  ['Cash', '4,200,000', 'Trade payables', '18,600,000'], ['Trade receivables', '41,300,000', 'Short-term bank lines', '52,800,000'], ['Inventories (at market, hedged)', '38,900,000', 'Derivative liabilities', '1,900,000'],
  ['Margin deposits with brokers', '3,100,000', 'Other liabilities', '2,100,000'], ['Derivative assets', '2,400,000', '<b>Equity</b>', '<b>16,500,000</b>'], ['Fixed assets', '2,000,000', '', ''],
  ['<b>Total assets</b>', '<b>91,900,000</b>', '<b>Total liabilities & equity</b>', '<b>91,900,000</b>'],
])}
<p>Equity is only 18% of assets: losses of 16.5m would wipe it out. Banks fund most of the receivables and inventory, so lender confidence is critical.</p>
<h2>3. Cash flow statement</h2>
${K({ t: 'Cash flow statement', simple: 'Explains how cash changed: from operations, investments and financing.',
  pro: 'Operating cash flow = profit adjusted for non-cash items (MTM) and changes in working capital. For growing traders, OCF is often negative because inventory and receivables grow faster than payables; the gap is financed by bank borrowing (financing cash flow).',
  why: 'Reveals whether profits are turning into cash, or being absorbed by working capital.',
  mistake: 'Celebrating profit while operating cash flow is deeply negative.', q: 'fa3' })}
${CTA.table(['Meridian — Cash flow statement, year 1', 'USD'], [
  ['Net profit', '2,440,000'], ['Less unrealised MTM gains (non-cash)', '(650,000)'], ['Increase in inventories', '(14,200,000)'], ['Increase in receivables', '(17,900,000)'], ['Increase in payables', '6,300,000'],
  ['<b>Operating cash flow</b>', '<b>(24,010,000)</b>'], ['Capex', '(400,000)'], ['Net bank borrowing', '24,800,000'], ['<b>Change in cash</b>', '<b>390,000</b>'],
])}
<h2>4. Trading P&L, inventory, AP/AR and working-capital reports</h2>
${K({ t: 'Trading P&L report', simple: 'An internal daily report showing profit or loss by book, commodity and deal — including open positions valued at today\'s prices.',
  pro: 'Splits realised vs unrealised, physical vs derivatives, and explains daily changes (price, basis, FX, new deals, cost accruals). Physical and hedge results are shown together so the desk sees net economic exposure.',
  why: 'It is how management sees risk and performance every day.', mistake: 'Looking at the physical book and the hedge book separately and panicking about a loss that is offset.', q: 'k-tpl' })}
${CTA.table(['Desk', 'Physical MTM', 'Hedge MTM', 'Net', 'Realised YTD'], [['Wheat', '−420,000', '+395,000', '−25,000', '1,840,000'], ['Sugar', '+310,000', '−298,000', '+12,000', '960,000'], ['Steel', '+85,000', '0 (unhedged)', '+85,000', '410,000'], ['Gold', '−60,000', '+58,500', '−1,500', '230,000']])}
${K({ t: 'Inventory report', simple: 'Lists the stock you own: where it is, how much, what quality, its cost and its market value, and whether it is hedged or pledged to a bank.',
  pro: 'Inventory may be valued at cost/NRV or at fair value (common for commodity traders under applicable standards). The report should reconcile physical quantities (warehouse receipts, surveys) to the books, show pledges and ageing, and flag quality or location issues.',
  why: 'Inventory is often pledged as collateral; mismatches are a classic fraud and loss source.', mistake: 'Trusting book quantities without independent warehouse confirmations.', q: 'k-inv' })}
${CTA.table(['Location', 'Commodity', 'Qty', 'Cost/unit', 'Market/unit', 'Hedged', 'Pledged to'], [['Constanța silo (fict.)', 'Milling wheat 12.5%', '18,000 t', '238', '231', '100%', 'Bank A'], ['Santos warehouse (fict.)', 'Raw sugar VHP', '12,500 t', '452', '461', '90%', 'Bank B'], ['Antwerp yard (fict.)', 'Rebar B500B 12–25 mm', '3,200 t', '585', '598', '0%', '—'], ['Zurich vault (fict.)', 'Gold 1 kg bars 999.9', '120 kg', '63,900/kg', '64,350/kg', '100%', '—']])}
${K({ t: 'Accounts payable, receivable and working capital reports', simple: 'AR shows who owes you and how overdue; AP shows whom you owe and when; the working-capital report adds inventory and shows the cash tied up.',
  pro: 'AR ageing (current, 1–30, 31–60, 60+ days) flags credit deterioration. AP schedules show upcoming cash needs. Working-capital reports translate both into days (DSO, DIO, DPO) and the cash conversion cycle; treasury uses them to size bank lines.',
  why: 'Overdue receivables and large upcoming payables are early warnings of a liquidity squeeze.', mistake: 'Ignoring a buyer who pays later each month.', q: 'fa4' })}
${CTA.table(['AR ageing', 'Current', '1–30 days', '31–60', '60+', 'Total'], [['Buyer A (mill)', '8.2m', '—', '—', '—', '8.2m'], ['Buyer B (refinery)', '6.5m', '2.1m', '—', '—', '8.6m'], ['Buyer C (distributor)', '1.0m', '1.9m', '2.4m', '0.8m', '6.1m ⚠']])}
<h2>5. Profit is not cash</h2>
${K({ t: 'Mark-to-market and unrealised P&L', simple: 'Open positions are revalued at today\'s prices; the change is a gain or loss "on paper" until closed.',
  pro: 'Unrealised gains raise reported profit and equity but not cash (except futures, where variation margin moves cash daily — creating the opposite problem: hedges can drain cash while physical gains stay unrealised).',
  why: 'Liquidity planning must separate cash from accounting profit.', mistake: 'Spending unrealised profits.', q: 'fa5' })}
<p>Use the simulator below: a company makes a profit on each cargo but pays suppliers before buyers pay. Increase the number of cargoes or the buyer\'s payment days and watch the cash balance go negative while profit keeps growing.</p>
<div data-widget="cashGap"></div>
${CTA.callout('ok', 'The lesson', 'A trader with 2.4m profit consumed 24m of operating cash. If the banks had reduced credit lines, Meridian would have faced a liquidity crisis <em>while profitable</em>. Always pair a P&L view with a cash and funding view.')}
` });

  /* ================================================================= Stage 2 */
  L.push({ id: 'm-valuechain', track: 'markets', title: 'The international commodity value chain', mins: 30,
    summary: 'From production to final consumption: collection, processing, storage, transport, trading, financing and delivery — compared across gold, wheat, sugar and steel.',
    objectives: ['Describe each stage of the chain', 'Compare chains across the four commodities', 'Locate risks and margins along the chain'],
    body: `
<p>Every commodity follows the same broad chain, but the details — and where margins and risks sit — differ. Click a stage to see what happens there for each commodity.</p>
<div data-widget="valueChain"></div>
<h2>Where value is added and risks arise</h2>
${CTA.table(['Stage', 'Value added', 'Typical risks'], [
  ['Production', 'Extracting/growing the raw material', 'Weather, geology, cost inflation, permitting'],
  ['Collection', 'Aggregating small lots into tradeable volumes', 'Quality mixing, counterparty fragmentation, pre-finance default'],
  ['Processing', 'Upgrading to a specification buyers want', 'Margin squeeze, plant outages, input quality'],
  ['Storage', 'Moving goods through time (seasonal smoothing)', 'Spoilage, theft, warehouse fraud, carry costs'],
  ['Transportation', 'Moving goods across space', 'Freight volatility, delays, damage, congestion'],
  ['Trading', 'Matching supply and demand, price & risk management', 'Price, basis, credit, contract mismatch'],
  ['Financing', 'Bridging time between payment and receipt', 'Funding withdrawal, interest rates, collateral fraud'],
  ['Delivery', 'Transferring goods and documents to the buyer', 'Rejection, claims, documentary discrepancies'],
  ['Final consumption', 'Use in food, construction, jewellery, industry', 'Demand shifts, substitution, policy'],
])}
${CTA.callout('', 'Professional view', 'Integrated traders own assets at bottleneck points (port terminals, silos, refineries, vessels) because control of logistics lets them capture spreads others cannot. Asset-light traders rely on information, relationships and financing.')}
` });

  L.push({ id: 'm-flows', track: 'markets', title: 'Regions, trade flows, seasons and weather', mins: 30,
    summary: 'Major producing and consuming regions, international flows, seasonal supply and production cycles, weather risk and inventory cycles.',
    objectives: ['Name major producing and importing regions for each commodity', 'Explain hemisphere seasonality', 'Link weather to supply risk'],
    body: `
<p>${CTA.callout('warn', 'Data note', 'Rankings below are broad, long-standing patterns stated qualitatively. For current volumes use official sources (USDA PSD, FAO, ISO, worldsteel, USGS, World Gold Council) linked in Global Markets → Research & Data Sources.')}</p>
${CTA.table(['Commodity', 'Major producing regions', 'Major importing/consuming regions', 'Typical trade mode'], [
  ['Gold', 'Mines across China, Australia, Russia, North America, Africa, South America; recycling is a large secondary source', 'Jewellery (India, China, Middle East), investment (global), central banks', 'Air freight, vaults; refining hubs (e.g. Switzerland)'],
  ['Wheat', 'EU, Russia, China, India, USA, Canada, Australia, Ukraine, Argentina, Kazakhstan', 'North Africa & Middle East, Southeast Asia, sub-Saharan Africa, parts of Latin America', 'Bulk carriers from export terminals'],
  ['Sugar', 'Brazil (cane) dominant exporter; India, Thailand, EU (beet), China, USA, Mexico, Australia', 'Asia (Indonesia, China), Middle East, Africa, USA (quota system)', 'Raw: bulk; refined: bagged/containers/bulk'],
  ['Steel', 'China produces over half of world crude steel; India, Japan, USA, Russia, South Korea, Türkiye, EU, Brazil', 'Construction & manufacturing hubs globally; importers in Middle East, Southeast Asia, EU, USA', 'Breakbulk, bulk, containers'],
])}
<h2>Seasonality and production cycles</h2>
<p><b>Wheat</b>: Northern Hemisphere winter wheat is planted in autumn and harvested in early-to-mid summer; spring wheat is planted in spring and harvested late summer. Southern Hemisphere (Australia, Argentina) harvests around November–January. Fresh harvest supply often pressures nearby prices in the harvest window, while pre-harvest periods are sensitive to weather news.</p>
<p><b>Sugar</b>: Brazil Centre-South cane is crushed roughly April–November; India and Thailand crush roughly October/November to April; EU beet campaigns run autumn to early winter. Cane is a semi-perennial crop (multiple ratoon harvests from one planting), so area responds slowly to prices.</p>
<p><b>Steel</b>: production is continuous, but demand is seasonal with construction (lower in cold winters or monsoon seasons in some regions; holiday periods such as Lunar New Year affect Chinese demand).</p>
<p><b>Gold</b>: mine supply is steady; demand shows seasonal jewellery patterns (festival and wedding seasons in India, Lunar New Year in China).</p>
<h2>Weather risk</h2>
<ul><li><b>Drought</b> during critical growth stages cuts yields (wheat grain fill, cane growth).</li><li><b>Excess rain at harvest</b> damages quality (sprouting in wheat → low falling number) and interrupts cane crushing.</li><li><b>Frost</b> can damage wheat at heading and cane.</li><li><b>Climate patterns</b> such as El Niño / La Niña shift rainfall probabilities across Australia, South and Southeast Asia and South America — useful for scenario thinking, not certainties.</li></ul>
<h2>Inventory cycles</h2>
<p>High prices encourage production and ration demand → stocks build → prices fall → production is cut → stocks draw → prices rise. Cycle length depends on how fast supply responds: one season for annual crops, several years for mines, cane and steel capacity.</p>
` });

  L.push({ id: 'm-macro', track: 'markets', title: 'Macro, policy and compliance drivers', mins: 35,
    summary: 'Currencies, interest rates, geopolitics, government policies, duties, export restrictions, sanctions and trade compliance.',
    objectives: ['Explain currency and interest-rate effects', 'Analyse duties and export restrictions', 'Understand sanctions compliance obligations'],
    body: `
<h2>Currency effects</h2>
<p>Most internationally traded commodities are priced in US dollars. Two effects follow: (1) a stronger USD makes commodities more expensive in other currencies, which can reduce demand, and (2) producers with local-currency costs earn more local currency when their currency weakens, which can encourage exports.</p>
<div class="numbox"><b>Numbers</b> ${SIM}<div>Wheat CFR Alexandria 280 USD/t. At 30 EGP/USD the local cost is 8,400 EGP/t; at 48 EGP/USD it is 13,440 EGP/t — a 60% increase with no change in the USD price.</div></div>
<h2>Interest rates</h2>
<p>Rates affect commodities through: the cost of carrying inventory (financing), the shape of forward curves (higher rates → wider full-carry contango), the opportunity cost of holding non-yielding assets like gold, the USD exchange rate and economic activity (demand).</p>
<h2>Geopolitics and policy</h2>
<ul>
<li><b>Import duties and tariffs</b> raise landed costs and redirect flows. Duty is usually a % of customs value (CIF in many jurisdictions; some use FOB-type valuation).</li>
<li><b>Export restrictions</b> (bans, quotas, taxes, minimum export prices) reduce available world supply, raise world prices and depress domestic prices in the restricting country. ${HIST} Examples: Russia\'s 2010 grain export ban after drought; India\'s May 2022 wheat export restrictions; India\'s 2022 move of sugar exports into a "restricted" category.</li>
<li><b>Government stockpiles and subsidies</b> can absorb or release supply and support production.</li>
<li><b>Trade remedies</b> (anti-dumping, countervailing duties, safeguards) are especially common in steel. ${HIST} The US imposed 25% Section 232 tariffs on many steel imports in 2018; the EU introduced steel safeguard measures in 2018–2019.</li>
</ul>
<h2>Sanctions and trade compliance</h2>
<p>Sanctions regimes (for example UN, EU, UK, US) restrict dealings with designated countries, entities, individuals, vessels and goods. Obligations can extend to entities owned or controlled by designated parties. A professional trader:</p>
<ol><li>Screens counterparties, beneficial owners, banks, vessels and ports against applicable lists.</li><li>Checks goods and destinations for export controls.</li><li>Watches red flags: unusual routing, ship-to-ship transfers, AIS gaps on vessels, last-minute changes of buyer or destination, payment from third parties.</li><li>Escalates to compliance and documents decisions.</li></ol>
${CTA.callout('bad', 'Important', 'This is an educational overview, not legal advice. Sanctions rules change frequently and differ by jurisdiction. Real decisions require qualified compliance and legal counsel.')}
` });

  L.push({ id: 'm-logistics-prices', track: 'markets', title: 'Benchmarks, regional price differences, freight and warehousing', mins: 30,
    summary: 'Commodity price benchmarks, why prices differ between regions, freight markets, shipping bottlenecks, port congestion and warehousing.',
    objectives: ['Explain benchmark + differential pricing', 'Compute delivered-price comparisons', 'Understand bottleneck effects'],
    body: `
<h2>Benchmarks</h2>
<p>Physical contracts are often priced against a benchmark: an exchange futures price (gold, grains, raw and white sugar), an over-the-counter reference price (e.g. the LBMA Gold Price auction) or an assessment published by a price reporting agency (common for steel products and freight). The physical price = benchmark ± differential for quality, location and timing.</p>
<h2>Regional price differences</h2>
<p>The difference between two regions is bounded by the cost of moving goods between them. If destination price − origin price &gt; full transfer cost, traders ship until the gap narrows; if it is lower, flows stop or reverse. Transfer cost includes freight, insurance, duties, handling, financing for the voyage, quality adjustments and currency costs.</p>
<div data-widget="miniArb"></div>
<h2>Freight markets and bottlenecks</h2>
<p>Dry-bulk freight is set by vessel supply versus cargo demand, fuel prices, route lengths and congestion. Canal restrictions or diversions lengthen voyages, effectively removing ship capacity. Port congestion leaves ships waiting (demurrage) and can raise freight rates for whole regions.</p>
<h2>Warehousing</h2>
<p>Storage provides time arbitrage: if the forward price exceeds spot by more than storage, insurance and financing, holding stock is profitable (cash-and-carry). Warehouse receipts can be financed — and are a known fraud vector (duplicate or fake receipts), so collateral managers and inspections are used.</p>
` });

  L.push({ id: 'm-shocks', track: 'markets', title: 'Shocks, substitution and structural change — case studies', mins: 35,
    summary: 'Supply and demand shocks, substitution between commodities and a method to distinguish temporary moves from structural change.',
    objectives: ['Classify shocks', 'Apply a structural-change checklist', 'Learn from historical cases'],
    body: `
<h2>Shocks</h2>
<p><b>Supply shocks</b>: droughts, floods, mine accidents, strikes, wars, export bans. <b>Demand shocks</b>: recessions, stimulus programmes, sudden policy changes, pandemics. The price impact depends on inventories, elasticity, expectations and how long the shock lasts.</p>
<h2>Substitution</h2>
<p>When one commodity becomes expensive, users switch where possible: feed wheat ↔ corn/barley; cane ↔ beet sugar (and sweeteners like HFCS in some markets); scrap ↔ pig iron/DRI in EAFs; gold jewellery buyers shift to lighter pieces or lower karats. Substitution caps price spikes at the margin.</p>
<h2>Temporary or structural? A checklist</h2>
<ol><li><b>Duration</b>: will the cause last beyond one season/production cycle?</li><li><b>Capacity</b>: has productive capacity been added or removed permanently?</li><li><b>Policy</b>: is the policy change institutionalised (laws, long-term programmes) or a short emergency measure?</li><li><b>Technology/demand trends</b>: is demand changing because of technology or regulation (e.g. EAF shift in steel)?</li><li><b>Inventories</b>: are stocks rebuilding as expected after the shock?</li><li><b>Forward curve</b>: is the whole curve moving (structural) or only the front (temporary tightness)?</li><li><b>Cost curve</b>: has the marginal cost of supply changed?</li></ol>
<h2>Case studies</h2>
<div class="coll"><div class="coll-h">${HIST} Russia\'s 2010 wheat export ban</div><div class="coll-b"><p>After a severe drought and heat wave cut its crop, Russia announced a grain export ban in August 2010 (lasting into 2011). World wheat prices rose sharply; importers in North Africa and the Middle East switched to other origins. <b>Lesson</b>: policy reaction to a weather shock amplified the supply loss for the world market. Mostly temporary: the ban was lifted and later crops recovered, but it permanently raised importers\' awareness of origin-concentration risk.</p></div></div>
<div class="coll"><div class="coll-h">${HIST} 2022 Black Sea disruption</div><div class="coll-b"><p>The war in Ukraine from February 2022 disrupted Black Sea grain exports and spiked prices and freight insurance costs. The Black Sea Grain Initiative (July 2022 – July 2023) allowed some exports to resume. <b>Lesson</b>: geopolitical shocks affect logistics (ports, insurance) as much as production. Distinguish the temporary logistics blockage from potential longer-term changes in production capacity and trade routes.</p></div></div>
<div class="coll"><div class="coll-h">${HIST} Gold during the March 2020 liquidity squeeze</div><div class="coll-b"><p>In March 2020, as markets sold off, gold also fell sharply for a short period while investors raised cash, before rallying strongly later that year. <b>Lesson</b>: "safe haven" behaviour is not guaranteed in a liquidity squeeze.</p></div></div>
<div class="coll"><div class="coll-h">Illustrative case ${SIM}: a sugar shock that turned structural</div><div class="coll-b"><p>Fictional country "Equatoria" suffers drought and its sugar exports halve; prices rise 25%. Two years later its government mandates higher ethanol blending, permanently diverting cane to fuel. The first move was weather (temporary); the second policy shift is structural — it changes the medium-term export balance.</p></div></div>
` });

  /* concept quiz questions referenced above (kept with the lessons that introduce them) */
  const add = (id, t, l, q, o, a, e) => CTA.QUESTIONS.push({ id, t, l, q, o, a, e });
  add('k-raw', 'foundations', 'f-commodity', 'Which is an intermediate (semi-processed) commodity rather than a primary raw material?', ['Iron ore fines', 'Raw sugar', 'Standing wheat in a field', 'Gold ore in the ground'], 1, 'Raw sugar has been processed from cane but still needs refining for most uses. It is an intermediate product traded mainly to refineries.');
  add('k-prod', 'foundations', 'f-participants', 'A gold miner\'s costs are in local currency and revenue in USD. The local currency strengthens sharply. The miner\'s margin…', ['Rises', 'Falls, because each USD of revenue buys fewer units of local currency to pay costs', 'Is unchanged', 'Depends only on gold purity'], 1, 'Producers face currency risk: a stronger local currency raises their costs in USD terms.');
  add('k-imp', 'foundations', 'f-participants', 'Which participant typically breaks bulk and sells small lots on credit to local customers?', ['Exporter', 'Distributor/wholesaler', 'Clearing house', 'Shipowner'], 1, 'Distributors hold local inventory, break bulk and extend credit to smaller buyers.');
  add('k-exch', 'foundations', 'f-instruments', 'What removes bilateral counterparty risk in exchange-traded futures?', ['The broker\'s reputation', 'The clearing house acting as central counterparty with margin', 'Incoterms', 'Insurance'], 1, 'Novation to a central counterparty, backed by margin and default funds, removes direct bilateral exposure.');
  add('k-otc', 'foundations', 'f-instruments', 'A main advantage of OTC contracts over exchange futures is…', ['No counterparty risk', 'Flexible, tailored terms (quantity, dates, averaging, location)', 'Public prices', 'Daily margin by law'], 1, 'OTC contracts can be tailored; the trade-off is counterparty risk and less transparency.');
  add('k-spot', 'foundations', 'f-instruments', 'In the international OTC gold market, a "spot" trade typically settles…', ['Instantly', 'Two business days after the trade date (T+2)', 'In 30 days', 'At contract expiry'], 1, 'Spot gold conventionally settles T+2. Physical "spot" in bulk commodities usually means the nearest loading window.');
  add('k-fut', 'foundations', 'f-instruments', 'You hedge 1,000 oz gold inventory by selling 10 futures (100 oz). Gold falls 25/oz. Ignoring basis, the net result is roughly…', ['−25,000', '0', '+25,000', '−50,000'], 1, 'Inventory −25,000; futures +25,000 → about zero. Basis and costs cause small differences.');
  add('k-vol', 'foundations', 'f-pricing', 'What is the difference between volume and open interest?', ['None', 'Volume counts contracts traded in a period; open interest counts contracts still outstanding', 'Volume is only for options', 'Open interest is in tonnes, volume in USD'], 1, 'Volume is a flow; open interest is a stock of outstanding positions.');
  add('k-pd', 'foundations', 'f-pricing', 'Where does price discovery mainly happen for markets with liquid futures?', ['In annual reports', 'In the futures market, with physical prices quoted as futures plus basis', 'At the port authority', 'Nowhere'], 1, 'Liquid futures aggregate information quickly; physical trades reference them.');
  add('k-sd', 'foundations', 'f-pricing', 'Why can small supply changes cause large price swings in food commodities?', ['Because demand and short-run supply are both price-inelastic', 'Because exchanges amplify prices by rule', 'Because freight is fixed', 'They cannot'], 0, 'When neither supply nor demand adjust quickly, prices must move a lot to rebalance the market.');
  add('k-frt', 'foundations', 'f-economics', 'Origin A wheat 228 FOB with freight 34; origin B 236 FOB with freight 22 to the same port. Cheaper CFR?', ['A (262)', 'B (258)', 'Equal', 'Cannot tell without futures'], 1, 'A: 228 + 34 = 262. B: 236 + 22 = 258. B is 4/t cheaper delivered despite the higher FOB price.');
  add('k-fin', 'foundations', 'f-economics', 'Financing 4,000,000 at 8% p.a. for 45 days (ACT/360) costs…', ['40,000', '320,000', '36,000', '4,000'], 0, '4,000,000 × 8% × 45/360 = 40,000.');
  add('k-gm', 'foundations', 'f-economics', 'Net revenue 3,000,000; landed cost before financing 2,858,080. Gross margin %?', ['4.73%', '14.2%', '95.3%', '2.86%'], 0, '(3,000,000 − 2,858,080) / 3,000,000 = 141,920 / 3,000,000 = 4.73%.');
  add('k-cpty', 'risk', 'f-risk', 'You bought sugar forward at 500/t; the market rises to 560/t. Your exposure to the seller\'s non-performance is roughly…', ['0', '60/t replacement cost', '500/t', '560/t'], 1, 'If the seller defaults you must replace the cargo at 560: exposure is the 60/t replacement cost (plus disruption costs).');
  add('k-tpl', 'accounting', 'f-accounting', 'Physical wheat MTM −420,000 and hedge MTM +395,000. What is the desk\'s economic result?', ['−420,000', '−25,000', '+395,000', '−815,000'], 1, 'Physical and hedge results must be read together: net −25,000, a basis movement.');
  add('k-inv', 'accounting', 'f-accounting', 'Why must inventory reports be reconciled to independent warehouse confirmations?', ['To reduce taxes', 'To detect losses, quality issues and fraud such as fake or duplicate receipts', 'It is optional', 'To increase revenue'], 1, 'Physical inventory backing loans is a well-known fraud target; independent verification protects you and your banks.');
  add('k-bs', 'accounting', 'f-accounting', 'Meridian has equity of 16.5m and total assets of 91.9m. Equity ratio?', ['18%', '5.6%', '82%', '50%'], 0, '16.5 / 91.9 = 18%. Thin equity relative to assets means losses or funding withdrawal hit quickly.');
})();
