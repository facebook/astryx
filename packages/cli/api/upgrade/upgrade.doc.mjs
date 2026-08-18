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
  summary:
    'Run version-migration codemods and refresh the managed agent-docs block.',
  description:
    'Migrates project source from a previous Astryx version to the currently ' +
    'installed one by running the registered codemods, and refreshes the managed ' +
    'agent-docs block on every path. Dry-run by default (previews without ' +
    'writing); pass `apply` to write changes to disk. Core codemods run before ' +
    'the config is loaded so a config codemod can repair an otherwise-invalid ' +
    'astryx.config.',
  importPath: '@astryxdesign/cli/api',
  signature:
    'upgrade(options?: UpgradeOptions, ctx?: {cwd?: string}): Promise<UpgradeListResponse | UpgradeStatusResponse | UpgradeRunResponse>',
  keywords: ['upgrade', 'migrate', 'codemod', 'migration', 'version'],
  params: [
    {
      name: 'options.from',
      type: 'string',
      description:
        'Version before the dependency bump. Required unless `list` is set.',
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
      type: 'upgrade.status',
      description:
        'A short-circuit outcome (no codemods executed): `up_to_date` (`from` is at/after the installed target and no `force`), `no_codemods` (none apply to the range), or `config_fixable` (dry-run preview that a pending config codemod would repair an invalid astryx.config). Each carries the agent-docs summary.',
    },
    {
      type: 'upgrade.run',
      description:
        'The terminal run receipt: from/to versions, the codemod count, integrations processed, the agent-docs summary, and (apply mode) filesChanged, transformsApplied, and any per-codemod errors.',
    },
  ],
  throws: [
    {
      code: 'ERR_INVALID_ARGUMENT',
      when: '`from` is missing (and `list` is not set), or the project config fails strict validation and no pending config codemod can repair it',
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
      label: 'Apply changes',
      code: "await upgrade({from: '0.0.5', apply: true});",
    },
  ],
  command: 'upgrade',
  related: ['init', 'doctor'],
};
