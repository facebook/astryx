/**
 * @file XDSIllustrationEmptyInbox.tsx
 * @input Uses React forwardRef, StyleX, XDS color tokens
 * @output Exports XDSIllustrationEmptyInbox component
 * @position Component implementation; consumed by index.ts
 *
 * Open envelope illustration — for empty message/notification lists.
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
 * Open envelope illustration.
 * Use for empty inbox, no messages, or empty notification states.
 *
 * @example
 * ```tsx
 * <XDSIllustrationEmptyInbox size="md" />
 * ```
 */
export const XDSIllustrationEmptyInbox = forwardRef<
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
      {/* Envelope body background */}
      <rect
        x="20"
        y="40"
        width="80"
        height="56"
        rx="4"
        {...stylex.props(styles.deemphasized)}
        fill="currentColor"
      />
      {/* Envelope body stroke */}
      <rect
        x="20"
        y="40"
        width="80"
        height="56"
        rx="4"
        {...stylex.props(styles.stroke)}
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Open flap */}
      <path
        d="M20 44L60 24L100 44"
        {...stylex.props(styles.stroke)}
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Inner V fold */}
      <path
        d="M20 44L60 72L100 44"
        {...stylex.props(styles.accent)}
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
});

XDSIllustrationEmptyInbox.displayName = 'XDSIllustrationEmptyInbox';
