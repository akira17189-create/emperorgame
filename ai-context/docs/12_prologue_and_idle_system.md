---
purpose: 开场改造系统和放置积累系统的详细设计与实现
audience: AI开发参考；人类理解系统设计
last_updated: 2026-04-19
---

# 开场改造 + 放置积累系统

## 1. 系统概述

本系统解决了原有游戏的两个核心问题：

1. **开场体验问题**：视角错位、引导说明出戏、国师缺席、执行面板无入口
2. **放置系统缺失**：无实时被动积累，游戏体验纯回合制，与"放置游戏"定位不符

## 2. 开场三阶段系统

### 2.1 阶段流程

```
[阶段一] 穿越内心戏（纯叙事，无交互）
        ↓
[阶段二] 国师登场 + 引导对话（带选项，限定范围）
        ↓
[阶段三] 执行面板解锁（正式游戏入口）
        ↓
[正式游戏循环] 放置积累持续运行 + 玩家主动 tick 推进剧情
```

### 2.2 状态追踪

**Meta接口新增字段**：

```typescript
interface Meta {
  // 现有字段...

  // 新增：开场阶段追踪
  prologue_phase: 'awakening' | 'guoshi_intro' | 'complete';
  prologue_complete: boolean;

  // 新增：放置系统时间戳
  last_idle_tick_at: string;   // ISO8601，上次放置积累的时间点
}
```

### 2.3 阶段一：穿越内心戏

**触发条件**: `meta.prologue_phase === 'awakening'`

**场景设定**：
- 地点：御花园（非金銮殿/乾清宫）
- 时间：清晨或午后
- 内心戏内容：意识到身体/环境异常，搜索记忆，短暂恐慌，尝试理解，暂时接受

**实现要点**：
- 第一人称内心独白 + 第三人称场景描写混用
- 不超过400字
- 不出现任何游戏机制说明词（Tick、政策、面板等）
- 末尾留白，等待"有人靠近"的感知
- 使用`typewriterEffect`打字机效果渲染，无选项，自动推进至阶段二

### 2.4 阶段二：国师登场与引导对话

**触发条件**: 阶段一完成后自动触发

**国师人设约束**：

| 维度 | 内容 |
|------|------|
| 身份 | 国师玄明，18岁女性伪装男性，道士打扮 |
| 人格状态 | 初次相见触发"天真的道士"人格——日常好奇状态 |
| 对皇帝的感知 | 察觉到皇帝"变了"，但说辞模糊，不挑明 |
| 说话风格 | 神神叨叨，喜欢用反问和暗语，不给直接答案 |
| 目的 | 表面上是来"观星报告"，实际上在试探新皇帝 |
| 禁忌 | 不主动暴露女性身份；不说"穿越"；不直接解释游戏机制 |

**选项设计**：

| 选项 | 内心独白（仅玩家可见） | 显示文字 |
|------|-------------------------------|----------|
| A | （装作什么都没发生） | "无事，朕只是在想些事情。" |
| B | （试探这个神秘的人） | "你觉得朕今日……有何不同？" |
| C | （沉默，打量对方） | [沉默，静静打量] |

三个选项都推进至阶段三，仅国师回应文字不同。

### 2.5 阶段三：执行面板解锁

**触发条件**: 阶段二选项选定后自动触发

**面板结构**：

```
┌─────────────────────────────────────┐
│  陛下，今日如何安排？               │
├─────────────────────────────────────┤
│  📋 临朝听政                        │  → 触发 gameTick（走原有流程）
│  🏯 前往                           │  → 展开地点子菜单
│  👤 召见                           │  → 展开 NPC 列表
│  📜 查阅史册                        │  → 跳转 ChroniclePage
│  📋 颁布政策                        │  → 打开 PolicyPanel
└─────────────────────────────────────┘
```

**地点子菜单**：

| 地点 | 作用 |
|------|------|
| 御花园 | 触发消遣类事件（国师智力对决等） |
| 乾清宫书房 | 处理奏折、查阅情报 |
| 武英殿 | 接见武官、军务相关 |
| 文华殿 | 接见文臣、礼制相关 |
| 内廷 | 宫廷内部事务 |

## 3. 放置积累系统

### 3.1 设计原则

| 原则 | 说明 |
|------|------|
| **双轨并行** | 放置积累（实时微增）与 LLM gameTick（年度宏观推进）完全独立 |
| **轻量嵌入** | 不引入新建筑系统，积累速率由现有 `resources` 和 `policies.active` 决定 |
| **可感知** | 玩家能看到资源数字在缓慢跳动，感受到"帝国在运转" |
| **离线补算** | 关页签再回来，按实际离开时长补发，上限 24 小时 |
| **不破坏叙事** | 放置积累只动基础数字，不生成叙事文本、不触发事件 |

### 3.2 参与放置积累的资源

| 资源字段 | 方向 | 逻辑依据 |
|----------|------|----------|
| `food` | 积累（受 `agri_pop`、`land_fertility` 影响） | 农业人口每天产粮 |
| `fiscal` | 积累（受 `tax_rate`、`commerce` 影响） | 税收和商业每天流入国库 |
| `commerce` | 缓慢积累（基准值，受政策加成） | 市场自然增长 |
| `military` | 消耗（受 `military_cost` 影响） | 军队每天消耗军饷 |
| `population` | 极缓慢积累（固定低速率） | 自然人口增长 |
| `morale` | **不参与** | 由 LLM 叙事驱动 |
| `threat` | **不参与** | 由 LLM 叙事驱动 |
| `faction` | **不参与** | 由 LLM 叙事驱动 |
| `eunuch` | **不参与** | 由 LLM 叙事驱动 |

### 3.3 积累速率公式

**配置文件**: `src/engine/idle-config.ts`

```typescript
// 粮食积累（每分钟）
food_rate = agri_pop * land_fertility * BASE_FOOD_RATE
           + policy_bonus('agriculture')

// 财政积累（每分钟）
fiscal_rate = commerce * tax_rate * BASE_FISCAL_RATE
             + policy_bonus('taxation')

// 军事消耗（每分钟，负值）
military_drain = military_cost * BASE_MILITARY_DRAIN_RATE

// 商业缓增（每分钟）
commerce_rate = commerce * BASE_COMMERCE_GROWTH

// 人口微增（每分钟）
population_rate = population * BASE_POPULATION_GROWTH
```

**上下限保护**：
- `food`、`fiscal`、`military` 不低于 0
- 军费耗尽时 `military` 停止下降，不进入负数

### 3.4 实时积累实现

**文件**: `src/engine/idle-engine.ts`

在 `CourtPage.tsx` 的 `useEffect` 中使用 `setInterval`：

```typescript
const IDLE_INTERVAL_MS = 10_000;

useEffect(() => {
  const timer = setInterval(() => {
    const state = getState();
    if (state.meta.prologue_complete) {
      const rates = calcIdleRates(state);
      applyIdleAccumulation(state, rates, IDLE_INTERVAL_MS / 60_000);

      // 更新时间戳
      setGameState(draft => {
        draft.meta.last_idle_tick_at = new Date().toISOString();
      });
    }
  }, IDLE_INTERVAL_MS);
  return () => clearInterval(timer);
}, []);
```

### 3.5 离线补算实现

**触发时机**: 游戏加载时（`CourtPage` `useEffect` 挂载阶段）

**流程**：

```
1. 读取存档中的 meta.last_idle_tick_at
2. 计算 offlineMs = Date.now() - new Date(last_idle_tick_at).getTime()
3. 上限截断：offlineMs = Math.min(offlineMs, 24 * 60 * 60 * 1000)
4. 换算为分钟数：offlineMins = offlineMs / 60_000
5. 若 offlineMins > 1，执行一次性补算：
   applyIdleAccumulation(calcIdleRates(state), offlineMins)
6. 更新 meta.last_idle_tick_at = new Date().toISOString()
7. 弹出离线收益通知（3秒后自动消失）
```

### 3.6 离线通知文案

不走 LLM，模板字符串直接写死：

```
离开期间（{hours}小时{minutes}分钟），帝国持续运转——
粮仓：+{food_gained} 石　国库：+{fiscal_gained} 两
军费消耗：{military_drained} 两
```

## 4. 文件清单

### 4.1 新增文件

| 文件 | 作用 |
|------|------|
| `src/engine/idle-config.ts` | 放置系统配置常量 |
| `src/engine/idle-engine.ts` | 放置系统引擎（计算和应用积累） |

### 4.2 修改文件

| 文件 | 改动内容 |
|------|----------|
| `src/engine/types.ts` | Meta接口新增三个字段；`createEmptyGameState()` 设初始值 |
| `src/engine/save.ts` | 加载时对缺失字段做兼容 patch |
| `src/ui/CourtPage.tsx` | 三阶段开场状态机；放置积累 setInterval；离线补算；执行面板 |
| `src/styles/components.css` | 新增开场选项、执行面板、离线通知样式 |

### 4.3 未改动文件

`tick.ts`、`event-engine.ts`、`PolicyPanel.tsx`、`ChroniclePage.tsx`、`src/prompts/` 下所有文件。

## 5. 旧存档兼容

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

## 6. 验收标准

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

*文档完成——代码实现已提交，等待DeepSeek文案创作完成后进行联合测试。*
