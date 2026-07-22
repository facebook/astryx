// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * The template-authoring surface moved to `@astryxdesign/core/authoring`.
 * Re-exported here so existing `@astryxdesign/cli/template` type imports keep
 * resolving.
 */
export type {
  AstryxTemplatePreview,
  AstryxTemplateInput,
  AstryxPageTemplateInput,
  AstryxBlockTemplateInput,
  AstryxPageTemplate,
  AstryxBlockTemplate,
  AstryxTemplate,
} from '@astryxdesign/core/authoring';

export {createPageTemplate, createBlockTemplate} from '@astryxdesign/core/authoring';
