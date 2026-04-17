// 技能内容预编译（占位，待 mimo 素材填充）

export interface SkillContent {
  id: string;
  name: string;
  description: string;
  content: string;
  tags: string[];
}

export const SKILLS_BUNDLE: Record<string, SkillContent> = {
  tax_increase: {
    id: 'tax_increase',
    name: '增加税收',
    description: '提高税率以增加财政收入',
    content: `
## 增加税收

### 执行条件
- 税率 < 30%
- 民心 > 40
- 财政 < 10000

### 执行效果
- 财政 +15%
- 民心 -10%
- 商业 -5%

### 可能风险
- 民心过低可能引发骚乱
- 商业受损影响长期税收
    `,
    tags: ['经济', '财政', '政策']
  },
  tax_decrease: {
    id: 'tax_decrease',
    name: '减少税收',
    description: '降低税率以安抚民心',
    content: `
## 减少税收

### 执行条件
- 税率 > 5%
- 财政 > 2000

### 执行效果
- 财政 -10%
- 民心 +15%
- 商业 +8%

### 可能风险
- 财政收入减少
- 可能影响军事投入
    `,
    tags: ['经济', '财政', '政策']
  },
  military_move: {
    id: 'military_move',
    name: '调动军队',
    description: '调动军队到指定位置',
    content: `
## 调动军队

### 执行条件
- 兵力 > 1000
- 军费 > 100

### 执行效果
- 兵力重新部署
- 军费 -50
- 威慑力 +20%

### 可能风险
- 边防空虚
- 军费增加
    `,
    tags: ['军事', '防御', '战略']
  },
  appointment: {
    id: 'appointment',
    name: '任命官员',
    description: '任命或提拔官员',
    content: `
## 任命官员

### 执行条件
- 有空缺职位
- 候选人合适

### 执行效果
- 行政效率 +10%
- 相关派系忠诚度变化

### 可能风险
- 派系斗争加剧
- 官员能力不足
    `,
    tags: ['政治', '人事', '行政']
  },
  pardon: {
    id: 'pardon',
    name: '赦免罪犯',
    description: '赦免罪犯以显示仁慈',
    content: `
## 赦免罪犯

### 执行条件
- 有在押罪犯
- 威望 > 30

### 执行效果
- 民心 +10%
- 威望 +5%
- 治安 -5%

### 可能风险
- 犯罪率上升
- 受害者不满
    `,
    tags: ['法律', '仁政', '社会']
  },
  conscription: {
    id: 'conscription',
    name: '征召士兵',
    description: '征召平民入伍',
    content: `
## 征召士兵

### 执行条件
- 人口 > 5000
- 民心 > 50

### 执行效果
- 兵力 +500
- 人口 -300
- 农业人口 -200

### 可能风险
- 农业生产受影响
- 民心下降
    `,
    tags: ['军事', '人口', '动员']
  },
  construction: {
    id: 'construction',
    name: '修筑建筑',
    description: '修筑城墙、道路等基础设施',
    content: `
## 修筑建筑

### 执行条件
- 财政 > 2000
- 人口 > 3000

### 执行效果
- 防御力 +15%
- 商业 +10%
- 财政 -1000

### 可能风险
- 财政压力
- 劳役过重
    `,
    tags: ['建设', '防御', '经济']
  },
  prohibition: {
    id: 'prohibition',
    name: '颁布禁令',
    description: '颁布特定行为的禁令',
    content: `
## 颁布禁令

### 执行条件
- 威望 > 40
- 行政效率 > 50

### 执行效果
- 相关行为减少
- 可能影响特定群体

### 可能风险
- 黑市滋生
- 民众不满
    `,
    tags: ['法律', '社会', '控制']
  },
  decree: {
    id: 'decree',
    name: '下达诏书',
    description: '发布皇帝诏书',
    content: `
## 下达诏书

### 执行条件
- 威望 > 30

### 执行效果
- 政策实施
- 官僚系统执行

### 可能风险
- 执行不力
- 阳奉阴违
    `,
    tags: ['政治', '命令', '行政']
  },
  general: {
    id: 'general',
    name: '通用处理',
    description: '处理未分类的指令',
    content: `
## 通用处理

### 执行条件
- 无特殊条件

### 执行效果
- 根据具体情况处理

### 可能风险
- 处理不当
    `,
    tags: ['通用', '其他']
  }
};

// 获取技能内容
export function getSkillBundleContent(skillId: string): string {
  const skill = SKILLS_BUNDLE[skillId];
  return skill ? skill.content : '';
}

// 获取技能标签
export function getSkillTags(skillId: string): string[] {
  const skill = SKILLS_BUNDLE[skillId];
  return skill ? skill.tags : [];
}