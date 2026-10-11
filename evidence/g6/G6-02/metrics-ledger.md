# G6-02 复盘指标明细与口径（首版）

| 指标 | 当前值 | 定义/分母 | 时间区间/排除项 | 来源 | 状态 |
|---|---:|---|---|---|---|
| FR总数 | 39 | 冻结功能需求唯一编号 | M2—当前；不含测试/技术条目 | RTM v5、facts | VERIFIED |
| ★FR总数 | 34 | 39 FR中★标识 | 不把★AC重复计为★FR | RTM v5 | VERIFIED |
| AC总数 | 117 | 每FR 3条AC | 不新增G6临时口径 | RTM v5 | VERIFIED |
| AC真实结果 | 11/59/47 | PASS/NOT_RUN/BLOCKED，分母117 | 以G5最终原始执行包为截止点 | functional-gate-raw、C最终Review | VERIFIED |
| ★FR真实结果 | 1/33 | PASS/BLOCKED，分母34 | 仅整FR全部AC满足才PASS | RTM v5 | VERIFIED |
| 至少一项PASS的FR | 6 | 39 FR中至少1条AC真实PASS | 不等于FR通过 | mechanical-summary | VERIFIED |
| 全AC PASS的FR | 1 | 39 FR中全部3条AC真实PASS | 不由套件总绿推导 | mechanical-summary | VERIFIED |
| 性能原始样本 | 1160 | 8组本地样本总数 | 本地内存HTTP/模拟适配；非生产SLA | performance-raw/CSV | VERIFIED_WITH_BOUNDARY |
| 性能失败 | 0 | 上述1160样本中的请求失败 | 不覆盖真实甲方通道/目标规模 | performance-raw | VERIFIED_WITH_BOUNDARY |
| 交付索引配置项 | 29 | 本轮唯一索引行 | 首版快照；后续增量不重复编号 | delivery-index.json | VERIFIED |
| 当前可用/缺项 | 20/9 | AVAILABLE/NOT_AVAILABLE，分母29 | 仅存在性，不代表全部验收通过 | delivery-index.json | VERIFIED |
| 甲方系统真实联调 | 0/6 | 视频、消息、定位、GIS、安防、发布 | 模拟6/6另列，不混计 | G5-02条件证据 | VERIFIED |
| 真实非乙方部署操作者 | 0 | 实际独立人员数 | 模拟课程角色不计 | KN-065见证记录 | VERIFIED |
| AI代码占比 | 【待人工确认】 | 需人工确认的代码归因样本/纳入样本 | Git作者与AI日志不直接等于代码归因 | 尚无可靠样本账 | UNKNOWN |
| 评审打回率 | 【待人工确认】 | 首审要求整改的唯一任务或PR/完成首审的唯一任务或PR | 多轮复验另列；需先冻结统计范围 | Review/PR清单待规范化 | UNKNOWN |
| Prompt复用次数 | 【待人工确认】 | 有模式ID且有真实调用日志的复用调用 | 相似措辞和文件存在不计 | 模式库/调用明细待建 | UNKNOWN |
| 返工成本 | 【待人工确认】 | 有证据的实际返工工时 | Git时间不等于工时；未知不写0 | Issue/Review与人工工时 | UNKNOWN |

本账只提供单一取数口径。A制作PPT/总结时不得重新手算或选择更好看的分母；B复核技术范围后再进入发布材料。
