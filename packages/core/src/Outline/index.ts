// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file index.ts
 * @input Imports XDSOutline, outline hooks, parser utility, and types
 * @output Exports XDSOutline component, OutlineItem type, and outline helpers
 * @position Component entry point for Outline
 *
 * SYNC: When modified, update /packages/core/src/Outline/Outline.doc.mjs
 */

export {XDSOutline} from './XDSOutline';
export type {XDSOutlineProps} from './XDSOutline';
export type {OutlineItem} from './types';
export {parseOutlineFromMarkdown} from './parseOutlineFromMarkdown';
export {useOutlineFromMarkdown} from './useOutlineFromMarkdown';
export {useOutlineFromDOM} from './useOutlineFromDOM';


// <compat-aliases:start> — generated, do not edit by hand
// Unprefixed compatibility aliases (XDS-prefix migration P2380608025).
// Prefixed names above remain canonical + module-augmentation targets.
// These bare re-exports reference the SAME values/types.
// Regenerate: node scripts/generate-compat-aliases.mjs
export {
  XDSOutline as Outline,
} from '.';
export type {
  XDSOutlineProps as OutlineProps,
} from '.';
// <compat-aliases:end>
