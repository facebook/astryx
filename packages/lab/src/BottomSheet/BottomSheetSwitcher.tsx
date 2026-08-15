// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file BottomSheetSwitcher.tsx
 * @input Uses React context, React DOM portals, StyleX, theme tokens, focus/scroll-lock hooks, BottomSheetSwitcherContext
 * @output Exports BottomSheetSwitcher and BottomSheetSwitcherProps
 * @position Lab switcher for mutually exclusive BottomSheet flows
 *
 * The switcher turns a set of declaratively nested BottomSheets into a
 * controlled single-selection group: `activeSheet` names the one interactive
 * child, or is null when the flow is closed. During a handoff the new sheet
 * enters above the previous sheet. If it is shorter, the previous sheet moves
 * down at the same time until their top edges align; otherwise it stays
 * stationary. The previous sheet fades only after both motions complete. The
 * switcher also owns the flow's one shared scrim, focus trap, and scroll
 * lock, so handoffs never stack backdrops. Its visual layer is portaled to
 * document.body so containing blocks cannot clip or displace it.
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/lab/src/BottomSheet/BottomSheet.tsx
 * - /packages/lab/src/BottomSheet/BottomSheetSwitcher.doc.mjs
 * - /packages/lab/src/BottomSheet/BottomSheetSwitcher.test.tsx
 * - /packages/lab/src/BottomSheet/index.ts
 * - /apps/storybook/stories/BottomSheetSwitcher.stories.tsx
 */

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import {createPortal} from 'react-dom';
import * as stylex from '@stylexjs/stylex';
import {
  colorVars,
  durationVars,
  easeVars,
} from '@astryxdesign/core/theme/tokens.stylex';
import {useFocusTrap, useScrollLock} from '@astryxdesign/core/hooks';
import {mergeProps, themeProps} from '@astryxdesign/core/utils';
import {
  BottomSheetSwitcherContext,
  type BottomSheetSwitcherTransitionEvent,
  type BottomSheetSwitcherPhase,
  type BottomSheetSwitcherContextValue,
} from './BottomSheetSwitcherContext';

const styles = stylex.create({
  contents: {
    display: 'contents',
  },
  scrim: {
    position: 'fixed',
    inset: 0,
    // Switcher-managed sheets use z-index 1000 (the existing app-overlay
    // convention), so the one shared scrim sits immediately beneath them.
    zIndex: 999,
    backgroundColor: colorVars['--color-overlay'],
    opacity: {
      default: 'var(--_sheet-scrim-opacity, 1)',
      '@starting-style': 0,
    },
    transitionProperty: 'opacity',
    transitionDuration: durationVars['--duration-medium'],
    transitionTimingFunction: easeVars['--ease-standard'],
    '@media (prefers-reduced-motion: reduce)': {
      transitionDuration: '0.01s',
    },
  },
});

type RetainedSheetPhase = 'covered' | 'aligning' | 'fading' | 'exiting';

interface SheetTransitionState {
  enteringSheet: string | null;
  retainedSheet: string | null;
  retainedPhase: RetainedSheetPhase | null;
  alignmentOffset: number;
  isAlignmentComplete: boolean;
}

const IDLE_TRANSITION: SheetTransitionState = {
  enteringSheet: null,
  retainedSheet: null,
  retainedPhase: null,
  alignmentOffset: 0,
  isAlignmentComplete: false,
};

const ALIGNMENT_THRESHOLD_PX = 1;

function transitionForActiveSheetChange(
  previousSheet: string | null,
  nextSheet: string | null,
): SheetTransitionState {
  if (previousSheet == null) {
    return IDLE_TRANSITION;
  }
  if (nextSheet == null) {
    return {
      enteringSheet: null,
      retainedSheet: previousSheet,
      retainedPhase: 'exiting',
      alignmentOffset: 0,
      isAlignmentComplete: false,
    };
  }
  return {
    enteringSheet: nextSheet,
    retainedSheet: previousSheet,
    retainedPhase: 'covered',
    alignmentOffset: 0,
    isAlignmentComplete: false,
  };
}

function alignmentOffsetForElements(
  enteringElement: HTMLElement | undefined,
  retainedElement: HTMLElement | undefined,
): number {
  if (enteringElement == null || retainedElement == null) {
    return 0;
  }
  // The panels share a bottom edge, so the positive difference between their
  // rendered top edges is exactly how far the taller retained sheet must move
  // down to sit completely behind the shorter entering sheet. Measuring the
  // rendered rects also accounts for a retained sheet's current drag detent.
  const enteringPositioner = enteringElement.parentElement;
  const enteringTop =
    enteringPositioner?.getBoundingClientRect().top ??
    enteringElement.getBoundingClientRect().top;
  return Math.max(0, enteringTop - retainedElement.getBoundingClientRect().top);
}

export interface BottomSheetSwitcherProps {
  /**
   * ID of the interactive BottomSheet, or null when the flow should close.
   * Must match a nested BottomSheet's `sheetId`. The previous sheet may remain
   * visually present and inert while the new sheet enters, moving downward at
   * the same time if the new sheet is shorter, then fade away.
   */
  activeSheet: string | null;

  /**
   * Called when the active BottomSheet requests dismissal, with null. Callers
   * can pass the same callback (or its state setter) to controls that move the
   * flow to another sheet ID.
   */
  onActiveSheetChange: (sheetId: string | null) => void;

  /**
   * Whether the switcher renders one shared scrim and treats the active
   * sheet as modal. Disable for a non-modal multi-sheet flow.
   * @default true
   */
  hasScrim?: boolean;

  /** BottomSheets identified by unique `sheetId` values. */
  children: ReactNode;
}

/**
 * Coordinates a set of BottomSheets so zero or one is active at a time, with
 * one shared scrim for the complete flow. On a sheet-to-sheet handoff, the
 * previous sheet remains inert while the new sheet enters above it. A taller
 * previous sheet simultaneously moves down behind a shorter new sheet, then
 * fades after both transforms complete.
 *
 * @example
 * ```
 * const [activeSheet, setActiveSheet] = useState<string | null>(null);
 *
 * <BottomSheetSwitcher
 *   activeSheet={activeSheet}
 *   onActiveSheetChange={setActiveSheet}>
 *   <BottomSheet sheetId="details" label="Details">
 *     <Button
 *       label="Continue"
 *       onClick={() => setActiveSheet('confirm')}
 *     />
 *   </BottomSheet>
 *   <BottomSheet sheetId="confirm" label="Confirm">
 *     <Button label="Done" onClick={() => setActiveSheet(null)} />
 *   </BottomSheet>
 * </BottomSheetSwitcher>
 * ```
 */
export function BottomSheetSwitcher({
  activeSheet,
  onActiveSheetChange,
  hasScrim = true,
  children,
}: BottomSheetSwitcherProps) {
  // The opener belongs to the flow, not an individual sheet. Keeping it here
  // means sheet-to-sheet handoffs do not replace it with a control in the
  // previous sheet; focus returns to the original trigger when the flow ends.
  const triggerRef = useRef<HTMLElement | null>(null);
  const scrimRef = useRef<HTMLDivElement | null>(null);
  const sheetElementsRef = useRef(new Map<string, HTMLElement>());
  const committedActiveSheetRef = useRef(activeSheet);
  const [portalTarget, setPortalTarget] = useState<HTMLElement | null>(null);
  const [unmountedSheetIds, setUnmountedSheetIds] = useState<
    ReadonlySet<string>
  >(() => new Set());
  const [transition, setTransition] =
    useState<SheetTransitionState>(IDLE_TRANSITION);

  // Switcher-managed sheets use show(), so they do not enter the native top
  // layer. Portal the complete visual layer to body to keep transformed,
  // contained, or overflow-clipped application ancestors from displacing the
  // viewport scrim and sheets. Waiting until layout keeps server and initial
  // client markup aligned while still mounting the portal before paint.
  useLayoutEffect(() => {
    setPortalTarget(document.body);
  }, []);

  // Derive the handoff during the very render in which the controlled prop
  // changes. Children therefore see `entering` / `covered` immediately and
  // never briefly hide before the layout effect commits the transition.
  const activeSheetChanged = committedActiveSheetRef.current !== activeSheet;
  const visibleTransition = activeSheetChanged
    ? transitionForActiveSheetChange(
        committedActiveSheetRef.current,
        activeSheet,
      )
    : transition;
  const isFlowVisible =
    (activeSheet != null && !unmountedSheetIds.has(activeSheet)) ||
    (visibleTransition.retainedSheet != null &&
      !unmountedSheetIds.has(visibleTransition.retainedSheet));
  const isModal = hasScrim && isFlowVisible;

  useLayoutEffect(() => {
    const previousActiveSheet = committedActiveSheetRef.current;
    if (previousActiveSheet === activeSheet) {
      return;
    }
    committedActiveSheetRef.current = activeSheet;
    const nextTransition = transitionForActiveSheetChange(
      previousActiveSheet,
      activeSheet,
    );
    // A consumer may conditionally remove the active BottomSheet in the same
    // update that closes the flow. With no retained element there can be no
    // transitionend event, so do not retain an animation state that would keep
    // the shared scrim and body scroll lock mounted forever.
    setTransition(
      nextTransition.retainedSheet != null &&
        !sheetElementsRef.current.has(nextTransition.retainedSheet)
        ? IDLE_TRANSITION
        : nextTransition,
    );
  }, [activeSheet]);

  const close = useCallback(
    () => onActiveSheetChange(null),
    [onActiveSheetChange],
  );
  const {containerRef} = useFocusTrap<HTMLDivElement>({
    isActive: isModal,
    onEscape: close,
  });
  useScrollLock(isModal);

  const getSheetPhase = useCallback(
    (sheetId: string): BottomSheetSwitcherPhase => {
      if (sheetId === activeSheet) {
        return sheetId === visibleTransition.enteringSheet
          ? 'entering'
          : 'active';
      }
      if (sheetId === visibleTransition.retainedSheet) {
        return visibleTransition.retainedPhase ?? 'hidden';
      }
      return 'hidden';
    },
    [activeSheet, visibleTransition],
  );

  const getSheetAlignmentOffset = useCallback(
    (sheetId: string) =>
      visibleTransition.retainedSheet === sheetId
        ? visibleTransition.alignmentOffset
        : 0,
    [visibleTransition],
  );

  const registerSheetElement = useCallback(
    (sheetId: string, element: HTMLElement | null) => {
      if (element == null) {
        sheetElementsRef.current.delete(sheetId);
        setUnmountedSheetIds(current => {
          if (current.has(sheetId)) {
            return current;
          }
          const next = new Set(current);
          next.add(sheetId);
          return next;
        });
        // Also cover a retained sheet being removed independently of an
        // activeSheet update. Its animation can no longer report completion.
        setTransition(current =>
          current.retainedSheet === sheetId ? IDLE_TRANSITION : current,
        );
      } else {
        sheetElementsRef.current.set(sheetId, element);
        setUnmountedSheetIds(current => {
          if (!current.has(sheetId)) {
            return current;
          }
          const next = new Set(current);
          next.delete(sheetId);
          return next;
        });
      }
    },
    [],
  );

  useLayoutEffect(() => {
    setTransition(current =>
      current.retainedSheet != null &&
      unmountedSheetIds.has(current.retainedSheet)
        ? IDLE_TRANSITION
        : current,
    );
  }, [unmountedSheetIds]);

  const onSheetEnterStart = useCallback((sheetId: string) => {
    setTransition(current => {
      if (
        current.enteringSheet !== sheetId ||
        current.retainedSheet == null ||
        current.retainedPhase !== 'covered'
      ) {
        return current;
      }
      const alignmentOffset = alignmentOffsetForElements(
        sheetElementsRef.current.get(sheetId),
        sheetElementsRef.current.get(current.retainedSheet),
      );
      if (alignmentOffset <= ALIGNMENT_THRESHOLD_PX) {
        return current;
      }
      return {
        ...current,
        retainedPhase: 'aligning',
        alignmentOffset,
        isAlignmentComplete: false,
      };
    });
  }, []);

  const onSheetTransitionComplete = useCallback(
    ({sheetId, phase}: BottomSheetSwitcherTransitionEvent) => {
      setTransition(current => {
        if (phase === 'entering') {
          if (current.enteringSheet !== sheetId) {
            return current;
          }
          if (current.retainedSheet == null) {
            return IDLE_TRANSITION;
          }
          if (
            current.retainedPhase === 'aligning' &&
            !current.isAlignmentComplete
          ) {
            return {...current, enteringSheet: null};
          }
          return {
            ...current,
            enteringSheet: null,
            retainedPhase: 'fading',
          };
        }

        if (
          phase === 'aligning' &&
          current.retainedSheet === sheetId &&
          current.retainedPhase === 'aligning'
        ) {
          return current.enteringSheet == null
            ? {...current, retainedPhase: 'fading'}
            : {...current, isAlignmentComplete: true};
        }

        if (
          (phase === 'fading' || phase === 'exiting') &&
          current.retainedSheet === sheetId &&
          current.retainedPhase === phase
        ) {
          return IDLE_TRANSITION;
        }

        return current;
      });
    },
    [],
  );

  const setScrimOpacity = useCallback((opacity: number) => {
    scrimRef.current?.style.setProperty(
      '--_sheet-scrim-opacity',
      String(opacity),
    );
  }, []);

  // A new step always starts from a fully dimmed backdrop; gesture updates
  // may then fade this shared element toward the peek detent. On final close,
  // the shared scrim fades out alongside the exiting sheet and stays mounted
  // until that sheet reports its transition complete.
  useEffect(() => {
    setScrimOpacity(activeSheet == null ? 0 : 1);
  }, [activeSheet, setScrimOpacity]);

  const contextValue = useMemo<BottomSheetSwitcherContextValue>(
    () => ({
      activeSheet,
      hasScrim,
      onActiveSheetChange,
      getSheetPhase,
      getSheetAlignmentOffset,
      registerSheetElement,
      onSheetEnterStart,
      onSheetTransitionComplete,
      setScrimOpacity,
      triggerRef,
    }),
    [
      activeSheet,
      getSheetAlignmentOffset,
      getSheetPhase,
      hasScrim,
      onActiveSheetChange,
      onSheetEnterStart,
      onSheetTransitionComplete,
      registerSheetElement,
      setScrimOpacity,
    ],
  );

  const layer = (
    <div ref={containerRef} {...stylex.props(styles.contents)}>
      {hasScrim && isFlowVisible && (
        <div
          ref={scrimRef}
          aria-hidden="true"
          onClick={close}
          {...mergeProps(
            themeProps('bottom-sheet-switcher-scrim'),
            stylex.props(styles.scrim),
          )}
        />
      )}
      {children}
    </div>
  );

  return (
    <BottomSheetSwitcherContext.Provider value={contextValue}>
      {portalTarget == null ? null : createPortal(layer, portalTarget)}
    </BottomSheetSwitcherContext.Provider>
  );
}

BottomSheetSwitcher.displayName = 'BottomSheetSwitcher';
