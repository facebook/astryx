// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file useIcon.ts
 * @input Semantic icon name, or a component icon slot plus its fallback
 * @output Exports hooks for theme-aware shared-name and component-slot lookup
 * @position Client hooks for components that render registry icons directly
 */

import type {ReactNode} from 'react';
import {useThemeName} from '../theme/useTheme';
import {
  getComponentIcon,
  getIcon,
  type IconName,
  type NamespacedIconName,
} from './globalIconRegistry';
import type {ComponentIconSlotName} from './index';

/**
 * Resolve a semantic icon name from the nearest Theme, falling back through
 * root theme registration, global icon overrides, and built-in defaults.
 *
 * Accepts a namespaced extension key (`'richtext:bold'`) as well as a built-in
 * name; both resolve through the same registry.
 */
export function useIcon(name: IconName | NamespacedIconName): ReactNode {
  const themeName = useThemeName();
  return getIcon(name, themeName);
}

/**
 * Resolve a component-specific semantic icon slot from the nearest Theme.
 * The component supplies its fallback; an explicit `null` theme mapping
 * suppresses the slot.
 */
export function useComponentIcon(
  slot: ComponentIconSlotName,
  fallback: IconName | null,
): ReactNode {
  return getComponentIcon(slot, fallback, useThemeName());
}
