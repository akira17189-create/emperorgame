
import type { NPC } from '../engine/types';

// 简化NPC数据类型（接受完整NPC或轻量对象）
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type NpcData = { id: string; name: string; role: string; faction: string; [key: string]: any };


export const SEED_NPCS: NPC[] = [
  {
    id: 'fang-zhi',
    slug: 'fang-zhi',
    name: '方直',
    role: '都察院左佥都御史',
    faction: '清流',
    status: 'active',
    traits: {
      loyalty: 90,
      ambition: 20,
      greed: 5,
      courage: 95,
      rationality: 55,
      stability: 60
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
      summary: '寒门出身，乡试解元，殿试二甲第七。在地方任知县时因拒绝摊派苛税差点被摘乌纱帽，调入都察院后三年上二十七道奏疏，半骂同僚半劝皇帝，同僚称其"方铁头"。'
    },
    bias: {
      '加税': 0.1,
      '改革': 0.8,
      '宦官': 0.0,
      '礼法': 1.0,
      '赈灾': 0.9
    },
    relations: {
      'qian-qian': {
        kind: '仇敌',
        weight: -0.8,
        since_year: 5,
        notes: '死对头。钱谦的每一份升迁，在他眼里都是朝廷的耻辱。'
      },
      'zheng-jing': {
        kind: '其他',
        weight: 0.5,
        since_year: 3,
        notes: '互相尊重。郑经的务实他认可，但觉得年轻人手段太杂，不够纯粹。'
      }
    },
    voice: {
      features: ['刚直', '引经据典', '不留情面'],
      syntax_rules: ['惯用"臣以为"开头', '爱引古制典故'],
      forbidden_phrases: ['权宜之计', '睁一只眼闭一只眼']
    },
    visual: {
      image: null,
      image_prompt: 'Chinese ancient official in Ming dynasty censor uniform, stern facial expression, standing rigidly in a courtroom, holding an impeachment memorial, ink wash painting style, traditional Chinese aesthetics'
    }
  },
  {
    id: 'qian-qian',
    slug: 'qian-qian',
    name: '钱谦',
    role: '礼部右侍郎',
    faction: '帝党',
    status: 'active',
    traits: {
      loyalty: 40,
      ambition: 85,
      greed: 35,
      courage: 40,
      rationality: 80,
      stability: 85
    },
    state: {
      pressure: 20,
      satisfaction: 75,
      recent_events: [],
      behavior_modifier: '八面玲珑',
      loyalty_to_emperor: 60
    },
    memory: {
      trauma: [],
      key_events: [],
      summary: '前朝四品知府之子，三甲同进士出身，靠会来事蹿升。先帝时给太子讲学混脸熟，新皇登基首批劝进，三年从六品主事升至三品侍郎，圣眷正浓。'
    },
    bias: {
      '加税': 0.7,
      '改革': 0.3,
      '宦官': 0.6,
      '礼制': 0.8,
      '赈灾': 0.4
    },
    relations: {
      'fang-zhi': {
        kind: '仇敌',
        weight: -0.8,
        since_year: 5,
        notes: '烦透了这个愣头青，但表面功夫做到位。每次被弹劾，都上书请罪，转头给方直的政敌递刀子。'
      },
      'zheng-jing': {
        kind: '其他',
        weight: -0.2,
        since_year: 2,
        notes: '警惕。郑经的才干让他不安，但目前两人没有利益冲突，所以维持着客气。'
      }
    },
    voice: {
      features: ['圆滑', '察言观色', '言辞华丽'],
      syntax_rules: ['多用"陛下圣明"', '转折前必加"臣有一虑"'],
      forbidden_phrases: ['我不同意', '此事不妥']
    },
    visual: {
      image: null,
      image_prompt: 'Chinese ancient official in Ming dynasty ceremonial robe, subtle smile, holding a jade tablet, standing in a palace corridor, warm lighting, traditional Chinese painting style'
    }
  },
  {
    id: 'zheng-jing',
    slug: 'zheng-jing',
    name: '郑经',
    role: '翰林院侍讲学士',
    faction: '务实派',
    status: 'active',
    traits: {
      loyalty: 75,
      ambition: 55,
      greed: 10,
      courage: 65,
      rationality: 90,
      stability: 88
    },
    state: {
      pressure: 40,
      satisfaction: 55,
      recent_events: [],
      behavior_modifier: '谋定后动',
      loyalty_to_emperor: 80
    },
    memory: {
      trauma: [],
      key_events: [],
      summary: '神童出身，十七岁中举，二十岁点翰林。因策论谈税制积弊被先帝冷藏五年，新皇见其边防策后惊为天人，挂翰林院闲职实则常被私下议事。'
    },
    bias: {
      '加税': 0.3,
      '改革': 0.95,
      '宦官': 0.2,
      '实政': 0.9,
      '赈灾': 0.8
    },
    relations: {
      'fang-zhi': {
        kind: '其他',
        weight: 0.5,
        since_year: 3,
        notes: '敬重老前辈的骨气，但觉得方直太爱在道德高地放炮，实际效果有限。'
      },
      'qian-qian': {
        kind: '其他',
        weight: -0.2,
        since_year: 2,
        notes: '看穿了钱谦的底色，但不动声色。知道这种人迟早要对付，但不是现在。'
      }
    },
    voice: {
      features: ['言简意赅', '务实', '数据导向'],
      syntax_rules: ['先结论后推理', '爱用类比'],
      forbidden_phrases: ['于礼不合', '祖宗成法']
    },
    visual: {
      image: null,
      image_prompt: 'Chinese ancient young scholar-official in Ming dynasty academic robe, thoughtful expression, holding a scroll map, in a study room filled with books, soft natural light, traditional ink painting style'
    }
  }
];
// 新增NPC

export const EMpressDowagerXiao: NpcData = {
  id: 'empress-dowager-xiao',
  name: '萧氏',
  role: '太后',
  faction: 'imperial-court',
  position: '太后',
  reputation: 85,
  loyalty: 90,
  ambition: 75
};

export const WangFuquan: NpcData = {
  id: 'wang-fuquan',
  name: '王福全',
  role: 'eunuch',
  faction: 'eunuchs',
  position: '司礼监掌印太监',
  reputation: 75,
  loyalty: 60,
  ambition: 80
};

export const ZhouWenyuan: NpcData = {
  id: 'zhou-wenyuan',
  name: '周文渊',
  role: 'official',
  faction: 'imperial-court',
  position: '礼部尚书',
  reputation: 80,
  loyalty: 85,
  ambition: 40
};

export const LinWaner: NpcData = {
  id: 'lin-waner',
  name: '林婉儿',
  role: 'official',
  faction: 'imperial-court',
  position: '翰林院编修',
  reputation: 70,
  loyalty: 80,
  ambition: 55
};

export const ZhaoHuchen: NpcData = {
  id: 'zhao-huchen',
  name: '赵虎臣',
  role: 'official',
  faction: 'military',
  position: '兵部尚书',
  reputation: 75,
  loyalty: 95,
  ambition: 50
};

export const ChenSihai: NpcData = {
  id: 'chen-sihai',
  name: '陈四海',
  role: 'official',
  faction: 'pragmatists',
  position: '户部左侍郎',
  reputation: 70,
  loyalty: 70,
  ambition: 75
};

export const XiaoDezi: NpcData = {
  id: 'xiao-dezi',
  name: '小德子',
  role: 'eunuch',
  faction: 'imperial-court',
  position: '御前太监',
  reputation: 60,
  loyalty: 95,
  ambition: 30
};

export const QiuYue: NpcData = {
  id: 'qiu-yue',
  name: '秋月',
  role: 'maid',
  faction: 'imperial-court',
  position: '贴身宫女',
  reputation: 55,
  loyalty: 90,
  ambition: 25
};

export const XuDa: NpcData = {
  id: 'xu-da',
  name: '徐达',
  role: 'official',
  faction: 'military',
  position: '蓟辽总督',
  reputation: 80,
  loyalty: 95,
  ambition: 45
};

export const LiuZhang: NpcData = {
  id: 'liu-zhang',
  name: '刘璋',
  role: 'merchant',
  faction: 'pragmatists',
  position: '江南富商',
  reputation: 65,
  loyalty: 60,
  ambition: 80
};

export const SunSide: NpcData = {
  id: 'sun-side',
  name: '孙思德',
  role: 'official',
  faction: 'imperial-court',
  position: '太医院院判',
  reputation: 70,
  loyalty: 55,
  ambition: 65
};

export const SEED_NPCS_UPDATED: NpcData[] = [
  ...SEED_NPCS,
  EMpressDowagerXiao,
  WangFuquan,
  ZhouWenyuan,
  LinWaner,
  ZhaoHuchen,
  ChenSihai,
  XiaoDezi,
  QiuYue,
  XuDa,
  LiuZhang,
  SunSide
];
