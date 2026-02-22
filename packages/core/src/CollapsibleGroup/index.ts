/**
 * @file index.ts
 * @input Imports XDSCollapsibleGroup component and useCollapsible hook
 * @output Exports XDSCollapsibleGroup component, useCollapsible hook, and types
 * @position Entry point for @xds/core/CollapsibleGroup module
 *
 * SYNC: When modified, update /packages/core/src/CollapsibleGroup/README.md
 */

export {XDSCollapsibleGroup} from './XDSCollapsibleGroup';
export type {XDSCollapsibleGroupProps} from './XDSCollapsibleGroup';

export {useCollapsible} from './useCollapsible';
export type {
  CollapsibleConfig,
  UseCollapsibleOptions,
  UseCollapsibleReturn,
} from './useCollapsible';
