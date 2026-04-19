/**
 * 放置积累引擎
 * 负责计算和应用资源的实时被动积累
 */

import type { GameState } from './types';
import {
  BASE_FOOD_RATE,
  BASE_FISCAL_RATE,
  BASE_MILITARY_DRAIN_RATE,
  BASE_COMMERCE_GROWTH,
  BASE_POPULATION_GROWTH,
  POLICY_BONUS_AGRICULTURE,
  POLICY_BONUS_TAXATION,
  MIN_RESOURCE_VALUE
} from './idle-config';

/**
 * 资源积累速率接口
 */
export interface IdleRates {
  food: number;
  fiscal: number;
  commerce: number;
  military: number;
  population: number;
  morale: number;
  threat: number;
  eunuch: number;
  faction: number;
}

/**
 * 计算当前状态下的放置积累速率（每分钟）
 * @param state 游戏状态
 * @returns 各资源的每分钟变化量
 */
export function calcIdleRates(state: GameState): IdleRates {
  const { resources, policies } = state;

  // 基础积累速率
  let foodRate = resources.agri_pop * resources.land_fertility * BASE_FOOD_RATE;
  let fiscalRate = resources.commerce * resources.tax_rate * BASE_FISCAL_RATE;
  let commerceRate = resources.commerce * BASE_COMMERCE_GROWTH;
  let militaryRate = -resources.military_cost * BASE_MILITARY_DRAIN_RATE;
  let populationRate = resources.population * BASE_POPULATION_GROWTH;
  let moraleRate = 0;
  let threatRate = 0;
  let eunuchRate = 0;
  let factionRate = 0;

  // 叠加活跃政策的tick_change
  for (const policy of policies.active) {
    if (policy.tick_change) {
      // 累加各种资源的每tick变化
      if (policy.tick_change.food) foodRate += policy.tick_change.food;
      if (policy.tick_change.fiscal) fiscalRate += policy.tick_change.fiscal;
      if (policy.tick_change.commerce) commerceRate += policy.tick_change.commerce;
      if (policy.tick_change.military) militaryRate += policy.tick_change.military;
      if (policy.tick_change.morale) moraleRate += policy.tick_change.morale;
      if (policy.tick_change.threat) threatRate += policy.tick_change.threat;
      if (policy.tick_change.eunuch) eunuchRate += policy.tick_change.eunuch;
      if (policy.tick_change.faction) factionRate += policy.tick_change.faction;
    }

    // 检查政策标签，累加对应加成
    if (policy.tags.includes('agriculture') || policy.tags.includes('农业')) {
      foodRate += POLICY_BONUS_AGRICULTURE;
    }
    if (policy.tags.includes('taxation') || policy.tags.includes('税')) {
      fiscalRate += POLICY_BONUS_TAXATION;
    }
  }

  return {
    food: foodRate,
    fiscal: fiscalRate,
    commerce: commerceRate,
    military: militaryRate,
    population: populationRate,
    morale: moraleRate,
    threat: threatRate,
    eunuch: eunuchRate,
    faction: factionRate
  };
}

/**
 * 应用放置积累到游戏状态
 * @param state 游戏状态（会被直接修改）
 * @param rates 积累速率
 * @param minutes 经过的分钟数
 */
export function applyIdleAccumulation(
  state: GameState,
  rates: IdleRates,
  minutes: number
): void {
  const { resources } = state;

  // 应用粮食积累
  resources.food = Math.max(
    MIN_RESOURCE_VALUE,
    resources.food + rates.food * minutes
  );

  // 应用财政积累
  resources.fiscal = Math.max(
    MIN_RESOURCE_VALUE,
    resources.fiscal + rates.fiscal * minutes
  );

  // 应用军事消耗（只有在有军费时才消耗）
  if (resources.military > 0) {
    resources.military = Math.max(
      MIN_RESOURCE_VALUE,
      resources.military + rates.military * minutes
    );
  }

  // 应用商业增长
  resources.commerce = Math.max(
    MIN_RESOURCE_VALUE,
    resources.commerce + rates.commerce * minutes
  );

  // 应用人口增长
  resources.population = Math.max(
    MIN_RESOURCE_VALUE,
    Math.floor(resources.population + rates.population * minutes)
  );

  // 应用民心变化
  resources.morale = Math.max(
    0,
    Math.min(100, resources.morale + rates.morale * minutes)
  );

  // 应用外患变化
  resources.threat = Math.max(
    0,
    Math.min(100, resources.threat + rates.threat * minutes)
  );

  // 应用宦官势力变化
  resources.eunuch = Math.max(
    0,
    Math.min(100, resources.eunuch + rates.eunuch * minutes)
  );

  // 应用派系变化
  resources.faction = Math.max(
    0,
    Math.min(100, resources.faction + rates.faction * minutes)
  );
}

/**
 * 计算离线收益
 * @param state 游戏状态
 * @param offlineMs 离线毫秒数
 * @returns 离线收益详情
 */
export function calcOfflineEarnings(
  state: GameState,
  offlineMs: number
): { 
  food: number; 
  fiscal: number; 
  military: number; 
  commerce: number;
  morale: number;
  threat: number;
  eunuch: number;
  faction: number;
  minutes: number 
} {
  const rates = calcIdleRates(state);
  const minutes = offlineMs / 60_000;

  return {
    food: rates.food * minutes,
    fiscal: rates.fiscal * minutes,
    military: rates.military * minutes,
    commerce: rates.commerce * minutes,
    morale: rates.morale * minutes,
    threat: rates.threat * minutes,
    eunuch: rates.eunuch * minutes,
    faction: rates.faction * minutes,
    minutes
  };
}

/**
 * 获取资源变化趋势描述
 */
export function getRateDescription(rate: number, resourceName: string): string {
  if (rate > 0) {
    return `${resourceName}+${rate.toFixed(1)}/分钟`;
  } else if (rate < 0) {
    return `${resourceName}${rate.toFixed(1)}/分钟`;
  } else {
    return `${resourceName}稳定`;
  }
}
