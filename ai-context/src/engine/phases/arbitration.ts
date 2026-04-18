import type { GameState, NPC, DecisionTrace } from '../types';
import { llmCall } from '../llm';

export interface ArbitrationResult {
  success: boolean;
  needsArbitration: boolean;
  narrative?: string;
  game_state_updates?: {
    resource_change?: Record<string, number>;
    collective_memory_added?: string[];
  };
  conflict_analysis?: {
    root_cause: string;
    intensity_score: number;
    escalation_risk: number;
  };
  error?: string;
}

/**
 * 检查是否需要仲裁
 * @param state 游戏状态
 * @returns 是否需要仲裁
 */
export function checkArbitrationNeeded(state: GameState): boolean {
  // 检查是否有多个活跃NPC
  const activeNPCs = state.npcs.filter(npc => npc.status === 'active');
  if (activeNPCs.length < 2) {
    return false;
  }

  // 检查派系张力
  if (state.resources.faction > 60) {
    return true;
  }

  // 检查资源紧张
  if (state.resources.fiscal < 3000 || state.resources.morale < 40) {
    return true;
  }

  return false;
}

/**
 * 执行仲裁事件
 * @param state 游戏状态
 * @param events 事件列表
 * @returns 仲裁结果
 */
export async function arbitrateEvents(state: GameState, events: string[]): Promise<ArbitrationResult> {
  try {
    // 检查是否需要仲裁
    const needsArbitration = checkArbitrationNeeded(state);
    
    if (!needsArbitration) {
      return {
        success: true,
        needsArbitration: false
      };
    }

    // 获取活跃NPC
    const activeNPCs = state.npcs.filter(npc => npc.status === 'active').slice(0, 2);
    if (activeNPCs.length < 2) {
      return {
        success: true,
        needsArbitration: false
      };
    }

    // 生成仲裁叙事
    const narrative = await generateArbitrationNarrative(state, activeNPCs, events);
    
    // 计算游戏状态影响
    const gameStateUpdates = calculateArbitrationEffects(state, activeNPCs);
    
    // 冲突分析
    const conflictAnalysis = analyzeConflict(state, activeNPCs);

    return {
      success: true,
      needsArbitration: true,
      narrative,
      game_state_updates: gameStateUpdates,
      conflict_analysis: conflictAnalysis
    };
  } catch (error) {
    return {
      success: false,
      needsArbitration: false,
      error: `仲裁失败: ${error instanceof Error ? error.message : '未知错误'}`
    };
  }
}

/**
 * 生成仲裁叙事
 */
async function generateArbitrationNarrative(
  state: GameState,
  npcs: NPC[],
  events: string[]
): Promise<string> {
  const npc1 = npcs[0];
  const npc2 = npcs[1];
  
  const prompt = `你是一位历史叙事引擎，负责生成皇帝游戏中的御前辩论场景。

## 场景背景
- 朝代：${state.world.dynasty}
- 年份：${state.world.era}${state.world.year}年
- 世界基调：${state.world.tone}
- 近期事件：${events.join('；') || '无'}

## 辩论双方
### ${npc1.name}（${npc1.role}，${npc1.faction}派）
- 忠诚度：${npc1.state.loyalty_to_emperor}
- 压力值：${npc1.state.pressure}
- 满意度：${npc1.state.satisfaction}
- 行为模式：${npc1.state.behavior_modifier}

### ${npc2.name}（${npc2.role}，${npc2.faction}派）
- 忠诚度：${npc2.state.loyalty_to_emperor}
- 压力值：${npc2.state.pressure}
- 满意度：${npc2.state.satisfaction}
- 行为模式：${npc2.state.behavior_modifier}

## 资源状况
- 财政：${state.resources.fiscal}
- 民心：${state.resources.morale}
- 派系张力：${state.resources.faction}

## 叙事要求
1. 使用《明朝那些事儿》的文风，现代白话讲述历史
2. 生成150-200字的御前辩论场景
3. 包含具体的对话内容，体现各官员的立场和性格
4. 描述非语言细节（动作、表情）
5. 结尾暗示后续可能的发展

请生成叙事：`;

  try {
    const messages = [
      { role: 'system' as const, content: prompt },
      { role: 'user' as const, content: '请生成御前辩论场景叙事。' }
    ];
    
    return await llmCall('A', messages);
  } catch (error) {
    // 降级处理
    return generateFallbackNarrative(state, npcs, events);
  }
}

/**
 * 生成降级叙事
 */
function generateFallbackNarrative(
  state: GameState,
  npcs: NPC[],
  events: string[]
): string {
  const npc1 = npcs[0];
  const npc2 = npcs[1];
  
  const eventContext = events.length > 0 ? `受${events[0]}影响，` : '';
  
  return `永德${state.world.year}年，${eventContext}朝堂之上${npc1.name}与${npc2.name}就国事展开激烈辩论。

${npc1.name}（${npc1.faction}派）坚持己见，认为应当优先处理${npc1.state.recent_events[0] || '当前事务'}。而${npc2.name}（${npc2.faction}派）则持相反立场，主张关注${npc2.state.recent_events[0] || '其他方面'}。

皇帝端坐龙椅，目光在两人之间扫视。殿内气氛凝重，这场争论不仅关乎政策得失，更牵扯到朝堂权力的重新分配。最终，皇帝需要在${npc1.faction}派与${npc2.faction}派之间做出抉择。`;
}

/**
 * 计算仲裁影响
 */
function calculateArbitrationEffects(
  state: GameState,
  npcs: NPC[]
): { resource_change?: Record<string, number>; collective_memory_added?: string[] } {
  const resourceChange: Record<string, number> = {};
  const collectiveMemoryAdded: string[] = [];

  // 根据派系张力调整资源
  if (state.resources.faction > 70) {
    resourceChange.morale = -5; // 高张力降低民心
    resourceChange.faction = -3; // 仲裁后张力略降
  }

  // 添加集体记忆
  collectiveMemoryAdded.push(
    `永德${state.world.year}年御前辩论：${npcs.map(npc => npc.name).join('与')}的${npcs[0].faction}与${npcs[1]?.faction ?? '其他'}派之争`
  );

  return {
    resource_change: resourceChange,
    collective_memory_added: collectiveMemoryAdded
  };
}

/**
 * 分析冲突
 */
function analyzeConflict(
  state: GameState,
  npcs: NPC[]
): { root_cause: string; intensity_score: number; escalation_risk: number } {
  // 分析根本原因
  let rootCause = '理念差异';
  
  if (npcs[0].faction !== npcs[1].faction) {
    rootCause = '派系利益冲突';
  } else if (state.resources.fiscal < 3000) {
    rootCause = '资源分配矛盾';
  } else if (state.resources.morale < 40) {
    rootCause = '民心危机引发的策略分歧';
  }

  // 计算冲突强度
  const intensityScore = calculateConflictIntensity(state, npcs);
  
  // 计算升级风险
  const escalationRisk = calculateEscalationRisk(state, npcs);

  return {
    root_cause: rootCause,
    intensity_score: intensityScore,
    escalation_risk: escalationRisk
  };
}

function calculateConflictIntensity(state: GameState, npcs: NPC[]): number {
  let intensity = 0.3;
  
  // 派系张力影响
  intensity += (state.resources.faction / 100) * 0.3;
  
  // NPC压力值影响
  const avgPressure = npcs.reduce((sum, npc) => sum + npc.state.pressure, 0) / npcs.length;
  intensity += (avgPressure / 100) * 0.2;
  
  // 资源紧张影响
  if (state.resources.fiscal < 3000) {
    intensity += 0.2;
  }
  
  return Math.min(1.0, intensity);
}

function calculateEscalationRisk(state: GameState, npcs: NPC[]): number {
  let risk = 0.2;
  
  // 愤怒情绪增加风险
  const angryNPCs = npcs.filter(npc => npc.state.behavior_modifier === '焦虑');
  risk += angryNPCs.length * 0.15;
  
  // 派系对立增加风险
  const factions = new Set(npcs.map(npc => npc.faction));
  if (factions.size > 1) {
    risk += 0.2;
  }
  
  // 资源紧张增加风险
  if (state.resources.fiscal < 3000) {
    risk += 0.25;
  }
  
  // 民心低增加风险
  if (state.resources.morale < 50) {
    risk += 0.15;
  }
  
  return Math.min(1.0, risk);
}