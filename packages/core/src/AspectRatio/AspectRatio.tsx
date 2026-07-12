// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file AspectRatio.tsx
 * @input Uses React, stylex
 * @output Exports AspectRatio component, AspectRatioProps, AspectRatioShape, AspectRatioFit
 * @position AspectRatio component; maintains a specific aspect ratio for its children
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/AspectRatio/AspectRatio.doc.mjs
 * - /packages/core/src/AspectRatio/AspectRatio.test.tsx
 * - /packages/core/src/reset.css (AspectRatio fit baseline rules)
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

/**
 * How the child is sized and positioned inside the ratio box.
 * - `cover`: the child fills the box; media is cropped to preserve its own
 *   aspect ratio (`object-fit: cover`).
 * - `contain`: the child fills the box; media is letterboxed to stay fully
 *   visible (`object-fit: contain`).
 * - `center`: the child keeps its natural size and sits centered in the box.
 */
export type AspectRatioFit = 'cover' | 'contain' | 'center';

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
   *   or an oval at other ratios. Pair with `fit="cover"` so the media fills
   *   the clipped container.
   *
   * @default 'rectangle'
   *
   * @example
   * ```
   * <AspectRatio ratio={1} shape="ellipse" fit="cover">
   *   <img src="avatar.jpg" alt="" />
   * </AspectRatio>
   * ```
   */
  shape?: AspectRatioShape;

  /**
   * How the child is laid out inside the ratio box, so the child does not
   * have to declare `width`/`height`/`objectFit` itself.
   * - `cover`: child fills the box; media is cropped (`object-fit: cover`).
   * - `contain`: child fills the box; media is letterboxed
   *   (`object-fit: contain`).
   * - `center`: child keeps its natural size, centered in the box.
   *
   * `cover`/`contain` child sizing ships as zero-specificity baseline rules
   * in `reset.css`, keyed on the reflected `data-fit` attribute (the same
   * mechanism as the `data-astryx-media` baseline). Any styles the child
   * sets itself still win, so children that already size themselves keep
   * their behavior. When omitted, the child is left unstyled (the
   * pre-existing contract).
   *
   * @example
   * ```
   * <AspectRatio ratio={16 / 9} fit="cover">
   *   <img src="image.jpg" alt="Widescreen image" />
   * </AspectRatio>
   * ```
   */
  fit?: AspectRatioFit;

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
  // fit="center" centers the child at its natural size from the wrapper —
  // no styles on the child itself. The `cover`/`contain` child sizing can't
  // live here (StyleX has no descendant selectors); it ships as baseline
  // rules in reset.css keyed on the reflected `data-fit` attribute.
  childCenter: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

/**
 * AspectRatio component for maintaining a specific aspect ratio for its children.
 *
 * Uses the CSS aspect-ratio property to maintain the ratio. The child element
 * is positioned absolutely to fill the container, which is useful for images,
 * videos, embeds, and placeholders.
 *
 * Use `fit` to let the component size the child: `cover`/`contain` stretch
 * the child to fill the box (cropping or letterboxing media), `center` keeps
 * the child at its natural size. Without `fit`, the child styles itself.
 *
 * Use `shape="ellipse"` to clip the container into an ellipse — a circle at
 * `ratio={1}` or an oval at other ratios. Both shapes respect the provided
 * `ratio`.
 *
 * @example
 * ```
 * <AspectRatio ratio={16 / 9} fit="cover">
 *   <img src="image.jpg" alt="Widescreen image" />
 * </AspectRatio>
 * ```
 *
 * @example
 * ```
 * <AspectRatio ratio={1} shape="ellipse" fit="cover">
 *   <img src="avatar.jpg" alt="" />
 * </AspectRatio>
 * ```
 */
export function AspectRatio({
  ratio,
  shape = 'rectangle',
  fit,
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
        themeProps('aspect-ratio', {shape, fit}),
        stylex.props(
          styles.container,
          shape === 'ellipse' && styles.ellipse,
          xstyle,
        ),
        className,
        {...style, aspectRatio: ratio},
      )}
      {...props}>
      <div
        {...stylex.props(styles.child, fit === 'center' && styles.childCenter)}>
        {children}
      </div>
    </div>
  );
}

AspectRatio.displayName = 'AspectRatio';
