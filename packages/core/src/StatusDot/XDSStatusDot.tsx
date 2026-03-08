/**
 * @file XDSStatusDot.tsx
 * @input Uses React
 * @output Exports XDSStatusDot component, XDSStatusDotProps, XDSStatusDotVariant, XDSStatusDotSize types
 * @position Core implementation; consumed by index.ts
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/StatusDot/StatusDot.doc.mjs (props table, features, implementation notes)
 * - /packages/core/src/StatusDot/XDSStatusDot.test.tsx (tests for new/changed behavior)
 * - /packages/core/src/StatusDot/index.ts (exports if types change)
 * - /apps/storybook/stories/StatusDot.stories.tsx (storybook stories)
 */

import * as stylex from '@stylexjs/stylex';
import type {StyleXStyles} from '@stylexjs/stylex';
import {colorVars} from '../theme/tokens.stylex';
import {xdsClassName, mergeProps} from '../utils';

/**
 * Pulse animation keyframes
 */
const pulseKeyframes = stylex.keyframes({
  '0%': {opacity: 1},
  '50%': {opacity: 0.5},
  '100%': {opacity: 1},
});

/**
 * Base styles
 */
const styles = stylex.create({
  base: {
    display: 'inline-block',
    borderRadius: '50%',
    flexShrink: 0,
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
 * Size styles
 */
const sizes = stylex.create({
  sm: {
    width: '8px',
    height: '8px',
  },
  md: {
    width: '10px',
    height: '10px',
  },
});

/**
 * Variant styles mapping to theme color tokens
 */
const variants = stylex.create({
  positive: {
    backgroundColor: colorVars['--color-positive'],
  },
  warning: {
    backgroundColor: colorVars['--color-warning'],
  },
  negative: {
    backgroundColor: colorVars['--color-negative'],
  },
  info: {
    backgroundColor: colorVars['--color-accent'],
  },
  neutral: {
    backgroundColor: colorVars['--color-deemphasized'],
  },
});

/**
 * Status dot variant type
 */
export type XDSStatusDotVariant = keyof typeof variants;

/**
 * Status dot size type
 */
export type XDSStatusDotSize = 'sm' | 'md';

export interface XDSStatusDotProps {
  /** Ref forwarded to the root element */
  ref?: React.Ref<HTMLSpanElement>;
  /**
   * The semantic color variant.
   */
  variant: XDSStatusDotVariant;
  /**
   * The size of the dot.
   * @default 'md'
   */
  size?: XDSStatusDotSize;
  /**
   * Accessible label describing the status. Required for a11y.
   */
  label: string;
  /**
   * Whether the dot should pulse to indicate activity.
   * Respects `prefers-reduced-motion`.
   * @default false
   */
  isPulsing?: boolean;
  /**
   * StyleX styles created via `stylex.create()`. Merged with the component's
   * base styles inside a single `stylex.props()` call for optimal deduplication.
   *
   * @example
   * ```
   * const overrides = stylex.create({ root: { marginBottom: 8 } });
   * <Component xstyle={overrides.root} />
   * ```
   */
  xstyle?: StyleXStyles;
  /**
   * CSS class name(s) appended to the root element.
   * If you're using StyleX, prefer `xstyle` for optimal style deduplication.
   */
  className?: string;
  /**
   * Inline styles to apply to the root element. Spread after StyleX
   * inline styles, so these values take priority.
   */
  style?: React.CSSProperties;
  /**
   * Optional test ID for testing.
   */
  'data-testid'?: string;
}

/**
 * A small colored dot indicator for status display (online/offline, severity, etc).
 *
 * Renders as a non-focusable `<span>` with `role="img"` and `aria-label` for accessibility.
 * Styles use XDS theme tokens via StyleX. Wrap your app in `<Theme>` to apply a theme.
 *
 * @example
 * ```
 * <XDSStatusDot variant="positive" label="Online" />
 * <XDSStatusDot variant="negative" label="Offline" size="sm" />
 * <XDSStatusDot variant="positive" label="Live" isPulsing />
 * ```
 */
export function XDSStatusDot({
  variant,
  size = 'md',
  label,
  isPulsing = false,
  xstyle,
  className,
  style,
  ref,
  ...props
}: XDSStatusDotProps) {
  return (
    <span
      ref={ref}
      role="img"
      aria-label={label}
      {...mergeProps(
        xdsClassName('statusdot', {variant, size}),
        stylex.props(
          styles.base,
          sizes[size],
          variants[variant],
          isPulsing && styles.pulsing,
          isPulsing && styles.reducedMotion,
          xstyle,
        ),
        className,
        style,
      )}
      {...props}
    />
  );
}

XDSStatusDot.displayName = 'XDSStatusDot';
