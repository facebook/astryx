/**
 * @file TableContext.ts
 * @input React
 * @output Exports TableContext and TableContextValue
 * @position Context layer; connects XDSTable styling to sub-components (XDSBaseTableRow, XDSBaseTableCell)
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/Table/XDSTable.tsx (provider)
 * - /packages/core/src/Table/XDSBaseTableRow.tsx (consumer)
 * - /packages/core/src/Table/XDSBaseTableCell.tsx (consumer)
 * - /packages/core/src/Table/index.ts (exports if types change)
 */

import {createContext} from 'react';

export interface TableContextValue {
  density: 'compact' | 'balanced' | 'spacious';
  dividers: 'rows' | 'columns' | 'grid' | 'none';
  striped: boolean;
  hover: boolean;
}

export const TableContext = createContext<TableContextValue | null>(null);
