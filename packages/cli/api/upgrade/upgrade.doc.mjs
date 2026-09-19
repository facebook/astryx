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
  displayName: 'upgrade()',
  summary: 'Run version migrations and reconcile copied compositions.',
  description:
    'Migrates project source from a previous Astryx version to the currently ' +
    'installed one by running the registered codemods, and compares the fully ' +
    'rendered managed agent-docs block on every path, including same-Core ' +
    'integration guidance changes. Dry-run previews without writing; `apply` ' +
    'writes the prepared block only after selected codemods and hooks succeed. ' +
    'Core codemods run before ' +
    'the config is loaded so a config codemod can repair an otherwise-invalid ' +
    'astryx.config. Copied compositions carry adjacent receipts with exact canonical and format-specific install bases; upgrade ' +
    'compares those installed bases with the matching registry release, updates pristine ' +
    'files, merges non-overlapping edits, and leaves conflicting originals untouched.',
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
        'Version before the dependency bump. Required unless `list` or `registry` is set.',
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
    },
    {
      name: 'options.codemod',
      type: 'string',
      description: 'Run a single named transform instead of the full set.',
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
        'Explicit integration package names / file paths to process.',
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
      description: 'Auto-install jscodeshift without prompting.',
    },
    {
      name: 'options.registry',
      type: 'boolean',
      description:
        'Reconcile copied compositions from their install receipts without requiring `from`.',
      default: 'false',
    },
    {
      name: 'options.list',
      type: 'boolean',
      description: 'Return the available codemods instead of running any.',
    },
    {
      name: 'ctx.cwd',
      type: 'string',
      description: 'Directory to run the upgrade in.',
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
        'A short-circuit outcome (no codemods executed): `up_to_date` (`from` is at/after the installed target and no `force`), `no_codemods` (none apply to the range), or `config_fixable` (dry-run preview that a pending config codemod would repair an invalid astryx.config). Each carries the agent-docs summary and, when found, the copied-composition registry summary.',
    },
    {
      type: 'upgrade.run',
      description:
        'The terminal run receipt: from/to versions, the codemod count, integrations processed, the agent-docs summary, an optional copied-composition registry summary, and (apply mode) filesChanged, transformsApplied, and any per-codemod errors.',
    },
  ],
  throws: [
    {
      code: 'ERR_INVALID_ARGUMENT',
      when: '`from` is missing (and neither `list` nor `registry` is set), or the project config fails strict validation and no pending config codemod can repair it',
    },
    {code: 'ERR_INVALID_VERSION', when: '`from` is not a valid semver string'},
    {code: 'ERR_PATH_TRAVERSAL', when: '`path` resolves outside cwd'},
    {
      code: 'ERR_VERSION_DETECT',
      when: 'the installed @astryxdesign/core version cannot be detected',
    },
    {
      code: 'ERR_DEP_MISSING',
      when: 'jscodeshift is required but could not be installed',
    },
    {
      code: 'ERR_UNKNOWN_CODEMOD',
      when: 'a `codemod` name matches no registered codemod',
    },
    {
      code: 'ERR_CODEMOD_FAILED',
      when: 'one or more codemods failed, or a post-codemod hook failed',
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
