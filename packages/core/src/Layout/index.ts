/**
 * @file index.ts
 * @input Imports layout utilities and components from subfolders
 * @output Exports XDS layout system
 * @position Entry point for @xds/core/Layout
 *
 * SYNC: When modified, update /packages/core/src/Layout/README.md
 */

// Utilities
export {container} from './Container/container.stylex';
export type {
  ContainerOptions,
  SpacingToken,
} from './Container/container.stylex';

export {stack} from './Stack/stack.stylex';
export type {
  StackOptions,
  StackDirection,
  StackCrossAlignment,
  StackMainAlignment,
  StackWrap,
  SpacingScale,
} from './Stack/stack.stylex';

export {stackItem} from './Stack/stackItem.stylex';
export type {
  StackItemOptions,
  StackItemCrossAlignSelf,
  StackItemSize,
} from './Stack/stackItem.stylex';

// Stack components
export {XDSHStack, XDSVStack, XDSStackItem} from './Stack';
export type {XDSHStackProps, XDSVStackProps, XDSStackItemProps} from './Stack';

// Container components
export {XDSCard, XDSSection} from './Container';
export type {
  XDSCardProps,
  SizeValue,
  XDSSectionProps,
  XDSSectionVariant,
} from './Container';

// Layout structure components
export {
  XDSLayout,
  XDSLayoutHeader,
  XDSLayoutFooter,
  XDSLayoutContent,
  XDSLayoutPanel,
  XDSLayoutAreaContext,
} from './XDSLayout';
export type {
  XDSLayoutProps,
  XDSLayoutHeight,
  XDSLayoutHeaderProps,
  XDSLayoutFooterProps,
  XDSLayoutContentProps,
  XDSLayoutPanelProps,
  LayoutArea,
} from './XDSLayout';
