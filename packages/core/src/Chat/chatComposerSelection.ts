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
 * Whether the current selection's start boundary sits at the very
 * beginning of `editable`'s content.
 *
 * Used by the composer to decide when ArrowUp should recall message
 * history versus move the caret up a line: history is only recalled
 * when the caret is at the very start of the draft. This handles both
 * the editable root and offset 0 of its leading text node without
 * cloning the draft's contents.
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
  return isBoundaryAtEdge(
    editable,
    range.startContainer,
    range.startOffset,
    'start',
  );
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
  return isBoundaryAtEdge(
    editable,
    range.endContainer,
    range.endOffset,
    'end',
  );
}

/**
 * Check whether a Range boundary is at an edge of `editable` without
 * materializing the content before or after it. Chromium represents a caret
 * at the start of non-empty contenteditables as the first text node at offset
 * zero (and likewise uses the last text node's length at the end). Those are
 * distinct DOM boundary points from the editable's child offsets, so
 * `compareBoundaryPoints` cannot be used here.
 */
function isBoundaryAtEdge(
  editable: HTMLElement,
  container: Node,
  offset: number,
  edge: 'start' | 'end',
): boolean {
  if (!editable.contains(container) || !isAtNodeEdge(container, offset, edge)) {
    return false;
  }

  for (let node: Node | null = container; node && node !== editable; ) {
    if (hasContentSibling(node, edge)) {
      return false;
    }
    node = node.parentNode;
  }

  return true;
}

function isAtNodeEdge(
  node: Node,
  offset: number,
  edge: 'start' | 'end',
): boolean {
  if (
    node.nodeType === Node.TEXT_NODE ||
    node.nodeType === Node.CDATA_SECTION_NODE
  ) {
    return edge === 'start'
      ? offset === 0
      : offset === (node.nodeValue?.length ?? 0);
  }

  return edge === 'start' ? offset === 0 : offset === node.childNodes.length;
}

function hasContentSibling(node: Node, edge: 'start' | 'end'): boolean {
  for (
    let sibling = edge === 'start' ? node.previousSibling : node.nextSibling;
    sibling;
    sibling = edge === 'start' ? sibling.previousSibling : sibling.nextSibling
  ) {
    // Elements (including <br> and tokens) represent a content boundary even
    // when they have no text. Empty text nodes and comments do not.
    if (
      sibling.nodeType === Node.ELEMENT_NODE ||
      (sibling.nodeType === Node.TEXT_NODE && sibling.nodeValue !== '')
    ) {
      return true;
    }
  }
  return false;
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
