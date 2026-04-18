# 靖朝核心角色系统设计

## 一、NPC数据结构扩展

### 基础NPC接口扩展
```typescript
interface NPCBase {
  id: string;
  name: string;
  age: number;
  position: string;
  faction: string;
  
  // 基础特质（0-100）
  traits: {
    loyalty: number;        // 忠诚度
    ambition: number;       // 野心
    greed: number;          // 贪婪
    courage: number;        // 胆量
    rationality: number;    // 理性
    stability: number;      // 稳定性
    honor: number;          // 荣誉感
    compassion: number;     // 同情心
  };
  
  // 人际关系
  relationships: Record<string, Relationship>;
  
  // 隐藏状态（玩家不可见）
  hidden: {
    rebellion_tendency: number;      // 造反倾向 0-100
    trust_threshold: number;         // 信任阈值
    grudge_count: number;            // 积怨次数
    last_humiliation_turn: number;   // 上次受辱的回合
    betrayal_triggers: Set<string>;  // 已触发的背叛条件
  };
  
  // 状态标志
  flags: Set<string>;
  
  // 记忆系统（记住重要事件）
  memories: Array<{
    turn: number;
    event: string;
    emotion: 'positive' | 'negative' | 'neutral';
    intensity: number;
    related_npcs: string[];
  }>;
}
```

### 张猛专属数据
```typescript
interface ZhangMengData extends NPCBase {
  // 专属特质
  special_traits: {
    impulsivity: number;       // 冲动性
    loyalty_volatility: number; // 忠诚波动性
    honor_sensitivity: number;  // 荣誉敏感度
    brotherhood_value: number;  // 义气价值
  };
  
  // 军队相关
  military: {
    personal_troops: number;      // 亲兵数量
    troop_loyalty: number;        // 部队忠诚度
    war_experience: number;       // 作战经验
    strategic_ability: number;    // 战略能力
  };
  
  // 家人状态
  family: {
    sister_status: 'safe' | 'threatened' | 'kidnapped' | 'married';
    sister_affection: number;     // 兄妹感情
    father_legacy: number;        // 父亲遗产影响
  };
  
  // 触发条件
  triggers: {
    humiliation_threshold: number;     // 羞辱阈值
    betrayal_point: number;            // 背叛临界点
    redemption_possible: boolean;      // 是否可挽回
    last_redemption_attempt: number;   // 上次挽回尝试
  };
}
```

### 谢渊专属数据
```typescript
interface XieYuanData extends NPCBase {
  // 专属特质
  special_traits: {
    skepticism: number;           // 怀疑程度
    calculation_ability: number;  // 计算能力
    moral_ambiguity: number;      // 道德模糊度
    truth_seeking: number;        // 求真欲
  };
  
  // 智谋系统
  strategy: {
    analysis_skill: number;       // 分析能力
    prediction_accuracy: number;  // 预测准确率
    contingency_plans: number;    // 备用计划数量
    risk_assessment: number;      // 风险评估能力
  };
  
  // 思想传播
  ideology: {
    followers: string[];          // 追随者ID
    influence_radius: number;     // 影响力范围
    doctrine_strength: number;    // 学说强度
    debate_skill: number;         // 辩论技巧
  };
  
  // 理性计算系统
  calculations: {
    current_best_plan: string;    // 当前最优方案
    alternative_plans: string[];  // 备选方案
    risk_level: 'low' | 'medium' | 'high';
    success_probability: number;  // 成功率估算
  };
}
```

### 李静斋专属数据
```typescript
interface LiJingzhaiData extends NPCBase {
  // 专属特质
  special_traits: {
    idealism: number;            // 理想主义程度
    moral_clarity: number;       // 道德清晰度
    empathy_level: number;       // 共情水平
    forgiveness: number;         // 宽恕能力
  };
  
  // 道德系统
  morality: {
    moral_compass: string[];     // 道德准则
    ethical_dilemmas: Array<{    // 道德困境记录
      dilemma: string;
      choice: string;
      regret: number;
    }>;
    conviction_strength: number; // 信念强度
    compromise_willingness: number; // 妥协意愿
  };
  
  // 人际关系深度
  relationships_depth: {
    [npc_id: string]: {
      trust_level: number;
      emotional_bond: number;
      conflict_resolution: number;
      last_meaningful_talk: number;
    };
  };
  
  // 成长弧光
  character_arc: {
    stage: 'innocent' | 'questioning' | 'disillusioned' | 'reformed' | 'enlightened';
    innocence_lost: number;      // 纯真丧失程度
    realism_gained: number;      // 现实认知程度
    hope_remaining: number;      // 希望残留度
  };
}
```

## 二、关键事件链设计

### 张猛事件链
```typescript
// 第一阶段：忠诚测试（承德元年1-12月）
const zhangmeng_events_phase1 = [
  {
    id: "zm_001",
    name: "军饷拖欠",
    trigger: "turn % 3 == 0 && 1000000",
    conditions: ["zhangmeng.loyalty > 60"],
    options: [
      { text: "立即拨付军饷", effect: { loyalty: +10, treasury: -50000 } },
      { text: "承诺下月补发", effect: { loyalty: -5, grudge: +1 } },
      { text: "削减军费开支", effect: { loyalty: -15, grudge: +3 } }
    ]
  },
  {
    id: "zm_002", 
    name: "边关战功",
    trigger: "northern_border_crisis == true",
    conditions: ["zhangmeng.courage > 70"],
    options: [
      { text: "大力封赏", effect: { loyalty: +20, honor: +15, ambition: +5 } },
      { text: "普通嘉奖", effect: { loyalty: +5, honor: +3 } },
      { text: "功过相抵", effect: { loyalty: -10, honor: -20, grudge: +2 } }
    ]
  }
];

// 第二阶段：关系深化（承德2年）
const zhangmeng_events_phase2 = [
  {
    id: "zm_101",
    name: "妹妹的婚事",
    trigger: "zhangmeng.family.sister_status == 'safe' && turn > 24",
    conditions: ["zhangmeng.loyalty > 50"],
    options: [
      { text: "赐婚皇室", effect: { loyalty: +25, family_bond: +20 } },
      { text: "自由择婿", effect: { loyalty: +10, sister_affection: +15 } },
      { text: "政治联姻", effect: { loyalty: +5, ambition: +10, guilt: +20 } }
    ]
  },
  {
    id: "zm_102",
    name: "旧部求情",
    trigger: "zhangmeng.military.personal_troops > 2000",
    conditions: ["corruption_case == true"],
    options: [
      { text: "法外开恩", effect: { loyalty: +15, military_loyalty: +20, corruption: +10 } },
      { text: "秉公处理", effect: { loyalty: -10, military_loyalty: -15, justice: +20 } },
      { text: "交由张猛处置", effect: { loyalty: +5, trust: +10, responsibility: +15 } }
    ]
  }
];

// 第三阶段：危机转折（承德3年）
const zhangmeng_events_phase3 = [
  {
    id: "zm_201",
    name: "猜忌的种子",
    trigger: "zhangmeng.hidden.grudge_count >= 3 && zhangmeng.hidden.trust_th 40",
    conditions: ["faction_struggle == true"],
    options: [
      { text: "坦诚沟通", effect: { loyalty: +5, trust: +10, suspicion: -15 } },
      { text: "暗中监视", effect: { loyalty: -10, suspicion: +20, rebellion_tendency: +15 } },
      { text: "调离京师", effect: { loyalty: -25, rebellion_tendency: +30, ambition: +20 } }
    ]
  },
  {
    id: "zm_202",
    name: "背叛的临界点",
    trigger: "zhangmeng.hidden.rebellion_tendency > 70",
    conditions: ["external_temptation == true"],
    options: [
      { text: "信任依旧", effect: { loyalty: +30, rebellion_tendency: -40, risk: 'high' } },
      { text: "分化瓦解", effect: { loyalty: -20, military_loyalty: -30, rebellion_tendency: +10 } },
      { text: "先发制人", effect: { loyalty: -100, civil_war: true, tragedy: true } }
    ]
  }
];
```

### 谢渊事件链
```typescript
// 第一阶段：价值展示（承德元年）
const xieyuan_events_phase1 = [
  {
    id: "xy_001",
    name: "理性分析",
    trigger: "major_decision_required == true",
    conditions: ["xieyuan.rationality > 80"],
    options: [
      { text: "采纳建议", effect: { rationality: +10, trust: +15, moral_ambiguity: +5 } },
      { text: "部分采纳", effect: { rationality: +3, trust: +5 } },
      { text: "拒绝冷血方案", effect: { rationality: -5, morality: +10, resentment: +8 } }
    ],
    calculations: {
      success_probability: 75,
      casualty_estimate: "1000-3000平民",
      long_term_gain: "稳定+20"
    }
  },
  {
    id: "xy_002",
    name: "思想传播",
    trigger: "xieyuan.ideology.influence_radius > 5",
    conditions: ["court_debate == true"],
    options: [
      { text: "鼓励辩论", effect: { influence: +15, followers: +3, controversy: +20 } },
      { text: "适度限制", effect: { influence: +5, stability: +10 } },
      { text: "严厉禁止", effect: { influence: -20, loyalty: -15, hidden_activity: true } }
    ]
  }
];

// 第二阶段：道德困境（承德2年）
const xieyuan_events_phase2 = [
  {
    id: "xy_101",
    name: "电车难题",
    trigger: "famine_crisis == true",
    conditions: ["xieyuan.special_traits.moral_ambiguity > 50"],
    options: [
      { text: "牺牲少数救多数", effect: { efficiency: +25, compassion: -20, guilt: +30 } },
      { text: "平均分配", effect: { efficiency: -10, compassion: +15, mortality: +20 } },
      { text: "寻求第三条路", effect: { creativity: +20, risk: 'high', time_pressure: true } }
    ],
    xieyuan_comment: "从理性角度看，方案一可多救3000人，但会失去道德高地。"
  }
];
```

### 李静斋事件链
```typescript
// 第一阶段：理想主义（承德元年）
const lijingzhai_events_phase1 = [
  {
    id: "lj_001",
    name: "初次上疏",
    trigger: "turn == 3",
    conditions: ["lijunzhai.idealism > 70"],
    options: [
      { text: "嘉奖勇气", effect: { loyalty: +20, courage: +15, political_naivety: +10 } },
      { text: "温和驳回", effect: { loyalty: +5, realism: +8 } },
      { text: "严厉斥责", effect: { loyalty: -15, idealism: -20, innocence_lost: +15 } }
    ]
  },
  {
    id: "lj_002",
    name: "调解冲突",
    trigger: "zhangmeng_grudge > 0 && xieyuan_coldness > 0",
    conditions: ["lijunzhai.compassion > 80"],
    options: [
      { text: "支持调解", effect: { mediation_skill: +15, relationship_zhang_xie: +10 } },
      { text: "任其发展", effect: { realism: +10, passive: true } },
      { text: "偏袒一方", effect: { relationship_with_chosen: +20, relationship_with_other: -30 } }
    ]
  }
];

// 第二阶段：理想破灭（承德2-3年）
const lijingzhai_events_phase2 = [
  {
    id: "lj_101",
    name: "第一次妥协",
    trigger: "lijunzhai.character_arc.innocence_lost > 40",
    conditions: ["political_pressure == true"],
    options: [
      { text: "坚持原则", effect: { conviction: +25, career_risk: 'high', isolation: +20 } },
      { text: "无奈妥协", effect: { innocence_lost: +30, pragmatism: +15, regret: +25 } },
      { text: "彻底转变", effect: { idealism: -40, cynicism: +35, character_arc: 'disillusioned' } }
    ]
  }
];
```

### 三人互动事件链
```typescript
const trio_interaction_events = [
  {
    id: "tri_001",
    name: "酒馆夜谈",
    trigger: "turn % 6 == 0 && all_three_in_capital == true",
    participants: ["zhangmeng", "xieyuan", "lijingzhai"],
    scenarios: [
      {
        condition: "zhangmeng.loyalty > 70",
        dialogue: {
          zhangmeng: "陛下待我甚厚，我必以死相报！",
          xieyuan: "忠诚值得赞赏，但需思考回报的概率与风险。",
          lijingzhai: "张将军赤胆忠心，令人敬佩。谢兄也当有些许感动才是。"
        },
        effects: {
          zhangmeng_loyalty: +5,
          zhangmeng_xieyuan_relation: -3,
          zhangmeng_lijingzhai_relation: +8,
          xieyuan_lijingzhai_relation: +2
        }
      },
      {
        condition: "zhangmeng.hidden.grudge_count >= 2",
        dialogue: {
          zhangmeng: "朝中奸佞当道，陛下为何视而不见？",
          xieyuan: "政治本如此。你若不满，可有计算过反叛的胜算？",
          lijingzhai: "二位莫要说此大逆之言！张将军，我相信陛下终会明察。"
        },
        effects: {
          zhangmeng_rebellion_tendency: +10,
          xieyuan_calculations: { new_plan: "备选方案：张猛若反，该如何应对" },
          lijingzhai_worry: +20
        }
      }
    ]
  },
  {
    id: "tri_002",
    name: "危机抉择",
    trigger: "major_crisis == true",
    participants: ["zhangmeng", "xieyuan", "lijingzhai"],
    scenarios: [
      {
        condition: "crisis_type == 'military'",
        advice: {
          zhangmeng: "臣请率兵五千，必破敌阵！",
          xieyuan: "分析：正面强攻损失约2000人，成功率65%。建议分兵牵制，主力绕后。",
          lijingzhai: "可否先派使者议和？百姓已苦于战乱..."
        },
        player_choices: [
          {
            text: "采纳张猛方案",
            effect: { zhangmeng_loyalty: +25, military_victory: 70, casualties: 'high' }
          },
          {
            text: "采纳谢渊方案", 
            effect: { xieyuan_trust: +20, efficiency: +15, zhangmeng_humiliation: +10 }
          },
          {
            text: "尝试李静斋方案",
            effect: { lijingzhai_hope: +30, peace_chance: 40, weakness_perception: +25 }
          }
        ]
      }
    ]
  },
  {
    id: "tri_003",
    name: "信任危机",
    trigger: "zhangmeng.hidden.rebellion_tendency > 50",
    participants: ["xieyuan", "lijingzhai"],
    scenarios: [
      {
        condition: "xieyuan.loyalty > 50",
        dialogue: {
          xieyuan: "张猛反意已显，我计算过，此时告发成功率87%。",
          lijingzhai: "不！谢兄，张将军只是一时糊涂。我去劝他，定能挽回！",
          xieyuan: "情感用事。但...如果你坚持，我可以给你三天时间。"
        },
        effects: {
          xieyuan_lijingzhai_relation: +15,
          redemption_window: 3,
          critical_decision_required: true
        }
      }
    ]
  }
];
```

## 三、互动机制系统

### 1. 关系动态计算系统
```typescript
class RelationshipSystem {
  // 基础关系变化
  calculateRelationshipChange(event: GameEvent): RelationshipDelta {
    const delta: RelationshipDelta = {};
    
    // 性格相容性计算
    const compatibility = this.calculateCompatibility(
      event.npc1.traits,
      event.npc2.traits
    );
    
    // 事件类型权重
    const weight = this.getEventWeight(event.type);
    
    // 历史关系影响
    const historyModifier = this.getHistoryModifier(
      event.npc1.id, 
      event.npc2.id,
      event.turn
    );
    
    // 计算最终变化
    delta.value = compatibility * weight * historyModifier;
    delta.confidence = this.calculateConfidence(event);
    
    return delta;
  }
  
  // 三人关系三角平衡
  calculateTriadBalance(npc1: string, npc2: string, npc3: string): TriadState {
    const r12 = this.getRelationship(npc1, npc2);
    const r13 = this.getRelationship(npc1, npc3);
    const r23 = this.getRelationship(npc2, npc3);
    
    return {
      stability: Math.min(r12.stability, r13.stability, r23.stability),
      tension: Math.abs(r12.value - r13.value) + Math.abs(r12.value - r23.value),
      mediator: this.findMediator(npc1, npc2, npc3)
    };
  }
}
```

### 2. 忠诚度动态系统
```typescript
class LoyaltyDynamicSystem {
  // 张猛忠诚度特殊计算
  calculateZhangMengLoyalty(zhangmeng: ZhangMengData, playerActions: PlayerAction[]): number {
    let baseLoyalty = zhangmeng.traits.loyalty;
    
    // 荣誉影响
    const honorEffect = zhangmeng.special_traits.honor_sensitivity * 
      (zhangmeng.traits.honor / 100);
    
    // 积怨惩罚
    const grudgePenalty = zhangmeng.hidden.grudge_count * 5;
    
    // 近期恩惠
    const recentFavors = this.calculateRecentFavors(playerActions);
    
    // 性格波动
    const volatility = zhangmeng.special_traits.loyalty_volatility * 
      (Math.random() * 0.4 - 0.2); // ±20%波动
    
    return Math.max(0, Math.min(100, 
      baseLoyalty + honorEffect - grudgePenalty + recentFavors + volatility
    ));
  }
  
  // 背叛风险评估
  assessRebellionRisk(zhangmeng: ZhangMengData): RebellionRisk {
    const riskFactors = [
      zhangmeng.hidden.rebellion_tendency > 70,
      zhangmeng.hidden.grudge_count >= 3,
      zhangmeng.traits.loyalty40,
      zhangmeng.military.personal_troops > 5000,
      this.hasExternalTemptation(zhangmeng)
    ];
    
    const riskLevel = riskFactors.filter(Boolean).length;
    
    return {
      level: riskLevel,
      triggers: this.getActiveTriggers(zhangmeng),
      warningSigns: this.detectWarningSigns(zhangmeng),
      preventionOptions: this.generatePreventionOptions(zhangmeng)
    };
  }
}
```

### 3. 事件链触发系统
```typescript
class EventChainTrigger {
  // 检查张猛关键转折点
  checkZhangMengTurningPoints(zhangmeng: ZhangMengData, gameState: GameState): EventChain | null {
    // 忠诚危机转折点
    if (zhangmeng.traits.loyalty30 && zhangmeng.hidden.grudge_count >= 2) {
      return this.getEventChain('zhangmeng_loyalty_crisis');
    }
    
    // 家人危机转折点
    if (zhangmeng.family.sister_status === 'threatened' && 
        zhangmeng.traits.loyal 60) {
      return this.getEventChain('zhangmeng_family_crisis');
    }
    
    // 外部诱惑转折点
    if (this.hasPowerfulTemptation(zhangmeng)) {
      return this.getEventChain('zhangmeng_temptation');
    }
    
    return null;
  }
  
  // 三人关系关键事件
  checkTrioCriticalEvents(trio: TrioState): EventChain | null {
    // 张猛-谢渊冲突
    if (this.getRelationship('zhangmeng', 'xieyuan'). 20) {
      return this.getEventChain('zhang_xie_conflict');
    }
    
    // 李静斋调解尝试
    if (this.getRelationship('zhangmeng', 'xieyuan').value40 &&
        this.getRelationship('lijingzhai', 'zhangmeng').value > 60 &&
        this.getRelationship('lijingzhai', 'xieyuan').value > 50) {
      return this.getEventChain('lijingzhai_mediation');
    }
    
    // 信任危机三角
    if (this.calculateTriadBalance('zhangmeng', 'xieyuan', 'lijingzhai').tension > 70) {
      return this.getEventChain('trio_trust_crisis');
    }
    
    return null;
  }
}
```

## 四、游戏集成建议

### 1. 数据结构集成
```typescript
// 在现有游戏中集成
interface GameState {
  // 现有字段...
  
  // 新增核心角色系统
  core_characters: {
    zhangmeng: ZhangMengData;
    xieyuan: XieYuanData;
    lijingzhai: LiJingzhaiData;
  };
  
  // 关系网络
  relationship_network: RelationshipSystem;
  
  // 事件链管理器
  event_chains: EventChainManager;
  
  // 动态计算系统
  dynamics: {
    loyalty: LoyaltyDynamicSystem;
    interaction: InteractionSystem;
    crisis: CrisisSystem;
  };
}
```

### 2. 回合更新逻辑
```typescript
function updateTurn(gameState: GameState): void {
  // 现有逻辑...
  
  // 新增：核心角色状态更新
  updateCoreCharacters(gameState);
  
  // 关系动态计算
  updateRelationships(gameState);
  
  // 检查事件链触发
  checkEventChains(gameState);
  
  // 更新隐藏状态
  updateHiddenStates(gameState);
  
  // 生成局势报告
  generateSituationReport(gameState);
}

function updateCoreCharacters(gameState: GameState): void {
  const { zhangmeng, xieyuan, lijingzhai } = gameState.core_characters;
  
  // 张猛忠诚度重计算
  zhangmeng.traits.loyalty = gameState.dynamics.loyalty
    .calculateZhangMengLoyalty(zhangmeng, gameState.playerActions);
  
  // 谢渊理性分析
  xieyuan.calculations.current_best_plan = gameState.dynamics.interaction
    .calculateOptimalPlan(gameState);
  
  // 李静斋道德成长
  lijingzhai.character_arc = gameState.dynamics.interaction
    .updateCharacterArc(lijingzhai, gameState);
}
```

### 3. 玩家界面扩展
```typescript
// 新增玩家可见信息层次
interface PlayerVisibleInfo {
  // 表层信息（直接可见）
  surface: {
    zhangmeng: {
      loyalty: string; // "忠心耿耿" / "有所不满" / "心怀怨怼"
      recent_actions: string[];
      mood: string;
    };
    // 类似其他角色...
  };
  
  // 中层信息（需要侦查/信任）
  middle: {
    zhangmeng: {
      troop_movements: string[];
      contacts: string[];
      financial_situation: string;
    };
  };
  
  // 深层信息（密探/心腹报告）
  deep: {
    zhangmeng: {
      hidden_meetings: string[];
      secret_correspondence: string[];
      true_intentions: string; // 需要高等级密探
    };
  };
}
```

## 五、测试场景示例

### 场景1：张猛忠诚危机
```typescript
const test_scenario_1 = {
  setup: {
    turn: 36, // 承德3年
    zhangmeng: {
      loyalty: 45,
      hidden: {
        rebellion_tendency: 65,
        grudge_count: 3,
        last_humiliation_turn: 32
      },
      military: {
        personal_troops: 4500,
        troop_loyalty: 75
      }
    },
    external_factor: "北境王徐达暗中联络"
  },
  
  expected_events: [
    "北境王密使接触张猛",
    "张猛心情烦躁，酗酒闹事",
    "谢渊分析：张猛反叛概率68%",
    "李静斋请求面见张猛劝解"
  ],
  
  player_options: [
    "召见张猛，坦诚相谈",
    "派密探监视张猛府邸", 
    "调张猛部分兵力南下",
    "为张猛妹妹赐婚安其心"
  ],
  
  possible_outcomes: [
    "张猛感念君恩，忠诚回升至70",
    "张猛认为受猜忌，反意更坚",
    "张猛表面服从，暗中准备",
    "张猛连夜出逃，投奔北境王"
  ]
};
```

### 场景2：三人思想碰撞
```typescript
const test_scenario_2 = {
  setup: {
    situation: "大旱，南方饥荒",
    zhangmeng_position: "应立即开仓放粮，救民于水火",
    xieyuan_analysis: {
      problem: "存粮仅够京师三月，南方需粮十万石",
      solution1: "全力赈灾，京师可能生乱，成功率55%",
      solution2: "部分赈灾，维持京师稳定，可救60%灾民",
      solution3: "优先保京师，南方自求生路，效率最高"
    },
    lijingzhai_reaction: "怎能见死不救！必须救所有人！"
  },
  
  dialogue_tree: {
    start: "御前会议讨论赈灾方案",
    branch1: {
      choice: "采纳张猛方案",
      consequence: "民心得，但京师风险增，谢渊不满",
      follow_up: "粮食危机真的发生，需应对京师动乱"
    },
    branch2: {
      choice: "采纳谢渊方案二",
      consequence: "平衡但都不满，李静斋道德痛苦",
      follow_up: "南方仍有饿殍，清流弹劾见死不救"
    },
    branch3: {
      choice: "尝试李静斋的理想方案",
      consequence: "寻找第三条路，高风险高回报",
      follow_up: "成功则三赢，失败则全面危机"
    }
  }
};
```

## 六、扩展可能性

### 1. 张猛多结局系统
```typescript
const zhangmeng_endings = {
  // 忠臣路线
  loyal_general: {
    requirements: ["loyalty > 80", "honor > 70", "no_betrayal_triggers"],
    outcome: "成为靖朝护国柱石，死后配享太庙",
    legacy: "张家三代为将，忠心不二"
  },
  
  // 悲剧英雄
  tragic_hero: {
    requirements: ["loyalty > 60", "forced_betrayal == true", "redemption_failed"],
    outcome: "被逼反叛，战败被俘，宁死不降",
    legacy: "民间传颂其忠义，朝廷讳莫如深"
  },
  
  // 成功叛将  
  successful_rebel: {
    requirements: ["rebellion_successful", "establish_new_dynasty == true"],
    outcome: "自立为帝，改朝换代",
    legacy: "史书评价两极：枭雄还是叛臣"
  },
  
  // 觉悟者
  enlightened_general: {
    requirements: ["character_growth > 70", "from_impulsive_to_wise == true"],
    outcome: "经历磨难后成为成熟统帅，辅佐明君",
    legacy: "从猛将到帅才的典范"
  }
};
```

### 2. 谢渊思想演变
```typescript
const xieyuan_evolution_paths = {
  // 理性至上 -> 冷酷无情
  path_ruthless: {
    stages: ["怀疑一切", "否定道德", "纯粹计算", "人性丧失"],
    end_state: "成为没有感情的决策机器"
  },
  
  // 理性 -> 包容
  path_inclusive: {
    stages: ["理性分析", "理解情感", "整合智慧", "平衡之道"],
    end_state: "理性与情感融合的智者"
  },
  
  // 理性 -> 虚无
  path_nihilism: {
    stages: ["怀疑一切", "发现矛盾", "意义危机", "彻底虚无"],
    end_state: "看破一切，归隐山林"
  }
};
```

### 3. 李静斋成长弧光
```typescript
const lijingzhai_character_arc = {
  // 理想主义 -> 成熟务实
  arc_pragmatic_idealist: {
    stages: ["纯真理想", "现实冲击", "痛苦反思", "务实理想"],
    end_state: "保持理想但懂得现实妥协的改革者"
  },
  
  // 理想主义 -> 彻底幻灭
  arc_cynic: {
    stages: ["纯真理想", "连续打击", "信念崩塌", "彻底幻灭"],
    end_state: "从最善良变成最愤世嫉俗"
  },
  
  // 理想主义 -> 圣徒
  arc_saint: {
    stages: ["纯真理想", "磨难考验", "信仰坚定", "道德升华"],
    end_state: "历经磨难不改初心的道德楷模"
  }
};
```