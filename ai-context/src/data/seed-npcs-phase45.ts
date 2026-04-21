import type { NPC } from '../engine/types';

export const SEED_NPCS_PHASE45: NPC[] = [
  // 方直（清流派领袖）
  {
    id: 'fang-zhi-phase45',
    slug: 'fang-zhi-phase45',
    name: '方直',
    role: '都察院左佥都御史',
    faction: 'qingliu',
    status: 'active',
    traits: {
      loyalty: 90,
      ambition: 20,
      greed: 5,
      courage: 95,
      rationality: 55,
      stability: 60,
      honor: 95,
      compassion: 60
    },
    state: {
      pressure: 55,
      satisfaction: 30,
      recent_events: [],
      behavior_modifier: '铁骨铮铮',
      loyalty_to_emperor: 85
    },
    memory: {
      trauma: [],
      key_events: [],
      summary: '寒门出身，乡试解元，殿试二甲第七。清流派领袖，以耿直敢谏闻名，同僚称其"方铁头"。主张恢复礼法、惩治腐败、限制皇权，有道德洁癖，理想主义者。'
    },
    bias: {
      '礼法': 1.0,
      '改革': 0.8,
      '赈灾': 0.9,
      '宦官': 0.0,
      '加税': 0.1,
      '军事': 0.4,
      '科举': 0.9
    },
    relations: {
      'qian-qian': { kind: '仇敌', weight: -0.8, since_year: 5, notes: '死对头，视钱谦为阿谀奉承之辈' },
      'wang-fuquan': { kind: '仇敌', weight: -0.9, since_year: 3, notes: '坚决反对宦官干政' },
      'chen-deming': { kind: '同僚', weight: 0.6, since_year: 8, notes: '同为清流，但不满其过于务实的态度' }
    },
    voice: {
      features: ['刚直', '引经据典', '不留情面'],
      syntax_rules: ['惯用"臣以为"开头', '爱引古制典故，常用"祖宗之法不可变"'],
      forbidden_phrases: ['权宜之计', '睁一只眼闭一只眼', '陛下圣明但']
    },
    visual: {
      image: null,
      image_prompt: 'Chinese Ming dynasty censor in stern official uniform, holding impeachment memorial, righteous expression, ink wash painting style, 55 years old'
    },
    goals: []
  },

  // 王福全（宦官派领袖）
  {
    id: 'wang-fuquan',
    slug: 'wang-fuquan',
    name: '王福全',
    role: '司礼监掌印太监',
    faction: 'eunuchs',
    status: 'active',
    traits: {
      loyalty: 40,
      ambition: 90,
      greed: 75,
      courage: 60,
      rationality: 85,
      stability: 70,
      honor: 20,
      compassion: 30
    },
    state: {
      pressure: 40,
      satisfaction: 80,
      recent_events: [],
      behavior_modifier: '阴险狡诈',
      loyalty_to_emperor: 50
    },
    memory: {
      trauma: [],
      key_events: [],
      summary: '从底层太监爬到司礼监掌印太监之位，掌批红权与东厂侦缉权。表面恭敬，实际想控制年轻皇帝，维护宦官特权，是宦官派实际领袖。'
    },
    bias: {
      '宦官': 1.0,
      '皇权': 0.7,
      '改革': 0.3,
      '清流': -0.9,
      '军事': 0.5,
      '财政': 0.6,
      '科举': 0.2
    },
    relations: {
      'fang-zhi': { kind: '仇敌', weight: -0.9, since_year: 3, notes: '视方直为最大威胁，欲除之而后快' },
      'qian-qian': { kind: '利用', weight: 0.3, since_year: 4, notes: '互相利用关系，各取所需' },
      'chen-deming': { kind: '中立', weight: 0.1, since_year: 2, notes: '试图拉拢但未成功' }
    },
    voice: {
      features: ['阴柔', '圆滑', '话里有话'],
      syntax_rules: ['常用"奴才以为"自称', '说话留三分，让听话者自己揣摩'],
      forbidden_phrases: ['直接拒绝', '明确表态', '我反对']
    },
    visual: {
      image: null,
      image_prompt: 'Chinese Ming dynasty eunuch in elaborate court robe, holding ceremonial fan, cunning expression, palace background, 55 years old'
    },
    goals: []
  },

  // 钱谦（帝党派核心）
  {
    id: 'qian-qian-phase45',
    slug: 'qian-qian-phase45',
    name: '钱谦',
    role: '户部尚书',
    faction: 'didang',
    status: 'active',
    traits: {
      loyalty: 70,
      ambition: 85,
      greed: 40,
      courage: 50,
      rationality: 90,
      stability: 85,
      honor: 60,
      compassion: 55
    },
    state: {
      pressure: 30,
      satisfaction: 75,
      recent_events: [],
      behavior_modifier: '老谋深算',
      loyalty_to_emperor: 80
    },
    memory: {
      trauma: [],
      key_events: [],
      summary: '三朝元老，精通财政，老谋深算。主张加强皇权、稳定大局、渐进改革。善于在各方势力间平衡，要求皇帝"成熟稳重"，与清流派在改革速度上有分歧。'
    },
    bias: {
      '皇权': 0.9,
      '财政': 1.0,
      '改革': 0.6,
      '稳定': 0.8,
      '清流': 0.3,
      '宦官': 0.5,
      '军事': 0.4
    },
    relations: {
      'fang-zhi': { kind: '仇敌', weight: -0.8, since_year: 5, notes: '视方直为不懂变通的愣头青' },
      'wang-fuquan': { kind: '利用', weight: 0.3, since_year: 4, notes: '互相利用，维持表面关系' },
      'chen-deming': { kind: '欣赏', weight: 0.7, since_year: 6, notes: '欣赏其务实态度，认为可发展为盟友' }
    },
    voice: {
      features: ['圆滑', '专业', '沉稳'],
      syntax_rules: ['多用数据说话，如"国库尚有银两..."', '转折前必加"然而有一虑"'],
      forbidden_phrases: ['我不同意', '此事绝对不行', '没有商量余地']
    },
    visual: {
      image: null,
      image_prompt: 'Chinese Ming dynasty senior official in ceremonial robe, holding account book, wise and calculating expression, 60 years old'
    },
    goals: []
  },

  // 陈德明（清流务实派）
  {
    id: 'chen-deming',
    slug: 'chen-deming',
    name: '陈德明',
    role: '礼部侍郎',
    faction: 'qingliu',
    status: 'active',
    traits: {
      loyalty: 75,
      ambition: 50,
      greed: 20,
      courage: 65,
      rationality: 80,
      stability: 75,
      honor: 70,
      compassion: 65
    },
    state: {
      pressure: 45,
      satisfaction: 60,
      recent_events: [],
      behavior_modifier: '务实渐进',
      loyalty_to_emperor: 75
    },
    memory: {
      trauma: [],
      key_events: [],
      summary: '江南陈家旁支出身，礼部侍郎。务实派清流，主张渐进改革，在清流与务实派之间摇摆，可能成为派系间的桥梁。重视实际效果，不执着于意识形态之争。'
    },
    bias: {
      '改革': 0.7,
      '务实': 0.9,
      '礼法': 0.6,
      '财政': 0.7,
      '清流': 0.8,
      '帝党': 0.4,
      '科举': 0.5
    },
    relations: {
      'fang-zhi': { kind: '同僚', weight: 0.6, since_year: 8, notes: '尊重其原则性，但认为过于理想化' },
      'qian-qian': { kind: '欣赏', weight: 0.7, since_year: 6, notes: '欣赏其务实态度，可合作推进改革' },
      'wang-fuquan': { kind: '警惕', weight: -0.5, since_year: 3, notes: '警惕宦官干政，但保持表面礼貌' }
    },
    voice: {
      features: ['务实', '温和', '理性'],
      syntax_rules: ['常用"从实际来看"开头', '喜欢列举一二三点，条理清晰'],
      forbidden_phrases: ['绝对正确', '毫无余地', '理想化的空谈']
    },
    visual: {
      image: null,
      image_prompt: 'Chinese Ming dynasty scholar-official in simple official robe, thoughtful and pragmatic expression, holding policy document, 50 years old'
    },
    goals: []
  }
];