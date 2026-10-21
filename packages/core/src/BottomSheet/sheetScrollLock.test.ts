// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file sheetScrollLock.test.ts
 * @input Uses vitest and jsdom documents
 * @output Tests the one CSS rule that locks page scroll while a sheet dialog
 *   is modal, and its once-per-document installer
 * @position Core tests for sheetScrollLock.ts; the engines' reading of the
 *   rule is BottomSheetNativeModal.a11y.browser.spec.ts
 */

import {afterEach, describe, expect, it} from 'vitest';
import {
  SHEET_DIALOG_ATTRIBUTE,
  SHEET_SCROLL_LOCK_RULES_ID,
  SHEET_SCROLL_LOCK_SELECTOR,
  ensureSheetScrollLock,
  sheetScrollLockCss,
} from './sheetScrollLock';

afterEach(() => {
  document.getElementById(SHEET_SCROLL_LOCK_RULES_ID)?.remove();
});

describe('sheetScrollLock', () => {
  it('keys the lock off the native modal state of a sheet dialog, on the root', () => {
    expect(SHEET_DIALOG_ATTRIBUTE).toBe('data-sheet-dialog');
    expect(SHEET_SCROLL_LOCK_SELECTOR).toBe(
      ':root:has(dialog[data-sheet-dialog]:modal)',
    );
    expect(sheetScrollLockCss()).toBe(
      ':root:has(dialog[data-sheet-dialog]:modal){overflow:hidden;scrollbar-gutter:stable}',
    );
    // The rule is not a transition and must not be mistaken for one by the
    // stylesheet audit; it sets no duration.
    expect(sheetScrollLockCss()).not.toContain('transition');
  });

  it('installs one stylesheet per document, in the head, and leaves a second call alone', () => {
    expect(document.getElementById(SHEET_SCROLL_LOCK_RULES_ID)).toBeNull();

    ensureSheetScrollLock(document);
    const installed = document.getElementById(SHEET_SCROLL_LOCK_RULES_ID);
    expect(installed).toBeInstanceOf(HTMLStyleElement);
    expect(installed?.parentElement).toBe(document.head);
    expect(installed?.textContent).toBe(sheetScrollLockCss());

    ensureSheetScrollLock(document);
    expect(
      document.querySelectorAll(`#${SHEET_SCROLL_LOCK_RULES_ID}`),
    ).toHaveLength(1);
    expect(document.getElementById(SHEET_SCROLL_LOCK_RULES_ID)).toBe(installed);
  });

  it('gives another document (an iframe) its own copy', () => {
    const other = document.implementation.createHTMLDocument('frame');
    ensureSheetScrollLock(other);
    expect(other.getElementById(SHEET_SCROLL_LOCK_RULES_ID)).not.toBeNull();
    expect(document.getElementById(SHEET_SCROLL_LOCK_RULES_ID)).toBeNull();
  });
});
