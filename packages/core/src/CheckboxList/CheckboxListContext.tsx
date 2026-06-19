// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file CheckboxListContext.tsx
 * @input Uses React createContext
 * @output Exports CheckboxListContext for parent-child communication
 * @position Internal context; consumed by CheckboxList.tsx and CheckboxListItem.tsx
 */

import {createContext} from 'react';

export interface CheckboxListContextValue {
  value?: string[];
  onChange?: (values: string[]) => void;
  isDisabled: boolean;
  isReadOnly: boolean;
  isBusy: boolean;
}

export const CheckboxListContext =
  createContext<CheckboxListContextValue | null>(null);
CheckboxListContext.displayName = 'CheckboxListContext';
