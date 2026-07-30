// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file template.ts
 * @input A page/block template doc object (without the `type` tag).
 * @output Type-preserving `createPageTemplate`/`createBlockTemplate` helpers
 *   plus the authored-template TypeScript surface.
 * @position Integration-author authoring surface. See `./index.ts` for why
 *   these authoring factories live in `@astryxdesign/core`.
 *
 * A template doc lives in a `<id>.doc.{ts,mjs,js}` file with a required
 * same-stem sibling source file (`<id>.tsx`). The doc's `type` (page or block)
 * — injected by the create* helpers — decides how the template is scaffolded.
 *
 * These are tiny runtime identity helpers that inject the `type` discriminant.
 * They do NOT validate — validation happens at the CLI load boundary, where
 * integration template discovery runs the module's default export through the
 * template envelope schema.
 */

/** Optional preview metadata for a template (used by docs surfaces). */
export interface AstryxTemplatePreview {
  /** Path or URL to a preview image. */
  image?: string;
  /** CSS aspect-ratio hint for the preview, e.g. "16 / 9". */
  aspectRatio?: string;
}

/** Fields common to page and block template docs (without the `type` tag). */
export interface AstryxTemplateInput {
  /** Human-readable template name. Required. */
  name: string;
  /** One-line description of what the template provides. Required. */
  description: string;
  /** Optional grouping/category label. */
  category?: string;
  /** Component display names the template composes. */
  componentsUsed?: string[];
  /** Optional preview metadata. */
  preview?: AstryxTemplatePreview;
}

/** Input accepted by {@link createPageTemplate} (no `type` field). */
export type AstryxPageTemplateInput = AstryxTemplateInput;
/** Input accepted by {@link createBlockTemplate} (no `type` field). */
export type AstryxBlockTemplateInput = AstryxTemplateInput;

/** A validated page template doc. */
export type AstryxPageTemplate = AstryxTemplateInput & {type: 'page'};
/** A validated block template doc. */
export type AstryxBlockTemplate = AstryxTemplateInput & {type: 'block'};

/** A validated template doc (page or block). */
export type AstryxTemplate = AstryxPageTemplate | AstryxBlockTemplate;

/**
 * Author an Astryx page template doc. Stamp-only: returns the def with
 * `type: 'page'` injected. Validation happens at the CLI load boundary.
 */
export function createPageTemplate<T extends AstryxPageTemplateInput>(
  def: T,
): T & {type: 'page'} {
  return {...def, type: 'page'};
}

/**
 * Author an Astryx block template doc. Stamp-only: returns the def with
 * `type: 'block'` injected. Validation happens at the CLI load boundary.
 */
export function createBlockTemplate<T extends AstryxBlockTemplateInput>(
  def: T,
): T & {type: 'block'} {
  return {...def, type: 'block'};
}
