/* eslint-disable */
/* global WebImporter */
/**
 * Parser for hero-banner.
 * Base block: hero.
 * Source: https://venia.magento.com/ (Venia full-width home hero slider region).
 * Generated: 2026-06-16
 *
 * Source structure (`.venia-home-slider`): a pagebuilder slider with one real slide.
 * The active slide contains:
 *   - a banner <img> (background image, e.g. venia-hero1.jpg) inside `.banner-wrapper-*`
 *   - a `.banner-content-*` overlay with an <h2> heading ("Shop the New Outerwear
 *     Collection"), a body <p>, and a single CTA <a> ("Shop Now").
 * The slider also includes inert duplicate/empty slides and `.slick-dots` carousel
 * controls, which must be excluded from the output.
 *
 * Target (hero) structure: single column, two rows.
 *   - Row 1: background image (picture/img)
 *   - Row 2: content (heading + body paragraph + CTA link)
 * The hero-banner block treats the first-row image as a full-bleed background and
 * overlays the row-2 content; when no image is present it falls back to `no-image`.
 */
// Venia renders banner imagery as inline CSS background-image rather than <img>
// tags. Resolve a usable image element: prefer a real <img>/<picture>, otherwise
// synthesize an <img> from the first descendant (or the element itself) carrying
// an inline background-image url.
function resolveImage(document, scope) {
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
  // Scope extraction to the active/current slide so inert duplicate slides and the
  // carousel dot controls (.slick-dots) are ignored. Fall back to the element itself.
  const activeSlide = element.querySelector('.slick-slide.slick-active, .slick-current, .slick-slide')
    || element;

  // Background image: the banner image (real <img> or inline background-image url).
  const image = resolveImage(document, activeSlide);

  // Content overlay: heading + body paragraph(s) + CTA(s).
  const contentRoot = activeSlide.querySelector('[class*="banner-content"], [class*="banner-overlay"]')
    || activeSlide;

  const heading = contentRoot.querySelector('h1, h2, h3, h4, h5, h6');

  // Body paragraphs: exclude empty paragraphs and paragraphs that only wrap a CTA link.
  const bodyParagraphs = Array.from(contentRoot.querySelectorAll('p')).filter((p) => {
    if (p.querySelector('a')) return false;
    return p.textContent.trim().length > 0;
  });

  // CTA links (e.g. "Shop Now"). Anchors carry the link semantics.
  const ctaLinks = Array.from(contentRoot.querySelectorAll('a[href]'));

  const cells = [];

  // Row 1: background image (only when present so the block can fall back to no-image).
  if (image) cells.push([image]);

  // Row 2: heading + body + CTAs in a single content cell.
  const contentCell = [];
  if (heading) contentCell.push(heading);
  bodyParagraphs.forEach((p) => contentCell.push(p));
  ctaLinks.forEach((a) => contentCell.push(a));
  cells.push([contentCell]);

  const block = WebImporter.Blocks.createBlock(document, { name: 'hero-banner', cells });
  element.replaceWith(block);
}
