export const LABELS_ZH: Record<string, string> = {
  // 特质
  loyalty: '忠诚',
  ambition: '野心',
  greed: '贪婪',
  courage: '胆量',
  rationality: '理性',
  stability: '稳定性',
  
  // NPC状态
  pressure: '压力',
  satisfaction: '满足感',
  loyalty_to_emperor: '对皇帝忠诚度',
  
  // 资源
  morale: '民心',
  fiscal: '财政',
  military: '兵力',
  eunuch: '宦官势力',
  threat: '外敌威胁',
  faction: '党争烈度',
  food: '粮食',
  population: '人口',
  tax_rate: '税率',
  commerce: '商业',
  land_fertility: '土地肥力',
  agri_pop: '农业人口',
  military_cost: '军费',
  disaster_relief: '赈灾支出',
  
  // 世界状态
  weather_this_year: '今年天气',
  conflict_ratio: '冲突程度',
  tone: '世界基调',
  
  // 其他
  prestige: '威望',
  age: '年龄',
  generation: '世代',
  year: '年份',
  dynasty: '朝代',
  era: '年号'
};

// 获取中文标签
export function getLabel(key: string): string {
  return LABELS_ZH[key] || key;
}

// 格式化数值显示
export function formatValue(key: string, value: unknown): string {
  if (typeof value === 'number') {
    // 百分比字段
    if (['tax_rate', 'land_fertility', 'weather_this_year', 'conflict_ratio'].includes(key)) {
      return `${(value * 100).toFixed(1)}%`;
    }
    
    // 整数字段
    if (['food', 'population', 'fiscal', 'military', 'morale', 'eunuch', 'threat', 'faction', 'commerce', 'agri_pop', 'military_cost', 'disaster_relief'].includes(key)) {
      return value.toLocaleString();
    }
    
    // 特质和状态（0-100）
    if (['loyalty', 'ambition', 'greed', 'courage', 'rationality', 'stability', 'pressure', 'satisfaction', 'loyalty_to_emperor'].includes(key)) {
      return `${value}/100`;
    }
  }
  
  return String(value);
}