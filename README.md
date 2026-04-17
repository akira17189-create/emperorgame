<div align="center">

# 皇帝游戏

**AI驱动的架空历史放置模拟游戏**

玩家扮演皇帝，通过朝堂决策管理国家。游戏融合了东方仙侠与工业革命元素的独特世界观，NPC有独立思考能力，会因立场不同产生冲突，需要皇帝仲裁。

<br>

<table>
<tr>
<td align="center" style="background-color: #f7f4ed; border: 1px solid #eceae4; border-radius: 12px; padding: 16px 24px;">
<b>TypeScript</b><br>5.6
</td>
<td>&nbsp;&nbsp;</td>
<td align="center" style="background-color: #f7f4ed; border: 1px solid #eceae4; border-radius: 12px; padding: 16px 24px;">
<b>Preact</b><br>10.25
</td>
<td>&nbsp;&nbsp;</td>
<td align="center" style="background-color: #f7f4ed; border: 1px solid #eceae4; border-radius: 12px; padding: 16px 24px;">
<b>Vite</b><br>6.0
</td>
</tr>
</table>

<br>

[快速开始](#快速开始) · [核心特点](#核心特点) · [项目结构](#项目结构) · [开发状态](#开发状态)

</div>

---

## 核心特点

<table>
<tr>
<td width="50%" style="background-color: #f7f4ed; border: 1px solid #eceae4; border-radius: 12px; padding: 24px; vertical-align: top;">

**AI驱动叙事**

基于LLM生成动态剧情，每个NPC有独立人格和记忆。玩家指令会被NPC解读，产生连锁反应。

</td>
<td width="50%" style="background-color: #f7f4ed; border: 1px solid #eceae4; border-radius: 12px; padding: 24px; vertical-align: top;">

**多Agent决策**

NPC之间会因立场不同产生冲突，需要皇帝仲裁。严嵩与海瑞的争论，张居正的改革方案，都由AI实时生成。

</td>
</tr>
<tr><td colspan="2" height="16"></td></tr>
<tr>
<td width="50%" style="background-color: #f7f4ed; border: 1px solid #eceae4; border-radius: 12px; padding: 24px; vertical-align: top;">

**架空历史**

以明朝为骨架，融合道教、工业革命等元素的独特世界观。60年王朝历史，复杂的政治生态。

</td>
<td width="50%" style="background-color: #f7f4ed; border: 1px solid #eceae4; border-radius: 12px; padding: 24px; vertical-align: top;">

**放置模拟**

离线期间游戏世界自动演化，资源和关系实时变化。你的每一个决策都会影响王朝的命运。

</td>
</tr>
</table>

---

## 快速开始

<table style="background-color: #f7f4ed; border: 1px solid #eceae4; border-radius: 12px;">
<tr>
<td style="padding: 24px;">

**环境要求**

- Node.js 18+
- npm 或 yarn

**安装与运行**

```
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

**配置LLM**

1. 进入设置页面（首次自动跳转）
2. 填写API配置：
   - Base URL: API端点地址
   - API Key: 访问密钥
   - Main Model: 主要叙事模型（如GPT-4）
   - Cheap Model: 经济型模型（用于指令归一化）

</td>
</tr>
</table>

---

## 项目结构

<table style="background-color: #f7f4ed; border: 1px solid #eceae4; border-radius: 12px;">
<tr>
<td style="padding: 24px; font-family: monospace; font-size: 14px; line-height: 1.8;">

```
皇帝游戏/
├── ai-context/
│   ├── src/
│   │   ├── engine/           # 核心游戏引擎
│   │   │   ├── narrator.ts    # 叙事生成系统
│   │   │   ├── arbitration.ts # 多Agent仲裁系统
│   │   │   ├── tick.ts        # 离线演算引擎
│   │   │   └── types.ts       # 类型定义
│   │   ├── ui/                # 用户界面组件
│   │   │   ├── CourtPage.tsx   # 朝堂页面
│   │   │   ├── NewGamePage.tsx # 新游戏页面
│   │   │   └── SettingsPage.tsx # 设置页面
│   │   ├── prompts/           # AI提示词系统
│   │   ├── data/              # 游戏数据
│   │   └── styles/            # 样式文件
│   ├── docs/                  # 工程文档
│   └── lore/                  # 世界观设定
├── index.html
├── package.json
└── vite.config.ts
```

</td>
</tr>
</table>

---

## 开发状态

<table style="background-color: #f7f4ed; border: 1px solid #eceae4; border-radius: 12px; width: 100%;">
<tr>
<td style="padding: 24px;">

**已完成**

| 阶段 | 功能 | 状态 |
|------|------|------|
| Phase 1.1 | narrator.ts JSON解析修复 | 已完成 |
| Phase 1.2 | 技能系统接入（32个技能） | 已完成 |
| Phase 1.3 | Token预算护栏、系统测试 | 已完成 |
| Phase 2.1 | 多Agent仲裁系统 | 已完成 |

**进行中**

| 阶段 | 功能 | 预估工时 | 状态 |
|------|------|----------|------|
| Phase 2.2 | tick.ts 离线演算引擎 | 3天 | 待开始 |
| Phase 2.3 | 资源管理系统 | 2天 | 待开始 |

</td>
</tr>
</table>

---

## 核心玩法

<table style="background-color: #f7f4ed; border: 1px solid #eceae4; border-radius: 12px; width: 100%;">
<tr>
<td style="padding: 24px;">

**上朝决策流程**

```
玩家输入指令 → 指令归一化 → NPC决策生成 → 冲突检测 → 多Agent仲裁 → 叙事生成 → 史册写入
```

**游戏循环**

```
上朝 → 决策 → 政策制定 → 放置运行 → 查看史册 → 再介入
```

**核心机制**

1. **指令归一化**: 将玩家自然语言指令转换为结构化意图
2. **NPC决策**: 每个NPC基于人格特质、立场、记忆生成独立决策
3. **冲突仲裁**: 当NPC立场对立时，系统自动触发多Agent仲裁
4. **叙事生成**: 基于决策和仲裁结果生成200-300字中文叙事
5. **史册记录**: 所有事件自动记录到史册，可随时查看

</td>
</tr>
</table>

---

## 文档导航

<table>
<tr>
<td width="50%" style="background-color: #f7f4ed; border: 1px solid #eceae4; border-radius: 12px; padding: 20px; vertical-align: top;">

**工程文档**

- [项目概览](ai-context/docs/00_overview.md)
- [架构设计](ai-context/docs/01_architecture.md)
- [MVP范围](ai-context/docs/06_mvp_scope.md)
- [AI开发指南](ai-context/docs/AI_DEVELOPER_GUIDE.md)

</td>
<td width="50%" style="background-color: #f7f4ed; border: 1px solid #eceae4; border-radius: 12px; padding: 20px; vertical-align: top;">

**世界观设定**

- [核心设定](ai-context/lore/游戏核心设定整合版.md)
- [世界观深化](ai-context/lore/靖朝世界观深化.md)
- [剧情大纲](ai-context/lore/靖朝剧情大纲.md)
- [角色设定](ai-context/lore/角色设定/)

</td>
</tr>
</table>

---

## 技术栈

<table style="background-color: #f7f4ed; border: 1px solid #eceae4; border-radius: 12px;">
<tr>
<td style="padding: 16px 24px;">

TypeScript 5.6

</td>
<td style="padding: 16px 24px;">

Preact 10.25

</td>
<td style="padding: 16px 24px;">

Vite 6.0

</td>
<td style="padding: 16px 24px;">

CSS Variables

</td>
<td style="padding: 16px 24px;">

IndexedDB

</td>
<td style="padding: 16px 24px;">

OpenAI GPT-4

</td>
</tr>
</table>

---

<table style="background-color: #f7f4ed; border: 1px solid #eceae4; border-radius: 12px; width: 100%;">
<tr>
<td style="padding: 32px; text-align: center;">

*"玩家不是在经营国家，而是在面对一群有欲望的人，并最终被历史评价。"*

*"系统目标：驱动模拟，而非撰写故事。"*

</td>
</tr>
</table>

---

<div align="center">

**皇帝游戏** — 让AI为你创造一个活生生的架空历史世界

</div>