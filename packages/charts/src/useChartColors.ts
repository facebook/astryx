// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file useChartColors.ts
 * @output Theme-aware chart color palette hook
 * @position React hook wrapping getChartColors — resolves from live theme context
 *
 * Returns a stable reference across renders — the palette only rebuilds when the
 * resolved theme tokens change (theme or color mode), so consumers can safely
 * use the result in effect/memo dependency arrays.
 */

import {useMemo} from 'react';
import {useTheme} from '@astryxdesign/core/theme';
import {getChartColorsFromResolver} from './getChartColors';
import type {ChartColorsAPI} from './getChartColors';

/**
 * Theme-aware chart colors. Resolves data-viz tokens from the current
 * theme context — respects light/dark mode and custom themes.
 *
 * @example
 * ```
 * const colors = useChartColors();
 * colors.categorical(5)
 * colors.sequential.blue(3)
 * colors.diverging.positiveNegative(5)
 * colors.alpha('#0171E3', 0.5)
 * ```
 */
export function useChartColors(): ChartColorsAPI {
  // Depend on the memoized token map (stable per theme + mode), not useTheme's
  // `token` function, which is a fresh closure on every render and would defeat
  // memoization — returning a new palette object each render.
  const {tokens} = useTheme();

  return useMemo(
    () => getChartColorsFromResolver(name => tokens[name] ?? ''),
    [tokens],
  );
}
