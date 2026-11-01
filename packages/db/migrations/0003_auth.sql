-- Accounts and sessions (ADR 0005). A user row exists only once its address is confirmed.
-- app_user and session carry the ADR 0003 policy; auth_token is reachable only through the
-- security definer functions below, which serve the steps that run before a user id is known.
create table app_user (
  id uuid primary key,
  -- Normalised to lower case by the api.
  email text not null check (email = lower(email) and length(email) between 3 and 254),
  password_hash text not null,
  created_at timestamptz not null default now()
);
create unique index app_user_email on app_user (email);
alter table app_user enable row level security;
create policy app_user_owner on app_user
  using (id = app_user_id()) with check (id = app_user_id());

-- Only the SHA-256 of a session token is stored; the token itself lives in the browser cookie.
create table session (
  token_hash bytea primary key check (length(token_hash) = 32),
  user_id uuid not null references app_user (id) on delete cascade,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null
);
create index session_by_user on session (user_id);
alter table session enable row level security;
create policy session_owner on session
  using (user_id = app_user_id()) with check (user_id = app_user_id());

-- One-use mailed links: confirm (carries the password chosen at sign-up) and reset.
create table auth_token (
  token_hash bytea primary key check (length(token_hash) = 32),
  purpose text not null check (purpose in ('confirm', 'reset')),
  email text not null,
  password_hash text,
  expires_at timestamptz not null,
  check ((purpose = 'confirm') = (password_hash is not null))
);
create index auth_token_email on auth_token (email);
alter table auth_token enable row level security;
revoke all on auth_token from stirred_app;

create function auth_find_user(p_email text) returns table (id uuid, password_hash text)
  language sql stable security definer set search_path = public, pg_temp
  as $$ select u.id, u.password_hash from app_user u where u.email = p_email $$;

create function auth_session_user(p_token_hash bytea) returns uuid
  language sql stable security definer set search_path = public, pg_temp
  as $$ select s.user_id from session s where s.token_hash = p_token_hash and s.expires_at > now() $$;

-- Confirm links last 24 hours, reset links one hour; expired rows are swept on each issue.
create function auth_issue_token(p_token_hash bytea, p_purpose text, p_email text, p_password_hash text)
  returns void
  language sql volatile security definer set search_path = public, pg_temp
  as $$
    delete from auth_token where expires_at <= now();
    insert into auth_token (token_hash, purpose, email, password_hash, expires_at)
    values (p_token_hash, p_purpose, p_email, p_password_hash,
            now() + case p_purpose when 'confirm' then interval '24 hours' else interval '1 hour' end);
  $$;

-- Takes a live token once; every other link of the same purpose for that address dies with it.
create function auth_take_token(p_token_hash bytea, p_purpose text)
  returns table (email text, password_hash text)
  language plpgsql volatile security definer set search_path = public, pg_temp
  -- (The block opens on the declare line: the runner refuses a line that starts a transaction.)
  as $$ declare taken auth_token; begin
    delete from auth_token t
      where t.token_hash = p_token_hash and t.purpose = p_purpose and t.expires_at > now()
      returning * into taken;
    if taken.token_hash is null then return; end if;
    delete from auth_token t where t.email = taken.email and t.purpose = p_purpose;
    email := taken.email;
    password_hash := taken.password_hash;
    return next;
  end $$;

revoke all on function auth_find_user(text), auth_session_user(bytea),
  auth_issue_token(bytea, text, text, text), auth_take_token(bytea, text) from public;
grant execute on function auth_find_user(text), auth_session_user(bytea),
  auth_issue_token(bytea, text, text, text), auth_take_token(bytea, text) to stirred_app;
