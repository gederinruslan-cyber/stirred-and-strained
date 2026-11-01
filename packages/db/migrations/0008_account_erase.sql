-- Account erase (M2-08). Deleting the app_user row takes every user-owned row with it (each
-- user_id references app_user on delete cascade). Mailed links are keyed by address, not user, and
-- the app role cannot see them, so this function drops the pending links of the scoped user's
-- own address (app_user_id(), set by withUser); it can reach no other address.
create function auth_forget_links() returns void
  language sql volatile security definer set search_path = public, pg_temp
  as $$
    delete from auth_token where email = (select email from app_user where id = app_user_id());
  $$;

revoke all on function auth_forget_links() from public;
grant execute on function auth_forget_links() to stirred_app;
