// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file useIcon.ts
 * @input Semantic icon name
 * @output Exports useIcon hook for theme-aware icon lookup
 * @position Client hook for components that render registry icons directly
 */

import type {ReactNode} from 'react';
import {useThemeName} from '../theme/useTheme';
import {
  getComponentIcon,
  getIcon,
  type ComponentIconSlotName,
  type IconName,
} from './globalIconRegistry';

/**
 * Resolve a global semantic icon name from the nearest Theme.
 */
export function useIcon(name: IconName): ReactNode;

/**
 * Resolve a component-specific semantic icon slot from the nearest Theme.
 *
 * `fallback` is the component's default global icon name, used when the theme
 * does not remap the slot through `defineTheme({componentIcons})`.
 */
export function useIcon(
  slot: ComponentIconSlotName,
  fallback: IconName,
): ReactNode;

export function useIcon(
  nameOrSlot: IconName | ComponentIconSlotName,
  fallback?: IconName,
): ReactNode {
  const themeName = useThemeName();

  if (fallback !== undefined) {
    return getComponentIcon(
      nameOrSlot as ComponentIconSlotName,
      fallback,
      themeName,
    );
  }

  return getIcon(nameOrSlot, themeName);
}
