#!/usr/bin/env python3
"""Build the Carl Ras handover pack: markdown in, .docx + .pdf out.

    python3 scripts/build-handover-docs.py                    # rebuild the whole pack
    python3 scripts/build-handover-docs.py "Editor Guide"     # just the ones that match
    python3 scripts/build-handover-docs.py --check            # report problems, build nothing

Every document in "Client Handover - Carl Ras" is a .md plus a .docx plus a
.pdf of the same name. The .md is the source (usually a copy of a file in
/docs); this script regenerates the other two from it.

WHY THIS EXISTS. The pack used to be built by hand with pandoc against
whichever .docx was lying around as a reference, and that produced three faults
in the client-facing documents:

1. TABLES CAME OUT AS FLAT LISTS. Pandoc writes `<w:tblGrid />` with
   `tblW = 0` for a pipe table, meaning "auto fit". Word obliges. Other
   renderers, including the LibreOffice used to make the PDFs, do not: they
   drop the columns and print one cell per line, so every comparison table in
   the pack read as a meaningless vertical list of words. Fixed here by
   computing real column widths from the content and writing a fixed grid.

2. THE PDFs WENT THROUGH LIBREOFFICE, which mangles pandoc's tables even when
   the grid is correct. PDFs are now produced by pandoc with xelatex, which
   renders tables properly and gives us the house look directly.

3. EVERY DOCUMENT CLAIMED TO BE THE EDITOR GUIDE. The reference's header said
   "STROXX / Editor guide - v1.8", so 29 of the 35 documents in the pack
   carried that header, including the security review and the domain takeover
   plan. Each document now gets its own title.

Requires pandoc and xelatex. Fonts: Liberation Sans, which is metrically
identical to Arial and substitutes for it cleanly.
"""

# Annotations are evaluated lazily so `list[int] | None` parses on the stock
# python3 that ships with macOS, which is older than 3.10. Without this the
# script dies at import time with a TypeError about the | operator.
from __future__ import annotations

import re
import shutil
import subprocess
import sys
import zipfile
from pathlib import Path
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parent.parent
PACK = ROOT / "Client Handover - Carl Ras"
HOUSE_REFERENCE = PACK / "01 - IT" / "CMS and integrations" / "STROXX PIM-DAM Integration.docx"
W = "http://schemas.openxmlformats.org/wordprocessingml/2006/main"

# A4 (11906 twips) less the 1 inch margins the house reference uses.
TEXT_WIDTH_TWIPS = 9026

BLUE = "0088C2"
GREY = "6B7280"
RULE = "D8DCE2"

# BasicTeX is a deliberately minimal TeX Live, and pandoc reaches for a style
# file whenever a document uses a feature that needs one. These are the ones
# this pack has actually hit, plus the usual pandoc companions, so that a fresh
# machine can be set up in a single tlmgr command instead of one round trip per
# missing file.
TEX_PACKAGES = [
    "sectsty", "fancyhdr", "etoolbox",       # the house look
    "soul", "ulem",                          # strikethrough and underline
    "xurl", "bookmark", "footnotehyper",     # links, outline, footnotes
    "upquote", "parskip", "microtype",       # pandoc's usual companions
    "selnolig", "titling",
]

# The house face is Arial. macOS has it; Linux almost never does, but ships
# Liberation Sans, which is metrically identical, so the two produce the same
# page. Rather than hardcode either and fail on the other machine, the first
# candidate that xelatex can actually load wins. Order matters: closest match
# to the house style first.
SANS_CANDIDATES = ["Arial", "Liberation Sans", "Helvetica Neue", "Helvetica",
                   "DejaVu Sans", "TeX Gyre Heros"]
MONO_CANDIDATES = ["Menlo", "Liberation Mono", "DejaVu Sans Mono",
                   "Courier New", "TeX Gyre Cursor"]

LATEX_PREAMBLE = r"""
\providecommand{\StroxxDocTitle}{}
\usepackage{fontspec}
\setmainfont{@SANS@}
\setmonofont{@MONO@}[Scale=0.88]
\usepackage{xcolor}
\definecolor{stroxxblue}{HTML}{@BLUE@}
\definecolor{stroxxgrey}{HTML}{@GREY@}
\definecolor{stroxxrule}{HTML}{@RULE@}
\usepackage{sectsty}
\allsectionsfont{\color{stroxxblue}\sffamily}
\usepackage{fancyhdr}
\pagestyle{fancy}
\fancyhf{}
\fancyhead[L]{\footnotesize\color{stroxxgrey}\textbf{STROXX}}
\fancyhead[R]{\footnotesize\color{stroxxgrey}\StroxxDocTitle}
\fancyfoot[C]{\footnotesize\color{stroxxgrey}Page \thepage}
\renewcommand{\headrulewidth}{0.4pt}
\renewcommand{\footrulewidth}{0pt}
\usepackage{etoolbox}
\patchcmd{\headrule}{\hrulefill}{\color{stroxxrule}\hrulefill}{}{}
\usepackage{array}
\renewcommand{\arraystretch}{1.25}
\setlength{\tabcolsep}{5pt}
% Tables in this pack are reference material, often wide. Setting them a step
% down from body text is what stops a comparison table from colliding with
% itself on A4 portrait. (etoolbox is loaded above, for the header rule.)
\AtBeginEnvironment{longtable}{\footnotesize}
\raggedbottom
""".replace("@BLUE@", BLUE).replace("@GREY@", GREY).replace("@RULE@", RULE)


_FONTS: dict = {}


def font_available(name: str) -> bool:
    """Ask xelatex, not the operating system.

    Every other way of listing fonts (fc-list, system_profiler) answers a
    different question from "can the typesetter load this", and it is the
    typesetter's answer that decides whether the build succeeds.
    """
    tex = Path("/tmp/stroxx-fontprobe.tex")
    tex.write_text(
        "\\documentclass{article}\\usepackage{fontspec}\\setmainfont{%s}\n"
        "\\begin{document}x\\end{document}\n" % name,
        encoding="utf8",
    )
    r = subprocess.run(
        ["xelatex", "-interaction=nonstopmode", "-halt-on-error",
         "-output-directory=/tmp", str(tex)],
        capture_output=True,
    )
    return r.returncode == 0


def pick_fonts() -> tuple:
    """Choose the best installed sans and mono face, once per run."""
    if _FONTS:
        return _FONTS["sans"], _FONTS["mono"]
    sans = next((f for f in SANS_CANDIDATES if font_available(f)), None)
    mono = next((f for f in MONO_CANDIDATES if font_available(f)), None)
    if not sans:
        sys.exit(
            "No usable sans font found. Tried: " + ", ".join(SANS_CANDIDATES) +
            "\nInstall one (on Linux: the fonts-liberation package) and try again."
        )
    _FONTS["sans"], _FONTS["mono"] = sans, mono or sans
    if sans != SANS_CANDIDATES[0]:
        print(f"font: using {sans} (Arial not installed; metrically equivalent)")
    return _FONTS["sans"], _FONTS["mono"]


def require_tools(need_pdf: bool = True) -> None:
    """Fail with an instruction, not a traceback, when a tool is missing."""
    missing = []
    if not shutil.which("pandoc"):
        missing.append(("pandoc", "brew install pandoc"))
    if need_pdf and not shutil.which("xelatex"):
        missing.append(("xelatex", "brew install --cask basictex"))
    if missing:
        print("Missing tools:\n", file=sys.stderr)
        for tool, how in missing:
            print(f"  {tool:<10} {how}", file=sys.stderr)
        print(
            "\nAfter installing BasicTeX, open a new terminal so /Library/TeX/texbin is on\n"
            "PATH, then add the style files pandoc needs (BasicTeX ships a minimal set):\n\n"
            "  sudo tlmgr update --self\n"
            "  sudo tlmgr install " + " ".join(TEX_PACKAGES) + "\n",
            file=sys.stderr,
        )
        sys.exit(1)


def q(tag: str) -> str:
    return f"{{{W}}}{tag}"


def latex_escape(s: str) -> str:
    for a, b in (("\\", r"\textbackslash{}"), ("&", r"\&"), ("%", r"\%"), ("$", r"\$"),
                 ("#", r"\#"), ("_", r"\_"), ("{", r"\{"), ("}", r"\}")):
        s = s.replace(a, b)
    return s


# ------------------------------------------------------------- reference doc

def build_reference(out: Path) -> Path:
    """House reference plus the `Table` styles pandoc needs.

    The house reference has the right fonts, the blue headings and the
    page-number footer, so it is worth keeping. It simply never had a `Table`
    style, because whatever it was derived from contained no tables.
    """
    default = subprocess.run(["pandoc", "--print-default-data-file", "reference.docx"],
                             capture_output=True, check=True).stdout
    tmp = out.with_name("pandoc-default-reference.docx")
    tmp.write_bytes(default)
    with zipfile.ZipFile(tmp) as zd:
        ds = zd.read("word/styles.xml").decode("utf8")
    tmp.unlink()

    blocks = ""
    for sid in ("Table", "TableCaption"):
        m = re.search(r'<w:style [^>]*w:styleId="%s".*?</w:style>' % sid, ds, re.S)
        if m:
            blocks += m.group(0)

    with zipfile.ZipFile(HOUSE_REFERENCE) as zs:
        ss = zs.read("word/styles.xml").decode("utf8")
        if 'w:styleId="Table"' not in ss:
            ss = ss.replace("</w:styles>", blocks + "</w:styles>")
        with zipfile.ZipFile(out, "w", zipfile.ZIP_DEFLATED) as zo:
            for n in zs.namelist():
                zo.writestr(n, ss.encode("utf8") if n == "word/styles.xml" else zs.read(n))
    return out


# -------------------------------------------------------------- docx surgery
#
# Everything below edits document.xml as TEXT, on purpose. Round-tripping it
# through ElementTree rewrites namespace prefixes and reorders nothing but
# still produces a file Word renders differently, so the rule here is: parse
# with ET to work out what to do, then change only the exact bytes that need
# changing.

def _split(block: str, tag: str):
    """Yield (start, end) spans of non-nested <w:tag>...</w:tag> in block."""
    open_t, close_t = f"<w:{tag}>", f"</w:{tag}>"
    i = 0
    while True:
        a = block.find(open_t, i)
        if a < 0:
            return
        b = block.find(close_t, a)
        if b < 0:
            return
        b += len(close_t)
        yield a, b
        i = b


def column_widths(block: str) -> list[int] | None:
    """Widths proportional to the text each column carries, with a floor.

    A column of one-word labels should not claim the same room as a column of
    prose, but no column may be squeezed to nothing either.
    """
    root = ET.fromstring('<w:root xmlns:w="%s">%s</w:root>' % (W, block))
    tbl = root[0]
    rows = tbl.findall(q("tr"))
    if not rows:
        return None
    cols = max(len(r.findall(q("tc"))) for r in rows)
    if cols == 0:
        return None

    weights = []
    for i in range(cols):
        n = 0
        for r in rows:
            cells = r.findall(q("tc"))
            if i < len(cells):
                n += sum(len(t.text or "") for t in cells[i].iter(q("t")))
        weights.append(max(n, 1))

    avg = sum(weights) / cols
    weights = [min(max(x, avg * 0.45), avg * 2.2) for x in weights]
    scale = TEXT_WIDTH_TWIPS / sum(weights)
    widths = [int(x * scale) for x in weights]
    widths[-1] += TEXT_WIDTH_TWIPS - sum(widths)
    return widths


def fix_table(block: str) -> str:
    widths = column_widths(block)
    if not widths:
        return block

    grid = "<w:tblGrid>" + "".join('<w:gridCol w:w="%d"/>' % w for w in widths) + "</w:tblGrid>"
    block = re.sub(r"<w:tblGrid\s*/>", grid, block)
    block = re.sub(r'<w:tblW[^>]*/>', '<w:tblW w:w="%d" w:type="dxa"/>' % TEXT_WIDTH_TWIPS, block)
    # tblLayout must precede tblLook: the schema fixes the order of tblPr's
    # children, and Word discards the whole block if they are out of sequence.
    if "<w:tblLayout" not in block:
        block = block.replace("<w:tblLook", '<w:tblLayout w:type="fixed"/><w:tblLook', 1)

    # A fixed layout is only honoured when the cells state their width too.
    out, cursor = [], 0
    for rs, re_ in _split(block, "tr"):
        out.append(block[cursor:rs])
        row = block[rs:re_]
        cells, ccur, idx = [], 0, 0
        for cs, ce in _split(row, "tc"):
            cells.append(row[ccur:cs])
            cell = row[cs:ce]
            wdt = widths[min(idx, len(widths) - 1)]
            tcw = '<w:tcW w:w="%d" w:type="dxa"/>' % wdt
            if "<w:tcW" not in cell:
                if "<w:tcPr>" in cell:
                    cell = cell.replace("<w:tcPr>", "<w:tcPr>" + tcw, 1)
                else:
                    cell = cell.replace("<w:tc>", "<w:tc><w:tcPr>" + tcw + "</w:tcPr>", 1)
            cells.append(cell)
            ccur, idx = ce, idx + 1
        cells.append(row[ccur:])
        out.append("".join(cells))
        cursor = re_
    out.append(block[cursor:])
    return "".join(out)


def set_header_title(xml: bytes, title: str) -> bytes:
    """Rewrite only the right-hand header run, keeping its leading tab.

    The house header is one paragraph: a bold "STROXX" run, then a run whose
    text begins with a literal tab and is right-aligned by a tab stop. Replace
    the text of that second run and nothing else.
    """
    s = xml.decode("utf8")
    runs = list(re.finditer(r"(<w:t[^>]*>)(.*?)(</w:t>)", s, re.S))
    if len(runs) < 2:
        return xml
    last = runs[-1]
    lead = "\t" if last.group(2).startswith("\t") else ""
    safe = lead + title.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
    return (s[:last.start()] + last.group(1) + safe + last.group(3) + s[last.end():]).encode("utf8")


def build_docx(md: Path, reference: Path, title: str) -> int:
    docx = md.with_suffix(".docx")
    subprocess.run(["pandoc", str(md), "-o", str(docx), f"--reference-doc={reference}"], check=True)

    with zipfile.ZipFile(docx) as z:
        parts = {n: z.read(n) for n in z.namelist()}

    s = parts["word/document.xml"].decode("utf8")
    tables, out, cursor = 0, [], 0
    for a, b in _split(s, "tbl"):
        out.append(s[cursor:a])
        out.append(fix_table(s[a:b]))
        tables += 1
        cursor = b
    out.append(s[cursor:])
    s = "".join(out)
    ET.fromstring(s)  # refuse to ship a document.xml that no longer parses
    parts["word/document.xml"] = s.encode("utf8")

    for name in list(parts):
        if re.fullmatch(r"word/header\d+\.xml", name):
            parts[name] = set_header_title(parts[name], title)

    with zipfile.ZipFile(docx, "w", zipfile.ZIP_DEFLATED) as z:
        for name, data in parts.items():
            z.writestr(name, data)
    return tables


def build_pdf(md: Path, title: str) -> None:
    # /tmp, not next to the document: the pack often lives on a mount that will
    # not let us delete a file we just created, and a stray .tex in a client
    # folder is worse than a slightly longer path here.
    preamble = Path("/tmp/stroxx-preamble.tex")
    sans, mono = pick_fonts()
    preamble.write_text(
        LATEX_PREAMBLE.replace("@SANS@", sans).replace("@MONO@", mono)
        + "\n\\renewcommand{\\StroxxDocTitle}{%s}\n" % latex_escape(title),
        encoding="utf8",
    )
    try:
        subprocess.run(
            ["pandoc", str(md), "-o", str(md.with_suffix(".pdf")),
             "--pdf-engine=xelatex",
             "-V", "geometry:a4paper", "-V", "geometry:margin=2.4cm",
             "-V", "colorlinks=true", "-V", "linkcolor=stroxxblue", "-V", "urlcolor=stroxxblue",
             "-H", str(preamble)],
            check=True, capture_output=True, text=True,
        )
    except subprocess.CalledProcessError as e:
        blob = (e.stdout or "") + (e.stderr or "")
        # BasicTeX is a deliberately small TeX Live. Pandoc reaches for a style
        # file the moment a document uses a feature that needs one (soul for
        # strikethrough, ulem for underline, and so on), and the raw LaTeX error
        # for that is unreadable. Say what is missing and how to get it.
        missing = re.findall(r"File `([\w.-]+)\.sty' not found", blob)
        if missing:
            pkgs = " ".join(sorted(set(missing)))
            print(f"\n  Missing LaTeX package(s) for {md.stem}: {pkgs}", file=sys.stderr)
            print(f"  Install with:  sudo tlmgr install {pkgs}\n", file=sys.stderr)
        else:
            print(blob[-800:], file=sys.stderr)
        raise
    finally:
        preamble.unlink(missing_ok=True)


# ------------------------------------------------------------------ reporting

def check() -> int:
    """Report which documents in the pack are stale or carry the wrong header."""
    problems = 0
    for md in sorted(PACK.rglob("*.md")):
        if md.parent.name == "_to_delete":
            continue
        for ext in (".docx", ".pdf"):
            sib = md.with_suffix(ext)
            if not sib.exists():
                print(f"MISSING {ext}: {md.relative_to(PACK)}")
                problems += 1
            elif sib.stat().st_mtime < md.stat().st_mtime:
                print(f"STALE {ext}:   {md.relative_to(PACK)}")
                problems += 1
        docx = md.with_suffix(".docx")
        if docx.exists():
            with zipfile.ZipFile(docx) as z:
                hdr = "".join(
                    re.sub(r"<[^>]+>", " ", z.read(n).decode("utf8", "ignore"))
                    for n in z.namelist()
                    if re.fullmatch(r"word/header\d+\.xml", n)
                )
            if md.stem not in hdr:
                print(f"WRONG HEADER: {md.relative_to(PACK)}")
                problems += 1
    print(f"\n{problems} problem(s)")
    return problems


def main() -> None:
    args = [a for a in sys.argv[1:]]
    if "--check" in args:
        sys.exit(1 if check() else 0)
    only = args[0] if args else None

    require_tools()
    if not HOUSE_REFERENCE.exists():
        sys.exit(f"house reference not found: {HOUSE_REFERENCE}")

    reference = Path("/tmp/stroxx-handover-reference.docx")
    build_reference(reference)

    targets = [m for m in sorted(PACK.rglob("*.md")) if m.parent.name != "_to_delete"]
    if only:
        targets = [t for t in targets if only.lower() in t.stem.lower()]
    if not targets:
        sys.exit("nothing matched")

    # One bad document should not cost you the other thirty-four: report it and
    # keep going, then fail at the end so a broken build is still a red run.
    failed = []
    for md in targets:
        title = md.stem
        try:
            n = build_docx(md, reference, title)
            build_pdf(md, title)
            print(f"{md.relative_to(PACK)}  ({n} table{'' if n == 1 else 's'})")
        except Exception as e:  # noqa: BLE001 - the reason is printed, not swallowed
            failed.append(md)
            print(f"FAILED  {md.relative_to(PACK)}: {type(e).__name__}", file=sys.stderr)

    print(f"\n{len(targets) - len(failed)} of {len(targets)} document(s) rebuilt")
    if failed:
        print("\nFailed:", file=sys.stderr)
        for md in failed:
            print(f"  {md.relative_to(PACK)}", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
