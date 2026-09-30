// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @file astryx docs cli/integrations/building-blocks — the kinds you can add. */

/** @type {import('@astryxdesign/cli/authoring').NamespaceDoc} */
export const docs = {
  type: 'namespace',
  name: 'building-blocks',
  placement: {parent: 'namespace:integrations', slot: 'guides', order: 20},
  title: 'Building Blocks',
  summary:
    'Add components, templates, themes, docs, codemods, and agent guidance.',
  keywords: [
    'building blocks',
    'contribute',
    'add to an integration',
    'contribution kinds',
  ],
  slots: {
    guides: {
      title: 'Building Blocks',
      accepts: {kinds: ['generic', 'namespace']},
    },
  },
};
