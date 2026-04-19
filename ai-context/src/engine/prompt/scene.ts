import { getVoiceForNPC, buildVoicePrompt, DYNASTY_CONFIG } from '../../data/lore-bridge';

export interface SceneInput {
  state: any;
  command?: string;
  events?: string[];
  targetNpc?: any;
  intent?: any;
}

export function buildScenePrompt(input: SceneInput): string {
  const { state, command, events = [], targetNpc, intent } = input;

  let scene = '【当前场景】\n\n';

  // 一、世界状态（使用正确字段名，并接入DYNASTY_CONFIG）
  const dynastyName = state.world?.dynasty || DYNASTY_CONFIG.name;
  const eraName    = state.world?.era    || DYNASTY_CONFIG.era_name;
  const year       = state.world?.year   || 1;
  scene += `一、世界状态\n`;
  scene += `- 当前年号：${dynastyName}${eraName}${year}年\n`;
  scene += `- 时代基调：${state.world?.tone || DYNASTY_CONFIG.current_tone}\n`;
  scene += `- 天气：${state.world?.weather_this_year >= 0.7 ? '风调雨顺' :
                      state.world?.weather_this_year >= 0.4 ? '普通' : '旱涝不定'}\n`;

  // 二、国家资源（BUG FIX：使用正确字段名）
  // 原版错误：popular_support（不存在）→ 正确：morale
  // 原版错误：treasury（不存在）→ 正确：fiscal
  scene += `\n二、国家资源\n`;
  if (state.resources) {
    const r = state.resources;
    scene += `- 民心：${r.morale ?? 0}/100\n`;         // 修复：morale
    scene += `- 国库：${r.fiscal ?? 0}万两\n`;         // 修复：fiscal
    scene += `- 军力：${r.military ?? 0}\n`;
    scene += `- 粮食：${r.food ?? 0}\n`;
    scene += `- 人口：${r.population ?? 0}\n`;
    scene += `- 商税：${r.commerce ?? 0}\n`;
    scene += `- 宦官势力：${r.eunuch ?? 0}/100\n`;
    scene += `- 外患指数：${r.threat ?? 0}/100\n`;
    scene += `- 派系张力：${r.faction ?? 0}/100\n`;
  }

  // 三、当前活跃政策
  if (state.policies?.active?.length > 0) {
    scene += `\n三、当前政策（${state.policies.active.length}条）\n`;
    state.policies.active.slice(0, 5).forEach((p: any, i: number) => {
      scene += `${i + 1}. ${p.description || p.id}\n`;
    });
  }

  // 四、集体记忆（叙事背景）
  if (state.world?.collective_memory?.length > 0) {
    scene += `\n四、近期重大记忆\n`;
    state.world.collective_memory.slice(-3).forEach((m: string) => {
      scene += `- ${m}\n`;
    });
  }

  // 五、玩家指令
  if (command) {
    scene += `\n五、玩家指令\n`;
    scene += `指令：${command}\n`;
    if (intent) {
      scene += `意图类型：${intent.intent || '未知'}\n`;
      if (intent.targets?.length > 0) scene += `目标：${intent.targets.join('、')}\n`;
    }
  }

  // 六、目标NPC（含voice注入）
  if (targetNpc) {
    scene += `\n六、目标NPC\n`;
    scene += `- 姓名：${targetNpc.name}（${targetNpc.role}）\n`;
    scene += `- 派系：${targetNpc.faction || '中立'}\n`;
    scene += `- 当前压力：${targetNpc.state?.pressure ?? 0}/100\n`;
    scene += `- 对皇帝忠诚：${targetNpc.state?.loyalty_to_emperor ?? 50}/100\n`;
    scene += `- 行为倾向：${targetNpc.state?.behavior_modifier || '正常'}\n`;

    // 注入voice数据（从lore-bridge获取完整版）
    const voice = getVoiceForNPC(targetNpc.id, targetNpc.voice);
    scene += buildVoicePrompt(voice, targetNpc.name);

    // 当前目标
    const activeGoals = targetNpc.goals?.filter((g: any) => g.status === 'active')
      .sort((a: any, b: any) => b.priority - a.priority)
      .slice(0, 2);
    if (activeGoals?.length > 0) {
      scene += `\n【当前目标】\n`;
      activeGoals.forEach((g: any) => {
        scene += `- ${g.description}（优先级：${g.priority >= 0.8 ? '高' : g.priority >= 0.5 ? '中' : '低'}）\n`;
      });
    }

    scene += `\n【NPC发言要求】\n`;
    scene += `以第三人称描述${targetNpc.name}的发言和举止。\n`;
    scene += `必须体现上述【说话风格】的句式规则，绝对不能使用【绝对禁止使用】的表达。\n`;
    scene += `发言不超过80字，言辞背后要有他自己的算计。\n`;
  }

  // 七、待处理事件
  if (events.length > 0) {
    scene += `\n七、待处理事件\n`;
    events.forEach((e, i) => { scene += `${i + 1}. ${e}\n`; });
  }

  return scene;
}

export function buildMinimalScenePrompt(state: any, command?: string): string {
  const r = state.resources || {};
  let prompt = `【状态摘要】${state.world?.dynasty || '靖朝'}${state.world?.year || 1}年\n`;
  prompt += `民心：${r.morale ?? 0} 国库：${r.fiscal ?? 0} 军力：${r.military ?? 0}\n`;
  if (command) prompt += `\n【指令】${command}\n`;
  return prompt;
}
