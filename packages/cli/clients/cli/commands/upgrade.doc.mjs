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
  summary: 'Migrate versions and update ShadCN-copied compositions',
  description:
    'Migrates project source from a previous Astryx version to the installed one by ' +
    'running the registered codemods, and refreshes the fully rendered managed ' +
    'agent-docs block when Core or configured integration guidance changes. ' +
    'Dry-run by default. --apply writes codemod and receipt changes, runs hooks, then refreshes agent docs. ' +
    'Anything a post-codemod hook prints goes to stderr, so stdout carries only the result. ' +
    'ShadCN-copied compositions are checked automatically during a normal upgrade, or alone with --registry.',
  fn: 'upgrade',
  options: [
    {
      flag: '--from <version>',
      param: 'options.from',
      description:
        'Previous version before the dependency upgrade; required unless --list or --registry is set. ' +
        'The target is the installed @astryxdesign/core version, or legacy @xds/core when @astryxdesign/core is not installed',
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
      description:
        'Run only the named codemod. Optional codemods run only when named here; a normal run skips them. ' +
        'Also skips the check of ShadCN-copied compositions. An unknown name exits 1 with ERR_UNKNOWN_CODEMOD when the version range has codemods',
    },
    {
      flag: '--skip-codemod <name...>',
      param: 'options.skipCodemod',
      description:
        'Exclude named codemods (repeatable). Re-run past a failed codemod by skipping it.',
    },
    {
      flag: '--integration <package>',
      param: 'options.integration',
      description:
        'Explicit integration specifier (repeatable). Resolved beneath node_modules; absolute paths and `.` or `..` segments are rejected.',
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
      description:
        'Install jscodeshift when it is missing. Without it, a missing jscodeshift fails the command with ERR_DEP_MISSING',
      default: false,
    },
    {
      flag: '--registry',
      param: 'options.registry',
      description:
        'Only reconcile ShadCN-copied compositions; --from is not required. ' +
        'Combining it with --list, --from, --force, --codemod, --skip-codemod, --integration or --install-deps exits 1 with ERR_INVALID_ARGUMENT',
      default: false,
    },
    {
      flag: '--list',
      param: 'options.list',
      description:
        'List available codemods and do nothing else. Every other flag is ignored, except --registry, which is refused (exit 1)',
      default: false,
    },
  ],
  examples: [
    {label: 'List available codemods', cli: 'astryx upgrade --list --json'},
    {
      label: 'Update ShadCN-copied compositions',
      cli: 'astryx upgrade --registry --apply',
    },
    {label: 'Apply a migration', cli: 'astryx upgrade --from 0.1.0 --apply'},
  ],
  exitCodes: [
    {code: 0, when: 'success (including dry-run previews)'},
    {
      code: 1,
      when:
        'missing or invalid --from, --registry with --list or a migration flag, a --path escape, ' +
        'no installed @astryxdesign/core (or legacy @xds/core), jscodeshift missing and not installed by --install-deps, ' +
        'an astryx.config that fails validation and that no pending config codemod repairs, ' +
        'an unknown codemod, a codemod or post-codemod hook failure, or unresolved registry items',
    },
  ],
  related: ['init', 'doctor'],
};
