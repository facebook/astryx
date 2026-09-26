// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Programmatic API for the docs command.
 *
 * Dispatcher + barrel. `docs()` routes by argument shape into one of four
 * leaves, each projecting into a single { type, data } envelope:
 *
 *   docs()                                -> list    -> docs.list
 *   docs(topic)                           -> detail  -> docs.detail
 *   docs(topic, undefined, {index: true}) -> index   -> docs.index
 *   docs(topic, section)                  -> section -> docs.detail.section
 *
 * A topic read returns the whole doc, as it always has. The index is how a
 * reader works progressively instead: list the topic's sections, then read one
 * by its key. The leaves live in list/, index/, detail/, and detail/section/;
 * the discovery, overlay loading, and topic resolution they share sit in
 * _adapter.mjs.
 */

import {list} from './list/list.mjs';
import {index} from './index/index.mjs';
import {detail} from './detail/detail.mjs';
import {section as sectionLeaf} from './detail/section/section.mjs';

export {list, index, detail, sectionLeaf as section};

/**
 * @param {string} [topic]
 * @param {string} [section]
 * @param {object} [options]
 * @param {string} [options.lang]
 * @param {boolean} [options.zh]
 * @param {boolean} [options.dense]
 * @param {boolean} [options.index] return the topic's section index instead of
 *   the whole doc
 * @param {string} [options.cwd]
 * @returns {Promise<
 *   import('./docs.type.mjs').DocsListResponse |
 *   import('./docs.type.mjs').DocsIndexResponse |
 *   import('./docs.type.mjs').DocsDetailResponse |
 *   import('./docs.type.mjs').DocsDetailSectionResponse
 * >}
 */
export async function docs(topic, section, options = {}) {
  if (!topic) return list(options);
  if (section) return sectionLeaf(topic, section, options);
  if (options.index) return index(topic, options);
  return detail(topic, options);
}
