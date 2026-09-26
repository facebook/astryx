// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file BottomSheetSwitcherContext.ts
 * @input Uses React context
 * @output Internal phase and lifecycle context shared by BottomSheetSwitcher and BottomSheet
 * @position Private coordination layer for mutually exclusive BottomSheets
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
  activeSheet: string | null;
  hasScrim: boolean;
  onActiveSheetChange: (sheetId: string | null) => void;
  getSheetPhase: (sheetId: string) => BottomSheetSwitcherPhase;
  getSheetAlignmentOffset: (sheetId: string) => number;
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
