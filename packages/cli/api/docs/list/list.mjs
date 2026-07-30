// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file docs.list leaf — enumerate the available reference-doc topics.
 *
 * @input Reads packages/cli/docs/{topic}.doc.mjs via the shared adapter's
 *   topic discovery. Each topic's English `description` is read directly; the
 *   listing never applies --dense/--zh overlays.
 * @output { type: 'docs.list', data: DocsListEntry[] } — one entry per topic,
 *   in filesystem-discovery order, matching `xds --json docs`.
 * @position Leaf under api/docs. Sibling of detail; both share _adapter.mjs.
 */

import {pathToFileURL} from 'node:url';
import {discoverTopics} from '../_adapter.mjs';

/**
 * @returns {Promise<import('../../../types/docs').DocsListResponse>}
 */
export async function list() {
  const topics = discoverTopics();
  /** @type {Array<import('../../../types/docs').DocsListEntry>} */
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
