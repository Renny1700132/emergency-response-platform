from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
TASKS = ROOT / "tasks.md"
AUDIT = ROOT / "logs/reviews/2026-09-20_tasks-status-normalization.md"
ALLOWED = ("TODO", "DOING", "REVIEW", "DONE", "BLOCKED")


def main() -> None:
    lines = TASKS.read_text(encoding="utf-8").splitlines()
    changed = []
    output = []
    for line in lines:
        if not line.startswith("|") or line.startswith("| ---"):
            output.append(line)
            continue
        cells = [c.strip() for c in line.strip().strip("|").split("|")]
        if len(cells) != 8 or cells[0] == "Task ID":
            output.append(line)
            continue
        old = cells[-1]
        code = next((candidate for candidate in ALLOWED if old.startswith(candidate)), None)
        if code is None:
            raise RuntimeError(f"Unknown task status for {cells[0]}: {old}")
        if old != code:
            changed.append((cells[0], old, code))
            cells[-1] = code
            output.append("| " + " | ".join(cells) + " |")
        else:
            output.append(line)
    TASKS.write_text("\n".join(output) + "\n", encoding="utf-8")
    report = [
        "# tasks.md 状态列规范化迁移记录",
        "",
        "- 日期：2026-09-20",
        "- 执行任务：G3-13",
        "- 规则：状态列仅保留 `TODO / DOING / REVIEW / DONE / BLOCKED`；原状态单元格的事实说明逐项原文保存在本记录，Git 历史继续保留。",
        "- 边界：本次仅规范显示，不改变任何任务的实际阶段，不改变 Issue 状态、Review 结论、冻结 FR/AC/★或关键数字。",
        "",
        "| Task ID | 规范化后状态 | 原状态单元格原文 |",
        "|---|---|---|",
    ]
    for task_id, old, code in changed:
        report.append(f"| {task_id} | {code} | {old.replace('|', '&#124;')} |")
    report.extend(["", f"- 迁移条目数：{len(changed)}。", "- 校验：全部任务状态单元格均属于允许集合。"])
    AUDIT.write_text("\n".join(report) + "\n", encoding="utf-8")


if __name__ == "__main__":
    main()
