/* Numerical exercises. Each `gen(rng)` draws simulated inputs and returns the prompt, the exact answer
 * (computed with the CALC library where possible), tolerance, formula, worked steps, common mistakes
 * and the commercial implication. "New numbers" redraws inputs so exercises can be repeated. */
(function () {
  const CTA = window.CTA, C = window.CALC;
  const f = (n, d = 2) => CTA.fmt.num(n, d);
  const E = (CTA.EXERCISES = []);
  const ex = (id, topic, title, gen) => E.push({ id, topic, topicLabel: CTA.TOPICS ? CTA.TOPICS[topic] : topic, title, gen });
  const rr = (r, lo, hi, step) => Math.round(r.range(lo, hi) / step) * step;

  /* ------------------------------------------------------------ foundations */
  ex('ex-spread', 'foundations', 'Round-trip cost of the bid-ask spread', (r) => {
    const bid = rr(r, 1900, 2100, 0.1), sp = rr(r, 0.3, 1.5, 0.1), ask = bid + sp, q = r.int(2, 20) * 100;
    const ans = sp * q;
    return { prompt: `A dealer quotes gold at bid ${f(bid)} / ask ${f(ask)} per oz. You buy ${f(q, 0)} oz and immediately sell them back. What is your loss from the spread (USD)?`, answer: ans, unit: 'USD', tol: 0.5,
      formula: 'Loss = (ask − bid) × quantity', steps: [`Spread = ${f(ask)} − ${f(bid)} = ${f(sp)}`, `Loss = ${f(sp)} × ${f(q, 0)} = ${f(ans)}`],
      mistakes: 'Using half the spread, or forgetting you buy at the higher (ask) price.', implication: 'Frequent trading in wide-spread products erodes returns; always value positions at the price you can actually exit (bid for longs).' };
  });
  ex('ex-netprofit', 'foundations', 'Net profit of a simple cargo', (r) => {
    const q = r.int(5, 40) * 1000, buy = rr(r, 200, 320, 1), m = rr(r, 18, 45, 1), sell = buy + m, log = rr(r, 10, 30, 0.5), fin = rr(r, 1.5, 5, 0.1);
    const ans = (sell - buy - log - fin) * q;
    return { prompt: `You buy ${f(q, 0)} t at ${f(buy)}/t and sell at ${f(sell)}/t. Logistics cost ${f(log)}/t and financing ${f(fin)}/t. Net profit?`, answer: ans, unit: 'USD', tol: 1,
      formula: 'Net profit = (sell − buy − logistics − financing) × quantity', steps: [`Margin per t = ${f(sell)} − ${f(buy)} − ${f(log)} − ${f(fin)} = ${f(sell - buy - log - fin)}`, `× ${f(q, 0)} t = ${f(ans)}`],
      mistakes: 'Multiplying the headline margin (sell − buy) by quantity and forgetting costs.', implication: `The headline spread of ${f(m)}/t shrinks to ${f(sell - buy - log - fin)}/t: ${f((log + fin) / m * 100, 0)}% of it goes to costs.` };
  });
  ex('ex-financing', 'foundations', 'Financing cost of a cargo (ACT/360)', (r) => {
    const amt = r.int(20, 120) * 100000, rate = rr(r, 4, 11, 0.25), days = r.int(20, 120);
    const ans = C.interest(amt, rate, days);
    return { prompt: `A bank finances ${f(amt, 0)} at ${f(rate)}% per year for ${days} days (ACT/360). Interest cost?`, answer: ans, unit: 'USD', tol: 1,
      formula: 'Interest = principal × rate × days ÷ 360', steps: [`${f(amt, 0)} × ${f(rate)}% × ${days} / 360 = ${f(ans)}`],
      mistakes: 'Using 365 when the facility is ACT/360, or forgetting to divide the annual rate by days in the year.', implication: 'Each extra day of delay costs ' + f(ans / days) + ' in interest alone.' };
  });
  ex('ex-roic', 'foundations', 'Annualised return on equity employed', (r) => {
    const profit = r.int(40, 300) * 1000, wc = r.int(15, 60) * 100000, bank = r.pick([60, 70, 75, 80, 85]), days = r.int(30, 150);
    const eq = wc * (1 - bank / 100), roic = profit / eq * 100, ann = roic * 365 / days;
    return { prompt: `A deal earns ${f(profit, 0)} net profit. Working capital is ${f(wc, 0)}, of which the bank funds ${bank}%. The cycle lasts ${days} days. What is the annualised return on the trader's equity (%)?`, answer: ann, unit: '%', tol: 0.5,
      formula: 'ROIC = profit ÷ (working capital × (1 − bank share)); annualised = ROIC × 365 ÷ days', steps: [`Equity = ${f(wc, 0)} × ${100 - bank}% = ${f(eq, 0)}`, `ROIC = ${f(profit, 0)} / ${f(eq, 0)} = ${f(roic)}%`, `Annualised = ${f(roic)}% × 365 / ${days} = ${f(ann)}%`],
      mistakes: 'Dividing by total working capital instead of equity, or forgetting to annualise.', implication: 'Leverage magnifies return on equity — and magnifies losses the same way.' };
  });
  ex('ex-breakeven', 'foundations', 'Break-even selling price with commission', (r) => {
    const q = r.int(5, 30) * 1000, cost = r.int(200, 600) * q, comm = r.pick([0.5, 1, 1.5, 2]);
    const total = Math.round(cost * r.range(0.95, 1.05));
    const ans = total / (q * (1 - comm / 100));
    return { prompt: `Total costs of a ${f(q, 0)} t deal are ${f(total, 0)}. The buyer's agent takes a ${comm}% commission on sales value. Break-even selling price per t?`, answer: ans, unit: 'USD/t', tol: 0.05,
      formula: 'Break-even = total costs ÷ (quantity × (1 − commission %))', steps: [`Cost per t = ${f(total / q)}`, `Divide by (1 − ${comm}%) = ${f(1 - comm / 100, 3)} → ${f(ans)}`],
      mistakes: 'Adding the commission % to the cost per tonne instead of grossing up (commission applies to the selling price itself).', implication: 'Never quote below break-even; it is your walk-away price in negotiations.' };
  });
  ex('ex-wc', 'foundations', 'Working capital requirement', (r) => {
    const cargo = r.int(30, 90) * 100000, costs = r.int(2, 9) * 100000, adv = r.pick([0, 10, 15, 20]), sup = r.pick([0, 20, 30, 50]);
    const ans = Math.max(0, cargo + costs - cargo * sup / 100 - (cargo * 1.05) * adv / 100);
    return { prompt: `You pay ${f(cargo, 0)} for a cargo and ${f(costs, 0)} of costs before the buyer pays. The supplier grants credit on ${sup}% of the cargo value until after you collect, and the buyer pays an advance of ${adv}% of the sale value (sale value = cargo value × 1.05). Working capital you must fund?`, answer: ans, unit: 'USD', tol: 1,
      formula: 'WC = purchase + costs − supplier credit − buyer advance', steps: [`Supplier credit = ${f(cargo * sup / 100, 0)}`, `Buyer advance = ${f(cargo * 1.05 * adv / 100, 0)}`, `WC = ${f(cargo + costs, 0)} − ${f(cargo * sup / 100, 0)} − ${f(cargo * 1.05 * adv / 100, 0)} = ${f(ans, 0)}`],
      mistakes: 'Forgetting supplier credit reduces your funding need, or computing the advance on purchase value instead of sale value.', implication: 'Negotiating payment terms can free more capital than negotiating price.' };
  });
  /* ------------------------------------------------------------ accounting */
  ex('ex-ocf', 'accounting', 'Operating cash flow from working-capital changes', (r) => {
    const p = rr(r, 1, 6, 0.1), inv = rr(r, -3, 9, 0.1), rec = rr(r, -2, 8, 0.1), pay = rr(r, -2, 6, 0.1), mtm = rr(r, 0, 1.5, 0.1);
    const ans = p - mtm - inv - rec + pay;
    return { prompt: `A trader reports net profit of ${f(p, 1)}m, including ${f(mtm, 1)}m of unrealised MTM gains. Inventories changed by ${f(inv, 1)}m, receivables by ${f(rec, 1)}m and payables by ${f(pay, 1)}m (positive = increase). Operating cash flow (m)?`, answer: ans, unit: 'm', tol: 0.05, dp: 2,
      formula: 'OCF ≈ profit − non-cash gains − Δinventory − Δreceivables + Δpayables', steps: [`${f(p, 1)} − ${f(mtm, 1)} − (${f(inv, 1)}) − (${f(rec, 1)}) + (${f(pay, 1)}) = ${f(ans)}`],
      mistakes: 'Adding increases in inventory/receivables (they consume cash) or forgetting to remove non-cash MTM gains.', implication: ans < 0 ? 'Profitable but cash-consuming: the gap must be funded by banks or equity.' : 'Profit converted into cash this period.' };
  });
  ex('ex-cashgap', 'accounting', 'Peak cash need from payment timing', (r) => {
    const n = r.int(2, 6), v = r.int(20, 60) * 100000, gap = r.int(30, 120), every = r.pick([15, 20, 30]);
    const overlap = Math.min(n, Math.floor(gap / every) + 1);
    const ans = overlap * v;
    return { prompt: `You start a new cargo every ${every} days. Each cargo costs ${f(v, 0)}, paid to the supplier on day 0 of that cargo, and the buyer pays ${gap} days later. You run ${n} cargoes in total. Ignoring profit, what is the maximum cash tied up at one time?`, answer: ans, unit: 'USD', tol: 1,
      formula: 'Peak cash = number of cargoes paid but not yet collected at the same time × cargo cost', steps: [`Cargoes overlapping = min(${n}, floor(${gap}/${every}) + 1) = ${overlap}`, `Peak = ${overlap} × ${f(v, 0)} = ${f(ans, 0)}`],
      mistakes: 'Counting only one cargo, ignoring that new cargoes start before old ones are paid.', implication: 'Growth in volume or longer buyer terms increases the funding need even when every deal is profitable.' };
  });
  /* ------------------------------------------------------------ gold */
  ex('ex-gold-fine', 'gold', 'Fine gold content from karat and grams', (r) => {
    const k = r.pick([14, 18, 21, 22]), g = rr(r, 20, 900, 0.5);
    const ans = C.convertMass(g * k / 24, 'g', 'ozt');
    return { prompt: `A batch of ${k}-karat jewellery scrap weighs ${f(g, 1)} g. How many fine troy ounces of gold does it contain?`, answer: ans, unit: 'fine ozt', tol: 0.005, dp: 3,
      formula: 'Fine oz = grams × (karat ÷ 24) ÷ 31.1034768', steps: [`Fineness = ${k}/24 = ${f(k / 24, 4)}`, `Fine grams = ${f(g, 1)} × ${f(k / 24, 4)} = ${f(g * k / 24, 3)} g`, `÷ 31.1034768 = ${f(ans, 3)} ozt`],
      mistakes: 'Dividing by 28.35 (avoirdupois ounce) — a ~9.7% error.', implication: 'Scrap buyers also deduct refining charges and assay tolerances, so the payable ounces are less than this.' };
  });
  ex('ex-gold-invoice', 'gold', 'Invoice value of kilobars', (r) => {
    const n = r.int(5, 60), spot = rr(r, 1850, 2400, 0.05), prem = rr(r, -1, 4, 0.1), fin = r.pick([0.995, 0.9999]);
    const oz = C.fineOunces(n, 'kg', fin), ans = oz * (spot + prem);
    return { prompt: `You sell ${n} gold bars of 1 kg at ${fin === 0.995 ? '995.0' : '999.9'} fineness. Price: spot ${f(spot)} ${prem >= 0 ? '+' : '−'} ${f(Math.abs(prem))} per fine oz. Invoice value?`, answer: ans, unit: 'USD', tol: 5,
      formula: 'Value = bars × 32.1507 × fineness × (spot ± premium)', steps: [`Fine oz = ${n} × 32.15075 × ${fin} = ${f(oz, 3)}`, `Price = ${f(spot + prem)} per oz`, `Value = ${f(ans)}`],
      mistakes: 'Using gross instead of fine weight, or 32 oz/kg.', implication: 'A 0.1% error on a 60-bar lot is roughly USD 4,000.' };
  });
  ex('ex-gold-ozerror', 'gold', 'Cost of confusing troy and avoirdupois ounces', (r) => {
    const kg = r.int(5, 100), spot = rr(r, 1800, 2400, 1);
    const right = C.convertMass(kg, 'kg', 'ozt') * spot, wrong = C.convertMass(kg, 'kg', 'oz') * spot, ans = wrong - right;
    return { prompt: `A clerk values ${kg} kg of fine gold at ${f(spot, 0)} per ounce but uses the avoirdupois ounce (28.3495 g) instead of the troy ounce. By how much does the valuation overstate the true value?`, answer: ans, unit: 'USD', tol: 5,
      formula: 'Error = kg × (35.274 − 32.1507) × price', steps: [`Avoirdupois oz = ${f(C.convertMass(kg, 'kg', 'oz'), 3)}; troy oz = ${f(C.convertMass(kg, 'kg', 'ozt'), 3)}`, `Difference × ${f(spot, 0)} = ${f(ans)}`],
      mistakes: 'Assuming "an ounce is an ounce".', implication: 'Unit discipline is a basic control — the error is ~9.7% of value.' };
  });
  ex('ex-gold-carry', 'gold', 'Fair gold forward from carry', (r) => {
    const s = rr(r, 1850, 2400, 1), rate = rr(r, 2, 6, 0.25), lease = rr(r, 0.1, 1.5, 0.05), d = r.pick([30, 60, 90, 180]);
    const ans = C.carryForward({ spot: s, ratePct: rate, leasePct: lease, days: d });
    return { prompt: `Gold spot ${f(s, 0)}/oz, USD rate ${f(rate)}%, gold lease rate ${f(lease)}%, ${d} days, ACT/360, ignoring storage. Fair forward price?`, answer: ans, unit: 'USD/oz', tol: 0.1,
      formula: 'F ≈ S × (1 + (r − lease) × d/360)', steps: [`Net carry = ${f(rate)}% − ${f(lease)}% = ${f(rate - lease)}%`, `F = ${f(s, 0)} × (1 + ${f(rate - lease)}% × ${d}/360) = ${f(ans)}`],
      mistakes: 'Ignoring the lease rate, or using the full year when the period is shorter.', implication: 'If futures trade well above this, cash-and-carry may pay — if you can finance and store at these rates.' };
  });
  ex('ex-gold-landed', 'gold', 'Landed cost per kilobar for an importer', (r) => {
    const spot = rr(r, 1900, 2400, 1), prem = rr(r, 0.5, 3, 0.1), duty = r.pick([0, 2.5, 5, 6, 10]), fr = rr(r, 0.03, 0.1, 0.01), ins = rr(r, 0.01, 0.05, 0.01);
    const v = C.fineOunces(1, 'kg', 0.9999) * (spot + prem), landed = v * (1 + fr / 100 + ins / 100) * (1 + duty / 100);
    return { prompt: `An importer buys a 1 kg 999.9 bar at spot ${f(spot, 0)} + ${f(prem, 1)}/oz. Secure freight costs ${f(fr)}% and insurance ${f(ins)}% of the bar value; import duty is ${duty}% on the value including freight and insurance. Landed cost per bar?`, answer: landed, unit: 'USD', tol: 2,
      formula: 'Landed = value × (1 + freight% + insurance%) × (1 + duty%)', steps: [`Bar value = 32.1475 oz × ${f(spot + prem, 1)} = ${f(v)}`, `Add freight & insurance → ${f(v * (1 + fr / 100 + ins / 100))}`, `Add duty ${duty}% → ${f(landed)}`],
      mistakes: 'Applying duty on the bar value only when the customs value includes freight and insurance (rules vary by country).', implication: `The local premium must exceed about ${f((landed / v - 1) * 100)}% for imports to be profitable.` };
  });
  /* ------------------------------------------------------------ wheat */
  ex('ex-wheat-shrink', 'wheat', 'Moisture shrink after drying', (r) => {
    const w = r.int(5, 60) * 100, m0 = rr(r, 14, 18, 0.1), m1 = rr(r, 12.5, 13.5, 0.5);
    const ans = C.dryWeight(w, m0, m1);
    return { prompt: `${f(w, 0)} t of wheat at ${f(m0, 1)}% moisture is dried to ${f(m1, 1)}%. What weight remains (t)?`, answer: ans, unit: 't', tol: 0.5,
      formula: 'Shrink % = (m0 − m1) ÷ (100 − m1); remaining = weight × (1 − shrink)', steps: [`Shrink = (${f(m0, 1)} − ${f(m1, 1)}) / (100 − ${f(m1, 1)}) = ${f(C.moistureShrinkPct(m0, m1), 3)}%`, `Remaining = ${f(w, 0)} × (1 − ${f(C.moistureShrinkPct(m0, m1) / 100, 5)}) = ${f(ans)}`],
      mistakes: 'Subtracting the moisture-point difference directly (that understates shrink).', implication: 'Buying wet grain means paying for water — and risking spoilage.' };
  });
  ex('ex-wheat-cbu', 'wheat', 'Converting cents per bushel to USD per tonne', (r) => {
    const c = rr(r, 480, 820, 0.25);
    const ans = C.centsPerBuToUsdPerT(c);
    return { prompt: `Wheat futures trade at ${f(c, 2)} US cents per bushel (60 lb bushel). Equivalent price in USD per metric ton?`, answer: ans, unit: 'USD/t', tol: 0.05,
      formula: 'USD/t = (c/bu ÷ 100) × 36.7437 bu/t', steps: [`${f(c, 2)} c = ${f(c / 100, 4)} USD/bu`, `× 36.7437 = ${f(ans)}`],
      mistakes: 'Forgetting to divide cents by 100, or using 2,204.6 lb ÷ 56 (corn bushel) instead of 60.', implication: 'Physical wheat is priced per tonne; converting correctly is required before comparing with FOB offers.' };
  });
  ex('ex-wheat-contracts', 'wheat', 'Number of futures contracts to hedge', (r) => {
    const t = r.int(5, 60) * 1000;
    const bu = C.convertMass(t, 't', 'bu_wheat'), ans = Math.round(bu / 5000);
    return { prompt: `A mill wants to hedge ${f(t, 0)} t of wheat inventory with futures of 5,000 bushels each (1:1 hedge ratio). How many contracts (rounded to the nearest whole contract)?`, answer: ans, unit: 'contracts', tol: 0, dp: 0,
      formula: 'Contracts = tonnes × 36.7437 ÷ 5,000', steps: [`${f(t, 0)} t × 36.7437 = ${f(bu, 0)} bu`, `÷ 5,000 = ${f(bu / 5000, 2)} → ${ans}`],
      mistakes: 'Dividing tonnes by 5,000 directly, or confusing bushels with tonnes.', implication: 'Rounding leaves a small unhedged residual — note it in the risk report.' };
  });
  ex('ex-wheat-sd', 'wheat', 'Ending stocks and stocks-to-use', (r) => {
    const b = r.int(15, 40), p = r.int(80, 140), i = r.int(2, 20), c = Math.round(p * r.range(0.85, 1.02)), e = r.int(5, 30);
    const bal = C.balance({ beginning: b, production: p, imports: i, consumption: c, exports: e });
    return { prompt: `A country\'s wheat balance (million t): beginning stocks ${b}, production ${p}, imports ${i}, consumption ${c}, exports ${e}. What is the stocks-to-use ratio (%), using total use = consumption + exports?`, answer: bal.stocksToUse, unit: '%', tol: 0.1,
      formula: 'Ending = B + P + I − C − X; stocks-to-use = ending ÷ (C + X)', steps: [`Ending = ${b} + ${p} + ${i} − ${c} − ${e} = ${bal.ending}`, `Use = ${c + e}`, `Ratio = ${bal.ending}/${c + e} = ${f(bal.stocksToUse)}%`],
      mistakes: 'Dividing by production, or forgetting exports in total use.', implication: 'Lower ratios mean less buffer and typically higher price sensitivity to shocks.' };
  });
  ex('ex-wheat-protein', 'wheat', 'Price after protein and moisture adjustments', (r) => {
    const base = rr(r, 230, 300, 0.5), bp = 12.5, act = rr(r, 11.8, 13.4, 0.1), scale = r.pick([1.5, 2, 2.5]), m = rr(r, 13.6, 14.5, 0.1);
    const protAdj = (act - bp) * scale;
    const moistAdj = -(m - 13.5) * base / 100;
    const ans = base + protAdj + moistAdj;
    return { prompt: `Contract: base ${f(base)}/t for ${bp}% protein, adjustment ±${f(scale, 1)}/t per 1.0 percentage point of protein (pro rata); moisture max 13.5% with a 1% price discount per point above 13.5% (pro rata). Delivered analysis: protein ${f(act, 1)}%, moisture ${f(m, 1)}%. Final price per t?`, answer: ans, unit: 'USD/t', tol: 0.05,
      formula: 'Price = base + (protein − 12.5) × scale − (moisture − 13.5) × 1% × base', steps: [`Protein adj = (${f(act, 1)} − 12.5) × ${f(scale, 1)} = ${f(protAdj)}`, `Moisture adj = −(${f(m, 1)} − 13.5) × 1% × ${f(base)} = ${f(moistAdj)}`, `Final = ${f(ans)}`],
      mistakes: 'Applying the moisture discount to the protein-adjusted price when the contract says base price (read the clause!).', implication: 'Quality scales transfer value between buyer and seller; inspection quality matters.' };
  });
  ex('ex-wheat-delivered', 'wheat', 'Delivered price at an inland mill', (r) => {
    const fob = rr(r, 210, 290, 0.5), fr = rr(r, 15, 45, 0.5), insPct = rr(r, 0.05, 0.2, 0.01), dis = rr(r, 4, 10, 0.5), inl = rr(r, 6, 20, 0.5), rate = rr(r, 5, 10, 0.25), days = r.int(30, 90);
    const cfr = fob + fr, ins = cfr * 1.1 * insPct / 100, cif = cfr + ins, fin = C.interest(cif, rate, days), ans = cif + dis + inl + fin;
    return { prompt: `Wheat FOB ${f(fob)}/t; freight ${f(fr)}/t; insurance ${f(insPct)}% on 110% of CFR; discharge & port ${f(dis)}/t; inland transport ${f(inl)}/t; financing ${f(rate)}% p.a. on the CIF value for ${days} days (ACT/360); duty 0. Delivered cost per t?`, answer: ans, unit: 'USD/t', tol: 0.05,
      formula: 'Delivered = FOB + freight + insurance + port + inland + financing', steps: [`CFR = ${f(cfr)}`, `Insurance = ${f(cfr)} × 1.1 × ${f(insPct)}% = ${f(ins)}`, `CIF = ${f(cif)}`, `Financing = ${f(cif)} × ${f(rate)}% × ${days}/360 = ${f(fin)}`, `Delivered = ${f(cif)} + ${f(dis)} + ${f(inl)} + ${f(fin)} = ${f(ans)}`],
      mistakes: 'Insuring only the FOB value, or forgetting financing.', implication: 'This is the cost to compare against the mill\'s delivered price or a competing origin.' };
  });
  /* ------------------------------------------------------------ sugar */
  ex('ex-sugar-conv', 'sugar', 'Raw sugar c/lb to USD/t', (r) => {
    const c = rr(r, 14, 28, 0.01);
    return { prompt: `Raw sugar futures trade at ${f(c)} US cents/lb. Equivalent in USD per metric ton?`, answer: C.centsPerLbToUsdPerT(c), unit: 'USD/t', tol: 0.05,
      formula: 'USD/t = c/lb × 22.0462', steps: [`${f(c)} × 22.0462 = ${f(C.centsPerLbToUsdPerT(c))}`], mistakes: 'Using 2,000 lb (short ton) or forgetting cents → dollars.', implication: 'Needed to compare raw and white sugar or to price freight-inclusive offers.' };
  });
  ex('ex-sugar-wp', 'sugar', 'White premium', (r) => {
    const raw = rr(r, 15, 26, 0.01), w = Math.round(C.centsPerLbToUsdPerT(raw) + r.range(60, 160));
    const ans = C.whitePremium(w, raw);
    return { prompt: `White sugar trades at ${f(w, 0)} USD/t and raw sugar at ${f(raw)} c/lb. White premium (USD/t)?`, answer: ans, unit: 'USD/t', tol: 0.1,
      formula: 'White premium = white USD/t − raw c/lb × 22.0462', steps: [`Raw = ${f(C.centsPerLbToUsdPerT(raw))} USD/t`, `Premium = ${f(w, 0)} − ${f(C.centsPerLbToUsdPerT(raw))} = ${f(ans)}`],
      mistakes: 'Subtracting c/lb directly from USD/t.', implication: 'If the premium falls below refining costs, destination refiners lose money and cut raw purchases.' };
  });
  ex('ex-sugar-pol', 'sugar', 'Polarisation premium (illustrative scale)', (r) => {
    const p = rr(r, 96, 99.5, 0.1), price = rr(r, 15, 25, 0.01), prem = 1.5;
    const pct = (p - 96) * prem, ans = price * (1 + pct / 100);
    return { prompt: `An illustrative contract pays a premium of ${prem}% of price per degree of polarisation above 96° (pro rata). Price basis is ${f(price)} c/lb; the cargo polarises at ${f(p, 1)}°. Adjusted price (c/lb)?`, answer: ans, unit: 'c/lb', tol: 0.005, dp: 3,
      formula: 'Adjusted = price × (1 + (pol − 96) × premium%)', steps: [`Premium = (${f(p, 1)} − 96) × ${prem}% = ${f(pct)}%`, `${f(price)} × ${f(1 + pct / 100, 4)} = ${f(ans, 3)}`],
      mistakes: 'Applying the premium per full degree only (it is pro rata here), or using a different base.', implication: 'Real contract scales vary — read the governing rules. Higher pol also means lower refining cost for the buyer.' };
  });
  ex('ex-sugar-refm', 'sugar', 'Refining margin per tonne', (r) => {
    const raw = rr(r, 15, 24, 0.01), w = Math.round(C.centsPerLbToUsdPerT(raw) + r.range(70, 150)), yieldR = r.pick([1.05, 1.06, 1.07]), cost = r.int(55, 95), fr = r.int(15, 35);
    const ans = C.refiningMargin({ whiteUsdPerT: w, rawCentsPerLb: raw, rawPerWhite: yieldR, refiningCostPerT: cost, freightRawPerT: fr });
    return { prompt: `A destination refinery buys raw sugar at ${f(raw)} c/lb plus freight ${fr} USD/t, needs ${yieldR} t raw per t white, has refining costs of ${cost} USD/t and sells white at ${f(w, 0)} USD/t. Margin per tonne of white?`, answer: ans, unit: 'USD/t', tol: 0.2,
      formula: 'Margin = white − (raw USD/t + freight) × raw-per-white − refining cost', steps: [`Raw = ${f(C.centsPerLbToUsdPerT(raw))} + ${fr} = ${f(C.centsPerLbToUsdPerT(raw) + fr)}`, `× ${yieldR} = ${f((C.centsPerLbToUsdPerT(raw) + fr) * yieldR)}`, `${f(w, 0)} − that − ${cost} = ${f(ans)}`],
      mistakes: 'Ignoring the raw-to-white conversion loss or freight on raws.', implication: ans < 0 ? 'Negative margin: the refinery would reduce runs.' : 'Positive margin supports raw sugar demand from this refiner.' };
  });
  /* ------------------------------------------------------------ steel */
  ex('ex-steel-rebar', 'steel', 'Theoretical weight of rebar bundles', (r) => {
    const d = r.pick([10, 12, 14, 16, 20, 25, 32]), len = r.pick([6, 12]), bars = r.int(50, 300), bundles = r.int(10, 80);
    const ans = C.rebarKgPerM(d) * len * bars * bundles / 1000;
    return { prompt: `${bundles} bundles of ${bars} bars each, rebar Ø${d} mm × ${len} m. Theoretical total weight (t), using density 7,850 kg/m³?`, answer: ans, unit: 't', tol: 0.05, dp: 3,
      formula: 'kg/m = π/4 × d² × 7,850 (≈ d²/162.2 with d in mm)', steps: [`kg/m = ${f(C.rebarKgPerM(d), 4)}`, `per bar = × ${len} = ${f(C.rebarKgPerM(d) * len, 3)} kg`, `total = × ${bars} × ${bundles} / 1000 = ${f(ans, 3)} t`],
      mistakes: 'Using diameter in metres incorrectly, or radius instead of diameter.', implication: 'If invoicing is on actual weight, compare with weighbridge results; mass tolerances per metre apply under standards.' };
  });
  ex('ex-steel-coil', 'steel', 'Coil / sheet weight from dimensions', (r) => {
    const t = r.pick([1.5, 2, 2.5, 3, 4, 6, 8]), w = r.pick([1000, 1250, 1500, 1800]), l = r.int(200, 1200);
    const ans = C.plateKg(t, w, l * 1000) / 1000;
    return { prompt: `An HRC coil is ${t} mm thick, ${w} mm wide and ${l} m long. Theoretical weight (t)?`, answer: ans, unit: 't', tol: 0.02, dp: 3,
      formula: 'Weight = thickness × width × length × 7,850 kg/m³', steps: [`Volume = ${t / 1000} m × ${w / 1000} m × ${l} m = ${f(t / 1000 * w / 1000 * l, 4)} m³`, `× 7.85 t/m³ = ${f(ans, 3)} t`],
      mistakes: 'Mixing mm and m.', implication: 'Coil weights must respect buyer crane and decoiler limits — part of the specification.' };
  });
  ex('ex-steel-duty', 'steel', 'Landed cost of steel with import duty', (r) => {
    const fob = rr(r, 480, 760, 1), fr = rr(r, 25, 60, 0.5), ins = rr(r, 0.1, 0.3, 0.05), duty = r.pick([0, 3, 5, 10, 15, 25]), port = rr(r, 6, 15, 0.5);
    const cfr = fob + fr, i = cfr * 1.1 * ins / 100, cif = cfr + i, d = cif * duty / 100, ans = cif + d + port;
    return { prompt: `HRC FOB ${f(fob, 0)}/t, freight ${f(fr)}/t, insurance ${f(ins)}% on 110% CFR, import duty ${duty}% on CIF value, port & handling ${f(port)}/t. Landed cost per t?`, answer: ans, unit: 'USD/t', tol: 0.05,
      formula: 'Landed = CIF × (1 + duty%) + port', steps: [`CFR = ${f(cfr)}`, `Ins = ${f(i)} → CIF ${f(cif)}`, `Duty = ${f(d)}`, `Landed = ${f(ans)}`],
      mistakes: 'Applying duty to FOB when customs value is CIF (or vice versa) — check the importing country\'s valuation rule.', implication: duty >= 10 ? 'A high duty can make this origin uncompetitive vs. duty-free or domestic supply.' : 'Low duty: freight and price dominate.' };
  });
  ex('ex-steel-st', 'steel', 'Short-ton price to metric-ton price', (r) => {
    const p = rr(r, 600, 1200, 1);
    return { prompt: `A US HRC price is quoted at ${f(p, 0)} USD per short ton. Equivalent per metric ton?`, answer: C.usdPerStToUsdPerT(p), unit: 'USD/t', tol: 0.05,
      formula: 'USD/t = USD/st × (1,000 ÷ 907.18474)', steps: [`${f(p, 0)} × 1.10231 = ${f(C.usdPerStToUsdPerT(p))}`], mistakes: 'Treating a short ton as a metric ton (10% error).', implication: 'Always convert benchmarks to the unit in your contract before comparing.' };
  });
  ex('ex-steel-spread', 'steel', 'BF-BOF raw-material spread (illustrative ratios)', (r) => {
    const ore = rr(r, 80, 140, 0.5), coal = rr(r, 180, 320, 1), hrc = rr(r, 450, 750, 1), oreR = 1.6, coalR = 0.7;
    const ans = hrc - ore * oreR - coal * coalR;
    return { prompt: `HRC sells at ${f(hrc, 0)}/t. Using illustrative ratios of ${oreR} t iron ore at ${f(ore, 1)}/t and ${coalR} t coking coal at ${f(coal, 0)}/t per tonne of steel, what is the raw-material spread per t?`, answer: ans, unit: 'USD/t', tol: 0.1,
      formula: 'Spread = HRC − 1.6 × ore − 0.7 × coal (illustrative)', steps: [`Ore cost = ${f(ore * oreR)}; coal cost = ${f(coal * coalR)}`, `Spread = ${f(ans)}`], mistakes: 'Treating the spread as profit: conversion costs, energy, labour and alloys must still be paid.', implication: 'A shrinking spread signals margin pressure, not necessarily higher steel prices.' };
  });
  /* ------------------------------------------------------------ finance & documents */
  ex('ex-lc-qty', 'finance', 'Maximum quantity under UCP 600 art. 30(b)', (r) => {
    const q = r.int(10, 60) * 1000, price = rr(r, 220, 600, 1), amtPct = r.pick([100, 103, 105]);
    const amount = q * price * amtPct / 100, ans = Math.min(q * 1.05, amount / price);
    return { prompt: `An LC (subject to UCP 600, no "about" wording) covers ${f(q, 0)} t of bulk wheat at ${f(price, 0)}/t with a credit amount of ${f(amount, 0)}. Partial and over-shipment tolerance follows art. 30(b). Maximum quantity (t) the seller can ship and still draw in full compliance?`, answer: ans, unit: 't', tol: 0.5,
      formula: 'Max = min(quantity × 1.05, credit amount ÷ unit price)', steps: [`+5% quantity = ${f(q * 1.05, 0)} t`, `Amount limit = ${f(amount, 0)} / ${f(price, 0)} = ${f(amount / price, 1)} t`, `Max = ${f(ans, 1)} t`],
      mistakes: 'Forgetting that the drawing cannot exceed the credit amount.', implication: 'Align the charter party and sales tolerance (e.g. ±10% MOLOO) with the LC — otherwise the extra tonnes cannot be paid under the LC.' };
  });
  ex('ex-lc-date', 'finance', 'Latest presentation date', (r) => {
    const sd = r.int(1, 20), exp = r.int(sd + 10, 31);
    const ans = Math.min(sd + 21, exp);
    return { prompt: `An LC is silent on presentation period and expires on ${exp} May. The bill of lading is dated ${sd} May. Latest day (in May) the seller may present? (Assume the day is a banking day.)`, answer: ans, unit: 'May', tol: 0, dp: 0,
      formula: 'Latest = min(shipment date + 21 calendar days, expiry date)', steps: [`${sd} + 21 = ${sd + 21}`, `Expiry = ${exp}`, `Latest = ${ans} May`],
      mistakes: 'Counting banking days instead of calendar days, or ignoring expiry.', implication: 'Late presentation is one of the most common discrepancies — courier time counts.' };
  });
  ex('ex-insurance', 'finance', 'Insured value and premium', (r) => {
    const cfr = r.int(20, 90) * 100000, rate = rr(r, 0.04, 0.3, 0.01);
    const ans = cfr * 1.1 * rate / 100;
    return { prompt: `CFR value of a cargo is ${f(cfr, 0)}. You insure 110% of value at a premium rate of ${f(rate)}%. Premium?`, answer: ans, unit: 'USD', tol: 1,
      formula: 'Premium = CFR × 110% × rate', steps: [`Insured = ${f(cfr * 1.1, 0)}`, `× ${f(rate)}% = ${f(ans)}`], mistakes: 'Insuring only 100%, or using the FOB value.', implication: 'Cheap in percentage terms, but an uninsured total loss would be catastrophic.' };
  });
  ex('ex-duty', 'finance', 'Duty on CIF vs FOB basis', (r) => {
    const fob = r.int(30, 90) * 10000, fr = r.int(3, 12) * 10000, ins = Math.round((fob + fr) * 1.1 * 0.0015), duty = r.pick([5, 8, 10, 12]);
    const ans = (fob + fr + ins) * duty / 100 - fob * duty / 100;
    return { prompt: `Goods FOB ${f(fob, 0)}, freight ${f(fr, 0)}, insurance ${f(ins, 0)}. Duty ${duty}%. How much more duty is payable if customs value is CIF rather than FOB?`, answer: ans, unit: 'USD', tol: 1,
      formula: 'Difference = (freight + insurance) × duty%', steps: [`(${f(fr, 0)} + ${f(ins, 0)}) × ${duty}% = ${f(ans)}`], mistakes: 'Assuming every country uses the same valuation base.', implication: 'Check the importing country\'s valuation rule before quoting DDP or landed prices.' };
  });
  /* ------------------------------------------------------------ logistics */
  ex('ex-laytime', 'logistics', 'Demurrage due', (r) => {
    const q = r.int(20, 65) * 1000, rate = r.pick([5000, 6000, 8000, 10000, 12000]), used = rr(r, 3, 14, 0.25), dem = r.int(10, 30) * 1000;
    const lt = C.laytime({ qty: q, rateTPerDay: rate, timeUsedDays: used, demurragePerDay: dem });
    const ans = lt.demurrage;
    return { prompt: `A vessel discharges ${f(q, 0)} t at an agreed rate of ${f(rate, 0)} t/day (no exceptions). Time used: ${f(used, 2)} days. Demurrage rate ${f(dem, 0)}/day. Demurrage due?`, answer: ans, unit: 'USD', tol: 1,
      formula: 'Laytime = qty ÷ rate; demurrage = max(0, used − laytime) × rate', steps: [`Laytime = ${f(lt.allowed, 3)} days`, `Excess = ${f(Math.max(0, lt.diff), 3)} days`, `Demurrage = ${f(ans)}`],
      mistakes: 'Rounding laytime to whole days, or ignoring that despatch (not demurrage) applies when faster.', implication: ans > 0 ? 'Pass-through to the buyer depends on matching laytime terms in the sales contract.' : 'No demurrage: despatch may be earned.' };
  });
  ex('ex-despatch', 'logistics', 'Despatch earned', (r) => {
    const q = r.int(20, 60) * 1000, rate = r.pick([4000, 5000, 6000, 8000]), dem = r.int(10, 25) * 1000;
    const allowed = q / rate, used = Math.max(0.5, allowed - r.range(0.5, 2.5));
    const ans = C.laytime({ qty: q, rateTPerDay: rate, timeUsedDays: used, demurragePerDay: dem }).despatch;
    return { prompt: `Loading ${f(q, 0)} t at ${f(rate, 0)} t/day. Actual time ${f(used, 3)} days. Demurrage ${f(dem, 0)}/day, despatch at half demurrage. Despatch?`, answer: ans, unit: 'USD', tol: 1,
      formula: 'Despatch = (laytime − used) × demurrage ÷ 2', steps: [`Laytime = ${f(allowed, 3)}`, `Saved = ${f(allowed - used, 3)} days`, `× ${f(dem / 2, 0)} = ${f(ans)}`],
      mistakes: 'Using the full demurrage rate.', implication: 'Fast terminals can be a source of extra income for charterers.' };
  });
  ex('ex-freight-eff', 'logistics', 'Effective freight with congestion', (r) => {
    const fr = rr(r, 18, 55, 0.25), q = r.int(20, 60) * 1000, days = r.int(2, 15), dem = r.int(10, 30) * 1000;
    const ans = fr + days * dem / q;
    return { prompt: `Freight ${f(fr)}/t for ${f(q, 0)} t. Port congestion causes ${days} days of waiting at ${f(dem, 0)}/day demurrage for your account. Effective freight per t?`, answer: ans, unit: 'USD/t', tol: 0.01,
      formula: 'Effective = freight + (days × demurrage ÷ quantity)', steps: [`Demurrage = ${f(days * dem, 0)}`, `Per t = ${f(days * dem / q)}`, `Effective = ${f(ans)}`], mistakes: 'Forgetting to spread the lump-sum demurrage over tonnes.', implication: 'Congestion can turn the cheapest route into the most expensive.' };
  });
  ex('ex-storage', 'logistics', 'Storage and carrying cost', (r) => {
    const q = r.int(5, 40) * 1000, st = rr(r, 1.5, 5, 0.25), m = r.int(1, 6), val = rr(r, 220, 550, 1), rate = rr(r, 4, 10, 0.25);
    const ans = q * st * m + C.interest(q * val, rate, m * 30);
    return { prompt: `You store ${f(q, 0)} t worth ${f(val, 0)}/t for ${m} months. Storage costs ${f(st)}/t/month; financing ${f(rate)}% p.a. (30-day months, ACT/360). Total carrying cost?`, answer: ans, unit: 'USD', tol: 2,
      formula: 'Carry = qty × storage × months + value × rate × days/360', steps: [`Storage = ${f(q * st * m, 0)}`, `Financing = ${f(C.interest(q * val, rate, m * 30))}`, `Total = ${f(ans)}`], mistakes: 'Ignoring financing, which is often bigger than storage.', implication: `The forward price must exceed spot by ${f(ans / q)}/t to cover carry.` };
  });
  /* ------------------------------------------------------------ derivatives */
  ex('ex-fut-gold', 'derivatives', 'Gold futures P&L', (r) => {
    const side = r.pick(['long', 'short']), n = r.int(1, 12), e = rr(r, 1900, 2300, 0.1), x = e + rr(r, -60, 60, 0.1);
    const ans = C.futuresPnL(side, e, x, n, 100);
    return { prompt: `You are ${side} ${n} gold futures (100 oz, illustrative) from ${f(e, 1)}, closed at ${f(x, 1)}. P&L before fees (USD, negative for a loss)?`, answer: ans, unit: 'USD', tol: 0.5,
      formula: 'P&L = (exit − entry) × 100 × contracts × (±1)', steps: [`Change = ${f(x - e, 1)}`, `× 100 × ${n} × ${side === 'long' ? '+1' : '−1'} = ${f(ans)}`], mistakes: 'Getting the sign wrong for shorts.', implication: 'Futures P&L is paid daily via variation margin.' };
  });
  ex('ex-fut-wheat', 'derivatives', 'Wheat futures P&L in cents per bushel', (r) => {
    const side = r.pick(['long', 'short']), n = r.int(1, 20), e = rr(r, 500, 750, 0.25), x = e + rr(r, -40, 40, 0.25);
    const ans = C.futuresPnL(side, e / 100, x / 100, n, 5000);
    return { prompt: `${side === 'long' ? 'Bought' : 'Sold'} ${n} wheat futures (5,000 bu) at ${f(e, 2)} c/bu; closed at ${f(x, 2)} c/bu. P&L (USD)?`, answer: ans, unit: 'USD', tol: 0.5,
      formula: 'P&L = (exit − entry) ÷ 100 × 5,000 × contracts × (±1)', steps: [`Change = ${f(x - e, 2)} c = ${f((x - e) / 100, 4)} USD/bu`, `× 5,000 × ${n} ${side === 'short' ? '× −1' : ''} = ${f(ans)}`], mistakes: 'Forgetting to convert cents to dollars (100× error).', implication: 'One cent per bushel = 50 USD per contract.' };
  });
  ex('ex-fut-sugar', 'derivatives', 'Raw sugar futures P&L', (r) => {
    const side = r.pick(['long', 'short']), n = r.int(1, 25), e = rr(r, 15, 26, 0.01), x = e + rr(r, -1.5, 1.5, 0.01);
    const ans = C.futuresPnL(side, e / 100, x / 100, n, 112000);
    return { prompt: `${side === 'long' ? 'Long' : 'Short'} ${n} raw sugar futures (112,000 lb, illustrative) from ${f(e)} c/lb to ${f(x)} c/lb. P&L (USD)?`, answer: ans, unit: 'USD', tol: 0.5,
      formula: 'P&L = Δ(c/lb) ÷ 100 × 112,000 × contracts × (±1)', steps: [`Δ = ${f(x - e)} c/lb = ${f((x - e) * 1120)} USD per contract`, `× ${n} ${side === 'short' ? '× −1' : ''} = ${f(ans)}`], mistakes: 'Cents vs dollars confusion.', implication: 'One point (0.01 c/lb) = USD 11.20 per contract.' };
  });
  ex('ex-margin', 'derivatives', 'Margin call amount', (r) => {
    const n = r.int(1, 8), im = r.int(6, 15) * 1000, mm = Math.round(im * 0.9), loss = r.int(1, 6) * 1000 * n, dep = im * n + r.int(0, 3) * 1000;
    const eq = dep - loss, call = eq < mm * n ? im * n - eq : 0;
    return { prompt: `You deposit ${f(dep, 0)} and hold ${n} contracts with initial margin ${f(im, 0)} and maintenance ${f(mm, 0)} per contract. Losses so far: ${f(loss, 0)}. Margin call (restore to initial margin; 0 if none)?`, answer: call, unit: 'USD', tol: 0.5,
      formula: 'If equity < maintenance × n: call = initial × n − equity', steps: [`Equity = ${f(dep, 0)} − ${f(loss, 0)} = ${f(eq, 0)}`, `Maintenance req. = ${f(mm * n, 0)}; initial req. = ${f(im * n, 0)}`, call ? `Call = ${f(im * n, 0)} − ${f(eq, 0)} = ${f(call, 0)}` : 'Equity above maintenance → no call'],
      mistakes: 'Topping up only to maintenance margin.', implication: 'Hedgers need liquidity lines for margin calls even when the physical position gains.' };
  });
  ex('ex-leverage', 'derivatives', 'Effective leverage', (r) => {
    const n = r.int(1, 10), p = rr(r, 1900, 2300, 1), eq = r.int(5, 40) * 10000;
    const ans = n * 100 * p / eq;
    return { prompt: `An account with equity ${f(eq, 0)} holds ${n} gold futures (100 oz) at ${f(p, 0)}. Leverage (notional ÷ equity, ×)?`, answer: ans, unit: '×', tol: 0.05,
      formula: 'Leverage = contracts × multiplier × price ÷ equity', steps: [`Notional = ${f(n * 100 * p, 0)}`, `÷ ${f(eq, 0)} = ${f(ans)}×`], mistakes: 'Using margin instead of equity.', implication: `A 1% move changes equity by about ${f(ans)}%.` };
  });
  ex('ex-hedge', 'derivatives', 'Hedge result with basis change', (r) => {
    const q = r.int(2, 30) * 1000, s0 = rr(r, 220, 300, 0.5), b0 = rr(r, -20, 5, 0.5), ds = rr(r, -30, 10, 0.5), db = rr(r, -6, 6, 0.5);
    const f0 = s0 - b0, s1 = s0 + ds, f1 = s1 - (b0 + db);
    const h = C.hedgeOutcome({ qty: q, spot0: s0, spot1: s1, fut0: f0, fut1: f1 });
    return { prompt: `A merchant owns ${f(q, 0)} t of wheat bought at a cash price of ${f(s0)}/t and sells futures (tonne-equivalent) at ${f(f0)}. Later cash is ${f(s1)} and futures ${f(f1)}. Net result of physical + futures?`, answer: h.net, unit: 'USD', tol: 1,
      formula: 'Net = qty × [(S1 − S0) − (F1 − F0)] = qty × Δbasis', steps: [`Physical = ${f(h.physical)}`, `Futures = ${f(h.futures)}`, `Net = ${f(h.net)} (basis change ${f(h.basisChange)})`], mistakes: 'Thinking a hedge removes all risk.', implication: 'The hedge converted price risk into basis risk.' };
  });
  ex('ex-hedge-n', 'derivatives', 'Sugar futures contracts for a hedge', (r) => {
    const t = r.int(10, 60) * 1000, ratio = r.pick([0.8, 0.9, 1]);
    const lbT = C.convertMass(1, 't', 'lb'), ans = Math.round(t * lbT * ratio / 112000);
    return { prompt: `A refinery wants to hedge ${f(t, 0)} t of raw sugar purchases with futures of 112,000 lb each at a hedge ratio of ${ratio}. Number of contracts (nearest whole)?`, answer: ans, unit: 'contracts', tol: 0, dp: 0,
      formula: 'Contracts = tonnes × 2,204.62 × ratio ÷ 112,000', steps: [`${f(t, 0)} t = ${f(t * lbT, 0)} lb`, `× ${ratio} ÷ 112,000 = ${f(t * lbT * ratio / 112000, 2)} → ${ans}`], mistakes: 'Using 2,000 lb per tonne.', implication: 'One contract ≈ 50.8 t of sugar.' };
  });
  /* ------------------------------------------------------------ options */
  ex('ex-opt-tv', 'options', 'Intrinsic and time value', (r) => {
    const type = r.pick(['call', 'put']), F = rr(r, 1900, 2300, 1), K = Math.round((F + r.range(-80, 80)) / 10) * 10, prem = Math.max(5, Math.round(Math.abs(F - K) * 0.6 + r.range(10, 50)));
    const iv = type === 'call' ? Math.max(F - K, 0) : Math.max(K - F, 0), ans = prem - iv;
    return { prompt: `A gold ${type} with strike ${f(K, 0)} trades at a premium of ${f(prem, 0)} when futures are at ${f(F, 0)}. Time value?`, answer: ans, unit: 'USD/oz', tol: 0.01,
      formula: 'Time value = premium − intrinsic value', steps: [`Intrinsic = ${type === 'call' ? `max(${F} − ${K}, 0)` : `max(${K} − ${F}, 0)`} = ${f(iv, 0)}`, `Time value = ${f(prem, 0)} − ${f(iv, 0)} = ${f(ans, 0)}`], mistakes: 'Using F − K for puts.', implication: 'Time value decays to zero at expiry — the option buyer pays for it.' };
  });
  ex('ex-opt-bs', 'options', 'Black-76 call price', (r) => {
    const F = rr(r, 1900, 2300, 1), K = Math.round(F / 25) * 25 + r.pick([-50, -25, 0, 25, 50]), T = r.pick([30, 60, 90, 180]) / 365, vol = rr(r, 0.12, 0.28, 0.01), rate = rr(r, 0.02, 0.06, 0.005);
    const ans = C.black76(F, K, T, rate, vol, 'call').price;
    return { prompt: `Price a European call on gold futures with Black-76: F = ${f(F, 0)}, K = ${f(K, 0)}, T = ${f(T * 365, 0)} days (÷365), σ = ${f(vol * 100, 0)}%, r = ${f(rate * 100, 1)}%. (Use the Options tool or compute d1, d2.)`, answer: ans, unit: 'USD/oz', tol: 0.25,
      formula: 'C = e^(−rT) [F·N(d1) − K·N(d2)], d1 = [ln(F/K) + σ²T/2] / (σ√T), d2 = d1 − σ√T', steps: [`d1 = ${f(C.black76(F, K, T, rate, vol, 'call').d1, 4)}, d2 = ${f(C.black76(F, K, T, rate, vol, 'call').d2, 4)}`, `C = ${f(ans, 2)}`],
      mistakes: 'Using days instead of years for T; percent instead of decimals.', implication: 'Model price under strong simplifying assumptions; real markets have skews and jumps.' };
  });
  ex('ex-opt-delta', 'options', 'Delta-approximated option P&L', (r) => {
    const d = rr(r, 0.2, 0.8, 0.01), dF = rr(r, -40, 40, 1), n = r.int(1, 10);
    const ans = d * dF * n * 100;
    return { prompt: `You hold ${n} long gold call options (each on 100 oz futures) with delta ${f(d)}. Futures move ${dF >= 0 ? '+' : ''}${f(dF, 0)}. Approximate change in option position value (first-order)?`, answer: ans, unit: 'USD', tol: 1,
      formula: 'ΔV ≈ delta × ΔF × multiplier × contracts', steps: [`${f(d)} × ${f(dF, 0)} × 100 × ${n} = ${f(ans)}`], mistakes: 'Forgetting the multiplier.', implication: 'Large moves need gamma: delta changes as the price moves.' };
  });
  ex('ex-opt-be', 'options', 'Break-even at expiry for a put buyer', (r) => {
    const K = r.int(520, 760), prem = rr(r, 6, 30, 0.25);
    return { prompt: `A farmer buys a put on wheat futures with strike ${K} c/bu for a premium of ${f(prem)} c/bu. At what futures price at expiry does the farmer break even on the option alone?`, answer: K - prem, unit: 'c/bu', tol: 0.01,
      formula: 'Put break-even = strike − premium', steps: [`${K} − ${f(prem)} = ${f(K - prem)}`], mistakes: 'Adding the premium (that is for calls).', implication: 'Below this price, the put more than pays for itself as price insurance.' };
  });
  /* ------------------------------------------------------------ spreads */
  ex('ex-arb', 'spreads', 'Does the geographic arbitrage survive costs?', (r) => {
    const o = rr(r, 200, 280, 0.5), gap = rr(r, 20, 55, 0.5), d = o + gap, fr = rr(r, 15, 45, 0.5), hand = rr(r, 3, 9, 0.5), ins = rr(r, 0.08, 0.25, 0.01), duty = r.pick([0, 0, 2.5, 5]), rate = rr(r, 5, 9, 0.25), days = r.int(20, 60);
    const res = C.arbitrage({ originPrice: o, destPrice: d, freight: fr, insurancePct: ins, dutyPct: duty, handling: hand, financeRatePct: rate, days });
    return { prompt: `Origin FOB ${f(o)}/t; destination price ${f(d)}/t (same quality, same currency). Freight ${f(fr)}, insurance ${f(ins)}% on 110% CFR, duty ${duty}% on CIF, handling ${f(hand)}, financing ${f(rate)}% on CFR for ${days} days (ACT/360). Net margin per t after all costs?`, answer: res.marginPerT, unit: 'USD/t', tol: 0.05,
      formula: 'Delivered = FOB + freight + insurance + duty + handling + financing; margin = destination − delivered', steps: [`Insurance = ${f(res.insurance)}; duty = ${f(res.duty)}; financing = ${f(res.financing)}`, `Delivered = ${f(res.delivered)}`, `Margin = ${f(d)} − ${f(res.delivered)} = ${f(res.marginPerT)}`],
      mistakes: 'Calling the raw price gap (' + f(gap) + ') an arbitrage.', implication: res.marginPerT > 0 ? 'Positive after costs — now check execution risk, timing and counterparty.' : 'No arbitrage: the gap is explained by transfer costs.' };
  });
  ex('ex-calendar', 'spreads', 'Full-carry calendar spread', (r) => {
    const s = rr(r, 200, 300, 0.5), st = rr(r, 1.5, 4, 0.25), m = r.pick([2, 3, 4, 6]), rate = rr(r, 4, 9, 0.25), insr = rr(r, 0.05, 0.2, 0.01);
    const ans = st * m + s * (rate / 100 * m * 30 / 360) + s * insr / 100 * m / 12;
    return { prompt: `Grain spot ${f(s)}/t. Storage ${f(st)}/t/month, financing ${f(rate)}% p.a. (30-day months, /360), insurance ${f(insr)}% of value per year. Full-carry spread for ${m} months (USD/t)?`, answer: ans, unit: 'USD/t', tol: 0.05,
      formula: 'Full carry = storage × months + spot × rate × days/360 + spot × insurance × months/12', steps: [`Storage = ${f(st * m)}`, `Financing = ${f(s * rate / 100 * m * 30 / 360)}`, `Insurance = ${f(s * insr / 100 * m / 12)}`, `Total = ${f(ans)}`],
      mistakes: 'Leaving out financing.', implication: 'If the deferred contract trades above spot + full carry, cash-and-carry is attractive.' };
  });
  /* ------------------------------------------------------------ quant & risk */
  ex('ex-vol', 'quant', 'Annualise daily volatility', (r) => {
    const d = rr(r, 0.6, 2.8, 0.05);
    return { prompt: `Daily standard deviation of log returns is ${f(d)}%. Annualised volatility with 252 trading days?`, answer: d * Math.sqrt(252), unit: '%', tol: 0.05,
      formula: 'σ_annual = σ_daily × √252', steps: [`√252 = 15.875`, `${f(d)}% × 15.875 = ${f(d * Math.sqrt(252))}%`], mistakes: 'Multiplying by 252 instead of √252.', implication: 'Use annual vol for option pricing and risk comparisons.' };
  });
  ex('ex-var', 'quant', 'Parametric 1-day VaR', (r) => {
    const val = r.int(2, 30) * 1000000, s = rr(r, 0.8, 2.5, 0.05), c = r.pick([0.95, 0.99]);
    const z = C.invNorm(c), ans = z * s / 100 * val;
    return { prompt: `A position worth ${f(val, 0)} has daily return volatility of ${f(s)}% and zero mean. Parametric (normal) 1-day VaR at ${c * 100}%?`, answer: ans, unit: 'USD', tol: ans * 0.002,
      formula: 'VaR = z × σ × value', steps: [`z(${c * 100}%) = ${f(z, 4)}`, `VaR = ${f(z, 4)} × ${f(s)}% × ${f(val, 0)} = ${f(ans)}`], mistakes: 'Using z for a two-sided interval (1.96 for 95%).', implication: 'Fat tails mean real losses beyond VaR can be much larger — check Expected Shortfall and stress tests.' };
  });
  ex('ex-size', 'risk', 'Position size from a risk budget', (r) => {
    const eq = r.int(5, 50) * 100000, risk = r.pick([0.5, 1, 1.5, 2]), entry = rr(r, 1900, 2300, 1), stopD = r.int(10, 60);
    const ans = C.positionSize(eq, risk, entry, entry - stopD, 100);
    return { prompt: `Equity ${f(eq, 0)}; you risk ${risk}% per trade. Long gold futures (100 oz) entry ${f(entry, 0)}, stop ${f(entry - stopD, 0)}. Maximum whole contracts?`, answer: ans, unit: 'contracts', tol: 0, dp: 0,
      formula: 'Contracts = floor(equity × risk% ÷ (stop distance × multiplier))', steps: [`Budget = ${f(eq * risk / 100, 0)}`, `Per contract = ${stopD} × 100 = ${f(stopD * 100, 0)}`, `→ ${ans}`], mistakes: 'Rounding up.', implication: 'Gaps can still cause losses beyond the stop.' };
  });
  ex('ex-pvol', 'quant', 'Two-asset portfolio volatility', (r) => {
    const w = r.pick([0.3, 0.4, 0.5, 0.6]), v1 = rr(r, 0.12, 0.3, 0.01), v2 = rr(r, 0.12, 0.35, 0.01), rho = rr(r, -0.3, 0.8, 0.05);
    const ans = C.portfolioVol([w, 1 - w], [v1, v2], [[1, rho], [rho, 1]]) * 100;
    return { prompt: `Portfolio: ${w * 100}% gold (vol ${f(v1 * 100, 0)}%) and ${(1 - w) * 100}% wheat (vol ${f(v2 * 100, 0)}%), correlation ${f(rho)}. Portfolio volatility (%)?`, answer: ans, unit: '%', tol: 0.05,
      formula: 'σp = √(w1²σ1² + w2²σ2² + 2w1w2ρσ1σ2)', steps: [`= √(${f(w * w * v1 * v1, 5)} + ${f((1 - w) ** 2 * v2 * v2, 5)} + ${f(2 * w * (1 - w) * rho * v1 * v2, 5)})`, `= ${f(ans)}%`], mistakes: 'Averaging the volatilities (that assumes ρ = 1).', implication: `Diversification saves ${f((w * v1 + (1 - w) * v2) * 100 - ans)} points vs the weighted average.` };
  });
  ex('ex-el', 'risk', 'Expected loss on a receivable', (r) => {
    const ead = r.int(10, 80) * 100000, pd = rr(r, 0.5, 8, 0.1), lgd = r.pick([40, 50, 60, 75]);
    const ans = ead * pd / 100 * lgd / 100;
    return { prompt: `Open-account receivable ${f(ead, 0)}; probability of default ${f(pd, 1)}%; loss given default ${lgd}%. Expected loss?`, answer: ans, unit: 'USD', tol: 1,
      formula: 'EL = EAD × PD × LGD', steps: [`${f(ead, 0)} × ${f(pd, 1)}% × ${lgd}% = ${f(ans)}`], mistakes: 'Ignoring recovery (LGD).', implication: 'Compare EL with the price premium the buyer offers for credit terms, and with the cost of credit insurance or an LC.' };
  });
  ex('ex-stress', 'risk', 'Combined wheat stress test', (r) => {
    const q = 5000, price = rr(r, 240, 290, 0.5), fall = r.pick([5, 8, 10, 12]), fr = rr(r, 25, 40, 0.5), frUp = r.pick([10, 15, 25]), delay = r.int(5, 15), dem = r.int(8, 16) * 1000, ext = r.pick([30, 45, 60]), rate = rr(r, 6, 10, 0.25);
    const priceLoss = q * price * fall / 100, frLoss = q * fr * frUp / 100, demLoss = delay * dem, finLoss = C.interest(q * price, rate, ext), ans = priceLoss + frLoss + demLoss + finLoss;
    return { prompt: `Unhedged: 5,000 t wheat valued at ${f(price)}/t. Price falls ${fall}%; freight (${f(fr)}/t, for your account) rises ${frUp}%; vessel delay ${delay} days at ${f(dem, 0)}/day demurrage; buyer extends payment by ${ext} days on the cargo value at ${f(rate)}% p.a. (ACT/360). Combined additional cost/loss?`, answer: ans, unit: 'USD', tol: 5,
      formula: 'Loss = price fall + freight increase + demurrage + extra financing', steps: [`Price = ${f(priceLoss)}`, `Freight = ${f(frLoss)}`, `Demurrage = ${f(demLoss)}`, `Financing = ${f(finLoss)}`, `Total = ${f(ans)}`], mistakes: 'Looking at each shock separately, or forgetting financing on the extension.', implication: 'Risk events cluster; liquidity reserves must cover the combined case.' };
  });
})();
