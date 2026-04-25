/**
 * @file XDSHStack.tsx
 * @input Uses XDSStack component
 * @output Exports XDSHStack as a thin wrapper around XDSStack
 * @position Layout/Stack component; wraps XDSStack with direction='horizontal'
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/Stack/Stack.doc.mjs
 * - /packages/core/src/Stack/XDSHStack.test.tsx
 * - /packages/cli/templates/blocks/components/Stack/ (showcase blocks)
 */

import {XDSStack, type XDSStackProps} from './XDSStack';
import type {StackCrossAlignment, StackMainAlignment} from './stack.stylex';

export interface XDSHStackProps extends Omit<
  XDSStackProps,
  'direction' | 'hAlign' | 'vAlign'
> {
  /** Ref forwarded to the root element */
  ref?: React.Ref<HTMLElement>;
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

  /**
   * Main-axis alignment alias. Maps to `hAlign` on HStack.
   * Mirrors CSS `justify-content` / Tailwind `justify-*`.
   */
  justify?: StackMainAlignment;

  /**
   * Cross-axis alignment alias. Maps to `vAlign` on HStack.
   * Mirrors CSS `align-items` / Tailwind `items-*`.
   */
  align?: StackCrossAlignment;
}

/**
 * Horizontal stack component for arranging items left-to-right.
 * Convenience wrapper around `XDSStack` with `direction="horizontal"`.
 *
 * @example
 * ```
 * <XDSHStack gap={2}>
 *   <Item />
 *   <Item />
 * </XDSHStack>
 * ```
 */
export function XDSHStack({
  ref,
  justify,
  align,
  hAlign,
  vAlign,
  ...props
}: XDSHStackProps) {
  return (
    <XDSStack
      {...props}
      direction="horizontal"
      hAlign={hAlign ?? justify}
      vAlign={vAlign ?? align}
      ref={ref}
    />
  );
}

XDSHStack.displayName = 'XDSHStack';
