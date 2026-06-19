// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file index.ts
 * @input Timestamp component
 * @output Exports all Timestamp module public API
 * @position Entry point for Timestamp module
 *
 * SYNC: When adding new Timestamp files, update exports here
 */

export {Timestamp} from './Timestamp';
export type {TimestampProps, TimestampFormat} from './Timestamp';


// <compat-aliases:start> — generated, do not edit by hand
// Legacy XDS-prefixed compatibility aliases (XDS-prefix migration P2380608025).
// Bare names above are canonical + module-augmentation targets.
// These prefixed re-exports reference the SAME values/types and remain
// augmentable (consumer `declare module` augmentations of XDS* flow through).
// Regenerate: node scripts/generate-compat-aliases.mjs
export {
  Timestamp as XDSTimestamp,
} from '.';
export type {
  TimestampFormat as XDSTimestampFormat,
  TimestampProps as XDSTimestampProps,
} from '.';
// <compat-aliases:end>
