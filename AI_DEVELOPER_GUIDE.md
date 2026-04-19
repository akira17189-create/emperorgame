**最后更新**: 2026-04-19


## 项目快速了解

### 项目概述
- **名称**: Emperor Game (架空历史放置模拟游戏)
- **技术栈**: Preact + TypeScript + Vite
- **状态**: 核心框架完成，可正常运行

### 关键文件位置
1. **应用入口**: `src/main.tsx` - 完整的路由和应用逻辑
2. **状态管理**: `src/engine/state.ts` - 游戏状态管理
3. **LLM集成**: `src/engine/llm.ts` - AI对话集成
4. **存档系统**: `src/engine/save.ts` - 游戏存档管理
5. **游戏逻辑**: `src/engine/narrator.ts` - 游戏指令处理（待完善）

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

### 当前优先级
**Phase 2 全部完成 ✅**（2026-04-18）
1. ✅ 多Agent仲裁系统（Phase 2.1）
2. ✅ 完整资源系统（Phase 2.2）
3. ✅ NPC自主行为系统（Phase 2.3）

**开场改造 + 放置系统完成 ✅**（2026-04-19）
1. ✅ 三阶段开场系统（穿越内心戏 → 国师登场 → 执行面板解锁）
2. ✅ 放置积累系统（实时资源积累、离线补算、政策加成）
3. ✅ 旧存档兼容（自动跳过开场，正常离线补算）

**Phase 3 已完成 ✅**（2026-04-19）
1. ✅ 政策系统实现（22个政策）
2. ✅ 世界事件系统（32个事件）
3. ✅ UI/UX优化

**Phase 3产出**:
- 13个DeepSeek文档（DS-10到DS-32）
- 13个Mimo任务（M-10到M-41）
- 约15万字游戏内容

### Git信息
- 仓库: https://github.com/akira17189-create/emperorgame.git
- 分支: main
- 当前状态: 应用可运行，核心框架完整


## TODO/FIXME列表

### 已完成项目（Phase 2.1 - 2026-04-18）
- ✅ `src\engine\arbitration.ts` - 多Agent仲裁系统核心实现
- ✅ `src\engine\narrator.ts` - 集成仲裁系统，支持多NPC决策
- ✅ `src\ui\CourtPage.tsx` - 添加仲裁结果展示UI
- ✅ `src\styles\components.css` - 添加仲裁面板样式

### 已完成项目（开场改造 + 放置系统 - 2026-04-19）
- ✅ `src\engine\types.ts` - Meta接口新增开场阶段和放置系统字段
- ✅ `src\engine\save.ts` - 添加旧存档兼容patch
- ✅ `src\engine\idle-config.ts` - 新建放置系统配置常量文件
- ✅ `src\engine\idle-engine.ts` - 新建放置系统引擎（计算和应用积累）
- ✅ `src\ui\CourtPage.tsx` - 重写实现三阶段开场、放置积累、离线补算、执行面板
- ✅ `src\styles\components.css` - 添加开场选项、执行面板、离线通知样式
- ✅ 代码评审修复 - 修复P0/P1/P2共6个问题

### 已完成项目（开场文案集成 - 2026-04-19）
- ✅ `src\data\prologue.ts` - 新建开场文案模块（DS-01~08）
- ✅ `src\ui\CourtPage.tsx` - 导入并使用开场文案模块
- ✅ DeepSeek文案 - 穿越内心戏398字、国师出场198字、三个选项设计

### TODO项目
- `src\engine\save.ts:85` - 实装时需要 @supabase/supabase-js 依赖 + 用户登录流程
- `src\engine\skills.ts:18` - 替换为 mimo 生成的技能内容

### Phase 3 规划项目
- 政策系统实现（Phase 3.1）
- 世界事件系统（Phase 3.2）
- UI/UX优化（Phase 3.3）

### TODO项目
- `src\engine\save.ts:85` - 实装时需要 @supabase/supabase-js 依赖 + 用户登录流程
- `src\engine\skills.ts:18` - 替换为 mimo 生成的技能内容
- `src\engine\tick.ts:28` - 实现离线演算逻辑
- `src\engine\tick.ts:44` - 实现具体演算逻辑
- `src\engine\tick.ts:55` - 实现NPC行为演算
- `src\engine\tick.ts:84` - 实现批量演算
- `src\engine\tick.ts:106` - 实现资源趋势计算
- `src\engine\tick.ts:122` - 实现游戏结束条件检查
- `src\prompts\arbitration.md:3` - 填入具体内容 -->




## 工作规范与进度同步要求

### 强制性工作流程
每次完成阶段性任务后，**必须**执行以下操作：

#### 1. 更新项目开发文件
- **目的**: 确保项目文档与代码状态一致
- **必须更新的文件**:
  - `ai-context/docs/06_mvp_scope.md` - 更新任务完成状态
  - `ai-context/docs/AI_DEVELOPER_GUIDE.md` - 更新开发注意事项
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

### 当前进度同步状态（2026-04-18）

#### 已完成任务
- **Phase 1.1**: narrator.ts JSON解析修复 ✅ (2026-04-17)
- **Phase 1.2**: 技能系统接入 ✅ (2026-04-17)
  - 32个技能ID完整接入
- **Phase 1.3**: 优化与护栏 ✅ (2026-04-17)
  - Token预算护栏验证 ✅
  - 技能系统整合 ✅
  - 系统测试（10个意图类型100%可用）✅
- **Phase 2.1**: 多Agent仲裁系统 ✅ (2026-04-18)
  - 创建 `src/engine/arbitration.ts`（752行）✅
  - 更新 `src/engine/narrator.ts` 集成仲裁 ✅
  - 更新 `src/ui/CourtPage.tsx` 仲裁结果展示 ✅
  - 更新 `src/styles/components.css` 仲裁面板样式 ✅
- **Phase 2.2**: 完整资源系统 ✅ (2026-04-18)
  - 扩展 `types.ts` 添加 `ResourceRule` 接口 ✅
  - 实现 `applyCompleteResourceRules()` 函数 ✅
  - 处理所有14个Resources字段的计算 ✅
  - 三层架构：Core层、Support层、Meta层 ✅
- **Phase 2.3**: NPC自主行为系统 ✅ (2026-04-18)
  - 扩展 `core-characters.ts` 添加行为规则框架 ✅
  - 实现 `NPCBehaviorRule` 接口 ✅
  - 开发NPC行为触发和效果计算系统 ✅

#### 当前系统能力
**核心功能**：
- ✅ 多Agent决策仲裁：NPC之间因立场不同产生冲突，系统自动仲裁
- ✅ 完整资源系统：14个资源字段的精确计算和平衡
- ✅ NPC自主行为：基于NPC特质的自动行为触发
- ✅ 动态叙事生成：基于决策和仲裁结果的实时剧情生成
- ✅ 离线演算：玩家离线期间游戏世界自动演化

**技术实现**：
- ✅ 三层资源架构：Core层（每tick）、Support层（事件触发）、Meta层（状态记录）
- ✅ 防数值爆炸算法：确保游戏平衡性
- ✅ 可配置行为规则：NPC行为规则支持动态配置
- ✅ 变化日志系统：详细记录所有状态变化

#### 下一阶段规划
- **Phase 3.1**: 政策系统实现 - 预估3天
- **Phase 3.2**: 世界事件系统 - 预估2天
- **Phase 3.3**: UI/UX优化 - 预估3天

