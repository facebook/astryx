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
 * Keys the built-in shape glyph's stroke weight — see `GLYPH_STROKE_WIDTH`.
 */
type StatusDotSizeTier = 'small' | 'medium' | 'large';

/**
 * Resolves the status dot size, border width, icon size, and size tier
 * based on the avatar size.
 *
 * Uses discrete size tiers rather than a continuous ratio so the dot
 * looks intentional at every avatar size:
 *
 *   | Avatar size  | Tier   | Dot  | Border | Icon | Field | Glyph stroke |
 *   |--------------|--------|------|--------|------|-------|--------------|
 *   | ≤ 36px       | small  | 10px | 1px    | —    | 8px   | 1px          |
 *   | 40–72px      | medium | 20px | 2px    | 12px | 16px  | 1.5px        |
 *   | ≥ 96px       | large  | 32px | 4px    | 18px | 24px  | 2px          |
 *
 * "Field" is the dot's inner field — the dot minus both borders — that the
 * shape glyph is drawn into; see `GLYPH_STROKE_WIDTH` for the stroke ladder.
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
 * Custom variants render no background fill, no ink colour, and no built-in
 * shape glyph — the theme must supply the fill and, if it passes an `icon`,
 * a `color` for it to paint with. It should also supply a non-colour mark
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
   * When omitted, a default label is derived from the variant
   * ("Online", "Away", "Busy") so the status is never conveyed by
   * colour alone (WCAG 2.1 SC 1.4.1).
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
  // Each variant sets both the plate colour and the ink colour. Everything
  // drawn on the dot — the shape glyph and any user `icon` — paints from
  // `currentColor`, so the two can never drift out of contrast.
  success: {
    backgroundColor: colorVars['--color-success'],
    color: colorVars['--color-background-surface'],
  },
  // The ring variant inverts: a hollow shape only reads as hollow if its
  // interior is not the variant colour, so the plate is surface and the
  // colour moves to the stroke. This also keeps a user `icon` legible on
  // it — surface ink on a surface plate would be invisible.
  neutral: {
    backgroundColor: colorVars['--color-background-surface'],
    color: colorVars['--color-text-secondary'],
  },
  error: {
    backgroundColor: colorVars['--color-error'],
    color: colorVars['--color-background-surface'],
  },
  icon: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
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
 * Default accessible labels per variant, used when no explicit `label` prop
 * is provided. Ensures screen readers always have a status meaning to
 * announce, even at the smallest avatar tier where shape glyphs are too
 * small to be reliably perceived (WCAG 2.1 SC 1.4.1).
 *
 * Uses presence-oriented naming ("Online", "Away", "Busy") rather than
 * semantic variant names ("Success", "Neutral", "Error") because the dot
 * represents a person's real-time status.
 */
const defaultVariantLabels: Partial<Record<AvatarStatusDotVariant, string>> = {
  success: 'Online',
  neutral: 'Away',
  error: 'Busy',
};

/**
 * Built-in shape glyph per variant, so each status differs by shape and not
 * only by colour (WCAG 2.1 SC 1.4.1). The glyph is a stroked inline SVG
 * painted in `currentColor`:
 * - `ring` — a stroked circle on a surface plate; the dot reads as hollow
 *   (away/offline).
 * - `minus` — a round-capped bar across the filled dot; the dot reads as
 *   "do not disturb" (busy).
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
 * Glyph stroke weight per tier, in px of the dot's inner field.
 *
 * Roughly `field / 12`, floored at 1px so the smallest tier stays visible.
 * That lands on the 1 / 1.5 / 2 ladder the rest of the system draws with —
 * `Icon`'s default set strokes at 1.5 in a 24 viewBox, as does the
 * `CheckboxInput` checkmark — rather than the 25% band a CSS box cutout
 * produced, which was several times heavier than any other glyph we ship.
 */
const GLYPH_STROKE_WIDTH: Record<StatusDotSizeTier, number> = {
  small: 1,
  medium: 1.5,
  large: 2,
};

/** Fraction of the inner field the minus bar spans, cap to cap. */
const MINUS_BAR_SPAN = 0.75;

/**
 * The built-in shape glyph, drawn as a stroked inline SVG in `currentColor`.
 *
 * Stroking (rather than a CSS box) is what buys sub-pixel control and round
 * line caps, so the mark stays intentional at every tier — including the
 * 10px dot, where a box cutout can only land on whole pixels.
 *
 * `viewBox` is one user unit per px of the inner field, so every value here
 * is literal px.
 */
function StatusDotGlyph({
  shape,
  field,
  stroke,
}: {
  shape: AvatarStatusDotGlyphShape;
  field: number;
  stroke: number;
}) {
  const center = field / 2;
  return (
    <svg
      aria-hidden="true"
      viewBox={`0 0 ${field} ${field}`}
      width={field}
      height={field}
      fill="none"
      {...themeProps('avatar-status-dot-glyph', {shape})}>
      {shape === 'ring' ? (
        // Radius is to the stroke centreline, so the ring's outer edge lands
        // exactly on the inner field and never clips against the border.
        <circle
          cx={center}
          cy={center}
          r={(field - stroke) / 2}
          fill="none"
          stroke="currentColor"
          strokeWidth={stroke}
        />
      ) : (
        // Ends inset by half the stroke so the round caps land inside the
        // span rather than overhanging it.
        <line
          x1={(field * (1 - MINUS_BAR_SPAN)) / 2 + stroke / 2}
          y1={center}
          x2={(field * (1 + MINUS_BAR_SPAN)) / 2 - stroke / 2}
          y2={center}
          stroke="currentColor"
          strokeWidth={stroke}
          strokeLinecap="round"
        />
      )}
    </svg>
  );
}

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

  // Resolve label: explicit prop → default per variant → none.
  // A default label ensures screen readers always convey status meaning,
  // even when the consumer doesn't provide one (WCAG 2.1 SC 1.4.1).
  const resolvedLabel = label ?? defaultVariantLabels[variant];

  return (
    <div
      {...props}
      ref={ref}
      {...(resolvedLabel
        ? {role: 'img', 'aria-label': resolvedLabel}
        : undefined)}
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
        <StatusDotGlyph
          shape={glyphShape}
          field={dotSize - borderWidth * 2}
          stroke={GLYPH_STROKE_WIDTH[tier]}
        />
      )}
    </div>
  );
}

AvatarStatusDot.displayName = 'AvatarStatusDot';
