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
  /** Maps exact integration template ids to exact Core template ids. Find Core
   *  ids with `astryx --json template --list --package @astryxdesign/core`.
   *  A valid replacement owns unqualified lookup and every default discovery
   *  surface; package-qualified lookup still selects the Core original or the
   *  integration's own id. Invalid declarations fail closed. Later explicitly
   *  configured integrations win valid conflicts with a warning, and explicit
   *  configuration wins over autolinking. When only autolinked packages
   *  conflict, the dependency listed later in package.json wins with a warning.
   *  CLIs from 0.5.3 onward ignore this key when it is unknown and preserve
   *  understood contributions. Versions 0.5.2 and earlier reject unknown
   *  manifest keys and drop the whole integration. Replacement selection starts in
   *  0.7.0. `__proto__` is unsupported and reserved as a
   *  `templateReplacements` map key. An ordinary
   *  `{'__proto__': 'shell-side-nav'}` literal uses JavaScript's special
   *  prototype-setter form; because the string value is neither an object nor
   *  null, it does not change the prototype, creates no own key, and disappears
   *  before validation. Observable own keys created with computed-property
   *  syntax or deserialization are rejected. Template discovery otherwise
   *  accepts that directory id. */
  templateReplacements?: Record<string, string>;
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
