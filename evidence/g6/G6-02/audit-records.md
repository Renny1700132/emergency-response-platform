# G6-02 三线审计增量（首版）

## 1 文档审计

| 检查项 | 方法 | 当前结果 | 状态/后续 |
|---|---|---|---|
| P1 §10.3 交付类别 | 对照 CM-150—155 与唯一交付索引逐类点验 | 已有计划、需求、设计、接口、测试及G5报告；用户/运维手册、培训、试运行、总结、签署、基础数据确认等尚缺 | PARTIAL / 缺项见台账 |
| P1 §10.4 完整一致 | 核对冻结基线、RTM、代码/配置、测试结论与状态边界 | 已有受控链；G5真实结果未被候选文档覆盖；G6手册/PPT/总结尚未形成 | PARTIAL |
| 双向追踪 | 从117行AC抽取FR、设计ID、TC、原始定位和G6状态；反向按39FR聚合 | 117/117行、39/39FR、34/34★FR；仅11 AC保留有证据PASS输入，106项仍延期/未接受 | PASS_FOR_INITIAL_INDEX |
| 源文件+PDF | 点验当前正式件类型 | 既有DOCX/YAML/MD可定位；G6新正式件及PDF尚未产生 | PLANNED |
| 文件版本与哈希 | 当前工作区逐文件SHA-256；提交后再核Git对象 | 20项AVAILABLE有hash，9项NOT_AVAILABLE不填hash | PASS_FOR_CURRENT_SNAPSHOT |

文档审计结论：`PASS_FOR_INITIAL_CANDIDATE_WITH_GAPS`。不得表述为 P1 §10.3/§10.4 已全部交付或竣工验收通过。

## 2 部署与可移植性审计

| 检查项 | 当前证据 | 结论 |
|---|---|---|
| 容器与配置入口 | `compose.yaml`、G5 Docker原始记录 | AVAILABLE；作者侧课程证据 |
| 干净部署与恢复 | G5本地Docker/PostgreSQL记录 | 已有本地证据，不等于目标环境或第三方验收 |
| KN-065 独立部署 | 课程模拟见证复用B既有17秒记录 | `REAL_WORLD_NOT_RUN`；真实操作者0 |
| 六类甲方系统 | fixture/模拟条件证据 | `SIMULATED_EVIDENCE`；真实0/6 |
| G6-01命令台账 | 尚未形成 | NOT_AVAILABLE / B主责 |
| G6-03真实正常/异常试演 | 尚未形成 | NOT_AVAILABLE / 真实资源前置 |

部署审计结论：`COURSE_INPUT_AVAILABLE / REAL_WORLD_DEFERRED`。不得将17秒记录改称非乙方独立部署成功。

## 3 AI使用审计

| 检查项 | 当前结果 | 边界 |
|---|---|---|
| Prompt原文 | G6-00与本G6-02均有角色隔离日志 | `raw_dialogue_available:false`，不补造完整对话 |
| Prompt—产物—commit | G6-00可定位；G6-02当前待内容commit回填 | PENDING_CONTENT_COMMIT |
| PR/Review | G6按OVR-038直接master，PR=N/A；指定B复核待执行 | 不伪造PR/Approve |
| AI代码占比 | 无经人工确认的行级/模块归因分母 | `【待人工确认】`，不由Git作者推断 |
| Prompt复用次数 | 未建立模式ID与逐调用对应台账 | `UNKNOWN`，相似文本不计复用 |
| 返工成本 | 有Issue/Review次数，但无可靠工时 | 只记录事件，不估算节省工时 |

AI审计结论：`PASS_FOR_TRACEABILITY / METRICS_PARTIAL`。最终指标须由 B 确认技术范围、A按已复核账本引用。
