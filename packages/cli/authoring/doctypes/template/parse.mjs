// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Template doc parser (stamped `type: 'page' | 'block'`). Zod is sealed
 * here; template discovery calls `parseTemplate` at the load boundary. A
 * discriminated union so the drift-lock can hold against the public
 * {@link AstryxTemplate} union.
 */

import {z} from 'zod';
import {formatZodError} from '../../_shared/errors.mjs';

/** @typedef {import('../types').AstryxTemplate} AstryxTemplate */

const previewSchema = z
  .object({
    image: z.string().optional(),
    aspectRatio: z.string().optional(),
  })
  .strict();

const baseTemplateFields = {
  name: z.string().min(1, 'name is required'),
  description: z.string().min(1, 'description is required'),
  category: z.string().optional(),
  componentsUsed: z.array(z.string()).optional(),
  preview: previewSchema.optional(),
};

const templateEnvelopeSchema = z.discriminatedUnion('type', [
  z.object({...baseTemplateFields, type: z.literal('page')}).strict(),
  z.object({...baseTemplateFields, type: z.literal('block')}).strict(),
]);

/**
 * Compile-time drift-lock: sealed envelope must infer exactly {@link AstryxTemplate}.
 *
 * @typedef {import('../../_shared/contract').Expect<
 *   import('../../_shared/contract').MutuallyAssignable<z.infer<typeof templateEnvelopeSchema>, AstryxTemplate>
 * >} _TemplateDriftLock
 */

/**
 * Validate an unknown value as a stamped template doc, or throw.
 *
 * @param {unknown} input
 * @param {string} [label]
 * @returns {AstryxTemplate}
 */
export function parseTemplate(input, label = 'template') {
  const result = templateEnvelopeSchema.safeParse(input);
  if (!result.success) {
    throw new Error(formatZodError(label, result.error));
  }
  return result.data;
}
