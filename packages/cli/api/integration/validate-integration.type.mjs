// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Colocated types for the `validate-integration` command — source of truth
 * for its options + response. `AstryxIntegrationIssue` stays shared in
 * types/integration.d.ts (it's not command-owned). Re-exported by
 * types/validate-integration.d.ts so the public surface resolves the same names.
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
 * `astryx --json validate-integration [package]`.
 * @typedef {object} ValidateIntegrationResponse
 * @property {'integration.validate'} type
 * @property {{name: string | null, version: string | null, issues: import('../../foundation/integrations/issue').AstryxIntegrationIssue[]}} data
 */

export {};
