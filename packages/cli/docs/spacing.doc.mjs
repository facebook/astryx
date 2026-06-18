// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('../../core/src/docs-types').ReferenceDoc} */

export const docs = {
  name: 'spacing',
  title: 'Spacing',
  category: 'foundations',
  description:
    'Spacing scale tokens for padding, gap, and margin: the rhythmic foundation of design system layouts.',
  tokenCategory: 'spacing',

  sections: [
    {
      title: 'Overview',
  category: 'foundations',
      content: [
        {
          type: 'prose',
          text: 'The design system uses a 4px base-unit spacing scale. Component gap props accept step values that map to these tokens. The scale provides fine-grained control at the small end (2px, 4px, 6px) and consistent rhythm at larger sizes (multiples of 4px).',
        },
      ],
    },
    {
      title: 'Scale',
  category: 'foundations',
      content: [
        {
          type: 'token-ref',
          topic: 'tokens',
          section: 'Spacing Tokens',
        },
      ],
    },
    {
      title: 'Usage',
  category: 'foundations',
      content: [
        {
          type: 'prose',
          text: 'Most components accept a `gap` prop using step values (0 through 12). For custom layouts, use the spacing tokens directly in StyleX.',
        },
        {
          type: 'code',
          lang: 'tsx',
          label: 'Spacing via component props vs StyleX',
          code: `// Via component props (preferred)
<Stack gap={4}>{/* 16px gap */}</Stack>

// Via StyleX tokens (custom layouts)
import {spacingVars} from '@xds/core';

const styles = stylex.create({
  custom: {
    padding: spacingVars['--spacing-4'],
    gap: spacingVars['--spacing-3'],
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
            'Use component gap props when available; they handle automatic spacing compensation.',
            "Stick to the scale for consistency. If a value isn't on the scale, reconsider the design.",
            'Use smaller steps (0.5–2) for tight internal spacing and larger steps (4–8) for section gaps.',
          ],
        },
        {
          type: 'list',
          style: 'dont',
          items: [
            'Use arbitrary pixel values outside the scale.',
            'Mix spacing tokens with raw px/rem values in the same component.',
          ],
        },
      ],
    },
  ],
};
