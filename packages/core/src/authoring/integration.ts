// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file integration.ts
 * @input An integration package's manifest object.
 * @output A type-preserving `createIntegration` helper plus the
 *   `AstryxIntegration` manifest surface.
 * @position Integration-author authoring surface. See `./index.ts` for why
 *   these authoring factories live in `@astryxdesign/core`.
 *
 * `createIntegration` is an intentionally tiny runtime identity function: it
 * returns its argument unchanged. Validation is NOT performed here — it happens
 * at the CLI load boundary.
 */

/**
 * Integration manifest exported from a conventional root manifest file
 * (astryx.integration.{ts,mjs,js}) sibling to the integration package's
 * package.json. Identity (name/version) comes from the package's
 * package.json, not from the manifest.
 */
export interface AstryxIntegration {
  /** Relative path to the components/docs root (resolved to absolute). */
  components?: string;
  /** Relative path to the templates root (resolved to absolute). */
  templates?: string;
  /** Relative path to the codemods root (resolved to absolute). */
  codemods?: string;
  /** Where to file issues/feedback for this integration. */
  issuesUrl?: string;
}

/**
 * Type-preserving helper for an Astryx integration manifest. Returns its
 * argument unchanged; the value is the exported TypeScript surface. Validation
 * happens at the CLI load boundary.
 */
export function createIntegration<T extends AstryxIntegration>(
  integration: T,
): T {
  return integration;
}
