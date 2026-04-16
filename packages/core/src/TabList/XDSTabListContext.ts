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
 * @deprecated Use `XDSTabListDensity` instead. Kept for backward compatibility.
 */
export type XDSTabListSize = 'sm' | 'md' | 'lg';

/**
 * Density variants for tab list spacing.
 * Controls the vertical breathing room of the tab strip:
 * - `'compact'`: Tight spacing for dense UIs. Uses sm button hover target + 4px block padding.
 * - `'balanced'`: Standard spacing. Uses md button hover target + 4px block padding.
 * - `'spacious'`: Extra spacing for readability. Uses lg button hover target + 4px block padding.
 */
export type XDSTabListDensity = 'compact' | 'balanced' | 'spacious';

/**
 * Layout mode for tab sizing.
 * - `'hug'`: each tab hugs its content width.
 * - `'fill'`: tabs stretch equally to fill the container width.
 */
export type XDSTabListLayout = 'hug' | 'fill';

/**
 * Maps density values to their corresponding button size for hover targets.
 */
export const DENSITY_TO_SIZE: Record<XDSTabListDensity, XDSTabListSize> = {
  compact: 'sm',
  balanced: 'md',
  spacious: 'lg',
};

/**
 * Context for communicating value/onChange/density/layout from XDSTabList to children.
 */
export interface XDSTabListContextValue {
  value: string;
  onChange: (value: string) => void;
  /** @deprecated Use `density` instead */
  size: XDSTabListSize;
  density: XDSTabListDensity;
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
