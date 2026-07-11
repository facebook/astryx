// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file StackItem.tsx
 * @input Uses React, ElementType, stackItem utility
 * @output Exports StackItem polymorphic component and StackItemProps
 * @position Layout/Stack component; uses stackItem.stylex.ts
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/Stack/Stack.doc.mjs
 * - /packages/cli/templates/blocks/components/Stack/ (showcase blocks)
 */

import {createElement, type ElementType, type ReactNode, type Ref} from 'react';
import type {BaseProps} from '../BaseProps';
import * as stylex from '@stylexjs/stylex';
import {
  stackItem,
  type StackItemCrossAlignSelf,
  type StackItemSize,
} from './stackItem.stylex';
import type {FlexFactor, Overflow} from '../Layout/flex.stylex';
import type {SizeValue} from '../utils/types';
import {mergeProps} from '../utils';
import {themeProps} from '../utils/themeProps';

export interface StackItemProps extends BaseProps<HTMLElement> {
  /** Ref forwarded to the root element */
  ref?: React.Ref<HTMLElement>;
  /**
   * Overrides the default cross-alignment for this item.
   * (hAlign for VStack, vAlign for HStack)
   */
  crossAlignSelf?: StackItemCrossAlignSelf;

  /**
   * Size behavior of the item within the stack.
   * - `static`: Uses intrinsic size, won't grow or shrink (default)
   * - `fill`: Grows to fill remaining space
   *
   * Coarse preset. `grow` / `shrink` / `basis` are layered on top of it and
   * win on the properties they set, so `size="fill" shrink={false}` grows but
   * never shrinks. `size` is applied even when unset (as `static`), so reach
   * for the finer props whenever you need to override just one axis of it.
   *
   * @default "static"
   */
  size?: StackItemSize;

  /**
   * Whether the item grows to absorb free space along the main axis
   * (`flex-grow`). `true` is `1`; pass a number for a custom factor.
   *
   * Overrides the `flex-grow` implied by `size`.
   */
  grow?: FlexFactor;

  /**
   * Whether the item shrinks when space runs short (`flex-shrink`).
   * `true` is `1`, `false` is `0` — the "fixed size column" idiom.
   *
   * Overrides the `flex-shrink` implied by `size` (which is `0` by default).
   */
  shrink?: FlexFactor;

  /**
   * Initial main-axis size before growing/shrinking (`flex-basis`).
   * Numbers are treated as pixels, strings are used as-is.
   */
  basis?: SizeValue;

  /**
   * Overflow behavior of the item.
   *
   * StackItem already applies the flex `min-height: 0` / `min-width: 0` reset,
   * so `<StackItem size="fill" overflow="auto">` is a complete scroll region.
   * Takes precedence over `isScrollable` when both are set.
   */
  overflow?: Overflow;

  /**
   * Enables scrollable overflow (`overflow: auto`) for the item.
   *
   * StackItem already applies the flex `min-height: 0` / `min-width: 0`
   * reset, so `<StackItem size="fill" isScrollable>` is a complete scroll
   * region — it grows to fill the stack and scrolls its own overflow with
   * no extra style plumbing. Matches `isScrollable` on `LayoutContent`
   * and `LayoutPanel`.
   * @default false
   */
  isScrollable?: boolean;

  /**
   * The element type to render.
   * @default 'div'
   */
  as?: ElementType;

  /**
   * Content to render inside the stack item.
   */
  children?: ReactNode;
}

/**
 * Stack item component for controlling individual item behavior within a stack.
 *
 * Supports polymorphic rendering via the `as` prop.
 *
 * @example
 * ```
 * <HStack gap={2}>
 *   <StackItem size="static">Logo</StackItem>
 *   <StackItem size="fill">Content</StackItem>
 *   <StackItem size="static">Actions</StackItem>
 * </HStack>
 *
 * // Fixed sidebar + detail column that takes the rest and scrolls on its own
 * <HStack height="100%">
 *   <StackItem basis={240} shrink={false}>Sidebar</StackItem>
 *   <StackItem grow basis={320} isScrollable>Detail</StackItem>
 * </HStack>
 * ```
 */
export function StackItem({
  crossAlignSelf,
  size,
  grow,
  shrink,
  basis,
  overflow,
  isScrollable,
  as: element = 'div',
  xstyle,
  className,
  style,
  children,
  ref,
  ...props
}: StackItemProps) {
  const stylexProps = stylex.props(
    ...stackItem({
      crossAlignSelf,
      size,
      grow,
      shrink,
      basis,
      overflow,
      isScrollable,
    }),
    xstyle,
  );

  return createElement(
    element,
    {
      ref: ref as Ref<Element>,
      ...mergeProps(
        themeProps('stack-item', {size}),
        stylexProps,
        className,
        style,
      ),
      ...props,
    },
    children,
  );
}

StackItem.displayName = 'StackItem';
