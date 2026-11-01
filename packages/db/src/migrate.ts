import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import pg from "pg";

/** Plain SQL migrations: `NNNN_name.sql` with `down/NNNN_name.sql` next to it, always. */
export const MIGRATIONS_DIR = join(import.meta.dirname, "..", "migrations");

const JOURNAL = `
  set local role stirred_owner;
  create table if not exists schema_migrations (id text primary key, applied_at timestamptz not null default now());
  revoke all on schema_migrations from stirred_app;`;

function listMigrations(dir: string): string[] {
  const ids = readdirSync(dir)
    .filter((f) => f.endsWith(".sql"))
    .map((f) => f.slice(0, -4))
    .sort();
  const missing = ids.filter((id) => !existsSync(join(dir, "down", `${id}.sql`)));
  if (missing.length) throw new Error(`migration ${missing.join(", ")} has no down file`);
  // The runner owns the transaction; a file that ends it early could half-apply.
  for (const id of ids) {
    for (const file of [join(dir, `${id}.sql`), join(dir, "down", `${id}.sql`)]) {
      if (/^\s*(begin|commit|rollback|start\s+transaction)\b/im.test(readFileSync(file, "utf8"))) {
        throw new Error(`migration ${id} must not control its own transaction`);
      }
    }
  }
  return ids;
}

async function withMigrator<T>(url: string, work: (c: pg.Client) => Promise<T>): Promise<T> {
  const client = new pg.Client({ connectionString: url });
  await client.connect();
  try {
    return await work(client);
  } finally {
    await client.end();
  }
}

/** Runs `sql` as the owner in one transaction, then records or forgets the id. */
async function step(c: pg.Client, sql: string, record: string, id: string) {
  await c.query("begin");
  try {
    await c.query(JOURNAL);
    await c.query(sql);
    await c.query(record, [id]);
    await c.query("commit");
  } catch (error) {
    await c.query("rollback");
    throw error;
  }
}

export async function appliedMigrations(url: string): Promise<string[]> {
  return withMigrator(url, async (c) => {
    const exists = (await c.query("select to_regclass('schema_migrations') as t")).rows[0].t;
    if (!exists) return [];
    return (await c.query("select id from schema_migrations order by id")).rows.map((r) => r.id);
  });
}

/** Applies every pending migration in order; returns the ids applied. */
export async function migrate(url: string, dir = MIGRATIONS_DIR): Promise<string[]> {
  const ids = listMigrations(dir);
  const done = new Set(await appliedMigrations(url));
  const pending = ids.filter((id) => !done.has(id));
  await withMigrator(url, async (c) => {
    for (const id of pending) {
      await step(
        c,
        readFileSync(join(dir, `${id}.sql`), "utf8"),
        "insert into schema_migrations (id) values ($1)",
        id,
      );
    }
  });
  return pending;
}

/** Undoes the last applied migration; returns its id, or null when none is applied. */
export async function rollback(url: string, dir = MIGRATIONS_DIR): Promise<string | null> {
  const id = (await appliedMigrations(url)).at(-1);
  if (!id) return null;
  listMigrations(dir);
  await withMigrator(url, (c) =>
    step(
      c,
      readFileSync(join(dir, "down", `${id}.sql`), "utf8"),
      "delete from schema_migrations where id = $1",
      id,
    ),
  );
  return id;
}
