// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file BottomSheetSwitcher.tsx
 * @input Uses React context, StyleX, theme tokens, focus/scroll-lock hooks, BottomSheetSwitcherContext
 * @output Exports BottomSheetSwitcher and BottomSheetSwitcherProps
 * @position Core switcher for mutually exclusive BottomSheet flows
 *
 * The switcher turns a set of declaratively nested BottomSheets into a
 * controlled single-selection group: `activeSheet` names the one interactive
 * child, or is null when the flow is closed. During a handoff the new sheet
 * enters above the previous sheet. If it is shorter, the previous sheet moves
 * down at the same time until their top edges align; otherwise it stays
 * stationary. The previous sheet fades only after both motions complete.
 *
 * All child sheets render as panels inside one switcher-owned `<dialog>`. A
 * scrim flow calls showModal() once and keeps that native top-layer dialog open
 * across every handoff. A no-scrim flow calls show() on the same non-modal shell.
 * This keeps one modal boundary and one native ::backdrop without a portal.
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/BottomSheet/BottomSheet.tsx
 * - /packages/core/src/BottomSheet/BottomSheetEdgeTint.tsx
 * - /packages/core/src/BottomSheet/BottomSheetSwitcher.doc.mjs
 * - /packages/core/src/BottomSheet/BottomSheetSwitcher.test.tsx
 * - /packages/core/src/BottomSheet/index.ts
 * - /apps/storybook/stories/BottomSheetSwitcher.stories.tsx
 * - /packages/cli/assets/templates/blocks/components/BottomSheet/BottomSheetSwitcherShowcase.tsx
 */

import {
  useCallback,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type MouseEvent as ReactMouseEvent,
  type ReactNode,
  type SyntheticEvent,
} from 'react';
import * as stylex from '@stylexjs/stylex';
import type {BaseProps} from '../BaseProps';
import type {DialogPurpose} from '../Dialog';
import {colorVars, durationVars, easeVars} from '../theme/tokens.stylex';
import {
  hasActiveFocusTrapEscape,
  isImeKeyEvent,
  useFocusTrap,
  useScrollLock,
} from '../hooks';
import {composeEventHandlers, mergeProps} from '../utils';
import {BottomSheetEdgeTint} from './BottomSheetEdgeTint';
import {
  BottomSheetSwitcherContext,
  type BottomSheetSwitcherContextValue,
  type BottomSheetSwitcherPhase,
  type BottomSheetSwitcherTransitionEvent,
} from './BottomSheetSwitcherContext';

import {useMergedRefs} from '../hooks/useMergedRefs';
const styles = stylex.create({
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
  // show() leaves a no-scrim flow in the normal rendering tree. The shell must
  // pass pointer input through to the live page; each sheet panel opts back in.
  // width/height 100% avoids overflowing a transformed containing block, but
  // consumers of this non-modal mode must still avoid clipping ancestors.
  dialogNonModal: {
    pointerEvents: 'none',
    zIndex: 1000,
    width: '100%',
    height: '100%',
  },
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
  // The flow's dim leaves with its last panel. Same rule, same reasoning, as
  // a standalone sheet's -- see `scrimClosing` in BottomSheet.tsx. A handoff
  // between two sheets is not a close, and keeps the entrance curve.
  scrimClosing: {
    '::backdrop': {
      transitionTimingFunction: 'linear',
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
  const enteringPositioner = enteringElement.parentElement;
  const enteringTop =
    enteringPositioner?.getBoundingClientRect().top ??
    enteringElement.getBoundingClientRect().top;
  return Math.max(0, enteringTop - retainedElement.getBoundingClientRect().top);
}

export interface BottomSheetSwitcherProps extends BaseProps<HTMLDialogElement> {
  /** Ref forwarded to the shared native dialog. */
  ref?: React.Ref<HTMLDialogElement>;

  /** Called when the shared native dialog receives a cancel event. */
  onCancel?: (event: SyntheticEvent<HTMLDialogElement>) => void;

  /**
   * ID of the interactive BottomSheet, or null when the flow should close.
   * Must match a nested BottomSheet's `sheetId`. The previous sheet may remain
   * visually present and inert while the new sheet enters, moving downward at
   * the same time if the new sheet is shorter, then fade away.
   */
  activeSheet: string | null;

  /** Called with null when the active sheet requests dismissal. */
  onActiveSheetChange: (sheetId: string | null) => void;

  /**
   * Whether to open the shared dialog modally with its native ::backdrop.
   * Disable for a viewport-anchored, non-modal flow over an interactive page.
   * @default true
   */
  hasScrim?: boolean;

  /** BottomSheets identified by unique `sheetId` values. */
  children: ReactNode;
}

/**
 * Coordinates a set of BottomSheets so zero or one is active at a time inside
 * one shared native dialog. During a handoff the previous panel stays visible
 * and inert beneath the entering panel, then fades after motion completes.
 */
export function BottomSheetSwitcher({
  activeSheet,
  onActiveSheetChange,
  hasScrim = true,
  children,
  ref,
  xstyle,
  className,
  style,
  onCancel,
  onClick,
  onKeyDown,
  ...props
}: BottomSheetSwitcherProps) {
  const dialogRef = useRef<HTMLDialogElement | null>(null);
  const dialogModeRef = useRef<'modal' | 'non-modal' | null>(null);
  const triggerRef = useRef<HTMLElement | null>(null);
  const sheetElementsRef = useRef(new Map<string, HTMLElement>());
  const committedActiveSheetRef = useRef(activeSheet);
  const [sheetLabels, setSheetLabels] = useState<ReadonlyMap<string, string>>(
    () => new Map(),
  );
  const [sheetPurposes, setSheetPurposes] = useState<
    ReadonlyMap<string, DialogPurpose>
  >(() => new Map());
  const [unmountedSheetIds, setUnmountedSheetIds] = useState<
    ReadonlySet<string>
  >(() => new Set());
  const [transition, setTransition] =
    useState<SheetTransitionState>(IDLE_TRANSITION);

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
  const activeSheetPurpose =
    (activeSheet == null ? null : sheetPurposes.get(activeSheet)) ?? 'info';
  const allowsEscapeDismiss = activeSheetPurpose !== 'required';
  const allowsLightDismiss = activeSheetPurpose === 'info';

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
    setTransition(
      nextTransition.retainedSheet != null &&
        !sheetElementsRef.current.has(nextTransition.retainedSheet)
        ? IDLE_TRANSITION
        : nextTransition,
    );
  }, [activeSheet]);

  const dismissOnEscape = useCallback(() => {
    if (allowsEscapeDismiss) {
      onActiveSheetChange(null);
    }
  }, [allowsEscapeDismiss, onActiveSheetChange]);
  const dismissOnLightInteraction = useCallback(() => {
    if (allowsLightDismiss) {
      onActiveSheetChange(null);
    }
  }, [allowsLightDismiss, onActiveSheetChange]);
  const {containerRef} = useFocusTrap<HTMLDialogElement>({
    isActive: isModal,
    onEscape: dismissOnEscape,
  });
  useScrollLock(isModal);

  // Open one shared shell for the complete flow. Modal flows enter the native
  // top layer once; handoffs only swap panels inside it. The final panel owns
  // the exit timing, so isFlowVisible becomes false only when it is safe to
  // close the dialog and restore focus.
  useLayoutEffect(() => {
    const dialog = dialogRef.current;
    if (dialog == null) {
      return;
    }

    if (isFlowVisible) {
      const nextMode = hasScrim ? 'modal' : 'non-modal';
      if (dialog.open && dialogModeRef.current !== nextMode) {
        dialog.close();
      }
      if (!dialog.open) {
        if (hasScrim && triggerRef.current == null) {
          triggerRef.current = document.activeElement as HTMLElement | null;
        }
        if (hasScrim) {
          dialog.showModal();
        } else {
          dialog.show();
        }
      }
      dialogModeRef.current = nextMode;
      return;
    }

    if (dialog.open) {
      dialog.close();
    }
    if (dialogModeRef.current === 'modal') {
      triggerRef.current?.focus();
    }
    triggerRef.current = null;
    dialogModeRef.current = null;
  }, [hasScrim, isFlowVisible]);

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

  const registerSheetLabel = useCallback(
    (sheetId: string, label: string | null) => {
      setSheetLabels(current => {
        if (label == null) {
          if (!current.has(sheetId)) {
            return current;
          }
          const next = new Map(current);
          next.delete(sheetId);
          return next;
        }
        if (current.get(sheetId) === label) {
          return current;
        }
        const next = new Map(current);
        next.set(sheetId, label);
        return next;
      });
    },
    [],
  );

  const registerSheetPurpose = useCallback(
    (sheetId: string, purpose: DialogPurpose | null) => {
      setSheetPurposes(current => {
        if (purpose == null) {
          if (!current.has(sheetId)) {
            return current;
          }
          const next = new Map(current);
          next.delete(sheetId);
          return next;
        }
        if (current.get(sheetId) === purpose) {
          return current;
        }
        const next = new Map(current);
        next.set(sheetId, purpose);
        return next;
      });
    },
    [],
  );

  useLayoutEffect(() => {
    // eslint-disable-next-line @eslint-react/set-state-in-effect -- clear a retained sheet after its panel unmounts
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
    dialogRef.current?.style.setProperty(
      '--_sheet-scrim-opacity',
      String(opacity),
    );
  }, []);
  const onSheetScrimOpacityChange = useCallback(
    (sheetId: string, opacity: number) => {
      // A pointer captured by the outgoing sheet can keep delivering gesture
      // events after a handoff. Only the currently committed sheet owns the
      // shared backdrop, so stale gesture updates must not reach the dialog.
      if (sheetId !== committedActiveSheetRef.current) {
        return;
      }
      setScrimOpacity(opacity);
    },
    [setScrimOpacity],
  );

  useLayoutEffect(() => {
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
      registerSheetLabel,
      registerSheetPurpose,
      onSheetEnterStart,
      onSheetTransitionComplete,
      onSheetScrimOpacityChange,
    }),
    [
      activeSheet,
      getSheetAlignmentOffset,
      getSheetPhase,
      hasScrim,
      onActiveSheetChange,
      onSheetEnterStart,
      onSheetScrimOpacityChange,
      onSheetTransitionComplete,
      registerSheetElement,
      registerSheetLabel,
      registerSheetPurpose,
    ],
  );

  const activeLabel =
    (activeSheet == null ? null : sheetLabels.get(activeSheet)) ??
    (visibleTransition.retainedSheet == null
      ? undefined
      : sheetLabels.get(visibleTransition.retainedSheet));

  const handleCancel = useCallback(
    (event: SyntheticEvent<HTMLDialogElement>) => {
      event.preventDefault();
      dismissOnEscape();
    },
    [dismissOnEscape],
  );
  const handleKeyDown = useCallback(
    (event: ReactKeyboardEvent<HTMLDialogElement>) => {
      // Modal Escape is owned by useFocusTrap so nested traps can win. A
      // non-modal switcher has no outer trap, so retain local dismissal while
      // deferring to an active nested layer and ignoring IME cancellation.
      if (
        !isModal &&
        event.key === 'Escape' &&
        !isImeKeyEvent(event.nativeEvent) &&
        !hasActiveFocusTrapEscape()
      ) {
        event.preventDefault();
        dismissOnEscape();
      }
    },
    [dismissOnEscape, isModal],
  );
  const handleClick = useCallback(
    (event: ReactMouseEvent<HTMLDialogElement>) => {
      if (hasScrim && event.target === event.currentTarget) {
        dismissOnLightInteraction();
      }
    },
    [dismissOnLightInteraction, hasScrim],
  );

  const dialogStyleProps = stylex.props(
    styles.dialog,
    isFlowVisible && styles.dialogOpen,
    hasScrim && styles.scrim,
    hasScrim && isFlowVisible && activeSheet == null && styles.scrimClosing,
    !hasScrim && styles.dialogNonModal,
    xstyle,
  );
  const dialogPresentationProps = mergeProps(
    dialogStyleProps,
    className,
    style,
  );
  const ariaLabel =
    props['aria-label'] ??
    (props['aria-labelledby'] == null ? activeLabel : undefined);

  return (
    <BottomSheetSwitcherContext value={contextValue}>
      <dialog
        {...props}
        {...dialogPresentationProps}
        ref={useMergedRefs(ref, dialogRef, containerRef)}
        aria-label={ariaLabel}
        aria-modal={isModal ? 'true' : undefined}
        onCancel={composeEventHandlers(onCancel, handleCancel)}
        onClick={composeEventHandlers(onClick, handleClick)}
        onKeyDown={composeEventHandlers(onKeyDown, handleKeyDown)}
        {...(activeSheetPurpose === 'required'
          ? {role: 'alertdialog'}
          : undefined)}>
        {children}
        {/* A modal flow's ::backdrop already answers Safari's edge sampler. */}
        {hasScrim ? null : <BottomSheetEdgeTint />}
      </dialog>
    </BottomSheetSwitcherContext>
  );
}

BottomSheetSwitcher.displayName = 'BottomSheetSwitcher';
