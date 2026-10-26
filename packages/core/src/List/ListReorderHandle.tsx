// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file ListReorderHandle.tsx
 * @input The List's reorder session (List/listReorderEngine.tsx, through
 *   ListContext's `reorder`), the translator and theme tokens
 * @output `ListReorderHandle` and `reorderRowStyle`: the trailing handle of a
 *   reorderable List row,
 *   a button that a finger (held still for a moment, where the primary
 *   pointer is coarse) or a mouse drags, whose Space or Enter picks the row
 *   up for the arrow keys, and which, activated without a drag (a tap, a
 *   click, a screen reader's double tap), opens its row's Move before and
 *   Move after in the list's menu; and the style of a row that has one
 * @position Part of the reorder machinery that createReorderable carries:
 *   ListItem renders it, from the List's context, at the end of each row
 *   that can move
 *
 * UIKit's reorder control (iOS 26.2, measured): the three gray lines at the
 * trailing edge of a row in edit mode. A finger held still on it for the
 * scroll view's content-touch delay (150 ms) claims the drag; a flick that
 * starts on it scrolls the table instead, so the handle lets the browser pan
 * vertically and pinch-zoom (`pan-y pinch-zoom`) until the claim. All of that
 * applies only where the primary pointer is coarse (spec:AST-094 FR19);
 * elsewhere a finger gets the browser's defaults. The handle is the one
 * element the reorder adds to a row (spec:AST-103 FR5): its lines are a
 * pseudo-element, and it listens to nothing itself. The list's listeners
 * (the session's) take its drags; its keys and click go through React's.
 * A drag is not everyone's: its activation opens Move before and Move
 * after (FR4; WCAG 2.2 SC 2.5.7, a single pointer and no drag), each one
 * committed move. Space and Enter pick up instead, and a press that
 * dragged opens nothing.
 *
 * SYNC: When modified, update List/listReorderEngine.tsx and
 * List/ListItem.tsx.
 */

import {
  isValidElement,
  use,
  useEffect,
  useRef,
  type KeyboardEvent,
  type ReactNode,
} from 'react';
import {useIsomorphicLayoutEffect} from '../hooks/useIsomorphicLayoutEffect';
import * as stylex from '@stylexjs/stylex';
import {colorVars, focusVars} from '../theme/tokens.stylex';
import {
  focusOutlineProps,
  ownRingContainerStyles,
} from '../utils/focusOutline.stylex';
import {useTranslator} from '../i18n/useTranslator';
import {ListContext} from './ListContext';
import {
  HANDLE_ATTRIBUTE,
  type ListReorderHandleProps,
} from './listReorderContext';
import type {ListReorderController} from './listReorderEngine';

/** A touch target's side: the handle's width and height. */
const HANDLE_SIZE = 44;
/** The three lines' height: the handle's share of its row's height. */
const LINES_HEIGHT = 14;
/** The lines' length and thickness, and the distance between them. */
const LINE_WIDTH = 20;
const LINE_THICKNESS = 2;
const LINE_GAP = (LINES_HEIGHT - LINE_THICKNESS) / 2;

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
    // Where the primary pointer is coarse: until the hold claims the drag,
    // the page keeps its vertical scroll and its pinch-zoom (a flick on the
    // handle scrolls, as on iOS). No text selection under a held finger: the
    // hold's selection lock holds it while the finger is down, so a mouse
    // keeps the page's selection as it was. Where it is fine, a finger gets
    // the browser's defaults.
    touchAction: {
      default: null,
      '@media (pointer: coarse)': 'pan-y pinch-zoom',
    },
    WebkitTapHighlightColor: {
      default: null,
      '@media (pointer: coarse)': 'transparent',
    },
    // The three lines: one bar and its two shadows, in the handle's color.
    // Forced colors keep them (shadows and backgrounds go there otherwise),
    // drawn in the system's button text.
    '::before': {
      content: '""',
      display: 'block',
      width: LINE_WIDTH,
      height: LINE_THICKNESS,
      borderRadius: LINE_THICKNESS / 2,
      backgroundColor: 'currentColor',
      boxShadow: `0 -${LINE_GAP}px currentColor, 0 ${LINE_GAP}px currentColor`,
      forcedColorAdjust: 'none',
      pointerEvents: 'none',
    },
  },
});

/**
 * The style of a row that ends with a handle (ListItem applies it): its ring
 * on focus within stays off for the handle, which rings itself.
 */
export const reorderRowStyle = ownRingContainerStyles.focusWithin;

/**
 * The text a label shows: its strings and numbers, through its elements'
 * children, with runs of space collapsed. Empty when it shows none (an icon,
 * an image).
 */
function textOf(node: ReactNode): string {
  if (typeof node === 'string' || typeof node === 'number') {
    return String(node);
  }
  if (Array.isArray(node)) {
    return node.map(textOf).join('');
  }
  if (isValidElement<{children?: ReactNode}>(node)) {
    return textOf(node.props.children);
  }
  return '';
}

/**
 * The reorder handle of a List row. Renders nothing outside a reorderable
 * List.
 */
export function ListReorderHandle({
  label,
  itemKey,
  isDisabled = false,
}: ListReorderHandleProps) {
  const ref = useRef<HTMLButtonElement>(null);
  const t = useTranslator();
  const controller = use(ListContext)?.reorder?.session as
    ListReorderController | undefined;
  // The session moves the row only with its handle recorded, and reports its
  // moves with the row's key.
  useIsomorphicLayoutEffect(
    () => controller?.registerHandle(ref.current, itemKey),
    [controller, itemKey],
  );
  const isEnabled = controller != null && !isDisabled;
  // The row the handle sits in, read after each commit: the list's own ref is
  // attached after its rows' layout effects run, and by the cleanup below the
  // handle may already be out of the row.
  const rowRef = useRef<HTMLElement | null>(null);
  useEffect(() => {
    rowRef.current = controller?.rowOf(ref.current) ?? null;
  });
  // A handle that stops taking gestures mid-drag (its row disabled or no
  // longer reorderable, the handle gone) sends a drag of its row home,
  // whichever pointer or key drives it.
  useIsomorphicLayoutEffect(() => {
    if (!isEnabled || controller == null) {
      return undefined;
    }
    return () => controller.release(rowRef.current);
  }, [controller, isEnabled]);
  // Named after the row's label text, an element's included ("Reorder
  // Custom Name"); a label that shows no text names it after its place.
  const text = textOf(label).replace(/\s+/g, ' ').trim();
  const named = text !== '';
  // That place is read from the DOM after each commit (the row does not
  // know its index). A passive effect: the list's own ref is attached after
  // its rows' layout effects run.
  useEffect(() => {
    const handle = ref.current;
    const position = controller?.positionOf(handle) ?? null;
    if (named || handle == null || position == null) {
      return;
    }
    handle.setAttribute(
      'aria-label',
      t('@astryx.list.reorderHandleAt', {position}),
    );
  });
  if (controller == null) {
    return null;
  }
  const name = named
    ? t('@astryx.list.reorderHandle', {label: text})
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
      aria-describedby={controller.hintId}
      aria-disabled={isDisabled || undefined}
      aria-haspopup="menu"
      onClick={() => {
        if (!controller.takeDrag(ref.current) && !isDisabled) {
          controller.requestMoves(ref.current);
        }
      }}
      onKeyDown={(event: KeyboardEvent<HTMLButtonElement>) => {
        if (!isDisabled) {
          controller.keyDown(controller.rowOf(ref.current), event);
        }
      }}
      // Space picks up (on its keydown); its keyup makes no click.
      onKeyUp={(event: KeyboardEvent<HTMLButtonElement>) => {
        if (event.key === ' ') {
          event.preventDefault();
        }
      }}
      onBlur={() => controller.blur(controller.rowOf(ref.current))}
      // The row's own pointer handling (its swipe) never sees the handle's
      // presses: the list's listeners have them, before this.
      onPointerDown={event => event.stopPropagation()}
      {...focusOutlineProps.focusVisible(styles.handle)}
    />
  );
}

ListReorderHandle.displayName = 'ListReorderHandle';
