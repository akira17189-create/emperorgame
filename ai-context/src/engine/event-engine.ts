import { callLLMWithRetry } from './llm';
import type { GameState, PendingEvent } from './types';
import { NARRATIVE_STYLE_RULES_PROMPT } from '../data/lore-bridge';

// ---- 事件模板类型 ----
export interface EventTemplate {
  id: string;
  category: '自然灾害' | '仙道异变' | '工业事故' | '党争' | '边疆' | '民间';
  name: string;
  description: string;  // TODO: DeepSeek填充
  trigger_conditions: {
    min_year?: number;
    resource_threshold?: Partial<Record<string, { min?: number; max?: number }>>;
    probability: number; // 每年触发概率 0~1
    required_tags?: string[]; // 需要有此类政策才触发
  };
  severity: 1 | 2 | 3; // 1轻微 2中等 3严重
  choices: EventChoice[]; // 2-4个选项
}

export interface EventChoice {
  id: string;
  label: string;
  description: string;
  effects: Partial<Record<string, number>>;
  requires?: string; // 需要特定资源/知识才能解锁
}

export interface ActiveEvent {
  template: EventTemplate;
  triggered_year: number;
  narrative: string; // LLM生成的事件描述
}

// ---- 事件模板库（骨架，DeepSeek负责填充description和choices）----
export const EVENT_TEMPLATES: EventTemplate[] = [

  // === 自然灾害 ===
  {
    id: "drought", category: "自然灾害", name: "黄淮大旱", severity: 3,
    description: "TODO: DeepSeek填充（50-80字场景描述）",
    trigger_conditions: {
      probability: 0.08,
      resource_threshold: { land_fertility: { max: 0.4 } }
    },
    choices: [
      { id: "relief", label: "开仓赈灾", description: "动用储粮赈济灾民",
        effects: { food: -300, morale: +5, disaster_relief: -100 } },
      { id: "tax_exempt", label: "免除灾区赋税", description: "三年不征灾区税",
        effects: { fiscal: -200, morale: +3, faction: +5 } },
      { id: "ignore", label: "置之不理", description: "让地方自己处理",
        effects: { morale: -8, population: -500 } }
    ]
  },
  {
    id: "flood", category: "自然灾害", name: "江南水患", severity: 2,
    description: "TODO: DeepSeek填充",
    trigger_conditions: { probability: 0.06 },
    choices: [
      { id: "repair", label: "修缮堤坝", description: "调拨银两修堤",
        effects: { fiscal: -150, land_fertility: +0.05 } },
      { id: "ignore", label: "暂缓处理", description: "等明年预算",
        effects: { morale: -4, food: -150 } }
    ]
  },

  // === 仙道异变 ===
  {
    id: "omen_eclipse", category: "仙道异变", name: "日食天象", severity: 2,
    description: "TODO: DeepSeek填充",
    trigger_conditions: { probability: 0.04 },
    choices: [
      { id: "pray", label: "举行祭天大典", description: "耗时三日，费银五千两",
        effects: { fiscal: -80, morale: +4 } },
      { id: "science", label: "（穿越者）解释天文现象",
        description: "告知朝臣这是自然规律",
        requires: "modern_knowledge_science",
        effects: { morale: +2, faction: +8, eunuch: -3 } }
    ]
  },

  // === 党争 ===
  {
    id: "faction_conflict", category: "党争", name: "朝堂上书大战", severity: 2,
    description: "TODO: DeepSeek填充",
    trigger_conditions: { probability: 0.10, resource_threshold: { faction: { min: 60 } } },
    choices: [
      { id: "side_a", label: "支持清流派", description: "方直一党得势",
        effects: { faction: -15, eunuch: -5 } },
      { id: "side_b", label: "支持帝党", description: "钱谦一党得意",
        effects: { faction: -10, eunuch: +5 } },
      { id: "balance", label: "各打五十大板", description: "各罚一月俸禄",
        effects: { faction: -5, morale: -1 } }
    ]
  },

  // === 边疆 ===
  {
    id: "border_raid", category: "边疆", name: "北疆游牧扣边", severity: 2,
    description: "TODO: DeepSeek填充",
    trigger_conditions: { probability: 0.07, resource_threshold: { threat: { min: 40 } } },
    choices: [
      { id: "fight", label: "出兵征讨", description: "调边军迎击",
        effects: { military: -80, threat: -15, morale: +3, fiscal: -200 } },
      { id: "peace", label: "岁币议和", description: "每年输银万两换太平",
        effects: { threat: -20, fiscal: -100, morale: -3 } }
    ]
  },

  // === 民间 ===
  {
    id: "merchant_boom", category: "民间", name: "江南商贸繁荣", severity: 1,
    description: "TODO: DeepSeek填充（正面事件）",
    trigger_conditions: { probability: 0.05, resource_threshold: { commerce: { min: 400 } } },
    choices: [
      { id: "tax_more", label: "加征商税", description: "趁机多收一成",
        effects: { fiscal: +200, commerce: -30 } },
      { id: "encourage", label: "鼓励发展", description: "给予政策支持",
        effects: { commerce: +80, morale: +2 } }
    ]
  }

  // TODO: DeepSeek 继续添加至32个，覆盖6大类
];

// ---- 核心函数 ----

/**
 * 每tick检查是否触发事件
 * 在 tick.ts 的世界模拟阶段调用
 */
export function checkEventTriggers(state: GameState): EventTemplate[] {
  const triggered: EventTemplate[] = [];
  const r = state.resources;

  for (const template of EVENT_TEMPLATES) {
    const cond = template.trigger_conditions;

    // 年份检查
    if (cond.min_year && state.world.year < cond.min_year) continue;

    // 资源阈值检查
    let resourceOk = true;
    if (cond.resource_threshold) {
      for (const [key, range] of Object.entries(cond.resource_threshold)) {
        const val = (r as any)[key] ?? 0;
        if (range.min !== undefined && val < range.min) { resourceOk = false; break; }
        if (range.max !== undefined && val > range.max) { resourceOk = false; break; }
      }
    }
    if (!resourceOk) continue;

    // 政策标签检查
    if (cond.required_tags?.length) {
      const activeTags = state.policies.active.flatMap(p => p.tags);
      if (!cond.required_tags.every(t => activeTags.includes(t))) continue;
    }

    // 同一事件当年只触发一次
    const alreadyPending = state.events.pending.some(p => p.template_id === template.id);
    if (alreadyPending) continue;

    // 概率检查（严重事件+双倍概率）
    const effectiveProb = cond.probability * (template.severity === 3 ? 1.5 : 1);
    if (Math.random() < effectiveProb) { triggered.push(template); }
  }
}

/**
 * 生成事件叙事（调用LLM，可选）
 */
export async function narrateEvent(
  template: EventTemplate,
  state: GameState
): Promise<string> {
  try {
    const raw = await callLLMWithRetry({
      system: `你是靖朝皇帝游戏的事件叙述者。
${NARRATIVE_STYLE_RULES_PROMPT}
输出纯文本叙事，不超过150字，不要JSON。`,
      user: `事件：${template.name}
背景：${template.description}
当前：${state.world.dynasty}${state.world.era}${state.world.year}年，民心${state.resources.morale}，国库${state.resources.fiscal}
请用靖朝文风叙述这个事件的经过，结尾留悬念等待玩家决策。`,
      temperature: 0.8,
      tag: 'event_narration'
    });
    return raw.trim();
  } catch {
    return template.description || `${template.name}突然发生，需要陛下裁决。`;
  }
}

/**
 * 执行玩家的事件选择
 */
export function resolveEventChoice(
  state: GameState,
  templateId: string,
  choiceId: string
): { newState: GameState; narrative: string } {
  const template = EVENT_TEMPLATES.find(t => t.id === templateId);
  const choice   = template?.choices.find(c => c.id === choiceId);

  if (!template || !choice) {
    return { newState: state, narrative: '事件处理完毕。' };
  }

  // 应用资源变化
  const newState = { ...state, resources: { ...state.resources } };
  for (const [key, delta] of Object.entries(choice.effects)) {
    if (key in newState.resources) {
      (newState.resources as any)[key] = Math.max(0, ((newState.resources as any)[key] ?? 0) + delta);
    }
  }

  // 从pending移除
  newState.events = {
    ...state.events,
    pending: state.events.pending.filter(p => p.template_id !== templateId)
  };

  // 加入集体记忆
  const memory = `${state.world.year}年${template.name}（${choice.label}）`;
  newState.world = {
    ...state.world,
    collective_memory: [...state.world.collective_memory.slice(-19), memory]
  };

  return {
    newState,
    narrative: `陛下选择「${choice.label}」。${choice.description}。`
  };
}
