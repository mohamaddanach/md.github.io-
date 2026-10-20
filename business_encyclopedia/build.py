#!/usr/bin/env python3
"""Build The Complete Business Knowledge Encyclopedia as PDF volumes.

Usage:
    python3 build.py              # build every volume and the master volume
    python3 build.py 1 3          # build volumes 1 and 3 only
    python3 build.py --html 2     # also keep the intermediate HTML

Source syntax (Markdown plus a few extensions, see README.md):
    :::kind Optional title        boxed block (def, formula, example, case, warn,
    ...                           tip, summary, exercise, answer, doc, ar, note,
    :::                           dialog, obj, framework, pro)
    :::term English | Arabic | ACR   term card with "key: value" fields
    [[Display]] / [[Display::Key]]   highlighted keyword added to the index
"""
import argparse
import html as H
import json
import re
import sys
import time
from pathlib import Path

import markdown
from weasyprint import HTML

import manifest as M

ROOT = Path(__file__).resolve().parent
SRC = ROOT / "src"
OUT = ROOT / "pdf"
BUILD = ROOT / "build"
CSS_PATH = ROOT / "style.css"

AR_CH = "؀-ۿݐ-ݿࢠ-ࣿﭐ-﷿ﹰ-﻿"
AR_RUN = re.compile(rf"[{AR_CH}]+(?:[  ]+[{AR_CH}]+)*")
MD_EXT = ["tables", "fenced_code", "attr_list", "sane_lists", "def_list"]

BOX_LABELS = {
    "def": "Definition", "formula": "Formula", "example": "Worked Example",
    "case": "Case Study", "warn": "Common Mistakes", "tip": "Professional Insight",
    "summary": "Summary", "exercise": "Practice", "answer": "Answer",
    "doc": "Training Simulation — Fictional Document", "ar": "بالعربية",
    "note": "Note", "dialog": "Dialogue", "obj": "Learning Objectives",
    "framework": "Standard / Framework", "pro": "Professional Application",
    "review": "Review Questions",
}
TERM_FIELDS = [
    ("def", "Definition"), ("ar", "بالعربية"), ("why", "Why it matters"),
    ("use", "In practice"), ("ex", "Example"), ("say", "Professional usage"),
    ("rel", "Related terms"), ("vs", "Don't confuse"),
]


def slug(s):
    s = re.sub(r"<[^>]+>", "", s)
    s = re.sub(r"[^A-Za-z0-9]+", "-", s).strip("-").lower()
    return s or "x"


def strip_tags(s):
    return H.unescape(re.sub(r"<[^>]+>", "", s))


class Ctx:
    """Collects index entries and glossary terms while rendering a volume."""

    def __init__(self, vol):
        self.vol = vol
        self.n = 0
        self.index = {}          # key -> list of (anchor, kind)
        self.terms = []          # glossary records
        self.category = ""       # current h2 title, used for thematic glossary

    def anchor(self, prefix):
        self.n += 1
        return f"v{self.vol}-{prefix}{self.n}"

    def add_index(self, key, anchor, kind="kw"):
        key = re.sub(r"\s+", " ", strip_tags(key)).strip()
        if key:
            self.index.setdefault(key, []).append((anchor, kind))


def inline_md(text, ctx):
    h = md_to_html(text, ctx)
    h = h.strip()
    if h.startswith("<p>") and h.endswith("</p>") and h.count("<p>") == 1:
        h = h[3:-4]
    return h


def render_term(arg, body, ctx):
    parts = [p.strip() for p in arg.split("|")]
    en = parts[0]
    ar = parts[1] if len(parts) > 1 else ""
    acr = parts[2] if len(parts) > 2 else ""
    fields, cur = {}, None
    for line in body.split("\n"):
        m = re.match(r"^(\w+):\s?(.*)$", line)
        if m and m.group(1) in dict(TERM_FIELDS):
            cur = m.group(1)
            fields[cur] = m.group(2)
        elif cur:
            fields[cur] += "\n" + line
    aid = ctx.anchor("t")
    ctx.add_index(en, aid, "term")
    if acr and acr.lower() != en.lower():
        ctx.add_index(f"{acr} ({en})", aid, "term")
    short = re.split(r"(?<=[.;])\s", strip_tags(inline_md(fields.get("def", ""), ctx)))[0]
    ctx.terms.append({"en": en, "ar": ar, "acr": acr, "def": short,
                      "cat": ctx.category, "anchor": aid, "kind": "card"})
    rows = []
    for key, label in TERM_FIELDS:
        if key in fields and fields[key].strip():
            val = inline_md(fields[key].strip(), ctx)
            if key == "ar":
                rows.append(f'<tr class="tf-ar"><th>{label}</th><td dir="rtl">{val}</td></tr>')
            else:
                rows.append(f'<tr class="tf-{key}"><th>{label}</th><td>{val}</td></tr>')
    acr_html = f' <span class="term-acr">({H.escape(acr)})</span>' if acr else ""
    return (f'<div class="term" id="{aid}"><div class="term-head">'
            f'<span class="term-en">{H.escape(en)}</span>{acr_html}'
            f'<span class="term-ar" dir="rtl">{H.escape(ar)}</span></div>'
            f'<table class="term-body">{"".join(rows)}</table></div>')


CALC_FIELDS = [
    ("f", "Formula"), ("en", "Plain English"), ("ar", "بالعربية"), ("simple", "Simple example"),
    ("biz", "Business example"), ("sol", "Worked solution"), ("err", "Common mistakes"),
]


def keep_lines(text):
    """Honour single line breaks (and wide gaps) except in tables, lists and code."""
    text = re.sub(r"(?<=\S) {3,}(?=\S)", "  \n", text)
    lines, out, in_code = text.split("\n"), [], False
    for i, line in enumerate(lines):
        if line.lstrip().startswith("```"):
            in_code = not in_code
        nxt = lines[i + 1] if i + 1 < len(lines) else ""
        plain = (not in_code and line.strip() and nxt.strip()
                 and not line.lstrip().startswith("|") and not nxt.lstrip().startswith(("|", "- ", "* ", "+ ", "```"))
                 and not re.match(r"^\s*\d+\.\s", nxt))
        out.append(line + "  " if plain and not line.endswith("  ") else line)
    return "\n".join(out)


def render_calc(arg, body, ctx):
    fields, cur = {}, None
    for line in body.split("\n"):
        m = re.match(r"^(\w+):\s?(.*)$", line)
        if m and m.group(1) in dict(CALC_FIELDS):
            cur = m.group(1)
            fields[cur] = m.group(2)
        elif cur:
            fields[cur] += "\n" + line
    aid = ctx.anchor("c")
    ctx.add_index(arg, aid, "term")
    rows = []
    for key, label in CALC_FIELDS:
        if fields.get(key, "").strip():
            raw = fields[key].strip()
            val = inline_md(keep_lines(raw) if key == "f" else raw, ctx)
            attr = ' dir="rtl"' if key == "ar" else ""
            rows.append(f'<tr class="cf-{key}"><th>{label}</th><td{attr}>{val}</td></tr>')
    return (f'<div class="calc" id="{aid}"><div class="calc-head">{H.escape(arg)}</div>'
            f'<table class="calc-body">{"".join(rows)}</table></div>')


def render_box(kind, arg, body, ctx):
    if kind == "term":
        return render_term(arg, body, ctx)
    if kind == "calc":
        return render_calc(arg, body, ctx)
    label = BOX_LABELS.get(kind, kind.title())
    title = inline_md(arg, ctx) if arg else ""
    inner = md_to_html(keep_lines(body) if kind in ("formula", "dialog", "ar", "doc") else body, ctx)
    if kind == "ar":
        head = f'<div class="box-label">{label}{(" — " + title) if title else ""}</div>'
        return f'<div class="box box-ar" dir="rtl">{head}{inner}</div>'
    if kind == "doc":
        head = (f'<div class="doc-banner">TRAINING SIMULATION · FICTIONAL DOCUMENT · '
                f'NOT A VALID INSTRUMENT</div><div class="doc-title">{title}</div>')
        return f'<div class="box box-doc">{head}<div class="doc-body">{inner}</div></div>'
    t = f'<span class="box-title">{title}</span>' if title else ""
    return (f'<div class="box box-{kind}"><div class="box-label">{label}'
            f'{" · " if title else ""}{t}</div>{inner}</div>')


def inline_syntax(text, ctx):
    def kw(m):
        disp, key = m.group(1), m.group(2) or m.group(1)
        aid = ctx.anchor("k")
        ctx.add_index(key, aid)
        return f'<strong class="kw" id="{aid}">{disp}</strong>'
    return re.sub(r"\[\[([^\]:]+?)(?:::([^\]]+?))?\]\]", kw, text)


def index_tables(h, ctx):
    """Quick-reference tables (first header "English") feed the index and glossary."""
    def table(m):
        t = m.group(0)
        head = re.search(r"<th[^>]*>(.*?)</th>", t, re.S)
        if not head or strip_tags(head.group(1)).strip() != "English":
            return t

        def row(r):
            cells = re.findall(r"<td[^>]*>(.*?)</td>", r.group(0), re.S)
            if len(cells) < 2:
                return r.group(0)
            en = strip_tags(cells[0]).strip()
            aid = ctx.anchor("q")
            ctx.add_index(en, aid, "qr")
            ctx.terms.append({"en": en, "ar": strip_tags(cells[1]).strip(),
                              "acr": "", "def": strip_tags(cells[2]).strip() if len(cells) > 2 else "",
                              "cat": ctx.category, "anchor": aid, "kind": "qr"})
            return r.group(0).replace("<td", f'<td id="{aid}"', 1)
        return re.sub(r"<tr>(?:(?!</tr>).)*?<td.*?</tr>", row, t, flags=re.S)
    return re.sub(r"<table>.*?</table>", table, h, flags=re.S)


def chapter_map():
    """Global chapter numbers from the raw sources, for {{ch:Title fragment}} references."""
    titles, n = [], 0
    for vol in M.VOLUMES:
        for entry in vol["entries"]:
            if entry[0] != "part":
                continue
            for f in entry[4]:
                p = SRC / f
                if p.exists():
                    for line in p.read_text(encoding="utf-8").split("\n"):
                        if line.startswith("# "):
                            n += 1
                            titles.append((n, line[2:].strip(), vol["num"]))
    return titles


CHAPTERS = []


def resolve_refs(text, vol_num):
    def ref(m):
        frag = m.group(1).strip().lower()
        hits = [t for t in CHAPTERS if frag in t[1].lower()]
        if len(hits) != 1:
            print(f"  ! chapter reference '{m.group(1)}' matched {len(hits)} chapters")
            return f"Chapter ?? ({m.group(1)})"
        n, title, v = hits[0]
        where = "" if v == vol_num else f" (Volume {v})"
        return f'<a href="#ch{n}">Chapter {n}</a>{where}' if v == vol_num else f"Chapter {n}{where}"
    return re.sub(r"\{\{ch:([^}]+)\}\}", ref, text)


def md_to_html(text, ctx):
    text = resolve_refs(text, ctx.vol)
    lines = text.split("\n")
    out, blocks, i = [], [], 0
    while i < len(lines):
        m = re.match(r"^:::([\w-]+)\s*(.*)$", lines[i])
        if m:
            j, body = i + 1, []
            while j < len(lines) and lines[j].strip() != ":::":
                body.append(lines[j])
                j += 1
            # keep the category of term cards in sync with the h2 being read
            blocks.append(render_box(m.group(1), m.group(2).strip(), "\n".join(body), ctx))
            out += ["", f"BLOCKX{len(blocks) - 1}X", ""]
            i = j + 1
            continue
        h2 = re.match(r"^##\s+(.*)$", lines[i])
        if h2:
            ctx.category = re.sub(r"\{.*\}$", "", h2.group(1)).strip()
        out.append(lines[i])
        i += 1
    fixed, in_code = [], False
    for line in out:
        if line.lstrip().startswith("```"):
            in_code = not in_code
        # Python-Markdown needs a blank line before a list that follows a paragraph
        if (not in_code and re.match(r"^([-*+]|\d+\.)\s", line) and fixed and fixed[-1].strip()
                and not re.match(r"^\s*([-*+]|\d+\.)\s", fixed[-1]) and not fixed[-1].startswith(("|", "    "))):
            fixed.append("")
        fixed.append(line)
    h = markdown.markdown(inline_syntax("\n".join(fixed), ctx), extensions=MD_EXT)
    h = index_tables(h, ctx)
    return re.sub(r"<p>BLOCKX(\d+)X</p>", lambda m: blocks[int(m.group(1))], h)


# ---------------------------------------------------------------- volumes

def parse_volume(vol, chap_start):
    """Return (body_html, toc, ctx, next_chapter_number)."""
    ctx = Ctx(vol["num"])
    toc, pieces = [], []
    chap = chap_start
    for entry in vol["entries"]:
        if entry[0] == "front":
            p = SRC / entry[1]
            if not p.exists():
                print(f"  ! missing {entry[1]}")
                continue
            h = md_to_html(p.read_text(encoding="utf-8"), ctx)

            def front_h(m):
                lvl, txt = m.group(1), m.group(2)
                aid = f"v{vol['num']}-f-{slug(txt)}"
                if lvl == "1":
                    toc.append({"kind": "front", "title": strip_tags(txt), "anchor": aid})
                    return f'<h1 class="front" id="{aid}">{txt}</h1>'
                return f'<h{lvl} id="{aid}">{txt}</h{lvl}>'
            pieces.append(re.sub(r"<h([12])>(.*?)</h\1>", front_h, h))
            continue
        _, pnum, ptitle, ptitle_ar, files = entry
        text = ""
        for f in files:
            p = SRC / f
            if p.exists():
                text += "\n\n" + p.read_text(encoding="utf-8")
            else:
                print(f"  ! missing {f}")
        m = re.search(r"^# ", text, re.M)
        intro, rest = (text[:m.start()], text[m.start():]) if m else (text, "")
        intro_html = md_to_html(intro, ctx)
        body = md_to_html(rest, ctx)
        pid = f"v{vol['num']}-part-{pnum}"
        part_toc = {"kind": "part", "num": pnum, "title": ptitle, "title_ar": ptitle_ar,
                    "anchor": pid, "chapters": []}
        toc.append(part_toc)
        state = {"chap": chap, "sec": 0}

        def head(m):
            lvl, txt = m.group(1), m.group(2)
            if lvl == "1":
                state["chap"] += 1
                state["sec"] = 0
                n = state["chap"]
                aid = f"ch{n}"
                part_toc["chapters"].append({"num": n, "title": strip_tags(txt),
                                             "anchor": aid, "sections": []})
                return (f'<h1 class="chapter" id="{aid}"><span class="chnum">Chapter {n}</span>'
                        f'<span class="chtitle">{txt}</span></h1>')
            state["sec"] += 1
            n, s = state["chap"], state["sec"]
            aid = f"s{n}-{s}"
            if part_toc["chapters"]:
                part_toc["chapters"][-1]["sections"].append(
                    {"num": f"{n}.{s}", "title": strip_tags(txt), "anchor": aid})
            return f'<h2 id="{aid}"><span class="secnum">{n}.{s}</span> {txt}</h2>'
        body = re.sub(r"<h([12])>(.*?)</h\1>", head, body)
        chap = state["chap"]
        chlist = "".join(
            f'<li><a href="#{c["anchor"]}"><span class="pc-num">Chapter {c["num"]}</span> '
            f'{H.escape(c["title"])}</a></li>' for c in part_toc["chapters"])
        label = {"DL": "Library", "EX": "Exercises", "RM": "Roadmap"}.get(pnum, f"Part {pnum}")
        pieces.append(
            f'<section class="part-open" id="{pid}"><div class="part-num">{label}</div>'
            f'<div class="part-title">{H.escape(ptitle)}</div>'
            f'<div class="part-ar" dir="rtl">{H.escape(ptitle_ar)}</div>'
            f'<div class="part-intro">{intro_html}</div>'
            f'<div class="part-chapters"><h4>Chapters in this part</h4><ul>{chlist}</ul></div>'
            f'</section>{body}')
    return "\n".join(pieces), toc, ctx, chap


def toc_html(toc, vol_num):
    rows = []
    for t in toc:
        if t["kind"] == "front":
            rows.append(f'<li class="toc-front"><a href="#{t["anchor"]}">{H.escape(t["title"])}</a></li>')
            continue
        label = {"DL": "", "EX": "", "RM": ""}.get(t["num"], f'Part {t["num"]} — ')
        rows.append(f'<li class="toc-part"><a href="#{t["anchor"]}">{label}{H.escape(t["title"])}'
                    f' <span class="toc-ar" dir="rtl">{H.escape(t["title_ar"])}</span></a></li>')
        for c in t["chapters"]:
            rows.append(f'<li class="toc-ch"><a href="#{c["anchor"]}"><span class="toc-n">{c["num"]}</span>'
                        f'{H.escape(c["title"])}</a></li>')
            for s in c["sections"]:
                rows.append(f'<li class="toc-sec"><a href="#{s["anchor"]}"><span class="toc-n">{s["num"]}</span>'
                            f'{H.escape(s["title"])}</a></li>')
    return (f'<section class="toc" id="v{vol_num}-toc"><h1 class="toc-title">Contents</h1>'
            f'<ul class="toc-list">{"".join(rows)}</ul></section>')


def sort_key(k):
    return re.sub(r"[^a-z0-9 ]", "", k.lower()).strip() or k.lower()


def index_html(index, pages, title="Index", vol_prefix=""):
    """index: key -> [(anchor, kind)], pages: anchor -> page number."""
    groups = {}
    for key in sorted(index, key=sort_key):
        refs, seen = [], set()
        for anchor, kind in index[key]:
            pg = pages.get(anchor)
            if pg is None or pg in seen:
                continue
            seen.add(pg)
            cls = ' class="ix-main"' if kind == "term" else ""
            refs.append(f'<a href="#{anchor}"{cls}>{vol_prefix}{pg}</a>')
        if not refs:
            continue
        letter = sort_key(key)[:1].upper()
        letter = letter if letter.isalpha() else "#"
        groups.setdefault(letter, []).append(
            f'<li><span class="ix-key">{H.escape(key)}</span> {", ".join(refs)}</li>')
    body = "".join(f'<h3 class="ix-letter">{L}</h3><ul class="ix">{"".join(v)}</ul>'
                   for L, v in groups.items())
    return (f'<section class="index"><h1 class="front">{title}</h1>'
            f'<p class="ix-note">Bold page numbers mark the main term-card definition.</p>'
            f'<div class="ix-cols">{body}</div></section>')


def cover_html(vol):
    scope = "".join(f"<li>{H.escape(s)}</li>" for s in vol["scope"])
    vmap = "".join(
        f'<tr{" class=cur" if v["num"] == vol["num"] else ""}><td>Vol. {v["num"]}</td>'
        f'<td>{H.escape(v["title"])}</td></tr>'
        for v in M.VOLUMES + [M.MASTER])
    return f'''
<section class="cover">
  <div class="cover-top">{H.escape(M.BOOK_TITLE.upper())}</div>
  <div class="cover-ar" dir="rtl">{M.BOOK_TITLE_AR}</div>
  <div class="cover-vol">Volume {vol["num"]}</div>
  <div class="cover-title">{H.escape(vol["title"])}</div>
  <div class="cover-title-ar" dir="rtl">{H.escape(vol["title_ar"])}</div>
  <div class="cover-sub">{H.escape(M.BOOK_SUBTITLE)}</div>
  <div class="cover-scope"><div class="cs-h">In this volume</div><ul>{scope}</ul></div>
  <div class="cover-foot">A practical reference for finance and computer-science graduates entering the business world · {M.EDITION}</div>
</section>
<section class="notice">
  <h2>About this volume</h2>
  <p>This volume is part of a ten-volume reference collection. Chapter numbers run
  continuously across the collection, so a reference such as “§47.3” identifies the same
  section in every volume, in the master index (Volume 10), and in the learning roadmap.</p>
  <table class="vmap"><thead><tr><th>Volume</th><th>Title</th></tr></thead><tbody>{vmap}</tbody></table>
  <h2>Important notices</h2>
  <ul>
  <li><strong>Educational purpose.</strong> The content explains general business, financial,
  legal and commercial concepts. It is not legal, tax, accounting, investment or regulatory advice
  for any specific situation.</li>
  <li><strong>Fictional companies and transactions.</strong> All companies, people, banks, documents,
  deals and figures used in examples, case studies and document templates are fictional training
  simulations unless an institution, standard or law is explicitly identified as real. Simulated
  transactions are never real completed transactions.</li>
  <li><strong>Document templates.</strong> Sample documents (letters of credit, bills of lading,
  contracts, certificates, term sheets, etc.) are teaching templates. They are not valid instruments
  and must not be presented as documents issued by any bank, carrier, government or other institution.</li>
  <li><strong>Standards and rules change.</strong> References to IFRS, US GAAP, Incoterms® 2020,
  UCP 600, URC 522, URDG 758, Basel standards and other frameworks reflect the author’s understanding
  as of October 2026. Always verify current versions with the official issuer before relying on them.
  Laws differ by jurisdiction; consult a qualified local professional for actual transactions.</li>
  <li><strong>Market figures.</strong> Prices, rates, margins and costs in examples are illustrative
  assumptions chosen to teach the mechanics, not market data or forecasts.</li>
  </ul>
  <p class="trademark">Incoterms® is a registered trademark of the International Chamber of Commerce.
  This work is not affiliated with or endorsed by the ICC, the IFRS Foundation, FASB, SWIFT, the Basel
  Committee or any other organisation mentioned.</p>
</section>'''


def page_shell(title, body, header_left):
    css = CSS_PATH.read_text(encoding="utf-8").replace("__HEADER_LEFT__", header_left.replace('"', "'"))
    return (f'<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><title>{H.escape(title)}</title>'
            f'<meta name="author" content="Business Knowledge Encyclopedia Project">'
            f'<style>{css}</style></head><body>{body}</body></html>')


def fix_direction(h):
    """Mark blocks whose first letter is Arabic as RTL; wrap inline Arabic runs."""
    def mark(m):
        tag, attrs = m.group(1), m.group(2) or ""
        if "dir=" in attrs:
            return m.group(0)
        after = strip_tags(h[m.end():m.end() + 600])
        for ch in after:
            if ch.isalpha():
                if re.match(rf"[{AR_CH}]", ch):
                    return f'<{tag}{attrs} dir="rtl">'
                break
        return m.group(0)
    h = re.sub(r"<(p|li|td|th|h[1-6]|dt|dd|blockquote)(\s[^>]*)?>", mark, h)
    parts = re.split(r"(<[^>]+>)", h)
    for i, part in enumerate(parts):
        if part and not part.startswith("<"):
            parts[i] = AR_RUN.sub(lambda m: f'<span class="ar">{m.group(0)}</span>', part)
    return "".join(parts)


def anchor_pages(doc):
    pages = {}
    for i, page in enumerate(doc.pages):
        for a in page.anchors:
            pages.setdefault(a, i + 1)
    return pages


def render(title, header_left, body_without_index, make_index, out_pdf, keep_html=False):
    t = time.time()
    html1 = page_shell(title, fix_direction(body_without_index), header_left)
    doc = HTML(string=html1, base_url=str(ROOT)).render()
    pages = anchor_pages(doc)
    extra = make_index(pages)
    if extra:
        html2 = page_shell(title, fix_direction(body_without_index + extra), header_left)
        doc = HTML(string=html2, base_url=str(ROOT)).render()
    else:
        html2 = html1
    doc.metadata.title = title
    doc.metadata.authors = ["Business Knowledge Encyclopedia Project"]
    doc.write_pdf(out_pdf)
    if keep_html:
        (BUILD / (out_pdf.stem + ".html")).write_text(html2, encoding="utf-8")
    print(f"  -> {out_pdf.name}: {len(doc.pages)} pages ({time.time() - t:.0f}s)")
    return pages, len(doc.pages)


def build_volume(vol, parsed, keep_html):
    body, toc, ctx, _ = parsed
    title = f'{M.BOOK_TITLE} — Volume {vol["num"]}: {vol["title"]}'
    full = cover_html(vol) + toc_html(toc, vol["num"]) + body
    out = OUT / f'Volume_{vol["num"]:02d}_{slug(vol["title"]).title().replace("-", "_")}.pdf'
    pages, npages = render(title, f'Vol. {vol["num"]} · {vol["title"]}', full,
                           lambda pg: index_html(ctx.index, pg, f'Index to Volume {vol["num"]}'),
                           out, keep_html)

    def with_pages(t):
        t = dict(t)
        t["page"] = pages.get(t["anchor"])
        if "chapters" in t:
            t["chapters"] = [dict(c, page=pages.get(c["anchor"]),
                                  sections=[dict(s, page=pages.get(s["anchor"])) for s in c["sections"]])
                             for c in t["chapters"]]
        return t
    data = {
        "num": vol["num"], "title": vol["title"], "title_ar": vol["title_ar"],
        "file": out.name, "pages": npages,
        "toc": [with_pages(t) for t in toc],
        "terms": [dict(t, page=pages.get(t["anchor"])) for t in ctx.terms],
        "index": {k: sorted({pages[a] for a, _ in v if a in pages}) for k, v in ctx.index.items()},
        "main": {k: sorted({pages[a] for a, kd in v if a in pages and kd == "term"})
                 for k, v in ctx.index.items()},
    }
    (BUILD / f'vol{vol["num"]:02d}.json').write_text(json.dumps(data, ensure_ascii=False, indent=1),
                                                     encoding="utf-8")


def build_master(keep_html):
    vols = []
    for v in M.VOLUMES:
        p = BUILD / f'vol{v["num"]:02d}.json'
        if p.exists():
            vols.append(json.loads(p.read_text(encoding="utf-8")))
        else:
            print(f"  ! volume {v['num']} not built yet; master volume will omit it")
    mv = dict(M.MASTER, scope=["Master table of contents for all volumes",
                               "Comprehensive English–Arabic glossary (alphabetical)",
                               "Thematic glossary by business domain",
                               "Unified index: every concept with volume and page",
                               "Concept location guide by chapter"])
    parts = [cover_html(mv)]
    # ---- master TOC
    rows = []
    for v in vols:
        rows.append(f'<li class="toc-part mt-vol">Volume {v["num"]} — {H.escape(v["title"])} '
                    f'<span class="toc-ar" dir="rtl">{H.escape(v["title_ar"])}</span>'
                    f'<span class="mt-file">{v["file"]} · {v["pages"]} pages</span></li>')
        for t in v["toc"]:
            if t["kind"] == "front":
                continue
            label = "" if t["num"] in ("DL", "EX", "RM") else f'Part {t["num"]} — '
            rows.append(f'<li class="toc-ch mt-part">{label}{H.escape(t["title"])}'
                        f'<span class="mt-pg">V{v["num"]} p.{t["page"]}</span></li>')
            for c in t["chapters"]:
                rows.append(f'<li class="toc-sec"><span class="toc-n">{c["num"]}</span>{H.escape(c["title"])}'
                            f'<span class="mt-pg">V{v["num"]} p.{c["page"]}</span></li>')
    parts.append(f'<section class="toc mtoc"><h1 class="front" id="m-toc">Master Table of Contents</h1>'
                 f'<p>Chapter numbers are continuous across the collection. “V4 p.112” means Volume 4, '
                 f'PDF page 112.</p><ul class="toc-list">{"".join(rows)}</ul></section>')
    # ---- glossary (alphabetical)
    best = {}
    for v in vols:
        for t in v["terms"]:
            t = dict(t, vol=v["num"])
            k = t["en"].lower()
            if k not in best or (best[k].get("kind") != "card" and t.get("kind") == "card"):
                best[k] = t
    terms = sorted(best.values(), key=lambda t: sort_key(t["en"]))
    ncards = sum(1 for t in terms if t.get("kind") == "card")
    grow, last = [], ""
    for t in terms:
        L = sort_key(t["en"])[:1].upper()
        if L != last:
            grow.append(f'<tr class="g-letter"><td colspan="4">{L}</td></tr>')
            last = L
        acr = f' ({H.escape(t["acr"])})' if t["acr"] else ""
        mark = "■ " if t.get("kind") == "card" else ""
        grow.append(f'<tr><td class="g-en">{mark}<strong>{H.escape(t["en"])}</strong>{acr}</td>'
                    f'<td class="g-ar" dir="rtl">{H.escape(t["ar"])}</td>'
                    f'<td class="g-def">{H.escape(t["def"])}</td>'
                    f'<td class="g-loc">V{t["vol"]} p.{t["page"]}</td></tr>')
    parts.append(f'<section class="gloss"><h1 class="front" id="m-gloss">English–Arabic Business Glossary</h1>'
                 f'<p>{len(terms)} terms, sorted alphabetically. {ncards} of them have a full term card '
                 f'(definition, Arabic explanation, usage, example, related terms and distinctions), marked ■; '
                 f'the others are defined in quick-reference tables. The location points to the entry.</p>'
                 f'<table class="gtable"><thead><tr><th>English term</th><th>Arabic</th><th>Short definition</th>'
                 f'<th>Card</th></tr></thead><tbody>{"".join(grow)}</tbody></table></section>')
    # ---- thematic glossary
    cats = {}
    for t in terms:
        cats.setdefault((t["vol"], t["cat"]), []).append(t)
    trows = []
    for (vn, cat), ts in sorted(cats.items(), key=lambda kv: (kv[0][0], kv[1][0]["page"] or 0)):
        items = " · ".join(f'{H.escape(t["en"])} <span class="ar">{H.escape(t["ar"])}</span>' for t in ts)
        trows.append(f'<h3>{H.escape(cat)} <span class="mt-pg">V{vn}</span></h3><p class="th-list">{items}</p>')
    parts.append(f'<section class="thematic"><h1 class="front" id="m-them">Thematic Glossary</h1>'
                 f'<p>The same terms grouped by business domain, in the order they are taught.</p>'
                 f'{"".join(trows)}</section>')
    # ---- unified index
    uni = {}
    for v in vols:
        for k, pgs in v["index"].items():
            main = set(v["main"].get(k, []))
            for p in pgs:
                uni.setdefault(k, []).append((v["num"], p, p in main))
    groups = {}
    for k in sorted(uni, key=sort_key):
        refs = ", ".join((f'<b>{vn}:{p}</b>' if mn else f'{vn}:{p}') for vn, p, mn in sorted(set(uni[k])))
        L = sort_key(k)[:1].upper()
        L = L if L.isalpha() else "#"
        groups.setdefault(L, []).append(f'<li><span class="ix-key">{H.escape(k)}</span> {refs}</li>')
    body = "".join(f'<h3 class="ix-letter">{L}</h3><ul class="ix">{"".join(v)}</ul>' for L, v in groups.items())
    parts.append(f'<section class="index"><h1 class="front" id="m-index">Unified Index</h1>'
                 f'<p class="ix-note">References are “volume:page”. Bold marks the main term-card definition.</p>'
                 f'<div class="ix-cols">{body}</div></section>')
    # ---- concept location guide
    loc = []
    for v in vols:
        for t in v["toc"]:
            if t["kind"] == "front":
                continue
            for c in t["chapters"]:
                secs = "; ".join(f'{s["num"]} {H.escape(s["title"])}' for s in c["sections"])
                loc.append(f'<tr><td>{c["num"]}</td><td><strong>{H.escape(c["title"])}</strong><br>'
                           f'<span class="loc-secs">{secs}</span></td><td>V{v["num"]} p.{c["page"]}</td></tr>')
    parts.append(f'<section class="locg"><h1 class="front" id="m-loc">Concept Location Guide</h1>'
                 f'<p>Every chapter with the concepts (sections) it explains.</p>'
                 f'<table class="loctable"><thead><tr><th>Ch.</th><th>Chapter and sections</th><th>Where</th></tr>'
                 f'</thead><tbody>{"".join(loc)}</tbody></table></section>')
    out = OUT / "Volume_10_Master_Index_And_Glossary.pdf"
    render(f'{M.BOOK_TITLE} — Volume 10: {M.MASTER["title"]}', "Vol. 10 · Master Index and Glossary",
           "".join(parts), lambda pg: "", out, keep_html)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("volumes", nargs="*", type=int)
    ap.add_argument("--html", action="store_true")
    a = ap.parse_args()
    OUT.mkdir(exist_ok=True)
    BUILD.mkdir(exist_ok=True)
    want = set(a.volumes) or {v["num"] for v in M.VOLUMES} | {10}
    CHAPTERS.extend(chapter_map())
    chap = 0
    for vol in M.VOLUMES:
        print(f"Volume {vol['num']}: {vol['title']}")
        parsed = parse_volume(vol, chap)
        chap = parsed[3]
        if vol["num"] in want:
            build_volume(vol, parsed, a.html)
    if 10 in want:
        print("Volume 10: master index and glossary")
        build_master(a.html)


if __name__ == "__main__":
    sys.exit(main())
