// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file BottomSheetSwitcherContext.ts
 * @input Uses React context
 * @output Internal phase, lifecycle, and host-dialog context shared by BottomSheetSwitcher and BottomSheet
 * @position Private coordination layer for mutually exclusive BottomSheets
 *
 * The switcher owns no element of its own: every child sheet renders its own
 * native `<dialog>`, and this context carries the phase machine plus the
 * switcher's dialog-level props and handlers down to those hosts.
 */

import type {
  KeyboardEvent as ReactKeyboardEvent,
  MouseEvent as ReactMouseEvent,
  SyntheticEvent,
} from 'react';
import {createContext} from 'react';
import type {BaseProps} from '../BaseProps';
import type {DialogPurpose} from '../Dialog';

export type BottomSheetSwitcherPhase =
  | 'entering'
  | 'active'
  | 'covered'
  | 'aligning'
  | 'fading'
  | 'exiting'
  | 'hidden';

export interface BottomSheetSwitcherTransitionEvent {
  sheetId: string;
  phase: 'entering' | 'aligning' | 'fading' | 'exiting';
}

/**
 * The switcher's own dialog surface, applied by every sheet host. `ref` is not
 * part of it: the switcher resolves its ref to the active sheet's dialog.
 */
export type BottomSheetSwitcherDialogProps = Omit<
  BaseProps<HTMLDialogElement>,
  'onClick' | 'onKeyDown'
>;

export interface BottomSheetSwitcherContextValue {
  activeSheet: string | null;
  hasScrim: boolean;
  onActiveSheetChange: (sheetId: string | null) => void;
  getSheetPhase: (sheetId: string) => BottomSheetSwitcherPhase;
  getSheetAlignmentOffset: (sheetId: string) => number;
  /**
   * Whether this sheet's dialog paints the flow's one scrim right now. During
   * a handoff the retained sheet keeps it, so the entering dialog's backdrop
   * stays transparent above the still-visible previous panel.
   */
  isScrimOwner: (sheetId: string) => boolean;
  /** The flow is closing: the owning backdrop fades out on the exit curve. */
  isFlowClosing: boolean;
  registerSheetElement: (sheetId: string, element: HTMLElement | null) => void;
  registerSheetDialog: (
    sheetId: string,
    dialog: HTMLDialogElement | null,
  ) => void;
  registerSheetPurpose: (
    sheetId: string,
    purpose: DialogPurpose | null,
  ) => void;
  /**
   * Called by a sheet host just before it presents its dialog modally, so the
   * switcher can remember the page element that opened the flow.
   */
  onBeforeSheetPresent: (sheetId: string) => void;
  /**
   * Whether a modal sheet dialog that is already open sits beneath another
   * open sheet dialog in the top layer, so it must re-present to become the
   * topmost layer again.
   */
  isCoveredInTopLayer: (sheetId: string) => boolean;
  onSheetEnterStart: (sheetId: string) => void;
  onSheetTransitionComplete: (
    event: BottomSheetSwitcherTransitionEvent,
  ) => void;
  onSheetScrimOpacityChange: (sheetId: string, opacity: number) => void;
  /** Consumer dialog props the switcher forwards to every sheet dialog. */
  dialogProps: BottomSheetSwitcherDialogProps;
  onDialogCancel: (event: SyntheticEvent<HTMLDialogElement>) => void;
  onDialogClick: (event: ReactMouseEvent<HTMLDialogElement>) => void;
  onDialogKeyDown: (event: ReactKeyboardEvent<HTMLDialogElement>) => void;
}

export const BottomSheetSwitcherContext =
  createContext<BottomSheetSwitcherContextValue | null>(null);

BottomSheetSwitcherContext.displayName = 'BottomSheetSwitcherContext';
