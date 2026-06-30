// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Public file-based codemod-authoring API.
 *
 * Integrations (and core) author codemods as standalone modules that
 * default-export a `createCodemod(...)` or `createConfigCodemod(...)` result.
 * These helpers are intentionally tiny: they stamp a `type` discriminator
 * (`'code'` | `'config'`) consumed by integration codemod discovery during
 * `astryx upgrade`, and otherwise return the definition unchanged. They do NOT
 * validate — validation happens at the load boundary, where discovery runs the
 * module's default export through {@link CodemodEnvelopeSchema} (see
 * `loadModuleWithSchema`). The exported schemas below ARE that contract.
 */

import {z} from 'zod';

const Fn = z.custom(value => typeof value === 'function', {
  message: 'Expected a function',
});

/**
 * Authoring shape for a file-transforming codemod (the `def` an author passes
 * to {@link createCodemod}), before the `type` discriminator is stamped on.
 * Exported so discovery can validate the stamped result against the envelope.
 */
export const CodemodSchema = z
  .object({
    title: z.string(),
    description: z.string().optional(),
    isOptional: z.boolean().optional().default(false),
    fileExtensions: z.array(z.string()).optional(),
    transform: Fn,
  })
  .strict();

/**
 * Authoring shape for a config-targeting codemod (the `def` an author passes to
 * {@link createConfigCodemod}). Like {@link CodemodSchema} but without
 * `fileExtensions`, which is only meaningful for code codemods.
 */
export const ConfigCodemodSchema = z
  .object({
    title: z.string(),
    description: z.string().optional(),
    isOptional: z.boolean().optional().default(false),
    transform: Fn,
  })
  .strict();

/**
 * The metadata envelope discovery validates: a stamped codemod result. This is
 * the LOAD-boundary contract — a hand-written plain object that matches this
 * shape is accepted (discovery does not check "was it made by the factory",
 * only the shape). A single discriminated union over the stamped `type`:
 *   - `type: 'code'`  → may carry `fileExtensions`
 *   - `type: 'config'` → no `fileExtensions`
 */
export const CodemodEnvelopeSchema = z.discriminatedUnion('type', [
  CodemodSchema.extend({type: z.literal('code')}),
  ConfigCodemodSchema.extend({type: z.literal('config')}),
]);

/**
 * Define a file-transforming codemod. Stamp-only: returns the definition with
 * `type: 'code'` injected. Validation happens at the load boundary.
 *
 * @template {import('./types/codemod').AstryxCodemodDef} T
 * @param {T} def
 * @returns {import('./types/codemod').AstryxCodemod}
 */
export function createCodemod(def) {
  return /** @type {import('./types/codemod').AstryxCodemod} */ ({
    ...def,
    type: 'code',
  });
}

/**
 * Define a codemod that targets the consumer's astryx.config.* file. Stamp-only:
 * returns the definition with `type: 'config'` injected. Validation happens at
 * the load boundary.
 *
 * @template {import('./types/codemod').AstryxConfigCodemodDef} T
 * @param {T} def
 * @returns {import('./types/codemod').AstryxConfigCodemod}
 */
export function createConfigCodemod(def) {
  return /** @type {import('./types/codemod').AstryxConfigCodemod} */ ({
    ...def,
    type: 'config',
  });
}
