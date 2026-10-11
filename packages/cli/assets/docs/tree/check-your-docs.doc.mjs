// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file `astryx docs cli/integrations/docs/check-your-docs`: what each check
 * proves about an integration's docs: the docs check, the read size, and the
 * CLI peer.
 */

/** @type {import('@astryxdesign/cli/authoring').ReferenceDoc} */
export const docs = {
  type: 'generic',
  name: 'check-your-docs',
  placement: {parent: 'namespace:docs', slot: 'guides', order: 60},
  title: 'Check your docs',
  category: 'guide',
  description: 'Check the docs tree, links, overlaps, read size, and CLI peer.',
  sections: [
    {
      id: 'run-the-docs-check',
      title: 'Run the docs check',
      content: [
        {
          type: 'prose',
          text: 'Run `doctor integration docs` in your package to check the docs tree, every link, and overlaps with Core topics. Pass a package name to check an installed package.',
        },
        {
          type: 'code',
          lang: 'bash',
          code: 'npx astryx doctor integration docs\n# In an app, check an installed package\nnpx astryx doctor integration docs @acme/astryx-widgets',
        },
        {
          type: 'code',
          lang: 'text',
          code: 'Checking integration docs: @acme/astryx-widgets@1.0.0\n\n[ok] The docs tree and every link in these docs check out.\n\n[ok] No doc topics overlap with Core.',
        },
        {
          type: 'prose',
          text: 'Its arguments and exit codes are in {@link command:doctor integration docs}.',
        },
      ],
    },
    {
      id: 'know-what-fails-the-check',
      title: 'Know what fails the check',
      content: [
        {
          type: 'prose',
          text: 'A doc that does not load, an accidental Core overlap, or a failed namespace or placement fails the check with exit code 1. A link that names no doc only warns, and the exit code stays 0.',
        },
        {
          type: 'table',
          headers: ['Problem', 'Reported as', 'Exit code'],
          rows: [
            [
              'A doc that does not load, such as an unknown section field or block type',
              '`[fail]` `invalid_doc`',
              '1',
            ],
            [
              "A topic with a Core topic's name and no `replaces` or `extends`",
              '`[fail]` `accidental`',
              '1',
            ],
            [
              'A placement that fails, which hides the doc',
              '`[fail]` `invalid_doc_graph`',
              '1',
            ],
            ['A link that names no doc', '`[warn]` `invalid_doc_graph`', '0'],
            [
              'A topic that sets `replaces` or `extends`',
              '`[info]` `replaces` or `extends`',
              '0',
            ],
          ],
        },
        {
          type: 'prose',
          text: 'Read the warnings before you publish. With `--json`, they are in `data.issues`, with `severity: "warning"`.',
        },
      ],
    },
    {
      id: 'check-read-size',
      title: 'Check read size',
      content: [
        {
          type: 'prose',
          text: '`npx astryx doctor` also measures every read and warns on one over 32 KB. Run it in your package or in an app that installs it; `doctor integration docs` does not check size.',
        },
        {
          type: 'code',
          lang: 'bash',
          code: 'npx astryx doctor',
        },
        {
          type: 'code',
          lang: 'text',
          code: 'id:      docs-progressive-disclosure\nstatus:  [warn]\nlabel:   Documentation navigation and size\nmessage: acme/deploying build-before-you-ship: 46 KB, over the 32 KB one read may return',
        },
        {
          type: 'prose',
          text: 'Split a section over the limit into smaller ones, each with its own key. See {@link command:doctor}.',
        },
      ],
    },
    {
      id: 'check-the-cli-peer',
      title: 'Check the CLI peer',
      content: [
        {
          type: 'prose',
          text: '`integration verify` fails a package that ships a docs section, a placed guide, or a doc section with an `id` without an `@astryxdesign/cli` peer of `>=0.6.4`. It does not run the docs check, so run both.',
        },
        {
          type: 'code',
          lang: 'bash',
          code: 'npx astryx integration verify',
        },
        {
          type: 'code',
          lang: 'text',
          code: '- [fail] The package ships a namespace doc or a placed guide but declares no @astryxdesign/cli peer. A stable CLI before 0.6.4 does not read the docs tree, and can hide every doc topic the package ships. Declare "@astryxdesign/cli": ">=0.6.4" in peerDependencies (optional in peerDependenciesMeta, if the CLI is not required).',
        },
        {
          type: 'list',
          style: 'unordered',
          items: [
            '`integration add doc --parent` writes the peer for you.',
            '`integration verify` passes a hidden guide and an accidental Core overlap; only `doctor integration docs` catches them.',
            'Everything else it checks is in {@link command:integration verify} and {@link generic:checks}.',
          ],
        },
      ],
    },
  ],
};
