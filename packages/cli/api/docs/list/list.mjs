// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file docs.list leaf — enumerate the available reference-doc topics.
 *
 * @input The project's doc catalog (built-in topics plus the ones configured
 *   integrations contribute), via the shared adapter. A built-in topic's
 *   English `description` is read from its file; a contributed topic already
 *   carries the one discovery read. The listing never applies --dense/--zh
 *   overlays.
 * @output { type: 'docs.list', data: DocsListEntry[] } — one entry per topic
 *   in read order, then one per top-level docs-tree namespace, each naming the
 *   package that owns it, matching `astryx --json docs`.
 * @position Leaf under api/docs. Sibling of detail; both share _adapter.mjs.
 */

import {loadTopicFile} from '../../../foundation/doc-compiler/read.mjs';
import {loadDocsCatalog, projectTree} from '../_adapter.mjs';

/**
 * @param {object} [options]
 * @param {string} [options.cwd]
 * @returns {Promise<import('../docs.type.mjs').DocsListResponse>}
 */
export async function list({cwd} = {}) {
  const catalog = await loadDocsCatalog(cwd);
  /** @type {Array<import('../docs.type.mjs').DocsListEntry>} */
  const entries = [];
  for (const entry of catalog.entries()) {
    let description = entry.description ?? '';
    if (entry.description == null) {
      const file = await loadTopicFile(entry.path, null);
      description = file.doc?.description ?? '';
    }
    /** @type {import('../docs.type.mjs').DocsListEntry} */
    const listed = {
      topic: entry.name,
      description,
      package: entry.package,
    };
    if (entry.replaces != null) listed.replaces = entry.replaces;
    entries.push(listed);
  }
  // Then the docs tree's top-level namespaces, the CLI's and each
  // integration's, each the way into a whole branch (spec:AST-046). After the
  // topics, so the first topic stays the first entry.
  const tree = await projectTree(catalog);
  for (const root of tree.roots()) {
    entries.push({
      topic: root.route,
      description: root.summary,
      package: root.provider,
      kind: 'namespace',
    });
  }
  // A package whose docs did not load is named, so its author knows why its
  // topics are missing.
  return catalog.issues.length === 0
    ? {type: 'docs.list', data: entries}
    : {type: 'docs.list', data: entries, meta: {notLoaded: [...catalog.issues]}};
}
