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
   *
   * The ratio is emitted as a class-level `aspect-ratio: var(--astryx-aspect-ratio, <ratio>)`
   * declaration — never an inline style — so it can be made responsive:
   * - StyleX consumers pass an `aspect-ratio` rule via `xstyle`, including
   *   under `@media`/`@container` conditions.
   * - Plain-CSS/Tailwind consumers set the `--astryx-aspect-ratio` custom
   *   property on the element from any rule; it wins over the prop fallback
   *   regardless of specificity.
   *
   * @example
   * ```
   * // 3:1 hero that becomes 3:2 when its container stacks
   * <AspectRatio ratio={3 / 1} className="gallery-hero">…</AspectRatio>
   *
   * // CSS: @container gallery (max-width: 720px) {
   * //   .gallery-hero { --astryx-aspect-ratio: 3 / 2; }
   * // }
   * ```
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
   * in `reset.css`, keyed on the `data-astryx-aspect-ratio-override`
   * attribute the component sets on the child's direct parent. Any styles
   * the child sets itself still win, so children that already size
   * themselves keep their behavior. When omitted, the child is left
   * unstyled (the pre-existing contract). `fit` is structural, not visual,
   * so it is not exposed on the theming surface.
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
  // rules in reset.css keyed on the `data-astryx-aspect-ratio-override`
  // attribute the wrapper carries (see below).
  childCenter: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

// The ratio compiles to a CSS variable + a class-level declaration
// (aspect-ratio: var(--x)) instead of a raw inline style, so consumer
// overrides — `xstyle` rules, including ones inside @media/@container
// queries — can still win. A raw inline `aspect-ratio` would beat any class
// (same rationale as Grid's dynamic track values).
// The `--astryx-aspect-ratio` custom property (namespace: naming.ts cssVar)
// is the override hook for non-StyleX consumers: setting it on the element
// from any rule — e.g. inside a @container query — wins over the `ratio`
// prop fallback regardless of specificity or cascade layer.
const dynamicStyles = stylex.create({
  ratio: (ratio: number) => ({
    aspectRatio: `var(--astryx-aspect-ratio, ${ratio})`,
  }),
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
 * The ratio is a class-level declaration (not an inline style), so it can be
 * overridden responsively — via `xstyle` for StyleX consumers, or by setting
 * the `--astryx-aspect-ratio` custom property under a `@media`/`@container`
 * rule for plain-CSS consumers.
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
        themeProps('aspect-ratio', {shape}),
        stylex.props(
          styles.container,
          dynamicStyles.ratio(ratio),
          shape === 'ellipse' && styles.ellipse,
          xstyle,
        ),
        className,
        style,
      )}
      {...props}>
      {/* The marker attribute carries the fit value so the reset.css child
          sizing can use direct-child selectors on this wrapper — the child's
          actual parent — without depending on AspectRatio's internal
          structure or on the theming surface (fit is structural, not
          themeable). The name is namespaced to avoid collisions. */}
      <div
        data-astryx-aspect-ratio-override={fit}
        {...stylex.props(styles.child, fit === 'center' && styles.childCenter)}>
        {children}
      </div>
    </div>
  );
}

AspectRatio.displayName = 'AspectRatio';
