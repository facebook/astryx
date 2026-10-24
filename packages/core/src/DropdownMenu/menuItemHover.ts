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
 * That focus is the mouse's, never the keyboard's: it never matches
 * `:focus-visible` (`architecture:interaction-modality` INV1).
 *
 * SYNC: When modified, update the item components that use it:
 * - /packages/core/src/DropdownMenu/DropdownMenuItem.tsx
 * - /packages/core/src/DropdownMenu/DropdownMenuCheckboxItem.tsx
 * - /packages/core/src/DropdownMenu/DropdownMenuRadioItem.tsx
 * - /packages/core/src/DropdownMenu/DropdownMenuSubMenu.tsx
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
    // preventScroll: focusing an off-screen item scrolls it under the
    // stationary pointer, whose next pointerenter focuses it again — a
    // runaway auto-scroll loop. Keyboard navigation scrolls via its own
    // highlight handling; hover must never scroll.
    // focusVisible false: a plain focus() inherits :focus-visible from the
    // element focused before it (the menu after a pointer open, the row a key
    // reached), so every keyboard-only focus style would paint on the row
    // under the mouse. A key pressed afterwards moves focus with it again.
    el.focus({preventScroll: true, focusVisible: false});
  }
}
