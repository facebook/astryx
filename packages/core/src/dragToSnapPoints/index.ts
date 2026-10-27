// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file index.ts
 * @input dragToSnapPoints/createDragToSnapPoints.ts
 * @output The public snap-point drag (spec:AST-107 FR2, FR6):
 *   `createDragToSnapPoints` and its types
 * @position Public entry point, re-exported from the package root
 */

export {
  createDragToSnapPoints,
  type DragToSnapPoints,
  type DragToSnapPointsOptions,
} from './createDragToSnapPoints';
