// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file AspectRatio.tsx
 * @input Uses React, stylex
 * @output Exports AspectRatio component and AspectRatioProps
 * @position AspectRatio component; maintains a specific aspect ratio for its children
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/AspectRatio/AspectRatio.doc.mjs
 * - /packages/core/src/AspectRatio/AspectRatio.test.tsx
 * - /apps/storybook/stories/AspectRatio.stories.tsx
 * - /packages/cli/templates/blocks/components/AspectRatio/ (showcase blocks)
 */

import type {ReactNode} from 'react';
import * as stylex from '@stylexjs/stylex';
import type {BaseProps} from '../BaseProps';
import {mergeProps} from '../utils';
import {themeProps} from '../utils/themeProps';

/**
 * The shape of the aspect ratio container.
 * - `rectangle`: standard rectangular container (default).
 * - `ellipse`: clips the container to an ellipse. Combined with the `ratio`,
 *   this renders a circle at `ratio={1}` and an oval at non-square ratios.
 */
export type AspectRatioShape = 'rectangle' | 'ellipse';

export interface AspectRatioProps extends BaseProps<HTMLDivElement> {
  /** Ref forwarded to the root element */
  ref?: React.Ref<HTMLDivElement>;
  /**
   * The aspect ratio as width/height (e.g., 16/9 = 1.777..., 4/3 = 1.333..., 1 for square).
   */
  ratio: number;

  /**
   * The shape of the container. Both shapes respect the provided `ratio`.
   * - `rectangle` (default): a standard rectangular container.
   * - `ellipse`: clips the container to an ellipse — a circle when `ratio={1}`,
   *   or an oval at other ratios. Pair with a child that fills the container
   *   (e.g. an image with `objectFit: 'cover'`).
   *
   * @default 'rectangle'
   *
   * @example
   * ```
   * <AspectRatio ratio={1} shape="ellipse">
   *   <img src="avatar.jpg" alt="" style={{objectFit: 'cover'}} />
   * </AspectRatio>
   * ```
   */
  shape?: AspectRatioShape;

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
  ellipse: {
    // 50% on both axes follows the box dimensions, so the clip respects the
    // ratio: a circle at 1:1 and an oval at non-square ratios.
    borderRadius: '50%',
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
 * Use `shape="ellipse"` to clip the container into an ellipse — a circle at
 * `ratio={1}` or an oval at other ratios. Both shapes respect the provided
 * `ratio`.
 *
 * @example
 * ```
 * <AspectRatio ratio={16 / 9}>
 *   <img src="image.jpg" alt="Widescreen image" style={{objectFit: 'cover'}} />
 * </AspectRatio>
 * ```
 *
 * @example
 * ```
 * <AspectRatio ratio={1} shape="ellipse">
 *   <img src="avatar.jpg" alt="" style={{objectFit: 'cover'}} />
 * </AspectRatio>
 * ```
 */
export function AspectRatio({
  ratio,
  shape = 'rectangle',
  children,
  xstyle,
  className,
  style,
  ref,
  ...props
}: AspectRatioProps) {
  return (
    <div
      ref={ref}
      {...mergeProps(
        themeProps('aspect-ratio', {shape}),
        stylex.props(
          styles.container,
          shape === 'ellipse' && styles.ellipse,
          xstyle,
        ),
        className,
        {...style, aspectRatio: ratio},
      )}
      {...props}>
      <div {...stylex.props(styles.child)}>{children}</div>
    </div>
  );
}

AspectRatio.displayName = 'AspectRatio';
