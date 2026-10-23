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
 * @property {string[]} [__declaredKeys]
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
 * @property {{validated: boolean, name: string | null, version: string | null, issues: import('../../foundation/integrations/issue').AstryxIntegrationIssue[], notes?: Array<{code: string, message: string, next?: boolean}>, docTypes?: DocTypesReport, docNames?: DocNamesReport, blockComponents?: BlockComponentsReport, publicImports?: PublicImportsReport}} data
 *   `notes`: information beside the issues. A note fails nothing by default;
 *   one with `next: true` counts as a warning under `integration check
 *   --next`, fails `integration check --strict --next`, and fails `--strict`
 *   from the next minor release. Notes include `invalid_cli_command`, a
 *   `cliCommand` that was ignored as malformed;
 *   `cli_peer_version`, the running CLI outside the package's
 *   `@astryxdesign/cli` peer range; and
 *   the package layout findings added after the last minor release, each with
 *   its fix in the message: two docs for one component
 *   (`duplicate_component_doc`), a root reached through a symlink
 *   (`symlinked_root`), a contribution file that cannot be read
 *   (`unreadable_file`), a package.json without `name` or `version`
 *   (`invalid_package_json`), no provider ID (`no_provider_id`), and a doc
 *   whose file name differs from its source only in letter case where the two
 *   still pair (`source_without_component_doc`); `doc_name_mismatch` and
 *   `unknown_block_component` (see `docNames` and `blockComponents`); and
 *   since 0.7.3 each public-import finding; they become warnings in the next
 *   minor release; and, for the commands a topic writes, `runner_command`
 *   (written with a package runner), `plain_command` (written bare),
 *   `package_manager_command` (written for one package manager) and
 *   `doc_token` (a token that does not parse), each with the token to write
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
 * `doc_name_mismatch` note beside the issues, with its fix in the message
 * (it becomes a warning in the next minor release), so `findings` is always
 * empty; `unchecked` lists each doc whose source's
 * exports could not all be read (a re-export from another package, `export
 * =`, a destructured binding, a namespace): `file` (the doc, package-relative),
 * `name` (what the doc says), and `reason`.
 *
 * @typedef {{status: 'checked', findings: [], unchecked: Array<{file: string, name: string, reason: string}>}} DocNamesReport
 */

/**
 * Each component name a template gives in `exampleFor` or `componentsUsed`
 * that could not be judged. Present when the manifest loads. A name neither
 * the package nor Core has, and the template does not import, is an
 * `unknown_block_component` note beside the issues, with its fix in the
 * message (it becomes a warning in the next minor release), so `findings` is
 * always empty;
 * `unchecked` lists each name that cannot be judged: one the template may
 * reach through anything other than named imports and re-exports from
 * Core, React, StyleX, local helpers or the package's own entry (an import from another
 * package, a default or namespace import, an alias of or member read off an imported
 * binding, require(), a dynamic import(), a local module this check cannot
 * read), or, without Core installed, any name Core would have to resolve: `file` (the template doc, package-relative),
 * `name`, and `reason`.
 *
 * @typedef {{status: 'checked', findings: [], unchecked: Array<{file: string, name: string, reason: string}>}} BlockComponentsReport
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
 * The public-import check's report on validate's result: `unchecked` lists
 * what it could not judge, never counted or failed on. Its findings are
 * notes on the result (`data.notes`), so `findings` stays empty.
 * @typedef {object} PublicImportsReport
 * @property {'checked'} status
 * @property {never[]} findings
 * @property {PublicImportUnchecked[]} unchecked
 */
