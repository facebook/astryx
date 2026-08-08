// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file SelectionIndicator.tsx
 * @input Selection slot, component default icon, current state
 * @output Exports SelectionIndicator — renders a slot as an icon or indicator
 * @position The seam components use for selection marks a theme can swap
 */

import type {ReactNode} from 'react';
import type {StyleXStyles} from '@stylexjs/stylex';
import {Icon, type IconColor, type IconSize} from '../Icon/Icon';
import type {
  ComponentIndicatorSlotName,
  IconName,
} from '../Icon/globalIconRegistry';
import {useThemeName} from '../theme/useTheme';
import {resolveSelectionIndicator} from './selectionRegistry';
import type {IndicatorSize, IndicatorState} from './types';

/*
 * A dispatcher, not a DOM component: this renders EITHER an Icon (an <svg>) or
 * an indicator (a <span>) depending on the theme's mapping, so there is no one
 * element to forward a ref or arbitrary HTML attributes to. Consumers style the
 * resolved element through its own theme target (`astryx-icon`,
 * `astryx-radio`, ...) or the shared `xstyle` below.
 */
/* eslint-disable @astryx/require-base-props, @astryx/require-ref-prop */
export interface SelectionIndicatorProps {
  /** The component icon slot this mark represents. */
  slot: ComponentIndicatorSlotName;
  /**
   * The component's own default: a global icon name, or `null` when the
   * component shows nothing unless a theme maps the slot.
   */
  fallback: IconName | null;
  /** Current selection state of the owning row/option. */
  state: IndicatorState;
  /**
   * Whether the owning row is disabled. Forwarded to the indicator form;
   * ignored by the icon form.
   * @default false
   */
  isDisabled?: boolean;
  /**
   * Size used when the slot resolves to an icon.
   * @default 'md'
   */
  iconSize?: IconSize;
  /** Color used when the slot resolves to an icon. */
  iconColor?: IconColor;
  /**
   * Size used when the slot resolves to an indicator.
   * @default 'md'
   */
  indicatorSize?: IndicatorSize;
  /** StyleX styles applied to whichever form renders. */
  xstyle?: StyleXStyles;
}

/**
 * Render a component's selection mark, honoring the theme's mapping for the
 * slot.
 *
 * The two forms differ in when they draw, and that difference is the point:
 *
 * | Slot maps to | Unselected | Selected |
 * | --- | --- | --- |
 * | an icon name (default) | nothing | the glyph |
 * | `{indicator: 'radio'}` | empty circle | filled circle |
 * | `null` | nothing | nothing |
 *
 * So a component must render this **unconditionally** and pass `state` —
 * rather than rendering it only while selected — or a themed indicator can
 * never draw its unselected form.
 *
 * @example
 * ```tsx
 * <SelectionIndicator
 *   slot="selector-selected-option"
 *   fallback="check"
 *   state={isSelected ? 'checked' : 'unchecked'}
 *   iconSize="sm"
 *   iconColor="accent"
 *   indicatorSize="sm"
 * />
 * ```
 */
export function SelectionIndicator({
  slot,
  fallback,
  state,
  isDisabled = false,
  iconSize,
  iconColor,
  indicatorSize,
  xstyle,
}: SelectionIndicatorProps): ReactNode {
  const resolved = resolveSelectionIndicator(slot, fallback, useThemeName());

  if (resolved.type === 'none') {
    return null;
  }

  if (resolved.type === 'indicator') {
    const {Indicator} = resolved;
    return (
      <Indicator
        state={state}
        size={indicatorSize}
        isDisabled={isDisabled}
        xstyle={xstyle}
      />
    );
  }

  // A static glyph marks the selected state only — an unselected option keeps
  // the component's default "no mark" appearance.
  if (state === 'unchecked') {
    return null;
  }

  return (
    <Icon
      icon={resolved.name}
      size={iconSize}
      color={iconColor}
      xstyle={xstyle}
    />
  );
}

SelectionIndicator.displayName = 'SelectionIndicator';
/* eslint-enable @astryx/require-base-props, @astryx/require-ref-prop */
