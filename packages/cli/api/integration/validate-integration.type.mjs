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
 * @property {{validated: boolean, name: string | null, version: string | null, issues: import('../../foundation/integrations/issue').AstryxIntegrationIssue[], notes?: Array<{code: string, message: string}>, docTypes?: DocTypesReport, iconSets?: IconSetCoverage[], olderCliNotes?: OlderCliNote[]}} data
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
 * Experimental (spec:AST-084 FR15): for a package that declares
 * `experimental.iconSets`, which icon definitions each valid set leaves
 * unmapped. Listed beside the issues and never counted: mapping an optional
 * definition is optional, and nothing here fails a check, even under
 * `--strict`.
 * @typedef {object} IconSetCoverage
 * @property {string} set The set's name.
 * @property {Array<{name: string, description: string, words: string[]}>} unmappedDefinitions
 *   Astryx's optional (not built-in) definitions the set's `map` does not
 *   name. An unmapped built-in definition is an error issue instead.
 * @property {Array<{definition: string, icon: string}>} suggestions For each
 *   unmapped definition (built-in, optional, or the set's own), the icon
 *   whose whole id is the definition's name or one of its words, when one is.
 */

/**
 * A descriptor an older CLI drops: a page or block template, or a namespace
 * doc, that sets `stability`, or a template that declares `icons`, while the
 * package's `@astryxdesign/cli` peer range admits a release before 0.7.2.
 * Listed beside the issues for the package being authored, and never counted
 * or failing a check.
 * @typedef {object} OlderCliNote
 * @property {string} file The descriptor, relative to the package.
 * @property {'template' | 'namespace'} kind
 * @property {'stability' | 'icons'} field The field an older CLI refuses.
 * @property {string} message What an older CLI does with it, and the fix.
 */

export {};
