// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Component style-map merging
 *
 * One merge rule for component overrides, shared by every layer that composes
 * them: `extends` inheritance, generated type-scale rules, and the on-media
 * (`onDark`/`onLight`) surfaces. Merging is per style key, so a child that
 * restates one property of `button.base` keeps the rest of the base's.
 *
 * @input two ComponentStyleMaps — the base and the overrides that win
 * @output a merged ComponentStyleMap
 * @position packages/core/src/theme/mergeComponents.ts
 */

import type {ComponentStyleMap} from './defineTheme';

/**
 * Deep-merge component style maps: `overrides` wins per style key, and every
 * component and key the base declared that the overrides do not mention is
 * carried through untouched.
 */
export function deepMergeComponents(
  base?: ComponentStyleMap,
  overrides?: ComponentStyleMap,
): ComponentStyleMap | undefined {
  if (!base && !overrides) {
    return undefined;
  }
  if (!base) {
    return overrides;
  }
  if (!overrides) {
    return base;
  }

  const result: ComponentStyleMap = {};

  // Start with all base entries
  for (const [component, rules] of Object.entries(base)) {
    result[component] = {...rules};
  }

  // Merge overrides on top
  for (const [component, rules] of Object.entries(overrides)) {
    if (!result[component]) {
      result[component] = {...rules};
    } else {
      for (const [key, styles] of Object.entries(rules)) {
        result[component][key] = {
          ...result[component][key],
          ...styles,
        };
      }
    }
  }

  return result;
}
