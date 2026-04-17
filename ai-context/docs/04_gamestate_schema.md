---
purpose: GameState 顶层数据结构定义。存档格式、AI 上下文来源、UI 数据源。
audience: AI 写 TypeScript schema 时照抄；人类 review 数据模型
last_updated: 2026-04-17
---

# 04 — GameState Schema

**本文件定义的是字段清单和语义，不是 TypeScript 代码**。实际 `.ts` 文件由实现阶段翻译生成。

本 schema 是**单一事实源**：存档 = serialize(state)；UI 渲染 = 读 state；API 调用 = 从 state 抽快照。

---

## 顶层结构

```
GameState
├─ meta           元数据（版本、存档位、时间戳）
├─ emperor        当前皇帝
├─ world          世界状态
├─ resources      核心数值
├─ policies       政策集合
├─ npcs           所有 NPC（活跃+归档）
├─ events         事件池
├─ chronicle      史册
├─ style_state    当前叙事风格
├─ llm_config     LLM 接入配置（不参与 AI 上下文）
└─ ui_state       UI 临时状态（不存档）
```

---

## `meta`

| 字段 | 类型 | 说明 |
|------|------|------|
| `version` | string | schema 版本，如 `"1.0.0"` |
| `created_at` | ISO8601 string | 存档创建时间 |
| `last_saved_at` | ISO8601 string | 上次保存 |
| `save_slot` | string | 存档槽 id |
| `game_year` | number | 当前游戏年（从开局起计） |
| `real_time_played_ms` | number | 玩家累计真实游玩时长 |

---

## `emperor`

```
{
  id: string,
  name: string,
  age: number,
  generation: number,          // 第几代
  prestige: 0~100,             // 威望
  traits: TraitWeights,        // 见下
  knowledge: string[],         // 已解锁的穿越者知识点
  memory: {
    trauma: TraumaEntry[<=5],
    key_events: KeyEvent[<=10]
  },
  wills_received: string[],    // 继承自前代的 imperial_will id
  visual: Visual               // 肖像图位
}
```

### `TraitWeights`

```
{
  loyalty: 0~1,       // 皇帝也有"忠"：对祖宗家法 / 先帝遗命
  ambition: 0~1,
  greed: 0~1,
  courage: 0~1,
  rationality: 0~1,
  stability: 0~1
}
```

---

## `world`

```
{
  dynasty: "汉" | "唐" | "宋" | "明" | "清" | "架空",
  era: string,                    // 当前年号
  year: number,                   // 年号内第几年
  tone: Tone,                     // 全局调性
  named_events: NamedEvent[<=8],
  collective_memory: string[<=20], // 被 LRU 淘汰的 world 记忆摘要
  wills: ImperialWill[],          // 历代遗诏链
  weather_this_year: 0~1,         // 本年天气系数
  conflict_ratio: 0~1             // 当前战乱比例
}
```

### `Tone`

枚举：`"匮乏"` | `"尚武"` | `"浮华"` | `"猜忌"` | `"绝望"`

### `NamedEvent`

```
{
  id: string,
  name: string,           // "黑市之乱"
  year: number,
  cause: string,
  summary: string,        // 一句话
  impact: { [resource]: number },
  image: string | null,
  image_prompt: string | null
}
```

### `ImperialWill`

```
{
  id: string,
  from_emperor_id: string,
  generation: number,
  parent_will_id: string | null,
  diff: string,                   // 增量 prompt 片段
  inherited_at_year: number
}
```

---

## `resources`

所有核心数值的当前值。参见 `03_fixes_p1.md §4`。

```
{
  food: number,           // 0~100000
  population: number,
  fiscal: number,         // 可为负（赤字）
  military: 0~100,
  morale: 0~100,
  eunuch: 0~100,
  threat: 0~100,
  faction: 0~100,
  agri_pop: number,       // 农业人口
  land_fertility: 0~1,
  tax_rate: 0~1,
  military_cost: number,
  disaster_relief: number,
  commerce: number
}
```

---

## `policies`

```
{
  active: Policy[],
  history: PolicyLog[]
}
```

### `Policy`

```
{
  id: string,
  tags: string[],         // 开放集合，如 ["加税", "限商", "官营"]
  enacted_year: number,
  enacted_by: string,     // NPC id 或 emperor_id
  description: string,    // 一句话描述
  visual: Visual          // 政策图标
}
```

### `PolicyLog`

```
{
  policy_id: string,
  action: "enact" | "repeal" | "amend",
  year: number,
  reason: string
}
```

---

## `npcs`

```
NPC[]

NPC = {
  id: string,
  slug: string,                 // URL 友好，用于图位路径
  name: string,
  role: string,                 // 官职
  faction: string,              // 派系
  status: "active" | "archived" | "dead",
  archived_reason?: string,     // 若 archived
  death_year?: number,

  traits: TraitWeights,
  state: NPCState,
  memory: NPCMemory,
  bias: { [concept: string]: 0~1 },
  relations: { [other_npc_id: string]: Relation },
  voice: VoiceProfile,
  visual: Visual
}
```

### `NPCState`

```
{
  pressure: 0~100,
  satisfaction: 0~100,
  recent_events: string[<=3],   // 近期事件 id
  behavior_modifier: string,    // "消极怠工" / "积极逢迎" 等短语
  loyalty_to_emperor: 0~100     // 动态值，与 traits.loyalty 不同
}
```

### `NPCMemory`

```
{
  trauma: TraumaEntry[<=5],
  key_events: KeyEvent[<=10],
  summary: string               // 被淘汰记忆的合并摘要
}
```

### `TraumaEntry` / `KeyEvent`

```
{
  event_id: string,
  event_name: string,
  year: number,
  type: string,                 // "亲历叛乱" / "被皇帝赏识"
  intensity: 0~1,               // 情感强度
  impact: string,               // 一句话影响
  trigger_words: string[]       // 唤起联想的关键词
}
```

### `Relation`

```
{
  kind: "同科" | "师生" | "仇敌" | "姻亲" | "上下级" | "盟友" | "其他",
  weight: -1~1,                 // 负=敌对，正=友好
  since_year: number,
  notes: string
}
```

### `VoiceProfile`

```
{
  features: string[],           // ["逻辑严密", "多用反问"]
  syntax_rules: string[],       // ["句尾多用'乎哉'"]
  forbidden_phrases: string[]   // 该角色绝不说的话
}
```

---

## `events`

```
{
  pending: PendingEvent[],      // 待玩家拆封的密信
  named: string[],              // 指向 world.named_events 的 id
  raw_logs: RawLog[<=500],      // 完整日志（第一层压缩前的原始）
  rolling_summary: string       // 第二层压缩摘要
}
```

### `PendingEvent`

```
{
  id: string,
  triggered_year: number,
  template_id: string,          // "民变_临界" 等
  severity: 1~5,
  raw_payload: any,             // 待叙事化的原始数据
  seal: "normal" | "urgent" | "bloody",  // 密信封面（§10.4 视觉）
  narrated: boolean,            // 是否已调 A 档 LLM 生成叙事
  narration?: string            // 叙事文本
}
```

### `RawLog`

```
{
  year: number,
  kind: "policy" | "event" | "tick" | "command" | "decision",
  payload: any
}
```

---

## `chronicle`

```
{
  official: ChronicleEntry[],       // 本纪 / 列传 / 平准货殖
  unofficial: ChronicleEntry[],     // 野史
  pending_segments: string[]        // 待生成的段落 id
}
```

### `ChronicleEntry`

```
{
  id: string,
  kind: "本纪" | "列传" | "平准" | "野史",
  subject_id?: string,              // 指向 emperor 或 npc
  year_range: [number, number],
  text: string,
  style_tags: string[],
  source_logs: string[],            // 追溯到 raw_logs / decision_traces
  image: string | null,
  image_prompt: string | null
}
```

---

## `style_state`

```
{
  current_tags: string[],       // ["史官视角", "克制叙述"]
  rules_version: string,        // 文风 15 条文档版本号，变更时提醒重测
  last_changed_year: number
}
```

---

## `llm_config`

**不参与 AI 上下文，不进存档导出**（因含密钥）。

```
{
  baseURL: string,
  apiKey: string,
  modelMain: string,
  modelCheap: string,
  maxTokens: number,
  temperature: number,
  provider: "openai" | "anthropic" | "custom"
}
```

实际存于 `localStorage.llm_config`，不在 IndexedDB 存档内。

---

## `ui_state`

**不存档**。页面刷新重置。

```
{
  current_scene: "settings" | "new" | "court" | "chronicle" | "saves",
  visible_npcs: string[],       // 当前场景显示的 NPC id
  image_overrides: { [entity_id: string]: string }  // 开发期手动替换图路径
}
```

---

## `Visual` 通用字段

出现在所有可视实体（`emperor / npc / event / policy / chronicle / place`）：

```
{
  image: string | null,          // "/assets/npc/hai-rui.webp"
  image_prompt: string | null    // 英文 prompt
}
```

渲染三态：
- `image != null` → `<img>`
- `image == null && image_prompt != null` → 占位纹章 + hover 显示 prompt
- 两者都 null → 纯文字卡片

---

## 完整 TypeScript 翻译（写代码时用）

实现阶段由 AI 翻译本文件为 `src/engine/types.ts`，并附：

- JSON schema 校验函数（用 `ajv` 或手写）
- 默认值工厂 `createEmptyGameState()`
- Migration 辅助函数（version 升级时）

**此文件是规范；`types.ts` 是规范的 TypeScript 实现。规范变更需同时更新两处 + `08_decisions.md`**。
