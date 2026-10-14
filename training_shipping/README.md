# Training Shipping — Freight forwarding academy (Lebanon) · أكاديمية الشحن

A virtual freight-forwarding company in Beirut for training from zero, in **English or Arabic** (switch any time, RTL supported).
You work complete shipments step by step. Each step has a **lesson**, a **hands-on task** (virtual emails, carrier portal, booking tables, documents) and a **quiz**.
Everything you do is saved in **one JSON file per shipment**, which the next departments read.

## How to open it

- **On your desktop:** copy the whole `training_shipping` folder to your Desktop and double-click `index.html` (works offline in Chrome, Edge or Firefox).
- **Online:** if GitHub Pages is enabled for this repository, open `…/training_shipping/index.html`.

Progress is saved automatically in the browser. Use **Shipment JSON file → Download** to keep or share a shipment, and **Import** to load one.

## Folders

```
training_shipping/
├── index.html                               ← start here (hub)
├── shared/                                  ← language, storage/JSON, styles, reference library (glossary, Incoterms, containers, Lebanon guide)
├── port_terminal_management/               ← PORT MASTER ACADEMY: port & terminal management, junior → senior (complete)
├── operations_pricing_freight_forwarder/    ← MODULE 1 (complete)
├── customs_department/                      ← receives customs hand-offs (full module next)
└── accounting_department/                   ← receives the closed job + journal entries (full module next)
```

## Module 1 — Operations & Pricing: the 12 steps

| # | Step | What you do |
|---|------|-------------|
| 1 | Client inquiry & job file | Read the client email, compute weight/CBM, choose equipment, Incoterm, scope, pre-checks |
| 2 | Rate request | Choose what to send, email 3–5 lines, compare the buy sheet (validity, T/S, free time, risk-adjusted cost) |
| 3 | Quotation | Sell price per line, margin, VAT 11%, validity, conditions; client may negotiate |
| 4 | Booking | Pick a feasible sailing vs cutoffs, e-booking form, read the SO, inform client |
| 5 | Empty pickup & stuffing | Stuffing instructions, ISO 6346 check digit, container inspection, VGM & seal |
| 6 | Export customs & gate-in | Export clearance (hand-off to Customs for Lebanese exports), VGM submission, gate-in window, EIR |
| 7 | SI & draft B/L | MBL/HBL parties ("to order"), SI before cutoff, find the errors in the draft, HBL approval |
| 8 | Sailing & release | OBL / telex / seaway choice, freight payment, pre-alert, manifest (NAJM / ICS2) |
| 9 | Tracking & arrival notice | Transshipment delay, honest client update, arrival notice |
| 10 | Release & customs | Credit control, D/O with container deposit, CIF value, hand-off to Customs |
| 11 | Delivery & empty return | Trucking order, demurrage/detention calculation, EIR, deposit refund |
| 12 | Closing | Job costing, invoice VAT (USD + LBP), closing checklist, hand-off to Accounting |

Two scenarios: **Import** (furniture, Shanghai → Beirut, FOB, 40′ HC, door delivery Choueifat) and **Export** (tahini, Zahle → Hamburg, CFR, 20′ DV, CAD with EUR.1).

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
    "accounting": { "department": "accounting", "pack": { "invoice", "payables", "receivables", "disbursements", "jobProfit" } }
  },
  "emails": [ … ], "milestones": [ … ], "score": { "mistakes", "hints" }
}
```

The Customs and Accounting pages list every shipment that has a hand-off for them, from browser storage or from an imported JSON file.

> ⚠️ Training content. Lebanese rates, fees, exchange rates and procedures change often. The figures are realistic samples and the companies are fictional. Always confirm with Lebanese Customs, a licensed broker and your accountant.

## Port Master Academy — ports, terminals, vessels & development (junior → senior)

Open `port_terminal_management/index.html`. A fictional multi-terminal port (Cedar Bay: container terminal CBCT, grain silo terminal, liquid bulk terminal, ro-ro/car terminal, multipurpose berth, empty depot) in English/Arabic with a navy & red maritime theme.

**Core programme (levels 1–5, container terminal):** Foundations · Vessel operations · Yard & gate · Depots & equipment control · Senior management.
**Specialisation tracks (levels 6–9):** Vessel management (ship management, ISM, chartering, laytime/demurrage, voyage economics, surveys/PSC, crew) · Bulk & silo terminals (silos, grain quality, dust-explosion safety, bulk discharge & draft survey) · Other terminals & depots (liquid bulk, ro-ro, breakbulk/heavy lift, advanced depot management) · Port development (master planning, forecasting, capacity, feasibility/NPV, PPP concessions, project delivery, green & smart ports).

- **44 lessons** with formulas, worked examples, a senior tip and a quiz each.
- **26 virtual cases** scored like a senior would judge them (berth conflicts, tides, crane failure, reefer/DG incidents, yard congestion, storms, ransomware, demurrage claims, PSC detention, slow steaming, silo hot spots, dust risk, tank overfill, heavy lifts, expansion strategy, concession bids…).
- **9 simulators**: berth planner, crane split, yard stacking, gate desk, depot survey, 24 h control room, silo bin allocation, voyage speed desk, 10-year port development game.
- **39 unlimited exercise types** with random numbers and full solutions; **9 level exams** with certificates; XP **career ladder** up to Port Director; **140-term EN/AR glossary**.

Progress is stored in the browser (`ptm_progress_v1`).
