// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file `astryx docs cli/integrations/versioning`: version an integration
 * package, know which changes break apps, declare peer ranges, keep apps on
 * older CLIs working, and match codemod folders to versions.
 */

/** @type {import('@astryxdesign/cli/authoring').ReferenceDoc} */
export const docs = {
  type: 'generic',
  name: 'versioning',
  placement: {parent: 'namespace:ship', slot: 'guides', order: 30},
  title: 'Versioning',
  category: 'guide',
  keywords: ['peer dependency', 'semver', 'cli version'],
  description:
    'Version your package, declare its peers, and keep apps on older CLIs working.',
  sections: [
    {
      id: 'pick-a-version',
      title: 'Pick a version',
      content: [
        {
          type: 'prose',
          text: 'Version your package with semver: a major version for a breaking change, a minor version for a new feature, and a patch for a fix.',
        },
        {
          type: 'code',
          lang: 'bash',
          code: '# 1.0.0 -> 2.0.0: a breaking change\nnpm version major\n# 1.0.0 -> 1.1.0: a new feature\nnpm version minor\n# 1.0.0 -> 1.0.1: a fix\nnpm version patch',
        },
        {
          type: 'list',
          style: 'unordered',
          items: [
            'Before 1.0.0, npm treats each minor version as breaking: an app that asks for `^0.6.0` never gets `0.7.0`. Bump the minor version for a breaking change, and the patch for anything else.',
            'Ship a codemod with each breaking change so apps can migrate; see {@link generic:codemods}.',
          ],
        },
      ],
    },
    {
      id: 'know-what-breaks-apps',
      title: 'Know what breaks apps',
      content: [
        {
          type: 'prose',
          text: 'A breaking change stops code, commands, or links that worked in an app from working after the upgrade. For an integration, these names are part of its API.',
        },
        {
          type: 'table',
          headers: ['You change or remove', 'What stops working in the app'],
          rows: [
            [
              'A component name, such as `AcmeCarousel`',
              'Imports, and `npx astryx component AcmeCarousel`',
            ],
            [
              'A template id, such as `acme-dashboard`',
              '`npx astryx template acme-dashboard`',
            ],
            ['A theme slug, such as `ocean`', '`npx astryx theme add ocean`'],
            [
              'A topic name or route, such as `acme/deploying`',
              'Reads of the old name, and links to it from other docs',
            ],
            [
              "A component's `import` path",
              'Imports written from the old path',
            ],
            [
              'An `exports` entry',
              'Imports of that path, which fail with `ERR_PACKAGE_PATH_NOT_EXPORTED`',
            ],
            ['A prop', 'Code that passes it'],
          ],
        },
        {
          type: 'prose',
          text: 'List each breaking change in your release notes, with the codemod that migrates it. Any changelog tool works. If `package.json` has a `files` allowlist, add `CHANGELOG.md` to it so npm packs it.',
        },
      ],
    },
    {
      id: 'declare-peer-ranges',
      title: 'Declare peer ranges',
      content: [
        {
          type: 'prose',
          text: 'Declare the Astryx packages that your code imports as peer dependencies, in `peerDependencies`, so the app installs one copy of each. Keep each range as wide as your tests prove.',
        },
        {
          type: 'table',
          headers: ['Peer', 'Declare it when', 'Range'],
          rows: [
            [
              '`@astryxdesign/core`',
              'Your code imports Core, as a theme does with `@astryxdesign/core/theme`',
              'The Core versions you test, such as `^0.6.0`',
            ],
            [
              '`@astryxdesign/theme-*`',
              'Your code imports that theme package',
              'The versions you test',
            ],
            [
              '`@astryxdesign/cli`',
              'You ship a docs section, a placed guide, a template that sets `replaces`, a doc section with an `id`, or a theme',
              '`>=0.7.0` for a docs section, a placed guide, or `replaces`; `>=0.6.4` when you ship only a theme or a section `id`. Optional in `peerDependenciesMeta`',
            ],
          ],
        },
        {
          type: 'code',
          lang: 'json',
          code: '{\n  "peerDependencies": {\n    "@astryxdesign/core": "^0.6.0",\n    "@astryxdesign/cli": ">=0.7.0"\n  },\n  "peerDependenciesMeta": {\n    "@astryxdesign/cli": {"optional": true}\n  }\n}',
        },
        {
          type: 'prose',
          text: '`integration verify` fails a package that needs the CLI peer and lacks it, or whose range admits a stable CLI too old for what it ships. `integration add doc --parent` and `integration add theme` write the peer for you.',
        },
      ],
    },
    {
      id: 'support-older-clis',
      title: 'Support older CLIs',
      content: [
        {
          type: 'prose',
          text: 'An app may run an older CLI than the one you build with. A CLI reads what it knows and skips the rest, but some newer files make an older CLI hide your docs.',
        },
        {
          type: 'list',
          style: 'unordered',
          items: [
            'An unknown field in `astryx.integration.mjs` is ignored with an `unknown_manifest_key` warning, and the rest of the manifest still loads.',
            'A named export that the CLI does not know is ignored with no warning, so `debug` and `gapReport` are safe to add.',
            'A stable CLI before 0.7.0 prints each `{@link ...}` as written.',
            'A stable CLI before 0.7.0 cannot read a docs section or a template that sets `replaces`. It can then hide every doc topic your package ships.',
            'A stable CLI before 0.6.4 cannot read a section `id` or a theme folder that `integration add theme` writes. It can then hide every doc topic your package ships.',
            'Stable 0.6.3 still loads your components, but 0.6.0 cannot read the component docs that `integration add component` writes: `component AcmeCarousel` fails there.',
          ],
        },
        {
          type: 'prose',
          text: '`integration verify` requires the CLI peer for a docs section, a placed guide, a template `replaces`, a doc section with an `id`, and a theme. A CLI too old for one of them cannot read it, and when it hides your topics, `docs` gives no warning.',
        },
      ],
    },
    {
      id: 'codemods-and-versions',
      title: 'Name codemod folders after Core versions',
      content: [
        {
          type: 'prose',
          text: 'Name each codemod folder after the Core version whose upgrade should run it, not after your package\'s version. Which folders an app runs, and when, is in "Choose when a codemod runs" in {@link generic:codemods}.',
        },
      ],
    },
  ],
};
