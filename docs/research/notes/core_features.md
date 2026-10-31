# Core Functional Features of Cocktail Recipe Apps (2026)

Research scope: functional core of cocktail apps and how leading apps (Bar Assistant, Make Me a Cocktail, Cocktail Party, Mixel, Highball, Difford's Guide, Kindred Cocktails, batching tools) implement it. ~19 tool calls; several primary sites (cocktailpartyapp.com, highball.app, Reddit mirror) blocked fetching (403/522/auth redirect), so some app details come from search snippets or third-party reviews and are flagged as such.

## 1. Recipe data model (fields, variations, canonical specs)

### Takeaway
The richest open, inspectable data model is Bar Assistant's: cocktails carry ingredients (with per-ingredient substitutes and an "optional" flag), method, glass, utensils, tags, images, ABV/strength, variations, ratings and notes, and export to JSON/YAML/XML/Markdown/JSON-LD. Kindred Cocktails is the best example of strict attribution (creator, bar, city, year, publication). I found no app documentation describing a formal "canonical vs. variant" model tied to IBA specs.

### Cited Findings
- Bar Assistant cocktails store "ingredients, tags, images, preparation methods, glass types, ABV (alcohol by volume), and strength ratings" — [Bar Assistant docs](https://docs.barassistant.app/)
- Bar Assistant recipes "support ingredient substitutes"; ingredients can be "marked as non-required for matching" (optional); a "specific ingredient matching override" exists (i.e. require a specific bottle instead of allowing parent/child matching) — [Bar Assistant docs](https://docs.barassistant.app/)
- Bar Assistant supports "cocktail variations", glass types, utensils, custom tags, multiple images with custom sort order, "preparation instructions and serving suggestions"; ships 500+ recipes and 250+ base ingredients — [Bar Assistant GitHub README](https://github.com/karlomikus/bar-assistant)
- Bar Assistant export formats: "Copy as JSON ... to import it into another bar" plus YAML, XML, Markdown and JSON-LD; also public link and generated recipe image — [Bar Assistant docs](https://docs.barassistant.app/)
- Kindred Cocktails requires attribution in the format "Person, Bar, City, State, Country (if not U.S.)" plus creation year and publication reference (website link or book/article details) — [Kindred Cocktails FAQ](https://kindredcocktails.com/info/faq)
- Kindred normalizes ingredient spelling via a synonym list and maps brands to generic ingredients (e.g. "St Germain" -> "Elderflower liqueur" with brand specified) — [Kindred Cocktails FAQ](https://kindredcocktails.com/info/faq)
- Highball recipe cards show ingredient quantities (switchable oz/ml) and simple preparation instructions; library limited to "high quality recipes for the most essential kinds of drinks", excluding novelty cocktails — [Cult of Mac review (2018)](https://www.cultofmac.com/reviews/highball-review-best-cocktail-app)
- Mixel: 2,600+ curated recipes, 650+ ingredients — [Mixel site](https://mixelcocktails.com/)

### Inferences
- A good minimum schema, assembled from the above: name; ingredients[] {ingredient_ref (generic or brand), amount, unit, optional flag, substitutes[], "require exact" flag, order}; method/technique; glass; ice; garnish; utensils; instructions; tags; ABV/strength (computed); images; source/attribution {creator, bar, city, year, publication/URL}; parent recipe / variation link; user layer (rating, notes, favorite).
- JSON-LD export (Bar Assistant) suggests schema.org/Recipe as an interoperability target.
- Separate "ice" and "garnish" fields aren't confirmed in any doc I fetched. Bar Assistant appears to treat garnish as an ingredient line or tag. This is unverified.

### Gaps
- I found no documentation of how any app marks an IBA "official" spec as canonical versus house variations. Bar Assistant has "variations", but I couldn't fetch its data shape (whether it's a parent_cocktail_id).
- Difford's Guide field set (it's known for glass, garnish, "how to make", history and rating) wasn't fetched. The search results were spam PDFs.
- Highball's current (2025–26) feature set wasn't verified. highball.app returned HTTP 522, and the only review found is from 2018.

## 2. "What can I make" and bar inventory (hierarchy, one-away, what to buy)

### Takeaway
Best practice is a three-level hierarchy (category > generic ingredient type > brand). Owning a child satisfies the parent, and recipes ask for the generic type unless an exact match is required. The "one ingredient away" view and a "what to buy next" list ranked by cocktails unlocked are the standout features. Make Me a Cocktail documents this most clearly, Bar Assistant is the reference open-source design, and Cocktail Party is known for smart substitution matching.

### Cited Findings
- Make Me a Cocktail hierarchy: "six top-level categories (spirits, liqueurs, mixers, fruit & herbs, pantry, bubbles & grapes), about 300 ingredient types under those, and thousands of specific brands under the types." Adding Absolut Citron records both the brand and its type "Lemon flavoured vodka" — [MMaC My Bar guide](https://makemeacocktail.com/myBar/guide)
- MMaC matching: a Margarita "needs tequila", not a brand. "Smart substitutions, not blunt matching." — [MMaC My Bar guide](https://makemeacocktail.com/myBar/guide)
- MMaC cascade rules: you can't remove the type while still recording a brand of that type. Removing a brand keeps the parent type if other brands exist — [MMaC My Bar guide](https://makemeacocktail.com/myBar/guide)
- MMaC "What to Buy Next" uses "the cocktails you're one away from, and what people with bars like yours bought next". It ranks by "cocktails-unlocked, not popularity" and shows "the exact cocktails each bottle adds and the average rating" — [MMaC My Bar guide](https://makemeacocktail.com/myBar/guide)
- MMaC paywalls Photo Scan (bottle recognition), multiple bars and one-ingredient-away. The "What to Buy Next" tool is premium-only — [MMaC My Bar guide](https://makemeacocktail.com/myBar/guide); [MMaC search snippet](https://makemeacocktail.com/myBar/guide)
- Bar Assistant: parent-child ingredients create "a hierarchy of ingredients that can be used for matching". The child matches the parent (Lemon Juice satisfies Citrus Juice). There are "complex ingredients" made of other ingredients (Simple Syrup = Sugar + Water) — [Bar Assistant docs](https://docs.barassistant.app/)
- Bar Assistant has two shelves (personal and bar), filters for "missing ingredient counts", a shopping list generated from missing ingredients, and multiple bars with members — [Bar Assistant docs](https://docs.barassistant.app/); [README](https://github.com/karlomikus/bar-assistant)
- Cocktail Party: "if you have brandy but not cognac, or rye but no bourbon, Cocktail Party is smart enough to use appropriate substitutions". The drinks screen has a "Drinks You Can Make" section plus drinks needing one more ingredient — [App Store listing](https://apps.apple.com/app/id928904094); [Cocktail Party help (search snippet; page 403 on fetch)](https://cocktailpartyapp.com/help-doc/the-drinks-screen)
- Kindred search: "Whiskey" retrieves "all types of whiskey, even those that don't contain 'whiskey' in the name, such as bourbon or rye" — [Kindred FAQ](https://kindredcocktails.com/info/faq)
- Mixel matches recipes to your ingredients (650+ ingredients in its virtual bar) and has cross-platform sync — [Mixel](https://mixelcocktails.com/)
- Difford's has a "My Bar" where users mark spirits on hand to pull relevant recipes. Users call it "a little clunky" — [search snippets: cocktail-society / Reddit roundup](https://cocktail-society.com/barkeeping/best-apps-for-mixology-and-cocktails/)
- On r/cocktails, users note "every 2 weeks there's a new app developer promoting a new cocktail app", which shows how saturated the "what can I make" space is — [r/cocktails thread (snippet)](https://lr.psf.lt/r/cocktails/comments/1k3b6k8/app_for_recipes_with_available_ingredients)

### Inferences
- There are two distinct relations, and they should stay distinct. (a) Hierarchy: the child satisfies the parent (bourbon satisfies whiskey, but whiskey does not satisfy bourbon). (b) Lateral substitution (rye in place of bourbon), either per recipe (Bar Assistant) or global (Cocktail Party). A per-recipe "exact required" override is needed for drinks where the specific bottle matters (e.g. Chartreuse).
- "Complex ingredients" (Bar Assistant) let a homemade syrup count as available if its components are owned. This connects inventory to sub-recipes.
- "What to buy next" algorithm: for each candidate ingredient not owned, count the recipes where it is the only missing one (optionally weighted by rating). MMaC also adds collaborative signals ("bars like yours").

### Gaps
- Cocktail Party's exact substitution rules and any "best next bottle" feature weren't verified (site 403).
- No source confirmed how Mixel handles hierarchy or near-misses. Its site doesn't mention a shopping list or substitutions.

## 3. Search and filters, and flavor-profile tagging

### Takeaway
Faceted search is now standard. Bar Assistant has 20+ facets (ABV range, strength, tags, glass, rating, base ingredient, user state) and uses Meilisearch. Mixel adds flavor and hashtag filters. Difford's filters by spirit, difficulty, occasion and flavor. Flavor tagging is mostly curated tags rather than computed profiles.

### Cited Findings
- Bar Assistant: "Extensive filtering across 20+ facets including strength, ABV ranges, tags, glass types, ratings, and user-specific preferences". Also filters by base ingredient. Optional Meilisearch indexing — [Bar Assistant docs](https://docs.barassistant.app/); [README](https://github.com/karlomikus/bar-assistant)
- Bar Assistant has "Recipe recommendations powered by user preferences and favorites" — [README](https://github.com/karlomikus/bar-assistant)
- Mixel: search by title and ingredient, hashtag and rating filters, flavor-based filtering — [Mixel](https://mixelcocktails.com/)
- Difford's search filters by spirit type, difficulty level, occasion and flavor (search snippet) — [search result summary](https://shookd.se/en/compare/diffords-guide)
- Kindred: search by partial name, ingredients, ratings and comments — [Kindred FAQ](https://kindredcocktails.com/info/faq)
- Highball: searchable by ingredient or drink category — [Cult of Mac](https://www.cultofmac.com/reviews/highball-review-best-cocktail-app)

### Inferences
- The facets to support: ingredient (hierarchy-aware, include and exclude), base spirit, computed ABV/strength, method, glass, tags (flavor/occasion/season), rating, "can make" / "missing <= N", and favorites.
- ABV filters only work if ABV is computed from ingredient ABVs plus dilution (see section 5), which Bar Assistant does.

### Gaps
- I found no documented app with a computed flavor-profile vector (sweet/sour/bitter/boozy scores). All the evidence points to tags.

## 4. Substitutions, scaling and batching, unit conversion, cook mode

### Takeaway
Unit toggling (oz/ml) is near-universal: Highball has it, and Bar Assistant has unit conversion. Batching with built-in dilution is mostly handled by dedicated calculator apps and tools (Morgenthaler's Batch Cocktail Calculator, Batchr, Jarra, Cocktail Calculator Pro, freezer-batch tools) rather than the major recipe apps. That's a clear gap a general app can fill.

### Cited Findings
- Highball cards switch between oz and ml — [Cult of Mac](https://www.cultofmac.com/reviews/highball-review-best-cocktail-app)
- Bar Assistant supports unit conversion and per-recipe ingredient substitutes — [README](https://github.com/karlomikus/bar-assistant)
- Jeffrey Morgenthaler's Batch Cocktail Calculator scales by number of servings or by total volume (target container), includes dilution ("It had to be able to calculate dilution, of course"), handles ml, oz, cups and gallons, and outputs a "printer-friendly format". A commenter uses 25% dilution for batches — [Morgenthaler](https://jeffreymorgenthaler.com/the-batch-cocktail-calculator)
- Dedicated batch/freezer tools output per-bottle amounts, dilution water to add up front, final strength and a shopping list. One gives a "freezer note" on whether the batch stays pourable or freezes solid. Another outputs pour-off amount, dilution water, final ABV and drink count for a given bottle size — [search results: Batchr, Freezer Batch Cocktails, Fashioned calculator](https://fashioned-batching-calculator.vercel.app/); [Freezer Batch Cocktails](https://zackpearson.pages.dev/work/freezer-batch-cocktails)
- Other App Store batch apps: Cocktail Calculator Pro ("Scale any cocktail to your glass size, control dilution"), Jarra (batch and ABV), Batchr, VESP (balance tool), SlushIQ (frozen drinks) — [Cocktail Calculator Pro](https://apps.apple.com/app/id6751190590); [Jarra](https://apps.apple.com/us/app/-/id6746388349); [Batchr](https://apps.apple.com/app/id6744668021)
- Arnold measured batch water: Whiskey Sour batch adds about 2.3 parts water (63% dilution, about 15.5% ABV final). Manhattan adds about 1.5 parts water (50% dilution, about 20% ABV). He recommends weighing before and after to calibrate — [Cooking Issues, Cocktail Science pt 2](https://cookingissues.com/2010/09/08/cocktail-science-in-generalpart-2-of-2/); [cocktailsandbars.com](https://cocktailsandbars.com/how-to-calculate-dilution-for-pre-batched-cocktails/)

### Inferences
- Batching should (1) scale every line, (2) add dilution water by technique (stirred is lower than shaken; Arnold's numbers above), (3) report final ABV and volume, (4) warn about freezing when ABV is low and leave out perishables (citrus, carbonation) with a note, and (5) round to practical bottle and jigger sizes.
- Parts as a unit ("2 parts gin") needs a user-chosen base unit when converting. Store canonical ml internally and render oz, cl or parts.

### Gaps
- I found no documentation of step-by-step "cook mode", timers or keep-screen-awake in any of the major cocktail apps. This is likely uncommon or undocumented, and the white space is worth noting.
- I couldn't verify Arnold's published polynomial dilution equations (often quoted as shaken: 1.567·ABV² + 1.742·ABV + 0.203; stirred: −1.21·ABV² + 1.246·ABV + 0.145, from Liquid Intelligence). Searches for those coefficients returned nothing citable, so check them against the book before implementing.
- Third-party summaries put shaking at 20–30% water and stirring at 15–20% by volume, but this source is secondary, low-authority and inconsistent with Arnold's measured 50–63% for batch-equivalents — [hakaru.io guide](https://hakaru.io/guides/cocktail-abv-calculator-guide). The conflict is real and needs resolving.

## 5. Educational content, homemade sub-recipes, calculators

### Takeaway
Bar Assistant is the clearest example of homemade ingredients as sub-recipes ("complex ingredients"), of ABV and strength computation, and of cost-per-drink from tracked ingredient prices. Calorie calculation wasn't found documented anywhere I fetched.

### Cited Findings
- Bar Assistant complex ingredients (Simple Syrup = Sugar + Water) — [Bar Assistant docs](https://docs.barassistant.app/)
- Bar Assistant tracks "Ingredient price ... across multiple sources" with "Automatic cost calculation for cocktails" — [README](https://github.com/karlomikus/bar-assistant)
- Bar Assistant stores and filters by ABV and strength — [Bar Assistant docs](https://docs.barassistant.app/)
- Simple ABV formula: Final ABV = Σ(volume × ABV) / total final volume including dilution water — [hakaru.io](https://hakaru.io/guides/cocktail-abv-calculator-guide)
- Arnold's target serving temperatures: shaken -5 to -10°C, stirred -0.5 to -7°C. His "postulate of classic cocktails" is that good drinks "maintain deliciousness over a wide range of temperatures and dilutions" — [Cooking Issues](https://cookingissues.com/2010/09/08/cocktail-science-in-generalpart-2-of-2/)

### Inferences
- Cost per drink = Σ(amount / bottle volume × bottle price), using the user's actual bottle (brand level) where known and falling back to the generic average.
- Calories can be estimated from ethanol (about 7 kcal/g × 0.789 g/ml × ml ethanol) plus the sugar content of each ingredient. This needs per-ingredient sugar data, which no fetched app documents. (This is a general nutrition approximation, not from a cited app.)

### Gaps
- Coverage of technique guides, glassware, and spirit encyclopedias (Difford's, Cocktail Party's ingredient pages at cocktailpartyapp.com/ingredients exist per search) wasn't examined in depth.

## 6. Personalization, menus

### Takeaway
Favorites, ratings, notes and custom recipes are table stakes (Mixel, Bar Assistant, Kindred, Highball). Bar Assistant goes further with shared collections, public menus and multi-bar roles. Printable output appears in batch tools (Morgenthaler).

### Cited Findings
- Mixel: bookmark, rate, create custom recipes, tag and organize, plus a "Bart" AI bartender that generates recipes, including from photos — [Mixel](https://mixelcocktails.com/)
- Bar Assistant: ratings, personal notes, favorites, collections shareable "with all the members in the bar", public sharing via links and menus, user roles — [Bar Assistant docs](https://docs.barassistant.app/); [README](https://github.com/karlomikus/bar-assistant)
- Kindred "Cocktail Book" with personal ratings and notes "for your personal use" — [Kindred FAQ](https://kindredcocktails.com/info/faq)
- Highball: custom recipes, editable after import — [Cult of Mac](https://www.cultofmac.com/reviews/highball-review-best-cocktail-app)

### Gaps
- I didn't find a party-menu builder with guest-facing printable menus documented for the consumer apps beyond Bar Assistant's public menu.

## 7. Social/community, offline, sync, import/export

### Takeaway
Highball's QR-code shareable recipe card, which stays editable when imported, is the elegant sharing model. Kindred's curator-review and "REQUEST CURATION" flow is the best documented approach to moderating user-submitted recipes. Bar Assistant leads on import/export: URL scraping with ingredient matching, plus JSON, YAML and other formats.

### Cited Findings
- Highball shares recipe cards as images with QR codes: "the image is easily shared, but is also editable once imported into the app" — [Cult of Mac](https://www.cultofmac.com/reviews/highball-review-best-cocktail-app)
- Kindred: community submissions, curators review flagged entries, and any user can click "REQUEST CURATION". "Requesting curation is a key to keeping the shared Kindred Cocktail database in good condition, without duplicate recipes, errors, and junk cocktails." — [Kindred FAQ](https://kindredcocktails.com/info/faq)
- Bar Assistant imports via "URL, JSON, YAML or custom collections". Website scraping includes "automatic ingredient name-matching and manual override options". It also has SSO and personal access tokens — [README](https://github.com/karlomikus/bar-assistant); [docs](https://docs.barassistant.app/)
- Mixel: cross-platform sync — [Mixel](https://mixelcocktails.com/)
- MMaC supports multiple bars (premium) — [MMaC guide](https://makemeacocktail.com/myBar/guide)

### Inferences
- When importing, ingredient matching with manual override (Bar Assistant) is the critical step. Without it, imported recipes won't take part in "what can I make".
- Kindred-style synonym normalization plus a curation queue reduces duplicates in a user-generated recipe database.

### Gaps
- Offline behavior wasn't explicitly documented for any app fetched. Mixel's offline support is only implied.
- Following and social feeds weren't found documented in any major app.
