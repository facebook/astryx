'use client';

/**
 * @file index.ts
 * @input Imports XDSCollapsible, XDSCollapsibleGroup, and useXDSCollapsible
 * @output Exports components, hook, and types
 * @position Entry point for @xds/core/Collapsible module
 *
 * SYNC: When modified, update /packages/core/src/Collapsible/Collapsible.doc.mjs
 */

export {XDSCollapsible} from './XDSCollapsible';
export type {XDSCollapsibleProps} from './XDSCollapsible';

export {XDSCollapsibleGroup} from './XDSCollapsibleGroup';
export type {XDSCollapsibleGroupProps} from './XDSCollapsibleGroup';

export {useXDSCollapsible} from './useXDSCollapsible';
export type {
  CollapsibleConfig,
  UseXDSCollapsibleOptions,
  UseXDSCollapsibleReturn,
} from './useXDSCollapsible';
