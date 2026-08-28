// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file `astryx layout check` leaf — validate a layout expression without
 * expanding, echoing both canonical surfaces (compact + outline). Resolution +
 * validation come from ../_adapter.mjs (analyze); this leaf projects the
 * `layout.check` envelope.
 *
 * @input  expression string (+ options)
 * @output {type:'layout.check', data}
 * @position api — leaf over ../_adapter.mjs + lib/xle/print
 */

import {toCompact, toOutline} from '../../../foundation/xle/print.mjs';
import {analyze, formatIssue} from '../_adapter.mjs';

/**
 * `astryx layout check "<expr>" [--form compact|outline]`
 * Validates without expanding; echoes both canonical surfaces.
 *
 * @param {string} expression
 * @param {{form?: 'compact'|'outline'|'auto', loose?: boolean, cwd?: string}} [options]
 * @returns {Promise<import('../layout.type.mjs').LayoutCheckResponse>}
 */
export async function layoutCheck(expression, options = {}) {
  const {form = 'auto', loose = false, cwd = process.cwd()} = options;
  const {doc, errors, warnings} = await analyze(expression, {form, loose, cwd});

  return {
    type: 'layout.check',
    data: {
      valid: errors.length === 0,
      form: doc.form,
      errors: errors.map(e => ({...e, formatted: formatIssue(e)})),
      warnings: warnings.map(formatIssue),
      compact: toCompact(doc),
      outline: toOutline(doc),
    },
  };
}
