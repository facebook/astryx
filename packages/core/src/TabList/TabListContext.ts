// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file TabListContext.ts
 * @input React createContext, use
 * @output Exports TabListContext, useTabListContext, TabListMode
 * @position Context provider; consumed by Tab.tsx, TabMenu.tsx
 *
 * SYNC: When modified, update /packages/core/src/TabList/TabList.doc.mjs
 */

import {createContext, use} from 'react';

/**
 * Size variants for tab list items.
 * Uses hardcoded px values (sizeVars not available on this branch).
 */
export type TabListSize = 'sm' | 'md' | 'lg';

/**
 * Layout mode for tab sizing.
 * - `'hug'`: each tab hugs its content width.
 * - `'fill'`: tabs stretch equally to fill the container width.
 */
export type TabListLayout = 'hug' | 'fill';

/**
 * Role vocabulary the strip speaks.
 * - `'nav'`: a `<nav>` of links or buttons, current item marked with
 *   `aria-current`.
 * - `'tablist'`: the WAI-ARIA tabs pattern — `role="tablist"` / `role="tab"`,
 *   `aria-selected`, and `aria-controls` for the panel each tab owns.
 */
export type TabListMode = 'nav' | 'tablist';

/**
 * Context for communicating value/onChange/size/layout/mode from TabList to
 * children.
 */
export interface TabListContextValue {
  value: string;
  onChange: (value: string) => void;
  size: TabListSize;
  layout: TabListLayout;
  mode: TabListMode;
}

export const TabListContext = createContext<TabListContextValue | null>(null);
TabListContext.displayName = 'TabListContext';

/**
 * Returns TabListContext value or throws if used outside TabList.
 */
export function useTabListContext(): TabListContextValue {
  const ctx = use(TabListContext);
  if (ctx == null) {
    throw new Error(
      'useTabListContext must be used within TabList. ' +
        'Wrap your Tab/TabMenu in <TabList>.',
    );
  }
  return ctx;
}
