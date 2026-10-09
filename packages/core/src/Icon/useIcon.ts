// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file useIcon.ts
 * @input A semantic name or component slot/fallback and the active effective theme object
 * @output Compatible actual ReactNode and source-only shared-name hooks
 * @position Client hook for components that render registry icons directly
 */

import type {ReactNode} from 'react';
import type {ComponentIconSlotName} from './index';
import {useThemeDefinition} from '../theme/useTheme';
import {
  getIcon,
  getComponentIconName,
  getComponentIcon,
  type IconName,
  type NamespacedIconName,
} from './globalIconRegistry';

/**
 * Resolve a semantic icon name from the nearest Theme, falling back through
 * root theme registration, global icon overrides, and built-in defaults.
 *
 * Accepts a namespaced extension key (`'richtext:bold'`) as well as a built-in
 * name; both resolve through the same registry.
 */
export function useIcon(name: IconName | NamespacedIconName): ReactNode {
  const theme = useThemeDefinition();
  return getIcon(name, theme);
}

/** Resolve the source-only mapping without adding participation arguments. */
export function useComponentIconName(
  slot: ComponentIconSlotName,
  fallback: IconName | null,
): IconName | null {
  return getComponentIconName(slot, fallback, useThemeDefinition());
}
/** Resolve mapped artwork from the same nearest effective theme. */
export function useComponentIcon(
  slot: ComponentIconSlotName,
  fallback: IconName | null,
): ReactNode {
  return getComponentIcon(slot, fallback, useThemeDefinition());
}
