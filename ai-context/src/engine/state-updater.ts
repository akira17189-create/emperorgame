import type { GameState } from './types';

export interface StateUpdate {
  resources?: Record<string, number>;
  world?: Partial<GameState['world']>;
  npcs?: Array<{
    id: string;
    updates: Partial<GameState['npcs'][0]>;
  }>;
  events?: string[];
  collective_memory?: string[];
}

export interface Effect {
  type: string;
  priority: number;
  value: any;
  source: string;
}

export function updateState(currentState: GameState, updates: StateUpdate): GameState {
  const newState = JSON.parse(JSON.stringify(currentState)) as GameState;

  // 应用资源更新
  if (updates.resources) {
    for (const [key, delta] of Object.entries(updates.resources)) {
      if (key in newState.resources) {
        const currentValue = (newState.resources as Record<string, number>)[key] ?? 0;
        (newState.resources as Record<string, number>)[key] = Math.max(0, currentValue + delta);
      }
    }
  }

  // 派系数值联动逻辑
  // 1. 宦官势力联动：resources.eunuch 变化时，同步更新 world.factions.eunuch_faction
  if (updates.resources && 'eunuch' in updates.resources) {
    const newEunuch = newState.resources.eunuch;
    newState.world.factions.eunuch_faction = Math.round(newEunuch * 0.8);
  }

  // 2. 党争强度联动：resources.faction 变化时，等量分配给 qingliu 和 didang
  // 反向关联：faction 高 → 双方势力均高，代表党争激烈
  if (updates.resources && 'faction' in updates.resources) {
    const factionChange = updates.resources.faction;
    // 等量分配给双方，但保持势力值在 0-100 范围内
    newState.world.factions.qingliu = Math.max(0, Math.min(100, newState.world.factions.qingliu + factionChange));
    newState.world.factions.didang = Math.max(0, Math.min(100, newState.world.factions.didang + factionChange));
  }

  // 应用世界更新
  if (updates.world) {
    Object.assign(newState.world, updates.world);
  }

  // 应用NPC更新
  if (updates.npcs) {
    for (const npcUpdate of updates.npcs) {
      const npc = newState.npcs.find(n => n.id === npcUpdate.id);
      if (npc) {
        Object.assign(npc, npcUpdate.updates);
      }
    }
  }

  // 添加事件
  if (updates.events && updates.events.length > 0) {
    newState.events.pending.push(...updates.events.map((e, i) => ({
      id: `update-${Date.now()}-${i}`,
      triggered_year: newState.world.year,
      template_id: 'state_update',
      severity: 1,
      raw_payload: { text: e },
      seal: 'normal' as const,
      narrated: false,
    })));
  }

  // 添加集体记忆
  if (updates.collective_memory && updates.collective_memory.length > 0) {
    newState.world.collective_memory.push(...updates.collective_memory);
    // 限制记忆长度
    if (newState.world.collective_memory.length > 20) {
      newState.world.collective_memory = newState.world.collective_memory.slice(-20);
    }
  }

  return newState;
}

export function applyEffects(state: GameState, effects: Effect[]): GameState {
  // 按优先级排序效果
  const sortedEffects = [...effects].sort((a, b) => b.priority - a.priority);
  
  let currentState = state;
  const appliedEffects: Effect[] = [];
  
  for (const effect of sortedEffects) {
    // 检查是否有冲突
    const hasConflict = appliedEffects.some(applied => 
      applied.type === effect.type && 
      applied.source !== effect.source &&
      Math.abs(applied.priority - effect.priority) < 10
    );
    
    if (hasConflict) {
      console.warn(`效果冲突: ${effect.type} from ${effect.source}`);
      continue;
    }
    
    // 应用效果
    switch (effect.type) {
      case 'resource_change':
        currentState = updateState(currentState, {
          resources: effect.value
        });
        break;
        
      case 'world_update':
        currentState = updateState(currentState, {
          world: effect.value
        });
        break;
        
      case 'npc_update':
        currentState = updateState(currentState, {
          npcs: effect.value
        });
        break;
        
      case 'collective_memory':
        currentState = updateState(currentState, {
          collective_memory: effect.value
        });
        break;
        
      default:
        console.warn(`未知效果类型: ${effect.type}`);
    }
    
    appliedEffects.push(effect);
  }
  
  return currentState;
}

export function validateStateUpdate(currentState: GameState, updates: StateUpdate): boolean {
  // 验证资源更新
  if (updates.resources) {
    for (const [key, delta] of Object.entries(updates.resources)) {
      if (typeof delta !== 'number' || isNaN(delta)) {
        console.error(`无效的资源更新: ${key} = ${delta}`);
        return false;
      }
      
      // 检查是否会导致负值
      if (key in currentState.resources) {
        const currentValue = (currentState.resources as Record<string, number>)[key] ?? 0;
        if (currentValue + delta < 0) {
          console.warn(`资源更新可能导致负值: ${key} (${currentValue} + ${delta})`);
        }
      }
    }
  }
  
  // 验证NPC更新
  if (updates.npcs) {
    for (const npcUpdate of updates.npcs) {
      const npc = currentState.npcs.find(n => n.id === npcUpdate.id);
      if (!npc) {
        console.error(`NPC不存在: ${npcUpdate.id}`);
        return false;
      }
    }
  }
  
  return true;
}

export function createEffect(
  type: string,
  value: any,
  source: string,
  priority: number = 50
): Effect {
  return {
    type,
    priority,
    value,
    source
  };
}

export function mergeEffects(effects: Effect[]): Effect[] {
  // 合并相同类型和来源的效果
  const merged: Record<string, Effect> = {};
  
  for (const effect of effects) {
    const key = `${effect.type}-${effect.source}`;
    
    if (merged[key]) {
      // 合并值
      if (typeof effect.value === 'number' && typeof merged[key].value === 'number') {
        merged[key].value += effect.value;
      } else if (Array.isArray(effect.value) && Array.isArray(merged[key].value)) {
        merged[key].value = [...merged[key].value, ...effect.value];
      }
      
      // 取最高优先级
      merged[key].priority = Math.max(merged[key].priority, effect.priority);
    } else {
      merged[key] = { ...effect };
    }
  }
  
  return Object.values(merged);
}