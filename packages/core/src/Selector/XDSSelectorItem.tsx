/**
 * @file XDSSelectorItem.tsx
 * @output Exports XDSSelectorItem component for custom item rendering
 * @position Sub-component; used by XDSSelector and consumers for custom items
 */

import type {ReactNode} from 'react';
import * as stylex from '@stylexjs/stylex';
import type {StyleXStyles} from '@stylexjs/stylex';
import {XDSIcon} from '../Icon';
import type {XDSIconType} from '../Icon';
import {XDSText} from '../Text';
import {spacingVars} from '../theme/tokens.stylex';

const styles = stylex.create({
  root: {
    display: 'flex',
    alignItems: 'center',
    gap: spacingVars['--spacing-2'],
    flex: 1,
    minWidth: 0,
  },
  content: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    minWidth: 0,
  },
});

export interface XDSSelectorItemProps {
  /**
   * Icon to display before the label.
   */
  icon?: XDSIconType;

  /**
   * Primary label text.
   */
  label: ReactNode;

  /**
   * Secondary description text displayed below the label.
   */
  description?: ReactNode;

  /**
   * Additional content to render after the label/description.
   */
  children?: ReactNode;

  /**
   * StyleX styles for the root container.
   */
  xstyle?: StyleXStyles;
}

/**
 * A helper component for rendering custom selector items with consistent styling.
 *
 * Use this inside the `children` render prop of XDSSelector to create
 * custom item layouts while maintaining design system consistency.
 *
 * @example
 * ```tsx
 * <XDSSelector
 *   label="User"
 *   items={users}
 *   value={value}
 *   onChange={setValue}>
 *   {item => (
 *     <XDSSelectorItem
 *       icon={UserIcon}
 *       label={item.label}
 *       description={item.email}
 *     />
 *   )}
 * </XDSSelector>
 * ```
 */
export function XDSSelectorItem({
  icon,
  label,
  description,
  children,
  xstyle,
}: XDSSelectorItemProps) {
  return (
    <span {...stylex.props(styles.root, xstyle)}>
      {icon && <XDSIcon icon={icon} size="sm" color="secondary" />}
      <span {...stylex.props(styles.content)}>
        {typeof label === 'string' ? (
          <XDSText type="body" maxLines={1}>
            {label}
          </XDSText>
        ) : (
          label
        )}
        {description && (
          <XDSText type="supporting" maxLines={1}>
            {description}
          </XDSText>
        )}
      </span>
      {children}
    </span>
  );
}

XDSSelectorItem.displayName = 'XDSSelectorItem';
