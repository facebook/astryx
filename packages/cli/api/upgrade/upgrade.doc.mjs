// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file FunctionDoc for `upgrade()` / `astryx upgrade`. Colocated with the API
 * function it documents; the shape source of truth stays in `upgrade.type.mjs`.
 * @position packages/cli/api/upgrade — function documentation
 */

/** @type {import('@astryxdesign/cli/authoring').FunctionDoc} */
export const doc = {
  type: 'function',
  kind: 'api',
  name: 'upgrade',
  namespace: 'cli/api',
  displayName: 'upgrade()',
  summary:
    'After bumping @astryxdesign/core, migrate project source with codemods and update copied compositions.',
  description:
    'Runs the codemods between `from` and the installed Core version, then refreshes the ' +
    'managed agent-docs block. Dry-run by default; `apply` writes changes only after the ' +
    'selected codemods and hooks succeed. Config codemods run before astryx.config is ' +
    'loaded, so they can repair an invalid config. Also updates copied compositions from ' +
    'their install receipts: unchanged files are updated, non-overlapping edits are merged, ' +
    'and conflicts are left untouched. `list` only lists codemods; `registry` only updates ' +
    'copied compositions.',
  importPath: '@astryxdesign/cli/api',
  signature:
    'upgrade(options?: UpgradeOptions, ctx?: {cwd?: string}): Promise<UpgradeListResponse | UpgradeRegistryResponse | UpgradeStatusResponse | UpgradeRunResponse>',
  keywords: [
    'upgrade',
    'migrate',
    'codemod',
    'migration',
    'version',
    'registry',
  ],
  params: [
    {
      name: 'options.from',
      type: 'string',
      description:
        'Version before the dependency bump; the target is the installed @astryxdesign/core (or legacy @xds/core). Required unless `list` or `registry` is set.',
    },
    {
      name: 'options.apply',
      type: 'boolean',
      description: 'Write changes to disk; otherwise a dry-run preview.',
      default: 'false',
    },
    {
      name: 'options.force',
      type: 'boolean',
      description:
        'Run codemods even when `from` is at/after the installed version.',
      default: 'false',
    },
    {
      name: 'options.codemod',
      type: 'string',
      description:
        'Run only this codemod. Optional codemods run only when named here. Setting it also skips copied-composition reconciliation.',
    },
    {
      name: 'options.skipCodemod',
      type: 'string[]',
      description: 'Codemod names to exclude (e.g. to re-run past a failure).',
    },
    {
      name: 'options.integration',
      type: 'string[]',
      description:
        'Explicit integration specifiers to process. Resolved beneath node_modules; absolute paths and `.` or `..` segments are rejected.',
    },
    {
      name: 'options.path',
      type: 'string',
      description: 'Source directory to scan.',
      default: './src',
    },
    {
      name: 'options.installDeps',
      type: 'boolean',
      description:
        'Install jscodeshift when it is missing; otherwise a missing jscodeshift throws ERR_DEP_MISSING.',
      default: 'false',
    },
    {
      name: 'options.registry',
      type: 'boolean',
      description:
        'Only reconcile copied compositions from their install receipts; `from` is not required. Cannot be combined with `list`, `from`, `force`, `codemod`, `skipCodemod`, `integration` or `installDeps`.',
      default: 'false',
    },
    {
      name: 'options.list',
      type: 'boolean',
      description: 'Return the available codemods instead of running any.',
      default: 'false',
    },
    {
      name: 'ctx.cwd',
      type: 'string',
      description: 'Directory to run the upgrade in.',
      default: 'process.cwd()',
    },
  ],
  returns: [
    {
      type: 'upgrade.list',
      description:
        'Every available codemod, oldest→newest, as {name, title, version, optional}, returned when `list` is set; nothing is run.',
    },
    {
      type: 'upgrade.registry',
      description:
        'A dry-run or apply receipt for copied compositions, including safe updates, clean merges, conflicts, missing files, and invalid receipts.',
    },
    {
      type: 'upgrade.status',
      description:
        'A short-circuit outcome (no codemods executed): `up_to_date` (`from` is at/after the installed target and no `force`), `no_codemods` (none apply to the range), or `config_fixable` (dry-run preview that a pending config codemod would repair an invalid astryx.config). up_to_date and no_codemods carry the agent-docs summary and, when receipts are found, the copied-composition summary; config_fixable carries configError, configCodemods, suggestedCommand, message, note, and the agent-docs summary.',
    },
    {
      type: 'upgrade.run',
      description:
        'The terminal run receipt: from, to, codemods (count), integrations, agentDocs, agentDocsRefreshed, registryCompositions (when receipts are found), sourcePathFound (false when the resolved `path` does not exist, so nothing was scanned), filesChanged, transformsApplied, modifiedFiles, protectedFiles, declinedCandidates, errors, and complete. When a protected file still requires a change, complete is false and errorCode is ERR_CODEMOD_PROTECTED; the CLI exits nonzero while preserving the structured receipt.',
    },
  ],
  throws: [
    {
      code: 'ERR_INVALID_ARGUMENT',
      when: '`from` is missing (and neither `list` nor `registry` is set); `list` and `registry` are both set; `list` is combined with `from`, `force`, `apply`, `path` (non-default), `codemod`, `skipCodemod`, `integration` or `installDeps`; `registry` is combined with `from`, `force`, `codemod`, `skipCodemod`, `integration` or `installDeps`; an `integration` specifier is invalid or not installed; or astryx.config fails to load or validate and no pending config codemod repairs it',
    },
    {code: 'ERR_INVALID_VERSION', when: '`from` is not a valid semver string'},
    {code: 'ERR_PATH_TRAVERSAL', when: '`path` resolves outside cwd'},
    {
      code: 'ERR_VERSION_DETECT',
      when: 'neither @astryxdesign/core nor legacy @xds/core is installed in cwd; with `registry`, only when copied-composition receipts exist and @astryxdesign/core is not installed',
    },
    {
      code: 'ERR_DEP_MISSING',
      when: 'jscodeshift is missing and `installDeps` is not set, or installing it failed',
    },
    {
      code: 'ERR_UNKNOWN_CODEMOD',
      when: 'the version range has codemods but none remain selected: `codemod` names no codemod in the range, or `skipCodemod` excludes all of them',
    },
    {
      code: 'ERR_CODEMOD_FAILED',
      when: 'one or more codemods failed, or a post-codemod hook failed, and no protected file still needs a change (otherwise an upgrade.run receipt with complete: false is returned)',
    },
    {
      code: 'ERR_CODEMOD_PROTECTION_SOURCE',
      when: 'a working-tree protection declaration cannot be read or parsed before writes begin',
    },
  ],
  examples: [
    {
      label: 'List available codemods',
      code: 'const r = await upgrade({list: true});',
    },
    {label: 'Preview (dry-run)', code: "await upgrade({from: '0.0.5'});"},
    {
      label: 'Update copied compositions',
      code: 'await upgrade({registry: true, apply: true});',
    },
    {
      label: 'Apply changes',
      code: "await upgrade({from: '0.0.5', apply: true});",
    },
  ],
  command: 'upgrade',
  related: ['init', 'doctor'],
};
