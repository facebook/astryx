// Copyright (c) Meta Platforms, Inc. and affiliates.

/** Runtime schemas for Astryx config and integration manifests. */

import {z} from 'zod';

const Fn = z.custom(value => typeof value === 'function', {
  message: 'Expected function',
});

export const PostCodemodHookSchema = z
  .object({
    name: z.string().optional(),
    buildCommand: Fn,
  })
  .strict();

export const XleComponentSchema = z
  .object({
    from: z.string(),
    description: z.string().optional(),
    default: z.boolean().optional(),
  })
  .strict();

export const AstryxConfigSchema = z
  .object({
    integrations: z.array(z.string()).optional(),
    issuesUrl: z.string().url().optional(),
    hooks: z
      .object({
        postCodemod: z.array(PostCodemodHookSchema).optional(),
      })
      .strict()
      .optional(),
    experimental: z
      .object({
        xle: z
          .object({
            components: z.record(z.string(), XleComponentSchema).optional(),
          })
          .strict()
          .optional(),
      })
      .strict()
      .optional(),
  })
  .strict();

export const AstryxIntegrationSchema = z
  .object({
    components: z.string().optional(),
    templates: z.string().optional(),
    codemods: z.string().optional(),
    issuesUrl: z.string().url().optional(),
  })
  .strict();

/**
 * Format a zod error into a single readable line, mirroring the issue-joining
 * convention used across the CLI (path: message; path: message). Exported so
 * the shared module loader and other validators stay in lockstep.
 * @param {string} label
 * @param {import('zod').ZodError} error
 * @returns {string}
 */
export function formatZodError(label, error) {
  const issues = error.issues
    .map(issue => {
      const path = issue.path.length ? issue.path.join('.') : '(root)';
      return `${path}: ${issue.message}`;
    })
    .join('; ');
  return `${label} is invalid: ${issues}`;
}
