// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Colocated types for `doctor integration validate` structure checks.
 * `AstryxIntegrationIssue` stays shared in `foundation/integrations/issue.ts`;
 * the generated public API surface re-exports these response types.
 */

/**
 * A loaded integration manifest — the shape `validateLoadedIntegration` accepts.
 * Colocated here (rather than referencing the internal `lib/integrations`
 * module) so the generated public `./api` surface stays self-contained.
 * @typedef {object} LoadedIntegration
 * @property {string} name
 * @property {string} [version]
 * @property {string} [components]
 * @property {string} [templates]
 * @property {string} [codemods]
 * @property {string} [docs]
 * @property {string} [issuesUrl]
 * @property {string[]} [__unknownKeys]
 * @property {string} __spec
 * @property {string} __packageDir
 * @property {string} __manifestFile
 */

/**
 * Options for `validateIntegration()`.
 * @typedef {object} ValidateIntegrationOptions
 * @property {string} [cwd]
 */

/**
 * `astryx --json doctor integration validate [package]`.
 *
 * `validated` is false in exactly one case: no integration manifest was found,
 * so nothing was checked. An empty `issues` then means "not looked at", not
 * "healthy" — the two are otherwise byte-identical.
 * @typedef {object} ValidateIntegrationResponse
 * @property {'integration.validate'} type
 * @property {{validated: boolean, name: string | null, version: string | null, issues: import('../../foundation/integrations/issue').AstryxIntegrationIssue[], notes?: Array<{code: string, message: string}>, docTypes?: DocTypesReport, docNames?: DocNamesReport, blockComponents?: BlockComponentsReport}} data
 *   `notes`: information beside the issues that fails nothing, such as
 *   `invalid_cli_command`, a `cliCommand` that was ignored as malformed
 */

/**
 * Each doc the package ships, checked against the published authoring type
 * for its kind. Present when the manifest loads. `status: 'skipped'`
 * means nothing was checked (no TypeScript in the project) and `reason` says
 * why. Every finding is a warning.
 *
 * @typedef {import('../../foundation/discovery/doc-types.mjs').DocTypesReport & {fixtures?: number}} DocTypesReport
 *   `fixtures`: how many test fixture docs (under `__tests__` in the
 *   components or docs root, which those readers skip) were not checked
 */

/**
 * Each component doc whose `name` differs from the name it is listed under,
 * judged against its source. Present when the manifest loads. A name the
 * module its printed import names provably does not export is a
 * `doc_name_mismatch` entry in `findings`, listed with its fix at `info`
 * severity: nothing counts it and `integration check --strict` does not fail
 * on it (it becomes a warning in the next minor release); `unchecked` lists each doc whose source's
 * exports could not all be read (a re-export from another package, `export
 * =`, a destructured binding, a namespace): `file` (the doc, package-relative),
 * `name` (what the doc says), and `reason`.
 *
 * @typedef {{status: 'checked', findings: ListedNameFinding[], unchecked: Array<{file: string, name: string, reason: string}>}} DocNamesReport
 */

/**
 * Each component name a template gives in `exampleFor` or `componentsUsed`
 * that could not be judged. Present when the manifest loads. A name neither
 * the package nor Core has, and the template does not import, is an
 * `unknown_block_component` entry in `findings`, listed with its fix at
 * `info` severity: nothing counts it and `integration check --strict` does
 * not fail on it (it becomes a warning in the next minor release);
 * `unchecked` lists each name that cannot be judged: one the template may
 * reach through anything other than named imports and re-exports from
 * the package, Core, React, StyleX or local helpers (an import from another
 * package, a default or namespace import, an alias of or member read off an imported
 * binding, require(), a dynamic import(), a local module this check cannot
 * read), or, without Core installed, any name Core would have to resolve: `file` (the template doc, package-relative),
 * `name`, and `reason`.
 *
 * @typedef {{status: 'checked', findings: ListedNameFinding[], unchecked: Array<{file: string, name: string, reason: string}>}} BlockComponentsReport
 */

/**
 * A name finding listed with its fix but counted nowhere: `file` (the doc,
 * package-relative), `name`, `code` (`doc_name_mismatch` or
 * `unknown_block_component`), `severity: 'info'`, and `message`,
 * which ends in the `Fix:`.
 * @typedef {{file: string, name: string, code: string, severity: 'info', message: string}} ListedNameFinding
 */

export {};
