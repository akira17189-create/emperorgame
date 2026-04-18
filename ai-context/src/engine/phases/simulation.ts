import type { GameState } from '../types';

export interface SimulationResult {
  success: boolean;
  newState: GameState;
  events: string[];
  warnings: string[];
}

/**
 * 将值限制在指定范围内
 */
function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/**
 * 模拟世界状态变化
 * @param state 当前游戏状态
 * @returns 模拟结果
 */
export function simulateWorld(state: GameState): SimulationResult {
  const newState = JSON.parse(JSON.stringify(state)) as GameState;
  const events: string[] = [];
  const warnings: string[] = [];

  // 推进一年
  newState.world.year += 1;
  newState.meta.game_year += 1;
  newState.meta.last_saved_at = new Date().toISOString();

  // ── 1. 随机天气 ──
  newState.world.weather_this_year = clamp(
    0.5 + (Math.random() - 0.5) * 0.6,
    0, 1
  );

  // ── 2. 资源演算 ──
  const r = newState.resources;
  const weather = newState.world.weather_this_year;

  // 农业产出：受天气与土地肥力影响
  const agriYield = Math.round(r.agri_pop * r.land_fertility * (0.6 + weather * 0.8));
  // 粮食：+产出 -人口消耗（每人每年约0.12单位）
  const foodConsumed = Math.round(r.population * 0.12);
  r.food = Math.max(0, r.food + agriYield - foodConsumed);

  // 财政：+税收 -军费 -赈灾
  const taxIncome = Math.round(r.population * r.tax_rate * (r.commerce / 300));
  r.fiscal = Math.max(0, r.fiscal + taxIncome - r.military_cost - r.disaster_relief);

  // 人口：受粮食、民心影响
  const foodSurplus = r.food > foodConsumed * 2;
  const popGrowthRate = foodSurplus ? 0.015 : (r.food <= 0 ? -0.05 : 0.005);
  r.population = Math.max(0, Math.round(r.population * (1 + popGrowthRate)));

  // 农业人口随总人口同步（保持比例约50%）
  r.agri_pop = Math.round(r.population * 0.5);

  // 民心：粮食紧张 / 财政破产 / 税率过高时下降
  let moraleDelta = 0;
  if (r.food <= 0) moraleDelta -= 15;
  else if (r.food < foodConsumed) moraleDelta -= 5;
  if (r.fiscal <= 0) moraleDelta -= 8;
  if (r.tax_rate > 0.25) moraleDelta -= Math.round((r.tax_rate - 0.25) * 60);
  if (weather > 0.7) moraleDelta += 3; // 风调雨顺
  r.morale = clamp(r.morale + moraleDelta, 0, 100);

  // 宦官势力随时间自然增长（除非被政策抑制）
  r.eunuch = clamp(r.eunuch + Math.round(Math.random() * 3 - 1), 0, 100);

  // 派系张力随财政/民心紧张而上升
  if (r.fiscal < 2000 || r.morale < 40) {
    r.faction = clamp(r.faction + 3, 0, 100);
  } else {
    r.faction = clamp(r.faction - 1, 0, 100);
  }

  // 土地肥力缓慢恢复（上限0.95）
  r.land_fertility = clamp(r.land_fertility + 0.005, 0, 0.95);

  // ── 3. 随机事件 ──
  const roll = Math.random();

  if (weather < 0.2 && roll < 0.4) {
    events.push(`${newState.world.era}${newState.world.year}年，大旱，粮食大量减产。`);
    r.food = Math.max(0, r.food - Math.round(r.agri_pop * 0.3));
    r.morale = clamp(r.morale - 10, 0, 100);
    warnings.push('严重旱灾');
  } else if (weather > 0.85 && roll < 0.15) {
    events.push(`${newState.world.era}${newState.world.year}年，洪涝，部分耕地受损。`);
    r.food = Math.max(0, r.food - Math.round(r.agri_pop * 0.15));
    r.land_fertility = clamp(r.land_fertility - 0.03, 0, 0.95);
  }

  if (r.threat > 60 && roll < 0.25) {
    events.push(`${newState.world.era}${newState.world.year}年，边境告急，兵部请旨增援。`);
    r.military = Math.max(0, r.military - 200);
    warnings.push('边境威胁');
  }

  if (r.morale < 30 && roll < 0.2) {
    events.push(`${newState.world.era}${newState.world.year}年，民间骚动，地方官员上报。`);
    r.morale = clamp(r.morale - 5, 0, 100);
    r.faction = clamp(r.faction + 5, 0, 100);
    warnings.push('民心不稳');
  }

  // 偶发：商税丰收
  if (r.commerce > 400 && roll > 0.85) {
    events.push(`${newState.world.era}${newState.world.year}年，商贸繁盛，户部意外进项。`);
    r.fiscal += Math.round(r.commerce * 0.1);
  }

  // ── 4. NPC 状态演算 ──
  newState.npcs.forEach(npc => {
    if (npc.status !== 'active') return;

    // pressure：受派系张力与民心影响
    const pressureDelta = (r.faction - 50) * 0.05 + (50 - r.morale) * 0.03;
    npc.state.pressure = clamp(npc.state.pressure + pressureDelta, 0, 100);

    // satisfaction：受财政/粮食稳定度影响
    const satDelta = r.fiscal > 3000 ? 2 : (r.fiscal < 1000 ? -4 : 0);
    npc.state.satisfaction = clamp(npc.state.satisfaction + satDelta, 0, 100);

    // loyalty：长期不满导致忠诚下降
    if (npc.state.satisfaction < 30) {
      npc.state.loyalty_to_emperor = clamp(npc.state.loyalty_to_emperor - 2, 0, 100);
    } else if (npc.state.satisfaction > 70) {
      npc.state.loyalty_to_emperor = clamp(npc.state.loyalty_to_emperor + 1, 0, 100);
    }

    // behavior_modifier 更新
    if (npc.state.pressure > 80) {
      npc.state.behavior_modifier = '焦虑';
    } else if (npc.state.satisfaction < 25) {
      npc.state.behavior_modifier = '消极';
    } else if (npc.state.loyalty_to_emperor > 75) {
      npc.state.behavior_modifier = '忠诚';
    } else {
      npc.state.behavior_modifier = '正常';
    }
  });

  // ── 5. 皇帝声望 ──
  if (r.morale > 70 && r.fiscal > 4000) {
    newState.emperor.prestige = clamp(newState.emperor.prestige + 1, 0, 100);
  } else if (r.morale < 30 || r.fiscal <= 0) {
    newState.emperor.prestige = clamp(newState.emperor.prestige - 2, 0, 100);
  }

  // ── 6. 集体记忆上限修剪 ──
  if (newState.world.collective_memory.length > 20) {
    newState.world.collective_memory = newState.world.collective_memory.slice(-20);
  }

  return { success: true, newState, events, warnings };
}

/**
 * 计算资源变化趋势（当前年的预期增减量，用于 UI 提示）
 */
export function calculateResourceTrends(state: GameState): Record<string, number> {
  const r = state.resources;
  const weather = state.world.weather_this_year;
  const agriYield = Math.round(r.agri_pop * r.land_fertility * (0.6 + weather * 0.8));
  const foodConsumed = Math.round(r.population * 0.12);
  const taxIncome = Math.round(r.population * r.tax_rate * (r.commerce / 300));

  return {
    food: agriYield - foodConsumed,
    population: Math.round(r.population * (r.food > foodConsumed * 2 ? 0.015 : 0.005)),
    fiscal: taxIncome - r.military_cost - r.disaster_relief,
    military: 0,
    morale: r.food <= 0 ? -15 : (r.morale < 30 ? -3 : 1),
  };
}