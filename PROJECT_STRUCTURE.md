# 项目结构索引

本文件为AI助手提供项目结构的快速导航，减少上下文扫描负担。

## 🎯 快速理解

**皇帝游戏**是一个AI驱动的架空历史放置模拟游戏，使用TypeScript + Preact + Vite构建。已完成Phase 3和改造计划书v3，核心系统完整。

## 📁 关键目录

| 目录 | 用途 | 重要性 |
|------|------|--------|
| `ai-context/` | AI开发上下文和源代码 | ⭐⭐⭐⭐⭐ |
| `ai-context/src/` | 源代码目录 | ⭐⭐⭐⭐⭐ |
| `ai-context/src/engine/` | 核心游戏引擎 | ⭐⭐⭐⭐⭐ |
| `ai-context/src/prompts/` | AI提示词和生成逻辑 | ⭐⭐⭐⭐⭐ |
| `ai-context/src/ui/` | 用户界面组件 | ⭐⭐⭐⭐ |
| `ai-context/src/data/` | 游戏数据配置 | ⭐⭐⭐⭐ |
| `ai-context/docs/` | 工程文档 | ⭐⭐⭐ |
| `ai-context/lore/` | 游戏世界观设定 | ⭐⭐⭐ |
| `ai-context/reports/` | 实现报告 | ⭐⭐⭐ |
| `ai-context/assets/` | 静态资源 | ⭐⭐ |

## 🔍 AI快速导航

### 核心文件（修改游戏逻辑）
1. **`ai-context/src/engine/policy-engine.ts`** - 政策系统引擎（Phase 3新增，22个政策）
2. **`ai-context/src/engine/event-engine.ts`** - 事件系统引擎（Phase 3新增，32个事件）
3. **`ai-context/src/engine/idle-engine.ts`** - 放置系统引擎（Phase 3更新）
4. **`ai-context/src/engine/ending-engine.ts`** - 结局系统引擎（Phase 3新增）
5. **`ai-context/src/engine/narrator.ts`** - 叙事生成核心逻辑
6. **`ai-context/src/engine/arbitration.ts`** - 多Agent仲裁系统
7. **`ai-context/src/engine/skills.ts`** - 技能系统实现
8. **`ai-context/src/engine/tick.ts`** - 离线演算引擎
9. **`ai-context/src/engine/goals-manager.ts`** - NPC目标管理系统
10. **`ai-context/src/engine/state-updater.ts`** - 状态更新系统
11. **`ai-context/src/engine/llm.ts`** - LLM函数扩展（3个[改造-Phase4]标记）
12. **`ai-context/src/prompts/arbitration.md`** - 仲裁机制文档
13. **`ai-context/src/prompts/narration.md`** - 叙事提示词模板
14. **`ai-context/src/prompts/npc-chat-window.md`** - 【新增】追问Prompt模板

### 配置文件（修改游戏数据）
1. **`ai-context/src/data/core-characters.ts`** - 核心角色数据
2. **`ai-context/src/data/seed-npcs.ts`** - NPC种子数据
3. **`ai-context/src/data/seed-npcs-phase45.ts`** - 【新增】派系NPC数据（4个NPC）
4. **`ai-context/src/data/seed-scenario.ts`** - 场景种子数据
5. **`ai-context/src/data/prewritten-court.ts`** - 【新增】朝会议题预写（5个议题）
6. **`ai-context/src/data/prewritten-encounters.ts`** - 【新增】路遇事件预写（15个事件）
7. **`ai-context/src/data/season-narratives.ts`** - 【新增】季节文案（4个季节）

### 界面文件（修改UI）
1. **`ai-context/src/ui/NewGamePage.tsx`** - 新游戏页面
2. **`ai-context/src/ui/CourtPage.tsx`** - 朝堂页面（11个[改造-Phase4]标记）
3. **`ai-context/src/ui/SavesPage.tsx`** - 存档页面
4. **`ai-context/src/ui/PolicyPanel.tsx`** - 政策面板（Phase 3新增）
5. **`ai-context/src/ui/EndingPage.tsx`** - 结局页面（Phase 3新增）
6. **`ai-context/src/ui/components/NpcChatWindow.tsx`** - 【新增】NPC追问弹窗
7. **`ai-context/src/ui/components/EncounterChatWindow.tsx`** - 【新增】路遇弹窗

### 样式文件
1. **`ai-context/src/styles/components.css`** - 组件样式（已添加仲裁面板样式）

## 📚 文档导航

### 工程文档（`ai-context/docs/`）
- **阅读顺序**: `ai-context/docs/README.md` → `00_overview.md` → `01_architecture.md`
- **核心文档**: `ai-context/docs/03_fixes_p1.md`（问题修复记录）
- **进度跟踪**: `ai-context/docs/06_mvp_scope.md`（MVP范围与进度）
- **Phase 4计划**: `ai-context/docs/active/14_phase4_development_plan.md`
- **开场系统**: `ai-context/docs/12_prologue_and_idle_system.md`

### 实现报告（`ai-context/reports/`）
- **Phase 3完成报告**: `ai-context/docs/active/phase3_mimo_completion_report.md`
- **开场集成报告**: `ai-context/reports/prologue_integration_report.md`
- **放置系统报告**: `ai-context/reports/prologue_and_idle_system_report.md`

### 世界观设定（`ai-context/lore/`）
- **快速入口**: `ai-context/lore/游戏核心设定整合版.md`
- **角色设定**: `ai-context/lore/角色设定/核心角色系统设计.md`
- **世界观**: `ai-context/lore/世界观设定.md`

## 🚫 忽略目录

以下目录对AI理解项目无直接帮助：
- `node_modules/` - 依赖包（已被.gitignore忽略）
- `dist/` - 构建产物（已被.gitignore忽略）
- `.backup/` - 备份文件
- `_temp_package/` - 临时文件
- `.git/` - Git版本控制

## 🔧 常见任务指南

### 修改游戏逻辑
1. 先阅读`ai-context/docs/01_architecture.md`了解架构
2. 修改`ai-context/src/engine/`下的相关文件
3. 更新`ai-context/src/prompts/`下的提示词（如需要）

### 添加新角色
1. 编辑`ai-context/src/data/core-characters.ts`
2. 更新`ai-context/lore/角色设定/`下的设定文档
3. 修改`ai-context/src/prompts/role-execution.md`（如需要）

### 修改叙事生成
1. 编辑`ai-context/src/prompts/arbitration.md`（冲突叙事）
2. 编辑`ai-context/src/prompts/narration.md`（普通叙事）
3. 修改`ai-context/src/engine/narrator.ts`（逻辑调整）

### 修改政策系统
1. 编辑`ai-context/src/engine/policy-engine.ts`
2. 更新`ai-context/src/ui/PolicyPanel.tsx`（UI调整）
3. 修改`ai-context/docs/active/DS-10_政策场景描述.md`（政策描述）

### 修改事件系统
1. 编辑`ai-context/src/engine/event-engine.ts`
2. 修改`ai-context/docs/active/DS-20_事件场景描述.md`（事件描述）
3. 更新`ai-context/docs/active/DS-21_事件选项数据结构.json`（选项数据）

## 📝 注意事项

1. **修改前备份**: 重要修改前备份关键文件
2. **保持同步**: 修改逻辑后同步更新相关文档
3. **测试验证**: 修改后运行`npm run dev`测试
4. **版本控制**: 使用Git管理更改

## 🚀 当前开发状态

### Bug修复+ 完成（2026-04-21）
- ✅ 结局引擎触发修复（tick.ts调用checkEndings）
- ✅ E3/E6/E7触发条件精确化（党争/火器营/仙道政策）
- ✅ world.factions派系系统实现（5个派系动态更新）
- ✅ 派系初始值设计（DeepSeek D3任务）
- ✅ 结局叙事补丁（DeepSeek D4任务）
- ✅ 发布演示剧本（DeepSeek D5任务）

### Phase 3 完成（2026-04-19）
- ✅ 政策系统实现（22个政策）
- ✅ 世界事件系统（32个事件）
- ✅ UI/UX优化
- ✅ 深度叙事集成（DeepSeek生成，DS-10~40）
- ✅ 派系态度矩阵
- ✅ 事件选项系统
- ✅ 结局系统框架

### Phase 2 完成（2026-04-18）
- ✅ 多Agent仲裁系统
- ✅ 完整资源系统
- ✅ NPC自主行为系统

### Phase 1 完成（2026-04-17）
- ✅ narrator.ts JSON解析修复
- ✅ 技能系统接入（32个技能）
- ✅ Token预算护栏、系统测试

### 下一步开发
- ⏳ 派系联动规则代码实现（政策对派系影响值）
- ⏳ Phase 4.1: 高级叙事系统
- ⏳ Phase 4.2: 多结局系统完善
- ⏳ Phase 4.3: 性能优化

---
*最后更新: 2026年4月21日*