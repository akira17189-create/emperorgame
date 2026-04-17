---
purpose: "上朝 + 史册" 垂直切片的明确边界与验收标准。MVP 开工清单。
audience: AI / 人类开工时对照
last_updated: 2026-04-18
---

# 06 — MVP 范围：上朝 + 史册垂直切片

**MVP 目标**：证明整套架构能跑通。**不追求玩法完整**，追求的是从"玩家输入"到"决策 JSON → 叙事 → 进史册"的**一个完整链路**能稳定工作。

---

## 1. 范围边界

### ✅ 包含（In）

| 模块 | 具体要求 |
|------|---------|
| LLM 配置页 | 表单填 baseURL / apiKey / modelMain / modelCheap；localStorage 保存；测试按钮（发一次极小请求校验可用） |
| 新建档 | 选"明朝 · 嘉靖三年"一个预置剧本；固定初始 resources；固定 3 个种子 NPC |
| 金銮殿场景 | 纯 CSS 宣纸背景 + 3 个 NPC 占位卡 + 底部指令输入框 |
| 3 个种子 NPC | 完整 `NPC` 字段：海瑞 / 严嵩 / 张居正（权重、voice、memory 空） |
| 自由文本指令 | 输入框 + 提交按钮 + 骨架加载态 |
| 指令归一化 | B 档 LLM 调用，返回 `intent` |
| 单 NPC 决策 | **MVP 不做多 Agent 冲突**；只挑 1 个最相关 NPC（按 intent 的 `by_role` 命中）生成 decision_trace |
| 叙事生成 | A 档 LLM 调 Layer 4 Prompt，生成 150~300 字中文叙事 |
| 史册写入 | decision_trace + 叙事写入 `chronicle.official[]` |
| 史册查看页 | `#/chronicle` 路由，按年倒序列出条目，可展开看全文 |
| IDB 存档 | 手动"保存"按钮，最多 3 个存档槽，支持加载/删除 |
| 路由 | hash 路由：settings / new / court / chronicle / saves |

### ❌ 不包含（Out，后续阶段处理）

- 多 Agent 冲突与仲裁（Prompt 4 先不实装）
- 放置 / 资源 tick（`engine/tick.ts` 暂不写，资源静止）
- 代理执政 / 离线演算
- 挂起事件 / 密信 UI
- 记忆 LRU 淘汰（MVP 的 NPC 记忆为空或固定）
- 政策系统（MVP 指令不改政策）
- 风格标签切换（MVP 固定用"史官视角 + 克制叙述"）
- 王朝轮回 / 传承 / 内禅密旨
- 真实图片（占位纹章即可）
- 音效
- 云存档（留接口不实装）
- 指令校验与越狱检测（先相信玩家）
- 缓存层（`hash()` 缓存暂不实装）

---

## 2. 文件交付清单（MVP 阶段 1）

```
./
├── index.html                  Vite 入口
├── vite.config.ts
├── package.json
├── src/
│   ├── main.ts                 bootstrap + 路由
│   ├── styles.css
│   ├── engine/
│   │   ├── types.ts            从 04_gamestate_schema.md 翻译
│   │   ├── state.ts            单例 + 发布订阅
│   │   ├── save.ts             IDBAdapter + Supabase 占位类
│   │   ├── llm.ts              三档调度（MVP 只用 A、B）
│   │   ├── skills.ts           路由字典 + 拼装
│   │   └── narrator.ts         Prompt 拼装 + JSON 解析
│   ├── prompts/
│   │   ├── layer1-world-rules.md
│   │   ├── normalize-command.md
│   │   ├── role-execution.md
│   │   └── narration.md
│   ├── data/
│   │   ├── seed-npcs.ts        海瑞 / 严嵩 / 张居正
│   │   ├── seed-scenario.ts    明朝嘉靖三年初始状态
│   │   └── labels.ts           英→中映射
│   └── ui/
│       ├── SettingsPage.tsx
│       ├── NewGamePage.tsx
│       ├── CourtPage.tsx
│       ├── ChroniclePage.tsx
│       ├── SavesPage.tsx
│       └── components/
│           ├── VisualSlot.tsx
│           ├── NpcCard.tsx
│           └── ChronicleEntry.tsx
```

---

## 3. 验收 Checklist

MVP 完成 = 以下全部 ✅：

- [ ] **C1 配置校验**：清空 localStorage 后打开游戏，被强制跳到设置页；填错的 key 点"测试"按钮报错；填对后可继续。
- [ ] **C2 一次完整流程**：新建档 → 金銮殿 → 输入"加税三成" → 3 秒内看到加载动画 → 海瑞说出一段 150~300 字的反对话（符合 15 条文风，无"内心复杂"等禁词） → 点"存档" → 刷新页面 → 加载存档 → 状态完整恢复。
- [ ] **C3 史册可读**：连续输入 3 个不同指令后，史册页按年倒序显示 3 条记录，每条可展开看全文和"决策依据"折叠区（decision_path 的中文渲染）。
- [ ] **C4 devtools 零泄漏**：Network 面板能看到 fetch 去了玩家填的 baseURL，Authorization header 可见（自己的 key，无所谓），但没有任何第三方追踪请求。
- [ ] **C5 空配置降级**：清空 llm_config 后，游戏能打开新档（走 C 档占位文案），能看存档，不崩溃；明确提示"当前为只读演示模式"。
- [ ] **C6 Gzip ≤ 300KB**：`npm run build` 产物 gzip 后 ≤ 300KB。
- [ ] **C7 占位图不报错**：所有 NPC / 史册条目的 `image` 字段为 null，但 UI 不出现碎图或控制台 404。
- [ ] **C8 GitHub Pages 部署**：push 到 main 后 GitHub Actions 自动部署到 Pages，访问 URL 即可玩。

---

## 4. 不在本阶段解决但需要**接口预留**的

这些字段 / 钩子在 MVP 中就要**存在但不实装**，避免后续重构：

| 预留点 | 为谁预留 |
|--------|---------|
| `SaveAdapter` 接口 + Supabase 占位类 | 阶段 ? 云存档 |
| `GameState.events` / `pending_events` 字段 | 阶段 2 放置系统 |
| `GameState.world.wills[]` 字段 | 阶段 3 传承 |
| `engine/tick.ts` 空文件 + 导出签名 | 阶段 2 |
| Prompt 4 仲裁模板（文件就绪，不调用）| 阶段 3 多 Agent |
| `Visual` 字段全量落位 | 阶段 4 真图 |
| Style tag 切换器 UI（开关隐藏）| 风格扩展 |

---

## 5. MVP 预估工作量

| 子任务 | 预估 | 说明 |
|--------|------|------|
| TS schema 翻译 | 半天 | 从 `04_gamestate_schema.md` 照抄 |
| Vite + Preact 项目骨架 | 半天 | |
| LLM 调用封装 + provider 适配 | 半天 | OpenAI / Anthropic headers 差异 |
| Prompt 模板 .md 文件编写 | 半天 | 照抄 `05_prompt_layers.md` |
| 5 个页面 + 组件 | 2 天 | |
| IDB 存档适配器 | 半天 | 用 `idb` npm 包 |
| 种子数据（NPC × 3 + 剧本 × 1） | 半天 | 需要人类补内容 |
| 样式 / 宣纸感 | 半天 | |
| 联调 + bug fix | 1 天 | |
| GH Pages 部署 | 2 小时 | Actions 一次过 |

总计：**约 6~7 个人日**。

---

## 6. 下一阶段（MVP+1）拿到 MVP 再开

不在本文讨论。MVP 验收通过后，参考以下顺序扩展：

1. **放置层**：`engine/tick.ts` + 离线演算 + 挂起事件 UI
2. **多 Agent 冲突**：Prompt 4 启用 + 并发调度
3. **政策系统**：标签化政策 + UI
4. **风格切换**：让玩家选主题风格
5. **传承 / 王朝轮回**：内禅密旨 + 继承系统
6. **真图灌入**：按目录约定批量填图
7. **云存档**：实装 SupabaseAdapter

---

## 7. Phase 2 核心功能开发计划（当前阶段）

**执行时间**: 2026年04月18日  
**前置条件**: Phase 1.3 完成（技能系统、Token护栏、系统测试）
**目标**: 实现游戏核心机制，从"指令-叙事"提升到"指令-决策-演算-叙事"

### 7.1 任务清单

| 任务 | 优先级 | 预估工时 | 描述 |
|------|--------|----------|------|
| **arbitration.md 完善** | P1 | 2天 | 多Agent仲裁系统，处理NPC间冲突与博弈 |
| **tick.ts 实现** | P1 | 3天 | 离线演算引擎，处理资源变化、NPC行为、随机事件 |
| **资源管理系统** | P1 | 2天 | 粮食、人口、财政、军事、民心等资源的计算与平衡 |

### 7.2 详细任务说明

#### 7.2.1 arbitration.md 完善（多Agent仲裁系统）

**目标**: 实现游戏权谋感的核心，处理多个NPC之间的冲突与博弈

**关键组件**:
- **NPC立场分析**: 基于NPC的role、loyalty、memory分析其立场
- **冲突检测**: 识别NPC之间的利益冲突和立场对立
- **仲裁机制**: 皇帝作为最终仲裁者，决定采纳哪一方的建议
- **博弈结果**: 生成符合各方立场的决策和叙事

**技术要求**:
- 输入: IntentResult + NPC列表 + 世界状态
- 输出: DecisionTrace[] + 冲突描述 + 最终决策
- Prompt: `arbitration.md` 需要包含完整的仲裁逻辑

#### 7.2.2 tick.ts 实现（离线演算引擎）

**目标**: 实现完整的离线演算引擎，处理游戏世界的自动演化

**关键组件**:
- **资源变化**: 基于政策、NPC行为、随机事件计算资源变化
- **NPC行为**: NPC基于其性格、立场、记忆做出自主决策
- **随机事件**: 生成符合时代背景的随机事件
- **世界状态更新**: 更新世界状态，推进游戏时间

**技术要求**:
- 输入: GameState + 决策历史 + 随机种子
- 输出: GameState更新 + 事件列表 + 世界变化描述
- 文件: `engine/tick.ts` 需要实现 `executeTick` 函数

#### 7.2.3 资源管理系统

**目标**: 实现完整的资源计算与平衡机制

**关键资源**:
- **粮食**: 产量、消耗、储备
- **人口**: 总数、农业人口、军事人口
- **财政**: 收入、支出、国库
- **军事**: 兵力、军费、装备
- **民心**: 满意度、忠诚度、稳定性

**技术要求**:
- 资源消耗与产出计算
- 资源平衡机制
- 资源危机预警
- 资源变化对NPC行为的影响

### 7.3 架构约束

1. **状态管理**: 只通过 `getState()`/`setState()` 管理状态
2. **依赖控制**: 不引入新npm包（目标bundle ≤ 300KB gzip）
3. **XSS防护**: LLM输出通过 `typewriterEffect` 渲染，无 `innerHTML`
4. **知识库优先**: 基于 `skill_routing_supplement.md` 实现路由
5. **向后兼容**: 保持Phase 1的功能完整性

### 7.4 验收标准

- [ ] **C1 多Agent仲裁**: 输入"加税"指令后，海瑞、严嵩、张居正各自表达立场，皇帝需要做出选择
- [ ] **C2 离线演算**: 连续输入3个指令后，tick系统自动推进一年，资源自动变化
- [ ] **C3 资源平衡**: 粮食、人口、财政等资源有明确的计算逻辑，不会出现负数或溢出
- [ ] **C4 随机事件**: 有一定概率触发随机事件，如天灾、外敌入侵、官员腐败等
- [ ] **C5 NPC自主行为**: NPC会基于其性格和立场做出自主决策，如上书谏言、派系斗争等

### 7.5 技能系统状态（Phase 1.3 完成）

**技能ID覆盖情况**:
- 总技能ID: 32个（在fallbackContent中定义）
- 知识库技能: 12个（基于skill_routing_supplement.md）
- 原始技能: 10个（基于skills-bundle.ts）
- 补充技能: 10个（新增）

**Token使用情况**:
- 最大限制: 1200字符（约1500 token）
- 实际使用: 94-152字符（约120-190 token）
- 安全边际: 89%
- 超限风险: 无

**意图类型覆盖**:
- 加税、减税、调兵、任命、赦免、征召、修筑、禁令、下诏、其他
- 所有10个意图类型完全可用

### 7.6 预估工作量

| 子任务 | 预估 | 说明 |
|--------|------|------|
| arbitration.md 编写 | 2天 | 多Agent仲裁Prompt设计与实现 |
| tick.ts 核心逻辑 | 2天 | 资源变化、NPC行为、随机事件 |
| 资源管理系统 | 1天 | 资源计算与平衡机制 |
| 系统集成测试 | 1天 | 多Agent、tick、资源系统的联合测试 |
| bug修复与优化 | 1天 | 性能优化、边界情况处理 |

**总计：约7~8个人日**

### 7.7 下一阶段（Phase 3）展望

Phase 2完成后，可进入以下高级功能开发：

1. **流式输出**: 真正的LLM流式响应，提升用户体验
2. **高级技能路由**: by_role/by_era条件技能选择，实现更精细化的技能路由
3. **数据同步**: seed-npcs.ts与core-characters.ts对齐，确保数据一致性
4. **风格切换**: 让玩家选择叙事风格，如史官视角、小说视角等
5. **传承系统**: 内禅密旨、继承系统，实现王朝轮回

---

*Phase 2计划记录时间: 2026年04月18日*
