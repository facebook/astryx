// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('../../../../../core/src/docs-types').TemplateDoc} */
export const doc = {
  type: 'block',
  exampleFor: 'InternationalizationProvider',
  name: 'InternationalizationProvider — RTL Direction',
  displayName: 'Internationalization Provider — RTL Direction',
  description:
    'Toggle text direction with the `dir` prop and watch Astryx components mirror. Pagination flips its prev/next chevrons under RTL, and the surrounding DOM is also given a matching `dir` attribute so both channels stay in sync.',
  isReady: true,
  aspectRatio: 16 / 9,
  componentsUsed: [
    'InternationalizationProvider',
    'Pagination',
    'SegmentedControl',
    'Layout',
  ],
};
