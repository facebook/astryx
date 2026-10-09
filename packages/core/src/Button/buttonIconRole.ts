// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file buttonIconRole.ts
 * @input The Button family's owned icon position and the conditions a member reports
 * @output The `button-leading` role declaration and one effective state
 * @position Private Button-family owner metadata; consumed by Button.tsx, not exported by any barrel
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/Icon/index.ts (the `button-leading` ComponentIconSlotMap entry)
 * - /packages/core/src/Button/Button.tsx (condition reporting)
 * - /packages/core/src/Button/buttonIconRole.test.tsx
 */

import {
  declareComponentIconRole,
  getComponentIconState,
} from '../Icon/componentIconRoles';
import type {ComponentIconStateName} from '../Icon/index';

export const BUTTON_LEADING_ICON_SLOT = 'button-leading';

/**
 * Button's `icon` position. IconButton and ToggleButton render their icon in
 * this same position, so they share the role rather than inventing new ones.
 *
 * `defaultSize` is the family's structural default for its `md` control.
 * Button refines it per render from its control size (`sm`/`md` → `sm`,
 * `lg` → `md`; family:buttons FR7).
 *
 * Precedence, highest first:
 * - `disabled`: explicit or group non-operability (not loading-induced);
 * - `pressed`: the retained pressed value a member renders as `aria-pressed`;
 * - `loading`: transient pending feedback.
 */
export const buttonLeadingIconRole = declareComponentIconRole({
  slot: BUTTON_LEADING_ICON_SLOT,
  defaultSize: 'sm',
  statePrecedence: ['disabled', 'pressed', 'loading'],
});

export type ButtonLeadingIconState = ComponentIconStateName<'button-leading'>;

/** Zero or one effective state; the theme maps it to appearance only. */
export function getButtonLeadingIconState(conditions: {
  readonly disabled: boolean;
  readonly pressed: boolean;
  readonly loading: boolean;
}): ButtonLeadingIconState | undefined {
  return getComponentIconState(BUTTON_LEADING_ICON_SLOT, conditions);
}
