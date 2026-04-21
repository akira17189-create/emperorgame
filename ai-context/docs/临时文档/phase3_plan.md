# Phase 3 开发计划 + 更新版 CONTEXT_PACKS

**版本**：v1.0  
**制定日期**：2026-04-19  
**依据**：开场改造计划.md 已全部执行完毕，Phase 3 进入启动阶段

---

## 目录

- [一、CONTEXT_PACKS（更新版）](#一context-packs更新版)
- [二、当前项目状态快照](#二当前项目状态快照)
- [三、Phase 3 任务清单](#三phase-3-任务清单)
- [四、执行顺序与依赖关系](#四执行顺序与依赖关系)
- [五、验收标准](#五验收标准)

---

## 一、CONTEXT_PACKS（更新版）

> 按任务类型选包发给对应 AI，不需要读其他文件。
> 括号内标注文件状态：✅已完整 / 🦴骨架待填 / 🔧待修改

### 📦 Pack 0：新 AI 读项目必读（任何任务前置）

```
docs/active/00_overview.md               ✅ 项目定位、术语表、世界观
docs/active/AI_DEVELOPER_GUIDE.md        ✅ 文件位置、运行方式、当前优先级
src/engine/types.ts                      ✅ 全量数据结构定义（唯一权威）
```

---

### 📦 Pack 1：改政策系统

```
# 必读（给 Mimo）
src/engine/policy-engine.ts              🦴 骨架已有，22个政策预设+LLM解析待完善
src/ui/PolicyPanel.tsx                   🔧 UI存在，需与policy-engine完整对接
src/engine/idle-engine.ts               ✅ tick_change 需通过此引擎持续生效
src/engine/types.ts                      ✅
src/engine/tick.ts                       ✅ 政策在 tick 中的生命周期管理

# 必读（给 DeepSeek）
src/engine/policy-engine.ts              🦴 查看 POLICY_PRESETS，填充 TODO 注释
docs/active/deepseek-prompt.md           ✅ 世界观、派系、人物风格约束
src/data/lore-bridge.ts                 ✅ 叙事风格15条硬规则（所有文案必须符合）
src/data/core-characters.ts             ✅ NPC人格权重（写NPC反应台词时对照）
```

**DeepSeek 具体交付物（DS-10 系列）：**

| 编号 | 内容 | 格式要求 |
|------|------|----------|
| DS-10 | 22个政策的场景描述（各40-80字） | 填入 `POLICY_PRESETS` 的 `description` 字段 |
| DS-11 | 每个政策颁布时的朝堂叙事段落（各100-150字） | 符合叙事风格15条，第三人称 |
| DS-12 | 22个政策的 NPC 反应台词（每政策2-3条，覆盖支持/反对/中立） | 每条1-2句，符合对应NPC人格 |
| DS-13 | 各派系对政策类别的基础态度矩阵（清流/帝党/军队/宦官/务实 × 内政/军事/仙道/工业） | 用表格交付 |

---

### 📦 Pack 2：改世界事件系统

```
# 必读（给 Mimo）
src/engine/event-engine.ts               🦴 骨架已有，EventTemplate 结构完整，内容待填
src/engine/tick.ts                       ✅ 事件触发逻辑嵌入点在此
src/engine/types.ts                      ✅ PendingEvent 类型定义
src/engine/goals-manager.ts             ✅ 事件影响 NPC 目标时需要调用

# 必读（给 DeepSeek）
src/engine/event-engine.ts               🦴 查看 EVENT_TEMPLATES 骨架和 TODO 注释
docs/active/deepseek-prompt.md           ✅
src/data/lore-bridge.ts                 ✅ 叙事风格硬规则
```

**DeepSeek 具体交付物（DS-20 系列）：**

| 编号 | 内容 | 格式要求 |
|------|------|----------|
| DS-20 | 32个事件的 `description` 场景文（各50-80字） | 填入 `EVENT_TEMPLATES` 对应字段 |
| DS-21 | 每个事件的2-4个选项文案（`label` + `description` 各1句） | 符合古风，不出现现代词汇 |
| DS-22 | 每个事件各选项的结局叙事（各80-120字） | 由 Mimo 作为 prompt 模板传给 LLM 生成 |
| DS-23 | 事件触发的"朕收到消息"过渡句（每类事件1句，共6类） | 第一人称，皇帝视角 |

---

### 📦 Pack 3：改 LLM / Tick 主循环

```
src/engine/tick.ts                       ✅ 年度推进主逻辑
src/engine/llm.ts                        ✅ LLM 调用封装
src/engine/narrator.ts                   ✅ 指令 → 叙事转换
src/engine/types.ts                      ✅
src/prompts/layer1-world-rules.md        ✅
src/prompts/role-execution.md            ✅
src/prompts/narration.md                 ✅
src/prompts/arbitration.md              ✅
src/prompts/normalize-command.md        ✅
docs/active/AI_DEVELOPER_GUIDE.md       ✅
```

---

### 📦 Pack 4：改 NPC / 叙事 / 仲裁

```
src/engine/narrator.ts                   ✅
src/engine/event-engine.ts               🦴
src/engine/arbitration.ts               ✅
src/engine/goals-manager.ts             ✅
src/data/seed-npcs.ts                   ✅ NPC初始数据（立场、人格权重）
src/data/core-characters.ts             ✅ 核心角色详细设定
src/data/lore-bridge.ts                 ✅ ⚠️ 所有叙事引擎都import此文件，修改前必读
docs/active/deepseek-prompt.md          ✅
```

---

### 📦 Pack 5：改放置 / Idle 系统

```
src/engine/idle-config.ts               ✅ 速率常量，平衡调整在此
src/engine/idle-engine.ts               ✅ calcIdleRates + applyIdleAccumulation
src/ui/CourtPage.tsx                     ✅ setInterval + 离线补算位置
docs/active/12_prologue_and_idle_system.md  ✅ 系统设计文档
```

---

### 📦 Pack 6：改结局系统

```
src/engine/ending-engine.ts             🦴 8种结局定义已有，触发逻辑未接入主循环
src/engine/tick.ts                       ✅ 结局检测在 tick 末尾插入
src/ui/EndingPage.tsx                   ✅
src/engine/types.ts                      ✅
```

---

### 📦 Pack 7：改开场 / 序幕

```
src/engine/types.ts                      ✅ Meta.prologue_phase / prologue_complete
src/engine/save.ts                       ✅ 旧存档兼容 patch
src/data/prologue.ts                    ✅ 开场文案（DS-01~08 已集成）
src/ui/CourtPage.tsx                     ✅ 三阶段状态机在此
docs/active/12_prologue_and_idle_system.md  ✅
```

---

### 📦 Pack 8：改存档 / 兼容

```
src/engine/save.ts                       ✅
src/engine/types.ts                      ✅
src/engine/state.ts                     ✅
```

---

### 📦 Pack 9：改 UI / 样式

```
src/ui/CourtPage.tsx                     ✅
src/ui/ChroniclePage.tsx                ✅
src/ui/PolicyPanel.tsx                   🔧
src/ui/components/（全部）              ✅
src/styles/base.css                      ✅
src/styles/components.css               ✅
src/styles/tokens.css                   ✅
```

---

## 二、当前项目状态快照

### 已完成（可正常运行）

| 系统 | 状态 | 核心文件 |
|------|------|----------|
| 三阶段开场 | ✅ 完整 | `CourtPage.tsx`, `prologue.ts` |
| 放置积累 + 离线补算 | ✅ 完整 | `idle-engine.ts`, `idle-config.ts` |
| LLM Tick / 年度推进 | ✅ 完整 | `tick.ts`, `llm.ts` |
| 多Agent仲裁 | ✅ 完整 | `arbitration.ts` |
| NPC自主目标 | ✅ 完整 | `goals-manager.ts` |
| 史册系统 | ✅ 完整 | `ChroniclePage.tsx` |
| 存档系统 | ✅ 完整 | `save.ts` |

### 骨架已有、内容待填

| 系统 | 状态 | 缺少什么 |
|------|------|----------|
| 政策系统 | 🦴 骨架 | DeepSeek 文案 + Mimo 接入 tick |
| 世界事件系统 | 🦴 骨架 | DeepSeek 全部 TODO 填充 + Mimo 触发逻辑 |
| 结局系统 | 🦴 骨架 | Mimo 接入主循环（trigger 逻辑有了，没调用） |

---

## 三、Phase 3 任务清单

### 3.1 政策系统闭环（优先级最高）

**目标**：玩家能在执行面板点"颁布政策" → 选或输入政策 → 看到朝堂叙事 + 资源变化 + NPC反应

#### DeepSeek 任务

- [ ] **DS-10**：22个政策场景描述（参考 Pack 1 说明，发给 DeepSeek 时附 `policy-engine.ts`）
- [ ] **DS-11**：22个政策颁布叙事段落
- [ ] **DS-12**：NPC 反应台词库（覆盖清流、帝党、军队、宦官、务实派各一条代表性台词 × 22政策）
- [ ] **DS-13**：派系-政策类别态度矩阵（一次性交付，Mimo 用于自动生成 NPC 反应）

#### Mimo 任务

- [ ] **M-10**：`policy-engine.ts` 完整实现
  - `interpretPolicy(input, state)` 接入 LLM，解析玩家自然语言指令为结构化政策
  - `applyPolicyEffect(effect, state)` 立即效果写入 state
  - `registerActivePolicies(state)` 将 `tick_change` 持久化进 `policies.active`
- [ ] **M-11**：`idle-engine.ts` 读取 `policies.active` 中的 `tick_change` 叠加到放置速率
- [ ] **M-12**：`tick.ts` 年度结算时执行已激活政策效果，到期政策自动移除
- [ ] **M-13**：`PolicyPanel.tsx` 完整对接
  - 展示22个预设政策（可点选）+ 自定义输入框
  - 颁布后展示叙事 + NPC反应列表
  - 激活政策列表显示剩余年限

---

### 3.2 世界事件系统（政策完成后启动）

**目标**：放置期间随机/条件触发事件 → 玩家做选择 → 影响状态 + 进入史册

#### DeepSeek 任务

- [ ] **DS-20**：32个事件 `description` 场景文（发给 DeepSeek 时附 `event-engine.ts` 骨架）
- [ ] **DS-21**：32个事件的选项文案（label + description）
- [ ] **DS-22**：选项结局叙事（作为 LLM prompt 模板，含占位符 `{resource}`, `{npc}` 等）
- [ ] **DS-23**：6类事件过渡句（皇帝"收到消息"时的引入语）

#### Mimo 任务

- [ ] **M-20**：`event-engine.ts` 触发逻辑
  - `checkEventTriggers(state)` 每 tick 调用，返回本年触发的事件列表
  - 概率触发 + 资源阈值触发两种模式
- [ ] **M-21**：`tick.ts` 集成事件检测，将触发事件推入 `state.events.pending`
- [ ] **M-22**：`CourtPage.tsx` 事件弹层
  - 读取 `events.pending`，展示叙事 + 选项按钮
  - 玩家选择后调用 `resolveEvent(choice, state)`，写入史册
- [ ] **M-23**：`goals-manager.ts` 集成，重要事件影响相关 NPC 的目标状态

---

### 3.3 结局系统接入（事件系统完成后）

**目标**：达到特定资源/年份条件时自动触发对应结局，跳转 `EndingPage`

#### Mimo 任务（无需 DeepSeek，叙事已在 `ending-engine.ts` 中）

- [ ] **M-30**：`tick.ts` 末尾调用 `checkEndings(state)`，满足条件时设置 `ui_state.ending_triggered`
- [ ] **M-31**：`CourtPage.tsx` 监测 `ending_triggered`，跳转路由至 `#/ending`
- [ ] **M-32**：`EndingPage.tsx` 读取 `ending` 数据，渲染结局叙事 + 史官评语

---

### 3.4 UI / 体验打磨（可与 3.2/3.3 并行）

#### Mimo 任务

- [ ] **M-40**：资源面板显示积累速率（`+x/min`），数据来自 `calcIdleRates(state)`
- [ ] **M-41**：史册虚拟列表（chronicle 超过30条时启用，防卡顿）
- [ ] **M-42**：执行面板"召见"子菜单接入真实 NPC 列表（读 `state.npcs.active`）
- [ ] **M-43**：政策激活状态在资源面板旁显示图标提示

---

## 四、执行顺序与依赖关系

```
Step 1  [DeepSeek]  → DS-10、DS-11、DS-12、DS-13（政策文案，可并行交付）
Step 2  [Mimo]      → M-10：policy-engine.ts 完整实现（依赖 DS-10）
Step 3  [Mimo]      → M-11：idle-engine 读取政策 tick_change
Step 4  [Mimo]      → M-12：tick.ts 政策年度结算
Step 5  [Mimo]      → M-13：PolicyPanel.tsx 完整对接（依赖 DS-11、DS-12）
Step 6  [联合测试]  → 政策完整循环：颁布 → 效果 → 放置生效 → 到期移除
─────────────────────────────────────────────────────────────
Step 7  [DeepSeek]  → DS-20、DS-21、DS-22、DS-23（事件文案）
Step 8  [Mimo]      → M-20、M-21：event-engine 触发逻辑 + tick 集成
Step 9  [Mimo]      → M-22：CourtPage 事件弹层（依赖 DS-20~23）
Step 10 [Mimo]      → M-23：goals-manager 集成
Step 11 [联合测试]  → 事件触发：放置 → 弹层 → 选择 → 史册记录
─────────────────────────────────────────────────────────────
Step 12 [Mimo]      → M-30~M-32：结局系统接入主循环（依赖 Step 11）
Step 13 [Mimo]      → M-40~M-43：UI 打磨（可提前并行）
Step 14 [联合测试]  → 完整游戏循环：开场 → 放置 → 政策 → 事件 → 结局
```

---

## 五、验收标准

### 政策系统验收

- [ ] 执行面板点"颁布政策"能打开 PolicyPanel
- [ ] 可选预设政策 22 个，也可输入自然语言
- [ ] 颁布后出现100字以上的朝堂叙事 + 至少2条 NPC 反应
- [ ] 资源面板数值在颁布后立即反映立即效果
- [ ] 放置积累期间，激活政策的 tick_change 持续叠加
- [ ] 政策到期后自动移除，不再影响积累速率
- [ ] 政策颁布、生效、到期均有史册记录

### 世界事件系统验收

- [ ] 正常放置10分钟内，至少触发1个事件
- [ ] 事件以弹层形式出现，包含场景描述 + 2-4个选项
- [ ] 选择后出现结局叙事，资源/NPC目标相应变化
- [ ] 事件记录进入史册
- [ ] 资源阈值事件在条件满足时确实更高概率触发

### 结局系统验收

- [ ] 满足 E1（盛世）条件后，下一个 tick 自动跳转结局页
- [ ] 8种结局各自触发条件不重叠（优先级机制正确）
- [ ] 结局页展示叙事全文 + 史官评语，UI 与整体风格一致

### 整体验收

- [ ] 完整游戏循环可跑：开场三阶段 → 放置积累 → 颁布政策 → 遭遇事件 → 触发结局
- [ ] 旧存档在新功能下不崩溃（save.ts 兼容 patch 覆盖到新字段）
- [ ] 无控制台报错，无 undefined 访问

---

## 附：给 DeepSeek 和 Mimo 的发包说明模板

### 发给 DeepSeek 时附上

```
本次任务：[DS-XX 编号]
发包文件：[按上方对应 Pack 附文件]
交付格式：[表格 / 字段填充 / Markdown 段落]
硬规则：
  1. 所有文案不出现"Tick"、"政策面板"、"点击"等现代 UI 词汇
  2. 符合 lore-bridge.ts 中的15条叙事硬规则
  3. NPC 台词须符合 core-characters.ts 中对应角色的人格权重
```

### 发给 Mimo 时附上

```
本次任务：[M-XX 编号]
发包文件：[按上方对应 Pack 附文件]
约束：
  1. 所有新增字段必须在 types.ts 中先定义
  2. 新字段需在 save.ts 加载时做缺失兼容 patch
  3. 不改动 src/prompts/ 下任何文件（除非本任务明确涉及）
  4. 新建文件命名规则：engine 层用 kebab-case.ts，UI 层用 PascalCase.tsx
```

---

*Phase 3 计划制定完成。政策系统 → 世界事件 → 结局接入 → UI 打磨，依次推进。*

---

## 六、代码实现细节（Mimo 专用）

> 以下每个任务给出精确的插入位置、函数签名和代码片段。Mimo 直接按此执行，不需要自行判断实现方式。

---

### M-10：`policy-engine.ts` 补完

**现状**：`interpretPolicy()`（LLM版）和 `applyPresetPolicy()`（模板版）已存在且逻辑正确。`applyPolicyTickEffects()` 也已在 `tick.ts` 中调用。

**缺失**：预设政策执行后没有写入 `state.policies.active`，也没有生成叙事和史册记录。

在 `applyPresetPolicy()` 函数末尾（return 之前）补充以下逻辑，或在调用处（PolicyPanel）处理：

```typescript
// policy-engine.ts — applyPresetPolicy 返回值扩展
// 目前返回 { policy, immediateChanges }，需要同时把 policy push 进 state.policies.active
// 调用方（PolicyPanel）负责执行：
//   const { policy, immediateChanges } = applyPresetPolicy(name, state);
//   const newState = {
//     ...state,
//     policies: { ...state.policies, active: [...state.policies.active, policy] },
//     resources: applyImmediateChanges(state.resources, immediateChanges)
//   };
//   setState(newState);

// 新增辅助函数（加在文件末尾）：
export function applyImmediateChanges(
  resources: GameState['resources'],
  changes: Record<string, number>
): GameState['resources'] {
  const r = { ...resources };
  for (const [key, delta] of Object.entries(changes)) {
    if (key in r) {
      (r as any)[key] = Math.max(0, ((r as any)[key] ?? 0) + delta);
    }
  }
  return r;
}

// 预设政策的史册记录（applyPresetPolicy 调用后由 PolicyPanel 写入）：
// chronicle_official: `${state.world.year}年，帝颁「${presetName}」之令。`
// chronicle_unofficial 由 DS-32 提供的视角规则，在 M-55 中统一处理
```

---

### M-11：`idle-engine.ts` 读取政策 `tick_change` 叠加

**现状**：`calcIdleRates()` 只用了基础资源公式，`policies.active` 完全没有参与。

**插入位置**：`idle-engine.ts` 中的 `calcIdleRates()` 函数末尾，在 return 之前。

```typescript
// idle-engine.ts — calcIdleRates() 末尾，在 return rates 之前插入：

// 政策加成：将活跃政策的 tick_change 按「每年→每分钟」折算叠加
// tick_change 的单位是"每年"，除以 525600（一年分钟数）转换为每分钟
const MINS_PER_YEAR = 525600;
for (const policy of state.policies.active) {
  if (!policy.tick_change) continue;
  for (const [key, delta] of Object.entries(policy.tick_change)) {
    if (key in rates && typeof delta === 'number') {
      (rates as any)[key] = ((rates as any)[key] ?? 0) + delta / MINS_PER_YEAR;
    }
  }
}
```

---

### M-12：`tick.ts` 政策过期史册记录

**现状**：`applyPolicyTickEffects()` 已经会移除过期政策（返回 `stillActive` 列表），但过期时没有写史册。

**插入位置**：`tick.ts` 第 2.5 步（`applyPolicyTickEffects` 调用处）改为捕获差异：

```typescript
// tick.ts — 替换现有的单行调用：
// 原来：currentState = applyPolicyTickEffects(currentState);
// 替换为：

const beforeActive = currentState.policies.active.map(p => p.id);
currentState = applyPolicyTickEffects(currentState);
const afterActive = new Set(currentState.policies.active.map(p => p.id));

// 找出刚过期的政策，写一条官方史册
for (const id of beforeActive) {
  if (!afterActive.has(id)) {
    const expired = currentState.policies.active.find(p => p.id === id)
      ?? currentState.policies.history?.find(p => p.id === id);
    if (expired) {
      const expiredEntry = {
        id: `chr_policy_expired_${Date.now()}`,
        year: currentState.world.year,
        type: 'policy' as const,
        content: `「${expired.description}」政令，施行${expired.duration_years}年，至本年告终。`,
        tags: expired.tags ?? []
      };
      currentState.chronicle.official.push(expiredEntry);
    }
  }
}
```

---

### M-13：`PolicyPanel.tsx` 完整对接

**现状**：`PolicyPanel.tsx` 存在 UI，但调用的是旧接口，没有连接 `interpretPolicy` / `applyPresetPolicy`，也没有显示 NPC 反应和史册记录。

**整体流程**：

```typescript
// PolicyPanel.tsx — 核心状态和提交逻辑

import { interpretPolicy, applyPresetPolicy, applyImmediateChanges } from '../engine/policy-engine';
import { getState, setState } from '../engine/state';

// 组件内状态
const [mode, setMode] = useState<'preset' | 'custom'>('preset');
const [selected, setSelected] = useState<string | null>(null);  // 预设政策名
const [customInput, setCustomInput] = useState('');
const [loading, setLoading] = useState(false);
const [result, setResult] = useState<PolicyInterpretResult | null>(null);

// 提交预设政策（不调 LLM）
async function handlePreset(name: string) {
  const state = getState();
  const { policy, immediateChanges } = applyPresetPolicy(name as any, state);
  
  // 写入 state
  setState({
    ...state,
    policies: { ...state.policies, active: [...state.policies.active, policy] },
    resources: applyImmediateChanges(state.resources, immediateChanges),
    chronicle: {
      ...state.chronicle,
      official: [...state.chronicle.official, {
        id: `chr_${Date.now()}`,
        year: state.world.year,
        type: 'policy',
        content: `${state.world.year}年，帝颁「${name}」之令。`,
        tags: policy.tags
      }]
    }
  });

  // 显示简版结果（无 LLM，用预设文案——由 DS-11 提供后填入 POLICY_PRESETS）
  setResult({ success: true, policy, effect: { ...immediateChanges }, narrative: `（${name}）政令已颁布，即刻生效。` } as any);
}

// 提交自定义政策（调 LLM）
async function handleCustom() {
  if (!customInput.trim()) return;
  setLoading(true);
  const state = getState();
  try {
    const result = await interpretPolicy(customInput, state);
    if (result.success) {
      setState({
        ...state,
        policies: { ...state.policies, active: [...state.policies.active, result.policy] },
        resources: applyImmediateChanges(state.resources, result.effect.resource_change),
        chronicle: {
          ...state.chronicle,
          official: [...state.chronicle.official, {
            id: `chr_${Date.now()}`,
            year: state.world.year,
            type: 'policy',
            content: result.effect.chronicle_note,
            tags: result.policy.tags
          }]
        }
      });
      setResult(result);
    }
  } finally {
    setLoading(false);
  }
}

// 激活政策列表渲染（PolicyPanel 下方）
function ActivePoliciesList() {
  const policies = getState().policies.active;
  return (
    <div className="active-policies">
      {policies.map(p => {
        const remaining = p.duration_years === -1 
          ? '永久' 
          : `剩余${p.duration_years - (getState().world.year - p.enacted_year)}年`;
        return (
          <div key={p.id} className="policy-tag">
            {p.description} <span className="policy-remaining">({remaining})</span>
          </div>
        );
      })}
    </div>
  );
}
```

---

### M-20 / M-21：`event-engine.ts` + `tick.ts` 事件触发

**现状**：`checkEventTriggers()` 和 `narrateEvent()` 已存在且已在 `tick.ts` 中调用。事件被推入 `state.events.pending`。

**缺失**：`resolveEvent()` 函数不存在——玩家选择选项后没有执行效果的函数。

在 `event-engine.ts` 末尾添加：

```typescript
// event-engine.ts — 新增 resolveEvent 函数

export function resolveEvent(
  pendingEventId: string,
  choiceId: string,
  state: GameState
): { newState: GameState; outcomeNarrative: string; chronicleNote: string } {
  const pending = state.events.pending.find(e => e.id === pendingEventId);
  if (!pending) return { newState: state, outcomeNarrative: '', chronicleNote: '' };

  const template = pending.raw_payload as EventTemplate;
  const choice = template.choices.find(c => c.id === choiceId);
  if (!choice) return { newState: state, outcomeNarrative: '', chronicleNote: '' };

  // 应用选项效果
  const newResources = { ...state.resources };
  for (const [key, delta] of Object.entries(choice.effects)) {
    if (key in newResources) {
      (newResources as any)[key] = Math.max(0, ((newResources as any)[key] ?? 0) + delta);
    }
  }

  // 将事件从 pending 移入 resolved
  const newPending = state.events.pending.filter(e => e.id !== pendingEventId);
  const resolved = {
    ...pending,
    resolved_year: state.world.year,
    choice_made: choiceId
  };

  const outcomeNarrative = `【${template.name}】陛下选择「${choice.label}」——${choice.description}`;
  const chronicleNote = `${state.world.year}年，${template.name}，帝以「${choice.label}」应之。`;

  return {
    newState: {
      ...state,
      resources: newResources,
      events: {
        ...state.events,
        pending: newPending,
        resolved: [...(state.events.resolved ?? []), resolved]
      },
      chronicle: {
        ...state.chronicle,
        official: [...state.chronicle.official, {
          id: `chr_event_${Date.now()}`,
          year: state.world.year,
          type: 'event' as const,
          content: chronicleNote,
          tags: [template.category]
        }]
      }
    },
    outcomeNarrative,
    chronicleNote
  };
}
```

---

### M-22：`CourtPage.tsx` 事件弹层

**插入位置**：`CourtPage.tsx` 的 JSX 返回值最外层，在执行面板同级（不是嵌套在里面）。

```typescript
// CourtPage.tsx — 在 return (...) 内，ActionDashboard 同级添加：

import { resolveEvent } from '../engine/event-engine';
import { getState, setState } from '../engine/state';

// 读取第一个待处理事件
const pendingEvent = state.events.pending[0] ?? null;

// 弹层 JSX（条件渲染）
{pendingEvent && (
  <div className="event-modal-overlay">
    <div className="event-modal">
      {/* 密封奏章样式：severity=3 用 bloody，其余用 urgent */}
      <div className={`event-seal ${pendingEvent.seal}`} />
      <h3 className="event-title">{(pendingEvent.raw_payload as EventTemplate).name}</h3>
      <p className="event-narration">{pendingEvent.narration}</p>
      <div className="event-choices">
        {(pendingEvent.raw_payload as EventTemplate).choices.map(choice => (
          <button
            key={choice.id}
            className="event-choice-btn"
            onClick={() => {
              const { newState, outcomeNarrative } = resolveEvent(
                pendingEvent.id, choice.id, getState()
              );
              setState(newState);
              // 显示结局叙事（复用 Toast 或在叙事框追加）
              addNarration(outcomeNarrative);
            }}
          >
            <strong>{choice.label}</strong>
            <span>{choice.description}</span>
          </button>
        ))}
      </div>
    </div>
  </div>
)}
```

---

### M-30 / M-31：结局系统接入主循环（修 Bug）

**现状**：`tick.ts` 中有一个 **Bug**——`checkEndings()` 的返回值存入 `ending`，但后面引用了未定义的 `endCheck.isEnded`。需要修复并接入路由跳转。

```typescript
// tick.ts — 第 5 步，替换现有的结局检测代码（当前有 endCheck 未定义的 bug）

// 原代码（有bug）：
// const ending = checkEndings(simulationResult.newState);
// if (ending) { ... }
// if (endCheck.isEnded) { ... }  // ← endCheck 未定义，运行时报错

// 修复后：
const ending = checkEndings(simulationResult.newState);
if (ending) {
  simulationResult.events.push(`游戏结局：${ending.title}`);
  // 将结局 id 写入 ui_state，由 CourtPage 监测后跳转
  simulationResult.newState = {
    ...simulationResult.newState,
    // ui_state 不存档，直接挂在返回的 newState 上
    // CourtPage 在 useEffect 里监测 ui_state.ending_id 变化
  } as any;
  // 在 TickResult 里带出 ending 信息
  (result as any).ending = ending;
}
// 删除 endCheck 相关代码
```

```typescript
// CourtPage.tsx — useEffect 监测结局触发
import { useEffect } from 'preact/hooks';
import { getState } from '../engine/state';

useEffect(() => {
  // gameTick 返回的 result 含 ending 时跳转
  if (lastTickResult?.ending) {
    window.location.hash = '/ending';
  }
}, [lastTickResult]);
```

```typescript
// EndingPage.tsx — 读取结局数据（checkEndings 需要重新调用，因为 ui_state 不存档）
import { checkEndings } from '../engine/ending-engine';
import { getState } from '../engine/state';

export function EndingPage() {
  const ending = checkEndings(getState());
  if (!ending) {
    // 兜底：状态丢失时返回主页
    window.location.hash = '/';
    return null;
  }
  return (
    <div className="ending-page">
      <h1>{ending.title}</h1>
      <div className="ending-narrative">{ending.narrative}</div>
      <div className="ending-epilogue">{ending.epilogue}</div>
      <button onClick={() => window.location.hash = '/new'}>再起炉灶</button>
    </div>
  );
}
```

---

### M-40：资源面板显示 `+x/min`

**插入位置**：显示资源数值的组件（在 `CourtPage.tsx` 中的资源面板部分）。

```typescript
// CourtPage.tsx — 资源数字旁追加速率标注

import { calcIdleRates } from '../engine/idle-engine';

// 在组件内（render 时计算，不放 useEffect 里避免频繁重算）：
const rates = calcIdleRates(getState());

// 渲染示例（以 food 为例，其他资源同理）：
<div className="resource-item">
  <span className="resource-label">粮仓</span>
  <span className="resource-value">{resources.food}</span>
  {rates.food > 0 && (
    <span className="resource-rate">+{rates.food.toFixed(1)}/min</span>
  )}
  {rates.food < 0 && (
    <span className="resource-rate negative">{rates.food.toFixed(1)}/min</span>
  )}
</div>

// 需要在 components.css 中补充：
// .resource-rate { font-size: 0.75em; color: #6a8f4a; margin-left: 4px; }
// .resource-rate.negative { color: #a04040; }
```

---

### M-50：`narrator.ts` 注入 NPC voice 约束

**插入位置**：`narrator.ts` 中 `processCommand()` 内构建 roleExecutionPrompt 的位置，在组装 system prompt 的字符串里。

```typescript
// narrator.ts — 在 processCommand() 里找到 buildRolePrompt 或直接拼 systemPrompt 的位置
// 找到 const systemPrompt = `...` 的拼装，在 NPC 人格段落后追加：

// 目前大概是：
// `...${npc.traits ? JSON.stringify(npc.traits) : ''}...`

// 在其后插入（DS-30 交付后 voice 字段才有数据）：
const voiceBlock = (() => {
  const v = npc.voice;
  if (!v || (!v.features?.length && !v.syntax_rules?.length)) return '';
  const parts: string[] = [];
  if (v.features?.length)       parts.push(`【语言特征】${v.features.join('；')}`);
  if (v.syntax_rules?.length)   parts.push(`【惯用句式】${v.syntax_rules.join('；')}`);
  if (v.forbidden_phrases?.length) parts.push(`【禁止用词】${v.forbidden_phrases.join('、')}`);
  return '\n' + parts.join('\n');
})();

// 将 voiceBlock 拼接进 systemPrompt 的 NPC 描述段
```

---

### M-51 / M-52：World Tone 自动更新 + 注入快照

**M-51**：在 `simulation.ts` 的 `simulateWorld()` 函数末尾，资源演算完成后，在 return 之前插入：

```typescript
// simulation.ts — simulateWorld() 末尾，return 之前

// ── Tone 自动更新 ──
type ToneValue = typeof newState.world.tone;
let newTone: ToneValue = newState.world.tone;

const r2 = newState.resources;  // 演算后的资源
if (r2.morale < 25 || r2.food <= 0) {
  newTone = '匮乏' as ToneValue;
} else if (r2.threat > 70) {
  newTone = r2.morale < 40 ? '绝望' as ToneValue : '尚武' as ToneValue;
} else if (r2.faction > 75 || r2.eunuch > 70) {
  newTone = '猜忌' as ToneValue;
} else if (r2.fiscal > 3000 && r2.morale > 65) {
  newTone = '浮华' as ToneValue;
}
// Tone 不会在一年内剧变，做平滑：只在连续2年满足条件时才切换
// 简化实现：直接更新（可后期加 hysteresis buffer）
newState.world.tone = newTone;
```

**M-52**：在 `prompt/system.ts` 或 `prompt/scene.ts`（组装世界快照的地方）追加 tone 段：

```typescript
// 找到构建世界快照字符串的地方，追加：
const toneDescriptions: Record<string, string> = {
  '匮乏': '民间怨声载道，官员言辞多见悲戚保守。',
  '尚武': '朝野尚武气盛，争功冒进之风渐起。',
  '浮华': '国库充盈，朝堂浮华，奢靡之风暗生。',
  '猜忌': '朋党相争，臣下互相倾轧，人人自保。',
  '绝望': '国势衰颓，叙事宜显末日将近之沉郁。'
};
const toneNote = toneDescriptions[state.world.tone] ?? '';
// 拼进 snapshot 字符串：
// `【当前世界调性：${state.world.tone}】${toneNote}`
```

---

### M-53 / M-54：Named Events 写入 + 快照注入

**M-53**：在 `tick.ts` 的事件处理块中，severity=3 的事件被 resolved 后，触发命名逻辑。在 M-22 的 `resolveEvent` 返回后插入：

```typescript
// tick.ts（或在 resolveEvent 末尾扩展返回值）
// 当 template.severity === 3 时，调用 LLM 生成历史名称：

async function nameHistoricalEvent(
  template: EventTemplate,
  year: number,
  state: GameState
): Promise<string> {
  const prompt = `你是靖朝史官。请为以下重大事件命名，格式参考"黑市之乱""三年饥荒""庚午兵变"，不超过6个字，只返回名称本身：\n事件：${template.name}，发生于${year}年，类型：${template.category}`;
  const raw = await callLLMWithRetry({ system: '你只返回历史事件名称，不超过6字，不加任何解释。', user: prompt, temperature: 0.5, tag: 'naming' });
  return raw.trim().replace(/["「」\n]/g, '');
}

// 在 resolveEvent 之后（CourtPage 调用处），severity=3 时异步命名：
if ((pendingEvent.raw_payload as EventTemplate).severity === 3) {
  nameHistoricalEvent(pendingEvent.raw_payload as EventTemplate, state.world.year, state)
    .then(name => {
      const s = getState();
      const namedEvents = [...(s.world.named_events ?? []), {
        id: `ne_${Date.now()}`,
        name,
        year: s.world.year,
        category: (pendingEvent.raw_payload as EventTemplate).category
      }].slice(-8);  // 上限 8 个
      setState({ ...s, world: { ...s.world, named_events: namedEvents } });
    });
}
```

**M-54**：在 `prompt/scene.ts` 或快照组装处追加命名事件段：

```typescript
// 找到快照组装字符串，追加：
if (state.world.named_events?.length) {
  const eventNames = state.world.named_events.map(e => `${e.name}（${e.year}年）`).join('、');
  snapshot += `\n【历史锚点】${eventNames}`;
}
```

---

### M-55 / M-56：双轨史册写入 + UI 切换

**M-55**：在 `phases/narration.ts` 中的 `generateNarration()` 里，找到写 `chronicle.official` 的位置，同步写 `unofficial`。

```typescript
// phases/narration.ts — 在写 official 史册的同一 LLM 调用里，
// 通过 prompt 要求同时输出两个版本（节省一次 API 调用）

// 修改 narration prompt，在输出 JSON 结构里增加 unofficial_note 字段：
// 在 systemPrompt 里增加说明：
`【史册输出格式】JSON中增加两个字段：
  "chronicle_note": "官方史书口吻（皇帝视角，可能粉饰）",
  "unofficial_note": "民间野史口吻（受害者/百姓视角，更接近真实）"
  两者叙述同一事件，但立场和措辞截然不同。`

// 在解析 LLM 返回后：
const officialEntry = {
  id: `chr_${Date.now()}`,
  year: state.world.year,
  type: 'narrative' as const,
  content: parsed.chronicle_note ?? '',
  tags: []
};
const unofficialEntry = {
  ...officialEntry,
  id: `chr_unoff_${Date.now()}`,
  content: parsed.unofficial_note ?? parsed.chronicle_note ?? ''
};

newState.chronicle.official.push(officialEntry);
newState.chronicle.unofficial.push(unofficialEntry);
```

**M-56**：`ChroniclePage.tsx` 增加切换按钮：

```typescript
// ChroniclePage.tsx
const [viewMode, setViewMode] = useState<'official' | 'unofficial'>('official');
const state = getState();
const isUnlocked = state.chronicle.official.length > 10;  // 解锁条件
const entries = viewMode === 'official' 
  ? state.chronicle.official 
  : state.chronicle.unofficial;

// 在标题旁加切换按钮：
{isUnlocked && (
  <div className="chronicle-toggle">
    <button 
      className={viewMode === 'official' ? 'active' : ''}
      onClick={() => setViewMode('official')}
    >官方史书</button>
    <button 
      className={viewMode === 'unofficial' ? 'active' : ''}
      onClick={() => setViewMode('unofficial')}
    >民间野史</button>
  </div>
)}
```

---

### M-57 / M-58：NPC 压力积累 + Trauma 写入

**插入位置**：`simulation.ts` 的 `simulateWorld()` 末尾，资源演算完成后。

```typescript
// simulation.ts — simulateWorld() 末尾，tone 更新之后插入：

// ── NPC 压力积累 ──
for (const npc of newState.npcs) {
  if (npc.status !== 'active') continue;

  let pressureDelta = 0;

  // 连续未获奖励（简化：用 key_events 中 'reward' 类型判断）
  const lastRewardYear = npc.memory.key_events
    .filter(e => e.type === 'reward')
    .reduce((max, e) => Math.max(max, e.year ?? 0), 0);
  if (newState.world.year - lastRewardYear > 3) pressureDelta += 5;

  // 政策与派系冲突（遍历 active policies 的 tags）
  const hostileTags = { '清流': ['商业', '工业'], '宦官': ['廉政', '内政'] }; // 示例，可扩充
  for (const policy of newState.policies.active) {
    const hostile = (hostileTags as any)[npc.faction] ?? [];
    if (policy.tags?.some((t: string) => hostile.includes(t))) {
      pressureDelta += 3;
    }
  }

  npc.state.pressure = Math.min(100, Math.max(0, (npc.state.pressure ?? 30) + pressureDelta));

  // 压力超阈值 → 推入待触发事件
  if (npc.state.pressure >= 80) {
    const extremeEvent = {
      id: `event_pressure_${npc.id}_${Date.now()}`,
      triggered_year: newState.world.year,
      template_id: `npc_pressure_${npc.id}`,
      severity: 2 as const,
      seal: 'urgent' as const,
      narrated: false,
      narration: `${npc.name}积怨已久，似有异动。`,
      raw_payload: {
        id: `npc_pressure_${npc.id}`,
        category: '党争' as const,
        name: `${npc.name}的异动`,
        description: `${npc.name}因长期处境压抑，行为出现偏移。`,
        severity: 2 as const,
        trigger_conditions: { probability: 1 },
        choices: [
          { id: 'appease', label: '安抚', description: '给予奖励平息不满', effects: { morale: +3, fiscal: -50 } },
          { id: 'punish', label: '敲打', description: '明示警告，杀鸡儆猴', effects: { faction: +5, morale: -2 } },
          { id: 'ignore', label: '置之不理', description: '不予理会，静观其变', effects: {} }
        ]
      }
    };
    newState.events.pending.push(extremeEvent);
    npc.state.pressure = 40;  // 触发后压力重置
  }
}
```

**M-58（trauma 写入）**：在 `resolveEvent()` 函数末尾（M-20 添加的函数里），severity=3 的事件 resolved 后写入受影响 NPC 的 trauma：

```typescript
// event-engine.ts — resolveEvent() 末尾，在 return 之前

// severity=3 的事件对活跃 NPC 写入 trauma
if (template.severity === 3) {
  for (const npc of newState.npcs) {
    if (npc.status !== 'active') continue;
    // 只写入与事件派系相关的 NPC（简化：写入全部活跃 NPC）
    if (npc.memory.trauma.length < 5) {
      npc.memory.trauma.push({
        event: template.name,
        year: state.world.year,
        type: template.category,
        impact: `亲历${template.name}，此后对相关决策极度敏感`
      });
    }
  }
}
```

---

## 七、原始任务书（V2.2）补充项

> **背景**：项目启动时写过 V2.2 完整任务书，Mimo 已将其中大量设计**预埋进了 `types.ts` 的数据结构**（字段都在，但引擎没有往里写东西）。以下是对照任务书，发现的「字段存在但逻辑为空」的功能缺口，按优先级排列。

---

### 6.1 NPC 语音特征（Voice Pattern）— 高价值快赢

**状态**：`types.ts` 中 NPC 已有 `voice: { features, syntax_rules, forbidden_phrases }` 字段，全部是空数组。

**问题**：DeepSeek 生成 NPC 台词时没有任何口吻约束，严嵩说话可能和海瑞一样，辨识度为零。

**原始任务书设计（需补充）**：

| 角色 | 语句特征 | 禁止用词 | 标志句式 |
|------|----------|----------|----------|
| 海瑞类臣子 | 逻辑严密、引用律法、道德高地 | 所有修饰性形容词 | 多用反问句 |
| 严嵩类奸臣 | 谄媚暗示、利益交换、话中有话 | 直接拒绝、直接表态 | "臣以为…"、"陛下圣明…" |
| 张居正类改革派 | 务实、数据支撑、强势推进 | 模糊措辞 | "若…则…"条件句 |
| 国师玄明 | 神神叨叨、反问暗语、不给答案 | 直接说明、科学词汇 | "星象所示…"、"天命难言…" |

**执行方式**：

- [ ] **DS-30**（DeepSeek）：为 `seed-npcs.ts` 中每个核心 NPC 补充 `voice` 三字段（features/syntax_rules/forbidden_phrases），格式与 `NPC.voice` 接口对齐。发包时附 `core-characters.ts` + `seed-npcs.ts`。
- [ ] **M-50**（Mimo）：`narrator.ts` 生成 NPC 台词时，将对应 NPC 的 `voice` 字段注入 prompt，作为角色约束层。

---

### 6.2 全局调性向量（World Tone）— 低成本高沉浸

**状态**：`world.tone: Tone` 字段已存在，初始值已设。但 `tick.ts` 没有任何逻辑去更新它。

**原始任务书设计**：

```
Tone 的 5 种状态：匮乏/紧缩 | 尚武/扩张 | 浮华/享乐 | 猜忌/党争 | 绝望/崩溃
```

**作用**：即使具体事件已从快照移除，Tone 仍会让 NPC 台词整体偏向悲观/激进/多疑——历史情绪的"余震"。

**执行方式**：

- [ ] **M-51**（Mimo）：`tick.ts` 年度结算时根据核心资源变化更新 `world.tone`：
  - `morale < 30` → 偏向 `匮乏`
  - `threat > 70` → 偏向 `尚武` 或 `绝望`
  - `faction` 极端值 → 偏向 `猜忌`
  - `fiscal` 极高 + `morale` 极高 → 偏向 `浮华`
- [ ] **M-52**（Mimo）：`prompt/system.ts` 中将 `world.tone` 注入世界快照层，作为全局叙事修饰。

---

### 6.3 已命名事件（Named Events）— 蝴蝶效应的根基

**状态**：`world.named_events: NamedEvent[]`（上限 8）字段已存在，但永远是空数组——没有任何逻辑往里写。

**原始任务书设计**：

> 系统自动为重大事件生成历史名称，后续事件会引用。  
> 例：连续三年旱灾 + 未开仓放粮 → 史称"X帝三年饥荒"

命名后，史评、NPC 台词、未来事件叙事都能引用这个名字，形成蝴蝶效应感。

**执行方式**：

- [ ] **M-53**（Mimo）：`tick.ts` 中检测重大事件触发条件（severity=3 的事件解决后），调用一次 LLM 为该事件生成历史名称，写入 `world.named_events`。
- [ ] **M-54**（Mimo）：`prompt/system.ts` 中将 `named_events` 列表注入快照，让后续叙事可引用（"自X之乱后……"）。
- [ ] **DS-31**（DeepSeek）：为每类重大事件提供命名风格示例（用于 prompt），确保命名符合古代史书体例（"X年X乱"/"X帝X事"格式）。

---

### 6.4 双轨史册（官方 vs 野史）— 认知反差时刻

**状态**：`chronicle: { official: [], unofficial: [], pending_segments: [] }` 三个字段都在，但 `tick.ts` 写史册时只写了 `official`，`unofficial` 永远是空。

**原始任务书设计**：

> 官方史书（玩家视角，可能粉饰太平）+ 野史/民间说法（更接近真实）  
> 玩家解锁"史官"官职后才能看到两版对比，产生"原来我的帝国是这样的"反差。

**执行方式**：

- [ ] **M-55**（Mimo）：`tick.ts` 重大事件生成史册时，同时生成两个版本——一条写入 `official`（措辞偏向皇帝视角），一条写入 `unofficial`（措辞偏向民间/受害者视角）。两条可用同一个 LLM 调用，通过 prompt 区分视角。
- [ ] **M-56**（Mimo）：`ChroniclePage.tsx` 增加切换按钮（默认显示官方，解锁后可切换野史视图）。解锁条件暂定：史册条数 > 10 或特定 NPC 存活。
- [ ] **DS-32**（DeepSeek）：补充叙事引擎文风说明——官方史书 vs 野史的叙事视角差异规则（2-3 条），附示例各一段。

---

### 6.5 NPC 压力积累（处境/委屈值）— 行为意外性

**状态**：NPC 有 `state.pressure` 字段，`memory.trauma` 字段，但 `goals-manager.ts` 和 `tick.ts` 从未往里写东西，也没有触发"压力过高→行为偏移"的逻辑。

**原始任务书设计**：

> 海瑞连续三年不给升迁，"委屈值"累积，可能上一封死谏——不是性格变了，是处境逼的。  
> `Behavior = Personality × Stability × Situation`

**执行方式**：

- [ ] **M-57**（Mimo）：`tick.ts` 年度结算时，对每个活跃 NPC 检查"处境压力"：
  - 连续 3 年未获奖励 → `pressure +10`
  - 政策与其派系利益冲突 → `pressure +5`
  - 被玩家明确打压 → `pressure +20`
  - `pressure > 80` 时触发一次"极端行为"事件（上书死谏/暗中结党/辞官），写入事件池
- [ ] **M-58**（Mimo）：重大事件对 NPC 产生影响时，写入该 NPC 的 `memory.trauma`（事件名、年份、影响描述），并在后续 prompt 中作为该 NPC 的高权重约束。

---

### 6.6 Phase 4 预留（任务书中有、暂不实现）

以下功能来自 V2.2 任务书，数据结构已预埋，但复杂度较高，留待 Phase 4：

| 功能 | 涉及字段 | 暂缓原因 |
|------|----------|----------|
| 皇帝知识技能树（现代知识解锁） | `emperor.knowledge[]` | 需要独立技能树 UI + 解锁事件系统 |
| 水土不服机制（现代指令歪解） | `cognition` in NPC | 需要 prompt 层语义降级逻辑 |
| 后宫系统 | 需新增 `harem` 字段 | 需要完整新模块，不是修改现有 |
| 王朝周期 + 皇帝传承 | `wills: ImperialWill[]` | 需要禅让流程 + 前朝记录压缩 |
| UI 古典意象（宣纸质感随国力变化） | 纯前端 | 需要 CSS 动态主题切换系统 |
| 宰相离线代理执政 | 新 `regent_policy` 字段 | 需要完整的代理决策引擎 |

---

### 6.7 Phase 3 补充任务汇总

在 Phase 3 主线（政策 → 事件 → 结局）基础上，以下补充项**可穿插执行**，不阻塞主线：

| 编号 | 执行者 | 内容 | 依赖 |
|------|--------|------|------|
| DS-30 | DeepSeek | 核心 NPC voice 字段补充 | 无，可立即启动 |
| DS-31 | DeepSeek | 命名事件风格示例 | 无，可立即启动 |
| DS-32 | DeepSeek | 官方/野史叙事视角规则 | 无，可立即启动 |
| M-50 | Mimo | narrator.ts 注入 voice 约束 | 依赖 DS-30 |
| M-51/52 | Mimo | tone 自动更新 + prompt 注入 | 无，可立即启动 |
| M-53/54 | Mimo | named_events 写入 + 快照注入 | 依赖 DS-31，M-20 之后 |
| M-55/56 | Mimo | 双轨史册写入 + UI 切换 | 依赖 DS-32 |
| M-57/58 | Mimo | NPC 压力积累 + trauma 写入 | 依赖 M-20（事件系统） |

> DeepSeek 的三个补充任务（DS-30/31/32）无任何前置依赖，**可以和 DS-10～13（政策文案）同批发出**，一次性交付。

---

*V2.2 补充项已整合完毕。types.ts 预埋字段 → 引擎逻辑 → 内容填充，三层都到位后，原始任务书的核心爽点（史册回顾爽、人物关系爽、蝴蝶效应爽）才能真正成立。*

---

## 八、前序代码勘误 + 补全实现

> 深入读代码后发现第六节有几处类型不匹配的错误，Mimo 必须以本节为准，**第六节中对应代码以本节修正版替换**。

---

### 8.1 类型勘误：ChronicleEntry 实际结构

第六节 M-12、M-13、M-20、M-55 里写了 `{ id, year, type, content, tags }` 这个结构——**错误**。

真实的 `ChronicleEntry`（来自 `types.ts` + `narration.ts`）是：

```typescript
// 正确的 ChronicleEntry 结构（types.ts 定义）
interface ChronicleEntry {
  id: string;
  kind: '本纪' | '列传' | '平准' | '野史';
  subject_id?: string;
  year_range: [number, number];   // [开始年, 结束年]
  text: string;                   // 叙事内容
  style_tags: string[];
  source_logs: string[];
  image: string | null;
  image_prompt: string | null;
}
```

**所有写 chronicle 的地方，统一用以下工厂函数**（在 `narration.ts` 中已有 `createChronicleEntry`，Mimo 直接复用或参照）：

```typescript
// 凡是需要写 ChronicleEntry 的地方，都用这个结构：
function makeEntry(
  year: number,
  text: string,
  kind: '本纪' | '列传' | '平准' | '野史' = '本纪',
  styleTags: string[] = []
): ChronicleEntry {
  return {
    id: `chr_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    kind,
    year_range: [year, year],
    text,
    style_tags: styleTags,
    source_logs: [],
    image: null,
    image_prompt: null
  };
}
```

---

### 8.2 类型勘误：Events.resolved 不存在

第六节 M-20 `resolveEvent()` 里写了 `state.events.resolved`——**不存在**。

`Events` 接口只有：`pending`, `named`, `raw_logs`, `rolling_summary`。

**修正**：resolved 的事件写入 `raw_logs`，同时从 `pending` 移除：

```typescript
// event-engine.ts — resolveEvent() 修正版（替换第六节 M-20 全部）

import type { GameState, ChronicleEntry, EventTemplate } from './types';

export function resolveEvent(
  pendingEventId: string,
  choiceId: string,
  state: GameState
): { newState: GameState; outcomeText: string } {
  const pending = state.events.pending.find(e => e.id === pendingEventId);
  if (!pending) return { newState: state, outcomeText: '' };

  const template = pending.raw_payload as EventTemplate;
  const choice = template.choices.find(c => c.id === choiceId);
  if (!choice) return { newState: state, outcomeText: '' };

  // 1. 应用选项效果到资源
  const newResources = { ...state.resources };
  for (const [key, delta] of Object.entries(choice.effects ?? {})) {
    if (key in newResources) {
      (newResources as any)[key] = Math.max(0, ((newResources as any)[key] ?? 0) + delta);
    }
  }

  // 2. 将事件从 pending 移除，写入 raw_logs
  const newPending = state.events.pending.filter(e => e.id !== pendingEventId);
  const rawLog = {
    year: state.world.year,
    kind: 'event_resolved',
    payload: { event_id: pendingEventId, template_id: template.id, choice_id: choiceId }
  };

  // 3. 写官方史册（使用正确的 ChronicleEntry 结构）
  const officialEntry: ChronicleEntry = {
    id: `chr_event_${Date.now()}`,
    kind: '本纪',
    year_range: [state.world.year, state.world.year],
    text: `${state.world.year}年，${template.name}，帝以「${choice.label}」应之。${choice.description}`,
    style_tags: [template.category],
    source_logs: [pendingEventId],
    image: null,
    image_prompt: null
  };

  // 4. 写野史（同一事件，百姓视角——实际内容由 M-55 的 LLM 生成，这里先写占位）
  const unofficialEntry: ChronicleEntry = {
    ...officialEntry,
    id: `chr_unoff_event_${Date.now()}`,
    kind: '野史',
    text: `（野史）${template.name}期间，民间${choice.label === '开仓赈灾' ? '所获赈粮有限，怨声未息' : '苦不堪言，官府所为多有不实'}。`
    // M-55 实装后，这里改为 LLM 生成内容
  };

  const outcomeText = `【${template.name}】陛下选择「${choice.label}」——${choice.description}`;

  // severity=3：触发异步历史命名（M-53）
  if (template.severity === 3) {
    // 异步，不阻塞 UI
    nameHistoricalEvent(template, state.world.year, state).then(name => {
      const s = getState();
      // NamedEvent 完整结构
      const namedEvent = {
        id: `ne_${Date.now()}`,
        name,
        year: state.world.year,
        cause: template.description.slice(0, 30),
        summary: `${template.name}，帝以${choice.label}应之`,
        impact: choice.effects ?? {},
        image: null,
        image_prompt: null
      };
      const namedEvents = [...(s.world.named_events ?? []), namedEvent].slice(-8);
      setState({ ...s, world: { ...s.world, named_events: namedEvents } });
    }).catch(() => {}); // 命名失败不影响游戏

    // severity=3 事件同时写入相关 NPC 的 trauma（M-58 逻辑）
    for (const npc of state.npcs) {
      if (npc.status !== 'active') continue;
      if (npc.memory.trauma.length >= 5) continue;
      npc.memory.trauma.push({
        event_id: pendingEventId,
        event_name: template.name,
        year: state.world.year,
        type: template.category,
        intensity: 80,
        impact: `亲历${template.name}，此后对相关决策极度谨慎`
      });
    }
  }

  return {
    newState: {
      ...state,
      resources: newResources,
      events: {
        ...state.events,
        pending: newPending,
        raw_logs: [...state.events.raw_logs, rawLog]
      },
      chronicle: {
        ...state.chronicle,
        official: [officialEntry, ...state.chronicle.official],
        unofficial: [unofficialEntry, ...state.chronicle.unofficial]
      }
    },
    outcomeText
  };
}
```

---

### 8.3 类型勘误：M-22 中 `addNarration` 不存在

`CourtPage.tsx` 没有 `addNarration` 函数，叙事通过 `typewriterEffect` 写入 `narration` state。

**修正版 M-22 事件弹层**（替换第六节 M-22 全部）：

```typescript
// CourtPage.tsx — 在组件顶部 state 声明处新增：
const [pendingEventChoice, setPendingEventChoice] = useState<string | null>(null);

// 在 return (...) 内，action-dashboard 同级（不是嵌套在里面），narration-area 之前插入：
{(() => {
  const state = getState();
  const pe = state.events.pending[0];
  if (!pe || prologuePhase !== 'complete') return null;
  const template = pe.raw_payload as EventTemplate;

  return (
    <div className="event-modal-overlay">
      <div className={`event-modal seal-${pe.seal}`}>
        <div className="event-seal-icon">
          {pe.seal === 'bloody' ? '🔴' : pe.seal === 'urgent' ? '📮' : '📜'}
        </div>
        <h3 className="event-name">{template.name}</h3>
        <p className="event-narration">{pe.narration ?? template.description}</p>
        <div className="event-choices">
          {template.choices.map(choice => (
            <button
              key={choice.id}
              className="event-choice-btn"
              disabled={isProcessing}
              onClick={async () => {
                setIsProcessing(true);
                const currentState = getState();
                const { newState, outcomeText } = resolveEvent(pe.id, choice.id, currentState);
                setState(newState);
                setIsProcessing(false);
                // 显示结局文字（追加到叙事区域）
                await typewriterEffect(outcomeText);
              }}
            >
              <span className="choice-label">{choice.label}</span>
              <span className="choice-desc">{choice.description}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
})()}
```

---

### 8.4 M-55 修正版：双轨史册使用正确结构

替换第六节 M-55 全部代码。修改位置：`phases/narration.ts` 的 `generateNarration()` → 找到调用 LLM 生成叙事的地方，在 prompt 的 JSON schema 里增加 `unofficial_note` 字段：

```typescript
// phases/narration.ts — 修改 systemPrompt 中的输出 JSON 格式说明
// 找到描述输出格式的字符串，在 "chronicle_note" 字段下方追加：

`"chronicle_note": "官方史书记录（帝王视角，文言，可能粉饰）",
 "unofficial_note": "民间野史记录（百姓/受害者视角，同一事件，措辞截然不同，以'据野老云'或'民间私载'开头）"`

// 在解析 LLM 返回 JSON 之后，写入 chronicle 时：
// （找到现有的 chronicle_entry: createChronicleEntry(...) 的位置）

// 1. 官方史册（kind: '本纪'，已有逻辑，保持不变）
const officialEntry = createChronicleEntry(state, parsed.chronicle_note ?? narration, '本纪');

// 2. 野史（kind: '野史'，新增）
const unofficialEntry: Omit<ChronicleEntry, 'id'> = {
  kind: '野史',
  year_range: [state.world.year, state.world.year],
  text: parsed.unofficial_note ?? '',   // DS-32 提供视角规则后此处内容会更丰富
  style_tags: ['民间'],
  source_logs: [],
  image: null,
  image_prompt: null
};

// 返回时（TickResult 或直接写 state）：
// 注意：generateNarration 返回 chronicle_entry 给 CourtPage 写入 official
// unofficial 需要直接在 narration.ts 里操作 state，或在返回值里带出

// 推荐：在 narration.ts 里返回值增加 unofficial_chronicle_entry 字段
// CourtPage 接收后同时 unshift 到 official 和 unofficial
```

```typescript
// CourtPage.tsx — 找到 line 265-267 区域（写 official 史册的位置）
// 原来：
// if (tickResult.chronicle_entry) {
//   const entry = { ...tickResult.chronicle_entry, id: `entry-${Date.now()}` };
//   draft.chronicle.official.unshift(entry);
// }

// 修改为（同时写 unofficial）：
if (tickResult.chronicle_entry) {
  const officialId = `chr_${Date.now()}`;
  const entry = { ...tickResult.chronicle_entry, id: officialId };
  draft.chronicle.official.unshift(entry);

  // 如果 tickResult 里有 unofficial_chronicle_entry，也写入
  if ((tickResult as any).unofficial_chronicle_entry) {
    const unoffEntry = {
      ...(tickResult as any).unofficial_chronicle_entry,
      id: `chr_unoff_${Date.now()}`
    };
    draft.chronicle.unofficial.unshift(unoffEntry);
  }
}
```

---

### 8.5 save.ts：Phase 3 迁移补丁

在 `save.ts` 的 `load()` 方法里，在现有的迁移 1/2 之后，追加迁移 3/4/5：

```typescript
// save.ts — load() 方法，现有迁移代码末尾追加：

// 迁移3: events.raw_logs 缺失（旧存档可能只有 events.pending）
if (!gameState.events.raw_logs) {
  gameState.events.raw_logs = [];
  console.log('迁移: 添加了 events.raw_logs 字段');
}
if (!gameState.events.rolling_summary) {
  gameState.events.rolling_summary = '';
}

// 迁移4: chronicle.unofficial 缺失
if (!gameState.chronicle.unofficial) {
  gameState.chronicle.unofficial = [];
  console.log('迁移: 添加了 chronicle.unofficial 字段');
}
if (!gameState.chronicle.pending_segments) {
  gameState.chronicle.pending_segments = [];
}

// 迁移5: world.named_events / world.factions 子字段
if (!gameState.world.named_events) {
  gameState.world.named_events = [];
}
if (!gameState.world.wills) {
  gameState.world.wills = [];
}
if (!gameState.world.collective_memory) {
  gameState.world.collective_memory = [];
}

// 迁移6: NPC voice/pressure/trauma 字段缺失（旧 NPC 可能没有这些字段）
for (const npc of gameState.npcs ?? []) {
  if (!npc.voice) {
    npc.voice = { features: [], syntax_rules: [], forbidden_phrases: [] };
  }
  if (npc.state && npc.state.pressure === undefined) {
    npc.state.pressure = 30;
  }
  if (!npc.memory) {
    npc.memory = { trauma: [], key_events: [], summary: '' };
  }
  if (!npc.memory.trauma) {
    npc.memory.trauma = [];
  }
  if (!npc.memory.key_events) {
    npc.memory.key_events = [];
  }
  if (!npc.goals) {
    npc.goals = [];
  }
}
```

---

### 8.6 M-41：史册虚拟列表（`ChroniclePage.tsx`）

史册超过 30 条时用 windowed 渲染，不引入额外库，用原生 scroll + slice：

```typescript
// ChroniclePage.tsx — 完整虚拟列表实现

import { useState, useRef, useEffect } from 'preact/hooks';

const ITEM_HEIGHT = 120;   // 每条史册估算高度（px）
const VISIBLE_COUNT = 8;   // 可见区域最多显示条数
const BUFFER = 2;          // 上下各多渲染几条防闪烁

export function ChroniclePage() {
  const state = getState();
  const [viewMode, setViewMode] = useState<'official' | 'unofficial'>('official');
  const isUnlocked = state.chronicle.official.length > 10;
  const allEntries = viewMode === 'official'
    ? state.chronicle.official
    : state.chronicle.unofficial;

  const [scrollTop, setScrollTop] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // 超过 30 条才启用虚拟渲染
  const useVirtual = allEntries.length > 30;

  const startIdx = useVirtual
    ? Math.max(0, Math.floor(scrollTop / ITEM_HEIGHT) - BUFFER)
    : 0;
  const endIdx = useVirtual
    ? Math.min(allEntries.length, startIdx + VISIBLE_COUNT + BUFFER * 2)
    : allEntries.length;

  const visibleEntries = allEntries.slice(startIdx, endIdx);
  const totalHeight = allEntries.length * ITEM_HEIGHT;
  const offsetY = startIdx * ITEM_HEIGHT;

  return (
    <div className="page-layout">
      <Navbar />
      <div className="chronicle-header">
        <h2>史册</h2>
        {isUnlocked && (
          <div className="chronicle-toggle">
            <button
              className={viewMode === 'official' ? 'toggle-active' : ''}
              onClick={() => setViewMode('official')}
            >正史</button>
            <button
              className={viewMode === 'unofficial' ? 'toggle-active' : ''}
              onClick={() => setViewMode('unofficial')}
            >野史</button>
          </div>
        )}
      </div>

      <div
        ref={containerRef}
        className="chronicle-scroll-container"
        style={{ height: `${VISIBLE_COUNT * ITEM_HEIGHT}px`, overflowY: 'auto' }}
        onScroll={e => setScrollTop((e.target as HTMLDivElement).scrollTop)}
      >
        {useVirtual ? (
          <div style={{ height: `${totalHeight}px`, position: 'relative' }}>
            <div style={{ transform: `translateY(${offsetY}px)` }}>
              {visibleEntries.map(entry => (
                <ChronicleEntry key={entry.id} entry={entry} />
              ))}
            </div>
          </div>
        ) : (
          allEntries.map(entry => (
            <ChronicleEntry key={entry.id} entry={entry} />
          ))
        )}
      </div>
    </div>
  );
}
```

---

### 8.7 M-42：召见子菜单接入真实 NPC 列表

**现状**：召见按钮直接发 `'召见大臣'` 字符串，LLM 随机选。

**修改位置**：`CourtPage.tsx` 的 `renderActionDashboard()` 函数，召见按钮改为悬停子菜单：

```typescript
// CourtPage.tsx — renderActionDashboard() 内，替换现有的召见按钮

const activeNpcs = getState().npcs.filter(n => n.status === 'active').slice(0, 8);

// 召见按钮改为带子菜单（复用现有 .action-with-submenu 样式，已有 CSS）：
<div className="action-with-submenu">
  <button className="action-button">👤 召见</button>
  <div className="submenu">
    {activeNpcs.length === 0 && (
      <span className="submenu-empty">暂无可召见的大臣</span>
    )}
    {activeNpcs.map(npc => (
      <button
        key={npc.id}
        onClick={() => {
          // 直接调用 gameTick 并传 targetNpcId
          submitCommandWithTarget('召见', npc.id);
        }}
        title={`${npc.faction}派 · ${npc.role}`}
      >
        {npc.name}
        <span className="npc-hint">
          {npc.state.pressure > 60 ? ' ⚠️' : ''}
          {npc.state.loyalty_to_emperor < 30 ? ' 💔' : ''}
        </span>
      </button>
    ))}
  </div>
</div>
```

```typescript
// CourtPage.tsx — 新增 submitCommandWithTarget 函数（在 submitCommand 附近）
// 目前 submitCommand 只接受 command 字符串，需要一个带 targetNpcId 的版本

async function submitCommandWithTarget(command: string, targetNpcId: string) {
  if (isProcessing) return;
  setIsProcessing(true);
  try {
    const result = await gameTick(getState(), command, targetNpcId);
    if (result.success) {
      setState(result.newState);
      if (result.narration) await typewriterEffect(result.narration);
      // 写史册（与现有逻辑相同）
      if (result.chronicle_entry) {
        const s = getState();
        const entry = { ...result.chronicle_entry, id: `chr_${Date.now()}` };
        setState({
          ...s,
          chronicle: {
            ...s.chronicle,
            official: [entry, ...s.chronicle.official]
          }
        });
      }
    }
  } catch (err) {
    console.error('[召见] 失败:', err);
  } finally {
    setIsProcessing(false);
  }
}
```

---

### 8.8 M-43：政策激活状态指示器

在资源面板区域下方（或 action-dashboard 上方）渲染当前激活的政策标签：

```typescript
// CourtPage.tsx — 在 renderActionDashboard() 之前，条件渲染激活政策列表

const activePolicies = getState().policies.active;

{activePolicies.length > 0 && (
  <div className="active-policy-bar">
    <span className="policy-bar-label">生效中：</span>
    {activePolicies.map(p => {
      const state = getState();
      const remaining = p.duration_years === -1
        ? '永久'
        : `${p.duration_years - (state.world.year - p.enacted_year)}年`;
      return (
        <span key={p.id} className="policy-chip" title={`颁布于第${p.enacted_year}年`}>
          {p.description}
          <span className="policy-chip-remaining">({remaining})</span>
        </span>
      );
    })}
  </div>
)}
```

---

### 8.9 policy-engine：faction_impact 接入 world.factions

`interpretPolicy()` 已经生成 `faction_impact`（各派系满意度变化），但返回后没人用它。

**修改位置**：`PolicyPanel.tsx` 的 `handleCustom()` 里，`setState()` 时追加：

```typescript
// PolicyPanel.tsx — handleCustom() 里 setState 时，在 resources 同级补充 factions 更新

const currentFactions = state.world.factions;
const newFactions = { ...currentFactions };

// result.effect.faction_impact 格式：{ '清流': +5, '宦官': -10, ... }
// world.factions 字段名：qingliu, didang, eunuch_faction
const FACTION_KEY_MAP: Record<string, keyof typeof newFactions> = {
  '清流': 'qingliu',
  '帝党': 'didang',
  '宦官': 'eunuch_faction'
};
for (const [factionName, delta] of Object.entries(result.effect.faction_impact ?? {})) {
  const key = FACTION_KEY_MAP[factionName];
  if (key) {
    newFactions[key] = Math.min(100, Math.max(0, (newFactions[key] ?? 50) + delta));
  }
}

setState({
  ...state,
  world: { ...state.world, factions: newFactions },  // ← 新增
  policies: { ...state.policies, active: [...state.policies.active, result.policy] },
  resources: applyImmediateChanges(state.resources, result.effect.resource_change),
  // ... 其余不变
});
```

---

### 8.10 新增 CSS（`components.css` 末尾追加）

以下是所有新 UI 元素需要的 CSS，统一在 `components.css` 末尾追加：

```css
/* ── 事件弹层 ── */
.event-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
}
.event-modal {
  background: var(--color-paper, #fdf6e3);
  border: 2px solid var(--color-ink, #3d2b1f);
  border-radius: 4px;
  padding: 24px;
  max-width: 480px;
  width: 90%;
  box-shadow: 0 8px 32px rgba(0,0,0,0.4);
}
.event-modal.seal-bloody { border-color: #8b0000; }
.event-modal.seal-urgent { border-color: #8b4513; }
.event-seal-icon { font-size: 2rem; text-align: center; margin-bottom: 8px; }
.event-name {
  font-size: 1.2rem;
  text-align: center;
  margin-bottom: 12px;
  color: var(--color-ink, #3d2b1f);
}
.event-narration {
  line-height: 1.8;
  margin-bottom: 16px;
  font-size: 0.95rem;
}
.event-choices { display: flex; flex-direction: column; gap: 8px; }
.event-choice-btn {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 10px 14px;
  background: transparent;
  border: 1px solid var(--color-ink, #3d2b1f);
  border-radius: 3px;
  cursor: pointer;
  text-align: left;
  transition: background 0.15s;
}
.event-choice-btn:hover { background: rgba(61, 43, 31, 0.08); }
.event-choice-btn:disabled { opacity: 0.5; cursor: not-allowed; }
.choice-label { font-weight: bold; font-size: 0.95rem; }
.choice-desc { font-size: 0.82rem; color: #666; margin-top: 2px; }

/* ── 资源速率标注 ── */
.resource-rate {
  font-size: 0.72rem;
  color: #5a7a3a;
  margin-left: 4px;
  font-variant-numeric: tabular-nums;
}
.resource-rate.negative { color: #8b2020; }

/* ── 激活政策指示条 ── */
.active-policy-bar {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 6px;
  padding: 6px 12px;
  background: rgba(61, 43, 31, 0.04);
  border-bottom: 1px solid rgba(61, 43, 31, 0.1);
  font-size: 0.82rem;
}
.policy-bar-label { color: #888; white-space: nowrap; }
.policy-chip {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  padding: 2px 8px;
  background: rgba(139, 69, 19, 0.1);
  border: 1px solid rgba(139, 69, 19, 0.3);
  border-radius: 10px;
  font-size: 0.78rem;
  cursor: default;
}
.policy-chip-remaining { color: #888; font-size: 0.72rem; }

/* ── 史册切换按钮 ── */
.chronicle-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
}
.chronicle-toggle {
  display: flex;
  gap: 4px;
}
.chronicle-toggle button {
  padding: 4px 12px;
  border: 1px solid var(--color-ink, #3d2b1f);
  background: transparent;
  cursor: pointer;
  font-size: 0.85rem;
  border-radius: 3px;
  transition: background 0.15s;
}
.chronicle-toggle button.toggle-active {
  background: var(--color-ink, #3d2b1f);
  color: var(--color-paper, #fdf6e3);
}
.chronicle-scroll-container {
  overflow-y: auto;
  padding: 0 16px;
}

/* ── 召见子菜单 NPC 提示 ── */
.npc-hint { font-size: 0.8rem; margin-left: 4px; }
.submenu-empty {
  display: block;
  padding: 8px;
  color: #999;
  font-size: 0.85rem;
  text-align: center;
}
```

---

### 8.11 标准错误处理模板（所有 LLM 调用均使用此模式）

Mimo 在所有新增的 LLM 调用周围，统一使用以下 try/catch 模式，不要自创格式：

```typescript
// 所有新 LLM 调用的标准包装（参考 policy-engine.ts 现有写法）

async function callWithFallback<T>(
  llmCall: () => Promise<string>,
  parser: (raw: string) => T,
  fallback: T,
  tag: string
): Promise<T> {
  try {
    const raw = await llmCall();
    const cleaned = raw.replace(/```json|```/g, '').trim();
    return parser(cleaned);
  } catch (err) {
    console.error(`[${tag}] LLM 调用或解析失败:`, err);
    return fallback;
  }
}

// 用法示例（命名事件 M-53）：
const name = await callWithFallback(
  () => callLLMWithRetry({ system: '...', user: '...', temperature: 0.5, tag: 'naming' }),
  (raw) => raw.trim().replace(/["「」\n]/g, '').slice(0, 10),
  template.name,  // 命名失败时直接用模板名作为回退
  'nameHistoricalEvent'
);
```

---

### 8.12 tick.ts：endCheck 未定义的 Bug 完整修复

第六节 M-30/M-31 给了修复方向，这里给完整的修复代码（替换 `tick.ts` 第 5 步区域）：

```typescript
// tick.ts — 替换从 "// 5. 检查游戏结束条件" 到最近的 "}" 的全部代码

// 5. 检查结局（ending-engine）与游戏结束条件（narration.ts）
const ending = checkEndings(simulationResult.newState);
const endCheck = checkGameEndConditions(simulationResult.newState);  // ← 这行原本缺失

if (ending) {
  simulationResult.events.push(`游戏结局：${ending.title}`);
}
if (endCheck.isEnded) {
  simulationResult.events.push(`游戏结束：${endCheck.reason}`);
}

// 将 ending 带出给 CourtPage 处理路由跳转
// TickResult 接口需要新增 ending 字段（types 不需改，TickResult 在 tick.ts 本文件定义）
```

```typescript
// tick.ts — TickResult 接口新增 ending 字段（在文件顶部的接口定义处）：
export interface TickResult {
  // ... 现有字段不变 ...
  ending?: { id: string; title: string; narrative: string; epilogue: string }; // 新增
}

// tick.ts — 第 6 步组装最终结果时追加：
const result: TickResult = {
  // ... 现有字段 ...
  ending: ending ?? undefined,   // 新增
};
```

```typescript
// CourtPage.tsx — 在 submitCommand 或 handleTickResult 的成功回调里追加：
if (tickResult.ending) {
  // 延迟 2 秒跳转，让叙事先显示
  setTimeout(() => { window.location.hash = '/ending'; }, 2000);
}
```

---

*代码补全完毕。Mimo 执行时：优先处理 8.12（Bug 修复）→ 8.1-8.5（类型和存档兼容）→ 8.10（CSS）→ 其余功能按 Phase 3 主线顺序推进。*
