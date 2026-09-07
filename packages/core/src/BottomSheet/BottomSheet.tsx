// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file BottomSheet.tsx
 * @input Uses React, StyleX, core hooks/utils, BottomSheetPanel, switcher/stack contexts
 * @output Exports BottomSheet component and BottomSheetProps
 * @position Public BottomSheet router plus private standalone/controller hosts
 *
 * BottomSheet selects one of three focused hosts. A standalone host owns its
 * native dialog lifecycle; switcher and stack items participate in their
 * parent's shared dialog and transition state machine. Every host renders the
 * same BottomSheetPanel, which owns sheet presentation, gestures,
 * mobile-keyboard accommodation, and motion completion.
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/BottomSheet/BottomSheetPanel.tsx
 * - /packages/core/src/BottomSheet/BottomSheetEdgeTint.tsx
 * - /packages/core/src/BottomSheet/BottomSheet.doc.mjs
 * - /packages/core/src/BottomSheet/BottomSheet.test.tsx
 * - /packages/core/src/BottomSheet/BottomSheetStack.tsx
 * - /packages/core/src/BottomSheet/BottomSheetStack.test.tsx
 * - /packages/core/src/BottomSheet/BottomSheetSwitcher.tsx
 * - /packages/core/src/BottomSheet/BottomSheetSwitcher.test.tsx
 * - /apps/storybook/stories/BottomSheet.stories.tsx
 * - /packages/cli/assets/templates/blocks/components/BottomSheet/BottomSheetShowcase.tsx
 */

import {
  use,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type RefObject,
  type ReactNode,
} from 'react';
import * as stylex from '@stylexjs/stylex';
import type {BaseProps} from '../BaseProps';
import type {DialogPurpose} from '../Dialog';
import {
  colorVars,
  durationVars,
  easeVars,
  spacingVars,
} from '../theme/tokens.stylex';
import {isImeKeyEvent, useDevWarning, useScrollLock} from '../hooks';
import {
  BottomSheetPanel,
  type BottomSheetPanelMotion,
  type BottomSheetPanelState,
} from './BottomSheetPanel';
import {BottomSheetEdgeTint} from './BottomSheetEdgeTint';
import {
  BottomSheetStackContext,
  type BottomSheetStackContextValue,
  type BottomSheetStackPhase,
} from './BottomSheetStackContext';
import {
  BottomSheetSwitcherContext,
  type BottomSheetSwitcherContextValue,
  type BottomSheetSwitcherPhase,
} from './BottomSheetSwitcherContext';

export type {BottomSheetHeight, BottomSheetSnapPoint} from './BottomSheetPanel';
import type {BottomSheetHeight, BottomSheetSnapPoint} from './BottomSheetPanel';

const STACK_VISUAL_DEPTH_LIMIT = 2;
const STACK_SCALE_STEP = 0.04;

function transformForStackDepth(depth: number): string {
  const visualDepth = Math.min(STACK_VISUAL_DEPTH_LIMIT, Math.max(0, depth));
  if (visualDepth === 0) {
    return 'translateY(0) scale(1)';
  }
  const scale = (1 - visualDepth * STACK_SCALE_STEP).toFixed(2);
  return `translateY(calc(${spacingVars['--spacing-2']} * -${visualDepth})) scale(${scale})`;
}

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
  /**
   * The dim leaves with the sheet, on a curve that matches.
   *
   * A fade covers no distance, so the decelerate token front-loads its
   * progress and simply ends it early: `--ease-standard` puts the scrim at 90%
   * faded in 163ms of a 410ms close, leaving an undimmed page under a sheet
   * that is still sliding across it. `linear` spends the duration it is given.
   * Same reasoning the touch date picker's surface swap already carries.
   */
  scrimClosing: {
    '::backdrop': {
      transitionTimingFunction: 'linear',
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
  positionerHidden: {
    display: 'none',
  },
  positionerTop: {
    zIndex: 1,
  },
  positionerStackMotion: {
    transformOrigin: '50% 0',
    transitionProperty: 'transform',
    transitionDuration: durationVars['--duration-medium'],
    transitionTimingFunction: easeVars['--ease-standard'],
    willChange: 'transform',
    '@media (prefers-reduced-motion: reduce)': {
      transitionDuration: '0.01s',
    },
  },
  positionerStackTransform: (transform: string) => ({
    transform,
  }),
  positionerStackLayer: (zIndex: number) => ({
    zIndex,
  }),
});

interface BottomSheetSharedProps extends BaseProps<HTMLDivElement> {
  /** Ref forwarded to the visual sheet panel <div>. */
  ref?: React.Ref<HTMLDivElement>;

  /** Accessible label for the sheet. */
  label: string;

  /** Sheet content, rendered below the grab handle in a scrollable area. */
  children: ReactNode;

  /** Height budget or custom CSS length. Only fully expanded Tall is keyboard-aware. @default 'capped' */
  height?: BottomSheetHeight | number | string;

  /**
   * Extra heights the sheet can rest at when dragged; its own height is always
   * the tallest stop, and omitting this gives a sheet that only opens and
   * closes. Each stop is the sheet's visible height: a number is a viewport
   * fraction (`0.5` is half the screen), `'50%'` the same in CSS, `'320px'` an
   * absolute length. A stop of a quarter of the sheet or less is a peek — it
   * slides away instead of reflowing, and thins the scrim.
   */
  snapPoints?: ReadonlyArray<BottomSheetSnapPoint>;

  /**
   * Configures implicit dismissal behavior, matching Dialog.
   * - required: Blocks swipe, scrim click, and Escape
   * - form: Blocks swipe and scrim click, allows Escape
   * - info: Allows swipe, scrim click, and Escape
   * @default 'info'
   */
  purpose?: DialogPurpose;
}

interface StandaloneBottomSheetProps extends BottomSheetSharedProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  hasScrim?: boolean;
  /** Element that receives focus after the sheet closes. */
  finalFocusRef?: RefObject<HTMLElement | null>;
  sheetId?: never;
}

interface SwitcherBottomSheetProps extends BottomSheetSharedProps {
  sheetId: string;
  isOpen?: never;
  onOpenChange?: never;
  hasScrim?: never;
}

export type BottomSheetProps =
  StandaloneBottomSheetProps | SwitcherBottomSheetProps;

function panelStateForSwitcherPhase(
  phase: BottomSheetSwitcherPhase,
  alignmentOffset: number,
): BottomSheetPanelState {
  switch (phase) {
    case 'active':
      return {kind: 'open', entering: false};
    case 'entering':
      return {kind: 'open', entering: true};
    case 'covered':
    case 'aligning':
    case 'fading':
      return {kind: 'retained', motion: phase, alignmentOffset};
    case 'exiting':
      return {kind: 'exiting'};
    case 'hidden':
      return {kind: 'hidden'};
  }
}

function panelStateForStackPhase(
  phase: BottomSheetStackPhase,
): BottomSheetPanelState {
  switch (phase) {
    case 'active':
      return {kind: 'open', entering: false};
    case 'entering':
      return {kind: 'open', entering: true};
    case 'covered':
      return {kind: 'retained', motion: 'covered', alignmentOffset: 0};
    case 'exiting':
      return {kind: 'exiting'};
    case 'hidden':
      return {kind: 'hidden'};
  }
}

// preventScroll on both: presenting a sheet must not scroll the page to reveal
// what it just focused. For an autofocused field that reveal is the mobile
// keyboard's, and it moves the document under a fixed sheet; useMobileKeyboard
// brings the field into view within the sheet instead.
function focusPanel(panel: HTMLElement | null, isModal: boolean): void {
  const activeElement = document.activeElement;
  if (activeElement != null && panel?.contains(activeElement)) {
    return;
  }
  const autofocus = panel?.querySelector<HTMLElement>('[data-autofocus]');
  if (autofocus != null) {
    autofocus.focus({preventScroll: true});
  } else if (isModal) {
    panel?.focus({preventScroll: true});
  }
}

function StandaloneBottomSheet({
  ref,
  isOpen,
  onOpenChange,
  label,
  children,
  height = 'capped',
  snapPoints,
  hasScrim = true,
  finalFocusRef,
  purpose = 'info',
  xstyle,
  ...props
}: StandaloneBottomSheetProps) {
  const dialogRef = useRef<HTMLDialogElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const triggerRef = useRef<HTMLElement | null>(null);
  const [isPresented, setIsPresented] = useState(isOpen);
  const shouldPresent = isOpen || isPresented;
  const panelState: BottomSheetPanelState = isOpen
    ? {kind: 'open', entering: false}
    : isPresented
      ? {kind: 'exiting'}
      : {kind: 'hidden'};

  const dismissOnEscape = useCallback(() => {
    if (purpose !== 'required') {
      onOpenChange(false);
    }
  }, [onOpenChange, purpose]);
  const dismissOnLightInteraction = useCallback(() => {
    if (purpose === 'info') {
      onOpenChange(false);
    }
  }, [onOpenChange, purpose]);
  const handlePanelElementChange = useCallback(
    (element: HTMLDivElement | null) => {
      panelRef.current = element;
    },
    [],
  );
  const handleScrimOpacity = useCallback((opacity: number) => {
    dialogRef.current?.style.setProperty(
      '--_sheet-scrim-opacity',
      String(opacity),
    );
  }, []);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (dialog == null || !isOpen) {
      return;
    }

    // The controlled prop opens an already-mounted dialog; presentation state
    // must latch here so a later close can keep it mounted through its exit.
    // eslint-disable-next-line @eslint-react/set-state-in-effect -- latches controlled open state for exit animation
    setIsPresented(true);
    dialog.style.setProperty('--_sheet-scrim-opacity', '1');
    const wasOpen = dialog.open;
    if (!wasOpen) {
      if (hasScrim) {
        triggerRef.current = document.activeElement as HTMLElement | null;
        dialog.showModal();
      } else {
        dialog.show();
      }
      focusPanel(panelRef.current, hasScrim);
    }
  }, [hasScrim, isOpen]);

  useEffect(() => {
    if (!isOpen && isPresented && hasScrim) {
      handleScrimOpacity(0);
    }
  }, [handleScrimOpacity, hasScrim, isOpen, isPresented]);

  const handleMotionComplete = useCallback(
    (motion: BottomSheetPanelMotion) => {
      if (motion !== 'exiting' || isOpen) {
        return;
      }
      const dialog = dialogRef.current;
      if (dialog?.open) {
        dialog.close();
      }
      setIsPresented(false);
      (finalFocusRef?.current ?? triggerRef.current)?.focus();
      triggerRef.current = null;
    },
    [finalFocusRef, isOpen],
  );

  useScrollLock(shouldPresent && hasScrim);
  useDevWarning(
    'BottomSheet',
    'requires a non-empty `label` for an accessible name; the open sheet ' +
      'has no built-in heading to derive one from.',
    isOpen && !label,
  );

  const handleCancel = useCallback(
    (event: React.SyntheticEvent<HTMLDialogElement>) => {
      // No IME guard here: `cancel` is a plain Event carrying no composition
      // state, and handleKeyDown claims a composing Escape before the browser
      // can raise the close request that would arrive here.
      event.preventDefault();
      dismissOnEscape();
    },
    [dismissOnEscape],
  );
  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLDialogElement>) => {
      if (event.key !== 'Escape') {
        return;
      }
      // Claim the key before reading it: an unclaimed Escape lets the browser
      // raise its own close request, which lands on handleCancel and dismisses
      // on the same keypress.
      event.preventDefault();
      // An IME fires this keydown to cancel an in-progress composition, ahead
      // of compositionend. It is a composition cancel, not a dismissal command
      // — see utils/ime; Dialog and BottomSheetSwitcher guard the same way.
      if (isImeKeyEvent(event.nativeEvent)) {
        return;
      }
      dismissOnEscape();
    },
    [dismissOnEscape],
  );
  const handleClick = useCallback(
    (event: React.MouseEvent<HTMLDialogElement>) => {
      if (hasScrim && event.target === event.currentTarget) {
        dismissOnLightInteraction();
      }
    },
    [dismissOnLightInteraction, hasScrim],
  );

  return (
    <dialog
      {...stylex.props(
        styles.dialog,
        shouldPresent && styles.dialogOpen,
        hasScrim && styles.scrim,
        hasScrim && !isOpen && isPresented && styles.scrimClosing,
        !hasScrim && styles.dialogNonModal,
      )}
      ref={dialogRef}
      aria-label={label}
      aria-hidden={!isOpen && isPresented ? 'true' : undefined}
      aria-modal={hasScrim && isOpen ? 'true' : undefined}
      role={purpose === 'required' ? 'alertdialog' : undefined}
      inert={!isOpen && isPresented ? true : undefined}
      onCancel={handleCancel}
      onClick={handleClick}
      onKeyDown={handleKeyDown}>
      <div {...stylex.props(styles.positioner)}>
        <BottomSheetPanel
          {...props}
          ref={ref}
          state={panelState}
          height={height}
          snapPoints={snapPoints}
          isSwipeDismissAllowed={purpose === 'info'}
          isPageScrollLocked={shouldPresent && hasScrim}
          xstyle={xstyle}
          onDismiss={dismissOnLightInteraction}
          onScrimOpacity={handleScrimOpacity}
          onElementChange={handlePanelElementChange}
          onMotionComplete={handleMotionComplete}>
          {children}
        </BottomSheetPanel>
      </div>
      <BottomSheetEdgeTint />
    </dialog>
  );
}

interface SwitcherBottomSheetItemProps extends SwitcherBottomSheetProps {
  switcher: BottomSheetSwitcherContextValue;
}

function SwitcherBottomSheetItem({
  switcher,
  ref,
  sheetId,
  label,
  children,
  height = 'capped',
  snapPoints,
  purpose = 'info',
  xstyle,
  ...props
}: SwitcherBottomSheetItemProps) {
  const {
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
  } = switcher;
  const hasValidSheetId = typeof sheetId === 'string' && sheetId.length > 0;
  const phase = hasValidSheetId ? getSheetPhase(sheetId) : 'hidden';
  const alignmentOffset = hasValidSheetId
    ? getSheetAlignmentOffset(sheetId)
    : 0;
  const panelState = panelStateForSwitcherPhase(phase, alignmentOffset);
  const isInteractive = phase === 'active' || phase === 'entering';
  const isInactive =
    phase === 'covered' ||
    phase === 'aligning' ||
    phase === 'fading' ||
    phase === 'exiting';
  const isPresented = phase !== 'hidden';
  const isTopSheet = phase === 'active' || phase === 'entering';
  const panelRef = useRef<HTMLDivElement | null>(null);
  const previousPhaseRef = useRef(phase);
  const previousPhase = previousPhaseRef.current;
  const hasPresentedRef = useRef(false);

  useLayoutEffect(() => {
    previousPhaseRef.current = phase;
  }, [phase]);

  const dismissOnSwipe = useCallback(() => {
    if (purpose === 'info' && hasValidSheetId && activeSheet === sheetId) {
      onActiveSheetChange(null);
    }
  }, [activeSheet, hasValidSheetId, onActiveSheetChange, purpose, sheetId]);
  const handlePanelElementChange = useCallback(
    (element: HTMLDivElement | null) => {
      panelRef.current = element;
      if (hasValidSheetId) {
        registerSheetElement(sheetId, element);
      }
    },
    [hasValidSheetId, registerSheetElement, sheetId],
  );
  const handleMotionStart = useCallback(
    (motion: BottomSheetPanelMotion) => {
      if (motion === 'entering' && hasValidSheetId) {
        onSheetEnterStart(sheetId);
      }
    },
    [hasValidSheetId, onSheetEnterStart, sheetId],
  );
  const handleMotionComplete = useCallback(
    (motion: BottomSheetPanelMotion) => {
      if (hasValidSheetId) {
        onSheetTransitionComplete({sheetId, phase: motion});
      }
    },
    [hasValidSheetId, onSheetTransitionComplete, sheetId],
  );
  const handleScrimOpacity = useCallback(
    (opacity: number) => {
      if (hasValidSheetId) {
        onSheetScrimOpacityChange(sheetId, opacity);
      }
    },
    [hasValidSheetId, onSheetScrimOpacityChange, sheetId],
  );

  useLayoutEffect(() => {
    if (!hasValidSheetId) {
      return;
    }
    registerSheetLabel(sheetId, label);
    return () => registerSheetLabel(sheetId, null);
  }, [hasValidSheetId, label, registerSheetLabel, sheetId]);

  useLayoutEffect(() => {
    if (!hasValidSheetId) {
      return;
    }
    registerSheetPurpose(sheetId, purpose);
    return () => registerSheetPurpose(sheetId, null);
  }, [hasValidSheetId, purpose, registerSheetPurpose, sheetId]);

  useEffect(() => {
    if (isInteractive) {
      const wasInteractive =
        previousPhase === 'active' || previousPhase === 'entering';
      if (!hasPresentedRef.current || !wasInteractive) {
        focusPanel(panelRef.current, hasScrim);
      }
      hasPresentedRef.current = true;
    } else if (phase === 'hidden') {
      hasPresentedRef.current = false;
    }
  }, [hasScrim, isInteractive, phase, previousPhase]);

  useDevWarning(
    'BottomSheet',
    'requires a non-empty `label` for an accessible name; the open sheet ' +
      'has no built-in heading to derive one from.',
    isInteractive && !label,
  );

  return (
    <div
      {...stylex.props(
        styles.positioner,
        !isPresented && styles.positionerHidden,
        isTopSheet && styles.positionerTop,
      )}
      hidden={!isPresented}
      aria-hidden={isInactive ? 'true' : undefined}
      inert={isInactive ? true : undefined}>
      <BottomSheetPanel
        {...props}
        ref={ref}
        state={panelState}
        height={height}
        snapPoints={snapPoints}
        isSwipeDismissAllowed={purpose === 'info'}
        isPageScrollLocked={hasScrim}
        xstyle={xstyle}
        onDismiss={dismissOnSwipe}
        onScrimOpacity={handleScrimOpacity}
        onElementChange={handlePanelElementChange}
        onMotionStart={handleMotionStart}
        onMotionComplete={handleMotionComplete}>
        {/* A switcher item consumes its parent controller. Its content starts a
            fresh ownership scope so a nested BottomSheet is standalone unless
            it establishes a nested BottomSheetSwitcher of its own. */}
        <BottomSheetSwitcherContext value={null}>
          {children}
        </BottomSheetSwitcherContext>
      </BottomSheetPanel>
    </div>
  );
}

interface StackBottomSheetItemProps extends SwitcherBottomSheetProps {
  stack: BottomSheetStackContextValue;
}

function StackBottomSheetItem({
  stack,
  ref,
  sheetId,
  label,
  children,
  height = 'capped',
  snapPoints,
  purpose = 'info',
  xstyle,
  ...props
}: StackBottomSheetItemProps) {
  const {
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
  } = stack;
  const hasValidSheetId = typeof sheetId === 'string' && sheetId.length > 0;
  const phase = hasValidSheetId ? getSheetPhase(sheetId) : 'hidden';
  const depth = hasValidSheetId ? getSheetDepth(sheetId) : 0;
  const layer = hasValidSheetId ? getSheetLayer(sheetId) : 0;
  const panelState = panelStateForStackPhase(phase);
  const isInteractive = phase === 'active' || phase === 'entering';
  const isInactive = phase === 'covered' || phase === 'exiting';
  const isPresented = phase !== 'hidden';
  const panelRef = useRef<HTMLDivElement | null>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);
  const previousPhaseRef = useRef(phase);
  const previousPhase = previousPhaseRef.current;

  useLayoutEffect(() => {
    const wasInteractive =
      previousPhase === 'active' || previousPhase === 'entering';
    if (wasInteractive && phase === 'covered') {
      const activeElement = document.activeElement as HTMLElement | null;
      if (activeElement != null && panelRef.current?.contains(activeElement)) {
        returnFocusRef.current = activeElement;
      }
    } else if (phase === 'hidden') {
      returnFocusRef.current = null;
    }
    previousPhaseRef.current = phase;
  }, [phase, previousPhase]);

  const dismissOnSwipe = useCallback(() => {
    if (purpose === 'info' && hasValidSheetId && topSheet === sheetId) {
      requestTopDismiss();
    }
  }, [hasValidSheetId, purpose, requestTopDismiss, sheetId, topSheet]);
  const handlePanelElementChange = useCallback(
    (element: HTMLDivElement | null) => {
      panelRef.current = element;
      if (hasValidSheetId) {
        registerSheetElement(sheetId, element);
      }
    },
    [hasValidSheetId, registerSheetElement, sheetId],
  );
  const handleMotionComplete = useCallback(
    (motion: BottomSheetPanelMotion) => {
      if (hasValidSheetId && (motion === 'entering' || motion === 'exiting')) {
        onSheetTransitionComplete({sheetId, phase: motion});
      }
    },
    [hasValidSheetId, onSheetTransitionComplete, sheetId],
  );
  const handleScrimOpacity = useCallback(
    (opacity: number) => {
      if (hasValidSheetId) {
        onSheetScrimOpacityChange(sheetId, opacity);
      }
    },
    [hasValidSheetId, onSheetScrimOpacityChange, sheetId],
  );

  useLayoutEffect(() => {
    if (!hasValidSheetId) {
      return;
    }
    registerSheetLabel(sheetId, label);
    return () => registerSheetLabel(sheetId, null);
  }, [hasValidSheetId, label, registerSheetLabel, sheetId]);

  useLayoutEffect(() => {
    if (!hasValidSheetId) {
      return;
    }
    registerSheetPurpose(sheetId, purpose);
    return () => registerSheetPurpose(sheetId, null);
  }, [hasValidSheetId, purpose, registerSheetPurpose, sheetId]);

  useEffect(() => {
    const wasInteractive =
      previousPhase === 'active' || previousPhase === 'entering';
    if (!isInteractive || wasInteractive) {
      return;
    }
    const returnTarget = returnFocusRef.current;
    if (
      returnTarget != null &&
      returnTarget.isConnected &&
      panelRef.current?.contains(returnTarget)
    ) {
      returnTarget.focus({preventScroll: true});
    } else {
      focusPanel(
        panelRef.current,
        hasScrim || previousPhase === 'covered' || openSheetIds.length > 1,
      );
    }
  }, [hasScrim, isInteractive, openSheetIds.length, previousPhase]);

  useDevWarning(
    'BottomSheet',
    'requires a non-empty `label` for an accessible name; the open sheet ' +
      'has no built-in heading to derive one from.',
    isInteractive && !label,
  );

  return (
    <div
      {...stylex.props(
        styles.positioner,
        styles.positionerStackMotion,
        styles.positionerStackTransform(transformForStackDepth(depth)),
        styles.positionerStackLayer(layer),
        !isPresented && styles.positionerHidden,
      )}
      hidden={!isPresented}
      aria-hidden={isInactive ? 'true' : undefined}
      inert={isInactive ? true : undefined}>
      <BottomSheetPanel
        {...props}
        ref={ref}
        state={panelState}
        height={height}
        snapPoints={snapPoints}
        isSwipeDismissAllowed={purpose === 'info' && isInteractive}
        isPageScrollLocked={hasScrim}
        xstyle={xstyle}
        onDismiss={dismissOnSwipe}
        onScrimOpacity={handleScrimOpacity}
        onElementChange={handlePanelElementChange}
        onMotionComplete={handleMotionComplete}>
        {/* A stack item consumes its parent controller. Nested BottomSheets are
            standalone unless their content establishes a new controller. */}
        <BottomSheetStackContext value={null}>
          {children}
        </BottomSheetStackContext>
      </BottomSheetPanel>
    </div>
  );
}

/**
 * A mobile touch sheet that either owns a native dialog or participates in a
 * BottomSheetSwitcher / BottomSheetStack shared dialog when given a sheetId.
 */
export function BottomSheet(props: BottomSheetProps) {
  const stack = use(BottomSheetStackContext);
  const switcher = use(BottomSheetSwitcherContext);
  const controller = stack ?? switcher;
  const runtimeSheetId = (props as {sheetId?: string}).sheetId;
  const hasValidSheetId =
    typeof runtimeSheetId === 'string' && runtimeSheetId.length > 0;

  useDevWarning(
    'BottomSheet',
    'requires a non-empty `sheetId` when nested in BottomSheetStack or ' +
      'BottomSheetSwitcher; standalone `isOpen` / `onOpenChange` props are ' +
      'ignored there.',
    controller != null && !hasValidSheetId,
  );
  useDevWarning(
    'BottomSheet',
    '`sheetId` only works inside BottomSheetStack or BottomSheetSwitcher. Use ' +
      '`isOpen` and `onOpenChange` for a standalone sheet.',
    controller == null && runtimeSheetId != null,
  );

  if (stack != null) {
    return (
      <StackBottomSheetItem
        {...(props as SwitcherBottomSheetProps)}
        stack={stack}
      />
    );
  }
  if (switcher != null) {
    return (
      <SwitcherBottomSheetItem
        {...(props as SwitcherBottomSheetProps)}
        switcher={switcher}
      />
    );
  }
  return <StandaloneBottomSheet {...(props as StandaloneBottomSheetProps)} />;
}

BottomSheet.displayName = 'BottomSheet';
