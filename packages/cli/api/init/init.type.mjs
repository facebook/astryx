// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Colocated types for the `init` command — source of truth for the init
 * API response receipts and options. Re-exported by types/init.d.ts; the public
 * `./api` type surface regenerates from this JSDoc.
 */

/**
 * @typedef {object} InitRunData
 * @property {'default' | 'features'} mode `default` (no flags) or `features` (--features/--all).
 * @property {string[]} features Features that were run, in order.
 * @property {string[]} docsWritten Agent-doc files written (empty if agents weren't run or install failed).
 * @property {{kind: 'path-safety' | 'install-failed', message?: string} | null} docsError Soft agent-docs failure, if any. `path-safety` also implies a non-zero exit.
 * @property {boolean} theme Whether the theme feature ran.
 * @property {'created' | 'skipped' | 'failed' | null} themeTemplate Outcome of writing the annotated theme template (`skipped` = a file was already there).
 * @property {string | null} themeTemplatePath Relative output path when `themeTemplate === 'created'`.
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

/**
 * Options for `init()`.
 * @typedef {object} InitOptions
 * @property {string} [features] Comma-separated features to install (agents, theme, template).
 * @property {boolean} [all] Install all features.
 * @property {boolean} [removeAgents] Remove the managed agent-docs block instead of installing.
 * @property {string} [agent] Agent preset: claude, cursor, codex, hermes, all.
 * @property {string | string[]} [agentDocsPath] Explicit agent-docs file path(s).
 * @property {string} [templateName] Scaffold a named page template (programmatic only; the CLI never sets it).
 */

export {};
