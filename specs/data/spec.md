# Data and isolation

## Requirement: The api runs with least privilege
- **Scenario: runtime role.** The api's database role is not a superuser, cannot bypass
  row-level security, owns nothing and cannot create tables,
  temporary ones included.
- **Scenario: unsafe role refused.** Given the api is configured with a superuser, a BYPASSRLS
  role or a role that acts as the table owner, then it refuses to start and says why, without
  printing the connection details.
- **Scenario: setup is repeatable.** Setting up roles and migrations twice changes nothing.

## Requirement: Schema changes are reversible
- **Scenario: up and down.** Every migration has a down; applying all, undoing all and applying
  all again ends in the same state.
- **Scenario: incomplete migration refused.** A migration without a down, or one that manages its
  own transaction, is refused before anything runs.

## Requirement: A user reaches only their own rows
- **Scenario: another user's row.** Given user A owns a row, when user B reads, changes or deletes
  it by id, then B gets nothing (the api answers 404) and A's row is unchanged — also when the
  code forgets to filter by user.
- **Scenario: outside a user's scope.** Outside a user-scoped unit of work, user-owned tables
  show no rows.
- **Scenario: malformed user id.** A malformed user id is refused before any query runs.

## Requirement: The ingredient taxonomy is house data in the engine's shape
- **Scenario: shape.** Nodes (id, name, kind category|type|brand, parent, ABV 0–100) and one-way
  substitution edges load in the shape the engine reads, ordered by id; ABV is a number and
  non-alcoholic ingredients are stored at 0.
- **Scenario: kind rules.** A category has no parent; a type or brand has one; an unknown parent,
  an ABV outside 0–100 or an unknown kind is refused.
- **Scenario: edges.** An edge naming an unknown node, a node replacing itself or a duplicate edge
  is refused; deleting a node that still has children or edges is refused.
- **Scenario: read-only at runtime.** The api role can read the taxonomy and cannot insert,
  update or delete it.

## Requirement: House recipes are imported with provenance, in canonical amounts
- **Scenario: taxonomy placement.** Source ingredients land as category > type > brand: a root
  with children is a category, a childless root is placed under a named category (salt under
  pantry), a node with a producer is a brand; ABV is the ingredient's own strength, and the
  result is a valid engine taxonomy.
- **Scenario: only accepted stand-ins.** A source parent that would let an ingredient stand in
  where a bartender would refuse it is overridden: tequila does not satisfy mezcal, orgeat or
  honey syrup does not satisfy simple syrup (demerara does), sloe gin does not satisfy gin,
  flavoured rum or vodka does not satisfy rum or vodka, Cocchi Americano does not satisfy dry
  vermouth.
- **Scenario: no 0% spirits.** A recipe line whose ingredient sits under spirits, liqueurs,
  aperitifs, bitters, fortified wine or wine at 0% ABV fails the import; the rules give such an
  ingredient its usual label strength, erring high (rum 40%, crème de banane 25%, fino 15%).
- **Scenario: canonical amounts.** 1.5 oz is stored as 44.360 ml and 1 tsp as 4.929 ml; dashes
  stay dashes, "top up" is top 1, leaves, slices and wedges are pieces, and a range keeps its
  maximum.
- **Scenario: fails loudly.** A recipe without a source, with an amount that cannot be made
  canonical ("1 part"), an unknown ingredient or no method fails the import, naming the recipe,
  unless it is listed as excluded with a reason.
- **Scenario: provenance.** Every house recipe stores its source (a URL or a citation), a credit
  line and the licence; the source's own prose, images and computed strengths are never stored.
- **Scenario: IBA classics.** A recipe credited to the IBA matches the IBA's own page or is
  corrected to it and credited to the IBA; one never checked against its page fails the import.
  Negroni is 30/30/30 ml; Daiquiri 60 ml rum, 20 ml lime, 2 barspoons sugar; Margarita 50/20/15
  ml; Old Fashioned 45 ml whiskey, 1 sugar cube, dashes of Angostura.
- **Scenario: no recipe without alcohol.** A recipe whose every ingredient is 0% fails the import
  unless excluded with a reason; the 9 upstream no-alcohol recipes (Shirley Temple, Neruda…) are
  excluded ("zero-proof dropped", 2026-11-01), leaving 595 recipes. The upstream "Virgin" tag is
  dropped.
- **Scenario: idempotent.** Importing twice leaves identical rows; a recipe dropped from the
  source is removed.
- **Scenario: read-only at runtime.** The api role can read recipes and cannot write them.
- **Scenario: swaps and exact lines (M2-05).** `rules.json` `substitutions` (with a reason each)
  and `exact` (recipe → ingredient: the drink is named for it) import with the seed; an edge to an
  unknown ingredient, an edge whose substitute already counts as what it replaces, an edge with no
  reason, or an exact line on a recipe not imported, a line it lacks or an ingredient no swap
  targets fails the import. Re-import keeps users' refusals; an edge the seed drops takes its
  refusals with it.

