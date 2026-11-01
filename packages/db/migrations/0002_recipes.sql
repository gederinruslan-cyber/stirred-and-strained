-- House recipes (M1-06): facts from credited sources, our own text. Read-only for the api.
-- Strength is never stored; it is derived from the lines (ADR 0004).
create table recipe (
  id text primary key check (id ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  name text not null check (length(trim(name)) > 0),
  method text not null check (method in ('shaken', 'stirred', 'built', 'blended', 'muddled', 'layered')),
  glass text,
  tags text[] not null default '{}',
  -- Provenance: every house recipe says where its spec comes from and under what licence.
  -- A URL, or a citation (book, bar, bartender) when the spec has no web page.
  source text not null check (length(trim(source)) > 0),
  credit text not null check (length(trim(credit)) > 0),
  licence text not null check (length(trim(licence)) > 0),
  -- How to make it, in our own words; null until written (the page derives steps from method).
  steps text
);

create table recipe_line (
  recipe_id text not null references recipe (id) on delete cascade,
  position int not null check (position >= 0),
  ingredient_id text not null references ingredient_node (id),
  -- Canonical amount: ml or a counted unit (packages/units); null for "to taste" lines.
  amount_value numeric(9, 3) check (amount_value >= 0),
  amount_unit text check (amount_unit in ('ml', 'dash', 'barspoon', 'drop', 'piece', 'top')),
  amount_max numeric(9, 3) check (amount_max >= amount_value),
  optional boolean not null default false,
  primary key (recipe_id, position),
  check ((amount_value is null) = (amount_unit is null)),
  check (amount_max is null or amount_value is not null)
);
create index recipe_line_ingredient on recipe_line (ingredient_id);

revoke insert, update, delete, truncate on recipe, recipe_line from stirred_app;
