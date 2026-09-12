// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Colocated types for the `upgrade` command — source of truth for the
 * upgrade command JSON responses. Re-exported by `types/upgrade.d.ts`.
 *
 * Invocation                                 -> type discriminator
 * ------------------------------------------------------------------
 * xds --json upgrade --list                 -> upgrade.list
 * xds --json upgrade [--apply]              -> upgrade.run
 * xds --json upgrade --registry [--apply]   -> upgrade.registry
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
 * relative to the fully rendered block for installed Core and configured
 * integration manifests. Present on every upgrade response. Dry-run only
 * reports; apply writes after selected codemods and hooks succeed.
 *
 * - `refreshed`     — a stale block was rewritten (`--apply` only).
 * - `would-refresh` — a stale block was detected in dry-run; nothing written.
 * - `nudge-init`    — no managed block exists; user should run `init`.
 * - `error`         — the expected block could not be rendered or written.
 * - `none`          — nothing to do (block already matches expected content).
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
 * One copied file tracked by a ShadCN composition receipt.
 * @typedef {object} RegistryCompositionFileSummary
 * @property {string} path
 * @property {'current'|'user-modified'|'would-update'|'updated'|'would-merge'|'merged'|'would-refresh-receipt'|'receipt-refreshed'|'conflict'|'missing'|'invalid'|'target-changed'} action
 * @property {string} [message]
 * @property {string} [conflictFile]
 */

/**
 * One ShadCN registry item checked during upgrade.
 * @typedef {object} RegistryCompositionItemSummary
 * @property {string} item
 * @property {string} [path]
 * @property {'current'|'user-modified'|'would-update'|'updated'|'would-merge'|'merged'|'would-refresh-receipt'|'receipt-refreshed'|'conflict'|'invalid'|'fetch-error'|'write-error'} action
 * @property {string} [message]
 * @property {RegistryCompositionFileSummary[]} files
 */

/**
 * Aggregate receipt for ShadCN-copied composition reconciliation.
 * @typedef {object} RegistryCompositionSummary
 * @property {boolean} applied
 * @property {boolean} ok False when conflicts, missing files, invalid receipts, or failures remain.
 * @property {number} found
 * @property {number} current Item count with no upstream source change.
 * @property {number} wouldUpdate Item count with pristine updates in dry-run.
 * @property {number} updated Item count with pristine updates applied.
 * @property {number} wouldMerge Item count with clean merges in dry-run.
 * @property {number} merged Item count with clean merges applied.
 * @property {number} wouldRefreshReceipt Item count with metadata-only refreshes in dry-run.
 * @property {number} receiptsRefreshed Item count with metadata-only refreshes applied.
 * @property {number} conflicts Item count with at least one unresolved source conflict.
 * @property {number} missing Per-file count of deleted or moved source files.
 * @property {number} invalid Count of invalid receipts, unreadable sources, or changed targets.
 * @property {number} failed Item count with fetch or write failures.
 * @property {RegistryCompositionItemSummary[]} items
 */

/**
 * xds --json upgrade --registry [--apply]
 * @typedef {object} UpgradeRegistryResponse
 * @property {'upgrade.registry'} type
 * @property {RegistryCompositionSummary} data
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
 * @property {RegistryCompositionSummary} [data.registryCompositions]
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
 * @property {{status: 'up_to_date', from: string, to: string, agentDocs: AgentDocsSummary, registryCompositions?: RegistryCompositionSummary} | {status: 'no_codemods', from: string, to: string, agentDocs: AgentDocsSummary, registryCompositions?: RegistryCompositionSummary} | {status: 'config_fixable', from: string, to: string, configError: string, configCodemods: string[], suggestedCommand: string, message: string, note: string, agentDocs: AgentDocsSummary}} data
 */

/**
 * Options for `upgrade()`.
 * @typedef {object} UpgradeOptions
 * @property {string} [from] Version before the dependency bump (required unless `list` or `registry`).
 * @property {boolean} [apply] Write changes to disk (default: dry-run).
 * @property {boolean} [force] Run codemods even if `from` >= installed.
 * @property {string} [codemod] Run a single named transform.
 * @property {string[]} [skipCodemod] Exclude named codemods (re-run past a failure).
 * @property {string[]} [integration] Explicit integration specifiers resolved beneath node_modules; absolute paths and `.` or `..` segments are rejected.
 * @property {string} [path] Source directory to scan (default `./src`).
 * @property {boolean} [installDeps] Auto-install jscodeshift without prompting.
 * @property {boolean} [registry] Reconcile only ShadCN-copied compositions; `from` is not required.
 * @property {boolean} [list] Return the available codemods instead of running.
 */

export {};
