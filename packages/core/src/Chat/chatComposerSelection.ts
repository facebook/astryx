// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file chatComposerSelection.ts
 * @input Uses DOM Selection / Range APIs
 * @output Exports selection helpers used by the chat composer
 * @position Internal helper module shared by ChatComposerInput and useChatComposerTokens
 *
 * Selection helpers for the contentEditable chat input. Both the
 * imperative `insertToken` / `insertText` APIs and the paste pipeline
 * need a valid Range inside the editable before they can mutate the
 * DOM. Browsers do NOT create a Selection range when an element is
 * programmatically focused — a Range only exists once the user has
 * clicked inside the editable or we've created one explicitly.
 *
 * `ensureCaretInside` centralizes the fallback: if the current
 * Selection has no Range inside the given editable, place a collapsed
 * caret at the end of the editable. Callers can then read
 * `selection.getRangeAt(0)` safely.
 *
 * SYNC: When modified, update:
 * - /packages/core/src/Chat/ChatComposerInput.tsx (consumer)
 * - /packages/core/src/Chat/useChatComposerTokens.ts (consumer)
 */

/**
 * Ensure the current Selection has a Range inside `editable`.
 *
 * If `window.getSelection()` already has a Range whose `startContainer`
 * is inside `editable`, this is a no-op. Otherwise a collapsed caret
 * is placed at the end of `editable` and the Selection is updated.
 *
 * Returns the live `Selection` on success, or `null` if no Selection
 * is available at all (e.g. detached document, JSDOM without selection
 * support).
 */
export function ensureCaretInside(editable: HTMLElement): Selection | null {
  const selection = window.getSelection();
  if (!selection) {
    return null;
  }

  if (selection.rangeCount > 0) {
    const existing = selection.getRangeAt(0);
    if (editable.contains(existing.startContainer)) {
      return selection;
    }
  }

  const range = document.createRange();
  range.selectNodeContents(editable);
  range.collapse(false); // collapse to end
  selection.removeAllRanges();
  selection.addRange(range);
  return selection;
}

/**
 * Whether a range spans no visible content — no text and no element
 * (tokens, `<br>`). An empty or whitespace-free range between a
 * boundary and the caret means the caret is at that boundary.
 */
function isRangeEmpty(range: Range): boolean {
  const contents = range.cloneContents();
  return contents.textContent === '' && contents.querySelector('*') === null;
}

/**
 * Whether the current selection's start boundary sits at the very
 * beginning of `editable`'s content.
 *
 * Used by the composer to decide when ArrowUp should recall message
 * history versus move the caret up a line: history is only recalled
 * when the caret is at the very start of the draft. Detection is
 * content-based rather than boundary-point comparison, so a caret at
 * offset 0 of the leading text node counts as the start (browsers
 * normalize the caret into the text node, not onto the editable).
 *
 * Returns `false` when there is no selection, the range is not inside
 * `editable`, or the boundary APIs are unavailable — callers treat
 * that as "not at the boundary" and let the browser move the caret.
 */
export function isSelectionAtStart(editable: HTMLElement): boolean {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) {
    return false;
  }
  const range = selection.getRangeAt(0);
  if (!editable.contains(range.startContainer)) {
    return false;
  }
  const before = document.createRange();
  before.selectNodeContents(editable);
  try {
    before.setEnd(range.startContainer, range.startOffset);
  } catch {
    return false;
  }
  return isRangeEmpty(before);
}

/**
 * Whether the current selection's end boundary sits at the very end of
 * `editable`'s content.
 *
 * The ArrowDown counterpart to {@link isSelectionAtStart}: history is
 * only stepped forward when the caret is at the very end of the draft.
 *
 * Returns `false` under the same conditions as {@link isSelectionAtStart}.
 */
export function isSelectionAtEnd(editable: HTMLElement): boolean {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) {
    return false;
  }
  const range = selection.getRangeAt(0);
  if (!editable.contains(range.endContainer)) {
    return false;
  }
  const after = document.createRange();
  after.selectNodeContents(editable);
  try {
    after.setStart(range.endContainer, range.endOffset);
  } catch {
    return false;
  }
  return isRangeEmpty(after);
}

/**
 * Insert plain text at the current selection, scoped to `editable`.
 *
 * Ensures a caret exists inside `editable` first (see `ensureCaretInside`)
 * so callers don't have to manage Selection state to make insertion work
 * — e.g. after a programmatic focus that didn't create a Range.
 *
 * Returns `true` if text was inserted, `false` only if the Selection
 * API is unavailable.
 */
export function insertTextAtCursor(
  editable: HTMLElement,
  text: string,
): boolean {
  const selection = ensureCaretInside(editable);
  if (!selection || selection.rangeCount === 0) {
    return false;
  }

  const range = selection.getRangeAt(0);
  range.deleteContents();

  const textNode = document.createTextNode(text);
  range.insertNode(textNode);

  range.setStartAfter(textNode);
  range.collapse(true);
  selection.removeAllRanges();
  selection.addRange(range);
  return true;
}
