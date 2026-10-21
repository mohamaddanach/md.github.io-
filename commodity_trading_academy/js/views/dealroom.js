/* Deal Room — negotiation simulator. Counterparties respond by defined rules:
 *   utility(offer) = Σ weight_i × preference_i(option) (price scaled linearly between their ideal and reservation)
 *   acceptance threshold starts high and falls each round by the concession rate, never below the reservation level;
 *   counter-offers move the issues where the counterparty is most dissatisfied (weighted) toward its preferences
 *   and split the price difference according to its style. Patience = maximum rounds before walking away.
 * All counterparties are FICTIONAL. */
(function () {
  const CTA = window.CTA, C = window.CALC, fmt = CTA.fmt, esc = CTA.esc;
  const f = (n, d = 2) => fmt.num(n, d);
  const ISSUES = {
    payment: { label: 'Payment terms', opts: [['advance', 'Advance payment'], ['lc', 'Confirmed LC at sight'], ['cad', 'Cash against documents'], ['oa30', 'Open account 30 days'], ['oa60', 'Open account 60 days'], ['oa90', 'Open account 90 days']] },
    quality: { label: 'Quality/weight determination', opts: [['loading', 'Final at loading (independent surveyor)'], ['joint', 'Joint survey at discharge'], ['discharge', 'Final at discharge (buyer\'s lab)']] },
    window: { label: 'Shipment window', opts: [['15', '15 days'], ['30', '30 days'], ['45', '45 days']] },
    incoterm: { label: 'Delivery term', opts: [['FOB', 'FOB load port'], ['CFR', 'CFR destination'], ['CIF', 'CIF destination'], ['DAP', 'DAP buyer\'s warehouse']] },
    penalty: { label: 'Late-delivery penalty', opts: [['none', 'None'], ['capped', '0.5% per week, capped at 3%'], ['heavy', '1% per week, no cap']] },
    tolerance: { label: 'Quantity tolerance', opts: [['s10', '±10% seller\'s option'], ['s5', '±5% seller\'s option'], ['b5', '±5% buyer\'s option']] },
    dispute: { label: 'Dispute resolution', opts: [['arb', 'Arbitration under recognised trade rules'], ['courts', 'Courts of the buyer\'s country'], ['none', 'Not specified']] },
    duration: { label: 'Contract duration', opts: [['spot', 'Single shipment'], ['q', '3 monthly shipments'], ['y', '12-month programme']] },
  };
  const CP = [
    { id: 'nile', name: 'Nile Valley Milling Co.', role: 'buyer', commodity: 'wheat', product: 'Milling wheat 12.5%, CFR Alexandria', qty: 30000, unit: 't', yourCost: 258, market: 268, ideal: 262, reservation: 271, style: 'analytical', patience: 6, concession: 0.06, fin: 'B', rel: 'A', flex: 'medium', minWindow: 30,
      traits: { 'Price sensitivity': 4, Reliability: 5, 'Financial strength': 3, 'Delivery flexibility': 3, 'Quality requirements': 5, 'Risk tolerance': 2 }, payPref: 'CAD or LC (bank charges shared)', w: { price: 0.4, payment: 0.15, quality: 0.15, window: 0.08, penalty: 0.07, tolerance: 0.05, dispute: 0.05, duration: 0.05 },
      pref: { payment: { advance: 0, lc: 0.5, cad: 0.8, oa30: 0.9, oa60: 1, oa90: 1 }, quality: { loading: 0.3, joint: 0.8, discharge: 1 }, window: { 15: 1, 30: 0.8, 45: 0.3 }, penalty: { none: 0.2, capped: 0.8, heavy: 1 }, tolerance: { s10: 0.4, s5: 0.7, b5: 1 }, dispute: { arb: 1, courts: 0.9, none: 0.3 }, duration: { spot: 0.7, q: 1, y: 0.8 }, incoterm: { FOB: 0.3, CFR: 1, CIF: 0.9, DAP: 0.9 } },
      intro: 'We need 30,000 t milling wheat CFR Alexandria. Our quality team is strict and our board watches price closely. What can you offer?' },
    { id: 'gulf', name: 'Gulf Bottling Industries', role: 'buyer', commodity: 'sugar', product: 'Refined sugar ICUMSA 45, 50 kg bags, CFR Jebel Ali', qty: 12000, unit: 't', yourCost: 598, market: 615, ideal: 605, reservation: 620, style: 'cooperative', patience: 7, concession: 0.05, fin: 'A', rel: 'A', flex: 'high', minWindow: 30,
      traits: { 'Price sensitivity': 3, Reliability: 5, 'Financial strength': 5, 'Delivery flexibility': 4, 'Quality requirements': 5, 'Risk tolerance': 3 }, payPref: 'Confirmed LC at sight (bank relationship)', w: { price: 0.3, payment: 0.1, quality: 0.2, window: 0.1, penalty: 0.1, tolerance: 0.05, dispute: 0.05, duration: 0.1 },
      pref: { payment: { advance: 0, lc: 1, cad: 0.7, oa30: 0.9, oa60: 0.9, oa90: 0.9 }, quality: { loading: 0.5, joint: 1, discharge: 0.9 }, window: { 15: 0.9, 30: 1, 45: 0.5 }, penalty: { none: 0.3, capped: 1, heavy: 0.9 }, tolerance: { s10: 0.3, s5: 0.9, b5: 1 }, dispute: { arb: 1, courts: 0.7, none: 0.2 }, duration: { spot: 0.5, q: 0.8, y: 1 }, incoterm: { FOB: 0.2, CFR: 1, CIF: 1, DAP: 0.9 } },
      intro: 'We value a reliable partner more than the last dollar. Food safety and consistent colour are essential. A 12-month programme could interest us.' },
    { id: 'levant', name: 'Levant Build Supply', role: 'buyer', commodity: 'steel', product: 'Rebar grade 500B, CFR destination', qty: 6000, unit: 't', yourCost: 612, market: 645, ideal: 625, reservation: 652, style: 'aggressive', patience: 5, concession: 0.09, fin: 'C', rel: 'B', flex: 'low', minWindow: 30,
      traits: { 'Price sensitivity': 5, Reliability: 3, 'Financial strength': 2, 'Delivery flexibility': 2, 'Quality requirements': 3, 'Risk tolerance': 5 }, payPref: 'Open account 90 days', w: { price: 0.45, payment: 0.25, quality: 0.05, window: 0.1, penalty: 0.05, tolerance: 0.03, dispute: 0.02, duration: 0.05 },
      pref: { payment: { advance: 0, lc: 0.2, cad: 0.4, oa30: 0.6, oa60: 0.8, oa90: 1 }, quality: { loading: 0.5, joint: 0.8, discharge: 1 }, window: { 15: 1, 30: 0.7, 45: 0.2 }, penalty: { none: 0.3, capped: 0.7, heavy: 1 }, tolerance: { s10: 0.5, s5: 0.7, b5: 1 }, dispute: { arb: 0.6, courts: 1, none: 0.8 }, duration: { spot: 1, q: 0.7, y: 0.4 }, incoterm: { FOB: 0.2, CFR: 1, CIF: 0.9, DAP: 1 } },
      intro: 'Prices are falling everywhere. Give me your best price and 90 days credit, or I buy elsewhere.' },
    { id: 'steppe', name: 'Steppe Export LLC', role: 'seller', commodity: 'wheat', product: 'Milling wheat 12.5%, FOB Black Sea', qty: 30000, unit: 't', yourResale: 268, freight: 27, market: 232, ideal: 238, reservation: 229, style: 'aggressive', patience: 5, concession: 0.08, fin: 'C', rel: 'C', flex: 'medium', minWindow: 15,
      traits: { 'Price sensitivity': 4, Reliability: 2, 'Financial strength': 2, 'Delivery flexibility': 3, 'Quality requirements': 2, 'Risk tolerance': 5 }, payPref: '30% advance', w: { price: 0.45, payment: 0.25, quality: 0.1, window: 0.05, penalty: 0.05, tolerance: 0.04, dispute: 0.03, duration: 0.03 },
      pref: { payment: { advance: 1, lc: 0.6, cad: 0.5, oa30: 0.1, oa60: 0, oa90: 0 }, quality: { loading: 1, joint: 0.4, discharge: 0.1 }, window: { 15: 0.3, 30: 0.8, 45: 1 }, penalty: { none: 1, capped: 0.5, heavy: 0 }, tolerance: { s10: 1, s5: 0.7, b5: 0.2 }, dispute: { arb: 0.6, courts: 0.5, none: 1 }, duration: { spot: 1, q: 0.6, y: 0.3 }, incoterm: { FOB: 1, CFR: 0.5, CIF: 0.4, DAP: 0.1 } },
      intro: 'Very good wheat, best price on the market, but we need 30% advance to start loading. Decide quickly, other buyers are waiting.' },
    { id: 'helvetic', name: 'Helvetic Refining SA', role: 'seller', commodity: 'gold', product: '1 kg bars 999.9, LBMA-accredited, delivered Zurich vault', qty: 100, unit: 'kg', yourResale: 6.0, market: 0.9, ideal: 1.3, reservation: 0.85, style: 'firm', patience: 6, concession: 0.03, fin: 'A', rel: 'A', flex: 'high', minWindow: 15, priceLabel: 'premium over spot (USD/oz)',
      traits: { 'Price sensitivity': 2, Reliability: 5, 'Financial strength': 5, 'Delivery flexibility': 4, 'Quality requirements': 5, 'Risk tolerance': 1 }, payPref: 'DvP via vault operator', w: { price: 0.3, payment: 0.35, quality: 0.1, window: 0.05, penalty: 0.05, tolerance: 0.05, dispute: 0.05, duration: 0.05 },
      pref: { payment: { advance: 1, lc: 0.9, cad: 0.8, oa30: 0, oa60: 0, oa90: 0 }, quality: { loading: 1, joint: 0.7, discharge: 0.3 }, window: { 15: 0.8, 30: 1, 45: 1 }, penalty: { none: 1, capped: 0.7, heavy: 0.1 }, tolerance: { s10: 0.7, s5: 1, b5: 0.6 }, dispute: { arb: 1, courts: 0.5, none: 0.2 }, duration: { spot: 0.6, q: 0.8, y: 1 }, incoterm: { FOB: 0.5, CFR: 0.5, CIF: 0.5, DAP: 1 } },
      intro: 'Our premium reflects accredited production and responsible sourcing. We settle delivery-versus-payment only; we do not extend credit.' },
    { id: 'anatolian', name: 'Anatolian Steel Works', role: 'seller', commodity: 'steel', product: 'Rebar grade 500B, FOB mill port', qty: 6000, unit: 't', yourResale: 645, freight: 46, market: 560, ideal: 572, reservation: 555, style: 'cooperative', patience: 6, concession: 0.05, fin: 'B', rel: 'B', flex: 'medium', minWindow: 30,
      traits: { 'Price sensitivity': 3, Reliability: 4, 'Financial strength': 4, 'Delivery flexibility': 3, 'Quality requirements': 4, 'Risk tolerance': 3 }, payPref: 'LC at sight', w: { price: 0.4, payment: 0.2, quality: 0.1, window: 0.1, penalty: 0.06, tolerance: 0.05, dispute: 0.04, duration: 0.05 },
      pref: { payment: { advance: 1, lc: 0.9, cad: 0.6, oa30: 0.2, oa60: 0, oa90: 0 }, quality: { loading: 1, joint: 0.6, discharge: 0.2 }, window: { 15: 0.2, 30: 0.8, 45: 1 }, penalty: { none: 1, capped: 0.7, heavy: 0.1 }, tolerance: { s10: 1, s5: 0.8, b5: 0.3 }, dispute: { arb: 1, courts: 0.4, none: 0.5 }, duration: { spot: 0.6, q: 0.9, y: 1 }, incoterm: { FOB: 1, CFR: 0.6, CIF: 0.5, DAP: 0.2 } },
      intro: 'We can roll your sizes in the June campaign. We prefer LC at sight and a realistic shipment window.' },
  ];
  const STYLE_MSG = {
    analytical: { counter: 'We have analysed your proposal. ', accept: 'The numbers work for us. Agreed.', walk: 'We cannot justify these terms to our board. We will tender elsewhere.' },
    cooperative: { counter: 'Thank you — we are close. ', accept: 'Excellent, we have a deal. Looking forward to working together.', walk: 'Regrettably we cannot find common ground this time.' },
    aggressive: { counter: 'Not acceptable. ', accept: 'Fine. Deal. Send the contract today.', walk: 'You are wasting my time. Goodbye.' },
    firm: { counter: 'Our policy does not allow these terms. ', accept: 'We confirm the transaction on these terms.', walk: 'We are unable to proceed.' },
  };

  function priceU(cp, p) { // 1 at ideal, 0 at reservation (linear), can exceed bounds
    const span = cp.reservation - cp.ideal; return 1 - (p - cp.ideal) / span;
  }
  function util(cp, o) {
    let u = cp.w.price * Math.max(-0.5, Math.min(1.2, priceU(cp, o.price)));
    Object.keys(cp.w).forEach((k) => { if (k !== 'price') u += cp.w[k] * (cp.pref[k][o[k]] != null ? cp.pref[k][o[k]] : 0.5); });
    u += 0.05 * (cp.pref.incoterm[o.incoterm] || 0.5) - 0.05 * 0.7; // small incoterm effect, centred
    return u;
  }
  function threshold(cp, round) { const start = 0.9, floor = 0.55; return Math.max(floor, start - cp.concession * round); }
  function counter(cp, o, round) {
    const c = Object.assign({}, o);
    // price: move toward ideal by a style-dependent share of the gap
    const share = { aggressive: 0.35, analytical: 0.5, cooperative: 0.6, firm: 0.25 }[cp.style];
    const target = cp.ideal + (cp.reservation - cp.ideal) * Math.min(0.85, round * cp.concession * 1.4);
    if ((cp.role === 'buyer' && o.price > target) || (cp.role === 'seller' && o.price < target)) c.price = +(o.price + (target - o.price) * (1 - share)).toFixed(2);
    // change the two non-price issues with the largest weighted shortfall
    const gaps = Object.keys(cp.w).filter((k) => k !== 'price').map((k) => { const best = Object.entries(cp.pref[k]).sort((a, b) => b[1] - a[1])[0]; return { k, gap: cp.w[k] * (best[1] - (cp.pref[k][o[k]] || 0)), best: best[0] }; }).sort((a, b) => b.gap - a.gap).slice(0, 2).filter((g) => g.gap > 0.02);
    gaps.forEach((g) => { c[g.k] = g.best; });
    return { c, changed: gaps.map((g) => g.k) };
  }
  function optLabel(k, v) { const o = ISSUES[k].opts.find((x) => x[0] === v); return o ? o[1] : v; }

  /* evaluation of the user's agreement */
  function review(cp, o, rounds, outcome) {
    const you = cp.role === 'buyer' ? 'seller' : 'buyer';
    const pts = {}; const good = [], miss = [], improve = [];
    const days = { advance: -20, lc: 5, cad: 10, oa30: 30, oa60: 60, oa90: 90 }[o.payment];
    let econ;
    if (you === 'seller') {
      const margin = o.price - cp.yourCost, ref = cp.market - cp.yourCost; const finCost = cp.yourCost * 0.075 * Math.max(0, days) / 360;
      econ = { perUnit: margin - finCost, total: (margin - finCost) * cp.qty };
      pts.profit = Math.max(0, Math.min(100, (margin - finCost) / Math.max(ref, 0.01) * 80));
      const unsecured = ['oa30', 'oa60', 'oa90'].includes(o.payment); const weak = cp.fin === 'C';
      pts.risk = 100 - (unsecured ? (weak ? 55 : 25) : 0) - (o.quality === 'discharge' ? 20 : o.quality === 'joint' ? 8 : 0) - (o.penalty === 'heavy' ? 15 : 0) - (o.tolerance === 'b5' ? 10 : 0);
      pts.cash = days <= 10 ? 100 : days <= 30 ? 70 : days <= 60 ? 45 : 25;
      pts.credit = unsecured && weak ? 15 : unsecured ? 55 : 100;
      if (unsecured && weak) miss.push(`You granted ${optLabel('payment', o.payment)} to a financially weak buyer — expected credit loss and funding cost eat the margin.`); else if (!unsecured) good.push('Payment is secured.');
      if (o.quality === 'loading') good.push('Quality final at loading protects you from transit quality claims.'); else miss.push('Quality determined at discharge transfers transit quality risk to you.');
      if (o.penalty === 'heavy') miss.push('Uncapped late-delivery penalties are an open-ended liability.');
    } else {
      const landed = cp.commodity === 'gold' ? null : o.price + (cp.freight || 0);
      const margin = cp.commodity === 'gold' ? cp.yourResale - o.price : cp.yourResale - landed;
      const refM = cp.commodity === 'gold' ? cp.yourResale - cp.market : cp.yourResale - cp.market - (cp.freight || 0);
      econ = { perUnit: margin, total: margin * (cp.commodity === 'gold' ? C.fineOunces(cp.qty, 'kg', 0.9999) : cp.qty) };
      pts.profit = Math.max(0, Math.min(100, margin / Math.max(refM, 0.01) * 80));
      const prepay = o.payment === 'advance'; const weak = cp.rel === 'C' || cp.fin === 'C';
      pts.risk = 100 - (prepay ? (weak ? 60 : 15) : 0) - (o.quality === 'loading' && weak ? 25 : 0) - (o.penalty === 'none' && weak ? 10 : 0) - (o.tolerance === 's10' ? 5 : 0);
      pts.cash = { advance: 30, lc: 75, cad: 85, oa30: 95, oa60: 100, oa90: 100 }[o.payment];
      pts.credit = prepay && weak ? 10 : prepay ? 70 : 100;
      if (prepay && weak) miss.push('You agreed to pay in advance to an unreliable, weak supplier without security (advance-payment guarantee).'); else if (!prepay) good.push('No unsecured advance payment.');
      if (weak && o.quality === 'loading') miss.push('With an unreliable supplier, accept "final at loading" only with your own independent surveyor appointed.');
      if (o.penalty !== 'none') good.push('Late-delivery penalties give you leverage over delivery.');
      if (cp.id === 'helvetic' && o.payment === 'lc') good.push('LC is acceptable to the refiner; DvP would be equivalent and simpler for bullion.');
    }
    pts.clarity = (o.dispute === 'none' ? 0 : 50) + (o.penalty === 'none' ? 20 : 30) + (o.tolerance ? 20 : 0);
    if (o.dispute === 'none') miss.push('No dispute-resolution clause: disputes will be slow and expensive.'); else good.push('Dispute resolution is specified.');
    pts.feasible = +o.window >= cp.minWindow ? 100 : 30;
    if (+o.window < cp.minWindow) miss.push(`A ${o.window}-day shipment window is too tight for this trade (realistic minimum about ${cp.minWindow} days).`);
    const W = { profit: 25, risk: 25, cash: 15, clarity: 10, credit: 15, feasible: 10 };
    let overall = 0; Object.keys(W).forEach((k) => { overall += Math.max(0, Math.min(100, pts[k])) * W[k] / 100; });
    if (outcome !== 'agreed') { overall = Math.min(overall, 50); improve.push('No agreement. Check whether walking away was better than the deal on offer (your BATNA).'); }
    if (pts.profit < 40) improve.push('Anchor with a justified price based on market references and trade non-price concessions instead of conceding price.');
    if (rounds <= 1 && outcome === 'agreed' && pts.profit < 70) improve.push('You accepted early. Test the counterparty\'s flexibility with a reasoned counter-offer.');
    improve.push(`A professional would package terms: e.g. ${you === 'seller' ? 'offer a small price concession in exchange for LC/CAD and loading-final quality' : 'accept a slightly higher price in exchange for an advance-payment guarantee or LC, independent inspection and penalties'}.`);
    return { pts, overall, good, miss, improve, econ, you };
  }

  CTA.route('dealroom', { title: 'Deal Room', desc: 'Negotiate complete commercial deals with simulated counterparties.', render(el, r) {
    const id = r.parts[0];
    const cp = id && CP.find((x) => x.id === id);
    if (!cp) {
      const hist = CTA.state.negotiations || [];
      el.innerHTML = `${CTA.pageHead('Deal Room', 'Negotiate the whole commercial deal — price, payment, quality, shipment, penalties, tolerances, disputes and duration — with counterparties who respond according to their own priorities. Your goal is the best complete deal, not the lowest price.')}
        <div class="grid c3">${CP.map((c) => `<div class="card" style="border-top:4px solid var(--${c.commodity})"><div class="row between"><b>${esc(c.name)}</b><span class="badge t-${c.commodity}">${c.commodity}</span></div><p class="muted" style="font-size:.86rem;margin:4px 0">${c.role === 'buyer' ? 'Buyer — you sell' : 'Seller — you buy'} · ${esc(c.product)}</p>
          ${Object.entries(c.traits).map(([k, v]) => `<div class="row between" style="font-size:.82rem"><span>${k}</span><span>${'●'.repeat(v)}${'○'.repeat(5 - v)}</span></div>`).join('')}<p style="font-size:.82rem;margin-top:6px">Style: <b>${c.style}</b> · prefers ${esc(c.payPref)}</p><a class="btn primary sm" href="#/dealroom/${c.id}">Negotiate</a></div>`).join('')}</div>
        <div class="card"><h3>Past negotiations</h3>${hist.length ? CTA.table(['Date', 'Counterparty', 'Outcome', 'Rounds', 'Score', 'Economic result'], hist.slice().reverse().map((h) => [fmt.date(h.ts), esc(h.name), h.outcome, h.rounds, Math.round(h.score) + '%', fmt.money(h.econ, 'USD', 0)])) : '<p class="muted">None yet.</p>'}</div>`;
      return;
    }
    const S = { round: 0, log: [{ who: 'them', t: cp.intro }], outcome: null, offer: { price: cp.role === 'buyer' ? cp.market + 4 : cp.market - 3, payment: cp.role === 'buyer' ? 'lc' : 'cad', quality: 'loading', window: '30', incoterm: cp.role === 'buyer' ? 'CFR' : 'FOB', penalty: 'capped', tolerance: 's10', dispute: 'arb', duration: 'spot' } };
    if (cp.commodity === 'gold') { S.offer.price = 0.9; S.offer.incoterm = 'DAP'; S.offer.payment = 'lc'; }
    const draw = () => {
      const o = S.offer; const you = cp.role === 'buyer' ? 'seller' : 'buyer';
      const pl = cp.priceLabel || `price (USD/${cp.unit})`;
      const ctx = you === 'seller' ? `Your landed cost: ${f(cp.yourCost)} /${cp.unit} · market reference ≈ ${f(cp.market)} ${CTA.SIM}` : cp.commodity === 'gold' ? `You can resell at spot + ${f(cp.yourResale)} /oz · market premium ≈ ${f(cp.market)} ${CTA.SIM}` : `You can resell at ${f(cp.yourResale)} CFR; freight ${f(cp.freight)} · market FOB ≈ ${f(cp.market)} ${CTA.SIM}`;
      el.innerHTML = `${CTA.pageHead('Negotiation: ' + esc(cp.name), `${cp.role === 'buyer' ? 'You are the seller' : 'You are the buyer'} · ${esc(cp.product)} · ${f(cp.qty, 0)} ${cp.unit}`, cp.commodity, '<a class="btn sm" href="#/dealroom">All counterparties</a>')}
        <div class="grid c2"><div><div class="card"><h4>Conversation</h4><div class="chat" id="chat">${S.log.map((m) => `<div class="msg ${m.who}"><span class="who">${m.who === 'me' ? 'You' : esc(cp.name)}</span>${esc(m.t)}</div>`).join('')}</div><p class="muted" style="font-size:.8rem;margin-top:6px">Round ${S.round} of ${cp.patience} · counterparty patience is limited.</p></div>
          <div class="card soft"><h4>Your position</h4><p style="font-size:.88rem">${ctx}</p><div id="live"></div></div></div>
        <div class="card"><h4>Your offer</h4>${S.outcome ? '' : `<div class="form c2">${CTA.ui.field({ id: 'n-price', name: 'price', label: 'Price — ' + pl, value: o.price, step: 'any' })}${Object.entries(ISSUES).map(([k, v]) => CTA.ui.field({ id: 'n-' + k, name: k, label: v.label, type: 'select', value: o[k], options: v.opts })).join('')}</div><div class="row" style="margin-top:10px"><button class="btn primary" data-a="send">Send offer</button><button class="btn" data-a="accept" ${S.lastCounter ? '' : 'disabled'}>Accept their last counter-offer</button><button class="btn ghost" data-a="walk">Walk away</button></div>`}<div id="rev"></div></div></div>`;
      const live = () => { const v = S.outcome ? S.offer : readOffer(); const rv = review(cp, v, S.round, 'agreed'); CTA.$('#live', el).innerHTML = `<p style="margin:0">Economic result at these terms: <b class="${fmt.cls(rv.econ.total)}">${fmt.money(rv.econ.total, 'USD', 0)}</b> (${f(rv.econ.perUnit)} per ${cp.commodity === 'gold' ? 'oz' : cp.unit}${you === 'seller' ? ', after funding of credit days' : ''})</p>`; };
      const readOffer = () => { const v = CTA.ui.read(el, ['price', ...Object.keys(ISSUES)]); v.price = CTA.num(v.price, o.price); return v; };
      if (!S.outcome) { el.oninput = live; el.onchange = live; } else { el.oninput = null; el.onchange = null; }
      live();
      const chat = CTA.$('#chat', el); chat.scrollTop = chat.scrollHeight;
      const finish = (outcome, terms) => {
        S.outcome = outcome; S.offer = terms || S.offer;
        const rv = review(cp, S.offer, S.round, outcome);
        CTA.state.negotiations.push({ ts: Date.now(), id: cp.id, name: cp.name, outcome, rounds: S.round, score: rv.overall, econ: outcome === 'agreed' ? rv.econ.total : 0, terms: S.offer });
        CTA.record.caseResult('nego-' + cp.id, rv.overall);
        CTA.journalAdd({ auto: true, type: 'negotiation', commodity: cp.commodity, title: `Negotiation with ${cp.name}: ${outcome}`, pnl: outcome === 'agreed' ? rv.econ.total : 0, lessons: rv.miss.join(' ') });
        CTA.log(`Negotiation with ${cp.name}: ${outcome} (score ${Math.round(rv.overall)}%)`, 'nego'); CTA.save();
        draw();
        const lab = { profit: 'Commercial profitability', risk: 'Risk allocation', cash: 'Cash-flow implications', clarity: 'Contractual clarity', credit: you === 'seller' ? 'Buyer creditworthiness handled' : 'Supplier reliability handled', feasible: 'Execution feasibility' };
        CTA.$('#rev', el).innerHTML = `<div class="note ${outcome === 'agreed' ? 'ok' : 'warn'}"><strong>${outcome === 'agreed' ? 'Agreement reached' : 'No agreement'} — overall ${Math.round(rv.overall)}%</strong>Final terms: ${f(S.offer.price)} · ${Object.keys(ISSUES).map((k) => optLabel(k, S.offer[k])).join(' · ')}</div>
          ${CTA.table(['Dimension', 'Score'], Object.entries(lab).map(([k, l]) => [l, Math.round(Math.max(0, Math.min(100, rv.pts[k]))) + '%']))}
          <h4>What you did well</h4><ul>${(rv.good.length ? rv.good : ['—']).map((x) => `<li>${esc(x)}</li>`).join('')}</ul><h4>What you missed</h4><ul>${(rv.miss.length ? rv.miss : ['Nothing major.']).map((x) => `<li>${esc(x)}</li>`).join('')}</ul><h4>How a professional might improve it</h4><ul>${rv.improve.map((x) => `<li>${esc(x)}</li>`).join('')}</ul><div class="row"><a class="btn primary" href="#/dealroom/${cp.id}?r=${Date.now()}">Negotiate again</a><a class="btn" href="#/dealroom">Other counterparties</a></div>`;
      };
      if (S.outcome) return;
      CTA.$('[data-a=send]', el).onclick = () => {
        const v = readOffer(); if (!(v.price > 0)) { CTA.toast('Enter a valid price.', 'warn'); return; }
        S.round++; S.offer = v;
        S.log.push({ who: 'me', t: `Price ${f(v.price)}; ${Object.keys(ISSUES).map((k) => optLabel(k, v[k])).join('; ')}.` });
        const u = util(cp, v), th = threshold(cp, S.round);
        const msg = STYLE_MSG[cp.style];
        if (u >= th) { S.log.push({ who: 'them', t: msg.accept }); finish('agreed', v); return; }
        if (S.round >= cp.patience) { S.log.push({ who: 'them', t: msg.walk }); finish('no deal'); return; }
        const { c, changed } = counter(cp, v, S.round);
        S.lastCounter = c;
        const reasons = changed.map((k) => `${ISSUES[k].label.toLowerCase()}: ${optLabel(k, c[k])}`).join('; ');
        S.log.push({ who: 'them', t: `${msg.counter}We propose price ${f(c.price)}${reasons ? '; ' + reasons : ''}.${cp.style === 'aggressive' ? ' Take it or leave it.' : ''}` });
        S.offer = Object.assign({}, c); draw();
      };
      CTA.$('[data-a=accept]', el).onclick = () => { if (!S.lastCounter) return; S.log.push({ who: 'me', t: 'We accept your last proposal.' }); S.log.push({ who: 'them', t: STYLE_MSG[cp.style].accept }); finish('agreed', S.lastCounter); };
      CTA.$('[data-a=walk]', el).onclick = () => { S.log.push({ who: 'me', t: 'We cannot agree on these terms. Thank you for your time.' }); finish('walked away'); };
    };
    draw();
  } });
  CTA.DEALROOM = { CP, util, threshold, counter, review };
})();
