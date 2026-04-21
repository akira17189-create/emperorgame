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