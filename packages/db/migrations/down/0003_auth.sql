drop function auth_take_token(bytea, text);
drop function auth_issue_token(bytea, text, text, text);
drop function auth_session_user(bytea);
drop function auth_find_user(text);
drop table auth_token;
drop table session;
drop table app_user;
