// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file XDSBlockquote.tsx
 * @input Uses React, stylex, spacing and color tokens
 * @output Exports XDSBlockquote component and XDSBlockquoteProps
 * @position Blockquote component; renders styled quotations with optional attribution
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/Blockquote/Blockquote.doc.mjs
 * - /packages/core/src/Blockquote/XDSBlockquote.test.tsx
 * - /apps/storybook/stories/Blockquote.stories.tsx
 * - /packages/cli/templates/blocks/components/Blockquote/ (showcase blocks)
 */

import type {ReactNode} from 'react';
import type {XDSBaseProps} from '../XDSBaseProps';
import * as stylex from '@stylexjs/stylex';
import {colorVars, spacingVars, typeScaleVars} from '../theme/tokens.stylex';
import {xdsClassName, mergeProps} from '../utils';

export interface XDSBlockquoteProps extends XDSBaseProps<HTMLQuoteElement> {
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
 * and secondary text color, matching the XDS visual language.
 *
 * @example
 * ```
 * <XDSBlockquote>Design is not just what it looks like.</XDSBlockquote>
 * ```
 */
export function XDSBlockquote({
  children,
  cite,
  xstyle,
  className,
  style,
  ref,
  ...props
}: XDSBlockquoteProps) {
  return (
    <blockquote
      ref={ref}
      {...mergeProps(
        xdsClassName('blockquote'),
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

XDSBlockquote.displayName = 'XDSBlockquote';
