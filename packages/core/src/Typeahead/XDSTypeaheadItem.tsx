/**
 * @file XDSTypeaheadItem.tsx
 * @input Uses React, StyleX, XDSSearchableItem
 * @output Exports XDSTypeaheadItem component for rendering dropdown items
 * @position Presentational component; used as default renderItem in XDSBaseTypeahead
 *
 * SYNC: When modified, update:
 * - /packages/core/src/Typeahead/README.md
 * - /packages/core/src/Typeahead/index.ts
 */

import type {ReactNode} from 'react';
import * as stylex from '@stylexjs/stylex';
import {
  colorVars,
  spacingVars,
  textSizeVars,
  lineHeightVars,
  fontWeightVars,
} from '../theme/tokens.stylex';
import type {XDSSearchableItem} from './types';

// =============================================================================
// Types
// =============================================================================

export interface XDSTypeaheadItemProps<
  T extends XDSSearchableItem = XDSSearchableItem,
> {
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
    fontSize: textSizeVars['--text-base'],
    lineHeight: lineHeightVars['--leading-base'],
    fontWeight: fontWeightVars['--font-weight-normal'],
    color: colorVars['--color-text-primary'],
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  description: {
    fontSize: textSizeVars['--text-xsm'],
    lineHeight: lineHeightVars['--leading-snug'],
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
 * ```tsx
 * // Default usage (automatic)
 * <XDSTypeahead searchSource={source} value={v} onChange={setV} label="Search" />
 *
 * // Custom renderItem using XDSTypeaheadItem
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
    <div {...stylex.props(styles.container, isDisabled && styles.disabled)}>
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
