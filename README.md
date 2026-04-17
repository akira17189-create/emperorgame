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

## 开发说明

### 项目结构

项目采用模块化设计，核心逻辑在`engine`目录，UI组件在`ui`目录，样式在`styles`目录。

### 路由

- `#/settings` - LLM配置页面
- `#/new` - 新建游戏页面
- `#/court` - 金銮殿主场景
- `#/chronicle` - 史册查看页面
- `#/saves` - 存档管理页面

### 状态管理

使用单例模式管理游戏状态，通过发布订阅模式通知状态变化。

### LLM集成

支持三档调度：
- **A档**: 高质量模型，用于角色执行和叙事生成
- **B档**: 经济模型，用于指令归一化
- **C档**: 本地模板，不调用LLM

## 部署

项目支持GitHub Pages自动部署，推送到main分支后会自动构建并部署到GitHub Pages。

## 许可证

本项目仅供学习和演示使用。