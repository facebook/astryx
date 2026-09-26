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
import {usePressFeedback} from '../hooks/usePressFeedback';

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
      // A mouse press. Under a coarse pointer `:active` is not a press (it
      // paints on the touch and outlives a scroll), so it is dropped there and
      // the touch press model paints instead: it writes `data-pressed` on the
      // row, and the `background-image` arm of Item's shared overlay (which
      // this colour rule leaves in place) answers it. See
      // interactionOverlay.stylex.ts.
      ':active:where(:not(:disabled,[aria-disabled="true"]))': {
        default: colorVars['--color-overlay-pressed'],
        '@media (pointer: coarse)': 'transparent',
      },
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
  /**
   * Destination for a navigation row. The row renders as a real link
   * (`<a role="menuitem">`, through the LinkProvider's component), so a
   * modifier or middle click opens it in a new tab, the address shows in the
   * status bar and can be copied, and a plain click navigates and closes the
   * menu. `onClick` still fires first. A disabled row keeps its element but
   * drops the address.
   */
  href?: string;
  /** Link target, e.g. '_blank'. Only used with `href`. */
  target?: '_blank' | '_self';
  /**
   * Link relationship. Automatically includes noopener noreferrer when target
   * is '_blank'. Only used with `href`.
   */
  rel?: string;
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
  href,
  target,
  rel,
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
  // Item marks itself as a pressable surface too; naming the row here as well
  // keeps this file's own press arms (above) verifiably reachable by the
  // touch press controller (pressableCoverage.test.ts).
  const pressable = usePressFeedback();

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
      href={href}
      target={target}
      rel={rel}
      tabIndex={isDisabled ? undefined : -1}
      onPointerMove={handlePointerMove}
      {...pressable}
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
