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
  UseXDSResizableSingleConfig,
  UseXDSResizableMultiConfig,
} from './useXDSResizable';

export {XDSResizeHandle} from './XDSResizeHandle';
export type {XDSResizeHandleProps} from './XDSResizeHandle';
