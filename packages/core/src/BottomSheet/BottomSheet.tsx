// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file BottomSheet.tsx
 * @input Uses React, react-dom portals, StyleX, core hooks, shared layer dismissal, the shared interaction modality, named BottomSheetPanel, BottomSheetSwitcherContext, unstable_stack host and parent-level contexts
 * @output Exports BottomSheet component and BottomSheetProps
 * @position Public BottomSheet router plus private standalone/switcher/stacked hosts
 *
 * BottomSheet selects one of three focused hosts. A standalone host owns its
 * native dialog lifecycle and joins the shared layer dismissal stack; a
 * switcher item participates in the parent's shared dialog, transition state
 * machine, and dismissal registration; a stacked item (only under the
 * unstable_stack host context a Lab host provides) registers itself as one
 * level of that host from wherever it is rendered, portals its panel into a
 * box the host places in its dialog, recedes while covered, and reports its
 * state to the host. All render the same BottomSheetPanel, which owns sheet presentation,
 * content padding, gestures, mobile-keyboard accommodation, and motion
 * completion.
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/BottomSheet/BottomSheetPanel.tsx
 * - /packages/core/src/BottomSheet/BottomSheetEdgeTint.tsx
 * - /packages/core/src/BottomSheet/BottomSheet.doc.mjs
 * - /packages/core/src/BottomSheet/BottomSheet.test.tsx
 * - /packages/core/src/BottomSheet/BottomSheetSwitcher.tsx
 * - /packages/core/src/BottomSheet/BottomSheetSwitcher.test.tsx
 * - /packages/core/src/BottomSheet/unstable_stack.ts
 * - /packages/core/src/BottomSheet/unstable_stack.test.tsx
 * - /packages/core/src/Layer/layerDismissalFamilies.test.tsx
 * - /packages/core/src/Layer/layerDismissalInvariants.test.tsx
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
import {createPortal} from 'react-dom';
import * as stylex from '@stylexjs/stylex';
import type {BaseProps} from '../BaseProps';
import type {DialogPurpose} from '../Dialog';
import type {SpacingStep} from '../utils/types';
import {
  colorVars,
  durationVars,
  easeVars,
  spacingVars,
} from '../theme/tokens.stylex';
import {useDevWarning, useScrollLock} from '../hooks';
import {LayerDepthProvider} from '../Layer/LayerDepthContext';
import {useLayerDismissal} from '../Layer/useLayerDismissal';
import {focusForLastInput} from '../utils/focusReturn';
import {useInteractionModalityTracking} from '../utils/interactionModality';
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
import {
  unstable_BottomSheetStackParentLevelContext,
  unstable_useBottomSheetStackHost as useBottomSheetStackHost,
  unstable_useBottomSheetStackLevel as useBottomSheetStackLevel,
  type unstable_BottomSheetStackHostContextValue,
} from './unstable_stack';

export type {BottomSheetHeight, BottomSheetSnapPoint} from './BottomSheetPanel';
import type {BottomSheetHeight, BottomSheetSnapPoint} from './BottomSheetPanel';

// JSX needs a capitalized tag to treat the provider as a component.
const StackParentLevelContext = unstable_BottomSheetStackParentLevelContext;

// A level covered by a stacking host recedes behind the top level. Only the
// two nearest covered levels stay visually distinct; deeper ones share the
// second step and sit behind it. Each step shrinks the panel about its top
// edge and lifts it, so a sliver of each covered level shows above the top.
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
  // Stacked levels recede and return with CSS motion only; no per-frame work.
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
});

interface BottomSheetSharedProps extends BaseProps<HTMLDivElement> {
  /** Ref forwarded to the visual sheet panel <div>. */
  ref?: React.Ref<HTMLDivElement>;

  /** Accessible label for the sheet. */
  label: string;

  /** Sheet content, rendered below the grab handle in a scrollable area. */
  children: ReactNode;

  /**
   * Internal padding of the sheet content using the spacing scale, matching
   * Dialog. Accepts numeric spacing steps: 0, 0.5, 1, 1.5, 2, 3, 4, 5, 6, 8, 10.
   * When omitted, uses the theme default for bottom sheets (`--spacing-4`
   * unless the theme sets `padding` on `bottom-sheet`), matching Dialog. The
   * content box is a container: a Section that is its only child escapes the
   * padding, and bleed children such as Table and Divider compensate against
   * it. Pass `0` for content that supplies its own inset.
   */
  padding?: SpacingStep;

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
    if (isOpen && purpose !== 'required') {
      onOpenChange(false);
    }
  }, [isOpen, onOpenChange, purpose]);
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
      // The returned focus shows the focus-visible ring only after keyboard
      // input (`architecture:interaction-modality` INV1). The native close
      // may already have restored focus to the target with a ring; the helper
      // clears it first.
      const returnTarget = finalFocusRef?.current ?? triggerRef.current;
      if (returnTarget != null) {
        focusForLastInput(returnTarget);
      }
      triggerRef.current = null;
    },
    [finalFocusRef, isOpen],
  );

  useInteractionModalityTracking();
  useScrollLock(shouldPresent && hasScrim);
  useDevWarning(
    'BottomSheet',
    'requires a non-empty `label` for an accessible name; the open sheet ' +
      'has no built-in heading to derive one from.',
    isOpen && !label,
  );

  // Join the shared layer dismissal stack. The stack owns the Escape listener
  // and routes each press to the top-most layer, so a Popover or Dialog opened
  // inside this sheet takes the press before the sheet does. It also claims a
  // composing Escape without dismissing anything.
  //
  // The sheet stays registered while it is presented, including its exit
  // animation: a closing sheet is still on screen, so it swallows the press
  // rather than letting it close a layer behind it. `required` blocks too.
  const {shouldDismissOnCloseRequest} = useLayerDismissal({
    isActive: shouldPresent,
    escapeBehavior: isOpen && purpose !== 'required' ? 'close' : 'block',
    onDismiss: dismissOnEscape,
    getContainer: () => dialogRef.current,
    isPresent: () => dialogRef.current?.open ?? false,
  });

  // The native `cancel` event is a close request the stack never saw a press
  // for (Android back, the platform close watcher). Always preventDefault so
  // the browser cannot close the controlled <dialog>, then answer with the
  // stack's rules: only the top-most layer dismisses, and nothing dismisses
  // during an IME composition.
  const handleCancel = useCallback(
    (event: React.SyntheticEvent<HTMLDialogElement>) => {
      event.preventDefault();
      if (shouldDismissOnCloseRequest()) {
        dismissOnEscape();
      }
    },
    [dismissOnEscape, shouldDismissOnCloseRequest],
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
      onClick={handleClick}>
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
          <LayerDepthProvider>{children}</LayerDepthProvider>
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
  // Under a stacking host the whole switcher is one level. While another
  // level covers it, the switcher's interactive sheet renders as covered —
  // retained in place, inert — and returns to its own phase when uncovered.
  // The switcher's transition state machine never sees the override. The
  // switcher provides its level id as the parent level around its children,
  // which is how this item finds its level's view.
  const stackHost = useBottomSheetStackHost();
  const stackLevelId = use(unstable_BottomSheetStackParentLevelContext);
  const stackView =
    stackHost == null || stackLevelId == null
      ? null
      : (stackHost.views.get(stackLevelId) ?? null);
  const stackDepth = stackView?.depth ?? 0;
  // Under a host, the host decides when this level is the top. Until it has
  // placed the level after an activation (one synchronous pass later), the
  // active sheet renders as covered, so its focus entry waits for the host
  // to show its dialog and for the level below to record its focus.
  const isCoveredByStack = stackHost != null && stackView?.isTop !== true;
  const hasValidSheetId = typeof sheetId === 'string' && sheetId.length > 0;
  const ownPhase = hasValidSheetId ? getSheetPhase(sheetId) : 'hidden';
  const phase =
    isCoveredByStack && (ownPhase === 'active' || ownPhase === 'entering')
      ? 'covered'
      : ownPhase;
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
  const coveredFocusRef = useRef<HTMLElement | null>(null);
  const previousPhaseRef = useRef(phase);
  const previousPhase = previousPhaseRef.current;
  const hasPresentedRef = useRef(false);

  useLayoutEffect(() => {
    previousPhaseRef.current = phase;
  }, [phase]);

  // A stacking host covering this sheet records the element focused inside
  // it, so an uncover can return focus there (the control that opened the
  // level above, when it lives here). Only a stack cover records: the
  // switcher's own handoff keeps today's focus entry. The record is dropped
  // once the sheet leaves presentation.
  useLayoutEffect(() => {
    const wasInteractive =
      previousPhase === 'active' || previousPhase === 'entering';
    if (wasInteractive && phase === 'covered' && isCoveredByStack) {
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
  }, [isCoveredByStack, phase, previousPhase]);

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
        // An uncover restores the recorded focus while it is still connected
        // and owned by this sheet; otherwise entry follows the shared rule.
        const coveredFocus = coveredFocusRef.current;
        coveredFocusRef.current = null;
        if (
          coveredFocus != null &&
          coveredFocus.isConnected &&
          panelRef.current?.contains(coveredFocus) === true
        ) {
          // Returned focus rings only after keyboard input, as a standalone
          // sheet's return does (`architecture:interaction-modality` INV1).
          focusForLastInput(coveredFocus, {preventScroll: true});
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

  // A step's content starts a fresh switcher scope so a nested BottomSheet is
  // standalone unless it establishes a nested BottomSheetSwitcher of its own.
  // Under a stacking host the step's content stays in the stack (the switcher
  // provides the parent level around it), so a sheet opened from the step
  // becomes a level right above this one.
  const content: ReactNode = (
    <BottomSheetSwitcherContext value={null}>
      {children}
    </BottomSheetSwitcherContext>
  );

  return (
    <div
      {...stylex.props(
        styles.positioner,
        stackHost != null && styles.positionerStackMotion,
        stackHost != null &&
          styles.positionerStackTransform(transformForStackDepth(stackDepth)),
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
        {content}
      </BottomSheetPanel>
    </div>
  );
}

interface StackedBottomSheetItemProps extends StandaloneBottomSheetProps {
  host: unstable_BottomSheetStackHostContextValue;
}

/**
 * A standalone-API sheet rendered as one level of a stacking host. It keeps
 * the controlled `isOpen` / `onOpenChange` contract and the exit latch of
 * StandaloneBottomSheet, but renders no dialog of its own: the host owns the
 * dialog, scrim, modality, scroll lock, and Escape/scrim dismissal. The level
 * registers itself with the host from wherever it is rendered, portals its
 * positioner into a box the host places in its dialog, and learns from the
 * host how many open levels cover it. `hasScrim` is the host's.
 */
function StackedBottomSheetItem({
  host,
  ref,
  isOpen,
  onOpenChange,
  label,
  children,
  height = 'capped',
  snapPoints,
  hasScrim: ignoredHasScrim,
  finalFocusRef,
  purpose = 'info',
  xstyle,
  ...props
}: StackedBottomSheetItemProps) {
  const {hasScrim} = host;
  const panelRef = useRef<HTMLDivElement | null>(null);
  const coveredFocusRef = useRef<HTMLElement | null>(null);
  const onOpenChangeRef = useRef(onOpenChange);
  const [isPresented, setIsPresented] = useState(isOpen);
  const shouldPresent = isOpen || isPresented;

  useLayoutEffect(() => {
    onOpenChangeRef.current = onOpenChange;
  }, [onOpenChange]);
  // Identity stays stable so the host can compare reported state by value.
  const dismiss = useCallback(() => {
    onOpenChangeRef.current(false);
  }, []);

  const level = useBottomSheetStackLevel(host, 'sheet', {
    isOpen,
    isPresented: shouldPresent,
    purpose,
    label,
    finalFocusRef,
    dismiss,
  });
  const {depth, isTop} = level.view;
  const isCovered = isOpen && !isTop;
  const isInteractive = isOpen && isTop;
  const wasInteractiveRef = useRef(false);
  const wasInteractive = wasInteractiveRef.current;
  const panelState: BottomSheetPanelState = isOpen
    ? isCovered
      ? {kind: 'retained', motion: 'covered', alignmentOffset: 0}
      : {kind: 'open', entering: false}
    : isPresented
      ? {kind: 'exiting'}
      : {kind: 'hidden'};

  useLayoutEffect(() => {
    if (isOpen) {
      // Latch presentation so a later close stays mounted through its exit.
      // eslint-disable-next-line @eslint-react/set-state-in-effect -- latches controlled open state for exit animation
      setIsPresented(true);
    }
  }, [isOpen]);

  // A cover records the element focused in this level, so an uncover can
  // return focus to the control that opened the level above when it lives
  // here. The record is dropped once the level leaves presentation.
  useLayoutEffect(() => {
    if (wasInteractive && isCovered) {
      const activeElement = document.activeElement;
      if (
        activeElement instanceof HTMLElement &&
        panelRef.current?.contains(activeElement)
      ) {
        coveredFocusRef.current = activeElement;
      }
    } else if (!shouldPresent) {
      coveredFocusRef.current = null;
    }
    wasInteractiveRef.current = isInteractive;
  }, [isCovered, isInteractive, shouldPresent, wasInteractive]);

  // Focus enters when the level becomes the top: on open, and on uncover. The
  // host has shown its dialog in a layout effect by the time this runs.
  useEffect(() => {
    if (!isInteractive || wasInteractive) {
      return;
    }
    const coveredFocus = coveredFocusRef.current;
    coveredFocusRef.current = null;
    if (
      coveredFocus != null &&
      coveredFocus.isConnected &&
      panelRef.current?.contains(coveredFocus) === true
    ) {
      // Returned focus rings only after keyboard input, as a standalone
      // sheet's return does (`architecture:interaction-modality` INV1).
      focusForLastInput(coveredFocus, {preventScroll: true});
    } else {
      focusPanel(panelRef.current, hasScrim);
    }
  }, [hasScrim, isInteractive, wasInteractive]);

  // The host returns focus with the shared modality when the stack closes;
  // the tracking is document-wide, so turning it on here covers the host.
  useInteractionModalityTracking();

  const dismissOnSwipe = useCallback(() => {
    if (purpose === 'info' && isOpen && !isCovered) {
      onOpenChangeRef.current(false);
    }
  }, [isCovered, isOpen, purpose]);
  const handlePanelElementChange = useCallback(
    (element: HTMLDivElement | null) => {
      panelRef.current = element;
    },
    [],
  );
  const handleMotionComplete = useCallback(
    (motion: BottomSheetPanelMotion) => {
      if (motion === 'exiting' && !isOpen) {
        setIsPresented(false);
      }
    },
    [isOpen],
  );

  useDevWarning(
    'BottomSheet',
    'requires a non-empty `label` for an accessible name; the open sheet ' +
      'has no built-in heading to derive one from.',
    isOpen && !label,
  );
  useDevWarning(
    'BottomSheet',
    '`hasScrim` on a BottomSheet or BottomSheetSwitcher inside a ' +
      'BottomSheetStack is ignored; the stack owns the one scrim. Set ' +
      '`hasScrim` on the BottomSheetStack instead.',
    ignoredHasScrim !== undefined,
  );

  // The anchor stays in place for ordering; the positioner portals into the
  // level's box. The content names this level as its parent and adds no
  // layer depth, so a sheet rendered inside it becomes a level right above
  // this one, while a Core layer opened inside it takes its content deeper
  // and out of the stack.
  const positioner = (
    <div
      {...stylex.props(
        styles.positioner,
        styles.positionerStackMotion,
        styles.positionerStackTransform(transformForStackDepth(depth)),
        !shouldPresent && styles.positionerHidden,
      )}
      hidden={!shouldPresent}>
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
        onScrimOpacity={level.onScrimOpacity}
        onElementChange={handlePanelElementChange}
        onMotionComplete={handleMotionComplete}>
        <StackParentLevelContext value={level.id}>
          {children}
        </StackParentLevelContext>
      </BottomSheetPanel>
    </div>
  );

  return (
    <>
      <span hidden ref={level.anchorRef} data-bottom-sheet-stack-anchor="" />
      {level.portalTarget == null
        ? null
        : createPortal(positioner, level.portalTarget)}
    </>
  );
}

/**
 * A mobile touch sheet that either owns a native dialog or participates in a
 * BottomSheetSwitcher shared dialog when given a sheetId inside that context.
 */
export function BottomSheet(props: BottomSheetProps) {
  const switcher = use(BottomSheetSwitcherContext);
  const stackHost = useBottomSheetStackHost();
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
  if (stackHost != null) {
    return (
      <StackedBottomSheetItem
        {...(props as StandaloneBottomSheetProps)}
        host={stackHost}
      />
    );
  }
  return <StandaloneBottomSheet {...(props as StandaloneBottomSheetProps)} />;
}

BottomSheet.displayName = 'BottomSheet';
