// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file ButtonGroupContext.ts
 * @input Layer-scoped React context
 * @output Exports ButtonGroup context and useButtonGroup hook
 * @position Shared context; consumed by Button for group-aware styling and
 *   the group's press tracking
 */

import {use} from 'react';
import {createLayerScopedContext as createContext} from '../Layer/layerScopedContext';

export type ButtonGroupOrientation = 'horizontal' | 'vertical';

export interface ButtonGroupContextValue {
  orientation: ButtonGroupOrientation;
  isDisabled: boolean;
}

/** The context's value with what only core reads; not exported from the package. */
interface ButtonGroupInternalValue extends ButtonGroupContextValue {
  /**
   * Whether the group tracks a held pointer across its buttons
   * (`family:action-groups`): each button it tracks carries the group item
   * marker (`utils/pressFeedback.ts` PRESS_GROUP_ITEM_ATTRIBUTE).
   */
  tracksPress: boolean;
}

export const ButtonGroupContext =
  createContext<ButtonGroupInternalValue | null>(null);
ButtonGroupContext.displayName = 'ButtonGroupContext';

/**
 * Hook for Button to detect when it's inside a ButtonGroup.
 * Returns null when used outside a group.
 */
export function useButtonGroup(): ButtonGroupContextValue | null {
  return use(ButtonGroupContext);
}

/**
 * Whether the nearest ButtonGroup tracks a held pointer across its buttons.
 * Internal to core (Button reads it); not exported from the package.
 */
export function useButtonGroupTracksPress(): boolean {
  return use(ButtonGroupContext)?.tracksPress === true;
}
