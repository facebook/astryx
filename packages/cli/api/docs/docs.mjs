// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Programmatic API for the docs command.
 *
 * Dispatcher + barrel. `docs()` routes by argument shape into one of three
 * leaves, each projecting into a single { type, data } envelope:
 *
 *   docs()                 -> list    -> docs.list
 *   docs(topic)            -> detail  -> docs.detail
 *   docs(topic, section)   -> section -> docs.detail.section
 *
 * The leaves live in list/, detail/, and detail/section/; the discovery,
 * overlay loading, and topic resolution they share sit in _adapter.mjs. This
 * module keeps the same `docs` export (and re-exports the leaves) so
 * api/index.mjs and the CLI consumer import from here unchanged.
 */

import {list} from './list/list.mjs';
import {detail} from './detail/detail.mjs';
import {section as sectionLeaf} from './detail/section/section.mjs';

export {list, detail, sectionLeaf as section};

/**
 * @param {string} [topic]
 * @param {string} [section]
 * @param {object} [options]
 * @param {string} [options.lang]
 * @param {boolean} [options.zh]
 * @param {boolean} [options.dense]
 * @param {string} [options.cwd]
 * @returns {Promise<
 *   import('./docs.type.mjs').DocsListResponse |
 *   import('./docs.type.mjs').DocsDetailResponse |
 *   import('./docs.type.mjs').DocsDetailSectionResponse
 * >}
 */
export async function docs(topic, section, options = {}) {
  if (!topic) return list(options);
  if (section) return sectionLeaf(topic, section, options);
  return detail(topic, options);
}
