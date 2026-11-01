import pg from "pg";

export type Pool = pg.Pool;

/** A connection pool that fails fast instead of hanging when the database is unreachable. */
export function createPool(connectionString: string): Pool {
  return new pg.Pool({ connectionString, connectionTimeoutMillis: 2000, max: 10 });
}
