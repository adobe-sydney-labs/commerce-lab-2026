// Dropin Tools
import { events } from '@dropins/tools/event-bus.js';
import { getConfigValue } from '@dropins/tools/lib/aem/configs.js';

// Dropin Components
import { Button, Icon, provider as UI } from '@dropins/tools/components.js';
import { tryRenderAemAssetsImage } from '@dropins/tools/lib/aem/assets.js';

// Cart Dropin
import * as cartApi from '@dropins/storefront-cart/api.js';

// Recommendations Dropin
import ProductList from '@dropins/storefront-recommendations/containers/ProductList.js';
import { render as provider } from '@dropins/storefront-recommendations/render.js';
import { publishRecsItemAddToCartClick } from '@dropins/storefront-recommendations/api.js';

// Wishlist Dropin
import { WishlistToggle } from '@dropins/storefront-wishlist/containers/WishlistToggle.js';
import { render as wishlistRender } from '@dropins/storefront-wishlist/render.js';

// Block-level
import { readBlockConfig } from '../../scripts/aem.js';
import { fetchPlaceholders, getProductLink } from '../../scripts/commerce.js';

// Initializers
import '../../scripts/initializers/recommendations.js';
import '../../scripts/initializers/wishlist.js';

const isMobile = window.matchMedia('only screen and (max-width: 900px)').matches;

/**
 * Validates and returns a product view history entry if valid
 * @param {Object} entry - The history entry to validate
 * @returns {Object|null} - Validated history entry or null if invalid
 */
function getValidHistoryEntry(entry) {
  // Basic validation to ensure the entry has necessary properties
  if (entry && typeof entry === 'object' && entry.sku && entry.date) {
    return {
      sku: entry.sku,
      date: entry.date,
    };
  }
  return null;
}

/**
 * Gets product view history from localStorage
 * @param {string} storeViewCode - The store view code
 * @returns {Array} - Array of view history items
 */
function getProductViewHistory(storeViewCode) {
  try {
    const viewHistory = window.localStorage.getItem(`${storeViewCode}:productViewHistory`) || '[]';
    const parsedHistory = JSON.parse(viewHistory);
    if (!Array.isArray(parsedHistory)) {
      throw new Error('Product view history is not an array');
    }
    const validHistory = parsedHistory.map(getValidHistoryEntry).filter((entry) => entry !== null);
    if (validHistory.length === 0) {
      // If no valid entries, clear the history to prevent future parsing issues
      window.localStorage.removeItem(`${storeViewCode}:productViewHistory`);
    }
    return validHistory;
  } catch (e) {
    window.localStorage.removeItem(`${storeViewCode}:productViewHistory`);
    console.error('Error parsing product view history', e);
    return [];
  }
}

/**
 * Gets purchase history from localStorage
 * @param {string} storeViewCode - The store view code
 * @returns {Array} - Array of purchase history items
 */
function getPurchaseHistory(storeViewCode) {
  try {
    const purchaseHistory = window.localStorage.getItem(`${storeViewCode}:purchaseHistory`) || '[]';
    return JSON.parse(purchaseHistory);
  } catch (e) {
    window.localStorage.removeItem(`${storeViewCode}:purchaseHistory`);
    console.error('Error parsing purchase history', e);
    return [];
  }
}

/**
 * Adds prev/next slider arrows to the recommendations product row and wires
 * them to scroll the horizontally-overflowing list. Safe to call repeatedly:
 * it waits for the dropin's scroll container to appear and won't duplicate
 * controls. The dropin renders products asynchronously (and may re-render), so
 * the scroll container is re-queried on each interaction and its size/contents
 * are observed to keep arrow visibility in sync.
 * @param {Element} wrapper - The recommendations wrapper element
 */
function addSliderArrows(wrapper) {
  const start = Date.now();

  const tryAttach = () => {
    // The dropin renders products into `.recommendations-product-list__content`.
    const scroller = wrapper.querySelector('.recommendations-product-list__content');
    if (!scroller) {
      if (Date.now() - start < 8000) {
        setTimeout(tryAttach, 200);
      }
      return;
    }

    const container = scroller.closest('.recommendations-product-list') || scroller.parentElement;
    if (!container || container.querySelector(':scope > .recommendations__arrow')) {
      return; // already wired
    }

    const makeArrow = (direction) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = `recommendations__arrow recommendations__arrow--${direction}`;
      btn.setAttribute('aria-label', direction === 'prev' ? 'Scroll to previous products' : 'Scroll to next products');
      btn.innerHTML = '<span class="recommendations__arrow-icon" aria-hidden="true"></span>';
      return btn;
    };

    const prev = makeArrow('prev');
    const next = makeArrow('next');

    // Re-query the live scroll container each time: the dropin can replace its
    // content node when recommendation data loads.
    const getScroller = () => container.querySelector('.recommendations-product-list__content') || scroller;

    const scrollByPage = (dir) => {
      const el = getScroller();
      const item = el.querySelector('.recommendations-product-item-card, .product-grid-item');
      const step = item ? item.getBoundingClientRect().width + 32 : el.clientWidth * 0.8;
      el.scrollBy({ left: dir * step, behavior: 'smooth' });
    };

    const updateArrows = () => {
      const el = getScroller();
      const maxScroll = el.scrollWidth - el.clientWidth;
      const overflows = maxScroll > 4;
      container.classList.toggle('recommendations__has-arrows', overflows);
      prev.disabled = el.scrollLeft <= 1;
      next.disabled = el.scrollLeft >= maxScroll - 1;
    };

    prev.addEventListener('click', () => scrollByPage(-1));
    next.addEventListener('click', () => scrollByPage(1));
    container.addEventListener('scroll', updateArrows, { passive: true, capture: true });
    window.addEventListener('resize', updateArrows);

    // Products load asynchronously and the dropin may re-render: observe the
    // container so arrow visibility recomputes when size or contents change.
    if (typeof ResizeObserver !== 'undefined') {
      new ResizeObserver(updateArrows).observe(container);
    }
    new MutationObserver(updateArrows).observe(container, { childList: true, subtree: true });

    container.append(prev, next);
    updateArrows();
  };

  tryAttach();
}

export default async function decorate(block) {
  const labels = await fetchPlaceholders();

  // Hide configuration rows if they exist
  const children = [...block.children];
  children.forEach((child) => {
    child.style.display = 'none';
  });

  // Configuration
  const { currentsku, recid } = readBlockConfig(block);

  // Layout
  const fragment = document.createRange().createContextualFragment(`
    <div class="recommendations__wrapper">
      <div class="recommendations__list"></div>
    </div>
  `);

  const $list = fragment.querySelector('.recommendations__list');
  const $wrapper = fragment.querySelector('.recommendations__wrapper');

  block.appendChild(fragment);

  let visibility = !isMobile;
  let isLoading = false;
  let loadTimeout = null;

  async function loadRecommendation(
    context,
    isVisible,
    container,
    forceReload = false,
  ) {
    // Only load once the recommendation becomes visible
    if (!isVisible) {
      return;
    }

    // Prevent multiple simultaneous loads
    if (isLoading) {
      return;
    }

    // Only proceed if container is empty or force reload is requested
    if (container.children.length > 0 && !forceReload) {
      return;
    }

    isLoading = true;

    // Clear container if reloading
    if (forceReload) {
      container.innerHTML = '';
    }

    const storeViewCode = getConfigValue('headers.cs.Magento-Store-View-Code');
    const createProductLink = (item) => getProductLink(item.urlKey, item.sku);

    // Get product view history
    context.userViewHistory = getProductViewHistory(storeViewCode);

    // Get purchase history
    context.userPurchaseHistory = getPurchaseHistory(storeViewCode);

    let recommendationsData = null;

    // Get data from the event bus to set publish events
    events.on(
      'recommendations/data',
      (data) => {
        recommendationsData = data;
        if (data?.items?.length) {
          recommendationsData = data;
        }
      },
      { eager: true },
    );

    try {
      await Promise.all([
        provider.render(ProductList, {
          routeProduct: createProductLink,
          recId: recid,
          currentSku: currentsku || context.currentSku,
          userViewHistory: context.userViewHistory,
          userPurchaseHistory: context.userPurchaseHistory,
          slots: {
            Footer: (ctx) => {
              const wrapper = document.createElement('div');
              wrapper.className = 'footer__wrapper';

              const addToCart = document.createElement('div');
              addToCart.className = 'footer__button--add-to-cart';
              wrapper.appendChild(addToCart);

              if (ctx.item.itemType === 'SimpleProductView') {
                // Add to Cart Button
                UI.render(Button, {
                  children: labels.Global?.AddProductToCart,
                  icon: Icon({ source: 'Cart' }),
                  onClick: (event) => {
                    cartApi.addProductsToCart([
                      { sku: ctx.item.sku, quantity: 1 },
                    ]);
                    // Prevent the click event from bubbling up to the parent span
                    // to avoid triggering the recs-item-click event
                    event.stopPropagation();
                    // Publish ACDL event for add to cart click
                    const recommendationUnit = recommendationsData?.find(
                      (unit) => unit.items?.some(
                        (unitItem) => unitItem.sku === ctx.item.sku,
                      ),
                    );
                    publishRecsItemAddToCartClick({
                      recommendationUnit,
                      pagePlacement: 'product-list',
                      yOffsetTop: addToCart.getBoundingClientRect().top ?? 0,
                      yOffsetBottom:
                        addToCart.getBoundingClientRect().bottom ?? 0,
                      productId: ctx.index,
                    });
                  },
                  variant: 'primary',
                })(addToCart);
              } else {
                // Select Options Button
                UI.render(Button, {
                  children:
                    labels.Global?.SelectProductOptions,
                  href: createProductLink(ctx.item),
                  variant: 'tertiary',
                })(addToCart);
              }

              // Wishlist Button
              const $wishlistToggle = document.createElement('div');
              $wishlistToggle.classList.add('footer__button--wishlist-toggle');

              // Render Icon
              wishlistRender.render(WishlistToggle, {
                product: ctx.item,
              })($wishlistToggle);

              // Append to Cart Item
              wrapper.appendChild($wishlistToggle);

              ctx.replaceWith(wrapper);
            },

            Thumbnail: (ctx) => {
              const { item, defaultImageProps } = ctx;
              const wrapper = document.createElement('a');
              wrapper.href = createProductLink(item);

              tryRenderAemAssetsImage(ctx, {
                alias: item.sku,
                imageProps: defaultImageProps,
                wrapper,

                params: {
                  width: defaultImageProps.width,
                  height: defaultImageProps.height,
                },
              });
            },
          },
        })($wrapper),
      ]);

      // Once the dropin has rendered its product row, add left/right slider
      // arrows that scroll the horizontally-overflowing product list.
      addSliderArrows($wrapper);
    } finally {
      isLoading = false;
    }
  }

  const context = {};
  // Debounced loader to prevent excessive API calls
  function debouncedLoadRecommendation(forceReload = false) {
    if (loadTimeout) {
      clearTimeout(loadTimeout);
    }

    loadTimeout = setTimeout(() => {
      loadRecommendation(context, visibility, $list, forceReload);
    }, 300); // 300ms debounce
  }

  // Track previous context values to detect significant changes
  let previousContext = {};

  function shouldReloadRecommendations(newContext) {
    // Check if significant context changes occurred that warrant reloading recommendations
    const significantChanges = ['currentSku', 'pageType', 'category'];

    return significantChanges.some(
      (key) => newContext[key] !== previousContext[key] && newContext[key] !== undefined,
    );
  }

  function updateContext(updates) {
    const hasSignificantChanges = shouldReloadRecommendations({
      ...context,
      ...updates,
    });

    // Update context
    Object.assign(context, updates);

    // Update previous context for next comparison
    previousContext = { ...context };

    // Load or reload recommendations based on whether significant changes occurred
    if (hasSignificantChanges && $list.children.length > 0) {
      // Force reload if recommendations already exist and context changed significantly
      debouncedLoadRecommendation(true);
    } else {
      // Initial load or minor context changes
      debouncedLoadRecommendation(false);
    }
  }

  function handleProductChanges({ productContext }) {
    updateContext({ currentSku: productContext?.sku });
  }

  function handleCategoryChanges({ categoryContext }) {
    updateContext({ category: categoryContext?.name });
  }

  function handlePageTypeChanges({ pageContext }) {
    updateContext({ pageType: pageContext?.pageType });
  }

  function handleCartChanges({ shoppingCartContext }) {
    const cartSkus = shoppingCartContext?.totalQuantity === 0
      ? []
      : shoppingCartContext?.items?.map(({ product }) => product.sku);
    updateContext({ cartSkus });
  }

  window.adobeDataLayer.push((dl) => {
    dl.addEventListener('adobeDataLayer:change', handlePageTypeChanges, { path: 'pageContext' });
    dl.addEventListener('adobeDataLayer:change', handleProductChanges, { path: 'productContext' });
    dl.addEventListener('adobeDataLayer:change', handleCategoryChanges, { path: 'categoryContext' });
    dl.addEventListener('adobeDataLayer:change', handleCartChanges, { path: 'shoppingCartContext' });
  });

  if (isMobile) {
    const section = block.closest('.section');
    const inViewObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          visibility = true;
          debouncedLoadRecommendation(false);
          inViewObserver.disconnect();
        }
      });
    });
    inViewObserver.observe(section);
  }
}
