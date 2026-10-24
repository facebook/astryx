// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file ListReorderHandle.tsx
 * @input The List's reorder session (useListReorder.ts, which attaches a
 *   finger's hold from List/ListReorderTouch.ts), the gesture system's long
 *   press for a mouse, the translator and theme tokens
 * @output `ListReorderHandle`: the trailing handle of a reorderable List row,
 *   a button that drags its row (held still for a moment by a finger, at
 *   once by a mouse), moves it with the arrow keys, and, activated without a
 *   drag, opens its moves (a DropdownMenu anchored to the handle)
 * @position ListItem renders it at the end of each row of a List with
 *   `onReorder`; also exported, experimental, from the List experimental
 *   subpath for rows that are not ListItems
 *
 * UIKit's reorder control (iOS 26.2, measured): the three gray lines at the
 * trailing edge of a row in edit mode. A finger held still on it for the
 * scroll view's content-touch delay (150 ms) claims the drag (the reorder's
 * touch layer, ListReorderTouch.ts); a flick that starts on it scrolls the
 * table instead, so the handle lets the browser pan vertically and
 * pinch-zoom (`pan-y pinch-zoom`) until the claim. A mouse drags at once.
 *
 * A drag is not everyone's: activating the handle without one — a tap, a
 * click, a screen reader's double tap — opens Move up, Move down, Move to top
 * and Move to bottom (WCAG 2.2 SC 2.5.7, a single pointer and no drag),
 * through the same moves as the keys. A press that dragged opens nothing.
 *
 * SYNC: When modified, update List/useListReorder.ts and List/ListItem.tsx.
 */

import {
  use,
  useEffect,
  useRef,
  useState,
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
import {DropdownMenu} from '../DropdownMenu/DropdownMenu';
import {
  HANDLE_ATTRIBUTE,
  ListReorderContext,
  type ListReorderController,
  type ReorderMove,
} from './useListReorder';

const MOVE_LABELS = {
  up: '@astryx.list.reorderMoveUp',
  down: '@astryx.list.reorderMoveDown',
  top: '@astryx.list.reorderMoveToTop',
  bottom: '@astryx.list.reorderMoveToBottom',
} as const satisfies Record<ReorderMove['kind'], string>;

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
  // Over the handle at the row's end, out of the row's layout.
  menuHost: {
    position: 'absolute',
    insetBlock: 0,
    insetInlineEnd: 0,
    width: HANDLE_SIZE,
    pointerEvents: 'none',
  },
  menuAnchor: {
    display: 'block',
    width: '100%',
    height: '100%',
    outline: 'none',
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
  onDrag: () => void,
): void {
  const isEnabled = controller != null && !isDisabled;
  const onDragRef = useRef(onDrag);
  useIsomorphicLayoutEffect(() => {
    onDragRef.current = onDrag;
  });
  // A finger: the reorder's touch layer, through the session.
  useIsomorphicLayoutEffect(() => {
    const handle = ref.current;
    if (!isEnabled || handle == null || controller == null) {
      return undefined;
    }
    return controller.attachTouch(handle, () => onDragRef.current());
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
    recognizer =>
      controller?.recognized(ref.current, recognizer, onDragRef.current),
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
  // The moves menu exists only while it is open: a mounted menu anchors to
  // the handle, and a dragged handle would then lay out on every move.
  // Mounted closed, then opened, so the menu moves focus into its rows.
  const [menu, setMenu] = useState<'closed' | 'mounting' | 'open'>('closed');
  useEffect(() => {
    if (menu !== 'mounting') {
      return;
    }
    const frame = requestAnimationFrame(() => setMenu('open'));
    return () => cancelAnimationFrame(frame);
  }, [menu]);
  // A press that dragged the row does not also open the moves menu.
  const draggedRef = useRef(false);
  useHandleGestures(ref, controller, isDisabled, () => {
    draggedRef.current = true;
  });
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
  const rowMoves = () =>
    controller?.movesFor(controller.rowOf(ref.current)) ?? [];
  // Activating the handle — a tap, a click, a screen reader's double tap —
  // opens its moves: a way to reorder with a single pointer and no drag
  // (WCAG 2.5.7). The keys keep their own moves (Space picks up).
  return (
    <>
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
        aria-haspopup="menu"
        aria-expanded={menu === 'open'}
        onClick={() => {
          if (draggedRef.current) {
            draggedRef.current = false;
            return;
          }
          if (!isDisabled && menu === 'closed' && rowMoves().length > 0) {
            setMenu('mounting');
          }
        }}
        onKeyDown={(event: KeyboardEvent<HTMLButtonElement>) => {
          if (!isDisabled) {
            controller?.keyDown(controller.rowOf(ref.current), event);
          }
        }}
        onBlur={() => controller?.blur(controller.rowOf(ref.current))}
        // The row's own pointer handling (its swipe) never sees the handle's
        // touches; the gesture system listens on the document, before this.
        onPointerDown={(event: PointerEvent<HTMLButtonElement>) => {
          draggedRef.current = false;
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
      {menu !== 'closed' && (
        // The menu's events stay out of the row (its own press, its keys).
        <span
          onClick={event => event.stopPropagation()}
          onKeyDown={event => event.stopPropagation()}
          onPointerDown={event => event.stopPropagation()}
          {...stylex.props(styles.menuHost)}>
          <DropdownMenu
            isMenuOpen={menu === 'open'}
            onOpenChange={isOpen => {
              if (!isOpen) {
                setMenu('closed');
              }
            }}
            hasChevron={false}
            items={rowMoves().map(move => ({
              id: move.kind,
              label: t(MOVE_LABELS[move.kind]),
              onClick: () =>
                controller?.moveRow(controller.rowOf(ref.current), move.to),
            }))}
            // Anchored over the handle; named after it; focus coming back to
            // it goes on to the handle.
            renderTrigger={trigger => (
              <span
                ref={trigger.ref}
                id={trigger.id}
                tabIndex={-1}
                aria-label={
                  name ?? ref.current?.getAttribute('aria-label') ?? undefined
                }
                onFocus={() => ref.current?.focus({preventScroll: true})}
                {...stylex.props(styles.menuAnchor)}
              />
            )}
          />
        </span>
      )}
    </>
  );
}

ListReorderHandle.displayName = 'ListReorderHandle';
