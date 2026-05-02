/**
 * @file XDSStack.tsx
 * @input Uses React, ElementType, stack utility
 * @output Exports XDSStack polymorphic component and XDSStackProps
 * @position Layout/Stack component; uses stack.stylex.ts
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/Stack/Stack.doc.mjs
 * - /apps/storybook/stories/Stack.stories.tsx
 * - /packages/cli/templates/blocks/components/Stack/ (showcase blocks)
 */

import {
  createElement,
  type ElementType,
  type HTMLAttributes,
  type ReactNode,
  type Ref,
} from 'react';
import {XDSBaseProps} from '../XDSBaseProps';
import * as stylex from '@stylexjs/stylex';
import type {StyleXStyles} from '@stylexjs/stylex';
import {
  stack,
  type StackCrossAlignment,
  type StackDirection,
  type StackMainAlignment,
  type StackWrap,
  type SpacingStep,
} from './stack.stylex';
import type {SizeValue} from '../utils/types';
import {xdsClassName, mergeProps} from '../utils';

/**
 * Alignment values accepted by XDSStack.
 *
 * The full union of main-axis and cross-axis alignment values.
 * Which values are valid depends on direction and axis:
 * - Main axis (hAlign for horizontal, vAlign for vertical):
 *   `'start' | 'center' | 'end' | 'between' | 'around' | 'evenly'`
 * - Cross axis (vAlign for horizontal, hAlign for vertical):
 *   `'start' | 'center' | 'end' | 'stretch'`
 */
export type XDSStackAlignment = StackMainAlignment | StackCrossAlignment;

/** @deprecated Use `XDSStackAlignment` instead. */
export type StackAlignment = XDSStackAlignment;

export interface XDSStackProps extends XDSBaseProps<HTMLDivElement> {
  /** Ref forwarded to the root element */
  ref?: React.Ref<HTMLElement>;
  /**
   * Direction of the stack layout.
   * - `horizontal`: Items flow left-to-right (like XDSHStack)
   * - `vertical`: Items flow top-to-bottom (like XDSVStack)
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
  hAlign?: XDSStackAlignment;

  /**
   * Vertical alignment of items.
   * - When `direction='horizontal'`: controls cross-axis (align-items).
   *   Accepts: `'start' | 'center' | 'end' | 'stretch'`
   * - When `direction='vertical'`: controls main-axis (justify-content).
   *   Accepts: `'start' | 'center' | 'end' | 'between' | 'around' | 'evenly'`
   */
  vAlign?: XDSStackAlignment;

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
   * Spacing between items.
   * Accepts numeric spacing steps: 0, 0.5, 1, 1.5, 2, 3, 4, 5, 6, 8, 10.
   */
  gap?: SpacingStep;

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
  element?: ElementType;

  /**
   * StyleX styles created via `stylex.create()`. Merged with the component's
   * base styles inside a single `stylex.props()` call for optimal deduplication.
   *
   * @example
   * ```
   * const overrides = stylex.create({ root: { marginBottom: 8 } });
   * <Component xstyle={overrides.root} />
   * ```
   */
  xstyle?: StyleXStyles;
  /**
   * CSS class name(s) appended to the root element.
   * If you're using StyleX, prefer `xstyle` for optimal style deduplication.
   */
  className?: string;
  /**
   * Inline styles to apply to the root element. Spread after StyleX
   * inline styles, so these values take priority.
   */
  style?: React.CSSProperties;

  /**
   * Content to render inside the stack.
   */
  children?: ReactNode;
}

/**
 * Unified stack component for arranging items in a horizontal or vertical layout.
 *
 * Replaces `XDSHStack` and `XDSVStack` with a single component that accepts
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
 * <XDSStack gap={2}>
 *   <Item />
 *   <Item />
 * </XDSStack>
 * <XDSStack direction="horizontal" gap={4} vAlign="center">
 *   <Item />
 *   <Item />
 * </XDSStack>
 * ```
 */
export function XDSStack({
  direction = 'vertical',
  hAlign,
  vAlign,
  justify,
  align,
  gap,
  width,
  height,
  wrap,
  element = 'div',
  xstyle,
  className,
  style,
  children,
  ref,
  ...props
}: XDSStackProps) {
  // Resolve align/justify aliases based on direction
  const resolvedHAlign =
    hAlign ??
    (direction === 'horizontal'
      ? (justify as XDSStackAlignment | undefined)
      : (align as XDSStackAlignment | undefined));
  const resolvedVAlign =
    vAlign ??
    (direction === 'horizontal'
      ? (align as XDSStackAlignment | undefined)
      : (justify as XDSStackAlignment | undefined));

  // Map hAlign/vAlign to mainAlign/crossAlign based on direction
  const mainAlign =
    direction === 'horizontal'
      ? (resolvedHAlign as StackMainAlignment | undefined)
      : (resolvedVAlign as StackMainAlignment | undefined);
  const crossAlign =
    direction === 'horizontal'
      ? (resolvedVAlign as StackCrossAlignment | undefined)
      : (resolvedHAlign as StackCrossAlignment | undefined);

  const stylexProps = stylex.props(
    ...stack({
      direction,
      crossAlign,
      mainAlign,
      gap,
      wrap,
    }),
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
  };

  return createElement(
    element,
    {
      ref: ref as Ref<Element>,
      ...mergeProps(
        xdsClassName('stack', {direction, gap, wrap}),
        stylexProps,
        className,
        {...style, ...sizingStyle},
      ),
      ...props,
    },
    children,
  );
}

XDSStack.displayName = 'XDSStack';
