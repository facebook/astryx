// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file stackItem.stylex.ts
 * @input Uses @stylexjs/stylex, Layout/flex.stylex
 * @output StyleX utility for stack item styling
 * @position Layout utility; used by StackItem and directly by components
 *
 * SYNC: When modified, update /packages/core/src/Stack/Stack.doc.mjs
 */

import {
  flexItem,
  minSizeResetStyles,
  overflowStyles,
  type FlexItemOptions,
  type Overflow,
} from '../Layout/flex.stylex';

import * as stylex from '@stylexjs/stylex';

const crossAlignSelfStyles = stylex.create({
  center: {
    alignSelf: 'center',
  },
  end: {
    alignSelf: 'flex-end',
  },
  start: {
    alignSelf: 'flex-start',
  },
  stretch: {
    alignSelf: 'stretch',
  },
});

/**
 * Cross-alignment options for stack items.
 * Overrides the default cross-alignment set on the parent stack.
 */
export type StackItemCrossAlignSelf = keyof typeof crossAlignSelfStyles;

const sizeStyles = stylex.create({
  /**
   * Fill the remaining space inside of the stack.
   * Will split the space evenly among other items with "fill".
   */
  fill: {
    flexGrow: 1,
  },
  /**
   * Do not grow or shrink within the stack.
   * Use the intrinsic size of the item.
   */
  static: {
    flexGrow: 0,
    flexShrink: 0,
  },
});

/**
 * Size options for stack items.
 * - `static`: Item uses its intrinsic size, won't grow or shrink
 * - `fill`: Item grows to fill remaining space (flexGrow: 1)
 */
export type StackItemSize = keyof typeof sizeStyles;

export interface StackItemOptions extends FlexItemOptions {
  /**
   * Overrides the default cross-alignment for this item.
   * (hAlign for VStack, vAlign for HStack)
   *
   * Set cross-alignment on the stack itself and override individual
   * children as needed with this option.
   */
  crossAlignSelf?: StackItemCrossAlignSelf;

  /**
   * Size behavior of the item within the stack.
   * - `static`: Uses intrinsic size, won't grow or shrink (default)
   * - `fill`: Grows to fill remaining space
   *
   * Coarse preset. `grow` / `shrink` / `basis` are layered on top of it and
   * win per-property — see the precedence note on `stackItem()`.
   *
   * @default "static"
   */
  size?: StackItemSize;

  /**
   * Overflow behavior of the item.
   * Takes precedence over `isScrollable` when both are set.
   */
  overflow?: Overflow;

  /**
   * Sugar for `overflow: 'auto'`, matching `LayoutContent` / `LayoutPanel`.
   * @default false
   */
  isScrollable?: boolean;
}

/**
 * StyleX utility to add stack item styles to any component.
 *
 * Use this to avoid wrapping components in StackItem when you need
 * direct control over flex behavior.
 *
 * **Precedence.** `size` is a preset that always applies (it defaults to
 * `static`, i.e. `flex-grow: 0` + `flex-shrink: 0`). `grow` / `shrink` /
 * `basis` are applied *after* it and win on the properties they set, so
 * `{size: 'fill', shrink: false}` grows and never shrinks, and a bare
 * `{shrink: true}` really does shrink despite the `static` default. Options
 * that are not passed emit no declaration, so they never clobber `size`.
 *
 * @example
 * ```
 * import { stackItem } from '@astryxdesign/core/Layout';
 *
 * <div {...stylex.props(...stackItem({ size: 'fill' }))}>
 *   Content that fills remaining space
 * </div>
 *
 * // Fixed 320px detail column that absorbs the leftover space and scrolls
 * <div {...stylex.props(...stackItem({ grow: true, shrink: false, basis: 320, isScrollable: true }))}>
 *   Detail
 * </div>
 * ```
 */
export function stackItem({
  crossAlignSelf,
  size,
  grow,
  shrink,
  basis,
  overflow,
  isScrollable,
}: StackItemOptions = {}) {
  const resolvedOverflow = overflow ?? (isScrollable ? 'auto' : undefined);
  return [
    minSizeResetStyles.reset,
    sizeStyles[size ?? 'static'],
    crossAlignSelf != null && crossAlignSelfStyles[crossAlignSelf],
    // Must stay AFTER sizeStyles: `size` always applies, so an explicit
    // grow/shrink/basis only wins if it is layered on top of it.
    ...flexItem({grow, shrink, basis}),
    resolvedOverflow != null && overflowStyles[resolvedOverflow],
  ] as const;
}
