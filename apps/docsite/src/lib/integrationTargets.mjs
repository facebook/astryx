// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file integrationTargets.mjs
 *
 * Single decision point for which configured integration packages a docsite
 * content target admits (their component docs, runnable blocks, and playground
 * scope modules).
 *
 * @input A resolved docsite target ('canary' | 'latest'), the docsite
 *   astryx.config, and the packages the `latest` snapshot documents
 * @output The admitted package names in configuration order
 * @position Shared by scripts/generate-data.mjs, scripts/generate-scope.mjs and
 *   scripts/generate-playground-types.mjs so the admission rule cannot drift
 *   between generators. Canary admits every configured integration. The
 *   production (`latest`) site documents published stable releases only
 *   (spec:AST-033 FR5), so it admits a configured integration only once that
 *   package has released stable and the `latest` snapshot holds it
 *   (scripts/resolve-content-root.mjs). Canary-only packages (e.g.
 *   @astryxdesign/lab, spec:AST-017) never reach the snapshot.
 *   Unit-tested directly in src/__tests__/integration-targets.test.ts.
 */

/**
 * The integration packages a target admits, in configuration order (the order
 * is meaningful: the playground runner resolves unqualified globals with
 * later-wins across scope entries, so a later-configured package owns a
 * shared export name).
 *
 * @param {string} target resolved docsite target ('canary' | 'latest')
 * @param {{integrations?: unknown}} [config] the docsite astryx.config module
 * @param {Iterable<string> | null} [latestPackages] the packages the `latest`
 *   snapshot documents; ignored on canary
 * @returns {string[]} admitted package names
 */
export function integrationPackagesForTarget(target, config, latestPackages = null) {
  const configured = Array.isArray(config?.integrations)
    ? [...config.integrations]
    : [];
  if (target === 'canary') return configured;
  const documented = new Set(latestPackages ?? []);
  return configured.filter(name => documented.has(name));
}
