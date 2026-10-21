// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file sheetScrollLock.ts
 * @input A document a sheet dialog is about to be presented in
 * @output The attribute every sheet dialog carries, the one CSS rule that
 *   locks page scroll while a sheet dialog is modal, and its installer
 * @position BottomSheet host plumbing; the page-scroll lock of every sheet
 *   (standalone or switcher-managed), replacing a JavaScript body pin
 *
 * `showModal()` makes the page inert but does not stop it scrolling: a wheel
 * or a finger over the backdrop still moves the document. The lock is
 * therefore one stylesheet rule keyed off the browser's own modal state --
 * `:has(dialog:modal)` on the root -- so it engages the instant a sheet
 * dialog enters the top layer and releases the instant the last one leaves,
 * through a handoff (two open sheet dialogs) and under any other modal layer
 * opened on top (the sheet beneath is still `:modal`). No counter, no saved
 * scroll position, no inline styles on `<body>`.
 *
 * The rule is scoped to sheet dialogs by attribute so other components keep
 * their own scroll handling. `overflow: hidden` on the root freezes the
 * viewport scroller at its current offset; `scrollbar-gutter: stable` keeps a
 * classic scrollbar's gutter open while the scrollbar is gone, so a desktop
 * page does not shift sideways when a sheet opens. The sheet's own scroll
 * area carries `overscroll-behavior: contain`, so a scroll that reaches its
 * end does not chain to the (now unscrollable) page.
 *
 * StyleX styles the element that carries its class, never the root, so the
 * rule ships the way Layer ships its `@position-try` rules: one static
 * stylesheet installed in the document head once, from a layout effect,
 * before the dialog is presented. The rule is inert until a matching dialog
 * is modal, so installing it early costs nothing.
 *
 * SYNC: When modified, update:
 * - /packages/core/src/BottomSheet/BottomSheet.tsx
 * - /packages/core/src/BottomSheet/sheetScrollLock.test.ts
 */

/** The attribute every BottomSheet-owned native dialog carries. */
export const SHEET_DIALOG_ATTRIBUTE = 'data-sheet-dialog';

/** The id of the one `<style>` element the lock installs per document. */
export const SHEET_SCROLL_LOCK_RULES_ID = 'astryx-bottom-sheet-scroll-lock';

/**
 * The selector that is true exactly while a sheet dialog is modal. Exported
 * so a test can assert the lock's precondition from the DOM alone.
 */
export const SHEET_SCROLL_LOCK_SELECTOR = `:root:has(dialog[${SHEET_DIALOG_ATTRIBUTE}]:modal)`;

/** The lock, as CSS text. */
export function sheetScrollLockCss(): string {
  return `${SHEET_SCROLL_LOCK_SELECTOR}{overflow:hidden;scrollbar-gutter:stable}`;
}

/**
 * Install the scroll-lock rule in a document once. Idempotent; a second sheet,
 * or a sheet in another document (an iframe), finds or adds its own sheet.
 */
export function ensureSheetScrollLock(doc: Document): void {
  if (doc.getElementById(SHEET_SCROLL_LOCK_RULES_ID) != null) {
    return;
  }
  const style = doc.createElement('style');
  style.id = SHEET_SCROLL_LOCK_RULES_ID;
  style.textContent = sheetScrollLockCss();
  doc.head.appendChild(style);
}
