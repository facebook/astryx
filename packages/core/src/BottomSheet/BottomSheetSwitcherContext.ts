// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file BottomSheetSwitcherContext.ts
 * @input Uses React context
 * @output Internal phase and lifecycle context shared by BottomSheetSwitcher and BottomSheet
 * @position Private coordination layer for the switcher's ordered sheet path
 */

import {createContext} from 'react';
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

export interface BottomSheetSwitcherContextValue {
  /** Presented (validated) sheet path, ordered bottom-to-top. */
  activeSheets: ReadonlyArray<string>;
  /** Last presented id — the only interactive sheet — or null when closed. */
  topSheet: string | null;
  hasScrim: boolean;
  /**
   * Whether the flow currently involves more than one stacked level, which
   * switches positioners to stack layering and depth-recede motion.
   */
  isStackedFlow: boolean;
  /** Requests a one-level pop for a completed top-sheet swipe. */
  requestSwipeDismiss: (sheetId: string) => void;
  getSheetPhase: (sheetId: string) => BottomSheetSwitcherPhase;
  getSheetAlignmentOffset: (sheetId: string) => number;
  /** Covered levels above this sheet in the presented path; 0 when top or absent. */
  getSheetDepth: (sheetId: string) => number;
  /** Stacked z-order: bottom-to-top path order, with an exiting sheet on top. */
  getSheetStackLayer: (sheetId: string) => number;
  /** Registers a mounted participating sheet id; returns its unregister. */
  registerSheetPresence: (sheetId: string) => () => void;
  registerSheetElement: (sheetId: string, element: HTMLElement | null) => void;
  registerSheetLabel: (sheetId: string, label: string | null) => void;
  registerSheetPurpose: (
    sheetId: string,
    purpose: DialogPurpose | null,
  ) => void;
  onSheetEnterStart: (sheetId: string) => void;
  onSheetTransitionComplete: (
    event: BottomSheetSwitcherTransitionEvent,
  ) => void;
  onSheetScrimOpacityChange: (sheetId: string, opacity: number) => void;
}

export const BottomSheetSwitcherContext =
  createContext<BottomSheetSwitcherContextValue | null>(null);

BottomSheetSwitcherContext.displayName = 'BottomSheetSwitcherContext';
