// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file `astryx docs foundations`: principles, one page per design value, and the full token table.
 */

/** @type {import('@astryxdesign/cli/authoring').NamespaceDoc} */
export const docs = {
  type: 'namespace',
  name: 'foundations',
  title: 'Foundations',
  summary: 'Principles and every design value.',
  keywords: [
    'foundations',
    'principles',
    'tokens',
    'color',
    'spacing',
    'typography',
    'radius',
    'shadow',
    'motion',
    'icons',
  ],
  slots: {
    guides: {
      title: 'Guides',
      accepts: {
        kinds: ['generic', 'namespace'],
      },
    },
  },
  blocks: [
    {
      type: 'prose',
      text: 'The rules every component follows ({@link generic:principles}), then one page per design value: color, spacing, typography, shape, elevation, motion, icons, and illustrations. Each value page carries its token table.',
    },
    {
      type: 'prose',
      text: '{@link generic:all-tokens} lists every token in one place.',
    },
  ],
};
