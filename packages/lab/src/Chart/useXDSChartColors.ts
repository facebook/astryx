/**
 * @file useXDSChartColors.ts
 * @output Theme-aware chart color palette hook
 * @position Consumed by chart components and any data-viz surface inside a themed tree
 *
 * Wraps the static XDSChartColors API with live theme token resolution
 * via useXDSTheme. Returns the same API shape but colors resolve for
 * the current light/dark mode.
 */

import {useMemo} from 'react';
import {useXDSTheme} from '@xds/core/theme';
import type {SequentialHue} from '../ChartColors/XDSChartColors';

// Token name mappings
const CATEGORICAL_TOKENS = [
  '--color-data-categorical-blue',
  '--color-data-categorical-orange',
  '--color-data-categorical-purple',
  '--color-data-categorical-green',
  '--color-data-categorical-pink',
  '--color-data-categorical-cyan',
  '--color-data-categorical-red',
  '--color-data-categorical-teal',
  '--color-data-categorical-brown',
  '--color-data-categorical-indigo',
] as const;

const SEQUENTIAL_HUES: SequentialHue[] = [
  'blue',
  'shamrock',
  'orange',
  'pink',
  'purple',
  'red',
  'teal',
  'yellow',
  'gray',
];

function pickFromRamp(stops: string[], n: number): string[] {
  if (n <= 0) return [];
  if (n >= 5) return stops;
  if (n === 1) return [stops[2]];
  return Array.from(
    {length: n},
    (_, i) => stops[Math.round((i * 4) / (n - 1))],
  );
}

/**
 * Theme-aware chart colors. Same API as XDSChartColors but resolves
 * from the live theme context — respects light/dark mode and custom themes.
 *
 * @example
 * ```
 * const chartColors = useXDSChartColors();
 * chartColors.categorical(5)
 * chartColors.sequential.blue(3)
 * chartColors.diverging.positiveNegative(5)
 * chartColors.alpha('#0171E3', 0.5)
 * ```
 */
export function useXDSChartColors() {
  const {token} = useXDSTheme();

  return useMemo(() => {
    const resolve = (name: string) => token(name) || '';

    const categorical = CATEGORICAL_TOKENS.map(t => resolve(t));

    const ramp = (hue: SequentialHue): string[] =>
      [5, 4, 3, 2, 1].map(step => resolve(`--color-data-${hue}-${step}`));

    const gray1 = resolve('--color-data-gray-1');

    function buildDiverging(
      negHue: SequentialHue,
      posHue: SequentialHue,
      n: number,
      midpoint: string = gray1,
    ): string[] {
      if (n <= 0) return [];
      if (n === 1) return [midpoint];
      const neg = ramp(negHue);
      const pos = ramp(posHue);
      const half = Math.floor(n / 2);
      const hasCenter = n % 2 === 1;
      const negSide = pickFromRamp(neg, half);
      const posSide = pickFromRamp(pos, half).reverse();
      if (hasCenter) return [...negSide, midpoint, ...posSide];
      return [...negSide, ...posSide];
    }

    return {
      categorical(n: number): string[] {
        if (n <= 0) return [];
        return categorical.slice(0, Math.min(n, categorical.length));
      },

      sequential: Object.fromEntries(
        SEQUENTIAL_HUES.map(hue => [
          hue,
          (n: number): string[] => {
            if (n <= 0) return [];
            return pickFromRamp(ramp(hue), n);
          },
        ]),
      ) as Record<SequentialHue, (n: number) => string[]>,

      diverging: {
        positiveNegative: (n: number) => buildDiverging('shamrock', 'red', n),
        coldHot: (n: number) => buildDiverging('blue', 'red', n),
        custom: (
          neg: SequentialHue,
          pos: SequentialHue,
          n: number,
          mid?: string,
        ) => buildDiverging(neg, pos, n, mid),
      },

      semantic: {
        positive: resolve('--color-data-categorical-green'),
        negative: resolve('--color-data-categorical-red'),
        warning: resolve('--color-data-categorical-orange'),
        neutral: resolve('--color-data-neutral'),
      },

      alpha(hex: string, opacity: number): string {
        const match = hex.match(
          /^#?([0-9A-Fa-f]{2})([0-9A-Fa-f]{2})([0-9A-Fa-f]{2})$/,
        );
        if (!match) return hex;
        const r = parseInt(match[1], 16);
        const g = parseInt(match[2], 16);
        const b = parseInt(match[3], 16);
        return `rgba(${r},${g},${b},${Math.max(0, Math.min(1, opacity))})`;
      },
    };
  }, [token]);
}
