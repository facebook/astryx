// Copyright (c) Meta Platforms, Inc. and affiliates.

/** Optional preview metadata for a template (used by docs surfaces). */
export interface AstryxTemplatePreview {
  /** Path or URL to a preview image. */
  image?: string;
  /** CSS aspect-ratio hint for the preview, e.g. "16 / 9". */
  aspectRatio?: string;
}
