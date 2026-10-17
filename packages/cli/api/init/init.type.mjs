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
 * @property {boolean} nextSteps Whether the getting-started "Next steps" were emitted (default mode inside a project; false outside one).
 */

/**
 * @typedef {object} InitRunResponse
 * @property {'init.run'} type
 * @property {InitRunData} data
 */

/**
 * @typedef {object} InitRemoveResponse
 * @property {'init.remove'} type
 * @property {{removed: boolean}} data False when no managed agent-docs block was found, so nothing was removed.
 */

/**
 * What `init --user` did with one file of the computer-level agent text.
 * `written`: created or refreshed. `unchanged`: already this release's text.
 * `removed`: deleted (with `--remove-agents`). `absent`: nothing to remove.
 * `kept`: a file Astryx did not write (no Astryx markers) or a symlink, left as it is.
 * @typedef {'written' | 'unchanged' | 'removed' | 'absent' | 'kept'} InitUserAction
 */

/**
 * @typedef {object} InitUserFile
 * @property {string} path Absolute path of the file in the home folder.
 * @property {InitUserAction} action
 */

/**
 * @typedef {object} InitUserData
 * @property {InitUserFile[]} files `~/.agents/skills/astryx/SKILL.md`, then `~/.claude/skills/astryx/SKILL.md`.
 * @property {string} command The command the text tells agents to run: `astryx`, or the host's command when a host started the run.
 * @property {string[]} warnings Non-fatal notes, such as no `astryx` on the computer that runs the Astryx CLI.
 */

/**
 * @typedef {object} InitUserResponse
 * @property {'init.user'} type
 * @property {InitUserData} data
 */

/**
 * Options for `init()`.
 * @typedef {object} InitOptions
 * @property {string} [features] Comma-separated features to install (agents, theme, template).
 * @property {boolean} [all] Install all features.
 * @property {boolean} [removeAgents] Remove the managed agent-docs block instead of installing; with `user`, remove the computer-level agent text.
 * @property {boolean} [user] Write the computer-level agent text (`~/.agents/skills/astryx/SKILL.md` and `~/.claude/skills/astryx/SKILL.md`) instead of setting up the folder.
 * @property {string} [agent] Agent preset: claude, cursor, codex, hermes, muse, all.
 * @property {string | string[]} [agentDocsPath] Explicit agent-docs file path(s).
 * @property {string} [templateName] Scaffold a named page template (programmatic only; the CLI never sets it).
 */

export {};
