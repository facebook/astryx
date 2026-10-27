// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file openerActivation.ts
 * @input The document's click events, captured while a viewer on a touch
 *   screen is closed
 * @output useOpenerActivation and takeOpenerActivation: the element whose
 *   click opened a viewer, the zoom transition's source fallback
 * @position Lightbox's opener record, one listener for every viewer
 *
 * A click or a tap on the element that opens a viewer (which a plain image,
 * or a button in Safari, does not focus) is recorded by one capture-phase
 * listener on the document, shared by every closed viewer on a touch screen
 * and removed when the last of them goes. Where the primary pointer is fine
 * there is none: only the touch presentation's zoom transition reads the
 * opener (spec:AST-094 FR24).
 *
 * SYNC: When modified, update Lightbox.tsx and Lightbox.test.tsx.
 */

import {useEffect} from 'react';

export interface OpenerActivation {
  /** The element the click or tap landed on. */
  readonly target: Element;
  /** The event's time stamp (the `performance.now()` clock). */
  readonly time: number;
}

let lastActivation: OpenerActivation | null = null;
let users = 0;

function recordOpenerActivation(event: Event): void {
  if (event.target instanceof Element) {
    lastActivation = {target: event.target, time: event.timeStamp};
  }
}

/**
 * Records the activation that opens a viewer while `isEnabled`, a closed
 * viewer under the touch presentation: the first such viewer adds the one
 * listener, the last one to go removes it.
 */
export function useOpenerActivation(isEnabled: boolean): void {
  useEffect(() => {
    if (!isEnabled) {
      return undefined;
    }
    if (users === 0) {
      document.addEventListener('click', recordOpenerActivation, true);
    }
    users += 1;
    return () => {
      users -= 1;
      if (users === 0) {
        document.removeEventListener('click', recordOpenerActivation, true);
      }
    };
  }, [isEnabled]);
}

/** The activation recorded last, cleared as it is read. */
export function takeOpenerActivation(): OpenerActivation | null {
  const activation = lastActivation;
  lastActivation = null;
  return activation;
}
