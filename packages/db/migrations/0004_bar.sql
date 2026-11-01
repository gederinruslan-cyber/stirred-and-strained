-- My Bar (M2-03): the ingredients a user keeps, one bar per user. Any taxonomy node may be kept
-- (a category, a type or a brand); the engine reads them as "have". A seed that would delete a
-- kept ingredient fails (restrict), so house data never silently takes a bottle away.
create table bar_item (
  user_id uuid not null references app_user (id) on delete cascade,
  ingredient_id text not null references ingredient_node (id),
  added_at timestamptz not null default now(),
  primary key (user_id, ingredient_id)
);
create index bar_item_ingredient on bar_item (ingredient_id);
alter table bar_item enable row level security;
create policy bar_item_owner on bar_item
  using (user_id = app_user_id()) with check (user_id = app_user_id());
