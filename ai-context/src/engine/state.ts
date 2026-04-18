import type { GameState } from './types';

type Listener = (state: GameState) => void;

let currentState: GameState | null = null;
const listeners: Set<Listener> = new Set();

export function getState(): GameState {
  if (!currentState) {
    throw new Error('Game state not initialized. Call initState() first.');
  }
  return currentState;
}

export function setState(updater: (draft: GameState) => void): void {
  if (!currentState) {
    throw new Error('Game state not initialized. Call initState() first.');
  }
  
  // 深拷贝当前状态
  const draft = JSON.parse(JSON.stringify(currentState)) as GameState;
  
  // 应用更新
  updater(draft);
  
  // 更新状态
  currentState = draft;
  
  // 通知所有监听器
  listeners.forEach(listener => {
    try {
      listener(currentState!);
    } catch (error) {
      console.error('Error in state listener:', error);
    }
  });
}

export function subscribe(fn: Listener): () => void {
  listeners.add(fn);
  
  // 返回取消订阅函数
  return () => {
    listeners.delete(fn);
  };
}

export function initState(initial: GameState): void {
  currentState = initial;
  
  // 通知所有监听器
  listeners.forEach(listener => {
    try {
      listener(currentState!);
    } catch (error) {
      console.error('Error in state listener:', error);
    }
  });
}

// 快照（用于 Prompt 上下文，≤500 token）
export function getSnapshot(state: GameState): string {
  const snapshot = {
    year: state.world.year,
    tone: state.world.tone,
    resources: {
      food: state.resources.food,
      population: state.resources.population,
      fiscal: state.resources.fiscal,
      military: state.resources.military,
      morale: state.resources.morale,
      threat: state.resources.threat
    },
    active_policies: state.policies.active.map(p => p.tags.join(',')),
    npc_summary: state.npcs.map(npc => ({
      name: npc.name,
      role: npc.role,
      pressure: npc.state.pressure,
      satisfaction: npc.state.satisfaction,
      loyalty: npc.state.loyalty_to_emperor
    }))
  };
  
  return JSON.stringify(snapshot);
}/**
 * 游戏状态Schema定义
 */
export interface GameStateSchema {
  version: string;
  requiredFields: string[];
  fieldTypes: Record<string, string>;
  constraints: Record<string, any>;
}

/**
 * 默认Schema
 */
export const DEFAULT_STATE_SCHEMA: GameStateSchema = {
  version: '1.0.0',
  requiredFields: [
    'meta',
    'emperor',
    'world',
    'resources',
    'policies',
    'npcs',
    'events',
    'chronicle',
    'style_state'
  ],
  fieldTypes: {
    'meta': 'object',
    'emperor': 'object',
    'world': 'object',
    'resources': 'object',
    'policies': 'object',
    'npcs': 'array',
    'events': 'object',
    'chronicle': 'object',
    'style_state': 'object'
  },
  constraints: {
    'meta.version': 'string',
    'meta.created_at': 'string',
    'meta.last_saved_at': 'string',
    'meta.save_slot': 'string',
    'meta.game_year': 'number',
    'meta.real_time_played_ms': 'number',
    
    'emperor.id': 'string',
    'emperor.name': 'string',
    'emperor.age': 'number',
    'emperor.generation': 'number',
    'emperor.prestige': 'number',
    
    'world.dynasty': 'string',
    'world.era': 'string',
    'world.year': 'number',
    'world.tone': 'string',
    
    'resources.food': 'number',
    'resources.population': 'number',
    'resources.fiscal': 'number',
    'resources.military': 'number',
    'resources.morale': 'number',
    'resources.eunuch': 'number',
    'resources.threat': 'number',
    'resources.faction': 'number',
    'resources.agri_pop': 'number',
    'resources.land_fertility': 'number',
    'resources.tax_rate': 'number',
    'resources.military_cost': 'number',
    'resources.disaster_relief': 'number',
    'resources.commerce': 'number'
  }
};

/**
 * 校验游戏状态
 * @param state 游戏状态
 * @param schema 可选的schema，默认使用DEFAULT_STATE_SCHEMA
 * @returns 校验结果
 */
export function validateState(
  state: GameState,
  schema: GameStateSchema = DEFAULT_STATE_SCHEMA
): { isValid: boolean; errors: string[]; warnings: string[] } {
  const errors: string[] = [];
  const warnings: string[] = [];

  // 1. 检查必需字段
  for (const field of schema.requiredFields) {
    if (!(field in state)) {
      errors.push(`缺少必需字段: ${field}`);
    }
  }

  // 2. 检查字段类型
  for (const [fieldPath, expectedType] of Object.entries(schema.constraints)) {
    const value = getNestedValue(state, fieldPath);
    
    if (value === undefined) {
      warnings.push(`字段不存在: ${fieldPath}`);
      continue;
    }

    const actualType = typeof value;
    if (actualType !== expectedType) {
      errors.push(`字段类型错误: ${fieldPath} 期望 ${expectedType}，实际 ${actualType}`);
    }
  }

  // 3. 业务规则校验
  const businessValidation = validateBusinessRules(state);
  errors.push(...businessValidation.errors);
  warnings.push(...businessValidation.warnings);

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * 获取嵌套对象的值
 */
function getNestedValue(obj: any, path: string): any {
  const keys = path.split('.');
  let current = obj;
  
  for (const key of keys) {
    if (current === null || current === undefined) {
      return undefined;
    }
    current = current[key];
  }
  
  return current;
}

/**
 * 业务规则校验
 */
function validateBusinessRules(state: GameState): { errors: string[]; warnings: string[] } {
  const errors: string[] = [];
  const warnings: string[] = [];

  // 检查资源范围
  const resources = state.resources;
  
  if (resources.food < 0) {
    errors.push('粮食不能为负数');
  }
  if (resources.population < 0) {
    errors.push('人口不能为负数');
  }
  if (resources.fiscal < 0) {
    errors.push('财政不能为负数');
  }
  if (resources.military < 0) {
    errors.push('军事不能为负数');
  }
  
  // 检查百分比字段
  if (resources.morale < 0 || resources.morale > 100) {
    warnings.push('民心值超出正常范围(0-100)');
  }
  if (resources.eunuch < 0 || resources.eunuch > 100) {
    warnings.push('宦官势力值超出正常范围(0-100)');
  }
  if (resources.threat < 0 || resources.threat > 100) {
    warnings.push('威胁值超出正常范围(0-100)');
  }
  if (resources.faction < 0 || resources.faction > 100) {
    warnings.push('派系张力值超出正常范围(0-100)');
  }
  
  // 检查税率
  if (resources.tax_rate < 0 || resources.tax_rate > 1) {
    warnings.push('税率超出正常范围(0-1)');
  }
  
  // 检查土地肥力
  if (resources.land_fertility < 0 || resources.land_fertility > 1) {
    warnings.push('土地肥力超出正常范围(0-1)');
  }
  
  // 检查世界状态
  const world = state.world;
  if (world.year < 1) {
    errors.push('年份不能小于1');
  }
  
  // 检查皇帝状态
  const emperor = state.emperor;
  if (emperor.prestige < 0 || emperor.prestige > 100) {
    warnings.push('皇帝声望值超出正常范围(0-100)');
  }
  
  // 检查NPC状态
  for (const npc of state.npcs) {
    if (npc.state.pressure < 0 || npc.state.pressure > 100) {
      warnings.push(`NPC ${npc.name} 的压力值超出正常范围(0-100)`);
    }
    if (npc.state.satisfaction < 0 || npc.state.satisfaction > 100) {
      warnings.push(`NPC ${npc.name} 的满意度超出正常范围(0-100)`);
    }
    if (npc.state.loyalty_to_emperor < 0 || npc.state.loyalty_to_emperor > 100) {
      warnings.push(`NPC ${npc.name} 的忠诚度超出正常范围(0-100)`);
    }
  }

  return { errors, warnings };
}

/**
 * 修复游戏状态（自动修复一些常见问题）
 */
export function repairState(state: GameState): GameState {
  const repaired = JSON.parse(JSON.stringify(state)) as GameState;
  
  // 修复资源负数
  if (repaired.resources.food < 0) repaired.resources.food = 0;
  if (repaired.resources.population < 0) repaired.resources.population = 0;
  if (repaired.resources.fiscal < 0) repaired.resources.fiscal = 0;
  if (repaired.resources.military < 0) repaired.resources.military = 0;
  
  // 修复百分比字段
  if (repaired.resources.morale < 0) repaired.resources.morale = 0;
  if (repaired.resources.morale > 100) repaired.resources.morale = 100;
  
  if (repaired.resources.eunuch < 0) repaired.resources.eunuch = 0;
  if (repaired.resources.eunuch > 100) repaired.resources.eunuch = 100;
  
  if (repaired.resources.threat < 0) repaired.resources.threat = 0;
  if (repaired.resources.threat > 100) repaired.resources.threat = 100;
  
  if (repaired.resources.faction < 0) repaired.resources.faction = 0;
  if (repaired.resources.faction > 100) repaired.resources.faction = 100;
  
  // 修复税率
  if (repaired.resources.tax_rate < 0) repaired.resources.tax_rate = 0;
  if (repaired.resources.tax_rate > 1) repaired.resources.tax_rate = 1;
  
  // 修复土地肥力
  if (repaired.resources.land_fertility < 0) repaired.resources.land_fertility = 0;
  if (repaired.resources.land_fertility > 1) repaired.resources.land_fertility = 1;
  
  // 修复年份
  if (repaired.world.year < 1) repaired.world.year = 1;
  
  // 修复皇帝声望
  if (repaired.emperor.prestige < 0) repaired.emperor.prestige = 0;
  if (repaired.emperor.prestige > 100) repaired.emperor.prestige = 100;
  
  // 修复NPC状态
  for (const npc of repaired.npcs) {
    if (npc.state.pressure < 0) npc.state.pressure = 0;
    if (npc.state.pressure > 100) npc.state.pressure = 100;
    
    if (npc.state.satisfaction < 0) npc.state.satisfaction = 0;
    if (npc.state.satisfaction > 100) npc.state.satisfaction = 100;
    
    if (npc.state.loyalty_to_emperor < 0) npc.state.loyalty_to_emperor = 0;
    if (npc.state.loyalty_to_emperor > 100) npc.state.loyalty_to_emperor = 100;
  }
  
  return repaired;
}

/**
 * 获取状态版本
 */
export function getStateVersion(state: GameState): string {
  return state.meta?.version || '1.0.0';
}

/**
 * 迁移状态到新版本
 */
export function migrateState(state: GameState, targetVersion: string): GameState {
  const currentVersion = getStateVersion(state);
  
  if (currentVersion === targetVersion) {
    return state;
  }
  
  // 这里可以添加版本迁移逻辑
  // 目前只是简单更新版本号
  const migrated = JSON.parse(JSON.stringify(state)) as GameState;
  if (migrated.meta) {
    migrated.meta.version = targetVersion;
  }
  
  return migrated;
}