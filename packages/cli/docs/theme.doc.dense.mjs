// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('../../core/src/docs-types').ReferenceTranslationDoc} */

export const docsDense = {
  description: 'Theme provider, custom themes, light/dark, component overrides',
  sections: [
    {
      section: 'Quick Start',
      title: 'Quick Start',
      blocks: [
        {
          id: 'theme-b5',
          text: 'default import = runtime injection. /built import = pre-compiled CSS (pair with theme.css).',
        },
      ],
    },
    {
      section: 'Available Themes',
      title: 'Themes',
      blocks: [
        {
          id: 'theme-b8',
          text: 'published: neutral (start here), butter, chocolate, gothic (dark-only), matcha, stone, y2k. @astryxdesign/theme-{name} = source (runtime). @astryxdesign/theme-{name}/built = optimized (+ theme.css).',
        },
      ],
    },
    {
      section: 'Theme Props',
      title: 'Props',
    },
    {
      section: 'Creating a Custom Theme',
      title: 'Custom Theme',
      blocks: [
        {
          id: 'theme-b10',
          text: 'CLI wizard or manual defineTheme. only override tokens that differ.',
        },
      ],
    },
    {
      section: 'defineTheme',
      title: 'defineTheme',
      blocks: [
        {
          id: 'theme-b12',
          text: 'scale configs (color, typography, radius, motion) + explicit token overrides + component overrides. color derives full palette from accent hex via HCT.',
        },
      ],
    },
    {
      section: 'Component Style Overrides',
      title: 'Component Overrides',
      blocks: [
        {
          id: 'theme-b18',
          text: 'components field uses semantic component keys + style keys (base, variant:value, stateName), not raw selectors. for external CSS, prefer data-* selectors from `astryx docs styling`. write standard CSS (borderRadius, padding) — pipeline expands to internal vars. public vars (--button-press-scale etc) set directly. private vars (--_*) cannot be set — use CSS properties. run `npx astryx component <Name>` for details.',
        },
      ],
    },
    {
      section: 'Custom Variants',
      title: 'Custom Variants',
      blocks: [
        {
          id: 'theme-b23',
          text: 'any unknown prop:value in components becomes a new variant. astryx theme build generates TS augmentations. works on any extensible prop axis (variant, status, etc).',
        },
      ],
    },
    {
      section: 'Building Themes for Production',
      title: 'Build for Production',
      blocks: [
        {
          id: 'theme-b28',
          text: 'npx astryx theme build compiles defineTheme to static CSS. outputs .css + .js (__built:true) + .d.ts.',
        },
      ],
    },
    {
      section: 'Runtime vs Built Themes',
      title: 'Runtime vs Built',
      blocks: [
        {
          id: 'theme-b34',
          text: 'runtime: useInsertionEffect injects styles client-side. built: static CSS on first paint. USE /built + theme.css FOR SSR.',
        },
      ],
    },
    {
      section: 'Light/Dark Mode',
      title: 'Light/Dark',
      blocks: [
        {
          id: 'theme-b38',
          text: 'light-dark() in token values via [light, dark] tuples. mode=system follows OS.',
        },
      ],
    },
    {
      section: 'Nesting Themes',
      title: 'Nesting',
      blocks: [
        {
          id: 'theme-b41',
          text: 'wrap sections in separate <Theme> providers',
        },
      ],
    },
    {
      section: 'useTheme Hook',
      title: 'useTheme',
    },
  ],
};
