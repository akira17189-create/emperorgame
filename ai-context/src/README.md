# src/ 目录说明

本目录包含皇帝游戏的全部源代码。

## 📁 目录结构

| 子目录 | 用途 | 文件数量 | 重要性 |
|--------|------|----------|--------|
| `engine/` | 游戏引擎核心逻辑 | 10 | ⭐⭐⭐⭐⭐ |
| `prompts/` | AI提示词和生成逻辑 | 5 | ⭐⭐⭐⭐⭐ |
| `ui/` | 用户界面组件 | 12 | ⭐⭐⭐⭐ |
| `data/` | 游戏数据配置 | 5 | ⭐⭐⭐⭐ |
| `styles/` | 样式文件 | 3 | ⭐⭐ |

## 🔧 核心文件

### 引擎文件 (`engine/`)
- **`narrator.ts`** - 叙事生成核心，负责AI驱动的故事叙述
- **`skills.ts`** - 技能系统实现，处理角色技能和效果
- **`templates.ts`** - 模板系统，管理游戏文本模板
- **`types.ts`** - 类型定义，包含所有TypeScript接口
- **`llm.ts`** - **【更新】** LLM函数扩展（包含3个[改造-Phase4]标记）

### 提示词文件 (`prompts/`)
- **`arbitration.md`** - 仲裁机制，处理冲突叙事的生成
- **`narration.md`** - 叙事提示词，指导AI生成故事文本
- **`role-execution.md`** - 角色执行逻辑，定义角色行为规则
- **`layer1-world-rules.md`** - 世界规则，游戏世界的基本法则
- **`normalize-command.md`** - 命令规范化，处理用户输入

### 数据文件 (`data/`)
- **`core-characters.ts`** - 核心角色数据，包含主要NPC设定
- **`seed-npcs.ts`** - NPC种子数据，用于生成随机NPC
- **`seed-npcs-phase45.ts`** - **【新增】** 派系NPC数据（方直、王福全、钱谦、陈德明）
- **`seed-scenario.ts`** - 场景种子数据，游戏初始场景
- **`prewritten-court.ts`** - **【新增】** 朝会议题预写数据（5个议题）
- **`prewritten-encounters.ts`** - **【新增】** 路遇事件预写数据（15个事件）
- **`season-narratives.ts`** - **【新增】** 季节系统文案（春、夏、秋、冬）

### 界面文件 (`ui/`)
- **`NewGamePage.tsx`** - 新游戏页面，角色创建界面
- **`CourtPage.tsx`** - 朝堂页面，主要游戏界面（包含11个[改造-Phase4]标记）
- **`SavesPage.tsx`** - 存档页面，游戏存档管理
- **`components/NpcChatWindow.tsx`** - **【新增】** NPC追问弹窗组件
- **`components/EncounterChatWindow.tsx`** - **【新增】** 路遇弹窗组件
- **`components/`** - 其他可复用UI组件

### 修改游戏逻辑
1. **引擎修改**: 编辑`engine/`下的TypeScript文件
2. **提示词调整**: 修改`prompts/`下的Markdown文件
3. **数据更新**: 编辑`data/`下的数据文件

### 添加新功能
1. **UI组件**: 在`ui/components/`下创建新组件
2. **新页面**: 在`ui/`下创建新的页面组件
3. **新提示词**: 在`prompts/`下添加新的提示词文件

### 样式修改
- **全局样式**: `styles/tokens.css` (设计令牌)
- **基础样式**: `styles/base.css` (基础元素)
- **组件样式**: `styles/components.css` (UI组件)

## 📝 开发规范

1. **TypeScript**: 所有代码使用TypeScript编写
2. **组件化**: UI采用Preact组件化开发
3. **模块化**: 逻辑按功能模块组织
4. **文档同步**: 修改代码后更新相关文档

## 🔍 快速查找

### 找特定功能
- **叙事生成**: `engine/narrator.ts` + `prompts/narration.md`
- **冲突处理**: `prompts/arbitration.md` + `engine/skills.ts`
- **角色管理**: `data/core-characters.ts` + `prompts/role-execution.md`

### 找UI组件
- **主要页面**: `ui/NewGamePage.tsx`, `ui/CourtPage.tsx`
- **可复用组件**: `ui/components/`目录

---
*最后更新: 2026年4月18日*

---

## 📊 改造计划书 v3 完成状态

**状态：✅ 全部完成**（2026-04-21）

**新增文件：**
- `seed-npcs-phase45.ts` - 4个新派系NPC
- `prewritten-court.ts` - 5个朝会议题
- `prewritten-encounters.ts` - 15个路遇事件
- `season-narratives.ts` - 四季文案
- `components/NpcChatWindow.tsx` - 追问弹窗
- `components/EncounterChatWindow.tsx` - 路遇弹窗

**改造标记：**
- `llm.ts`：3个[改造-Phase4]标记
- `CourtPage.tsx`：11个[改造-Phase4]标记

*最后更新: 2026年4月21日*