import { openDB, type IDBPDatabase } from 'idb';
import type { GameState } from './types';

export interface SaveMeta {
  slot: string;
  game_year: number;
  last_saved_at: string;
  dynasty: string;
}

export interface SaveAdapter {
  list(): Promise<SaveMeta[]>;
  save(slot: string, data: GameState): Promise<void>;
  load(slot: string): Promise<GameState | null>;
  delete(slot: string): Promise<void>;
}

const DB_NAME = 'emperor-game';
const STORE_NAME = 'saves';
const MAX_SLOTS = 3;

interface SaveRecord {
  slot: string;
  data: GameState;
  meta: SaveMeta;
}

export class IDBAdapter implements SaveAdapter {
  private dbPromise: Promise<IDBPDatabase>;

  constructor() {
    this.dbPromise = this.initDB();
  }

  private async initDB(): Promise<IDBPDatabase> {
    return openDB(DB_NAME, 1, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, { keyPath: 'slot' });
          store.createIndex('meta', 'meta');
        }
      }
    });
  }

  async list(): Promise<SaveMeta[]> {
    const db = await this.dbPromise;
    const records = await db.getAll(STORE_NAME);
    return records.map(record => record.meta);
  }

  async save(slot: string, data: GameState): Promise<void> {
    const db = await this.dbPromise;
    
    // 检查槽位数量
    const existing = await this.list();
    if (existing.length >= MAX_SLOTS && !existing.some(s => s.slot === slot)) {
      throw new Error(`Maximum save slots (${MAX_SLOTS}) reached`);
    }
    
    const meta: SaveMeta = {
      slot,
      game_year: data.world.year,
      last_saved_at: new Date().toISOString(),
      dynasty: data.world.dynasty
    };
    
    const record: SaveRecord = { slot, data, meta };
    await db.put(STORE_NAME, record);
  }

  async load(slot: string): Promise<GameState | null> {
    const db = await this.dbPromise;
    const record = await db.get(STORE_NAME, slot);
    if (!record) {
      return null;
    }

    // 向后兼容迁移逻辑
    const gameState = record.data as GameState;

    // 迁移1: 如果world.factions字段缺失，注入默认值
    if (!gameState.world.factions) {
      gameState.world.factions = {
        qingliu: 50,    // 清流派势力 0~100
        didang: 50,     // 帝党势力 0~100
        eunuch_faction: 30,  // 宦官党势力 0~100
        military: 50,       // 军队派势力 0~100
        pragmatists: 40     // 务实派势力 0~100
      };
      console.log('迁移: 添加了world.factions字段（含military和pragmatists）');
    }

    // 迁移1b: 如果旧存档缺少military或pragmatists字段，补充默认值
    if (!gameState.world.factions.military) {
      gameState.world.factions.military = 50;
      console.log('迁移: 补充了world.factions.military字段');
    }
    if (!gameState.world.factions.pragmatists) {
      gameState.world.factions.pragmatists = 40;
      console.log('迁移: 补充了world.factions.pragmatists字段');
    }

    // 迁移2: 旧存档兼容patch - 开场阶段和放置系统字段
    if (!gameState.meta.prologue_phase) {
      gameState.meta.prologue_phase = 'complete';      // 旧档直接跳过开场
      gameState.meta.prologue_complete = true;
      console.log('迁移: 添加了prologue_phase和prologue_complete字段（旧存档跳过开场）');
    }
    if (!gameState.meta.last_idle_tick_at) {
      gameState.meta.last_idle_tick_at = gameState.meta.last_saved_at;
      console.log('迁移: 添加了last_idle_tick_at字段');
    }

    return gameState;
  }

  async delete(slot: string): Promise<void> {
    const db = await this.dbPromise;
    await db.delete(STORE_NAME, slot);
  }
}

export class SupabaseAdapter implements SaveAdapter {
  // TODO: 实装时需要 @supabase/supabase-js 依赖 + 用户登录流程
  async list(): Promise<SaveMeta[]> {
    throw new Error('Supabase adapter not implemented');
  }

  async save(_slot: string, _data: GameState): Promise<void> {
    throw new Error('Supabase adapter not implemented');
  }

  async load(_slot: string): Promise<GameState | null> {
    throw new Error('Supabase adapter not implemented');
  }

  async delete(_slot: string): Promise<void> {
    throw new Error('Supabase adapter not implemented');
  }
}

export function getDefaultAdapter(): SaveAdapter {
  return new IDBAdapter();
}