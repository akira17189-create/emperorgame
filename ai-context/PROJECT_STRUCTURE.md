# 项目结构索引

本文件为AI助手提供项目结构的快速导航，减少上下文扫描负担。

## 🎯 快速理解

**皇帝游戏**是一个AI驱动的架空历史放置模拟游戏，使用TypeScript + Preact + Vite构建。

## 📁 关键目录

| 目录 | 用途 | 重要性 |
|------|------|--------|
| `src/` | 源代码目录 | ⭐⭐⭐⭐⭐ |
| `src/engine/` | 核心游戏引擎 | ⭐⭐⭐⭐⭐ |
| `src/prompts/` | AI提示词和生成逻辑 | ⭐⭐⭐⭐⭐ |
| `src/ui/` | 用户界面组件 | ⭐⭐⭐⭐ |
| `src/data/` | 游戏数据配置 | ⭐⭐⭐⭐ |
| `docs/` | 工程文档 | ⭐⭐⭐ |
| `lore/` | 游戏世界观设定 | ⭐⭐⭐ |
| `assets/` | 静态资源 | ⭐⭐ |

## 🔍 AI快速导航

### 核心文件（修改游戏逻辑）
1. **`src/engine/narrator.ts`** - 叙事生成核心逻辑（已集成仲裁系统）
2. **`src/engine/arbitration.ts`** - 多Agent仲裁系统（Phase 2.1新增）
3. **`src/engine/skills.ts`** - 技能系统实现
4. **`src/engine/tick.ts`** - 离线演算引擎（Phase 2.2待实现）
5. **`src/prompts/arbitration.md`** - 仲裁机制文档（冲突叙事生成）
6. **`src/prompts/narration.md`** - 叙事提示词模板
7. **`src/prompts/role-execution.md`** - 角色执行逻辑

### 配置文件（修改游戏数据）
1. **`src/data/core-characters.ts`** - 核心角色数据
2. **`src/data/seed-npcs.ts`** - NPC种子数据
3. **`src/data/seed-scenario.ts`** - 场景种子数据

### 界面文件（修改UI）
1. **`src/ui/NewGamePage.tsx`** - 新游戏页面
2. **`src/ui/CourtPage.tsx`** - 朝堂页面（已集成仲裁结果展示）
3. **`src/ui/SavesPage.tsx`** - 存档页面

### 样式文件
1. **`src/styles/components.css`** - 组件样式（已添加仲裁面板样式）

## 📚 文档导航

### 工程文档（`docs/`）
- **阅读顺序**: `docs/README.md` → `00_overview.md` → `01_architecture.md`
- **核心文档**: `03_fixes_p1.md`（问题修复记录）
- **进度跟踪**: `06_mvp_scope.md`（MVP范围与进度）

### 世界观设定（`lore/`）
- **快速入口**: `lore/游戏核心设定整合版.md`
- **角色设定**: `lore/角色设定/核心角色系统设计.md`
- **世界观**: `lore/世界观设定.md`

## 🚫 忽略目录

以下目录对AI理解项目无直接帮助：
- `node_modules/` - 依赖包（已被.gitignore忽略）
- `dist/` - 构建产物（已被.gitignore忽略）
- `.backup/` - 备份文件
- `_temp_package/` - 临时文件
- `.git/` - Git版本控制

## 🔧 常见任务指南

### 修改游戏逻辑
1. 先阅读`docs/01_architecture.md`了解架构
2. 修改`src/engine/`下的相关文件
3. 更新`src/prompts/`下的提示词（如需要）

### 添加新角色
1. 编辑`src/data/core-characters.ts`
2. 更新`lore/角色设定/`下的设定文档
3. 修改`src/prompts/role-execution.md`（如需要）

### 修改叙事生成
1. 编辑`src/prompts/arbitration.md`（冲突叙事）
2. 编辑`src/prompts/narration.md`（普通叙事）
3. 修改`src/engine/narrator.ts`（逻辑调整）

## 📝 注意事项

1. **修改前备份**: 重要修改前备份关键文件
2. **保持同步**: 修改逻辑后同步更新相关文档
3. **测试验证**: 修改后运行`npm run dev`测试
4. **版本控制**: 使用Git管理更改

## 🚀 当前开发状态

### Phase 2.1 完成（2026-04-18）
- ✅ 多Agent仲裁系统核心实现
- ✅ 仲裁系统与叙事引擎集成
- ✅ 仲裁结果UI展示
- ✅ 仲裁面板样式设计

### 下一步开发
- ⏳ Phase 2.2: tick.ts 实现（离线演算引擎）
- ⏳ Phase 2.3: 资源管理系统

---
*最后更新: 2026年4月18日*