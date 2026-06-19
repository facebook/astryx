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


// <compat-aliases:start> — generated, do not edit by hand
// Legacy XDS-prefixed compatibility aliases (XDS-prefix migration P2380608025).
// Bare names above are canonical + module-augmentation targets.
// These prefixed re-exports reference the SAME values/types and remain
// augmentable (consumer `declare module` augmentations of XDS* flow through).
// Regenerate: node scripts/generate-compat-aliases.mjs
export {
  Icon as XDSIcon,
} from '.';
export type {
  IconColor as XDSIconColor,
  IconName as XDSIconName,
  IconProps as XDSIconProps,
  IconRegistry as XDSIconRegistry,
  IconSize as XDSIconSize,
  IconType as XDSIconType,
} from '.';
// <compat-aliases:end>
