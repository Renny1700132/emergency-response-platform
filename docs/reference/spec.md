# spec.md —— “澜图”遥感影像智能解译工具集 · 规格单一事实源

> 版本 V3.0 · 2026 年 8 月 · 通关实训第 3 组（教学样例）
> 本文件是 AI 编码的**唯一输入源头**。任何需求变更一律先改本文件，再同步 SRS、RTM、plan/tasks 与代码（变更四步流程见 §0.3）。
> 配套样例工程：`sampleprj/lantu-main`。本文件每一条验收标准都标注**代码落点**与**测试落点**，两者必须在仓库中真实存在——写不出落点的条目不许进本文件。

---

## 0 元规格

### 0.1 项目定位

澜图不是从零自研的平台，而是**基于开源项目 lantu（samgeo，MIT 许可）的行业化二次开发**：上游提供 SAM 系列模型的地理空间封装能力，本项目在其之上补齐工程化能力——项目状态管理、可复现的操作历史、成果矢量化与多格式交付、开放接口服务、客户端集成。

这个定位是刻意选择的教学立场：真实企业项目极少从空白仓库长出来，"在成熟开源件上做二次开发并对交付质量负责"才是常态。它同时让每一份文档都能落到可运行、可测试、可审计的真实代码上。

> **给自拟题目小组的说明**：你们的题目来自企业真实需求、教师课题或自主创意，技术栈大概率与本样例完全不同，**不要照抄澜图的技术选型**。本文件的可迁移内容是*规格的写法*——编号体系、Given/When/Then 验收标准、代码与测试落点的强制标注、变更四步流程。技术内容一律按自己的题目重写。

### 0.2 交付形态

| 形态 | 说明 | 样例工程落点 |
| --- | --- | --- |
| 命令行工具 | 7 个命令组、23 条子命令，全部支持 `--json` 机器可读输出 | `agent-harness/cli_anything/samgeo/samgeo_cli.py` |
| REST 服务 | FastAPI，6 个端点，OpenAPI 3.0 契约由框架自动生成 | `samgeo/api.py` |
| 客户端集成 | QGIS 插件通过 REST 调用 | `qgis-samgeo-plugin/` |
| 成果数据 | 项目状态 JSON + GeoPackage 成果库 + GeoTIFF 掩膜 | `core/project.py`、`core/export.py` |

**不在本期范围**：Web 前端、多用户与权限体系、PostGIS/对象存储/消息队列、等保测评。这些在《概要设计说明书》附录 B 作为演进路径列出，并有 ADR-002 说明不引入的理由。

### 0.3 变更四步流程

任何需求变更按顺序执行，四步的 commit 必须成链且在变更单中登记：

1. 改本文件（`spec.md`）——变更点、原值、新值、理由；
2. 同步《软件需求规格说明书》对应条目并升版；
3. 改 `plan.md` / `tasks.md`（新增或调整任务，显性化进度影响）；
4. 改代码与测试，PR 描述引用变更单编号。

紧急缺陷修复不受此限，但须在 48 小时内补登记录。

### 0.4 编号与术语约定

- 功能需求 `FR-xx.y`，xx 为模块号；非功能需求按类别前缀 `PE/REL/MTN/SEC/DT/OSS/DOC`。
- 验收标准 `AC-<需求号>-<序号>`，一律写成 Given/When/Then 三段式。
- `★` 标记实质性条款（共 13 条，见 §4），任一条不达标即验收不通过。
- 精度类指标 `AT-xx`，须在**冻结影像集**上实测，估算值一律标注「【估算，待实测】」。
- 术语：*掩膜* 指分割输出的栅格二值/多值图层；*图斑* 指矢量化后的单个多边形要素；*提示* 指点、框或文本三类输入。

---

## 1 功能需求

### F-01 项目与会话管理

**FR-01.1 项目创建与持久化**
项目以 JSON 文件承载全部状态：名称、版本、创建/修改时间、模型配置（type/id/device）、源影像、掩膜路径、矢量路径、分割参数、操作历史。

- `AC-FR-01.1-a`：**Given** 指定项目名与源影像路径，**When** 执行创建，**Then** 返回的项目字典包含 `name / version / created / modified / model / source / masks / vectors / parameters / history` 十个键，且 `parameters` 含 6 个默认分割参数。
- `AC-FR-01.1-b`：**Given** 指定了输出路径，**When** 创建完成，**Then** JSON 文件落盘且可被重新打开，字段值与创建时一致。
- 代码落点：`core/project.py::create_project / save_project / open_project`
- 测试落点：`tests/test_core.py::TestProject`

**FR-01.2 项目信息查询与操作历史**
每次实质性操作（设置源影像、分割、矢量化、导出）追加一条历史记录，含动作、参数、结果与时间戳。

- `AC-FR-01.2-a`：**Given** 一个执行过分割与导出的项目，**When** 查询项目信息，**Then** 返回源影像、模型、掩膜与矢量状态摘要。
- `AC-FR-01.2-b`：**Given** 连续执行 3 次操作，**When** 读取历史，**Then** 历史条目数为 3 且顺序与执行顺序一致。
- 代码落点：`core/project.py::get_project_info / add_history_entry`
- 测试落点：`tests/test_core.py::TestProject`

**FR-01.3 撤销与重做**
会话维护撤销栈与重做栈，支持对项目状态的多步回退。

- `AC-FR-01.3-a`：**Given** 执行了 N 次状态变更，**When** 连续撤销 N 次，**Then** 项目状态回到初始值，且 `can_undo` 为假。
- `AC-FR-01.3-b`：**Given** 撤销后未做新变更，**When** 重做，**Then** 状态恢复到撤销前；**若**撤销后发生了新变更，**Then** 重做栈被清空。
- 代码落点：`core/session.py::Session.undo / redo / can_undo / can_redo`
- 测试落点：`tests/test_core.py::TestSession`

**FR-01.4 会话持久化与恢复**
会话（含撤销栈）可保存到磁盘并恢复，支持跨进程续作。

- `AC-FR-01.4-a`：**Given** 一个有历史的会话，**When** 保存后在新进程加载，**Then** 项目状态与历史条目完全一致。
- 代码落点：`core/session.py::save_session / load_session`
- 测试落点：`tests/test_core.py::TestSession`

### F-02 影像数据接入

**FR-02.1 ★ 栅格元数据核验**
读取影像的尺寸、波段数、坐标参考系、地理范围、分辨率与数据类型，作为后续所有处理的前置校验。

- `AC-FR-02.1-a`：**Given** 一个合法 GeoTIFF，**When** 查询元数据，**Then** 返回 `width / height / count / crs / bounds / res / dtype`，且 `crs` 为 EPSG 形式。
- `AC-FR-02.1-b`：**Given** 路径不存在或文件不是可识别栅格，**When** 查询，**Then** 返回明确错误而非抛出未捕获异常。
- 代码落点：`core/data.py::raster_info`
- 测试落点：`tests/test_core.py::TestDataErrors`、`tests/test_full_e2e.py::TestDataPipelineE2E`

**FR-02.2 在线瓦片下载与影像合成**
按地理范围与缩放级别从 TMS 服务下载瓦片并合成为带地理参考的 GeoTIFF。

- `AC-FR-02.2-a`：**Given** 一个 bbox 与缩放级别，**When** 执行下载，**Then** 产出 GeoTIFF 的地理范围覆盖请求 bbox，且坐标参考系正确。
- `AC-FR-02.2-b`：**Given** 非法 bbox（经纬度越界或 min > max），**When** 执行，**Then** 参数校验失败并给出可读提示。
- 代码落点：`core/data.py::download_tiles` → `samgeo.common.tms_to_geotiff`
- 测试落点：`tests/test_full_e2e.py::TestDataPipelineE2E`

**FR-02.3 坐标参考系重投影**
将影像重投影到目标 CRS，保持地理位置正确。

- `AC-FR-02.3-a`：**Given** 一个 EPSG:4326 影像与目标 EPSG:3857，**When** 重投影，**Then** 输出影像 CRS 为 EPSG:3857 且范围经换算后与源一致（容差内）。
- 代码落点：`core/data.py::reproject_raster` → `samgeo.common.reproject`
- 测试落点：`tests/test_full_e2e.py::TestDataPipelineE2E`

**FR-02.4 大影像分块切片**
按指定块尺寸与重叠像素切分大影像，为分块推理提供输入。

- `AC-FR-02.4-a`：**Given** 一幅影像与 `tile_size=256, overlap=0`，**When** 切分，**Then** 产出块数等于按尺寸计算的理论块数，且每块可独立读取。
- `AC-FR-02.4-b`：**Given** `overlap>0`，**When** 切分，**Then** 相邻块的地理范围存在重叠，重叠宽度与参数一致。
- 代码落点：`core/data.py::split_raster_tiles` → `samgeo.common.split_raster`
- 测试落点：`tests/test_full_e2e.py::TestDataPipelineE2E`

**FR-02.5 云优化 GeoTIFF 转换与底图清单**
支持将普通 GeoTIFF 转为 COG；提供可用底图源清单查询。

- `AC-FR-02.5-a`：**Given** 一幅普通 GeoTIFF，**When** 转换为 COG，**Then** 输出文件带内部瓦片与概览层。
- `AC-FR-02.5-b`：**When** 查询底图清单，**Then** 返回的每一项含名称与服务地址，且默认只列免费源。
- 代码落点：`core/data.py::image_to_cog / list_basemaps`
- 测试落点：`tests/test_core.py::TestDataErrors`

### F-03 模型注册与管理

**FR-03.1 ★ 多模型支持与注册表**
系统支持 SAM v1、SAM 2、SAM 3 三类分割模型与 FastSAM、HQ-SAM、LangSAM 扩展类型，模型清单集中在注册表维护，新增模型不改调用方代码。

- `AC-FR-03.1-a`：**When** 查询模型清单，**Then** 返回 `sam`（3 个变体）、`sam2`（4 个变体）、`sam3`（2 个变体）及各自默认变体。
- `AC-FR-03.1-b`：**Given** 注册表新增一个模型变体，**When** 重新查询，**Then** 新变体出现在清单中且调用方无需修改。
- 代码落点：`samgeo/model_registry.py`（`AVAILABLE_MODELS / DEFAULT_MODEL_IDS / EXTRAS_MAP`）、`core/model.py::list_models / get_model_types`
- 测试落点：`tests/test_model_registry.py`、`tests/test_api.py::test_list_models`、`tests/test_core.py::TestModel`

**FR-03.2 模型详情与默认版本**
查询指定模型类型的变体列表、默认变体、所需依赖与设备要求。

- `AC-FR-03.2-a`：**Given** 模型类型 `sam2`，**When** 查询详情，**Then** 返回默认变体 `sam2-hiera-large` 与全部 4 个变体。
- `AC-FR-03.2-b`：**Given** 一个不存在的模型类型，**When** 查询，**Then** 返回明确的「不支持的模型类型」错误并列出受支持类型。
- 代码落点：`core/model.py::get_model_info / get_default_model_id`
- 测试落点：`tests/test_core.py::TestModel`

**FR-03.3 模型可用性检查与依赖提示**
模型所需的可选依赖未安装时，给出准确的安装命令，而不是让调用在深层堆栈崩溃。

- `AC-FR-03.3-a`：**Given** `sam3` 所需 extras 未安装，**When** 检查可用性，**Then** 返回不可用并提示 `pip install lantu[samgeo3]`。
- `AC-FR-03.3-b`：**Given** 依赖已安装，**When** 检查，**Then** 返回可用且给出解析到的计算设备。
- 代码落点：`core/model.py::check_model_available`、`utils/samgeo_backend.py::check_samgeo_installed / get_device`
- 测试落点：`tests/test_core.py::TestModel`

### F-04 分割执行

**FR-04.1 ★ 全自动分割**
对整幅影像自动生成全部目标掩膜，粒度通过 6 个参数可调（`points_per_side`、`points_per_batch`、`pred_iou_thresh`、`stability_score_thresh`、`box_nms_thresh`、`min_mask_region_area`）。

- `AC-FR-04.1-a`：**Given** 一幅影像与默认参数，**When** 执行全自动分割，**Then** 产出带地理参考的掩膜 GeoTIFF，其 CRS 与范围与源影像一致。
- `AC-FR-04.1-b`：**Given** 调低 `points_per_side`，**When** 重新分割，**Then** 输出图斑数量减少——参数对结果有可观测影响。
- `AC-FR-04.1-c`：**Given** 冻结影像集，**When** 执行分割并与真值比对，**Then** 完整率 ≥80%、正确率 ≥85%（面积加权，等积投影下计算，见 AT-01）。
- 代码落点：`core/segment.py::automatic_segment`、`samgeo/samgeo.py`、`samgeo/samgeo2.py`、`samgeo/samgeo3.py`
- 测试落点：`tests/test_api.py::test_automatic_png_response`、`tests/test_samgeo.py`、`tests/test_samgeo3.py`

**FR-04.2 ★ 点提示分割**
接受前景点与背景点坐标（图像坐标或地理坐标），返回对应掩膜；支持多轮追加提示逐步修正。

- `AC-FR-04.2-a`：**Given** 一个前景点，**When** 执行点提示分割，**Then** 返回掩膜且掩膜在该点位置取值为前景。
- `AC-FR-04.2-b`：**Given** 追加一个背景点到已有提示序列，**When** 重新推理，**Then** 该点邻域从前景转为背景。
- `AC-FR-04.2-c`：**Given** 未提供任何提示，**When** 调用，**Then** 返回参数校验错误（HTTP 400），不进入推理。
- 代码落点：`core/segment.py::predict_points`、`samgeo/api.py::segment_predict`
- 测试落点：`tests/test_api.py::test_predict_missing_prompts`、`test_predict_sam3_points_accepted`

**FR-04.3 框提示分割**
接受一个或多个边界框，返回框内目标掩膜。

- `AC-FR-04.3-a`：**Given** 一个合法边界框，**When** 执行框提示分割，**Then** 返回掩膜且掩膜像素主要落在框内。
- `AC-FR-04.3-b`：**Given** 坐标为负或超出影像范围的框，**When** 调用，**Then** 返回参数校验错误（HTTP 400/422），不返回 500。
- 代码落点：`core/segment.py::predict_boxes`、`samgeo/api.py::segment_predict`
- 测试落点：`tests/test_api.py::test_predict_missing_prompts`

**FR-04.4 ★ 文本提示分割**
以自然语言类别描述（如 "building"、"tree"）驱动检测 + 分割两级链路，检测框阈值与文本阈值可调。

- `AC-FR-04.4-a`：**Given** 文本提示与阈值，**When** 执行，**Then** 返回掩膜及每个目标的置信度分数。
- `AC-FR-04.4-b`：**Given** 输出格式为 GeoJSON，**When** 执行，**Then** 每个 Feature 的属性含置信度分数。
- `AC-FR-04.4-c`：**Given** 影像中不存在该类别，**When** 执行，**Then** 返回空结果集与明确提示，不报错。
- 代码落点：`core/segment.py::text_segment`、`samgeo/text_sam.py`、`samgeo/api.py::segment_text`
- 测试落点：`tests/test_api.py::test_text_geojson_includes_scores`

### F-05 矢量化与图斑处理

**FR-05.1 ★ 掩膜栅格转矢量**
将掩膜栅格转换为矢量图斑，支持几何简化容差与目标 CRS 指定。

- `AC-FR-05.1-a`：**Given** 一个掩膜 GeoTIFF，**When** 矢量化，**Then** 产出矢量文件可被第三方 GIS 工具打开，要素数 > 0，且几何有效。
- `AC-FR-05.1-b`：**Given** 指定简化容差，**When** 矢量化，**Then** 输出顶点数显著少于未简化时，几何拓扑仍有效。
- `AC-FR-05.1-c`：**Given** 指定目标 CRS，**When** 矢量化，**Then** 输出矢量的 CRS 为目标 CRS。
- 代码落点：`core/vector.py::raster_to_vector`、`samgeo/common.py::raster_to_vector / raster_to_gpkg / raster_to_shp / raster_to_geojson`
- 测试落点：`tests/test_full_e2e.py::TestVectorPipelineE2E`、`tests/test_core.py::TestVectorErrors`

**FR-05.2 矢量成果信息查询**
查询矢量文件的要素数、几何类型、CRS、字段清单与地理范围。

- `AC-FR-05.2-a`：**Given** 一个矢量文件，**When** 查询，**Then** 返回 `feature_count / geometry_type / crs / columns / bounds`。
- 代码落点：`core/vector.py::vector_info`
- 测试落点：`tests/test_full_e2e.py::TestVectorPipelineE2E`

**FR-05.3 图斑过滤**
按面积区间或属性条件筛选图斑，剔除碎屑与噪声。

- `AC-FR-05.3-a`：**Given** 设定最小面积阈值，**When** 过滤，**Then** 输出中不存在小于阈值的图斑，且保留图斑的几何未被修改。
- `AC-FR-05.3-b`：**Given** 过滤条件命中 0 个要素，**When** 执行，**Then** 产出空矢量文件并明确提示，不报错。
- 代码落点：`core/vector.py::filter_vectors`
- 测试落点：`tests/test_core.py::TestVectorErrors`、`tests/test_full_e2e.py::TestVectorPipelineE2E`

### F-06 成果导出

**FR-06.1 ★ 多格式导出**
掩膜与矢量成果支持 6 种导出格式：GeoTIFF、COG（栅格），GeoPackage、Shapefile、GeoJSON（矢量），PNG（图像，无地理参考）。

- `AC-FR-06.1-a`：**Given** 一个含掩膜的项目，**When** 分别导出为 6 种格式，**Then** 6 个文件均生成成功且扩展名与格式登记一致。
- `AC-FR-06.1-b`：**Given** 导出为 GeoPackage/Shapefile/GeoJSON，**When** 用 QGIS 打开，**Then** 图层正确显示且属性完整。
- `AC-FR-06.1-c`：**Given** 指定了不受支持的格式，**When** 导出，**Then** 返回明确错误并列出受支持格式清单。
- `AC-FR-06.1-d`：**Given** 目标文件已存在且未指定覆盖，**When** 导出，**Then** 拒绝执行并提示；指定覆盖时正常写入。
- 代码落点：`core/export.py::export_masks / _export_raster / _export_vector / _export_image`
- 测试落点：`tests/test_core.py::TestExport`、`tests/test_full_e2e.py::TestExportE2E`

**FR-06.2 导出格式清单查询**
提供可编程查询的格式清单，含格式键、扩展名、类型与说明。

- `AC-FR-06.2-a`：**When** 查询格式清单，**Then** 返回 6 项，每项含 `format / extension / description / type` 四个字段。
- 代码落点：`core/export.py::list_formats`
- 测试落点：`tests/test_core.py::TestExport`

### F-07 开放接口服务

**FR-07.1 ★ 服务健康检查与模型端点**
REST 服务提供健康检查、模型清单查询与模型缓存清理三个管理端点。

- `AC-FR-07.1-a`：**When** 请求 `GET /health`，**Then** 返回 200 与服务版本。
- `AC-FR-07.1-b`：**When** 请求 `GET /models`，**Then** 返回与注册表一致的模型清单。
- `AC-FR-07.1-c`：**Given** 已加载模型占用显存，**When** 请求 `DELETE /models`，**Then** 缓存被清空且后续请求可重新加载。
- 代码落点：`samgeo/api.py::health / list_models / clear_models`
- 测试落点：`tests/test_api.py::test_health / test_list_models / test_clear_models`

**FR-07.2 ★ 分割接口三类**
提供 `POST /segment/automatic`、`POST /segment/predict`、`POST /segment/text` 三个分割端点，均支持多种输出格式；模型按配置缓存复用。

- `AC-FR-07.2-a`：**Given** 上传影像与合法参数，**When** 调用任一分割端点，**Then** 返回指定格式的结果（GeoJSON / PNG / GeoTIFF）。
- `AC-FR-07.2-b`：**Given** 相同模型与配置的连续两次请求，**When** 第二次调用，**Then** 复用已缓存模型实例；**若**配置不同，**Then** 分别缓存互不覆盖。
- `AC-FR-07.2-c`：**Given** 非法模型版本、非法模型 ID 或非法输出格式，**When** 调用，**Then** 返回 400 与可读错误信息。
- 代码落点：`samgeo/api.py::segment_automatic / segment_predict / segment_text / get_model / _freeze_kwargs`
- 测试落点：`tests/test_api.py::test_get_model_caches_automatic_and_predict_separately`、`test_get_model_caches_distinct_configs_separately`、`test_automatic_invalid_model_version`、`test_automatic_invalid_model_id`、`test_invalid_output_format`

**FR-07.3 接口契约与客户端集成**
OpenAPI 3.0 契约由 FastAPI 自动生成并纳入版本管理；QGIS 插件按契约调用。

- `AC-FR-07.3-a`：**When** 请求 `/openapi.json`，**Then** 返回的契约覆盖全部 6 个端点，且与仓库中归档的契约快照一致（契约测试拦截漂移）。
- `AC-FR-07.3-b`：**Given** QGIS 插件配置服务地址，**When** 发起分割请求，**Then** 结果图层正确加载。
- 代码落点：`samgeo/api.py`（FastAPI app）、`qgis-samgeo-plugin/`
- 测试落点：契约测试（本项目新增）、`tests/test_api.py`

---

## 2 非功能需求

### 性能效率

| 编号 | 指标 | 实测方法 |
| --- | --- | --- |
| PE-01 | 点/框提示单轮响应 ≤3 s（GPU，1024² 裁剪窗口）；CPU 降级路径 ≤30 s | 50 次抽样取 P95，埋点分段计时 |
| PE-02 | 全自动分割 1 km²（0.5 m 分辨率，约 2048²）≤10 min（GPU） | 冻结影像集 3 景取中位数 |
| PE-03 | 文本提示单景 ≤5 min | 冻结影像集 3 景取中位数 |
| PE-04 | CLI 冷启动（`--help` / `--json model list`，不含模型加载）≤2 s | 连续 10 次取均值 |
| PE-05 | 矢量化 2048² 掩膜 ≤30 s | 3 次取中位数 |

### 可靠性

| 编号 | 指标 | 实测方法 |
| --- | --- | --- |
| REL-01 | 模型可选依赖未安装时，返回明确的 extras 安装提示，进程不崩溃 | 卸载 extras 后逐模型类型调用 |
| REL-02 | 四类非法输入（文件缺失、模型非法、提示缺失、格式非法）返回结构化错误与合法 HTTP 码，不出现 500 | 故障注入，对照 `test_api.py` 错误用例 |
| REL-03 | 服务端临时目录在请求结束后清理，异常路径亦清理 | 连续 100 次请求后检查临时目录残留数为 0 |

### 维护性

| 编号 | 指标 | 实测方法 |
| --- | --- | --- |
| MTN-01 | 干净环境从安装到冒烟通过 ≤30 min | 干净虚拟机独立执行部署手册 |
| MTN-02 | 源码可独立构建（`pyproject.toml` + 锁定依赖），构建产物可安装 | CI 构建 wheel 并在纯净环境安装 |
| MTN-03 ★ | 跨平台 CI 全绿：ubuntu / macOS / Windows × Python 3.10 / 3.11 / 3.12 共 9 组合；核心模块单测覆盖率 ≥70%，增量代码覆盖率不低于存量均值 | GitHub Actions 工作流 + 覆盖率报告 |

### 信息安全性

| 编号 | 指标 | 实测方法 |
| --- | --- | --- |
| SEC-01 ★ | 上传文件类型与大小校验；临时目录隔离且请求后清理；拒绝路径穿越 | 渗透用例：超大文件、伪装扩展名、`../` 路径 |
| SEC-02 | 依赖 SCA 扫描高危漏洞清零 | `pip-audit` 纳入 CI 门禁 |

### 可移植性

| 编号 | 指标 | 实测方法 |
| --- | --- | --- |
| DT-01 ★ | 干净环境按部署手册一键部署成功，冒烟脚本通过；支持 GPU 与 CPU 两种运行模式 | 助教在干净环境独立执行，不接受作者旁站 |

### 合规与交付

| 编号 | 指标 | 实测方法 |
| --- | --- | --- |
| OSS-01 ★ | 开源组件清单与许可证合规说明覆盖全部直接依赖；主体为 MIT，不引入强传染性许可证 | 许可证扫描 + 人工核对清单 |
| DOC-01 | 交付文档对标国标章节结构，双格式（可编辑 + PDF）交付 | 文档审计四维评分 |

---

## 3 精度指标（须在冻结影像集上实测）

冻结影像集：5 景脱密教学影像 + 人工标注真值，在第 2 关签署《需求确认书》时封存并记录哈希，此后不得更换。

| 编号 | 指标 | 计算口径 |
| --- | --- | --- |
| AT-01 | 全自动分割完整率 ≥80%、正确率 ≥85% | 面积加权，在等积投影下计算面积 |
| AT-02 | 点提示修正后 IoU ≥0.75 | 单目标交并比，取全集平均 |
| AT-03 | 图斑面积统计误差 ≤3% | 10 组已知几何手算比对 |

> 纪律：本节任何数值在实测前一律标注「【估算，待实测】」。未经实测的数值不得写入需求确认书、测试报告与验收材料——这条规则的由来见《AI 翻车记录》第 2 条。

---

## 4 实质性条款（★，共 13 条）

任一条不达标即验收不通过，无部分得分。

| # | 条款 | 类别 |
| --- | --- | --- |
| 1 | FR-02.1 栅格元数据核验 | 功能 |
| 2 | FR-03.1 多模型支持与注册表 | 功能 |
| 3 | FR-04.1 全自动分割 | 功能 |
| 4 | FR-04.2 点提示分割 | 功能 |
| 5 | FR-04.4 文本提示分割 | 功能 |
| 6 | FR-05.1 掩膜栅格转矢量 | 功能 |
| 7 | FR-06.1 多格式导出 | 功能 |
| 8 | FR-07.1 服务健康检查与模型端点 | 功能 |
| 9 | FR-07.2 分割接口三类 | 功能 |
| 10 | MTN-03 跨平台 CI 全绿与覆盖率门禁 | 维护性 |
| 11 | SEC-01 上传校验与临时目录清理 | 安全性 |
| 12 | DT-01 干净环境一键部署 | 可移植性 |
| 13 | OSS-01 开源许可证合规 | 合规 |

---

## 5 MVP 范围（《需求确认书》锁定）

5 项核心功能，展开为 9 条 FR。范围外条目一律标注「二期」，不得在本期开发（镀金禁令）。

| MVP | 核心功能 | 对应 FR | 验收依据 |
| --- | --- | --- | --- |
| MVP-1 | 影像接入与元数据核验 | FR-02.1★、FR-02.2、FR-02.3 | AC-FR-02.1-a/b、AC-FR-02.2-a、AC-FR-02.3-a |
| MVP-2 | 全自动分割 | FR-04.1★ | AC-FR-04.1-a/b/c、AT-01、PE-02 |
| MVP-3 | 点/框提示交互分割 | FR-04.2★、FR-04.3 | AC-FR-04.2-a/b/c、AC-FR-04.3-a/b、PE-01、AT-02 |
| MVP-4 | 文本提示分割 | FR-04.4★ | AC-FR-04.4-a/b/c、PE-03 |
| MVP-5 | 矢量化与多格式导出 | FR-05.1★、FR-06.1★ | AC-FR-05.1-a/b/c、AC-FR-06.1-a/b/c/d、AT-03 |

**二期候选**（本期不做，已在需求确认书附约登记）：FR-01.4 会话跨进程恢复的并发场景、FR-02.5 COG 转换的批量模式、FR-05.3 图斑过滤的空间关系条件、FR-07.3 QGIS 插件的离线包分发。

---

## 6 规格与其他文档的关系

| 文档 | 关系 |
| --- | --- |
| 《软件需求规格说明书》 | 本文件每个 `FR-xx.y` 与 SRS 同名条目一一对应；SRS 的叙述性章节人工撰写，结构化条目与本文件同源 |
| 需求追踪矩阵 RTM | 以本文件的 FR/NFR 编号为主键，向后挂接设计、代码、测试 |
| `plan.md` / `tasks.md` | 每个原子任务的「独立验证标准」必须引用本文件的 AC 编号 |
| 《测试设计说明书》 | 每条 AC 至少展开 1 条正例与 1 条反例 |
| `constitution.md` | 约束「怎么写」，本文件约束「写什么」；AI 编码会话须同时加载两者 |

---

## 7 修订记录

| 版本 | 日期 | 变更 | 依据 |
| --- | --- | --- | --- |
| V1.0 | 2026-08-17（D6） | 首版，随 SRS V1.0 建立 | 需求评审 |
| V2.0 | 2026-08-18（D7） | 采用招标编号体系；补齐 AC 的 Given/When/Then 三段式；随《需求确认书》基线化 | AI 反向澄清 12 条裁决 |
| V3.0 | 2026-08-21（D10） | **重锚**：项目定位改为基于 lantu 的二次开发，砍掉 PostGIS / MinIO / Redis / Vue3；范围收缩至 24 条 FR + 16 条 NFR + 3 条 AT；每条验收标准补充代码落点与测试落点，去除无法在仓库中验证的条目 | 设计评审裁决，见 ADR-001/002/003 |
| V3.1 | 2026-08-27（D14） | 文本提示分割 box / text 置信度阈值默认 0.30 → 0.24 | CR-001 |
