// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * The doc-authoring surface moved to `@astryxdesign/core/authoring`. Re-exported
 * here so existing `@astryxdesign/cli/doc` type imports keep resolving. The Zod
 * load-boundary schemas remain in the CLI (see `src/doc.mjs`).
 */
export type {
  AstryxBaseDocInput,
  AstryxPropInput,
  AstryxParamInput,
  AstryxReturnInput,
  AstryxComponentDocInput,
  AstryxFunctionDocInput,
  AstryxGenericDocInput,
  AstryxComponentDoc,
} from '@astryxdesign/core/authoring';

export {
  createComponentDoc,
  createFunctionDoc,
  createDoc,
} from '@astryxdesign/core/authoring';
