// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file useAdaptationSurfaceLatch.ts
 * @input The surface an adaptation policy resolves to right now, plus focus
 *   events from the field rendering it
 * @output Package-internal latch that holds one resolved surface while the
 *   field is in use, and the focus handlers that observe that use
 * @position spec:AST-031 FR5, for the components whose surfaces are SEPARATE
 *   component trees.
 *
 * `DateInput` and `DateTimeInput` choose between whole trees — a native
 * control, a typable field with an anchored popover, a touch field with a modal
 * sheet — so publishing a new policy value mid-interaction would unmount the
 * focused control and take the uncommitted draft, the caret and the open
 * surface with it. A viewport that crosses a rule boundary while someone is
 * typing is an ordinary event: a rotated phone, a resized window, a nested
 * Theme swapped under a policy that reads its width points.
 *
 * Selector deliberately does NOT use this: its two surfaces live inside one
 * component, so `useSelectorPresentation` latches without a tree swap.
 *
 * The latch holds while EITHER signal is live and releases only when both are
 * clear (spec:AST-031 FR5):
 * - focus is somewhere in the field's tree, decided from the blur event's
 *   `relatedTarget` — the element focus is moving TO — rather than from a
 *   deferred re-check;
 * - the field still owns an open surface, read from the DOM as an expanded
 *   trigger or a mounted open `<dialog>`. That is the arm that covers a
 *   DateTimeInput calendar, whose popover is PORTALED out of the field's DOM
 *   subtree: focus moving into it reports a `relatedTarget` the field does not
 *   contain, and the open surface is what says that focus is still the field's.
 *
 * ## Why `relatedTarget` and not a deferred re-check
 *
 * Moving between two controls of one field — the text input to its calendar
 * toggle, a date segment to its time segment — fires a blur and then a focus,
 * and the latch must not read the gap between them as focus leaving. The
 * tempting implementation defers the decision (a microtask, a timeout) and asks
 * again once the focus has landed. It is wrong, and jsdom hides it: there, a
 * programmatic `blur()`/`focus()` pair runs inside one task, so a microtask
 * always observes the landed focus. A real browser dispatches a user's Tab or
 * click as `focusout`, then drains microtasks, then `focusin` — so the deferred
 * check runs BETWEEN them, sees focus nowhere, and releases the latch in the
 * middle of the very interaction it exists to protect: the tree swaps under the
 * pointer, the draft goes with it, and the click never reaches the button that
 * was under the cursor.
 *
 * `relatedTarget` carries the answer synchronously, in the event that asks the
 * question, which is why it is the pattern focus-within implementations settle
 * on. It is `null` when focus leaves for the document, another window, or a
 * target the browser withholds — all read as "outside", after which the owned
 * surface still gets its say.
 *
 * SYNC: When modified, update:
 * - /packages/core/src/DateInput/DateInput.tsx
 * - /packages/core/src/DateTimeInput/DateTimeInput.tsx
 * - /packages/core/src/DateInput/DateInputAdaptations.test.tsx
 * - /packages/core/src/DateTimeInput/DateTimeInputAdaptations.test.tsx
 * - /apps/storybook/stories/DateInput.stories.tsx (the real-browser proof)
 */

import {useCallback, useEffect, useRef, useState, type FocusEvent} from 'react';

/** Attributes whose change can end an owned surface's lifetime. */
const SURFACE_STATE_ATTRIBUTES = ['aria-expanded', 'open'];

/**
 * Whether the field still owns an open surface.
 *
 * Two DOM signals, because the surfaces are not alike. Every Astryx trigger
 * reflects its disclosure state with `aria-expanded`, which covers the anchored
 * calendar and the touch sheet's segments; a `BottomSheet` then stays mounted
 * as an open `<dialog>` through its exit transition after that flag clears, and
 * swapping the tree during the exit would drop the sheet mid-animation and
 * strand the focus handoff it owes the trigger.
 *
 * A native OS picker has neither signal — the browser draws it outside the page
 * — so for that surface the latch rests on focus, which is exactly what the
 * platform provides: an `<input type="date">` keeps focus while its picker is
 * up, and blurs when the picker is dismissed.
 */
function hasOpenOwnedSurface(root: HTMLElement | null): boolean {
  return (
    root != null &&
    (root.querySelector('[aria-expanded="true"]') != null ||
      root.querySelector('dialog[open]') != null)
  );
}

/** What the latch publishes back to the component that owns the switch. */
export interface AdaptationSurfaceLatch<T> {
  /** The surface to render now: the resolved one, or the held one while busy. */
  readonly surface: T;
  /** Spread onto the rendered surface's root, composed with the caller's. */
  readonly onFocusCapture: (event: FocusEvent<HTMLElement>) => void;
  readonly onBlurCapture: (event: FocusEvent<HTMLElement>) => void;
}

/**
 * Hold `resolved` steady while the field it selects is being used.
 *
 * Returns the resolved value unchanged whenever the field is idle — including
 * every server render, where no focus event has happened and no DOM is read —
 * so a policy change reaches an untouched field immediately. Once focus enters
 * the field, the value that was rendered stays rendered until focus leaves AND
 * every surface it owns has closed; the pending value is applied on that
 * release, in one re-render.
 *
 * @internal
 */
export function useAdaptationSurfaceLatch<T>(
  resolved: T,
): AdaptationSurfaceLatch<T> {
  // The surface that was rendered when the field last became busy. Kept in
  // state rather than a ref because releasing the latch has to re-render.
  const [rendered, setRendered] = useState<T>(resolved);
  const resolvedRef = useRef<T>(resolved);
  resolvedRef.current = resolved;

  // Split deliberately: `isBusyRef` is what render reads, and it stays true
  // while an owned surface is open with focus elsewhere; `isFocusWithinRef` is
  // the raw focus signal, so a surface closing later knows whether focus ever
  // came back.
  const isBusyRef = useRef(false);
  const isFocusWithinRef = useRef(false);
  const rootRef = useRef<HTMLElement | null>(null);
  const observerRef = useRef<MutationObserver | null>(null);

  const stopObserving = useCallback(() => {
    observerRef.current?.disconnect();
    observerRef.current = null;
  }, []);

  const release = useCallback(() => {
    stopObserving();
    isBusyRef.current = false;
    // Publishes whatever the policy resolves to now. An unchanged value bails
    // out of the re-render on its own, so an ordinary blur costs nothing.
    setRendered(resolvedRef.current);
  }, [stopObserving]);

  /**
   * Decide the latch now that focus is not in the field: release, or keep
   * holding for an owned surface and watch for it to close.
   *
   * Also the observer's callback, which is how a surface that outlives focus
   * releases the latch when it finally closes — there is no later focus event
   * to carry that news.
   */
  const releaseUnlessSurfaceIsOpen = useCallback(() => {
    if (isFocusWithinRef.current) {
      stopObserving();
      return;
    }
    if (hasOpenOwnedSurface(rootRef.current)) {
      if (observerRef.current == null && rootRef.current != null) {
        const observer = new MutationObserver(() => {
          releaseUnlessSurfaceIsOpen();
        });
        observer.observe(rootRef.current, {
          attributes: true,
          attributeFilter: SURFACE_STATE_ATTRIBUTES,
          subtree: true,
        });
        observerRef.current = observer;
      }
      return;
    }
    release();
  }, [release, stopObserving]);

  const handleFocusCapture = useCallback(
    (event: FocusEvent<HTMLElement>) => {
      // `currentTarget` is the field root the handler was spread onto, which is
      // how the latch learns which subtree to read disclosure state from
      // without a ref of its own — the surfaces forward `ref` to their input.
      rootRef.current = event.currentTarget;
      isFocusWithinRef.current = true;
      isBusyRef.current = true;
      stopObserving();
    },
    [stopObserving],
  );

  const handleBlurCapture = useCallback(
    (event: FocusEvent<HTMLElement>) => {
      const root = event.currentTarget;
      rootRef.current = root;
      const nextFocused = event.relatedTarget as Node | null;
      if (nextFocused != null && root.contains(nextFocused)) {
        // Focus moved to another control of this same field — the input to its
        // calendar toggle, a date segment to its time segment. Nothing has
        // ended, and deciding it here rather than after the fact is what keeps
        // a real browser's focusout/focusin gap from reading as a departure.
        isFocusWithinRef.current = true;
        return;
      }
      isFocusWithinRef.current = false;
      releaseUnlessSurfaceIsOpen();
    },
    [releaseUnlessSurfaceIsOpen],
  );

  useEffect(() => stopObserving, [stopObserving]);

  // Idle: track the resolved value so the next engagement latches what is
  // actually on screen. Adjusting state during render is the sanctioned way to
  // do this — React re-runs this component immediately, before committing, so
  // no extra pass reaches the child tree.
  if (!isBusyRef.current && rendered !== resolved) {
    setRendered(resolved);
  }

  return {
    surface: isBusyRef.current ? rendered : resolved,
    onFocusCapture: handleFocusCapture,
    onBlurCapture: handleBlurCapture,
  };
}
