// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('../../core/src/docs-types').ReferenceDoc} */

export const docs = {
  name: 'elevation',
  title: 'Elevation',
  category: 'foundations',
  description:
    'Shadow tokens for visual elevation and inset state rings.',
  tokenCategory: 'shadow',

  sections: [
    {
      title: 'Overview',
  category: 'foundations',
      content: [
        {
          type: 'prose',
          text: 'Elevation tokens create depth through box-shadow. Three levels (low, med, high) establish a visual hierarchy for floating elements. Inset shadows provide focus and selection rings for interactive components.',
        },
      ],
    },
    {
      title: 'Elevation Scale',
  category: 'foundations',
      content: [
        {
          type: 'prose',
          text: 'Each level adds stronger offset and spread. Shadow color adapts to dark mode automatically via light-dark().',
        },
        {
          type: 'token-ref',
          topic: 'tokens',
          section: 'Shadow Tokens',
        },
      ],
    },
    {
      title: 'Usage',
  category: 'foundations',
      content: [
        {
          type: 'code',
          lang: 'tsx',
          label: 'Applying elevation',
          code: `import {shadowVars} from '@astryxdesign/core';

const styles = stylex.create({
  dropdown: {
    boxShadow: shadowVars['--shadow-med'],
  },
  dialog: {
    boxShadow: shadowVars['--shadow-high'],
  },
  inputFocused: {
    boxShadow: shadowVars['--shadow-inset-selected'],
  },
});`,
        },
      ],
    },
    {
      title: 'Best Practices',
  category: 'foundations',
      content: [
        {
          type: 'list',
          style: 'do',
          items: [
            'Match elevation to interaction context: low for tooltips, med for dropdowns, high for dialogs.',
            'Use inset shadows for input focus/selection states; they compose better than outlines.',
          ],
        },
        {
          type: 'list',
          style: 'dont',
          items: [
            'Stack multiple elevation levels on the same element.',
            'Use elevation shadows for decorative borders. Use --color-border tokens instead.',
          ],
        },
      ],
    },
  ],
};
