// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file menuItemHover.ts
 * @output Exports focusMenuItemOnHover
 * @position Shared helper for DropdownMenu/ContextMenu item components
 *
 * Menus keep a single highlighted item by using DOM focus as the sole
 * highlight source. Mouse hover moves focus onto the pointed-at item so the
 * one focus highlight follows the pointer — instead of a separate `:hover`
 * background leaving the keyboard-focused item highlighted at the same time.
 *
 * SYNC: When modified, update the item components that use it:
 * - /packages/core/src/DropdownMenu/DropdownMenuItem.tsx
 * - /packages/core/src/DropdownMenu/DropdownMenuCheckboxItem.tsx
 * - /packages/core/src/DropdownMenu/DropdownMenuRadioItem.tsx
 */

import type {PointerEvent} from 'react';

/**
 * Move focus to a menu item as the pointer moves over it, so hover and
 * keyboard navigation share a single focus-driven highlight. Only reacts to a
 * real mouse (not touch/pen, which have no hover), and skips disabled items.
 */
export function focusMenuItemOnHover(
  e: PointerEvent<HTMLElement>,
  isDisabled?: boolean,
): void {
  if (isDisabled || e.pointerType !== 'mouse') {
    return;
  }
  const el = e.currentTarget;
  if (el !== el.ownerDocument.activeElement) {
    el.focus();
  }
}
