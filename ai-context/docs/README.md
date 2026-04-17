---
purpose: docs 目录的入口索引。任何 AI / 人类进入此目录，先读本文件。
audience: 全体
last_updated: 2026-04-17
---

# 《AI 历史模拟游戏》工程文档

本目录是**工程落地文档**。原始设计文档和文风规则分别位于目录外层（见"文档权威等级"）。

## 阅读顺序

| 顺序 | 文件 | 用途 |
|------|------|------|
| 1 | [00_overview.md](./00_overview.md) | 项目定位、产物盘点、术语表 |
| 2 | [01_architecture.md](./01_architecture.md) | 前后端架构、LLM 接入、轻量化、图位、技术栈 |
| 3 | [02_review_v3.md](./02_review_v3.md) | V3 文档问题清单（P0/P1/P2） |
| 4 | [03_fixes_p1.md](./03_fixes_p1.md) | P1 问题的具体填充（世界规则、多 Agent、记忆、离线公式、skill 路由） |
| 5 | [04_gamestate_schema.md](./04_gamestate_schema.md) | GameState 顶层数据结构 |
| 6 | [05_prompt_layers.md](./05_prompt_layers.md) | 4 层 Prompt 模板整合 |
| 7 | [06_mvp_scope.md](./06_mvp_scope.md) | "上朝 + 史册"垂直切片边界 |
| 8 | [07_preparation.md](./07_preparation.md) | 用 AI 协作开发前的准备清单 |
| 9 | [08_decisions.md](./08_decisions.md) | 已拍板决策日志 |

## 文档权威等级

当同一主题在多处出现时，按下表决定以谁为准：

| 主题 | 权威来源 |
|------|---------|
| 叙事文风（15 条规则 + 4 个场景示例） | `../历史游戏叙事引擎文风_SystemPrompt.md` |
| 系统架构（Prompt 分层、人格权重、决策轨迹等概念骨架） | `../AI_History_Game_Design_V3_Executable.html` |
| 技能知识库内容 | `../skill/` 目录 |
| 工程落地细节（schema、文件布局、API 形态、MVP 范围） | **本目录 `docs/`** |
| 已拍板的冲突裁定 | `./08_decisions.md` |

## 修改规则

1. 任何决策变更必须同步更新 `08_decisions.md`，并在对应文件顶部 `last_updated` 字段改日期。
2. 新增文档使用 `NN_slug.md` 命名（两位数字前缀保证排序稳定）。
3. 每个 md 文件顶部必须有 YAML frontmatter（`purpose / audience / last_updated`）。
4. 文件之间交叉引用使用相对路径链接。
5. 本目录下**不放业务代码**，业务代码后续放 `../src/` 和 `../api/`。

## 当前状态

- 阶段：**方案定稿完成**，未开始编码。
- 下一步：按 `07_preparation.md` 的人类待办清单补齐素材，然后进入 MVP 阶段 1。
