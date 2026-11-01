-- Substitutions (M2-05): every house swap says why a bartender accepts it; a recipe line can be
-- exact (the drink is named for that bottle, so no swap stands in); and a user can turn a swap
-- off. Swaps count until refused, so only refusals are stored. A refusal of a swap the seed
-- drops goes with it.
alter table ingredient_substitution add column reason text not null default '';
alter table ingredient_substitution alter column reason drop default;
alter table recipe_line add column exact boolean not null default false;

create table substitution_refusal (
  user_id uuid not null references app_user (id) on delete cascade,
  substitute text not null,
  replaces text not null,
  refused_at timestamptz not null default now(),
  primary key (user_id, substitute, replaces),
  foreign key (substitute, replaces) references ingredient_substitution (substitute, replaces)
    on delete cascade
);
alter table substitution_refusal enable row level security;
create policy substitution_refusal_owner on substitution_refusal
  using (user_id = app_user_id()) with check (user_id = app_user_id());
