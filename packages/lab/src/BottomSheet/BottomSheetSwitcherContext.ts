// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file BottomSheetSwitcherContext.ts
 * @input Uses React context and refs
 * @output Internal phase and lifecycle context shared by BottomSheetSwitcher and BottomSheet
 * @position Private coordination layer for mutually exclusive BottomSheets
 */

import {createContext, type RefObject} from 'react';

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
  activeSheet: string | null;
  hasScrim: boolean;
  onActiveSheetChange: (sheetId: string | null) => void;
  getSheetPhase: (sheetId: string) => BottomSheetSwitcherPhase;
  getSheetAlignmentOffset: (sheetId: string) => number;
  registerSheetElement: (sheetId: string, element: HTMLElement | null) => void;
  onSheetEnterStart: (sheetId: string) => void;
  onSheetTransitionComplete: (
    event: BottomSheetSwitcherTransitionEvent,
  ) => void;
  setScrimOpacity: (opacity: number) => void;
  triggerRef: RefObject<HTMLElement | null>;
}

export const BottomSheetSwitcherContext =
  createContext<BottomSheetSwitcherContextValue | null>(null);

BottomSheetSwitcherContext.displayName = 'BottomSheetSwitcherContext';
