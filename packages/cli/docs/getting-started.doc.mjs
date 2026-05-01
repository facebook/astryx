/** @type {import('../../core/src/docs-types').ReferenceDoc} */

export const docs = {
  name: 'getting-started',
  title: 'Getting Started',
  description:
    'Go from zero to a working XDS app in five steps.',

  sections: [
    {
      title: 'Install the CLI',
      content: [
        {
          type: 'prose',
          text: 'Use the XDS CLI to scaffold a new app. It wires up Next.js, the design system, and a working theme out of the box.',
        },
        {
          type: 'code',
          lang: 'bash',
          label: 'Terminal',
          code: `npx @xds/cli init my-app
cd my-app`,
        },
      ],
    },
    {
      title: 'Pick a theme',
      content: [
        {
          type: 'prose',
          text: 'Choose between the default theme and the neutral theme. Themes live as separate packages so you can swap them without touching component code.',
        },
        {
          type: 'code',
          lang: 'tsx',
          label: 'app/layout.tsx',
          code: `import '@xds/theme-default/styles.css';

export default function RootLayout({children}) {
  return <html><body>{children}</body></html>;
}`,
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
import {XDSStack} from '@xds/core/Layout';

export default function Page() {
  return (
    <XDSStack direction="vertical" gap={2}>
      <XDSButton label="Hello XDS" onPress={() => alert('Hi!')} />
    </XDSStack>
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
      title: 'Run the dev server',
      content: [
        {
          type: 'prose',
          text: 'Start the dev server and open the preview URL. Changes to components hot-reload automatically.',
        },
        {
          type: 'code',
          lang: 'bash',
          label: 'Terminal',
          code: `yarn dev`,
        },
      ],
    },
  ],
};
