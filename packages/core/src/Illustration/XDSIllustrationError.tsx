/**
 * @file XDSIllustrationError.tsx
 * @input Uses React forwardRef, StyleX, XDS color tokens
 * @output Exports XDSIllustrationError component
 * @position Component implementation; consumed by index.ts
 *
 * Warning triangle illustration — for error or "something went wrong" states.
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
  negative: {
    color: colorVars['--color-negative'],
  },
  deemphasized: {
    color: colorVars['--color-deemphasized'],
  },
});

/**
 * Warning triangle illustration.
 * Use for error states or "something went wrong" scenarios.
 *
 * @example
 * ```tsx
 * <XDSIllustrationError size="md" />
 * ```
 */
export const XDSIllustrationError = forwardRef<
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
      {/* Triangle background */}
      <path
        d="M60 20L104 96H16L60 20Z"
        {...stylex.props(styles.deemphasized)}
        fill="currentColor"
      />
      {/* Triangle stroke */}
      <path
        d="M60 20L104 96H16L60 20Z"
        {...stylex.props(styles.stroke)}
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Exclamation line */}
      <line
        x1="60"
        y1="48"
        x2="60"
        y2="72"
        {...stylex.props(styles.negative)}
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
      {/* Exclamation dot */}
      <circle
        cx="60"
        cy="82"
        r="2.5"
        {...stylex.props(styles.negative)}
        fill="currentColor"
      />
    </svg>
  );
});

XDSIllustrationError.displayName = 'XDSIllustrationError';
