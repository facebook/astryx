// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * Public type surface for an Astryx integration manifest
 * (`astryx.integration.{ts,mjs,js}`, sibling to the integration package's
 * package.json). Identity (name/version) comes from package.json, not the
 * manifest. Authors write a plain object against {@link AstryxIntegration};
 * the CLI validates it via `parseIntegration` at the load boundary.
 *
 * The manifest module may also carry a `debug` NAMED export — a
 * `DebugEventHandler` that receives every command run in the apps that install
 * the integration. It is not a field here on purpose: a CLI released before a
 * given field existed rejects it, and a rejected manifest contributes nothing
 * at all, while a named export is simply not read. See the `cli-integrations`
 * doc topic.
 */
export interface AstryxIntegration {
  /** Relative path to the components/docs root (resolved to absolute). */
  components?: string;
  /** Relative path to the templates root (resolved to absolute). */
  templates?: string;
  /** Relative path to the codemods root (resolved to absolute). */
  codemods?: string;
  /** Relative path to the reference-docs (topics) root (resolved to
   *  absolute). Every `{topic}.doc.{ts,mjs,js}` under it is a topic the CLI
   *  serves from `astryx docs`, alongside the built-in ones. A topic may also
   *  `replace` or `extend` a built-in topic; see the ReferenceDoc type. */
  docs?: string;
  /** Where to file issues/feedback for this integration. */
  issuesUrl?: string;
}
