// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').ReferenceTranslationDoc} */

export const docsDense = {
  description: 'every token, one table per category.',
  sections: [
    {
      section: 'Color Tokens',
      title: 'Color',
      content: [
        {
          type: 'prose',
          text: 'semantic colors, support light-dark() auto switching.',
        },
        null,
        null,
        null,
      ],
    },
    {section: 'Radius Tokens', title: 'Radius', content: [null]},
    {section: 'Shadow Tokens', title: 'Elevation', content: [null]},
    {
      section: 'Size Tokens',
      title: 'Size',
      content: [
        {type: 'prose', text: 'control heights for buttons/inputs/selectors.'},
        null,
      ],
    },
    {
      section: 'Spacing Tokens',
      title: 'Spacing',
      content: [
        {
          type: 'prose',
          text: 'padding/gap/margin scale. gap props take steps 0, 0.5, 1, 1.5, 2, 3, 4, 5, 6, 8, 10.',
        },
        null,
      ],
    },
    {section: 'Usage in StyleX', title: 'StyleX Usage', content: [null, null]},
  ],
};
