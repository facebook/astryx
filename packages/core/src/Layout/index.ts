// Copyright (c) Meta Platforms, Inc. and affiliates.

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
export type {
  ContainerComponent,
  ContainerOptions,
  SpacingToken,
} from './container.stylex';

// Edge compensation utility
export {edgeCompSlot, EDGE_COMP_ATTR} from './edgeCompensation.stylex';

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
  XDSStackAlignment,
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

export {XDSLayoutDividerContext} from './XDSLayoutDividerContext';
export type {LayoutDividerContextValue} from './XDSLayoutDividerContext';


// <compat-aliases:start> — generated, do not edit by hand
// Unprefixed compatibility aliases (XDS-prefix migration P2380608025).
// Prefixed names above remain canonical + module-augmentation targets.
// These bare re-exports reference the SAME values/types.
// Regenerate: node scripts/generate-compat-aliases.mjs
export {
  XDSCard as Card,
  XDSHStack as HStack,
  XDSLayout as Layout,
  XDSLayoutAreaContext as LayoutAreaContext,
  XDSLayoutContent as LayoutContent,
  XDSLayoutDividerContext as LayoutDividerContext,
  XDSLayoutFooter as LayoutFooter,
  XDSLayoutHeader as LayoutHeader,
  XDSLayoutPanel as LayoutPanel,
  XDSSection as Section,
  XDSStack as Stack,
  XDSStackItem as StackItem,
  XDSVStack as VStack,
} from '.';
export type {
  XDSCardProps as CardProps,
  XDSHStackProps as HStackProps,
  XDSLayoutContentProps as LayoutContentProps,
  XDSLayoutFooterProps as LayoutFooterProps,
  XDSLayoutHeaderProps as LayoutHeaderProps,
  XDSLayoutHeight as LayoutHeight,
  XDSLayoutPanelProps as LayoutPanelProps,
  XDSLayoutProps as LayoutProps,
  XDSSectionProps as SectionProps,
  XDSSectionVariant as SectionVariant,
  XDSStackItemProps as StackItemProps,
  XDSStackProps as StackProps,
  XDSVStackProps as VStackProps,
} from '.';
// <compat-aliases:end>
