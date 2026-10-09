// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file ComponentIconContext.ts
 * @input Private owner slot, effective state and owner-selected default size
 * @output Internal contextual transport, never public Icon props or DOM attributes
 * @position Client implementation detail; no public provider or default-size spoofing seam
 */
import {createContext} from 'react';
export const ComponentIconContext = createContext<{
  readonly slot: string;
  readonly state?: string;
  /** Owner-derived default for this render (e.g. per control size); role metadata is the fallback. */
  readonly defaultSize?: string;
} | null>(null);
ComponentIconContext.displayName = 'ComponentIconContext';
