// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file The integration-manifest schema, and the key census derived from it.
 *
 * Internal. No `exports` entry in package.json resolves here, so nothing in
 * this file is reachable from a published subpath — `parse.mjs` is the public
 * face of `./integration` and exports `parseIntegration` alone. Zod stays
 * sealed on this side of that line.
 *
 * The census is READ OFF the schema rather than written beside it. A key added
 * to one is a key added to the other, so a field this CLI supports can never
 * be reported as unsupported.
 */

import {z} from 'zod';

/** @typedef {import('./type').AstryxIntegration} AstryxIntegration */

// Unknown keys are stripped rather than rejected. `.strict()` made a key from a
// newer CLI a hard parse failure, and a manifest that fails to parse
// contributes NOTHING — an integration that added one field lost its
// components, templates and codemods too, on every consumer resolving an older
// CLI, silently (#5119). A key this CLI does not know is a key it cannot act
// on; the rest of the manifest is still good, so the rest of the manifest is
// still loaded and the unknown key is reported as a warning by
// `unknownIntegrationKeys`. Known keys stay strictly typed: a `components: 42`
// IS an authoring mistake and still fails here.
export const integrationSchema = z.object({
  components: z.string().optional(),
  templates: z.string().optional(),
  codemods: z.string().optional(),
  docs: z.string().optional(),
  issuesUrl: z.string().url().optional(),
});

/**
 * Compile-time drift-lock: sealed schema must infer exactly {@link AstryxIntegration}.
 *
 * @typedef {import('../_shared/contract').Expect<
 *   import('../_shared/contract').Equal<z.infer<typeof integrationSchema>, AstryxIntegration>
 * >} _IntegrationDriftLock
 */

/**
 * The keys this CLI knows, taken from the schema itself.
 *
 * A manifest may hold others: an integration is published once and installed
 * against many CLI versions, so a key introduced later arrives here routinely
 * and is not an authoring mistake.
 *
 * @type {string[]}
 */
export const KNOWN_INTEGRATION_KEYS = Object.keys(integrationSchema.shape);

/**
 * The manifest keys this CLI does not know, in the order they were authored.
 *
 * Separate from `parseIntegration` because the two answer different questions:
 * the parser says whether the manifest is usable, and this says how much of it
 * this CLI is able to use. Callers report the difference — as a warning, never
 * a failure. Almost always the author is on a newer CLI than the consumer.
 *
 * @param {unknown} input
 * @returns {string[]}
 */
export function unknownIntegrationKeys(input) {
  if (input == null || typeof input !== 'object' || Array.isArray(input)) {
    return [];
  }
  return Object.keys(input).filter(
    key => !KNOWN_INTEGRATION_KEYS.includes(key),
  );
}
