// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file DropdownMenuRadioGroupContext.ts
 * @output Context for coordinating single-selection across radio menu items.
 * @position Internal to @astryxdesign/lab; used by DropdownMenuRadioGroup + Item.
 */

import {createContext, use} from 'react';

export interface DropdownMenuRadioGroupContextValue {
  /** The currently selected value in the group. */
  value: string | undefined;
  /** Select a value. Called by a DropdownMenuRadioItem on activation. */
  onChange: (value: string) => void;
  /** Whether selecting an item should close the menu. @default true */
  closeOnSelect: boolean;
}

export const DropdownMenuRadioGroupContext =
  createContext<DropdownMenuRadioGroupContextValue | null>(null);
DropdownMenuRadioGroupContext.displayName = 'DropdownMenuRadioGroupContext';

/**
 * Read the enclosing radio group's selection state.
 * Returns null when used outside a DropdownMenuRadioGroup.
 */
export function useDropdownMenuRadioGroupContext(): DropdownMenuRadioGroupContextValue | null {
  return use(DropdownMenuRadioGroupContext);
}
