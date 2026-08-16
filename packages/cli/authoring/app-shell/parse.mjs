// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file App-shell parser — the load-boundary validator for the module an
 * integration points its manifest `appShell` at. Zod is sealed here; consumers
 * call `parseAppShell` or import the {@link AstryxAppShell} type.
 *
 * The public type is generic (typed `props`) and generics erase at runtime, so
 * this schema validates the concrete runtime shape — the hand-written type
 * carries the compile-time (author-facing) safety.
 */

import {z} from 'zod';
import {formatZodError} from '../_shared/errors.mjs';

/** @typedef {import('./type').AstryxAppShell} AstryxAppShell */

/**
 * A statically-renderable prop value: primitives, or JSON-shaped
 * objects/arrays. Recursive via z.lazy.
 * @type {import('zod').ZodType<import('./type').AppShellPropValue>}
 */
const propValueSchema = z.lazy(() =>
  z.union([
    z.string(),
    z.number(),
    z.boolean(),
    z.null(),
    z.array(propValueSchema),
    z.record(z.string(), propValueSchema),
  ]),
);

const appShellSchema = z
  .object({
    component: z
      .string()
      .regex(
        /^[A-Za-z_$][A-Za-z0-9_$]*$/,
        'component must be a valid identifier (e.g. "MetaAppFrame")',
      ),
    from: z.string().min(1, 'from must be a non-empty module specifier'),
    importKind: z.enum(['named', 'default']).optional(),
    props: z
      .record(
        z
          .string()
          .regex(
            /^[A-Za-z_$][A-Za-z0-9_$-]*$/,
            'prop name must be a valid JSX attribute name',
          ),
        propValueSchema,
      )
      .optional(),
    description: z.string().optional(),
  })
  .strict();

/**
 * Validate an unknown value as an Astryx app shell, or throw.
 *
 * @param {unknown} input
 * @param {string} [label]
 * @returns {AstryxAppShell}
 */
export function parseAppShell(input, label = 'astryx app shell') {
  const result = appShellSchema.safeParse(input);
  if (!result.success) {
    throw new Error(formatZodError(label, result.error));
  }
  return result.data;
}
