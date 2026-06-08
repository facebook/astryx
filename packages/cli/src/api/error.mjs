// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file API error class — carries structured error info matching CLIError shape.
 *
 * `XDSError` is what the API layer throws. Alongside the human-readable
 * message and optional `suggestions`, it carries a stable machine-readable
 * `code` (see ../lib/error-codes.mjs). When the CLI catches an XDSError and
 * routes it through `cliError`, it propagates `e.code` so the JSON error
 * envelope's `code` field matches the API contract exactly. The code defaults
 * to `ERR_UNKNOWN` so older throw sites still produce a valid envelope.
 */

import {ERROR_CODES} from '../lib/error-codes.mjs';

export class XDSError extends Error {
  /** @type {Array<{name: string, reason: string}> | undefined} */
  suggestions;

  /**
   * Stable, machine-readable error code (error-codes.mjs). Consumers branch
   * on this, never on the message text.
   * @type {string}
   */
  code;

  /**
   * @param {string} message
   * @param {Array<{name: string, reason: string}>} [suggestions]
   * @param {string} [code] - Stable error code. Defaults to ERR_UNKNOWN.
   */
  constructor(message, suggestions, code) {
    super(message);
    this.name = 'XDSError';
    this.code = code || ERROR_CODES.ERR_UNKNOWN;
    if (suggestions?.length) this.suggestions = suggestions;
  }
}
