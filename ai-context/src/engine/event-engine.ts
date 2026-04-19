import { callLLMWithRetry } from './llm';
import type { GameState, PendingEvent } from './types';
import { NARRATIVE_STYLE_RULES_PROMPT } from '../data/lore-bridge';

// ---- 事件模板类型 ----
export interface EventTemplate {
  id: string;
  category: '自然灾害' | '仙道异变' | '工业事故' | '党争' | '边疆' | '民间';
  name: string;
  description: string;  // DeepSeek填充的场景描述
  trigger_conditions: {
    min_year?: number;
    resource_threshold?: Partial<Record<string, { min?: number; max?: number }>>;
    probability: number; // 每年触发概率 0~1
    required_tags?: string[]; // 需要有此类政策才触发
  };
  severity: 1 | 2 | 3; // 1轻微 2中等 3严重
  choices: EventChoice[]; // 2-4个选项
}

export interface EventChoice {
  id: string;
  label: string;
  description: string;
  effects: Partial<Record<string, number>>;
  requires?: string; // 需要特定资源/知识才能解锁
}

export interface ActiveEvent {
  template: EventTemplate;
  triggered_year: number;
  narrative: string; // LLM生成的事件描述
}

// ---- 事件模板库（DeepSeek填充了description）----
export const EVENT_TEMPLATES: EventTemplate[] = [

  // === 自然灾害 ===
  {
    id: "drought", category: "自然灾害", name: "黄淮大旱", severity: 3,
    description: "靖朝永德三年，黄淮平原已连续八个月未见滴雨。龟裂的田地上，麦秆枯黄如柴，老农跪在田埂边，用皲裂的手掌捧起一把干土，风一吹，只剩下掌心的几粒沙。各地急报如雪片般飞入京城，上面写的都是同一句话：'赤地千里，饿殍遍野。'更糟的是，河道水位已降至百年最低，连漕运都停了——南方的粮食运不过来，北方的灾民正往南逃。",
    trigger_conditions: {
      probability: 0.08,
      resource_threshold: { land_fertility: { max: 0.4 } }
    },
    choices: [
      { id: "relief", label: "开仓赈灾", description: "动用储粮赈济灾民",
        effects: { food: -300, morale: +5, disaster_relief: -100 } },
      { id: "tax_exempt", label: "免除灾区赋税", description: "三年不征灾区税",
        effects: { fiscal: -200, morale: +3, faction: +5 } },
      { id: "ignore", label: "置之不理", description: "让地方自己处理",
        effects: { morale: -8, population: -500 } }
    ]
  },
  {
    id: "flood", category: "自然灾害", name: "江南水患", severity: 2,
    description: "梅雨季节的第七天，长江水位突破了警戒线。堤坝上的民夫已经三天三夜没合眼，但水位还在涨。第八天凌晨，九江段决堤了，洪水像一头挣脱锁链的野兽，瞬间吞没了下游的十几个村庄。地方官站在城墙上往下看，只见汪洋一片，水面上漂着屋顶、家具、还有……尸体。他连夜写了八百里加急，送到京城时，信纸上的墨迹已经被雨水晕开，像泪痕。",
    trigger_conditions: { probability: 0.06 },
    choices: [
      { id: "repair", label: "修缮堤坝", description: "调拨银两修堤",
        effects: { fiscal: -150, land_fertility: +0.05 } },
      { id: "ignore", label: "暂缓处理", description: "等明年预算",
        effects: { morale: -4, food: -150 } }
    ]
  },

  // === 仙道异变 ===
  {
    id: "omen_eclipse", category: "仙道异变", name: "日食天象", severity: 2,
    description: "钦天监三天前就预报了日食，但没人想到会这么巧——偏偏在先帝忌日那天。午时三刻，太阳一点点被黑影吞噬，天地渐渐昏暗，鸟兽惊飞。皇宫里，太监们手忙脚乱地敲钟击鼓，据说这样可以吓跑天狗。国师玄明站在观星台上，手里的星盘飞速旋转，他抬头看天，喃喃自语：'紫微星黯，主……大变。'话音未落，一只乌鸦从头顶飞过，叫了三声，凄厉如哭。",
    trigger_conditions: { probability: 0.04 },
    choices: [
      { id: "pray", label: "举行祭天大典", description: "耗时三日，费银五千两",
        effects: { fiscal: -80, morale: +4 } },
      { id: "science", label: "（穿越者）解释天文现象",
        description: "告知朝臣这是自然规律",
        requires: "modern_knowledge_science",
        effects: { morale: +2, faction: +8, eunuch: -3 } }
    ]
  },

  // === 党争 ===
  {
    id: "faction_conflict", category: "党争", name: "朝堂上书大战", severity: 2,
    description: "事情的起因很小：一个清流御史弹劾帝党官员受贿。帝党反击，说清流结党营私。清流再反击，说帝党欺君罔上。一来二去，朝堂成了战场。每天早朝，两边官员轮番上场，唾沫横飞，引经据典，从祖宗之法吵到孔孟之道，从国家大义吵到个人品行。皇帝坐在龙椅上听，一开始还劝，后来劝不动，就看着他们吵。吵了一个月，政事荒废，奏折堆积如山。内阁首辅急得嘴上起泡，私下求皇帝：'陛下，管管吧，再吵下去，朝廷要散了。'",
    trigger_conditions: { probability: 0.10, resource_threshold: { faction: { min: 60 } } },
    choices: [
      { id: "side_a", label: "支持清流派", description: "方直一党得势",
        effects: { faction: -15, eunuch: -5 } },
      { id: "side_b", label: "支持帝党", description: "钱谦一党得意",
        effects: { faction: -10, eunuch: +5 } },
      { id: "balance", label: "各打五十大板", description: "各罚一月俸禄",
        effects: { faction: -5, morale: -1 } }
    ]
  },

  // === 边疆 ===
  {
    id: "border_raid", category: "边疆", name: "北疆游牧扣边", severity: 2,
    description: "鞑靼骑兵南下的消息，是用八百里加急送来的。信上只有一句话：'敌五万，已破长城三关，距大同百里。'大同守将的求援信随后就到，字迹潦草，能看出写的时候手在抖：'粮尽，箭绝，人疲，城破在即，乞速援！'兵部连夜开会，算来算去，京城能调的兵只有三万，大同守军两万，加起来五万，对五万，看似平手。但兵部尚书知道，鞑靼骑兵的战力，一个顶三个。这仗，不好打。",
    trigger_conditions: { probability: 0.07, resource_threshold: { threat: { min: 40 } } },
    choices: [
      { id: "fight", label: "出兵征讨", description: "调边军迎击",
        effects: { military: -80, threat: -15, morale: +3, fiscal: -200 } },
      { id: "peace", label: "岁币议和", description: "每年输银万两换太平",
        effects: { threat: -20, fiscal: -100, morale: -3 } }
    ]
  },

  // === 民间 ===
  {
    id: "merchant_boom", category: "民间", name: "江南商贸繁荣", severity: 1,
    description: "江南的商人最近很忙。不是忙着赚钱，是忙着花钱——盖宅子，买田地，纳妾，宴客，挥金如土。原因很简单：开海通商后，江南成了贸易中心，商人们赚得盆满钵满。街上到处是新开的店铺，码头停满了商船，连乞丐都比别处穿得好。但繁荣背后，问题也来了：物价飞涨，地价飙升，普通百姓买不起米，租不起房。地方官看在眼里，急在心里，却不敢管——那些商人，背后都有靠山，动不得。",
    trigger_conditions: { probability: 0.05, resource_threshold: { commerce: { min: 400 } } },
    choices: [
      { id: "tax_more", label: "加征商税", description: "趁机多收一成",
        effects: { fiscal: +200, commerce: -30 } },
      { id: "encourage", label: "鼓励发展", description: "给予政策支持",
        effects: { commerce: +80, morale: +2 } }
    ]
  },

  // === 自然灾害（补全至5个）===
  {
    id: "locust", category: "自然灾害", name: "蝗灾肆虐", severity: 2,
    description: "先是北边传来消息，说蝗虫过境，'遮天蔽日'。没人当真，直到第三天，京城上空也黑了。那不是乌云，是蝗群——亿万只蝗虫组成的活风暴。它们落在田野里，咔嚓咔嚓的咀嚼声连成一片，像死神的磨刀声。一个时辰后，那片田就只剩光秃秃的杆子。老农坐在地头，看着空荡荡的田，突然笑了起来，笑完又哭。他说：'完了，全完了。'",
    trigger_conditions: { probability: 0.06, resource_threshold: { land_fertility: { max: 0.6 } } },
    choices: [
      { id: "pesticide", label: "调兵驱蝗", description: "组织军民联合灭蝗", effects: { military: -20, food: -100, morale: +3 } },
      { id: "pray", label: "祭祀天神", description: "命各地举行祈晴仪式", effects: { fiscal: -60, morale: +1 } },
      { id: "import", label: "紧急购粮", description: "从邻省调拨余粮补缺口", effects: { fiscal: -250, food: +200 } }
    ]
  },
  {
    id: "epidemic", category: "自然灾害", name: "瘟疫蔓延", severity: 3,
    description: "最初只是南边几个县有疫情，地方官压着没报。等消息传到京城时，瘟疫已经沿着漕运路线北上，染红了半张地图。京城的南门外搭起了临时的隔离棚，里面躺着几百个病人，面黄肌瘦，咳嗽声此起彼伏。守门的士兵戴着面罩，手里拿着长矛——不是防外敌，是防里面的病人跑出来。太医署的人进去检查，出来时脸色比病人还白。他们说：'这不是普通的瘟疫，是……'",
    trigger_conditions: { probability: 0.05, resource_threshold: { population: { min: 10000 } } },
    choices: [
      { id: "quarantine", label: "封城隔离", description: "封锁疫区，切断传播", effects: { morale: -5, population: -200, commerce: -80 } },
      { id: "medicine", label: "广发药材", description: "从太医院调拨药材", effects: { fiscal: -180, population: +100, morale: +4 } },
      { id: "ignore", label: "秘而不宣", description: "压下消息，避免恐慌", effects: { population: -500, morale: -8, eunuch: +5 } }
    ]
  },
  {
    id: "drought_severe", category: "自然灾害", name: "连年大旱", severity: 3,
    description: "北方已经三年没下过透雨了。第一年，百姓还能啃树皮；第二年，开始卖儿鬻女；第三年，易子而食。黄河的水位降到历史最低，河床裸露出来，上面躺着锈蚀的兵器、破碎的陶罐，还有不知何年何月的白骨。流民像蝗虫一样往南涌，所过之处，寸草不生。地方官不敢开城门，就在城墙上往下扔饼——不是救济，是怕他们攻城。一个饼掉下去，下面的人像饿狼一样扑上去，撕咬、争夺，最后活下来的那个，满嘴是血，也不知道是谁的血。",
    trigger_conditions: { probability: 0.04, resource_threshold: { food: { max: 600 }, morale: { max: 50 } } },
    choices: [
      { id: "move_capital", label: "迁民就食", description: "组织北方流民南迁", effects: { food: -200, morale: -3, population: -100 } },
      { id: "pray_rain", label: "御驾祈雨", description: "皇帝亲自主持祈雨大典", effects: { fiscal: -100, morale: +6, eunuch: +3 } },
      { id: "open_granary", label: "开太仓赈济", description: "动用最后储备", effects: { food: -400, morale: +8, fiscal: -100 } }
    ]
  },

  // === 仙道异变（补全至6个）===
  {
    id: "immortal_visit", category: "仙道异变", name: "方外真人入朝", severity: 1,
    description: "宫门外来了个老头，自称一百二十岁，是终南山下来的真人。他说受天命托梦，前来辅佐圣主，说完从袖子里掏出一枚玉玺，说是前朝传国玉玺——可前朝的玉玺明明在太庙供着。朝臣们炸了锅，有人说他是骗子，有人说他是祥瑞。老头也不争辩，就在宫门外打坐，一坐就是三天，不吃不喝。第三天，他身上开始发光——不是比喻，是真的发光，柔和的白光，像月亮。",
    trigger_conditions: { probability: 0.05 },
    choices: [
      { id: "welcome", label: "礼遇接纳", description: "封为国师，赐观星台", effects: { morale: +5, eunuch: -3, faction: +8, fiscal: -50 } },
      { id: "test", label: "考验真伪", description: "令礼部官员测试其仙法", effects: { faction: -5 } },
      { id: "expel", label: "驱逐出境", description: "视为妖人，押出京城", effects: { morale: -2, eunuch: +3 } }
    ]
  },
  {
    id: "strange_beast", category: "仙道异变", name: "异兽出没山林", severity: 2,
    description: "边境数县接连上报，说山里有怪兽。描述五花八门：有的说像麒麟，有的说像龙，有的说根本没见过，反正很大，会吃人。最新的消息是，那怪兽袭击了一个村庄，叼走了三头牛和两个人。村民组织起来进山围剿，去了三十人，回来五个，个个疯疯癫癫，嘴里念叨：'红的眼睛……好大的牙齿……'边关守将不敢怠慢，连夜写了奏折，用的词很谨慎：'疑似祥瑞，然性凶，请旨定夺。'",
    trigger_conditions: { probability: 0.04 },
    choices: [
      { id: "hunt", label: "遣将围猎", description: "调边军入山围剿", effects: { military: -30, morale: +5, fiscal: -80 } },
      { id: "shaman", label: "请法师驱除", description: "召道士于山口设坛", effects: { fiscal: -60, morale: +3 } },
      { id: "auspicious", label: "宣告祥瑞", description: "颁旨称为天降祥兆", effects: { morale: +8, faction: -10 } }
    ]
  },
  {
    id: "alchemy_boom", category: "仙道异变", name: "炼丹之术兴起", severity: 1,
    description: "不知道从什么时候开始，朝中官员开始流行炼丹。起初只是几个老臣私下搞搞，后来连年轻官员也加入了。再后来，内侍太监也掺和进来，宫里到处是丹炉，烟熏火燎，像道观。内阁已经三天没开会议事了——首辅在家炼丹，次辅在观摩炼丹，剩下的要么在买药材，要么在等丹成。唯一还在办公的，是户部尚书，他拿着官员们报销的丹药费单子，手在抖：'朱砂三百斤，水银五百斤……这哪是炼丹，这是炼金山啊！'",
    trigger_conditions: { probability: 0.06, resource_threshold: { eunuch: { min: 40 } } },
    choices: [
      { id: "ban", label: "下旨禁止", description: "明令禁止官员修道", effects: { faction: -8, morale: -2, eunuch: -10 } },
      { id: "join", label: "皇帝亲试", description: "御用炼丹炉启动", effects: { fiscal: -120, eunuch: +15, morale: -3 } },
      { id: "regulate", label: "颁布管理条例", description: "定下时间允许私下修炼", effects: { faction: +3 } }
    ]
  },
  {
    id: "sky_fire", category: "仙道异变", name: "流星坠于京郊", severity: 2,
    description: "昨夜三更，一道赤光划破夜空，拖着长长的尾巴，坠落在京郊西山。巨响震醒了半个京城，连皇宫的琉璃瓦都在抖。第二天，西山脚下聚集了几千人，都是去看热闹的。陨石坑有十丈宽，深不见底，里面躺着一块黑乎乎的铁疙瘩，还在冒烟。最诡异的是，铁疙瘩上有字——不是汉字，也不是任何已知的文字，弯弯曲曲，像蛇爬。国师玄明第一时间赶到，看了一眼，脸色大变：'这是……天书？'",
    trigger_conditions: { probability: 0.03 },
    choices: [
      { id: "confess", label: "下罪己诏", description: "向天下承认施政过失", effects: { morale: +6, faction: -5, eunuch: -5 } },
      { id: "sacrifice", label: "举行大型祭祀", description: "七日七夜祭天仪式", effects: { fiscal: -150, morale: +4 } },
      { id: "science_explain", label: "（穿越者）科学解释", description: "告知群臣这是陨石，无需惊慌", requires: "modern_knowledge_science", effects: { morale: +3, faction: +10, eunuch: -8 } }
    ]
  },

  // === 工业革命事件（补全至5个）===
  {
    id: "print_boom", category: "工业事故", name: "书坊刊印禁书", severity: 2,
    description: "活字印刷推广后，书坊生意火爆。但最近，市面上出现了一批禁书——不是普通的禁书，是直指朝政、批评皇帝的书。内容辛辣，文笔老练，一看就是官场老手写的。更糟的是，这些书印刷精良，装帧考究，价格还便宜，已经在士子间广为流传。御史台查了三个月，终于锁定了一家书坊，连夜去抄，抄出来三千本禁书，还有一套崭新的活字印刷设备。书坊老板跪在地上，抖得像筛糠：'小人……小人只是印书的，书是别人送来的……'",
    trigger_conditions: { probability: 0.07, required_tags: ["工业"] },
    choices: [
      { id: "ban_books", label: "查封书坊", description: "锦衣卫彻查所有书坊", effects: { eunuch: +5, faction: -8, morale: -3 } },
      { id: "amnesty", label: "特赦从宽", description: "只惩主犯，余人不究", effects: { faction: +5, morale: +2 } },
      { id: "review", label: "设立审查局", description: "建立出版前审查制度", effects: { commerce: -20, faction: -3, eunuch: +3 } }
    ]
  },
  {
    id: "mine_accident", category: "工业事故", name: "矿山塌方事故", severity: 2,
    description: "江西铜矿的塌方发生在深夜，当时矿洞里有一百二十名矿工。巨响过后，洞口被埋了，里面的人生死不明。幸存者组织救援，挖了三天，挖出来八十七具尸体，剩下的三十三人，估计永远埋在里面了。更糟的是，死者的家属闹事，封堵官道，要求赔偿。当地知府压不住，请求朝廷派兵。兵部接到消息，第一反应是：'派多少？''要镇压的话，至少三千。''三千兵，去镇压一群死了丈夫儿子的妇人？'兵部尚书沉默了。",
    trigger_conditions: { probability: 0.05 },
    choices: [
      { id: "relief_pay", label: "赔偿抚恤", description: "拨银两赔偿家属，整改矿场", effects: { fiscal: -200, morale: +5, commerce: +10 } },
      { id: "suppress", label: "镇压暴动", description: "调兵平息矿工骚乱", effects: { military: -20, morale: -5, fiscal: -50 } },
      { id: "investigate", label: "彻查矿主", description: "严查是否违规开采", effects: { faction: -5, fiscal: -30, morale: +3 } }
    ]
  },
  {
    id: "tech_breakthrough", category: "工业事故", name: "匠作局技术突破", severity: 1,
    description: "匠作局的工匠花了三年时间，终于仿制出了西洋水力纺机。试运行那天，围观的官员站了一圈。机器开动，水流带动齿轮，齿轮带动纺锤，棉线像变魔术一样源源不断地吐出来。效率测试：比人力快五倍，而且质量稳定。工部尚书激动得胡子都在抖：'推广！全国推广！'但户部尚书泼了冷水：'一台机器顶五个织工，推广了，那五个织工吃什么？'两人吵了起来，一个说进步，一个说民生，吵到最后，把问题抛给了皇帝：'陛下，您说呢？'",
    trigger_conditions: { probability: 0.05 },
    choices: [
      { id: "promote", label: "全国推广", description: "拨款建设纺织工坊", effects: { commerce: +80, fiscal: -200, morale: +3 } },
      { id: "patent", label: "皇家专营", description: "列为皇家御用产业", effects: { commerce: +40, fiscal: +100, faction: -5 } },
      { id: "ban_tech", label: "压制技术", description: "担心影响手工业者生计", effects: { morale: +2, commerce: -10 } }
    ]
  },
  {
    id: "labor_strike", category: "工业事故", name: "工匠罢工潮", severity: 2,
    description: "京城的工匠们联合起来了。不是造反，是罢工——要求减少工时，提高工钱，还要有固定的休息日。领头的是个老木匠，说话很实在：'一天干六个时辰，一个月才二两银子，不够养家。我们不要多，一天四个时辰，一个月三两，总行吧？'工坊老板们不干，跑到官府告状。官府也头疼：支持工匠，得罪商人；支持商人，工匠闹事。最后，知府想了个折中的法子：'各退一步，一天五个时辰，二两半银子。'工匠们不答应，商人也不答应，僵住了。",
    trigger_conditions: { probability: 0.06, resource_threshold: { commerce: { min: 300 }, morale: { max: 55 } } },
    choices: [
      { id: "negotiate", label: "官府调解", description: "命户部出面协商条件", effects: { morale: +4, commerce: -20, fiscal: -50 } },
      { id: "force_work", label: "强令复工", description: "以律法强制工匠复工", effects: { morale: -6, commerce: +10, eunuch: +3 } },
      { id: "reform", label: "颁布匠户保护令", description: "正式规定最低工时待遇", effects: { morale: +6, commerce: +20, fiscal: -80, faction: -5 } }
    ]
  },

  // === 党争/宦官作乱（补全至6个）===
  {
    id: "exam_scandal", category: "党争", name: "科举舞弊大案", severity: 3,
    description: "今科殿试放榜后，落第举子们联名上书，指控今科状元行贿考官。证据是一封密信，上面写着：'事成之后，白银万两，江南田宅三处。'笔迹经鉴定，确是状元亲笔。礼部尚书慌了，连夜审问状元。状元不认，说是诬陷。审了一夜，没结果。第二天，更多证据出现：考官的账本、中间人的供词、甚至还有一份'分赃名单'。名单上的人，从考官到阅卷官到监考官，一共十七人，个个是朝廷命官。这案子，捂不住了。",
    trigger_conditions: { probability: 0.06, resource_threshold: { faction: { min: 50 } } },
    choices: [
      { id: "retake", label: "重开恩科", description: "宣布本科成绩作废，重新考试", effects: { morale: +5, fiscal: -100, faction: -10 } },
      { id: "punish_all", label: "严查彻办", description: "锦衣卫介入，牵连甚广", effects: { eunuch: +8, faction: -15, morale: -3 } },
      { id: "cover", label: "从轻发落", description: "只罚考官，维护榜单", effects: { faction: +5, morale: -5 } }
    ]
  },
  {
    id: "eunuch_power", category: "党争", name: "司礼监专擅朝政", severity: 3,
    description: "司礼监掌印太监王福全最近有点飘。先是私下批了几道奏折，后来干脆代皇帝拟旨。内阁发现不对劲，质问他，他笑呵呵地说：'陛下日理万机，奴才帮着分担分担。'再后来，连官员任免他都敢插手了。某地知府空缺，他推荐了自己的干儿子；某部侍郎出缺，他收了三万两银子，把位置卖给了一个商人。内阁忍无可忍，联名上疏弹劾，用的词很重：'阉竖窃柄，国将不国！'奏疏送到皇帝面前时，王福全正站在旁边，脸色白得像纸。",
    trigger_conditions: { probability: 0.07, resource_threshold: { eunuch: { min: 65 } } },
    choices: [
      { id: "purge_eunuch", label: "打压宦官", description: "杖责秉笔太监，收回批红权", effects: { eunuch: -20, faction: -8, morale: +4 } },
      { id: "use_eunuch", label: "顺势利用", description: "借宦官势力压制阁臣", effects: { eunuch: +10, faction: -15, morale: -5 } },
      { id: "balance", label: "各打五十大板", description: "警告双方，维持均势", effects: { faction: -5, eunuch: -5 } }
    ]
  },
  {
    id: "faction_purge", category: "党争", name: "东林清流弹劾帝党", severity: 2,
    description: "清流派的弹劾攻势开始了。不是一次两次，是连续半个月，每天都有新弹劾，目标全是帝党要员。罪名五花八门：贪污、渎职、结党、欺君……每本奏折都写得义正词严，证据详实。帝党被打懵了，反应过来后开始反击，也弹劾清流。但清流早有准备，每项指控都有反证，每份证据都有备份。朝堂成了法庭，官员成了被告和原告，皇帝成了法官。法官很累，因为案子太多，审不过来。",
    trigger_conditions: { probability: 0.08, resource_threshold: { faction: { min: 55 } } },
    choices: [
      { id: "side_clean", label: "支持清流", description: "严查帝党要员腐败", effects: { faction: -15, eunuch: -8, morale: +5 } },
      { id: "side_emperor", label: "保护帝党", description: "压制清流，维护心腹", effects: { faction: -10, eunuch: +8, morale: -4 } },
      { id: "dismiss_all", label: "廷杖各方", description: "被弹劾者降职，弹劾者也受罚", effects: { faction: -20, morale: -2, eunuch: -5 } }
    ]
  },

  // === 边疆危机（补全至5个）===
  {
    id: "pirate_raid", category: "边疆", name: "倭寇入侵沿海", severity: 2,
    description: "倭寇来得毫无征兆。前一天还在海上，第二天就登陆了，像从海里冒出来的一样。他们不攻城，只劫掠——洗劫沿海村庄，抢完就走，等官兵赶到时，只剩一片狼藉和满地尸体。浙江巡抚的奏折写得很绝望：'倭寇来去如风，官兵疲于奔命。今日剿东，明日劫西，防不胜防。沿海百姓，十室九空，或死或逃，请朝廷速派水师！'但水师在哪？靖朝的水师，三十年前就裁撤了，现在只剩几条破船，在港口里生锈。",
    trigger_conditions: { probability: 0.06, resource_threshold: { military: { max: 2500 } } },
    choices: [
      { id: "send_troops", label: "调水师征讨", description: "抽调精锐水师入浙", effects: { military: -60, threat: -10, fiscal: -150, morale: +3 } },
      { id: "recruit", label: "招募乡勇", description: "允许地方自行募兵防卫", effects: { threat: -5, faction: +5, commerce: -30 } },
      { id: "pay_off", label: "招抚倭首", description: "许以互市之利换取停火", effects: { threat: -8, morale: -4, commerce: +40 } }
    ]
  },
  {
    id: "army_mutiny", category: "边疆", name: "边军哗变", severity: 3,
    description: "西北边军的哗变，其实早有预兆。粮饷拖欠半年，冬衣至今未发，将士们靠喝稀粥度日。带头的副将去找主将理论，主将不见，说'朝廷自有安排'。副将回来，把这话转告将士，将士们笑了，笑完就抄家伙。他们杀了主将，控制了军营，然后派人送信给朝廷，条件很简单：发饷，发粮，发冬衣，否则就南下'自取'。信送到兵部时，兵部尚书看完，只说了一句：'要钱没有，要命……'后半句没说完。",
    trigger_conditions: { probability: 0.05, resource_threshold: { military: { max: 1800 }, fiscal: { max: 3000 } } },
    choices: [
      { id: "pay_ransom", label: "紧急拨发欠饷", description: "凑足银两安抚军心", effects: { fiscal: -400, military: +30, threat: -5 } },
      { id: "negotiate", label: "派使节招抚", description: "封赏哗变首领换取归顺", effects: { faction: -8, threat: -8, military: -10 } },
      { id: "punish", label: "发兵镇压", description: "视为叛乱，武力平息", effects: { military: -100, fiscal: -200, threat: +5, morale: -5 } }
    ]
  },
  {
    id: "tribute_state", category: "边疆", name: "藩属国请求支援", severity: 2,
    description: "西南小国占城的使者，是爬着进京城的——他的国家被北方的真腊入侵，城破在即，他连夜出逃，一路颠簸，到京城时只剩半条命。他跪在殿前，用生硬的汉语说：'陛下，救救占城……真腊若灭占城，下一个就是靖朝……'说完就晕过去了。太医检查后说，是饿晕的，身上还有伤。皇帝看着这个瘦小的使者，问群臣：'救，还是不救？'主救的说唇亡齿寒，主不救的说自身难保。吵了一上午，没结果。",
    trigger_conditions: { probability: 0.05, resource_threshold: { threat: { min: 30 } } },
    choices: [
      { id: "aid", label: "遣兵援助", description: "出兵保护藩属", effects: { military: -80, threat: -10, fiscal: -200, faction: +5 } },
      { id: "supplies", label: "仅给物资", description: "赠送武器粮草，不出兵", effects: { fiscal: -100, threat: -3 } },
      { id: "abandon", label: "坐视不理", description: "以国力不足为由拒绝", effects: { threat: +8, morale: -3, faction: -5 } }
    ]
  },

  // === 民间异动（补全至5个）===
  {
    id: "peasant_revolt", category: "民间", name: "饥民暴动", severity: 3,
    description: "河南的饥民暴动，其实是被逼出来的。连续三年大旱，颗粒无收，朝廷的赈灾粮要么没发，要么发到手里只剩三成。百姓饿得受不了，开始抢粮仓。第一次抢，官府镇压了，杀了十几个人。第二次抢，人更多，官府又镇压，又杀了几十个。第三次，不用抢了，直接暴动。领头的不是土匪，是个落第秀才，读过几本书，会写几句诗。他带着几千饥民，打出'均田免粮'的旗号，攻破了两座县城。现在，正在打第三座。",
    trigger_conditions: { probability: 0.06, resource_threshold: { food: { max: 500 }, morale: { max: 40 } } },
    choices: [
      { id: "suppress_hard", label: "大军征剿", description: "调精锐彻底平叛", effects: { military: -100, fiscal: -300, morale: -3, threat: -5 } },
      { id: "amnesty_revolt", label: "招安首领", description: "许以官职换取投降", effects: { military: -20, faction: -10, morale: +3 } },
      { id: "reform_food", label: "开仓并减税", description: "釜底抽薪，让暴动失去民心", effects: { food: -400, fiscal: -100, morale: +8, threat: -8 } }
    ]
  },
  {
    id: "merchant_guild", category: "民间", name: "商帮势力崛起", severity: 1,
    description: "江南的商人们最近成立了'江南商帮'，会长是个姓刘的盐商，据说家产百万。商帮成立后，第一件事就是垄断市场——粮食、布匹、盐铁，全被他们控制。价格他们定，货源他们控，连官府采购都要通过他们。地方官不是不想管，是管不了。商帮有钱，有钱就能买通官员；商帮有人，有人就能控制市场。最近，商帮开始放贷了，利息高得吓人，但百姓没办法，只能借。借了还不起，就卖田卖房，最后卖儿卖女。",
    trigger_conditions: { probability: 0.06, resource_threshold: { commerce: { min: 450 } } },
    choices: [
      { id: "tax_heavily", label: "重征商税", description: "打压商帮过快膨胀", effects: { commerce: -60, fiscal: +200, morale: -2 } },
      { id: "cooperate", label: "官商合作", description: "引导商帮承接官府采购", effects: { commerce: +40, fiscal: +80, faction: -5 } },
      { id: "charter", label: "颁发特许状", description: "赋予合法地位以换监管权", effects: { commerce: +60, fiscal: +50, faction: -3 } }
    ]
  },
  {
    id: "secret_society", category: "民间", name: "白莲教暗中传播", severity: 2,
    description: "锦衣卫的密报，是在一个深夜送到皇帝手里的。报告很厚，内容很吓人：白莲教已在北方七省秘密发展教众，人数超过十万。他们不公开活动，只在夜间聚会，念经，练功，还有……练兵。教义很简单：'无生老母，真空家乡；明王出世，天下太平。'翻译过来就是：推翻朝廷，建立新朝。更可怕的是，教徒中有不少是官员、士兵、甚至太监。皇帝看完密报，问锦衣卫指挥使：'头目是谁？'指挥使跪着答：'还没查到。只知道，他们称他为'弥勒佛转世'。'",
    trigger_conditions: { probability: 0.05, resource_threshold: { morale: { max: 55 } } },
    choices: [
      { id: "crack_down", label: "全面清查", description: "锦衣卫大规模搜捕", effects: { eunuch: +10, morale: -4, faction: -5, threat: -8 } },
      { id: "infiltrate", label: "暗中渗透", description: "安插卧底等待时机", effects: { eunuch: +3, threat: -3 } },
      { id: "amnesty_relig", label: "颁令宽容", description: "只要不暴力，允许信仰自由", effects: { morale: +5, faction: +5, threat: +5 } }
    ]
  }

  // TODO: 可继续补充至32个
];

// ---- 核心函数 ----

/**
 * 每tick检查是否触发事件
 * 在 tick.ts 的世界模拟阶段调用
 */
export function checkEventTriggers(state: GameState): EventTemplate[] {
  const triggered: EventTemplate[] = [];
  const r = state.resources;

  for (const template of EVENT_TEMPLATES) {
    const cond = template.trigger_conditions;

    // 年份检查
    if (cond.min_year && state.world.year < cond.min_year) continue;

    // 资源阈值检查
    let resourceOk = true;
    if (cond.resource_threshold) {
      for (const [key, range] of Object.entries(cond.resource_threshold)) {
        const val = (r as any)[key] ?? 0;
        if (range.min !== undefined && val < range.min) { resourceOk = false; break; }
        if (range.max !== undefined && val > range.max) { resourceOk = false; break; }
      }
    }
    if (!resourceOk) continue;

    // 政策标签检查
    if (cond.required_tags?.length) {
      const activeTags = state.policies.active.flatMap(p => p.tags);
      if (!cond.required_tags.every(t => activeTags.includes(t))) continue;
    }

    // 同一事件当年只触发一次
    const alreadyPending = state.events.pending.some(p => p.template_id === template.id);
    if (alreadyPending) continue;

    // 概率检查（严重事件+双倍概率）
    const effectiveProb = cond.probability * (template.severity === 3 ? 1.5 : 1);
    if (Math.random() < effectiveProb) { triggered.push(template); }
  }

  return triggered;
}

/**
 * 生成事件叙事（调用LLM，可选）
 */
export async function narrateEvent(
  template: EventTemplate,
  state: GameState
): Promise<string> {
  try {
    const raw = await callLLMWithRetry({
      system: `你是靖朝皇帝游戏的事件叙述者。
${NARRATIVE_STYLE_RULES_PROMPT}
输出纯文本叙事，不超过150字，不要JSON。`,
      user: `事件：${template.name}
背景：${template.description}
当前：${state.world.dynasty}${state.world.era}${state.world.year}年，民心${state.resources.morale}，国库${state.resources.fiscal}
请用靖朝文风叙述这个事件的经过，结尾留悬念等待玩家决策。`,
      temperature: 0.8,
      tag: 'event_narration'
    });
    return raw.trim();
  } catch {
    return template.description || `${template.name}突然发生，需要陛下裁决。`;
  }
}

/**
 * 执行玩家的事件选择
 */
export function resolveEventChoice(
  state: GameState,
  templateId: string,
  choiceId: string
): { newState: GameState; narrative: string } {
  const template = EVENT_TEMPLATES.find(t => t.id === templateId);
  const choice   = template?.choices.find(c => c.id === choiceId);

  if (!template || !choice) {
    return { newState: state, narrative: '事件处理完毕。' };
  }

  // 应用资源变化
  const newState = { ...state, resources: { ...state.resources } };
  for (const [key, delta] of Object.entries(choice.effects)) {
    if (key in newState.resources) {
      (newState.resources as any)[key] = Math.max(0, ((newState.resources as any)[key] ?? 0) + delta);
    }
  }

  // 从pending移除
  newState.events = {
    ...state.events,
    pending: state.events.pending.filter(p => p.template_id !== templateId)
  };

  // 加入集体记忆
  const memory = `${state.world.year}年${template.name}（${choice.label}）`;
  newState.world = {
    ...state.world,
    collective_memory: [...state.world.collective_memory.slice(-19), memory]
  };

  // 党争类事件派系联动
  if (template.category === '党争') {
    // 确保factions对象存在
    if (!newState.world.factions) {
      newState.world.factions = { qingliu: 50, didang: 50, eunuch_faction: 30 };
    }

    // 根据玩家选择修改派系势力
    if (choiceId.includes('qingliu') || choice.label.includes('清流')) {
      // 支持清流
      newState.world.factions.qingliu = Math.max(0, Math.min(100, newState.world.factions.qingliu + 10));
      newState.world.factions.didang = Math.max(0, Math.min(100, newState.world.factions.didang - 8));
    } else if (choiceId.includes('didang') || choice.label.includes('帝党')) {
      // 支持帝党
      newState.world.factions.didang = Math.max(0, Math.min(100, newState.world.factions.didang + 10));
      newState.world.factions.qingliu = Math.max(0, Math.min(100, newState.world.factions.qingliu - 8));
    } else if (choiceId.includes('neutral') || choice.label.includes('各打五十大板') || choice.label.includes('中立')) {
      // 各打五十大板
      newState.world.factions.qingliu = Math.max(0, Math.min(100, newState.world.factions.qingliu - 5));
      newState.world.factions.didang = Math.max(0, Math.min(100, newState.world.factions.didang - 5));
    }
  }

  return {
    newState,
    narrative: `陛下选择「${choice.label}」。${choice.description}。`
  };
}
