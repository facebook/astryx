// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file BottomSheetOrchestrator.tsx
 * @input Uses React context, StyleX, theme tokens, focus/scroll-lock hooks, BottomSheetOrchestratorContext
 * @output Exports BottomSheetOrchestrator and BottomSheetOrchestratorProps
 * @position Lab controller for mutually exclusive BottomSheet flows
 *
 * The orchestrator turns a set of declaratively nested BottomSheets into a
 * controlled single-selection group: `activeSheet` names the one interactive
 * child, or is null when the flow is closed. During a handoff the new sheet
 * enters above the previous sheet; the previous sheet stays stationary and
 * inert, then fades after the entrance completes. It also owns the flow's one
 * shared scrim, focus trap, and scroll lock, so sheet-to-sheet handoffs never
 * stack backdrops.
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/lab/src/BottomSheet/BottomSheet.tsx
 * - /packages/lab/src/BottomSheet/BottomSheetOrchestrator.doc.mjs
 * - /packages/lab/src/BottomSheet/BottomSheetOrchestrator.test.tsx
 * - /packages/lab/src/BottomSheet/index.ts
 * - /apps/storybook/stories/BottomSheet.stories.tsx
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
import * as stylex from '@stylexjs/stylex';
import {
  colorVars,
  durationVars,
  easeVars,
} from '@astryxdesign/core/theme/tokens.stylex';
import {useFocusTrap, useScrollLock} from '@astryxdesign/core/hooks';
import {mergeProps, themeProps} from '@astryxdesign/core/utils';
import {
  BottomSheetOrchestratorContext,
  type BottomSheetOrchestratorPhase,
  type BottomSheetOrchestratorContextValue,
} from './BottomSheetOrchestratorContext';

const styles = stylex.create({
  contents: {
    display: 'contents',
  },
  scrim: {
    position: 'fixed',
    inset: 0,
    // Orchestrated sheets use z-index 1000 (the existing app-overlay
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

type RetainedSheetPhase = 'covered' | 'fading' | 'exiting';

interface SheetTransitionState {
  enteringSheet: string | null;
  retainedSheet: string | null;
  retainedPhase: RetainedSheetPhase | null;
}

const IDLE_TRANSITION: SheetTransitionState = {
  enteringSheet: null,
  retainedSheet: null,
  retainedPhase: null,
};

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
    };
  }
  return {
    enteringSheet: nextSheet,
    retainedSheet: previousSheet,
    retainedPhase: 'covered',
  };
}

export interface BottomSheetOrchestratorProps {
  /**
   * ID of the interactive BottomSheet, or null when the flow should close.
   * Must match a nested BottomSheet's `sheetId`. The previous sheet may remain
   * visually present and inert while the new sheet enters, then fade away.
   */
  activeSheet: string | null;

  /**
   * Called when the active BottomSheet requests dismissal, with null. Callers
   * can pass the same callback (or its state setter) to controls that move the
   * flow to another sheet ID.
   */
  onActiveSheetChange: (sheetId: string | null) => void;

  /**
   * Whether the orchestrator renders one shared scrim and treats the active
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
 * previous sheet remains stationary and inert while the new sheet enters above
 * it, then fades away after the entrance completes.
 *
 * @example
 * ```
 * const [activeSheet, setActiveSheet] = useState<string | null>(null);
 *
 * <BottomSheetOrchestrator
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
 * </BottomSheetOrchestrator>
 * ```
 */
export function BottomSheetOrchestrator({
  activeSheet,
  onActiveSheetChange,
  hasScrim = true,
  children,
}: BottomSheetOrchestratorProps) {
  // The opener belongs to the flow, not an individual sheet. Keeping it here
  // means sheet-to-sheet handoffs do not replace it with a control in the
  // previous sheet; focus returns to the original trigger when the flow ends.
  const triggerRef = useRef<HTMLElement | null>(null);
  const scrimRef = useRef<HTMLDivElement | null>(null);
  const committedActiveSheetRef = useRef(activeSheet);
  const [transition, setTransition] =
    useState<SheetTransitionState>(IDLE_TRANSITION);

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
    activeSheet != null || visibleTransition.retainedSheet != null;
  const isModal = hasScrim && isFlowVisible;

  useLayoutEffect(() => {
    const previousActiveSheet = committedActiveSheetRef.current;
    if (previousActiveSheet === activeSheet) {
      return;
    }
    committedActiveSheetRef.current = activeSheet;
    setTransition(
      transitionForActiveSheetChange(previousActiveSheet, activeSheet),
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
    (sheetId: string): BottomSheetOrchestratorPhase => {
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

  const onSheetEnterComplete = useCallback((sheetId: string) => {
    setTransition(current => {
      if (current.enteringSheet !== sheetId) {
        return current;
      }
      return {
        enteringSheet: null,
        retainedSheet: current.retainedSheet,
        retainedPhase:
          current.retainedSheet == null ? null : ('fading' as const),
      };
    });
  }, []);

  const onSheetExitComplete = useCallback((sheetId: string) => {
    setTransition(current =>
      current.retainedSheet === sheetId ? IDLE_TRANSITION : current,
    );
  }, []);

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

  const contextValue = useMemo<BottomSheetOrchestratorContextValue>(
    () => ({
      activeSheet,
      hasScrim,
      onActiveSheetChange,
      getSheetPhase,
      onSheetEnterComplete,
      onSheetExitComplete,
      setScrimOpacity,
      triggerRef,
    }),
    [
      activeSheet,
      getSheetPhase,
      hasScrim,
      onActiveSheetChange,
      onSheetEnterComplete,
      onSheetExitComplete,
      setScrimOpacity,
    ],
  );

  return (
    <BottomSheetOrchestratorContext.Provider value={contextValue}>
      <div ref={containerRef} {...stylex.props(styles.contents)}>
        {hasScrim && isFlowVisible && (
          <div
            ref={scrimRef}
            aria-hidden="true"
            onClick={close}
            {...mergeProps(
              themeProps('bottom-sheet-orchestrator-scrim'),
              stylex.props(styles.scrim),
            )}
          />
        )}
        {children}
      </div>
    </BottomSheetOrchestratorContext.Provider>
  );
}

BottomSheetOrchestrator.displayName = 'BottomSheetOrchestrator';
