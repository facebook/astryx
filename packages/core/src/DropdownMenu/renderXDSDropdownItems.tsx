// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file renderXDSDropdownItems.tsx
 * @output Converts data-driven menu items into XDSDropdownMenuItem components
 * @position Utility; used by XDSDropdownMenu to unify data-driven and compound paths
 */

import {type ReactNode} from 'react';
import * as stylex from '@stylexjs/stylex';
import {XDSDivider} from '../Divider';
import {XDSDropdownMenuItem} from './XDSDropdownMenuItem';
import {
  spacingVars,
  typographyVars,
  typeScaleVars,
  colorVars,
} from '../theme/tokens.stylex';
import type {
  XDSDropdownMenuOption,
  XDSDropdownMenuItemData,
} from './XDSDropdownMenu';

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

/**
 * Converts data-driven items into XDSDropdownMenuItem components,
 * so both modes share the same rendering and keyboard navigation path.
 */
export function renderXDSDropdownItems(
  items: XDSDropdownMenuOption[],
): ReactNode {
  const elements: ReactNode[] = [];

  for (let i = 0; i < items.length; i++) {
    const option = items[i];

    if ('type' in option && option.type === 'divider') {
      elements.push(
        <XDSDivider key={`divider-${i}`} xstyle={styles.divider} />,
      );
    } else if ('type' in option && option.type === 'section') {
      elements.push(
        <div key={`section-${i}`} role="group" aria-label={option.title}>
          {option.title && (
            <div {...stylex.props(styles.sectionHeading)} aria-hidden="true">
              {option.title}
            </div>
          )}
          {option.items.map((item, j) => (
            <XDSDropdownMenuItem
              key={`${item.label}-${j}`}
              icon={item.icon}
              label={item.label}
              onClick={item.onClick}
              isDisabled={item.isDisabled}
            />
          ))}
        </div>,
      );
    } else if (!('type' in option)) {
      elements.push(
        <XDSDropdownMenuItem
          key={`${option.label}-${i}`}
          icon={option.icon}
          label={option.label}
          onClick={option.onClick}
          isDisabled={option.isDisabled}
        />,
      );
    }
  }

  return elements;
}
