/**
 * @file XDSTableContext.ts
 * @input React
 * @output Exports XDSTableContext and XDSTableContextValue
 * @position Context layer; connects XDSTable styling to sub-components (XDSTableRow, XDSTableCell)
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/Table/XDSTable.tsx (provider)
 * - /packages/core/src/Table/XDSTableRow.tsx (consumer)
 * - /packages/core/src/Table/XDSTableCell.tsx (consumer)
 * - /packages/core/src/Table/index.ts (exports if types change)
 */

'use client';

import {createContext} from 'react';

export interface XDSTableContextValue {
  density: 'compact' | 'balanced' | 'spacious';
  dividers: 'rows' | 'columns' | 'grid' | 'none';
  isStriped: boolean;
  hasHover: boolean;
}

export const XDSTableContext = createContext<XDSTableContextValue | null>(null);
