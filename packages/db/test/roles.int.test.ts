import { afterAll, describe, expect, it } from "vitest";
import { assertSafeRole, bootstrapRoles, createPool } from "../src/index.ts";
import { ADMIN_URL, APP_URL, MIGRATION_URL } from "./env.ts";

describe("database roles", () => {
  const app = createPool(APP_URL);
  const admin = createPool(ADMIN_URL);
  afterAll(() => Promise.all([app.end(), admin.end()]));

  it("runs the api as a role that is neither superuser nor BYPASSRLS and owns nothing", async () => {
    const { rows } = await app.query(
      "select rolsuper, rolbypassrls, (select count(*)::int from pg_class where relowner = r.oid) as owned from pg_roles r where rolname = current_user",
    );
    expect(rows[0]).toEqual({ rolsuper: false, rolbypassrls: false, owned: 0 });
    await expect(assertSafeRole(app)).resolves.toBeUndefined();
  });

  it("does not let the api create tables", async () => {
    await expect(app.query("create table sneaky (id int)")).rejects.toThrow(/permission denied/);
    await expect(app.query("create temp table sneaky (id int)")).rejects.toThrow(
      /permission denied/,
    );
  });

  it("refuses to start as a superuser or as the migrator (a member of the table owner)", async () => {
    await expect(assertSafeRole(admin)).rejects.toThrow(/superuser/);
    const migrator = createPool(MIGRATION_URL);
    await expect(assertSafeRole(migrator)).rejects.toThrow(/owner/);
    await migrator.end();
  });

  it("bootstraps idempotently", async () => {
    const passwords = {
      migrator: process.env.MIGRATOR_DB_PASSWORD!,
      app: process.env.APP_DB_PASSWORD!,
    };
    await expect(bootstrapRoles(ADMIN_URL, passwords)).resolves.toBeUndefined();
    await expect(app.query("select 1")).resolves.toBeTruthy();
  });
});
