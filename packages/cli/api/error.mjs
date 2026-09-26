// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file API error class — carries structured error info matching CLIError shape.
 *
 * `AstryxError` is what the API layer throws. Alongside the human-readable
 * message and optional `suggestions`, it carries a stable machine-readable
 * `code` (see ../foundation/response/error-codes.mjs). When the CLI catches an AstryxError and
 * routes it through `cliError`, it propagates `e.code` so the JSON error
 * envelope's `code` field matches the API contract exactly. The code defaults
 * to `ERR_UNKNOWN` so older throw sites still produce a valid envelope.
 */

import {ERROR_CODES} from '../foundation/response/error-codes.mjs';
import * as path from 'node:path';

export class AstryxError extends Error {
  /** @type {import('../foundation/response/base').Suggestion[] | undefined} */
  suggestions;

  /**
   * Stable, machine-readable error code (error-codes.mjs). Consumers branch
   * on this, never on the message text.
   * @type {string}
   */
  code;

  /**
   * @param {string} message
   * @param {import('../foundation/response/base').Suggestion[]} [suggestions]
   * @param {string} [code] - Stable error code. Defaults to ERR_UNKNOWN.
   */
  constructor(message, suggestions, code) {
    super(message);
    this.name = 'AstryxError';
    this.code = code || ERROR_CODES.ERR_UNKNOWN;
    if (Array.isArray(suggestions) && suggestions.length) this.suggestions = suggestions;
  }
}

/**
 * The error for a write that failed on the filesystem: no permission, a
 * read-only mount, a full disk, a path component that is not a directory.
 *
 * A raw Node errno error reached the envelope as
 * `{"error": "EACCES: permission denied, open '/home/you/p/readonly/x.tsx'",
 * "code": "ERR_UNKNOWN"}` — the wrong code (ERR_WRITE_FAILED is in the frozen
 * registry for exactly this) and an absolute host path in the message. This
 * keeps the errno, which is the part that tells you what to fix, and reports
 * the target the way every other Astryx message does: relative to the project.
 *
 * Only for a write that failed outright. A write that half-succeeded is a
 * different report, and no caller of this has one.
 *
 * @param {string} target absolute path the write was aimed at
 * @param {string} cwd project root, for the relative form
 * @param {unknown} cause the error the filesystem call threw
 * @returns {AstryxError}
 */
export function writeFailed(target, cwd, cause) {
  const rel = path.relative(cwd, target) || target;
  const errno =
    typeof (/** @type {any} */ (cause)?.code) === 'string'
      ? /** @type {any} */ (cause).code
      : null;
  const why = errno === 'EACCES' || errno === 'EPERM' ? ' (no permission)' : '';
  return new AstryxError(
    `Could not write ${rel}${errno ? `: ${errno}` : ''}${why}. Nothing was written.`,
    undefined,
    ERROR_CODES.ERR_WRITE_FAILED,
  );
}
