# 皇帝游戏 - 架空历史放置模拟游戏

AI驱动的架空历史放置模拟游戏前端骨架。

## 快速开始

### 环境要求

- Node.js 18+
- npm 或 yarn

### 安装与运行

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build
```

### 验证项目

```bash
# 安装依赖
npm install

# 构建项目
npm run build

# 启动开发服务器
npm run dev
```

访问 http://localhost:5173 查看项目。

## 目录结构

```
./
├── index.html                 # 入口HTML
├── vite.config.ts            # Vite配置
├── package.json              # 项目配置
├── tsconfig.json             # TypeScript配置
├── .github/workflows/        # GitHub Actions部署
├── assets/ui/                # 占位SVG资源
└── src/
    ├── main.ts              # 应用入口
    ├── styles/              # 样式文件
    │   ├── tokens.css       # 设计token
    │   ├── base.css         # 基础样式
    │   └── components.css   # 组件样式
    ├── engine/              # 核心引擎
    │   ├── types.ts         # 类型定义
    │   ├── state.ts         # 状态管理
    │   ├── save.ts          # 存档系统
    │   ├── llm.ts           # LLM接口
    │   ├── narrator.ts      # 叙事引擎
    │   └── templates.ts     # 模板引擎
    ├── prompts/             # AI提示词模板
    ├── data/                # 种子数据
    └── ui/                  # 用户界面
        ├── components/      # 通用组件
        ├── SettingsPage.tsx # 设置页面
        ├── NewGamePage.tsx  # 新建游戏页面
        ├── CourtPage.tsx    # 金銮殿页面
        ├── ChroniclePage.tsx# 史册页面
        └── SavesPage.tsx    # 存档页面
```

## 技术栈

- **语言**: TypeScript
- **框架**: Preact
- **构建工具**: Vite
- **样式**: 原生CSS + CSS自定义属性
- **状态管理**: 单例GameState + 自定义发布订阅
- **持久化**: IndexedDB (idb库)
- **路由**: Hash路由 (手写)

## 设计系统

采用宣纸底色 + 水墨质感的中式历史风格：

- **主背景**: `#FAF6EE` (宣纸白)
- **卡片背景**: `#F2ECD8` (纸面)
- **主强调色**: `#8B1A1A` (朱砂红)
- **次级强调**: `#B8860B` (赭金)
- **字体**: 思源宋体、思源黑体

## 功能特性

1. **LLM配置**: 支持OpenAI、Anthropic等兼容格式
2. **游戏状态管理**: 完整的游戏状态类型定义
3. **存档系统**: 支持3个存档槽位
4. **叙事引擎**: AI驱动的叙事生成
5. **响应式设计**: 支持桌面和移动设备


## 游戏设定文档

所有世界观、角色、系统设定文档已整理到 `lore/` 目录：

📖 **[lore/README.md](./lore/README.md)** - 设定文档索引

📖 **[游戏核心设定整合版.md](./lore/游戏核心设定整合版.md)** - 核心设定整合文档（推荐优先阅读）

#

## 🤖 AI快速导航

为AI助手提供快速理解项目的指南：

### 核心文档
- **[PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md)** - 项目结构索引（AI必读）
- **[docs/README.md](./docs/README.md)** - 工程文档导航
- **[src/README.md](./src/README.md)** - 源代码目录说明

###关键文件位置
1. **游戏逻辑**: `src/engine/` (核心引擎)
2. **AI提示词**: `src/prompts/` (生成逻辑)
3. **游戏数据**: `src/data/` (配置数据)
4. **界面组件**: `src/ui/` (用户界面)

### 快速理解步骤
1. 阅读 `PROJECT_STRUCTURE.md` 了解整体结构
2. 查看 `src/README.md` 了解代码组织
3. 参考 `docs/00_overview.md` 了解项目定位

### 常见任务索引
- **修改叙事**: 编辑 `src/prompts/narration.md`
- **调整冲突**: 编辑 `src/prompts/arbitration.md`
- **添加角色**: 编辑 `src/data/core-characters.ts`
- **修改UI**: 编辑 `src/ui/` 下的组件

