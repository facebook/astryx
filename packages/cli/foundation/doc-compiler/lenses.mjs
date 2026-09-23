// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Lenses — the docs API's response shapes, read off compiled nodes.
 *
 * @input A compiled reference node from ./compile.mjs: lowered for the index
 *   and for section lookup, linked for anything that inlines token references.
 * @output The `docs.detail` topic, the `docs.index` section index, one
 *   `docs.detail.section` section, and the sections as readers look them up.
 * @position Between the compiler and api/docs. A lens only projects: it never
 *   loads, merges, overlays, keys, or resolves a reference itself.
 */

import {
  buildDocsIndexData,
  withSourceTitle,
} from '../discovery/docs-section-key.mjs';

/**
 * @param {import('./compile.mjs').CompiledReferenceNode} node
 * @param {any} section
 * @returns {string}
 */
function authoredTitle(node, section) {
  return node.sourceTitles[section.id] ?? section.title;
}

/**
 * The node's sections as readers look them up: each one knows its authored
 * title, so a query in the authoring language finds a translated section.
 * @param {import('./compile.mjs').CompiledReferenceNode} node
 * @returns {any[]}
 */
export function readerSections(node) {
  return node.doc.sections.map((/** @type {any} */ section) =>
    withSourceTitle({...section}, authoredTitle(node, section)),
  );
}

/**
 * `docs.detail`: the whole topic, with every token reference inlined.
 * @param {import('./compile.mjs').CompiledReferenceNode} node a linked node
 * @returns {any}
 */
export function detailView(node) {
  return {
    ...node.doc,
    sections: node.doc.sections.map((/** @type {any} */ section) =>
      sectionView(node, section),
    ),
  };
}

/**
 * `docs.index`: what the topic is, and each section's key, title and summary.
 * @param {import('./compile.mjs').CompiledReferenceNode} node
 * @returns {import('../../api/docs/docs.type.mjs').DocsIndex}
 */
export function indexView(node) {
  return buildDocsIndexData(node.doc);
}

/**
 * `docs.detail.section`: one section with its token references inlined. A
 * referenced section's content takes the reference's place; the section takes
 * the referenced section's preview type when it has none of its own.
 * @param {import('./compile.mjs').CompiledReferenceNode} node
 * @param {any} section a linked section of `node`
 * @returns {any}
 */
export function sectionView(node, section) {
  const title = authoredTitle(node, section);
  /** @type {any[]} */
  const content = [];
  /** @type {any} */
  let withPreview = null;
  for (const block of section.content) {
    if (block?.type !== 'token-ref') {
      content.push(block);
      continue;
    }
    const target = block.resolved;
    if (target == null) {
      throw new Error(
        `The token reference to "${block.topic}" in "${node.id}" was read before it was linked.`,
      );
    }
    if (target.status === 'unknown-topic') {
      content.push({
        type: 'prose',
        text: `[token-ref: unknown topic "${block.topic}"]`,
      });
      continue;
    }
    if (target.status === 'unknown-section') {
      content.push({
        type: 'prose',
        text: `[token-ref: section "${block.section}" not found in "${block.topic}"]`,
      });
      continue;
    }
    for (const refBlock of target.content) content.push(refBlock);
    if (target.previewType && !section.previewType) {
      withPreview = withSourceTitle(
        {...section, previewType: target.previewType, content},
        title,
      );
    }
  }
  if (withPreview == null) return withSourceTitle({...section, content}, title);
  withPreview.content = content;
  return withPreview;
}
