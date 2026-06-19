// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file index.ts
 * @input Imports Outline, outline hooks, parser utility, and types
 * @output Exports Outline component, OutlineItem type, and outline helpers
 * @position Component entry point for Outline
 *
 * SYNC: When modified, update /packages/core/src/Outline/Outline.doc.mjs
 */

export {Outline} from './Outline';
export type {OutlineProps} from './Outline';
export type {OutlineItem} from './types';
export {parseOutlineFromMarkdown} from './parseOutlineFromMarkdown';
export {useOutlineFromMarkdown} from './useOutlineFromMarkdown';
export {useOutlineFromDOM} from './useOutlineFromDOM';


// <compat-aliases:start> — generated, do not edit by hand
// Legacy XDS-prefixed compatibility aliases (XDS-prefix migration P2380608025).
// Bare names above are canonical + module-augmentation targets.
// These prefixed re-exports reference the SAME values/types and remain
// augmentable (consumer `declare module` augmentations of XDS* flow through).
// Regenerate: node scripts/generate-compat-aliases.mjs
export {
  Outline as XDSOutline,
  useOutlineFromDOM as useXDSOutlineFromDOM,
  useOutlineFromMarkdown as useXDSOutlineFromMarkdown,
} from '.';
export type {
  OutlineItem as XDSOutlineItem,
  OutlineProps as XDSOutlineProps,
} from '.';
// <compat-aliases:end>
