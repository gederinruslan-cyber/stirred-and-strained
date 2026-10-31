# Win the home bar with trusted recipes

A modern cocktail web app should be built around one engine: an inventory-aware "what can I make" system that understands ingredient hierarchies (bourbon counts as whiskey), handles substitutions the way a bartender would, shows drinks you are one bottle away from, and ranks "what to buy next" by how many drinks each bottle unlocks. Put a curated, accurately specified recipe database on top of it, and make custom recipes first-class: searchable, editable, never lost, and exportable. The market leaves room for this. The deepest databases (Difford's Guide at 20,000+ recipes, Make Me a Cocktail at 3,500+) are web-first but look dated and hide their best inventory tools behind paywalls. The best-designed apps (Mixel, Highball, Cocktail Party, Cocktail Flow) are mostly Apple-only, and several have not been updated in five to eight years. A 2025–2026 wave of small AI apps has made photo bottle-scanning and "AI bartender" chat look like table stakes without making either trustworthy. The opportunity is to combine three things that no product combines today: Difford's-grade curation, Mixel-grade design, and a fast, installable, offline-capable web experience. Zero-proof drinks should be a full mode, not a filter, because US adult drinking has fallen to a record-low 54% and no-alcohol spirits are growing about 10% a year. Monetize with a simple one-time or low-cost plan plus barware and mixer commerce. Alcohol affiliate margins are thin, and they bring advertising-law obligations with them.

## Stale native apps and dated web giants leave the middle open

The market falls into three groups, and none of them covers the full need. The first is the editorial web databases. **Difford's Guide has 20,000+ curated recipes**, but its ingredient-combination search, "Cabinet" inventory search, and up to 300 personal recipes sit behind a Premium tier priced at "less than £1 per week" ([Difford's Premium](https://www.diffordsguide.com/premium)). **Make Me a Cocktail**, web-first since 2010, has 3,500+ recipes and the best-documented "My Bar" tool ([makemeacocktail.com](https://makemeacocktail.com/blog/top-5-must-know-make-me-a-cocktail-secrets)). Kindred Cocktails is a free, ad-supported, curator-moderated craft database ([Kindred FAQ](https://kindredcocktails.com/info/faq)). Liquor.com and Punch are editorial magazines with recipe archives ([Punch](https://punchdrink.com/articles/most-popular-cocktail-recipes-2025/)).

The second group is the polished native apps, almost all on Apple platforms. **Mixel** leads them, with 4.8 stars from 1.5K ratings, 2,600+ recipes, inventory matching, sync, and a "BART" AI bartender limited to 5 free conversations a month. Its last listed update was August 2025 ([App Store](https://apps.apple.com/US/app/id1280464759)). The others are aging. **Highball's last update was October 2018** ([App Store](https://apps.apple.com/us/app/highball-by-studio-neat/id973319934)). **Cocktail Flow's was December 2019**, even though it still holds 4.6 stars from 2,600+ ratings ([App Store UK](https://apps.apple.com/gb/app/id486811622)). Cocktail Party ($3.99 one-time, no ads) was last updated in September 2024 ([App Store](https://apps.apple.com/us/app/id928904094)). The category's typical failure is abandonware, not shutdown: apps stay listed but stop improving.

The third group is a flood of small AI-native apps from 2025–2026: Home Bar Hero, Bar Maestro, BARAI, Sip AI, Spritz, OpenBar, Elixirate, BarShelf, BarGPT, Topa, Pocket Bartender and more. They all pitch the same trio of bottle scanning, chat bartender, and generate-from-inventory ([Bar Maestro](https://apps.apple.com/us/app/id6757890867); [OpenBar](https://apps.apple.com/app/id6760921002); [hunted.space/Topa](https://hunted.space/product/topa)). Most have few ratings. On r/cocktails, users note that "every 2 weeks there's a new app developer promoting a new cocktail app" ([r/cocktails thread](https://lr.psf.lt/r/cocktails/comments/1k3b6k8/app_for_recipes_with_available_ingredients)).

Outside these groups, the open-source **Bar Assistant + Salt Rim** (MIT, about 1.1k GitHub stars) is the most complete feature reference. It offers multi-bar roles, substitutes, shopping lists, cost calculation, Meilisearch, and export to JSON, YAML, XML, Markdown and JSON-LD, but it has no native mobile app ([GitHub](https://github.com/karlomikus/bar-assistant)). Hardware players such as Barsys 360 ($279–$375) treat their apps as companions to the machine ([Barsys](https://360.barsys.com/)).

One caution applies to everything in this section: nearly every 2026 "best cocktail app" roundup was written by a competing app maker, and they contradict each other and the App Store on basic facts such as Mixel's pricing and platforms ([DrinkCountr](https://drinkcountr.com/best-home-bar-apps/); [Home Bar Hero](https://homebarhero.ai/blog/best-free-cocktail-apps/)). No traffic, download or revenue figures were available for any cocktail app.

## The "what can I make" engine is the product

### Hierarchy, substitution and "buy next" set the best apps apart

Make Me a Cocktail documents the best-practice model most clearly. It uses a three-level taxonomy: **six top-level categories, about 300 ingredient types, and thousands of brands**. Adding Absolut Citron records both the brand and its type. Recipes ask for the type ("a Margarita needs tequila"), not a brand ([MMaC My Bar guide](https://makemeacocktail.com/myBar/guide)). Bar Assistant adds two refinements worth copying. Per-recipe substitutes and an "optional" flag. A "specific ingredient matching override" for drinks where the exact bottle matters. And "complex ingredients", so that owning sugar and water counts as having simple syrup ([Bar Assistant docs](https://docs.barassistant.app/)). Cocktail Party is praised for substitutions that are "smart enough" to use brandy for cognac or rye for bourbon, and for listing near-miss drinks below the ones you can make now ([App Store](https://apps.apple.com/app/id928904094)).

The design point that matters is to **keep two relations separate**. The first is hierarchical: a child satisfies its parent, so bourbon satisfies "whiskey", but not the reverse. The second is lateral substitution, such as rye for bourbon, set either per recipe or globally. A per-recipe "exact required" flag protects drinks like a Last Word, where the specific bottle matters (Chartreuse).

"What to buy next" is the standout feature. MMaC ranks candidate bottles by **"cocktails-unlocked, not popularity"**, shows which drinks each bottle adds and their average rating, and mixes in "what people with bars like yours bought next". It also paywalls this tool, together with one-ingredient-away views and photo scanning ([MMaC My Bar guide](https://makemeacocktail.com/myBar/guide)). Difford's paywalls its Cabinet search as well ([Difford's Premium](https://www.diffordsguide.com/premium)). Offering these free on the web would match the best paid features in the market. The algorithm is simple: for each ingredient you don't own, count the recipes where it is the only missing item, optionally weighted by rating.

### The data model needs attribution, variations and computed strength

A defensible schema, assembled from Bar Assistant and Kindred, has these fields:

- name
- ingredient lines, each with a generic-or-brand reference, amount, unit, optional flag, substitutes, exact-match flag and order
- method, glass, ice, garnish and utensils
- concise steps
- tags for flavor, occasion, season and family
- computed ABV
- images with credits
- parent-recipe or variation links
- full attribution
- a user layer for rating, notes and favorites

Kindred sets the attribution bar: "Person, Bar, City, State, Country" plus year and publication. It also normalizes brands to generics through a synonym list ("St Germain" maps to "Elderflower liqueur") ([Kindred FAQ](https://kindredcocktails.com/info/faq)). Bar Assistant's JSON-LD export points to schema.org/Recipe as the interoperability and SEO target ([Bar Assistant docs](https://docs.barassistant.app/)). No app found documents a formal "canonical IBA spec versus house variation" model. That is a gap, and an enthusiast-pleasing opportunity, given that users value Difford's for its "treatment of recipe variations" ([mixologybywhip.com](https://mixologybywhip.com/learn/best-cocktail-recipe-app-reddit)).

### Faceted search is standard, but computed flavor profiles are not

Bar Assistant exposes **20+ facets**, including ABV range, strength, glass, tags, rating, base ingredient and user state ([Bar Assistant docs](https://docs.barassistant.app/)). Mixel adds flavor and hashtag filters ([Mixel](https://mixelcocktails.com/)). Kindred's hierarchy-aware search returns bourbon and rye for "whiskey" ([Kindred FAQ](https://kindredcocktails.com/info/faq)). Every flavor system found is curated tags. None computes sweet, sour, bitter or boozy scores. A real ABV filter requires computing finished-drink ABV, including dilution: Σ(volume × ABV) ÷ total volume with dilution water ([hakaru.io](https://hakaru.io/guides/cocktail-abv-calculator-guide)).

### Batching and bar mode are open ground

Unit toggling between oz and ml is near-universal ([Cult of Mac on Highball](https://www.cultofmac.com/reviews/highball-review-best-cocktail-app)). Batching with dilution, however, lives in separate tools. Jeffrey Morgenthaler's calculator scales by servings or container volume, adds dilution, and prints ([Morgenthaler](https://jeffreymorgenthaler.com/the-batch-cocktail-calculator)). Freezer-batch tools output dilution water, final ABV and a "freezer note" on whether the batch stays pourable ([Freezer Batch Cocktails](https://zackpearson.pages.dev/work/freezer-batch-cocktails)). Dave Arnold's measurements show how much water batches need. A Whiskey Sour batch takes about **63% dilution (about 15.5% ABV)** and a Manhattan about **50% (about 20% ABV)**, and he recommends weighing to calibrate ([Cooking Issues](https://cookingissues.com/2010/09/08/cocktail-science-in-generalpart-2-of-2/)). Secondary guides give much lower shake and stir figures (15–30%), and the dilution polynomials often attributed to *Liquid Intelligence* could not be verified. Check the primary source before hard-coding a dilution model.

No major cocktail app documents a step-by-step "cook mode" with keep-awake. That gap is easy to fill on today's web (see below).

### Custom recipes, import and portability are the enthusiast's test

Highball's sharing model is elegant: a recipe image card with an embedded QR code that stays editable once imported ([Cult of Mac](https://www.cultofmac.com/reviews/highball-review-best-cocktail-app)). Bar Assistant leads on import. It scrapes recipes from URLs, uses "automatic ingredient name-matching and manual override options", and accepts JSON and YAML ([GitHub](https://github.com/karlomikus/bar-assistant)). Without that matching step, imported recipes can't take part in "what can I make". Kindred's "REQUEST CURATION" queue is the best-documented way to keep a user-generated recipe database free of duplicates and junk ([Kindred FAQ](https://kindredcocktails.com/info/faq)).

## Users reward bartender logic and punish paywalls, gimmicks and data loss

Users praise apps that think the way a bartender does. One Mixel reviewer titled their review "Finally, a bar app that 'thinks' like a bartender" because "spirit brand names fall onto categories" ([App Store](https://apps.apple.com/us/app/mixel-cocktail-recipes/id1280464759)). Cocktail Party users praise its ingredient tracking, its "incredibly active and involved" developers, and its one-time price over subscriptions ([justuseapp](https://justuseapp.com/en/app/928904094/cocktail-party-drink-recipes/reviews)). A vendor summary of Reddit threads says enthusiasts treat Difford's as "a dependable reference" and value Bartender's Choice for recipes tied to respected working bartenders ([mixologybywhip.com](https://mixologybywhip.com/learn/best-cocktail-recipe-app-reddit)). Curation and authority earn more trust than raw recipe counts.

The complaints are specific, and each one points to a design rule:

- **Confusing or broken monetization.** Mixel's mix of $1.99/$14.99/$49.99 SKUs and packs produced reviews like "Paid and got nothing?" ([justuseapp](https://justuseapp.com/en/app/1280464759/mixel-cocktail-recipes/reviews)). The objection is to subscriptions and opaque pricing, not to paying.
- **Gimmicky visuals.** Mixel's 8-bit pixel art is its most repeated complaint ("Mixel hurts my eyes"), and one reviewer left for a competitor because of it ([justuseapp](https://justuseapp.com/en/app/1280464759/mixel-cocktail-recipes/reviews)).
- **Custom recipes treated as second-class.** A Mixel recipe "mysteriously disappeared" after saving ([App Store](https://apps.apple.com/us/app/mixel-cocktail-recipes/id1280464759)). Cocktail Party's editor shows four ingredients at a time, and "custom drinks don't appear in regular search" ([justuseapp](https://justuseapp.com/en/app/928904094/cocktail-party-drink-recipes/reviews)).
- **Readability at the bar.** A Cocktail Party user twice got quantities wrong because the measurement font was too small ([justuseapp](https://justuseapp.com/en/app/928904094/cocktail-party-drink-recipes/reviews)).
- **Inconsistent data across surfaces.** Cocktail Party's app and website recipes don't match ([justuseapp](https://justuseapp.com/en/app/928904094/cocktail-party-drink-recipes/reviews)).
- **Slow inventory entry.** Each bottle takes about 30 seconds to add by hand in Liquor Locker, and even label scanners require reviewing their suggestions ([DrinkCountr](https://drinkcountr.com/best-home-bar-apps/); [Elixiary](https://elixiary.com/education/app-comparisons/best-cocktail-apps-2026)).

Mixel reviewers explicitly ask for **a web version**, iPad keyboard support, better filtering and ratings ([justuseapp](https://justuseapp.com/en/app/1280464759/mixel-cocktail-recipes/reviews)).

Workarounds show where demand goes unmet. There is a paid Notion template market that rebuilds "what can I make" and "ingredients to buy in priority" as databases ([Gumroad template](https://lucasgoebels.gumroad.com); [Notion template](https://www.notion.com/fr/templates/cocktail-recipe-bar-organizer)). People self-host Bar Assistant to keep their creations off third-party apps ([selfhostyourself.com](https://selfhostyourself.com/services/bar-assistant)). And one roundup concludes that "no single app covers recipes, inventory, and hosting" and recommends a three-app stack ([DrinkCountr](https://drinkcountr.com/best-home-bar-apps/)). Together these point to three needs: **data ownership and export, recipe import, and flexible personal schemas**.

The evidence has limits. Reddit and full App Store review pages could not be read directly. Recipe inaccuracy and missing unit conversion have not been confirmed as top complaints, although a 2015 test found accuracy ranging from 12/12 down to 5/12 across apps ([A Bar Above](https://abarabove.com/cocktail-apps-review/)). Segment differences are thin but consistent. Enthusiasts need variations, lineage and custom-spec control. Casual users need "what can I make tonight", clean design and no paywall friction. Hosts need party shopping lists.

## Data, licensing, compliance and money all favor a cautious, commerce-light stack

### Seed from open data, write your own text, and never reuse photos without a license

**TheCocktailDB** is the default free API. Its test key "1" is for development only, and public apps "must sign up to Premium", which costs a small one-off fee of about $10 ([TheCocktailDB](https://www.thecocktaildb.com/api.php)). It publishes **no formal data or image license**. Its measures mix oz, ml, tbsp and inconsistent fractions across flat strIngredient1..N fields ([Cocktail analysis](https://agdal1125.github.io/my-projects/Cocktail_Analysis_2)). Bulk-copying its data or photos is risky. Use it as a live API, or get written permission. The cleaner seed stack is:

- the **102-drink IBA list** (November 2024 revision) as the canonical classics ([Wikipedia](https://en.wikipedia.org/wiki/List_of_IBA_official_cocktails))
- the **MIT-licensed Bar Assistant data repo**, which stores JSON recipes and requires a credit on every image ([GitHub](https://github.com/bar-assistant/data))
- **CC0 Wikidata** for ingredient metadata ([Wikidata](https://www.wikidata.org/wiki/Wikidata:Licensing))

Bar Assistant's images credited to outlets such as Imbibe probably carry third-party rights, so use its text and data and source your own photos. Open Food Facts covers bottles and barcodes under the **ODbL share-alike** license. Keep it in a separate product table so your recipe database doesn't become a derivative ([OFF licensing](https://openfoodfacts.github.io/openfoodfacts-server/api/tutorials/license-be-on-the-legal-side)). API Ninjas' free tier excludes commercial use, and paid plans start at $39/month ([API Ninjas](https://api-ninjas.com/pricing)). No public APIs were found for Difford's or Liquor.com.

Copyright law makes this approach safe. In the US, "a mere listing of ingredients or contents, or a simple set of directions, is uncopyrightable". Descriptions, photos and compilations can be protected ([USCO Circular 33](https://www.copyright.gov/circs/circ33.pdf)). In the EU, the CJEU held in *Levola Hengelo* that taste is not a copyright "work" ([Mondaq](https://mondaq.com/unitedstates/food-and-drugs-law/768018/taste-cannot-be-copyrighted-in-european-union)). The practical rule: store specs and write short method steps in your own words, never copy headnotes, and credit the creator and venue for modern drinks. Credit is a community norm, not a legal duty, but enthusiasts care about it. Two risks were flagged but not sourced: bulk extraction from a curated database such as Difford's (EU database right) and trademarked drink names. Avoid scraping and check names before launch.

### Compliance turns on whether you sell or advertise alcohol

A recipe site is mostly content. Brand placements, affiliate links and sponsored posts are what make it marketing. In France, the Loi Evin limits online alcohol ads to objective product information, bans lifestyle associations and interstitial formats, and requires the health warning "L'abus d'alcool est dangereux pour la santé" ([EUCAM France](https://eucam.info/regulations-on-alcohol-marketing/france/)). It is actively enforced: Addictions France won a case against Meta in 2023 ([EUCAM](https://eucam.info/2023/02/27/addictions-france-wins-lawsuit-against-meta-over-alcohol-ads/)). The UK CAP Code bars alcohol ads in any medium where **more than 25% of the audience is under 18** ([ASA](https://www.asa.org.uk/advice-online/alcohol-the-young.html)). An age gate counts as extra screening, not the whole solution. In the Bacardi ruling, the gate worked alongside a verified 87.61% adult audience ([ASA ruling](https://www.asa.org.uk/rulings/bacardi-martini-ltd-a11-175086.html)). The US distillers' DISCUS code expects brand sites to ask for a full date of birth before full engagement, and to place ads only where at least 71.6% of the audience is of legal age ([DISCUS](https://www.distilledspirits.org/?p=7975)). An independent app isn't bound by DISCUS, but it is the industry norm.

The pragmatic package has five parts:

- a lightweight age gate set to the visitor's local legal age, storing an "of legal age" boolean rather than a birthdate, which lowers GDPR exposure
- ungated zero-proof browsing
- no youth-oriented design
- a responsible-drinking footer
- consent for affiliate and analytics cookies

Consider limiting alcohol commerce to the US. Several areas remain unresearched: per-country drinking ages, US FTC and TTB affiliate rules, Ireland's 2026 labelling rules, Nordic bans, and app-store alcohol policies.

### Monetization should be simple, and commerce should lean on non-alcohol products

The models in use are:

- one-time purchases (Cocktail Party $3.99; Mixel up to a $49.99 lifetime)
- subscriptions (Difford's at about £50 a year; Cocktail Flow at £4.99 a month or £24.99 a year; Home Bar Hero at $2.99 a month)
- tips (Highball)
- ads (Kindred)
- seasonal packs at £0.99
- hardware

([Cocktail Party](https://apps.apple.com/us/app/id928904094); [Cocktail Flow](https://apps.apple.com/gb/app/id486811622); [Highball](https://apps.apple.com/us/app/highball-by-studio-neat/id973319934))

AI usage is the usual paywall lever, as in Mixel's 5 free chats a month ([App Store](https://apps.apple.com/US/app/id1280464759)). Alcohol commerce changed after Uber shut Drizly in March 2024 and folded it into Uber Eats ([Modern Retail](https://www.modernretail.co/operations/why-uber-decided-to-sunset-drizly/)). The remaining affiliate options pay little. ReserveBar pays about 4% with a 30-day cookie ([Affilimate](https://affilimate.com/programs/reservebar-affiliate-program/)). Total Wine pays about 4% with a 1-day cookie ([Affilimate](https://affilimate.io/programs/total-wine-affiliate-program/)). Instacart's shoppable-recipe API reaches 85,000+ retailers and pays about 3%, though alcohol is reportedly excluded from commission ([Instacart](https://company.instacart.com/business/developers); [Jupiter](https://www.jupiter.co/blog/instacart-affiliate-for-food-creators)). Better-aligned partners include Shaker & Spoon ($15 plus 5%) and Bartesian ($15 per machine) ([LinkClicky](https://linkclicky.com/affiliate-program/shaker-spoon); [Bartesian](https://bartesian.com/pages/bartesian-affiliate)). A sound model, then, is:

- a generous free core, including inventory matching and buy-next
- a clear one-time or annual "Pro" plan for multiple bars, batching, export automation and higher AI limits
- Instacart "buy missing mixers and citrus" links
- barware, NA-spirit and kit affiliates, which mostly avoid alcohol-advertising rules

## Zero-proof, constrained AI and the modern web change the feature set

### Treat no-alcohol drinks as a first-class mode

Alcohol volumes are shrinking. IWSR reports a 2% global drop in 2025, the third straight year of decline ([BeverageDaily](https://www.beveragedaily.com/Article/2025/03/20/the-biggest-opportunities-for-alcohol-free-and-low-alcohol-drinks/)). **No-alcohol spirits rose 13% in 2024 and were forecast to grow about 10% in 2025 and 9% in 2026**, with an 18% CAGR forecast for the US through 2028 ([The Spirits Business](https://www.thespiritsbusiness.com/?p=904305)). Gallup puts US adult drinking at **54%, a record low, and 50% among 18–34s** ([Fortune](https://fortune.com/2025/08/13/gen-z-drinking-alcohol-attitudes-gallup-survey)). Not everyone reads this as structural ([Beervana](https://www.beervanablog.com/beervana/2025/8/19/gallup-may-be-premature)), but the direction is clear. IWSR also projects low-alcohol (as opposed to zero) products to decline slightly while no-alcohol grows ([BeverageDaily](https://beveragedaily.com/Article/2025/01/29/global-low-and-no-alcohol-market-data-for-2025)). The app's job is therefore recipe-level moderation: build real recipes around NA spirits such as Lyre's and Seedlip, then add reverse and low-proof builds, split-base and half-measure swaps, and a persistent "NA only" preference. Even subscription boxes have moved: since December 2025, every Shaker & Spoon box includes zero-proof versions ([Shaker & Spoon](https://shakerandspoon.com/pages/zero-proof)). The same substitution engine that powers "one bottle away" can power NA swaps.

### Use AI for search, input and optimization, not authoritative invention

AI helps most with the parts that are constrained optimization: matching a home bar to recipes and finding the single bottle that unlocks the most drinks ([AI Central](https://substack.aicentral.blog/p/shaken-not-hallucinated)). Bottle recognition is a useful input method, but the best accuracy claimed is a vendor-reported, secondhand **figure of about 90%**, so every detection needs user confirmation. Open-ended generation fails in public. The LLM-driven Breakreal R1 machine ($1,099–$1,299) "produced unidentifiable drinks" at CES 2026 (single source, [AI Central](https://substack.aicentral.blog/p/shaken-not-hallucinated)). In a month-long human-versus-AI contest at a Houston bar, the AI recipes "required refining to get to a drinkable state" and skewed sugary ([VinePair](https://vinepair.com/articles/ai-in-bars/)). The right pattern is:

- natural-language search over the curated database ("something bitter and stirred with what I have")
- vision as a confirm-first input
- generation only inside structured scaffolds, such as the *Cocktail Codex* six root families (Old-Fashioned, Martini, Daiquiri, Sidecar, Highball, Flip) ([Penguin Random House](https://www.penguinrandomhouse.com/books/555336/cocktail-codex-by-alex-day-nick-fauchald-and-david-kaplan/9781607749707))
- programmatic checks of ABV and balance
- an "AI-generated, untested" label
- refusals for "strongest possible" drinks and drinking games

Flavor-compound pairing works for "try X with Y" inspiration, not for predicting quality. The underlying study found that Western cuisines favor shared-compound pairings while East Asian cuisines avoid them ([Ahn et al. 2011](https://arxiv.org/pdf/1111.6074)).

### Copy the pattern from devices, not the hardware

Connected bars split into pod machines (Bartesian, whose app mostly sells pods), open dispensers driven by an inventory-aware app (Barsys 360, which pours in under 30 seconds and whose app works without the machine), and scale-guided pouring (Brookstone Perfect Drink, which prompts each pour by weight) ([Tom's Guide](https://www.tomsguide.com/home/kitchen-dining/bartesian-premium-cocktail-maker-review); [Barsys](https://barsys.com/blog/the-cocktail-app-that-knows-your-bar-better-than-you-do); [iLounge](https://www.ilounge.com/index.php/reviews/entry/brookstone-perfect-drink-app-controlled-smart-bartending)). These devices use proprietary Bluetooth apps with no public APIs, and Web Bluetooth is effectively Chromium-only, so integration isn't worth pursuing. The transferable idea is a guided "pour now" flow driven by the user's inventory.

### The web can now match native for the in-bar flow

The **Screen Wake Lock API has been Baseline since March 2025**, including Safari, so a "bar mode" that keeps the screen on now works everywhere over HTTPS ([MDN](https://developer.mozilla.org/en-US/docs/Web/API/WakeLock)). Combine it with service-worker offline caching of recipes and the user's bar (basements and bars often have poor signal), installability, the Web Share API, and schema.org/Recipe markup for search, and a PWA covers what users actually do at the counter. Voice "next/back/repeat" through the Web Speech API should be treated as an enhancement, because support is uneven and was not verified here.

## Accessibility and responsible drinking belong in the core design

Accessibility research on recipes carries over directly. An ASSETS 2024 study of blind and low-vision cooks found that they struggle with visual-only cues and with using devices with wet hands (one wrapped a laptop in plastic wrap). The authors recommend one action per step, non-visual sensory descriptors, an ingredient summary ordered by use, and hands-free voice ([Li et al., ASSETS '24](https://ar5iv.labs.arxiv.org/html/2407.19065)). Applied to cocktails:

- write sensory cues: "shake until the tin is frosty-cold to touch, about 12–15 seconds"
- show measures in oz and ml (and cl and bar spoons)
- never encode spirit, ABV tier or NA status by color alone
- build a step mode with large, user-scalable type, a low-glare dark theme, tap-anywhere advance, and `aria-live` "Step 3 of 6" announcements, as WCAG 2.2-oriented recipe sites do ([Umami Post](https://the-umami-post.pages.dev/accessibility/))

The bar-mode font fixes the mis-pour complaint reported against Cocktail Party, so readability serves every user, not only disabled users. Internationalization matters too: naming differs between regions (simple syrup versus sugar syrup), and so do units.

Responsible-drinking design builds on the same strength math as the ABV filter. Show the finished-drink ABV after dilution and the number of **standard drinks in the user's own locale**. Definitions differ by country: a US standard drink is 14 g of alcohol ([Drinkaware](https://www.drinkaware.co.uk/how-many-units-are-in-your-drink)). The research notes conflicted on the UK and Australian gram values, so take those from the government pages before shipping. The batch calculator should show standard drinks per serving and per guest and nudge hosts toward water and NA options. Optional private tracking, modeled on MyDrinkaware's units, calories and goals, fits the "drink better, not more" positioning, as long as nothing gamifies volume ([MyDrinkaware](https://apps.apple.com/gb/app/mydrinkaware-alcohol-tracker/id901389586)). Add pregnancy, medication and driving notes, plus links to help resources. No published study shows whether such labels change behavior in recipe apps. Their main value is trust and lower regulatory risk.

## The roadmap: engine first, trust second, AI last

The prioritization below follows the evidence. Build first what users praise and pay for, then fix what they complain about, then add what is new but unproven.

| Tier | Features | Why |
|---|---|---|
| **MVP** | Curated seed library (IBA 102 + Bar Assistant data, rewritten text, own or licensed photos) with attribution; hierarchy-aware My Bar (category > type > brand) with fast typeahead entry; "make now", "one away" and free "what to buy next" ranked by drinks unlocked; global substitutions plus per-recipe exact-match flag; faceted search (ingredient include/exclude, base spirit, computed ABV, method, glass, family, flavor tags); oz/ml/cl toggle stored as canonical ml; bar mode (wake lock, large type, one step per screen); first-class zero-proof mode and NA recipes; custom recipes that are searchable and match against inventory; favorites, ratings, notes; account sync; offline PWA; schema.org/Recipe; locale-aware age gate, responsible-drinking footer, finished ABV + standard drinks; WCAG 2.2 AA | These replicate the best *paid* features of Difford's, MMaC and Mixel for free on the web, and they fix the most-cited complaints (second-class custom recipes, readability, no web version) |
| **v1** | Recipe variations linked to a canonical spec with side-by-side diff and personal spec versions; batch/punch calculator with dilution, final ABV, freezer warning, perishables note and per-guest standard drinks; party menu builder with printable guest menu and combined shopping list; Instacart "buy missing mixers"; homemade sub-recipes (syrups) that count toward inventory; URL/JSON import with ingredient matching and manual override; full export (JSON, Markdown, print); QR/Web Share recipe cards; cost per drink from bottle prices; multiple bars and shared household bars; natural-language search over the curated database; Codex-family tagging and "you like Daiquiris, try these" recommendations | These serve enthusiasts and hosts, the users most hurt today, and they match what the Notion and Bar Assistant workarounds rebuild |
| **Later** | Confirm-first photo or barcode bottle scanning; constrained "build your own" invention (root family + ratio slots + balance meter) with optional, labeled AI generation; community submissions with a Kindred-style curation queue; pairing inspiration; optional private moderation tracker; voice step control; barware and NA affiliate shop; BLE scale guidance as Chromium-only enhancement; collaborative "bars like yours" buy-next signals | Valuable but unproven or risky: AI accuracy is vendor-reported, user-generated content needs moderation, and commerce brings compliance work |

The clearest differentiators are these. **Trust as a feature**: tested specs, visible attribution, canonical-versus-variation lineage, and an honest label on anything AI touched. **Free, best-in-class inventory intelligence on the web**, which competitors charge for. **Custom recipes and data portability on equal footing** with the house library. **Zero-proof parity** built on the same substitution engine. **A bar mode** designed for dim light and wet hands. **Pricing users can understand**, without a tangle of SKUs.

## Conclusion

Features are not the gap in this category. Most of them exist somewhere already. What's missing is one maintained product that combines them, put together around trust rather than catalog size. Every competitor makes a trade-off: depth with dated UX, beauty with abandonment, or AI novelty without credibility. That makes reliability and longevity a feature in themselves for a new entrant. A visibly active developer, recipes that never vanish, and a web app that won't break with the next iOS release all address real, cited pain. The AI wave changes the order of work rather than the destination. Bottle scanning and chat are now cheap to copy, so they don't differentiate. The deterministic parts are hard to copy and they compound: a clean ingredient taxonomy, a substitution graph, dilution-aware strength math, and well-attributed specs. Get that data layer right, and buy-next, zero-proof swaps, batching, responsible-drinking labels and constrained AI generation all become thin features on top of it. The biggest open questions are the dilution model, standard-drink values by country, and alcohol-advertising rules beyond the UK and France. Resolve them with primary sources before launch.
