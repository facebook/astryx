// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file BottomSheetStack.tsx
 * @input Uses React context, StyleX, focus/scroll-lock/layer hooks, BottomSheetStackContext
 * @output Exports BottomSheetStack and BottomSheetStackProps
 * @position Core controller for visibly stacked BottomSheet flows
 *
 * BottomSheetStack turns declaratively nested BottomSheets into one controlled
 * ordered stack. `openSheetIds` is ordered bottom-to-top. The last sheet is the
 * only interactive and dismissible sheet; covered sheets stay mounted, visible,
 * inert, and progressively transformed by their depth.
 *
 * All sheets render inside one stack-owned native <dialog>. This keeps one modal
 * boundary, one scrim, one focus trap, and one scroll lock across push and pop
 * transitions. Logical state follows the controlled array immediately while a
 * removed top sheet may remain mounted long enough to finish its exit motion.
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/BottomSheet/BottomSheet.tsx
 * - /packages/core/src/BottomSheet/BottomSheetEdgeTint.tsx
 * - /packages/core/src/BottomSheet/BottomSheetStackContext.ts
 * - /packages/core/src/BottomSheet/BottomSheetStack.doc.mjs
 * - /packages/core/src/BottomSheet/BottomSheetStack.test.tsx
 * - /packages/core/src/BottomSheet/index.ts
 * - /apps/storybook/stories/BottomSheetStack.stories.tsx
 * - /packages/cli/assets/templates/blocks/components/BottomSheet/BottomSheetStackShowcase.tsx
 * - /docs/families/overlay-dismissal.md
 */

import {
  useCallback,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type MouseEvent as ReactMouseEvent,
  type ReactNode,
  type SyntheticEvent,
} from 'react';
import * as stylex from '@stylexjs/stylex';
import type {BaseProps} from '../BaseProps';
import type {DialogPurpose} from '../Dialog';
import {
  useDevWarning,
  useFocusTrap,
  useMergedRefs,
  useScrollLock,
} from '../hooks';
import {LayerDepthProvider} from '../Layer/LayerDepthContext';
import {useLayerDismissal} from '../Layer/useLayerDismissal';
import {colorVars, durationVars, easeVars} from '../theme/tokens.stylex';
import {composeEventHandlers, mergeProps} from '../utils';
import {BottomSheetEdgeTint} from './BottomSheetEdgeTint';
import {
  BottomSheetStackContext,
  type BottomSheetStackContextValue,
  type BottomSheetStackPhase,
  type BottomSheetStackTransitionEvent,
} from './BottomSheetStackContext';
import {BottomSheetSwitcherContext} from './BottomSheetSwitcherContext';

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
});

interface StackTransitionState {
  enteringSheet: string | null;
  exitingSheet: string | null;
}

const IDLE_TRANSITION: StackTransitionState = {
  enteringSheet: null,
  exitingSheet: null,
};

function stacksEqual(
  first: ReadonlyArray<string>,
  second: ReadonlyArray<string>,
): boolean {
  return (
    first.length === second.length &&
    first.every((sheetId, index) => sheetId === second[index])
  );
}

function isPrefix(
  prefix: ReadonlyArray<string>,
  sheets: ReadonlyArray<string>,
): boolean {
  return prefix.every((sheetId, index) => sheetId === sheets[index]);
}

function transitionForOpenSheetIdsChange(
  previousSheets: ReadonlyArray<string>,
  nextSheets: ReadonlyArray<string>,
): StackTransitionState {
  if (
    nextSheets.length === previousSheets.length + 1 &&
    isPrefix(previousSheets, nextSheets)
  ) {
    return {
      enteringSheet: nextSheets[nextSheets.length - 1] ?? null,
      exitingSheet: null,
    };
  }
  if (
    previousSheets.length === nextSheets.length + 1 &&
    isPrefix(nextSheets, previousSheets)
  ) {
    return {
      enteringSheet: null,
      exitingSheet: previousSheets[previousSheets.length - 1] ?? null,
    };
  }
  return IDLE_TRANSITION;
}

export interface BottomSheetStackProps extends BaseProps<HTMLDialogElement> {
  /** Ref forwarded to the shared native dialog. */
  ref?: React.Ref<HTMLDialogElement>;

  /** Called when the shared native dialog receives a cancel event. */
  onCancel?: (event: SyntheticEvent<HTMLDialogElement>) => void;

  /**
   * Open BottomSheet IDs ordered bottom-to-top. IDs must be unique and match
   * nested BottomSheet `sheetId` values. An empty array closes the stack.
   */
  openSheetIds: ReadonlyArray<string>;

  /** Called with the next stack when the top sheet requests dismissal. */
  onOpenSheetIdsChange: (openSheetIds: ReadonlyArray<string>) => void;

  /**
   * Whether to open the shared dialog modally with its native ::backdrop.
   * Disable for a viewport-anchored, non-modal stack over an interactive page.
   * @default true
   */
  hasScrim?: boolean;

  /** BottomSheets identified by unique `sheetId` values. */
  children: ReactNode;
}

/**
 * Coordinates BottomSheets as an ordered visual stack inside one shared native
 * dialog. Only the last openSheetIds entry is interactive and dismissible.
 */
export function BottomSheetStack({
  openSheetIds,
  onOpenSheetIdsChange,
  hasScrim = true,
  children,
  ref,
  xstyle,
  className,
  style,
  onCancel,
  onClick,
  ...props
}: BottomSheetStackProps) {
  const dialogRef = useRef<HTMLDialogElement | null>(null);
  const dialogModeRef = useRef<'modal' | 'non-modal' | null>(null);
  const triggerRef = useRef<HTMLElement | null>(null);
  const sheetElementsRef = useRef(new Map<string, HTMLElement>());
  const committedOpenSheetIdsRef = useRef<ReadonlyArray<string>>([
    ...openSheetIds,
  ]);
  const [sheetLabels, setSheetLabels] = useState<ReadonlyMap<string, string>>(
    () => new Map(),
  );
  const [sheetPurposes, setSheetPurposes] = useState<
    ReadonlyMap<string, DialogPurpose>
  >(() => new Map());
  const [transition, setTransition] =
    useState<StackTransitionState>(IDLE_TRANSITION);

  const openSheetIdsChanged = !stacksEqual(
    committedOpenSheetIdsRef.current,
    openSheetIds,
  );
  const visibleTransition = openSheetIdsChanged
    ? transitionForOpenSheetIdsChange(
        committedOpenSheetIdsRef.current,
        openSheetIds,
      )
    : transition;
  const topSheet = openSheetIds[openSheetIds.length - 1] ?? null;
  const isStackVisible =
    topSheet != null || visibleTransition.exitingSheet != null;
  const isModal = hasScrim && isStackVisible;
  const topSheetPurpose =
    (topSheet == null
      ? visibleTransition.exitingSheet == null
        ? null
        : sheetPurposes.get(visibleTransition.exitingSheet)
      : sheetPurposes.get(topSheet)) ?? 'info';
  const allowsEscapeDismiss = topSheetPurpose !== 'required';
  const allowsLightDismiss = topSheetPurpose === 'info';

  useDevWarning(
    'BottomSheetStack',
    '`openSheetIds` must contain unique BottomSheet IDs ordered bottom-to-top.',
    new Set(openSheetIds).size !== openSheetIds.length,
  );

  useLayoutEffect(() => {
    const previousSheets = committedOpenSheetIdsRef.current;
    if (stacksEqual(previousSheets, openSheetIds)) {
      return;
    }
    committedOpenSheetIdsRef.current = [...openSheetIds];
    const nextTransition = transitionForOpenSheetIdsChange(
      previousSheets,
      openSheetIds,
    );
    setTransition(
      nextTransition.exitingSheet != null &&
        !sheetElementsRef.current.has(nextTransition.exitingSheet)
        ? IDLE_TRANSITION
        : nextTransition,
    );
  }, [openSheetIds]);

  const requestTopDismiss = useCallback(() => {
    if (topSheet != null) {
      onOpenSheetIdsChange(openSheetIds.slice(0, -1));
    }
  }, [onOpenSheetIdsChange, openSheetIds, topSheet]);
  const dismissOnEscape = useCallback(() => {
    if (allowsEscapeDismiss) {
      requestTopDismiss();
    }
  }, [allowsEscapeDismiss, requestTopDismiss]);
  const dismissOnLightInteraction = useCallback(() => {
    if (allowsLightDismiss) {
      requestTopDismiss();
    }
  }, [allowsLightDismiss, requestTopDismiss]);

  const {containerRef} = useFocusTrap<HTMLDialogElement>({
    isActive: isModal,
  });
  const {shouldDismissOnCloseRequest} = useLayerDismissal({
    isActive: isStackVisible,
    escapeBehavior: allowsEscapeDismiss ? 'close' : 'block',
    onDismiss: dismissOnEscape,
    getContainer: () => dialogRef.current,
    isPresent: () => dialogRef.current?.open ?? false,
  });
  useScrollLock(isModal);

  useLayoutEffect(() => {
    const dialog = dialogRef.current;
    if (dialog == null) {
      return;
    }

    if (isStackVisible) {
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
  }, [hasScrim, isStackVisible]);

  const getSheetPhase = useCallback(
    (sheetId: string): BottomSheetStackPhase => {
      if (sheetId === visibleTransition.exitingSheet) {
        return 'exiting';
      }
      const sheetIndex = openSheetIds.lastIndexOf(sheetId);
      if (sheetIndex < 0) {
        return 'hidden';
      }
      if (sheetIndex === openSheetIds.length - 1) {
        return sheetId === visibleTransition.enteringSheet
          ? 'entering'
          : 'active';
      }
      return 'covered';
    },
    [openSheetIds, visibleTransition],
  );

  const getSheetDepth = useCallback(
    (sheetId: string) => {
      const sheetIndex = openSheetIds.lastIndexOf(sheetId);
      return sheetIndex < 0 ? 0 : openSheetIds.length - 1 - sheetIndex;
    },
    [openSheetIds],
  );

  const getSheetLayer = useCallback(
    (sheetId: string) => {
      if (sheetId === visibleTransition.exitingSheet) {
        return openSheetIds.length + 1;
      }
      const sheetIndex = openSheetIds.lastIndexOf(sheetId);
      return sheetIndex < 0 ? 0 : sheetIndex + 1;
    },
    [openSheetIds, visibleTransition.exitingSheet],
  );

  const registerSheetElement = useCallback(
    (sheetId: string, element: HTMLElement | null) => {
      if (element == null) {
        sheetElementsRef.current.delete(sheetId);
        setTransition(current =>
          current.enteringSheet === sheetId || current.exitingSheet === sheetId
            ? IDLE_TRANSITION
            : current,
        );
      } else {
        sheetElementsRef.current.set(sheetId, element);
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

  const onSheetTransitionComplete = useCallback(
    ({sheetId, phase}: BottomSheetStackTransitionEvent) => {
      setTransition(current => {
        if (phase === 'entering' && current.enteringSheet === sheetId) {
          return {...current, enteringSheet: null};
        }
        if (phase === 'exiting' && current.exitingSheet === sheetId) {
          return {...current, exitingSheet: null};
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
      const committedSheets = committedOpenSheetIdsRef.current;
      if (sheetId !== committedSheets[committedSheets.length - 1]) {
        return;
      }
      setScrimOpacity(opacity);
    },
    [setScrimOpacity],
  );

  useLayoutEffect(() => {
    setScrimOpacity(topSheet == null ? 0 : 1);
  }, [setScrimOpacity, topSheet]);

  const contextValue = useMemo<BottomSheetStackContextValue>(
    () => ({
      openSheetIds,
      topSheet,
      hasScrim,
      requestTopDismiss,
      getSheetPhase,
      getSheetDepth,
      getSheetLayer,
      registerSheetElement,
      registerSheetLabel,
      registerSheetPurpose,
      onSheetTransitionComplete,
      onSheetScrimOpacityChange,
    }),
    [
      getSheetDepth,
      getSheetLayer,
      getSheetPhase,
      hasScrim,
      onSheetScrimOpacityChange,
      onSheetTransitionComplete,
      openSheetIds,
      registerSheetElement,
      registerSheetLabel,
      registerSheetPurpose,
      requestTopDismiss,
      topSheet,
    ],
  );

  const activeLabel =
    (topSheet == null ? null : sheetLabels.get(topSheet)) ??
    (visibleTransition.exitingSheet == null
      ? undefined
      : sheetLabels.get(visibleTransition.exitingSheet));

  const handleCancel = useCallback(
    (event: SyntheticEvent<HTMLDialogElement>) => {
      event.preventDefault();
      if (shouldDismissOnCloseRequest()) {
        dismissOnEscape();
      }
    },
    [dismissOnEscape, shouldDismissOnCloseRequest],
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
    isStackVisible && styles.dialogOpen,
    hasScrim && styles.scrim,
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
    <BottomSheetSwitcherContext value={null}>
      <BottomSheetStackContext value={contextValue}>
        <dialog
          {...props}
          {...dialogPresentationProps}
          ref={useMergedRefs(ref, dialogRef, containerRef)}
          aria-label={ariaLabel}
          aria-modal={isModal ? 'true' : undefined}
          onCancel={composeEventHandlers(onCancel, handleCancel)}
          onClick={composeEventHandlers(onClick, handleClick)}
          {...(topSheetPurpose === 'required'
            ? {role: 'alertdialog'}
            : undefined)}>
          <LayerDepthProvider>{children}</LayerDepthProvider>
          <BottomSheetEdgeTint />
        </dialog>
      </BottomSheetStackContext>
    </BottomSheetSwitcherContext>
  );
}

BottomSheetStack.displayName = 'BottomSheetStack';
