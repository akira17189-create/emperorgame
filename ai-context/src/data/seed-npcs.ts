import type { NPC } from '../engine/types';

export const seedNpcs: NPC[] = [
  // 张猛
  {
    id: 'zhangmeng',
    slug: 'zhangmeng',
    name: '张猛',
    role: '武将',
    faction: 'military',
    status: 'active',
    traits: {"loyalty": 85, "ambition": 40, "greed": 30, "courage": 95, "rationality": 40, "stability": 60, "honor": 90, "compassion": 50},
    state: {"pressure": 30, "satisfaction": 70, "recent_events": [], "behavior_modifier": "忠诚但冲动", "loyalty_to_emperor": 85},
    memory: {"trauma": [], "key_events": [], "summary": "猛将出身，忠诚勇猛但冲动易怒"},
    bias: {"军务": 0.9, "改革": 0.3, "仙道": 0.1},
    relations: {},
    voice: {"features": ["豪迈", "直接", "重义"], "syntax_rules": ["惯用\"兄弟们\"", "句式简短有力"], "forbidden_phrases": ["迂回", "文绉绉"]},
    visual: {"image": null, "image_prompt": "Burly general in Ming dynasty armor, fierce expression"},
    goals: []
  },

  // 谢渊
  {
    id: 'xieyuan',
    slug: 'xieyuan',
    name: '谢渊',
    role: '谋士',
    faction: 'pragmatists',
    status: 'active',
    traits: {"loyalty": 60, "ambition": 75, "greed": 40, "courage": 50, "rationality": 90, "stability": 85, "honor": 40, "compassion": 30},
    state: {"pressure": 20, "satisfaction": 80, "recent_events": [], "behavior_modifier": "理性算计", "loyalty_to_emperor": 60},
    memory: {"trauma": [], "key_events": [], "summary": "精于算计的谋士，理性至上"},
    bias: {"改革": 0.8, "军务": 0.4, "仙道": 0.2},
    relations: {},
    voice: {"features": ["冷静", "理性", "质疑"], "syntax_rules": ["惯用\"数据显示\"、\"逻辑上\"", "用词理性克制"], "forbidden_phrases": ["情绪化表达"]},
    visual: {"image": null, "image_prompt": "Scholarly advisor in Ming dynasty official robes, calculating expression"},
    goals: []
  },

  // 李敬斋
  {
    id: 'lijingzhai',
    slug: 'lijingzhai',
    name: '李敬斋',
    role: '言官',
    faction: 'qingliu',
    status: 'active',
    traits: {"loyalty": 70, "ambition": 20, "greed": 10, "courage": 60, "rationality": 50, "stability": 40, "honor": 95, "compassion": 85},
    state: {"pressure": 40, "satisfaction": 60, "recent_events": [], "behavior_modifier": "理想主义", "loyalty_to_emperor": 70},
    memory: {"trauma": [], "key_events": [], "summary": "理想主义言官，坚守道德原则"},
    bias: {"改革": 0.7, "军务": 0.3, "仙道": 0.1},
    relations: {},
    voice: {"features": ["文雅", "诚恳", "书卷气"], "syntax_rules": ["惯用圣贤引用", "常用\"天下苍生\"等大义词汇"], "forbidden_phrases": ["权宜之计", "政治手段"]},
    visual: {"image": null, "image_prompt": "Scholar in simple Ming dynasty robes, sincere expression"},
    goals: []
  },

  // 国师（玄明）
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
    },
    visual: {"image": null, "image_prompt": "Young Taoist priest in Ming dynasty..."},
    goals: []
  }
];
