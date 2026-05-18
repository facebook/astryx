// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('../docs-types').ComponentDoc} */

export const docs = {
  name: 'MediaTheme',
  group: 'Utilities',
  keywords: ['theme', 'dark-mode', 'light-mode', 'media', 'inverted', 'overlay', 'scrim', 'toast', 'tooltip'],
  usage: {
    description:
      'Provides token overrides for content rendered on inverted surfaces — media overlays, scrims, toasts, and tooltips. The base behavior flips color-scheme so all light-dark() tokens resolve to the correct side. Only a small set of tokens need explicit overrides beyond that. Themes can further customize component appearance on media surfaces via onDark/onLight in defineTheme(), with both token overrides (e.g. "--color-accent": "#90CAF9") and component overrides (e.g. ghost buttons get a border on dark surfaces).',
    bestPractices: [
      {guidance: true, description: 'Use for any content placed over a dark background (image overlays, video scrims, dark cards) or other inverted surfaces like toasts and tooltips.'},
      {guidance: true, description: 'Pair with a background color — MediaTheme flips the token context but does not add a background. Set backgroundColor on the parent element.'},
      {guidance: true, description: 'Themes can customize components on media surfaces via onDark.components and onLight.components in defineTheme(). For example, add a border to ghost buttons on dark surfaces.'},
      {guidance: false, description: 'Use MediaTheme for app-level dark mode — use XDSTheme with mode="dark" or mode="system" instead. MediaTheme is for local surface inversions, not page-wide color scheme.'},
    ],
  },
  props: [
    {name: 'mode', type: "'dark' | 'light'", required: true, description: 'Surface luminance context — dark for content over dark backgrounds (light text, white-tinted interactions), light for content over light backgrounds (dark text, black-tinted interactions).'},
    {name: 'children', type: 'ReactNode', required: true, description: 'Content to render with inverted token context. Components inherit the correct colors automatically.'},
  ],
};
