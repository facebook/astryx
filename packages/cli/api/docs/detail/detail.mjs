// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file docs.detail leaf — load one topic's full reference doc.
 *
 * @input A topic name plus optional {lang, zh, dense, cwd}. Resolves the topic
 *   via the shared adapter and compiles it with its token references linked.
 * @output { type: 'docs.detail', data: ReferenceDoc } — the full doc with
 *   token-refs inlined, matching `astryx --json docs <topic>`.
 * @position Leaf under api/docs. Reads the compiled node through the detail
 *   lens; resolution, overlays and extensions happen in the compiler.
 */

import {linkReferenceTopic} from '../../../foundation/doc-compiler/compile.mjs';
import {detailView} from '../../../foundation/doc-compiler/lenses.mjs';
import {referenceTargets, resolveTopicDocs} from '../_adapter.mjs';

/**
 * @param {string} topic
 * @param {object} [options]
 * @param {string} [options.lang]
 * @param {boolean} [options.zh]
 * @param {boolean} [options.dense]
 * @param {string} [options.cwd]
 * @returns {Promise<import('../docs.type.mjs').DocsDetailResponse>}
 */
export async function detail(topic, options = {}) {
  const {catalog, node, lang} = await resolveTopicDocs(topic, options);
  const linked = await linkReferenceTopic(
    node,
    referenceTargets(catalog, lang),
  );
  return {type: 'docs.detail', data: detailView(linked)};
}
