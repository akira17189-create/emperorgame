// 靖朝核心角色系统 - TypeScript实现
// 兼容现有游戏数据结构

// ============= 基础接口 =============
export interface NPCTrait {
  loyalty: number;      // 忠诚度 0-100
  ambition: number;     // 野心 0-100  
  greed: number;        // 贪婪 0-100
  courage: number;      // 胆量 0-100
  rationality: number;  // 理性 0-100
  stability: number;    // 稳定性 0-100
  honor: number;        // 荣誉感 0-100
  compassion: number;   // 同情心 0-100
}

export interface Relationship {
  targetId: string;
  value: number;        // 关系值 -100到100
  trust: number;        // 信任度 0-100
  lastInteraction: number; // 最后互动回合
  history: Array<{
    turn: number;
    event: string;
    change: number;
  }>;
}

export interface Memory {
  turn: number;
  event: string;
  emotion: 'positive' | 'negative' | 'neutral';
  intensity: number;
  relatedNpcs: string[];
}

// ============= 张猛专属接口 =============
export interface ZhangMengSpecialTraits {
  impulsivity: number;       // 冲动性 0-100
  loyaltyVolatility: number; // 忠诚波动性 0-100
  honorSensitivity: number;  // 荣誉敏感度 0-100
  brotherhoodValue: number;  // 义气价值 0-100
}

export interface ZhangMengMilitary {
  personalTroops: number;    // 亲兵数量
  troopLoyalty: number;      // 部队忠诚度 0-100
  warExperience: number;     // 作战经验 0-100
  strategicAbility: number;  // 战略能力 0-100
}

export interface ZhangMengFamily {
  sisterStatus: 'safe' | 'threatened' | 'kidnapped' | 'married';
  sisterAffection: number;   // 兄妹感情 0-100
  fatherLegacy: number;      // 父亲遗产影响 0-100
}

export interface ZhangMengHiddenState {
  rebellionTendency: number;    // 造反倾向 0-100
  trustThreshold: number;       // 信任阈值
  grudgeCount: number;          // 积怨次数
  lastHumiliationTurn: number;  // 上次受辱回合
  betrayalTriggers: Set<string>; // 已触发的背叛条件
  redemptionAttempts: number;   // 挽回尝试次数
  externalContacts: string[];   // 外部联系人
}

export interface ZhangMengData {
  // 基础信息
  id: string;
  name: string;
  age: number;
  position: string;
  faction: string;
  
  // 基础特质
  traits: NPCTrait;
  
  // 专属特质
  specialTraits: ZhangMengSpecialTraits;
  
  // 军事信息
  military: ZhangMengMilitary;
  
  // 家庭信息
  family: ZhangMengFamily;
  
  // 人际关系
  relationships: Record<string, Relationship>;
  
  // 隐藏状态（玩家不可见）
  hidden: ZhangMengHiddenState;
  
  // 状态标志
  flags: Set<string>;
  
  // 记忆系统
  memories: Memory[];
  
  // 最近行为
  recentActions: Array<{
    turn: number;
    action: string;
    visibility: 'public' | 'private' | 'secret';
  }>;
}

// ============= 谢渊专属接口 =============
export interface XieYuanSpecialTraits {
  skepticism: number;          // 怀疑程度 0-100
  calculationAbility: number;  // 计算能力 0-100
  moralAmbiguity: number;      // 道德模糊度 0-100
  truthSeeking: number;        // 求真欲 0-100
}

export interface XieYuanStrategy {
  analysisSkill: number;       // 分析能力 0-100
  predictionAccuracy: number;  // 预测准确率 0-100
  contingencyPlans: number;    // 备用计划数量
  riskAssessment: number;      // 风险评估能力 0-100
}

export interface XieYuanIdeology {
  followers: string[];         // 追随者ID
  influenceRadius: number;     // 影响力范围
  doctrineStrength: number;    // 学说强度 0-100
  debateSkill: number;         // 辩论技巧 0-100
}

export interface XieYuanCalculations {
  currentBestPlan: string;     // 当前最优方案
  alternativePlans: string[];  // 备选方案
  riskLevel: 'low' | 'medium' | 'high';
  successProbability: number;  // 成功率估算 0-100
  casualtyEstimate: string;    // 伤亡估计
  resourceRequirement: number; // 资源需求
}

export interface XieYuanHiddenState {
  trueLoyalty: number;         // 真实忠诚度（计算后）
  personalAgenda: string[];    // 个人议程
  influenceNetwork: Set<string>; // 影响力网络
  secretCalculations: Map<string, number>; // 秘密计算
}

export interface XieYuanData {
  id: string;
  name: string;
  age: number;
  position: string;
  faction: string;
  
  traits: NPCTrait;
  specialTraits: XieYuanSpecialTraits;
  strategy: XieYuanStrategy;
  ideology: XieYuanIdeology;
  calculations: XieYuanCalculations;
  
  relationships: Record<string, Relationship>;
  hidden: XieYuanHiddenState;
  flags: Set<string>;
  memories: Memory[];
  
  // 建议历史
  adviceHistory: Array<{
    turn: number;
    issue: string;
    advice: string;
    accepted: boolean;
    outcome: 'success' | 'failure' | 'partial' | 'unknown';
  }>;
}

// ============= 李静斋专属接口 =============
export interface LiJingzhaiSpecialTraits {
  idealism: number;           // 理想主义程度 0-100
  moralClarity: number;       // 道德清晰度 0-100
  empathyLevel: number;       // 共情水平 0-100
  forgiveness: number;        // 宽恕能力 0-100
}

export interface MoralDilemma {
  dilemma: string;
  choice: string;
  regret: number;            // 后悔程度 0-100
  turn: number;
}

export interface LiJingzhaiMorality {
  moralCompass: string[];    // 道德准则
  ethicalDilemmas: MoralDilemma[];
  convictionStrength: number; // 信念强度 0-100
  compromiseWillingness: number; // 妥协意愿 0-100
}

export interface RelationshipDepth {
  trustLevel: number;        // 信任度 0-100
  emotionalBond: number;     // 情感纽带 0-100
  conflictResolution: number; // 冲突解决度 0-100
  lastMeaningfulTalk: number; // 上次深入交谈回合
}

export interface CharacterArc {
  stage: 'innocent' | 'questioning' | 'disillusioned' | 'reformed' | 'enlightened';
  innocenceLost: number;     // 纯真丧失程度 0-100
  realismGained: number;     // 现实认知程度 0-100
  hopeRemaining: number;     // 希望残留度 0-100
  turningPoints: string[];   // 转折点事件
}

export interface LiJingzhaiHiddenState {
  trueBeliefs: string[];     // 真实信念
  privateDoubts: string[];   // 私下疑虑
  moralConflicts: number;    // 道德冲突次数
  idealisticSacrifices: number; // 为理想牺牲的次数
}

export interface LiJingzhaiData {
  id: string;
  name: string;
  age: number;
  position: string;
  faction: string;
  
  traits: NPCTrait;
  specialTraits: LiJingzhaiSpecialTraits;
  morality: LiJingzhaiMorality;
  
  relationships: Record<string, Relationship>;
  relationshipsDepth: Record<string, RelationshipDepth>;
  
  characterArc: CharacterArc;
  hidden: LiJingzhaiHiddenState;
  flags: Set<string>;
  memories: Memory[];
  
  // 谏言历史
  memorials:{
    turn: number;
    title: string;
    content: string;
    response: 'accepted' | 'rejected' | 'ignored' | 'punished';
    impact: number; // 影响力 -100到100
  }>;
}

// ============= 国师玄明专属接口 =============
export interface GuoshiPersonalityMode {
  name: string;
  traits: Record<string, number>;
  behavior: string;
  dialogue_style: string;
  trigger_conditions?: string;
  strategic_note?: string;
  existential_note?: string;
}

export interface GuoshiPersonalityModes {
  innocent: GuoshiPersonalityMode;  // 天真的道士
  cruel: GuoshiPersonalityMode;     // 残酷的道士
  gaming: GuoshiPersonalityMode;    // 游戏的道士
  vulnerable: GuoshiPersonalityMode; // 脆弱的道士
}

export interface GuoshiEmotionalTriggers {
  condition: string;
  target_mode: 'innocent' | 'cruel' | 'gaming' | 'vulnerable';
  weight: number;
}

export interface GuoshiModeTriggers {
  challenge_triggers: GuoshiEmotionalTriggers[];
  emotional_triggers: GuoshiEmotionalTriggers[];
  environmental_triggers: GuoshiEmotionalTriggers[];
}

export interface GuoshiModeSwitchMechanics {
  cooldown: number;
  probability_base: number;
  emotional_influence: number;
  player_influence: number;
}

export interface GuoshiBattleOfWits {
  duel_types: {
    reason_vs_mystery: { name: string; description: string; victory_conditions: { emperor: string; guoshi: string } };
    logic_vs_faith: { name: string; description: string; victory_conditions: { emperor: string; guoshi: string } };
    history_vs_prophecy: { name: string; description: string; victory_conditions: { emperor: string; guoshi: string } };
  };
  duel_history: Array<{ turn: number; type: string; result: 'emperor_win' | 'guoshi_win' | 'draw'; description: string }>;
  abilities: {
    emperor: { scientific_reasoning: number; historical_analysis: number; logical_deduction: number; practical_calculation: number };
    guoshi: { mystical_presentation: number; prophetic_ambiguity: number; ritual_theatrics: number; faith_appeal: number };
  };
  outcome_effects: {
    emperor_win: { trust_change: number; respect_change: number; mode_trigger: 'gaming' };
    guoshi_win: { trust_change: number; respect_change: number; mode_trigger: 'cruel' };
    draw: { trust_change: number; respect_change: number; mode_trigger: 'innocent' };
  };
}

export interface GuoshiSpecialTraits {
  cunning: number;           // 狡黠程度
  playfulness: number;       // 游戏心态
  creativity: number;        // 创造力
  competitiveness: number;   // 竞争性
  loneliness: number;        // 孤独感
  insecurity: number;        // 不安全感
  longing: number;           // 渴望被理解
  authenticity: number;      // 真实性
 迷茫: number;              // 迷茫程度
  existential_crisis: number; // 存在主义危机
}

export interface GuoshiHiddenState {
  gender_secret: boolean;           // 性别秘密（女性伪装男性）
  true_identity: string;            // 真实身份
  master_secret: string;            // 师傅的秘密
  existential_crisis_source: string; // 存在主义危机来源
  vulnerability_shown: number;      // 展现脆弱的次数
  strategic_vulnerability: boolean; // 策略性脆弱展示
}

export interface GuoshiData {
  // 基础信息
  id: string;
  name: string;
  age: number;
  position: string;
  faction: string;

  // 基础特质
  traits: NPCTrait;

  // 专属特质
  specialTraits: GuoshiSpecialTraits;

  // 贝阿朵莉切式人格系统
  personality_modes: GuoshiPersonalityModes;
  current_mode: 'innocent' | 'cruel' | 'gaming' | 'vulnerable';
  mode_switch_history: Array<{ turn: number; from_mode: string; to_mode: string; trigger: string }>;
  mode_triggers: GuoshiModeTriggers;
  mode_switch_mechanics: GuoshiModeSwitchMechanics;

  // 战人对决系统
  battle_of_wits: GuoshiBattleOfWits;

  // 人际关系
  relationships: Record<string, Relationship>;

  // 隐藏状态（玩家不可见）
  hidden: GuoshiHiddenState;

  // 状态标志
  flags: Set<string>;

  // 记忆系统
  memories: Memory[];

  // 最近行为
  recentActions: Array<{
    turn: number;
    action: string;
    visibility: 'public' | 'private' | 'secret';
  }>;
}



// ============= 三人初始数据 =============
export const initialZhangMeng: ZhangMengData = {
  id: 'zhangmeng',
  name: '张猛',
  age: 32,
  position: '五军都督府都督佥事',
  faction: '军队派',
  
  traits: {
    loyalty: 75,
    ambition: 40,
    greed: 20,
    courage: 90,
    rationality: 15,
    stability: 20,
    honor: 85,
    compassion: 45
  },
  
  specialTraits: {
    impulsivity: 80,
    loyaltyVolatility: 60,
    honorSensitivity: 90,
    brotherhoodValue: 75
  },
  
  military: {
    personalTroops: 3000,
    troopLoyalty: 70,
    warExperience: 85,
    strategicAbility: 65
  },
  
  family: {
    sisterStatus: 'safe',
    sisterAffection: 90,
    fatherLegacy: 70
  },
  
  relationships: {},
  
  hidden: {
    rebellionTendency: 25,
    trustThreshold: 40,
    grudgeCount: 0,
    lastHumiliationTurn: -1,
    betrayalTriggers: new Set(),
    redemptionAttempts: 0,
    externalContacts: []
  },
  
  flags: new Set(['loyal', 'impulsive', 'honorable']),
  memories: [],
  recentActions: []
};

export const initialXieYuan: XieYuanData = {
  id: 'xieyuan',
  name: '谢渊',
  age: 28,
  position: '兵部郎中',
  faction: '理性派',
  
  traits: {
    loyalty: 60,
    ambition: 30,
    greed: 10,
    courage: 40,
    rationality: 95,
    stability: 85,
    honor: 50,
    compassion: 20
  },
  
  specialTraits: {
    skepticism: 85,
    calculationAbility: 90,
    moralAmbiguity: 70,
    truthSeeking: 80
  },
  
  strategy: {
    analysisSkill: 88,
    predictionAccuracy: 75,
    contingencyPlans: 3,
    riskAssessment: 82
  },
  
  ideology: {
    followers: [],
    influenceRadius: 5,
    doctrineStrength: 60,
    debateSkill: 85
  },
  
  calculations: {
    currentBestPlan: '稳定朝局，逐步改革',
    alternativePlans: ['拉拢军队派', '分化清流派', '经济优先'],
    riskLevel: 'medium',
    successProbability: 65,
    casualtyEstimate: '可控范围内',
    resourceRequirement: 500000
  },
  
  relationships: {},
  
  hidden: {
    trueLoyalty: 60,
    personalAgenda: ['提升计算精度', '扩大影响力', '验证理性模型'],
    influenceNetwork: new Set(),
    secretCalculations: new Map()
  },
  
  flags: new Set(['rational', 'calculating', 'skeptical']),
  memories: [],
  
  adviceHistory: []
};

export const initialLiJingzhai: LiJingzhaiData = {
  id: 'lijingzhai',
  name: '李静斋',
  age: 24,
  position: '翰林院修撰',
  faction: '清流派',
  
  traits: {
    loyalty: 90,
    ambition: 10,
    greed: 5,
    courage: 70,
    rationality: 60,
    stability: 75,
    honor: 85,
    compassion: 95
  },
  
  specialTraits: {
    idealism: 85,
    moralClarity: 90,
    empathyLevel: 95,
    forgiveness: 80
  },
  
  morality: {
    moralCompass: [
      '民为贵，社稷次之，君为轻',
      '己所不欲，勿施于人',
      '君子喻于义，小人喻于利'
    ],
    ethicalDilemmas: [],
    convictionStrength: 80,
    compromiseWillingness: 30
  },
  
  relationships: {},
  relationshipsDepth: {},
  
  characterArc: {
    stage: 'innocent',
    innocenceLost: 10,
    realismGained: 15,
    hopeRemaining: 95,
    turningPoints: []
  },
  
  hidden: {
    trueBeliefs: ['人性本善', '道德可以感化人', '理想社会可能实现'],
    privateDoubts: [],
    moralConflicts: 0,
    idealisticSacrifices: 0
  },
  
  flags: new Set(['idealistic', 'compassionate', 'naive']),
  memories: [],
  
  memorials: []
};

// ============= 国师玄明初始数据 =============
export const initialGuoshi: GuoshiData = {
  id: 'guoshi',
  name: '玄明',
  age: 18,
  position: '国师',
  faction: '道教',

  traits: {
    loyalty: 60,
    ambition: 40,
    greed: 20,
    courage: 70,
    rationality: 65,
    stability: 75,
    honor: 50,
    compassion: 45
  },

  specialTraits: {
    cunning: 88,           // 狡黠程度
    playfulness: 82,       // 游戏心态
    creativity: 78,        // 创造力
    competitiveness: 85,   // 竞争性
    loneliness: 85,        // 孤独感
    insecurity: 78,        // 不安全感
    longing: 80,           // 渴望被理解
    authenticity: 72,      // 真实性
   迷茫: 75,              // 迷茫程度
    existential_crisis: 80 // 存在主义危机
  },

  personality_modes: {
    innocent: {
      name: '天真模式',
      traits: {
        naivety: 70,
        curiosity: 85,
        openness: 75,
        trust: 60
      },
      behavior: '表现天真好奇，对世界充满兴趣',
      dialogue_style: '"真的吗？好有趣！"'
    },
    cruel: {
      name: '残酷模式',
      traits: {
        arrogance: 90,
        cruelty: 85,
        control: 88,
        dominance: 92
      },
      behavior: '傲慢防御，展现道士气质',
      dialogue_style: '傲慢，攻击性，道士气质'
    },
    gaming: {
      name: '游戏模式',
      traits: {
        cunning: 88,
        playfulness: 82,
        creativity: 78,
        competitiveness: 85
      },
      behavior: '享受智力对决，设定游戏规则',
      dialogue_style: '"那么，皇帝陛下，我们来玩个游戏吧"'
    },
    vulnerable: {
      name: '脆弱模式',
      traits: {
        loneliness: 85,
        insecurity: 78,
        longing: 80,
        authenticity: 72,
        迷茫: 75,
        existential_crisis: 80
      },
      behavior: '无意中流露女性特质，展现脆弱',
      dialogue_style: '真诚，脆弱，少有的坦诚',
      trigger_conditions: '极度信任时，或巨大压力下',
      strategic_note: '国师展现脆弱是出于坏心眼，想要玩弄别人。当发现别人真的心软时，她会反过来嘲笑对方。这不是渴望怜悯或欣赏，而是纯粹的恶意游戏。',
      existential_note: '国师也有存在主义危机，源于这个时代、师父和自身观念与时代的不兼容。'
    }
  },

  current_mode: 'innocent',
  mode_switch_history: [],

  mode_triggers: {
    challenge_triggers: [
      { condition: 'authority_challenged', target_mode: 'cruel', weight: 0.8 },
      { condition: 'belief_questioned', target_mode: 'cruel', weight: 0.7 },
      { condition: 'intellectual_match', target_mode: 'gaming', weight: 0.9 },
      { condition: 'mystery_presented', target_mode: 'gaming', weight: 0.6 }
    ],
    emotional_triggers: [
      { condition: 'high_trust', target_mode: 'vulnerable', weight: 0.7 },
      { condition: 'identity_threat', target_mode: 'vulnerable', weight: 0.85 },
      { condition: 'extreme_pressure', target_mode: 'vulnerable', weight: 0.8 },
      { condition: 'safety_felt', target_mode: 'innocent', weight: 0.6 },
      { condition: 'betrayal_felt', target_mode: 'cruel', weight: 0.9 }
    ],
    environmental_triggers: [
      { condition: 'alone_with_emperor', target_mode: 'vulnerable', weight: 0.5 },
      { condition: 'public_setting', target_mode: 'cruel', weight: 0.4 },
      { condition: 'daoist_ritual', target_mode: 'gaming', weight: 0.7 }
    ]
  },

  mode_switch_mechanics: {
    cooldown: 3,
    probability_base: 0.3,
    emotional_influence: 0.2,
    player_influence: 0.25
  },

  battle_of_wits: {
    duel_types: {
      reason_vs_mystery: {
        name: '理性与神秘的对决',
        description: '皇帝用科学解释 vs 玄明用道术证明',
        victory_conditions: {
          emperor: '提供合理科学解释',
          guoshi: '制造无法解释的"奇迹"'
        }
      },
      logic_vs_faith: {
        name: '逻辑与信仰的对决',
        description: '皇帝要求证据 vs 玄明要求信仰',
        victory_conditions: {
          emperor: '找到逻辑漏洞',
          guoshi: '让对方不得不信'
        }
      },
      history_vs_prophecy: {
        name: '历史与预言的对决',
        description: '皇帝查历史记录 vs 玄明做星象预言',
        victory_conditions: {
          emperor: '证明预言是历史重演',
          guoshi: '预言成功且超出历史模式'
        }
      }
    },
    duel_history: [],
    abilities: {
      emperor: {
        scientific_reasoning: 75,
        historical_analysis: 70,
        logical_deduction: 80,
        practical_calculation: 85
      },
      guoshi: {
        mystical_presentation: 90,
        prophetic_ambiguity: 85,
        ritual_theatrics: 88,
        faith_appeal: 82
      }
    },
    outcome_effects: {
      emperor_win: {
        trust_change: 5,
        respect_change: 10,
        mode_trigger: 'gaming'
      },
      guoshi_win: {
        trust_change: -3,
        respect_change: 8,
        mode_trigger: 'cruel'
      },
      draw: {
        trust_change: 2,
        respect_change: 5,
        mode_trigger: 'innocent'
      }
    }
  },

  relationships: {},

  hidden: {
    gender_secret: true,
    true_identity: '女性，伪装成男性',
    master_secret: '前朝国师玄真，表面自然老死，实则另有隐情',
    existential_crisis_source: '这个时代、师父和自身观念与时代的不兼容',
    vulnerability_shown: 0,
    strategic_vulnerability: true
  },

  flags: new Set(['gender_disguise', 'new_guoshi', 'daoist_leader']),

  memories: [],

  recentActions: []
};



// ============= 关系初始化 =============
export function initializeRelationships(): void {
  // 张猛对谢渊：不信任但尊重其智谋
  initialZhangMeng.relationships['xieyuan'] = {
    targetId: 'xieyuan',
    value: -10,
    trust: 30,
    lastInteraction: 0,
    history: []
  };
  
  // 张猛对李静斋：欣赏其纯真
  initialZhangMeng.relationships['lijingzhai'] = {
    targetId: 'lijingzhai',
    value: 25,
    trust: 60,
    lastInteraction: 0,
    history: []
  };
  
  // 谢渊对张猛：理性分析，保持距离
  initialXieYuan.relationships['zhangmeng'] = {
    targetId: 'zhangmeng',
    value: 5,
    trust: 40,
    lastInteraction: 0,
    history: []
  };
  
  // 谢渊对李静斋：视为研究样本
  initialXieYuan.relationships['lijingzhai'] = {
    targetId: 'lijingzhai',
    value: 15,
    trust: 50,
    lastInteraction: 0,
    history: []
  };
  
  // 李静斋对张猛：视为可拯救的兄长
  initialLiJingzhai.relationships['zhangmeng'] = {
    targetId: 'zhangmeng',
    value: 40,
    trust: 70,
    lastInteraction: 0,
    history: []
  };
  
  initialLiJingzhai.relationshipsDepth['zhangmeng'] = {
    trustLevel: 70,
    emotionalBond: 60,
    conflictResolution: 50,
    lastMeaningfulTalk: 0
  };
  
  // 李静斋对谢渊：试图理解其思想
  initialLiJingzhai.relationships['xieyuan'] = {
    targetId: 'xieyuan',
    value: 20,
    trust: 55,
    lastInteraction: 0,
    history: []
  };
  
  initialLiJingzhai.relationshipsDepth['xieyuan'] = {
    trustLevel: 55,
    emotionalBond: 30,
    conflictResolution: 40,
    lastMeaningfulTalk: 0
  };
  guoshi: initialGuoshi,

  // 国师玄明对皇帝：复杂的对手关系
  initialGuoshi.relationships['emperor'] = {
    targetId: 'emperor',
    value: 0,
    trust: 30,
    lastInteraction: 0,
    history: []
  };

  // 国师对张猛：视为可利用的武将
  initialGuoshi.relationships['zhangmeng'] = {
    targetId: 'zhangmeng',
    value: 20,
    trust: 40,
    lastInteraction: 0,
    history: []
  };

  // 国师对谢渊：视为智力对手
  initialGuoshi.relationships['xieyuan'] = {
    targetId: 'xieyuan',
    value: 30,
    trust: 50,
    lastInteraction: 0,
    history: []
  };

  // 国师对李静斋：视为天真但有趣的研究对象
  initialGuoshi.relationships['lijingzhai'] = {
    targetId: 'lijingzhai',
    value: 40,
    trust: 60,
    lastInteraction: 0,
    history: []
  };


}

// 初始化关系
initializeRelationships();

// ============= 导出核心数据 =============
export const coreCharacters = {
  zhangmeng: initialZhangMeng,
  xieyuan: initialXieYuan,
  lijingzhai: initialLiJingzhai,
  guoshi: initialGuoshi
};

export type CoreCharacterId = keyof typeof coreCharacters;
export type CoreCharacter = ZhangMengData | XieYuanData | LiJingzhaiData | GuoshiData
// 新增NPC

export const EMPRESS_DOWAGER: Character = {
  id: 'empress-dowager-xiao',
  name: '萧氏',
  role: '太后',
  age: 35,
  faction: 'imperial-court',
  personality: '王熙凤型',
  traits: {
    loyalty: 90,
    ambition: 75,
    courage: 65,
    rationality: 80,
    curiosity: 60,
    compassion: 55,
    cunning: 85
  },
  relationships: {
    'player': '婆媳（太后与皇帝）',
    'wang-fuquan': '政治盟友'
  },
  description: '太后萧氏，35岁，先帝正宫皇后。外表端庄贤淑，实则精明强干，善于在后宫与朝堂之间周旋。'
};

export const WANG_FUQUAN: Character = {
  id: 'wang-fuquan',
  name: '王福全',
  role: '司礼监掌印太监',
  age: 55,
  faction: 'eunuchs',
  personality: '王熙凤型',
  traits: {
    loyalty: 60,
    ambition: 80,
    courage: 70,
    rationality: 85,
    curiosity: 50,
    compassion: 30,
    cunning: 95
  },
  relationships: {
    'player': '表面上恭敬，暗中观察',
    'empress-dowager': '政治盟友'
  },
  description: '司礼监掌印太监，55岁，宫中老谋深算的宦官首领。表面对皇帝恭敬有加，实则掌控内廷情报网络。'
};

export const ZHOU_WENYUAN: Character = {
  id: 'zhou-wenyuan',
  name: '周文渊',
  role: '礼部尚书',
  age: 62,
  faction: 'imperial-court',
  personality: '荀彧型',
  traits: {
    loyalty: 85,
    ambition: 40,
    courage: 60,
    rationality: 90,
    curiosity: 55,
    compassion: 70,
    cunning: 65
  },
  relationships: {
    'player': '老臣，持观望态度',
    'li-jingzhai': '赏识其才华'
  },
  description: '礼部尚书，62岁，三代老臣，历经三朝。为人正直但过于守旧，对新政持保留态度。'
};

export const LIN_WANER: Character = {
  id: 'lin-waner',
  name: '林婉儿',
  role: '翰林院编修',
  age: 28,
  faction: 'imperial-court',
  personality: '林黛玉+花木兰',
  traits: {
    loyalty: 80,
    ambition: 55,
    courage: 85,
    rationality: 75,
    curiosity: 90,
    compassion: 80,
    cunning: 70
  },
  relationships: {
    'player': '同事，暗中欣赏',
    'xie-yuan': '文友，互相赏识'
  },
  description: '翰林院编修，28岁，隐瞒女性身份参加科举。才华横溢却因性别桎梏，内心充满矛盾。'
};

export const ZHAO_HUCHEN: Character = {
  id: 'zhao-huchen',
  name: '赵虎臣',
  role: '兵部尚书',
  age: 52,
  faction: 'military',
  personality: '宋江+岳飞',
  traits: {
    loyalty: 95,
    ambition: 50,
    courage: 90,
    rationality: 70,
    curiosity: 40,
    compassion: 75,
    cunning: 60
  },
  relationships: {
    'player': '武将，忠诚但愚直',
    'zhang-meng': '军中后辈，颇为赏识'
  },
  description: '兵部尚书，52岁，行伍出身，曾戍边多年。忠诚勇武但不善政治，对党争深恶痛绝。'
};

export const CHEN_SIHAI: Character = {
  id: 'chen-sihai',
  name: '陈四海',
  role: '户部左侍郎',
  age: 48,
  faction: 'pragmatists',
  personality: '张居正型',
  traits: {
    loyalty: 70,
    ambition: 75,
    courage: 65,
    rationality: 90,
    curiosity: 60,
    compassion: 55,
    cunning: 80
  },
  relationships: {
    'player': '务实派，可用之人',
    'xie-yuan': '政见相似，可为盟友'
  },
  description: '户部左侍郎，48岁，财政专家。为人务实，注重实效，对清流的空谈不以为然。'
};

export const XIAO_DEZI: Character = {
  id: 'xiao-dezi',
  name: '李德（小德子）',
  role: '御前太监',
  age: 22,
  faction: 'imperial-court',
  personality: '贾芸型',
  traits: {
    loyalty: 95,
    ambition: 30,
    courage: 40,
    rationality: 50,
    curiosity: 65,
    compassion: 70,
    cunning: 45
  },
  relationships: {
    'player': '忠心侍奉',
    'wang-fuquan': '表面服从，内心警惕'
  },
  description: '御前太监，22岁，皇帝贴身侍从。年轻单纯，对皇帝忠心耿耿，但涉世未深。'
};

export const QIU_YUE: Character = {
  id: 'qiu-yue',
  name: '秋月',
  role: '贴身宫女',
  age: 20,
  faction: 'imperial-court',
  personality: '袭人型',
  traits: {
    loyalty: 90,
    ambition: 25,
    courage: 35,
    rationality: 55,
    curiosity: 50,
    compassion: 80,
    cunning: 40
  },
  relationships: {
    'player': '贴身侍奉，暗中爱慕'
  },
  description: '贴身宫女，20岁，温柔细心。对皇帝有好感但深知身份悬殊，默默守护。'
};

export const XU_DA: Character = {
  id: 'xu-da',
  name: '徐达',
  role: '蓟辽总督',
  age: 45,
  faction: 'military',
  personality: '关羽型',
  traits: {
    loyalty: 95,
    ambition: 45,
    courage: 95,
    rationality: 65,
    curiosity: 35,
    compassion: 60,
    cunning: 50
  },
  relationships: {
    'player': '边将，重义轻利',
    'zhang-meng': '军中同袍'
  },
  description: '蓟辽总督，45岁，镇守边关多年。忠义无双，重信守诺，但过于耿直。'
};

export const LIU_ZHANG: Character = {
  id: 'liu-zhang',
  name: '刘璋',
  role: '江南富商',
  age: 40,
  faction: 'pragmatists',
  personality: '薛宝钗商业型',
  traits: {
    loyalty: 60,
    ambition: 80,
    courage: 55,
    rationality: 85,
    curiosity: 70,
    compassion: 50,
    cunning: 90
  },
  relationships: {
    'player': '可利用的商人',
    'chen-sihai': '利益关联'
  },
  description: '江南富商，40岁，富甲一方但地位卑微。渴望通过政治投资获得更高社会地位。'
};

export const SUN_SIDE: Character = {
  id: 'sun-side',
  name: '孙思德',
  role: '太医院院判',
  age: 50,
  faction: 'imperial-court',
  personality: '贾雨村型',
  traits: {
    loyalty: 55,
    ambition: 65,
    courage: 45,
    rationality: 80,
    curiosity: 75,
    compassion: 40,
    cunning: 85
  },
  relationships: {
    'player': '医官，不可轻信',
    'empress-dowager': '暗中效忠'
  },
  description: '太医院院判，50岁，医术精湛但心术不正。表面恭顺，实则另有所图。'
};

// 导出所有新NPC
export const NEW_NPCS = {
  EMPRESS_DOWAGER,
  WANG_FUQUAN,
  ZHOU_WENYUAN,
  LIN_WANER,
  ZHAO_HUCHEN,
  CHEN_SIHAI,
  XIAO_DEZI,
  QIU_YUE,
  XU_DA,
  LIU_ZHANG,
  SUN_SIDE
};
