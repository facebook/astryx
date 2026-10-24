// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file ListReorderHandle.tsx
 * @input The List's reorder session (useListReorder.ts), the gesture system's
 *   long press, the reorder claim values (motion/uikit/reorder.ts), the
 *   translator and theme tokens
 * @output `ListReorderHandle`: the trailing handle of a reorderable List row,
 *   a button that drags its row (held still for a moment by a finger, at
 *   once by a mouse) and moves it with the arrow keys
 * @position ListItem renders it at the end of each row of a List with
 *   `onReorder`; also exported, experimental, from
 *   `@astryxdesign/core/List/experimental` for rows that are not ListItems
 *
 * UIKit's reorder control (iOS 26.2, measured): the three gray lines at the
 * trailing edge of a row in edit mode. A finger held still on it for the
 * scroll view's content-touch delay (150 ms) claims the drag; a flick that
 * starts on it scrolls the table instead. So the handle lets the browser pan
 * vertically and pinch-zoom (`pan-y pinch-zoom`) until the claim, and the
 * long press then holds the touch (the gesture system's blocking listener
 * for a mid-gesture claim: before the claim the page scrolls as usual, after
 * it the finger is the row's). A second finger on the screen before the
 * claim makes it a pinch, the browser's (the page zooms); after the claim
 * extra fingers change nothing. A mouse drags at once.
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
import * as stylex from '@stylexjs/stylex';
import {colorVars} from '../theme/tokens.stylex';
import {focusOutlineProps} from '../utils/focusOutline.stylex';
import {useIsomorphicLayoutEffect} from '../hooks/useIsomorphicLayoutEffect';
import {useTranslator} from '../i18n/useTranslator';
import {LongPressGestureRecognizer} from '../gestures/LongPressGestureRecognizer';
import {useGestureRecognizer} from '../gestures/useGestureRecognizer';
import {reorder} from '../motion/uikit/reorder';
import {
  HANDLE_ATTRIBUTE,
  ListReorderContext,
  type ListReorderController,
} from './useListReorder';

const styles = stylex.create({
  handle: {
    // A reorder control is as tall as its row and at least a touch target
    // wide; the lines sit in its middle.
    alignSelf: 'stretch',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    minWidth: 44,
    minHeight: 44,
    marginBlock: -4,
    marginInlineEnd: -8,
    padding: 0,
    borderWidth: 0,
    borderRadius: 4,
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
    // its pinch-zoom (a flick on the handle scrolls, as on iOS).
    touchAction: 'pan-y pinch-zoom',
    userSelect: 'none',
    WebkitTouchCallout: 'none',
    WebkitTapHighlightColor: 'transparent',
  },
  lines: {
    display: 'block',
    width: 20,
    height: 14,
    pointerEvents: 'none',
  },
});

/**
 * Fingers on the screen, from the document's touch events: `touches` lists
 * every finger, wherever it landed. A handle claims a touch only while it is
 * the only finger: two fingers are the browser's pinch-zoom (WCAG 1.4.4),
 * even when one of them rests on a handle for the hold.
 */
let fingersDown = 0;
const countedDocuments = new WeakSet<Document>();

function countFingers(doc: Document): void {
  if (countedDocuments.has(doc)) {
    return;
  }
  countedDocuments.add(doc);
  const update = (event: TouchEvent) => {
    fingersDown = event.touches.length;
  };
  const options = {capture: true, passive: true};
  doc.addEventListener('touchstart', update, options);
  doc.addEventListener('touchend', update, options);
  doc.addEventListener('touchcancel', update, options);
}

type GestureState = 'began' | 'changed' | 'ended' | 'cancelled';

function stateOf(recognizer: LongPressGestureRecognizer): GestureState | null {
  switch (recognizer.state) {
    case 'began':
    case 'changed':
    case 'ended':
    case 'cancelled':
      return recognizer.state;
    case 'failed':
      return 'cancelled';
    case 'possible':
      return null;
  }
}

function useHandleGestures(
  ref: React.RefObject<HTMLButtonElement | null>,
  controller: ListReorderController | undefined,
  isDisabled: boolean,
): void {
  const isEnabled = controller != null && !isDisabled;
  const onGesture = (recognizer: LongPressGestureRecognizer) => {
    const state = stateOf(recognizer);
    if (state == null || controller == null) {
      return;
    }
    controller.gesture(ref.current?.closest('li') ?? null, {
      state,
      y: recognizer.location().y,
    });
  };
  useEffect(() => {
    const doc = ref.current?.ownerDocument;
    if (doc != null) {
      countFingers(doc);
    }
  }, [ref]);
  // A finger claims after the content-touch delay, if it stayed still and
  // is the only finger on the screen.
  useGestureRecognizer(
    ref,
    () =>
      new LongPressGestureRecognizer({
        name: 'ListReorderHandle.touch',
        minimumPressDuration: reorder.claim.delayMs,
        allowableMovement: reorder.claim.allowableMovement,
        allowedPointerTypes: ['touch', 'pen'],
        shouldBegin: () => fingersDown <= 1,
      }),
    onGesture,
    {manageStyle: false, isEnabled},
  );
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
    onGesture,
    {manageStyle: false, isEnabled},
  );
}

/** @experimental */
export interface ListReorderHandleProps {
  /** The row's label: a string names the handle after it. */
  readonly label: ReactNode;
  /**
   * The row is disabled: the handle stays focusable with
   * `aria-disabled="true"`, and no gesture or key moves the row
   * (spec:AST-085).
   */
  readonly isDisabled?: boolean;
  /**
   * The handle's whole accessible name, for a row whose label does not name
   * it (a record of fields: "Reorder guest 2"). Replaces "Reorder {label}".
   */
  readonly 'aria-label'?: string;
}

/**
 * The reorder handle of a list row. Renders nothing outside a reorder
 * session (`ListReorderContext` with `useListReorder`'s value).
 * @experimental
 */
export function ListReorderHandle({
  label,
  isDisabled = false,
  'aria-label': ariaLabel,
}: ListReorderHandleProps) {
  const context = use(ListReorderContext);
  const ref = useRef<HTMLButtonElement>(null);
  const t = useTranslator();
  const controller = context?.controller;
  useHandleGestures(ref, controller, isDisabled);
  const labelText =
    typeof label === 'string' || typeof label === 'number'
      ? String(label)
      : null;
  const name =
    ariaLabel ??
    (labelText == null
      ? undefined
      : t('@astryx.list.reorderHandle', {label: labelText}));
  const named = name != null;
  // A row without a text label is named after its place, read from the DOM
  // after each commit (the row does not know its index).
  useIsomorphicLayoutEffect(() => {
    const handle = ref.current;
    const row = handle?.closest('li');
    if (named || handle == null || row == null || row.parentElement == null) {
      return;
    }
    const position =
      Array.prototype.indexOf.call(row.parentElement.children, row) + 1;
    handle.setAttribute(
      'aria-label',
      t('@astryx.list.reorderHandleAt', {position}),
    );
  });
  if (context == null) {
    return null;
  }
  return (
    <button
      ref={ref}
      type="button"
      {...{[HANDLE_ATTRIBUTE]: ''}}
      // The handle takes its own press, so the row does not highlight under
      // it (it paints nothing itself).
      data-astryx-pressable=""
      aria-label={name}
      aria-describedby={context.hintId}
      aria-disabled={isDisabled || undefined}
      onKeyDown={(event: KeyboardEvent<HTMLButtonElement>) => {
        if (!isDisabled) {
          controller?.keyDown(ref.current?.closest('li') ?? null, event);
        }
      }}
      onBlur={() => controller?.blur(ref.current?.closest('li') ?? null)}
      // The row's own pointer handling (its swipe) never sees the handle's
      // touches; the gesture system listens on the document, before this.
      onPointerDown={(event: PointerEvent<HTMLButtonElement>) =>
        event.stopPropagation()
      }
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
