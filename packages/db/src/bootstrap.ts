import pg from "pg";

/**
 * Creates or updates the three roles of ADR 0003. Run as the image superuser, the only time it
 * is used; idempotent. Passwords are local-only values from the environment.
 */
export async function bootstrapRoles(
  adminUrl: string,
  passwords: { migrator: string; app: string },
) {
  const client = new pg.Client({ connectionString: adminUrl });
  await client.connect();
  try {
    const db = client.escapeIdentifier(
      (await client.query("select current_database() as d")).rows[0].d,
    );
    const pw = (p: string) => client.escapeLiteral(p);
    await client.query(`
      do $$ begin
        if not exists (select from pg_roles where rolname = 'stirred_owner') then create role stirred_owner; end if;
        if not exists (select from pg_roles where rolname = 'stirred_migrator') then create role stirred_migrator; end if;
        if not exists (select from pg_roles where rolname = 'stirred_app') then create role stirred_app; end if;
      end $$;
      alter role stirred_owner nologin nosuperuser nobypassrls nocreatedb nocreaterole;
      alter role stirred_migrator login nosuperuser nobypassrls nocreatedb nocreaterole password ${pw(passwords.migrator)};
      alter role stirred_app login nosuperuser nobypassrls nocreatedb nocreaterole password ${pw(passwords.app)};
      grant stirred_owner to stirred_migrator;
      grant connect on database ${db} to stirred_migrator, stirred_app;
      alter schema public owner to stirred_owner;
      revoke create on schema public from public;
      grant usage on schema public to stirred_app;
      alter default privileges for role stirred_owner in schema public
        grant select, insert, update, delete on tables to stirred_app;
      alter default privileges for role stirred_owner in schema public
        grant usage, select on sequences to stirred_app;
    `);
  } finally {
    await client.end();
  }
}
