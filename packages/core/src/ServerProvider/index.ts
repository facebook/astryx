'use client';

/**
 * @file index.ts
 * @input Imports from XDSServerProvider, XDSServerContext, useServerViewport
 * @output Exports XDSServerProvider, types, and hooks
 * @position Component entry point; re-exported by /packages/core/src/index.ts
 */

export {XDSServerProvider} from './XDSServerProvider';
export type {XDSServerProviderProps} from './XDSServerProvider';
export type {
  XDSViewportHint,
  XDSServerContextValue,
} from './XDSServerContext';
export {useServerViewport} from './useServerViewport';
