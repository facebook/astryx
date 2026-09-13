// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file MenuBottomSheetActionList.tsx
 * @input Uses menu data entries and callbacks for selection and drill-in
 * @output Internal touch-friendly action list shared by DropdownMenu and ContextMenu
 * @position Shared implementation for menu bottom-sheet presentations
 */

import type {ReactElement} from 'react';
import * as stylex from '@stylexjs/stylex';
import {Divider} from '../Divider';
import {Heading} from '../Heading';
import {Icon, renderIconSlot} from '../Icon';
import {List, ListItem} from '../List';
import {colorVars, spacingVars} from '../theme/tokens.stylex';
import {rtlStyles} from '../utils';
import {getInteractionModality} from '../utils/interactionModality';
import type {DropdownMenuItemData, DropdownMenuOption} from './DropdownMenu';

const styles = stylex.create({
  destructiveAction: {
    '--_item-label-color': colorVars['--color-error'],
    '--_item-description-color': colorVars['--color-error'],
    color: colorVars['--color-error'],
  },
  structuralItem: {
    listStyleType: 'none',
  },
  divider: {
    marginBlock: spacingVars['--spacing-1'],
  },
  section: {
    display: 'flex',
    flexDirection: 'column',
    gap: spacingVars['--spacing-1'],
  },
});

function getItemKey(item: DropdownMenuItemData, index: number): string {
  return `item-${item.id ?? index}`;
}

export function MenuBottomSheetActionList({
  items,
  onSelect,
  onOpenSubmenu,
}: {
  items: DropdownMenuOption[];
  onSelect: (item: DropdownMenuItemData) => void;
  onOpenSubmenu: (item: DropdownMenuItemData) => void;
}) {
  const renderItem = (
    item: DropdownMenuItemData,
    index: number,
  ): ReactElement => {
    const isSubmenu = item.items != null && item.items.length > 0;
    const isDestructive = item.variant === 'destructive';

    return (
      <ListItem
        key={getItemKey(item, index)}
        label={item.label}
        description={item.description}
        startContent={
          item.icon
            ? renderIconSlot(item.icon, {
                size: 'sm',
                color: isDestructive ? 'error' : 'secondary',
              })
            : undefined
        }
        endContent={
          isSubmenu ? (
            <Icon
              icon="chevronRight"
              size="sm"
              color="secondary"
              xstyle={rtlStyles.mirror}
            />
          ) : (
            item.endContent
          )
        }
        isDisabled={item.isDisabled}
        onClick={event => {
          if (getInteractionModality() === 'pointer') {
            (event.currentTarget as HTMLElement).blur();
          }
          if (isSubmenu) {
            onOpenSubmenu(item);
          } else {
            onSelect(item);
          }
        }}
        xstyle={isDestructive && styles.destructiveAction}
      />
    );
  };

  return (
    <List density="spacious">
      {items.map((option, index) => {
        if ('type' in option && option.type === 'divider') {
          return (
            <li
              // eslint-disable-next-line @eslint-react/no-array-index-key
              key={`divider-${index}`}
              role="presentation"
              {...stylex.props(styles.structuralItem)}>
              <Divider xstyle={styles.divider} />
            </li>
          );
        }

        if ('type' in option && option.type === 'section') {
          return (
            <li
              key={`section-${option.id ?? index}`}
              role="presentation"
              {...stylex.props(styles.structuralItem)}>
              <div
                role="group"
                aria-label={option.title}
                {...stylex.props(styles.section)}>
                {option.title && <Heading level={4}>{option.title}</Heading>}
                <List density="spacious">{option.items.map(renderItem)}</List>
              </div>
            </li>
          );
        }

        return renderItem(option, index);
      })}
    </List>
  );
}

MenuBottomSheetActionList.displayName = 'MenuBottomSheetActionList';
