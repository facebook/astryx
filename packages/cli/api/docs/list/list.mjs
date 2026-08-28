// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file docs.list leaf — enumerate the available reference-doc topics.
 *
 * @input The project's doc catalog (built-in topics plus the ones configured
 *   integrations contribute), via the shared adapter. A built-in topic's
 *   English `description` is read from its file; a contributed topic already
 *   carries the one discovery read. The listing never applies --dense/--zh
 *   overlays.
 * @output { type: 'docs.list', data: DocsListEntry[] } — one entry per topic in
 *   read order, each naming the package that owns it, matching
 *   `astryx --json docs`.
 * @position Leaf under api/docs. Sibling of detail; both share _adapter.mjs.
 */

import {pathToFileURL} from 'node:url';
import {loadDocsCatalog} from '../_adapter.mjs';

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
      try {
        const mod = await import(pathToFileURL(entry.path).href);
        description = (mod.docs ?? mod.default)?.description ?? '';
      } catch {
        description = '';
      }
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
  return {type: 'docs.list', data: entries};
}
