// pnpm db:setup | db:migrate | db:rollback. Reads URLs from the environment; never prints them.
import { bootstrapRoles } from "./bootstrap.ts";
import { migrate, rollback } from "./migrate.ts";

function need(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is not set (see .env.example)`);
  return value;
}

const command = process.argv[2];
if (command === "setup") {
  await bootstrapRoles(need("DATABASE_ADMIN_URL"), {
    migrator: need("MIGRATOR_DB_PASSWORD"),
    app: need("APP_DB_PASSWORD"),
  });
  console.log("db: roles ready");
}
if (command === "setup" || command === "migrate") {
  const applied = await migrate(need("MIGRATION_DATABASE_URL"));
  console.log(applied.length ? `db: applied ${applied.join(", ")}` : "db: up to date");
} else if (command === "rollback") {
  const id = await rollback(need("MIGRATION_DATABASE_URL"));
  console.log(id ? `db: rolled back ${id}` : "db: nothing to roll back");
} else if (command !== "setup") {
  throw new Error("usage: cli.ts setup | migrate | rollback");
}
