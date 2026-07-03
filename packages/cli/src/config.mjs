// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * Type-preserving helper for the Astryx config file.
 *
 * This is an intentionally tiny runtime identity function: it returns its
 * argument unchanged. Its value is the exported TypeScript surface from
 * `@astryxdesign/cli/config`, so config files get editor/type feedback without
 * coupling to CLI internals. Validation is NOT performed here — it happens at
 * the load boundary (see `loadModuleWithSchema` + `AstryxConfigSchema`).
 *
 * @template {import('./types/config').AstryxConfig} T
 * @param {T} config
 * @returns {T}
 */
export function createConfig(config) {
  return config;
}
