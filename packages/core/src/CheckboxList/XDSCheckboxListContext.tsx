// Copyright (c) Meta Platforms, Inc. and affiliates.

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
  /**
   * Collection-mode change handler. `toggledValue` is the value of the item
   * the user just toggled, so the list can show a loading spinner on that
   * specific item while a `changeAction` promise is pending — no diffing
   * of the value array required.
   */
  onChange?: (values: string[], toggledValue?: string) => void;
  isDisabled: boolean;
  isReadOnly: boolean;
  /**
   * The value of the item with a pending `changeAction`, or null when idle.
   * The matching item renders an in-checkbox spinner and blocks re-toggling.
   */
  loadingValue?: string | null;
}

export const XDSCheckboxListContext =
  createContext<XDSCheckboxListContextValue | null>(null);
XDSCheckboxListContext.displayName = 'XDSCheckboxListContext';
