// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('../../core/src/docs-types').ReferenceDoc} */

export const docs = {
  name: 'typography',
  title: 'Typography',
  category: 'foundations',
  description:
    'Font families, geometric type scale, weight, line-height, and semantic text tokens for consistent, accessible text styling.',
  tokenCategory: 'typography',

  sections: [
    // ── Overview ────────────────────────────────────────────────────────────
    {
      title: 'Overview',
  category: 'foundations',
      content: [
        {
          id: 'typography-b1',
          type: 'prose',
          text: 'Typography is built on a geometric type scale: base size × ratio^step, with 14px and 1.2 as defaults. Every text style is a semantic token that composes font size, weight, and line-height, so components express intent (heading, body, label) rather than raw values.',
        },
        {
          id: 'typography-b2',
          type: 'prose',
          text: 'Two layers work together: raw size tokens (--font-size-xs ... --font-size-5xl) form the geometric scale, and semantic type scale tokens (--text-heading-1-size, --text-body-leading, etc.) reference them by var(). Themes override the entire scale by adjusting base and ratio in defineTheme; all semantic tokens recompute automatically.',
        },
      ],
    },

    // ── Font Families ───────────────────────────────────────────────────────
    {
      title: 'Font Families',
  category: 'foundations',
      content: [
        {
          id: 'typography-b3',
          type: 'prose',
          text: 'Three font roles: body (UI text), heading (titles and headings), and code (monospace). By default, body and heading share the same system font stack; code uses a monospace stack. Custom themes can assign different families per role; heading inherits from body when not explicitly set.',
        },
        {
          id: 'typography-b4',
          type: 'token-ref',
          topic: 'tokens',
          section: 'Font Family Tokens',
        },
      ],
    },

    // ── Font Sizes ──────────────────────────────────────────────────────────
    {
      title: 'Font Sizes',
  category: 'foundations',
      content: [
        {
          id: 'typography-b5',
          type: 'prose',
          text: 'Geometric scale: round(base × ratio^step), expressed in rem. The default scale is 14px × 1.2, producing 12 steps from 4xs (6px) to 5xl (42px). Adjusting base and ratio in defineTheme regenerates every size token while preserving proportional relationships.',
        },
        {
          id: 'typography-b6',
          type: 'token-ref',
          topic: 'tokens',
          section: 'Font Size Tokens',
        },
      ],
    },

    // ── Font Weights ────────────────────────────────────────────────────────
    {
      title: 'Font Weights',
  category: 'foundations',
      content: [
        {
          id: 'typography-b7',
          type: 'prose',
          text: 'Four semantic weights: normal (400, body/code), medium (500, labels/data), semibold (600, headings/titles), bold (700, strong emphasis). Type scale tokens reference these by var() so themes can remap numeric values.',
        },
        {
          id: 'typography-b8',
          type: 'token-ref',
          topic: 'tokens',
          section: 'Font Weight Tokens',
        },
      ],
    },

    // ── Line Height ─────────────────────────────────────────────────────────
    {
      title: 'Line Height',
  category: 'foundations',
      content: [
        {
          id: 'typography-b9',
          type: 'prose',
          text: 'Line heights are computed from a tiered target ratio and snapped to a 4px vertical grid. Small text (<20px) targets 1.5, medium text (20–31px) targets 1.4, and large text (≥32px) targets 1.25. A minimum gap of fontSize + 4px is enforced. The result is a unitless ratio stored in each --text-*-leading token.',
        },
        {
          id: 'typography-b10',
          type: 'prose',
          text: 'The 4px grid matters: every line box aligns to 4px increments, which keeps baselines, spacing, and component heights predictable. The expandTypeScale utility computes these automatically when you provide a base and ratio, so you should never need to set line-height manually.',
        },
      ],
    },

    // ── Type Scale ──────────────────────────────────────────────────────────
    {
      title: 'Type Scale',
  category: 'foundations',
      content: [
        {
          id: 'typography-b11',
          type: 'prose',
          text: 'Semantic tokens that combine size, weight, and line-height into a single type style. Each token triplet (--text-*-size, --text-*-weight, --text-*-leading) is consumed by Text and Heading. Use the component props rather than composing raw font tokens.',
        },
        {
          id: 'typography-b12',
          type: 'token-ref',
          topic: 'tokens',
          section: 'Type Scale Tokens',
        },
      ],
    },

    // ── Display Text ────────────────────────────────────────────────────────
    {
      title: 'Display Text',
  category: 'foundations',
      content: [
        {
          id: 'typography-b13',
          type: 'prose',
          text: 'Display variants (display-1, display-2, display-3) continue the geometric progression above heading-1, at steps +6, +5, and +4. They use normal weight (400) instead of semibold, and tighter line-heights (~1.2), since large text reads better with less leading. Use display types for hero banners, marketing headlines, and data callouts, not for document headings.',
        },
        {
          id: 'typography-b14',
          type: 'prose',
          text: 'Display text often needs heading semantics for accessibility. Use the type prop on Heading to apply display styling while preserving the correct HTML element: <Heading level={1} type="display-1"> gives you display-1 styling with an <h1> tag, so screen readers see the correct document outline.',
        },
      ],
    },

    // ── Usage ────────────────────────────────────────────────────────────────
    {
      title: 'Usage',
  category: 'foundations',
      content: [
        {
          id: 'typography-b15',
          type: 'code',
          lang: 'tsx',
          label: 'Heading for document structure',
          code: `import {Heading} from '@astryxdesign/core';

// Heading levels map to semantic tokens: level 1 → --text-heading-1-*
<Heading level={1}>Page Title</Heading>
<Heading level={2}>Section</Heading>
<Heading level={3}>Subsection</Heading>

// Display type for hero/marketing headings — level sets the HTML element
<Heading level={1} type="display-1">Hero Title</Heading>
<Heading level={2} type="display-2">$1.2M Revenue</Heading>

// Override the accessibility level when visual ≠ document hierarchy
<Heading level={2} accessibilityLevel={3}>
  Sidebar Section
</Heading>`,
        },
        {
          id: 'typography-b16',
          type: 'code',
          lang: 'tsx',
          label: 'Text for body, label, and display text',
          code: `import {Text} from '@astryxdesign/core';

<Text type="body">Body text at the base scale.</Text>
<Text type="large">Emphasized body text.</Text>
<Text type="label">Form label</Text>
<Text type="supporting">Helper text, timestamps, metadata.</Text>
<Text type="code">{'const x = 1;'}</Text>

// Display without heading semantics (data callouts, decorative)
<Text type="display-2">$1.2M Revenue</Text>`,
        },
        {
          id: 'typography-b17',
          type: 'code',
          lang: 'tsx',
          label: 'Customizing the type scale via defineTheme',
          code: `import {defineTheme} from '@astryxdesign/core';

// Adjust the entire ramp holistically with base and ratio
const editorialTheme = defineTheme({
  name: 'editorial',
  typography: {
    scale: { base: 16, ratio: 1.25 },          // airy / article feel
    body: { family: 'Geist', fallbacks: '-apple-system, sans-serif' },
    heading: { weight: 'bold' },
    code: { family: 'Geist Mono', fallbacks: '"SF Mono", monospace' },
  },
});

const denseTheme = defineTheme({
  name: 'dense',
  typography: {
    scale: { base: 12, ratio: 1.125 },          // compact / data-dense UI
  },
});`,
        },
      ],
    },

    // ── Best Practices ──────────────────────────────────────────────────────
    {
      title: 'Best Practices',
  category: 'foundations',
      content: [
        {
          id: 'typography-b18',
          type: 'list',
          style: 'do',
          items: [
            'Use Heading for document headings and Text for everything else; they apply the full type scale automatically.',
            'Adjust typography holistically: change base and ratio in defineTheme to shift the entire ramp (e.g. { base: 16, ratio: 1.25 } for editorial, { base: 12, ratio: 1.125 } for dense UI).',
            'Use display types with as="h1" (or h2/h3) when display text is a page heading; this preserves accessibility while giving you display-level sizing. Or better, use <Heading level={1} type="display-1"> which handles both semantics and styling.',
            'Let line-height snap to the 4px grid via the type scale; expandTypeScale computes leading automatically from base and ratio.',
            'Use the supporting type for secondary information: timestamps, helper text, metadata, captions.',
            'Use accessibilityLevel on Heading when the visual hierarchy doesn\u0027t match the document outline (e.g. sidebar or card headings).',
          ],
        },
        {
          id: 'typography-b19',
          type: 'list',
          style: 'dont',
          items: [
            'Set font-size or line-height manually; use the semantic type scale tokens so the full ramp stays consistent and 4px-grid-aligned.',
            'Skip heading levels (e.g. h1 to h3); screen readers rely on an unbroken hierarchy. Use accessibilityLevel to decouple visual from semantic level.',
            'Use display types for body content or in-page sections; they\u0027re designed for hero/marketing/data-callout contexts only.',
            'Override individual size tokens (--font-size-lg) to "tweak" a heading; adjust base/ratio instead so proportions remain coherent across the entire scale.',
            'Use raw numeric font-weight values (400, 600); reference the semantic weight tokens so themes can remap them.',
          ],
        },
      ],
    },
  ],
};
