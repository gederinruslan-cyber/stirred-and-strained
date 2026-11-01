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
export { importSeed, readSeed } from "./seed/import.ts";
export {
  createSession,
  createUser,
  endSessions,
  findUser,
  issueToken,
  sessionUser,
  setPassword,
  takeToken,
  userEmail,
} from "./auth.ts";
export type { TokenPurpose } from "./auth.ts";
export { eraseUser, exportUser } from "./account.ts";
export type { UserExport } from "./account.ts";
export { addToBar, listBar, removeFromBar } from "./bar.ts";
export { listRefusals, setSwapAllowed } from "./swaps.ts";
export { canMark, getMark, listMarks, setMark, undoNote } from "./marks.ts";
export type { Mark, MarkPatch, MarkRef, MarkRow } from "./marks.ts";
export type { Swap } from "./swaps.ts";
export {
  createUserRecipe,
  deleteUserRecipe,
  getUserRecipe,
  listUserRecipes,
  restoreUserRecipe,
  updateUserRecipe,
} from "./user-recipes.ts";
export type {
  EnteredUnit,
  UserLine,
  UserRecipe,
  UserRecipeEvent,
  UserSpec,
} from "./user-recipes.ts";
