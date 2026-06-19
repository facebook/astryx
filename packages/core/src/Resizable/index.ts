// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file index.ts
 * @input Imports from useResizable and ResizeHandle
 * @output Re-exports all public Resizable API
 * @position Package entry point for Resizable
 */

export {useResizable} from './useResizable';
export type {
  ResizableRegion,
  ResizableRegionConfig,
  ResizableProps,
  ResizableConfig,
  UseXDSResizableSingleConfig,
  UseXDSResizableMultiConfig,
} from './useResizable';

export {ResizeHandle} from './ResizeHandle';
export type {ResizeHandleProps} from './ResizeHandle';


// <compat-aliases:start> — generated, do not edit by hand
// Legacy XDS-prefixed compatibility aliases (XDS-prefix migration P2380608025).
// Bare names above are canonical + module-augmentation targets.
// These prefixed re-exports reference the SAME values/types and remain
// augmentable (consumer `declare module` augmentations of XDS* flow through).
// Regenerate: node scripts/generate-compat-aliases.mjs
export {
  ResizeHandle as XDSResizeHandle,
  useResizable as useXDSResizable,
} from '.';
export type {
  ResizableConfig as XDSResizableConfig,
  ResizableProps as XDSResizableProps,
  ResizableRegion as XDSResizableRegion,
  ResizableRegionConfig as XDSResizableRegionConfig,
  ResizeHandleProps as XDSResizeHandleProps,
  UseXDSResizableMultiConfig as XDSUseXDSResizableMultiConfig,
  UseXDSResizableSingleConfig as XDSUseXDSResizableSingleConfig,
} from '.';
// <compat-aliases:end>
