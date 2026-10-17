// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file StackItem.tsx
 * @input Uses React, ElementType, stackItem utility
 * @output Exports StackItem polymorphic component and StackItemProps
 * @position Layout/Stack component; uses stackItem.stylex.ts
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/Stack/Stack.doc.mjs
 * - /packages/cli/assets/templates/blocks/components/Stack/ (showcase blocks)
 */

import {createElement, type ElementType, type ReactNode, type Ref} from 'react';
import type {BaseProps} from '../BaseProps';
import * as stylex from '@stylexjs/stylex';
import {
  stackItem,
  type StackItemCrossAlignSelf,
  type StackItemSize,
} from './stackItem.stylex';
import type {SizeValue} from '../utils/types';
import {mergeProps} from '../utils';
import {themeProps} from '../utils/themeProps';

const overflowStyles = stylex.create({
  scrollable: {
    overflow: 'auto',
  },
});

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
   * @default "static"
   */
  size?: StackItemSize;

  /**
   * Minimum width of the item.
   * Numbers are treated as pixels, strings are used as-is (e.g., '50%').
   *
   * Replaces the flex `min-width: 0` reset, so `size="fill"` with a
   * `minWidth` grows into the free space but never shrinks below the floor;
   * the parent stack overflows instead (and scrolls, if it is `isScrollable`).
   */
  minWidth?: SizeValue;

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
 * // Detail pane that fills the rest of a scrolling strip, floored at 320px
 * <HStack height="100%" isScrollable>
 *   <StackItem size="static">Sidebar</StackItem>
 *   <StackItem size="fill" minWidth={320}>Detail</StackItem>
 * </HStack>
 * ```
 */
export function StackItem({
  crossAlignSelf,
  size,
  minWidth,
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
    ...stackItem({crossAlignSelf, size}),
    isScrollable && overflowStyles.scrollable,
    xstyle,
  );

  // Inline, like Stack's sizing props, so it wins over the class-based
  // min-width reset from stackItem().
  const sizingStyle: React.CSSProperties = {
    ...(minWidth != null && {
      minWidth: typeof minWidth === 'number' ? `${minWidth}px` : minWidth,
    }),
  };

  return createElement(
    element,
    {
      ref: ref as Ref<Element>,
      ...mergeProps(themeProps('stack-item', {size}), stylexProps, className, {
        ...style,
        ...sizingStyle,
      }),
      ...props,
    },
    children,
  );
}

StackItem.displayName = 'StackItem';
