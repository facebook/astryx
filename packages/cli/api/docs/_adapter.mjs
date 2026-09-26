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
 * @position Sits beside docs.mjs (api/docs/). Hands topics to
 *   foundation/doc-compiler (which loads their files) and memoizes the nodes
 *   per catalog, so no leaf, doctor check or search loads, merges, or resolves
 *   docs on its own. Discovery itself lives in
 *   foundation/discovery/docs-discovery, which the catalog comes from.
 */

import {Project} from '../../foundation/config/project.mjs';
import {DocsCatalog} from '../../foundation/discovery/docs-discovery.mjs';
import {
  linkReferenceTopic,
  lowerReferenceTopic,
} from '../../foundation/doc-compiler/compile.mjs';
import {
  deepFreeze,
  loadTopicInput,
  OVERLAY_LANGUAGES,
  overlayLanguages,
} from '../../foundation/doc-compiler/read.mjs';
import {AstryxError} from '../error.mjs';
import {ERROR_CODES} from '../../foundation/response/error-codes.mjs';

export {OVERLAY_LANGUAGES, overlayLanguages};

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
 * The overlay a read applies: none for the authored language.
 * @param {string | null | undefined} lang
 * @returns {string | null}
 */
function overlayLanguage(lang) {
  return lang && lang !== 'en' ? lang : null;
}

/** @type {WeakMap<DocsCatalog, Map<string, Promise<import('../../foundation/doc-compiler/compile.mjs').CompiledReferenceNode>>>} */
const loweredByCatalog = new WeakMap();

/**
 * One topic, lowered for `lang`: overlaid, extensions merged, keys stamped.
 * Memoized per catalog, so a read that references a topic twice loads it once.
 * Every read of the catalog shares the memoized node, so it is frozen; the
 * lenses hand readers copies.
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
    lowered = loadTopicInput(entry, overlay).then(input =>
      deepFreeze(lowerReferenceTopic(input)),
    );
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
