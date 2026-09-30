// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file `astryx docs cli/integrations/components/component-imports`: make an
 * integration component's documented import resolve from the packed package.
 */

/** @type {import('@astryxdesign/cli/authoring').ReferenceDoc} */
export const docs = {
  type: 'generic',
  name: 'component-imports',
  placement: {parent: 'namespace:components', slot: 'build', order: 30},
  title: 'Resolve the import',
  category: 'guide',
  description:
    'Keep the component doc import and package exports map aligned, then verify the packed package.',
  sections: [
    {
      id: 'export-the-component',
      title: 'Export the component',
      content: [
        {
          type: 'prose',
          text: 'Apps copy the component doc\'s `import` field into their code, so that exact specifier must resolve from your packed package. `integration add` writes it together with an `exports` entry in package.json.',
        },
        {
          type: 'code',
          lang: 'json',
          label: 'package.json',
          code: `"exports": {
  "./components/AcmeCarousel": "./components/AcmeCarousel.tsx"
}`,
        },
        {
          type: 'prose',
          text: 'Add writes the entry only when package.json already has an `exports` map, so start every package with `"exports": {}`.',
        },
      ],
    },
    {
      id: 'verify-the-packed-import',
      title: 'Verify the packed import',
      content: [
        {
          type: 'prose',
          text: '`integration verify` installs the packed package in a temporary app, resolves each documented import, and checks that the module exports the documented component name.',
        },
        {
          type: 'code',
          lang: 'bash',
          code: 'npx astryx integration verify',
        },
        {
          type: 'list',
          style: 'unordered',
          items: [
            '`component_import_unresolvable` means the exports map has no entry for the documented import.',
            '`component_export_missing` means the module does not export the documented name, or package.json has no exports map.',
            '`typescript_extension_in_specifier` means the public import ends in `.ts` or `.tsx`.',
          ],
        },
        {
          type: 'prose',
          text: 'To import from the package root, set `import: \'@acme/astryx-widgets\'` and re-export the component from the file that `exports["."]` points to. See {@link command:integration verify}.',
        },
      ],
    },
  ],
};
