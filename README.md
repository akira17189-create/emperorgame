# 皇帝游戏 - AI驱动的架空历史放置模拟

一个由AI驱动的架空历史放置模拟游戏，玩家扮演皇帝，通过朝堂决策管理国家。

## 🎮 游戏特点

- **AI驱动叙事**: 基于LLM生成动态剧情，NPC有独立思考能力
- **多Agent决策**: NPC之间会因立场不同产生冲突，需要皇帝仲裁
- **架空历史**: 融合东方仙侠与工业革命元素的独特世界观
- **放置模拟**: 离线期间游戏世界自动演化

## 🚀 快速开始

```
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build
```

## 📁 项目结构

```
皇帝游戏/
├── ai-context/             # AI开发上下文和源代码
│   ├── src/               # 源代码
│   │   ├── engine/        # 核心引擎
│   │   │   ├── narrator.ts     # 叙事生成系统
│   │   │   ├── arbitration.ts  # 多Agent仲裁系统
│   │   │   ├── tick.ts         # 离线演算引擎
│   │   │   └── skills.ts       # 技能系统
│   │   ├── ui/            # 用户界面
│   │   │   ├── CourtPage.tsx   # 朝堂页面
│   │   │   ├── NewGamePage.tsx # 新游戏页面
│   │   │   └── ...             # 其他页面组件
│   │   ├── prompts/       # AI提示词
│   │   ├── data/          # 游戏数据
│   │   └── styles/        # 样式文件
│   ├── docs/              # 工程文档
│   └── lore/              # 世界观设定
├── index.html             # 入口页面
├── package.json           # 项目配置
├── vite.config.ts         # 构建配置
└── README.md              # 项目说明
```

## 🔧 开发状态

### 已完成 ✅
- **Phase 1.1**: narrator.ts JSON解析修复
- **Phase 1.2**: 技能系统接入（32个技能）
- **Phase 1.3**: Token预算护栏、系统测试
- **Phase 2.1**: 多Agent仲裁系统

### 进行中 ⏳
- **Phase 2.2**: tick.ts 离线演算引擎
- **Phase 2.3**: 资源管理系统

## 📚 文档

- **[工程文档](ai-context/docs/)** - 架构设计、开发指南
- **[世界观设定](ai-context/lore/)** - 游戏背景、角色设定
- **[AI开发指南](ai-context/docs/AI_DEVELOPER_GUIDE.md)** - AI协作开发说明

## 🛠️ 技术栈

- **前端框架**: Preact + TypeScript
- **构建工具**: Vite
- **样式**: CSS Variables + 响应式设计
- **AI集成**: OpenAI GPT-4 API

## 📝 开发说明

本项目采用AI协作开发模式，所有开发上下文和文档存储在 `ai-context/` 目录中。

### AI开发流程
1. 阅读 `ai-context/docs/AI_DEVELOPER_GUIDE.md` 了解开发指南
2. 查看 `ai-context/docs/06_mvp_scope.md` 了解当前任务
3. 修改代码后同步更新相关文档
4. 使用Git管理版本

---

*皇帝游戏 - 让AI为你创造一个活生生的架空历史世界*