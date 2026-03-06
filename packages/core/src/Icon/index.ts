/**
 * @file index.ts
 * @input Imports XDSIcon component/types and IconRegistry types
 * @output Exports XDSIcon, its prop types, icon registry context, and semantic name types
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
export type {XDSIconName, XDSIconRegistry} from './IconRegistry';
export {IconRegistryContext} from './IconRegistry';
