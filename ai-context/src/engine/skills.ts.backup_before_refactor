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

    // 原始占位技能（向后兼容）- 基于skills-bundle.ts扩展
    'tax_increase': '增加税收：提高税率以增加财政收入。执行条件：税率<30%，民心>40，财政<10000。效果：财政+15%，民心-10%，商业-5%。风险：民心过低可能引发骚乱，商业受损影响长期税收。',
    'tax_decrease': '减少税收：降低税率以安抚民心。执行条件：税率>5%，财政>2000。效果：财政-10%，民心+15%，商业+8%。风险：财政收入减少，可能影响军事投入。',
    'military_move': '调动军队：调动军队到指定位置。执行条件：兵力>1000，军费>100。效果：兵力重新部署，军费-50，威慑力+20%。风险：边防空虚，军费增加。',
    'appointment': '任命官员：任命或提拔官员。执行条件：有空缺职位，候选人合适。效果：行政效率+10%，相关派系忠诚度变化。风险：派系斗争加剧，官员能力不足。',
    'pardon': '赦免罪犯：赦免罪犯以显示仁慈。执行条件：有在押罪犯，威望>30。效果：民心+10%，威望+5%，治安-5%。风险：犯罪率上升，受害者不满。',
    'conscription': '征召士兵：征召平民入伍。执行条件：人口>5000，民心>50。效果：兵力+500，人口-300，农业人口-200。风险：农业生产受影响，民心下降。',
    'construction': '修筑建筑：修筑城墙、道路等基础设施。执行条件：财政>2000，人口>3000。效果：防御力+15%，商业+10%，财政-1000。风险：财政压力，劳役过重。',
    'prohibition': '颁布禁令：颁布特定行为的禁令。执行条件：威望>40，行政效率>50。效果：相关行为减少，可能影响特定群体。风险：黑市滋生，民众不满。',
    'decree': '下达诏书：发布皇帝诏书。执行条件：威望>30。效果：政策实施，官僚系统执行。风险：执行不力，阳奉阴违。',
    'general': '通用处理：处理未分类的指令。执行条件：无特殊条件。效果：根据具体情况处理。风险：处理不当。',

    // 补充其他可能需要的技能
    'border_patrol': '边境巡逻：定期巡视边境，防止外敌入侵。执行条件：兵力充足，边境稳定。效果：边境安全+20%，军费-30。风险：兵力分散，可能被各个击破。',
    'tax_audit': '税收审计：检查地方税收执行情况。执行条件：行政效率>60。效果：税收透明度+30%，可能发现瞒报。风险：官员不满，可能引发抵制。',
    'famine_relief': '赈灾救济：发放粮食救济灾民。执行条件：有灾情，粮食充足。效果：民心+20%，粮食-500。风险：粮食储备不足，可能引发抢粮。',
    'corruption_investigation': '腐败调查：调查官员腐败行为。执行条件：有举报，证据充分。效果：官员廉洁+30%，可能引发官场震动。风险：打击面过大，影响行政效率。',
    'trade_promotion': '促进贸易：降低关税，鼓励商业发展。执行条件：商业>50。效果：商业+20%，关税-10%。风险：外国商品冲击，本土产业受损。',
    'education_reform': '教育改革：推行新的教育政策。执行条件：财政充足，人才储备。效果：人才质量+25%，短期财政-200。风险：改革阻力大，可能引发思想动荡。',
    'military_training': '军事训练：加强军队训练。执行条件：兵力>800，军费>150。效果：军队战斗力+15%，军费-80。风险：训练事故，可能引发士兵不满。',
    'disaster_prevention': '灾害预防：修建水利，预防灾害。执行条件：财政>3000，人口>4000。效果：灾害损失-30%，财政-1500。风险：工程质量问题，可能劳民伤财。',
    'foreign_diplomacy': '外交谈判：与外国进行外交谈判。执行条件：国力>60，外交关系稳定。效果：外交关系+20%，可能签订条约。风险：谈判破裂，可能引发冲突。',
    'internal_security': '国内安全：加强国内治安管理。执行条件：治安<70。效果：治安+25%，民心-5%。风险：过度监控，可能引发民众不满。'
  };

  return fallbackContent[skillId] || '';
}