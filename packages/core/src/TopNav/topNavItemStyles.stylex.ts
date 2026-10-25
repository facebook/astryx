// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file topNavItemStyles.stylex.ts
 * @input Uses StyleX and theme tokens
 * @output Exports topNavItemStyles and getTopNavItemRootProps
 * @position Server-safe styles of a TopNavItem in the horizontal bar. Shared
 *   by the client TopNavItem (TopNavItem.tsx) and the server shell
 *   (TopNavItemShell.tsx), so both render the same item.
 *
 * SYNC: When modified, update TopNavItem.tsx and TopNavItemShell.tsx.
 */

import * as stylex from '@stylexjs/stylex';
import type {StyleXStyles} from '@stylexjs/stylex';
import type {CSSProperties} from 'react';
import {mergeProps} from '../utils';
import {themeProps} from '../utils/themeProps';
import {focusOutlineProps} from '../utils/focusOutline.stylex';
import {interactionOverlayStyles} from '../utils/interactionOverlay.stylex';
import {
  colorVars,
  spacingVars,
  radiusVars,
  durationVars,
  easeVars,
  fontWeightVars,
  typeScaleVars,
} from '../theme/tokens.stylex';

/**
 * NavItem styles with hover/selected states
 */
export const topNavItemStyles = stylex.create({
  base: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: spacingVars['--spacing-2'],
    paddingBlock: spacingVars['--spacing-1-5'],
    paddingInline: spacingVars['--spacing-3'],
    borderRadius: radiusVars['--radius-element'],
    fontSize: typeScaleVars['--text-label-size'],
    lineHeight: typeScaleVars['--text-label-leading'],
    fontWeight: fontWeightVars['--font-weight-medium'],
    color: colorVars['--color-text-secondary'],
    textDecoration: 'none',
    cursor: {
      default: 'pointer',
      ':is(:disabled,[aria-disabled="true"])': 'default',
    },
    transitionProperty: 'background-color, color',
    transitionDuration: durationVars['--duration-fast'],
    transitionTimingFunction: easeVars['--ease-standard'],
  },
  selected: {
    color: colorVars['--color-text-primary'],
    fontWeight: fontWeightVars['--font-weight-semibold'],
    backgroundColor: {
      default: colorVars['--color-neutral'],
      ':hover:where(:not(:disabled,[aria-disabled="true"]))': {
        '@media (hover: hover)': colorVars['--color-neutral'],
      },
      ':active': colorVars['--color-neutral'],
      // The touch press model writes these instead of `:active`; the selected
      // item keeps its fill under a finger the way it does under a mouse, and
      // paints no overlay at any phase of the press.
      '[data-astryx-press="on"]': colorVars['--color-neutral'],
      '[data-astryx-press="fading"]': colorVars['--color-neutral'],
    },
    backgroundImage: {
      default: null,
      '[data-astryx-press="on"]': 'none',
      '[data-astryx-press="fading"]': 'none',
    },
  },
  iconOnly: {
    paddingInline: spacingVars['--spacing-2'],
  },
  // Drawer mode — focus outline (base item + selected come from navItemStyles)
});

/**
 * A horizontal item's `className`, `style` and theme attributes, for the
 * server shell. TopNavItem.tsx composes the same parts inline (its
 * `themeProps('top-nav-item', …)` call is what tooling reads to map the
 * target to TopNavItem); TopNavShell.test.tsx holds the two equal.
 */
export function getTopNavItemRootProps({
  isSelected,
  disabledXstyle,
  isIconOnly,
  xstyle,
  className,
  style,
}: {
  isSelected: boolean;
  /** The shared NavItem disabled style when disabled, else false. */
  disabledXstyle: StyleXStyles | false;
  isIconOnly: boolean;
  xstyle: StyleXStyles | undefined;
  className: string | undefined;
  style: CSSProperties | undefined;
}) {
  return mergeProps(
    themeProps('top-nav-item', {
      selected: isSelected ? 'selected' : null,
    }),
    focusOutlineProps.focusVisible(
      topNavItemStyles.base,
      interactionOverlayStyles.backgroundColor,
      isSelected && topNavItemStyles.selected,
      disabledXstyle,
      isIconOnly && topNavItemStyles.iconOnly,
      xstyle,
    ),
    className,
    style,
  );
}
