import type { GameState, NPC, NPCGoal } from './types';

/**
 * 目标管理器
 * 管理NPC的持久化目标系统
 */
export class GoalsManager {
  private state: GameState;

  constructor(state: GameState) {
    this.state = state;
  }

  /**
   * 获取NPC的目标列表
   * @param npcId NPC ID
   * @returns 目标列表
   */
  getGoals(npcId: string): NPCGoal[] {
    const npc = this.state.npcs.find(n => n.id === npcId);
    return npc?.goals || [];
  }

  /**
   * 添加新目标
   * @param npcId NPC ID
   * @param goal 目标描述
   * @param priority 优先级 (0~1)
   * @returns 新目标
   */
  addGoal(npcId: string, goal: string, priority: number = 0.5): NPCGoal {
    const npc = this.state.npcs.find(n => n.id === npcId);
    if (!npc) {
      throw new Error(`NPC not found: ${npcId}`);
    }

    if (!npc.goals) {
      npc.goals = [];
    }

    const newGoal: NPCGoal = {
      id: `goal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      description: goal,
      priority: Math.max(0, Math.min(1, priority)),
      created_year: this.state.world.year,
      last_updated_year: this.state.world.year,
      status: 'active'
    };

    npc.goals.push(newGoal);
    return newGoal;
  }

  /**
   * 更新目标优先级
   * @param npcId NPC ID
   * @param goalId 目标ID
   * @param priority 新优先级
   * @returns 是否成功
   */
  updateGoalPriority(npcId: string, goalId: string, priority: number): boolean {
    const npc = this.state.npcs.find(n => n.id === npcId);
    if (!npc?.goals) {
      return false;
    }

    const goal = npc.goals.find(g => g.id === goalId);
    if (!goal) {
      return false;
    }

    goal.priority = Math.max(0, Math.min(1, priority));
    goal.last_updated_year = this.state.world.year;
    return true;
  }

  /**
   * 完成目标
   * @param npcId NPC ID
   * @param goalId 目标ID
   * @returns 是否成功
   */
  completeGoal(npcId: string, goalId: string): boolean {
    const npc = this.state.npcs.find(n => n.id === npcId);
    if (!npc?.goals) {
      return false;
    }

    const goal = npc.goals.find(g => g.id === goalId);
    if (!goal) {
      return false;
    }

    goal.status = 'completed';
    goal.progress = 1.0;
    goal.last_updated_year = this.state.world.year;
    return true;
  }

  /**
   * 放弃目标
   * @param npcId NPC ID
   * @param goalId 目标ID
   * @returns 是否成功
   */
  abandonGoal(npcId: string, goalId: string): boolean {
    const npc = this.state.npcs.find(n => n.id === npcId);
    if (!npc?.goals) {
      return false;
    }

    const goal = npc.goals.find(g => g.id === goalId);
    if (!goal) {
      return false;
    }

    goal.status = 'abandoned';
    goal.last_updated_year = this.state.world.year;
    return true;
  }

  /**
   * 根据事件更新目标
   * @param npcId NPC ID
   * @param event 事件描述
   * @param impact 影响程度 (-1~1)
   */
  updateGoalsFromEvent(npcId: string, event: string, impact: number): void {
    const npc = this.state.npcs.find(n => n.id === npcId);
    if (!npc?.goals) {
      return;
    }

    // 根据事件影响调整目标优先级
    npc.goals.forEach(goal => {
      if (goal.status !== 'active') {
        return;
      }

      // 这里可以根据事件类型和目标描述进行更复杂的逻辑
      // 目前简单调整优先级
      const adjustment = impact * 0.1;
      goal.priority = Math.max(0, Math.min(1, goal.priority + adjustment));
      goal.last_updated_year = this.state.world.year;
    });
  }

  /**
   * 获取NPC的主要目标
   * @param npcId NPC ID
   * @returns 主要目标或null
   */
  getPrimaryGoal(npcId: string): NPCGoal | null {
    const goals = this.getGoals(npcId);
    const activeGoals = goals.filter(g => g.status === 'active');

    if (activeGoals.length === 0) {
      return null;
    }

    // 返回优先级最高的目标
    return activeGoals.reduce((highest, current) => 
      current.priority > highest.priority ? current : highest
    );
  }

  /**
   * 初始化NPC的目标
   * @param npcId NPC ID
   * @param traits NPC特质
   */
  initializeGoalsFromTraits(npcId: string, traits: string[]): void {
    const npc = this.state.npcs.find(n => n.id === npcId);
    if (!npc) {
      return;
    }

    // 如果已经有目标，不重新初始化
    if (npc.goals && npc.goals.length > 0) {
      return;
    }

    npc.goals = [];

    // 根据特质生成初始目标
    if (traits.includes('谨慎')) {
      this.addGoal(npcId, '维持现有地位，避免风险', 0.7);
    }
    if (traits.includes('冒险')) {
      this.addGoal(npcId, '寻求晋升机会', 0.6);
    }
    if (traits.includes('忠诚')) {
      this.addGoal(npcId, '效忠皇帝，执行命令', 0.8);
    }
    if (traits.includes('野心')) {
      this.addGoal(npcId, '扩大自身权力', 0.5);
    }

    // 如果没有特质匹配的目标，添加默认目标
    if (npc.goals.length === 0) {
      this.addGoal(npcId, '执行职责范围内事务', 0.5);
    }
  }

  /**
   * 获取所有活跃目标
   * @returns 所有活跃目标
   */
  getAllActiveGoals(): { npcId: string; goals: NPCGoal[] }[] {
    return this.state.npcs
      .filter(npc => npc.status === 'active')
      .map(npc => ({
        npcId: npc.id,
        goals: (npc.goals || []).filter(g => g.status === 'active')
      }))
      .filter(item => item.goals.length > 0);
  }

  /**
   * 获取目标统计信息
   * @returns 统计信息
   */
  getGoalsStatistics(): {
    totalGoals: number;
    activeGoals: number;
    completedGoals: number;
    abandonedGoals: number;
    averagePriority: number;
  } {
    const allGoals = this.state.npcs.flatMap(npc => npc.goals || []);

    const activeGoals = allGoals.filter(g => g.status === 'active');
    const completedGoals = allGoals.filter(g => g.status === 'completed');
    const abandonedGoals = allGoals.filter(g => g.status === 'abandoned');

    const averagePriority = activeGoals.length > 0
      ? activeGoals.reduce((sum, g) => sum + g.priority, 0) / activeGoals.length
      : 0;

    return {
      totalGoals: allGoals.length,
      activeGoals: activeGoals.length,
      completedGoals: completedGoals.length,
      abandonedGoals: abandonedGoals.length,
      averagePriority
    };
  }
}

/**
 * 创建目标管理器实例
 * @param state 游戏状态
 * @returns 目标管理器实例
 */
export function createGoalsManager(state: GameState): GoalsManager {
  return new GoalsManager(state);
}

/**
 * 便捷函数：获取NPC目标
 * @param state 游戏状态
 * @param npcId NPC ID
 * @returns 目标列表
 */
export function getNPCGoals(state: GameState, npcId: string): NPCGoal[] {
  const manager = createGoalsManager(state);
  return manager.getGoals(npcId);
}

/**
 * 便捷函数：添加NPC目标
 * @param state 游戏状态
 * @param npcId NPC ID
 * @param goal 目标描述
 * @param priority 优先级
 * @returns 新目标
 */
export function addNPCGoal(state: GameState, npcId: string, goal: string, priority: number = 0.5): NPCGoal {
  const manager = createGoalsManager(state);
  return manager.addGoal(npcId, goal, priority);
}
