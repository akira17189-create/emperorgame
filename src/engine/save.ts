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
    return record ? record.data : null;
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