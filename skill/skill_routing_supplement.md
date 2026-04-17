# 技能调用实现规范
> 本节补充到 SKILL.md 末尾，指导游戏引擎如何在 API 调用时动态注入技能。

---

## 一、System Prompt 组装结构

每次 API 调用，System Prompt 由三层拼接：

```
[固定层]  文风 15 条规则 + 4 个场景示例          ≈ 1500 token，每次必带
[技能层]  本次事件对应的 2–4 个子技能内容         ≈ 800–1200 token，动态检索
[快照层]  当前世界状态（见任务书第八节）            ≈ 300–500 token，每次必带
─────────────────────────────────────────────────
总上限：4000 token（为对话内容保留足够空间）
```

---

## 二、事件类型 → 技能路由字典

```python
SKILL_ROUTES = {

    # ── 朝堂互动 ──────────────────────────────────────
    "上朝_官员对话": {
        "base": [
            "political-communication-strategy",   # 官场说话方式、皇帝反话识别
            "personnel-management-principles",    # 君臣忠诚评估、恩义义务
        ],
        "by_role": {
            "贪腐官员": ["ming-corruption-investigation"],
            "太监":    ["ming-dynasty-eunuch-politics", "silijian-eunuch-etiquette"],
            "清流":    ["hai-rui-disposition-strategy"],
            "武将":    ["qi-jiguang-tactical-command"],
            "外戚":    ["internal-politics-and-nobility-management"],
        }
    },

    "奏折_批阅": {
        "base": [
            "imperial-decree-execution",          # 皇帝意图揣摩与圣旨执行
            "official-deception-evidence-analysis", # 识别地方官员瞒报
        ],
    },

    # ── 权力博弈 ──────────────────────────────────────
    "党争_清算": {
        "base": [
            "factional-purge-strategy",           # 倒台后的渐进清算节奏
            "internal-stability-management",      # 皇帝应对派系冲突
            "political-crisis-management",
        ],
    },

    "政变_宫廷危机": {
        "base": [
            "political-coercion-and-pressure-tactics",  # 政治胁迫与封口
            "emergency-suppression-authorization",      # 皇帝清修时的紧急授权
            "new-ruler-power-consolidation",            # 危机后的权力重建
        ],
    },

    "锦衣卫_情报": {
        "base": [
            "jinyiwei-operations",                # 锦衣卫缇骑、监视、缉拿
            "political-metaphor-decoding",        # 解读暗语与隐晦信息
        ],
    },

    # ── 民生经济 ──────────────────────────────────────
    "政策_经济": {
        "base": [
            "ming-tax-allocation-analysis",
            "ming-agrarian-survival-calculation",
        ],
        "by_era": {
            "汉": ["han-dynasty-land-tax-and-landlord-consolidation-mechanism",
                   "han-dynasty-public-private-taxation-and-salt-iron-monopoly"],
            "唐": ["tang-dynasty-zuyongdiao-and-account-register-system"],
            "明": ["ming-dai-yu-lin-ce-yi-tiao-bian-fa-shi-xing",
                   "ming-dynasty-yellow-register-system"],
            "清": ["qing-dai-di-ding-he-yi-policy-analysis"],
        }
    },

    "民变_起义": {
        "base": [
            "ming-agrarian-survival-calculation",       # 农民生存临界点计算
            "crowd-psychology-diplomatic-posturing-revenge", # 群众心理与动员
            "policy-risk-threshold-assessment",         # 政策破坏性阈值
        ],
    },

    # ── 军事战争 ──────────────────────────────────────
    "战争_边境": {
        "base": [
            "ming-dynasty-crisis-command",         # 沿海/边境失陷连锁预测
            "military-strategy-and-defense",
            "security-and-military-strategy",
        ],
        "by_enemy": {
            "倭寇": ["qi-jiguang-tactical-command"],
            "北方游牧": ["defense-and-military-preparedness"],
            "内部叛军": ["military-reform-and-liberation"],
        }
    },

    # ── 史册叙事 ──────────────────────────────────────
    "史评_查看史册": {
        "base": [
            "machiavellian-leadership-principles",           # 功过判断框架
            "zhongguo-lidai-zhengzhi-zhidu-fenxi-kuangjia",  # 制度视角史评
        ],
    },

    "重大事件_史书段落": {
        "base": [
            "chinese-traditional-political-institution-analysis-principles",
            "distinguish-institution-from-artifice",
        ],
        # 交叉补充：由事件主体角色另取 1 个 character-ai 子技能
    },

    # ── 人物系统 ──────────────────────────────────────
    "人物评价_生成": {
        "base": [
            "character-examination-three-dimensions",  # 麦基三维审视
            "fictional-character-influence-analysis",
            "machiavellian-leadership-principles",
        ],
    },

    "人物关系_变化": {
        "base": [
            "character-relationship-design",       # 关系揭示隐藏特征
            "psychological-persuasion-strategy",   # 立场转化机制
        ],
    },

    # ── 后宫系统 ──────────────────────────────────────
    "后宫_事件": {
        "base": [
            "character-relationship-design",
            "character-examination-three-dimensions",
        ],
        "by_type": {
            "外戚介入": ["internal-politics-and-nobility-management"],
            "子嗣争夺": ["succession-appointment-risk-management"],
            "情报泄露": ["political-coercion-and-pressure-tactics"],
        }
    },

    # ── 穿越者成长 ──────────────────────────────────────
    "穿越者_知识解锁": {
        "by_branch": {
            "军事知识": ["military-organization-training",
                        "military-force-selection-and-composition"],
            "经济知识": ["han-dynasty-public-private-taxation-and-salt-iron-monopoly",
                        "ming-tax-allocation-analysis"],
            "农业知识": ["ming-agrarian-survival-calculation",
                        "han-dynasty-land-tax-and-landlord-consolidation-mechanism"],
            "人心知识": ["character-examination-three-dimensions",
                        "official-deception-evidence-analysis"],
        }
    },

    # ── 制度解锁（历史纪元推进）──────────────────────────
    "纪元_制度解锁": {
        "by_era": {
            "汉": ["han-dynasty-central-government-san-gong-jiu-qing-system",
                   "han-dynasty-imperial-government-power-division"],
            "唐": ["tang-dynasty-three-departments-edict-process",
                   "tang-dynasty-imperial-examination-system"],
            "宋": ["song-dynasty-imperial-authority-enhancement",
                   "song-dynasty-censorate-alienation-analysis"],
            "明": ["ming-dynasty-provincial-administrative-structure",
                   "ming-qing-jinshi-hanlin-bagua-exam-system"],
            "清": ["qing-dynasty-secret-edict-mechanism",
                   "qing-dynasty-tribal-regime-analysis"],
        }
    },
}
```

---

## 三、世界状态修正条件

在基础路由结果之上，根据当前世界快照追加或替换技能。

```python
def apply_world_state_modifiers(base_skills: list, world_state: dict) -> list:
    """
    world_state 字段来自世界快照层，示例：
    {
        "皇帝威望": 45,        # 0–100
        "宦官势力": 30,        # 0–100
        "民心": 60,            # 0–100
        "财政": 25,            # 0–100
        "外敌威胁": 70,        # 0–100
        "已命名事件": ["黑市之乱", "三年饥荒"],
        "当前朝代": "明",
        "宰相野心": 80,        # 0–100
    }
    """
    extra = []

    # 皇权弱化 → 补充巩固逻辑
    if world_state.get("皇帝威望", 100) < 30:
        extra.append("internal-stability-management")
        extra.append("domestic-power-base-management")

    # 宦官势力膨胀
    if world_state.get("宦官势力", 0) > 70:
        extra.append("ming-dynasty-eunuch-politics")

    # 民心极低 → 民变临界
    if world_state.get("民心", 100) < 25:
        extra.append("policy-risk-threshold-assessment")

    # 财政危机
    if world_state.get("财政", 100) < 20:
        extra.append("ming-dynasty-official-household-economics")

    # 外敌压力高
    if world_state.get("外敌威胁", 0) > 65:
        extra.append("security-and-military-strategy")

    # 已有命名事件 → 叙事引用历史前例
    if "大清洗" in world_state.get("已命名事件", []):
        extra.append("factional-purge-strategy")
    if "三年饥荒" in world_state.get("已命名事件", []):
        extra.append("ming-agrarian-survival-calculation")

    # 宰相野心过高 → 篡权风险
    if world_state.get("宰相野心", 0) > 75:
        extra.append("succession-appointment-risk-management")
        extra.append("power-consolidation-tactics")

    # 去重，控制总数不超过 6 个
    all_skills = list(dict.fromkeys(base_skills + extra))
    return all_skills[:6]
```

---

## 四、技能内容加载

```python
import json
import os

SKILL_DIR = "skills/"   # 每个技能存为独立 JSON 文件

def load_skill(skill_name: str) -> str:
    path = os.path.join(SKILL_DIR, f"{skill_name}.json")
    if not os.path.exists(path):
        return ""
    with open(path, "r", encoding="utf-8") as f:
        data = json.load(f)
    # 每个技能 JSON 格式：{"name": "...", "summary": "...", "behaviors": [...], "examples": [...]}
    lines = [f"【{data['name']}】", data["summary"]]
    lines += [f"- {b}" for b in data.get("behaviors", [])]
    return "\n".join(lines)

def build_system_prompt(event_type, role=None, era=None, world_state=None):
    # 1. 固定层
    with open("style_prompt.md", "r") as f:
        style = f.read()

    # 2. 技能层
    route = SKILL_ROUTES.get(event_type, {})
    skills = route.get("base", []).copy()
    if role and "by_role" in route:
        skills += route["by_role"].get(role, [])
    if era and "by_era" in route:
        skills += route["by_era"].get(era, [])

    # 世界状态修正
    if world_state:
        skills = apply_world_state_modifiers(skills, world_state)

    skill_text = "\n\n".join(load_skill(s) for s in skills if load_skill(s))

    # 3. 快照层
    snapshot = build_world_snapshot(world_state)  # 见任务书第八节

    return f"{style}\n\n---\n\n## 相关知识\n{skill_text}\n\n---\n\n## 当前世界状态\n{snapshot}"
```

---

## 五、不应注入技能的情况

以下技能**只在特定剧情节点手动触发**，不走自动路由，避免污染常规朝堂场景：

| 技能 | 原因 |
|------|------|
| `yangzhou-sha-pulling-resuscitation` | 极特定医疗剧情 |
| `wei-liangfu-shuimoqiang-performance-and-political-gift` | 昆曲政治馈赠，仅外交场景 |
| `hainan-textile-ming-home-rituals` | 地域性强，仅特定人物背景 |
| `ming-dynasty-clandestine-architecture-design` | 仅违制建筑剧情 |
| `forced-tasting-food-safety-protocol` | 仅囚禁/毒杀剧情 |

---

## 六、常驻技能（放固定层，不占技能层配额）

以下技能作为世界观骨架，直接写入固定层 System Prompt，无需每次路由：

- `machiavellian-political-principles`（权力运作基础框架）
- `chinese-traditional-political-institution-analysis-principles`（以今律古警告）
- `character-creation-path-decision`（角色构建基础路径）
