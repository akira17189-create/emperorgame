import type { GameState } from './types';

/**
 * 离线演算引擎
 * 处理游戏状态更新，包括资源变化、NPC行为、事件触发等
 */

export interface TickResult {
  success: boolean;
  newState: GameState;
  events: string[];
  warnings: string[];
}

export interface TickOptions {
  yearsToAdvance?: number;
  includeRandomEvents?: boolean;
  includeNPCActions?: boolean;
}

/**
 * 执行一个时间刻度的演算
 * @param state 当前游戏状态
 * @param options 演算选项
 * @returns 演算结果
 */
export function executeTick(state: GameState, options: TickOptions = {}): TickResult {
  // TODO: 实现离线演算逻辑
  // 1. 推进时间
  // 2. 更新资源
  // 3. 处理NPC行为
  // 4. 触发随机事件
  // 5. 更新世界状态
  
  const newState = JSON.parse(JSON.stringify(state)) as GameState;
  const events: string[] = [];
  const warnings: string[] = [];
  
  // 推进时间
  const yearsToAdvance = options.yearsToAdvance || 1;
  newState.world.year += yearsToAdvance;
  newState.meta.game_year += yearsToAdvance;
  
  // TODO: 实现具体演算逻辑
  // 示例：简单资源更新
  if (options.includeRandomEvents !== false) {
    // 随机事件占位
    const randomEvent = Math.random();
    if (randomEvent < 0.1) {
      events.push('发生自然灾害');
      newState.resources.food = Math.max(0, newState.resources.food - 100);
    }
  }
  
  // TODO: 实现NPC行为演算
  if (options.includeNPCActions !== false) {
    // NPC行为占位
    newState.npcs.forEach(npc => {
      npc.state.pressure = Math.min(100, npc.state.pressure + Math.random() * 10);
      npc.state.satisfaction = Math.max(0, npc.state.satisfaction - Math.random() * 5);
    });
  }
  
  return {
    success: true,
    newState,
    events,
    warnings
  };
}

/**
 * 批量演算多个时间刻度
 * @param state 初始游戏状态
 * @param ticks 刻度数量
 * @param options 演算选项
 * @returns 最终状态和所有事件
 */
export function executeMultipleTicks(
  state: GameState,
  ticks: number,
  options: TickOptions = {}
): { finalState: GameState; allEvents: string[] } {
  // TODO: 实现批量演算
  let currentState = state;
  const allEvents: string[] = [];
  
  for (let i = 0; i < ticks; i++) {
    const result = executeTick(currentState, options);
    currentState = result.newState;
    allEvents.push(...result.events);
  }
  
  return {
    finalState: currentState,
    allEvents
  };
}

/**
 * 计算资源变化趋势
 * @param state 游戏状态
 * @returns 资源变化预测
 */
export function calculateResourceTrends(state: GameState): Record<string, number> {
  // TODO: 实现资源趋势计算
  return {
    food: state.resources.food * 0.95,
    population: state.resources.population * 1.02,
    fiscal: state.resources.fiscal * 0.98,
    military: state.resources.military * 0.99,
    morale: state.resources.morale * 0.97
  };
}

/**
 * 检查游戏结束条件
 * @param state 游戏状态
 * @returns 游戏是否结束及原因
 */
export function checkGameEndConditions(state: GameState): { isEnded: boolean; reason?: string } {
  // TODO: 实现游戏结束条件检查
  if (state.resources.food <= 0) {
    return { isEnded: true, reason: '粮食耗尽，饥荒爆发' };
  }
  
  if (state.resources.morale <= 0) {
    return { isEnded: true, reason: '民心尽失，爆发起义' };
  }
  
  if (state.resources.military <= 0) {
    return { isEnded: true, reason: '兵力耗尽，外敌入侵' };
  }
  
  return { isEnded: false };
}