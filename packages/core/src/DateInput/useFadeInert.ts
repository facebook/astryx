// Copyright (c) Meta Platforms, Inc. and affiliates.
'use client';

/**
 * @file useFadeInert.ts
 * @input Whether the month/year wheels are open, and the two panels the
 *   month/year toggle cross-fades (the calendar and the wheels)
 * @output Exports `useFadeInert`: which panel is `inert`, and whether the
 *   toggle's cross-fade is running. Under a finger, both panels keep the
 *   `inert` they had until the outgoing panel's exit ends (the `transitionend` or
 *   `transitioncancel` of its `opacity` fade, or of the `visibility` the layer
 *   beneath holds for as long), and swap it then, or with the toggle when no
 *   exit runs; with a mouse they swap it with the toggle. Focus that was
 *   inside the outgoing panel moves to the incoming one with the toggle,
 *   which is live from then on.
 * @position Internal hook of TouchDateField.tsx and TouchDateTimeField.tsx;
 *   the panels' `aria-hidden` follows the toggle itself, and a shield over
 *   both takes touches while the fade runs, in those files
 */

import {useRef, useState, type RefObject} from 'react';
import {useIsomorphicLayoutEffect} from '../hooks/useIsomorphicLayoutEffect';

const FOCUSABLE =
  'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * The properties that carry a panel's exit: the layer on top fades its
 * `opacity`; the layer beneath holds `visibility` for the same duration and
 * takes `hidden` at the end.
 */
const EXIT_PROPERTIES = new Set(['opacity', 'visibility']);

/** Whether the panel's own exit transition is running. */
function isExiting(element: Element): boolean {
  if (typeof element.getAnimations !== 'function') {
    return false;
  }
  return element
    .getAnimations()
    .some(animation =>
      EXIT_PROPERTIES.has(
        (animation as {transitionProperty?: string}).transitionProperty ?? '',
      ),
    );
}

/**
 * `inert` is inherited, so flipping it restyles a panel's whole subtree;
 * here both flips wait for the cross-fade to end, when nothing on screen
 * moves. Meanwhile `aria-hidden` (set by the caller with the toggle) keeps
 * assistive technology out of the outgoing panel, the caller's shield keeps
 * touches off both (as a UIKit view animation does), and focus inside the
 * outgoing panel moves to the incoming one.
 */
export function useFadeInert(
  isWheelOpen: boolean,
  calendarRef: RefObject<HTMLElement | null>,
  wheelsRef: RefObject<HTMLElement | null>,
  /**
   * Under a finger: wait for the fade. With a mouse the panels swap `inert`
   * with the toggle, as they always have, so a click right after it lands.
   */
  isDeferred: boolean,
): {isCalendarInert: boolean; isWheelsInert: boolean; isFading: boolean} {
  // `settled`: the toggle state whose exit has ended. `focusedFor`: the
  // toggle state whose incoming panel took focus, and so is live early.
  const [{settled, focusedFor}, setFade] = useState<{
    settled: boolean;
    focusedFor: boolean | null;
  }>({settled: isWheelOpen, focusedFor: null});
  const isFading = settled !== isWheelOpen;

  // Synchronizes with the outgoing panel's exit: the swap of `inert` lands on
  // its end. Nothing here reads style in the toggle's commit (reading it would
  // resolve the fade's start inside the commit): the exit's own events end
  // it, and two frames later, with the styles applied by the browser, a panel
  // with no exit running settles at once.
  useIsomorphicLayoutEffect(() => {
    if (!isFading) {
      return;
    }
    const outgoing = (isWheelOpen ? calendarRef : wheelsRef).current;
    if (
      !isDeferred ||
      outgoing == null ||
      typeof outgoing.getAnimations !== 'function'
    ) {
      // With a mouse the swap of `inert` follows the toggle, and with no Web
      // Animations no exit can run.
      // eslint-disable-next-line @eslint-react/set-state-in-effect -- the swap is the toggle's own here, mirrored into this state
      setFade({settled: isWheelOpen, focusedFor: null});
      return;
    }
    const incoming = (isWheelOpen ? wheelsRef : calendarRef).current;
    const panels = [outgoing, incoming].filter(
      (panel): panel is HTMLElement => panel != null,
    );
    let frame = 0;
    // One frame after the cross-fade's end, so the restyle lands after its
    // last frame is on screen rather than holding that frame back.
    const settle = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() =>
        setFade({settled: isWheelOpen, focusedFor: null}),
      );
    };
    // The cross-fade ends with whichever panel's own transition ends: the
    // outgoing panel's exit, or the incoming one's entrance where the layer
    // beneath has none (it stays visible, covered).
    const onEnd = (event: Event) => {
      if (
        panels.includes(event.target as HTMLElement) &&
        EXIT_PROPERTIES.has((event as TransitionEvent).propertyName)
      ) {
        settle();
      }
    };
    for (const panel of panels) {
      panel.addEventListener('transitionend', onEnd);
      panel.addEventListener('transitioncancel', onEnd);
    }
    frame = requestAnimationFrame(() => {
      frame = requestAnimationFrame(() => {
        if (!panels.some(isExiting)) {
          // No transition runs on either panel (one is not rendered, say).
          setFade({settled: isWheelOpen, focusedFor: null});
        }
      });
    });
    return () => {
      cancelAnimationFrame(frame);
      for (const panel of panels) {
        panel.removeEventListener('transitionend', onEnd);
        panel.removeEventListener('transitioncancel', onEnd);
      }
    };
  }, [isFading, isWheelOpen, isDeferred, calendarRef, wheelsRef]);

  // Synchronizes with the document's focus: focus inside the outgoing panel
  // moves to the incoming one with the toggle, so it never sits in a panel
  // that is fading out. The incoming panel goes live first (focus cannot
  // land in an inert one), then takes focus.
  const shownRef = useRef(isWheelOpen);
  const pendingFocusRef = useRef<HTMLElement | null>(null);
  useIsomorphicLayoutEffect(() => {
    if (shownRef.current === isWheelOpen) {
      return;
    }
    shownRef.current = isWheelOpen;
    const outgoing = (isWheelOpen ? calendarRef : wheelsRef).current;
    const incoming = (isWheelOpen ? wheelsRef : calendarRef).current;
    const active = outgoing?.ownerDocument.activeElement ?? null;
    if (
      outgoing == null ||
      incoming == null ||
      active == null ||
      !outgoing.contains(active)
    ) {
      return;
    }
    pendingFocusRef.current = incoming;
    // eslint-disable-next-line @eslint-react/set-state-in-effect -- focus inside the outgoing panel is known only once the toggle has committed
    setFade(fade => ({...fade, focusedFor: isWheelOpen}));
  }, [isWheelOpen, calendarRef, wheelsRef]);
  useIsomorphicLayoutEffect(() => {
    const incoming = pendingFocusRef.current;
    if (incoming == null || incoming.inert) {
      return;
    }
    pendingFocusRef.current = null;
    const target = incoming.querySelector<HTMLElement>(FOCUSABLE) ?? incoming;
    target.focus({preventScroll: true});
  });

  if (!isDeferred) {
    return {
      isCalendarInert: isWheelOpen,
      isWheelsInert: !isWheelOpen,
      isFading: false,
    };
  }
  const isIncomingLive = isFading && focusedFor === isWheelOpen;
  return {
    isCalendarInert: isFading
      ? settled && !(isIncomingLive && !isWheelOpen)
      : isWheelOpen,
    isWheelsInert: isFading
      ? !settled && !(isIncomingLive && isWheelOpen)
      : !isWheelOpen,
    isFading,
  };
}
