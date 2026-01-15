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
