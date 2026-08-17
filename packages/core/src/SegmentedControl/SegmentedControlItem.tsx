// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file SegmentedControlItem.tsx
 * @input Uses React, StyleX, SegmentedControlContext
 * @output Exports SegmentedControlItem component and SegmentedControlItemProps type
 * @position Child item; renders as a radio button within the segmented control
 *
 * SYNC: When modified, update:
 * - /packages/core/src/SegmentedControl/SegmentedControl.doc.mjs
 * - /packages/core/src/SegmentedControl/index.ts
 * - /packages/core/src/SegmentedControl/SegmentedControl.test.tsx
 * - /packages/cli/assets/templates/blocks/components/SegmentedControl/ (showcase blocks)
 */

import React, {type ReactNode} from 'react';
import * as stylex from '@stylexjs/stylex';
import {
  colorVars,
  spacingVars,
  sizeVars,
  durationVars,
  easeVars,
  fontWeightVars,
  shadowVars,
  typeScaleVars,
} from '../theme/tokens.stylex';
import {useSegmentedControlContext} from './SegmentedControlContext';
import type {SegmentedControlSize} from './SegmentedControlContext';
import {mergeProps, composeEventHandlers} from '../utils';
import type {BaseProps} from '../BaseProps';
import {themeProps} from '../utils/themeProps';
import {focusOutlineProps} from '../utils/focusOutline.stylex';

export interface SegmentedControlItemProps extends BaseProps<HTMLButtonElement> {
  ref?: React.Ref<HTMLButtonElement>;
  /**
   * Unique value for this segment. Matched against the parent's value.
   */
  value: string;
  /**
   * Accessible label for this segment (required for accessibility).
   * Used as visible text, or as aria-label when isLabelHidden is true.
   */
  label: string;
  /**
   * Whether the label is visually hidden. When true, only the icon is
   * displayed and the label is used as aria-label for accessibility.
   * @default false
   */
  isLabelHidden?: boolean;
  /**
   * Icon element displayed before the label.
   */
  icon?: ReactNode;
  /**
   * How many items this segment holds, rendered after the label. Shown at every
   * width, including when `isLabelHidden` leaves the segment icon-only.
   *
   * The number itself is hidden from assistive technology and folded into the
   * segment's accessible name instead, so pair it with `countLabel` to say what
   * it counts. Every value is rendered as given, `0` included — pass
   * `undefined` for a segment that should show no count.
   *
   * @example
   * ```
   * <SegmentedControlItem value="inbox" label="Inbox" count={12} countLabel="unread" />
   * ```
   */
  count?: number;
  /**
   * What `count` counts, used to build the accessible name: `label`, then the
   * count and this noun — "Inbox, 12 unread". Without it the name is just
   * "Inbox, 12", which leaves a screen reader user to guess. Ignored when
   * `count` is not set.
   */
  countLabel?: string;
  /**
   * Whether this individual item is disabled.
   * @default false
   */
  isDisabled?: boolean;
}

// =============================================================================
// Styles
// =============================================================================

const styles = stylex.create({
  base: {
    position: 'relative',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacingVars['--spacing-1'],
    paddingInline: spacingVars['--spacing-3'],
    backgroundColor: 'transparent',
    borderWidth: 0,
    borderStyle: 'none',
    fontFamily: 'inherit',
    fontSize: typeScaleVars['--text-label-size'],
    lineHeight: typeScaleVars['--text-label-leading'],
    fontWeight: fontWeightVars['--font-weight-medium'],
    color: colorVars['--color-text-secondary'],
    cursor: {
      default: 'pointer',
      ':is(:disabled,[aria-disabled="true"])': 'default',
    },
    whiteSpace: 'nowrap',
    transitionProperty: 'color, background-color, box-shadow',
    transitionDuration: durationVars['--duration-fast'],
    transitionTimingFunction: easeVars['--ease-standard'],
  },
  hover: {
    backgroundColor: {
      default: null,
      ':hover:where(:not(:disabled,[aria-disabled="true"]))': {
        '@media (hover: hover)': colorVars['--color-overlay-hover'],
      },
    },
  },
  selected: {
    // Forced colors (Windows High Contrast) strips the painted surface fill
    // and box shadow, which would leave the selected segment with no state
    // indication beyond font weight. Highlight/HighlightText is the platform
    // convention for a selected item (WCAG 1.4.11).
    //
    // forced-color-adjust must be `none` here: the segment is a <button>, and
    // the UA keeps native form-control colors (ButtonFace surface) for it under
    // forced colors, ignoring the authored Highlight fill — the label kept its
    // HighlightText color, giving white text on a white surface. Opting the
    // selected segment out of UA remapping makes both the Highlight surface and
    // the HighlightText label render as authored, restoring figure-ground.
    forcedColorAdjust: 'none',
    color: {
      default: colorVars['--color-text-primary'],
      '@media (forced-colors: active)': 'HighlightText',
    },
    fontWeight: fontWeightVars['--font-weight-semibold'],
    backgroundColor: {
      default: colorVars['--color-background-surface'],
      '@media (forced-colors: active)': 'Highlight',
    },
    boxShadow: shadowVars['--shadow-low'],
  },
  disabled: {
    cursor: 'default',
    color: colorVars['--color-text-disabled'],
  },
  fill: {
    flex: 1,
    minWidth: 0,
    justifyContent: 'center',
  },
  icon: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  labelText: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    minWidth: 0,
  },
  count: {
    flexShrink: 0,
    // Tabular figures keep the counts in a strip on one vertical rhythm, so a
    // segment doesn't reflow by a fraction of a character as its number ticks.
    fontVariantNumeric: 'tabular-nums',
    fontSize: typeScaleVars['--text-supporting-size'],
    fontWeight: fontWeightVars['--font-weight-medium'],
    color: colorVars['--color-text-secondary'],
  },
  countSelected: {
    // The selected segment sets forced-color-adjust: none, which children
    // inherit — so under forced colors the authored secondary gray would paint
    // on the Highlight fill and vanish. Follow the label onto HighlightText.
    color: {
      default: colorVars['--color-text-secondary'],
      '@media (forced-colors: active)': 'HighlightText',
    },
  },
  countDisabled: {
    color: colorVars['--color-text-disabled'],
  },
});

const CONCENTRIC_RADIUS =
  'max(0px, calc(var(--_segmented-control-radius) - var(--_segmented-control-padding)))';

const sizeStyles = stylex.create({
  sm: {
    height: `calc(${sizeVars['--size-element-sm']} - 4px)`,
    borderRadius: CONCENTRIC_RADIUS,
    paddingInline: spacingVars['--spacing-2'],
    fontSize: typeScaleVars['--text-supporting-size'],
  },
  md: {
    height: `calc(${sizeVars['--size-element-md']} - 4px)`,
    borderRadius: CONCENTRIC_RADIUS,
    paddingInline: spacingVars['--spacing-3'],
  },
  lg: {
    height: `calc(${sizeVars['--size-element-lg']} - 4px)`,
    borderRadius: CONCENTRIC_RADIUS,
    paddingInline: spacingVars['--spacing-3'],
  },
});

const iconSizeStyles = stylex.create({
  sm: {width: '14px', height: '14px'},
  md: {width: '16px', height: '16px'},
  lg: {width: '18px', height: '18px'},
});

/**
 * Individual segment item within an SegmentedControl.
 * Renders as a radio button with visual segment styling.
 *
 * @example
 * ```
 * <SegmentedControlItem value="grid" label="Grid" icon={<GridIcon />} />
 * ```
 */
export function SegmentedControlItem({
  ref,
  value,
  label,
  isLabelHidden = false,
  icon,
  count,
  countLabel,
  isDisabled = false,
  onClick: onClickProp,
  xstyle,
  ...rest
}: SegmentedControlItemProps) {
  const ctx = useSegmentedControlContext();

  const isSelected = ctx.value === value;
  const isItemDisabled = isDisabled || ctx.isDisabled;
  // When the whole group is disabled with a disabledMessage, keep the selected
  // segment focusable so the group's reason tooltip is keyboard-discoverable.
  // Per-item disabling (`isDisabled` on the item) always drops out of the tab
  // order. Activation stays blocked by the isItemDisabled guard in handleClick.
  const keepsSelectedFocusable =
    isSelected && (ctx.hasDisabledMessage ?? false) && !isDisabled;
  const size: SegmentedControlSize = ctx.size;
  const isFill = ctx.layout === 'fill';

  // Consumer-first: a consumer onClick can call preventDefault() to opt out of
  // selection; otherwise selection proceeds when enabled and not selected.
  const handleClick = composeEventHandlers(onClickProp, () => {
    if (!isItemDisabled && !isSelected) {
      ctx.onChange(value);
    }
  });

  const iconElement = icon ? (
    <span {...stylex.props(styles.icon, iconSizeStyles[size])}>{icon}</span>
  ) : null;

  // The count reaches assistive technology through the segment's name, not as
  // a bare trailing number: "Inbox 12" says nothing about what 12 is. Naming
  // the segment explicitly also keeps the count out of the name computed from
  // the button's contents, so it is announced once, as a quantity of something.
  const hasCount = count != null;
  const accessibleName = hasCount
    ? `${label}, ${count}${countLabel == null ? '' : ` ${countLabel}`}`
    : isLabelHidden
      ? label
      : undefined;

  const countElement = hasCount ? (
    <span
      aria-hidden="true"
      {...mergeProps(
        themeProps('segmented-control-item-count', {
          size,
          selected: isSelected ? 'selected' : null,
          disabled: isItemDisabled ? 'disabled' : null,
        }),
        stylex.props(
          styles.count,
          isSelected && styles.countSelected,
          isItemDisabled && styles.countDisabled,
        ),
      )}>
      {count}
    </span>
  ) : null;

  return (
    <button
      ref={ref}
      {...rest}
      type="button"
      role="radio"
      aria-checked={isSelected}
      aria-disabled={isItemDisabled || undefined}
      aria-label={accessibleName}
      data-value={value}
      // Disabled items (including when the whole group is disabled) are not tab
      // stops — otherwise the selected segment stays keyboard-focusable but is
      // silently dead (arrows and activation are no-ops) (navigation-13). The
      // exception is a whole-group disabledMessage, where the selected segment
      // stays focusable so the reason tooltip is keyboard-discoverable.
      tabIndex={
        (isSelected && !isItemDisabled) || keepsSelectedFocusable ? 0 : -1
      }
      onClick={handleClick}
      {...mergeProps(
        themeProps('segmented-control-item', {
          size,
          selected: isSelected ? 'selected' : null,
          disabled: isItemDisabled ? 'disabled' : null,
        }),
        focusOutlineProps.focusVisible(
          styles.base,
          sizeStyles[size],
          isFill && styles.fill,
          isSelected && styles.selected,
          !isSelected && !isItemDisabled && styles.hover,
          isItemDisabled && styles.disabled,
          xstyle,
        ),
      )}>
      {iconElement}
      {!isLabelHidden && (
        <span {...stylex.props(styles.labelText)}>{label}</span>
      )}
      {countElement}
    </button>
  );
}

SegmentedControlItem.displayName = 'SegmentedControlItem';
