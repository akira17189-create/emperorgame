---
purpose: "上朝 + 史册" 垂直切片的明确边界与验收标准。MVP 开工清单。
audience: AI / 人类开工时对照
last_updated: 2026-04-17
---

# 06 — MVP 范围：上朝 + 史册垂直切片

**MVP 目标**：证明整套架构能跑通。**不追求玩法完整**，追求的是从"玩家输入"到"决策 JSON → 叙事 → 进史册"的**一个完整链路**能稳定工作。

---

## 1. 范围边界

### ✅ 包含（In）

| 模块 | 具体要求 |
|------|---------|
| LLM 配置页 | 表单填 baseURL / apiKey / modelMain / modelCheap；localStorage 保存；测试按钮（发一次极小请求校验可用） |
| 新建档 | 选"明朝 · 嘉靖三年"一个预置剧本；固定初始 resources；固定 3 个种子 NPC |
| 金銮殿场景 | 纯 CSS 宣纸背景 + 3 个 NPC 占位卡 + 底部指令输入框 |
| 3 个种子 NPC | 完整 `NPC` 字段：海瑞 / 严嵩 / 张居正（权重、voice、memory 空） |
| 自由文本指令 | 输入框 + 提交按钮 + 骨架加载态 |
| 指令归一化 | B 档 LLM 调用，返回 `intent` |
| 单 NPC 决策 | **MVP 不做多 Agent 冲突**；只挑 1 个最相关 NPC（按 intent 的 `by_role` 命中）生成 decision_trace |
| 叙事生成 | A 档 LLM 调 Layer 4 Prompt，生成 150~300 字中文叙事 |
| 史册写入 | decision_trace + 叙事写入 `chronicle.official[]` |
| 史册查看页 | `#/chronicle` 路由，按年倒序列出条目，可展开看全文 |
| IDB 存档 | 手动"保存"按钮，最多 3 个存档槽，支持加载/删除 |
| 路由 | hash 路由：settings / new / court / chronicle / saves |

### ❌ 不包含（Out，后续阶段处理）

- 多 Agent 冲突与仲裁（Prompt 4 先不实装）
- 放置 / 资源 tick（`engine/tick.ts` 暂不写，资源静止）
- 代理执政 / 离线演算
- 挂起事件 / 密信 UI
- 记忆 LRU 淘汰（MVP 的 NPC 记忆为空或固定）
- 政策系统（MVP 指令不改政策）
- 风格标签切换（MVP 固定用"史官视角 + 克制叙述"）
- 王朝轮回 / 传承 / 内禅密旨
- 真实图片（占位纹章即可）
- 音效
- 云存档（留接口不实装）
- 指令校验与越狱检测（先相信玩家）
- 缓存层（`hash()` 缓存暂不实装）

---

## 2. 文件交付清单（MVP 阶段 1）

```
./
├── index.html                  Vite 入口
├── vite.config.ts
├── package.json
├── src/
│   ├── main.ts                 bootstrap + 路由
│   ├── styles.css
│   ├── engine/
│   │   ├── types.ts            从 04_gamestate_schema.md 翻译
│   │   ├── state.ts            单例 + 发布订阅
│   │   ├── save.ts             IDBAdapter + Supabase 占位类
│   │   ├── llm.ts              三档调度（MVP 只用 A、B）
│   │   ├── skills.ts           路由字典 + 拼装
│   │   └── narrator.ts         Prompt 拼装 + JSON 解析
│   ├── prompts/
│   │   ├── layer1-world-rules.md
│   │   ├── normalize-command.md
│   │   ├── role-execution.md
│   │   └── narration.md
│   ├── data/
│   │   ├── seed-npcs.ts        海瑞 / 严嵩 / 张居正
│   │   ├── seed-scenario.ts    明朝嘉靖三年初始状态
│   │   └── labels.ts           英→中映射
│   └── ui/
│       ├── SettingsPage.tsx
│       ├── NewGamePage.tsx
│       ├── CourtPage.tsx
│       ├── ChroniclePage.tsx
│       ├── SavesPage.tsx
│       └── components/
│           ├── VisualSlot.tsx
│           ├── NpcCard.tsx
│           └── ChronicleEntry.tsx
```

---

## 3. 验收 Checklist

MVP 完成 = 以下全部 ✅：

- [ ] **C1 配置校验**：清空 localStorage 后打开游戏，被强制跳到设置页；填错的 key 点"测试"按钮报错；填对后可继续。
- [ ] **C2 一次完整流程**：新建档 → 金銮殿 → 输入"加税三成" → 3 秒内看到加载动画 → 海瑞说出一段 150~300 字的反对话（符合 15 条文风，无"内心复杂"等禁词） → 点"存档" → 刷新页面 → 加载存档 → 状态完整恢复。
- [ ] **C3 史册可读**：连续输入 3 个不同指令后，史册页按年倒序显示 3 条记录，每条可展开看全文和"决策依据"折叠区（decision_path 的中文渲染）。
- [ ] **C4 devtools 零泄漏**：Network 面板能看到 fetch 去了玩家填的 baseURL，Authorization header 可见（自己的 key，无所谓），但没有任何第三方追踪请求。
- [ ] **C5 空配置降级**：清空 llm_config 后，游戏能打开新档（走 C 档占位文案），能看存档，不崩溃；明确提示"当前为只读演示模式"。
- [ ] **C6 Gzip ≤ 300KB**：`npm run build` 产物 gzip 后 ≤ 300KB。
- [ ] **C7 占位图不报错**：所有 NPC / 史册条目的 `image` 字段为 null，但 UI 不出现碎图或控制台 404。
- [ ] **C8 GitHub Pages 部署**：push 到 main 后 GitHub Actions 自动部署到 Pages，访问 URL 即可玩。

---

## 4. 不在本阶段解决但需要**接口预留**的

这些字段 / 钩子在 MVP 中就要**存在但不实装**，避免后续重构：

| 预留点 | 为谁预留 |
|--------|---------|
| `SaveAdapter` 接口 + Supabase 占位类 | 阶段 ? 云存档 |
| `GameState.events` / `pending_events` 字段 | 阶段 2 放置系统 |
| `GameState.world.wills[]` 字段 | 阶段 3 传承 |
| `engine/tick.ts` 空文件 + 导出签名 | 阶段 2 |
| Prompt 4 仲裁模板（文件就绪，不调用）| 阶段 3 多 Agent |
| `Visual` 字段全量落位 | 阶段 4 真图 |
| Style tag 切换器 UI（开关隐藏）| 风格扩展 |

---

## 5. MVP 预估工作量

| 子任务 | 预估 | 说明 |
|--------|------|------|
| TS schema 翻译 | 半天 | 从 `04_gamestate_schema.md` 照抄 |
| Vite + Preact 项目骨架 | 半天 | |
| LLM 调用封装 + provider 适配 | 半天 | OpenAI / Anthropic headers 差异 |
| Prompt 模板 .md 文件编写 | 半天 | 照抄 `05_prompt_layers.md` |
| 5 个页面 + 组件 | 2 天 | |
| IDB 存档适配器 | 半天 | 用 `idb` npm 包 |
| 种子数据（NPC × 3 + 剧本 × 1） | 半天 | 需要人类补内容 |
| 样式 / 宣纸感 | 半天 | |
| 联调 + bug fix | 1 天 | |
| GH Pages 部署 | 2 小时 | Actions 一次过 |

总计：**约 6~7 个人日**。

---

## 6. 下一阶段（MVP+1）拿到 MVP 再开

不在本文讨论。MVP 验收通过后，参考以下顺序扩展：

1. **放置层**：`engine/tick.ts` + 离线演算 + 挂起事件 UI
2. **多 Agent 冲突**：Prompt 4 启用 + 并发调度
3. **政策系统**：标签化政策 + UI
4. **风格切换**：让玩家选主题风格
5. **传承 / 王朝轮回**：内禅密旨 + 继承系统
6. **真图灌入**：按目录约定批量填图
7. **云存档**：实装 SupabaseAdapter
