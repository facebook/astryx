// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file XDS CLI — stable machine-readable error codes.
 *
 * ## Why codes exist
 *
 * The JSON error envelope (see json.mjs) carries a human-readable `error`
 * string. That string is for people. It changes whenever we improve the
 * wording, add detail, or localize. AI agents and CI scripts that consume
 * `xds --json` must NOT branch on prose — string-matching "No component
 * named X" is brittle and silently breaks the moment we reword it.
 *
 * The `code` field is the stable contract. Every error — whether raised by a
 * command, the API layer (`XDSError`), or Commander's own parse machinery —
 * carries one of the identifiers below. Codes are append-only: once shipped,
 * a code's meaning never changes and the code is never removed. The message
 * may change freely; the code never does.
 *
 * ## Naming
 *
 * `ERR_<SUBJECT>[_<QUALIFIER>]`, SCREAMING_SNAKE_CASE, always prefixed
 * `ERR_`. Group by subject (component, hook, docs, template, theme, …).
 *
 * ## Usage
 *
 *   import {ERROR_CODES} from './error-codes.mjs';
 *   cliError('No component named "Buton"', {code: ERROR_CODES.ERR_UNKNOWN_COMPONENT});
 *   throw new XDSError('No component named "Buton"', suggestions, ERROR_CODES.ERR_UNKNOWN_COMPONENT);
 *
 * Consumers read `envelope.code` and compare against the published list in
 * packages/cli/README.md.
 */

/**
 * Stable error-code string union. Append-only.
 *
 * @typedef {(
 *   | 'ERR_UNKNOWN'
 *   | 'ERR_UNKNOWN_COMMAND'
 *   | 'ERR_UNKNOWN_SUBCOMMAND'
 *   | 'ERR_INVALID_OPTION'
 *   | 'ERR_INVALID_ARGUMENT'
 *   | 'ERR_MISSING_ARGUMENT'
 *   | 'ERR_INVALID_LANG'
 *   | 'ERR_INVALID_DETAIL'
 *   | 'ERR_NODE_VERSION'
 *   | 'ERR_CORE_NOT_FOUND'
 *   | 'ERR_UNKNOWN_COMPONENT'
 *   | 'ERR_UNKNOWN_HOOK'
 *   | 'ERR_UNKNOWN_TOPIC'
 *   | 'ERR_UNKNOWN_SECTION'
 *   | 'ERR_UNKNOWN_CATEGORY'
 *   | 'ERR_UNKNOWN_TEMPLATE'
 *   | 'ERR_UNKNOWN_PACKAGE'
 *   | 'ERR_UNKNOWN_AGENT'
 *   | 'ERR_UNKNOWN_FEATURE'
 *   | 'ERR_UNKNOWN_CODEMOD'
 *   | 'ERR_NOT_FOUND'
 *   | 'ERR_NO_DOC'
 *   | 'ERR_NO_SHOWCASE'
 *   | 'ERR_NO_SOURCE'
 *   | 'ERR_INVALID_DOC'
 *   | 'ERR_FILE_NOT_FOUND'
 *   | 'ERR_FILE_EXISTS'
 *   | 'ERR_PATH_TRAVERSAL'
 *   | 'ERR_WRITE_FAILED'
 *   | 'ERR_THEME_INVALID'
 *   | 'ERR_THEME_LOAD'
 *   | 'ERR_TEMPLATE_CONFIG'
 *   | 'ERR_TEMPLATE_GET'
 *   | 'ERR_VERSION_DETECT'
 *   | 'ERR_INVALID_VERSION'
 *   | 'ERR_DEP_MISSING'
 *   | 'ERR_GH_CLI'
 *   | 'ERR_GAP_REPORT_FAILED'
 * )} ErrorCode
 */

/**
 * The complete, frozen set of XDS CLI error codes. Append-only.
 * @type {Readonly<Record<ErrorCode, ErrorCode>>}
 */
export const ERROR_CODES = Object.freeze({
  // ── Generic ──────────────────────────────────────────────────────
  /** Fallback for any error without a more specific code. */
  ERR_UNKNOWN: 'ERR_UNKNOWN',

  // ── CLI parsing / dispatch (Commander + bare invocation) ─────────
  /** A top-level command name was not recognized (e.g. `xds bogus`). */
  ERR_UNKNOWN_COMMAND: 'ERR_UNKNOWN_COMMAND',
  /** A subcommand under a command group was not recognized (e.g. `xds theme bogus`). */
  ERR_UNKNOWN_SUBCOMMAND: 'ERR_UNKNOWN_SUBCOMMAND',
  /** An unknown flag/option was passed (Commander `unknownOption`). */
  ERR_INVALID_OPTION: 'ERR_INVALID_OPTION',
  /** An option/argument had a value Commander's parser rejected. */
  ERR_INVALID_ARGUMENT: 'ERR_INVALID_ARGUMENT',
  /** A required positional argument was omitted (Commander `missingArgument`). */
  ERR_MISSING_ARGUMENT: 'ERR_MISSING_ARGUMENT',
  /** `--lang` was given a value outside its choices (en, zh, dense). */
  ERR_INVALID_LANG: 'ERR_INVALID_LANG',
  /** `--detail` was given a value outside its choices (full, compact, brief). */
  ERR_INVALID_DETAIL: 'ERR_INVALID_DETAIL',

  // ── Environment / runtime ────────────────────────────────────────
  /** The running Node.js version is below the supported minimum. */
  ERR_NODE_VERSION: 'ERR_NODE_VERSION',
  /** `@xds/core` could not be located (not installed / not in a monorepo). */
  ERR_CORE_NOT_FOUND: 'ERR_CORE_NOT_FOUND',

  // ── "Unknown <subject>" lookups ──────────────────────────────────
  /** No component matched the requested name. */
  ERR_UNKNOWN_COMPONENT: 'ERR_UNKNOWN_COMPONENT',
  /** No hook matched the requested name. */
  ERR_UNKNOWN_HOOK: 'ERR_UNKNOWN_HOOK',
  /** No docs topic matched the requested name. */
  ERR_UNKNOWN_TOPIC: 'ERR_UNKNOWN_TOPIC',
  /** A docs topic exists but the requested section within it does not. */
  ERR_UNKNOWN_SECTION: 'ERR_UNKNOWN_SECTION',
  /** A `--category` filter value did not match any known category. */
  ERR_UNKNOWN_CATEGORY: 'ERR_UNKNOWN_CATEGORY',
  /** No template matched the requested name. */
  ERR_UNKNOWN_TEMPLATE: 'ERR_UNKNOWN_TEMPLATE',
  /** No package matched the requested name (discover). */
  ERR_UNKNOWN_PACKAGE: 'ERR_UNKNOWN_PACKAGE',
  /** An unrecognized `--agent` value was passed to agent-docs/init. */
  ERR_UNKNOWN_AGENT: 'ERR_UNKNOWN_AGENT',
  /** An unrecognized `--features` value was passed to init. */
  ERR_UNKNOWN_FEATURE: 'ERR_UNKNOWN_FEATURE',
  /** A `--codemod` value did not match any registered codemod (upgrade). */
  ERR_UNKNOWN_CODEMOD: 'ERR_UNKNOWN_CODEMOD',
  /** A generic discover/lookup query matched nothing in any package. */
  ERR_NOT_FOUND: 'ERR_NOT_FOUND',

  // ── Resource shape problems (subject exists, artifact missing) ───
  /** A component exists but has no typed `.doc.mjs` file. */
  ERR_NO_DOC: 'ERR_NO_DOC',
  /** No showcase exists for the requested component. */
  ERR_NO_SHOWCASE: 'ERR_NO_SHOWCASE',
  /** No source file could be located for the requested component/template. */
  ERR_NO_SOURCE: 'ERR_NO_SOURCE',
  /** A component's docs failed validation (malformed `.doc.mjs`). */
  ERR_INVALID_DOC: 'ERR_INVALID_DOC',

  // ── Filesystem ───────────────────────────────────────────────────
  /** A required input file did not exist. */
  ERR_FILE_NOT_FOUND: 'ERR_FILE_NOT_FOUND',
  /** Refused to overwrite an existing file in non-interactive mode. */
  ERR_FILE_EXISTS: 'ERR_FILE_EXISTS',
  /** A path escaped its allowed root, or a name contained traversal markers. */
  ERR_PATH_TRAVERSAL: 'ERR_PATH_TRAVERSAL',
  /** Writing output files failed (and was rolled back). */
  ERR_WRITE_FAILED: 'ERR_WRITE_FAILED',

  // ── Theme build ──────────────────────────────────────────────────
  /** A theme definition was missing a required property (e.g. `name`). */
  ERR_THEME_INVALID: 'ERR_THEME_INVALID',
  /** A theme file could not be loaded / parsed into a defineTheme result. */
  ERR_THEME_LOAD: 'ERR_THEME_LOAD',

  // ── Template config ──────────────────────────────────────────────
  /** `template.get` is not configured in xds.config.mjs (fetch-by-id). */
  ERR_TEMPLATE_CONFIG: 'ERR_TEMPLATE_CONFIG',
  /** A configured `template.get` threw or returned an invalid value. */
  ERR_TEMPLATE_GET: 'ERR_TEMPLATE_GET',

  // ── Upgrade ──────────────────────────────────────────────────────
  /** The current `@xds/core` version could not be detected. */
  ERR_VERSION_DETECT: 'ERR_VERSION_DETECT',
  /** A `--from`/`--to` value was not a valid semver string. */
  ERR_INVALID_VERSION: 'ERR_INVALID_VERSION',
  /** A required external dependency (e.g. jscodeshift) is missing. */
  ERR_DEP_MISSING: 'ERR_DEP_MISSING',

  // ── Gap report ───────────────────────────────────────────────────
  /** GitHub CLI (`gh`) is not installed or not authenticated. */
  ERR_GH_CLI: 'ERR_GH_CLI',
  /** Filing a gap report failed at the command/integration boundary. */
  ERR_GAP_REPORT_FAILED: 'ERR_GAP_REPORT_FAILED',
});

/**
 * Type guard: is `value` one of the known error codes?
 * @param {unknown} value
 * @returns {value is ErrorCode}
 */
export function isErrorCode(value) {
  return typeof value === 'string' && Object.hasOwn(ERROR_CODES, value);
}

/**
 * All error code string values, sorted. Handy for tests and tooling.
 * @returns {string[]}
 */
export function allErrorCodes() {
  return Object.values(ERROR_CODES).sort();
}
