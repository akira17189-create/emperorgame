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
}