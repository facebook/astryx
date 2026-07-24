// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Programmatic API for the docs command.
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import {pathToFileURL} from 'node:url';
import {CLI_ROOT} from '../utils/paths.mjs';
import {AstryxError} from './error.mjs';
import {ERROR_CODES} from '../lib/error-codes.mjs';

const DOCS_DIR = path.join(CLI_ROOT, 'docs');

/**
 * @returns {Record<string, string>}
 */
function discoverTopics() {
  /** @type {Record<string, string>} */
  const topics = {};
  if (!fs.existsSync(DOCS_DIR)) return topics;
  for (const file of fs.readdirSync(DOCS_DIR)) {
    const match = file.match(/^([\w-]+)\.doc\.mjs$/);
    if (match) topics[match[1]] = path.join(DOCS_DIR, file);
  }
  return topics;
}

/**
 * @param {string} docPath
 * @param {{lang?: string|null}} [opts]
 * @returns {Promise<import('../types/docs').DocsDetailResponse['data']>}
 */
async function loadReferenceDocs(docPath, {lang} = {}) {
  const mod = await import(pathToFileURL(docPath).href);
  const docs = mod.docs;
  if (!lang || lang === 'en') return docs;

  const dir = path.dirname(docPath);
  const base = path.basename(docPath, '.doc.mjs');
  const locale = lang === 'dense' ? 'dense' : lang;
  const translationPath = path.join(dir, `${base}.doc.${locale}.mjs`);
  if (!fs.existsSync(translationPath)) return docs;

  const translationMod = await import(pathToFileURL(translationPath).href);
  const translation = translationMod.docsZh || translationMod.docsDense;
  if (!translation) return docs;

  // Overlays are keyed to a base section by title (`section`), not by array
  // position. Position-keying silently grafted each overlay title onto whatever
  // base section happened to share its index, so an overlay that omitted or
  // reordered a section corrupted every section after it — `docs tokens --dense`
  // printed the colour table under a "Spacing" heading (#2182). An overlay may
  // now cover any subset of sections, in any order; sections it does not name
  // keep their base content.
  /** @type {Map<string, any>} */
  const bySection = new Map();
  for (const ts of translation.sections ?? []) {
    if (ts?.section != null) bySection.set(ts.section, ts);
  }

  return {
    ...docs,
    description: translation.description || docs.description,
    sections: docs.sections.map(
      (/** @type {import('../../../core/src/docs-types').ReferenceSection} */ section) => {
        const ts = bySection.get(section.title);
        if (!ts) return section;
        return {
          ...section,
          title: ts.title || section.title,
          content: section.content.map(
            (
              /** @type {import('../../../core/src/docs-types').ContentBlock} */ block,
              /** @type {number} */ bi,
            ) => {
              const tb = ts.content?.[bi];
              if (!tb) return block;
              if (tb.type === 'prose' && block.type === 'prose') return {...block, text: tb.text};
              if (tb.type === 'list' && block.type === 'list') return {...block, items: tb.items};
              return block;
            },
          ),
        };
      },
    ),
  };
}

/**
 * Resolve token-ref blocks by inlining the referenced section's table.
 * This allows section docs to reference token tables without duplicating data.
 * @param {import('../types/docs').DocsDetailResponse['data']} docsData
 * @param {Record<string, string>} topics
 * @returns {Promise<import('../types/docs').DocsDetailResponse['data']>}
 */
async function resolveTokenRefs(docsData, topics) {
  const resolved = {...docsData, sections: [...docsData.sections]};
  for (let si = 0; si < resolved.sections.length; si++) {
    const section = resolved.sections[si];
    /** @type {import('../../../core/src/docs-types').ContentBlock[]} */
    const newContent = [];
    for (const block of section.content) {
      if (block.type === 'token-ref') {
        const refPath = topics[block.topic];
        if (!refPath) {
          newContent.push({type: 'prose', text: `[token-ref: unknown topic "${block.topic}"]`});
          continue;
        }
        const refMod = await import(pathToFileURL(refPath).href);
        const refDocs = refMod.docs;
        const refSection = refDocs.sections.find(
          (/** @type {import('../../../core/src/docs-types').ReferenceSection} */ s) =>
            s.title.toLowerCase() === block.section.toLowerCase(),
        );
        if (!refSection) {
          newContent.push({type: 'prose', text: `[token-ref: section "${block.section}" not found in "${block.topic}"]`});
          continue;
        }
        // Inline the referenced section's content blocks (tables, prose, etc.)
        // and carry over the previewType
        for (const refBlock of refSection.content) {
          newContent.push(refBlock);
        }
        // If the referenced section has a previewType, attach it to our section
        if (refSection.previewType && !section.previewType) {
          resolved.sections[si] = {...section, previewType: refSection.previewType, content: newContent};
        }
      } else {
        newContent.push(block);
      }
    }
    if (resolved.sections[si] === section) {
      resolved.sections[si] = {...section, content: newContent};
    } else {
      resolved.sections[si].content = newContent;
    }
  }
  return resolved;
}

/**
 * @param {string} [topic]
 * @param {string} [section]
 * @param {object} [options]
 * @param {string} [options.lang]
 * @param {boolean} [options.zh]
 * @param {boolean} [options.dense]
 * @returns {Promise<
 *   import('../types/docs').DocsListResponse |
 *   import('../types/docs').DocsDetailResponse |
 *   import('../types/docs').DocsDetailSectionResponse
 * >}
 */
export async function docs(topic, section, options = {}) {
  const {lang = null, zh = false, dense = false} = options;
  const effectiveLang = lang || (dense ? 'dense' : zh ? 'zh' : null);
  const topics = discoverTopics();

  if (!topic) {
    /** @type {Array<import('../types/docs').DocsListEntry>} */
    const entries = [];
    for (const [name, docPath] of Object.entries(topics)) {
      try {
        const mod = await import(pathToFileURL(docPath).href);
        entries.push({topic: name, description: mod.docs.description});
      } catch {
        entries.push({topic: name, description: ''});
      }
    }
    return {type: 'docs.list', data: entries};
  }

  const normalized = topic.toLowerCase();
  if (!topics[normalized]) {
    throw new AstryxError(
      `Unknown topic "${topic}"`,
      Object.keys(topics).map(t => ({name: t, reason: 'available topic'})),
      ERROR_CODES.ERR_UNKNOWN_TOPIC,
    );
  }

  const docsData = await loadReferenceDocs(topics[normalized], {lang: effectiveLang});

  if (section) {
    const normalizedSection = section.toLowerCase();
    const match = docsData.sections.find(s => s.title.toLowerCase().includes(normalizedSection));
    if (!match) {
      throw new AstryxError(
        `Section "${section}" not found in "${topic}"`,
        docsData.sections.map(s => ({name: s.title, reason: 'available section'})),
        ERROR_CODES.ERR_UNKNOWN_SECTION,
      );
    }
    return {type: 'docs.detail.section', data: match};
  }

  const resolved = await resolveTokenRefs(docsData, topics);
  return {type: 'docs.detail', data: resolved};
}
