# G4-04 课程模拟服务与 Fixture

本目录只提供课程研发使用的 `SIMULATED_EVIDENCE`，不代表真实甲方接口、账号、现场网络、生产连通或性能验收。它不修改冻结 OpenAPI；业务代码应通过正式适配端口消费这些 Fixture，不得把本目录当作正式数据源。

## 使用

```text
npm run simulated:start
GET http://127.0.0.1:43104/simulated/v1/<adapter>/<scenario>
```

- `adapter`：`EXT-VIDEO`、`EXT-PUBLISH`、`EXT-INTRUSION`、`EXT-ACCESS`、`EXT-FIRE`、`EXT-IOT`、`EXT-MIDDLE`、`EXT-MESSAGE`、`GIS`、`H5`。
- `scenario`：`normal`、`unauthorized`、`timeout`、`failure`。
- 服务只绑定 `127.0.0.1`，不含密码、令牌、真实地址或个人信息。
- 所有响应都带 `marker=SIMULATED_EVIDENCE` 和 `x-evidence-kind: SIMULATED_EVIDENCE`。

## 边界

- 八个 `EXT-*` 标识保持独立语义，不能合并成一个“外部系统”成功结论。
- GIS 仅模拟甲方既有合法地图服务的加载/失败边界，坐标口径为课程模拟确认的 `EPSG:4490`；不表示真实地图服务已提供。
- H5 仅模拟嵌入既有智慧管理 APP 的宿主桥接；乙方交付 H5 包，不交付原生 Android/iOS APP，宿主、签名和发布仍由甲方负责。
- 门禁控制超时返回“结果未知”，明确禁止自动重放。

运行 `npm run quality` 会覆盖 Fixture 完整性、重复性、边界和本地契约门禁。
