/**
 * @file index.ts
 * @input Imports layout components
 * @output Exports XDSLayout system components and types
 * @position Entry point for XDSLayout components
 *
 * SYNC: When modified, update /packages/core/src/Layout/XDSLayout/README.md
 */

export {XDSLayout} from './XDSLayout';
export type {XDSLayoutProps, XDSLayoutHeight} from './XDSLayout';

export {XDSLayoutHeader} from './XDSLayoutHeader';
export type {XDSLayoutHeaderProps} from './XDSLayoutHeader';

export {XDSLayoutFooter} from './XDSLayoutFooter';
export type {XDSLayoutFooterProps} from './XDSLayoutFooter';

export {XDSLayoutContent} from './XDSLayoutContent';
export type {XDSLayoutContentProps} from './XDSLayoutContent';

export {XDSLayoutPanel} from './XDSLayoutPanel';
export type {XDSLayoutPanelProps} from './XDSLayoutPanel';

export {XDSLayoutAreaContext} from './XDSLayoutAreaContext';
export type {LayoutArea} from './XDSLayoutAreaContext';

export {XDSLayoutSlotsContext} from './XDSLayoutSlotsContext';
export type {LayoutSlots} from './XDSLayoutSlotsContext';
