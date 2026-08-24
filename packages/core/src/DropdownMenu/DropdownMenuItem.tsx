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
 * - /packages/cli/assets/templates/blocks/components/DropdownMenu/ (showcase blocks)
 */

import {useCallback, type PointerEvent, type ReactNode} from 'react';
import * as stylex from '@stylexjs/stylex';
import {renderIconSlot, type IconType} from '../Icon';
import {Item} from '../Item';
import {
  colorVars,
  spacingVars,
  typographyVars,
  typeScaleVars,
} from '../theme/tokens.stylex';
import {mergeProps} from '../utils';
import type {BaseProps} from '../BaseProps';
import {useDropdownMenuContext} from './DropdownMenuContext';
import {focusMenuItemOnHover} from './menuItemHover';
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
    },
    border: 'none',
    cursor: {
      default: 'pointer',
      ':is(:disabled,[aria-disabled="true"])': 'default',
    },
    textAlign: 'start',
    outline: 'none',
  },
  disabled: {
    opacity: 0.5,
    cursor: 'default',
  },
  destructive: {
    // Only recolor the text/icon; the hover / focus background stays the shared
    // neutral overlay from `root` so the hover state matches every other menu
    // item. The root color covers the label/description via the Item custom
    // properties (and any bare text). Semantic error tokens keep it theme-aware.
    color: colorVars['--color-error'],
    '--_item-label-color': colorVars['--color-error'],
    '--_item-description-color': colorVars['--color-error'],
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

export interface DropdownMenuItemProps extends Pick<
  BaseProps,
  'xstyle' | 'className' | 'style'
> {
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
   * Whether activating the item closes the menu. Set `false` for an action
   * that reports its result on the item itself (a copy row swapping to
   * "Copied"), matching the checkbox and radio items, which already decide
   * this for themselves.
   * @default true
   */
  hasCloseOnSelect?: boolean;
  /**
   * Visual variant. `'destructive'` renders the label, description, and icon in
   * the error color for dangerous actions (e.g. Delete). @default 'default'
   */
  variant?: 'default' | 'destructive';
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
 *   <DropdownMenuItem label="Delete" variant="destructive" onClick={handleDelete} />
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
  hasCloseOnSelect = true,
  variant = 'default',
  xstyle,
  className,
  style,
}: DropdownMenuItemProps) {
  const ctx = useDropdownMenuContext();
  const menuSize = ctx?.menuSize ?? 'md';

  const handleClick = useCallback(() => {
    if (isDisabled) {
      return;
    }
    onClick?.();
    if (hasCloseOnSelect) {
      ctx?.closeMenu();
    }
  }, [isDisabled, onClick, hasCloseOnSelect, ctx]);

  const handlePointerMove = useCallback(
    (e: PointerEvent<HTMLElement>) => focusMenuItemOnHover(e, isDisabled),
    [isDisabled],
  );

  const isDestructive = variant === 'destructive';

  return (
    <Item
      role="menuitem"
      tabIndex={isDisabled ? undefined : -1}
      onPointerMove={handlePointerMove}
      startContent={
        icon
          ? renderIconSlot(icon, {
              size: 'sm',
              color: isDestructive ? 'error' : 'secondary',
            })
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
        isDestructive && menuItemStyles.destructive,
        isDisabled && menuItemStyles.disabled,
        xstyle,
      ]}
      {...mergeProps(
        themeProps('dropdown-menu-item', {
          size: menuSize,
          variant: isDestructive ? 'destructive' : null,
        }),
        {
          className,
          style,
        },
      )}
    />
  );
}

DropdownMenuItem.displayName = 'DropdownMenuItem';
