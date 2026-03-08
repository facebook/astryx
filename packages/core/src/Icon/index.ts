/**
 * @file index.ts
 * @input Imports XDSIcon component/types, icon registry, and global registration
 * @output Exports XDSIcon, icon registry, registerIcons, getIcon
 * @position Component entry point; re-exported by /packages/core/src/index.ts
 *
 * SYNC: When modified, update this header and /packages/core/src/Icon/Icon.doc.mjs
 */

export {XDSIcon} from './XDSIcon';
export type {
  XDSIconProps,
  XDSIconColor,
  XDSIconSize,
  XDSIconType,
} from './XDSIcon';

// Global registry (RSC-compatible, no 'use client')
export {registerIcons, getIcon, resetIcons} from './globalIconRegistry';
export type {XDSIconName, XDSIconRegistry} from './globalIconRegistry';

// Context registry (client-only)
export {IconRegistryContext, useXDSIcon} from './IconRegistry';
