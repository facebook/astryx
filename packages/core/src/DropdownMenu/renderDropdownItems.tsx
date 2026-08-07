// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file renderDropdownItems.tsx
 * @output Converts data-driven menu items into DropdownMenuItem components
 * @position Utility; used by DropdownMenu to unify data-driven and compound paths
 */

import type {ReactElement, ReactNode} from 'react';
import * as stylex from '@stylexjs/stylex';
import {Divider} from '../Divider';
import {DropdownMenuItem} from './DropdownMenuItem';
import {DropdownMenuSubMenu} from './DropdownMenuSubMenu';
import {
  spacingVars,
  typographyVars,
  typeScaleVars,
  colorVars,
} from '../theme/tokens.stylex';
import {mergeProps, themeProps} from '../utils';
import type {
  DropdownMenuItemData,
  DropdownMenuOption,
  DropdownMenuSection,
} from './DropdownMenu';

const styles = stylex.create({
  sectionHeading: {
    paddingBlock: spacingVars['--spacing-1'],
    paddingInline: spacingVars['--spacing-2'],
    fontFamily: typographyVars['--font-family-body'],
    fontSize: typeScaleVars['--text-supporting-size'],
    lineHeight: typeScaleVars['--text-supporting-leading'],
    color: colorVars['--color-text-secondary'],
    userSelect: 'none',
  },
  divider: {
    marginBlock: spacingVars['--spacing-1'],
  },
});

function getItemKey(item: DropdownMenuItemData): string {
  return `item-${item.label}`;
}

function getSectionKey(section: DropdownMenuSection, index: number): string {
  return `section-${section.title ?? index}`;
}

/**
 * Renders one leaf row as a `DropdownMenuItem`.
 *
 * `items` is stripped because it selects the submenu shape rather than being an
 * item prop; every other field of `DropdownMenuItemData` is a
 * `DropdownMenuItem` prop by construction (the type is `Pick`ed from
 * `DropdownMenuItemProps`), so the data path forwards them wholesale and can't
 * silently drop a field the data API advertises.
 */
function renderLeafItem(item: DropdownMenuItemData): ReactElement {
  const {items: _submenuItems, ...itemProps} = item;
  return <DropdownMenuItem key={getItemKey(item)} {...itemProps} />;
}

/**
 * Converts data-driven items into DropdownMenuItem components,
 * so both modes share the same rendering and keyboard navigation path.
 */
export function renderDropdownItems(items: DropdownMenuOption[]): ReactNode {
  const elements: ReactNode[] = [];

  for (let i = 0; i < items.length; i++) {
    const option = items[i];

    if ('type' in option && option.type === 'divider') {
      elements.push(
        <Divider
          key={`divider-${i}`}
          xstyle={styles.divider}
          {...themeProps('dropdown-menu-divider')}
        />,
      );
    } else if ('type' in option && option.type === 'section') {
      elements.push(
        <div
          key={getSectionKey(option, i)}
          role="group"
          aria-label={option.title}>
          {option.title && (
            <div
              aria-hidden="true"
              {...mergeProps(
                themeProps('dropdown-menu-section-heading'),
                stylex.props(styles.sectionHeading),
              )}>
              {option.title}
            </div>
          )}
          {option.items.map(renderLeafItem)}
        </div>,
      );
    } else if (!('type' in option)) {
      // A plain item that declares nested `items` becomes a submenu (data-mode
      // parity with the compound DropdownMenuSubMenu API); otherwise it's a
      // leaf. renderDropdownItems owns the recursion and hands the rendered
      // children to DropdownMenuSubMenu — so DropdownMenuSubMenu never imports
      // this module back (no import cycle).
      if (option.items && option.items.length > 0) {
        elements.push(
          <DropdownMenuSubMenu
            key={getItemKey(option)}
            icon={option.icon}
            label={option.label}
            isDisabled={option.isDisabled}>
            {renderDropdownItems(option.items)}
          </DropdownMenuSubMenu>,
        );
      } else {
        elements.push(renderLeafItem(option));
      }
    }
  }

  return elements;
}
