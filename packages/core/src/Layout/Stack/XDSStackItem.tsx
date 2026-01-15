/**
 * @file XDSStackItem.tsx
 * @input Uses React forwardRef, ElementType, stackItem utility
 * @output Exports XDSStackItem polymorphic component and XDSStackItemProps
 * @position Layout/Stack component; uses stackItem.stylex.ts
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/Layout/README.md
 * - /packages/core/src/Layout/Stack/XDSStackItem.test.tsx
 * - /apps/storybook/stories/StackItem.stories.tsx
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
import { stackItem, type StackItemCrossAlignSelf, type StackItemSize } from './stackItem.stylex';

export interface XDSStackItemProps extends HTMLAttributes<HTMLElement> {
  /**
   * Overrides the default cross-alignment for this item.
   * (hAlign for VStack, vAlign for HStack)
   */
  crossAlignSelf?: StackItemCrossAlignSelf;

  /**
   * Size behavior of the item within the stack.
   * - `static`: Uses intrinsic size, won't grow or shrink (default)
   * - `fill`: Grows to fill remaining space (1x proportion)
   * - `fill2x`: Grows with 2x proportion
   * - `fill3x`: Grows with 3x proportion
   *
   * @default "static"
   */
  size?: StackItemSize;

  /**
   * The element type to render.
   * @default 'div'
   */
  element?: ElementType;

  /**
   * Content to render inside the stack item.
   */
  children?: ReactNode;
}

/**
 * Stack item component for controlling individual item behavior within a stack.
 *
 * Supports polymorphic rendering via the `element` prop.
 *
 * @example
 * ```tsx
 * import { XDSHStack, XDSStackItem } from '@xds/core/Layout';
 *
 * // Basic usage with fill
 * <XDSHStack gap="space2">
 *   <XDSStackItem size="static">Logo</XDSStackItem>
 *   <XDSStackItem size="fill">Content fills remaining space</XDSStackItem>
 *   <XDSStackItem size="static">Actions</XDSStackItem>
 * </XDSHStack>
 *
 * // Proportional fill
 * <XDSHStack gap="space2">
 *   <XDSStackItem size="fill">1 part</XDSStackItem>
 *   <XDSStackItem size="fill2x">2 parts</XDSStackItem>
 * </XDSHStack>
 *
 * // Polymorphic rendering
 * <XDSStackItem element="section" size="fill">
 *   Section content
 * </XDSStackItem>
 * ```
 */
export const XDSStackItem = forwardRef<HTMLElement, XDSStackItemProps>(
  function XDSStackItem(
    { crossAlignSelf, size, element = 'div', children, ...props },
    ref
  ) {
    const stylexProps = stylex.props(...stackItem({ crossAlignSelf, size }));

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

XDSStackItem.displayName = 'XDSStackItem';
