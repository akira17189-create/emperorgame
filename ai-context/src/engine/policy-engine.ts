import { callLLMWithRetry } from './llm';
import type { GameState, Policy, PolicyLog } from './types';
import { NARRATIVE_STYLE_RULES_PROMPT } from '../data/lore-bridge';

// ---- 类型扩展 ----
export interface PolicyEffect {
  resource_change: Partial<Record<string, number>>; // 立即效果
  tick_change: Partial<Record<string, number>>;     // 每tick持续效果
  duration_years: number;                            // 持续年数，-1为永久
  npc_reactions: NPCReaction[];
  chronicle_note: string;                            // 史册记录
  faction_impact: Record<string, number>;            // 各派系满意度变化
}

export interface NPCReaction {
  npc_id: string;
  attitude: '支持' | '反对' | '中立' | '观望';
  speech: string;       // NPC发言
  hidden_action?: string; // 暗中行动（不对玩家展示）
}

export interface PolicyInterpretResult {
  success: boolean;
  policy: Policy;
  effect: PolicyEffect;
  narrative: string;      // 颁布政策时的叙事文本
  error?: string;
}

// ---- 预设政策模板（22个，DeepSeek补充细节）----
export const POLICY_PRESETS = {
  // 内政类
  "减税惠民":     { tags: ["内政", "财政"], tick_change: { morale: +2, fiscal: -100 }, duration: 3 },
  "加征赋税":     { tags: ["内政", "财政"], tick_change: { morale: -2, fiscal: +150 }, duration: -1 },
  "整顿吏治":     { tags: ["内政", "廉政"], tick_change: { morale: +1, fiscal: -30 }, duration: 2 },
  "广开言路":     { tags: ["内政", "言论"], tick_change: { faction: -5, morale: +1 }, duration: 3 },
  "兴建水利":     { tags: ["内政", "农业"], tick_change: { food: +80, fiscal: -200 }, duration: 5 },
  "开仓赈灾":     { tags: ["内政", "民生"], tick_change: { morale: +3, food: -200 }, duration: 1 },
  // 军事类
  "扩充禁军":     { tags: ["军事"], tick_change: { military: +50, fiscal: -150 }, duration: -1 },
  "裁汰冗兵":     { tags: ["军事", "财政"], tick_change: { military: -30, fiscal: +80 }, duration: 2 },
  "边疆屯田":     { tags: ["军事", "农业"], tick_change: { threat: -2, food: +50 }, duration: 5 },
  "和亲邦交":     { tags: ["军事", "外交"], tick_change: { threat: -5, morale: -1 }, duration: 3 },
  "御驾亲征":     { tags: ["军事"], tick_change: { military: +80, threat: -8, morale: +2 }, duration: 2 },
  // 仙道类（TODO: DeepSeek补充6个）
  "祭天祈福":     { tags: ["仙道"], tick_change: { morale: +3, fiscal: -50 }, duration: 1 },
  "召仙炼丹":     { tags: ["仙道"], tick_change: { morale: -1, eunuch: +5, fiscal: -100 }, duration: 3 },
  // 工业/现代类（TODO: DeepSeek补充5个）
  "推广活字印刷": { tags: ["工业", "穿越"], tick_change: { morale: +1, commerce: +30 }, duration: -1 },
  "开设钱庄":     { tags: ["工业", "商业"], tick_change: { commerce: +60, fiscal: +80 }, duration: -1 },
} as const;

// ---- 核心函数 ----

/**
 * 解释并执行一条政策（LLM调用版）
 * 用于玩家自由输入的政策描述
 */
export async function interpretPolicy(
  description: string,
  state: GameState
): Promise<PolicyInterpretResult> {

  const activeNpcs = state.npcs
    .filter(n => n.status === 'active')
    .slice(0, 6)
    .map(n => `${n.name}(${n.role},${n.faction}派)`)
    .join('、');

  const systemPrompt = `你是靖朝皇帝模拟游戏的政策裁判引擎。
${NARRATIVE_STYLE_RULES_PROMPT}

【你的任务】
玩家颁布了一条政策，你需要：
1. 判断政策的合理性和历史真实性
2. 生成资源变化效果（立即效果 + 每tick持续效果）
3. 生成各NPC的反应（支持/反对/中立）和发言
4. 生成叙事文本（按15条文风规则）
5. 生成史册记录（史官口吻，30字以内）

【输出格式】严格JSON，不要markdown代码块：
{
  "resource_change": {"morale":0,"fiscal":0,"military":0,"food":0,"threat":0,"commerce":0},
  "tick_change": {"morale":0,"fiscal":0},
  "duration_years": 3,
  "npc_reactions": [
    {"npc_id":"fang-zhi","attitude":"支持","speech":"...（体现其voice特征）","hidden_action":"..."}
  ],
  "chronicle_note": "史册记录...",
  "narrative": "叙事文本（按15条规则，不超过200字）"
}`;

  const userPrompt = `【当前状态】
朝代：${state.world.dynasty}${state.world.era}${state.world.year}年
民心：${state.resources.morale} 国库：${state.resources.fiscal} 军力：${state.resources.military}
外患：${state.resources.threat} 宦官势力：${state.resources.eunuch}
在场朝臣：${activeNpcs}

【玩家政策指令】
"${description}"

请生成政策解析JSON。`;

  try {
    const raw = await callLLMWithRetry({
      system: systemPrompt,
      user: userPrompt,
      temperature: 0.7,
      tag: 'policy'
    });

    // 解析JSON（容错处理）
    let parsed: any;
    try {
      const cleaned = raw.replace(/```json|```/g, '').trim();
      parsed = JSON.parse(cleaned);
    } catch {
      throw new Error('LLM返回的政策JSON解析失败：' + raw.substring(0, 200));
    }

    const policy: Policy = {
      id: `policy_${Date.now()}`,
      tags: detectPolicyTags(description),
      enacted_year: state.world.year,
      enacted_by: 'emperor',
      description,
      visual: { image: null, image_prompt: null }
    };

    const effect: PolicyEffect = {
      resource_change: parsed.resource_change || {},
      tick_change:     parsed.tick_change     || {},
      duration_years:  parsed.duration_years  || 3,
      npc_reactions:   parsed.npc_reactions   || [],
      chronicle_note:  parsed.chronicle_note  || description,
      faction_impact:  {}
    };

    return {
      success: true,
      policy,
      effect,
      narrative: parsed.narrative || `皇帝颁布了「${description}」政策。`
    };

  } catch (err) {
    return {
      success: false,
      policy: { id: '', tags: [], enacted_year: state.world.year, enacted_by: 'emperor', description, visual: { image: null, image_prompt: null } },
      effect: { resource_change: {}, tick_change: {}, duration_years: 0, npc_reactions: [], chronicle_note: '', faction_impact: {} },
      narrative: '',
      error: String(err)
    };
  }
}

/**
 * 快速执行预设政策（不调LLM，直接用模板效果）
 * 用于22个预设政策，节省Token
 */
export function applyPresetPolicy(
  presetName: keyof typeof POLICY_PRESETS,
  state: GameState
): { policy: Policy; immediateChanges: Record<string, number> } {
  const preset = POLICY_PRESETS[presetName];
  const policy: Policy = {
    id: `preset_${presetName}_${Date.now()}`,
    tags: [...preset.tags],
    enacted_year: state.world.year,
    enacted_by: 'emperor',
    description: presetName,
    visual: { image: null, image_prompt: null }
  };
  return { policy, immediateChanges: preset.tick_change };
}

/**
 * 每tick应用所有活跃政策的持续效果
 * 在 tick.ts 的世界模拟后调用
 */
export function applyPolicyTickEffects(state: GameState): GameState {
  // 注意：当前 Policy 接口里没有 tick_change 字段
  // Phase 3.1 时需要 Mimo 在 Policy 接口里加上 tick_change 和 duration_years
  // 目前先做占位逻辑
  const newState = { ...state };
  // TODO: 遍历 state.policies.active，应用每条政策的 tick_change
  return newState;
}

/** 检查政策冲突 */
export function checkPolicyConflicts(newPolicy: Policy, activePolicies: Policy[]): string[] {
  const conflicts: string[] = [];
  for (const p of activePolicies) {
    // 同类型政策冲突检测（简单规则）
    if (p.tags.includes("财政") && newPolicy.tags.includes("财政")) {
      conflicts.push(`与「${p.description}」在财政方向有冲突`);
    }
    if (p.tags.includes("军事") && newPolicy.description.includes("裁")
        && p.description.includes("扩")) {
      conflicts.push(`扩军与裁军政策无法同时执行`);
    }
  }
  return conflicts;
}

/** 辅助：从描述推断政策tags */
function detectPolicyTags(desc: string): string[] {
  const tags: string[] = [];
  if (/税|赋|钱|财|库/.test(desc)) tags.push("财政");
  if (/军|兵|将|战|征/.test(desc)) tags.push("军事");
  if (/粮|农|田|水|旱/.test(desc)) tags.push("农业");
  if (/仙|道|炼|祭|神/.test(desc)) tags.push("仙道");
  if (/商|贸|市|钱庄/.test(desc)) tags.push("商业");
  if (tags.length === 0) tags.push("内政");
  return tags;
}
