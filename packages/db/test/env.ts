// Integration-test connection URLs (set by verify:quick and verify:full after `db:setup`).
function need(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is required for db integration tests`);
  return value;
}
export const APP_URL = need("DATABASE_URL");
export const MIGRATION_URL = need("MIGRATION_DATABASE_URL");
export const ADMIN_URL = need("DATABASE_ADMIN_URL");
