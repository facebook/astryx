// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file XDSInputGroupText.tsx
 * @input Uses React, StyleX, theme tokens
 * @output Exports XDSInputGroupText component
 * @position Text/icon element rendered inside XDSInputGroup
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/InputGroup/InputGroup.doc.mjs
 * - /packages/core/src/InputGroup/index.ts
 * - /packages/cli/templates/blocks/components/InputGroup/
 */

import type {ReactNode} from 'react';
import * as stylex from '@stylexjs/stylex';
import type {StyleXStyles} from '@stylexjs/stylex';
import {
  colorVars,
  spacingVars,
  radiusVars,
  typographyVars,
  typeScaleVars,
  borderVars,
} from '../theme/tokens.stylex';
import {xdsClassName, mergeProps} from '../utils';

const styles = stylex.create({
  text: {
    display: 'flex',
    alignItems: 'center',
    paddingInline: spacingVars['--spacing-2'],
    backgroundColor: colorVars['--color-background-muted'],
    fontFamily: typographyVars['--font-family-body'],
    fontSize: typeScaleVars['--text-body-size'],
    lineHeight: typeScaleVars['--text-body-leading'],
    color: colorVars['--color-text-secondary'],
    whiteSpace: 'nowrap',
    flexShrink: 0,
    borderWidth: borderVars['--border-width'],
    borderStyle: 'solid',
    borderColor: colorVars['--color-border-emphasized'],
    marginInlineStart: {
      default: `calc(-1 * ${borderVars['--border-width']})`,
      ':first-child': 0,
    },
    borderStartStartRadius: {
      default: 0,
      ':first-child': radiusVars['--radius-element'],
    },
    borderEndStartRadius: {
      default: 0,
      ':first-child': radiusVars['--radius-element'],
    },
    borderStartEndRadius: {
      default: 0,
      ':last-child': radiusVars['--radius-element'],
    },
    borderEndEndRadius: {
      default: 0,
      ':last-child': radiusVars['--radius-element'],
    },
  },
});

export interface XDSInputGroupTextProps {
  /**
   * Content to render in the text slot.
   * Can be text or an icon.
   */
  children: ReactNode;

  /**
   * StyleX styles for customization.
   */
  xstyle?: StyleXStyles;

  /**
   * CSS class name(s).
   */
  className?: string;

  /**
   * Inline styles.
   */
  style?: React.CSSProperties;
}

/**
 * A prefix or suffix text element for use inside XDSInputGroup.
 *
 * @example
 * ```
 * <XDSInputGroup label="URL">
 *   <XDSInputGroupText>https://</XDSInputGroupText>
 *   <XDSTextInput label="URL" isLabelHidden value={url} onChange={setUrl} />
 * </XDSInputGroup>
 * ```
 */
export function XDSInputGroupText({
  children,
  xstyle,
  className,
  style,
}: XDSInputGroupTextProps) {
  return (
    <div
      {...mergeProps(
        xdsClassName('input-group-text'),
        stylex.props(styles.text, xstyle),
        className,
        style,
      )}>
      {children}
    </div>
  );
}

XDSInputGroupText.displayName = 'XDSInputGroupText';
