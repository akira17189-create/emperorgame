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
}

/**
 * 计算当前状态下的放置积累速率（每分钟）
 * @param state 游戏状态
 * @returns 各资源的每分钟变化量
 */
export function calcIdleRates(state: GameState): IdleRates {
  const { resources, policies } = state;

  // 计算政策加成
  let agricultureBonus = 0;
  let taxationBonus = 0;

  for (const policy of policies.active) {
    // 检查政策标签，累加对应加成
    if (policy.tags.includes('agriculture') || policy.tags.includes('农')) {
      agricultureBonus += POLICY_BONUS_AGRICULTURE;
    }
    if (policy.tags.includes('taxation') || policy.tags.includes('税')) {
      taxationBonus += POLICY_BONUS_TAXATION;
    }
  }

  // 粮食积累速率
  const foodRate = resources.agri_pop * resources.land_fertility * BASE_FOOD_RATE
                   + agricultureBonus;

  // 财政积累速率
  const fiscalRate = resources.commerce * resources.tax_rate * BASE_FISCAL_RATE
                     + taxationBonus;

  // 军费消耗速率（负值）
  const militaryDrain = resources.military_cost * BASE_MILITARY_DRAIN_RATE;

  // 商业自然增长
  const commerceRate = resources.commerce * BASE_COMMERCE_GROWTH;

  // 人口自然增长
  const populationRate = resources.population * BASE_POPULATION_GROWTH;

  return {
    food: foodRate,
    fiscal: fiscalRate,
    commerce: commerceRate,
    military: -militaryDrain,  // 负值表示消耗
    population: populationRate
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
): { food: number; fiscal: number; military: number; minutes: number } {
  const rates = calcIdleRates(state);
  const minutes = offlineMs / 60_000;

  return {
    food: rates.food * minutes,
    fiscal: rates.fiscal * minutes,
    military: rates.military * minutes,
    minutes
  };
}
