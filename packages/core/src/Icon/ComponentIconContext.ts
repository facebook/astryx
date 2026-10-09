// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file ComponentIconContext.ts
 * @input Private owner slot and effective state
 * @output Internal contextual transport, never public Icon props or DOM attributes
 * @position Client implementation detail; no public provider or default-size spoofing seam
 */
import {createContext} from 'react';
export const ComponentIconContext = createContext<{
  readonly slot: string;
  readonly state?: string;
} | null>(null);
ComponentIconContext.displayName = 'ComponentIconContext';
