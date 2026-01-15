/**
 * @file XDSVStack.tsx
 * @input Uses React forwardRef, HTMLAttributes, ReactNode, stack utility
 * @output Exports XDSVStack component and XDSVStackProps
 * @position Core implementation; uses Layout/stack.stylex.ts
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/VStack/README.md
 * - /packages/core/src/VStack/XDSVStack.test.tsx
 * - /packages/core/src/VStack/index.ts
 * - /apps/storybook/stories/VStack.stories.tsx
 */

import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import * as stylex from '@stylexjs/stylex';
import { stack, type StackCrossAlignment, type StackWrap } from '../Layout';

export interface XDSVStackProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Horizontal alignment of items (cross-axis for vertical stack).
   * @default 'stretch'
   */
  hAlign?: StackCrossAlignment;

  /**
   * Spacing between items in pixels.
   * @default 0
   */
  gap?: number;

  /**
   * Whether items should wrap.
   * - `nowrap`: Items stay on one line (default)
   * - `wrap`: Items wrap to next line
   * - `wrap-reverse`: Items wrap to previous line
   * @default 'nowrap'
   */
  wrap?: StackWrap;

  /**
   * Content to render inside the stack.
   */
  children: ReactNode;
}

/**
 * Vertical stack component for arranging items top-to-bottom.
 *
 * Uses the stack utility internally with `direction: 'vertical'`.
 * The `hAlign` prop controls horizontal alignment of items.
 *
 * @example
 * ```tsx
 * import { XDSVStack } from '@xds/core/VStack';
 *
 * // Basic vertical stack
 * <XDSVStack gap={8}>
 *   <Item />
 *   <Item />
 * </XDSVStack>
 *
 * // Centered items
 * <XDSVStack gap={16} hAlign="center">
 *   <Item />
 *   <Item />
 * </XDSVStack>
 * ```
 */
export const XDSVStack = forwardRef<HTMLDivElement, XDSVStackProps>(
  ({ hAlign, gap, wrap, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        {...stylex.props(
          ...stack({
            direction: 'vertical',
            crossAlign: hAlign,
            gap,
            wrap,
          })
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

XDSVStack.displayName = 'XDSVStack';
