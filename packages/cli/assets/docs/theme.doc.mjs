// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').ReferenceDoc} */

export const docs = {
  name: 'theme',
  title: 'Theme System',
  category: 'guide',
  keywords: ['theme', 'dark mode', 'defineTheme', 'provider'],
  description:
    'How to use and create themes: see Use a theme for applying themes, and Author a theme for creating and customizing them.',

  sections: [
    {
      id: 'quick-start',
      title: 'Wrap your app in a theme',
      content: [
        {
          type: 'prose',
          text: 'Install a theme, import it with the CLI, and wire the generated module once. For the full guide — available themes, integration themes, dark mode, nested themes, and production builds — see {@link generic:use-a-theme}.',
        },
        {
          type: 'code',
          lang: 'tsx',
          label: 'Wire the generated module once',
          code: "import {Theme} from '@astryxdesign/core';\nimport {themes, defaultThemeSlug} from './astryx-themes';\n\nfunction App() {\n  return (\n    <Theme theme={themes[defaultThemeSlug]}>\n      <YourApp />\n    </Theme>\n  );\n}",
        },
      ],
    },
    {
      id: 'creating-a-custom-theme',
      title: 'Create a custom theme',
      content: [
        {
          type: 'prose',
          text: 'Use `defineTheme` with token overrides, scale configs, and component style overrides. For the full guide — palette generation, extending themes, adaptations, custom variants, and production builds — see {@link generic:author-a-theme}.',
        },
        {
          type: 'code',
          lang: 'bash',
          label: 'Quick start',
          code: 'astryx theme add stone --import   # use an existing theme\nastryx theme eject stone            # fork its source to customize\nastryx theme build src/themes/stone/stoneTheme.ts',
        },
      ],
    },
    {
      id: 'light-dark-mode',
      title: 'Dark mode',
      content: [
        {
          type: 'prose',
          text: "Use [light, dark] tuples in token values for automatic mode switching. Use mode='system' (default) on Theme to follow OS preference. Full guide: {@link generic:use-a-theme}.",
        },
        {
          type: 'code',
          lang: 'tsx',
          label: 'Light/dark tuple',
          code: "'--color-accent': ['#0064E0', '#2694FE'],\n//                   ^light     ^dark",
        },
      ],
    },
    {
      title: 'Integration themes',
      content: [
        {
          type: 'prose',
          text: 'Install an integration and Astryx discovers its themes automatically. Import one with `astryx theme add <name> --import --package <integration>`. Use `theme eject` only for an independent source fork. For the full walkthrough, see {@link generic:use-a-theme}.',
        },
      ],
    },
  ],
};
