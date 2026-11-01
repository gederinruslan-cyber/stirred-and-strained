import { mkdtempSync, readdirSync, writeFileSync, mkdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { MIGRATIONS_DIR, appliedMigrations, migrate, rollback } from "../src/index.ts";
import { MIGRATION_URL } from "./env.ts";

const files = readdirSync(MIGRATIONS_DIR)
  .filter((f) => f.endsWith(".sql"))
  .map((f) => f.replace(/\.sql$/, ""))
  .sort();

describe("migrations", () => {
  it("round-trips: every migration goes down and comes back up", async () => {
    expect(await appliedMigrations(MIGRATION_URL)).toEqual(files);
    for (let i = 0; i < files.length; i++) await rollback(MIGRATION_URL);
    expect(await appliedMigrations(MIGRATION_URL)).toEqual([]);
    expect(await migrate(MIGRATION_URL)).toEqual(files);
    expect(await appliedMigrations(MIGRATION_URL)).toEqual(files);
  });

  it("refuses a migration without a down file before running anything", async () => {
    const dir = mkdtempSync(join(tmpdir(), "stirred-migrations-"));
    mkdirSync(join(dir, "down"));
    writeFileSync(join(dir, "9999_no_down.sql"), "create table no_down (id int);");
    await expect(migrate(MIGRATION_URL, dir)).rejects.toThrow(/9999_no_down.*down/);
    writeFileSync(join(dir, "down", "9999_no_down.sql"), "drop table no_down;");
    writeFileSync(join(dir, "9999_no_down.sql"), "create table no_down (id int);\ncommit;");
    await expect(migrate(MIGRATION_URL, dir)).rejects.toThrow(/own transaction/);
    expect(await appliedMigrations(MIGRATION_URL)).toEqual(files);
  });
});
