// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * Template command JSON responses.
 *
 * The types now live next to the `template` API as JSDoc typedefs. This file
 * re-exports them so existing `types/template` imports keep resolving. Edit the
 * source of truth at `../api/template/template.type.mjs`.
 */
export type {
  TemplateListResponse,
  TemplateListEntry,
  TemplateShowResponse,
  TemplateSkeletonResponse,
  TemplateCopyResponse,
} from '../api/template/template.type.mjs';
