export { buildSystemPrompt } from './system';
export { buildStylePrompt, getStyleFromState, NarrativeStyle } from './style';
export { buildMemoryPrompt, summarizeMemory, MemoryItem } from './memory';
export { buildScenePrompt, buildMinimalScenePrompt, SceneInput } from './scene';

import { buildSystemPrompt } from './system';
import { buildStylePrompt, getStyleFromState, NarrativeStyle } from './style';
import { buildMemoryPrompt } from './memory';
import { buildScenePrompt, SceneInput } from './scene';

export interface PromptInput {
  state: any;
  command?: string;
  events?: string[];
  targetNpc?: any;
  intent?: any;
  style?: NarrativeStyle;
}

export interface BuiltPrompt {
  system: string;
  user: string;
  layers: {
    system: string;
    style: string;
    memory: string;
    scene: string;
  };
}

export function buildPrompt(input: PromptInput): BuiltPrompt {
  const { state, command, events, targetNpc, intent, style } = input;
  
  // 1. 构建SYSTEM层（世界规则）
  const systemLayer = buildSystemPrompt();
  
  // 2. 构建STYLE层（文风）
  const detectedStyle = style || getStyleFromState(state);
  const styleLayer = buildStylePrompt(detectedStyle);
  
  // 3. 构建MEMORY层（历史记忆）
  const memoryLayer = buildMemoryPrompt(state);
  
  // 4. 构建SCENE层（当前场景）
  const sceneLayer = buildScenePrompt({
    state,
    command,
    events,
    targetNpc,
    intent
  });
  
  // 5. 组合system prompt
  const system = [
    systemLayer,
    styleLayer,
    memoryLayer
  ].join('\n\n');
  
  // 6. 组合user prompt
  const user = sceneLayer;
  
  return {
    system,
    user,
    layers: {
      system: systemLayer,
      style: styleLayer,
      memory: memoryLayer,
      scene: sceneLayer
    }
  };
}

export function buildDebugPrompt(input: PromptInput): BuiltPrompt {
  // 构建带调试信息的prompt
  const result = buildPrompt(input);
  
  // 添加调试标记
  const debugSystem = `【DEBUG MODE】\n${result.system}`;
  
  return {
    ...result,
    system: debugSystem
  };
}

export function validatePromptLayers(prompt: BuiltPrompt): boolean {
  // 验证prompt各层是否有效
  if (!prompt.system || prompt.system.length < 10) {
    console.error('SYSTEM层过短或为空');
    return false;
  }
  
  if (!prompt.user || prompt.user.length < 10) {
    console.error('SCENE层过短或为空');
    return false;
  }
  
  if (!prompt.layers.system.includes('规则')) {
    console.warn('SYSTEM层可能缺少规则定义');
  }
  
  return true;
}

export function extractPromptMetadata(prompt: BuiltPrompt): any {
  // 提取prompt元数据，用于调试和日志
  return {
    systemLength: prompt.system.length,
    userLength: prompt.user.length,
    hasMemory: prompt.layers.memory.includes('历史记忆'),
    hasStyle: prompt.layers.style.includes('文风要求'),
    hasScene: prompt.layers.scene.includes('当前场景'),
    timestamp: new Date().toISOString()
  };
}