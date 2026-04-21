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
│   │   │   ├── policy-engine.ts  # 政策系统引擎（22个预设政策）✨Phase3
│   │   │   ├── event-engine.ts   # 世界事件系统引擎（32个事件）✨Phase3
│   │   │   ├── idle-engine.ts    # 放置积累引擎（含政策加成）✨Phase3
│   │   │   ├── ending-engine.ts  # 结局系统引擎（8种结局）✨Phase3
│   │   │   └── phases/           # 游戏阶段处理器
│   │   │       ├── arbitration.ts
│   │   │       ├── input.ts
│   │   │       ├── narration.ts
│   │   │       └── simulation.ts
│   │   ├── ui/                   # 用户界面组件
│   │   │   ├── CourtPage.tsx     # 朝堂主页面
│   │   │   ├── ChroniclePage.tsx # 史册页面
│   │   │   ├── NewGamePage.tsx   # 新游戏页面
│   │   │   ├── SettingsPage.tsx  # 设置页面
│   │   │   ├── SavesPage.tsx     # 存档管理
│   │   │   ├── PolicyPanel.tsx   # 政策面板 ✨Phase3
│   │   │   ├── EndingPage.tsx    # 结局页面 ✨Phase3
│   │   │   └── components/
│   │   │       ├── NpcChatWindow.tsx      # NPC追问弹窗 ✨改造v3
│   │   │       └── EncounterChatWindow.tsx # 路遇弹窗 ✨改造v3
│   │   ├── prompts/              # AI提示词系统
│   │   │   ├── arbitration.md
│   │   │   ├── narration.md
│   │   │   ├── normalize-command.md
│   │   │   ├── role-execution.md
│   │   │   ├── layer1-world-rules.md
│   │   │   └── npc-chat-window.md  # 追问Prompt ✨改造v3
│   │   ├── data/                 # 游戏数据
│   │   │   ├── core-characters.ts
│   │   │   ├── seed-npcs.ts
│   │   │   ├── seed-npcs-phase45.ts    # 派系NPC扩展包 ✨改造v3
│   │   │   ├── seed-scenario.ts
│   │   │   ├── prewritten-court.ts     # 朝会预写议题（5个）✨改造v3
│   │   │   ├── prewritten-encounters.ts # 路遇事件（15个）✨改造v3
│   │   │   ├── season-narratives.ts    # 季节文案（春夏秋冬）✨改造v3
│   │   │   ├── labels.ts
│   │   │   └── skills-bundle.ts
│   │   ├── styles/
│   │   │   ├── tokens.css
│   │   │   ├── base.css
│   │   │   └── components.css
│   │   └── main.tsx              # 应用入口
│   ├── docs/                     # 工程文档（20+文件）
│   ├── lore/                     # 世界观设定（15+文件）
│   ├── reports/                  # 实现报告
│   └── prompts/                  # 外部提示词
├── index.html
├── package.json
├── tsconfig.json
├── tsconfig.node.json
└── vite.config.ts
```

---

## 🔧 开发状态

### 已完成 ✅

| 阶段 | 功能 | 完成时间 | 状态 |
|------|------|----------|------|
| **Phase 1.1** | narrator.ts JSON解析修复 | 2026-04-17 | ✅ |
| **Phase 1.2** | 技能系统接入（32个技能） | 2026-04-17 | ✅ |
| **Phase 1.3** | Token预算护栏、系统测试 | 2026-04-17 | ✅ |
| **Phase 2.1** | 多Agent仲裁系统 | 2026-04-18 | ✅ |
| **Phase 2.2** | 完整资源系统 | 2026-04-18 | ✅ |
| **Phase 2.3** | NPC自主行为系统 | 2026-04-18 | ✅ |
| **开场改造** | 三阶段开场系统 | 2026-04-19 | ✅ |
| **放置系统** | 实时资源积累与离线补算 | 2026-04-19 | ✅ |
| **开场文案** | DeepSeek文案集成（DS-01~08） | 2026-04-19 | ✅ |
| **Phase 3.1** | 政策系统（22个预设政策） | 2026-04-19 | ✅ |
| **Phase 3.2** | 世界事件系统（32个事件） | 2026-04-19 | ✅ |
| **Phase 3.3** | UI/UX优化、深度叙事集成（DS-10~40） | 2026-04-19 | ✅ |
| **Phase 3.4** | 派系态度矩阵、事件选项系统、结局框架 | 2026-04-19 | ✅ |
| **改造v3** | 4个派系NPC、朝会预写主线、路遇场景、季节文案 | 2026-04-21 | ✅ |
| **改造v3** | NpcChatWindow / EncounterChatWindow 组件 | 2026-04-21 | ✅ |
| **改造v3** | 皇室姓氏修正（朱→云）、LLM全局错误兜底 | 2026-04-21 | ✅ |

### 进行中 🚧 — Phase 4：打磨收尾与发布准备

> 详细任务拆解见 [ai-context/docs/active/14_phase4_development_plan.md](ai-context/docs/active/14_phase4_development_plan.md)

| 子阶段 | 目标 | 状态 |
|--------|------|------|
| **4.1** | 遗留Bug修复 + 补全8个预设政策 + 活跃政策面板 | 🚧 进行中 |
| **4.2** | 8种结局完整叙事文案 + 结局触发引擎 | 📋 规划中 |
| **4.3** | NPC党派量化系统 | 📋 规划中 |
| **4.4** | 史册分页、多存档槽、发布测试 | 📋 规划中 |

### 当前系统能力

**已上线核心功能：**

- ✅ 多Agent决策仲裁：NPC因立场不同产生冲突，系统自动仲裁
- ✅ 资源系统：morale / fiscal / military / food / threat / commerce / eunuch / faction 等14个字段
- ✅ NPC自主行为：基于NPC特质的自动行为触发
- ✅ 动态叙事生成：基于决策和仲裁结果的实时剧情生成（200-300字中文叙事）
- ✅ 离线演算：玩家离线期间游戏世界自动演化
- ✅ 三阶段开场：穿越内心戏 → 国师登场 → 执行面板解锁
- ✅ 放置积累：资源实时被动积累、离线补算、政策加成
- ✅ 政策系统：22个预设政策，支持自定义政策，NPC有不同态度反应
- ✅ 世界事件：32个事件，基于概率和资源阈值触发
- ✅ 深度叙事内容：DeepSeek创作约15万字游戏内容（DS-01~40）
- ✅ 朝会预写主线：5个议题的预写剧情，减少LLM冷启动感
- ✅ 路遇 / 微服出巡：15个路遇事件，带专属弹窗
- ✅ 季节系统：四季文案与资源变化
- ✅ 派系NPC扩展：方直、王福全、钱谦、陈德明（4个新NPC）
- ✅ 结局系统框架：8种结局路径，史官口吻评价

---

## 🎭 核心玩法

### 上朝决策流程

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
