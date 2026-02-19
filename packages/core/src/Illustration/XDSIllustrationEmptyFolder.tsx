/**
 * @file XDSIllustrationEmptyFolder.tsx
 * @input Uses React forwardRef, StyleX, XDS color tokens
 * @output Exports XDSIllustrationEmptyFolder component
 * @position Component implementation; consumed by index.ts
 *
 * Open folder illustration — for no files, projects, or items.
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
 * Open folder illustration.
 * Use for empty folder, no files, or no projects states.
 *
 * @example
 * ```tsx
 * <XDSIllustrationEmptyFolder size="md" />
 * ```
 */
export const XDSIllustrationEmptyFolder = forwardRef<
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
      {/* Folder back */}
      <path
        d="M16 36C16 33.791 17.791 32 20 32H46L54 42H100C102.209 42 104 43.791 104 46V88C104 90.209 102.209 92 100 92H20C17.791 92 16 90.209 16 88V36Z"
        {...stylex.props(styles.deemphasized)}
        fill="currentColor"
      />
      {/* Folder back stroke */}
      <path
        d="M16 36C16 33.791 17.791 32 20 32H46L54 42H100C102.209 42 104 43.791 104 46V88C104 90.209 102.209 92 100 92H20C17.791 92 16 90.209 16 88V36Z"
        {...stylex.props(styles.stroke)}
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Folder front flap */}
      <path
        d="M16 54H104V88C104 90.209 102.209 92 100 92H20C17.791 92 16 90.209 16 88V54Z"
        {...stylex.props(styles.stroke)}
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Tab accent */}
      <path
        d="M46 32L54 42"
        {...stylex.props(styles.accent)}
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  );
});

XDSIllustrationEmptyFolder.displayName = 'XDSIllustrationEmptyFolder';
