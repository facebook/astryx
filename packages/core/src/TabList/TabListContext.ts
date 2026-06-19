// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file TabListContext.ts
 * @input React createContext, use
 * @output Exports TabListContext, useTabListContext
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
 * Context for communicating value/onChange/size/layout from TabList to children.
 */
export interface TabListContextValue {
  value: string;
  onChange: (value: string) => void;
  size: TabListSize;
  layout: TabListLayout;
}

export const TabListContext = createContext<TabListContextValue | null>(
  null,
);
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
