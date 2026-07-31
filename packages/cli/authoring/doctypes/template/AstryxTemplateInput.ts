// Copyright (c) Meta Platforms, Inc. and affiliates.

import type {AstryxTemplatePreview} from './AstryxTemplatePreview';

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
