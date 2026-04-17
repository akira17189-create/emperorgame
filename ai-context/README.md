# AI上下文包

本目录包含皇帝游戏项目的AI上下文文件，用于让AI快速了解项目结构和内容。

## 📁 目录内容

- `README.md` - 项目主README
- `PROJECT_STRUCTURE.md` - 项目结构索引
- `src/` - 源代码目录
- `docs/` - 工程文档
- `lore/` - 游戏世界观设定
- `assets/` - 静态资源

## 🚀 项目运行

项目配置文件已移至根目录。要运行项目，请在根目录执行：

```bash
npm install
npm run dev
```

## 🤖 AI使用指南

### 快速理解项目
1. 首先阅读 `PROJECT_STRUCTURE.md` 了解整体结构
2. 然后查看 `src/README.md` 了解代码组织
3. 最后参考 `docs/00_overview.md` 了解项目定位

### 关键文件位置
- **游戏逻辑**: `src/engine/` (核心引擎)
- **AI提示词**: `src/prompts/` (生成逻辑)
- **游戏数据**: `src/data/` (配置数据)
- **界面组件**: `src/ui/` (用户界面)

## 📝 注意事项

1. 本目录仅包含AI理解项目所需的文件
2. 配置文件、依赖、构建产物等在根目录或 `non-ai-files/` 目录
3. 要修改项目，请在根目录进行操作

---
*整理时间: 2026年4月18日*
