// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').ReferenceDoc} */

export const docs = {
  name: 'use-a-theme',
  title: 'Use a theme',
  category: 'guide',
  keywords: ['theme', 'Theme', 'dark mode', 'light', 'nested', 'provider', 'SSR', 'built', 'runtime', 'neutralTheme', 'available themes'],
  description: 'Apply a theme to your app: wrap in a provider, pick a theme, switch dark mode, nest themes, and choose runtime or built for production.',
  sections: [
    {
      id: 'quick-start',
      title: 'Wrap your app in a theme',
      content: [
        {type: 'code', lang: 'bash', label: 'Install a theme package', code: 'npm install @astryxdesign/theme-neutral'},
        {type: 'code', lang: 'tsx', label: 'Basic theme setup (runtime injection)', code: "import {Theme} from '@astryxdesign/core';\nimport {neutralTheme} from '@astryxdesign/theme-neutral';\n\nfunction App() {\n  return (\n    <Theme theme={neutralTheme}>\n      <YourApp />\n    </Theme>\n  );\n}"},
        {type: 'code', lang: 'tsx', label: 'Optimized setup (pre-built CSS)', code: "import {Theme} from '@astryxdesign/core';\nimport {neutralTheme} from '@astryxdesign/theme-neutral/built';\nimport '@astryxdesign/theme-neutral/theme.css';\n\nfunction App() {\n  return (\n    <Theme theme={neutralTheme}>\n      <YourApp />\n    </Theme>\n  );\n}"},
        {type: 'prose', text: 'Each theme ships as its own npm package. Install the one you want, then wrap your app in `<Theme>`. The same pattern works for every theme; just swap the package and import name.'},
        {type: 'prose', text: 'The default import uses runtime style injection, which works everywhere with no build step. The `/built` import skips injection and relies on the pre-compiled CSS file for better performance and SSR support.'},
      ],
    },
    {
      title: 'Available Themes',
      content: [
        {type: 'prose', text: 'Install the theme package you want with `npm install @astryxdesign/theme-{name}`, then import its theme object as shown below.'},
        {type: 'table', headers: ['Theme', 'Import', 'Description'], rows: [
          ['Neutral', "import {neutralTheme} from '@astryxdesign/theme-neutral'", 'Muted, minimal aesthetic with Figtree typography. A good starting point.'],
          ['Butter', "import {butterTheme} from '@astryxdesign/theme-butter'", 'Golden, buttery surfaces with blue accents; Sarina + Outfit type.'],
          ['Chocolate', "import {chocolateTheme} from '@astryxdesign/theme-chocolate'", 'Warm brown tones and cozy beige; Fraunces + Albert Sans type.'],
          ['Gothic', "import {gothicTheme} from '@astryxdesign/theme-gothic'", 'Dark-only atmospheric theme; deep blue-gray surfaces, distressed display type.'],
          ['Matcha', "import {matchaTheme} from '@astryxdesign/theme-matcha'", 'Earthy greens; DM Sans + Playwrite US Trad type.'],
          ['Stone', "import {stoneTheme} from '@astryxdesign/theme-stone'", 'Warm stone and slate tones; Montserrat + Figtree type.'],
          ['Y2K', "import {y2kTheme} from '@astryxdesign/theme-y2k'", 'Playful Y2K pop; periwinkle body, holographic accents, Poppins + Crimson Text.'],
        ]},
        {type: 'prose', text: "All theme packages export from two subpaths:\n- `@astryxdesign/theme-{name}`: source theme (runtime injection)\n- `@astryxdesign/theme-{name}/built`: pre-built theme (pair with `theme.css`)"},
      ],
    },
    {
      title: 'Theme Props',
      content: [
        {type: 'prose', text: "`<Theme>` takes `theme` (required), `mode` (`'system'` by default, or `'light'`/`'dark'`), and `children`. For every prop, run `astryx component Theme`."},
      ],
    },
    {
      id: 'integration-themes',
      title: 'Using a Theme from an Integration',
      content: [
        {type: 'prose', text: 'Install the integration as a direct dependency and Astryx discovers its source themes and guide topics without an `astryx.config` file. Install Core too because the copied source imports `defineTheme` from `@astryxdesign/core/theme`.'},
        {type: 'code', lang: 'bash', label: 'Install, inspect, copy, and build', code: 'npm install @astryxdesign/core @acme/brand-integration\nastryx theme list --package @acme/brand-integration\nastryx docs brand-theme\nastryx theme add ocean --package @acme/brand-integration\nastryx theme build src/themes/ocean/oceanTheme.ts'},
        {type: 'prose', text: "The copy is editable project source, not a reference back into node_modules. The complete theme directory comes with it, including its typed `.doc.mjs`, nested token and palette modules, and receipts. A second add refuses to overwrite those files unless you pass `--overwrite`."},
      ],
    },
    {
      id: 'light-dark-mode',
      title: 'Dark mode',
      content: [
        {type: 'prose', text: "Use [light, dark] tuples in token values for automatic mode switching. Use mode='system' (default) on Theme to follow OS preference."},
        {type: 'code', lang: 'tsx', label: 'Light/dark tuple', code: "'--color-accent': ['#0064E0', '#2694FE'],\n//                   ^light     ^dark"},
        {type: 'code', lang: 'tsx', label: 'Toggle with a button', code: "const [mode, setMode] = useState<'light' | 'dark'>('light');\n\n<Theme theme={myTheme} mode={mode}>\n  <Button\n    label={mode === 'light' ? 'Switch to Dark' : 'Switch to Light'}\n    onClick={() => setMode(m => (m === 'light' ? 'dark' : 'light'))}\n  />\n</Theme>;"},
        {type: 'prose', text: 'To create a theme with custom dark mode colors, see {@link generic:author-a-theme}.'},
      ],
    },
    {
      id: 'nesting-themes',
      title: 'Nested themes',
      content: [
        {type: 'prose', text: 'Wrap different sections in separate `<Theme>` providers.'},
        {type: 'code', lang: 'tsx', label: 'Dark sidebar with light content', code: "<Theme theme={lightTheme} mode=\"light\">\n  <Layout\n    header={<LayoutHeader>...</LayoutHeader>}\n    start={\n      <Theme theme={darkTheme} mode=\"dark\">\n        <LayoutPanel>{/* Dark sidebar */}</LayoutPanel>\n      </Theme>\n    }\n    content={<LayoutContent>{/* Light content */}</LayoutContent>}\n  />\n</Theme>"},
      ],
    },
    {
      title: 'Runtime vs Built Themes',
      content: [
        {type: 'prose', text: 'Themes work in two modes:'},
        {type: 'table', headers: ['', 'Runtime (source)', 'Built'], rows: [
          ['Import (published theme)', '@astryxdesign/theme-{name}', '@astryxdesign/theme-{name}/built + theme.css'],
          ['Import (custom theme)', 'defineTheme() directly', 'Built .js + .css from `astryx theme build`'],
          ['How it works', 'useInsertionEffect injects <style> at hydration', 'Pre-compiled .css file loaded with the page'],
          ['Component overrides', 'Injected client-only', 'In static CSS: present during SSR'],
          ['SSR safe', 'Tokens yes, component overrides flash on hydration', 'Fully SSR safe: no flash'],
          ['Best for', 'Dev, prototyping, client-only SPAs', 'Production, SSR apps (Next.js, Remix)'],
        ]},
        {type: 'list', style: 'do', items: [
          'Use the /built subpath + theme.css for production SSR apps.',
          'Use runtime themes during development for fast iteration.',
          'Run `astryx theme build` for custom themes to get the built artifacts.',
        ]},
        {type: 'list', style: 'dont', items: [
          'Use runtime themes in production SSR apps; component overrides will flash on hydration.',
          "Import /built without the CSS file; component overrides won't apply.",
        ]},
        {type: 'prose', text: 'To build a custom theme for production, see the Build section of {@link generic:author-a-theme}.'},
      ],
    },
  ],
};
