// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file componentIconSlot.tsx
 * @input Owner-selected slot/source, a finite effective state and an optional owner default size
 * @output An Icon with private role/state transport; true slots remain stateless
 * @position Private component implementation seam, not exported by the public Icon barrel
 */
import type {ComponentIconSlotName, ComponentIconStateName} from './index';
import {Icon, type IconProps} from './Icon';
import {ComponentIconContext} from './ComponentIconContext';
import type {IconSize} from './iconCapabilities';

/**
 * `defaultSize` is the owner's structural default for this render (for example
 * a Button-family control-size mapping). It only replaces the declared role
 * default; an explicit Icon size and a theme role-size override still win.
 */
export function renderComponentIconSlot<Slot extends ComponentIconSlotName>(
  slot: Slot,
  icon: IconProps['icon'],
  props?: Omit<IconProps, 'icon'> & {
    [key: `data-${string}`]: string | number | boolean | undefined;
  },
  state?: ComponentIconStateName<Slot>,
  defaultSize?: IconSize,
) {
  return (
    <ComponentIconContext value={{slot, state, defaultSize}}>
      <Icon {...props} icon={icon} />
    </ComponentIconContext>
  );
}
