// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file BottomSheet.tsx
 * @input Uses React, StyleX, theme tokens, core hooks (useScrollLock), utils, useSheetGestures
 * @output Exports BottomSheet component and BottomSheetProps
 * @position Lab implementation; consumed by index.ts, tested by BottomSheet.test.tsx, demonstrated in Storybook
 *
 * A mobile touch surface that rises from the bottom edge: grab handle, snap
 * points, and swipe-to-dismiss. It owns a native modal `<dialog>` directly and
 * composes core primitives (`useScrollLock`, `<dialog>.showModal()` for the
 * top layer + focus trap, a `::backdrop` scrim) rather than delegating to a
 * heavier overlay component — so it controls its own sizing and can render a
 * full-height transparent shell with the visible sheet bottom-anchored inside.
 * That shell is what lets the sheet translate freely (including a little past
 * fully-open) without clipping against a fixed dialog edge.
 *
 * The drag/snap/dismiss machinery lives in `useSheetGestures`; the offset
 * geometry lives in the pure, tested `snapOffsets` module. Both are internal
 * to BottomSheet and not exported from the lab entry point.
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/lab/src/BottomSheet/BottomSheet.doc.mjs (props table, features, usage)
 * - /packages/lab/src/BottomSheet/BottomSheet.test.tsx (tests for new/changed behavior)
 * - /packages/lab/src/BottomSheet/index.ts (exports if types change)
 * - /apps/storybook/stories/BottomSheet.stories.tsx (examples and visual coverage)
 */

import {useCallback, useEffect, useRef, type ReactNode} from 'react';
import * as stylex from '@stylexjs/stylex';
import type {BaseProps} from '@astryxdesign/core';
import {
  colorVars,
  durationVars,
  easeVars,
  radiusVars,
  shadowVars,
  sizeVars,
  spacingVars,
} from '@astryxdesign/core/theme/tokens.stylex';
import {useDevWarning, useScrollLock} from '@astryxdesign/core/hooks';
import {mergeProps, mergeRefs, themeProps} from '@astryxdesign/core/utils';
import {useSheetGestures} from './useSheetGestures';

// Detent fractions of the viewport the sheet can rest at, ascending
// (peek <-> mid <-> full). Near-duplicate detents (e.g. a content-hugging
// height that lands next to one of these) are de-duped downstream, so it's
// safe to offer a full set; the gesture hook keeps only those shorter than
// the rendered sheet.
const SNAP_FRACTIONS = [0.3, 0.6, 0.92];

/**
 * Height budget for each named size, as a fraction of the viewport:
 * - `hug` — fits its content, never taller than 90%.
 * - `capped` — a scrolling mid-height panel (62%).
 * - `tall` — a pinned near-full panel (92%); use when content streams in so
 *   the sheet doesn't resize under the user.
 */
const HEIGHT_BUDGETS = {
  hug: '90dvh', // upper bound only; the sheet hugs its content beneath it
  capped: '62dvh',
  tall: '92dvh',
} as const;

export type BottomSheetHeight = keyof typeof HEIGHT_BUDGETS;

// Sheets on wide touch devices (tablets) shouldn't stretch edge to edge; cap
// and center them. On phones the viewport is narrower than this, so the sheet
// stays full-width.
const MAX_SHEET_WIDTH = 640;

// Overscroll allowance (px): the sheet extends this much lower than its budget
// as reserved bottom padding, so a small upward drag past fully-open reveals
// this padding instead of a gap.
// SYNC: must match OVERSCROLL_MAX in useSheetGestures.ts (the drag cap).
const OVERSCROLL_PADDING = 48;

// Backstop for the slide-out transition when releasing the modal on close, a
// touch above `--duration-medium` (410ms) so `transitionend` normally fires
// first and this only covers environments that don't emit it.
const CLOSE_ANIMATION_MS = 450;

// Grab-handle sizing. The whole strip is the drag target — a generous 48px
// (`--spacing-12`, the top of the scale; above Apple's 44px HIG target and
// twice WCAG 2.2 SC 2.5.8's 24px floor) with the pill centered in it. A full,
// honest strip (no negative-margin overlap tricks) so the target is exactly
// as tall as it looks and can't be undercut by the content below.
const HANDLE_HIT_HEIGHT = spacingVars['--spacing-12']; // 48px target strip

/**
 * Default snap detents in px, resolved against the *visual* viewport (like iOS
 * detents), so a mid rest point is ~half the screen regardless of the sheet's
 * own height budget. Read lazily at drag start (no persistent listener) so it
 * reflects the live viewport after a rotation or the virtual keyboard opening.
 * SSR-safe: returns `[]` off the client.
 */
function defaultSnapHeights(): number[] {
  if (typeof window === 'undefined') {
    return [];
  }
  const vh = window.visualViewport?.height ?? window.innerHeight;
  return SNAP_FRACTIONS.map(f => f * vh);
}

const styles = stylex.create({
  // The modal <dialog> is a full-viewport, transparent shell. It provides the
  // top layer + focus trap + ::backdrop scrim, but paints nothing itself and
  // does not clip — so the sheet inside can translate freely (including a
  // little past fully-open) without hitting a fixed dialog edge.
  dialog: {
    position: 'fixed',
    inset: 0,
    width: '100dvw',
    height: '100dvh',
    maxWidth: 'none',
    maxHeight: 'none',
    margin: 0,
    padding: 0,
    border: 'none',
    backgroundColor: 'transparent',
    overflow: 'visible',
    // Let touches fall through the empty area above the sheet to the scrim.
    pointerEvents: 'none',
    display: 'none',
    outline: 'none',
  },
  dialogOpen: {
    display: 'block',
  },
  // The ::backdrop scrim, owned here so the drag-fade is first-class. Opacity
  // is driven by a custom property the gesture handler lowers as a drag nears
  // dismissal; @starting-style animates the entrance fade-in.
  scrim: {
    '::backdrop': {
      backgroundColor: colorVars['--color-overlay'],
      backdropFilter: 'blur(2px)',
      opacity: {
        default: 'var(--_sheet-scrim-opacity, 1)',
        '@starting-style': 0,
      },
      transitionProperty: 'opacity, display',
      transitionDuration: durationVars['--duration-medium'],
      transitionTimingFunction: easeVars['--ease-standard'],
      transitionBehavior: 'allow-discrete',
      '@media (prefers-reduced-motion: reduce)': {
        transitionDuration: '0.01s',
      },
    },
  },
  // Positions the sheet at the bottom edge of the transparent shell and
  // re-enables pointer events on the sheet itself.
  positioner: {
    position: 'absolute',
    insetInline: 0,
    insetBlockEnd: 0,
    display: 'flex',
    justifyContent: 'center',
    pointerEvents: 'none',
  },
  // The visible sheet surface: background, rounded top, width cap. Carries the
  // live drag translate (via contentProps) and the slide-in on open.
  sheet: {
    pointerEvents: 'auto',
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'column',
    minHeight: 0,
    width: '100%',
    maxWidth: MAX_SHEET_WIDTH,
    backgroundColor: colorVars['--color-background-surface'],
    borderStartStartRadius: radiusVars['--radius-page'],
    borderStartEndRadius: radiusVars['--radius-page'],
    boxShadow: shadowVars['--shadow-high'],
    // tabIndex=-1 makes this the initial focus target; it's a programmatic
    // landing spot, not an interactive control, so suppress the focus ring.
    outline: 'none',
    overflow: 'hidden',
    // Reserved overdrag zone: extra bottom padding (surface bg + home-indicator
    // clearance) that a small upward drag reveals, negated by an equal negative
    // margin so at rest it sits BELOW the fold — the true sheet stays pinned to
    // the bottom edge. Budget heights add the same amount back (see `budget` /
    // `hugHeight`) so the visible height is unchanged.
    paddingBlockEnd: `calc(env(safe-area-inset-bottom, 0px) + ${OVERSCROLL_PADDING}px)`,
    marginBlockEnd: `${-OVERSCROLL_PADDING}px`,
    // Slide in from below on open; @starting-style covers the entry.
    transform: {
      default: 'translateY(0)',
      '@starting-style': 'translateY(100%)',
    },
    transitionProperty: 'transform',
    transitionDuration: durationVars['--duration-medium'],
    transitionTimingFunction: easeVars['--ease-standard'],
    willChange: 'transform',
    '@media (prefers-reduced-motion: reduce)': {
      transitionDuration: '0.01s',
    },
  },
  // Closing: slide back down under the bottom edge.
  sheetClosing: {
    transform: 'translateY(100%)',
  },
  handleBar: {
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    // The full strip is the drag target — tall and centered so it's easy to
    // grab and reads clearly as the resize affordance.
    height: HANDLE_HIT_HEIGHT,
    touchAction: 'none',
    cursor: 'grab',
  },
  handlePill: {
    width: sizeVars['--size-element-lg'],
    height: spacingVars['--spacing-1'],
    borderRadius: radiusVars['--radius-full'],
    backgroundColor: colorVars['--color-border'],
  },
  body: {
    flexGrow: 1,
    minHeight: 0,
    overflowY: 'auto',
    overscrollBehavior: 'contain',
    // Allow native vertical scrolling of the content; the overscroll-at-top
    // pull-down is handled via pointer events, not by blocking touch-action.
    touchAction: 'pan-y',
  },
  // `hug` fits the content instead of filling the budget; the budget becomes
  // an upper bound (90%). Both budgets add the overdrag padding back to the
  // height so the visible sheet (height minus the off-screen padding) matches
  // the intended budget.
  budget: {
    height: `calc(var(--_sheet-budget) + ${OVERSCROLL_PADDING}px)`,
  },
  hugHeight: {
    height: 'fit-content',
    maxHeight: `calc(${HEIGHT_BUDGETS.hug} + ${OVERSCROLL_PADDING}px)`,
  },
});

export interface BottomSheetProps extends BaseProps<HTMLDialogElement> {
  /** Ref forwarded to the underlying <dialog> element. */
  ref?: React.Ref<HTMLDialogElement>;

  /** Whether the sheet is open. Fully controlled — pair with `onOpenChange`. */
  isOpen: boolean;

  /**
   * Called when the sheet opens or closes. The boolean is the requested next
   * state (`false` on Escape, scrim click, or a swipe past the dismiss
   * threshold). The caller owns the open state.
   */
  onOpenChange: (isOpen: boolean) => void;

  /**
   * Accessible label for the sheet (required — the sheet has no built-in
   * heading to derive a name from).
   */
  label: string;

  /** Sheet content, rendered below the grab handle in a scrollable area. */
  children: ReactNode;

  /**
   * How tall the sheet is. A named budget, or any explicit height:
   * - `'hug'` — fits its content, never taller than 90% of the viewport.
   * - `'capped'` — a scrolling mid-height panel (~62%).
   * - `'tall'` — a pinned near-full panel (~92%); use when content streams in
   *   so the sheet doesn't resize under the user.
   * - a `number` (px) or CSS length string (e.g. `'70dvh'`, `480`) for a
   *   custom budget.
   *
   * The user can still drag between snap points regardless of the starting
   * height. On viewports shorter than the budget the sheet fills the
   * available height.
   * @default 'capped'
   */
  height?: BottomSheetHeight | number | string;

  /** Test ID for the root element. */
  'data-testid'?: string;
}

/**
 * A mobile touch sheet that rises from the bottom edge, with a grab handle,
 * drag-to-resize snap points, and swipe-to-dismiss. It owns a native modal
 * `<dialog>` (top layer, focus trap, `::backdrop` scrim) and locks body scroll
 * while open; a slow drag settles to the nearest snap point, a flick down
 * dismisses, and Escape closes — so the swipe always has a keyboard
 * equivalent.
 *
 * @example
 * ```
 * const [isOpen, setIsOpen] = useState(false);
 * <BottomSheet
 *   isOpen={isOpen}
 *   onOpenChange={setIsOpen}
 *   label="Filters">
 *   <FilterControls />
 * </BottomSheet>
 * ```
 */
export function BottomSheet({
  ref,
  isOpen,
  onOpenChange,
  label,
  children,
  height = 'capped',
  xstyle,
  ...props
}: BottomSheetProps) {
  const dialogRef = useRef<HTMLDialogElement | null>(null);
  const triggerRef = useRef<HTMLElement | null>(null);
  const sheetNodeRef = useRef<HTMLDivElement | null>(null);
  const close = useCallback(() => onOpenChange(false), [onOpenChange]);

  // Drive the scrim opacity from drag progress via a CSS variable on the
  // <dialog>, set imperatively so a 60fps drag doesn't re-render React. The
  // ::backdrop reads this var, fading out as a drag nears dismissal to signal
  // that releasing will close.
  const handleDragProgress = useCallback((dismissProgress: number) => {
    dialogRef.current?.style.setProperty(
      '--_sheet-scrim-opacity',
      String(1 - dismissProgress),
    );
  }, []);

  const {contentProps, handleProps, bodyProps, sheetRef} = useSheetGestures({
    isOpen,
    onDismiss: close,
    snapHeights: defaultSnapHeights,
    onDragProgress: handleDragProgress,
  });

  // Open/close the native modal dialog. showModal() puts it in the top layer
  // with a focus trap and ::backdrop; on close we restore focus to the opener.
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) {
      return;
    }
    if (isOpen) {
      triggerRef.current = document.activeElement as HTMLElement | null;
      dialog.style.setProperty('--_sheet-scrim-opacity', '1');
      if (!dialog.open) {
        dialog.showModal();
        // Match Dialog's focus contract: land initial focus at the top of the
        // sheet (its panel) so assistive tech reads from the label rather than
        // jumping into the first control — unless a descendant opts in with
        // `data-autofocus`. showModal() focuses the first tabbable element by
        // default, so we override that here.
        const autofocus = dialog.querySelector<HTMLElement>('[data-autofocus]');
        if (autofocus) {
          autofocus.focus();
        } else {
          sheetNodeRef.current?.focus();
        }
      }
    } else if (dialog.open) {
      // Animate out before releasing the top layer: the `sheetClosing` style
      // (applied on this render because isOpen is false) slides the sheet back
      // down; we wait for that transition to finish, then close() and restore
      // focus. A timeout backstops browsers/environments that don't fire
      // transitionend (e.g. reduced motion, or the tab hidden).
      const sheet = sheetNodeRef.current;
      let done = false;
      const finish = () => {
        if (done) {
          return;
        }
        done = true;
        clearTimeout(timer);
        sheet?.removeEventListener('transitionend', onEnd);
        if (dialog.open) {
          dialog.close();
        }
        triggerRef.current?.focus();
        triggerRef.current = null;
      };
      const onEnd = (event: TransitionEvent) => {
        if (event.target === sheet && event.propertyName === 'transform') {
          finish();
        }
      };
      sheet?.addEventListener('transitionend', onEnd);
      const timer = setTimeout(finish, CLOSE_ANIMATION_MS);
      return () => {
        clearTimeout(timer);
        sheet?.removeEventListener('transitionend', onEnd);
      };
    }
  }, [isOpen]);

  useScrollLock(isOpen);

  // Enforce an accessible name, like a modal Dialog: the sheet has no built-in
  // heading to derive one from, so an empty `label` leaves it unnamed for
  // assistive tech. `label` is a required prop, but JS callers can still pass
  // an empty string — warn in development.
  useDevWarning(
    'BottomSheet',
    'requires a non-empty `label` for an accessible name; the open sheet ' +
      'has no built-in heading to derive one from.',
    isOpen && !label,
  );

  // Native Escape (dialog `cancel`) and scrim click both request close.
  const handleCancel = useCallback(
    (event: React.SyntheticEvent<HTMLDialogElement>) => {
      event.preventDefault();
      close();
    },
    [close],
  );
  // Escape via keydown as well: the native <dialog> `cancel` event covers
  // browsers, but keeping an explicit handler makes dismissal robust (and
  // testable) even where `cancel` isn't synthesized.
  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLDialogElement>) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        close();
      }
    },
    [close],
  );
  // A click whose target is the <dialog> itself is a ::backdrop (scrim) click;
  // clicks on the sheet content target the sheet, not the dialog.
  const handleClick = useCallback(
    (event: React.MouseEvent<HTMLDialogElement>) => {
      if (event.target === event.currentTarget) {
        close();
      }
    },
    [close],
  );

  // Resolve the height budget: a named key maps to its viewport fraction, and
  // any other value (px number or CSS length) passes straight through.
  const isNamed = typeof height === 'string' && height in HEIGHT_BUDGETS;
  const budget = isNamed
    ? HEIGHT_BUDGETS[height as BottomSheetHeight]
    : typeof height === 'number'
      ? `${height}px`
      : height;
  const isHug = height === 'hug';

  return (
    <dialog
      {...mergeProps(
        themeProps('bottom-sheet'),
        stylex.props(styles.dialog, isOpen && styles.dialogOpen, styles.scrim),
      )}
      ref={mergeRefs(ref, dialogRef)}
      aria-label={label}
      aria-modal="true"
      onCancel={handleCancel}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      {...props}>
      <div {...stylex.props(styles.positioner)}>
        <div
          ref={mergeRefs(sheetRef, sheetNodeRef)}
          data-astryx-sheet=""
          tabIndex={-1}
          {...mergeProps(
            stylex.props(
              styles.sheet,
              isHug ? styles.hugHeight : styles.budget,
              !isOpen && styles.sheetClosing,
              xstyle,
            ),
            {
              style: {
                ['--_sheet-budget' as string]: budget,
                ...contentProps.style,
              },
            },
          )}>
          <div
            data-astryx-sheet-handle=""
            {...stylex.props(styles.handleBar)}
            {...handleProps}
            aria-hidden="true">
            <div {...stylex.props(styles.handlePill)} />
          </div>
          <div
            data-astryx-sheet-body=""
            {...stylex.props(styles.body)}
            {...bodyProps}>
            {children}
          </div>
        </div>
      </div>
    </dialog>
  );
}

BottomSheet.displayName = 'BottomSheet';
