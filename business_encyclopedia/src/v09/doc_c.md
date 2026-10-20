# Banking, Credit and Investment Documents

:::obj In this chapter
Letter of credit application, illustrative letter of credit, documentary collection instructions, credit application, credit analysis memorandum, loan term sheet, commercial loan proposal, investment memorandum, business valuation report and due diligence checklist.
:::

## Letter of credit application

| Aspect | Description |
|---|---|
| Purpose | Applicant’s instruction to its bank to issue a documentary credit, and agreement to reimburse the bank |
| Users | Applicant (buyer), issuing bank’s trade-finance team and credit approvers |
| Important fields | Applicant and beneficiary; amount, currency, tolerance; form (irrevocable), applicable rules; availability (sight/usance; with which bank; by payment/acceptance/negotiation); expiry date and place; latest shipment date; partial shipments/transhipment; ports/places; goods description and Incoterms rule; documents required; additional conditions; charges; presentation period; confirmation instructions; reimbursement; account to debit; signatures per mandate |
| Common mistakes | Over-detailed goods descriptions; documents the beneficiary cannot obtain; expiry too soon after shipment; inconsistent Incoterms and insurance requirements; “non-documentary conditions” |
| Consequences | Discrepancies, amendments, delays and costs; reduced protection for the buyer |

:::doc L/C application — key fields (training template)
**To:** Training Bank (fictional), Trade Finance Department · **Applicant:** Muscat Builders LLC (fictional), Muscat
Please issue an irrevocable documentary credit by SWIFT on the following terms:

| Field | Instruction |
|---|---|
| Beneficiary | Deccan Steel Mills Ltd (fictional), Mumbai, India · Bank: [advising bank, if known] |
| Amount | USD 1,360,000.00, tolerance ±5% |
| Applicable rules | UCP latest version |
| Available | With any bank by negotiation; drafts at 90 days after B/L date; usance payable at sight, discount charges for applicant’s account |
| Expiry | 5 September, in India |
| Latest shipment | 15 August · Partial shipments: allowed · Transhipment: not allowed |
| Port of loading / discharge | Any port in India / Sohar, Oman |
| Goods | 2,000 MT (±5%) deformed steel bars B500B per BS 4449, CFR Sohar, Incoterms® 2020, as per contract MB-2026-07 |
| Documents | (1) Signed commercial invoice in 3 originals; (2) packing/bundle list; (3) full set of clean on-board B/Ls made out to order of Training Bank, notify applicant, freight prepaid; (4) mill test certificates; (5) inspection certificate issued by [named independent inspection company] certifying quantity and conformity to BS 4449 B500B; (6) certificate of origin issued by a chamber of commerce |
| Additional conditions | All documents to show the credit number; insurance covered by applicant |
| Charges | Issuing bank charges for applicant; all others for beneficiary |
| Presentation period | Within 21 days after shipment date but within validity |
| Confirmation | Without |
| Debit account | [applicant’s account number] · Cash margin 10% from account [number] |

**Undertaking:** The applicant agrees to the bank’s general terms for documentary credits and to reimburse the bank for all payments made under the credit. *Signed by authorised signatories per mandate.*
:::

## Illustrative letter of credit (SWIFT MT700-style fields)

:::doc Documentary credit — illustrative field layout (training specimen)
**TRAINING SPECIMEN — not issued by any bank. Field tags shown for orientation only; consult current SWIFT standards for the authoritative format.**

| Tag | Field | Content |
|---|---|---|
| 27 | Sequence of total | 1/1 |
| 40A | Form of documentary credit | IRREVOCABLE |
| 20 | Documentary credit number | TB-DC-26-0815 |
| 31C | Date of issue | 260620 |
| 40E | Applicable rules | UCP LATEST VERSION |
| 31D | Date and place of expiry | 260905 INDIA |
| 50 | Applicant | MUSCAT BUILDERS LLC, MUSCAT, OMAN |
| 59 | Beneficiary | DECCAN STEEL MILLS LTD, MUMBAI, INDIA |
| 32B | Currency code, amount | USD 1,360,000.00 |
| 39A | Percentage credit amount tolerance | 05/05 |
| 41a | Available with … by … | ANY BANK BY NEGOTIATION |
| 42C | Drafts at | 90 DAYS AFTER B/L DATE |
| 42a | Drawee | TRAINING BANK, MUSCAT |
| 43P | Partial shipments | ALLOWED |
| 43T | Transhipment | NOT ALLOWED |
| 44E / 44F | Port of loading / discharge | ANY PORT IN INDIA / SOHAR, OMAN |
| 44C | Latest date of shipment | 260815 |
| 45A | Description of goods | 2,000 MT (+/-5 PCT) DEFORMED STEEL BARS B500B AS PER BS 4449, CFR SOHAR INCOTERMS 2020 |
| 46A | Documents required | 1. SIGNED COMMERCIAL INVOICE IN 3 ORIGINALS 2. BUNDLE LIST 3. FULL SET CLEAN ON BOARD B/L TO ORDER OF TRAINING BANK NOTIFY APPLICANT MARKED FREIGHT PREPAID 4. MILL TEST CERTIFICATES 5. INSPECTION CERTIFICATE ISSUED BY [NAMED INSPECTION COMPANY] 6. CERTIFICATE OF ORIGIN ISSUED BY A CHAMBER OF COMMERCE |
| 47A | Additional conditions | ALL DOCUMENTS MUST INDICATE THIS CREDIT NUMBER. INSURANCE COVERED BY APPLICANT. USANCE DRAFTS PAYABLE AT SIGHT; DISCOUNT CHARGES FOR APPLICANT’S ACCOUNT |
| 71D | Charges | ALL CHARGES OUTSIDE OMAN FOR BENEFICIARY’S ACCOUNT |
| 48 | Period for presentation | 21 DAYS AFTER DATE OF SHIPMENT BUT WITHIN VALIDITY |
| 49 | Confirmation instructions | WITHOUT |
| 78 | Instructions to paying/accepting/negotiating bank | DOCUMENTS TO BE SENT IN ONE LOT BY COURIER. REIMBURSEMENT AT MATURITY PER YOUR INSTRUCTIONS |
:::

## Documentary collection instructions

| Aspect | Description |
|---|---|
| Purpose | Seller’s instructions to its bank (remitting bank) for presenting documents to the buyer through a collecting bank under URC 522 |
| Users | Seller, remitting bank, collecting/presenting bank, buyer |
| Important fields | Drawer and drawee; collecting bank; amount; documents enclosed; terms of release (D/P or D/A, tenor); charges and interest (who pays; may they be waived?); protest instructions; case-of-need; what to do if unpaid/unaccepted (storage and insurance of goods); remittance instructions |
| Common mistakes | Ambiguous D/P vs D/A; goods consigned directly to the buyer (losing control); no instructions for non-payment |
| Consequences | Documents released without payment; goods stranded |

:::doc Collection instruction (training template)
**To:** [Remitting bank] · **Drawer:** Nile Ceramics (fictional) · **Drawee:** Gulf Tiles Trading (fictional), Kuwait · **Collecting bank:** [buyer’s bank] · **Amount:** USD 96,000.00 · **Our invoice:** NC-2026-311
**Documents enclosed:** sight draft (1), commercial invoice (3), packing list (2), full set B/L (3/3) to order and blank-endorsed, certificate of origin (1).
**Release documents against:** PAYMENT (D/P at sight). **Do not** release against acceptance.
**Charges:** your charges for our account; collecting bank charges for drawee’s account — **may not be waived**.
**Protest:** do not protest for non-payment; advise us by SWIFT within 3 banking days of non-payment with reasons.
**Case of need:** our agent in Kuwait [name] may assist but may not alter instructions.
**Proceeds:** remit to our account [IBAN] at [bank].
This collection is subject to URC 522.
:::

## Credit application (to a bank or supplier)

| Aspect | Description |
|---|---|
| Purpose | Provide information to obtain credit (bank facilities or supplier trade credit) |
| Users | Applicant; bank credit officers; supplier credit controllers |
| Important fields | Legal and ownership information; management; business description; financial statements and projections; existing facilities; requested amounts, purpose and tenor; security offered; references; consent to credit checks; signatures |
| Common mistakes | Incomplete financials; optimistic projections without basis; undisclosed existing debts or guarantees |
| Consequences | Delays; rejection; covenant traps; misrepresentation risk |

:::doc Trade credit application — supplier version (training template)
| Section | Information |
|---|---|
| Company details | Legal name, registration no., address, years in business, ownership (UBOs) |
| Bank references | Bank name, account manager, years of relationship |
| Trade references | Three suppliers with contact details, credit limits, payment experience |
| Financial information | Last two audited statements; current management accounts |
| Requested credit | Limit USD ____; terms ____ days; expected monthly purchases ____ |
| Security offered | Personal/corporate guarantee; SBLC; none |
| Declarations | Information accurate; consent to credit reference checks; acceptance of supplier’s terms of sale (including retention of title and late-payment interest) |
| Signatures | Authorised signatory, date |
:::

## Credit analysis memorandum

A full example appears in {{ch:Corporate Credit Analysis}}. Standard sections: summary of request and recommendation; borrower background; ownership and management; industry and business risk; financial analysis (historical and projected); cash flow and repayment capacity; facility structure; security and support; covenants; risks and mitigants; risk rating and pricing; conditions precedent and monitoring.

## Loan term sheet

| Aspect | Description |
|---|---|
| Purpose | Summarise proposed loan terms before documentation |
| Users | Borrower, bank(s), lawyers |
| Important fields | Borrower and guarantors; facility type, amount, purpose; availability and tenor; repayment; pricing (margin, fees); security; conditions precedent; representations; covenants; events of default; information undertakings; costs; governing law; whether binding |
| Common mistakes | Agreeing to vague definitions; missing headroom; overlooking fees and costs |
| Consequences | Expensive or restrictive documentation; early covenant breaches |

:::doc Indicative term sheet (training template)
**Indicative and non-binding; subject to credit approval and documentation**

| Term | Proposal |
|---|---|
| Borrower | Gulf Industrial Supplies (fictional) |
| Guarantors | Material subsidiaries (≥ 80% of group EBITDA and assets) |
| Facility | USD 10m term loan |
| Purpose | Construction of cold-storage warehouse and related equipment |
| Availability period | 12 months from signing |
| Tenor | 6 years from signing |
| Repayment | 12 equal semi-annual instalments starting 12 months after first drawdown; 20% balloon at maturity |
| Margin | 2.75% p.a. over 6-month reference rate |
| Fees | Arrangement 0.75% flat; commitment 0.80% p.a. on undrawn amounts during availability |
| Security | First-ranking mortgage over the warehouse; assignment of insurances; pledge of project account |
| Financial covenants | Net debt/EBITDA ≤ 3.0×; DSCR ≥ 1.25×; tested semi-annually |
| Conditions precedent | Corporate approvals; security perfected; construction contract; building permits; KYC; legal opinions |
| Events of default | Standard, including cross-default above USD 1m |
| Hedging | Borrower to hedge at least 50% of interest exposure |
| Governing law | [Specify] |
:::

## Commercial loan proposal

A borrower-prepared proposal requesting financing (often accompanying a credit application): executive summary; company overview; purpose of financing; financing requested (amount, type, tenor, proposed security); financial performance; projections and repayment capacity (DSCR, leverage); sensitivity; management; supporting documents. A good proposal anticipates the bank’s questions (see the Cs of credit) and shows how the loan will be repaid from operating cash flow.

## Investment memorandum

| Aspect | Description |
|---|---|
| Purpose | Recommend an investment to an investment committee |
| Users | Investment team, committee, board |
| Important fields | Recommendation; investment thesis; company and market; financials and projections; valuation and returns (IRR, MOIC) by scenario; deal structure and terms; risks and mitigants; due-diligence findings and open items; ESG considerations; exit routes; conditions |
| Common mistakes | Thesis without evidence; base case only; underestimating execution risk; ignoring exit |
| Consequences | Overpayment; misallocated capital |

:::doc Investment memorandum — outline (training template)
1. **Recommendation and key terms** (one page): invest USD __ for __%; expected IRR __% / MOIC __× (base); conditions.
2. **Investment thesis:** 3–5 reasons, each with evidence.
3. **Company overview:** history, products, customers, operations, management.
4. **Market and competition:** size and growth (bottom-up), structure, position.
5. **Financial analysis:** historical normalised results, quality of earnings, cash conversion, balance sheet.
6. **Business plan and projections:** drivers; base/upside/downside.
7. **Valuation:** methods, comparables, entry multiple; sensitivity.
8. **Returns:** IRR/MOIC by scenario and exit timing.
9. **Deal structure:** instrument, governance rights, protections, use of proceeds.
10. **Risks and mitigants:** commercial, operational, financial, legal, regulatory, ESG.
11. **Due diligence:** findings, open items, conditions precedent.
12. **Exit strategy:** buyers, IPO potential, put/drag rights.
13. **Appendices:** model, DD reports, management bios.

See Case 8 and the equity memo in {{ch:Investment Research, Due Diligence}} for applied examples.
:::

## Business valuation report

| Aspect | Description |
|---|---|
| Purpose | Document an opinion of value for a defined purpose and date (transactions, financial reporting, disputes, tax) |
| Users | Boards, investors, auditors, courts, tax authorities |
| Important fields | Scope and purpose; standard and premise of value (e.g., fair value, market value; going concern); valuation date; information relied on; business and industry analysis; methods (income, market, cost) and weighting; key assumptions; sensitivity; conclusion of value (range); limitations; valuer’s independence and qualifications |
| Common mistakes | Unclear purpose/standard of value; unsupported assumptions; no reconciliation between methods |
| Consequences | Disputes, audit challenges, poor decisions |

:::doc Valuation report — contents (training template)
1. Engagement: client, purpose, standard of value, valuation date, independence.
2. Executive summary: concluded value range and key drivers.
3. Information sources and limitations.
4. Economic and industry overview.
5. Company analysis: history, operations, management, financial performance, normalisation adjustments.
6. Valuation approaches: DCF (forecast, WACC, terminal value), trading comparables, precedent transactions; asset-based approach where relevant.
7. Reconciliation and conclusion: weighting, range, discounts/premiums (control, marketability).
8. Sensitivity analysis.
9. Appendices: calculations, comparables, assumptions.
Professional standards such as the International Valuation Standards (IVS) guide practice; requirements vary by purpose and jurisdiction.
:::

## Due diligence checklist

:::doc Due diligence checklist — acquisition of a private company (training template)
| Area | Key requests and questions | Status |
|---|---|---|
| Corporate and legal | Constitutional documents; cap table; UBOs; group structure; board minutes; licences and permits; material contracts (change-of-control clauses); litigation; regulatory correspondence | ☐ |
| Financial | Audited statements (3 years); management accounts; QoE analysis; revenue by customer/product; margins; working capital (normalised level); net debt and debt-like items; capex; budgets and forecasts | ☐ |
| Tax | Tax returns and assessments; open audits; transfer pricing; VAT/zakat/withholding compliance; tax losses | ☐ |
| Commercial | Market position; customer interviews; churn; pipeline; pricing; competitive threats | ☐ |
| Operational | Facilities; capacity and utilisation; supply chain and key suppliers; quality; IT systems; cybersecurity | ☐ |
| HR | Organisation chart; key employees and contracts; compensation and benefits; end-of-service liabilities; disputes; localisation compliance | ☐ |
| IP and technology | IP registrations and ownership; licences; software and data rights | ☐ |
| Environmental, health and safety | Permits; incidents; contamination; compliance | ☐ |
| Compliance | Anti-bribery, sanctions, AML, data protection, competition law | ☐ |
| Insurance | Policies, claims history, adequacy | ☐ |
| Financing | Loan agreements, covenants, security, guarantees | ☐ |
| Integration | Systems, culture, synergies, risks | ☐ |
:::

:::exercise Practice questions on banking, credit and investment documents
1. In the L/C application, why is “inspection certificate issued by [named company]” better than “inspection certificate issued by the beneficiary”?
2. In the collection instruction, why state that charges “may not be waived”?
3. Name five items in a term sheet that strongly affect a borrower’s flexibility.
:::

:::answer Answers to the practice questions on banking, credit and investment documents
1. An independent inspector verifies the goods; a beneficiary’s certificate is self-certification and gives the buyer little protection.
2. Under URC 522, if the drawee refuses to pay charges and the instruction allows waiver, the bank may release documents without collecting them; “may not be waived” ensures charges are collected (or documents are not released).
3. Financial covenants and definitions; negative pledge and permitted security; restrictions on dividends and acquisitions; mandatory prepayment provisions; events of default (cross-default thresholds, MAC clause); information undertakings; hedging requirements.
:::
