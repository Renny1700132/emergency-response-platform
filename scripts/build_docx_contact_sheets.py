from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

root = Path(__file__).resolve().parents[1] / ".tmp" / "final_rework"
src_root = root / "final_png"
out_root = root / "contact_sheets"
out_root.mkdir(parents=True, exist_ok=True)

thumb_w, thumb_h = 540, 764
label_h, pad = 28, 18
for doc_dir in sorted(p for p in src_root.iterdir() if p.is_dir()):
    pages = sorted(doc_dir.glob("*.png"))
    for start in range(0, len(pages), 6):
        batch = pages[start:start + 6]
        canvas = Image.new("RGB", (pad + 3 * (thumb_w + pad), pad + 2 * (thumb_h + label_h + pad)), "#b9bec5")
        draw = ImageDraw.Draw(canvas)
        for idx, page in enumerate(batch):
            with Image.open(page) as im:
                im = im.convert("RGB")
                im.thumbnail((thumb_w, thumb_h), Image.Resampling.LANCZOS)
                x = pad + (idx % 3) * (thumb_w + pad)
                y = pad + (idx // 3) * (thumb_h + label_h + pad)
                canvas.paste(im, (x + (thumb_w - im.width) // 2, y))
                draw.text((x, y + thumb_h + 4), f"{doc_dir.name} / {page.stem}", fill="black")
        out = out_root / f"{doc_dir.name}-{start + 1:03d}-{start + len(batch):03d}.jpg"
        canvas.save(out, quality=88, optimize=True)
        print(out.relative_to(root.parent.parent))
