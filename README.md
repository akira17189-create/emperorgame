# 🏯 皇帝游戏
**AI驱动的架空历史放置模拟游戏**

一个由AI驱动的架空历史放置模拟游戏，玩家扮演皇帝，通过朝堂决策管理国家。

游戏基于虚构的「**靖朝**」架空历史世界，融合东方仙侠与工业革命元素，NPC有独立思考能力，会因立场不同产生冲突，需要皇帝仲裁。

[快速开始](#-快速开始) • [核心特点](#-核心特点) • [项目结构](#-项目结构) • [开发状态](#-开发状态) • [文档](#-文档导航)

---

## ✨ 核心特点

### 🎭 AI驱动叙事
基于LLM生成动态剧情，每个NPC有独立人格和记忆。玩家指令会被NPC解读，产生连锁反应。

### ⚔️ 多Agent决策
NPC之间会因立场不同产生冲突，需要皇帝仲裁。清流与阉党的博弈、改革派与守旧派的对立，都由AI实时生成。

### 🌍 架空历史 — 靖朝
以「靖朝」为舞台，保留内阁制、宦官、党争、边患、税制等元素，同时融入道教仙侠与工业革命架空设定。**所有人物、事件、地名均为虚构创作，与现实历史无关。**

### ⏳ 放置模拟（60年王朝周期）
离线期间游戏世界自动演化，资源和关系实时变化。王朝寿命最长约60年，期间的每一个决策都将影响最终结局评价。

### 📜 结局系统
8种结局路径（盛世中兴 / 仁君薨逝 / 亡于内乱 / 外敌倾覆 / 宦官专权 / 工业革命开创者 / 仙道误国 / 平庸守成），由史官口吻盖棺定论。

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

访问：http://localhost:5173

### 配置 LLM

进入设置页面（首次启动自动跳转），填写以下配置：

| 字段 | 说明 | 推荐值 |
|------|------|--------|
| Base URL | API 端点地址 | `https://api.deepseek.com` 或 OpenAI 兼容地址 |
| API Key | 访问密钥 | 对应服务商的 key |
| Main Model | 主叙事模型（A档，用于剧情生成） | `deepseek-chat` / `gpt-4o` |
| Cheap Model | 经济型模型（B档，用于指令归一化） | `deepseek-chat` / `gpt-4o-mini` |

> 游戏支持任意 OpenAI 兼容接口，已验证可用：DeepSeek、OpenAI GPT-4系列。

---

## 📁 项目结构

```
皇帝游戏/
├── ai-context/                    # AI开发上下文和源代码
│   ├── src/                      # 源代码目录
│   │   ├── engine/               # 核心游戏引擎
│   │   │   ├── arbitration.ts    # 多Agent仲裁系统（752行）
│   │   │   ├── narrator.ts       # 叙事生成系统（344行）
│   │   │   ├── tick.ts           # 离线演算引擎（323行）
│   │   │   ├── skills.ts         # 技能路由系统（650行，32个技能）
│   │   │   ├── state.ts          # 状态管理系统（292行）
│   │   │   ├── llm.ts            # LLM调用封装
│   │   │   ├── types.ts          # 类型定义（352行）
│   │   │   ├── goals-manager.ts  # NPC目标管理系统
│   │   │   ├── state-updater.ts  # 状态更新系统
│   │   │   ├── templates.ts      # C档模板系统（零API调用）
│   │   │   ├── save.ts           # 存档系统
│   │   │   ├── policy-engine.ts  # 政策系统引擎（25个预设政策）✨Phase4
│   │   │   ├── event-engine.ts   # 世界事件系统（32个事件）✨Phase3
│   │   │   ├── ending-engine.ts  # 结局触发引擎（8种结局）✨Phase4
│   │   │   ├── idle-engine.ts    # 放置积累引擎 ✨Phase3
│   │   │   ├── idle-config.ts    # 放置系统配置 ✨Phase3
│   │   │   ├── lore-bridge.ts    # 派系行为准则与氛围词库 ✨Phase4
│   │   │   ├── emperor-stats.ts  # 皇帝属性系统 ✨Phase3
│   │   │   └── prologue.ts       # 三阶段开场系统 ✨Phase3
│   │   ├── ui/                   # 用户界面组件
│   │   │   ├── CourtPage.tsx     # 朝堂主页面（600+行）✨Phase4更新
│   │   │   ├── PolicyPanel.tsx   # 政策面板（3个Tab）✨Phase4
│   │   │   ├── EmperorPanel.tsx  # 皇帝面板 ✨Phase3
│   │   │   ├── EndingPage.tsx    # 结局页面 ✨Phase4
│   │   │   ├── SettingsPage.tsx  # 设置页面
│   │   │   ├── ChroniclePage.tsx # 史册页面（分页）✨Phase4
│   │   │   ├── Navbar.tsx        # 导航栏组件 ✨Phase3
│   │   │   ├── Toast.tsx         # 提示组件 ✨Phase3
│   │   │   ├── ChronicleEntry.tsx # 史册条目组件 ✨Phase3
│   │   │   ├── VisualSlot.tsx    # 存档槽组件 ✨Phase4
│   │   │   ├── LoadingShimmer.tsx # 加载动画组件 ✨Phase3
│   │   │   └── components/       # 通用组件
│   │   │       ├── NpcCard.tsx   # NPC卡片（含派系显示）✨Phase4
│   │   │       ├── NpcChatWindow.tsx # NPC对话窗口 ✨改造v3
│   │   │       └── EncounterChatWindow.tsx # 路遇对话窗口 ✨改造v3
│   │   ├── data/                 # 数据文件
│   │   │   ├── prologue.ts       # 开场文案（8段）✨Phase3
│   │   │   ├── policies.ts       # 政策预设库（25个）✨Phase4
│   │   │   ├── court-agendas.ts  # 朝会议题库（5个）✨改造v3
│   │   │   ├── encounters.ts     # 路遇事件库（15个）✨改造v3
│   │   │   ├── seasons.ts        # 季节文案库（4季）✨改造v3
│   │   │   └── lore-bridge.ts    # 派系行为准则与氛围词库 ✨Phase4
│   │   └── router.tsx            # 路由配置
│   ├── docs/                     # 工程文档
│   ├── lore/                     # 世界观设定
│   ├── reports/                  # 开发报告
│   └── docs/temp/                # 临时文档
├── .github/                      # GitHub配置
│   └── workflows/                # CI/CD工作流
│       └── deploy.yml            # 自动部署到GitHub Pages ✨Phase4
├── index.html                    # 入口HTML
├── package.json                  # 项目依赖
├── tsconfig.json                 # TypeScript配置
├── tsconfig.node.json            # Node TypeScript配置
└── vite.config.ts                # Vite构建配置
```
玩家输入指令 → 指令归一化(B档) → NPC决策生成 → 冲突检测 → 多Agent仲裁 → 叙事生成(A档) → 史册写入
```

### 游戏循环

```
上朝 → 决策 → 政策制定 → 放置运行 → 查看史册 → 再介入 → （约60年后）触发结局
```

### 资源系统

| 资源 | 说明 |
|------|------|
| `morale` | 民心 |
| `fiscal` | 国库 |
| `military` | 军力 |
| `food` | 粮食 |
| `threat` | 威胁（越高越危险） |
| `commerce` | 商业 |
| `eunuch` | 宦官势力 |
| `faction` | 党争烈度 |

### 轻量化三档生成

| 档位 | 场景 | 模型 |
|------|------|------|
| **A** | 上朝叙事、重大事件、史册段落 | 玩家配置的 `Main Model` |
| **B** | 普通奏折、小事件、指令归一化 | 玩家配置的 `Cheap Model` |
| **C** | 天气、资源日志、占位对话 | 本地字符串模板，零API调用 |

---

## 🏗️ 技术架构

### 运行形态

```
┌──────────────────────────────────────────┐
│        GitHub Pages（纯静态托管）          │
│  ┌──────────────────────────────────┐    │
│  │  index.html + 打包后的 JS / CSS   │    │
│  └──────────────────────────────────┘    │
└──────────────────────────────────────────┘
                    │ 浏览器运行
                    ▼
┌──────────────────────────────────────────┐
│  浏览器端                                  │
│  ├─ GameState（内存）                      │
│  ├─ IndexedDB（存档）                      │
│  ├─ localStorage（llm_config）             │
│  └─ fetch(baseURL + /v1/chat/completions) │
└──────────────────────────────────────────┘
                    │ 玩家自填的 API endpoint
                    ▼
┌──────────────────────────────────────────┐
│  任意 OpenAI 兼容的 LLM 服务               │
└──────────────────────────────────────────┘
```

---

## 📚 文档导航

### 📊 项目进度

- [改造v3 完成报告](ai-context/docs/active/phase3_mimo_completion_report.md)
- [开场集成报告](ai-context/reports/prologue_integration_report.md)
- [开场改造+放置系统实现报告](ai-context/reports/prologue_and_idle_system_report.md)
- [Phase 2.1 实现报告](ai-context/reports/phase2_1_implementation_report.md)
- [Phase 2.2 实现报告](ai-context/reports/phase2_2_implementation_report.md)
- [Phase 2.3 实现报告](ai-context/reports/phase2_3_implementation_report.md)
- [重构报告](ai-context/reports/refactoring_report.md)

### 📖 工程文档

- [项目概览](ai-context/docs/00_overview.md)
- [架构设计](ai-context/docs/01_architecture.md)
- [MVP范围](ai-context/docs/06_mvp_scope.md)
- [AI开发指南](ai-context/docs/AI_DEVELOPER_GUIDE.md)
- **[Phase 4 开发计划](ai-context/docs/active/14_phase4_development_plan.md)** ← 当前任务

### 🌍 世界观设定（靖朝）

- [游戏核心设定整合版](ai-context/lore/游戏核心设定整合版.md)
- [靖朝世界观深化](ai-context/lore/靖朝世界观深化.md)
- [靖朝剧情大纲](ai-context/lore/靖朝剧情大纲.md)
- [角色设定](ai-context/lore/角色设定/)

### 🤖 对于新 AI 助手

**快速上手顺序：**

1. 阅读 [AI_DEVELOPER_GUIDE.md](ai-context/docs/AI_DEVELOPER_GUIDE.md) — 项目状态与开发规范
2. 查看 [14_phase4_development_plan.md](ai-context/docs/active/14_phase4_development_plan.md) — 当前待办任务
3. 参考 [CONTEXT_PACKS.md](CONTEXT_PACKS.md) — 按任务类型选择需要读取的文件包
4. 了解世界观：阅读 `ai-context/lore/游戏核心设定整合版.md`

---

## 🛠️ 技术栈

- **前端框架**：Preact + TypeScript
- **构建工具**：Vite
- **路由**：Hash路由（`#/court`、`#/settings` 等）
- **存储**：IndexedDB（存档）+ localStorage（配置）
- **LLM 接入**：OpenAI 兼容接口，支持 DeepSeek / GPT-4 等

## 🎨 设计哲学

> **"玩家不是在经营国家，而是在面对一群有欲望的人，并最终被历史评价。"**

> **"系统目标：驱动模拟，而非撰写故事。"**

游戏以「靖朝」这一架空世界为舞台，保留了内阁制、宦官、党争、边患、税制、科举等历史元素，同时融入道教仙侠与工业革命架空设定，创造了一个复杂而真实的政治生态。

---

## 📝 开发说明

本项目采用 AI 协作开发模式（DeepSeek 负责创作/文案，Mimo 负责代码实现），所有开发上下文和文档存储在 `ai-context/` 目录中。

### 代码规范

- TypeScript 严格模式
- 函数式组件 + Hooks
- CSS Variables（避免 CSS-in-JS）
- 组件单一职责，不超过 300 行
- 所有页面组件使用具名导出（`export function ComponentName()`）

---

**皇帝游戏** — 让AI为你创造一个活生生的架空历史世界
