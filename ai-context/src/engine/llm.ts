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
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(body)
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

  // 记录日志（可选）
  console.log(`[LLM Call] Tag: ${tag}, Layer: ${layer}, Temperature: ${temperature}`);

  try {
    const result = await llmCall(layer, messages, { temperature });
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