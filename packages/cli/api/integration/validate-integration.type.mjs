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
 * @property {{validated: boolean, name: string | null, version: string | null, issues: import('../../foundation/integrations/issue').AstryxIntegrationIssue[], notes?: Array<{code: string, message: string}>, docTypes?: DocTypesReport, publicImports?: PublicImportsReport}} data
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

export {};

/**
 * An import the public-import check could not judge.
 * @typedef {object} PublicImportUnchecked
 * @property {string} file package-relative file that names it
 * @property {string} specifier the import specifier
 * @property {string} reason why it was not checked
 */

/**
 * One public-import finding: listed, never counted or failed on. It fails
 * `integration check --strict` from the next minor release.
 * @typedef {object} PublicImportFinding
 * @property {string} code
 * @property {'info'} severity
 * @property {string} message
 * @property {string} [fix]
 */

/**
 * The public-import check's report on validate's result, listed only:
 * `findings` names each import that cannot be imported, and `unchecked`
 * what it could not judge. Neither is counted or failed on.
 * @typedef {object} PublicImportsReport
 * @property {'checked'} status
 * @property {PublicImportFinding[]} findings
 * @property {PublicImportUnchecked[]} unchecked
 */
