// C 档字符串插值引擎
export interface Template {
  id: string;
  condition?: string;
  severity: number;
  text: string;
}

export const TEMPLATES: Template[] = [
  // 天气相关
  {
    id: 'weather_good',
    condition: 'weather_this_year > 0.8',
    severity: 1,
    text: '{year}年春，风调雨顺，百姓少有怨声。'
  },
  {
    id: 'weather_bad',
    condition: 'weather_this_year < 0.3',
    severity: 2,
    text: '{year}年夏，大旱，赤地千里，饥民流离。'
  },
  // 财政相关
  {
    id: 'fiscal_warning',
    condition: 'fiscal < 1000',
    severity: 2,
    text: '{year}年，户部奏报：国库余粮仅可支用半载，请圣裁。'
  },
  {
    id: 'tax_increase_success',
    condition: 'fiscal > 1000',
    severity: 1,
    text: '建兴{year}年，户部上奏加征{value}两白银，国库得以充实。'
  },
  {
    id: 'tax_increase_fail',
    condition: 'fiscal <= 1000',
    severity: 3,
    text: '建兴{year}年，加税政策引发民怨，{location}地区出现骚乱。'
  },
  // 军事相关
  {
    id: 'military_victory',
    condition: 'military > 5000',
    severity: 1,
    text: '建兴{year}年，我军在{location}大破敌军，斩首{value}级。'
  },
  {
    id: 'military_defeat',
    condition: 'military <= 5000',
    severity: 3,
    text: '建兴{year}年，{location}失守，守将{npc_name}战死。'
  },
  // 灾害相关
  {
    id: 'flood_disaster',
    condition: 'weather_this_year < 0.3',
    severity: 2,
    text: '建兴{year}年，黄河决口，淹没良田{value}顷，灾民遍野。'
  },
  // 政治相关
  {
    id: 'political_stability',
    condition: 'faction < 30',
    severity: 1,
    text: '{year}年，朝政清明，各部协调，政令畅通。'
  },
  {
    id: 'political_conflict',
    condition: 'faction > 70',
    severity: 3,
    text: '{year}年，党争激烈，朝臣相互攻讦，政事荒废。'
  }
];

export function renderTemplate(id: string, vars: Record<string, unknown>): string {
  const template = TEMPLATES.find(t => t.id === id);
  if (!template) {
    return '';
  }
  
  let result = template.text;
  
  // 替换占位符
  for (const [key, value] of Object.entries(vars)) {
    const placeholder = `{${key}}`;
    result = result.replace(new RegExp(placeholder, 'g'), String(value));
  }
  
  return result;
}

// 条件渲染函数
export function renderConditionalTemplate(
  id: string,
  vars: Record<string, unknown>,
  gameState: Record<string, unknown>
): string {
  const template = TEMPLATES.find(t => t.id === id);
  if (!template) {
    return '';
  }
  
  // 检查条件
  if (template.condition) {
    try {
      // 简单的条件解析（实际项目中可能需要更复杂的解析器）
      const conditionMet = evaluateCondition(template.condition, gameState);
      if (!conditionMet) {
        return '';
      }
    } catch (error) {
      console.error('Failed to evaluate condition:', error);
      return '';
    }
  }
  
  return renderTemplate(id, vars);
}

// 简单的条件评估函数
function evaluateCondition(condition: string, gameState: Record<string, unknown>): boolean {
  // 简单的条件解析：支持 "field > value" 格式
  const match = condition.match(/^(\w+)\s*([><=!]+)\s*(\d+)$/);
  if (!match) {
    return true; // 无法解析的条件默认为真
  }
  
  const [, field, operator, valueStr] = match;
  const value = parseFloat(valueStr);
  const fieldValue = gameState[field];
  
  if (typeof fieldValue !== 'number') {
    return false;
  }
  
  switch (operator) {
    case '>': return fieldValue > value;
    case '>=': return fieldValue >= value;
    case '<': return fieldValue < value;
    case '<=': return fieldValue <= value;
    case '==': return fieldValue === value;
    case '!=': return fieldValue !== value;
    default: return true;
  }
}