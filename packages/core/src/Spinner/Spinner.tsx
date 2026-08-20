// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file Spinner.tsx
 * @input Uses React, StyleX, canvas rendering
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

import {useEffect, useId, useRef, type ReactNode} from 'react';
import * as stylex from '@stylexjs/stylex';
import {colorVars, durationVars, spacingVars} from '../theme/tokens.stylex';
import {useTheme} from '../theme/useTheme';
import type {BaseProps} from '../BaseProps';
import {Text} from '../Text/Text';
import {mergeProps} from '../utils';
import {themeProps} from '../utils/themeProps';

// =============================================================================
// Constants
// =============================================================================

/** How much of the circle the active arc covers (as a fraction of 2π) */
const SPREAD = 0.75;
/** Where the active arc starts (as a fraction of 2π) */
const START_POINT = 1.5;

const SIZES = {
  sm: {diameter: 10, border: 2},
  md: {diameter: 14, border: 3},
  lg: {diameter: 18, border: 3},
  xl: {diameter: 28, border: 4},
};

/**
 * Alpha the track is drawn at, per shade. `77 / 255` is the `4D` the onMedia
 * track used to append to the token's hex — the same composite, but applied to
 * a resolved color so it no longer depends on the token being hex notation.
 */
const TRACK_ALPHA: Record<SpinnerShade, number> = {
  default: 1,
  subtle: 1,
  onMedia: 77 / 255,
  inherit: 0.3,
};

/** Public geometry vars, registered so a themed value reaches the canvas. */
const GEOMETRY_VARS = ['--spinner-diameter', '--spinner-rail-width'];

let didRegisterVars = false;

/**
 * Register the geometry vars as `<length>`.
 *
 * Without this their computed value is the *specified* string, so a theme
 * writing `2.5rem` or `calc(2rem + 8px)` reaches the canvas as that text and
 * `parseFloat` silently truncates it to `2.5` / `NaN`. Registered, the
 * computed value is an absolute px length the canvas can use directly.
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
  for (const name of GEOMETRY_VARS) {
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
    // The box and the drawn ring read the same vars, so a themed size moves
    // both together.
    width: 'calc(var(--spinner-diameter) + var(--spinner-rail-width) * 2)',
    height: 'calc(var(--spinner-diameter) + var(--spinner-rail-width) * 2)',
  },
  canvas: {
    backfaceVisibility: 'hidden',
    display: 'block',
    willChange: 'transform',
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
});

// What each named `size` resolves to. A theme redefines a size by setting the
// public vars on the size-variant target, e.g.
// spinner: { 'size:xl': { '--spinner-diameter': '40px' } }.
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

// The two ring colors, each carried on a real `color` property rather than
// read from the custom property directly. That indirection is what resolves
// every notation a theme can write — `var()`, `color-mix()`, and the
// `currentColor` the inherit shade is built on — into a value the canvas can
// stroke with; a custom property read back raw would hand `canvas` the
// unresolved text. It is the same read-back the inherit shade already used,
// generalized to all four shades.
//
// The track rides the spinner box and the arc rides the canvas inside it, so
// the two travel on separate elements and neither needs a second channel. For
// the inherit shade both fall back to `currentColor`, which is the box's
// inherited color in either case — the arc's `currentColor` resolves against
// the box, whose own color is that same inherited value.
const trackShadeStyles = stylex.create({
  default: {color: `var(--spinner-track-color, ${colorVars['--color-track']})`},
  subtle: {color: `var(--spinner-track-color, ${colorVars['--color-track']})`},
  onMedia: {
    color: `var(--spinner-track-color, ${colorVars['--color-on-dark']})`,
  },
  inherit: {color: 'var(--spinner-track-color, currentColor)'},
});

const arcShadeStyles = stylex.create({
  default: {color: `var(--spinner-color, ${colorVars['--color-accent']})`},
  subtle: {
    color: `var(--spinner-color, ${colorVars['--color-text-secondary']})`,
  },
  onMedia: {color: `var(--spinner-color, ${colorVars['--color-on-dark']})`},
  inherit: {color: 'var(--spinner-color, currentColor)'},
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
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // Colors are resolved from the cascade at draw time, so the tokens are read
  // only as a redraw signal: their identity changes when the theme does.
  const {tokens: themeTokens} = useTheme();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas == null) {
      return;
    }

    const context = canvas.getContext('2d');
    if (!context) {
      return;
    }

    // The box the canvas sits in. It carries the track color and is sized from
    // the geometry vars, so it is both the second color channel and the thing
    // whose resize means "the geometry changed".
    const box = canvas.parentElement;

    registerSpinnerVars();

    let lastDrawn = '';

    const draw = () => {
      const canvasStyle = getComputedStyle(canvas);

      // Registered as <length>, so these are resolved px.
      const themedDiameter = parseFloat(
        canvasStyle.getPropertyValue('--spinner-diameter'),
      );
      const themedRail = parseFloat(
        canvasStyle.getPropertyValue('--spinner-rail-width'),
      );
      // A zero diameter is never a choice — it means the var never resolved
      // (no stylesheet yet, or a themed value the registration rejected), so
      // fall back to the built-in geometry. A zero rail IS a choice: a theme
      // asking for no visible track gets one, which is why this tests for a
      // finite number rather than truthiness.
      const diameter =
        Number.isFinite(themedDiameter) && themedDiameter > 0
          ? themedDiameter
          : SIZES[size].diameter;
      const border = Number.isFinite(themedRail)
        ? themedRail
        : SIZES[size].border;
      const pixelRatio = window.devicePixelRatio || 1;

      // Both colors arrive resolved (see trackShadeStyles / arcShadeStyles):
      // the arc from the canvas, the track from the box it sits in.
      const activeColor = canvasStyle.color;
      const backgroundColor =
        box == null ? activeColor : getComputedStyle(box).color;

      const key = `${diameter}|${border}|${pixelRatio}|${activeColor}|${backgroundColor}`;
      if (key === lastDrawn) {
        return;
      }
      lastDrawn = key;

      const cssSize = diameter + border * 2;

      // Round to an even number of device pixels so the center stays on a whole
      // pixel (avoids rotation jitter); keep CSS size pinned to cssSize (#2732).
      const rawFrameSize = Math.round(cssSize * pixelRatio);
      const frameSize = rawFrameSize + (rawFrameSize % 2);

      const scale = frameSize / cssSize;
      const radius = (diameter / 2) * scale;
      const lineWidth = border * scale;

      canvas.height = canvas.width = frameSize;
      canvas.style.width = canvas.style.height = cssSize + 'px';

      context.lineCap = 'round';
      context.lineWidth = lineWidth;

      const center = frameSize / 2;

      // Background circle (full ring). onMedia and inherit fade it so the arc
      // reads against an arbitrary backdrop; see TRACK_ALPHA.
      context.beginPath();
      context.arc(center, center, radius, 0, 2 * Math.PI);
      context.strokeStyle = backgroundColor;
      context.globalAlpha = TRACK_ALPHA[shade];
      context.stroke();
      context.globalAlpha = 1;

      // Active arc (partial ring, colored)
      context.beginPath();
      context.arc(
        center,
        center,
        radius,
        START_POINT * Math.PI,
        ((START_POINT + SPREAD) % 2) * Math.PI,
      );
      context.strokeStyle = activeColor;
      context.stroke();
    };

    draw();

    // The box is sized from the same vars the ring is drawn from, so its
    // resize is the signal that a themed diameter or rail width changed —
    // including changes no dependency can see, like a media query swapping the
    // var or a root font-size change moving a rem. Redrawing only when the
    // computed inputs actually differ keeps this to one draw on mount.
    if (box == null || typeof ResizeObserver === 'undefined') {
      return;
    }
    const observer = new ResizeObserver(draw);
    observer.observe(box);
    return () => observer.disconnect();
  }, [shade, size, themeTokens]);

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
          trackShadeStyles[shade],
          // The geometry defaults ride whichever element carries the theme
          // target, so a themed value overrides them instead of being shadowed
          // by them. With a label that target is the wrapping div and the span
          // inherits from it.
          !hasLabel && sizeStyles[size],
          !hasLabel && xstyle,
        ),
        hasLabel ? undefined : className,
        hasLabel ? {} : style,
      )}>
      <canvas
        ref={canvasRef}
        {...stylex.props(styles.canvas, arcShadeStyles[shade])}
      />
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
        stylex.props(styles.wrapper, sizeStyles[size], xstyle),
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
