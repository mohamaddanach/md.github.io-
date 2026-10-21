/* Global Commodity Markets — value chain, drivers, structural-vs-temporary practice, research sources & data policy. */
(function () {
  const CTA = window.CTA, esc = CTA.esc;
  const DRIVERS = [
    ['Weather', 'Low', 'Very high', 'High', 'Low', 'Yield and quality shocks for crops; cane crushing interruptions.'],
    ['USD strength', 'High', 'Medium', 'Medium', 'Medium', 'USD-priced goods become dearer for others; producer currencies matter.'],
    ['Interest rates', 'High', 'Medium (carry)', 'Medium (carry)', 'Medium (demand, carry)', 'Opportunity cost (gold), financing of stocks, economic activity.'],
    ['Energy prices', 'Low', 'Medium (inputs, freight)', 'High (ethanol)', 'High (EAF power, coke, freight)', 'Through costs and substitution (ethanol).'],
    ['Trade policy', 'Medium (duties, import rules)', 'High (export bans/taxes)', 'Very high (quotas, subsidies)', 'Very high (anti-dumping, safeguards)', 'Redirects flows and changes landed costs.'],
    ['Industrial demand', 'Low', 'Low', 'Low-medium', 'Very high', 'Construction, manufacturing cycles.'],
    ['Investment flows', 'Very high', 'Medium', 'Medium', 'Low', 'ETF/futures positioning, safe-haven flows.'],
    ['Freight', 'Low', 'High', 'High', 'High', 'Determines competitive origins and delivered prices.'],
  ];
  const STRUCT = [
    ['A two-week port strike halts grain loading at one terminal.', 'temp', 'Short-lived logistics disruption; stocks and other ports cushion it.'],
    ['A major steel-producing country commits to replacing blast furnaces with EAFs over 10 years.', 'struct', 'Changes raw-material demand (ore/coal vs scrap/DRI) for years.'],
    ['A drought cuts one season\'s cane crop by 12%.', 'temp', 'A one-season weather shock — unless it triggers lasting policy changes.'],
    ['A government permanently raises the mandatory ethanol blend in gasoline.', 'struct', 'Diverts cane from sugar to fuel over the long term.'],
    ['A rumour of an export ban, denied next day.', 'temp', 'Noise; the market reverses once denied.'],
    ['Several central banks adopt multi-year policies to increase gold reserves.', 'struct', 'A persistent source of demand over years.'],
    ['A new deep-water export terminal doubles a region\'s grain export capacity.', 'struct', 'Permanently changes competitiveness and trade flows.'],
    ['A cyclone closes a sugar port for 10 days.', 'temp', 'Delays shipments; supply arrives later.'],
  ];
  CTA.route('global', { title: 'Global Commodity Markets', desc: 'Value chain, drivers, case studies and research sources.', render(el, r) {
    const tab = r.parts[0] || 'chain';
    el.innerHTML = `${CTA.pageHead('Global Commodity Markets', 'How commodities move from production to the final buyer, what drives prices across regions, and where to find reliable information.')}
      ${CTA.tabs([['chain', 'Value chain'], ['drivers', 'Driver matrix'], ['structural', 'Temporary vs structural'], ['research', 'Research & data sources']], tab, 'global')}<div id="gb"></div>`;
    const b = CTA.$('#gb', el);
    if (tab === 'chain') b.innerHTML = '<div data-widget="valueChain"></div><div class="card"><h3>Learn more</h3><a class="btn" href="#/path/lesson/m-valuechain">Lesson: the value chain</a> <a class="btn" href="#/path/lesson/m-flows">Lesson: regions, flows & seasons</a></div>';
    else if (tab === 'drivers') b.innerHTML = `<div class="card"><h3>Sensitivity of each commodity to key drivers ${CTA.ILLU}</h3><p class="muted">Qualitative, educational assessment of typical sensitivity. Actual sensitivities change over time.</p>${CTA.table(['Driver', 'Gold', 'Wheat', 'Sugar', 'Steel', 'Mechanism'], DRIVERS)}</div><div data-widget="miniArb"></div>`;
    else if (tab === 'structural') {
      b.innerHTML = `<div class="card"><h3>Classify each development</h3><p class="muted">Temporary price movement or structural change? Use the checklist from the lesson “Shocks, substitution and structural change”.</p>${STRUCT.map((s, i) => `<div class="card soft" data-i="${i}"><p>${i + 1}. ${esc(s[0])}</p><div class="seg"><button data-v="temp">Temporary</button><button data-v="struct">Structural</button></div><div class="fb"></div></div>`).join('')}<div id="stres"></div></div>`;
      let n = 0, c = 0;
      CTA.$$('[data-i]', b).forEach((card) => CTA.$$('button', card).forEach((btn) => { btn.onclick = () => { if (card.dataset.done) return; card.dataset.done = 1; const s = STRUCT[+card.dataset.i], ok = btn.dataset.v === s[1]; n++; if (ok) c++; btn.classList.add('on');
        CTA.$('.fb', card).innerHTML = `<div class="note ${ok ? 'ok' : 'bad'}"><strong>${ok ? 'Correct' : 'Not quite'} — ${s[1] === 'temp' ? 'temporary' : 'structural'}</strong>${esc(s[2])}</div>`;
        if (n === STRUCT.length) { CTA.$('#stres', b).innerHTML = `<div class="note ${c >= 6 ? 'ok' : 'warn'}"><strong>${c}/${STRUCT.length} correct</strong></div>`; CTA.record.caseResult('structural-classifier', c / STRUCT.length * 100); } }; }));
    } else {
      const M = CTA.MARKET;
      b.innerHTML = `<div class="note warn"><strong>No live market data is connected</strong>This academy runs entirely on educational content and simulated datasets, so it works offline. Every price you see inside it is simulated. The links below go to external official or primary sources for your own research.</div>
        <div class="card"><h3>Types of information — and how far to trust them</h3>${CTA.table(['Type', 'Characteristics'], M.SOURCE_TYPES)}</div>
        <div class="card"><div class="card-h"><h3>Sources directory</h3><select id="srcf" style="max-width:200px" aria-label="Filter by commodity"><option value="">All commodities</option><option>gold</option><option>wheat</option><option>sugar</option><option>steel</option></select></div><div id="srcl"></div></div>
        <div class="card"><h3>If you connect a live data source</h3><p>A real integration would need, and the academy would have to document:</p><ul><li><b>Data source</b> and its licence (exchange data and benchmark prices are usually licensed; redistribution is often restricted).</li><li><b>API requirements</b>: credentials/API keys, rate limits, a server-side proxy to keep keys secret (a static site cannot hide keys).</li><li><b>Update frequency</b> and whether prices are <b>real-time, delayed</b> (often 10–20 min for free exchange data) or end-of-day.</li><li>Whether data represent <b>physical</b> (assessments, tenders) or <b>financial</b> (futures settlements) markets.</li><li>Data limitations: revisions, holidays, roll methodology for continuous futures series.</li></ul><p class="muted">Until such a connection exists, this platform will never label a price as current market data.</p></div>`;
      const draw = () => { const fv = CTA.$('#srcf', b).value; CTA.$('#srcl', b).innerHTML = CTA.table(['Source', 'Type', 'Good for', 'Commodities'], M.SOURCES.filter((s) => !fv || s.com.includes(fv)).map((s) => [`<a href="${s.url}" target="_blank" rel="noopener">${esc(s.name)}</a>`, esc(s.type), esc(s.use), s.com.map((c) => `<span class="badge t-${c}">${c}</span>`).join(' ')])); };
      CTA.$('#srcf', b).onchange = draw; draw();
    }
  } });
})();
