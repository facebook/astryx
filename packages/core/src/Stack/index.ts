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


// <compat-aliases:start> — generated, do not edit by hand
// Unprefixed compatibility aliases (XDS-prefix migration P2380608025).
// Prefixed names above remain canonical + module-augmentation targets.
// These bare re-exports reference the SAME values/types.
// Regenerate: node scripts/generate-compat-aliases.mjs
export {
  XDSHStack as HStack,
  XDSStack as Stack,
  XDSStackItem as StackItem,
  XDSVStack as VStack,
} from '.';
export type {
  XDSHStackProps as HStackProps,
  XDSStackItemProps as StackItemProps,
  XDSStackProps as StackProps,
  XDSVStackProps as VStackProps,
} from '.';
// <compat-aliases:end>
