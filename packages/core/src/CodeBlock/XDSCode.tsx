'use client';

/**
 * @file XDSCode.tsx
 * @input Uses React, StyleX, theme tokens
 * @output Exports XDSCode component for inline code styling
 * @position Core implementation; inline code display
 *
 * SYNC: When modified, update:
 * - /packages/core/src/CodeBlock/index.ts (exports if types change)
 */

import {type ReactNode} from 'react';
import * as stylex from '@stylexjs/stylex';
import type {StyleXStyles} from '@stylexjs/stylex';
import {
  colorVars,
  spacingVars,
  radiusVars,
  typographyVars,
} from '../theme/tokens.stylex';
import {xdsClassName, mergeProps} from '../utils';

const styles = stylex.create({
  base: {
    fontFamily: typographyVars['--font-family-code'],
    fontSize: '0.9em',
    lineHeight: 'inherit',
    backgroundColor: colorVars['--color-background-muted'],
    paddingInline: spacingVars['--spacing-1'],
    paddingBlock: '1px',
    borderRadius: radiusVars['--radius-inner'],
    // Prevent code from breaking parent layout
    overflowWrap: 'break-word',
    wordBreak: 'break-word',
  },
});

export interface XDSCodeProps {
  /** Ref forwarded to the root element */
  ref?: React.Ref<HTMLElement>;
  /** Code content */
  children: ReactNode;
  /** StyleX override styles */
  xstyle?: StyleXStyles;
  /** CSS class name(s) */
  className?: string;
  /** Inline styles */
  style?: React.CSSProperties;
  'data-testid'?: string;
}

/**
 * Inline code element. Renders a styled `<code>` with monospace font,
 * muted background, and design-system-consistent sizing.
 *
 * For fenced code blocks with syntax highlighting, use `XDSCodeBlock`.
 *
 * @example
 * ```
 * <XDSText type="body">
 *   Use <XDSCode>const x = 1</XDSCode> to declare a variable.
 * </XDSText>
 * ```
 */
export function XDSCode({
  children,
  xstyle,
  className,
  style,
  ref,
  ...props
}: XDSCodeProps) {
  return (
    <code
      ref={ref}
      {...mergeProps(
        xdsClassName('code'),
        stylex.props(styles.base, xstyle),
        className,
        style,
      )}
      data-testid={props['data-testid']}
    >
      {children}
    </code>
  );
}

XDSCode.displayName = 'XDSCode';
