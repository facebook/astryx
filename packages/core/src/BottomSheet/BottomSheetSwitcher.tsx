// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file BottomSheetSwitcher.tsx
 * @input Uses React context, shared layer dismissal, BottomSheetSwitcherContext
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
 * The switcher renders no element of its own. Every child sheet owns a native
 * `<dialog>`, exactly like a standalone sheet: a scrim flow presents each
 * sheet with showModal(), a no-scrim flow with show(). The browser then does
 * what a modal dialog does -- the page is inert, focus stays in the top-layer
 * dialog, Escape and the platform close arrive as `cancel` -- and a CSS rule
 * keyed off `dialog:modal` locks page scroll (see sheetScrollLock.ts). The
 * switcher is only the coordinator: it decides which sheet dialog is
 * presented, retained, or hidden, keeps one scrim painted across a handoff
 * (the retained sheet's backdrop until it fades, then the new sheet's,
 * swapped without a fade), holds the one layer-dismissal registration for the
 * flow, and returns focus to the flow's opener when the flow ends, which no
 * single dialog can know. Its `ref`, `onCancel`, and dialog props resolve to
 * the dialog hosting the active sheet.
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/BottomSheet/BottomSheet.tsx
 * - /packages/core/src/BottomSheet/BottomSheetSwitcherContext.ts
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
  type KeyboardEvent as ReactKeyboardEvent,
  type MouseEvent as ReactMouseEvent,
  type ReactNode,
  type SyntheticEvent,
} from 'react';
import type {BaseProps} from '../BaseProps';
import type {DialogPurpose} from '../Dialog';
import {useFocusTrapEscapeCompatibilitySignal} from '../hooks/useFocusTrap';
import {dispatchLayerEscapeKeyDown} from '../Layer/layerStack';
import {useLayerDismissal} from '../Layer/useLayerDismissal';
import {composeEventHandlers} from '../utils';
import {
  BottomSheetSwitcherContext,
  type BottomSheetSwitcherContextValue,
  type BottomSheetSwitcherDialogProps,
  type BottomSheetSwitcherPhase,
  type BottomSheetSwitcherTransitionEvent,
} from './BottomSheetSwitcherContext';

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

/**
 * Keeps one object identity while its own enumerable entries are unchanged, so
 * the consumer's rest props can sit in a memoized context value without
 * refreshing every sheet host on each switcher render.
 */
function useShallowStable<T extends object>(value: T): T {
  const stableRef = useRef(value);
  const previous = stableRef.current;
  const previousKeys = Object.keys(previous) as (keyof T)[];
  const nextKeys = Object.keys(value) as (keyof T)[];
  const isSame =
    previousKeys.length === nextKeys.length &&
    nextKeys.every(key => Object.is(previous[key], value[key]));
  if (!isSame) {
    stableRef.current = value;
  }
  return stableRef.current;
}

function assignRef<T>(ref: React.Ref<T> | undefined, value: T | null): void {
  if (typeof ref === 'function') {
    ref(value);
  } else if (ref != null) {
    (ref as {current: T | null}).current = value;
  }
}

/**
 * Hands the flow's scrim to `dialog` without a fade. The backdrop's opacity
 * transition would otherwise ease from the transparent value the entering
 * dialog was presented with, dipping the page's dim for one motion token
 * exactly when the previous dialog's backdrop disappears. Even a near-zero
 * duration paints its first frame at the start value, so the swap disables
 * the transition outright, flushes style so the new value is committed under
 * that rule, then restores the token for later gesture and exit fades.
 */
function takeOverScrim(dialog: HTMLDialogElement, opacity: number): void {
  dialog.style.setProperty('--_sheet-scrim-duration', '0s');
  dialog.style.setProperty('--_sheet-scrim-opacity', String(opacity));
  if (typeof getComputedStyle === 'function') {
    void getComputedStyle(dialog, '::backdrop').opacity;
  }
  dialog.style.removeProperty('--_sheet-scrim-duration');
}

export interface BottomSheetSwitcherProps extends BaseProps<HTMLDialogElement> {
  /**
   * Ref resolved to the native dialog hosting the active sheet. It moves on
   * every handoff and is null while the flow is closed.
   */
  ref?: React.Ref<HTMLDialogElement>;

  /** Called when the active sheet's native dialog receives a cancel event. */
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
   * Whether each sheet dialog opens modally with a native ::backdrop.
   * Disable for a viewport-anchored, non-modal flow over an interactive page.
   * @default true
   */
  hasScrim?: boolean;

  /** BottomSheets identified by unique `sheetId` values. */
  children: ReactNode;
}

/**
 * Coordinates a set of BottomSheets so zero or one is active at a time, each
 * in its own native dialog. During a handoff the previous panel stays visible
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
  hasScrim = true,
  children,
  ref,
  onCancel,
  onClick,
  onKeyDown,
  className,
  style,
  xstyle,
  ...restDialogProps
}: BottomSheetSwitcherProps) {
  // Every sheet host applies the switcher's dialog surface to its own dialog.
  const dialogProps = useShallowStable<BottomSheetSwitcherDialogProps>({
    ...restDialogProps,
    className,
    style,
    xstyle,
  });
  const hostDialogRef = useRef<HTMLDialogElement | null>(null);
  const sheetDialogsRef = useRef(new Map<string, HTMLDialogElement>());
  const presentationOrderRef = useRef(new Map<string, number>());
  const presentationCounterRef = useRef(0);
  const modalFlowRef = useRef(false);
  const triggerRef = useRef<HTMLElement | null>(null);
  const sheetElementsRef = useRef(new Map<string, HTMLElement>());
  const committedActiveSheetRef = useRef(activeSheet);
  const scrimOpacityRef = useRef(1);
  const scrimOwnerRef = useRef<string | null>(null);
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
  const presentedActiveSheet =
    activeSheet != null && !unmountedSheetIds.has(activeSheet)
      ? activeSheet
      : null;
  const presentedRetainedSheet =
    visibleTransition.retainedSheet != null &&
    !unmountedSheetIds.has(visibleTransition.retainedSheet)
      ? visibleTransition.retainedSheet
      : null;
  const isFlowVisible =
    presentedActiveSheet != null || presentedRetainedSheet != null;
  const isModal = hasScrim && isFlowVisible;
  // The dialog that hosts the flow for its ref and dismissal registration:
  // the active sheet's, or the retained sheet's while the flow closes through
  // its exit.
  const hostSheet = presentedActiveSheet ?? presentedRetainedSheet;
  // The dialog whose backdrop paints the flow's one scrim. A retained sheet
  // keeps it through a handoff so the entering dialog, presented above it in
  // the top layer, does not dim the previous panel beneath its own backdrop.
  const scrimOwnerSheet = presentedRetainedSheet ?? presentedActiveSheet;
  const isFlowClosing = isFlowVisible && activeSheet == null;
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
  // Focus containment is the native modal dialog's: showModal() makes the
  // page inert, so Tab cannot leave the active sheet. The released read-only
  // `hasActiveFocusTrapEscape()` signal still reports a modal flow as a trap,
  // as it did when a JavaScript trap backed it.
  useFocusTrapEscapeCompatibilitySignal(isModal);
  const {shouldDismissOnCloseRequest} = useLayerDismissal({
    isActive: isFlowVisible,
    escapeBehavior: allowsEscapeDismiss ? 'close' : 'block',
    onDismiss: dismissOnEscape,
    getContainer: () => hostDialogRef.current,
    isPresent: () => hostDialogRef.current?.open ?? false,
  });

  // Point the consumer ref and the dismissal registration at the host dialog.
  // Sheet hosts register their dialogs during commit, so by the time this
  // layout effect runs the map already names the dialog for `hostSheet`.
  useLayoutEffect(() => {
    const host =
      hostSheet == null
        ? null
        : (sheetDialogsRef.current.get(hostSheet) ?? null);
    hostDialogRef.current = host;
    assignRef(ref, host);
    return () => {
      hostDialogRef.current = null;
      assignRef(ref, null);
    };
  }, [hostSheet, ref]);

  // Focus return is native per dialog: each showModal() records the focused
  // element and close() focuses it again. That serves a one-sheet flow, but
  // the second sheet of a flow records a control inside the first, which is
  // hidden by the time the flow ends, so the browser's return lands nowhere.
  // The flow therefore remembers its own opener -- the page element focused
  // before the first modal present -- and focuses it after the last dialog
  // closes. Sheet hosts ask before presenting modally, so the capture sees
  // the page element; hosts present in their own layout effects, which run
  // before the one below, so the restore follows the last dialog's close.
  const onBeforeSheetPresent = useCallback((sheetId: string) => {
    if (triggerRef.current == null) {
      triggerRef.current = document.activeElement as HTMLElement | null;
    }
    modalFlowRef.current = true;
    presentationCounterRef.current += 1;
    presentationOrderRef.current.set(sheetId, presentationCounterRef.current);
  }, []);
  useLayoutEffect(() => {
    if (isFlowVisible) {
      if (!hasScrim) {
        modalFlowRef.current = false;
      }
      return;
    }
    if (modalFlowRef.current) {
      // Like the browser's own return on close(), without scrolling: the
      // page kept its scroll offset under the lock, and an opener scrolled
      // out of view must not drag the page back to itself.
      triggerRef.current?.focus({preventScroll: true});
    }
    triggerRef.current = null;
    modalFlowRef.current = false;
    presentationOrderRef.current.clear();
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

  const isScrimOwner = useCallback(
    (sheetId: string) => sheetId === scrimOwnerSheet,
    [scrimOwnerSheet],
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

  const registerSheetDialog = useCallback(
    (sheetId: string, dialog: HTMLDialogElement | null) => {
      if (dialog == null) {
        sheetDialogsRef.current.delete(sheetId);
        presentationOrderRef.current.delete(sheetId);
      } else {
        sheetDialogsRef.current.set(sheetId, dialog);
      }
    },
    [],
  );

  const isCoveredInTopLayer = useCallback((sheetId: string) => {
    const order = presentationOrderRef.current;
    const own = order.get(sheetId);
    if (own == null) {
      return false;
    }
    for (const [otherId, stamp] of order) {
      if (
        otherId !== sheetId &&
        stamp > own &&
        sheetDialogsRef.current.get(otherId)?.open
      ) {
        return true;
      }
    }
    return false;
  }, []);

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

  // One scrim for the flow. Only the owning dialog's backdrop carries the
  // current opacity; every other presented dialog keeps its backdrop clear.
  // When ownership moves — the retained dialog has faded and closes, or a
  // rapid replacement hides it — the new owner takes the value without a
  // fade, in the same layout pass that closes the old one.
  const applyScrimOpacity = useCallback(() => {
    const owner =
      scrimOwnerSheet == null
        ? null
        : (sheetDialogsRef.current.get(scrimOwnerSheet) ?? null);
    // A fresh open keeps the backdrop's @starting-style fade; only a hand
    // from one presented dialog to another swaps without one.
    const ownerChanged =
      scrimOwnerRef.current != null &&
      scrimOwnerRef.current !== scrimOwnerSheet;
    scrimOwnerRef.current = scrimOwnerSheet;
    for (const [sheetId, dialog] of sheetDialogsRef.current) {
      if (dialog === owner) {
        if (ownerChanged && dialog.open) {
          takeOverScrim(dialog, scrimOpacityRef.current);
        } else {
          dialog.style.setProperty(
            '--_sheet-scrim-opacity',
            String(scrimOpacityRef.current),
          );
        }
      } else if (sheetId !== scrimOwnerSheet) {
        dialog.style.setProperty('--_sheet-scrim-opacity', '0');
      }
    }
  }, [scrimOwnerSheet]);
  const onSheetScrimOpacityChange = useCallback(
    (sheetId: string, opacity: number) => {
      // A pointer captured by the outgoing sheet can keep delivering gesture
      // events after a handoff. Only the currently committed sheet owns the
      // flow's scrim value, so stale gesture updates must not reach it.
      if (sheetId !== committedActiveSheetRef.current) {
        return;
      }
      scrimOpacityRef.current = opacity;
      applyScrimOpacity();
    },
    [applyScrimOpacity],
  );

  useLayoutEffect(() => {
    scrimOpacityRef.current = activeSheet == null ? 0 : 1;
  }, [activeSheet]);
  useLayoutEffect(applyScrimOpacity, [
    applyScrimOpacity,
    activeSheet,
    hasScrim,
    isFlowVisible,
  ]);

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
      // A `::backdrop` click targets its dialog element. Only the active
      // sheet's backdrop is the flow's scrim; a retained dialog is inert and
      // a hidden one closed, so neither can be clicked, but be explicit.
      if (
        hasScrim &&
        event.target === event.currentTarget &&
        event.currentTarget === hostDialogRef.current
      ) {
        dismissOnLightInteraction();
      }
    },
    [dismissOnLightInteraction, hasScrim],
  );
  const onDialogCancel = useMemo(
    () => composeEventHandlers(onCancel, handleCancel),
    [handleCancel, onCancel],
  );
  const onDialogClick = useMemo(
    () => composeEventHandlers(onClick, handleClick),
    [handleClick, onClick],
  );
  const onDialogKeyDown = useMemo(
    () => composeEventHandlers(onKeyDown, handleKeyDown),
    [handleKeyDown, onKeyDown],
  );

  const contextValue = useMemo<BottomSheetSwitcherContextValue>(
    () => ({
      activeSheet,
      hasScrim,
      onActiveSheetChange,
      getSheetPhase,
      getSheetAlignmentOffset,
      isScrimOwner,
      isFlowClosing,
      registerSheetElement,
      registerSheetDialog,
      registerSheetPurpose,
      onBeforeSheetPresent,
      isCoveredInTopLayer,
      onSheetEnterStart,
      onSheetTransitionComplete,
      onSheetScrimOpacityChange,
      dialogProps,
      onDialogCancel,
      onDialogClick,
      onDialogKeyDown,
    }),
    [
      activeSheet,
      dialogProps,
      getSheetAlignmentOffset,
      getSheetPhase,
      hasScrim,
      isCoveredInTopLayer,
      isFlowClosing,
      isScrimOwner,
      onActiveSheetChange,
      onBeforeSheetPresent,
      onDialogCancel,
      onDialogClick,
      onDialogKeyDown,
      onSheetEnterStart,
      onSheetScrimOpacityChange,
      onSheetTransitionComplete,
      registerSheetDialog,
      registerSheetElement,
      registerSheetPurpose,
    ],
  );

  return (
    <BottomSheetSwitcherContext value={contextValue}>
      {children}
    </BottomSheetSwitcherContext>
  );
}

BottomSheetSwitcher.displayName = 'BottomSheetSwitcher';
