import type { LLMConfig } from './types';

export type LLMLayer = 'A' | 'B';

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export class NoLLMConfigError extends Error {
  constructor() {
    super('LLM configuration not found. Please configure LLM settings first.');
    this.name = 'NoLLMConfigError';
  }
}

export class LLMNetworkError extends Error {
  constructor(
    message: string,
    public status: number,
    public statusText: string
  ) {
    super(message);
    this.name = 'LLMNetworkError';
  }
}

const LLM_CONFIG_KEY = 'llm_config';

export async function llmCall(
  layer: LLMLayer,
  messages: ChatMessage[],
  opts?: { maxTokens?: number; temperature?: number }
): Promise<string> {
  const config = getLLMConfig();
  if (!config) {
    throw new NoLLMConfigError();
  }

  const model = layer === 'A' ? config.modelMain : (config.modelCheap || config.modelMain);
  const maxTokens = opts?.maxTokens ?? config.maxTokens;
  const temperature = opts?.temperature ?? config.temperature;

  console.log(`[LLM] 开始调用`, { 
    layer, 
    model, 
    messagesCount: messages.length,
    firstMessage: messages[0]?.content?.substring(0, 50),
    baseURL: config.baseURL
  });

  // Normalize baseURL: strip any trailing /chat/completions the user may have pasted
  const normalizedBase = config.baseURL
    .replace(/\/chat\/completions\/?$/, '')
    .replace(/\/$/, '');

  // In dev/preview mode route through the Vite proxy to bypass CORS.
  // The proxy strips /api-proxy and forwards to the origin configured in .env.local.
  let url: string;
  if (import.meta.env.DEV || import.meta.env.MODE === 'preview') {
    try {
      const parsed = new URL(normalizedBase);
      url = `/api-proxy${parsed.pathname}/chat/completions`;
    } catch {
      url = `${normalizedBase}/chat/completions`;
    }
  } else {
    url = `${normalizedBase}/chat/completions`;
  }
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  };

  // 根据 provider 设置认证头
  switch (config.provider) {
    case 'openai':
      headers['Authorization'] = `Bearer ${config.apiKey}`;
      break;
    case 'anthropic':
      headers['x-api-key'] = config.apiKey;
      headers['anthropic-version'] = '2023-06-01';
      break;
    case 'custom':
    default:
      headers['Authorization'] = `Bearer ${config.apiKey}`;
      break;
  }

  const body = {
    model,
    messages,
    max_tokens: maxTokens,
    temperature
  };

  try {
    const startTime = Date.now();
    console.log(`[LLM] 发送请求`, { url, model, maxTokens, temperature });

    // 添加超时处理 (60秒)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000);

    const response = await fetch(url, {
      signal: controller.signal,
      method: 'POST',
      headers,
      body: JSON.stringify(body)
    });

    clearTimeout(timeoutId);
    const endTime = Date.now();
    console.log(`[LLM] 请求完成`, { 
      status: response.status, 
      duration: `${endTime - startTime}ms` 
    });

    if (!response.ok) {
      throw new LLMNetworkError(
        `LLM request failed: ${response.status} ${response.statusText}`,
        response.status,
        response.statusText
      );
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    if (error instanceof LLMNetworkError) {
      throw error;
    }
    
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new LLMNetworkError(
        `Network error: ${error.message}`,
        0,
        'Network Error'
      );
    }
    
    throw error;
  }
}

export function getLLMConfig(): LLMConfig | null {
  try {
    const configStr = localStorage.getItem(LLM_CONFIG_KEY);
    if (!configStr) {
      return null;
    }
    return JSON.parse(configStr) as LLMConfig;
  } catch {
    return null;
  }
}

export function setLLMConfig(config: LLMConfig): void {
  localStorage.setItem(LLM_CONFIG_KEY, JSON.stringify(config));
}

export function clearLLMConfig(): void {
  localStorage.removeItem(LLM_CONFIG_KEY);
}/**
 * 统一的LLM调用入口
 * 所有地方必须使用此函数调用LLM，禁止直接拼prompt + fetch
 */
export async function callLLM({
  system,
  user,
  temperature = 0.7,
  tag = 'general'
}: {
  system: string;
  user: string;
  temperature?: number;
  tag?: string;
}): Promise<string> {
  const messages: ChatMessage[] = [
    { role: 'system', content: system },
    { role: 'user', content: user }
  ];

  // 根据tag选择layer
  const layer: LLMLayer = tag === 'narration' ? 'A' : 'B';

  // 记录日志
  console.log(`[LLM Call] Tag: ${tag}, Layer: ${layer}, Temperature: ${temperature}`, {
    systemLength: system?.length,
    userLength: user?.length,
    systemPreview: system?.substring(0, 100),
    userPreview: user?.substring(0, 100)
  });

  try {
    const startTime = Date.now();
    const result = await llmCall(layer, messages, { temperature });
    const endTime = Date.now();
    console.log(`[LLM Call] 成功`, { 
      tag, 
      layer, 
      duration: `${endTime - startTime}ms`,
      resultLength: result?.length,
      resultPreview: result?.substring(0, 100)
    });
    return result;
  } catch (error) {
    console.error(`[LLM Call Failed] Tag: ${tag}, Error:`, error);
    throw error;
  }
}

/**
 * 带重试机制的LLM调用
 */
export async function callLLMWithRetry({
  system,
  user,
  temperature = 0.7,
  tag = 'general',
  maxRetries = 2
}: {
  system: string;
  user: string;
  temperature?: number;
  tag?: string;
  maxRetries?: number;
}): Promise<string> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await callLLM({ system, user, temperature, tag });
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      
      if (attempt < maxRetries) {
        // 等待一段时间后重试
        const delay = Math.pow(2, attempt) * 1000; // 指数退避
        console.log(`[LLM Retry] Attempt ${attempt + 1} failed, retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError || new Error('LLM call failed after retries');
}

/**
 * 批量LLM调用（用于并行处理多个请求）
 */
export async function batchCallLLM(
  requests: Array<{
    system: string;
    user: string;
    temperature?: number;
    tag?: string;
  }>
): Promise<string[]> {
  const promises = requests.map(request => callLLM(request));
  return Promise.all(promises);
}
// [改造-Phase4] 场景锚点类型
export interface SceneAnchor {
  dynastyName: string;
  year: number;
  season: string;
  activeAgenda: string;
  emperorMood: string;  // 简短描述，如"威严"/"忧虑"
  presentNpcNames: string[];
}

// [改造-Phase4] 从 GameState 构建场景锚点
export function buildSceneAnchor(state: GameState, activeAgenda: string): SceneAnchor {
  const seasonMap = ['冬', '春', '夏', '秋'];
  const season = seasonMap[state.world.year % 4];
  const prestige = state.emperor.prestige;
  const emperorMood = prestige > 70 ? '威严' : prestige > 40 ? '平稳' : '忧虑';
  return {
    dynastyName: state.world.dynasty || '靖朝',
    year: state.world.year,
    season,
    activeAgenda,
    emperorMood,
    presentNpcNames: state.npcs
      .filter(n => n.status === 'active')
      .map(n => n.name),
  };
}

// [改造-Phase4] 追问窗口专用 LLM 调用（带场景锚点注入）
export async function callWithSceneAnchor(opts: {
  systemPromptTemplate: string;   // npc-chat-window.md 内容，含 {{变量}} 占位符
  npcData: {
    name: string; role: string; faction: string;
    traitsJson: string;           // JSON.stringify(npc.traits)
    voiceFeatures: string;        // npc.voice.features.join('、')
    forbiddenPhrases: string;     // npc.voice.forbidden_phrases.join('、')
    biasJson: string;             // JSON.stringify(npc.bias)
    knowledgeScope: string;       // 基于 role 和 bias 推断，传入字符串
    refusalTemplates: string;     // fallback_line 等
    fallbackLine: string;
  };
  sceneAnchor: SceneAnchor;
  history: Array<{ role: 'user' | 'assistant'; content: string }>;
  userMessage: string;
  turnIndex: number;              // 0-based，第2轮（index=2）强制 allows_followup=false
}): Promise<{ dialogue: string; emotion: string; allows_followup: boolean }> {
  // 1. 替换 system prompt 里所有 {{变量}} 占位符
  let systemPrompt = opts.systemPromptTemplate
    .replace(/\{\{dynasty_name\}\}/g, opts.sceneAnchor.dynastyName)
    .replace(/\{\{year\}\}/g, String(opts.sceneAnchor.year))
    .replace(/\{\{npc_name\}\}/g, opts.npcData.name)
    .replace(/\{\{npc_role\}\}/g, opts.npcData.role)
    .replace(/\{\{npc_faction\}\}/g, opts.npcData.faction)
    .replace(/\{\{npc_traits_summary\}\}/g, opts.npcData.traitsJson)
    .replace(/\{\{npc_voice_features\}\}/g, opts.npcData.voiceFeatures)
    .replace(/\{\{npc_forbidden_phrases\}\}/g, opts.npcData.forbiddenPhrases)
    .replace(/\{\{npc_bias\}\}/g, opts.npcData.biasJson)
    .replace(/\{\{current_agenda\}\}/g, opts.sceneAnchor.activeAgenda)
    .replace(/\{\{npc_stance\}\}/g, '')   // CourtAgenda.npc_stances[x].stance
    .replace(/\{\{npc_knowledge_scope\}\}/g, opts.npcData.knowledgeScope)
    .replace(/\{\{refusal_templates\}\}/g, opts.npcData.refusalTemplates);

  // 2. 每条 user 消息前注入场景锚（防止 AI 忘记在哪）
  const anchorPrefix = `[当前场景：${opts.sceneAnchor.dynastyName}${opts.sceneAnchor.year}年${opts.sceneAnchor.season}季，朝会议题：${opts.sceneAnchor.activeAgenda}，皇帝情绪：${opts.sceneAnchor.emperorMood}]`;

  const messages: ChatMessage[] = [
    { role: 'system', content: systemPrompt },
    ...opts.history,
    { role: 'user', content: `${anchorPrefix}\n${opts.userMessage}` },
  ];

  // 3. 调用 LLM（追问窗口用 A 档，maxTokens 限制在 400）
  let raw: string;
  try {
    raw = await llmCall('A', messages, { maxTokens: 400, temperature: 0.7 });
  } catch {
    return { dialogue: opts.npcData.fallbackLine, emotion: '平静', allows_followup: false };
  }

  // 4. 解析 JSON
  const jsonMatch = raw.match(/\{[\s\S]*?\}/);
  if (!jsonMatch) {
    return { dialogue: opts.npcData.fallbackLine, emotion: '平静', allows_followup: false };
  }
  try {
    const parsed = JSON.parse(jsonMatch[0]) as {
      dialogue?: string; emotion?: string; allows_followup?: boolean;
    };
    return {
      dialogue: parsed.dialogue || opts.npcData.fallbackLine,
      emotion: parsed.emotion || '平静',
      // 第3轮（turnIndex >= 2）强制关闭追问
      allows_followup: opts.turnIndex >= 2 ? false : (parsed.allows_followup ?? true),
    };
  } catch {
    return { dialogue: opts.npcData.fallbackLine, emotion: '平静', allows_followup: false };
  }
}
