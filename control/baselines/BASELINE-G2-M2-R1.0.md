# BASELINE-G2-M2-R1.0｜M2返工复审重新冻结候选

- Task：G2-R06
- 主责：A
- 复核：B（技术）、C（符合性）
- 状态：REFREEZE_CANDIDATE / PENDING_B_C_REVIEW
- 创建日期：2026-09-16
- 上游：BASELINE-V1.0、G2-R02—G2-R05
- 变更记录：CHG-G2-R06-001
- A侧候选提交：`9fc07e0a2c013ce5733f59c3ed527cb5e8568fe4`

## 1 冻结候选对象

本候选基线冻结第二关需求与规格层面的业务语义、编号、验收规则、追踪关系、关键数字和责任边界。它不证明系统已经实现，也不证明外部接口、性能、安全、部署或现场验收已经通过。

| 对象 | 候选冻结口径 |
| --- | --- |
| 功能范围 | G2-FR-001—039；29条MVP Must + 10条非MVP、本期 |
| ★属性 | 34条（MVP 28、非MVP 6） |
| 验收镜像 | 117条唯一AC；39/39 FR各3条 |
| 规格化裁决 | G2-RCLR-001—010；旧G2-CLR-001—012仅为G1上游继承索引 |
| 追踪 | SRS/spec/RTM/澄清10/10 RCLR无缺失，39 FR正向链完整 |
| 数字 | 以`control/key_numbers.md`为唯一真值；不得从本文件派生第二套数值库 |
| 责任 | 继承甲方提供外部能力/环境/源数据、乙方负责业务适配与验证的受控边界 |

## 2 内容清单与完整性指纹

| 文件 | Git blob | SHA-256 |
| --- | --- | --- |
| `docs/work/A_PM/software_requirements_specification_v0.1.md` | `4a3a57adb2adfd936d1b7256eabf0394efde5349` | `8709d584b5208f7b47a8da6bd5ff195286914ed0a84e6c2ec3b96dba178bb080` |
| `docs/work/B_TECH/spec.md` | `45e6dc1692894d350b645361b70c64c9634d1b49` | `06a69ea2458b221cefecdd96971cc6974fefbe81ed92d5ac97a5bd0f51ef9d45` |
| `docs/work/C_REQ/rtm_v1.md` | `ea4eb592e924213ddb5cf6bd07144e55cf47b8ea` | `1b3bef0e605cd58f4036e6ca100e6133a912d393f2e9e9df60ec94735d4327f3` |
| `docs/work/C_REQ/ai_reverse_clarifications.md` | `ceb3f089e5c772b0204412ff27d8971d346041cb` | `dd22559b48566376238c6ac3e96b8c83105ebe89ad1ab6bb6c40bfa484b5866f` |
| `docs/deliverables/07-用户访谈记录与MoSCoW优先级.docx` | `57c081c09ed8fdcbad2d0c413e6dd7d97e04e602` | `230d3e54268be7989dfa64a9bd3cc6c95b343034e536603346d4ef2968128be7` |
| `docs/deliverables/08-软件需求规格说明书SRS.docx` | `990b7c87bec6d8c32a97ddd78a9c1864da0f2faf` | `867d1d4cc22ffd8822a40f6e8726392ff2c73df135208c05d07f2c711488139e` |
| `docs/deliverables/09-AI反向澄清记录.docx` | `a39dd633b7fff953d314571b6b96a64389d28202` | `b0e2af35b5f8b1a2300710448aa2459d6ecfb6308ccd6aaef301c407bf6005a9` |
| `docs/deliverables/10-需求追踪矩阵RTMv1.docx` | `0ee89fead498c69fc468446c5dfd75e983990be4` | `d7cd01a8c78cc0a252c91dda632fcaeb7a7ca2d35e0e41a863c336cf5265399f` |

## 3 教师问题状态

| Issue | 候选状态 |
| --- | --- |
| ISSUE-G2-R01-001 反向澄清 | CLOSED |
| ISSUE-G2-R01-002 图表与格式 | CLOSED / VERIFIED_BY_B_AND_C |
| ISSUE-G2-R01-003 流程/状态/异常粒度 | RESOLVED / PENDING_B_C_R06_REVIEW |
| ISSUE-G2-R01-004 需求级字段字典 | RESOLVED / PENDING_B_C_R06_REVIEW |
| ISSUE-G2-R01-005 PE/NFR系统表达 | RESOLVED / PENDING_B_C_R06_REVIEW |

## 4 开放边界

`ISSUE-G3-01-001`保持OPEN。视频和统一消息通道的真实账号、版本/字段、认证、脱敏请求响应/回执、失败场景和连通结论尚未形成；本候选基线不冻结真实外部契约，不声明相关现场指标已验证。该Issue继续阻断G3-06外部接口冻结及G3-10/M3最终冻结。

## 5 生效门禁

本文件当前不是最终冻结批准。B、C独立复核均PASS并将G2-R06置为DONE后：

1. 状态改为`FROZEN`并回填复核记录和提交；
2. `G3-01R`才可解除前置阻塞；
3. 之后改变FR、★、AC、RCLR、关键数字、责任或验收强度必须登记新Change并发布新基线版本，禁止覆盖本版本。
