## Project
- Site: `commerce-lab-2026`
- Repo: `adobe-sydney-labs/commerce-lab-2026`
- Source site / source CMS: `https://venia.magento.com/` (Magento PWA Studio storefront)
- Target pattern: `EDS` (Document Authoring / DA project, `type: da`) with Adobe Commerce drop-in blocks

## Goal
- Main objective: Migrate the Venia homepage into AEM Edge Delivery Services — analyze the page, build import infrastructure, import the content, then style and enhance the resulting blocks to match (and extend beyond) the original design.

## Decisions already made
- Treat the four marketing regions as authorable static blocks; exclude the dynamic commerce chrome (header, footer, product grid) from imported content.
- Reuse the project's existing commerce `product-recommendations` drop-in for "Top Sellers" rather than importing static product tiles.
- Convert the hero into a 2-slide carousel with pager dots + auto-advance, authored as image/text pairs.
- DA is the source of truth for `index` content; re-syncing from DA (via `.aem.page` preview) overwrites local edits when requested.
- Apply an "Australian vibe" to all homepage marketing copy.

## What has already been analyzed
- Venia homepage: 5 content sections + dynamic header/footer/product grid.
- Component mapping: hero slider, 3 category promo tiles, two side-by-side promos (light + dark), Top Sellers heading + product grid.
- Design/style findings: imagery delivered as inline CSS `background-image` (not `<img>`); heading `Source Serif Pro` serif, body `Muli`; original CTA royal-blue pill; light-grey band `#f2f2f2`.
- Content model findings: PageBuilder semantic classes (`.venia-home-slider`, `.venia-home-callout`, `.venia-home-banner-a/b-*`, `.venia-home-row-2`); Lorem-ipsum placeholder copy throughout.

## Confirmed mappings / rules
- `.venia-home-slider` → `hero-banner` (carousel variant)
- `.venia-home-callout` (×3) → `cards-promo`
- `.venia-home-banner-a-content/-image` → `columns-feature`
- `.venia-home-banner-b-image/-content` → `columns-dark` (section style `dark`)
- `Top Sellers` grid → `product-recommendations` (recId `b8d51c7c-37b4-44e1-a9d7-0bc107905c15`, currentSku `VD01`)
- Image handling: extract inline `background-image` URLs into real `<img>` during parse; DA later rehosts as optimized `media_*` assets.
- Cleanup rule: strip header/footer/nav/switchers and the live product grid from imported content.

## Constraints
- Do not change: `scripts/aem.js` or unrelated blocks; do not hand-edit `content/` files directly (use import script / DA sync).
- Must preserve: block HTML structure when editing content; accessibility (ARIA roles on carousel/arrows, `prefers-reduced-motion`); CTA must stay clickable (`pointer-events: auto !important`).
- Avoid: hardcoding dynamic commerce products as static content; lint violations (`no-descending-specificity`, media-query range notation).

## Site Analysis
- Full page analysis of `https://venia.magento.com/` completed — artifacts in `migration-work/`: `metadata.json`, `screenshot.png`, `cleaned.html`, `images/` (17), `page-structure.json`, `authoring-analysis.json`.
- Structure: 5 authorable sections (hero, category promos, heels promo, vacations promo, Top Sellers heading) plus non-authorable commerce regions.
- Components: 4 new block variants created (`hero-banner`, `cards-promo`, `columns-feature`, `columns-dark`) + reused commerce `product-recommendations`.
- Content: placeholder body copy, 17 catalog images, page title/description metadata captured.

## Known issues
- Commerce data does not load in local preview — `product-recommendations` returns an empty unit, so the Top Sellers slider arrows stay hidden locally; verifiable only on a backend-connected environment.
- Webfonts `Source Serif Pro` / `Muli` not bundled — hero falls back to generic serif/sans locally.
- `section-metadata` block 404s in local preview (expected; interpreted as section styling when published).
- Carousel auto-advance keeps the hero CTA in motion, so screenshot tooling can't capture a stable hover frame.

## Open questions
- Add missing webfonts (`Source Serif Pro`, `Muli`) to `fonts/` + `fonts.css` for exact typography?
- Is recId `b8d51c7c…` / SKU `VD01` the intended Top Sellers unit, and which environment should verify products render?
- Should the Aussie-vibe copy be pushed back to DA, or does DA remain canonical owner of that copy?

## Next best action
- Verify the Top Sellers `product-recommendations` slider (arrows, scroll, add-to-cart) on the backend-connected feature preview `https://aem-20260618-1307--commerce-lab-2026--adobe-sydney-labs.aem.page/`, since the local preview returns no commerce data.