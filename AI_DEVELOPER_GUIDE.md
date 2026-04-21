**最后更新**: 2026-04-21


## 项目快速了解

### 项目概述
- **名称**: Emperor Game (架空历史放置模拟游戏)
- **技术栈**: Preact + TypeScript + Vite
- **状态**: Phase 3 + 改造计划书v3完成，核心系统完整

### 关键文件位置
1. **应用入口**: `ai-context/src/main.tsx` - 完整的路由和应用逻辑
2. **状态管理**: `ai-context/src/engine/state.ts` - 游戏状态管理
3. **LLM集成**: `ai-context/src/engine/llm.ts` - AI对话集成（3个[改造-Phase4]标记）
4. **存档系统**: `ai-context/src/engine/save.ts` - 游戏存档管理
5. **游戏逻辑**: `ai-context/src/engine/narrator.ts` - 叙事生成核心
6. **政策系统**: `ai-context/src/engine/policy-engine.ts` - 政策系统引擎
7. **事件系统**: `ai-context/src/engine/event-engine.ts` - 事件系统引擎
8. **放置系统**: `ai-context/src/engine/idle-engine.ts` - 放置系统引擎
9. **朝堂页面**: `ai-context/src/ui/CourtPage.tsx` - 朝堂主页面（11个[改造-Phase4]标记）
10. **追问弹窗**: `ai-context/src/ui/components/NpcChatWindow.tsx` - 【新增】NPC追问弹窗
11. **路遇弹窗**: `ai-context/src/ui/components/EncounterChatWindow.tsx` - 【新增】路遇弹窗

### 如何运行
```bash
cd "C:\Users\KSG\Downloads\皇帝游戏\成品"
npm run dev
```
访问: http://localhost:5173

### 开发注意事项
1. 所有页面组件使用 `export function ComponentName()` 而非 `export default`
2. 使用hash路由系统（#/settings, #/court等）
3. 首次加载会检查LLM配置，无配置则跳转到设置页面
4. 游戏状态通过 `getState()` 和 `setState()` 管理
5. 政策系统使用 `policy-engine.ts` 管理22个预设政策
6. 事件系统使用 `event-engine.ts` 管理32个事件
7. 结局系统使用 `ending-engine.ts` 管理多种结局

### 当前优先级
**改造计划书 v3 全部完成 ✅**（2026-04-21）
1. ✅ 新增4个派系NPC（方直、王福全、钱谦、陈德明）
2. ✅ 实现朝会预写主线系统
3. ✅ 实现路遇场景和微服出巡功能
4. ✅ 季节系统文案（春、夏、秋、冬）
5. ✅ 皇室姓氏修正（朱→云）
6. ✅ 新增追问弹窗组件（NpcChatWindow）
7. ✅ 新增路遇弹窗组件（EncounterChatWindow）
8. ✅ LLM函数扩展和全局错误兜底

**Phase 3 全部完成 ✅**（2026-04-19）
1. ✅ 政策系统实现（22个政策）
2. ✅ 世界事件系统（32个事件）
3. ✅ UI/UX优化
4. ✅ 深度叙事集成（DeepSeek生成，DS-10~40）
5. ✅ 派系态度矩阵
6. ✅ 事件选项系统
7. ✅ 结局系统框架

**Phase 3产出**:
- 13个DeepSeek文档（DS-10到DS-40）
- 13个Mimo任务（M-10到M-41）
- 约15万字游戏内容
- 22个预设政策
- 32个世界事件
- 多种结局路径

**改造计划书v3产出**:
- 4个新派系NPC（seed-npcs-phase45.ts）
- 5个朝会议题预写（prewritten-court.ts）
- 15个路遇事件预写（prewritten-encounters.ts）
- 4个季节文案（season-narratives.ts）
- 追问弹窗组件（NpcChatWindow.tsx）
- 路遇弹窗组件（EncounterChatWindow.tsx）
- 追问Prompt模板（npc-chat-window.md）

### Git信息
- 仓库: https://github.com/akira17189-create/emperorgame.git
- 分支: main
- 当前状态: Phase 3完成，核心系统完整，可正常运行


## TODO/FIXME列表

### 已完成项目（Phase 3 - 2026-04-19）
- ✅ `ai-context/src/engine/policy-engine.ts` - 政策系统引擎（22个政策）
- ✅ `ai-context/src/engine/event-engine.ts` - 事件系统引擎（32个事件）
- ✅ `ai-context/src/engine/idle-engine.ts` - 放置系统引擎（政策加成）
- ✅ `ai-context/src/engine/ending-engine.ts` - 结局系统引擎
- ✅ `ai-context/src/ui/PolicyPanel.tsx` - 政策面板UI
- ✅ `ai-context/src/ui/EndingPage.tsx` - 结局页面UI
- ✅ `ai-context/docs/active/DS-10_政策场景描述.md` - 政策描述
- ✅ `ai-context/docs/active/DS-11_政策颁布叙事段落.md` - 政策叙事
- ✅ `ai-context/docs/active/DS-12_NPC反应台词库.md` - NPC反应
- ✅ `ai-context/docs/active/DS-13_派系政策态度矩阵.md` - 派系态度
- ✅ `ai-context/docs/active/DS-20_事件场景描述.md` - 事件描述
- ✅ `ai-context/docs/active/DS-21_事件选项数据结构.json` - 事件选项
- ✅ `ai-context/docs/active/DS-22_选项结局叙事模板.md` - 结局叙事
- ✅ `ai-context/docs/active/DS-23_事件过渡句.md` - 事件过渡
- ✅ `ai-context/docs/active/DS-30_NPC_voice字段补充.md` - NPC语音
- ✅ `ai-context/docs/active/DS-31_命名事件风格示例.md` - 事件风格
- ✅ `ai-context/docs/active/DS-32_官方野史叙事视角规则.md` - 叙事视角
- ✅ `ai-context/docs/active/DS-40_玄明专属场景.md` - 玄明场景

### 已完成项目（Phase 2 - 2026-04-18）
- ✅ `ai-context/src/engine/arbitration.ts` - 多Agent仲裁系统核心实现
- ✅ `ai-context/src/engine/narrator.ts` - 集成仲裁系统，支持多NPC决策
- ✅ `ai-context/src/ui/CourtPage.tsx` - 添加仲裁结果展示UI
- ✅ `ai-context/src/styles/components.css` - 添加仲裁面板样式

### 已完成项目（开场改造 + 放置系统 - 2026-04-19）
- ✅ `ai-context/src/engine/types.ts` - Meta接口新增开场阶段和放置系统字段
- ✅ `ai-context/src/engine/save.ts` - 添加旧存档兼容patch
- ✅ `ai-context/src/engine/idle-config.ts` - 新建放置系统配置常量文件
- ✅ `ai-context/src/engine/idle-engine.ts` - 新建放置系统引擎（计算和应用积累）
- ✅ `ai-context/src/ui/CourtPage.tsx` - 重写实现三阶段开场、放置积累、离线补算、执行面板
- ✅ `ai-context/src/styles/components.css` - 添加开场选项、执行面板、离线通知样式
- ✅ 代码评审修复 - 修复P0/P1/P2共6个问题

### 已完成项目（开场文案集成 - 2026-04-19）
- ✅ `ai-context/src/data/prologue.ts` - 新建开场文案模块（DS-01~08）
- ✅ `ai-context/src/ui/CourtPage.tsx` - 导入并使用开场文案模块
- ✅ DeepSeek文案 - 穿越内心戏398字、国师出场198字、三个选项设计

### TODO项目
- `ai-context/src/engine/save.ts:85` - 实装时需要 @supabase/supabase-js 依赖 + 用户登录流程
- `ai-context/src/engine/skills.ts:18` - 替换为 mimo 生成的技能内容

### Phase 4 规划项目
- 高级叙事系统（Phase 4.1）
- 多结局系统（Phase 4.2）
- 性能优化（Phase 4.3）


## 工作规范与进度同步要求

### 强制性工作流程
每次完成阶段性任务后，**必须**执行以下操作：

#### 1. 更新项目开发文件
- **目的**: 确保项目文档与代码状态一致
- **必须更新的文件**:
  - `ai-context/docs/06_mvp_scope.md` - 更新任务完成状态
  - `ai-context/AI_DEVELOPER_GUIDE.md` - 更新开发注意事项
  - `ai-context/README.md` - 更新项目状态
  - `ai-context/PROJECT_STRUCTURE.md` - 更新项目结构（如有变更）

#### 2. 同步工作进度
- **Git提交**: 每次任务完成后必须提交代码
- **提交信息**: 使用清晰的中文描述，包含任务名称和完成状态
- **推送远程**: 必须推送到 `origin/main` 分支
- **状态同步**: 确保本地与远程仓库同步

#### 3. 更新README和项目架构文件
- **README.md**: 更新项目状态、当前阶段、关键变更
- **PROJECT_STRUCTURE.md**: 更新文件结构、新增/修改的文件
- **AI_DEVELOPER_GUIDE.md**: 更新开发注意事项、TODO列表

### 更新检查清单
完成任务后，检查以下项目：

- [ ] **代码提交**: 所有修改已提交到Git
- [ ] **远程同步**: 代码已推送到远程仓库
- [ ] **文档更新**: 相关文档已更新
- [ ] **状态同步**: 项目状态已同步到所有相关文件
- [ ] **TODO更新**: 如有完成的TODO项，已从列表中移除
- [ ] **架构更新**: 如有架构变更，已更新PROJECT_STRUCTURE.md

### 文件更新优先级
当需要更新多个文件时，按以下优先级进行：

1. **第一优先级**: `06_mvp_scope.md` - 项目进度和任务状态
2. **第二优先级**: `README.md` - 项目整体状态
3. **第三优先级**: `AI_DEVELOPER_GUIDE.md` - 开发注意事项
4. **第四优先级**: `PROJECT_STRUCTURE.md` - 项目结构

### 当前进度同步状态（2026-04-20）

#### 已完成任务
- **Phase 3**: 全部完成 ✅ (2026-04-19)
  - 政策系统实现（22个政策）✅
  - 世界事件系统（32个事件）✅
  - UI/UX优化 ✅
  - 深度叙事集成（DeepSeek生成，DS-10~40）✅
  - 派系态度矩阵 ✅
  - 事件选项系统 ✅
  - 结局系统框架 ✅

#### 当前系统能力
**核心功能**：
- ✅ 多Agent决策仲裁：NPC之间因立场不同产生冲突，系统自动仲裁
- ✅ 完整资源系统：14个资源字段的精确计算和平衡
- ✅ NPC自主行为：基于NPC特质的自动行为触发
- ✅ 动态叙事生成：基于决策和仲裁结果的实时剧情生成
- ✅ 离线演算：玩家离线期间游戏世界自动演化
- ✅ 政策系统：22个预设政策，支持自定义政策，NPC有不同态度反应
- ✅ 世界事件系统：32个事件，基于概率和资源阈值触发
- ✅ 深度叙事集成：DeepSeek生成的高质量叙事内容（DS-10~40）
- ✅ 派系态度矩阵：NPC对政策的复杂态度系统
- ✅ 事件选项系统：多选项事件，不同选择导致不同结局
- ✅ 结局系统：多种结局路径，基于玩家选择和资源状态

**技术实现**：
- ✅ 三层资源架构：Core层（每tick）、Support层（事件触发）、Meta层（状态记录）
- ✅ 防数值爆炸算法：确保游戏平衡性
- ✅ 可配置行为规则：NPC行为规则支持动态配置
- ✅ 变化日志系统：详细记录所有状态变化
- ✅ 政策引擎：管理22个预设政策，支持政策效果计算
- ✅ 事件引擎：管理32个事件，支持概率和阈值触发
- ✅ 结局引擎：管理多种结局路径，支持条件判断

#### 下一阶段规划
- **Phase 4.1**: 高级叙事系统 - 预估3天
- **Phase 4.2**: 多结局系统 - 预估2天
- **Phase 4.3**: 性能优化 - 预估2天