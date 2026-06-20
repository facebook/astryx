// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file useChartColors.ts
 * @output Theme-aware chart color palette hook
 * @position React hook wrapping getChartColors — resolves from live theme context
 */

import {useMemo} from 'react';
import {useTheme} from '@xds/core/theme';
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
  const {token} = useTheme();

  return useMemo(
    () => getChartColorsFromResolver(name => token(name) || ''),
    [token],
  );
}
