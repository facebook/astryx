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
import {radiusVars} from '../theme/tokens.stylex';
import {xdsClassName, mergeProps} from '../utils';

export interface XDSAspectRatioProps extends XDSBaseProps<HTMLDivElement> {
  /** Ref forwarded to the root element */
  ref?: React.Ref<HTMLDivElement>;
  /**
   * The aspect ratio as width/height (e.g., 16/9 = 1.777..., 4/3 = 1.333..., 1 for square).
   *
   * Optional when `isCircle` is set, in which case the ratio defaults to 1 (square)
   * and any provided value is ignored.
   */
  ratio?: number;

  /**
   * Renders the container as a circle. Forces a 1:1 (square) ratio and applies a
   * fully rounded border so content is clipped to a circular shape. Pair with a
   * child that fills the container (e.g. an image with `objectFit: 'cover'`).
   *
   * When set, the `ratio` prop is ignored.
   *
   * @example
   * ```
   * <XDSAspectRatio isCircle>
   *   <img src="avatar.jpg" alt="" style={{objectFit: 'cover'}} />
   * </XDSAspectRatio>
   * ```
   */
  isCircle?: boolean;

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
  circle: {
    borderRadius: radiusVars['--radius-full'],
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
 * Set `isCircle` to clip the container into a circle (1:1 ratio with a fully
 * rounded border) — useful for avatars and circular media.
 *
 * @example
 * ```
 * <XDSAspectRatio ratio={16 / 9}>
 *   <img src="image.jpg" alt="Widescreen image" style={{objectFit: 'cover'}} />
 * </XDSAspectRatio>
 * ```
 *
 * @example
 * ```
 * <XDSAspectRatio isCircle>
 *   <img src="avatar.jpg" alt="" style={{objectFit: 'cover'}} />
 * </XDSAspectRatio>
 * ```
 */
export function XDSAspectRatio({
  ratio,
  isCircle = false,
  children,
  xstyle,
  className,
  style,
  ref,
  ...props
}: XDSAspectRatioProps) {
  // A circle is a 1:1 container with a fully rounded border; an explicit
  // `ratio` is ignored in that case.
  const resolvedRatio = isCircle ? 1 : ratio;
  return (
    <div
      ref={ref}
      {...mergeProps(
        xdsClassName('aspect-ratio'),
        stylex.props(styles.container, isCircle && styles.circle, xstyle),
        className,
        {...style, aspectRatio: resolvedRatio},
      )}
      {...props}>
      <div {...stylex.props(styles.child)}>{children}</div>
    </div>
  );
}

XDSAspectRatio.displayName = 'XDSAspectRatio';
