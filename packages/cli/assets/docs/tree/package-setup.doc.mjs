// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file `astryx docs cli/integrations/package-setup`: the package.json fields
 * an integration needs, the integration file, adopting an existing package,
 * and the authoring types.
 */

/** @type {import('@astryxdesign/cli/authoring').ReferenceDoc} */
export const docs = {
  type: 'generic',
  name: 'package-setup',
  placement: {parent: 'namespace:integrations', slot: 'start', order: 30},
  title: 'Set up an integration package',
  category: 'guide',
  keywords: ['package.json', 'exports map', 'astryx.integration.mjs'],
  description:
    'Set the package.json fields and the integration file your package needs, adopt a package you already publish, and type your files.',
  sections: [
    {
      id: 'fill-in-package-json',
      title: 'Fill in package.json',
      content: [
        {
          type: 'prose',
          text: 'An integration is an ordinary npm package, and six package.json fields matter. `integration add` updates `exports` and `files` when they exist, and `add doc --parent` and `add theme` write the CLI peer.',
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
              '`@astryxdesign/core` if your source imports it; `@astryxdesign/cli` `>=0.7.0`, optional, if you ship a docs section, a placed guide, a doc section `id`, a template `replaces`, or a theme',
              '`integration add doc --parent` and `integration add theme` write the CLI peer, and `integration verify` fails when a needed one is missing.',
            ],
            [
              '`devDependencies`',
              '`@astryxdesign/cli` and `@astryxdesign/core`',
              '`npx astryx` runs this CLI, and component commands read this Core.',
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
      title: 'Edit astryx.integration.mjs',
      content: [
        {
          type: 'prose',
          text: 'The first `integration add` writes `astryx.integration.mjs` beside package.json, and each add declares its root there. The default export points at your roots; the named exports `debug` and `gapReport` add handlers.',
        },
        {
          type: 'code',
          lang: 'javascript',
          label: 'astryx.integration.mjs',
          code: "/** @type {import('@astryxdesign/cli/authoring').AstryxIntegration} */\nexport default {\n  components: './components',\n  templates: './templates',\n  themes: './themes',\n  docs: './docs',\n  codemods: './codemods',\n  agentDocs: {append: ['Use AcmeCarousel for rotating content.']},\n  issuesUrl: 'https://github.com/acme/astryx-widgets/issues',\n};\n\n/** @param {import('@astryxdesign/cli/authoring').DebugEvent} event */\nexport function debug(event) {} // one synchronous call per command\n\n/** @type {import('@astryxdesign/cli/authoring').GapReportHandler} */\nexport const gapReport = {\n  audience: 'public',\n  async handle(report) {\n    return {status: 'routed_only', url: 'https://github.com/acme/astryx-widgets/issues/new'};\n  },\n};",
        },
        {
          type: 'list',
          style: 'unordered',
          items: [
            'Roots are paths relative to package.json. The CLI writes them, and it keeps a custom one such as `./src/components`.',
            'Leave `providerId` out, and it defaults to the package name. After a rename, set it to the old name so doc links that name the old package keep resolving.',
            '`issuesUrl` is where people file issues about your package; `npx astryx gap-report` shows it. The handlers are in {@link generic:debug-and-gap-reports}.',
          ],
        },
      ],
    },
    {
      id: 'adopt-an-existing-package',
      title: 'Adopt an existing package',
      content: [
        {
          type: 'prose',
          text: 'Run `integration add` in a package you already publish. It keeps your layout and updates the package.json fields that are already there.',
        },
        {
          type: 'code',
          lang: 'bash',
          code: '# Show what the add would write, then write it\nnpx astryx integration add component AcmeCarousel --dry-run\nnpx astryx integration add component AcmeCarousel',
        },
        {
          type: 'list',
          style: 'unordered',
          items: [
            "A custom root, such as `components: './src/components'`, stays, and new files go there.",
            'An existing `files` list gets the root and `astryx.integration.mjs`.',
            'An existing `exports` map keeps your entries and gets one more, such as `"./src/components/AcmeCarousel"`.',
            'With no `exports` map, the add writes none, because a new map closes deep imports your users may rely on. When you add one, give it an entry for each component and template you already added; later adds write theirs.',
          ],
        },
        {
          type: 'prose',
          text: "If your main entry already exports the component, point the doc's `import` at it and drop the generated `exports` entry. `integration verify` checks that the entry exports the name.",
        },
        {
          type: 'code',
          lang: 'javascript',
          label: 'src/components/AcmeCarousel.doc.mjs',
          code: "export default {\n  type: 'component',\n  name: 'AcmeCarousel',\n  import: '@acme/astryx-widgets',\n  // ...the rest of the doc\n};",
        },
      ],
    },
    {
      id: 'type-your-files',
      title: 'Type your files',
      content: [
        {
          type: 'prose',
          text: '`@astryxdesign/cli/authoring` exports a type for every file you write. Add it as a JSDoc `@type` for editor checks; the CLI checks the same shape when it loads the file.',
        },
        {
          type: 'table',
          headers: ['File', 'Type'],
          rows: [
            ['`astryx.integration.mjs`, default export', '`AstryxIntegration`'],
            [
              '`astryx.integration.mjs`, `debug` export',
              '`DebugEvent`, the event it receives',
            ],
            [
              '`astryx.integration.mjs`, `gapReport` export',
              '`GapReportHandler`, which receives a `GapReport` (with its `GapReportCategory` and `GapReportTarget`) and a `GapReportHandlerContext`, and returns a `GapReportHandlerReceipt`',
            ],
            ['`components/AcmeCarousel.doc.mjs`', '`ComponentDoc`'],
            ['`templates/acme-dashboard.doc.mjs`', '`TemplateDoc`'],
            ['`themes/ocean/oceanTheme.doc.mjs`', '`ThemeDoc`'],
            ['`docs/deploying.doc.mjs`', '`ReferenceDoc` for a topic or guide'],
            ['`docs/acme.doc.mjs`', '`NamespaceDoc` for a docs section'],
            [
              '`codemods/1.1.0/rename-prop.mjs`',
              "`AstryxCodemod` for `type: 'code'`, `AstryxConfigCodemod` for `type: 'config'`",
            ],
            ["An app's `astryx.config.mjs`", '`AstryxConfig`'],
          ],
        },
        {
          type: 'prose',
          text: "The package also exports `HookDoc`, `FunctionDoc`, `CommandDoc`, `SchemaDoc`, and `EnumDoc`, which type the docs that Core and the CLI ship. A package's roots do not load them. Every field of every type is in {@link generic:authoring}.",
        },
      ],
    },
  ],
};
