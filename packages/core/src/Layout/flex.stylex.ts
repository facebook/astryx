// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file flex.stylex.ts
 * @input Uses @stylexjs/stylex, SizeValue
 * @output Shared scroll + flex-item StyleX styles for the layout components
 * @position Layout utility; used by Stack, StackItem and Section
 *
 * The flex-item prop family reserved by the layout-props standard (#3223) and
 * requested by #2623 — `grow` / `shrink` / `basis`, i.e. "this column is a
 * fixed width, this one takes the rest" — plus the `overflow: auto` style
 * behind the existing `isScrollable` prop, which Stack and StackItem each
 * declared for themselves before.
 *
 * `isScrollable` is the only scroll knob these components expose. A full
 * `overflow` enum was considered and cut: every scroll case in the repo wants
 * `auto`, and the one place that wanted per-axis control (`overflow-x: auto` +
 * `overflow-y: hidden`) can't be served by a shorthand anyway — Astryx styles
 * with logical properties, and the logical `overflow-inline` / `overflow-block`
 * longhands are not broadly supported yet. Add the enum when a case for it
 * actually lands.
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/Stack/Stack.doc.mjs
 * - /packages/core/src/Section/Section.doc.mjs
 */

import * as stylex from '@stylexjs/stylex';
import type {SizeValue} from '../utils/types';

const scrollableStyles = stylex.create({
  scrollable: {
    overflow: 'auto',
  },
});

/**
 * "Resets" the min-width and min-height of a flex item to behave predictably.
 *
 * Flex items have an implicit min size of auto, meaning they will never shrink
 * smaller than their contents. This reset allows items to be constrained by
 * their flex parent and become scrollable if necessary.
 */
const minSizeResetStyles = stylex.create({
  reset: {
    minHeight: 0,
    minWidth: 0,
  },
});

/**
 * Flex factor: `true` → 1, `false` → 0, or an explicit number.
 */
export type FlexFactor = boolean | number;

/**
 * `grow` and `shrink` are booleans at nearly every call site, so 0 and 1 are
 * plain static classes: no inline style attribute, no custom property, fully
 * cacheable CSS. Only an arbitrary numeric factor needs a dynamic style.
 */
const flexFactorStyles = stylex.create({
  grow0: {flexGrow: 0},
  grow1: {flexGrow: 1},
  shrink0: {flexShrink: 0},
  shrink1: {flexShrink: 1},
});

/**
 * One dynamic style per property, deliberately.
 *
 * A single `(grow, shrink, basis) => ({...})` style would have to pass `null`
 * for the props that were not set — and in StyleX a `null` value is a *removal*
 * override (styleq drops the property another style set earlier), not a no-op.
 * That silently deletes `flex-grow: 1` from `size="fill"` and `min-height: 0`
 * from the flex reset. Emitting nothing for an unset prop is the only way to
 * layer these on top of a preset.
 */
const flexItemStyles = stylex.create({
  grow: (value: number) => ({flexGrow: value}),
  shrink: (value: number) => ({flexShrink: value}),
  basis: (value: SizeValue) => ({flexBasis: value}),
});

export interface FlexItemOptions {
  /**
   * Whether the item grows to absorb free space along the main axis
   * (`flex-grow`). `true` is `1`; pass a number for a custom factor.
   */
  grow?: FlexFactor;

  /**
   * Whether the item shrinks when space runs short (`flex-shrink`).
   * `shrink={false}` is the "fixed width column" idiom.
   */
  shrink?: FlexFactor;

  /**
   * Initial main-axis size before growing/shrinking (`flex-basis`).
   * Numbers are treated as pixels, strings are used as-is.
   */
  basis?: SizeValue;
}

/**
 * Normalizes a flex factor prop to a CSS number, or undefined when unset.
 */
function toFlexFactor(value: FlexFactor | undefined): number | undefined {
  if (value == null) {
    return undefined;
  }
  if (value === true) {
    return 1;
  }
  if (value === false) {
    return 0;
  }
  return value;
}

function growStyle(value: number) {
  if (value === 0) {
    return flexFactorStyles.grow0;
  }
  if (value === 1) {
    return flexFactorStyles.grow1;
  }
  return flexItemStyles.grow(value);
}

function shrinkStyle(value: number) {
  if (value === 0) {
    return flexFactorStyles.shrink0;
  }
  if (value === 1) {
    return flexFactorStyles.shrink1;
  }
  return flexItemStyles.shrink(value);
}

/**
 * StyleX styles for flex-item sizing (`flex-grow` / `flex-shrink` /
 * `flex-basis`).
 *
 * Values that are not passed emit no declaration at all, so this composes on
 * top of coarser presets (like StackItem's `size`) without clobbering them —
 * spread it *after* the preset.
 *
 * Internal: the components own these props. Consumers styling their own
 * elements reach for `stackItem()`, which layers this on top of `size`.
 */
export function flexItem({grow, shrink, basis}: FlexItemOptions = {}) {
  const growFactor = toFlexFactor(grow);
  const shrinkFactor = toFlexFactor(shrink);
  return [
    growFactor != null && growStyle(growFactor),
    shrinkFactor != null && shrinkStyle(shrinkFactor),
    basis != null && flexItemStyles.basis(basis),
  ] as const;
}

export {minSizeResetStyles, scrollableStyles};
