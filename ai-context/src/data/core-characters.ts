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
  history:{
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
  shameThreshold: number;    // 羞耻阈值 0-100
}

export interface ZhangMengState {
  resentment: number;        // 怨气值 0-100
  grudgeCount: number;       // 积怨次数
  lastHumiliationTurn: number; // 最后受辱回合
  betrayalTriggers: string[]; // 背叛触发器数组
  redemptionAttempts: number; // 赎罪尝试次数
  externalContacts: string[]; // 外部联系人
}

// ============= 谢渊专属接口 =============
export interface XieYuanSpecialTraits {
  schemingAbility: number;   // 谋划能力 0-100
  riskTolerance: number;    // 风险容忍度 0-100
  patience: number;         // 耐心 0-100
  adaptability: number;     // 适应性 0-100
}

export interface XieYuanState {
  hiddenAgendas: string[];  // 隐藏议程
  contingencyPlans: string[]; // 应急预案
  leverageOverOthers: string[]; // 对他人把柄
  secretAllies: string[];   // 秘密盟友
}

// ============= 李敬斋专属接口 =============
export interface LiJingZhaiSpecialTraits {
  idealism: number;         // 理想主义 0-100
  moralConviction: number;  // 道德信念 0-100
  naivety: number;         // 天真度 0-100
  resilience: number;      // 韧性 0-100
}

export interface LiJingZhaiState {
  moralDilemmas: string[];  // 道德困境记录
  reformProposals: string[]; // 改革提案
  trustedConfidants: string[]; // 信任的知己
  ethicalBoundaries: string[]; // 伦理边界
}

// ============= 国师专属接口 =============
export interface GuoshiSpecialTraits {
  daoistMastery: number;    // 道法精通 0-100
  enlightenment: number;    // 悟性 0-100
  detachment: number;      // 超脱度 0-100
  mysticalInsight: number; // 神秘洞察 0-100
}

export interface GuoshiState {
  daoistPractices: string[]; // 道法修炼
  cosmicCalculations: string[]; // 天机测算
  visionRecords: string[];   // 天象记录
  internalAlchemy: string[]; // 内丹修炼
}

// ============= 基础NPC接口 =============
export interface BaseNPC {
  id: string;
  slug: string;
  name: string;
  role: string;
  faction: string;
  status: 'active' | 'inactive' | 'dead' | 'exiled';
  
  traits: NPCTrait;
  relationships: Record<string, Relationship>;
  memories: Memory[];
  
  state: Record<string, any>;
  flags: string[];  // 改为数组
  
  // 可选特殊接口
  specialTraits?: Record<string, number>;
  specialState?: Record<string, any>;
  
  // 元数据
  createdAt: number;
  updatedAt: number;
  createdBy: string;
  version: number;
}

// ============= 派系类型定义 =============
export type FactionType = 
  | 'military'      // 军队派
  | 'pragmatists'   // 理性派
  | 'qingliu'       // 清流派
  | 'didang'        // 帝党派
  | 'eunuchs'       // 宦官派
  | 'daoist'        // 道教
  | 'imperial'      // 皇室
  | 'neutral';      // 中立

// ============= 派系相关接口 =============
export interface FactionMembership {
  faction: FactionType;
  rank: 'leader' | 'core' | 'member' | 'sympathizer';
  influence: number; // 0-100
  loyalty: number;   // 0-100
  joinedAt: number;
}

export interface FactionRelation {
  targetFaction: FactionType;
  relation: number; // -100 到 100
  lastChange: number;
  history:{
    turn: number;
    event: string;
    change: number;
  }>;
}

// ============= 完整NPC接口（扩展基础） =============
export interface NPC extends BaseNPC {
  faction: FactionType;  // 使用规范的派系类型
  
  // 派系相关
  factionMembership?: FactionMembership;
  factionRelations?: Record<string, FactionRelation>;
  
  // 角色特定状态
  specialState?: ZhangMengState | XieYuanState | LiJingZhaiState | GuoshiState | Record<string, any>;
}

// ============= 角色生成函数 =============
export function createBaseNPC(overrides: Partial<BaseNPC> = {}): BaseNPC {
  const now = Date.now();
  
  return {
    id: overrides.id || `npc_${now}_${Math.random().toString(36).substr(2, 9)}`,
    slug: overrides.slug || '',
    name: overrides.name || '未命名角色',
    role: overrides.role || '平民',
    faction: overrides.faction || 'neutral',
    status: overrides.status || 'active',
    
    traits: overrides.traits || {
      loyalty: 50,
      ambition: 50,
      greed: 50,
      courage: 50,
      rationality: 50,
      stability: 50,
      honor: 50,
      compassion: 50,
    },
    
    relationships: overrides.relationships || {},
    memories: overrides.memories || [],
    
    state: overrides.state || {},
    flags: overrides.flags || [],  // 改为数组
    
    createdAt: overrides.createdAt || now,
    updatedAt: overrides.updatedAt || now,
    createdBy: overrides.createdBy || 'system',
    version: overrides.version || 1,
  };
}

export function createNPC(overrides: Partial<NPC> = {}): NPC {
  const base = createBaseNPC(overrides);
  
  return {
    ...base,
    faction: (overrides.faction as FactionType) || 'neutral',
    factionMembership: overrides.factionMembership,
    factionRelations: overrides.factionRelations,
    specialState: overrides.specialState,
  };
}

// ============= 张猛角色生成 =============
export function createZhangMeng(): NPC {
  const npc = createNPC({
    id: 'zhangmeng',
    slug: 'zhangmeng',
    name: '张猛',
    role: '武将',
    faction: 'military',
    
    traits: {
      loyalty: 85,
      ambition: 40,
      greed: 30,
      courage: 95,
      rationality: 40,
      stability: 60,
      honor: 90,
      compassion: 50,
    },
    
    specialTraits: {
      impulsivity: 80,
      loyaltyVolatility: 70,
      honorSensitivity: 90,
      shameThreshold: 40,
    },
    
    specialState: {
      resentment: 20,
      grudgeCount: 0,
      lastHumiliationTurn: -1,
      betrayalTriggers: [],  // 改为数组
      redemptionAttempts: 0,
      externalContacts: []
    } as ZhangMengState,
    
    flags: ['loyal', 'impulsive', 'honorable'],  // 改为数组
    memories: [],
    recentActions: []
  });
  
    bias: {
      "冲动": npc.specialTraits?.impulsivity ?? 50,
      "忠诚波动": npc.specialTraits?.loyaltyVolatility ?? 50,
      "荣誉敏感": npc.specialTraits?.honorSensitivity ?? 50,
      "羞耻阈值": npc.specialTraits?.shameThreshold ?? 50,
    },
  return npc;
}

// ============= 谢渊角色生成 =============
export function createXieYuan(): NPC {
  const npc = createNPC({
    id: 'xieyuan',
    slug: 'xieyuan',
    name: '谢渊',
    role: '谋士',
    faction: 'pragmatists',
    
    traits: {
      loyalty: 60,
      ambition: 75,
      greed: 40,
      courage: 50,
      rationality: 90,
      stability: 85,
      honor: 40,
      compassion: 30,
    },
    
    specialTraits: {
      schemingAbility: 85,
      riskTolerance: 70,
      patience: 90,
      adaptability: 80,
    },
    
    specialState: {
      hiddenAgendas: [],
      contingencyPlans: [],
      leverageOverOthers: [],
      secretAllies: []
    } as XieYuanState,
    
    flags: ['rational', 'calculating', 'skeptical'],  // 改为数组
    memories: [],
  });
  
    bias: {
      "谋略": npc.specialTraits?.schemingAbility ?? 50,
      "风险承受": npc.specialTraits?.riskTolerance ?? 50,
      "耐心": npc.specialTraits?.patience ?? 50,
      "适应性": npc.specialTraits?.adaptability ?? 50,
    },
  return npc;
}

// ============= 李敬斋角色生成 =============
export function createLiJingZhai(): NPC {
  const npc = createNPC({
    id: 'lijingzhai',
    slug: 'lijingzhai',
    name: '李敬斋',
    role: '言官',
    faction: 'qingliu',
    
    traits: {
      loyalty: 70,
      ambition: 20,
      greed: 10,
      courage: 60,
      rationality: 50,
      stability: 40,
      honor: 95,
      compassion: 85,
    },
    
    specialTraits: {
      idealism: 90,
      moralConviction: 95,
      naivety: 60,
      resilience: 75,
    },
    
    specialState: {
      moralDilemmas: [],
      reformProposals: [],
      trustedConfidants: [],
      ethicalBoundaries: []
    } as LiJingZhaiState,
    
    flags: ['idealistic', 'compassionate', 'naive'],  // 改为数组
    memories: [],
  });
  
    bias: {
      "理想主义": npc.specialTraits?.idealism ?? 50,
      "道德信念": npc.specialTraits?.moralConviction ?? 50,
      "天真": npc.specialTraits?.naivety ?? 50,
      "韧性": npc.specialTraits?.resilience ?? 50,
    },
  return npc;
}

// ============= 国师角色生成 =============
export function createGuoshi(): NPC {
  const npc = createNPC({
    id: 'guoshi',
    slug: 'guoshi',
    name: '玄明',
    role: '国师',
    faction: 'imperial',
    
    traits: {
      loyalty: 60,
      ambition: 40,
      greed: 20,
      courage: 70,
      rationality: 65,
      stability: 75,
      honor: 50,
      compassion: 45,
    },
    
    specialTraits: {
      daoistMastery: 85,
      enlightenment: 80,
      detachment: 90,
      mysticalInsight: 75,
    },
    
    specialState: {
      daoistPractices: [],
      cosmicCalculations: [],
      visionRecords: [],
      internalAlchemy: []
    } as GuoshiState,
    
    flags: ['gender_disguise', 'new_guoshi', 'daoist_leader'],  // 改为数组
    
    memories: [],
  });
  
    bias: {
      "道法精通": npc.specialTraits?.daoistMastery ?? 50,
      "悟性": npc.specialTraits?.enlightenment ?? 50,
      "超脱": npc.specialTraits?.detachment ?? 50,
      "神秘洞察": npc.specialTraits?.mysticalInsight ?? 50,
    },
  return npc;
}

// ============= 游戏状态接口 =============
export interface GameState {
  npcs: Record<string, NPC>;
  factions: {
    military?: {
      leader?: string;
      members: string[];
      influence: number;
      goals: string[];
    };
    pragmatists?: {
      leader?: string;
      members: string[];
      influence: number;
      goals: string[];
    };
    qingliu?: {
      leader?: string;
      members: string[];
      influence: number;
      goals: string[];
    };
    didang?: {
      leader?: string;
      members: string[];
      influence: number;
      goals: string[];
    };
    eunuchs?: {
      leader?: string;
      members: string[];
      influence: number;
      goals: string[];
    };
    daoist?: {
      leader?: string;
      members: string[];
      influence: number;
      goals: string[];
    };
    imperial?: {
      leader?: string;
      members: string[];
      influence: number;
      goals: string[];
    };
  };
  resources: Record<string, number>;
  policies: {
    active: Array<{
      id: string;
      name: string;
      type: string;
      effects: Record<string, number>;
      enactedAt: number;
    }>;
    proposed: Array<{
      id: string;
      name: string;
      type: string;
      proposer: string;
      support: Record<string, number>;
    }>;
  };
  events: Array<{
    id: string;
    type: string;
    title: string;
    description: string;
    involved: string[];
    timestamp: number;
    resolved: boolean;
  }>;
  chronicle: Array<{
    id: string;
    turn: number;
    type: 'decision' | 'event' | 'milestone';
    title: string;
    summary: string;
    details: string;
    timestamp: number;
  }>;
  
  // 元数据
  gameId: string;
  currentTurn: number;
  startTime: number;
  lastSaved: number;
  version: string;
}

// ============= 游戏状态生成函数 =============
export function createInitialGameState(): GameState {
  const now = Date.now();
  
  // 创建核心NPC
  const zhangmeng = createZhangMeng();
  const xieyuan = createXieYuan();
  const lijingzhai = createLiJingZhai();
  const guoshi = createGuoshi();
  
  return {
    npcs: {
      [zhangmeng.id]: zhangmeng,
      [xieyuan.id]: xieyuan,
      [lijingzhai.id]: lijingzhai,
      [guoshi.id]: guoshi,
    },
    
    factions: {
      military: {
        leader: zhangmeng.id,
        members: [zhangmeng.id],
        influence: 65,
        goals: ['加强边防', '提高军费', '整顿军纪']
      },
      pragmatists: {
        leader: xieyuan.id,
        members: [xieyuan.id],
        influence: 55,
        goals: ['改革税制', '发展商业', '务实外交']
      },
      qingliu: {
        leader: lijingzhai.id,
        members: [lijingzhai.id],
        influence: 45,
        goals: ['肃清吏治', '提倡节俭', '反对宦官']
      },
      imperial: {
        leader: guoshi.id,
        members: [guoshi.id],
        influence: 75,
        goals: ['维护皇权', '平衡朝局', '延续国祚']
      }
    },
    
    resources: {
      morale: 70,
      fiscal: 500000,
      military: 80000,
      eunuch: 30,
      threat: 40,
      faction: 25,
      food: 1000000,
      population: 20000000,
      tax_rate: 15,
      commerce: 300000,
      land_fertility: 70,
      agri_pop: 15000000,
      military_cost: 200000
    },
    
    policies: {
      active: [],
      proposed: []
    },
    
    events: [],
    
    chronicle: [{
      id: `chronicle_${now}_start`,
      turn: 0,
      type: 'milestone',
      title: '新朝伊始',
      summary: '靖朝开国，百废待兴',
      details: '新帝登基，朝野观望，各方势力暗流涌动',
      timestamp: now
    }],
    
    // 元数据
    gameId: `game_${now}_${Math.random().toString(36).substr(2, 9)}`,
    currentTurn: 0,
    startTime: now,
    lastSaved: now,
    version: '1.0.0'
  };
}

// ============= 存档/读档工具函数 =============
export function serializeGameState(state: GameState): string {
  // 确保所有flags都是数组
  const serializedState = JSON.parse(JSON.stringify(state));
  
  // 遍历所有NPC，确保flags是数组
  if (serializedState.npcs) {
    for (const npcId in serializedState.npcs) {
      const npc = serializedState.npcs[npcId];
      if (npc && typeof npc === 'object') {
        // 确保flags是数组
        if (!Array.isArray(npc.flags)) {
          npc.flags = [];
        }
        
        // 确保specialState中的数组字段
        if (npc.specialState && typeof npc.specialState === 'object') {
          // 处理张猛的特殊状态
          if (npc.specialState.betrayalTriggers && !Array.isArray(npc.specialState.betrayalTriggers)) {
            npc.specialState.betrayalTriggers = [];
          }
          
          // 处理谢渊的特殊状态
          if (npc.specialState.hiddenAgendas && !Array.isArray(npc.specialState.hiddenAgendas)) {
            npc.specialState.hiddenAgendas = [];
          }
          if (npc.specialState.contingencyPlans && !Array.isArray(npc.specialState.contingencyPlans)) {
            npc.specialState.contingencyPlans = [];
          }
          if (npc.specialState.leverageOverOthers && !Array.isArray(npc.specialState.leverageOverOthers)) {
            npc.specialState.leverageOverOthers = [];
          }
          if (npc.specialState.secretAllies && !Array.isArray(npc.specialState.secretAllies)) {
            npc.specialState.secretAllies = [];
          }
          
          // 处理李敬斋的特殊状态
          if (npc.specialState.moralDilemmas && !Array.isArray(npc.specialState.moralDilemmas)) {
            npc.specialState.moralDilemmas = [];
          }
          if (npc.specialState.reformProposals && !Array.isArray(npc.specialState.reformProposals)) {
            npc.specialState.reformProposals = [];
          }
          if (npc.specialState.trustedConfidants && !Array.isArray(npc.specialState.trustedConfidants)) {
            npc.specialState.trustedConfidants = [];
          }
          if (npc.specialState.ethicalBoundaries && !Array.isArray(npc.specialState.ethicalBoundaries)) {
            npc.specialState.ethicalBoundaries = [];
          }
          
          // 处理国师的特殊状态
          if (npc.specialState.daoistPractices && !Array.isArray(npc.specialState.daoistPractices)) {
            npc.specialState.daoistPractices = [];
          }
          if (npc.specialState.cosmicCalculations && !Array.isArray(npc.specialState.cosmicCalculations)) {
            npc.specialState.cosmicCalculations = [];
          }
          if (npc.specialState.visionRecords && !Array.isArray(npc.specialState.visionRecords)) {
            npc.specialState.visionRecords = [];
          }
          if (npc.specialState.internalAlchemy && !Array.isArray(npc.specialState.internalAlchemy)) {
            npc.specialState.internalAlchemy = [];
          }
        }
      }
    }
  }
  
  return JSON.stringify(serializedState, null, 2);
}

export function deserializeGameState(jsonString: string): GameState {
  try {
    const parsed = JSON.parse(jsonString);
    
    // 确保factions包含military和pragmatists
    if (!parsed.factions) {
      parsed.factions = {};
    }
    
    if (!parsed.factions.military) {
      parsed.factions.military = {
        leader: undefined,
        members: [],
        influence: 0,
        goals: []
      };
    }
    
    if (!parsed.factions.pragmatists) {
      parsed.factions.pragmatists = {
        leader: undefined,
        members: [],
        influence: 0,
        goals: []
      };
    }
    
    // 确保所有flags都是数组
    if (parsed.npcs) {
      for (const npcId in parsed.npcs) {
        const npc = parsed.npcs[npcId];
        if (npc && typeof npc === 'object') {
          // 转换flags为数组（处理可能的Set序列化产物{}）
          if (npc.flags && typeof npc.flags === 'object' && !Array.isArray(npc.flags)) {
            // 如果是空对象{}（Set的序列化结果），转换为空数组
            if (Object.keys(npc.flags).length === 0) {
              npc.flags = [];
            } else {
              // 否则尝试提取值
              npc.flags = Object.values(npc.flags).filter(v => typeof v === 'string');
            }
          } else if (!Array.isArray(npc.flags)) {
            npc.flags = [];
          }
        }
      }
    }
    
    return parsed as GameState;
  } catch (error) {
    console.error('反序列化游戏状态失败:', error);
    return createInitialGameState();
  }
}

// ============= 派系工具函数 =============
export function getFactionForNPC(npcId: string, state: GameState): FactionType | null {
  const npc = state.npcs[npcId];
  if (!npc) return null;
  
  return npc.faction || 'neutral';
}

export function getNPCsByFaction(faction: FactionType, state: GameState): NPC[] {
  return Object.values(state.npcs).filter(npc => npc.faction === faction);
}

// ============= 导出所有类型和函数 =============
export type {
  ZhangMengSpecialTraits,
  ZhangMengState,
  XieYuanSpecialTraits,
  XieYuanState,
  LiJingZhaiSpecialTraits,
  LiJingZhaiState,
  GuoshiSpecialTraits,
  GuoshiState
};

export {
  createZhangMeng,
  createXieYuan,
  createLiJingZhai,
  createGuoshi,
  createInitialGameState,
  serializeGameState,
  deserializeGameState,
  getFactionForNPC,
  getNPCsByFaction
};export type {
  ZhangMengSpecialTraits,
  ZhangMengState,
  XieYuanSpecialTraits,
  XieYuanState,
  LiJingZhaiSpecialTraits,
  LiJingZhaiState,
  GuoshiSpecialTraits,
  GuoshiState
};

export {
  createZhangMeng,
  createXieYuan,
  createLiJingZhai,
  createGuoshi,
  createInitialGameState,
  serializeGameState,
  deserializeGameState,
  getFactionForNPC,
  getNPCsByFaction
};