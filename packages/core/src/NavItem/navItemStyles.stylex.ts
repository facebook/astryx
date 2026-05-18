// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file navItemStyles.stylex.ts
 * @input Uses theme tokens (color, spacing, radius, typography, transition, size)
 * @output Exports shared nav item appearance styles and NavItemSize type
 * @position Shared styles consumed by SideNavItem, TopNavItem (drawer mode),
 *   TopNavMenu (drawer mode), and any custom nav items that need to match.
 *
 * Centralizes the nav item appearance (layout, colors, hover/active/selected states,
 * disabled state) so all nav-like components stay in sync — especially important
 * when TopNav items render inside MobileNav drawers alongside SideNav items.
 *
 * Individual components layer their own overrides (e.g. collapsed mode, indentation,
 * focus outlines) via stylex.props composition.
 */

export type NavItemSize = 'sm' | 'md' | 'lg';

import * as stylex from '@stylexjs/stylex';
import {
  colorVars,
  spacingVars,
  radiusVars,
  typeScaleVars,
  fontWeightVars,
  sizeVars,
} from '../theme/tokens.stylex';

/**
 * Base styles shared by all nav item components.
 * Apply as a foundation and override specific properties as needed.
 *
 * @example
 * ```
 * import {navItemStyles} from '@xds/core/navItemStyles';
 *
 * const styles = stylex.create({
 *   indented: { paddingInlineStart: spacingVars['--spacing-6'] },
 * });
 *
 * <a {...stylex.props(navItemStyles.item, styles.indented)}>
 *   Dashboard
 * </a>
 * ```
 */
export const navItemStyles = stylex.create({
  /** Base interactive nav item — layout, typography, hover/active states */
  item: {
    display: 'flex',
    alignItems: 'center',
    gap: spacingVars['--spacing-2'],
    width: '100%',
    height: sizeVars['--size-element-md'],
    paddingInline: spacingVars['--spacing-2'],
    paddingBlock: 0,
    borderRadius: radiusVars['--radius-element'],
    borderWidth: 0,
    borderStyle: 'none',
    backgroundColor: 'transparent',
    color: colorVars['--color-text-primary'],
    textDecoration: 'none',
    cursor: 'pointer',
    fontFamily: 'inherit',
    fontSize: typeScaleVars['--text-label-size'],
    fontWeight: fontWeightVars['--font-weight-normal'],
    lineHeight: typeScaleVars['--text-label-leading'],
    textAlign: 'start',
    boxSizing: 'border-box',
    ':hover': {
      '@media (hover: hover)': {
        backgroundColor: colorVars['--color-overlay-hover'],
      },
    },
    ':active': {
      backgroundColor: colorVars['--color-overlay-pressed'],
    },
  },

  /** Selected/active page indicator — deemphasized background, medium weight */
  selected: {
    backgroundColor: colorVars['--color-neutral'],
    fontWeight: fontWeightVars['--font-weight-medium'],
    ':hover': {
      '@media (hover: hover)': {
        backgroundColor: colorVars['--color-neutral'],
      },
    },
    ':active': {
      backgroundColor: colorVars['--color-neutral'],
    },
  },

  /** Disabled state — muted color, no interaction */
  disabled: {
    color: colorVars['--color-text-disabled'],
    cursor: 'not-allowed',
    pointerEvents: 'none' as const,
  },

  /** Small size variant */
  sm: {
    height: sizeVars['--size-element-sm'],
    paddingInline: spacingVars['--spacing-1'],
  },

  /** Medium size variant (default) */
  md: {
    height: sizeVars['--size-element-md'],
    paddingInline: spacingVars['--spacing-2'],
  },

  /** Large size variant */
  lg: {
    height: sizeVars['--size-element-lg'],
    paddingInline: spacingVars['--spacing-2'],
  },
});
