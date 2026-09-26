// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Colocated types for the `build` command — source of truth for the
 * `build.help` (playbook) and `build.kit` (composition kit) JSON responses.
 * Re-exported by types/build.d.ts.
 */

/**
 * A command the playbook tells the caller to run.
 *
 * @typedef {object} BuildPlaybookCommand
 * @property {string} command Bare subcommand with `<placeholder>` arguments (e.g. `template <name> --skeleton`) and no package-manager prefix — render it with your own CLI invocation.
 * @property {string} [purpose] What running it is for.
 */

/**
 * One step of the page-building workflow.
 *
 * @typedef {object} BuildPlaybookStep
 * @property {string} title What to do.
 * @property {BuildPlaybookCommand[]} commands The commands for this step, in the order to run them.
 * @property {string} [returns] What the step's command gives back, when that decides the next step.
 */

/**
 * astryx --json build (no query) — the "how to build a page" playbook.
 *
 * @typedef {object} BuildHelpResponse
 * @property {'build.help'} type
 * @property {object} data
 * @property {true} data.playbook Always true; marks this envelope as the playbook rather than a result set.
 * @property {string} data.title The playbook's heading.
 * @property {BuildPlaybookStep[]} data.steps The workflow, in order.
 * @property {string[]} data.rules The rules that keep a page on-system.
 * @property {BuildPlaybookCommand[]} data.related Lookups to reach for alongside the workflow.
 */

/**
 * astryx --json build "<idea>" — the composition kit for what you're building.
 *
 * Entries are raw `SearchResultEntry` objects (no package-manager-prefixed
 * command strings — the CLI adds those); `frame`/`foundation` are static
 * component-name arrays surfaced on every kit.
 *
 * @typedef {object} BuildKitResponse
 * @property {'build.kit'} type
 * @property {object} data
 * @property {string} data.query
 * @property {boolean} data.hasResults False when search returned nothing (renderer shows "No matches").
 * @property {number} data.matchCount Total ranked search matches for the query — counted before the search `limit`, the kit's score floors, and its per-group caps, so it is never a cap read back.
 * @property {boolean} data.directMatch True when the top page template is a confident direct match.
 * @property {import('../search/search.type.mjs').SearchResultEntry[]} data.pages Closest page templates (≤3). Each entry's `command` carries `--skeleton` when `directMatch` is false, so it recommends reading the layout rather than scaffolding it.
 * @property {import('../search/search.type.mjs').SearchResultEntry[]} data.blocks Drop-in block patterns covering parts of the idea (≤5).
 * @property {import('../search/search.type.mjs').SearchResultEntry[]} data.domain Idea-specific components/hooks (≤6), excluding frame/foundation.
 * @property {string[]} data.frame Always-on page-shell component names.
 * @property {string[]} data.foundation Always-on layout/typography/action component names.
 * @property {{reason: string, commands: string[]}} [data.hint] Present only when the kit is thin. `reason` says why, `commands` are bare subcommands (e.g. `component --list`) for the caller to render with its own invocation — so a reader is never handed a command that does not resolve in their project.
 */

/**
 * Options for `build()`.
 * @typedef {object} BuildOptions
 * @property {string} [cwd]
 * @property {import('../search/search.type.mjs').SearchDomain} [type]
 * @property {number} [limit]
 */

export {};
