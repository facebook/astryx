/** @type {import('../../core/src/docs-types').ReferenceDoc} */

export const docs = {
  name: 'getting-started',
  title: 'Getting Started',
  category: 'guide',
  description:
    'Add XDS to your project and start building.',

  sections: [
    {
      title: 'Quick Start with AI',
      content: [
        {
          type: 'prose',
          text: 'Paste this into your AI coding tool and let it handle the setup:',
        },
        {
          type: 'code',
          lang: 'text',
          label: 'Paste this into your AI',
          code: 'Install @xds/core, @xds/theme-default, and @xds/cli in this project. Run `npx xds init` to set up agent docs. Read the generated files to learn the conventions.',
        },
      ],
    },
    {
      title: 'Install',
      content: [
        {
          type: 'prose',
          text: 'Add the core package, a theme, and the CLI to your existing project.',
        },
        {
          type: 'code',
          lang: 'bash',
          label: 'Terminal',
          code: `npm install @xds/core @xds/theme-default @xds/cli`,
        },
        {
          type: 'prose',
          text: 'Then run the init wizard to set up AI agent docs, pick a starter template, and learn about theming.',
        },
        {
          type: 'code',
          lang: 'bash',
          label: 'Terminal',
          code: `npx xds init`,
        },
      ],
    },
    {
      title: 'Add the theme CSS',
      content: [
        {
          type: 'prose',
          text: 'Import the reset stylesheet and a theme in your global CSS file. Themes provide all design tokens (colors, spacing, radius, typography) as CSS custom properties.',
        },
        {
          type: 'code',
          lang: 'css',
          label: 'globals.css',
          code: `@import '@xds/core/reset.css';
@import '@xds/core/xds.css';
@import '@xds/theme-default/theme.css';`,
        },
        {
          type: 'prose',
          text: 'Available themes: @xds/theme-default (blue accent), @xds/theme-neutral (grayscale), @xds/theme-brutalist (zero radius, monospace). See `npx xds docs theme` for the full theming guide.',
        },
      ],
    },
    {
      title: 'Add your first component',
      content: [
        {
          type: 'prose',
          text: 'XDS components are imported from per-category subpath entrypoints. This keeps bundles small and makes intent clear.',
        },
        {
          type: 'code',
          lang: 'tsx',
          label: 'app/page.tsx',
          code: `import {XDSButton} from '@xds/core/Button';
import {XDSVStack} from '@xds/core/Layout';

export default function Page() {
  return (
    <XDSVStack gap={2}>
      <XDSButton label="Hello XDS" onClick={() => alert('Hi!')} />
    </XDSVStack>
  );
}`,
        },
      ],
    },
    {
      title: 'Customize with xstyle',
      content: [
        {
          type: 'prose',
          text: 'Every XDS component accepts an `xstyle` prop for StyleX style overrides created via `stylex.create()`.',
        },
        {
          type: 'code',
          lang: 'tsx',
          label: 'Style overrides',
          code: `import * as stylex from '@stylexjs/stylex';

const overrides = stylex.create({
  save: { alignSelf: 'flex-end', marginTop: 16 },
});

<XDSButton label="Save" xstyle={overrides.save} />`,
        },
      ],
    },
    {
      title: 'Example Apps',
      content: [
        {
          type: 'prose',
          text: 'For a full working project, clone one of the example apps from the XDS repo. These are complete setups with routing, theming, and components wired together.',
        },
        {
          type: 'table',
          headers: ['Example', 'Stack', 'Path'],
          rows: [
            ['Next.js', 'Next.js + XDS theme CSS', 'apps/example-nextjs'],
            ['Next.js + StyleX', 'Next.js + StyleX for custom styles', 'apps/example-nextjs-stylex'],
            ['Next.js + Tailwind', 'Next.js + Tailwind bridge', 'apps/example-nextjs-tailwind'],
            ['Next.js Source', 'Next.js importing XDS from source', 'apps/example-nextjs-source'],
            ['Vite', 'Vite + XDS', 'apps/example-vite'],
          ],
        },
        {
          type: 'code',
          lang: 'bash',
          label: 'Clone and run an example',
          code: `git clone https://github.com/facebookexperimental/xds.git
cd xds/apps/example-nextjs
yarn install
yarn dev`,
        },
      ],
    },
    {
      title: 'Explore the CLI',
      content: [
        {
          type: 'prose',
          text: 'The CLI is your reference for components, tokens, templates, and docs. For reliable invocation (especially with AI assistants), add this script to your package.json:',
        },
        {
          type: 'code',
          lang: 'json',
          label: 'package.json',
          code: `"scripts": {
  "xds": "node node_modules/@xds/cli/bin/xds.mjs"
}`,
        },
        {
          type: 'prose',
          text: 'Then discover what\'s available:',
        },
        {
          type: 'code',
          lang: 'bash',
          label: 'Terminal',
          code: `npm run xds -- component          # list all components
npm run xds -- component Button   # props, usage, theming for Button
npm run xds -- docs               # list all doc topics
npm run xds -- template --list    # available page templates
npm run xds -- docs tokens        # spacing, color, radius reference`,
        },
      ],
    },
  ],
};
