// 顶层
import { DYNASTY_CONFIG } from '../data/lore-bridge';
export interface GameState {
  meta: Meta;
  emperor: Emperor;
  world: World;
  resources: Resources;
  policies: Policies;
  npcs: NPC[];
  events: Events;
  chronicle: Chronicle;
  style_state: StyleState;
  // llm_config 不在此处，存 localStorage
  // ui_state 不存档
}

// meta
export interface Meta {
  version: string;          // "1.0.0"
  created_at: string;       // ISO8601
  last_saved_at: string;
  save_slot: string;
  game_year: number;        // 从开局起计的总年数
  real_time_played_ms: number;

  // 新增：开场阶段追踪
  prologue_phase: 'awakening' | 'guoshi_intro' | 'complete';
  prologue_complete: boolean;

  // 新增：放置系统时间戳
  last_idle_tick_at: string;   // ISO8601，上次放置积累的时间点
}

// emperor
export interface Emperor {
  id: string;
  name: string;
  age: number;
  generation: number;
  prestige: number;         // 0~100
  traits: TraitWeights;
  knowledge: string[];
  memory: { trauma: TraumaEntry[]; key_events: KeyEvent[] };
  wills_received: string[];
  visual: Visual;
}

export interface TraitWeights {
  loyalty: number;          // 0~100
  ambition: number;
  greed: number;
  courage: number;
  rationality: number;
  stability: number;
  honor?: number;        // 0~100，荣誉感（可选）
  compassion?: number;    // 0~100，同情心（可选）
}

// world
export type Tone = '匮乏' | '尚武' | '浮华' | '猜忌' | '绝望';

export interface World {
  dynasty: string;
  era: string;
  year: number;
  tone: Tone;
  named_events: NamedEvent[];        // 上限 8
  collective_memory: string[];       // 上限 20
  wills: ImperialWill[];
  weather_this_year: number;         // 0~1
  conflict_ratio: number;            // 0~1
  factions: {
    qingliu: number;    // 清流派势力 0~100
    didang: number;     // 帝党势力 0~100
    eunuch_faction: number;  // 宦官党势力 0~100（与 resources.eunuch 联动）
    military: number;      // 军队派势力 0~100
    pragmatists: number;   // 务实派势力 0~100
};
}

export interface NamedEvent {
  id: string;
  name: string;
  year: number;
  cause: string;
  summary: string;
  impact: Record<string, number>;
  image: string | null;
  image_prompt: string | null;
}

export interface ImperialWill {
  id: string;
  from_emperor_id: string;
  generation: number;
  parent_will_id: string | null;
  diff: string;
  inherited_at_year: number;
}

// resources
export interface Resources {
  food: number;
  population: number;
  fiscal: number;
  military: number;
  morale: number;
  eunuch: number;
  threat: number;
  faction: number;
  agri_pop: number;
  land_fertility: number;
  tax_rate: number;
  military_cost: number;
  disaster_relief: number;
  commerce: number;
}

// NPC
export interface NPC {
  id: string;
  slug: string;
  name: string;
  role: string;
  faction: string;
  status: 'active' | 'archived' | 'dead';
  archived_reason?: string;
  death_year?: number;
  traits: TraitWeights;
  state: NPCState;
  memory: NPCMemory;
  bias: Record<string, number>;
  relations: Record<string, Relation>;
  voice: VoiceProfile;
  visual: Visual;
  goals: NPCGoal[];
}

export interface NPCState {
  pressure: number;
  satisfaction: number;
  recent_events: string[];           // 上限 3
  behavior_modifier: string;
  loyalty_to_emperor: number;
}

export interface NPCMemory {
  trauma: TraumaEntry[];             // 上限 5
  key_events: KeyEvent[];            // 上限 10
  summary: string;
}

export interface TraumaEntry {
  event_id: string;
  event_name: string;
  year: number;
  type: string;
  intensity: number;
  impact: string;
  trigger_words: string[];
}

export type KeyEvent = TraumaEntry;

export interface Relation {
  kind: '同科' | '师生' | '仇敌' | '姻亲' | '上下级' | '盟友' | '其他';
  weight: number;                    // -1~1
  since_year: number;
  notes: string;
}

export interface VoiceProfile {
  features: string[];
  syntax_rules: string[];
  forbidden_phrases: string[];
  mode_voices?: Record<string, Pick<VoiceProfile, "features"|"syntax_rules"|"forbidden_phrases">>; // 用于玄明等多模式角色
}

export interface Visual {
  image: string | null;
  image_prompt: string | null;
}

// chronicle
export interface Chronicle {
  official: ChronicleEntry[];
  unofficial: ChronicleEntry[];
  pending_segments: string[];
}

export interface ChronicleEntry {
  id: string;
  kind: '本纪' | '列传' | '平准' | '野史';
  subject_id?: string;
  year_range: [number, number];
  text: string;
  style_tags: string[];
  source_logs: string[];
  image: string | null;
  image_prompt: string | null;
}

// 其余
export interface Policies {
  active: Policy[];
  history: PolicyLog[];
}

export interface Policy {
  id: string;
  tags: string[];
  enacted_year: number;
  enacted_by: string;
  description: string;
  visual: Visual;
  /** 每 tick 持续效果（资源 key → 变化量） */
  tick_change?: Partial<Record<string, number>>;
  /** 持续年数，-1 为永久 */
  duration_years?: number;
}

export interface PolicyLog {
  policy_id: string;
  action: 'enact' | 'repeal' | 'amend';
  year: number;
  reason: string;
}

export interface Events {
  pending: PendingEvent[];
  named: string[];
  raw_logs: RawLog[];
  rolling_summary: string;
}

export interface PendingEvent {
  id: string;
  triggered_year: number;
  template_id: string;
  severity: number;
  raw_payload: unknown;
  seal: 'normal' | 'urgent' | 'bloody';
  narrated: boolean;
  narration?: string;
}

export interface RawLog {
  year: number;
  kind: string;
  payload: unknown;
}

export interface StyleState {
  current_tags: string[];
  rules_version: string;
  last_changed_year: number;
}

// LLM 配置（不在 GameState 内，存 localStorage）
export interface LLMConfig {
  baseURL: string;
  apiKey: string;
  modelMain: string;
  modelCheap?: string;
  maxTokens: number;
  temperature: number;
  provider: 'openai' | 'anthropic' | 'custom';
}

// 工厂函数
export function createEmptyGameState(): GameState {
  const now = new Date().toISOString();
  return {
    meta: {
      version: '1.0.0',
      created_at: now,
      last_saved_at: now,
      save_slot: 'slot_1',
      game_year: 1,
      real_time_played_ms: 0,
      prologue_phase: 'awakening',
      prologue_complete: false,
      last_idle_tick_at: now
    },
    emperor: {
      id: 'emperor_1',
      name: '新帝',
      age: 18,
      generation: 1,
      prestige: 50,
      traits: {
        loyalty: 50,
        ambition: 50,
        greed: 50,
        courage: 50,
        rationality: 50,
        stability: 50
      },
      knowledge: [],
      memory: { trauma: [], key_events: [] },
      wills_received: [],
      visual: { image: null, image_prompt: null }
    },
    world: {
      dynasty: DYNASTY_CONFIG.name,      // "靖朝",
      era:     DYNASTY_CONFIG.era_name,  // 由DeepSeek确认后填入lore-bridge.ts,
      year: 1,
      tone: DYNASTY_CONFIG.current_tone as any,
      named_events: [],
      collective_memory: [DYNASTY_CONFIG.background_summary],
      wills: [],
      weather_this_year: 0.5,
      conflict_ratio: 0.3,
      factions: {
        qingliu: 60,    // 清流派势力
        didang: 50,     // 帝党势力
        eunuch_faction: 30,  // 宦官党势力
        military: 50,      // 军队派势力
        pragmatists: 40    // 务实派势力
      }
    },
    resources: {
      food: 1200,
      population: 12000,
      fiscal: 6000,
      military: 2000,
      morale: 70,
      eunuch: 30,
      threat: 20,
      faction: 40,
      agri_pop: 6000,
      land_fertility: 0.7,
      tax_rate: 0.15,
      military_cost: 200,
      disaster_relief: 100,
      commerce: 300
    },
    policies: { active: [], history: [] },
    npcs: [],
    events: { pending: [], named: [], raw_logs: [], rolling_summary: '' },
    chronicle: { official: [], unofficial: [], pending_segments: [] },
    style_state: { current_tags: [], rules_version: '1.0.0', last_changed_year: 0 }
  };
}

export function createEmptyNPC(id: string, name: string): NPC {
  return {
    id,
    slug: name.toLowerCase().replace(/\s+/g, '_'),
    name,
    role: '官员',
    faction: '中立',
    status: 'active',
    traits: {
      loyalty: 50,
      ambition: 50,
      greed: 50,
      courage: 50,
      rationality: 50,
      stability: 50
    },
    state: {
      pressure: 30,
      satisfaction: 60,
      recent_events: [],
      behavior_modifier: '正常',
      loyalty_to_emperor: 50
    },
    memory: { trauma: [], key_events: [], summary: '' },
    bias: {},
    relations: {},
    voice: { features: [], syntax_rules: [], forbidden_phrases: [] },
    visual: { image: null, image_prompt: null }
  };
}
// DecisionTrace（叙事引擎的决策追踪结构）
export interface DecisionTrace {
  npc_id: string;
  interpretation: string;
  decision_path: string[];
  motivation: string;
  attitude: string;
  final_action: string;
  hidden_action: string | null;
}


export interface NPCGoal {
  id: string;
  description: string;
  priority: number; // 0~1，1为最高优先级
  created_year: number;
  last_updated_year: number;
  status: 'active' | 'completed' | 'abandoned';
  progress?: number; // 0~1，表示目标完成进度
  sub_goals?: string[]; // 子目标描述
}
