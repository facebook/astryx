// Copyright (c) Meta Platforms, Inc. and affiliates.

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

/** An issue surfaced by an integration. */
export interface AstryxIntegrationIssue {
  code: string;
  severity: 'warning' | 'error';
  message: string;
}

export declare function createIntegration<T extends AstryxIntegration>(
  integration: T,
): T;
