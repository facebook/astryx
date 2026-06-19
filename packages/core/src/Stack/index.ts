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


// <compat-aliases:start> — generated, do not edit by hand
// Legacy XDS-prefixed compatibility aliases (XDS-prefix migration P2380608025).
// Bare names above are canonical + module-augmentation targets.
// These prefixed re-exports reference the SAME values/types and remain
// augmentable (consumer `declare module` augmentations of XDS* flow through).
// Regenerate: node scripts/generate-compat-aliases.mjs
export {
  HStack as XDSHStack,
  Stack as XDSStack,
  StackItem as XDSStackItem,
  VStack as XDSVStack,
} from '.';
export type {
  HStackProps as XDSHStackProps,
  StackAlignment as XDSStackAlignment,
  StackItemProps as XDSStackItemProps,
  StackProps as XDSStackProps,
  VStackProps as XDSVStackProps,
} from '.';
// <compat-aliases:end>
