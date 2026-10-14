// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file BottomSheetSwitcher.tsx
 * @input Uses React context, react-dom portals, StyleX, theme tokens, shared layer dismissal, focus/scroll-lock hooks, BottomSheetSwitcherContext, unstable_stack host and parent-level contexts
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
 * Under the unstable_stack host context a Lab stacking host provides, the
 * whole switcher is one level of that host: it registers itself from wherever
 * it is rendered, portals its panels into a box the host places in its dialog
 * instead of opening its own, leaves scrim, focus containment, scroll lock,
 * and Escape/scrim dismissal to the host, and reports whether it is open and
 * presented, its active purpose, and its label. Its handoff machine is
 * unchanged, and its items read the level's view through the parent-level
 * context it provides around them.
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/BottomSheet/BottomSheet.tsx
 * - /packages/core/src/BottomSheet/unstable_stack.ts
 * - /packages/core/src/BottomSheet/unstable_stack.test.tsx
 * - /packages/core/src/BottomSheet/BottomSheetEdgeTint.tsx
 * - /packages/core/src/BottomSheet/BottomSheetSwitcher.doc.mjs
 * - /packages/core/src/BottomSheet/BottomSheetSwitcher.spec.md
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
  type HTMLAttributes,
  type KeyboardEvent as ReactKeyboardEvent,
  type MouseEvent as ReactMouseEvent,
  type ReactNode,
  type SyntheticEvent,
} from 'react';
import {createPortal} from 'react-dom';
import * as stylex from '@stylexjs/stylex';
import type {BaseProps} from '../BaseProps';
import type {DialogPurpose} from '../Dialog';
import {colorVars, durationVars, easeVars} from '../theme/tokens.stylex';
import {useDevWarning, useScrollLock} from '../hooks';
import {
  useFocusTrap,
  useFocusTrapEscapeCompatibilitySignal,
} from '../hooks/useFocusTrap';
import {LayerDepthProvider} from '../Layer/LayerDepthContext';
import {dispatchLayerEscapeKeyDown} from '../Layer/layerStack';
import {useLayerDismissal} from '../Layer/useLayerDismissal';
import {composeEventHandlers, mergeProps} from '../utils';
import {BottomSheetEdgeTint} from './BottomSheetEdgeTint';
import {
  BottomSheetSwitcherContext,
  type BottomSheetSwitcherContextValue,
  type BottomSheetSwitcherPhase,
  type BottomSheetSwitcherTransitionEvent,
} from './BottomSheetSwitcherContext';
import {useInteractionModalityTracking} from '../utils/interactionModality';
import {
  unstable_BottomSheetStackParentLevelContext,
  unstable_useBottomSheetStackHost as useBottomSheetStackHost,
  unstable_useBottomSheetStackLevel as useBottomSheetStackLevel,
} from './unstable_stack';

import {useMergedRefs} from '../hooks/useMergedRefs';

// JSX needs a capitalized tag to treat the provider as a component.
const StackParentLevelContext = unstable_BottomSheetStackParentLevelContext;

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
    borderWidth: 0,
    borderStyle: 'none',
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
  // As one level of a stacking host, the switcher is a full-size, pointer-
  // transparent element inside the box the host places in its dialog. Its
  // panels keep their own bottom-anchored positioners and opt back into
  // pointer input.
  stackedLevel: {
    position: 'absolute',
    inset: 0,
    pointerEvents: 'none',
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
 *
 * @example
 * ```
 * <BottomSheetSwitcher
 *   activeSheet={activeSheet}
 *   onActiveSheetChange={setActiveSheet}>
 *   <BottomSheet sheetId="details" label="Details">…</BottomSheet>
 *   <BottomSheet sheetId="confirm" label="Confirm">…</BottomSheet>
 * </BottomSheetSwitcher>
 * ```
 */
export function BottomSheetSwitcher({
  activeSheet,
  onActiveSheetChange,
  hasScrim,
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
  // Under a stacking host the host owns the dialog and its modality; the
  // switcher's own `hasScrim` is not consulted there.
  const stackHost = useBottomSheetStackHost();
  const isStacked = stackHost != null;
  const hostHasScrim = isStacked ? stackHost.hasScrim : (hasScrim ?? true);
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
  const isModal = hostHasScrim && isFlowVisible && !isStacked;
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
  });
  // Before the shared dismissal stack, this modal trap supplied `onEscape`, so
  // the released compatibility shim reported it as active. Keep that signal
  // without registering the switcher twice in the one shared stack.
  useFocusTrapEscapeCompatibilitySignal(isModal);
  const {shouldDismissOnCloseRequest} = useLayerDismissal({
    isActive: isFlowVisible && !isStacked,
    escapeBehavior: allowsEscapeDismiss ? 'close' : 'block',
    onDismiss: dismissOnEscape,
    getContainer: () => dialogRef.current,
    isPresent: () => dialogRef.current?.open ?? false,
  });
  useScrollLock(isModal);

  // Open one shared shell for the complete flow. Modal flows enter the native
  // top layer once; handoffs only swap panels inside it. The final panel owns
  // the exit timing, so isFlowVisible becomes false only when it is safe to
  // close the dialog and restore focus.
  useLayoutEffect(() => {
    const dialog = dialogRef.current;
    if (dialog == null) {
      // A stacked switcher renders no dialog; the host presents the level.
      return;
    }

    if (isFlowVisible) {
      const nextMode = hostHasScrim ? 'modal' : 'non-modal';
      if (dialog.open && dialogModeRef.current !== nextMode) {
        dialog.close();
      }
      if (!dialog.open) {
        if (hostHasScrim && triggerRef.current == null) {
          triggerRef.current = document.activeElement as HTMLElement | null;
        }
        if (hostHasScrim) {
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
  }, [hostHasScrim, isFlowVisible]);

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

  // Report this level to its host. `dismiss` keeps one identity so the host
  // can compare reported state by value. Without a host the hook registers
  // nothing.
  const onActiveSheetChangeRef = useRef(onActiveSheetChange);
  useLayoutEffect(() => {
    onActiveSheetChangeRef.current = onActiveSheetChange;
  }, [onActiveSheetChange]);
  const dismissLevel = useCallback(() => {
    onActiveSheetChangeRef.current(null);
  }, []);
  const activeLabel =
    (activeSheet == null ? null : sheetLabels.get(activeSheet)) ??
    (visibleTransition.retainedSheet == null
      ? undefined
      : sheetLabels.get(visibleTransition.retainedSheet));
  const stackLevel = useBottomSheetStackLevel(stackHost, 'switcher', {
    isOpen: activeSheet != null && !unmountedSheetIds.has(activeSheet),
    isPresented: isFlowVisible,
    purpose: activeSheetPurpose,
    label: activeLabel,
    finalFocusRef: undefined,
    dismiss: dismissLevel,
  });

  const hostScrimOpacity = isStacked ? stackLevel.onScrimOpacity : null;
  const setScrimOpacity = useCallback(
    (opacity: number) => {
      if (hostScrimOpacity != null) {
        hostScrimOpacity(opacity);
        return;
      }
      dialogRef.current?.style.setProperty(
        '--_sheet-scrim-opacity',
        String(opacity),
      );
    },
    [hostScrimOpacity],
  );
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
    if (isStacked) {
      // The host fades its one backdrop from its own open-level count.
      return;
    }
    setScrimOpacity(activeSheet == null ? 0 : 1);
  }, [activeSheet, isStacked, setScrimOpacity]);

  const contextValue = useMemo<BottomSheetSwitcherContextValue>(
    () => ({
      activeSheet,
      hasScrim: hostHasScrim,
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
      hostHasScrim,
      onActiveSheetChange,
      onSheetEnterStart,
      onSheetScrimOpacityChange,
      onSheetTransitionComplete,
      registerSheetElement,
      registerSheetLabel,
      registerSheetPurpose,
    ],
  );

  const handleCancel = useCallback(
    (event: SyntheticEvent<HTMLDialogElement>) => {
      event.preventDefault();
      if (shouldDismissOnCloseRequest()) {
        dismissOnEscape();
      }
    },
    [dismissOnEscape, shouldDismissOnCloseRequest],
  );
  const handleKeyDown = useCallback(
    (event: ReactKeyboardEvent<HTMLDialogElement>) => {
      // A consumer may stop propagation without claiming Escape. Route that
      // unprevented press now so the shared stack still chooses the top layer;
      // its preventDefault marker makes the document listener a no-op if the
      // event does continue bubbling.
      dispatchLayerEscapeKeyDown(event.nativeEvent);
    },
    [],
  );
  const handleClick = useCallback(
    (event: ReactMouseEvent<HTMLDialogElement>) => {
      if (hostHasScrim && event.target === event.currentTarget) {
        dismissOnLightInteraction();
      }
    },
    [dismissOnLightInteraction, hostHasScrim],
  );

  const dialogStyleProps = stylex.props(
    styles.dialog,
    isFlowVisible && styles.dialogOpen,
    hostHasScrim && styles.scrim,
    hostHasScrim && isFlowVisible && activeSheet == null && styles.scrimClosing,
    !hostHasScrim && styles.dialogNonModal,
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

  const mergedDialogRef = useMergedRefs(ref, dialogRef, containerRef);
  // The host returns focus with the shared modality when the stack closes;
  // the tracking is document-wide, so turning it on here covers the host.
  useInteractionModalityTracking();
  useDevWarning(
    'BottomSheetSwitcher',
    '`hasScrim` on a BottomSheet or BottomSheetSwitcher inside a ' +
      'BottomSheetStack is ignored; the stack owns the one scrim. Set ' +
      '`hasScrim` on the BottomSheetStack instead.',
    isStacked && hasScrim !== undefined,
  );

  if (stackHost != null) {
    // The anchor stays in place for ordering; the level element portals into
    // the box the host places in its dialog. Items find this level's view
    // through the parent-level context, and a standalone sheet rendered in a
    // step's content becomes a level right above this one. The level element
    // is a <div>; the inherited dialog attributes it receives are the same
    // HTML attributes under a different element type.
    const levelProps = props as unknown as HTMLAttributes<HTMLDivElement>;
    const levelElement = (
      <div
        {...levelProps}
        {...mergeProps(
          stylex.props(styles.stackedLevel, xstyle),
          className,
          style,
        )}
        data-bottom-sheet-switcher-level="">
        <StackParentLevelContext value={stackLevel.id}>
          <BottomSheetSwitcherContext value={contextValue}>
            {children}
          </BottomSheetSwitcherContext>
        </StackParentLevelContext>
      </div>
    );
    return (
      <>
        <span
          hidden
          ref={stackLevel.anchorRef}
          data-bottom-sheet-stack-anchor=""
        />
        {stackLevel.portalTarget == null
          ? null
          : createPortal(levelElement, stackLevel.portalTarget)}
      </>
    );
  }

  return (
    <BottomSheetSwitcherContext value={contextValue}>
      <dialog
        {...props}
        {...dialogPresentationProps}
        ref={mergedDialogRef}
        aria-label={ariaLabel}
        aria-modal={isModal ? 'true' : undefined}
        onCancel={composeEventHandlers(onCancel, handleCancel)}
        onClick={composeEventHandlers(onClick, handleClick)}
        onKeyDown={composeEventHandlers(onKeyDown, handleKeyDown)}
        {...(activeSheetPurpose === 'required'
          ? {role: 'alertdialog'}
          : undefined)}>
        <LayerDepthProvider>{children}</LayerDepthProvider>
        <BottomSheetEdgeTint />
      </dialog>
    </BottomSheetSwitcherContext>
  );
}

BottomSheetSwitcher.displayName = 'BottomSheetSwitcher';
