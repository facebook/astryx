// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').ReferenceDoc} */
export const docs = {
  type: 'generic',
  name: 'make-a-package',
  placement: {
    parent: 'namespace:integrations',
    slot: 'start',
    order: 20,
  },
  title: 'Make a package',
  category: 'guide',
  keywords: [
    'make an integration',
    'first integration',
    'integration tutorial',
    'package.json',
    'exports map',
    'astryx.integration.mjs',
  ],
  description:
    'Create a new integration package or add Astryx to one you already publish.',
  sections: [
    {
      id: 'quick-start',
      title: 'Quick start',
      content: [
        {
          type: 'heading',
          level: 3,
          text: 'Make the package',
        },
        {
          type: 'prose',
          text: 'An integration starts as a normal npm package. Make a folder for it, create a package.json inside that folder, give the package a name, then install the Astryx CLI and Core for development.',
        },
        {
          type: 'code',
          lang: 'bash',
          code: "mkdir acme-widgets && cd acme-widgets\nnpm init -y\nnpm pkg set name=@acme/astryx-widgets\nnpm pkg set 'exports={}' --json\nnpm install -D @astryxdesign/cli @astryxdesign/core",
        },
        {
          type: 'list',
          style: 'unordered',
          items: [
            'Start with `"exports": {}`: each component and template you add then writes the public import that `integration verify` resolves.',
            'Run the CLI as `npx astryx`, which runs the version you installed.',
            'Component commands read Core, so they need `@astryxdesign/core` installed.',
          ],
        },
        {
          type: 'heading',
          level: 3,
          text: 'Add your first integration item',
        },
        {
          type: 'prose',
          text: 'An integration can ship several kinds of items. Start with a component named `AcmeCarousel`.',
        },
        {
          type: 'code',
          lang: 'bash',
          code: 'npx astryx integration add component AcmeCarousel',
        },
        {
          type: 'code',
          lang: 'text',
          code: 'component contribution added\n\n[ok] AcmeCarousel\n\nDeclare component root ./components in astryx.integration.mjs.\n\n- components/AcmeCarousel.doc.mjs\n- components/AcmeCarousel.tsx\n- package.json\n- astryx.integration.mjs',
        },
        {
          type: 'prose',
          text: '`integration add` creates the component source, its `.doc.mjs`, the package export, and `astryx.integration.mjs`. Update the generated doc so the CLI understands the component, then write the component itself.',
        },
        {
          type: 'prose',
          text: 'Read it back the way an app will.',
        },
        {
          type: 'code',
          lang: 'bash',
          code: 'npx astryx component AcmeCarousel',
        },
        {
          type: 'prose',
          text: 'You now have an integration package with one exported component.',
        },
        {
          type: 'heading',
          level: 3,
          text: 'Verify and pack the package',
        },
        {
          type: 'prose',
          text: 'Run `integration verify` to check that an app would see the component, then make the tarball you install next. `--pack-destination ..` writes it beside the package folder, so the next pack does not ship it.',
        },
        {
          type: 'code',
          lang: 'bash',
          code: 'npx astryx integration verify\nnpm pack --pack-destination ..',
        },
        {
          type: 'code',
          lang: 'text',
          code: 'Integration package ready\n\n[ok] @acme/astryx-widgets@1.0.0\n\n4 packed files; 3/3 required files present.',
        },
        {
          type: 'prose',
          text: '`integration verify` packs the package, unpacks it into a temporary app, and checks that the component resolves through its public import there. It publishes nothing and leaves no tarball, so `npm pack` writes `../acme-astryx-widgets-1.0.0.tgz` for the next step.',
        },
        {
          type: 'heading',
          level: 3,
          text: 'Use it in an app',
        },
        {
          type: 'prose',
          text: 'Install Core, the CLI, and your tarball in a new app. The app loads your package because it is a dependency, with no config.',
        },
        {
          type: 'code',
          lang: 'bash',
          code: 'cd ..\nmkdir my-app && cd my-app\nnpm init -y\nnpm install @astryxdesign/core @astryxdesign/cli ../acme-astryx-widgets-1.0.0.tgz\nnpx astryx component AcmeCarousel',
        },
        {
          type: 'code',
          lang: 'text',
          code: "**Import:** `import {AcmeCarousel} from '@acme/astryx-widgets/components/AcmeCarousel';`",
        },
        {
          type: 'prose',
          text: 'The next sections explain each package field and the integration file. To build the real component, continue with {@link namespace:components}.',
        },
      ],
    },
    {
      id: 'fill-in-package-json',
      title: 'Fill in package.json',
      content: [
        {
          type: 'prose',
          text: 'An integration is an ordinary npm package. These six fields control how it is named, developed, checked, and published.',
        },
        {
          type: 'prose',
          text: '`peerDependencies` are packages the app supplies. `devDependencies` are packages you use while building the integration.',
        },
        {
          type: 'table',
          headers: ['Field', 'Set it to', 'Why'],
          rows: [
            [
              '`name`',
              'Your package name, such as `@acme/astryx-widgets`',
              'Each add writes it into the `import` of the doc it generates. Rename before you add, or update each `import` after.',
            ],
            [
              '`version`',
              'The release you publish, such as `1.0.0`',
              'Apps see it; `astryx.integration.mjs` never repeats it.',
            ],
            [
              '`exports`',
              'Start with `{}`',
              'Each component and template add writes its public import here, and `integration verify` resolves it.',
            ],
            [
              '`files`',
              'Optional: the paths to publish',
              'Keeps private files out. When the list exists, each add appends its root and `astryx.integration.mjs`.',
            ],
            [
              '`peerDependencies`',
              '`@astryxdesign/cli`; add `@astryxdesign/core` when your code imports it',
              'The app supplies these packages for your integration.',
            ],
            [
              '`devDependencies`',
              '`@astryxdesign/cli` and `@astryxdesign/core`',
              'Lets you run the CLI and build components while working on the integration.',
            ],
          ],
        },
        {
          type: 'prose',
          text: 'Peer ranges and releases are covered in {@link generic:versioning}; `files` and publishing in {@link generic:publishing}.',
        },
      ],
    },
    {
      id: 'the-integration-file',
      title: 'The integration file',
      content: [
        {
          type: 'prose',
          text: 'The first `integration add` creates `astryx.integration.mjs`, and each later add updates it. You do not need to write or edit this file during the quick start.',
        },
        {
          type: 'heading',
          level: 3,
          text: 'Files in the package',
        },
        {
          type: 'list',
          style: 'unordered',
          items: [
            '`package.json` defines the npm package, including its name, version, dependencies, published files, and exports.',
            '`astryx.integration.mjs` tells the CLI where the package keeps each kind of integration item.',
            'The integration item files live under those roots. For example, a component can have `AcmeWidget.tsx` for its source and `AcmeWidget.doc.mjs` for its documentation.',
          ],
        },
        {
          type: 'heading',
          level: 3,
          text: 'Fields in the integration file',
        },
        {
          type: 'code',
          lang: 'javascript',
          label: 'astryx.integration.mjs',
          code: "/** @type {import('@astryxdesign/cli/authoring').AstryxIntegration} */\nexport default {\n  components: './components',\n};",
        },
        {
          type: 'prose',
          text: 'The file tells the CLI where this package keeps its integration items. Edit it only when you want a custom root or another optional setting. Paths are relative to package.json, and later adds keep a custom path you already set.',
        },
        {
          type: 'reference',
          target: 'schema:integration',
          projection: {
            fields: [
              'providerId',
              'components',
              'templates',
              'codemods',
              'docs',
              'themes',
              'agentDocs',
              'issuesUrl',
            ],
          },
          presentation: 'full',
        },
        {
          type: 'heading',
          level: 3,
          text: 'Use the CLI',
        },
        {
          type: 'prose',
          text: 'You can edit the package files by hand, but the CLI handles the normal workflow. These links always open the canonical command docs.',
        },
        {
          type: 'reference',
          target: 'command:integration add',
          presentation: 'summary',
        },
        {
          type: 'reference',
          target: 'command:integration verify',
          presentation: 'summary',
        },
        {
          type: 'reference',
          target: 'command:doctor integration',
          presentation: 'summary',
        },
      ],
    },
  ],
};
