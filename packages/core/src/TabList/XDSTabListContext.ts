// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file XDSTabListContext.ts
 * @input React createContext, useContext
 * @output Exports XDSTabListContext, useXDSTabListContext
 * @position Context provider; consumed by XDSTab.tsx, XDSTabMenu.tsx
 *
 * SYNC: When modified, update /packages/core/src/TabList/TabList.doc.mjs
 */

import {createContext, useContext} from 'react';

/**
 * Size variants for tab list items.
 * Uses hardcoded px values (sizeVars not available on this branch).
 */
export type XDSTabListSize = 'sm' | 'md' | 'lg';

/**
 * Layout mode for tab sizing.
 * - `'hug'`: each tab hugs its content width.
 * - `'fill'`: tabs stretch equally to fill the container width.
 */
export type XDSTabListLayout = 'hug' | 'fill';

/**
 * Context for communicating value/onChange/size/layout from XDSTabList to children.
 */
export interface XDSTabListContextValue {
  value: string;
  onChange: (value: string) => void;
  size: XDSTabListSize;
  layout: XDSTabListLayout;
}

export const XDSTabListContext = createContext<XDSTabListContextValue | null>(
  null,
);

/**
 * Returns XDSTabListContext value or throws if used outside XDSTabList.
 */
export function useXDSTabListContext(): XDSTabListContextValue {
  const ctx = useContext(XDSTabListContext);
  if (ctx == null) {
    throw new Error(
      'useXDSTabListContext must be used within XDSTabList. ' +
        'Wrap your XDSTab/XDSTabMenu in <XDSTabList>.',
    );
  }
  return ctx;
}
