# 皇帝游戏 Phase 4 — 执行顺序与 Prompt 手册

> **基于代码实际核查**（2026-04-21）  
> 核查结论：Phase 4.1~4.3 绝大部分已完成，当前真正待做的只有下列8项任务。  
> 执行顺序按依赖关系和风险优先级排列。

---

## 执行顺序总览

| 顺序 | 任务ID | 任务名 | 负责 | 优先级 | 前置依赖 |
|------|--------|--------|------|--------|----------|
| 1 | M-D | 存档向后兼容迁移 | Mimo | 🔴 P0 发布风险 | 无 |
| 2 | DS-A | 结局5个占位符叙事 | DeepSeek | 🔴 P0 内容缺失 | 无 |
| 3 | M-C | 叙事补丁合并进代码 | Mimo | 🟡 P1 | DS-A完成后 |
| 4 | DS-B | 新手引导文案 | DeepSeek | 🟡 P1 | 无 |
| 5 | M-B | 新手引导代码实现 | Mimo | 🟡 P1 | DS-B完成后 |
| 6 | M-A | 资源数值变化动画 | Mimo | 🟡 P1 | 无 |
| 7 | DS-C | 补全9个测试剧本 | DeepSeek | 🟢 P2 | 无 |
| 8 | DS-D/README | 文档对齐与README更新 | DeepSeek | 🟢 P2 | 全部完成后 |

---

## 任务 1 — M-D：存档向后兼容迁移

**负责**：Mimo  
**优先级**：🔴 P0（上线必须，否则旧存档玩家进游戏直接崩溃）  
**文件**：`ai-context/src/engine/save.ts`  
**背景**：`world.factions` 是新字段，旧版本存档加载时该字段为 `undefined`，会导致 `state-updater.ts` 和 `event-engine.ts` 里的 factions 相关代码运行时报错。

---

### Prompt for Mimo

```
你是一个 TypeScript 开发者，负责「皇帝游戏」项目的存档兼容迁移。

## 背景

项目新增了 `world.factions` 字段（类型定义在 `types.ts`）：
```typescript
factions: {
  qingliu: number;       // 清流派势力 0~100
  didang: number;        // 帝党势力 0~100
  eunuch_faction: number; // 宦官党势力 0~100
}
```
但旧版存档的 `world` 对象里没有这个字段，加载时会是 `undefined`，导致运行时崩溃。

## 任务

在 `ai-context/src/engine/save.ts` 的存档加载函数中（函数名包含 `load`），找到反序列化/解析存档对象的位置，加入迁移逻辑：

```typescript
// 存档迁移：补全 world.factions 默认值（旧存档兼容）
if (gameState.world && !gameState.world.factions) {
  gameState.world.factions = {
    qingliu: 50,
    didang: 50,
    eunuch_faction: 30,
  };
}
```

同时检查 `world.collective_memory` 是否也可能缺失，若缺失则补全为空数组 `[]`。

## 要求

- 只修改 save.ts，不动其他文件
- 迁移逻辑加在数据读取之后、返回 gameState 之前
- 加注释说明这是迁移代码
- 修改完后输出修改后的完整 save.ts 文件

## 相关文件路径

- `ai-context/src/engine/save.ts`（主改动文件）
- `ai-context/src/engine/types.ts`（参考类型定义，只读）
```

---

## 任务 2 — DS-A：结局5个占位符叙事完善

**负责**：DeepSeek  
**优先级**：🔴 P0（结局是游戏终点，叙事质量直接影响体验）  
**背景**：`ending-engine.ts` 中8个结局，其中 E3/E6/E7 已有精准修订叙事（`docs/ending-narrative-patch.md`），但 E1/E2/E4/E5/E8 的叙事中仍含 `{{event_1}}` `{{event_2}}` 占位符，运行时会被 `collective_memory[0/1]` 动态替换（兜底词为「登基之初」「新政推行」）。兜底词太苍白，需要将占位符改写为**固化的具体情节描述**，让叙事在任何游戏状态下都能自洽。

---

### Prompt for DeepSeek

```
你是「皇帝游戏」的首席文案创作者。游戏背景是架空历史「靖朝」，玩家扮演穿越者皇帝，文风参考《明朝那些事儿》——幽默、克制、有人情味，史官视角，白话但有古意。

## 任务

「皇帝游戏」的结局系统有8种结局，每种结局有一篇300-500字的史官叙事。其中 E1/E2/E4/E5/E8 的叙事里有占位符 `{{event_1}}` 和 `{{event_2}}`，原本打算动态替换为游戏内实际发生的事件，但这个机制的兜底词（「登基之初」「新政推行」）太苍白。

请你**为每个结局写一个固化的具体事件描述**，替换掉占位符，使叙事不依赖动态内容也能成立。要求：
- 事件描述要具体生动（一件事、一个人、一个细节），而非泛泛而谈
- 符合该结局的基调（见下）
- 能自然嵌入原叙事语境中（用于替换 `{{event_1}}` 的应是「起点性」事件，替换 `{{event_2}}` 的应是「转折性」事件）

## 各结局基调与占位符上下文

**E1 盛世中兴**（正面，执政≥30年，民心≥80，国库≥8000，外患≤15）  
上下文：「这一切是怎么做到的？{{event_1}} 是起点，{{event_2}} 是转折。」  
→ 请为 E1 提供：event_1（一件励精图治的起点事件）、event_2（一件政策见效的转折事件）

**E2 仁君薨逝**（温情，执政≥20年，民心≥70，皇帝年龄≥60）  
上下文：「比如 {{event_1}} 那一年，他亲自去灾区住了半个月，和灾民一起吃赈灾粥。比如 {{event_2}} 那次朝会，有个言官指着鼻子骂他优柔寡断，他听完后说：『你说得对，朕是优柔寡断，因为朕怕错。』」  
→ 请为 E2 提供：event_1（年份描述，如「永德十二年」）、event_2（年份/场合描述，如「永德二十年秋」）

**E4 外敌倾覆**（悲剧，外患≥80持续2年，军力≤500）  
上下文：「副将愣了愣，然后点了点头。他们都知道 {{event_1}} 之后，朝廷的军费就被砍了一大半。也知道 {{event_2}} 那年，因为军饷拖欠，已经有三个营的士兵哗变逃跑。」  
→ 请为 E4 提供：event_1（一件导致军费削减的具体事件名/年份）、event_2（一个具体年份描述）

**E5 宦官专权亡国**（讽刺，宦官势力≥85持续3年）  
上下文：「怕 {{event_1}} 那年，有个御史想弹劾掌印太监，第二天就被发现死在家里，死因是『突发急病』。{{event_2}} 那次，有个将军想带兵清君侧，还没出军营就被自己的人绑了，送到东厂领赏。」  
→ 请为 E5 提供：event_1（年份描述）、event_2（事件名/时间描述）

**E8 平庸守成**（中性，执政满50年但未触发其他结局）  
上下文：「比如 {{event_1}} 那年，有个地方官建议改革税制，皇帝批了『再议』，然后就没有然后了。比如 {{event_2}} 那次，边境有摩擦，将军请求增兵，皇帝批了『酌办』，最后只派去了五百人。」  
→ 请为 E8 提供：event_1（年份描述，早年的某个改革建议被搁置）、event_2（某次边境摩擦被敷衍处理的场合）

## 输出格式

严格按以下格式输出，每个结局一个代码块，方便 Mimo 直接替换进代码：

```
E1_event1: 永德三年裁汰冗员、整顿吏治
E1_event2: 永德十五年推行「摊丁入亩」、赋税大减
E2_event1: 永德十二年
E2_event2: 永德二十三年那次大朝会
E4_event1: 永德七年「宦官揽财案」
E4_event2: 永德十九年
E5_event1: 永德十一年
E5_event2: 永德十六年「靖军门事变」
E8_event1: 永德五年
E8_event2: 永德三十年北疆
```

注意：描述要简短（5-15字），因为它们嵌入在一句话里，太长会破坏节奏。
```

---

## 任务 3 — M-C：叙事补丁合并进代码

**负责**：Mimo  
**优先级**：🟡 P1  
**前置依赖**：DS-A 完成  
**文件**：`ai-context/src/engine/ending-engine.ts`

---

### Prompt for Mimo

```
你是「皇帝游戏」的 TypeScript 开发者。

## 任务

有两批结局叙事修订需要合并进 `ai-context/src/engine/ending-engine.ts`：

### 批次1：DS-A 的输出（E1/E2/E4/E5/E8）

DeepSeek 已提供以下占位符替换值（以实际DS-A输出为准）：
- E1: `{{event_1}}` → [DS-A提供的E1_event1], `{{event_2}}` → [DS-A提供的E1_event2]
- E2: `{{event_1}}` → [DS-A提供的E2_event1], `{{event_2}}` → [DS-A提供的E2_event2]
- E4: `{{event_1}}` → [DS-A提供的E4_event1], `{{event_2}}` → [DS-A提供的E4_event2]
- E5: `{{event_1}}` → [DS-A提供的E5_event1], `{{event_2}}` → [DS-A提供的E5_event2]
- E8: `{{event_1}}` → [DS-A提供的E8_event1], `{{event_2}}` → [DS-A提供的E8_event2]

### 批次2：docs/ending-narrative-patch.md 的 E3/E6/E7 修订叙事

读取 `docs/ending-narrative-patch.md` 文件，将其中 E3（亡于内乱）、E6（工业革命开创者）、E7（仙道误国）的修订后完整叙事，替换 `ending-engine.ts` 中对应结局的 `narrative` 字段。

## 操作步骤

1. 用字符串替换直接把 `{{event_1}}` / `{{event_2}}` 替换为对应固化文本（in-place 修改 narrative 字段内的字符串）
2. E3/E6/E7 用 `ending-narrative-patch.md` 的版本整体替换 narrative 字段内容
3. 不改动触发条件（trigger 函数）、标题（title）、史官评语（epilogue）、priority

输出修改后的完整 ending-engine.ts。
```

---

## 任务 4 — DS-B：新手引导文案

**负责**：DeepSeek  
**优先级**：🟡 P1  
**背景**：游戏首次进入时叙事栏为空白，新玩家不知道怎么玩。需要一段符合游戏文风的引导文案，通过打字机逐字显示，告诉玩家核心操作。

---

### Prompt for DeepSeek

```
你是「皇帝游戏」的首席文案创作者。游戏背景是架空「靖朝」，玩家是穿越者皇帝，刚刚继位，面对满朝文武，文风参考《明朝那些事儿》——有人情味，史官白话体，幽默克制。

## 任务

为游戏第一次启动时（新玩家第一次进入朝堂）写一段**新手引导叙事**。这段文字通过打字机效果逐字显示在「叙事栏」里，引导玩家了解基本玩法。

## 内容要求

必须涵盖以下四个要点，但**不能出现现代词汇**（按钮、点击、面板、界面、UI），改用宫廷词汇：

1. **如何下旨**：玩家在下方输入框用自然语言下达命令（称"御笔书旨"或"传旨"）
2. **如何颁布政策**：点击「政策」按钮（称"御览政令"或"开启政令匣"）
3. **放置 Tick 机制**：游戏会自动推进时间（称"天道自转，时序更迭"之类）
4. **如何查看史册**：点击导航栏的「史册」（称"御览史册"或"圣鉴起居注"）

## 格式要求

- **总字数：200~280字**（因为是打字机效果，太长玩家会等得不耐烦）
- 第一人称视角：史官/国师旁白口吻，不是皇帝自述
- 结尾留一句引导性的话，鼓励玩家输入第一条圣旨
- 纯散文，无标题，无分段标记，无括号说明

## 示例文风参考（节选，供感受语感）

> 永德元年，新帝甫登大位，乾清宫里的香还没燃完，奏折就已经堆成了小山。内阁的几位阁老站在廊下，相互交换了一个眼神——这位天子，究竟是什么脾气，还得看看。

请输出引导文案正文（直接给文字，不要加任何说明和标题）。
```

---

## 任务 5 — M-B：新手引导代码实现

**负责**：Mimo  
**优先级**：🟡 P1  
**前置依赖**：DS-B 完成  
**文件**：`ai-context/src/ui/CourtPage.tsx`

---

### Prompt for Mimo

```
你是「皇帝游戏」的 TypeScript/Preact 开发者。

## 任务

在 `ai-context/src/ui/CourtPage.tsx` 中实现**新手引导首次展示**功能。

## 实现逻辑

在 CourtPage 的初始化 useEffect 中（找到 initGame 或类似的初始化逻辑），在原有初始化 Tick 执行前，加入以下判断：

```typescript
const state = getState();
const isFirstLaunch = 
  state.world.year === 1 && 
  state.chronicle.official.length === 0;

if (isFirstLaunch) {
  await typewriterEffect(ONBOARDING_GUIDE);
  // 等待1.5秒让玩家阅读结尾
  await new Promise(resolve => setTimeout(resolve, 1500));
}
// 然后继续原有的初始化 Tick 流程
```

## 新手引导文案常量

在文件顶部（import 语句之后，组件函数之前）新增常量：

```typescript
// 新手引导文案（DS-B产出，首次启动展示）
const ONBOARDING_GUIDE = `[把 DS-B 产出的文案粘贴在这里]`;
```

## 注意事项

- 只添加约15行代码，不重构现有逻辑
- `typewriterEffect` 函数已存在于 CourtPage.tsx 中（在 submitCommand 附近），直接调用即可
- `isFirstLaunch` 检测放在「加载存档或初始化状态」之后，确保 state 已就绪
- 不要动 Prologue（开场三阶段）的逻辑，新手引导在 Prologue 结束后触发

输出：仅输出需要修改/新增的代码片段和对应的插入位置说明，不需要输出整个文件。
```

---

## 任务 6 — M-A：资源数值变化动画

**负责**：Mimo  
**优先级**：🟡 P1  
**文件**：`ai-context/src/ui/CourtPage.tsx`（资源显示区域，找到 `ResourceBar` 或 DynastyHeader 相关组件）  
**背景**：每次 Tick 后资源数值改变，但没有任何视觉反馈，玩家无法直觉感知增减。

---

### Prompt for Mimo

```
你是「皇帝游戏」的 TypeScript/Preact 开发者。

## 任务

在 `ai-context/src/ui/CourtPage.tsx` 中，为资源面板的数值变化增加颜色闪烁动画：
- 数值上升：短暂绿色（#4a7c59）闪烁
- 数值下降：短暂红色（#8b1a1a）闪烁
- 动画持续：1.5秒后恢复正常颜色

## 实现方案

1. **用 useRef 追踪上一次资源值**

```typescript
const prevResourcesRef = useRef<Record<string, number>>({});
```

2. **用 useState 存储哪些资源当前在闪烁以及方向**

```typescript
const [resourceFlash, setResourceFlash] = useState<Record<string, 'up' | 'down' | null>>({});
```

3. **在 useEffect 监听 state.resources 变化时，计算差值并触发闪烁**

```typescript
useEffect(() => {
  if (!state) return;
  const prev = prevResourcesRef.current;
  const flash: Record<string, 'up' | 'down' | null> = {};
  for (const key of Object.keys(state.resources)) {
    const cur = (state.resources as any)[key] ?? 0;
    const old = prev[key] ?? cur;
    if (cur > old) flash[key] = 'up';
    else if (cur < old) flash[key] = 'down';
  }
  prevResourcesRef.current = { ...state.resources } as any;
  if (Object.keys(flash).length > 0) {
    setResourceFlash(flash);
    setTimeout(() => setResourceFlash({}), 1500);
  }
}, [state?.resources]);
```

4. **在渲染资源数值的 JSX 处，根据 resourceFlash 加入内联颜色样式**

```tsx
<span style={{
  color: resourceFlash[key] === 'up' ? '#4a7c59'
       : resourceFlash[key] === 'down' ? '#8b1a1a'
       : 'inherit',
  transition: 'color 0.3s ease',
  fontWeight: resourceFlash[key] ? 'bold' : 'normal',
}}>
  {value}
</span>
```

## 注意事项

- 只需要对核心8个资源字段做：morale / fiscal / military / food / threat / commerce / eunuch / faction
- `threat` 上升是坏事，视觉上应该反过来（threat 上升 → 红色）；其他资源上升 → 绿色。请在判断 flash direction 时对 threat 做取反处理。
- 不要改变现有的 JSX 结构，只在数值 span 上加 style 属性

输出：修改/新增的代码片段和对应插入位置说明。
```

---

## 任务 7 — DS-C：补全9个测试剧本

**负责**：DeepSeek  
**优先级**：🟢 P2  
**背景**：`docs/demo-script.md` 目前只有1个 E6（工业革命开创者）演示剧本，计划要10个，缺少9个。

---

### Prompt for DeepSeek

```
你是「皇帝游戏」的首席文案创作者，同时熟悉游戏测试工作。

## 任务

为「皇帝游戏」补写**9个测试剧本**，格式严格参照已有的 `docs/demo-script.md`（E6工业革命演示剧本）。

## 需覆盖的剧本（9个）

### A组：正常游戏流程（2个）

**剧本A1：普通皇帝的一天**  
测试目标：验证完整的「上朝→下旨→Tick→史册」基础循环。初始资源平衡，玩家执行4~5条日常指令（减税、赈灾、操练军队等），验证叙事生成、资源变化、史册记录均正常。

**剧本A2：从危机中稳定局势**  
测试目标：验证低资源状态下的系统稳定性。初始设置：国库500、民心30、外患60，玩家需要在5步内把各项数值拉回安全线，测试边界值处理。

### B组：政策系统（2个）

**剧本B1：政策颁布完整流程**  
测试目标：验证预设政策「颁布→活跃面板显示→Tick效果生效→到期自动移除」全流程。颁布「减税惠民」（3年）和「兴建水利」（5年），推进3个Tick后检查活跃面板和资源变化。

**剧本B2：政策冲突与废除**  
测试目标：验证矛盾政策同时生效的处理，以及废除按钮功能。先颁布「减税惠民」再颁布「加征赋税」，观察系统响应；然后废除一个，验证废除后Tick不再叠加该效果。

### C组：事件系统（2个）

**剧本C1：世界事件处置**  
测试目标：触发并处置一个三选项事件（建议触发「饥民暴动」：food≤200时概率触发）。验证三个选项各自的资源变化和叙事描述准确，派系数值联动正确。

**剧本C2：路遇事件弹窗**  
测试目标：验证「微服出巡」路遇弹窗（EncounterChatWindow）功能。点击「微服出巡」触发路遇，完成对话追问，验证追问内容符合NPC人格，对话结束后资源正确变化。

### D组：结局触发（4个）

**剧本D1：E1 盛世中兴（正面结局）**  
触发条件：执政≥30年，民心≥80，国库≥8000，外患≤15。  
操作路径：专注颁布「减税惠民」「兴建水利」系列政策，不挑衅外敌，稳步积累。

**剧本D2：E3 亡于内乱（负面结局）**  
触发条件：党争≥80持续3年，OR 饥民暴动处置失败2次。  
操作路径：每次事件都选择激化矛盾的选项，放任党争烈度上升，不赈灾。

**剧本D3：E5 宦官专权亡国（反派结局）**  
触发条件：宦官势力≥85持续3年。  
操作路径：大量颁布「召仙炼丹」「祭天祈福」政策，每次事件都支持宦官立场。

**剧本D4：E8 平庸守成（中性结局）**  
触发条件：执政满50年但未触发其他结局。  
操作路径：所有决策选择最保守的中间选项，不激进，不改革，熬满60年。

## 每个剧本的输出格式

（严格参照 docs/demo-script.md 的结构）

```markdown
# 皇帝游戏：[剧本名称]

## 演示目标
[1-2句话说明测试什么]

## 预计时长
[X分钟]

## 前置条件
- 新游戏开始 / 指定初始状态
- 初始资源：国库X、民心X、军力X、粮食X、外患X

## 操作步骤

### 第1步：[步骤名]
- **操作**：[具体操作，包括输入的指令文字]
- **预期**：[期望看到什么]
- **验证**：[如何确认正确]

[继续5-10步...]

## 期望结局
[该剧本应触发哪个结局，或完成哪种验证]

## 验收要点
- ✅ [要点1]
- ✅ [要点2]
```

请输出全部9个剧本，保存在一个 Markdown 文件中，文件名建议：`test-scripts.md`。
```

---

## 任务 8 — DS-D/README：文档对齐与README全面更新

**负责**：DeepSeek  
**优先级**：🟢 P2（发布前必须）  
**前置依赖**：所有其他任务完成后  
**文件**：根目录 `README.md`，以及 `docs/factions-design.md`

---

### Prompt for DeepSeek

```
你是「皇帝游戏」的技术文档负责人。

## 任务一：更新 README.md 开发状态

当前 README.md 的「开发状态」部分严重滞后，请按以下实际情况更新：

**Phase 4 实际完成情况**（以下全部已在代码中实现，需从「进行中/规划中」改为「✅ 已完成」）：

| 子阶段 | 实际完成的内容 |
|--------|--------------|
| 4.1 | 预设政策快速通道、活跃政策面板(第三Tab)、政策悬停Tooltip、史册分页(每页20条)、3个存档槽、Ctrl+S快捷键 |
| 4.2 | 8种结局引擎（ending-engine.ts）、结局页面（EndingPage.tsx）、路由注册（/ending） |
| 4.3 | world.factions三派系数值系统、宦官/党争资源联动、事件选项派系权重、NpcCard派系势力显示 |
| 4.4部分 | GitHub Actions CI、派系行为准则与氛围词库（lore-bridge.ts） |

**Phase 4 仍待完成**（改为「🚧 进行中」）：
- 存档向后兼容迁移
- 结局叙事占位符固化
- 新手引导（代码+文案）
- 资源变化动画
- 10个测试剧本（完成1/10）
- 发布文案上线（B站/小红书/GitHub，已写好但未发布）

同时更新：
1. 项目结构树：补全缺失的文件（`lore-bridge.ts`、`emperor-stats.ts`、`idle-config.ts`、`prologue.ts`、`EmperorPanel.tsx`、`Navbar.tsx`、`Toast.tsx`、`ChronicleEntry.tsx`、`VisualSlot.tsx`、`LoadingShimmer.tsx`）
2. 政策数量：22个 → 25个
3. 派系系统：在「当前系统能力」中新增「✅ 三派系量化系统：清流/帝党/宦官党势力数值，事件选择实时联动」

## 任务二：factions-design.md 歧义修正

`docs/factions-design.md` 设计了5个派系（qingliu/didang/eunuch_faction/military/pragmatists），但代码 `types.ts` 只实现了3个（qingliu/didang/eunuch_faction），military 和 pragmatists 没有对应代码。

请在文档开头加一个说明框：

```markdown
> **实现状态说明（2026-04-21）**：本文档设计了5个派系，当前代码实现了3个核心派系
>（清流/帝党/宦官党）。军队派（military）和务实派（pragmatists）为待扩展设计，
> 目前暂不实现，留作 Phase 5 扩展方向。
```

请输出：
1. 更新后的 README.md 开发状态部分（只输出该部分，不用输出整个README）
2. factions-design.md 的开头说明框文本
```

---

## 附录：任务间协作时间线

```
Day 1  ├── Mimo:    M-D 存档兼容迁移（2小时，独立）
       └── DeepSeek: DS-A 结局叙事占位符（2小时，独立）

Day 2  ├── Mimo:    M-C 叙事补丁合并（等DS-A输出，1小时）
       ├── Mimo:    M-A 资源动画（独立，2小时）
       └── DeepSeek: DS-B 新手引导文案（独立，1小时）

Day 3  ├── Mimo:    M-B 新手引导实现（等DS-B输出，1小时）
       └── DeepSeek: DS-C 9个测试剧本（独立，3小时）

Day 4  └── DeepSeek: DS-D README更新（等全部完成，1小时）

─────────────────────────────────────
联调节点 Day 3 结束：走一遍 D1（盛世中兴）测试剧本，
验证：资源动画 + 新手引导 + 结局叙事 + 存档兼容 全部正常。
```

---

*文档生成时间：2026-04-21 | 基于代码实际核查，非README自述*
