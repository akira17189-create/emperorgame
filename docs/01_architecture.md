---
purpose: 工程架构与落地细节。前后端、LLM 接入、轻量化、图位、存档、技术栈。
audience: AI 写代码前必读；人类 review 架构
last_updated: 2026-04-17
---

# 01 — 架构

## 1. 运行形态

```
┌──────────────────────────────────────────┐
│         GitHub Pages（纯静态托管）          │
│  ┌────────────────────────────────────┐  │
│  │ index.html + 打包后的 JS / CSS       │  │
│  │ /assets/*  （图位占位目录）          │  │
│  └────────────────────────────────────┘  │
└──────────────────────────────────────────┘
                    │
                    ▼（浏览器运行）
┌──────────────────────────────────────────┐
│ 浏览器端                                    │
│ ├─ GameState（内存）                        │
│ ├─ IndexedDB（存档）                        │
│ ├─ localStorage（llm_config）                │
│ └─ fetch(baseURL + /v1/chat/completions)    │
└──────────────────────────────────────────┘
                    │
                    ▼（玩家自填的 API endpoint）
┌──────────────────────────────────────────┐
│ 任意 OpenAI 兼容的 LLM 服务                  │
└──────────────────────────────────────────┘
```

**关键决策**：
- **无自建后端**。API key 由玩家自己提供并保管，仅存在自己浏览器。
- 因此本仓库不承担任何 LLM 调用成本，也无需密钥管理。
- 代价是玩家必须自备 key；收益是部署成本 = 0、合规成本 = 0、迭代速度最高。

## 2. LLM 自填配置

### 2.1 设置页表单

游戏首次启动强制进入设置页，填完才能 New Game。

| 字段 | 类型 | 必填 | 说明 | 示例 |
|------|------|------|------|------|
| `baseURL` | string | 是 | OpenAI 兼容 endpoint 根路径 | `https://api.anthropic.com/v1` / `https://api.openai.com/v1` / 自建 gateway |
| `apiKey` | string | 是 | Bearer token | `sk-...` |
| `modelMain` | string | 是 | A 档模型（重要场景） | `claude-sonnet-4-6` / `gpt-4.1` |
| `modelCheap` | string | 否 | B 档模型（普通场景），缺省复用 Main | `claude-haiku-4-5` |
| `maxTokens` | number | 否 | 输出上限，默认 1024 | 1024 |
| `temperature` | number | 否 | 采样温度，默认 0.8 | 0.8 |
| `provider` | enum | 否 | `openai` / `anthropic` / `custom`，影响 headers | 自动识别 |

### 2.2 存储

```
localStorage["llm_config"] = JSON.stringify({
  baseURL, apiKey, modelMain, modelCheap, maxTokens, temperature, provider
})
```

- 不出浏览器，不写云端。
- 提供"导出配置"和"清除密钥"按钮。
- 关闭页面不丢失；换浏览器需要重填（暂不做同步）。

### 2.3 调用封装（`engine/llm.ts`）

```ts
// 伪代码
export async function llmCall(
  layer: 'A' | 'B',
  messages: ChatMessage[],
  opts?: { maxTokens?: number; temperature?: number }
): Promise<string>
```

- 读 `localStorage.llm_config`
- 根据 `layer` 选择 `modelMain` / `modelCheap`
- 拼 URL：`${baseURL}/chat/completions`
- Headers 按 `provider` 适配（`Authorization: Bearer` vs `x-api-key` 等）
- 返回纯文本；解析 JSON 是上层的事
- **无密钥时抛 `NoLLMConfigError`**，UI 捕获后引导回设置页
- **C 档完全不走此函数**，由 `engine/templates.ts` 处理

### 2.4 降级模式

`llm_config` 为空时，游戏仍可启动：
- 新建档可用"预置剧本模式"：全部走 C 档模板
- 史册只读
- 上朝提示"先配置 LLM"
- 明确告知玩家"当前为只读演示"

## 3. 轻量化三板斧

### 3.1 三档生成

| 档位 | 场景 | 调用方 | 模型 |
|------|------|--------|------|
| **A** | 上朝官员对话、重大事件叙事、史册段落、人物评价 | `llmCall('A', ...)` | 玩家填的 `modelMain` |
| **B** | 普通奏折、小事件、NPC 闲聊、指令归一化 parser | `llmCall('B', ...)` | 玩家填的 `modelCheap` |
| **C** | 天气、资源日志、代理执政日志、占位对话 | `templates.render(id, vars)` | 本地字符串插值，0 API |

### 3.2 延迟生成 + 骨架 UI

- 玩家点"上朝"→ 立刻渲染场景骨架 + 官员占位头像 + 省略号
- 异步流式接收 token，渐入文字
- 绝不阻塞 UI 线程
- 离线累积事件登录时只对"最上面那封密信"做 A 档生成，其余"点开再生成"

### 3.3 语义缓存

- 缓存 key：`sha256(JSON.stringify({snapshot, command, skills, layer}))`
- 存 IndexedDB，容量上限 200 条，LRU 淘汰
- 命中率不是核心诉求（游戏状态每轮变化），但对"连续几年加税"这种高度重复指令非常有效
- 手动清理入口放在设置页

## 4. 高自由度入口

### 4.1 自由文本指令

金銮殿底部一个输入框，接受任意中文自然语言。

### 4.2 指令归一化管线

```
玩家文本
  ↓ （B 档 LLM）
{ intent: "增加税收", targets: ["户部"], params: { ratio: 1.5 }, raw: "加税五成" }
  ↓ （决策层路由）
SKILL_ROUTES[intent] → 2~4 个子技能
  ↓ （A 档 LLM，Layer 2+3 Prompt）
Decision Trace JSON
  ↓ （A 档 LLM，Layer 4 Prompt）
叙事文本
```

归一化后的 `intent` 字符串只需枚举常见类别（加税/减税/调兵/任命/赦免/征召/修筑/禁令/下诏/其他），其余 fallback 到"其他"类走通用 Prompt。

### 4.3 开放式政策系统

- 政策 = `Set<string>` 标签集合，不预定义国家类型
- "强管控经济"这种国家类型是**涌现属性**，由 UI 根据标签组合动态归类
- 新标签通过 LLM 生成时自动扩展标签空间

## 5. 图位预留

### 5.1 Schema 约定

所有可视实体带 `Visual` 字段（详见 `04_gamestate_schema.md`）：

```ts
interface Visual {
  image: string | null         // 相对路径，如 "/assets/npc/hai-rui.webp"
  image_prompt: string | null  // 英文，供未来 AI 生图或人类画师参考
}
```

### 5.2 资源目录约定

```
/assets/
├── npc/{slug}.webp           NPC 半身像，512×768
├── events/{event_id}.webp    事件插图，1024×576
├── places/{slug}.webp        场景底图，1920×1080
├── policies/{slug}.webp      政策图标，128×128
├── ui/paper-white.webp       宣纸底（盛世）
├── ui/paper-yellow.webp      枯黄底（乱世）
└── ui/placeholder-*.svg      占位纹章（纯 CSS 生成或极小 SVG）
```

### 5.3 占位渲染规则

| `image` | `image_prompt` | 渲染 |
|---------|---------------|------|
| 有值 | 任意 | 直接用 `<img src="...">` |
| null | 有值 | 占位纹章 + hover tooltip 显示 prompt（开发期可视化缺图）|
| null | null | 纯文字卡片（无图洞） |

**核心原则**：文字系统**永不依赖**图片存在。MVP 全程不放真图。

## 6. 云存档 Hook

### 6.1 SaveAdapter 接口

```ts
interface SaveAdapter {
  list(): Promise<SaveMeta[]>
  save(slot: string, data: GameState): Promise<void>
  load(slot: string): Promise<GameState | null>
  delete(slot: string): Promise<void>
}
```

### 6.2 两个实现

- `IDBAdapter`：基于 IndexedDB，**MVP 默认**
- `SupabaseAdapter`：占位文件，导出空类 + TODO 注释，**不实装**

### 6.3 切换机制

设置页"存档位置"下拉选：本地（默认） / 云端（占位，disabled）。

上线云存档时：
- 新增"登录"流程
- 实装 SupabaseAdapter
- 提供"本地→云端"的一次性迁移按钮
- 不做实时双向同步（复杂度过高）

## 7. 前端技术栈

| 方面 | 选型 | 理由 |
|------|------|------|
| 语言 | TypeScript | schema 友好 |
| 框架 | **Preact**（10KB）或纯原生 | 禁止 React/Vue 全家桶 |
| 构建 | Vite | 快、HMR、产物小 |
| 样式 | 原生 CSS + CSS 变量（支持主题切换） | 无需 Tailwind |
| 状态 | 单一 `GameState` 对象 + 发布订阅 | 别上 Redux/Zustand |
| 持久化 | IndexedDB（通过 `idb` 轻量 wrapper） | |
| Markdown | 不需要（游戏文本非 MD） | |
| 目标产物 | ≤ 300KB gzip | 衡量轻量化 |

### 路由

单一 HTML 入口，hash 路由：
- `#/settings` — LLM 配置
- `#/new` — 新建档选择剧本
- `#/court` — 金銮殿
- `#/chronicle` — 史册
- `#/saves` — 存档管理

## 8. 文件布局（未来代码仓库结构）

```
./
├── index.html
├── vite.config.ts
├── package.json
├── assets/                 图位目录（MVP 全占位）
├── src/
│   ├── main.ts
│   ├── components/         Preact 组件
│   ├── engine/
│   │   ├── state.ts        GameState 管理 + 发布订阅
│   │   ├── save.ts         IDBAdapter + Supabase 占位
│   │   ├── llm.ts          三档调度 + 缓存
│   │   ├── templates.ts    C 档本地模板
│   │   ├── skills.ts       技能路由字典（从 skill_routing_supplement 翻译）
│   │   ├── tick.ts         离线数值演算（后续阶段）
│   │   └── narrator.ts     Layer 4 叙事层封装
│   ├── prompts/            .md 模板文件，构建时 inline
│   ├── data/               种子 NPC / 种子政策 / C 档文案
│   └── ui/                 页面级组件
├── docs/                   本目录
└── ../skill/               保留原位，构建时读取为 prompt 素材
```

## 9. 性能 / 安全边界

- **API key 暴露风险**：key 在玩家浏览器，理论上 XSS 可偷。CSP 头 + 不嵌任何第三方 script 缓解。
- **恶意玩家刷费用**：他刷自己的 key，与本仓库无关。
- **XSS 攻面**：任何 LLM 输出必须 escape 后插入 DOM；严禁 `innerHTML`；用 `textContent` 或 Preact JSX。
- **Prompt 注入**：玩家自由输入会喂给 LLM，可能诱导 AI 输出恶意 JSON。对策：严格 JSON schema 校验，校验失败即重试并降级；对 Layer 1 世界规则做 system message 前置，不受玩家输入污染。
