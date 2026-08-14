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
 * child, or is null when the flow is closed. During a handoff the previous
 * sheet remains visible, inert, and accessibility-hidden just long enough to
 * finish its exit animation. It also owns the flow's one shared scrim, focus
 * trap, and scroll lock, so sheet-to-sheet handoffs never stack backdrops.
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

export interface BottomSheetOrchestratorProps {
  /**
   * ID of the interactive BottomSheet, or null when the flow should close.
   * Must match a nested BottomSheet's `sheetId`. The previous sheet may remain
   * visually present and inert until its exit animation completes.
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
 * one shared scrim for the complete flow. A previous sheet may remain visible
 * and inert while its exit animation completes.
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
  const [exitingSheet, setExitingSheet] = useState<string | null>(null);

  // Keep the previous active ID available during the very render in which the
  // controlled prop changes. BottomSheet children therefore see `exiting`
  // immediately and never briefly hide before the layout effect commits it.
  const activeSheetChanged = committedActiveSheetRef.current !== activeSheet;
  const visibleExitingSheet = activeSheetChanged
    ? committedActiveSheetRef.current
    : exitingSheet;
  const isFlowVisible = activeSheet != null || visibleExitingSheet != null;
  const isModal = hasScrim && isFlowVisible;

  useLayoutEffect(() => {
    const previousActiveSheet = committedActiveSheetRef.current;
    if (previousActiveSheet === activeSheet) {
      return;
    }
    committedActiveSheetRef.current = activeSheet;
    setExitingSheet(previousActiveSheet);
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
        return 'active';
      }
      if (sheetId === visibleExitingSheet) {
        return 'exiting';
      }
      return 'hidden';
    },
    [activeSheet, visibleExitingSheet],
  );

  const onSheetExitComplete = useCallback((sheetId: string) => {
    setExitingSheet(current => (current === sheetId ? null : current));
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
      onSheetExitComplete,
      setScrimOpacity,
      triggerRef,
    }),
    [
      activeSheet,
      getSheetPhase,
      hasScrim,
      onActiveSheetChange,
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
