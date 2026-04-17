import type { Resources, World, GameState } from '../engine/types';
import { createEmptyGameState } from '../engine/types';
import { SEED_NPCS } from './seed-npcs';

export const SEED_WORLD: Partial<World> = {
  dynasty: '架空·某朝',
  era: '建兴',
  year: 1,
  tone: '猜忌',
  named_events: [],
  collective_memory: ['先帝驾崩', '新帝登基', '国库空虚', '边关不稳'],
  wills: [],
  weather_this_year: 0.6,
  conflict_ratio: 0.4
};

export const SEED_RESOURCES: Partial<Resources> = {
  food: 1200,
  population: 12000,
  fiscal: 6000,
  military: 2500,
  morale: 65,
  eunuch: 35,
  threat: 25,
  faction: 45,
  agri_pop: 7000,
  land_fertility: 0.65,
  tax_rate: 0.12,
  military_cost: 250,
  disaster_relief: 150,
  commerce: 350
};

export const SEED_SCENARIO_DESCRIPTION = `
建兴元年，新帝登基。

先帝在位三十年，晚年沉迷修道，朝政荒废。国库空虚，边关告急，朝中派系林立。

新帝年方十八，面对的是一个内忧外患的烂摊子。

户部尚书李大人主张休养生息，兵部尚书张将军主张整军备战，司礼监王公公则在暗中观察，伺机而动。

皇帝的第一道旨意，将决定这个王朝的走向。
`;

export function buildInitialGameState(): GameState {
  const state = createEmptyGameState();

  // 覆盖 world 字段
  state.world = {
    ...state.world,
    ...SEED_WORLD
  } as World;

  // 覆盖 resources 字段
  state.resources = {
    ...state.resources,
    ...SEED_RESOURCES
  } as Resources;

  // 设置 NPCs
  state.npcs = [...SEED_NPCS];

  // 设置 meta.version
  state.meta.version = "1.0.0";

  // 设置 style_state
  state.style_state = {
    current_tags: ['史官视角', '克制叙述'],
    rules_version: '1.0',
    last_changed_year: 0
  };

  return state;
}
