"""Build small QA contact sheets from already-rendered page PNGs."""
from pathlib import Path
from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[1]
for folder in sorted((ROOT / "logs/reviews").glob("render_G2-R04_*_final")):
    pages = sorted(folder.glob("page-*.png"), key=lambda p: int(p.stem.split("-")[-1]))
    for start in range(0, len(pages), 6):
        batch = pages[start:start + 6]
        thumbs = []
        for page in batch:
            image = Image.open(page).convert("RGB")
            image.thumbnail((340, 480))
            thumbs.append((page, image.copy()))
        sheet = Image.new("RGB", (1080, 1020), "white")
        draw = ImageDraw.Draw(sheet)
        for i, (page, image) in enumerate(thumbs):
            x, y = (i % 3) * 360 + 10, (i // 3) * 510 + 18
            sheet.paste(image, (x, y + 22))
            draw.text((x, y), page.stem, fill="black")
        sheet.save(folder / f"contact-{start + 1:02d}-{start + len(batch):02d}.png")
