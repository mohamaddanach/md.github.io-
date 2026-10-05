# Training Shipping — Freight forwarding academy (Lebanon) · أكاديمية الشحن

A virtual freight-forwarding company in Beirut for training from zero, in **English or Arabic** (switch any time, RTL supported).
You work complete shipments step by step. Each step has a **lesson**, a **hands-on task** (virtual emails, carrier portal, booking tables, documents) and a **quiz**.
Everything you do is saved in **one JSON file per shipment**, which the next departments read.

## How to open it

- **Easiest — one file:** download `training_shipping.htm` (whole system in a single file), save it on your Desktop and double-click it. Works offline. Rebuild it after code changes with `python3 tools/build_single.py`.

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

## Module 2 — Accounting: the 8 steps

The job arrives from Operations inside the shipment JSON (`handoffs.accounting`). You can also practise on the two **sample jobs** on the Accounting home page.

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
| 2 | Classification | HS code per item with a tariff extract (chairs 9401 ≠ tables 9403; tahini 2008.19), effect of a wrong code |
| 3 | Customs value | Import: allocate freight & insurance per item → CIF, LBP. Export: FOB from a CFR price |
| 4 | Duties & taxes | Duty per item, import VAT 11% on (CIF + duty), total USD/LBP; export: what applies |
| 5 | Declaration | NAJM-style form: regime, parties, origin/consignment, B/L, container, packages, weights, value, preference |
| 6 | Lodge & lane | Submit, receive green/yellow lane, answer the officer correctly (never a bribe) |
| 7 | Payment & release | Order of the release chain, pay the Treasury, release / loading and proof of export |
| 8 | Close | What goes to Accounting (fee = revenue, duties = disbursement), write the result into the JSON |

Tariff rates and the customs exchange rate are **samples** for training.

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
