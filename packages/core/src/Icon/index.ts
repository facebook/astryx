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
