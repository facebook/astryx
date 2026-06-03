// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file XDSAspectRatio.tsx
 * @input Uses React, stylex
 * @output Exports XDSAspectRatio component and XDSAspectRatioProps
 * @position AspectRatio component; maintains a specific aspect ratio for its children
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/AspectRatio/AspectRatio.doc.mjs
 * - /packages/core/src/AspectRatio/XDSAspectRatio.test.tsx
 * - /apps/storybook/stories/AspectRatio.stories.tsx
 * - /packages/cli/templates/blocks/components/AspectRatio/ (showcase blocks)
 */

import type {ReactNode} from 'react';
import * as stylex from '@stylexjs/stylex';
import type {XDSBaseProps} from '../XDSBaseProps';
import {xdsClassName, mergeProps} from '../utils';

export interface XDSAspectRatioProps extends XDSBaseProps<HTMLDivElement> {
  /** Ref forwarded to the root element */
  ref?: React.Ref<HTMLDivElement>;
  /**
   * The aspect ratio as width/height (e.g., 16/9 = 1.777..., 4/3 = 1.333..., 1 for square).
   */
  ratio: number;

  /**
   * Content to render inside the aspect ratio container.
   * The child element will be positioned absolutely to fill the container.
   */
  children: ReactNode;
}

const styles = stylex.create({
  container: {
    position: 'relative',
    width: '100%',
    overflow: 'clip',
    minHeight: 0,
    flexShrink: 0,
  },
  child: {
    position: 'absolute',
    top: 0,
    insetInlineStart: 0,
    width: '100%',
    height: '100%',
  },
});

/**
 * AspectRatio component for maintaining a specific aspect ratio for its children.
 *
 * Uses the CSS aspect-ratio property to maintain the ratio. The child element
 * is positioned absolutely to fill the container, which is useful for images,
 * videos, embeds, and placeholders.
 *
 * @example
 * ```
 * <XDSAspectRatio ratio={16 / 9}>
 *   <img src="image.jpg" alt="Widescreen image" style={{objectFit: 'cover'}} />
 * </XDSAspectRatio>
 * ```
 */
export function XDSAspectRatio({
  ratio,
  children,
  xstyle,
  className,
  style,
  ref,
  ...props
}: XDSAspectRatioProps) {
  return (
    <div
      ref={ref}
      {...mergeProps(
        xdsClassName('aspect-ratio'),
        stylex.props(styles.container, xstyle),
        className,
        {...style, aspectRatio: ratio},
      )}
      {...props}>
      <div {...stylex.props(styles.child)}>{children}</div>
    </div>
  );
}

XDSAspectRatio.displayName = 'XDSAspectRatio';
