// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Shared doc-loading and topic-resolution helpers for the docs leaves.
 *
 * @input The project's doc catalog — the CLI's own
 *   packages/cli/assets/docs/{topic}.doc.mjs plus every topic the configured
 *   integrations contribute — and, when a --dense/--zh overlay is requested,
 *   the sibling {topic}.doc.dense.mjs / {topic}.doc.zh.mjs.
 * @output Catalog access, the compiler input for a topic, and the compiled
 *   node for it: lowered (overlaid, extensions merged, keys stamped) or linked
 *   (token references resolved too), memoized per catalog.
 * @position Sits beside docs.mjs (api/docs/). Loads authored files and hands
 *   them to foundation/doc-compiler, so no leaf, doctor check or search loads,
 *   merges, or resolves docs on its own. Discovery itself lives in
 *   foundation/discovery/docs-discovery, which the catalog comes from.
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import {pathToFileURL} from 'node:url';
import {Project} from '../../foundation/config/project.mjs';
import {DocsCatalog} from '../../foundation/discovery/docs-discovery.mjs';
import {
  linkReferenceTopic,
  lowerReferenceTopic,
} from '../../foundation/doc-compiler/compile.mjs';
import {AstryxError} from '../error.mjs';
import {ERROR_CODES} from '../../foundation/response/error-codes.mjs';
import {parseDoc} from '../../authoring/doctypes/parse.mjs';

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

/** The localized overlays a docs read can apply. */
export const OVERLAY_LANGUAGES = ['zh', 'dense'];

/**
 * Where the `lang` overlay of a doc file lives: `{topic}.doc.{lang}.mjs`.
 * @param {string} docPath
 * @param {string} lang
 * @returns {string}
 */
function overlayPath(docPath, lang) {
  return path.join(
    path.dirname(docPath),
    `${path.basename(docPath, '.doc.mjs')}.doc.${lang}.mjs`,
  );
}

/**
 * The overlay languages a topic ships for its own file or any extension.
 * @param {import('../../foundation/discovery/docs-discovery.mjs').DocsTopicEntry} entry
 * @returns {string[]}
 */
export function overlayLanguages(entry) {
  const files = [entry.path, ...entry.extensions.map(ext => ext.path)];
  return OVERLAY_LANGUAGES.filter(lang =>
    files.some(file => fs.existsSync(overlayPath(file, lang))),
  );
}

/**
 * The overlay a read applies: none for the authored language.
 * @param {string | null | undefined} lang
 * @returns {string | null}
 */
function overlayLanguage(lang) {
  return lang && lang !== 'en' ? lang : null;
}

/**
 * Load one authored file and the overlay for `lang`. A failure is recorded on
 * the result, not thrown, so the compiler reports it in reading order.
 * @param {string} docPath
 * @param {string | null} lang
 * @returns {Promise<import('../../foundation/doc-compiler/compile.mjs').AuthoredFile>}
 */
async function loadAuthoredFile(docPath, lang) {
  const file = path.basename(docPath);
  let doc;
  try {
    const mod = await import(pathToFileURL(docPath).href);
    doc = parseDoc(mod.docs ?? mod.default, file);
  } catch (error) {
    return {file, error};
  }
  if (!lang) return {file, doc};
  const translationPath = overlayPath(docPath, lang);
  if (!fs.existsSync(translationPath)) return {file, doc};
  try {
    const translationMod = await import(pathToFileURL(translationPath).href);
    return {
      file,
      doc,
      overlay: translationMod.docsZh || translationMod.docsDense || null,
    };
  } catch (overlayError) {
    return {file, doc, overlayError};
  }
}

/**
 * Everything the compiler needs for one topic, read from disk.
 * @param {import('../../foundation/discovery/docs-discovery.mjs').DocsTopicEntry} entry
 * @param {string | null} lang
 * @returns {Promise<import('../../foundation/doc-compiler/compile.mjs').ReferenceTopicInput>}
 */
async function loadCompilerInput(entry, lang) {
  const extensions = [];
  for (const extension of entry.extensions) {
    extensions.push({
      ...(await loadAuthoredFile(extension.path, lang)),
      provider: extension.package,
    });
  }
  return {
    id: entry.name,
    provider: entry.package,
    replaces: entry.replaces ?? null,
    lang,
    base: await loadAuthoredFile(entry.path, lang),
    extensions,
  };
}

/** @type {WeakMap<DocsCatalog, Map<string, Promise<import('../../foundation/doc-compiler/compile.mjs').CompiledReferenceNode>>>} */
const loweredByCatalog = new WeakMap();

/**
 * One topic, lowered for `lang`: overlaid, extensions merged, keys stamped.
 * Memoized per catalog, so a read that references a topic twice loads it once.
 * @param {DocsCatalog} catalog
 * @param {import('../../foundation/discovery/docs-discovery.mjs').DocsTopicEntry} entry
 * @param {string | null} [lang]
 * @returns {Promise<import('../../foundation/doc-compiler/compile.mjs').CompiledReferenceNode>}
 */
export function lowerTopic(catalog, entry, lang = null) {
  const overlay = overlayLanguage(lang);
  let cache = loweredByCatalog.get(catalog);
  if (!cache) {
    cache = new Map();
    loweredByCatalog.set(catalog, cache);
  }
  const key = `${entry.name.toLowerCase()}\u0000${overlay ?? ''}`;
  let lowered = cache.get(key);
  if (!lowered) {
    lowered = loadCompilerInput(entry, overlay).then(lowerReferenceTopic);
    cache.set(key, lowered);
  }
  return lowered;
}

/**
 * How a token reference finds its target: the topic it names in `catalog`,
 * lowered for the same language.
 * @param {DocsCatalog} catalog
 * @param {string | null} lang
 * @returns {(topic: string) => Promise<import('../../foundation/doc-compiler/compile.mjs').CompiledReferenceNode | null>}
 */
export function referenceTargets(catalog, lang) {
  return async topic => {
    const target = catalog.resolve(topic);
    return target ? lowerTopic(catalog, target, lang) : null;
  };
}

/**
 * One topic, compiled for `lang`: lowered, then every token reference linked.
 * @param {DocsCatalog} catalog
 * @param {import('../../foundation/discovery/docs-discovery.mjs').DocsTopicEntry} entry
 * @param {string | null} [lang]
 * @returns {Promise<import('../../foundation/doc-compiler/compile.mjs').CompiledReferenceNode>}
 */
export async function compileTopic(catalog, entry, lang = null) {
  return linkReferenceTopic(
    await lowerTopic(catalog, entry, lang),
    referenceTargets(catalog, lang),
  );
}

/**
 * Resolve `topic` against the project's catalog (throwing `ERR_UNKNOWN_TOPIC`
 * when unmatched) and lower it with any --dense/--zh overlay and any
 * integration extension applied. Shared by the leaves so topic normalization
 * and unknown-topic handling live in exactly one place.
 *
 * @param {string} topic
 * @param {object} [options]
 * @param {string} [options.lang]
 * @param {boolean} [options.zh]
 * @param {boolean} [options.dense]
 * @param {string} [options.cwd]
 * @returns {Promise<{
 *   catalog: DocsCatalog,
 *   node: import('../../foundation/doc-compiler/compile.mjs').CompiledReferenceNode,
 *   lang: string | null,
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

  const node = await lowerTopic(catalog, entry, effectiveLang);
  return {catalog, node, lang: effectiveLang};
}
