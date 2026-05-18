// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('../../core/src/docs-types').ReferenceDoc} */

export const docs = {
  name: 'principles',
  title: 'Principles',
  category: 'guide',
  description:
    'Core design principles and rules for building with XDS.',

  sections: [
    {
      title: 'Design Philosophy',
  category: 'guide',
      content: [
        {
          type: 'prose',
          text: 'XDS is a design system that prioritizes consistency, adaptability, and developer experience. Every decision flows from a few core ideas:',
        },
        {
          type: 'list',
          style: 'unordered',
          items: [
            'Components over primitives — use XDS components for everything they cover before reaching for raw HTML',
            'Semantic tokens over hardcoded values — colors, spacing, and radii are named by purpose, not appearance',
            'Theme-agnostic code — your app code never references specific colors or measurements, so themes and dark mode work automatically',
            'Open internals — every primitive is exported and composable, so you can build on top of XDS without fighting it',
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
            'Use XDS components for everything they cover',
            'StyleX or Tailwind for custom styling — both are first-class (see \`npx xds docs styling\`)',
            'Semantic tokens, not hardcoded values (see \`npx xds docs tokens\`)',
            'CSS custom properties for colors, not hex values',
            'Form inputs are controlled (value + onChange)',
            'Use useXDSLinkComponent() for navigation so consumers can plug in their framework router via XDSLinkProvider',
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
          text: 'XDS supports multiple styling approaches. Every component accepts an \`xstyle\` prop for StyleX style overrides via \`stylex.create()\`. For layout and wrapper styling outside of components, use StyleX or Tailwind utilities — both resolve to the same XDS design tokens.',
        },
        {
          type: 'prose',
          text: 'See \`npx xds docs styling\` for the complete guide with examples.',
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
            'Inline styles on raw elements. Use xstyle on XDS components',
            'Hardcoded colors (#fff). Use var(--color-*) or Tailwind semantic classes (text-primary, bg-surface)',
            'Hardcoded spacing (16px). Use spacing tokens or Tailwind spacing utilities',
            'Hardcoded <a> elements. Use useXDSLinkComponent() so consumers can swap in their framework router via XDSLinkProvider',
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
          text: 'XDS provides semantic design tokens for spacing, color, radius, shadow, typography, and size. Tokens adapt to the active theme and color mode. Run \`npx xds docs tokens\` for the full reference with all values.',
        },
      ],
    },
  ],
};
