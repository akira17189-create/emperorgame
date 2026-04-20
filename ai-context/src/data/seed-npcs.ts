
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
    faction: 'qingliu',
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
    faction: 'didang',
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
    faction: 'pragmatists',
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
  },
  {
    id: 'zhangmeng',
    slug: 'zhangmeng',
    name: '张猛',
    role: '五军都督府都督佥事',
    faction: 'military',
    status: 'active',
    traits: {"loyalty": 75, "ambition": 40, "greed": 20, "courage": 90, "rationality": 15, "stability": 20, "honor": 85, "compassion": 45},
    state: {"pressure": 30, "satisfaction": 60, "recent_events": [], "behavior_modifier": "刚烈", "loyalty_to_emperor": 75},
    memory: {"trauma": [], "key_events": [], "summary": "将门之后，三代从军，父死沙场..."},
    bias: {"军务": 0.9, "改革": 0.3, "文官": 0.1},
    relations: {"xieyuan": {"kind": "其他", "weight": 0.5, "since_year": 1, "notes": "欣赏其谋略"}},
    voice: {"features": ["豪迈", "直接", "重义"], "syntax_rules": ["惯用\"兄弟们\"", "句式简短有力"], "forbidden_phrases": ["迂回", "文绉绉"]},
    visual: {"image": null, "image_prompt": "Ming dynasty general..."},
    goals: []
  },
  {
    id: 'xieyuan',
    slug: 'xieyuan',
    name: '谢渊',
    role: '兵部郎中/军师祭酒',
    faction: 'pragmatists',
    status: 'active',
    traits: {"loyalty": 60, "ambition": 30, "greed": 10, "courage": 40, "rationality": 95, "stability": 85, "honor": 50, "compassion": 20},
    state: {"pressure": 20, "satisfaction": 70, "recent_events": [], "behavior_modifier": "冷静", "loyalty_to_emperor": 60},
    memory: {"trauma": [], "key_events": [], "summary": "寒门士子，科举探花，理性至上..."},
    bias: {"军务": 0.7, "改革": 0.8, "文官": 0.5},
    relations: {"zhangmeng": {"kind": "其他", "weight": 0.3, "since_year": 1, "notes": "认为可用但危险"}},
    voice: {"features": ["冷静", "理性", "质疑"], "syntax_rules": ["惯用\"数据显示\"、\"逻辑上\"", "用词理性克制"], "forbidden_phrases": ["情绪化表达"]},
    visual: {"image": null, "image_prompt": "Scholar in Ming dynasty..."},
    goals: []
  },
  {
    id: 'lijingzhai',
    slug: 'lijingzhai',
    name: '李静斋',
    role: '翰林院修撰',
    faction: 'qingliu',
    status: 'active',
    traits: {"loyalty": 90, "ambition": 10, "greed": 5, "courage": 70, "rationality": 60, "stability": 75, "honor": 85, "compassion": 95},
    state: {"pressure": 15, "satisfaction": 80, "recent_events": [], "behavior_modifier": "赤诚", "loyalty_to_emperor": 90},
    memory: {"trauma": [], "key_events": [], "summary": "书香世家，赤诚儒生，相信人性本善..."},
    bias: {"军务": 0.2, "改革": 0.9, "文官": 0.8},
    relations: {"zhangmeng": {"kind": "其他", "weight": 0.6, "since_year": 1, "notes": "敬佩其勇武，同情其遭遇"}},
    voice: {"features": ["文雅", "诚恳", "书卷气"], "syntax_rules": ["惯用圣贤引用", "常用\"天下苍生\"等大义词汇"], "forbidden_phrases": ["权宜之计", "政治手段"]},
    visual: {"image": null, "image_prompt": "Young scholar in Ming dynasty..."},
    goals: []
  },
  {
    id: 'guoshi',
    slug: 'guoshi',
    name: '玄明',
    role: '国师',
    faction: 'imperial',
    status: 'active',
    traits: {"loyalty": 60, "ambition": 40, "greed": 20, "courage": 70, "rationality": 65, "stability": 75, "honor": 50, "compassion": 45},
    state: {"pressure": 25, "satisfaction": 75, "recent_events": [], "behavior_modifier": "神秘", "loyalty_to_emperor": 60},
    memory: {"trauma": [], "key_events": [], "summary": "前朝国师玄真唯一传人，18岁女性伪装男性..."},
    bias: {"仙道": 0.9, "军务": 0.1, "改革": 0.5},
    relations: {},
    voice: {
      "features": ["好奇", "轻佻", "惯用反问"],
      "syntax_rules": ["惯用\"陛下可知…\"开头", "以问代答"],
      "forbidden_phrases": ["臣请陛下明鉴"],
      "signature_phrase": "有意思。",
      "mode_voices": {
        "mode_cruel": {
          "features": ["冷淡", "轻蔑"],
          "syntax_rules": ["短句收尾", "称对方\"你\"不称陛下"]
        },
        "mode_game": {
          "features": ["愉悦", "规则强调"],
          "syntax_rules": ["先陈述规则再提问", "用\"第一条/第二条\"分点"]
        },
        "mode_fragile": {
          "features": ["低声", "停顿多"],
          "syntax_rules": ["句子未完成", "用省略号结尾"]
        }
      }
    }, "mode_game": {"features": ["愉悦", "规则强调"], "syntax_rules": ["先陈述规则再提问", "用\"第一条/第二条\"分点"]}, "mode_fragile": {"features": ["低声", "停顿多"], "syntax_rules": ["句子未完成", "用省略号结尾"]}}}, "mode_game": {"features": ["愉悦", "规则强调"], "syntax_rules": ["先陈述规则再提问", "用\"第一条/第二条\"分点"]}, "mode_fragile": {"features": ["低声", "停顿多"], "syntax_rules": ["句子未完成", "用省略号结尾"]}}},
    visual: {"image": null, "image_prompt": "Young Taoist priest in Ming dynasty..."},
    goals: []
  }];
// 新增NPC

export const EMpressDowagerXiao: NpcData = {
  id: 'empress-dowager-xiao',
  name: '萧氏',
  role: '太后',
  faction: 'imperial',
  position: '太后',
  reputation: 85,
  loyalty: 90,
  ambition: 75
};

export const WangFuquan: NpcData = {
  id: 'wang-fuquan',
  name: '王福全',
  role: 'eunuch',
  faction: 'eunuch',
  position: '司礼监掌印太监',
  reputation: 75,
  loyalty: 60,
  ambition: 80
};

export const ZhouWenyuan: NpcData = {
  id: 'zhou-wenyuan',
  name: '周文渊',
  role: 'official',
  faction: 'imperial',
  position: '礼部尚书',
  reputation: 80,
  loyalty: 85,
  ambition: 40
};

export const LinWaner: NpcData = {
  id: 'lin-waner',
  name: '林婉儿',
  role: 'official',
  faction: 'imperial',
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
  faction: 'imperial',
  position: '御前太监',
  reputation: 60,
  loyalty: 95,
  ambition: 30
};

export const QiuYue: NpcData = {
  id: 'qiu-yue',
  name: '秋月',
  role: 'maid',
  faction: 'imperial',
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
  faction: 'imperial',
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
