/**
 * @file XDSStatusDot.tsx
 * @input Uses React forwardRef
 * @output Exports XDSStatusDot component, XDSStatusDotProps, XDSStatusDotVariant, XDSStatusDotSize types
 * @position Core implementation; consumed by index.ts
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/StatusDot/StatusDot.doc.mjs (props table, features, implementation notes)
 * - /packages/core/src/StatusDot/XDSStatusDot.test.tsx (tests for new/changed behavior)
 * - /packages/core/src/StatusDot/index.ts (exports if types change)
 * - /apps/storybook/stories/StatusDot.stories.tsx (storybook stories)
 */

import {forwardRef} from 'react';
import * as stylex from '@stylexjs/stylex';
import type {StyleXStyles} from '@stylexjs/stylex';
import {colorVars} from '../theme/tokens.stylex';

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
   * Optional StyleX styles override.
   */
  xstyle?: StyleXStyles;
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
export const XDSStatusDot = forwardRef<HTMLSpanElement, XDSStatusDotProps>(
  ({variant, size = 'md', label, isPulsing = false, xstyle, ...props}, ref) => {
    return (
      <span
        ref={ref}
        role="img"
        aria-label={label}
        {...stylex.props(
          styles.base,
          sizes[size],
          variants[variant],
          isPulsing && styles.pulsing,
          isPulsing && styles.reducedMotion,
          xstyle,
        )}
        {...props}
      />
    );
  },
);

XDSStatusDot.displayName = 'XDSStatusDot';
