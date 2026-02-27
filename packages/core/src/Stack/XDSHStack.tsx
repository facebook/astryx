/**
 * @file XDSHStack.tsx
 * @input Uses XDSStack component
 * @output Exports XDSHStack as a thin wrapper around XDSStack
 * @position Layout/Stack component; wraps XDSStack with direction='horizontal'
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/Layout/Stack/README.md
 * - /packages/core/src/Layout/Stack/XDSHStack.test.tsx
 * - /apps/storybook/stories/HStack.stories.tsx
 */

import {forwardRef} from 'react';
import {XDSStack, type XDSStackProps} from './XDSStack';
import type {StackCrossAlignment, StackMainAlignment} from './stack.stylex';

export interface XDSHStackProps extends Omit<
  XDSStackProps,
  'direction' | 'hAlign' | 'vAlign'
> {
  /**
   * Horizontal alignment of items (main-axis for horizontal stack).
   * - `start`: Align to start (left in LTR)
   * - `center`: Center items
   * - `end`: Align to end (right in LTR)
   * - `between`: Space between items
   * - `around`: Space around items
   * - `evenly`: Even space distribution
   */
  hAlign?: StackMainAlignment;

  /**
   * Vertical alignment of items (cross-axis for horizontal stack).
   * @default 'stretch'
   */
  vAlign?: StackCrossAlignment;
}

/**
 * Horizontal stack component for arranging items left-to-right.
 *
 * @deprecated Use `XDSStack` with `direction="horizontal"` instead.
 *
 * @example
 * ```tsx
 * // Before
 * <XDSHStack gap="space2">...</XDSHStack>
 *
 * // After
 * <XDSStack direction="horizontal" gap="space2">...</XDSStack>
 * ```
 */
export const XDSHStack = forwardRef<HTMLElement, XDSHStackProps>(
  function XDSHStack(props, ref) {
    return <XDSStack {...props} direction="horizontal" ref={ref} />;
  },
);

XDSHStack.displayName = 'XDSHStack';
