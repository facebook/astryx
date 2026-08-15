// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file BottomSheet.tsx
 * @input Uses React, StyleX, theme tokens, core hooks (useScrollLock), utils, useSheetGestures, BottomSheetSwitcherContext
 * @output Exports BottomSheet component and BottomSheetProps
 * @position Lab implementation; consumed by index.ts, tested by BottomSheet.test.tsx, demonstrated in Storybook
 *
 * A mobile touch surface that rises from the bottom edge: grab handle, snap
 * points, and swipe-to-dismiss. Standalone sheets own a native `<dialog>`.
 * Switcher-managed sheets render only their panel layer inside the switcher's
 * one shared `<dialog>`, allowing two panels to animate during a handoff
 * without creating multiple modal boundaries or backdrops.
 *
 * For a standalone sheet, `hasScrim` picks the presentation: `true` (default)
 * uses `showModal()` (top layer, focus trap, scrim, scroll lock, background
 * inert); `false` uses `show()` for a non-modal sheet with no scrim. Inside a
 * BottomSheetSwitcher, the parent owns dialog presentation, focus, scroll
 * lock, and the native ::backdrop. Both standalone modes keep their dialog
 * presented but inert until the slide-out transition ends.
 *
 * The drag/snap/dismiss machinery lives in `useSheetGestures`; the offset
 * geometry lives in the pure, tested `snapOffsets` module. Both are internal
 * to BottomSheet and not exported from the lab entry point.
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/lab/src/BottomSheet/BottomSheet.doc.mjs (props table, features, usage)
 * - /packages/lab/src/BottomSheet/BottomSheet.test.tsx (tests for new/changed behavior)
 * - /packages/lab/src/BottomSheet/BottomSheetSwitcher.tsx (multi-sheet coordination)
 * - /packages/lab/src/BottomSheet/index.ts (exports if types change)
 * - /apps/storybook/stories/BottomSheet.stories.tsx (examples and visual coverage)
 */

import {
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
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
import {BottomSheetSwitcherContext} from './BottomSheetSwitcherContext';

// A non-modal sheet (hasScrim={false}) uses show() instead of showModal(), so
// it isn't in the native top layer and needs an explicit z-index to sit above
// page content. No z-index token exists in the theme; 1000 matches the Drawer
// / app-level overlay convention.
// Detent fractions of the viewport, ascending (peek / mid / full). Detents
// that land within DETENT_DEDUP_PX of each other (e.g. a hug height next to a
// snap) are de-duped in the gesture hook, and any taller than the sheet are
// dropped, so a full set is safe to offer. The shortest is a glance "peek";
// the scrim hides as the sheet collapses onto it (see onScrimOpacity).
const SNAP_FRACTIONS = [0.14, 0.5, 0.92];

/**
 * Height budget for each named size, as a fraction of the viewport:
 * - `hug` — fits its content, never taller than 92%.
 * - `capped` — a scrolling mid-height panel (62%).
 * - `tall` — a pinned near-full panel (92%); use when content streams in so
 *   the sheet doesn't resize under the user.
 */
const HEIGHT_BUDGETS = {
  hug: '92dvh', // upper bound only; the sheet hugs its content beneath it
  capped: '62dvh',
  tall: '92dvh',
} as const;

export type BottomSheetHeight = keyof typeof HEIGHT_BUDGETS;

// px the sheet extends below its budget as reserved padding, revealed by an
// upward overdrag rather than showing a gap.
// SYNC: must match OVERSCROLL_MAX in useSheetGestures.ts (the drag cap).
const OVERSCROLL_PADDING = 48;

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
  // A full-viewport transparent shell: it supplies the top layer, focus trap,
  // and ::backdrop scrim but paints nothing and doesn't clip, so the sheet can
  // translate past fully-open without hitting a fixed dialog edge. It stays
  // hit-testable (no pointer-events:none) so taps on the transparent area
  // reach onClick and dismiss the sheet — the positioner below passes those
  // taps through to here, while the sheet itself re-enables pointer events.
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
    display: 'none',
    outline: 'none',
  },
  dialogOpen: {
    display: 'block',
  },
  // Non-modal (hasScrim={false}) shell: the full-viewport dialog must NOT
  // intercept taps, or it would swallow every click meant for the interactive
  // page behind it. Pointer events pass straight through the transparent shell
  // (and the positioner, which is already none) to the page; the sheet surface
  // re-enables them (styles.sheet -> pointerEvents:auto). This also inherently
  // removes tap-outside-to-dismiss, which is correct when there's no scrim.
  // show() doesn't use the native top layer, so an explicit z-index keeps the
  // sheet above page content.
  //
  // Size to 100% (of the positioning context) rather than the base 100dvw/dvh:
  // a modal sheet is in the top layer so its `fixed` box is always the viewport,
  // but a non-modal `show()` dialog is a normal `fixed` element, so if any
  // ancestor establishes a containing block (transform / filter / contain —
  // e.g. Storybook's Docs preview wrapper), viewport units measured from that
  // shifted origin overflow and mis-anchor the sheet. `inset:0 + 100%` fills
  // whatever the containing block is, so the sheet stays correctly anchored.
  dialogNonModal: {
    pointerEvents: 'none',
    zIndex: 1000,
    width: '100%',
    height: '100%',
  },
  // Opacity is a var the drag handler lowers toward dismissal;
  // @starting-style animates the entrance fade-in.
  // Plain dim, no backdrop blur: bottom sheets on both Material and iOS dim
  // without blurring, so this intentionally diverges from the other overlays
  // (Drawer/Dialog/MobileNav/Lightbox, which share a blur(2px) scrim).
  scrim: {
    '::backdrop': {
      backgroundColor: colorVars['--color-overlay'],
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
  positioner: {
    position: 'absolute',
    insetInline: 0,
    insetBlockEnd: 0,
    display: 'flex',
    justifyContent: 'center',
    pointerEvents: 'none',
  },
  // Both switcher panels share one dialog stacking context. The interactive
  // panel sits above the retained panel while it enters.
  positionerTop: {
    zIndex: 1,
  },
  sheet: {
    pointerEvents: 'auto',
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'column',
    minHeight: 0,
    width: '100%',
    maxWidth: 640,
    backgroundColor: colorVars['--color-background-surface'],
    borderStartStartRadius: radiusVars['--radius-container'],
    borderStartEndRadius: radiusVars['--radius-container'],
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
    transform: {
      default: 'translateY(0)',
      '@starting-style': 'translateY(100%)',
    },
    opacity: 1,
    transitionProperty: 'transform, opacity',
    transitionDuration: durationVars['--duration-medium'],
    transitionTimingFunction: easeVars['--ease-standard'],
    willChange: 'transform, opacity',
    '@media (prefers-reduced-motion: reduce)': {
      transitionDuration: '0.01s',
    },
  },
  sheetClosing: {
    transform: 'translateY(100%)',
  },
  sheetFading: {
    opacity: 0,
  },
  sheetInactive: {
    pointerEvents: 'none',
  },
  handleBar: {
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    // The whole strip is the drag target: 48px (top of the spacing scale,
    // above Apple's 44px / WCAG 2.5.8's 24px), no overlap tricks.
    height: spacingVars['--spacing-12'],
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
    // No overscroll bounce inside the sheet — a pull-down at the top edge is
    // handed off to the sheet drag (see useSheetGestures' touch handling)
    // rather than rubber-banding the content.
    overscrollBehavior: 'none',
    // Allow native vertical scrolling of the content; the at-top pull-down is
    // intercepted via a non-passive touchmove listener, not by blocking
    // touch-action (which would suppress scrolling entirely).
    touchAction: 'pan-y',
  },
  // Both budgets add the overdrag padding back to the height so the visible
  // height (minus the off-screen padding) matches the intended budget.
  budget: {
    height: `calc(var(--_sheet-budget) + ${OVERSCROLL_PADDING}px)`,
  },
  hugHeight: {
    height: 'fit-content',
    maxHeight: `calc(${HEIGHT_BUDGETS.hug} + ${OVERSCROLL_PADDING}px)`,
  },
});

interface BottomSheetSharedProps {
  /**
   * Accessible label for the sheet (required — the sheet has no built-in
   * heading to derive a name from).
   */
  label: string;

  /** Sheet content, rendered below the grab handle in a scrollable area. */
  children: ReactNode;

  /**
   * How tall the sheet is. A named budget, or any explicit height:
   * - `'hug'` — fits its content, never taller than 92% of the viewport.
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

interface StandaloneBottomSheetProps
  extends BottomSheetSharedProps, BaseProps<HTMLDialogElement> {
  /** Ref forwarded to the standalone sheet's <dialog> element. */
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
   * Whether to render a modal scrim behind this standalone sheet.
   * - `true` (default) — `showModal()`: renders in the top layer with a focus
   *   trap, a `::backdrop` scrim, body scroll lock, and tap-scrim-to-dismiss.
   *   The background is inert. Use for focused tasks (filters, forms).
   * - `false`: `show()` renders a viewport-anchored overlay with **no scrim**. It is
   *   still layered above the page, not rendered inline, but the page behind
   *   stays interactive and scrollable (like Material's *standard* bottom
   *   sheet or an iOS undimmed detent). Escape still closes while focus is
   *   inside the sheet, and drag/flick-to-dismiss still work. Use for a peek
   *   surface that coexists with the page (e.g. a panel over a live map).
   *
   * BottomSheetSwitcher owns this setting for switcher-managed sheets.
   * @default true
   */
  hasScrim?: boolean;

  /** Only used for a BottomSheet nested in BottomSheetSwitcher. */
  sheetId?: never;
}

interface SwitcherBottomSheetProps
  extends BottomSheetSharedProps, BaseProps<HTMLDivElement> {
  /** Ref forwarded to this sheet's panel layer in the shared dialog. */
  ref?: React.Ref<HTMLDivElement>;

  /**
   * Unique ID for this sheet within a BottomSheetSwitcher. The
   * switcher opens it when `activeSheet` matches this value.
   */
  sheetId: string;

  /** Supplied by BottomSheetSwitcher when `sheetId` is present. */
  isOpen?: never;

  /** Supplied by BottomSheetSwitcher when `sheetId` is present. */
  onOpenChange?: never;

  /** Supplied by BottomSheetSwitcher for the whole flow. */
  hasScrim?: never;
}

export type BottomSheetProps =
  StandaloneBottomSheetProps | SwitcherBottomSheetProps;

/**
 * A mobile touch sheet that rises from the bottom edge, with a grab handle,
 * drag-to-resize snap points, and swipe-to-dismiss. It owns a native
 * `<dialog>` and, by default (`hasScrim`), enters the top layer with a focus
 * trap + `::backdrop` scrim and locks body scroll; a slow drag settles to the
 * nearest snap point, a flick down dismisses, and Escape closes — so the swipe
 * always has a keyboard equivalent.
 *
 * With `hasScrim={false}` it opens non-modally (`show()`, no scrim), leaving
 * the page behind interactive and scrollable.
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
  isOpen: controlledIsOpen,
  onOpenChange: controlledOnOpenChange,
  sheetId,
  label,
  children,
  height = 'capped',
  hasScrim = true,
  xstyle,
  ...props
}: BottomSheetProps) {
  const switcher = useContext(BottomSheetSwitcherContext);
  const isInsideSwitcher = switcher != null;
  const hasValidSheetId = sheetId != null && sheetId.length > 0;
  const hasSharedScrim = switcher?.hasScrim === true;
  const hasNativeScrim = switcher == null && hasScrim;
  const isModal = hasNativeScrim || hasSharedScrim;
  const onSheetEnterStart = switcher?.onSheetEnterStart;
  const onSheetTransitionComplete = switcher?.onSheetTransitionComplete;
  const registerSheetElement = switcher?.registerSheetElement;
  const registerSheetLabel = switcher?.registerSheetLabel;
  const switcherPhase =
    switcher != null && hasValidSheetId
      ? switcher.getSheetPhase(sheetId)
      : 'hidden';
  const sheetAlignmentOffset =
    switcher != null && hasValidSheetId
      ? switcher.getSheetAlignmentOffset(sheetId)
      : 0;
  const previousSwitcherPhaseRef = useRef(switcherPhase);
  const previousSwitcherPhase = previousSwitcherPhaseRef.current;
  useLayoutEffect(() => {
    previousSwitcherPhaseRef.current = switcherPhase;
  }, [switcherPhase]);
  // Inside a switcher, its single active ID is the only source of truth.
  // This deliberately ignores standalone control props supplied from plain JS
  // so the parent still upholds the maximum-one-active invariant at runtime.
  const isOpen = isInsideSwitcher
    ? switcherPhase === 'active' || switcherPhase === 'entering'
    : (controlledIsOpen ?? false);
  const [isStandalonePresented, setIsStandalonePresented] = useState(
    controlledIsOpen ?? false,
  );
  const isSwitcherInactive =
    isInsideSwitcher &&
    (switcherPhase === 'covered' ||
      switcherPhase === 'aligning' ||
      switcherPhase === 'fading' ||
      switcherPhase === 'exiting');
  const isStandaloneExiting =
    !isInsideSwitcher && !isOpen && isStandalonePresented;
  const isInactive = isSwitcherInactive || isStandaloneExiting;
  const isClosing =
    (isInsideSwitcher && switcherPhase === 'exiting') || isStandaloneExiting;
  const isFading = isInsideSwitcher && switcherPhase === 'fading';
  const retainsGesturePosition =
    isInsideSwitcher &&
    (switcherPhase === 'covered' ||
      switcherPhase === 'aligning' ||
      switcherPhase === 'fading');
  const isTopSheet =
    isInsideSwitcher &&
    (switcherPhase === 'entering' || switcherPhase === 'active');
  const isPresented = isInsideSwitcher
    ? switcherPhase !== 'hidden'
    : isOpen || isStandalonePresented;
  const handleOpenChange = useCallback(
    (nextIsOpen: boolean) => {
      if (switcher != null) {
        if (!hasValidSheetId) {
          return;
        }
        if (nextIsOpen) {
          switcher.onActiveSheetChange(sheetId);
        } else if (switcher.activeSheet === sheetId) {
          // Ignore stale dismissal events from a sheet that has already handed
          // off to another step.
          switcher.onActiveSheetChange(null);
        }
        return;
      }
      controlledOnOpenChange?.(nextIsOpen);
    },
    [controlledOnOpenChange, hasValidSheetId, switcher, sheetId],
  );
  const dialogRef = useRef<HTMLDialogElement | null>(null);
  const triggerRef = useRef<HTMLElement | null>(null);
  const sheetNodeRef = useRef<HTMLDivElement | null>(null);
  const hasPresentedSwitcherSheetRef = useRef(false);
  const close = useCallback(() => handleOpenChange(false), [handleOpenChange]);

  // Set imperatively (not via state) so a 60fps drag doesn't re-render. The
  // hook reports the scrim opacity for the current detent (a faint floor at the peek).
  const handleScrimOpacity = useCallback(
    (opacity: number) => {
      if (switcher != null) {
        switcher.setScrimOpacity(opacity);
      } else {
        dialogRef.current?.style.setProperty(
          '--_sheet-scrim-opacity',
          String(opacity),
        );
      }
    },
    [switcher],
  );

  const {contentProps, handleProps, bodyProps, sheetRef} = useSheetGestures({
    isOpen,
    onDismiss: close,
    snapHeights: defaultSnapHeights,
    onScrimOpacity: handleScrimOpacity,
  });
  const setSheetNode = useCallback(
    (node: HTMLDivElement | null) => {
      sheetRef(node);
      sheetNodeRef.current = node;
      if (hasValidSheetId) {
        registerSheetElement?.(sheetId, node);
      }
    },
    [hasValidSheetId, registerSheetElement, sheetId, sheetRef],
  );

  useLayoutEffect(() => {
    if (!hasValidSheetId) {
      return;
    }
    registerSheetLabel?.(sheetId, label);
    return () => registerSheetLabel?.(sheetId, null);
  }, [hasValidSheetId, label, registerSheetLabel, sheetId]);

  const waitForSheetTransition = useCallback(
    (propertyName: 'transform' | 'opacity', complete: () => void) => {
      const sheet = sheetNodeRef.current;
      let done = false;
      const finish = () => {
        if (done) {
          return;
        }
        done = true;
        clearTimeout(timer);
        sheet?.removeEventListener('transitionend', onEnd);
        complete();
      };
      const onEnd = (event: TransitionEvent) => {
        if (event.target === sheet && event.propertyName === propertyName) {
          finish();
        }
      };
      sheet?.addEventListener('transitionend', onEnd);
      const timer = setTimeout(finish, 450);
      return () => {
        clearTimeout(timer);
        sheet?.removeEventListener('transitionend', onEnd);
      };
    },
    [],
  );

  // A standalone BottomSheet owns presentation and focus restoration for its
  // dialog. Switcher-managed sheets skip this entirely; their parent presents
  // one shared dialog for the complete flow.
  useEffect(() => {
    if (isInsideSwitcher) {
      return;
    }
    const dialog = dialogRef.current;
    if (dialog == null) {
      return;
    }

    if (isOpen) {
      setIsStandalonePresented(true);
      dialog.style.setProperty('--_sheet-scrim-opacity', '1');
      const wasOpen = dialog.open;
      if (!wasOpen) {
        if (hasNativeScrim) {
          triggerRef.current = document.activeElement as HTMLElement | null;
          dialog.showModal();
        } else {
          dialog.show();
        }
      }
      if (!wasOpen) {
        const autofocus = dialog.querySelector<HTMLElement>('[data-autofocus]');
        if (autofocus) {
          autofocus.focus();
        } else if (hasNativeScrim) {
          sheetNodeRef.current?.focus();
        }
      }
      return;
    }

    if (!dialog.open) {
      return;
    }
    if (hasNativeScrim) {
      dialog.style.setProperty('--_sheet-scrim-opacity', '0');
    }
    return waitForSheetTransition('transform', () => {
      if (dialog.open) {
        dialog.close();
      }
      setIsStandalonePresented(false);
      triggerRef.current?.focus();
      triggerRef.current = null;
    });
  }, [hasNativeScrim, isInsideSwitcher, isOpen, waitForSheetTransition]);

  // A switcher child only coordinates its panel phase. The shared dialog is
  // already presented before these passive effects run, so focus and geometry
  // measurements work without opening or closing a child dialog.
  useEffect(() => {
    if (!isInsideSwitcher) {
      return;
    }
    const sheet = sheetNodeRef.current;
    if (sheet == null) {
      return;
    }

    if (isOpen) {
      const wasInteractive =
        previousSwitcherPhase === 'active' ||
        previousSwitcherPhase === 'entering';
      const shouldMoveFocus =
        !hasPresentedSwitcherSheetRef.current || !wasInteractive;
      hasPresentedSwitcherSheetRef.current = true;
      if (shouldMoveFocus) {
        const autofocus = sheet.querySelector<HTMLElement>('[data-autofocus]');
        if (autofocus) {
          autofocus.focus();
        } else if (isModal) {
          sheet.focus();
        }
      }

      if (switcherPhase === 'entering' && hasValidSheetId) {
        onSheetEnterStart?.(sheetId);
        const isReactivatingRetainedSheet =
          previousSwitcherPhase === 'covered' ||
          previousSwitcherPhase === 'aligning' ||
          previousSwitcherPhase === 'fading';
        if (isReactivatingRetainedSheet) {
          onSheetTransitionComplete?.({sheetId, phase: 'entering'});
          return;
        }
        return waitForSheetTransition('transform', () => {
          onSheetTransitionComplete?.({sheetId, phase: 'entering'});
        });
      }
      return;
    }

    if (switcherPhase === 'hidden') {
      hasPresentedSwitcherSheetRef.current = false;
      return;
    }
    if (switcherPhase === 'covered') {
      return;
    }
    if (switcherPhase === 'aligning' && hasValidSheetId) {
      return waitForSheetTransition('transform', () => {
        onSheetTransitionComplete?.({sheetId, phase: 'aligning'});
      });
    }
    if (
      (switcherPhase === 'fading' || switcherPhase === 'exiting') &&
      hasValidSheetId
    ) {
      const propertyName = switcherPhase === 'fading' ? 'opacity' : 'transform';
      return waitForSheetTransition(propertyName, () => {
        onSheetTransitionComplete?.({sheetId, phase: switcherPhase});
      });
    }
  }, [
    hasValidSheetId,
    isInsideSwitcher,
    isModal,
    isOpen,
    onSheetEnterStart,
    onSheetTransitionComplete,
    previousSwitcherPhase,
    sheetId,
    switcherPhase,
    waitForSheetTransition,
  ]);

  useDevWarning(
    'BottomSheet',
    'requires a non-empty `sheetId` when nested in ' +
      'BottomSheetSwitcher; standalone `isOpen` / `onOpenChange` props are ' +
      'ignored there.',
    isInsideSwitcher && !hasValidSheetId,
  );
  useDevWarning(
    'BottomSheet',
    '`sheetId` only works inside BottomSheetSwitcher. Use `isOpen` and ' +
      '`onOpenChange` for a standalone sheet.',
    !isInsideSwitcher && sheetId != null,
  );

  // Only a standalone modal sheet owns its body lock. The switcher keeps
  // its shared lock through the outgoing animation.
  useScrollLock(isPresented && hasNativeScrim);

  // Enforce an accessible name: label is required by types, but a JS caller
  // can still pass an empty string, leaving the sheet unnamed.
  useDevWarning(
    'BottomSheet',
    'requires a non-empty `label` for an accessible name; the open sheet ' +
      'has no built-in heading to derive one from.',
    isOpen && !label,
  );

  const handleCancel = useCallback(
    (event: React.SyntheticEvent<HTMLDialogElement>) => {
      event.preventDefault();
      close();
    },
    [close],
  );
  // Explicit Escape handler in addition to the native `cancel` event, for
  // environments that don't synthesize `cancel` (and the show() path, which
  // never fires `cancel`). Only fires when focus is inside the sheet.
  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLDialogElement>) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        close();
      }
    },
    [close],
  );
  // Tap-outside-to-dismiss only applies to modal sheets (the scrim). A non-modal
  // sheet has no scrim and its transparent shell is pointer-events:none, so taps
  // pass through to the page rather than dismissing.
  const handleClick = useCallback(
    (event: React.MouseEvent<HTMLDialogElement>) => {
      if (hasNativeScrim && event.target === event.currentTarget) {
        close();
      }
    },
    [close, hasNativeScrim],
  );

  const isNamed = typeof height === 'string' && height in HEIGHT_BUDGETS;
  const budget = isNamed
    ? HEIGHT_BUDGETS[height as BottomSheetHeight]
    : typeof height === 'number'
      ? `${height}px`
      : height;
  const isHug = height === 'hug';
  const retainedSheetTransform =
    sheetAlignmentOffset > 0
      ? [contentProps.style.transform, `translateY(${sheetAlignmentOffset}px)`]
          .filter(Boolean)
          .join(' ')
      : contentProps.style.transform;
  const {
    className: switcherLayerClassName,
    style: switcherLayerStyle,
    ...switcherLayerProps
  } = props as BaseProps<HTMLDivElement>;

  const panel = (
    <div
      ref={setSheetNode}
      tabIndex={-1}
      {...mergeProps(
        themeProps('bottom-sheet'),
        stylex.props(
          styles.sheet,
          isHug ? styles.hugHeight : styles.budget,
          isClosing && styles.sheetClosing,
          isFading && styles.sheetFading,
          isInactive && styles.sheetInactive,
          xstyle,
        ),
        undefined,
        {
          ['--_sheet-budget' as string]: budget,
          // A retained sheet starts at the exact detent where the user left
          // it. If the incoming sheet is shorter, add the alignment translation
          // and preserve it through the fade.
          ...(isOpen
            ? contentProps.style
            : retainsGesturePosition
              ? {transform: retainedSheetTransform}
              : {}),
        },
      )}>
      <div
        {...stylex.props(styles.handleBar)}
        {...handleProps}
        aria-hidden="true">
        <div {...stylex.props(styles.handlePill)} />
      </div>
      <div {...stylex.props(styles.body)} {...bodyProps}>
        {children}
      </div>
    </div>
  );

  if (isInsideSwitcher) {
    return (
      <div
        {...switcherLayerProps}
        {...mergeProps(
          stylex.props(styles.positioner, isTopSheet && styles.positionerTop),
          switcherLayerClassName,
          switcherLayerStyle,
        )}
        ref={ref as React.Ref<HTMLDivElement>}
        hidden={!isPresented}
        aria-hidden={isInactive ? 'true' : undefined}
        inert={isInactive ? true : undefined}>
        {panel}
      </div>
    );
  }

  return (
    <dialog
      {...stylex.props(
        styles.dialog,
        isPresented && styles.dialogOpen,
        hasNativeScrim && styles.scrim,
        !hasNativeScrim && styles.dialogNonModal,
      )}
      ref={mergeRefs(ref as React.Ref<HTMLDialogElement>, dialogRef)}
      aria-label={label}
      aria-hidden={isInactive ? 'true' : undefined}
      aria-modal={isModal && isOpen ? 'true' : undefined}
      inert={isInactive ? true : undefined}
      onCancel={handleCancel}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      {...(props as BaseProps<HTMLDialogElement>)}>
      <div {...stylex.props(styles.positioner)}>{panel}</div>
    </dialog>
  );
}

BottomSheet.displayName = 'BottomSheet';
