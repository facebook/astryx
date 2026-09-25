// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file index.ts
 * @output Public Markdown plugin protocol, factory, and types
 * @position Subpath entry point: `@astryxdesign/core/Markdown/plugins`
 */

export {
  composeMarkdownTransforms,
  createMarkdownPlugin,
  isMarkdownExtensionNode,
} from './protocol';
export {createMarkdownTextTransform} from './textTransform';
export type {
  MarkdownTextTransformContext,
  MarkdownTextTransformOptions,
} from './textTransform';
export {createMarkdownFenceTransform} from './semanticFence';
export type {
  MarkdownFenceContext,
  MarkdownFenceNode,
  MarkdownFenceTransformOptions,
} from './semanticFence';
export {
  createMarkdownSourceDecoration,
  getMarkdownSourceDecorations,
} from './sourceDecoration';
export type {
  MarkdownSourceDecoration,
  MarkdownSourceDecorationOptions,
  MarkdownSourceDecorationRange,
} from './sourceDecoration';
export {createMarkdownFrontmatter} from './frontmatter';
export {markdownSoftBreaksPlugin} from './softBreaks';
export {markdownCalloutsPlugin} from './callouts';
export type {MarkdownCalloutNode, MarkdownCalloutStatus} from './callouts';
export {markdownEntityReferencesPlugin} from './entityReferences';
export type {
  MarkdownEntityReference,
  MarkdownEntityReferenceMatcher,
  MarkdownEntityReferenceNode,
  MarkdownEntityReferencesOptions,
} from './entityReferences';
export type {
  MarkdownFrontmatter,
  MarkdownFrontmatterOptions,
  MarkdownFrontmatterParseResult,
} from './frontmatter';
export type {
  MarkdownPluginData,
  MarkdownExtensionNode,
  MarkdownInlineContainerExtensionNode,
  MarkdownBlockContainerExtensionNode,
  MarkdownAnyExtensionNode,
  MarkdownPhrasingContentName,
  MarkdownFlowContentName,
  MarkdownExtensionContentAllowlist,
  MarkdownExtensionContent,
  MarkdownTokenizerInput,
  MarkdownExtensionChildrenRange,
  MarkdownTokenizeResult,
  MarkdownSyntaxContribution,
  MarkdownSyntaxCapability,
  MarkdownTransformContext,
  MarkdownTransform,
  MarkdownExtensionRendererProps,
  MarkdownExtensionRenderer,
  MarkdownExtensionRenderers,
  MarkdownSyntaxPluginDefinition,
  MarkdownTransformPluginDefinition,
  MarkdownPluginDefinition,
  MarkdownPluginEntry,
  MarkdownNodeOf,
  MarkdownExtensionsOf,
} from './protocol';
