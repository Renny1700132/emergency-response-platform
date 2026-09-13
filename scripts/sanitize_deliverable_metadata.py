"""Remove template-project residue from deliverable package metadata/header XML."""

from __future__ import annotations

import os
import tempfile
import zipfile
from pathlib import Path
from xml.etree import ElementTree as ET


ROOT = Path(__file__).resolve().parents[1]


NS = {
    "dc": "http://purl.org/dc/elements/1.1/",
    "cp": "http://schemas.openxmlformats.org/package/2006/metadata/core-properties",
}


def rewrite_package(
    path: Path,
    replacements: dict[str, list[tuple[str, str]]],
    core_values: dict[str, str] | None = None,
) -> None:
    fd, temp_name = tempfile.mkstemp(suffix=".docx", dir=path.parent)
    os.close(fd)
    temp_path = Path(temp_name)
    try:
        with zipfile.ZipFile(path, "r") as source, zipfile.ZipFile(
            temp_path, "w", zipfile.ZIP_DEFLATED
        ) as target:
            for item in source.infolist():
                data = source.read(item.filename)
                if item.filename == "docProps/core.xml" and core_values:
                    root = ET.fromstring(data)
                    for qualified_name, value in core_values.items():
                        prefix, local_name = qualified_name.split(":", 1)
                        element = root.find(f"{{{NS[prefix]}}}{local_name}")
                        if element is None:
                            element = ET.SubElement(root, f"{{{NS[prefix]}}}{local_name}")
                        element.text = value
                    data = ET.tostring(root, encoding="utf-8", xml_declaration=True)
                for old, new in replacements.get(item.filename, []):
                    data = data.replace(old.encode("utf-8"), new.encode("utf-8"))
                target.writestr(item, data)
        os.replace(temp_path, path)
    finally:
        if temp_path.exists():
            temp_path.unlink()


rewrite_package(
    ROOT / "docs/deliverables/00-投标文件技术标.docx",
    {
        "docProps/core.xml": [("成员A（项目经理/技术标总编）", "何思源（项目经理/技术标总编）")],
        "word/header1.xml": [
            ("澜图", "某自然博物馆智能运营中心建设项目"),
            ("遥感影像智能解译与地物提取平台建设项目投标文件（技术标", "应急管理子系统投标文件（技术标"),
            ("教学案例）", "）"),
        ],
    },
    {
        "dc:title": "某自然博物馆智能运营中心建设项目——应急管理子系统投标文件技术标",
        "dc:creator": "何思源",
        "cp:lastModifiedBy": "何思源",
        "dc:subject": "第一关技术投标书最终整合稿",
        "dc:description": "项目编号03；业务内容沿用已审核口径。",
    },
)

rewrite_package(
    ROOT / "docs/deliverables/03-项目计划v1（WBS与甘特图）.docx",
    {"docProps/core.xml": [("项目组成员 A", "何思源")]},
    {
        "dc:title": "某自然博物馆智能运营中心建设项目——应急管理子系统项目计划 v1",
        "dc:creator": "何思源",
        "cp:lastModifiedBy": "何思源",
        "dc:subject": "WBS、甘特图、里程碑与项目管理安排",
        "dc:description": "依据第一关冻结基线编制。",
    },
)

for filename, title, owner, subject in [
    ("01-项目建议书.docx", "某自然博物馆智能运营中心建设项目——应急管理子系统项目建议书", "何思源", "项目建议书"),
    ("02-澄清与质询记录.docx", "某自然博物馆智能运营中心建设项目——应急管理子系统澄清与质询记录", "任俊强", "需求澄清与质询闭环记录"),
    ("04-风险登记册v1.docx", "某自然博物馆智能运营中心建设项目——应急管理子系统风险登记册 v1", "何思源", "第一关风险识别、评估与应对记录"),
    ("05-需求确认书.docx", "某自然博物馆智能运营中心建设项目——应急管理子系统需求确认书", "任俊强", "需求范围与验收口径确认"),
    ("06-述标答辩讲稿与策略.docx", "某自然博物馆智能运营中心建设项目——应急管理子系统述标答辩讲稿与策略", "何思源", "述标讲稿、时间分配与答辩策略"),
]:
    rewrite_package(
        ROOT / "docs/deliverables" / filename,
        {},
        {
            "dc:title": title,
            "dc:creator": owner,
            "cp:lastModifiedBy": "何思源",
            "dc:subject": subject,
            "dc:description": "第一关正式交付文档；业务内容沿用已审核口径。",
        },
    )
