"""Sync the approved PPTX-rendered figure raster into the SRS DOCX."""
from pathlib import Path
import shutil
import zipfile

ROOT = Path(__file__).resolve().parents[1]
PNG = ROOT / "docs/deliverables/figures/08-图1-1-需求双镜像与追踪关系.png"
EXPORT = ROOT / "logs/reviews/G2-R04_figure_export/figure-1.png"
DOCX = ROOT / "docs/deliverables/08-软件需求规格说明书SRS.docx"
TMP = DOCX.with_suffix(".tmp.docx")
shutil.copyfile(EXPORT, PNG)
with zipfile.ZipFile(DOCX) as source, zipfile.ZipFile(TMP, "w", zipfile.ZIP_DEFLATED) as output:
    for item in source.infolist():
        output.writestr(item, PNG.read_bytes() if item.filename == "word/media/image5.png" else source.read(item.filename))
TMP.replace(DOCX)
