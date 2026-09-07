// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file BottomSheetStackContext.ts
 * @input Uses React context
 * @output Internal stack phase and lifecycle context shared by BottomSheetStack and BottomSheet
 * @position Private coordination layer for visibly stacked BottomSheets
 */

import {createContext} from 'react';
import type {DialogPurpose} from '../Dialog';

export type BottomSheetStackPhase =
  'entering' | 'active' | 'covered' | 'exiting' | 'hidden';

export interface BottomSheetStackTransitionEvent {
  sheetId: string;
  phase: 'entering' | 'exiting';
}

export interface BottomSheetStackContextValue {
  openSheetIds: ReadonlyArray<string>;
  topSheet: string | null;
  hasScrim: boolean;
  requestTopDismiss: () => void;
  getSheetPhase: (sheetId: string) => BottomSheetStackPhase;
  getSheetDepth: (sheetId: string) => number;
  getSheetLayer: (sheetId: string) => number;
  registerSheetElement: (sheetId: string, element: HTMLElement | null) => void;
  registerSheetLabel: (sheetId: string, label: string | null) => void;
  registerSheetPurpose: (
    sheetId: string,
    purpose: DialogPurpose | null,
  ) => void;
  onSheetTransitionComplete: (event: BottomSheetStackTransitionEvent) => void;
  onSheetScrimOpacityChange: (sheetId: string, opacity: number) => void;
}

export const BottomSheetStackContext =
  createContext<BottomSheetStackContextValue | null>(null);

BottomSheetStackContext.displayName = 'BottomSheetStackContext';
