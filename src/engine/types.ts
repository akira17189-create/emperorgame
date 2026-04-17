// 顶层
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
      real_time_played_ms: 0
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
      dynasty: '架空·某朝',
      era: '建兴',
      year: 1,
      tone: '猜忌',
      named_events: [],
      collective_memory: [],
      wills: [],
      weather_this_year: 0.5,
      conflict_ratio: 0.3
    },
    resources: {
      food: 1000,
      population: 10000,
      fiscal: 5000,
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