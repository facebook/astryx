// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file XDSStaticPreviewContext.tsx
 * @input React context
 * @output Exports XDSStaticPreviewProvider and useXDSIsStaticPreview
 * @position Context for suppressing overlay layers in non-interactive previews
 *
 * SYNC: When modified, update:
 * - /packages/core/src/Layer/index.ts
 * - /packages/core/src/Layer/useXDSLayer.tsx
 *
 * Some surfaces render live components purely as static, non-interactive
 * previews (e.g. a thumbnail gallery). Overlay-based components — Popover,
 * HoverCard, MultiSelector, DateRangeInput, etc. — reveal their content via
 * the native Popover API (top layer) or a portal to `document.body`. Both
 * escape an ancestor's `overflow: hidden`, so an open overlay visually leaks
 * out of the preview frame.
 *
 * Wrapping a preview in <XDSStaticPreviewProvider> turns `useXDSLayer`'s
 * `show()` into a no-op, so overlays never open inside that subtree. Because
 * React context propagates through portals, this also covers portaled
 * overlays like HoverCard. Default is `false`, so normal usage is unaffected.
 */

import {createContext, use, type ReactNode} from 'react';

/**
 * True when the current subtree is a static, non-interactive preview where
 * overlay layers should not open. Defaults to `false`.
 */
export const XDSStaticPreviewContext = createContext<boolean>(false);
XDSStaticPreviewContext.displayName = 'XDSStaticPreviewContext';

/**
 * Hook to read whether the current subtree is a static preview.
 */
export function useXDSIsStaticPreview(): boolean {
  return use(XDSStaticPreviewContext);
}

export interface XDSStaticPreviewProviderProps {
  children: ReactNode;
}

/**
 * Marks its subtree as a static, non-interactive preview. Overlay components
 * inside will not open their layers, keeping content contained within the
 * preview frame.
 */
export function XDSStaticPreviewProvider({
  children,
}: XDSStaticPreviewProviderProps) {
  return (
    <XDSStaticPreviewContext value={true}>{children}</XDSStaticPreviewContext>
  );
}

XDSStaticPreviewProvider.displayName = 'XDSStaticPreviewProvider';
