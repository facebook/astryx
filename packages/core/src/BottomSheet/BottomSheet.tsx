// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file BottomSheet.tsx
 * @input Uses React, StyleX, core hooks/utils, named BottomSheetPanel, BottomSheetSwitcherContext
 * @output Exports BottomSheet component and BottomSheetProps
 * @position Public BottomSheet router plus private standalone/switcher hosts
 *
 * BottomSheet selects one of two focused hosts. A standalone host owns its
 * native dialog lifecycle; a switcher item participates in the parent's shared
 * dialog, ordered sheet path, and transition state machine — registering its
 * id, receding while covered, and recording covered focus for a later pop.
 * Both render the same BottomSheetPanel, which owns sheet presentation,
 * gestures, mobile-keyboard accommodation, and motion completion.
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/BottomSheet/BottomSheetPanel.tsx
 * - /packages/core/src/BottomSheet/BottomSheetEdgeTint.tsx
 * - /packages/core/src/BottomSheet/BottomSheet.doc.mjs
 * - /packages/core/src/BottomSheet/BottomSheet.test.tsx
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
import {useDevWarning, useScrollLock} from '../hooks';
import {isImeKeyEvent} from '../utils';
import {
  BottomSheetPanel,
  type BottomSheetPanelMotion,
  type BottomSheetPanelState,
} from './BottomSheetPanel';
import {BottomSheetEdgeTint} from './BottomSheetEdgeTint';
import {
  BottomSheetSwitcherContext,
  type BottomSheetSwitcherContextValue,
  type BottomSheetSwitcherPhase,
} from './BottomSheetSwitcherContext';

export type {BottomSheetHeight, BottomSheetSnapPoint} from './BottomSheetPanel';
import type {BottomSheetHeight, BottomSheetSnapPoint} from './BottomSheetPanel';

// Covered sheets recede behind the top sheet with a bounded visual depth:
// every covered level stays mounted and inert, but only the nearest levels
// remain visually distinguishable (spec:AST-044/FR25). The exact geometry is
// stack-owned and internal; it is not a public theming surface.
const STACK_VISUAL_DEPTH_LIMIT = 2;
const STACK_SCALE_STEP = 0.04;
// PROTOTYPE (spec:AST-044 OQ5): covered sheets also blur and dim with depth.
// Pending design review; not accepted recede geometry.
const STACK_BLUR_STEP_PX = 1;
const STACK_BRIGHTNESS_STEP = 0.04;

function transformForStackDepth(depth: number): string {
  const visualDepth = Math.min(STACK_VISUAL_DEPTH_LIMIT, Math.max(0, depth));
  if (visualDepth === 0) {
    return 'translateY(0) scale(1)';
  }
  const scale = (1 - visualDepth * STACK_SCALE_STEP).toFixed(2);
  return `translateY(calc(${spacingVars['--spacing-2']} * -${visualDepth})) scale(${scale})`;
}

// PROTOTYPE (spec:AST-044 OQ5): depth-scaled filter for covered levels —
// d1: blur(1px) brightness(0.96), d2: blur(2px) brightness(0.92). Applied
// only at depth > 0, where the positioner already carries a transform, so the
// filter's containing-block effect on fixed descendants adds nothing new; the
// filtered level is inert either way. Rides the same transition (and the same
// reduced-motion collapse) as the recede transform — no per-frame JS.
function filterForStackDepth(depth: number): string {
  const visualDepth = Math.min(STACK_VISUAL_DEPTH_LIMIT, Math.max(0, depth));
  if (visualDepth === 0) {
    return 'none';
  }
  const brightness = (1 - visualDepth * STACK_BRIGHTNESS_STEP).toFixed(2);
  return `blur(${visualDepth * STACK_BLUR_STEP_PX}px) brightness(${brightness})`;
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
  // Stacked-path positioner treatment: recede and return use state plus
  // CSS-native motion only, with no per-frame measurement (spec:AST-044/FR43).
  // The depth filter (prototype, OQ5) rides the same transition and the same
  // reduced-motion collapse; willChange stays on transform alone.
  positionerStackMotion: {
    transformOrigin: '50% 0',
    transitionProperty: 'transform, filter',
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
  positionerStackFilter: (filter: string) => ({
    filter,
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
          label={label}
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
    topSheet,
    hasScrim,
    isStackedFlow,
    requestSwipeDismiss,
    getSheetPhase,
    getSheetAlignmentOffset,
    getSheetDepth,
    getSheetStackLayer,
    registerSheetPresence,
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
  const stackDepth =
    hasValidSheetId && isStackedFlow ? getSheetDepth(sheetId) : 0;
  const stackLayer =
    hasValidSheetId && isStackedFlow ? getSheetStackLayer(sheetId) : 0;
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
  const coveredFocusRef = useRef<HTMLElement | null>(null);
  const previousPhaseRef = useRef(phase);
  const previousPhase = previousPhaseRef.current;
  const hasPresentedRef = useRef(false);

  useLayoutEffect(() => {
    previousPhaseRef.current = phase;
  }, [phase]);

  // Participating destinations register with the nearest controller so the
  // controlled path can validate its ids against exactly-one mounted sheet.
  useLayoutEffect(() => {
    if (!hasValidSheetId) {
      return;
    }
    return registerSheetPresence(sheetId);
  }, [hasValidSheetId, registerSheetPresence, sheetId]);

  // A push records the focused element of the sheet it covers before focus
  // moves into the new top. The record is discarded once the sheet leaves
  // presentation, so a later registration lifetime cannot inherit it.
  useLayoutEffect(() => {
    const wasInteractive =
      previousPhase === 'active' || previousPhase === 'entering';
    if (wasInteractive && phase === 'covered' && stackDepth > 0) {
      const activeElement = document.activeElement;
      if (
        activeElement instanceof HTMLElement &&
        panelRef.current?.contains(activeElement)
      ) {
        coveredFocusRef.current = activeElement;
      }
    } else if (phase === 'hidden') {
      coveredFocusRef.current = null;
    }
  }, [phase, previousPhase, stackDepth]);

  const dismissOnSwipe = useCallback(() => {
    if (purpose === 'info' && hasValidSheetId && topSheet === sheetId) {
      requestSwipeDismiss(sheetId);
    }
  }, [hasValidSheetId, purpose, requestSwipeDismiss, sheetId, topSheet]);
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
        // A pop restores the covered sheet's recorded focus while it remains
        // connected and owned by this sheet; otherwise focus entry follows
        // the shared autofocus rule.
        const coveredFocus = coveredFocusRef.current;
        coveredFocusRef.current = null;
        if (
          coveredFocus != null &&
          coveredFocus.isConnected &&
          panelRef.current?.contains(coveredFocus) === true
        ) {
          coveredFocus.focus({preventScroll: true});
        } else {
          focusPanel(panelRef.current, hasScrim);
        }
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
        isStackedFlow && styles.positionerStackMotion,
        isStackedFlow &&
          stackDepth > 0 &&
          styles.positionerStackTransform(transformForStackDepth(stackDepth)),
        isStackedFlow &&
          stackDepth > 0 &&
          styles.positionerStackFilter(filterForStackDepth(stackDepth)),
        isStackedFlow
          ? styles.positionerStackLayer(stackLayer)
          : isTopSheet && styles.positionerTop,
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
        label={label}
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

/**
 * A mobile touch sheet that either owns a native dialog or participates in a
 * BottomSheetSwitcher shared dialog when given a sheetId inside that context.
 */
export function BottomSheet(props: BottomSheetProps) {
  const switcher = use(BottomSheetSwitcherContext);
  const runtimeSheetId = (props as {sheetId?: string}).sheetId;
  const hasValidSheetId =
    typeof runtimeSheetId === 'string' && runtimeSheetId.length > 0;

  useDevWarning(
    'BottomSheet',
    'requires a non-empty `sheetId` when nested in ' +
      'BottomSheetSwitcher; standalone `isOpen` / `onOpenChange` props are ' +
      'ignored there.',
    switcher != null && !hasValidSheetId,
  );
  useDevWarning(
    'BottomSheet',
    '`sheetId` only works inside BottomSheetSwitcher. Use `isOpen` and ' +
      '`onOpenChange` for a standalone sheet.',
    switcher == null && runtimeSheetId != null,
  );

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
