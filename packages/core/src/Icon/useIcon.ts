// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file useIcon.ts
 * @input Semantic icon name, or a component icon slot plus its default
 * @output Exports useIcon and useComponentIcon for theme-aware icon lookup
 * @position Client hooks for components that render registry icons directly
 *
 * Two hooks rather than one overloaded hook, because the two lookups need
 * different arguments and only one of them can be got wrong: a slot is
 * meaningless without the component's default to fall back to. Separate names
 * make the fallback a required parameter of the function that needs it,
 * instead of an optional second argument whose absence silently changes which
 * lookup runs.
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
 *
 * @example
 * ```tsx
 * const moreIcon = useIcon('moreHorizontal');
 * ```
 */
export function useIcon(name: IconName): ReactNode {
  return getIcon(name, useThemeName());
}

/**
 * Resolve a component-specific semantic icon slot from the nearest Theme.
 *
 * `fallback` is the component's own default global icon name, used when the
 * theme does not remap the slot through `defineTheme({componentIcons})`.
 *
 * @example
 * ```tsx
 * const mark = useComponentIcon('selector-selected-option', 'check');
 * ```
 */
export function useComponentIcon(
  slot: ComponentIconSlotName,
  fallback: IconName,
): ReactNode {
  return getComponentIcon(slot, fallback, useThemeName());
}
