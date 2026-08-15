// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Colocated types for the `cdn` command — the source of truth for its
 * JSON response shape. The leaf's `@returns` references these directly; the
 * public `@astryxdesign/cli/api` surface re-exports them.
 *
 * Invocation                                 -> type discriminator
 * ------------------------------------------------------------------
 * xds --json cdn template                    -> cdn.template
 * (path escapes the project)                 -> CLIError
 *
 * @position api — colocated typedefs for api/cdn/template
 */

/**
 * xds --json cdn template
 * `written: false` with `reason: 'exists'` is a success: the command is safe to
 * re-run, and an edited page is the consumer's file to keep. `version` is the
 * Astryx version every CDN URL in the file was pinned to.
 * @typedef {object} CdnTemplateResponse
 * @property {'cdn.template'} type
 * @property {{path: string, version: string, written: boolean, reason: 'exists' | null}} data
 */

// Make this a module so the @typedefs above are importable as types via
// `import('./cdn.type.mjs').CdnTemplateResponse`.
export {};
