// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file index.ts
 * @input Imports from RefreshControl and useRefreshControl
 * @output Exports RefreshControl, useRefreshControl and their types
 * @position Entry point for RefreshControl; re-exported by
 *   /packages/lab/src/index.ts
 */

export {RefreshControl} from './RefreshControl';
export type {RefreshControlProps} from './RefreshControl';
export {useRefreshControl} from './useRefreshControl';
export type {
  UseRefreshControlOptions,
  UseRefreshControlResult,
} from './useRefreshControl';
