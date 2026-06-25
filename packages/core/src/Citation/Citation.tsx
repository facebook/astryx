// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file Citation.tsx
 * @input Uses React, StyleX, theme tokens
 * @output Exports Citation component for inline citation references
 * @position Core implementation; consumed by index.ts
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/Citation/index.ts (exports if types change)
 * - /packages/cli/templates/blocks/components/Citation/ (showcase blocks)
 */

import type React from 'react';
import * as stylex from '@stylexjs/stylex';
import {
  colorVars,
  spacingVars,
  radiusVars,
  typeScaleVars,
  fontWeightVars,
  borderVars,
  durationVars,
  easeVars,
} from '../theme/tokens.stylex';
import {mergeProps} from '../utils';
import type {BaseProps} from '../BaseProps';
import {themeProps} from '../utils/themeProps';

export interface CitationSource {
  title?: string;
  url?: string;
  icon?: string;
}

export interface CitationProps extends BaseProps<HTMLElement> {
  ref?: React.Ref<HTMLElement>;
  source: CitationSource;
  number: number;
  variant?: 'label' | 'number';
}

const styles = stylex.create({
  label: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: spacingVars['--spacing-1'],
    verticalAlign: 'baseline',
    height: spacingVars['--spacing-5'],
    fontSize: typeScaleVars['--text-supporting-size'],
    fontWeight: typeScaleVars['--text-supporting-weight'],
    lineHeight: typeScaleVars['--text-supporting-leading'],
    color: colorVars['--color-text-secondary'],
    borderRadius: radiusVars['--radius-element'],
    borderWidth: borderVars['--border-width'],
    borderStyle: 'solid',
    borderColor: colorVars['--color-border'],
    paddingInline: spacingVars['--spacing-2'],
    marginInlineStart: spacingVars['--spacing-0-5'],
    textDecoration: 'none',
    cursor: 'pointer',
    transitionProperty: 'background-color, border-color, color',
    transitionDuration: durationVars['--duration-fast-max'],
    transitionTimingFunction: easeVars['--ease-standard'],
    maxWidth: '15em',
    overflow: 'hidden',
  },
  labelWithIcon: {
    paddingInlineStart: spacingVars['--spacing-0-5'],
  },
  labelText: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    minWidth: 0,
  },
  labelHover: {
    backgroundColor: {
      ':hover': {
        '@media (hover: hover)': colorVars['--color-overlay-hover'],
      },
    },
    color: {
      ':hover': {
        '@media (hover: hover)': colorVars['--color-text-primary'],
      },
    },
  },
  number: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    verticalAlign: 'super',
    fontSize: typeScaleVars['--text-supporting-size'],
    fontWeight: fontWeightVars['--font-weight-semibold'],
    lineHeight: typeScaleVars['--text-supporting-leading'],
    color: colorVars['--color-text-accent'],
    backgroundColor: colorVars['--color-accent-muted'],
    borderRadius: radiusVars['--radius-full'],
    minWidth: spacingVars['--spacing-5'],
    height: spacingVars['--spacing-5'],
    paddingInline: spacingVars['--spacing-1'],
    textDecoration: 'none',
    cursor: 'pointer',
    transitionProperty: 'background-color',
    transitionDuration: durationVars['--duration-fast-max'],
    transitionTimingFunction: easeVars['--ease-standard'],
  },
  numberHover: {
    backgroundColor: {
      ':hover': {
        '@media (hover: hover)': colorVars['--color-overlay-hover'],
      },
    },
  },
  iconWrap: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: spacingVars['--spacing-4'],
    height: spacingVars['--spacing-4'],
    borderRadius: radiusVars['--radius-full'],
    backgroundColor: colorVars['--color-background-surface'],
    borderWidth: borderVars['--border-width'],
    borderStyle: 'solid',
    borderColor: colorVars['--color-border'],
    overflow: 'hidden',
    flexShrink: 0,
  },
  icon: {
    width: spacingVars['--spacing-3'],
    height: spacingVars['--spacing-3'],
  },
});

export function Citation({
  ref,
  source,
  number,
  variant = 'label',
  xstyle,
  className,
  style,
  'data-testid': testId,
  ...rest
}: CitationProps): React.ReactElement {
  const title = source.title ?? String(number);
  const href = source.url;
  const icon = source.icon;
  const Tag = href ? 'a' : 'span';
  const linkProps = href
    ? {
        href,
        target: '_blank' as const,
        rel: 'noopener noreferrer' as const,
        title,
      }
    : {title};

  // Both <a> and <span> extend HTMLElement — narrow via intersection
  const elementRef = ref as React.Ref<HTMLAnchorElement> &
    React.Ref<HTMLSpanElement>;

  if (variant === 'number') {
    return (
      <Tag
        {...rest}
        ref={elementRef}
        role="doc-noteref"
        aria-label={`Citation ${number}: ${title}`}
        data-testid={testId}
        {...linkProps}
        {...mergeProps(
          themeProps('citation', {variant}),
          stylex.props(
            styles.number,
            href != null && styles.numberHover,
            xstyle,
          ),
          className,
          style,
        )}>
        {number}
      </Tag>
    );
  }

  return (
    <Tag
      {...rest}
      ref={elementRef}
      role="doc-noteref"
      aria-label={`Citation ${number}: ${title}`}
      data-testid={testId}
      {...linkProps}
      {...mergeProps(
        themeProps('citation', {variant}),
        stylex.props(
          styles.label,
          icon != null && styles.labelWithIcon,
          href != null && styles.labelHover,
          xstyle,
        ),
        className,
        style,
      )}>
      {icon && (
        <span {...stylex.props(styles.iconWrap)}>
          <img
            src={icon}
            alt=""
            aria-hidden="true"
            {...stylex.props(styles.icon)}
          />
        </span>
      )}
      <span {...stylex.props(styles.labelText)}>{title}</span>
    </Tag>
  );
}

Citation.displayName = 'Citation';
