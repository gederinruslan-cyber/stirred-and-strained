# Engine

## Requirement: Matching reads the ingredient taxonomy
Ingredients form a tree: category > type > brand, where a type may sit under another type
(bourbon under american whiskey under whiskey).

- **Scenario: child satisfies parent.** Owning Buffalo Trace (a bourbon) satisfies a line for
  bourbon and a line for american whiskey. Owning "whiskey" does not satisfy a line for bourbon.
- **Scenario: exact lines.** A line for Campari marked exact is satisfied only by Campari, not by
  another bitter aperitivo, a bottle under it or a substitute.
- **Scenario: substitutions.** A substitution is one-way and one hop: with rye → bourbon, rye or
  a rye brand stands in for bourbon, bourbon does not stand in for rye, and scotch → rye never
  lets scotch stand in for bourbon.
- **Scenario: which bottle is used.** A direct match beats a substitution; among equals the bottle
  with the smallest id is used.
- **Scenario: optional lines.** An optional line never stops a recipe from being makeable.

## Requirement: Make now, one away and buy next
- **Scenario: make now.** With Tanqueray, Campari, sweet vermouth, Rittenhouse, lemon, sugar and
  soda, the bar makes Boulevardier (rye for bourbon), Bourbon Highball (rye for bourbon), Campari
  Soda, Gin Sour, Manhattan, Negroni and Whiskey Sour, each listing the substitutions it used.
- **Scenario: one away.** With gin, sweet vermouth and lemon, the bar is one away from Gin Sour
  (sugar), Manhattan (rye) and Negroni (bitter aperitivo).
- **Scenario: buy next.** With gin, sweet vermouth and soda, the ranking is Campari (completes
  Campari Soda and Negroni), rye (Bourbon Highball through the substitution, and Manhattan), then
  bitter aperitivo, bourbon and lime juice, one recipe each.
- **Scenario: stated order.** Recipes are ordered by name, then id; buy next by recipes
  completed (most first), then ingredient name, then id. The order in which the bar and recipes
  arrive never changes the result.

- **Scenario: refused swaps.** `refuse(tax, edges)` drops a user's refused edges and keeps the
  rest; refusing never lets a bar make more than it could with every swap.
- **Scenario: one away with swaps.** A one-away recipe lists the swaps its covered lines use.

## Requirement: The taxonomy is checked when it is built
- **Scenario: bad taxonomy.** An unknown parent, a duplicate id, a parent cycle or a substitution
  naming an unknown ingredient is refused.

## Requirement: The landing page runs on a sample library until the house library exists
- **Scenario: demo bar.** With gin, sweet vermouth, bitter aperitivo and the basics (lemon,
  lime, sugar, soda, water), the bar makes Negroni, Americano, Gimlet and Tom Collins, and is one
  bottle (bourbon) away from the Boulevardier.
