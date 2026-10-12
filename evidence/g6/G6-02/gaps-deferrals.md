# G6-02 缺项与延期台账（首版）

| ID | 缺项/延期 | 当前状态 | 责任 | 触发器 | 验证/关闭条件 | 计划日期 |
|---|---|---|---|---|---|---|
| GAP-G6-001 | 用户手册 | V0.2_B_REMEDIATED / PENDING_A_REREVIEW | B主责，A复核 | A执行G6-01复验 | V0.2 DOCX/PDF、业务关闭闭环、真实入口与正常/异常证据经A复验 | 【待人工确认】 |
| GAP-G6-002 | 部署与运维手册及命令台账 | V0.2_26_STEPS_PASS_BY_B / PENDING_A_REREVIEW | B主责，A复核 | A执行G6-01复验；ISSUE-G6-01-004另待C的G6-03复核 | 命令证据、目标回退、版本一致性经A复验；真实KN-065仍另验 | 【待人工确认】 |
| GAP-G6-003 | 培训材料、签到、考核 | NOT_AVAILABLE / RESOURCE_REQUIRED | A统筹，B技术支持 | 甲方/课程培训窗口与参与人 | 真实课件、录屏/签到/考核记录；无窗口不得代造 | 【待人工确认】 |
| GAP-G6-004 | 真实试演/现场运行 | SIMULATED_REHEARSAL_AVAILABLE / REAL_WORLD_DEFERRED | A统筹，B环境，C复核 | 合法数据、账号、网络、窗口 | 当前23项本地内存模拟检查单列；真实正常及至少一条异常分支实跑可追溯后才关闭 | 【待人工确认】 |
| GAP-G6-005 | G2-FR-030—039共30 AC未实现 | IMPLEMENTATION_DEFERRED | 后续项目负责人裁决 | 明确后续实现授权与资源 | 实现、逐AC测试、Review；不得沿用课程豁免作真实PASS | 【待人工确认】 |
| GAP-G6-006 | 59 NOT_RUN与17个非backlog BLOCKED | EVIDENCE_DEFERRED | 各实现/测试主责，C追踪 | 完整AC断言及环境到位 | 逐AC原始证据与指定复核 | 【待人工确认】 |
| GAP-G6-007 | 六类甲方系统真实联调0/6 | REAL_WORLD_DEFERRED | 甲方提供资源，B执行，C复核 | 账号/数据/测试窗口到位 | 六类逐项请求/响应/失败场景及真实结论 | 【待人工确认】 |
| GAP-G6-008 | KN-065真实非乙方独立部署 | REAL_WORLD_DEFERRED | A协调真实人员，B提供手册，C复核 | G6-01手册候选和独立人员到位 | 真实身份边界、命令、时间、退出码、结果与问题记录 | 【待人工确认】 |
| GAP-G6-009 | 试运行报告 | NOT_AVAILABLE / PLANNED_G6_04 | A | 实际试运行发生 | 真实周期、环境、问题、结论和确认记录 | 【待人工确认】 |
| GAP-G6-010 | 项目开发总结 | NOT_AVAILABLE / PLANNED_G6_04 | A，C符合性/B技术 | 指标账与现场意见到位 | 计划vs实际、AI指标边界、债务与补测移交齐全 | 【待人工确认】 |
| GAP-G6-011 | 验收签署 | REAL_SIGNATURE_REQUIRED | 甲方组织，A配合 | 真实验收会议 | 真实签署或明确待签；不得代签 | 【待人工确认】 |
| GAP-G6-012 | 基础数据初始化与双方确认 | OWNER_DATA_REQUIRED | 甲方提供/确认，乙方处理 | 合法源数据到位 | 清洗映射、导入、技术校验及甲方业务确认 | 【待人工确认】 |
| GAP-G6-013 | ISSUE-G5-02-008部署脚本改进 | OPEN / NON_BLOCKING_IMPROVEMENT | B | 下次真实部署或脚本迭代 | 动态时限、清理与残留审计实跑复验 | 【待人工确认】 |
| GAP-G6-014 | D18公历日期、时长、现场条件 | OPEN / PLANNING_INPUT | A协调 | 教师/课程安排确认 | 日期、时长、网络和现场规则有可定位记录 | 【待人工确认】 |
| GAP-G6-015 | 答辩候选与正式路径 | CANDIDATE_AVAILABLE / FINAL_NOT_AVAILABLE | A主责，B技术/C整体复核 | ISSUE-G6-03-001关闭及复核完成 | `G6-03-验收答辩候选.pptx/.pdf`可定位；不得冒充规划正式路径`G6-验收答辩.pptx` | 【待人工确认】 |
| GAP-G6-016 | G6-02增量最终复核 | B_FIRST_REVIEW_CHANGES_REQUIRED / C_REMEDIATED_PENDING_B_REREVIEW | C主责，B再复验，A一致性复验 | V0.2后续增量与审计状态提交并推送 | B形成实际再复验结论；其后A复验目录/计划/一致性；不得预写通过 | 【待人工确认】 |

本表中的课程关闭项不等于真实项目关闭。任何资源阻断只能在真实证据到位或另有书面课程裁决后迁移状态，且真实世界状态继续单列。
