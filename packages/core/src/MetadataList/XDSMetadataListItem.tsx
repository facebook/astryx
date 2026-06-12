// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file XDSMetadataListItem.tsx
 * @input Uses React, ReactNode, StyleXStyles, theme tokens, XDSMetadataListContext
 * @output Exports XDSMetadataListItem component, XDSMetadataListItemProps type
 * @position Core implementation; consumed by XDSMetadataList, index.ts
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/MetadataList/MetadataList.doc.mjs
 * - /packages/core/src/MetadataList/XDSMetadataList.test.tsx
 * - /packages/core/src/MetadataList/index.ts
 * - /apps/storybook/stories/MetadataList.stories.tsx
 * - /packages/cli/templates/blocks/components/MetadataList/ (showcase blocks)
 */

import {use, type ReactNode} from 'react';
import * as stylex from '@stylexjs/stylex';
import {
  colorVars,
  spacingVars,
  typeScaleVars,
  fontWeightVars,
} from '../theme/tokens.stylex';
import {XDSMetadataListContext} from './XDSMetadataListContext';
import type {XDSBaseProps} from '../XDSBaseProps';
import {mergeProps, xdsProps} from '../utils';

// =============================================================================
// Types
// =============================================================================

export interface XDSMetadataListItemProps extends XDSBaseProps<HTMLDivElement> {
  /** Ref forwarded to the root element */
  ref?: React.Ref<HTMLDivElement>;
  /**
   * Content value for this metadata item.
   */
  children: ReactNode;
  /**
   * Icon rendered before the label text.
   */
  icon?: ReactNode;
  /**
   * Label text for this metadata item.
   */
  label: string;
  /**
   * Test ID for testing frameworks.
   */
  'data-testid'?: string;
}

// =============================================================================
// Styles
// =============================================================================

const styles = stylex.create({
  // Label (dt) — inline (side-by-side with value)
  label: {
    color: colorVars['--color-text-secondary'],
    fontSize: typeScaleVars['--text-body-size'],
    lineHeight: typeScaleVars['--text-body-leading'],
    fontWeight: fontWeightVars['--font-weight-medium'],
    display: 'flex',
    alignItems: 'center',
    gap: spacingVars['--spacing-2'],
    margin: 0,
    padding: 0,
    minHeight: 24,
    wordBreak: 'break-word',
  },
  // Value (dd) — inline
  value: {
    color: colorVars['--color-text-primary'],
    fontSize: typeScaleVars['--text-body-size'],
    lineHeight: typeScaleVars['--text-body-leading'],
    margin: 0,
    padding: 0,
    minHeight: 24,
    wordBreak: 'break-word',
  },
  // Stacked layout wrapper (label on top)
  stackedWrapper: {
    display: 'flex',
    flexDirection: 'column',
    gap: spacingVars['--spacing-0-5'],
  },
  // Stacked label
  stackedLabel: {
    color: colorVars['--color-text-secondary'],
    fontSize: typeScaleVars['--text-body-size'],
    lineHeight: typeScaleVars['--text-body-leading'],
    fontWeight: fontWeightVars['--font-weight-medium'],
    display: 'flex',
    alignItems: 'center',
    gap: spacingVars['--spacing-2'],
    margin: 0,
    padding: 0,
  },
  stackedValue: {
    color: colorVars['--color-text-primary'],
    fontSize: typeScaleVars['--text-body-size'],
    lineHeight: typeScaleVars['--text-body-leading'],
    margin: 0,
    padding: 0,
    wordBreak: 'break-word',
  },
  iconWrapper: {
    display: 'inline-flex',
    alignItems: 'center',
    flexShrink: 0,
    color: colorVars['--color-text-secondary'],
  },
});

// =============================================================================
// Component
// =============================================================================

/**
 * A single labeled metadata value within an XDSMetadataList.
 *
 * Renders a `<dt>` / `<dd>` pair. Layout (side-by-side or stacked) is
 * determined by the parent XDSMetadataList's label configuration.
 *
 * @example
 * ```
 * <XDSMetadataListItem label="Status">Active</XDSMetadataListItem>
 * <XDSMetadataListItem label="Created" icon={<CalendarIcon />}>
 *   January 1, 2023
 * </XDSMetadataListItem>
 * ```
 */
export function XDSMetadataListItem({
  children,
  icon,
  label,
  xstyle,
  className,
  style,
  'data-testid': testId,
  ref,
}: XDSMetadataListItemProps) {
  const ctx = use(XDSMetadataListContext);
  const labelPosition = ctx?.labelConfig.position ?? 'start';
  const isStacked =
    labelPosition === 'top' || ctx?.orientation === 'horizontal';

  const labelContent = (
    <>
      {icon != null && (
        <span {...stylex.props(styles.iconWrapper)}>{icon}</span>
      )}
      {label}
    </>
  );

  // Stacked layout: label above content, wrapped in a div
  if (isStacked) {
    return (
      <div
        ref={ref}
        data-testid={testId}
        {...mergeProps(
          xdsProps('metadata-list-item'),
          stylex.props(styles.stackedWrapper, xstyle),
          className,
          style,
        )}>
        <dt {...stylex.props(styles.stackedLabel)}>{labelContent}</dt>
        <dd {...stylex.props(styles.stackedValue)}>{children}</dd>
      </div>
    );
  }

  // Inline layout: dt and dd are direct grid children
  return (
    <>
      <dt
        ref={ref}
        data-testid={testId ? `${testId}-label` : undefined}
        {...mergeProps(
          xdsProps('metadata-list-item'),
          stylex.props(styles.label, xstyle),
          className,
          style,
        )}>
        {labelContent}
      </dt>
      <dd
        data-testid={testId ? `${testId}-value` : undefined}
        {...stylex.props(styles.value)}>
        {children}
      </dd>
    </>
  );
}

XDSMetadataListItem.displayName = 'XDSMetadataListItem';
