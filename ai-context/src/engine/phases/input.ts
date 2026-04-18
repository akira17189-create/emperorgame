import type { GameState } from '../types';

export interface InputResult {
  success: boolean;
  processedCommand: string;
  targetNpcId?: string;
  error?: string;
}

/**
 * 处理玩家输入
 * @param state 游戏状态
 * @param command 玩家指令
 * @returns 处理结果
 */
export function handlePlayerInput(state: GameState, command: string): InputResult {
  // 基本验证
  if (!command || command.trim() === '') {
    return {
      success: false,
      processedCommand: '',
      error: '指令不能为空'
    };
  }

  // 清理指令
  const processedCommand = command.trim();

  // 查找目标NPC（如果有指定）
  let targetNpcId: string | undefined;
  
  // 简单的NPC识别逻辑
  const npcKeywords = state.npcs.map(npc => npc.name);
  for (const npc of state.npcs) {
    if (processedCommand.includes(npc.name)) {
      targetNpcId = npc.id;
      break;
    }
  }

  // 如果没有指定NPC，使用第一个活跃NPC
  if (!targetNpcId) {
    const activeNpc = state.npcs.find(npc => npc.status === 'active');
    if (activeNpc) {
      targetNpcId = activeNpc.id;
    }
  }

  return {
    success: true,
    processedCommand,
    targetNpcId
  };
}

/**
 * 验证指令格式
 * @param command 指令
 * @returns 是否有效
 */
export function validateCommand(command: string): boolean {
  // 基本长度检查
  if (command.length > 500) {
    return false;
  }
  
  // 检查是否包含敏感词（简单示例）
  const forbiddenWords = ['删除', '格式化', '清空'];
  for (const word of forbiddenWords) {
    if (command.includes(word)) {
      return false;
    }
  }
  
  return true;
}