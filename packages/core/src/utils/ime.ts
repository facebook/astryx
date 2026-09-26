// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file ime.ts
 * @input Receives a keyboard event (React SyntheticEvent's `nativeEvent`, or a
 *   native DOM KeyboardEvent) with optional `isComposing` / `keyCode`.
 * @output Exports `isImeKeyEvent`, the canonical predicate for "this keydown is
 *   part of an in-progress IME composition and must not be treated as a command".
 * @position Shared low-level utility; consumed by every editable/overlay surface
 *   that handles Enter/Escape/arrows in `onKeyDown` (Typeahead, PowerSearch,
 *   Dialog, ContextMenu, Tooltip, Chat composer, focus-trap Escape, ...).
 *
 * ── Why this exists (read once, here — do not re-explain at call sites) ──
 *
 * When a CJK user (Korean / Japanese / Chinese) is composing text via an IME,
 * the browser fires a `keydown` event to COMMIT or CANCEL the pending
 * composition (Enter commits the highlighted candidate; Escape cancels it;
 * ArrowUp/Down/Home/End navigate the candidate window). Crucially this
 * `keydown` fires BEFORE the `compositionend` event that actually writes the
 * committed text into the field. So a naive `onKeyDown` handler sees a bare
 * "Enter" or "Escape" and misreads the composition-commit/cancel as an
 * application command — accepting a typeahead suggestion, submitting a chat
 * message, closing a dialog/menu/tooltip, or saving a filter — mid-composition.
 * The fix is to detect the composing keydown and early-return before running
 * any command logic.
 *
 * Two signals, both needed:
 *
 *  1. `event.isComposing === true` — the modern, spec'd signal
 *     (https://www.w3.org/TR/uievents/#dom-keyboardevent-iscomposing). This is
 *     the primary check and is reliable in current evergreen browsers.
 *
 *  2. `event.keyCode === 229` — the legacy fallback. `229` is the sentinel
 *     keyCode browsers report for "the key event is being processed by an IME".
 *     It is still load-bearing: some IMEs and older Safari fire the composing
 *     `keydown` with `isComposing` NOT yet set to `true`, but DO report
 *     keyCode 229. Keeping both makes the guard robust across the browser
 *     matrix we support. Do not drop the 229 fallback without a browser-matrix
 *     audit.
 *
 * ── Which event object to pass ──
 *
 * React's SyntheticEvent for KeyboardEvent *does* surface `isComposing`, but to
 * avoid any cross-browser normalization gap prefer passing the *native* event
 * (`e.nativeEvent`) from React handlers — that is what BaseTypeahead,
 * PowerSearch, and the Chat composer do. Native DOM listeners (Dialog,
 * ContextMenu, Tooltip, focus-trap) pass the DOM `KeyboardEvent` directly.
 * The parameter is intentionally structurally typed so both shapes are accepted.
 *
 * Note: `keyCode` is deprecated on the DOM `KeyboardEvent` type but is still
 * present at runtime; we read it defensively via the optional structural field.
 */

/**
 * The sentinel `keyCode` browsers report while a key event is being processed
 * by an IME (the composing keydown that fires before `compositionend`). See the
 * file header for why this legacy signal is still load-bearing alongside
 * `isComposing`.
 */
const IME_PROCESSING_KEY_CODE = 229;

export function isImeKeyEvent(event: {
  isComposing?: boolean;
  keyCode?: number;
}): boolean {
  return (
    event.isComposing === true || event.keyCode === IME_PROCESSING_KEY_CODE
  );
}
