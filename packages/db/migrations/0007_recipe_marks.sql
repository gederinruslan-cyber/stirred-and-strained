-- Favourites, ratings and notes (M2-07): what a user keeps about a recipe they can open, a house
-- recipe or their own. One row per user and recipe. A note is never lost: the text before its last
-- change is kept for undo, and a row is deleted only when nothing, not even that, is left. A re-seed
-- that would delete a marked house recipe fails (restrict); an own recipe is only ever soft
-- deleted, so its mark waits for the restore.
create table recipe_mark (
  user_id uuid not null references app_user (id) on delete cascade,
  house_recipe_id text references recipe (id),
  user_recipe_id uuid references user_recipe (id) on delete cascade,
  favourite boolean not null default false,
  rating smallint check (rating between 1 and 5),
  -- Private plain text; never logged.
  note text check (length(note) between 1 and 1000),
  -- The note before its last change (null: it was empty); undo swaps the two.
  note_before text check (length(note_before) between 1 and 1000),
  updated_at timestamptz not null default now(),
  check ((house_recipe_id is null) <> (user_recipe_id is null)),
  check (favourite or rating is not null or note is not null or note_before is not null)
);
create unique index recipe_mark_house on recipe_mark (user_id, house_recipe_id)
  where house_recipe_id is not null;
create unique index recipe_mark_own on recipe_mark (user_id, user_recipe_id)
  where user_recipe_id is not null;
create index recipe_mark_house_recipe on recipe_mark (house_recipe_id);
create index recipe_mark_user_recipe on recipe_mark (user_recipe_id);

alter table recipe_mark enable row level security;
create policy recipe_mark_owner on recipe_mark
  using (user_id = app_user_id()) with check (user_id = app_user_id());
