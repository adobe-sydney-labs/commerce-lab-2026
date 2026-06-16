/* eslint-disable */
/* global WebImporter */
/**
 * Parser for columns-dark.
 * Base block: columns
 * Source URL: https://venia.magento.com/
 * Generated: 2026-06-16
 * Venia "Vacations meet fresh style" promo. Two-column layout, image-left /
 * dark text-panel-right. Source DOM is two sibling Page Builder columns:
 *   .venia-home-banner-b-image   -> lifestyle image (woman in orange dress)
 *   .venia-home-banner-b-content -> H2 heading, caption paragraph, "Shop Summer" CTA
 *
 * Output: a columns-style table with one row containing two cells, in source
 * order (image cell first, then content cell). The "dark" section styling is
 * applied via section metadata, not by the parser.
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
  // (.venia-home-banner-b-image then .venia-home-banner-b-content), so this
  // parser is invoked twice. Anchor on the image column (processed first):
  // build the full two-column block there, and on the content-column
  // invocation simply remove the now-orphaned element.
  const root = element.parentElement || element;
  const imageColumn = element.matches('.venia-home-banner-b-image')
    ? element
    : root.querySelector('.venia-home-banner-b-image');

  // Build only on the image-column invocation. Any other invocation just
  // removes the stray element so it isn't processed into an empty block.
  if (!imageColumn || element !== imageColumn) {
    element.remove();
    return;
  }

  // Locate the content column: prefer the sibling, fall back to a nearby query.
  let contentColumn = imageColumn.nextElementSibling
    && imageColumn.nextElementSibling.matches('.venia-home-banner-b-content')
    ? imageColumn.nextElementSibling
    : null;
  if (!contentColumn) {
    contentColumn = root.querySelector('.venia-home-banner-b-content');
  }

  // --- Image cell ---
  // Real <img>/<picture> or an <img> synthesized from the inline background-image.
  const imageCell = [];
  const image = resolveImage(document, imageColumn || element);
  if (image) imageCell.push(image);

  // --- Content cell ---
  // Preserve the heading, caption paragraph, and CTA link as semantic HTML.
  const contentCell = [];
  if (contentColumn) {
    const heading = contentColumn.querySelector('h1, h2, h3, [class*="title"]');
    if (heading) contentCell.push(heading);

    // CTA link(s) within the content column.
    const ctaLinks = Array.from(contentColumn.querySelectorAll('a[href]'));

    // Caption paragraphs: any <p> that does not itself contain the CTA link.
    const paragraphs = Array.from(contentColumn.querySelectorAll('p')).filter(
      (p) => !p.querySelector('a[href]'),
    );
    contentCell.push(...paragraphs);

    // Append CTA links after the caption text.
    contentCell.push(...ctaLinks);
  }

  // Build one row with two cells: image column first, content column second.
  const cells = [[imageCell, contentCell]];

  const block = WebImporter.Blocks.createBlock(document, { name: 'columns-dark', cells });
  element.replaceWith(block);
}
