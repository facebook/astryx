'use client';

/**
 * @file index.ts
 * @input Imports from useResizable and XDSResizeHandle
 * @output Re-exports all public Resizable API
 * @position Package entry point for Resizable
 */

export {useResizable} from './useResizable';
export type {
  ResizableRegion,
  ResizableRegionConfig,
  ResizableProps,
  UseResizableSingleConfig,
  UseResizableMultiConfig,
} from './useResizable';

export {XDSResizeHandle} from './XDSResizeHandle';
export type {XDSResizeHandleProps} from './XDSResizeHandle';
