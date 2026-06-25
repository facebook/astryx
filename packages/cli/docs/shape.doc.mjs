// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('../../core/src/docs-types').ReferenceDoc} */

export const docs = {
  name: 'shape',
  title: 'Shape',
  category: 'foundations',
  description:
    'Border radius tokens for consistent component rounding, from sharp corners to full pills.',
  tokenCategory: 'radius',

  sections: [
    {
      title: 'Overview',
  category: 'foundations',
      content: [
        {
          type: 'prose',
          text: 'The radius scale uses a semantic naming system: inner → element → container → page. Each level fits a specific context. Themes can multiply the entire scale via a radius multiplier, with --radius-none and --radius-full as fixed anchors.',
        },
      ],
    },
    {
      title: 'Radius Scale',
  category: 'foundations',
      content: [
        {
          type: 'token-ref',
          topic: 'tokens',
          section: 'Radius Tokens',
        },
      ],
    },
    {
      title: 'Concentric Radius',
  category: 'foundations',
      content: [
        {
          type: 'prose',
          text: 'When a rounded container has padding, inner elements need a smaller radius to appear concentric. Components like Card handle this automatically; the inner radius is computed as max(0, outerRadius - padding).',
        },
        {
          type: 'code',
          lang: 'css',
          label: 'Concentric radius formula',
          code: `/* Automatic in Astryx Card */
--card-concentric-radius: max(0px, calc(var(--_card-radius) - var(--card-padding)));`,
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
            'Use --radius-element for interactive controls (buttons, inputs, selectors).',
            'Use --radius-container for content containers (cards, panels, dialogs).',
            'Use --radius-full for pill shapes (badges, tags, avatar status dots).',
          ],
        },
        {
          type: 'list',
          style: 'dont',
          items: [
            "Use --radius-page for small elements; it's meant for page-level containers.",
            "Hardcode radius values; they won't scale with theme radius multipliers.",
          ],
        },
      ],
    },
  ],
};
