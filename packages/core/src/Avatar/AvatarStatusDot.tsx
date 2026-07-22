// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file AvatarStatusDot.tsx
 * @input Uses React, StyleX, theme tokens, and AvatarSizeContext
 * @output Exports AvatarStatusDot component and AvatarStatusDotProps type
 * @position Sub-component of Avatar; renders a size-aware status indicator
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/Avatar/Avatar.doc.mjs (features, files table)
 * - /packages/core/src/Avatar/index.ts (exports)
 * - /apps/storybook/stories/Avatar.stories.tsx (storybook stories)
 * - /packages/cli/templates/blocks/components/Avatar/ (showcase blocks)
 */

import React, {use, type ReactNode} from 'react';
import type {BaseProps} from '../BaseProps';
import * as stylex from '@stylexjs/stylex';
import {colorVars, radiusVars} from '../theme/tokens.stylex';
import {AvatarSizeContext} from './AvatarSizeContext';
import {isRenderable, mergeProps} from '../utils';
import {themeProps} from '../utils/themeProps';

/**
 * Discrete size tier of the status dot, derived from the avatar size.
 * Keys the built-in shape glyph geometry, which must stay in whole pixels
 * per tier so the glyph centers crisply on 1x displays.
 */
type StatusDotSizeTier = 'small' | 'medium' | 'large';

/**
 * Resolves the status dot size, border width, icon size, and size tier
 * based on the avatar size.
 *
 * Uses discrete size tiers rather than a continuous ratio so the dot
 * looks intentional at every avatar size:
 *
 *   | Avatar size  | Tier   | Dot  | Border | Icon | Ring hole | Minus bar |
 *   |--------------|--------|------|--------|------|-----------|-----------|
 *   | ≤ 36px       | small  | 10px | 1px    | —    | 4px       | 6×2px     |
 *   | 40–72px      | medium | 20px | 2px    | 12px | 8px       | 12×4px    |
 *   | ≥ 96px       | large  | 32px | 4px    | 18px | 12px      | 18×6px    |
 *
 * Icons are not rendered at the smallest tier — there isn't enough
 * room for them to be legible. The built-in shape glyphs (see
 * `glyphShapeMap`) do render there, so status stays distinguishable
 * without colour at every size.
 */
function resolveStatusDotSize(avatarSize: number): {
  dotSize: number;
  borderWidth: number;
  iconSize: number;
  tier: StatusDotSizeTier;
} {
  if (avatarSize <= 36) {
    return {dotSize: 10, borderWidth: 1, iconSize: 0, tier: 'small'};
  }
  if (avatarSize <= 72) {
    return {dotSize: 20, borderWidth: 2, iconSize: 12, tier: 'medium'};
  }
  return {dotSize: 32, borderWidth: 4, iconSize: 18, tier: 'large'};
}

/**
 * Extensible variant map for AvatarStatusDot.
 *
 * Theme packages can add custom variants via TypeScript module augmentation:
 * @example
 * ```
 * declare module '@astryxdesign/core/Avatar' {
 *   interface AvatarStatusDotVariantMap {
 *     'away': true;
 *   }
 * }
 * ```
 *
 * Custom variants render no background fill and no built-in shape glyph —
 * the theme must supply the fill, and should also supply a non-colour mark
 * so the status is not distinguishable by colour alone (a WCAG 1.4.1
 * failure): pass `icon`, or theme a glyph onto the dot via
 * `.astryx-avatar-status-dot[data-variant="..."]` (e.g. a `::before` mark).
 */
export interface AvatarStatusDotVariantMap {
  success: true;
  neutral: true;
  error: true;
}

/**
 * AvatarStatusDot variant type. Extensible via module augmentation of AvatarStatusDotVariantMap.
 */
export type AvatarStatusDotVariant = keyof AvatarStatusDotVariantMap;

export interface AvatarStatusDotProps extends BaseProps<HTMLDivElement> {
  ref?: React.Ref<HTMLDivElement>;
  /**
   * The semantic variant of the dot. Each variant pairs a colour with a
   * distinct built-in shape so status is never conveyed by colour alone
   * (WCAG 2.1 SC 1.4.1):
   * - `success` — filled green dot (e.g. online, accepted)
   * - `neutral` — grey ring (e.g. away, offline, pending)
   * - `error` — red dot with a minus bar (e.g. busy, do not disturb)
   *
   * Matches the `variant` naming convention from `StatusDot`.
   * @default 'success'
   */
  variant?: AvatarStatusDotVariant;
  /**
   * Accessible label for the status dot.
   * Describes the meaning of the indicator for screen readers
   * (e.g. "Online", "Accepted", "John Doe is busy").
   *
   * Note: inside an Avatar the label is currently not announced — the
   * Avatar root is `role="img"`, which prunes descendant semantics.
   * Pass it anyway; composing status into the avatar's accessible name
   * is a planned Avatar-level fix.
   */
  label?: string;
  /**
   * Optional icon to render centered inside the dot.
   * Accepts any ReactNode (typically an SVG icon).
   * The icon is automatically sized to fit the dot and hidden
   * at the smallest avatar sizes where there isn't enough room.
   *
   * A rendered icon replaces the variant's built-in shape glyph, so use a
   * different icon per status — the same icon on every variant leaves the
   * statuses distinguishable by colour alone (WCAG 1.4.1). At the smallest
   * avatar sizes the built-in glyph still shows instead of the icon.
   * Booleans and empty strings are ignored (safe for `cond && <Icon />`),
   * but a component that renders nothing still counts as an icon and
   * suppresses the glyph.
   *
   * @example
   * ```
   * <AvatarStatusDot variant="success" label="Verified" icon={<CheckIcon />} />
   * ```
   */
  icon?: ReactNode;
}

const styles = stylex.create({
  dot: {
    borderRadius: radiusVars['--radius-full'],
    borderStyle: 'solid',
    borderColor: colorVars['--color-background-surface'],
    boxSizing: 'border-box',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  success: {
    backgroundColor: colorVars['--color-success'],
  },
  neutral: {
    backgroundColor: colorVars['--color-text-secondary'],
  },
  error: {
    backgroundColor: colorVars['--color-error'],
  },
  icon: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: colorVars['--color-background-surface'],
    lineHeight: 0,
  },
});

const dynamicStyles = stylex.create({
  size: (dotSize: number, borderWidth: number) => ({
    width: dotSize,
    height: dotSize,
    borderWidth,
  }),
  iconSize: (size: number) => ({
    width: size,
    height: size,
  }),
});

const variantStyleMap: Partial<
  Record<AvatarStatusDotVariant, stylex.StyleXStyles>
> = {
  success: styles.success,
  neutral: styles.neutral,
  error: styles.error,
};

/**
 * Built-in shape glyph per variant, so each status differs by shape and not
 * only by colour (WCAG 2.1 SC 1.4.1). The glyph is a surface-coloured cutout
 * painted over the dot:
 * - `ring` — a centered hole; the dot reads as a hollow ring (away/offline).
 * - `minus` — a horizontal bar; the dot reads as "do not disturb" (busy).
 *
 * `success` stays the plain filled dot — filled, hollow, and barred are the
 * three distinct fill topologies. Custom augmented variants have no entry
 * and render no glyph; see the `AvatarStatusDotVariantMap` docs.
 */
type AvatarStatusDotGlyphShape = 'ring' | 'minus';

const glyphShapeMap: Partial<
  Record<AvatarStatusDotVariant, AvatarStatusDotGlyphShape>
> = {
  neutral: 'ring',
  error: 'minus',
};

/**
 * Glyph geometry per tier, in whole pixels so the glyph centers crisply
 * inside the dot's inner field (dot minus borders) on 1x displays:
 * ring hole = 50% of the inner field; minus bar = 75% × 25% of it.
 *
 * The cutout uses the same surface token as the dot's border, so border and
 * glyph read as one contiguous surface plate regardless of theme.
 */
const glyphStyles = stylex.create({
  base: {
    backgroundColor: colorVars['--color-background-surface'],
    borderRadius: radiusVars['--radius-full'],
    flexShrink: 0,
  },
  ringSmall: {width: 4, height: 4},
  ringMedium: {width: 8, height: 8},
  ringLarge: {width: 12, height: 12},
  minusSmall: {width: 6, height: 2},
  minusMedium: {width: 12, height: 4},
  minusLarge: {width: 18, height: 6},
});

const glyphSizeStyleMap: Record<
  AvatarStatusDotGlyphShape,
  Record<StatusDotSizeTier, stylex.StyleXStyles>
> = {
  ring: {
    small: glyphStyles.ringSmall,
    medium: glyphStyles.ringMedium,
    large: glyphStyles.ringLarge,
  },
  minus: {
    small: glyphStyles.minusSmall,
    medium: glyphStyles.minusMedium,
    large: glyphStyles.minusLarge,
  },
};

/**
 * A status indicator dot that automatically scales to match the parent
 * Avatar's size.
 *
 * Each variant pairs a colour with a distinct built-in shape (filled dot,
 * ring, minus bar) so status stays distinguishable without colour
 * perception (WCAG 2.1 SC 1.4.1). Themes can target the shape glyph via
 * the `astryx-avatar-status-dot-glyph` class and its `data-shape`
 * attribute.
 *
 * Must be used inside an Avatar's `status` prop so it can read
 * the avatar size from context.
 *
 * @example
 * ```
 * <Avatar
 *   name="John Doe"
 *   size="lg"
 *   status={<AvatarStatusDot variant="success" label="Online" />}
 * />
 * <Avatar
 *   name="Jane Smith"
 *   size="xl"
 *   status={<AvatarStatusDot variant="success" label="Verified" icon={<CheckIcon />} />}
 * />
 * ```
 */
export function AvatarStatusDot({
  ref,
  variant = 'success',
  label,
  icon,
  xstyle,
  className,
  style,
  ...props
}: AvatarStatusDotProps) {
  const avatarSize = use(AvatarSizeContext);
  const {dotSize, borderWidth, iconSize, tier} =
    resolveStatusDotSize(avatarSize);
  const showsIcon = isRenderable(icon) && iconSize > 0;
  // A rendered icon is itself a non-colour mark; overlaying both cutouts in
  // the dot's small inner field would make each illegible.
  const glyphShape = showsIcon ? undefined : glyphShapeMap[variant];

  return (
    <div
      {...props}
      ref={ref}
      {...(label ? {role: 'img', 'aria-label': label} : undefined)}
      {...mergeProps(
        themeProps('avatar-status-dot', {variant}),
        stylex.props(
          styles.dot,
          variantStyleMap[variant],
          dynamicStyles.size(dotSize, borderWidth),
          xstyle,
        ),
        className,
        style,
      )}>
      {showsIcon && (
        <span
          aria-hidden="true"
          {...stylex.props(styles.icon, dynamicStyles.iconSize(iconSize))}>
          {icon}
        </span>
      )}
      {glyphShape && (
        <span
          aria-hidden="true"
          {...mergeProps(
            themeProps('avatar-status-dot-glyph', {shape: glyphShape}),
            stylex.props(glyphStyles.base, glyphSizeStyleMap[glyphShape][tier]),
          )}
        />
      )}
    </div>
  );
}

AvatarStatusDot.displayName = 'AvatarStatusDot';
