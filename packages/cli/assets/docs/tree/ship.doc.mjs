// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @file astryx docs cli/integrations/ship — test, publish, and upgrade. */

/** @type {import('@astryxdesign/cli/authoring').NamespaceDoc} */
export const docs = {
  type: 'namespace',
  name: 'ship',
  placement: {parent: 'namespace:integrations', slot: 'guides', order: 30},
  title: 'Ship',
  summary: 'Test, publish, and upgrade your package.',
  keywords: ['ship', 'publish', 'release', 'upgrade'],
  slots: {
    guides: {title: 'Ship', accepts: {kinds: ['generic']}},
  },
};
