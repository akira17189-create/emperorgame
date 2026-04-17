# 仲裁机制：对立解读的冲突叙事生成

## 1. 场景定义

当两个NPC对同一道旨意产生对立解读时，触发仲裁机制。系统需生成：
- 冲突的根源分析
- 双方立场论证
- 对游戏状态的潜在影响
- 最终的冲突叙事文本

## 2. 输入数据结构

```json
{
  "decision_id": "永德元年/正月初四/边防拨款",
  "emperor_decree": "着兵部即刻整饬雁门关防务，拨银二千两",
  "decree_context": {
    "resources": {
      "fiscal": 6000,
      "food": 1200,
      "threat": 25
    },
    "world_state": {
      "tone": "猜忌",
      "conflict_ratio": 0.4
    }
  },
  "conflicting_npcs": [
    {
      "id": "li-shangshu",
      "name": "李尚书",
      "faction": "保守派",
      "traits": {
        "rationality": 85,
        "loyalty": 70,
        "stability": 90
      },
      "bias": {
        "加税": 0.1,
        "改革": 0.3,
        "实政": 0.6
      },
      "interpretation": "此旨将耗尽国库三成，春耕赈济无银可支，恐引发民变",
      "argument_weight": 0.7,
      "emotional_state": "忧虑"
    },
    {
      "id": "zhang-jiangjun", 
      "name": "张将军",
      "faction": "主战派",
      "traits": {
        "courage": 95,
        "loyalty": 85,
        "rationality": 60
      },
      "bias": {
        "加税": 0.8,
        "改革": 0.4,
        "实政": 0.3
      },
      "interpretation": "边关危在旦夕，此时不拨款整军，无异开门揖盗",
      "argument_weight": 0.8,
      "emotional_state": "愤怒"
    }
  ]
}
```

## 3. 仲裁处理流程

### 3.1 冲突根源分析
```json
{
  "root_cause": "资源分配的根本矛盾",
  "sub_conflicts": [
    {
      "type": "战略优先",
      "description": "国防安全 vs 民生保障"
    },
    {
      "type": "派系利益", 
      "description": "兵部扩权 vs 户部控权"
    },
    {
      "type": "人格特质",
      "description": "张将军的勇猛果决 vs 李尚书的老成持重"
    }
  ],
  "intensity_score": 0.75,
  "escalation_risk": 0.6
}
```

### 3.2 立场论证与权重计算
```json
{
  "arguments": [
    {
      "npc_id": "li-shangshu",
      "core_argument": "资源有限性",
      "supporting_facts": [
        "国库仅存银6000两",
        "春耕需至少1000两赈济款", 
        "北境三省旱情已显"
      ],
      "rhetorical_strategy": "数据恐吓",
      "persuasion_score": 0.65
    },
    {
      "npc_id": "zhang-jiangjun", 
      "core_argument": "生存威胁",
      "supporting_facts": [
        "北狄骑兵已至雁门关外",
        "守军盔甲朽坏过半",
        "若关破，京师三日可抵"
      ],
      "rhetorical_strategy": "恐惧诉求",
      "persuasion_score": 0.70
    }
  ],
  "weight_calculation": {
    "base_weights": {
      "li-shangshu": 0.7,
      "zhang-jiangjun": 0.8
    },
    "modifiers": {
      "resource_relevance": {"li": +0.1, "zhang": -0.05},
      "faction_influence": {"li": +0.05, "zhang": +0.1},
      "trait_alignment": {"li": +0.15, "zhang": +0.05}
    },
    "final_weights": {
      "li-shangshu": 0.80,
      "zhang-jiangjun": 0.90
    }
  }
}
```

### 3.3 游戏状态影响预测
```json
{
  "immediate_effects": [
    {
      "resource_change": {
        "fiscal": -2000,
        "morale": {"li_faction": -5, "zhang_faction": +10}
      }
    },
    {
      "relationship_change": {
        "li_shangshu↔emperor": -15,
        "zhang_jiangjun↔emperor": +20,
        "li_shangshu↔zhang_jiangjun": -30
      }
    }
  ],
  "long_term_consequences": [
    {
      "type": "派系极化",
      "description": "保守派与主战派裂痕加深",
      "probability": 0.85
    },
    {
      "type": "决策路径依赖", 
      "description": "后续类似决策将面临更强硬立场",
      "probability": 0.70
    },
    {
      "type": "第三方反应",
      "description": "务实派可能寻求折中方案",
      "probability": 0.60
    }
  ]
}
```

## 4. 冲突叙事生成

### 4.1 输出结构（JSON格式）
```json
{
  "scene_id": "arbitration_永德元年_正月初四_边防拨款",
  "title": "御前激辩：救边关还是救苍生？",
  "narrative": "永德元年正月初四，旨意传至兵部与户部。李尚书手持账簿直闯御书房，声泪俱下：'陛下！二千两已占国库三成，若全用于兵事，春耕赈济将无银可支！北境三省旱情已显，届时饥民揭竿，恐重演前朝旧事！'话音未落，张将军铠甲未卸便冲入殿中，单膝跪地却声如洪钟：'李大人只知算账，可知雁门关盔甲朽坏过半？北狄轻骑就在关外，一旦破关，三日可抵京师！是二千两银子要紧，还是祖宗基业要紧？！'皇帝沉默注视着案头地图，手指在雁门关与北境三省间反复移动。殿外，郑经与王公公正低声交谈，一个在算粮种价格，一个在记双方失态之处。",
  "dialogue_highlights": [
    {
      "speaker": "李尚书",
      "text": "届时饥民揭竿，恐重演前朝旧事！",
      "tone": "悲愤",
      "subtext": "暗示皇帝若不顾民生可能失天下"
    },
    {
      "speaker": "张将军", 
      "text": "是二千两银子要紧，还是祖宗基业要紧？！",
      "tone": "质问",
      "subtext": "将个人立场包装为忠诚大义"
    }
  ],
  "nonverbal_cues": [
    "李尚书手持账簿（道具强化专业权威）",
    "张将军铠甲未卸（强调军情紧急）", 
    "皇帝手指在地图移动（表现决策艰难）",
    "郑经与王公公殿外交谈（第三方势力介入）"
  ],
  "resolution_hint": "最终皇帝采纳郑经的折中方案，但裂痕已生。李尚书连夜写下乞骸骨奏疏，张将军则对郑经摆下'若策无效，军法处置'的狠话。",
  "game_state_updates": {
    "resources": {"fiscal": 4000},
    "relationships": {
      "li_shangshu↔emperor": 55,
      "zhang_jiangjun↔emperor": 105, 
      "li_shangshu↔zhang_jiangjun": -30
    },
    "collective_memory_added": [
      "御前激辩：边防与民生的两难",
      "郑经提出折中方案的首次亮相"
    ]
  },
  "next_scenario_seeds": [
    {
      "seed_id": "li_shangshu_resignation",
      "description": "李尚书乞骸骨风波",
      "trigger_condition": "下个休沐日前"
    },
    {
      "seed_id": "zhengjing_scheme",
      "description": "郑经的粮种采购暗藏玄机", 
      "trigger_condition": "半月后"
    }
  ]
}
```

### 4.2 叙事生成规则

#### 4.2.1 角色视角选择
- **主导视角**：权重更高的一方获得更多心理描写
- **旁观视角**：在场第三方NPC可提供客观观察
- **皇帝视角**：在决策关键时刻短暂切入

#### 4.2.2 冲突强度调节
```
冲突强度 = (权重差 * 0.3) + (情绪值 * 0.4) + (资源稀缺度 * 0.3)

强度0.3：温和辩论
0.3 ≤  0.6：激烈争执  
强度 ≥ 0.6：危机对抗（可能触发后续事件）
```

#### 4.2.3 语言风格适配
- **史官视角**：克制、中立、略含评价
- **人物话语**：符合其voice特征（李尚书爱用数据，张将军喜用军事比喻）
- **环境描写**：服务于氛围营造，不超过叙事的20%

## 5. 与DecisionTrace的集成参考

### 5.1 数据结构对应
```json
{
  "decision_id": "与DecisionTrace一致",
  "timestamp": "永德元年正月初四/午时三刻",
  "participants": ["li-shangshu", "zhang-jiangjun", "emperor", "zheng-jing", "wang-gonggong"],
  "conflict_analysis": "第3节内容",
  "narrative_output": "第4.1节内容",
  "state_snapshot": {
    "before": "决策前状态",
    "after": "game_state_updates"
  },
  "branching_flags": [
    {"flag": "li_shangshu_disgruntled", "value": true},
    {"flag": "zhang_jiangjun_emboldened", "value": true},
    {"flag": "zhengjing_mediation_used", "value": true}
  ]
}
```

### 5.2 后续决策影响
- **先例效应**：类似决策将参考此次仲裁结果
- **关系链锁**：NPC关系变化影响未来立场
- **记忆沉淀**：collective_memory影响世界基调

## 6. 使用示例

### 6.1 触发条件
```
IF (两个NPC对同一旨意的interpretation差值 > 0.5)
AND (至少一方emotional_state ∈ ["愤怒", "忧虑", "绝望"])
THEN 触发仲裁机制
```

### 6.2 调用流程
1. 收集冲突数据（输入结构）
2. 运行冲突分析（第3节）
3. 生成冲突叙事（第4节）
4. 更新游戏状态
5. 记录至DecisionTrace

### 6.3 输出验证
```
必须包含：
- 至少200字的连贯叙事
- 双方核心论点引用
- 非语言细节描述
- 决策后果暗示
- 后续事件种子
```

---

## 附录：扩展用例

### A. 多方仲裁（三个以上NPC）
- 采用"联盟-对抗"关系网络分析
- 生成更复杂的议会式辩论场景
- 可能产生妥协方案或多输局面

### B. 隐藏冲突（一个NPC内心矛盾）
- 表面赞同，内心反对
- 生成内心独白式叙事
- 可能在后续事件中爆发

### C. 跨时间冲突（决策连锁反应）
- 今日决策与昨日承诺的矛盾
- NPC会翻旧账，增加历史深度
- 需要追溯相关collective_memory

---

**版本**: 1.0  
**最后更新**: 永德元年正月  
**维护者**: 史官系统  

> 注：此文档供Mimo参考仲裁场景生成逻辑。实际实现时，JSON结构需与现有DecisionTrace系统兼容，叙事生成需保持150-300字的紧凑格式。

