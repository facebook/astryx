// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file XDSVStack.tsx
 * @input Uses XDSStack component
 * @output Exports XDSVStack as a thin wrapper around XDSStack
 * @position Layout/Stack component; wraps XDSStack with direction='vertical'
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/Stack/Stack.doc.mjs
 * - /packages/core/src/Stack/XDSVStack.test.tsx
 * - /packages/cli/templates/blocks/components/Stack/ (showcase blocks)
 */

import {XDSStack, type XDSStackProps} from './XDSStack';
import type {StackCrossAlignment, StackMainAlignment} from './stack.stylex';

export interface XDSVStackProps extends Omit<
  XDSStackProps,
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
 * Convenience wrapper around `XDSStack` with `direction="vertical"`.
 *
 * @example
 * ```
 * <XDSVStack gap={2}>
 *   <Item />
 *   <Item />
 * </XDSVStack>
 * ```
 */
export function XDSVStack({
  ref,
  justify,
  align,
  hAlign,
  vAlign,
  ...props
}: XDSVStackProps) {
  return (
    <XDSStack
      {...props}
      direction="vertical"
      hAlign={hAlign ?? align}
      vAlign={vAlign ?? justify}
      ref={ref}
    />
  );
}

XDSVStack.displayName = 'XDSVStack';
