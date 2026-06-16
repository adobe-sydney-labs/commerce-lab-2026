/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS
import heroBannerParser from './parsers/hero-banner.js';
import cardsPromoParser from './parsers/cards-promo.js';
import columnsFeatureParser from './parsers/columns-feature.js';
import columnsDarkParser from './parsers/columns-dark.js';

// TRANSFORMER IMPORTS
import veniaCleanupTransformer from './transformers/venia-cleanup.js';
import veniaSectionsTransformer from './transformers/venia-sections.js';

// PAGE TEMPLATE CONFIGURATION - Embedded from page-templates.json
const PAGE_TEMPLATE = {
  name: 'commerce-home',
  description: 'Venia PWA Studio sample home page. Static authorable marketing content (hero banner, category promo tiles, two side-by-side promos). Header, footer, and the Top Sellers product grid are dynamic commerce regions excluded from authoring.',
  urls: [
    'https://venia.magento.com/',
  ],
  blocks: [
    {
      name: 'hero-banner',
      instances: ['.venia-home-slider'],
    },
    {
      name: 'cards-promo',
      instances: ['.venia-home-callout'],
    },
    {
      name: 'columns-feature',
      instances: ['.venia-home-banner-a-content', '.venia-home-banner-a-image'],
    },
    {
      name: 'columns-dark',
      instances: ['.venia-home-banner-b-image', '.venia-home-banner-b-content'],
      section: 'dark',
    },
  ],
  sections: [
    {
      id: 'section-1',
      name: 'Hero banner',
      selector: '.venia-home-row-1 .venia-home-slider',
      style: null,
      blocks: ['hero-banner'],
      defaultContent: [],
    },
    {
      id: 'section-2',
      name: 'Category promo tiles',
      selector: '.venia-home-callout',
      style: null,
      blocks: ['cards-promo'],
      defaultContent: [],
    },
    {
      id: 'section-3',
      name: 'Signature heels promo',
      selector: '.venia-home-banner-a-content',
      style: null,
      blocks: ['columns-feature'],
      defaultContent: [],
    },
    {
      id: 'section-4',
      name: 'Vacations promo (dark)',
      selector: '.venia-home-banner-b-image',
      style: 'dark',
      blocks: ['columns-dark'],
      defaultContent: [],
    },
    {
      id: 'section-5',
      name: 'Top Sellers heading',
      selector: '.venia-home-row-2',
      style: null,
      blocks: [],
      defaultContent: ['.venia-home-row-2 h2'],
    },
  ],
};

// PARSER REGISTRY - Map parser names to functions
const parsers = {
  'hero-banner': heroBannerParser,
  'cards-promo': cardsPromoParser,
  'columns-feature': columnsFeatureParser,
  'columns-dark': columnsDarkParser,
};

// TRANSFORMER REGISTRY - cleanup runs first; sections runs after parsing (afterTransform)
const transformers = [
  veniaCleanupTransformer,
  ...(PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length > 1 ? [veniaSectionsTransformer] : []),
];

/**
 * Execute all page transformers for a specific hook
 * @param {string} hookName - 'beforeTransform' or 'afterTransform'
 * @param {Element} element - The DOM element to transform
 * @param {Object} payload - { document, url, html, params }
 */
function executeTransformers(hookName, element, payload) {
  const enhancedPayload = {
    ...payload,
    template: PAGE_TEMPLATE,
  };

  transformers.forEach((transformerFn) => {
    try {
      transformerFn.call(null, hookName, element, enhancedPayload);
    } catch (e) {
      console.error(`Transformer failed at ${hookName}:`, e);
    }
  });
}

/**
 * Find all blocks on the page based on the embedded template configuration
 * @param {Document} document - The DOM document
 * @param {Object} template - The embedded PAGE_TEMPLATE object
 * @returns {Array} Array of block instances found on the page
 */
function findBlocksOnPage(document, template) {
  const pageBlocks = [];

  template.blocks.forEach((blockDef) => {
    blockDef.instances.forEach((selector) => {
      const elements = document.querySelectorAll(selector);
      if (elements.length === 0) {
        console.warn(`Block "${blockDef.name}" selector not found: ${selector}`);
      }
      elements.forEach((element) => {
        pageBlocks.push({
          name: blockDef.name,
          selector,
          element,
          section: blockDef.section || null,
        });
      });
    });
  });

  console.log(`Found ${pageBlocks.length} block instances on page`);
  return pageBlocks;
}

// EXPORT DEFAULT CONFIGURATION
export default {
  transform: (payload) => {
    const { document, url, params } = payload;

    const main = document.body;

    // 1. beforeTransform cleanup (remove carousel artifacts, etc.)
    executeTransformers('beforeTransform', main, payload);

    // 2. Find blocks on page using embedded template
    const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);

    // 3. Parse each block using registered parsers
    pageBlocks.forEach((block) => {
      const parser = parsers[block.name];
      if (parser) {
        try {
          parser(block.element, { document, url, params });
        } catch (e) {
          console.error(`Failed to parse ${block.name} (${block.selector}):`, e);
        }
      } else {
        console.warn(`No parser found for block: ${block.name}`);
      }
    });

    // 4. afterTransform cleanup + section breaks/metadata
    executeTransformers('afterTransform', main, payload);

    // 5. Apply WebImporter built-in rules
    const hr = document.createElement('hr');
    main.appendChild(hr);
    WebImporter.rules.createMetadata(main, document);
    WebImporter.rules.transformBackgroundImages(main, document);
    WebImporter.rules.adjustImageUrls(main, url, params.originalURL);

    // 6. Generate sanitized path. The home page pathname is "/", which would
    // reduce to an empty string and break the importer's path resolution, so
    // fall back to "/index" for the site root.
    const rawPath = new URL(params.originalURL).pathname.replace(/\/$/, '').replace(/\.html$/, '');
    const path = WebImporter.FileUtils.sanitizePath(rawPath || '/index');

    return [{
      element: main,
      path,
      report: {
        title: document.title,
        template: PAGE_TEMPLATE.name,
        blocks: pageBlocks.map((b) => b.name),
      },
    }];
  },
};
