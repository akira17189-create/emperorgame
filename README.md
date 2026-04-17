<div align="center">

# 🏯 皇帝游戏

**AI驱动的架空历史放置模拟游戏**

一个由AI驱动的架空历史放置模拟游戏，玩家扮演皇帝，通过朝堂决策管理国家。

游戏融合了东方仙侠与工业革命元素的独特世界观，NPC有独立思考能力，会因立场不同产生冲突，需要皇帝仲裁。

<br>

[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Preact](https://img.shields.io/badge/Preact-10.25-673AB7?style=flat-square&logo=preact)](https://preactjs.com/)
[![Vite](https://img.shields.io/badge/Vite-6.0-646CFF?style=flat-square&logo=vite)](https://vitejs.dev/)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)

<br>

[快速开始](#-快速开始) • [核心特点](#-核心特点) • [项目结构](#-项目结构) • [开发状态](#-开发状态) • [文档](#-文档导航)

</div>

---

## ✨ 核心特点

<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 24px; margin: 32px 0;">

<div style="background: #f7f4ed; border: 1px solid #eceae4; border-radius: 12px; padding: 24px;">

### 🎭 AI驱动叙事
基于LLM生成动态剧情，每个NPC有独立人格和记忆。玩家指令会被NPC解读，产生连锁反应。

</div>

<div style="background: #f7f4ed; border: 1px solid #eceae4; border-radius: 12px; padding: 24px;">

### ⚔️ 多Agent决策
NPC之间会因立场不同产生冲突，需要皇帝仲裁。严嵩与海瑞的争论，张居正的改革方案，都由AI实时生成。

</div>

<div style="background: #f7f4ed; border: 1px solid #eceae4; border-radius: 12px; padding: 24px;">

### 🌍 架空历史
以明朝为骨架，融合道教、工业革命等元素的独特世界观。60年王朝历史，复杂的政治生态。

</div>

<div style="background: #f7f4ed; border: 1px solid #eceae4; border-radius: 12px; padding: 24px;">

### ⏳ 放置模拟
离线期间游戏世界自动演化，资源和关系实时变化。你的每一个决策都会影响王朝的命运。

</div>

</div>

---

## 🚀 快速开始

### 环境要求

- Node.js 18+
- npm 或 yarn

### 安装与运行

```bash
# 克隆仓库
git clone https://github.com/akira17189-create/emperorgame.git
cd emperorgame

# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build
```

### 配置LLM

1. 进入设置页面（首次自动跳转）
2. 填写API配置：
   - **Base URL**: API端点地址
   - **API Key**: 访问密钥
   - **Main Model**: 主要叙事模型（如GPT-4）
   - **Cheap Model**: 经济型模型（用于指令归一化）

---

## 📁 项目结构

<div style="background: #f7f4ed; border: 1px solid #eceae4; border-radius: 12px; padding: 24px; font-family: monospace; font-size: 14px; line-height: 1.8;">

```
皇帝游戏/
├── ai-context/                 # AI开发上下文和源代码
│   ├── src/                   # 源代码目录
│   │   ├── engine/           # 核心游戏引擎
│   │   │   ├── narrator.ts    # 叙事生成系统（344行）
│   │   │   ├── arbitration.ts # 多Agent仲裁系统（752行）
│   │   │   ├── tick.ts        # 离线演算引擎（136行）
│   │   │   ├── skills.ts      # 技能路由系统
│   │   │   ├── llm.ts         # LLM调用封装
│   │   │   └── types.ts       # 类型定义（342行）
│   │   ├── ui/                # 用户界面组件
│   │   │   ├── CourtPage.tsx   # 朝堂页面（301行）
│   │   │   ├── NewGamePage.tsx # 新游戏页面
│   │   │   ├── ChroniclePage.tsx # 史册页面
│   │   │   └── SettingsPage.tsx # 设置页面
│   │   ├── prompts/           # AI提示词系统
│   │   │   ├── arbitration.md  # 多Agent仲裁Prompt
│   │   │   ├── narration.md    # 叙事生成Prompt
│   │   │   └── normalize-command.md # 指令归一化
│   │   ├── data/              # 游戏数据
│   │   └── styles/            # 样式文件
│   ├── docs/                  # 工程文档（16个文件）
│   └── lore/                  # 世界观设定（10+文件）
├── index.html                 # 入口页面
├── package.json               # 项目配置
└── vite.config.ts             # 构建配置
```

</div>

---

## 🔧 开发状态

### 已完成 ✅

| 阶段 | 功能 | 状态 |
|------|------|:----:|
| **Phase 1.1** | narrator.ts JSON解析修复 | ✅ |
| **Phase 1.2** | 技能系统接入（32个技能） | ✅ |
| **Phase 1.3** | Token预算护栏、系统测试 | ✅ |
| **Phase 2.1** | 多Agent仲裁系统 | ✅ |

### 进行中 ⏳

| 阶段 | 功能 | 预估工时 | 状态 |
|------|------|----------|:----:|
| **Phase 2.2** | tick.ts 离线演算引擎 | 3天 | ⏳ |
| **Phase 2.3** | 资源管理系统 | 2天 | ⏳ |

---

## 🎭 核心玩法

### 上朝决策流程

```
玩家输入指令 → 指令归一化 → NPC决策生成 → 冲突检测 → 多Agent仲裁 → 叙事生成 → 史册写入
```

### 游戏循环

```
上朝 → 决策 → 政策制定 → 放置运行 → 查看史册 → 再介入
```

### 核心机制

1. **指令归一化**: 将玩家自然语言指令转换为结构化意图
2. **NPC决策**: 每个NPC基于人格特质、立场、记忆生成独立决策
3. **冲突仲裁**: 当NPC立场对立时，系统自动触发多Agent仲裁
4. **叙事生成**: 基于决策和仲裁结果生成200-300字中文叙事
5. **史册记录**: 所有事件自动记录到史册，可随时查看

---

## 📚 文档导航

<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 16px; margin: 32px 0;">

<div style="background: #f7f4ed; border: 1px solid #eceae4; border-radius: 12px; padding: 20px;">

### 📖 工程文档
- [项目概览](ai-context/docs/00_overview.md)
- [架构设计](ai-context/docs/01_architecture.md)
- [MVP范围](ai-context/docs/06_mvp_scope.md)
- [AI开发指南](ai-context/docs/AI_DEVELOPER_GUIDE.md)

</div>

<div style="background: #f7f4ed; border: 1px solid #eceae4; border-radius: 12px; padding: 20px;">

### 🌍 世界观设定
- [核心设定](ai-context/lore/游戏核心设定整合版.md)
- [世界观深化](ai-context/lore/靖朝世界观深化.md)
- [剧情大纲](ai-context/lore/靖朝剧情大纲.md)
- [角色设定](ai-context/lore/角色设定/)

</div>

</div>

---

## 🛠️ 技术栈

<div style="display: flex; flex-wrap: wrap; gap: 12px; margin: 24px 0;">

![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue?style=flat-square&logo=typescript)
![Preact](https://img.shields.io/badge/Preact-10.25-673AB7?style=flat-square&logo=preact)
![Vite](https://img.shields.io/badge/Vite-6.0-646CFF?style=flat-square&logo=vite)
![CSS](https://img.shields.io/badge/CSS-Variables-1572B6?style=flat-square&logo=css3)
![IndexedDB](https://img.shields.io/badge/IndexedDB-idb-F7DF1E?style=flat-square)
![OpenAI](https://img.shields.io/badge/OpenAI-GPT--4-412991?style=flat-square&logo=openai)

</div>

---

## 🎨 设计哲学

<div style="background: #f7f4ed; border: 1px solid #eceae4; border-radius: 12px; padding: 32px; margin: 32px 0; text-align: center;">

> **"玩家不是在经营国家，而是在面对一群有欲望的人，并最终被历史评价。"**
>
> **"系统目标：驱动模拟，而非撰写故事。"**

</div>

游戏以明朝为骨架，保留了内阁制、宦官、党争、边患、税制、科举等历史元素，同时融入道教、工业革命等架空设定，创造了一个复杂而真实的政治生态。

---

## 📝 开发说明

本项目采用AI协作开发模式，所有开发上下文和文档存储在 `ai-context/` 目录中。

### AI开发流程

1. 阅读 `ai-context/docs/AI_DEVELOPER_GUIDE.md` 了解开发指南
2. 查看 `ai-context/docs/06_mvp_scope.md` 了解当前任务
3. 修改代码后同步更新相关文档
4. 使用Git管理版本

### 代码规范

- TypeScript严格模式
- 函数式组件 + Hooks
- CSS-in-JS避免，使用CSS Variables
- 组件单一职责，不超过300行

---

<div align="center">

**皇帝游戏** - 让AI为你创造一个活生生的架空历史世界

<br>

[![GitHub stars](https://img.shields.io/github/stars/akira17189-create/emperorgame?style=social)](https://github.com/akira17189-create/emperorgame/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/akira17189-create/emperorgame?style=social)](https://github.com/akira17189-create/emperorgame/network/members)
[![GitHub issues](https://img.shields.io/github/issues/akira17189-create/emperorgame?style=social)](https://github.com/akira17189-create/emperorgame/issues)

</div>