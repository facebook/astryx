// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('../../core/src/docs-types').ReferenceDoc} */

export const docs = {
  name: 'principles',
  title: 'Principles',
  category: 'guide',
  description:
    'Core design principles and rules for building with the design system.',

  sections: [
    {
      title: 'Design Philosophy',
  category: 'guide',
      content: [
        {
          type: 'prose',
          text: 'A design system that prioritizes consistency, adaptability, and developer experience. Every decision flows from a few core ideas:',
        },
        {
          type: 'list',
          style: 'unordered',
          items: [
            'Components over primitives: use components for everything they cover before reaching for raw HTML',
            'Semantic tokens over hardcoded values: colors, spacing, and radii are named by purpose, not appearance',
            'Theme-agnostic code: your app code never references specific colors or measurements, so themes and dark mode work automatically',
            'Open internals: every primitive is exported and composable, so you can build on top of it without fighting it',
          ],
        },
      ],
    },
    {
      title: 'Rules',
  category: 'guide',
      content: [
        {
          type: 'list',
          style: 'ordered',
          items: [
            'Use components for everything they cover',
            'StyleX or Tailwind for custom styling; both are first-class (see \`npx astryx docs styling\`)',
            'Semantic tokens, not hardcoded values (see \`npx astryx docs tokens\`)',
            'CSS custom properties for colors, not hex values',
            'Form inputs are controlled (value + onChange)',
            'Use useLinkComponent() for navigation so consumers can plug in their framework router via LinkProvider',
          ],
        },
      ],
    },
    {
      title: 'Styling Approach',
  category: 'guide',
      content: [
        {
          type: 'prose',
          text: 'The design system supports multiple styling approaches. Every component accepts an \`xstyle\` prop for StyleX style overrides via \`stylex.create()\`. For layout and wrapper styling outside of components, use StyleX or Tailwind utilities; both resolve to the same design tokens.',
        },
        {
          type: 'prose',
          text: 'See \`npx astryx docs styling\` for the complete guide with examples.',
        },
      ],
    },
    {
      title: 'Anti-Patterns',
  category: 'guide',
      content: [
        {
          type: 'list',
          style: 'dont',
          items: [
            'Inline styles on raw elements. Use xstyle on components',
            'Hardcoded colors (#fff). Use var(--color-*) or Tailwind semantic classes (text-primary, bg-surface)',
            'Hardcoded spacing (16px). Use spacing tokens or Tailwind spacing utilities',
            'Hardcoded <a> elements. Use useLinkComponent() so consumers can swap in their framework router via LinkProvider',
            'Inventing props. Read component docs first',
          ],
        },
      ],
    },
    {
      title: 'Design Tokens',
  category: 'guide',
      content: [
        {
          type: 'prose',
          text: 'The design system provides semantic design tokens for spacing, color, radius, shadow, typography, and size. Tokens adapt to the active theme and color mode. Run \`npx astryx docs tokens\` for the full reference with all values.',
        },
      ],
    },
  ],
};
