/**
 * @file XDSIllustrationNoResults.tsx
 * @input Uses React forwardRef, StyleX, XDS color tokens
 * @output Exports XDSIllustrationNoResults component
 * @position Component implementation; consumed by index.ts
 *
 * Magnifying glass with a question mark — for search with no matches.
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
  accent: {
    color: colorVars['--color-accent'],
  },
  deemphasized: {
    color: colorVars['--color-deemphasized'],
  },
});

/**
 * Magnifying glass with question mark illustration.
 * Use for search with no results or empty search states.
 *
 * @example
 * ```tsx
 * <XDSIllustrationNoResults size="md" />
 * ```
 */
export const XDSIllustrationNoResults = forwardRef<
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
      {/* Lens circle background */}
      <circle
        cx="52"
        cy="52"
        r="32"
        {...stylex.props(styles.deemphasized)}
        fill="currentColor"
      />
      {/* Lens circle stroke */}
      <circle
        cx="52"
        cy="52"
        r="32"
        {...stylex.props(styles.stroke)}
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Handle */}
      <line
        x1="76"
        y1="76"
        x2="100"
        y2="100"
        {...stylex.props(styles.stroke)}
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
      {/* Question mark */}
      <path
        d="M44 42C44 36.477 48.477 32 54 32C59.523 32 64 36.477 64 42C64 46 61.5 48.5 58 50C55.5 51 54 53 54 56"
        {...stylex.props(styles.accent)}
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Question mark dot */}
      <circle
        cx="54"
        cy="64"
        r="2"
        {...stylex.props(styles.accent)}
        fill="currentColor"
      />
    </svg>
  );
});

XDSIllustrationNoResults.displayName = 'XDSIllustrationNoResults';
