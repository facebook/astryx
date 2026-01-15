/**
 * @file stackItem.stylex.ts
 * @input Uses @stylexjs/stylex
 * @output StyleX utility for stack item styling
 * @position Layout utility; used by XDSStackItem and directly by components
 *
 * SYNC: When modified, update /packages/core/src/Layout/README.md
 */

import * as stylex from '@stylexjs/stylex';

/**
 * "Resets" the min-width and min-height of the flex item to behave predictably.
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

export interface StackItemOptions {
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
   * @default "static"
   */
  size?: StackItemSize;
}

/**
 * StyleX utility to add stack item styles to any component.
 *
 * Use this to avoid wrapping components in XDSStackItem when you need
 * direct control over flex behavior.
 *
 * @example
 * ```tsx
 * import { stackItem } from '@xds/core/Layout';
 *
 * <div {...stylex.props(...stackItem({ size: 'fill' }))}>
 *   Content that fills remaining space
 * </div>
 * ```
 */
export function stackItem({
  crossAlignSelf,
  size,
}: StackItemOptions = {}) {
  return [
    minSizeResetStyles.reset,
    sizeStyles[size ?? 'static'],
    crossAlignSelf != null && crossAlignSelfStyles[crossAlignSelf],
  ] as const;
}
