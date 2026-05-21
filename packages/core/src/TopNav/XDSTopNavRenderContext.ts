// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file XDSTopNavRenderContext.ts
 * @input React createContext, use
 * @output Exports XDSTopNavRenderContext and useXDSTopNavRenderMode hook
 * @position Internal context for controlling TopNav rendering mode
 *
 * When AppShell renders TopNav in multiple locations (top bar, mobile drawer),
 * this context tells TopNav and its children which parts to render:
 * - 'default': full top bar (desktop)
 * - 'mobile-bar': heading + endContent + toggle, hide nav items (mobile top bar)
 * - 'drawer': nav items as vertical list elements (mobile drawer)
 */

import {createContext, use} from 'react';

export type XDSTopNavRenderMode = 'default' | 'mobile-bar' | 'drawer';

export const XDSTopNavRenderContext =
  createContext<XDSTopNavRenderMode>('default');
XDSTopNavRenderContext.displayName = 'XDSTopNavRenderContext';

/**
 * Read the current TopNav render mode from context.
 */
export function useXDSTopNavRenderMode(): XDSTopNavRenderMode {
  return use(XDSTopNavRenderContext);
}
