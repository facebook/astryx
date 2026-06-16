// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file index.ts
 * @input Imports from XDSGrid.tsx and XDSGridSpan.tsx
 * @output Exports Grid components and types
 * @position Package entry point for Grid
 *
 * SYNC: When modified, update /packages/core/src/Grid/Grid.doc.mjs
 */

export {XDSGrid} from './XDSGrid';
export type {XDSGridProps, XDSGridColumns, GridAlignment} from './XDSGrid';

export {XDSGridSpan} from './XDSGridSpan';
export type {XDSGridSpanProps} from './XDSGridSpan';


// <compat-aliases:start> — generated, do not edit by hand
// Unprefixed compatibility aliases (XDS-prefix migration P2380608025).
// Prefixed names above remain canonical + module-augmentation targets.
// These bare re-exports reference the SAME values/types.
// Regenerate: node scripts/generate-compat-aliases.mjs
export {
  XDSGrid as Grid,
  XDSGridSpan as GridSpan,
} from '.';
export type {
  XDSGridColumns as GridColumns,
  XDSGridProps as GridProps,
  XDSGridSpanProps as GridSpanProps,
} from '.';
// <compat-aliases:end>
