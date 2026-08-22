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

/** Fixed dot size in px. A user-supplied icon is drawn into this same field. */
const DOT_SIZE = 8;

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
  // `currentColor` (the variant's ink).
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
 * Each variant sets both the plate colour and an ink colour: a user-supplied
 * `icon` paints from `currentColor`, so plate and ink can never drift out of
 * contrast (same contract as AvatarStatusDot). The ink is each plate's
 * dedicated `--color-on-*` pairing (the Badge precedent), not the surface
 * colour: on-warning is a fixed dark ink, which keeps an icon legible on the
 * yellow plate (~9.6:1) where a light surface ink lands near 2:1. Neutral has
 * no `--color-on-*` token; its mid-grey plate takes the surface ink.
 *
 * The nine hues (Badge's non-semantic set) have no `--color-on-*` pairing
 * either, so they take neutral's shape: a foreground-ramp plate with the
 * surface as ink. `--color-text-<hue>` is the stop that flips polarity with
 * the colour scheme, so both contrasts hold in light and dark — plate against
 * the page ≥8.3:1, surface ink on the plate the same ≥8.3:1 (worst case
 * purple, dark). The other two stops fail an 8px dot: the
 * `--color-background-<hue>` wash Badge fills its pill with is 20% alpha and
 * lands at 1.2–1.5:1 on the page, and mid-tone `--color-icon-<hue>` misses
 * the 3:1 non-text bar in light mode for yellow (1.7:1) and cyan (2.7:1).
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
  neutral: {
    backgroundColor: colorVars['--color-icon-secondary'],
    color: colorVars['--color-background-surface'],
  },
  blue: {
    backgroundColor: colorVars['--color-text-blue'],
    color: colorVars['--color-background-surface'],
  },
  cyan: {
    backgroundColor: colorVars['--color-text-cyan'],
    color: colorVars['--color-background-surface'],
  },
  green: {
    backgroundColor: colorVars['--color-text-green'],
    color: colorVars['--color-background-surface'],
  },
  orange: {
    backgroundColor: colorVars['--color-text-orange'],
    color: colorVars['--color-background-surface'],
  },
  pink: {
    backgroundColor: colorVars['--color-text-pink'],
    color: colorVars['--color-background-surface'],
  },
  purple: {
    backgroundColor: colorVars['--color-text-purple'],
    color: colorVars['--color-background-surface'],
  },
  red: {
    backgroundColor: colorVars['--color-text-red'],
    color: colorVars['--color-background-surface'],
  },
  teal: {
    backgroundColor: colorVars['--color-text-teal'],
    color: colorVars['--color-background-surface'],
  },
  yellow: {
    backgroundColor: colorVars['--color-text-yellow'],
    color: colorVars['--color-background-surface'],
  },
});

/**
 * Status dot variant type derived from StatusDotVariantMap.
 * Extensible via module augmentation of StatusDotVariantMap.
 */
export type StatusDotVariant = keyof StatusDotVariantMap;

export interface StatusDotProps extends BaseProps<HTMLSpanElement> {
  /** Ref forwarded to the root element */
  ref?: React.Ref<HTMLSpanElement>;
  /**
   * The colour variant. Five are semantic (`success`, `warning`, `error`,
   * `accent`, `neutral`); the nine hues (`blue`, `cyan`, `green`, `orange`,
   * `pink`, `purple`, `red`, `teal`, `yellow`) carry no built-in meaning and
   * are for categorising — the same set, under the same names, as `Badge`.
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
   * (typically an SVG icon), painted in the dot's `currentColor` ink. Same
   * contract as `AvatarStatusDot`'s `icon`.
   *
   * By default the dot is a colour-only signal; an icon gives the status a
   * non-colour mark, so use a different icon per status — the same icon on
   * every variant leaves the statuses distinguishable by colour alone
   * (WCAG 2.1 SC 1.4.1). Booleans and empty strings are ignored (safe for
   * `cond && <Icon />`).
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
 * Fixed 8px size. By default the dot conveys status by colour only, which is
 * not accessible in isolation (WCAG 2.1 SC 1.4.1) — treat it as a signal the
 * surrounding UI must make accessible: use it as a binary present/absent
 * signal, pair it with a visible label, pass `icon` so the status carries a
 * non-colour mark, or convey the status accessibly elsewhere. See the usage
 * guidance in the component docs.
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
 * <StatusDot variant="purple" label="Design" />
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
  // Booleans and empty renders don't count (safe for `cond && <Icon />`) —
  // same contract as AvatarStatusDot.
  const showsIcon = isRenderable(icon);
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
    </span>
  );

  if (tooltip) {
    return <Tooltip content={tooltip}>{dot}</Tooltip>;
  }

  return dot;
}

StatusDot.displayName = 'StatusDot';
