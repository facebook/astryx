// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file sheetScrollLock.test.ts
 * @input Uses vitest and jsdom documents
 * @output Tests the CSS rules that lock page scroll while a sheet dialog is
 *   modal, their once-per-document installer, the per-present measurements
 *   (which element owns the viewport scroll; whether a classic scrollbar
 *   takes space), and the shared padding fallback for engines without
 *   `scrollbar-gutter`: joined by every presented modal sheet dialog, kept
 *   through a replay, released by the last member
 * @position Core tests for sheetScrollLock.ts; the engines' reading of the
 *   rules is __tests__/BottomSheetScrollLock.a11y.browser.spec.ts
 */

import {afterEach, describe, expect, it, vi} from 'vitest';
import {
  SHEET_DIALOG_ATTRIBUTE,
  SHEET_HOLDS_GUTTER_ATTRIBUTE,
  SHEET_LOCKS_BODY_ATTRIBUTE,
  SHEET_SCROLLBAR_GUTTER_SELECTOR,
  SHEET_SCROLL_LOCK_RULES_ID,
  SHEET_SCROLL_LOCK_SELECTOR,
  ensureSheetScrollLock,
  acquireSheetScrollLock,
  prepareSheetScrollLock,
  sheetScrollLockCss,
} from './sheetScrollLock';

afterEach(() => {
  document.getElementById(SHEET_SCROLL_LOCK_RULES_ID)?.remove();
  document.body.style.cssText = '';
  document.documentElement.style.cssText = '';
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

/** A document whose viewport is `innerWidth` wide with `clientWidth` of layout. */
function stubViewport(innerWidth: number, clientWidth: number): void {
  vi.spyOn(window, 'innerWidth', 'get').mockReturnValue(innerWidth);
  vi.spyOn(document.documentElement, 'clientWidth', 'get').mockReturnValue(
    clientWidth,
  );
}

/**
 * Stand in for `CSS.supports('scrollbar-gutter: stable')`. jsdom has no `CSS`
 * object, in which case the lock assumes support and never pads.
 */
function stubScrollbarGutterSupport(supported: boolean): void {
  vi.stubGlobal('CSS', {
    supports: (query: string) =>
      query.startsWith('scrollbar-gutter') ? supported : true,
  });
}

describe('sheetScrollLock', () => {
  it('keys the lock off the native modal state of a sheet dialog, freezing the root or the body, and the gutter off a marked dialog', () => {
    expect(SHEET_DIALOG_ATTRIBUTE).toBe('data-sheet-dialog');
    expect(SHEET_HOLDS_GUTTER_ATTRIBUTE).toBe('data-sheet-holds-gutter');
    expect(SHEET_LOCKS_BODY_ATTRIBUTE).toBe('data-sheet-locks-body');
    expect(SHEET_SCROLL_LOCK_SELECTOR).toBe(
      ':root:has(dialog[data-sheet-dialog]:modal)',
    );
    expect(SHEET_SCROLLBAR_GUTTER_SELECTOR).toBe(
      ':root:has(dialog[data-sheet-dialog][data-sheet-holds-gutter]:modal)',
    );
    expect(sheetScrollLockCss()).toBe(
      ':root:has(dialog[data-sheet-dialog]:modal:not([data-sheet-locks-body])){overflow:hidden}' +
        ':root:has(dialog[data-sheet-dialog]:modal[data-sheet-locks-body]) body{overflow:hidden}' +
        ':root:has(dialog[data-sheet-dialog][data-sheet-holds-gutter]:modal){scrollbar-gutter:stable}',
    );
    // The gutter is never reserved by the bare lock: an unmarked modal sheet
    // dialog locks scroll without opening an undimmed strip on a page that
    // had no scrollbar. The gutter rule is on the root alone: it reaches the
    // viewport whichever element's overflow the viewport uses.
    expect(sheetScrollLockCss()).not.toMatch(
      /\[data-sheet-dialog\]:modal(:not\(\[data-sheet-locks-body\]\))?\)\s*\{[^}]*scrollbar-gutter/,
    );
    expect(sheetScrollLockCss()).not.toMatch(/body\{scrollbar-gutter/);
    // The rules are not transitions and must not be mistaken for one by the
    // stylesheet audit; they set no duration.
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

  it('marks the dialog to hold the gutter only while a classic scrollbar takes layout space', () => {
    const dialog = document.createElement('dialog');
    document.body.appendChild(dialog);

    // A 15px classic scrollbar: the window is wider than the layout viewport.
    stubViewport(1280, 1265);
    prepareSheetScrollLock(dialog);
    expect(dialog).toHaveAttribute(SHEET_HOLDS_GUTTER_ATTRIBUTE, '');
    expect(document.getElementById(SHEET_SCROLL_LOCK_RULES_ID)).not.toBeNull();

    // Overlay scrollbars, or a page that does not scroll: no gutter to hold.
    // Measured again on this present, so the stale mark comes off.
    stubViewport(1280, 1280);
    prepareSheetScrollLock(dialog);
    expect(dialog).not.toHaveAttribute(SHEET_HOLDS_GUTTER_ATTRIBUTE);

    // No layout to measure (a non-visual environment): never a gutter.
    stubViewport(1280, 0);
    prepareSheetScrollLock(dialog);
    expect(dialog).not.toHaveAttribute(SHEET_HOLDS_GUTTER_ATTRIBUTE);

    dialog.remove();
  });

  it('marks the dialog to freeze <body> when <body> owns the viewport scroll, and the root otherwise', () => {
    const dialog = document.createElement('dialog');
    document.body.appendChild(dialog);

    // The default page: both visible, the root is the scroller.
    prepareSheetScrollLock(dialog);
    expect(dialog).not.toHaveAttribute(SHEET_LOCKS_BODY_ATTRIBUTE);

    // `html, body { height: 100% } body { overflow-x: hidden }`: the root's
    // overflow is visible, so the browser scrolls the viewport through
    // <body>'s values. Freezing the root would stop that propagation and
    // clamp the page; freeze <body> instead.
    document.documentElement.style.height = '100%';
    document.body.style.height = '100%';
    document.body.style.overflowX = 'hidden';
    prepareSheetScrollLock(dialog);
    expect(dialog).toHaveAttribute(SHEET_LOCKS_BODY_ATTRIBUTE, '');

    // `body { height: 100vh; overflow-y: auto }`: the same shape.
    document.body.style.cssText = 'height: 100vh; overflow-y: auto';
    document.documentElement.style.cssText = '';
    prepareSheetScrollLock(dialog);
    expect(dialog).toHaveAttribute(SHEET_LOCKS_BODY_ATTRIBUTE, '');

    // A root that scrolls itself (`html { overflow-y: scroll }`): the root's
    // overflow is not visible, so <body>'s does not propagate; freeze the
    // root. Measured again on this present, so the stale mark comes off.
    document.documentElement.style.overflowY = 'scroll';
    prepareSheetScrollLock(dialog);
    expect(dialog).not.toHaveAttribute(SHEET_LOCKS_BODY_ATTRIBUTE);

    dialog.remove();
  });

  it('holds the gutter by padding <body> where the engine has no scrollbar-gutter, shared by every presented modal sheet dialog until the last leaves', async () => {
    stubViewport(1280, 1265);
    stubScrollbarGutterSupport(false);
    // jsdom has no layout: the helper measures growth by getBoundingClientRect,
    // so stand in for a <body> that widens by the 15px the scrollbar freed.
    let bodyWidth = 1265;
    vi.spyOn(document.body, 'getBoundingClientRect').mockImplementation(
      () => ({width: bodyWidth}) as DOMRect,
    );
    const first = document.createElement('dialog');
    const second = document.createElement('dialog');
    document.body.append(first, second);
    const nextMicrotask = async () =>
      new Promise<void>(resolve => {
        queueMicrotask(resolve);
      });

    // The first present measures the classic scrollbar, creates the hold,
    // and settles it against the growth showModal() caused.
    const settleFirst = prepareSheetScrollLock(first);
    expect(document.body.style.paddingRight).toBe('');
    first.setAttribute('open', '');
    bodyWidth = 1280;
    settleFirst();
    expect(document.body.style.paddingRight).toBe('15px');
    const leaveFirst = acquireSheetScrollLock(first);

    // A second modal sheet dialog (a handoff, a nested sheet) presents while
    // the first holds: the lock already hid the scrollbar, so it measures no
    // scrollbar and is not marked -- and joins the existing hold anyway.
    stubViewport(1280, 1280);
    const settleSecond = prepareSheetScrollLock(second);
    expect(second).not.toHaveAttribute(SHEET_HOLDS_GUTTER_ATTRIBUTE);
    second.setAttribute('open', '');
    settleSecond();
    const leaveSecond = acquireSheetScrollLock(second);
    expect(document.body.style.paddingRight).toBe('15px');

    // The first closes while the second is still modal: the padding stays.
    first.removeAttribute('open');
    leaveFirst();
    await nextMicrotask();
    expect(document.body.style.paddingRight).toBe('15px');

    // The last one leaves: the padding is released.
    second.removeAttribute('open');
    leaveSecond();
    await nextMicrotask();
    expect(document.body.style.paddingRight).toBe('');
    // Leaving twice is harmless.
    leaveSecond();
    first.remove();
    second.remove();
  });

  it('keeps the hold through a leave-then-join in one task, as a StrictMode replay does, and ends it when a presented dialog leaves the document', async () => {
    stubViewport(1280, 1265);
    stubScrollbarGutterSupport(false);
    let bodyWidth = 1265;
    vi.spyOn(document.body, 'getBoundingClientRect').mockImplementation(
      () => ({width: bodyWidth}) as DOMRect,
    );
    const dialog = document.createElement('dialog');
    document.body.appendChild(dialog);
    const settle = prepareSheetScrollLock(dialog);
    dialog.setAttribute('open', '');
    bodyWidth = 1280;
    settle();
    let leave = acquireSheetScrollLock(dialog);
    expect(document.body.style.paddingRight).toBe('15px');

    // StrictMode runs an effect's cleanup and the effect again in the same
    // commit; the dialog is already open, so nothing can re-measure. The
    // deferred release keeps the hold and its padding.
    leave();
    leave = acquireSheetScrollLock(dialog);
    await new Promise<void>(resolve => {
      queueMicrotask(resolve);
    });
    expect(document.body.style.paddingRight).toBe('15px');

    // The host unmounts while the sheet is presented: the element leaves the
    // document still `open`, and the paired cleanup is what ends the hold.
    dialog.remove();
    leave();
    await new Promise<void>(resolve => {
      queueMicrotask(resolve);
    });
    expect(document.body.style.paddingRight).toBe('');
    // A dialog that never joined gets a no-op release.
    acquireSheetScrollLock(document.createElement('dialog'))();
    expect(document.body.style.paddingRight).toBe('');
  });

  it('does not pad <body> where scrollbar-gutter is supported, or where no scrollbar takes space', () => {
    const dialog = document.createElement('dialog');
    document.body.appendChild(dialog);
    vi.spyOn(document.body, 'getBoundingClientRect').mockImplementation(
      () => ({width: 1280}) as DOMRect,
    );

    stubViewport(1280, 1265);
    stubScrollbarGutterSupport(true);
    prepareSheetScrollLock(dialog)();
    acquireSheetScrollLock(dialog)();
    expect(document.body.style.paddingRight).toBe('');

    stubViewport(1280, 1280);
    stubScrollbarGutterSupport(false);
    prepareSheetScrollLock(dialog)();
    acquireSheetScrollLock(dialog)();
    expect(document.body.style.paddingRight).toBe('');

    dialog.remove();
  });
});
