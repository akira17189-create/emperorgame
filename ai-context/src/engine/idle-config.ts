/**
 * 放置积累系统配置
 * 所有BASE_*速率常量定义在此文件中，便于平衡调整
 */

// 基础速率常量（每分钟真实时间）
export const BASE_FOOD_RATE = 0.005;           // 粮食基础产出系数
export const BASE_FISCAL_RATE = 0.003;         // 财政基础产出系数
export const BASE_MILITARY_DRAIN_RATE = 0.002; // 军费消耗系数
export const BASE_COMMERCE_GROWTH = 0.001;     // 商业自然增长率
export const BASE_POPULATION_GROWTH = 0.0005;  // 人口自然增长率

// 政策加成系数
export const POLICY_BONUS_AGRICULTURE = 0.002; // 农业政策每级加成
export const POLICY_BONUS_TAXATION = 0.001;    // 税收政策每级加成

// 上下限保护
export const MIN_RESOURCE_VALUE = 0;           // 资源最低值
export const MAX_OFFLINE_HOURS = 24;           // 离线补算上限（小时）

// 实时积累间隔
export const IDLE_INTERVAL_MS = 10_000;        // 每10秒执行一次放置积累

// 放置积累参与的资源类型
export const IDLE_RESOURCES = {
  food: { direction: 'accumulate', factors: ['agri_pop', 'land_fertility'] },
  fiscal: { direction: 'accumulate', factors: ['tax_rate', 'commerce'] },
  commerce: { direction: 'slow_accumulate', factors: [] },
  military: { direction: 'consume', factors: ['military_cost'] },
  population: { direction: 'slow_accumulate', factors: [] }
} as const;

// 不参与放置积累的资源
export const NON_IDLE_RESOURCES = ['morale', 'threat', 'faction', 'eunuch'] as const;
