/**
 * @file XDSStack.tsx
 * @input Uses React forwardRef, ElementType, stack utility
 * @output Exports XDSStack polymorphic component and XDSStackProps
 * @position Layout/Stack component; uses stack.stylex.ts
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/Stack/Stack.doc.mjs
 * - /packages/core/src/Layout/Stack/XDSStack.test.tsx
 * - /apps/storybook/stories/Stack.stories.tsx
 */

import {
  forwardRef,
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
  type SpacingScale,
} from './stack.stylex';
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
export type StackAlignment = StackMainAlignment | StackCrossAlignment;

export interface XDSStackProps extends XDSBaseProps<HTMLDivElement> {
  /**
   * Direction of the stack layout.
   * - `horizontal`: Items flow left-to-right (like XDSHStack)
   * - `vertical`: Items flow top-to-bottom (like XDSVStack)
   */
  direction: StackDirection;

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
   * Spacing between items using theme spacing tokens.
   * Use token names: 'space0', 'space1', 'space2', 'space3', 'space4', 'space5', 'space6', 'space7'
   */
  gap?: SpacingScale;

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
   * ```tsx
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
 * a required `direction` prop so the layout intent is always explicit.
 *
 * The `hAlign` and `vAlign` props automatically map to the correct CSS axis
 * based on the direction:
 * - `direction='horizontal'`: hAlign → justify-content, vAlign → align-items
 * - `direction='vertical'`: hAlign → align-items, vAlign → justify-content
 *
 * @example
 * ```
 * // Vertical stack
 * <XDSStack direction="vertical" gap="space2">
 *   <Item />
 *   <Item />
 * </XDSStack>
 *
 * // Horizontal stack
 * <XDSStack direction="horizontal" gap="space4" vAlign="center">
 *   <Item />
 *   <Item />
 * </XDSStack>
 * ```
 */
export const XDSStack = forwardRef<HTMLElement, XDSStackProps>(
  function XDSStack(
    {
      direction,
      hAlign,
      vAlign,
      gap,
      wrap,
      element = 'div',
      xstyle,
      className,
      style,
      children,
      ...props
    },
    ref,
  ) {
    // Map hAlign/vAlign to mainAlign/crossAlign based on direction
    const mainAlign =
      direction === 'horizontal'
        ? (hAlign as StackMainAlignment | undefined)
        : (vAlign as StackMainAlignment | undefined);
    const crossAlign =
      direction === 'horizontal'
        ? (vAlign as StackCrossAlignment | undefined)
        : (hAlign as StackCrossAlignment | undefined);

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

    return createElement(
      element,
      {
        ref: ref as Ref<Element>,
        ...mergeProps(
          xdsClassName('stack', {direction, gap, wrap}),
          stylexProps,
          className,
          style,
        ),
        ...props,
      },
      children,
    );
  },
);

XDSStack.displayName = 'XDSStack';
