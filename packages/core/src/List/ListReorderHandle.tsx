// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file ListReorderHandle.tsx
 * @input The List's reorder session (useListReorder.ts, which attaches a
 *   finger's hold from List/ListReorderTouch.ts), the gesture system's long
 *   press for a mouse, the translator and theme tokens
 * @output `ListReorderHandle`: the trailing handle of a reorderable List row,
 *   a button that drags its row (held still for a moment by a finger, at
 *   once by a mouse) and moves it with the arrow keys
 * @position Internal to List; ListItem renders it at the end of each row of
 *   a List with `onReorder`
 *
 * UIKit's reorder control (iOS 26.2, measured): the three gray lines at the
 * trailing edge of a row in edit mode. A finger held still on it for the
 * scroll view's content-touch delay (150 ms) claims the drag (the reorder's
 * touch layer, ListReorderTouch.ts); a flick that starts on it scrolls the
 * table instead, so the handle lets the browser pan vertically and
 * pinch-zoom (`pan-y pinch-zoom`) until the claim. A mouse drags at once.
 *
 *
 * SYNC: When modified, update List/useListReorder.ts and List/ListItem.tsx.
 */

import {
  use,
  useEffect,
  useRef,
  type KeyboardEvent,
  type PointerEvent,
  type ReactNode,
} from 'react';
import {useIsomorphicLayoutEffect} from '../hooks/useIsomorphicLayoutEffect';
import * as stylex from '@stylexjs/stylex';
import {colorVars, focusVars} from '../theme/tokens.stylex';
import {focusOutlineProps} from '../utils/focusOutline.stylex';
import {useTranslator} from '../i18n/useTranslator';
import {LongPressGestureRecognizer} from '../gestures/LongPressGestureRecognizer';
import {useGestureRecognizer} from '../gestures/useGestureRecognizer';
import {
  HANDLE_ATTRIBUTE,
  ListReorderContext,
  type ListReorderController,
} from './useListReorder';

/** A touch target's side: the handle's width and height. */
const HANDLE_SIZE = 44;
/** The three lines' height: the handle's share of its row's height. */
const LINES_HEIGHT = 14;

const styles = stylex.create({
  handle: {
    // A touch target on each side, centred on its row, with the lines in its
    // middle. It takes only the lines' height in the row's layout (the
    // negative block margins), so a compact row stays compact; the target and
    // its focus ring reach past that into the row's padding.
    alignSelf: 'center',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    width: HANDLE_SIZE,
    height: HANDLE_SIZE,
    marginBlock: (LINES_HEIGHT - HANDLE_SIZE) / 2,
    marginInlineEnd: -8,
    padding: 0,
    borderWidth: 0,
    borderRadius: 4,
    // The ring sits inside the handle: the handle reaches the row's inline
    // end, and the list clips what passes it.
    outlineOffset: {
      default: '0',
      ':focus-visible': `calc(-1 * ${focusVars['--focus-outline-width']})`,
    },
    backgroundColor: 'transparent',
    color: {
      default: colorVars['--color-icon-secondary'],
      ':is([aria-disabled="true"])': colorVars['--color-icon-disabled'],
    },
    // Grabbing while its list reorders (a drag holds the pointer). Not
    // `:active`: that is the touch press controller's arm, and the handle
    // paints no press.
    cursor: {
      default: 'grab',
      ':is([data-astryx-reordering] *)': 'grabbing',
      ':is(:disabled,[aria-disabled="true"])': 'default',
    },
    // Until the hold claims the drag, the page keeps its vertical scroll and
    // its pinch-zoom (a flick on the handle scrolls, as on iOS). No text
    // selection under a held finger: the gesture host locks it while the
    // finger is down (the hold's preventsTextSelection), so a mouse keeps
    // the page's selection as it was.
    touchAction: 'pan-y pinch-zoom',
    WebkitTapHighlightColor: 'transparent',
  },
  lines: {
    display: 'block',
    width: 20,
    height: LINES_HEIGHT,
    pointerEvents: 'none',
  },
  slot: {
    flexShrink: 0,
    width: HANDLE_SIZE,
    marginInlineEnd: -8,
  },
});

/**
 * The handle's place, empty: a fixed row's end content stays in the column
 * the movable rows' end content keeps beside their handles.
 */
export function ListReorderSlot() {
  return (
    <span
      aria-hidden="true"
      data-astryx-list-reorder-slot=""
      {...stylex.props(styles.slot)}
    />
  );
}

function useHandleGestures(
  ref: React.RefObject<HTMLButtonElement | null>,
  controller: ListReorderController | undefined,
  isDisabled: boolean,
): void {
  const isEnabled = controller != null && !isDisabled;
  // A finger: the reorder's touch layer, through the session.
  useIsomorphicLayoutEffect(() => {
    const handle = ref.current;
    if (!isEnabled || handle == null || controller == null) {
      return undefined;
    }
    return controller.attachTouch(handle);
  }, [ref, controller, isEnabled]);
  // A mouse drags at once.
  useGestureRecognizer(
    ref,
    () =>
      new LongPressGestureRecognizer({
        name: 'ListReorderHandle.mouse',
        minimumPressDuration: 0,
        allowableMovement: Number.POSITIVE_INFINITY,
        allowedPointerTypes: ['mouse'],
      }),
    recognizer => controller?.recognized(ref.current, recognizer),
    {manageStyle: false, isEnabled},
  );
}

export interface ListReorderHandleProps {
  /** The row's label: a string names the handle after it. */
  readonly label: ReactNode;
  /**
   * The row is disabled: the handle stays focusable with
   * `aria-disabled="true"`, and no gesture or key moves the row
   * (spec:AST-085).
   */
  readonly isDisabled?: boolean;
}

/**
 * The reorder handle of a List row. Renders nothing outside a List with
 * `onReorder`.
 */
export function ListReorderHandle({
  label,
  isDisabled = false,
}: ListReorderHandleProps) {
  const context = use(ListReorderContext);
  const ref = useRef<HTMLButtonElement>(null);
  const t = useTranslator();
  const controller = context?.controller;
  useHandleGestures(ref, controller, isDisabled);
  const named = typeof label === 'string' || typeof label === 'number';
  // A row without a text label is named after its place, read from the DOM
  // after each commit (the row does not know its index). A passive effect:
  // the list's own ref is attached after its rows' layout effects run.
  useEffect(() => {
    const handle = ref.current;
    const position = context?.controller.positionOf(handle) ?? null;
    if (named || handle == null || position == null) {
      return;
    }
    handle.setAttribute(
      'aria-label',
      t('@astryx.list.reorderHandleAt', {position}),
    );
  });
  if (context == null) {
    return null;
  }
  const name = named
    ? t('@astryx.list.reorderHandle', {label: String(label)})
    : undefined;
  return (
    <button
      ref={ref}
      type="button"
      {...{[HANDLE_ATTRIBUTE]: ''}}
      // The handle takes its own press, so the row does not highlight under
      // it (it paints nothing itself).
      data-astryx-pressable=""
      // It rings itself: the row's focus-within ring stays off for it.
      data-astryx-own-ring=""
      aria-label={name}
      aria-describedby={context.hintId}
      aria-disabled={isDisabled || undefined}
      onKeyDown={(event: KeyboardEvent<HTMLButtonElement>) => {
        if (!isDisabled) {
          controller?.keyDown(controller.rowOf(ref.current), event);
        }
      }}
      onBlur={() => controller?.blur(controller.rowOf(ref.current))}
      // The row's own pointer handling (its swipe) never sees the handle's
      // touches; the gesture system listens on the document, before this.
      onPointerDown={(event: PointerEvent<HTMLButtonElement>) => {
        event.stopPropagation();
      }}
      {...focusOutlineProps.focusVisible(styles.handle)}>
      <svg
        aria-hidden="true"
        viewBox="0 0 20 14"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        {...stylex.props(styles.lines)}>
        <path d="M1 1h18M1 7h18M1 13h18" />
      </svg>
    </button>
  );
}

ListReorderHandle.displayName = 'ListReorderHandle';
