# Context Packs — 按任务选包

## 改开场/序幕逻辑
- src/engine/types.ts（Meta接口）
- src/engine/save.ts（兼容patch）
- src/data/prologue.ts（文案）
- src/ui/CourtPage.tsx（状态机）
- docs/active/12_prologue_and_idle_system.md

## 改放置/idle系统
- src/engine/idle-config.ts
- src/engine/idle-engine.ts
- src/ui/CourtPage.tsx（setInterval部分）
- docs/active/12_prologue_and_idle_system.md

## 改LLM/tick主循环
- src/engine/tick.ts
- src/engine/llm.ts
- src/engine/types.ts
- src/prompts/（全部）
- docs/active/AI_DEVELOPER_GUIDE.md

## 改NPC/叙事
- src/engine/narrator.ts
- src/engine/event-engine.ts
- src/data/seed-npcs.ts
- src/data/core-characters.ts
- docs/active/deepseek-prompt.md

## 新建功能前必读
- docs/active/00_overview.md
- docs/active/AI_DEVELOPER_GUIDE.md
- src/engine/types.ts

## 改UI界面
- src/ui/（对应组件文件）
- src/styles/components.css
- docs/active/PROJECT_STRUCTURE.md

## 改存档系统
- src/engine/save.ts
- src/engine/types.ts（Meta接口）
- src/ui/SavesPage.tsx

## 改政策系统
- src/engine/policy-engine.ts
- src/ui/PolicyPanel.tsx
- src/data/seed-scenario.ts（政策数据）

## 改世界事件
- src/engine/event-engine.ts
- src/engine/templates.ts
- src/prompts/arbitration.md

## 改技能系统
- src/engine/skills.ts
- src/data/skills-bundle.ts
- src/prompts/role-execution.md

## 改朝会预写系统
- src/data/prewritten-court.ts
- src/ui/CourtPage.tsx
- src/ui/components/NpcChatWindow.tsx
- src/prompts/npc-chat-window.md
- docs/active/AI_DEVELOPER_GUIDE.md

## 改路遇系统
- src/data/prewritten-encounters.ts
- src/ui/CourtPage.tsx
- src/ui/components/EncounterChatWindow.tsx
- docs/active/AI_DEVELOPER_GUIDE.md

## 改季节系统
- src/data/season-narratives.ts
- src/ui/CourtPage.tsx
- lore/游戏系统/靖朝游戏系统补充.md

## 新增派系NPC
- src/data/seed-npcs-phase45.ts
- src/data/seed-npcs.ts
- lore/角色设定/靖朝派系人物扩展包.md
- lore/角色设定/靖朝人物网络修正版.md

## 改皇室姓氏
- lore/历史体系/靖朝历史细节补充.md
- lore/历史体系/靖朝架空历史设定修正版.md
- lore/角色设定/靖朝人物网络修正版.md

---

## 📊 当前开发状态

**最后更新**: 2026年4月21日

### 已完成阶段
| 阶段 | 状态 | 完成时间 |
|------|------|----------|
| Phase 1 | ✅ 完成 | 2026-04-17 |
| Phase 2 | ✅ 完成 | 2026-04-18 |
| Phase 3 | ✅ 完成 | 2026-04-19 |
| 改造v3 | ✅ 完成 | 2026-04-20 |
| Bug修复+ | ✅ 完成 | 2026-04-21 |

### 最新修改（2026-04-21 Bug修复+）

#### 代码修改
| 文件 | 修改内容 |
|------|---------|
| `engine/tick.ts` | 结局引擎触发修复，添加 ending 字段 |
| `engine/ending-engine.ts` | E3/E6/E7 触发条件精确化 + 叙事补丁 |
| `engine/idle-engine.ts` | 添加 world.factions 更新逻辑 |
| `engine/types.ts` | 派系初始值调整（didang 50→38等） |
| `ui/CourtPage.tsx` | 结局触发时跳转到 /ending 页面 |

#### E3/E6/E7 触发条件
- **E3 (亡于内乱)**: 党争≥80 或 饥民暴动事件处置失败
- **E6 (工业革命开创者)**: 商业≥1000 且 火器营政策生效 且 穿越者知识≥3条
- **E7 (仙道误国)**: 仙道类政策≥4条同时生效 且 财政≤1000 且 士气≤40

#### 派系初始值（world.factions）
- `qingliu: 60` - 清流派势力
- `didang: 38` - 帝党势力（从50下调，新帝基础薄弱）
- `eunuch_faction: 30` - 宦官党势力
- `military: 45` - 军队派势力（从50微调）
- `pragmatists: 45` - 务实派势力（从40上调）

#### DeepSeek 任务文档
- `docs/factions-design.md` - 派系设计规范（含联动规则）
- `docs/ending-narrative-patch.md` - 结局叙事补丁
- `docs/demo-script.md` - 10步快速通关剧本

### 待完成任务
- [ ] 派系联动规则代码实现（政策对派系影响值）
- [ ] 派系事件触发（高/低派系势力事件）
