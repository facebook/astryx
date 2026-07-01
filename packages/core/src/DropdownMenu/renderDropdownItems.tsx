// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file renderDropdownItems.tsx
 * @output Converts data-driven menu items into DropdownMenuItem components
 * @position Utility; used by DropdownMenu to unify data-driven and compound paths
 */

import type {ReactNode} from 'react';
import * as stylex from '@stylexjs/stylex';
import {Divider} from '../Divider';
import {DropdownMenuItem} from './DropdownMenuItem';
import {
  spacingVars,
  typographyVars,
  typeScaleVars,
  colorVars,
} from '../theme/tokens.stylex';
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
 * Converts data-driven items into DropdownMenuItem components,
 * so both modes share the same rendering and keyboard navigation path.
 */
export function renderDropdownItems(items: DropdownMenuOption[]): ReactNode {
  const elements: ReactNode[] = [];

  for (let i = 0; i < items.length; i++) {
    const option = items[i];

    if ('type' in option && option.type === 'divider') {
      elements.push(<Divider key={`divider-${i}`} xstyle={styles.divider} />);
    } else if ('type' in option && option.type === 'section') {
      elements.push(
        <div
          key={getSectionKey(option, i)}
          role="group"
          aria-label={option.title}>
          {option.title && (
            <div {...stylex.props(styles.sectionHeading)} aria-hidden="true">
              {option.title}
            </div>
          )}
          {option.items.map(item => (
            <DropdownMenuItem
              key={getItemKey(item)}
              icon={item.icon}
              label={item.label}
              onClick={item.onClick}
              isDisabled={item.isDisabled}
              isSelected={item.isSelected}
            />
          ))}
        </div>,
      );
    } else if (!('type' in option)) {
      elements.push(
        <DropdownMenuItem
          key={getItemKey(option)}
          icon={option.icon}
          label={option.label}
          onClick={option.onClick}
          isDisabled={option.isDisabled}
          isSelected={option.isSelected}
        />,
      );
    }
  }

  return elements;
}
