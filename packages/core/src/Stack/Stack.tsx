// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Stack.tsx
 * @input Uses React, ElementType, stack utility
 * @output Exports Stack polymorphic component and StackProps
 * @position Layout/Stack component; uses stack.stylex.ts
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/Stack/Stack.doc.mjs
 * - /apps/storybook/stories/Stack.stories.tsx
 * - /packages/cli/templates/blocks/components/Stack/ (showcase blocks)
 */

import {createElement, type ElementType, type ReactNode, type Ref} from 'react';
import type {BaseProps} from '../BaseProps';
import * as stylex from '@stylexjs/stylex';
import {
  stack,
  type StackCrossAlignment,
  type StackDirection,
  type StackMainAlignment,
  type StackWrap,
  type SpacingStep,
} from './stack.stylex';
import type {SizeValue} from '../utils/types';
import {
  paddingInlineStyles,
  paddingBlockStyles,
} from '../Layout/padding.stylex';
import {
  flexItem,
  overflowStyles,
  type FlexFactor,
  type Overflow,
} from '../Layout/flex.stylex';
import {mergeProps} from '../utils';
import {themeProps} from '../utils/themeProps';

/**
 * Alignment values accepted by Stack.
 *
 * The full union of main-axis and cross-axis alignment values.
 * Which values are valid depends on direction and axis:
 * - Main axis (hAlign for horizontal, vAlign for vertical):
 *   `'start' | 'center' | 'end' | 'between' | 'around' | 'evenly'`
 * - Cross axis (vAlign for horizontal, hAlign for vertical):
 *   `'start' | 'center' | 'end' | 'stretch'`
 */
export type StackAlignment = StackMainAlignment | StackCrossAlignment;

export interface StackProps extends BaseProps<HTMLElement> {
  /** Ref forwarded to the root element */
  ref?: React.Ref<HTMLElement>;
  /**
   * Direction of the stack layout.
   * - `horizontal`: Items flow left-to-right (like HStack)
   * - `vertical`: Items flow top-to-bottom (like VStack)
   * @default 'vertical'
   */
  direction?: StackDirection;

  /**
   * Horizontal alignment of items.
   * - When `direction='horizontal'`: controls main-axis (justify-content).
   *   Accepts: `'start' | 'center' | 'end' | 'between' | 'around' | 'evenly'`
   * - When `direction='vertical'`: controls cross-axis (align-items).
   *   Accepts: `'start' | 'center' | 'end' | 'stretch'`
   */
  hAlign?: StackAlignment;

  /**
   * Vertical alignment of items.
   * - When `direction='horizontal'`: controls cross-axis (align-items).
   *   Accepts: `'start' | 'center' | 'end' | 'stretch'`
   * - When `direction='vertical'`: controls main-axis (justify-content).
   *   Accepts: `'start' | 'center' | 'end' | 'between' | 'around' | 'evenly'`
   */
  vAlign?: StackAlignment;

  /**
   * Main-axis alignment alias. Resolves based on `direction`:
   * - `horizontal` → `hAlign` (justify-content)
   * - `vertical` → `vAlign` (justify-content)
   *
   * Mirrors CSS `justify-content` / Tailwind `justify-*`.
   */
  justify?: StackMainAlignment;

  /**
   * Cross-axis alignment alias. Resolves based on `direction`:
   * - `horizontal` → `vAlign` (align-items)
   * - `vertical` → `hAlign` (align-items)
   *
   * Mirrors CSS `align-items` / Tailwind `items-*`.
   */
  align?: StackCrossAlignment;

  /**
   * Width of the stack container.
   * Numbers are treated as pixels, strings are used as-is (e.g., '100%').
   */
  width?: SizeValue;

  /**
   * Height of the stack container.
   * Numbers are treated as pixels, strings are used as-is (e.g., '100%').
   */
  height?: SizeValue;

  /**
   * Maximum width of the stack container.
   * Numbers are treated as pixels, strings are used as-is (e.g., '100%').
   */
  maxWidth?: SizeValue;

  /**
   * Minimum height of the stack container.
   * Numbers are treated as pixels, strings are used as-is (e.g., '100%').
   */
  minHeight?: SizeValue;

  /**
   * Spacing between items.
   * Accepts numeric spacing steps: 0, 0.5, 1, 1.5, 2, 3, 4, 5, 6, 8, 10.
   */
  gap?: SpacingStep;

  /**
   * Inner padding on all sides, using the spacing scale.
   * Accepts numeric spacing steps: 0, 0.5, 1, 1.5, 2, 3, 4, 5, 6, 8, 10.
   *
   * Matches the `padding` prop on `Card`, `LayoutContent`, and `LayoutPanel`.
   */
  padding?: SpacingStep;

  /**
   * Inline (horizontal) padding, using the spacing scale.
   * Overrides `padding` on the inline axis when both are set.
   */
  paddingInline?: SpacingStep;

  /**
   * Block (vertical) padding, using the spacing scale.
   * Overrides `padding` on the block axis when both are set.
   */
  paddingBlock?: SpacingStep;

  /**
   * Overflow behavior of the stack.
   *
   * Takes precedence over `isScrollable` when both are set. Only the
   * shorthand is exposed (no `overflowX`/`overflowY`): those are physical
   * axes, and Astryx styles with logical properties.
   */
  overflow?: Overflow;

  /**
   * Enables scrollable overflow (`overflow: auto`) for the stack.
   *
   * Matches the `isScrollable` prop on `LayoutContent` and `LayoutPanel`.
   * When the stack is itself a flex child that should scroll, pair it with
   * a parent `StackItem size="fill" isScrollable` (StackItem applies the
   * `min-height: 0` reset that flex scroll regions require).
   * @default false
   */
  isScrollable?: boolean;

  /**
   * Whether the stack grows to absorb free space when it is itself a flex
   * child (`flex-grow`). `true` is `1`; pass a number for a custom factor.
   */
  grow?: FlexFactor;

  /**
   * Whether the stack shrinks when space runs short (`flex-shrink`).
   * `shrink={false}` is the "fixed size pane" idiom.
   */
  shrink?: FlexFactor;

  /**
   * Initial main-axis size of the stack as a flex child (`flex-basis`).
   * Numbers are treated as pixels, strings are used as-is.
   */
  basis?: SizeValue;

  /**
   * Whether items should wrap.
   * - `nowrap`: Items stay on one line (default)
   * - `wrap`: Items wrap to next line
   * - `wrap-reverse`: Items wrap to previous line
   * @default 'nowrap'
   */
  wrap?: StackWrap;

  /**
   * The element type to render.
   * @default 'div'
   */
  as?: ElementType;

  /**
   * Content to render inside the stack.
   */
  children?: ReactNode;
}

/**
 * Unified stack component for arranging items in a horizontal or vertical layout.
 *
 * Replaces `HStack` and `VStack` with a single component that accepts
 * a `direction` prop. Defaults to `'vertical'` since most layouts stack
 * top-to-bottom.
 *
 * The `hAlign` and `vAlign` props automatically map to the correct CSS axis
 * based on the direction:
 * - `direction='horizontal'`: hAlign → justify-content, vAlign → align-items
 * - `direction='vertical'`: hAlign → align-items, vAlign → justify-content
 *
 * @example
 * ```
 * <Stack gap={2}>
 *   <Item />
 *   <Item />
 * </Stack>
 * <Stack direction="horizontal" gap={4} vAlign="center">
 *   <Item />
 *   <Item />
 * </Stack>
 * ```
 */
export function Stack({
  direction = 'vertical',
  hAlign,
  vAlign,
  justify,
  align,
  gap,
  padding,
  paddingInline,
  paddingBlock,
  overflow,
  isScrollable,
  grow,
  shrink,
  basis,
  width,
  height,
  maxWidth,
  minHeight,
  wrap,
  as: element = 'div',
  xstyle,
  className,
  style,
  children,
  ref,
  ...props
}: StackProps) {
  // Resolve align/justify aliases based on direction
  const resolvedHAlign =
    hAlign ?? (direction === 'horizontal' ? justify : align);
  const resolvedVAlign =
    vAlign ?? (direction === 'horizontal' ? align : justify);

  // Map hAlign/vAlign to mainAlign/crossAlign based on direction
  const mainAlign =
    direction === 'horizontal'
      ? (resolvedHAlign as StackMainAlignment | undefined)
      : (resolvedVAlign as StackMainAlignment | undefined);
  const crossAlign =
    direction === 'horizontal'
      ? (resolvedVAlign as StackCrossAlignment | undefined)
      : (resolvedHAlign as StackCrossAlignment | undefined);

  // Resolve padding to per-axis values: `padding` sets both axes; `paddingInline`
  // / `paddingBlock` take precedence on their own axis when provided.
  const resolvedPaddingInline = paddingInline ?? padding;
  const resolvedPaddingBlock = paddingBlock ?? padding;

  // `isScrollable` is sugar for `overflow="auto"`; the enum wins when both are set.
  const resolvedOverflow = overflow ?? (isScrollable ? 'auto' : undefined);

  const stylexProps = stylex.props(
    ...stack({
      direction,
      crossAlign,
      mainAlign,
      gap,
      wrap,
    }),
    resolvedPaddingInline != null && paddingInlineStyles[resolvedPaddingInline],
    resolvedPaddingBlock != null && paddingBlockStyles[resolvedPaddingBlock],
    resolvedOverflow != null && overflowStyles[resolvedOverflow],
    ...flexItem({grow, shrink, basis}),
    xstyle,
  );

  // Build inline style for dynamic sizing values
  const sizingStyle: React.CSSProperties = {
    ...(width != null && {
      width: typeof width === 'number' ? `${width}px` : width,
    }),
    ...(height != null && {
      height: typeof height === 'number' ? `${height}px` : height,
    }),
    ...(maxWidth != null && {
      maxWidth: typeof maxWidth === 'number' ? `${maxWidth}px` : maxWidth,
    }),
    ...(minHeight != null && {
      minHeight: typeof minHeight === 'number' ? `${minHeight}px` : minHeight,
    }),
  };

  return createElement(
    element,
    {
      ref: ref as Ref<Element>,
      ...mergeProps(
        themeProps('stack', {direction, gap, wrap}),
        stylexProps,
        className,
        {...style, ...sizingStyle},
      ),
      ...props,
    },
    children,
  );
}

Stack.displayName = 'Stack';
