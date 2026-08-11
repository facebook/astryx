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
 * Individual components layer their own overrides (e.g. collapsed mode,
 * indentation) via stylex.props composition.
 *
 * **The focus ring is deliberately not defined here.** It is one shared
 * definition for the whole library, in `utils/focusOutline.stylex.ts` (#4654),
 * and a nav item consumes it the way every other component does — by composing
 * it at the call site:
 *
 * ```
 * <a {...focusOutlineProps.focusVisible(navItemStyles.item, navItemStyles[size])}>
 * ```
 *
 * Writing the ring into `item` instead would mean restating the outline
 * longhands in this file, which is the sixth duplicate #4654 exists to remove;
 * it would also put a ring on the split-action *row*, which is a container
 * whose children hold the focus. Compose the helper on whichever element
 * actually takes focus.
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
 * import {navItemStyles} from '@astryxdesign/core/navItemStyles';
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
    // `--color-neutral` is a background, and under `forced-colors: active` the
    // OS flattens backgrounds to Canvas — the selected row resolved to a 6%
    // alpha of the canvas colour over the canvas itself, i.e. nothing. With no
    // fill, and a weight difference the OS palette cannot express, the current
    // page was indistinguishable from every other row (A14).
    //
    // Highlight/HighlightText is the platform convention for a selected item,
    // the same pair ToggleButton and SegmentedControlItem use. Unlike those
    // two this does NOT need `forced-color-adjust: none`: they are native
    // form controls whose UA colours outrank the authored fill, while a nav
    // row resets `appearance` and paints its own background, so the system
    // keywords land — measured on both the `<a>` and the `<button>` render
    // path. Leaving the adjust alone matters, because it inherits: with it
    // set, a Badge in `endContent` would keep its authored fill instead of
    // being remapped to the user's palette.
    backgroundColor: {
      default: colorVars['--color-neutral'],
      '@media (forced-colors: active)': 'Highlight',
    },
    color: {
      default: null,
      '@media (forced-colors: active)': 'HighlightText',
    },
    fontWeight: fontWeightVars['--font-weight-medium'],
    ':hover': {
      '@media (hover: hover)': {
        backgroundColor: {
          default: colorVars['--color-neutral'],
          // Nested inside the hover media query rather than written as a
          // sibling `(hover: hover) and (forced-colors: active)` block: as
          // siblings the two are separate atomic rules of equal specificity
          // and `item`'s own hover overlay won on source order, so hovering
          // the current page erased its Highlight fill.
          '@media (forced-colors: active)': 'Highlight',
        },
      },
    },
    ':active': {
      backgroundColor: {
        default: colorVars['--color-neutral'],
        '@media (forced-colors: active)': 'Highlight',
      },
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
