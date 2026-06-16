/* eslint-disable */
var CustomImportScript = (() => {
  var __defProp = Object.defineProperty;
  var __defProps = Object.defineProperties;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getOwnPropSymbols = Object.getOwnPropertySymbols;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __propIsEnum = Object.prototype.propertyIsEnumerable;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __spreadValues = (a, b) => {
    for (var prop in b || (b = {}))
      if (__hasOwnProp.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    if (__getOwnPropSymbols)
      for (var prop of __getOwnPropSymbols(b)) {
        if (__propIsEnum.call(b, prop))
          __defNormalProp(a, prop, b[prop]);
      }
    return a;
  };
  var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // tools/importer/import-commerce-home.js
  var import_commerce_home_exports = {};
  __export(import_commerce_home_exports, {
    default: () => import_commerce_home_default
  });

  // tools/importer/parsers/hero-banner.js
  function resolveImage(document2, scope) {
    const existing = scope.querySelector("picture, img");
    if (existing) return existing;
    const candidates = [scope, ...scope.querySelectorAll("*")];
    for (const el of candidates) {
      const bg = el.style && el.style.backgroundImage;
      if (bg && bg !== "none") {
        const match = bg.match(/url\((['"]?)(.*?)\1\)/);
        if (match && match[2]) {
          const img = document2.createElement("img");
          img.src = match[2];
          return img;
        }
      }
    }
    return null;
  }
  function parse(element, { document: document2 }) {
    const activeSlide = element.querySelector(".slick-slide.slick-active, .slick-current, .slick-slide") || element;
    const image = resolveImage(document2, activeSlide);
    const contentRoot = activeSlide.querySelector('[class*="banner-content"], [class*="banner-overlay"]') || activeSlide;
    const heading = contentRoot.querySelector("h1, h2, h3, h4, h5, h6");
    const bodyParagraphs = Array.from(contentRoot.querySelectorAll("p")).filter((p) => {
      if (p.querySelector("a")) return false;
      return p.textContent.trim().length > 0;
    });
    const ctaLinks = Array.from(contentRoot.querySelectorAll("a[href]"));
    const cells = [];
    if (image) cells.push([image]);
    const contentCell = [];
    if (heading) contentCell.push(heading);
    bodyParagraphs.forEach((p) => contentCell.push(p));
    ctaLinks.forEach((a) => contentCell.push(a));
    cells.push([contentCell]);
    const block = WebImporter.Blocks.createBlock(document2, { name: "hero-banner", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-promo.js
  function resolveImage2(document2, scope) {
    const existing = scope.querySelector(":scope > picture, :scope > img") || scope.querySelector("picture, img");
    if (existing) return existing;
    const candidates = [scope, ...scope.querySelectorAll("*")];
    for (const el of candidates) {
      const bg = el.style && el.style.backgroundImage;
      if (bg && bg !== "none") {
        const match = bg.match(/url\((['"]?)(.*?)\1\)/);
        if (match && match[2]) {
          const img = document2.createElement("img");
          img.src = match[2];
          return img;
        }
      }
    }
    return null;
  }
  function parse2(element, { document: document2 }) {
    if (!element.isConnected || !element.parentElement) {
      return;
    }
    let tiles = [];
    if (element.parentElement) {
      tiles = Array.from(element.parentElement.querySelectorAll(":scope > .venia-home-callout"));
    }
    if (tiles.length === 0) {
      tiles = element.classList.contains("venia-home-callout") ? [element] : Array.from(element.querySelectorAll(".venia-home-callout"));
    }
    if (tiles.length === 0) tiles = [element];
    const cells = tiles.map((tile) => {
      const image = resolveImage2(document2, tile);
      const textWrapper = tile.querySelector(".venia-home-callout-text") || tile;
      const heading = textWrapper.querySelector("h1, h2, h3");
      const caption = textWrapper.querySelector("p");
      const bodyCell = [];
      if (heading) bodyCell.push(heading);
      if (caption) bodyCell.push(caption);
      return [image, bodyCell];
    });
    const block = WebImporter.Blocks.createBlock(document2, {
      name: "cards-promo",
      cells
    });
    const first = tiles[0];
    first.replaceWith(block);
    tiles.slice(1).forEach((tile) => {
      if (tile && tile.parentElement) tile.remove();
    });
  }

  // tools/importer/parsers/columns-feature.js
  function resolveImage3(document2, scope) {
    if (!scope) return null;
    const existing = scope.querySelector("picture, img");
    if (existing) return existing;
    const candidates = [scope, ...scope.querySelectorAll("*")];
    for (const el of candidates) {
      const bg = el.style && el.style.backgroundImage;
      if (bg && bg !== "none") {
        const match = bg.match(/url\((['"]?)(.*?)\1\)/);
        if (match && match[2]) {
          const img = document2.createElement("img");
          img.src = match[2];
          return img;
        }
      }
    }
    return null;
  }
  function parse3(element, { document: document2 }) {
    const root = element.parentElement || element;
    const contentEl = element.classList.contains("venia-home-banner-a-content") ? element : root.querySelector(".venia-home-banner-a-content");
    const imageEl = element.classList.contains("venia-home-banner-a-image") ? element : root.querySelector(".venia-home-banner-a-image");
    if (!contentEl || element !== contentEl) {
      element.remove();
      return;
    }
    const textCell = [];
    const heading = contentEl.querySelector("h2, h1");
    if (heading) textCell.push(heading);
    const subheading = contentEl.querySelector("h3, h4");
    if (subheading) textCell.push(subheading);
    const paragraphs = Array.from(contentEl.querySelectorAll("p")).filter(
      (p) => !p.querySelector("a")
    );
    paragraphs.forEach((p) => textCell.push(p));
    const ctaLinks = Array.from(contentEl.querySelectorAll("a[href]"));
    ctaLinks.forEach((a) => textCell.push(a));
    const imageCell = [];
    const img = resolveImage3(document2, imageEl);
    if (img) imageCell.push(img);
    const cells = [[textCell, imageCell]];
    const block = WebImporter.Blocks.createBlock(document2, {
      name: "columns-feature",
      cells
    });
    element.replaceWith(block);
  }

  // tools/importer/parsers/columns-dark.js
  function resolveImage4(document2, scope) {
    if (!scope) return null;
    const existing = scope.querySelector("picture, img");
    if (existing) return existing;
    const candidates = [scope, ...scope.querySelectorAll("*")];
    for (const el of candidates) {
      const bg = el.style && el.style.backgroundImage;
      if (bg && bg !== "none") {
        const match = bg.match(/url\((['"]?)(.*?)\1\)/);
        if (match && match[2]) {
          const img = document2.createElement("img");
          img.src = match[2];
          return img;
        }
      }
    }
    return null;
  }
  function parse4(element, { document: document2 }) {
    const root = element.parentElement || element;
    const imageColumn = element.matches(".venia-home-banner-b-image") ? element : root.querySelector(".venia-home-banner-b-image");
    if (!imageColumn || element !== imageColumn) {
      element.remove();
      return;
    }
    let contentColumn = imageColumn.nextElementSibling && imageColumn.nextElementSibling.matches(".venia-home-banner-b-content") ? imageColumn.nextElementSibling : null;
    if (!contentColumn) {
      contentColumn = root.querySelector(".venia-home-banner-b-content");
    }
    const imageCell = [];
    const image = resolveImage4(document2, imageColumn || element);
    if (image) imageCell.push(image);
    const contentCell = [];
    if (contentColumn) {
      const heading = contentColumn.querySelector('h1, h2, h3, [class*="title"]');
      if (heading) contentCell.push(heading);
      const ctaLinks = Array.from(contentColumn.querySelectorAll("a[href]"));
      const paragraphs = Array.from(contentColumn.querySelectorAll("p")).filter(
        (p) => !p.querySelector("a[href]")
      );
      contentCell.push(...paragraphs);
      contentCell.push(...ctaLinks);
    }
    const cells = [[imageCell, contentCell]];
    const block = WebImporter.Blocks.createBlock(document2, { name: "columns-dark", cells });
    element.replaceWith(block);
  }

  // tools/importer/transformers/venia-cleanup.js
  function transform(hookName, element, payload) {
    if (hookName === "beforeTransform") {
      WebImporter.DOMUtils.remove(element, [".slick-dots"]);
    }
    if (hookName === "afterTransform") {
      WebImporter.DOMUtils.remove(element, [
        // Mobile navigation drawer (category tree, store/locale switchers).
        //   Found in cleaned.html: <aside class="navigation-root-eCb"> (line 5)
        ".navigation-root-eCb",
        '[class*="navigation-root"]',
        // Store/currency/locale switchers bar that renders above the header.
        // Uses substring matching since PageBuilder/PWA class suffixes are hashed.
        '[class*="header-switchersContainer"]',
        '[class*="storeSwitcher-root"]',
        // Site header: logo, mega-nav, search, mini-cart, account/store switchers.
        //   Found in cleaned.html: <header class="header-root--TP"> (line 223)
        ".header-root--TP",
        "header.header-closed-NAz",
        '[class*="header-root"]',
        // Site footer: link columns, newsletter form, social, copyright.
        //   Found in cleaned.html: <footer class="footer-root-xZ1"> (line 944)
        ".footer-root-xZ1",
        "footer",
        '[class*="footer-root"]',
        // Dynamic "Top Sellers" product grid: live GraphQL gallery with pricing,
        // swatches and ADD TO CART. Not authorable static content. The static
        // "Top Sellers!" heading lives in .venia-home-row-2 and is kept.
        //   Found in cleaned.html: .venia-home-row-3 / .venia-home-products
        //   / .products-carousel-bU- (lines 581, 583)
        ".venia-home-row-3",
        ".venia-home-products",
        ".products-carousel-bU-",
        // Non-rendering / non-authorable elements left in the markup.
        "iframe",
        "link",
        "noscript",
        "script",
        "style"
      ]);
      element.querySelectorAll("*").forEach((el) => {
        el.removeAttribute("onclick");
        el.removeAttribute("tabindex");
        el.removeAttribute("aria-hidden");
        el.removeAttribute("data-element");
        el.removeAttribute("data-content-type");
      });
    }
  }

  // tools/importer/transformers/venia-sections.js
  function transform2(hookName, element, payload) {
    if (hookName === "afterTransform") {
      const template = payload && payload.template ? payload.template : null;
      const sections = template && Array.isArray(template.sections) ? template.sections : [];
      if (sections.length < 2) return;
      const doc = payload && payload.document || element.ownerDocument || document;
      const trySelector = (selector) => {
        if (!selector) return null;
        try {
          return element.querySelector(selector);
        } catch (e) {
          return null;
        }
      };
      const toBlockTitle = (name) => name.replace(/-/g, " ").replace(/\s(.)/g, (s) => s.toUpperCase()).replace(/^(.)/, (s) => s.toUpperCase());
      const findBlockTable = (blockName) => {
        const title = toBlockTitle(blockName);
        const tables = element.querySelectorAll("table");
        for (const table of tables) {
          const firstCell = table.querySelector("tr td, tr th");
          if (firstCell && firstCell.textContent.trim() === title) return table;
        }
        return null;
      };
      const resolveSectionEl = (section) => {
        let el = trySelector(section.selector);
        if (!el && Array.isArray(section.blocks)) {
          for (const blockName of section.blocks) {
            el = findBlockTable(blockName);
            if (el) break;
          }
        }
        return el;
      };
      for (let i = sections.length - 1; i >= 0; i -= 1) {
        const section = sections[i];
        if (!section) continue;
        const sectionEl = resolveSectionEl(section);
        if (!sectionEl) continue;
        if (section.style) {
          const metaBlock = WebImporter.Blocks.createBlock(doc, {
            name: "Section Metadata",
            cells: { style: section.style }
          });
          if (sectionEl.parentNode) {
            sectionEl.parentNode.insertBefore(metaBlock, sectionEl.nextSibling);
          }
        }
        if (i > 0) {
          const hr = doc.createElement("hr");
          if (sectionEl.parentNode) {
            sectionEl.parentNode.insertBefore(hr, sectionEl);
          }
        }
      }
    }
  }

  // tools/importer/import-commerce-home.js
  var PAGE_TEMPLATE = {
    name: "commerce-home",
    description: "Venia PWA Studio sample home page. Static authorable marketing content (hero banner, category promo tiles, two side-by-side promos). Header, footer, and the Top Sellers product grid are dynamic commerce regions excluded from authoring.",
    urls: [
      "https://venia.magento.com/"
    ],
    blocks: [
      {
        name: "hero-banner",
        instances: [".venia-home-slider"]
      },
      {
        name: "cards-promo",
        instances: [".venia-home-callout"]
      },
      {
        name: "columns-feature",
        instances: [".venia-home-banner-a-content", ".venia-home-banner-a-image"]
      },
      {
        name: "columns-dark",
        instances: [".venia-home-banner-b-image", ".venia-home-banner-b-content"],
        section: "dark"
      }
    ],
    sections: [
      {
        id: "section-1",
        name: "Hero banner",
        selector: ".venia-home-row-1 .venia-home-slider",
        style: null,
        blocks: ["hero-banner"],
        defaultContent: []
      },
      {
        id: "section-2",
        name: "Category promo tiles",
        selector: ".venia-home-callout",
        style: null,
        blocks: ["cards-promo"],
        defaultContent: []
      },
      {
        id: "section-3",
        name: "Signature heels promo",
        selector: ".venia-home-banner-a-content",
        style: null,
        blocks: ["columns-feature"],
        defaultContent: []
      },
      {
        id: "section-4",
        name: "Vacations promo (dark)",
        selector: ".venia-home-banner-b-image",
        style: "dark",
        blocks: ["columns-dark"],
        defaultContent: []
      },
      {
        id: "section-5",
        name: "Top Sellers heading",
        selector: ".venia-home-row-2",
        style: null,
        blocks: [],
        defaultContent: [".venia-home-row-2 h2"]
      }
    ]
  };
  var parsers = {
    "hero-banner": parse,
    "cards-promo": parse2,
    "columns-feature": parse3,
    "columns-dark": parse4
  };
  var transformers = [
    transform,
    ...PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length > 1 ? [transform2] : []
  ];
  function executeTransformers(hookName, element, payload) {
    const enhancedPayload = __spreadProps(__spreadValues({}, payload), {
      template: PAGE_TEMPLATE
    });
    transformers.forEach((transformerFn) => {
      try {
        transformerFn.call(null, hookName, element, enhancedPayload);
      } catch (e) {
        console.error(`Transformer failed at ${hookName}:`, e);
      }
    });
  }
  function findBlocksOnPage(document2, template) {
    const pageBlocks = [];
    template.blocks.forEach((blockDef) => {
      blockDef.instances.forEach((selector) => {
        const elements = document2.querySelectorAll(selector);
        if (elements.length === 0) {
          console.warn(`Block "${blockDef.name}" selector not found: ${selector}`);
        }
        elements.forEach((element) => {
          pageBlocks.push({
            name: blockDef.name,
            selector,
            element,
            section: blockDef.section || null
          });
        });
      });
    });
    console.log(`Found ${pageBlocks.length} block instances on page`);
    return pageBlocks;
  }
  var import_commerce_home_default = {
    transform: (payload) => {
      const { document: document2, url, params } = payload;
      const main = document2.body;
      executeTransformers("beforeTransform", main, payload);
      const pageBlocks = findBlocksOnPage(document2, PAGE_TEMPLATE);
      pageBlocks.forEach((block) => {
        const parser = parsers[block.name];
        if (parser) {
          try {
            parser(block.element, { document: document2, url, params });
          } catch (e) {
            console.error(`Failed to parse ${block.name} (${block.selector}):`, e);
          }
        } else {
          console.warn(`No parser found for block: ${block.name}`);
        }
      });
      executeTransformers("afterTransform", main, payload);
      const hr = document2.createElement("hr");
      main.appendChild(hr);
      WebImporter.rules.createMetadata(main, document2);
      WebImporter.rules.transformBackgroundImages(main, document2);
      WebImporter.rules.adjustImageUrls(main, url, params.originalURL);
      const rawPath = new URL(params.originalURL).pathname.replace(/\/$/, "").replace(/\.html$/, "");
      const path = WebImporter.FileUtils.sanitizePath(rawPath || "/index");
      return [{
        element: main,
        path,
        report: {
          title: document2.title,
          template: PAGE_TEMPLATE.name,
          blocks: pageBlocks.map((b) => b.name)
        }
      }];
    }
  };
  return __toCommonJS(import_commerce_home_exports);
})();
