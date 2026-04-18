import type { GameState } from './types';
import { handlePlayerInput } from './phases/input';
import { simulateWorld } from './phases/simulation';

import { arbitrateEvents } from './phases/arbitration';
import { generateNarration, checkGameEndConditions } from './phases/narration';
import { processCommand } from './narrator';
// import { updateState, applyEffects, createEffect } from './state-updater'; // 已不再使用

export interface TickResult {
  success: boolean;
  newState: GameState;
  events: string[];
  warnings: string[];
  narration?: string;
  chronicle_entry?: any;
  decision?: any;
  arbitration?: {
    narrative?: string;
    game_state_updates?: {
      resource_change?: Record<string, number>;
      collective_memory_added?: string[];
    };
  };
  error?: string;
}

export interface TickOptions {
  yearsToAdvance?: number;
  includeRandomEvents?: boolean;
  includeNPCActions?: boolean;
  targetNpcId?: string;
}

/**
 * 执行一个时间刻度的演算（统一入口版本）
 * 这是游戏的唯一真入口，所有状态修改都在此函数内完成
 */
export async function gameTick(
  state: GameState, 
  command?: string, 
  targetNpcId?: string
): Promise<TickResult> {
  try {
    console.log('[TICK] gameTick 开始执行', { command, targetNpcId });
    let currentState = { ...state };
    let processedCommand = command;
    let npcDecision = null;
    let npcNarration = null;
    let npcChronicleEntry = null;
    
    // 1. 处理玩家指令和NPC交互（如果有）
    if (targetNpcId) {
      try {
        // 调用processCommand获取NPC决策和叙事
      // 确保NPC有goals字段
      const targetNpc = currentState.npcs.find(n => n.id === targetNpcId);
      if (targetNpc && (!targetNpc.goals || targetNpc.goals.length === 0)) {
        // 为NPC初始化默认目标
        targetNpc.goals = [{
          id: `goal_${Date.now()}_default`,
          description: '执行职责范围内事务',
          priority: 0.5,
          created_year: currentState.world.year,
          last_updated_year: currentState.world.year,
          status: 'active'
        }];
      }
        console.log('[TICK] 准备调用 processCommand', { command, targetNpcId, npc: targetNpc?.name });
        const npcResult = await processCommand(command, currentState, targetNpcId);
        console.log('[TICK] processCommand 调用成功', { narration: npcResult.narration?.substring(0, 100) });
        npcDecision = npcResult.decision;
        npcNarration = npcResult.narration;
        npcChronicleEntry = npcResult.chronicle_entry;
        
        // 如果有仲裁结果，应用它
        if (npcResult.arbitration) {
          const arbitrationUpdates = npcResult.arbitration.game_state_updates;
          
          if (arbitrationUpdates) {
            // 应用资源变化（与后面事件仲裁保持完全一致的逻辑）
            if (arbitrationUpdates.resource_change) {
              for (const [key, delta] of Object.entries(arbitrationUpdates.resource_change)) {
                if (key in currentState.resources) {
                  (currentState.resources as Record<string, number>)[key] =
                    Math.max(0, ((currentState.resources as Record<string, number>)[key] ?? 0) + delta);
                }
              }
            }
            
            // 添加集体记忆
            if (arbitrationUpdates.collective_memory_added && arbitrationUpdates.collective_memory_added.length > 0) {
              currentState.world.collective_memory.push(...arbitrationUpdates.collective_memory_added);
              if (currentState.world.collective_memory.length > 20) {
                currentState.world.collective_memory = currentState.world.collective_memory.slice(-20);
              }
            }
          }
        }
        
        // 更新NPC状态
        const npc = currentState.npcs.find(n => n.id === targetNpcId);
        if (npc) {
          // 添加近期事件
          npc.state.recent_events.unshift(`${currentState.world.year}年：${npcDecision.final_action}`);
          if (npc.state.recent_events.length > 3) {
            npc.state.recent_events.pop();
          }
        }
        console.log('[TICK] NPC交互处理完成，继续执行世界模拟');
      } catch (error) {
        console.error('[TICK] NPC交互处理失败:', error);
        console.error('[TICK] 错误详情:', error.message, error.stack);
        // 继续执行，不中断整个流程
      }
    } else if (command) {
      // 如果有指令但没有目标NPC，只处理输入
      const inputResult = handlePlayerInput(currentState, command);
      if (!inputResult.success) {
        return {
          success: false,
          newState: currentState,
          events: [],
          warnings: [],
          error: inputResult.error
        };
      }
      processedCommand = inputResult.processedCommand;
    }

    // 2. 模拟世界状态变化
    console.log('[TICK] 开始世界模拟');
    let simulationResult;
    try {
      simulationResult = simulateWorld(currentState);
      console.log('[TICK] 世界模拟完成', { success: simulationResult.success, eventsCount: simulationResult.events?.length });
    } catch (simulationError) {
      console.error('[TICK] 世界模拟异常:', simulationError);
      simulationResult = {
        success: true,
        newState: currentState,
        events: ['世界模拟异常，使用当前状态'],
        warnings: ['世界模拟异常']
      };
    }
    if (!simulationResult.success) {
      return {
        success: false,
        newState: currentState,
        events: [],
        warnings: [],
        error: '世界模拟失败'
      };
    }



    // 3. 仲裁事件（如果有）
    let arbitrationResult = null;
    if (simulationResult.events.length > 0) {
      arbitrationResult = await arbitrateEvents(simulationResult.newState, simulationResult.events);
      
      // 如果仲裁成功，更新游戏状态
      if (arbitrationResult.success && arbitrationResult.needsArbitration && arbitrationResult.game_state_updates) {
        const updates = arbitrationResult.game_state_updates;
        
        // 应用资源变化
        if (updates.resource_change) {
          for (const [key, delta] of Object.entries(updates.resource_change)) {
            if (key in simulationResult.newState.resources) {
              (simulationResult.newState.resources as Record<string, number>)[key] =
                Math.max(0, ((simulationResult.newState.resources as Record<string, number>)[key] ?? 0) + delta);
            }
          }
        }
        
        // 添加集体记忆
        if (updates.collective_memory_added && updates.collective_memory_added.length > 0) {
          simulationResult.newState.world.collective_memory.push(...updates.collective_memory_added);
          if (simulationResult.newState.world.collective_memory.length > 20) {
            simulationResult.newState.world.collective_memory = simulationResult.newState.world.collective_memory.slice(-20);
          }
        }
      }
    }

    // 4. 生成世界叙事
    console.log('[TICK] 准备调用 generateNarration', { targetNpcId, eventsCount: simulationResult.events.length });
    const narrationResult = await generateNarration(
      simulationResult.newState,
      simulationResult.events,
      arbitrationResult,
      targetNpcId
    );

    // 5. 检查游戏结束条件
    const endCheck = checkGameEndConditions(simulationResult.newState);
    if (endCheck.isEnded) {
      simulationResult.events.push(`游戏结束：${endCheck.reason}`);
    }

    // 6. 组装最终结果
    const finalNarration = npcNarration || narrationResult.narration;
    console.log('[TICK] 组装最终结果', { 
      npcNarration: npcNarration?.substring(0, 50), 
      narrationResultNarration: narrationResult.narration?.substring(0, 50),
      finalNarration: finalNarration?.substring(0, 50),
      npcNarrationType: typeof npcNarration,
      narrationResultNarrationType: typeof narrationResult.narration
    });
    const result: TickResult = {
      success: true,
      newState: simulationResult.newState,
      events: simulationResult.events,
      warnings: simulationResult.warnings,
      narration: finalNarration,
      chronicle_entry: npcChronicleEntry || narrationResult.chronicle_entry,
      decision: npcDecision,
      arbitration: arbitrationResult ? {
        narrative: arbitrationResult.narrative,
        game_state_updates: arbitrationResult.game_state_updates
      } : undefined
    };

    return result;
  } catch (error) {
    return {
      success: false,
      newState: state,
      events: [],
      warnings: [],
      error: `游戏演算失败: ${error instanceof Error ? error.message : '未知错误'}`
    };
  }
}

/**
 * 执行一个时间刻度的演算（异步版本，保持向后兼容）
 */
export async function executeTick(state: GameState, command?: string, options: TickOptions = {}): Promise<TickResult> {
  return await gameTick(state, command, options.targetNpcId);
}

/**
 * 批量演算多个时间刻度（保持向后兼容）
 */
export function executeMultipleTicks(
  state: GameState,
  ticks: number,
  options: TickOptions = {}
): { finalState: GameState; allEvents: string[] } {
  let currentState = state;
  const allEvents: string[] = [];

  for (let i = 0; i < ticks; i++) {
    // 同步版本，只做基本模拟
    const result = simulateWorld(currentState);
    currentState = result.newState;
    allEvents.push(...result.events);
  }

  return { finalState: currentState, allEvents };
}

/**
 * 计算资源变化趋势（当前年的预期增减量，用于 UI 提示）
 */
export function calculateResourceTrends(state: GameState): Record<string, number> {
  const r = state.resources;
  const weather = state.world.weather_this_year;
  const agriYield = Math.round(r.agri_pop * r.land_fertility * (0.6 + weather * 0.8));
  const foodConsumed = Math.round(r.population * 0.12);
  const taxIncome = Math.round(r.population * r.tax_rate * (r.commerce / 300));

  return {
    food: agriYield - foodConsumed,
    population: Math.round(r.population * (r.food > foodConsumed * 2 ? 0.015 : 0.005)),
    fiscal: taxIncome - r.military_cost - r.disaster_relief,
    military: 0,
    morale: r.food <= 0 ? -15 : (r.morale < 30 ? -3 : 1),
  };
}

/**
 * 检查游戏结束条件（保持向后兼容）
 */
export function checkGameEnd(state: GameState): { isEnded: boolean; reason?: string } {
  return checkGameEndConditions(state);
}