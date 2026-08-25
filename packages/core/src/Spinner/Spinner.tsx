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
 * Where the resolved geometry lands: the public var, resolved into a registered
 * `<length>` the `calc()`s below can do arithmetic on. The box and the ring
 * read these; the public vars are declared once, on the element carrying the
 * theme target, by `sizeStyles`.
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
 * `calc()` sees it, so `0` means `0px` — a zero-width stroke that paints
 * nothing — rather than a bare `0` that invalidates the sum and leaves the box
 * with no size at all. One `stroke-width` drives both circles, so a themed
 * rail of `0` hides the arc along with the track; an arc with no track behind
 * it is `--spinner-track-color: transparent`.
 *
 * Only these private vars are registered. The four public ones deliberately
 * are not: a registered property has an `initial-value`, so every element in
 * the document would report a value for it — and
 * `.github/scripts/theme-var-reachability.js` finds a var's declaring element
 * by exactly that test, so registering them would point the guard at `<html>`
 * and report a var no theme can select.
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
    // The public geometry vars, resolved into the registered `<length>` pair
    // the arithmetic below needs. Reading them here rather than in each
    // `calc()` keeps one place where a themed value enters the component, and
    // it is the span that reads them whether the theme target is the span or
    // the wrapper — a custom property inherits either way.
    [RESOLVED_DIAMETER]: 'var(--spinner-diameter)',
    [RESOLVED_RAIL]: 'var(--spinner-rail-width)',
    // The box and the drawn ring read the same resolved vars, so a themed
    // size moves both together.
    width: `calc(var(${RESOLVED_DIAMETER}) + var(${RESOLVED_RAIL}) * 2)`,
    height: `calc(var(${RESOLVED_DIAMETER}) + var(${RESOLVED_RAIL}) * 2)`,
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
  // The two ring colors ride `stroke` directly, read off the public vars the
  // shade declares. The paint comes from the cascade, so every notation a
  // theme can write — `var()`, `color-mix()`, and the `currentColor` the
  // inherit shade is built on — resolves where it is used, and a color changed
  // after mount repaints instead of going stale.
  arc: {stroke: 'var(--spinner-color)'},
  track: {stroke: 'var(--spinner-track-color)'},
});

// What each named `size` and `shade` resolve to. Both groups DECLARE the four
// public vars, on the element that carries the `spinner` theme target, and
// everything downstream reads them — so a theme's `@layer astryx-theme` rule
// against `.astryx-spinner.xl` overrides the default the same way it does for
// `--tree-list-indent` or `--button-focus-offset`, e.g.
// spinner: { 'size:xl': { '--spinner-diameter': '40px' } }.
//
// Declaring is only safe because #5410 moved the compiled StyleX CSS inside
// `@layer astryx-base`. Before it, StyleX emitted custom-property
// declarations at priority 0 and therefore OUTSIDE its layers, and an
// unlayered declaration beats every layer — so a StyleX-declared
// `--spinner-diameter: 10px` shadowed the theme's own rule no matter how
// specific the theme got. An earlier revision of this component worked around
// that by never declaring the public var and reading it with the default as a
// `var()` fallback; that is no longer necessary, and the fallback shape has a
// cost of its own — with nothing declaring the var,
// `theme-var-reachability.js` cannot find an element to check, so a documented
// var reads as unreachable.
const sizeStyles = stylex.create({
  sm: {
    '--spinner-diameter': `${SIZES.sm.diameter}px`,
    '--spinner-rail-width': `${SIZES.sm.border}px`,
  },
  md: {
    '--spinner-diameter': `${SIZES.md.diameter}px`,
    '--spinner-rail-width': `${SIZES.md.border}px`,
  },
  lg: {
    '--spinner-diameter': `${SIZES.lg.diameter}px`,
    '--spinner-rail-width': `${SIZES.lg.border}px`,
  },
  xl: {
    '--spinner-diameter': `${SIZES.xl.diameter}px`,
    '--spinner-rail-width': `${SIZES.xl.border}px`,
  },
});

const shadeStyles = stylex.create({
  default: {
    '--spinner-color': colorVars['--color-accent'],
    '--spinner-track-color': colorVars['--color-track'],
  },
  subtle: {
    '--spinner-color': colorVars['--color-text-secondary'],
    '--spinner-track-color': colorVars['--color-track'],
  },
  onMedia: {
    '--spinner-color': colorVars['--color-on-dark'],
    '--spinner-track-color': colorVars['--color-on-dark'],
  },
  inherit: {
    '--spinner-color': 'currentColor',
    '--spinner-track-color': 'currentColor',
  },
});

// The track's alpha is a property, not a color: it composites over whatever
// color the shade or the theme supplies. `77 / 255` is the `4D` the onMedia
// token's hex used to carry.
const trackOpacityStyles = stylex.create({
  default: {strokeOpacity: TRACK_OPACITY.default},
  subtle: {strokeOpacity: TRACK_OPACITY.subtle},
  onMedia: {strokeOpacity: TRACK_OPACITY.onMedia},
  inherit: {strokeOpacity: TRACK_OPACITY.inherit},
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
          // The defaults are declared on whichever element carries the theme
          // target, and only there: when a label moves the target to the
          // wrapper, this span must inherit the wrapper's value rather than
          // declare its own, which would shadow a theme's override with the
          // default it is trying to replace.
          !hasLabel && sizeStyles[size],
          !hasLabel && shadeStyles[shade],
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
          {...stylex.props(
            styles.circle,
            styles.track,
            trackOpacityStyles[shade],
          )}
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
          {...stylex.props(styles.circle, styles.arc)}
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
        stylex.props(
          styles.wrapper,
          sizeStyles[size],
          shadeStyles[shade],
          xstyle,
        ),
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
