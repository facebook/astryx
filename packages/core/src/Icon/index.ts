// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file index.ts
 * @input Imports Icon component/types, icon registry, and global registration
 * @output Exports Icon, shared icon APIs, and augmentable component icon slots
 * @position Public Icon subpath; owns ComponentIconSlotMap for module augmentation
 *
 * SYNC: When modified, update this header and /packages/core/src/Icon/Icon.doc.mjs
 */

import type {IconName} from './globalIconRegistry';

/**
 * Component-owned icon roles. External packages augment this interface from
 * the public `@astryxdesign/core/Icon` module.
 */
export interface ComponentIconSlotMap {
  'file-input-upload': true;
  'chat-send-button-send': true;
}

export type ComponentIconSlotName = keyof ComponentIconSlotMap & string;
export type ComponentIconMap = Partial<
  Record<ComponentIconSlotName, IconName | null>
>;

export {Icon, renderIconSlot} from './Icon';
export {useIcon, useComponentIcon} from './useIcon';
export type {IconProps, IconColor, IconSize, IconType} from './Icon';

// Global registry (RSC-compatible, no 'use client')
export {
  registerIcons,
  getIconRegistry,
  getIcon,
  getExtendedIcon,
  getComponentIcon,
  getComponentIconName,
  resetIcons,
} from './globalIconRegistry';
export type {
  IconName,
  ExtendedIconName,
  NamespacedIconName,
  IconRegistry,
  IconRegistrySource,
} from './globalIconRegistry';
