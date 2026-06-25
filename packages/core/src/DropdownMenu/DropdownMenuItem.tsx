// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file DropdownMenuItem.tsx
 * @output Exports DropdownMenuItem component
 * @position Sub-component; used inside DropdownMenu
 *
 * Interactive menu item with role="menuitem". Keyboard navigation
 * is handled by useListFocus on the parent menu container.
 *
 * Composes Item for the shared start content + label + description + end content layout.
 * Passes role="menuitem" so Item puts onClick on the root div instead of
 * creating an invisible button (keyboard access is provided by the parent menu).
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/DropdownMenu/DropdownMenu.doc.mjs
 * - /packages/core/src/DropdownMenu/DropdownMenuItem.doc.mjs
 * - /packages/core/src/DropdownMenu/DropdownMenu.test.tsx
 * - /packages/core/src/DropdownMenu/index.ts
 * - /apps/storybook/stories/DropdownMenu.stories.tsx
 * - /packages/cli/templates/blocks/components/DropdownMenu/ (showcase blocks)
 */

import {useCallback, type ReactNode} from 'react';
import * as stylex from '@stylexjs/stylex';
import type {StyleXStyles} from '@stylexjs/stylex';
import {renderIconSlot, type IconType} from '../Icon';
import {Item} from '../Item';
import {
  colorVars,
  spacingVars,
  typographyVars,
  typeScaleVars,
} from '../theme/tokens.stylex';
import {mergeProps} from '../utils';
import {useDropdownMenuContext} from './DropdownMenuContext';
import {themeProps} from '../utils/themeProps';

const menuItemStyles = stylex.create({
  root: {
    boxSizing: 'border-box',
    width: '100%',
    paddingBlock: spacingVars['--spacing-2'],
    paddingInline: spacingVars['--spacing-2'],
    borderRadius: `max(0px, calc(var(--_dropdown-menu-radius, ${spacingVars['--spacing-2']}) - var(--_dropdown-menu-padding, ${spacingVars['--spacing-1']})))`,
    fontFamily: typographyVars['--font-family-body'],
    fontSize: typeScaleVars['--text-label-size'],
    color: colorVars['--color-text-primary'],
    backgroundColor: {
      default: 'transparent',
      ':focus': colorVars['--color-overlay-hover'],
      ':hover': colorVars['--color-overlay-hover'],
    },
    border: 'none',
    cursor: 'pointer',
    textAlign: 'left',
    outline: 'none',
  },
  disabled: {
    opacity: 0.5,
    cursor: 'not-allowed',
  },
});

const itemSizeStyles = stylex.create({
  sm: {
    paddingBlock: spacingVars['--spacing-1'],
    paddingInline: spacingVars['--spacing-2'],
  },
  md: {
    paddingBlock: spacingVars['--spacing-1-5'],
  },
  lg: {},
});

export interface DropdownMenuItemProps {
  /** Icon to display before the label. */
  icon?: ReactNode | IconType;
  /** Primary label text. */
  label: ReactNode;
  /** Secondary description text displayed below the label. */
  description?: ReactNode;
  /** Callback when the item is selected. */
  onClick?: () => void;
  /** Whether the item is disabled. @default false */
  isDisabled?: boolean;
  /** Additional content to render after the label/description. */
  endContent?: ReactNode;
  /**
   * StyleX styles for layout customization (margins, positioning, sizing).
   * Must be a `stylex.create()` value — not an inline style object.
   *
   * @example
   * ```
   * const styles = stylex.create({ wrapper: { marginTop: 8 } });
   * <DropdownMenuItem xstyle={styles.wrapper} />
   * ```
   */
  xstyle?: StyleXStyles;
  /** CSS class name(s) appended to the root element. */
  className?: string;
  /** Inline styles applied to the root element. */
  style?: React.CSSProperties;
}

/**
 * An interactive dropdown menu item with icon, label, and optional description.
 *
 * Must be used inside DropdownMenu. Keyboard navigation is provided
 * automatically by the parent via useListFocus.
 *
 * @example
 * ```
 * <DropdownMenu button={{ label: 'Actions' }}>
 *   <DropdownMenuItem icon={PencilIcon} label="Edit" onClick={handleEdit} />
 *   <DropdownMenuItem label="Delete" endContent={<Badge label="⌘D" />} onClick={handleDelete} />
 * </DropdownMenu>
 * ```
 */
export function DropdownMenuItem({
  icon,
  label,
  description,
  onClick,
  isDisabled = false,
  endContent,
  xstyle,
  className,
  style,
}: DropdownMenuItemProps) {
  const ctx = useDropdownMenuContext();
  const menuSize = ctx?.menuSize ?? 'md';

  const handleClick = useCallback(() => {
    if (isDisabled || !onClick) {
      return;
    }
    onClick();
    ctx?.closeMenu();
  }, [isDisabled, onClick, ctx]);

  return (
    <Item
      role="menuitem"
      tabIndex={isDisabled ? undefined : -1}
      startContent={
        icon
          ? renderIconSlot(icon, {size: 'sm', color: 'secondary'})
          : undefined
      }
      label={label}
      description={description}
      endContent={endContent}
      onClick={handleClick}
      isDisabled={isDisabled}
      xstyle={[
        menuItemStyles.root,
        itemSizeStyles[menuSize],
        isDisabled && menuItemStyles.disabled,
        xstyle,
      ]}
      {...mergeProps(themeProps('dropdown-menu-item', {size: menuSize}), {
        className,
        style,
      })}
    />
  );
}

DropdownMenuItem.displayName = 'DropdownMenuItem';
