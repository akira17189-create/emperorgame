# 项目架构重组建议

## 诊断总结

当前项目结构存在三个主要问题，按严重程度排序：

### 🔴 问题一：backup文件污染src/目录
- **影响**：严重降低AI读档效率，浪费token
- **现状**：src/目录下有72个.backup/.bak文件
- **示例**：
  - `src/engine/tick.ts` 及其6个备份文件
  - `src/ui/CourtPage.tsx` 及其16个备份文件
  - `src/main.tsx` 及其7个备份文件

### 🟡 问题二：docs文档编号冲突 + Unicode文件名
- **影响**：AI无法通过文件名判断内容优先级
- **现状**：
  - `12_phase4_development_plan.md` 和 `12_prologue_and_idle_system.md` 编号冲突
  - 多个中文文件名使用URL编码（如`#U4fee#U590d...`），在非中文系统下显示乱码

### 🟡 问题三：历史文档与活跃文档混杂
- **影响**：AI每次读文档列表时需要自己判断哪些还有效
- **现状**：`00_overview.md`到`10_phase2_1_execution_instruction.md`都是已完成阶段的记录

## 重组建议

### Step A：清理src/目录下的backup文件
**操作**：删除所有`.backup*`、`.bak`、`.backup_*`文件
**理由**：这些文件在git中都有历史记录，删除不会丢失任何信息
**具体文件**：共72个文件，包括：
- `src/main.tsx.backup*` (7个)
- `src/engine/tick.ts.backup*` (6个)
- `src/ui/CourtPage.tsx.backup*` (16个)
- 其他engine、ui、data目录下的备份文件

### Step B：整理docs/目录结构
**目标结构**：
```
ai-context/docs/
├── archive/               # 归档已完成的阶段文档
│   ├── 01_architecture.md
│   ├── 02_review_v3.md
│   ├── 03_fixes_p1.md
│   ├── 04_gamestate_schema.md
│   ├── 05_prompt_layers.md
│   ├── 06_mvp_scope.md
│   ├── 07_preparation.md
│   ├── 08_decisions.md
│   ├── 09_phase2_development_plan.md
│   └── 10_phase2_1_execution_instruction.md
│
├── active/                # 当前活跃文档
│   ├── 00_overview.md
│   ├── 11_phase3_development_plan.md
│   ├── 12_prologue_and_idle_system.md
│   ├── 13_project_update_summary.md
│   ├── AI_DEVELOPER_GUIDE.md
│   ├── deepseek-prompt.md
│   └── PROJECT_STRUCTURE.md
│
├── knowledge-base/        # 保持不动（LLM engine用的）
│
└── 临时文档/              # 存放中文命名的临时文档
    ├── 修复完成总结.md
    ├── 叙事引擎文风_SystemPrompt.md
    ├── 测试剧本集.md
    ├── 玄女替换日志.txt
    └── 第一章-新帝登基·三方试探-史册文本示例.md
```

**需要重命名的文件**：
1. 将`12_phase4_development_plan.md`重命名为`14_phase4_development_plan.md`（解决编号冲突）
2. 将Unicode编码的文件名恢复为中文（可选，但建议保留中文文件名，放在临时文档目录）

### Step C：新增CONTEXT_PACKS.md（最省token的改动）
**目的**：告诉AI“你来改哪个模块，需要读哪些文件”
**内容模板**：
```markdown
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
```

## 执行优先级

1. **立即执行**：Step A（清理backup文件）— 影响最大，操作最简单
2. **尽快执行**：Step B（整理docs目录）— 提高文档导航效率
3. **建议执行**：Step C（新增CONTEXT_PACKS.md）— 长期收益最大

## 预期收益

- **节省token**：AI不再需要读取72个无用的backup文件
- **提高效率**：文档分类清晰，AI能快速定位所需文件
- **降低错误**：避免AI误读过时的计划文档
- **便于协作**：Mimo和DeepSeek都能按pack打包所需文件

## 注意事项

1. 所有删除操作都可通过git恢复，不会丢失任何信息
2. 重组后需要更新`.gitignore`，添加`*.backup*`和`*.bak`规则
3. 建议在重组前创建git分支，以便需要时回滚

---

**建议由Mimo执行此重组方案，预计30分钟内可完成。**根据对项目文件夹的检查，我已给出完整的诊断和重组建议。

## 开场改造计划执行情况
**已完全执行**。`13_project_update_summary.md` 记录了所有 Step 1-9 都由 Mimo 完成，文案也已集成进 `src/data/prologue.ts`。计划本身没有遗漏项。

## 项目结构诊断
结构确实混乱，存在三个主要问题：

### 🔴 问题一：backup文件污染src/目录（最影响AI读档效率）
- **src/目录下有72个.backup/.bak文件**
- 例如：`src/engine/tick.ts` 有6个备份文件，`src/ui/CourtPage.tsx` 有16个备份文件
- 这些文件在git中都有历史记录，删除不会丢失任何信息

### 🟡 问题二：docs文档编号冲突 + Unicode文件名
- `12_phase4_development_plan.md` 和 `12_prologue_and_idle_system.md` 编号冲突
- 多个中文文件名使用URL编码（如`#U4fee#U590d...`），在非中文系统下显示乱码

### 🟡 问题三：历史文档与活跃文档混杂
- `00_overview.md`到`10_phase2_1_execution_instruction.md`都是已完成阶段的记录
- AI每次读文档列表时需要自己判断哪些还有效，容易误读旧计划

## 重组建议
我已创建了详细的重组建议文档：[查看建议文档](file:///C:/Users/KSG/Downloads/皇帝游戏/成品/ai-context/docs/ARCHITECTURE_REORGANIZATION_SUGGESTION.md)

建议分三步执行：

### Step A：清理src/目录下的backup文件
删除所有`.backup*`、`.bak`、`.backup_*`文件（共72个）

### Step B：整理docs/目录结构
```
ai-context/docs/
├── archive/               # 归档已完成的阶段文档
├── active/                # 当前活跃文档
├── knowledge-base/        # 保持不动
└── 临时文档/              # 存放中文命名的临时文档
```

### Step C：新增CONTEXT_PACKS.md
创建按任务选包的导航文件，告诉AI“改哪个模块需要读哪些文件”

## 额外建议
更新`.gitignore`文件，添加以下规则：
```
*.backup*
*.bak
```

## 预期收益
- **节省token**：AI不再需要读取72个无用的backup文件
- **提高效率**：文档分类清晰，AI能快速定位所需文件
- **降低错误**：避免AI误读过时的计划文档
- **便于协作**：Mimo和DeepSeek都能按pack打包所需文件

**建议由Mimo按照建议文档执行此重组方案，预计30分钟内可完成。**