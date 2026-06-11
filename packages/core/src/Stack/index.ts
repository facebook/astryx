// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file index.ts
 * @input Imports stack components
 * @output Exports XDSStack, XDSHStack, XDSVStack, XDSStackItem components
 * @position Entry point for Layout/Stack
 *
 * SYNC: When modified, update /packages/core/src/Stack/Stack.doc.mjs
 */

// Unified stack component
export {XDSStack} from './XDSStack';
export type {
  XDSStackProps,
  XDSStackAlignment,
  StackAlignment,
} from './XDSStack';

// Convenience wrappers (re-exported from their own directories)
export {XDSHStack, type XDSHStackProps} from '../HStack';

export {XDSVStack, type XDSVStackProps} from '../VStack';

export {XDSStackItem} from './XDSStackItem';
export type {XDSStackItemProps} from './XDSStackItem';
