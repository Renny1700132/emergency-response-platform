# G2-P03 MVP 核心流程原型：C 需求符合性复核

- 任务：G2-P03
- 主责 / 复核：B / A、C
- 被复核实现提交：`49eb37bd27857dfdc243dadc464d8aa7995ddfde`
- 当前复核基点：`a834f572cd36e2680ff72eb0562d67fe322537ad`
- 复核日期：2026-09-14
- 结论：`CHANGES_REQUIRED / NOT_ACCEPTED`

## 1. 复核依据与范围

- `tasks.md`：G2-P03 主责 B、复核 A/C、前置 G2-P02=`DONE`、当前状态 `REVIEW`。
- `prototype/README.md`：P1—P5 最小闭环、Mock 边界和原型完成定义。
- `control/g2/requirements_catalog.md`、SRS、`docs/work/B_TECH/spec.md`、RTM：39 条 FR、MVP/★属性及验收语义。
- `control/facts.md`、`control/key_numbers.md`、`control/issues.md`：事实、数字、责任和开放问题。
- 实现范围：`prototype/src`、`prototype/scripts/smoke.mjs`、依赖锁定文件及 B 自检记录。

Preflight Conflict Check：未发现 P0 与冻结需求之间的新语义冲突；本轮沿用前端 Mock 原型边界，不把界面演示、localStorage 状态或烟测结果写成真实接口、性能、安全、部署或现场验收证据。

## 2. 检查结果

| 检查项 | 结果 | 证据与判断 |
| --- | --- | --- |
| 前置与任务边界 | PASS | G2-P02 已 `DONE`；G2-P03 保持 `REVIEW`；未启动 G2-P04。 |
| Mock/责任边界 | PASS | 外部视频、定位、地图、门禁、消息和中台均为 Mock/占位，未发现真实联调或能力已验收表述。 |
| 可运行性 | PASS | 依锁文件安装 36 个包，审计 0 vulnerabilities；`npm run test:smoke` 通过；`npm run build` 通过，Vite 6.4.3 转换 47 个模块。首次运行因本地依赖未安装失败，完成 `npm ci` 后复验通过，未隐去该过程。 |
| P2 态势 Mock | PASS | 人员、物资、视频和事件时间线均以模拟/占位状态展示，未冒充定位精度、视频首帧或接口连通证据。 |
| P3 演练闭环 | PASS | 状态可从待执行推进至执行中、待评估和已完成，并形成模拟改进项。 |
| P5 盘点闭环 | PASS | H5 提交现场数量、自动计算差异，Web 复核后更新台账数量；非法数量和状态受控。 |
| P1 事件关闭闭环 | ISSUE / BLOCKING | `closeIncident` 仅校验关联任务完成，随后直接关闭并自动写入“已形成模拟评估与调查归档入口”；页面没有评估、调查、报告输入/确认，未完成强制项也不会阻止关闭。不满足 SRS G2-FR-016 及 AC 的最小可演示语义。对应 `ISSUE-G2-P03-001`。 |
| P4 打卡异常闭环 | ISSUE / BLOCKING | 原型只有有效扫码与超出范围拒绝记录；没有缺卡/超时检测、异常提醒、Mock 消息/重试或人工清单状态。不满足 G2-FR-020，也未闭合 README 的“统计 → 异常提醒”。对应 `ISSUE-G2-P03-002`。 |
| smoke 覆盖有效性 | ISSUE / FOLLOW-UP | 当前 smoke 直接断言任务完成后可关闭事件，并只覆盖有效/超范围打卡，因此会把两项缺失路径当作通过。B 修订实现时须同步加入“强制项未完成时关闭失败、完成后关闭成功”及“缺卡/超时产生 Mock 告警”的断言。此项纳入既有两个 Issue，不另立需求 Issue。 |
| 非 MVP 显式映射 | PASS_WITH_FOLLOW_UP | G2-FR-030、G2-FR-038 未在路由标签中显式出现；二者为非 MVP、本期范围，不阻断 G2-P03，但 G2-P04 应明确映射或记录原型不展示理由。 |

## 3. Issue 与修订责任

| Issue | 严重度 | 状态 | 主责 | C 关闭条件 |
| --- | --- | --- | --- | --- |
| ISSUE-G2-P03-001 | MAJOR / BLOCKING_TO_G2-P03_DONE | OPEN | B | 增加最小评估、调查、报告动作与数据状态；未完成时拒绝关闭，完成后才可关闭并形成可见 Mock 记录；同步 smoke。 |
| ISSUE-G2-P03-002 | MAJOR / BLOCKING_TO_G2-P03_DONE | OPEN | B | 可演示至少一种缺卡或超时，Web 可见异常提醒，并显示 Mock 通知、失败重试或人工处置状态；不宣称真实消息指标已验证；同步 smoke。 |

## 4. 准出结论

C 与 A 已登记的两项阻断判断一致。当前实现可构建，且已完成部分 MVP/辅助流程，但 P1 和 P4 的必需末端语义仍缺失，不能将 G2-P03 标为 `DONE`。G2-P03 保持 `REVIEW`，由 B 修订实现和 smoke 后提交 A、C 复验；G2-P04 不得启动。
