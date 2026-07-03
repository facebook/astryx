// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * Authoring surface for Astryx static templates, exported from
 * `@astryxdesign/cli/template`.
 *
 * A template doc lives in a `<id>.doc.{ts,mjs,js}` file with a required
 * same-stem sibling source file (`<id>.tsx`). The doc's `type` (page or
 * block) — injected by the create* helpers — decides how the template is
 * scaffolded; there is no `/pages` vs `/blocks` directory requirement.
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

export declare function createPageTemplate<T extends AstryxPageTemplateInput>(
  def: T,
): T & {type: 'page'};

export declare function createBlockTemplate<T extends AstryxBlockTemplateInput>(
  def: T,
): T & {type: 'block'};
