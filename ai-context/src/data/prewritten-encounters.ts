export interface EncounterTemplate {
  id: string;
  location_type: '城内' | '郊野' | '边关' | '山道' | '渡口';
  trigger_year_range: [number, number];
  npc_type: string;            // 如"落魄商人""边军逃兵""游方道士"
  opening_scene: string;       // 场景描述（2-3句，符合narration.md文风）
  npc_opening_line: string;    // NPC 第一句话
  skip_result: string;         // 选「略过」时的固定叙事（1-2句）
  chat_npc_profile: {
    display_name: string;      // 显示用名称，如"老商人"
    knowledge_scope: string;   // 知道什么
    not_know: string;          // 明确不知道什么（必填：不知朝堂秘闻）
    voice_features: string[];
    fallback_line: string;
  };
}

export const ENCOUNTER_TEMPLATES: EncounterTemplate[] = [
  {
    id: 'beggar_01',
    location_type: '城内',
    trigger_year_range: [1, 10],
    npc_type: '落魄书生',
    opening_scene: '街角蜷缩着一个衣衫褴褛的书生，面前摊着一张破旧的纸，上面写着"卖字为生"。寒风中，他瑟瑟发抖，却仍保持着读书人的体面。',
    npc_opening_line: '这位公子，可否赏脸看看在下的字？虽不值钱，却是用心写的。',
    skip_result: '你匆匆走过，书生叹了口气，继续在寒风中等待。',
    chat_npc_profile: {
      display_name: '落魄书生',
      knowledge_scope: '了解市井民情、物价涨落、百姓疾苦',
      not_know: '不知朝堂秘闻，不知官员私事',
      voice_features: ['文弱', '谦卑', '书卷气'],
      fallback_line: '是在下唐突了，公子请便。'
    }
  },
  {
    id: 'merchant_01',
    location_type: '城内',
    trigger_year_range: [1, 10],
    npc_type: '行商',
    opening_scene: '一个风尘仆仆的商人牵着驮货的骡子，在城门口与守卫争执。他的货物被拦下检查，脸上写满焦急。',
    npc_opening_line: '官爷，小的这都是正经货，丝绸、茶叶，还有南边的瓷器。您行行好，让小的进城吧。',
    skip_result: '你绕开争执的人群，商人还在与守卫理论。',
    chat_npc_profile: {
      display_name: '行商',
      knowledge_scope: '了解各地物价、商路情况、走私门路',
      not_know: '不知朝堂秘闻，不知官员私事',
      voice_features: ['精明', '市侩', '油滑'],
      fallback_line: '小的多嘴了，这就走。'
    }
  },
  {
    id: 'soldier_01',
    location_type: '边关',
    trigger_year_range: [1, 10],
    npc_type: '边军逃兵',
    opening_scene: '山道旁，一个穿着破烂军服的年轻人蜷缩在岩石后。他的手臂上有一道深深的伤口，血迹已经干涸。',
    npc_opening_line: '别...别报官。我不是逃兵，是...是被长官逼的。',
    skip_result: '你转身离开，逃兵松了口气，继续躲藏。',
    chat_npc_profile: {
      display_name: '逃兵',
      knowledge_scope: '了解边军实情、军饷克扣、长官贪腐',
      not_know: '不知朝堂秘闻，不知官员私事',
      voice_features: ['恐惧', '怨恨', '朴实'],
      fallback_line: '小的不敢多说了。'
    }
  },
  {
    id: 'taoist_01',
    location_type: '山道',
    trigger_year_range: [1, 10],
    npc_type: '游方道士',
    opening_scene: '山道上，一个白发道士正在用铜钱占卜。他的摊位前摆着几本破旧的道经，还有一个奇怪的蒸汽装置，冒着淡淡的白烟。',
    npc_opening_line: '施主，贫道观你面相，今日恐有口舌之争。可要算上一卦？',
    skip_result: '你摇摇头，道士笑了笑，继续摆弄他的蒸汽装置。',
    chat_npc_profile: {
      display_name: '游方道士',
      knowledge_scope: '了解道教各派、民间信仰、蒸汽道法融合',
      not_know: '不知朝堂秘闻，不知官员私事',
      voice_features: ['神秘', '玄乎', '故弄玄虚'],
      fallback_line: '天机不可泄露，施主请便。'
    }
  },
  {
    id: 'refugee_01',
    location_type: '郊野',
    trigger_year_range: [1, 10],
    npc_type: '逃荒灾民',
    opening_scene: '郊外官道上，一群衣衫褴褛的灾民围着一个简易的粥棚。一个老妇人抱着孩子，眼神空洞地望着远方。',
    npc_opening_line: '这位公子，行行好，给孩子一口吃的吧。我们是从南边逃荒来的。',
    skip_result: '你加快脚步，老妇人的哀求声渐渐远去。',
    chat_npc_profile: {
      display_name: '逃荒老妇',
      knowledge_scope: '了解地方灾情、官员赈灾不力、百姓疾苦',
      not_know: '不知朝堂秘闻，不知官员私事',
      voice_features: ['凄苦', '哀求', '朴实'],
      fallback_line: '是老婆子多嘴了。'
    }
  },
  {
    id: 'spy_01',
    location_type: '渡口',
    trigger_year_range: [1, 10],
    npc_type: '神秘探子',
    opening_scene: '渡口茶摊，一个戴着斗笠的男子独自坐着，面前的茶水已经凉了。他的眼神警惕地扫视着周围。',
    npc_opening_line: '这位客官，可要听些新鲜事？南边的生意，最近可不好做啊。',
    skip_result: '你假装没听见，男子冷笑一声，继续喝茶。',
    chat_npc_profile: {
      display_name: '斗笠男子',
      knowledge_scope: '了解各地走私、情报交易、江湖秘闻',
      not_know: '不知朝堂秘闻，不知官员私事',
      voice_features: ['谨慎', '神秘', '江湖气'],
      fallback_line: '小的多嘴了。'
    }
  },
  {
    id: 'blacksmith_01',
    location_type: '城内',
    trigger_year_range: [1, 10],
    npc_type: '蒸汽机匠',
    opening_scene: '城西工坊区，一个满脸煤灰的匠人正在调试一个蒸汽装置。装置发出嘶嘶的响声，白烟袅袅升起。',
    npc_opening_line: '这位公子，瞧瞧咱这新家伙！用道法驱动蒸汽，比烧煤省一半！',
    skip_result: '你匆匆走过，匠人还在专注地调试他的装置。',
    chat_npc_profile: {
      display_name: '蒸汽机匠',
      knowledge_scope: '了解蒸汽技术、道法融合、工业发展',
      not_know: '不知朝堂秘闻，不知官员私事',
      voice_features: ['自豪', '朴实', '技术宅'],
      fallback_line: '小的多嘴了，公子慢走。'
    }
  },
  {
    id: 'beggar_02',
    location_type: '城内',
    trigger_year_range: [1, 10],
    npc_type: '冤民',
    opening_scene: '衙门口，一个中年男子跪在地上，手里举着一张状纸。他的脸上有明显的伤痕，眼神中充满绝望。',
    npc_opening_line: '青天大老爷，冤枉啊！小的被恶霸诬陷，家破人亡，求大老爷做主！',
    skip_result: '你绕开衙门，男子的喊冤声还在继续。',
    chat_npc_profile: {
      display_name: '喊冤男子',
      knowledge_scope: '了解地方司法不公、恶霸横行、百姓冤屈',
      not_know: '不知朝堂秘闻，不知官员私事',
      voice_features: ['绝望', '愤怒', '朴实'],
      fallback_line: '小的不敢多说了。'
    }
  },
  {
    id: 'soldier_02',
    location_type: '边关',
    trigger_year_range: [1, 10],
    npc_type: '老兵',
    opening_scene: '边关茶馆，一个独臂老兵正在给年轻人讲当年的战事。他的眼神中既有骄傲，也有悲伤。',
    npc_opening_line: '小伙子，想当年，老子在北边打蛮子的时候，那叫一个痛快！',
    skip_result: '你默默离开，老兵还在讲述他的故事。',
    chat_npc_profile: {
      display_name: '独臂老兵',
      knowledge_scope: '了解边关战事、军旅生活、老兵待遇',
      not_know: '不知朝堂秘闻，不知官员私事',
      voice_features: ['豪迈', '沧桑', '怀旧'],
      fallback_line: '小的多嘴了。'
    }
  },
  {
    id: 'taoist_02',
    location_type: '山道',
    trigger_year_range: [1, 10],
    npc_type: '炼丹术士',
    opening_scene: '山腰处，一个术士正在用蒸汽装置炼丹。铜炉冒着五彩烟雾，空气中弥漫着奇异的香味。',
    npc_opening_line: '这位施主，可要见识见识贫道的蒸汽炼丹术？用道法驱动，比凡火强百倍！',
    skip_result: '你摇摇头，术士继续专注地操作他的装置。',
    chat_npc_profile: {
      display_name: '炼丹术士',
      knowledge_scope: '了解炼丹术、蒸汽道法融合、仙道秘闻',
      not_know: '不知朝堂秘闻，不知官员私事',
      voice_features: ['狂热', '神秘', '技术宅'],
      fallback_line: '天机不可泄露。'
    }
  },
  {
    id: 'merchant_02',
    location_type: '渡口',
    trigger_year_range: [1, 10],
    npc_type: '走私商人',
    opening_scene: '渡口角落，一个商人正在偷偷摸摸地交易。他的货物用油布包裹，看不出是什么。',
    npc_opening_line: '嘘...这位公子，要不要看看南边来的好货？保证正品，价格公道。',
    skip_result: '你假装没看见，商人警惕地环顾四周。',
    chat_npc_profile: {
      display_name: '走私商人',
      knowledge_scope: '了解走私门路、黑市价格、官商勾结',
      not_know: '不知朝堂秘闻，不知官员私事',
      voice_features: ['谨慎', '狡猾', '市侩'],
      fallback_line: '小的看错人了。'
    }
  },
  {
    id: 'refugee_02',
    location_type: '郊野',
    trigger_year_range: [1, 10],
    npc_type: '逃荒农民',
    opening_scene: '田野间，几个农民正在挖野菜。他们的衣服破旧，脸上写满疲惫。',
    npc_opening_line: '这位公子，行行好，给口水喝吧。地里颗粒无收，只能出来找吃的。',
    skip_result: '你加快脚步，农民还在继续挖野菜。',
    chat_npc_profile: {
      display_name: '逃荒农民',
      knowledge_scope: '了解地方灾情、农业收成、百姓疾苦',
      not_know: '不知朝堂秘闻，不知官员私事',
      voice_features: ['朴实', '疲惫', '哀求'],
      fallback_line: '是小的多嘴了。'
    }
  },
  {
    id: 'spy_02',
    location_type: '城内',
    trigger_year_range: [1, 10],
    npc_type: '地方小吏',
    opening_scene: '酒楼角落，一个穿着官服的小吏正在独自喝酒。他的脸上有明显的愁容。',
    npc_opening_line: '这位公子，可要听些官场上的新鲜事？最近啊，上头又在折腾人了。',
    skip_result: '你假装没听见，小吏继续喝他的闷酒。',
    chat_npc_profile: {
      display_name: '小吏',
      knowledge_scope: '了解地方政务、官场潜规则、官员贪腐',
      not_know: '不知朝堂秘闻，不知官员私事',
      voice_features: ['愁苦', '抱怨', '谨慎'],
      fallback_line: '小的喝多了，胡言乱语。'
    }
  },
  {
    id: 'blacksmith_02',
    location_type: '城内',
    trigger_year_range: [1, 10],
    npc_type: '铸炮工',
    opening_scene: '城东兵工厂，一个工匠正在铸造火炮。蒸汽锤发出震耳欲聋的响声，火花四溅。',
    npc_opening_line: '这位公子，瞧瞧咱这新式火炮！用蒸汽驱动，射程比老式火炮远一倍！',
    skip_result: '你匆匆离开，工匠还在专注地工作。',
    chat_npc_profile: {
      display_name: '铸炮工',
      knowledge_scope: '了解铸炮技术、蒸汽武器、军工发展',
      not_know: '不知朝堂秘闻，不知官员私事',
      voice_features: ['自豪', '朴实', '技术宅'],
      fallback_line: '小的多嘴了，公子慢走。'
    }
  },
  {
    id: 'beggar_03',
    location_type: '郊野',
    trigger_year_range: [1, 10],
    npc_type: '流民',
    opening_scene: '破庙里，一群流民围着篝火取暖。一个老人正在给孩子讲过去的故事。',
    npc_opening_line: '这位公子，外面冷，进来烤烤火吧。我们都是逃难来的，没什么好招待的。',
    skip_result: '你摇摇头，老人继续讲他的故事。',
    chat_npc_profile: {
      display_name: '流民老人',
      knowledge_scope: '了解地方灾情、百姓疾苦、民间传说',
      not_know: '不知朝堂秘闻，不知官员私事',
      voice_features: ['沧桑', '慈祥', '朴实'],
      fallback_line: '是小的多嘴了。'
    }
  }
];
