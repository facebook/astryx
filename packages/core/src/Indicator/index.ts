// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file index.ts
 * @input None (re-export barrel)
 * @output Public indicator surface: components, registry, hook, types
 * @position Entry point for the stateful control-visual layer
 *
 * Indicators are the componentized form of stateful control visuals — the
 * checkbox box, the radio circle, the mark on a chosen option. They are
 * decorative: the owning component keeps the role, state, and focus behavior,
 * while the indicator turns state into a picture.
 *
 * That makes them themeable through CSS targets like any other component, and
 * replaceable wholesale by name through `defineTheme({indicators})` — replace
 * `check` and every single-selection mark in the app follows.
 */

export {CheckboxIndicator} from './CheckboxIndicator';
export {CheckIndicator} from './CheckIndicator';
export {RadioIndicator} from './RadioIndicator';

// Registry (RSC-compatible, no 'use client')
export {defaultIndicators, getIndicator} from './indicatorRegistry';
export type {
  CoreIndicatorName,
  IndicatorRegistrySource,
} from './indicatorRegistry';

export {useIndicator} from './useIndicator';

export {indicatorScope} from './indicator.markers.stylex';

export type {
  IndicatorComponent,
  IndicatorFamily,
  IndicatorFamilyMap,
  IndicatorMap,
  IndicatorName,
  IndicatorNameOfFamily,
  IndicatorPosition,
  IndicatorProps,
  IndicatorRegistry,
  IndicatorSize,
  IndicatorState,
} from './types';
