// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * Type-preserving helper for an Astryx integration manifest.
 *
 * This is an intentionally tiny runtime identity function: it returns its
 * argument unchanged. Its value is the exported TypeScript surface from
 * `@astryxdesign/cli/integration`, so manifests get editor/type feedback
 * without coupling to CLI internals. Validation is NOT performed here — it
 * happens at the load boundary (see `loadModuleWithSchema` +
 * `AstryxIntegrationSchema`).
 *
 * @template {import('./types/integration').AstryxIntegration} T
 * @param {T} integration
 * @returns {T}
 */
export function createIntegration(integration) {
  return integration;
}
