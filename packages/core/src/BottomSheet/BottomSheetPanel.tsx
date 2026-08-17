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
 * - /packages/core/src/BottomSheet/BottomSheet.tsx
 * - /packages/core/src/BottomSheet/BottomSheetPanel.test.tsx
 * - /packages/core/src/BottomSheet/useSheetGestures.ts
 */

import {
  useCallback,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
  type ReactNode,
} from 'react';
import * as stylex from '@stylexjs/stylex';
import type {BaseProps} from '../BaseProps';
import {
  colorVars,
  durationVars,
  easeVars,
  radiusVars,
  shadowVars,
  sizeVars,
  spacingVars,
} from '../theme/tokens.stylex';
import {mergeProps, themeProps} from '../utils';
import {useMobileKeyboard} from './useMobileKeyboard';
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
const MOBILE_KEYBOARD_BOTTOM_CLEARANCE = 48;
const TRANSITION_BACKSTOP_BUFFER_MS = 50;

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
    boxSizing: 'border-box',
    overflowY: 'auto',
    overscrollBehavior: 'none',
    touchAction: 'pan-y',
    paddingBlockEnd: 0,
  },
  tallKeyboardBody: {
    scrollPaddingBlockEnd: MOBILE_KEYBOARD_BOTTOM_CLEARANCE,
    '::after': {
      content: '""',
      display: 'block',
      blockSize: 'var(--_sheet-keyboard-inset, 0px)',
      pointerEvents: 'none',
    },
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

interface BottomSheetPanelProps extends BaseProps<HTMLDivElement> {
  /** Ref forwarded to the visual sheet panel. */
  ref?: React.Ref<HTMLDivElement>;
  state: BottomSheetPanelState;
  height: BottomSheetHeight | number | string;
  children: ReactNode;
  isSwipeDismissAllowed?: boolean;
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
  if (element == null) {
    complete();
    return () => {};
  }

  let done = false;
  let timer: ReturnType<typeof setTimeout> | null = null;
  const finish = () => {
    if (done) {
      return;
    }
    done = true;
    if (timer != null) {
      clearTimeout(timer);
    }
    element.removeEventListener('transitionend', handleTransitionEnd);
    element.removeEventListener('transitioncancel', handleTransitionEnd);
    complete();
  };
  const handleTransitionEnd = (event: TransitionEvent) => {
    if (event.target === element && event.propertyName === propertyName) {
      finish();
    }
  };
  element.addEventListener('transitionend', handleTransitionEnd);
  element.addEventListener('transitioncancel', handleTransitionEnd);

  const computedStyle = getComputedStyle(element);
  if (
    element.style.transition.trim() === 'none' ||
    computedStyle.transition.trim() === 'none'
  ) {
    finish();
    return () => {};
  }
  const properties = computedStyle.transitionProperty
    .split(',')
    .map(value => value.trim());
  const durations = computedStyle.transitionDuration
    .split(',')
    .map(parseTransitionTime);
  const delays = computedStyle.transitionDelay
    .split(',')
    .map(parseTransitionTime);
  let hasUnresolvedTiming = false;
  const transitionMs = properties.reduce((longest, property, index) => {
    if (property !== propertyName && property !== 'all') {
      return longest;
    }
    const duration = durations[index % durations.length];
    const delay = delays[index % delays.length];
    if (duration == null || delay == null) {
      hasUnresolvedTiming = true;
      return longest;
    }
    return Math.max(longest, duration + delay);
  }, 0);

  if (hasUnresolvedTiming) {
    // JSDOM can leave CSS variables unresolved. In that case the native event
    // remains authoritative; choosing a fixed timeout here would make an
    // assumption about the consumer's theme.
    return () => {
      element.removeEventListener('transitionend', handleTransitionEnd);
      element.removeEventListener('transitioncancel', handleTransitionEnd);
    };
  }

  if (transitionMs <= 0) {
    finish();
    return () => {};
  }

  timer = setTimeout(finish, transitionMs + TRANSITION_BACKSTOP_BUFFER_MS);
  return () => {
    if (timer != null) {
      clearTimeout(timer);
    }
    element.removeEventListener('transitionend', handleTransitionEnd);
    element.removeEventListener('transitioncancel', handleTransitionEnd);
  };
}

function parseTransitionTime(value: string): number | null {
  const normalizedValue = value.trim();
  if (!/^-?(?:\d+|\d*\.\d+)(?:ms|s)$/.test(normalizedValue)) {
    return null;
  }
  const time = Number.parseFloat(value);
  return normalizedValue.endsWith('ms') ? time : time * 1000;
}

/** Internal visual and gesture surface shared by every BottomSheet host. */
export function BottomSheetPanel({
  ref,
  state,
  height,
  children,
  className,
  style,
  tabIndex,
  xstyle,
  isSwipeDismissAllowed = true,
  onDismiss,
  onScrimOpacity,
  onElementChange,
  onMotionStart,
  onMotionComplete,
  ...props
}: BottomSheetPanelProps) {
  const elementRef = useRef<HTMLDivElement | null>(null);
  const bodyElementRef = useRef<HTMLDivElement | null>(null);
  const previousStateRef = useRef(state);
  const reactivatedEntranceRef = useRef(false);
  const onMotionStartRef = useRef(onMotionStart);
  const onMotionCompleteRef = useRef(onMotionComplete);
  const startedMotionRef = useRef<BottomSheetPanelMotion | null>(null);
  const pendingMotionCompleteRef = useRef<BottomSheetPanelMotion | null>(null);

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
  const isPresented = state.kind !== 'hidden';
  const isRetained = state.kind === 'retained';
  const isInactive = isRetained || state.kind === 'exiting';
  const isClosing = state.kind === 'exiting';
  const isFading = isRetained && state.motion === 'fading';
  const alignmentOffset = isRetained ? state.alignmentOffset : 0;

  const {
    contentProps,
    handleProps,
    bodyProps,
    sheetRef,
    dragOffset,
    settledOffset,
    isDragging,
    sheetHeight,
    scrollPreservationInset,
    settlingLayoutOffset,
    settledLayoutOffset,
    completeScrollAreaSettle,
  } = useSheetGestures({
    isOpen: isInteractive,
    canDismiss: isSwipeDismissAllowed,
    offscreenBlockEndInset: OVERSCROLL_PADDING,
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
  // The ref callback alone is the dependency: bodyProps is rebuilt whenever
  // any gesture value changes, and rebuilding this callback would detach and
  // reattach the body element on renders where the ref itself never moved.
  const attachBodyRef = bodyProps.ref;
  const setBodyElement = useCallback(
    (element: HTMLDivElement | null) => {
      attachBodyRef(element);
      bodyElementRef.current = element;
    },
    [attachBodyRef],
  );
  useMobileKeyboard({
    bodyRef: bodyElementRef,
    bottomClearance: MOBILE_KEYBOARD_BOTTOM_CLEARANCE,
    isEnabled: height === 'tall',
    isFullyExpanded: settledOffset === 0,
    isSheetTraveling: isDragging && dragOffset !== settledOffset,
    isOpen: isInteractive,
    isPresented,
    sheetRef: elementRef,
  });
  // Keep controller registration attached to one stable host ref. React
  // detaches an old callback ref when a consumer supplies a new identity; if
  // that public ref were merged with setElement, an ordinary parent rerender
  // could be mistaken for the panel unmounting and cancel a sheet handoff.
  useImperativeHandle(ref, () => elementRef.current as HTMLDivElement, []);

  const motion = motionForState(state);
  useLayoutEffect(() => {
    if (motion == null) {
      return;
    }
    startedMotionRef.current = null;
    pendingMotionCompleteRef.current = null;
    if (motion === 'entering' && reactivatedEntranceRef.current) {
      pendingMotionCompleteRef.current = motion;
      return;
    }
    return waitForTransition(
      elementRef.current,
      motion === 'fading' ? 'opacity' : 'transform',
      () => {
        if (startedMotionRef.current === motion) {
          onMotionCompleteRef.current?.(motion);
        } else {
          pendingMotionCompleteRef.current = motion;
        }
      },
    );
  }, [motion]);
  // The snap is transform-only; the layout height reconciles when it lands.
  // waitForTransition — the same helper the motion states use — resolves that
  // even when no `transitionend` is coming: inline or computed
  // `transition: none`, a zero duration, and a timer backstop otherwise.
  useLayoutEffect(() => {
    if (settlingLayoutOffset == null) {
      return;
    }
    return waitForTransition(
      elementRef.current,
      'transform',
      completeScrollAreaSettle,
    );
  }, [completeScrollAreaSettle, settlingLayoutOffset]);
  useEffect(() => {
    if (motion == null) {
      return;
    }
    onMotionStartRef.current?.(motion);
    startedMotionRef.current = motion;
    if (pendingMotionCompleteRef.current === motion) {
      pendingMotionCompleteRef.current = null;
      onMotionCompleteRef.current?.(motion);
    }
    return () => {
      if (startedMotionRef.current === motion) {
        startedMotionRef.current = null;
      }
      if (pendingMotionCompleteRef.current === motion) {
        pendingMotionCompleteRef.current = null;
      }
    };
  }, [motion]);

  const isNamedHeight = typeof height === 'string' && height in HEIGHT_BUDGETS;
  const budget = isNamedHeight
    ? HEIGHT_BUDGETS[height as BottomSheetHeight]
    : typeof height === 'number'
      ? `${height}px`
      : height;
  const hasMeasuredSheet = sheetHeight > 0;
  let gestureTransform = contentProps.style.transform;
  let resizedHeight: string | undefined;
  if (hasMeasuredSheet) {
    // The sheet's travel is split across two properties: `layoutOffset` is the
    // part the scrolling area gives up as layout height, and the remainder is
    // a compositor transform. Live gestures and snaps only ever move the
    // transform — the layout height changes at rest, in one reconciling render
    // whose visible geometry is identical (see useSheetGestures).
    //   - dragging above the base restores the full height below the viewport
    //   - a peek settles with layout 0, so it slides rather than reflowing
    const layoutOffset = isDragging
      ? dragOffset < settledOffset
        ? 0
        : settledLayoutOffset
      : (settlingLayoutOffset ?? settledLayoutOffset);
    const activeOffset = isDragging ? dragOffset : settledOffset;
    const translation = activeOffset - layoutOffset;

    // At layout 0 the sheet is its natural height, so leave that to CSS —
    // `hug` sheets must stay fit-content. While the sheet is in motion it is
    // pinned in px instead: content reflowing mid-gesture would move the
    // surface out from under the finger, or under the snap.
    const isTraveling = isDragging || settlingLayoutOffset != null;
    resizedHeight =
      layoutOffset > 0 || isTraveling
        ? `${Math.max(0, sheetHeight - Math.max(0, layoutOffset))}px`
        : undefined;
    gestureTransform =
      translation !== 0 ? `translateY(${translation}px)` : undefined;
  }
  const retainedTransform =
    alignmentOffset > 0
      ? [gestureTransform, `translateY(${alignmentOffset}px)`]
          .filter(Boolean)
          .join(' ')
      : gestureTransform;
  const gestureStyle = {
    ...contentProps.style,
    transform: gestureTransform,
    height: resizedHeight,
  };
  return (
    <div
      {...props}
      ref={setElement}
      tabIndex={tabIndex ?? -1}
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
        className,
        {
          ['--_sheet-budget' as string]: budget,
          ...(isInteractive
            ? gestureStyle
            : isRetained
              ? {transform: retainedTransform, height: resizedHeight}
              : isClosing
                ? {height: resizedHeight}
                : {}),
          ...style,
        },
      )}>
      <div
        {...stylex.props(styles.handleBar)}
        {...handleProps}
        aria-hidden="true">
        <div {...stylex.props(styles.handlePill)} />
      </div>
      <div
        {...mergeProps(
          stylex.props(
            styles.body,
            height === 'tall' && styles.tallKeyboardBody,
          ),
          scrollPreservationInset > 0
            ? {style: {paddingBlockEnd: `${scrollPreservationInset}px`}}
            : {},
        )}
        {...bodyProps}
        ref={setBodyElement}>
        {children}
      </div>
    </div>
  );
}

BottomSheetPanel.displayName = 'BottomSheetPanel';
