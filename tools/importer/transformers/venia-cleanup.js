/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: Venia (PWA Studio storefront) site-wide cleanup.
 *
 * Removes non-authorable commerce chrome and live/dynamic regions so the
 * imported content contains only the static, authorable marketing blocks
 * (hero slider, category promo tiles, two side-by-side promos, Top Sellers
 * heading).
 *
 * ALL selectors below were verified against migration-work/cleaned.html.
 */

export default function transform(hookName, element, payload) {
  if (hookName === 'beforeTransform') {
    // Slick carousel artifacts. The scraper captured the initialized slick
    // markup (slick-dots pagination) for both the hero slider and the Top
    // Sellers carousel. Remove the dots so the hero parser sees only the real
    // slide content and not pagination buttons.
    //   Found in cleaned.html: <ul class="slick-dots"> (lines 466, 929)
    WebImporter.DOMUtils.remove(element, ['.slick-dots']);
  }

  if (hookName === 'afterTransform') {
    WebImporter.DOMUtils.remove(element, [
      // Mobile navigation drawer (category tree, store/locale switchers).
      //   Found in cleaned.html: <aside class="navigation-root-eCb"> (line 5)
      '.navigation-root-eCb',
      '[class*="navigation-root"]',

      // Store/currency/locale switchers bar that renders above the header.
      // Uses substring matching since PageBuilder/PWA class suffixes are hashed.
      '[class*="header-switchersContainer"]',
      '[class*="storeSwitcher-root"]',

      // Site header: logo, mega-nav, search, mini-cart, account/store switchers.
      //   Found in cleaned.html: <header class="header-root--TP"> (line 223)
      '.header-root--TP',
      'header.header-closed-NAz',
      '[class*="header-root"]',

      // Site footer: link columns, newsletter form, social, copyright.
      //   Found in cleaned.html: <footer class="footer-root-xZ1"> (line 944)
      '.footer-root-xZ1',
      'footer',
      '[class*="footer-root"]',

      // Dynamic "Top Sellers" product grid: live GraphQL gallery with pricing,
      // swatches and ADD TO CART. Not authorable static content. The static
      // "Top Sellers!" heading lives in .venia-home-row-2 and is kept.
      //   Found in cleaned.html: .venia-home-row-3 / .venia-home-products
      //   / .products-carousel-bU- (lines 581, 583)
      '.venia-home-row-3',
      '.venia-home-products',
      '.products-carousel-bU-',

      // Non-rendering / non-authorable elements left in the markup.
      'iframe',
      'link',
      'noscript',
      'script',
      'style',
    ]);

    // Strip framework/state attributes that are not authorable.
    element.querySelectorAll('*').forEach((el) => {
      el.removeAttribute('onclick');
      el.removeAttribute('tabindex');
      el.removeAttribute('aria-hidden');
      el.removeAttribute('data-element');
      el.removeAttribute('data-content-type');
    });
  }
}
