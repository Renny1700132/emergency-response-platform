"""Set the inherited-white node labels in the editable SRS figure to dark text."""
from pathlib import Path
import re
import shutil
import zipfile

ROOT = Path(__file__).resolve().parents[1]
PPTX = ROOT / "docs/deliverables/figures/08-图1-1-需求双镜像与追踪关系.pptx"
TMP = PPTX.with_suffix(".tmp.pptx")

with zipfile.ZipFile(PPTX) as source, zipfile.ZipFile(TMP, "w", zipfile.ZIP_DEFLATED) as output:
    for item in source.infolist():
        data = source.read(item.filename)
        if item.filename == "ppt/slides/slide1.xml":
            xml = data.decode("utf-8")
            # Only the node labels lack explicit colour. Existing grey note text
            # already has an explicit 636363 fill and remains untouched.
            xml = re.sub(
                r'(<a:rPr\b(?=[^>]*sz="1600")[^>]*)(>)',
                r'\1><a:solidFill><a:srgbClr val="333333"/></a:solidFill>',
                xml,
            )
            data = xml.encode("utf-8")
        output.writestr(item, data)
TMP.replace(PPTX)
