import type { NPC } from '../engine/types';

export const SEED_NPCS: NPC[] = [
  {
    id: 'official_fang_zhi',
    slug: 'fang_zhi',
    name: '方直',
    role: '都察院左佥都御史',
    faction: '文官集团',
    status: 'active',
    traits: {
      loyalty: 80,
      ambition: 40,
      greed: 20,
      courage: 90,
      rationality: 70,
      stability: 85
    },
    state: {
      pressure: 60,
      satisfaction: 35,
      recent_events: ['弹劾宠臣贪腐', '拒绝执行不合礼制旨意'],
      behavior_modifier: '固执',
      loyalty_to_emperor: 85
    },
    memory: {
      trauma: [{
        event_id: 'refuse_tax',
        event_name: '拒绝摊派苛税',
        year: 5,
        type: '政治',
        intensity: 6,
        impact: '差点被摘乌纱帽',
        trigger_words: ['苛税', '摊派']
      }],
      key_events: [],
      summary: '寒门出身，乡试解元，殿试二甲第七。在地方任知县时曾因拒绝摊派苛税，差点被上司摘了乌纱帽。先帝在位时调入都察院，三年上了二十七道奏疏，一半在骂同僚，一半在劝皇帝。'
    },
    bias: { '文官集团': 0.8, '宦官集团': -0.6 },
    relations: {
      'official_qian_qian': { kind: '仇敌', weight: -0.8, since_year: 1, notes: '死对头。钱谦的每一份升迁，在他眼里都是朝廷的耻辱。' },
      'official_zheng_jing': { kind: '盟友', weight: 0.6, since_year: 1, notes: '互相尊重。郑经的务实他认可，但觉得年轻人手段太杂，不够纯粹。' }
    },
    voice: {
      features: ['语速较慢', '常用典故', '说话留有余地'],
      syntax_rules: ['多用"臣以为"、"据臣所知"'],
      forbidden_phrases: ['绝对', '一定', '必须']
    },
    visual: { image: null, image_prompt: 'Chinese ancient official in Ming dynasty censor uniform, stern facial expression, standing rigidly in a courtroom, holding an impeachment memorial, ink wash painting style, traditional Chinese aesthetics' }
  },
  {
    id: 'official_qian_qian',
    slug: 'qian_qian',
    name: '钱谦',
    role: '礼部右侍郎',
    faction: '文官集团',
    status: 'active',
    traits: {
      loyalty: 40,
      ambition: 90,
      greed: 60,
      courage: 30,
      rationality: 85,
      stability: 70
    },
    state: {
      pressure: 25,
      satisfaction: 80,
      recent_events: ['主持科举', '揣摩皇帝喜好'],
      behavior_modifier: '圆滑',
      loyalty_to_emperor: 60
    },
    memory: {
      trauma: [],
      key_events: [],
      summary: '父亲是前朝四品知府，家底殷实。科举成绩平平（三甲同进士出身），但胜在会来事。先帝时期靠给太子讲学混了个脸熟，新皇登基，他第一批上表劝进，文采斐然（其实找了三个幕僚合伙写的）。三年里从六品主事蹿升到三品侍郎，速度让同僚眼红。'
    },
    bias: { '文官集团': 0.5, '宦官集团': -0.7 },
    relations: {
      'official_fang_zhi': { kind: '仇敌', weight: -0.8, since_year: 1, notes: '烦透了这个愣头青，但表面功夫做到位。每次被弹劾，都上书请罪，转头给方直的政敌递刀子。' },
      'official_zheng_jing': { kind: '其他', weight: 0.3, since_year: 1, notes: '警惕。郑经的才干让他不安，但目前两人没有利益冲突，所以维持着客气。' }
    },
    voice: {
      features: ['声音含蓄', '说话圆滑', '常用暗示'],
      syntax_rules: ['多用"下官以为"、"大人圣明"'],
      forbidden_phrases: ['明确', '直接', '公开']
    },
    visual: { image: null, image_prompt: 'Chinese ancient official in Ming dynasty ceremonial robe, subtle smile, holding a jade tablet, standing in a palace corridor, warm lighting, traditional Chinese painting style' }
  },
  {
    id: 'official_zheng_jing',
    slug: 'zheng_jing',
    name: '郑经',
    role: '翰林院侍讲学士',
    faction: '文官集团',
    status: 'active',
    traits: {
      loyalty: 75,
      ambition: 65,
      greed: 25,
      courage: 60,
      rationality: 90,
      stability: 80
    },
    state: {
      pressure: 45,
      satisfaction: 60,
      recent_events: ['提出清丈田亩方案', '被委任新政试点'],
      behavior_modifier: '务实',
      loyalty_to_emperor: 80
    },
    memory: {
      trauma: [{
        event_id: 'policy_essay',
        event_name: '策论谈税制积弊',
        year: 3,
        type: '政治',
        intensity: 5,
        impact: '被先帝冷藏五年',
        trigger_words: ['税制', '积弊']
      }],
      key_events: [],
      summary: '神童出身，十七岁中举，二十岁点翰林。本该平步青云，却因在策论里大谈“税制积弊”，被先帝冷藏了五年。新皇登基后，偶然看到他的一篇边防策，召来问对，惊为天人。目前挂着翰林院的闲职，实则常被皇帝叫去私下议事。'
    },
    bias: { '文官集团': 0.7, '宦官集团': -0.5 },
    relations: {
      'official_fang_zhi': { kind: '盟友', weight: 0.6, since_year: 1, notes: '敬重老前辈的骨气，但觉得方直太爱在道德高地放炮，实际效果有限。' },
      'official_qian_qian': { kind: '其他', weight: 0.2, since_year: 1, notes: '看穿了钱谦的底色，但不动声色。知道这种人迟早要对付，但不是现在。' }
    },
    voice: {
      features: ['语速平稳', '常用具体数据', '说话务实'],
      syntax_rules: ['多用"臣以为"、"据数据所知"'],
      forbidden_phrases: ['大概', '可能', '也许']
    },
    visual: { image: null, image_prompt: 'Chinese ancient young scholar-official in Ming dynasty academic robe, thoughtful expression, holding a scroll map, in a study room filled with books, soft natural light, traditional ink painting style' }
  }
];