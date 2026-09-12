// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file ScrollableArea.tsx
 * @input Logical scroll intent, accessible name, chaining policy, and content
 * @output Native scroll viewport with an observed real content box
 * @position Reference composition over useScrollableArea
 *
 * SYNC: When modified, update:
 * - /packages/core/src/ScrollableArea/ScrollableArea.test.tsx
 * - /packages/core/src/ScrollableArea/ScrollableArea.doc.mjs
 * - /apps/storybook/stories/ScrollableArea.stories.tsx
 */

import type {CSSProperties, ReactNode} from 'react';
import * as stylex from '@stylexjs/stylex';
import type {BaseProps} from '../BaseProps';
import {
  useScrollableArea,
  type ScrollAxis,
  type ScrollOverscroll,
} from '../hooks/useScrollableArea';
import {colorVars} from '../theme/tokens.stylex';
import {focusOutlineStyles} from '../utils/focusOutline.stylex';
import {mergeProps} from '../utils/mergeProps';
import {themeProps} from '../utils/themeProps';

const styles = stylex.create({
  viewport: {
    boxSizing: 'border-box',
    maxInlineSize: '100%',
    maxBlockSize: '100%',
    WebkitOverflowScrolling: 'touch',
    scrollbarColor: {
      default: `${colorVars['--color-neutral']} transparent`,
      '@media (forced-colors: active)': 'auto',
    },
    scrollbarWidth: 'auto',
    scrollbarGutter: 'auto',
    // Chromium can resolve CSS-only stuck/edge presentation for descendants.
    // Unsupported engines keep the hook state as the behavior source of truth.
    containerType: {
      default: null,
      '@supports (container-type: scroll-state)': 'scroll-state',
    },
  },
  inline: {
    overflowInline: 'auto',
    overflowBlock: 'hidden',
  },
  block: {
    overflowInline: 'hidden',
    overflowBlock: 'auto',
  },
  both: {
    overflow: 'auto',
  },
  content: {
    boxSizing: 'border-box',
    minInlineSize: '100%',
    minBlockSize: '100%',
  },
  contentWithInlineOverflow: {
    inlineSize: 'max-content',
  },
});

export interface ScrollableAreaProps extends Omit<
  BaseProps<HTMLDivElement>,
  'aria-label' | 'children' | 'role' | 'tabIndex'
> {
  /** Content rendered inside the observed content box. */
  children?: ReactNode;
  /** Logical axis or axes where scrolling is allowed. @default 'block' */
  axis?: ScrollAxis;
  /** Accessible name used when an effective viewport enters the tab order. */
  label: string;
  /** Semantics for the named scroll viewport. @default 'group' */
  role?: 'group' | 'region';
  /** Whether effective axes pass scroll gestures to ancestors at an edge. @default 'allow' */
  overscroll?: ScrollOverscroll;
  /** Ref connected to the native scroll viewport. */
  ref?: React.Ref<HTMLDivElement>;
}

/**
 * A native scroll viewport with axis-aware accessibility and chaining.
 *
 * The root is the viewport. Its single child is a normal block content box with
 * a 100% minimum size; children participate in that box rather than directly in
 * viewport flex/grid layout. Inline scrolling gives the box max-content inline
 * sizing, and its minimum block size deliberately does not create a definite
 * percentage-height basis. Use the hook on owned structure when those formatting
 * semantics must stay unchanged. Native scrolling and platform scrollbars remain
 * authoritative.
 *
 * @example
 * ```
 * <ScrollableArea axis="block" label="Activity history">
 *   <ActivityList />
 * </ScrollableArea>
 * ```
 */
export function ScrollableArea({
  children,
  axis = 'block',
  label,
  role = 'group',
  overscroll = 'allow',
  ref,
  xstyle,
  className,
  style,
  ...props
}: ScrollableAreaProps) {
  const {getViewportProps, getContentProps} = useScrollableArea({
    axis,
    keyboardAccess: {owner: 'viewport', label, role},
    overscroll,
  });

  const mergedViewportProps = mergeProps(
    themeProps('scrollable-area', {axis}),
    stylex.props(
      styles.viewport,
      styles[axis],
      focusOutlineStyles.focusVisible,
      xstyle,
    ),
    className,
    style,
  );
  const logicalOverflowStyle: CSSProperties =
    axis === 'both'
      ? {overflow: 'auto'}
      : axis === 'inline'
        ? {overflowInline: 'auto', overflowBlock: 'hidden'}
        : {overflowInline: 'hidden', overflowBlock: 'auto'};
  const viewportProps = getViewportProps<HTMLDivElement>({
    ...props,
    ref,
    ...mergedViewportProps,
    style: {...mergedViewportProps.style, ...logicalOverflowStyle},
  });

  return (
    <div {...viewportProps}>
      <div
        {...getContentProps<HTMLDivElement>({
          ...stylex.props(
            styles.content,
            axis !== 'block' && styles.contentWithInlineOverflow,
          ),
          style: {
            minInlineSize: '100%',
            minBlockSize: '100%',
            ...(axis !== 'block' ? {inlineSize: 'max-content'} : null),
          },
        })}>
        {children}
      </div>
    </div>
  );
}

ScrollableArea.displayName = 'ScrollableArea';
