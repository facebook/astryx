// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Static template authoring API.
 *
 * Helpers for authoring Astryx page/block template docs. Like
 * `createConfig`/`createIntegration`, these are tiny runtime identity helpers
 * whose real value is the exported TypeScript surface from
 * `@astryxdesign/cli/template`. They inject the discriminant `type` so a
 * discovered doc always knows whether it is a page or a block. They do NOT
 * validate — validation happens at the load boundary, where integration
 * template discovery runs the module's default export through
 * {@link TemplateEnvelopeSchema} (see `loadModuleWithSchema`).
 */

import {z} from 'zod';

const PreviewSchema = z
  .object({
    image: z.string().optional(),
    aspectRatio: z.string().optional(),
  })
  .strict();

/**
 * Shared authored-template shape. `type` is injected by the create* helpers,
 * so authors never write it. Inline source/sourceFile are intentionally NOT
 * part of v1 — a template's source is the required same-stem sibling file.
 * Exported so integration template discovery can validate the stamped result.
 */
export const BaseTemplateSchema = z
  .object({
    name: z.string().min(1, 'name is required'),
    description: z.string().min(1, 'description is required'),
    category: z.string().optional(),
    componentsUsed: z.array(z.string()).optional(),
    preview: PreviewSchema.optional(),
  })
  .strict();

/**
 * The metadata envelope integration template discovery validates: a stamped
 * template doc. This is the LOAD-boundary contract — a hand-written plain
 * object that matches this shape is accepted (discovery does not check "was it
 * made by the factory", only the shape).
 */
export const TemplateEnvelopeSchema = BaseTemplateSchema.extend({
  type: z.enum(['page', 'block']),
});

/**
 * Author an Astryx page template doc. Stamp-only: returns the def with
 * `type: 'page'` injected. Validation happens at the load boundary.
 *
 * @template {import('./types/template-api').AstryxPageTemplateInput} T
 * @param {T} def
 * @returns {T & {type: 'page'}}
 */
export function createPageTemplate(def) {
  return /** @type {T & {type: 'page'}} */ ({...def, type: 'page'});
}

/**
 * Author an Astryx block template doc. Stamp-only: returns the def with
 * `type: 'block'` injected. Validation happens at the load boundary.
 *
 * @template {import('./types/template-api').AstryxBlockTemplateInput} T
 * @param {T} def
 * @returns {T & {type: 'block'}}
 */
export function createBlockTemplate(def) {
  return /** @type {T & {type: 'block'}} */ ({...def, type: 'block'});
}
