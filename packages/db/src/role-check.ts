import type { Pool } from "./pool.ts";

/** The api refuses to run as a role that would skip row-level security (ADR 0003). */
export async function assertSafeRole(pool: Pool): Promise<void> {
  const { rows } = await pool.query(
    `select rolsuper, rolbypassrls,
       coalesce(pg_has_role(current_user, to_regrole('stirred_owner'), 'USAGE'), false) as owner
     from pg_roles where rolname = current_user`,
  );
  if (rows[0]?.rolsuper) throw new Error("refusing to run as a database superuser (ADR 0003)");
  if (rows[0]?.rolbypassrls) throw new Error("refusing to run as a BYPASSRLS role (ADR 0003)");
  // Table owners skip row-level security, and so does anyone acting as stirred_owner.
  if (rows[0]?.owner)
    throw new Error("refusing to run as the table owner or a member of it (ADR 0003)");
}
