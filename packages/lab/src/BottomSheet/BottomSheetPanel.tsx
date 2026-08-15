// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file BottomSheetPanel.tsx
 * @input Uses React, StyleX, theme tokens, useSheetGestures
 * @output Internal BottomSheetPanel surface and motion-state types
 * @position Shared presentation layer for standalone and switcher BottomSheets
 *
 * This component owns everything intrinsic to a sheet surface: height budgets,
 * drag and snap gestures, the handle and scrolling body, motion styles, and
 * transition completion. It deliberately does not own a dialog, focus, inert
 * state, or switcher registration; those belong to the hosting controller.
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/lab/src/BottomSheet/BottomSheet.tsx
 * - /packages/lab/src/BottomSheet/BottomSheetPanel.test.tsx
 * - /packages/lab/src/BottomSheet/useSheetGestures.ts
 */

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  type ReactNode,
} from 'react';
import * as stylex from '@stylexjs/stylex';
import type {StyleXStyles} from '@stylexjs/stylex';
import {
  colorVars,
  durationVars,
  easeVars,
  radiusVars,
  shadowVars,
  sizeVars,
  spacingVars,
} from '@astryxdesign/core/theme/tokens.stylex';
import {mergeProps, themeProps} from '@astryxdesign/core/utils';
import {useSheetGestures} from './useSheetGestures';

const SNAP_FRACTIONS = [0.14, 0.5, 0.92];

const HEIGHT_BUDGETS = {
  hug: '92dvh',
  capped: '62dvh',
  tall: '92dvh',
} as const;

export type BottomSheetHeight = keyof typeof HEIGHT_BUDGETS;

// SYNC: must match OVERSCROLL_MAX in useSheetGestures.ts.
const OVERSCROLL_PADDING = 48;
const TRANSITION_BACKSTOP_MS = 450;

function defaultSnapHeights(): number[] {
  if (typeof window === 'undefined') {
    return [];
  }
  const viewportHeight = window.visualViewport?.height ?? window.innerHeight;
  return SNAP_FRACTIONS.map(fraction => fraction * viewportHeight);
}

const styles = stylex.create({
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
    outline: 'none',
    overflow: 'hidden',
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
    overscrollBehavior: 'none',
    touchAction: 'pan-y',
  },
  budget: {
    height: `calc(var(--_sheet-budget) + ${OVERSCROLL_PADDING}px)`,
  },
  hugHeight: {
    height: 'fit-content',
    maxHeight: `calc(${HEIGHT_BUDGETS.hug} + ${OVERSCROLL_PADDING}px)`,
  },
});

export type BottomSheetPanelMotion =
  'entering' | 'aligning' | 'fading' | 'exiting';

export type BottomSheetPanelState =
  | {kind: 'hidden'}
  | {kind: 'open'; entering: boolean}
  | {
      kind: 'retained';
      motion: 'covered' | 'aligning' | 'fading';
      alignmentOffset: number;
    }
  | {kind: 'exiting'};

interface BottomSheetPanelProps {
  state: BottomSheetPanelState;
  height: BottomSheetHeight | number | string;
  children: ReactNode;
  xstyle?: StyleXStyles;
  onDismiss: () => void;
  onScrimOpacity: (opacity: number) => void;
  onElementChange?: (element: HTMLDivElement | null) => void;
  onMotionStart?: (motion: BottomSheetPanelMotion) => void;
  onMotionComplete?: (motion: BottomSheetPanelMotion) => void;
}

function motionForState(
  state: BottomSheetPanelState,
): BottomSheetPanelMotion | null {
  if (state.kind === 'open') {
    return state.entering ? 'entering' : null;
  }
  if (state.kind === 'retained') {
    return state.motion === 'covered' ? null : state.motion;
  }
  return state.kind === 'exiting' ? 'exiting' : null;
}

function waitForTransition(
  element: HTMLElement | null,
  propertyName: 'transform' | 'opacity',
  complete: () => void,
): () => void {
  let done = false;
  const finish = () => {
    if (done) {
      return;
    }
    done = true;
    clearTimeout(timer);
    element?.removeEventListener('transitionend', handleTransitionEnd);
    complete();
  };
  const handleTransitionEnd = (event: TransitionEvent) => {
    if (event.target === element && event.propertyName === propertyName) {
      finish();
    }
  };
  element?.addEventListener('transitionend', handleTransitionEnd);
  const timer = setTimeout(finish, TRANSITION_BACKSTOP_MS);
  return () => {
    clearTimeout(timer);
    element?.removeEventListener('transitionend', handleTransitionEnd);
  };
}

/** Internal visual and gesture surface shared by every BottomSheet host. */
export function BottomSheetPanel({
  state,
  height,
  children,
  xstyle,
  onDismiss,
  onScrimOpacity,
  onElementChange,
  onMotionStart,
  onMotionComplete,
}: BottomSheetPanelProps) {
  const elementRef = useRef<HTMLDivElement | null>(null);
  const previousStateRef = useRef(state);
  const reactivatedEntranceRef = useRef(false);
  const onMotionStartRef = useRef(onMotionStart);
  const onMotionCompleteRef = useRef(onMotionComplete);

  const isEntering = state.kind === 'open' && state.entering;
  const previousState = previousStateRef.current;
  const wasEntering = previousState.kind === 'open' && previousState.entering;
  if (isEntering && !wasEntering) {
    reactivatedEntranceRef.current = previousState.kind === 'retained';
  } else if (!isEntering) {
    reactivatedEntranceRef.current = false;
  }

  useLayoutEffect(() => {
    previousStateRef.current = state;
    onMotionStartRef.current = onMotionStart;
    onMotionCompleteRef.current = onMotionComplete;
  }, [onMotionComplete, onMotionStart, state]);

  const isInteractive = state.kind === 'open';
  const isRetained = state.kind === 'retained';
  const isInactive = isRetained || state.kind === 'exiting';
  const isClosing = state.kind === 'exiting';
  const isFading = isRetained && state.motion === 'fading';
  const alignmentOffset = isRetained ? state.alignmentOffset : 0;

  const {contentProps, handleProps, bodyProps, sheetRef} = useSheetGestures({
    isOpen: isInteractive,
    onDismiss,
    snapHeights: defaultSnapHeights,
    onScrimOpacity,
  });

  const setElement = useCallback(
    (element: HTMLDivElement | null) => {
      sheetRef(element);
      elementRef.current = element;
      onElementChange?.(element);
    },
    [onElementChange, sheetRef],
  );

  const motion = motionForState(state);
  useEffect(() => {
    if (motion == null) {
      return;
    }
    onMotionStartRef.current?.(motion);
    if (motion === 'entering' && reactivatedEntranceRef.current) {
      onMotionCompleteRef.current?.(motion);
      return;
    }
    return waitForTransition(
      elementRef.current,
      motion === 'fading' ? 'opacity' : 'transform',
      () => onMotionCompleteRef.current?.(motion),
    );
  }, [motion]);

  const isNamedHeight = typeof height === 'string' && height in HEIGHT_BUDGETS;
  const budget = isNamedHeight
    ? HEIGHT_BUDGETS[height as BottomSheetHeight]
    : typeof height === 'number'
      ? `${height}px`
      : height;
  const retainedTransform =
    alignmentOffset > 0
      ? [contentProps.style.transform, `translateY(${alignmentOffset}px)`]
          .filter(Boolean)
          .join(' ')
      : contentProps.style.transform;

  return (
    <div
      ref={setElement}
      tabIndex={-1}
      {...mergeProps(
        themeProps('bottom-sheet'),
        stylex.props(
          styles.sheet,
          height === 'hug' ? styles.hugHeight : styles.budget,
          isClosing && styles.sheetClosing,
          isFading && styles.sheetFading,
          isInactive && styles.sheetInactive,
          xstyle,
        ),
        undefined,
        {
          ['--_sheet-budget' as string]: budget,
          ...(isInteractive
            ? contentProps.style
            : isRetained
              ? {transform: retainedTransform}
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
}

BottomSheetPanel.displayName = 'BottomSheetPanel';
