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
│   │   │   ├── arbitration.ts # 多Agent仲裁系统（752行）
│   │   │   ├── narrator.ts    # 叙事生成系统（344行）
│   │   │   ├── tick.ts        # 离线演算引擎（323行）
│   │   │   ├── skills.ts      # 技能路由系统（650行）
│   │   │   ├── state.ts       # 状态管理系统（292行）
│   │   │   ├── llm.ts         # LLM调用封装（141行）
│   │   │   ├── types.ts       # 类型定义（352行）
│   │   │   ├── goals-manager.ts # NPC目标管理系统
│   │   │   ├── state-updater.ts # 状态更新系统
│   │   │   ├── templates.ts   # C档模板系统
│   │   │   ├── save.ts        # 存档系统
│   │   │   └── phases/        # 游戏阶段处理器
│   │   │       ├── arbitration.ts # 仲裁阶段
│   │   │       ├── input.ts       # 输入阶段
│   │   │       ├── narration.ts   # 叙事阶段
│   │   │       └── simulation.ts  # 模拟阶段
│   │   ├── ui/                # 用户界面组件
│   │   │   ├── CourtPage.tsx   # 朝堂页面
│   │   │   ├── ChroniclePage.tsx # 史册页面
│   │   │   ├── NewGamePage.tsx # 新游戏页面
│   │   │   ├── SettingsPage.tsx # 设置页面
│   │   │   ├── SavesPage.tsx   # 存档管理
│   │   │   └── components/    # UI组件库
│   │   ├── prompts/           # AI提示词系统
│   │   │   ├── arbitration.md  # 多Agent仲裁Prompt
│   │   │   ├── narration.md    # 叙事生成Prompt
│   │   │   ├── normalize-command.md # 指令归一化
│   │   │   ├── role-execution.md # 角色执行逻辑
│   │   │   └── layer1-world-rules.md # 世界规则
│   │   ├── data/              # 游戏数据
│   │   │   ├── core-characters.ts # 核心角色数据
│   │   │   ├── seed-npcs.ts   # NPC种子数据
│   │   │   ├── seed-scenario.ts # 场景种子数据
│   │   │   ├── labels.ts      # 标签系统
│   │   │   └── skills-bundle.ts # 技能包
│   │   ├── styles/            # 样式文件
│   │   │   ├── tokens.css     # 设计令牌
│   │   │   ├── base.css       # 基础样式
│   │   │   └── components.css # 组件样式
│   │   └── main.tsx           # 应用入口
│   ├── docs/                  # 工程文档（20+文件）
│   ├── lore/                  # 世界观设定（15+文件）
│   ├── reports/               # 实现报告
│   └── prompts/               # 外部提示词
├── index.html                 # 入口页面
├── package.json               # 项目配置
├── tsconfig.json              # TypeScript配置
├── tsconfig.node.json         # Node.js TypeScript配置
└── vite.config.ts             # Vite构建配置
```

</div>

---

## 🔧 开发状态

### 已完成 ✅

| 阶段 | 功能 | 完成时间 | 状态 |
|------|------|----------|:----:|
| **Phase 1.1** | narrator.ts JSON解析修复 | 2026-04-17 | ✅ |
| **Phase 1.2** | 技能系统接入（32个技能） | 2026-04-17 | ✅ |
| **Phase 1.3** | Token预算护栏、系统测试 | 2026-04-17 | ✅ |
| **Phase 2.1** | 多Agent仲裁系统 | 2026-04-18 | ✅ |
| **Phase 2.2** | 完整资源系统 | 2026-04-18 | ✅ |
| **Phase 2.3** | NPC自主行为系统 | 2026-04-18 | ✅ |
| **开场改造** | 三阶段开场系统 | 2026-04-19 | ✅ |
| **放置系统** | 实时资源积累与离线补算 | 2026-04-19 | ✅ |
| **开场文案** | DeepSeek文案集成 (DS-01~08) | 2026-04-19 | ✅ |
| **Phase 3.1** | 政策系统实现（22个政策） | 2026-04-19 | ✅ |
| **Phase 3.2** | 世界事件系统（32个事件） | 2026-04-19 | ✅ |
| **Phase 3.3** | UI/UX优化 | 2026-04-19 | ✅ |

### 下一阶段规划 📋

| 阶段 | 功能 | 预估工时 | 状态 |
|------|------|----------|:----:|
| **Phase 4.1** | 高级叙事系统 | 3天 | 📋 规划中 |
| **Phase 4.2** | 多结局系统 | 2天 | 📋 规划中 |
| **Phase 4.3** | 性能优化 | 2天 | 📋 规划中 |

### 当前系统能力

**核心功能**：
- ✅ 多Agent决策仲裁：NPC之间因立场不同产生冲突，系统自动仲裁
- ✅ 完整资源系统：14个资源字段的精确计算和平衡
- ✅ NPC自主行为：基于NPC特质的自动行为触发
- ✅ 动态叙事生成：基于决策和仲裁结果的实时剧情生成
- ✅ 离线演算：玩家离线期间游戏世界自动演化
- ✅ 三层资源架构：Core层（每tick）、Support层（事件触发）、Meta层（状态记录）
- ✅ 防数值爆炸算法：确保游戏平衡性
- ✅ 可配置行为规则：NPC行为规则支持动态配置
- ✅ 变化日志系统：详细记录所有状态变化
- ✅ 三阶段开场系统：穿越内心戏 → 国师登场 → 执行面板解锁
- ✅ 放置积累系统：资源实时被动积累，离线补算，政策加成
- ✅ 开场文案系统：DeepSeek创作的正式开场文案（现代白话，无游戏机制词）
- ✅ 政策系统：22个预设政策，支持自定义政策，NPC有不同态度反应
- ✅ 世界事件系统：32个事件，基于概率和资源阈值触发
- ✅ 深度叙事集成：DeepSeek生成的高质量叙事内容（DS-10~40）
- ✅ 派系态度矩阵：NPC对政策的复杂态度系统
- ✅ 事件选项系统：多选项事件，不同选择导致不同结局

---## 🎭 核心玩法

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

## 🏗️ 技术架构

### 运行形态

```
┌──────────────────────────────────────────┐
│         GitHub Pages（纯静态托管）          │
│  ┌────────────────────────────────────┐  │
│  │ index.html + 打包后的 JS / CSS       │  │
│  │ /assets/*  （图位占位目录）          │  │
│  └────────────────────────────────────┘  │
└──────────────────────────────────────────┘
                    │
                    ▼（浏览器运行）
┌──────────────────────────────────────────┐
│ 浏览器端                                    │
│ ├─ GameState（内存）                        │
│ ├─ IndexedDB（存档）                        │
│ ├─ localStorage（llm_config）                │
│ └─ fetch(baseURL + /v1/chat/completions)    │
└──────────────────────────────────────────┘
                    │
                    ▼（玩家自填的 API endpoint）
┌──────────────────────────────────────────┐
│ 任意 OpenAI 兼容的 LLM 服务                  │
└──────────────────────────────────────────┘
```

### 轻量化三档生成

| 档位 | 场景 | 调用方 | 模型 |
|------|------|--------|------|
| **A** | 上朝官员对话、重大事件叙事、史册段落 | `llmCall('A', ...)` | 玩家填的 `modelMain` |
| **B** | 普通奏折、小事件、NPC闲聊、指令归一化 | `llmCall('B', ...)` | 玩家填的 `modelCheap` |
| **C** | 天气、资源日志、代理执政日志、占位对话 | `templates.render(id, vars)` | 本地字符串插值，0 API |

---

## 📚 文档导航

<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 16px; margin: 32px 0;">

<div style="background: #f7f4ed; border: 1px solid #eceae4; border-radius: 12px; padding: 20px;">

### 📊 项目进度
- [开场文案集成报告](ai-context/reports/prologue_integration_report.md)
- [开场改造+放置系统实现报告](ai-context/reports/prologue_and_idle_system_report.md)
- [Phase 2.1 实现报告](ai-context/reports/phase2_1_implementation_report.md)
- [Phase 2.2 实现报告](ai-context/reports/phase2_2_implementation_report.md)
- [Phase 2.3 实现报告](ai-context/reports/phase2_3_implementation_report.md)
- [重构报告](ai-context/reports/refactoring_report.md)

</div>

<div style="background: #f7f4ed; border: 1px solid #eceae4; border-radius: 12px; padding: 20px;">

### 📖 工程文档
- [项目概览](ai-context/docs/00_overview.md)
- [架构设计](ai-context/docs/01_architecture.md)
- [MVP范围](ai-context/docs/06_mvp_scope.md)
- [AI开发指南](ai-context/docs/AI_DEVELOPER_GUIDE.md)
- [Phase 3 开发计划](ai-context/docs/11_phase3_development_plan.md)

</div>

<div style="background: #f7f4ed; border: 1px solid #eceae4; border-radius: 12px; padding: 20px;">

### 🌍 世界观设定
- [核心设定](ai-context/lore/游戏核心设定整合版.md)
- [世界观深化](ai-context/lore/靖朝世界观深化.md)
- [剧情大纲](ai-context/lore/靖朝剧情大纲.md)
- [角色设定](ai-context/lore/角色设定/)

</div>

</div>

### 对于新AI助手

**快速上手指南**：
1. **首先阅读**：[架构设计](ai-context/docs/01_architecture.md) - 了解系统架构
2. **然后查看**：[Phase 4 开发计划](ai-context/docs/active/14_phase4_development_plan.md) - 了解下一步开发方向
3. **参考实现**：查看 `ai-context/reports/` 目录下的实现报告
4. **了解设定**：阅读 `ai-context/lore/` 目录下的世界观文档

**当前系统能力**：
- ✅ 多Agent决策仲裁系统
- ✅ 完整资源管理系统
- ✅ NPC自主行为系统
- ✅ 动态叙事生成系统
- ✅ 离线演算引擎
- ✅ 政策系统（22个政策）
- ✅ 世界事件系统（32个事件）
- ✅ 深度叙事集成（15万字内容）
- ✅ 派系态度矩阵
- ✅ 结局系统框架

---## 🛠️ 技术栈

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
2. 查看 `ai-context/docs/11_phase3_development_plan.md` 了解当前任务
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

</parameter>
<function=end_write_file>
<parameter=brief>完成README.md文件更新</parameter>
</function>
</tool_call>