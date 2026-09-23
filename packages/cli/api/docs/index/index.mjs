// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file docs.index leaf — the section index of one topic.
 *
 * @input A topic name plus optional {lang, zh, dense, cwd}. Resolves and loads
 *   the topic via the shared adapter.
 * @output { type: 'docs.index', data: DocsIndex } — the topic's name, title and
 *   description and, for each section, the key it is read by, its title, and a
 *   one-line summary. Matches `astryx --json docs <topic>`.
 * @position Leaf under api/docs, and the default read of a topic. One section is
 *   the section leaf (`docs <topic> <key>`); the whole topic is the detail leaf
 *   (`--detail full`).
 */

import {buildDocsIndexData} from '../../../foundation/discovery/docs-section-key.mjs';
import {resolveTopicDocs} from '../_adapter.mjs';

/**
 * @param {string} topic
 * @param {object} [options]
 * @param {string} [options.lang]
 * @param {boolean} [options.zh]
 * @param {boolean} [options.dense]
 * @param {string} [options.cwd]
 * @returns {Promise<import('../docs.type.mjs').DocsIndexResponse>}
 */
export async function index(topic, options = {}) {
  const {docsData} = await resolveTopicDocs(topic, options);
  return {type: 'docs.index', data: buildDocsIndexData(docsData)};
}
