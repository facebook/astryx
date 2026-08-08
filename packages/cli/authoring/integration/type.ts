// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * Public type surface for an Astryx integration manifest
 * (`astryx.integration.{ts,mjs,js}`, sibling to the integration package's
 * package.json). Identity (name/version) comes from package.json, not the
 * manifest. Authors write a plain object against {@link AstryxIntegration};
 * the CLI validates it via `parseIntegration` at the load boundary.
 */
export interface AstryxIntegration {
  /** Relative path to the components/docs root (resolved to absolute). */
  components?: string;
  /** Relative path to the templates root (resolved to absolute). */
  templates?: string;
  /** Relative path to the codemods root (resolved to absolute). */
  codemods?: string;
  /**
   * Relative path to an app-shell module (resolved to absolute). The module
   * default-exports an `AstryxAppShell` (see `@astryxdesign/cli/authoring`)
   * naming the shell component this project's pages live in. It replaces core's
   * default `AppShell` when a user runs `astryx template <id> --with-shell` —
   * a pure output-layer that never edits the templates on disk.
   */
  appShell?: string;
  /** Where to file issues/feedback for this integration. */
  issuesUrl?: string;
}
