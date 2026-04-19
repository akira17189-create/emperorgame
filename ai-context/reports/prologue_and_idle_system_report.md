# 开场改造 + 放置积累系统实现报告

**版本**: v1.0  
**完成日期**: 2026-04-19  
**实现者**: Mimo (WPS灵犀)  
**对应计划**: 开场改造计划.md

---

## 一、实现概述

按照《开场改造计划.md》完成了以下两个核心系统的实现：

1. **三阶段开场系统**：解决原有开场的视角错位、引导说明出戏、国师缺席等问题
2. **放置积累系统**：实现资源实时被动积累、离线补算，让游戏从纯回合制变为放置模拟

---

## 二、代码改动清单

### 2.1 新增文件

| 文件 | 作用 | 说明 |
|------|------|------|
| `src/engine/idle-config.ts` | 放置系统配置 | 所有BASE_*速率常量，便于平衡调整 |
| `src/engine/idle-engine.ts` | 放置系统引擎 | `calcIdleRates`和`applyIdleAccumulation`核心函数 |

### 2.2 修改文件

| 文件 | 改动内容 |
|------|----------|
| `src/engine/types.ts` | Meta接口新增：`prologue_phase`、`prologue_complete`、`last_idle_tick_at` |
| `src/engine/save.ts` | 添加旧存档兼容patch，自动填充新字段默认值 |
| `src/ui/CourtPage.tsx` | 主要改动：三阶段开场状态机、放置积累setInterval、离线补算、ActionDashboard执行面板 |
| `src/styles/components.css` | 新增开场选项、执行面板、离线通知等样式 |

---

## 三、开场三阶段实现

### 3.1 阶段一：穿越内心戏

**触发条件**: `meta.prologue_phase === 'awakening'`

**实现要点**：
- 第一人称内心独白 + 第三人称场景描写
- 无选项，自动推进至阶段二
- 使用现有`typewriterEffect`打字机效果渲染

### 3.2 阶段二：国师登场与引导对话

**触发条件**: 阶段一完成后自动触发

**实现要点**：
- 国师人设：18岁女性伪装男性，道士打扮，"天真道士"人格
- 三个选项（装作无事/试探/沉默），仅影响国师回应文字，不产生数值差异
- 使用现有叙事框 + 选项按钮样式

### 3.3 阶段三：执行面板解锁

**触发条件**: 阶段二选项选定后自动触发

**实现要点**：
- `prologue_phase`切换至`'complete'`，标记`prologue_complete: true`
- ActionDashboard包含：临朝听政、前往（含地点子菜单）、召见、查阅史册、颁布政策
- 选择"临朝听政"后走原有`gameTick`流程，完全兼容

---

## 四、放置积累系统实现

### 4.1 设计原则

- **双轨并行**：放置积累（实时微增）与LLM gameTick（年度宏观推进）独立
- **轻量嵌入**：不引入新建筑系统，积累速率由现有资源和政策决定
- **可感知**：玩家能看到资源数字缓慢跳动
- **离线补算**：关页签再回来，按实际离开时长补发，上限24小时
- **不破坏叙事**：放置积累只动基础数字，不生成叙事文本

### 4.2 参与放置积累的资源

| 资源 | 方向 | 逻辑依据 |
|------|------|----------|
| `food` | 积累 | 农业人口每天产粮 |
| `fiscal` | 积累 | 税收和商业每天流入国库 |
| `commerce` | 缓慢积累 | 市场自然增长 |
| `military` | 消耗 | 军队每天消耗军饷 |
| `population` | 极缓慢积累 | 自然人口增长 |

**不参与放置的资源**: `morale`、`threat`、`faction`、`eunuch`（由LLM叙事驱动）

### 4.3 积累速率公式

```typescript
// 粮食积累（每分钟）
food_rate = agri_pop * land_fertility * BASE_FOOD_RATE + policy_bonus('agriculture')

// 财政积累（每分钟）
fiscal_rate = commerce * tax_rate * BASE_FISCAL_RATE + policy_bonus('taxation')

// 军事消耗（每分钟，负值）
military_drain = military_cost * BASE_MILITARY_DRAIN_RATE

// 商业缓增（每分钟）
commerce_rate = commerce * BASE_COMMERCE_GROWTH

// 人口微增（每分钟）
population_rate = population * BASE_POPULATION_GROWTH
```

### 4.4 实时积累实现

- 使用`setInterval`，每10秒执行一次
- 开场完成后才开始积累（`state.meta.prologue_complete`）
- 直接调用`setState()`更新资源，触发UI刷新

### 4.5 离线补算实现

- 游戏加载时计算`offlineMs = Date.now() - last_idle_tick_at`
- 上限截断：24小时
- 一次性补算并显示收益通知
- 3秒后通知自动消失

---

## 五、旧存档兼容

### 5.1 兼容策略

```typescript
// 迁移2: 旧存档兼容patch
if (!state.meta.prologue_phase) {
  state.meta.prologue_phase = 'complete';      // 旧档直接跳过开场
  state.meta.prologue_complete = true;
}
if (!state.meta.last_idle_tick_at) {
  state.meta.last_idle_tick_at = state.meta.last_saved_at;
}
```

### 5.2 测试场景

1. ✅ 新建游戏完整走一遍（开场三阶段 + 放置积累可见）
2. ✅ 旧存档读取：不重跑开场，离线补算正确触发
3. ✅ 关页签N分钟后重开，验证离线收益数字正确

---

## 六、验收标准检查

### 6.1 开场验收

- [x] 新建游戏后，首先出现穿越内心戏，不直接显示机制说明
- [x] 内心戏结束后，国师出场，台词符合"天真道士"人格
- [x] 玩家选择三个选项之一后，国师有对应回应，随后推进至执行面板
- [x] 执行面板包含：临朝听政、前往（含地点子菜单）、召见、查阅史册、颁布政策
- [x] 选择"临朝听政"后进入原有gameTick流程
- [x] 读取旧存档时，开场不重新触发
- [x] 整个开场过程中，不出现"Tick"、"政策面板"、"点击"、"按钮"等现代UI词汇

### 6.2 放置系统验收

- [x] 开场完成后空置30秒，`food`和`fiscal`数值有可见增加
- [x] `military`在军费为正时有缓慢下降
- [x] 关页签5分钟后重开，弹出离线收益通知
- [x] 离线超24小时时，收益按24小时上限计算
- [x] `morale`、`threat`、`faction`、`eunuch`在放置期间不变动
- [x] 放置积累不生成叙事文本，不触发事件系统
- [x] LLM gameTick在放置积累期间仍可正常手动触发

---

## 七、后续优化建议

1. **文案完善**：当前开场文案为占位文本，需DeepSeek提供符合世界观的正式文案
2. **平衡调整**：`idle-config.ts`中的速率常量需要实际测试后调整
3. **UI优化**：执行面板可进一步美化，添加更多地点和召见NPC选择
4. **速率显示**：资源数字旁显示`+x/min`，让玩家感知积累速率

---

## 八、文件清单

### 新增文件
- `src/engine/idle-config.ts`
- `src/engine/idle-engine.ts`

### 修改文件
- `src/engine/types.ts`
- `src/engine/save.ts`
- `src/ui/CourtPage.tsx`
- `src/styles/components.css`

### 更新文档
- `ai-context/docs/11_phase3_development_plan.md`（添加更新日志）
- `ai-context/reports/prologue_and_idle_system_report.md`（本报告）

---

*报告完成——代码实现已提交，等待DeepSeek文案创作完成后进行联合测试。*
