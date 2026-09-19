// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * Public type surface for an Astryx integration manifest
 * (`astryx.integration.{ts,mjs,js}`, sibling to the integration package's
 * package.json). Identity (name/version) comes from package.json, not the
 * manifest. Authors write a plain object against {@link AstryxIntegration};
 * the CLI validates it via `parseIntegration` at the load boundary.
 *
 * The manifest module may also carry `debug` and `gapReport` NAMED exports.
 * They are not fields here on purpose: a CLI released before a given manifest
 * field existed could reject it and lose every contribution, while an unknown
 * named export is simply not read. See the `cli-integrations` doc topic.
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
  /** Relative path to the source-theme catalog root (resolved to absolute).
   *  The root contains `manifest.json` plus one directory per theme slug. */
  themes?: string;
  /** Static package guidance appended to the CLI-owned managed agent block. */
  agentDocs?: {
    append?: readonly string[];
  };
  /** Where to file issues/feedback for this integration. */
  issuesUrl?: string;
}

/**
 * A handler that receives a normalized gap report. Used as a named export
 * from integration manifests and as a config field.
 *
 * Re-exported from `@astryxdesign/cli/authoring`; see
 * `authoring/gap-report/type.ts` for the full contract.
 */
export type {
  GapReportHandler,
  GapReportHandlerContext,
  GapReport,
  GapReportCategory,
  GapReportTarget,
  GapReportHandlerReceipt,
} from '../gap-report/type';
