// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file `astryx docs upgrade-and-migrate/from-tailwind-shadcn-radix`: the migration guides. Groups the
 * incremental migration guides: setup (theme, CSS, layers), component
 * replacement, and verification.
 */

/** @type {import('@astryxdesign/cli/authoring').NamespaceDoc} */
export const docs = {
  type: 'namespace',
  name: 'from-tailwind-shadcn-radix',
  placement: {parent: 'namespace:upgrade-and-migrate', slot: 'guides', order: 30},
  title: 'Move an app from Tailwind, shadcn, or Radix',
  summary:
    'Migrate an existing Tailwind, shadcn, or Radix app to the design system incrementally — setup, component replacement, and verification.',
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
