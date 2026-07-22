// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('../../core/src/docs-types').ReferenceTranslationDoc} */

export const docsDense = {
  description: 'spacing/color/radius/type/shadow token ref',
  sections: [
    {
      section: 'Color Tokens',
      title: 'Color',
      blocks: [
        {
          id: 'color-desc',
          text: 'semantic colors, support light-dark() auto switching.',
        },
      ],
    },
    {
      section: 'Spacing Tokens',
      title: 'Spacing',
      blocks: [
        {
          id: 'spacing-desc',
          text: 'defined in tokens.stylex.ts. gap props use space0-space12.',
        },
      ],
    },
    {
      section: 'Size Tokens',
      title: 'Size',
      blocks: [
        {
          id: 'size-desc',
          text: 'control heights for buttons/inputs/selectors.',
        },
      ],
    },
    {
      section: 'Radius Tokens',
      title: 'Radius',
    },
    {
      section: 'Shadow Tokens',
      title: 'Elevation',
    },
    {
      section: 'Usage in StyleX',
      title: 'StyleX Usage',
    },
  ],
};
