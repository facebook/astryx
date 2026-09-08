// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').HookDoc} */
export const docs = {
  name: 'useMediaQuery',
  displayName: 'useMediaQuery',
  keywords: [
    'responsive',
    'breakpoint',
    'media',
    'mobile',
    'desktop',
    'screen',
    'matchmedia',
  ],
  params: [
    {
      name: 'query',
      type: 'string',
      description: 'CSS media query string to evaluate.',
      required: true,
    },
    {
      name: 'serverDefault',
      type: 'boolean',
      description:
        'Snapshot returned during server rendering and hydration before the live matchMedia subscription takes over. Pass a reliable server-side hint when available to avoid a visible mode change.',
      default: 'false',
      required: false,
    },
  ],
  returns: [
    {
      name: 'matches',
      type: 'boolean',
      description:
        'Whether the media query matches. During server rendering and hydration this is serverDefault; on the live client it follows matchMedia.',
    },
  ],
  usage: {
    description:
      'SSR-safe media query hook that subscribes to window.matchMedia changes. The serverDefault snapshot is used during server rendering and hydration, then the live browser match becomes authoritative.',
    bestPractices: [
      {
        guidance: true,
        description:
          'Use JavaScript only when semantic structure or behavior must change; use CSS for presentation-only adaptation.',
      },
      {
        guidance: true,
        description:
          'Pass a reliable server-side hint as serverDefault when the first rendered mode must match before hydration; omission defaults to false.',
      },
      {
        guidance: true,
        description:
          'Prefer Astryx responsive tokens and component props over manual breakpoint logic when possible.',
      },
      {
        guidance: false,
        description:
          'Assume the hook always returns false initially when a true serverDefault was supplied.',
      },
    ],
  },
  relatedComponents: [],
  relatedHooks: ['useImageMode'],
  importPath: '@astryxdesign/core/hooks',
  category: 'media',
};

/** @type {import('@astryxdesign/cli/authoring').HookTranslationDoc} */
export const docsDense = {
  description:
    'SSR-safe media-query subscription; serverDefault is the server/hydration snapshot, then live matchMedia becomes authoritative',
  paramDescriptions: {
    query: 'CSS media query string to evaluate.',
    serverDefault:
      'server-render and hydration snapshot before live matchMedia takes over; defaults to false',
  },
  returnDescriptions: {
    matches:
      'serverDefault during SSR/hydration, then whether the live browser media query matches',
  },
  usage: {
    description:
      'Use for semantic structure or behavior that must change in JavaScript. Prefer CSS for presentation-only adaptation.',
    bestPractices: [
      {
        guidance: true,
        description:
          'Pass a reliable server-side hint when the first rendered mode must match before hydration.',
      },
      {
        guidance: true,
        description:
          'Prefer Astryx responsive tokens + component props over manual breakpoint logic when possible.',
      },
      {
        guidance: false,
        description:
          'Assume the first result is always false when serverDefault was supplied.',
      },
    ],
  },
};
