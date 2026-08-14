// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file BottomSheetOrchestratorContext.ts
 * @input Uses React context and refs
 * @output Internal phase and lifecycle context shared by BottomSheetOrchestrator and BottomSheet
 * @position Private coordination layer for mutually exclusive BottomSheets
 */

import {createContext, type RefObject} from 'react';

export type BottomSheetOrchestratorPhase =
  | 'entering'
  | 'active'
  | 'covered'
  | 'aligning'
  | 'fading'
  | 'exiting'
  | 'hidden';

export interface BottomSheetOrchestratorTransitionEvent {
  sheetId: string;
  phase: 'entering' | 'aligning' | 'fading' | 'exiting';
}

export interface BottomSheetOrchestratorContextValue {
  activeSheet: string | null;
  hasScrim: boolean;
  onActiveSheetChange: (sheetId: string | null) => void;
  getSheetPhase: (sheetId: string) => BottomSheetOrchestratorPhase;
  getSheetAlignmentOffset: (sheetId: string) => number;
  registerSheetElement: (sheetId: string, element: HTMLElement | null) => void;
  onSheetEnterStart: (sheetId: string) => void;
  onSheetTransitionComplete: (
    event: BottomSheetOrchestratorTransitionEvent,
  ) => void;
  setScrimOpacity: (opacity: number) => void;
  triggerRef: RefObject<HTMLElement | null>;
}

export const BottomSheetOrchestratorContext =
  createContext<BottomSheetOrchestratorContextValue | null>(null);

BottomSheetOrchestratorContext.displayName = 'BottomSheetOrchestratorContext';
