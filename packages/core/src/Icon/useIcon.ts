// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file useIcon.ts
 * @input Semantic icon name, or a component icon slot with its fallback
 * @output Exports useIcon and useComponentIcon hooks for theme-aware icon lookup
 * @position Client hooks for components that render registry icons directly
 *
 * SYNC: useComponentIcon must resolve exactly as getComponentIcon in
 * /packages/core/src/Icon/globalIconRegistry.tsx.
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
 * Resolve a component icon slot from the nearest Theme, the same way
 * {@link getComponentIcon} resolves it for an explicit theme source.
 *
 * The active theme's `componentIcons[slot]` chooses a shared icon name, or
 * `null` for no icon; an unmapped slot uses `fallback`. The chosen name then
 * resolves through the active theme's icons, global overrides, and built-in
 * defaults, exactly as {@link useIcon} does. Returns `null` when the slot
 * resolves to `null`.
 *
 * A consumer-provided instance icon, when the component exposes one, should
 * win before this result is used.
 * @example
 * ```
 * const statusIcon = useComponentIcon('brand-card-status', 'info');
 * ```
 */
export function useComponentIcon(
  slot: ComponentIconSlotName,
  fallback: IconName | null,
): ReactNode {
  const themeName = useThemeName();
  return getComponentIcon(slot, fallback, themeName);
}
