/* eslint-disable */
/* global WebImporter */
/**
 * Parser for columns-feature.
 * Base block: columns
 * Source URL: https://venia.magento.com/
 * Generated: 2026-06-16
 *
 * Venia "Signature Heels" promo. Two-column, text-left / image-right split.
 * page-templates.json instances:
 *   - .venia-home-banner-a-content (left text column: H2, H3, body paragraph, two pill CTAs)
 *   - .venia-home-banner-a-image   (right image column: gold heels product image)
 *
 * The columns base block expects a single row whose cells are the columns.
 * Output: one row with two cells -> [ textColumn, imageColumn ].
 */
// Venia renders the banner image as inline CSS background-image rather than an
// <img> tag. Resolve a usable image: prefer a real <img>/<picture>, otherwise
// synthesize an <img> from the first element (self or descendant) carrying an
// inline background-image url.
function resolveImage(document, scope) {
  if (!scope) return null;
  const existing = scope.querySelector('picture, img');
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
  // page-templates.json lists two instance selectors for this single block
  // (.venia-home-banner-a-content then .venia-home-banner-a-image), so this
  // parser is invoked twice. Anchor on the content column (processed first):
  // build the full two-column block there, and on the image-column invocation
  // simply remove the now-orphaned element.
  const root = element.parentElement || element;
  const contentEl = element.classList.contains('venia-home-banner-a-content')
    ? element
    : root.querySelector('.venia-home-banner-a-content');
  const imageEl = element.classList.contains('venia-home-banner-a-image')
    ? element
    : root.querySelector('.venia-home-banner-a-image');

  // Build only on the content-column invocation. Any other invocation (image
  // column, or content already replaced by the block) just removes the stray
  // element so it isn't processed into an empty block.
  if (!contentEl || element !== contentEl) {
    element.remove();
    return;
  }

  // --- Left (text) column content ---
  const textCell = [];

  const heading = contentEl.querySelector('h2, h1');
  if (heading) textCell.push(heading);

  const subheading = contentEl.querySelector('h3, h4');
  if (subheading) textCell.push(subheading);

  // Body paragraphs: exclude paragraphs that only hold the CTA links.
  const paragraphs = Array.from(contentEl.querySelectorAll('p')).filter(
    (p) => !p.querySelector('a'),
  );
  paragraphs.forEach((p) => textCell.push(p));

  // CTA links (Shop Heels / Shop All Shoes) preserved as links.
  const ctaLinks = Array.from(contentEl.querySelectorAll('a[href]'));
  ctaLinks.forEach((a) => textCell.push(a));

  // --- Right (image) column content ---
  const imageCell = [];
  const img = resolveImage(document, imageEl);
  if (img) imageCell.push(img);

  // One row, two cells: text column + image column.
  const cells = [[textCell, imageCell]];

  const block = WebImporter.Blocks.createBlock(document, {
    name: 'columns-feature',
    cells,
  });
  element.replaceWith(block);
}
