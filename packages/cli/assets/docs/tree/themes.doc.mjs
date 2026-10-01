// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file `astryx docs cli/integrations/building-blocks/themes`: author a theme
 * in an integration; apps install, apply, and extend it like any theme.
 */

/** @type {import('@astryxdesign/cli/authoring').NamespaceDoc} */
export const docs = {
  type: 'namespace',
  name: 'themes',
  placement: {parent: 'namespace:building-blocks', slot: 'guides', order: 30},
  title: 'Themes',
  summary:
    'Author a theme in your integration; apps install, apply, and extend it like any theme.',
  keywords: [
    'integration theme',
    'ship a theme',
    'define theme',
    'theme palette',
    'extend a theme',
  ],
  blocks: [
    {
      type: 'prose',
      text: 'A theme is an editable `defineTheme` source with a generated color palette. An integration ships a theme the same way a standalone theme package does: an app installs the package, applies the theme with `<Theme>`, and customizes it with `extends`. An integration theme and a standalone theme package are the same shape.',
    },
    {
      type: 'prose',
      text: 'These guides cover authoring a theme inside an integration — scaffold it, generate its palette, define its tokens, and document it. Using a theme, applying and extending it, is the same for every theme; see {@link generic:theme}.',
    },
  ],
  slots: {
    guides: {
      title: 'Guides',
      accepts: {kinds: ['generic']},
    },
  },
};
