// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Config parser — the load-boundary validator for `astryx.config.*`.
 *
 * Zod is sealed inside this module: the schema is module-private, never
 * exported, and never appears in a public type. Consumers call `parseConfig`
 * (or import the {@link AstryxConfig} type); they never see zod. A compile-time
 * drift-lock asserts the private schema still infers exactly `AstryxConfig`.
 */

import {z} from 'zod';
import {formatZodError} from '../_shared/errors.mjs';

/** @typedef {import('./type').AstryxConfig} AstryxConfig */
/** @typedef {import('./type').PostCodemodHook} PostCodemodHook */
/** @typedef {import('./type').XleComponent} XleComponent */

// Typed `z.custom` so `z.infer` reproduces the real function type (not `unknown`).
const buildCommand = /** @type {z.ZodType<PostCodemodHook['buildCommand']>} */ (
  z.custom(value => typeof value === 'function', {message: 'Expected a function'})
);

const postCodemodHookSchema = z
  .object({
    name: z.string().optional(),
    buildCommand,
  })
  .strict();

const xleComponentSchema = z
  .object({
    from: z.string(),
    description: z.string().optional(),
    default: z.boolean().optional(),
  })
  .strict();

const configSchema = z
  .object({
    integrations: z.array(z.string()).optional(),
    issuesUrl: z.string().url().optional(),
    hooks: z
      .object({postCodemod: z.array(postCodemodHookSchema).optional()})
      .strict()
      .optional(),
    experimental: z
      .object({
        xle: z
          .object({components: z.record(z.string(), xleComponentSchema).optional()})
          .strict()
          .optional(),
      })
      .strict()
      .optional(),
  })
  .strict();

/**
 * Compile-time drift-lock: the sealed schema must infer EXACTLY the public
 * {@link AstryxConfig} type. If they drift, `Equal` becomes `false` and
 * `Expect<false>` fails the `tsconfig.authoring-contract.json` typecheck.
 *
 * @typedef {import('../_shared/contract').Expect<
 *   import('../_shared/contract').MutuallyAssignable<z.infer<typeof configSchema>, AstryxConfig>
 * >} _ConfigDriftLock
 */

/**
 * Validate an unknown value as an Astryx config, or throw a readable error.
 *
 * @param {unknown} input
 * @param {string} [label]
 * @returns {AstryxConfig}
 */
export function parseConfig(input, label = 'astryx.config') {
  const result = configSchema.safeParse(input);
  if (!result.success) {
    throw new Error(formatZodError(label, result.error));
  }
  return result.data;
}
