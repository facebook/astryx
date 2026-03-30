'use client';

/**
 * @file XDSListContext.tsx
 * @input Uses React createContext
 * @output Exports XDSListContext for sharing density between XDSList and XDSListItem
 * @position Internal context; consumed by XDSList.tsx and XDSListItem.tsx
 */

import {createContext} from 'react';

export type XDSListDensity = 'compact' | 'balanced' | 'spacious';
export type XDSListMarkerStyle = 'none' | 'disc' | 'decimal' | 'circle';

export interface XDSListContextValue {
  density: XDSListDensity;
  hasDividers: boolean;
  listStyle: XDSListMarkerStyle;
}

export const XDSListContext = createContext<XDSListContextValue | null>(null);
