# The Complete Business Knowledge Encyclopedia

A ten-volume bilingual (English/Arabic) business reference in A4 PDF, covering all 23 parts of the
specification plus a Professional Business Document Library, an exercise bank, a six-month learning
roadmap and a final assessment.

## Volumes (`pdf/`)

| Vol. | Title | Parts | Pages |
|---|---|---|---|
| 1 | Foundations and the Language of Business | I (terminology dictionary, 20 categories) | 119 |
| 2 | How Businesses Work — Accounting and Financial Statements | II, III | 63 |
| 3 | Corporate Finance, Economics and Business Mathematics | IV, V, XX | 66 |
| 4 | Banking, International Trade and Treasury | VI, VII, XVIII | 83 |
| 5 | Commercial Operations — Sales, Supply Chain, Insurance and Risk | VIII, IX, XV | 60 |
| 6 | Investment, Capital Markets, Commodities and Market Intelligence | X, XI, XXI | 54 |
| 7 | Law, Entrepreneurship, Management and Technology | XII, XIII, XIV, XVI | 67 |
| 8 | Professional Practice — Communication, Deals and Advanced Thinking | XVII, XIX, XXII | 68 |
| 9 | Document Library, Master Reference, Exercises and Learning Roadmap | Document Library, XXIII, exercises, roadmap, final assessment | 81 |
| 10 | Master Table of Contents, Glossary and Unified Index | Master TOC, EN–AR glossary, thematic glossary, unified index, concept guide | 50 |

Chapter numbers run continuously across volumes; the unified index in Volume 10 gives references
as `volume:page`. All companies, people, documents and figures are fictional training material.
Legal and regulatory content explains principles and must be checked against current law in the
relevant jurisdiction.

## Building

```bash
sudo apt-get install fonts-noto-core     # Noto Serif/Sans, Noto Naskh/Sans Arabic
pip install weasyprint markdown
python3 build.py            # all volumes, then Volume 10
python3 build.py 4 5        # selected volumes
python3 build.py 10         # master volume only (needs build/volNN.json)
python3 build.py 9 --html   # also keep the intermediate HTML
```

- `manifest.py` — volume, part and file structure.
- `src/vNN/*.md` — content in Markdown with extensions: `:::kind Title … :::` boxes, `:::term` and
  `:::calc` cards, `[[term]]` index entries and `{{ch:Title fragment}}` chapter cross-references.
- `build.py` — Markdown → HTML → PDF (WeasyPrint), two-pass rendering for page references,
  automatic indexing of Volume 1 terms in Volumes 2–9, and the master volume.
- `style.css` — page layout, palette and typography.
