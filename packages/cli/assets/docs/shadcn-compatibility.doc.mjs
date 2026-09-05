// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').ReferenceDoc} */

export const docs = {
  name: 'shadcn-compatibility',
  title: 'Use Astryx with shadcn',
  category: 'guide',
  description:
    'Install Astryx components, examples, blocks, and pages through the shadcn Registry workflow without replacing the Astryx package or CLI.',

  sections: [
    {
      title: 'Overview',
      content: [
        {
          type: 'prose',
          text: 'Astryx supports the shadcn Registry as a compatibility and distribution protocol. This does not make Astryx a shadcn-based library. The Astryx packages remain the implementation and the Astryx CLI remains the primary interface for discovery, composition, theming, validation, and upgrades.',
        },
        {
          type: 'prose',
          text: 'A shadcn registry is static JSON that tells the shadcn CLI which package dependencies to install, which application-level files to copy, and which CSS imports to add. Read the protocol documentation at https://ui.shadcn.com/docs/registry.',
        },
        {
          type: 'prose',
          text: 'This compatibility path is experimental. Use it to test incremental adoption in an existing shadcn-style application. Do not treat the registry URL or generated catalog as a stable support promise until Astryx announces it as supported.',
        },
      ],
    },
    {
      title: 'Naming and URL Stability',
      content: [
        {
          type: 'prose',
          text: 'Registry URLs are organized by item kind and derived from stable Astryx doc identity: component and hook `name`, block `name` plus `exampleFor`, and the existing page-template slug. `displayName` remains free to change without changing an install URL.',
        },
        {
          type: 'code',
          lang: 'text',
          label: 'Registry path families',
          code: `/r/components/button.json
/r/hooks/use-app-shell-mobile.json
/r/showcases/button/variants.json
/r/examples/button/icon.json
/r/blocks/filter-toolbar.json
/r/templates/dashboard.json`,
        },
        {
          type: 'prose',
          text: 'A doc may set `registry.slug` when the derived slug is not the intended public name. After publication, keep prior relative paths in `registry.aliases`. Generation compares every name and path with a reviewed route lock, so an accidental rename fails instead of silently breaking old commands.',
        },
      ],
    },
    {
      title: 'What Gets Installed',
      content: [
        {
          type: 'table',
          headers: ['Item', 'What the CLI adds', 'Who owns updates'],
          rows: [
            [
              'Component or hook',
              'The published Astryx package plus a local public re-export',
              'Astryx updates the implementation through the package',
            ],
            [
              'Showcase or example',
              'Editable application-level composition source that imports Astryx packages',
              'Your app owns the composition; Astryx owns the imported components',
            ],
            [
              'Block',
              'A larger editable composition plus its package dependencies',
              'Your app owns the composition; Astryx owns the imported components',
            ],
            [
              'Page',
              'A complete editable page plus its package dependencies',
              'Your app owns the page; Astryx owns the imported components',
            ],
          ],
        },
        {
          type: 'prose',
          text: 'A normal registry install never copies Astryx component implementation source. Deep source customization remains an explicit `astryx swizzle <Name>` action because copied implementation source leaves the package upgrade path.',
        },
      ],
    },
    {
      title: 'Install with shadcn',
      content: [
        {
          type: 'prose',
          text: 'Use the install command shown on a component, example, or template page. The shadcn CLI reads the item, installs the declared dependencies, writes the local composition or re-export, and adds the Astryx CSS imports to your configured stylesheet.',
        },
        {
          type: 'code',
          lang: 'bash',
          label: 'Install the Button package entry',
          code: 'npx shadcn@latest add <registry-origin>/components/button.json',
        },
        {
          type: 'code',
          lang: 'bash',
          label: 'Install the editable Button showcase',
          code: 'npx shadcn@latest add <registry-origin>/showcases/button/variants.json',
        },
        {
          type: 'code',
          lang: 'bash',
          label: 'Install the complete dashboard page',
          code: 'npx shadcn@latest add <registry-origin>/templates/dashboard.json',
        },
      ],
    },
    {
      title: 'What the Command Changes',
      content: [
        {
          type: 'prose',
          text: 'For a component entry, the command installs `@astryxdesign/core` and writes a small local file such as `src/components/astryx/Button.ts` that re-exports `@astryxdesign/core/Button`. Behavior, accessibility, styling, and fixes still come from the package.',
        },
        {
          type: 'code',
          lang: 'ts',
          label: 'Generated public re-export',
          code: "export * from '@astryxdesign/core/Button';",
        },
        {
          type: 'prose',
          text: 'For an example, block, or page, the command writes editable TSX into your app. That TSX imports public Astryx package paths. It does not reach into package internals and it does not require a StyleX compiler in your app.',
        },
      ],
    },
    {
      title: 'Use the Astryx CLI for the Richer Path',
      content: [
        {
          type: 'prose',
          text: 'Use shadcn when you already use its registry workflow and know the exact item you want. Use the Astryx CLI when you need to discover the right component, compose a page from a natural-language request, inspect complete guidance, build a theme, validate an installation, or apply an upgrade codemod.',
        },
        {
          type: 'code',
          lang: 'bash',
          label: 'Astryx discovery and maintenance',
          code: `astryx build "analytics dashboard with filters"
astryx component Button
astryx template dashboard
astryx doctor
astryx upgrade --apply`,
        },
      ],
    },
    {
      title: 'Upgrade Model and Limits',
      content: [
        {
          type: 'list',
          style: 'unordered',
          items: [
            'Package upgrades update Astryx components, hooks, behavior, accessibility, and compiled styles.',
            'Copied examples, blocks, and pages are application code. They do not update automatically when the catalog changes.',
            'The experimental catalog excludes unpublished packages because an external package manager cannot install them.',
            'Your project needs a valid components.json and TypeScript configuration for the shadcn CLI to resolve target paths.',
            'The compatibility layer is additive. It does not require replacing existing shadcn components or migrating the whole application.',
          ],
        },
      ],
    },
  ],
};
