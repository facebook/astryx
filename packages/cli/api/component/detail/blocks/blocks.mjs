// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file `component.detail.blocks` leaf — a component's example/related blocks.
 *
 * @input  a component name
 * @output the `component.detail.blocks` envelope (showcase, examples, related)
 * @position api/component/detail/blocks (projection leaf; routed by component.mjs)
 */

import * as path from 'node:path';
import {findRelatedBlocks} from '../../../template/template.mjs';

/**
 * Project a component's related blocks into the `component.detail.blocks`
 * envelope, splitting them into the hero showcase, component-specific examples,
 * and broader related blocks.
 * @param {string} componentName
 * @returns {Promise<import('../../../../types/component').ComponentDetailBlocksResponse>}
 */
export async function componentDetailBlocks(componentName) {
  const allBlocks = await findRelatedBlocks(componentName);
  const toEntry = (/** @type {any} */ b) => ({
    name: b.dirName,
    displayName: b.name,
    description: b.description,
    isShowcase: b.isShowcase ?? false,
    category: b.category,
  });

  // Examples: blocks in the component's own directory, or
  // componentsUsed match for sub-components without a directory.
  const ownDir = allBlocks.filter((/** @type {any} */ b) => path.basename(b.category) === componentName);
  const examples = ownDir.length > 0
    ? ownDir
    : allBlocks.filter(b => b.componentsUsed?.some(c => c === componentName));
  const exampleSet = new Set(examples.map(b => b.dirName));

  // Showcase: the single hero example from the examples list.
  const showcaseBlock = examples.find(b => b.isShowcase) || null;

  // Related: everything else that uses this component but isn't
  // primarily about it (e.g. a Dialog block that has a Button).
  const related = allBlocks.filter(b => !exampleSet.has(b.dirName));

  return {
    type: 'component.detail.blocks',
    data: {
      component: componentName,
      showcase: showcaseBlock ? toEntry(showcaseBlock) : null,
      examples: examples.filter(b => b !== showcaseBlock).map(toEntry),
      related: related.map(toEntry),
    },
  };
}
