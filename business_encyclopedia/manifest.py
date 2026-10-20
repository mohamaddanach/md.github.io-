"""Volume and part structure for The Complete Business Knowledge Encyclopedia.

Each volume lists entries in reading order. An entry is either
  ("front", "file.md")                       unnumbered front/back matter
  ("part", "I", "English title", "Arabic title", ["file.md", ...])
Chapters (level-1 headings inside part files) are numbered globally across
all volumes in manifest order, so chapter numbers are stable references.
"""

BOOK_TITLE = "The Complete Business Knowledge Encyclopedia"
BOOK_TITLE_AR = "الموسوعة الشاملة للمعرفة في عالم الأعمال"
BOOK_SUBTITLE = ("Every Essential Business Concept, Term, Process, Document, "
                 "Financial Instrument, and Commercial Practice You Need to "
                 "Understand the Real Business World")
EDITION = "First edition — October 2026"

VOLUMES = [
    {
        "num": 1,
        "title": "Foundations and the Language of Business",
        "title_ar": "الأسس ولغة الأعمال",
        "scope": ["How to use the encyclopedia", "Translation and terminology system",
                  "Part I — The Language of Business (20 terminology domains)",
                  "Comparison tables for commonly confused concepts"],
        "entries": [
            ("front", "v01/00_front.md"),
            ("part", "I", "The Language of Business", "لغة الأعمال",
             ["v01/p01a_core.md", "v01/p01b_general_corporate.md",
              "v01/p01c_accounting_finance.md", "v01/p01d_banking_investment.md",
              "v01/p01e_econ_sales_ops.md", "v01/p01f_legal_risk.md",
              "v01/p01g_mgmt_tech_commod.md", "v01/p01h_confused.md"]),
        ],
    },
    {
        "num": 2,
        "title": "How Businesses Work — Accounting and Financial Statements",
        "title_ar": "كيف تعمل الشركات — المحاسبة والقوائم المالية",
        "scope": ["Part II — How Businesses Actually Work",
                  "Part III — Accounting and Financial Statements"],
        "entries": [
            ("part", "II", "How Businesses Actually Work", "كيف تعمل الشركات فعلياً",
             ["v02/p02a.md", "v02/p02b.md"]),
            ("part", "III", "Accounting and Financial Statements", "المحاسبة والقوائم المالية",
             ["v02/p03a.md", "v02/p03b.md", "v02/p03c.md"]),
        ],
    },
    {
        "num": 3,
        "title": "Corporate Finance, Economics and Business Mathematics",
        "title_ar": "تمويل الشركات والاقتصاد ورياضيات الأعمال",
        "scope": ["Part IV — Corporate Finance and Financial Management",
                  "Part V — Economics and the Macroeconomic Environment",
                  "Part XX — Business Mathematics and Commercial Calculations"],
        "entries": [
            ("part", "IV", "Corporate Finance and Financial Management", "تمويل الشركات والإدارة المالية",
             ["v03/p04a.md", "v03/p04b.md"]),
            ("part", "V", "Economics and the Macroeconomic Business Environment", "الاقتصاد وبيئة الأعمال الكلية",
             ["v03/p05.md"]),
            ("part", "XX", "Business Mathematics and Commercial Calculations", "رياضيات الأعمال والحسابات التجارية",
             ["v03/p20.md"]),
        ],
    },
    {
        "num": 4,
        "title": "Banking, International Trade and Treasury",
        "title_ar": "المصارف والتجارة الدولية والخزينة",
        "scope": ["Part VI — Banking and the Financial System",
                  "Part VII — International Trade and Trade Finance",
                  "Part XVIII — Financial Markets, FX and Treasury"],
        "entries": [
            ("part", "VI", "Banking and the Financial System", "المصارف والنظام المالي",
             ["v04/p06a.md", "v04/p06b.md"]),
            ("part", "VII", "International Trade and Trade Finance", "التجارة الدولية وتمويل التجارة",
             ["v04/p07a.md", "v04/p07b.md", "v04/p07c.md"]),
            ("part", "XVIII", "Financial Markets, FX and Treasury", "الأسواق المالية والصرف الأجنبي والخزينة",
             ["v04/p18.md"]),
        ],
    },
    {
        "num": 5,
        "title": "Commercial Operations — Sales, Supply Chain, Insurance and Risk",
        "title_ar": "العمليات التجارية — المبيعات وسلاسل الإمداد والتأمين والمخاطر",
        "scope": ["Part VIII — Sales, Marketing and Commercial Strategy",
                  "Part IX — Procurement, Logistics and Supply Chain",
                  "Part XV — Insurance and Risk Management"],
        "entries": [
            ("part", "VIII", "Sales, Marketing and Commercial Strategy", "المبيعات والتسويق والاستراتيجية التجارية",
             ["v05/p08a.md", "v05/p08b.md"]),
            ("part", "IX", "Procurement, Logistics and Supply Chain", "المشتريات والخدمات اللوجستية وسلاسل الإمداد",
             ["v05/p09a.md", "v05/p09b.md"]),
            ("part", "XV", "Insurance and Risk Management", "التأمين وإدارة المخاطر",
             ["v05/p15.md"]),
        ],
    },
    {
        "num": 6,
        "title": "Investment, Capital Markets, Commodities and Market Intelligence",
        "title_ar": "الاستثمار وأسواق رأس المال والسلع وقراءة الأسواق",
        "scope": ["Part X — Investment, Capital Markets and Asset Management",
                  "Part XI — Commodities, Energy and Physical Trading",
                  "Part XXI — How to Read Business News and Reports"],
        "entries": [
            ("part", "X", "Investment, Capital Markets and Asset Management", "الاستثمار وأسواق رأس المال وإدارة الأصول",
             ["v06/p10a.md", "v06/p10b.md"]),
            ("part", "XI", "Commodities, Energy and Physical Trading", "السلع والطاقة والتجارة الفعلية",
             ["v06/p11a.md", "v06/p11b.md"]),
            ("part", "XXI", "How to Read Business News and Reports", "كيف تقرأ الأخبار والتقارير الاقتصادية",
             ["v06/p21.md"]),
        ],
    },
    {
        "num": 7,
        "title": "Law, Entrepreneurship, Management and Technology",
        "title_ar": "القانون وريادة الأعمال والإدارة والتكنولوجيا",
        "scope": ["Part XII — Business Law, Contracts and Corporate Governance",
                  "Part XIII — Entrepreneurship, Startups and Business Models",
                  "Part XIV — Management, Leadership and Corporate Strategy",
                  "Part XVI — Technology, Data, AI and Digital Business"],
        "entries": [
            ("part", "XII", "Business Law, Contracts and Corporate Governance", "قانون الأعمال والعقود وحوكمة الشركات",
             ["v07/p12.md"]),
            ("part", "XIII", "Entrepreneurship, Startups and Business Models", "ريادة الأعمال والشركات الناشئة ونماذج الأعمال",
             ["v07/p13.md"]),
            ("part", "XIV", "Management, Leadership and Corporate Strategy", "الإدارة والقيادة واستراتيجية الشركات",
             ["v07/p14.md"]),
            ("part", "XVI", "Technology, Data, AI and Digital Business", "التكنولوجيا والبيانات والذكاء الاصطناعي والأعمال الرقمية",
             ["v07/p16a.md", "v07/p16b.md"]),
        ],
    },
    {
        "num": 8,
        "title": "Professional Practice — Communication, Deals and Advanced Thinking",
        "title_ar": "الممارسة المهنية — التواصل والصفقات والتفكير المتقدم",
        "scope": ["Part XVII — Business Communication and Professional Fluency",
                  "Part XIX — How Real Commercial Deals Are Structured (15 case studies)",
                  "Part XXII — Advanced Business Thinking"],
        "entries": [
            ("part", "XVII", "Business Communication and Professional Fluency", "التواصل في الأعمال والطلاقة المهنية",
             ["v08/p17a.md", "v08/p17b.md"]),
            ("part", "XIX", "How Real Commercial Deals Are Structured", "كيف تُهيكل الصفقات التجارية الحقيقية",
             ["v08/p19a.md", "v08/p19b.md", "v08/p19c.md"]),
            ("part", "XXII", "Advanced Business Thinking", "التفكير المتقدم في الأعمال",
             ["v08/p22.md"]),
        ],
    },
    {
        "num": 9,
        "title": "Document Library, Master Reference, Exercises and Learning Roadmap",
        "title_ar": "مكتبة الوثائق والمراجع الرئيسية والتمارين وخطة التعلّم",
        "scope": ["The Professional Business Document Library (annotated templates)",
                  "Part XXIII — Master Reference Materials",
                  "Exercise bank with full solutions (easy, intermediate, advanced)",
                  "Six-month learning roadmap and final assessment"],
        "entries": [
            ("part", "DL", "The Professional Business Document Library", "مكتبة وثائق الأعمال المهنية",
             ["v09/doc_a.md", "v09/doc_b.md", "v09/doc_c.md"]),
            ("part", "XXIII", "Master Reference Materials", "المواد المرجعية الرئيسية",
             ["v09/p23a.md", "v09/p23b.md"]),
            ("part", "EX", "Exercise Bank and Solutions", "بنك التمارين والحلول",
             ["v09/ex.md"]),
            ("part", "RM", "Learning Roadmap and Final Assessment", "خطة التعلّم والتقييم النهائي",
             ["v09/roadmap.md"]),
        ],
    },
]

# Volume 10 is generated entirely from the other volumes (master TOC,
# English–Arabic glossary, thematic glossary, unified index).
MASTER = {"num": 10, "title": "Master Table of Contents, Glossary and Unified Index",
          "title_ar": "الفهرس الرئيسي والمسرد والكشّاف الموحّد"}
