// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Programmatic API for the docs command.
 *
 * Dispatcher + barrel. `docs()` routes by argument shape into one of four
 * leaves, each projecting into a single { type, data } envelope:
 *
 *   docs()                          -> list    -> docs.list
 *   docs(topic)                     -> index   -> docs.index
 *   docs(topic, undefined, {detail: 'full'}) -> detail -> docs.detail
 *   docs(topic, section)            -> section -> docs.detail.section
 *
 * Reads are progressive: the topic list, then one topic's section index, then
 * one section by its key, or the whole topic on request. The leaves live in
 * list/, index/, detail/, and detail/section/; the discovery, overlay loading,
 * and topic resolution they share sit in _adapter.mjs.
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
 * @param {'full' | 'compact' | 'brief'} [options.detail]
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
  if (options.detail === 'full') return detail(topic, options);
  return index(topic, options);
}
