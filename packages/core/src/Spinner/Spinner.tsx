// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file Spinner.tsx
 * @input Uses React, StyleX, SVG rendering
 * @output Exports Spinner component, SpinnerProps, SpinnerSize, SpinnerShade types
 * @position Core implementation of spinner loading indicator
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/Spinner/Spinner.doc.mjs
 * - /packages/core/src/Spinner/Spinner.test.tsx
 * - /packages/core/src/Spinner/index.ts
 * - /apps/storybook/stories/Spinner.stories.tsx
 * - /packages/cli/assets/templates/blocks/components/Spinner/ (showcase blocks)
 */

import {useId, type ReactNode} from 'react';
import * as stylex from '@stylexjs/stylex';
import {colorVars, durationVars, spacingVars} from '../theme/tokens.stylex';
import type {BaseProps} from '../BaseProps';
import {Text} from '../Text/Text';
import {mergeProps} from '../utils';
import {themeProps} from '../utils/themeProps';

// =============================================================================
// Constants
// =============================================================================

/**
 * Fraction of the ring the moving arc covers. The canvas ring this replaces
 * swept 135deg, not the 270deg its constant's comment claimed.
 */
const ARC_FRACTION = 0.375;

const SIZES = {
  sm: {diameter: 10, border: 2},
  md: {diameter: 14, border: 3},
  lg: {diameter: 18, border: 3},
  xl: {diameter: 28, border: 4},
};

/**
 * Opacity the track is drawn at, per shade. `77 / 255` is the `4D` the onMedia
 * track used to append to the token's hex — the same composite, but applied as
 * `stroke-opacity` to a color off the cascade, so it no longer depends on the
 * token being hex notation and it applies to a themed color too.
 */
const TRACK_OPACITY: Record<SpinnerShade, number> = {
  default: 1,
  subtle: 1,
  onMedia: 77 / 255,
  inherit: 0.3,
};

/**
 * Where the resolved geometry lands: the public var if a theme set one, the
 * size's default otherwise. These are the names the box and the ring read —
 * never the public ones directly. See `sizeStyles` for why.
 */
const RESOLVED_DIAMETER = '--_spinner-ring-diameter';
const RESOLVED_RAIL = '--_spinner-ring-rail';
const RESOLVED_GEOMETRY_VARS = [RESOLVED_DIAMETER, RESOLVED_RAIL];

let didRegisterVars = false;

/**
 * Register the resolved geometry vars as `<length>`.
 *
 * Both are consumed inside `calc()` — the box adds two rails to a diameter,
 * the circle halves one. Unregistered, a custom property substitutes as text,
 * so whatever a theme wrote lands in the expression verbatim and a bare `0`
 * (a valid length on its own, a `<number>` inside `calc()`) poisons the sum:
 * `calc(28px + 0 * 2)` is invalid at computed-value time and the box loses its
 * size. Registered, the value is already an absolute length by the time the
 * `calc()` sees it, so `0` means `0px` and the documented "a rail of 0 draws
 * an arc with no track" holds.
 *
 * Only the resolved vars are registered, and the public ones deliberately are
 * not: a registered property with an `initialValue` is never
 * guaranteed-invalid, so `var(--spinner-diameter, <default>)` would stop
 * falling back the moment `--spinner-diameter` were registered — every
 * unthemed spinner would draw at the initial `0px`.
 */
function registerSpinnerVars(): void {
  if (didRegisterVars) {
    return;
  }
  didRegisterVars = true;
  if (
    typeof CSS === 'undefined' ||
    typeof CSS.registerProperty !== 'function'
  ) {
    return;
  }
  for (const name of RESOLVED_GEOMETRY_VARS) {
    try {
      CSS.registerProperty({
        name,
        syntax: '<length>',
        inherits: true,
        initialValue: '0px',
      });
    } catch {
      // Already registered — a second copy of the package on the page, or a
      // fast-refresh re-evaluation. registerProperty throws rather than
      // replacing, and the existing registration is this same one.
    }
  }
}

/**
 * Pin every ring's rotation to the document timeline's origin instead of its
 * own start time, so spinners mounted seconds apart turn in phase.
 *
 * Setting `startTime` is exact where arithmetic on a clock read is not: a
 * negative `animation-delay` computed at mount is only as good as the gap
 * between reading the clock and the frame the animation starts in, which at
 * 10x CPU throttling measured 116deg of drift.
 *
 * Rings are collected and pinned in one frame because `getAnimations()`
 * resolves style and `startTime` dirties it again, so pinning them one at a
 * time makes each mount re-force what the previous one invalidated — 53 style
 * recalcs for 38 spinners against 19 batched.
 */
const pendingRings = new Set<SVGSVGElement>();
let flushScheduled = false;

function pinRingsToTimelineOrigin(): void {
  flushScheduled = false;
  const animations: Animation[] = [];
  for (const svg of pendingRings) {
    animations.push(...svg.getAnimations());
  }
  pendingRings.clear();
  for (const animation of animations) {
    animation.startTime = 0;
  }
}

/**
 * Ref callback for the ring: the one place a mounted ring touches the DOM.
 *
 * The registration rides here rather than at module scope so it stays out of
 * the server render and out of a bundler's reach, and rather than in an effect
 * so it lands before the first paint. It reads nothing back — the geometry is
 * resolved by the cascade, not in JS.
 */
function syncRotationPhase(
  svg: SVGSVGElement | null,
): (() => void) | undefined {
  if (svg == null) {
    return undefined;
  }
  registerSpinnerVars();
  // jsdom implements no Web Animations, and this runs in every consumer's
  // component tests.
  if (typeof svg.getAnimations !== 'function') {
    return undefined;
  }
  pendingRings.add(svg);
  if (!flushScheduled) {
    flushScheduled = true;
    requestAnimationFrame(pinRingsToTimelineOrigin);
  }
  return () => {
    pendingRings.delete(svg);
  };
}

// =============================================================================
// Animation
// =============================================================================

const rotation = stylex.keyframes({
  '0%': {transform: 'rotate(0deg)'},
  '100%': {transform: 'rotate(360deg)'},
});

// =============================================================================
// Styles
// =============================================================================

const styles = stylex.create({
  wrapper: {
    display: 'inline-flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: spacingVars['--spacing-2'],
  },
  spinner: {
    display: 'inline-grid',
    placeItems: 'center',
    overflow: 'hidden',
    verticalAlign: 'middle',
    // The box and the drawn ring read the same resolved vars, so a themed
    // size moves both together.
    width: `calc(var(${RESOLVED_DIAMETER}) + var(${RESOLVED_RAIL}) * 2)`,
    height: `calc(var(${RESOLVED_DIAMETER}) + var(${RESOLVED_RAIL}) * 2)`,
    // Hosts that paint a spinner inside a fixed-size control are flex
    // containers (a Switch thumb is 14px at the smallest size), and a flex
    // item's default `flex-shrink: 1` lets the parent compress this box while
    // the ring keeps drawing at the size the vars asked for — the ring then
    // paints outside its own clipped box. Refusing to shrink keeps the two
    // measurements the same thing, so a size that does not fit is visibly
    // wrong at the host rather than silently mismatched.
    flexShrink: 0,
  },
  ring: {
    backfaceVisibility: 'hidden',
    display: 'block',
    willChange: 'transform',
    // The svg keeps the size its `viewBox` describes, so one user unit is one
    // CSS pixel and the lengths below mean what they say. A themed diameter
    // therefore draws a ring wider than the svg's own box — which is fine, and
    // stays centered, because the box it is centered in is the span, sized
    // from the same two vars. Clipping it to the default frame is the one
    // thing that would break that, hence `visible`.
    overflow: 'visible',
    // Slow the rotation dramatically under reduced-motion rather than freezing
    // it (a frozen spinner reads as broken), matching ProgressBar's approach.
    // The role="status" + "Loading" label still convey busy state (obs-6).
    animationDuration: {
      default: durationVars['--duration-slow-min'],
      '@media (prefers-reduced-motion: reduce)': '3s',
    },
    animationIterationCount: 'infinite',
    animationName: rotation,
    animationTimingFunction: 'linear',
  },
  circle: {
    fill: 'none',
    strokeLinecap: 'round',
    // The geometry the ring is actually drawn at. `r` and `stroke-width` are
    // CSS properties on an SVG shape, and a CSS declaration outranks the
    // presentation attribute of the same name — so the attributes below stay
    // as the size's default (and as what a server render and a no-CSS render
    // draw), and these take over the moment the cascade has a themed value.
    // The arc's dash pattern needs no rule of its own: `pathLength` normalizes
    // it to the default circumference, so it scales with whatever `r` becomes.
    r: `calc(var(${RESOLVED_DIAMETER}) / 2)`,
    strokeWidth: `var(${RESOLVED_RAIL})`,
  },
});

// What each named `size` resolves to. A theme redefines a size by setting the
// public vars on the size-variant target, e.g.
// spinner: { 'size:xl': { '--spinner-diameter': '40px' } }.
//
// The size's default is written as a `var()` FALLBACK rather than as a
// declaration of the public var, and that is load-bearing rather than
// stylistic. StyleX emits custom-property declarations OUTSIDE its cascade
// layers, while a theme's component overrides are injected into
// `@layer astryx-theme`; unlayered declarations beat every layer, so a
// StyleX-declared `--spinner-diameter: 10px` would win over the theme's rule
// no matter how specific the theme got. Reading the public var with the
// default as its fallback inverts that: the theme's declaration is the only
// one of the two, and the default applies exactly when it is absent. It is the
// same shape the shade colors already use.
const sizeStyles = stylex.create({
  sm: {
    [RESOLVED_DIAMETER]: `var(--spinner-diameter, ${SIZES.sm.diameter}px)`,
    [RESOLVED_RAIL]: `var(--spinner-rail-width, ${SIZES.sm.border}px)`,
  },
  md: {
    [RESOLVED_DIAMETER]: `var(--spinner-diameter, ${SIZES.md.diameter}px)`,
    [RESOLVED_RAIL]: `var(--spinner-rail-width, ${SIZES.md.border}px)`,
  },
  lg: {
    [RESOLVED_DIAMETER]: `var(--spinner-diameter, ${SIZES.lg.diameter}px)`,
    [RESOLVED_RAIL]: `var(--spinner-rail-width, ${SIZES.lg.border}px)`,
  },
  xl: {
    [RESOLVED_DIAMETER]: `var(--spinner-diameter, ${SIZES.xl.diameter}px)`,
    [RESOLVED_RAIL]: `var(--spinner-rail-width, ${SIZES.xl.border}px)`,
  },
});

// The two ring colors. Each shade's token is the fallback of the public var
// rather than a declaration of it, for exactly the reason `sizeStyles`
// explains. They ride `stroke` directly: the paint comes off the cascade, so
// every notation a theme can write — `var()`, `color-mix()`, and the
// `currentColor` the inherit shade is built on — resolves where it is used and
// a color changed after mount repaints instead of going stale.
const arcStyles = stylex.create({
  default: {stroke: `var(--spinner-color, ${colorVars['--color-accent']})`},
  subtle: {
    stroke: `var(--spinner-color, ${colorVars['--color-text-secondary']})`,
  },
  onMedia: {stroke: `var(--spinner-color, ${colorVars['--color-on-dark']})`},
  inherit: {stroke: 'var(--spinner-color, currentColor)'},
});

const trackStyles = stylex.create({
  default: {
    stroke: `var(--spinner-track-color, ${colorVars['--color-track']})`,
    strokeOpacity: TRACK_OPACITY.default,
  },
  subtle: {
    stroke: `var(--spinner-track-color, ${colorVars['--color-track']})`,
    strokeOpacity: TRACK_OPACITY.subtle,
  },
  onMedia: {
    stroke: `var(--spinner-track-color, ${colorVars['--color-on-dark']})`,
    strokeOpacity: TRACK_OPACITY.onMedia,
  },
  inherit: {
    stroke: 'var(--spinner-track-color, currentColor)',
    strokeOpacity: TRACK_OPACITY.inherit,
  },
});

// =============================================================================
// Types
// =============================================================================

export type SpinnerSize = keyof typeof SIZES;

export type SpinnerShade = 'default' | 'onMedia' | 'subtle' | 'inherit';

export interface SpinnerProps extends BaseProps<HTMLSpanElement> {
  /** Ref forwarded to the root element */
  ref?: React.Ref<HTMLSpanElement>;
  /**
   * Spinner size. The diameter is the ring itself; the rendered box adds the
   * rail width on each side (xl draws a 28px ring in a 36px box). A theme can
   * redefine what each named size resolves to — see `--spinner-diameter`.
   * - 'sm': 10px diameter
   * - 'md': 14px diameter
   * - 'lg': 18px diameter
   * - 'xl': 28px diameter
   * @default 'md'
   */
  size?: SpinnerSize;
  /**
   * Color shade.
   * - 'default': accent color on light backgrounds
   * - 'onMedia': white on dark/accent backgrounds
   * - 'subtle': secondary text color, less prominent — for inline use in lists
   * - 'inherit': inherits the parent's `currentColor` (with a translucent
   *   track) — use inside colored elements like buttons so the ring matches
   *   the resolved foreground regardless of theme/variant
   * @default 'default'
   */
  shade?: SpinnerShade;
  /**
   * Visible content displayed below the spinner.
   * Accepts a string or ReactNode for rich content.
   *
   * When `label` is a string, the visible text also provides the accessible
   * name of the status element (via aria-labelledby, avoiding a duplicate
   * announcement) unless `aria-label` is explicitly set.
   *
   * @example
   * ```
   * <Spinner label="Loading..." />
   * <Spinner label={<><strong>Fetching data</strong><br/>This may take a moment</>} aria-label="Fetching data" />
   * ```
   */
  label?: ReactNode;
  /**
   * Test ID for the root element.
   */
  'data-testid'?: string;
}

// =============================================================================
// Component
// =============================================================================

/**
 * An animated loading indicator. Available in four sizes and four color shades.
 *
 * @example
 * ```
 * <Spinner />
 * <Spinner size="sm" />
 * <Spinner size="lg" shade="onMedia" />
 * <Spinner label="Loading..." />
 * <Spinner aria-label="Loading data" />
 * ```
 */
export function Spinner({
  size = 'md',
  shade = 'default',
  label,
  xstyle,
  className,
  style,
  'aria-label': ariaLabel,
  'data-testid': testId,
  ref,
  ...restProps
}: SpinnerProps) {
  const {border, diameter} = SIZES[size];
  const frameSize = diameter + border * 2;
  const center = frameSize / 2;
  const circumference = Math.PI * diameter;
  const arcLength = circumference * ARC_FRACTION;
  const hasLabel = label != null;
  const labelId = useId();

  // When a visible string label renders (and no explicit aria-label is set),
  // name the status element from the visible Text via aria-labelledby instead
  // of duplicating the same string as aria-label — the duplicate would be
  // announced twice by screen readers (WCAG 4.1.2).
  const namedByVisibleLabel =
    hasLabel && typeof label === 'string' && ariaLabel == null;

  // Resolve accessible name: explicit aria-label > string label > "Loading"
  const resolvedAriaLabel =
    ariaLabel ?? (typeof label === 'string' ? label : undefined) ?? 'Loading';

  const spinner = (
    <span
      ref={hasLabel ? undefined : ref}
      role="status"
      aria-label={namedByVisibleLabel ? undefined : resolvedAriaLabel}
      aria-labelledby={namedByVisibleLabel ? labelId : undefined}
      data-testid={hasLabel ? undefined : testId}
      {...(hasLabel ? {} : restProps)}
      {...mergeProps(
        hasLabel ? '' : themeProps('spinner', {size, shade}),
        stylex.props(
          styles.spinner,
          // The size's geometry always rides the span that draws the ring. It
          // reads the public vars rather than declaring them, so it does not
          // matter whether the theme target is this element or the wrapper —
          // either way the value is inherited by the time it is read.
          sizeStyles[size],
          !hasLabel && xstyle,
        ),
        hasLabel ? undefined : className,
        hasLabel ? {} : style,
      )}>
      <svg
        ref={syncRotationPhase}
        width={frameSize}
        height={frameSize}
        viewBox={`0 0 ${frameSize} ${frameSize}`}
        aria-hidden="true"
        {...stylex.props(styles.ring)}>
        <circle
          cx={center}
          cy={center}
          r={diameter / 2}
          strokeWidth={border}
          {...stylex.props(styles.circle, trackStyles[shade])}
        />
        <circle
          cx={center}
          cy={center}
          r={diameter / 2}
          strokeWidth={border}
          // Normalized to the default circumference, so the dash pattern below
          // stays 135deg of arc whatever `r` the cascade ends up drawing.
          pathLength={circumference}
          strokeDasharray={`${arcLength} ${circumference - arcLength}`}
          transform={`rotate(-90 ${center} ${center})`}
          {...stylex.props(styles.circle, arcStyles[shade])}
        />
      </svg>
    </span>
  );

  if (!hasLabel) {
    return spinner;
  }

  return (
    <div
      ref={ref as React.Ref<HTMLDivElement>}
      data-testid={testId}
      {...restProps}
      {...mergeProps(
        themeProps('spinner', {size, shade}),
        stylex.props(styles.wrapper, xstyle),
        className,
        style,
      )}>
      {spinner}
      {typeof label === 'string' ? (
        <Text id={labelId} type="body" weight="bold">
          {label}
        </Text>
      ) : (
        label
      )}
    </div>
  );
}

Spinner.displayName = 'Spinner';
