// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file VStack.tsx
 * @input Uses Stack component
 * @output Exports VStack as a thin wrapper around Stack
 * @position Layout/Stack component; wraps Stack with direction='vertical'
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/Stack/Stack.doc.mjs
 * - /packages/core/src/VStack/VStack.test.tsx
 * - /packages/core/templates/blocks/components/VStack/ (showcase blocks)
 */

import {Stack, type StackProps} from '../Stack/Stack';
import type {
  StackCrossAlignment,
  StackMainAlignment,
} from '../Stack/stack.stylex';

export interface VStackProps extends Omit<
  StackProps,
  'direction' | 'hAlign' | 'vAlign'
> {
  /** Ref forwarded to the root element */
  ref?: React.Ref<HTMLElement>;
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

  /**
   * Main-axis alignment alias. Maps to `vAlign` on VStack.
   * Mirrors CSS `justify-content` / Tailwind `justify-*`.
   */
  justify?: StackMainAlignment;

  /**
   * Cross-axis alignment alias. Maps to `hAlign` on VStack.
   * Mirrors CSS `align-items` / Tailwind `items-*`.
   */
  align?: StackCrossAlignment;
}

/**
 * Vertical stack component for arranging items top-to-bottom.
 * Convenience wrapper around `Stack` with `direction="vertical"`.
 *
 * @example
 * ```
 * <VStack gap={2}>
 *   <Item />
 *   <Item />
 * </VStack>
 * ```
 */
export function VStack({
  ref,
  justify,
  align,
  hAlign,
  vAlign,
  ...props
}: VStackProps) {
  return (
    <Stack
      {...props}
      direction="vertical"
      hAlign={hAlign ?? align}
      vAlign={vAlign ?? justify}
      ref={ref}
    />
  );
}

VStack.displayName = 'VStack';
