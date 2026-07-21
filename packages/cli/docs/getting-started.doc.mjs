// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('../../core/src/docs-types').ReferenceDoc} */

export const docs = {
  name: 'getting-started',
  title: 'Getting Started',
  category: 'guide',
  description:
    'Add the design system to your project and start building.',

  sections: [
    {
      title: 'Quick Start with AI',
      content: [
        {
          id: 'getting-started-b1',
          type: 'prose',
          text: 'Paste this into your AI coding tool and let it handle the setup:',
        },
        {
          id: 'getting-started-b2',
          type: 'code',
          lang: 'text',
          label: 'Paste this into your AI',
          code: 'Install @astryxdesign/core, @astryxdesign/theme-neutral, and @astryxdesign/cli in this project. Run `npx astryx init` to set up agent docs. Read the generated files to learn the conventions.',
        },
      ],
    },
    {
      title: 'Install',
      content: [
        {
          id: 'getting-started-b3',
          type: 'prose',
          text: 'Add the core package, a theme, and the CLI to your existing project.',
        },
        {
          id: 'getting-started-b4',
          type: 'code',
          lang: 'bash',
          label: 'Terminal',
          code: `npm install @astryxdesign/core @astryxdesign/theme-neutral @astryxdesign/cli`,
        },
        {
          id: 'getting-started-b5',
          type: 'prose',
          text: 'Then run the init wizard to set up AI agent docs, pick a starter template, and learn about theming.',
        },
        {
          id: 'getting-started-b6',
          type: 'code',
          lang: 'bash',
          label: 'Terminal',
          code: `npx astryx init`,
        },
      ],
    },
    {
      title: 'Add the theme CSS',
      content: [
        {
          id: 'getting-started-b7',
          type: 'prose',
          text: 'Import the reset stylesheet and a theme in your global CSS file. Themes provide all design tokens (colors, spacing, radius, typography) as CSS custom properties.',
        },
        {
          id: 'getting-started-b8',
          type: 'code',
          lang: 'css',
          label: 'globals.css',
          code: `@import '@astryxdesign/core/reset.css';
@import '@astryxdesign/core/astryx.css';
@import '@astryxdesign/theme-neutral/theme.css';`,
        },
        {
          id: 'getting-started-b9',
          type: 'prose',
          text: 'Available themes: @astryxdesign/theme-neutral (muted minimal, a good starting point), @astryxdesign/theme-butter, @astryxdesign/theme-chocolate, @astryxdesign/theme-gothic (dark-only), @astryxdesign/theme-matcha, @astryxdesign/theme-stone, and @astryxdesign/theme-y2k. See `npx astryx docs theme` for the full theming guide.',
        },
        {
          id: 'getting-started-b10',
          type: 'prose',
          text: 'These stylesheets are cascade-layered: the reset loads in @layer reset and component styles in @layer astryx-base. If your project has existing global CSS, a legacy reset, or Tailwind, declare the layer order explicitly and assign every stylesheet to a layer deliberately: unlayered styles and later layers both override astryx-base regardless of specificity. See the Cascade Layer Safety section in `npx astryx docs migration` before building screens.',
        },
      ],
    },
    {
      title: 'Add your first component',
      content: [
        {
          id: 'getting-started-b11',
          type: 'prose',
          text: 'Components are imported from per-category subpath entrypoints. This keeps bundles small and makes intent clear.',
        },
        {
          id: 'getting-started-b12',
          type: 'code',
          lang: 'tsx',
          label: 'app/page.tsx',
          code: `import {Button} from '@astryxdesign/core/Button';
import {VStack} from '@astryxdesign/core/Layout';

export default function Page() {
  return (
    <VStack gap={2}>
      <Button label="Hello Astryx" onClick={() => alert('Hi!')} />
    </VStack>
  );
}`,
        },
      ],
    },
    {
      title: 'Customize with StyleX',
      content: [
        {
          id: 'getting-started-b13',
          type: 'prose',
          text: 'Astryx components support various styling solutions, from plain CSS and `className` to Tailwind and CSS-in-JS. See the [styling docs](/docs/styling) for the full guide. Astryx also has a deep integration with [StyleX](https://stylexjs.com/), an atomic CSS-in-JS library: create styles with `stylex.create()` and pass them to components with the `xstyle` prop.',
        },
        {
          id: 'getting-started-b14',
          type: 'code',
          lang: 'tsx',
          label: 'Style overrides',
          code: `import * as stylex from '@stylexjs/stylex';

const overrides = stylex.create({
  save: { alignSelf: 'flex-end', marginTop: 16 },
});

<Button label="Save" xstyle={overrides.save} />`,
        },
      ],
    },
    {
      title: 'Example Apps',
      content: [
        {
          id: 'getting-started-b15',
          type: 'prose',
          text: 'For a full working project, clone one of the example apps from the repo. These are complete setups with routing, theming, and components wired together.',
        },
        {
          id: 'getting-started-b16',
          type: 'table',
          headers: ['Example', 'Stack', 'Path'],
          rows: [
            ['Next.js', 'Next.js + theme CSS', '[apps/example-nextjs](https://github.com/facebook/astryx/tree/main/apps/example-nextjs)'],
            ['Next.js + StyleX', 'Next.js + StyleX for custom styles', '[apps/example-nextjs-stylex](https://github.com/facebook/astryx/tree/main/apps/example-nextjs-stylex)'],
            ['Next.js + Tailwind', 'Next.js + Tailwind bridge', '[apps/example-nextjs-tailwind](https://github.com/facebook/astryx/tree/main/apps/example-nextjs-tailwind)'],
            ['Next.js Source', 'Next.js importing from source', '[apps/example-nextjs-source](https://github.com/facebook/astryx/tree/main/apps/example-nextjs-source)'],
            ['Vite', 'Vite', '[apps/example-vite](https://github.com/facebook/astryx/tree/main/apps/example-vite)'],
          ],
        },
        {
          id: 'getting-started-b17',
          type: 'code',
          lang: 'bash',
          label: 'Clone and run an example',
          code: `git clone https://github.com/facebook/astryx.git
cd astryx/apps/example-nextjs
pnpm install
pnpm dev`,
        },
      ],
    },
    {
      title: 'Explore the CLI',
      content: [
        {
          id: 'getting-started-b18',
          type: 'prose',
          text: 'The CLI is your reference for components, tokens, templates, and docs. For reliable invocation (especially with AI assistants), add this script to your package.json:',
        },
        {
          id: 'getting-started-b19',
          type: 'code',
          lang: 'json',
          label: 'package.json',
          code: `"scripts": {
  "astryx": "node node_modules/@astryxdesign/cli/bin/astryx.mjs"
}`,
        },
        {
          id: 'getting-started-b20',
          type: 'prose',
          text: 'Then discover what\'s available:',
        },
        {
          id: 'getting-started-b21',
          type: 'code',
          lang: 'bash',
          label: 'Terminal',
          code: `npx astryx component          # list all components
npx astryx component Button   # props, usage, theming for Button
npx astryx docs               # list all doc topics
npx astryx template --list    # available page templates
npx astryx docs tokens        # spacing, color, radius reference`,
        },
      ],
    },
  ],
};
