---
purpose: 用 AI 协作开发前，人类和 AI 各自需要准备的清单。
audience: 项目负责人（人类）+ 执行 AI
last_updated: 2026-04-17
---

# 07 — 开工前准备清单

**这是一份双向清单**：人类负责提供内容/素材/判断，AI 负责翻译/代码/骨架。  
只要两边都 ready，随时可以进入 `06_mvp_scope.md` 的编码阶段。

---

## 一、人类要准备的

### H1. 审核 Layer 1 世界规则
- 文件：`03_fixes_p1.md §1` 的 20 条规则
- 任务：通读一遍，确认是否有增删
- 输出：批注或修改后的文件版本
- 不做这一步的后果：AI 生成的行为可能包含你不期望的机制漏洞

### H2. 三个种子 NPC 的设定稿
MVP 固定使用海瑞 / 严嵩 / 张居正。每个 NPC 需要你提供：

| 字段 | 说明 | 示例 |
|------|------|------|
| `name` | 姓名（古称） | 海瑞 |
| `role` | 官职 | 应天巡抚 |
| `faction` | 派系 | 清流 |
| `traits` | 6 维权重（各 0~100） | loyalty:85, ambition:30, greed:5, courage:90, rationality:75, stability:60 |
| `voice.features[]` | 1~3 个语言风格标签 | ["刚直", "引经据典", "不留情面"] |
| `voice.syntax_rules[]` | 1~3 条造句习惯 | ["惯用'臣以为'开头", "爱引《孟子》"] |
| `image_prompt` | 英文图位描述 | "Ming dynasty official, upright, in blue robe, determined expression" |

- 若历史感觉不确定，可交给 AI 起草，你只做 final review。

### H3. C 档本地模板文案（5~10 条）
无 LLM 时的兜底文本，用于天气/小事件/资源变化。格式：

```
模板 id: weather_good
文本: "{year}年春，风调雨顺，百姓少有怨声。"
触发条件: weather > 0.8

模板 id: fiscal_warning
文本: "{year}年，户部奏报：国库余粮仅可支用半载，请圣裁。"
触发条件: fiscal < 1000

（…至少再提供 3 条…）
```

### H4. 金銮殿场景描述
- 文字：100~200 字的场景文本（AI 生成第一版后你 review）
- 色调：宣纸底是"盛世"，你觉得初始剧本（嘉靖三年）应该是盛世/乱世/中性？
- 图位 prompt：英文，供未来设计师或 AI 生图参考

### H5. 文风 15 条终审
- 文件：`../历史游戏叙事引擎文风_SystemPrompt.md`
- 任务：确认当前 15 条是否是你想要的最终版本
- 特别检查：禁词表是否还有遗漏？场景示例是否还需要增补？
- **这是唯一文风权威，一旦开始编码后修改成本很高**

### H6. 提供一个可用的 LLM 端点
MVP 阶段需要至少一个 OpenAI 兼容的 API 来测试：

| 选项 | 优缺点 |
|------|--------|
| OpenAI 官方 API | 稳定，`gpt-4.1-mini` 便宜 |
| Anthropic API（通过 OpenAI 兼容层）| 质量好，需要确认 compatible endpoint |
| 本地 Ollama | 免费，但模型效果差 |
| 任意第三方 gateway | 灵活，注意审查可信度 |

测试通过标准：能用 curl 调通 `/v1/chat/completions`，返回合理中文叙事。

### H7. GitHub 仓库初始化
- 新建仓库，开启 GitHub Pages（`gh-pages` 分支或 Actions 自动部署）
- 邀请协作者（若有）
- 本地 clone 到开发机

---

## 二、AI（Claude Code）要准备的

以下是 AI 在 MVP 编码阶段的初始化任务，人类无需事先完成：

| 任务 | 依赖的文档 | 产出 |
|------|-----------|------|
| `engine/types.ts` —— 从 schema 翻译 TypeScript 类型 | `04_gamestate_schema.md` | `.ts` 文件 |
| `engine/llm.ts` —— 三档调度 + provider 适配 | `01_architecture.md §2.3` | `.ts` 文件 |
| `engine/skills.ts` —— 路由字典常量 | `../skill/skill_routing_supplement.md` + `03_fixes_p1.md §6` | `.ts` 文件 |
| `engine/save.ts` —— IDBAdapter + Supabase 占位 | `01_architecture.md §6` | `.ts` 文件 |
| `engine/narrator.ts` —— Prompt 拼装 + JSON 解析 | `05_prompt_layers.md` | `.ts` 文件 |
| `prompts/*.md` —— 4 层 Prompt 模板文件 | `05_prompt_layers.md` | `.md` 文件 |
| `data/labels.ts` —— 英→中字段映射 | `03_fixes_p1.md §7` | `.ts` 文件 |
| 5 个页面骨架 | `06_mvp_scope.md §2` | `.tsx` 文件 |
| `src/styles.css` —— 宣纸底色主题 | `06_mvp_scope.md §1` | `.css` 文件 |
| Vite 项目初始化 + GitHub Actions | `01_architecture.md §7` | `package.json` / `.yml` |

**AI 自己不能准备的**（必须等人类提供）：
- H2 种子 NPC 的完整权重 + voice（AI 可起草，不可拍板）
- H3 C 档文案（内容判断由人类做）
- H5 文风 15 条（已有文件，人类做 final sign-off）
- H6 API key（AI 无权自己创建账号）

---

## 三、工具 / 账号清单

| 工具 | 是否必须 | 说明 |
|------|---------|------|
| GitHub 账号 | 必须 | Pages 托管 |
| Node.js ≥ 20 | 必须 | Vite 构建 |
| LLM API 账号 | 必须 | 游戏核心依赖 |
| VS Code / 任意编辑器 | 必须 | 本地开发 |
| 域名 | 可选 | 用 GitHub Pages 自带域名也行 |
| Supabase 账号 | 暂缓 | 云存档阶段再创建 |
| 图像生成 API | 暂缓 | 阶段 4 真图灌入 |

---

## 四、Ready 标准

当以下条件全部满足，可以进入 MVP 编码：

- [ ] H1 世界规则 20 条已 review，无异议
- [ ] H2 三个 NPC 设定稿已确认（权重 + voice）
- [ ] H3 至少 5 条 C 档文案已提供
- [ ] H5 文风 15 条已 final sign-off
- [ ] H6 可用 LLM API 测试通过
- [ ] H7 GitHub 仓库已建，Pages 已开启
- [ ] 本地 Node.js 环境可运行 `npm run dev`
