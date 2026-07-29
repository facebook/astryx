// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Colocated types for the `validate-integration` command — source of truth
 * for its options + response. `AstryxIntegrationIssue` stays shared in
 * types/integration.d.ts (it's not command-owned). Re-exported by
 * types/validate-integration.d.ts so the public surface resolves the same names.
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
 * @property {{name: string | null, version: string | null, issues: import('../../types/integration').AstryxIntegrationIssue[]}} data
 */

export {};
