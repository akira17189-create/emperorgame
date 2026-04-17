
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
1. 完成 `src/engine/narrator.ts` 的游戏逻辑
2. 完善 `src/ui/CourtPage.tsx` 的游戏交互
3. 优化LLM提示词和响应处理

### Git信息
- 仓库: https://github.com/akira17189-create/emperorgame.git
- 分支: main
- 当前状态: 应用可运行，核心框架完整


## TODO/FIXME列表

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
- **Phase 1.1**: narrator.ts JSON解析修复 ✅
- **Phase 1.2**: 技能系统接入 ✅
- **Phase 1.3**: 优化与护栏 ✅
  - Token预算护栏验证 ✅
  - 技能系统整合（32个技能ID）✅
  - 系统测试（10个意图类型100%可用）✅

#### 当前阶段
- **Phase 2**: 核心功能开发（待开始）
  - arbitration.md 完善（多Agent仲裁）
  - tick.ts 实现（离线演算引擎）
  - 资源管理系统

#### Git状态
- **仓库**: https://github.com/akira17189-create/emperorgame.git
- **分支**: main（与远程同步）
- **最新提交**: Phase 2计划已记录并推送

#### 文件同步状态
- [x] `06_mvp_scope.md` - 已更新Phase 2计划
- [x] `README.md` - 已更新项目状态
- [x] `AI_DEVELOPER_GUIDE.md` - 已更新工作规范
- [ ] `PROJECT_STRUCTURE.md` - 待更新（如有结构变更）

### 注意事项
1. **不要新建文件**: 所有更新必须在现有文件中进行
2. **保持一致性**: 确保所有相关文件的状态一致
3. **及时同步**: 完成任务后立即同步，避免遗漏
4. **清晰记录**: 使用清晰的中文描述，便于后续AI理解
5. **向后兼容**: 保持现有功能完整性

---

*工作规范记录时间: 2026年04月18日*
