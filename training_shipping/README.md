# Training Shipping — Freight forwarding academy (Lebanon) · أكاديمية الشحن

A virtual freight-forwarding company in Beirut for training from zero, in **English or Arabic** (switch any time, RTL supported).
You work complete shipments step by step. Each step has a **lesson**, a **hands-on task** (virtual emails, carrier portal, booking tables, documents) and a **quiz**.
Everything you do is saved in **one JSON file per shipment**, which the next departments read.

## How to open it

- **Easiest — one file:** download `training_shipping.html` (whole system in a single file), save it on your Desktop and double-click it. Works offline. Rebuild it after code changes with `python3 tools/build_single.py`.

- **On your desktop:** copy the whole `training_shipping` folder to your Desktop and double-click `index.html` (works offline in Chrome, Edge or Firefox).
- **Online:** if GitHub Pages is enabled for this repository, open `…/training_shipping/index.html`.

Progress is saved automatically in the browser. Use **Shipment JSON file → Download** to keep or share a shipment, and **Import** to load one.

## Folders

```
training_shipping/
├── index.html                               ← start here (hub)
├── shared/                                  ← language, storage/JSON, styles, task widgets, department engine, reference library
├── operations_pricing_freight_forwarder/    ← MODULE 1 (complete)
├── customs_department/                      ← MODULE 3 (complete)
└── accounting_department/                   ← MODULE 2 (complete)
```

## 20 clients — never the same exercise twice

The Operations home page is a **client board**: 20 different clients, each asking for a different job, plus a **🎲 random client** generator. Every case has its own:

- **Mode & direction** — FCL or LCL, import to Beirut or export from Lebanon (8 FCL imports, 5 LCL imports, 5 FCL exports… see the board filters).
- **Goods** — furniture, tiles, solar panels, coffee, medical gloves, textiles, laptops, car parts, cosmetics, tyres, toys, paper; tahini, olive oil, wine, soap, za'atar, baklava, handmade furniture, pickles — each with its own HS codes, distractor codes, duty rates and licences.
- **Route & partners** — 25 ports (Far East, India, Med, North Europe, Gulf, Americas, Oceania), transshipment hubs, fictional suppliers, buyers and overseas agents, 5 lines and 4 LCL consolidators.
- **Terms** — EXW / FCA / FOB imports, CFR / CIF / DAP exports; payment by advance, 30/70 T/T against copy B/L, CAD or L/C (which decides the B/L release and the HBL consignee).
- **Persona** — formal, friendly, in a hurry, demanding (always negotiates), first-timer — changes the emails, the negotiation threshold and the mail tasks.
- **Numbers & traps** — quantities, weights, CBM, units (cm / mm / total weight), rates, validity trap, short-free-time trap, ETDs, delay at the hub, customs lane, CFS re-measurement…

Quizzes mix lesson questions with **generated micro-exercises** (new numbers every file, options shuffled). The **🎯 Drills** page (in every department) is endless: CBM, W/M, LCL freight, container choice, margin/markup, D&D, CFS storage, Incoterm who-pays, ISO 6346 check digit, VGM, cutoffs, CIF, duty + VAT, FOB from CFR, HS, journal entries, VAT and LBP — with streak and accuracy.

## Module 1 — Operations & Pricing: the 12 steps

| # | Step | FCL | LCL |
|---|------|-----|-----|
| 1 | Client inquiry & job file | Weight/CBM, equipment, Incoterm, scope, pre-checks | + chargeable W/M |
| 2 | Rate request | 5 lines: all-in, validity, T/S, free time, risk-adjusted cost | 4 consolidators: rate/W/M, minimum, CFS storage |
| 3 | Quotation | Lines × quantity, margin, VAT 11%, conditions, negotiation | per-W/M lines, “billed on CFS measurement” |
| 4 | Booking | Feasible sailing vs CY cutoff, SO | CFS cutoff |
| 5 | Pickup & stuffing | ISO 6346, inspection, VGM & seal | Cargo to CFS, dock receipt re-measurement, marks |
| 6 | Export customs & gate-in | EXW = buyer clears; Lebanese export docs by zone (EUR.1 / Arab COO / health cert) | consolidation & loading record |
| 7 | SI & draft B/L | MBL/HBL parties (“to order” only with a bank), 3 random errors in the draft | CFS/CFS |
| 8 | Sailing & release | Release by payment terms, prepaid carrier invoice, pre-alert, ICS2 / AMS / NAJM | |
| 9 | Tracking & arrival | Random delay & reason, honest update, arrival notice | |
| 10 | Release & customs | Credit control, D/O + deposit, CIF, hand-off to Customs; export: release sequence by payment, preference | no deposit |
| 11 | Delivery | Trucking or client pick-up, D&D, deposit refund | CFS storage |
| 12 | Closing | **Answer every open email**, job costing, invoice VAT (USD + LBP), hand-off to Accounting | W/M adjustment & storage rebilled |

### Mailbox v2 & document alerts

- Folders (Inbox, **Needs reply**, Sent, Clients, Lines & consolidators, Agents & suppliers, Customs/trucking/banks), avatars, threads, search, quick reply.
- **Mail tasks**: 4 per file, chosen for the case — ETA questions, documents for customs, deposit, free time, fee breakdown, insurance, early empty, bank documents, duty at destination, LCL re-measurement complaint, missing VGM from the line, broker’s missing document, agent invoice overcharge, trucker waiting time, supplier delay… You must pick and send the right reply; the file cannot be closed while one is open.
- Attachments (📎) open the real document in a printable pop-up. Every time a new document becomes available, a **📄 New document** alert appears with a View button.

## Module 2 — Accounting: the 8 steps

The job arrives from Operations inside the shipment JSON (`handoffs.accounting`). You can also practise on the **sample jobs** (FCL/LCL, import/export) on the Accounting home page.

| # | Step | What you do |
|---|------|-------------|
| 1 | Receive & review | Check sell vs cost lines, VAT treatment of each line (11% / exempt), job profit vs quoted |
| 2 | Tax invoice | Mandatory Lebanese invoice content, exempt/taxable split, VAT 11%, VAT in LBP, balance due |
| 3 | Sales entry | Dr 411 / Cr 706 / Cr 4427 |
| 4 | Supplier invoices | Match the trucker's invoice (hold + credit note), input VAT, Dr 604 / Dr 4426 / Cr 401 |
| 5 | Cash | Customer receipt, supplier payments, full container-deposit lifecycle (4191 / 4671, D&D deduction, offset, refund) |
| 6 | Bank reconciliation | Statement vs books, outstanding payment, bank charges, Dr 627 / Cr 512 |
| 7 | VAT return | Quarter end, output − input VAT, LBP, 20-day deadline, Dr 4427 / Cr 4426 / Cr 4424, payment |
| 8 | Close | Job P&L from the ledger, which accounts must be zero, trial balance, close the job |

Journal entries are checked automatically (balanced, right accounts, right sides, right amounts). The journal, ledger, trial balance and documents (tax invoice, supplier invoices, customer statement, bank reconciliation, VAT working paper) are saved in `accounting` inside the same shipment JSON.

## Module 3 — Customs: the 8 steps

The file arrives from Operations inside the shipment JSON (`handoffs.customs_import` at step 10 for imports, `handoffs.customs_export` at step 6 for exports). Sample files are available on the Customs home page.

| # | Step | What you do |
|---|------|-------------|
| 1 | File & documents | Required documents, cross-check invoice ↔ packing list ↔ manifest/certificates, get the error corrected |
| 2 | Classification | HS code per item with a tariff extract built for the case (right codes + the supplier’s code + distractors), effect of a wrong code |
| 3 | Customs value | Import: allocate freight & insurance per item → CIF, LBP. Export: FOB from a CFR / CIF / DAP price |
| 4 | Duties & taxes | Duty per item, preferential origin (EU EUR.1 / GAFTA → 0%, origin ≠ country of shipment), import VAT 11%, total USD/LBP |
| 5 | Declaration | NAJM-style form: regime, parties, origin/consignment, B/L, container, packages, weights, value, preference |
| 6 | Lodge & lane | Submit, receive a green / yellow / red lane, answer the officer correctly (never a bribe) |
| 7 | Payment & release | Order of the release chain, pay the Treasury, release / loading and proof of export |
| 8 | Close | What goes to Accounting (fee = revenue, duties = disbursement), write the result into the JSON |

Tariff rates and the customs exchange rate are **samples** for training.

## Design

Navy & red colour scheme (light and dark), client cards, navy top bar with a red accent line, red highlights for active items and calls to action.

## Graphics & automations

- **Dashboards & insights:** shipment dashboard (journey map with the ship’s position, deadline timeline, container fill meters, carrier rate chart, price build-up, demurrage cost curve, profit waterfall); a chart under each step; customs duty/VAT waterfall; accounting P&L waterfall, supplier and VAT charts; KPI tiles on every home page. Charts use a CVD-validated palette, direct labels and hover tooltips, in light and dark.
- **Autopilot (▶ / ⏩):** watch the app play the current step or the whole file (counts as hints in the score).
- **Next-action coach:** tells you the next task and warns about cutoffs, demurrage, unread emails, unpaid balances and VAT deadlines.
- **Command palette (Ctrl+K or /):** jump to any step, page, document or term.
- **Light/dark toggle (◐), mobile menu (☰), first-visit tour, celebration when a step is completed.**

## Realistic documents & clickable terms

Documents follow real layouts (watermarked **SPECIMEN · TRAINING**, fictional parties): quotation, commercial invoice, packing list, certificate of origin, EUR.1, health certificate, booking confirmation, EIRs, VGM declaration, shipping instructions, master & house B/L / sea waybill, arrival notice, delivery order, trucking order, tax invoice; customs declaration (numbered-box layout), assessment notice, release; supplier invoices & credit note, statement of account, bank statement & reconciliation, VAT working paper, journal vouchers.

Every important label or term (in documents, lessons, emails) is clickable: a card opens with the meaning in **English and Arabic** (`shared/terms.js`, ~150 terms).

## The shipment JSON file (hand-offs between departments)

```jsonc
{
  "schema": "training_shipping.shipment", "schemaVersion": 1,
  "id": "PFT-IMP-2026-0001", "scenario": "IMP", "direction": "import",
  "status": "open | closed", "currentDepartment": "operations | accounting",
  "sim": { "start": "…", "today": "…" },           // simulation calendar
  "parties": { … }, "jobFile": { … },               // step 1
  "rates": { "requested": [], "received": [], "selected": { … } },
  "quotation": { "lines": [ { "code", "desc", "buy", "sell", "vat", "vendor" } ], "totals": { … } },
  "booking": { "no", "vessel", "cutoffs": { "erd", "si", "vgm", "cy" }, "freeDays", … },
  "equipment": { "containerNo", "seal", "tare", "vgm", … },
  "documents": { "si", "bl": { "mblNo", "hblNo", "hblType", … }, "arrivalNotice", "preAlert" },
  "tracking": [ … ], "release": { … }, "delivery": { … }, "dd": { … },
  "handoffs": {
    "customs_export" | "customs_import": { "department": "customs", "status", "pack": { … CIF, HS, documents … } },
    "customs": { "declaration", "value", "taxes", "payment", "release", "result" },
  "accounting": { "department": "accounting", "pack": { "invoice", "payables", "receivables", "disbursements", "jobProfit" } }
  },
  "emails": [ … ], "milestones": [ … ], "score": { "mistakes", "hints" },
  "customs": { "declaration", "value", "taxes", "payment", "release", "result" },
  "accounting": { "journal": [ { "ref", "date", "lines": [ { "acc", "dr", "cr" } ] } ], "docs": { "invoice", "bankRec", "vatReturn" }, "result": { … }, "score": { … } }
}
```

The Customs and Accounting pages list every shipment that has a hand-off for them, from browser storage or from an imported JSON file.

> ⚠️ Training content. Lebanese rates, fees, exchange rates and procedures change often. The figures are realistic samples and the companies are fictional. Always confirm with Lebanese Customs, a licensed broker and your accountant.
