import { SKILLS_BUNDLE } from '../data/skills-bundle';
import type { GameState } from './types';

// SKILL_ROUTES 常量 - 基于 knowledge-base/skill_routing_supplement.md 生成
export const SKILL_ROUTES: Record<string, string[]> = {
  // 意图类型: [技能ID列表] - 每个意图最多3个技能，避免token超限
  '加税': ['political_communication_strategy', 'personnel_management_principles', 'ming_tax_allocation_analysis'],
  '减税': ['political_communication_strategy', 'personnel_management_principles', 'ming_tax_allocation_analysis'],
  '调兵': ['ming_dynasty_crisis_command', 'military_strategy_and_defense', 'qi_jiguang_tactical_command'],
  '任命': ['political_communication_strategy', 'personnel_management_principles', 'internal_politics_and_nobility_management'],
  '赦免': ['political_communication_strategy', 'personnel_management_principles', 'imperial_decree_execution'],
  '征召': ['ming_dynasty_crisis_command', 'military_strategy_and_defense', 'defense_and_military_preparedness'],
  '修筑': ['political_communication_strategy', 'personnel_management_principles', 'ming_tax_allocation_analysis'],
  '禁令': ['imperial_decree_execution', 'official_deception_evidence_analysis'],
  '下诏': ['imperial_decree_execution', 'official_deception_evidence_analysis'],
  '其他': ['political_communication_strategy', 'personnel_management_principles', 'imperial_decree_execution']
};

/**
 * 技能效果接口
 */
export interface SkillEffect {
  type: 'add_flag' | 'modify_resource' | 'modify_npc_state' | 'add_event' | 'add_memory';
  key: string;
  value: any;
  target?: string; // 对于NPC状态修改，指定NPC ID
  description?: string;
}

/**
 * 技能应用结果
 */
export interface SkillApplicationResult {
  success: boolean;
  effects: SkillEffect[];
  skillId: string;
  error?: string;
}

/**
 * 应用技能（只返回效果，不直接修改状态）
 * @param skillId 技能ID
 * @param state 游戏状态
 * @param params 技能参数
 * @returns 技能应用结果
 */
export function applySkill(
  skillId: string,
  state: GameState,
  params: Record<string, any> = {}
): SkillApplicationResult {
  try {
    // 获取技能内容
    const skillContent = getSkillContent(skillId);
    if (!skillContent) {
      return {
        success: false,
        effects: [],
        skillId,
        error: `技能不存在: ${skillId}`
      };
    }

    // 根据技能ID生成效果
    const effects = generateSkillEffects(skillId, state, params);

    return {
      success: true,
      effects,
      skillId
    };
  } catch (error) {
    return {
      success: false,
      effects: [],
      skillId,
      error: `技能应用失败: ${error instanceof Error ? error.message : '未知错误'}`
    };
  }
}

/**
 * 根据技能ID生成效果
 */
function generateSkillEffects(
  skillId: string,
  state: GameState,
  params: Record<string, any>
): SkillEffect[] {
  const effects: SkillEffect[] = [];

  // 根据技能ID生成不同的效果
  switch (skillId) {
    case 'tax_increase':
      effects.push({
        type: 'modify_resource',
        key: 'fiscal',
        value: Math.round(state.resources.fiscal * 0.15),
        description: '财政收入增加15%'
      });
      effects.push({
        type: 'modify_resource',
        key: 'morale',
        value: -10,
        description: '民心下降10点'
      });
      effects.push({
        type: 'modify_resource',
        key: 'commerce',
        value: -5,
        description: '商业下降5点'
      });
      break;

    case 'tax_decrease':
      effects.push({
        type: 'modify_resource',
        key: 'fiscal',
        value: -Math.round(state.resources.fiscal * 0.10),
        description: '财政收入减少10%'
      });
      effects.push({
        type: 'modify_resource',
        key: 'morale',
        value: 15,
        description: '民心上升15点'
      });
      effects.push({
        type: 'modify_resource',
        key: 'commerce',
        value: 8,
        description: '商业上升8点'
      });
      break;

    case 'military_move':
      effects.push({
        type: 'modify_resource',
        key: 'military_cost',
        value: 50,
        description: '军费增加50'
      });
      effects.push({
        type: 'add_flag',
        key: 'border_defense_increased',
        value: true,
        description: '边境防御增强'
      });
      break;

    case 'appointment':
      effects.push({
        type: 'add_event',
        key: 'official_appointed',
        value: params.target || '官员',
        description: '任命新官员'
      });
      break;

    case 'pardon':
      effects.push({
        type: 'modify_resource',
        key: 'morale',
        value: 10,
        description: '民心上升10点'
      });
      effects.push({
        type: 'modify_resource',
        key: 'faction',
        value: -5,
        description: '派系张力下降5点'
      });
      break;

    case 'conscription':
      effects.push({
        type: 'modify_resource',
        key: 'military',
        value: 500,
        description: '兵力增加500'
      });
      effects.push({
        type: 'modify_resource',
        key: 'population',
        value: -300,
        description: '人口减少300'
      });
      effects.push({
        type: 'modify_resource',
        key: 'agri_pop',
        value: -200,
        description: '农业人口减少200'
      });
      break;

    case 'construction':
      effects.push({
        type: 'modify_resource',
        key: 'fiscal',
        value: -1000,
        description: '财政支出1000'
      });
      effects.push({
        type: 'add_flag',
        key: 'infrastructure_improved',
        value: true,
        description: '基础设施改善'
      });
      break;

    default:
      // 通用效果
      effects.push({
        type: 'add_event',
        key: 'skill_applied',
        value: skillId,
        description: `应用技能: ${skillId}`
      });
      break;
  }

  return effects;
}

/**
 * 应用效果到游戏状态
 * @param state 游戏状态
 * @param effects 效果列表
 * @returns 更新后的游戏状态
 */
export function applyEffects(state: GameState, effects: SkillEffect[]): GameState {
  const newState = JSON.parse(JSON.stringify(state)) as GameState;

  for (const effect of effects) {
    try {
      switch (effect.type) {
        case 'modify_resource':
          if (effect.key in newState.resources) {
            const currentValue = (newState.resources as Record<string, number>)[effect.key] ?? 0;
            (newState.resources as Record<string, number>)[effect.key] = Math.max(0, currentValue + effect.value);
          }
          break;

        case 'modify_npc_state':
          if (effect.target) {
            const npc = newState.npcs.find(n => n.id === effect.target);
            if (npc && effect.key in npc.state) {
              const currentValue = (npc.state as Record<string, any>)[effect.key] ?? 0;
              if (typeof currentValue === 'number') {
                (npc.state as Record<string, any>)[effect.key] = Math.max(0, Math.min(100, currentValue + effect.value));
              }
            }
          }
          break;

        case 'add_flag':
          // 这里可以扩展标志系统
          console.log(`[Skill Effect] 添加标志: ${effect.key} = ${effect.value}`);
          break;

        case 'add_event':
          newState.events.raw_logs.push({
            year: newState.world.year,
            kind: 'skill_effect',
            payload: {
              skill_effect: effect,
              description: effect.description
            }
          });
          break;

        case 'add_memory':
          newState.world.collective_memory.push(`${newState.world.year}年：${effect.description}`);
          if (newState.world.collective_memory.length > 20) {
            newState.world.collective_memory = newState.world.collective_memory.slice(-20);
          }
          break;

        default:
          console.warn(`[Skill Effect] 未知效果类型: ${effect.type}`);
      }
    } catch (error) {
      console.error(`[Skill Effect] 应用效果失败:`, effect, error);
    }
  }

  return newState;
}

/**
 * 获取技能内容
 */
export function getSkillContent(skillId: string): string {
  // 1. 首先尝试直接查找
  if (SKILLS_BUNDLE[skillId]) {
    return SKILLS_BUNDLE[skillId].content || '';
  }

  // 2. 作为最后手段，使用简化的占位内容
  const fallbackContent: Record<string, string> = {
    // 知识库技能 - 基于 skill_routing_supplement.md
    'political_communication_strategy': '官场说话方式、皇帝反话识别：官员与皇帝对话时的潜规则与暗示解读。如何识别官员的真实意图，避免被表面言辞蒙蔽。',
    'personnel_management_principles': '君臣忠诚评估、恩义义务：评估官员忠诚度，平衡恩宠与威慑。如何识别官员的真实忠诚度，建立有效的激励机制。',
    'ming_tax_allocation_analysis': '明代税收分配分析：土地税、人头税、商税的分配原则与地方执行差异。如何平衡中央与地方的税收利益。',
    'ming_dynasty_crisis_command': '明代危机指挥：边境失陷连锁预测与应急指挥体系。如何建立有效的危机预警和响应机制。',
    'military_strategy_and_defense': '军事战略与防御：军队调动、布防、补给的后勤考量。如何平衡进攻与防御，建立有效的军事防御体系。',
    'qi_jiguang_tactical_command': '戚继光战术指挥：鸳鸯阵、车营、火器运用的具体战术。如何在实战中运用这些战术取得胜利。',
    'internal_politics_and_nobility_management': '内部政治与贵族管理：外戚、宗室、功臣的权力平衡。如何平衡各方势力，维护皇权稳定。',
    'imperial_decree_execution': '皇帝意图揣摩与圣旨执行：解读圣旨深层意图，确保政策落地。如何确保官员正确理解和执行皇帝的命令。',
    'official_deception_evidence_analysis': '识别地方官员瞒报：税收、人口、灾情的瞒报识别技巧。如何发现官员的欺瞒行为，建立有效的监督机制。',
    'defense_and_military_preparedness': '防御与军事准备：边境防务、民兵训练、武器储备。如何建立全面的防御体系，提高国家军事能力。',
    'ming_agrarian_survival_calculation': '明代农民生存计算：粮食产量、税收负担、生存临界点。如何制定合理的农业政策，保障农民基本生存。',
    'security_and_military_strategy': '安全与军事战略：国家安全评估、军事威胁应对。如何制定全面的国家安全战略，应对内外威胁。',

    // 原始占位技能（向后兼容）
    'tax_increase': '增加税收：提高税率以增加财政收入。执行条件：税率<30%，民心>40，财政<10000。效果：财政+15%，民心-10%，商业-5%。风险：民心过低可能引发骚乱，商业受损影响长期税收。',
    'tax_decrease': '减少税收：降低税率以安抚民心。执行条件：税率>5%，财政>2000。效果：财政-10%，民心+15%，商业+8%。风险：财政收入减少，可能影响军事投入。',
    'military_move': '调动军队：调动军队到指定位置。执行条件：兵力>1000，军费>100。效果：兵力重新部署，军费-50，威慑力+20%。风险：边防空虚，军费增加。',
    'appointment': '任命官员：任命或提拔官员。执行条件：有空缺职位，候选人合适。效果：行政效率+10%，相关派系忠诚度变化。风险：派系斗争加剧，官员能力不足。',
    'pardon': '赦免罪犯：赦免罪犯以显示仁慈。执行条件：有在押罪犯，威望>30。效果：民心+10%，威望+5%，治安-5%。风险：犯罪率上升，受害者不满。',
    'conscription': '征召士兵：征召平民入伍。执行条件：人口>5000，民心>50。效果：兵力+500，人口-300，农业人口-200。风险：农业生产受影响，民心下降。',
    'construction': '修筑建筑：修筑城墙、道路等基础设施。执行条件：财政>2000，人口>3000。效果：防御力+15%，商业+10%，财政-1000。风险：财政压力，劳役过重。',
    'prohibition': '颁布禁令：颁布特定行为的禁令。执行条件：威望>40，行政效率>50。效果：相关行为减少，可能影响特定群体。风险：黑市滋生，民众不满。',
    'decree': '下达诏书：发布皇帝诏书。执行条件：威望>30。效果：政策实施，官僚系统执行。风险：执行不力，阳奉阴违。',
    'general': '通用处理：处理未分类的指令。执行条件：无特殊条件。效果：根据具体情况处理。风险：处理不当。'
  };

  return fallbackContent[skillId] || '';
}

/**
 * 批量应用技能效果
 */
export function batchApplySkills(
  skillIds: string[],
  state: GameState,
  params: Record<string, any> = {}
): { finalState: GameState; allEffects: SkillEffect[] } {
  let currentState = state;
  const allEffects: SkillEffect[] = [];

  for (const skillId of skillIds) {
    const result = applySkill(skillId, currentState, params);
    if (result.success) {
      currentState = applyEffects(currentState, result.effects);
      allEffects.push(...result.effects);
    }
  }

  return { finalState: currentState, allEffects };
}