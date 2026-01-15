/**
 * @file index.ts
 * @input Imports layout components and utilities
 * @output Exports XDS layout system
 * @position Entry point for @xds/core/Layout
 *
 * SYNC: When modified, update /packages/core/src/Layout/README.md
 */

export { stack } from './stack.stylex';
export type {
  StackOptions,
  StackDirection,
  StackCrossAlignment,
  StackWrap,
} from './stack.stylex';

export { stackItem } from './stackItem.stylex';
export type {
  StackItemOptions,
  StackItemCrossAlignSelf,
  StackItemSize,
} from './stackItem.stylex';
