/**
 * @file index.ts
 * @input Imports XDSCollapsibleGroup component and useXDSCollapsible hook
 * @output Exports XDSCollapsibleGroup component, useXDSCollapsible hook, and types
 * @position Entry point for @xds/core/CollapsibleGroup module
 *
 * SYNC: When modified, update /packages/core/src/CollapsibleGroup/README.md
 */

export {XDSCollapsibleGroup} from './XDSCollapsibleGroup';
export type {XDSCollapsibleGroupProps} from './XDSCollapsibleGroup';

export {useXDSCollapsible} from './useXDSCollapsible';
export type {
  CollapsibleConfig,
  UseXDSCollapsibleOptions,
  UseXDSCollapsibleReturn,
} from './useXDSCollapsible';
