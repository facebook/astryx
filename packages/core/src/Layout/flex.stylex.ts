// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file flex.stylex.ts
 * @input Uses @stylexjs/stylex, SizeValue
 * @output Shared overflow + flex-item StyleX styles and the flexItem() utility
 * @position Layout utility; used by Stack, StackItem and Section
 *
 * The two prop families reserved by the layout-props standard (#3223) and
 * requested by #2623:
 *
 * - `overflow` / `isScrollable` — "this pane scrolls on its own"
 * - `grow` / `shrink` / `basis` — "this column is fixed, this one takes the rest"
 *
 * Only the `overflow` shorthand is exposed — never `overflowX`/`overflowY`.
 * Those are physical axes, and the repo styles with logical properties
 * (there is a live RTL workstream); the logical `overflow-inline` /
 * `overflow-block` longhands are not broadly supported yet.
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/Stack/Stack.doc.mjs
 * - /packages/core/src/Section/Section.doc.mjs
 */

import * as stylex from '@stylexjs/stylex';
import type {SizeValue} from '../utils/types';

const overflowStyles = stylex.create({
  visible: {
    overflow: 'visible',
  },
  hidden: {
    overflow: 'hidden',
  },
  clip: {
    overflow: 'clip',
  },
  auto: {
    overflow: 'auto',
  },
  scroll: {
    overflow: 'scroll',
  },
});

/**
 * Overflow behavior of a layout box.
 * - `visible`: content spills out (CSS default)
 * - `hidden`: content is clipped, still programmatically scrollable
 * - `clip`: content is clipped, no scrolling at all
 * - `auto`: scrollbars appear only when content overflows
 * - `scroll`: scroll container, scrollbars always reserved
 */
export type Overflow = keyof typeof overflowStyles;

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

/**
 * Flex factor: `true` → 1, `false` → 0, or an explicit number.
 */
export type FlexFactor = boolean | number;

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

/**
 * StyleX utility for flex-item sizing (`flex-grow` / `flex-shrink` /
 * `flex-basis`) on any element.
 *
 * Values that are not passed emit no declaration at all, so this composes on
 * top of coarser presets (like StackItem's `size`) without clobbering them —
 * spread it *after* the preset.
 *
 * @example
 * ```
 * import { flexItem } from '@astryxdesign/core/Layout';
 *
 * <div {...stylex.props(...flexItem({ grow: 1, shrink: false, basis: 320 }))}>
 *   Detail column: takes the rest, never squeezed below 320px
 * </div>
 * ```
 */
export function flexItem({grow, shrink, basis}: FlexItemOptions = {}) {
  const growFactor = toFlexFactor(grow);
  const shrinkFactor = toFlexFactor(shrink);
  return [
    growFactor != null && flexItemStyles.grow(growFactor),
    shrinkFactor != null && flexItemStyles.shrink(shrinkFactor),
    basis != null && flexItemStyles.basis(basis),
  ] as const;
}

export {flexItemStyles, minSizeResetStyles, overflowStyles};
