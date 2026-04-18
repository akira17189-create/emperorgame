export interface MemoryItem {
  year: number;
  event: string;
  importance: 'low' | 'medium' | 'high';
  type: 'fact' | 'event' | 'rumor';
}

export function buildMemoryPrompt(state: any): string {
  // 获取集体记忆
  const collectiveMemories = state?.world?.collective_memory || [];

  // 获取NPC个人记忆（如果有目标NPC）
  const npcMemories: MemoryItem[] = [];
  if (state?.targetNpc) {
    const npc = state.targetNpc;
    if (npc.memory?.key_events) {
      npcMemories.push(...npc.memory.key_events.map((e: any) => ({
        year: e.year,
        event: e.event_name,
        importance: 'high',
        type: 'fact' // 关键事件作为事实
      })));
    }
    if (npc.memory?.trauma) {
      npcMemories.push(...npc.memory.trauma.map((t: any) => ({
        year: t.year,
        event: `${t.type}：${t.impact}`,
        importance: 'high',
        type: 'event' // 创伤作为事件
      })));
    }
  }

  // 合并所有记忆
  const allMemories: MemoryItem[] = [
    ...collectiveMemories.map((m: string, i: number) => ({
      year: state.world.year - (collectiveMemories.length - i),
      event: m,
      importance: 'medium' as const,
      type: 'event' as const // 集体记忆默认为事件
    })),
    ...npcMemories
  ];

  // 按类型分组并限制数量
  const factMemories: MemoryItem[] = [];
  const eventMemories: MemoryItem[] = [];
  const rumorMemories: MemoryItem[] = [];

  allMemories.forEach(memory => {
    switch (memory.type) {
      case 'fact':
        factMemories.push(memory);
        break;
      case 'event':
        eventMemories.push(memory);
        break;
      case 'rumor':
        rumorMemories.push(memory);
        break;
    }
  });

  // 应用限制规则
  const limitedFacts = factMemories.slice(0, 3); // 事实最多3条
  const limitedEvents = eventMemories
    .sort((a, b) => b.year - a.year) // 按时间倒序
    .slice(0, 5); // 事件最多5条（最近的）
  const limitedRumors = rumorMemories.slice(0, 2); // 传闻最多2条

  // 合并限制后的记忆
  const limitedMemories = [...limitedFacts, ...limitedEvents, ...limitedRumors];

  if (limitedMemories.length === 0) {
    return '【历史记忆（仅供参考）】\n暂无相关历史记忆。';
  }

  // 构建记忆提示
  let memoryPrompt = '【历史记忆（仅供参考）】\n';

  // 按类型分组显示
  if (limitedFacts.length > 0) {
    memoryPrompt += '\n事实：\n';
    limitedFacts.forEach(memory => {
      memoryPrompt += `- ${memory.year}年：${memory.event}\n`;
    });
  }

  if (limitedEvents.length > 0) {
    memoryPrompt += '\n事件：\n';
    limitedEvents.forEach(memory => {
      memoryPrompt += `- ${memory.year}年：${memory.event}\n`;
    });
  }

  if (limitedRumors.length > 0) {
    memoryPrompt += '\n传闻：\n';
    limitedRumors.forEach(memory => {
      memoryPrompt += `- ${memory.year}年：${memory.event}\n`;
    });
  }

  return memoryPrompt;
}

export function summarizeMemory(memory: string): string {
  // 对长记忆进行摘要
  if (memory.length > 100) {
    return memory.substring(0, 97) + '...';
  }
  return memory;
}

export function addMemoryToState(state: any, memory: Omit<MemoryItem, 'year'>): void {
  // 添加新记忆到状态
  if (!state.world.collective_memory) {
    state.world.collective_memory = [];
  }

  const newMemory = {
    year: state.world.year,
    ...memory
  };

  state.world.collective_memory.push(newMemory.event);

  // 保持集体记忆不超过20条
  if (state.world.collective_memory.length > 20) {
    state.world.collective_memory = state.world.collective_memory.slice(-20);
  }
}
