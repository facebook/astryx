// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('../docs-types').HookDoc} */
export const docs = {
  name: 'useEntryAnimation',
  displayName: 'useEntryAnimation',
  keywords: ['animation', 'entry', 'mount', 'transition', 'slide', 'fade', 'scale', 'motion', 'stylex'],
  params: [
    {
      name: 'preset',
      type: "'slideDown' | 'slideUp' | 'fadeIn' | 'scaleIn'",
      description: 'Animation preset to apply on mount.',
      default: "'slideDown'",
      required: false,
    },
  ],
  returns: [
    {
      name: 'entryStyle',
      type: 'StyleXStyles | null',
      description: 'A StyleX style object for the entry animation, or null if the element was rendered on initial page load (no animation needed).',
    },
  ],
  usage: {
    description:
      'Returns a StyleX style for animating an element on mount. Only animates when the element is dynamically inserted after the initial page paint — elements rendered on page load are not animated. Uses XDS motion tokens (duration, easing) for consistent animation timing. Requires "use client" — does not support SSR.',
    bestPractices: [
      { guidance: true, description: 'Use for conditionally rendered elements like validation messages, toasts, or expanding sections.' },
      { guidance: true, description: 'Spread the returned style into stylex.props() alongside other styles.' },
      { guidance: false, description: 'Use for elements that should be visible on initial page load — they will not animate.' },
    ],
  },
  relatedComponents: ['FieldStatus'],
  relatedHooks: [],
  importPath: '@xds/core/hooks',
  category: 'animation',
};

/** @type {import('../docs-types').TranslationDoc} */
export const docsDense = {
  description: 'StyleX style for mount animation; only animates elements dynamically inserted after initial paint — page-load elements skip animation. Uses XDS motion tokens (duration, easing). Requires "use client"; no SSR.',
  usage: {
    bestPractices: [
      { guidance: true, description: 'Use for conditionally rendered elements: validation messages, toasts, expanding sections.' },
      { guidance: true, description: 'Spread returned style into stylex.props() w/ other styles.' },
      { guidance: false, description: 'Use for elements visible on initial page load — they will not animate.' },
    ],
  },
  paramDescriptions: {
    preset: 'Animation preset applied on mount.',
  },
  returnDescriptions: {
    entryStyle: 'StyleX style for entry animation; null if rendered on initial page load (no animation needed).',
  },
};
