// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file BottomSheet.tsx
 * @input Uses React, StyleX, core hooks/utils, BottomSheetPanel, BottomSheetSwitcherContext
 * @output Exports BottomSheet component and BottomSheetProps
 * @position Public BottomSheet router plus private standalone/switcher hosts
 *
 * BottomSheet selects one of two focused hosts. A standalone host owns its
 * native dialog lifecycle; a switcher item participates in the parent's shared
 * dialog and transition state machine. Both render the same BottomSheetPanel,
 * which owns sheet presentation, gestures, mobile-keyboard accommodation, and
 * motion completion.
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/lab/src/BottomSheet/BottomSheetPanel.tsx
 * - /packages/lab/src/BottomSheet/BottomSheet.doc.mjs
 * - /packages/lab/src/BottomSheet/BottomSheet.test.tsx
 * - /packages/lab/src/BottomSheet/BottomSheetSwitcher.tsx
 * - /packages/lab/src/BottomSheet/BottomSheetSwitcher.test.tsx
 * - /apps/storybook/stories/BottomSheet.stories.tsx
 */

import {
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import * as stylex from '@stylexjs/stylex';
import type {BaseProps} from '@astryxdesign/core';
import {
  colorVars,
  durationVars,
  easeVars,
} from '@astryxdesign/core/theme/tokens.stylex';
import {useDevWarning, useScrollLock} from '@astryxdesign/core/hooks';
import {
  BottomSheetPanel,
  type BottomSheetPanelMotion,
  type BottomSheetPanelState,
} from './BottomSheetPanel';
import {
  BottomSheetSwitcherContext,
  type BottomSheetSwitcherContextValue,
  type BottomSheetSwitcherPhase,
} from './BottomSheetSwitcherContext';

export type {BottomSheetHeight} from './BottomSheetPanel';
import type {BottomSheetHeight} from './BottomSheetPanel';

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
});

interface BottomSheetSharedProps extends BaseProps<HTMLDivElement> {
  /** Ref forwarded to the visual sheet panel <div>. */
  ref?: React.Ref<HTMLDivElement>;

  /** Accessible label for the sheet. */
  label: string;

  /** Sheet content, rendered below the grab handle in a scrollable area. */
  children: ReactNode;

  /** Height budget or custom CSS length. Only Tall is keyboard-aware. @default 'capped' */
  height?: BottomSheetHeight | number | string;
}

interface StandaloneBottomSheetProps extends BottomSheetSharedProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  hasScrim?: boolean;
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
  const activeElement = document.activeElement;
  if (activeElement != null && panel?.contains(activeElement)) {
    return;
  }
  const autofocus = panel?.querySelector<HTMLElement>('[data-autofocus]');
  if (autofocus != null) {
    autofocus.focus();
  } else if (isModal) {
    panel?.focus();
  }
}

function StandaloneBottomSheet({
  ref,
  isOpen,
  onOpenChange,
  label,
  children,
  height = 'capped',
  hasScrim = true,
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

  const close = useCallback(() => onOpenChange(false), [onOpenChange]);
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
      triggerRef.current?.focus();
      triggerRef.current = null;
    },
    [isOpen],
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
      event.preventDefault();
      close();
    },
    [close],
  );
  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLDialogElement>) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        close();
      }
    },
    [close],
  );
  const handleClick = useCallback(
    (event: React.MouseEvent<HTMLDialogElement>) => {
      if (hasScrim && event.target === event.currentTarget) {
        close();
      }
    },
    [close, hasScrim],
  );

  return (
    <dialog
      {...stylex.props(
        styles.dialog,
        shouldPresent && styles.dialogOpen,
        hasScrim && styles.scrim,
        !hasScrim && styles.dialogNonModal,
      )}
      ref={dialogRef}
      aria-label={label}
      aria-hidden={!isOpen && isPresented ? 'true' : undefined}
      aria-modal={hasScrim && isOpen ? 'true' : undefined}
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
          xstyle={xstyle}
          onDismiss={close}
          onScrimOpacity={handleScrimOpacity}
          onElementChange={handlePanelElementChange}
          onMotionComplete={handleMotionComplete}>
          {children}
        </BottomSheetPanel>
      </div>
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

  const close = useCallback(() => {
    if (hasValidSheetId && activeSheet === sheetId) {
      onActiveSheetChange(null);
    }
  }, [activeSheet, hasValidSheetId, onActiveSheetChange, sheetId]);
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
        xstyle={xstyle}
        onDismiss={close}
        onScrimOpacity={handleScrimOpacity}
        onElementChange={handlePanelElementChange}
        onMotionStart={handleMotionStart}
        onMotionComplete={handleMotionComplete}>
        {/* A switcher item consumes its parent controller. Its content starts a
            fresh ownership scope so a nested BottomSheet is standalone unless
            it establishes a nested BottomSheetSwitcher of its own. */}
        <BottomSheetSwitcherContext.Provider value={null}>
          {children}
        </BottomSheetSwitcherContext.Provider>
      </BottomSheetPanel>
    </div>
  );
}

/**
 * A mobile touch sheet that either owns a native dialog or participates in a
 * BottomSheetSwitcher shared dialog when given a sheetId inside that context.
 */
export function BottomSheet(props: BottomSheetProps) {
  const switcher = useContext(BottomSheetSwitcherContext);
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
