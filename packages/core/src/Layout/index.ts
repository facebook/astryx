'use client';

/**
 * @file index.ts
 * @input Imports layout utilities and components
 * @output Exports XDS layout system
 * @position Entry point for @xds/core/Layout
 *
 * SYNC: When modified, update /packages/core/src/Layout/Layout.doc.mjs
 */

// Container utility
export {container} from './container.stylex';
export type {ContainerOptions, SpacingToken} from './container.stylex';

// Edge compensation utility
export {edgeSignals, edgeCompensation} from './edgeCompensation.stylex';

// Stack utilities (re-exported from Stack module)
export {stack} from '../Stack/stack.stylex';
export type {
  StackOptions,
  StackDirection,
  StackCrossAlignment,
  StackMainAlignment,
  StackWrap,
  SpacingStep,
} from '../Stack/stack.stylex';

export {stackItem} from '../Stack/stackItem.stylex';
export type {
  StackItemOptions,
  StackItemCrossAlignSelf,
  StackItemSize,
} from '../Stack/stackItem.stylex';

// Stack components (re-exported from Stack module)
export {XDSStack, XDSHStack, XDSVStack, XDSStackItem} from '../Stack';
export type {
  XDSStackProps,
  StackAlignment,
  XDSHStackProps,
  XDSVStackProps,
  XDSStackItemProps,
} from '../Stack';

// Container components (re-exported from their own modules)
export {XDSCard} from '../Card';
export type {XDSCardProps} from '../Card';

export {XDSSection} from '../Section';
export type {XDSSectionProps, XDSSectionVariant} from '../Section';

export type {SizeValue} from '../utils/types';

// Layout structure components
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
