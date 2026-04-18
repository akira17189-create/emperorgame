import type { GameState, ChronicleEntry } from '../types';
import { callLLM } from '../llm';
import { buildPrompt } from '../prompt';
import { getSnapshot } from '../state';

export interface NarrationResult {
  success: boolean;
  narration: string;
  chronicle_entry?: Omit<ChronicleEntry, 'id'>;
  error?: string;
  structured_output?: {
    text: string;
    events?: string[];
    mood?: string;
  };
}

/**
 * 生成叙事
 * @param state 游戏状态
 * @param events 事件列表
 * @param arbitrationResult 仲裁结果（可选）
 * @returns 叙事结果
 */
export async function generateNarration(
  state: GameState,
  events: string[],
  arbitrationResult?: any
): Promise<NarrationResult> {
  try {
    // 如果有仲裁结果，使用仲裁叙事
    if (arbitrationResult?.narrative) {
      const chronicleEntry = createChronicleEntry(state, arbitrationResult.narrative, '本纪');
      
      return {
        success: true,
        narration: arbitrationResult.narrative,
        chronicle_entry: chronicleEntry,
        // 统一返回 structured_output（与普通叙事保持一致）
        structured_output: arbitrationResult.structured_output || {
          text: arbitrationResult.narrative,
          events: [],
          mood: '平静'
        }
      };
    }

    // 否则生成普通叙事
    const narration = await generateNormalNarration(state, events);
    const chronicleEntry = createChronicleEntry(state, narration, '列传');

    return {
      success: true,
      narration,
      chronicle_entry: chronicleEntry
    };
  } catch (error) {
    // 降级处理
    const fallbackNarration = generateFallbackNarration(state, events);
    const chronicleEntry = createChronicleEntry(state, fallbackNarration, '列传');

    return {
      success: true,
      narration: fallbackNarration,
      chronicle_entry: chronicleEntry
    };
  }
}

/**
 * 生成普通叙事
 */
async function generateNormalNarration(state: GameState, events: string[]): Promise<any> {
  // 使用新的prompt系统
  const promptInput = {
    state,
    events,
    style: 'normal',
    targetNpc: state.targetNpc // 传递目标NPC信息
  };

  const { system, user } = buildPrompt(promptInput);

  // 修改system prompt，添加结构化输出要求
  const structuredSystem = system + `

【输出格式要求】
必须返回严格的JSON格式，不要包含任何其他文字：
{
  "text": "叙事文本内容",
  "events": ["提取的关键事件1", "提取的关键事件2"],
  "mood": "紧张/平静/压抑/欢快"
}

注意：
1. text字段必须包含完整的叙事文本
2. events数组包含本回合的关键事件（最多3个）
3. mood字段描述当前氛围（只能是：紧张、平静、压抑、欢快之一）
4. 只返回JSON，不要其他内容`;

  try {
    const result = await callLLM({
      system: structuredSystem,
      user,
      temperature: 0.7,
      tag: 'narration'
    });

    // 记录prompt用于调试
    console.log('[NARRATION PROMPT SYSTEM]', structuredSystem);
    console.log('[NARRATION PROMPT USER]', user);
    console.log('[NARRATION RESULT]', result);

    // 尝试解析JSON
    try {
      const parsed = JSON.parse(result);

      // 验证必需字段
      if (parsed.text && typeof parsed.text === 'string') {
        return {
          narration: parsed.text,
          structured_output: {
            text: parsed.text,
            events: Array.isArray(parsed.events) ? parsed.events : [],
            mood: parsed.mood || '平静'
          }
        };
      }
    } catch (parseError) {
      console.warn('JSON解析失败，使用原始文本:', parseError);
    }

    // 如果JSON解析失败，返回原始文本
    return {
      narration: result,
      structured_output: {
        text: result,
        events: [],
        mood: '平静'
      }
    };
  } catch (error) {
    console.error('叙事生成失败:', error);
    const fallback = generateFallbackNarration(state, events);
    return {
      narration: fallback,
      structured_output: {
        text: fallback,
        events: [],
        mood: '平静'
      }
    };
  }
}

/**
 * 生成降级叙事
 */
function generateFallbackNarration(state: GameState, events: string[]): string {
  const year = state.world.year;
  const dynasty = state.world.dynasty;
  const tone = state.world.tone;
  
  // 资源状态描述
  let resourceDesc = '';
  if (state.resources.food < 1000) {
    resourceDesc += '粮食短缺，民生艰难。';
  }
  if (state.resources.fiscal < 2000) {
    resourceDesc += '国库空虚，财政紧张。';
  }
  if (state.resources.morale < 40) {
    resourceDesc += '民心不稳，怨声载道。';
  }
  if (state.resources.faction > 60) {
    resourceDesc += '派系斗争激烈，朝堂动荡。';
  }
  
  // 事件描述
  const eventDesc = events.length > 0 
    ? `本年${events[0]}`
    : '本年无重大事件';
  
  // 官员动态
  const activeNPCs = state.npcs.filter(npc => npc.status === 'active').slice(0, 2);
  const npcDesc = activeNPCs.length > 0
    ? `${activeNPCs.map(npc => npc.name).join('与')}等官员各司其职。`
    : '朝中官员各安其位。';
  
  return `永德${year}年，${dynasty}在${tone}的基调中缓缓前行。

${eventDesc}。${resourceDesc}${npcDesc}

皇帝端坐龙椅，目光深邃。这一年，帝国在${tone}的氛围中继续前行，无论是粮食储备、财政收支还是民心向背，都考验着这位年轻帝王的智慧与决断。新的一年，挑战与机遇并存，帝国的命运将如何发展？`;
}

/**
 * 创建 ChronicleEntry
 */
function createChronicleEntry(
  state: GameState,
  narration: string,
  kind: '本纪' | '列传' | '平准' | '野史'
): Omit<ChronicleEntry, 'id'> {
  return {
    kind,
    year_range: [state.world.year, state.world.year],
    text: narration,
    style_tags: state.style_state.current_tags,
    source_logs: [],
    image: null,
    image_prompt: null
  };
}

/**
 * 检查游戏结束条件
 */
export function checkGameEndConditions(state: GameState): { isEnded: boolean; reason?: string } {
  const r = state.resources;
  if (r.food <= 0 && r.population > 0) {
    return { isEnded: true, reason: '粮食耗尽，饥荒爆发' };
  }
  if (r.morale <= 0) {
    return { isEnded: true, reason: '民心尽失，爆发起义' };
  }
  if (r.military <= 0) {
    return { isEnded: true, reason: '兵力耗尽，外敌入侵' };
  }
  if (r.population <= 0) {
    return { isEnded: true, reason: '人口凋零，国祚断绝' };
  }
  if (r.fiscal <= 0 && r.morale < 20) {
    return { isEnded: true, reason: '国库空竭，百官离散' };
  }
  return { isEnded: false };
}