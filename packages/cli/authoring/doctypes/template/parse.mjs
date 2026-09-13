// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Template doc parser (stamped `type: 'page' | 'block'`). Zod is sealed
 * here; template discovery calls `parseTemplate` at the load boundary.
 *
 * Integration templates use the same authored fields as first-party templates;
 * discovery normalizes the result into the public {@link TemplateDoc} shape.
 */

import {z} from 'zod';
import {formatZodError} from '../../_shared/errors.mjs';

/** @typedef {import('../types').TemplateDoc} TemplateDoc */

const previewSchema = z
  .object({
    image: z.string().optional(),
    aspectRatio: z.string().optional(),
  })
  .strict();

const registryIdentitySchema = z
  .object({
    slug: z
      .string()
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
      .optional(),
    aliases: z
      .array(
        z
          .string()
          .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*(?:\/[a-z0-9]+(?:-[a-z0-9]+)*)*$/),
      )
      .optional(),
  })
  .strict();

const baseTemplateFields = {
  name: z.string().min(1, 'name is required'),
  displayName: z.string().min(1).optional(),
  description: z.string().min(1, 'description is required'),
  category: z.string().optional(),
  componentsUsed: z.array(z.string()).optional(),
  preview: previewSchema.optional(),
  isReady: z.boolean().optional(),
  scaffold: z.boolean().optional(),
  isHiddenFromOverview: z.boolean().optional(),
  registry: registryIdentitySchema.optional(),
};

const pageTemplateSchema = z
  .object({...baseTemplateFields, type: z.literal('page')})
  .strict();
const blockTemplateSchema = z
  .object({
    ...baseTemplateFields,
    type: z.literal('block'),
    exampleFor: z.string().min(1).optional(),
    alsoExampleFor: z.array(z.string()).optional(),
    alsoShowcaseFor: z.array(z.string()).optional(),
    aspectRatio: z.number().positive().optional(),
    scale: z.number().positive().optional(),
    isShowcase: z.boolean().optional(),
  })
  .strict();

const templateEnvelopeSchema = z
  .discriminatedUnion('type', [pageTemplateSchema, blockTemplateSchema])
  .superRefine((template, context) => {
    if (
      template.type === 'block' &&
      template.isShowcase &&
      !template.exampleFor
    ) {
      context.addIssue({
        code: 'custom',
        path: ['exampleFor'],
        message: 'exampleFor is required when isShowcase is true',
      });
    }
  });

/**
 * Validate an unknown value as a stamped template doc, or throw. The zod schema
 * validates the integration-template envelope; the returned value is typed as
 * the public {@link TemplateDoc}.
 *
 * @param {unknown} input
 * @param {string} [label]
 * @returns {TemplateDoc}
 */
export function parseTemplate(input, label = 'template') {
  const result = templateEnvelopeSchema.safeParse(input);
  if (!result.success) {
    throw new Error(formatZodError(label, result.error));
  }
  return /** @type {TemplateDoc} */ (result.data);
}
