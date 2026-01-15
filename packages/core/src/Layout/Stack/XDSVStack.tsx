/**
 * @file XDSVStack.tsx
 * @input Uses React forwardRef, ElementType, stack utility
 * @output Exports XDSVStack polymorphic component and XDSVStackProps
 * @position Layout/Stack component; uses stack.stylex.ts
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/Layout/Stack/README.md
 * - /packages/core/src/Layout/Stack/XDSVStack.test.tsx
 * - /apps/storybook/stories/VStack.stories.tsx
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

export interface XDSVStackProps extends Omit<HTMLAttributes<HTMLElement>, 'style' | 'className'> {
  /**
   * Horizontal alignment of items (cross-axis for vertical stack).
   * @default 'stretch'
   */
  hAlign?: StackCrossAlignment;

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
 * Vertical stack component for arranging items top-to-bottom.
 *
 * Uses the stack utility internally with `direction: 'vertical'`.
 * The `hAlign` prop controls horizontal alignment of items.
 * Supports polymorphic rendering via the `element` prop.
 *
 * @example
 * ```tsx
 * <XDSVStack gap="space2">
 *   <Item />
 *   <Item />
 * </XDSVStack>
 * <XDSVStack gap="space4" hAlign="center">
 *   <Item />
 *   <Item />
 * </XDSVStack>
 * ```
 */
export const XDSVStack = forwardRef<HTMLElement, XDSVStackProps>(
  function XDSVStack(
    { hAlign, gap, wrap, element = 'div', xstyle, children, ...props },
    ref
  ) {
    const stylexProps = stylex.props(
      ...stack({
        direction: 'vertical',
        crossAlign: hAlign,
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

XDSVStack.displayName = 'XDSVStack';
