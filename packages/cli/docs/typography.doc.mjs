/** @type {import('../../core/src/docs-types').ReferenceDoc} */

export const docs = {
  name: 'typography',
  title: 'Typography',
  description:
    'Font family, size, weight, and type scale tokens for consistent text styling.',
  tokenCategory: 'typography',

  sections: [
    {
      title: 'Overview',
      content: [
        {
          type: 'prose',
          text: 'XDS typography uses a geometric type scale based on 14px × 1.2^step. Semantic type scale tokens (heading, body, label, code, supporting, display) compose font size, weight, and line-height into ready-to-use combinations. The XDSText component is the primary way to apply these scales.',
        },
      ],
    },
    {
      title: 'Font Families',
      content: [
        {
          type: 'token-ref',
          topic: 'tokens',
          section: 'Font Family Tokens',
        },
      ],
    },
    {
      title: 'Font Sizes',
      content: [
        {
          type: 'prose',
          text: 'Geometric scale with 14px base. Each step multiplies by 1.2 and rounds to the nearest 0.0625rem.',
        },
        {
          type: 'token-ref',
          topic: 'tokens',
          section: 'Font Size Tokens',
        },
      ],
    },
    {
      title: 'Font Weights',
      content: [
        {
          type: 'token-ref',
          topic: 'tokens',
          section: 'Font Weight Tokens',
        },
      ],
    },
    {
      title: 'Type Scale',
      content: [
        {
          type: 'prose',
          text: 'Semantic tokens that combine size, weight, and line-height. Use these via XDSText variant prop rather than composing raw font tokens.',
        },
        {
          type: 'token-ref',
          topic: 'tokens',
          section: 'Type Scale Tokens',
        },
      ],
    },
    {
      title: 'Usage',
      content: [
        {
          type: 'code',
          lang: 'tsx',
          label: 'Using XDSText for type scale',
          code: `import {XDSText} from '@xds/core';

// Preferred: XDSText component applies the full type scale
<XDSText variant="heading1">Page Title</XDSText>
<XDSText variant="body">Body text at the base scale.</XDSText>
<XDSText variant="supporting">Smaller supporting text.</XDSText>
<XDSText variant="code">Monospace code text.</XDSText>`,
        },
      ],
    },
    {
      title: 'Best Practices',
      content: [
        {
          type: 'list',
          style: 'do',
          items: [
            'Use XDSText variant prop instead of manually composing font tokens.',
            'Use the heading scale (1–6) for document hierarchy, not visual sizing.',
            'Use the supporting variant for helper text, timestamps, and metadata.',
          ],
        },
        {
          type: 'list',
          style: 'dont',
          items: [
            'Skip heading levels (e.g. heading1 → heading3) — screen readers rely on the hierarchy.',
            "Use display variants for body content — they're designed for hero/marketing text.",
          ],
        },
      ],
    },
  ],
};
