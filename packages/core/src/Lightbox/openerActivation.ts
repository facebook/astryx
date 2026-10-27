// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file openerActivation.ts
 * @input The shared touch press controller's last touch landing
 * @output useOpenerActivation and takeOpenerActivation: the element whose tap
 *   opened a viewer, the zoom transition's source fallback
 * @position Lightbox's opener record, read from the shared press controller
 *
 * A tap on the element that opens a viewer (which a plain image, or a button
 * in Safari, does not focus) is where a finger last landed. The touch press
 * controller, installed once per page however many surfaces hold it, already
 * watches every landing; a closed viewer on a touch screen holds it and reads
 * that landing rather than listening to the document itself
 * (spec:AST-094 FR24). Where the primary pointer is fine nothing is held:
 * only the touch presentation's zoom transition reads the opener.
 *
 * SYNC: When modified, update Lightbox.tsx and openerActivation.test.ts.
 */

import {useEffect} from 'react';
import {installPressFeedback, lastTouchLanding} from '../utils/pressFeedback';

export interface OpenerActivation {
  /** The element the finger landed on. */
  readonly target: Element;
  /** When it landed (the `Date.now()` clock). */
  readonly time: number;
}

/** The landing taken last: one landing opens one viewer. */
let taken = -1;

/**
 * Holds the shared touch press controller while `isEnabled`, a closed viewer
 * under the touch presentation; the last holder to go uninstalls it, and the
 * landing it recorded goes with it.
 */
export function useOpenerActivation(isEnabled: boolean): void {
  useEffect(
    () => (isEnabled ? installPressFeedback() : undefined),
    [isEnabled],
  );
}

/** The landing recorded last, if not taken already. */
export function takeOpenerActivation(): OpenerActivation | null {
  const landing = lastTouchLanding();
  if (
    landing == null ||
    landing.time === taken ||
    !(landing.target instanceof Element)
  ) {
    return null;
  }
  taken = landing.time;
  return {target: landing.target, time: landing.time};
}
