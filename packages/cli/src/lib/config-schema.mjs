// Copyright (c) Meta Platforms, Inc. and affiliates.

/** Runtime schemas for Astryx config and integration manifests. */

import {z} from 'zod';

const Fn = z.custom(value => typeof value === 'function', {
  message: 'Expected function',
});

const StringOrStringArray = z.union([z.string(), z.array(z.string())]);
const GapReportSchema = z.union([
  z.literal(false),
  z.object({command: z.string()}).passthrough(),
]);

export const AstryxConfigSchema = z
  .object({
    packages: StringOrStringArray.optional(),
    integrations: StringOrStringArray.optional(),
    gapReport: GapReportSchema.optional(),
    template: z
      .object({
        get: Fn.optional(),
      })
      .passthrough()
      .optional(),
  })
  .passthrough();

export const AstryxIntegrationCodemodSchema = z
  .object({
    name: z.string(),
    from: z.string().optional(),
    to: z.string().optional(),
    title: z.string().optional(),
    description: z.string().optional(),
    pr: z.string().optional(),
    optional: z.boolean().optional(),
    fileExtensions: z.array(z.string()).optional(),
    transform: z.union([z.string(), Fn]),
  })
  .passthrough();

export const AstryxPostCodemodHookSchema = z
  .object({
    name: z.string().optional(),
    run: Fn.optional(),
    command: Fn.optional(),
  })
  .passthrough()
  .refine(value => value.run || value.command, {
    message: 'postCodemod hook must define run() or command()',
  });

export const AstryxIntegrationSchema = z
  .object({
    name: z.string(),
    version: z.string().optional(),
    displayName: z.string().optional(),
    description: z.string().optional(),
    docs: z.string().optional(),
    category: z.string().optional(),
    blocks: z.string().optional(),
    gapReport: GapReportSchema.optional(),
    template: z
      .object({
        get: z.union([z.string(), Fn]).optional(),
      })
      .passthrough()
      .optional(),
    codemods: z.array(AstryxIntegrationCodemodSchema).optional(),
    postCodemod: z.array(AstryxPostCodemodHookSchema).optional(),
  })
  .passthrough();

/**
 * @param {string} label
 * @param {import('zod').ZodError} error
 */
function formatZodError(label, error) {
  const issues = error.issues
    .map(issue => {
      const path = issue.path.length ? issue.path.join('.') : '(root)';
      return `${path}: ${issue.message}`;
    })
    .join('; ');
  return `${label} is invalid: ${issues}`;
}

/**
 * @param {unknown} config
 * @returns {import('../types/config').AstryxConfig}
 */
export function validateConfig(config) {
  const result = AstryxConfigSchema.safeParse(config);
  if (!result.success) {
    throw new Error(
      formatZodError('astryx.config.mjs default export', result.error),
    );
  }
  return result.data;
}

/**
 * @param {unknown} integration
 * @param {string} [label]
 * @returns {import('../types/config').AstryxIntegration}
 */
export function validateIntegration(
  integration,
  label = 'integration manifest',
) {
  const result = AstryxIntegrationSchema.safeParse(integration);
  if (!result.success) {
    throw new Error(formatZodError(label, result.error));
  }
  return result.data;
}
