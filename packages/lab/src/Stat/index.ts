// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file index.ts
 * @input Imports from Stat component
 * @output Exports Stat component and related types
 * @position Entry point for Stat; re-exported by /packages/lab/src/index.ts
 */

export {Stat} from './Stat';
export type {
  StatProps,
  StatDelta,
  StatDeltaDirection,
  StatDeltaSentiment,
  StatSize,
} from './Stat';
