export interface SceneInput {
  state: any;
  command?: string;
  events?: string[];
  targetNpc?: any;
  intent?: any;
}

export function buildScenePrompt(input: SceneInput): string {
  const { state, command, events = [], targetNpc, intent } = input;
  
  let scenePrompt = '【当前场景】\n\n';
  
  // 1. 基础世界状态
  scenePrompt += '一、世界状态\n';
  scenePrompt += `- 年代：${state.world.year}年（${state.world.dynasty}）\n`;
  scenePrompt += `- 国号：${state.world.dynasty}\n`;
  scenePrompt += `- 皇帝：${state.world.emperor_name || '未知'}\n`;
  scenePrompt += `- 时代基调：${state.world.tone || '中性'}\n`;
  
  // 2. 资源状态
  scenePrompt += '\n二、国家资源\n';
  if (state.resources) {
    scenePrompt += `- 民心：${state.resources.popular_support || 0}/100\n`;
    scenePrompt += `- 国库：${state.resources.treasury || 0}\n`;
    scenePrompt += `- 军力：${state.resources.military || 0}\n`;
    scenePrompt += `- 稳定：${state.resources.stability || 0}/100\n`;
  }
  
  // 3. 当前政策
  if (state.policies?.active?.length > 0) {
    scenePrompt += '\n三、当前政策\n';
    state.policies.active.forEach((policy: any, index: number) => {
      scenePrompt += `${index + 1}. ${policy.name}：${policy.description || '无详细描述'}\n`;
    });
  }
  
  // 4. 玩家指令
  if (command) {
    scenePrompt += '\n四、玩家指令\n';
    scenePrompt += `指令内容：${command}\n`;
    
    if (intent) {
      scenePrompt += `指令解析：\n`;
      scenePrompt += `- 意图类型：${intent.intent || '未知'}\n`;
      if (intent.targets?.length > 0) {
        scenePrompt += `- 目标对象：${intent.targets.join('、')}\n`;
      }
      if (intent.params && Object.keys(intent.params).length > 0) {
        scenePrompt += `- 参数详情：${JSON.stringify(intent.params)}\n`;
      }
    }
  }
  
  // 5. 目标NPC信息（语义人格结构）
  if (targetNpc) {
    scenePrompt += '\n五、目标NPC\n';
    scenePrompt += `- 姓名：${targetNpc.name}\n`;
    scenePrompt += `- 职位：${targetNpc.role}\n`;
    scenePrompt += `- 派系：${targetNpc.faction || '无'}\n`;

    // 长期特质（稳定）
    if (targetNpc.traits?.length > 0) {
      scenePrompt += '\n【长期特质】\n';
      targetNpc.traits.forEach((trait: string) => {
        scenePrompt += `- ${trait}\n`;
      });
    }

    // 当前状态（变化）
    scenePrompt += '\n【当前状态】\n';
    if (targetNpc.state?.recent_events?.length > 0) {
      scenePrompt += `- 近期经历：${targetNpc.state.recent_events.join('；')}\n`;
    }
    if (targetNpc.state?.pressure) {
      scenePrompt += `- 当前压力：${targetNpc.state.pressure}/100\n`;
    }
    if (targetNpc.state?.satisfaction) {
      scenePrompt += `- 满意度：${targetNpc.state.satisfaction}/100\n`;
    }
    if (targetNpc.state?.behavior_modifier) {
      scenePrompt += `- 行为倾向：${targetNpc.state.behavior_modifier}\n`;
    }

    // 目标（当前）
    // 目标（持久状态）
    scenePrompt += '\n【当前目标】\n';
    if (targetNpc.goals?.length > 0) {
      // 按优先级排序显示目标
      const sortedGoals = targetNpc.goals
        .filter(goal => goal.status === 'active')
        .sort((a, b) => b.priority - a.priority);

      if (sortedGoals.length > 0) {
        sortedGoals.forEach(goal => {
          const priorityText = goal.priority >= 0.8 ? '高' : 
                              goal.priority >= 0.5 ? '中' : '低';
          scenePrompt += `- ${goal.description}（优先级：${priorityText}）\n`;
        });
      } else {
        scenePrompt += '- 暂无明确目标\n';
      }
    } else {
      // 如果没有goals字段，使用默认目标
      scenePrompt += '- 维持现有地位\n';
      scenePrompt += '- 执行职责范围内事务\n';
    }
    scenePrompt += '\n【决策倾向】\n';
    if (targetNpc.traits?.includes('谨慎')) {
      scenePrompt += `- 倾向保守决策，避免风险\n`;
    } else if (targetNpc.traits?.includes('冒险')) {
      scenePrompt += `- 倾向激进决策，追求机会\n`;
    } else {
      scenePrompt += `- 倾向平衡决策，权衡利弊\n`;
    }

    if (targetNpc.traits?.includes('忠诚')) {
      scenePrompt += `- 对皇帝忠诚度高，倾向于服从\n`;
    } else if (targetNpc.traits?.includes('野心')) {
      scenePrompt += `- 有较强个人野心，可能追求权力\n`;
    }
  }
    
    if (targetNpc.state?.recent_events?.length > 0) {
      scenePrompt += `- 近期事件：${targetNpc.state.recent_events.join('；')}\n`;
    }
  
  // 6. 当前事件
  if (events.length > 0) {
    scenePrompt += '\n六、待处理事件\n';
    events.forEach((event, index) => {
      scenePrompt += `${index + 1}. ${event}\n`;
    });
  }
  
  // 7. 世界事件
  if (state.world_events?.length > 0) {
    scenePrompt += '\n七、世界动态\n';
    state.world_events.slice(0, 3).forEach((event: any) => {
      scenePrompt += `- ${event.year}年：${event.description}\n`;
    });
  }
  
  // 8. NPC发言指令
  if (targetNpc) {
    scenePrompt += '
八、NPC发言要求
';
    scenePrompt += `请以第三人称描述${targetNpc.name}的发言和举止。
`;
    scenePrompt += `发言应体现其性格特点、职位身份和当前状态。
`;
    scenePrompt += `发言内容应与当前事件和玩家指令相关。
`;
    scenePrompt += `使用适当的文言文或半文言文风格。
`;
  }

  return scenePrompt;
}

export function buildMinimalScenePrompt(state: any, command?: string): string {
  // 构建最小化场景提示，用于简单查询
  let prompt = '【当前状态】\n';
  prompt += `- 年代：${state.world.year}年\n`;
  prompt += `- 民心：${state.resources?.popular_support || 0}\n`;
  prompt += `- 国库：${state.resources?.treasury || 0}\n`;
  
  if (command) {
    prompt += `\n【玩家指令】\n${command}\n`;
  }
  
  return prompt;
}