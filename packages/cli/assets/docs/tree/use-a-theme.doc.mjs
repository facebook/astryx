// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').ReferenceDoc} */

export const docs = {
  type: 'generic',
  name: 'use-a-theme',
  placement: {parent: 'namespace:theme-your-app', slot: 'guides', order: 10},
  title: 'Use a theme',
  category: 'guide',
  keywords: ['theme', 'dark mode', 'light', 'nested', 'provider', 'SSR', 'built', 'runtime', 'neutralTheme', 'available themes', 'theme add', 'import', 'astryx-themes', 'eject'],
  description:
    'Apply a theme to your app: install, import with the CLI, wire the generated module, switch dark mode, nest themes, and choose runtime or built for production.',

  sections: [
    {
      id: 'quick-start',
      title: 'Wrap your app in a theme',
      content: [
        {
          type: 'code',
          lang: 'bash',
          label: 'Install and add a theme',
          code: 'npm install @astryxdesign/theme-neutral\nastryx theme add neutral',
        },
        {
          type: 'code',
          lang: 'tsx',
          label: 'Wire the generated module once',
          code: "import {Theme} from '@astryxdesign/core/theme';\nimport {themes, defaultThemeSlug} from './astryx-themes';\n\nfunction App() {\n  return (\n    <Theme theme={themes[defaultThemeSlug]}>\n      <YourApp />\n    </Theme>\n  );\n}",
        },
        {
          type: 'code',
          lang: 'tsx',
          label: 'Switch among added themes',
          code: "import {useState} from 'react';\nimport {Theme} from '@astryxdesign/core/theme';\nimport {themes, type ThemeSlug} from './astryx-themes';\n\nconst [slug, setSlug] = useState<ThemeSlug>('neutral');\nconst app = <Theme theme={themes[slug]}><YourApp /></Theme>;",
        },
        {
          type: 'prose',
          text: '`theme add` records an installed package theme and regenerates `src/astryx-themes.ts` or `.js` with its built module, production CSS, and optional font CSS. In a project without `src`, the module is at the project root. The first imported theme becomes the default. `theme use <slug>` changes that default, and `theme remove <slug>` removes a non-default theme.',
        },
        {
          type: 'prose',
          text: 'Customize a package theme with `defineTheme({extends: importedTheme, ...})`, then build and add that local theme. Use `theme eject` only when you want an independent source fork that no longer receives the package owner\'s updates. For the full authoring guide, see {@link generic:author-a-theme}.',
        },
      ],
    },
    {
      title: 'Available Themes',
      content: [
        {
          type: 'prose',
          text: 'Install the theme package you want with `npm install @astryxdesign/theme-{name}`, then import its slug with `theme add <slug>`. The CLI imports the package\'s built outputs for you.',
        },
        {
          type: 'table',
          headers: ['Theme', 'Add command', 'Description'],
          rows: [
            ['Neutral', 'astryx theme add neutral', 'Muted, minimal aesthetic with Figtree typography. A good starting point.'],
            ['Butter', 'astryx theme add butter', 'Golden, buttery surfaces with blue accents; Sarina + Outfit type.'],
            ['Chocolate', 'astryx theme add chocolate', 'Warm brown tones and cozy beige; Fraunces + Albert Sans type.'],
            ['Gothic', 'astryx theme add gothic', 'Dark-only atmospheric theme; deep blue-gray surfaces, distressed display type.'],
            ['Matcha', 'astryx theme add matcha', 'Earthy greens; DM Sans + Playwrite US Trad type.'],
            ['Stone', 'astryx theme add stone', 'Warm stone and slate tones; Montserrat + Figtree type.'],
            ['Y2K', 'astryx theme add y2k', 'Playful Y2K pop; periwinkle body, holographic accents, Poppins + Crimson Text.'],
          ],
        },
        {
          type: 'prose',
          text: 'Every first-party package exports its built theme at `@astryxdesign/theme-{name}/built`, production CSS at `/theme.css`, and font loading CSS at `/fonts.css`. `theme add` writes those imports into the generated app module.',
        },
      ],
    },
    {
      title: 'Theme Props',
      content: [
        {
          type: 'prose',
          text: "`<Theme>` takes `theme` (required), `mode` (`'system'` by default, or `'light'`/`'dark'`), and `children`. For every prop, run `astryx component Theme`.",
        },
      ],
    },
    {
      id: 'integration-themes',
      title: 'Using a Theme from an Integration',
      content: [
        {
          type: 'prose',
          text: 'Install the integration as a direct dependency. Astryx discovers its themes and guides without an `astryx.config` entry. A theme can be added only when the installed package exports its built module and production stylesheet.',
        },
        {
          type: 'code',
          lang: 'bash',
          label: 'Install, inspect, and add',
          code: 'npm install @astryxdesign/core @acme/brand-integration\nastryx theme list --package @acme/brand-integration\nastryx docs brand-theme\nastryx theme add ocean --package @acme/brand-integration',
        },
        {
          type: 'prose',
          text: '`theme add` keeps the owner package in the app record and imports its built module, stylesheet, and optional font stylesheet. Package updates continue to reach the app. Run `theme eject ocean --package @acme/brand-integration` only to copy the source and descriptor into `src/themes/ocean` as an independent local fork.',
        },
      ],
    },
    {
      id: 'light-dark-mode',
      title: 'Dark mode',
      content: [
        {
          type: 'prose',
          text: "Use [light, dark] tuples in token values for automatic mode switching. Use mode='system' (default) on Theme to follow OS preference.",
        },
        {
          type: 'code',
          lang: 'tsx',
          label: 'Light/dark tuple',
          code: "'--color-accent': ['#0064E0', '#2694FE'],\n//                   ^light     ^dark",
        },
        {
          type: 'code',
          lang: 'tsx',
          label: 'Toggle with a button',
          code: "const [mode, setMode] = useState<'light' | 'dark'>('light');\n\n<Theme theme={myTheme} mode={mode}>\n  <Button\n    label={mode === 'light' ? 'Switch to Dark' : 'Switch to Light'}\n    onClick={() => setMode(m => (m === 'light' ? 'dark' : 'light'))}\n  />\n</Theme>;",
        },
        {
          type: 'prose',
          text: 'To create a theme with custom dark mode colors, see {@link generic:author-a-theme}.',
        },
      ],
    },
    {
      id: 'nesting-themes',
      title: 'Nested themes',
      content: [
        {
          type: 'prose',
          text: 'Wrap different sections in separate `<Theme>` providers.',
        },
        {
          type: 'code',
          lang: 'tsx',
          label: 'Dark sidebar with light content',
          code: "<Theme theme={lightTheme} mode=\"light\">\n  <Layout\n    header={<LayoutHeader>...</LayoutHeader>}\n    start={\n      <Theme theme={darkTheme} mode=\"dark\">\n        <LayoutPanel>{/* Dark sidebar */}</LayoutPanel>\n      </Theme>\n    }\n    content={<LayoutContent>{/* Light content */}</LayoutContent>}\n  />\n</Theme>",
        },
      ],
    },
    {
      title: 'Runtime vs Built Themes',
      content: [
        {
          type: 'prose',
          text: 'Themes work in two modes:',
        },
        {
          type: 'table',
          headers: ['', 'Runtime (source)', 'Built'],
          rows: [
            ['Import (published theme)', '@astryxdesign/theme-{name}', '@astryxdesign/theme-{name}/built + theme.css'],
            ['Import (custom theme)', 'defineTheme() directly', 'Built .js + .css from `astryx theme build`'],
            ['How it works', 'useInsertionEffect injects <style> at hydration', 'Pre-compiled .css file loaded with the page'],
            ['Component overrides', 'Injected client-only', 'In static CSS: present during SSR'],
            ['SSR safe', 'Tokens yes, component overrides flash on hydration', 'Fully SSR safe: no flash'],
            ['Best for', 'Authoring input for `astryx theme build`', 'App wiring, in development and production'],
          ],
        },
        {
          type: 'list',
          style: 'do',
          items: [
            'Use `theme add` for production apps; it wires the built module and CSS.',
            'Import `themes` and `defaultThemeSlug` from the generated module once, and keep that wiring in development too.',
            'While you edit a local theme, run `astryx theme build --watch` so its built files stay current.',
            'Run `astryx theme build` for custom themes to get the built artifacts.',
          ],
        },
        {
          type: 'list',
          style: 'dont',
          items: [
            'Use runtime themes in production SSR apps; component overrides will flash on hydration.',
            "Import /built without the CSS file; component overrides won't apply.",
            'Import package theme source into app runtime code.',
            'Hand-edit the generated theme module; `theme add`, `theme remove`, and `theme use` regenerate it.',
          ],
        },
        {
          type: 'prose',
          text: 'To build a custom theme for production, see the Build section of {@link generic:author-a-theme}.',
        },
      ],
    },
  ],
};
