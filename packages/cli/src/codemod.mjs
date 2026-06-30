// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Public file-based codemod-authoring API.
 *
 * Integrations (and core) author codemods as standalone modules that
 * default-export a `createCodemod(...)` or `createConfigCodemod(...)` result.
 * These helpers validate the definition at authoring time and stamp a `type`
 * discriminator (`'code'` | `'config'`) consumed by integration codemod
 * discovery during `astryx upgrade`.
 */

import {z} from 'zod';

const Fn = z.custom(value => typeof value === 'function', {
  message: 'Expected a function',
});

const CodemodSchema = z
  .object({
    title: z.string(),
    description: z.string().optional(),
    isOptional: z.boolean().optional().default(false),
    fileExtensions: z.array(z.string()).optional(),
    transform: Fn,
  })
  .strict();

const ConfigCodemodSchema = z
  .object({
    title: z.string(),
    description: z.string().optional(),
    isOptional: z.boolean().optional().default(false),
    transform: Fn,
  })
  .strict();

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
 * Define a file-transforming codemod.
 *
 * @template {import('./types/codemod').AstryxCodemodDef} T
 * @param {T} def
 * @returns {import('./types/codemod').AstryxCodemod}
 */
export function createCodemod(def) {
  const result = CodemodSchema.safeParse(def);
  if (!result.success) {
    throw new Error(formatZodError('createCodemod definition', result.error));
  }
  return {...result.data, type: 'code'};
}

/**
 * Define a codemod that targets the consumer's astryx.config.* file.
 *
 * @template {import('./types/codemod').AstryxConfigCodemodDef} T
 * @param {T} def
 * @returns {import('./types/codemod').AstryxConfigCodemod}
 */
export function createConfigCodemod(def) {
  const result = ConfigCodemodSchema.safeParse(def);
  if (!result.success) {
    throw new Error(
      formatZodError('createConfigCodemod definition', result.error),
    );
  }
  return {...result.data, type: 'config'};
}
