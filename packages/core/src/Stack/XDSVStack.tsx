/**
 * @file XDSVStack.tsx
 * @input Uses XDSStack component
 * @output Exports XDSVStack as a thin wrapper around XDSStack
 * @position Layout/Stack component; wraps XDSStack with direction='vertical'
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/Layout/Stack/README.md
 * - /packages/core/src/Layout/Stack/XDSVStack.test.tsx
 * - /apps/storybook/stories/VStack.stories.tsx
 */

import {forwardRef} from 'react';
import {XDSStack, type XDSStackProps} from './XDSStack';
import type {StackCrossAlignment, StackMainAlignment} from './stack.stylex';

export interface XDSVStackProps extends Omit<
  XDSStackProps,
  'direction' | 'hAlign' | 'vAlign'
> {
  /**
   * Horizontal alignment of items (cross-axis for vertical stack).
   * @default 'stretch'
   */
  hAlign?: StackCrossAlignment;

  /**
   * Vertical alignment of items (main-axis for vertical stack).
   * - `start`: Align to top
   * - `center`: Center items
   * - `end`: Align to bottom
   * - `between`: Space between items
   * - `around`: Space around items
   * - `evenly`: Even space distribution
   */
  vAlign?: StackMainAlignment;
}

/**
 * Vertical stack component for arranging items top-to-bottom.
 *
 * @deprecated Use `XDSStack` with `direction="vertical"` (or omit direction) instead.
 *
 * @example
 * ```tsx
 * // Before
 * <XDSVStack gap="space2">...</XDSVStack>
 *
 * // After
 * <XDSStack gap="space2">...</XDSStack>
 * ```
 */
export const XDSVStack = forwardRef<HTMLElement, XDSVStackProps>(
  function XDSVStack(props, ref) {
    return <XDSStack {...props} direction="vertical" ref={ref} />;
  },
);

XDSVStack.displayName = 'XDSVStack';
