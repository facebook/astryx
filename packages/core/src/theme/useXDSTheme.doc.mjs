// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('../docs-types').HookDoc} */
export const docs = {
  name: 'useXDSTheme',
  displayName: 'useXDSTheme',
  group: 'Utilities',
  category: 'Utility',
  keywords: ['theme', 'tokens', 'color', 'mode', 'dark', 'light', 'provider', 'data visualization', 'canvas', 'svg'],
  params: [],
  returns: [
    {name: 'name', type: 'string', description: 'Name of the nearest XDS theme, or default when no provider is present.'},
    {name: 'mode', type: "'light' | 'dark'", description: 'Resolved effective color mode. system mode is resolved to light or dark.'},
    {name: 'token', type: '(name: string) => string', description: 'Resolve a single design token to its concrete CSS value for the current mode.'},
    {name: 'tokens', type: 'Record<string, string>', description: 'All tokens resolved for the current mode, including defaults and theme overrides. Uses the same resolution logic as resolveXDSThemeTokens(theme, {mode}).'},
  ],
  usage: {
    description: 'Programmatic access to resolved XDS theme tokens. Use it for non-CSS consumers like SVG, canvas, Vega, D3, or chart libraries that need concrete values instead of CSS custom property references.',
    bestPractices: [
      {guidance: true, description: 'Use token(name) when integrating theme colors into SVG, canvas, or chart configuration objects inside React components.'},
      {guidance: true, description: 'Use resolveXDSThemeTokens(theme, {mode}) for the same token resolution outside React hooks.'},
      {guidance: true, description: 'Prefer CSS variables or StyleX tokens for ordinary component styling; use this hook when values must be read in JavaScript.'},
      {guidance: false, description: 'Hardcode light/dark colors in data visualizations — resolve them through the current theme instead.'},
    ],
  },
  relatedComponents: ['Theme'],
  relatedHooks: ['useMediaQuery'],
  importPath: '@xds/core/theme',
};

/** @type {import('../docs-types').HookTranslationDoc} */
export const docsDense = {
  description: 'Programmatic access to resolved XDS theme tokens for SVG/canvas/charts needing concrete values instead of CSS vars.',
  returnDescriptions: {
    name: 'nearest XDS theme name or default.',
    mode: 'resolved light/dark mode.',
    token: 'resolve one design token to concrete CSS value.',
    tokens: 'all resolved tokens for current mode; same resolver as resolveXDSThemeTokens.',
  },
  usage: {
    description: 'Programmatic access to resolved XDS theme tokens for SVG/canvas/charts needing concrete values instead of CSS vars.',
    bestPractices: [
      {guidance: true, description: 'Use token(name) for SVG/canvas/chart config theme colors in React.'},
      {guidance: true, description: 'Use resolveXDSThemeTokens(theme, {mode}) outside React hooks.'},
      {guidance: true, description: 'Prefer CSS vars / StyleX tokens for ordinary styling; use hook when JS needs values.'},
      {guidance: false, description: 'Hardcode light/dark chart colors — resolve from current theme.'},
    ],
  },
};
