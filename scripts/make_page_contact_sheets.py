"""Build six-page QA contact sheets from rendered page PNGs."""

from __future__ import annotations

import argparse
from pathlib import Path
from PIL import Image, ImageDraw


parser = argparse.ArgumentParser()
parser.add_argument("source", type=Path)
parser.add_argument("output", type=Path)
parser.add_argument("--prefix", default="pages")
args = parser.parse_args()
args.output.mkdir(parents=True, exist_ok=True)
pages = sorted(args.source.glob("*.png"))
thumb_w, thumb_h, label_h, pad = 520, 735, 25, 14
for start in range(0, len(pages), 6):
    batch = pages[start:start + 6]
    canvas = Image.new("RGB", (pad + 3 * (thumb_w + pad), pad + 2 * (thumb_h + label_h + pad)), "#b9bec5")
    draw = ImageDraw.Draw(canvas)
    for offset, page in enumerate(batch):
        with Image.open(page) as image:
            image = image.convert("RGB")
            image.thumbnail((thumb_w, thumb_h), Image.Resampling.LANCZOS)
            x = pad + (offset % 3) * (thumb_w + pad)
            y = pad + (offset // 3) * (thumb_h + label_h + pad)
            canvas.paste(image, (x + (thumb_w - image.width) // 2, y))
            draw.text((x, y + thumb_h + 3), page.stem, fill="black")
    target = args.output / f"{args.prefix}-{start + 1:03d}-{start + len(batch):03d}.jpg"
    canvas.save(target, quality=91, optimize=True)
    print(target)
