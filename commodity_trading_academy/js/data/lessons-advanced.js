/* Lessons — Stages 4–8: physical trading, trade finance & logistics, derivatives, analysis, risk & negotiation. */
(function () {
  const CTA = window.CTA, SIM = CTA.SIM, ILLU = CTA.ILLU, T = CTA.table, N = CTA.callout;
  const L = CTA.LESSONS;
  const add = (id, t, l, q, o, a, e) => CTA.QUESTIONS.push({ id, t, l, q, o, a, e });
  const go = (path, label) => `<a class="btn sm" href="#/${path}">${label} →</a>`;

  /* ============================================================ Stage 4 */
  L.push({ id: 'p-workflow', track: 'physical', title: 'The physical deal workflow — inquiry to reconciliation', mins: 45,
    summary: 'The 25 steps of a physical commodity transaction, the decisions at each step and how purchase and sale contracts must be aligned.',
    objectives: ['Sequence the workflow', 'Identify the decision and risk at each step', 'Align back-to-back contracts'],
    body: `
<p>A physical trade is a chain of commitments. The trader\'s job is to make sure each link — supplier, quality, logistics, finance, documents, buyer — holds, and that the economics still work after every cost and risk.</p>
${T(['#', 'Step', 'Key question', 'Typical risk if done badly'], [
  [1, 'Receive buyer inquiry', 'Is this a real, creditworthy buyer with a clear need?', 'Time wasted on fake inquiries'], [2, 'Understand specifications', 'Exactly which grade, quantity, tolerance, delivery and documents?', 'Quality claims'],
  [3, 'Identify suppliers', 'Who can supply that spec in the window?', 'No supply at the price sold'], [4, 'Evaluate supplier credibility', 'Track record, financial strength, references?', 'Non-delivery, fraud'],
  [5, 'Request quotations', 'Comparable terms (Incoterm, spec, payment)?', 'Apples-to-oranges comparison'], [6, 'Compare offers', 'Risk-adjusted delivered cost?', 'Choosing the cheapest bad supplier'],
  [7, 'Total acquisition cost', 'All costs to the delivery point?', 'Missed costs → losses'], [8, 'Destination market price', 'What can we really sell at?', 'Overestimated sale price'],
  [9, 'Expected profit', 'Net profit, margin, break-even?', 'Uneconomic deal'], [10, 'Financing requirements', 'Peak cash need, duration, cost?', 'Liquidity squeeze'],
  [11, 'Logistics & delivery', 'Route, vessel, timing, port constraints?', 'Delays, demurrage'], [12, 'Counterparty due diligence', 'KYC, sanctions, beneficial owners?', 'Legal and fraud exposure'],
  [13, 'Negotiate terms', 'Price, payment, inspection, penalties, law?', 'Unbalanced risk allocation'], [14, 'Sales contract', 'Clear, complete, enforceable?', 'Disputes'],
  [15, 'Purchase contract', 'Back-to-back with the sale?', 'Gaps between the two'], [16, 'Arrange financing', 'LC, facility, advance?', 'Funding failure'],
  [17, 'Arrange inspection', 'Who, where, final or not?', 'Unprovable quality'], [18, 'Arrange transportation', 'Charter/booking, laytime, demurrage?', 'Freight cost blow-out'],
  [19, 'Prepare documents', 'Do all documents match each other and the LC?', 'Payment refused'], [20, 'Monitor shipment', 'ETA, condition, notices?', 'Late reaction'],
  [21, 'Handle delays/events', 'Who pays? What does the contract say?', 'Uncontrolled losses'], [22, 'Complete delivery', 'Discharge, outturn, receipt?', 'Shortage claims'],
  [23, 'Receive payment', 'On time and in full?', 'Credit loss'], [24, 'Reconcile', 'All costs/invoices matched?', 'Hidden losses'], [25, 'Final P&L', 'What did we earn vs plan, and why?', 'No learning'],
])}
<h2>Back-to-back alignment</h2>
<p>When you buy from A and sell to B, mismatches between the two contracts create exposure: different quantity tolerances, inspection at loading vs discharge, different laytime terms, different laws/arbitration, different payment triggers. Align them — or price the gap.</p>
${N('', 'Practice it', 'Run a full deal in the Physical Trading Simulator. Each of the 25 steps asks for a decision. ' + go('physical/workflow', 'Open simulator'))}
` });

  L.push({ id: 'p-gold', track: 'gold', title: 'Physical gold trading — verification, pricing, delivery and compliance', mins: 40,
    summary: 'Buyer requirements, seller verification, due diligence, purity and assay, weight verification, pricing and premiums, secure transport, insurance, payment, custody, settlement and reconciliation.',
    objectives: ['Structure a physical gold transaction safely', 'Calculate invoice values from bar lists', 'Recognise fraud red flags'],
    body: `
<h2>Transaction structure</h2>
<ol><li><b>Buyer requirements</b>: product (e.g. 1 kg bars 999.9), accredited refiners accepted, quantity, delivery location (vault, airport), timing, payment method.</li>
<li><b>Seller verification and due diligence</b>: legal identity, beneficial owners, licences, source of metal (mine/refiner, responsible sourcing documentation), sanctions screening, bank references.</li>
<li><b>Purity and assay</b>: bars from accredited refiners carry refiner stamps, serial numbers and fineness; the bar list must match. For non-standard material, independent assay is required.</li>
<li><b>Weight verification</b>: bars are weighed at delivery; tolerances and rounding rules agreed.</li>
<li><b>Price quotation</b>: benchmark (spot or fixing) + premium/discount per fine oz, fixed at a defined time.</li>
<li><b>Delivery and secure transport</b>: specialised secure logistics, vault-to-vault or airport; risk transfer point defined.</li>
<li><b>Insurance</b>: in-transit and in-vault cover, insured value, exclusions.</li>
<li><b>Payment</b>: delivery-versus-payment where possible (simultaneous transfer of metal and money), or payment against vault receipt / release confirmation. Avoid unsecured advance payments to unknown parties.</li>
<li><b>Custody</b>: allocated storage with bar list; audit rights.</li>
<li><b>Settlement and reconciliation</b>: final weights × fineness × agreed price; reconcile bar list, invoice, vault receipt and payment.</li></ol>
<div class="numbox"><b>Numbers</b> ${SIM}<div>20 bars of 1 kg (999.9). Fine oz = 20 × 32.1507 × 0.9999 = 642.95 oz. Price = 2,000 spot + 1.50 premium = 2,001.50/oz. Invoice = 1,286,866 (rounded). Secure transport 0.05% and insurance 0.02% of value add 901.</div></div>
<h2>Commercial and compliance risks</h2>
<ul><li><b>Fraud</b>: fake or gold-plated bars, fake assay documents, advance-fee scams ("discounted gold from a mine, pay a fee first").</li><li><b>AML/sanctions</b>: illicit origin, sanctioned jurisdictions, cash payments.</li><li><b>Settlement risk</b>: paying before receiving title/metal.</li><li><b>Price risk</b>: between pricing and settlement — hedge with futures/forwards.</li><li><b>Custody risk</b>: unallocated vs allocated title confusion.</li></ul>
${N('bad', 'Red flags', 'Discounts to spot that are "too good", unverifiable refiners, documents only as scans, pressure to pay advance fees, payment to third-party accounts, refusal of independent inspection, unusual delivery locations.')}
${go('gold/cases', 'Gold practical cases')} ${go('physical/workflow', 'Run a gold deal')}
` });
  add('pg3', 'physical', 'p-gold', '50 bars of 1 kg at 999.9 fineness, priced at spot 2,050 + premium 1.20/oz. Invoice value (rounded)?', ['3,297,051', '3,297,700', '3,295,800', '102,500'], 0, 'Fine oz = 50 × 32.1507 × 0.9999 = 1,607.38. × 2,051.20 = 3,297,051.');

  L.push({ id: 'p-wheat', track: 'wheat', title: 'Physical wheat trading — from inquiry to discharge', mins: 45,
    summary: 'Inquiries, quantity and tolerance, origin and grade, protein and moisture, bulk shipment, ports, freight, insurance, inspection and sampling, certificates, contracts, scheduling, documents, payment, claims; delivered price calculation.',
    objectives: ['Calculate a delivered wheat price', 'Draft key contract terms', 'Handle quality and quantity claims'],
    body: `
<h2>Typical inquiry and offer</h2>
<p>A buyer (often a mill or state agency tender) asks for e.g. 55,000 t ± 10% at seller\'s option, milling wheat, protein min 12.5% (on a stated moisture basis), moisture max 13.5%, test weight min 78 kg/hl, falling number min 250 s, shipment in a stated window, CFR or CIF destination port, with inspection at loading by an agreed surveyor, phytosanitary certificate, certificate of origin, and payment by LC or CAD.</p>
<h2>Delivered price build-up</h2>
${T(['Layer', 'Example (USD/t)', 'Notes'], [['FOB origin', '232.00', 'Includes inland transport and loading at origin terminal'], ['+ Ocean freight', '24.00', 'Panamax/Supramax rate for the route'], ['= CFR destination', '256.00', ''], ['+ Insurance (0.08% × 110% CFR)', '0.23', ''], ['= CIF', '256.23', ''], ['+ Discharge, port dues, stevedoring', '7.50', ''], ['+ Import duty (e.g. 0%) / fees', '0.00', 'Country-specific'], ['+ Inland transport to mill', '11.00', ''], ['+ Financing (7% × 60 days)', '2.99', 'On CIF value'], ['= Delivered mill', '277.72', 'Per tonne, before trader margin'], ])}
<p>${SIM} Then compare with the price the mill pays (or the tender price) to see the margin. Use the ${go('physical/calculator', 'Deal Calculator')} to do this live.</p>
<h2>Inspection, sampling and certificates</h2>
<p>An independent surveyor samples during loading, seals reference samples and issues quality and weight certificates (often "final at loading" for quality and weight in CFR/CIF trades, but this must be stated). Phytosanitary certificates are issued by the exporting country\'s plant-protection authority; fumigation may be required.</p>
<h2>Claims and disputes</h2>
<p>Quality below spec → price allowances per contract scale or rejection if outside limits. Weight shortage beyond tolerance → claim against seller or carrier depending on cause. Grain contracts often incorporate trade association forms and arbitration rules (e.g. GAFTA-type contracts where incorporated).</p>
${go('wheat/cases', 'Wheat practical cases')}
` });

  L.push({ id: 'p-sugar', track: 'sugar', title: 'Physical sugar trading — comparing offers and executing', mins: 40,
    summary: 'Specs, quantity, origin, packaging, price, ports, shipment windows, inspection, certificates, freight, insurance, payment, delivery obligations, claims and settlement — and choosing the best commercially feasible offer.',
    objectives: ['Compare supplier offers on a risk-adjusted delivered basis', 'Specify sugar quality and packaging', 'Manage claims'],
    body: `
<h2>The three-party transaction</h2>
<p>A sugar supplier (mill/exporter) sells FOB or CFR to an international trader, who sells CFR/CIF or DAP to an industrial buyer (e.g. a beverage plant needing ICUMSA 45 refined sugar in 50 kg bags, or a refinery needing raw VHP in bulk).</p>
<h2>Comparing offers properly</h2>
<ol><li>Normalise to the <b>same delivery point and Incoterm</b> (add freight/insurance to FOB offers).</li><li>Adjust for <b>quality</b> (polarisation/colour premiums, packaging cost differences).</li><li>Adjust for <b>payment terms</b> (financing cost of earlier payment; credit risk of advance payments).</li><li>Add <b>risk adjustments</b>: probability × cost of delay, short shipment, quality failure.</li><li>Check <b>feasibility</b>: can the shipment window meet the buyer\'s need? Is the origin eligible for the buyer\'s quota or duty preference?</li></ol>
<div data-widget="offerCompare"></div>
<h2>Execution essentials</h2>
<ul><li>Specs: polarisation, ICUMSA colour, moisture, ash, granulometry; packaging (new PP bags with liners, marking) for whites.</li><li>Inspection at loading by named surveyor; analysis methods per ICUMSA.</li><li>Documents: invoice, B/L, certificates of quality/weight/origin, phytosanitary or health certificates if required, fumigation for bagged cargo where required, packing list for bagged goods.</li><li>Claims: wet damage, caking, bag damage, colour/moisture outside spec; settle by allowances per contract.</li></ul>
${go('sugar/cases', 'Sugar practical cases')}
` });
  add('ps2', 'physical', 'p-sugar', 'Supplier A offers refined sugar at 548 FOB with freight 42/t; Supplier B offers 586 CFR. Which is cheaper CFR, before risk adjustments?', ['A at 590', 'B at 586', 'They are equal', 'A at 548'], 1, 'A: 548 + 42 = 590 CFR; B: 586 CFR. B is 4/t cheaper delivered — always normalise to the same Incoterm.');
  add('ps3', 'physical', 'p-sugar', 'Why might an offer from a non-preferential origin be unusable even if it is the cheapest?', ['It never is', 'The destination may apply higher duties or quota rules by origin, so landed cost or eligibility changes', 'Sugar origins do not matter', 'Because freight is higher'], 1, 'Sugar is policy-heavy: tariff-rate quotas and preferential agreements depend on origin, proven by certificates of origin.');

  L.push({ id: 'p-steel', track: 'steel', title: 'Physical steel trading — mills, traders, distributors and project buyers', mins: 40,
    summary: 'Technical specs, quantity and tolerances, price, packaging and bundling, loading, shipment, inspection, certificates, freight, insurance, import duties, customs, delivery, quality disputes and payment.',
    objectives: ['Structure a steel import deal', 'Calculate landed cost with duties', 'Manage specification and quality disputes'],
    body: `
<h2>The participants</h2>
<p><b>Steel mill</b> (produces to order, minimum order quantities, rolling schedules) → <b>international trader</b> (aggregates orders, arranges shipping and finance) → <b>distributor/stockist</b> (holds local inventory, cuts and delivers) → <b>construction company / industrial buyer</b> (uses it for a project or production; needs certified material on schedule).</p>
<h2>Key terms in a steel contract</h2>
<ul><li>Product, standard, grade, sizes and size split (e.g. rebar 10–32 mm with % per diameter), lengths.</li><li>Quantity with tolerance (often ±10% at seller\'s option, and per size), theoretical vs actual weight basis.</li><li>Packaging: bundles of 2–5 t secured with wire, tags with heat numbers; coils with ID/OD and max weight; rust protection (oiled, wrapped).</li><li>Shipment: breakbulk or containers; loading/stowage (avoid wet damage, damage from improper lashing).</li><li>Inspection: pre-shipment by independent inspector; mill test certificates per heat.</li><li>Duties and customs: HS classification, origin, trade-remedy duties, import licences/quotas, product certification requirements in the destination.</li><li>Payment: LC at sight is common for international steel; distributors may buy on credit.</li></ul>
<div class="numbox"><b>Landed cost example</b> ${SIM}<div>Rebar 5,000 t at 560 FOB; freight 38/t; insurance 0.15% × 110% CFR; duty 5% on CIF; port & discharge 9/t; inland 12/t; financing 7% for 50 days on CIF. CFR 598; insurance 0.99; CIF 598.99; duty 29.95; port/inland 21; financing 5.82 → landed ≈ 655.76/t.</div></div>
<h2>Quality disputes</h2>
<p>Common issues: bent or rusted bars, dimensions out of tolerance, mechanical tests below spec, wrong size split, certificates not matching tags. Resolve with joint survey, lab tests, and the contract\'s claims procedure (time limits, independent inspection as final, allowances or replacement).</p>
${go('steel/cases', 'Steel practical cases')}
` });

  /* ============================================================ Stage 5 */
  L.push({ id: 't-contracts', track: 'finance', title: 'Contracts and trade documents', mins: 40,
    summary: 'Purchase and sales contracts, invoices, packing lists, certificates, bills of lading, warehouse receipts, insurance, phytosanitary, fumigation and customs documents — which are commodity-specific and which are transaction-dependent.',
    objectives: ['Know each document\'s purpose and issuer', 'Check consistency across documents', 'Avoid treating checklists as legally sufficient'],
    body: `
<h2>The contract comes first</h2>
<p>Every document obligation flows from the sales/purchase contract (and LC, if any). A good commodity contract specifies: parties, product and quality, quantity and tolerance, price and pricing mechanism, delivery term (Incoterm + named place + edition), shipment period, inspection and final certificates, documents to be presented, payment, insurance, force majeure, claims and time limits, governing law and dispute resolution.</p>
${T(['Document', 'Issued by', 'Purpose', 'Commodity-specific?'], [
  ['Pro forma invoice', 'Seller', 'Confirms offer details before shipment; used for LC/licence applications', 'No — general'], ['Commercial invoice', 'Seller', 'Payment demand; customs valuation', 'No — general'],
  ['Packing list', 'Seller', 'Contents of packages', 'Where goods are packed (bags, bundles, bars)'], ['Certificate of origin', 'Chamber of commerce / authority / exporter', 'Origin for duties, quotas, sanctions', 'Transaction-dependent'],
  ['Quality / analysis certificate', 'Independent surveyor or lab', 'Proves specification', 'Yes — parameters differ by commodity'], ['Inspection certificate', 'Independent inspector', 'Quality/quantity/condition at a stated point', 'Transaction-dependent'],
  ['Weight certificate', 'Surveyor (draft survey/scales)', 'Quantity basis for invoice', 'Bulk and breakbulk'], ['Bill of lading', 'Carrier / master / agent', 'Receipt, contract of carriage evidence, document of title (if negotiable)', 'General (sea)'],
  ['Charter-party B/L', 'Master/owner under a charter', 'B/L incorporating charter terms (bulk voyages)', 'Bulk cargoes'], ['Warehouse receipt', 'Warehouse operator', 'Evidence of goods stored; may transfer title/finance', 'Stored commodities'],
  ['Insurance certificate', 'Insurer / broker', 'Evidence of cargo cover', 'CIF/CIP or as agreed'], ['Phytosanitary certificate', 'Exporting country plant protection authority', 'Plant health compliance', 'Plant products (wheat, sometimes raw sugar) per importer rules'],
  ['Fumigation certificate', 'Fumigation company', 'Pest treatment record', 'Grain, bagged goods, wood packaging as required'], ['Mill test certificate', 'Steel mill', 'Chemistry & mechanical properties', 'Steel'],
  ['Assay certificate / bar list', 'Refiner / assayer', 'Fineness and weights', 'Gold'], ['Customs declaration', 'Declarant / broker', 'Export/import clearance', 'General, country-specific'],
])}
<h2>Consistency is everything</h2>
<p>Descriptions, quantities, weights, marks, vessel names, ports, dates and parties must be consistent across documents and with the LC. A single inconsistency can delay payment or clearance.</p>
${N('warn', 'Not legal advice', 'Document requirements depend on the commodity, the contract, the LC, origin and destination regulations, the carrier and the bank. The academy\'s checklists are teaching tools, not a statement of legal sufficiency.')}
${go('finance/library', 'Document library')} ${go('finance/checklist', 'Checklist builder')}
` });

  L.push({ id: 't-payments', track: 'finance', title: 'Payment methods and bank instruments', mins: 35,
    summary: 'Advance payment, open account, cash against documents, documentary collections, letters of credit, standby LCs and guarantees; commercial vs documentary vs bank obligations.',
    objectives: ['Rank payment methods by risk for each party', 'Distinguish commercial, documentary and bank obligations', 'Choose payment security for a deal'],
    body: `
${T(['Method', 'How it works', 'Seller risk', 'Buyer risk', 'Cost/complexity'], [
  ['Advance payment', 'Buyer pays before shipment (fully or partly)', 'Lowest', 'Highest (non-delivery)', 'Low; buyer may require an advance payment guarantee'],
  ['Letter of credit (confirmed)', 'Issuing bank + confirming bank undertake to pay against complying documents', 'Low (documentary risk remains)', 'Pays only against documents, not goods', 'Higher fees; strict document handling'],
  ['Letter of credit (unconfirmed)', 'Issuing bank undertakes', 'Issuing-bank and country risk', 'Same', 'Moderate'],
  ['Documentary collection (D/P, CAD)', 'Banks release documents against payment (or acceptance for D/A); no bank undertaking', 'Buyer may refuse documents; goods stranded abroad', 'Pays before inspecting goods', 'Low'],
  ['Open account', 'Seller ships and invoices; buyer pays later', 'Highest (credit)', 'Lowest', 'Lowest; often with credit insurance'],
])}
<h2>Three kinds of obligation</h2>
<ul><li><b>Commercial obligation</b>: under the sales contract — deliver conforming goods, pay the price.</li><li><b>Documentary obligation</b>: present specified documents that comply with the contract/LC.</li><li><b>Bank\'s independent undertaking</b>: under an LC or guarantee, the bank must pay against a complying presentation (or demand), independently of disputes about the goods — subject to fraud exceptions under applicable law.</li></ul>
<p>This independence is why sellers love LCs — and why document accuracy matters so much.</p>
<h2>Standby LCs and guarantees</h2>
<p>An SBLC or demand guarantee secures an obligation and is drawn only if the applicant fails (e.g. buyer does not pay open-account invoices; seller does not perform). Common types: payment guarantee, performance bond, advance-payment guarantee. Standbys are often subject to ISP98 or UCP 600; guarantees to URDG 758 — when the instrument incorporates them.</p>
` });

  L.push({ id: 't-lc', track: 'finance', title: 'Letters of credit and UCP 600', mins: 45,
    summary: 'Parties, steps, examination, discrepancies, presentation periods, expiry, sight vs deferred payment, reimbursement and documentary compliance.',
    objectives: ['Walk through an LC transaction', 'Identify discrepancies', 'Apply key UCP 600 timing rules'],
    body: `
<h2>Parties</h2>
${T(['Party', 'Role'], [['Applicant', 'Buyer who asks its bank to issue the credit'], ['Beneficiary', 'Seller who will be paid'], ['Issuing bank', 'Issues the credit and undertakes to honour a complying presentation'], ['Advising bank', 'Authenticates and advises the credit to the beneficiary; no payment undertaking by itself'], ['Confirming bank', 'Adds its own undertaking (removes issuing bank/country risk for the seller)'], ['Nominated bank', 'Bank authorised to honour or negotiate'], ['Reimbursing bank', 'Pays the claiming bank on the issuing bank\'s behalf, if provided']])}
<h2>Steps</h2>
<ol><li>Sales contract specifies payment by LC and its terms.</li><li>Buyer applies; issuing bank issues the LC (usually via SWIFT MT700) subject to UCP 600.</li><li>Advising (and confirming) bank advises the seller. <b>Seller checks the LC immediately</b> and requests amendments for anything it cannot comply with.</li><li>Seller ships and prepares documents.</li><li>Presentation to the nominated/confirming bank within the presentation period and before expiry.</li><li>Banks examine documents (max five banking days following presentation).</li><li>If complying: honour (sight payment, deferred payment, acceptance) or negotiation. If discrepant: refusal notice, or the applicant may waive.</li><li>Issuing bank reimburses; buyer pays its bank and gets documents to take delivery.</li></ol>
<h2>Key UCP 600 rules (summary)</h2>
<ul><li>Applies only when the credit expressly states it is subject to UCP 600 (art. 1).</li><li>Credits are irrevocable (art. 3); banks deal with documents, not goods (art. 5).</li><li>Examination: max 5 banking days following presentation (art. 14b).</li><li>Transport documents with original copies: present no later than 21 calendar days after shipment if the LC is silent, and not later than expiry (art. 14c).</li><li>Data in a document need not be identical to, but must not conflict with, data in other documents or the credit (art. 14d).</li><li>The invoice description must correspond with the credit (art. 18c); other documents may describe goods in general terms not conflicting with the credit (art. 14e).</li><li>"About"/"approximately" allows ±10% on amount, quantity or unit price (art. 30a); for goods not in packing units/items, ±5% quantity tolerance if the amount is not exceeded (art. 30b).</li></ul>
<h2>Common discrepancies</h2>
<p>Late shipment, late presentation, expired credit, invoice amount above credit, description mismatch, B/L not "clean" or not "on board", wrong consignee/notify party, missing endorsements, insurance cover less than required or dated after shipment, certificate issued by the wrong party, inconsistent weights between invoice and weight certificate.</p>
${N('', 'Practice', 'Find the discrepancies in a simulated LC presentation. ' + go('finance/lc', 'LC discrepancy exercise'))}
` });

  L.push({ id: 't-incoterms', track: 'incoterms', title: 'Incoterms 2020 for commodity trades', mins: 45,
    summary: 'All eleven rules: delivery point, risk transfer, costs, insurance and clearance; sea-only vs any-mode; how to choose and what Incoterms do not cover.',
    objectives: ['Allocate costs and risks under each rule', 'Choose rules suited to bulk vs containers', 'Avoid common Incoterm errors'],
    body: `
<p>Incoterms® rules are published by the International Chamber of Commerce. They define <b>delivery</b> (when the seller has done its job), <b>risk transfer</b>, <b>cost allocation</b>, and <b>export/import clearance</b> duties. They do <b>not</b> define title transfer, payment, or the price, and apply only if the contract incorporates them (e.g. "CIF Alexandria, Incoterms® 2020").</p>
<h2>Two families</h2>
<p><b>Any mode of transport</b>: EXW, FCA, CPT, CIP, DAP, DPU, DDP. <b>Sea and inland waterway only</b>: FAS, FOB, CFR, CIF.</p>
<div data-widget="incotermMini"></div>
<h2>Commodity practice</h2>
<ul><li>Bulk grain and raw sugar: FOB, CFR, CIF dominate. With FOB, the buyer charters the vessel and nominates it; the seller loads within the loading window.</li><li>Containerised cargo (bagged sugar, some steel): FCA, CPT, CIP fit better, because the seller hands over to the carrier at a terminal before loading.</li><li>Under CFR/CIF the seller pays freight to destination but risk passes on loading: the buyer bears transit risk.</li><li>CIF minimum insurance is ICC (C) 110%; CIP is ICC (A) 110% in the 2020 rules.</li><li>DDP requires the seller to clear imports and pay duties in the buyer\'s country — risky for foreign sellers.</li></ul>
${go('finance/incoterms', 'Incoterms comparison tool')}
` });

  L.push({ id: 'l-shipping', track: 'logistics', title: 'Shipping — vessels, freight, chartering, laytime and demurrage', mins: 45,
    summary: 'Bulk carriers, containers, tankers, breakbulk, freight quotes, chartering basics, DWT, freight per tonne, load/discharge rates, laytime, demurrage, despatch and congestion.',
    objectives: ['Choose the right shipping mode per commodity', 'Calculate laytime and demurrage', 'Read basic charter terms'],
    body: `
${T(['Mode', 'Typical commodities', 'Notes'], [['Dry bulk carriers (Handysize ~15–40k DWT, Supramax/Ultramax ~50–65k, Panamax/Kamsarmax ~65–85k, Capesize 100k+)', 'Grain, raw sugar, iron ore, coal, scrap', 'Voyage or time charter; freight per tonne'], ['Container ships', 'Bagged refined sugar, coils/bars in some trades, specialty grains', 'Per box rates; door-to-door; FCA/CPT/CIP terms'], ['Breakbulk / general cargo', 'Steel coils, plates, bundles of rebar, sections', 'Lashing, dunnage, rust protection'], ['Tankers', 'Liquid commodities (molasses, ethanol, oils)', 'Not used for our four core products, except molasses/ethanol by-products'], ['Air freight (secure)', 'Gold', 'High value density; specialised carriers and insurance']])}
<h2>Chartering basics</h2>
<p><b>Voyage charter</b>: owner carries a cargo from A to B for freight per tonne; laytime/demurrage apply. <b>Time charter</b>: charterer hires a ship for a period at a daily rate and pays fuel/port costs. The <b>charter party</b> sets laycan (the window for the vessel to arrive), load/discharge rates, laytime terms (e.g. SHINC/SHEX), demurrage and despatch rates.</p>
<h2>Laytime and demurrage</h2>
<p>Laytime allowed = quantity ÷ agreed rate (t/day), adjusted for excepted periods (weekends/holidays if SHEX, bad weather). If time used exceeds laytime, the charterer pays <b>demurrage</b> per day; if faster, the owner may pay <b>despatch</b> (often half the demurrage rate). Through sale contracts, traders pass these terms to suppliers and buyers — mismatches create exposure.</p>
<div data-widget="laytimeMini"></div>
${go('logistics/calculator', 'Shipping calculator')} ${go('logistics/disruptions', 'Disruption scenarios')}
` });

  L.push({ id: 'l-operations', track: 'logistics', title: 'Cargo operations — insurance, claims, warehousing, customs and inspection', mins: 35,
    summary: 'Cargo insurance and marine claims, warehousing and storage costs, inland transport, customs clearance, tracking and inspection — and why commodities need different handling.',
    objectives: ['Handle a cargo claim properly', 'Estimate storage costs', 'Explain handling differences between commodities'],
    body: `
<h2>Why handling differs</h2>
${T(['Commodity', 'Handling needs', 'Main physical risks'], [['Gold', 'Vaults, armoured/secure transport, air freight, strict chain of custody', 'Theft, fraud, substitution'], ['Wheat', 'Dry bulk holds, fumigation, aeration in storage, clean holds certification', 'Heating, moisture, insects, contamination'], ['Sugar', 'Raw: dry bulk storage; refined: food-grade bags/containers, dry, clean', 'Moisture (caking), contamination, bag damage'], ['Steel', 'Cranes, lashing, dunnage, covered storage, rust protection', 'Wet damage/rust, deformation, handling damage']])}
<h2>Insurance and claims</h2>
<p>Cargo insurance protects against physical loss/damage within policy terms. On loss: notify insurers and carriers promptly, note protest, appoint surveyors, preserve evidence, keep documents (B/L, survey reports, photos), and respect time bars. Carrier liability is limited under applicable conventions and contract terms; insurers may recover from carriers (subrogation).</p>
<h2>Warehousing</h2>
<p>Storage cost (per tonne per month), handling in/out, insurance and shrink. Warehouse receipts must be from reputable operators; financing banks often use collateral managers. Monitor ageing and quality.</p>
<h2>Customs and tracking</h2>
<p>Customs clearance requires correct HS classification, valuation, origin, licences and payment of duties/taxes; brokers prepare declarations. Shipment tracking uses vessel AIS data and agents\' reports; plan for ETA changes and pass notices on to buyers per contract.</p>
` });

  /* ============================================================ Stage 6 */
  L.push({ id: 'd-futures', track: 'derivatives', title: 'Futures mechanics — specs, ticks, margin, MTM, expiry and rollover', mins: 45,
    summary: 'Contract specifications, multipliers, tick sizes and values, initial and maintenance margin, mark-to-market, expiration, rollovers, leverage, long and short, hedging and speculation.',
    objectives: ['Convert price moves into P&L using multipliers', 'Run margin and margin-call calculations', 'Understand roll and expiry'],
    body: `
<h2>Illustrative specifications ${ILLU}</h2>
<p>The specs below reflect commonly published contract designs for teaching. <b>Always verify with the exchange\'s current rulebook</b> — specs, margins and dates change. You can edit them in Settings.</p>
<div data-widget="specTable"></div>
<h2>From price to money</h2>
<p>P&L = (exit − entry) × multiplier × contracts × (+1 long / −1 short). Tick value = tick size × multiplier. Watch units: wheat is quoted in cents/bushel, raw sugar in cents/lb — convert cents to dollars before multiplying.</p>
<div class="numbox"><b>Numbers</b> ${SIM}<div>Long 4 raw sugar contracts (112,000 lb) at 19.40 c/lb, sell at 19.85 c/lb: 0.45 c × 112,000 lb = 504 USD per contract × 4 = 2,016 USD.</div></div>
<h2>Margin and mark-to-market</h2>
<p>Initial margin is posted to open; every day positions are marked to the settlement price and gains/losses paid in cash (variation margin). If equity falls below maintenance margin, a margin call requires restoring it (usually to initial margin) — or the broker may liquidate. Leverage = notional ÷ equity; losses can exceed initial margin.</p>
<h2>Expiry and rollover</h2>
<p>Each contract month has a last trading day (and for delivered contracts, notice/delivery periods). Hedgers and speculators who want to keep exposure <b>roll</b>: close the expiring month and open a later one. The roll price difference (the calendar spread) is a gain or cost depending on curve shape.</p>
${go('futures/trade', 'Open the futures simulator')}
` });

  L.push({ id: 'd-hedging', track: 'derivatives', title: 'Hedging physical exposure and basis risk', mins: 45,
    summary: 'Short and long hedges, producer and mill hedging, hedging inventory and future purchases, hedge ratios, basis, basis risk, cross-hedging, liquidity effects.',
    objectives: ['Design a hedge for a physical exposure', 'Calculate hedge outcomes including basis', 'Explain residual and new risks'],
    body: `
<h2>Which side?</h2>
${T(['Exposure', 'Risk', 'Hedge'], [['Own inventory / will produce', 'Price falls', 'Short hedge: sell futures (or buy puts)'], ['Must buy later / sold forward at fixed price without supply', 'Price rises', 'Long hedge: buy futures (or buy calls)'], ['Fixed-price purchase and fixed-price sale matched', 'Little flat-price risk', 'No flat-price hedge; manage basis/timing']])}
<h2>Basis and basis risk</h2>
<p>Basis = local cash price − futures price. A hedger locks in the futures level, so the result depends on the basis when the hedge is lifted. <b>Basis risk</b> arises because location, quality, timing and local supply-demand affect the physical price differently from the futures. Cross-hedging (e.g. hedging non-US wheat with a US contract, or a regional steel product with a different benchmark) increases basis risk.</p>
<div data-widget="hedgeDemo"></div>
<h2>Mill and producer examples</h2>
<p><b>Mill</b>: holds 20,000 t wheat inventory valued off the market; sells futures equivalent to tonnage (convert tonnes to bushels: 1 t = 36.74 bu). If wheat prices fall, the inventory loses value but the short futures gain. <b>Producer</b>: sells futures before harvest to lock a price for part of expected output; keeps some unhedged because yield is uncertain (over-hedging a crop that fails is dangerous).</p>
<h2>A hedge reduces some risks but keeps or creates others</h2>
<ul><li><b>Remaining</b>: basis risk, quantity risk (volume uncertainty), quality risk, counterparty risk on the physical contract.</li><li><b>Created</b>: liquidity risk (margin calls on the futures leg while the physical gain is unrealised), operational risk (roll errors), and possibly accounting volatility.</li></ul>
` });

  L.push({ id: 'd-options', track: 'options', title: 'Options — calls, puts, value, volatility and Greeks', mins: 50,
    summary: 'Calls, puts, strikes, expiry, premium, intrinsic and time value, implied volatility, delta, gamma, theta and vega with a simplified Black-76 model and its limitations.',
    objectives: ['Price simple options with Black-76', 'Interpret Greeks', 'Choose option hedges'],
    body: `
<h2>Building blocks</h2>
<ul><li><b>Call</b>: right to buy the underlying (futures) at the <b>strike</b>; <b>put</b>: right to sell.</li><li><b>Premium</b> = intrinsic value + time value. Intrinsic = max(F−K, 0) for calls; max(K−F, 0) for puts.</li><li><b>Expiration</b>: after expiry the option is exercised (if in the money) or worthless.</li><li>Buyers: limited loss (premium), potentially large gain. Sellers: receive premium, potentially large loss; post margin.</li></ul>
<h2>Implied volatility</h2>
<p>Volatility is the main unknown input. Implied volatility (IV) is the volatility that makes the model price equal the market price; it reflects the market\'s view of future uncertainty and supply-demand for options. Commodity IV often rises around reports, weather risk and supply shocks.</p>
<h2>Greeks</h2>
${T(['Greek', 'Measures', 'Rule of thumb'], [['Delta', 'Price change per 1 unit move in futures', 'Call 0 to 1, put −1 to 0; ATM ≈ ±0.5'], ['Gamma', 'Change of delta per 1 unit move', 'Highest for ATM near expiry'], ['Theta', 'Value change per day', 'Negative for long options; accelerates near expiry'], ['Vega', 'Value change per 1 vol point', 'Highest for longer-dated ATM options']])}
<div data-widget="optionPayoff"></div>
<h2>Model limitations</h2>
<p>The academy uses Black-76 (European options on futures, constant volatility, lognormal prices, no jumps, continuous trading). Real commodity options are often American-style, have volatility smiles/skews, jump risk around reports and weather, and early-exercise features. Treat model values as educational approximations.</p>
${go('futures/options', 'Options simulator')}
` });

  L.push({ id: 'd-spreads', track: 'spreads', title: 'Spreads, basis and arbitrage', mins: 50,
    summary: 'Geographic arbitrage, time/calendar spreads, quality and processing spreads, physical and futures basis, freight arbitrage, currency-adjusted comparisons, refining and storage economics, carry and financing, delivery constraints.',
    objectives: ['Evaluate an apparent arbitrage after all costs', 'Price carry and calendar spreads', 'Analyse processing margins'],
    body: `
<h2>Types of spreads</h2>
${T(['Spread', 'Definition', 'Example'], [['Geographic (location)', 'Price at B − price at A', 'Wheat CFR Egypt vs FOB Black Sea'], ['Time / calendar', 'Deferred − nearby month', 'Gold Dec vs Jun; wheat Jul vs Sep'], ['Quality', 'Grade A − grade B', 'High-protein vs standard wheat; white vs raw sugar'], ['Processing', 'Output value − input cost', 'Refining margin; steel spread over ore & coal'], ['Physical basis', 'Local cash − futures', 'Elevator bid − nearby futures'], ['Freight arbitrage', 'Delivered-price difference driven by freight', 'Australia vs Black Sea into SE Asia'], ['Currency-adjusted', 'Prices converted to one currency', 'EUR-priced vs USD-priced offers']])}
<h2>Why a price gap is not automatically arbitrage</h2>
<p>True arbitrage is riskless after costs. In commodities you face freight, insurance, duties, handling, financing for the voyage/storage period, quality differences, delivery timing mismatches, currency moves, execution risk (vessel availability, port constraints), counterparty risk and regulatory constraints. Most apparent gaps are explained by these.</p>
<h2>Carry and storage economics</h2>
<p>Full carry: deferred price ≈ spot + storage + insurance + financing − any income (e.g. lease rate). If the futures spread exceeds full carry, a trader can buy spot, store and sell deferred (cash-and-carry). If the spread is far below full carry (or inverted), the market pays to release stocks now.</p>
<div data-widget="carryCalc"></div>
${go('analysis/spreads', 'Spread & arbitrage calculator + 10 exercises')}
` });

  /* ============================================================ Stage 7 */
  L.push({ id: 'a-fundamental', track: 'analysis', title: 'Fundamental analysis for commodities', mins: 35,
    summary: 'Supply and demand, production, consumption, trade, inventories, costs, seasonality, weather, policy, freight, currencies and industrial demand — building simple balances.',
    objectives: ['Build and stress a simple balance', 'Distinguish levels from surprises', 'Combine drivers into a market view'],
    body: `
<h2>The fundamental workflow</h2>
<ol><li>Build the balance: stocks, production, imports, consumption, exports (by country and for the world/exporters).</li><li>Assess drivers for each line: weather/yield (production), income/population/substitution (consumption), policy (trade), currency and freight (competitiveness).</li><li>Compare with consensus and reports; identify where you differ and why.</li><li>Translate into price implications cautiously — e.g. through stocks-to-use relationships — and define what would prove you wrong.</li><li>Monitor: crop conditions, export inspections, tenders, mill utilisation, inventories, policy announcements.</li></ol>
<h2>Commodity-specific indicators</h2>
${T(['Commodity', 'Leading fundamentals'], [['Gold', 'Real rates, USD, central-bank buying, ETF flows, jewellery demand, positioning'], ['Wheat', 'Crop conditions, weather, export availability, tenders, stocks-to-use, freight, FX of exporters'], ['Sugar', 'Cane crush and sugar mix, monsoon, ethanol parity, policy (export quotas), white premium'], ['Steel', 'Construction and manufacturing PMIs, mill utilisation, inventories at distributors, raw-material costs, trade policy']])}
${go('analysis/fundamental', 'Supply & demand builder')}
` });

  L.push({ id: 'a-technical', track: 'analysis', title: 'Technical analysis — descriptive tools, not guarantees', mins: 40,
    summary: 'Candlesticks, trend, support/resistance, moving averages, RSI, MACD, volatility, volume, breakouts and false breakouts, momentum and risk-reward.',
    objectives: ['Read candlestick charts and indicators', 'Understand what indicators describe', 'Use risk-reward properly'],
    body: `
<h2>What technical analysis is</h2>
<p>Technical analysis studies price, volume and positioning patterns. Indicators are transformations of past prices: they <b>describe</b> trend, momentum and volatility; they do not predict with certainty. Use them for timing and risk management alongside fundamentals, and test any rule honestly (including costs) before trusting it.</p>
${T(['Tool', 'Describes', 'Typical use', 'Pitfall'], [['Candlesticks', 'Open-high-low-close per period', 'Reading momentum & rejection', 'Patterns are noisy'], ['Trend lines / higher highs-lows', 'Direction', 'Trade with the trend', 'Subjective drawing'], ['Support / resistance', 'Areas where buying/selling emerged before', 'Entries, stops, targets', 'Levels break'], ['Moving averages (SMA/EMA)', 'Smoothed trend', 'Crossovers, trend filter', 'Lag; whipsaws in ranges'], ['RSI (14)', 'Momentum (0–100)', '>70 "overbought", <30 "oversold"', 'Can stay extreme in trends'], ['MACD', 'Trend/momentum via EMA difference', 'Signal-line crosses, divergence', 'Lag, false signals'], ['Bollinger Bands', 'Volatility envelope', 'Volatility squeeze/expansion', 'Bands are not barriers'], ['Volume', 'Participation', 'Confirm breakouts', 'Futures volume concentrates in front months'], ['Breakout / false breakout', 'Exit from a range', 'Momentum entries', 'Many breakouts fail']])}
<h2>Risk-to-reward</h2>
<p>Risk:reward = (entry − stop) : (target − entry). A 1:3 trade needs only >25% win rate to break even before costs, but the probability of reaching the target is the real question. Position size from the stop distance, not from conviction.</p>
${go('analysis/technical', 'Technical analysis lab')}
` });

  L.push({ id: 'a-quant', track: 'quant', title: 'Quantitative methods — returns, volatility, correlation and regression', mins: 45,
    summary: 'Mean, variance, standard deviation, returns and log returns, volatility, rolling statistics, correlation, regression, time series, drawdown, scenario and sensitivity analysis.',
    objectives: ['Compute and annualise volatility', 'Interpret correlation and regression', 'Know the assumptions behind them'],
    body: `
<h2>Core statistics</h2>
<ul><li><b>Simple return</b> r = P1/P0 − 1; <b>log return</b> = ln(P1/P0) (time-additive).</li><li><b>Mean</b> and <b>variance</b>/<b>standard deviation</b> of returns; sample statistics use n − 1.</li><li><b>Annualised volatility</b> ≈ daily standard deviation × √252 (assumes independent, identically distributed returns).</li><li><b>Rolling</b> averages/volatility reveal regime changes.</li><li><b>Correlation</b> (−1…+1) measures linear co-movement; <b>regression</b> y = a + b·x estimates sensitivity (beta) and R² (share of variance explained). Hedge ratio by regression: minimum-variance ratio = ρ × σspot/σfutures.</li><li><b>Drawdown</b>: fall from a running peak; max drawdown measures pain.</li></ul>
<h2>Scenario and sensitivity analysis</h2>
<p>Sensitivity analysis changes one input at a time (e.g. freight ±10%) to see which drives profit most; scenario analysis changes several consistently (e.g. drought: price +15%, freight +20%, delays +10 days).</p>
<h2>Assumptions and weaknesses</h2>
<p>Returns are not normal (fat tails, jumps), volatility clusters, correlations break down in stress, and samples may not represent the future. Regression relationships can be spurious, especially with trending price levels — work with returns.</p>
${go('quant/stats', 'Quant lab')}
` });

  L.push({ id: 'a-risk-models', track: 'quant', title: 'Risk models — Monte Carlo, VaR, Expected Shortfall and diversification', mins: 45,
    summary: 'Monte Carlo simulation, historical and parametric VaR, Expected Shortfall, portfolio diversification and model risk.',
    objectives: ['Compute VaR three ways', 'Explain ES and why it matters', 'Use diversification maths'],
    body: `
<h2>Value at Risk</h2>
<p>VaR(confidence c, horizon h) is the loss threshold exceeded with probability (1 − c) under the model. <b>Historical VaR</b> uses the empirical return distribution; <b>parametric VaR</b> assumes normality (VaR ≈ z·σ − μ, times position value); <b>Monte Carlo VaR</b> simulates paths from an assumed model.</p>
<h2>Expected Shortfall</h2>
<p>ES = average loss beyond VaR. It describes tail severity, which VaR ignores. Two portfolios can have the same VaR but very different ES.</p>
<h2>Monte Carlo</h2>
<p>Simulate many price paths (e.g. geometric Brownian motion with chosen drift and volatility), compute the outcome for each (P&L, margin need, inventory value), and read the distribution. Outputs are only as good as the model: if jumps or regime changes are missing, tail risk is understated.</p>
<h2>Diversification</h2>
<p>Portfolio σ = √(wᵀΣw). With correlations below 1, total risk is less than the sum. But correlations rise in crises, so diversification benefits shrink precisely when needed.</p>
${N('warn', 'Models are not forecasts', 'Use VaR/ES/Monte Carlo as one input. Complement with stress tests built from plausible combined shocks, and with limits on exposures, concentrations and liquidity.')}
${go('quant/var', 'VaR & Monte Carlo lab')}
` });

  /* ============================================================ Stage 8 */
  L.push({ id: 'r-framework', track: 'risk', title: 'Risk management framework for trading businesses', mins: 45,
    summary: 'Price, basis, currency, counterparty, credit, liquidity, financing, operational, documentation, quality, delivery, shipping, legal, regulatory, fraud and concentration risk; risk registers and governance.',
    objectives: ['Classify deal risks completely', 'Build a risk register entry', 'Assign owners and contingencies'],
    body: `
${T(['Risk', 'Example', 'Mitigants'], [
  ['Price', 'Unhedged inventory falls 10%', 'Hedging, limits, fast back-to-back'], ['Basis', 'Local premium collapses vs futures', 'Basis limits, careful benchmark choice'], ['Currency', 'EUR sale, USD purchase', 'FX forwards, same-currency contracts'],
  ['Counterparty / credit', 'Buyer defaults', 'LCs, credit insurance, limits, KYC'], ['Liquidity', 'Margin calls on hedges', 'Committed lines, liquidity reserve'], ['Financing', 'Bank cuts lines', 'Diversified banks, committed facilities'],
  ['Operational', 'Wrong payment instructions', 'Call-back verification, four-eyes'], ['Documentation', 'LC discrepancy', 'Checklists, early LC review'], ['Quality', 'Protein below spec', 'Inspection, contract allowances'],
  ['Delivery', 'Supplier ships late', 'Penalties, reliable suppliers, buffers'], ['Shipping', 'Congestion, damage', 'Laytime terms, insurance, route choice'], ['Legal', 'Unenforceable contract', 'Standard forms, counsel'],
  ['Regulatory', 'Sanctions, export bans', 'Screening, policy monitoring, force majeure clauses'], ['Fraud', 'Fake warehouse receipts', 'Collateral managers, verification'], ['Concentration', 'One buyer = 60% of receivables', 'Counterparty limits, diversification'],
])}
<h2>A risk register entry</h2>
<p>For each risk: description, cause, probability (1–5), financial impact (amount or 1–5), mitigation, residual exposure, responsible owner and contingency plan. Expected loss ≈ probability × impact; prioritise high-impact risks even if unlikely.</p>
${go('risk/register', 'Risk register & dashboard')}
` });

  L.push({ id: 'r-limits', track: 'risk', title: 'Limits, sizing, stress testing and liquidity', mins: 40,
    summary: 'Stop-loss concepts, position sizing, exposure and counterparty limits, diversification, stress tests and scenario analysis, hedging limits and liquidity reserves.',
    objectives: ['Size positions from risk budgets', 'Design combined stress tests', 'Plan liquidity reserves'],
    body: `
<h2>Position sizing</h2>
<p>Contracts = floor( equity × risk% ÷ (|entry − stop| × multiplier) ). Never let one trade risk more than a small share of capital (e.g. 0.5–2% in speculative books).</p>
<h2>Limits</h2>
<ul><li><b>Exposure limits</b>: max net tonnes/ounces per commodity, per tenor.</li><li><b>Stop-loss limits</b>: desk/trader loss triggers for review or reduction.</li><li><b>Counterparty limits</b>: max unsecured exposure per counterparty/country, based on credit assessment.</li><li><b>Concentration limits</b>: by supplier, route, bank, warehouse.</li><li><b>Liquidity limits</b>: minimum cash/undrawn facilities versus stressed outflows (margin calls, supplier payments).</li></ul>
<h2>Stress testing combined shocks</h2>
<p>Example: a trader buys 5,000 t of wheat; the market falls 8%, freight rises 15%, the vessel is delayed 12 days and the buyer asks for 60 extra days to pay. Losses add up from price, freight, demurrage and financing — and the cash need peaks at the same time.</p>
${go('risk/stress', 'Run the combined stress test')}
` });

  L.push({ id: 'n-negotiation', track: 'negotiation', title: 'Commercial negotiation of complete deals', mins: 40,
    summary: 'Preparing with BATNA and reservation prices, negotiating price and non-price terms, reading counterparty styles, trading concessions and evaluating the whole deal.',
    objectives: ['Prepare a negotiation plan', 'Trade low-cost for high-value concessions', 'Evaluate profitability, risk and cash together'],
    body: `
<h2>Preparation</h2>
<ul><li><b>Objectives and limits</b>: target and walk-away (reservation) prices; acceptable payment terms; minimum inspection rights.</li><li><b>BATNA</b>: your best alternative if this deal fails (another supplier/buyer, waiting). Estimate theirs.</li><li><b>Issues and priorities</b>: price, quantity, quality, shipment window, delivery term, payment, inspection, penalties, tolerance, dispute resolution, duration.</li><li><b>Counterparty profile</b>: price sensitivity, reliability, financial strength, flexibility, style.</li></ul>
<h2>During the negotiation</h2>
<ul><li>Anchor credibly with justification (market references, costs).</li><li>Trade concessions: give what is cheap for you and valuable for them (e.g. shipment flexibility) in return for what is valuable to you (e.g. LC at sight).</li><li>Package offers rather than conceding issue by issue.</li><li>Keep a full-deal calculator: every term changes profit, risk or cash.</li><li>Close with clear written terms; ambiguity becomes disputes.</li></ul>
<h2>Evaluating the result</h2>
<p>Profitability (net margin and ROIC), risk allocation (who bears quality, delay, credit risk), cash flow (days to collection), contractual clarity (all key terms specified), supplier reliability, buyer creditworthiness and execution feasibility.</p>
${go('dealroom', 'Enter the Deal Room')}
` });
})();
