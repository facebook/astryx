// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file useIndicator.ts
 * @input Indicator name
 * @output Exports useIndicator hook for theme-aware indicator components
 * @position Client hook used by controls that render a selection visual
 */

import {useThemeName} from '../theme/useTheme';
import {getIndicator} from './indicatorRegistry';
import type {IndicatorComponent, IndicatorMap, IndicatorName} from './types';

/**
 * Resolve an indicator component from the nearest `<Theme>`.
 *
 * @example
 * ```tsx
 * const Checkbox = useIndicator('checkbox');
 * return <Checkbox state={isChecked ? 'checked' : 'unchecked'} size={size} />;
 * ```
 */
export function useIndicator<N extends IndicatorName>(
  name: N,
): IndicatorComponent<IndicatorMap[N]> {
  return getIndicator(name, useThemeName());
}
