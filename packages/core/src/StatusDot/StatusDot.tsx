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

import * as stylex from '@stylexjs/stylex';
import {colorVars} from '../theme/tokens.stylex';
import type {BaseProps} from '../BaseProps';
import {Tooltip} from '../Tooltip/Tooltip';
import {mergeProps} from '../utils';
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

/**
 * Glyph stroke weight in px. Follows AvatarStatusDot's ladder — roughly
 * `field / 12`, floored at 1px — which for the fixed 8px dot is the floor.
 */
const GLYPH_STROKE = 1;

/** Fraction of the field a bar glyph spans, cap to cap. */
const BAR_SPAN = 0.75;

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
});

/**
 * Variant styles mapping to theme color tokens.
 *
 * Each variant sets both the plate colour and the ink colour: the shape
 * glyph paints from `currentColor`, so the two can never drift out of
 * contrast (same contract as AvatarStatusDot).
 */
const variants = stylex.create({
  success: {
    backgroundColor: colorVars['--color-success'],
    color: colorVars['--color-background-surface'],
  },
  warning: {
    backgroundColor: colorVars['--color-warning'],
    color: colorVars['--color-background-surface'],
  },
  error: {
    backgroundColor: colorVars['--color-error'],
    color: colorVars['--color-background-surface'],
  },
  accent: {
    backgroundColor: colorVars['--color-accent'],
    color: colorVars['--color-background-surface'],
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
 * painted in `currentColor` — the same approach and, for the statuses the
 * two components share, the same shape language as AvatarStatusDot:
 * - `ring` — a stroked circle on a surface plate; the dot reads as hollow.
 * - `minus` — a round-capped horizontal bar across the filled dot.
 * - `bang` — a round-capped vertical bar (an exclamation stem; the point
 *   would not resolve at 8px).
 * - `plus` — two crossed round-capped bars.
 *
 * `success` stays the plain filled dot — the reference shape. Custom
 * augmented variants have no entry and render no glyph; see the
 * `StatusDotVariantMap` docs.
 */
type StatusDotGlyphShape = 'ring' | 'minus' | 'bang' | 'plus';

const glyphShapeMap: Partial<Record<StatusDotVariant, StatusDotGlyphShape>> = {
  neutral: 'ring',
  error: 'minus',
  warning: 'bang',
  accent: 'plus',
};

/**
 * A round-capped bar spanning `BAR_SPAN` of the field, horizontal or
 * vertical. Ends are inset by half the stroke so the caps land inside the
 * span rather than overhanging it.
 */
function GlyphBar({vertical}: {vertical?: boolean}) {
  const near = (DOT_SIZE * (1 - BAR_SPAN)) / 2 + GLYPH_STROKE / 2;
  const far = (DOT_SIZE * (1 + BAR_SPAN)) / 2 - GLYPH_STROKE / 2;
  const center = DOT_SIZE / 2;
  return (
    <line
      x1={vertical ? center : near}
      y1={vertical ? near : center}
      x2={vertical ? center : far}
      y2={vertical ? far : center}
      stroke="currentColor"
      strokeWidth={GLYPH_STROKE}
      strokeLinecap="round"
    />
  );
}

/**
 * The built-in shape glyph, drawn as a stroked inline SVG in `currentColor`
 * (see AvatarStatusDot's StatusDotGlyph for the rationale: stroking buys
 * sub-pixel control and round caps a CSS box cutout cannot give at 8px).
 *
 * `viewBox` is one user unit per px of the dot, so every value is literal
 * px. Themes can target the stable `astryx-statusdot-glyph` class and its
 * `data-shape` attribute.
 */
function StatusDotGlyph({shape}: {shape: StatusDotGlyphShape}) {
  const center = DOT_SIZE / 2;
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
          r={(DOT_SIZE - GLYPH_STROKE) / 2}
          fill="none"
          stroke="currentColor"
          strokeWidth={GLYPH_STROKE}
        />
      )}
      {(shape === 'minus' || shape === 'plus') && <GlyphBar />}
      {(shape === 'bang' || shape === 'plus') && <GlyphBar vertical />}
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
}

/**
 * A small colored dot indicator for status display (online/offline, severity, etc).
 *
 * Fixed 8px size. Each variant pairs a colour with a distinct built-in
 * shape — success filled, neutral ring, error minus, warning bang, accent
 * plus — so status stays distinguishable without colour perception
 * (WCAG 2.1 SC 1.4.1), using the same shape language as AvatarStatusDot.
 * Themes can target the glyph via the `astryx-statusdot-glyph` class and
 * its `data-shape` attribute.
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
 * ```
 */
export function StatusDot({
  variant,
  label,
  isPulsing = false,
  tooltip,
  xstyle,
  className,
  style,
  ref,
  ...props
}: StatusDotProps) {
  const glyphShape = glyphShapeMap[variant];
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
      {glyphShape && <StatusDotGlyph shape={glyphShape} />}
    </span>
  );

  if (tooltip) {
    return <Tooltip content={tooltip}>{dot}</Tooltip>;
  }

  return dot;
}

StatusDot.displayName = 'StatusDot';
