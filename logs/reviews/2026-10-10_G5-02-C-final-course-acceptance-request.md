# G5-02 C 最终课程条件验收复核请求

- 主责：B；最终复核：C。
- 状态候选：`REVIEW（COURSE_CONDITIONAL_ACCEPTANCE_PENDING_C）`。
- 裁决：OVR-034 / CHG-G5-02-001；完整用户授权见 `LOG-G5-02-008`。
- 真实世界边界：甲方六类系统仍为 0/6 tested；真实非乙方操作者仍为 0；二者均为 `REAL_WORLD_NOT_RUN / REAL_WORLD_DEFERRED`。

## 1 请求复核的课程证据

1. `course-conditional-external-systems.json`：视频、消息、定位、GIS、安防、信息发布 6/6 逐项具备模拟场景、输入、预期、实际结果、fixture 和测试回指；统一为 `SIMULATED_EVIDENCE / NOT_OWNER_ENVIRONMENT`。
2. `course-conditional-kn065-witness.json`：复用既有真实 B 侧 Docker 17 秒部署、迁移、health/ready、重启和清理证据；角色为 `SIMULATED_COURSE_ROLE`，`notARealIndependentHuman=true`，身份和签字为 null。
3. `environment-readiness.json`：课程状态与真实世界状态分列；没有把课程接受候选改写成真实环境 PASS。
4. `control/issues.md`：001/002 保留全部原始 BLOCKED/OPEN 历史，当前仅调整为 `CLOSED_FOR_COURSE_STAGE / REAL_WORLD_DEFERRED / PENDING_C_FINAL_REVIEW`。

## 2 B 验证结果

- 相关模拟器与 Sprint 2 后端测试：9/9 PASS，exit 0；原始控制台输出见 `2026-10-10_G5-02-B-course-conditional-tests.log`。
- 默认技术证据校验：`PASS_WITH_COURSE_WAIVERS`，manifest 23/23、JSON/CSV 1160/1160、八组指标一致、`unconditionalRealWorldPass=false`；输出见 `2026-10-10_G5-02-B-course-conditional-validation-default.log`。
- `--git-ref=HEAD`：内容提交 `1ff546484b1140e80e431b78c4e82028fbb2c347` 后实际执行，`PASS_WITH_COURSE_WAIVERS`、Git blob manifest 23/23、exit 0；输出见 `2026-10-10_G5-02-B-course-conditional-validation-git-ref.log`。
- `git diff --check`：PASS。

## 3 请 C 明确检查

1. OVR-034 是否只改变课程阶段验收方式，且未改变 FR/AC/★/PE/KN、真实事实和后续履约责任；
2. 六类系统是否完整覆盖并始终标记模拟/非甲方环境；
3. KN-065 是否没有虚构真实第三方身份、时间、退出码或签字；
4. 校验器是否只输出 `PASS_WITH_COURSE_WAIVERS`，并保留 `realWorldDeferred=[owner-external-systems, independent-deployer]` 与 `unconditionalRealWorldPass=false`；
5. 如全部接受，方可把 G5-02 改为 `DONE（COURSE_CONDITIONAL_ACCEPTANCE / REAL_WORLD_DEFERRED）`。C 若不接受，应列出具体缺口并保持 REVIEW，不得把课程证据误写成真实环境验收。

## 4 提交与推送

- 内容提交：`1ff546484b1140e80e431b78c4e82028fbb2c347`。
- 推送：2026-10-10 19:17 +08:00 非 force 推送 `origin/master`，远程返回 `f991adb..1ff5464 master -> master`。
- B 当前只提交最终复核请求，不代替 C 给出接受结论。
