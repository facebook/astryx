'use client';

/**
 * @file chatComposerSelection.ts
 * @input Uses DOM Selection / Range APIs
 * @output Exports selection helpers used by the chat composer
 * @position Internal helper module shared by XDSChatComposerInput and useXDSChatComposerTokens
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
 * - /packages/core/src/Chat/XDSChatComposerInput.tsx (consumer)
 * - /packages/core/src/Chat/useXDSChatComposerTokens.ts (consumer)
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
  if (!selection) return null;

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
  if (!selection || selection.rangeCount === 0) return false;

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
