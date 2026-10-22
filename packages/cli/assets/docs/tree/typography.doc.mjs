// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file `astryx docs foundations/typography`: the typography namespace. Groups guides for
 * font setup, the type scale, and best practices.
 */

/** @type {import('@astryxdesign/cli/authoring').NamespaceDoc} */
export const docs = {
  type: 'namespace',
  name: 'typography',
  placement: {parent: 'namespace:foundations', slot: 'guides', order: 40},
  title: 'Typography',
  summary:
    'Font families, geometric type scale, weight, line-height, and semantic text tokens for consistent, accessible text styling.',
  keywords: [
    'typography',
    'font',
    'fonts',
    'type scale',
    'heading',
    'text',
    'weight',
    'line-height',
    'display',
  ],
  slots: {
    guides: {title: 'Guides', accepts: {kinds: ['generic']}},
  },
};
