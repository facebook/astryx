// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file `astryx docs cli/integrations/building-blocks/themes`: ship a source
 * theme an app discovers, copies into its code, and builds.
 */

/** @type {import('@astryxdesign/cli/authoring').NamespaceDoc} */
export const docs = {
  type: 'namespace',
  name: 'themes',
  placement: {parent: 'namespace:building-blocks', slot: 'guides', order: 30},
  title: 'Themes',
  summary:
    'Ship an editable source theme that apps discover, copy into their code, and build.',
  keywords: [
    'integration theme',
    'ship a theme',
    'define theme',
    'theme palette',
    'theme fonts',
  ],
  blocks: [
    {
      type: 'prose',
      text: 'A theme is an editable `defineTheme` source with a generated color palette. An app finds it with `theme list`, copies it with `theme add`, and compiles it with `theme build`; the copied theme becomes app code the app owns.',
    },
    {
      type: 'prose',
      text: 'The whole `themes/<slug>/` folder is the unit that ships and that an app copies, so a theme needs no `exports` entry of its own. Anything a copied theme reaches outside that folder — a font, a keyframes stylesheet — must be exported and imported on purpose, or the copy leaves it behind.',
    },
  ],
  slots: {
    guides: {
      title: 'Guides',
      accepts: {kinds: ['generic']},
    },
  },
};
