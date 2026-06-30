// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Static template authoring API.
 *
 * Helpers for authoring Astryx page/block template docs. Like
 * `createConfig`/`createIntegration`, these are tiny runtime
 * validate-and-return helpers whose real value is the exported TypeScript
 * surface from `@astryxdesign/cli/template`. They inject the discriminant
 * `type` so a discovered doc always knows whether it is a page or a block.
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
 */
const BaseTemplateSchema = z
  .object({
    name: z.string().min(1, 'name is required'),
    description: z.string().min(1, 'description is required'),
    category: z.string().optional(),
    componentsUsed: z.array(z.string()).optional(),
    preview: PreviewSchema.optional(),
  })
  .strict();

/**
 * @param {'page'|'block'} type
 * @param {unknown} def
 * @param {string} label
 */
function validateTemplate(type, def, label) {
  const result = BaseTemplateSchema.safeParse(def);
  if (!result.success) {
    const issues = result.error.issues
      .map(issue => {
        const path = issue.path.length ? issue.path.join('.') : '(root)';
        return `${path}: ${issue.message}`;
      })
      .join('; ');
    throw new Error(`${label} is invalid: ${issues}`);
  }
  return {...result.data, type};
}

/**
 * Author an Astryx page template doc.
 *
 * @template {import('./types/template-api').AstryxPageTemplateInput} T
 * @param {T} def
 * @returns {T & {type: 'page'}}
 */
export function createPageTemplate(def) {
  return /** @type {T & {type: 'page'}} */ (
    validateTemplate('page', def, 'page template')
  );
}

/**
 * Author an Astryx block template doc.
 *
 * @template {import('./types/template-api').AstryxBlockTemplateInput} T
 * @param {T} def
 * @returns {T & {type: 'block'}}
 */
export function createBlockTemplate(def) {
  return /** @type {T & {type: 'block'}} */ (
    validateTemplate('block', def, 'block template')
  );
}
