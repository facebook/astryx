// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('../docs-types').HookDoc} */
export const docs = {
  name: 'useMediaQuery',
  displayName: 'useMediaQuery',
  keywords: ['responsive', 'breakpoint', 'media', 'mobile', 'desktop', 'screen', 'matchmedia'],
  params: [
    {
      name: 'query',
      type: 'string',
      description: 'CSS media query string to evaluate.',
      required: true,
    },
  ],
  returns: [
    {
      name: 'matches',
      type: 'boolean',
      description: 'Whether the media query currently matches. Always false on first render (SSR-safe).',
    },
  ],
  usage: {
    description: 'SSR-safe media query hook that subscribes to window.matchMedia changes. Returns whether the given media query matches. Always returns false on first render for SSR compatibility.',
    bestPractices: [
      { guidance: true, description: 'Use for responsive layout switching based on viewport width, color scheme, or motion preferences.' },
      { guidance: true, description: 'Prefer XDS responsive tokens and component props over manual breakpoint logic when possible.' },
      { guidance: false, description: 'Use for server-rendered content that must match on first paint — the hook always returns false initially.' },
    ],
  },
  relatedComponents: [],
  relatedHooks: ['useImageMode'],
  importPath: '@xds/core/hooks',
  category: 'media',
};

/** @type {import('../docs-types').TranslationDoc} */
export const docsDense = {
  description: 'SSR-safe media query hook; subscribes to window.matchMedia. Returns if query matches; always false on first render (SSR-safe).',
  usage: {
    bestPractices: [
      { guidance: true, description: 'Use for responsive layout switching: viewport width, color scheme, or motion preferences.' },
      { guidance: true, description: 'Prefer XDS responsive tokens + component props over manual breakpoint logic when possible.' },
      { guidance: false, description: 'Use for server-rendered content that must match on first paint — always returns false initially.' },
    ],
  },
  paramDescriptions: {
    query: 'CSS media query string **(required)**',
  },
  returnDescriptions: {
    matches: 'If media query currently matches; always false on first render (SSR-safe).',
  },
};
