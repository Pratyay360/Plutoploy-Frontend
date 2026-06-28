import { Pool } from "pg";

const poolCache = new Map<string, Pool>();

export function getPool(connectionString: string) {
  let pool = poolCache.get(connectionString);
  if (!pool) {
    pool = new Pool({ connectionString });
    poolCache.set(connectionString, pool);
  }
  return pool;
}
