// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file BottomSheet.tsx
 * @input Uses React, StyleX, core hooks, shared layer dismissal, the shared interaction modality, named BottomSheetPanel, BottomSheetSwitcherContext, BottomSheetHostContext, the private bottom-sheet stack registry
 * @output Exports BottomSheet component and BottomSheetProps
 * @position Public BottomSheet router plus private standalone/switcher hosts
 *
 * BottomSheet selects one of two focused hosts. A standalone host owns its
 * native dialog lifecycle and joins the shared layer dismissal stack; a
 * switcher item participates in the parent's shared dialog, transition state
 * machine, and dismissal registration. Both render the same BottomSheetPanel,
 * which owns sheet presentation, content padding, gestures, mobile-keyboard
 * accommodation, and motion completion.
 *
 * A modal standalone sheet also joins the private bottom-sheet stack
 * (bottomSheetStack.ts) while it is presented. The stack is behaviour, not
 * API: a sheet opened while another modal sheet is open stacks on top of it,
 * the covered sheet recedes and is blocked, one scrim stays visible, and the
 * native top layer is kept in open order even when several sheets open in one
 * commit. A sheet on its own never notices the stack.
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/BottomSheet/BottomSheetPanel.tsx
 * - /packages/core/src/BottomSheet/BottomSheetEdgeTint.tsx
 * - /packages/core/src/BottomSheet/BottomSheetHostContext.ts
 * - /packages/core/src/BottomSheet/bottomSheetStack.ts
 * - /packages/core/src/BottomSheet/BottomSheet.doc.mjs
 * - /packages/core/src/BottomSheet/BottomSheet.test.tsx
 * - /packages/core/src/BottomSheet/BottomSheetStacking.test.tsx
 * - /packages/core/src/BottomSheet/BottomSheetSwitcher.tsx
 * - /packages/core/src/BottomSheet/BottomSheetSwitcher.test.tsx
 * - /packages/core/src/Layer/layerDismissalFamilies.test.tsx
 * - /packages/core/src/Layer/layerDismissalInvariants.test.tsx
 * - /apps/storybook/stories/BottomSheet.stories.tsx
 * - /apps/storybook/stories/BottomSheetStacking.stories.tsx
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
  BottomSheetHostContext,
  CLOSED_BOTTOM_SHEET_HOST,
  OPEN_BOTTOM_SHEET_HOST,
} from './BottomSheetHostContext';
import {
  BOTTOM_SHEET_STACK_DEFAULT_VIEW,
  cancelScrimWrite,
  closeDialogKeepingFocus,
  focusSheetPanel,
  getBottomSheetBeneath,
  registerBottomSheet,
  sealBottomSheetBatch,
  setBottomSheetOpen,
  writeScrimOpacity,
  type BottomSheetScrimWrite,
  type BottomSheetStackView,
} from './bottomSheetStack';
import {
  BottomSheetSwitcherContext,
  type BottomSheetSwitcherContextValue,
  type BottomSheetSwitcherPhase,
} from './BottomSheetSwitcherContext';

export type {BottomSheetHeight, BottomSheetSnapPoint} from './BottomSheetPanel';
import type {BottomSheetHeight, BottomSheetSnapPoint} from './BottomSheetPanel';

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
      // The scrim changes hands between stacked sheets with no fade at all:
      // the host pins this to 0s inline for the frame the change lands in
      // (see `writeScrimOpacity`). Reduced motion keeps the pin too.
      transitionDuration: `var(--_sheet-scrim-duration, ${durationVars['--duration-medium']})`,
      transitionTimingFunction: easeVars['--ease-standard'],
      transitionBehavior: 'allow-discrete',
      '@media (prefers-reduced-motion: reduce)': {
        transitionDuration: 'var(--_sheet-scrim-duration, 0.01s)',
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
  // A sheet in a stack recedes and returns with CSS motion only; the style
  // stays on while another sheet is presented so the return animates too.
  positionerStackMotion: {
    transformOrigin: '50% 0',
    transitionProperty: 'transform',
    transitionDuration: durationVars['--duration-medium'],
    transitionTimingFunction: easeVars['--ease-standard'],
    '@media (prefers-reduced-motion: reduce)': {
      transitionDuration: '0.01s',
    },
  },
  // Covered sheets recede behind the top sheet: the nearest shrinks a step
  // about its top edge and lifts, the next shrinks a second step; deeper
  // sheets share that second step. Only sheets count toward the depth.
  positionerReceded1: {
    transform: `translateY(calc(-1 * ${spacingVars['--spacing-2']})) scale(0.96)`,
  },
  positionerReceded2: {
    transform: `translateY(calc(-2 * ${spacingVars['--spacing-2']})) scale(0.92)`,
  },
});

/** Positioner styles for a sheet's place in the stack; the switcher items share them. */
function stackPositionerStyles(view: BottomSheetStackView) {
  return [
    view.isStacked && styles.positionerStackMotion,
    view.depth === 1 && styles.positionerReceded1,
    view.depth >= 2 && styles.positionerReceded2,
  ] as const;
}

/** The `data-sheet-stack` value for a host: only set while sheets stack. */
function stackStateAttribute(
  view: BottomSheetStackView,
  isOpen: boolean,
): 'top' | 'covered' | 'exiting' | undefined {
  if (!view.isStacked) {
    return undefined;
  }
  if (!isOpen) {
    return 'exiting';
  }
  return view.isTop ? 'top' : 'covered';
}

/** Scrim opacity for an open modal sheet: one visible backdrop per stack. */
function scrimOpacityForView(view: BottomSheetStackView): '0' | '1' {
  return view.isStacked && !view.ownsScrim ? '0' : '1';
}

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

function focusPanel(panel: HTMLElement | null, isModal: boolean): void {
  focusSheetPanel(panel, 'open', isModal);
}

function StandaloneBottomSheet({
  ref,
  isOpen: isOpenProp,
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
  // A sheet rendered in another sheet's content is presented only while that
  // sheet is open, and closes with it (see BottomSheetHostContext).
  const host = use(BottomSheetHostContext);
  const isHostOpen = host?.isOpen ?? true;
  const isOpen = isOpenProp && isHostOpen;
  const [isPresented, setIsPresented] = useState(isOpen);
  const shouldPresent = isOpen || isPresented;
  const panelState: BottomSheetPanelState = isOpen
    ? {kind: 'open', entering: false}
    : isPresented
      ? {kind: 'exiting'}
      : {kind: 'hidden'};

  // The sheet's place in the stack of presented modal sheets. Default until
  // the stack reports otherwise, which it does in the commit that presents
  // the sheet, so the first painted frame already shows it.
  const stackKeyRef = useRef<object>({});
  const [stackView, setStackView] = useState<BottomSheetStackView>(
    BOTTOM_SHEET_STACK_DEFAULT_VIEW,
  );
  const isOpenRef = useRef(isOpen);
  isOpenRef.current = isOpen;

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
  const stackViewRef = useRef(stackView);
  stackViewRef.current = stackView;
  const scrimWriteRef = useRef<BottomSheetScrimWrite>({frame: null});
  useEffect(() => () => cancelScrimWrite(scrimWriteRef.current), []);
  const writeScrim = useCallback(
    (opacity: '0' | '1') =>
      writeScrimOpacity(dialogRef.current, opacity, scrimWriteRef.current),
    [],
  );
  const handleScrimOpacity = useCallback((opacity: number) => {
    // Only the sheet whose backdrop is the visible scrim thins it; a sheet
    // stacked above it has a transparent backdrop that a drag must not reveal.
    const view = stackViewRef.current;
    if (view.isStacked && !view.ownsScrim) {
      return;
    }
    dialogRef.current?.style.setProperty(
      '--_sheet-scrim-opacity',
      String(opacity),
    );
  }, []);

  // The host sheet closed while this one was open: close with it, through the
  // consumer's own callback, so its state agrees with what is on screen. Once
  // per host open → closed transition, and only then: a sheet that mounts open
  // under a host that has not opened yet keeps its state and presents when the
  // host does (`isOpen` already keeps it out of the top layer until then).
  const wasHostOpenRef = useRef(isHostOpen);
  const isOpenPropRef = useRef(isOpenProp);
  isOpenPropRef.current = isOpenProp;
  const onOpenChangeRef = useRef(onOpenChange);
  onOpenChangeRef.current = onOpenChange;
  useEffect(() => {
    const wasHostOpen = wasHostOpenRef.current;
    wasHostOpenRef.current = isHostOpen;
    if (wasHostOpen && !isHostOpen && isOpenPropRef.current) {
      onOpenChangeRef.current(false);
    }
  }, [isHostOpen]);

  // The controlled prop opens an already-mounted dialog; presentation state
  // must latch here so a later close can keep it mounted through its exit.
  useLayoutEffect(() => {
    if (isOpen) {
      // eslint-disable-next-line @eslint-react/set-state-in-effect -- latches controlled open state for exit animation
      setIsPresented(true);
    }
  }, [isOpen]);

  // A modal sheet joins the stack for as long as it is presented. The stack
  // shows the dialog (in open order, repairing same-commit ties before paint),
  // moves focus into it when it lands on top, and reports the sheet's view.
  useLayoutEffect(() => {
    if (!shouldPresent || !hasScrim) {
      return;
    }
    const key = stackKeyRef.current;
    return registerBottomSheet(
      {
        key,
        getElement: () => dialogRef.current,
        show: () => {
          const dialog = dialogRef.current;
          if (dialog == null || dialog.open) {
            return;
          }
          if (triggerRef.current == null) {
            triggerRef.current = document.activeElement as HTMLElement | null;
          }
          dialog.style.setProperty(
            '--_sheet-scrim-opacity',
            scrimOpacityForView(stackViewRef.current),
          );
          dialog.showModal();
        },
        hide: () => closeDialogKeepingFocus(dialogRef.current),
        focus: reason => focusSheetPanel(panelRef.current, reason, true),
        onView: view => {
          stackViewRef.current = view;
          setStackView(view);
          // Who owns the scrim is the stack's decision; a change of owner
          // lands with no fade (see writeScrimOpacity). A closing sheet
          // whose scrim an open sheet took over drops its backdrop the same
          // way; a closing sheet that owned the scrim alone fades it out.
          if (isOpenRef.current) {
            writeScrim(scrimOpacityForView(view));
          } else if (view.isScrimTakenOver) {
            writeScrim('0');
          }
        },
      },
      isOpenRef.current,
    );
  }, [hasScrim, shouldPresent, writeScrim]);
  useLayoutEffect(() => {
    if (shouldPresent && hasScrim) {
      setBottomSheetOpen(stackKeyRef.current, isOpen);
    }
  }, [hasScrim, isOpen, shouldPresent]);
  // Closes a batch of same-commit opens; see sealBottomSheetBatch.
  useEffect(() => {
    sealBottomSheetBatch();
  });

  // A non-modal sheet stays out of the stack: no top layer, no scrim, and the
  // page behind it stays live. It shows itself.
  useLayoutEffect(() => {
    const dialog = dialogRef.current;
    if (dialog == null || !isOpen || hasScrim) {
      return;
    }
    if (!dialog.open) {
      dialog.show();
      focusPanel(panelRef.current, false);
    }
  }, [hasScrim, isOpen]);

  // The scrim at rest: one visible backdrop per stack while open (a sheet
  // stacked above the owner keeps its own backdrop transparent, and a reopen
  // during the exit brings the owner's back), fading out through the exit.
  useLayoutEffect(() => {
    const dialog = dialogRef.current;
    if (dialog == null || !hasScrim) {
      return;
    }
    if (isOpen) {
      dialog.style.setProperty(
        '--_sheet-scrim-opacity',
        scrimOpacityForView(stackViewRef.current),
      );
    } else if (isPresented) {
      dialog.style.setProperty('--_sheet-scrim-opacity', '0');
    }
  }, [hasScrim, isOpen, isPresented]);

  const handleMotionComplete = useCallback(
    (motion: BottomSheetPanelMotion) => {
      if (motion !== 'exiting' || isOpen) {
        return;
      }
      // A sheet closing from code beneath open sheets leaves focus where it
      // is: in the sheet on top. Its own close must not pull focus back to
      // the element its dialog recorded, nor does it move it anywhere else.
      if (hasScrim && stackViewRef.current.depth > 0) {
        closeDialogKeepingFocus(dialogRef.current);
        setIsPresented(false);
        triggerRef.current = null;
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
      //
      // With a sheet still open beneath this one, focus returns into that
      // sheet: to the opener when it is there, else to the sheet's panel.
      const revealed = hasScrim
        ? getBottomSheetBeneath(stackKeyRef.current)
        : null;
      const returnTarget = finalFocusRef?.current ?? triggerRef.current;
      if (
        revealed != null &&
        (returnTarget == null || !revealed.element.contains(returnTarget))
      ) {
        revealed.focus();
      } else if (returnTarget != null) {
        focusForLastInput(returnTarget);
      }
      triggerRef.current = null;
    },
    [finalFocusRef, hasScrim, isOpen],
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
    // A covered sheet is on screen but never the one a press is for: the
    // dismissal stack ranks by tree nesting first, which would hand Escape to
    // a covered sheet nested in another sheet's content ahead of a top sheet
    // written outside it. Standing down while covered keeps Escape and the
    // platform close request with the top sheet, as the sheet stack orders.
    isPresent: () =>
      (dialogRef.current?.open ?? false) && !stackViewRef.current.isCovered,
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

  const isExiting = !isOpen && isPresented;
  // A covered sheet is blocked by the browser: the top sheet's modal dialog
  // makes everything outside it inert, this dialog included. A covered sheet
  // that contains no presented sheet is marked inert and hidden as well, so
  // the state is explicit; one that does contain the top sheet is left alone,
  // because inert on it would reach the top sheet too.
  const isInert = isExiting || stackView.isBlocked;

  return (
    <dialog
      {...stylex.props(
        styles.dialog,
        shouldPresent && styles.dialogOpen,
        hasScrim && styles.scrim,
        hasScrim && isExiting && styles.scrimClosing,
        !hasScrim && styles.dialogNonModal,
      )}
      ref={dialogRef}
      aria-label={label}
      aria-hidden={isInert ? 'true' : undefined}
      aria-modal={hasScrim && isOpen ? 'true' : undefined}
      role={purpose === 'required' ? 'alertdialog' : undefined}
      inert={isInert ? true : undefined}
      data-sheet-stack={
        hasScrim ? stackStateAttribute(stackView, isOpen) : undefined
      }
      data-sheet-stack-depth={
        hasScrim && stackView.depth > 0 ? stackView.depth : undefined
      }
      onCancel={handleCancel}
      onClick={handleClick}>
      <div
        {...stylex.props(
          styles.positioner,
          ...stackPositionerStyles(stackView),
        )}>
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
          <LayerDepthProvider>
            <BottomSheetHostContext
              value={
                isOpen ? OPEN_BOTTOM_SHEET_HOST : CLOSED_BOTTOM_SHEET_HOST
              }>
              {children}
            </BottomSheetHostContext>
          </LayerDepthProvider>
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
    stackView,
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
        ...stackPositionerStyles(stackView),
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
            it establishes a nested BottomSheetSwitcher of its own. A standalone
            sheet in this step's content is presented only while the step is
            the interactive one, and closes when the step is left. */}
        <BottomSheetSwitcherContext value={null}>
          <BottomSheetHostContext
            value={
              isInteractive ? OPEN_BOTTOM_SHEET_HOST : CLOSED_BOTTOM_SHEET_HOST
            }>
            {children}
          </BottomSheetHostContext>
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
