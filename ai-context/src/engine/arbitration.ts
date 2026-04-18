import type { GameState, NPC, DecisionTrace } from './types';
import { llmCall } from './llm';

// 仲裁相关类型定义
export interface ConflictNPC {
  id: string;
  name: string;
  role: string;
  faction: string;
  traits: {
    loyalty: number;
    ambition: number;
    greed: number;
    courage: number;
    rationality: number;
    stability: number;
  };
  bias: Record<string, number>;
  interpretation: string;
  argument_weight: number;
  emotional_state: '平静' | '忧虑' | '愤怒' | '绝望' | '兴奋';
  decision: DecisionTrace;
}

export interface ConflictAnalysis {
  root_cause: string;
  sub_conflicts: Array<{
    type: string;
    description: string;
  }>;
  intensity_score: number;
  escalation_risk: number;
}

export interface Argument {
  npc_id: string;
  core_argument: string;
  supporting_facts: string[];
  rhetorical_strategy: string;
  persuasion_score: number;
}

export interface WeightCalculation {
  base_weights: Record<string, number>;
  modifiers: Record<string, Record<string, number>>;
  final_weights: Record<string, number>;
}

export interface GameStateEffect {
  resource_change?: Record<string, number>;
  relationship_change?: Record<string, number>;
  collective_memory_added?: string[];
}

export interface ArbitrationResult {
  scene_id: string;
  title: string;
  narrative: string;
  dialogue_highlights: Array<{
    speaker: string;
    text: string;
    tone: string;
    subtext: string;
  }>;
  nonverbal_cues: string[];
  resolution_hint: string;
  game_state_updates: GameStateEffect;
  next_scenario_seeds: Array<{
    seed_id: string;
    description: string;
    trigger_condition: string;
  }>;
  conflict_analysis: ConflictAnalysis;
  weight_calculation: WeightCalculation;
}

/**
 * 检测是否需要触发仲裁机制
 * @param decisions 多个NPC的决策结果
 * @param state 游戏状态
 * @returns 是否需要仲裁
 */
export function shouldTriggerArbitration(
  decisions: Array<{ npc: NPC; decision: DecisionTrace }>,
  _state: GameState
): boolean {
  // 至少需要两个NPC
  if (decisions.length < 2) {
    return false;
  }

  // 检查interpretation差值
  const interpretations = decisions.map(d => d.decision.interpretation);
  const hasSignificantDifference = checkInterpretationDifference(interpretations);

  // 检查情绪状态
  const hasIntenseEmotion = decisions.some(d => {
    const emotionalState = extractEmotionalState(d.decision);
    return ['愤怒', '忧虑', '绝望'].includes(emotionalState);
  });

  // 检查态度对立
  const hasOpposingAttitudes = checkAttitudeOpposition(decisions.map(d => d.decision.attitude));

  return hasSignificantDifference || hasIntenseEmotion || hasOpposingAttitudes;
}

/**
 * 检查interpretation之间的差异
 */
function checkInterpretationDifference(interpretations: string[]): boolean {
  // 简化实现：检查是否有明显的对立词汇
  const oppositionPairs = [
    ['支持', '反对'], ['同意', '拒绝'], ['应该', '不应该'],
    ['增加', '减少'], ['进攻', '防守'], ['立即', '延迟']
  ];

  for (const [word1, word2] of oppositionPairs) {
    const hasWord1 = interpretations.some(i => i.includes(word1));
    const hasWord2 = interpretations.some(i => i.includes(word2));
    if (hasWord1 && hasWord2) {
      return true;
    }
  }

  return false;
}

/**
 * 从决策中提取情绪状态
 */
function extractEmotionalState(decision: DecisionTrace): string {
  const text = `${decision.interpretation} ${decision.final_action}`;
  
  if (text.includes('愤怒') || text.includes('怒') || text.includes('拍案')) {
    return '愤怒';
  }
  if (text.includes('忧虑') || text.includes('担心') || text.includes('害怕')) {
    return '忧虑';
  }
  if (text.includes('绝望') || text.includes('无望') || text.includes('末日')) {
    return '绝望';
  }
  if (text.includes('兴奋') || text.includes('高兴') || text.includes('欣喜')) {
    return '兴奋';
  }
  
  return '平静';
}

/**
 * 检查态度是否对立
 */
function checkAttitudeOpposition(attitudes: string[]): boolean {
  const positiveAttitudes = ['支持', '赞同', '同意', '积极'];
  const negativeAttitudes = ['反对', '拒绝', '不同意', '消极'];
  
  const hasPositive = attitudes.some(a => positiveAttitudes.some(p => a.includes(p)));
  const hasNegative = attitudes.some(a => negativeAttitudes.some(n => a.includes(n)));
  
  return hasPositive && hasNegative;
}

/**
 * 执行仲裁流程
 * @param command 玩家指令
 * @param decisions 多个NPC的决策结果
 * @param state 游戏状态
 * @returns 仲裁结果
 */
export async function executeArbitration(
  command: string,
  decisions: Array<{ npc: NPC; decision: DecisionTrace }>,
  state: GameState
): Promise<ArbitrationResult> {
  // 1. 构建冲突NPC数据
  const conflictNPCs: ConflictNPC[] = decisions.map(({ npc, decision }) => ({
    id: npc.id,
    name: npc.name,
    role: npc.role,
    faction: npc.faction,
    traits: npc.traits,
    bias: npc.bias,
    interpretation: decision.interpretation,
    argument_weight: calculateArgumentWeight(npc, decision, state),
    emotional_state: extractEmotionalState(decision) as ConflictNPC['emotional_state'],
    decision
  }));

  // 2. 执行冲突分析
  const conflictAnalysis = analyzeConflict(conflictNPCs, state);

  // 3. 计算权重
  const weightCalculation = calculateWeights(conflictNPCs, state);

  // 4. 生成仲裁叙事
  const arbitrationNarrative = await generateArbitrationNarrative(
    command,
    conflictNPCs,
    conflictAnalysis,
    weightCalculation,
    state
  );

  // 5. 计算游戏状态影响
  const gameStateUpdates = calculateGameStateEffects(
    conflictNPCs,
    weightCalculation,
    state
  );

  // 6. 生成后续事件种子
  const nextScenarioSeeds = generateNextScenarioSeeds(conflictNPCs, conflictAnalysis);

  return {
    scene_id: `arbitration_${state.world.year}_${Date.now()}`,
    title: generateTitle(conflictNPCs, command),
    narrative: arbitrationNarrative,
    dialogue_highlights: extractDialogueHighlights(conflictNPCs),
    nonverbal_cues: generateNonverbalCues(conflictNPCs),
    resolution_hint: generateResolutionHint(conflictNPCs, weightCalculation),
    game_state_updates: gameStateUpdates,
    next_scenario_seeds: nextScenarioSeeds,
    conflict_analysis: conflictAnalysis,
    weight_calculation: weightCalculation
  };
}

/**
 * 论证权重计算
 */
function calculateArgumentWeight(npc: NPC, decision: DecisionTrace, _state: GameState): number {
  let weight = 0.5; // 基础权重

  // 基于特质调整
  weight += (npc.traits.rationality / 100) * 0.2;
  weight += (npc.traits.loyalty / 100) * 0.1;
  weight += (npc.traits.stability / 100) * 0.1;

  // 基于态度强度调整
  if (decision.attitude.includes('坚决') || decision.attitude.includes('强烈')) {
    weight += 0.15;
  }

  // 基于解释逻辑性调整
  if (decision.decision_path.length > 2) {
    weight += 0.1;
  }

  return Math.min(1.0, Math.max(0.0, weight));
}

/**
 * 冲突分析
 */
function analyzeConflict(conflictNPCs: ConflictNPC[], state: GameState): ConflictAnalysis {
  // 分析根本原因
  const rootCause = analyzeRootCause(conflictNPCs);
  
  // 分析子冲突
  const subConflicts = analyzeSubConflicts(conflictNPCs, state);
  
  // 计算冲突强度
  const intensityScore = calculateConflictIntensity(conflictNPCs, state);
  
  // 计算升级风险
  const escalationRisk = calculateEscalationRisk(conflictNPCs, state);

  return {
    root_cause: rootCause,
    sub_conflicts: subConflicts,
    intensity_score: intensityScore,
    escalation_risk: escalationRisk
  };
}

function analyzeRootCause(conflictNPCs: ConflictNPC[]): string {
  const factions = new Set(conflictNPCs.map(npc => npc.faction));
  
  if (factions.size > 1) {
    return '派系利益冲突';
  }
  
  const interpretations = conflictNPCs.map(npc => npc.interpretation);
  if (interpretations.some(i => i.includes('资源') || i.includes('财政') || i.includes('钱'))) {
    return '资源分配矛盾';
  }
  
  if (interpretations.some(i => i.includes('安全') || i.includes('军事') || i.includes('边关'))) {
    return '战略优先分歧';
  }
  
  return '理念与立场差异';
}

function analyzeSubConflicts(conflictNPCs: ConflictNPC[], state: GameState): Array<{ type: string; description: string }> {
  const subConflicts: Array<{ type: string; description: string }> = [];

  // 派系冲突
  const factions = conflictNPCs.map(npc => npc.faction);
  const uniqueFactions = [...new Set(factions)];
  if (uniqueFactions.length > 1) {
    subConflicts.push({
      type: '派系利益',
      description: `${uniqueFactions.join('与')}之间的权力博弈`
    });
  }

  // 人格特质冲突
  const rationalNPCs = conflictNPCs.filter(npc => npc.traits.rationality > 70);
  const emotionalNPCs = conflictNPCs.filter(npc => npc.traits.rationality < 40);
  if (rationalNPCs.length > 0 && emotionalNPCs.length > 0) {
    subConflicts.push({
      type: '人格特质',
      description: '理性务实派与情感激进派的处事方式冲突'
    });
  }

  // 资源相关冲突
  if (state.resources.fiscal < 5000) {
    subConflicts.push({
      type: '资源紧张',
      description: '国库空虚加剧了各方对资源分配的争夺'
    });
  }

  return subConflicts;
}

function calculateConflictIntensity(conflictNPCs: ConflictNPC[], state: GameState): number {
  let intensity = 0.3; // 基础强度

  // 权重差影响
  const weights = conflictNPCs.map(npc => npc.argument_weight);
  const maxWeight = Math.max(...weights);
  const minWeight = Math.min(...weights);
  intensity += (maxWeight - minWeight) * 0.3;

  // 情绪值影响
  const emotionalScores = conflictNPCs.map(npc => {
    switch (npc.emotional_state) {
      case '愤怒': return 0.9;
      case '忧虑': return 0.7;
      case '绝望': return 0.8;
      case '兴奋': return 0.6;
      default: return 0.3;
    }
  });
  const avgEmotionalScore = emotionalScores.reduce((a, b) => a + b, 0) / emotionalScores.length;
  intensity += avgEmotionalScore * 0.4;

  // 资源稀缺度影响
  const resourceScarcity = 1 - (state.resources.fiscal / 10000);
  intensity += resourceScarcity * 0.3;

  return Math.min(1.0, intensity);
}

function calculateEscalationRisk(conflictNPCs: ConflictNPC[], state: GameState): number {
  let risk = 0.2; // 基础风险

  // 愤怒情绪增加风险
  const angryNPCs = conflictNPCs.filter(npc => npc.emotional_state === '愤怒');
  risk += angryNPCs.length * 0.15;

  // 派系对立增加风险
  const factions = new Set(conflictNPCs.map(npc => npc.faction));
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

/**
 * 权重计算
 */
function calculateWeights(conflictNPCs: ConflictNPC[], state: GameState): WeightCalculation {
  const baseWeights: Record<string, number> = {};
  const modifiers: Record<string, Record<string, number>> = {};
  const finalWeights: Record<string, number> = {};

  conflictNPCs.forEach(npc => {
    // 基础权重
    baseWeights[npc.id] = npc.argument_weight;

    // 修正因子
    const npcModifiers: Record<string, number> = {};

    // 资源相关性修正
    if (npc.interpretation.includes('财政') || npc.interpretation.includes('资源')) {
      if (npc.role.includes('户部') || npc.role.includes('财政')) {
        npcModifiers.resource_relevance = 0.15;
      } else {
        npcModifiers.resource_relevance = -0.05;
      }
    }

    // 派系影响力修正
    const factionInfluence = calculateFactionInfluence(npc, state);
    npcModifiers.faction_influence = factionInfluence;

    // 特质匹配度修正
    const traitAlignment = calculateTraitAlignment(npc);
    npcModifiers.trait_alignment = traitAlignment;

    modifiers[npc.id] = npcModifiers;

    // 计算最终权重
    let finalWeight = baseWeights[npc.id];
    Object.values(npcModifiers).forEach(mod => {
      finalWeight += mod;
    });
    finalWeights[npc.id] = Math.min(1.0, Math.max(0.0, finalWeight));
  });

  return {
    base_weights: baseWeights,
    modifiers,
    final_weights: finalWeights
  };
}

function calculateFactionInfluence(npc: ConflictNPC, _state: GameState): number {
  // 简化实现：基于派系在朝中的势力
  const factionPower: Record<string, number> = {
    '清流': 0.6,
    '权臣': 0.8,
    '宦官': 0.7,
    '外戚': 0.5,
    '中立': 0.3
  };

  return factionPower[npc.faction] || 0.3;
}

function calculateTraitAlignment(npc: ConflictNPC): number {
  let alignment = 0;

  // 理性特质匹配
  if (npc.traits.rationality > 70) {
    alignment += 0.15;
  }

  // 忠诚特质匹配
  if (npc.traits.loyalty > 80) {
    alignment += 0.1;
  }

  // 稳定性特质匹配
  if (npc.traits.stability > 70) {
    alignment += 0.05;
  }

  return alignment;
}

/**
 * 生成仲裁叙事
 */
async function generateArbitrationNarrative(
  command: string,
  conflictNPCs: ConflictNPC[],
  conflictAnalysis: ConflictAnalysis,
  weightCalculation: WeightCalculation,
  state: GameState
): Promise<string> {
  // 构建prompt
  const prompt = buildArbitrationPrompt(command, conflictNPCs, conflictAnalysis, weightCalculation, state);
  
  try {
    // 调用LLM生成叙事
    const messages = [
      { role: 'system' as const, content: prompt },
      { role: 'user' as const, content: `请根据以上信息生成一段200-300字的御前辩论场景叙事。` }
    ];
    
    const narrative = await llmCall('A', messages);
    return narrative;
  } catch (error) {
    // 降级处理：使用模板生成
    return generateFallbackNarrative(command, conflictNPCs, state);
  }
}

function buildArbitrationPrompt(
  command: string,
  conflictNPCs: ConflictNPC[],
  conflictAnalysis: ConflictAnalysis,
  weightCalculation: WeightCalculation,
  state: GameState
): string {
  return `你是一位历史叙事引擎，负责生成皇帝游戏中的御前辩论场景。

## 场景背景
- 朝代：${state.world.dynasty}
- 年份：${state.world.era}${state.world.year}年
- 世界基调：${state.world.tone}
- 玩家指令：${command}

## 冲突分析
- 根本原因：${conflictAnalysis.root_cause}
- 冲突强度：${conflictAnalysis.intensity_score.toFixed(2)}
- 升级风险：${conflictAnalysis.escalation_risk.toFixed(2)}

## 参与辩论的官员
${conflictNPCs.map(npc => `
### ${npc.name}（${npc.role}，${npc.faction}派）
- 立场：${npc.interpretation}
- 情绪状态：${npc.emotional_state}
- 论证权重：${npc.argument_weight.toFixed(2)}
- 最终权重：${weightCalculation.final_weights[npc.id].toFixed(2)}
- 人格特质：理性${npc.traits.rationality}，忠诚${npc.traits.loyalty}，稳定${npc.traits.stability}
`).join('\n')}

## 叙事要求
1. 使用《明朝那些事儿》的文风，现代白话讲述历史
2. 包含具体的对话内容，体现各官员的立场和性格
3. 描述非语言细节（动作、表情、道具）
4. 保持150-300字的紧凑格式
5. 结尾暗示后续可能的发展

请生成叙事：`;
}

function generateFallbackNarrative(
  command: string,
  conflictNPCs: ConflictNPC[],
  state: GameState
): string {
  const year = state.world.year;
  const npcNames = conflictNPCs.map(npc => npc.name).join('、');
  
  const dialogues = conflictNPCs.map(npc => {
    const emotion = npc.emotional_state === '愤怒' ? '声色俱厉地' : 
                   npc.emotional_state === '忧虑' ? '忧心忡忡地' : '平静地';
    return `${npc.name}${emotion}道："${npc.interpretation.substring(0, 30)}..."`;
  }).join('\n');

  return `永德${year}年，关于"${command.substring(0, 10)}"的议题引发了朝堂争议。

${dialogues}

皇帝端坐龙椅，目光在${npcNames}之间来回扫视。殿内气氛凝重，各方势力暗流涌动。这场争论不仅关乎政策得失，更牵扯到朝堂权力的重新分配。

最终，皇帝需要在${conflictNPCs[0].faction}派与${conflictNPCs[1]?.faction ?? '其他'}派之间做出抉择。无论选择哪一方，都将对朝局产生深远影响。`;
}

/**
 * 提取对话亮点
 */
function extractDialogueHighlights(conflictNPCs: ConflictNPC[]): Array<{
  speaker: string;
  text: string;
  tone: string;
  subtext: string;
}> {
  return conflictNPCs.map(npc => {
    const tone = npc.emotional_state === '愤怒' ? '激昂' : 
                 npc.emotional_state === '忧虑' ? '沉重' : '坚定';
    
    const subtext = npc.traits.rationality > 70 ? '引用数据和逻辑论证' :
                   npc.traits.courage > 70 ? '强调勇气和决断' : '诉诸情感和忠诚';
    
    return {
      speaker: npc.name,
      text: npc.interpretation.substring(0, 50) + (npc.interpretation.length > 50 ? '...' : ''),
      tone,
      subtext
    };
  });
}

/**
 * 生成非语言细节
 */
function generateNonverbalCues(conflictNPCs: ConflictNPC[]): string[] {
  const cues: string[] = [];
  
  conflictNPCs.forEach(npc => {
    if (npc.emotional_state === '愤怒') {
      cues.push(`${npc.name}紧握拳头，青筋暴起`);
    } else if (npc.emotional_state === '忧虑') {
      cues.push(`${npc.name}眉头紧锁，不时擦拭额角`);
    }
    
    if (npc.traits.rationality > 70) {
      cues.push(`${npc.name}手持账簿或文书（道具强化专业权威）`);
    }
    
    if (npc.traits.courage > 80) {
      cues.push(`${npc.name}站姿挺拔，目光直视皇帝`);
    }
  });
  
  // 添加环境细节
  cues.push('殿内烛火摇曳，映照着众臣紧张的面容');
  cues.push('皇帝手指轻敲龙椅扶手，陷入沉思');
  
  return cues;
}

/**
 * 生成解决提示
 */
function generateResolutionHint(
  conflictNPCs: ConflictNPC[],
  weightCalculation: WeightCalculation
): string {
  // 找出权重最高的NPC
  let maxWeight = 0;
  let dominantNPC = conflictNPCs[0];
  
  conflictNPCs.forEach(npc => {
    const weight = weightCalculation.final_weights[npc.id];
    if (weight > maxWeight) {
      maxWeight = weight;
      dominantNPC = npc;
    }
  });
  
  const otherNPCs = conflictNPCs.filter(npc => npc.id !== dominantNPC.id);
  const otherFactions = [...new Set(otherNPCs.map(npc => npc.faction))];
  
  return `皇帝倾向于采纳${dominantNPC.name}（${dominantNPC.faction}派）的建议，但需要安抚${otherFactions.join('、')}派的情绪。折中方案可能包括：给予${dominantNPC.faction}派主导权，同时承诺对${otherFactions[0]}派关切的问题进行后续跟进。`;
}

/**
 * 计算游戏状态影响
 */
function calculateGameStateEffects(
  conflictNPCs: ConflictNPC[],
  weightCalculation: WeightCalculation,
  state: GameState
): GameStateEffect {
  const resourceChange: Record<string, number> = {};
  const relationshipChange: Record<string, number> = {};
  const collectiveMemoryAdded: string[] = [];

  // 找出权重最高的NPC（胜利方）
  let winnerId = conflictNPCs[0].id;
  let maxWeight = 0;
  
  conflictNPCs.forEach(npc => {
    const weight = weightCalculation.final_weights[npc.id];
    if (weight > maxWeight) {
      maxWeight = weight;
      winnerId = npc.id;
    }
  });

  // 计算关系变化
  conflictNPCs.forEach(npc => {
    const isWinner = npc.id === winnerId;
    const npcKey = `${npc.id}↔emperor`;
    
    if (isWinner) {
      relationshipChange[npcKey] = 15; // 胜利方关系提升
    } else {
      relationshipChange[npcKey] = -10; // 失败方关系下降
    }
  });

  // 计算NPC之间的关系变化
  for (let i = 0; i < conflictNPCs.length; i++) {
    for (let j = i + 1; j < conflictNPCs.length; j++) {
      const npc1 = conflictNPCs[i];
      const npc2 = conflictNPCs[j];
      const relationKey = `${npc1.id}↔${npc2.id}`;
      relationshipChange[relationKey] = -20; // 辩论双方关系下降
    }
  }

  // 添加集体记忆
  collectiveMemoryAdded.push(
    `永德${state.world.year}年御前辩论：${conflictNPCs.map(npc => npc.name).join('与')}的${conflictNPCs[0].faction}与${conflictNPCs[1]?.faction ?? '其他'}派之争`
  );

  return {
    resource_change: resourceChange,
    relationship_change: relationshipChange,
    collective_memory_added: collectiveMemoryAdded
  };
}

/**
 * 生成后续事件种子
 */
function generateNextScenarioSeeds(
  conflictNPCs: ConflictNPC[],
  conflictAnalysis: ConflictAnalysis
): Array<{
  seed_id: string;
  description: string;
  trigger_condition: string;
}> {
  const seeds: Array<{
    seed_id: string;
    description: string;
    trigger_condition: string;
  }> = [];

  // 为每个失败方生成可能的后续事件
  conflictNPCs.forEach(npc => {
    if (npc.emotional_state === '愤怒' || npc.emotional_state === '忧虑') {
      seeds.push({
        seed_id: `${npc.id}_reaction`,
        description: `${npc.name}对辩论结果不满，可能采取行动`,
        trigger_condition: '下个休沐日前'
      });
    }
  });

  // 如果冲突强度高，生成危机事件
  if (conflictAnalysis.intensity_score > 0.7) {
    seeds.push({
      seed_id: 'faction_crisis',
      description: '派系裂痕加深，可能引发朝堂动荡',
      trigger_condition: '半月内'
    });
  }

  // 生成折中方案相关事件
  seeds.push({
    seed_id: 'compromise_implementation',
    description: '折中方案的执行可能遇到阻力',
    trigger_condition: '政策实施后'
  });

  return seeds;
}

/**
 * 生成标题
 */
function generateTitle(conflictNPCs: ConflictNPC[], command: string): string {
  const npcNames = conflictNPCs.map(npc => npc.name).join('与');
  const topic = command.length > 10 ? command.substring(0, 10) + '...' : command;
  
  return `御前激辩：${npcNames}的${topic}之争`;
}