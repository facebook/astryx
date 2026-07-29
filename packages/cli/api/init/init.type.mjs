// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Colocated types for the `init` command — source of truth for the init
 * API response receipts. Re-exported by types/init.d.ts (and, transitively,
 * types/api.d.ts). Options live in types/api.d.ts (like UpgradeOptions).
 */

/**
 * @typedef {object} InitRunData
 * @property {'default' | 'features'} mode `default` (no flags) or `features` (--features/--all).
 * @property {string[]} features Features that were run, in order.
 * @property {string[]} docsWritten Agent-doc files written (empty if agents weren't run or install failed).
 * @property {{kind: 'path-safety' | 'install-failed', message?: string} | null} docsError Soft agent-docs failure, if any. `path-safety` also implies a non-zero exit.
 * @property {boolean} theme Whether theme guidance was emitted.
 * @property {'workflow' | 'created' | 'skipped' | null} template Template outcome (`workflow` is the CLI default; `created`/`skipped` are programmatic).
 * @property {string | null} templatePath Relative output path when `template === 'created'`.
 * @property {boolean} nextSteps Whether the getting-started "Next steps" were emitted (default mode).
 */

/**
 * @typedef {object} InitRunResponse
 * @property {'init.run'} type
 * @property {InitRunData} data
 */

/**
 * @typedef {object} InitRemoveResponse
 * @property {'init.remove'} type
 * @property {{removed: true}} data
 */

export {};
