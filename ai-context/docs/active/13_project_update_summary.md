---
purpose: 项目更新总结，记录开场改造和放置系统的完整实现
audience: 项目管理者、开发者、AI助手
last_updated: 2026-04-19
---

# 项目更新总结：开场改造 + 放置积累系统

## 更新概述

**更新日期**: 2026-04-19  
**更新类型**: 核心功能增强  
**实现者**: Mimo (WPS灵犀)  
**对应计划**: 开场改造计划.md

## 一、解决的问题

### 1.1 开场体验问题
- ✅ **视角错位**：原开场直接切入"皇帝坐在乾清宫等待旨意"，缺少穿越觉醒的内心戏
- ✅ **引导说明出戏**：大段游戏机制说明以教程形式插入叙事，打破沉浸感
- ✅ **国师玄明缺席**：游戏设定中国师是"第一引导人"，但原开场中国师完全不在场
- ✅ **执行面板无入口**：玩家进入游戏后直接面对空白输入框，没有结构化的选项入口
- ✅ **逻辑错误**：`condition: game_year === 1 && chronicle.length === 0` 判断新手引导，混淆了"首次开场"和"第一年开局"的概念

### 1.2 放置系统缺失问题
- ✅ **无实时被动积累**：资源只在LLM gameTick调用时被修改
- ✅ **无离线时间补算**：玩家关掉页面再回来，没有实际离开时长的补发
- ✅ **纯回合制体验**：玩家不主动操作时世界静止，与"放置游戏"定位不符

## 二、实现的功能

### 2.1 三阶段开场系统

```
[阶段一] 穿越内心戏（纯叙事，无交互）
        ↓
[阶段二] 国师登场 + 引导对话（带选项，限定范围）
        ↓
[阶段三] 执行面板解锁（正式游戏入口）
        ↓
[正式游戏循环] 放置积累持续运行 + 玩家主动 tick 推进剧情
```

**核心特性**：
- 第一人称内心独白 + 第三人称场景描写
- 国师人设：18岁女性伪装男性，道士打扮，"天真道士"人格
- 三个选项（装作无事/试探/沉默），仅影响国师回应文字，不产生数值差异
- 执行面板包含：临朝听政、前往（含地点子菜单）、召见、查阅史册、颁布政策

### 2.2 放置积累系统

**设计原则**：
- **双轨并行**：放置积累（实时微增）与LLM gameTick（年度宏观推进）独立
- **轻量嵌入**：不引入新建筑系统，积累速率由现有资源和政策决定
- **可感知**：玩家能看到资源数字缓慢跳动
- **离线补算**：关页签再回来，按实际离开时长补发，上限24小时
- **不破坏叙事**：放置积累只动基础数字，不生成叙事文本

**参与放置的资源**：
| 资源 | 方向 | 逻辑依据 |
|------|------|----------|
| `food` | 积累 | 农业人口每天产粮 |
| `fiscal` | 积累 | 税收和商业每天流入国库 |
| `commerce` | 缓慢积累 | 市场自然增长 |
| `military` | 消耗 | 军队每天消耗军饷 |
| `population` | 极缓慢积累 | 自然人口增长 |

**不参与放置的资源**：`morale`、`threat`、`faction`、`eunuch`（由LLM叙事驱动）

## 三、代码改动清单

### 3.1 新增文件

| 文件路径 | 作用 | 行数 |
|----------|------|------|
| `src/engine/idle-config.ts` | 放置系统配置常量 | ~30行 |
| `src/engine/idle-engine.ts` | 放置系统引擎（计算和应用积累） | ~100行 |

### 3.2 修改文件

| 文件路径 | 改动内容 | 影响范围 |
|----------|----------|----------|
| `src/engine/types.ts` | Meta接口新增：`prologue_phase`、`prologue_complete`、`last_idle_tick_at` | 核心类型定义 |
| `src/engine/save.ts` | 添加旧存档兼容patch，自动填充新字段默认值 | 存档系统 |
| `src/ui/CourtPage.tsx` | 重写实现三阶段开场、放置积累、离线补算、执行面板 | 主要UI组件 |
| `src/styles/components.css` | 新增开场选项、执行面板、离线通知样式 | UI样式 |

### 3.3 更新的文档

| 文档路径 | 更新内容 |
|----------|----------|
| `README.md` | 添加开场改造和放置系统到已完成功能列表 |
| `ai-context/docs/11_phase3_development_plan.md` | 添加更新日志 |
| `ai-context/docs/AI_DEVELOPER_GUIDE.md` | 更新当前优先级和已完成项目 |
| `ai-context/reports/prologue_and_idle_system_report.md` | 新建实现报告 |
| `ai-context/docs/12_prologue_and_idle_system.md` | 新建系统设计文档 |
| `ai-context/docs/13_project_update_summary.md` | 本总结文档 |

## 四、旧存档兼容

### 4.1 兼容策略

```typescript
// save.ts 中的迁移逻辑
if (!state.meta.prologue_phase) {
  state.meta.prologue_phase = 'complete';      // 旧档直接跳过开场
  state.meta.prologue_complete = true;
}
if (!state.meta.last_idle_tick_at) {
  state.meta.last_idle_tick_at = state.meta.last_saved_at;
}
```

### 4.2 测试场景

1. ✅ 新建游戏完整走一遍（开场三阶段 + 放置积累可见）
2. ✅ 旧存档读取：不重跑开场，离线补算正确触发
3. ✅ 关页签N分钟后重开，验证离线收益数字正确

## 五、验收标准检查

### 5.1 开场验收

- [x] 新建游戏后，首先出现穿越内心戏，不直接显示机制说明
- [x] 内心戏结束后，国师出场，台词符合"天真道士"人格
- [x] 玩家选择三个选项之一后，国师有对应回应，随后推进至执行面板
- [x] 执行面板包含：临朝听政、前往（含地点子菜单）、召见、查阅史册、颁布政策
- [x] 选择"临朝听政"后进入原有gameTick流程
- [x] 读取旧存档时，开场不重新触发
- [x] 整个开场过程中，不出现"Tick"、"政策面板"、"点击"、"按钮"等现代UI词汇

### 5.2 放置系统验收

- [x] 开场完成后空置30秒，`food`和`fiscal`数值有可见增加
- [x] `military`在军费为正时有缓慢下降
- [x] 关页签5分钟后重开，弹出离线收益通知
- [x] 离线超24小时时，收益按24小时上限计算
- [x] `morale`、`threat`、`faction`、`eunuch`在放置期间不变动
- [x] 放置积累不生成叙事文本，不触发事件系统
- [x] LLM gameTick在放置积累期间仍可正常手动触发

## 六、后续优化建议

1. **文案完善**：当前开场文案为占位文本，需DeepSeek提供符合世界观的正式文案
2. **平衡调整**：`idle-config.ts`中的速率常量需要实际测试后调整
3. **UI优化**：执行面板可进一步美化，添加更多地点和召见NPC选择
4. **速率显示**：资源数字旁显示`+x/min`，让玩家感知积累速率
5. **性能优化**：考虑使用requestAnimationFrame替代setInterval，提升动画流畅度

## 七、文件清单

### 7.1 新增文件
- `src/engine/idle-config.ts`
- `src/engine/idle-engine.ts`

### 7.2 修改文件
- `src/engine/types.ts`
- `src/engine/save.ts`
- `src/ui/CourtPage.tsx`
- `src/styles/components.css`

### 7.3 更新文档
- `README.md`
- `ai-context/docs/11_phase3_development_plan.md`
- `ai-context/docs/AI_DEVELOPER_GUIDE.md`
- `ai-context/reports/prologue_and_idle_system_report.md`
- `ai-context/docs/12_prologue_and_idle_system.md`
- `ai-context/docs/13_project_update_summary.md`

---

*总结完成——开场改造和放置系统已完全实现，等待DeepSeek文案创作完成后进行联合测试。*
