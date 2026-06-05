// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('../docs-types').ComponentDoc} */

export const docs = {
  name: 'Theme',
  displayName: 'Theme',
  group: 'Utilities',
  category: 'Utility',
  isHiddenFromOverview: true,
  keywords: ['theme', 'theming', 'provider', 'color-scheme'],
  usage: {
    description: 'Wraps a subtree with a specific XDS theme. Use at the app root or around sections that need a different visual treatment.',
  },
  props: [
    {name: 'theme', type: 'XDSDefinedTheme', required: true, description: 'Theme created by defineTheme().'},
    {name: 'mode', type: "'light' | 'dark' | 'system'", default: "'system'", description: 'Color mode — system follows OS preference.'},
    {name: 'children', type: 'ReactNode', required: true, description: 'Content to render with the theme.'},
  ],
};

/** @type {import('../docs-types').TranslationDoc} */
export const docsDense = {
  description: 'Wraps subtree w/ specific XDS theme; use at app root or around sections needing different visual treatment',
  usage: {},
  propDescriptions: {
    theme: 'Created by defineTheme() **(required)**',
    mode: 'Color mode; system follows OS preference',
  },
};
