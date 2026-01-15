/**
 * @file index.ts
 * @input Imports layout utilities and components from subfolders
 * @output Exports XDS layout system
 * @position Entry point for @xds/core/Layout
 *
 * SYNC: When modified, update /packages/core/src/Layout/README.md
 */

// Stack utilities and components
export {
  stack,
  stackItem,
  XDSHStack,
  XDSVStack,
  XDSStackItem,
} from './Stack';
export type {
  StackOptions,
  StackDirection,
  StackCrossAlignment,
  StackWrap,
  SpacingScale,
  StackItemOptions,
  StackItemCrossAlignSelf,
  StackItemSize,
  XDSHStackProps,
  XDSVStackProps,
  XDSStackItemProps,
} from './Stack';

// Container components
export {
  XDSLayoutContainer,
  XDSCard,
  XDSSection,
} from './Container';
export type {
  XDSLayoutContainerProps,
  SpacingToken,
  XDSCardProps,
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
