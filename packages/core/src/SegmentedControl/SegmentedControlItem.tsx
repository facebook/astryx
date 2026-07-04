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
 * - /packages/cli/templates/blocks/components/SegmentedControl/ (showcase blocks)
 */

import React, {useCallback, type ReactNode} from 'react';
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
import {mergeProps} from '../utils';
import type {BaseProps} from '../BaseProps';
import {themeProps} from '../utils/themeProps';

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
    cursor: 'pointer',
    transitionProperty: 'color, background-color, box-shadow',
    transitionDuration: durationVars['--duration-fast'],
    transitionTimingFunction: easeVars['--ease-standard'],
    outline: {
      default: null,
      ':focus-visible': `2px solid ${colorVars['--color-accent']}`,
    },
    outlineOffset: {
      default: '0',
      ':focus-visible': '2px',
    },
  },
  hover: {
    backgroundColor: {
      default: null,
      ':hover': {
        '@media (hover: hover)': colorVars['--color-overlay-hover'],
      },
    },
  },
  selected: {
    color: colorVars['--color-text-primary'],
    fontWeight: fontWeightVars['--font-weight-semibold'],
    backgroundColor: colorVars['--color-background-surface'],
    boxShadow: shadowVars['--shadow-low'],
  },
  disabled: {
    cursor: 'default',
    color: colorVars['--color-text-disabled'],
  },
  fill: {
    flex: 1,
    justifyContent: 'center',
  },
  icon: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
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
  isDisabled = false,
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

  const handleClick = useCallback(() => {
    if (!isItemDisabled && !isSelected) {
      ctx.onChange(value);
    }
  }, [ctx, value, isItemDisabled, isSelected]);

  const iconElement = icon ? (
    <span {...stylex.props(styles.icon, iconSizeStyles[size])}>{icon}</span>
  ) : null;

  return (
    <button
      ref={ref}
      type="button"
      role="radio"
      aria-checked={isSelected}
      aria-disabled={isItemDisabled || undefined}
      aria-label={isLabelHidden ? label : undefined}
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
        stylex.props(
          styles.base,
          sizeStyles[size],
          isFill && styles.fill,
          isSelected && styles.selected,
          !isSelected && !isItemDisabled && styles.hover,
          isItemDisabled && styles.disabled,
        ),
      )}>
      {iconElement}
      {!isLabelHidden && <span>{label}</span>}
    </button>
  );
}

SegmentedControlItem.displayName = 'SegmentedControlItem';
