// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file index.ts
 * @input Imports from XDSBlockquote.tsx
 * @output Exports XDSBlockquote component and props type
 * @position Package entry point for Blockquote
 *
 * SYNC: When modified, update /packages/core/src/Blockquote/Blockquote.doc.mjs
 */

export {XDSBlockquote} from './XDSBlockquote';
export type {XDSBlockquoteProps} from './XDSBlockquote';


// <compat-aliases:start> — generated, do not edit by hand
// Unprefixed compatibility aliases (XDS-prefix migration P2380608025).
// Prefixed names above remain canonical + module-augmentation targets.
// These bare re-exports reference the SAME values/types.
// Regenerate: node scripts/generate-compat-aliases.mjs
export {
  XDSBlockquote as Blockquote,
} from '.';
export type {
  XDSBlockquoteProps as BlockquoteProps,
} from '.';
// <compat-aliases:end>
