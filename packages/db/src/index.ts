// Plain SQL migrations, roles and user-scoped data access (ADR 0003).
export { createPool } from "./pool.ts";
export type { Pool } from "./pool.ts";
export { bootstrapRoles } from "./bootstrap.ts";
export { MIGRATIONS_DIR, appliedMigrations, migrate, rollback } from "./migrate.ts";
export { createDb, withUser } from "./scope.ts";
export type { Db, Scoped, Tx, UserId } from "./scope.ts";
export { assertSafeRole } from "./role-check.ts";
export { loadTaxonomy } from "./taxonomy.ts";
export type { TaxonomyEdge, TaxonomyNode } from "./taxonomy.ts";
export { loadRecipes } from "./recipes.ts";
export type { HouseRecipe } from "./recipes.ts";
export { readSeed } from "./seed/import.ts";
