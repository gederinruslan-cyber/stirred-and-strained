-- Custom recipes (M2-06): a user's own specs, private, never lost. Delete only sets deleted_at
-- (undo and restore clear it); every create and edit keeps the saved spec as an event, so the
-- history can always be read back. Amounts are canonical (ml or a counted unit) in double
-- precision, so an ounce is stored exactly as converted and rounded only at display;
-- `entered_unit` remembers what the user typed (oz, cl, ml or the counted unit) for editing.
create table user_recipe (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references app_user (id) on delete cascade,
  name text not null check (length(trim(name)) between 1 and 80),
  method text not null check (method in ('shaken', 'stirred', 'built', 'blended', 'muddled', 'layered')),
  glass text,
  -- The user's own steps, one per line; null means "write them from the method".
  steps text check (length(steps) <= 4000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);
create index user_recipe_user on user_recipe (user_id);

create table user_recipe_line (
  user_id uuid not null references app_user (id) on delete cascade,
  recipe_id uuid not null references user_recipe (id) on delete cascade,
  position int not null check (position >= 0),
  -- A re-seed that would delete an ingredient someone's recipe uses fails (restrict).
  ingredient_id text not null references ingredient_node (id),
  amount_value double precision check (amount_value > 0),
  amount_unit text check (amount_unit in ('ml', 'dash', 'barspoon', 'drop', 'piece', 'top')),
  entered_unit text check (entered_unit in ('ml', 'cl', 'oz', 'dash', 'barspoon', 'drop', 'piece', 'top')),
  optional boolean not null default false,
  primary key (recipe_id, position),
  check ((amount_value is null) = (amount_unit is null) and (amount_unit is null) = (entered_unit is null))
);
create index user_recipe_line_ingredient on user_recipe_line (ingredient_id);

create table user_recipe_event (
  user_id uuid not null references app_user (id) on delete cascade,
  recipe_id uuid not null references user_recipe (id) on delete cascade,
  seq int not null check (seq >= 1),
  kind text not null check (kind in ('created', 'edited', 'deleted', 'restored')),
  at timestamptz not null default now(),
  -- The spec as saved (name, method, glass, steps, lines), on created and edited only.
  spec jsonb,
  primary key (recipe_id, seq),
  check ((spec is not null) = (kind in ('created', 'edited')))
);

alter table user_recipe enable row level security;
create policy user_recipe_owner on user_recipe
  using (user_id = app_user_id()) with check (user_id = app_user_id());
alter table user_recipe_line enable row level security;
create policy user_recipe_line_owner on user_recipe_line
  using (user_id = app_user_id()) with check (user_id = app_user_id());
alter table user_recipe_event enable row level security;
create policy user_recipe_event_owner on user_recipe_event
  using (user_id = app_user_id()) with check (user_id = app_user_id());
