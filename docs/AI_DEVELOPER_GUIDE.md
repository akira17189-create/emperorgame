
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

