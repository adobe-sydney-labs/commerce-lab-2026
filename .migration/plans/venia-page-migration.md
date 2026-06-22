I'll re-read the columns-feature section to plan the "boots" change accurately.You chose copy + swap image, which needs a boots image source. Let me ask where the new image should come from.# Columns-Feature: Heels → Boots — commerce-lab-2026

Scope confirmed: in the **`columns-feature`** section of `content/index.plain.html`, rewrite the copy from "Signature Heels" to boots **and** swap the image for a **boots image sourced from the Venia (`venia.magento.com`) catalog**. Execution requires Execute mode.

## Target

- **File:** `content/index.plain.html`
- **Block:** `columns-feature` (3rd section) — text column + image column
- **Selected element:** the `<img>` in `.columns-feature-img-col`
- **Untouched:** block HTML structure, other sections, hero/cards/columns-dark/Top Sellers

## Current content (to replace)

- **H2:** `Make a Statement in` / `Signature Heels`
- **H3:** `From the City to the Coast`
- **Body:** `Strut from a Melbourne laneway to a Gold Coast soiree in heels built to turn heads. Too easy — your best fit starts from the ground up, mate.`
- **CTA:** `Shop Heels Shop All Shoes` → `/`
- **Image:** `media-19f5448f17fb9bf17c34b1ddb2d723cf4c2d8cdd8-92ac4a36.png` (heels)

## Proposed content (boots)

- **H2:** `Make a Statement in` / `Statement Boots`
- **H3:** `From the City to the Coast`
- **Body:** `Stride from a Melbourne laneway to a Gold Coast soiree in boots built to turn heads. Too easy — your best fit starts from the ground up, mate.`
- **CTA:** `Shop Boots Shop All Shoes` → `/` *(link unchanged)*
- **Image:** new **boots** image sourced from the Venia catalog (see image step below)

## Image sourcing (Venia catalog)

1. Locate a suitable **boots** product image on `venia.magento.com` (catalog/product media).
2. Bring it into the project the approved way — via the import/asset pipeline so it gets rehosted as an optimized DA `media_*` asset (no hand-dropping binaries into `content/`).
3. Update the `<source srcset>` ×2 and `<img src>` in the selected `.columns-feature-img-col` `<picture>` to the new asset URL; set a descriptive `alt` (e.g. `Statement boots`).

## Notes & Constraints

- Only text + the one image's `srcset`/`src`/`alt` change; preserve `<picture>` structure, `<br>` tags, and CTA `href`.
- Copy-only text edits go directly into the `*.plain.html` per the in-editor element context; image asset must route through the import/asset pipeline, not a raw commit.
- After editing, verify in preview that the section renders, the new image loads, and the CTA still works.

## Open question

- Exact boots image: I'll pick a representative boots product image from the Venia catalog unless you have a specific product/URL in mind — tell me if so.

## Checklist

- [ ] Read columns-feature section + confirm scope — **done**
- [ ] Confirm change type (copy + image) and image source (Venia catalog) — **done**
- [ ] Find a suitable boots image on `venia.magento.com`
- [ ] Bring image into project via import/asset pipeline (DA-rehosted `media_*`)
- [ ] Update H2/H3/body/CTA text: heels → boots in `content/index.plain.html`
- [ ] Update `<source srcset>` ×2, `<img src>`, and `alt` in the selected image column
- [ ] Preserve block HTML structure, `<br>` tags, and CTA `href`
- [ ] Verify section renders, boots image loads, CTA works in preview
- [ ] Switch to Execute mode to apply the changes

Ready on your approval — **switch to Execute mode** and I'll make the changes.
