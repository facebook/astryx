// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file XDSTypeaheadItem.tsx
 * @input Uses React, StyleX, XDSSearchableItem
 * @output Exports XDSTypeaheadItem component for rendering dropdown items
 * @position Presentational component; used as default renderItem in XDSBaseTypeahead
 *
 * SYNC: When modified, update:
 * - /packages/core/src/Typeahead/index.ts
 * - /packages/cli/templates/blocks/components/Typeahead/ (showcase blocks)
 */

import React, {type ReactNode} from 'react';
import * as stylex from '@stylexjs/stylex';
import {
  colorVars,
  spacingVars,
  fontWeightVars,
  typeScaleVars,
} from '../theme/tokens.stylex';
import type {XDSSearchableItem} from './types';
import type {XDSBaseProps} from '../XDSBaseProps';
import {mergeProps, xdsProps} from '../utils';

// =============================================================================
// Types
// =============================================================================

export interface XDSTypeaheadItemProps<
  T extends XDSSearchableItem = XDSSearchableItem,
> extends XDSBaseProps<HTMLDivElement> {
  ref?: React.Ref<HTMLDivElement>;
  /**
   * The search result item.
   */
  item: T;

  /**
   * Icon or avatar to display before the label.
   */
  icon?: ReactNode;

  /**
   * Description text displayed below the label.
   */
  description?: string;

  /**
   * Whether this item is disabled.
   * @default false
   */
  isDisabled?: boolean;

  /**
   * Group label for grouping items visually.
   */
  group?: string;
}

// =============================================================================
// Styles
// =============================================================================

const styles = stylex.create({
  container: {
    display: 'flex',
    alignItems: 'center',
    gap: spacingVars['--spacing-2'],
    minHeight: 0,
  },
  content: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    minWidth: 0,
  },
  label: {
    fontSize: typeScaleVars['--text-label-size'],
    lineHeight: typeScaleVars['--text-label-leading'],
    fontWeight: fontWeightVars['--font-weight-normal'],
    color: colorVars['--color-text-primary'],
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  description: {
    fontSize: typeScaleVars['--text-supporting-size'],
    lineHeight: typeScaleVars['--text-supporting-leading'],
    color: colorVars['--color-text-secondary'],
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  disabled: {
    opacity: 0.5,
  },
});

// =============================================================================
// Component
// =============================================================================

/**
 * Default item component for typeahead dropdown results.
 *
 * Renders a label with optional icon and description.
 * Exported for use in custom `renderItem` implementations.
 *
 * @example
 * ```
 * <XDSTypeahead searchSource={source} value={v} onChange={setV} label="Search" />
 * <XDSTypeahead
 *   searchSource={source}
 *   value={v}
 *   onChange={setV}
 *   label="Search"
 *   renderItem={(item) => (
 *     <XDSTypeaheadItem
 *       item={item}
 *       icon={<XDSAvatar src={item.auxiliaryData.avatar} size="sm" />}
 *       description={item.auxiliaryData.role}
 *     />
 *   )}
 * />
 * ```
 */
export function XDSTypeaheadItem<T extends XDSSearchableItem>({
  ref,
  item,
  icon,
  description,
  isDisabled = false,
}: XDSTypeaheadItemProps<T>) {
  // If item has a pre-rendered element, use it
  if (item.element) {
    return <>{item.element}</>;
  }

  return (
    <div
      ref={ref}
      {...mergeProps(
        xdsProps('typeahead-item'),
        stylex.props(styles.container, isDisabled && styles.disabled),
      )}>
      {icon}
      <div {...stylex.props(styles.content)}>
        <span {...stylex.props(styles.label)}>{item.label}</span>
        {description && (
          <span {...stylex.props(styles.description)}>{description}</span>
        )}
      </div>
    </div>
  );
}

XDSTypeaheadItem.displayName = 'XDSTypeaheadItem';
