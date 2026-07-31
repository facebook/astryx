// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Doc-type vocabulary barrel. Each type lives in its own file under
 * `base/` (shared leaf primitives) or its per-kind folder
 * (`component/`, `hook/`, `reference/`, `template/`); this re-exports them as
 * the doc surface behind `@astryxdesign/cli/authoring`.
 */

export type * from './AstryxComponentDoc';
export type * from './base/AnatomyElement';
export type * from './base/AstryxBaseDocInput';
export type * from './base/AstryxParamInput';
export type * from './base/AstryxPropInput';
export type * from './base/AstryxReturnInput';
export type * from './base/BestPractice';
export type * from './base/ComponentVar';
export type * from './base/DerivedVar';
export type * from './base/ElementDescriptor';
export type * from './base/ExampleDoc';
export type * from './base/HookParamDoc';
export type * from './base/HookReturnDoc';
export type * from './base/PlaygroundConfig';
export type * from './base/PropDoc';
export type * from './base/ThemingTarget';
export type * from './base/UsageDoc';
export type * from './component/AstryxComponentDocInput';
export type * from './component/ComponentDoc';
export type * from './component/ComponentEntry';
export type * from './component/ComponentRef';
export type * from './component/GroupDoc';
export type * from './component/MultiComponentDoc';
export type * from './component/SingleComponentDoc';
export type * from './component/SubComponentDoc';
export type * from './component/TranslationDoc';
export type * from './hook/AstryxFunctionDocInput';
export type * from './hook/HookDoc';
export type * from './hook/HookTranslationDoc';
export type * from './reference/AstryxGenericDocInput';
export type * from './reference/ContentBlock';
export type * from './reference/ReferenceDoc';
export type * from './reference/ReferenceSection';
export type * from './reference/ReferenceTranslationDoc';
export type * from './reference/TokenPreviewType';
export type * from './template/AstryxBlockTemplate';
export type * from './template/AstryxBlockTemplateInput';
export type * from './template/AstryxPageTemplate';
export type * from './template/AstryxPageTemplateInput';
export type * from './template/AstryxTemplate';
export type * from './template/AstryxTemplateInput';
export type * from './template/AstryxTemplatePreview';
export type * from './template/BlockTemplateDoc';
export type * from './template/PageTemplateDoc';
export type * from './template/TemplateCategory';
export type * from './template/TemplateDoc';
