import type { GameState } from './types';
import { handlePlayerInput } from './phases/input';
import { simulateWorld } from './phases/simulation';

import { arbitrateEvents } from './phases/arbitration';
import { generateNarration, checkGameEndConditions } from './phases/narration';
import { processCommand } from './narrator';
import { checkEventTriggers, narrateEvent } from './event-engine';
import { applyPolicyTickEffects } from './policy-engine';
import { checkEndings } from './ending-engine';

// 每 TICKS_PER_YEAR 次玩家操作推进一年（防止年份推进过快）
const TICKS_PER_YEAR = 4;

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
  ending?: {
    id: string;
    title: string;
  };
}

export interface TickOptions {
  yearsToAdvance?: number;
  includeRandomEvents?: boolean;
  includeNPCActions?: boolean;
  targetNpcId?: string;
}

/**
 * 执行一个时间刻度的演算（统一入口版本）
 *
 * 关键修复：
 * 1. 每 TICKS_PER_YEAR 次操作才真正推进一年（防止两次点击就过两年）
 * 2. 先做世界模拟，再调 processCommand——确保 NPC 叙事里的年份与 UI 显示一致
 */
export async function gameTick(
  state: GameState,
  command?: string,
  targetNpcId?: string
): Promise<TickResult> {
  try {
    console.log('[TICK] gameTick 开始执行', { command, targetNpcId });

    // ── 0. 操作计数器：每 TICKS_PER_YEAR 次才推进一年 ──────────────────────
    const actionCount = (state.meta.action_count ?? 0) + 1;
    const shouldAdvanceYear = actionCount % TICKS_PER_YEAR === 0;
    let currentState: GameState = {
      ...state,
      meta: { ...state.meta, action_count: actionCount }
    };
    console.log('[TICK] 操作计数', {
      actionCount,
      shouldAdvanceYear,
      currentYear: currentState.world.year
    });

    // ── 1. 世界模拟（先于 NPC 交互，确保年份一致）──────────────────────────
    console.log('[TICK] 开始世界模拟');
    let simulationResult;
    try {
      simulationResult = simulateWorld(currentState, { advanceYear: shouldAdvanceYear });

      // 1.5 应用政策持续效果
      simulationResult.newState = applyPolicyTickEffects(simulationResult.newState);

      // 1.6 检查世界事件触发
      const triggeredTemplates = checkEventTriggers(simulationResult.newState);
      if (triggeredTemplates.length > 0) {
        for (const template of triggeredTemplates.slice(0, 1)) {
          const eventNarrative = await narrateEvent(template, simulationResult.newState).catch(() => template.name);
          const pending = {
            id: `event_${template.id}_${Date.now()}`,
            triggered_year: simulationResult.newState.world.year,
            template_id: template.id,
            severity: template.severity,
            raw_payload: template,
            seal: template.severity === 3 ? 'bloody' as const : 'urgent' as const,
            narrated: true,
            narration: eventNarrative
          };
          simulationResult.newState = {
            ...simulationResult.newState,
            events: {
              ...simulationResult.newState.events,
              pending: [...simulationResult.newState.events.pending, pending]
            }
          };
        }
      }
      console.log('[TICK] 世界模拟完成', {
        success: simulationResult.success,
        newYear: simulationResult.newState.world.year,
        eventsCount: simulationResult.events?.length
      });
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

    // 世界模拟完成后，以新状态（含正确年份）作为后续操作的基准
    currentState = simulationResult.newState;

    // ── 2. NPC 交互（使用模拟后的状态，年份已正确）─────────────────────────
    let npcDecision = null;
    let npcNarration: string | null = null;
    let npcChronicleEntry = null;

    if (targetNpcId) {
      try {
        const targetNpc = currentState.npcs.find(n => n.id === targetNpcId);
        if (targetNpc && (!targetNpc.goals || targetNpc.goals.length === 0)) {
          targetNpc.goals = [{
            id: `goal_${Date.now()}_default`,
            description: '执行职责范围内事务',
            priority: 0.5,
            created_year: currentState.world.year,
            last_updated_year: currentState.world.year,
            status: 'active'
          }];
        }
        console.log('[TICK] 准备调用 processCommand', {
          command,
          targetNpcId,
          npc: targetNpc?.name,
          year: currentState.world.year
        });
        const npcResult = await processCommand(command, currentState, targetNpcId);
        console.log('[TICK] processCommand 调用成功', {
          narration: npcResult.narration?.substring(0, 100)
        });
        npcDecision = npcResult.decision;
        npcNarration = npcResult.narration;
        npcChronicleEntry = npcResult.chronicle_entry;

        if (npcResult.arbitration) {
          const arbitrationUpdates = npcResult.arbitration.game_state_updates;
          if (arbitrationUpdates) {
            if (arbitrationUpdates.resource_change) {
              for (const [key, delta] of Object.entries(arbitrationUpdates.resource_change)) {
                if (key in currentState.resources) {
                  (currentState.resources as Record<string, number>)[key] =
                    Math.max(0, ((currentState.resources as Record<string, number>)[key] ?? 0) + delta);
                }
              }
            }
            if (arbitrationUpdates.collective_memory_added?.length) {
              currentState.world.collective_memory.push(...arbitrationUpdates.collective_memory_added);
              if (currentState.world.collective_memory.length > 20) {
                currentState.world.collective_memory = currentState.world.collective_memory.slice(-20);
              }
            }
          }
        }

        const npc = currentState.npcs.find(n => n.id === targetNpcId);
        if (npc && npcDecision) {
          npc.state.recent_events.unshift(`${currentState.world.year}年：${npcDecision.final_action}`);
          if (npc.state.recent_events.length > 3) npc.state.recent_events.pop();
        }
        console.log('[TICK] NPC交互处理完成');
      } catch (error) {
        console.error('[TICK] NPC交互处理失败:', error);
        // 继续执行，不中断整个流程
      }
    } else if (command) {
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
    }

    // 同步：simulationResult.newState 也要包含 NPC 变化
    simulationResult.newState = currentState;

    // ── 3. 仲裁事件 ──────────────────────────────────────────────────────────
    let arbitrationResult = null;
    if (simulationResult.events.length > 0) {
      arbitrationResult = await arbitrateEvents(simulationResult.newState, simulationResult.events);

      if (arbitrationResult.success && arbitrationResult.needsArbitration && arbitrationResult.game_state_updates) {
        const updates = arbitrationResult.game_state_updates;
        if (updates.resource_change) {
          for (const [key, delta] of Object.entries(updates.resource_change)) {
            if (key in simulationResult.newState.resources) {
              (simulationResult.newState.resources as Record<string, number>)[key] =
                Math.max(0, ((simulationResult.newState.resources as Record<string, number>)[key] ?? 0) + delta);
            }
          }
        }
        if (updates.collective_memory_added?.length) {
          simulationResult.newState.world.collective_memory.push(...updates.collective_memory_added);
          if (simulationResult.newState.world.collective_memory.length > 20) {
            simulationResult.newState.world.collective_memory = simulationResult.newState.world.collective_memory.slice(-20);
          }
        }
      }
    }

    // ── 4. 世界叙事（NPC 已有叙事且无额外事件时跳过，节省一次 LLM）───────
    let narrationResult: Awaited<ReturnType<typeof generateNarration>>;
    const needsWorldNarration = !npcNarration || simulationResult.events.length > 0 || !!arbitrationResult?.narrative;
    console.log('[TICK] 世界叙事决策', {
      needsWorldNarration,
      hasNpcNarration: !!npcNarration,
      eventsCount: simulationResult.events.length
    });
    if (needsWorldNarration) {
      narrationResult = await generateNarration(
        simulationResult.newState,
        simulationResult.events,
        arbitrationResult,
        targetNpcId
      );
    } else {
      narrationResult = {
        success: true,
        narration: npcNarration!,
        chronicle_entry: npcChronicleEntry ?? undefined
      };
    }

    // ── 5. 结局检查 ──────────────────────────────────────────────────────────
    // ── 5. 结局检查 ──────────────────────────────────────────────────────────
    const ending = checkEndings(simulationResult.newState);
    if (ending) {
      simulationResult.events.push(`游戏结局：${ending.title}`);
      // 返回结局信息，供 UI 层处理
      return {
        success: true,
        newState: simulationResult.newState,
        events: simulationResult.events,
        warnings: simulationResult.warnings,
        narration: finalNarration,
        chronicle_entry: npcChronicleEntry || narrationResult.chronicle_entry,
        decision: npcDecision,
        ending: {
          id: ending.id,
          title: ending.title
        },
        arbitration: arbitrationResult ? {
          narrative: arbitrationResult.narrative,
          game_state_updates: arbitrationResult.game_state_updates
        } : undefined
      };
    }

    // ── 6. 组装结果 ──────────────────────────────────────────────────────────
    const finalNarration = npcNarration || narrationResult.narration;
    console.log('[TICK] 组装最终结果', {
      finalNarration: finalNarration?.substring(0, 50),
      year: simulationResult.newState.world.year
    });

    return {
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
    const result = simulateWorld(currentState, { advanceYear: true });
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
  const ending = checkEndings(state);
  if (ending) {
    return { isEnded: true, reason: ending.title };
  }
  return checkGameEndConditions(state);
}
