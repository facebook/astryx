// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file docs.detail leaf — load one topic's full reference doc.
 *
 * @input A topic name plus optional {lang, zh, dense}. Resolves and loads the
 *   topic via the shared adapter, then inlines any token-ref blocks.
 * @output { type: 'docs.detail', data: ReferenceDoc } — the full doc with
 *   token-refs resolved, matching `xds --json docs <topic>`.
 * @position Leaf under api/docs. Owns resolveTokenRefs (used only here); shares
 *   discovery/loading/topic-resolution with the section leaf via _adapter.mjs.
 */

import {pathToFileURL} from 'node:url';
import {resolveTopicDocs} from '../_adapter.mjs';

/**
 * Resolve token-ref blocks by inlining the referenced section's table.
 * This allows section docs to reference token tables without duplicating data.
 * @param {import('../../../types/docs').DocsDetailResponse['data']} docsData
 * @param {Record<string, string>} topics
 * @returns {Promise<import('../../../types/docs').DocsDetailResponse['data']>}
 */
async function resolveTokenRefs(docsData, topics) {
  const resolved = {...docsData, sections: [...docsData.sections]};
  for (let si = 0; si < resolved.sections.length; si++) {
    const section = resolved.sections[si];
    /** @type {import('../../../../core/src/docs-types').ContentBlock[]} */
    const newContent = [];
    for (const block of section.content) {
      if (block.type === 'token-ref') {
        const refPath = topics[block.topic];
        if (!refPath) {
          newContent.push({type: 'prose', text: `[token-ref: unknown topic "${block.topic}"]`});
          continue;
        }
        const refMod = await import(pathToFileURL(refPath).href);
        const refDocs = refMod.docs;
        const refSection = refDocs.sections.find(
          (/** @type {import('../../../../core/src/docs-types').ReferenceSection} */ s) =>
            s.title.toLowerCase() === block.section.toLowerCase(),
        );
        if (!refSection) {
          newContent.push({type: 'prose', text: `[token-ref: section "${block.section}" not found in "${block.topic}"]`});
          continue;
        }
        // Inline the referenced section's content blocks (tables, prose, etc.)
        // and carry over the previewType
        for (const refBlock of refSection.content) {
          newContent.push(refBlock);
        }
        // If the referenced section has a previewType, attach it to our section
        if (refSection.previewType && !section.previewType) {
          resolved.sections[si] = {...section, previewType: refSection.previewType, content: newContent};
        }
      } else {
        newContent.push(block);
      }
    }
    if (resolved.sections[si] === section) {
      resolved.sections[si] = {...section, content: newContent};
    } else {
      resolved.sections[si].content = newContent;
    }
  }
  return resolved;
}

/**
 * @param {string} topic
 * @param {object} [options]
 * @param {string} [options.lang]
 * @param {boolean} [options.zh]
 * @param {boolean} [options.dense]
 * @returns {Promise<import('../../../types/docs').DocsDetailResponse>}
 */
export async function detail(topic, options = {}) {
  const {topics, docsData} = await resolveTopicDocs(topic, options);
  const resolved = await resolveTokenRefs(docsData, topics);
  return {type: 'docs.detail', data: resolved};
}
