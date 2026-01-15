/**
 * @file XDSHStack.tsx
 * @input Uses React forwardRef, ElementType, stack utility
 * @output Exports XDSHStack polymorphic component and XDSHStackProps
 * @position Layout/Stack component; uses stack.stylex.ts
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/Layout/Stack/README.md
 * - /packages/core/src/Layout/Stack/XDSHStack.test.tsx
 * - /apps/storybook/stories/HStack.stories.tsx
 */

import {
  forwardRef,
  createElement,
  type ElementType,
  type HTMLAttributes,
  type ReactNode,
  type Ref,
} from 'react';
import * as stylex from '@stylexjs/stylex';
import type { StyleXStyles } from '@stylexjs/stylex';
import { stack, type StackCrossAlignment, type StackWrap, type SpacingScale } from './stack.stylex';

export interface XDSHStackProps extends Omit<HTMLAttributes<HTMLElement>, 'style' | 'className'> {
  /**
   * Vertical alignment of items (cross-axis for horizontal stack).
   * @default 'stretch'
   */
  vAlign?: StackCrossAlignment;

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
   * StyleX styles to apply to the stack.
   */
  xstyle?: StyleXStyles;

  /**
   * Content to render inside the stack.
   */
  children?: ReactNode;
}

/**
 * Horizontal stack component for arranging items left-to-right.
 *
 * Uses the stack utility internally with `direction: 'horizontal'`.
 * The `vAlign` prop controls vertical alignment of items.
 * Supports polymorphic rendering via the `element` prop.
 *
 * @example
 * ```tsx
 * <XDSHStack gap="space2">
 *   <Item />
 *   <Item />
 * </XDSHStack>
 * <XDSHStack gap="space4" vAlign="center">
 *   <Item />
 *   <Item />
 * </XDSHStack>
 * ```
 */
export const XDSHStack = forwardRef<HTMLElement, XDSHStackProps>(
  function XDSHStack(
    { vAlign, gap, wrap, element = 'div', xstyle, children, ...props },
    ref
  ) {
    const stylexProps = stylex.props(
      ...stack({
        direction: 'horizontal',
        crossAlign: vAlign,
        gap,
        wrap,
      }),
      xstyle
    );

    return createElement(
      element,
      {
        ref: ref as Ref<Element>,
        ...stylexProps,
        ...props,
      },
      children
    );
  }
);

XDSHStack.displayName = 'XDSHStack';
