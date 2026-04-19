# Phase 2.1 执行指令（给 mimo）✅ 已完成

**完成日期**: 2026-04-18  
**完成状态**: ✅ 已完成  
**实现报告**: [查看Phase 2.1实现报告](phase2_1_implementation_report.md)

**Phase 2.2 也已完成**: [查看Phase 2.2实现报告](phase2_2_implementation_report.md)

**Phase 2.3 也已完成**: [查看Phase 2.3实现报告](phase2_3_implementation_report.md)

---





# Phase 2.1 执行指令（给 mimo）

**目标**：实现最小可运行的 Tick 系统（Phase 2.1）

## 严格限制（必须遵守）

1. **不允许重写现有文件结构**
   - 不改 GameState 结构
   - 不改函数签名
   - 只允许新增函数 + 在现有流程中调用

2. **tick.ts 只做"机制实现"，不做"规则定义"**
   - 行为规则必须可配置（不可写死）
   - 所有规则通过数据结构传入

3. **UI 暂不扩展（只允许最小修改）**
   - 不实现43字段展示
   - 仅保证数值变化可被 console.log 或简单UI看到

---

## 需要完成

### 【1】tick.ts（核心）

- 实现 `executeTick(state)`
- 拆分为：
  - `applyTimeEvolution`
  - `applyCoreResourceRules`（只处理6个核心资源）
  - `applyNpcBehaviors`（读取外部规则）
- 所有数值必须使用 clamp

### 【2】state.ts

- 添加 `applyChanges(state, changes[])`
- 添加 change log 记录（用于调试）

### 【3】types.ts

- 定义：
  - `TickContext`
  - `ChangeLog`
  - `NPCBehaviorRule`（关键）

### 【4】NPC行为系统（最小实现）

- 只实现2条规则（不要7条）：
  - loyalty 高 → 上奏
  - greed 高 → 贪腐
- 规则写成"可扩展结构"，不是硬编码

---

## 验收标准

- 执行一次 tick：
  - 6个核心资源发生变化
  - 数值不会溢出
  - NPC会触发至少一种行为
- 代码结构清晰，可扩展

---

## 允许修改的文件

1. `src/engine/tick.ts` - 在现有结构上补充函数
2. `src/engine/state.ts` - 添加批量更新和change log
3. `src/engine/types.ts` - 添加新类型定义
4. `src/data/core-characters.ts` - 添加NPC行为规则定义

## 不允许修改的文件

1. `src/engine/types.ts` 中的 GameState 接口（不改结构）
2. `src/engine/tick.ts` 中的 executeTick 函数签名（不改签名）
3. 所有UI文件（暂不修改）
4. 所有prompt文件（暂不修改）

---

## 具体实现要求

### tick.ts 实现

```typescript
// 在现有executeTick函数内添加调用
export function executeTick(state: GameState, options: TickOptions = {}): TickResult {
  const newState = JSON.parse(JSON.stringify(state)) as GameState;
  const events: string[] = [];
  const warnings: string[] = [];
  
  // 1. 时间推进
  applyTimeEvolution(newState);
  
  // 2. 核心资源规则（只处理6个核心资源）
  applyCoreResourceRules(newState.resources);
  
  // 3. NPC行为（从外部读取规则）
  applyNpcBehaviors(newState.npcs, newState, npcBehaviorRules);
  
  // 4. 收集日志
  const logs = collectChangeLogs();
  
  return {
    success: true,
    newState,
    events,
    warnings
  };
}

// 新增子函数
function applyTimeEvolution(state: GameState): void {
  state.world.year += 1;
  state.emperor.age += 1;
  state.world.weather_this_year = Math.random();
}

function applyCoreResourceRules(resources: Resources): void {
  // 只处理6个核心资源：food, population, fiscal, military, morale, threat
  resources.food = clamp(
    resources.food + (resources.agri_pop * resources.land_fertility * 0.2 - resources.population * 0.05),
    0, 10000
  );
  
  resources.population = clamp(
    resources.population + (resources.morale - 50) * 0.1,
    0, 100000
  );
  
  resources.fiscal = clamp(
    resources.fiscal + (resources.tax_rate * resources.population * 0.12 - resources.military_cost - resources.disaster_relief),
    0, 100000
  );
  
  resources.military = clamp(
    resources.military - (resources.threat * 0.5),
    0, 10000
  );
  
  resources.morale = clamp(
    resources.morale + (100 - resources.tax_rate * 200 - resources.faction * 0.5) * 0.1,
    0, 100
  );
  
  resources.threat = clamp(
    resources.threat + 2 + (100 - resources.military) * 0.05,
    0, 100
  );
}

function applyNpcBehaviors(npcs: NPC[], state: GameState, rules: NPCBehaviorRule[]): void {
  rules.forEach(rule => {
    npcs.forEach(npc => {
      if (rule.condition(npc, state)) {
        const changes = rule.effect(npc, state);
        // 应用changes到state
        applyChanges(state, changes);
      }
    });
  });
}
```

### types.ts 实现

```typescript
// 添加新类型
export interface TickContext {
  year: number;
  season: string;
  weather: number;
}

export interface ChangeLog {
  timestamp: number;
  field: string;
  oldValue: number;
  newValue: number;
  reason: string;
}

export interface NPCBehaviorRule {
  id: string;
  condition: (npc: NPC, state: GameState) => boolean;
  effect: (npc: NPC, state: GameState) => ChangeSet;
}

export interface ChangeSet {
  resources?: Partial<Resources>;
  emperor?: Partial<Emperor>;
  world?: Partial<World>;
  npcs?: Record<string, Partial<NPC>>;
}
```

### state.ts 实现

```typescript
// 添加applyChanges函数
export function applyChanges(state: GameState, changes: ChangeSet): void {
  if (changes.resources) {
    Object.assign(state.resources, changes.resources);
  }
  if (changes.emperor) {
    Object.assign(state.emperor, changes.emperor);
  }
  if (changes.world) {
    Object.assign(state.world, changes.world);
  }
  if (changes.npcs) {
    Object.entries(changes.npcs).forEach(([npcId, npcChanges]) => {
      const npc = state.npcs.find(n => n.id === npcId);
      if (npc) {
        Object.assign(npc, npcChanges);
      }
    });
  }
}

// 添加change log记录
const changeLogs: ChangeLog[] = [];

export function addChangeLog(log: ChangeLog): void {
  changeLogs.push(log);
}

export function getChangeLogs(): ChangeLog[] {
  return [...changeLogs];
}

export function clearChangeLogs(): void {
  changeLogs.length = 0;
}
```

### core-characters.ts 实现

```typescript
// 添加NPC行为规则定义
export const npcBehaviorRules: NPCBehaviorRule[] = [
  {
    id: 'loyalty_report',
    condition: (npc, state) => npc.traits.loyalty > 80 && npc.state.pressure > 70,
    effect: (npc, state) => ({
      emperor: { prestige: state.emperor.prestige + (npc.state.loyalty_to_emperor - 50) * 0.2 },
      npcs: { [npc.id]: { state: { pressure: npc.state.pressure - 10 } } }
    })
  },
  {
    id: 'greed_corruption',
    condition: (npc, state) => npc.traits.greed > 70 && state.resources.fiscal > 1000,
    effect: (npc, state) => ({
      resources: { fiscal: state.resources.fiscal - 50 },
      npcs: { [npc.id]: { state: { satisfaction: npc.state.satisfaction + 5 } } }
    })
  }
];
```

---

## 测试要求

1. **单元测试**：每个新增函数必须有单元测试
2. **集成测试**：完整tick流程必须有集成测试
3. **边界测试**：所有数值边界必须有测试

---

## 时间安排

- **第1天**：实现tick.ts核心函数和子函数
- **第2天**：实现types.ts新类型和state.ts新函数
- **第3天**：实现core-characters.ts行为规则和测试

**总计**：3天

---

## 风险控制

1. **数值溢出**：使用严格的clamp限制
2. **状态不一致**：使用深拷贝确保状态不可变性
3. **性能问题**：只处理6个核心资源，避免不必要的计算
4. **代码质量**：每个函数不超过50行，有完整的JSDoc注释