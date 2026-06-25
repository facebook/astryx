// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file Blockquote.tsx
 * @input Uses React, stylex, spacing and color tokens
 * @output Exports Blockquote component and BlockquoteProps
 * @position Blockquote component; renders styled quotations with optional attribution
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/Blockquote/Blockquote.doc.mjs
 * - /packages/core/src/Blockquote/Blockquote.test.tsx
 * - /apps/storybook/stories/Blockquote.stories.tsx
 * - /packages/cli/templates/blocks/components/Blockquote/ (showcase blocks)
 */

import type {ReactNode} from 'react';
import type {BaseProps} from '../BaseProps';
import * as stylex from '@stylexjs/stylex';
import {colorVars, spacingVars, typeScaleVars} from '../theme/tokens.stylex';
import {mergeProps} from '../utils';
import {themeProps} from '../utils/themeProps';

export interface BlockquoteProps extends BaseProps<HTMLQuoteElement> {
  /** Ref forwarded to the root <blockquote> element */
  ref?: React.Ref<HTMLQuoteElement>;
  /** Content of the blockquote */
  children: ReactNode;
  /**
   * Optional attribution for the quote. Rendered in a <footer> with <cite>.
   */
  cite?: ReactNode;
}

const styles = stylex.create({
  root: {
    borderInlineStartWidth: spacingVars['--spacing-0-5'],
    borderInlineStartStyle: 'solid',
    borderInlineStartColor: colorVars['--color-border-emphasized'],
    paddingInlineStart: spacingVars['--spacing-4'],
    color: colorVars['--color-text-secondary'],
    marginInlineStart: 0,
    marginInlineEnd: 0,
    marginBlockStart: 0,
    marginBlockEnd: 0,
  },
  cite: {
    display: 'block',
    marginBlockStart: spacingVars['--spacing-2'],
    fontSize: typeScaleVars['--text-supporting-size'],
    lineHeight: typeScaleVars['--text-supporting-leading'],
    fontStyle: 'normal',
  },
});

/**
 * Blockquote component for displaying quoted content.
 *
 * Renders a semantic `<blockquote>` with an accent-colored left border
 * and secondary text color, matching the Astryx visual language.
 *
 * @example
 * ```
 * <Blockquote>Design is not just what it looks like.</Blockquote>
 * ```
 */
export function Blockquote({
  children,
  cite,
  xstyle,
  className,
  style,
  ref,
  ...props
}: BlockquoteProps) {
  return (
    <blockquote
      ref={ref}
      {...mergeProps(
        themeProps('blockquote'),
        stylex.props(styles.root, xstyle),
        className,
        style,
      )}
      {...props}>
      {children}
      {cite != null && (
        <footer>
          <cite {...stylex.props(styles.cite)}>{cite}</cite>
        </footer>
      )}
    </blockquote>
  );
}

Blockquote.displayName = 'Blockquote';
