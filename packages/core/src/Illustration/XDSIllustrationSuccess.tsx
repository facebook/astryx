/**
 * @file XDSIllustrationSuccess.tsx
 * @input Uses React forwardRef, StyleX, XDS color tokens
 * @output Exports XDSIllustrationSuccess component
 * @position Component implementation; consumed by index.ts
 *
 * Checkmark in circle illustration — for success or completed states.
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/Illustration/README.md
 * - /packages/core/src/Illustration/XDSIllustration.test.tsx
 * - /packages/core/src/Illustration/index.ts
 * - /apps/storybook/stories/Illustration.stories.tsx
 */

import {forwardRef} from 'react';
import * as stylex from '@stylexjs/stylex';
import {colorVars} from '../theme/tokens.stylex';
import type {XDSIllustrationProps} from './types';

const sizes = {
  sm: 48,
  md: 80,
  lg: 120,
} as const;

const styles = stylex.create({
  svg: {
    display: 'block',
    flexShrink: 0,
  },
  stroke: {
    color: colorVars['--color-text-secondary'],
  },
  positive: {
    color: colorVars['--color-positive'],
  },
  deemphasized: {
    color: colorVars['--color-deemphasized'],
  },
});

/**
 * Checkmark in circle illustration.
 * Use for success, completed, or "all done" states.
 *
 * @example
 * ```tsx
 * <XDSIllustrationSuccess size="md" />
 * ```
 */
export const XDSIllustrationSuccess = forwardRef<
  SVGSVGElement,
  XDSIllustrationProps
>(({size = 'md', xstyle, 'data-testid': testId}, ref) => {
  const px = sizes[size];

  return (
    <svg
      ref={ref}
      width={px}
      height={px}
      viewBox="0 0 120 120"
      fill="none"
      aria-hidden="true"
      data-testid={testId}
      {...stylex.props(styles.svg, xstyle)}>
      {/* Circle background */}
      <circle
        cx="60"
        cy="60"
        r="40"
        {...stylex.props(styles.deemphasized)}
        fill="currentColor"
      />
      {/* Circle stroke */}
      <circle
        cx="60"
        cy="60"
        r="40"
        {...stylex.props(styles.stroke)}
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Checkmark */}
      <path
        d="M40 62L54 76L82 48"
        {...stylex.props(styles.positive)}
        stroke="currentColor"
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Celebratory sparkle top-right */}
      <path
        d="M96 24L98 18L100 24L106 26L100 28L98 34L96 28L90 26L96 24Z"
        {...stylex.props(styles.positive)}
        fill="currentColor"
      />
      {/* Small sparkle */}
      <path
        d="M108 40L109 37L110 40L113 41L110 42L109 45L108 42L105 41L108 40Z"
        {...stylex.props(styles.positive)}
        fill="currentColor"
      />
    </svg>
  );
});

XDSIllustrationSuccess.displayName = 'XDSIllustrationSuccess';
