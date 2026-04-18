import type { GameState, NPC, ChronicleEntry } from './types';
import { llmCall } from './llm';
import { getSnapshot } from './state';

// 导入prompt文件作为字符串（Vite ?raw导入）
import normalizeCommandPrompt from '../prompts/normalize-command.md?raw';
import layer1WorldRulesPrompt from '../prompts/layer1-world-rules.md?raw';
import roleExecutionPrompt from '../prompts/role-execution.md?raw';
import narrationPrompt from '../prompts/narration.md?raw';

export interface IntentResult {
  intent: string;
  targets: string[];
  params: Record<string, unknown>;
  raw: string;
}

export interface DecisionTrace {
  npc_id: string;
  interpretation: string;
  decision_path: string[];
  motivation: string;
  attitude: string;
  final_action: string;
  hidden_action: string | null;
}

export interface NarratorResult {
  decision: DecisionTrace;
  narration: string;
  chronicle_entry: Omit<ChronicleEntry, 'id'>;
  arbitration?: {
    narrative: string;
    game_state_updates: {
      resource_change?: Record<string, number>;
      collective_memory_added?: string[];
    };
  };
}

// 简单的模板插值函数
function interpolate(template: string, vars: Record<string, unknown>): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => {
    const value = vars[key];
    return value !== undefined ? String(value) : '';
  });
}

// 解析JSON，支持从文本中提取第一个JSON对象
// 解析JSON，支持从文本中提取第一个JSON对象，支持嵌套JSON
function parseJSON<T>(raw: string): T | null {
  // 1. 先尝试直接解析
  try {
    return JSON.parse(raw) as T;
  } catch {
    // 2. 尝试提取有效的 JSON 块
    // 找到最后一个配对的 {...} 块（从末尾往前扫描）
    let balance = 0;
    let start = -1;
    let end = -1;

    // 从末尾向前扫描，找最外层 {}
    for (let i = raw.length - 1; i >= 0; i--) {
      const char = raw[i];
      if (char === '}') {
        if (balance === 0) {
          end = i; // 找到闭合位置
        }
        balance++;
      } else if (char === '{') {
        balance--;
        if (balance === 0 && end !== -1) {
          start = i; // 找到开始位置
          break;
        }
      }
    }

    // 如果找到了配对的 {}
    if (start !== -1 && end !== -1) {
      const candidate = raw.substring(start, end + 1);
      try {
        return JSON.parse(candidate) as T;
      } catch {
        // 继续尝试其他方法
      }
    }

    // 3. 作为最后手段，尝试正则匹配（旧方法）
    const match = raw.match(/\{[\s\S]*?\}/);
    if (match) {
      try {
        return JSON.parse(match[0]) as T;
      } catch {
        return null;
      }
    }

    return null;
  }
}

function loadPrompt(name: string): string {
  switch (name) {
    case 'normalize-command':
      return normalizeCommandPrompt;
    case 'layer1-world-rules':
      return layer1WorldRulesPrompt;
    case 'role-execution':
      return roleExecutionPrompt;
    case 'narration':
      return narrationPrompt;
    default:
      return '';
  }
}

export async function processCommand(
  command: string,
  state: GameState,
  targetNpcId: string
): Promise<NarratorResult> {
  console.log('[NARRATOR] processCommand 开始执行', { command, targetNpcId });
  const npc = state.npcs.find(n => n.id === targetNpcId);
  if (!npc) {
    throw new Error(`NPC with id ${targetNpcId} not found`);
  }

  // ── 1. B 档：指令归一化 ──
  console.log('[NARRATOR] 准备调用 LLM 进行指令归一化');
  const normalizePrompt = loadPrompt('normalize-command');
  const intentRaw = await llmCall('B', [
    { role: 'system', content: normalizePrompt },
    { role: 'user', content: interpolate(normalizePrompt, { command: command || '(无指令)' }) }
  ]);

  let intent = parseJSON<IntentResult>(intentRaw);
  if (!intent) {
    intent = { intent: '其他', targets: [], params: {}, raw: command };
  }

  // ── 2. 拼装 Layer 2+3 Prompt ──
  const worldRules = loadPrompt('layer1-world-rules');
  const rolePrompt = loadPrompt('role-execution');
  const snapshot = getSnapshot(state);

  // 组装记忆摘要
  const memorySummary = [
    ...npc.memory.trauma.map((t: any) => `${t.year}年·${t.type}：${t.impact}`),
    ...npc.memory.key_events.map((e: any) => `${e.year}年·${e.event_name}`)
  ].join('\n') || '无重要记忆';

  const systemMsg = interpolate(rolePrompt, {
    layer1_rules: worldRules,
    npc_name: npc.name,
    npc_role: npc.role,
    npc_faction: npc.faction,
    npc_id: npc.id,
    traits_json: JSON.stringify(npc.traits),
    bias_json: JSON.stringify(npc.bias),
    trauma: npc.memory.trauma.map((t: any) => `${t.year}年·${t.type}：${t.impact}`).join('\n') || '无',
    key_events: npc.memory.key_events.map((e: any) => `${e.year}年·${e.event_name}`).join('\n') || '无',
    memory_summary: memorySummary,
    voice_features: npc.voice.features.join('、'),
    syntax_rules: npc.voice.syntax_rules.join('；'),
    forbidden: npc.voice.forbidden_phrases.join('、'),
    world_snapshot: snapshot,
    pressure: npc.state.pressure,
    satisfaction: npc.state.satisfaction,
    behavior_modifier: npc.state.behavior_modifier,
    recent_events: npc.state.recent_events.join('、') || '无',
    skills_content: '', // MVP 阶段为空字符串
    command: command || '(无指令)',
    intent: intent.intent,
    intent_raw: intent.raw,
    intent_type: intent.intent,
    targets: intent.targets.join('、'),
    params_json: JSON.stringify(intent.params),
  });

  // ── 3. A 档：角色执行 → DecisionTrace ──
  console.log('[NARRATOR] 准备调用 LLM 进行角色执行');
  const traceRaw = await llmCall('A', [{ role: 'system', content: systemMsg }]);
  console.log('[NARRATOR] 角色执行完成', { traceRaw: traceRaw?.substring(0, 100) });
  let decision = parseJSON<DecisionTrace>(traceRaw);

  if (!decision) {
    decision = {
      npc_id: npc.id,
      interpretation: '（解析失败，使用占位）',
      decision_path: ['无法解析决策路径'],
      motivation: '',
      attitude: '观望',
      final_action: '无应答',
      hidden_action: null,
    };
  }
  decision.npc_id = npc.id;

  // ── 4. A 档：Layer 4 叙事 ──
  console.log('[NARRATOR] 准备调用 LLM 生成叙事');
  const narrationPromptTemplate = loadPrompt('narration');
  const narrationMsg = interpolate(narrationPromptTemplate, {
    world_snapshot: snapshot,
    decision_json: JSON.stringify(decision),
    scene_type: '官员对话',
    style_tags: state.style_state.current_tags.join('、'),
    npc_name: npc.name,
    dynasty: state.world.dynasty,
    tone: state.world.tone,
  });
  const narration = await llmCall('A', [{ role: 'system', content: narrationMsg }]);
  console.log('[NARRATOR] 叙事生成完成', { narration: narration?.substring(0, 100) });

  // ── 5. 组装 ChronicleEntry ──
  const entry: Omit<ChronicleEntry, 'id'> = {
    kind: '列传',
    subject_id: npc.id,
    year_range: [state.world.year, state.world.year],
    text: narration,
    style_tags: state.style_state.current_tags,
    source_logs: [],
    image: null,
    image_prompt: null,
  };

  console.log('[NARRATOR] processCommand 执行完成');
  return { decision, narration, chronicle_entry: entry };
}

// 保留原有的辅助函数，但不再使用
export function buildLayer1Prompt(): string {
  return loadPrompt('layer1-world-rules');
}

export function buildRolePrompt(npc: NPC, _state: GameState, _skills: string): string {
  // 简化版本，实际使用processCommand中的完整逻辑
  return `角色: ${npc.name}, ${npc.role}`;
}

export function buildNarrationPrompt(decision: DecisionTrace, _state: GameState): string {
  // 简化版本
  return `叙事生成: ${JSON.stringify(decision)}`;
}