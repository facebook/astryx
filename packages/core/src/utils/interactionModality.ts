// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file interactionModality.ts
 * @input Global pointerdown/keydown events
 * @output `getInteractionModality()` — how the user last interacted
 * @position Internal utility; used where `:focus-visible` alone is too broad
 *
 * `:focus-visible` is the right selector for a focus ring and should stay the
 * condition that draws one. It is not, on its own, "focused by keyboard":
 * per CSS Selectors 4 a pointer-focused element that supports text entry
 * matches it too, deliberately, so that a clicked text field still shows where
 * typing will go. Measured in Chromium — a bare `<input>` clicked with a mouse
 * matches `:focus-visible`.
 *
 * A component that wants a ring for keyboard focus ONLY therefore needs one bit
 * `:focus-visible` cannot give it: which device moved focus. This records that,
 * to be used as a gate ALONGSIDE `:focus-visible`, never as a replacement for
 * it — the browser's heuristic still decides everything else, including
 * `focus({focusVisible: true})`.
 *
 * Listeners are registered once for the document, in the capture phase so they
 * run before the focus they explain, and are never removed: two passive
 * listeners for the whole app, versus a pair per mounted input.
 */

export type InteractionModality = 'keyboard' | 'pointer';

// Default to keyboard: with no interaction yet, focus arrived programmatically
// or from the browser restoring it, and showing a ring is the safe error.
let modality: InteractionModality = 'keyboard';
let isListening = false;

function onPointerDown(): void {
  modality = 'pointer';
}

function onKeyDown(event: KeyboardEvent): void {
  // Modifier-only presses are not navigation — holding Shift before a click
  // must not turn that click into "keyboard".
  if (event.metaKey || event.altKey || event.ctrlKey) {
    return;
  }
  modality = 'keyboard';
}

/**
 * Start tracking, once per document. Safe to call repeatedly and on the server
 * (where it does nothing).
 */
export function trackInteractionModality(): void {
  if (isListening || typeof document === 'undefined') {
    return;
  }
  isListening = true;
  document.addEventListener('pointerdown', onPointerDown, {
    capture: true,
    passive: true,
  });
  document.addEventListener('keydown', onKeyDown, {
    capture: true,
    passive: true,
  });
}

/** How the user last interacted with the page. */
export function getInteractionModality(): InteractionModality {
  return modality;
}

/** Test-only: restore the initial state between cases. */
export function __resetInteractionModalityForTest(): void {
  modality = 'keyboard';
}
