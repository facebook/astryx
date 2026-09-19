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
  /**
   * Collection-mode change handler. `toggledValue` is the value of the item
   * the user just toggled, so the list can show a loading spinner on that
   * specific item while a `changeAction` promise is pending — no diffing
   * of the value array required.
   */
  onChange?: (values: string[], toggledValue?: string) => void;
  isDisabled: boolean;
  /**
   * True when the whole group is disabled *and* a `disabledMessage` is set. In
   * that mode items stay focusable via `aria-disabled` (instead of the native
   * `disabled` attribute) so the group's disabled-reason tooltip is keyboard-
   * and AT-discoverable; toggling is still blocked.
   */
  hasDisabledMessage?: boolean;
  isReadOnly: boolean;
  /**
   * The value of the item with a pending `changeAction`, or null when idle.
   * The matching item renders an in-checkbox spinner and blocks re-toggling.
   */
  loadingValue?: string | null;
}

export const CheckboxListContext =
  createContext<CheckboxListContextValue | null>(null);
CheckboxListContext.displayName = 'CheckboxListContext';
