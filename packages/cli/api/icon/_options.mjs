// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file The options each icon authoring call takes; any other is refused, so
 * a caller never gets a silent success that did not do what it asked.
 *
 * @position api/icon — read by api/icon/new-set and api/icon/new-definition
 */

import {AstryxError} from '../error.mjs';
import {ERROR_CODES} from '../../foundation/response/error-codes.mjs';

/** The options each call takes. */
const ALLOWED = {
  'icon-set': new Set(['cwd', 'dryRun', 'from', 'exclude']),
  'icon-definition': new Set([
    'cwd',
    'dryRun',
    'set',
    'description',
    'words',
    'icon',
  ]),
};

/**
 * Refuse an option the call does not take.
 * @param {keyof typeof ALLOWED} kind
 * @param {Record<string, unknown>} options
 */
export function refuseOtherOptions(kind, options) {
  for (const [key, value] of Object.entries(options)) {
    if (value !== undefined && !ALLOWED[kind].has(key)) {
      throw new AstryxError(
        `Option "${key}" does not apply to integration kind "${kind}".`,
        undefined,
        ERROR_CODES.ERR_INVALID_ARGUMENT,
      );
    }
  }
}
