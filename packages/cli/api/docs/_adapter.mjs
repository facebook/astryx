// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Shared doc-loading and topic-resolution helpers for the docs leaves.
 *
 * @input packages/cli/assets/docs/{topic}.doc.mjs and, when a --dense/--zh overlay is
 *   requested, the sibling {topic}.doc.dense.mjs / {topic}.doc.zh.mjs.
 * @output Topic discovery map, overlay-merged reference-doc data, and a combined
 *   resolve step ({topics, docsData}) that the detail and section leaves share.
 * @position Sits beside docs.mjs (api/docs/). Owns everything ≥2 leaves need so
 *   no leaf re-implements discovery, overlay merging, or unknown-topic handling.
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import {pathToFileURL} from 'node:url';
import {CLI_ROOT} from '../../foundation/fs/paths.mjs';
import {AstryxError} from '../error.mjs';
import {ERROR_CODES} from '../../foundation/response/error-codes.mjs';

const DOCS_DIR = path.join(CLI_ROOT, 'assets', 'docs');

/**
 * @returns {Record<string, string>}
 */
export function discoverTopics() {
  /** @type {Record<string, string>} */
  const topics = Object.create(null);
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
 * @returns {Promise<import('./docs.type.mjs').DocsDetailResponse['data']>}
 */
export async function loadReferenceDocs(docPath, {lang} = {}) {
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
      (/** @type {import('@astryxdesign/cli/authoring').ReferenceSection} */ section) => {
        const ts = bySection.get(section.title);
        if (!ts) return section;
        return {
          ...section,
          title: ts.title || section.title,
          content: section.content.map(
            (
              /** @type {import('@astryxdesign/cli/authoring').ReferenceContentBlock} */ block,
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
 * Discover topics, resolve `topic` to its doc file (throwing `ERR_UNKNOWN_TOPIC`
 * when unmatched), and load that topic's reference doc with any --dense/--zh
 * overlay applied. Shared by the detail and section leaves so topic normalization
 * and unknown-topic handling live in exactly one place.
 *
 * @param {string} topic
 * @param {object} [options]
 * @param {string} [options.lang]
 * @param {boolean} [options.zh]
 * @param {boolean} [options.dense]
 * @returns {Promise<{
 *   topics: Record<string, string>,
 *   docsData: import('./docs.type.mjs').DocsDetailResponse['data'],
 * }>}
 */
export async function resolveTopicDocs(topic, options = {}) {
  const {lang = null, zh = false, dense = false} = options;
  const effectiveLang = lang || (dense ? 'dense' : zh ? 'zh' : null);
  const topics = discoverTopics();

  // A public API caller could pass a non-string topic; `.toLowerCase()` below
  // would throw a raw TypeError (no ERR_* code → downgrades to ERR_UNKNOWN).
  // Surface the same stable code the unknown-topic path uses.
  if (typeof topic !== 'string') {
    throw new AstryxError(
      `Unknown topic "${String(topic)}"`,
      Object.keys(topics).map(t => ({name: t, reason: 'available topic'})),
      ERROR_CODES.ERR_UNKNOWN_TOPIC,
    );
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
  return {topics, docsData};
}
