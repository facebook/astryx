// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file selectionRegistry.ts
 * @input Component icon slot, component default, theme source
 * @output Exports resolveSelectionIndicator — slot to icon-or-indicator
 * @position Server-safe resolver bridging componentIcons slots and indicators
 */

import type {IconName} from '../Icon/globalIconRegistry';
import {
  getComponentIconMapping,
  isComponentIndicatorRef,
  type ComponentIndicatorSlotName,
  type IconRegistrySource,
} from '../Icon/globalIconRegistry';
import {getIndicator} from './indicatorRegistry';
import type {IndicatorComponent, IndicatorName} from './types';

/**
 * What a selection slot resolves to for the current theme.
 *
 * - `none` — the theme mapped the slot to `null`; render nothing.
 * - `icon` — a static glyph, shown only in the selected state.
 * - `indicator` — a stateful visual, rendered in every state.
 */
export type ResolvedSelectionIndicator =
  | {type: 'none'}
  | {type: 'icon'; name: IconName}
  | {type: 'indicator'; name: IndicatorName; Indicator: IndicatorComponent};

/**
 * Resolve a selection slot to the icon or indicator the theme selected.
 *
 * `fallback` is the component's own default icon name (or `null` when the
 * component shows nothing by default).
 */
export function resolveSelectionIndicator(
  slot: ComponentIndicatorSlotName,
  fallback: IconName | null,
  source?: IconRegistrySource,
): ResolvedSelectionIndicator {
  const mapped = getComponentIconMapping(slot, source);
  const value = mapped === undefined ? fallback : mapped;

  if (value == null) {
    return {type: 'none'};
  }

  if (isComponentIndicatorRef(value)) {
    return {
      type: 'indicator',
      name: value.indicator,
      Indicator: getIndicator(value.indicator, source),
    };
  }

  return {type: 'icon', name: value};
}
