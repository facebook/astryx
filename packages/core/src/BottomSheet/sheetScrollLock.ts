// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file sheetScrollLock.ts
 * @input A sheet dialog about to be presented modally, and its document
 * @output The attribute every sheet dialog carries, the CSS rules that lock
 *   page scroll while a sheet dialog is modal, the call a host makes around
 *   showModal() to install them, measure the page, and arm the reduced
 *   fallback for engines without `scrollbar-gutter`, and the paired
 *   acquire/release a host makes while its dialog is a presented modal sheet
 * @position BottomSheet host plumbing; the page-scroll lock of every sheet
 *   (standalone or switcher-managed), replacing a JavaScript body pin
 *
 * `showModal()` makes the page inert but does not stop it scrolling: a wheel
 * or a finger over the backdrop still moves the document. The lock is
 * therefore stylesheet rules keyed off the browser's own modal state --
 * `:root:has(dialog:modal)` -- so it engages the instant a sheet dialog
 * enters the top layer and releases the instant the last one leaves, through
 * a handoff (two open sheet dialogs) and under any other modal layer opened
 * on top (the sheet beneath is still `:modal`). No counter, no saved scroll
 * position, no inline styles on `<body>`.
 *
 * Which element the rule freezes depends on which one owns the viewport
 * scroll. CSS propagates `<body>`'s `overflow` to the viewport only while the
 * root's is `visible`; a page styled `html, body { height: 100% }` with
 * `body { overflow-x: hidden }` scrolls the viewport through `<body>`'s
 * values. Setting `overflow: hidden` on the root of such a page would stop
 * that propagation, turn `<body>` into a viewport-tall scroller of its own,
 * and clamp the page to its top. So the host measures at present time: when
 * the root's computed overflow is `visible` and `<body>`'s is not, it marks
 * its dialog and the rules freeze `<body>` (whose `hidden` then propagates to
 * the viewport, offset intact); otherwise they freeze the root.
 *
 * The rules are scoped to sheet dialogs by attribute so other components keep
 * their own scroll handling. A further rule keeps a classic scrollbar's gutter
 * open (`scrollbar-gutter: stable` on the root, which reaches the viewport
 * whichever element's overflow it uses) while the scrollbar is gone, so a
 * desktop page does not shift sideways when a sheet opens -- but only when a
 * space-taking scrollbar was there: the gutter is not covered by the
 * `::backdrop`, so reserving one on a page that never had a scrollbar would
 * open an undimmed strip and shift the page the other way. CSS cannot see
 * whether a scrollbar took space, so the host measures it just before
 * presenting (`window.innerWidth > documentElement.clientWidth`, the test the
 * shared scroll-lock hook uses) and marks its own dialog. Where the engine has
 * no `scrollbar-gutter` at all (Safari before 18.2), the shared gutter helper
 * supplies the reduced fallback the scroll-lock hook already ships: `<body>`
 * is padded by the width it actually grew, for as long as any sheet dialog in
 * the document is a presented modal sheet. The sheet's own scroll area carries
 * `overscroll-behavior: contain`, so a scroll that reaches its end does not
 * chain to the (now unscrollable) page.
 *
 * StyleX styles the element that carries its class, never the root, so the
 * rules ship the way Layer ships its `@position-try` rules: one static
 * stylesheet installed in the document head once, from a layout effect,
 * before the dialog is presented. The rules are inert until a matching dialog
 * is modal, so installing them early costs nothing.
 *
 * SYNC: When modified, update:
 * - /packages/core/src/BottomSheet/BottomSheet.tsx
 * - /packages/core/src/BottomSheet/sheetScrollLock.test.ts
 * - /packages/core/src/hooks/scrollbarGutter.ts
 */

import {
  holdScrollbarGutter,
  type ScrollbarGutterHold,
} from '../hooks/scrollbarGutter';

/** The attribute every BottomSheet-owned native dialog carries. */
export const SHEET_DIALOG_ATTRIBUTE = 'data-sheet-dialog';

/**
 * Set on a sheet dialog presented while a classic scrollbar took layout
 * space, so the lock holds that gutter open for as long as the dialog is
 * modal.
 */
export const SHEET_HOLDS_GUTTER_ATTRIBUTE = 'data-sheet-holds-gutter';

/**
 * Set on a sheet dialog presented on a page whose `<body>` owns the viewport
 * scroll (the root's overflow is `visible`, `<body>`'s is not), so the lock
 * freezes `<body>` rather than the root and the page keeps its offset.
 */
export const SHEET_LOCKS_BODY_ATTRIBUTE = 'data-sheet-locks-body';

/** The id of the one `<style>` element the lock installs per document. */
export const SHEET_SCROLL_LOCK_RULES_ID = 'astryx-bottom-sheet-scroll-lock';

/**
 * The selector that is true exactly while a sheet dialog is modal. Exported
 * so a test can assert the lock's precondition from the DOM alone.
 */
export const SHEET_SCROLL_LOCK_SELECTOR = `:root:has(dialog[${SHEET_DIALOG_ATTRIBUTE}]:modal)`;

/** The selector that is true while a modal sheet dialog holds the gutter. */
export const SHEET_SCROLLBAR_GUTTER_SELECTOR = `:root:has(dialog[${SHEET_DIALOG_ATTRIBUTE}][${SHEET_HOLDS_GUTTER_ATTRIBUTE}]:modal)`;

const MODAL = `dialog[${SHEET_DIALOG_ATTRIBUTE}]:modal`;
const LOCKS_BODY = `[${SHEET_LOCKS_BODY_ATTRIBUTE}]`;

/**
 * The lock, as CSS text: freeze the root while a modal sheet dialog locks the
 * root, freeze `<body>` while one locks the body, and hold the scrollbar
 * gutter on the root while a modal sheet dialog holds it.
 */
export function sheetScrollLockCss(): string {
  return (
    `:root:has(${MODAL}:not(${LOCKS_BODY})){overflow:hidden}` +
    `:root:has(${MODAL}${LOCKS_BODY}) body{overflow:hidden}` +
    `${SHEET_SCROLLBAR_GUTTER_SELECTOR}{scrollbar-gutter:stable}`
  );
}

/**
 * Whether the document's scrollbar takes layout space right now: a classic
 * scrollbar, or a gutter already held open by another lock. Overlay
 * scrollbars (mobile, default macOS) and a page that does not scroll report
 * false. 0 means "no layout to measure" (jsdom), not a full-width scrollbar.
 */
function isScrollbarTakingSpace(doc: Document): boolean {
  const view = doc.defaultView;
  const viewportWidth = doc.documentElement.clientWidth;
  return view != null && viewportWidth > 0 && view.innerWidth > viewportWidth;
}

function hasVisibleOverflow(style: CSSStyleDeclaration): boolean {
  return (
    (style.overflowX || 'visible') === 'visible' &&
    (style.overflowY || 'visible') === 'visible'
  );
}

/**
 * Whether `<body>` owns the viewport scroll: the browser propagates its
 * overflow to the viewport because the root's is `visible`. Freezing the root
 * would then stop that propagation and make `<body>` its own scroller.
 */
function bodyOwnsViewportScroll(doc: Document): boolean {
  const view = doc.defaultView;
  if (view == null || doc.body == null) {
    return false;
  }
  return (
    hasVisibleOverflow(view.getComputedStyle(doc.documentElement)) &&
    !hasVisibleOverflow(view.getComputedStyle(doc.body))
  );
}

function supportsScrollbarGutter(doc: Document): boolean {
  const view = doc.defaultView as (Window & {CSS?: typeof CSS}) | null;
  return view?.CSS?.supports?.('scrollbar-gutter: stable') ?? true;
}

/**
 * The reduced gutter fallback for engines without `scrollbar-gutter`: one
 * shared-helper hold per document, created by the first modal sheet dialog
 * presented while a classic scrollbar takes space (measured before its
 * showModal(), the only moment the growth can be measured), and kept alive by
 * membership. Every modal sheet dialog in the document is a member while it
 * is presented -- including one presented after the first, which measures
 * no scrollbar because the lock already hid it -- so the padding lasts until
 * the last member leaves. Membership is paired: a host joins in the effect
 * that keeps its dialog modal and leaves in that effect's cleanup, so an
 * unmount, a close, and a StrictMode replay all leave through the same path.
 * Release is deferred by a microtask: a replay's leave-then-join in one
 * commit keeps the hold, and so its measured padding, intact.
 */
interface GutterFallback {
  hold: ScrollbarGutterHold;
  dialogs: Set<HTMLDialogElement>;
  releasePending: boolean;
}
const gutterFallbacks = new WeakMap<Document, GutterFallback>();

function releaseIfEmpty(doc: Document, fallback: GutterFallback): void {
  fallback.releasePending = false;
  if (fallback.dialogs.size === 0 && gutterFallbacks.get(doc) === fallback) {
    fallback.hold.release();
    gutterFallbacks.delete(doc);
  }
}

function leaveGutterFallback(dialog: HTMLDialogElement): void {
  const doc = dialog.ownerDocument;
  const fallback = gutterFallbacks.get(doc);
  if (fallback == null || !fallback.dialogs.delete(dialog)) {
    return;
  }
  if (fallback.dialogs.size === 0 && !fallback.releasePending) {
    fallback.releasePending = true;
    queueMicrotask(() => releaseIfEmpty(doc, fallback));
  }
}

/**
 * Whether this document's sheets use the padding fallback: the engine has no
 * `scrollbar-gutter`, and either a classic scrollbar took space when this
 * dialog was prepared or another sheet dialog already holds the padding.
 */
function needsGutterFallback(dialog: HTMLDialogElement): boolean {
  const doc = dialog.ownerDocument;
  return (
    !supportsScrollbarGutter(doc) &&
    (dialog.hasAttribute(SHEET_HOLDS_GUTTER_ATTRIBUTE) ||
      gutterFallbacks.has(doc))
  );
}

function ensureGutterFallback(doc: Document): GutterFallback {
  let fallback = gutterFallbacks.get(doc);
  if (fallback == null) {
    fallback = {
      hold: holdScrollbarGutter(doc.body),
      dialogs: new Set(),
      releasePending: false,
    };
    gutterFallbacks.set(doc, fallback);
  }
  return fallback;
}

/**
 * Prepare a sheet dialog's document for the lock, right before showModal():
 * install the rules once, mark the dialog for the scroller that owns the
 * viewport scroll, and mark it when a space-taking scrollbar is present so
 * the gutter rule applies to it. Measured per present: the page may have
 * gained or lost its scrollbar, or changed its scroller, since the sheet
 * last opened. Returns the call to make right after showModal(): on an
 * engine without `scrollbar-gutter` it settles the shared padding fallback
 * against the width the page actually grew; elsewhere it does nothing.
 * Membership in that fallback is the host's `acquireSheetScrollLock`.
 */
export function prepareSheetScrollLock(dialog: HTMLDialogElement): () => void {
  const doc = dialog.ownerDocument;
  ensureSheetScrollLock(doc);
  if (bodyOwnsViewportScroll(doc)) {
    dialog.setAttribute(SHEET_LOCKS_BODY_ATTRIBUTE, '');
  } else {
    dialog.removeAttribute(SHEET_LOCKS_BODY_ATTRIBUTE);
  }
  if (isScrollbarTakingSpace(doc)) {
    dialog.setAttribute(SHEET_HOLDS_GUTTER_ATTRIBUTE, '');
  } else {
    dialog.removeAttribute(SHEET_HOLDS_GUTTER_ATTRIBUTE);
  }
  if (!needsGutterFallback(dialog)) {
    return () => {};
  }
  // Created before showModal() so the helper sees the pre-lock width; the
  // dialog joins through acquireSheetScrollLock once it is presented.
  const {hold} = ensureGutterFallback(doc);
  return () => hold.settle();
}

/**
 * Keep the document's gutter-padding fallback alive while this dialog is a
 * presented modal sheet. Call it from the effect that keeps the dialog
 * modal, and call the returned function from that effect's cleanup: a close,
 * an unmount while presented, and a StrictMode replay all release through
 * it, and the last member's release ends the padding. A no-op where the
 * engine has `scrollbar-gutter` or no sheet dialog holds the padding.
 */
export function acquireSheetScrollLock(dialog: HTMLDialogElement): () => void {
  if (!needsGutterFallback(dialog)) {
    return () => {};
  }
  ensureGutterFallback(dialog.ownerDocument).dialogs.add(dialog);
  return () => leaveGutterFallback(dialog);
}

/**
 * Install the scroll-lock rules in a document once. Idempotent; a second
 * sheet, or a sheet in another document (an iframe), finds or adds its own
 * stylesheet.
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
