# Data Sources, APIs and Legal/Licensing for a Cocktail Recipe Web App (as of Oct 2026)

Not legal advice. Facts summarized from cited sources; gaps noted explicitly.

## 1. TheCocktailDB API: coverage, pricing, license, data quality

### Takeaway
TheCocktailDB is the default free cocktail API: a crowd-sourced database with a free test key ("1") for development only, and a cheap one-off premium/Patreon key that is *required* for any public release. It publishes no formal data license, and its data has known messiness (free-text measures in many units, flat 15-slot ingredient fields), so plan on normalizing it.

### Cited Findings
- Basic tier is "free indefinitely"; the test key "1" is for development/education; apps "must sign up to Premium API ... if releasing publicly on an appstore." — [TheCocktailDB API page](https://www.thecocktaildb.com/api.php)
- Premium is "a small one-off fee" (the page links a ~$10 payment); one aggregator lists it as a £10 lifetime upgrade via Patreon support. — [TheCocktailDB API page](https://www.thecocktaildb.com/api.php); [apis.io plans summary](https://apis.io/plans/thecocktaildb/thecocktaildb-plans-pricing/)
- Free tier: search by name/ingredient/ID, filter by category/glass/alcoholic, single random drink, results capped at 100. Premium adds multi-ingredient filtering, popular/recent lists, full database listing (no 100 cap), 10 random drinks, and the latest image methods. — [TheCocktailDB API page](https://www.thecocktaildb.com/api.php)
- Images come in small/medium/large sizes for drinks and small/medium/full for ingredients. The API page states no explicit license or image-reuse terms; contact is by email. — [TheCocktailDB API page](https://www.thecocktaildb.com/api.php)
- Aggregators describe commercial use as allowed with a production key from Patreon support, not through a formal license agreement. This is secondary-source wording, not a TOS. — [apis.io](https://apis.io/plans/thecocktaildb/thecocktaildb-plans-pricing/); [API Evangelist profile](https://providers.apievangelist.com/providers/thecocktaildb/)
- Known data-quality issues include too many inconsistent units (oz, ml, tbsp, tsp, etc.) and fractions written in inconsistent ways in the measure fields. — [Cocktail Recipe Analysis part 2 (GitHub Pages)](https://agdal1125.github.io/my-projects/Cocktail_Analysis_2)
- Ingredients and measures are separate numbered fields that you have to loop over to parse (strIngredient1..N / strMeasure1..N). — [Educative course on TheMealDB/TheCocktailDB](https://www.educative.io/courses/recipes-themealdb-thecocktaildb-api-python/lookup-cocktails-or-ingredients-using-ids)

### Inferences
- With no explicit license, it is risky to bulk-copy TheCocktailDB data (and especially its photos) into your own database. Treat it as a live API under its terms, or email the operator for written permission before caching or redistributing.
- Expect to build a unit-normalization layer (to ml/oz) and an ingredient-canonicalization layer if you use it for "what can I make" features.

### Gaps
- No full TOS or license text was found on the site. Exact drink and ingredient counts were not stated on the API page. Whether the photos are owned by TheCocktailDB or user-submitted (and on what terms) is unknown.

## 2. Other datasets and APIs

### Takeaway
The cleanest open option is Bar Assistant's data repo (MIT-licensed JSON recipes with per-image credits). Wikidata is CC0. The IBA list (102 drinks) is a canonical seed list. Open Food Facts covers products/barcodes but carries ODbL share-alike obligations. API Ninjas needs a paid plan for commercial use. I found no public APIs from Difford's Guide or Liquor.com.

### Cited Findings
**Bar Assistant (karlomikus)**
- The Bar Assistant server is MIT-licensed open source for managing a home bar and cocktail recipes. — [ecosyste.ms listing](https://awesome.ecosyste.ms/projects/github.com%2Fkarlomikus%2Fbar-assistant)
- The separate data repo `bar-assistant/data` is MIT-licensed and stores recipes as JSON in per-recipe folders, with WebP images. Its rule: "All images must have copyright information, preferably author of the image" (e.g. "Punch | John Doe", "Imbibe magazine"). — [GitHub bar-assistant/data](https://github.com/bar-assistant/data)
- Reported scale: 500+ cocktail recipes and 250+ base ingredients (an older figure says 300+). — [ecosyste.ms](https://awesome.ecosyste.ms/projects/github.com%2Fkarlomikus%2Fbar-assistant); [linuxlinks](https://www.linuxlinks.com/bar-assistant-manage-home-bar)

**IBA official cocktails**
- 102 official cocktails as of the November 2024 revision, split evenly into Unforgettables, Contemporary Classics and New Era (34 each). That revision added 15 drinks and removed 4. Earlier revisions: 1961 (first list, 50 drinks), 1987, 1993, 2004, 2011, 2020, 2024. — [Wikipedia: List of IBA official cocktails](https://en.wikipedia.org/wiki/List_of_IBA_official_cocktails)

**Open Food Facts (bottles/barcodes)**
- The database is under the ODbL. Product images are CC BY-SA. Any derivative or mixed database must be shared under ODbL share-alike, and OFF recommends contributing changes back. — [OFF "License: be on the legal side"](https://openfoodfacts.github.io/openfoodfacts-server/api/tutorials/license-be-on-the-legal-side); [OFF wiki ODbL](https://wiki.openfoodfacts.org/ODBL_License)

**Wikidata**
- Wikidata structured data is released under CC0 (public domain dedication). — [Wikidata:Licensing](https://www.wikidata.org/wiki/Wikidata:Licensing)

**API Ninjas**
- Plans: Free $0 (3K calls/month, 100 calls/hour, attribution required, "evaluation and demo purposes only", no commercial use); Developer $39/mo; Business $99/mo (1M calls, caching allowed from this tier up); Professional $199/mo (10M calls), billed yearly; Enterprise custom. — [API Ninjas pricing](https://api-ninjas.com/pricing)
- The pricing page does not mention the cocktail endpoint specifically. — [API Ninjas pricing](https://api-ninjas.com/pricing)

**Other**
- Paid cocktail APIs and scrapers exist on marketplaces such as Zyla Labs and Apify, including Apify actors that scrape TheCocktailDB. — [Zyla cocktail tag](https://zylalabs.com/api-marketplace/tag/cocktail); [Apify TheCocktailDB scraper](https://apify.com/parseforge/thecocktaildb-drinks-scraper.md)

### Inferences
- Practical stack: seed from the IBA list plus Bar Assistant data (MIT; keep image credits) plus Wikidata (CC0) for ingredient metadata. Add your own canonical ingredient taxonomy on top.
- If you use Open Food Facts, keep it as a separate product table: merging it into your main DB may make the combined database a "derivative database" that must be shared under ODbL. A "collective database" arrangement is the usual mitigation, but confirm it.
- The MIT license covers the code and repo contents, but images credited to third parties (e.g. "Imbibe magazine") may not actually be the contributor's to license. Treat Bar Assistant images as carrying third-party rights and use only the text/data, or check each image.

### Gaps
- No public API found for Difford's Guide or Liquor.com (Dotdash Meredith); I assume none exist, but this was not confirmed.
- Not researched in this pass: UPC lookup services (UPCitemdb, Barcode Lookup, etc.) and their pricing, Kaggle cocktail dataset licenses, and spirits price-data sources. Kaggle datasets are often scrapes of TheCocktailDB, so their stated licenses may not be valid; check where each dataset came from.

## 3. Copyright of recipes (US/EU), descriptions, photos, attribution norms

### Takeaway
In the US, ingredient lists and plain method steps are not copyrightable. Literary descriptions, photos and curated compilations can be. The EU's top court has held that taste is not a copyrightable "work". Bartender-created drinks are protected mainly by community norms of attribution, not law.

### Cited Findings
- US Copyright Office Circular 33: "A mere listing of ingredients or contents, or a simple set of directions, is uncopyrightable", so the Office cannot register recipes consisting of ingredients plus a process. Protection "may extend to substantial literary expression — a description, explanation, or illustration — that accompanies a recipe... or to a combination of recipes, as in a cookbook." — [USCO Circular 33 (PDF)](https://www.copyright.gov/circs/circ33.pdf)
- NYC Bar report "Secret Ingredients: How to Protect Recipes" covers copyright limits and alternatives (trade secret, trademark). — [NYC Bar report (PDF)](https://www.nycbar.org/wp-content/uploads/2023/05/20221024-SecretIngredientsHowtoProtectRecipes_FINAL_22.6.6.pdf)
- Series on recipe copyright: ingredient lists are facts, and functional instructions are excluded. — [National Law Review](https://natlawreview.com/article/mixing-things-let-s-talk-recipes-part-one-four-part-series-copyright)
- EU: in *Levola Hengelo v Smilde Foods* (C-310/17, 13 Nov 2018) the CJEU held that the taste of a food product is not a "work" under copyright because it cannot be identified precisely and objectively. — [Mondaq summary](https://mondaq.com/unitedstates/food-and-drugs-law/768018/taste-cannot-be-copyrighted-in-european-union); [European Sources case page](https://europeansources.info/?p=516145)
- German commentary: recipes are rarely protected in Germany unless the text shows individual creativity; collections may be protected. — [Mondaq Germany](https://www.mondaq.com/germany/copyright/568572/your-ip-valentine-can-recipes-be-protected-by-copyright)
- Canada (Pyrrha/Tomaydo): a recipe book was found not to be an original compilation. — [Mondaq Canada](https://www.mondaq.com/canada/copyright/439012/you-say-tomaydo-i-say-no-copyright-infringement-recipe-book-not-an-original-compilation)
- The Bar Assistant community dataset requires a credit on every image. — [GitHub bar-assistant/data](https://github.com/bar-assistant/data)

### Inferences
- Safe pattern: store ingredients, specs and short neutral method steps written in your own words. Do not copy headnotes or descriptions, and never reuse photos without a license. Credit the creator and venue for modern drinks (e.g. "Paper Plane: Sam Ross, 2008"). Credit is the cocktail community's norm even though the law doesn't require it.
- The EU Database Directive (sui generis database right) may protect a substantial extraction from a curated database such as Difford's, even when individual recipes are not protected. Avoid bulk scraping. (Not directly sourced here; see Gaps.)
- Trademarked drink names (e.g. Dark 'n' Stormy, Gosling's; Painkiller, Pusser's) are a separate trademark risk worth checking.

### Gaps
- *Publications International v. Meredith* (7th Cir. 1996) is the key US case but was not retrieved in searches. The EU sui generis database right and trademarked cocktail names were not confirmed with sources in this pass.

## 4. Legal/compliance for alcohol apps (age gates, ad rules, GDPR, responsible drinking)

### Takeaway
A recipe web app is mainly content, not alcohol advertising. Rules tighten once you add brand placements, affiliate links or sponsored content. France (Loi Evin) and the UK (CAP Code s.18) are the strictest well-documented regimes. An age gate is a soft best practice, and under UK rules it is not enough on its own.

### Cited Findings
- France: the 2009 HPST law opened online services to alcohol advertising, except sites aimed at young people and sites of sports organizations. Online ads must not be intrusive or interstitial, must carry the health warning, and are limited to objective product information (strength, origin, composition, production method, appellations). Lifestyle associations (pleasure, success, sport, sex) are banned. — [EUCAM France](https://eucam.info/regulations-on-alcohol-marketing/france/)
- Mandatory French health message: "L'abus d'alcool est dangereux pour la santé, à consommer avec modération." — [EUCAM France](https://eucam.info/regulations-on-alcohol-marketing/france/); [nmcg.fr](https://www.nmcg.fr/en/?p=1977)
- Addictions France won a lawsuit against Meta over alcohol ads (2023), showing active enforcement. — [EUCAM/Movendi Feb 2023](https://eucam.info/2023/02/27/addictions-france-wins-lawsuit-against-meta-over-alcohol-ads/)
- UK CAP Code rule 18.15: alcohol marketing must not be directed at under-18s through media choice or context, and no medium may carry alcohol ads if more than 25% of its audience is under 18. — [CAP Code Alcohol (ASA PDF)](https://www.asa.org.uk/static/7d4fcecd-f98d-4009-afbde3145893ba4e/169a0e28-1bd7-497d-b7ece9cc52a2cba5/The-CAP-Code-Alcohol.pdf); [ASA: Alcohol and the young](https://www.asa.org.uk/advice-online/alcohol-the-young.html)
- Advertisers cannot rely on publisher assurances alone and must use available targeting tools to exclude minors. The ASA updated its age-restricted ads online guidance in Sept 2025. — [ASA age-restricted ads online guidance 0925 (PDF)](https://www.asa.org.uk/static/cb81888b-1fc6-4de2-90a52aad57872f2b/Age-restricted-ads-online-guidance-0925.pdf); [Lewis Silkin, Mar 2026](https://www.lewissilkin.com/en/insights/2026/03/25/digital-commerce-creative-101-key-issues-when-targeting-ads-for-age-restricted-products-age-gating)
- In an ASA case, Bacardi's age gate with a responsible-drinking message, plus a platform audience 87.61% over 18, supported compliance. Age gates are treated as extra screening, not the whole solution. — [ASA ruling Bacardi-Martini](https://www.asa.org.uk/rulings/bacardi-martini-ltd-a11-175086.html)

### Inferences
- Minimum practical package: a neutral age gate showing the visitor's local legal drinking age (18 in most of the EU/UK, 21 in the US), no youth-oriented design or mascots, a responsible-drinking footer, a no/low-alcohol section, and no ads on any surface likely to reach minors. For French users, any brand or affiliate content should be factual only and carry the health message.
- GDPR: an age gate that stores a birthdate is processing personal data. A simple "I am of legal drinking age" boolean kept in local storage is lower risk. Affiliate and analytics cookies need consent under ePrivacy/GDPR.

### Gaps
- No sources were retrieved for: a per-country legal drinking age table, US TTB/FTC rules for affiliate disclosure on alcohol content, the EU AVMSD, Ireland's Public Health (Alcohol) Act labelling (May 2026) and online ad restrictions, Nordic bans, or GDPR guidance specific to age gates. All need follow-up.

## 5. Affiliate/commerce integrations after Drizly

### Takeaway
Uber shut down Drizly in March 2024 and folded alcohol delivery into Uber Eats. For affiliate revenue, the realistic US options are ReserveBar (about 4%, 30-day cookie) and Total Wine (about 4%, very short cookie). Instacart has a strong shoppable-recipe API, but alcohol is typically excluded from its commissions. Amazon Associates excludes ads by US alcohol licensees, and in practice its affiliate value lies in barware.

### Cited Findings
- Uber closed the standalone Drizly app and site at the end of March 2024, about three years after buying it for ~$1.1B. Alcohol ordering moved into Uber Eats, whose liquor category had more than doubled in the prior year. — [Modern Retail](https://www.modernretail.co/operations/why-uber-decided-to-sunset-drizly/); [Fox Business](https://www-ak-ms.foxbusiness.com/technology/uber-close-drizly-march)
- ReserveBar (which acquired Minibar Delivery in 2021) positioned itself to fill the gap with same-day delivery plus shipping, recipes and a membership program. — [InsideHook alternatives](https://www.insidehook.com/spirits/drizly-alcohol-delivery-alternatives)
- ReserveBar affiliate: 4% of sales, 30-day cookie (aggregator data). It also runs brand partnerships. — [Affilimate](https://affilimate.com/programs/reservebar-affiliate-program/); [FlexOffers](https://www.flexoffers.com/affiliate-programs/reservebar-affiliate-program/); [ReserveBar partner page](https://reservebar.com/partner-with-us)
- Total Wine affiliate: about 4% commission (some sources say up to 6%), 1-day cookie. Sources conflict slightly. — [Affilimate](https://affilimate.io/programs/total-wine-affiliate-program/); [Creator Hero review](https://www.creator-hero.com/blog/total-wine-affiliate-program-in-depth-review-pros-and-cons)
- Instacart Developer Platform: shoppable recipes and meal planning across 85,000+ retailers, a Recipe/"shoppable recipe" API, and Impact.com affiliate integration. The "Tastemakers" affiliate network pays about 3%. — [Instacart Developer Platform](https://company.instacart.com/business/developers); [Instacart IR press release](https://investors.instacart.com/news-releases/news-release-details/instacart-power-next-generation-interactive-food-experiences); [docs](https://docs.instacart.com/developer_platform_api/)
- Alcohol is typically excluded from Instacart affiliate commissions (secondary source). — [Jupiter blog](https://www.jupiter.co/blog/instacart-affiliate-for-food-creators)
- Amazon Associates policy excludes "any alcoholic beverage advertised on your Site if you are a United States business holding a license to manufacture, wholesale, or distribute any alcoholic beverages." — [ConductAtlas excerpt of Amazon policy](https://conductatlas.com/platform/amazon-associates/amazon-associates-program-policies/provision/CA-P-064531/alcoholic-beverage-advertising-restriction-for-us-licensees/); [Amazon Associates Program Policies](https://affiliate-program.amazon.com/help/operating/exclusions)
- Adjacent programs: Bartesian ($15 per machine, 30-day cookie) and Shaker & Spoon ($15 + 5%, plus recurring), both via Impact. — [Bartesian affiliate](https://bartesian.com/pages/bartesian-affiliate); [LinkClicky Shaker & Spoon](https://linkclicky.com/affiliate-program/shaker-spoon)

### Inferences
- Alcohol affiliate margins are thin (3-4%, short cookies). Barware, kits, mixers and no/low-alcohol products are often the better monetization, and they avoid alcohol-ad rules.
- Instacart's API is worth using for "buy missing ingredients" features (mixers, citrus, garnishes) even if spirits earn no commission.
- Affiliate links to alcohol retailers make the content commercial communication, which triggers Loi Evin and CAP s.18 considerations. Consider geo-restricting alcohol commerce to the US.

### Gaps
- Not verified: current Uber Eats affiliate or partner terms for alcohol, a ReserveBar first-party program page with 2026 terms, Wine.com/Caskers/Flaviar programs, and Instacart's official statement on whether alcohol is commissionable (only a secondary source found).
