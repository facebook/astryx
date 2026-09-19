// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Theme doc parser (stamped `type: 'theme'`). Zod is sealed here;
 * theme discovery calls `parseTheme` at the descriptor load boundary.
 *
 * @input an unknown loaded or statically extracted theme descriptor
 * @output a validated ThemeDoc or a readable schema error
 * @position packages/cli/authoring/doctypes/theme — descriptor load boundary
 */

import {z} from 'zod';
import {formatZodError} from '../../_shared/errors.mjs';

/** @typedef {import('./type').ThemeDoc} ThemeDoc */

const themeDocSchema = z
  .object({
    type: z.literal('theme'),
    name: z
      .string()
      .regex(
        /^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/u,
        'name must be lowercase kebab-case starting with a letter',
      ),
    displayName: z.string().min(1, 'displayName is required'),
    description: z.string(),
    maintained: z.boolean(),
  })
  .strict();

/**
 * Compile-time drift lock: the sealed schema must infer exactly ThemeDoc.
 *
 * @typedef {import('../../_shared/contract').Expect<
 *   import('../../_shared/contract').Equal<
 *     z.infer<typeof themeDocSchema>,
 *     ThemeDoc
 *   >
 * >} _ThemeDocDriftLock
 */

/**
 * Validate an unknown value as a theme descriptor, or throw.
 *
 * @param {unknown} input
 * @param {string} [label]
 * @returns {ThemeDoc}
 */
export function parseTheme(input, label = 'theme') {
  const result = themeDocSchema.safeParse(input);
  if (!result.success) {
    throw new Error(formatZodError(label, result.error));
  }
  return result.data;
}
