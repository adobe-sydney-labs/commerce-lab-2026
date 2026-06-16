/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-promo.
 * Base block: cards
 * Source URL: https://venia.magento.com/
 * Generated: 2026-06-16
 *
 * Venia category promo tiles region. Three sibling `.venia-home-callout` tiles, each with:
 *   - a top-level <img> (category background image)
 *   - a `.venia-home-callout-text` wrapper holding an <h2> label
 *     (Shop Women / Shop Men / What's New) and a short caption <p>.
 *
 * page-templates.json instance selector: .venia-home-callout (matches all three tiles).
 *
 * The cards base block expects one row per card -> [ imageCell, bodyCell ].
 * Output: one row per promo tile, image in column 1, heading + caption in column 2.
 */
// Venia renders the tile imagery as inline CSS background-image rather than an
// <img> tag. Resolve a usable image: prefer a real <img>/<picture>, otherwise
// synthesize an <img> from the first element (self or descendant) carrying an
// inline background-image url.
function resolveImage(document, scope) {
  const existing = scope.querySelector(':scope > picture, :scope > img')
    || scope.querySelector('picture, img');
  if (existing) return existing;
  const candidates = [scope, ...scope.querySelectorAll('*')];
  for (const el of candidates) {
    const bg = el.style && el.style.backgroundImage;
    if (bg && bg !== 'none') {
      const match = bg.match(/url\((['"]?)(.*?)\1\)/);
      if (match && match[2]) {
        const img = document.createElement('img');
        img.src = match[2];
        return img;
      }
    }
  }
  return null;
}

export default function parse(element, { document }) {
  // The instance selector matches all three sibling tiles, so the importer invokes
  // this parser once per tile. Guard: if this element was already consumed/removed by
  // a previous invocation (it's detached from the document), do nothing.
  if (!element.isConnected || !element.parentElement) {
    return;
  }

  // Collect every promo tile so a single cards block holds all three rows,
  // regardless of which matched tile the importer hands us.
  let tiles = [];
  if (element.parentElement) {
    tiles = Array.from(element.parentElement.querySelectorAll(':scope > .venia-home-callout'));
  }
  if (tiles.length === 0) {
    tiles = element.classList.contains('venia-home-callout')
      ? [element]
      : Array.from(element.querySelectorAll('.venia-home-callout'));
  }
  if (tiles.length === 0) tiles = [element];

  const cells = tiles.map((tile) => {
    // Image: the tile's own image (real <img>/<picture> or inline background-image url).
    const image = resolveImage(document, tile);

    // Body: heading label + short caption.
    const textWrapper = tile.querySelector('.venia-home-callout-text') || tile;
    const heading = textWrapper.querySelector('h1, h2, h3');
    const caption = textWrapper.querySelector('p');

    const bodyCell = [];
    if (heading) bodyCell.push(heading);
    if (caption) bodyCell.push(caption);

    return [image, bodyCell];
  });

  const block = WebImporter.Blocks.createBlock(document, {
    name: 'cards-promo',
    cells,
  });

  // Replace the first tile with the assembled block and remove the rest so the
  // remaining sibling tiles are not left behind in the output.
  const first = tiles[0];
  first.replaceWith(block);
  tiles.slice(1).forEach((tile) => {
    if (tile && tile.parentElement) tile.remove();
  });
}
