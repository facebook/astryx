// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file index.ts
 * @input Imports XDSIcon component/types, icon registry, and global registration
 * @output Exports XDSIcon, icon registry helpers, registerIcons, getIconRegistry, getIcon
 * @position Component entry point; re-exported by /packages/core/src/index.ts
 *
 * SYNC: When modified, update this header and /packages/core/src/Icon/Icon.doc.mjs
 */

export {XDSIcon, renderIconSlot} from './XDSIcon';
export type {
  XDSIconProps,
  XDSIconColor,
  XDSIconSize,
  XDSIconType,
} from './XDSIcon';

// Global registry (RSC-compatible, no 'use client')
export {
  registerIcons,
  getIconRegistry,
  getIcon,
  resetIcons,
} from './globalIconRegistry';
export type {XDSIconName, XDSIconRegistry} from './globalIconRegistry';


// <compat-aliases:start> — generated, do not edit by hand
// Unprefixed compatibility aliases (XDS-prefix migration P2380608025).
// Prefixed names above remain canonical + module-augmentation targets.
// These bare re-exports reference the SAME values/types.
// Regenerate: node scripts/generate-compat-aliases.mjs
export {
  XDSIcon as Icon,
} from '.';
export type {
  XDSIconColor as IconColor,
  XDSIconName as IconName,
  XDSIconProps as IconProps,
  XDSIconRegistry as IconRegistry,
  XDSIconSize as IconSize,
  XDSIconType as IconType,
} from '.';
// <compat-aliases:end>
