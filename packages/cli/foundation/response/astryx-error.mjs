// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file The API error class, with no Node dependency: `api/error.mjs`
 * re-exports it, and browser-safe API modules import it from here.
 */

import {ERROR_CODES} from './error-codes.mjs';

export class AstryxError extends Error {
  /** @type {import('./base').Suggestion[] | undefined} */
  suggestions;

  /**
   * Stable, machine-readable error code (error-codes.mjs). Consumers branch
   * on this, never on the message text.
   * @type {string}
   */
  code;

  /**
   * @param {string} message
   * @param {import('./base').Suggestion[]} [suggestions]
   * @param {string} [code] - Stable error code. Defaults to ERR_UNKNOWN.
   */
  constructor(message, suggestions, code) {
    super(message);
    this.name = 'AstryxError';
    this.code = code || ERROR_CODES.ERR_UNKNOWN;
    if (Array.isArray(suggestions) && suggestions.length)
      this.suggestions = suggestions;
  }
}
