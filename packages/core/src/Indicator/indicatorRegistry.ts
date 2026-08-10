// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file indicatorRegistry.ts
 * @input Theme source and indicator name
 * @output Exports the default indicator map and getIndicator resolution
 * @position Server-safe indicator resolver; no 'use client' so it is
 *           importable from RSC
 */

import type {DefinedTheme} from '../theme/defineTheme';
import {getRegisteredTheme} from '../theme/themeRegistry';
import {CheckboxIndicator} from './CheckboxIndicator';
import {CheckIndicator} from './CheckIndicator';
import {RadioIndicator} from './RadioIndicator';
import type {
  IndicatorComponent,
  IndicatorMap,
  IndicatorName,
  IndicatorRegistry,
} from './types';

/**
 * The indicators Astryx ships. A theme's `indicators` entries override these
 * by name.
 *
 * Typed per family (rather than as one widened component type) so a default
 * declared here has to accept the states its family passes — the same rule
 * {@link IndicatorRegistry} holds replacements to.
 */
export const defaultIndicators: {
  [N in IndicatorName]: IndicatorComponent<IndicatorMap[N]>;
} = {
  check: CheckIndicator,
  checkbox: CheckboxIndicator,
  radio: RadioIndicator,
};

export type IndicatorRegistrySource = DefinedTheme | string | null | undefined;

function getTheme(source: IndicatorRegistrySource): DefinedTheme | null {
  if (source == null) {
    return null;
  }
  return typeof source === 'string' ? getRegisteredTheme(source) : source;
}

function getThemeIndicators(
  source: IndicatorRegistrySource,
): IndicatorRegistry | null {
  return getTheme(source)?.indicators ?? null;
}

/**
 * Resolve an indicator component by name, preferring the theme's override and
 * falling back to the built-in indicator.
 *
 * Works in both server and client environments. Client components should use
 * the {@link useIndicator} hook, which resolves against the nearest `<Theme>`.
 *
 * @example
 * ```tsx
 * const Radio = getIndicator('radio', themeName);
 * <Radio state="checked" />
 * ```
 */
export function getIndicator<N extends IndicatorName>(
  name: N,
  source?: IndicatorRegistrySource,
): IndicatorComponent<IndicatorMap[N]> {
  return getThemeIndicators(source)?.[name] ?? defaultIndicators[name];
}
