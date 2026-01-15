/**
 * @file index.ts
 * @input Imports stack utilities and components
 * @output Exports stack utilities and XDSHStack/XDSVStack/XDSStackItem components
 * @position Entry point for Layout/Stack
 *
 * SYNC: When modified, update /packages/core/src/Layout/README.md
 */

// Utilities
export { stack } from './stack.stylex';
export type {
  StackOptions,
  StackDirection,
  StackCrossAlignment,
  StackWrap,
  SpacingScale,
} from './stack.stylex';

export { stackItem } from './stackItem.stylex';
export type {
  StackItemOptions,
  StackItemCrossAlignSelf,
  StackItemSize,
} from './stackItem.stylex';

// Components
export { XDSHStack } from './XDSHStack';
export type { XDSHStackProps } from './XDSHStack';

export { XDSVStack } from './XDSVStack';
export type { XDSVStackProps } from './XDSVStack';

export { XDSStackItem } from './XDSStackItem';
export type { XDSStackItemProps } from './XDSStackItem';
