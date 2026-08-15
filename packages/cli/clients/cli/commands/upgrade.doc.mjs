// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file CommandDoc for `astryx upgrade`. The terminal binding of the `upgrade()`
 * function (referenced via `fn`); its args/flags map to that function's params
 * so a converter can build Commander config + --help from one source of truth.
 * @position packages/cli/clients/cli/commands — command documentation
 */

/** @type {import('@astryxdesign/cli/authoring').CommandDoc} */
export const doc = {
  type: 'command',
  name: 'upgrade',
  displayName: 'astryx upgrade',
  namespace: 'cli',
  summary: 'Run codemods to migrate between versions',
  description:
    'Migrates project source from a previous Astryx version to the installed one by ' +
    'running the registered codemods, and refreshes the managed agent-docs block. ' +
    'Dry-run by default (preview only); pass --apply to write changes to disk.',
  fn: 'upgrade',
  options: [
    {
      flag: '--from <version>',
      param: 'options.from',
      description: 'Previous version before the dependency upgrade',
    },
    {
      flag: '--apply',
      param: 'options.apply',
      description: 'Write changes to disk (default: dry-run)',
      default: false,
    },
    {
      flag: '--force',
      param: 'options.force',
      description:
        'Run codemods even if --from is newer than the installed version',
      default: false,
    },
    {
      flag: '--codemod <name>',
      param: 'options.codemod',
      description: 'Run a specific transform only',
    },
    {
      flag: '--skip-codemod <name...>',
      param: 'options.skipCodemod',
      description:
        'Exclude named codemods (repeatable). Re-run past a failed codemod by skipping it.',
    },
    {
      flag: '--integration <package-or-file>',
      param: 'options.integration',
      description:
        'Explicit integration package name or integration file path (repeatable)',
      default: [],
    },
    {
      flag: '--path <dir>',
      param: 'options.path',
      description: 'Source directory to scan',
      default: './src',
    },
    {
      flag: '--install-deps',
      param: 'options.installDeps',
      description: 'Auto-install jscodeshift without prompting',
      default: false,
    },
    {
      flag: '--list',
      param: 'options.list',
      description: 'List available codemods',
      default: false,
    },
  ],
  examples: [
    {label: 'List available codemods', cli: 'astryx upgrade --list --json'},
    {label: 'Apply a migration', cli: 'astryx upgrade --from 0.1.0 --apply'},
  ],
  exitCodes: [
    {code: 0, when: 'success (including dry-run previews)'},
    {
      code: 1,
      when: 'missing or invalid --from, a --path escape, an unknown codemod, or a codemod failure',
    },
  ],
  related: ['init', 'doctor'],
};
