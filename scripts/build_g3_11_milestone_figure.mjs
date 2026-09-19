import fs from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { Presentation, PresentationFile } from "@oai/artifact-tool";

const root = process.cwd();
const skillDir = "C:/Users/Lenovo/.codex/plugins/cache/openai-primary-runtime/presentations/26.909.12148/skills/presentations";
const { resolvePresentationFont } = await import(pathToFileURL(path.join(skillDir, "container_tools/artifact_tool_utils.mjs")).href);
const family = resolvePresentationFont();
const outDir = path.join(root, "docs/deliverables/figures");
await fs.mkdir(outDir, { recursive: true });

const pres = Presentation.create({ slideSize: { width: 1280, height: 720 } });
const slide = pres.slides.add();
slide.background.fill = "#FFFFFF";

function textbox(text, left, top, width, height, size, color="#1F2937", bold=false, align="center") {
  const s = slide.shapes.add({geometry:"textbox", position:{left,top,width,height}, fill:"none", line:{fill:"none",width:0}});
  s.text = text;
  s.text.style = {typeface:family,fontSize:size,color,bold,autoFit:"shrink",alignment:align,verticalAlignment:"middle"};
  return s;
}
function box(text, left, top, width, height, fill, line="#64748B") {
  const s = slide.shapes.add({geometry:"roundRect", position:{left,top,width,height}, fill, line:{fill:line,width:2}});
  s.text = text;
  s.text.style = {typeface:family,fontSize:19,color:"#0F172A",bold:true,autoFit:"shrink",alignment:"center",verticalAlignment:"middle"};
  return s;
}

textbox("G3 至 M3 里程碑与门禁", 70, 32, 1140, 58, 34, "#16324F", true);
textbox("候选成果按依赖推进；阻断未关闭，不得冻结 M3", 70, 92, 1140, 32, 18, "#475569", false);

const items = [
  ["G3-02\n计划/WBS", "#E8F1F8"], ["D0\n概要设计", "#DCECF7"], ["D1\n数据 + ADR/NFR", "#D3E8F3"],
  ["D2\n详细 + 接口", "#C7DFED"], ["D3\nRTM + 测试", "#BBD6E8"], ["P\nG3-11—14", "#E7E5F4"], ["M3\n工程基线", "#FDE2E2"]
];
const left0 = 54, gap = 18, w = 150, y = 220, h = 108;
for (let i=0;i<items.length;i++) {
  box(items[i][0], left0+i*(w+gap), y, w, h, items[i][1]);
  if (i<items.length-1) textbox("→", left0+w+i*(w+gap), y+27, gap, 50, 28, "#64748B", true);
}

textbox("并行", 740, 166, 70, 32, 16, "#5B4B8A", true);
textbox("G3-07 可与 G3-04 并行；管理计划在 G3-02 REVIEW 后可并行", 805, 158, 410, 45, 15, "#5B4B8A", false, "left");

const gate = slide.shapes.add({geometry:"roundRect", position:{left:96,top:405,width:1088,height:170}, fill:"#F8FAFC", line:{fill:"#94A3B8",width:2}});
textbox("M3 准出门禁", 130, 425, 210, 38, 24, "#16324F", true, "left");
textbox("① G3-02—14 至少 REVIEW    ② 39 FR / 34★ / 117 AC 与设计、测试双向追踪\n③ 评审问题闭环    ④ 阻断关闭，或取得有权书面替代/延期裁决\n⑤ 一致性机械审计通过后，才可创建 FROZEN 基线", 130, 472, 1010, 86, 20, "#334155", false, "left");

textbox("当前：ISSUE-G3-01-001 与 ISSUE-G3-10-001 保持 OPEN；M3 不可冻结", 110, 620, 1060, 45, 21, "#B42318", true);
slide.speakerNotes.textFrame.setText("图 4-1 的可编辑源。仅呈现受控依赖和门禁，不代表任何未完成事项已通过。无外部图片。 ");

const pptx = path.join(outDir, "20-图4-1-G3至M3里程碑与门禁.pptx");
const png = path.join(outDir, "20-图4-1-G3至M3里程碑与门禁.png");
await (await PresentationFile.exportPptx(pres)).save(pptx);
const preview = await pres.export({slide, format:"png", scale:1});
await fs.writeFile(png, new Uint8Array(await preview.arrayBuffer()));
const layout = await slide.export({format:"layout"});
await fs.writeFile(path.join(outDir, "20-图4-1-G3至M3里程碑与门禁.layout.json"), await layout.text());
