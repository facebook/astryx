// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file index.ts
 * @input Imports Icon component/types, icon registry, and global registration
 * @output Exports Icon, icon registry helpers, registerIcons, getIconRegistry, getIcon
 * @position Component entry point; re-exported by /packages/core/src/index.ts
 *
 * SYNC: When modified, update this header and /packages/core/src/Icon/Icon.doc.mjs
 */

export {Icon, renderIconSlot} from './Icon';
export type {
  IconProps,
  IconColor,
  IconSize,
  IconType,
} from './Icon';

// Global registry (RSC-compatible, no 'use client')
export {
  registerIcons,
  getIconRegistry,
  getIcon,
  resetIcons,
} from './globalIconRegistry';
export type {IconName, IconRegistry} from './globalIconRegistry';
