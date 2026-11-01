-- The ingredient graph (category > type > brand) and one-way substitution edges, in the shape
-- packages/engine reads. House data: written by the seed import, read-only for the api.
create table ingredient_node (
  id text primary key check (id ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  name text not null check (length(trim(name)) > 0),
  kind text not null check (kind in ('category', 'type', 'brand')),
  parent_id text references ingredient_node (id),
  -- Ingredient strength as % ABV (0 for zero-proof and non-alcoholic ingredients).
  abv numeric(5, 2) not null check (abv between 0 and 100),
  check ((kind = 'category') = (parent_id is null))
);
create index ingredient_node_parent on ingredient_node (parent_id);

create table ingredient_substitution (
  substitute text not null references ingredient_node (id),
  replaces text not null references ingredient_node (id),
  primary key (substitute, replaces),
  check (substitute <> replaces)
);
create index ingredient_substitution_replaces on ingredient_substitution (replaces);

revoke insert, update, delete, truncate on ingredient_node, ingredient_substitution from stirred_app;
