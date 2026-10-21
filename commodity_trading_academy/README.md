# Commodity Trading Academy

**Master Gold, Wheat, Sugar and Steel — from zero to professional trader.**
An interactive virtual training environment that simulates the work of a commodity trading company: structured lessons, quizzes and numerical exercises, practical cases, a 25-step physical deal simulator, a futures & options desk, a negotiation room, trade-finance documents, logistics and risk tools, a trading-company simulator and examinations.

> ⚠️ **Educational simulation.** Every price, exchange rate, counterparty, company, document and event in this platform is **simulated or fictional** unless explicitly labelled *HISTORICAL* or linked as an external official source. No live market data is connected. Contract specifications and many ratios are *ILLUSTRATIVE* teaching values. Nothing here is investment, legal, tax, customs or banking advice, and completing the academy is **not** a professional licence or industry certification.

## How to run it

No build step, no server, no dependencies. It is plain HTML/CSS/JavaScript, like the rest of this repository.

| Option | Command / action |
|---|---|
| Open directly | Double-click `commodity_trading_academy/index.html` (works offline in Chrome, Edge, Firefox, Safari) |
| Local web server | `npx serve .` or `python3 -m http.server 8000` from the repository root, then open `http://localhost:8000/commodity_trading_academy/` |
| GitHub Pages | If Pages is enabled for this repository: `https://<user>.github.io/<repo>/commodity_trading_academy/` |

Progress is saved automatically in the browser (`localStorage`, key `cta_state_v1`). Use **Settings & Progress → Export progress** to back it up or move it to another computer.

## Tests

```bash
node commodity_trading_academy/tests/calc.test.js   # 67 hand-verified calculation tests
node commodity_trading_academy/tests/sim.test.js    # ~1,700 simulation accounting-invariant checks
node commodity_trading_academy/tests/ui.test.js     # 177 browser checks (needs Playwright + Chromium)
```

The calculation tests also run inside the app: **Settings & Progress → Run calculation self-tests**.

## What is inside

| # | Section | What it does |
|---|---|---|
| 1 | Command Center | Mastery, quiz/exercise accuracy, futures account, deals, study time, simulated market board, roadmap, weak subjects, recent activity |
| 2 | My Learning Path | 10 mastery-gated stages, 44 lessons; a lesson counts only when its check quiz is passed (≥ 70%); stages unlock in order (or enable free navigation) |
| 3 | Commodity Encyclopedia | Profiles, side-by-side comparison, universal unit converter (troy vs avoirdupois oz, metric/short/long tons, bushels) |
| 4–7 | Gold / Wheat / Sugar / Steel Trading | Overview (physical vs financial), lessons, 10 practical cases each, commodity tools, instruments & unit conversions |
| 8 | Global Commodity Markets | Value-chain explorer, driver matrix, temporary-vs-structural classifier, research & data-source directory, live-data policy |
| 9 | Physical Trading Simulator | 25-step deal workflow for each commodity, full Deal Calculator, completed-deal reports, **Trading Company simulator** |
| 10 | Futures & Derivatives | 10 rule-based scenarios, orders with spread/slippage/fees, stops/targets with gap fills, margin calls & liquidation, expiry & roll, options chain (Black-76) with Greeks, equity curve, drawdown |
| 11 | Market Analysis Lab | Candlesticks, SMA, Bollinger, RSI, MACD, volume, support/resistance, an honest crossover backtest with costs; S&D balance builder; spread/arbitrage calculator and 10 exercises |
| 12 | Deal Room | 6 counterparties with distinct traits; negotiate price, payment, quality, window, delivery term, penalties, tolerance, disputes, duration; detailed review |
| 13 | Trade Finance & Documents | Payment methods, obligations, UCP 600 summary, Incoterms® 2020 cost/risk matrix and comparison, 3 LC discrepancy examinations, 28 annotated documents (fillable from your own deals), adaptive checklist |
| 14 | Logistics & Supply Chain | Shipping cost estimator with profit impact, laytime/demurrage/despatch, vessel & handling guide, 5 disruption scenarios |
| 15 | Risk Management Center | Dashboard with limit monitor, deal risk registers (16 risk types, probability/impact/mitigation/residual/owner/contingency) with heat map, combined 5,000 t wheat stress test, sizing & hedge residual risks |
| 16 | Quantitative Lab | Returns, volatility, skew/kurtosis, rolling vol, drawdown, correlation matrix, regression, rolling correlation, historical/parametric/Monte Carlo VaR and ES, diversification |
| 17 | Trading Journal | Auto-entries from simulators plus your own; search, filter, edit, delete, CSV export |
| 18 | Performance Analytics | Accuracy by subject, weak subjects, case scores by commodity, study time, futures, deals, negotiations, exams |
| 19 | Exams & Certifications | 11 subject exams (fresh random draws, timed, per-topic breakdown) + full-case exam; practice bank by topic; educational completion record |
| 20 | Glossary | 215 terms with categories and aliases; also shown as hover/focus tooltips (~390 auto-linked in lessons) |
| 21 | Settings & Progress | Name, currency, free navigation, auto-journal, simulated FX rates, editable contract specs, export/import/reset, self-tests |

### Content inventory

| Item | Count |
|---|---|
| Lessons (10 stages; Level 0 concepts each with simple + professional explanation, why it matters, example, numbers, common mistake, quiz) | 44 |
| Multiple-choice questions (distinct, each with explanation; option order shuffled on display) | 159 |
| Parameterised numerical exercises ("New numbers" redraws inputs; formula, worked steps, mistakes, implication) | 55 |
| Commodity practical cases (numerical + decision steps, every alternative explained) | 40 (10 per commodity) |
| Other case studies: spreads/arbitrage 10, logistics disruptions 5, LC examinations 3, temporary-vs-structural 8 items | 26 |
| Multi-stage simulations: 4 physical deals, 10 futures scenarios, trading company, 6 negotiations, final case exam | 22 |
| Trade documents (purpose, preparer, receiver, timing, consistency, mistakes, annotations) | 28 |
| Glossary terms | 215 |
| Research sources (official / exchange / industry, with suitability notes) | 25 |

## Architecture

```
commodity_trading_academy/
├── index.html                 single page; loads the scripts below in order (works from file://)
├── css/app.css                navy shell, charcoal trading workspaces, light content, commodity accents
├── js/calc.js                 pure calculation library (browser + Node): units, FX, landed cost, deal P&L,
│                              futures, Black-76 & Greeks, statistics, VaR/ES, Monte Carlo, laytime, hedging,
│                              arbitrage, S&D balances, cash timelines, seeded RNG, OHLC price model
├── js/core.js                 state & persistence, hash router, shell, search, tooltips & auto-linking,
│                              quiz / exercise / form widgets, SVG charts, study timer
├── js/progress.js             stages, mastery rules, topic statistics, weak-subject detection
├── js/data/                   glossary, questions, lessons (3 files), exercises, cases, markets & scenarios,
│                              documents, physical simulator scenarios
├── js/views/                  one file per section (dashboard, learning, commodity, global, physical, company,
│                              futures, analysis, dealroom, finance, logistics, risk, quant, records, exams)
└── tests/                     calc.test.js, sim.test.js, ui.test.js
```

Design decisions: the existing repository is a static GitHub Pages site without a build system, so the academy follows the same approach — vanilla JavaScript, no framework, no CDN dependencies (charts are hand-built SVG; fonts degrade gracefully offline). Every section registers a route with `CTA.route()`, keeping screens independent and extensible.

### Calculation conventions (see `js/calc.js`)

- Mass is converted through kilograms; `t` = metric ton, `st` = short ton (2,000 lb), `lt` = long ton, `ozt` = troy ounce (31.1034768 g), `oz` = avoirdupois ounce, `bu_wheat` = 60 lb.
- FX rates are "units per 1 USD" and are simulated/editable. Interest is simple interest, ACT/360 by default.
- **Landed cost** declares each cost line once; lines already included in the purchase Incoterm are locked (e.g. freight under CFR/CIF) to prevent double counting. Insurance on 110% of value; customs value CIF or FOB (selectable). Financing appears once — inside landed cost.
- **Net profit** = net sales revenue − total landed cost − selling expenses not already included − other financing not already included − other deal costs. Break-even, working capital (after buyer advances and supplier credit), equity-funded share, ROIC and annualised ROIC, collection date and stressed maximum loss are derived from the same inputs.

### Simulation models (documented, reproducible)

- **Price paths**: geometric Brownian motion with four intraday sub-steps (OHLC), plus scenario-scheduled drift/volatility changes and jumps (`js/data/markets.js`). Same seed → same path.
- **Physical simulator**: purchase = benchmark + supplier differential; sale = benchmark at B/L + buyer premium; short hedge with a futures move that differs from the physical move (basis risk); costs per unit, % of value and lump sum; financing over the full cash cycle; events (short shipment, delays, damage, quality claims, extensions, defaults, discrepancies) are rolled deterministically per run seed from your choices (`js/data/sim-scenarios.js`, `js/views/physical.js`). Seven skills are scored at every step; avoidable losses penalise risk management, and "profitable but risky" deals are flagged.
- **Trading company**: monthly opportunities from templates, price shocks, published event probabilities by supplier/buyer rating; accounting identity equity = capital + realised + unrealised is tested every month.
- **Negotiation**: weighted multi-issue utilities, declining acceptance thresholds, style-dependent counter-offers, limited patience.

## Live market data

None is connected, deliberately. A static site cannot keep API keys secret, and most exchange and benchmark data is licensed. A real integration would require a data licence, a server-side proxy holding credentials, documentation of update frequency and delay (often 10–20 minutes for free exchange data, or end-of-day), whether series are physical assessments or futures settlements, and roll methodology for continuous futures. Until then, the platform never labels a price as current market data.

## Known limitations

- Contract specs, margins, fees, freight and many ratios are illustrative; verify against current exchange rulebooks and real quotes.
- Black-76 assumes constant volatility, lognormal prices and European exercise; real commodity options show skews and jumps.
- VaR/ES and Monte Carlo use simple models; correlations are estimated from a simulated dataset.
- Incoterms, UCP 600 and document descriptions are summaries for learning — rely on official ICC texts, the actual credit, and counsel. Document checklists are not legally sufficient.
- Physical delivery of futures is not simulated (positions are closed or rolled before expiry).
- Progress lives in one browser; use export/import to move it. There is no multi-user backend.
- English only.

## Recommended next development phase

1. Second scenario per commodity in the physical simulator (e.g. FOB sale with buyer-nominated vessel; DAP steel to a project site; gold doré refining toll).
2. Spaced-repetition review queue driven by weak-topic statistics.
3. Optional licensed data adapter (server-side) behind a clear "live / delayed / simulated" label.
4. Multi-cargo programme contracts and borrowing-base mechanics in the company simulator.
5. Freight derivatives (FFA) and FX hedging desk; American options (binomial model) with volatility smile.
6. Instructor mode: export a student's progress report and exam results as PDF.
