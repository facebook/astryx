// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file StatusDot.tsx
 * @input Uses React
 * @output Exports StatusDot component, StatusDotProps, StatusDotVariant types
 * @position Core implementation; consumed by index.ts
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/StatusDot/StatusDot.doc.mjs (props table, features, implementation notes)
 * - /packages/core/src/StatusDot/StatusDot.test.tsx (tests for new/changed behavior)
 * - /packages/core/src/StatusDot/index.ts (exports if types change)
 * - /apps/storybook/stories/StatusDot.stories.tsx (storybook stories)
 * - /packages/cli/assets/templates/blocks/components/StatusDot/ (showcase blocks)
 */

import type {ReactNode} from 'react';

import * as stylex from '@stylexjs/stylex';
import {colorVars} from '../theme/tokens.stylex';
import type {BaseProps} from '../BaseProps';
import {Tooltip} from '../Tooltip/Tooltip';
import {isRenderable, mergeProps} from '../utils';
import {themeProps} from '../utils/themeProps';
import type {StatusDotVariantMap} from './index';

/**
 * Pulse animation keyframes
 */
const pulseKeyframes = stylex.keyframes({
  '0%': {opacity: 1},
  '50%': {opacity: 0.5},
  '100%': {opacity: 1},
});

/** Fixed dot size in px. The shape glyph is drawn into this same field. */
const DOT_SIZE = 8;

/** Baseline glyph stroke weight in px, used by the ring and the exclamation. */
const GLYPH_STROKE = 1;

/**
 * Heavier stroke, in px, for the diagonal `check` and `cross` glyphs.
 *
 * At the fixed 8px dot a 1px diagonal blurs, and check vs cross grow hard to
 * tell apart — the axis a colour-blind user leans on once colour is gone. A
 * measured bump to 1.25px lands both crisply without turning the small field
 * into a blob. The ring and the exclamation stem read fine at the 1px
 * baseline, so only the diagonals are thickened.
 */
const GLYPH_STROKE_DIAGONAL = 1.25;

/**
 * Base styles
 */
const styles = stylex.create({
  base: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '50%',
    flexShrink: 0,
    width: `${DOT_SIZE}px`,
    height: `${DOT_SIZE}px`,
  },
  pulsing: {
    animationName: pulseKeyframes,
    animationDuration: '2s',
    animationTimingFunction: 'ease-in-out',
    animationIterationCount: 'infinite',
  },
  reducedMotion: {
    '@media (prefers-reduced-motion: reduce)': {
      animationName: 'none',
    },
  },
  // A user-supplied icon fills the whole 8px field and paints from
  // `currentColor` (the variant's ink), same as the built-in glyph.
  icon: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    lineHeight: 0,
    width: `${DOT_SIZE}px`,
    height: `${DOT_SIZE}px`,
  },
});

/**
 * Variant styles mapping to theme color tokens.
 *
 * Each variant sets both the plate colour and the ink colour: the shape
 * glyph paints from `currentColor`, so the two can never drift out of
 * contrast (same contract as AvatarStatusDot). The ink is each plate's
 * dedicated `--color-on-*` pairing (the Badge precedent), not the surface
 * colour: on-warning is a fixed dark ink, which keeps the glyph legible on
 * the yellow plate (~9.6:1) where a light surface ink lands near 2:1.
 */
const variants = stylex.create({
  success: {
    backgroundColor: colorVars['--color-success'],
    color: colorVars['--color-on-success'],
  },
  warning: {
    backgroundColor: colorVars['--color-warning'],
    color: colorVars['--color-on-warning'],
  },
  error: {
    backgroundColor: colorVars['--color-error'],
    color: colorVars['--color-on-error'],
  },
  accent: {
    backgroundColor: colorVars['--color-accent'],
    color: colorVars['--color-on-accent'],
  },
  // The ring variant inverts: a hollow shape only reads as hollow if its
  // interior is not the variant colour, so the plate is surface and the
  // colour moves to the stroke — same inversion as AvatarStatusDot.
  neutral: {
    backgroundColor: colorVars['--color-background-surface'],
    color: colorVars['--color-icon-secondary'],
  },
});

/**
 * Status dot variant type derived from StatusDotVariantMap.
 * Extensible via module augmentation of StatusDotVariantMap.
 */
export type StatusDotVariant = keyof StatusDotVariantMap;

/**
 * Built-in shape glyph per variant, so each status differs by shape and not
 * only by colour (WCAG 2.1 SC 1.4.1). The glyph is a stroked inline SVG
 * painted in `currentColor`.
 *
 * The shapes are the system's SEMANTIC icon vocabulary — the same marks
 * `Banner` and `FieldStatus` render through `Icon`'s `defaultIcons` — so a
 * status reads the same whether it is a full icon or shrunk to an 8px dot:
 * - `check` — success (mirrors `defaultIcons.check` / `.success`).
 * - `exclamation` — warning: a stem over a dot, the mark inside the canonical
 *   warning triangle (`defaultIcons.warning`).
 * - `cross` — error: a two-line X (mirrors `defaultIcons.error` / `.close`).
 * - `ring` — neutral: a stroked circle on a surface plate; the dot reads as
 *   hollow.
 *
 * This is a different axis of consistency from AvatarStatusDot, which speaks
 * Avatar's presence-shape language (online/away/busy). The two intentionally
 * share only `neutral` (the ring) — a status severity and a presence state
 * are different meanings, so they get different shapes.
 *
 * `accent` stays the plain filled dot — the reference shape. Custom augmented
 * variants have no entry and render no glyph; see the `StatusDotVariantMap`
 * docs.
 */
type StatusDotGlyphShape = 'ring' | 'check' | 'exclamation' | 'cross';

const glyphShapeMap: Partial<Record<StatusDotVariant, StatusDotGlyphShape>> = {
  success: 'check',
  warning: 'exclamation',
  error: 'cross',
  neutral: 'ring',
};

/**
 * The built-in shape glyph, drawn as a stroked inline SVG in `currentColor`.
 * Stroking (rather than a CSS box cutout) buys the sub-pixel control and
 * round caps the small marks need to stay intentional at 8px.
 *
 * `viewBox` is one user unit per px of the dot, so every coordinate is
 * literal px. Geometry mirrors the `defaultIcons` marks scaled into the 8px
 * field. The diagonal `check` and `cross` take the heavier stroke; see
 * `GLYPH_STROKE_DIAGONAL`. Themes can target the stable
 * `astryx-statusdot-glyph` class and its `data-shape` attribute.
 */
function StatusDotGlyph({shape}: {shape: StatusDotGlyphShape}) {
  const center = DOT_SIZE / 2;
  const stroke =
    shape === 'check' || shape === 'cross'
      ? GLYPH_STROKE_DIAGONAL
      : GLYPH_STROKE;
  return (
    <svg
      aria-hidden="true"
      viewBox={`0 0 ${DOT_SIZE} ${DOT_SIZE}`}
      width={DOT_SIZE}
      height={DOT_SIZE}
      fill="none"
      {...themeProps('statusdot-glyph', {shape})}>
      {shape === 'ring' && (
        // Radius is to the stroke centreline, so the ring's outer edge lands
        // exactly on the dot's field.
        <circle
          cx={center}
          cy={center}
          r={(DOT_SIZE - stroke) / 2}
          fill="none"
          stroke="currentColor"
          strokeWidth={stroke}
        />
      )}
      {shape === 'check' && (
        // defaultIcons.check (M5 13l4 4L19 7) scaled from its 24 viewBox into
        // the 8px field; round join at the valley keeps the corner clean.
        <path
          d="M1.7 4.3L3 5.7L6.3 2.3"
          fill="none"
          stroke="currentColor"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}
      {shape === 'cross' && (
        // defaultIcons.close (the X) scaled into the 8px field: two round-
        // capped diagonals crossing at the centre.
        <>
          <line
            x1={2}
            y1={2}
            x2={6}
            y2={6}
            stroke="currentColor"
            strokeWidth={stroke}
            strokeLinecap="round"
          />
          <line
            x1={6}
            y1={2}
            x2={2}
            y2={6}
            stroke="currentColor"
            strokeWidth={stroke}
            strokeLinecap="round"
          />
        </>
      )}
      {shape === 'exclamation' && (
        // The mark inside defaultIcons.warning: a round-capped stem over a
        // filled dot, both centred on the field.
        <>
          <line
            x1={center}
            y1={1.9}
            x2={center}
            y2={4.7}
            stroke="currentColor"
            strokeWidth={stroke}
            strokeLinecap="round"
          />
          <circle cx={center} cy={6.3} r={0.7} fill="currentColor" />
        </>
      )}
    </svg>
  );
}

export interface StatusDotProps extends BaseProps<HTMLSpanElement> {
  /** Ref forwarded to the root element */
  ref?: React.Ref<HTMLSpanElement>;
  /**
   * The semantic color variant.
   */
  variant: StatusDotVariant;
  /**
   * Accessible label describing the status. Required for a11y — it is the
   * dot's `aria-label`, so the status reaches screen readers without hover.
   */
  label: string;
  /**
   * Whether the dot should pulse to indicate activity.
   * Respects `prefers-reduced-motion`.
   * @default false
   */
  isPulsing?: boolean;
  /**
   * Tooltip text shown on hover to explain the status meaning.
   * When omitted, no tooltip is rendered.
   */
  tooltip?: string;
  /**
   * Optional icon to render centered inside the dot. Accepts any ReactNode
   * (typically an SVG icon), painted in the dot's `currentColor`. Same
   * contract as `AvatarStatusDot`'s `icon`.
   *
   * A rendered icon replaces the variant's built-in shape glyph, so use a
   * different icon per status — the same icon on every variant leaves the
   * statuses distinguishable by colour alone (WCAG 1.4.1). Booleans and empty
   * strings are ignored (safe for `cond && <Icon />`), but a component that
   * renders nothing still counts as an icon and suppresses the glyph.
   *
   * @example
   * ```
   * <StatusDot variant="success" label="Verified" icon={<CheckIcon />} />
   * ```
   */
  icon?: ReactNode;
}

/**
 * A small colored dot indicator for status display (online/offline, severity, etc).
 *
 * Fixed 8px size. Each variant pairs a colour with a distinct built-in shape
 * — success check, warning exclamation, error cross, neutral ring, accent
 * filled — so status stays distinguishable without colour perception
 * (WCAG 2.1 SC 1.4.1). The shapes are the system's semantic icon vocabulary
 * (the marks `Banner`/`FieldStatus` render via `defaultIcons`), so a status
 * reads the same whether shown as a full icon or an 8px dot. Pass `icon` to
 * override the built-in glyph. Themes can target the glyph via the
 * `astryx-statusdot-glyph` class and its `data-shape` attribute.
 *
 * Renders as a non-focusable `<span>` with `role="img"` and
 * `aria-label` for accessibility. Styles use Astryx theme tokens via StyleX.
 * Wrap your app in `<Theme>` to apply a theme.
 *
 * @example
 * ```
 * <StatusDot variant="success" label="Online" />
 * <StatusDot variant="error" label="Offline" />
 * <StatusDot variant="success" label="Live" isPulsing />
 * <StatusDot variant="success" label="Online" tooltip="Online" />
 * <StatusDot variant="success" label="Verified" icon={<CheckIcon />} />
 * ```
 */
export function StatusDot({
  variant,
  label,
  isPulsing = false,
  tooltip,
  icon,
  xstyle,
  className,
  style,
  ref,
  ...props
}: StatusDotProps) {
  // A user-supplied icon is itself a non-colour mark, so it replaces the
  // built-in glyph. Booleans and empty renders don't count (safe for
  // `cond && <Icon />`) — same contract as AvatarStatusDot.
  const showsIcon = isRenderable(icon);
  const glyphShape = showsIcon ? undefined : glyphShapeMap[variant];
  const dot = (
    <span
      ref={ref}
      role="img"
      aria-label={label}
      {...mergeProps(
        themeProps('statusdot', {variant}),
        stylex.props(
          styles.base,
          variants[variant],
          isPulsing && styles.pulsing,
          isPulsing && styles.reducedMotion,
          xstyle,
        ),
        className,
        style,
      )}
      {...props}>
      {showsIcon && (
        <span aria-hidden="true" {...stylex.props(styles.icon)}>
          {icon}
        </span>
      )}
      {glyphShape && <StatusDotGlyph shape={glyphShape} />}
    </span>
  );

  if (tooltip) {
    return <Tooltip content={tooltip}>{dot}</Tooltip>;
  }

  return dot;
}

StatusDot.displayName = 'StatusDot';
