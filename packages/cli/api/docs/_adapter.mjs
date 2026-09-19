// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Shared doc-loading and topic-resolution helpers for the docs leaves.
 *
 * @input The project's doc catalog — the CLI's own
 *   packages/cli/assets/docs/{topic}.doc.mjs plus every topic the configured
 *   integrations contribute — and, when a --dense/--zh overlay is requested,
 *   the sibling {topic}.doc.dense.mjs / {topic}.doc.zh.mjs.
 * @output Catalog access, overlay- and extension-merged reference-doc data,
 *   and a combined resolve step ({catalog, docsData}) that the detail and
 *   section leaves share.
 * @position Sits beside docs.mjs (api/docs/). Owns everything ≥2 leaves need so
 *   no leaf re-implements resolution, overlay merging, or unknown-topic
 *   handling. Discovery itself lives in foundation/discovery/docs-discovery,
 *   which api/search and the agent-docs block read through the same catalog.
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import {pathToFileURL} from 'node:url';
import {Project} from '../../foundation/config/project.mjs';
import {
  DocsCatalog,
  mergeTopic,
} from '../../foundation/discovery/docs-discovery.mjs';
import {AstryxError} from '../error.mjs';
import {ERROR_CODES} from '../../foundation/response/error-codes.mjs';

/**
 * The project's topics: the built-in ones plus whatever the configured
 * integrations contribute.
 *
 * A docs read must not depend on a healthy project config. `astryx docs
 * tokens` answered without loading anything before integrations could
 * contribute topics, and it still answers when the config is unreadable — the
 * built-in topics are the floor, and the integration issues surface on the
 * commands that own them.
 *
 * @param {string} [cwd]
 * @returns {Promise<DocsCatalog>}
 */
export async function loadDocsCatalog(cwd = process.cwd()) {
  try {
    const project = await Project.load(cwd);
    return await project.docs();
  } catch {
    return DocsCatalog.fromBuiltins();
  }
}

/**
 * @param {string} docPath
 * @param {{lang?: string|null}} [opts]
 * @returns {Promise<import('./docs.type.mjs').DocsDetailResponse['data']>}
 */
export async function loadReferenceDocs(docPath, {lang} = {}) {
  const mod = await import(pathToFileURL(docPath).href);
  const docs = mod.docs ?? mod.default;
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
 * Load one catalog entry: its own doc, plus any extension an integration
 * merged onto it, in configuration order.
 *
 * A localization overlay applies to each file before the extensions are
 * merged, so an extension written in the base language stays readable under
 * `--dense`/`--zh` (it replaces its own sections and leaves the rest
 * translated) rather than being dropped.
 *
 * @param {import('../../foundation/discovery/docs-discovery.mjs').DocsTopicEntry} entry
 * @param {{lang?: string|null}} [opts]
 * @returns {Promise<import('./docs.type.mjs').DocsDetailResponse['data']>}
 */
export async function loadTopicDoc(entry, {lang} = {}) {
  let doc = await loadReferenceDocs(entry.path, {lang});
  for (const extension of entry.extensions) {
    doc = mergeTopic(doc, await loadReferenceDocs(extension.path, {lang}));
  }
  return doc;
}

/**
 * Resolve `topic` against the project's catalog (throwing `ERR_UNKNOWN_TOPIC`
 * when unmatched), and load it with any --dense/--zh overlay and any
 * integration extension applied. Shared by the detail and section leaves so
 * topic normalization and unknown-topic handling live in exactly one place.
 *
 * @param {string} topic
 * @param {object} [options]
 * @param {string} [options.lang]
 * @param {boolean} [options.zh]
 * @param {boolean} [options.dense]
 * @param {string} [options.cwd]
 * @returns {Promise<{
 *   catalog: DocsCatalog,
 *   docsData: import('./docs.type.mjs').DocsDetailResponse['data'],
 * }>}
 */
export async function resolveTopicDocs(topic, options = {}) {
  const {lang = null, zh = false, dense = false, cwd} = options;
  const effectiveLang = lang || (dense ? 'dense' : zh ? 'zh' : null);
  const catalog = await loadDocsCatalog(cwd);

  // A public API caller could pass a non-string topic; `resolve` answers
  // undefined for one, which lands on the same stable code as an unknown name
  // rather than a raw TypeError (which downgrades to ERR_UNKNOWN).
  const entry = catalog.resolve(topic);
  if (!entry) {
    throw new AstryxError(
      `Unknown topic "${String(topic)}"`,
      catalog.names().map(t => ({name: t, reason: 'available topic'})),
      ERROR_CODES.ERR_UNKNOWN_TOPIC,
    );
  }

  const docsData = await loadTopicDoc(entry, {lang: effectiveLang});
  return {catalog, docsData};
}
