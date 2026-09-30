// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file `astryx docs cli/integrations/components`: add a component to an
 * integration package, describe it, and make its public import resolve.
 */

/** @type {import('@astryxdesign/cli/authoring').ReferenceDoc} */
export const docs = {
  type: 'generic',
  name: 'components',
  placement: {parent: 'namespace:integrations', slot: 'contribute', order: 10},
  title: 'Components',
  category: 'guide',
  keywords: ['integration component', 'ship a component'],
  description:
    'Add a component to your package, describe it, and make its import work in every app that installs the package.',
  sections: [
    {
      id: 'add-a-component',
      title: 'Add a component',
      content: [
        {
          type: 'prose',
          text: 'Run `integration add component` in your package with a PascalCase name. It writes the component, its doc file, and the public import apps use.',
        },
        {
          type: 'code',
          lang: 'bash',
          code: 'npx astryx integration add component AcmeCarousel',
        },
        {
          type: 'code',
          lang: 'text',
          code: `component contribution added

[ok] AcmeCarousel

Declare component root ./components in astryx.integration.mjs.

- components/AcmeCarousel.doc.mjs
- components/AcmeCarousel.tsx
- package.json
- astryx.integration.mjs`,
        },
        {
          type: 'prose',
          text: "`AcmeCarousel.tsx` exports a placeholder `AcmeCarousel`. Replace it with your component and keep the export name. The first add also creates `astryx.integration.mjs` with `components: './components'`.",
        },
        {
          type: 'prose',
          text: 'Add never overwrites a file, and `--dry-run` shows what it would write. Component commands read Core, so install `@astryxdesign/core` in the package first ({@link generic:package-setup}).',
        },
      ],
    },
    {
      id: 'describe-the-component',
      title: 'Describe the component',
      content: [
        {
          type: 'prose',
          text: 'Edit `AcmeCarousel.doc.mjs` so people and agents know what the component is for and which props it takes. `npx astryx component AcmeCarousel` prints the result.',
        },
        {
          type: 'code',
          lang: 'js',
          code: `// components/AcmeCarousel.doc.mjs
/** @type {import('@astryxdesign/cli/authoring').ComponentDoc} */
export default {
  type: 'component',
  name: 'AcmeCarousel',
  displayName: 'Acme Carousel',
  import: '@acme/astryx-widgets/components/AcmeCarousel',
  usage: {description: 'Cycles through slides one at a time. Use it for a few related cards.'},
  props: [
    {name: 'slides', type: 'ReactNode[]', description: 'The slides to show, in order.', required: true},
    {name: 'interval', type: 'number', description: 'Milliseconds between slides.', default: '5000'},
  ],
};`,
        },
        {
          type: 'table',
          headers: ['Field', 'What to write'],
          rows: [
            ['`type`', "Always `'component'`."],
            [
              '`name`',
              'The export name. Keep it as `integration add` wrote it.',
            ],
            ['`displayName`', 'The name people read, with spaces.'],
            ['`import`', 'The specifier apps import the component from.'],
            [
              '`usage.description`',
              'What it is and when to use it, in 2-3 sentences.',
            ],
            [
              '`props`',
              'One entry per public prop: `name`, `type`, `description`, and `default` or `required`.',
            ],
          ],
        },
        {
          type: 'prose',
          text: 'Every field, including `keywords` and `examples`, is in {@link generic:authoring}.',
        },
      ],
    },
    {
      id: 'make-the-import-resolve',
      title: 'Make the import resolve',
      content: [
        {
          type: 'prose',
          text: 'Apps copy the `import` field into their code, so it must resolve from your packed package. `integration add` writes it together with an `exports` entry in package.json.',
        },
        {
          type: 'code',
          lang: 'json',
          code: `"exports": {
  "./components/AcmeCarousel": "./components/AcmeCarousel.tsx"
}`,
        },
        {
          type: 'prose',
          text: 'Add writes the entry only when package.json already has an `exports` map, so start every package with `"exports": {}`. Before you publish, `npx astryx integration verify` installs the packed package in a temporary app, resolves each `import`, and checks that the module exports the component\'s `name`. It fails with:',
        },
        {
          type: 'list',
          style: 'unordered',
          items: [
            '`component_import_unresolvable` when `exports` has no entry for the import.',
            '`component_export_missing` when the module does not export `AcmeCarousel`, or when package.json has no `exports` map at all.',
            '`typescript_extension_in_specifier` when the import ends in `.ts` or `.tsx`.',
          ],
        },
        {
          type: 'prose',
          text: 'To import from the package root instead, set `import: \'@acme/astryx-widgets\'` and re-export the component from the file that `exports["."]` points to. See {@link command:integration verify}.',
        },
      ],
    },
    {
      id: 'pick-a-component-name',
      title: "Pick a component name Core doesn't use",
      content: [
        {
          type: 'prose',
          text: 'A component named like a Core component, such as `Button`, makes that name ambiguous in every app. Rename it, or keep it and know that apps must pass `--package` to reach it.',
        },
        {
          type: 'code',
          lang: 'bash',
          code: 'npx astryx doctor integration components',
        },
        {
          type: 'code',
          lang: 'text',
          code: `severity:           [warn]
name:               Button
integrationPackage: @acme/astryx-widgets
message:            Component "Button" conflicts with Core. Consider renaming the integration component. If you keep it, always select it with --package.
command:            npx astryx component Button --package @acme/astryx-widgets`,
        },
        {
          type: 'prose',
          text: 'The check exits 0 on a clash and 1 when the package cannot resolve `@astryxdesign/core`. In an app, `npx astryx component Button` fails with `Component "Button" is provided by multiple packages`, and `--package @acme/astryx-widgets` selects yours. `--package` narrows one lookup; it does not filter `component --list`.',
        },
      ],
    },
    {
      id: 'see-it-in-an-app',
      title: 'See it in an app',
      content: [
        {
          type: 'prose',
          text: 'An app that installs your package sees your component beside the Core ones, with your package name and import. The app needs no config.',
        },
        {
          type: 'code',
          lang: 'bash',
          code: `npx astryx component AcmeCarousel
npx astryx component --list
npx astryx search carousel`,
        },
        {
          type: 'code',
          lang: 'text',
          code: `# AcmeCarousel

Cycles through slides one at a time. Use it for a few related cards.

**Import:** \`import {AcmeCarousel} from '@acme/astryx-widgets/components/AcmeCarousel';\``,
        },
        {
          type: 'prose',
          text: '`component --list` shows it as `import: @acme/astryx-widgets/components/AcmeCarousel  [@acme/astryx-widgets]`. The same commands work in your package while you build it. To install the packed package in a test app, see {@link generic:test-in-an-app}.',
        },
      ],
    },
  ],
};
