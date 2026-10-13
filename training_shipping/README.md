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

## Port Master Academy — port & terminal management (junior → senior)

Open `port_terminal_management/index.html`. A virtual container terminal (CBCT, fictional) in English/Arabic with a navy & red maritime theme:

- **Academy** — 26 lessons in 5 levels (Foundations · Vessel operations · Yard & gate · Depots & equipment control · Senior management), each with formulas, worked examples, a senior tip and a quiz.
- **Virtual cases** — 16 decision scenarios (early arrival, deep draft vs tide, crane breakdown, reefer alarm, DG leak, yard congestion, overstow, VGM cut-off, empty shortage, damage dispute, storm, ransomware, labour shortage, security, line negotiation, gate queue), scored like a senior would judge them.
- **Simulators** — berth planner (Gantt, compared with an auto-planner), crane split optimiser, yard stacking & rehandles, gate check-in desk (ISO 6346, VGM, seals, cut-offs, DG, reefers), depot survey & liability, 24 h control-room shift.
- **Exercises** — 22 calculation types with random numbers and full solutions (TEU, check digit, UKC/squat, GMPH, berth occupancy, yard capacity, Little's law, storage tiers, EOR, days of cover, MTBF, LTIFR, break-even…).
- **Level exams & certificates**, an XP-based **career ladder** (Trainee → Senior Port Operations Manager), an 86-term **EN/AR glossary**, and progress export/import.

Progress is stored in the browser (`ptm_progress_v1`).
