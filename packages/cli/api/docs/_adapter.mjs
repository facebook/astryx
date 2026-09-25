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
import {loadDocsTree} from '../../foundation/doc-compiler/tree.mjs';
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
 * A guide the docs tree places, as a topic entry the topic readers open by its
 * route. It is never a flat topic: `astryx docs <route>` is its only name.
 * @param {import('../../foundation/doc-compiler/tree.mjs').TreeNode} node
 * @returns {import('../../foundation/discovery/docs-discovery.mjs').DocsTopicEntry}
 */
export function guideEntry(node) {
  return {
    name: node.route,
    package: node.provider,
    path: node.ref.topicFile,
    extensions: [],
    tree: true,
  };
}

/**
 * What a docs argument names: a topic (a flat one, or a guide the docs tree
 * places), a namespace or typed doc in the tree, or nothing. The flat catalog
 * answers first, so a topic read never builds the tree.
 * @param {unknown} topic
 * @param {{cwd?: string}} [options]
 * @returns {Promise<
 *   | {kind: 'topic', catalog: DocsCatalog, entry: import('../../foundation/discovery/docs-discovery.mjs').DocsTopicEntry}
 *   | {kind: 'node', catalog: DocsCatalog, tree: import('../../foundation/doc-compiler/tree.mjs').DocsTree, node: import('../../foundation/doc-compiler/tree.mjs').TreeNode}
 *   | {kind: 'unknown', catalog: DocsCatalog}
 * >}
 */
export async function resolveDocsArgument(topic, {cwd} = {}) {
  const catalog = await loadDocsCatalog(cwd);
  const entry = catalog.resolve(topic);
  if (entry) return {kind: 'topic', catalog, entry};
  if (typeof topic !== 'string' || topic === '')
    return {kind: 'unknown', catalog};
  const tree = await loadDocsTree();
  const node = tree.get(topic);
  if (!node) return {kind: 'unknown', catalog};
  if (node.kind === 'generic') {
    return {kind: 'topic', catalog, entry: guideEntry(node)};
  }
  return {kind: 'node', catalog, tree, node};
}

/**
 * The error for a docs argument that names nothing. For a route, it suggests
 * the children of the deepest namespace the route reaches; otherwise, every
 * topic and every top-level namespace.
 * @param {unknown} topic
 * @param {DocsCatalog} catalog
 * @returns {Promise<AstryxError>}
 */
export async function unknownTopicError(topic, catalog) {
  const tree = await loadDocsTree();
  /** @type {Array<{name: string, reason: string}>} */
  let suggestions = [];
  if (typeof topic === 'string' && topic.includes('/')) {
    const parts = topic.split('/');
    for (
      let depth = parts.length - 1;
      depth > 0 && suggestions.length === 0;
      depth--
    ) {
      const near = tree.get(parts.slice(0, depth).join('/'));
      if (near) {
        suggestions = near.slots.flatMap(slot =>
          slot.children.map(route => ({
            name: route,
            reason: tree.get(route)?.summary ?? '',
          })),
        );
      }
    }
  }
  if (suggestions.length === 0) {
    suggestions = [
      ...tree
        .roots()
        .map(root => ({name: root.route, reason: 'docs namespace'})),
      ...catalog.names().map(name => ({name, reason: 'available topic'})),
    ];
  }
  return new AstryxError(
    `Unknown topic "${String(topic)}"`,
    suggestions,
    ERROR_CODES.ERR_UNKNOWN_TOPIC,
  );
}

/**
 * Resolve a topic (a flat one, or a guide the docs tree places by its route)
 * and lower it for the topic readers.
 * @param {unknown} topic
 * @param {{lang?: string | null, zh?: boolean, dense?: boolean, cwd?: string}} [options]
 */
export async function resolveTopicDocs(topic, options = {}) {
  const {lang = null, zh = false, dense = false, cwd} = options;
  const effectiveLang = lang || (dense ? 'dense' : zh ? 'zh' : null);
  // A public API caller could pass a non-string topic; it lands on the same
  // stable code as an unknown name rather than a raw TypeError.
  const found = await resolveDocsArgument(topic, {cwd});
  if (found.kind !== 'topic') {
    throw found.kind === 'node'
      ? new AstryxError(
          `"${found.node.route}" is a ${found.node.kind === 'namespace' ? 'namespace' : `${found.node.kind} doc`} in the docs tree, not a topic. Read it with \`astryx docs ${found.node.route}\`.`,
          undefined,
          ERROR_CODES.ERR_UNKNOWN_TOPIC,
        )
      : await unknownTopicError(topic, found.catalog);
  }
  const {catalog, entry} = found;
  const node = await lowerTopic(catalog, entry, effectiveLang);
  return {catalog, node, lang: effectiveLang, entry};
}
