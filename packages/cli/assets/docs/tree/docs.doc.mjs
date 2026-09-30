// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file `astryx docs cli/integrations/docs`: the guides to writing docs for an
 * integration package, which join the same docs tree as the CLI's own
 * (spec:AST-046, spec:AST-047).
 */

/** @type {import('@astryxdesign/cli/authoring').NamespaceDoc} */
export const docs = {
  type: 'namespace',
  name: 'docs',
  placement: {parent: 'namespace:contribute', slot: 'guides', order: 40},
  title: 'Docs',
  summary:
    'Write docs that ship with your package and that people and agents find by search or one level at a time.',
  keywords: ['writing docs', 'doc topic', 'docs section', 'placement', 'links'],
  slots: {
    guides: {title: 'Guides', accepts: {kinds: ['generic']}},
  },
};
