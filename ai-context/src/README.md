# src/ 目录说明

本目录包含皇帝游戏的全部源代码。

## 📁 目录结构

| 子目录 | 用途 | 文件数量 | 重要性 |
|--------|------|----------|--------|
| `engine/` | 游戏引擎核心逻辑 | 14 | ⭐⭐⭐⭐⭐ |
| `prompts/` | AI提示词和生成逻辑 | 6 | ⭐⭐⭐⭐⭐ |
| `ui/` | 用户界面组件 | 14 | ⭐⭐⭐⭐ |
| `data/` | 游戏数据配置 | 9 | ⭐⭐⭐⭐ |
| `styles/` | 样式文件 | 3 | ⭐⭐ |

---

## 🔧 核心文件

### 引擎文件 (engine/)

- `narrator.ts` — 叙事生成核心，负责AI驱动的故事叙述
- `arbitration.ts` — 多Agent仲裁系统，处理NPC冲突
- `tick.ts` — 离线演算引擎，管理时间推进
- `skills.ts` — 技能系统实现，处理角色技能和效果（32个技能）
- `state.ts` — 状态管理系统
- `types.ts` — 类型定义，包含所有TypeScript接口
- `llm.ts` — 【含3个[改造-Phase4]标记】LLM函数扩展
- `goals-manager.ts` — NPC目标管理系统
- `state-updater.ts` — 状态更新系统
- `templates.ts` — C档模板系统（零API调用）
- `save.ts` — 存档系统
- `policy-engine.ts` — ✨Phase3 政策系统引擎（22个预设政策）
- `event-engine.ts` — ✨Phase3 世界事件系统引擎（32个事件）
- `idle-engine.ts` — ✨Phase3 放置积累引擎（含政策加成）
- `ending-engine.ts` — ✨Phase3 结局系统引擎（8种结局路径）

### 提示词文件 (prompts/)

- `arbitration.md` — 仲裁机制，处理冲突叙事的生成
- `narration.md` — 叙事提示词，指导AI生成故事文本
- `role-execution.md` — 角色执行逻辑，定义角色行为规则
- `layer1-world-rules.md` — 世界规则，游戏世界的基本法则
- `normalize-command.md` — 命令规范化，处理用户输入
- `npc-chat-window.md` — ✨改造v3 追问弹窗Prompt模板

### 数据文件 (data/)

- `core-characters.ts` — 核心角色数据，包含主要NPC设定
- `seed-npcs.ts` — NPC种子数据
- `seed-npcs-phase45.ts` — ✨改造v3 派系NPC扩展包（方直、王福全、钱谦、陈德明）
- `seed-scenario.ts` — 场景种子数据，游戏初始场景
- `prewritten-court.ts` — ✨改造v3 朝会预写议题（5个）
- `prewritten-encounters.ts` — ✨改造v3 路遇事件预写（15个）
- `season-narratives.ts` — ✨改造v3 季节系统文案（春、夏、秋、冬）
- `labels.ts` — 标签系统
- `skills-bundle.ts` — 技能包数据

### 界面文件 (ui/)

- `NewGamePage.tsx` — 新游戏页面，角色创建界面
- `CourtPage.tsx` — 朝堂主页面（含11个[改造-Phase4]标记）
- `ChroniclePage.tsx` — 史册页面
- `SettingsPage.tsx` — 设置页面
- `SavesPage.tsx` — 存档页面，游戏存档管理
- `PolicyPanel.tsx` — ✨Phase3 政策面板
- `EndingPage.tsx` — ✨Phase3 结局页面
- `components/NpcChatWindow.tsx` — ✨改造v3 NPC追问弹窗组件
- `components/EncounterChatWindow.tsx` — ✨改造v3 路遇弹窗组件
- `components/` — 其他可复用UI组件

---

## 🛠️ 常见任务

### 修改游戏逻辑
- 引擎修改：编辑 `engine/` 下的 TypeScript 文件
- 提示词调整：修改 `prompts/` 下的 Markdown 文件
- 数据更新：编辑 `data/` 下的数据文件

### 添加新功能
- UI组件：在 `ui/components/` 下创建新组件
- 新页面：在 `ui/` 下创建新的页面组件
- 新提示词：在 `prompts/` 下添加新的提示词文件

### 样式修改
- 全局样式：`styles/tokens.css`（设计令牌）
- 基础样式：`styles/base.css`
- 组件样式：`styles/components.css`

---

## 📝 开发规范

- TypeScript 严格模式
- 函数式组件 + Hooks（Preact）
- CSS Variables（避免 CSS-in-JS）
- 组件单一职责，不超过 300 行
- 所有页面组件使用具名导出（`export function ComponentName()`）

## 🔍 快速查找

| 目标功能 | 关键文件 |
|----------|----------|
| 叙事生成 | `engine/narrator.ts` + `prompts/narration.md` |
| 冲突仲裁 | `engine/arbitration.ts` + `prompts/arbitration.md` |
| 政策系统 | `engine/policy-engine.ts` + `ui/PolicyPanel.tsx` |
| 事件系统 | `engine/event-engine.ts` |
| 放置积累 | `engine/idle-engine.ts` |
| 结局系统 | `engine/ending-engine.ts` + `ui/EndingPage.tsx` |
| 角色管理 | `data/core-characters.ts` + `prompts/role-execution.md` |
| 主要页面 | `ui/CourtPage.tsx`（含Phase4改造标记） |

---

> 最后更新：2026-04-21
