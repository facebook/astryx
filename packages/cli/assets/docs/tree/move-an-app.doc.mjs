// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file `astryx docs upgrade-and-migrate/move-an-app`: the migration guides. Groups the
 * incremental migration guides: setup (theme, CSS, layers), component
 * replacement, and verification.
 */

/** @type {import('@astryxdesign/cli/authoring').NamespaceDoc} */
export const docs = {
  type: 'namespace',
  name: 'move-an-app',
  placement: {parent: 'namespace:upgrade-and-migrate', slot: 'guides', order: 30},
  title: 'Move an existing app to Astryx',
  summary:
    'Move an existing app to Astryx one surface at a time: setup, component replacement, and verification.',
  keywords: [
    'migration',
    'migrate',
    'shadcn',
    'Radix',
    'coexistence'
  ],
  slots: {
    guides: {title: 'Guides', accepts: {kinds: ['generic']}},
  },
};
