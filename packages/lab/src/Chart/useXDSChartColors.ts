/**
 * @file useXDSChartColors.ts
 * @output Theme-aware chart color palette hook
 * @position React hook wrapping getXDSChartColors — resolves from live theme context
 */

import {useMemo} from 'react';
import {useXDSTheme} from '@xds/core/theme';
import {getXDSChartColorsFromResolver} from './getXDSChartColors';
import type {XDSChartColorsAPI} from './getXDSChartColors';

/**
 * Theme-aware chart colors. Resolves data-viz tokens from the current
 * theme context — respects light/dark mode and custom themes.
 *
 * @example
 * ```
 * const colors = useXDSChartColors();
 * colors.categorical(5)
 * colors.sequential.blue(3)
 * colors.diverging.positiveNegative(5)
 * colors.alpha('#0171E3', 0.5)
 * ```
 */
export function useXDSChartColors(): XDSChartColorsAPI {
  const {token} = useXDSTheme();

  return useMemo(
    () => getXDSChartColorsFromResolver(name => token(name) || ''),
    [token],
  );
}
