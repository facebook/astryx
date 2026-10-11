// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file useIcon.ts
 * @input A semantic name and the active effective theme object
 * @output Actual ReactNode lookup with local inherited presentation
 * @position Client hook for components that render registry icons directly
 */

import type {ReactNode} from 'react';
import {useThemeDefinition} from '../theme/useTheme';
import {
  getIcon,
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
