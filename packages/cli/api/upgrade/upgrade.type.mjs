// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Colocated types for the `upgrade` command — source of truth for the
 * upgrade command JSON responses. Re-exported by `types/upgrade.d.ts`.
 *
 * Invocation                                 -> type discriminator
 * ------------------------------------------------------------------
 * xds --json upgrade --list                 -> upgrade.list
 * xds --json upgrade [--apply]              -> upgrade.run
 * xds --json upgrade (status short-circuit) -> upgrade.status
 * (version detection failure)               -> CLIError
 */

/**
 * xds --json upgrade --list
 * @typedef {object} UpgradeListResponse
 * @property {'upgrade.list'} type
 * @property {UpgradeListEntry[]} data
 */

/**
 * @typedef {object} UpgradeListEntry
 * @property {string} name
 * @property {string} title
 * @property {string} version
 */

/**
 * State of the managed agent-docs block (`<!-- ASTRYX:START --> … END -->`)
 * relative to the installed core version, plus what `upgrade` did about it.
 * Present on every upgrade response (run, status, and the codemod/config error
 * envelopes) because the block is refreshed independently of codemods.
 *
 * - `refreshed`     — a stale block was rewritten (`--apply` only).
 * - `would-refresh` — a stale block was detected in dry-run; nothing written.
 * - `nudge-init`    — no managed block exists; user should run `init`.
 * - `error`         — refresh was attempted but writing failed.
 * - `none`          — nothing to do (block already current).
 *
 * @typedef {object} AgentDocsSummary
 * @property {'missing' | 'stale' | 'current'} status
 * @property {string} installedVersion Installed core version the block should reflect.
 * @property {string[]} fromVersions Distinct stale block versions found (the "from" side of the refresh).
 * @property {string[]} files Files rewritten (apply) or that would be rewritten (dry-run).
 * @property {boolean} refreshed True only when a block was actually rewritten (apply mode).
 * @property {'refreshed' | 'would-refresh' | 'nudge-init' | 'error' | 'none'} action
 */

/**
 * xds --json upgrade [--apply]
 * @typedef {object} UpgradeRunResponse
 * @property {'upgrade.run'} type
 * @property {object} data
 * @property {string} data.from
 * @property {string} data.to
 * @property {number} data.codemods
 * @property {string[]} data.integrations Integration packages processed in this upgrade (by name/spec).
 * @property {boolean} data.agentDocsRefreshed
 * @property {AgentDocsSummary} data.agentDocs
 * @property {number} [data.filesChanged] Total files changed across core + integration codemods (apply mode).
 * @property {number} [data.transformsApplied] Total transforms that reported a change.
 * @property {Array<{file: string, codemod: string, error: string}>} [data.errors] Per-codemod errors, when any codemod failed.
 */

/**
 * xds --json upgrade — short-circuit status results.
 *
 * - `up_to_date`: `--from` is >= installed target and `--force` was not passed.
 * - `no_codemods`: no codemods (core or integration) apply to the range.
 * - `config_fixable`: DRY-RUN ONLY. The consumer's astryx.config currently
 *   fails strict validation, but a pending core CONFIG codemod (in the selected
 *   range) would repair it. The dry run previews the fix without writing and
 *   reports the exact command to apply it; integrations are skipped for the
 *   preview (they will be processed on the `--apply` run).
 *
 * @typedef {object} UpgradeStatusResponse
 * @property {'upgrade.status'} type
 * @property {{status: 'up_to_date', from: string, to: string, agentDocs: AgentDocsSummary} | {status: 'no_codemods', from: string, to: string, agentDocs: AgentDocsSummary} | {status: 'config_fixable', from: string, to: string, configError: string, configCodemods: string[], suggestedCommand: string, message: string, note: string, agentDocs: AgentDocsSummary}} data
 */

/**
 * Options for `upgrade()`.
 * @typedef {object} UpgradeOptions
 * @property {string} [from] Version before the dependency bump (required unless `list`).
 * @property {boolean} [apply] Write changes to disk (default: dry-run).
 * @property {boolean} [force] Run codemods even if `from` >= installed.
 * @property {string} [codemod] Run a single named transform.
 * @property {string[]} [skipCodemod] Exclude named codemods (re-run past a failure).
 * @property {string[]} [integration] Explicit integration package names / file paths.
 * @property {string} [path] Source directory to scan (default `./src`).
 * @property {boolean} [installDeps] Auto-install jscodeshift without prompting.
 * @property {boolean} [list] Return the available codemods instead of running.
 */

export {};
