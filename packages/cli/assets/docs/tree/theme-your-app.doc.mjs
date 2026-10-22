// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file `astryx docs theme-your-app`: use a theme, or author one.
 */

/** @type {import('@astryxdesign/cli/authoring').NamespaceDoc} */
export const docs = {
  type: 'namespace',
  name: 'theme-your-app',
  title: 'Theme your app',
  summary: 'Apply a theme, dark mode, brand colors, or a theme of your own.',
  keywords: ['themes', 'light mode', 'brand colors'],
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
      text: 'Two jobs. Apply an existing theme, switch dark mode, or nest themes: {@link generic:use-a-theme}. Create or customize one with `defineTheme`, a generated palette, overrides, and a production build: {@link generic:author-a-theme}.',
    },
    {
      type: 'prose',
      text: 'Every color, spacing, and radius a theme overrides is listed in {@link generic:all-tokens}.',
    },
  ],
};
