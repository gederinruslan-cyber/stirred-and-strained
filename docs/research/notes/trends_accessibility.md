# Emerging Trends, Accessibility & Responsible-Drinking Design for a Modern Cocktail Web App (as of Oct 2026)

Research note: ~15 tool calls. Several market figures come from trade-press summaries of IWSR/Gallup/NielsenIQ rather than the primary (paywalled) reports; reliability flags are given inline.

## Market trends: home bartending, low/no-ABV, RTD, Gen Z decline

### Takeaway
Overall alcohol volumes are shrinking (IWSR: -2% globally in 2025, the third year of decline in a row), and US drinking is at a record low (Gallup: 54% of adults drink). Meanwhile no-alcohol "analogues" keep growing at high single to double digits. A new cocktail app should treat zero-proof and low-ABV drinks as full citizens, not a side filter.

### Cited Findings
- IWSR: global beverage-alcohol volumes fell 2% in 2025, the third straight year of contraction. — [BeverageDaily / IWSR summaries via search](https://www.beveragedaily.com/Article/2025/03/20/the-biggest-opportunities-for-alcohol-free-and-low-alcohol-drinks/); [Vinetur](https://www.vinetur.com/hi/global-alcohol-sales-fell-as-consumers-cut-back.html)
- IWSR: no-alcohol "spirits" volume rose 13% globally in 2024. The segment was forecast to grow 10% in 2025 and 9% in 2026, with US no-alcohol spirits volume forecast at an 18% CAGR for 2024–2028. — [The Spirits Business, "World Spirits Report 2025: Low & no", 29 Dec 2025](https://www.thespiritsbusiness.com/?p=904305)
- IWSR: no-alcohol volumes are expected to grow 36% from 2024 to 2029, while low-alcohol (as opposed to zero) volumes were projected to *decline* about 2% in 2025. Growth is concentrated in zero-proof, not "lighter" drinks. No-alcohol analogues (beer, wine, RTD, spirits) grew about 9% in 2025. — [IWSR summaries via BeverageDaily](https://beveragedaily.com/Article/2025/01/29/global-low-and-no-alcohol-market-data-for-2025); [drinks intel](https://drinks-intel.com/intel/no-low-alcohol-reaches-almost-10bn/) (figures came from search summaries; I did not see the primary IWSR release)
- NielsenIQ (as reported): US non-alcohol sales reached about $1B in 2025 (+22%), and NA spirits off-premise sales rose 62%. — search-result summary attributed to [The Spirits Business](https://www.thespiritsbusiness.com/?p=904305). **Unverified**: the fetched article did not contain these numbers, so treat as low confidence.
- Lyre's was the top non-alcoholic spirit brand by bar stocking. Over two-thirds of polled bars stocked NA spirits. — [Drinks International Brands Report 2024: Non-alcoholic spirits](https://drinksint.com/news/fullstory.php/aid/11003/.html). Lyre's raised a $179M (AUD) round. — [Food & Drink Business](https://www.foodanddrinkbusiness.com.au/news/cheers-179m-funding-milestone-for-lyre-s)
- Seedlip (launched 2015, majority-owned by Diageo since 2019) has three core expressions: Garden 108, Grove 42 and Spice 94. — [Fortune, Aug 2019](https://fortune.com/2019/08/08/diageo-seedlip); [Drinks International](https://drinksint.com/news/fullstory.php/aid/11003/.html)
- Gallup, July 2025: 54% of US adults drink, down from 64% in 2019 (a record low). Only 50% of 18–34s drink. Average weekly drinks hit a low of 2.8. Younger adults are more likely to believe moderate drinking is unhealthy. — [Fortune, 13 Aug 2025](https://fortune.com/2025/08/13/gen-z-drinking-alcohol-attitudes-gallup-survey); [Entrepreneur](https://www.entrepreneur.com/business-news/us-drinking-rate-hits-historic-low-report/497082)
- NCSolutions 2025: 65% of Gen Z plan to drink less, and 39% say they will adopt an alcohol-free lifestyle. — [Washington Times, 4 Aug 2025](https://m.washingtontimes.com/news/2025/aug/4/generation-z-turns-away-alcohol-wellness-mental-health-reshape-social/)
- Contrarian view: a beer-industry blogger argues that reading Gallup's drop as a structural shift may be premature. — [Beervana, 19 Aug 2025](https://www.beervanablog.com/beervana/2025/8/19/gallup-may-be-premature)
- RTDs: IWSR projects US spirits-based RTD cocktails to grow at about a 6% CAGR through 2028. — [BevNET](https://www.bevnet.com/category/news/spirits/page/20/)
- Alcohol-adjacent/functional drinks were forecast to grow about 11% in volume in 2025, from a small base. — IWSR via search summary ([BeverageDaily](https://www.beveragedaily.com/Article/2025/03/20/the-biggest-opportunities-for-alcohol-free-and-low-alcohol-drinks/))

### Inferences
- Zero-proof should be a first-class mode ("show me only NA" as a persistent preference) with real recipes built around NA spirits (Lyre's, Seedlip, etc.), not just "omit the rum".
- "ABV-aware swaps" (spirit to NA analogue, or a split-base/half-measure version) fit the data, since moderation, not abstinence, is the mainstream behavior. Because low-ABV *products* are declining, the app's value is in *recipe-level* ABV reduction (reverse/low-proof builds such as vermouth- or sherry-based drinks, spritzes).
- RTD growth suggests casual drinkers prefer convenience. The app should keep "easy" builds (3 ingredients or fewer, highballs) prominent and fast.
- Positioning a cocktail app around "drink better, not more" matches the cohort trend and lowers responsible-marketing risk.

### Gaps
- I found no reliable post-2020 quantitative data on *home* bartending growth (e.g., barware or home-bar spend). Search did not surface IWSR/Nielsen home-mixing data.
- I could not verify the NielsenIQ "$1B, +22%" figure in a primary source.
- I found no app-usage data (downloads, MAU) for cocktail apps.

## AI in cocktail apps

### Takeaway
2025–26 brought a flood of "photo your shelf, see what you can make" AI apps. The parts that work are inventory, combinatorics and purchase optimization ("which one bottle unlocks the most drinks"). Open-ended LLM recipe invention still produces unbalanced or sugary drinks and needs human or template constraints. A CES 2026 LLM-driven machine was a public failure.

### Cited Findings
- New AI apps with shelf or bottle recognition: Topa! (one photo, multiple bottles, then "cocktails you can make now"), OpenBar (camera identifies spirits, liqueurs and mixers), Cocktail.IQ (barcode plus AI label reading), Bar Maestro, Shaker.ai, BarShelf and others. — [AlternativeTo: Topa!](https://alternativeto.net/software/topa-home-bar-and-cocktails/about/); [OpenBar App Store](https://apps.apple.com/us/app/-/id6760921002); [Cocktail.IQ](https://cocktailiq.pages.dev/); [Bar Maestro](https://apps.apple.com/us/app/id6757890867); [BarShelf](https://apps.apple.com/us/app/-/id6754469129)
- "Shaken, Not Hallucinated" (AI Central Substack, 2026) argues that matching a random home bar to recipes is constrained optimization, which AI handles well. Examples it gives:
  - Mixel: 2,600+ recipes filtered by inventory, plus a "Maximizer" that names the single bottle purchase unlocking the most new drinks.
  - My AI Bartender: about 90% bottle-ID accuracy (vendor-reported, per the article).
  - BarGPT and Bartender AI: factor in mood and occasion.

  Limitation it names: AI can't encode subjective taste thresholds ("too much rosewater turns soapy"). — [AI Central](https://substack.aicentral.blog/p/shaken-not-hallucinated)
- The same source says the Breakreal R1 countertop machine ($1,099–$1,299), which generates recipes via an LLM, "produced unidentifiable drinks" in CES 2026 demos. Its conclusion: open-ended generation without constraints fails. — [AI Central](https://substack.aicentral.blog/p/shaken-not-hallucinated) (single source)
- Bartenders on ChatGPT recipes:
  - A Houston beer garden ran a month-long human vs. AI cocktail contest. AI recipes "required refining to get to a drinkable state" and tended to be sugary and uncreative.
  - Erick Castro hosted a segment fixing "slipshod" ChatGPT cocktails.
  - Some bartenders see AI as an ideation aid for new ratios.

  — [VinePair, "AI in bars"](https://vinepair.com/articles/ai-in-bars/)
- BarGPT generates custom recipes from preferred ingredients and taste preferences. — [Product Hunt](https://www.producthunt.com/products/bargpt-ai-powered-bartender)
- Flavor-compound pairing science: Ahn, Ahnert, Bagrow and Barabási, "Flavor network and the principles of food pairing," *Scientific Reports*, Dec 2011. They analyzed 56,498 recipes, 381 ingredients and 1,021 flavor compounds. Western cuisines favor pairs that share compounds; East Asian cuisines avoid them. So shared-compound pairing is a culture-dependent heuristic, not a universal law. — [arXiv 1111.6074](https://arxiv.org/pdf/1111.6074); [ScienceDaily](https://www.sciencedaily.com/releases/2011/12/111215141625.htm)

### Inferences
- What works: inventory-aware "make now / one bottle away" lists, shopping optimization, natural-language search over a *curated, verified* recipe DB, and vision as a fast input method (always confirm detected bottles, since accuracy is about 90% at best).
- What's gimmicky or risky: free-form LLM-invented recipes shown as authoritative. Mitigations:
  - Generate only within templates (Codex families and balance ratios, see below).
  - Validate ABV, dilution and sweet/sour balance programmatically.
  - Label "AI-generated, untested".
  - Never let the LLM invent ingredient safety claims (e.g., raw egg, allergens, toxic botanicals) or quantities outside sane ranges.
- Compound-pairing data is useful as a "try pairing X with Y" inspiration feature, not as a predictor of quality (the Ahn result is cuisine-dependent).
- Responsible-drinking guardrail for AI: block requests for "strongest possible" drinks or drinking games, and cap per-drink standard-drink counts.

### Gaps
- I found no independent accuracy benchmarks for bottle-recognition apps. The 90% figure is vendor-reported, passed on secondhand.
- I found no peer-reviewed study of LLM cocktail recipe quality or hallucination rates.

## Smart devices and app integration

### Takeaway
The connected-bar market splits into pod machines (Bartesian, closed ecosystem, app used mainly for pod commerce), open-reservoir dispensers (Barsys 360, app-driven, inventory-based) and scale-guided pouring (Brookstone Perfect Drink). For a web app, integration is mostly impractical (proprietary BLE apps). The transferable pattern is "app knows your inventory and guides pour-by-pour".

### Cited Findings
- Barsys 360: an "AI-powered, app-enabled" machine. You load spirits and mixers into refillable containers, choose or craft a drink in the app, and it pours cocktails or mocktails in under 30 seconds. The app has 1,000+ curated recipes, works without the machine, and suggests drinks based on manually logged inventory. — [Barsys 360 blog](https://barsys.com/blog/the-barsys-360-cocktail-maker-smart-stylish-made-for-you); [Barsys app blog](https://barsys.com/blog/the-cocktail-app-that-knows-your-bar-better-than-you-do); [App Store](https://apps.apple.com/app/id1279140665)
- Bartesian: a capsule ("Keurig for cocktails") machine. Its app is used to browse capsules and order them for delivery. The Premier model adds a touchscreen and connectivity. — [Tom's Guide review](https://www.tomsguide.com/home/kitchen-dining/bartesian-premium-cocktail-maker-review); [Pickr, 2025](https://pickr.com.au/news/2025/bartesian-sees-coffee-pods-grow-up-for-cocktail-making). Revenue figures ($164M FY2025, ASP $279, 35% repeat rate) appear only on a [business-template site](https://canvasbusinessmodel.com/products/bartesian-bcg-matrix). **Low reliability, do not cite as fact.**
- Brookstone Perfect Drink: a smart scale (originally plugged in via 3.5mm, later 2.0 version) plus app with 300+ alcoholic and non-alcoholic recipes. It guides the user to pour by weight with on-screen prompts. — [iLounge review](https://www.ilounge.com/index.php/reviews/entry/brookstone-perfect-drink-app-controlled-smart-bartending); [MobileSyrup, May 2023](https://mobilesyrup.com/2023/05/13/app-and-scale-combo-mix-classic-cocktails-perfect-drink/)

### Inferences
- Steal the patterns, not the hardware: inventory-driven suggestions (Barsys), step-by-step "pour now" guided flow with live progress (Perfect Drink), and NA-inclusive catalogs (all three include mocktails).
- Web Bluetooth could in theory connect to a BLE scale, but support is Chromium-only (not Safari/iOS), so it is a niche "progressive enhancement" at best. (General web-platform knowledge; not verified in this session.)

### Gaps
- I did not verify current (2026) Perfect Drink availability or connectivity (Bluetooth vs. audio jack), or other smart jiggers.
- I found no public APIs from Bartesian or Barsys.

## Modern web capabilities (PWA, wake lock, share, voice)

### Takeaway
The Screen Wake Lock API has been Baseline since March 2025 (it works across all current major browsers including Safari), so a "bar mode" that keeps the screen on is now universally feasible on the web. Combined with offline caching and installability, a PWA can match a native recipe app for the core in-kitchen flow.

### Cited Findings
- Screen Wake Lock API: "Baseline 2025, newly available" since March 2025. It prevents screens from dimming or locking, requires a secure context (HTTPS), and may not work on older devices. — [MDN WakeLock](https://developer.mozilla.org/en-US/docs/Web/API/WakeLock)
- Recipe-site cooking modes combine larger type, screen wake lock, step-by-step views, and voice or hands-free controls. — [screensdesign: cooking-mode UX](https://screensdesign.com/articles/recipe-cooking-mode-step-navigation-ux/); [Allspice Labs guided cooking](https://www.allspicelabs.com/docs-guided-cooking/); [Umami Post accessibility](https://the-umami-post.pages.dev/accessibility/)
- Academic support for hands-free voice: blind and low-vision cooks struggle with wet or messy hands (one wrapped a laptop in plastic wrap) and recommend voice and multimodal interaction. — [Li et al., ASSETS '24](https://ar5iv.labs.arxiv.org/html/2407.19065)

### Inferences
- Must-haves:
  - Wake lock in step mode, with re-acquire on `visibilitychange`.
  - Service-worker offline caching of the recipe DB and the user's bar (bars and basements often have poor signal).
  - Install prompt.
  - Web Share API for sharing recipes.
  - Recipe structured data (schema.org/Recipe) for SEO.
- Voice: Web Speech API recognition is unevenly supported. Treat "next/back/repeat" voice commands as an enhancement, and always offer big tap targets.

### Gaps
- I did not verify current support for Web Share Target, Web Speech recognition, or iOS PWA install/push in this session. Treat these as needing a check before committing.

## Flavor science and invention tools

### Takeaway
The most credible structured frameworks are the Cocktail Codex "six root cocktails" plus classic balance ratios. They are natural scaffolds for "build your own" tools and for constraining AI generation.

### Cited Findings
- *Cocktail Codex* (Day, Fauchald, Kaplan, Ten Speed Press, 2018; James Beard Award and Tales of the Cocktail Spirited Award): all cocktails descend from six roots. They are the Old-Fashioned, Martini, Daiquiri, Sidecar, Whisky Highball and Flip. Understanding a family explains when to shake or stir, what you can substitute when missing ingredients, and how to invent variations. — [Penguin Random House](https://www.penguinrandomhouse.com/books/555336/cocktail-codex-by-alex-day-nick-fauchald-and-david-kaplan/9781607749707); [Goodreads](https://www.goodreads.com/book/show/41075441)
- The flavor-compound pairing network (Ahn et al. 2011) is the main academic basis for ingredient-pairing suggestions (see AI section). — [arXiv](https://arxiv.org/pdf/1111.6074)

### Inferences
- An invention tool should go: pick a root family, then swap the base, modifier and sweetener within ratio slots. It should show computed ABV, dilution and a sweet/sour balance meter.
- Tag recipes by family so users learn transferable patterns ("you like Daiquiris, try these sours").
- The "substitute when missing" logic doubles as the engine for NA swaps and "one bottle away".

### Gaps
- I did not source specific balance ratios (e.g., 2:1:1 sour, 2:¾:¾) or published flavor wheels in this session. They are well known in bartending literature, but no citation was gathered.

## Accessibility

### Takeaway
Recipe UIs fail disabled users mainly through visual-only cues, poor step navigation and hands-busy interaction. WCAG 2.2 AA plus a dedicated large-text step mode, voice control and non-color tagging covers most needs.

### Cited Findings
- Li, Wang, Carrington and Kane, "A Recipe for Success? Exploring Strategies for Improving Non-Visual Access to Cooking Instructions," ASSETS 2024. Problems they found:
  - Visual-only cues ("until golden brown").
  - Screen readers re-reading irrelevant content.
  - Device use with wet hands.

  Their recommendations:
  - Non-visual sensory descriptors (texture, sound, smell).
  - One discrete step per ingredient or action.
  - Time ranges rather than fixed times.
  - Ingredient summary upfront, ordered by use.
  - Hands-free voice and multimodal devices (watch, speaker).
  - Conversational AI for in-context questions.
  - Adjustable detail level by expertise.

  — [arXiv 2407.19065 / ASSETS '24](https://ar5iv.labs.arxiv.org/html/2407.19065)
- Recipe sites targeting WCAG 2.2 AA use semantic headings, `aria-live` announcements for step changes, and descriptive alt text. They write "one action per step" directions for cook mode. — [Umami Post accessibility statement](https://the-umami-post.pages.dev/accessibility/); [screensdesign](https://screensdesign.com/articles/recipe-cooking-mode-step-navigation-ux/)
- Perkins School for the Blind publishes guidance on accessible recipes. — [Perkins Access](https://perkinsaccess.org/accessible-recipes-chronicle/)

### Inferences
- Cocktail-specific translations of the research:
  - Describe doneness non-visually: "shake until the tin is frosty-cold to touch, about 12–15 s"; "stir about 30 s / until the glass is cold".
  - Give measures in both oz and ml (and cl, bar spoons).
  - Never encode spirit type, ABV tier or NA status by color alone. Pair color with icons or text labels and check palettes for deuteranopia and protanopia.
- Step mode should include:
  - Very large type that respects user font scaling (no fixed px).
  - High contrast (bars are dim; consider a dark low-glare theme).
  - Tap targets of at least 24×24 CSS px (WCAG 2.2 SC 2.5.8 minimum; larger is better).
  - Swipe/tap anywhere to advance.
  - An `aria-live` "Step 3 of 6" announcement.
- i18n: unit toggling (US oz / metric), locale decimal formats, and ingredient naming differences (e.g., "simple syrup" vs "sugar syrup", "cilantro/coriander"). Standard-drink definitions also differ by country (see below).

### Gaps
- I found no accessibility audit specific to existing cocktail apps.
- I did not fetch the WCAG 2.2 spec text directly. The SC references come from general knowledge, so verify before citing.

## Responsible drinking and age gating

### Takeaway
Established practice is: show strength transparently (ABV and standard drinks, using locale-specific definitions), offer self-tracking and moderation tools (Drinkaware model), age-affirm with full date of birth on brand-type sites (DISCUS), and avoid content that promotes excess or appeals to minors.

### Cited Findings
- Standard-drink definitions differ by country. US (NIAAA): 14 g pure alcohol (12 oz beer / 5 oz wine / 1.5 oz 40% spirits). Other countries use different gram definitions. — [Drinkaware "How many units are in your drink"](https://www.drinkaware.co.uk/how-many-units-are-in-your-drink); [C3 Foundation](https://cthreefoundation.org/?p=1488). **Conflict:** the search summary claimed UK = 10 g and AU = 12 g. Official definitions are UK unit = 8 g and AU standard drink = 10 g. I believe the summary is wrong, and the writer should check the primary government pages before publishing numbers.
- MyDrinkaware app (UK, free): tracks drinks, calculates units and calories, compares weeks, flags binge-risk days, and sets goals to cut down. — [App Store](https://apps.apple.com/gb/app/mydrinkaware-alcohol-tracker/id901389586); [Harper's](https://harpers.co.uk/news/fullstory.php/aid/15765/Drinkaware_launches_mobile_app_to_help_people_cut_down_on_drinking.html)
- DISCUS Code of Responsible Practices (US distillers): 40+ provisions. Digital marketing should go only where at least 71.6% of the audience is reasonably expected to be of legal purchase age (21+, from 2010 Census). Brand-controlled interactive sites should require age affirmation *before full engagement*, using full date of birth (month, day, year). — [DISCUS 71.6% standard](https://www.distilledspirits.org/?p=7975); [DISCUS Code 2023 PDF](https://www.distilledspirits.org/wp-content/uploads/2023/06/DISCUS_CodeofResponsiblePractices_2023.pdf); [DISCUS Digital Guidelines](https://www.vsnews.fr/images/etudes/DISCUS_Digital_Communications_Guidelines.pdf)

### Inferences
- Per-recipe display: ABV of the finished drink (accounting for dilution) and standard drinks in the user's locale (US 14 g; let users choose UK units, AU, etc.). Flag "strong" drinks (e.g., 2 or more standard drinks) neutrally.
- Session/party features: a batch or punch calculator that shows standard drinks per serving and per guest, and a gentle "alternate with water / NA option" nudge. Optional private tracking (Drinkaware-style), with no gamification of volume (no streaks or badges for drinking more).
- Age gating:
  - An independent (non-brand) recipe app isn't bound by DISCUS, but the full-DOB age affirmation is the industry norm and app stores rate alcohol content (17+/18+).
  - A lightweight DOB gate with locale legal age (18 in most countries, 21 in the US) is cheap insurance.
  - NA-only browsing could plausibly be ungated.
- Content rules: avoid "strongest", "get wasted" and drinking-game framing (including in AI prompts and outputs). Avoid youth-appealing imagery. Include pregnancy, medication and driving safety notes, and links to help resources (e.g., Drinkaware, SAMHSA).
- Zero-proof as a first-class mode is itself a responsible-drinking feature and matches the Gen Z data.

### Gaps
- I did not research UK Portman Group or EU codes, or app-store policy text (Apple/Google alcohol rules), in this session.
- I found no published evaluation of whether hydration nudges or standard-drink labels in recipe apps change behavior.
