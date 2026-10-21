/* Practical cases — 10 per commodity. All companies, prices and events are SIMULATED.
 * Step types:  num    → numerical answer checked with tolerance, worked solution shown
 *              choice → decision with scored options; every option's consequence is revealed after answering */
(function () {
  const CTA = window.CTA, C = window.CALC;
  const f = (n, d = 2) => CTA.fmt.num(n, d);
  const CASES = (CTA.CASES = []);
  const kc = (o) => CASES.push(o);
  const FO = (kg, fin) => C.fineOunces(kg, 'kg', fin == null ? 0.9999 : fin);

  /* =========================================================== GOLD */
  (() => {
    const oz = FO(10), buy = oz * 2001, sell = oz * 2006, costs = buy * 0.0007, net = sell - buy - costs;
    kc({ id: 'gc1', commodity: 'gold', title: 'Buying physical gold for resale', brief: 'Buy ten kilobars from a refiner and resell to a jewellery manufacturer — is it worth it and how do you protect the margin?',
      context: 'Aurum Trading DMCC (fictional) can buy 10 × 1 kg 999.9 bars from an accredited refiner at spot + 1.00/oz, delivered to its vault. A jewellery manufacturer will buy them at spot + 6.00/oz in two weeks. Secure transport and insurance cost 0.07% of the purchase value. Spot today: 2,000/oz.',
      data: [['Bars', '10 × 1 kg, 999.9'], ['Buy price', 'spot + 1.00 /oz'], ['Sell price', 'spot + 6.00 /oz'], ['Spot (both dates, for this step)', '2,000'], ['Logistics & insurance', '0.07% of purchase value']],
      steps: [
        { type: 'num', q: 'Net profit if spot is unchanged at 2,000 on both dates (USD)?', ans: net, tol: 2, unit: 'USD', work: [`Fine oz = 10 × 32.1507 × 0.9999 = ${f(oz, 3)}`, `Purchase = ${f(oz, 3)} × 2,001 = ${f(buy)}`, `Sale = ${f(oz, 3)} × 2,006 = ${f(sell)}`, `Costs = 0.07% × purchase = ${f(costs)}`, `Net = ${f(net)}`] },
        { type: 'choice', q: 'Between purchase and resale (two weeks) the price can move. What do you do?', opts: [
          ['Sell ~3 gold futures (≈ 321 oz) when buying and buy them back when the jeweller prices', 100, 'Correct: you are long 321 oz for two weeks. A short futures hedge locks the spot level so the margin is the premium spread (5/oz) minus costs; the residual is basis and a ~0.5% size mismatch.'],
          ['Do nothing — gold usually rises', 20, 'Speculative. A 1% fall (≈20/oz) would cost ~6,400, five times the expected profit.'],
          ['Ask the jeweller to price on the purchase date (back-to-back pricing)', 90, 'Also excellent if the jeweller accepts: both legs fixed at the same spot removes price risk without futures. Check the jeweller\'s credit risk for two weeks.'],
          ['Buy 3 more futures to increase exposure', 0, 'This doubles your long position — the opposite of hedging.']] },
      ], solution: `The trade earns the premium spread of 5/oz on ${f(oz, 2)} fine oz = ${f(oz * 5)} less costs ${f(costs)} = ${f(net)}. It is small relative to the ~643,000 at risk, so price risk must be hedged (futures) or eliminated (back-to-back pricing).`, skills: ['gold', 'physical', 'derivatives'] });
  })();
  (() => {
    const oz = FO(50), diff = oz * 0.8;
    kc({ id: 'gc2', commodity: 'gold', title: 'Two suppliers, two premiums', brief: 'A cheaper premium with advance payment vs a higher premium with delivery-versus-payment.',
      context: 'You need 50 kg of 999.9 kilobars. Supplier A (new, unknown refiner list provided as PDF only) offers spot + 0.80/oz, payment 100% in advance, delivery in 10 days. Supplier B (established bullion dealer, LBMA-accredited refiners) offers spot + 1.60/oz with delivery-versus-payment (DvP) in a Zurich vault.',
      data: [['Quantity', '50 kg 999.9'], ['A', 'spot + 0.80, advance payment, unknown refiners'], ['B', 'spot + 1.60, DvP in vault, accredited refiners']],
      steps: [
        { type: 'num', q: 'How much more does B cost than A in total (USD)?', ans: diff, tol: 1, unit: 'USD', work: [`Fine oz = 50 × 32.1507 × 0.9999 = ${f(oz, 2)}`, `Premium difference 0.80 × ${f(oz, 2)} = ${f(diff)}`] },
        { type: 'choice', q: 'Which supplier do you choose?', opts: [
          ['B — pay the higher premium for DvP settlement and verified bars', 100, `Right. With A you would pre-pay about 3.3m to an unverified party for ${f(diff, 0)} of savings — a risk/reward ratio of ~2,500:1 against you.`],
          ['A — cheaper is cheaper', 0, 'Advance payment to an unverified supplier exposes the full value to non-delivery or fake bars.'],
          ['A, but only after independent KYC, refiner verification and an escrow/DvP structure', 70, 'Reasonable if A accepts these conditions; if it refuses, that refusal is itself a red flag. Until verified, B is the safe choice.']] },
      ], solution: `The premium difference is ${f(diff)} (≈0.024% of value). Settlement and fraud risk on ~3.3m dwarfs it. Professional practice: verified counterparties, accredited bars and DvP or escrow.`, skills: ['gold', 'risk'] });
  })();
  (() => {
    const oz = FO(5), val = oz * 2051.5, frIns = val * 0.0009, cif = val + frIns, duty = cif * 0.06, broker = 400, landed = cif + duty + broker, beOz = landed / oz - 2050;
    kc({ id: 'gc3', commodity: 'gold', title: 'Landed cost of imported gold', brief: 'Calculate what five kilobars really cost once delivered and cleared in the import market.',
      context: 'A jeweller imports 5 × 1 kg bars (999.9) bought at spot 2,050 + 1.50/oz. Secure freight and insurance cost 0.09% of value; import duty is 6% on the CIF value; customs broker fee 400 (simulated rates).',
      data: [['Bars', '5 × 1 kg 999.9'], ['Price', '2,051.50 /oz'], ['Freight + insurance', '0.09% of value'], ['Duty', '6% of CIF'], ['Broker', '400']],
      steps: [
        { type: 'num', q: 'Total landed cost (USD)?', ans: landed, tol: 5, unit: 'USD', work: [`Fine oz = ${f(oz, 3)}`, `Value = ${f(val)}`, `CIF = value + 0.09% = ${f(cif)}`, `Duty 6% = ${f(duty)}`, `Landed = ${f(landed)}`] },
        { type: 'num', q: 'Minimum local premium over the international spot (2,050) per oz to break even?', ans: beOz, tol: 0.2, unit: 'USD/oz', work: [`Landed per oz = ${f(landed / oz)}`, `− 2,050 = ${f(beOz)}`] },
      ], solution: `Landed cost ${f(landed)}; local selling prices must carry a premium of at least ${f(beOz)}/oz over international spot before any margin. Duty-driven local premiums explain why local prices differ from benchmarks.`, skills: ['gold', 'finance'] });
  })();
  (() => {
    const claimed = FO(500) * 2000 * 0.08;
    kc({ id: 'gc4', commodity: 'gold', title: 'Evaluating a gold supplier\'s commercial proposal', brief: 'An unsolicited offer of 500 kg "Au 99.99" at a deep discount. Read it like a professional.',
      context: 'Email from "Global Mining Mandate Group" (fictional): "Seller has 500 kg AU bullion 99.99 ready in a free-zone warehouse. Price LBMA minus 8%. Buyer to pay 1% document release fee to our facilitator account in a third country. SKR (safe-keeping receipt) and assay report attached as scans. No physical inspection before payment; delivery CIF any airport."',
      data: [['Quantity', '500 kg'], ['Price', 'benchmark − 8%'], ['Advance fee', '1% to a third-party account'], ['Documents', 'scans only'], ['Inspection', 'refused']],
      steps: [
        { type: 'num', q: 'At 2,000/oz, how large is the claimed discount in USD (999.9 fineness)?', ans: claimed, tol: 50, unit: 'USD', work: [`Fine oz = ${f(FO(500), 0)}`, `× 2,000 × 8% = ${f(claimed, 0)}`] },
        { type: 'choice', q: 'Your response?', opts: [
          ['Decline, report internally and do not pay any fee', 100, 'Correct. Deep discounts, advance fees to third parties, scanned SKRs and refused inspection are classic advance-fee fraud indicators. Genuine sellers can sell at market to banks.'],
          ['Pay the 1% fee — the discount is worth it', 0, 'You would almost certainly lose the fee (~320,000) and possibly be drawn into a larger fraud.'],
          ['Negotiate the discount to 5%', 0, 'Negotiating legitimises a fraudulent structure. The problem is the structure, not the price.'],
          ['Ask for inspection by a recognised assayer at a recognised vault and DvP; decline otherwise', 85, 'Professional — but expect the "seller" to refuse. Also run KYC and sanctions screening on all named parties.']] },
      ], solution: `A ${f(claimed, 0)} "discount" is economically implausible: refiners and miners sell to banks at market. Treat it as fraud unless proven otherwise through verified chain of custody, accredited refiners, independent assay and DvP.`, skills: ['gold', 'risk', 'physical'] });
  })();
  (() => {
    const e0 = 2000 / 1.10, e1 = 1940 / 1.0, ch = (e1 / e0 - 1) * 100;
    kc({ id: 'gc5', commodity: 'gold', title: 'Effect of a stronger US dollar', brief: 'Gold falls in USD but rises for a European buyer. Why?',
      context: 'Over a quarter, EUR/USD moves from 1.10 to 1.00 (the dollar strengthens), and gold falls from 2,000 to 1,940 USD/oz (simulated).',
      data: [['Gold USD/oz', '2,000 → 1,940'], ['EUR/USD', '1.10 → 1.00']],
      steps: [
        { type: 'num', q: 'Percentage change in the gold price in EUR?', ans: ch, tol: 0.1, unit: '%', work: [`Before: 2,000 / 1.10 = ${f(e0)} EUR`, `After: 1,940 / 1.00 = ${f(e1)} EUR`, `Change = ${f(ch)}%`] },
        { type: 'choice', q: 'What is the best interpretation for a euro-based jewellery manufacturer?', opts: [
          ['Its metal cost rose despite the USD price falling; it should consider FX hedging alongside metal hedging', 100, 'Correct: the currency move dominated. Exposure must be measured in the company\'s own currency.'],
          ['Gold got cheaper, so buy more', 10, 'Only true for USD-based buyers.'],
          ['Currency is irrelevant because gold is a global price', 0, 'Gold is priced in USD; local-currency buyers carry FX risk.']] },
      ], solution: `In EUR, gold rose ${f(ch)}% while it fell 3% in USD. A stronger USD often weighs on the USD gold price, but non-USD buyers may still face higher local costs.`, skills: ['gold', 'markets'] });
  })();
  (() => {
    const phys = 2082, gain = (2086 - 2010), eff = phys - gain;
    kc({ id: 'gc6', commodity: 'gold', title: 'Hedging a physical gold purchase', brief: 'A manufacturer locks in its metal cost two months ahead with futures.',
      context: 'A jewellery maker must buy 300 oz in two months. It buys 3 gold futures (100 oz) at 2,010. Two months later spot is 2,080 and futures 2,086; it buys physical at spot + 2.00 and closes the futures.',
      data: [['Exposure', 'buy 300 oz in 2 months'], ['Futures bought', '3 at 2,010'], ['At purchase', 'spot 2,080; futures 2,086'], ['Physical premium', '+2.00']],
      steps: [
        { type: 'num', q: 'Effective cost per oz after the hedge?', ans: eff, tol: 0.01, unit: 'USD/oz', work: [`Physical = 2,082`, `Futures gain = 2,086 − 2,010 = ${gain}`, `Effective = 2,082 − ${gain} = ${eff}`] },
        { type: 'choice', q: 'The manufacturer\'s CFO asks whether calls would have been better. Best answer?', opts: [
          ['Calls cap the cost but cost a premium; with uncertain volumes or if prices might fall, calls can suit better; with firm volume and no view, futures are cheaper', 100, 'Balanced and correct.'],
          ['Calls are always better', 10, 'Premium is a real cost; in many cases futures hedge more cheaply.'],
          ['Hedging was a waste because prices rose', 0, 'Prices rose — the hedge saved 76/oz. Hedging is judged against the risk, not hindsight.']] },
      ], solution: `Effective cost 2,006/oz (≈ the futures entry 2,010 + premium 2 + basis change −6). The basis (futures − spot) moved from the entry level to +6, which helped slightly.`, skills: ['gold', 'derivatives', 'options'] });
  })();
  (() => {
    const loss = (2050 - 2005) * 100 * 5;
    kc({ id: 'gc7', commodity: 'gold', title: 'Managing a losing futures position', brief: 'Long five contracts, the market has moved against you. Discipline or hope?',
      context: 'You bought 5 gold futures at 2,050 with a planned stop at 2,010 and target 2,130. Account equity before the trade: 160,000. Price now 2,005 after a gap through your stop on a strong US jobs report.',
      data: [['Position', 'long 5 × 100 oz at 2,050'], ['Plan', 'stop 2,010 / target 2,130'], ['Now', '2,005 (gapped through stop)'], ['Equity before', '160,000']],
      steps: [
        { type: 'num', q: 'Unrealised loss (USD)?', ans: -loss, tol: 1, unit: 'USD', work: [`(2,005 − 2,050) × 100 × 5 = ${f(-loss, 0)}`] },
        { type: 'choice', q: 'What do you do?', opts: [
          ['Exit now (the stop was triggered by the gap) and review the plan', 100, 'Correct. The thesis was invalidated at 2,010; the gap made the loss larger than planned (slippage) but holding turns a controlled loss into an open-ended one.'],
          ['Buy 5 more to average down', 0, 'Doubling a losing leveraged position violates risk limits and can trigger margin calls.'],
          ['Move the stop to 1,950 to "give it room"', 10, 'Moving stops away after the fact defeats the purpose of risk control.'],
          ['Hedge with a put while you reassess, accepting the cost', 40, 'Limits further downside but adds cost and complexity; it is a way to avoid making the decision your plan already made.']] },
      ], solution: `The loss of ${f(loss, 0)} (14% of equity) already exceeds the planned 25,000 risk (40 × 100 × 5) because of the gap. Position sizing should assume gaps; exit discipline protects capital for the next trade.`, skills: ['derivatives', 'risk'] });
  })();
  (() => {
    const v = 1000 * 2000, phys = v * (0.0012 + 0.0005 + 0.005), etf = v * (0.004 + 0.0005);
    kc({ id: 'gc8', commodity: 'gold', title: 'Physical gold vs a gold ETF', brief: 'Cost, ownership and counterparty differences over a one-year holding.',
      context: 'A family office wants 1,000 oz of exposure for one year (gold 2,000). Physical allocated bars: vault fee 0.12%/yr, insurance 0.05%/yr, round-trip dealer spread 0.50%. ETF: expense ratio 0.40%/yr, round-trip spread and commission 0.05%. (Simulated costs.)',
      data: [['Exposure', '1,000 oz at 2,000'], ['Physical', '0.12% + 0.05% + 0.50% round trip'], ['ETF', '0.40% + 0.05% round trip']],
      steps: [
        { type: 'num', q: 'How much cheaper is the ETF than physical over one year (USD)?', ans: phys - etf, tol: 1, unit: 'USD', work: [`Physical = 2,000,000 × 0.67% = ${f(phys, 0)}`, `ETF = 2,000,000 × 0.45% = ${f(etf, 0)}`, `Difference = ${f(phys - etf, 0)}`] },
        { type: 'choice', q: 'The client\'s main goal is "assets outside the financial system in a crisis". Recommendation?', opts: [
          ['Allocated physical bars with clear title and an independent custodian, despite the higher cost', 100, 'Matches the objective: direct title to identified bars. The ETF is a security exposed to fund, custodian and market-infrastructure risk.'],
          ['ETF because it is cheaper', 30, 'Cheaper but does not meet the stated objective.'],
          ['Unallocated account at a bank', 10, 'An unallocated account makes the client an unsecured creditor of the bank — the opposite of the goal.']] },
      ], solution: 'Choose the instrument by need: cost, liquidity, ownership and counterparty structure differ. ETFs are cost-efficient for exposure; allocated bars provide direct title.', skills: ['gold'] });
  })();
  (() => {
    const exp = FO(20) * 2000;
    kc({ id: 'gc9', commodity: 'gold', title: 'Counterparty and settlement risk', brief: 'A new buyer wants delivery before payment.',
      context: 'A new buyer in another country offers spot + 4.00/oz for 20 kg (999.9) if you deliver to its premises and accept payment two business days after delivery. Spot 2,000.',
      data: [['Quantity', '20 kg 999.9'], ['Offer', 'spot + 4.00'], ['Terms', 'pay T+2 after delivery']],
      steps: [
        { type: 'num', q: 'Unsecured exposure at delivery (USD, at spot only)?', ans: exp, tol: 10, unit: 'USD', work: [`${f(FO(20), 2)} oz × 2,000 = ${f(exp, 0)}`] },
        { type: 'choice', q: 'Best structure?', opts: [
          ['DvP in a vault (or via escrow/bank) after KYC; if the buyer insists on its premises, require payment before release', 100, 'Removes settlement risk. The extra premium does not compensate unsecured exposure to an unknown party.'],
          ['Accept — the premium is attractive', 5, 'The premium (~2,570) is ~0.2% of the 1.29m exposure.'],
          ['Accept with an unconfirmed LC from an unknown bank', 50, 'Better than nothing, but issuing-bank and documentary risks remain; confirmation from a strong bank would help.']] },
      ], solution: `Settlement risk equals the full value (${f(exp, 0)}). In precious metals, DvP and verified counterparties are standard practice.`, skills: ['gold', 'risk', 'finance'] });
  })();
  (() => {
    const oz = FO(25), buyV = oz * 2000.5, phys = (2012 + 8 - 2000.5) * oz, hedge = -(2016.5 - 2004) * 800, costs = buyV * 0.0011, fin = C.interest(buyV, 6, 8), net = phys + hedge - costs - fin;
    kc({ id: 'gc10', commodity: 'gold', title: 'Profit of a complete physical gold transaction', brief: 'Put it all together: premium spread, hedge, logistics, financing.',
      context: 'Buy 25 kg (999.9) at spot 2,000.00 + 0.50. Hedge by selling 8 futures (100 oz) at 2,004.00. Eight days later sell to a Gulf jeweller at spot 2,012.00 + 8.00 and buy back the futures at 2,016.50. Freight and insurance 0.11% of purchase value; financing 6% (ACT/360) on purchase value for 8 days.',
      data: [['Bars', '25 kg 999.9'], ['Buy', '2,000.50'], ['Sell', '2,020.00'], ['Futures', 'sold 8 at 2,004.00, bought at 2,016.50'], ['Costs', '0.11% + financing 6%/8d']],
      steps: [
        { type: 'num', q: 'Net profit of the whole transaction (USD)?', ans: net, tol: 5, unit: 'USD', work: [`Fine oz = ${f(oz, 3)}`, `Physical gain = (2,020 − 2,000.50) × ${f(oz, 3)} = ${f(phys)}`, `Hedge = −12.50 × 800 = ${f(hedge)}`, `Logistics = ${f(costs)}; financing = ${f(fin)}`, `Net = ${f(net)}`] },
        { type: 'choice', q: 'The hedge "lost" 10,000. Was hedging a mistake?', opts: [
          ['No — the hedge offset the spot rise that the physical captured; the profit comes from the premium spread and costs', 100, 'Correct. Judge the combined position: the physical gained on the same move.'],
          ['Yes — without the hedge profit would be 10,000 higher', 20, 'True in hindsight only; a fall of the same size would have caused a matching loss.'],
          ['The hedge should have been 25 contracts', 0, '25 kg ≈ 804 oz ≈ 8 contracts; 25 contracts would be a large speculative short.']] },
      ], solution: `Net ${f(net)}. Of the 19.50/oz gross difference, 12 came from the market (and was offset by the hedge) and 7.50 from the premium spread; costs and basis took the rest.`, skills: ['gold', 'physical', 'derivatives'] });
  })();

  /* =========================================================== WHEAT */
  (() => {
    const cfr = 235 + 26, ins = cfr * 1.1 * 0.001, cif = cfr + ins;
    kc({ id: 'wc1', commodity: 'wheat', title: 'Buying wheat from an international supplier', brief: 'Build the CIF price and choose payment terms with a new supplier.',
      context: 'Danubia Grain SRL (fictional, 3 years trading, references available) offers 30,000 t ± 10% milling wheat 12.5% protein FOB Constanța at 235/t. Freight to Alexandria 26/t; insurance 0.10% on 110% of CFR. Supplier asks 20% advance and 80% cash against documents (CAD).',
      data: [['FOB', '235'], ['Freight', '26'], ['Insurance', '0.10% × 110% CFR'], ['Terms requested', '20% advance + 80% CAD']],
      steps: [
        { type: 'num', q: 'CIF price per t?', ans: cif, tol: 0.01, unit: 'USD/t', work: [`CFR = 261`, `Insurance = 261 × 1.1 × 0.10% = ${f(ins, 3)}`, `CIF = ${f(cif, 3)}`] },
        { type: 'choice', q: 'How do you respond to the payment request?', opts: [
          ['Counter with payment by LC at sight (or CAD with no advance) and offer a small price concession; accept an advance only against a bank advance-payment guarantee', 100, 'Protects 1.4m of advance from non-delivery while giving the supplier security.'],
          ['Accept 20% advance unsecured', 30, 'You expose ~1.4m to a relatively new supplier.'],
          ['Insist on 90-day open account', 20, 'Unrealistic for a seller; likely kills the deal.']] },
      ], solution: `CIF ${f(cif, 2)}/t. Advance payments must be secured (advance-payment guarantee, escrow) or replaced by documentary methods.`, skills: ['wheat', 'finance'] });
  })();
  (() => {
    const a = 228 + 31 + (12.5 - 11.5) * 8, b = 241 + 18;
    kc({ id: 'wc2', commodity: 'wheat', title: 'Comparing two wheat origins', brief: 'Cheaper FOB, lower protein, longer voyage — which origin really wins?',
      context: 'A mill needs 12.5% protein. Origin A: FOB 228, freight 31, protein 11.5% — the mill values protein at 8/t per percentage point (it must blend in costlier wheat). Origin B: FOB 241, freight 18, protein 12.5%.',
      data: [['A', 'FOB 228 + freight 31, protein 11.5%'], ['B', 'FOB 241 + freight 18, protein 12.5%'], ['Protein value', '8/t per point']],
      steps: [
        { type: 'num', q: 'Quality-adjusted delivered cost of A (USD/t)?', ans: a, tol: 0.01, unit: 'USD/t', work: ['228 + 31 = 259 CFR', 'Protein shortfall 1.0 × 8 = 8', `Adjusted = ${a}`] },
        { type: 'choice', q: 'Which origin?', opts: [
          ['B — 259 vs 267 quality-adjusted', 100, 'Correct: B is the same CFR price but meets spec; A needs 8/t of blending cost.'],
          ['A — lower FOB', 0, 'FOB comparisons ignore freight and quality.'],
          ['Either — CFR is equal at 259', 40, 'True on CFR alone, but quality makes B better.']] },
      ], solution: `A: ${a}/t adjusted; B: ${b}/t. Always normalise to delivered, specification-equivalent cost.`, skills: ['wheat', 'physical'] });
  })();
  (() => {
    const lc = C.landedCost({ qty: 25000, buyTerm: 'CFR', buyPrice: 262, insurancePct: 0.08, portCharges: 6.5, unloading: 0, inlandDest: 14, inspection: 12000, dutyPct: 0, financeRatePct: 8, financeDays: 45 });
    kc({ id: 'wc3', commodity: 'wheat', title: 'Landed cost per metric ton', brief: 'From CFR to the mill gate with every cost counted once.',
      context: 'Purchase 25,000 t CFR Alexandria at 262/t. Buyer insures (0.08% on 110% of CFR). Port charges & discharge 6.50/t; inland trucking 14/t; discharge-port inspection 12,000 lump sum; duty 0; financing 8% p.a. for 45 days on total cost before financing (ACT/360).',
      data: [['CFR', '262'], ['Insurance', '0.08% × 110%'], ['Port', '6.50/t'], ['Inland', '14/t'], ['Inspection', '12,000'], ['Finance', '8% × 45 d']],
      steps: [{ type: 'num', q: 'Landed cost per t at the mill?', ans: lc.perT, tol: 0.02, unit: 'USD/t', work: [`Goods = ${f(lc.goods, 0)}`, `Insurance = ${f(lc.lines.insurance)}`, `Port = ${f(lc.lines.portCharges, 0)}; inland = ${f(lc.lines.inlandDest, 0)}; inspection 12,000`, `Before financing = ${f(lc.totalBeforeFinancing)}`, `Financing = ${f(lc.lines.financing)}`, `Total ${f(lc.total)} ÷ 25,000 = ${f(lc.perT, 3)}`] },
        { type: 'choice', q: 'The mill\'s procurement manager wants to drop insurance to save money. Advice?', opts: [['Keep it: under CFR the buyer bears transit risk from loading; the premium is ~0.29/t versus total-loss exposure of 6.5m', 100, 'Correct.'], ['Drop it — ships rarely sink', 0, 'Partial losses (wetting, contamination, general average) are more frequent than sinkings.'], ['The seller insures under CFR', 0, 'No — under CFR insurance is not the seller\'s obligation.']] }],
      solution: `Landed ${f(lc.perT, 2)}/t. Use the Deal Calculator to reproduce it (purchase term CFR).`, skills: ['wheat', 'incoterms'] });
  })();
  (() => {
    const b0 = C.balance({ beginning: 270, production: 790, imports: 0, consumption: 795, exports: 0 }), b1 = C.balance({ beginning: 270, production: 768, imports: 0, consumption: 790, exports: 0 });
    kc({ id: 'wc4', commodity: 'wheat', title: 'Weather-driven supply shock', brief: 'A drought cuts a key exporter\'s crop. Model the world balance and decide how a mill should react.',
      context: 'Simulated world balance (million t): beginning 270, production 790, consumption 795. A drought cuts production by 22 Mt; feed demand falls by 5 Mt as prices rise.',
      data: [['Before', 'B 270, P 790, C 795'], ['Shock', 'P −22, C −5']],
      steps: [{ type: 'num', q: 'New world stocks-to-use ratio (%)? (World: imports = exports, so use consumption only)', ans: b1.stocksToUse, tol: 0.05, unit: '%', work: [`Before: ending ${b0.ending}, ratio ${f(b0.stocksToUse)}%`, `After: 270 + 768 − 790 = ${b1.ending}; ${b1.ending}/790 = ${f(b1.stocksToUse)}%`] },
        { type: 'choice', q: 'You run a flour mill with 6 weeks of cover. Best response?', opts: [['Extend cover/hedge part of next quarter\'s needs with futures or calls; diversify origins; avoid panic buying of the full year', 100, 'Measured response to a tightening market.'], ['Wait — prices always fall after shocks', 20, 'Stocks are tightening; waiting increases exposure.'], ['Buy a full year of physical wheat now', 30, 'Large storage, financing and basis risk; hedging instruments are cheaper ways to fix prices.']] }],
      solution: `Stocks-to-use falls from ${f(b0.stocksToUse)}% to ${f(b1.stocksToUse)}%. The decline matters more if it falls on exporters\' stocks; check where the stocks are.`, skills: ['wheat', 'analysis'] });
  })();
  (() => {
    const x = 226 + 30 + 22, y = 238 + 34;
    kc({ id: 'wc5', commodity: 'wheat', title: 'Effect of an export restriction', brief: 'An export tax changes which origin is cheapest.',
      context: 'Your usual origin X (FOB 226, freight 22 to your port) announces an export tax of 30/t, which exporters pass on fully. Alternative origin Y offers FOB 238 with freight 34; quality is equivalent.',
      data: [['X', 'FOB 226 + tax 30, freight 22'], ['Y', 'FOB 238, freight 34']],
      steps: [{ type: 'num', q: 'New delivered (CFR) cost from the cheapest origin?', ans: Math.min(x, y), tol: 0.01, unit: 'USD/t', work: [`X: 226 + 30 + 22 = ${x}`, `Y: 238 + 34 = ${y}`, `Cheapest = ${Math.min(x, y)}`] },
        { type: 'choice', q: 'What is likely to happen to FOB prices in Y over the following weeks?', opts: [['They tend to rise as importers switch demand to Y, until delivered prices are re-equalised', 100, 'Substitution transfers demand to competing origins.'], ['They fall', 10, 'Demand for Y\'s wheat increases.'], ['Nothing — origins are independent', 0, 'Origins compete for the same importers.']] }],
      solution: 'Export taxes raise world prices and shift trade flows; competing origins gain pricing power. Domestic prices in the taxing country tend to fall relative to world prices.', skills: ['wheat', 'markets'] });
  })();
  (() => {
    const n = Math.round(C.convertMass(20000, 't', 'bu_wheat') / 5000), tUsed = n * 5000 / C.convertMass(1, 't', 'bu_wheat');
    const phys = 20000 * -22, fut = tUsed * 19, net = phys + fut;
    kc({ id: 'wc6', commodity: 'wheat', title: 'Hedging inventory owned by a flour mill', brief: 'Inventory falls in value; the futures hedge offsets most — but not all.',
      context: 'A mill holds 20,000 t of wheat valued at market. It sells wheat futures (5,000 bu each) equivalent to its tonnage. Over a month the local cash price falls 22/t and futures fall the equivalent of 19/t.',
      data: [['Inventory', '20,000 t'], ['Cash price', '−22/t'], ['Futures', '−19/t equivalent']],
      steps: [{ type: 'num', q: 'Number of contracts sold (nearest whole)?', ans: n, tol: 0, dp: 0, unit: 'contracts', work: [`20,000 × 36.7437 = ${f(C.convertMass(20000, 't', 'bu_wheat'), 0)} bu`, `÷ 5,000 = ${n}`] },
        { type: 'num', q: 'Net result of inventory + hedge (USD)?', ans: net, tol: 20, unit: 'USD', work: [`Inventory = 20,000 × −22 = ${f(phys, 0)}`, `Futures: ${n} contracts = ${f(tUsed, 1)} t × 19 = ${f(fut, 0)}`, `Net = ${f(net, 0)}`] },
        { type: 'choice', q: 'Why is the hedge imperfect?', opts: [['Basis weakened by 3/t (local price fell more than futures), plus a small rounding mismatch in contract numbers', 100, 'Correct: basis risk and quantity rounding.'], ['Futures are always wrong', 0, 'No.'], ['The mill should not have hedged', 0, 'Without the hedge the loss would be 440,000.']] }],
      solution: `Hedged loss ≈ ${f(net, 0)} vs unhedged −440,000. The residual is basis risk.`, skills: ['wheat', 'derivatives'] });
  })();
  (() => {
    const allow = (12.5 - 12.1) * 10 * 1.5 * 30000;
    kc({ id: 'wc7', commodity: 'wheat', title: 'Managing a quality discrepancy', brief: 'Protein arrives below specification. Who pays depends on the contract wording.',
      context: 'Contract: 30,000 t, protein min 12.5% with an allowance of 1.50/t per 0.1% below (down to 12.0%, rejectable below). Loading certificates from an agreed surveyor are "final as to quality". The loading certificate shows 12.6%; the buyer\'s discharge analysis shows 12.1%.',
      data: [['Spec', 'min 12.5%, 1.50/t per 0.1%'], ['Loading cert (final)', '12.6%'], ['Discharge analysis', '12.1%']],
      steps: [{ type: 'num', q: 'If discharge results were contractually binding, what allowance would apply (USD)?', ans: allow, tol: 1, unit: 'USD', work: ['Shortfall 0.4% = 4 × 0.1%', '4 × 1.50 = 6.00/t', `× 30,000 = ${f(allow, 0)}`] },
        { type: 'choice', q: 'As the seller, how do you respond to the buyer\'s claim?', opts: [['Reject the claim politely, citing the "final at loading" clause and certificate; offer to share sample analysis via the agreed umpire procedure if the contract provides', 100, 'The contract governs; loading certificates are final.'], ['Pay the claim to keep the customer', 40, 'A commercial gesture is possible but is not owed; consider the relationship explicitly.'], ['Ignore the email', 0, 'Unprofessional and risks escalation.']] }],
      solution: 'Contract wording on where quality is determined (loading vs discharge) decides who bears quality risk in transit. Buyers who need discharge quality must negotiate it — and usually pay for it.', skills: ['wheat', 'physical'] });
  })();
  (() => {
    const fin = C.interest(28000 * 270, 8, 9), dem = 9 * 14000, total = fin + dem;
    kc({ id: 'wc8', commodity: 'wheat', title: 'Evaluating a shipment delay', brief: 'A vessel arrives 9 days late. Costs and choices.',
      context: 'A 28,000 t cargo worth 270/t is 9 days late due to port congestion at loading. Your sales contract passes demurrage at discharge to the buyer only after laytime; the delay itself costs you financing (8% p.a.) and 14,000/day of charter time (your charter, waiting at load port). The mill warns it may run out of wheat in 5 days.',
      data: [['Cargo', '28,000 t × 270'], ['Delay', '9 days'], ['Financing', '8% p.a.'], ['Waiting cost', '14,000/day']],
      steps: [{ type: 'num', q: 'Direct cost of the delay to you (financing + waiting), USD?', ans: total, tol: 5, unit: 'USD', work: [`Financing = 7,560,000 × 8% × 9/360 = ${f(fin)}`, `Waiting = 9 × 14,000 = ${f(dem, 0)}`, `Total = ${f(total)}`] },
        { type: 'choice', q: 'The mill may stop. What do you offer?', opts: [['Inform early, offer to source a small parcel from local stocks at cost plus a fee, and document the cause for possible recovery under the charter/supply contract', 100, 'Protects the customer relationship and your contractual position.'], ['Say nothing until the vessel arrives', 0, 'Surprises damage relationships and may breach notice obligations.'], ['Offer a big price discount immediately', 30, 'Expensive and may not be required by the contract.']] }],
      solution: `Delay cost ≈ ${f(total, 0)} (≈ ${f(total / 28000)}/t), half the typical margin. Proactive communication and contractual recovery matter.`, skills: ['wheat', 'logistics'] });
  })();
  (() => {
    const fin = C.interest(280, 8, 60);
    kc({ id: 'wc9', commodity: 'wheat', title: 'Negotiating a wheat supply contract', brief: 'The buyer wants 60 days open account. Price the credit.',
      context: 'A mill offers 280/t CFR for 40,000 t but wants 60-day open account. Your alternative: 277/t with LC at sight. Your funding cost is 8% p.a.; the buyer\'s probability of default over 60 days you estimate at 1.5% with 60% loss given default.',
      data: [['Open account', '280, 60 days'], ['LC at sight', '277'], ['Funding', '8%'], ['PD / LGD', '1.5% / 60%']],
      steps: [{ type: 'num', q: 'Financing cost per t of 60 days on 280 (ACT/360)?', ans: fin, tol: 0.01, unit: 'USD/t', work: [`280 × 8% × 60/360 = ${f(fin, 3)}`] },
        { type: 'num', q: 'Expected credit loss per t on open account?', ans: 280 * 0.015 * 0.6, tol: 0.01, unit: 'USD/t', work: ['280 × 1.5% × 60% = 2.52'] },
        { type: 'choice', q: 'Which deal is better?', opts: [['LC at 277: open account nets ~280 − 3.73 − 2.52 = 273.75 equivalent, below 277', 100, 'Correct risk-adjusted comparison.'], ['Open account at 280 — higher price', 0, 'Ignores funding and credit costs.'], ['Equal', 20, 'They are not.']] }],
      solution: 'Risk-adjusted value: 280 − 3.73 − 2.52 = 273.75 < 277. Price credit terms explicitly.', skills: ['wheat', 'finance', 'negotiation'] });
  })();
  (() => {
    const d = C.dealPnL({ qty: 33000, buyTerm: 'FOB', buyPrice: 231, freight: 27, insurancePct: 0.1, inspection: 15000, portCharges: 0, financeRatePct: 7.5, financeDays: 50, sellPrice: 268, sellingLump: 40000, otherDealExp: 25000 });
    kc({ id: 'wc10', commodity: 'wheat', title: 'Profit after freight, insurance, financing and operating costs', brief: 'Full P&L of a CFR sale.',
      context: 'Buy 33,000 t FOB at 231. Freight 27/t; insurance 0.10% on 110% CFR; inspection 15,000; financing 7.5% for 50 days on cost; sell CFR at 268. Brokerage and agency costs 40,000; operating overhead allocated to the deal 25,000.',
      data: [['Buy', 'FOB 231'], ['Sell', 'CFR 268'], ['Freight', '27'], ['Other', 'insp. 15k, brokerage 40k, overhead 25k']],
      steps: [{ type: 'num', q: 'Net profit (USD)?', ans: d.netProfit, tol: 5, unit: 'USD', work: [`Landed = ${f(d.landed.total)}`, `Revenue = ${f(d.netRevenue, 0)}`, `− brokerage 40,000 − overhead 25,000`, `Net = ${f(d.netProfit)}`] },
        { type: 'num', q: 'Break-even CFR selling price per t?', ans: d.breakEven, tol: 0.02, unit: 'USD/t', work: [`(Landed + 65,000) / 33,000 = ${f(d.breakEven, 3)}`] }],
      solution: `Net ${f(d.netProfit, 0)} (${f(d.netMarginPct)}% of revenue); break-even ${f(d.breakEven)}/t — only ${f(268 - d.breakEven)}/t of cushion against adverse moves.`, skills: ['wheat', 'foundations'] });
  })();

  /* =========================================================== SUGAR */
  (() => {
    const p = C.centsPerLbToUsdPerT(19.2 + 0.35), cfr = p + 28;
    kc({ id: 'sc1', commodity: 'sugar', title: 'Importing raw sugar', brief: 'Convert a futures-based price into a CFR cost per tonne.',
      context: 'A refinery buys 50,000 t raw sugar (VHP) FOB Santos priced at futures 19.20 c/lb plus a premium of 0.35 c/lb. Freight to the refinery port: 28 USD/t.',
      data: [['Futures', '19.20 c/lb'], ['FOB premium', '+0.35 c/lb'], ['Freight', '28 USD/t']],
      steps: [{ type: 'num', q: 'CFR cost per t?', ans: cfr, tol: 0.05, unit: 'USD/t', work: [`19.55 c/lb × 22.0462 = ${f(p)}`, `+ 28 = ${f(cfr)}`] },
        { type: 'choice', q: 'The futures part is unpriced until the refinery fixes it. What risk is that?', opts: [['Flat-price risk until fixed: the refinery can fix via futures when it sells whites, managing the raw-white spread', 100, 'Correct: "premium" fixed now, flat price later.'], ['No risk — the premium is fixed', 0, 'Only the premium is fixed.'], ['Freight risk', 10, 'Freight is already fixed at 28.']] }],
      solution: `CFR ${f(cfr)}/t. Physical sugar is often priced as futures + premium, separating flat price from the physical differential.`, skills: ['sugar', 'derivatives'] });
  })();
  (() => {
    const perCont = 25 * (565 + 8), total = perCont * 40;
    kc({ id: 'sc2', commodity: 'sugar', title: 'Buying refined sugar in containers', brief: 'Bagged ICUMSA 45 for a beverage plant.',
      context: 'A beverage plant needs 1,000 t ICUMSA 45 in 50 kg bags. Supplier offers 565 USD/t CFR destination container yard, 25 t per 20\' container; destination handling and delivery 8 USD/t.',
      data: [['Price', '565 CFR'], ['Per container', '25 t'], ['Handling', '8/t']],
      steps: [{ type: 'num', q: 'Total delivered cost for 40 containers (USD)?', ans: total, tol: 1, unit: 'USD', work: [`Per container = 25 × 573 = ${f(perCont, 0)}`, `× 40 = ${f(total, 0)}`] },
        { type: 'choice', q: 'Which specification point is most critical for a beverage plant?', opts: [['Colour (ICUMSA), food-safety documentation and microbiological limits, plus bag quality', 100, 'Beverage makers care about colour, purity and food safety.'], ['Polarisation of 96°', 0, 'That is a raw-sugar base, not refined.'], ['Vessel flag', 0, 'Not a product spec.']] }],
      solution: 'Refined sugar for food use is specified by colour, polarisation, moisture, ash, microbiology and packaging; documentation (health certificates) may be required by the importer.', skills: ['sugar', 'physical'] });
  })();
  (() => {
    const A = 410 + 32 + (410 + 32) * 1.1 * 0.001, B = 425 + 18 + (425 + 18) * 1.1 * 0.001, Cc = (398 + 41) * 1.05 + (398 + 41) * 1.1 * 0.001;
    kc({ id: 'sc3', commodity: 'sugar', title: 'Comparing raw sugar origins', brief: 'Three origins, different freight and duty treatment.',
      context: 'Raw sugar to an importer with a 5% duty on CIF for non-preferential origins (origin C) and 0% for origins A and B under a trade agreement (certificates of origin required). A: FOB 410, freight 32. B: FOB 425, freight 18. C: FOB 398, freight 41. Insurance 0.10% on 110% CFR. (Simplification: duty applied on CFR value.)',
      data: [['A', '410 + 32, duty 0%'], ['B', '425 + 18, duty 0%'], ['C', '398 + 41, duty 5%']],
      steps: [{ type: 'num', q: 'Lowest delivered cost per t?', ans: Math.min(A, B, Cc), tol: 0.05, unit: 'USD/t', work: [`A = ${f(A)}`, `B = ${f(B)}`, `C = (439 × 1.05) + ins = ${f(Cc)}`] },
        { type: 'choice', q: 'Choose origin', opts: [[`A (${f(A)})`, 100, 'Cheapest delivered — provided the certificate of origin is correct.'], [`B (${f(B)})`, 60, 'Close; may be preferable if reliability/shipping time is better.'], [`C (${f(Cc)})`, 0, 'The duty makes the cheapest FOB the most expensive delivered.']] }],
      solution: 'Delivered, duty-inclusive comparison reverses the FOB ranking. Documentation (certificate of origin) underpins the duty preference.', skills: ['sugar', 'finance'] });
  })();
  (() => {
    const lc = C.landedCost({ qty: 12000, buyTerm: 'CFR', buyPrice: 548, insurancePct: 0.12, dutyPct: 10, portCharges: 11, inlandDest: 9, inspection: 6000, financeRatePct: 9, financeDays: 60 });
    kc({ id: 'sc4', commodity: 'sugar', title: 'Landed cost of refined sugar', brief: 'CFR to warehouse with duty and financing.',
      context: '12,000 t refined sugar CFR at 548/t. Insurance 0.12% on 110% CFR; duty 10% on CIF; port & handling 11/t; inland 9/t; inspection 6,000; financing 9% p.a. for 60 days on total cost before financing.',
      data: [['CFR', '548'], ['Duty', '10% CIF'], ['Port/inland', '11 + 9'], ['Finance', '9% × 60 d']],
      steps: [{ type: 'num', q: 'Landed cost per t?', ans: lc.perT, tol: 0.05, unit: 'USD/t', work: [`Insurance = ${f(lc.lines.insurance)}`, `CIF value = ${f(lc.cifValue)}`, `Duty = ${f(lc.lines.duty)}`, `Before financing = ${f(lc.totalBeforeFinancing)}`, `Financing = ${f(lc.lines.financing)}`, `Per t = ${f(lc.perT)}`] }],
      solution: `Landed ${f(lc.perT)}/t; duty is the largest add-on.`, skills: ['sugar', 'foundations'] });
  })();
  (() => {
    const s = (cane, mix) => cane * 140 * mix / 1000 / 1.05 / 1e6;
    const a = s(600e6, 0.46), b = s(600e6, 0.50);
    kc({ id: 'sc5', commodity: 'sugar', title: 'Analysing a production forecast', brief: 'Sugar mix changes can matter as much as cane volume.',
      context: 'Illustrative model for a cane region: sugar (Mt) ≈ cane (t) × ATR (kg/t) × sugar mix ÷ 1,000 ÷ 1.05. Cane crush 600 Mt; ATR 140 kg/t. Analysts expect the sugar mix to rise from 46% to 50% because sugar pays more than ethanol.',
      data: [['Cane', '600 Mt'], ['ATR', '140 kg/t'], ['Mix', '46% → 50%'], ['Conversion', '÷ 1.05 (illustrative)']],
      steps: [{ type: 'num', q: 'Increase in sugar output (Mt)?', ans: b - a, tol: 0.02, unit: 'Mt', work: [`46%: ${f(a, 2)} Mt`, `50%: ${f(b, 2)} Mt`, `Δ = ${f(b - a, 2)} Mt`] },
        { type: 'choice', q: 'Market implication?', opts: [['Bearish for sugar prices, other things equal — unless ethanol economics or weather limit the switch', 100, 'More sugar supply weighs on price; the switch depends on relative returns.'], ['Bullish', 0, 'More supply is not bullish by itself.'], ['No effect', 0, 'A 2+ Mt change is material for world trade.']] }],
      solution: `+${f(b - a, 2)} Mt. Mix decisions link sugar to energy markets; the model is a simplification.`, skills: ['sugar', 'analysis'] });
  })();
  (() => {
    const before = 38, after = 38 * 0.92, exportable = (prod) => prod - 11;
    kc({ id: 'sc6', commodity: 'sugar', title: 'Evaluating weather risk', brief: 'A drought cuts yields in an exporting country.',
      context: 'Exporting country "Tropica" (fictional): sugar production 38 Mt, domestic consumption 11 Mt, stocks stable. Drought cuts production by 8%.',
      data: [['Production', '38 Mt'], ['Consumption', '11 Mt'], ['Shock', '−8% production']],
      steps: [{ type: 'num', q: 'Percentage fall in exportable surplus?', ans: (exportable(after) / exportable(before) - 1) * 100, tol: 0.1, unit: '%', work: [`Before: 38 − 11 = 27 Mt`, `After: ${f(after, 2)} − 11 = ${f(exportable(after), 2)} Mt`, `Change = ${f((exportable(after) / 27 - 1) * 100)}%`] },
        { type: 'choice', q: 'Lesson?', opts: [['Export availability falls proportionally more than production because domestic use is served first', 100, 'Leverage of exports to production shocks.'], ['Exports fall exactly 8%', 0, 'No.'], ['Domestic consumption absorbs the whole loss', 10, 'Domestic consumers are usually served first.']] }],
      solution: 'An 8% production loss cuts exportable surplus by ~11%. Policy (export restrictions) can magnify this further.', skills: ['sugar', 'markets'] });
  })();
  (() => {
    const tons = 20000, n = Math.round(C.convertMass(tons, 't', 'lb') / 112000), lbs = n * 112000, gain = (21.4 - 19.0) / 100 * lbs, phys = C.centsPerLbToUsdPerT(21.4 + 0.3) * tons, eff = (phys - gain) / tons;
    kc({ id: 'sc7', commodity: 'sugar', title: 'Hedging a physical purchase', brief: 'A refinery fixes its raw cost with a long futures hedge.',
      context: 'A refinery will buy 20,000 t raw sugar in 3 months priced at futures + 0.30 c/lb. To protect itself it buys raw sugar futures (112,000 lb) at 19.00 c/lb. At pricing, futures are 21.40.',
      data: [['Exposure', '20,000 t'], ['Futures bought', '19.00 c/lb'], ['At pricing', '21.40 + 0.30']],
      steps: [{ type: 'num', q: 'Contracts bought (nearest whole)?', ans: n, tol: 0, dp: 0, unit: 'contracts', work: [`20,000 t × 2,204.62 = ${f(C.convertMass(tons, 't', 'lb'), 0)} lb`, `÷ 112,000 = ${n}`] },
        { type: 'num', q: 'Effective cost per t after the hedge gain?', ans: eff, tol: 0.1, unit: 'USD/t', work: [`Physical = 21.70 c/lb = ${f(C.centsPerLbToUsdPerT(21.7))}/t → ${f(phys, 0)}`, `Futures gain = 2.40 c × ${f(lbs, 0)} lb = ${f(gain, 0)}`, `Effective = ${f(eff)}/t`] }],
      solution: `Effective ≈ ${f(eff)}/t ≈ the 19.30 c/lb level hedged (${f(C.centsPerLbToUsdPerT(19.3))}/t) — small differences come from contract rounding.`, skills: ['sugar', 'derivatives'] });
  })();
  (() => {
    const m = C.refiningMargin({ whiteUsdPerT: 560, rawCentsPerLb: 20.1, rawPerWhite: 1.06, refiningCostPerT: 75, freightRawPerT: 25 });
    kc({ id: 'sc8', commodity: 'sugar', title: 'Negotiating with a refinery', brief: 'Understand the refinery\'s margin before you push your raw sugar price.',
      context: 'You sell raw sugar to a destination refinery. Whites 560 USD/t; raws 20.10 c/lb; freight on raws 25/t; 1.06 t raw per t white; refining cost 75/t. The refinery asks for a lower premium on your raw sugar.',
      data: [['White', '560'], ['Raw', '20.10 c/lb'], ['Freight', '25/t'], ['Yield', '1.06'], ['Cost', '75/t']],
      steps: [{ type: 'num', q: 'Refining margin per t white?', ans: m, tol: 0.2, unit: 'USD/t', work: [`Raw = ${f(C.centsPerLbToUsdPerT(20.1))}`, `(raw + 25) × 1.06 = ${f((C.centsPerLbToUsdPerT(20.1) + 25) * 1.06)}`, `560 − that − 75 = ${f(m)}`] },
        { type: 'choice', q: 'Your negotiating stance?', opts: [['The refinery is losing money at current prices; a modest premium concession or flexible timing can secure volume — but check alternatives for your cargo first', 100, 'Use their economics to find agreement space.'], ['Refuse any change — premiums are fixed', 30, 'May lose the buyer if margins are negative.'], ['Offer a large discount immediately', 20, 'Concede only what is needed, in exchange for something (volume, payment terms).']] }],
      solution: `Margin ${f(m)}/t. When the white premium is thin, refiners resist raw premiums; know your BATNA.`, skills: ['sugar', 'negotiation'] });
  })();
  (() => {
    const dem = 7 * 16000, bags = 0.004 * 9000 * 600, fin = C.interest(9000 * 600, 8, 7), tot = dem + bags + fin;
    kc({ id: 'sc9', commodity: 'sugar', title: 'Managing a shipment delay', brief: 'A breakbulk sugar vessel waits at a congested port and some bags are damaged.',
      context: '9,000 t bagged refined sugar (600/t) waits 7 days beyond laytime at discharge (demurrage 16,000/day, for your account under the charter but not recoverable from the buyer). 0.4% of bags are torn and sold at a total loss. Financing 8% p.a.',
      data: [['Delay', '7 days × 16,000'], ['Damage', '0.4% of cargo'], ['Cargo value', '9,000 × 600']],
      steps: [{ type: 'num', q: 'Total cost of the incident (USD)?', ans: tot, tol: 5, unit: 'USD', work: [`Demurrage = ${f(dem, 0)}`, `Damage = ${f(bags, 0)}`, `Financing = ${f(fin)}`, `Total = ${f(tot)}`] },
        { type: 'choice', q: 'Which action recovers the most?', opts: [['File a cargo insurance claim for the bag damage (survey, photos) and review whether laytime exceptions apply to the congestion', 100, 'Insurance and charter terms are your recovery routes.'], ['Absorb it — nothing can be done', 10, 'Recoveries are often available.'], ['Deduct it from the supplier invoice', 0, 'The supplier is not responsible for discharge congestion.']] }],
      solution: `Cost ${f(tot, 0)}. Match laytime terms between charter and sales contract to avoid unrecoverable demurrage.`, skills: ['sugar', 'logistics'] });
  })();
  (() => {
    const d = C.dealPnL({ qty: 25000, buyTerm: 'FOB', buyPrice: C.centsPerLbToUsdPerT(19.8 + 0.4), freight: 31, insurancePct: 0.1, inspection: 9000, financeRatePct: 7, financeDays: 55, sellPrice: C.centsPerLbToUsdPerT(19.8) + 62, sellingLump: 30000 });
    kc({ id: 'sc10', commodity: 'sugar', title: 'Final trading profitability of a raw sugar deal', brief: 'Futures-based purchase, CFR sale at a fixed premium.',
      context: 'Buy 25,000 t raw FOB at futures 19.80 + 0.40 c/lb. Sell CFR at the same futures level + 62 USD/t (the hedge offsets futures moves; we assume flat price unchanged). Freight 31/t; insurance 0.10% × 110%; inspection 9,000; financing 7% for 55 days; brokerage 30,000.',
      data: [['Buy', '19.80 + 0.40 c/lb FOB'], ['Sell', 'futures + 62/t CFR'], ['Freight', '31'], ['Other', '9k + 30k']],
      steps: [{ type: 'num', q: 'Net profit (USD)?', ans: d.netProfit, tol: 10, unit: 'USD', work: [`Buy = ${f(d.landed.goods / 25000)}/t; sell = ${f(C.centsPerLbToUsdPerT(19.8) + 62)}/t`, `Landed = ${f(d.landed.total, 0)}`, `Net = ${f(d.netProfit, 0)}`] },
        { type: 'choice', q: 'What is the main driver of this deal\'s profit?', opts: [['The differential: sale premium (62/t) minus purchase premium (0.40 c/lb ≈ 8.82/t) minus freight and costs', 100, 'Physical traders earn differentials and logistics, not flat price.'], ['The flat price of sugar', 0, 'Flat price is hedged.'], ['Insurance', 0, 'Minor.']] }],
      solution: `Net ${f(d.netProfit, 0)} (${f(d.profitPerT)}/t).`, skills: ['sugar', 'physical'] });
  })();

  /* =========================================================== STEEL */
  (() => {
    const split = [[12, 30], [16, 40], [20, 20], [25, 10]];
    const tot = 2400;
    const w16 = tot * 0.4, bars16 = w16 * 1000 / (C.rebarKgPerM(16) * 12);
    kc({ id: 'stc1', commodity: 'steel', title: 'Buying rebar for a construction project', brief: 'Translate a project bill of quantities into a rebar order.',
      context: 'A contractor needs 2,400 t of B500B-type rebar (12 m lengths) split by diameter: Ø12 30%, Ø16 40%, Ø20 20%, Ø25 10%. Theoretical weights per standard tables.',
      data: split.map(([d, p]) => [`Ø${d} mm`, `${p}% → ${tot * p / 100} t (${f(C.rebarKgPerM(d), 3)} kg/m)`]),
      steps: [{ type: 'num', q: 'How many 12 m bars of Ø16 are in the order (nearest whole)?', ans: Math.round(bars16), tol: 2, dp: 0, unit: 'bars', work: [`Ø16 tonnage = 960 t`, `Bar mass = ${f(C.rebarKgPerM(16), 4)} × 12 = ${f(C.rebarKgPerM(16) * 12, 3)} kg`, `960,000 / ${f(C.rebarKgPerM(16) * 12, 3)} = ${f(bars16, 0)}`] },
        { type: 'choice', q: 'Which contract term matters most for the contractor?', opts: [['Size split with per-size tolerances, standard/grade with MTCs traceable by heat, and delivery schedule matched to the pour programme', 100, 'Project buyers need the right sizes at the right time with certification.'], ['Only the lowest price per tonne', 20, 'Wrong sizes or late delivery stop the site.'], ['Coil weights', 0, 'Not relevant to straight-length rebar.']] }],
      solution: 'Rebar is not one product: size split, grade, lengths and certification are part of the deal.', skills: ['steel', 'physical'] });
  })();
  (() => {
    const a = 598 + 36 + 0, b = 612 + 30;
    kc({ id: 'stc2', commodity: 'steel', title: 'Comparing hot-rolled coil suppliers', brief: 'Price vs edge condition, tolerances and freight.',
      context: 'A pipe maker needs HRC 6 mm × 1,500 mm, S275-type, trimmed edges, thickness tolerance ±0.20 mm. Supplier A: FOB 598, freight 36, mill edge (trimming at buyer costs 18/t with 1.5% yield loss on 640/t value), tolerance ±0.30. Supplier B: FOB 612, freight 30, trimmed edges, ±0.20.',
      data: [['A', '598 + 36, mill edge, ±0.30'], ['B', '612 + 30, trimmed, ±0.20']],
      steps: [{ type: 'num', q: 'Adjusted delivered cost of A including trimming and yield loss (USD/t)?', ans: a + 18 + 640 * 0.015, tol: 0.05, unit: 'USD/t', work: ['CFR 634', 'Trimming 18', 'Yield loss 1.5% × 640 = 9.60', `Total = ${f(a + 18 + 9.6)}`] },
        { type: 'choice', q: 'Choose supplier', opts: [['B — meets spec and is cheaper after adjustments (642 vs 661.60); A\'s wider tolerance may also fail the pipe mill\'s requirements', 100, 'Correct.'], ['A — lower FOB', 0, 'Ignores processing cost and specification risk.'], ['Split order 50/50', 30, 'Only if A\'s tolerance is acceptable, which it is not here.']] }],
      solution: `B 642 vs A ${f(a + 27.6)}. Specification compliance comes first.`, skills: ['steel'] });
  })();
  (() => {
    kc({ id: 'stc3', commodity: 'steel', title: 'Evaluating different steel grades', brief: 'A cheaper grade cannot replace a design-specified grade.',
      context: 'A structural engineer specified S355-type steel for beams (higher yield strength). A trader offers S235-type at 45/t less and says "you can just use thicker sections".',
      data: [['Specified', 'S355-type (yield ~355 MPa)'], ['Offered', 'S235-type (yield ~235 MPa), −45/t']],
      steps: [{ type: 'num', q: 'Ratio of nominal minimum yield strengths (355/235)?', ans: 355 / 235, tol: 0.005, dp: 3, unit: '×', work: ['355 / 235 = 1.511'] },
        { type: 'choice', q: 'Your recommendation to the buyer?', opts: [['Reject the substitution unless the engineer redesigns and approves; grade is a design requirement, not a price variable', 100, 'Safety and code compliance override savings; heavier sections would also cost more steel.'], ['Accept to save 45/t', 0, 'Unsafe and likely non-compliant.'], ['Accept but ask for a bigger discount', 0, 'The issue is compliance, not price.']] }],
      solution: 'About 51% higher yield strength cannot be offset by a price discount. Steel grades are not interchangeable.', skills: ['steel'] });
  })();
  (() => {
    const lc = C.landedCost({ qty: 5000, buyTerm: 'FOB', buyPrice: 560, freight: 38, insurancePct: 0.15, dutyPct: 5, portCharges: 9, inlandDest: 12, financeRatePct: 7, financeDays: 50, financeBase: 'all' });
    kc({ id: 'stc4', commodity: 'steel', title: 'Landed cost per tonne of rebar', brief: 'FOB to site including duty and financing.',
      context: '5,000 t rebar FOB 560; freight 38/t; insurance 0.15% on 110% of CFR; duty 5% on CIF; port & discharge 9/t; inland 12/t; financing 7% for 50 days on all costs before financing.',
      data: [['FOB', '560'], ['Freight', '38'], ['Duty', '5% CIF'], ['Port/inland', '9 + 12'], ['Finance', '7% × 50 d']],
      steps: [{ type: 'num', q: 'Landed cost per t?', ans: lc.perT, tol: 0.05, unit: 'USD/t', work: [`CIF value per t = ${f(lc.cifValue / 5000)}`, `Duty per t = ${f(lc.lines.duty / 5000)}`, `Before financing per t = ${f(lc.perTBeforeFinancing)}`, `Financing per t = ${f(lc.lines.financing / 5000)}`, `Landed = ${f(lc.perT)}`] }],
      solution: `Landed ${f(lc.perT)}/t (financing here is on all costs incl. duty, so it is slightly higher than the lesson example that financed only CIF).`, skills: ['steel', 'foundations'] });
  })();
  (() => {
    const disc = 12, store = 3.5 * 4, fin = C.interest(640, 8, 120);
    kc({ id: 'stc5', commodity: 'steel', title: 'Negotiating a bulk purchase', brief: 'A volume discount that requires you to hold stock longer.',
      context: 'A distributor can buy 6,000 t of wire rod in one shipment at 12/t discount versus three monthly shipments of 2,000 t. The single shipment means holding average extra stock for about 4 months: storage 3.5/t/month, financing 8% p.a. on 640/t for 120 days.',
      data: [['Discount', '12/t'], ['Storage', '3.5/t/month × 4'], ['Financing', '8% × 120 d on 640']],
      steps: [{ type: 'num', q: 'Net benefit (or cost) per t of the single shipment?', ans: disc - store - fin, tol: 0.02, unit: 'USD/t', work: [`Storage = ${f(store)}`, `Financing = ${f(fin)}`, `Net = 12 − ${f(store)} − ${f(fin)} = ${f(disc - store - fin)}`] },
        { type: 'choice', q: 'Decision?', opts: [['Decline or negotiate a bigger discount/extended payment terms — the discount does not cover carrying costs and price risk', 100, 'Correct.'], ['Accept — 12/t discount', 0, 'Carrying costs exceed it.'], ['Accept and hope prices rise', 10, 'Speculation, not procurement.']] }],
      solution: `Net ${f(disc - store - fin)}/t: the "discount" costs money. Ask for payment terms that offset the carry.`, skills: ['steel', 'negotiation'] });
  })();
  (() => {
    const d = 1.6 * 110 * 0.15 + 0.7 * 250 * 0.10;
    kc({ id: 'stc6', commodity: 'steel', title: 'Assessing raw material price changes', brief: 'Ore +15%, coal +10%: what does it do to mill costs — and prices?',
      context: 'Illustrative BF-BOF ratios: 1.6 t ore and 0.7 t coking coal per t of steel. Ore rises from 110 to 126.5 (+15%); coal from 250 to 275 (+10%).',
      data: [['Ore', '110 → 126.5'], ['Coal', '250 → 275'], ['Ratios', '1.6 / 0.7 (illustrative)']],
      steps: [{ type: 'num', q: 'Increase in raw-material cost per t of steel?', ans: d, tol: 0.01, unit: 'USD/t', work: ['Ore: 1.6 × 16.5 = 26.40', 'Coal: 0.7 × 25 = 17.50', `Total = ${f(d)}`] },
        { type: 'choice', q: 'Will HRC prices rise by the same amount next week?', opts: [['Not necessarily — pass-through depends on demand, capacity utilisation, inventories, imports and contract lags', 100, 'Correct.'], ['Yes, immediately', 0, 'Pass-through is partial and lagged.'], ['They will fall', 10, 'Possible if demand collapses, but not caused by the cost rise.']] }],
      solution: `Costs +${f(d)}/t. Margins absorb part of it unless demand is strong.`, skills: ['steel', 'analysis'] });
  })();
  (() => {
    const allow = 4800 * 0.03 * 640 * 0.25 + 3500;
    kc({ id: 'stc7', commodity: 'steel', title: 'Managing a quality claim', brief: 'Rust on a share of bundles at discharge.',
      context: '4,800 t rebar at 640/t. At discharge, a joint survey finds 3% of bundles with surface rust beyond the contract\'s acceptance criteria; the parties agree a 25% price allowance on the affected tonnage plus the survey cost of 3,500 to be paid by the seller.',
      data: [['Cargo', '4,800 t × 640'], ['Affected', '3%'], ['Allowance', '25% + survey 3,500']],
      steps: [{ type: 'num', q: 'Total claim settlement (USD)?', ans: allow, tol: 1, unit: 'USD', work: ['Affected = 144 t', '144 × 640 × 25% = 23,040', `+ 3,500 = ${f(allow, 0)}`] },
        { type: 'choice', q: 'As the trader (seller to the buyer, buyer from the mill), what next?', opts: [['Settle with the buyer and pass the claim back to the mill/carrier depending on the cause (packing vs wet stowage), using the survey evidence', 100, 'Back-to-back recovery with evidence.'], ['Pay and forget', 20, 'You may be able to recover.'], ['Refuse — rust is normal', 0, 'Not when it exceeds agreed criteria.']] }],
      solution: 'Evidence (joint survey, photos, stowage records) determines whether the mill (packing/protection) or the carrier (wet stowage) is liable.', skills: ['steel', 'physical'] });
  })();
  (() => {
    const t = 2000, st = 20, tPerC = C.convertMass(st, 'st', 't'), n = Math.round(t / tPerC);
    kc({ id: 'stc8', commodity: 'steel', title: 'Hedging a steel price exposure', brief: 'An HRC contract exists — but does it match your exposure?',
      context: 'A European service centre has sold 2,000 t of HRC forward at a fixed price to a customer but has not bought it yet. It considers buying US Midwest-type HRC futures (illustrative: 20 short tons per contract, USD per short ton).',
      data: [['Exposure', 'short 2,000 t HRC (Europe)'], ['Contract (illustrative)', '20 short tons, USD/st']],
      steps: [{ type: 'num', q: 'Contracts for a 1:1 tonnage hedge (nearest whole)?', ans: n, tol: 0, dp: 0, unit: 'contracts', work: [`20 st = ${f(tPerC, 3)} t`, `2,000 / ${f(tPerC, 3)} = ${f(t / tPerC, 2)} → ${n}`] },
        { type: 'choice', q: 'Is this a good hedge?', opts: [['Partially at best: US and European HRC prices can diverge (basis, currency, trade policy); consider a European-referenced instrument or a back-to-back fixed purchase, and size the hedge after analysing correlation', 100, 'Steel hedging depends on product, region, benchmark and liquidity.'], ['Yes, perfect hedge', 0, 'Regional HRC prices are imperfectly correlated.'], ['Steel cannot be hedged at all', 30, 'Some instruments exist; the issue is fit and liquidity.']] }],
      solution: `${n} contracts match tonnage, but basis risk between regions and currency exposure remain.`, skills: ['steel', 'derivatives'] });
  })();
  (() => {
    const cif = 610 + 34, a = cif * (1 + 0.185), b = (628 + 29) * 1.0;
    kc({ id: 'stc9', commodity: 'steel', title: 'Evaluating import duties and trade remedies', brief: 'An anti-dumping duty on one origin changes the deal.',
      context: 'Galvanised coil to an importer: Origin A CFR 644 (FOB 610 + freight 34) faces an 18.5% anti-dumping duty on CIF (insurance ignored here). Origin B CFR 657 faces no trade-remedy duty; normal duty is 0% for both under the importer\'s tariff.',
      data: [['A', 'CFR 644, AD duty 18.5%'], ['B', 'CFR 657, no AD duty']],
      steps: [{ type: 'num', q: 'Duty-paid cost of A per t?', ans: a, tol: 0.05, unit: 'USD/t', work: ['644 × 1.185 = ' + f(a)] },
        { type: 'choice', q: 'Which origin and why?', opts: [['B: 657 vs A ' + f(a) + ' — and verify origin rules so B\'s material is not re-labelled A-origin (circumvention)', 100, 'Correct and compliance-aware.'], ['A — lower CFR', 0, 'Ignores the duty.'], ['Ship A via a third country to avoid duty', 0, 'This is circumvention and can be illegal.']] }],
      solution: 'Trade remedies are origin-specific. Origin documentation and anti-circumvention rules are critical.', skills: ['steel', 'finance'] });
  })();
  (() => {
    const d = C.dealPnL({ qty: 8000, buyTerm: 'FOB', buyPrice: 545, freight: 41, insurancePct: 0.15, inspection: 11000, dutyPct: 0, portCharges: 0, financeRatePct: 7.5, financeDays: 70, sellPrice: 618, commissionPct: 1, otherDealExp: 20000 });
    kc({ id: 'stc10', commodity: 'steel', title: 'Profit of an international steel trade', brief: 'FOB purchase from a mill, CFR sale to a distributor with commission.',
      context: 'Buy 8,000 t rebar FOB 545; freight 41/t; insurance 0.15% × 110% CFR; pre-shipment inspection 11,000; financing 7.5% for 70 days; sell CFR 618 with a 1% agent commission; other deal expenses 20,000.',
      data: [['Buy', 'FOB 545'], ['Sell', 'CFR 618, 1% commission'], ['Freight', '41'], ['Other', '11k + 20k']],
      steps: [{ type: 'num', q: 'Net profit (USD)?', ans: d.netProfit, tol: 5, unit: 'USD', work: [`Landed = ${f(d.landed.total, 0)}`, `Net revenue = ${f(d.netRevenue, 0)}`, `Net = ${f(d.netProfit, 0)}`] },
        { type: 'num', q: 'Annualised ROIC if 75% of working capital is bank-funded (%)?', ans: C.dealPnL(Object.assign({ qty: 8000, buyTerm: 'FOB', buyPrice: 545, freight: 41, insurancePct: 0.15, inspection: 11000, financeRatePct: 7.5, financeDays: 70, sellPrice: 618, commissionPct: 1, otherDealExp: 20000, bankFundedPct: 75 })).roicAnnual * 100, tol: 0.5, unit: '%', work: ['Equity = 25% of working capital (landed before financing)', 'ROIC = net / equity; × 365/70'] }],
      solution: `Net ${f(d.netProfit, 0)}; margin ${f(d.netMarginPct)}%.`, skills: ['steel', 'physical'] });
  })();

  CASES.forEach((c) => { c.steps.forEach((s, i) => { s.id = c.id + '-' + i; }); });
})();
