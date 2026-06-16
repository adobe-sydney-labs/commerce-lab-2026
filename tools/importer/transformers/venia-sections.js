/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: Venia section breaks and section metadata.
 *
 * Driven entirely by payload.template.sections from page-templates.json
 * (template "commerce-home", 5 sections). For each section it:
 *   - inserts an <hr> section break before the section (except the first), and
 *   - appends a "Section Metadata" block (style cell) for any section that
 *     declares a `style` (e.g. the "dark" vacations promo).
 *
 * Section selectors come from page-templates.json, which were derived from the
 * captured DOM (migration-work/cleaned.html): .venia-home-row-1 .venia-home-slider,
 * .venia-home-callout, .venia-home-banner-a-content, .venia-home-banner-b-image,
 * .venia-home-row-2.
 *
 * Runs in afterTransform only.
 */

export default function transform(hookName, element, payload) {
  if (hookName === 'afterTransform') {
    const template = payload && payload.template ? payload.template : null;
    const sections = template && Array.isArray(template.sections) ? template.sections : [];
    if (sections.length < 2) return;

    const doc = (payload && payload.document) || element.ownerDocument || document;

    const trySelector = (selector) => {
      if (!selector) return null;
      try {
        return element.querySelector(selector);
      } catch (e) {
        return null;
      }
    };

    // WebImporter.Blocks.createBlock emits a <table> whose first cell holds the
    // block name in Title Case (e.g. "cards-promo" -> "Cards Promo"). Match a
    // block table by that header text.
    const toBlockTitle = (name) => name
      .replace(/-/g, ' ')
      .replace(/\s(.)/g, (s) => s.toUpperCase())
      .replace(/^(.)/, (s) => s.toUpperCase());

    const findBlockTable = (blockName) => {
      const title = toBlockTitle(blockName);
      const tables = element.querySelectorAll('table');
      for (const table of tables) {
        const firstCell = table.querySelector('tr td, tr th');
        if (firstCell && firstCell.textContent.trim() === title) return table;
      }
      return null;
    };

    // Resolve the boundary element for each section. This runs in afterTransform,
    // by which point the block parsers have already replaced the original section
    // markup (e.g. .venia-home-callout) with a block <table>. So try the original
    // selector first, then fall back to locating the section's block table.
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

    // Process in reverse order so earlier insertions do not shift the anchors
    // of later (already-processed) sections.
    for (let i = sections.length - 1; i >= 0; i -= 1) {
      const section = sections[i];
      if (!section) continue;
      const sectionEl = resolveSectionEl(section);
      if (!sectionEl) continue;

      // Section Metadata block for sections that declare a style.
      if (section.style) {
        const metaBlock = WebImporter.Blocks.createBlock(doc, {
          name: 'Section Metadata',
          cells: { style: section.style },
        });
        if (sectionEl.parentNode) {
          sectionEl.parentNode.insertBefore(metaBlock, sectionEl.nextSibling);
        }
      }

      // Section break before every section except the first.
      if (i > 0) {
        const hr = doc.createElement('hr');
        if (sectionEl.parentNode) {
          sectionEl.parentNode.insertBefore(hr, sectionEl);
        }
      }
    }
  }
}
