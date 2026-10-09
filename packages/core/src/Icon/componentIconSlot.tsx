// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file componentIconSlot.tsx
 * @input Owner-selected slot/source and a finite effective state
 * @output An Icon with private role/state transport; true slots remain stateless
 * @position Private component implementation seam, not exported by the public Icon barrel
 */
import type {ComponentIconSlotName, ComponentIconStateName} from './index';
import {Icon, type IconProps} from './Icon';
import {ComponentIconContext} from './ComponentIconContext';

export function renderComponentIconSlot<Slot extends ComponentIconSlotName>(
  slot: Slot,
  icon: IconProps['icon'],
  props?: Omit<IconProps, 'icon'> & {
    [key: `data-${string}`]: string | number | boolean | undefined;
  },
  state?: ComponentIconStateName<Slot>,
) {
  return (
    <ComponentIconContext value={{slot, state}}>
      <Icon {...props} icon={icon} />
    </ComponentIconContext>
  );
}
