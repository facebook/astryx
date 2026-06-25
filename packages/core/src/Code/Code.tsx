// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file Code.tsx
 * @input Uses React, StyleX, theme tokens
 * @output Exports Code component for inline code styling
 * @position Core implementation; lives in own Code/ dir, re-exported by CodeBlock/
 *
 * SYNC: When modified, update:
 * - /packages/core/src/CodeBlock/index.ts (exports if types change)
 * - /packages/cli/templates/blocks/components/Code/ (showcase blocks)
 * - /packages/cli/templates/blocks/components/CodeBlock/ (showcase blocks)
 */

import type {ReactNode} from 'react';
import * as stylex from '@stylexjs/stylex';
import {
  colorVars,
  spacingVars,
  radiusVars,
  typographyVars,
  typeScaleVars,
} from '../theme/tokens.stylex';
import {mergeProps} from '../utils';
import type {BaseProps} from '../BaseProps';
import {themeProps} from '../utils/themeProps';

const styles = stylex.create({
  base: {
    fontFamily: typographyVars['--font-family-code'],
    fontSize: typeScaleVars['--text-code-size'],
    lineHeight: 'inherit',
    backgroundColor: colorVars['--color-background-muted'],
    paddingInline: spacingVars['--spacing-1'],
    paddingBlock: spacingVars['--spacing-0'],
    borderRadius: radiusVars['--radius-inner'],
    // Prevent code from breaking parent layout
    overflowWrap: 'break-word',
    wordBreak: 'break-word',
  },
});

export interface CodeProps extends BaseProps<HTMLElement> {
  /** Ref forwarded to the root element */
  ref?: React.Ref<HTMLElement>;
  /** Code content */
  children: ReactNode;
}

/**
 * Inline code element. Renders a styled `<code>` with monospace font,
 * muted background, and design-system-consistent sizing.
 *
 * For fenced code blocks with syntax highlighting, use `CodeBlock`.
 *
 * @example
 * ```
 * <Text type="body">
 *   Use <Code>const x = 1</Code> to declare a variable.
 * </Text>
 * ```
 */
export function Code({
  children,
  xstyle,
  className,
  style,
  ref,
  ...props
}: CodeProps) {
  return (
    <code
      ref={ref}
      {...mergeProps(
        themeProps('code'),
        stylex.props(styles.base, xstyle),
        className,
        style,
      )}
      data-testid={props['data-testid']}>
      {children}
    </code>
  );
}

Code.displayName = 'Code';
