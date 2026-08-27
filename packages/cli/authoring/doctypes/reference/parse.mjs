// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Reference/topic doc parser (stamped `type: 'generic'`). The rich type
 * is {@link ReferenceDoc}; the stamped discriminant value stays `'generic'`.
 * Zod is sealed in `../_schema.mjs`; consumers call `parseReference` or `parseDoc`.
 */

import {GenericDocKindSchema} from '../_schema.mjs';
import {formatZodError} from '../../_shared/errors.mjs';

/** @typedef {import('../types').ReferenceDoc} ReferenceDoc */

/**
 * Validate an unknown value as a stamped reference/topic doc, or throw.
 *
 * @param {unknown} input
 * @param {string} [label]
 * @returns {ReferenceDoc}
 */
export function parseReference(input, label = 'reference doc') {
  const result = GenericDocKindSchema.safeParse(input);
  if (!result.success) {
    throw new Error(formatZodError(label, result.error));
  }
  // The schema is permissive (it also accepts legacy generic docs), so it is
  // deliberately looser than the rich public type; cast through unknown at this
  // validated boundary.
  return /** @type {ReferenceDoc} */ (/** @type {unknown} */ (result.data));
}
