# Phase 4 开发计划：打磨收尾与发布准备

**最后更新**: 2026-04-19  
**世界观设定**: 本游戏基于虚构的「靖朝」架空世界，所有人物、事件、地名均为虚构创作，与现实历史无关。  
**状态**: 准备开始  
**优先级**: P1（最高优先级）

---

## 1. 当前项目状态评估

### 1.1 Phase 1–3 已完成功能

- ✅ 指令归一化系统（`normalize-command.md`）
- ✅ 多Agent仲裁系统（`arbitration.ts`）
- ✅ 动态叙事引擎（`narrator.ts`）
- ✅ NPC自主行为系统（`goals-manager.ts`）
- ✅ 离线Tick引擎（`tick.ts`）
- ✅ 32个技能系统（`skills.ts`）
- ✅ 政策系统骨架（`policy-engine.ts`）——已修复持续效果 Bug
- ✅ 世界事件系统（`event-engine.ts`）——已修复 return Bug，32个模板已填充
- ✅ 政策面板 UI（`PolicyPanel.tsx`）——已挂载到 CourtPage
- ✅ 事件决策弹窗（`EventModal`）——已集成到 CourtPage

### 1.2 Phase 3 遗留问题（必须在 Phase 4 解决）

| 编号 | 问题 | 影响范围 |
|------|------|---------|
| L-1 | 预设政策只有 14 个，计划 22 个，差 8 个 | 政策面板内容不完整 |
| L-2 | 预设政策点击后走 LLM（`interpretPolicy`），应走快速通道（`applyPresetPolicy`） | 无谓 Token 消耗 |
| L-3 | 无活跃政策展示面板，玩家不知道哪些政策在生效、还剩几年 | 核心决策反馈缺失 |
| L-4 | 史册页全量渲染，条目多时卡顿 | 体验问题 |
| L-5 | 存档只有单 slot，无多存档槽，无快捷键 | 易用性问题 |
| L-6 | 政策按钮无悬停预览（资源影响一目了然） | 新手不友好 |

### 1.3 Phase 4 核心目标

**将游戏从「能玩」提升到「能发布」**。通过结局系统给游戏设定终点，通过 NPC 党派量化让政治博弈有重量，通过 UI 细节打磨让首次体验流畅，最后完成发布所需的测试与素材准备。

---

## 2. Phase 4 开发路线图

### 2.1 开发周期：10 天

| 阶段 | 名称 | 预估工时 | 开始日 | 结束日 | 关键交付物 |
|------|------|---------|--------|--------|-----------|
| **4.1** | 遗留问题修复 + 政策完善 | 2 天 | D1 | D2 | 22 个可玩政策、快速通道修复、活跃政策面板 |
| **4.2** | 王朝结局系统 | 3 天 | D3 | D5 | 8 种结局 + 结局叙事 + 结局触发逻辑 |
| **4.3** | NPC 党派量化系统 | 2 天 | D6 | D7 | 党派势力数值、党争事件权重联动 |
| **4.4** | UI 打磨 + 发布准备 | 3 天 | D8 | D10 | 史册分页、多存档、测试剧本、演示素材 |

### 2.2 依赖关系

```
遗留修复 (4.1) ──→ 结局系统 (4.2) ──→ 发布准备 (4.4)
                         ↑
              NPC党派系统 (4.3) ─────────→ 发布准备 (4.4)
```

4.2 和 4.3 可以并行：DeepSeek 写结局文案时，Mimo 实现党派数值系统。

---

## 3. Phase 4.1：遗留问题修复 + 政策完善

### 3.1.1 任务清单

#### Mimo 负责（代码）

**M-1：修正预设政策走快速通道**  
文件：`src/ui/PolicyPanel.tsx`  
当前问题：`handlePresetPolicy` 函数调用的是 `interpretPolicy`（LLM），应改为调用 `applyPresetPolicy`，再把返回的 `immediateChanges` 应用到 `state.resources`，最后追加一条简短的固定叙事到叙事栏（不调 LLM）。  
改法：
```typescript
// 修改后的 handlePresetPolicy 核心逻辑
const { policy, immediateChanges } = applyPresetPolicy(name as any, state);
const current = getState();
const newResources = { ...current.resources };
for (const [k, v] of Object.entries(immediateChanges)) {
  if (k in newResources) (newResources as any)[k] = Math.max(0, ((newResources as any)[k] ?? 0) + (v ?? 0));
}
setGameState({
  ...current,
  resources: newResources,
  policies: {
    active: [...current.policies.active, policy],
    history: [...current.policies.history, { policy_id: policy.id, action: 'enact', year: current.world.year, reason: name }]
  }
});
onPolicyEnacted?.(`${name}政策已颁布，效果将持续生效。`);
```

**M-2：活跃政策展示面板**  
文件：`src/ui/PolicyPanel.tsx`（在现有 preset/custom 两个 tab 下方新增第三个 tab "活跃政策"）  
展示内容：
- 列出 `state.policies.active` 中每条政策
- 显示：政策名、颁布年份、预计到期年份（`enacted_year + duration_years`，-1 显示"永久"）
- 每条政策旁边显示 `tick_change` 的资源变化（如"民心 +2/年　国库 -100/年"）
- 提供「废除」按钮，点击后从 `active` 移入 `history`（action: 'repeal'）

**M-3：政策悬停预览**  
文件：`src/ui/PolicyPanel.tsx`  
给预设政策按钮加 `title` 属性，格式："每年效果：民心+2，国库-100 | 持续3年"  
（从 `POLICY_PRESETS[name].tick_change` 和 `duration` 读取，不需要 LLM）

**M-4：史册分页**  
文件：`src/ui/ChroniclePage.tsx`  
在 `official` 列表渲染处增加分页逻辑，每页显示 20 条，底部加「上一页/下一页」按钮。

**M-5：多存档槽 + 快捷键**  
文件：`src/ui/SavesPage.tsx`、`src/ui/CourtPage.tsx`  
- `SavesPage` 改为显示 3 个存档槽（slot-1 / slot-2 / slot-3），每个槽显示存档时间和游戏年份
- `CourtPage` 增加键盘监听：`Ctrl+S` 触发保存（提示 Toast）

#### DeepSeek 负责（文案）

**D-1：补全 8 个预设政策设定**  
需要补充以下 8 个政策的：名称、所属 tag 分类、每年资源变化值（参考已有政策的数值量级）、持续年数、一句话简介（用于悬停 tooltip）。

仙道类（需 4 个，已有「祭天祈福」「召仙炼丹」）：

| 政策名 | 参考方向 |
|--------|---------|
| 待填 | 观星台修建（天文/仙道方向，提升威望） |
| 待填 | 龙虎山封赏（正一道，与道士集团结盟） |
| 待填 | 禁绝方术（反仙道，清流派好感+，宦官-） |
| 待填 | 丹药普赐（强化版召仙炼丹，短期民心大涨，长期隐患） |

工业类（需 4 个，已有「推广活字印刷」「开设钱庄」，还差 3 个，再加 1 个）：

| 政策名 | 参考方向 |
|--------|---------|
| 待填 | 官道驿路修建（基建，促进商业流通） |
| 待填 | 火器营组建（军事工业，军力大涨，财政大消耗） |
| 待填 | 开放海禁（外贸，商业暴涨，但有倭寇风险） |
| 待填 | 蒸汽机研发（穿越者专属，高投入高回报，需数年） |

DeepSeek 输出格式（参照 `policy-engine.ts` 中 `POLICY_PRESETS` 的格式）：
```typescript
"政策名称": { tags: ["分类1", "分类2"], tick_change: { 资源key: 数值 }, duration: 年数 },
```
资源 key 参照：`morale / fiscal / military / food / threat / commerce / eunuch / faction`

---

## 4. Phase 4.2：王朝结局系统

### 4.2.1 设计理念

结局是游戏的终点，也是玩家所有决策的最终评价。不同于硬性的「游戏结束」，结局应该是**叙事性的**：玩家看到自己的王朝以某种方式走向终章，并得到一段史官风格的总结评语。

### 4.2.2 8 种结局设计

#### DeepSeek 负责（文案）

为以下每种结局撰写：
1. **触发条件描述**（帮助 Mimo 转化为代码判断）
2. **结局标题**（4-8 字，史书风格，如「中兴之主」「亡国之君」）
3. **结局叙事正文**（300-500 字，史官口吻，回顾玩家的执政生涯，引用 2-3 个游戏内实际发生的事件作为占位符 `{{event_1}}` `{{event_2}}`）
4. **史官评语**（50 字以内，类似"史曰"的盖棺定论）

| 编号 | 结局名（待 DeepSeek 命名） | 核心触发条件 | 基调 |
|------|--------------------------|-------------|------|
| E1 | 盛世中兴 | 执政≥30年，morale≥80，fiscal≥8000，threat≤15 | 正面 |
| E2 | 仁君薨逝 | 执政≥20年，morale≥70，emperor.age≥60 | 温情 |
| E3 | 亡于内乱 | faction≥80 持续3年，OR 饥民暴动事件处置失败2次以上 | 悲剧 |
| E4 | 外敌倾覆 | threat≥80 持续2年，military≤500 | 悲剧 |
| E5 | 宦官专权亡国 | eunuch≥85 持续3年 | 讽刺 |
| E6 | 工业革命开创者 | commerce≥1000，fire_weapon_camp政策生效，穿越者知识≥5条 | 特殊正面 |
| E7 | 仙道误国 | 仙道类政策≥4条同时生效，fiscal≤1000，morale≤40 | 荒诞 |
| E8 | 平庸守成 | 执政满50年但未触发其他任何结局 | 中性 |

#### Mimo 负责（代码）

**M-6：结局触发引擎**  
新建文件：`src/engine/ending-engine.ts`

```typescript
export interface Ending {
  id: string;
  title: string;           // 结局标题
  narrative: string;       // 长篇叙事（含占位符）
  epilogue: string;        // 史官评语
  trigger: (state: GameState) => boolean;  // 触发判断函数
  priority: number;        // 多条同时满足时取最高优先级
}

export function checkEndings(state: GameState): Ending | null;
// 按 priority 降序检查，返回第一个满足条件的结局，无则返回 null

export function renderEndingNarrative(ending: Ending, state: GameState): string;
// 把叙事中的 {{event_1}} 等占位符替换为 state.world.collective_memory 中的实际事件
```

**M-7：结局页面**  
新建文件：`src/ui/EndingPage.tsx`  
样式要求：
- 背景为深黑，配古卷轴纹理（CSS 实现）
- 结局标题居中，大字，金色
- 史官评语用小字斜体，与正文之间有分割线
- 底部两个按钮：「再次游玩」（清空存档，回 NewGame）和「查看史册」（跳转 ChroniclePage）

**M-8：结局触发时机集成**  
在 `tick.ts` 的 `checkGameEndConditions` 调用处，改为调用 `checkEndings`，触发后跳转 EndingPage（通过 hash 路由）。在 `main.tsx` 的路由表中注册 `/ending` 路由。

### 4.2.3 验收标准

- ✅ 8 种结局均有触发条件判断代码
- ✅ 每种结局有完整的叙事文本（DeepSeek 产出，Mimo 填入代码）
- ✅ 触发后能正确跳转到结局页面
- ✅ 结局页面的占位符能被实际游戏事件替换
- ✅ 「再次游玩」能完整清除游戏状态

---

## 5. Phase 4.3：NPC 党派量化系统

### 5.3.1 设计理念

目前 NPC 的 `faction` 字段是字符串（"清流"/"帝党"/"中立"），缺乏量化。党争事件的选择会影响真实的派系势力对比，NPC 的行为和对话也应反映其所在派系的当前强弱。

### 5.3.2 系统设计

#### Mimo 负责（代码）

**M-9：派系势力数值结构**  
修改 `types.ts`，在 `World` 接口增加：

```typescript
factions: {
  qingliu: number;    // 清流派势力 0~100
  didang: number;     // 帝党势力 0~100
  eunuch_faction: number;  // 宦官党势力 0~100（与 resources.eunuch 联动）
};
```

在 `createEmptyGameState` 中初始化为 `{ qingliu: 50, didang: 50, eunuch_faction: 30 }`。

**M-10：派系数值联动**  
在 `state-updater.ts` 中增加：
- 当 `resources.eunuch` 变化时，同步更新 `world.factions.eunuch_faction`（= eunuch * 0.8）
- 当 `resources.faction` 变化时，等量分配给 qingliu 和 didang（反向关联：faction 高 → 双方势力均高，代表党争激烈）

**M-11：事件选项权重联动**  
在 `event-engine.ts` 的 `resolveEventChoice` 中，针对党争类事件，根据玩家选择额外修改 `world.factions`：
- 支持清流 → `qingliu +10, didang -8`
- 支持帝党 → `didang +10, qingliu -8`
- 各打五十大板 → `qingliu -5, didang -5`

**M-12：NpcCard 显示派系势力**  
在 `NpcCard.tsx` 的 NPC 信息下方，根据 NPC 的 `faction` 字段显示其所在派系的当前势力值（从 `state.world.factions` 读取），用小字彩色标签显示，如「清流派 势力62」。

#### DeepSeek 负责（文案）

**D-2：各派系性格行为准则**  
为三个派系各写一份简短的行为准则（100字以内），用于告知 LLM 在生成叙事时，该派系官员面对不同局势时的典型反应模式。格式：

```markdown
## 清流派行为准则
- 政治立场：...
- 面对皇帝妥协时：...
- 面对宦官得势时：...
- 典型台词风格：...
```

这份文档会被集成进 `lore-bridge.ts` 的 `NARRATIVE_STYLE_RULES_PROMPT`，影响所有 NPC 对话生成。

**D-3：党派势力变化的叙事触发词**  
当任一派系势力超过 70 或低于 30 时，叙事引擎应该加入相应的氛围词。DeepSeek 提供一份触发词列表，格式：

```typescript
// 清流势力 > 70 时叙事氛围
const QINGLIU_DOMINANT = ["清流之声振聋发聩", "言官台谏昂扬", ...];
// 帝党势力 > 70 时
const DIDANG_DOMINANT = ["帝党遮天蔽日", "心腹之臣弄权", ...];
// 宦官势力 > 70 时
const EUNUCH_DOMINANT = ["内侍窃柄", "阉党横行", ...];
```

### 5.3.3 验收标准

- ✅ `world.factions` 数值随事件选择实时变化
- ✅ NpcCard 展示所在派系当前势力
- ✅ 叙事生成时携带派系氛围词

---

## 6. Phase 4.4：UI 打磨 + 发布准备

### 6.4.1 UI 打磨任务

#### Mimo 负责（代码）

**M-13：史册分页**  
文件：`src/ui/ChroniclePage.tsx`  
- 每页 20 条，底部「← 上一页 / 下一页 →」按钮
- 当前页码显示：「第 X 页 / 共 Y 页」

**M-14：多存档槽**  
文件：`src/ui/SavesPage.tsx`  
- 显示 3 个存档槽卡片，每张卡片显示：朝代名、年份、最后保存时间、一键删除按钮
- 默认存档槽不变（slot-1），点击卡片可切换到该槽继续游戏

**M-15：Ctrl+S 快捷键存档**  
文件：`src/ui/CourtPage.tsx`  
在已有的 `useEffect` 内监听全局键盘事件，`Ctrl+S`（Mac 为 `Cmd+S`）触发存档并 Toast 提示。

**M-16：资源变化动画**  
文件：`src/ui/CourtPage.tsx`（DynastyHeader 组件）  
当资源数值变化时，对应数字短暂变色（上升绿色闪烁，下降红色闪烁），持续 1.5 秒后恢复。实现方式：用 `useRef` 记录上一次数值，`useEffect` 比较差值并切换 CSS class。

### 6.4.2 发布准备任务

#### DeepSeek 负责（文案）

**D-4：10 个测试剧本**  
格式为 Markdown，每个剧本包含：
- 剧本名称和主要测试目标
- 初始状态描述（年份、各资源初始值建议）
- 玩家操作序列（5-10 步，每步写明具体指令文字）
- 期望触发的事件/结局
- 验收要点

覆盖范围：正常游戏流程 × 2、政策系统 × 2、事件系统 × 2、结局触发（各一个正面/负面）× 4。

**D-5：B站/小红书发布文案**  
- B站视频简介（300字以内）：介绍游戏玩法、特色、架空世界观
- 小红书图文文案（150字以内 + 话题标签）
- GitHub README 中文版（800字以内，包含：项目简介、功能亮点、快速开始、技术栈）

**D-6：新手引导提示文案**  
游戏第一次启动时（`meta.game_year === 1 && chronicle.official.length === 0`），在叙事栏显示一段新手引导叙事，用符合游戏文风的方式告诉玩家能做什么。内容包括：
- 如何下达旨意
- 如何颁布政策
- 什么是 Tick（放置）
- 如何查看史册

格式：纯叙事散文，不要出现「按钮」「点击」等现代词，改用「传旨」「御览」「圣鉴」等宫廷词汇。

#### Mimo 负责（代码）

**M-17：新手引导实现**  
文件：`src/ui/CourtPage.tsx`  
在 `initGame` 的 useEffect 中，检测 `meta.game_year === 1 && chronicle.official.length === 0`，若为真则将 D-6 的引导文案（硬编码为常量）通过 `typewriterEffect` 展示。引导文案展示完毕后再触发正常的初始化 Tick。

**M-18：GitHub Actions CI**  
新建文件：`.github/workflows/build.yml`  
配置：push 到 main 时自动运行 `npm run build`，确保代码可以构建，构建产物上传为 artifact。

### 6.4.3 验收标准

- ✅ 史册正确分页，不卡顿
- ✅ 3 个存档槽正常读写
- ✅ Ctrl+S 快速存档可用
- ✅ 资源变化有动画反馈
- ✅ 10 个测试剧本覆盖核心路径
- ✅ 发布文案三件套完成
- ✅ 新手引导首次启动时展示

---

## 7. 开发协作流程

### 7.1 DeepSeek 工作序列

| 天次 | 任务 | 交付物 |
|------|------|--------|
| D1 | D-1：补全 8 个预设政策数值设定 | 8 条 `POLICY_PRESETS` 格式的 TypeScript 对象 |
| D2-D3 | D-2：派系行为准则；D-3：派系氛围词列表 | `lore-bridge.ts` 增量内容 |
| D3-D5 | 8 种结局文案（标题+叙事+评语） | Markdown 文档，含占位符 |
| D6-D8 | D-4：10个测试剧本；D-5：发布文案；D-6：新手引导文案 | 对应 Markdown 文档 |

### 7.2 Mimo 工作序列

| 天次 | 任务 | 文件 |
|------|------|------|
| D1 | M-1：预设政策快速通道修复 | `PolicyPanel.tsx` |
| D1 | M-2：活跃政策展示 tab | `PolicyPanel.tsx` |
| D2 | M-3：政策悬停预览；M-4：史册分页；M-5：多存档槽 | `PolicyPanel.tsx` / `ChroniclePage.tsx` / `SavesPage.tsx` |
| D3 | M-6：结局触发引擎；M-7：结局页面 | `ending-engine.ts` / `EndingPage.tsx` |
| D4 | M-8：结局集成到路由和 tick | `main.tsx` / `tick.ts` |
| D5-D6 | M-9~M-12：派系数值系统 | `types.ts` / `state-updater.ts` / `event-engine.ts` / `NpcCard.tsx` |
| D7 | M-13~M-16：UI 细节打磨 | `CourtPage.tsx` / `DynastyHeader` |
| D8-D9 | M-17：新手引导；M-18：CI 配置 | `CourtPage.tsx` / `.github/` |
| D10 | 联调 + Bug 修复 | 全局 |

### 7.3 协作节点

- **D2 结束**：遗留问题全部修复，政策系统完整可玩 → 双人测试政策循环
- **D5 结束**：结局系统上线 → 测试能否正确触发 E1/E3/E5 三个代表性结局
- **D7 结束**：派系系统完成 → 测试党争事件对派系数值的影响
- **D10 结束**：整体可玩性测试 → 走一遍 D-4 的 10 个测试剧本

---

## 8. 风险控制

### 8.1 结局文案质量风险

DeepSeek 生成的结局叙事质量参差不齐。为保底，Mimo 在 `renderEndingNarrative` 中实现占位符替换逻辑时，若某占位符对应的 `collective_memory` 为空，则用默认文本兜底（如"登基之初"），避免出现 `{{event_1}}` 原文暴露给玩家。

### 8.2 派系数值平衡风险

派系数值新引入，可能与现有 `resources.faction` 语义重叠导致混乱。约定：
- `resources.faction`：代表**朝堂派系矛盾烈度**（0 = 一团和气，100 = 党争激烈），已有
- `world.factions.qingliu/didang`：代表**各派别当前绝对势力**，新增

两者并存，不合并。Mimo 在 `state-updater.ts` 中写清楚注释。

### 8.3 向后兼容风险

`world.factions` 是新字段，旧存档加载时会是 `undefined`。Mimo 在加载存档的入口（`save.ts` 的 load 函数）中增加迁移逻辑：检测到字段缺失时注入默认值 `{ qingliu: 50, didang: 50, eunuch_faction: 30 }`。

---

## 9. 总结

**Phase 4 是游戏从「可玩」到「可发布」的最后一公里。**

核心交付物时间表：
1. **D2**：政策系统完整，无遗留 Bug，政策面板三 tab 全部可用
2. **D5**：8 种结局上线，首次游戏从开局到结局完整可走通
3. **D7**：NPC 党派量化，事件选择对政治格局有真实影响
4. **D10**：UI 打磨完成，发布素材就绪，可公开发布

**质量目标**：陌生人第一次打开游戏，无需说明，能在 10 分钟内理解玩法并感受到「我的决策在改变这个王朝」。
