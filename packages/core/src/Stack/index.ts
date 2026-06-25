// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file index.ts
 * @input Imports stack components
 * @output Exports Stack, HStack, VStack, StackItem components
 * @position Entry point for Layout/Stack
 *
 * SYNC: When modified, update /packages/core/src/Stack/Stack.doc.mjs
 */

// Unified stack component
export {Stack} from './Stack';
export type {
  StackProps,
  StackAlignment,
} from './Stack';

// Convenience wrappers (re-exported from their own directories)
export {HStack, type HStackProps} from '../HStack';

export {VStack, type VStackProps} from '../VStack';

export {StackItem} from './StackItem';
export type {StackItemProps} from './StackItem';
