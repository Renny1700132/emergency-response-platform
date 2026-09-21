# G4 工程质量门禁

本目录是 `G4-01` 建立的可执行质量护栏，不是业务实现，也不修改 `BASELINE-G3-M3-R1.0`。冻结 OpenAPI 只读取校验，不由门禁脚本改写。

## 本地复跑

运行环境：Node.js `>=20.19.0`、npm `>=10`。

```bash
npm ci
npm run quality
```

`npm run quality` 顺序执行：核心门禁库单测及覆盖率（四项阈值均为 70%）、OpenAPI 校验、秘密与 npm 高危依赖扫描、自查结构校验。任一命令非零退出即阻断。

实际证据通过下列命令生成：

```bash
npm run evidence:pass
npm run evidence:block
```

前者必须四门全绿；后者使用明确标记的故障注入 fixture，只有自查门禁确实以非零状态阻断时才成功。证据输出到 `evidence/g4/G4-01/`，不得把故障注入结果写成生产缺陷或真实业务测试。

## 后续任务接入

- 后端、前端或适配服务建立后，应在 `package.json` 的 `quality` 链中追加其静态检查、测试、覆盖率和依赖审计；不得用当前护栏库覆盖率替代业务核心模块覆盖率。
- 每个 PR 从 `quality/selfcheck/template.json` 复制独立自查记录，填写 Task、FR/AC、设计 ID、AI 范围和真实证据；`N/A` 必须说明原因。
- `npm run quality` 是 G4 必需的本地质量门禁；不要求接入 Jenkins、Gitee Go 或其他远程 CI，也不得把本地结果表述为远程 CI。
- 高危安全问题、契约错误、覆盖率不足或 selfcheck 不完整均为合并阻断项。成员 B 的 Approve 是 G4-01 的唯一人工审核门禁，提交者 C 不得代签；审核通过后只通过 PR Merge 进入 `master`。
