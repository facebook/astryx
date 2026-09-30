// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @file astryx docs cli/integrations/contribute — the kinds you can add. */

/** @type {import('@astryxdesign/cli/authoring').NamespaceDoc} */
export const docs = {
  type: 'namespace',
  name: 'contribute',
  placement: {parent: 'namespace:integrations', slot: 'guides', order: 20},
  title: 'Contribute',
  summary:
    'Add components, templates, themes, docs, codemods, and agent guidance.',
  keywords: ['contribute', 'add to an integration', 'contribution kinds'],
  slots: {
    guides: {title: 'Contribute', accepts: {kinds: ['generic', 'namespace']}},
  },
};
