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
export {Stack, HStack, VStack, StackItem} from '../Stack';
export type {
  StackProps,
  StackAlignment,
  StackAlignment,
  HStackProps,
  VStackProps,
  StackItemProps,
} from '../Stack';

// Container components (re-exported from their own modules)
export {Card} from '../Card';
export type {CardProps} from '../Card';

export {Section} from '../Section';
export type {SectionProps, SectionVariant} from '../Section';

export type {SizeValue} from '../utils/types';

// Layout structure components
export {Layout} from './Layout';
export type {LayoutProps, LayoutHeight} from './Layout';

export {LayoutHeader} from './LayoutHeader';
export type {LayoutHeaderProps} from './LayoutHeader';

export {LayoutFooter} from './LayoutFooter';
export type {LayoutFooterProps} from './LayoutFooter';

export {LayoutContent} from './LayoutContent';
export type {LayoutContentProps} from './LayoutContent';

export {LayoutPanel} from './LayoutPanel';
export type {LayoutPanelProps} from './LayoutPanel';

export {LayoutAreaContext} from './LayoutAreaContext';
export type {LayoutArea} from './LayoutAreaContext';

export {LayoutDividerContext} from './LayoutDividerContext';
export type {LayoutDividerContextValue} from './LayoutDividerContext';


// <compat-aliases:start> — generated, do not edit by hand
// Legacy XDS-prefixed compatibility aliases (XDS-prefix migration P2380608025).
// Bare names above are canonical + module-augmentation targets.
// These prefixed re-exports reference the SAME values/types and remain
// augmentable (consumer `declare module` augmentations of XDS* flow through).
// Regenerate: node scripts/generate-compat-aliases.mjs
export {
  Card as XDSCard,
  EDGE_COMP_ATTR as XDSEDGE_COMP_ATTR,
  HStack as XDSHStack,
  Layout as XDSLayout,
  LayoutAreaContext as XDSLayoutAreaContext,
  LayoutContent as XDSLayoutContent,
  LayoutDividerContext as XDSLayoutDividerContext,
  LayoutFooter as XDSLayoutFooter,
  LayoutHeader as XDSLayoutHeader,
  LayoutPanel as XDSLayoutPanel,
  Section as XDSSection,
  Stack as XDSStack,
  StackItem as XDSStackItem,
  VStack as XDSVStack,
} from '.';
export type {
  CardProps as XDSCardProps,
  ContainerComponent as XDSContainerComponent,
  ContainerOptions as XDSContainerOptions,
  HStackProps as XDSHStackProps,
  LayoutArea as XDSLayoutArea,
  LayoutContentProps as XDSLayoutContentProps,
  LayoutDividerContextValue as XDSLayoutDividerContextValue,
  LayoutFooterProps as XDSLayoutFooterProps,
  LayoutHeaderProps as XDSLayoutHeaderProps,
  LayoutHeight as XDSLayoutHeight,
  LayoutPanelProps as XDSLayoutPanelProps,
  LayoutProps as XDSLayoutProps,
  SectionProps as XDSSectionProps,
  SectionVariant as XDSSectionVariant,
  SizeValue as XDSSizeValue,
  SpacingStep as XDSSpacingStep,
  SpacingToken as XDSSpacingToken,
  StackAlignment as XDSStackAlignment,
  StackCrossAlignment as XDSStackCrossAlignment,
  StackDirection as XDSStackDirection,
  StackItemCrossAlignSelf as XDSStackItemCrossAlignSelf,
  StackItemOptions as XDSStackItemOptions,
  StackItemProps as XDSStackItemProps,
  StackItemSize as XDSStackItemSize,
  StackMainAlignment as XDSStackMainAlignment,
  StackOptions as XDSStackOptions,
  StackProps as XDSStackProps,
  StackWrap as XDSStackWrap,
  VStackProps as XDSVStackProps,
} from '.';
// <compat-aliases:end>
