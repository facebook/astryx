'use client';

/**
 * @file XDSCheckboxListContext.tsx
 * @input Uses React createContext
 * @output Exports XDSCheckboxListContext for parent-child communication
 * @position Internal context; consumed by XDSCheckboxList.tsx and XDSCheckboxListItem.tsx
 */

import {createContext} from 'react';

export interface XDSCheckboxListContextValue {
  value?: string[];
  onChange?: (values: string[]) => void;
  isDisabled: boolean;
  isBusy: boolean;
}

export const XDSCheckboxListContext =
  createContext<XDSCheckboxListContextValue | null>(null);
