// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file `astryx docs check-your-code/doctor`: what `astryx doctor` checks in a
 * project, and how to read and act on its report.
 */

/** @type {import('@astryxdesign/cli/authoring').ReferenceDoc} */
export const docs = {
  type: 'generic',
  name: 'doctor',
  placement: {parent: 'namespace:check-your-code', slot: 'guides', order: 10},
  title: 'Run doctor',
  category: 'guide',
  description:
    'Check setup, versions, and agent docs with `astryx doctor`, then fix each line it flags.',
  keywords: ['doctor', 'diagnose', 'health check', 'setup check', 'ci gate'],
  sections: [
    {
      id: 'run-it',
      title: 'Run it',
      content: [
        {
          type: 'code',
          lang: 'bash',
          code: 'astryx doctor\nastryx doctor --json   # for scripts and agents',
        },
        {
          type: 'prose',
          text: 'Doctor only reads; it never installs or writes. Each check prints a status: pass, info, warn (works, could be better), or fail (broken). Any fail exits 1, so it can gate CI. Every line that is not a pass carries a `fix:` naming the command or edit that clears it.',
        },
      ],
    },
    {
      id: 'what-it-checks',
      title: 'What it checks',
      content: [
        {
          type: 'table',
          headers: ['Check', 'What it looks at'],
          rows: [
            [
              'Node.js version, package manager',
              'The Node release and the package manager the project uses',
            ],
            [
              'Core installed, peers, CLI alignment',
              'Whether Core is installed, its peers are met, and the CLI release matches it',
            ],
            ['astryx.config.mjs', 'Whether the config validates'],
            ['Theme packages', 'Whether a theme package is installed'],
            [
              'Integration contributions',
              "Whether each installed integration's docs, components, and themes load",
            ],
            [
              'AI agent docs',
              'Whether the block init wrote into AGENTS.md or CLAUDE.md is present and current',
            ],
            ['Newest release', 'Whether a newer Astryx release is out'],
          ],
        },
        {
          type: 'prose',
          text: 'Outside a project it checks the computer instead: Node, the release that answered, and the computer-level agent text. Doctor checks setup, not design: judge the page itself with {@link generic:agent-review}. Every subcommand and flag: {@link command:doctor}.',
        },
      ],
    },
  ],
};
