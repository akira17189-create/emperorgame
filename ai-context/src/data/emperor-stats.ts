/**
 * 皇帝个人数值面板数据
 * 文案来源：DeepSeek 皇帝个人数值面板_v2.json
 */

export interface StatTier {
  min: number;
  max: number;
  title: string;
  description: string;
  multiplier: number;
}

export interface EmperorStatDef {
  field: 'prestige' | 'virtue' | 'subtlety' | 'statecraft';
  label: string;
  definition: string;
  tiers: StatTier[];
  effects: Array<{ narrative: string; mechanic: string }>;
}

export const EMPEROR_STAT_DEFS: EmperorStatDef[] = [
  {
    field: 'prestige',
    label: '威望',
    definition: '帝王威仪，四海归心，令行禁止之根本。',
    tiers: [
      { min: 0,  max: 20,  title: '主少国疑', multiplier: 0.2,
        description: '永德元年春，朝野观望。王福全批红时会多加一句"请内阁复核"，旨意出宫门常被内阁打回。张猛奏报军情时会绕开御前，直接找谢渊商议。方直弹劾郑经，奏疏只送都察院存档，都不递到御案上。十八岁的皇帝坐在龙椅上，听着大臣们讨论"先帝旧制"，感觉自己像个局外人。' },
      { min: 21, max: 40,  title: '渐立威仪', multiplier: 0.5,
        description: '永德二年，处理了几桩贪腐案后，钱谦开始把"陛下圣明"挂在嘴边——虽然说得有点早。王福全批红时不再擅自润色，原样转抄圣旨。郑经递边防策前会先试探"陛下觉得北境如何"。张猛依旧直来直去，但奏报时会多解释几句"末将为何如此想"。' },
      { min: 41, max: 60,  title: '威权初立', multiplier: 0.8,
        description: '永德三年，旨意出宫无人敢公然拖延。方直想弹劾郑经，奏疏写到一半搁笔——去年那道"斥新政"的折子，陛下只说了"知道了"，半月后他就从正四品贬到正五品。谢渊递军情密报，会特意标注"已核三遍"。朝会争执渐少，大臣开始揣摩圣意而非争输赢。' },
      { min: 61, max: 80,  title: '乾纲独断', multiplier: 1.0,
        description: '永德五年冬，朝会肃静。王福全躬身更低，递茶时手指不抖。方直弹章措辞谨慎，每句都引经据典，生怕被斥"妄议"。张猛调兵前必奏，连换防五百人都写详细理由。重大决策前，重臣会私下试探口风，没人再敢把圣意当可争之物。' },
      { min: 81, max: 100, title: '君威如岳', multiplier: 1.3,
        description: '永德八年，一言定乾坤。方直退休前上最后一疏，开头写"臣老眼昏花，若言辞不当，乞陛下恕罪"——这位"方铁头"一辈子没说过软话。郑经的新政推行无阻，地方官听到"钦差"二字即刻整衣冠候旨。史官记录御前对话，笔锋自带敬畏。' },
    ],
    effects: [
      { narrative: '旨意出宫，六部不敢公然拖延', mechanic: 'policy_execution_speed_bonus' },
      { narrative: '臣工奏对时更谨慎，阳奉阴违减少', mechanic: 'npc_loyalty_modifier' },
      { narrative: '外患被动下降，邻国挑衅前会三思', mechanic: 'threat_decay' },
    ],
  },
  {
    field: 'virtue',
    label: '德行',
    definition: '修身立德，垂范天下，为君者立身之本。',
    tiers: [
      { min: 0,  max: 20,  title: '德不配位', multiplier: 0.2,
        description: '永德元年，朝野窃议"主德有亏"。李静斋讲经时特意强调"克己复礼"章节，眼睛却盯着地板。方直弹劾王福全，奏疏里暗藏规谏"陛下宜近君子远小人"。玄明在丹房研磨朱砂，轻声说"修道先修德，炼丹先炼心"——这话明显不是说给自己听的。' },
      { min: 21, max: 40,  title: '修身不谨', multiplier: 0.5,
        description: '永德二年，皇帝偶有逾矩。方直会上疏提醒"保重圣体"，措辞温和得像老母亲。李静斋讲《帝范》时，会多停留"慎独"那页半炷香。玄明观星后禀报"紫微星黯淡，主君德有亏"，说完低头整理道袍，不看皇帝眼睛。' },
      { min: 41, max: 60,  title: '中正平和', multiplier: 0.8,
        description: '永德三年，起居注记载平实。方直弹劾贪官时不再夹带私货。玄明观星禀报只说星象，不提"君德"。钱谦的"陛下圣明"说得自然些了。朝臣评价"守成之君，循规蹈矩"——这在靖朝算褒奖。民间议论渐息，史官下笔无甚波澜。' },
      { min: 61, max: 80,  title: '德行昭彰', multiplier: 1.0,
        description: '永德五年，重臣私下赞"主上仁厚"。李静斋讲经会以御前言行佐证经典。玄明炼丹成功，会说"丹成乃陛下德感天地"。郑经地方考察回来，奏报里写"百姓感念圣德，虽遇灾年亦无怨言"。地方官奏章开始出现"皇恩浩荡"字样，虽属套话，语气真诚。' },
      { min: 81, max: 100, title: '圣德流光', multiplier: 1.3,
        description: '永德八年，德行如日昭彰。方直致仕前上疏"臣侍陛下八载，未见一失德之举"——从"方铁头"嘴里说出，比黄金还真。郑经的新政被民间称为"永德仁政"。地方立生祠者渐多，虽被朝廷禁止，香火不绝。敌国使臣朝见后，归国禀报"中国有仁君，不可轻犯"。' },
    ],
    effects: [
      { narrative: '德行高则民心自然增长，百姓拥戴', mechanic: 'morale_passive_bonus' },
      { narrative: '清流派更愿效忠，言官敢直言进谏', mechanic: 'npc_satisfaction_modifier' },
      { narrative: '史册笔法趋于正面，影响历史评价', mechanic: 'chronicle_tone_shift' },
    ],
  },
  {
    field: 'subtlety',
    label: '心性',
    definition: '帝王心术，喜怒不形，权衡利弊之机枢。',
    tiers: [
      { min: 0,  max: 20,  title: '稚嫩易窥', multiplier: 0.2,
        description: '永德元年，心思如清水见底。朝会时情绪全在脸上，王福全看一眼就知道该奉热茶还是凉茶。钱谦总能提前半句接话，因为陛下嘴角一动他就猜出要问什么。重大决策前，皇帝会无意识摩挲玉扳指，这习惯满朝文武都知道。' },
      { min: 21, max: 40,  title: '渐藏心绪', multiplier: 0.5,
        description: '永德二年，学会掩饰简单情绪。王福全需要观察更久才能确定圣心——陛下现在生气时会先喝茶再说话。钱谦的"陛下圣明"有时会说早，因为猜错了表情。愤怒时会借口更衣离席，平静片刻再回来。' },
      { min: 41, max: 60,  title: '心思难测', multiplier: 0.8,
        description: '永德三年，日常朝会面无表情。王福全奉茶时会犹豫水温——陛下现在说"烫"可能是真烫，也可能是心情不好。钱谦的"陛下圣明"说得谨慎了，因为他有三成概率猜错。决策前会故意放出矛盾信号，观察各派反应。' },
      { min: 61, max: 80,  title: '深不可测', multiplier: 1.0,
        description: '永德五年，连王福全也常猜错圣意。郑经的新政方案被全盘采纳，但他不知道陛下是真赞成还是另有用意。陛下会用荒诞提议测试忠诚，比如突然问"若朕要修仙如何"，事后轻描淡写"玩笑而已"。臣工议事时，会因陛下一个眼神改变立场。' },
      { min: 81, max: 100, title: '天心难问', multiplier: 1.3,
        description: '永德八年，满朝文武无人敢言"知圣心"。钱谦退休后对子孙说"我侍君三十载，不知君心"——这是唯一的大实话。张猛临终前感慨"陛下用我如弈棋，我却不知自己是车是卒"。决策如天外飞仙，事后方显深意。后世史家争论其真实意图，终无定论。' },
    ],
    effects: [
      { narrative: '能识破暗中行动，降低被蒙蔽概率', mechanic: 'hidden_action_detection' },
      { narrative: '获取情报更真实准确，减少虚假信息', mechanic: 'info_accuracy_bonus' },
      { narrative: '危机事件处置更冷静，提高决策质量', mechanic: 'event_handling_quality' },
    ],
  },
  {
    field: 'statecraft',
    label: '手腕',
    definition: '治国理政，操弄权柄，驾驭臣工之实能。',
    tiers: [
      { min: 0,  max: 20,  title: '生疏稚拙', multiplier: 0.2,
        description: '永德元年，朝政如乱麻。王福全批红后要逐条解释"此为何意"。钱谦递奏章时会特意标注"重点在第三段"。张猛军情急报，皇帝常问"雁门关在哪""北狄是谁"。谢渊的情报分析被迫写成"看图说话"版。内阁呈递票拟，王福全要解释半个时辰。' },
      { min: 21, max: 40,  title: '初窥门径', multiplier: 0.5,
        description: '永德二年，能处理日常政务。王福全批红不再解释基本概念。钱谦的奏章只需标注关键数据。遇大事仍需问策于重臣，但能听懂七成了。派系斗争一起，仍如坠雾中，常被当枪使而不自知。户部玩数字游戏，能看出明显破绽了。' },
      { min: 41, max: 60,  title: '游刃有余', multiplier: 0.8,
        description: '永德三年，常规政务处理娴熟。郑经的方案被全盘采纳，而且陛下能提出修改意见。能同时应对三四件要务。能看出奏章字里行间的派系立场。官员调动时，会考虑制衡。宦官的小动作，开始有所察觉。' },
      { min: 61, max: 80,  title: '老辣干练', multiplier: 1.0,
        description: '永德五年，政事如观掌纹。郑经的新政推行，陛下能预判"清流会如何反对，宦官会如何利用"。重大决策前已备好三套预案，视朝臣反应选用。能用赏罚微调派系平衡，不露痕迹。宦官弄权，反成掌中棋子。边将虚报战功，报来数字便知水分几何。' },
      { min: 81, max: 100, title: '炉火纯青', multiplier: 1.3,
        description: '永德八年，治国如烹小鲜。钱谦退休时感慨"我一生钻营，不如陛下随手一着棋"。一套人事调整，可定十年朝局。能用清流制宦官，用武将牵文臣，自己稳坐钓鱼台。后世评价：靖朝政事，永德年间最为高效清明。' },
    ],
    effects: [
      { narrative: '政策制定质量更高，推行更顺利', mechanic: 'policy_execution_speed_bonus' },
      { narrative: '财政与资源分配更合理，浪费减少', mechanic: 'fiscal_efficiency_bonus' },
      { narrative: '派系平衡更精准，党争烈度可控', mechanic: 'faction_balance_control' },
    ],
  },
];

/** 根据数值取当前阶段 */
export function getStatTier(def: EmperorStatDef, value: number): StatTier {
  return def.tiers.find(t => value >= t.min && value <= t.max) ?? def.tiers[0];
}
