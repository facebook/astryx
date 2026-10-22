// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file `astryx docs upgrade-and-migrate/upgrade`: move a project to a new
 * Astryx release: bump, run the codemods, check.
 */

/** @type {import('@astryxdesign/cli/authoring').ReferenceDoc} */
export const docs = {
  type: 'generic',
  name: 'upgrade',
  placement: {
    parent: 'namespace:upgrade-and-migrate',
    slot: 'guides',
    order: 10,
  },
  title: 'Upgrade Astryx',
  category: 'guide',
  description:
    'Bump the Astryx packages, run `astryx upgrade --from <old version> --apply`, and check the result.',
  keywords: [
    'upgrade',
    'version bump',
    'new version',
    'codemod',
    'breaking change',
    'astryx upgrade',
  ],
  sections: [
    {
      id: 'steps',
      title: 'Upgrade in three steps',
      content: [
        {
          type: 'list',
          style: 'ordered',
          items: [
            'Note the version you have now (`@astryxdesign/core` in package.json), then bump `@astryxdesign/core`, `@astryxdesign/cli`, and any theme packages together with your package manager.',
            'Preview, then write: `astryx upgrade --from <old version>` shows each change; add `--apply` to write it.',
            'Run `astryx doctor` and your build, then review the diff like any other change.',
          ],
        },
        {
          type: 'code',
          lang: 'bash',
          label: 'From 0.6.4 to the installed release',
          code: 'npm install @astryxdesign/core@latest @astryxdesign/cli@latest\nastryx upgrade --from 0.6.4\nastryx upgrade --from 0.6.4 --apply\nastryx doctor',
        },
      ],
    },
    {
      id: 'what-codemods-do',
      title: 'What the codemods change',
      content: [
        {
          type: 'prose',
          text: 'Each release that renames a prop, moves an import, or changes a config field ships a codemod. `upgrade` runs every codemod between `--from` and the installed Core, in order, over `src` (or `--path`). Without `--apply` it is a dry run. Installed integrations can add their own codemods, and they run in the same pass.',
        },
        {
          type: 'list',
          style: 'unordered',
          items: [
            '`astryx upgrade --list` names every codemod and the release it belongs to.',
            '`--skip-codemod <name>` steps past one that failed; `--codemod <name>` runs only that one, including optional ones.',
          ],
        },
        {
          type: 'prose',
          text: 'Every flag and exit code: {@link command:upgrade}. Themes copied by an older `theme add` need one more step: {@link generic:earlier-theme-copies}.',
        },
      ],
    },
  ],
};
