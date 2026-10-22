// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file `astryx docs upgrade-and-migrate`: version upgrades with codemods, and moving an app to Astryx.
 */

/** @type {import('@astryxdesign/cli/authoring').NamespaceDoc} */
export const docs = {
  type: 'namespace',
  name: 'upgrade-and-migrate',
  title: 'Upgrade and migrate',
  summary: 'Move to a new Astryx version, or move an app to Astryx.',
  keywords: [
    'codemods',
    'migrate',
    'migration',
    'shadcn',
    'Radix',
    'coexistence',
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
      text: 'New version of Astryx: bump the packages, then run `astryx upgrade --from <old version> --apply` ({@link generic:upgrade}).',
    },
    {
      type: 'prose',
      text: 'Moving an existing Tailwind, shadcn, or Radix app over one surface at a time: {@link namespace:from-tailwind-shadcn-radix}.',
    },
  ],
};
