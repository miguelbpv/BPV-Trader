import { openDB } from 'idb';
import type { Holding } from '../types';

const DB_NAME = 'bpv-trader';
const STORE = 'holdings';
const SETTINGS = 'settings';

export async function db(){
  return openDB(DB_NAME, 2, { upgrade(db){
    if(!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE, { keyPath: 'symbol' });
    if(!db.objectStoreNames.contains(SETTINGS)) db.createObjectStore(SETTINGS, { keyPath: 'key' });
  }});
}

export async function listHoldings(): Promise<Holding[]> {
  const d = await db();
  return (await d.getAll(STORE)) as Holding[];
}

export async function upsertHolding(h: Holding){
  const d = await db();
  await d.put(STORE, h);
}

export async function removeHolding(symbol: string){
  const d = await db();
  await d.delete(STORE, symbol);
}

export async function getSetting(key:string){ const d=await db(); return (await d.get(SETTINGS, key))?.value; }
export async function setSetting(key:string, value:any){ const d=await db(); await d.put(SETTINGS, { key, value }); }
