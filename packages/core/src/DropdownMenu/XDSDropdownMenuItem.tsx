/**
 * @file XDSDropdownMenuItem.tsx
 * @output Exports XDSDropdownMenuItem component for custom item rendering
 * @position Sub-component; used by XDSDropdownMenu and consumers for custom items
 *
 * SYNC: When modified, update:
 * - /packages/core/src/DropdownMenu/README.md
 * - /packages/core/src/DropdownMenu/index.ts
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

export interface XDSDropdownMenuItemProps {
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
 * A helper component for rendering custom dropdown menu items with consistent styling.
 *
 * Use this inside the `children` render prop of XDSDropdownMenu to create
 * custom item layouts while maintaining design system consistency.
 *
 * @example
 * ```tsx
 * <XDSDropdownMenu
 *   button={{ label: 'Actions' }}
 *   items={actions}>
 *   {item => (
 *     <XDSDropdownMenuItem
 *       icon={item.icon}
 *       label={item.label}
 *       description={item.description}
 *     />
 *   )}
 * </XDSDropdownMenu>
 * ```
 */
export function XDSDropdownMenuItem({
  icon,
  label,
  description,
  children,
  xstyle,
}: XDSDropdownMenuItemProps) {
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

XDSDropdownMenuItem.displayName = 'XDSDropdownMenuItem';
