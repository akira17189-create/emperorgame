import { SKILLS_BUNDLE } from '../data/skills-bundle';

// SKILL_ROUTES 常量（占位，待 mimo 素材填充）
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
};// 获取技能内容
export function getSkillContent(skillId: string): string {
  // 1. 首先尝试直接查找
  if (SKILLS_BUNDLE[skillId]) {
    return SKILLS_BUNDLE[skillId].content || '';
  }

  // 2. 如果直接查找失败，尝试兼容性查找
  // 注意：skill_routing_supplement.md 中的技能ID是短横线格式，
  // 而 skills-bundle.ts 中的技能ID是下划线格式，但我们已经做了转换

  // 3. 作为最后手段，使用简化的占位内容
  const fallbackContent: Record<string, string> = {
    // 知识库技能 - 基于 skill_routing_supplement.md
    'political_communication_strategy': '官场说话方式、皇帝反话识别：官员与皇帝对话时的潜规则与暗示解读。',
    'personnel_management_principles': '君臣忠诚评估、恩义义务：评估官员忠诚度，平衡恩宠与威慑。',
    'ming_tax_allocation_analysis': '明代税收分配分析：土地税、人头税、商税的分配原则与地方执行差异。',
    'ming_dynasty_crisis_command': '明代危机指挥：边境失陷连锁预测与应急指挥体系。',
    'military_strategy_and_defense': '军事战略与防御：军队调动、布防、补给的后勤考量。',
    'qi_jiguang_tactical_command': '戚继光战术指挥：鸳鸯阵、车营、火器运用的具体战术。',
    'internal_politics_and_nobility_management': '内部政治与贵族管理：外戚、宗室、功臣的权力平衡。',
    'imperial_decree_execution': '皇帝意图揣摩与圣旨执行：解读圣旨深层意图，确保政策落地。',
    'official_deception_evidence_analysis': '识别地方官员瞒报：税收、人口、灾情的瞒报识别技巧。',
    'defense_and_military_preparedness': '防御与军事准备：边境防务、民兵训练、武器储备。',
    'ming_agrarian_survival_calculation': '明代农民生存计算：粮食产量、税收负担、生存临界点。',
    'security_and_military_strategy': '安全与军事战略：国家安全评估、军事威胁应对。',

    // 原始占位技能（向后兼容）
    'tax_increase': '增加税收的技能内容',
    'tax_decrease': '减少税收的技能内容', 
    'military_move': '调动军队的技能内容',
    'appointment': '任命官员的技能内容',
    'pardon': '赦免罪犯的技能内容',
    'conscription': '征召士兵的技能内容',
    'construction': '修筑建筑的技能内容',
    'prohibition': '颁布禁令的技能内容',
    'decree': '下达诏书的技能内容',
    'general': '通用处理技能内容'
  };

  return fallbackContent[skillId] || '';
}