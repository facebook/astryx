// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file index.ts
 * @input Imports from Grid.tsx and GridSpan.tsx
 * @output Exports Grid components and types
 * @position Package entry point for Grid
 *
 * SYNC: When modified, update /packages/core/src/Grid/Grid.doc.mjs
 */

export {Grid} from './Grid';
export type {GridProps, GridColumns, GridAlignment} from './Grid';

export {GridSpan} from './GridSpan';
export type {GridSpanProps} from './GridSpan';


// <compat-aliases:start> — generated, do not edit by hand
// Legacy XDS-prefixed compatibility aliases (XDS-prefix migration P2380608025).
// Bare names above are canonical + module-augmentation targets.
// These prefixed re-exports reference the SAME values/types and remain
// augmentable (consumer `declare module` augmentations of XDS* flow through).
// Regenerate: node scripts/generate-compat-aliases.mjs
export {
  Grid as XDSGrid,
  GridSpan as XDSGridSpan,
} from '.';
export type {
  GridAlignment as XDSGridAlignment,
  GridColumns as XDSGridColumns,
  GridProps as XDSGridProps,
  GridSpanProps as XDSGridSpanProps,
} from '.';
// <compat-aliases:end>
