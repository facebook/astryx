/**
 * @file XDSListContext.tsx
 * @input Uses React createContext
 * @output Exports XDSListContext for sharing density between XDSList and XDSListItem
 * @position Internal context; consumed by XDSList.tsx and XDSListItem.tsx
 */

'use client';

import {createContext} from 'react';

export type XDSListDensity = 'compact' | 'balanced' | 'spacious';

export interface XDSListContextValue {
  density: XDSListDensity;
  hasDividers: boolean;
  hasMarkers: boolean;
}

export const XDSListContext = createContext<XDSListContextValue | null>(null);
