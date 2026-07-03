// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('../docs-types').ComponentDoc} */

export const docs = {
  name: 'Accent',
  displayName: 'Accent',
  group: 'Utilities',
  category: 'Utility',
  isHiddenFromOverview: true,
  keywords: [
    'accent',
    'brand',
    'color',
    'theme',
    'scoped',
    'section',
    'tokens',
    'recolor',
    'tint',
  ],
  playground: {
    defaults: {
      color: '#FDBA74',
      children: {
        __element: 'Section',
        props: {
          variant: 'transparent',
          padding: 4,
          style: {
            maxWidth: 360,
            borderRadius: 'var(--radius-container)',
          },
        },
        children: {
          __element: 'VStack',
          props: {gap: 2},
          children: [
            {
              __element: 'Text',
              props: {type: 'body', weight: 'bold', color: 'accent'},
              children: 'Re-accented section',
            },
            {
              __element: 'Text',
              props: {type: 'supporting', color: 'secondary'},
              children:
                'Buttons, text, and icons in this subtree derive from the seed color.',
            },
            {
              __element: 'Button',
              props: {label: 'Get started', variant: 'primary', size: 'sm'},
            },
          ],
        },
      },
    },
  },
  usage: {
    description:
      'Re-accents a subtree from a single seed color. Accent re-declares the five accent-family tokens (--color-accent, --color-accent-muted, --color-on-accent, --color-text-accent, --color-icon-accent) on a display: contents wrapper, deriving each from the seed via the same HCT formulas themes use (deriveAccentFamily) — so on-accent contrast and text ink tones are recomputed for the new seed, and each token is emitted as a light-dark() pair that follows the color scheme. Use it for per-section or per-page accenting: marketing sections, product areas, workspace branding.',
    bestPractices: [
      {
        guidance: true,
        description:
          'Use to re-accent one section of a page — a marketing panel, a product area, per-workspace branding — while the rest of the page keeps the theme accent. Nest Accents freely; the innermost one wins for its subtree.',
      },
      {
        guidance: true,
        description:
          'Pass the seed as #RRGGBB hex, the same contract as a theme accent seed (HCT derivation needs a full hex). Other formats log a console warning and the overrides are skipped, so children render with the inherited accent.',
      },
      {
        guidance: false,
        description:
          'Override --color-accent with plain CSS to re-accent a subtree. CSS substitutes var() references inside custom properties at the declaring element, so descendants inherit already-resolved values — derived tokens like --color-on-accent keep their original colors and contrast breaks. Accent recomputes the whole family from the seed, which pure CSS var references cannot do.',
      },
      {
        guidance: false,
        description:
          'Use Accent for the app-wide accent: set the accent seed in defineTheme() instead. Accent is for scoped subtree re-accenting, not global theming.',
      },
    ],
  },
  props: [
    {
      name: 'color',
      type: 'string',
      required: true,
      description:
        'Accent seed as a #RRGGBB hex color — the same input contract as a theme accent seed. Non-hex values (named colors, rgb(), shorthand hex) log a console warning and the accent overrides are skipped.',
    },
    {
      name: 'children',
      type: 'ReactNode',
      required: true,
      description:
        'Content to render with the scoped accent family. Components read the re-declared tokens automatically.',
    },
  ],
  examples: [
    {
      label: 'Re-accent a marketing section',
      code: `
import {Accent} from '@astryxdesign/core/theme';

<Accent color="#FDBA74">
  <Section padding={6}>
    <Heading level={2}>Summer launch</Heading>
    <Text type="body">Everything inside uses the orange accent family.</Text>
    <Button label="Get started" variant="primary" />
  </Section>
</Accent>;
`,
    },
    {
      label: 'Nested product areas — inner Accent wins',
      code: `
<Accent color="#0064E0">
  <AnalyticsPanel />
  <Accent color="#22C55E">
    {/* This subtree derives from the green seed instead */}
    <BillingPanel />
  </Accent>
</Accent>;
`,
    },
  ],
};

/** @type {import('../docs-types').TranslationDoc} */
export const docsDense = {
  usage: {
    description:
      'Re-accents a subtree from a single #RRGGBB seed. Re-declares the 5 accent-family tokens (--color-accent, --color-accent-muted, --color-on-accent, --color-text-accent, --color-icon-accent) on a display:contents wrapper via the same HCT formulas themes use (deriveAccentFamily) — on-accent contrast + text ink recomputed, tokens emitted as light-dark() pairs. For per-section/per-page accenting: marketing sections, product areas, workspace branding.',
    bestPractices: [
      {
        guidance: true,
        description:
          'Use to re-accent one page section (marketing panel, product area, per-workspace branding) while rest of page keeps theme accent. Nesting OK; innermost Accent wins for its subtree.',
      },
      {
        guidance: true,
        description:
          'Seed must be #RRGGBB hex (same contract as theme accent seed; HCT needs full hex). Other formats warn in console + overrides skipped (children keep inherited accent).',
      },
      {
        guidance: false,
        description:
          'Override --color-accent w/ plain CSS to re-accent: CSS substitutes var() inside custom properties at the declaring element, so descendants inherit resolved values — derived tokens (--color-on-accent etc.) keep original colors, contrast breaks. Accent recomputes the family from the seed.',
      },
      {
        guidance: false,
        description:
          'Use Accent for app-wide accent: set accent seed in defineTheme() instead. Accent = scoped subtree re-accenting only.',
      },
    ],
  },
  propDescriptions: {
    color:
      'accent seed as #RRGGBB hex (same input contract as theme accent seed); non-hex values warn in console + overrides skipped',
    children:
      'content rendered with the scoped accent family; components read re-declared tokens automatically',
  },
};
