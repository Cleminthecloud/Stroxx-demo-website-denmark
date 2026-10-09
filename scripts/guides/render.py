#!/usr/bin/env python3
"""Render a STROXX guide JSON into a branded PDF (+ PNG page previews).

Usage (repo root): python3 scripts/guides/render.py docs/guides/xlock/<id>/guide.json --out docs/guides/output [--preview]\nNeeds: pip install jinja2 qrcode pypdf pillow playwright && playwright install chromium

The JSON's image paths are relative to the JSON file. Output: <id>.pdf with
title/subject/keywords metadata (keywords = item numbers so the file is findable
by SKU in a PIM or DAM), and optional <id>-p<N>.png previews.
"""
import argparse, json, os, re, shutil, subprocess, sys, tempfile
import markupsafe
from pathlib import Path

import jinja2, qrcode
from PIL import Image
from pypdf import PdfReader, PdfWriter
from playwright.sync_api import sync_playwright

ENGINE = Path(__file__).resolve().parent
REPO = ENGINE.parents[1]  # scripts/guides -> repo root
FONT_ZIP = REPO / "public/brand/fonts/HelveticaNeue.zip"
FONTS = {"HelveticaNeue-Light.otf", "HelveticaNeue-Roman.otf", "HelveticaNeueMedium.ttf", "HelveticaNeueBold.ttf"}


def stage_brand(work):
    """Fonts + logo come from the repo's brand folder, never duplicated here."""
    import zipfile
    (work / "fonts").mkdir(); (work / "brand").mkdir()
    with zipfile.ZipFile(FONT_ZIP) as z:
        for n in z.namelist():
            if Path(n).name in FONTS:
                (work / "fonts" / Path(n).name).write_bytes(z.read(n))
    for v in ("white", "black"):
        shutil.copy(REPO / f"public/brand/logos/stroxx-{v}.svg", work / f"brand/stroxx-{v}.svg")


CODE_RE = re.compile(r"(?<![&\w])([*#][0-9*#]{2,})")


def codes(text):
    """Escape, then set keypad codes like *39#123456#3# or #000 as <code>."""
    esc = str(markupsafe.escape(text))
    return markupsafe.Markup(CODE_RE.sub(r"<code>\1</code>", esc))

FOOTER = """
<div style="width:100%;font-family:Helvetica,Arial,sans-serif;font-size:6.5pt;color:#8A9199;
 padding:0 11mm;display:flex;justify-content:space-between;-webkit-print-color-adjust:exact;">
 <span>STROXX {line} &middot; {title}</span>
 <span>Side <span class="pageNumber"></span> af <span class="totalPages"></span></span>
</div>"""


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("json")
    ap.add_argument("--out", default=None)
    ap.add_argument("--preview", action="store_true")
    a = ap.parse_args()

    src = Path(a.json).resolve()
    g = json.loads(src.read_text(encoding="utf-8"))
    out = Path(a.out).resolve() if a.out else src.parent
    out.mkdir(parents=True, exist_ok=True)

    # Build in a temp dir: engine assets + the guide's images side by side.
    work = Path(tempfile.mkdtemp(prefix="guide-"))
    stage_brand(work)
    img_dir = work / "img"; img_dir.mkdir()
    for s in g["sections"]:
        for st in s["steps"]:
            for im in st.get("images", []):
                p = (src.parent / im["src"]).resolve()
                dst = img_dir / p.name
                shutil.copy(p, dst)
                im["src"] = f"img/{p.name}"
                with Image.open(p) as I: im["portrait"] = I.height > I.width * 1.3

    heroes = []
    for i, h in enumerate(g.get("hero", [])):
        p = (src.parent / h).resolve(); dst = img_dir / f"hero-{i}.png"
        with Image.open(p) as I:  # trim transparent padding so the product sits truly centred
            I = I.convert("RGBA"); bb = I.getchannel("A").getbbox()
            I = I.crop(bb) if bb else I
            # Optical centring: pad so the alpha-weighted centre of mass sits mid-image,
            # so a lock with a long lever reads centred, not its bounding box.
            import numpy as np
            alpha = np.asarray(I.getchannel("A"), dtype=float); w, hgt = I.size
            cols = alpha.sum(axis=0); tot = cols.sum() or 1
            cx = float((np.arange(w) * cols).sum() / tot)
            pad = int(round(2 * cx - w))  # >0: mass right of centre, pad right; <0: pad left
            canvas = Image.new("RGBA", (w + abs(pad), hgt), (0, 0, 0, 0))
            canvas.paste(I, (0 if pad > 0 else -pad, 0))
            canvas.save(dst)
        heroes.append(f"img/{dst.name}")
    g["hero"] = heroes

    qr_path = None
    if g.get("help", {}).get("url"):
        q = qrcode.QRCode(border=0, box_size=10, error_correction=qrcode.constants.ERROR_CORRECT_M)
        q.add_data("https://" + g["help"]["url"]); q.make(fit=True)
        q.make_image(fill_color="#0B0C0E", back_color="white").save(work / "qr.png")
        qr_path = "qr.png"

    env = jinja2.Environment(loader=jinja2.FileSystemLoader(str(ENGINE)), autoescape=True)
    env.filters["codes"] = codes
    html = env.get_template("template.html").render(g=g, qr=qr_path)
    (work / "index.html").write_text(html, encoding="utf-8")

    raw = work / "raw.pdf"
    line = g.get("product_line", ""); line = "" if line == "STROXX" else line
    footer = FOOTER.format(line=line, title=g["title"])
    with sync_playwright() as p:
        b = p.chromium.launch()
        pg = b.new_page()
        pg.goto((work / "index.html").as_uri())
        pg.wait_for_load_state("networkidle")
        pg.evaluate("document.fonts.ready")
        # Cover: page 1 only, no running footer.
        pg.pdf(path=str(work / "cover.pdf"), prefer_css_page_size=True, print_background=True, page_ranges="1")
        # Body: everything after the cover, with the running footer.
        pg.pdf(path=str(work / "body.pdf"), prefer_css_page_size=True, print_background=True, page_ranges="2-",
               display_header_footer=True, header_template="<span></span>", footer_template=footer)
        b.close()
    m = PdfWriter()
    for f in ("cover.pdf", "body.pdf"):
        for page in PdfReader(str(work / f)).pages: m.add_page(page)
    with open(raw, "wb") as fh: m.write(fh)

    # Metadata: findable by title and item numbers.
    r = PdfReader(str(raw)); w = PdfWriter()
    for page in r.pages: w.add_page(page)
    items = [x["item_no"] for x in g.get("applies_to", []) if x.get("item_no")]
    w.add_metadata({
        "/Title": f"{g['title']} | STROXX {g.get('product_line','')}",
        "/Subject": g.get("summary", ""),
        "/Keywords": ", ".join(["STROXX", g.get("product_line", ""), *items]),
        "/Author": "STROXX",
        "/Creator": "STROXX guide engine",
    })
    pdf = out / f"{g['id']}.pdf"
    with open(pdf, "wb") as f: w.write(f)
    print(f"PDF  {pdf}  ({len(r.pages)} pages)")

    if a.preview:
        subprocess.run(["pdftoppm", "-r", "70", "-png", str(pdf), str(out / f"{g['id']}-p")], check=True)
        print("previews written")
    shutil.rmtree(work, ignore_errors=True)


if __name__ == "__main__":
    sys.exit(main())
