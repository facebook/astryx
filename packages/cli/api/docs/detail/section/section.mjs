// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file docs.detail.section leaf — load a single named section of a topic.
 *
 * @input A topic name, a section query, and optional {lang, zh, dense}. Resolves
 *   and loads the topic via the shared adapter, then finds the first section
 *   whose title contains the (case-insensitive) query.
 * @output { type: 'docs.detail.section', data: ReferenceSection } — matching
 *   `xds --json docs <topic> <section>`. Throws ERR_UNKNOWN_SECTION when no
 *   section title matches.
 * @position Leaf nested under api/docs/detail. Shares discovery/loading/
 *   topic-resolution with the detail leaf via _adapter.mjs.
 */

import {AstryxError} from '../../../error.mjs';
import {ERROR_CODES} from '../../../../lib/error-codes.mjs';
import {resolveTopicDocs} from '../../_adapter.mjs';

/**
 * @param {string} topic
 * @param {string} sectionName
 * @param {object} [options]
 * @param {string} [options.lang]
 * @param {boolean} [options.zh]
 * @param {boolean} [options.dense]
 * @returns {Promise<import('../../docs.type.mjs').DocsDetailSectionResponse>}
 */
export async function section(topic, sectionName, options = {}) {
  const {docsData} = await resolveTopicDocs(topic, options);

  const normalizedSection = sectionName.toLowerCase();
  const match = docsData.sections.find(s => s.title.toLowerCase().includes(normalizedSection));
  if (!match) {
    throw new AstryxError(
      `Section "${sectionName}" not found in "${topic}"`,
      docsData.sections.map(s => ({name: s.title, reason: 'available section'})),
      ERROR_CODES.ERR_UNKNOWN_SECTION,
    );
  }
  return {type: 'docs.detail.section', data: match};
}
