import { randomUUID } from "node:crypto";
import { sql } from "drizzle-orm";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import {
  createDb,
  createPool,
  createUser,
  listRefusals,
  setSwapAllowed,
  withUser,
  type Scoped,
} from "../src/index.ts";
import { importSeed, readSeed } from "../src/seed/import.ts";
import { expectIsolated } from "../test-support/isolation.ts";
import { APP_URL, MIGRATION_URL } from "./env.ts";

const pool = createPool(APP_URL);
const db = createDb(pool);
const seed = readSeed(new URL("../../../data/seed", import.meta.url).pathname);
beforeAll(() => importSeed(MIGRATION_URL, seed));
afterAll(() => pool.end());

const ensureUser = (s: Scoped) => createUser(s, `${s.userId}@example.test`, "scrypt$test");
const ryeForBourbon = { substitute: "rye-whiskey", replaces: "bourbon-whiskey" };

describe("substitution_refusal (M2-05)", () => {
  it("imports every house swap with its reason, and the exact lines", async () => {
    const { rows } = await pool.query(
      "select count(*)::int as n, count(*) filter (where trim(reason) = '')::int as bare from ingredient_substitution",
    );
    expect(rows[0]).toEqual({ n: seed.substitutions.length, bare: 0 });
    const exact = await pool.query(
      "select recipe_id from recipe_line where exact order by recipe_id, position",
    );
    expect(exact.rows.map((r) => r.recipe_id)).toContain("bourbon-renewal");
  });

  it("is isolated per user (ADR 0003)", () =>
    expectIsolated(db, {
      create: async (s) => {
        await ensureUser(s);
        await setSwapAllowed(s, ryeForBourbon, false);
        return ryeForBourbon.substitute;
      },
      // Read and update without a user filter: row-level security alone stops B.
      read: async ({ tx }, id) =>
        (await tx.execute(sql`select user_id from substitution_refusal where substitute = ${id}`))
          .rows[0] ?? null,
      update: async ({ tx }, id) =>
        (
          await tx.execute(
            sql`update substitution_refusal set refused_at = now() where substitute = ${id} returning 1`,
          )
        ).rows.length,
      remove: async ({ tx }, id) =>
        (
          await tx.execute(
            sql`delete from substitution_refusal where substitute = ${id} returning 1`,
          )
        ).rows.length,
    }));

  it("turns a swap off and on again, idempotently; an unknown swap is not found", async () => {
    await withUser(db, randomUUID(), async (s) => {
      await ensureUser(s);
      expect(await setSwapAllowed(s, ryeForBourbon, false)).toBe(true);
      expect(await setSwapAllowed(s, ryeForBourbon, false)).toBe(true);
      expect(await listRefusals(s)).toEqual([ryeForBourbon]);
      expect(await setSwapAllowed(s, ryeForBourbon, true)).toBe(true);
      expect(await listRefusals(s)).toEqual([]);
      expect(await setSwapAllowed(s, { substitute: "gin", replaces: "vodka" }, false)).toBe(false);
    });
  });

  it("drops a refusal when the seed drops its swap", async () => {
    const user = randomUUID();
    await withUser(
      db,
      user,
      async (s) => (await ensureUser(s), setSwapAllowed(s, ryeForBourbon, false)),
    );
    const without = {
      ...seed,
      substitutions: seed.substitutions.filter(
        (e) =>
          !(e.substitute === ryeForBourbon.substitute && e.replaces === ryeForBourbon.replaces),
      ),
    };
    await importSeed(MIGRATION_URL, without);
    expect(await withUser(db, user, listRefusals)).toEqual([]);
    await importSeed(MIGRATION_URL, seed);
  });
});
