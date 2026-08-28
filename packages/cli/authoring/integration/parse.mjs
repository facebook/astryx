// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Integration-manifest parser — the load-boundary validator for
 * `astryx.integration.*`. Zod is sealed here; consumers call `parseIntegration`
 * or import the {@link AstryxIntegration} type.
 */

import {z} from 'zod';
import {formatZodError} from '../_shared/errors.mjs';

/** @typedef {import('./type').AstryxIntegration} AstryxIntegration */

const integrationSchema = z
  .object({
    components: z.string().optional(),
    templates: z.string().optional(),
    codemods: z.string().optional(),
    docs: z.string().optional(),
    issuesUrl: z.string().url().optional(),
  })
  .strict();

/**
 * Compile-time drift-lock: sealed schema must infer exactly {@link AstryxIntegration}.
 *
 * @typedef {import('../_shared/contract').Expect<
 *   import('../_shared/contract').Equal<z.infer<typeof integrationSchema>, AstryxIntegration>
 * >} _IntegrationDriftLock
 */

/**
 * Validate an unknown value as an Astryx integration manifest, or throw.
 *
 * @param {unknown} input
 * @param {string} [label]
 * @returns {AstryxIntegration}
 */
export function parseIntegration(input, label = 'astryx.integration') {
  const result = integrationSchema.safeParse(input);
  if (!result.success) {
    throw new Error(formatZodError(label, result.error));
  }
  return result.data;
}
