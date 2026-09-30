// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file integrationTargets.mjs
 *
 * Single decision point for whether a docsite content target admits workspace
 * integration packages (their component docs, runnable blocks, and playground
 * scope modules).
 *
 * @input A resolved docsite target ('canary' | 'latest') and the docsite
 *   astryx.config
 * @output Whether integration content is admitted, and the admitted package
 *   names in configuration order
 * @position Shared by scripts/generate-data.mjs and scripts/generate-scope.mjs
 *   so the production-exclusion rule cannot drift between generators. The
 *   production (`latest`) site must contain zero integration content — the
 *   configured packages are canary-only (e.g. @astryxdesign/lab, spec:AST-017).
 *   Unit-tested directly in src/__tests__/integration-targets.test.ts.
 */

/**
 * Integration content (workspace packages beyond @astryxdesign/core) is only
 * ever admitted on the canary target. `latest` documents the published stable
 * release, which never includes canary-only packages.
 *
 * @param {string} target resolved docsite target ('canary' | 'latest')
 * @returns {boolean}
 */
export function integrationContentEnabled(target) {
  return target === 'canary';
}

/**
 * The integration packages a target admits, in configuration order (the order
 * is meaningful: the playground runner resolves unqualified globals with
 * later-wins across scope entries, so a later-configured package owns a
 * shared export name).
 *
 * @param {string} target resolved docsite target ('canary' | 'latest')
 * @param {{integrations?: unknown}} [config] the docsite astryx.config module
 * @returns {string[]} admitted package names; empty off-canary
 */
export function integrationPackagesForTarget(target, config) {
  if (!integrationContentEnabled(target)) return [];
  return Array.isArray(config?.integrations) ? [...config.integrations] : [];
}
