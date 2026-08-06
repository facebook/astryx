// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file index.ts
 * @input None (re-export barrel)
 * @output Public indicator surface: components, registry, hook, types
 * @position Entry point for the stateful selection-visual layer
 *
 * Indicators are the componentized form of stateful control visuals
 * (checkbox, radio). They are decorative: the owning component keeps the role,
 * state, and focus behavior, while the indicator turns state into a picture —
 * which makes it themeable through CSS targets like any other component, and
 * replaceable wholesale through `defineTheme({indicators})`.
 */

export {CheckboxIndicator} from './CheckboxIndicator';
export {RadioIndicator} from './RadioIndicator';
export {SelectionIndicator} from './SelectionIndicator';
export type {SelectionIndicatorProps} from './SelectionIndicator';

// Registry (RSC-compatible, no 'use client')
export {defaultIndicators, getIndicator} from './indicatorRegistry';
export type {IndicatorRegistrySource} from './indicatorRegistry';
export {resolveSelectionIndicator} from './selectionRegistry';
export type {ResolvedSelectionIndicator} from './selectionRegistry';

export {useIndicator} from './useIndicator';

export {indicatorScope} from './indicator.markers.stylex';

export type {
  IndicatorComponent,
  IndicatorMap,
  IndicatorName,
  IndicatorProps,
  IndicatorRegistry,
  IndicatorSize,
  IndicatorState,
} from './types';
