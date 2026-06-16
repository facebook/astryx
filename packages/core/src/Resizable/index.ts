// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file index.ts
 * @input Imports from useXDSResizable and XDSResizeHandle
 * @output Re-exports all public Resizable API
 * @position Package entry point for Resizable
 */

export {useXDSResizable} from './useXDSResizable';
export type {
  ResizableRegion,
  ResizableRegionConfig,
  ResizableProps,
  XDSResizableConfig,
  UseXDSResizableSingleConfig,
  UseXDSResizableMultiConfig,
} from './useXDSResizable';

export {XDSResizeHandle} from './XDSResizeHandle';
export type {XDSResizeHandleProps} from './XDSResizeHandle';


// <compat-aliases:start> — generated, do not edit by hand
// Unprefixed compatibility aliases (XDS-prefix migration P2380608025).
// Prefixed names above remain canonical + module-augmentation targets.
// These bare re-exports reference the SAME values/types.
// Regenerate: node scripts/generate-compat-aliases.mjs
export {
  XDSResizeHandle as ResizeHandle,
  useXDSResizable as useResizable,
} from '.';
export type {
  XDSResizableConfig as ResizableConfig,
  XDSResizeHandleProps as ResizeHandleProps,
} from '.';
// <compat-aliases:end>
