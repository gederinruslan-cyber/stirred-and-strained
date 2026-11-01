-- The user id of the current scoped transaction (ADR 0003), or null when none is set, so a
-- row-level policy `user_id = app_user_id()` matches nothing outside withUser.
create function app_user_id() returns uuid
  language sql stable
  as $$ select nullif(current_setting('app.user_id', true), '')::uuid $$;
